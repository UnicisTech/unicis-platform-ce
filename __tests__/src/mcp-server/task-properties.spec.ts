import {
  getAllCscControls,
  getRmRisk,
  hasPiaRisk,
  hasRpaProcedure,
  hasTiaProcedure,
} from '@/src/mcp-server/src/task-properties';

describe('MCP task properties adapter', () => {
  it('reads dynamic and legacy CSC controls without hardcoded frameworks', () => {
    expect(
      getAllCscControls({
        csc_controls_mvsp: ['mvsp-1', 'shared'],
        csc_controls_future_framework: ['future-1', 'shared'],
        csc_controls: ['legacy-1'],
      })
    ).toEqual(['mvsp-1', 'shared', 'future-1', 'legacy-1']);
  });

  it('recognizes only the actual module property names and tuple lengths', () => {
    expect(hasRpaProcedure({ rpa_procedure: Array(6).fill({}) })).toBe(true);
    expect(hasTiaProcedure({ tia_procedure: [{}, {}] })).toBe(true);
    expect(hasPiaRisk({ pia_risk: [{}, {}, {}, {}, null] })).toBe(true);
    expect(hasPiaRisk({ pia_procedure: [{}, {}, {}, {}, null] })).toBe(false);
    expect(getRmRisk({ rm_risk: [{}, {}] })).toEqual([{}, {}]);
    expect(getRmRisk({ rm_risk: [] })).toBeUndefined();
  });
});
