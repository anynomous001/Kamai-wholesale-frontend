"use client";
import React, { useEffect, useState } from 'react';
import { searchMasterCatalogue, createProductFromMaster } from '@/lib/api/catalogue';
import { ApiError } from '@/lib/api/client';
import type { MasterCatalogueItem } from '@/lib/api/types';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

interface MasterCatalogueSearchSheetProps {
  onClose: () => void;
  onContinue: () => void;
}

export function MasterCatalogueSearchSheet({ onClose, onContinue }: MasterCatalogueSearchSheetProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 350);
  const [results, setResults] = useState<MasterCatalogueItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length === 0) {
      setResults([]);
      setSearchError(null);
      return;
    }
    let cancelled = false;
    setIsSearching(true);
    searchMasterCatalogue(q)
      .then(({ items }) => {
        if (!cancelled) {
          setResults(items);
          setSearchError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setSearchError(err instanceof ApiError ? err.message : 'Search failed.');
      })
      .finally(() => {
        if (!cancelled) setIsSearching(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const handleAdd = async (item: MasterCatalogueItem) => {
    setAddErrors((prev) => ({ ...prev, [item.id]: '' }));
    const needsPrice = item.suggestedPrice === null;
    const draft = priceDrafts[item.id];
    if (needsPrice && (!draft || parseFloat(draft) < 0 || Number.isNaN(parseFloat(draft)))) {
      setAddErrors((prev) => ({ ...prev, [item.id]: 'Enter a price for this item.' }));
      return;
    }

    setAddingId(item.id);
    try {
      await createProductFromMaster(item.id, needsPrice ? parseFloat(draft) : undefined);
      setAddedIds((prev) => new Set(prev).add(item.id));
    } catch (err) {
      if (err instanceof ApiError && err.issueFor('price')) {
        setAddErrors((prev) => ({ ...prev, [item.id]: 'Enter a price for this item.' }));
      } else {
        setAddErrors((prev) => ({
          ...prev,
          [item.id]: err instanceof ApiError ? err.message : 'Could not add this item.',
        }));
      }
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end pointer-events-none">
      <div className="w-full h-full md:max-w-[414px] mx-auto relative pointer-events-auto flex flex-col justify-end">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

        <div className="relative w-full bg-surface rounded-t-lg h-[85vh] flex flex-col shadow-[0px_-4px_20px_rgba(45,27,20,0.08)]">
          <div className="flex items-center justify-between px-container-margin py-md border-b border-border shrink-0">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">Kamai&apos;s Catalogue</h2>
            <button className="p-2 text-text-secondary hover:bg-background rounded-full transition-colors -mr-2" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="px-container-margin py-md shrink-0">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">search</span>
              <input
                autoFocus
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-secondary/50"
                placeholder="Search e.g. Refined Sunflower Oil"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto kamai-scrollbar px-container-margin pb-4 space-y-3">
            {isSearching && <p className="text-body-sm text-text-secondary">Searching…</p>}
            {searchError && <p className="text-body-sm text-error-text">{searchError}</p>}
            {!isSearching && query.trim() !== '' && results.length === 0 && !searchError && (
              <p className="text-body-sm text-text-secondary">No matches found.</p>
            )}

            {results.map((item) => {
              const isAdded = addedIds.has(item.id);
              const needsPrice = item.suggestedPrice === null;
              const isAdding = addingId === item.id;
              const error = addErrors[item.id];
              return (
                <div key={item.id} className="bg-surface border border-border rounded-lg p-md flex flex-col gap-sm">
                  <div className="flex justify-between items-start gap-md">
                    <div>
                      <h3 className="font-label-md text-label-md text-text-primary font-semibold">{item.name}</h3>
                      <p className="font-body-sm text-body-sm text-text-secondary">{item.category} · {item.unit}{item.brand ? ` · ${item.brand}` : ''}</p>
                      <p className="font-body-sm text-body-sm text-text-secondary mt-1">
                        {item.suggestedPrice !== null ? `Suggested ₹${item.suggestedPrice}` : 'No suggested price'}
                      </p>
                    </div>
                    <button
                      className={`shrink-0 px-4 py-2 rounded-full font-label-sm text-label-sm transition-colors ${isAdded ? 'bg-accent/10 text-accent' : 'bg-accent text-white hover:bg-accent-hover'}`}
                      onClick={() => handleAdd(item)}
                      disabled={isAdded || isAdding}
                    >
                      {isAdded ? 'Added' : isAdding ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                  {needsPrice && !isAdded && (
                    <div className="flex items-center gap-2">
                      <span className="font-body-md text-text-secondary/70">₹</span>
                      <input
                        className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                        placeholder="Enter a price for this item"
                        type="number"
                        min="0"
                        value={priceDrafts[item.id] ?? ''}
                        onChange={(e) => setPriceDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      />
                    </div>
                  )}
                  {error && <p className="text-body-sm text-error-text">{error}</p>}
                </div>
              );
            })}
          </div>

          <div className="p-container-margin border-t border-border shrink-0">
            <button
              onClick={onContinue}
              disabled={addedIds.size === 0}
              className="w-full h-14 bg-accent text-white font-label-md text-label-md rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
            >
              {addedIds.size === 0 ? 'Add at least one product' : `Continue (${addedIds.size} added)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
