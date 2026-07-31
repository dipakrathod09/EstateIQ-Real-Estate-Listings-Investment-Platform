import React, { useState } from 'react';
import { updateUserPreferences } from '../api/listings';
import { Button } from './ui';
import { Sparkles, Check, ArrowRight, X, Building2, MapPin } from 'lucide-react';

export const OnboardingModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState('buy');
  const [selectedCities, setSelectedCities] = useState(['Ahmedabad']);
  const [bhkPreference, setBhkPreference] = useState('3');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleCity = (city) => {
    if (selectedCities.includes(city)) {
      if (selectedCities.length > 1) {
        setSelectedCities(selectedCities.filter((c) => c !== city));
      }
    } else {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const handleFinishOnboarding = () => {
    setSaving(true);
    const prefs = {
      intent,
      cities: selectedCities,
      bhk: bhkPreference,
      onboarding_done: true,
    };

    // Save to user object in localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        userObj.preferences = prefs;
        localStorage.setItem('user', JSON.stringify(userObj));
      } catch (e) {}
    }

    updateUserPreferences(prefs)
      .then(() => {
        setSaving(false);
        localStorage.removeItem('trigger_onboarding');
        if (onComplete) onComplete(prefs);
        onClose();
      })
      .catch(() => {
        setSaving(false);
        localStorage.removeItem('trigger_onboarding');
        if (onComplete) onComplete(prefs);
        onClose();
      });
  };

  const handleSkip = () => {
    localStorage.removeItem('trigger_onboarding');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-navy/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white max-w-lg w-full rounded-lg border border-surface-variant shadow-2xl p-6 sm:p-8 space-y-6 relative">
        {/* Skip & Close Button */}
        <div className="flex items-center justify-between border-b border-surface-container pb-4">
          <div className="flex items-center space-x-2 text-warm-brass text-xs font-label-caps uppercase">
            <Sparkles className="w-4 h-4 text-warm-brass" />
            <span>Personalize Your Feed</span>
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="text-slate-grey hover:text-ink-navy text-xs font-label-caps flex items-center space-x-1 cursor-pointer transition-colors"
          >
            <span>Skip for now</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: Intent (Buy or Rent) */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-display-lg text-2xl font-semibold text-ink-navy">What is your primary goal?</h2>
              <p className="text-xs text-slate-grey">We'll tailor property listings and ROI analytics to match.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { id: 'buy', title: 'Buy a Property', desc: 'Looking for homes, villas, or commercial investments' },
                { id: 'rent', title: 'Rent a Property', desc: 'Looking for long-term or corporate rental homes' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setIntent(opt.id)}
                  className={`p-4 rounded-lg text-left border transition-all cursor-pointer space-y-2 ${
                    intent === opt.id
                      ? 'bg-primary-container/20 border-warm-brass text-ink-navy'
                      : 'bg-surface-container border-outline/20 text-ink-navy hover:border-warm-brass/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm text-sm font-semibold">{opt.title}</span>
                    {intent === opt.id && <Check className="w-4 h-4 text-warm-brass" />}
                  </div>
                  <p className="text-[11px] text-slate-grey">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={() => setStep(2)}>
                Next: Select Cities <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: City Preferences */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-display-lg text-2xl font-semibold text-ink-navy">Which cities are you exploring?</h2>
              <p className="text-xs text-slate-grey">Select one or more launch cities.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Ahmedabad', 'Mumbai', 'Delhi NCR', 'Bengaluru', 'Pune'].map((c) => {
                const isSelected = selectedCities.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCity(c)}
                    className={`px-4 py-2 rounded-full text-xs font-label-caps flex items-center space-x-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-ink-navy text-soft-ivory font-semibold'
                        : 'bg-surface-container text-ink-navy hover:bg-surface-container-high'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-warm-brass" />
                    <span>{c}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-1 text-signal-teal" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-grey hover:text-ink-navy font-label-caps cursor-pointer"
              >
                Back
              </button>
              <Button variant="primary" onClick={() => setStep(3)}>
                Next: BHK & Budget <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: BHK & Budget Preference */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-display-lg text-2xl font-semibold text-ink-navy">Preferred Configuration</h2>
              <p className="text-xs text-slate-grey">Select your ideal BHK size for custom discovery.</p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {['1', '2', '3', '4'].map((bhk) => (
                <button
                  key={bhk}
                  type="button"
                  onClick={() => setBhkPreference(bhk)}
                  className={`py-3 px-2 rounded text-center text-xs font-label-caps border transition-colors cursor-pointer ${
                    bhkPreference === bhk
                      ? 'bg-ink-navy text-soft-ivory border-ink-navy font-bold'
                      : 'bg-surface-container text-ink-navy border-outline/20 hover:border-warm-brass'
                  }`}
                >
                  {bhk} BHK
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-grey hover:text-ink-navy font-label-caps cursor-pointer"
              >
                Back
              </button>
              <Button variant="primary" onClick={handleFinishOnboarding} disabled={saving}>
                {saving ? 'Saving Signal...' : 'Save & Start Exploring'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
