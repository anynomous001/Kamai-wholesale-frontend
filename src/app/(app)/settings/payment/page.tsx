"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile } from '@/lib/api/profile';
import { ApiError, fieldErrorsFrom } from '@/lib/api/client';

const PRESETS = [0, 20, 50, 100];

export default function PaymentSettings() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(20);
  const [customPercentage, setCustomPercentage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        if (PRESETS.includes(profile.advancePercentage)) {
          setSelectedPreset(profile.advancePercentage);
        } else {
          setSelectedPreset(null);
          setCustomPercentage(String(profile.advancePercentage));
        }
      } catch {
        setFormError('Could not load your payment policy.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSelectPreset = (value: number) => {
    setSelectedPreset(value);
    setCustomPercentage('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPreset(null);
    setCustomPercentage(e.target.value);
  };

  const effectivePercentage = selectedPreset !== null ? selectedPreset : (parseFloat(customPercentage) || 0);

  const handleSave = async () => {
    setFormError(null);
    setFieldError(null);
    setIsSaving(true);
    try {
      await updateProfile({ advancePercentage: Math.round(effectivePercentage) });
      router.push('/settings');
    } catch (err) {
      if (err instanceof ApiError) {
        const errors = fieldErrorsFrom(err);
        setFieldError(errors.advancePercentage ?? null);
        setFormError(err.validationIssues ? (errors.advancePercentage ?? 'Please check the percentage entered.') : err.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="w-full flex-1 min-h-0 flex flex-col bg-surface relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-container-margin h-14 border-b border-border sticky top-0 bg-surface z-10 shrink-0">
        <button className="w-10 h-10 flex items-center justify-center text-text-secondary hover:bg-background rounded-full transition-colors -ml-2" onClick={() => router.push('/settings')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-text-primary">Payment Policy</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <div className="flex-grow px-container-margin py-lg pb-32 overflow-y-auto kamai-scrollbar">
        <div className="space-y-xl">
          {/* Title & Context */}
          <div className="space-y-sm">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">Set your advance payment policy.</h2>
            <p className="font-body-md text-body-md text-text-secondary">Determine how much of the total order value buyers must pay upfront before you begin processing their wholesale request.</p>
          </div>

          {formError && (
            <div className="bg-error-bg border border-error-border rounded-lg px-4 py-3">
              <p className="text-body-sm text-error-text">{formError}</p>
            </div>
          )}

          {/* Bento Style Preset Selector */}
          <div className="grid grid-cols-2 gap-sm">
            {[
              { value: 0, label: 'Net 30/60' },
              { value: 20, label: 'Standard Deposit' },
              { value: 50, label: 'Half Upfront' },
              { value: 100, label: 'Pay in Full' },
            ].map(({ value, label }) => (
              <button key={value} onClick={() => handleSelectPreset(value)} className={`relative flex flex-col p-md rounded-lg border text-left transition-all group ${selectedPreset === value ? 'border-accent border-2 bg-accent/5 shadow-[0px_4px_20px_rgba(45,27,20,0.04)]' : 'border-border bg-background hover:border-accent'}`}>
                <div className="flex justify-between items-start mb-sm">
                  <span className={`font-headline-lg-mobile text-headline-lg-mobile transition-colors ${selectedPreset === value ? 'text-accent' : 'text-text-primary group-hover:text-accent'}`}>{value}%</span>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${selectedPreset === value ? 'bg-accent' : 'border-2 border-border group-hover:border-accent'}`}>
                    {selectedPreset === value && <div className="w-2 h-2 rounded-full bg-white"></div>}
                  </div>
                </div>
                <span className={`font-label-sm text-label-sm ${selectedPreset === value ? 'text-accent' : 'text-text-secondary'}`}>{label}</span>
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="space-y-sm">
            <label className="font-label-md text-label-md text-text-primary block" htmlFor="custom-percentage">Custom Percentage</label>
            <div className="relative flex items-center">
              <input
                className={`w-full h-[56px] px-md py-sm bg-background border rounded-lg font-body-lg text-body-lg text-text-primary placeholder:text-text-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all pr-12 ${fieldError ? 'border-error-text' : 'border-border'}`}
                id="custom-percentage"
                placeholder="Enter %"
                type="number"
                min="0"
                max="100"
                value={customPercentage}
                onChange={handleCustomChange}
              />
              <span className="absolute right-md font-body-lg text-body-lg text-text-secondary">%</span>
            </div>
            {fieldError && <p className="text-body-sm text-error-text">{fieldError}</p>}
          </div>

          {/* Dynamic Explainer Card */}
          <div className="bg-background rounded-lg p-md flex items-start space-x-md">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-accent">info</span>
            </div>
            <div>
              <h4 className="font-label-md text-label-md text-text-primary mb-xs">How this works for a ₹500 order:</h4>
              <p className="font-body-sm text-body-sm text-text-secondary">
                The buyer will be charged <strong className="text-text-primary">₹{(500 * (effectivePercentage / 100)).toFixed(2)}</strong> immediately upon order confirmation.
                The remaining <strong className="text-text-primary">₹{(500 * (1 - (effectivePercentage / 100))).toFixed(2)}</strong> will be invoiced according to your standard payment terms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 w-full p-container-margin bg-surface border-t border-border shadow-[0px_-4px_20px_rgba(45,27,20,0.04)] z-20 shrink-0">
        <button onClick={handleSave} disabled={isLoading || isSaving} className="w-full h-[56px] flex items-center justify-center bg-accent hover:bg-accent-hover text-white font-label-md text-label-md rounded transition-colors shadow-[0px_4px_20px_rgba(45,27,20,0.08)] disabled:opacity-60">
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </main>
  );
}
