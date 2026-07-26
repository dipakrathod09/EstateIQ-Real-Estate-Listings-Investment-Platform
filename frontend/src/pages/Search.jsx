import React from 'react';
import { Search as SearchIcon, Filter, Building } from 'lucide-react';

export const Search = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Explore Properties</h1>
          <p className="text-slate-400 text-sm mt-1">Search real estate listings and investment opportunities</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative flex-1 md:w-80">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by city, zipcode, or title..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 text-sm font-medium">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="glass-card p-12 rounded-2xl text-center border border-slate-800/80 space-y-4">
        <Building className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-xl font-bold text-white">Search Engine Ready</h3>
        <p className="text-slate-400 max-w-md mx-auto text-sm">
          Property filtering and ML-backed valuation integration will be implemented in Phase 1 & 2.
        </p>
      </div>
    </div>
  );
};
