"use client";
import React, { useState } from 'react';
import { updateCatalogueImportRow } from '@/lib/api/catalogue';
import { ApiError } from '@/lib/api/client';
import type { CatalogueImportRow } from '@/lib/api/types';

interface ImportRowCardProps {
  batchId: string;
  row: CatalogueImportRow;
  onUpdated: (row: CatalogueImportRow) => void;
  disabled: boolean;
}

export function ImportRowCard({ batchId, row, onUpdated, disabled }: ImportRowCardProps) {
  const [name, setName] = useState(row.extractedName ?? '');
  const [price, setPrice] = useState(row.extractedPrice !== null ? String(row.extractedPrice) : '');
  const [unit, setUnit] = useState(row.extractedUnit ?? '');
  const [category, setCategory] = useState(row.extractedCategory ?? '');
  const [description, setDescription] = useState(row.extractedDescription ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patchRow = async (fields: Record<string, string | number | boolean | null>) => {
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateCatalogueImportRow(batchId, row.id, fields);
      onUpdated(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save this row.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprovedToggle = async (checked: boolean) => {
    if (checked && row.hasMissingFields) {
      setError('Cannot approve a row with missing required fields (name/price/unit/category).');
      return;
    }
    await patchRow({ approved: checked });
  };

  return (
    <article className={`bg-surface rounded-lg p-md border shadow-[0px_4px_20px_rgba(45,27,20,0.04)] flex flex-col gap-sm relative ${row.hasMissingFields ? 'border-warning-border' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-md">
        <div className="flex-1 flex flex-col gap-2">
          {row.hasMissingFields && (
            <span className="self-start flex items-center gap-1 text-warning-text bg-warning-bg px-2 py-0.5 rounded-full font-label-sm text-[10px]">
              <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span> Needs review
            </span>
          )}
          <input
            className="w-full bg-background border border-border rounded-lg px-3 py-2 font-label-md text-label-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="Product name (needs review)"
            value={name}
            disabled={disabled}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name !== (row.extractedName ?? '') && patchRow({ extractedName: name || null })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="bg-background border border-border rounded-lg px-3 py-2 font-body-sm text-body-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Category (needs review)"
              value={category}
              disabled={disabled}
              onChange={(e) => setCategory(e.target.value)}
              onBlur={() => category !== (row.extractedCategory ?? '') && patchRow({ extractedCategory: category || null })}
            />
            <input
              className="bg-background border border-border rounded-lg px-3 py-2 font-body-sm text-body-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Unit (needs review)"
              value={unit}
              disabled={disabled}
              onChange={(e) => setUnit(e.target.value)}
              onBlur={() => unit !== (row.extractedUnit ?? '') && patchRow({ extractedUnit: unit || null })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 items-center">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/70 text-body-sm">₹</span>
              <input
                className="w-full bg-background border border-border rounded-lg pl-7 pr-3 py-2 font-body-sm text-body-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                placeholder="Price (needs review)"
                type="number"
                value={price}
                disabled={disabled}
                onChange={(e) => setPrice(e.target.value)}
                onBlur={() => {
                  const numeric = price === '' ? null : parseFloat(price);
                  if (numeric !== row.extractedPrice) patchRow({ extractedPrice: numeric });
                }}
              />
            </div>
            <label className="flex items-center gap-2 justify-end font-label-sm text-label-sm text-text-secondary">
              <input
                className="kamai-checkbox"
                type="checkbox"
                checked={row.approved}
                disabled={disabled || isSaving}
                onChange={(e) => handleApprovedToggle(e.target.checked)}
              />
              Approved
            </label>
          </div>
          <textarea
            className="w-full bg-background border border-border rounded-lg px-3 py-2 font-body-sm text-body-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
            placeholder="Description (optional)"
            rows={2}
            value={description}
            disabled={disabled}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => description !== (row.extractedDescription ?? '') && patchRow({ extractedDescription: description || null })}
          />
        </div>
      </div>
      {error && <p className="text-body-sm text-error-text">{error}</p>}
    </article>
  );
}
