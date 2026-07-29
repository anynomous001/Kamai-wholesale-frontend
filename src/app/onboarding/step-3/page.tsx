"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Step3() {
  const router = useRouter();
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [pickupEnabled, setPickupEnabled] = useState(false);

  return (
    <main className="w-full h-full flex flex-col bg-background relative">
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 shrink-0">
        <button className="flex items-center justify-center p-2 text-primary hover:bg-surface-container-low rounded-full transition-colors -ml-2" onClick={() => router.back()}>
          <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">Fulfilment Rules</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto px-container-margin pt-6 pb-24 flex flex-col gap-lg">
        {/* Progress Indicator */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant">
            <span>Step 3 of 7</span>
            <span>40%</span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '42%' }}></div>
          </div>
        </div>

        <section className="flex flex-col gap-4">
          <h2 className="font-headline-xl text-headline-xl text-on-background">How will bakers get their order?</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Configure your delivery and pickup options to let customers know how they can receive their goods.</p>
        </section>

        {/* Delivery Option Card */}
        <div className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-md shadow-[0px_4px_20px_rgba(45,27,20,0.04)]">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-secondary-container rounded-lg flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined" data-icon="local_shipping" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface">Delivery</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Deliver to their address</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input className="sr-only peer" type="checkbox" checked={deliveryEnabled} onChange={(e) => setDeliveryEnabled(e.target.checked)} />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className={`border-t border-outline-variant/50 pt-4 flex flex-col gap-4 transition-opacity ${deliveryEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Delivery Radius (km)</label>
                <input className="bg-surface-bright border border-outline/30 text-on-surface font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none" type="number" defaultValue="15" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Base Charge (₹)</label>
                <input className="bg-surface-bright border border-outline/30 text-on-surface font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none" type="number" defaultValue="10.00" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Minimum Order (₹)</label>
                <input className="bg-surface-bright border border-outline/30 text-on-surface font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none" type="number" defaultValue="50.00" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Free Delivery Threshold (₹)</label>
                <input className="bg-surface-bright border border-outline/30 text-on-surface font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none" type="number" defaultValue="150.00" />
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Estimated Delivery Time</label>
              <input className="bg-surface-bright border border-outline/30 text-on-surface font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none w-full" type="text" defaultValue="2-3 Business Days" />
            </div>
          </div>
        </div>

        {/* Pickup Option Card */}
        <div className="bg-surface border border-outline-variant rounded-xl p-lg flex flex-col gap-md shadow-[0px_4px_20px_rgba(45,27,20,0.04)] mb-8">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center text-on-surface-variant shrink-0">
                <span className="material-symbols-outlined" data-icon="storefront">storefront</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface">Pickup</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Collect from bakery</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input className="sr-only peer" type="checkbox" checked={pickupEnabled} onChange={(e) => setPickupEnabled(e.target.checked)} />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className={`border-t border-outline-variant/50 pt-4 flex flex-col gap-4 transition-opacity ${pickupEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm text-on-surface-variant">Pickup Location</label>
              <textarea className="bg-surface-bright border border-outline/30 text-on-surface font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none w-full resize-none" rows={3} defaultValue="123 Bakery Lane, Pastry District\nCityville, ST 12345" />
            </div>
            <button className="self-start font-label-md text-label-md text-primary flex items-center gap-1 hover:underline">
              <span className="material-symbols-outlined text-[18px]" data-icon="edit">edit</span> Edit Location Details
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar (Mobile Sticky) */}
      <div className="absolute bottom-0 left-0 w-full z-40 bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 p-container-margin shrink-0">
        <button onClick={() => router.push('/onboarding/step-4')} className="w-full h-14 bg-primary text-on-primary font-label-md text-label-md rounded-xl shadow-[0px_4px_20px_rgba(45,27,20,0.08)] hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center gap-2">
          Save &amp; Continue
          <span className="material-symbols-outlined text-[18px]" data-icon="arrow_forward">arrow_forward</span>
        </button>
      </div>
    </main>
  );
}
