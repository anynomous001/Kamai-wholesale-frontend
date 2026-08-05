"use client";
import React, { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import Link from 'next/link';
import { listOrders } from '@/lib/api/orders';
import { ApiError } from '@/lib/api/client';
import type { OrderListItem, OrderStatus } from '@/lib/api/types';

const FILTERS: { label: string; status?: OrderStatus[] }[] = [
  { label: 'All' },
  { label: 'Received', status: ['RECEIVED'] },
  { label: 'Accepted', status: ['ACCEPTED'] },
  { label: 'Packing', status: ['PACKING'] },
  { label: 'Ready', status: ['READY'] },
  { label: 'Collected', status: ['COLLECTED_DISPATCHED'] },
  { label: 'Cancelled', status: ['CANCELLED'] },
];

export default function Orders() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Reset to page 1 whenever the filter changes (adjusted during render rather than in an effect).
  const [activeFilterForPage, setActiveFilterForPage] = useState(activeFilter);
  if (activeFilter !== activeFilterForPage) {
    setActiveFilterForPage(activeFilter);
    setPage(1);
  }

  const requestKey = `${activeFilter}::${page}`;
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const isLoading = loadedKey !== requestKey;

  useEffect(() => {
    let cancelled = false;
    listOrders({ status: FILTERS[activeFilter].status, sort: 'newest', page })
      .then((res) => {
        if (cancelled) return;
        setOrders(res.items);
        setTotalPages(res.totalPages);
        setError(null);
        setLoadedKey(requestKey);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Could not load orders.');
        setLoadedKey(requestKey);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  return (
    <main className="w-full flex-1 min-h-0 flex flex-col bg-background relative overflow-hidden">
      {/* Main Container matching the dashboard layout */}
      <div className="flex-1 overflow-y-auto kamai-scrollbar pt-6 pb-32">
        <h1 className="font-headline-xl text-headline-xl text-text-primary px-container-margin mb-md">Orders</h1>

        {/* Filter Chips */}
        <div className="w-full overflow-x-auto no-scrollbar px-container-margin py-md bg-surface border-b border-border sticky top-0 z-40">
          <div className="flex gap-sm w-max">
            {FILTERS.map((f, i) => (
              <button
                key={f.label}
                onClick={() => setActiveFilter(i)}
                className={`px-md py-sm rounded-full font-label-md text-label-md border transition-colors ${activeFilter === i ? 'bg-accent text-white border-accent' : 'bg-surface text-text-secondary border-border hover:bg-surface'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mx-container-margin mt-md bg-error-bg border border-error-border rounded-lg px-4 py-3">
            <p className="text-body-sm text-error-text">{error}</p>
          </div>
        )}

        {/* Orders Pipeline Content */}
        {isLoading ? (
          <p className="text-body-md text-text-secondary p-container-margin">Loading…</p>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 gap-sm">
            <span className="material-symbols-outlined text-5xl text-text-secondary">receipt_long</span>
            <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">No orders here</h3>
            <p className="font-body-md text-body-md text-text-secondary">Nothing matches this filter right now.</p>
          </div>
        ) : (
          <div className="p-container-margin grid grid-cols-1 gap-md max-w-7xl mx-auto">
            {orders.map((order) => (
              <article key={order.id} className="bg-surface border border-border rounded-lg p-md flex flex-col gap-md shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-label-sm text-label-sm text-text-secondary mb-xs block">{order.status}</span>
                    <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">{order.buyerName}</h2>
                  </div>
                  <div className="flex gap-xs">
                    <span className={`font-label-sm text-label-sm px-2 py-1 rounded-md border ${order.advanceStatus === 'RECEIVED' ? 'bg-success-bg text-success-text border-success-border' : 'bg-error-bg text-error-text border-error-border'}`}>
                      {order.advanceStatus === 'RECEIVED' ? 'Advance Paid' : 'Advance Pending'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-sm text-text-secondary">
                  <span className="material-symbols-outlined text-[20px]">{order.fulfilmentMode === 'DELIVERY' ? 'local_shipping' : 'storefront'}</span>
                  <span className="font-body-sm text-body-sm">
                    {order.fulfilmentMode === 'DELIVERY' ? 'Delivery' : 'Pickup'} · {order.readyTime ? new Date(order.readyTime).toLocaleString() : new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="h-[1px] w-full bg-border"></div>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="font-label-sm text-label-sm text-text-secondary block mb-xs">Items</span>
                    <span className="font-body-md text-body-md font-semibold text-text-primary">{order.itemCount} item(s)</span>
                  </div>
                  <div className="text-right">
                    <span className="font-label-sm text-label-sm text-text-secondary block mb-xs">Total Value</span>
                    <span className="font-headline-lg-mobile text-headline-lg-mobile text-accent">₹{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <Link href={`/orders/${order.id}`} className="w-full mt-sm py-sm bg-accent text-white font-label-md text-label-md rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center">
                  Review Order
                </Link>
              </article>
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
    </main>
  );
}
