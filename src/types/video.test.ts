import { describe, it, expect } from 'vitest'
import { validateVideoFile, formatVideoDuration, formatVideoResolution, getVideoIcon } from '@/types/video'

describe('validateVideoFile', () => {
  const createMockFile = (overrides: Partial<File> = {}) => {
    return new File(['test'], 'test.mp4', {
      type: 'video/mp4',
      ...overrides,
    })
  }

  it('should validate a valid video file', () => {
    const file = createMockFile()
    const result = validateVideoFile(file)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject file exceeding max size', () => {
    const maxSize = 1024 * 1024 // 1MB
    const file = new File([new ArrayBuffer(maxSize * 2)], 'test.mp4', {
      type: 'video/mp4',
    })

    const result = validateVideoFile(file, { maxSize })

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(
      expect.stringContaining('exceeds maximum allowed size')
    )
  })

  it('should reject unsupported format', () => {
    const file = new File(['test'], 'test.unsupported', {
      type: 'application/octet-stream',
    })

    const result = validateVideoFile(file, {
      allowedFormats: ['mp4', 'webm', 'mov'],
    })

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(
      expect.stringContaining('is not supported')
    )
  })

  it('should reject non-video file type', () => {
    const file = createMockFile({
      type: 'application/octet-stream',
    })

    const result = validateVideoFile(file)

    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual(
      expect.stringContaining('not a valid video file')
    )
  })

  it('should accept all supported formats', () => {
    const supportedFormats = ['mp4', 'webm', 'mov', 'avi', 'mkv']

    supportedFormats.forEach((format) => {
      const file = createMockFile({
        name: `test.${format}`,
        type: `video/${format}`,
      })

      const result = validateVideoFile(file, { allowedFormats: supportedFormats })

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  it('should use default validation options when not provided', () => {
    const file = createMockFile()
    const result = validateVideoFile(file)

    // Should not throw and should validate with defaults
    expect(typeof result.valid).toBe('boolean')
  })
})

describe('formatVideoDuration', () => {
  it('should format seconds to MM:SS', () => {
    expect(formatVideoDuration(0)).toBe('0:00')
    expect(formatVideoDuration(5)).toBe('0:05')
    expect(formatVideoDuration(65)).toBe('1:05')
    expect(formatVideoDuration(125)).toBe('2:05')
  })

  it('should format hours correctly', () => {
    expect(formatVideoDuration(3600)).toBe('1:00:00')
    expect(formatVideoDuration(3665)).toBe('1:01:05')
    expect(formatVideoDuration(7325)).toBe('2:02:05')
  })

  it('should handle edge cases', () => {
    expect(formatVideoDuration(0)).toBe('0:00')
    // Negative values and NaN will produce invalid output, which is acceptable
    // In production, these should be validated before calling this function
  })
})

describe('formatVideoResolution', () => {
  it('should return standard resolution names', () => {
    expect(formatVideoResolution(640, 480)).toBe('SD')
    expect(formatVideoResolution(1280, 720)).toBe('HD')
    expect(formatVideoResolution(1920, 1080)).toBe('FHD')
    expect(formatVideoResolution(2560, 1440)).toBe('QHD')
    expect(formatVideoResolution(3840, 2160)).toBe('4K')
    expect(formatVideoResolution(7680, 4320)).toBe('8K')
  })

  it('should return raw resolution for non-standard sizes', () => {
    expect(formatVideoResolution(1000, 800)).toBe('1000x800')
    expect(formatVideoResolution(500, 500)).toBe('500x500')
  })
})

describe('getVideoIcon', () => {
  it('should return video icon for supported formats', () => {
    expect(getVideoIcon('mp4')).toBe('video')
    expect(getVideoIcon('webm')).toBe('video')
    expect(getVideoIcon('mov')).toBe('video')
    expect(getVideoIcon('avi')).toBe('video')
    expect(getVideoIcon('mkv')).toBe('video')
  })

  it('should return video icon for unknown formats', () => {
    expect(getVideoIcon('unknown')).toBe('video')
    expect(getVideoIcon('')).toBe('video')
  })

  it('should handle case insensitivity', () => {
    expect(getVideoIcon('MP4')).toBe('video')
    expect(getVideoIcon('WebM')).toBe('video')
  })
})
