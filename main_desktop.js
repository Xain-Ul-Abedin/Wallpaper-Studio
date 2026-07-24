const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

function createWindow() {
  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1000,
    minHeight: 700,
    title: "WallpaperStudio — Native Desktop App",
    icon: path.join(__dirname, 'public/icon.ico'),
    backgroundColor: '#09090b',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, 'app/dist/index.html'));
  }

  win.once('ready-to-show', () => {
    win.show();
  });
}

// IPC Wallpaper Handler
ipcMain.handle('set-wallpaper', async (event, base64Data) => {
  try {
    const cleanData = base64Data.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(cleanData, 'base64');
    
    const tempPath = path.join(app.getPath('temp'), 'wallpaper_studio_current.png');
    fs.writeFileSync(tempPath, buffer);

    if (process.platform === 'win32') {
      const psCommand = `
        Add-Type -TypeDefinition "
        using System;
        using System.Runtime.InteropServices;
        public class Wallpaper {
            [DllImport(\\"user32.dll\\", CharSet = CharSet.Auto)]
            public static extern int SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
        }
        "
        [Wallpaper]::SystemParametersInfo(20, 0, "${tempPath.replace(/\\/g, '\\\\')}", 3)
      `;
      
      return new Promise((resolve, reject) => {
        exec(`powershell -NoProfile -Command "${psCommand.replace(/\n/g, ' ')}"`, (err) => {
          if (err) reject(err);
          else resolve('Wallpaper applied successfully via Win32!');
        });
      });
    } else {
      return 'Wallpaper saved, but native apply is only supported on Windows in this build.';
    }
  } catch (err) {
    throw new Error('Failed to set wallpaper: ' + err.message);
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
