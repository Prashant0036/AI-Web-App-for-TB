import React, { useState } from 'react';
import { API_URLS } from '../config';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_URLS.AUTH.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      login({ username: data.username, email: formData.email }, data.access_token);
      navigate('/assessment');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-xl rounded-2xl p-8 w-full max-w-md animate-in">
        <h1 className="text-4xl font-extrabold mb-6 text-center bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent font-['Outfit']">Welcome Back</h1>
        <p className="text-center text-slate-500 dark:text-slate-400 mb-8">Login to access your TB assessment history and more.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-600 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold no-underline hover:underline transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
