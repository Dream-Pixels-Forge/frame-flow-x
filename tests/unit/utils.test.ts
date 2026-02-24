import { describe, it, expect } from 'vitest'
import { formatDuration, formatFileSize, formatNumber, clamp, cn } from '@/utils'

describe('Utility Functions', () => {
  describe('cn', () => {
    it('should join class names', () => {
      expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
    })

    it('should filter out falsy values', () => {
      expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar')
    })
  })

  describe('formatDuration', () => {
    it('should format seconds correctly', () => {
      expect(formatDuration(5)).toBe('00:05')
    })

    it('should format minutes and seconds correctly', () => {
      expect(formatDuration(65)).toBe('01:05')
    })

    it('should format hours correctly', () => {
      expect(formatDuration(3665)).toBe('61:05')
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(0)).toBe('0 B')
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
      expect(formatFileSize(1572864)).toBe('1.5 MB')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toContain('1,000')
    })
  })

  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('should clamp value below min', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })

    it('should clamp value above max', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })
  })
})
