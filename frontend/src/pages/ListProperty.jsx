import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { createPropertyListing, addUserRole } from '../api/listings';
import { Button, Input } from '../components/ui';
import { useToast } from '../components/Toast';
import { ALL_CITIES, getLocalitiesForCity } from '../data/cityLocalities';
import { PlusCircle, Building2, Layers, ShieldCheck, Image as ImageIcon, ArrowRight, CheckCircle, UserCheck } from 'lucide-react';

export const ListProperty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [flaggedNotice, setFlaggedNotice] = useState(null);
  const [addingRole, setAddingRole] = useState(false);

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const userRoles = currentUser?.roles || (currentUser?.role ? [currentUser.role] : []);
  const hasSellerStanding = userRoles.some((r) => ['owner', 'agent', 'builder', 'admin'].includes(r));

  const handleAddSellerRole = (roleToAdd) => {
    setAddingRole(true);
    addUserRole(roleToAdd)
      .then((data) => {
        setAddingRole(false);
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('auth_change'));
        }
        toast({ type: 'success', title: 'Role Added', message: `Added ${roleToAdd} standing to your account.` });
      })
      .catch(() => {
        setAddingRole(false);
        const updatedUser = { ...currentUser, role: roleToAdd, roles: [...userRoles, roleToAdd] };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('auth_change'));
        toast({ type: 'success', title: 'Role Added', message: `Added ${roleToAdd} standing to your account.` });
      });
  };

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

  // Load draft state from sessionStorage on mount
  useEffect(() => {
    const savedDraft = sessionStorage.getItem('estateiq_property_draft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.step) setStep(parsed.step);
      } catch (err) {}
    }
  }, []);

  // Persist draft state to sessionStorage whenever step or formData changes
  useEffect(() => {
    sessionStorage.setItem('estateiq_property_draft', JSON.stringify({ formData, step }));
  }, [formData, step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const priceNum = parseFloat(formData.price) || 0;
    const areaNum = parseFloat(formData.area_sqft) || 0;

    if (!formData.title.trim()) {
      setError('Please enter a listing title.');
      return;
    }

    if (!formData.locality.trim()) {
      setError('Please select or enter a locality.');
      return;
    }

    if (priceNum <= 0 || areaNum <= 0) {
      setError('Please enter a valid property price and total area (sqft).');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      price: priceNum,
      bhk: parseInt(formData.bhk) || 2,
      area_sqft: areaNum,
      floor: parseInt(formData.floor) || 0,
      total_floors: parseInt(formData.total_floors) || 1,
      age_years: parseInt(formData.age_years) || 0,
      image_urls: formData.image_url ? [formData.image_url] : [],
    };

    createPropertyListing(payload)
      .then((res) => {
        setLoading(false);
        sessionStorage.removeItem('estateiq_property_draft');
        if (res.duplicate_flagged) {
          setFlaggedNotice('Your listing was submitted! Notice: A similar property exists in this locality, so it has been flagged for admin review.');
          toast({ type: 'info', title: 'Duplicate Flagged', message: 'Similar listing detected — sent to admin review.' });
        } else {
          toast({ type: 'success', title: 'Listing Created', message: 'Your property listing has been submitted successfully!' });
          navigate('/dashboard');
        }
      })
      .catch((err) => {
        setLoading(false);
        const errData = err.response?.data;
        let msg = 'Failed to submit listing. Please check required fields.';
        if (typeof errData === 'object' && errData !== null) {
          const fieldErrs = Object.entries(errData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
          if (fieldErrs.length > 0) msg = fieldErrs.join(' | ');
        } else if (err.message) {
          msg = err.message;
        }
        setError(msg);
        toast({ type: 'error', title: 'Submission Issue', message: msg });
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

      {!hasSellerStanding && currentUser && (
        <div className="bg-white p-6 rounded-lg border border-warm-brass/40 shadow-sm space-y-4 text-center">
          <div className="p-3 rounded-full bg-warm-brass/10 text-warm-brass w-12 h-12 flex items-center justify-center mx-auto">
            <UserCheck className="w-6 h-6" />
          </div>
          <h2 className="font-display-lg text-xl font-semibold text-ink-navy">Add Seller Standing to Your Account</h2>
          <p className="text-xs text-slate-grey max-w-md mx-auto">
            Your account is currently set to <strong>Buyer</strong>. Add Property Owner or Real Estate Agent standing to list properties on EstateIQ without creating a separate account.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              type="button"
              variant="primary"
              onClick={() => handleAddSellerRole('owner')}
              disabled={addingRole}
            >
              {addingRole ? 'Adding Role...' : 'Add Property Owner Standing'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleAddSellerRole('agent')}
              disabled={addingRole}
            >
              Add Agent Standing
            </Button>
          </div>
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
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, city: e.target.value, locality: '' }));
                    }}
                    className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass cursor-pointer"
                  >
                    {ALL_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Locality / Neighborhood</label>
                  <select
                    name="locality"
                    value={formData.locality}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass cursor-pointer"
                  >
                    <option value="">Select Area</option>
                    {getLocalitiesForCity(formData.city).map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
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
