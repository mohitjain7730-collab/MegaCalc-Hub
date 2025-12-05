import { validateCalculatorLinks } from '../src/lib/calculator-link-validator';

const testLinks = [
  { name: 'Glycemic Index Meal Blender Calculator', slug: 'glycemic-index-meal-blender-calculator' },
  { name: 'Insulin Response Estimator', slug: 'insulin-response-estimator' },
  { name: 'Meal Calorie Breakdown Calculator', slug: 'meal-calorie-breakdown-calculator' },
];

console.log('Testing validation...');
const report = validateCalculatorLinks(testLinks);
console.log('Report:', JSON.stringify(report, null, 2));
