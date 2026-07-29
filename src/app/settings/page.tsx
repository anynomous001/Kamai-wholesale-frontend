"use client";
import React from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

export default function Settings() {
  return (
    <main className="w-full h-full flex flex-col bg-[#F7F5F0] relative overflow-hidden">
      {/* TopAppBar */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface border-b border-outline-variant/30 text-on-surface-variant shrink-0">
        <div className="flex items-center gap-sm">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary flex items-center gap-2">
            Settings
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-container-margin pt-6 pb-32 flex items-center justify-center">
        <p className="text-on-surface-variant font-body-md text-body-md">Settings page coming soon.</p>
      </div>

      <BottomNav />
    </main>
  );
}
