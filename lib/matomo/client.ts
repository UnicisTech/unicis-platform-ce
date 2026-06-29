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
