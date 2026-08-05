import React from 'react';
import { ProductForm } from '@/components/ui/ProductForm';
import type { Product } from '@/lib/api/types';

interface AddProductSheetProps {
  onClose: () => void;
  onSaved?: (product: Product) => void;
  /** Present => edit mode. */
  product?: Product;
}

export function AddProductSheet({ onClose, onSaved, product }: AddProductSheetProps) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end pointer-events-none">
      <div className="w-full h-full md:max-w-[414px] mx-auto relative pointer-events-auto flex flex-col justify-end">
        {/* Scrim */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>

        {/* Overlay Container */}
        <div className="relative w-full bg-surface rounded-t-lg h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-[0px_-4px_20px_rgba(45,27,20,0.08)]">
          {/* Header */}
          <div className="flex items-center justify-between px-container-margin py-md border-b border-border shrink-0">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">{product ? 'Edit Product' : 'Add Product'}</h2>
            <button className="p-2 text-text-secondary hover:bg-background rounded-full transition-colors flex items-center justify-center -mr-2" onClick={onClose}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>close</span>
            </button>
          </div>

          <ProductForm
            initialProduct={product}
            onSaved={(saved) => {
              onSaved?.(saved);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}
