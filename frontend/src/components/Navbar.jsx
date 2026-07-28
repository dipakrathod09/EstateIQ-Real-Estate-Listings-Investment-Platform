import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Search, PlusCircle, Calculator, TrendingUp, LayoutDashboard, LogIn, LogOut, User } from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  const isActive = (path) => location.pathname === path;

  const loadUser = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setCurrentUser(JSON.parse(stored)); } catch (e) { setCurrentUser(null); }
    } else {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen for custom auth events
    window.addEventListener('auth_change', loadUser);
    window.addEventListener('storage', loadUser);
    return () => {
      window.removeEventListener('auth_change', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth_change'));
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-ink-navy text-soft-ivory border-b border-primary-container shadow-md">
      <div className="max-w-max-width mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded bg-warm-brass text-ink-navy shadow-sm group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-display-lg font-bold tracking-tight text-soft-ivory">
              Estate<span className="text-warm-brass">IQ</span>
            </span>
          </Link>

          <div className="flex items-center space-x-1 sm:space-x-3">
            <Link
              to="/search"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-label-caps uppercase transition-colors ${
                isActive('/search')
                  ? 'bg-primary-container text-warm-brass'
                  : 'text-soft-ivory/80 hover:text-soft-ivory hover:bg-primary-container/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </Link>

            <Link
              to="/investments"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-label-caps uppercase transition-colors ${
                isActive('/investments')
                  ? 'bg-primary-container text-warm-brass'
                  : 'text-soft-ivory/80 hover:text-soft-ivory hover:bg-primary-container/50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Invest</span>
            </Link>

            <Link
              to="/calculators"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-label-caps uppercase transition-colors ${
                isActive('/calculators')
                  ? 'bg-primary-container text-warm-brass'
                  : 'text-soft-ivory/80 hover:text-soft-ivory hover:bg-primary-container/50'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Calculators</span>
            </Link>

            <Link
              to="/list-property"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-label-caps uppercase transition-colors ${
                isActive('/list-property')
                  ? 'bg-primary-container text-warm-brass'
                  : 'text-soft-ivory/80 hover:text-soft-ivory hover:bg-primary-container/50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-warm-brass" />
              <span>List Property</span>
            </Link>

            <Link
              to="/dashboard"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-label-caps uppercase transition-colors ${
                isActive('/dashboard')
                  ? 'bg-primary-container text-warm-brass'
                  : 'text-soft-ivory/80 hover:text-soft-ivory hover:bg-primary-container/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {currentUser ? (
              <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-primary-container">
                <Link to="/dashboard" className="flex items-center space-x-1.5 text-xs text-soft-ivory font-semibold hover:text-warm-brass">
                  <User className="w-4 h-4 text-warm-brass" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {currentUser.first_name || currentUser.username}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded hover:bg-alert-coral/20 text-soft-ivory hover:text-alert-coral transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button to="/login" variant="secondary" size="sm" className="ml-2">
                <LogIn className="w-3.5 h-3.5 mr-1" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
