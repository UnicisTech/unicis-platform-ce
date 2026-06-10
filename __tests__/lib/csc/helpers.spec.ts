import { getCscControlsProp, getCscStatusesProp } from 'lib/csc';
import { CSC_STATUSES, CSC_STATUS_TO_VALUE } from 'lib/csc/csc-statuses';

describe('getCscStatusesProp', () => {
  it('returns a csc_statuses_ prefixed property name', () => {
    const prop = getCscStatusesProp('ISO/IEC 27001:2022' as any);
    expect(prop).toBe('csc_statuses_ISO/IEC 27001:2022');
  });

  it('produces distinct props for different frameworks', () => {
    const prop1 = getCscStatusesProp('ISO/IEC 27001:2022' as any);
    const prop2 = getCscStatusesProp('GDPR' as any);
    expect(prop1).not.toBe(prop2);
  });
});

describe('getCscControlsProp', () => {
  it('returns a csc_controls_ prefixed property name', () => {
    const prop = getCscControlsProp('ISO/IEC 27001:2022' as any);
    expect(prop).toBe('csc_controls_ISO/IEC 27001:2022');
  });

  it('produces distinct props for different frameworks', () => {
    const prop1 = getCscControlsProp('ISO/IEC 27001:2022' as any);
    const prop2 = getCscControlsProp('GDPR' as any);
    expect(prop1).not.toBe(prop2);
  });
});

describe('CSC_STATUSES', () => {
  it('contains all expected status values', () => {
    expect(CSC_STATUSES).toContain('not-performed');
    expect(CSC_STATUSES).toContain('performed-informally');
    expect(CSC_STATUSES).toContain('planned');
    expect(CSC_STATUSES).toContain('well-defined');
    expect(CSC_STATUSES).toContain('quantitatively-controlled');
    expect(CSC_STATUSES).toContain('continuously-improving');
    expect(CSC_STATUSES).toContain('unknown');
    expect(CSC_STATUSES).toContain('not-applicable');
  });

  it('has strictly increasing numeric values for compliance scoring', () => {
    // Each step toward continuously-improving must have a higher value
    const ordered = [
      'unknown',
      'not-applicable',
      'not-performed',
      'performed-informally',
      'planned',
      'well-defined',
      'quantitatively-controlled',
      'continuously-improving',
    ] as const;

    for (let i = 1; i < ordered.length; i++) {
      expect(CSC_STATUS_TO_VALUE[ordered[i]]).toBeGreaterThan(
        CSC_STATUS_TO_VALUE[ordered[i - 1]]
      );
    }
  });
});
