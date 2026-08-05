"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { getProfile, updateProfile } from '@/lib/api/profile';
import { ApiError, fieldErrorsFrom } from '@/lib/api/client';

export default function BusinessProfileSettings() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [serviceRadiusKm, setServiceRadiusKm] = useState(25);
  const [alwaysAvailable, setAlwaysAvailable] = useState(false);
  const [businessHoursOpen, setBusinessHoursOpen] = useState('09:00');
  const [businessHoursClose, setBusinessHoursClose] = useState('17:00');

  useEffect(() => {
    (async () => {
      try {
        const profile = await getProfile();
        setBusinessName(profile.businessName ?? '');
        setBusinessType(profile.businessType ?? '');
        setAddress(profile.address ?? '');
        setLatitude(profile.latitude !== null ? String(profile.latitude) : '');
        setLongitude(profile.longitude !== null ? String(profile.longitude) : '');
        if (profile.serviceRadiusKm !== null) setServiceRadiusKm(profile.serviceRadiusKm);
        setAlwaysAvailable(profile.alwaysAvailable);
        if (profile.businessHoursOpen) setBusinessHoursOpen(profile.businessHoursOpen);
        if (profile.businessHoursClose) setBusinessHoursClose(profile.businessHoursClose);
      } catch {
        setFormError('Could not load your business profile. Please try again.');
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
        businessName,
        businessType,
        address,
        ...(latitude !== '' ? { latitude: parseFloat(latitude) } : {}),
        ...(longitude !== '' ? { longitude: parseFloat(longitude) } : {}),
        serviceRadiusKm,
        alwaysAvailable,
        ...(alwaysAvailable ? {} : { businessHoursOpen, businessHoursClose }),
      });
      router.push('/settings');
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(fieldErrorsFrom(err));
        if (err.validationIssues) {
          setFormError('Please fix the highlighted fields.');
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="w-full flex-1 min-h-0 flex flex-col bg-background relative">
      {/* Top Navigation */}
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface-glass backdrop-blur-md border-b border-border shrink-0">
        <button className="text-text-secondary hover:bg-surface rounded-full p-2 transition-transform duration-200 active:scale-95 flex items-center justify-center -ml-2" onClick={() => router.push('/settings')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-headline-lg-mobile font-bold text-text-primary absolute left-1/2 -translate-x-1/2">Business Profile</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content Container */}
      <div className="flex-1 overflow-y-auto kamai-scrollbar px-container-margin pt-6 pb-24">
        <div className="mb-8">
          <h2 className="text-headline-xl text-text-primary mb-2">Tell us about your business.</h2>
          <p className="text-body-md text-text-secondary">This information will be displayed to your wholesale customers in the Kamai catalogue.</p>
        </div>

        {isLoading ? (
          <p className="text-body-md text-text-secondary">Loading…</p>
        ) : (
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {formError && (
            <div className="bg-error-bg border border-error-border rounded-lg px-4 py-3">
              <p className="text-body-sm text-error-text">{formError}</p>
            </div>
          )}

          {/* Business Name */}
          <div>
            <label className="block text-label-md text-text-secondary mb-2" htmlFor="business-name">Business Name</label>
            <input
              className={`w-full bg-surface border rounded-lg px-4 py-3 text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-secondary/50 ${fieldErrors.businessName ? 'border-error-text' : 'border-border'}`}
              id="business-name"
              placeholder="e.g. Acme Bakery Supplies"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
            {fieldErrors.businessName && <p className="text-body-sm text-error-text mt-1">{fieldErrors.businessName}</p>}
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-label-md text-text-secondary mb-2" htmlFor="business-type">Business Type</label>
            <input
              className={`w-full bg-surface border rounded-lg px-4 py-3 text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-secondary/50 ${fieldErrors.businessType ? 'border-error-text' : 'border-border'}`}
              id="business-type"
              placeholder="e.g. Dairy, Grains, Bakery Supplies"
              type="text"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
            />
            {fieldErrors.businessType && <p className="text-body-sm text-error-text mt-1">{fieldErrors.businessType}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-label-md text-text-secondary mb-2" htmlFor="address">Business Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-text-secondary">location_on</span>
              </div>
              <input
                className={`w-full bg-surface border rounded-lg py-3 pr-4 pl-10 text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-secondary/50 ${fieldErrors.address ? 'border-error-text' : 'border-border'}`}
                id="address"
                placeholder="Street, city, postcode"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            {fieldErrors.address && <p className="text-body-sm text-error-text mt-1">{fieldErrors.address}</p>}
          </div>

          {/* Latitude / Longitude */}
          <div className="grid grid-cols-2 gap-gutter">
            <div>
              <label className="block text-label-md text-text-secondary mb-2" htmlFor="latitude">Latitude</label>
              <input
                className={`w-full bg-surface border rounded-lg px-4 py-3 text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${fieldErrors.latitude ? 'border-error-text' : 'border-border'}`}
                id="latitude"
                placeholder="12.9"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
              {fieldErrors.latitude && <p className="text-body-sm text-error-text mt-1">{fieldErrors.latitude}</p>}
            </div>
            <div>
              <label className="block text-label-md text-text-secondary mb-2" htmlFor="longitude">Longitude</label>
              <input
                className={`w-full bg-surface border rounded-lg px-4 py-3 text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${fieldErrors.longitude ? 'border-error-text' : 'border-border'}`}
                id="longitude"
                placeholder="77.5"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
              {fieldErrors.longitude && <p className="text-body-sm text-error-text mt-1">{fieldErrors.longitude}</p>}
            </div>
          </div>

          {/* Service Radius Slider */}
          <div className="bg-surface p-4 rounded-lg border border-border">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-label-md text-text-secondary mb-0" htmlFor="radius-slider">Service Radius</label>
              <span className="text-label-md text-accent bg-accent/10 px-3 py-1 rounded-full">{serviceRadiusKm} km</span>
            </div>
            <input
              className="w-full kamai-range"
              id="radius-slider"
              max="100"
              min="5"
              type="range"
              value={serviceRadiusKm}
              onChange={(e) => setServiceRadiusKm(parseInt(e.target.value))}
            />
            <div className="flex justify-between text-body-sm text-text-secondary/70 mt-2">
              <span>5 km</span>
              <span>100 km</span>
            </div>
          </div>

          {/* Business Hours */}
          <div className="border border-border rounded-lg p-lg bg-surface">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-label-md text-text-secondary mb-0">Business Hours</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input className="sr-only peer" type="checkbox" checked={alwaysAvailable} onChange={(e) => setAlwaysAvailable(e.target.checked)} />
                <div className="w-11 h-6 bg-text-primary/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                <span className="ml-3 text-label-sm text-text-secondary">Always available</span>
              </label>
            </div>

            <div className="space-y-4 transition-opacity" style={{ opacity: alwaysAvailable ? 0.5 : 1, pointerEvents: alwaysAvailable ? 'none' : 'auto' }}>
              <div className="flex items-center space-x-4">
                <span className="w-12 text-body-sm text-text-secondary">Open</span>
                <input
                  className="w-full bg-surface border border-border rounded-lg py-2 px-3 text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  type="time"
                  value={businessHoursOpen}
                  onChange={(e) => setBusinessHoursOpen(e.target.value)}
                />
                <span className="text-text-secondary">-</span>
                <input
                  className="w-full bg-surface border border-border rounded-lg py-2 px-3 text-body-md text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                  type="time"
                  value={businessHoursClose}
                  onChange={(e) => setBusinessHoursClose(e.target.value)}
                />
              </div>
            </div>
          </div>
        </form>
        )}
      </div>

      {/* Bottom Anchored Primary Action */}
      <div className="absolute bottom-0 left-0 w-full p-container-margin bg-surface-glass backdrop-blur-md border-t border-border shadow-[0px_-4px_20px_rgba(45,27,20,0.08)] z-10 shrink-0">
        <Button variant="primary" className="w-full" onClick={handleSave} disabled={isLoading || isSaving}>
          {isSaving ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </main>
  );
}
