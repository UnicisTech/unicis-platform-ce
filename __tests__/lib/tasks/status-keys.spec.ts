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

const validRpaProcedure = [
  { reviewDate: '', controller: '', dpo: '' },
  {
    category: [],
    datasubject: [],
    retentionperiod: '',
    specialcategory: [],
  },
  { recipientType: '' },
  { datatransfer: false, recipient: '', country: '', guarantee: [] },
  { toms: [] },
  {
    involveProfiling: 'no',
    useAutomated: 'no',
    involveSurveillance: 'no',
    processedSpecialCategories: 'no',
    isBigData: 'no',
    dataSetsCombined: 'no',
    multipleControllers: 'no',
    imbalanceInRelationship: 'no',
    innovativeTechnologyUsed: 'no',
    transferredOutside: 'no',
    rightsRestricted: 'no',
    piaNeeded: 'no',
  },
];

const validRmRisk = [
  {
    Risk: 'Risk',
    AssetOwner: 'owner-1',
    Impact: 'Impact',
    RawProbability: 40,
    RawImpact: 60,
  },
  {
    RiskTreatment: 'Mitigate',
    TreatmentCost: '100',
    TreatmentStatus: 50,
    TreatedProbability: 20,
    TreatedImpact: 40,
  },
];

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
    expect(
      hasTaskModule({ rpa_procedure: validRpaProcedure }, 'rpa_procedure')
    ).toBe(true);
    expect(hasTaskModule({}, 'rpa_procedure')).toBe(false);
    expect(hasTaskModule({ rpa_procedure: null }, 'rpa_procedure')).toBe(false);
    expect(hasTaskModule({ rpa_procedure: [{}] }, 'rpa_procedure')).toBe(false);
  });

  it('hasTaskModule detects csc_controls via prefixed key', () => {
    expect(
      hasTaskModule({ 'csc_controls_iso-2022': ['A.5.1'] }, 'csc_controls')
    ).toBe(true);
    expect(hasTaskModule({ csc_controls: ['A.5.1'] }, 'csc_controls')).toBe(
      true
    );
    expect(hasTaskModule({ other_key: ['A.5.1'] }, 'csc_controls')).toBe(false);
  });

  it('getTaskModules returns only modules present in properties', () => {
    const props = {
      rpa_procedure: validRpaProcedure,
      rm_risk: validRmRisk,
    };
    const modules = getTaskModules(props);
    expect(modules).toContain('rpa_procedure');
    expect(modules).toContain('rm_risk');
    expect(modules).not.toContain('tia_procedure');
    expect(modules).not.toContain('pia_risk');
  });
});
