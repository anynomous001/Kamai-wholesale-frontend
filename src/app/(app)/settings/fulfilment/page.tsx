"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile } from '@/lib/api/profile';
import { ApiError, fieldErrorsFrom } from '@/lib/api/client';

export default function FulfilmentSettings() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [deliveryRadiusKm, setDeliveryRadiusKm] = useState('15');
  const [deliveryCharge, setDeliveryCharge] = useState('10.00');
  const [minOrderAmount, setMinOrderAmount] = useState('50.00');
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState('150.00');
  const [expectedDeliveryTime, setExpectedDeliveryTime] = useState('2-3 Business Days');

  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setDeliveryEnabled(profile.deliveryEnabled);
        if (profile.deliveryRadiusKm !== null) setDeliveryRadiusKm(String(profile.deliveryRadiusKm));
        if (profile.deliveryCharge !== null) setDeliveryCharge(String(profile.deliveryCharge));
        if (profile.minOrderAmount !== null) setMinOrderAmount(String(profile.minOrderAmount));
        if (profile.freeDeliveryThreshold !== null) setFreeDeliveryThreshold(String(profile.freeDeliveryThreshold));
        if (profile.expectedDeliveryTime) setExpectedDeliveryTime(profile.expectedDeliveryTime);
        setPickupEnabled(profile.pickupEnabled);
        setPickupLocation(profile.pickupLocation ?? '');
      } catch {
        setFormError('Could not load your fulfilment settings.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setFormError(null);
    setFieldErrors({});
    setIsSaving(true);
    try {
      await updateProfile({
        deliveryEnabled,
        pickupEnabled,
        ...(deliveryEnabled
          ? {
              ...(deliveryRadiusKm !== '' ? { deliveryRadiusKm: parseFloat(deliveryRadiusKm) } : {}),
              ...(deliveryCharge !== '' ? { deliveryCharge: parseFloat(deliveryCharge) } : {}),
              ...(minOrderAmount !== '' ? { minOrderAmount: parseFloat(minOrderAmount) } : {}),
              ...(freeDeliveryThreshold !== '' ? { freeDeliveryThreshold: parseFloat(freeDeliveryThreshold) } : {}),
              ...(expectedDeliveryTime !== '' ? { expectedDeliveryTime } : {}),
            }
          : {}),
        ...(pickupEnabled && pickupLocation !== '' ? { pickupLocation } : {}),
      });
      router.push('/settings');
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
    <main className="w-full flex-1 min-h-0 flex flex-col bg-background relative">
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface-glass backdrop-blur-md border-b border-border shrink-0">
        <button className="flex items-center justify-center p-2 text-accent hover:bg-background rounded-full transition-colors -ml-2" onClick={() => router.push('/settings')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-accent">Fulfilment Settings</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto kamai-scrollbar px-container-margin pt-6 pb-24 flex flex-col gap-lg">
        <section className="flex flex-col gap-4">
          <h2 className="font-headline-xl text-headline-xl text-text-primary">How will bakers get their order?</h2>
          <p className="font-body-md text-body-md text-text-secondary">Configure your delivery and pickup options to let customers know how they can receive their goods. At least one must be fully configured.</p>
        </section>

        {formError && (
          <div className="bg-error-bg border border-error-border rounded-lg px-4 py-3">
            <p className="text-body-sm text-error-text">{formError}</p>
          </div>
        )}

        {isLoading ? (
          <p className="text-body-md text-text-secondary">Loading…</p>
        ) : (
        <>
        {/* Delivery Option Card */}
        <div className="bg-surface border border-border rounded-lg p-lg flex flex-col gap-md shadow-[0px_4px_20px_rgba(45,27,20,0.04)]">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent shrink-0">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-text-primary">Delivery</h3>
                <p className="font-body-sm text-body-sm text-text-secondary">Deliver to their address</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input className="sr-only peer" type="checkbox" checked={deliveryEnabled} onChange={(e) => setDeliveryEnabled(e.target.checked)} />
              <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className={`border-t border-border pt-4 flex flex-col gap-4 transition-opacity ${deliveryEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-text-secondary">Delivery Radius (km)</label>
                <input className={`bg-background border text-text-primary font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-accent focus:border-accent outline-none ${fieldErrors.deliveryRadiusKm ? 'border-error-text' : 'border-border'}`} type="number" value={deliveryRadiusKm} onChange={(e) => setDeliveryRadiusKm(e.target.value)} />
                {fieldErrors.deliveryRadiusKm && <p className="text-body-sm text-error-text">{fieldErrors.deliveryRadiusKm}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-text-secondary">Base Charge (₹)</label>
                <input className={`bg-background border text-text-primary font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-accent focus:border-accent outline-none ${fieldErrors.deliveryCharge ? 'border-error-text' : 'border-border'}`} type="number" value={deliveryCharge} onChange={(e) => setDeliveryCharge(e.target.value)} />
                {fieldErrors.deliveryCharge && <p className="text-body-sm text-error-text">{fieldErrors.deliveryCharge}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-text-secondary">Minimum Order (₹)</label>
                <input className={`bg-background border text-text-primary font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-accent focus:border-accent outline-none ${fieldErrors.minOrderAmount ? 'border-error-text' : 'border-border'}`} type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} />
                {fieldErrors.minOrderAmount && <p className="text-body-sm text-error-text">{fieldErrors.minOrderAmount}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-label-sm text-label-sm text-text-secondary">Free Delivery Threshold (₹)</label>
                <input className={`bg-background border text-text-primary font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-accent focus:border-accent outline-none ${fieldErrors.freeDeliveryThreshold ? 'border-error-text' : 'border-border'}`} type="number" value={freeDeliveryThreshold} onChange={(e) => setFreeDeliveryThreshold(e.target.value)} />
                {fieldErrors.freeDeliveryThreshold && <p className="text-body-sm text-error-text">{fieldErrors.freeDeliveryThreshold}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <label className="font-label-sm text-label-sm text-text-secondary">Estimated Delivery Time</label>
              <input className="bg-background border border-border text-text-primary font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-accent focus:border-accent outline-none w-full" type="text" value={expectedDeliveryTime} onChange={(e) => setExpectedDeliveryTime(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Pickup Option Card */}
        <div className="bg-surface border border-border rounded-lg p-lg flex flex-col gap-md shadow-[0px_4px_20px_rgba(45,27,20,0.04)] mb-8">
          <div className="flex justify-between items-start">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center text-text-secondary shrink-0">
                <span className="material-symbols-outlined">storefront</span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-text-primary">Pickup</h3>
                <p className="font-body-sm text-body-sm text-text-secondary">Collect from bakery</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input className="sr-only peer" type="checkbox" checked={pickupEnabled} onChange={(e) => setPickupEnabled(e.target.checked)} />
              <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>

          <div className={`border-t border-border pt-4 flex flex-col gap-4 transition-opacity ${pickupEnabled ? '' : 'opacity-50 pointer-events-none'}`}>
            <div className="flex flex-col gap-2">
              <label className="font-label-sm text-label-sm text-text-secondary">Pickup Location</label>
              <textarea className={`bg-background border text-text-primary font-body-md text-body-md rounded-lg p-3 focus:ring-1 focus:ring-accent focus:border-accent outline-none w-full resize-none ${fieldErrors.pickupLocation ? 'border-error-text' : 'border-border'}`} rows={3} value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="123 Bakery Lane, Pastry District" />
              {fieldErrors.pickupLocation && <p className="text-body-sm text-error-text">{fieldErrors.pickupLocation}</p>}
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Bottom Action Bar (Mobile Sticky) */}
      <div className="absolute bottom-0 left-0 w-full z-40 bg-surface-glass backdrop-blur-md border-t border-border p-container-margin shrink-0">
        <button onClick={handleSave} disabled={isLoading || isSaving} className="w-full h-14 bg-accent text-white font-label-md text-label-md rounded shadow-[0px_4px_20px_rgba(45,27,20,0.08)] hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </main>
  );
}
