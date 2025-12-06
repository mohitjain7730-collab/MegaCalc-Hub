const fs = require('fs');
const path = require('path');

// Read calculators registry
const calculatorsContent = fs.readFileSync(path.join(__dirname, '../src/lib/calculators.ts'), 'utf8');
const slugMap = new Map();

// Extract slugs from the calculators array (simple regex approach)
const slugMatches = calculatorsContent.matchAll(/slug:\s*['"]([^'"]+)['"]/g);
const categoryMatches = calculatorsContent.matchAll(/category:\s*['"]([^'"]+)['"]/g);
const nameMatches = calculatorsContent.matchAll(/name:\s*['"]([^'"]+)['"]/g);

// This is a simplified approach - in production we'd parse the actual TypeScript
// For now, let's manually validate the files we know about

const filesToCheck = [
  'src/components/calculators/health-fitness/carb-to-fiber-ratio-calculator.tsx',
  'src/components/calculators/health-fitness/postpartum-hormonal-recovery-calculator.tsx',
  'src/components/calculators/health-fitness/testosterone-to-cortisol-ratio-calculator.tsx',
];

console.log('Validating related calculator links...\n');

// Read calculators.ts to get valid slugs
const calcFile = fs.readFileSync(path.join(__dirname, '../src/lib/calculators.ts'), 'utf8');
const validSlugs = new Set();
let currentSlug = null;
let currentCategory = null;

// Simple parser for slugs and categories
const lines = calcFile.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const slugMatch = line.match(/slug:\s*['"]([^'"]+)['"]/);
  const categoryMatch = line.match(/category:\s*['"]([^'"]+)['"]/);
  
  if (slugMatch) {
    currentSlug = slugMatch[1];
  }
  if (categoryMatch) {
    currentCategory = categoryMatch[1];
    if (currentSlug) {
      validSlugs.add(currentSlug);
    }
  }
}

console.log(`Found ${validSlugs.size} valid calculator slugs\n`);

// Check each file
for (const filePath of filesToCheck) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    continue;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const arrayMatch = content.match(/const\s+relatedCalculators\s*=\s*\[([\s\S]*?)\];/);
  
  if (arrayMatch) {
    const arrayContent = arrayMatch[1];
    const linkMatches = arrayContent.matchAll(/\{\s*name:\s*['"]([^'"]+)['"],\s*slug:\s*['"]([^'"]+)['"]/g);
    
    const links = [];
    const invalidLinks = [];
    
    for (const match of linkMatches) {
      const slug = match[2];
      links.push({ name: match[1], slug });
      
      // Check if file exists
      const filePath2 = path.join(__dirname, '..', 'src', 'components', 'calculators', 'health-fitness', `${slug}.tsx`);
      const exists = fs.existsSync(filePath2);
      
      if (!validSlugs.has(slug) || !exists) {
        invalidLinks.push({ name: match[1], slug, exists: exists, inRegistry: validSlugs.has(slug) });
      }
    }
    
    if (invalidLinks.length > 0) {
      console.log(`\n📄 ${filePath}`);
      console.log(`   Found ${links.length} related calculators`);
      console.log(`   ❌ Invalid: ${invalidLinks.length}`);
      invalidLinks.forEach(link => {
        console.log(`      - ${link.name} (${link.slug})`);
        if (!link.inRegistry) console.log(`        Not in registry`);
        if (!link.exists) console.log(`        File doesn't exist`);
      });
    } else {
      console.log(`\n✅ ${filePath} - All links valid`);
    }
  }
}

console.log('\n✅ Validation complete!\n');




