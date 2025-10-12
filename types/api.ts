// Auto-derived minimal types from docs/openapi.yaml

export type User = {
  id: number;
  username: string;
  role?: string;
};

export type AuthResponse = {
  token: string;
  user?: User;
};

export type Team = {
  id: number;
  name: string;
  owner_id: number;
  description?: string;
  created_at?: string; // date-time
};

export type InviteCode = {
  id: number;
  code: string;
  team_id: number;
  uses_allowed?: number;
  uses_remaining?: number;
  created_by_admin_id?: number;
  created_at?: string;
};

export type Project = {
  id: number;
  name?: string;
  template_id?: number;
  owner_id?: number;
  is_active?: boolean;
  member_level_required?: string;
  created_at?: string;
};

export type AnalysisResult = {
  template_id: number;
  analysis_type: string;
  result: Record<string, any>;
  analysis_time?: string;
};

export type PriceHistoryItem = {
  max_price?: number;
  min_price?: number;
  avg_price?: number;
  median_price?: number;
  record_time?: string;
};

export type ErrorResponse = {
  error?: string;
  message?: string;
};

export type TemplatesList = { templates: number[]; count: number };

export type ProjectsList = { projects: Project[] };
