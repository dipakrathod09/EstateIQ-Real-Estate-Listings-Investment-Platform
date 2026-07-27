import React, { useState } from 'react';
import { calculateEMI, calculateStampDuty, calculateLoanEligibility } from '../api/listings';
import { Button, Input, StatBlock } from '../components/ui';
import { Calculator, Percent, Landmark, Wallet } from 'lucide-react';

export const Calculators = () => {
  const [activeTab, setActiveTab] = useState('emi');

  // EMI Form State
  const [loanAmount, setLoanAmount] = useState('5000000');
  const [interestRate, setInterestRate] = useState('8.5');
  const [tenureYears, setTenureYears] = useState('20');
  const [emiResult, setEmiResult] = useState(null);

  // Stamp Duty Form State
  const [stampState, setStampState] = useState('Gujarat');
  const [propValue, setPropValue] = useState('8500000');
  const [gender, setGender] = useState('male');
  const [stampResult, setStampResult] = useState(null);

  // Loan Eligibility Form State
  const [monthlyIncome, setMonthlyIncome] = useState('120000');
  const [existingEmis, setExistingEmis] = useState('15000');
  const [eligibilityResult, setEligibilityResult] = useState(null);

  const handleCalculateEMI = (e) => {
    e.preventDefault();
    calculateEMI({
      loan_amount: parseFloat(loanAmount),
      interest_rate: parseFloat(interestRate),
      tenure_years: parseInt(tenureYears),
    }).then(setEmiResult);
  };

  const handleCalculateStampDuty = (e) => {
    e.preventDefault();
    calculateStampDuty({
      state: stampState,
      property_value: parseFloat(propValue),
      gender: gender,
    }).then(setStampResult);
  };

  const handleCalculateEligibility = (e) => {
    e.preventDefault();
    calculateLoanEligibility({
      monthly_income: parseFloat(monthlyIncome),
      existing_emis: parseFloat(existingEmis),
      tenure_years: parseInt(tenureYears),
    }).then(setEligibilityResult);
  };

  const formatCurrency = (val) => {
    if (!val) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-background text-on-background py-8 px-4 sm:px-6 lg:px-8 max-w-max-width mx-auto space-y-8">
      <div className="border-b border-surface-container-highest pb-6 space-y-2">
        <span className="text-xs font-label-caps uppercase text-warm-brass">Financial Utilities</span>
        <h1 className="font-display-lg text-3xl font-semibold text-ink-navy">Real Estate Calculators</h1>
        <p className="font-body-md text-xs text-slate-grey">
          State-wise Stamp Duty lookup, Home Loan EMI breakdown, and Borrowing Eligibility estimator.
        </p>
      </div>

      {/* Calculator Tabs */}
      <div className="flex items-center space-x-2 border-b border-surface-container-highest pb-2">
        {[
          { id: 'emi', label: 'Home Loan EMI', icon: Calculator },
          { id: 'stamp', label: 'Stamp Duty & Registration', icon: Landmark },
          { id: 'eligibility', label: 'Loan Eligibility', icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded text-xs font-label-caps uppercase transition-colors ${
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

      {/* EMI Calculator Content */}
      {activeTab === 'emi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <form onSubmit={handleCalculateEMI} className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm space-y-4">
            <h3 className="font-headline-sm text-base font-semibold text-ink-navy">EMI Calculator Parameters</h3>
            <Input
              label="Home Loan Amount (INR)"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Interest Rate (% p.a.)"
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
              <Input
                label="Tenure (Years)"
                type="number"
                value={tenureYears}
                onChange={(e) => setTenureYears(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" className="w-full">
              Calculate EMI
            </Button>
          </form>

          <div className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm space-y-4">
            <h3 className="font-headline-sm text-base font-semibold text-ink-navy">Monthly Repayment Breakdown</h3>
            {emiResult ? (
              <div className="space-y-3">
                <StatBlock label="Monthly EMI" value={formatCurrency(emiResult.monthly_emi)} />
                <StatBlock label="Total Interest Payable" value={formatCurrency(emiResult.total_interest)} />
                <StatBlock label="Total Amount Payable" value={formatCurrency(emiResult.total_payment)} />
              </div>
            ) : (
              <div className="text-xs text-slate-grey text-center py-8">
                Click "Calculate EMI" to view monthly installment metrics.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stamp Duty Calculator Content */}
      {activeTab === 'stamp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <form onSubmit={handleCalculateStampDuty} className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm space-y-4">
            <h3 className="font-headline-sm text-base font-semibold text-ink-navy">State Stamp Duty Parameters</h3>
            <div>
              <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Select State</label>
              <select
                value={stampState}
                onChange={(e) => setStampState(e.target.value)}
                className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass"
              >
                <option value="Gujarat">Gujarat (4.9% Stamp Duty)</option>
                <option value="Maharashtra">Maharashtra (5.0% Stamp Duty)</option>
                <option value="Delhi">Delhi (6.0% Stamp Duty)</option>
                <option value="Karnataka">Karnataka (5.0% Stamp Duty)</option>
                <option value="Haryana">Haryana (7.0% Stamp Duty)</option>
              </select>
            </div>

            <Input
              label="Property Value (INR)"
              type="number"
              value={propValue}
              onChange={(e) => setPropValue(e.target.value)}
            />

            <div>
              <label className="block text-xs font-label-caps uppercase text-ink-navy mb-1.5">Owner Gender / Ownership</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded bg-surface-container-lowest border border-outline/40 text-ink-navy text-sm focus:outline-none focus:border-warm-brass"
              >
                <option value="male">Male Owner</option>
                <option value="female">Female Owner (Concession applicable)</option>
                <option value="joint">Joint Ownership</option>
              </select>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Calculate Stamp Duty & Registration
            </Button>
          </form>

          <div className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm space-y-4">
            <h3 className="font-headline-sm text-base font-semibold text-ink-navy">Tax & Registration Charges</h3>
            {stampResult ? (
              <div className="space-y-3">
                <StatBlock label="Applicable Stamp Duty Rate" value={`${stampResult.stamp_duty_percentage}%`} />
                <StatBlock label="Stamp Duty Amount" value={formatCurrency(stampResult.stamp_duty_amount)} />
                <StatBlock label="Registration Fee (1%)" value={formatCurrency(stampResult.registration_fee)} />
                <StatBlock label="Total Govt Payable" value={formatCurrency(stampResult.total_tax)} />
              </div>
            ) : (
              <div className="text-xs text-slate-grey text-center py-8">
                Select your state and click calculate to view exact tax obligations.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loan Eligibility Content */}
      {activeTab === 'eligibility' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <form onSubmit={handleCalculateEligibility} className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm space-y-4">
            <h3 className="font-headline-sm text-base font-semibold text-ink-navy">Income & Obligation Parameters</h3>
            <Input
              label="Net Monthly Income (INR)"
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
            />
            <Input
              label="Existing Monthly EMIs (INR)"
              type="number"
              value={existingEmis}
              onChange={(e) => setExistingEmis(e.target.value)}
            />
            <Button type="submit" variant="primary" className="w-full">
              Check Loan Eligibility
            </Button>
          </form>

          <div className="bg-white p-6 rounded-lg border border-surface-variant shadow-sm space-y-4">
            <h3 className="font-headline-sm text-base font-semibold text-ink-navy">Maximum Borrowing Capacity</h3>
            {eligibilityResult ? (
              <div className="space-y-3">
                <StatBlock label="Max Eligible Loan Amount" value={formatCurrency(eligibilityResult.max_eligible_loan)} />
                <StatBlock label="Max Affordable EMI" value={formatCurrency(eligibilityResult.max_affordable_emi)} />
              </div>
            ) : (
              <div className="text-xs text-slate-grey text-center py-8">
                Enter your monthly income to estimate home loan eligibility.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
