/**
 * Tests the status-counting logic used by the dashboard task matrix.
 * Regression guard: statuses must be counted by their DB values
 * (inprogress / inreview), not hyphenated variants.
 */
import { statuses } from 'lib/tasks';

// Mirror of the STATUS_COLS keys in pages/teams/[slug]/dashboard.tsx
const STATUS_COLS = ['todo', 'inprogress', 'inreview', 'feedback', 'done'];

const countByStatus = (
  tasks: Array<{ status: string }>,
  cols: string[]
): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const col of cols) counts[col] = 0;
  for (const task of tasks) {
    const k = task.status?.toLowerCase();
    if (k !== undefined && k in counts) counts[k]++;
  }
  return counts;
};

describe('dashboard task status matrix counting', () => {
  const sampleTasks = [
    { status: 'todo' },
    { status: 'todo' },
    { status: 'inprogress' },
    { status: 'inreview' },
    { status: 'inreview' },
    { status: 'feedback' },
    { status: 'done' },
    { status: 'done' },
    { status: 'done' },
    { status: 'failed' }, // not in STATUS_COLS, should be ignored
  ];

  it('counts todo correctly', () => {
    const counts = countByStatus(sampleTasks, STATUS_COLS);
    expect(counts['todo']).toBe(2);
  });

  it('counts inprogress correctly (not in-progress)', () => {
    const counts = countByStatus(sampleTasks, STATUS_COLS);
    expect(counts['inprogress']).toBe(1);
    // Guard: hyphenated variant must NOT produce a count
    expect(counts['in-progress']).toBeUndefined();
  });

  it('counts inreview correctly (not in-review)', () => {
    const counts = countByStatus(sampleTasks, STATUS_COLS);
    expect(counts['inreview']).toBe(2);
    expect(counts['in-review']).toBeUndefined();
  });

  it('counts done correctly', () => {
    const counts = countByStatus(sampleTasks, STATUS_COLS);
    expect(counts['done']).toBe(3);
  });

  it('ignores statuses not in STATUS_COLS (e.g. failed)', () => {
    const counts = countByStatus(sampleTasks, STATUS_COLS);
    expect(counts['failed']).toBeUndefined();
  });

  it('all STATUS_COLS keys exist in the canonical statuses list', () => {
    for (const col of STATUS_COLS) {
      expect(statuses).toContain(col);
    }
  });

  it('returns zero for all cols when task list is empty', () => {
    const counts = countByStatus([], STATUS_COLS);
    for (const col of STATUS_COLS) {
      expect(counts[col]).toBe(0);
    }
  });

  it('handles tasks with undefined/null status gracefully', () => {
    const badTasks = [{ status: undefined as any }, { status: null as any }];
    expect(() => countByStatus(badTasks, STATUS_COLS)).not.toThrow();
  });
});
