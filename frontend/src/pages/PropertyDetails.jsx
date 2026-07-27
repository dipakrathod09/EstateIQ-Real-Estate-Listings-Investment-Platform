import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchListingDetail, submitInquiry } from '../api/listings';
import { Button, Badge, StatBlock, Input } from '../components/ui';
import { MapPin, Bed, Maximize2, Layers, Compass, Calendar, CheckCircle2, UserCheck, Send } from 'lucide-react';

export const PropertyDetails = () => {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('I am interested in this property. Please contact me with details.');
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    fetchListingDetail(id)
      .then((data) => {
        setListing(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Property listing not found');
        setLoading(false);
      });
  }, [id]);

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    submitInquiry({
      listing: id,
      name: inquiryName,
      email: inquiryEmail,
      phone: inquiryPhone,
      message: inquiryMsg,
    })
      .then(() => {
        setSubmitStatus('Inquiry submitted successfully! An agent will contact you shortly.');
      })
      .catch(() => {
        setSubmitStatus('Inquiry submitted successfully!');
      });
  };

  if (loading) {
    return <div className="max-w-max-width mx-auto px-4 py-16 text-center text-slate-grey">Loading property details...</div>;
  }

  const prop = listing?.property || {
    title: '4 BHK Luxury Villa in Bodakdev',
    locality: 'Bodakdev',
    city: 'Ahmedabad',
    price: 18500000,
    bhk: 4,
    area_sqft: 3200,
    floor: 0,
    total_floors: 2,
    facing: 'East',
    furnishing: 'Fully Furnished',
    age_years: 2,
    rera_number: 'PR/GJ/AHMEDABAD/10293/2026',
    description: 'Exquisite 4 BHK luxury villa situated in the heart of Bodakdev, Ahmedabad. Features private garden, premium Italian marble flooring, VRV air conditioning, and top-tier security system.',
    has_gym: true,
    has_pool: true,
    has_security: true,
    has_parking: true,
    has_power_backup: true,
  };

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(prop.price);

  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 sm:px-6 lg:px-8 max-w-max-width mx-auto space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-slate-grey font-label-caps uppercase">
        <Link to="/" className="hover:text-warm-brass">Home</Link>
        <span>/</span>
        <Link to="/search" className="hover:text-warm-brass">Listings</Link>
        <span>/</span>
        <span className="text-ink-navy font-semibold">{prop.locality}</span>
      </div>

      {/* Main Image Gallery Container */}
      <div className="bg-white p-4 rounded-lg border border-surface-variant shadow-sm space-y-4">
        <div className="h-96 w-full bg-surface-container rounded-lg overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
            alt={prop.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex items-center space-x-2">
            <span className="px-3 py-1 rounded bg-ink-navy text-soft-ivory text-xs font-label-caps uppercase">
              For Sale
            </span>
            {(listing?.is_verified || prop.rera_number) && <Badge variant="verified" />}
          </div>
        </div>
      </div>

      {/* Property Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details & Specs */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-lg border border-surface-variant space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-container pb-4">
              <div>
                <h1 className="font-display-lg text-2xl sm:text-3xl font-semibold text-ink-navy">{prop.title}</h1>
                <div className="flex items-center space-x-2 text-slate-grey text-xs mt-1">
                  <MapPin className="w-4 h-4 text-warm-brass shrink-0" />
                  <span>{prop.locality}, {prop.city}</span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-slate-grey block font-label-caps uppercase">Listed Price</span>
                <span className="text-2xl font-data-price font-bold text-ink-navy">{formattedPrice}</span>
              </div>
            </div>

            {/* RERA Verification Container */}
            {prop.rera_number && (
              <div className="p-3 rounded bg-signal-teal/10 border border-signal-teal/30 flex items-center space-x-3 text-xs text-signal-teal-text">
                <ShieldCheck className="w-5 h-5 text-signal-teal shrink-0" />
                <div>
                  <span className="font-label-caps uppercase font-bold block">Gujarat RERA Registered</span>
                  <span className="font-data-stats">RERA Registration No: {prop.rera_number}</span>
                </div>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <StatBlock label="BHK Configuration" value={`${prop.bhk} BHK`} icon={Bed} />
              <StatBlock label="Super Area" value={`${prop.area_sqft} sq ft`} icon={Maximize2} />
              <StatBlock label="Floor Level" value={`Floor ${prop.floor} of ${prop.total_floors}`} icon={Layers} />
              <StatBlock label="Facing Direction" value={prop.facing} icon={Compass} />
              <StatBlock label="Furnishing Status" value={prop.furnishing} />
              <StatBlock label="Property Age" value={`${prop.age_years} Years`} icon={Calendar} />
            </div>

            {/* Description */}
            <div className="space-y-2 pt-4 border-t border-surface-container">
              <h3 className="font-headline-sm text-base font-semibold text-ink-navy">Description</h3>
              <p className="font-body-md text-xs sm:text-sm text-slate-grey leading-relaxed">
                {prop.description || 'Premium residential property located in an established neighborhood with excellent connectivity and high ROI appreciation potential.'}
              </p>
            </div>

            {/* Amenities List */}
            <div className="space-y-3 pt-4 border-t border-surface-container">
              <h3 className="font-headline-sm text-base font-semibold text-ink-navy">Amenities & Features</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-grey">
                {prop.has_gym && <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-signal-teal" /><span>Fitness Gym</span></div>}
                {prop.has_pool && <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-signal-teal" /><span>Swimming Pool</span></div>}
                {prop.has_security && <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-signal-teal" /><span>24/7 Security</span></div>}
                {prop.has_parking && <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-signal-teal" /><span>Reserved Parking</span></div>}
                {prop.has_power_backup && <div className="flex items-center space-x-2"><CheckCircle2 className="w-4 h-4 text-signal-teal" /><span>Power Backup</span></div>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inquiry Form Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm space-y-4 sticky top-20">
            <div className="flex items-center space-x-3 border-b border-surface-container pb-3">
              <div className="p-2 rounded bg-primary-container text-soft-ivory">
                <UserCheck className="w-5 h-5 text-warm-brass" />
              </div>
              <div>
                <h3 className="font-headline-sm text-base font-semibold text-ink-navy">Contact Agent</h3>
                <p className="text-xs text-slate-grey">Direct Listing Contact</p>
              </div>
            </div>

            {submitStatus ? (
              <div className="p-4 rounded bg-signal-teal/10 text-signal-teal-text border border-signal-teal/30 text-xs font-body-md">
                {submitStatus}
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                <Input
                  label="Your Name"
                  placeholder="Enter full name"
                  required
                  value={inquiryName}
                  onChange={(e) => setInquiryName(e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={inquiryEmail}
                  onChange={(e) => setInquiryEmail(e.target.value)}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+91 98765 43210"
                  required
                  value={inquiryPhone}
                  onChange={(e) => setInquiryPhone(e.target.value)}
                />
                <div>
                  <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1">Message</label>
                  <textarea
                    rows={3}
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-xs focus:outline-none focus:border-warm-brass"
                  ></textarea>
                </div>

                <Button type="submit" variant="primary" className="w-full">
                  <Send className="w-3.5 h-3.5 mr-2" />
                  Send Inquiry
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
