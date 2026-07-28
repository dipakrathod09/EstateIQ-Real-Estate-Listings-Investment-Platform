import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchListings, logEvent } from '../api/listings';
import { PropertyCard, Button, Input } from '../components/ui';
import { Search as SearchIcon, Building2, SlidersHorizontal, RefreshCw } from 'lucide-react';

const FALLBACK_LISTINGS = [
  {
    id: 1,
    property: {
      id: 1,
      title: '4 BHK Luxury Villa in Bodakdev',
      locality: 'Bodakdev',
      city: 'Ahmedabad',
      property_type: 'Villa',
      price: 18500000,
      bhk: 4,
      area_sqft: 3200,
      listing_type: 'buy',
      is_verified: true,
      rera_number: 'PR/GJ/AHMEDABAD/10293/2026',
      primary_image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
    }
  },
  {
    id: 2,
    property: {
      id: 2,
      title: '3 BHK Apartment in Satellite',
      locality: 'Satellite',
      city: 'Ahmedabad',
      property_type: 'Apartment',
      price: 9200000,
      bhk: 3,
      area_sqft: 1850,
      listing_type: 'buy',
      is_verified: true,
      rera_number: 'PR/GJ/AHMEDABAD/88274/2026',
      primary_image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
    }
  },
  {
    id: 3,
    property: {
      id: 3,
      title: '2 BHK Modern Flat in Prahlad Nagar',
      locality: 'Prahlad Nagar',
      city: 'Ahmedabad',
      property_type: 'Apartment',
      price: 6800000,
      bhk: 2,
      area_sqft: 1350,
      listing_type: 'buy',
      is_verified: true,
      rera_number: 'PR/GJ/AHMEDABAD/55219/2026',
      primary_image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    }
  },
  {
    id: 4,
    property: {
      id: 4,
      title: '3 BHK Premium Flat in Thaltej',
      locality: 'Thaltej',
      city: 'Ahmedabad',
      property_type: 'Apartment',
      price: 11500000,
      bhk: 3,
      area_sqft: 2100,
      listing_type: 'buy',
      is_verified: true,
      rera_number: 'PR/GJ/AHMEDABAD/77102/2026',
      primary_image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
    }
  },
  {
    id: 5,
    property: {
      id: 5,
      title: '4 BHK Duplex Penthouse in Vastrapur',
      locality: 'Vastrapur',
      city: 'Ahmedabad',
      property_type: 'Apartment',
      price: 24000000,
      bhk: 4,
      area_sqft: 3600,
      listing_type: 'buy',
      is_verified: true,
      rera_number: 'PR/GJ/AHMEDABAD/33941/2026',
      primary_image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=600&q=80',
    }
  },
  {
    id: 6,
    property: {
      id: 6,
      title: 'Commercial Office Space on SG Highway',
      locality: 'SG Highway',
      city: 'Ahmedabad',
      property_type: 'Commercial',
      price: 14500000,
      bhk: 0,
      area_sqft: 1600,
      listing_type: 'buy',
      is_verified: true,
      rera_number: 'PR/GJ/AHMEDABAD/99214/2026',
      primary_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    }
  }
];

export const Search = () => {
  const [searchParams] = useSearchParams();
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination States (All hooks at top level)
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('property_type') || '');
  const [bhk, setBhk] = useState(searchParams.get('bhk') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [isVerified, setIsVerified] = useState(searchParams.get('is_verified') === 'true');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  // Data Fetching Effect
  useEffect(() => {
    setLoading(true);
    fetchListings()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllListings(data);
        } else {
          setAllListings(FALLBACK_LISTINGS);
        }
        setLoading(false);
      })
      .catch(() => {
        setAllListings(FALLBACK_LISTINGS);
        setLoading(false);
      });
    
    logEvent('search_view', { city, locality }).catch(() => {});
  }, []);

  // Filter Computation Effect
  useEffect(() => {
    let result = [...allListings];

    if (city && city !== 'All') {
      result = result.filter(item => item.property?.city?.toLowerCase() === city.toLowerCase());
    }

    if (locality.trim()) {
      result = result.filter(item => item.property?.locality?.toLowerCase().includes(locality.toLowerCase().trim()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => 
        item.property?.title?.toLowerCase().includes(q) ||
        item.property?.locality?.toLowerCase().includes(q) ||
        item.property?.city?.toLowerCase().includes(q)
      );
    }

    if (propertyType) {
      result = result.filter(item => item.property?.property_type?.toLowerCase() === propertyType.toLowerCase());
    }

    if (bhk) {
      result = result.filter(item => item.property?.bhk === parseInt(bhk));
    }

    if (minPrice) {
      result = result.filter(item => item.property?.price >= parseFloat(minPrice));
    }

    if (maxPrice) {
      result = result.filter(item => item.property?.price <= parseFloat(maxPrice));
    }

    if (isVerified) {
      result = result.filter(item => item.property?.is_verified || item.property?.rera_number);
    }

    setFilteredListings(result);
  }, [allListings, city, locality, searchQuery, propertyType, bhk, minPrice, maxPrice, isVerified]);

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage) || 1;
  const paginatedItems = filteredListings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    logEvent('search_submit', { searchQuery, city, locality }).catch(() => {});
  };

  const resetFilters = () => {
    setCity('');
    setLocality('');
    setSearchQuery('');
    setPropertyType('');
    setBhk('');
    setMinPrice('');
    setMaxPrice('');
    setIsVerified(false);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 sm:px-6 lg:px-8 max-w-max-width mx-auto space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-container-highest pb-6">
        <div>
          <span className="text-xs font-label-caps uppercase text-warm-brass">Search Engine</span>
          <h1 className="font-display-lg text-3xl font-semibold text-ink-navy">Explore Real Estate Listings</h1>
          <p className="font-body-md text-xs text-slate-grey mt-1">
            Filter properties across Ahmedabad and major sub-markets
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-grey" />
          <input
            type="text"
            placeholder="Search by title, locality, or keyword..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 rounded bg-white border border-outline/40 text-ink-navy text-xs focus:outline-none focus:border-warm-brass shadow-sm"
          />
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
            <button type="button" onClick={resetFilters} className="text-xs text-slate-grey hover:text-warm-brass flex items-center cursor-pointer">
              <RefreshCw className="w-3 h-3 mr-1" /> Reset
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            {/* City Selector */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">City</label>
              <select
                value={city}
                onChange={(e) => { setCity(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass cursor-pointer"
              >
                <option value="">All Cities</option>
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
              onChange={(e) => { setLocality(e.target.value); setCurrentPage(1); }}
            />

            {/* Property Type */}
            <div>
              <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => { setPropertyType(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass cursor-pointer"
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
                    onClick={() => { setBhk(bhk === b ? '' : b); setCurrentPage(1); }}
                    className={`py-1.5 rounded text-xs font-label-caps border transition-colors cursor-pointer ${
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

            {/* Price Range */}
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Min Price (INR)"
                type="number"
                placeholder="5000000"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
              />
              <Input
                label="Max Price (INR)"
                type="number"
                placeholder="20000000"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* RERA Verified Toggle */}
            <div className="flex items-center space-x-2 pt-2 border-t border-surface-container">
              <input
                type="checkbox"
                id="rera-toggle"
                checked={isVerified}
                onChange={(e) => { setIsVerified(e.target.checked); setCurrentPage(1); }}
                className="rounded border-slate-grey text-signal-teal focus:ring-signal-teal h-4 w-4 cursor-pointer"
              />
              <label htmlFor="rera-toggle" className="text-xs font-body-md text-ink-navy cursor-pointer">
                RERA Verified Only
              </label>
            </div>

            <Button type="button" variant="secondary" onClick={resetFilters} className="w-full">
              Reset Filters
            </Button>
          </form>
        </div>

        {/* Listings Grid & Pagination */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-surface-variant">
            <span className="text-xs font-label-caps uppercase text-slate-grey">
              Showing {paginatedItems.length} of {filteredListings.length} Property Listings
            </span>
            <span className="text-xs font-data-stats text-ink-navy">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-grey">Searching listings...</div>
          ) : filteredListings.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedItems.map((item) => (
                  <PropertyCard key={item.id} property={item.property} />
                ))}
              </div>

              {/* Pagination Controls UI */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 bg-white p-4 rounded-lg border border-surface-variant">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`w-8 h-8 rounded text-xs font-label-caps cursor-pointer transition-colors ${
                        currentPage === p
                          ? 'bg-ink-navy text-soft-ivory font-bold'
                          : 'bg-surface-container text-ink-navy hover:bg-surface-container-high'
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg text-center border border-surface-variant space-y-3">
              <Building2 className="w-12 h-12 text-slate-grey mx-auto opacity-50" />
              <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">No Listings Match Search Filters</h3>
              <p className="text-xs text-slate-grey max-w-sm mx-auto">
                No active properties matched your search parameters. Try clearing your filters or searching another area.
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
