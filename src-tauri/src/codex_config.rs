use std::fs;
use std::path::PathBuf;

use toml_edit::DocumentMut;

use crate::codex_models::CodexProfile;
use crate::error::AppError;

/// ~/.codex/config.toml
fn codex_config_path() -> Result<PathBuf, AppError> {
    let home = dirs::home_dir().ok_or(AppError::HomeDirNotFound)?;
    Ok(home.join(".codex").join("config.toml"))
}

/// ~/.codex/auth.json
fn codex_auth_path() -> Result<PathBuf, AppError> {
    let home = dirs::home_dir().ok_or(AppError::HomeDirNotFound)?;
    Ok(home.join(".codex").join("auth.json"))
}

/// 读取 config.toml 为 DocumentMut，不存在则创建空文档
fn read_config_doc() -> Result<(PathBuf, DocumentMut), AppError> {
    let path = codex_config_path()?;
    if !path.exists() {
        // 确保目录存在
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        return Ok((path, DocumentMut::new()));
    }
    let content = fs::read_to_string(&path)?;
    let doc = content
        .parse::<DocumentMut>()
        .map_err(|e| AppError::TomlEdit(e.to_string()))?;
    Ok((path, doc))
}

/// 原子写入 config.toml
fn write_config_doc(path: &PathBuf, doc: &DocumentMut) -> Result<(), AppError> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let tmp_path = path.with_extension("toml.tmp");
    fs::write(&tmp_path, doc.to_string())?;
    fs::rename(&tmp_path, path)?;
    Ok(())
}

/// 写入 auth.json
fn write_auth_json(api_key: &str) -> Result<(), AppError> {
    let path = codex_auth_path()?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }
    let obj = serde_json::json!({ "OPENAI_API_KEY": api_key });
    let tmp_path = path.with_extension("json.tmp");
    let content = serde_json::to_string_pretty(&obj)?;
    fs::write(&tmp_path, content)?;
    fs::rename(&tmp_path, &path)?;
    Ok(())
}

/// 将 Codex profile 应用到 config.toml + auth.json
pub fn apply_codex_profile(profile: &CodexProfile) -> Result<(), AppError> {
    let (path, mut doc) = read_config_doc()?;

    // 顶级字段
    doc["model_provider"] = toml_edit::value("ai-switch");
    doc["model"] = toml_edit::value(profile.model.as_str());
    doc["model_reasoning_effort"] =
        toml_edit::value(profile.model_reasoning_effort.as_str());

    // service_tier: 开启则设为 "fast"，关闭则删除
    if profile.service_tier_fast {
        doc["service_tier"] = toml_edit::value("fast");
    } else {
        doc.remove("service_tier");
    }

    // [model_providers.ai-switch] 节
    if !doc.contains_key("model_providers") {
        doc["model_providers"] = toml_edit::Item::Table(toml_edit::Table::new());
    }
    let providers = doc["model_providers"]
        .as_table_mut()
        .ok_or_else(|| AppError::TomlEdit("model_providers 不是 table".to_string()))?;

    if !providers.contains_key("ai-switch") {
        providers["ai-switch"] = toml_edit::Item::Table(toml_edit::Table::new());
    }
    let entry = providers["ai-switch"]
        .as_table_mut()
        .ok_or_else(|| AppError::TomlEdit("model_providers.ai-switch 不是 table".to_string()))?;

    entry["name"] = toml_edit::value("ai-switch");
    entry["base_url"] = toml_edit::value(profile.base_url.as_str());
    entry["wire_api"] = toml_edit::value("responses");
    entry["requires_openai_auth"] = toml_edit::value(true);

    write_config_doc(&path, &doc)?;

    // 写入 auth.json
    write_auth_json(&profile.api_key)?;

    Ok(())
}

/// 切换 OpenAI 直连模式
pub fn apply_openai_mode() -> Result<(), AppError> {
    let (path, mut doc) = read_config_doc()?;

    // 仅设置 model_provider = "openai"
    doc["model_provider"] = toml_edit::value("openai");

    // 删除自定义字段，让 Codex 使用默认值
    doc.remove("model");
    doc.remove("model_reasoning_effort");
    doc.remove("service_tier");

    write_config_doc(&path, &doc)?;
    Ok(())
}

/// 读取当前 Codex 配置，用于导入
/// 返回 (base_url, api_key, model, model_reasoning_effort, service_tier_fast)
pub fn read_current_codex_profile(
) -> Result<(String, String, String, String, bool), AppError> {
    let config_path = codex_config_path()?;
    if !config_path.exists() {
        return Err(AppError::CodexSettingsNotFound(
            config_path.to_string_lossy().to_string(),
        ));
    }

    let content = fs::read_to_string(&config_path)?;
    let doc = content
        .parse::<DocumentMut>()
        .map_err(|e| AppError::TomlEdit(e.to_string()))?;

    let model_provider = doc
        .get("model_provider")
        .and_then(|v| v.as_str())
        .unwrap_or("");

    let model = doc
        .get("model")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let model_reasoning_effort = doc
        .get("model_reasoning_effort")
        .and_then(|v| v.as_str())
        .unwrap_or("high")
        .to_string();

    let service_tier_fast = doc
        .get("service_tier")
        .and_then(|v| v.as_str())
        .map(|s| s == "fast")
        .unwrap_or(false);

    // 如果 model_provider 指向 model_providers 中的某个 entry，读取 base_url
    let base_url = if !model_provider.is_empty() && model_provider != "openai" {
        doc.get("model_providers")
            .and_then(|mp| mp.get(model_provider))
            .and_then(|entry| entry.get("base_url"))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string()
    } else {
        String::new()
    };

    // 读取 auth.json 的 OPENAI_API_KEY
    let auth_path = codex_auth_path()?;
    let api_key = if auth_path.exists() {
        let auth_content = fs::read_to_string(&auth_path)?;
        let auth_value: serde_json::Value = serde_json::from_str(&auth_content)?;
        auth_value
            .get("OPENAI_API_KEY")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string()
    } else {
        String::new()
    };

    Ok((base_url, api_key, model, model_reasoning_effort, service_tier_fast))
}
