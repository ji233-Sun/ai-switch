mod claude_config;
mod codex_commands;
mod codex_config;
mod codex_models;
mod codex_storage;
mod commands;
mod error;
mod models;
mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // Claude Code commands
            commands::list_profiles,
            commands::get_profile,
            commands::create_profile,
            commands::update_profile,
            commands::delete_profile,
            commands::activate_profile,
            commands::import_from_claude_code,
            commands::get_active_profile_id,
            commands::detect_active_profile,
            commands::toggle_star,
            // Codex commands
            codex_commands::list_codex_profiles,
            codex_commands::get_codex_profile,
            codex_commands::create_codex_profile,
            codex_commands::update_codex_profile,
            codex_commands::delete_codex_profile,
            codex_commands::activate_codex_profile,
            codex_commands::toggle_codex_star,
            codex_commands::set_openai_mode,
            codex_commands::get_codex_store_state,
            codex_commands::import_from_codex,
            codex_commands::detect_active_codex_profile,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
