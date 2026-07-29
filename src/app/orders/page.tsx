"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';
import Link from 'next/link';

export default function Orders() {
  const router = useRouter();

  return (
    <main className="w-full h-full flex flex-col bg-background relative overflow-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface dark:bg-surface border-b border-outline-variant/30 pt-safe shrink-0 md:hidden">
        <button className="flex items-center justify-center w-10 h-10 text-primary dark:text-inverse-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-full transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary dark:text-inverse-primary flex-1 text-center">Orders</h1>
        <button className="flex items-center justify-center w-10 h-10 text-primary dark:text-inverse-primary hover:bg-surface-container-low dark:hover:bg-surface-container-highest rounded-full transition-colors">
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      {/* Main Container matching the dashboard layout */}
      <div className="flex-1 overflow-y-auto pt-[calc(56px+env(safe-area-inset-top,0px))] md:pt-8 pb-32">
        {/* Filter Chips */}
        <div className="w-full overflow-x-auto hide-scrollbar px-container-margin py-md bg-surface border-b border-outline-variant/30 sticky top-0 z-40">
          <div className="flex gap-sm w-max">
            <button className="px-md py-sm rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md border border-primary-container transition-colors">Received</button>
            <button className="px-md py-sm rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md border border-outline-variant/50 hover:bg-surface-container-highest transition-colors">Accepted</button>
            <button className="px-md py-sm rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md border border-outline-variant/50 hover:bg-surface-container-highest transition-colors">Packing</button>
            <button className="px-md py-sm rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md border border-outline-variant/50 hover:bg-surface-container-highest transition-colors">Ready</button>
            <button className="px-md py-sm rounded-full bg-surface-container-low text-on-surface-variant font-label-md text-label-md border border-outline-variant/50 hover:bg-surface-container-highest transition-colors">Collected</button>
          </div>
        </div>

        {/* Orders Pipeline Content */}
        <div className="p-container-margin grid grid-cols-1 gap-md max-w-7xl mx-auto">
          {/* Order Card 1 */}
          <article className="bg-surface-container-lowest border border-on-background/10 rounded-xl p-md flex flex-col gap-md shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs block">Order #KW-8492</span>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Sunset Bakery</h2>
              </div>
              <div className="flex gap-xs">
                <span className="bg-tertiary-container/10 text-tertiary font-label-sm text-label-sm px-2 py-1 rounded-md border border-tertiary/20">Paid</span>
              </div>
            </div>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              <span className="font-body-sm text-body-sm">Delivery • Today, 2:00 PM</span>
            </div>
            <div className="h-[1px] w-full bg-outline-variant/30"></div>
            <div className="flex justify-between items-end">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Items</span>
                <span className="font-body-md text-body-md font-semibold text-on-background">24 units</span>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Total Value</span>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">$845.50</span>
              </div>
            </div>
            <Link href="/orders/KW-8492" className="w-full mt-sm py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center">
              Review Order
            </Link>
          </article>

          {/* Order Card 2 */}
          <article className="bg-surface-container-lowest border border-on-background/10 rounded-xl p-md flex flex-col gap-md shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs block">Order #KW-8493</span>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Artisan Crusts</h2>
              </div>
              <div className="flex gap-xs">
                <span className="bg-error-container/10 text-error font-label-sm text-label-sm px-2 py-1 rounded-md border border-error/20">Unpaid</span>
              </div>
            </div>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              <span className="font-body-sm text-body-sm">Pickup • Tomorrow, 8:00 AM</span>
            </div>
            <div className="h-[1px] w-full bg-outline-variant/30"></div>
            <div className="flex justify-between items-end">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Items</span>
                <span className="font-body-md text-body-md font-semibold text-on-background">12 units</span>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Total Value</span>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">$320.00</span>
              </div>
            </div>
            <Link href="/orders/KW-8493" className="w-full mt-sm py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center">
              Review Order
            </Link>
          </article>

          {/* Order Card 3 */}
          <article className="bg-surface-container-lowest border border-on-background/10 rounded-xl p-md flex flex-col gap-md shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant mb-xs block">Order #KW-8494</span>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Morningside Cafe</h2>
              </div>
              <div className="flex gap-xs">
                <span className="bg-tertiary-container/10 text-tertiary font-label-sm text-label-sm px-2 py-1 rounded-md border border-tertiary/20">Paid</span>
              </div>
            </div>
            <div className="flex items-center gap-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
              <span className="font-body-sm text-body-sm">Delivery • Today, 4:30 PM</span>
            </div>
            <div className="h-[1px] w-full bg-outline-variant/30"></div>
            <div className="flex justify-between items-end">
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Items</span>
                <span className="font-body-md text-body-md font-semibold text-on-background">45 units</span>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-label-sm text-on-surface-variant block mb-xs">Total Value</span>
                <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary">$1,250.75</span>
              </div>
            </div>
            <Link href="/orders/KW-8494" className="w-full mt-sm py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center">
              Review Order
            </Link>
          </article>
        </div>
      </div>
      
      <BottomNav />
    </main>
  );
}
