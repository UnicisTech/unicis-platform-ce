import { useAuditorStats } from 'hooks/fleets/distributors/useAuditorStats';

const mockUseSWR = jest.fn(
  (_key?: unknown, _fetcher?: unknown, _config?: unknown) => ({
    data: undefined,
    error: undefined,
    isLoading: false,
  })
);

jest.mock('swr', () => ({
  __esModule: true,
  default: (key: unknown, fetcher: unknown, config: unknown) =>
    mockUseSWR(key, fetcher, config),
}));

jest.mock('lib/fleet/fleetFetcher', () => jest.fn());

describe('useAuditorStats', () => {
  beforeEach(() => {
    mockUseSWR.mockClear();
  });

  it('fetches aggregate stats for the selected team', () => {
    useAuditorStats('team-id');

    expect(mockUseSWR).toHaveBeenCalledWith(
      '/manager/team-id/analysis/auditor-stats',
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('does not fetch while the Asset Management module is unavailable', () => {
    useAuditorStats('team-id', { skip: true });

    expect(mockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object)
    );
  });
});
