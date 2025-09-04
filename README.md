# Gray Matter Coding Workshop #1 Website

🌐 **Live Site: [ctre-workshop-site.vercel.app](https://ctre-workshop-site.vercel.app)**

A responsive website built with Next.js and Tailwind CSS that converts the Gray Matter Coding Workshop #1 Canva presentation into an accessible markdown-based learning platform.

## 🎯 About

This website transforms the FRC programming workshop content into an interactive web experience, covering:

- **Introduction & Prerequisites** - Getting started with FRC programming
- **Hardware Setup** - CTRE motors, CANivore, and device configuration  
- **Project Setup** - Creating and organizing WPILib projects
- **Command Framework** - Understanding triggers, subsystems, and commands
- **Control Systems** - PID and Feedforward control theory
- **Tuning** - Real-world mechanism tuning with Phoenix Tuner X

## 🔗 Workshop Code Repository

The workshop includes live code examples from the companion repository:
**[Workshop-Code](https://github.com/Hemlock5712/Workshop-Code)**

### Implementation Progression
The workshop follows a structured 5-step progression:

1. **Step 1: Creating a Subsystem** - Basic motor control and sensor integration
2. **Step 2: Adding Commands** - Command-based architecture and user input
3. **Step 3: PID Control** - Precise position control with feedback loops
4. **Step 4: Using Motion Magic** - Smooth profiled movements with acceleration control
5. **Step 5: Useful Subsystem Functions** - Safety features, utilities, and diagnostics

Each step builds upon the previous implementation, showing real-world development practices.

## 🚀 Getting Started

### Requirements

- Node.js 20+
- Optional: [Bun](https://bun.sh/) v1+ (`bun install` / `bun dev`)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Development Commands

- `npm run dev` – start the local development server
- `npm test` – lint, type-check, and build the project

## 🛠 Tech Stack

- **Framework:** Next.js 15.4.6 with App Router
- **UI Library:** React 19.1.0
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript
- **Deployment:** Vercel

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── introduction/       # Workshop introduction
│   ├── prerequisites/      # Required software & hardware
│   ├── hardware/          # Hardware setup guide
│   ├── project-setup/     # Project creation & organization
│   ├── command-framework/ # Command-based programming
│   ├── control-systems/   # PID & Feedforward theory
│   └── tuning/           # Mechanism tuning guide
└── components/            # Reusable React components
    ├── Sidebar.tsx        # Collapsible navigation sidebar
    ├── PageTemplate.tsx   # Shared page layout  
    ├── CodeBlock.tsx      # IDE-style syntax highlighted code
    ├── GitHubPR.tsx       # Live GitHub pull request display
    ├── GitHubPage.tsx     # Live GitHub file display
    ├── GithubPageWithPR.tsx # Tabbed GitHub file and PR diff view
    └── ImageBlock.tsx     # Optimized image display
```

## 🤖 GitHub Actions CI/CD

This project includes automated workflows for quality assurance and deployment:

### CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) automatically:

- ✅ **Lints code** with ESLint for style consistency
- 🔍 **Type checks** with TypeScript for type safety  
- 🏗️ **Builds project** to ensure compilation success
- 📦 **Uploads artifacts** for deployment verification

### Workflow Triggers

- **Push to main/master** - Full CI pipeline + deployment readiness check
- **Pull Requests** - CI pipeline for code quality verification
- **Manual trigger** - Can be run manually from GitHub Actions tab

### Status Badges

[![CI/CD Pipeline](https://github.com/Hemlock5712/Workshop-Site/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/Hemlock5712/Workshop-Site/actions)
[![Deploy with Vercel](https://vercel.com/button)](https://ctre-workshop-site.vercel.app)

## 🌐 Live Deployment

**🚀 Live Site:** [ctre-workshop-site.vercel.app](https://ctre-workshop-site.vercel.app)

### Automatic Deployment

This project is automatically deployed to Vercel:
- **Repository:** [https://github.com/Hemlock5712/Workshop-Site](https://github.com/Hemlock5712/Workshop-Site)
- **Production Branch:** `master`
- **Auto-deploy:** Every push to `master` triggers a new deployment
- **Preview Deployments:** Pull requests create preview deployments
- **Quality Gates:** GitHub Actions ensure code quality before deployment

### Deploy Your Own

1. **Fork this repository** to your GitHub account
2. **Connect to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Import your forked repository
   - Deploy automatically

### Manual Deployment

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy

### Environment Setup

No environment variables required for basic deployment.

## 📝 Content Management

The workshop content is organized into themed pages that can be easily extended:

- Each section has its own route under `/src/app/`
- Content is written in JSX with Tailwind styling
- Navigation is automatically generated from the route structure
- Links between sections provide a guided learning experience

## 🎨 Design Features

- **Responsive Design** - Works on desktop, tablet, and mobile
- **Clean Typography** - Easy-to-read content with proper hierarchy
- **Interactive Navigation** - Smooth transitions between sections
- **Progress Tracking** - Clear next/previous navigation
- **Code-Friendly** - Optimized for technical content display
- **Live Code Integration** - Real GitHub repository embedding with PR progression
- **Video Tutorials** - YouTube integration for visual learning
- **Interactive Components** - Tabbed interfaces combining code views and PR diffs

## 🔧 Customization

To add new sections:

1. Create a new directory in `src/app/`
2. Add a `page.tsx` file with your content
3. Update the navigation in `src/components/Sidebar.tsx`
4. Link from previous/next pages as needed

## 📱 Mobile Optimization

The site includes:
- Responsive navigation menu
- Touch-friendly buttons and links
- Optimized font sizes for mobile reading
- Fast loading times

## 🤝 Contributing

This project transforms FRC programming workshop content into an interactive learning platform. To contribute:

1. Fork the repository: [https://github.com/Hemlock5712/Workshop-Site](https://github.com/Hemlock5712/Workshop-Site)
2. Create a feature branch
3. Make your changes
4. Run tests and spell check: `npm test && npm run spell`
5. Submit a pull request

All contributions help improve the FRC programming education experience!

## 📄 License

Educational content based on Gray Matter Coding Workshop materials.
