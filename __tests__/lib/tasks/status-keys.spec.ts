/**
 * Regression guard for task status key correctness.
 * DB stores statuses as: todo, inprogress, inreview, feedback, done, failed
 * Any hyphenated variant (in-progress, in-review) is a bug.
 */
import {
  statuses,
  statusLabels,
  isTaskPriority,
  taskPriorities,
  hasTaskModule,
  isTaskModuleKey,
  taskModuleKeys,
  getTaskModules,
} from 'lib/tasks';

describe('task status keys — no hyphenated variants', () => {
  it('statuses array contains exactly the 6 correct no-hyphen values', () => {
    expect(statuses).toEqual([
      'todo',
      'inprogress',
      'inreview',
      'feedback',
      'done',
      'failed',
    ]);
  });

  it('statuses array contains no hyphenated variants', () => {
    for (const s of statuses) {
      expect(s).not.toContain('-');
      expect(s).not.toContain('_');
      expect(s).not.toContain(' ');
    }
  });

  it('statusLabels maps all 6 statuses', () => {
    for (const s of statuses) {
      expect(statusLabels).toHaveProperty(s);
      expect(typeof statusLabels[s]).toBe('string');
      expect(statusLabels[s].length).toBeGreaterThan(0);
    }
  });

  it('statusLabels does not have hyphenated variants as keys', () => {
    expect(statusLabels).not.toHaveProperty('in-progress');
    expect(statusLabels).not.toHaveProperty('in-review');
    expect(statusLabels).not.toHaveProperty('in_progress');
    expect(statusLabels).not.toHaveProperty('in_review');
  });
});

describe('task priority helpers', () => {
  it('isTaskPriority accepts valid priorities', () => {
    expect(isTaskPriority('low')).toBe(true);
    expect(isTaskPriority('medium')).toBe(true);
    expect(isTaskPriority('high')).toBe(true);
  });

  it('isTaskPriority rejects unknown values', () => {
    expect(isTaskPriority('urgent')).toBe(false);
    expect(isTaskPriority('')).toBe(false);
    expect(isTaskPriority('LOW')).toBe(false);
  });

  it('taskPriorities contains exactly low, medium, high', () => {
    expect([...taskPriorities]).toEqual(['low', 'medium', 'high']);
  });
});

describe('task module key helpers', () => {
  it('isTaskModuleKey accepts valid module keys', () => {
    for (const key of taskModuleKeys) {
      expect(isTaskModuleKey(key)).toBe(true);
    }
  });

  it('isTaskModuleKey rejects unknown keys', () => {
    expect(isTaskModuleKey('unknown_module')).toBe(false);
    expect(isTaskModuleKey('')).toBe(false);
  });

  it('hasTaskModule detects rpa_procedure', () => {
    expect(hasTaskModule({ rpa_procedure: [{}] }, 'rpa_procedure')).toBe(true);
    expect(hasTaskModule({}, 'rpa_procedure')).toBe(false);
    expect(hasTaskModule({ rpa_procedure: null }, 'rpa_procedure')).toBe(false);
  });

  it('hasTaskModule detects csc_controls via prefixed key', () => {
    expect(
      hasTaskModule(
        { 'csc_controls_ISO/IEC 27001:2022': ['A.5.1'] },
        'csc_controls'
      )
    ).toBe(true);
    expect(hasTaskModule({ csc_controls: ['A.5.1'] }, 'csc_controls')).toBe(
      true
    );
    expect(hasTaskModule({ other_key: ['A.5.1'] }, 'csc_controls')).toBe(false);
  });

  it('getTaskModules returns only modules present in properties', () => {
    const props = { rpa_procedure: [{}], rm_risk: [{}] };
    const modules = getTaskModules(props);
    expect(modules).toContain('rpa_procedure');
    expect(modules).toContain('rm_risk');
    expect(modules).not.toContain('tia_procedure');
    expect(modules).not.toContain('pia_risk');
  });
});
