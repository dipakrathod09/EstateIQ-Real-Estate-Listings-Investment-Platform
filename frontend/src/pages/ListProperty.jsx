import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPropertyListing } from '../api/listings';
import { Button, Input } from '../components/ui';
import { PlusCircle, Building2, Layers, ShieldCheck, Image as ImageIcon, ArrowRight, CheckCircle } from 'lucide-react';

export const ListProperty = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flaggedNotice, setFlaggedNotice] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    city: 'Ahmedabad',
    locality: '',
    property_type: 'Apartment',
    listing_type: 'buy',
    price: '',
    bhk: '2',
    area_sqft: '',
    floor: '1',
    total_floors: '5',
    age_years: '0',
    furnishing: 'Unfurnished',
    facing: 'East',
    rera_number: '',
    description: '',
    has_gym: false,
    has_pool: false,
    has_security: true,
    has_parking: true,
    has_power_backup: false,
    has_lift: true,
    image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    createPropertyListing({
      ...formData,
      price: parseFloat(formData.price),
      bhk: parseInt(formData.bhk),
      area_sqft: parseFloat(formData.area_sqft),
      floor: parseInt(formData.floor),
      total_floors: parseInt(formData.total_floors),
      age_years: parseInt(formData.age_years),
      image_urls: formData.image_url ? [formData.image_url] : [],
    })
      .then((res) => {
        setLoading(false);
        if (res.duplicate_flagged) {
          setFlaggedNotice('Your listing was submitted! Notice: A similar property exists in this locality, so it has been flagged for admin review.');
        } else {
          navigate('/dashboard');
        }
      })
      .catch((err) => {
        setLoading(false);
        setError('Failed to submit listing. Please ensure you are logged in as Owner/Agent.');
      });
  };

  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8">
      {/* Wizard Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 rounded bg-primary-container text-warm-brass mx-auto">
          <PlusCircle className="w-6 h-6" />
        </div>
        <h1 className="font-display-lg text-3xl font-semibold text-ink-navy">List Your Property</h1>
        <p className="font-body-md text-xs text-slate-grey">
          Post property listing for Gujarat RERA verification & buyer discovery
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between border-b border-surface-container-highest pb-4 text-xs font-label-caps uppercase text-slate-grey">
        <span className={step === 1 ? 'text-warm-brass font-bold' : ''}>1. Basic Specs</span>
        <span>/</span>
        <span className={step === 2 ? 'text-warm-brass font-bold' : ''}>2. Specs & Amenities</span>
        <span>/</span>
        <span className={step === 3 ? 'text-warm-brass font-bold' : ''}>3. RERA & Review</span>
      </div>

      {error && (
        <div className="p-3 rounded bg-alert-coral/10 text-alert-coral border border-alert-coral/30 text-xs font-body-md">
          {error}
        </div>
      )}

      {flaggedNotice ? (
        <div className="bg-white p-8 rounded-lg border border-surface-variant text-center space-y-4 shadow-sm">
          <CheckCircle className="w-12 h-12 text-signal-teal mx-auto" />
          <h3 className="font-headline-sm text-lg font-semibold text-ink-navy">Listing Submitted for Moderation</h3>
          <p className="text-xs text-slate-grey">{flaggedNotice}</p>
          <Button variant="primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Listing Title"
                name="title"
                placeholder="e.g. 3 BHK Modern Apartment in Bodakdev"
                required
                value={formData.title}
                onChange={handleChange}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass"
                  >
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Pune">Pune</option>
                  </select>
                </div>

                <Input
                  label="Locality / Neighborhood"
                  name="locality"
                  placeholder="e.g. Satellite, Prahlad Nagar"
                  required
                  value={formData.locality}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Property Type</label>
                  <select
                    name="property_type"
                    value={formData.property_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="Independent House">Independent House</option>
                    <option value="Villa">Villa</option>
                    <option value="Plot">Plot</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Listing Type</label>
                  <select
                    name="listing_type"
                    value={formData.listing_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass"
                  >
                    <option value="buy">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
              </div>

              <Input
                label="Price (INR)"
                name="price"
                type="number"
                placeholder="8500000"
                required
                value={formData.price}
                onChange={handleChange}
              />

              <Button type="button" variant="primary" className="w-full" onClick={() => setStep(2)}>
                Next: Specs & Amenities <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="BHK"
                  name="bhk"
                  type="number"
                  required
                  value={formData.bhk}
                  onChange={handleChange}
                />
                <Input
                  label="Area (sq ft)"
                  name="area_sqft"
                  type="number"
                  placeholder="1850"
                  required
                  value={formData.area_sqft}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Floor Number"
                  name="floor"
                  type="number"
                  value={formData.floor}
                  onChange={handleChange}
                />
                <Input
                  label="Total Floors"
                  name="total_floors"
                  type="number"
                  value={formData.total_floors}
                  onChange={handleChange}
                />
                <Input
                  label="Property Age (Years)"
                  name="age_years"
                  type="number"
                  value={formData.age_years}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-surface-container">
                <label className="block text-xs font-label-caps uppercase text-ink-navy">Amenities Available</label>
                <div className="grid grid-cols-2 gap-2 text-xs text-ink-navy">
                  {[
                    { name: 'has_gym', label: 'Fitness Gym' },
                    { name: 'has_pool', label: 'Swimming Pool' },
                    { name: 'has_security', label: '24/7 Security' },
                    { name: 'has_parking', label: 'Reserved Parking' },
                    { name: 'has_power_backup', label: 'Power Backup' },
                    { name: 'has_lift', label: 'Elevator Lift' },
                  ].map((item) => (
                    <label key={item.name} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name={item.name}
                        checked={formData[item.name]}
                        onChange={handleChange}
                        className="rounded border-slate-grey text-signal-teal h-4 w-4"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" variant="primary" onClick={() => setStep(3)}>
                  Next: RERA & Submit <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <Input
                label="RERA Registration Number (Optional for Badge)"
                name="rera_number"
                placeholder="e.g. PR/GJ/AHMEDABAD/10293/2026"
                value={formData.rera_number}
                onChange={handleChange}
              />

              <Input
                label="Image URL (Primary Cover)"
                name="image_url"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.image_url}
                onChange={handleChange}
              />

              <div>
                <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Property Description</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your property specifications, nearby landmarks, metro connectivity..."
                  className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-xs focus:outline-none focus:border-warm-brass"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-surface-container">
                <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Listing'}
                </Button>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
