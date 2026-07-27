import React, { useEffect, useState } from 'react';
import { fetchListings, fetchFavorites, fetchCurrentUser } from '../api/listings';
import { PropertyCard, Badge, Button } from '../components/ui';
import { LayoutDashboard, Home, Heart, MessageSquare, Search, ShieldCheck } from 'lucide-react';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('listings');
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchCurrentUser().catch(() => null),
      fetchListings().catch(() => []),
      fetchFavorites().catch(() => [])
    ]).then(([userData, listingsData, favoritesData]) => {
      setUser(userData);
      setListings(Array.isArray(listingsData) ? listingsData : []);
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 sm:px-6 lg:px-8 max-w-max-width mx-auto space-y-8">
      {/* User Header Profile Card */}
      <div className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-primary-container text-warm-brass font-display-lg text-xl font-bold">
            {user?.first_name ? user.first_name[0] : 'U'}
          </div>
          <div>
            <h1 className="font-display-lg text-2xl font-semibold text-ink-navy">
              {user?.username || 'Guest User'}
            </h1>
            <div className="flex items-center space-x-2 text-xs text-slate-grey mt-0.5">
              <span>{user?.email || 'user@estateiq.com'}</span>
              <span>•</span>
              <span className="capitalize text-warm-brass font-label-caps font-semibold">
                Role: {user?.role || 'Buyer'}
              </span>
            </div>
          </div>
        </div>

        <Badge status="live">Account Active</Badge>
      </div>

      {/* Tabs Control */}
      <div className="flex items-center space-x-2 border-b border-surface-container-highest pb-2 overflow-x-auto">
        {[
          { id: 'listings', label: 'My Listings', icon: Home },
          { id: 'favorites', label: 'Saved Favorites', icon: Heart },
          { id: 'inquiries', label: 'Inquiries Received', icon: MessageSquare },
          { id: 'searches', label: 'Saved Searches', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded text-xs font-label-caps uppercase transition-colors whitespace-nowrap ${
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

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'listings' && (
          <div className="space-y-4">
            <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Managed Property Listings</h3>
            {listings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item) => (
                  <div key={item.id} className="relative">
                    <div className="absolute top-2 right-2 z-20">
                      <Badge status={item.status}>{item.status}</Badge>
                    </div>
                    <PropertyCard property={item.property} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg text-center border border-surface-variant text-slate-grey text-xs">
                No active property listings posted yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-4">
            <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Saved Properties</h3>
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
          <div className="bg-white p-6 rounded-lg border border-surface-variant space-y-4">
            <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Received Buyer Inquiries</h3>
            <div className="text-xs text-slate-grey text-center py-6">
              Inquiries submitted by prospective buyers will appear here in real time.
            </div>
          </div>
        )}

        {activeTab === 'searches' && (
          <div className="bg-white p-6 rounded-lg border border-surface-variant space-y-4">
            <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Saved Search Filters</h3>
            <div className="text-xs text-slate-grey text-center py-6">
              Saved searches for Ahmedabad and sub-markets will appear here.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
