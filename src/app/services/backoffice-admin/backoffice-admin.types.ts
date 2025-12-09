// User types
export interface User {
  id: string;
  name: string | null;
  lastname: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  points?: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedUsersResponse {
  users: User[];
  next_page_cursor?: string;
  total_users_on_page: number;
}

// Ranking types
export interface RankingUser {
  rank: number;
  name: string | null;
  lastname?: string | null;
  phone?: string | null;
  points: number;
  city?: string | null;
  state?: string | null;
}

// pagination structure
export interface RankingPagination {
  next_cursor?: string;
  has_next_page: boolean;
  page_size: number;
}

export interface GlobalRankingResponse {
  leaderboard: RankingUser[];
  pagination: RankingPagination;
}

export interface CityRankingResponse {
  leaderboard: RankingUser[];
  pagination: RankingPagination;
}

export interface StateRankingResponse {
  leaderboard: RankingUser[];
  pagination: RankingPagination;
}

// Locations types
export interface LocationsResponse {
  states: string[];
  cities: string[];
}

// Statistics types
export interface UserStatistics {
  total_users: number;
  users_by_state: Record<string, number>;
  users_by_city: Record<string, number>;
  last_updated: string;
}

// Query parameters
export interface UsersQueryParams {
  limit?: number;
  cursor?: string;
}

export interface CityUsersQueryParams extends UsersQueryParams {
  city: string;
}

export interface StateUsersQueryParams extends UsersQueryParams {
  state: string;
}

export interface RankingQueryParams {
  limit?: number;
  cursor?: string;
}

export interface CityRankingQueryParams {
  city: string;
  limit?: number;
  cursor?: string;
}

export interface StateRankingQueryParams {
  state: string;
  limit?: number;
  cursor?: string;
}

