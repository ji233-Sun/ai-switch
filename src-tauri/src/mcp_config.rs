use std::fs;
use std::path::PathBuf;

use serde::Serialize;
use serde_json::Value;

use crate::error::AppError;

/// MCP server entry: name + raw JSON config
#[derive(Debug, Serialize)]
pub struct McpServerEntry {
    pub name: String,
    pub config: Value,
}

/// ~/.claude.json 路径
fn claude_json_path() -> Result<PathBuf, AppError> {
    let home = dirs::home_dir().ok_or(AppError::HomeDirNotFound)?;
    Ok(home.join(".claude.json"))
}

/// 读取 ~/.claude.json 为 serde_json::Value
fn read_claude_json() -> Result<Value, AppError> {
    let path = claude_json_path()?;
    if !path.exists() {
        return Err(AppError::ClaudeJsonNotFound(
            path.to_string_lossy().to_string(),
        ));
    }
    let content = fs::read_to_string(&path)?;
    let value: Value = serde_json::from_str(&content)?;
    Ok(value)
}

/// 原子写入 ~/.claude.json
fn write_claude_json(value: &Value) -> Result<(), AppError> {
    let path = claude_json_path()?;
    let tmp_path = path.with_extension("json.tmp");
    let output = serde_json::to_string_pretty(value)?;
    fs::write(&tmp_path, &output)?;
    fs::rename(&tmp_path, &path)?;
    Ok(())
}

/// 列出所有 MCP servers
pub fn list_mcp_servers() -> Result<Vec<McpServerEntry>, AppError> {
    let root = read_claude_json()?;
    let servers = root
        .get("mcpServers")
        .and_then(|v| v.as_object())
        .cloned()
        .unwrap_or_default();

    let entries: Vec<McpServerEntry> = servers
        .into_iter()
        .map(|(name, config)| McpServerEntry { name, config })
        .collect();

    Ok(entries)
}

/// 添加新的 MCP server
pub fn add_mcp_server(name: &str, config: Value) -> Result<(), AppError> {
    let mut root = read_claude_json()?;
    let obj = root
        .as_object_mut()
        .ok_or_else(|| AppError::Custom("~/.claude.json 根节点不是 JSON object".to_string()))?;

    // 确保 mcpServers 字段存在
    if !obj.contains_key("mcpServers") {
        obj.insert(
            "mcpServers".to_string(),
            Value::Object(serde_json::Map::new()),
        );
    }

    let servers = obj
        .get_mut("mcpServers")
        .and_then(|v| v.as_object_mut())
        .ok_or_else(|| AppError::Custom("mcpServers 不是 JSON object".to_string()))?;

    if servers.contains_key(name) {
        return Err(AppError::Custom(format!(
            "MCP server \"{}\" 已存在",
            name
        )));
    }

    servers.insert(name.to_string(), config);
    write_claude_json(&root)
}

/// 更新已有 MCP server 的配置
pub fn update_mcp_server(name: &str, config: Value) -> Result<(), AppError> {
    let mut root = read_claude_json()?;
    let servers = root
        .pointer_mut("/mcpServers")
        .and_then(|v| v.as_object_mut())
        .ok_or_else(|| AppError::Custom("mcpServers 不存在或不是 JSON object".to_string()))?;

    if !servers.contains_key(name) {
        return Err(AppError::Custom(format!(
            "MCP server \"{}\" 不存在",
            name
        )));
    }

    servers.insert(name.to_string(), config);
    write_claude_json(&root)
}

/// 删除 MCP server
pub fn delete_mcp_server(name: &str) -> Result<(), AppError> {
    let mut root = read_claude_json()?;
    let servers = root
        .pointer_mut("/mcpServers")
        .and_then(|v| v.as_object_mut())
        .ok_or_else(|| AppError::Custom("mcpServers 不存在或不是 JSON object".to_string()))?;

    if servers.remove(name).is_none() {
        return Err(AppError::Custom(format!(
            "MCP server \"{}\" 不存在",
            name
        )));
    }

    write_claude_json(&root)
}
