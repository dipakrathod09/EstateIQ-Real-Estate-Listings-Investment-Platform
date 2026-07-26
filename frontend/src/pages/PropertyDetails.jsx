import React from 'react';
import { useParams } from 'react-router-dom';
import { Home, MapPin, DollarSign } from 'lucide-react';

export const PropertyDetails = () => {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center space-x-3 text-sm text-slate-400">
        <span>Listings</span>
        <span>/</span>
        <span className="text-sky-400">Property #{id}</span>
      </div>

      <div className="glass-card p-8 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Modern Luxury Villa #{id}</h1>
            <div className="flex items-center space-x-2 text-slate-400 text-sm mt-1">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Beverly Hills, CA 90210</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-sky-400">$1,250,000</div>
            <div className="text-xs text-slate-400">Estimated ROI: 8.4% / yr</div>
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl p-8 text-center text-slate-400 border border-slate-800">
          Property detailed analytics & dynamic image gallery placeholder for Phase 1.
        </div>
      </div>
    </div>
  );
};
