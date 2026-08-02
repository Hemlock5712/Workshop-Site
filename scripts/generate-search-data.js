const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

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
      category: "Control Fundamentals",
      description:
        "Overview of CTRE hardware components including Kraken X44 motors, CANcoders, and CANivore setup.",
    },
    "project-setup": {
      title: "Project Setup",
      category: "Control Fundamentals",
      description:
        "Creating a new WPILib project and configuring it for CTRE hardware integration.",
    },
    "java-basics": {
      title: "The Java You Need",
      category: "Control Fundamentals",
      description:
        "Only the Java this site uses, taught off real lines of Arm.java: class and object, extends, fields, method signatures, private/public/final/static, the lambda () -> ..., the method reference arm::isAtTarget, and dot chaining.",
    },
    "command-framework": {
      title: "Command-Based Framework",
      category: "Control Fundamentals",
      description:
        "The map for the rest of Workshop #1: Triggers, Mechanisms and Commands in v3, the scheduler loop that runs them, mechanism ownership, and the one rule — a hold never finishes, so nothing may wait on one. No code to write.",
    },
    "building-subsystems": {
      title: "Mechanisms",
      category: "Control Fundamentals",
      description:
        'Implementing the v3 Mechanism base class (extends Mechanism) — hold-command factories with runRepeatedly and "(hold)" names, private setters, idle() defaults, and setDefaultCommand for one physical part of the robot.',
    },
    "adding-commands": {
      title: "Commands",
      category: "Control Fundamentals",
      description:
        'Writing your first v3 commands on branch 2-Commands: private setters, runRepeatedly factories, the "(hold)" naming rule, idle() as the default, and onTrue/onFalse trigger bindings. Composing them comes later, on Chaining Commands.',
    },
    "running-program": {
      title: "Running Your Code",
      category: "Control Fundamentals",
      description:
        "Deploying and running robot code with hardware simulation and testing.",
    },
    "ai-coding-assistant": {
      title: "Coding with an AI Assistant",
      category: "Control Fundamentals",
      description:
        "Using Claude Code, Copilot, and Codex on robot code — and spotting the Commands v2 answers they give you, because RobotContainer and SubsystemBase are what the training data contains.",
    },
    "chaining-commands": {
      title: "Chaining Commands",
      category: "Control Fundamentals",
      description:
        "Composing v3 commands: whileTrue/whileFalse hold bindings, .withTimeout(Seconds.of(...)) to give a hold an ending, Command.sequence for steps in order, and Command.race as the deadline pattern.",
    },
    "finish-lines": {
      title: "Finish Lines",
      category: "Control Fundamentals",
      description:
        "The read side of a mechanism: getPosition/getTargetPosition/isAtTarget with unit types and a tolerance, then .until(arm::isAtTarget).named(...) replacing a fixed timeout, with the timeout kept as a seatbelt.",
    },
    "mechanism-setup": {
      title: "Mechanism Setup",
      category: "Control Fundamentals",
      description:
        "Configuring specific robot mechanisms and their control systems.",
    },
    "pid-control": {
      title: "PID Control",
      category: "Control Fundamentals",
      description:
        "Understanding and implementing PID control for precise robot positioning and movement.",
    },
    "motion-magic": {
      title: "Motion Magic",
      category: "Control Fundamentals",
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
      category: "Control Fundamentals",
      description:
        "Binding controller inputs and sensor predicates to commands in v3 — scoped bindings (global / opmode / command), OpMode as a sibling to Mechanism, and why each binding's lifetime matches its scope.",
    },
    coroutines: {
      title: "Coroutines",
      category: "Advanced",
      description:
        "The advanced dialect: Command.noRequirements(coroutine -> ...) with fork, await, waitUntil and yield. Fork a hold instead of awaiting it, always time out a wait in an auto, and see the same routine written both ways.",
    },
    "drive-to-tag-inline": {
      title: "Drive to Tag, Written as a Coroutine",
      category: "Advanced",
      description:
        "The hardest lesson on the site: one while(true) coroutine body doing Limelight target-space reads, three ProfiledPIDControllers with feedforward, and the guard clauses that keep it from reporting done before it has a reading.",
    },
    "state-based": {
      title: "State Machines",
      category: "Advanced",
      description:
        "Optional advanced lesson: the Commands V3 StateMachine class — named states owning hold commands, declared transitions, entry/exit hooks, and any-state interrupts. Chaining covers everyday routines; reach for this when phases repeat, skip, or recover.",
    },
    "swerve-prerequisites": {
      title: "Swerve Drive Prerequisites",
      category: "Drive & Perception",
      description:
        "Understanding swerve drive fundamentals: holonomic motion, coordinate systems, and module anatomy.",
    },
    "swerve-drive-project": {
      title: "Creating a Swerve Drive Project",
      category: "Drive & Perception",
      description:
        "Advanced workshop on implementing swerve drive systems for omnidirectional robot movement.",
    },
    pathplanner: {
      title: "Autonomous: Driving to a Pose",
      category: "Drive & Perception",
      description:
        "Autonomous with OpModes: sequencing DriveToPoint legs in an @Autonomous class and seeding the pose before the routine runs. The robot template's DriveToPose is the same idea. No PathPlanner — this slug is kept for old links.",
    },
    "vision-implementation": {
      title: "Vision",
      category: "Drive & Perception",
      description:
        "AprilTag localization and camera mounting, then feeding Limelight measurements into the pose estimator for target detection and tracking.",
    },
    "logging-implementation": {
      title: "Logging",
      category: "Drive & Perception",
      description:
        "Setting up WPILib DataLogManager — start it in Robot's constructor and publish robot state to NetworkTables; view in AdvantageScope. Also covers why not AdvantageKit, Epilogue, or Hoot.",
    },
    "vision-shooting": {
      title: "Dynamic Flywheel Control",
      category: "Drive & Perception",
      description:
        "Shoot accurately from anywhere: odometry distance drives an InterpolatingDoubleTreeMap of distance-velocity pairs to set flywheel speed in real time.",
    },
    "swerve-calibration": {
      title: "Swerve Calibration",
      category: "Drive & Perception",
      description:
        "Calibrating and tuning swerve drive modules for accurate autonomous and teleop performance.",
    },
    "drive-to-point": {
      title: "Drive to Point",
      category: "Drive & Perception",
      description:
        "Implementing drive-to-point navigation using PID control for precise autonomous positioning.",
    },
    "advanced-drive-to-point": {
      title: "Profiled Drive to Point",
      category: "Drive & Perception",
      description:
        "Profiled path following with CTRE LinearPath feedforward plus PID for smooth autonomous movement — the internals of DriveToPose.",
    },
    glossary: {
      title: "Glossary",
      category: "Resources",
      description:
        "Terminology reference for FRC programming concepts and CTRE hardware components.",
    },
    search: {
      title: "Search",
      category: "Resources",
      description:
        "Search across all workshop content to find specific topics and lessons.",
    },
    privacy: {
      title: "Privacy Policy",
      category: "Resources",
      description:
        "What this site collects, why, and how to opt out — analytics, the AI assistant, and third-party embeds.",
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

  // Format on the way out. `pnpm build` runs this script, so an unformatted
  // write left the tree dirty and the *next* `format:check` failed on a file
  // nobody had touched — which is why CLAUDE.md used to tell you to run
  // `pnpm format` afterwards. Shelling out to the CLI rather than using the
  // API: Prettier 3's `format()` is async-only and this script is sync
  // top to bottom.
  // Run Prettier's own entry point under this Node, rather than going through
  // `npx` — spawning a `.cmd` shim without a shell is EINVAL on Windows.
  try {
    const prettierBin = path.join(
      path.dirname(require.resolve("prettier/package.json")),
      "bin",
      "prettier.cjs"
    );
    execFileSync(
      process.execPath,
      [prettierBin, "--write", "--log-level", "warn", outputPath],
      { stdio: "inherit" }
    );
  } catch (err) {
    console.warn("Could not format search data:", err.message);
  }

  console.log(`Generated search data for ${searchData.length} pages`);
  console.log("Search data written to:", outputPath);
}

// Run the script
generateSearchData();
