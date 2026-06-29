// Browser-side Matomo tracking helper.
// Wraps @socialgouv/matomo-next, which already manages the _paq queue and
// pageview tracking (see pages/_app.tsx). Use this for events fired from
// React components/hooks running in the browser.

import { push, sendEvent } from '@socialgouv/matomo-next';

type MatomoEventDef = { category: string; action: string };

// name/value must be enums, counts, or categorical buckets only — never
// free text sourced from user-entered data.
export function trackEvent(
  event: MatomoEventDef,
  name?: string,
  value?: number
) {
  if (typeof window === 'undefined') return;

  if (value !== undefined && name !== undefined) {
    sendEvent({
      category: event.category,
      action: event.action,
      name,
      value: String(value),
    });
  } else if (name !== undefined) {
    sendEvent({ category: event.category, action: event.action, name });
  } else {
    sendEvent({ category: event.category, action: event.action });
  }
}

export function setCustomDimension(index: number, value: string) {
  if (typeof window === 'undefined') return;
  push(['setCustomDimension', index, value]);
}

// In-app search (e.g. the ⌘K command palette) is client-side only and never
// hits a URL with a query param, so Matomo's automatic Site Search detection
// can't see it — track it explicitly instead.
export function trackSiteSearch(
  keyword: string,
  category?: string,
  resultsCount?: number
) {
  if (typeof window === 'undefined') return;
  push(['trackSiteSearch', keyword, category ?? null, resultsCount]);
}

// Content Tracking: measures impressions vs. interactions on a named UI
// block (e.g. a pricing card), independent of whether it was clicked.
// name = the specific piece of content (e.g. plan id), piece = the kind of
// block (e.g. "pricing-card"), target = where the CTA points (optional).
export function trackContentImpression(
  name: string,
  piece: string,
  target?: string
) {
  if (typeof window === 'undefined') return;
  push(['trackContentImpression', name, piece, target ?? null]);
}

export function trackContentInteraction(
  interaction: string,
  name: string,
  piece: string,
  target?: string
) {
  if (typeof window === 'undefined') return;
  push(['trackContentInteraction', interaction, name, piece, target ?? null]);
}

// Scans the DOM for data-track-content blocks currently in the viewport and
// fires impressions for them. Call after content that may include such
// blocks renders or changes.
export function trackVisibleContentImpressions(
  checkOnScroll = true,
  timeIntervalInMs = 750
) {
  if (typeof window === 'undefined') return;
  push([
    'trackVisibleContentImpressions',
    checkOnScroll ? 1 : 0,
    timeIntervalInMs,
  ]);
}
