const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

const endOfDayUtc = (dateOnly: string) => {
  const [year, month, day] = dateOnly.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
};

export type DueDateParseResult = {
  value: Date | null;
  valid: boolean;
};

export const parseDueDateInput = (
  input: unknown
): DueDateParseResult => {
  if (input === null || input === undefined) {
    return { value: null, valid: true };
  }

  if (input instanceof Date) {
    if (isNaN(input.getTime())) {
      return { value: null, valid: false };
    }
    return { value: input, valid: true };
  }

  if (typeof input !== 'string') {
    return { value: null, valid: false };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { value: null, valid: true };
  }

  if (DATE_ONLY_RE.test(trimmed)) {
    return { value: endOfDayUtc(trimmed), valid: true };
  }

  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) {
    return { value: null, valid: false };
  }

  return { value: parsed, valid: true };
};
