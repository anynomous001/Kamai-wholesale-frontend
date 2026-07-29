"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function Step1() {
  const router = useRouter();
  const [radius, setRadius] = useState(25);
  const [alwaysAvailable, setAlwaysAvailable] = useState(false);

  return (
    <main className="w-full h-full flex flex-col bg-background relative">
      {/* Top Navigation */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 shrink-0">
        <button className="text-on-surface-variant hover:bg-surface-container-low rounded-full p-2 transition-transform duration-200 active:scale-95 flex items-center justify-center -ml-2" onClick={() => router.back()}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-headline-lg-mobile font-bold text-on-surface absolute left-1/2 -translate-x-1/2">Step 1 of 7</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 overflow-y-auto px-container-margin pt-6 pb-24">
        <div className="mb-8">
          <h2 className="text-headline-xl text-on-surface mb-2">Tell us about your business.</h2>
          <p className="text-body-md text-on-surface-variant">This information will be displayed to your wholesale customers in the Kamai catalogue.</p>
        </div>

        <form className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2">Business Logo</label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-outline-variant border-dashed rounded-xl cursor-pointer bg-surface-container-lowest hover:bg-surface-container-low transition-colors" htmlFor="dropzone-file">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <span className="material-symbols-outlined text-on-surface-variant mb-2 text-3xl">add_photo_alternate</span>
                  <p className="mb-1 text-label-md text-on-surface-variant"><span className="font-bold">Click to upload</span> or drag and drop</p>
                  <p className="text-body-sm text-on-surface-variant/70">SVG, PNG, JPG (MAX. 800x400px)</p>
                </div>
                <input className="hidden" id="dropzone-file" type="file" />
              </label>
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2" htmlFor="business-name">Business Name</label>
            <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50" id="business-name" placeholder="e.g. Acme Bakery Supplies" type="text" />
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2" htmlFor="contact-email">Contact Email</label>
            <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50 mb-4" id="contact-email" placeholder="hello@acmebakery.com" type="email" />
            <label className="block text-label-md text-on-surface-variant mb-2" htmlFor="contact-phone">Contact Phone</label>
            <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50" id="contact-phone" placeholder="(555) 123-4567" type="tel" />
          </div>

          {/* Business Type Dropdown */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2" htmlFor="business-type">Business Type</label>
            <div className="relative">
              <select className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-4 py-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50 appearance-none" id="business-type" defaultValue="">
                <option disabled value="">Select your primary business type</option>
                <option value="supplier">Ingredients Supplier</option>
                <option value="equipment">Equipment Vendor</option>
                <option value="distributor">Wholesale Distributor</option>
                <option value="bakery">Commercial Bakery</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          {/* Address Picker (Simplified) */}
          <div>
            <label className="block text-label-md text-on-surface-variant mb-2" htmlFor="address">Business Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-on-surface-variant">location_on</span>
              </div>
              <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-3 pr-4 pl-10 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors placeholder:text-on-surface-variant/50" id="address" placeholder="Search for address" type="text" />
            </div>
          </div>

          {/* Delivery Radius Slider */}
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-label-md text-on-surface-variant mb-0" htmlFor="radius-slider">Delivery Radius</label>
              <span className="text-label-md text-primary bg-primary-container/10 px-3 py-1 rounded-full">{radius} miles</span>
            </div>
            <input 
              className="w-full kamai-range" 
              id="radius-slider" 
              max="100" 
              min="5" 
              type="range" 
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
            />
            <div className="flex justify-between text-body-sm text-on-surface-variant/70 mt-2">
              <span>5 mi</span>
              <span>100 mi</span>
            </div>
          </div>

          {/* Business Hours */}
          <div className="border border-outline-variant/50 rounded-xl p-lg bg-surface-container-lowest">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-label-md text-on-surface-variant mb-0">Business Hours</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" checked={alwaysAvailable} onChange={(e) => setAlwaysAvailable(e.target.checked)} />
                <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-3 text-label-sm text-on-surface-variant">Always available</span>
              </label>
            </div>
            
            <div className="space-y-4 transition-opacity" style={{ opacity: alwaysAvailable ? 0.5 : 1, pointerEvents: alwaysAvailable ? 'none' : 'auto' }}>
              {/* Monday */}
              <div className="flex items-center space-x-4">
                <span className="w-12 text-body-sm text-on-surface-variant">Mon</span>
                <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2 px-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" type="time" defaultValue="09:00" />
                <span className="text-on-surface-variant">-</span>
                <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2 px-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" type="time" defaultValue="17:00" />
              </div>
              {/* Tuesday */}
              <div className="flex items-center space-x-4">
                <span className="w-12 text-body-sm text-on-surface-variant">Tue</span>
                <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2 px-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" type="time" defaultValue="09:00" />
                <span className="text-on-surface-variant">-</span>
                <input className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg py-2 px-3 text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" type="time" defaultValue="17:00" />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Bottom Anchored Primary Action */}
      <div className="absolute bottom-0 left-0 w-full p-container-margin bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 shadow-[0px_-4px_20px_rgba(45,27,20,0.08)] z-10 shrink-0">
        <Button variant="primary" className="w-full rounded-full" onClick={() => router.push('/onboarding/step-2')}>
          Continue to Step 2
        </Button>
      </div>
    </main>
  );
}
