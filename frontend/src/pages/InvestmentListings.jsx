import React, { useEffect, useState } from 'react';
import { fetchInvestments } from '../api/listings';
import { PropertyCard, Button, StatBlock } from '../components/ui';
import { TrendingUp, DollarSign, Percent, Lock, Building2 } from 'lucide-react';

export const InvestmentListings = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvestments()
      .then((data) => {
        setInvestments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setInvestments([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 sm:px-6 lg:px-8 max-w-max-width mx-auto space-y-8">
      <div className="border-b border-surface-container-highest pb-6 space-y-2">
        <span className="text-xs font-label-caps uppercase text-warm-brass">High Yield Assets</span>
        <h1 className="font-display-lg text-3xl font-semibold text-ink-navy">Real Estate Investment Analytics</h1>
        <p className="font-body-md text-xs text-slate-grey">
          Institutional-grade property investments with verified rental yield projections and capital appreciation forecasts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg border border-surface-variant space-y-2">
          <div className="flex items-center space-x-2 text-warm-brass text-xs font-label-caps uppercase">
            <Percent className="w-4 h-4" />
            <span>Average Rental Yield</span>
          </div>
          <div className="font-data-price text-2xl font-bold text-ink-navy">7.4% / yr</div>
          <p className="text-xs text-slate-grey font-body-md">Benchmarked against Ahmedabad prime localities</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-surface-variant space-y-2">
          <div className="flex items-center space-x-2 text-signal-teal text-xs font-label-caps uppercase">
            <TrendingUp className="w-4 h-4" />
            <span>Target Annual ROI</span>
          </div>
          <div className="font-data-price text-2xl font-bold text-ink-navy">12.8%</div>
          <p className="text-xs text-slate-grey font-body-md">Combined rental income & capital appreciation</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-surface-variant space-y-2">
          <div className="flex items-center space-x-2 text-ink-navy text-xs font-label-caps uppercase">
            <Lock className="w-4 h-4" />
            <span>Minimum Capital</span>
          </div>
          <div className="font-data-price text-2xl font-bold text-ink-navy">₹25,00,000</div>
          <p className="text-xs text-slate-grey font-body-md">Commercial & High-growth residential assets</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-grey">Loading investment opportunities...</div>
      ) : investments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {investments.map((inv) => (
            <div key={inv.id} className="bg-white rounded-lg border border-surface-variant p-4 space-y-4 shadow-sm">
              <PropertyCard property={inv.property} />
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container">
                <StatBlock label="Expected ROI" value={`${inv.expected_roi_percentage}%`} />
                <StatBlock label="Rental Yield" value={`${inv.projected_rental_yield}%`} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg border border-surface-variant text-center space-y-4">
          <Building2 className="w-10 h-10 text-warm-brass mx-auto" />
          <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Ahmedabad Prime Investment Opportunities</h3>
          <p className="text-xs text-slate-grey max-w-md mx-auto">
            Explore curated high-yield commercial and residential units in Bodakdev, Satellite, and GIFT City sub-markets.
          </p>
        </div>
      )}
    </div>
  );
};
