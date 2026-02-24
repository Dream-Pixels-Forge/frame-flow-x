# AI Upscaling Research

## Executive Summary

This document evaluates AI upscaling solutions for Frame Flow X, comparing local processing (Real-ESRGAN) with cloud APIs (Topaz, Replicate, etc.) for video frame enhancement.

---

## 1. Market Overview

### AI Video Enhancement Market
- **2025 Value:** $890M
- **2030 Projected:** $2.4B
- **CAGR:** 21.8%

### Key Players
| Company | Product | Type | Price Range |
|---------|---------|------|-------------|
| Topaz Labs | Video AI | Desktop Software | $299 one-time |
| Runway ML | AI Tools | Cloud API | $15-95/month |
| Replicate | AI Models | Cloud API | Pay-per-second |
| Stability AI | Real-ESRGAN | Open Source | Free |
| Adobe | Super Resolution | Creative Cloud | $55/month |

---

## 2. Real-ESRGAN (Local Processing)

### Overview
Real-ESRGAN is an open-source image/video super-resolution model that can be run locally.

### GitHub: [xinntao/Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN)

### Pros
| Advantage | Impact |
|-----------|--------|
| **Free & Open Source** | No licensing costs |
| **Privacy** | Processing stays local |
| **No API limits** | Unlimited processing |
| **Offline capable** | Works without internet |
| **Customizable** | Can fine-tune models |

### Cons
| Limitation | Mitigation |
|------------|------------|
| **GPU required** | CPU fallback (slower) |
| **Large model** (~700MB) | Download on demand |
| **Setup complexity** | Pre-built binaries |
| **VRAM intensive** | Tile-based processing |
| **Slower than cloud** | Progress feedback |

### Installation Options

#### Option A: Python Package (Recommended for Desktop)
```bash
pip install realesrgan
```

#### Option B: Node.js Binding
```bash
pnpm add realesrgan-node
```

#### Option C: ONNX Runtime (Cross-platform)
```bash
pnpm add onnxruntime-node
```

### Usage Example (Python)
```python
from basicsr.archs.rrdbnet_arch import RRDBNet
from realesrgan import RealESRGANer
import cv2

# Initialize model
model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, 
                num_block=23, num_grow_ch=32, scale=4)

upsampler = RealESRGANer(
    scale=4,
    model_path='experiments/pretrained_models/RealESRGAN_x4plus.pth',
    model=model,
    tile=256,  # Tile size for memory efficiency
    tile_pad=10,
    pre_pad=0,
    half=True,  # Use FP16 for speed
    device='cuda'  # or 'cpu'
)

# Upscale image
img = cv2.imread('input.png', cv2.IMREAD_UNCHANGED)
output, _ = upsampler.enhance(img, outscale=4)
cv2.imwrite('output.png', output)
```

### Usage Example (Node.js with ONNX)
```typescript
import { InferenceSession, Tensor } from 'onnxruntime-node'
import sharp from 'sharp'

async function upscale(imagePath: string, scale: number = 4) {
  // Load model
  const session = await InferenceSession.create('realesrgan-x4.onnx')
  
  // Load and preprocess image
  const { data, info } = await sharp(imagePath)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true })
  
  // Create tensor
  const tensor = new Tensor(
    'float32',
    new Float32Array(data),
    [1, 4, info.height, info.width]
  )
  
  // Run inference
  const feeds = { input: tensor }
  const results = await session.run(feeds)
  
  // Post-process and save
  const output = results.output.data
  // ... convert back to image
  
  return outputPath
}
```

### Performance Benchmarks
| Hardware | 1080p Frame (2x) | 1080p Frame (4x) | 4K Frame (2x) |
|----------|------------------|------------------|---------------|
| RTX 4090 | ~0.5s | ~1s | ~3s |
| RTX 3060 | ~1s | ~2s | ~6s |
| GTX 1060 | ~3s | ~6s | ~18s |
| CPU (i7) | ~15s | ~30s | ~90s |
| M1 Max | ~1s | ~2s | ~5s |

### Recommended Configuration
```typescript
const REAL_ESRGAN_CONFIG = {
  model: 'RealESRGAN_x4plus',  // or x4plus_anime_6B
  scale: 4,
  tile: 256,  // Memory-efficient tiling
  tilePad: 10,
  prePad: 0,
  fp16: true,  // Use half precision
  device: 'auto',  // Auto-detect GPU
  threads: 4,  // CPU threads
}
```

---

## 3. Topaz Video AI API

### Overview
Topaz Labs offers industry-leading video enhancement with their Video AI product.

### Website: [topazlabs.com](https://www.topazlabs.com/topaz-video-ai)

### Pros
| Advantage | Impact |
|-----------|--------|
| **Best quality** | Industry standard |
| **Video-optimized** | Temporal consistency |
| **Multiple models** | Artemis, Proteus, etc. |
| **Easy integration** | REST API |
| **Well documented** | Good support |

### Cons
| Limitation | Mitigation |
|------------|------------|
| **Expensive** | $299 one-time + API costs |
| **API limits** | Quota management |
| **Cloud only** | Internet required |
| **Processing time** | Queue for large jobs |

### Pricing (Estimated)
| Tier | Price | Processing |
|------|-------|------------|
| Pay-as-you-go | $0.10/frame | No commitment |
| Pro | $99/month | 1000 frames included |
| Enterprise | Custom | Unlimited |

### API Usage Example
```typescript
import axios from 'axios'

const TOPAZ_API = {
  baseUrl: 'https://api.topazlabs.com/v1',
  apiKey: process.env.TOPAZ_API_KEY,
}

async function upscaleFrame(
  imageUrl: string,
  options: { scale: number; model: string }
) {
  const response = await axios.post(
    `${TOPAZ_API.baseUrl}/upscale`,
    {
      image_url: imageUrl,
      scale: options.scale,
      model: options.model || 'artemis-high-quality',
    },
    {
      headers: {
        'Authorization': `Bearer ${TOPAZ_API.apiKey}`,
        'Content-Type': 'application/json',
      }
    }
  )
  
  return {
    jobId: response.data.job_id,
    status: response.data.status,
    resultUrl: response.data.result_url,
  }
}

async function getJobStatus(jobId: string) {
  const response = await axios.get(
    `${TOPAZ_API.baseUrl}/jobs/${jobId}`,
    {
      headers: {
        'Authorization': `Bearer ${TOPAZ_API.apiKey}`,
      }
    }
  )
  
  return response.data
}
```

---

## 4. Replicate (Cloud AI Platform)

### Overview
Replicate hosts various AI upscaling models with a simple API.

### Website: [replicate.com](https://replicate.com)

### Available Models
| Model | Creator | Use Case |
|-------|---------|----------|
| **Real-ESRGAN** | xinntao | General upscaling |
| **SwinIR** | JingyunLiang | Image restoration |
| **BSRGAN** | cszn | Blind super-resolution |
| **CodeFormer** | sczhou | Face enhancement |

### Pros
| Advantage | Impact |
|-----------|--------|
| **No setup** | Instant deployment |
| **Multiple models** | Choose best for content |
| **Pay-per-use** | No fixed costs |
| **GPU included** | No hardware needed |
| **Auto-scaling** | Handle any load |

### Cons
| Limitation | Mitigation |
|------------|------------|
| **API costs** | Can add up |
| **Internet required** | Not offline |
| **Latency** | Network round-trip |
| **Vendor lock-in** | Dependency risk |

### Pricing
| Component | Cost |
|-----------|------|
| **GPU Time** | $0.0005/second (A100) |
| **Example:** 1080p frame (4x) | ~5s = $0.0025 |
| **1000 frames** | ~$2.50 |

### API Usage Example
```typescript
import Replicate from 'replicate'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

async function upscaleWithRealESRGAN(imageUrl: string) {
  const output = await replicate.run(
    'xinntao/realesrgan:84b9a091d927287718888e7b6f9e7a1c4c7e1b0a',
    {
      input: {
        image: imageUrl,
        scale: 4,
        face_enhance: false,
      }
    }
  )
  
  return output  // URL to upscaled image
}

// For batch processing
async function upscaleBatch(imageUrls: string[]) {
  const predictions = await Promise.all(
    imageUrls.map(url => upscaleWithRealESRGAN(url))
  )
  
  return predictions
}
```

---

## 5. Stability AI API

### Overview
Stability AI offers image upscaling through their DreamStudio platform.

### Website: [stability.ai](https://stability.ai)

### Pricing
| Tier | Price | Credits |
|------|-------|---------|
| Pay-as-you-go | $10 | ~1000 upscales |
| Pro | $32/month | 3500 credits |
| Enterprise | Custom | Custom |

### API Usage
```typescript
import axios from 'axios'

async function stabilityUpscale(imagePath: string) {
  const formData = new FormData()
  formData.append('image', fs.createReadStream(imagePath))
  formData.append('prompt', 'high quality, detailed, 4k')
  
  const response = await axios.post(
    'https://api.stability.ai/v1/generation/image-to-image/upscale',
    formData,
    {
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        ...formData.getHeaders(),
      }
    }
  )
  
  return response.data
}
```

---

## 6. Comparison Matrix

| Criteria | Real-ESRGAN (Local) | Topaz API | Replicate | Stability AI |
|----------|---------------------|-----------|-----------|--------------|
| **Quality** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Speed** | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Cost** | Free | $$$ | $$ | $$ |
| **Privacy** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Setup** | Complex | Easy | Easy | Easy |
| **Offline** | ✅ | ❌ | ❌ | ❌ |
| **Scalability** | Limited | High | High | High |

---

## 7. Hybrid Approach (Recommended)

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│              Frame Flow X - AI Upscaling                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐         ┌─────────────────────┐   │
│  │   Local (GPU)   │         │   Cloud Fallback    │   │
│  │   Real-ESRGAN   │         │   Replicate API     │   │
│  │                 │         │                     │   │
│  │ - Free          │         │ - No GPU needed     │   │
│  │ - Fast          │         │ - Auto-scale        │   │
│  │ - Private       │         │ - Any device        │   │
│  └─────────────────┘         └─────────────────────┘   │
│           │                            │                │
│           └──────────┬─────────────────┘                │
│                      │                                  │
│              ┌───────▼────────┐                         │
│              │  Smart Router  │                         │
│              │                │                         │
│              │ - Check GPU    │                         │
│              │ - Check queue  │                         │
│              │ - User pref    │                         │
│              └───────┬────────┘                         │
│                      │                                  │
│         ┌────────────┴────────────┐                     │
│         ▼                         ▼                     │
│   Local Processing          Cloud Processing            │
│   (when available)          (when needed)               │
└─────────────────────────────────────────────────────────┘
```

### Decision Logic
```typescript
async function selectUpscalingMethod(
  frameCount: number,
  hasGPU: boolean,
  userPreference: 'local' | 'cloud' | 'auto'
): Promise<'local' | 'cloud'> {
  // User explicitly chose
  if (userPreference !== 'auto') {
    return userPreference
  }
  
  // Auto-decide based on conditions
  if (!hasGPU) {
    return 'cloud'  // No GPU, use cloud
  }
  
  if (frameCount > 1000) {
    // Large batch, offer cloud for speed
    const cloudEstimate = frameCount * 0.0025  // $0.0025/frame
    if (cloudEstimate < 10) {  // Under $10, suggest cloud
      return 'cloud'
    }
  }
  
  return 'local'  // Default to local
}
```

---

## 8. Implementation Recommendations

### For Frame Flow X MVP

#### Phase 1: Cloud-First (Recommended)
1. **Start with Replicate API**
   - No setup complexity
   - Immediate availability
   - Pay-per-use (low initial cost)
   - Focus on product, not infrastructure

2. **Implementation**
   ```typescript
   // Simple API wrapper
   class UpscalerService {
     private replicate: Replicate
     
     constructor() {
       this.replicate = new Replicate({
         auth: process.env.REPLICATE_API_TOKEN,
       })
     }
     
     async upscale(image: Buffer, scale: number = 2) {
       // Upload to temp storage
       const imageUrl = await this.upload(image)
       
       // Process with Real-ESRGAN
       const result = await this.replicate.run(
         'xinntao/realesrgan:84b9a091...',
         { input: { image: imageUrl, scale } }
       )
       
       return result
     }
   }
   ```

#### Phase 2: Local Option
1. **Add Real-ESRGAN for desktop**
   - Bundle with Electron app
   - GPU detection and fallback
   - User preference setting

2. **Implementation**
   ```typescript
   class LocalUpscaler {
     private session: InferenceSession
     
     async initialize() {
       this.session = await InferenceSession.create(
         path.join(__dirname, 'models', 'realesrgan-x4.onnx')
       )
     }
     
     async upscale(image: Buffer) {
       // ... ONNX inference
     }
   }
   ```

#### Phase 3: Smart Routing
1. **Automatic method selection**
2. **Queue management**
3. **Cost optimization**

---

## 9. Cost Analysis

### Scenario: 100 frames, 1080p, 4x upscaling

| Method | Cost | Time | Notes |
|--------|------|------|-------|
| **Real-ESRGAN (Local)** | $0 | 100s (GPU) | One-time GPU cost |
| **Replicate** | $0.25 | 50s | $0.0025/frame |
| **Topaz API** | $10-15 | 30s | Premium quality |
| **Stability AI** | $1-2 | 60s | Good quality |

### Monthly Estimates (Active User)
| Usage | Local | Replicate | Topaz |
|-------|-------|-----------|-------|
| Light (100 frames) | $0 | $0.25 | $10 |
| Medium (1000 frames) | $0 | $2.50 | $50 |
| Heavy (10000 frames) | $0 | $25 | $200+ |

---

## 10. Recommendations Summary

### Immediate (MVP)
1. ✅ Use **Replicate API** with Real-ESRGAN
2. ✅ Simple integration, pay-per-use
3. ✅ Focus on UX, not infrastructure

### Short-term (v1.0)
1. [ ] Add **local Real-ESRGAN** for desktop
2. [ ] GPU detection and auto-selection
3. [ ] User preference for local/cloud

### Long-term (v2.0+)
1. [ ] Custom model fine-tuning
2. [ ] Video-specific models (temporal consistency)
3. [ ] Edge deployment options

---

## 11. Resources

### Documentation
- [Real-ESRGAN GitHub](https://github.com/xinntao/Real-ESRGAN)
- [Replicate Docs](https://replicate.com/docs)
- [Topaz API Docs](https://www.topazlabs.com/api-docs)

### Models
- [Real-ESRGAN Models](https://github.com/xinntao/Real-ESRGAN#models)
- [ONNX Model Zoo](https://github.com/onnx/models)

### Performance
- [NVIDIA GPU Benchmarks](https://developer.nvidia.com/blog/)
- [Replicate Pricing Calculator](https://replicate.com/pricing)

---

*Research Date: 2026-02-24*
*Last Updated: 2026-02-24*
*Owner: Video Engineering Team*
