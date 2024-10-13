import { Role } from '@prisma/client';

export type RoleType = (typeof Role)[keyof typeof Role];
export type Action = 'create' | 'update' | 'read' | 'delete' | 'leave';
export type Resource =
  | 'team'
  | 'team_member'
  | 'team_invitation'
  | 'team_billing'
  | 'team_sso'
  | 'team_dsync'
  | 'team_audit_log'
  | 'team_webhook'
  | 'team_api_key'
  | 'task'
  | 'iap'
  | 'iap_admin';

export type RolePermissions = {
  [role in RoleType]: Permission[];
};

export type Permission = {
  resource: Resource;
  actions: Action[] | '*';
};

export const availableRoles = [
  {
    id: Role.MEMBER,
    name: 'Member',
  },
  {
    id: Role.ADMIN,
    name: 'Admin',
  },
  {
    id: Role.OWNER,
    name: 'Owner',
  },
  {
    id: Role.AUDITOR,
    name: 'Auditor',
  },
];

export const permissions: RolePermissions = {
  OWNER: [
    {
      resource: 'team',
      actions: '*',
    },
    {
      resource: 'team_member',
      actions: '*',
    },
    {
      resource: 'team_invitation',
      actions: '*',
    },
    {
      resource: 'team_billing',
      actions: '*',
    },
    {
      resource: 'team_sso',
      actions: '*',
    },
    {
      resource: 'team_dsync',
      actions: '*',
    },
    {
      resource: 'team_audit_log',
      actions: '*',
    },
    {
      resource: 'team_webhook',
      actions: '*',
    },
    {
      resource: 'team_api_key',
      actions: '*',
    },
    {
      resource: 'task',
      actions: '*',
    },
    {
      resource: 'iap',
      actions: '*',
    },
    {
      resource: 'iap_admin',
      actions: '*'
    }
  ],
  ADMIN: [
    {
      resource: 'team',
      actions: '*',
    },
    {
      resource: 'team_member',
      actions: '*',
    },
    {
      resource: 'team_invitation',
      actions: '*',
    },
    {
      resource: 'team_billing',
      actions: '*',
    },
    {
      resource: 'team_sso',
      actions: '*',
    },
    {
      resource: 'team_dsync',
      actions: '*',
    },
    {
      resource: 'team_audit_log',
      actions: '*',
    },
    {
      resource: 'team_webhook',
      actions: '*',
    },
    {
      resource: 'team_api_key',
      actions: '*',
    },
    {
      resource: 'task',
      actions: '*',
    },
    {
      resource: 'iap',
      actions: '*',
    },
    {
      resource: 'iap_admin',
      actions: '*'
    }
  ],
  MEMBER: [
    {
      resource: 'team',
      actions: ['read', 'leave'],
    },
    {
      resource: 'team_member',
      actions: ['read'],
    },
    {
      resource: 'task',
      actions: '*',
    },
    {
      resource: 'iap',
      actions: ['read', 'create'],
    },
    {
      resource: 'iap_admin',
      actions: ['read'],
    },
  ],
  AUDITOR: [
    {
      resource: 'team',
      actions: ['read'],
    },
    {
      resource: 'team_member',
      actions: ['read'],
    },
    {
      resource: 'task',
      actions: ['read'],
    },
  ],
};
