import React, { useState, useEffect } from 'react';
import { API_URLS } from '../config';
import { useParams, Link } from 'react-router-dom';
import { Activity, Calendar, FileText, CheckCircle2, Heart, ShieldAlert, Loader2, AlertCircle } from 'lucide-react';

const SharedReport = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(API_URLS.SHARED_REPORT(id));
        if (!response.ok) {
          if (response.status === 404) throw new Error("Report not found or link has expired.");
          throw new Error("Failed to load the shared report.");
        }
        const data = await response.json();
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

  const getScoreColor = (score) => {
    if (score <= 33) return 'from-emerald-500 to-green-400';
    if (score <= 66) return 'from-amber-400 to-yellow-300';
    return 'from-rose-500 to-red-400';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 animate-in">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
      <p className="text-slate-500 font-medium">Loading patient report securely...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-rose-100">
        <ShieldAlert className="text-rose-500 mx-auto mb-4" size={48} />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        <p className="text-slate-500 mb-8">{error}</p>
        <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg transition-all w-full">
          Return to Home
        </Link>
      </div>
    </div>
  );

  if (!report) return null;

  const score = report.result?.score || 0;
  const isAnalysis = report.type === 'report_analysis';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6 font-sans text-slate-800 animate-in">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
              <Activity size={14} /> Medical Professional View
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 font-['Outfit']">TBRisk Patient Report</h1>
            <p className="text-slate-300 flex items-center gap-2">
              <Calendar size={16} /> Generated on {formatDate(report.timestamp)}
            </p>
          </div>
          <div className="relative z-10 shrink-0 text-center md:text-right">
            <div className={`inline-flex flex-col items-center justify-center w-28 h-28 rounded-2xl bg-gradient-to-br ${getScoreColor(score)} shadow-xl border border-white/20`}>
              <span className="text-4xl font-black">{score}%</span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90 mt-1">TB Risk</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-10">

          {/* Patient Details (If available) */}
          {(report.name || report.formData?.name) && (
            <div className="mb-10">
              <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Patient Demographics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div><span className="text-slate-400 block mb-1">Name</span><strong className="text-slate-700">{report.name || report.formData?.name || 'Patient'}</strong></div>
                <div><span className="text-slate-400 block mb-1">Age</span><strong className="text-slate-700">{report.age || report.formData?.age || 'N/A'} yrs</strong></div>
                <div><span className="text-slate-400 block mb-1">Gender</span><strong className="text-slate-700">{report.gender || report.formData?.gender || 'N/A'}</strong></div>
                <div><span className="text-slate-400 block mb-1">Region</span><strong className="text-slate-700">{report.region || report.formData?.region || 'N/A'}</strong></div>
              </div>
            </div>
          )}

          {/* Report Analysis Specifics */}
          {isAnalysis && report.result?.analysis_details && (
            <div className="mb-10 p-6 rounded-2xl border border-slate-200 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><FileText size={20} className="text-indigo-600" /> Radiologist / Lab Summary</h3>
              <p className="text-slate-700 leading-relaxed mb-4">{report.result.analysis_details.summary}</p>

              {report.result.analysis_details.abnormal_flags && report.result.analysis_details.abnormal_flags.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Abnormal Findings</span>
                  <div className="flex flex-wrap gap-2">
                    {report.result.analysis_details.abnormal_flags.map((flag, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200">{flag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Recommendations */}
          <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">AI Clinical Insights</h3>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col shadow-sm">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-700 shrink-0">
                <Activity size={18} /> Recommended Next Steps
              </h4>
              <p className="text-blue-900 leading-relaxed text-sm whitespace-pre-line">
                {report.result?.test || 'No recommendations available.'}
              </p>
            </div>

            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col shadow-sm">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-emerald-700 shrink-0">
                <CheckCircle2 size={18} /> Health Guidelines
              </h4>
              <p className="text-emerald-900 leading-relaxed text-sm whitespace-pre-line">
                {report.result?.tips || 'No tips provided.'}
              </p>
            </div>
          </div>

          {/* Diet Plan */}
          {report.result?.diet && (
            <div className="p-8 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col shadow-sm">
              <h4 className="font-bold mb-4 flex items-center gap-2 text-purple-700 shrink-0">
                <Heart size={20} /> Dietary & Nutritional Advice
              </h4>
              <div className="text-purple-900 leading-relaxed text-sm whitespace-pre-line">
                {report.result.diet.split(/(\*\*.*?\*\*)/g).map((part, i) => (
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
                    : part
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-6 text-center text-xs text-slate-400">
          <p className="flex items-center justify-center gap-1.5 mb-1"><AlertCircle size={14} /> This is an AI-generated summary intended for informational purposes.</p>
          <p>It does not constitute a definitive medical diagnosis. Shared securely via TBRisk AI.</p>
        </div>
      </div>
    </div>
  );
};

export default SharedReport;
