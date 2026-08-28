import type {
  FleetAccess,
  FleetMember,
  FleetSecret,
  FleetTeam,
  FleetUser,
} from '@/types/fleet';

const CREATED_AT = '2026-01-12T09:00:00.000Z';
const UPDATED_AT = '2026-01-20T14:30:00.000Z';

export const MOCK_FLEET_TEAM_ID = 'mock-fleet-team-0001';
export const MOCK_FLEET_USER_ID = 'mock-fleet-user-0001';
export const MOCK_FLEET_MEMBER_ID = 'mock-fleet-member-0001';

export const createMockFleetUser = (): FleetUser => ({
  id: MOCK_FLEET_USER_ID,
  email: 'developer@fleet-mock.example.test',
  firstname: 'Fleet',
  lastname: 'Developer',
  name: 'Fleet Developer',
  created_at: CREATED_AT,
  updated_at: UPDATED_AT,
});

export const createMockFleetTeam = (
  teamId = MOCK_FLEET_TEAM_ID
): FleetTeam => ({
  id: teamId,
  name: 'Fleet Mock Development Team',
  user: createMockFleetUser(),
  ca_certificate:
    '-----BEGIN CERTIFICATE-----\nFLEET-MOCK-NOT-A-REAL-CERTIFICATE\n-----END CERTIFICATE-----',
  ca_private_key: null,
});

export const createMockFleetMember = (
  teamId = MOCK_FLEET_TEAM_ID
): FleetMember => ({
  id: MOCK_FLEET_MEMBER_ID,
  joined_at: CREATED_AT,
  role: 'owner',
  team_id: teamId,
  user_id: MOCK_FLEET_USER_ID,
  user: createMockFleetUser(),
});

export const createMockFleetAccess = (): FleetAccess => ({
  id: 'mock-fleet-access-0001',
  created_at: CREATED_AT,
  updated_at: UPDATED_AT,
  expiration_date: '2099-12-31T23:59:59.000Z',
  is_active: true,
  is_expired: false,
  secret_key: 'FLEET_MOCK_ACCESS_TOKEN_NOT_REAL',
  user: MOCK_FLEET_USER_ID,
});

export const createMockFleetSecret = (
  teamId = MOCK_FLEET_TEAM_ID
): FleetSecret => ({
  id: 'mock-fleet-secret-0001',
  secret: 'FLEET_MOCK_ENROLLMENT_SECRET_NOT_REAL',
  team_id: teamId,
  created_at: CREATED_AT,
  updated_at: UPDATED_AT,
});

export const mockFleetConnection = {
  status: 'CONNECTED' as const,
  disconnectedAt: null,
  deleteAfter: null,
  deletedAt: null,
  cleanupError: null,
};
