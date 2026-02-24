export interface ElectronAPI {
  // File dialogs
  openFileDialog: (options?: OpenDialogOptions) => Promise<OpenDialogResult>
  saveFileDialog: (options?: SaveDialogOptions) => Promise<SaveDialogResult>
  
  // File system
  readFile: (filePath: string) => Promise<ReadFileResult>
  writeFile: (filePath: string, data: Buffer | string) => Promise<WriteFileResult>
  statFile: (filePath: string) => Promise<StatFileResult>
  
  // Shell
  showInFolder: (filePath: string) => Promise<void>
  openExternal: (url: string) => Promise<void>
  
  // App info
  getVersion: () => Promise<string>
  getPlatform: () => Promise<PlatformInfo>
  
  // Platform
  platform: NodeJS.Platform
}

export interface OpenDialogOptions {
  title?: string
  defaultPath?: string
  filters?: FileFilter[]
  properties?: string[]
}

export interface OpenDialogResult {
  canceled: boolean
  filePaths: string[]
}

export interface SaveDialogOptions {
  title?: string
  defaultPath?: string
  filters?: FileFilter[]
}

export interface SaveDialogResult {
  canceled: boolean
  filePath: string | null
}

export interface FileFilter {
  name: string
  extensions: string[]
}

export interface ReadFileResult {
  success: boolean
  data?: Buffer
  error?: string
}

export interface WriteFileResult {
  success: boolean
  error?: string
}

export interface StatFileResult {
  success: boolean
  stats?: {
    size: number
    mtime: Date
    isFile: () => boolean
    isDirectory: () => boolean
  }
  error?: string
}

export interface PlatformInfo {
  platform: string
  arch: string
  nodeVersion: string
  chromeVersion: string
  electronVersion: string
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    electronTypes: any
  }
}

export {}
