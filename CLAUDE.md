# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TomatoClock (番茄时钟) is a Pomodoro Timer productivity application with two implementations:

1. **Web App** (`src/`) - React + TypeScript + Vite (primary focus)
2. **Python Desktop App** (`tomatoclock.py`, `new_tomatoclock/`) - Tkinter-based desktop application

The app supports English and Chinese (中文) languages.

## Commands

### Web Application

```bash
npm run dev      # Start development server (localhost:5173)
npm run build    # Production build to dist/
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Python Application

```bash
python tomatoclock.py              # Run legacy desktop app
python new_tomatoclock/main.py     # Run refactored v2.0
pip install -r new_tomatoclock/requirements.txt  # Install Python deps
pyinstaller tomatoclock.spec       # Build Windows executable
```

## Architecture

### Web App Structure

- **Entry**: `src/main.tsx` → `src/App.tsx`
- **Components**: `src/components/` - UI components (Timer, AudioControls, Background, ThemeSwitch, etc.)
- **Contexts**: `src/contexts/` - React Context for global state
  - `LanguageContext.tsx` - i18n provider with `useLanguage()` hook
  - `ThemeContext.tsx` - Theme provider with `useTheme()` hook
- **Utils**: `src/utils/` - Utility modules
  - `audio.ts` - `AudioManager` singleton class for centralized audio control
  - `i18n.ts` - Translation objects for EN/ZH
  - `time.ts` - Time formatting utilities

### Key Patterns

- **AudioManager singleton**: Centralized audio playback management in `src/utils/audio.ts`
- **Context-based state**: Language and theme managed via React Context with custom hooks
- **localStorage persistence**: Audio selections and settings stored in browser localStorage
- **Remote audio**: Audio files hosted at `bookzhou.com`, not local files

### Python App Structure

The `new_tomatoclock/` directory follows an MVC-like pattern:
- `core/timer.py` - Timer logic with threading
- `views/` - Tkinter UI components
- `models/` - Data models (user, achievements)
- `utils/` - Database, audio, logging utilities
- `config/settings.ini` - Application settings

## Styling

- Tailwind CSS with custom configuration in `tailwind.config.js`
- Icons from `lucide-react` package
- Background images from Unsplash (linked, not downloaded)

## Configuration

- `.env` - Contains Supabase credentials (backend service)
- `vite.config.ts` - Vite configuration with lucide-react optimization excluded
- `new_tomatoclock/config/settings.ini` - Python app settings (work/break durations, themes)
