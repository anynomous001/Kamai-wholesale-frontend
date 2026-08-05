"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getOrder, updateOrderAdvancePayment, updateOrderNotes, updateOrderStatus } from '@/lib/api/orders';
import { ApiError } from '@/lib/api/client';
import { ORDER_STATUS_TRANSITIONS } from '@/lib/api/types';
import type { OrderDetail, OrderStatus } from '@/lib/api/types';

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus }>> = {
  RECEIVED: { label: 'Accept Order', next: 'ACCEPTED' },
  ACCEPTED: { label: 'Start Packing', next: 'PACKING' },
  PACKING: { label: 'Mark Ready', next: 'READY' },
  READY: { label: 'Mark Collected / Dispatched', next: 'COLLECTED_DISPATCHED' },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const isLoading = loadedId !== id;
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [isUpdatingAdvance, setIsUpdatingAdvance] = useState(false);

  const [notesDraft, setNotesDraft] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getOrder(id)
      .then((detail) => {
        if (cancelled) return;
        setOrder(detail);
        setNotesDraft(detail.notes ?? '');
        setLoadError(null);
        setLoadedId(id);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiError ? err.message : 'Could not load this order.');
        setLoadedId(id);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleTransition = async (next: OrderStatus) => {
    if (!order) return;
    setStatusError(null);
    setIsUpdatingStatus(true);
    try {
      const updated = await updateOrderStatus(order.id, next);
      setOrder(updated);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'CONFLICT') {
        setStatusError(err.message);
      } else if (err instanceof ApiError) {
        setStatusError(err.message);
      } else {
        setStatusError('Something went wrong. Please try again.');
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAdvanceToggle = async () => {
    if (!order) return;
    setIsUpdatingAdvance(true);
    try {
      const target = order.advanceStatus === 'RECEIVED' ? 'PENDING' : 'RECEIVED';
      const updated = await updateOrderAdvancePayment(order.id, target);
      setOrder(updated);
    } catch {
      // no-op — leave state as-is, button remains available to retry
    } finally {
      setIsUpdatingAdvance(false);
    }
  };

  const handleSaveNotes = async (clear = false) => {
    if (!order) return;
    setNotesError(null);
    setIsSavingNotes(true);
    try {
      const updated = await updateOrderNotes(order.id, clear ? null : notesDraft.trim() || null);
      setOrder(updated);
      setNotesDraft(updated.notes ?? '');
    } catch (err) {
      setNotesError(err instanceof ApiError ? err.message : 'Could not save notes.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) {
    return (
      <main className="w-full h-full bg-surface flex items-center justify-center">
        <p className="text-body-md text-text-secondary">Loading…</p>
      </main>
    );
  }

  if (loadError || !order) {
    return (
      <main className="w-full h-full bg-surface flex flex-col items-center justify-center gap-md p-container-margin text-center">
        <p className="text-body-md text-error-text">{loadError ?? 'Order not found.'}</p>
        <button className="text-accent underline" onClick={() => router.push('/orders')}>Back to Orders</button>
      </main>
    );
  }

  const nextAction = NEXT_ACTION[order.status];
  const canCancel = ORDER_STATUS_TRANSITIONS[order.status].includes('CANCELLED');
  const isTerminal = ORDER_STATUS_TRANSITIONS[order.status].length === 0;

  return (
    <main className="w-full h-full bg-surface flex flex-col relative z-10 overflow-hidden">
      {/* TopAppBar */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface border-b border-border shrink-0">
        <div className="flex items-center gap-sm text-accent">
          <span className="w-6"></span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-accent text-center flex-1">
          Order #{order.id.slice(0, 8)}
        </h1>
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center p-sm text-text-secondary hover:bg-background rounded-full transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto kamai-scrollbar pb-24 px-container-margin space-y-lg mt-md">
        {/* Status badge */}
        <div className="flex justify-between items-center">
          <span className="font-label-md text-label-md px-3 py-1 rounded-full bg-accent/10 text-accent">{order.status}</span>
          <span className="font-body-sm text-body-sm text-text-secondary">{new Date(order.createdAt).toLocaleString()}</span>
        </div>

        {/* Buyer Info */}
        <section className="bg-surface rounded-lg p-md border border-border flex items-center justify-between">
          <div>
            <h2 className="font-label-md text-label-md text-text-primary mb-xs">{order.buyerName}</h2>
            <p className="font-body-sm text-body-sm text-text-secondary">{order.buyerContact}</p>
          </div>
          <a className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10 text-accent hover:bg-accent transition-colors hover:text-white" href={`tel:${order.buyerContact}`}>
            <span className="material-symbols-outlined">call</span>
          </a>
        </section>

        {/* Itemized List */}
        <section className="space-y-sm">
          <h3 className="font-label-md text-label-md text-text-primary mb-sm">Items</h3>
          <div className="bg-surface rounded-lg border border-border divide-y divide-border">
            {order.items.map((item) => (
              <div key={item.id} className="p-md flex gap-md items-start">
                <div className="flex-1">
                  <h4 className="font-label-md text-label-md text-text-primary">{item.productName}{item.variantLabel ? ` — ${item.variantLabel}` : ''}</h4>
                  <div className="flex justify-between items-center mt-xs">
                    <span className="font-body-sm text-body-sm text-text-secondary">Qty: {item.quantity} × ₹{item.unitPrice}</span>
                    <span className="font-label-md text-label-md text-text-primary">₹{item.lineTotal}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="bg-surface rounded-lg p-md border border-border mt-sm">
            <div className="flex justify-between items-center mb-xs font-body-sm text-body-sm text-text-secondary">
              <span>Advance required</span>
              <span>{order.advanceRequiredPercent}%</span>
            </div>
            <div className="flex justify-between items-center pt-sm border-t border-border">
              <span className="font-label-md text-label-md text-text-primary">Total</span>
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-accent font-bold">₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Fulfilment Info */}
        <section className="bg-surface rounded-lg p-md border border-border">
          <div className="flex items-center gap-sm mb-sm text-text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {order.fulfilmentMode === 'DELIVERY' ? 'local_shipping' : 'storefront'}
            </span>
            <h3 className="font-label-md text-label-md">Fulfilment</h3>
          </div>
          <div className="space-y-xs font-body-sm text-body-sm text-text-secondary">
            <p>{order.fulfilmentMode === 'DELIVERY' ? 'Delivery' : 'Pickup'}</p>
            {order.readyTime && <p>Ready since: {new Date(order.readyTime).toLocaleString()}</p>}
          </div>
        </section>

        {/* Notes */}
        <section className="bg-surface rounded-lg p-md border border-border space-y-sm">
          <h3 className="font-label-md text-label-md text-text-primary">Internal Notes</h3>
          <textarea
            className="w-full bg-surface border border-border rounded-lg p-3 font-body-sm text-body-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
            rows={3}
            maxLength={2000}
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            placeholder="Visible only to you, never the buyer."
          />
          {notesError && <p className="text-body-sm text-error-text">{notesError}</p>}
          <div className="flex gap-sm">
            <button
              className="px-4 py-2 rounded-lg bg-accent text-white font-label-sm text-label-sm disabled:opacity-50"
              disabled={isSavingNotes}
              onClick={() => handleSaveNotes(false)}
            >
              {isSavingNotes ? 'Saving…' : 'Save Notes'}
            </button>
            {order.notes && (
              <button
                className="px-4 py-2 rounded-lg border border-border text-text-secondary font-label-sm text-label-sm disabled:opacity-50"
                disabled={isSavingNotes}
                onClick={() => handleSaveNotes(true)}
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* Advance Payment Toggle */}
        <section className="bg-surface rounded-lg p-md border border-border flex items-center justify-between">
          <div>
            <h3 className="font-label-md text-label-md text-text-primary">Advance Payment</h3>
            <p className="font-body-sm text-body-sm text-text-secondary mt-xs">
              {order.advanceStatus === 'RECEIVED' ? 'Marked as received.' : 'Not yet received.'}
            </p>
          </div>
          <button
            onClick={handleAdvanceToggle}
            disabled={isUpdatingAdvance}
            className={`px-4 py-2 rounded-full font-label-sm text-label-sm transition-colors disabled:opacity-50 ${order.advanceStatus === 'RECEIVED' ? 'bg-background text-text-secondary border border-border' : 'bg-accent text-white'}`}
          >
            {isUpdatingAdvance ? 'Updating…' : order.advanceStatus === 'RECEIVED' ? 'Mark as Pending' : 'Mark as Received'}
          </button>
        </section>

        {statusError && (
          <div className="bg-error-bg border border-error-border rounded-lg px-4 py-3">
            <p className="text-body-sm text-error-text">{statusError}</p>
          </div>
        )}
      </div>

      {/* Sticky Footer Action */}
      {!isTerminal && (
        <div className="absolute bottom-0 left-0 w-full p-container-margin bg-surface border-t border-border shadow-[0px_-4px_20px_rgba(45,27,20,0.08)] z-50 shrink-0 flex gap-sm">
          {canCancel && (
            <button
              onClick={() => handleTransition('CANCELLED')}
              disabled={isUpdatingStatus}
              className="flex-1 h-[56px] border border-error-text text-error-text rounded font-label-md text-label-md flex items-center justify-center hover:bg-error-bg transition-colors disabled:opacity-50"
            >
              Cancel Order
            </button>
          )}
          {nextAction && (
            <button
              onClick={() => handleTransition(nextAction.next)}
              disabled={isUpdatingStatus}
              className="flex-[2] h-[56px] bg-accent text-white rounded font-label-md text-label-md flex items-center justify-center gap-sm hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-50"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              {isUpdatingStatus ? 'Updating…' : nextAction.label}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
