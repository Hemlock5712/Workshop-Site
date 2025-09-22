# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Server Rules

**NEVER run development servers automatically** - The user will start/stop servers manually. Do not use commands like:

- `npm run dev`
- `npm start`
- `bun dev`
- Any server-starting commands

The user will handle server management themselves.

## Project Overview

Gray Matter Workshop is an FRC Programming Workshop website built with Next.js 15, focusing on teaching best programming practices, hardware setup, command-based programming, and PID tuning. The site transforms Canva presentation content into an interactive web learning platform.

**Live Site:** [ctre-workshop-site.vercel.app](https://ctre-workshop-site.vercel.app)  
**Repository:** [https://github.com/Hemlock5712/Workshop-Site](https://github.com/Hemlock5712/Workshop-Site)  
**Workshop Code:** [https://github.com/Hemlock5712/Workshop-Code](https://github.com/Hemlock5712/Workshop-Code)

## Development Commands

Requires Node.js 20+ (Bun v1+ supported).

### Essential Commands

- **Development server**: `npm run dev` (with Turbopack for faster builds) - **USER RUNS MANUALLY**
- **Production build**: `npm run build`
- **Production server**: `npm start` - **USER RUNS MANUALLY**
- **Linting**: `npm run lint` (ESLint with Next.js config)
- **Type checking**: `npm run type-check` (TypeScript compiler check)
- **Full test suite**: `npm test` (runs lint + type-check + build)

Bun users can run the same scripts with `bun dev`, `bun test`, etc.

### Development Workflow

1. **User runs** `npm run dev` for development with hot reload
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
- **Search**: Fuse.js for fuzzy search functionality

### Key Components Architecture

#### Layout & Navigation

- **`src/app/layout.tsx`**: Root layout with theme setup, font configuration, sidebar integration, and search bar
- **`src/components/Sidebar.tsx`**: Collapsible navigation with workshop organization, tooltips, and responsive design
- **`src/components/PageTemplate.tsx`**: Consistent page wrapper with prev/next navigation and prose styling
- **`src/components/SearchBar.tsx`**: Fuzzy search component with Fuse.js integration

#### Search System

- **`src/data/searchData.ts`**: Comprehensive search index of all workshop content
- **Search Features**: Fuzzy search, keyboard navigation, category filtering, match highlighting
- **Integration**: Search bar positioned in top right corner of header

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
    ├── /running-program (Run code with hardware sim)
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
- Search system provides fuzzy search across all workshop content

## Visual Development

### Design Principles

- Comprehensive design checklist in `/context/design-principles.md`
- Brand style guide in `/context/style-guide.md`
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check

IMMEDIATELY after implementing any front-end change:

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md` and `/context/style-guide.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review

Invoke the `@agent-design-review` subagent for thorough design validation when:

- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing
