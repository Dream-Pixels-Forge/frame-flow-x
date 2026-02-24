# FFmpeg Integration Research

## Executive Summary

This document outlines the research findings for integrating FFmpeg into Frame Flow X for video frame extraction. We evaluated both **FFmpeg.wasm** for web processing and **fluent-ffmpeg** (Node.js) for desktop applications.

---

## 1. FFmpeg.wasm (Web Processing)

### Overview
FFmpeg.wasm is a WebAssembly port of FFmpeg that runs directly in the browser, enabling client-side video processing without server infrastructure.

### Package Information
- **Package:** `@ffmpeg/ffmpeg` (latest: 0.12.x)
- **TypeScript:** `@types/ffmpeg__ffmpeg`
- **Size:** ~25MB (core + wasm files)

### Pros
| Advantage | Impact |
|-----------|--------|
| **No server required** | Reduces infrastructure costs |
| **Privacy-first** | Videos never leave user's device |
| **Offline capable** | Works without internet connection |
| **Scalable** | Processing happens on client |
| **Modern API** | Promise-based, easy to use |

### Cons
| Limitation | Mitigation |
|------------|------------|
| **Large download** (~25MB) | Lazy load, show progress |
| **Slower than native** (3-5x) | Web Workers, progress feedback |
| **Memory limits** (browser) | Chunked processing, cleanup |
| **Limited codec support** | Focus on MP4/H.264, provide fallback |
| **SharedArrayBuffer required** | COOP/COEP headers, fallback mode |

### Installation
```bash
pnpm add @ffmpeg/ffmpeg @ffmpeg/util
```

### Basic Usage Example
```typescript
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

const ffmpeg = new FFmpeg()

async function extractFrames(videoFile: File, fps: number = 1) {
  // Load FFmpeg
  await ffmpeg.load({
    coreURL: await toBlobURL(
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js',
      'text/javascript'
    ),
    wasmURL: await toBlobURL(
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm',
      'application/wasm'
    ),
  })

  // Write file to virtual filesystem
  await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))

  // Extract frames (1 FPS)
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-vf', `fps=${fps}`,
    '-q:v', '2',
    'frame_%04d.png'
  ])

  // Read output files
  const files = await ffmpeg.listDir('/')
  const frames = await Promise.all(
    files
      .filter(f => f.name.startsWith('frame_'))
      .map(async (f) => {
        const data = await ffmpeg.readFile(f.name)
        return {
          name: f.name,
          data: new Blob([data], { type: 'image/png' }),
        }
      })
  )

  return frames
}
```

### Required Headers (for SharedArrayBuffer)
```javascript
// vite.config.ts
server: {
  headers: {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  }
}
```

### Performance Benchmarks (Estimated)
| Video Resolution | Processing Time (1 min @ 1fps) |
|------------------|-------------------------------|
| 480p | ~30-45 seconds |
| 720p | ~60-90 seconds |
| 1080p | ~120-180 seconds |
| 4K | ~300+ seconds |

### Recommended Configuration
```typescript
const FFMPEG_CONFIG = {
  web: {
    useSharedArrayBuffer: true,
    corePath: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/',
    defaultOutputFormat: 'png',
    defaultQuality: 2, // 1-31 (lower = better)
    maxVideoSize: 200 * 1024 * 1024, // 200MB for web
    supportedFormats: ['mp4', 'webm'],
    supportedCodecs: ['h264', 'vp8', 'vp9'],
  }
}
```

---

## 2. Fluent-FFmpeg (Node.js/Desktop)

### Overview
Fluent-FFmpeg is a high-level interface for FFmpeg in Node.js, providing a fluent API for complex video operations. Ideal for Electron desktop app.

### Package Information
- **Package:** `fluent-ffmpeg` (latest: 2.1.x)
- **TypeScript:** `@types/fluent-ffmpeg`
- **Dependencies:** Requires system FFmpeg installation

### Pros
| Advantage | Impact |
|-----------|--------|
| **Full FFmpeg power** | All codecs, filters, formats |
| **Native performance** | 3-5x faster than wasm |
| **No size limits** | Process large files |
| **Multi-threading** | Worker threads for parallel processing |
| **Mature ecosystem** | Well-documented, stable |

### Cons
| Limitation | Mitigation |
|------------|------------|
| **Requires FFmpeg binary** | Bundle with app or auto-download |
| **Desktop only** | Not for web |
| **Native dependencies** | Platform-specific builds |

### Installation
```bash
pnpm add fluent-ffmpeg
pnpm add -D @types/fluent-ffmpeg

# For bundling FFmpeg binaries
pnpm add ffmpeg-static
pnpm add -D @types/ffmpeg-static
```

### Basic Usage Example
```typescript
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath)

async function extractFrames(
  videoPath: string, 
  outputDir: string, 
  fps: number = 1
) {
  return new Promise((resolve, reject) => {
    let frameCount = 0
    const frames: string[] = []

    ffmpeg(videoPath)
      .outputOptions([
        `-vf fps=${fps}`,
        '-q:v 2',
        '-vsync 0',
      ])
      .output(`${outputDir}/frame_%04d.png`)
      .on('start', (command) => {
        console.log('Started:', command)
      })
      .on('progress', (progress) => {
        console.log('Progress:', {
          percent: progress.percent,
          currentFps: progress.currentFps,
          timemark: progress.timemark,
        })
      })
      .on('end', () => {
        console.log('Extraction complete')
        resolve(frames)
      })
      .on('error', (error) => {
        console.error('Error:', error)
        reject(error)
      })
      .run()
  })
}

// With progress tracking
async function extractFramesWithProgress(
  videoPath: string,
  outputDir: string,
  fps: number = 1,
  onProgress?: (progress: { percent: number; frame: number }) => void
) {
  return new Promise((resolve, reject) => {
    // Get video duration first
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err)
      
      const duration = metadata.format.duration
      const totalFrames = Math.floor(duration * fps)
      
      ffmpeg(videoPath)
        .outputOptions([
          `-vf fps=${fps}`,
          '-q:v 2',
          '-vsync 0',
        ])
        .output(`${outputDir}/frame_%04d.png`)
        .on('progress', (progress) => {
          onProgress?.({
            percent: progress.percent || 0,
            frame: Math.floor((progress.percent || 0) / 100 * totalFrames),
          })
        })
        .on('end', () => resolve(true))
        .on('error', reject)
        .run()
    })
  })
}
```

### Performance Benchmarks (Native)
| Video Resolution | Processing Time (1 min @ 1fps) |
|------------------|-------------------------------|
| 480p | ~5-10 seconds |
| 720p | ~15-25 seconds |
| 1080p | ~30-45 seconds |
| 4K | ~90-120 seconds |

### Recommended Configuration
```typescript
const FFMPEG_CONFIG = {
  desktop: {
    useStaticBinary: true,
    defaultOutputFormat: 'png',
    defaultQuality: 2,
    maxVideoSize: 2 * 1024 * 1024 * 1024, // 2GB for desktop
    supportedFormats: ['mp4', 'mov', 'avi', 'mkv', 'webm', 'mov'],
    supportedCodecs: ['h264', 'h265', 'prores', 'vp9', 'av1'],
    threads: 'auto', // Use all available cores
  }
}
```

---

## 3. Hybrid Approach (Recommended)

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                   Frame Flow X                           │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────┐           ┌─────────────────────┐  │
│  │   Web App       │           │   Desktop App       │  │
│  │   (Browser)     │           │   (Electron)        │  │
│  ├─────────────────┤           ├─────────────────────┤  │
│  │ FFmpeg.wasm     │           │ fluent-ffmpeg       │  │
│  │ - Small files   │           │ - Large files       │  │
│  │ - Quick edits   │           │ - Batch processing  │  │
│  │ - < 200MB       │           │ - > 200MB           │  │
│  └─────────────────┘           └─────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Decision Matrix
| Criteria | Web (wasm) | Desktop (Node.js) |
|----------|------------|-------------------|
| File Size | < 200MB | Any size |
| Resolution | Up to 1080p | Any (including 4K/8K) |
| Speed | Not critical | Fast processing needed |
| Offline | Required | Required |
| Codecs | H.264, VP8/9 | All FFmpeg codecs |
| Batch Processing | Limited | Full support |

### Implementation Strategy

#### Phase 1: Desktop First (Recommended)
1. Start with fluent-ffmpeg for Electron app
2. Full feature set, no compromises
3. Better performance for core use case

#### Phase 2: Web Lite
1. Add FFmpeg.wasm for web
2. Limited features (small files, basic extraction)
3. Upsell to desktop for advanced features

---

## 4. Video Format Compatibility

### Supported Input Formats
| Format | Extension | Web Support | Desktop Support | Notes |
|--------|-----------|-------------|-----------------|-------|
| **MP4** | .mp4 | ✅ | ✅ | Primary format (H.264) |
| **WebM** | .webm | ✅ | ✅ | VP8/VP9 codec |
| **MOV** | .mov | ❌ | ✅ | QuickTime format |
| **AVI** | .avi | ❌ | ✅ | Legacy format |
| **MKV** | .mkv | ❌ | ✅ | Matroska container |
| **FLV** | .flv | ❌ | ✅ | Flash video |
| **WMV** | .wmv | ❌ | ✅ | Windows Media |

### Recommended Output Formats
| Format | Use Case | Quality | Size |
|--------|----------|---------|------|
| **PNG** | Master frames, editing | Lossless | Large |
| **JPEG** | Web, sharing | Lossy (configurable) | Medium |
| **WebP** | Web optimization | Lossy/Lossless | Small |
| **TIFF** | Professional | Lossless | Very Large |

---

## 5. FFmpeg Command Reference

### Frame Extraction
```bash
# Extract 1 frame per second
ffmpeg -i input.mp4 -vf fps=1 -q:v 2 frame_%04d.png

# Extract specific time range
ffmpeg -i input.mp4 -ss 00:01:00 -to 00:02:00 -vf fps=1 frame_%04d.png

# Extract at specific resolution
ffmpeg -i input.mp4 -vf "fps=1,scale=1920:1080" -q:v 2 frame_%04d.png

# Extract with specific frame count
ffmpeg -i input.mp4 -vf "select=not(mod(n\,30))" -vsync vfr frame_%04d.png
```

### Quality Settings
| `-q:v` Value | Quality | File Size |
|--------------|---------|-----------|
| 1 | Best | Largest |
| 2 | Excellent | Large |
| 3-5 | Very Good | Medium |
| 6-10 | Good | Small |
| 11-31 | Poor | Smallest |

---

## 6. Recommendations

### For Frame Flow X MVP

1. **Desktop App (Priority)**
   - Use `fluent-ffmpeg` with `ffmpeg-static`
   - Bundle FFmpeg binary with Electron app
   - Support all major formats
   - Enable multi-threading for batch processing

2. **Web App (Secondary)**
   - Use `@ffmpeg/ffmpeg` for basic extraction
   - Limit to 200MB files, MP4/WebM only
   - Show clear upgrade path to desktop
   - Implement lazy loading for wasm files

3. **Shared Logic**
   - Create abstraction layer for both implementations
   - Same API for frame extraction
   - Unified progress tracking
   - Consistent error handling

### Next Steps
1. ✅ Research complete
2. [ ] Create proof of concept for both platforms
3. [ ] Benchmark with real video files
4. [ ] Finalize implementation approach
5. [ ] Document API for video processing module

---

## 7. Resources

### Documentation
- [FFmpeg.wasm Docs](https://ffmpegwasm.netlify.app/)
- [Fluent-FFmpeg GitHub](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)

### Codecs & Formats
- [Supported Formats](https://ffmpeg.org/ffmpeg-formats.html)
- [Video Codecs](https://ffmpeg.org/ffmpeg-codecs.html)
- [Filters](https://ffmpeg.org/ffmpeg-filters.html)

### Performance
- [WebAssembly Performance](https://webassembly.org/docs/performance/)
- [FFmpeg Encoding Guide](https://trac.ffmpeg.org/wiki/Encode/H.264)

---

*Research Date: 2026-02-24*
*Last Updated: 2026-02-24*
*Owner: Video Engineering Team*
