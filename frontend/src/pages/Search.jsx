import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchListings } from '../api/listings';
import { PropertyCard, Button, Input, Badge } from '../components/ui';
import { Search as SearchIcon, Filter, Building2, SlidersHorizontal, RefreshCw } from 'lucide-react';

export const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [city, setCity] = useState(searchParams.get('city') || 'Ahmedabad');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');
  const [bhk, setBhk] = useState(searchParams.get('bhk') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [isVerified, setIsVerified] = useState(searchParams.get('is_verified') === 'true');

  const loadData = () => {
    setLoading(true);
    const params = {};
    if (city) params.city = city;
    if (locality) params.locality = locality;
    if (propertyType) params.property_type = propertyType;
    if (bhk) params.bhk = bhk;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (isVerified) params.is_verified = 'true';

    fetchListings(params)
      .then((data) => {
        setListings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setListings([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [city, propertyType, bhk, isVerified]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const resetFilters = () => {
    setCity('Ahmedabad');
    setLocality('');
    setPropertyType('');
    setBhk('');
    setMinPrice('');
    setMaxPrice('');
    setIsVerified(false);
  };

  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 sm:px-6 lg:px-8 max-w-max-width mx-auto space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-container-highest pb-6">
        <div>
          <span className="text-xs font-label-caps uppercase text-warm-brass">Search Engine</span>
          <h1 className="font-display-lg text-3xl font-semibold text-ink-navy">Explore Real Estate Listings</h1>
          <p className="font-body-md text-xs text-slate-grey mt-1">
            Filter properties across {city} and major sub-markets
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className="bg-white p-5 rounded-lg border border-surface-variant shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-surface-container pb-3">
            <div className="flex items-center space-x-2 text-ink-navy font-semibold text-sm">
              <SlidersHorizontal className="w-4 h-4 text-warm-brass" />
              <span>Filters</span>
            </div>
            <button onClick={resetFilters} className="text-xs text-slate-grey hover:text-warm-brass flex items-center">
              <RefreshCw className="w-3 h-3 mr-1" /> Reset
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* City Selector */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass"
              >
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            {/* Locality Input */}
            <Input
              label="Locality / Area"
              placeholder="e.g. Bodakdev, Satellite"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
            />

            {/* Property Type */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass"
              >
                <option value="">All Types</option>
                <option value="Apartment">Apartment</option>
                <option value="Independent House">Independent House</option>
                <option value="Villa">Villa</option>
                <option value="Plot">Plot</option>
                <option value="Commercial">Commercial</option>
              </select>
            </div>

            {/* BHK Selector */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">BHK</label>
              <div className="grid grid-cols-4 gap-2">
                {['1', '2', '3', '4'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBhk(bhk === b ? '' : b)}
                    className={`py-1.5 rounded text-xs font-label-caps border transition-colors ${
                      bhk === b
                        ? 'bg-ink-navy text-soft-ivory border-ink-navy'
                        : 'bg-surface-container text-ink-navy border-outline/20 hover:border-warm-brass'
                    }`}
                  >
                    {b} BHK
                  </button>
                ))}
              </div>
            </div>

            {/* RERA Verified Toggle */}
            <div className="flex items-center space-x-2 pt-2 border-t border-surface-container">
              <input
                type="checkbox"
                id="rera-toggle"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="rounded border-slate-grey text-signal-teal focus:ring-signal-teal h-4 w-4"
              />
              <label htmlFor="rera-toggle" className="text-xs font-body-md text-ink-navy cursor-pointer">
                RERA Verified Only
              </label>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Apply Filters
            </Button>
          </form>
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-surface-variant">
            <span className="text-xs font-label-caps uppercase text-slate-grey">
              Showing {listings.length} Property Listings
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-grey">Searching listings...</div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <PropertyCard key={item.id} property={item.property} />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg text-center border border-surface-variant space-y-3">
              <Building2 className="w-12 h-12 text-slate-grey mx-auto opacity-50" />
              <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">No Listings Found</h3>
              <p className="text-xs text-slate-grey max-w-sm mx-auto">
                No active properties matched your filter criteria in {city}. Try resetting your search parameters.
              </p>
              <Button variant="secondary" onClick={resetFilters} className="mt-2">
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
