# Frame Flow X

> Video-to-Frame Processing Application with AI-Powered Upscaling and Cinematic Enhancement

## Overview

Frame Flow X is a web and desktop application that helps users split videos into sequences of frames, upscale them, apply AI-powered enhancements, and transform them with predefined cinematic style presets.

## Core Features

- **Video Frame Extraction**: Split videos into high-quality frame sequences
- **AI Upscaling**: Enhance resolution using advanced AI models
- **Frame Enhancement**: Apply intelligent improvements to video frames
- **Cinematic Presets**: Apply predefined cinematic style transformations
- **Cross-Platform**: Available as both web and desktop application

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **UI Library** | HeroUI (formerly NextUI) v2 |
| **State Management** | Zustand |
| **Desktop** | Electron |
| **Video Processing** | FFmpeg (wasm + Node.js) |
| **AI Upscaling** | Real-ESRGAN / Cloud APIs |
| **Testing** | Vitest + Playwright |
| **Package Manager** | pnpm |

## Project Status

✅ **Phase 1: Foundation** - Complete (2026-02-24)
📋 **Phase 2: Core Features** - Starting Next

### Completed
- [x] Project initialization (README, .gitignore, .env.example)
- [x] Roadmap documentation structure
- [x] Market analysis completed
- [x] Product Requirements Document (PRD)
- [x] Implementation plan with 5 phases
- [x] Task registry with 250+ detailed tasks
- [x] Architecture setup (HeroUI, Zustand, React Router)
- [x] Base component library (13+ HeroUI components)
- [x] Testing infrastructure (Vitest + Playwright)
- [x] Research & Planning complete
  - FFmpeg integration strategy
  - AI upscaling evaluation
  - Video format compatibility
  - Performance benchmarks

### Next Up: Phase 2 - Core Features (Weeks 3-6)
- Video import with drag-and-drop
- FFmpeg frame extraction engine
- Frame gallery with preview
- Export functionality

## Quick Links

| Document | Description |
|----------|-------------|
| [**Setup Guide**](./SETUP.md) | Installation and development setup |
| [Market Analysis](./roadmap/market-analysis.md) | Market research, competitive analysis, target audience |
| [PRD](./roadmap/PRD.md) | Product requirements and specifications |
| [Implementation Plan](./roadmap/plan.md) | Technical architecture and phased rollout |
| [Task Registry](./roadmap/tasks.md) | Detailed task breakdown with owners |

## Roadmap

```
Week 1-2:   ████████████████████░░░░░░░░░░░░░░░░░░░░  Foundation (In Progress)
Week 3-6:   ████████████████████████████████████████░░  Core Features
Week 7-10:  ████████████████████████████████████████████  AI Integration
Week 11-13: ████████████████████████████████░░░░░░░░░░░░  Desktop App
Week 14-16: ████████████████████████████████████████████  Polish & Launch
```

### Key Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Project Initialization | 2026-02-24 | ✅ Complete |
| Market Analysis | 2026-02-24 | ✅ Complete |
| PRD Complete | 2026-02-24 | ✅ Complete |
| Technical Setup | 2026-03-07 | 📅 Planned |
| MVP Feature Complete | 2026-04-04 | 📅 Planned |
| AI Integration Complete | 2026-05-02 | 📅 Planned |
| Desktop Beta | 2026-05-23 | 📅 Planned |
| Public Launch | 2026-06-13 | 📅 Planned |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation (Ready to Use)

```bash
# Clone the repository
git clone https://github.com/your-org/frame-flow-x.git
cd frame-flow-x

# Install dependencies (using pnpm)
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Build desktop app (coming soon)
pnpm build:desktop
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server at http://localhost:5173 |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run tests with Vitest |
| `pnpm test:e2e` | Run E2E tests with Playwright |
| `pnpm typecheck` | Run TypeScript type checking |

## Project Structure

```
frame-flow-x/
├── roadmap/              # Project documentation
│   ├── market-analysis.md
│   ├── PRD.md
│   ├── plan.md
│   └── tasks.md
├── templates/            # Component and code templates
├── src/                  # Source code (TBD)
├── .gitignore
├── .env.example
├── package.json
└── README.md
```

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT

---

**Frame Flow X** - Transform your videos into cinematic frame sequences.
