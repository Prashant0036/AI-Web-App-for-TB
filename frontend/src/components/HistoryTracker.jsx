import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  Activity, Calendar, ChevronRight, AlertCircle, FileText, Download,
  TrendingDown, TrendingUp, Minus, Search, Clock, Trash2, LayoutGrid, List, X, Share2, Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jsPDF } from 'jspdf';

import { useTheme } from '../context/ThemeContext';

const HistoryTracker = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const BACKEND_URL = "http://127.0.0.1:8000/history";

  const handleShare = (reportId) => {
    const shareUrl = `${window.location.origin}/shared/${reportId}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Shareable link copied to clipboard!\n\n" + shareUrl);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(BACKEND_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tb_token')}`,
        },
      });
      if (!response.ok) throw new Error("Failed to load history.");
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score <= 33) return '#10b981'; // Green
    if (score <= 66) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const formatDateTime = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  // Prepare data for the chart
  const chartData = [...history].reverse().map(item => ({
    date: formatDateTime(item.timestamp),
    score: item.result?.score || 0,
    timestamp: new Date(item.timestamp).getTime()
  }));

  // Calculate trends
  const calculateTrend = () => {
    if (history.length < 2) return null;
    const latest = history[0].result?.score || 0;
    const previous = history[1].result?.score || 0;
    const diff = latest - previous;

    if (diff < 0) return { icon: <TrendingDown className="text-emerald-500" />, text: "Risk decreased", color: 'text-emerald-600' };
    if (diff > 0) return { icon: <TrendingUp className="text-rose-500" />, text: "Risk increased", color: 'text-rose-600' };
    return { icon: <Minus className="text-slate-400" />, text: "Risk stable", color: 'text-slate-600' };
  };

  const trend = calculateTrend();

  // ── PDF Generator (Reused from App.jsx logic) ─────────────────────────────────
  const generatePDFForReport = (report) => {
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const score = report.result?.score || 0;
      const formData = report; // In our history, root level has form fields too
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = 0;

      const bannerColor = score <= 33 ? [16, 185, 129] : score <= 66 ? [245, 158, 11] : [239, 68, 68];
      doc.setFillColor(...bannerColor);
      doc.rect(0, 0, pageW, 32, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('TBRisk AI — Historical Assessment Report', margin, 14);
      doc.setFontSize(11);
      doc.text(`TB Risk Score: ${score}%   |   Date: ${formatDate(report.timestamp)}`, margin, 24);
      y = 44;

      const drawSection = (title, rows) => {
        doc.setFillColor(245, 247, 250);
        doc.roundedRect(margin, y, contentW, 8, 2, 2, 'F');
        doc.setTextColor(79, 70, 229);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(title.toUpperCase(), margin + 3, y + 5.5);
        y += 12;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        rows.forEach(([label, value]) => {
          if (!value && value !== 0) return;
          const strVal = String(value);
          doc.setTextColor(100, 116, 139);
          doc.text(label + ':', margin + 2, y);
          doc.setTextColor(30, 41, 59);
          doc.text(strVal, margin + 52, y, { maxWidth: contentW - 54 });
          const lines = doc.splitTextToSize(strVal, contentW - 54).length;
          y += lines > 1 ? lines * 5 + 1 : 6;
          if (y > 265) { doc.addPage(); y = 20; }
        });
        y += 6;
      };

      const isReportAnalysis = report.type === 'report_analysis';
      const patientName = formData.name || report.user_email?.split('@')[0] || 'Patient';
      const patientAge = formData.age ? `${formData.age} years` : 'N/A';

      drawSection('Patient Summary', [
        ['Name', patientName],
        ['Age', patientAge],
        ['Risk Level', score <= 33 ? 'LOW' : score <= 66 ? 'MODERATE' : 'HIGH'],
      ]);

      drawSection('Assessment Results', [
        ['Risk Score', `${score}%`],
        ['Recommendation', report.result?.test || 'N/A'],
        ['Key Tips', report.result?.tips || 'N/A'],
        ['Diet Plan', report.result?.diet || 'N/A'],
      ]);

      if (isReportAnalysis && report.result?.analysis_details) {
        const details = report.result.analysis_details;
        drawSection('Analysis Details', [
          ['File Name', report.filename || 'Unknown'],
          ['Summary', details.summary || 'N/A'],
          ['Abnormalities', details.abnormal_flags?.join(', ') || 'None found']
        ]);
      }

      doc.setFillColor(241, 245, 249);
      doc.rect(0, doc.internal.pageSize.getHeight() - 18, pageW, 18, 'F');
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.text('⚠ Historical record. For reference only. Consult a doctor for any new symptoms.', margin, doc.internal.pageSize.getHeight() - 7, { maxWidth: contentW });

      doc.save(`TBRisk_History_${patientName.replace(/\s+/g, '_')}_${new Date(report.timestamp).toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error("PDF Generation Error:", err);
      alert("There was an error generating the PDF report. Please check the console.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin text-indigo-600 mb-4 flex justify-center"><Activity size={40} /></div>
        <p className="text-slate-500 font-medium">Loading history tracker...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full animate-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-['Outfit'] text-4xl font-extrabold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Track Your Progress</h1>
          <p className="text-slate-600 text-lg">Visualise your TB risk trends and historical health data.</p>
        </div>
        {trend && (
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm shrink-0">
            <div className="p-3 rounded-xl bg-slate-50">{trend.icon}</div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Trend</p>
              <p className={`font-bold ${trend.color}`}>{trend.text}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Progress Chart Section ────────────────────────────────────────── */}
      {history.length > 0 ? (
        <div className="bg-white/85 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="text-indigo-600" size={20} /> Symptom Timeline
            </h3>
            <div className="text-sm font-semibold text-slate-500 flex items-center gap-4">
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Low</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Moderate</span>
              <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500"></div> High</span>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                  dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
                <ReferenceLine y={33} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
                <ReferenceLine y={66} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-white/85 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-12 text-center mb-8">
          <div className="p-4 rounded-full bg-indigo-50 w-fit mx-auto mb-4">
            <Search className="text-indigo-600" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">No History Found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">You haven't completed any assessments yet. Start your first screening to see your progress here.</p>
        </div>
      )}

      {/* ── Records List ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Past Assessments</h3>
        <div className="bg-white border rounded-lg p-1 flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`cursor-pointer p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`cursor-pointer p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? "grid md:grid-cols-2 gap-6" : "flex flex-col gap-4"}>
        {history.map((record) => {
          const score = record.result?.score || 0;
          return (
            <div key={record._id} className="bg-white/85 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl overflow-hidden group hover:border-indigo-600/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                      <Clock className="text-slate-400 group-hover:text-indigo-600 transition-colors" size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{formatDate(record.timestamp)}</p>
                      <p className="text-xs text-slate-500">Assessment #{record._id.slice(-6)}</p>
                    </div>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: `${getScoreColor(score)}15`, color: getScoreColor(score) }}
                  >
                    {score}% Risk
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {record.result?.tips || "Patient assessed for various TB risk factors and symptoms."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex gap-2">
                    <button
                      onClick={() => generatePDFForReport(record)}
                      className="cursor-pointer p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Download PDF"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handleShare(record._id)}
                      className="cursor-pointer p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5"
                      title="Share with Doctor"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedReport(record)}
                    className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all shadow-md px-4 py-2 text-xs flex items-center gap-1.5"
                  >
                    View Details <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal/Overlay */}
      {selectedReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in">
          <div className="bg-white/85 backdrop-blur-md shadow-2xl rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur z-10">
              <h3 className="text-xl font-bold">Assessment Details</h3>
              <button onClick={() => setSelectedReport(null)} className="cursor-pointer p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-700">
                <X size={24} />
              </button>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg"
                    style={{ background: getScoreColor(selectedReport.result?.score) }}
                  >
                    {selectedReport.result?.score}%
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900">Total Risk Score</h4>
                    <p className="text-slate-500 flex items-center gap-1.5">
                      <Calendar size={14} /> Recorded on {formatDate(selectedReport.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare(selectedReport._id)}
                    className="cursor-pointer p-3 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 transition-all text-slate-600 flex gap-2 items-center text-sm font-bold"
                    title="Share Report"
                  >
                    <Share2 size={18} /> Share
                  </button>
                  <button
                    onClick={() => generatePDFForReport(selectedReport)}
                    className="cursor-pointer p-3 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:text-indigo-600 transition-all text-slate-600"
                    title="Download PDF"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {selectedReport.type === 'report_analysis' && selectedReport.result?.analysis_details && (
                  <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><FileText size={16} /> Report Analysis</h5>
                    <p className="text-sm text-slate-700 italic mb-3">"{selectedReport.result.analysis_details.summary}"</p>
                    {selectedReport.result.analysis_details.abnormal_flags && selectedReport.result.analysis_details.abnormal_flags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.result.analysis_details.abnormal_flags.map((flag, idx) => (
                          <span key={idx} className="px-2 py-1 rounded bg-rose-100 text-rose-700 text-xs font-bold">{flag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">AI Recommendations</h5>
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900">
                    <p className="font-semibold mb-1 flex items-center gap-2"><FileText size={16} /> Suggested Tests & Action:</p>
                    <p>{selectedReport.result?.test}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Health Guidance</h5>
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                    <p className="font-semibold mb-1 flex items-center gap-2"><Activity size={16} /> Professional Tips:</p>
                    <p>{selectedReport.result?.tips}</p>
                  </div>
                </div>

                {selectedReport.result?.diet && (
                  <div>
                    <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Dietary Recommendations</h5>
                    <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-900">
                      <p className="font-semibold mb-1 flex items-center gap-2"><Heart size={16} /> Diet Plan:</p>
                      <p>{selectedReport.result.diet}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryTracker;
