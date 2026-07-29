"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddProduct() {
  const router = useRouter();
  const [urgencyToggle, setUrgencyToggle] = useState(false);

  return (
    <main className="w-full h-full flex justify-center bg-[url('https://images.unsplash.com/photo-1555529733-0e670560f7e1?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden">
      {/* Scrim */}
      <div className="absolute inset-0 bg-on-background/40 z-40 backdrop-blur-sm animate-in fade-in duration-300"></div>

      {/* Overlay Container */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[24px] z-50 h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-[0px_-4px_20px_rgba(45,27,20,0.08)]">
        {/* Header */}
        <div className="flex items-center justify-between px-container-margin py-md border-b border-outline-variant/30 shrink-0">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Add Product</h2>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors flex items-center justify-center -mr-2" onClick={() => router.back()}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto px-container-margin py-lg pb-[100px] space-y-xl">
          {/* Image Placeholder */}
          <div className="flex justify-center">
            <button className="w-[120px] h-[120px] rounded-xl border border-dashed border-outline bg-surface-container-low flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors">
              <span className="material-symbols-outlined mb-2 text-[32px]" style={{ fontVariationSettings: "'FILL' 0" }}>add_photo_alternate</span>
              <span className="font-label-sm text-label-sm">Add Photo</span>
            </button>
          </div>

          {/* Basic Info Section */}
          <div className="space-y-lg">
            <div className="space-y-xs">
              <label className="font-label-md text-label-md text-on-surface block">Product Name</label>
              <input className="w-full bg-surface-container-low border border-[#2D1B14]/12 rounded-lg px-md py-[14px] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50" placeholder="e.g., Artisan Sourdough Flour" type="text" />
            </div>

            <div className="grid grid-cols-2 gap-gutter">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface block">Category</label>
                <div className="relative">
                  <select className="w-full bg-surface-container-low border border-[#2D1B14]/12 rounded-lg pl-md pr-10 py-[14px] font-body-md text-body-md text-on-surface appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" defaultValue="">
                    <option disabled value="">Select...</option>
                    <option>Flours</option>
                    <option>Sugars</option>
                    <option>Dairy</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">arrow_drop_down</span>
                </div>
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface block">Brand</label>
                <input className="w-full bg-surface-container-low border border-[#2D1B14]/12 rounded-lg px-md py-[14px] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50" placeholder="e.g., Kamai" type="text" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-gutter">
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface block">Unit / Size</label>
                <input className="w-full bg-surface-container-low border border-[#2D1B14]/12 rounded-lg px-md py-[14px] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50" placeholder="e.g., 25kg Sack" type="text" />
              </div>
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface block">Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-md top-1/2 -translate-y-1/2 font-body-md text-on-surface-variant/70">₹</span>
                  <input className="w-full bg-surface-container-low border border-[#2D1B14]/12 rounded-lg pl-8 pr-md py-[14px] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50" placeholder="0.00" type="number" />
                </div>
              </div>
            </div>

            <button className="flex items-center text-primary hover:text-primary-container transition-colors py-sm">
              <span className="material-symbols-outlined mr-sm text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>add_circle</span>
              <span className="font-label-md text-label-md">Add variant</span>
            </button>
          </div>

          <hr className="border-outline-variant/30" />

          {/* Status Section */}
          <div className="space-y-md">
            <label className="font-label-md text-label-md text-on-surface block">Inventory Status</label>
            <div className="flex bg-surface-container-highest p-1 rounded-lg">
              <label className="flex-1 cursor-pointer">
                <input className="peer sr-only" name="status" type="radio" defaultChecked />
                <div className="text-center py-2 rounded-md font-label-md text-label-md text-on-surface-variant transition-all peer-checked:bg-surface peer-checked:text-[#146c2e] peer-checked:shadow-sm">
                  Available
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input className="peer sr-only" name="status" type="radio" />
                <div className="text-center py-2 rounded-md font-label-md text-label-md text-on-surface-variant transition-all peer-checked:bg-surface peer-checked:text-[#9e6a03] peer-checked:shadow-sm">
                  Limited
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input className="peer sr-only" name="status" type="radio" />
                <div className="text-center py-2 rounded-md font-label-md text-label-md text-on-surface-variant transition-all peer-checked:bg-surface peer-checked:text-error peer-checked:shadow-sm">
                  Out of Stock
                </div>
              </label>
            </div>
          </div>

          {/* Urgency Settings */}
          <div className="space-y-md bg-surface-container-low p-md rounded-xl border border-[#2D1B14]/5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-label-md text-label-md text-on-surface">Urgency Banner</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Display a warning on the product card.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" checked={urgencyToggle} onChange={(e) => setUrgencyToggle(e.target.checked)} />
                <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            {urgencyToggle && (
              <div className="space-y-xs pt-sm animate-in fade-in slide-in-from-top-2 duration-200">
                <label className="font-label-md text-label-md text-on-surface block">Banner Text</label>
                <input className="w-full bg-surface border border-[#2D1B14]/12 rounded-lg px-md py-[14px] font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50" placeholder="e.g., Only 5 bags left!" type="text" />
              </div>
            )}
          </div>
        </div>

        {/* Sticky Bottom Action */}
        <div className="absolute bottom-0 left-0 right-0 p-container-margin bg-surface border-t border-outline-variant/30 shadow-[0px_-4px_20px_rgba(45,27,20,0.04)] z-10 flex items-center justify-center shrink-0">
          <button onClick={() => router.push('/onboarding/step-3')} className="w-full bg-primary text-on-primary h-[56px] rounded-xl font-label-md text-label-md flex items-center justify-center hover:bg-primary-container transition-colors shadow-sm">
            Save Product
          </button>
        </div>
      </div>
    </main>
  );
}
