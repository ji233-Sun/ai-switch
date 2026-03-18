use chrono::Utc;
use uuid::Uuid;

use crate::codex_config;
use crate::codex_models::{CodexProfile, CodexProfileSummary, CodexStoreState};
use crate::codex_storage;
use crate::error::AppError;

#[tauri::command]
pub fn list_codex_profiles() -> Result<Vec<CodexProfileSummary>, AppError> {
    let store = codex_storage::load_store()?;
    let summaries: Vec<CodexProfileSummary> =
        store.profiles.iter().map(CodexProfileSummary::from).collect();
    Ok(summaries)
}

#[tauri::command]
pub fn get_codex_profile(id: Uuid) -> Result<CodexProfile, AppError> {
    let store = codex_storage::load_store()?;
    store
        .profiles
        .into_iter()
        .find(|p| p.id == id)
        .ok_or_else(|| AppError::ProfileNotFound(id.to_string()))
}

#[tauri::command]
pub fn create_codex_profile(
    name: String,
    base_url: String,
    api_key: String,
    model: String,
    model_reasoning_effort: String,
    service_tier_fast: bool,
    tags: Vec<String>,
) -> Result<CodexProfile, AppError> {
    let mut store = codex_storage::load_store()?;
    let now = Utc::now();
    let profile = CodexProfile {
        id: Uuid::new_v4(),
        name,
        base_url,
        api_key,
        model,
        model_reasoning_effort,
        service_tier_fast,
        tags,
        starred: false,
        created_at: now,
        updated_at: now,
    };
    store.profiles.push(profile.clone());
    codex_storage::save_store(&store)?;
    Ok(profile)
}

#[tauri::command]
pub fn update_codex_profile(
    id: Uuid,
    name: String,
    base_url: String,
    api_key: String,
    model: String,
    model_reasoning_effort: String,
    service_tier_fast: bool,
    tags: Vec<String>,
) -> Result<CodexProfile, AppError> {
    let mut store = codex_storage::load_store()?;
    let profile = store
        .profiles
        .iter_mut()
        .find(|p| p.id == id)
        .ok_or_else(|| AppError::ProfileNotFound(id.to_string()))?;

    profile.name = name;
    profile.base_url = base_url;
    profile.api_key = api_key;
    profile.model = model;
    profile.model_reasoning_effort = model_reasoning_effort;
    profile.service_tier_fast = service_tier_fast;
    profile.tags = tags;
    profile.updated_at = Utc::now();

    let updated = profile.clone();
    codex_storage::save_store(&store)?;
    Ok(updated)
}

#[tauri::command]
pub fn delete_codex_profile(id: Uuid) -> Result<(), AppError> {
    let mut store = codex_storage::load_store()?;
    let len_before = store.profiles.len();
    store.profiles.retain(|p| p.id != id);
    if store.profiles.len() == len_before {
        return Err(AppError::ProfileNotFound(id.to_string()));
    }
    if store.active_profile_id == Some(id) {
        store.active_profile_id = None;
    }
    codex_storage::save_store(&store)?;
    Ok(())
}

#[tauri::command]
pub fn activate_codex_profile(id: Uuid) -> Result<(), AppError> {
    let mut store = codex_storage::load_store()?;
    let profile = store
        .profiles
        .iter()
        .find(|p| p.id == id)
        .ok_or_else(|| AppError::ProfileNotFound(id.to_string()))?
        .clone();

    codex_config::apply_codex_profile(&profile)?;

    store.active_profile_id = Some(id);
    store.openai_mode = false;
    codex_storage::save_store(&store)?;
    Ok(())
}

#[tauri::command]
pub fn toggle_codex_star(id: Uuid) -> Result<bool, AppError> {
    let mut store = codex_storage::load_store()?;
    let profile = store
        .profiles
        .iter_mut()
        .find(|p| p.id == id)
        .ok_or_else(|| AppError::ProfileNotFound(id.to_string()))?;

    profile.starred = !profile.starred;
    let new_state = profile.starred;
    codex_storage::save_store(&store)?;
    Ok(new_state)
}

#[tauri::command]
pub fn set_openai_mode(enabled: bool) -> Result<(), AppError> {
    let mut store = codex_storage::load_store()?;

    if enabled {
        codex_config::apply_openai_mode()?;
        store.openai_mode = true;
    } else {
        store.openai_mode = false;
        // 如果之前有激活的 profile，重新激活
        if let Some(active_id) = store.active_profile_id {
            if let Some(profile) = store.profiles.iter().find(|p| p.id == active_id) {
                let profile = profile.clone();
                codex_config::apply_codex_profile(&profile)?;
            }
        }
    }

    codex_storage::save_store(&store)?;
    Ok(())
}

#[tauri::command]
pub fn get_codex_store_state() -> Result<CodexStoreState, AppError> {
    let store = codex_storage::load_store()?;
    Ok(CodexStoreState {
        active_profile_id: store.active_profile_id,
        openai_mode: store.openai_mode,
    })
}

#[tauri::command]
pub fn import_from_codex() -> Result<CodexProfile, AppError> {
    let (base_url, api_key, model, model_reasoning_effort, service_tier_fast) =
        codex_config::read_current_codex_profile()?;

    if base_url.is_empty() && api_key.is_empty() {
        return Err(AppError::Custom(
            "Codex 配置中未找到有效的 API 配置信息".to_string(),
        ));
    }

    let mut store = codex_storage::load_store()?;
    let now = Utc::now();
    let profile = CodexProfile {
        id: Uuid::new_v4(),
        name: format!("Imported {}", now.format("%Y-%m-%d %H:%M")),
        base_url,
        api_key,
        model,
        model_reasoning_effort,
        service_tier_fast,
        tags: Vec::new(),
        starred: false,
        created_at: now,
        updated_at: now,
    };
    store.profiles.push(profile.clone());
    codex_storage::save_store(&store)?;
    Ok(profile)
}

#[tauri::command]
pub fn detect_active_codex_profile() -> Result<Option<Uuid>, AppError> {
    let (current_url, current_key, current_model, current_effort, current_tier) =
        match codex_config::read_current_codex_profile() {
            Ok(v) => v,
            Err(AppError::CodexSettingsNotFound(_)) => return Ok(None),
            Err(e) => return Err(e),
        };

    let store = codex_storage::load_store()?;
    let matched = store.profiles.iter().find(|p| {
        p.base_url == current_url
            && p.api_key == current_key
            && p.model == current_model
            && p.model_reasoning_effort == current_effort
            && p.service_tier_fast == current_tier
    });

    Ok(matched.map(|p| p.id))
}
