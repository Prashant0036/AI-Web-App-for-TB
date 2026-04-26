import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  Activity,
  User as UserIcon,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Thermometer,
  Wind,
  Weight,
  Moon,
  Sun,
  ArrowRight,
  Loader2,
  ChevronRight,
  LogOut,
  FileDown,
  Ruler,
  Heart,
  Menu,
  X
} from 'lucide-react';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { jsPDF } from 'jspdf';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import LandingPage from './components/LandingPage';
import HistoryTracker from './components/HistoryTracker';
import DiagnosticFinder from './components/DiagnosticFinder';
import ReportUpload from './components/ReportUpload';
import SharedReport from './components/SharedReport';
import { API_URLS } from './config';

const BACKEND_URL = API_URLS.PROCESS;

// ── Navbar (used only on non-landing pages) ──────────────────────────────────
const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-16 gap-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-indigo-600 dark:text-indigo-400 shrink-0">
          <Activity size={24} />
          <span>TBRisk AI</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3 lg:gap-5 flex-wrap justify-end">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-2">
                  <UserIcon size={18} /> {user.username}
                </span>
                <Link to="/assessment" className="text-slate-600 dark:text-slate-300 font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Assessment</Link>
                <button
                  onClick={logout}
                  className="cursor-pointer flex items-center gap-1.5 text-rose-500 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all px-3 py-1.5 rounded-lg shrink-0"
                >
                  <LogOut size={18} /> <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 dark:text-slate-300 font-bold">Login</Link>
                <Link to="/signup" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all shadow-md text-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 py-4 px-2 animate-in flex flex-col gap-3">
          {user ? (
            <>
              <div className="px-3 py-2 text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <UserIcon size={18} /> {user.username}
              </div>
              <Link to="/assessment" className="px-3 py-2 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>Assessment</Link>
              <Link to="/history" className="px-3 py-2 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>History</Link>
              <Link to="/reports" className="px-3 py-2 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>Reports</Link>
              <Link to="/nearby" className="px-3 py-2 text-slate-600 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>Nearby Labs</Link>
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="flex items-center gap-2 text-rose-500 font-bold px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 w-full text-left"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-center text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

// ── Assessment Form ───────────────────────────────────────────────────────────
const AssessmentForm = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.username || '', age: '', gender: 'Male', weight: '', height: '',
    'systolic BP': '', 'diastolic BP': '', 'temperature (fahrenheit)': '', 'Respiratory rate (breaths/min)': '',
    HIV: false, Diabetes: false, Smoking: false, Alcohol: false, 'Recent contact with TB patient': false,
    'History of TB': false, 'On immunosuppressive therapy': false, 'Malnutrition (low weight)': false,
    Cough: false, 'Cough duration': '', 'Sputum production (phlegm)': false, 'Coughing blood (hemoptysis)': false,
    'Fever / night sweats': false, 'Unintentional weight loss': false, 'Fatigue / malaise': false,
    'Chest pain': false, 'Shortness of breath': false, 'Recent travel to high TB prevalence area': false,
    'Living conditions': 'Normal / not crowded', 'Other symptoms / notes': '', region: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = { ...formData };
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tb_token')}`
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Assessment failed');
      const data = await response.json();
      setResult(data);

      // Save to history automatically
      const historyItem = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        score: data.risk_score,
        details: data.llm_response,
        formData: formData
      };
      const savedHistory = JSON.parse(localStorage.getItem(`tb_history_${user.email}`) || '[]');
      localStorage.setItem(`tb_history_${user.email}`, JSON.stringify([historyItem, ...savedHistory]));

    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = 20;
    doc.setFontSize(22); doc.setTextColor(79, 70, 229); doc.text("TBRisk AI Assessment Report", margin, y);
    y += 15; doc.setFontSize(12); doc.setTextColor(100, 116, 139); doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 10; doc.text(`Patient: ${formData.name}`, margin, y);
    y += 15; doc.setDrawColor(226, 232, 240); doc.line(margin, y, 190, y);
    y += 15; doc.setFontSize(18); doc.setTextColor(30, 41, 59); doc.text(`Risk Score: ${result.risk_score}%`, margin, y);
    y += 15; doc.setFontSize(14); doc.text("AI Analysis:", margin, y);
    y += 10; doc.setFontSize(10);
    const splitTests = doc.splitTextToSize(`Recommended Tests: ${result.llm_response.test}`, 170);
    doc.text(splitTests, margin, y); y += (splitTests.length * 5) + 5;
    const splitTips = doc.splitTextToSize(`Health Tips: ${result.llm_response.tips}`, 170);
    doc.text(splitTips, margin, y); y += (splitTips.length * 5) + 5;
    if (result.llm_response.diet) {
      const splitDiet = doc.splitTextToSize(`Diet Plan: ${result.llm_response.diet}`, 170);
      doc.text(splitDiet, margin, y);
    }
    doc.save(`TBRisk_Report_${formData.name}.pdf`);
  };

  const getScoreColor = (s) => s > 70 ? 'from-rose-500 to-red-600' : s > 30 ? 'from-amber-500 to-orange-600' : 'from-emerald-500 to-green-600';
  const getScoreEmoji = (s) => s > 70 ? '⚠️' : s > 30 ? '⚡' : '✅';

  if (result) {
    const score = result.risk_score;
    return (
      <div className="max-w-4xl mx-auto px-6 pt-6 pb-12 animate-in transition-colors duration-300">
        <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-xl rounded-2xl p-8 mb-8 text-center">
          <h2 className="text-3xl font-bold mb-6 flex items-center justify-center gap-2 dark:text-white">
            <Stethoscope className="text-indigo-600 dark:text-indigo-400" /> Assessment Results
          </h2>
          <div className={`p-7 rounded-2xl text-white font-['Outfit'] text-3xl font-extrabold text-center shadow-lg bg-gradient-to-r ${getScoreColor(score)}`}>
            {getScoreEmoji(score)} TB Risk Score: {score}%
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-left mt-8 items-stretch">
            <div className="p-7 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-700 dark:text-blue-400 shrink-0">
                <Activity size={22} /> Recommended Tests
              </h3>
              <p className="text-blue-900 dark:text-blue-200 leading-relaxed flex-1 whitespace-pre-line">
                {result.llm_response?.test || 'No recommendations available.'}
              </p>
            </div>
            <div className="p-7 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex flex-col shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 shrink-0">
                <CheckCircle2 size={22} /> Health Tips
              </h3>
              <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed flex-1 whitespace-pre-line">
                {result.llm_response?.tips || 'No tips provided.'}
              </p>
            </div>
          </div>

          {result.llm_response?.diet && (
            <div className="mt-6 text-left p-8 bg-purple-50 dark:bg-purple-900/10 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm">
              <h3 className="text-xl font-bold mb-5 flex items-center gap-2 text-purple-700 dark:text-purple-400">
                <Heart size={22} /> Personalized Diet Plan
              </h3>
              <div className="text-purple-900 dark:text-purple-200 leading-relaxed whitespace-pre-line">
                {result.llm_response.diet.split(/(\*\*.*?\*\*)/g).map((part, i) => (
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
                    : part
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
            <button
              onClick={generatePDF}
              className="cursor-pointer flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all bg-slate-800 text-white hover:bg-slate-700 shadow-md"
            >
              <FileDown size={20} /> Download PDF Report
            </button>
            <button
              onClick={() => setResult(null)}
              className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all shadow-md flex items-center gap-2"
            >
              Start New Assessment <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 font-semibold text-sm mb-4 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
          <Activity size={16} /> AI-Powered Risk Assessment
        </div>
        <h1 className="font-['Outfit'] text-4xl font-extrabold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">TB Symptom Checker</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Welcome, <strong>{user?.username}</strong>! Fill in the details below for a personalised TB risk assessment.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <section className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-xl rounded-2xl p-7 md:p-9 transition-colors duration-300">
          <h2 className="flex items-center gap-2 font-['Outfit'] text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
            <UserIcon className="text-indigo-600 dark:text-indigo-400" size={24} /> Patient Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Full Name*</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem]" placeholder="e.g. Prashant Saraswat" required />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Age (years)*</label>
              <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem]" min="0" required />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1.25em_1.25em] pr-10">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Weight (kg)</label>
              <div className="relative">
                <Weight className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem]" step="0.1" />
              </div>
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Height (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Systolic BP (mmHg)</label>
              <input type="number" name="systolic BP" value={formData['systolic BP']} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem]" />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Diastolic BP (mmHg)</label>
              <input type="number" name="diastolic BP" value={formData['diastolic BP']} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem]" />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Temperature (°F)</label>
              <div className="relative">
                <Thermometer className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="number" name="temperature (fahrenheit)" value={formData['temperature (fahrenheit)']} onChange={handleInputChange} className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem]" step="0.1" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 mt-4">
            <div className="mb-2">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Respiratory Rate</label>
              <div className="relative w-full md:w-56">
                <Wind className="absolute left-3 top-3 text-slate-400" size={16} />
                <input type="number" name="Respiratory rate (breaths/min)" value={formData['Respiratory rate (breaths/min)']} onChange={handleInputChange} className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem]" />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-xl rounded-2xl p-7 md:p-9 transition-colors duration-300">
          <h2 className="flex items-center gap-2 font-['Outfit'] text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
            <AlertCircle className="text-amber-500" size={24} /> Key Risk Factors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['HIV', 'HIV positive'],
              ['Diabetes', 'Diabetes'],
              ['Smoking', 'Smoking'],
              ['Alcohol', 'Heavy alcohol use'],
              ['Recent contact with TB patient', 'Contact with TB patient'],
              ['History of TB', 'History of TB'],
              ['On immunosuppressive therapy', 'Immunosuppression'],
              ['Malnutrition (low weight)', 'Malnutrition'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-all text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" name={key} checked={formData[key]} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-xl rounded-2xl p-7 md:p-9 transition-colors duration-300">
          <h2 className="flex items-center gap-2 font-['Outfit'] text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
            <Activity className="text-rose-600" size={24} /> Symptoms
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              ['Cough', 'Cough'],
              ['Sputum production (phlegm)', 'Sputum / Phlegm'],
              ['Coughing blood (hemoptysis)', 'Coughing Blood'],
              ['Fever / night sweats', 'Fever / Night Sweats'],
              ['Unintentional weight loss', 'Weight Loss'],
              ['Fatigue / malaise', 'Fatigue'],
              ['Chest pain', 'Chest Pain'],
              ['Shortness of breath', 'Shortness of Breath'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-all text-sm text-slate-700 dark:text-slate-300">
                <input type="checkbox" name={key} checked={formData[key]} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                <span>{label}</span>
              </label>
            ))}
          </div>

          {formData.Cough && (
            <div className="mb-4 w-full md:w-64 animate-in">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Cough duration</label>
              <select name="Cough duration" value={formData['Cough duration'] || ''} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1.25em_1.25em] pr-10">
                <option value="">Select duration</option>
                <option value="<2 weeks">&lt; 2 weeks</option>
                <option value="2-3 weeks">2-3 weeks</option>
                <option value=">3 weeks">&gt; 3 weeks</option>
              </select>
            </div>
          )}

          <div className="mb-2 mt-4">
            <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Other symptoms / notes</label>
            <textarea
              name="Other symptoms / notes"
              value={formData['Other symptoms / notes']}
              onChange={handleInputChange}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem] min-h-[100px] resize-y"
              placeholder="Any other details..."
            />
          </div>
        </section>

        <section className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-xl rounded-2xl p-7 md:p-9 transition-colors duration-300">
          <h2 className="flex items-center gap-2 font-['Outfit'] text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
            <Stethoscope className="text-indigo-600 dark:text-indigo-400" size={24} /> Additional Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="mb-0">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Travel History</label>
              <label className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-all h-[42px] m-0">
                <input type="checkbox" name="Recent travel to high TB prevalence area" checked={formData['Recent travel to high TB prevalence area']} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Recent travel to high TB prevalence area</span>
              </label>
            </div>
            <div className="mb-0">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Living Conditions</label>
              <select name="Living conditions" value={formData['Living conditions']} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem] h-[42px] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%208l4%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_0.75rem_center] bg-[length:1.25em_1.25em] pr-10">
                <option value="Normal / not crowded">Normal / not crowded</option>
                <option value="Crowded / shared housing">Crowded / shared housing</option>
                <option value="Homeless / shelters">Homeless / shelters</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
            <div className="mb-0">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Region / State</label>
              <input type="text" name="region" value={formData.region} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem] h-[42px]" placeholder="e.g. Punjab, India" />
            </div>
          </div>
        </section>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-3 animate-in">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 py-8">
          <button type="submit" disabled={loading} className="cursor-pointer flex items-center justify-center gap-2 w-full max-w-[360px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg px-6 py-4 rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all shadow-md disabled:cursor-not-allowed">
            {loading
              ? <><Loader2 className="animate-spin" /> Processing Assessment...</>
              : <>Submit Assessment <ChevronRight /></>
            }
          </button>
          <p className="text-slate-400 text-sm">Secure · Private · AI-powered by Gemini</p>
        </div>
      </form>
    </div>
  );
};

// ── Protected Route ───────────────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;
  return user ? children : <Navigate to="/login" />;
};

// ── App Shell ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<><Navbar /><Login /></>} />
            <Route path="/signup" element={<><Navbar /><Signup /></>} />
            <Route
              path="/assessment"
              element={
                <PrivateRoute>
                  <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
                    <Navbar />
                    <AssessmentForm />
                    <Footer />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
                    <Navbar />
                    <div className="max-w-6xl mx-auto px-6 pt-6 pb-12">
                      <HistoryTracker />
                    </div>
                    <Footer />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PrivateRoute>
                  <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
                    <Navbar />
                    <div className="max-w-6xl mx-auto px-6 pt-6 pb-12">
                      <ReportUpload />
                    </div>
                    <Footer />
                  </div>
                </PrivateRoute>
              }
            />
            <Route
              path="/nearby"
              element={
                <PrivateRoute>
                  <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
                    <Navbar />
                    <div className="max-w-6xl mx-auto px-6 py-10 pb-16">
                      <DiagnosticFinder />
                    </div>
                    <Footer />
                  </div>
                </PrivateRoute>
              }
            />
            <Route path="/shared/:id" element={<SharedReport />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

const Footer = () => (
  <footer className="text-center text-sm text-slate-500 py-10 border-t border-slate-200/50 dark:border-slate-800 mt-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors duration-300">
    <div className="flex items-center justify-center gap-1 mb-2 font-semibold text-slate-900 dark:text-white">
      <Heart className="text-rose-500" size={14} fill="currentColor" /> AI-Powered Health Assistant
    </div>
    <p className="max-w-md mx-auto">AI-generated results. Always consult a qualified doctor for medical decisions.</p>
  </footer>
);

export default App;
