/**
 * Related Calculators Component
 * 
 * A validated, production-ready component for displaying related calculators.
 * Automatically validates links and provides fallbacks for broken links.
 * 
 * Usage:
 * ```tsx
 * <RelatedCalculators
 *   links={[
 *     { name: 'BMI Calculator', slug: 'bmi-calculator' },
 *     { name: 'Calorie Calculator', slug: 'calorie-calculator' },
 *   ]}
 *   currentSlug="current-calculator-slug"
 *   currentCategory="health-fitness"
 * />
 * ```
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  validateCalculatorLinks,
  getFallbackCalculator,
  type CalculatorLink,
  type ValidationResult,
} from '@/lib/calculator-link-validator';
import { useEffect, useState, useMemo } from 'react';

export interface RelatedCalculatorsProps {
  /**
   * Array of calculator links to display
   */
  links: CalculatorLink[];
  
  /**
   * Slug of the current calculator (to exclude from related list)
   */
  currentSlug?: string;
  
  /**
   * Category of the current calculator (for fallback suggestions)
   */
  currentCategory?: string;
  
  /**
   * Title for the related calculators section
   * @default "Related Calculators"
   */
  title?: string;
  
  /**
   * Maximum number of calculators to display
   * @default 4
   */
  maxDisplay?: number;
  
  /**
   * Whether to show validation warnings in development
   * @default true
   */
  showWarnings?: boolean;
}

/**
 * RelatedCalculators Component
 * 
 * Displays a validated list of related calculator links.
 * Automatically filters out invalid links and provides fallbacks.
 */
export function RelatedCalculators({
  links,
  currentSlug,
  currentCategory,
  title = 'Related Calculators',
  maxDisplay = 4,
  showWarnings = true,
}: RelatedCalculatorsProps) {
  const [validatedLinks, setValidatedLinks] = useState<CalculatorLink[]>([]);
  const [hasWarnings, setHasWarnings] = useState(false);

  // Validate links and apply fixes
  const validationResult = useMemo(() => {
    if (!links || links.length === 0) {
      return null;
    }

    // Filter out current calculator
    const filteredLinks = links.filter(
      (link) => link.slug !== currentSlug
    );

    // Validate all links
    const report = validateCalculatorLinks(filteredLinks);

    // Use fixed links where available, otherwise use valid links
    const fixedLinks = report.fixedLinks.map((r) => r.link);
    const validLinks = report.validLinks.map((r) => r.link);
    
    // Combine fixed and valid links
    let finalLinks = [...fixedLinks, ...validLinks];

    // For remaining invalid links, try to get fallbacks
    if (currentCategory) {
      report.remainingIssues.forEach((issue) => {
        const fallback = getFallbackCalculator(
          currentSlug || '',
          currentCategory,
          finalLinks.map((l) => l.slug)
        );
        if (fallback) {
          finalLinks.push(fallback);
        }
      });
    }

    // Limit to maxDisplay
    finalLinks = finalLinks.slice(0, maxDisplay);

    // Log warnings in development
    if (showWarnings && process.env.NODE_ENV === 'development' && report.invalidLinks.length > 0) {
      report.invalidLinks.forEach((result) => {
        console.warn(
          `⚠️ Related calculator link broken: ${result.link.slug}. ` +
          `Error: ${result.error}. ` +
          (result.suggestedFix
            ? `Suggested fix: ${result.suggestedFix.slug}`
            : 'No automatic fix available.')
        );
      });
      setHasWarnings(true);
    }

    return { report, finalLinks };
  }, [links, currentSlug, currentCategory, maxDisplay, showWarnings]);

  useEffect(() => {
    if (validationResult) {
      setValidatedLinks(validationResult.finalLinks);
    }
  }, [validationResult]);

  // Don't render if no valid links
  if (!validatedLinks || validatedLinks.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {validatedLinks.map((link) => {
            const href = link.category
              ? `/category/${link.category}/${link.slug}`
              : `#`; // Fallback if category missing

            return (
              <Link
                key={link.slug}
                href={href}
                className="text-primary underline hover:text-primary/80 transition-colors"
              >
                {link.name}
              </Link>
            );
          })}
        </div>
        {hasWarnings && process.env.NODE_ENV === 'development' && (
          <p className="mt-4 text-sm text-muted-foreground">
            ⚠️ Some related calculator links were invalid and have been filtered or replaced.
            Check the console for details.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Helper function to create calculator links from slugs
 * Useful when you only have slugs and want to generate links
 */
export function createCalculatorLinks(
  slugs: string[],
  category?: string
): CalculatorLink[] {
  const { calculators } = require('@/lib/calculators');
  
  return slugs
    .map((slug) => {
      const calc = calculators.find((c: any) => c.slug === slug);
      if (calc) {
        return {
          name: calc.name,
          slug: calc.slug,
          category: calc.category,
          description: calc.description,
        };
      }
      return {
        name: slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        slug,
        category,
      };
    })
    .filter((link) => link !== null) as CalculatorLink[];
}
