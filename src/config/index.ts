export const APP_CONFIG = {
  name: 'Frame Flow X',
  version: '0.1.0',
  description: 'Video-to-Frame Processing Application with AI-Powered Upscaling and Cinematic Enhancement',
  author: 'Frame Flow X Team',
} as const

export const ROUTES = {
  HOME: '/',
  WORKSPACE: '/workspace',
  SETTINGS: '/settings',
  ABOUT: '/about',
} as const

export const API_CONFIG = {
  baseUrl: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
  retries: 3,
} as const

export const VIDEO_CONFIG = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  supportedFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  defaultOutputFormat: 'png',
  defaultQuality: 95,
  frameExtraction: {
    defaultFps: 1,
    minFps: 0.1,
    maxFps: 30,
  },
} as const

export const AI_CONFIG = {
  upscaling: {
    maxScale: 4,
    defaultScale: 2,
    qualityPresets: ['fast', 'balanced', 'quality'] as const,
  },
  enhancement: {
    maxNoiseReduction: 100,
    maxSharpening: 100,
    maxBrightness: 100,
    maxContrast: 100,
    maxSaturation: 100,
  },
} as const

export const UI_CONFIG = {
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      default: 'ease',
      enter: 'ease-out',
      leave: 'ease-in',
    },
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
} as const

export const STORAGE_KEYS = {
  THEME: 'frame-flow-x-theme',
  PREFERENCES: 'frame-flow-x-preferences',
  RECENT_PROJECTS: 'frame-flow-x-recent-projects',
  CUSTOM_PRESETS: 'frame-flow-x-custom-presets',
} as const
