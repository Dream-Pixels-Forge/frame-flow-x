import { ExtractedFrame } from '@/utils/frameExtractor'

export interface FrameGalleryState {
  // State
  frames: ExtractedFrame[]
  selectedFrameIds: string[]
  favoriteFrameIds: string[]
  viewMode: 'grid' | 'list' | 'timeline'
  zoomLevel: number
  selectedFrameIndex: number
  
  // Actions
  setFrames: (frames: ExtractedFrame[]) => void
  clearFrames: () => void
  toggleFrameSelection: (frameId: string) => void
  selectFrame: (frameId: string) => void
  deselectFrame: (frameId: string) => void
  selectAllFrames: () => void
  clearSelection: () => void
  toggleFavorite: (frameId: string) => void
  setViewMode: (mode: 'grid' | 'list' | 'timeline') => void
  setZoomLevel: (level: number) => void
  setSelectedFrameIndex: (index: number) => void
  navigateFrames: (direction: 'prev' | 'next') => void
}
