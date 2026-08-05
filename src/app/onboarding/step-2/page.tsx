"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MasterCatalogueSearchSheet } from '@/components/ui/MasterCatalogueSearchSheet';

export default function Step2() {
  const router = useRouter();
  const [showMasterSearch, setShowMasterSearch] = useState(false);

  return (
    <main className="w-full h-full flex flex-col bg-background relative overflow-hidden">
      {/* Top Navigation */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface border-b border-border shrink-0">
        <button className="text-accent hover:bg-background rounded-full p-2 transition-transform duration-200 active:scale-95 flex items-center justify-center -ml-2" onClick={() => router.back()}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>arrow_back</span>
        </button>
        <h1 className="text-headline-lg-mobile font-bold text-accent absolute left-1/2 -translate-x-1/2">Catalogue</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 overflow-y-auto kamai-scrollbar pt-4 pb-lg px-container-margin flex flex-col">
        {/* Step Indicator */}
        <div className="pt-lg pb-sm">
          <p className="font-label-md text-label-md text-accent mb-xs">Step 2 of 4</p>
          <div className="h-1 bg-surface rounded-full w-full overflow-hidden">
            <div className="h-full bg-accent rounded-full" style={{ width: '50%' }}></div>
          </div>
        </div>

        {/* Header */}
        <div className="py-md text-center">
          <h2 className="font-headline-xl text-headline-xl text-text-primary">How do you want to add your products?</h2>
        </div>

        {/* Options Grid */}
        <div className="flex-1 flex flex-col gap-md py-md h-full">
          {/* Option 1: Import */}
          <button onClick={() => router.push('/onboarding/import-review')} className="group flex flex-col items-center text-center p-lg bg-surface rounded-lg border border-border hover:border-accent hover:bg-background hover:shadow-level-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-md group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>upload_file</span>
            </div>
            <h3 className="font-label-md text-label-md text-text-primary mb-sm">Import my price list</h3>
            <p className="font-body-sm text-body-sm text-text-secondary">Upload your existing spreadsheet or photo.</p>
          </button>

          {/* Option 2: Search Kamai */}
          <button onClick={() => setShowMasterSearch(true)} className="group flex flex-col items-center text-center p-lg bg-surface rounded-lg border border-border hover:border-accent hover:bg-background hover:shadow-level-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-md group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>search</span>
            </div>
            <h3 className="font-label-md text-label-md text-text-primary mb-sm">Pick from Kamai&apos;s catalogue</h3>
            <p className="font-body-sm text-body-sm text-text-secondary">Search our pre-filled database.</p>
          </button>

          {/* Option 3: Manual */}
          <button onClick={() => router.push('/onboarding/add-product')} className="group flex flex-col items-center text-center p-lg bg-surface rounded-lg border border-border hover:border-accent hover:bg-background hover:shadow-level-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-md group-hover:scale-110 transition-transform duration-300">
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>edit_document</span>
            </div>
            <h3 className="font-label-md text-label-md text-text-primary mb-sm">Add manually</h3>
            <p className="font-body-sm text-body-sm text-text-secondary">Create items one by one.</p>
          </button>
        </div>
      </div>

      {showMasterSearch && (
        <MasterCatalogueSearchSheet
          onClose={() => setShowMasterSearch(false)}
          onContinue={() => router.push('/onboarding/step-3')}
        />
      )}
    </main>
  );
}
