import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Search, PlusCircle, Calculator, TrendingUp, LayoutDashboard, LogIn, LogOut, User, Menu, X } from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    window.addEventListener('auth_change', loadUser);
    window.addEventListener('storage', loadUser);
    return () => {
      window.removeEventListener('auth_change', loadUser);
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth_change'));
    navigate('/');
  };

  const navLinks = [
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/investments', icon: TrendingUp, label: 'Invest' },
    { to: '/calculators', icon: Calculator, label: 'Calculators' },
    { to: '/list-property', icon: PlusCircle, label: 'List Property', accent: true },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-ink-navy text-soft-ivory border-b border-primary-container shadow-md">
      <div className="max-w-max-width mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="p-2 rounded bg-warm-brass text-ink-navy shadow-sm group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-display-lg font-bold tracking-tight text-soft-ivory">
              Estate<span className="text-warm-brass">IQ</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs font-label-caps uppercase transition-colors ${
                    isActive(link.to)
                      ? 'bg-primary-container text-warm-brass'
                      : 'text-soft-ivory/80 hover:text-soft-ivory hover:bg-primary-container/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.accent ? 'text-warm-brass' : ''}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {currentUser ? (
              <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-primary-container">
                <Link to="/dashboard" className="flex items-center space-x-1.5 text-xs text-soft-ivory font-semibold hover:text-warm-brass">
                  <User className="w-4 h-4 text-warm-brass" />
                  <span className="max-w-[100px] truncate">
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

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded hover:bg-primary-container/50 text-soft-ivory transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-In Drawer */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-ink-navy border-b border-primary-container shadow-xl z-50 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-label-caps uppercase transition-colors ${
                    isActive(link.to)
                      ? 'bg-primary-container text-warm-brass'
                      : 'text-soft-ivory/80 hover:text-soft-ivory hover:bg-primary-container/40'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${link.accent ? 'text-warm-brass' : ''}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="border-t border-primary-container pt-3 mt-3">
              {currentUser ? (
                <div className="space-y-2">
                  <Link to="/dashboard" className="flex items-center space-x-3 px-4 py-3 text-sm text-soft-ivory font-semibold hover:text-warm-brass">
                    <User className="w-5 h-5 text-warm-brass" />
                    <span>{currentUser.first_name || currentUser.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-sm text-soft-ivory hover:bg-alert-coral/20 hover:text-alert-coral transition-colors cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-warm-brass text-ink-navy text-sm font-label-caps uppercase font-bold"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
