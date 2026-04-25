import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      // Automatically log the user in with the returned token
      login({ username: data.username, email: formData.email }, data.access_token);

      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-xl rounded-2xl p-8 w-full max-w-md animate-in">
        <h1 className="text-4xl font-extrabold mb-6 text-center bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent font-['Outfit']">Join Us Today</h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Create your account to track your TB risk and stay updated with health advice.</p>

        {success ? (
          <div className="p-8 text-center bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl animate-in">
            <CheckCircle2 className="mx-auto text-emerald-500 dark:text-emerald-400 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">Account Created!</h2>
            <p className="text-emerald-700 dark:text-emerald-300">Logging you in and redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  type="text"
                  name="username"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem]"
                  placeholder="John Doe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  type="email"
                  name="email"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem]"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold mb-1.5 text-slate-500 dark:text-slate-400">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={18} />
                <input
                  type="password"
                  name="password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-[0.95rem]"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-3 animate-in">
                <AlertCircle size={20} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all shadow-md w-full text-lg py-4 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {!success && (
          <p className="text-center mt-8 text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold no-underline hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Signup;
