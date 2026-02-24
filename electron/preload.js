const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File dialogs
  openFileDialog: (options) => ipcRenderer.invoke('dialog:openFile', options),
  saveFileDialog: (options) => ipcRenderer.invoke('dialog:saveFile', options),
  
  // File system
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  writeFile: (filePath, data) => ipcRenderer.invoke('fs:writeFile', filePath, data),
  statFile: (filePath) => ipcRenderer.invoke('fs:stat', filePath),
  
  // Shell
  showInFolder: (filePath) => ipcRenderer.invoke('shell:showInFolder', filePath),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  
  // App info
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
  
  // Platform
  platform: process.platform,
})

// Expose type definitions
contextBridge.exposeInMainWorld('electronTypes', {
  FileDialogResult: {
    canceled: 'boolean',
    filePaths: 'string[]',
  },
  SaveDialogResult: {
    canceled: 'boolean',
    filePath: 'string | null',
  },
})
