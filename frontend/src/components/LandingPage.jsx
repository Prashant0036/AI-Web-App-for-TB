import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Activity, ChevronRight, CheckCircle, FileText, MapPin,
  LineChart, Stethoscope, Award, ExternalLink, Share2,
  Heart, Moon, Sun, ShieldCheck, Menu, X
} from 'lucide-react';
import bgImage from '../assets/bg.jpeg';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCTA = () => {
    if (user) {
      navigate('/assessment');
    } else {
      navigate('/login');
    }
  };

  const NavLinks = () => (
    <>
      <a href="#features" className="text-slate-600 dark:text-slate-400 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
      <Link to="/history" className="text-slate-600 dark:text-slate-400 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Track Progress</Link>
      <Link to="/reports" className="text-slate-600 dark:text-slate-400 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>AI Reports</Link>
      <Link to="/nearby" className="text-slate-600 dark:text-slate-400 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Diagnostic Finder</Link>
    </>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 md:h-20 gap-4">
          <Link to="/" className="flex items-center gap-2 font-['Outfit'] text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white shrink-0">
            <Activity size={28} className="text-indigo-600 dark:text-indigo-400" />
            <span>TBRisk AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            <NavLinks />
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all"
              title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <button onClick={handleCTA} className="hidden sm:flex cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-5 py-2.5 rounded-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm whitespace-nowrap">
                Open App
              </button>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="text-slate-600 dark:text-slate-400 font-semibold px-4 py-2 rounded-lg hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors text-sm">Login</Link>
                <Link to="/signup" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-5 py-2.5 rounded-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all text-sm whitespace-nowrap">Sign Up</Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 dark:border-slate-800 py-4 animate-in">
            <div className="flex flex-col gap-4 px-6">
              <NavLinks />
              <hr className="border-slate-100 dark:border-slate-800" />
              {user ? (
                <button onClick={handleCTA} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold px-5 py-3 rounded-xl transition-all text-center">
                  Open App
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" className="text-center text-slate-600 dark:text-slate-400 font-semibold py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                  <Link to="/signup" className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/30" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="grid lg:grid-cols-2 items-center max-w-7xl mx-auto px-6 md:px-10 pt-4 md:pt-6 lg:pt-8 pb-6 md:pb-12 lg:pb-16 gap-6 md:gap-8 lg:gap-10">
        {/* Left content */}
        <div className="flex flex-col gap-4 md:gap-6 animate-in">
          <span className="inline-flex bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-full px-4 py-1.5 text-sm font-semibold w-fit">
            AI-Powered Health Assistant
          </span>

          <h1 className="font-['Outfit'] text-4xl md:text-5xl lg:text-[2.8rem] font-extrabold leading-[1.15] text-slate-900 dark:text-white m-0">
            Tuberculosis Risk Assessment &amp; Report Analysis
          </h1>

          <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed m-0 max-w-xl">
            A comprehensive platform designed to help users evaluate their TB risk through symptom analysis, scan medical reports for insights, and locate nearby healthcare facilities.
          </p>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 border-l-indigo-600 rounded-xl p-4 text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            <p className="m-0">
              Symptom Checker | X-Ray &amp; Lab Report Analysis | History Tracking | Healthcare Center Locator
            </p>
          </div>

          <div className="flex gap-4 flex-wrap mt-2">
            <button className="cursor-pointer inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white border-none rounded-xl px-6 md:px-8 py-3.5 md:py-4 text-base font-bold shadow-lg shadow-green-600/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-green-600/40 transition-all" onClick={handleCTA}>
              <Activity size={20} /> Assess Risk Score
            </button>
            <button
              className="cursor-pointer inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-6 md:px-7 py-3.5 md:py-4 text-base font-semibold hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
              onClick={() => user ? navigate('/reports') : navigate('/login')}
            >
              <FileText size={20} /> Analyze Report
            </button>
          </div>

          <div className="flex gap-3 flex-wrap mt-2">
            {['AI-Powered', 'Privacy Focused', 'Informational Tool'].map(t => (
              <span key={t} className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-full px-3 py-1 text-xs font-semibold">
                <CheckCircle size={14} /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Right – bg image */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[16/9] lg:aspect-[4/3] order-first lg:order-last border border-slate-200 dark:border-slate-800">
          <img src={bgImage} alt="Doctor using TBRisk AI" className="w-full h-full object-cover block" />
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-purple-600/5" />
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="bg-slate-50 dark:bg-slate-900 py-20 px-6 md:px-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-['Outfit'] text-3xl md:text-4xl font-extrabold text-center mb-4 text-slate-900 dark:text-white">Platform Features</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 text-base md:text-lg mb-12 max-w-2xl mx-auto">A complete suite of tools to assist in monitoring and understanding your health.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: <Stethoscope size={32} />, title: 'Symptom Assessment', desc: 'Evaluate symptoms via a guided questionnaire for an AI risk score and actionable health tips.' },
              { icon: <FileText size={32} />, title: 'Report Analysis', desc: 'Upload chest X-rays or lab reports for automated extraction and multimodal AI insights.' },
              { icon: <LineChart size={32} />, title: 'History Tracking', desc: 'Monitor health trends over time with securely saved past assessments and visual charts.' },
              { icon: <MapPin size={32} />, title: 'Diagnostic Finder', desc: 'Locate nearby hospitals and healthcare centers on an interactive map based on your location.' },
              { icon: <Share2 size={32} />, title: 'Doctor Portal Bridge', desc: 'Generate secure, temporary links to share your AI findings and scans with your physician.' },
              { icon: <Heart size={32} />, title: 'Localized Diet AI', desc: 'Get high-protein, region-specific diet plans tailored to your recovery needs and location.' },
              { icon: <Activity size={32} />, title: 'AI Screening', desc: 'Advanced screening models optimized for early detection of pulmonary tuberculosis.' },
              { icon: <Moon size={32} />, title: 'Dark Mode UI', desc: 'A premium, eye-friendly dark interface designed for comfortable use in all lighting conditions.' },
            ].map(f => (
              <div key={f.title} className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-500 transition-all group">
                <div className="text-indigo-600 dark:text-indigo-400 mb-5 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                <h3 className="font-['Outfit'] text-lg font-bold mb-3 text-slate-900 dark:text-white">{f.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed m-0">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust & Security Section ── */}
      <section className="py-20 px-6 md:px-10 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-['Outfit'] text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-6">Built for Trust & Safety</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 h-fit"><ShieldCheck size={24} /></div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">Privacy First Architecture</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Your medical data is encrypted and stored securely. We never share your personal health information with third parties.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-xl text-green-600 dark:text-green-400 h-fit"><Activity size={24} /></div>
                <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-1">High Accuracy Screening</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Our AI models are optimized using extensive datasets to provide reliable screening results for early detection.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-900 dark:bg-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden border border-slate-800 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="font-['Outfit'] text-2xl font-bold mb-4">A Professional Resource</h3>
            <p className="text-slate-300 mb-6 leading-relaxed">"TBRisk AI is bridging the gap between rural patients and diagnostic centers by providing an immediate, high-accuracy screening tool that empowers users to seek medical help early."</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center font-bold text-indigo-400">PS</div>
              <div>
                <p className="font-bold m-0">Prashant Saraswat</p>
                <p className="text-xs text-slate-500 m-0">ML Trainee & Full Stack Developer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Research Section ── */}
      <section className="py-20 px-6 md:px-10 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -mr-20 -mt-20 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-50 dark:bg-purple-900/20 rounded-full blur-3xl -ml-20 -mb-20 opacity-50"></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
            <div className="bg-indigo-50 dark:bg-indigo-900/40 p-4 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-800 shrink-0">
              <div className="bg-indigo-600 p-4 rounded-xl text-white">
                <Award size={48} />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider rounded-full mb-3">
                Published Research
              </span>
              <h2 className="font-['Outfit'] text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
                Backed by Peer-Reviewed Science
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg mb-5 leading-relaxed">
                Our core AI model for pulmonary TB detection has been published in the <strong>Iconic Research And Engineering Journals (IRE Journals)</strong>.
                The paper, <em>"Automated Detection of Pulmonary Tuberculosis from Chest X-Rays Using Fine-Tuned Convolutional Neural Networks,"</em> details our methodology achieving ~95% validation accuracy.
              </p>

              <a
                href="https://www.irejournals.com/paper-details/1716815"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                Read Full Paper <ExternalLink size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-gradient-to-br from-indigo-600 to-purple-600 py-24 px-6 md:px-10 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h2 className="font-['Outfit'] text-3xl md:text-5xl font-extrabold mb-4 relative z-10">Ready to assess your TB risk?</h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto relative z-10">It takes less than 3 minutes. Free, private, and AI-powered.</p>
        <button className="cursor-pointer inline-flex items-center gap-2 bg-white text-indigo-600 rounded-xl px-10 py-5 text-lg font-bold shadow-2xl hover:bg-indigo-50 hover:-translate-y-1 transition-all relative z-10" onClick={handleCTA}>
          Get Started Now <ChevronRight size={24} />
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-900 text-slate-400 text-center py-12 px-6 text-sm leading-relaxed border-t border-slate-800">
        <div className="flex items-center justify-center gap-2 font-['Outfit'] text-lg font-bold text-white mb-4">
          <Activity size={20} className="text-indigo-400" />
          <span>TBRisk AI</span>
        </div>
        <p className="max-w-xl mx-auto">⚠️ TBRisk AI is an informational tool. Always consult a qualified doctor for medical decisions.</p>
        <div className="mt-8 flex justify-center gap-6 text-xs font-semibold uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <p className="mt-8 text-slate-600 text-xs m-0">© 2026 TBRisk AI · Built with ❤️ for public health</p>
      </footer>
    </div>
  );
};

export default LandingPage;
