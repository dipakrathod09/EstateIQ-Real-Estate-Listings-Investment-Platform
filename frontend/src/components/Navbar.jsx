import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Search, PlusCircle, Calculator, TrendingUp, LayoutDashboard, LogIn } from 'lucide-react';
import { Button } from './ui/Button';

export const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

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

            <Button to="/login" variant="secondary" size="sm" className="ml-2">
              <LogIn className="w-3.5 h-3.5 mr-1" />
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
