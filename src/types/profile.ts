export interface Profile {
  id: string;
  name: string;
  base_url: string;
  auth_token: string;
  model: string;
  tags: string[];
  starred: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileSummary {
  id: string;
  name: string;
  base_url: string;
  auth_token_preview: string;
  model: string;
  tags: string[];
  starred: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  name: string;
  base_url: string;
  auth_token: string;
  model: string;
  tags: string[];
}
