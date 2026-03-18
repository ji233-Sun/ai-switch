use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub id: Uuid,
    pub name: String,
    pub base_url: String,
    pub auth_token: String,
    /// 空字符串表示不设置，让用户在 Claude Code 内选择
    pub model: String,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub starred: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProfileStore {
    pub version: u32,
    pub active_profile_id: Option<Uuid>,
    pub profiles: Vec<Profile>,
}

impl Default for ProfileStore {
    fn default() -> Self {
        Self {
            version: 1,
            active_profile_id: None,
            profiles: Vec::new(),
        }
    }
}

/// 脱敏版本，用于前端列表展示（隐藏完整 token）
#[derive(Debug, Clone, Serialize)]
pub struct ProfileSummary {
    pub id: Uuid,
    pub name: String,
    pub base_url: String,
    pub auth_token_preview: String,
    pub model: String,
    pub tags: Vec<String>,
    pub starred: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<&Profile> for ProfileSummary {
    fn from(p: &Profile) -> Self {
        let preview = if p.auth_token.len() > 8 {
            format!("{}...{}", &p.auth_token[..4], &p.auth_token[p.auth_token.len() - 4..])
        } else {
            "*".repeat(p.auth_token.len())
        };
        Self {
            id: p.id,
            name: p.name.clone(),
            base_url: p.base_url.clone(),
            auth_token_preview: preview,
            model: p.model.clone(),
            tags: p.tags.clone(),
            starred: p.starred,
            created_at: p.created_at,
            updated_at: p.updated_at,
        }
    }
}
