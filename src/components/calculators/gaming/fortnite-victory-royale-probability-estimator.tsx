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
  currentPlacement: z.number({ invalid_type_error: 'Enter current placement' }).min(1),
  totalPlayers: z.number({ invalid_type_error: 'Enter total players' }).min(1),
  skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], { invalid_type_error: 'Select skill level' }),
  eliminations: z.number({ invalid_type_error: 'Enter eliminations' }).min(0).optional(),
  hasGoodLoot: z.boolean().optional(),
  hasGoodPosition: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentPlacement: number;
  totalPlayers: number;
  skillLevel: string;
  eliminations: number;
  hasGoodLoot: boolean;
  hasGoodPosition: boolean;
  baseProbability: number;
  skillMultiplier: number;
  eliminationBonus: number;
  lootBonus: number;
  positionBonus: number;
  finalProbability: number;
  playersRemaining: number;
  placementRank: number;
  status: 'very-low' | 'low' | 'moderate' | 'good' | 'excellent';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your current placement (1 = Victory Royale, higher numbers = worse placement).',
  'Enter the total number of players in the match (typically 100 for standard matches).',
  'Select your skill level (Beginner, Intermediate, Advanced, or Expert).',
  'Optionally enter your current elimination count for bonus probability.',
  'Check if you have good loot (high rarity weapons, full shield, etc.).',
  'Check if you have good positioning (high ground, cover, etc.).',
  'Review your Victory Royale probability, factors affecting it, and recommendations.',
];

const faqs = [
  {
    question: 'How is Victory Royale probability calculated?',
    answer:
      'Victory Royale probability is calculated based on: current placement (higher placement = lower probability), remaining players (fewer players = higher probability), skill level (higher skill = higher probability), eliminations (more eliminations = higher probability), loot quality, and positioning. These factors combine to estimate win probability.',
  },
  {
    question: 'What is base probability?',
    answer:
      'Base probability = 1 / Remaining Players. This represents equal probability for all remaining players. For example, with 10 players remaining, base probability is 10% (1/10) if all players are equal skill. Base probability increases as players are eliminated.',
  },
  {
    question: 'How does skill level affect probability?',
    answer:
      'Skill level affects probability through multipliers: Beginner = 0.5x (lower probability), Intermediate = 1.0x (base probability), Advanced = 1.5x (higher probability), Expert = 2.0x (much higher probability). Higher skill levels significantly increase win probability by improving combat effectiveness and decision-making.',
  },
  {
    question: 'How do eliminations affect probability?',
    answer:
      'Eliminations provide bonus probability because they: reduce competition (fewer players = higher probability), demonstrate combat effectiveness, and improve positioning. Each elimination typically adds 1-2% bonus probability, with diminishing returns. More eliminations indicate better performance and higher win probability.',
  },
  {
    question: 'What is good loot and positioning?',
    answer:
      'Good loot includes: high rarity weapons (epic/legendary), full shield (100), healing items, and useful equipment. Good positioning includes: high ground advantage, cover, escape routes, and favorable final circle position. Both factors provide bonus probability by improving combat effectiveness and survival chances.',
  },
  {
    question: 'How accurate are probability estimates?',
    answer:
      'Probability estimates are approximations based on statistical factors. Actual outcomes depend on: player skill, luck, match dynamics, and unpredictable events. Estimates provide guidance but cannot guarantee outcomes. Use probabilities as tools for decision-making, not absolute predictions.',
  },
  {
    question: 'How can I increase my Victory Royale probability?',
    answer:
      'To increase probability: improve skill through practice, get eliminations to reduce competition, obtain good loot for combat effectiveness, maintain good positioning for advantages, survive longer to reduce player count, and make strategic decisions. Higher skill, better performance, and strategic play all increase win probability.',
  },
];

const relatedCalculators = [
  {
    name: 'Fortnite DPS Calculator',
    slug: 'fortnite-dps-calculator',
    description: 'Calculate damage per second (DPS) for Fortnite weapons based on damage, fire rate, and weapon stats.',
  },
  {
    name: 'Fortnite Build Material Cost Calculator',
    slug: 'fortnite-build-material-cost-calculator',
    description: 'Calculate the total material cost for building structures in Fortnite based on structure type, size, and material requirements.',
  },
  {
    name: 'Fortnite Storm Surge Timer',
    slug: 'fortnite-storm-surge-timer',
    description: 'Calculate storm surge timing, damage intervals, and survival requirements in Fortnite competitive matches.',
  },
  {
    name: 'Fortnite XP Per Match Optimizer',
    slug: 'fortnite-xp-per-match-optimizer',
    description: 'Optimize XP gains per match by calculating XP from eliminations, placement, and match performance.',
  },
  {
    name: 'Fortnite Shield Potency Calculator',
    slug: 'fortnite-shield-potency-calculator',
    description: 'Calculate shield effectiveness, damage absorption, and total effective health based on shield type and amount.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/fortnite-victory-royale-probability-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Fortnite Victory Royale Probability Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fortnite Victory Royale Probability Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate your probability of winning a Victory Royale based on current placement, player count, skill level, and match factors.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const currentPlacement = values.currentPlacement;
  const totalPlayers = values.totalPlayers;
  const skillLevel = values.skillLevel;
  const eliminations = values.eliminations ?? 0;
  const hasGoodLoot = values.hasGoodLoot ?? false;
  const hasGoodPosition = values.hasGoodPosition ?? false;

  // Players remaining
  const playersRemaining = totalPlayers - currentPlacement + 1;

  // Base probability (equal chance for all players)
  const baseProbability = playersRemaining > 0 ? (1 / playersRemaining) * 100 : 0;

  // Skill multipliers
  const skillMultipliers: Record<string, number> = {
    beginner: 0.5,
    intermediate: 1.0,
    advanced: 1.5,
    expert: 2.0,
  };
  const skillMultiplier = skillMultipliers[skillLevel] || 1.0;

  // Elimination bonus (diminishing returns)
  const eliminationBonus = Math.min(eliminations * 1.5, 15); // Max 15% bonus

  // Loot bonus
  const lootBonus = hasGoodLoot ? 5 : 0;

  // Position bonus
  const positionBonus = hasGoodPosition ? 5 : 0;

  // Final probability calculation
  let finalProbability = baseProbability * skillMultiplier + eliminationBonus + lootBonus + positionBonus;
  finalProbability = Math.min(finalProbability, 95); // Cap at 95% (never 100% due to unpredictability)
  finalProbability = Math.max(finalProbability, 0.1); // Minimum 0.1%

  // Placement rank (percentage rank)
  const placementRank = totalPlayers > 0 ? ((totalPlayers - currentPlacement + 1) / totalPlayers) * 100 : 0;

  let status: ResultPayload['status'] = 'moderate';
  let interpretation = 'Your Victory Royale probability has been calculated based on placement, skill level, and match factors.';

  if (finalProbability >= 50) {
    status = 'excellent';
    interpretation = `Excellent probability! You have a ${finalProbability.toFixed(1)}% chance of Victory Royale. This is very high probability, indicating strong position, skill, and advantages.`;
  } else if (finalProbability >= 25) {
    status = 'good';
    interpretation = `Good probability. You have a ${finalProbability.toFixed(1)}% chance of Victory Royale. This is above average probability, indicating decent position and advantages.`;
  } else if (finalProbability >= 10) {
    status = 'moderate';
    interpretation = `Moderate probability. You have a ${finalProbability.toFixed(1)}% chance of Victory Royale. This is average probability, indicating room for improvement in position, skill, or advantages.`;
  } else if (finalProbability >= 5) {
    status = 'low';
    interpretation = `Lower probability. You have a ${finalProbability.toFixed(1)}% chance of Victory Royale. Focus on improving position, getting eliminations, and obtaining better loot to increase probability.`;
  } else {
    status = 'very-low';
    interpretation = `Very low probability. You have a ${finalProbability.toFixed(1)}% chance of Victory Royale. Significant improvements needed in skill, position, loot, or eliminations to increase probability.`;
  }

  const recommendations = [
    `Base Probability: ${baseProbability.toFixed(1)}% (${playersRemaining} players remaining). ${playersRemaining <= 10 ? 'Late game - high base probability.' : playersRemaining <= 25 ? 'Mid game - moderate base probability.' : 'Early game - lower base probability.'}`,
    `Skill Level: ${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} (${skillMultiplier}x multiplier). ${skillMultiplier >= 1.5 ? 'High skill - significant probability boost.' : skillMultiplier >= 1.0 ? 'Moderate skill - standard probability.' : 'Lower skill - reduced probability. Practice to improve.'}`,
    `Elimination Bonus: +${eliminationBonus.toFixed(1)}% (${eliminations} eliminations). ${eliminations >= 10 ? 'Excellent eliminations - strong bonus.' : eliminations >= 5 ? 'Good eliminations - solid bonus.' : eliminations >= 2 ? 'Moderate eliminations - some bonus.' : 'Low eliminations - focus on getting eliminations for bonus.'}`,
    `Loot Bonus: +${lootBonus.toFixed(1)}%. ${hasGoodLoot ? 'Good loot provides combat advantage.' : 'Consider obtaining better loot for combat advantage.'}`,
    `Position Bonus: +${positionBonus.toFixed(1)}%. ${hasGoodPosition ? 'Good positioning provides tactical advantage.' : 'Consider improving positioning for tactical advantage.'}`,
    `Final Probability: ${finalProbability.toFixed(1)}%. ${finalProbability >= 50 ? 'Excellent probability - very high chance of Victory Royale.' : finalProbability >= 25 ? 'Good probability - above average chance.' : finalProbability >= 10 ? 'Moderate probability - average chance.' : 'Lower probability - focus on improvements.'}`,
  ];

  if (finalProbability < 25) {
    recommendations.push('Probability Improvement: To increase probability, focus on: improving skill through practice, getting more eliminations, obtaining better loot, improving positioning, and surviving longer to reduce player count.');
  }

  const plan = [
    { 
      label: 'This Match', 
      detail: `Current probability: ${finalProbability.toFixed(1)}% (${playersRemaining} players remaining). ${finalProbability >= 25 ? 'Good probability - maintain advantages and play strategically.' : 'Lower probability - focus on improvements: get eliminations, improve loot, better positioning.'}` 
    },
    { 
      label: 'This Week', 
      detail: 'Improve win probability: practice to improve skill level, focus on getting eliminations, prioritize good loot collection, maintain good positioning, and make strategic decisions. Track probability factors to identify improvement areas.' 
    },
    { 
      label: 'Ongoing', 
      detail: 'Continuously optimize Victory Royale probability: improve skill through practice and learning, get eliminations to reduce competition, obtain and maintain good loot, prioritize good positioning, survive longer to reduce player count, and make strategic decisions based on probability factors.' 
    },
  ];

  return {
    currentPlacement,
    totalPlayers,
    skillLevel,
    eliminations,
    hasGoodLoot,
    hasGoodPosition,
    baseProbability,
    skillMultiplier,
    eliminationBonus,
    lootBonus,
    positionBonus,
    finalProbability,
    playersRemaining,
    placementRank,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function FortniteVictoryRoyaleProbabilityEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPlacement: undefined,
      totalPlayers: undefined,
      skillLevel: undefined,
      eliminations: undefined,
      hasGoodLoot: false,
      hasGoodPosition: false,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="fortnite-victory-royale-probability-estimator-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Fortnite Victory Royale Probability Estimator
          </CardTitle>
          <CardDescription>Estimate your probability of winning a Victory Royale based on current placement, player count, skill level, and match factors.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your match information</CardTitle>
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
                  name="currentPlacement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Placement (1 = Victory Royale)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalPlayers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Players (typically 100)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill Level</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert')}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Select skill level</option>
                          <option value="beginner">Beginner (0.5x multiplier)</option>
                          <option value="intermediate">Intermediate (1.0x multiplier)</option>
                          <option value="advanced">Advanced (1.5x multiplier)</option>
                          <option value="expert">Expert (2.0x multiplier)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="eliminations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eliminations (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasGoodLoot"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Has Good Loot (High rarity weapons, full shield, etc.)</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hasGoodPosition"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4"
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">Has Good Positioning (High ground, cover, etc.)</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate Victory Royale Probability
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
            <CardDescription>See Victory Royale probability, contributing factors, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Final Probability</p>
                <p className="text-2xl font-semibold text-primary">{result.finalProbability.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Victory Royale chance</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Base Probability</p>
                <p className="text-2xl font-semibold text-primary">{result.baseProbability.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Equal chance</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Players Remaining</p>
                <p className="text-2xl font-semibold text-primary">{result.playersRemaining}</p>
                <p className="text-xs text-muted-foreground">Players left</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Skill Multiplier</p>
                <p className="text-xl font-semibold text-primary">{result.skillMultiplier}x</p>
                <p className="text-xs text-muted-foreground">{result.skillLevel}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Elimination Bonus</p>
                <p className="text-xl font-semibold text-primary">+{result.eliminationBonus.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{result.eliminations} elims</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loot Bonus</p>
                <p className="text-xl font-semibold text-primary">+{result.lootBonus.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{result.hasGoodLoot ? 'Yes' : 'No'}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Position Bonus</p>
                <p className="text-xl font-semibold text-primary">+{result.positionBonus.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{result.hasGoodPosition ? 'Yes' : 'No'}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Placement Rank</p>
                <p className="text-xl font-semibold text-primary">{result.placementRank.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Top percentile</p>
              </div>
            </div>
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
            <strong>Base Probability</strong> = (1 / Players Remaining) × 100. This represents equal probability for all remaining players if all players are equal skill. Base probability increases as players are eliminated. For example, with 10 players remaining, base probability is 10%.
          </p>
          <p>
            <strong>Players Remaining</strong> = Total Players - Current Placement + 1. This calculates how many players are still alive. Fewer remaining players mean higher base probability, as there are fewer competitors.
          </p>
          <p>
            <strong>Skill Multiplier</strong> = Multiplier based on skill level (Beginner = 0.5x, Intermediate = 1.0x, Advanced = 1.5x, Expert = 2.0x). Higher skill levels significantly increase probability by improving combat effectiveness and decision-making.
          </p>
          <p>
            <strong>Elimination Bonus</strong> = Min(Eliminations × 1.5, 15). Each elimination adds 1.5% bonus probability, capped at 15% maximum. Eliminations reduce competition and demonstrate combat effectiveness, increasing win probability.
          </p>
          <p>
            <strong>Loot Bonus</strong> = 5% if has good loot, 0% otherwise. Good loot (high rarity weapons, full shield, etc.) provides combat advantages, increasing win probability.
          </p>
          <p>
            <strong>Position Bonus</strong> = 5% if has good positioning, 0% otherwise. Good positioning (high ground, cover, etc.) provides tactical advantages, increasing win probability.
          </p>
          <p>
            <strong>Final Probability</strong> = (Base Probability × Skill Multiplier) + Elimination Bonus + Loot Bonus + Position Bonus, capped between 0.1% and 95%. This combines all factors to estimate Victory Royale probability. Higher values indicate better chances of winning.
          </p>
          <p>These formulas help you understand Victory Royale probability, identify factors affecting it, and optimize strategies to increase win chances. Remember that probabilities are estimates based on statistical factors, and actual outcomes depend on many unpredictable variables.</p>
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
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="The Complete Guide to Fortnite Victory Royale Probability: Understanding Win Chances and Factors" />
        <meta itemProp="description" content="A comprehensive guide to Fortnite Victory Royale probability estimation, factors affecting win chances, and optimization strategies." />
        <meta itemProp="keywords" content="Fortnite Victory Royale, win probability, victory chance, match factors, skill level" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Fortnite Victory Royale Probability: Understanding Win Chances and Factors</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Fortnite Victory Royale probability estimation, factors affecting win chances, and optimization strategies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding Victory Royale Probability</a></li>
          <li><a href="#factors" className="hover:underline">Factors Affecting Win Probability</a></li>
          <li><a href="#placement" className="hover:underline">Placement and Player Count</a></li>
          <li><a href="#skill" className="hover:underline">Skill Level and Multipliers</a></li>
          <li><a href="#performance" className="hover:underline">Performance Factors and Bonuses</a></li>
          <li><a href="#optimization" className="hover:underline">Probability Optimization Strategies</a></li>
          <li><a href="#strategies" className="hover:underline">Victory Royale Strategies</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding Victory Royale Probability</h2>
        <p>Victory Royale probability estimates your chance of winning a Fortnite match based on current placement, remaining players, skill level, and match factors. Understanding probability helps players evaluate win chances, identify improvement areas, and optimize strategies for Victory Royale.</p>

        <p>Probability is calculated from multiple factors: base probability (equal chance for all players), skill multipliers (higher skill = higher probability), elimination bonuses (more eliminations = higher probability), loot bonuses (good loot = higher probability), and position bonuses (good positioning = higher probability). These factors combine to estimate win chances.</p>

        <p>Base probability represents equal chance for all remaining players if all players are equal skill. Base probability = 1 / Players Remaining. For example, with 10 players remaining, base probability is 10% if all players are equal. Base probability increases as players are eliminated, naturally increasing win chances.</p>

        <p>Skill and performance factors modify base probability. Higher skill levels multiply base probability, while eliminations, good loot, and good positioning add bonus probability. Understanding these factors helps players identify how to increase win probability and optimize strategies.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Probability Matters</h3>
        <p>Probability matters because it helps players: evaluate win chances realistically, identify factors affecting chances, optimize strategies to increase probability, set expectations based on current situation, and make informed decisions about risk and aggression. Understanding probability improves decision-making and strategic play.</p>

        <hr />

        <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Win Probability</h2>
        
        <p>Multiple factors affect Victory Royale probability, each contributing to overall win chances. Understanding these factors helps players identify improvement areas and optimize strategies.</p>

        <p>Placement and player count determine base probability. Higher placement (lower number) and fewer remaining players increase base probability. For example, being in top 10 with 10 players remaining provides 10% base probability, while being in top 5 with 5 players remaining provides 20% base probability. Placement directly affects win chances.</p>

        <p>Skill level multiplies base probability through skill multipliers. Beginner = 0.5x (reduces probability), Intermediate = 1.0x (base probability), Advanced = 1.5x (increases probability), Expert = 2.0x (doubles probability). Higher skill levels significantly increase win probability by improving combat effectiveness and decision-making.</p>

        <p>Eliminations provide bonus probability by reducing competition and demonstrating combat effectiveness. Each elimination typically adds 1-2% bonus probability, with diminishing returns. More eliminations indicate better performance and higher win probability. Eliminations reduce player count, naturally increasing base probability.</p>

        <p>Loot quality affects probability through combat advantages. Good loot (high rarity weapons, full shield, etc.) provides 5% bonus probability. Good loot improves combat effectiveness, increasing win chances. Prioritize good loot collection for probability improvements.</p>

        <p>Positioning affects probability through tactical advantages. Good positioning (high ground, cover, etc.) provides 5% bonus probability. Good positioning provides tactical advantages, increasing win chances. Prioritize good positioning for probability improvements.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Factor Prioritization</h3>
        <p>Prioritize factors based on impact: Skill level has the highest impact (multiplies base probability), followed by eliminations (reduces competition), then loot and positioning (provide combat/tactical advantages). Focus on improving high-impact factors for maximum probability increases.</p>

        <hr />

        <h2 id="placement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Placement and Player Count</h2>
        
        <p>Placement and player count directly affect base probability, which forms the foundation for all probability calculations. Understanding this relationship helps players evaluate win chances and plan strategies.</p>

        <p>Base probability formula: Base Probability = (1 / Players Remaining) × 100. This represents equal chance for all remaining players if all players are equal skill. Base probability increases as players are eliminated, naturally increasing win chances. Fewer remaining players mean higher base probability.</p>

        <p>Placement impact: Higher placement (lower number) means fewer players remaining, increasing base probability. For example, placement 10 with 100 players = 91 players remaining = 1.1% base probability. Placement 10 with 10 players = 1 player remaining = 100% base probability (you won). Placement directly affects remaining players and base probability.</p>

        <p>Player count reduction: As players are eliminated, remaining player count decreases, increasing base probability for all remaining players. This natural progression means win probability increases as match progresses, assuming you survive. Survival is essential for probability increases.</p>

        <p>Late game advantage: Late game (few players remaining) provides higher base probability. For example, with 5 players remaining, base probability is 20% if all players are equal skill. Late game positioning and survival become critical for Victory Royale chances.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Placement Strategy</h3>
        <p>Placement strategy: Survive longer to reduce player count and increase base probability. Prioritize survival in early/mid game to reach late game with higher probability. Balance survival with eliminations and positioning. Late game survival is critical for Victory Royale chances.</p>

        <hr />

        <h2 id="skill" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Skill Level and Multipliers</h2>
        
        <p>Skill level significantly affects Victory Royale probability through multipliers that modify base probability. Understanding skill impact helps players evaluate win chances and identify improvement needs.</p>

        <p>Skill multipliers: Beginner = 0.5x (reduces probability by 50%), Intermediate = 1.0x (base probability), Advanced = 1.5x (increases probability by 50%), Expert = 2.0x (doubles probability). Higher skill levels dramatically increase win probability by improving combat effectiveness, decision-making, and strategic play.</p>

        <p>Skill impact examples: With 10% base probability, Beginner = 5% final probability, Intermediate = 10% final probability, Advanced = 15% final probability, Expert = 20% final probability. Skill level has the highest impact on probability, making skill improvement the most effective way to increase win chances.</p>

        <p>Skill development: Improving skill through practice, learning, and experience increases skill level and probability multipliers. Focus on: aim and combat skills, building and editing, game sense and decision-making, positioning and rotation, and strategic thinking. Skill improvement provides the largest probability increases.</p>

        <p>Skill assessment: Honestly assess your skill level to get accurate probability estimates. Beginner = new to game or low performance, Intermediate = average performance, Advanced = above average performance, Expert = top tier performance. Accurate assessment helps set realistic expectations and identify improvement areas.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Skill Improvement</h3>
        <p>To improve skill: practice regularly, learn from better players, analyze your gameplay, focus on weak areas, and set improvement goals. Skill improvement is the most effective way to increase Victory Royale probability, providing the largest probability multipliers.</p>

        <hr />

        <h2 id="performance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Performance Factors and Bonuses</h2>
        
        <p>Performance factors provide bonus probability that adds to base probability, increasing win chances. Understanding performance factors helps players identify ways to increase probability and optimize strategies.</p>

        <p>Elimination bonus: Each elimination adds 1.5% bonus probability, capped at 15% maximum. Eliminations reduce competition (fewer players = higher base probability) and demonstrate combat effectiveness. More eliminations indicate better performance and higher win probability. Focus on getting eliminations to increase probability.</p>

        <p>Loot bonus: Good loot (high rarity weapons, full shield, etc.) provides 5% bonus probability. Good loot improves combat effectiveness, increasing win chances. Prioritize good loot collection for probability improvements. Balance loot collection with survival and positioning.</p>

        <p>Position bonus: Good positioning (high ground, cover, etc.) provides 5% bonus probability. Good positioning provides tactical advantages, increasing win chances. Prioritize good positioning for probability improvements. Balance positioning with other factors.</p>

        <p>Bonus combination: Multiple bonuses combine additively. For example, 5 eliminations (7.5% bonus) + good loot (5% bonus) + good position (5% bonus) = 17.5% total bonus. Combining bonuses maximizes probability increases. Focus on achieving multiple bonuses for maximum probability.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Performance Optimization</h3>
        <p>To optimize performance: get eliminations to reduce competition and demonstrate effectiveness, obtain good loot for combat advantages, maintain good positioning for tactical advantages, and combine multiple bonuses for maximum probability increases. Performance optimization provides significant probability improvements.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Probability Optimization Strategies</h2>
        
        <p>Probability optimization strategies help players increase Victory Royale probability through skill improvement, performance enhancement, and strategic play. Multiple approaches can optimize probability and win chances.</p>

        <p>Skill improvement provides the largest probability increases through skill multipliers. Practice regularly, learn from better players, analyze gameplay, focus on weak areas, and set improvement goals. Skill improvement is the most effective way to increase probability, providing 0.5x to 2.0x multipliers.</p>

        <p>Elimination focus gets eliminations to reduce competition and add bonus probability. Engage enemies strategically, prioritize eliminations when safe, and balance eliminations with survival. Eliminations reduce player count (increasing base probability) and add bonus probability, providing dual benefits.</p>

        <p>Loot optimization obtains good loot for combat advantages and bonus probability. Prioritize high rarity weapons, maintain full shield, collect useful items, and balance loot collection with other activities. Good loot improves combat effectiveness and adds bonus probability.</p>

        <p>Position optimization maintains good positioning for tactical advantages and bonus probability. Prioritize high ground, use cover effectively, maintain escape routes, and balance positioning with other factors. Good positioning provides tactical advantages and adds bonus probability.</p>

        <p>Survival focus survives longer to reduce player count and increase base probability. Prioritize survival in early/mid game, avoid unnecessary risks, use cover effectively, and balance survival with other activities. Survival is essential for reaching late game with higher probability.</p>

        <hr />

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Victory Royale Strategies</h2>
        
        <p>Effective Victory Royale strategies combine probability optimization with tactical play to maximize win chances. Multiple approaches can optimize strategies based on situation and playstyle.</p>

        <p>Early game strategy focuses on survival and loot collection. Prioritize survival over eliminations, collect good loot, avoid unnecessary risks, and position for mid game. Early game survival is essential for reaching late game with higher probability.</p>

        <p>Mid game strategy focuses on eliminations and positioning. Engage enemies strategically, get eliminations to reduce competition, maintain good positioning, and balance aggression with survival. Mid game eliminations significantly increase probability by reducing competition.</p>

        <p>Late game strategy focuses on survival and positioning for final circle. Prioritize survival over eliminations, maintain good positioning, use cover effectively, and make strategic decisions. Late game survival and positioning are critical for Victory Royale.</p>

        <p>Adaptive strategy adjusts based on current probability and situation. If probability is high, play more conservatively to maintain advantages. If probability is low, take calculated risks to improve factors. Adapt strategy based on probability factors and match situation.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Strategic Planning</h3>
        <p>Plan strategies based on: current probability and factors, match situation and phase, available resources and advantages, and risk tolerance. Use probability estimates to inform strategic decisions. Balance probability optimization with tactical play for maximum win chances.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Victory Royale probability estimation helps players evaluate win chances, identify improvement areas, and optimize strategies. Probability is calculated from base probability, skill multipliers, and performance bonuses, combining to estimate win chances.</p>

        <p>Key factors affecting probability include: placement and player count (base probability), skill level (multipliers), eliminations (bonus and competition reduction), loot quality (combat advantages), and positioning (tactical advantages). Understanding these factors helps players identify how to increase probability.</p>

        <p>Optimization strategies include: skill improvement (largest impact), elimination focus, loot optimization, position optimization, and survival focus. By combining these strategies, players can maximize Victory Royale probability and win chances.</p>

        <p>Remember that probabilities are estimates based on statistical factors, and actual outcomes depend on many unpredictable variables. Use probability estimates as tools for decision-making and strategy optimization, not absolute predictions. With proper understanding and optimization, players can improve Victory Royale probability and win chances significantly.</p>
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
          <p>This tool estimates Fortnite Victory Royale probability based on current placement (1 = Victory Royale), total players (typically 100), skill level (Beginner/Intermediate/Advanced/Expert with multipliers), optional eliminations (bonus probability), good loot status (5% bonus), and good positioning status (5% bonus).</p>
          <p>Outputs include base probability (1 / players remaining), skill multiplier (0.5x-2.0x), elimination bonus (up to 15%), loot bonus (5% if good), position bonus (5% if good), final probability (combined, capped 0.1%-95%), players remaining, placement rank, status assessment (very-low/low/moderate/good/excellent), interpretation, recommendations, and action plan.</p>
          <p>Formulas use probability calculations: Base Probability = (1 / Players Remaining) × 100, Players Remaining = Total Players - Placement + 1, Skill Multiplier = 0.5x-2.0x based on level, Elimination Bonus = Min(Eliminations × 1.5, 15), Final Probability = (Base × Skill Multiplier) + Bonuses. The guide covers probability factors, placement impact, skill multipliers, performance bonuses, optimization strategies, and Victory Royale strategies. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Fortnite Victory Royale probability calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
