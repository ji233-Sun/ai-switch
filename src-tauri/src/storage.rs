use std::fs;
use std::path::PathBuf;

use crate::error::AppError;
use crate::models::ProfileStore;

/// 获取存储目录: ~/.ai-switch/
fn store_dir() -> Result<PathBuf, AppError> {
    let home = dirs::home_dir().ok_or(AppError::HomeDirNotFound)?;
    Ok(home.join(".ai-switch"))
}

/// 获取存储文件路径: ~/.ai-switch/profiles.json
fn store_path() -> Result<PathBuf, AppError> {
    Ok(store_dir()?.join("profiles.json"))
}

/// 加载 ProfileStore，文件不存在时返回默认空 store
pub fn load_store() -> Result<ProfileStore, AppError> {
    let path = store_path()?;
    if !path.exists() {
        return Ok(ProfileStore::default());
    }
    let content = fs::read_to_string(&path)?;
    let store: ProfileStore = serde_json::from_str(&content)?;
    Ok(store)
}

/// 原子写入 ProfileStore（先写 .tmp 再 rename）
pub fn save_store(store: &ProfileStore) -> Result<(), AppError> {
    let dir = store_dir()?;
    if !dir.exists() {
        fs::create_dir_all(&dir)?;
    }
    let path = store_path()?;
    let tmp_path = path.with_extension("json.tmp");
    let content = serde_json::to_string_pretty(store)?;
    fs::write(&tmp_path, content)?;
    fs::rename(&tmp_path, &path)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_store_roundtrip() {
        let store = ProfileStore::default();
        let json = serde_json::to_string_pretty(&store).unwrap();
        let parsed: ProfileStore = serde_json::from_str(&json).unwrap();
        assert_eq!(parsed.version, 1);
        assert!(parsed.profiles.is_empty());
        assert!(parsed.active_profile_id.is_none());
    }
}
