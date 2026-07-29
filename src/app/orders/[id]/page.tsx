"use client";
import React from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function OrderDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // E.g., 'KW-8492'

  return (
    <main className="w-full h-full bg-surface flex flex-col relative z-10 overflow-hidden">
      {/* TopAppBar */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface border-b border-outline-variant/30 shrink-0">
        <div className="flex items-center gap-sm text-primary">
          <span className="w-6"></span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary text-center flex-1">
          #ORD-2024-{id ? id.replace('KW-', '') : '892'}
        </h1>
        <button 
          onClick={() => router.back()}
          className="flex items-center justify-center p-sm text-on-surface-variant hover:bg-surface-container-highest rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-container-margin space-y-lg mt-md">
        {/* Buyer Info */}
        <section className="bg-surface-container-lowest rounded-lg p-md border border-outline-variant/30 flex items-center justify-between">
          <div>
            <h2 className="font-label-md text-label-md text-on-surface mb-xs">Eleanor's Patisserie</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Eleanor Vance</p>
          </div>
          <a className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container hover:bg-secondary transition-colors hover:text-on-secondary" href="tel:+15551234567">
            <span className="material-symbols-outlined">call</span>
          </a>
        </section>

        {/* Itemized List */}
        <section className="space-y-sm">
          <h3 className="font-label-md text-label-md text-on-surface mb-sm">Items</h3>
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 divide-y divide-outline-variant/30">
            {/* Item 1 */}
            <div className="p-md flex gap-md items-start">
              <div 
                className="bg-cover bg-center w-16 h-16 rounded-md border border-outline-variant/20 flex-shrink-0" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCr8Y_WVdsZ_DZ81_aE5UmP968zQWIX0nsgm1FONAGOaxEmhIfR9kbvn7LV3pLFJa0DDa8zo_XULpSVKYcLy5m_WW7C0TSSNoe8RDoU8Gv5YeaxFmVrUsj5UAPr5vQE_D5vPodPbeIBfmeIeIwjIkYw3rhHmzmOYhbeXEjeJ5qJLiH_zs7zjR7OMLukdPnyrIWRKpVlrD9Vw5NjtRx8H5xdJhBjxkeIfBQelk5bGU33daVabZM04PUwxQ')" }}
              ></div>
              <div className="flex-1">
                <h4 className="font-label-md text-label-md text-on-surface">Artisan Bread Flour (50lb)</h4>
                <div className="flex justify-between items-center mt-xs">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Qty: 4</span>
                  <span className="font-label-md text-label-md text-on-surface">$32.00</span>
                </div>
                <div className="text-right mt-xs font-label-md text-label-md text-primary">
                  $128.00
                </div>
              </div>
            </div>
            
            {/* Item 2 */}
            <div className="p-md flex gap-md items-start">
              <div 
                className="bg-cover bg-center w-16 h-16 rounded-md border border-outline-variant/20 flex-shrink-0" 
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC3swP7JGHnAvqzogU-sOlGOxCxzqRLaMaa9FKmrIdvoJXHvDTH1hzXrNNFzb0JCiSTfxM-72H63iG3OnEFkdaFwIfsJpURowGaTwKY4vCyTOs8dlVvPIvSd2x4WMwPpnsdfckfl9wAalVW9BAWV2Cx86W3bW-CeQ4qKtWHR2wQMwizKnkHtKmvElvg24rKZlPIneZvrUBMmxJ7cKIFBzmyDcSAV6vwQ56JWsnZd3XBXPFLXHVE_mhhJg')" }}
              ></div>
              <div className="flex-1">
                <h4 className="font-label-md text-label-md text-on-surface">Unsalted European Butter (10lb)</h4>
                <div className="flex justify-between items-center mt-xs">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">Qty: 2</span>
                  <span className="font-label-md text-label-md text-on-surface">$55.00</span>
                </div>
                <div className="text-right mt-xs font-label-md text-label-md text-primary">
                  $110.00
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Totals */}
          <div className="bg-surface-container-lowest rounded-lg p-md border border-outline-variant/30 mt-sm">
            <div className="flex justify-between items-center mb-xs font-body-sm text-body-sm text-on-surface-variant">
              <span>Subtotal</span>
              <span>$238.00</span>
            </div>
            <div className="flex justify-between items-center mb-sm font-body-sm text-body-sm text-on-surface-variant">
              <span>Delivery</span>
              <span>$15.00</span>
            </div>
            <div className="flex justify-between items-center pt-sm border-t border-outline-variant/30">
              <span className="font-label-md text-label-md text-on-surface">Total</span>
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">$253.00</span>
            </div>
          </div>
        </section>

        {/* Fulfilment Info */}
        <section className="bg-surface-container-lowest rounded-lg p-md border border-outline-variant/30">
          <div className="flex items-center gap-sm mb-sm text-on-surface">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            <h3 className="font-label-md text-label-md">Fulfilment</h3>
          </div>
          <div className="space-y-xs font-body-sm text-body-sm text-on-surface-variant">
            <p>Requested Delivery: Tomorrow, 6:00 AM - 8:00 AM</p>
            <p>Notes: Please leave by the back kitchen door.</p>
          </div>
        </section>

        {/* Advance Payment Toggle */}
        <section className="bg-surface-container-lowest rounded-lg p-md border border-outline-variant/30 flex items-center justify-between">
          <div>
            <h3 className="font-label-md text-label-md text-on-surface">Require Advance Payment</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Send an invoice before fulfilment.</p>
          </div>
          {/* Simple Custom Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input className="sr-only peer" type="checkbox" value="" />
            <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </section>
      </div>

      {/* Sticky Footer Action */}
      <div className="absolute bottom-0 left-0 w-full p-container-margin bg-surface border-t border-outline-variant/30 shadow-[0px_-4px_20px_rgba(45,27,20,0.08)] z-50 shrink-0">
        <button 
          onClick={() => router.push('/orders')}
          className="w-full h-[56px] bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-sm hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          Accept Order
        </button>
      </div>
    </main>
  );
}
