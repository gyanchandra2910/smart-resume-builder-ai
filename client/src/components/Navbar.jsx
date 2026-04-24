import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Home, Eye, BarChart2, MessageSquare, LogIn, UserPlus, LogOut, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home', icon: <Home size={16} /> },
    { to: '/resume-builder', label: 'Build Resume', icon: <FileText size={16} /> },
    { to: '/preview', label: 'Preview', icon: <Eye size={16} /> },
    { to: '/ats-check', label: 'ATS Check', icon: <BarChart2 size={16} /> },
    { to: '/interview-questions', label: 'Interview Prep', icon: <MessageSquare size={16} /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
              <FileText size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              Smart Resume <span className="text-violet-400">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-sm text-gray-300">
                  <User size={15} className="text-violet-400" /> {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 transition-all"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                  <LogIn size={15} /> Login
                </Link>
                <Link to="/register" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/30">
                  <UserPlus size={15} /> Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-gray-900/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(link.to)
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          <div className="border-t border-white/10 my-1 pt-2 flex flex-col gap-1">
            {user ? (
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all">
                <LogOut size={15} /> Logout
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                  <LogIn size={15} /> Login
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-all">
                  <UserPlus size={15} /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
