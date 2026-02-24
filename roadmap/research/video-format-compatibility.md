# Video Format Compatibility Matrix

## Supported Input Formats

### Primary Formats (MVP)
| Format | Extension | Container | Video Codec | Audio Codec | Web Support | Desktop Support | Max Resolution | Notes |
|--------|-----------|-----------|-------------|-------------|-------------|-----------------|----------------|-------|
| **MP4** | .mp4 | MPEG-4 Part 14 | H.264, H.265, VP9 | AAC, MP3 | ✅ Full | ✅ Full | 8K | Primary format |
| **WebM** | .webm | WebM | VP8, VP9, AV1 | Vorbis, Opus | ✅ Full | ✅ Full | 4K | Web-optimized |

### Secondary Formats (Desktop)
| Format | Extension | Container | Video Codec | Audio Codec | Web Support | Desktop Support | Max Resolution | Notes |
|--------|-----------|-----------|-------------|-------------|-------------|-----------------|----------------|-------|
| **MOV** | .mov | QuickTime | H.264, ProRes, HEVC | AAC, PCM | ❌ | ✅ Full | 8K | Apple ecosystem |
| **AVI** | .avi | AVI | H.264, MJPEG, DivX | MP3, PCM | ❌ | ✅ Full | 4K | Legacy format |
| **MKV** | .mkv | Matroska | H.264, H.265, VP9 | AAC, DTS, TrueHD | ❌ | ✅ Full | 8K | Feature-rich |
| **FLV** | .flv | Flash Video | H.264, VP6 | MP3, AAC | ❌ | ✅ Partial | 1080p | Legacy (Flash) |

### Professional Formats
| Format | Extension | Use Case | Desktop Support | Notes |
|--------|-----------|----------|-----------------|-------|
| **ProRes** | .mov | Professional video | ✅ | Apple codec, large files |
| **DNxHD** | .mov | Professional video | ✅ | Avid codec |
| **MXF** | .mxf | Broadcast | ✅ | Professional cameras |
| **CinemaDNG** | .dng | Cinema cameras | ⚠️ Limited | Raw format, very large |

---

## Output Formats

### Image Formats for Frames
| Format | Extension | Compression | Quality | File Size | Use Case |
|--------|-----------|-------------|---------|-----------|----------|
| **PNG** | .png | Lossless | 100% | Large | Master frames, editing |
| **JPEG** | .jpg | Lossy | 1-100% | Medium | Web, sharing |
| **WebP** | .webp | Lossy/Lossless | 1-100% | Small | Web optimization |
| **TIFF** | .tiff | Lossless | 100% | Very Large | Professional |
| **BMP** | .bmp | None | 100% | Very Large | Legacy |

### Recommended Defaults
| Use Case | Format | Quality | Notes |
|----------|--------|---------|-------|
| **Default** | PNG | Lossless | Best quality, editable |
| **Web** | WebP | 85% | Best compression |
| **Sharing** | JPEG | 90% | Universal compatibility |
| **Professional** | TIFF | Lossless | Maximum quality |

---

## Codec Compatibility

### Video Codecs
| Codec | Web (FFmpeg.wasm) | Desktop (fluent-ffmpeg) | Hardware Acceleration | Notes |
|-------|-------------------|------------------------|----------------------|-------|
| **H.264** | ✅ | ✅ | ✅ All GPUs | Universal support |
| **H.265/HEVC** | ⚠️ Limited | ✅ | ✅ Modern GPUs | Better compression |
| **VP8** | ✅ | ✅ | ✅ | Older web codec |
| **VP9** | ✅ | ✅ | ✅ | Better than VP8 |
| **AV1** | ⚠️ Experimental | ✅ | ✅ New GPUs | Best compression |
| **ProRes** | ❌ | ✅ | ✅ | Apple professional |
| **MJPEG** | ❌ | ✅ | ❌ | Camera capture |

### Audio Codecs (for reference)
| Codec | Support | Notes |
|-------|---------|-------|
| **AAC** | ✅ Full | Most common |
| **MP3** | ✅ Full | Legacy |
| **Opus** | ✅ Full | Best quality |
| **Vorbis** | ✅ Full | WebM default |
| **FLAC** | ✅ Full | Lossless |
| **PCM** | ✅ Full | Uncompressed |

---

## Resolution & Frame Rate Support

### Resolutions
| Name | Resolution | Aspect Ratio | Web Support | Desktop Support |
|------|------------|--------------|-------------|-----------------|
| **SD** | 640x480 | 4:3 | ✅ | ✅ |
| **HD** | 1280x720 | 16:9 | ✅ | ✅ |
| **FHD** | 1920x1080 | 16:9 | ✅ | ✅ |
| **QHD** | 2560x1440 | 16:9 | ⚠️ Slow | ✅ |
| **4K UHD** | 3840x2160 | 16:9 | ❌ | ✅ |
| **8K UHD** | 7680x4320 | 16:9 | ❌ | ✅ |

### Frame Rates
| FPS | Use Case | Web Support | Desktop Support |
|-----|----------|-------------|-----------------|
| **24** | Cinema | ✅ | ✅ |
| **25** | PAL | ✅ | ✅ |
| **30** | NTSC, Web | ✅ | ✅ |
| **60** | Smooth motion | ⚠️ Slow | ✅ |
| **120+** | High speed | ❌ | ✅ |

---

## File Size Limits

### Web Application (FFmpeg.wasm)
| Tier | Max Size | Notes |
|------|----------|-------|
| **Recommended** | 50 MB | Fast processing |
| **Supported** | 200 MB | Slower, memory intensive |
| **Hard Limit** | 500 MB | Browser memory limits |

### Desktop Application
| Tier | Max Size | Notes |
|------|----------|-------|
| **Recommended** | 2 GB | Optimal performance |
| **Supported** | 10 GB | Batch processing recommended |
| **Hard Limit** | None | System storage dependent |

---

## Platform-Specific Notes

### Web Browser Limitations
- **Memory:** Limited by browser (~2GB max)
- **Codecs:** H.264, VP8, VP9 only
- **Resolution:** Up to 1440p recommended
- **File Size:** < 200MB for best experience

### Desktop Advantages
- **Memory:** System RAM available
- **Codecs:** Full FFmpeg support
- **Resolution:** Up to 8K
- **File Size:** No practical limit
- **GPU Acceleration:** NVENC, QuickSync, VCE

---

## FFmpeg Command Examples

### Format Detection
```bash
ffprobe -v error -show_entries stream=codec_name,codec_type,width,height -of json input.mp4
```

### Extract Frames (All Formats)
```bash
# MP4/H.264
ffmpeg -i input.mp4 -vf fps=1 -q:v 2 frame_%04d.png

# MOV/ProRes
ffmpeg -i input.mov -vf fps=1 -q:v 2 frame_%04d.png

# MKV/H.265
ffmpeg -i input.mkv -vf fps=1 -q:v 2 frame_%04d.png

# WebM/VP9
ffmpeg -i input.webm -vf fps=1 -q:v 2 frame_%04d.png
```

### Format Conversion (if needed)
```bash
# Convert to MP4 for web compatibility
ffmpeg -i input.avi -c:v libx264 -c:a aac output.mp4

# Convert to WebM for web
ffmpeg -i input.mov -c:v libvpx-vp9 -c:a libopus output.webm
```

---

## Recommendations for Frame Flow X

### MVP Support
1. **Input:** MP4 (H.264), WebM (VP9)
2. **Output:** PNG (default), JPEG, WebP
3. **Max Resolution:** 1080p (web), 4K (desktop)
4. **Max File Size:** 200MB (web), 2GB (desktop)

### v1.0 Support
1. **Input:** Add MOV, MKV, AVI
2. **Output:** Add TIFF, custom naming
3. **Max Resolution:** 4K (web with limits), 8K (desktop)
4. **Batch Processing:** Multiple files

### Professional (v2.0+)
1. **Input:** ProRes, DNxHD, MXF
2. **Output:** CinemaDNG, EXR (HDR)
3. **Features:** LUT support, color space conversion

---

## Error Handling

### Common Issues
| Error | Cause | Solution |
|-------|-------|----------|
| "Unsupported codec" | Format not supported | Convert to MP4/H.264 |
| "Out of memory" | File too large | Use desktop app or split video |
| "Invalid container" | Corrupted file | Re-encode video |
| "Audio stream error" | Unsupported audio | Extract video only |

### Fallback Strategy
```typescript
async function processVideo(inputPath: string) {
  try {
    // Try native format
    await extractFrames(inputPath)
  } catch (error) {
    if (error.code === 'UNSUPPORTED_CODEC') {
      // Convert to compatible format
      const converted = await convertToMP4(inputPath)
      await extractFrames(converted)
    } else {
      throw error
    }
  }
}
```

---

*Document Version: 1.0*
*Last Updated: 2026-02-24*
*Owner: Video Engineering Team*
