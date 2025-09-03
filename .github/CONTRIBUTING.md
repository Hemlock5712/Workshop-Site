# Contributing to Gray Matter Coding Workshop

Thank you for your interest in contributing to the Gray Matter Coding Workshop website! This guide will help you get started.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Git installed
- A GitHub account

### Local Development

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/Workshop-Site.git
   cd Workshop-Site
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Visit http://localhost:3000 to see the site

### Development Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run all checks (lint + type-check + build)

## 📝 Making Changes

### Code Style
- Use TypeScript for all new code
- Follow the existing Tailwind CSS patterns
- Use `&apos;` instead of `'` in JSX content to avoid ESLint errors
- Keep components small and focused

### File Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── [section]/         # Individual workshop sections
│   ├── layout.tsx         # Root layout with sidebar
│   └── page.tsx           # Home page
└── components/            # Reusable React components
    ├── Sidebar.tsx        # Collapsible navigation sidebar
    ├── PageTemplate.tsx   # Shared page layout
    ├── CodeBlock.tsx      # IDE-style syntax highlighted code
    ├── GitHubPR.tsx       # Live GitHub pull request display
    ├── GitHubPage.tsx     # Live GitHub file display
    └── ImageBlock.tsx     # Optimized image display
```

### Adding New Content

1. **New Workshop Section**
   - Create a new directory in `src/app/[section-name]/`
   - Add a `page.tsx` file using the `PageTemplate` component
   - Update the navigation items in `src/components/Sidebar.tsx`

2. **Content Guidelines**
   - Use semantic HTML elements
   - Include proper heading hierarchy (h1, h2, h3)
   - Add alt text for images
   - Use descriptive link text

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise commit messages
   - Test your changes locally with `npm run test`

3. **Push and create a PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Open a Pull Request on GitHub
   - Describe your changes clearly
   - Reference any related issues

4. **CI/CD Pipeline**
   - GitHub Actions will automatically run tests
   - All checks must pass before merging
   - Vercel will create a preview deployment for review

## 🧪 Testing

The CI pipeline runs:
- **ESLint** - Code quality and style checks
- **TypeScript** - Type checking
- **Build** - Ensures the project compiles successfully

Run these locally before submitting:
```bash
npm run test
```

## 📦 Deployment

- **Automatic deployment** happens when code is merged to `main`
- **Preview deployments** are created for Pull Requests
- **Vercel** handles all deployment automatically

## 🐛 Reporting Issues

When reporting issues, please include:
- Steps to reproduce the problem
- Expected vs actual behavior
- Screenshots if applicable
- Browser and OS information

## 💡 Suggestions

We welcome suggestions for:
- New workshop content
- UI/UX improvements
- Performance optimizations
- Accessibility enhancements

## 📄 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Keep discussions professional

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

---

Thank you for contributing to the FRC programming community! 🤖
