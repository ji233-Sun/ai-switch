use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodexProfile {
    pub id: Uuid,
    pub name: String,
    pub base_url: String,
    pub api_key: String,
    pub model: String,
    /// "low" / "medium" / "high" / "xhigh"
    pub model_reasoning_effort: String,
    /// true -> service_tier = "fast", false -> 不写入该字段
    pub service_tier_fast: bool,
    #[serde(default)]
    pub tags: Vec<String>,
    #[serde(default)]
    pub starred: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodexProfileStore {
    pub version: u32,
    pub active_profile_id: Option<Uuid>,
    /// true = model_provider = "openai"，所有自定义 API 配置停用
    #[serde(default)]
    pub openai_mode: bool,
    pub profiles: Vec<CodexProfile>,
}

impl Default for CodexProfileStore {
    fn default() -> Self {
        Self {
            version: 1,
            active_profile_id: None,
            openai_mode: false,
            profiles: Vec::new(),
        }
    }
}

/// 脱敏版本，用于前端列表展示
#[derive(Debug, Clone, Serialize)]
pub struct CodexProfileSummary {
    pub id: Uuid,
    pub name: String,
    pub base_url: String,
    pub api_key_preview: String,
    pub model: String,
    pub model_reasoning_effort: String,
    pub service_tier_fast: bool,
    pub tags: Vec<String>,
    pub starred: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl From<&CodexProfile> for CodexProfileSummary {
    fn from(p: &CodexProfile) -> Self {
        let preview = if p.api_key.len() > 8 {
            format!(
                "{}...{}",
                &p.api_key[..4],
                &p.api_key[p.api_key.len() - 4..]
            )
        } else {
            "*".repeat(p.api_key.len())
        };
        Self {
            id: p.id,
            name: p.name.clone(),
            base_url: p.base_url.clone(),
            api_key_preview: preview,
            model: p.model.clone(),
            model_reasoning_effort: p.model_reasoning_effort.clone(),
            service_tier_fast: p.service_tier_fast,
            tags: p.tags.clone(),
            starred: p.starred,
            created_at: p.created_at,
            updated_at: p.updated_at,
        }
    }
}

/// Store 状态摘要，供前端获取 active_profile_id + openai_mode
#[derive(Debug, Clone, Serialize)]
pub struct CodexStoreState {
    pub active_profile_id: Option<Uuid>,
    pub openai_mode: bool,
}
