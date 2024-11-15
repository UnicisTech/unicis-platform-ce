
export interface FleetBase {
  id: string;
  updated_at: string;
  created_at: string;
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

export interface FleetTeam {
  id: string;
  name: string;
  user: FleetUser;
  ca_certificate: any;
  ca_private_key: any;
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
  is_expired: boolean;
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
  team: FleetTeam;
  tags?: Tag[];
}

export interface QuerysResponse {
  queries: Query[];
}

export interface PacksResponse {
  packs: Pack[];
}

export interface TagsResponse {
  tags: Tag[];
}

export interface TagsWithRelationships extends Tag {
  packs: Pack[];
  queries: Query[];
}

export interface TagsWithRelationshipsResponse {
  tags: TagsWithRelationships[];
}

export interface Tag extends FleetBase {
  team: FleetTeam;
  value: string;
  packs_count: number;
  nodes_count: number;
  queries_count: number;
  file_paths_count: number;
};

export interface Query extends FleetBase {
  team: FleetTeam;
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

export interface PackWithRelationships extends Pack {
  queries: Query[];
  tags: Tag[]
}

export interface Node extends FleetBase{
  team: FleetTeam;
  owner: FleetMember;
  node_key: string;
  enroll_secret?: string;
  enrolled_on?: string;
  host_identifier?: string;
  last_checkin?: string;
  node_info?: NodeInfo;
  is_active: boolean;
  last_ip?: string;
}

export interface NodesResponse {
  nodes: Node[];
};

export interface NodeWithRelationships extends Node {
  tags: Tag[];
  status_logs: StatusLog[];
  result_logs: any[];
  node_config: string;
}

export interface NodesWithRelationshipsResponse {
  nodes: NodeWithRelationships[];
}

export interface DistributedQuery extends FleetBase{
  team: FleetTeam;
  sql: string;
  description?: string;
  not_before?: string;
  tags?: Tag[];
  total_results?: number;
}

export interface DistributedQueryResponse {
  distributor: DistributedQuery[];
}

export interface DistributedQueryTask extends FleetBase {
  guid: string;
  status: 0 | 1 | 2 | 3;
  timestamp?: string;
  distributed_query: DistributedQuery;
  node: Node;
  results: Array<Record<string, any>>;
}

export interface DistributedQueryTaskResponse {
  tasks: DistributedQueryTask[];
}

export interface StatusLog extends FleetBase {
  filename: string;
  id: string;
  line: number;
  message: string;
}

export interface ResultLog extends FleetBase {
  name: string;
  timestamp: string;
}

export interface StatusLogResponse {
  node: Node;
  status_logs: StatusLog[];
  pagination: Pagination;
}

export interface ResultLogResponse {
  node: Node;
  recent: any;
  queries: Query[];
}

export interface Result extends FleetBase {
  columns: string;
  created_at: string;
  distributed_query: string;
  distributed_query_task: string;
  id: string;
  timestamp: string;
  updated_at: string;
}

interface Pagination {
  alignment: string;
  bs_version: string;
  display_msg: string;
  page: string;
  per_page: string;
  record_name: string;
  show_single_page: boolean;
  total: string;
}

export interface DistributedQueryResult {
  distributed_id: string;
  pagination: Pagination;
  query: Query;
  results: Array<Record<string, any>>; /// This returns results columes only no extral References
  status: string;
  tasks: Task[];
}

export interface Task extends FleetBase {
  distributed_query: DistributedQuery;
  guid: string;
  node: Node;
  results: Result[];
}


// NODE INFOMATION

// Interface for OS Version details
interface OSVersion {
  _id: string;
  arch: string;
  codename: string;
  major: string;
  minor: string;
  name: string;
  patch: string;
  pid_with_namespace: string;
  platform: string;
  platform_like: string;
  version: string;
}

// Interface for OSQuery Info
interface OSQueryInfo {
  build_distro: string;
  build_platform: string;
  config_hash: string;
  config_valid: string;
  extensions: string;
  instance_id: string;
  pid: string;
  platform_mask: string;
  start_time: string;
  uuid: string;
  version: string;
  watcher: string;
}

// Interface for Platform Info
interface PlatformInfo {
  address: string;
  date: string;
  extra: string;
  firmware_type: string;
  revision: string;
  size: string;
  vendor: string;
  version: string;
  volume_size: string;
}

// Interface for System Info
interface SystemInfo {
  board_model: string;
  board_serial: string;
  board_vendor: string;
  board_version: string;
  computer_name: string;
  cpu_brand: string;
  cpu_logical_cores: string;
  cpu_microcode: string;
  cpu_physical_cores: string;
  cpu_sockets: string;
  cpu_subtype: string;
  cpu_type: string;
  hardware_model: string;
  hardware_serial: string;
  hardware_vendor: string;
  hardware_version: string;
  hostname: string;
  local_hostname: string;
  physical_memory: string;
  uuid: string;
}

// Interface for Host Details
interface NodeInfo {
  os_version: OSVersion;
  osquery_info: OSQueryInfo;
  platform_info: PlatformInfo;
  system_info: SystemInfo;
}

