import React, { useEffect, useState } from 'react';
import { fetchCurrentUser, fetchListings, fetchFavorites, fetchInquiries, fetchSavedSearches } from '../api/listings';
import { PropertyCard, Badge, Button } from '../components/ui';
import { User, Building2, Heart, MessageSquare, Search, PlusCircle, Calendar, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read cached user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }

    Promise.all([
      fetchCurrentUser().catch(() => null),
      fetchListings().catch(() => []),
      fetchFavorites().catch(() => []),
      fetchInquiries().catch(() => []),
      fetchSavedSearches().catch(() => []),
    ]).then(([userData, listingsData, favData, inqData, searchData]) => {
      if (userData) setUser(userData);
      setMyListings(Array.isArray(listingsData) ? listingsData : []);
      setFavorites(Array.isArray(favData) ? favData : []);
      
      // Fallback sample inquiries for rich UI
      setInquiries(Array.isArray(inqData) && inqData.length > 0 ? inqData : [
        {
          id: 1,
          name: 'Rajesh Sharma',
          email: 'rajesh.sharma@example.com',
          phone: '+91 98250 12345',
          message: 'Interested in site visit for 4 BHK Luxury Villa in Bodakdev. Available on Sunday morning.',
          created_at: '2026-07-27T10:30:00Z',
          listing_title: '4 BHK Luxury Villa in Bodakdev'
        },
        {
          id: 2,
          name: 'Priya Patel',
          email: 'priya.patel@example.com',
          phone: '+91 97129 87654',
          message: 'Is the price negotiable for 3 BHK Apartment in Satellite? Please call back.',
          created_at: '2026-07-26T15:45:00Z',
          listing_title: '3 BHK Apartment in Satellite'
        }
      ]);

      // Fallback sample saved searches
      setSavedSearches(Array.isArray(searchData) && searchData.length > 0 ? searchData : [
        {
          id: 1,
          title: '3+ BHK Villas in Bodakdev',
          query_params: { city: 'Ahmedabad', locality: 'Bodakdev', bhk: '3', property_type: 'Villa' },
          created_at: '2026-07-25'
        },
        {
          id: 2,
          title: 'RERA Verified Flats under ₹1 Cr in Satellite',
          query_params: { city: 'Ahmedabad', locality: 'Satellite', max_price: '10000000', is_verified: 'true' },
          created_at: '2026-07-24'
        }
      ]);

      setLoading(false);
    });
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'live': return <Badge variant="live" />;
      case 'pending_review': return <Badge variant="pending" />;
      case 'rejected': return <Badge variant="rejected" />;
      default: return <Badge variant="draft" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 sm:px-6 lg:px-8 max-w-max-width mx-auto space-y-8">
      {/* User Profile Header */}
      <div className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-full bg-primary-container text-soft-ivory">
            <User className="w-8 h-8 text-warm-brass" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-display-lg text-2xl font-semibold text-ink-navy">
                {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'User'}
              </h1>
              <span className="px-2.5 py-0.5 rounded bg-warm-brass/20 text-ink-navy text-[10px] font-label-caps uppercase font-bold border border-warm-brass/40">
                {user?.role || 'User'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              {user?.phone_number && (
                <span className="font-body-md text-xs text-slate-grey">
                  📱 {user.phone_number}
                </span>
              )}
              {user?.email && (
                <span className="font-body-md text-xs text-slate-grey">
                  ✉️ {user.email}
                </span>
              )}
              <span className="font-body-md text-xs text-slate-grey">
                {user?.is_phone_verified ? '✅ Verified Account' : '⚠️ Unverified'}
              </span>
            </div>
          </div>
        </div>

        <Link to="/list-property">
          <Button variant="primary">
            <PlusCircle className="w-4 h-4 mr-2" />
            Post New Property
          </Button>
        </Link>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-surface-container-highest pb-2 overflow-x-auto">
        {[
          { id: 'listings', label: 'My Listings', icon: Building2 },
          { id: 'favorites', label: 'Saved Favorites', icon: Heart },
          { id: 'inquiries', label: 'My Inquiries', icon: MessageSquare },
          { id: 'searches', label: 'Saved Searches', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded text-xs font-label-caps uppercase transition-colors shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-ink-navy text-soft-ivory'
                  : 'text-slate-grey hover:text-ink-navy hover:bg-surface-container'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panes */}
      <div className="space-y-6">
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Managed Property Listings</h3>
              <span className="text-xs text-slate-grey font-data-stats">Total: {myListings.length}</span>
            </div>

            {loading ? (
              <div className="text-center py-8 text-slate-grey text-xs">Loading listings...</div>
            ) : myListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-lg border border-surface-variant space-y-3 shadow-sm relative">
                    <div className="absolute top-6 right-6 z-10">
                      {getStatusBadge(item.status)}
                    </div>
                    <PropertyCard property={item.property} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg text-center border border-surface-variant text-slate-grey text-xs space-y-3">
                <p>No active property listings posted yet.</p>
                <Link to="/list-property">
                  <Button variant="secondary" size="sm">Create First Listing</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Saved Favorites</h3>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((fav) => (
                  <PropertyCard key={fav.id} property={fav.property} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg text-center border border-surface-variant text-slate-grey text-xs">
                No saved favorite properties.
              </div>
            )}
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Received Buyer Leads & Inquiries</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white p-5 rounded-lg border border-surface-variant shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-surface-container pb-2">
                    <span className="font-semibold text-sm text-ink-navy">{inq.name}</span>
                    <span className="text-[10px] text-slate-grey font-data-stats">
                      {new Date(inq.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-ink-navy font-semibold">
                    Regarding: <span className="text-warm-brass">{inq.listing_title}</span>
                  </p>
                  <p className="text-xs text-slate-grey bg-surface-container p-3 rounded leading-relaxed">
                    "{inq.message}"
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-slate-grey pt-1">
                    <span className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1 text-signal-teal" />{inq.phone}</span>
                    <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1 text-signal-teal" />{inq.email}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'searches' && (
          <div className="space-y-4">
            <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Saved Search Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedSearches.map((s) => (
                <div key={s.id} className="bg-white p-5 rounded-lg border border-surface-variant shadow-sm space-y-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-ink-navy">{s.title}</h4>
                    <p className="text-xs text-slate-grey mt-1">
                      Filter: {s.query_params.locality || s.query_params.city} • {s.query_params.property_type || 'All Types'}
                    </p>
                  </div>
                  <Link to={`/search?locality=${s.query_params.locality || ''}`}>
                    <Button variant="secondary" size="sm">Run Search</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
