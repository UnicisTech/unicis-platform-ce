export const fleetMockScenarios = [
  'default',
  'empty',
  'long-content',
  'many-rows',
  'error',
] as const;

export type FleetMockScenario = (typeof fleetMockScenarios)[number];

export const DEFAULT_FLEET_MOCK_SCENARIO: FleetMockScenario = 'default';

export const isFleetMockEnabled = () =>
  process.env.NODE_ENV === 'development' &&
  process.env.NEXT_PUBLIC_FLEET_MODE === 'mock';

export const getFleetMockScenario = (): FleetMockScenario => {
  const configuredScenario = process.env.NEXT_PUBLIC_FLEET_MOCK_SCENARIO;

  return fleetMockScenarios.includes(configuredScenario as FleetMockScenario)
    ? (configuredScenario as FleetMockScenario)
    : DEFAULT_FLEET_MOCK_SCENARIO;
};

export const getFleetMockBadgeLabel = () =>
  `Fleet mock · ${getFleetMockScenario()}`;
