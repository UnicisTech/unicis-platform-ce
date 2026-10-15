import useSWR from 'swr';
import type { ISO } from 'types';

/** Frameworks that ship implementation guidance in public/csc-guidance. */
export const FRAMEWORKS_WITH_GUIDANCE: ISO[] = [
  'eunis2_2024_2690',
  'ccb_cff_2023',
  'ccb_cff_2025',
];

export interface ControlGuidance {
  code: string;
  guidance: string;
  evidence: string;
}

interface GuidanceFile {
  groups: Record<string, ControlGuidance>;
  controls: Record<string, string>;
}

// Guidance is large, so it is fetched on demand as a static file instead of
// being part of the i18n namespace. Locales without a translation fall back
// to English.
const fetchGuidance = async ([framework, locale]: [
  ISO,
  string,
]): Promise<GuidanceFile | null> => {
  for (const lang of locale === 'en' ? ['en'] : [locale, 'en']) {
    const res = await fetch(`/csc-guidance/${lang}/${framework}.json`);
    if (res.ok) return res.json();
  }
  return null;
};

const useControlGuidance = (
  framework: ISO,
  controlId: string,
  locale = 'en'
) => {
  const enabled = FRAMEWORKS_WITH_GUIDANCE.includes(framework);
  const { data, error } = useSWR(
    enabled ? [framework, locale] : null,
    fetchGuidance,
    { revalidateOnFocus: false }
  );

  const group = data?.controls[controlId];

  return {
    guidance: group ? data.groups[group] : null,
    isLoading: enabled && !error && data === undefined,
  };
};

export default useControlGuidance;
