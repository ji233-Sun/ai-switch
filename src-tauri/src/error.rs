use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("无法获取用户主目录")]
    HomeDirNotFound,

    #[error("IO 错误: {0}")]
    Io(#[from] std::io::Error),

    #[error("JSON 解析错误: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Profile 不存在: {0}")]
    ProfileNotFound(String),

    #[error("Claude Code 配置文件不存在: {0}")]
    ClaudeSettingsNotFound(String),

    #[error("Codex 配置文件不存在: {0}")]
    CodexSettingsNotFound(String),

    #[error("~/.claude.json 不存在: {0}")]
    ClaudeJsonNotFound(String),

    #[error("TOML 编辑错误: {0}")]
    TomlEdit(String),

    #[error("{0}")]
    Custom(String),
}

// Tauri 2 IPC 要求错误类型实现 Serialize
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
