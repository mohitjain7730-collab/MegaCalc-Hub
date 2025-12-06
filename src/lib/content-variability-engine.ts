/**
 * Content Variability Engine
 * 
 * Ensures structural variation across all articles while keeping them deterministic.
 * Uses article slug hash to generate stable, unique variations per article.
 * 
 * This prevents AI-pattern detection, template footprints, and repetition signals
 * while maintaining consistent output per article (no re-randomization on reload).
 */

/**
 * Generate a deterministic seed from article slug
 * This ensures the same slug always produces the same variations
 */
export function generateDeterministicSeed(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    const char = slug.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Choose a variation from an array based on deterministic seed
 * @param seed - Deterministic seed (from slug hash)
 * @param options - Array of options to choose from
 * @param offset - Optional offset to create different selections from same seed
 * @returns Selected option from array
 */
export function chooseVariation<T>(seed: number, options: T[], offset: number = 0): T {
  if (options.length === 0) {
    throw new Error('Options array cannot be empty');
  }
  
  // Use offset to create different selections from the same seed
  const combinedSeed = seed + offset;
  const index = combinedSeed % options.length;
  return options[index];
}

/**
 * Generate multiple variations from the same seed
 * Useful for selecting multiple independent choices
 */
export function chooseMultipleVariations<T>(
  seed: number, 
  options: T[], 
  count: number
): T[] {
  const selected: T[] = [];
  const usedIndices = new Set<number>();
  
  for (let i = 0; i < count && selected.length < options.length; i++) {
    const offset = i * 1000; // Large offset to ensure different selections
    const index = (seed + offset) % options.length;
    
    if (!usedIndices.has(index)) {
      selected.push(options[index]);
      usedIndices.add(index);
    }
  }
  
  return selected;
}

/**
 * Section order variations
 * Determines where different sections appear in the article
 */
export interface SectionOrder {
  takeawaysPosition: 'early' | 'middle' | 'late';
  examplePosition: 'early' | 'middle' | 'late';
  statPosition: 'early' | 'middle' | 'late';
  faqPosition: 'after-main' | 'near-bottom';
  expertCommentaryPosition: 'after-intro' | 'after-main' | 'before-faq';
  optionalSectionPosition: 'after-main' | 'before-faq' | 'near-bottom';
}

/**
 * Generate section order based on slug seed
 */
export function generateSectionOrder(slug: string): SectionOrder {
  const seed = generateDeterministicSeed(slug);
  
  const positionOptions: Array<'early' | 'middle' | 'late'> = ['early', 'middle', 'late'];
  const faqPositionOptions: Array<'after-main' | 'near-bottom'> = ['after-main', 'near-bottom'];
  const expertPositionOptions: Array<'after-intro' | 'after-main' | 'before-faq'> = ['after-intro', 'after-main', 'before-faq'];
  const optionalPositionOptions: Array<'after-main' | 'before-faq' | 'near-bottom'> = ['after-main', 'before-faq', 'near-bottom'];
  
  return {
    takeawaysPosition: chooseVariation(seed, positionOptions, 0),
    examplePosition: chooseVariation(seed, positionOptions, 1),
    statPosition: chooseVariation(seed, positionOptions, 2),
    faqPosition: chooseVariation(seed, faqPositionOptions, 3),
    expertCommentaryPosition: chooseVariation(seed, expertPositionOptions, 4),
    optionalSectionPosition: chooseVariation(seed, optionalPositionOptions, 5),
  };
}

/**
 * Heading variations for common section titles
 */
export const HEADING_VARIATIONS = {
  'Key Takeaways': [
    'Key Takeaways',
    'Summary Points',
    'Main Insights',
    'Important Notes',
    'Core Concepts',
    'Essential Points'
  ],
  'Why It Matters': [
    'Why It Matters',
    'Why This Topic Matters',
    'Why This Is Important',
    'Why It\'s Relevant',
    'The Significance',
    'Why You Should Care'
  ],
  'Frequently Asked Questions': [
    'Frequently Asked Questions',
    'Common Questions',
    'FAQ',
    'Questions & Answers',
    'What You Need to Know',
    'Your Questions Answered'
  ],
  'Example Scenario': [
    'Example Scenario',
    'Real-World Example',
    'Case Study',
    'Practical Example',
    'Scenario Snapshot',
    'Real-Life Example'
  ],
  'Quick Stat': [
    'Quick Stat',
    'Did You Know?',
    'Interesting Fact',
    'By the Numbers',
    'Statistic',
    'Data Insight'
  ],
  'Expert Insight': [
    'Expert Insight',
    'Professional Perspective',
    'Expert View',
    'Insider Tip',
    'Expert Advice',
    'Professional Opinion'
  ],
  'Common Mistake': [
    'Common Mistake',
    'Pitfall to Avoid',
    'Common Error',
    'Mistake to Watch For',
    'What Not to Do',
    'Avoid This Mistake'
  ],
  'Pro Tip': [
    'Pro Tip',
    'Expert Tip',
    'Professional Tip',
    'Insider Secret',
    'Pro Advice',
    'Expert Recommendation'
  ]
};

/**
 * Get heading variation based on slug
 */
export function getHeadingVariation(slug: string, defaultHeading: string): string {
  const seed = generateDeterministicSeed(slug);
  const variations = HEADING_VARIATIONS[defaultHeading as keyof typeof HEADING_VARIATIONS];
  
  if (!variations || variations.length === 0) {
    return defaultHeading;
  }
  
  return chooseVariation(seed, variations, 0);
}

/**
 * Optional micro-section types
 */
export type OptionalSectionType = 'common-mistake' | 'expert-insight' | 'pro-tip' | null;

/**
 * Determine which optional section to include (or none)
 * 30% chance of nothing, 70% chance of one section type
 */
export function chooseOptionalSection(slug: string): OptionalSectionType {
  const seed = generateDeterministicSeed(slug);
  const random = seed % 10;
  
  // 30% chance of nothing (0-2)
  if (random < 3) {
    return null;
  }
  
  // 70% chance of one section type
  const sectionTypes: Array<'common-mistake' | 'expert-insight' | 'pro-tip'> = [
    'common-mistake',
    'expert-insight',
    'pro-tip'
  ];
  
  return chooseVariation(seed, sectionTypes, 10);
}

/**
 * Natural imperfection variations
 * Adds 1-2% human-like variance without changing meaning
 */
export interface NaturalImperfections {
  useRhetoricalQuestion: boolean;
  useConversationalTransition: boolean;
  sentenceLengthVariation: 'short' | 'medium' | 'long';
  addEmphasis: boolean;
}

/**
 * Generate natural imperfections based on slug
 */
export function generateNaturalImperfections(slug: string): NaturalImperfections {
  const seed = generateDeterministicSeed(slug);
  
  return {
    useRhetoricalQuestion: (seed % 100) < 15, // 15% chance
    useConversationalTransition: (seed % 100) < 20, // 20% chance
    sentenceLengthVariation: chooseVariation(seed, ['short', 'medium', 'long'], 20),
    addEmphasis: (seed % 100) < 10, // 10% chance
  };
}

/**
 * Apply natural imperfections to text
 */
export function applyNaturalImperfections(
  text: string,
  imperfections: NaturalImperfections
): string {
  let result = text;
  
  // Add rhetorical question if enabled
  if (imperfections.useRhetoricalQuestion && !text.includes('?')) {
    // This would be applied contextually, not randomly
    // Implementation depends on where it's used
  }
  
  // Add conversational transitions
  if (imperfections.useConversationalTransition) {
    const transitions = ['Now, ', 'Here\'s the thing: ', 'The reality is, ', 'Here\'s what matters: '];
    // Would be applied at sentence starts contextually
  }
  
  return result;
}






