use std::fs;
use std::path::PathBuf;

use serde_json::Value;

use crate::error::AppError;
use crate::models::Profile;

/// Claude Code 配置文件路径: ~/.claude/settings.json
fn claude_settings_path() -> Result<PathBuf, AppError> {
    let home = dirs::home_dir().ok_or(AppError::HomeDirNotFound)?;
    Ok(home.join(".claude").join("settings.json"))
}

/// 读取 Claude Code settings.json 为 serde_json::Value（保留所有未知字段）
pub fn read_claude_settings() -> Result<Value, AppError> {
    let path = claude_settings_path()?;
    if !path.exists() {
        return Err(AppError::ClaudeSettingsNotFound(
            path.to_string_lossy().to_string(),
        ));
    }
    let content = fs::read_to_string(&path)?;
    let value: Value = serde_json::from_str(&content)?;
    Ok(value)
}

/// 将 profile 应用到 Claude Code settings.json（部分更新，不覆写整个文件）
pub fn apply_profile(profile: &Profile) -> Result<(), AppError> {
    let path = claude_settings_path()?;
    if !path.exists() {
        return Err(AppError::ClaudeSettingsNotFound(
            path.to_string_lossy().to_string(),
        ));
    }

    let content = fs::read_to_string(&path)?;
    let mut settings: Value = serde_json::from_str(&content)?;

    // 确保 settings 是 object
    let obj = settings
        .as_object_mut()
        .ok_or_else(|| AppError::Custom("settings.json 根节点不是 JSON object".to_string()))?;

    // 确保 env 字段存在且为 object
    if !obj.contains_key("env") {
        obj.insert("env".to_string(), Value::Object(serde_json::Map::new()));
    }
    let env = obj
        .get_mut("env")
        .and_then(|v| v.as_object_mut())
        .ok_or_else(|| AppError::Custom("settings.json 中 env 字段不是 JSON object".to_string()))?;

    // 始终写入 base_url 和 auth_token
    env.insert(
        "ANTHROPIC_BASE_URL".to_string(),
        Value::String(profile.base_url.clone()),
    );
    env.insert(
        "ANTHROPIC_AUTH_TOKEN".to_string(),
        Value::String(profile.auth_token.clone()),
    );

    // model: 非空则设置，空则删除
    if profile.model.is_empty() {
        obj.remove("model");
    } else {
        obj.insert("model".to_string(), Value::String(profile.model.clone()));
    }

    // 原子写入
    let tmp_path = path.with_extension("json.tmp");
    let output = serde_json::to_string_pretty(&settings)?;
    fs::write(&tmp_path, &output)?;
    fs::rename(&tmp_path, &path)?;

    Ok(())
}

/// 读取当前 Claude Code 配置，用于导入为新 profile
pub fn read_current_claude_profile() -> Result<(String, String, String), AppError> {
    let settings = read_claude_settings()?;

    let base_url = settings
        .pointer("/env/ANTHROPIC_BASE_URL")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let auth_token = settings
        .pointer("/env/ANTHROPIC_AUTH_TOKEN")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let model = settings
        .get("model")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    Ok((base_url, auth_token, model))
}
