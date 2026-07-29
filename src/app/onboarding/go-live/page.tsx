"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

export default function GoLive() {
  const router = useRouter();

  return (
    <main className="w-full h-full flex flex-col bg-background relative pb-24 overflow-y-auto">
      {/* TopAppBar */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface border-b border-outline-variant/30 shrink-0">
        <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center -ml-2" onClick={() => router.back()}>
          <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary text-center flex-1">Go-Live</h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      {/* Main Canvas */}
      <div className="pt-6 px-container-margin flex flex-col">
        {/* Hero Header */}
        <div className="mb-8 text-left">
          <h2 className="font-headline-xl text-headline-xl text-on-background mb-sm">You're almost live.</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Complete these final steps to launch your wholesale portal and start accepting orders.</p>
        </div>

        {/* Checklist Bento Grid */}
        <div className="grid grid-cols-1 gap-md">
          {/* Checklist Item 1: Profile (Done) */}
          <div className="bg-surface rounded-xl p-lg border border-outline-variant/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Profile</h3>
              </div>
              <a className="font-label-md text-label-md text-primary hover:underline" href="#">Edit</a>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md flex-1">Your bakery details, branding, and contact information are set.</p>
            <div className="w-full bg-surface-container-low rounded-full h-1.5 mt-auto">
              <div className="bg-primary h-1.5 rounded-full w-full"></div>
            </div>
          </div>

          {/* Checklist Item 2: Catalogue (Pending) */}
          <div className="bg-surface rounded-xl p-lg border border-outline-variant/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow ring-1 ring-primary-container/20">
            <div className="flex items-start justify-between mb-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-outline text-[28px]">radio_button_unchecked</span>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Catalogue</h3>
              </div>
              <a className="font-label-md text-label-md text-primary hover:underline" href="#">Edit</a>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md flex-1">Add at least 3 products to your wholesale offering.</p>
            <div className="w-full bg-surface-container-low rounded-full h-1.5 mt-auto">
              <div className="bg-primary h-1.5 rounded-full w-1/3"></div>
            </div>
          </div>

          {/* Checklist Item 3: Fulfilment (Done) */}
          <div className="bg-surface rounded-xl p-lg border border-outline-variant/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Fulfilment</h3>
              </div>
              <a className="font-label-md text-label-md text-primary hover:underline" href="#">Edit</a>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md flex-1">Delivery zones, minimum order values, and schedules are configured.</p>
            <div className="w-full bg-surface-container-low rounded-full h-1.5 mt-auto">
              <div className="bg-primary h-1.5 rounded-full w-full"></div>
            </div>
          </div>

          {/* Checklist Item 4: Payment (Pending) */}
          <div className="bg-surface rounded-xl p-lg border border-outline-variant/30 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow ring-1 ring-primary-container/20">
            <div className="flex items-start justify-between mb-md">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-outline text-[28px]">radio_button_unchecked</span>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Payment</h3>
              </div>
              <a className="font-label-md text-label-md text-primary hover:underline" href="#">Edit</a>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md flex-1">Connect your bank account to receive wholesale payments.</p>
            <div className="w-full bg-surface-container-low rounded-full h-1.5 mt-auto">
              <div className="bg-primary h-1.5 rounded-full w-0"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Area */}
      <div className="absolute bottom-0 left-0 w-full bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 p-container-margin z-40 pb-safe shrink-0">
        <button onClick={() => router.push('/dashboard')} className="w-full h-14 bg-primary text-on-primary font-label-md text-label-md rounded-full flex items-center justify-center gap-sm shadow-[0px_4px_20px_rgba(45,27,20,0.08)]">
          <span className="material-symbols-outlined">rocket_launch</span>
          Go Live
        </button>
      </div>
    </main>
  );
}
