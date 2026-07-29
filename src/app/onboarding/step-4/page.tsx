"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Step4() {
  const router = useRouter();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(20);
  const [customPercentage, setCustomPercentage] = useState<string>("");

  const handleSelectPreset = (value: number) => {
    setSelectedPreset(value);
    setCustomPercentage("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPreset(null);
    setCustomPercentage(e.target.value);
  };

  const effectivePercentage = selectedPreset !== null ? selectedPreset : (parseFloat(customPercentage) || 0);

  return (
    <main className="w-full h-full flex flex-col bg-surface relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-container-margin h-14 border-b border-outline-variant/30 sticky top-0 bg-surface z-10 shrink-0">
        <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors -ml-2" onClick={() => router.back()}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-surface-container-high"></div>
          <div className="w-2 h-2 rounded-full bg-surface-container-high"></div>
          <div className="w-2 h-2 rounded-full bg-surface-container-high"></div>
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <div className="w-2 h-2 rounded-full bg-surface-container-high"></div>
          <div className="w-2 h-2 rounded-full bg-surface-container-high"></div>
          <div className="w-2 h-2 rounded-full bg-surface-container-high"></div>
        </div>
        <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors -mr-2">
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-grow px-container-margin py-lg pb-32 overflow-y-auto">
        <div className="space-y-xl">
          {/* Title & Context */}
          <div className="space-y-sm">
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">Step 4 of 7</span>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Set your advance payment policy.</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Determine how much of the total order value buyers must pay upfront before you begin processing their wholesale request.</p>
          </div>

          {/* Bento Style Preset Selector */}
          <div className="grid grid-cols-2 gap-sm">
            {/* 0% Option */}
            <button onClick={() => handleSelectPreset(0)} className={`relative flex flex-col p-md rounded-lg border text-left transition-all group ${selectedPreset === 0 ? 'border-primary border-2 bg-primary-container/5 shadow-[0px_4px_20px_rgba(45,27,20,0.04)]' : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary'}`}>
              <div className="flex justify-between items-start mb-sm">
                <span className={`font-headline-lg-mobile text-headline-lg-mobile transition-colors ${selectedPreset === 0 ? 'text-primary' : 'text-on-background group-hover:text-primary'}`}>0%</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${selectedPreset === 0 ? 'bg-primary' : 'border-2 border-outline-variant group-hover:border-primary'}`}>
                  {selectedPreset === 0 && <div className="w-2 h-2 rounded-full bg-on-primary"></div>}
                </div>
              </div>
              <span className={`font-label-sm text-label-sm ${selectedPreset === 0 ? 'text-primary' : 'text-on-surface-variant'}`}>Net 30/60</span>
            </button>

            {/* 20% Option */}
            <button onClick={() => handleSelectPreset(20)} className={`relative flex flex-col p-md rounded-lg border text-left transition-all group ${selectedPreset === 20 ? 'border-primary border-2 bg-primary-container/5 shadow-[0px_4px_20px_rgba(45,27,20,0.04)]' : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary'}`}>
              <div className="flex justify-between items-start mb-sm">
                <span className={`font-headline-lg-mobile text-headline-lg-mobile transition-colors ${selectedPreset === 20 ? 'text-primary' : 'text-on-background group-hover:text-primary'}`}>20%</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${selectedPreset === 20 ? 'bg-primary' : 'border-2 border-outline-variant group-hover:border-primary'}`}>
                  {selectedPreset === 20 && <div className="w-2 h-2 rounded-full bg-on-primary"></div>}
                </div>
              </div>
              <span className={`font-label-sm text-label-sm ${selectedPreset === 20 ? 'text-primary' : 'text-on-surface-variant'}`}>Standard Deposit</span>
            </button>

            {/* 50% Option */}
            <button onClick={() => handleSelectPreset(50)} className={`relative flex flex-col p-md rounded-lg border text-left transition-all group ${selectedPreset === 50 ? 'border-primary border-2 bg-primary-container/5 shadow-[0px_4px_20px_rgba(45,27,20,0.04)]' : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary'}`}>
              <div className="flex justify-between items-start mb-sm">
                <span className={`font-headline-lg-mobile text-headline-lg-mobile transition-colors ${selectedPreset === 50 ? 'text-primary' : 'text-on-background group-hover:text-primary'}`}>50%</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${selectedPreset === 50 ? 'bg-primary' : 'border-2 border-outline-variant group-hover:border-primary'}`}>
                  {selectedPreset === 50 && <div className="w-2 h-2 rounded-full bg-on-primary"></div>}
                </div>
              </div>
              <span className={`font-label-sm text-label-sm ${selectedPreset === 50 ? 'text-primary' : 'text-on-surface-variant'}`}>Half Upfront</span>
            </button>

            {/* 100% Option */}
            <button onClick={() => handleSelectPreset(100)} className={`relative flex flex-col p-md rounded-lg border text-left transition-all group ${selectedPreset === 100 ? 'border-primary border-2 bg-primary-container/5 shadow-[0px_4px_20px_rgba(45,27,20,0.04)]' : 'border-outline-variant/50 bg-surface-container-lowest hover:border-primary'}`}>
              <div className="flex justify-between items-start mb-sm">
                <span className={`font-headline-lg-mobile text-headline-lg-mobile transition-colors ${selectedPreset === 100 ? 'text-primary' : 'text-on-background group-hover:text-primary'}`}>100%</span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${selectedPreset === 100 ? 'bg-primary' : 'border-2 border-outline-variant group-hover:border-primary'}`}>
                  {selectedPreset === 100 && <div className="w-2 h-2 rounded-full bg-on-primary"></div>}
                </div>
              </div>
              <span className={`font-label-sm text-label-sm ${selectedPreset === 100 ? 'text-primary' : 'text-on-surface-variant'}`}>Pay in Full</span>
            </button>
          </div>

          {/* Custom Input */}
          <div className="space-y-sm">
            <label className="font-label-md text-label-md text-on-background block" htmlFor="custom-percentage">Custom Percentage</label>
            <div className="relative flex items-center">
              <input 
                className="w-full h-[56px] px-md py-sm bg-surface-container-lowest border border-[#2D1B14] border-opacity-12 rounded-lg font-body-lg text-body-lg text-on-background placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all pr-12" 
                id="custom-percentage" 
                placeholder="Enter %" 
                type="number" 
                value={customPercentage}
                onChange={handleCustomChange}
              />
              <span className="absolute right-md font-body-lg text-body-lg text-on-surface-variant">%</span>
            </div>
          </div>

          {/* Dynamic Explainer Card */}
          <div className="bg-surface-variant rounded-lg p-md flex items-start space-x-md">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-secondary-container">info</span>
            </div>
            <div>
              <h4 className="font-label-md text-label-md text-on-background mb-xs">How this works for a $500 order:</h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                The buyer will be charged <strong className="text-on-background">${(500 * (effectivePercentage / 100)).toFixed(2)}</strong> immediately upon order confirmation. 
                The remaining <strong className="text-on-background">${(500 * (1 - (effectivePercentage / 100))).toFixed(2)}</strong> will be invoiced according to your standard payment terms.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 w-full p-container-margin bg-surface border-t border-outline-variant/30 shadow-[0px_-4px_20px_rgba(45,27,20,0.04)] z-20 shrink-0">
        <button onClick={() => router.push('/onboarding/go-live')} className="w-full h-[56px] flex items-center justify-center bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md rounded-lg transition-colors shadow-[0px_4px_20px_rgba(45,27,20,0.08)]">
          Save &amp; Continue
        </button>
      </div>
    </main>
  );
}
