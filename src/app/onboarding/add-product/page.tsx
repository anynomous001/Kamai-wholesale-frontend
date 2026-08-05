"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/ui/ProductForm';

export default function AddProduct() {
  const router = useRouter();

  return (
    <main className="w-full h-full flex justify-center bg-[url('https://images.unsplash.com/photo-1555529733-0e670560f7e1?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden">
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm animate-in fade-in duration-300"></div>

      {/* Overlay Container */}
      <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-lg z-50 h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-[0px_-4px_20px_rgba(45,27,20,0.08)]">
        {/* Header */}
        <div className="flex items-center justify-between px-container-margin py-md border-b border-border shrink-0">
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">Add Product</h2>
          <button className="p-2 text-text-secondary hover:bg-background rounded-full transition-colors flex items-center justify-center -mr-2" onClick={() => router.back()}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
          </button>
        </div>

        <ProductForm onSaved={() => router.push('/onboarding/step-3')} />
      </div>
    </main>
  );
}
