const fs = require("fs");
const path = require("path");

// Check if a string looks like CSS/Tailwind classes
function looksLikeCSSClasses(text) {
  const cssPatterns =
    /\b(flex|grid|block|inline|hidden|absolute|relative|fixed|sticky|overflow|border|rounded|shadow|opacity|transition|duration|ease|cursor|pointer|select|resize|appearance|outline|ring|gap|space|divide|place|items|justify|self|order|col|row|bg-|text-|font-|leading-|tracking-|decoration-|p-|px-|py-|pt-|pb-|pl-|pr-|m-|mx-|my-|mt-|mb-|ml-|mr-|w-|h-|min-|max-|top-|right-|bottom-|left-|z-|dark:|hover:|focus:|active:|disabled:|sm:|md:|lg:|xl:|2xl:)\b/;
  // If more than half the words match CSS patterns, it's likely CSS
  const words = text.split(/\s+/);
  if (words.length === 0) return false;
  const cssWordCount = words.filter((w) => cssPatterns.test(w)).length;
  return cssWordCount / words.length > 0.3;
}

// Extract text content from JSX/TSX strings
function extractTextFromJSX(content) {
  // Remove imports and exports
  content = content.replace(/^import.*$/gm, "");
  content = content.replace(/^export.*$/gm, "");

  // Remove className attributes (both string and expression forms)
  content = content.replace(/className="[^"]*"/g, "");
  content = content.replace(/className={`[^`]*`}/g, "");
  content = content.replace(/className=\{[^}]*\}/g, "");

  // Extract text from JSX elements
  const textMatches = [];

  // Match text between tags: >text<
  const tagTextRegex = />([^<>{}]+)</g;
  let match;
  while ((match = tagTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (
      text &&
      !text.startsWith("{") &&
      !text.startsWith("//") &&
      text.length > 1 &&
      !looksLikeCSSClasses(text)
    ) {
      textMatches.push(text);
    }
  }

  // Extract text from string literals
  const stringRegex = /["'`]([^"'`\n{}]+)["'`]/g;
  while ((match = stringRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (
      text &&
      text.length > 2 &&
      !text.includes("className") &&
      !text.includes("href") &&
      !looksLikeCSSClasses(text) &&
      !text.startsWith("http") &&
      !text.startsWith("/images/") &&
      !text.startsWith("src/")
    ) {
      textMatches.push(text);
    }
  }

  // Clean and deduplicate
  return [...new Set(textMatches)]
    .filter((text) => text.length > 2)
    .join(" ")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// Get page metadata from route
function getPageMetadata(route) {
  const routeMap = {
    "": {
      title: "Gray Matter Coding Workshop - Home",
      category: "General",
      description:
        "Learn FRC's best programming practices to build a robot good enough to win events.",
    },
    introduction: {
      title: "Introduction - Gray Matter Coding Workshop",
      category: "Getting Started",
      description:
        "Overview of the workshop goals, target audience, and what you'll learn about FRC programming best practices.",
    },
    prerequisites: {
      title: "Prerequisites",
      category: "Getting Started",
      description:
        "Required software and hardware setup before starting the workshop.",
    },
    hardware: {
      title: "Hardware Setup",
      category: "Workshop 1",
      description:
        "Overview of CTRE hardware components including Kraken X44 motors, CANcoders, and CANivore setup.",
    },
    "project-setup": {
      title: "Project Setup",
      category: "Workshop 1",
      description:
        "Creating a new WPILib project and configuring it for CTRE hardware integration.",
    },
    "command-framework": {
      title: "Command-Based Framework",
      category: "Workshop 1",
      description:
        'Triggers, Mechanisms, and Commands in v3 — persistent holds (runRepeatedly, the "(hold)" naming rule) and chaining with Command.sequence, call-site .until, Command.race, and .withTimeout. Coroutines and StateMachine are optional advanced dialects.',
    },
    "building-subsystems": {
      title: "Mechanisms",
      category: "Workshop 1",
      description:
        'Implementing the v3 Mechanism base class (extends Mechanism) — hold-command factories with runRepeatedly and "(hold)" names, private setters, idle() defaults, and setDefaultCommand for one physical part of the robot.',
    },
    "adding-commands": {
      title: "Commands",
      category: "Workshop 1",
      description:
        'Writing v3 commands as holds — runRepeatedly re-sending the closed-loop request, "(hold)" naming, the one rule (a hold never finishes), and chaining routines with sequence / until / race / withTimeout.',
    },
    "running-program": {
      title: "Running Program",
      category: "Workshop 1",
      description:
        "Deploying and running robot code with hardware simulation and testing.",
    },
    "mechanism-setup": {
      title: "Mechanism Setup",
      category: "Workshop 1",
      description:
        "Configuring specific robot mechanisms and their control systems.",
    },
    "pid-control": {
      title: "PID Control",
      category: "Workshop 1",
      description:
        "Understanding and implementing PID control for precise robot positioning and movement.",
    },
    "motion-magic": {
      title: "Motion Magic",
      category: "Workshop 1",
      description:
        "Advanced motion profiling using CTRE's Motion Magic for smooth, controlled movements.",
    },
    "mechanism-cad": {
      title: "Mechanism CAD",
      category: "Resources",
      description:
        "3D CAD models and visualization of robot mechanisms used in the workshop.",
    },
    triggers: {
      title: "Triggers",
      category: "Workshop 1",
      description:
        "Binding controller inputs and sensor predicates to commands in v3 — scoped bindings (global / opmode / command), OpMode as a sibling to Mechanism, and why each binding's lifetime matches its scope.",
    },
    "state-based": {
      title: "State Machines",
      category: "Advanced",
      description:
        "Optional advanced lesson: the Commands V3 StateMachine class — named states owning hold commands, declared transitions, entry/exit hooks, and any-state interrupts. Chaining covers everyday routines; reach for this when phases repeat, skip, or recover.",
    },
    "swerve-prerequisites": {
      title: "Swerve Drive Prerequisites",
      category: "Workshop 2",
      description:
        "Understanding swerve drive fundamentals: holonomic motion, coordinate systems, and module anatomy.",
    },
    "swerve-drive-project": {
      title: "Creating a Swerve Drive Project",
      category: "Workshop 2",
      description:
        "Advanced workshop on implementing swerve drive systems for omnidirectional robot movement.",
    },
    pathplanner: {
      title: "Autonomous: Driving to a Pose",
      category: "Workshop 2",
      description:
        "Autonomous in the v3 template: @Autonomous OpModes that sequence DriveToPose legs with CTRE LinearPath — no PathPlanner.",
    },
    "vision-options": {
      title: "Vision Options",
      category: "Workshop 2",
      description:
        "Overview of computer vision options for FRC robots including cameras and vision processing.",
    },
    "vision-implementation": {
      title: "Implementing Vision",
      category: "Workshop 2",
      description:
        "Practical implementation of vision systems in robot code for target detection and tracking.",
    },
    "logging-options": {
      title: "Logging Options",
      category: "Workshop 2",
      description:
        "Why logging matters and what to log; this workshop uses WPILib DataLogManager only — AdvantageKit, Epilogue, and replay are named as vocabulary, not taught.",
    },
    "logging-implementation": {
      title: "Implementing Logging",
      category: "Workshop 2",
      description:
        "Setting up WPILib DataLogManager — start it in Robot's constructor and publish robot state to NetworkTables; view in AdvantageScope.",
    },
    "vision-shooting": {
      title: "Dynamic Flywheel Control",
      category: "Advanced",
      description:
        "Shoot accurately from anywhere: odometry distance drives an InterpolatingDoubleTreeMap of distance-velocity pairs to set flywheel speed in real time.",
    },
    "swerve-calibration": {
      title: "Swerve Calibration",
      category: "Workshop 2",
      description:
        "Calibrating and tuning swerve drive modules for accurate autonomous and teleop performance.",
    },
    "drive-to-point": {
      title: "Drive to Point",
      category: "Workshop 2",
      description:
        "Implementing drive-to-point navigation using PID control for precise autonomous positioning.",
    },
    "advanced-drive-to-point": {
      title: "Advanced: Profiled Drive to Point",
      category: "Advanced",
      description:
        "Profiled path following with CTRE LinearPath feedforward plus PID for smooth autonomous movement — the internals of DriveToPose.",
    },
    glossary: {
      title: "Glossary",
      category: "Resources",
      description:
        "Terminology reference for FRC programming concepts and CTRE hardware components.",
    },
    "ai-assistant": {
      title: "AI Assistant",
      category: "Resources",
      description:
        "AI chat for workshop questions, plus how to use AI coding assistants (Claude Code, GitHub Copilot, OpenAI Codex) and the 2027-Template's Agent Skills on your own robot code.",
    },
    search: {
      title: "Search",
      category: "Resources",
      description:
        "Search across all workshop content to find specific topics and lessons.",
    },
  };

  return (
    routeMap[route] || { title: route, category: "General", description: "" }
  );
}

// Generate search data from actual page files
function generateSearchData() {
  const appDir = path.join(__dirname, "..", "src", "app");
  const searchData = [];

  // Get all page.tsx files
  function findPageFiles(dir, route = "") {
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      if (item.isDirectory()) {
        findPageFiles(
          path.join(dir, item.name),
          route ? `${route}/${item.name}` : item.name
        );
      } else if (item.name === "page.tsx" || item.name === "page.mdx") {
        // Strip Next.js route group prefixes like (workshop)/ and (planner)/
        const cleanRoute = route.replace(/\([^)]+\)\/?/g, "");

        const filePath = path.join(dir, item.name);
        const content = fs.readFileSync(filePath, "utf8");
        const extractedText = extractTextFromJSX(content);

        // Skip pages with no meaningful content
        if (extractedText.length < 50) continue;

        const metadata = getPageMetadata(cleanRoute);

        // Generate tags from content and clean route
        const tags = [
          ...cleanRoute.split("/").filter(Boolean),
          ...(extractedText
            .toLowerCase()
            .match(
              /\b(pid|control|motor|robot|hardware|command|subsystem|java|ctre|workshop|frc)\b/g
            ) || []),
        ];

        const searchItem = {
          id: cleanRoute || "home",
          title: metadata.title,
          description: metadata.description,
          content: extractedText,
          url: cleanRoute ? `/${cleanRoute}` : "/",
          category: metadata.category,
          tags: [...new Set(tags)],
        };

        searchData.push(searchItem);
      }
    }
  }

  findPageFiles(appDir);

  // Generate the TypeScript file
  const output = `// This file is auto-generated by scripts/generate-search-data.js
// Do not edit manually - changes will be overwritten during build
// Run 'npm run generate-search' to regenerate from page content

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  category: string;
  tags: string[];
}

export const searchData: SearchItem[] = ${JSON.stringify(searchData, null, 2)};
`;

  const outputPath = path.join(__dirname, "..", "src", "data", "searchData.ts");
  fs.writeFileSync(outputPath, output);

  console.log(`Generated search data for ${searchData.length} pages`);
  console.log("Search data written to:", outputPath);
}

// Run the script
generateSearchData();
