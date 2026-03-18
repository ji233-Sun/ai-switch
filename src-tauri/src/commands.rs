use chrono::Utc;
use uuid::Uuid;

use crate::claude_config;
use crate::error::AppError;
use crate::models::{Profile, ProfileSummary};
use crate::storage;

#[tauri::command]
pub fn list_profiles() -> Result<Vec<ProfileSummary>, AppError> {
    let store = storage::load_store()?;
    let summaries: Vec<ProfileSummary> = store.profiles.iter().map(ProfileSummary::from).collect();
    Ok(summaries)
}

#[tauri::command]
pub fn get_profile(id: Uuid) -> Result<Profile, AppError> {
    let store = storage::load_store()?;
    store
        .profiles
        .into_iter()
        .find(|p| p.id == id)
        .ok_or_else(|| AppError::ProfileNotFound(id.to_string()))
}

#[tauri::command]
pub fn create_profile(
    name: String,
    base_url: String,
    auth_token: String,
    model: String,
    tags: Vec<String>,
) -> Result<Profile, AppError> {
    let mut store = storage::load_store()?;
    let now = Utc::now();
    let profile = Profile {
        id: Uuid::new_v4(),
        name,
        base_url,
        auth_token,
        model,
        tags,
        starred: false,
        created_at: now,
        updated_at: now,
    };
    store.profiles.push(profile.clone());
    storage::save_store(&store)?;
    Ok(profile)
}

#[tauri::command]
pub fn update_profile(
    id: Uuid,
    name: String,
    base_url: String,
    auth_token: String,
    model: String,
    tags: Vec<String>,
) -> Result<Profile, AppError> {
    let mut store = storage::load_store()?;
    let profile = store
        .profiles
        .iter_mut()
        .find(|p| p.id == id)
        .ok_or_else(|| AppError::ProfileNotFound(id.to_string()))?;

    profile.name = name;
    profile.base_url = base_url;
    profile.auth_token = auth_token;
    profile.model = model;
    profile.tags = tags;
    profile.updated_at = Utc::now();

    let updated = profile.clone();
    storage::save_store(&store)?;
    Ok(updated)
}

#[tauri::command]
pub fn delete_profile(id: Uuid) -> Result<(), AppError> {
    let mut store = storage::load_store()?;
    let len_before = store.profiles.len();
    store.profiles.retain(|p| p.id != id);
    if store.profiles.len() == len_before {
        return Err(AppError::ProfileNotFound(id.to_string()));
    }
    // 如果删除的是当前激活的 profile，清除 active_profile_id
    if store.active_profile_id == Some(id) {
        store.active_profile_id = None;
    }
    storage::save_store(&store)?;
    Ok(())
}

#[tauri::command]
pub fn activate_profile(id: Uuid) -> Result<(), AppError> {
    let mut store = storage::load_store()?;
    let profile = store
        .profiles
        .iter()
        .find(|p| p.id == id)
        .ok_or_else(|| AppError::ProfileNotFound(id.to_string()))?
        .clone();

    claude_config::apply_profile(&profile)?;

    store.active_profile_id = Some(id);
    storage::save_store(&store)?;
    Ok(())
}

#[tauri::command]
pub fn import_from_claude_code() -> Result<Profile, AppError> {
    let (base_url, auth_token, model) = claude_config::read_current_claude_profile()?;

    if base_url.is_empty() && auth_token.is_empty() {
        return Err(AppError::Custom(
            "Claude Code 配置中未找到 ANTHROPIC_BASE_URL 或 ANTHROPIC_AUTH_TOKEN".to_string(),
        ));
    }

    let mut store = storage::load_store()?;
    let now = Utc::now();
    let profile = Profile {
        id: Uuid::new_v4(),
        name: format!("Imported {}", now.format("%Y-%m-%d %H:%M")),
        base_url,
        auth_token,
        model,
        tags: Vec::new(),
        starred: false,
        created_at: now,
        updated_at: now,
    };
    store.profiles.push(profile.clone());
    storage::save_store(&store)?;
    Ok(profile)
}

#[tauri::command]
pub fn get_active_profile_id() -> Result<Option<Uuid>, AppError> {
    let store = storage::load_store()?;
    Ok(store.active_profile_id)
}

/// 检测当前 Claude Code 配置匹配哪个 profile
#[tauri::command]
pub fn detect_active_profile() -> Result<Option<Uuid>, AppError> {
    let (current_url, current_token, current_model) =
        match claude_config::read_current_claude_profile() {
            Ok(v) => v,
            Err(AppError::ClaudeSettingsNotFound(_)) => return Ok(None),
            Err(e) => return Err(e),
        };

    let store = storage::load_store()?;
    let matched = store.profiles.iter().find(|p| {
        p.base_url == current_url
            && p.auth_token == current_token
            && p.model == current_model
    });

    Ok(matched.map(|p| p.id))
}

#[tauri::command]
pub fn toggle_star(id: Uuid) -> Result<bool, AppError> {
    let mut store = storage::load_store()?;
    let profile = store
        .profiles
        .iter_mut()
        .find(|p| p.id == id)
        .ok_or_else(|| AppError::ProfileNotFound(id.to_string()))?;

    profile.starred = !profile.starred;
    let new_state = profile.starred;
    storage::save_store(&store)?;
    Ok(new_state)
}
