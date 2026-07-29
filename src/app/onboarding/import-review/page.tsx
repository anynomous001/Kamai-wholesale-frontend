"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddProductSheet } from '@/components/ui/AddProductSheet';

export default function ImportReview() {
  const router = useRouter();
  const [showAddSheet, setShowAddSheet] = useState(false);

  return (
    <main className="w-full h-full flex flex-col bg-background relative">
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface border-b border-outline-variant/30 shrink-0">
        <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center -ml-2" onClick={() => router.back()}>
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-semibold text-primary truncate text-center flex-1 mx-4">Review your products</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto px-container-margin pt-6 pb-24">
        {/* Header & Progress */}
        <div className="flex justify-between items-center mb-lg gap-sm">
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Import Progress</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-background font-semibold">42</span>
              <span className="font-body-md text-body-md text-on-surface-variant">of 58 reviewed</span>
            </div>
          </div>
          <button className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors py-2 px-4 rounded-full bg-primary-fixed/20 hover:bg-primary-fixed/30 border border-primary-fixed-dim/30">
            Approve all
          </button>
        </div>

        {/* Product List */}
        <div className="flex flex-col gap-md">
          {/* Card 1: Missing Data */}
          <article className="bg-surface rounded-xl p-md border border-outline-variant/30 shadow-[0px_4px_20px_rgba(45,27,20,0.04)] flex flex-row gap-md relative">
            <div className="absolute top-md right-md">
              <input className="kamai-checkbox" type="checkbox" />
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-surface-container-high flex-shrink-0 overflow-hidden relative">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTSI2hF5mitrE31zv4nuC-JOic1FSvJy_q-dXRxcJRe3eE7J2nsMtR0zCBeY0pOBo0-FyOzq78o0SRHeG-UvIi_VI_oDS9INM8hQsfX6MB2aJBtVPAnG11IfdR3I4Y2Cea6WfyCcfd9g7VAIT5Iix4PuTZ2Mp6hh1-lV4OL7dLuhMaMVV8HHa3JNJclEgeFo2Fwui0EkQ7t7oOximXBxSS2Q41EadhIMBO72fy9ER7-Y205vQYDOIViw" />
              <div className="absolute inset-0 bg-yellow-900/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-yellow-700 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-sm">
              <div className="pr-10">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider">Bakery</span>
                  <span className="flex items-center gap-1 text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full font-label-sm text-[10px]">
                    <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span> Missing Category
                  </span>
                </div>
                <h3 className="font-label-md text-label-md text-on-background font-semibold leading-tight">Rustic Sourdough Boule</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-1">Naturally leavened artisan boule with a crisp crust.</p>
              </div>
              <div className="flex justify-between items-end mt-auto pt-sm border-t border-outline-variant/20">
                <div>
                  <span className="font-label-md text-label-md text-on-background font-bold">$4.50</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant"> / unit</span>
                </div>
                <button className="font-label-sm text-label-sm text-primary hover:underline">Edit</button>
              </div>
            </div>
          </article>

          {/* Card 2: Ready */}
          <article className="bg-surface rounded-xl p-md border border-outline-variant/30 shadow-[0px_4px_20px_rgba(45,27,20,0.04)] flex flex-row gap-md relative">
            <div className="absolute top-md right-md">
              <input className="kamai-checkbox" type="checkbox" defaultChecked />
            </div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-surface-container-high flex-shrink-0 overflow-hidden">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgWUYFM6CFxy3fW79g5uifP6S1cqctuxd3WMNUO2I0RzQFDKdVOh54Ocb2-4BMeJJtMrNBrnLtRk8fr5Gjj4P7ycfTwugU0HZZzTNSVHBvggoFLNtAhh1zEsuhakeV9JmvhylmZrmqumgbVTqQHeS6pflrrEVXXRxIV2-YkNG92agIY5XmpSISj6tWUlA1FWYa4M_iiPMUhX1ubiKE12rLPbgvDTSO1wCln0BgGXpqyGiHx1XSkxqAyA" />
            </div>
            <div className="flex-1 flex flex-col gap-sm">
              <div className="pr-10">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-[10px] uppercase tracking-wider">Pastry</span>
                </div>
                <h3 className="font-label-md text-label-md text-on-background font-semibold leading-tight">Classic Butter Croissant</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-1">Traditional French-style butter croissants.</p>
              </div>
              <div className="flex justify-between items-end mt-auto pt-sm border-t border-outline-variant/20">
                <div>
                  <span className="font-label-md text-label-md text-on-background font-bold">$2.10</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant"> / unit</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setShowAddSheet(true)}
        className="absolute bottom-[90px] right-4 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-[0px_4px_12px_rgba(163,57,0,0.4)] flex items-center justify-center hover:bg-primary-container hover:scale-105 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 0" }}>add</span>
      </button>

      {/* Sticky Bottom Action */}
      <div className="absolute bottom-0 left-0 right-0 p-container-margin bg-surface/95 backdrop-blur-md shadow-[0px_-4px_20px_rgba(45,27,20,0.08)] z-50 border-t border-outline-variant/20 shrink-0">
        <button onClick={() => router.push('/onboarding/step-3')} className="w-full h-[56px] rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold shadow-md hover:bg-surface-tint transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-lg">cloud_upload</span>
          Publish Reviewed Products (42)
        </button>
      </div>

      {showAddSheet && <AddProductSheet onClose={() => setShowAddSheet(false)} />}
    </main>
  );
}
