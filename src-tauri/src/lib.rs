use std::path::{Path, PathBuf};
use std::process::Command;

const DEFAULT_API_BASE_URL: &str = "http://127.0.0.1:8000";

fn backend_port_file_candidates() -> Vec<PathBuf> {
    let mut candidates = Vec::new();

    if let Ok(current_dir) = std::env::current_dir() {
        candidates.push(current_dir.join("backend_port.txt"));

        if let Some(parent_dir) = current_dir.parent() {
            candidates.push(parent_dir.join("backend_port.txt"));
        }
    }

    if let Some(manifest_dir) = option_env!("CARGO_MANIFEST_DIR") {
        let src_tauri_dir = PathBuf::from(manifest_dir);
        candidates.push(src_tauri_dir.join("backend_port.txt"));

        if let Some(project_root) = src_tauri_dir.parent() {
            candidates.push(project_root.join("backend_port.txt"));
        }
    }

    candidates
}

fn read_backend_port() -> Option<u16> {
    backend_port_file_candidates()
        .into_iter()
        .find_map(|path| std::fs::read_to_string(path).ok())
        .and_then(|content| content.trim().parse::<u16>().ok())
}

#[tauri::command]
fn get_api_base_url() -> String {
    read_backend_port()
        .map(|port| format!("http://127.0.0.1:{port}"))
        .unwrap_or_else(|| DEFAULT_API_BASE_URL.to_string())
}

#[tauri::command]
fn open_report_file(path: String) -> Result<(), String> {
    if !Path::new(&path).exists() {
        return Err("报告文件不存在".to_string());
    }

    #[cfg(target_os = "macos")]
    let mut command = {
        let mut command = Command::new("open");
        command.arg(&path);
        command
    };

    #[cfg(target_os = "windows")]
    let mut command = {
        let mut command = Command::new("cmd");
        command.arg("/C").arg("start").arg("").arg(&path);
        command
    };

    #[cfg(target_os = "linux")]
    let mut command = {
        let mut command = Command::new("xdg-open");
        command.arg(&path);
        command
    };

    command
        .spawn()
        .map(|_| ())
        .map_err(|error| format!("打开报告失败：{error}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            open_report_file,
            get_api_base_url
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
