/**
 * Build-Time Validation Hook
 * 
 * This module provides build-time validation for related calculator links.
 * It can be imported in next.config.ts or used during build to validate links.
 */

import {
  validateCalculatorLinks,
  logValidationReport,
  type CalculatorLink,
  type ValidationReport,
} from './calculator-link-validator';

/**
 * Validate related calculator links during build
 * Call this from next.config.ts or build scripts
 */
export function validateRelatedCalculatorLinksAtBuildTime(
  links: CalculatorLink[],
  sourceFile?: string
): ValidationReport {
  const report = validateCalculatorLinks(links);
  
  // Only log in development or if there are errors
  if (process.env.NODE_ENV === 'development' || report.invalidLinks.length > 0) {
    logValidationReport(report, sourceFile);
  }
  
  return report;
}

/**
 * Get validation summary for build output
 */
export function getValidationSummary(report: ValidationReport): string {
  if (report.invalidLinks.length === 0) {
    return `✅ All ${report.totalScanned} related calculator links are valid.`;
  }
  
  return `⚠️  ${report.invalidLinks.length} of ${report.totalScanned} related calculator links are invalid. ${report.fixedLinks.length} can be auto-fixed.`;
}



