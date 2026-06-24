// Server-side Matomo tracking helper, for events fired from API routes.
// API routes have no access to the browser _paq queue, so this hits the
// Matomo Tracking HTTP API directly: https://matomo.org/docs/tracking-api/
//
// Always fire-and-forget — never await this in a way that blocks the
// response, and never let a tracking failure surface as an API error.

import env from '@/lib/env';

type MatomoEventDef = { category: string; action: string };

export function trackServerEvent(
  event: MatomoEventDef,
  name?: string,
  value?: number
): void {
  if (!env.matomo.enabled || !env.matomo.url || !env.matomo.siteId) return;
  if (typeof fetch !== 'function') return;

  const params = new URLSearchParams({
    idsite: env.matomo.siteId,
    rec: '1',
    e_c: event.category,
    e_a: event.action,
    rand: String(Math.random()),
  });
  if (name !== undefined) params.set('e_n', name);
  if (value !== undefined) params.set('e_v', String(value));

  const url = `${env.matomo.url.replace(/\/$/, '')}/matomo.php?${params}`;
  try {
    fetch(url, { method: 'GET' }).catch(() => {});
  } catch {
    // never let a tracking failure surface as an API error
  }
}
