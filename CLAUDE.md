# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Gray Matter Workshop is an FRC Programming Workshop website built with Next.js 15, focusing on teaching best programming practices, hardware setup, command-based programming, and PID tuning. The site transforms Canva presentation content into an interactive web learning platform.

**Live Site:** [ctre-workshop-site.vercel.app](https://ctre-workshop-site.vercel.app)  
**Repository:** [https://github.com/Hemlock5712/Workshop-Site](https://github.com/Hemlock5712/Workshop-Site)  
**Workshop Code:** [https://github.com/Hemlock5712/Workshop-Code](https://github.com/Hemlock5712/Workshop-Code)

## Development Commands

Requires Node.js 20+ (Bun v1+ supported).

### Essential Commands
- **Development server**: `npm run dev` (with Turbopack for faster builds)
- **Production build**: `npm run build`
- **Production server**: `npm start`
- **Linting**: `npm run lint` (ESLint with Next.js config)
- **Type checking**: `npm run type-check` (TypeScript compiler check)
- **Full test suite**: `npm test` (runs lint + type-check + build)

Bun users can run the same scripts with `bun dev`, `bun test`, etc.

### Development Workflow
1. Run `npm run dev` for development with hot reload
2. Before committing, run `npm test` to ensure code quality
3. Use `npm run type-check` for TypeScript validation
4. Use `npm run lint` for code style consistency

## Code Architecture

### Application Structure
- **Framework**: Next.js 15.4.6 with App Router (`src/app/` directory)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS 4 with dark mode support
- **State Management**: Zustand for theme state
- **Type Safety**: TypeScript with strict configuration
- **Icons**: Lucide React icons
- **Syntax Highlighting**: React Syntax Highlighter

### Key Components Architecture

#### Layout & Navigation
- **`src/app/layout.tsx`**: Root layout with theme setup, font configuration, and sidebar integration
- **`src/components/Sidebar.tsx`**: Collapsible navigation with workshop organization, tooltips, and responsive design
- **`src/components/PageTemplate.tsx`**: Consistent page wrapper with prev/next navigation and prose styling

#### Theme System
- **`src/components/ThemePicker.tsx`**: Theme toggle component with Zustand state management
- **Implementation**: Uses `data-theme` attribute and localStorage persistence
- **Modes**: light, dark, system (follows OS preference)
- **Integration**: Tailwind CSS `dark:` classes throughout the app

#### Content Components
- **`src/components/CodeBlock.tsx`**: Syntax-highlighted code display
- **`src/components/GitHubPR.tsx`**: Live GitHub pull request embedding
- **`src/components/GitHubPage.tsx`**: Live GitHub file display
- **`src/components/GithubPageWithPR.tsx`**: Tabbed component combining GitHub file view and PR diff view
- **`src/components/ImageBlock.tsx`**: Optimized image display with Next.js Image

### Route Organization
```
Workshop Content:
├── / (Homepage with team, mechanisms, overview)
├── /introduction (Workshop introduction)
├── /prerequisites (Required software & hardware)
└── Workshop #1 (Collapsible section):
    ├── /hardware (CTRE hardware setup)
    ├── /project-setup (WPILib project creation)
    ├── /command-framework (Triggers, subsystems, commands)
    ├── /control-systems (PID & Feedforward theory)
```

### Asset Management
- **Images**: Stored in `public/images/` with organized subdirectories
- **Optimization**: All images use Next.js Image component
- **Structure**: `presenters/`, `mechanisms/`, `hardware/` folders

### Development Patterns
- **File Naming**: kebab-case for routes, PascalCase for components
- **Import Alias**: `@/*` maps to `src/*`
- **Component Structure**: Functional components with TypeScript interfaces
- **Styling**: Tailwind utility classes with dark mode variants
- **Navigation**: Client-side routing with active state management
- **Video Integration**: YouTube embeds for educational content
- **Code Learning**: Tabbed interfaces combining final code with development process
- **GitHub Integration**: Live embedding of Workshop-Code repository with PR progression
- **Progressive Learning**: 5-step implementation approach following real development workflow

### Important Implementation Notes
- Theme system uses document-level attribute manipulation
- Sidebar state management handles responsive behavior and tooltips
- All workshop pages should use PageTemplate for consistency
- Navigation items are defined as static arrays in Sidebar component
- Build process includes comprehensive testing (lint + type-check + build)

## Recent Development History

### Workshop-Code Integration & Implementation Steps (Latest)
- **Repository Integration**: Connected site to Workshop-Code repository for live code examples
- **5-Step Learning Progression**: Implemented structured approach following development workflow:
  1. **Basic Subsystem**: Motor control and sensor integration
  2. **Commands Integration**: Command-based architecture and user input
  3. **PID Control**: Precise position control with feedback loops
  4. **Motion Magic**: Smooth profiled movements with acceleration control
  5. **Useful Functions**: Safety features, utilities, and diagnostics
- **Educational Enhancement**: Added detailed explanations, visual learning aids, and practical implementation details
- **Real-World Context**: Each step explains both technical implementation and competition relevance

### Video Tutorial Integration (feat/video-tutorials)
- **YouTube Embeddings**: Added educational videos throughout workshop pages
  - Hardware setup videos for CTRE device configuration
  - Programming implementation tutorials for Arm and Flywheel mechanisms
  - Project setup walkthrough videos
  - Tuning demonstration videos
- **Enhanced GitHub Components**: Created `GithubPageWithPR.tsx` with tabbed interface
  - "Final Implementation" tab showing complete code
  - "GitHub Changes" tab showing PR diffs
  - Improved code learning experience with before/after views
- **Content Restructuring**: Updated workshop pages with multimedia learning approach
- **CI/CD Improvements**: Enhanced GitHub Actions workflow

### Theme System Implementation (2025-08-19)
- **Homepage Enhancement**: Added presenter photos and mechanisms showcase
- **Dark Mode System**: Implemented with Zustand state management and Tailwind CSS
- **Navigation**: Collapsible sidebar with workshop organization and theme toggle
- **Component Architecture**: Modular design with PageTemplate for consistency