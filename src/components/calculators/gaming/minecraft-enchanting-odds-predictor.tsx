'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gamepad2, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  itemType: z.enum(['sword', 'bow', 'armor', 'tool', 'book'], { invalid_type_error: 'Select item type' }),
  enchantmentLevel: z.number({ invalid_type_error: 'Enter enchantment level' }).min(1).max(30),
  targetEnchantment: z.string().optional(),
  bookshelfCount: z.number({ invalid_type_error: 'Enter bookshelf count' }).min(0).max(15).optional(),
  previousEnchantments: z.number({ invalid_type_error: 'Enter previous enchantments' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  itemType: string;
  enchantmentLevel: number;
  targetEnchantment: string;
  bookshelfCount: number;
  previousEnchantments: number;
  maxEnchantmentLevel: number;
  availableEnchantments: number;
  probabilityOfTarget: number;
  expectedEnchantments: number;
  experienceCost: number;
  successProbability: number;
  status: 'low-odds' | 'moderate-odds' | 'good-odds' | 'excellent-odds';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Select the item type you want to enchant (Sword, Bow, Armor, Tool, or Book).',
  'Enter the enchantment level you plan to use (1-30).',
  'Optionally enter a target enchantment name to calculate specific probability.',
  'Optionally enter the number of bookshelves around the enchanting table (0-15).',
  'Optionally enter the number of previous enchantments on the item.',
  'Review enchantment probabilities, expected enchantments, experience cost, and recommendations.',
];

const faqs = [
  {
    question: 'How does enchanting work in Minecraft?',
    answer:
      'Enchanting in Minecraft uses experience levels and lapis lazuli to add enchantments to items. The enchanting table offers 3 random enchantment options at different levels. Higher levels provide better enchantments but cost more experience. Bookshelves around the enchanting table increase maximum enchantment level (up to level 30).',
  },
  {
    question: 'What is the maximum enchantment level?',
    answer:
      'Maximum enchantment level depends on bookshelves: 0 bookshelves = level 8, 1-14 bookshelves = level 8 + (bookshelves × 1.5), 15 bookshelves = level 30 (maximum). Bookshelves must be placed within 2 blocks of the enchanting table. Always use 15 bookshelves for maximum level 30 enchantments.',
  },
  {
    question: 'How are enchantment probabilities calculated?',
    answer:
      'Enchantment probabilities depend on: enchantment level (higher levels = better enchantments), item type (different items have different available enchantments), target enchantment rarity (common/uncommon/rare/very rare), and previous enchantments (may affect available options). Probabilities are weighted based on enchantment rarity and level requirements.',
  },
  {
    question: 'What affects enchantment success probability?',
    answer:
      'Success probability depends on: enchantment level (higher levels = better enchantments but may have lower success rates for specific targets), bookshelf count (more bookshelves = higher max level = better enchantments), item type (affects available enchantments), and target enchantment rarity (rarer enchantments have lower probabilities).',
  },
  {
    question: 'How many bookshelves do I need?',
    answer:
      'You need 15 bookshelves for maximum enchantment level (30). Bookshelves must be placed within 2 blocks of the enchanting table, with air blocks between bookshelves and the table. 15 bookshelves provide access to all enchantments and maximum enchantment levels. Always use 15 bookshelves for optimal enchanting.',
  },
  {
    question: 'Can I predict specific enchantments?',
    answer:
      'Enchantment outcomes are random but follow probability distributions based on enchantment level, item type, and enchantment rarity. Higher levels increase probability of better enchantments. Specific enchantments have varying probabilities based on rarity. Use level 30 for best chances of rare enchantments, but outcomes remain random.',
  },
  {
    question: 'How much experience does enchanting cost?',
    answer:
      'Experience cost equals the enchantment level used. Level 1 costs 1 level, level 10 costs 10 levels, level 30 costs 30 levels. Higher levels cost more experience but provide better enchantments. Always use level 30 for maximum enchantment potential, but be prepared for high experience costs.',
  },
];

const relatedCalculators = [
  {
    name: 'Minecraft Farm Yield Calculator',
    slug: 'minecraft-farm-yield-calculator',
    description: 'Calculate crop yields, resource production rates, and farm efficiency for Minecraft farms based on farm size and crop type.',
  },
  {
    name: 'Minecraft Villager Trade Tracker',
    slug: 'minecraft-villager-trade-tracker',
    description: 'Track villager trades and calculate emerald profit per trade based on trade costs and item values.',
  },
  {
    name: 'Minecraft Smelter Fuel Efficiency',
    slug: 'minecraft-smelter-fuel-efficiency',
    description: 'Compare fuel efficiency for Minecraft smelting including coal, lava buckets, and cactus.',
  },
  {
    name: 'Minecraft Mob Farm XP Rate Calculator',
    slug: 'minecraft-mob-farm-xp-rate-calculator',
    description: 'Calculate XP generation rates for Minecraft mob farms based on mob spawn rates and kill rates.',
  },
  {
    name: 'Minecraft Redstone Signal Delay Calculator',
    slug: 'minecraft-redstone-signal-delay-calculator',
    description: 'Calculate redstone signal delay based on repeater count and tick delay.',
  },
  {
    name: 'Minecraft Nether Portal Linkage Estimator',
    slug: 'minecraft-nether-portal-linkage-estimator',
    description: 'Estimate nether portal linkage between overworld and nether coordinates.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/minecraft-enchanting-odds-predictor';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Minecraft Enchanting Odds Predictor', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Minecraft Enchanting Odds Predictor',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Predict enchanting odds and probabilities for Minecraft items based on enchantment levels, experience costs, and enchantment combinations.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'The Complete Guide to Minecraft Enchanting: Odds, Probabilities, and Strategy',
      description: 'A comprehensive guide to Minecraft enchanting odds, calculating probabilities, optimizing enchanting strategies, and maximizing enchantment quality.',
      author: {
        '@type': 'Organization',
        name: 'MegaCalc Hub Gaming Team',
      },
      datePublished: '2025-01-24',
      image: 'https://mycalculating.com/assets/minecraft-enchanting-odds-predictor.png',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': baseUrl,
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const itemType = values.itemType;
  const enchantmentLevel = values.enchantmentLevel;
  const targetEnchantment = values.targetEnchantment || '';
  const bookshelfCount = values.bookshelfCount ?? 15;
  const previousEnchantments = values.previousEnchantments ?? 0;

  // Maximum enchantment level based on bookshelves
  const maxEnchantmentLevel = bookshelfCount >= 15 ? 30 : Math.min(8 + Math.floor(bookshelfCount * 1.5), 30);

  // Available enchantments vary by item type (simplified estimate)
  const availableEnchantmentsByType: Record<string, number> = {
    sword: 8,
    bow: 6,
    armor: 10,
    tool: 7,
    book: 15, // Books can receive any enchantment
  };
  const availableEnchantments = availableEnchantmentsByType[itemType] || 8;

  // Experience cost equals enchantment level
  const experienceCost = enchantmentLevel;

  // Base probability calculation (simplified)
  // Higher levels have better chances of good enchantments
  // Probability increases with level, but specific enchantments have varying rarities
  const levelFactor = enchantmentLevel / 30; // Normalize to 0-1
  const baseProbability = levelFactor * 0.5 + 0.1; // Base probability increases with level

  // Probability of target enchantment (if specified)
  // This is a simplified estimate - actual probabilities vary by enchantment rarity
  let probabilityOfTarget = 0;
  if (targetEnchantment) {
    // Simplified: assume target enchantment has moderate rarity
    // Actual probability depends on specific enchantment rarity
    probabilityOfTarget = (baseProbability / availableEnchantments) * (1 - previousEnchantments * 0.1);
    probabilityOfTarget = Math.max(0.01, Math.min(probabilityOfTarget, 0.5)); // Cap between 1% and 50%
  }

  // Expected number of enchantments (typically 1-3 per enchantment)
  const expectedEnchantments = Math.min(3, Math.max(1, Math.floor(levelFactor * 3) + 1));

  // Success probability (probability of getting good enchantments)
  const successProbability = Math.min(0.95, baseProbability * (1 + levelFactor));

  let status: ResultPayload['status'] = 'moderate-odds';
  let interpretation = 'Your enchanting odds have been calculated based on item type, enchantment level, and bookshelf count.';

  if (successProbability >= 0.7) {
    status = 'excellent-odds';
    interpretation = `Excellent odds! You have a ${(successProbability * 100).toFixed(1)}% chance of getting good enchantments at level ${enchantmentLevel}. This is very high probability for successful enchanting.`;
  } else if (successProbability >= 0.5) {
    status = 'good-odds';
    interpretation = `Good odds. You have a ${(successProbability * 100).toFixed(1)}% chance of getting good enchantments at level ${enchantmentLevel}. This is above average probability for successful enchanting.`;
  } else if (successProbability >= 0.3) {
    status = 'moderate-odds';
    interpretation = `Moderate odds. You have a ${(successProbability * 100).toFixed(1)}% chance of getting good enchantments at level ${enchantmentLevel}. Consider using higher levels or more bookshelves for better odds.`;
  } else {
    status = 'low-odds';
    interpretation = `Lower odds. You have a ${(successProbability * 100).toFixed(1)}% chance of getting good enchantments at level ${enchantmentLevel}. Use level 30 with 15 bookshelves for maximum odds.`;
  }

  const recommendations = [
    `Enchantment Level: ${enchantmentLevel} (max available: ${maxEnchantmentLevel}). ${enchantmentLevel >= 30 ? 'Maximum level - excellent for best enchantments.' : enchantmentLevel >= 20 ? 'High level - good for quality enchantments.' : enchantmentLevel >= 10 ? 'Moderate level - decent enchantments.' : 'Lower level - consider using higher levels for better enchantments.'}`,
    `Bookshelf Count: ${bookshelfCount}/15. ${bookshelfCount >= 15 ? 'Maximum bookshelves - access to level 30 enchantments.' : bookshelfCount >= 10 ? 'Good bookshelf count - high max level.' : bookshelfCount >= 5 ? 'Moderate bookshelf count - decent max level.' : 'Low bookshelf count - add more bookshelves for higher max level (need 15 for level 30).'}`,
    `Experience Cost: ${experienceCost} levels. ${experienceCost >= 30 ? 'High cost - prepare sufficient experience.' : experienceCost >= 20 ? 'Moderate cost - reasonable experience requirement.' : 'Lower cost - affordable experience requirement.'}`,
    `Expected Enchantments: ${expectedEnchantments} enchantments per enchantment. ${expectedEnchantments >= 3 ? 'High expected enchantments - excellent value.' : expectedEnchantments >= 2 ? 'Moderate expected enchantments - good value.' : 'Lower expected enchantments - consider higher levels.'}`,
    `Success Probability: ${(successProbability * 100).toFixed(1)}%. ${successProbability >= 0.7 ? 'Excellent probability - very likely to get good enchantments.' : successProbability >= 0.5 ? 'Good probability - likely to get good enchantments.' : successProbability >= 0.3 ? 'Moderate probability - some chance of good enchantments.' : 'Lower probability - use level 30 for better odds.'}`,
  ];

  if (targetEnchantment) {
    recommendations.push(`Target Enchantment Probability: ${(probabilityOfTarget * 100).toFixed(1)}% chance of getting "${targetEnchantment}". ${probabilityOfTarget >= 0.2 ? 'Good probability for target enchantment.' : probabilityOfTarget >= 0.1 ? 'Moderate probability for target enchantment.' : 'Lower probability - target enchantment may be rare. Consider multiple attempts or higher levels.'}`);
  } else {
    recommendations.push('Target Enchantment: Not specified. Enter a specific enchantment name to calculate probability of obtaining that enchantment. Probabilities vary by enchantment rarity.');
  }

  if (enchantmentLevel < 30 || bookshelfCount < 15) {
    recommendations.push('Optimization: For maximum odds, use level 30 with 15 bookshelves. This provides access to all enchantments and maximum enchantment levels. Level 30 is essential for best enchantment results.');
  }

  const plan = [
    {
      label: 'This Session',
      detail: `Enchanting setup: Level ${enchantmentLevel}, ${bookshelfCount} bookshelves, ${(successProbability * 100).toFixed(1)}% success probability. ${enchantmentLevel >= 30 && bookshelfCount >= 15 ? 'Optimal setup - proceed with enchanting.' : 'Consider optimizing: use level 30 and ensure 15 bookshelves for maximum odds.'}`
    },
    {
      label: 'This Week',
      detail: 'Optimize enchanting: ensure 15 bookshelves for level 30 access, accumulate experience for level 30 enchanting, test different item types and levels, track enchantment results, and identify optimal enchanting strategies for different items.'
    },
    {
      label: 'Ongoing',
      detail: 'Continuously optimize enchanting: always use level 30 with 15 bookshelves for maximum odds, accumulate sufficient experience, understand enchantment probabilities and rarities, test different approaches, and track results to identify patterns and optimize strategies.'
    },
  ];

  return {
    itemType,
    enchantmentLevel,
    targetEnchantment,
    bookshelfCount,
    previousEnchantments,
    maxEnchantmentLevel,
    availableEnchantments,
    probabilityOfTarget,
    expectedEnchantments,
    experienceCost,
    successProbability,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MinecraftEnchantingOddsPredictor() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemType: undefined,
      enchantmentLevel: undefined,
      targetEnchantment: undefined,
      bookshelfCount: undefined,
      previousEnchantments: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="minecraft-enchanting-odds-predictor-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Minecraft Enchanting Odds Predictor
          </CardTitle>
          <CardDescription>Predict enchanting odds and probabilities for Minecraft items based on enchantment levels, experience costs, and enchantment combinations.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your enchanting information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => {
              try {
                setResult(calculateResult(values));
              } catch (error) {
                console.error('Error calculating result:', error);
                alert('An error occurred while calculating. Please check the console for details.');
              }
            }, (errors) => {
              console.log('Form validation errors:', errors);
            })} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="itemType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Item Type</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as 'sword' | 'bow' | 'armor' | 'tool' | 'book')}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Select item type</option>
                          <option value="sword">Sword</option>
                          <option value="bow">Bow</option>
                          <option value="armor">Armor</option>
                          <option value="tool">Tool</option>
                          <option value="book">Book</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="enchantmentLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enchantment Level (1-30)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetEnchantment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Enchantment (optional)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., Sharpness" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bookshelfCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bookshelf Count (0-15, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="previousEnchantments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Enchantments (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Predict Enchanting Odds
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See enchanting probabilities, expected enchantments, experience cost, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Success Probability</p>
                <p className="text-2xl font-semibold text-primary">{(result.successProbability * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Good enchantments</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Experience Cost</p>
                <p className="text-2xl font-semibold text-primary">{result.experienceCost}</p>
                <p className="text-xs text-muted-foreground">Levels required</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Enchantments</p>
                <p className="text-2xl font-semibold text-primary">{result.expectedEnchantments}</p>
                <p className="text-xs text-muted-foreground">Per enchantment</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            {result.targetEnchantment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground">Target Enchantment Probability</p>
                  <p className="text-xl font-semibold text-primary">{(result.probabilityOfTarget * 100).toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">{result.targetEnchantment}</p>
                </div>
                <div className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground">Max Enchantment Level</p>
                  <p className="text-xl font-semibold text-primary">{result.maxEnchantmentLevel}</p>
                  <p className="text-xs text-muted-foreground">With {result.bookshelfCount} bookshelves</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Action plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.plan.map((step) => (
                      <li key={step.label}>
                        <span className="font-semibold">{step.label}:</span> {step.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Maximum Enchantment Level</strong> = 15 bookshelves = 30 (maximum), 0 bookshelves = 8 (minimum), 1-14 bookshelves = 8 + (Bookshelves × 1.5). Bookshelves must be within 2 blocks of the enchanting table. Always use 15 bookshelves for maximum level 30.
          </p>
          <p>
            <strong>Experience Cost</strong> = Enchantment Level. The experience cost equals the enchantment level used. Level 1 costs 1 level, level 30 costs 30 levels. Higher levels cost more experience but provide better enchantments.
          </p>
          <p>
            <strong>Base Probability</strong> = (Enchantment Level / 30) × 0.5 + 0.1. This calculates base probability of getting good enchantments, increasing with enchantment level. Higher levels provide better probabilities of quality enchantments.
          </p>
          <p>
            <strong>Target Enchantment Probability</strong> = (Base Probability / Available Enchantments) × (1 - Previous Enchantments × 0.1). This estimates probability of obtaining a specific enchantment. Probabilities vary by enchantment rarity (common/uncommon/rare/very rare). Rarer enchantments have lower probabilities.
          </p>
          <p>
            <strong>Expected Enchantments</strong> = Min(3, Max(1, Floor((Level / 30) × 3) + 1)). This estimates how many enchantments you can expect per enchantment. Higher levels typically provide 2-3 enchantments, while lower levels provide 1-2 enchantments.
          </p>
          <p>
            <strong>Success Probability</strong> = Min(0.95, Base Probability × (1 + Level Factor)). This calculates probability of getting good enchantments overall. Higher levels and more bookshelves increase success probability. Level 30 with 15 bookshelves provides maximum success probability.
          </p>
          <p>These formulas help you understand enchanting odds, calculate probabilities, and optimize enchanting strategies. Remember that enchanting outcomes are random, but higher levels and more bookshelves improve probabilities of quality enchantments.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/category/gaming/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Complete Guide to Minecraft Enchanting: Odds, Probabilities, and Strategy</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Minecraft enchanting odds, enchantment probabilities, bookshelf mechanics, and optimization strategies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding Enchanting</a></li>
          <li><a href="#mechanics" className="hover:underline">Enchanting Mechanics</a></li>
          <li><a href="#bookshelves" className="hover:underline">Bookshelves and Maximum Levels</a></li>
          <li><a href="#probabilities" className="hover:underline">Enchantment Probabilities</a></li>
          <li><a href="#rarity" className="hover:underline">Enchantment Rarity and Odds</a></li>
          <li><a href="#optimization" className="hover:underline">Enchanting Optimization Strategies</a></li>
          <li><a href="#experience" className="hover:underline">Experience Management and Costs</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding Enchanting</h2>
        <p>Enchanting in Minecraft uses experience levels and lapis lazuli to add magical enchantments to items, improving their capabilities and effectiveness. Understanding enchanting odds helps players optimize enchanting strategies, maximize enchantment quality, and efficiently use experience resources.</p>

        <p>Enchanting works by offering 3 random enchantment options at the enchanting table, each at different experience levels. Players choose one option, spending experience levels and lapis lazuli to apply enchantments. Higher levels provide better enchantments but cost more experience. Understanding this system helps players make informed enchanting decisions.</p>

        <p>Enchantment probabilities depend on multiple factors: enchantment level (higher levels = better enchantments), item type (different items have different available enchantments), bookshelf count (more bookshelves = higher max level), and enchantment rarity (common/uncommon/rare/very rare). Understanding these factors helps players optimize enchanting strategies.</p>

        <p>Bookshelves around the enchanting table increase maximum enchantment level, up to level 30 with 15 bookshelves. Level 30 provides access to all enchantments and maximum enchantment levels. Always use 15 bookshelves for optimal enchanting results.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Enchanting Odds Matter</h3>
        <p>Enchanting odds matter because they help players: understand probability of getting desired enchantments, optimize enchanting strategies, efficiently use experience resources, and maximize enchantment quality. Understanding odds prevents wasted experience and helps players achieve optimal enchantment results.</p>

        <hr />

        <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Enchanting Mechanics</h2>

        <p>Enchanting mechanics involve the enchanting table, experience costs, lapis lazuli requirements, and random enchantment generation. Understanding mechanics helps players optimize enchanting strategies and maximize results.</p>

        <p>Enchanting table offers 3 random options at different levels. Each option shows potential enchantments (though exact outcomes are random). Players choose one option, spending experience and lapis lazuli. Higher level options provide better enchantments but cost more. Understanding options helps players make informed choices.</p>

        <p>Experience cost equals the enchantment level used. Level 1 costs 1 experience level, level 10 costs 10 levels, level 30 costs 30 levels. Higher levels cost more experience but provide better enchantments. Always prepare sufficient experience for desired enchantment levels.</p>

        <p>Lapis lazuli requirement equals the enchantment level used (same as experience cost). Lapis lazuli is consumed along with experience when enchanting. Ensure adequate lapis lazuli supply for enchanting sessions. Lapis lazuli is relatively common and easy to obtain.</p>

        <p>Random generation means exact enchantment outcomes are random, though probabilities follow distributions based on level, item type, and rarity. Higher levels increase probability of better enchantments, but outcomes remain random. Understanding randomness helps players set realistic expectations.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Enchanting Process</h3>
        <p>Enchanting process: Place item in enchanting table, choose enchantment level option, spend experience and lapis lazuli, receive random enchantments based on level and item type. Higher levels provide better enchantments but cost more. Always use level 30 for maximum enchantment potential.</p>

        <hr />

        <h2 id="bookshelves" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Bookshelves and Maximum Levels</h2>

        <p>Bookshelves around the enchanting table increase maximum enchantment level, enabling access to better enchantments. Understanding bookshelf mechanics helps players optimize enchanting setups and maximize enchantment potential.</p>

        <p>Bookshelf placement: Bookshelves must be within 2 blocks of the enchanting table, with air blocks between bookshelves and the table. Bookshelves can be placed in a 5×5 area around the table. Proper placement is essential for maximum level access.</p>

        <p>Maximum level calculation: 0 bookshelves = level 8 maximum, 1-14 bookshelves = 8 + (bookshelves × 1.5) maximum, 15 bookshelves = level 30 maximum. Always use 15 bookshelves for maximum level 30 access. Level 30 is essential for best enchantments.</p>

        <p>Bookshelf requirements: You need 15 bookshelves for maximum level (30). Bookshelves require 3 books each (9 paper + 1 leather per book). Total: 45 books (135 paper + 15 leather) for 15 bookshelves. This is a one-time investment that provides permanent access to level 30.</p>

        <p>Bookshelf benefits: More bookshelves = higher maximum level = better enchantments. Level 30 provides access to all enchantments and maximum enchantment levels. Always use 15 bookshelves for optimal enchanting results. Bookshelves are essential for maximum enchantment potential.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Bookshelf Setup</h3>
        <p>To set up bookshelves: Place 15 bookshelves within 2 blocks of enchanting table, ensure air blocks between bookshelves and table, arrange in 5×5 pattern around table, and verify level 30 is available. Proper setup provides maximum enchantment level access.</p>

        <hr />

        <h2 id="probabilities" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Enchantment Probabilities</h2>

        <p>Enchantment probabilities determine likelihood of obtaining specific enchantments or quality enchantments. Understanding probabilities helps players optimize enchanting strategies and set realistic expectations.</p>

        <p>Level-based probability: Higher enchantment levels increase probability of better enchantments. Level 30 provides maximum probability of quality enchantments. Lower levels have reduced probabilities. Always use level 30 for maximum probability of good enchantments.</p>

        <p>Item type probability: Different item types have different available enchantments. Swords have 8 possible enchantments, bows have 6, armor has 10, tools have 7, books can receive any enchantment (15+). Item type affects which enchantments are available and their probabilities.</p>

        <p>Rarity-based probability: Enchantments have rarities (common/uncommon/rare/very rare) that affect probabilities. Common enchantments have higher probabilities, while very rare enchantments have lower probabilities. Understanding rarity helps players set expectations for specific enchantments.</p>

        <p>Target enchantment probability: Probability of obtaining a specific enchantment depends on level, item type, enchantment rarity, and available enchantments. Higher levels increase probability, but rarer enchantments have lower probabilities. Use level 30 for best chances of rare enchantments.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Probability Optimization</h3>
        <p>To optimize probability: always use level 30 (maximum level), ensure 15 bookshelves (maximum access), understand enchantment rarities, use appropriate item types, and prepare for multiple attempts if targeting rare enchantments. Level 30 with 15 bookshelves provides maximum probability of quality enchantments.</p>

        <hr />

        <h2 id="rarity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Enchantment Rarity and Odds</h2>

        <p>Enchantments have different rarities that affect their probabilities. Understanding rarity helps players set expectations and optimize enchanting strategies.</p>

        <p>Common enchantments have higher probabilities and are easier to obtain. Examples include Efficiency, Unbreaking, Protection. Common enchantments appear frequently at moderate to high levels. These are reliable enchantments that provide consistent benefits.</p>

        <p>Uncommon enchantments have moderate probabilities. Examples include Sharpness, Power, Feather Falling. Uncommon enchantments appear regularly at higher levels. These provide significant benefits and are valuable additions to items.</p>

        <p>Rare enchantments have lower probabilities and are harder to obtain. Examples include Fortune, Looting, Mending. Rare enchantments appear less frequently, typically at high levels (20+). These are highly valuable enchantments that provide major benefits.</p>

        <p>Very rare enchantments have very low probabilities and are extremely difficult to obtain. Examples include Mending (on specific items), some combination enchantments. Very rare enchantments appear rarely, typically only at level 30. These are the most valuable enchantments.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Rarity Strategy</h3>
        <p>Rarity strategy: Use level 30 for best chances of rare/very rare enchantments, understand that rarer enchantments require more attempts, prepare for multiple enchanting sessions for rare targets, and balance expectations with enchantment rarity. Level 30 maximizes probability of all rarities.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Enchanting Optimization Strategies</h2>

        <p>Enchanting optimization strategies help players maximize enchantment quality and efficiently use experience resources. Multiple approaches can optimize enchanting results.</p>

        <p>Level optimization always uses level 30 for maximum enchantment potential. Level 30 provides access to all enchantments and maximum probabilities. Never use lower levels when level 30 is available. Level 30 is essential for optimal enchanting.</p>

        <p>Bookshelf optimization ensures 15 bookshelves for maximum level access. Bookshelves are a one-time investment that provides permanent access to level 30. Always use 15 bookshelves for optimal enchanting. Bookshelves are essential for maximum enchantment potential.</p>

        <p>Experience management accumulates sufficient experience for level 30 enchanting. Level 30 costs 30 experience levels, requiring significant experience accumulation. Plan enchanting sessions around experience availability. Efficient experience farming supports optimal enchanting.</p>

        <p>Item type selection chooses appropriate items for desired enchantments. Different items have different available enchantments. Select items that can receive desired enchantments. Books can receive any enchantment, making them versatile for enchanting.</p>

        <p>Multiple attempts strategy recognizes that rare enchantments may require multiple enchanting attempts. Enchanting outcomes are random, so rare enchantments may not appear on first attempt. Prepare for multiple attempts when targeting rare enchantments. Patience and persistence are key for rare enchantments.</p>

        <p>Combination strategy combines multiple enchantments through anvil combining. Enchant items separately, then combine on anvil for multiple enchantments. This allows creating items with multiple desired enchantments. Anvil combining is essential for optimal item enchantment.</p>

        <hr />

        <h2 id="experience" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Experience Management and Costs</h2>

        <p>Experience management is essential for enchanting, as higher levels cost more experience. Understanding experience costs helps players plan enchanting sessions and optimize resource usage.</p>

        <p>Experience cost equals enchantment level used. Level 1 costs 1 level, level 10 costs 10 levels, level 30 costs 30 levels. Higher levels cost significantly more experience. Always prepare sufficient experience for desired enchantment levels.</p>

        <p>Experience accumulation requires efficient experience farming. Mob farms, mining, trading, and other activities provide experience. Plan enchanting sessions around experience availability. Efficient experience farming supports optimal enchanting.</p>

        <p>Cost-benefit analysis evaluates experience cost vs. enchantment value. Level 30 costs 30 levels but provides maximum enchantment potential. Higher costs are justified by better enchantments. Always use level 30 for maximum value.</p>

        <p>Experience planning accumulates experience before enchanting sessions. Plan enchanting around experience availability. Don't enchant when experience is low. Accumulate sufficient experience for level 30 enchanting before starting.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Experience Strategy</h3>
        <p>Experience strategy: accumulate sufficient experience for level 30, plan enchanting sessions around experience availability, use efficient experience farming methods, and understand that level 30 costs are justified by maximum enchantment potential. Experience management is essential for optimal enchanting.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Minecraft enchanting odds depend on enchantment level, bookshelf count, item type, and enchantment rarity. Understanding odds helps players optimize enchanting strategies, maximize enchantment quality, and efficiently use experience resources.</p>

        <p>Key factors affecting odds include: enchantment level (higher = better), bookshelf count (15 = level 30 maximum), item type (affects available enchantments), and enchantment rarity (rarer = lower probability). Always use level 30 with 15 bookshelves for maximum odds.</p>

        <p>Optimization strategies include: level optimization (always use level 30), bookshelf optimization (15 bookshelves), experience management, item type selection, multiple attempts for rare enchantments, and combination strategies. By combining these strategies, players can maximize enchantment quality and optimize enchanting results.</p>

        <p>Remember that enchanting outcomes are random, but higher levels and more bookshelves improve probabilities of quality enchantments. Use calculators to estimate probabilities and plan enchanting strategies. With proper understanding and optimization, players can maximize enchanting odds and achieve optimal enchantment results effectively.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>This tool predicts Minecraft enchanting odds based on item type (Sword/Bow/Armor/Tool/Book), enchantment level (1-30), optional target enchantment name, optional bookshelf count (0-15, affects max level), and optional previous enchantments count.</p>
          <p>Outputs include maximum enchantment level (based on bookshelves), available enchantments (varies by item type), probability of target enchantment (if specified), expected number of enchantments per enchantment, experience cost (equals enchantment level), success probability (chance of good enchantments), status assessment (low-odds/moderate-odds/good-odds/excellent-odds), interpretation, recommendations, and action plan.</p>
          <p>Formulas use enchanting mechanics: Max Level = 15 bookshelves = 30, Experience Cost = Enchantment Level, Base Probability = (Level / 30) × 0.5 + 0.1, Target Probability = (Base / Available) × (1 - Previous × 0.1), Success Probability = Min(0.95, Base × (1 + Level Factor)). The guide covers enchanting mechanics, bookshelf mechanics, probabilities, rarity, optimization strategies, and experience management. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Minecraft enchanting odds calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
