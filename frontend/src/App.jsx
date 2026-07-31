import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Navbar } from './components/Navbar';
import { ToastProvider } from './components/Toast';
import { OnboardingModal } from './components/OnboardingModal';
import { Home } from './pages/Home';
import { Search } from './pages/Search';
import { PropertyDetails } from './pages/PropertyDetails';
import { Login } from './pages/Login';
import { ListProperty } from './pages/ListProperty';
import { Dashboard } from './pages/Dashboard';
import { InvestmentListings } from './pages/InvestmentListings';
import { Calculators } from './pages/Calculators';

const queryClient = new QueryClient();

export function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const checkOnboardingNeed = () => {
    const trigger = localStorage.getItem('trigger_onboarding');
    const userStr = localStorage.getItem('user');
    if (trigger === 'true' && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (!user?.preferences?.onboarding_done) {
          setShowOnboarding(true);
        }
      } catch (e) {
        setShowOnboarding(true);
      }
    }
  };

  useEffect(() => {
    checkOnboardingNeed();
    window.addEventListener('auth_change', checkOnboardingNeed);
    return () => window.removeEventListener('auth_change', checkOnboardingNeed);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>
          <div className="min-h-screen bg-background text-on-background flex flex-col font-body-md">
            <Navbar />
            <OnboardingModal
              isOpen={showOnboarding}
              onClose={() => setShowOnboarding(false)}
              onComplete={() => setShowOnboarding(false)}
            />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/list-property" element={<ListProperty />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/investments" element={<InvestmentListings />} />
                <Route path="/calculators" element={<Calculators />} />
                <Route path="/terms" element={
                  <div className="max-w-max-width mx-auto px-4 py-12 space-y-4">
                    <h1 className="font-display-lg text-3xl font-bold text-ink-navy">Terms of Service</h1>
                    <p className="text-xs text-slate-grey font-body-md">
                      /* DPDP Act 2023 Compliant Terms of Service. */
                    </p>
                    <p className="text-sm text-slate-grey leading-relaxed">
                      EstateIQ operates as an online property listing and valuation analytics portal governed by the Digital Personal Data Protection (DPDP) Act 2023. User data collected during inquiry submission and listing creation is processed solely for real estate facilitation and user authentication.
                    </p>
                  </div>
                } />
                <Route path="/privacy" element={
                  <div className="max-w-max-width mx-auto px-4 py-12 space-y-4">
                    <h1 className="font-display-lg text-3xl font-bold text-ink-navy">Privacy Policy & Data Protection</h1>
                    <p className="text-xs text-slate-grey font-body-md">
                      /* DPDP Act 2023 Privacy Policy. */
                    </p>
                    <p className="text-sm text-slate-grey leading-relaxed">
                      In compliance with the DPDP Act 2023, EstateIQ ensures explicit consent management for phone verification, location preferences, and seller lead contact requests. Users retain rights to data access, correction, and erasure.
                    </p>
                  </div>
                } />
              </Routes>
            </main>
            <footer className="bg-ink-navy text-soft-ivory border-t border-primary-container py-8">
              <div className="max-w-max-width mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-grey">
                <div>© 2026 EstateIQ Platform — "Blueprint Skyline" Design System</div>
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                  <Link to="/terms" className="hover:text-warm-brass">Terms of Service</Link>
                  <Link to="/privacy" className="hover:text-warm-brass">Privacy Policy (DPDP Act)</Link>
                </div>
              </div>
            </footer>
          </div>
        </ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
