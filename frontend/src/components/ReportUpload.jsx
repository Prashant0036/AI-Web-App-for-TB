import React, { useState, useCallback } from 'react';
import { Upload, FileText, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Search, ArrowRight, X } from 'lucide-react';

const ReportUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload an image (JPG, PNG) or a PDF report.");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setAnalysis(null);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Call Backend API instead of client-side Puter.js
      const response = await fetch('http://127.0.0.1:8000/analyze-report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('tb_token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to analyze report.");
      }

      const analysisData = await response.json();
      setAnalysis(analysisData);

    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full animate-in">
      <div className="text-center mb-10">
        <h1 className="font-['Outfit'] text-4xl font-extrabold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">AI Report Intelligence</h1>
        <p className="text-slate-600 text-lg">Upload your Chest X-ray or laboratory reports for instant AI-powered insights.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        {/* Upload Section */}
        <div className="bg-white/85 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-8">
          <div
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${file ? 'border-indigo-600/50 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-600/30'
              }`}
          >
            {file ? (
              <div className="space-y-4">
                {preview ? (
                  <img src={preview} alt="Report Preview" className="max-h-48 mx-auto rounded-xl shadow-md border animate-in" />
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <FileText size={48} className="text-indigo-600 mb-2" />
                    <p className="font-bold text-slate-700">{file.name}</p>
                  </div>
                )}
                <button
                  onClick={() => { setFile(null); setPreview(null); setAnalysis(null); }}
                  className="cursor-pointer absolute top-2 right-2 bg-white/80 backdrop-blur-sm p-1.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-white shadow-sm transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <input type="file" className="hidden" onChange={onFileChange} accept=".jpg,.jpeg,.png,.pdf" />
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                    <Upload className="text-indigo-600" size={28} />
                  </div>
                  <h3 className="text-lg font-bold mb-1">Upload Medical Documents</h3>
                  <p className="text-sm text-slate-400">Supports X-rays (JPG/PNG) and PDF Lab Results</p>
                </div>
              </label>
            )}
          </div>

          <div className="mt-8">
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all shadow-md w-full flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-md disabled:cursor-not-allowed"
            >
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              {uploading ? "AI Analyzing Report..." : "Analyze Reports and X-Rays"}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
            <AlertCircle size={16} className="shrink-0" />
            <p>AI analysis is for screening only. All findings must be verified by a medical professional.</p>
          </div>
        </div>

        {/* Results Section */}
        <div className="min-h-full">
          {analysis ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6 bg-indigo-50 p-4 rounded-xl border border-indigo-100/50">
                <div className="p-2 bg-indigo-600 text-white rounded-lg"><CheckCircle2 size={24} /></div>
                <div>
                  <h4 className="text-xl font-bold text-indigo-900">Analysis Complete</h4>
                  <p className="text-indigo-600/80 text-sm font-medium">Multimodal Insight Extraction successful</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">

                {analysis.error && (
                  <div className="p-4 rounded-xl flex items-start gap-3 bg-rose-50 border border-rose-200 text-rose-700">
                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                    <div>
                      <h5 className="font-bold mb-1">AI Analysis Failed</h5>
                      <p className="text-sm font-medium">{analysis.error}</p>
                    </div>
                  </div>
                )}
                <div>
                  <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h5>
                  <p className="text-slate-700 leading-relaxed font-medium bg-white p-4 rounded-xl border border-slate-100 italic">
                    "{analysis.summary}"
                  </p>
                </div>

                {analysis.custom_model && (
                  <div className="p-5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 animate-pulse-slow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">Deep Learning Model</span>
                      <div className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold">VGG16-TB</div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <h5 className="text-2xl font-black">{analysis.custom_model.label}</h5>
                        <p className="text-xs opacity-90 mt-1">Classification Result</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{(analysis.custom_model.confidence * 100).toFixed(1)}%</div>
                        <p className="text-[10px] opacity-80">Confidence</p>
                      </div>
                    </div>
                  </div>
                )}

                {analysis.risk_score !== undefined && (
                  <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: analysis.risk_score > 66 ? '#fff1f2' : analysis.risk_score > 33 ? '#fef3c7' : '#ecfdf5' }}>
                    <span className="font-bold text-slate-700">Calculated Risk Score:</span>
                    <span className={`px-3 py-1 rounded-full font-black text-sm ${analysis.risk_score > 66 ? 'bg-rose-500 text-white' : analysis.risk_score > 33 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      {analysis.risk_score}%
                    </span>
                  </div>
                )}

                {analysis.risk_level && (
                  <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: analysis.risk_level.includes('High') ? '#fff1f2' : '#ecfdf5' }}>
                    <span className="font-bold text-slate-700">Reported Risk Level:</span>
                    <span className={`px-3 py-1 rounded-full font-black text-sm ${analysis.risk_level.includes('High') ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                      {analysis.risk_level.toUpperCase()}
                    </span>
                  </div>
                )}

                {analysis.findings && (
                  <div>
                    <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Key Findings</h5>
                    <ul className="grid gap-2">
                      {analysis.findings.map((finding, idx) => (
                        <li key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.abnormal_flags && analysis.abnormal_flags.length > 0 && (
                  <div>
                    <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Abnormal Parameters</h5>
                    <div className="flex flex-wrap gap-2">
                      {analysis.abnormal_flags.map((flag, idx) => (
                        <span key={idx} className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.recommendation && (
                  <div>
                    <h5 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Recommendations</h5>
                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-sm font-medium leading-relaxed">
                      {analysis.recommendation}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100">
                  <a href="/history" className="text-indigo-600 font-bold flex items-center gap-2 justify-center hover:gap-3 transition-all">
                    View in clinical history <ArrowRight size={18} />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/85 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-12 h-full flex flex-col items-center justify-center text-center opacity-40 border-dashed">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
                <ImageIcon size={32} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Waiting for Upload</h3>
              <p className="text-slate-400 text-sm max-w-xs mt-2">Insights will be generated automatically once your document is uploaded and analyzed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportUpload;
