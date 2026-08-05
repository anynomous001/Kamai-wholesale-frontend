"use client";
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCatalogueImportBatch,
  publishCatalogueImport,
  updateCatalogueImportRow,
  uploadCatalogueImport,
} from '@/lib/api/catalogue';
import { ApiError } from '@/lib/api/client';
import type { CatalogueImportBatch, CatalogueImportRow, PublishImportResult } from '@/lib/api/types';
import { ImportRowCard } from '@/components/ui/ImportRowCard';

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 60_000;

export default function CatalogueImport() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [batch, setBatch] = useState<CatalogueImportBatch | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [publishResult, setPublishResult] = useState<PublishImportResult | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isApprovingAll, setIsApprovingAll] = useState(false);

  useEffect(() => {
    if (!batch || batch.status !== 'PROCESSING') return;

    let cancelled = false;
    const startedAt = Date.now();

    const poll = async () => {
      if (cancelled) return;
      if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
        setPollTimedOut(true);
        return;
      }
      try {
        const updated = await getCatalogueImportBatch(batch.id);
        if (cancelled) return;
        setBatch(updated);
        if (updated.status === 'PROCESSING') {
          setTimeout(poll, POLL_INTERVAL_MS);
        }
      } catch {
        if (!cancelled) setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    const timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batch?.id, batch?.status]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setPollTimedOut(false);
    setPublishResult(null);
    setIsUploading(true);
    try {
      const created = await uploadCatalogueImport(file);
      setBatch(created);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRowUpdated = (updatedRow: CatalogueImportRow) => {
    setBatch((prev) => {
      if (!prev) return prev;
      return { ...prev, rows: prev.rows.map((r) => (r.id === updatedRow.id ? updatedRow : r)) };
    });
  };

  const handleApproveAll = async () => {
    if (!batch) return;
    setIsApprovingAll(true);
    try {
      const eligible = batch.rows.filter((r) => !r.approved && !r.hasMissingFields);
      for (const row of eligible) {
        try {
          const updated = await updateCatalogueImportRow(batch.id, row.id, { approved: true });
          handleRowUpdated(updated);
        } catch {
          // leave this row as-is; user can approve manually and see the field-level error
        }
      }
    } finally {
      setIsApprovingAll(false);
    }
  };

  const handlePublish = async () => {
    if (!batch) return;
    setPublishError(null);
    setIsPublishing(true);
    try {
      const result = await publishCatalogueImport(batch.id);
      setPublishResult(result);
      setBatch((prev) => (prev ? { ...prev, status: 'PUBLISHED' } : prev));
    } catch (err) {
      setPublishError(err instanceof ApiError ? err.message : 'Could not publish this batch.');
    } finally {
      setIsPublishing(false);
    }
  };

  const resetToUpload = () => {
    setBatch(null);
    setUploadError(null);
    setPollTimedOut(false);
    setPublishResult(null);
    setPublishError(null);
  };

  const approvedCount = batch?.rows.filter((r) => r.approved).length ?? 0;
  const isPublished = batch?.status === 'PUBLISHED';

  return (
    <main className="w-full flex-1 min-h-0 flex flex-col bg-background relative">
      <header className="sticky top-0 left-0 w-full z-50 flex justify-between items-center px-container-margin h-14 bg-surface border-b border-border shrink-0">
        <button className="text-text-secondary hover:bg-background p-2 rounded-full transition-colors flex items-center justify-center -ml-2" onClick={() => router.push('/catalogue')}>
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-semibold text-accent truncate text-center flex-1 mx-4">Import your products</h1>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto kamai-scrollbar px-container-margin pt-6 pb-24">
        {!batch && (
          <div className="flex flex-col items-center justify-center text-center gap-md py-12">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <span className="material-symbols-outlined text-4xl">upload_file</span>
            </div>
            <h2 className="font-headline-xl text-headline-xl text-text-primary">Upload your price list</h2>
            <p className="font-body-md text-body-md text-text-secondary max-w-[320px]">
              .xlsx and .csv are reviewed instantly. Photos (.jpg/.png) and .pdf go through AI extraction — this can take a few seconds.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv,.jpg,.jpeg,.png,.pdf"
              className="hidden"
              id="import-file"
              onChange={handleFileSelected}
              disabled={isUploading}
            />
            <label
              htmlFor="import-file"
              className={`font-label-md text-label-md rounded px-6 py-3 cursor-pointer transition-colors ${isUploading ? 'bg-background text-text-secondary' : 'bg-accent text-white hover:bg-accent-hover'}`}
            >
              {isUploading ? 'Uploading…' : 'Choose file'}
            </label>
            {uploadError && <p className="text-body-sm text-error-text">{uploadError}</p>}
          </div>
        )}

        {batch && batch.status === 'PROCESSING' && !pollTimedOut && (
          <div className="flex flex-col items-center justify-center text-center gap-md py-16">
            <span className="material-symbols-outlined text-5xl text-accent animate-spin">progress_activity</span>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">Extracting your products…</h2>
            <p className="font-body-md text-body-md text-text-secondary">This usually takes a few seconds.</p>
          </div>
        )}

        {batch && batch.status === 'PROCESSING' && pollTimedOut && (
          <div className="flex flex-col items-center justify-center text-center gap-md py-16">
            <span className="material-symbols-outlined text-5xl text-error-text">error</span>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">This is taking longer than expected</h2>
            <p className="font-body-md text-body-md text-text-secondary">Please try re-uploading the file.</p>
            <button onClick={resetToUpload} className="font-label-md text-label-md text-accent underline">Re-upload</button>
          </div>
        )}

        {batch && batch.status === 'FAILED' && (
          <div className="flex flex-col items-center justify-center text-center gap-md py-16">
            <span className="material-symbols-outlined text-5xl text-error-text">error</span>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">Extraction failed</h2>
            <p className="font-body-md text-body-md text-text-secondary">{batch.errorMessage ?? 'Something went wrong reading this file.'}</p>
            <button onClick={resetToUpload} className="font-label-md text-label-md text-accent underline">Re-upload</button>
          </div>
        )}

        {batch && (batch.status === 'REVIEW' || batch.status === 'PUBLISHED') && !publishResult && (
          <>
            <div className="flex justify-between items-center mb-lg gap-sm">
              <div>
                <p className="font-body-sm text-body-sm text-text-secondary">Import Progress</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary font-semibold">{approvedCount}</span>
                  <span className="font-body-md text-body-md text-text-secondary">of {batch.rows.length} approved</span>
                </div>
              </div>
              <button
                onClick={handleApproveAll}
                disabled={isPublished || isApprovingAll}
                className="font-label-md text-label-md text-accent hover:text-accent-hover transition-colors py-2 px-4 rounded-full bg-accent/10 hover:bg-accent/20 border border-accent/20 disabled:opacity-50"
              >
                {isApprovingAll ? 'Approving…' : 'Approve all'}
              </button>
            </div>

            <div className="flex flex-col gap-md">
              {batch.rows.map((row) => (
                <ImportRowCard key={row.id} batchId={batch.id} row={row} onUpdated={handleRowUpdated} disabled={isPublished} />
              ))}
            </div>

            {publishError && <p className="text-body-sm text-error-text mt-md">{publishError}</p>}
          </>
        )}

        {publishResult && (
          <div className="flex flex-col items-center justify-center text-center gap-md py-16">
            <span className="material-symbols-outlined text-5xl text-accent" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-text-primary">Published</h2>
            <p className="font-body-md text-body-md text-text-secondary">
              {publishResult.publishedCount} product{publishResult.publishedCount === 1 ? '' : 's'} added
              {publishResult.skippedCount > 0 ? `, ${publishResult.skippedCount} skipped (not approved)` : ''}.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action */}
      {batch && (batch.status === 'REVIEW' || batch.status === 'PUBLISHED') && (
        <div className="absolute bottom-0 left-0 right-0 p-container-margin bg-surface-glass backdrop-blur-md shadow-[0px_-4px_20px_rgba(45,27,20,0.08)] z-50 border-t border-border shrink-0">
          {publishResult || isPublished ? (
            <button onClick={() => router.push('/catalogue')} className="w-full h-[56px] rounded bg-accent text-white font-label-md text-label-md font-bold shadow-md hover:bg-accent-hover transition-colors flex items-center justify-center gap-2">
              Back to Catalogue
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isPublishing || approvedCount === 0}
              className="w-full h-[56px] rounded bg-accent text-white font-label-md text-label-md font-bold shadow-md hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">cloud_upload</span>
              {isPublishing ? 'Publishing…' : `Publish Reviewed Products (${approvedCount})`}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
