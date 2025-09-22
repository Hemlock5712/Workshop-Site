# Code Analysis & Improvement TODO

## 1. Repeated Code Patterns → Template Components

### High Priority Templates to Create:

#### ContentCard Component

- **Pattern Found**: `bg-slate-50 dark:bg-slate-900 rounded-lg p-6 shadow-lg border border-slate-200 dark:border-slate-800` appears 15+ times
- **Current Usage**: Feature boxes, content sections, code examples
- **Proposed Template**: `<ContentCard variant="default|primary|concept">`
- **Impact**: Reduce ~200+ lines of repeated styling

#### AlertBox Component

- **Pattern Found**: Colored alert boxes (yellow warnings, blue info, green success) with consistent border/padding patterns
- **Current Usage**: Warnings, tips, important notes across all pages
- **Proposed Template**: `<AlertBox type="warning|info|success|tip" title="..." icon="⚠️|💡|✅" />`
- **Files Affected**: hardware/page.tsx, building-subsystems/page.tsx, pid-control/page.tsx, etc.

#### ExternalLink Component

- **Pattern Found**: External links with `target="_blank" rel="noopener noreferrer"` and consistent styling
- **Current Usage**: Documentation links, external resources (Phoenix docs, WPILib, etc.)
- **Proposed Template**: `<ExternalLink href="..." />` with automatic external handling
- **Impact**: Standardize all external link behavior

#### DocumentationButton Component

- **Pattern Found**: Large blue buttons with icons for official docs (appears 6+ times)
- **Current Usage**: Links to CTRE docs, WPILib guides, Phoenix documentation
- **Proposed Template**: `<DocumentationButton href="..." title="..." icon="📖" />`
- **Example**: Phoenix PID Tuning Guide, WPILib Command-Based docs

#### StepList Component

- **Pattern Found**: Numbered/checkmark step lists with consistent styling
- **Current Usage**: Setup instructions, motor update processes
- **Proposed Template**: `<StepList steps={[]} variant="numbered|checkmark" />`
- **Files Using**: hardware/page.tsx (motor update steps), mechanism-setup steps

#### FeatureGrid Component

- **Pattern Found**: 3-column grids with feature descriptions
- **Current Usage**: Concept explanations (Triggers/Subsystems/Commands), PID components
- **Proposed Template**: `<FeatureGrid items={[]} columns={3} />`
- **Example**: Command framework explanation grid, PID component explanations

### Medium Priority Templates:

#### CollapsibleSection Component

- **Pattern Found**: `<details>` with consistent styling for code examples
- **Usage**: Code examples, expanded explanations
- **Files Using**: building-subsystems/page.tsx, pid-control/page.tsx, motion-magic/page.tsx

#### ComparisonTable Component

- **Pattern Found**: Before/after, comparison layouts
- **Usage**: Implementation comparisons in MechanismTabs
- **Current**: Built into MechanismTabs, could be extracted

## 2. Pages Needing More Information

### Limited Content Pages (High Priority):

#### Prerequisites Page (`src/app/prerequisites/page.tsx`)

- **Current Content**: Basic software list with download links
- **Missing Content**:
  - Installation troubleshooting guide
  - Hardware requirements and recommendations
  - Team setup considerations
  - Skill level prerequisites and learning path
  - Time commitment estimates
  - Common installation issues and fixes
- **Priority**: High - first impression page, users get stuck here

#### Hardware Page (`src/app/hardware/page.tsx`)

- **Current Content**: CTRE product overview, basic Phoenix Tuner setup, motor colors
- **Missing Content**:
  - Wiring diagrams and connection examples
  - Detailed troubleshooting section beyond basic "Having Issues?"
  - Alternative hardware options for teams without CTRE
  - Common hardware mistakes and how to avoid them
  - Physical setup best practices
  - CANivore network topology examples
- **Priority**: Medium-High - critical for workshop success

#### Command Framework Page (`src/app/command-framework/page.tsx`)

- **Current Content**: Basic Triggers/Subsystems/Commands explanation
- **Missing Content**:
  - Complex command patterns (ParallelCommandGroup, SequentialCommandGroup)
  - Command composition examples
  - Common command pitfalls and debugging
  - Advanced trigger patterns
  - Command scheduling and interruption
  - Real-world command examples beyond basic movement
- **Priority**: Medium - foundational concept that needs depth

### Content Enhancement Opportunities:

#### Introduction Page (`src/app/introduction/page.tsx`)

- **Potential Additions**:
  - Detailed learning paths with time estimates
  - Success criteria for each workshop section
  - Prerequisites breakdown by skill level
  - Workshop completion certificates/badges concept

#### All Workshop #1 Pages

- **Universal Additions Needed**:
  - Troubleshooting sections for each topic
  - "Common Mistakes" alert boxes
  - "What's Next?" preview sections
  - Links between related concepts

## Implementation Priority:

### Phase 1: Template Components (Immediate Impact)

1. ContentCard Component (highest frequency usage)
2. AlertBox Component (safety and tips)
3. DocumentationButton Component (user experience)
4. ExternalLink Component (consistency)

### Phase 2: Content Enhancement

1. Prerequisites page enhancement (user onboarding)
2. Hardware page troubleshooting (user success)
3. Command Framework depth (learning quality)

### Phase 3: Advanced Templates

1. StepList Component
2. FeatureGrid Component
3. CollapsibleSection Component

## Estimated Impact:

- **Code Reduction**: ~40% reduction in repeated styling code
- **Consistency**: Unified component styling and behavior
- **Maintainability**: Single source of truth for common patterns
- **User Experience**: More comprehensive content, better troubleshooting support
- **Developer Experience**: Faster page creation with reusable components
