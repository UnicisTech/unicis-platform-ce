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
  | 'team_fleet_connect'
  | 'team_fleet_api_key'
  | 'team_fleet_pack'
  | 'team_fleet_query'
  | 'team_fleet_tag'
  | 'team_fleet_node'
  | 'asset_dashboard'
  | 'asset_settings'
  | 'task'
  | 'iap_course'
  | 'iap_category'
  | 'iap_reports'
  | 'rpa'
  | 'tia'
  | 'pia'
  | 'csc'
  | 'rm';

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
      actions: ['read', 'leave', 'update'],
    },
    {
      resource: 'asset_dashboard',
      actions: '*',
    },
    {
      resource: 'asset_settings',
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
      resource: 'team_fleet_connect',
      actions: '*',
    },
    {
      resource: 'team_fleet_pack',
      actions: '*',
    },
    {
      resource: 'team_fleet_query',
      actions: '*',
    },
    {
      resource: 'team_fleet_tag',
      actions: '*',
    },
    {
      resource: 'team_fleet_node',
      actions: '*',
    },
    {      
      resource: 'iap_course',
      actions: '*',
    },
    {
      resource: 'iap_category',
      actions: '*',
    },
    {
      resource: 'iap_reports',
      actions: '*',
    },
    {
      resource: 'rpa',
      actions: '*',
    },
    {
      resource: 'tia',
      actions: '*',
    },
    {
      resource: 'pia',
      actions: '*',
    },
    {
      resource: 'csc',
      actions: '*',
    },
    {
      resource: 'rm',
      actions: '*',
    },
  ],
  ADMIN: [
    {
      resource: 'team',
      actions: '*',
    },
     {
      resource: 'asset_dashboard',
      actions: '*',
    },
    {
      resource: 'asset_settings',
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
      resource: 'team_fleet_connect',
      actions: '*',
    },
    {
      resource: 'team_fleet_pack',
      actions: '*',
    },
    {
      resource: 'team_fleet_query',
      actions: '*',
    },
    {
      resource: 'team_fleet_tag',
      actions: '*',
    },
    {
      resource: 'team_fleet_node',
      actions: '*',
    },
    {
      resource: 'iap_course',
      actions: '*',
    },
    {
      resource: 'iap_category',
      actions: '*',
    },
    {
      resource: 'iap_reports',
      actions: '*',
    },
    {
      resource: 'rpa',
      actions: '*',
    },
    {
      resource: 'tia',
      actions: '*',
    },
    {
      resource: 'pia',
      actions: '*',
    },
    {
      resource: 'csc',
      actions: '*',
    },
    {
      resource: 'rm',
      actions: '*',
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
    {
      resource: 'team_fleet_connect',
      actions: ['read'],
    },
    {
      resource: 'team_fleet_pack',
      actions: ['read'],
    },
    {
      resource: 'team_fleet_query',
      actions: ['read'],
    },
    {
      resource: 'team_fleet_node',
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
      actions: ['read'],
    },
  ],
};
