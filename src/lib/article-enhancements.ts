/**
 * Article Enhancement Utilities
 * 
 * This module provides utilities to enhance article templates with dynamic,
 * human-like content variations to avoid AI-pattern detection and increase uniqueness.
 * All randomization is deterministic based on article slug/topic to ensure consistency.
 * 
 * INTEGRATED WITH:
 * - Content Variability Engine (deterministic variations)
 * - Topic-Based Example Generator (examples.ts)
 * - Natural Imperfections System (1-2% human-like variance)
 */

// Type definitions
interface StatisticsData {
  [category: string]: string[];
}

// Import statistics data
import statisticsDataRaw from '@/data/statistics.json';

// Type assertion for the imported JSON
const statisticsData = statisticsDataRaw as StatisticsData;

// Import new systems
import {
  generateDeterministicSeed,
  chooseVariation,
  generateSectionOrder,
  getHeadingVariation as getVariabilityHeading,
  chooseOptionalSection as chooseOptionalSectionType,
  generateNaturalImperfections,
  type SectionOrder,
  type OptionalSectionType
} from './content-variability-engine';
import { generateExampleForTopic } from '@/data/examples';

interface OptionalSection {
  type: 'common-mistake' | 'expert-insight' | 'pro-tip' | null;
  content: string;
}

// Heading variations for common section titles
const HEADING_VARIATIONS: Record<string, string[]> = {
  'Key Takeaways': ['Summary Points', 'Main Insights', 'Important Notes', 'Core Concepts'],
  'Why It Matters': ['Why This Topic Matters', 'Why This Is Important', 'Why It\'s Relevant', 'The Significance'],
  'Frequently Asked Questions': ['Common Questions', 'FAQ', 'Questions & Answers', 'What You Need to Know'],
  'Example Scenario': ['Real-World Example', 'Case Study', 'Practical Example', 'Example'],
  'Quick Stat': ['Did You Know?', 'Interesting Fact', 'By the Numbers', 'Statistic'],
  'Expert Insight': ['Professional Perspective', 'Expert View', 'Insider Tip', 'Expert Advice'],
  'Common Mistake': ['Pitfall to Avoid', 'Common Error', 'Mistake to Watch For', 'What Not to Do']
};

/**
 * Generate a deterministic hash from a string
 * Used to ensure consistent randomization based on article slug/topic
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get a deterministic random number between 0 and max (exclusive)
 * Based on the hash of the topic/slug
 */
function getDeterministicRandom(topic: string, max: number): number {
  const hash = hashString(topic);
  return hash % max;
}

/**
 * Get a deterministic random number between min and max (inclusive)
 */
function getDeterministicRandomRange(topic: string, min: number, max: number): number {
  const range = max - min + 1;
  return min + (getDeterministicRandom(topic, range));
}

/**
 * Select a random item from an array deterministically
 */
function selectDeterministicItem<T>(topic: string, items: T[]): T {
  if (items.length === 0) throw new Error('Array is empty');
  const index = getDeterministicRandom(topic, items.length);
  return items[index];
}

/**
 * Shuffle an array deterministically (Fisher-Yates with deterministic seed)
 */
function deterministicShuffle<T>(topic: string, array: T[]): T[] {
  const shuffled = [...array];
  const hash = hashString(topic);
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const seed = hash + i;
    const j = Math.abs(seed) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Map article category/slug to statistics category
 */
function mapTopicToCategory(topic: string, category?: string): string {
  // Use provided category if available
  if (category) {
    const normalized = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (normalized in statisticsData) {
      return normalized;
    }
  }
  
  // Try to infer from topic/slug
  const topicLower = topic.toLowerCase();
  
  // Finance-related
  if (topicLower.includes('finance') || topicLower.includes('investment') || 
      topicLower.includes('retirement') || topicLower.includes('loan') ||
      topicLower.includes('mortgage') || topicLower.includes('credit') ||
      topicLower.includes('tax') || topicLower.includes('budget')) {
    return 'finance';
  }
  
  // Health-related
  if (topicLower.includes('health') || topicLower.includes('fitness') ||
      topicLower.includes('wellness') || topicLower.includes('nutrition') ||
      topicLower.includes('diet') || topicLower.includes('exercise') ||
      topicLower.includes('bmi') || topicLower.includes('calorie')) {
    return 'health-fitness';
  }
  
  // Business-related
  if (topicLower.includes('business') || topicLower.includes('startup') ||
      topicLower.includes('profit') || topicLower.includes('revenue') ||
      topicLower.includes('margin') || topicLower.includes('breakeven')) {
    return 'business-startup';
  }
  
  // Investing
  if (topicLower.includes('invest') || topicLower.includes('stock') ||
      topicLower.includes('portfolio') || topicLower.includes('return')) {
    return 'investing';
  }
  
  // Budgeting
  if (topicLower.includes('budget') || topicLower.includes('saving') ||
      topicLower.includes('expense') || topicLower.includes('income')) {
    return 'budgeting';
  }
  
  // Cooking/Food
  if (topicLower.includes('cooking') || topicLower.includes('food') ||
      topicLower.includes('recipe') || topicLower.includes('meal')) {
    return 'cooking-food';
  }
  
  // Home Improvement
  if (topicLower.includes('home') || topicLower.includes('renovation') ||
      topicLower.includes('improvement') || topicLower.includes('mortgage')) {
    return 'home-improvement';
  }
  
  // Technology
  if (topicLower.includes('tech') || topicLower.includes('data') ||
      topicLower.includes('storage') || topicLower.includes('bandwidth')) {
    return 'technology';
  }
  
  // Wellness
  if (topicLower.includes('wellness') || topicLower.includes('meditation') ||
      topicLower.includes('stress') || topicLower.includes('sleep')) {
    return 'wellness';
  }
  
  // Default to general
  return 'general';
}

/**
 * Generate a unique example or case study based on topic
 * NOW USES: Topic-Based Example Generator from examples.ts
 */
export function generateExample(topic: string, category?: string): string {
  // Use the new topic-based example generator
  return generateExampleForTopic(topic, category);
}

/**
 * Legacy example generator (kept for backward compatibility)
 * @deprecated Use generateExample which now uses examples.ts
 */
function generateExampleLegacy(topic: string, category?: string): string {
  const cat = mapTopicToCategory(topic, category);
  const examples: Record<string, string[]> = {
    finance: [
      `Sarah, a 32-year-old marketing manager, used this calculator to determine that refinancing her $250,000 mortgage at 3.5% instead of 4.2% would save her $156 per month, totaling $56,160 over the life of the loan.`,
      `After running the numbers, John discovered that contributing an extra $200 monthly to his 401(k) starting at age 30 would result in an additional $340,000 by retirement age, thanks to compound interest.`,
      `Maria calculated that paying off her $15,000 credit card debt with a 22% APR would take 18 years making minimum payments, but only 3 years by increasing her monthly payment by $300.`,
      `A couple in their 40s used this tool to realize that maxing out their HSA contributions could save them $1,200 annually in taxes while building a $200,000 healthcare fund by retirement.`,
      `Tom found that switching from a 30-year to a 15-year mortgage would increase his monthly payment by $400 but save him $87,000 in total interest payments.`
    ],
    'health-fitness': [
      `After tracking her daily intake for 3 months, Lisa discovered she was consuming 400 more calories than her maintenance level. By adjusting her portions, she lost 12 pounds over 4 months without changing her exercise routine.`,
      `Mark, a 45-year-old office worker, used this calculator to find that his sedentary lifestyle meant he needed to walk 8,000 steps daily to maintain his weight. He started parking further away and taking stairs, reaching his goal within 2 weeks.`,
      `A fitness enthusiast calculated that increasing her protein intake from 60g to 100g daily would help her build muscle more effectively. After 3 months, she gained 5 pounds of lean muscle while maintaining her body fat percentage.`,
      `John discovered that his BMI of 28.5 put him in the overweight category. By reducing his daily caloric intake by 500 calories and adding 30 minutes of exercise, he reached a healthy BMI of 24.8 in 6 months.`,
      `Sarah used this tool to determine that her target heart rate zone for optimal fat burning was 120-140 bpm. She adjusted her cardio routine accordingly and saw a 15% improvement in her fitness metrics over 8 weeks.`
    ],
    business: [
      `A small bakery owner calculated that increasing prices by just 5% would boost monthly profits by $1,200 without losing customers, bringing the business from break-even to profitable within 3 months.`,
      `After running the numbers, a startup founder realized that reducing customer acquisition costs from $150 to $100 would require a 33% improvement in conversion rates, which they achieved through A/B testing their landing page.`,
      `A consulting firm discovered that raising their hourly rate from $125 to $150 would increase annual revenue by $50,000 while working 20% fewer hours, improving work-life balance.`,
      `A retail store owner calculated that optimizing inventory turnover from 4 to 6 times per year would free up $40,000 in working capital, allowing expansion to a second location.`,
      `An e-commerce business found that reducing shipping costs by negotiating better rates would increase profit margins by 3%, adding $18,000 annually to the bottom line.`
    ],
    investing: [
      `By starting to invest $500 monthly at age 25 instead of 35, Emily would accumulate $1.2 million by age 65, compared to $580,000 if she started a decade later—more than double the retirement savings.`,
      `A couple in their 30s calculated that rebalancing their portfolio from 80% stocks to 60% stocks as they approached retirement would reduce volatility by 25% while maintaining strong growth potential.`,
      `After using this calculator, David realized that switching from actively managed funds (1.2% expense ratio) to index funds (0.05% expense ratio) would save him $23,000 in fees over 20 years.`,
      `Sarah discovered that dollar-cost averaging $1,000 monthly into the market would reduce her average purchase price by 8% compared to investing a lump sum, thanks to market volatility.`,
      `A retiree calculated that withdrawing 4% annually from a $1 million portfolio would provide $40,000 per year, adjusted for inflation, with a 95% probability of lasting 30 years.`
    ],
    budgeting: [
      `After tracking expenses for 2 months, the Johnson family discovered they were spending $450 monthly on dining out. By reducing this to $200 and cooking more at home, they saved $3,000 annually.`,
      `A recent college graduate calculated that following the 50/30/20 rule on a $50,000 salary would allow $1,000 monthly for savings, building a $12,000 emergency fund in just one year.`,
      `The Martinez family found that refinancing their car loan from 8% to 4% APR would save $2,400 over the loan term, allowing them to redirect that money toward their children's education fund.`,
      `By switching to a cash-back credit card and paying off balances monthly, a couple earned $600 annually in rewards while improving their credit score by 40 points.`,
      `A single professional discovered that moving to a smaller apartment closer to work would save $300 monthly in rent and $200 in transportation, totaling $6,000 in annual savings.`
    ],
    general: [
      `After implementing time-blocking techniques, a project manager increased daily productivity by 25%, completing tasks 2 hours earlier each day.`,
      `A freelancer calculated that raising rates by 20% and working 4 days per week instead of 5 would maintain the same income while improving work-life balance.`,
      `By automating routine tasks, a small business owner saved 10 hours per week, allowing focus on growth strategies that increased revenue by 15%.`
    ]
  };
  
  const categoryExamples = examples[cat] || examples.general;
  return selectDeterministicItem(topic, categoryExamples);
}

/**
 * Get a random statistic based on topic/category
 * NOW USES: Variability Engine for deterministic selection
 */
export function getRandomStatistic(topic: string, category?: string): string | null {
  const cat = mapTopicToCategory(topic, category);
  const stats = (statisticsData as StatisticsData)[cat];
  
  if (!stats || stats.length === 0) {
    // Fallback to general statistics
    const generalStats = (statisticsData as StatisticsData)['general'];
    if (!generalStats || generalStats.length === 0) {
      return null;
    }
    const seed = generateDeterministicSeed(topic);
    return chooseVariation(seed, generalStats, 0);
  }
  
  const seed = generateDeterministicSeed(topic);
  return chooseVariation(seed, stats, 0);
}

/**
 * Get topic statistic (alias for getRandomStatistic with seed parameter)
 * Provides consistent interface for variability engine
 */
export function getTopicStatistic(topic: string, seed: number, category?: string): string | null {
  const cat = mapTopicToCategory(topic, category);
  const stats = (statisticsData as StatisticsData)[cat];
  
  if (!stats || stats.length === 0) {
    const generalStats = (statisticsData as StatisticsData)['general'];
    if (!generalStats || generalStats.length === 0) {
      return null;
    }
    return chooseVariation(seed, generalStats, 0);
  }
  
  return chooseVariation(seed, stats, 0);
}

/**
 * Get optional micro-sections (Common Mistake, Expert Insight, or Pro Tip)
 * NOW USES: Content Variability Engine
 * Returns null 30% of the time, otherwise returns one of the three types
 */
export function getOptionalSections(topic: string, category?: string): OptionalSection {
  // Use variability engine to choose section type
  const sectionType = chooseOptionalSectionType(topic);
  
  if (!sectionType) {
    return { type: null, content: '' };
  }
  
  const cat = mapTopicToCategory(topic, category);
  const seed = generateDeterministicSeed(topic);
  
  // Generate content based on section type
  if (sectionType === 'common-mistake') {
    const mistakes: Record<string, string[]> = {
      finance: [
        `Many people overlook the impact of compound interest when making financial decisions. Waiting just 5 years to start investing can cost hundreds of thousands in retirement savings.`,
        `A common mistake is focusing only on interest rates without considering the total cost of borrowing, including fees and the length of the loan term.`,
        `People often underestimate how small monthly expenses add up. That $5 daily coffee habit costs $1,825 annually—money that could be invested instead.`
      ],
      'health-fitness': [
        `One of the biggest mistakes is setting unrealistic goals that lead to burnout. Starting with small, sustainable changes yields better long-term results than extreme diets or workout plans.`,
        `Many people focus only on exercise while ignoring nutrition. You can't out-exercise a bad diet—nutrition accounts for 70-80% of fitness results.`,
        `A common error is comparing your progress to others instead of tracking your own improvements. Everyone's body responds differently to exercise and diet changes.`
      ],
      business: [
        `Many entrepreneurs underestimate their startup costs by 30-40%, leading to cash flow problems. Always add a 20% buffer to your initial estimates.`,
        `A frequent mistake is focusing on revenue growth without monitoring profit margins. Growing revenue while losing money on each sale is unsustainable.`,
        `Business owners often neglect to track key metrics regularly. What gets measured gets managed—without data, you're flying blind.`
      ],
      investing: [
        `The biggest mistake investors make is trying to time the market. Studies show that time in the market beats timing the market 95% of the time.`,
        `Many people invest too conservatively, letting inflation erode their purchasing power. A balanced portfolio that accounts for your time horizon is crucial.`,
        `A common error is letting emotions drive investment decisions. Fear and greed lead to buying high and selling low—the opposite of successful investing.`
      ],
      budgeting: [
        `People often create budgets but don't track actual spending. Without monitoring, it's impossible to know if you're sticking to your plan.`,
        `A common mistake is budgeting for ideal months rather than average months. Unexpected expenses are normal—your budget should account for them.`,
        `Many people forget to include irregular expenses like car maintenance or annual subscriptions in their monthly budget, causing financial stress.`
      ],
      general: [
        `A common mistake is trying to optimize everything at once. Focus on one area at a time for sustainable, long-term improvement.`,
        `Many people set goals without creating actionable steps to achieve them. Break down large goals into smaller, measurable milestones.`
      ]
    };
    
    const categoryMistakes = mistakes[cat] || mistakes.general;
    return {
      type: 'common-mistake',
      content: chooseVariation(seed, categoryMistakes, 0)
    };
  }
  
  if (sectionType === 'expert-insight') {
    const insights: Record<string, string[]> = {
    finance: [
      `In my experience working with clients, the biggest financial breakthrough comes from automating savings and investments. Set it and forget it—your future self will thank you.`,
      `After analyzing thousands of financial plans, I've found that the most successful savers don't rely on willpower alone. They create systems that make saving automatic and effortless.`,
      `One insight I've gained from years of financial planning: small, consistent actions compound over time. A $100 monthly investment starting at 25 can grow to over $300,000 by retirement.`
    ],
    'health-fitness': [
      `From working with hundreds of clients, I've learned that sustainable fitness comes from finding activities you enjoy, not forcing yourself into routines you hate.`,
      `The most successful transformations I've seen combine consistency with flexibility. Perfect adherence isn't necessary—showing up 80% of the time beats perfection 20% of the time.`,
      `My experience shows that people who track their progress—whether through apps, journals, or photos—are 3x more likely to reach their fitness goals than those who don't.`
    ],
    business: [
      `Having advised hundreds of startups, I've found that the most successful businesses focus on solving a real problem for a specific audience, not trying to appeal to everyone.`,
      `In my consulting work, I've noticed that businesses that regularly review and adjust their pricing strategy grow 40% faster than those that set prices once and forget them.`,
      `The most profitable companies I work with don't just track revenue—they obsess over unit economics, customer lifetime value, and profit margins.`
    ],
    investing: [
      `After managing portfolios for over a decade, I've learned that the best investment strategy is often the simplest: low-cost index funds, regular contributions, and patience.`,
      `The most successful investors I know don't try to beat the market—they match it through diversification and stay invested through market cycles.`,
      `My experience shows that investors who rebalance their portfolios annually and stay the course during volatility outperform those who react emotionally to market swings.`
    ],
    budgeting: [
      `From helping families create budgets, I've found that the most effective approach is to pay yourself first—automate savings before you see the money in your checking account.`,
      `The households I work with that track every expense for just one month discover spending patterns that surprise them, leading to immediate opportunities to save.`,
      `My experience shows that people who use the envelope method or separate accounts for different spending categories have 50% more success sticking to their budgets.`
    ],
    general: [
      `In my years of experience, I've found that the most successful people focus on systems and processes, not just goals. Build the right habits, and results follow naturally.`,
      `The key insight I've gained is that consistency beats intensity. Small daily actions compound into extraordinary results over time.`
    ]
  };
  
    const categoryInsights = insights[cat] || insights.general;
    return {
      type: 'expert-insight',
      content: chooseVariation(seed, categoryInsights, 1)
    };
  }
  
  // Pro Tip section
  if (sectionType === 'pro-tip') {
    const proTips: Record<string, string[]> = {
      finance: [
        `Pro tip: Automate your savings and investments. When money moves automatically, you're less likely to spend it. Set up automatic transfers the day after payday.`,
        `Here's a pro tip: Review your subscriptions quarterly. Most people have $200+ in unused subscriptions. Cancel what you don't use and redirect that money to savings.`,
        `Pro tip: Use the 24-hour rule for non-essential purchases. Wait a day before buying anything over $50. You'll be surprised how often you decide you don't need it.`
      ],
      'health-fitness': [
        `Pro tip: Start with just 10 minutes of exercise daily. Consistency beats intensity. Once the habit sticks, gradually increase duration.`,
        `Here's a pro tip: Prep healthy snacks on Sunday. Having cut vegetables, fruits, and nuts ready makes healthy choices effortless during the week.`,
        `Pro tip: Track your progress with photos, not just the scale. Visual changes often appear before weight changes, keeping you motivated.`
      ],
      business: [
        `Pro tip: Focus on one key metric that drives your business. Too many metrics create confusion. Master one, then add others.`,
        `Here's a pro tip: Talk to your customers weekly. Direct feedback is worth more than any market research. They'll tell you exactly what to improve.`,
        `Pro tip: Price based on value, not cost. Customers pay for outcomes, not inputs. If you solve a $10,000 problem, charge accordingly.`
      ],
      investing: [
        `Pro tip: Invest in low-cost index funds and ignore the noise. The best investment strategy is boring: consistent contributions, low fees, and time.`,
        `Here's a pro tip: Rebalance your portfolio once a year, not more. Over-trading reduces returns. Set it and check it annually.`,
        `Pro tip: Don't check your portfolio daily. Market volatility is normal. Checking too often leads to emotional decisions that hurt returns.`
      ],
      budgeting: [
        `Pro tip: Use separate accounts for different goals. Having a "vacation fund" and "emergency fund" in separate accounts makes it easier to stick to your plan.`,
        `Here's a pro tip: Round up your expenses when budgeting. If something costs $47, budget $50. The buffer prevents overspending.`,
        `Pro tip: Pay yourself first. Transfer savings immediately when you get paid, before you see the money in your checking account.`
      ],
      general: [
        `Pro tip: Focus on systems, not goals. A good system will get you to your goal even if you forget why you started.`,
        `Here's a pro tip: Track what matters. You can't improve what you don't measure. Pick one metric and track it consistently.`
      ]
    };
    
    const categoryProTips = proTips[cat] || proTips.general;
    return {
      type: 'pro-tip',
      content: chooseVariation(seed, categoryProTips, 2)
    };
  }
  
  // Fallback (shouldn't reach here)
  return { type: null, content: '' };
}

/**
 * Generate expert commentary to insert in the middle of articles
 * NOW USES: Variability Engine and Natural Imperfections
 */
export function generateExpertCommentary(topic: string, category?: string): string {
  const cat = mapTopicToCategory(topic, category);
  const seed = generateDeterministicSeed(topic);
  const imperfections = generateNaturalImperfections(topic);
  
  const commentaries: Record<string, string[]> = {
    finance: [
      `In my experience working with clients on this topic, the biggest mistake I see is overlooking the long-term impact of small financial decisions.`,
      `After analyzing hundreds of financial situations, I've found that most people underestimate how much they can save by making just a few strategic adjustments.`,
      `The most successful financial plans I've created start with understanding the client's true priorities, not just their stated goals.`
    ],
    'health-fitness': [
      `From working with clients on their fitness journeys, I've learned that sustainable results come from making changes you can maintain long-term, not quick fixes.`,
      `In my practice, I've noticed that people who focus on building healthy habits rather than achieving specific numbers see better long-term outcomes.`,
      `The most successful transformations I've witnessed combine realistic goal-setting with consistent, daily actions.`
    ],
    business: [
      `Having advised numerous businesses on this topic, I've found that the most successful companies focus on creating value for customers, not just maximizing profits.`,
      `In my consulting experience, businesses that regularly review and adjust their strategies based on data outperform those that set a plan and never revisit it.`,
      `The key insight I've gained is that sustainable business growth comes from building systems and processes, not just working harder.`
    ],
    investing: [
      `After managing investments for years, I've learned that the best investment strategy is often the simplest: diversify, stay invested, and ignore the noise.`,
      `In my experience, investors who focus on their long-term goals and avoid emotional decisions during market volatility achieve the best results.`,
      `The most successful portfolios I've seen combine discipline with patience—staying the course through market cycles.`
    ],
    budgeting: [
      `From helping families manage their finances, I've found that the most effective budgets are realistic and flexible, not rigid and restrictive.`,
      `In my experience, people who track their spending for even one month discover patterns that lead to immediate opportunities to save.`,
      `The key to successful budgeting isn't perfection—it's creating a system that works for your lifestyle and sticking to it consistently.`
    ],
    general: [
      `In my years of experience with this topic, I've found that the most successful approach combines knowledge with consistent action.`,
      `The biggest insight I've gained is that small, daily improvements compound into significant results over time.`
    ]
  };
  
  const categoryCommentaries = commentaries[cat] || commentaries.general;
  let commentary = chooseVariation(seed, categoryCommentaries, 3);
  
  // Apply natural imperfections (1-2% variance)
  if (imperfections.useRhetoricalQuestion && !commentary.includes('?')) {
    // Add rhetorical question at the end occasionally
    if (seed % 20 === 0) {
      commentary += ' Sound familiar?';
    }
  }
  
  if (imperfections.addEmphasis) {
    // Add emphasis words occasionally
    const emphasisWords = ['really', 'truly', 'genuinely', 'absolutely'];
    if (seed % 15 === 0 && !commentary.includes('really') && !commentary.includes('truly')) {
      const emphasis = chooseVariation(seed, emphasisWords, 4);
      commentary = commentary.replace(/the biggest/, `the ${emphasis} biggest`);
    }
  }
  
  return commentary;
}

/**
 * Apply natural imperfections to text content
 * Adds 1-2% human-like variance without changing meaning
 */
export function applyNaturalImperfectionsToText(text: string, topic: string): string {
  const imperfections = generateNaturalImperfections(topic);
  const seed = generateDeterministicSeed(topic);
  let result = text;
  
  // Add conversational transitions occasionally
  if (imperfections.useConversationalTransition && seed % 25 === 0) {
    const transitions = ['Now, ', 'Here\'s the thing: ', 'The reality is, ', 'Here\'s what matters: '];
    const transition = chooseVariation(seed, transitions, 5);
    // Only add if text doesn't already start with a transition
    if (!result.match(/^(Now|Here|The|This)/i)) {
      result = transition + result;
    }
  }
  
  return result;
}

/**
 * Get a variation of a heading based on topic (deterministic)
 */
export function getHeadingVariation(topic: string, defaultHeading: string): string {
  const variations = HEADING_VARIATIONS[defaultHeading];
  if (!variations || variations.length === 0) {
    return defaultHeading;
  }
  
  // Use topic hash to select variation
  return selectDeterministicItem(topic, [defaultHeading, ...variations]);
}

/**
 * Get randomized FAQ count (between 3 and 7, or available count if less)
 */
export function getRandomizedFAQs(topic: string, faqs: { q: string; a: string }[]): { q: string; a: string }[] {
  if (!faqs || faqs.length === 0) {
    return [];
  }
  
  const minCount = 3;
  const maxCount = 7;
  const availableCount = faqs.length;
  
  // Determine how many FAQs to show
  const targetCount = Math.min(
    Math.max(minCount, getDeterministicRandomRange(topic, minCount, maxCount)),
    availableCount
  );
  
  // Shuffle and take the target count
  const shuffled = deterministicShuffle(topic, faqs);
  return shuffled.slice(0, targetCount);
}

/**
 * Determine section order based on topic hash
 * NOW USES: Content Variability Engine
 * Returns an object with section positions
 */
export function getSectionOrder(topic: string, totalSections: number): SectionOrder {
  // Use the variability engine for section ordering
  return generateSectionOrder(topic);
}

