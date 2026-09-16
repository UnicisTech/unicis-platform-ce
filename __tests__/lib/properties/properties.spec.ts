import { Role } from '@/generated/browser';
import {
  asJsonObject,
  getAllCscControls,
  getCscControls,
  getPiaRisk,
  getRpaProcedure,
  getTaskAuditLogs,
  getTaskModules,
  getTeamCscIso,
  getTeamCscStatuses,
  hasCscControls,
  hasTaskModule,
  hasPiaRisk,
  hasRmRisk,
  hasRpaProcedure,
  hasTiaProcedure,
  isJsonObject,
  parseTaskProperties,
  parseTeamProperties,
  cscControlsWriteRequestSchema,
  cscIsoWriteRequestSchema,
  cscStatusWriteRequestSchema,
  piaWriteRequestSchema,
  rmWriteRequestSchema,
  rpaWriteRequestSchema,
  tiaWriteRequestSchema,
  taskMetadataWriteRequestSchema,
  appendTaskAuditLogs,
  deleteTaskProperty,
  setTaskProperty,
  setTeamProperty,
} from '@/lib/properties';
import {
  ISO_VALUES,
  type AuditLog,
  type PiaRisk,
  type RMProcedureInterface,
  type RpaProcedureInterface,
  type TiaShortProcedureInterface,
  type TiaProcedureInterface,
} from 'types';

const validRpaProcedure = [
  {
    reviewDate: '2026-09-15',
    controller: 'Controller',
    dpo: 'user-1',
  },
  {
    purpose: 'Service delivery',
    category: ['contact-data'],
    datasubject: ['customers'],
    retentionperiod: 'one-year',
    specialcategory: [],
    commentsretention: '',
  },
  {
    recipientType: 'processor',
    recipientdetails: 'Processor Ltd',
  },
  {
    datatransfer: false,
    recipient: '',
    country: '',
    guarantee: [],
  },
  {
    toms: ['encryption'],
  },
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
] satisfies RpaProcedureInterface;

const validTiaProcedure = [
  {
    DataExporter: 'Exporter',
    CountryDataExporter: 'DE',
    DataImporter: 'Importer',
    CountryDataImporter: 'US',
    TransferScenario: 'Cloud hosting',
    DataAtIssue: 'Customer records',
    HowDataTransfer: 'API',
    StartDateAssessment: '2026-09-15',
    AssessmentYears: 1,
    LawImporterCountry: 'US',
  },
  {
    EncryptionInTransit: 'yes',
    ReasonEncryptionInTransit: '',
    TransferMechanism: 'yes',
    ReasonTransferMechanism: '',
    LawfulAccess: 'no',
    ReasonLawfulAccess: '',
    MassSurveillanceTelecommunications: 'no',
    ReasonMassSurveillanceTelecommunications: '',
    SelfReportingObligations: 'na',
    ReasonSelfReportingObligations: '',
  },
  {
    WarrantsSubpoenas: '0',
    ReasonWarrantsSubpoenas: '',
    ViolationLocalLaw: '0',
    ReasonViolationLocalLaw: '',
    HighViolationLocalLaw: '0',
    ReasonHighViolationLocalLaw: '',
    HighViolationDataIssue: '0',
    ReasonHighViolationDataIssue: '',
    InvestigatingImporter: '0',
    ReasonInvestigatingImporter: '',
    PastWarrantSubpoena: '0',
    ReasonPastWarrantSubpoena: '',
    DataIssueInvestigation: '0',
    ReasonDataIssueInvestigation: '',
    LocalIssueWarrants: '0',
    ReasonLocalIssueWarrants: '',
    LocalMassSurveillance: '0',
    ReasonLocalMassSurveillance: '',
    LocalAccessMassSurveillance: '0',
    ReasonLocalAccessMassSurveillance: '',
    LocalRoutinelyMonitor: '0',
    ReasonLocalRoutinelyMonitor: '',
    PassMassSurveillance: '0',
    ReasonPassMassSurveillance: '',
    PassMassSurveillanceConnection: '0',
    ReasonPassMassSurveillanceConnection: '',
    ImporterObligation: '0',
    ReasonImporterObligation: '',
    LocalSelfReporting: '0',
    ReasonLocalSelfReporting: '',
    PastSelfReporting: '0',
    ReasonPastSelfReporting: '',
    AssessmentProduceReport: '0',
    ReasonAssessmentProduceReport: '',
  },
  {
    RelevantDataTransferImporter: '',
    ProbabilityDataTransferImporter: '',
    ReasonDataTransferImporter: '',
    RelevantTransferToImporter: '',
    ProbabilityTransferToImporter: '',
    ReasonTransferToImporter: '',
    RelevantTransferToImporterForPerformance: '',
    ProbabilityTransferToImporterPerformance: '',
    ReasonTransferToImporterPerformance: '',
    RelevantLegalGround: '',
    ProbabilityLegalGround: '',
    ReasonLegalGround: '',
    ConnectionTargetedAccess: 'no',
    ReasonConnectionTargetedAccess: '',
    ConnectionSurveillanceTele: 'no',
    ReasonConnectionSurveillanceTele: '',
    ConnectionSelfreportingObligations: 'no',
    ReasonConnectionSelfreportingObligations: '',
  },
] satisfies TiaProcedureInterface;

const validShortTiaProcedure = [
  validTiaProcedure[0],
  validTiaProcedure[1],
] satisfies TiaShortProcedureInterface;

const validPiaRisk = [
  {
    isDataProcessingNecessary: 'necessary',
    isDataProcessingNecessaryAssessment: '',
    isProportionalToPurpose: 'proportional',
    isProportionalToPurposeAssessment: '',
  },
  {
    confidentialityRiskProbability: 'rare',
    confidentialityRiskSecurity: 'minor',
    confidentialityAssessment: '',
  },
  {
    availabilityRiskProbability: 'unlikely',
    availabilityRiskSecurity: 'moderate',
    availabilityAssessment: '',
  },
  {
    transparencyRiskProbability: 'possible',
    transparencyRiskSecurity: 'major',
    transparencyAssessment: '',
  },
  {
    guarantees: '',
    securityMeasures: '',
    securityCompliance: '',
    dealingWithResidualRisk: 'acceptable',
    dealingWithResidualRiskAssessment: '',
    supervisoryAuthorityInvolvement: 'no',
  },
] satisfies PiaRisk;

const validRmRisk = [
  {
    Risk: 'Data loss',
    AssetOwner: 'user-1',
    Impact: 'Availability',
    RawProbability: 2,
    RawImpact: 3,
  },
  {
    RiskTreatment: 'Mitigate',
    TreatmentCost: 'Medium',
    TreatmentStatus: 1,
    TreatedProbability: 1,
    TreatedImpact: 2,
  },
] satisfies RMProcedureInterface;

const validAuditLog = {
  actor: {
    id: 'user-1',
    name: 'User',
    email: 'user@example.com',
    image: null,
    roles: [{ teamId: 'team-1', role: Role.ADMIN }],
  },
  date: 1_757_952_000_000,
  event: 'created',
  diff: null,
} satisfies AuditLog;

describe('JSON properties boundary', () => {
  it.each([null, [], 'value', 1, true])(
    'normalizes non-object JSON value %p to an empty object',
    (value) => {
      expect(isJsonObject(value)).toBe(false);
      expect(asJsonObject(value)).toEqual({});
    }
  );

  it('accepts JSON objects', () => {
    const value = { custom: 'preserved' };

    expect(isJsonObject(value)).toBe(true);
    expect(asJsonObject(value)).toBe(value);
  });
});

describe('properties API request schemas', () => {
  it('prevents the generic task endpoint from bypassing property writers', () => {
    const result = taskMetadataWriteRequestSchema.safeParse({
      data: {
        title: 'Allowed task metadata',
        properties: { rm_risk: [] },
      },
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['data', 'properties']);
    }
  });

  it('accepts valid module writes with an empty previous value', () => {
    expect(
      rpaWriteRequestSchema.safeParse({
        prevProcedure: [],
        nextProcedure: validRpaProcedure,
      }).success
    ).toBe(true);
    expect(
      tiaWriteRequestSchema.safeParse({
        prevProcedure: [],
        nextProcedure: validShortTiaProcedure,
      }).success
    ).toBe(true);
    expect(
      piaWriteRequestSchema.safeParse({
        prevRisk: [],
        nextRisk: validPiaRisk,
      }).success
    ).toBe(true);
    expect(
      rmWriteRequestSchema.safeParse({
        prevRisk: [],
        nextRisk: validRmRisk,
      }).success
    ).toBe(true);
  });

  it('normalizes a four-step PIA to the canonical nullable fifth step', () => {
    const fourStepPia = validPiaRisk.slice(0, 4);
    const result = piaWriteRequestSchema.safeParse({
      prevRisk: [],
      nextRisk: fourStepPia,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nextRisk).toEqual([...fourStepPia, null]);
    }
    expect(getPiaRisk({ pia_risk: fourStepPia })).toEqual([
      ...fourStepPia,
      null,
    ]);
  });

  it('accepts a validated previous value for module updates', () => {
    expect(
      rpaWriteRequestSchema.safeParse({
        prevProcedure: validRpaProcedure,
        nextProcedure: validRpaProcedure,
      }).success
    ).toBe(true);
    expect(
      tiaWriteRequestSchema.safeParse({
        prevProcedure: validTiaProcedure,
        nextProcedure: validShortTiaProcedure,
      }).success
    ).toBe(true);
  });

  it.each([
    ['RPA', rpaWriteRequestSchema, 'nextProcedure'],
    ['TIA', tiaWriteRequestSchema, 'nextProcedure'],
    ['PIA', piaWriteRequestSchema, 'nextRisk'],
    ['RM', rmWriteRequestSchema, 'nextRisk'],
  ])('rejects a malformed %s payload', (_name, schema, nextProperty) => {
    const result = schema.safeParse({
      prevProcedure: [],
      prevRisk: [],
      [nextProperty]: [{ malformed: true }],
    });

    expect(result.success).toBe(false);
  });

  it('enforces operation-specific CSC control counts', () => {
    expect(
      cscControlsWriteRequestSchema.safeParse({
        operation: 'add',
        controls: ['control-1'],
        ISO: 'mvsp',
      }).success
    ).toBe(true);
    expect(
      cscControlsWriteRequestSchema.safeParse({
        operation: 'change',
        controls: ['old-control', 'new-control'],
        ISO: 'iso-2022',
      }).success
    ).toBe(true);
    expect(
      cscControlsWriteRequestSchema.safeParse({
        operation: 'change',
        controls: ['only-one-control'],
        ISO: 'iso-2022',
      }).success
    ).toBe(false);
  });

  it('validates team CSC status and framework writes', () => {
    expect(
      cscStatusWriteRequestSchema.safeParse({
        control: 'control-1',
        value: 'well-defined',
        framework: 'mvsp',
      }).success
    ).toBe(true);
    expect(
      cscStatusWriteRequestSchema.safeParse({
        control: 'control-1',
        value: 'invalid-status',
        framework: 'mvsp',
      }).success
    ).toBe(false);
    expect(cscIsoWriteRequestSchema.safeParse({ iso: ['mvsp'] }).success).toBe(
      true
    );
    expect(
      cscIsoWriteRequestSchema.safeParse({ iso: ['invalid-framework'] }).success
    ).toBe(false);
  });
});

describe('task properties parser', () => {
  it('keeps unknown properties and validates known properties independently', () => {
    const result = parseTaskProperties({
      custom: { preserved: true },
      rpa_procedure: validRpaProcedure,
      rm_risk: [{ invalid: true }],
    });

    expect(result.properties.custom).toEqual({ preserved: true });
    expect(result.properties.rpa_procedure).toEqual(validRpaProcedure);
    expect(result.properties.rm_risk).toBeUndefined();
    expect(result.raw.rm_risk).toEqual([{ invalid: true }]);
    expect(result.issues.some((issue) => issue.path[0] === 'rm_risk')).toBe(
      true
    );
  });

  it('reports a non-object root without throwing', () => {
    const result = parseTaskProperties(null);

    expect(result.properties).toEqual({});
    expect(result.raw).toEqual({});
    expect(result.issues).toEqual([
      { path: [], message: 'Task properties must be a JSON object' },
    ]);
  });

  it('does not treat an empty array as a valid procedure', () => {
    const result = parseTaskProperties({ rpa_procedure: [] });

    expect(result.properties.rpa_procedure).toBeUndefined();
    expect(result.issues[0]?.path[0]).toBe('rpa_procedure');
    expect(hasRpaProcedure({ rpa_procedure: [] })).toBe(false);
  });
});

describe('task properties selectors', () => {
  it('recognizes valid feature payloads', () => {
    const properties = {
      rpa_procedure: validRpaProcedure,
      tia_procedure: validTiaProcedure,
      pia_risk: validPiaRisk,
      rm_risk: validRmRisk,
    };

    expect(getRpaProcedure(properties)).toEqual(validRpaProcedure);
    expect(hasRpaProcedure(properties)).toBe(true);
    expect(hasTiaProcedure(properties)).toBe(true);
    expect(hasPiaRisk(properties)).toBe(true);
    expect(hasRmRisk(properties)).toBe(true);
    expect(getTaskModules(properties)).toEqual([
      'rpa_procedure',
      'tia_procedure',
      'pia_risk',
      'rm_risk',
    ]);
  });

  it('recognizes a TIA that legitimately finishes after step two', () => {
    expect(hasTiaProcedure({ tia_procedure: validShortTiaProcedure })).toBe(
      true
    );
  });

  it('does not recognize empty arrays as feature payloads', () => {
    expect(
      getTaskModules({
        rpa_procedure: [],
        tia_procedure: [],
        pia_risk: [],
        rm_risk: [],
      })
    ).toEqual([]);
    expect(hasTaskModule({ rpa_procedure: [] }, 'rpa_procedure')).toBe(false);
  });

  it('returns empty audit collections for missing or malformed values', () => {
    expect(getTaskAuditLogs({})).toEqual([]);
    expect(getTaskAuditLogs({ task_audit_logs: 'invalid' })).toEqual([]);
    expect(getTaskAuditLogs({ task_audit_logs: [validAuditLog] })).toEqual([
      validAuditLog,
    ]);
  });

  it('reads and combines dynamic and legacy CSC controls without duplicates', () => {
    const properties = {
      csc_controls_mvsp: ['mvsp-1', 'shared'],
      'csc_controls_iso-2022': ['iso-1', 'shared'],
      csc_controls: ['legacy-1'],
    };

    expect(getCscControls(properties, 'mvsp')).toEqual(['mvsp-1', 'shared']);
    expect(getAllCscControls(properties)).toEqual([
      'mvsp-1',
      'shared',
      'iso-1',
      'legacy-1',
    ]);
    expect(hasCscControls(properties)).toBe(true);
    expect(hasTaskModule(properties, 'csc_controls')).toBe(true);
    expect(getTaskModules(properties)).toEqual(['csc_controls']);
  });

  it('rejects malformed CSC controls', () => {
    const properties = { csc_controls_mvsp: ['valid', 42] };

    expect(getCscControls(properties, 'mvsp')).toEqual([]);
    expect(hasCscControls(properties)).toBe(false);
  });

  it.each(ISO_VALUES)('reads the dynamic CSC key for %s', (iso) => {
    const properties = { [`csc_controls_${iso}`]: [`${iso}-control`] };

    expect(getCscControls(properties, iso)).toEqual([`${iso}-control`]);
  });
});

describe('team properties parser and selectors', () => {
  it('reads enabled frameworks and per-framework statuses', () => {
    const properties = {
      csc_iso: ['mvsp', 'iso-2022'],
      csc_statuses_mvsp: {
        'control-1': 'unknown',
        'control-2': 'well-defined',
      },
      custom: true,
    };

    expect(getTeamCscIso(properties)).toEqual(['mvsp', 'iso-2022']);
    expect(getTeamCscStatuses(properties, 'mvsp')).toEqual({
      'control-1': 'unknown',
      'control-2': 'well-defined',
    });
    expect(parseTeamProperties(properties).properties.custom).toBe(true);
  });

  it('isolates malformed known properties and preserves their raw values', () => {
    const result = parseTeamProperties({
      csc_iso: ['not-a-framework'],
      csc_statuses_mvsp: { 'control-1': 'not-a-status' },
    });

    expect(result.properties.csc_iso).toBeUndefined();
    expect(result.properties.csc_statuses_mvsp).toBeUndefined();
    expect(result.raw.csc_iso).toEqual(['not-a-framework']);
    expect(result.issues).toHaveLength(2);
  });
});

describe('properties writers', () => {
  it('sets a task property immutably and preserves raw sibling values', () => {
    const source = {
      custom: { preserved: true },
      rm_risk: [{ malformed: true }],
    };

    const result = setTaskProperty(source, 'rpa_procedure', validRpaProcedure);

    expect(result).toEqual({
      ...source,
      rpa_procedure: validRpaProcedure,
    });
    expect(source).not.toHaveProperty('rpa_procedure');
  });

  it('deletes a task property without mutating the source', () => {
    const source = {
      custom: true,
      rpa_procedure: validRpaProcedure,
    };

    const result = deleteTaskProperty(source, 'rpa_procedure');

    expect(result).toEqual({ custom: true });
    expect(source.rpa_procedure).toEqual(validRpaProcedure);
  });

  it('appends to audit arrays without discarding legacy entries', () => {
    const source = { task_audit_logs: [validAuditLog], custom: true };
    const secondLog = { ...validAuditLog, date: validAuditLog.date + 1 };
    const legacyLog = { legacy: true };

    expect(appendTaskAuditLogs(source, 'task_audit_logs', [secondLog])).toEqual(
      {
        task_audit_logs: [validAuditLog, secondLog],
        custom: true,
      }
    );
    expect(
      appendTaskAuditLogs(
        { task_audit_logs: [legacyLog], custom: true },
        'task_audit_logs',
        [validAuditLog]
      )
    ).toEqual({
      task_audit_logs: [legacyLog, validAuditLog],
      custom: true,
    });
  });

  it('starts a new audit collection when the stored value is not an array', () => {
    expect(
      appendTaskAuditLogs(
        { task_audit_logs: 'malformed', custom: true },
        'task_audit_logs',
        [validAuditLog]
      )
    ).toEqual({ task_audit_logs: [validAuditLog], custom: true });
  });

  it('sets a team property immutably and preserves unknown keys', () => {
    const source = { custom: true, csc_iso: ['mvsp'] };

    const result = setTeamProperty(source, 'csc_iso', ['iso-2022']);

    expect(result).toEqual({ custom: true, csc_iso: ['iso-2022'] });
    expect(source.csc_iso).toEqual(['mvsp']);
  });
});
