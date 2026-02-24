const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')

let mainWindow = null
let isQuitting = false

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../public/icon.png'),
    show: false,
    backgroundColor: '#000000',
  })

  // Load app
  const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`
  mainWindow.loadURL(startUrl)

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) {
      shell.openExternal(url)
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })
}

// App lifecycle
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  isQuitting = true
})

// IPC Handlers

// File dialog
ipcMain.handle('dialog:openFile', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Video Files', extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    ...options,
  })
  return result
})

// Save dialog
ipcMain.handle('dialog:saveFile', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'PNG Images', extensions: ['png'] },
      { name: 'JPEG Images', extensions: ['jpg', 'jpeg'] },
      { name: 'WebP Images', extensions: ['webp'] },
      { name: 'ZIP Archive', extensions: ['zip'] },
    ],
    ...options,
  })
  return result
})

// Read file
ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    const data = await fs.promises.readFile(filePath)
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Write file
ipcMain.handle('fs:writeFile', async (event, filePath, data) => {
  try {
    await fs.promises.writeFile(filePath, data)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Get file info
ipcMain.handle('fs:stat', async (event, filePath) => {
  try {
    const stats = await fs.promises.stat(filePath)
    return { success: true, stats }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// Open path in file explorer
ipcMain.handle('shell:showInFolder', async (event, filePath) => {
  shell.showItemInFolder(filePath)
})

// Open external URL
ipcMain.handle('shell:openExternal', async (event, url) => {
  shell.openExternal(url)
})

// Get app version
ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})

// Get platform info
ipcMain.handle('app:getPlatform', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome,
    electronVersion: process.versions.electron,
  }
})
