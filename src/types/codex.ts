export interface CodexProfile {
  id: string;
  name: string;
  base_url: string;
  api_key: string;
  model: string;
  model_reasoning_effort: string;
  service_tier_fast: boolean;
  tags: string[];
  starred: boolean;
  created_at: string;
  updated_at: string;
}

export interface CodexProfileSummary {
  id: string;
  name: string;
  base_url: string;
  api_key_preview: string;
  model: string;
  model_reasoning_effort: string;
  service_tier_fast: boolean;
  tags: string[];
  starred: boolean;
  created_at: string;
  updated_at: string;
}

export interface CodexProfileFormData {
  name: string;
  base_url: string;
  api_key: string;
  model: string;
  model_reasoning_effort: string;
  service_tier_fast: boolean;
  tags: string[];
}

export interface CodexStoreState {
  active_profile_id: string | null;
  openai_mode: boolean;
}
