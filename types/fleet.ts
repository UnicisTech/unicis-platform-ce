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

export interface FleetTeamResponse {
  id: string;
  name: string;
  user_id: string;
  members: FleetMember[];
  secret: FleetSecret;
}
