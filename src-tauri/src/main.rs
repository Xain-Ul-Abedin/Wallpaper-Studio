// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64::{Engine as _, engine::general_purpose::STANDARD};
use std::fs::File;
use std::io::Write;

#[tauri::command]
fn set_desktop_wallpaper(base64_data: String) -> Result<String, String> {
    let clean_data = if base64_data.starts_with("data:image") {
        if let Some(pos) = base64_data.find(";base64,") {
            &base64_data[pos + 8..]
        } else {
            &base64_data
        }
    } else {
        &base64_data
    };

    let decoded_bytes = STANDARD.decode(clean_data)
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let temp_dir = std::env::temp_dir();
    let wallpaper_path = temp_dir.join("wallpaper_studio_current.png");

    let mut file = File::create(&wallpaper_path)
        .map_err(|e| format!("Failed to create temporary file: {}", e))?;
    file.write_all(&decoded_bytes)
        .map_err(|e| format!("Failed to write to temporary file: {}", e))?;

    let path_str = wallpaper_path.to_str()
        .ok_or_else(|| "Failed to convert path to string".to_string())?;

    #[cfg(target_os = "windows")]
    {
        use std::ffi::OsStr;
        use std::os::windows::ffi::OsStrExt;
        use windows_sys::Win32::UI::WindowsAndMessaging::{
            SystemParametersInfoW, SPI_SETDESKWALLPAPER, SPIF_SENDCHANGE, SPIF_UPDATEINIFILE,
        };

        let wide: Vec<u16> = OsStr::new(path_str)
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();

        unsafe {
            let success = SystemParametersInfoW(
                SPI_SETDESKWALLPAPER,
                0,
                wide.as_ptr() as *mut _,
                SPIF_UPDATEINIFILE | SPIF_SENDCHANGE,
            );
            if success == 0 {
                return Err("Failed to set desktop wallpaper via SystemParametersInfoW".to_string());
            }
        }
    }

    Ok(format!("Wallpaper successfully applied to desktop! Path: {}", path_str))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![set_desktop_wallpaper])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
