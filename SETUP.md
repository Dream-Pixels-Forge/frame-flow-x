# Frame Flow X - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** 8+ ([Install Guide](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/))

## Installing pnpm

If you don't have pnpm installed globally, you can install it using one of these methods:

### Method 1: Using npm
```bash
npm install -g pnpm
```

### Method 2: Using Corepack (Node.js 16.13+)
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

### Method 3: Using PowerShell (Windows)
```powershell
iwr https://get.pnpm.io/install.ps1 -useb | iex
```

### Method 4: Using Homebrew (macOS)
```bash
brew install pnpm
```

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/frame-flow-x.git
cd frame-flow-x
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all project dependencies using pnpm's efficient disk space management.

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# - Add API keys for AI upscaling services
# - Configure storage paths
# - Set feature flags
```

### 4. Start Development Server

```bash
# Start the web app in development mode
pnpm dev

# The app will be available at http://localhost:5173
```

### 5. Build Desktop App (Optional)

```bash
# Build for your current platform
pnpm build:desktop

# Or build for specific platforms
pnpm build:desktop:windows
pnpm build:desktop:macos
pnpm build:desktop:linux
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production (web) |
| `pnpm build:desktop` | Build desktop application |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix linting issues |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run tests |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm typecheck` | Run TypeScript type checking |

## Project Structure

```
frame-flow-x/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state stores
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript types
│   ├── assets/             # Images, fonts, etc.
│   └── styles/             # Global styles
├── public/                 # Static assets
├── roadmap/                # Project documentation
├── templates/              # Component templates
├── tests/                  # Test files
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── eslint.config.js        # ESLint configuration
├── prettier.config.js      # Prettier configuration
└── README.md               # Project overview
```

## HeroUI Components

This project uses [HeroUI v2](https://www.heroui.com/) (formerly NextUI) for the UI component library.

### Key Components Used

- **Buttons** - Multiple variants (solid, bordered, flat, faded, shadow)
- **Inputs** - Text inputs, textareas with validation
- **Modals/Dialogs** - For previews and settings
- **Cards** - Content containers
- **Dropdowns** - Menus and selectors
- **Toasts** - Notifications via Sonner
- **Progress** - Loading indicators
- **Sliders** - Range inputs for adjustments
- **Avatars, Badges** - Status indicators

### HeroUI Theme Configuration

HeroUI is configured with custom brand colors in the theme provider. See `src/components/providers/ThemeProvider.tsx` for details.

## Troubleshooting

### pnpm Issues

**Problem:** `pnpm: command not found`
- **Solution:** Install pnpm globally using one of the methods above

**Problem:** Dependencies not installing
- **Solution:** Clear pnpm cache and retry
  ```bash
  pnpm store prune
  rm -rf node_modules pnpm-lock.yaml
  pnpm install
  ```

### Development Server Issues

**Problem:** Port 5173 already in use
- **Solution:** Use a different port
  ```bash
  pnpm dev -- --port 3000
  ```

**Problem:** Vite build errors
- **Solution:** Clear Vite cache
  ```bash
  rm -rf node_modules/.vite
  pnpm dev
  ```

### Desktop Build Issues

**Problem:** Electron build fails
- **Solution:** Ensure you have the required build tools
  - **Windows:** Visual Studio Build Tools
  - **macOS:** Xcode Command Line Tools
  - **Linux:** build-essential, python3

## Next Steps

After setup, check out the project documentation:

- [Market Analysis](./roadmap/market-analysis.md) - Understand the market opportunity
- [PRD](./roadmap/PRD.md) - Product requirements and specifications
- [Implementation Plan](./roadmap/plan.md) - Technical architecture and timeline
- [Task Registry](./roadmap/tasks.md) - Detailed task breakdown

## Getting Help

- **Documentation:** Check the [HeroUI docs](https://www.heroui.com/docs)
- **Issues:** Report bugs on GitHub
- **Discussions:** Join our community discussions

---

**Happy Coding!** 🚀
