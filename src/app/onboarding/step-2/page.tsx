"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function Step2() {
  const router = useRouter();

  return (
    <main className="w-full h-full flex flex-col bg-background relative overflow-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface border-b border-outline-variant/30 shrink-0">
        <button className="text-primary hover:bg-surface-container-low rounded-full p-2 transition-transform duration-200 active:scale-95 flex items-center justify-center -ml-2" onClick={() => router.back()}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </button>
        <h1 className="text-headline-lg-mobile font-bold text-primary absolute left-1/2 -translate-x-1/2">Catalogue</h1>
        <button className="w-10 h-10 flex items-center justify-center text-primary rounded-full hover:bg-surface-container-low transition-colors -mr-2">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
        </button>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 overflow-y-auto pt-4 pb-lg px-container-margin flex flex-col">
        {/* Step Indicator */}
        <div className="pt-lg pb-sm">
          <p className="font-label-md text-label-md text-primary mb-xs">Step 2 of 7</p>
          <div className="h-1 bg-surface-container-highest rounded-full w-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: '28.5%' }}></div>
          </div>
        </div>

        {/* Header */}
        <div className="py-md text-center">
          <h2 className="font-headline-xl text-headline-xl text-on-background">How do you want to add your products?</h2>
        </div>

        {/* Options Grid */}
        <div className="flex-1 flex flex-col gap-md py-md h-full">
          {/* Option 1: Import */}
          <button onClick={() => router.push('/onboarding/import-review')} className="group flex flex-col items-center text-center p-lg bg-surface rounded-xl border border-[#2D1B14]/12 hover:border-primary hover:bg-surface-container-low hover:shadow-level-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mb-md group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>upload_file</span>
            </div>
            <h3 className="font-label-md text-label-md text-on-background mb-sm">Import my price list</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Upload your existing spreadsheet.</p>
          </button>

          {/* Option 2: Search Kamai */}
          <button className="group flex flex-col items-center text-center p-lg bg-surface rounded-xl border border-[#2D1B14]/12 hover:border-primary hover:bg-surface-container-low hover:shadow-level-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mb-md group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
            </div>
            <h3 className="font-label-md text-label-md text-on-background mb-sm">Pick from Kamai's catalogue</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Search our pre-filled database.</p>
          </button>

          {/* Option 3: Manual */}
          <button onClick={() => router.push('/onboarding/add-product')} className="group flex flex-col items-center text-center p-lg bg-surface rounded-xl border border-[#2D1B14]/12 hover:border-primary hover:bg-surface-container-low hover:shadow-level-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
            <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container mb-md group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>edit_document</span>
            </div>
            <h3 className="font-label-md text-label-md text-on-background mb-sm">Add manually</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Create items one by one.</p>
          </button>
        </div>
      </div>
    </main>
  );
}
