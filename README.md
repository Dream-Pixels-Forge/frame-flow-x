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
🚀 **Phase 2: Core Features** - In Progress (90% Sprint 2.1 complete)

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
- [x] Git branching strategy (master, devs, features)
- [x] **Sprint 2.1: Video Import & Frame Extraction** (90% complete)
  - Video file picker with drag-and-drop
  - FFmpeg.wasm frame extraction
  - Progress tracking with ETA
  - Pause/resume/cancel functionality
  - Format selection (PNG, JPEG, WebP)
  - Frame range selection
  - Error handling and validation

### Next Up: Complete Sprint 2.1

- [ ] Batch video queue processing
- [ ] Unit tests (>90% coverage)
- [ ] E2E test for extraction workflow

Then: Sprint 2.2 - Frame Gallery & Preview

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
| `pnpm dev` | Start development server at <http://localhost:5173> |
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

Contributions are welcome! Please read our [contributing guidelines](.github/CONTRIBUTING.md) before submitting PRs.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

This project was built with the assistance of AI-powered development tools and open-source libraries:

### AI Development Tools

- **[QwenLM](https://github.com/QwenLM/Qwen)** - Advanced AI language model by Alibaba Cloud
- **[Qwen-Coder CLI](https://github.com/QwenLM/qwen-coder)** - AI-powered coding assistant
- **[web-dev-strategy Extension](https://github.com/QwenLM/qwen-coder/tree/main/extensions/web-dev-strategy)** - Multi-agent development system for orchestrating AI agents in web development workflows
  - Used for project initialization, planning, and task organization
  - Coordinated specialized agents for market analysis, PRD creation, and implementation planning

### Core Technologies

- **[React](https://react.dev/)** - The library for web and native user interfaces
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript with syntax for types
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[HeroUI](https://www.heroui.com/)** - Beautiful, fast, modern React UI library
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Bear necessities for state management
- **[Electron](https://www.electronjs.org/)** - Build cross-platform desktop apps with JavaScript, HTML, and CSS
- **[Framer Motion](https://www.framer.com/motion/)** - A production-ready motion library for React
- **[React Router](https://reactrouter.com/)** - Declarative routing for React

### Development & Testing

- **[Vitest](https://vitest.dev/)** - Blazing fast unit test framework
- **[Playwright](https://playwright.dev/)** - Reliable end-to-end testing for modern web apps
- **[ESLint](https://eslint.org/)** - Find and fix problems in your JavaScript code
- **[Prettier](https://prettier.io/)** - An opinionated code formatter
- **[Husky](https://typicode.github.io/husky/)** - Git hooks made easy

### Build & Distribution

- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager
- **[electron-builder](https://www.electron.build/)** - A complete solution to package and build Electron apps

### Research & Inspiration

- **[FFmpeg](https://ffmpeg.org/)** - A complete, cross-platform solution for video processing
- **[Real-ESRGAN](https://github.com/xinntao/Real-ESRGAN)** - AI-based image/video super-resolution
- **[Replicate](https://replicate.com/)** - Run machine learning models in the cloud

---

**Frame Flow X** - Transform your videos into cinematic frame sequences.

Made with ❤️ using AI-assisted development
