import { create } from 'zustand'
import { ExtractedFrame } from '@/utils/frameExtractor'
import { FrameGalleryState } from '@/types/frames'

export const useFrameGalleryStore = create<FrameGalleryState>()((set) => ({
  // Initial state
  frames: [],
  selectedFrameIds: [],
  favoriteFrameIds: [],
  viewMode: 'grid',
  zoomLevel: 100,
  selectedFrameIndex: -1,

  // Actions
  setFrames: (frames: ExtractedFrame[]) => {
    set({ frames, selectedFrameIds: [], selectedFrameIndex: -1 })
  },

  clearFrames: () => {
    set({
      frames: [],
      selectedFrameIds: [],
      favoriteFrameIds: [],
      selectedFrameIndex: -1,
    })
  },

  toggleFrameSelection: (frameId: string) => {
    set((state) => {
      const isSelected = state.selectedFrameIds.includes(frameId)
      const newSelection = isSelected
        ? state.selectedFrameIds.filter((id) => id !== frameId)
        : [...state.selectedFrameIds, frameId]

      return { selectedFrameIds: newSelection }
    })
  },

  selectFrame: (frameId: string) => {
    set((state) => {
      if (state.selectedFrameIds.includes(frameId)) return state
      return { selectedFrameIds: [...state.selectedFrameIds, frameId] }
    })
  },

  deselectFrame: (frameId: string) => {
    set((state) => ({
      selectedFrameIds: state.selectedFrameIds.filter((id) => id !== frameId),
    }))
  },

  selectAllFrames: () => {
    set((state) => ({
      selectedFrameIds: state.frames.map((f) => f.id),
    }))
  },

  clearSelection: () => {
    set({ selectedFrameIds: [] })
  },

  toggleFavorite: (frameId: string) => {
    set((state) => {
      const isFavorite = state.favoriteFrameIds.includes(frameId)
      const newFavorites = isFavorite
        ? state.favoriteFrameIds.filter((id) => id !== frameId)
        : [...state.favoriteFrameIds, frameId]

      return { favoriteFrameIds: newFavorites }
    })
  },

  setViewMode: (mode: 'grid' | 'list' | 'timeline') => {
    set({ viewMode: mode })
  },

  setZoomLevel: (level: number) => {
    set({ zoomLevel: Math.max(50, Math.min(200, level)) })
  },

  setSelectedFrameIndex: (index: number) => {
    set({ selectedFrameIndex: index })
  },

  navigateFrames: (direction: 'prev' | 'next') => {
    set((state) => {
      const { frames, selectedFrameIndex } = state
      if (frames.length === 0) return state

      let newIndex = selectedFrameIndex
      if (direction === 'prev') {
        newIndex = Math.max(0, selectedFrameIndex - 1)
      } else {
        newIndex = Math.min(frames.length - 1, selectedFrameIndex + 1)
      }

      const frameId = frames[newIndex]?.id
      if (frameId && !state.selectedFrameIds.includes(frameId)) {
        return {
          selectedFrameIndex: newIndex,
          selectedFrameIds: [frameId],
        }
      }

      return { selectedFrameIndex: newIndex }
    })
  },
}))
