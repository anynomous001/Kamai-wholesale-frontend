"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/ui/BottomNav';
import { AddProductSheet } from '@/components/ui/AddProductSheet';
import { MasterCatalogueSearchSheet } from '@/components/ui/MasterCatalogueSearchSheet';
import { listProducts, updateProductAvailability } from '@/lib/api/products';
import { ApiError } from '@/lib/api/client';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import type { AvailabilityState, Product } from '@/lib/api/types';

const AVAILABILITY_LABEL: Record<AvailabilityState, string> = {
  AVAILABLE: 'Available',
  LIMITED_STOCK: 'Limited Stock',
  OUT_OF_STOCK: 'Out of Stock',
};

export default function Catalogue() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const [category, setCategory] = useState<string | null>(null);
  const [knownCategories, setKnownCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddChooser, setShowAddChooser] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showMasterSearch, setShowMasterSearch] = useState(false);
  const [availabilityErrorId, setAvailabilityErrorId] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // Reset to page 1 whenever the filters change (adjusted during render rather than in an effect).
  const filterKey = `${debouncedSearch}::${category ?? ''}`;
  const [activeFilterKey, setActiveFilterKey] = useState(filterKey);
  if (filterKey !== activeFilterKey) {
    setActiveFilterKey(filterKey);
    setPage(1);
  }

  const requestKey = `${filterKey}::${page}::${refreshTick}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;
    listProducts({ search: debouncedSearch || undefined, category: category || undefined, page })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.items);
        setTotalPages(res.totalPages);
        setKnownCategories((prev) => {
          const merged = new Set(prev);
          res.items.forEach((p) => merged.add(p.category));
          return Array.from(merged);
        });
        setError(null);
        setLoadedKey(requestKey);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load your catalogue.');
        setLoadedKey(requestKey);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  const handleAvailabilityChange = async (product: Product, next: AvailabilityState) => {
    setAvailabilityErrorId(null);
    try {
      const updated = await updateProductAvailability(product.id, { availabilityState: next });
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch {
      setAvailabilityErrorId(product.id);
    }
  };

  return (
    <main className="w-full flex-1 min-h-0 flex flex-col bg-background relative overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto kamai-scrollbar px-container-margin pt-6 pb-32">
        <div className="flex justify-between items-center mb-md">
          <h1 className="font-headline-xl text-headline-xl text-text-primary">Catalogue</h1>
          <button onClick={() => setShowAddChooser(true)} className="text-text-secondary hover:bg-surface p-2 rounded-full transition-colors flex items-center justify-center -mr-2">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
          <input
            className="w-full bg-surface border border-border rounded-full pl-10 pr-4 py-2 text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-text-secondary/50"
            placeholder="Search your products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-sm overflow-x-auto no-scrollbar pb-md -mx-container-margin px-container-margin">
          <button
            onClick={() => setCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md border transition-colors ${category === null ? 'bg-accent text-white border-transparent' : 'bg-surface text-text-secondary border-border hover:bg-surface'}`}
          >
            All Products
          </button>
          {knownCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-label-md text-label-md border transition-colors ${category === c ? 'bg-accent text-white border-transparent' : 'bg-surface text-text-secondary border-border hover:bg-surface'}`}
            >
              {c}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-error-bg border border-error-border rounded-lg px-4 py-3 mb-4">
            <p className="text-body-sm text-error-text">{error}</p>
          </div>
        )}

        {isLoading ? (
          <p className="text-body-md text-text-secondary">Loading…</p>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 gap-sm">
            <span className="material-symbols-outlined text-5xl text-text-secondary">inventory_2</span>
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">No products yet</h3>
            <p className="font-body-md text-body-md text-text-secondary">Add your first product to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-md mt-sm">
            {products.map((product) => (
              <div key={product.id} className="bg-surface rounded-lg border border-border p-md flex flex-col gap-md shadow-[0_2px_8px_rgba(45,27,20,0.04)]">
                <div className="w-full h-40 shrink-0 rounded-md overflow-hidden relative bg-surface">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="w-full h-full object-cover" src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary/40">
                      <span className="material-symbols-outlined text-5xl">image</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col flex-grow justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-xs">
                      <span className="font-label-sm text-label-sm text-text-secondary uppercase tracking-wider">{product.category}</span>
                      <button className="text-text-secondary hover:text-accent transition-colors p-1 -mt-2 -mr-2" onClick={() => setEditingProduct(product)}>
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                    </div>
                    <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary mb-sm leading-tight">{product.name}</h3>
                    {product.description && (
                      <p className="font-body-md text-body-md text-text-secondary line-clamp-2 mb-md">{product.description}</p>
                    )}
                    {product.urgencyBadgeText && (
                      <p className="font-label-sm text-label-sm text-error-text mb-sm">{product.urgencyBadgeText}</p>
                    )}
                  </div>
                  <div className="flex justify-between items-end gap-sm">
                    <span className="font-label-md text-label-md text-text-primary font-bold">₹{product.price}</span>
                    <select
                      className="bg-surface border border-border rounded-full px-3 py-1 font-label-sm text-label-sm text-text-primary focus:outline-none focus:border-accent"
                      value={product.availabilityState}
                      onChange={(e) => handleAvailabilityChange(product, e.target.value as AvailabilityState)}
                    >
                      {(Object.keys(AVAILABILITY_LABEL) as AvailabilityState[]).map((state) => (
                        <option key={state} value={state}>{AVAILABILITY_LABEL[state]}</option>
                      ))}
                    </select>
                  </div>
                  {availabilityErrorId === product.id && (
                    <p className="text-body-sm text-error-text mt-1">Could not update availability. Please try again.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-md mt-lg">
            <button
              className="px-4 py-2 rounded-full border border-border font-label-sm text-label-sm text-text-secondary disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="font-body-sm text-body-sm text-text-secondary">Page {page} of {totalPages}</span>
            <button
              className="px-4 py-2 rounded-full border border-border font-label-sm text-label-sm text-text-secondary disabled:opacity-40"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <BottomNav />

      {showAddChooser && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end pointer-events-none">
          <div className="w-full h-full md:max-w-[414px] mx-auto relative pointer-events-auto flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddChooser(false)}></div>
            <div className="relative w-full bg-surface rounded-t-lg shadow-[0px_-4px_20px_rgba(45,27,20,0.08)] p-container-margin pb-safe">
              <div className="flex items-center justify-between mb-md">
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">Add products</h2>
                <button className="p-2 text-text-secondary hover:bg-background rounded-full transition-colors -mr-2" onClick={() => setShowAddChooser(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex flex-col gap-sm mb-md">
                <button
                  onClick={() => {
                    setShowAddChooser(false);
                    router.push('/catalogue/import');
                  }}
                  className="w-full flex items-center gap-4 p-md rounded-lg border border-border hover:border-accent hover:bg-background transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <span className="material-symbols-outlined">upload_file</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-text-primary">Import my price list</p>
                    <p className="font-body-sm text-body-sm text-text-secondary">Upload a spreadsheet or photo.</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowAddChooser(false);
                    setShowMasterSearch(true);
                  }}
                  className="w-full flex items-center gap-4 p-md rounded-lg border border-border hover:border-accent hover:bg-background transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-text-primary">Pick from Kamai&apos;s catalogue</p>
                    <p className="font-body-sm text-body-sm text-text-secondary">Search our pre-filled database.</p>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowAddChooser(false);
                    setShowAddSheet(true);
                  }}
                  className="w-full flex items-center gap-4 p-md rounded-lg border border-border hover:border-accent hover:bg-background transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent shrink-0">
                    <span className="material-symbols-outlined">edit_document</span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-text-primary">Add manually</p>
                    <p className="font-body-sm text-body-sm text-text-secondary">Create one item at a time.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMasterSearch && (
        <MasterCatalogueSearchSheet
          onClose={() => setShowMasterSearch(false)}
          onContinue={() => {
            setShowMasterSearch(false);
            setRefreshTick((t) => t + 1);
          }}
        />
      )}

      {showAddSheet && (
        <AddProductSheet
          onClose={() => setShowAddSheet(false)}
          onSaved={(saved) => setProducts((prev) => [saved, ...prev])}
        />
      )}

      {editingProduct && (
        <AddProductSheet
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSaved={(saved) => setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)))}
        />
      )}
    </main>
  );
}
