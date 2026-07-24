const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isNativeDesktop: true,
  setWallpaper: (base64Data) => ipcRenderer.invoke('set-wallpaper', base64Data),
});
