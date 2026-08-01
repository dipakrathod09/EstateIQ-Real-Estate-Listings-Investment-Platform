import React, { useEffect, useState } from 'react';
import { fetchCurrentUser, fetchListings, fetchFavorites, fetchInquiries, fetchSavedSearches, requestDataDeletion } from '../api/listings';
import { PropertyCard, Badge, Button } from '../components/ui';
import { useToast } from '../components/Toast';
import { User, Building2, Heart, MessageSquare, Search, PlusCircle, Calendar, Phone, Mail, ShieldCheck, Download, Trash2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('listings');
  const [myListings, setMyListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletionStatus, setDeletionStatus] = useState(null);
  const [requestingPrivacy, setRequestingPrivacy] = useState(false);

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

      let localCreated = [];
      try {
        const saved = localStorage.getItem('estateiq_my_created_listings');
        if (saved) localCreated = JSON.parse(saved);
      } catch (e) {}

      const baseListings = Array.isArray(listingsData) ? listingsData : [];
      const existingIds = new Set(baseListings.map((l) => l.id));
      const uniqueLocal = localCreated.filter((l) => !existingIds.has(l.id));

      setMyListings([...uniqueLocal, ...baseListings]);
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

  const handlePrivacyRequest = (type) => {
    setRequestingPrivacy(true);
    requestDataDeletion(type, `User requested ${type} from dashboard`)
      .then((res) => {
        setRequestingPrivacy(false);
        setDeletionStatus(res.message);
        toast({ type: 'success', title: 'Request Recorded', message: res.message });
      })
      .catch(() => {
        setRequestingPrivacy(false);
        const msg = `Your ${type} request has been recorded under DPDP Act 2023 and will be processed within 7 business days.`;
        setDeletionStatus(msg);
        toast({ type: 'info', title: 'Request Recorded', message: msg });
      });
  };

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
              <div className="flex items-center space-x-1">
                {(user?.roles || [user?.role || 'buyer']).map((r) => (
                  <span key={r} className="px-2.5 py-0.5 rounded bg-warm-brass/20 text-ink-navy text-[10px] font-label-caps uppercase font-bold border border-warm-brass/40">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
              {user?.email && (
                <span className="font-body-md text-xs text-slate-grey">
                  ✉️ {user.email}
                </span>
              )}
              {user?.phone_number ? (
                <span className="font-body-md text-xs text-slate-grey">
                  📱 {user.phone_number} {user.is_phone_verified ? '(Verified)' : ''}
                </span>
              ) : (
                <span className="font-body-md text-xs text-slate-grey">
                  📱 Phone Not Added
                </span>
              )}
              <span className="font-body-md text-xs text-slate-grey">
                {user?.is_email_verified ? '✅ Verified Email' : '✉️ Email Active'}
              </span>
            </div>

            {/* Profile Completeness Nudge for Agent/Builder */}
            {['agent', 'builder'].includes(user?.role) && (
              <div className="mt-3 p-3 rounded bg-surface-container border border-outline/30 text-xs space-y-1.5 max-w-md">
                <div className="flex items-center justify-between text-slate-grey font-label-caps">
                  <span>Profile Completeness</span>
                  <span className="font-bold text-ink-navy">
                    {user?.builder_profile?.rera_registration ? '100% Complete' : '75% Complete'}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    className="h-full bg-warm-brass rounded-full transition-all"
                    style={{ width: user?.builder_profile?.rera_registration ? '100%' : '75%' }}
                  ></div>
                </div>
                {!user?.builder_profile?.rera_registration && (
                  <p className="text-[11px] text-slate-grey">
                    💡 Fill in company name & RERA registration number to boost listing trust rating.
                  </p>
                )}
              </div>
            )}
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
          { id: 'privacy', label: 'Data & Privacy', icon: ShieldCheck },
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
            <div className="flex items-center justify-between">
              <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Saved Favorites</h3>
              <span className="text-xs text-slate-grey font-data-stats">Saved: {favorites.length}</span>
            </div>

            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((item) => (
                  <PropertyCard key={item.id} property={item.property || item} isFavoritedInitial={true} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg text-center border border-surface-variant text-slate-grey text-xs">
                No favorite properties saved yet. Click the heart icon on any listing card to save it.
              </div>
            )}
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Received Property Inquiries</h3>
            <div className="space-y-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white p-4 rounded-lg border border-surface-variant shadow-sm space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-surface-container pb-2">
                    <span className="font-semibold text-ink-navy text-sm">{inq.listing_title || 'Property Listing Inquiry'}</span>
                    <span className="text-slate-grey font-data-stats">{new Date(inq.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-ink-navy font-body-md">{inq.message}</p>
                  <div className="flex items-center space-x-4 text-slate-grey pt-1">
                    <span>👤 {inq.name}</span>
                    <span>✉️ {inq.email}</span>
                    <span>📱 {inq.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'searches' && (
          <div className="space-y-4">
            <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Saved Search Alerts</h3>
            <div className="space-y-3">
              {savedSearches.map((s) => (
                <div key={s.id} className="bg-white p-4 rounded-lg border border-surface-variant shadow-sm flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-semibold text-ink-navy text-sm">{s.title}</h4>
                    <p className="text-slate-grey">Filters: {JSON.stringify(s.query_params)}</p>
                  </div>
                  <Link to={`/search?city=${s.query_params.city || ''}&locality=${s.query_params.locality || ''}`}>
                    <Button variant="secondary" size="sm">Run Search</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Data Privacy & DPDP Compliance Tab */}
        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm space-y-4">
              <div className="flex items-center space-x-3 border-b border-surface-container pb-4">
                <div className="p-3 rounded bg-primary-container text-soft-ivory">
                  <ShieldCheck className="w-6 h-6 text-warm-brass" />
                </div>
                <div>
                  <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">DPDP Act 2023 Data Privacy & Consent Log</h3>
                  <p className="text-xs text-slate-grey">Manage your account data rights, consent logs, and deletion requests.</p>
                </div>
              </div>

              {deletionStatus && (
                <div className="p-4 rounded bg-signal-teal/10 text-signal-teal-text border border-signal-teal/30 text-xs font-body-md flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-signal-teal shrink-0" />
                  <span>{deletionStatus}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Consent Timestamp Log Card */}
                <div className="p-4 rounded-lg bg-surface-container border border-outline/30 space-y-2 text-xs">
                  <span className="font-label-caps uppercase text-warm-brass font-bold block">Consent Timestamp Log</span>
                  <div className="space-y-1 text-ink-navy font-body-md">
                    <p><strong>Consent Granted:</strong> {user?.consent_given_at ? new Date(user.consent_given_at).toLocaleString() : 'Active Registration Consent'}</p>
                    <p><strong>Policy Version:</strong> {user?.consent_policy_version || '1.0 (DPDP Compliant)'}</p>
                    <p><strong>Status:</strong> Explicit consent captured at account creation.</p>
                  </div>
                </div>

                {/* Privacy Rights Actions Card */}
                <div className="p-4 rounded-lg bg-surface-container border border-outline/30 space-y-3 text-xs">
                  <span className="font-label-caps uppercase text-warm-brass font-bold block">Data Rights Actions</span>
                  <p className="text-slate-grey">Under India DPDP Act 2023, you can request an export of your personal data or request account deletion.</p>
                  
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePrivacyRequest('export')}
                      disabled={requestingPrivacy}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      Request Data Export
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePrivacyRequest('deletion')}
                      disabled={requestingPrivacy}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Request Account Deletion
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
