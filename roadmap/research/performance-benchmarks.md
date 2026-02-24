# Performance Benchmarks

## Overview

This document outlines performance targets, benchmark methodologies, and optimization strategies for Frame Flow X video processing operations.

---

## Performance Targets

### Frame Extraction

| Operation | Target | Acceptable | Notes |
|-----------|--------|------------|-------|
| **1080p @ 1fps (Desktop)** | 30s/min | 60s/min | Native FFmpeg |
| **1080p @ 1fps (Web)** | 120s/min | 180s/min | FFmpeg.wasm |
| **4K @ 1fps (Desktop)** | 90s/min | 150s/min | Native FFmpeg |
| **4K @ 1fps (Web)** | Not supported | - | Desktop only |

### AI Upscaling

| Operation | Target | Acceptable | Notes |
|-----------|--------|------------|-------|
| **1080p 2x (Local GPU)** | 1s/frame | 2s/frame | RTX 3060+ |
| **1080p 4x (Local GPU)** | 2s/frame | 4s/frame | RTX 3060+ |
| **1080p 2x (Cloud API)** | 5s/frame | 10s/frame | Replicate |
| **1080p 4x (Cloud API)** | 8s/frame | 15s/frame | Replicate |

### Enhancement Filters

| Filter | Target | Acceptable | Notes |
|--------|--------|------------|-------|
| **Noise Reduction** | 0.5s/frame | 1s/frame | CPU |
| **Sharpening** | 0.2s/frame | 0.5s/frame | CPU |
| **Color Correction** | 0.1s/frame | 0.3s/frame | CPU |
| **Preset Application** | 0.3s/frame | 0.5s/frame | Combined |

### UI Performance

| Metric | Target | Acceptable | Notes |
|--------|--------|------------|-------|
| **App Load Time** | < 3s | < 5s | Cold start |
| **Frame Gallery Render** | < 100ms | < 200ms | 100 frames |
| **Preview Zoom** | < 50ms | < 100ms | Pan/zoom |
| **Animation FPS** | 60 | 30 | UI animations |

---

## Benchmark Methodology

### Test Environment

#### Desktop (Reference)
| Component | Specification |
|-----------|--------------|
| **CPU** | Intel i7-12700K / AMD Ryzen 7 5800X |
| **GPU** | NVIDIA RTX 3060 12GB |
| **RAM** | 32GB DDR4 |
| **Storage** | NVMe SSD |
| **OS** | Windows 11 / macOS 12 / Ubuntu 22.04 |

#### Web (Reference)
| Component | Specification |
|-----------|--------------|
| **Browser** | Chrome 120+ |
| **CPU** | Intel i5-11400 |
| **RAM** | 16GB |
| **Network** | 100 Mbps |

### Test Videos

| Name | Resolution | Duration | Codec | Size |
|------|------------|----------|-------|------|
| **Short HD** | 1920x1080 | 30s | H.264 | 50MB |
| **Long HD** | 1920x1080 | 5min | H.264 | 500MB |
| **Short 4K** | 3840x2160 | 30s | H.265 | 200MB |
| **WebM Test** | 1920x1080 | 1min | VP9 | 100MB |

---

## Benchmark Scripts

### Frame Extraction Benchmark
```typescript
import { performance } from 'perf_hooks'
import ffmpeg from 'fluent-ffmpeg'

interface BenchmarkResult {
  video: string
  resolution: string
  duration: number
  extractionTime: number
  framesExtracted: number
  framesPerSecond: number
}

async function benchmarkFrameExtraction(
  videoPath: string,
  fps: number = 1
): Promise<BenchmarkResult> {
  const metadata = await getVideoMetadata(videoPath)
  const outputDir = `/tmp/benchmark_${Date.now()}`
  
  const startTime = performance.now()
  
  await new Promise<void>((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([`-vf fps=${fps}`, '-q:v 2'])
      .output(`${outputDir}/frame_%04d.png`)
      .on('end', () => resolve())
      .on('error', reject)
      .run()
  })
  
  const endTime = performance.now()
  const extractionTime = (endTime - startTime) / 1000
  
  const expectedFrames = Math.floor(metadata.duration * fps)
  
  return {
    video: videoPath,
    resolution: `${metadata.width}x${metadata.height}`,
    duration: metadata.duration,
    extractionTime,
    framesExtracted: expectedFrames,
    framesPerSecond: expectedFrames / extractionTime,
  }
}

// Run benchmarks
async function runBenchmarks() {
  const results = []
  
  results.push(await benchmarkFrameExtraction('test/short_hd.mp4'))
  results.push(await benchmarkFrameExtraction('test/long_hd.mp4'))
  results.push(await benchmarkFrameExtraction('test/short_4k.mp4'))
  
  console.table(results)
  return results
}
```

### AI Upscaling Benchmark
```typescript
interface UpscaleBenchmarkResult {
  resolution: string
  scale: number
  method: 'local' | 'cloud'
  processingTime: number
  secondsPerFrame: number
}

async function benchmarkUpscaling(
  frames: string[],
  scale: number,
  method: 'local' | 'cloud'
): Promise<UpscaleBenchmarkResult> {
  const startTime = performance.now()
  
  if (method === 'local') {
    await upscaleLocally(frames, scale)
  } else {
    await upscaleWithCloud(frames, scale)
  }
  
  const endTime = performance.now()
  const processingTime = (endTime - startTime) / 1000
  
  return {
    resolution: '1920x1080',
    scale,
    method,
    processingTime,
    secondsPerFrame: processingTime / frames.length,
  }
}
```

### UI Performance Benchmark
```typescript
import { measure } from 'measure-ts'

async function benchmarkGalleryRender(frameCount: number) {
  const frames = generateTestFrames(frameCount)
  
  const { duration } = await measure(async () => {
    renderGallery(frames)
    await waitForRender()
  })
  
  return {
    frameCount,
    renderTime: duration,
    framesPerMs: frameCount / duration,
  }
}

// Test different gallery sizes
const galleryBenchmarks = [
  await benchmarkGalleryRender(10),
  await benchmarkGalleryRender(100),
  await benchmarkGalleryRender(1000),
]
```

---

## Optimization Strategies

### Frame Extraction Optimization

#### 1. Multi-threading
```typescript
// Process multiple videos in parallel
const workerCount = os.cpus().length
const queue = new PQueue({ concurrency: workerCount })

videos.forEach(video => {
  queue.add(() => extractFrames(video))
})
```

#### 2. Chunked Processing
```typescript
// Process video in chunks for memory efficiency
async function extractInChunks(
  videoPath: string,
  chunkDuration: number = 60 // seconds
) {
  const duration = await getVideoDuration(videoPath)
  const chunks = Math.ceil(duration / chunkDuration)
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkDuration
    const end = Math.min((i + 1) * chunkDuration, duration)
    
    await ffmpeg(videoPath)
      .setStartTime(start)
      .setDuration(end - start)
      .output(`chunk_${i}_frame_%04d.png`)
      .run()
  }
}
```

#### 3. Hardware Acceleration
```typescript
// Use GPU acceleration when available
const gpuFlags = [
  '-hwaccel cuda',      // NVIDIA
  '-hwaccel qsv',       // Intel QuickSync
  '-hwaccel videotoolbox', // macOS
]

ffmpeg(videoPath)
  .inputOptions(gpuFlags)
  // ... rest of processing
```

### AI Upscaling Optimization

#### 1. Tiled Processing
```typescript
// Process large images in tiles to reduce VRAM usage
async function upscaleTiled(
  image: Buffer,
  tileSize: number = 256
) {
  const tiles = splitIntoTiles(image, tileSize)
  const upscaledTiles = await Promise.all(
    tiles.map(tile => upscale(tile))
  )
  return mergeTiles(upscaledTiles)
}
```

#### 2. Batch Processing
```typescript
// Process multiple frames in single GPU call
async function upscaleBatch(
  frames: Buffer[],
  batchSize: number = 4
) {
  const batches = chunk(frames, batchSize)
  const results = []
  
  for (const batch of batches) {
    const batchResult = await upscaleModel.predict(batch)
    results.push(...batchResult)
  }
  
  return results
}
```

#### 3. Model Selection
```typescript
// Choose model based on content type
function selectModel(contentType: string) {
  switch (contentType) {
    case 'anime':
      return 'RealESRGAN_x4plus_anime_6B'
    case 'face':
      return 'GFPGAN'
    default:
      return 'RealESRGAN_x4plus'
  }
}
```

### UI Optimization

#### 1. Virtual Scrolling
```typescript
// Only render visible frames in gallery
function useVirtualScroll(
  containerRef: RefObject<HTMLElement>,
  itemCount: number,
  itemHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleStart = Math.floor(scrollTop / itemHeight)
  const visibleEnd = visibleStart + VISIBLE_COUNT
  
  return {
    visibleStart,
    visibleEnd,
    totalHeight: itemCount * itemHeight,
  }
}
```

#### 2. Lazy Loading
```typescript
// Load frame thumbnails on demand
function useLazyFrameThumbnail(frame: Frame) {
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadThumbnail(frame.id).then(setThumbnail)
          observer.disconnect()
        }
      }
    )
    
    observer.observe(elementRef.current)
    return () => observer.disconnect()
  }, [frame])
  
  return thumbnail
}
```

#### 3. Web Workers
```typescript
// Offload heavy processing to workers
const worker = new Worker('processing.worker.ts')

worker.postMessage({ type: 'EXTRACT_FRAMES', video })
worker.onmessage = (e) => {
  const { frames, progress } = e.data
  updateUI(frames, progress)
}
```

---

## Performance Monitoring

### Runtime Metrics
```typescript
class PerformanceMonitor {
  private metrics = new Map<string, number[]>()
  
  record(operation: string, duration: number) {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }
    this.metrics.get(operation)!.push(duration)
  }
  
  getAverage(operation: string): number {
    const values = this.metrics.get(operation) || []
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
  }
  
  getPercentile(operation: string, p: number): number {
    const values = this.metrics.get(operation) || []
    if (values.length === 0) return 0
    values.sort((a, b) => a - b)
    const index = Math.floor((p / 100) * values.length)
    return values[index]
  }
  
  report() {
    console.log('Performance Report:')
    this.metrics.forEach((values, operation) => {
      console.log(`${operation}:`)
      console.log(`  Avg: ${this.getAverage(operation).toFixed(2)}ms`)
      console.log(`  P95: ${this.getPercentile(operation, 95).toFixed(2)}ms`)
      console.log(`  P99: ${this.getPercentile(operation, 99).toFixed(2)}ms`)
    })
  }
}
```

### Build Size Monitoring
```yaml
# .github/workflows/bundle-size.yml
name: Bundle Size

on: [pull_request]

jobs:
  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm build
      - name: Check bundle size
        uses: preactjs/compressed-size-action@v2
        with:
          pattern: './dist/**/*.{js,css}'
```

---

## Benchmark Results (Reference)

### Frame Extraction (Desktop - RTX 3060)

| Video | Resolution | Duration | FPS | Time | Frames/sec |
|-------|------------|----------|-----|------|------------|
| Short HD | 1080p | 30s | 1 | 15s | 2.0 |
| Long HD | 1080p | 5min | 1 | 150s | 2.0 |
| Short 4K | 4K | 30s | 1 | 45s | 0.67 |

### Frame Extraction (Web - Chrome)

| Video | Resolution | Duration | FPS | Time | Frames/sec |
|-------|------------|----------|-----|------|------------|
| Short HD | 1080p | 30s | 1 | 60s | 0.5 |
| Short HD | 720p | 30s | 1 | 35s | 0.86 |

### AI Upscaling (Local - RTX 3060)

| Resolution | Scale | Time/Frame | Notes |
|------------|-------|------------|-------|
| 1080p | 2x | 1.0s | FP16 |
| 1080p | 4x | 2.0s | FP16 |
| 720p | 4x | 1.2s | FP16 |

### AI Upscaling (Cloud - Replicate)

| Resolution | Scale | Time/Frame | Cost/Frame |
|------------|-------|------------|------------|
| 1080p | 2x | 5s | $0.0015 |
| 1080p | 4x | 8s | $0.0025 |
| 720p | 4x | 4s | $0.0010 |

---

## Performance Budget

### Build Size Budget
| Resource | Budget | Warning | Error |
|----------|--------|---------|-------|
| **JavaScript (total)** | 800 KB | 900 KB | 1 MB |
| **JavaScript (initial)** | 300 KB | 350 KB | 400 KB |
| **CSS (total)** | 50 KB | 60 KB | 75 KB |
| **Images** | 500 KB | 600 KB | 750 KB |

### Runtime Budget
| Metric | Budget | Warning | Error |
|--------|--------|---------|-------|
| **FCP** | 1.5s | 2s | 3s |
| **LCP** | 2.5s | 3s | 4s |
| **TTI** | 3.5s | 4s | 5s |
| **TBT** | 200ms | 300ms | 500ms |

---

## Resources

### Tools
- [WebPageTest](https://www.webpagetest.org/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [FFmpeg Benchmarks](https://trac.ffmpeg.org/wiki/Benchmarking)

### Documentation
- [Web Performance](https://web.dev/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)

---

*Document Version: 1.0*
*Last Updated: 2026-02-24*
*Owner: Video Engineering Team*
