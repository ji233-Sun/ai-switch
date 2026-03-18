mod claude_config;
mod commands;
mod error;
mod models;
mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
