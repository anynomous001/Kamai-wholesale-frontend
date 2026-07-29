"use client";
import React from 'react';
import { BottomNav } from '@/components/ui/BottomNav';

export default function Catalogue() {
  return (
    <main className="w-full h-full flex flex-col bg-background relative overflow-hidden">
      {/* TopAppBar */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface border-b border-outline-variant/30 shrink-0">
        <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center -ml-2">
          <span className="material-symbols-outlined" data-icon="arrow_back">arrow_back</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">Catalogue</h1>
        <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center -mr-2">
          <span className="material-symbols-outlined" data-icon="search">search</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-container-margin pt-6 pb-32">
        {/* Category Filter Chips */}
        <div className="flex gap-sm overflow-x-auto no-scrollbar pb-md -mx-container-margin px-container-margin">
          <button className="flex-shrink-0 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full font-label-md text-label-md border border-transparent">
            All Products
          </button>
          <button className="flex-shrink-0 px-4 py-2 bg-surface text-on-surface-variant rounded-full font-label-md text-label-md border border-outline/20 hover:bg-surface-container-low transition-colors">
            Artisan Bread
          </button>
          <button className="flex-shrink-0 px-4 py-2 bg-surface text-on-surface-variant rounded-full font-label-md text-label-md border border-outline/20 hover:bg-surface-container-low transition-colors">
            Pastries
          </button>
          <button className="flex-shrink-0 px-4 py-2 bg-surface text-on-surface-variant rounded-full font-label-md text-label-md border border-outline/20 hover:bg-surface-container-low transition-colors">
            Cakes
          </button>
        </div>

        {/* Populated State: Product List */}
        <div className="grid grid-cols-1 gap-md mt-sm">
          {/* Product Card 1 */}
          <div className="bg-surface rounded-lg border border-on-background/10 p-md flex flex-col gap-md shadow-[0_2px_8px_rgba(45,27,20,0.04)]">
            <div className="w-full h-40 shrink-0 rounded-md overflow-hidden relative bg-surface-container-lowest">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCruqKJkRH6-2CeMNn4ppSjGte5wae3cVFBOT0yUQLFj54ULOatyvYdULGneU0jjm0XL7yQWtwRXnTdny_vDEoatlaPStV8uBOLd_vA4bd2KlGR5y-1rtvC8eoySIdsBH2UCvaah-M9X6fTUz14rKuBM0xXYdonN72I4ejzEbQHr8s-wJ0Lag1i_ZYn1JAFdZoMDU9C3mf56wIrJ25GOE7H0wgdBB6bPfBhvTH1o_fyaT-xVKTquAqFeQ" alt="Sourdough Boule" />
            </div>
            <div className="flex flex-col flex-grow justify-between">
              <div>
                <div className="flex justify-between items-start mb-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Artisan Bread</span>
                  <button className="text-on-surface-variant hover:text-primary transition-colors p-1 -mt-2 -mr-2">
                    <span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span>
                  </button>
                </div>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background mb-sm leading-tight">Rustic Sourdough Boule</h3>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-md">Traditional slow-fermented sourdough with a thick crust and open crumb structure.</p>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-label-md text-label-md text-on-background font-bold">$4.50</span>
              </div>
            </div>
          </div>

          {/* Product Card 2 (Inferred) */}
          <div className="bg-surface rounded-lg border border-on-background/10 p-md flex flex-col gap-md shadow-[0_2px_8px_rgba(45,27,20,0.04)]">
            <div className="w-full h-40 shrink-0 rounded-md overflow-hidden relative bg-surface-container-lowest">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgWUYFM6CFxy3fW79g5uifP6S1cqctuxd3WMNUO2I0RzQFDKdVOh54Ocb2-4BMeJJtMrNBrnLtRk8fr5Gjj4P7ycfTwugU0HZZzTNSVHBvggoFLNtAhh1zEsuhakeV9JmvhylmZrmqumgbVTqQHeS6pflrrEVXXRxIV2-YkNG92agIY5XmpSISj6tWUlA1FWYa4M_iiPMUhX1ubiKE12rLPbgvDTSO1wCln0BgGXpqyGiHx1XSkxqAyA" alt="Croissant" />
            </div>
            <div className="flex flex-col flex-grow justify-between">
              <div>
                <div className="flex justify-between items-start mb-xs">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Pastries</span>
                  <button className="text-on-surface-variant hover:text-primary transition-colors p-1 -mt-2 -mr-2">
                    <span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span>
                  </button>
                </div>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background mb-sm leading-tight">Classic Butter Croissant</h3>
                <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mb-md">Traditional French-style butter croissants.</p>
              </div>
              <div className="flex justify-between items-end">
                <span className="font-label-md text-label-md text-on-background font-bold">$2.10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
