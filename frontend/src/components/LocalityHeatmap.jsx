import React, { useState, useEffect } from 'react';
import { fetchLocalityHeatmap } from '../api/listings';
import { TrendingUp, Percent, MapPin, Zap } from 'lucide-react';

export const LocalityHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedCity, setSelectedCity] = useState('All');

  useEffect(() => {
    fetchLocalityHeatmap()
      .then((data) => setHeatmapData(Array.isArray(data) ? data : []))
      .catch(() => setHeatmapData([]));
  }, []);

  const cities = ['All', 'Ahmedabad', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Pune'];

  const filteredData = selectedCity === 'All'
    ? heatmapData
    : heatmapData.filter((item) => item.city === selectedCity);

  return (
    <div className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-container pb-4">
        <div>
          <div className="flex items-center space-x-2 text-warm-brass text-xs font-label-caps uppercase">
            <Zap className="w-4 h-4 text-warm-brass" />
            <span>Market Growth & Yield Intelligence</span>
          </div>
          <h2 className="font-display-lg text-xl font-semibold text-ink-navy">Locality Appreciation & Rental Heatmap</h2>
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {cities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => setSelectedCity(city)}
              className={`px-3 py-1 rounded-full text-xs font-label-caps transition-colors cursor-pointer ${
                selectedCity === city
                  ? 'bg-ink-navy text-white font-semibold'
                  : 'bg-surface-container text-slate-grey hover:bg-surface-container-high'
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredData.map((item, idx) => (
          <div
            key={`${item.city}-${item.locality}-${idx}`}
            className="p-4 rounded-lg border border-outline/30 bg-surface-container-lowest hover:border-warm-brass/50 transition-all space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-ink-navy font-semibold text-sm">
                <MapPin className="w-4 h-4 text-warm-brass" />
                <span>{item.locality}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-warm-brass/10 text-warm-brass font-label-caps">
                {item.city}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-outline/20 text-xs">
              <div>
                <span className="text-slate-grey block font-label-caps">Avg Price/sqft</span>
                <span className="font-data-price text-sm font-bold text-ink-navy">₹{item.avg_psf.toLocaleString()}/sqft</span>
              </div>
              <div>
                <span className="text-slate-grey block font-label-caps">5-Yr Growth</span>
                <span className="font-data-stats text-sm font-bold text-signal-teal-text flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-0.5 text-signal-teal" />
                  +{item.growth_5yr}%
                </span>
              </div>
              <div>
                <span className="text-slate-grey block font-label-caps">Rental Yield</span>
                <span className="font-data-stats text-sm font-bold text-ink-navy">{item.yield}% / yr</span>
              </div>
              <div>
                <span className="text-slate-grey block font-label-caps">Demand Rating</span>
                <span className="font-label-caps text-xs text-warm-brass font-semibold">{item.demand}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
