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
  | 'iap_course'
  | 'iap_category'
  | 'iap_reports';

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
      resource: 'iap_course',
      actions: '*'
    },
    {
      resource: 'iap_category',
      actions: '*'
    },
    {
      resource: 'iap_reports',
      actions: '*'
    },
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
      resource: 'iap_course',
      actions: '*'
    },
    {
      resource: 'iap_category',
      actions: '*'
    },
    {
      resource: 'iap_reports',
      actions: '*'
    },
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
      resource: 'iap_course',
      actions: ['read', 'update'],
    },
    {
      resource: 'iap_category',
      actions: ['read'],
    }
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
    {
      resource: 'iap_course',
      actions: ['read'],
    },
    {
      resource: 'iap_category',
      actions: ['read'],
    },
    {
      resource: 'iap_reports',
      actions: ['read']
    },
  ],
};
