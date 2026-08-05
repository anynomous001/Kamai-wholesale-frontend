"use client";
import React, { useState } from 'react';
import { createProduct, updateProduct, uploadProductImage } from '@/lib/api/products';
import { ApiError, fieldErrorsFrom } from '@/lib/api/client';
import type { AvailabilityState, Product } from '@/lib/api/types';

interface VariantDraft {
  label: string;
  price: string;
}

interface ProductFormProps {
  /** Present => edit mode (PATCH). Absent => create mode (POST), variants editable. */
  initialProduct?: Product;
  onSaved: (product: Product) => void;
  submitLabel?: string;
}

export function ProductForm({ initialProduct, onSaved, submitLabel }: ProductFormProps) {
  const isEditing = !!initialProduct;

  const [name, setName] = useState(initialProduct?.name ?? '');
  const [category, setCategory] = useState(initialProduct?.category ?? '');
  const [brand, setBrand] = useState(initialProduct?.brand ?? '');
  const [unit, setUnit] = useState(initialProduct?.unit ?? '');
  const [price, setPrice] = useState(initialProduct ? String(initialProduct.price) : '');
  const [description, setDescription] = useState(initialProduct?.description ?? '');
  const [availabilityState, setAvailabilityState] = useState<AvailabilityState>(
    initialProduct?.availabilityState ?? 'AVAILABLE',
  );
  const [urgencyEnabled, setUrgencyEnabled] = useState(!!initialProduct?.urgencyBadgeText);
  const [urgencyBadgeText, setUrgencyBadgeText] = useState(initialProduct?.urgencyBadgeText ?? '');
  const [variants, setVariants] = useState<VariantDraft[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(initialProduct?.imageUrl ?? null);

  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [imageWarning, setImageWarning] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const addVariant = () => setVariants((prev) => [...prev, { label: '', price: '' }]);
  const updateVariant = (index: number, patch: Partial<VariantDraft>) =>
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  const removeVariant = (index: number) => setVariants((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setFormError(null);
    setImageWarning(null);
    setFieldErrors({});
    setIsSaving(true);
    try {
      let saved: Product;
      if (isEditing) {
        saved = await updateProduct(initialProduct!.id, {
          name,
          category,
          brand: brand || null,
          unit,
          price: parseFloat(price),
          availabilityState,
          urgencyBadgeText: urgencyEnabled ? urgencyBadgeText : null,
          description: description || null,
        });
      } else {
        saved = await createProduct({
          name,
          category,
          brand: brand || null,
          unit,
          price: parseFloat(price),
          availabilityState,
          urgencyBadgeText: urgencyEnabled ? urgencyBadgeText : null,
          description: description || null,
          variants: variants
            .filter((v) => v.label.trim() !== '' && v.price.trim() !== '')
            .map((v) => ({ label: v.label, price: parseFloat(v.price) })),
        });
      }

      if (imageFile) {
        try {
          const { publicUrl } = await uploadProductImage(saved.id, imageFile);
          saved = { ...saved, imageUrl: publicUrl };
        } catch {
          setImageWarning('Product saved, but the photo failed to upload. Try editing the product to add it again.');
        }
      }

      onSaved(saved);
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(fieldErrorsFrom(err));
        setFormError(err.validationIssues ? 'Please fix the highlighted fields.' : err.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto kamai-scrollbar px-container-margin py-lg pb-[100px] space-y-xl">
      {formError && (
        <div className="bg-error-bg border border-error-border rounded-lg px-4 py-3">
          <p className="text-body-sm text-error-text">{formError}</p>
        </div>
      )}
      {imageWarning && (
        <div className="bg-warning-bg border border-warning-border rounded-lg px-4 py-3">
          <p className="text-body-sm text-warning-text">{imageWarning}</p>
        </div>
      )}

      {/* Image */}
      <div className="flex justify-center">
        <label className="w-[120px] h-[120px] rounded-xl border border-dashed border-border bg-background flex flex-col items-center justify-center text-text-secondary hover:bg-surface transition-colors cursor-pointer overflow-hidden">
          {imagePreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreviewUrl} alt="Product" className="w-full h-full object-cover" />
          ) : (
            <>
              <span className="material-symbols-outlined mb-2 text-[32px]" style={{ fontVariationSettings: "'FILL' 0" }}>add_photo_alternate</span>
              <span className="font-label-sm text-label-sm">Add Photo</span>
            </>
          )}
          <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePickImage} />
        </label>
      </div>

      {/* Basic Info Section */}
      <div className="space-y-lg">
        <div className="space-y-xs">
          <label className="font-label-md text-label-md text-text-primary block">Product Name</label>
          <input
            className={`w-full bg-background border rounded-lg px-md py-[14px] font-body-md text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-secondary/50 ${fieldErrors.name ? 'border-error-text' : 'border-border'}`}
            placeholder="e.g., Artisan Sourdough Flour"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {fieldErrors.name && <p className="text-body-sm text-error-text">{fieldErrors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-gutter">
          <div className="space-y-xs">
            <label className="font-label-md text-label-md text-text-primary block">Category</label>
            <input
              className={`w-full bg-background border rounded-lg px-md py-[14px] font-body-md text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-secondary/50 ${fieldErrors.category ? 'border-error-text' : 'border-border'}`}
              placeholder="e.g., Flours"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            {fieldErrors.category && <p className="text-body-sm text-error-text">{fieldErrors.category}</p>}
          </div>
          <div className="space-y-xs">
            <label className="font-label-md text-label-md text-text-primary block">Brand</label>
            <input
              className="w-full bg-background border border-border rounded-lg px-md py-[14px] font-body-md text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-secondary/50"
              placeholder="e.g., Kamai"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-gutter">
          <div className="space-y-xs">
            <label className="font-label-md text-label-md text-text-primary block">Unit / Size</label>
            <input
              className={`w-full bg-background border rounded-lg px-md py-[14px] font-body-md text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-secondary/50 ${fieldErrors.unit ? 'border-error-text' : 'border-border'}`}
              placeholder="e.g., 25kg Sack"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
            {fieldErrors.unit && <p className="text-body-sm text-error-text">{fieldErrors.unit}</p>}
          </div>
          <div className="space-y-xs">
            <label className="font-label-md text-label-md text-text-primary block">Price (₹)</label>
            <div className="relative">
              <span className="absolute left-md top-1/2 -translate-y-1/2 font-body-md text-text-secondary/70">₹</span>
              <input
                className={`w-full bg-background border rounded-lg pl-8 pr-md py-[14px] font-body-md text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-secondary/50 ${fieldErrors.price ? 'border-error-text' : 'border-border'}`}
                placeholder="0.00"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            {fieldErrors.price && <p className="text-body-sm text-error-text">{fieldErrors.price}</p>}
          </div>
        </div>

        <div className="space-y-xs">
          <label className="font-label-md text-label-md text-text-primary block">Description (optional)</label>
          <textarea
            className="w-full bg-background border border-border rounded-lg px-md py-[14px] font-body-md text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-secondary/50 resize-none"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {isEditing ? (
          <div className="bg-background border border-border rounded-lg p-md space-y-2">
            <p className="font-label-md text-label-md text-text-primary">Variants can&apos;t be edited here</p>
            <p className="font-body-sm text-body-sm text-text-secondary">
              Variants can only be set when a product is created. This product currently has{' '}
              {initialProduct!.variants.length === 0 ? 'no variants' : `${initialProduct!.variants.length} variant(s)`}.
            </p>
          </div>
        ) : (
          <div className="space-y-sm">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-gutter items-center">
                <input
                  className="bg-background border border-border rounded-lg px-md py-[10px] font-body-sm text-body-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Label e.g. 10kg bag"
                  value={v.label}
                  onChange={(e) => updateVariant(i, { label: e.target.value })}
                />
                <input
                  className="bg-background border border-border rounded-lg px-md py-[10px] font-body-sm text-body-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Price"
                  type="number"
                  value={v.price}
                  onChange={(e) => updateVariant(i, { price: e.target.value })}
                />
                <button className="text-text-secondary hover:text-error-text p-2" onClick={() => removeVariant(i)}>
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            ))}
            <button className="flex items-center text-accent hover:text-accent-hover transition-colors py-sm" onClick={addVariant}>
              <span className="material-symbols-outlined mr-sm text-[20px]" style={{ fontVariationSettings: "'FILL' 0" }}>add_circle</span>
              <span className="font-label-md text-label-md">Add variant</span>
            </button>
          </div>
        )}
      </div>

      <hr className="border-border" />

      {/* Status Section */}
      <div className="space-y-md">
        <label className="font-label-md text-label-md text-text-primary block">Inventory Status</label>
        <div className="flex bg-background p-1 rounded-lg">
          {(['AVAILABLE', 'LIMITED_STOCK', 'OUT_OF_STOCK'] as AvailabilityState[]).map((state) => (
            <label key={state} className="flex-1 cursor-pointer">
              <input
                className="peer sr-only"
                name="status"
                type="radio"
                checked={availabilityState === state}
                onChange={() => setAvailabilityState(state)}
              />
              <div className="text-center py-2 rounded-md font-label-md text-label-md text-text-secondary transition-all peer-checked:bg-surface peer-checked:shadow-sm">
                {state === 'AVAILABLE' ? 'Available' : state === 'LIMITED_STOCK' ? 'Limited' : 'Out of Stock'}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Urgency Settings */}
      <div className="space-y-md bg-background p-md rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-label-md text-label-md text-text-primary">Urgency Banner</h4>
            <p className="font-body-sm text-body-sm text-text-secondary">Display a warning on the product card.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input className="sr-only peer" type="checkbox" checked={urgencyEnabled} onChange={(e) => setUrgencyEnabled(e.target.checked)} />
            <div className="w-11 h-6 bg-text-primary/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
          </label>
        </div>

        {urgencyEnabled && (
          <div className="space-y-xs pt-sm">
            <label className="font-label-md text-label-md text-text-primary block">Banner Text</label>
            <input
              className="w-full bg-surface border border-border rounded-lg px-md py-[14px] font-body-md text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-secondary/50"
              placeholder="e.g., Only 5 bags left!"
              type="text"
              value={urgencyBadgeText}
              onChange={(e) => setUrgencyBadgeText(e.target.value)}
            />
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSaving}
        className="w-full bg-accent text-white h-[56px] rounded font-label-md text-label-md flex items-center justify-center hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-60"
      >
        {isSaving ? 'Saving…' : submitLabel ?? (isEditing ? 'Save Changes' : 'Save Product')}
      </button>
    </div>
  );
}
