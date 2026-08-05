"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/ui/BottomNav';
import { getDashboardStats } from '@/lib/api/dashboard';
import { listOrders } from '@/lib/api/orders';
import { getProfile } from '@/lib/api/profile';
import type { DashboardStats, OrderListItem, WholesalerProfile } from '@/lib/api/types';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [needsAction, setNeedsAction] = useState<OrderListItem[]>([]);
  const [profile, setProfile] = useState<WholesalerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, ordersRes, profileRes] = await Promise.all([
          getDashboardStats(),
          listOrders({ status: ['RECEIVED', 'ACCEPTED'], sort: 'oldest' }),
          getProfile(),
        ]);
        setStats(statsRes);
        setNeedsAction(ordersRes.items);
        setProfile(profileRes);
      } catch {
        setError('Could not load your dashboard.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <main className="w-full flex-1 min-h-0 flex flex-col bg-background relative overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto kamai-scrollbar px-container-margin pt-6 pb-32">
        {/* Business identity — moved out of app chrome, into the page body */}
        <div className="mb-8">
          <h1 className="font-headline-xl text-headline-xl text-text-primary flex items-center gap-2 flex-wrap">
            Hello, {profile?.businessName || 'there'}
            {profile?.status === 'ACTIVE' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-success-bg text-success-text border border-success-border">
                <span className="w-1.5 h-1.5 rounded-full bg-success-text mr-1 animate-pulse"></span>
                Live
              </span>
            )}
          </h1>
          <p className="text-body-sm text-text-secondary mt-1">Here&apos;s what&apos;s happening with your wholesale business today.</p>
        </div>

        {error && (
          <div className="bg-error-bg border border-error-border rounded-lg px-4 py-3 mb-4">
            <p className="text-body-sm text-error-text">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-lg">
          {/* Today's Overview */}
          <section>
            <h2 className="font-label-md text-label-md text-text-secondary mb-md uppercase tracking-wider">Today&apos;s Overview</h2>
            <div className="grid grid-cols-2 gap-gutter">
              {/* Orders Awaiting Acceptance */}
              <div className="bg-surface border border-border rounded-lg p-md flex flex-col gap-sm">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-text-secondary">Awaiting Acceptance</span>
                  <span className="material-symbols-outlined text-text-secondary text-sm">receipt_long</span>
                </div>
                <div className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">
                  {isLoading ? '—' : stats?.ordersAwaitingAcceptance}
                </div>
              </div>

              {/* Revenue */}
              <div className="bg-surface border border-border rounded-lg p-md flex flex-col gap-sm">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-text-secondary">Today&apos;s Revenue</span>
                  <span className="material-symbols-outlined text-text-secondary text-sm">payments</span>
                </div>
                <div className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">
                  {isLoading ? '—' : `₹${stats?.todaysRevenue.toLocaleString()}`}
                </div>
              </div>

              {/* SKUs */}
              <div className="bg-surface border border-border rounded-lg p-md flex flex-col gap-sm">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-text-secondary">Active SKUs</span>
                  <span className="material-symbols-outlined text-text-secondary text-sm">inventory_2</span>
                </div>
                <div className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">
                  {isLoading ? '—' : stats?.activeSkuCount}
                </div>
              </div>

              {/* Repeat % */}
              <div className="bg-surface border border-border rounded-lg p-md flex flex-col gap-sm">
                <div className="flex justify-between items-start">
                  <span className="font-label-sm text-label-sm text-text-secondary">Repeat Rate</span>
                  <span className="material-symbols-outlined text-text-secondary text-sm">repeat</span>
                </div>
                <div className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">
                  {isLoading ? '—' : `${stats?.repeatBuyerPercentage}%`}
                </div>
              </div>
            </div>
          </section>

          {/* Needs Action */}
          <section className="mt-md">
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-label-md text-label-md text-text-secondary uppercase tracking-wider">Needs Action</h2>
              <Link className="font-label-sm text-label-sm text-accent hover:underline" href="/orders">View All</Link>
            </div>

            {isLoading ? (
              <p className="text-body-md text-text-secondary">Loading…</p>
            ) : needsAction.length === 0 ? (
              <div className="bg-surface border border-border rounded-lg p-xl flex flex-col items-center justify-center text-center min-h-[200px] border-dashed border-2">
                <span className="material-symbols-outlined text-5xl text-text-secondary mb-sm" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
                <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary mb-xs">No pending orders</h3>
                <p className="font-body-md text-body-md text-text-secondary">You&apos;re all caught up for now.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-sm">
                {needsAction.map((order) => (
                  <Link key={order.id} href={`/orders/${order.id}`} className="bg-surface border border-border rounded-lg p-md flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-label-md text-label-md text-text-primary font-semibold">{order.buyerName}</p>
                      <p className="font-body-sm text-body-sm text-text-secondary">{order.status} · {order.itemCount} item(s) · {order.fulfilmentMode}</p>
                    </div>
                    <span className="font-label-md text-label-md text-accent">₹{order.totalAmount.toLocaleString()}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}
