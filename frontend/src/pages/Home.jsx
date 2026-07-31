import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchBackendHealth } from '../api/client';
import { fetchListings } from '../api/listings';
import { PropertyCard, Button } from '../components/ui';
import { Search, Building2, Sparkles, Activity, ArrowRight, RefreshCw } from 'lucide-react';

export const Home = () => {
  const [health, setHealth] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('Ahmedabad');

  const checkHealthStatus = () => {
    fetchBackendHealth()
      .then((data) => setHealth(data))
      .catch(() => setHealth({ status: 'offline' }));
  };

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetchBackendHealth().catch(() => ({ status: 'offline' })),
      fetchListings({ city: 'Ahmedabad' }).catch(() => [])
    ]).then(([healthData, listingsData]) => {
      if (isMounted) {
        setHealth(healthData || { status: 'offline' });
        setListings(Array.isArray(listingsData) ? listingsData : []);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      {/* Hero Section */}
      <section className="bg-ink-navy text-soft-ivory py-16 px-4 sm:px-6 lg:px-8 border-b border-primary-container relative overflow-hidden">
        <div className="max-w-max-width mx-auto space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-primary-container text-warm-brass text-xs font-label-caps uppercase border border-warm-brass/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Blueprint Skyline Design System Live • Launch City: Ahmedabad</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="font-display-lg text-4xl sm:text-6xl font-semibold leading-tight text-soft-ivory">
              Intelligent Real Estate & <br />
              <span className="text-warm-brass">AI Valuation Analytics</span>
            </h1>
            <p className="font-body-lg text-slate-grey text-base sm:text-lg max-w-2xl">
              RERA-verified properties, ML-backed automated valuations, and yield-focused investment analytics tailored for buyers, agents, and investors.
            </p>
          </div>

          {/* Quick Search Bar */}
          <div className="bg-white p-3 rounded-lg shadow-lg max-w-4xl border border-surface-variant flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 flex items-center space-x-2 px-3 py-2 bg-surface-container rounded border border-outline-variant/40 w-full">
              <Building2 className="w-5 h-5 text-slate-grey" />
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="bg-transparent text-ink-navy font-body-md text-sm focus:outline-none w-full cursor-pointer"
              >
                <option value="Ahmedabad">Ahmedabad (Launch City)</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            <Button to={`/search?city=${encodeURIComponent(searchCity)}`} variant="primary" className="w-full sm:w-auto px-6">
              <Search className="w-4 h-4 mr-2" />
              Explore Listings
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="max-w-max-width mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 w-full">
        {/* Backend Infrastructure Connection Card */}
        <div className="bg-white rounded-lg p-6 border border-surface-variant shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded bg-primary-fixed text-ink-navy">
              <Activity className="w-6 h-6 animate-pulse text-signal-teal" />
            </div>
            <div>
              <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Infrastructure Status</h3>
              <p className="font-body-md text-xs text-slate-grey">Django REST Backend Connectivity Check</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {health?.status === 'ok' ? (
              <span className="inline-flex items-center px-3 py-1 rounded text-xs font-label-caps bg-signal-teal/10 text-signal-teal-text border border-signal-teal/30">
                <span className="w-2 h-2 rounded-full bg-signal-teal mr-2 animate-ping"></span>
                Connected (ok)
              </span>
            ) : health?.status === 'offline' ? (
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-3 py-1 rounded text-xs font-label-caps bg-alert-coral/10 text-alert-coral border border-alert-coral/30">
                  <span className="w-2 h-2 rounded-full bg-alert-coral mr-2"></span>
                  Offline
                </span>
                <button
                  type="button"
                  onClick={checkHealthStatus}
                  className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-xs text-ink-navy flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded text-xs font-label-caps bg-warm-brass/10 text-warm-brass border border-warm-brass/30">
                Connecting...
              </span>
            )}
          </div>
        </div>

        {/* Featured Listings Section */}
        <div className="space-y-6">
          <div className="flex items-end justify-between border-b border-surface-container-highest pb-4">
            <div>
              <span className="text-xs font-label-caps uppercase text-warm-brass">Featured Market</span>
              <h2 className="font-display-lg text-2xl sm:text-3xl font-semibold text-ink-navy">
                Verified Listings in Ahmedabad
              </h2>
            </div>
            <Link to="/search" className="text-xs font-label-caps uppercase text-warm-brass hover:underline flex items-center">
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-grey">Loading verified listings...</div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.slice(0, 6).map((listing) => (
                <PropertyCard key={listing.id} property={listing.property} listingId={listing.id} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <PropertyCard
                property={{
                  id: 1,
                  title: '4 BHK Luxury Villa in Bodakdev',
                  locality: 'Bodakdev',
                  city: 'Ahmedabad',
                  price: 18500000,
                  bhk: 4,
                  area_sqft: 3200,
                  listing_type: 'buy',
                  is_verified: true,
                  rera_number: 'PR/GJ/AHMEDABAD/10293/2026',
                }}
              />
              <PropertyCard
                property={{
                  id: 2,
                  title: '3 BHK Apartment in Satellite',
                  locality: 'Satellite',
                  city: 'Ahmedabad',
                  price: 9200000,
                  bhk: 3,
                  area_sqft: 1850,
                  listing_type: 'buy',
                  is_verified: true,
                  rera_number: 'PR/GJ/AHMEDABAD/88274/2026',
                }}
              />
              <PropertyCard
                property={{
                  id: 3,
                  title: '2 BHK Modern Flat in Prahlad Nagar',
                  locality: 'Prahlad Nagar',
                  city: 'Ahmedabad',
                  price: 6800000,
                  bhk: 2,
                  area_sqft: 1350,
                  listing_type: 'buy',
                  is_verified: true,
                  rera_number: 'PR/GJ/AHMEDABAD/55219/2026',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
