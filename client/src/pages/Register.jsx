import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Loader2 } from 'lucide-react';
import Toast from '../components/Toast';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (m, t = 'info') => setToast({ message: m, type: t });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { showToast('Fill in all fields', 'warning'); return; }
    if (form.password !== form.confirm) { showToast('Passwords do not match', 'error'); return; }
    if (form.password.length < 6) { showToast('Password must be at least 6 characters', 'warning'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        showToast('Account created! Redirecting...', 'success');
        setTimeout(() => navigate('/resume-builder'), 800);
      } else {
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch {
      showToast('Network error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-violet-600/30">
            <UserPlus size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-2">Start building your AI resume today</p>
        </div>

        <div className="bg-gray-800/50 border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Full Name</label>
              <input id="registerName" type="text" value={form.name} onChange={e => up('name', e.target.value)} placeholder="John Doe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Email</label>
              <input id="registerEmail" type="email" value={form.email} onChange={e => up('email', e.target.value)} placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-sm" />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Password</label>
              <div className="relative">
                <input id="registerPassword" type={showPw ? 'text' : 'password'} value={form.password} onChange={e => up('password', e.target.value)} placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2.5 pr-11 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-sm" />
                <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1.5 block">Confirm Password</label>
              <input id="registerConfirm" type={showPw ? 'text' : 'password'} value={form.confirm} onChange={e => up('confirm', e.target.value)} placeholder="Repeat password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-900/60 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 text-sm" />
            </div>
            <button type="submit" id="registerSubmit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold shadow-xl shadow-violet-600/25 transition-all flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
