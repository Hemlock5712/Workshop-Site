const fs = require('fs');
const path = require('path');

// Extract text content from JSX/TSX strings
function extractTextFromJSX(content) {
  // Remove imports and exports
  content = content.replace(/^import.*$/gm, '');
  content = content.replace(/^export.*$/gm, '');
  
  // Extract text from JSX elements
  const textMatches = [];
  
  // Match text between tags: >text<
  const tagTextRegex = />([^<>{}]+)</g;
  let match;
  while ((match = tagTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && !text.startsWith('{') && !text.startsWith('//') && text.length > 1) {
      textMatches.push(text);
    }
  }
  
  // Extract text from string literals
  const stringRegex = /["'`]([^"'`\n{}]+)["'`]/g;
  while ((match = stringRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 2 && !text.includes('className') && !text.includes('href')) {
      textMatches.push(text);
    }
  }
  
  // Clean and deduplicate
  return [...new Set(textMatches)]
    .filter(text => text.length > 2)
    .join(' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Get page metadata from route
function getPageMetadata(route) {
  const routeMap = {
    '': { title: 'Gray Matter Coding Workshop - Home', category: 'General', description: 'Learn FRC\'s best programming practices to build a robot good enough to win events.' },
    'introduction': { title: 'Introduction - Gray Matter Coding Workshop', category: 'Getting Started', description: 'Overview of the workshop goals, target audience, and what you\'ll learn about FRC programming best practices.' },
    'prerequisites': { title: 'Prerequisites', category: 'Getting Started', description: 'Required software and hardware setup before starting the workshop.' },
    'hardware': { title: 'Hardware Setup', category: 'Workshop 1', description: 'Overview of CTRE hardware components including Kraken X44 motors, CANcoders, and CANivore setup.' },
    'project-setup': { title: 'Project Setup', category: 'Workshop 1', description: 'Creating a new WPILib project and configuring it for CTRE hardware integration.' },
    'command-framework': { title: 'Command-Based Framework', category: 'Workshop 1', description: 'Understanding the command-based programming paradigm and its benefits for robot code organization.' },
    'building-subsystems': { title: 'Building Subsystems', category: 'Workshop 1', description: 'Creating subsystems for robot mechanisms and understanding subsystem structure.' },
    'adding-commands': { title: 'Adding Commands', category: 'Workshop 1', description: 'Creating and implementing commands to control robot subsystems.' },
    'running-program': { title: 'Running Program', category: 'Workshop 1', description: 'Deploying and running robot code with hardware simulation and testing.' },
    'mechanism-setup': { title: 'Mechanism Setup', category: 'Workshop 1', description: 'Configuring specific robot mechanisms and their control systems.' },
    'pid-control': { title: 'PID Control', category: 'Workshop 1', description: 'Understanding and implementing PID control for precise robot positioning and movement.' },
    'motion-magic': { title: 'Motion Magic', category: 'Workshop 1', description: 'Advanced motion profiling using CTRE\'s Motion Magic for smooth, controlled movements.' },
    'mechanism-cad': { title: 'Mechanism CAD', category: 'Resources', description: '3D CAD models and visualization of robot mechanisms used in the workshop.' },
    'swerve-drive-project': { title: 'Creating a Swerve Drive Project', category: 'Workshop 2', description: 'Advanced workshop on implementing swerve drive systems for omnidirectional robot movement.' },
    'pathplanner': { title: 'Adding PathPlanner', category: 'Workshop 2', description: 'Integrating PathPlanner for autonomous path planning and trajectory following.' },
    'vision-options': { title: 'Vision Options', category: 'Workshop 2', description: 'Overview of computer vision options for FRC robots including cameras and vision processing.' },
    'vision-implementation': { title: 'Implementing Vision', category: 'Workshop 2', description: 'Practical implementation of vision systems in robot code for target detection and tracking.' },
    'logging-options': { title: 'Logging Options', category: 'Workshop 2', description: 'Data logging options for robot debugging, analysis, and performance monitoring.' },
    'logging-implementation': { title: 'Implementing Logging', category: 'Workshop 2', description: 'Setting up and implementing comprehensive logging systems for robot data collection.' },
    'vision-shooting': { title: 'Vision-Based Shooting', category: 'Workshop 2', description: 'Advanced application combining vision systems with shooting mechanisms for accurate targeting.' }
  };
  
  return routeMap[route] || { title: route, category: 'General', description: '' };
}

// Generate search data from actual page files
function generateSearchData() {
  const appDir = path.join(__dirname, '..', 'src', 'app');
  const searchData = [];
  
  // Get all page.tsx files
  function findPageFiles(dir, route = '') {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
      if (item.isDirectory()) {
        findPageFiles(path.join(dir, item.name), route ? `${route}/${item.name}` : item.name);
      } else if (item.name === 'page.tsx') {
        const filePath = path.join(dir, item.name);
        const content = fs.readFileSync(filePath, 'utf8');
        const extractedText = extractTextFromJSX(content);
        const metadata = getPageMetadata(route);
        
        // Generate tags from content and route
        const tags = [
          ...route.split('/').filter(Boolean),
          ...extractedText.toLowerCase().match(/\b(pid|control|motor|robot|hardware|command|subsystem|java|ctre|workshop|frc)\b/g) || []
        ];
        
        const searchItem = {
          id: route || 'home',
          title: metadata.title,
          description: metadata.description,
          content: extractedText,
          url: route ? `/${route}` : '/',
          category: metadata.category,
          tags: [...new Set(tags)]
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
  
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'searchData.ts');
  fs.writeFileSync(outputPath, output);
  
  console.log(`Generated search data for ${searchData.length} pages`);
  console.log('Search data written to:', outputPath);
}

// Run the script
generateSearchData();