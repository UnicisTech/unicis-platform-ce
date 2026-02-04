export const CSC_STATUSES = [
  'unknown',
  'not-applicable',
  'not-performed',
  'performed-informally',
  'planned',
  'well-defined',
  'quantitatively-controlled',
  'continuously-improving',
] as const;

export const CSC_STATUS_TO_VALUE: Record<CscStatus, number> =
  CSC_STATUSES.reduce(
    (acc, key, index) => {
      acc[key] = index;
      return acc;
    },
    {} as Record<CscStatus, number>
  );

export const CSC_STATUS_TO_CSS: Record<CscStatus, string> = {
  unknown: '',
  'not-applicable': 'bg-[#B2B2B2] text-white',
  'not-performed': 'bg-[#FF0000] text-white',
  'performed-informally': 'bg-[#CA003F] text-white',
  planned: 'bg-[#666666] text-white',
  'well-defined': 'bg-[#FFBE00] text-white',
  'quantitatively-controlled': 'bg-[#6AD900] text-white',
  'continuously-improving': 'bg-[#2F8F00] text-white',
};

export type CscStatus = (typeof CSC_STATUSES)[number];
