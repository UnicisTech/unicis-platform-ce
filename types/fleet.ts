export interface FleetBase {
  id: string;
  updated_at: string;
  created_at: string;
  index?: string;
}

export interface FleetUser {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface FleetMember {
  id: string;
  joined_at: string;
  role: string;
  team_id: string;
  user_id: string;
  user: FleetUser;
}

export interface FleetSecret {
  id: string;
  secret: string;
  team_id: string;
  created_at: string;
  updated_at: string;
}

export interface FleetTeamResponse extends FleetBase {
  name: string;
  user_id: string;
  members: FleetMember[];
  secret: FleetSecret;
}

export interface FleetAccess extends FleetBase {
    expiration_date: string;
    is_active: boolean;
    secret_key: string;
    user: string;
}

export interface LoginResponse {
    access_token: string;
    fleet_access: FleetAccess;
    msg: string;
    refresh_token: string;
    user: FleetUser;
}

export interface Pack extends FleetBase {
  index: string;
  name: string;
  platform?: string;
  version: string;
  description?: string;
  shard?: number;
  team: string;
}

export interface PacksResponse extends FleetBase {
  packs: Pack[];
}

export interface Tag extends FleetBase {
  team: string;
  value: string;
};

export interface Query extends FleetBase {
  team: string;
  name: string;
  sql: string;
  interval: number;
  platform: string;
  version: string;
  description: string;
  value: string;
  packs?: Pack[];
  tags?: Tag[];
  removed: boolean;
  shard: number;
};

export interface PackWithRelationships extends FleetBase {
  name: string;
  platform?: string;
  version: string;
  description?: string;
  shard?: number;
  team: string;
  queries: Query[];
  tags: Tag[]
}

export interface Node extends FleetBase{
  team: string;
  node_key: string;
  enroll_secret?: string;
  enrolled_on?: string;
  host_identifier?: string;
  last_checkin?: string;
  node_info?: Record<string, any>;
  is_active: boolean;
  last_ip?: string;
}

export interface DistributedQuery extends FleetBase{
  team: string; 
  sql: string;
  description?: string;
  not_before?: string;
  nodes: Node[];
  tags?: Tag[];
}

export interface DistributedQueryTask extends FleetBase {
  guid: string;
  status: 0 | 1 | 2 | 3;
  timestamp?: string;
  distributed_query_id: number;
  node_id: string;
}


export interface StatusLog extends FleetBase {

}

export interface DistributedQueryResult extends FleetBase {
  distributed_query_id: number;
}
