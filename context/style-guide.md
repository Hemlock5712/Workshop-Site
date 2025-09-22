# Style Guide

This document outlines the visual design patterns, color schemes, and styling conventions used throughout the Gray Matter Workshop website.

## Color System

### Educational Brand Colors

Based on the primary educational blue `#0D233F` (Deep Academic Blue):

```css
--color-primary-50: #f2f6fa --color-primary-100: #e3ecf4
  --color-primary-200: #c1d4e7 --color-primary-300: #9fbcd9
  --color-primary-400: #7da4cb --color-primary-500: #5b8cbe
  --color-primary-600: #4a73a0 --color-primary-700: #385a80
  --color-primary-800: #264060 --color-primary-900: #0d233f
  /* Primary brand color */ --color-primary-950: #081829;
```

### Educational Neutral Colors

Professional but approachable gray scale:

```css
--color-slate-50: #fafbfc --color-slate-100: #f5f7fa --color-slate-200: #ebeef3
  --color-slate-300: #dde2e8 --color-slate-400: #a5b3c1
  --color-slate-500: #6b7d8f --color-slate-600: #4a5765
  --color-slate-700: #343d49 --color-slate-800: #1e242b
  --color-slate-900: #151a1f;
```

### Learning Theme Colors

Semantic colors for educational content - these are defined in globals.css and used via Tailwind classes:

#### Success/Learn - Soft Mint Green

Used for success states, completion indicators, and positive educational content.

#### Focus/Important - Warm Amber

Used for main content blocks, important sections, and attention-grabbing elements.

#### Key Concepts - Gentle Purple

Used for concept explanations and key learning points.

#### Practice - Fresh Teal

Used minimally for hands-on practice elements.

## Theme System

### CSS Custom Properties

The website uses CSS custom properties for consistent theming:

```css
:root {
  color-scheme: light;
  --background: var(--color-slate-50);
  --foreground: var(--color-slate-900);
  --muted: var(--color-slate-100);
  --muted-foreground: var(--color-slate-600);
  --card: #ffffff;
  --card-foreground: var(--color-slate-900);
  --border: var(--color-slate-200);
  --primary: var(--color-primary-700);
  --primary-foreground: #ffffff;
}

[data-theme="dark"] {
  color-scheme: dark;
  --background: var(--color-slate-900);
  --foreground: var(--color-slate-50);
  --muted: var(--color-slate-800);
  --muted-foreground: var(--color-slate-300);
  --card: var(--color-slate-800);
  --card-foreground: var(--color-slate-50);
  --border: var(--color-slate-700);
  --primary: var(--color-primary-300);
  --primary-foreground: var(--color-slate-900);
}
```

### Theme Implementation

- Themes are managed via `data-theme` attribute on the `<html>` element
- Zustand store manages theme state with localStorage persistence
- Tailwind CSS custom variant: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));`

## Typography

### Font System

```css
--font-sans: var(--font-geist-sans) /* Geist Sans from Google Fonts */
  --font-mono: var(--font-geist-mono) /* Geist Mono from Google Fonts */;
```

### Typography Scale

- **Page Titles**: `text-4xl font-bold` (Tailwind classes)
- **Section Headers**: `text-2xl font-semibold`
- **Body Text**: Default `text-base`
- **Small Text**: `text-sm`
- **Code**: Uses `--font-mono` family

## Component Design Patterns

### Navigation Active States

```css
/* Active navigation item */
.nav-active {
  background-color: var(--color-primary-200);
  color: var(--color-primary-800);
}

/* Dark theme active navigation */
.dark .nav-active {
  background-color: var(--color-primary-800/40);
  color: var(--color-primary-200);
}
```

### Card Components

```css
.card {
  background-color: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  box-shadow:
    0 1px 3px 0 rgb(0 0 0 / 0.1),
    0 1px 2px 0 rgb(0 0 0 / 0.06);
}
```

### Educational Content Blocks

Predefined styles for before/after learning comparisons:

```css
.before-block {
  @apply bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300;
}

.before-title {
  @apply font-bold text-red-700 dark:text-red-300 mb-2;
}

.after-block {
  @apply bg-learn-50 dark:bg-learn-900/20 p-4 rounded-lg border border-learn-200 dark:border-learn-900 text-learn-800 dark:text-learn-300;
}

.after-title {
  @apply font-bold text-learn-700 dark:text-learn-300 mb-2;
}
```

## Spacing & Layout

### Container Widths

- **Main Content**: `max-w-4xl mx-auto`
- **Page Content**: `px-4 py-12`
- **Sidebar**: `w-64` (expanded) / `w-16` (collapsed)

### Responsive Design

- **Mobile**: Overlay sidebar with backdrop
- **Desktop**: Fixed sidebar with toggle
- **Breakpoints**: Uses Tailwind's default breakpoint system

## Interactive Elements

### Hover States

```css
/* Button hover */
.btn:hover {
  background-color: var(--primary);
  color: var(--primary-foreground);
}

/* Link hover */
.link:hover {
  color: var(--primary);
}

/* Navigation hover */
.nav-item:hover {
  background-color: var(--muted);
  color: var(--foreground);
}
```

### Transitions

- **Default**: `transition-all duration-300`
- **Quick**: `transition-colors duration-200`
- **Smooth**: `transition-all duration-300 ease-in-out`

### Focus States

Follow accessible focus patterns with:

- Clear focus rings
- Keyboard navigation support
- ARIA labels and titles

## Icon System

### Icon Library

- **Primary**: Lucide React icons
- **Custom SVG**: Inline SVG for brand-specific icons
- **Size**: Default `w-5 h-5` (20px)

### Icon Usage

```tsx
// Standard icon implementation
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M12 6v6l4 2"
  />
</svg>
```

## Accessibility Guidelines

### Color Contrast

- Ensure minimum 4.5:1 contrast ratio for normal text
- Use semantic colors consistently (success = green, warning = amber, etc.)
- Test both light and dark themes for accessibility

### Interactive Elements

- All interactive elements must be keyboard accessible
- Provide meaningful titles and ARIA labels
- Focus states must be clearly visible

### Motion

- Respect `prefers-reduced-motion` for animations
- Keep transitions smooth but not distracting
- Default to 300ms duration for most transitions

## File Naming Conventions

### Components

- **File Names**: PascalCase (e.g., `PageTemplate.tsx`)
- **Component Names**: PascalCase matching file name
- **Props Interfaces**: `ComponentNameProps`

### Pages

- **Directory Structure**: kebab-case (e.g., `/command-framework/`)
- **File Names**: `page.tsx` for Next.js App Router

### Assets

- **Images**: kebab-case with descriptive names
- **Organization**: Grouped in logical subdirectories (`/presenters/`, `/mechanisms/`, etc.)

## Code Style Patterns

### TypeScript Interfaces

```tsx
interface ComponentProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}
```

### Component Structure

```tsx
export default function Component({ prop1, prop2 }: ComponentProps) {
  return <div className="container">{children}</div>;
}
```

### CSS Class Patterns

- Use Tailwind utility classes
- Custom components in `@layer components`
- CSS variables for theme consistency
- Responsive design with mobile-first approach

## Brand Guidelines

### Logo Usage

- Gray Matter logo: 32x32px rounded corners
- Alt text: "Gray Matter Logo"
- Position: Top left of header

### Brand Colors

- Primary: Deep Academic Blue (`#0D233F`)
- Educational themes: Mint green, warm amber, gentle purple, fresh teal
- Maintain professional educational appearance

### Voice & Tone

- Educational and approachable
- Technical but accessible
- Clear and concise
- Workshop-focused language
