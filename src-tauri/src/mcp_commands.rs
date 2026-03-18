use serde_json::Value;

use crate::error::AppError;
use crate::mcp_config::{self, McpServerEntry};

#[tauri::command]
pub fn list_mcp_servers() -> Result<Vec<McpServerEntry>, AppError> {
    mcp_config::list_mcp_servers()
}

#[tauri::command]
pub fn add_mcp_server(name: String, config: String) -> Result<(), AppError> {
    let parsed: Value = serde_json::from_str(&config)
        .map_err(|e| AppError::Custom(format!("JSON 格式错误: {}", e)))?;

    if !parsed.is_object() {
        return Err(AppError::Custom(
            "MCP server 配置必须是 JSON object".to_string(),
        ));
    }

    mcp_config::add_mcp_server(&name, parsed)
}

#[tauri::command]
pub fn update_mcp_server(name: String, config: String) -> Result<(), AppError> {
    let parsed: Value = serde_json::from_str(&config)
        .map_err(|e| AppError::Custom(format!("JSON 格式错误: {}", e)))?;

    if !parsed.is_object() {
        return Err(AppError::Custom(
            "MCP server 配置必须是 JSON object".to_string(),
        ));
    }

    mcp_config::update_mcp_server(&name, parsed)
}

#[tauri::command]
pub fn delete_mcp_server(name: String) -> Result<(), AppError> {
    mcp_config::delete_mcp_server(&name)
}
