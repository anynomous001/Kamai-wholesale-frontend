"use client";
import React from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

export default function Dashboard() {
  return (
    <main className="w-full h-full flex flex-col bg-[#F7F5F0] relative overflow-hidden">
      {/* TopAppBar */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface border-b border-outline-variant/30 text-on-surface-variant shrink-0">
        <div className="flex items-center gap-sm">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary flex items-center gap-2">
            Bakery Co.
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E6F4EA] text-[#137333] border border-[#137333]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#137333] mr-1 animate-pulse"></span>
              Live
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-sm">
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-transform duration-200 active:scale-95 text-on-surface-variant">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-transform duration-200 active:scale-95 text-on-surface-variant md:hidden">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-container-margin pt-6 pb-32">
        <div className="flex flex-col gap-lg">
          {/* Today's Overview */}
          <section>
            <h2 className="font-label-md text-label-md text-on-surface-variant mb-md uppercase tracking-wider">Today's Overview</h2>
            <div className="grid grid-cols-2 gap-gutter">
              {/* Orders */}
              <div className="bg-white border border-[#2D1B14]/12 rounded-lg p-md flex flex-col gap-sm">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Orders</span>
                  <span className="material-symbols-outlined text-secondary text-sm">receipt_long</span>
                </div>
                <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">24</div>
                <div className="font-body-sm text-body-sm text-secondary-fixed-dim text-xs">+3 from yesterday</div>
              </div>
              
              {/* Revenue */}
              <div className="bg-white border border-[#2D1B14]/12 rounded-lg p-md flex flex-col gap-sm">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Revenue</span>
                  <span className="material-symbols-outlined text-secondary text-sm">payments</span>
                </div>
                <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">$1.2k</div>
                <div className="font-body-sm text-body-sm text-secondary-fixed-dim text-xs">Pending payout</div>
              </div>

              {/* SKUs */}
              <div className="bg-white border border-[#2D1B14]/12 rounded-lg p-md flex flex-col gap-sm">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Active SKUs</span>
                  <span className="material-symbols-outlined text-secondary text-sm">inventory_2</span>
                </div>
                <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">156</div>
                <div className="font-body-sm text-body-sm text-[#ba1a1a] text-xs">2 Low Stock</div>
              </div>

              {/* Repeat % */}
              <div className="bg-white border border-[#2D1B14]/12 rounded-lg p-md flex flex-col gap-sm">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">Repeat Rate</span>
                  <span className="material-symbols-outlined text-secondary text-sm">repeat</span>
                </div>
                <div className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">68%</div>
                <div className="font-body-sm text-body-sm text-secondary-fixed-dim text-xs">Top 20% of suppliers</div>
              </div>
            </div>
          </section>

          {/* Needs Action */}
          <section className="mt-md">
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Needs Action</h2>
              <a className="font-label-sm text-label-sm text-primary hover:underline" href="#">View All</a>
            </div>
            <div className="bg-white border border-[#2D1B14]/12 rounded-xl p-xl flex flex-col items-center justify-center text-center min-h-[200px] border-dashed border-2 border-outline-variant bg-surface-container-lowest">
              <span className="material-symbols-outlined text-5xl text-outline-variant mb-sm" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background mb-xs">No pending orders</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">You're all caught up for now.</p>
            </div>
          </section>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
