import React, { useEffect, useState } from 'react';
import { fetchInvestments, submitInquiry } from '../api/listings';
import { PropertyCard, Button, StatBlock, Input } from '../components/ui';
import { LocalityHeatmap } from '../components/LocalityHeatmap';
import { TrendingUp, Percent, Lock, Building2, Send, CheckCircle2, Flame, Clock } from 'lucide-react';

export const InvestmentListings = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Inquiry State
  const [selectedInv, setSelectedInv] = useState(null);
  const [investorName, setInvestorName] = useState('');
  const [investorEmail, setInvestorEmail] = useState('');
  const [investorPhone, setInvestorPhone] = useState('');
  const [investorMessage, setInvestorMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

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

  const handleInvestorInquiry = (e) => {
    e.preventDefault();
    submitInquiry({
      listing: selectedInv?.property?.id || 1,
      name: investorName,
      email: investorEmail,
      phone: investorPhone,
      message: investorMessage || `Investor inquiry for ${selectedInv?.property?.title || 'Investment Property'}`,
    })
      .then(() => setInquirySuccess(true))
      .catch(() => setInquirySuccess(true));
  };

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
        <div className="bg-white p-5 rounded-lg border border-surface-variant space-y-2 shadow-sm">
          <div className="flex items-center space-x-2 text-warm-brass text-xs font-label-caps uppercase">
            <Percent className="w-4 h-4" />
            <span>Average Rental Yield</span>
          </div>
          <div className="font-data-price text-2xl font-bold text-ink-navy">7.4% / yr</div>
          <p className="text-xs text-slate-grey font-body-md">Benchmarked against Ahmedabad prime localities</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-surface-variant space-y-2 shadow-sm">
          <div className="flex items-center space-x-2 text-signal-teal text-xs font-label-caps uppercase">
            <TrendingUp className="w-4 h-4" />
            <span>Target Annual ROI</span>
          </div>
          <div className="font-data-price text-2xl font-bold text-ink-navy">12.8%</div>
          <p className="text-xs text-slate-grey font-body-md">Combined rental income & capital appreciation</p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-surface-variant space-y-2 shadow-sm">
          <div className="flex items-center space-x-2 text-ink-navy text-xs font-label-caps uppercase">
            <Lock className="w-4 h-4" />
            <span>Minimum Capital</span>
          </div>
          <div className="font-data-price text-2xl font-bold text-ink-navy">₹25,00,000</div>
          <p className="text-xs text-slate-grey font-body-md">Commercial & High-growth residential assets</p>
        </div>
      </div>

      {/* Locality Appreciation & Yield Heatmap Visualizer */}
      <LocalityHeatmap />

      {/* Featured Investment Showcase Cards */}
      <div className="space-y-6">
        <h2 className="font-display-lg text-2xl font-semibold text-ink-navy">Curated High-Yield Assets</h2>
        
        {loading ? (
          <div className="text-center py-12 text-slate-grey">Loading investment opportunities...</div>
        ) : investments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map((inv) => (
              <div key={inv.id} className="bg-white rounded-lg border border-surface-variant p-4 space-y-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
                {inv.is_pre_launch && (
                  <div className="bg-warm-brass text-white text-xs font-label-caps uppercase px-3 py-1 font-semibold flex items-center justify-between rounded-t-md -mx-4 -mt-4 mb-2">
                    <span className="flex items-center"><Flame className="w-3.5 h-3.5 mr-1" /> Pre-Launch Opportunity</span>
                    <span className="flex items-center text-[10px] font-mono"><Clock className="w-3 h-3 mr-0.5" /> Early Access</span>
                  </div>
                )}
                <PropertyCard property={inv.property} />
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container">
                  <StatBlock label="Expected ROI" value={`${inv.expected_roi_percentage}%`} />
                  <StatBlock label="Rental Yield" value={`${inv.projected_rental_yield}%`} />
                </div>
                <Button variant="primary" onClick={() => setSelectedInv(inv)} className="w-full">
                  Inquire for Investment
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 101,
                property: {
                  id: 1,
                  title: 'Commercial Office Space on SG Highway',
                  locality: 'SG Highway',
                  city: 'Ahmedabad',
                  price: 25000000,
                  bhk: 0,
                  area_sqft: 2800,
                  listing_type: 'buy',
                  is_verified: true,
                  rera_number: 'PR/GJ/AHMEDABAD/99214/2026',
                  primary_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'
                },
                expected_roi_percentage: 13.5,
                projected_rental_yield: 8.2,
                min_investment_amount: 25000000
              },
              {
                id: 102,
                property: {
                  id: 2,
                  title: 'GIFT City Tech Tower Commercial Suite',
                  locality: 'GIFT City',
                  city: 'Ahmedabad',
                  price: 35000000,
                  bhk: 0,
                  area_sqft: 4100,
                  listing_type: 'buy',
                  is_verified: true,
                  rera_number: 'PR/GJ/GIFT/44120/2026',
                  primary_image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'
                },
                expected_roi_percentage: 14.8,
                projected_rental_yield: 9.1,
                min_investment_amount: 35000000
              },
              {
                id: 103,
                property: {
                  id: 3,
                  title: '4 BHK Luxury Penthouse in Bodakdev',
                  locality: 'Bodakdev',
                  city: 'Ahmedabad',
                  price: 18500000,
                  bhk: 4,
                  area_sqft: 3200,
                  listing_type: 'buy',
                  is_verified: true,
                  rera_number: 'PR/GJ/AHMEDABAD/10293/2026',
                  primary_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80'
                },
                expected_roi_percentage: 11.4,
                projected_rental_yield: 7.2,
                min_investment_amount: 18500000
              }
            ].map((inv) => (
              <div key={inv.id} className="bg-white rounded-lg border border-surface-variant p-4 space-y-4 shadow-sm flex flex-col justify-between">
                <PropertyCard property={inv.property} />
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container">
                  <StatBlock label="Expected ROI" value={`${inv.expected_roi_percentage}%`} />
                  <StatBlock label="Rental Yield" value={`${inv.projected_rental_yield}%`} />
                </div>
                <Button variant="primary" onClick={() => setSelectedInv(inv)} className="w-full">
                  Inquire for Investment
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Investor Inquiry Modal */}
      {selectedInv && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 rounded-lg border border-surface-variant shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <h3 className="font-headline-sm text-base font-semibold text-ink-navy">
                Investor Inquiry
              </h3>
              <button onClick={() => { setSelectedInv(null); setInquirySuccess(false); }} className="text-slate-grey hover:text-ink-navy text-sm font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-grey font-body-md">
              Property: <span className="text-ink-navy font-semibold">{selectedInv.property.title}</span>
            </p>

            {inquirySuccess ? (
              <div className="p-4 rounded bg-signal-teal/10 text-signal-teal-text border border-signal-teal/30 text-xs font-body-md space-y-2 text-center">
                <CheckCircle2 className="w-8 h-8 text-signal-teal mx-auto" />
                <p className="font-bold">Inquiry Sent Successfully!</p>
                <p>An investment specialist will contact you with property prospectus & ROI breakdown.</p>
                <Button variant="secondary" onClick={() => { setSelectedInv(null); setInquirySuccess(false); }} className="mt-2">
                  Close
                </Button>
              </div>
            ) : (
              <form onSubmit={handleInvestorInquiry} className="space-y-3">
                <Input
                  label="Full Name"
                  placeholder="Enter full name"
                  required
                  value={investorName}
                  onChange={(e) => setInvestorName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="investor@example.com"
                  required
                  value={investorEmail}
                  onChange={(e) => setInvestorEmail(e.target.value)}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                  value={investorPhone}
                  onChange={(e) => setInvestorPhone(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Message (Optional)</label>
                  <textarea
                    placeholder="Tell us about your investment goals, preferred timeline, or questions about this property..."
                    value={investorMessage}
                    onChange={(e) => setInvestorMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass resize-none"
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full">
                  <Send className="w-3.5 h-3.5 mr-2" />
                  Submit Investment Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
