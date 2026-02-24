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

✅ **Phase 1: Foundation** - Initialization Complete (2026-02-24)

### Completed
- [x] Project initialization (README, .gitignore, .env.example)
- [x] Roadmap documentation structure
- [x] Market analysis completed
- [x] Product Requirements Document (PRD)
- [x] Implementation plan with 5 phases
- [x] Task registry with 250+ detailed tasks

### Next Up: Sprint 1.1 - Project Setup (Days 1-5)
- Initialize Node.js/TypeScript project with Vite
- Configure ESLint, Prettier, Husky
- Set up Git repository and branching strategy
- Install and configure HeroUI v2
- Set up pnpm as package manager

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

### Installation (Coming Soon)

```bash
# Clone the repository
git clone https://github.com/your-org/frame-flow-x.git

# Install dependencies
npm install

# Start development server
npm run dev

# Build desktop app
npm run build:desktop
```

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
