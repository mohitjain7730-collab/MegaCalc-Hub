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
  eliminations: z.number({ invalid_type_error: 'Enter eliminations' }).min(0),
  placement: z.number({ invalid_type_error: 'Enter placement' }).min(1),
  survivalTime: z.number({ invalid_type_error: 'Enter survival time' }).min(0).optional(),
  damageDealt: z.number({ invalid_type_error: 'Enter damage dealt' }).min(0).optional(),
  firstBlood: z.boolean().optional(),
  victoryRoyale: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  eliminations: number;
  placement: number;
  survivalTime: number;
  damageDealt: number;
  firstBlood: boolean;
  victoryRoyale: boolean;
  eliminationXP: number;
  placementXP: number;
  survivalXP: number;
  damageXP: number;
  bonusXP: number;
  totalXP: number;
  xpBySource: {
    source: string;
    xp: number;
    percentage: number;
  }[];
  status: 'low-xp' | 'moderate-xp' | 'high-xp' | 'very-high-xp';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

// XP values (approximate, may vary by season)
const ELIMINATION_XP = 50; // per elimination
const FIRST_BLOOD_BONUS = 25;
const VICTORY_ROYALE_BONUS = 300;

const steps = [
  'Enter the number of eliminations you got in the match.',
  'Enter your final placement (1 = Victory Royale, 100 = first eliminated).',
  'Optionally enter survival time in minutes for survival bonus XP.',
  'Optionally enter total damage dealt for damage bonus XP.',
  'Check if you got first blood (first elimination of the match).',
  'Check if you got Victory Royale (won the match).',
  'Review total XP, breakdown by source, and optimization recommendations.',
];

const faqs = [
  {
    question: 'How is XP calculated in Fortnite?',
    answer:
      'XP in Fortnite is calculated from multiple sources: eliminations (typically 50 XP each), placement (higher placement = more XP), survival time (bonus XP for longer survival), damage dealt (bonus XP for high damage), and special bonuses (first blood, victory royale). Total XP is the sum of all sources.',
  },
  {
    question: 'How much XP do eliminations give?',
    answer:
      'Eliminations typically give 50 XP each, though this may vary by season and game mode. First blood (first elimination) may give additional bonus XP (typically 25 XP). Eliminations are a consistent source of XP and directly contribute to total match XP.',
  },
  {
    question: 'How does placement affect XP?',
    answer:
      'Placement significantly affects XP. Higher placements (lower numbers) give more XP. Victory Royale (1st place) gives the most placement XP, while early eliminations give minimal placement XP. Placement XP scales with final position, making survival important for XP gains.',
  },
  {
    question: 'What is survival time bonus XP?',
    answer:
      'Survival time bonus XP rewards players for staying alive longer in matches. Longer survival times provide additional XP bonuses. This encourages players to survive and play strategically rather than rushing into early eliminations. Survival time is typically measured in minutes.',
  },
  {
    question: 'How does damage dealt affect XP?',
    answer:
      'Damage dealt may provide bonus XP for high damage totals. This rewards aggressive play and combat engagement. High damage totals (typically 500+ damage) may provide additional XP bonuses. Damage XP encourages active gameplay and combat participation.',
  },
  {
    question: 'What are special XP bonuses?',
    answer:
      'Special XP bonuses include first blood (first elimination of the match, typically 25 XP bonus), victory royale (winning the match, typically 300 XP bonus), and other seasonal bonuses. These bonuses provide significant XP boosts for achieving specific milestones.',
  },
  {
    question: 'How can I maximize XP per match?',
    answer:
      'To maximize XP: get eliminations (50 XP each), achieve high placement (survive longer), deal high damage, get first blood bonus, win matches for victory royale bonus, and play consistently across multiple matches. Balance aggressive play (eliminations) with survival (placement) for optimal XP gains.',
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
    name: 'Fortnite Shield Potency Calculator',
    slug: 'fortnite-shield-potency-calculator',
    description: 'Calculate shield effectiveness, damage absorption, and total effective health based on shield type and amount.',
  },
  {
    name: 'Fortnite Victory Royale Probability Estimator',
    slug: 'fortnite-victory-royale-probability-estimator',
    description: 'Estimate your probability of winning a Victory Royale based on current placement, player count, and skill level.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/fortnite-xp-per-match-optimizer';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Fortnite XP Per Match Optimizer', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fortnite XP Per Match Optimizer',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Optimize XP gains per match by calculating XP from eliminations, placement, and match performance.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const eliminations = values.eliminations;
  const placement = values.placement;
  const survivalTime = values.survivalTime ?? 0;
  const damageDealt = values.damageDealt ?? 0;
  const firstBlood = values.firstBlood ?? false;
  const victoryRoyale = values.victoryRoyale ?? false;

  // Elimination XP
  const eliminationXP = eliminations * ELIMINATION_XP;

  // Placement XP (scaled based on placement, higher placement = more XP)
  // Formula: Base placement XP scales inversely with placement number
  // Top 10 gets significant bonus, top 3 gets very high bonus, victory gets maximum
  let placementXP = 0;
  if (placement === 1) {
    placementXP = 300; // Victory Royale
  } else if (placement <= 3) {
    placementXP = 200 - (placement - 1) * 20; // Top 3: 200, 180, 160
  } else if (placement <= 10) {
    placementXP = 150 - (placement - 3) * 10; // Top 10: 140-150
  } else if (placement <= 25) {
    placementXP = 100 - (placement - 10) * 2; // Top 25: 70-100
  } else {
    placementXP = Math.max(10, 70 - (placement - 25) * 1); // Others: 10-70
  }

  // Survival time XP (bonus for longer survival)
  const survivalXP = Math.floor(survivalTime * 5); // 5 XP per minute of survival

  // Damage XP (bonus for high damage)
  const damageXP = damageDealt >= 500 ? Math.floor(damageDealt / 10) : 0; // 1 XP per 10 damage if 500+ damage

  // Bonus XP
  let bonusXP = 0;
  if (firstBlood) {
    bonusXP += FIRST_BLOOD_BONUS;
  }
  if (victoryRoyale) {
    bonusXP += VICTORY_ROYALE_BONUS;
  }

  // Total XP
  const totalXP = eliminationXP + placementXP + survivalXP + damageXP + bonusXP;

  // XP breakdown by source
  const xpBySource = [
    { source: 'Eliminations', xp: eliminationXP, percentage: totalXP > 0 ? (eliminationXP / totalXP) * 100 : 0 },
    { source: 'Placement', xp: placementXP, percentage: totalXP > 0 ? (placementXP / totalXP) * 100 : 0 },
    { source: 'Survival Time', xp: survivalXP, percentage: totalXP > 0 ? (survivalXP / totalXP) * 100 : 0 },
    { source: 'Damage Dealt', xp: damageXP, percentage: totalXP > 0 ? (damageXP / totalXP) * 100 : 0 },
    { source: 'Bonuses', xp: bonusXP, percentage: totalXP > 0 ? (bonusXP / totalXP) * 100 : 0 },
  ].filter(item => item.xp > 0);

  let status: ResultPayload['status'] = 'moderate-xp';
  let interpretation = 'Your match XP has been calculated based on eliminations, placement, and performance factors.';

  if (totalXP >= 1000) {
    status = 'very-high-xp';
    interpretation = `Exceptional match! You earned ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP, which is very high. This represents excellent performance with high eliminations, top placement, and strong overall performance.`;
  } else if (totalXP >= 600) {
    status = 'high-xp';
    interpretation = `Great match! You earned ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP, which is high. This represents strong performance with good eliminations, solid placement, and good overall performance.`;
  } else if (totalXP >= 300) {
    status = 'moderate-xp';
    interpretation = `Decent match. You earned ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP, which is moderate. This represents average performance with some eliminations and reasonable placement.`;
  } else {
    status = 'low-xp';
    interpretation = `Lower XP match. You earned ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP. Consider focusing on eliminations, survival, and placement to increase XP gains in future matches.`;
  }

  const recommendations = [
    `Total XP: ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP. ${totalXP >= 1000 ? 'Exceptional performance - excellent XP gains!' : totalXP >= 600 ? 'Strong performance - good XP gains.' : totalXP >= 300 ? 'Decent performance - moderate XP gains.' : 'Lower performance - focus on improving eliminations and placement.'}`,
    `Elimination XP: ${eliminationXP} XP (${eliminations} eliminations). ${eliminations >= 10 ? 'Excellent eliminations - great XP source.' : eliminations >= 5 ? 'Good eliminations - solid XP source.' : eliminations >= 2 ? 'Moderate eliminations - could improve.' : 'Low eliminations - focus on getting more eliminations for better XP.'}`,
    `Placement XP: ${placementXP} XP (${placement === 1 ? 'Victory Royale' : `Place ${placement}`}). ${placement <= 3 ? 'Excellent placement - top tier XP.' : placement <= 10 ? 'Great placement - high XP.' : placement <= 25 ? 'Good placement - moderate XP.' : 'Lower placement - focus on survival for better placement XP.'}`,
  ];

  if (survivalTime > 0) {
    recommendations.push(`Survival Time XP: ${survivalXP} XP (${survivalTime} minutes). ${survivalTime >= 15 ? 'Long survival - excellent bonus XP.' : survivalTime >= 10 ? 'Good survival - solid bonus XP.' : 'Shorter survival - survive longer for more bonus XP.'}`);
  }

  if (damageDealt > 0) {
    recommendations.push(`Damage XP: ${damageXP} XP (${damageDealt} damage). ${damageDealt >= 1000 ? 'High damage - excellent bonus XP.' : damageDealt >= 500 ? 'Good damage - bonus XP earned.' : 'Lower damage - deal more damage (500+) for bonus XP.'}`);
  }

  if (bonusXP > 0) {
    recommendations.push(`Bonus XP: ${bonusXP} XP. ${victoryRoyale ? 'Victory Royale bonus earned - excellent!' : firstBlood ? 'First blood bonus earned - good start!' : 'No special bonuses - aim for first blood or victory for bonus XP.'}`);
  } else {
    recommendations.push(`Bonus XP: 0 XP. No special bonuses earned. Aim for first blood (first elimination) or Victory Royale for significant bonus XP.`);
  }

  // Optimization recommendations
  if (totalXP < 500) {
    recommendations.push('XP Optimization: To increase XP, focus on: getting more eliminations (50 XP each), achieving higher placement (survive longer), dealing high damage (500+ for bonus), getting first blood bonus, and winning matches for Victory Royale bonus.');
  } else {
    recommendations.push('XP Optimization: Strong performance! Continue focusing on eliminations, high placement, and special bonuses to maintain high XP gains. Consider playing consistently across multiple matches for maximum XP accumulation.');
  }

  const plan = [
    { 
      label: 'This Match', 
      detail: `Match performance: ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP earned. ${eliminations > 0 ? `${eliminations} eliminations, ` : ''}Place ${placement}. ${totalXP >= 600 ? 'Excellent performance - maintain this level.' : 'Focus on improving eliminations and placement for better XP.'}` 
    },
    { 
      label: 'This Week', 
      detail: 'Optimize XP gains: focus on getting eliminations (50 XP each), achieving high placements (survive longer), dealing high damage (500+ for bonus), getting first blood bonuses, and winning matches for Victory Royale bonuses. Play consistently across multiple matches.' 
    },
    { 
      label: 'Ongoing', 
      detail: 'Continuously optimize XP: balance aggressive play (eliminations) with survival (placement), deal high damage for bonuses, aim for special bonuses (first blood, victory), play consistently across matches, and track XP gains to identify improvement opportunities.' 
    },
  ];

  return {
    eliminations,
    placement,
    survivalTime,
    damageDealt,
    firstBlood,
    victoryRoyale,
    eliminationXP,
    placementXP,
    survivalXP,
    damageXP,
    bonusXP,
    totalXP,
    xpBySource,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function FortniteXPPerMatchOptimizer() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eliminations: undefined,
      placement: undefined,
      survivalTime: undefined,
      damageDealt: undefined,
      firstBlood: false,
      victoryRoyale: false,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="fortnite-xp-per-match-optimizer-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Fortnite XP Per Match Optimizer
          </CardTitle>
          <CardDescription>Optimize XP gains per match by calculating XP from eliminations, placement, and match performance.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your match performance</CardTitle>
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
                  name="eliminations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eliminations</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="placement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Placement (1 = Victory Royale)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="survivalTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Survival Time (minutes, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 12.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="damageDealt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Damage Dealt (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 750" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstBlood"
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
                      <FormLabel className="!mt-0">First Blood (First Elimination)</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="victoryRoyale"
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
                      <FormLabel className="!mt-0">Victory Royale (Won Match)</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate XP
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
            <CardDescription>See total XP, breakdown by source, and optimization recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-semibold text-primary">{result.totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">XP earned</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Elimination XP</p>
                <p className="text-2xl font-semibold text-primary">{result.eliminationXP}</p>
                <p className="text-xs text-muted-foreground">XP ({result.eliminations} elims)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Placement XP</p>
                <p className="text-2xl font-semibold text-primary">{result.placementXP}</p>
                <p className="text-xs text-muted-foreground">XP (Place {result.placement})</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ').replace('xp', 'XP')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            {result.xpBySource.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {result.xpBySource.map((source) => (
                  <div key={source.source} className="p-4 border rounded">
                    <p className="text-sm text-muted-foreground">{source.source}</p>
                    <p className="text-xl font-semibold text-primary">{source.xp}</p>
                    <p className="text-xs text-muted-foreground">{source.percentage.toFixed(1)}% of total</p>
                  </div>
                ))}
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
            <strong>Elimination XP</strong> = Eliminations × 50 XP per elimination. Each elimination typically gives 50 XP, making eliminations a consistent and significant XP source. First blood (first elimination) may provide additional bonus XP.
          </p>
          <p>
            <strong>Placement XP</strong> = Scaled based on final placement. Victory Royale (1st) = 300 XP, Top 3 = 180-200 XP, Top 10 = 140-150 XP, Top 25 = 70-100 XP, Others = 10-70 XP. Higher placements give significantly more XP, making survival important for XP gains.
          </p>
          <p>
            <strong>Survival Time XP</strong> = Survival Time (minutes) × 5 XP per minute. Longer survival times provide bonus XP, encouraging strategic play and survival. This rewards players who survive longer in matches.
          </p>
          <p>
            <strong>Damage XP</strong> = Damage Dealt / 10 (if damage ≥ 500). High damage totals (500+) provide bonus XP at a rate of 1 XP per 10 damage. This rewards aggressive play and combat engagement. Damage below 500 provides no bonus XP.
          </p>
          <p>
            <strong>Bonus XP</strong> = First Blood Bonus (25 XP) + Victory Royale Bonus (300 XP). Special bonuses provide significant XP boosts for achieving milestones. First blood rewards early engagement, while Victory Royale rewards match wins.
          </p>
          <p>
            <strong>Total XP</strong> = Elimination XP + Placement XP + Survival Time XP + Damage XP + Bonus XP. Total XP is the sum of all sources, representing complete match performance. Maximizing total XP requires balancing multiple factors.
          </p>
          <p>These formulas help you understand XP sources, calculate match XP, and optimize strategies for maximum XP gains. Balance eliminations, placement, survival, and damage for optimal XP accumulation.</p>
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
        <meta itemProp="name" content="The Complete Guide to Fortnite XP Optimization: Maximizing Experience Points Per Match" />
        <meta itemProp="description" content="A comprehensive guide to Fortnite XP calculation, optimization strategies, and maximizing experience points per match." />
        <meta itemProp="keywords" content="Fortnite XP, experience points, XP optimization, match performance, XP calculator" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Fortnite XP Optimization: Maximizing Experience Points Per Match</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Fortnite XP calculation, optimization strategies, and maximizing experience points per match.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding Fortnite XP</a></li>
          <li><a href="#sources" className="hover:underline">XP Sources and Calculation</a></li>
          <li><a href="#eliminations" className="hover:underline">Elimination XP and Strategies</a></li>
          <li><a href="#placement" className="hover:underline">Placement XP and Survival</a></li>
          <li><a href="#bonuses" className="hover:underline">Bonus XP and Special Rewards</a></li>
          <li><a href="#optimization" className="hover:underline">XP Optimization Strategies</a></li>
          <li><a href="#maximization" className="hover:underline">Maximizing XP Per Match</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding Fortnite XP</h2>
        <p>Experience Points (XP) in Fortnite are earned from multiple sources during matches, including eliminations, placement, survival time, damage dealt, and special bonuses. Understanding XP calculation helps players optimize strategies and maximize experience gains per match.</p>

        <p>XP is essential for progression, unlocking rewards, leveling up, and accessing content. Higher XP gains accelerate progression and unlock rewards faster. Optimizing XP per match helps players progress more efficiently and achieve goals sooner.</p>

        <p>XP sources vary in value and consistency. Eliminations provide consistent XP (typically 50 per elimination). Placement provides scaled XP based on final position. Survival time and damage provide bonus XP. Special bonuses provide significant XP boosts. Understanding these sources helps players prioritize activities.</p>

        <p>Total XP per match is the sum of all sources. Maximizing total XP requires balancing multiple factors: aggressive play for eliminations, survival for placement, strategic play for survival time, combat engagement for damage, and achieving milestones for bonuses. Optimal strategies balance these factors effectively.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why XP Optimization Matters</h3>
        <p>XP optimization matters because it accelerates progression, unlocks rewards faster, and improves overall game experience. Players who optimize XP gain levels and rewards more efficiently, making gameplay more rewarding and progression more satisfying.</p>

        <hr />

        <h2 id="sources" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">XP Sources and Calculation</h2>
        
        <p>Fortnite XP comes from multiple sources, each with different values and calculation methods. Understanding these sources helps players prioritize activities and optimize XP gains.</p>

        <p>Elimination XP is typically 50 XP per elimination, making it a consistent and significant XP source. Each elimination contributes directly to total XP. First blood (first elimination) may provide additional bonus XP (typically 25 XP). Eliminations are reliable XP sources that reward combat engagement.</p>

        <p>Placement XP scales with final position, with higher placements (lower numbers) providing more XP. Victory Royale (1st place) provides maximum placement XP (typically 300 XP). Top 3 provides very high XP (180-200 XP). Top 10 provides high XP (140-150 XP). Top 25 provides moderate XP (70-100 XP). Lower placements provide minimal XP (10-70 XP).</p>

        <p>Survival Time XP provides bonus XP for longer survival, typically 5 XP per minute of survival. This rewards strategic play and survival. Longer survival times accumulate more bonus XP, encouraging players to survive and play strategically rather than rushing into early eliminations.</p>

        <p>Damage XP provides bonus XP for high damage totals, typically 1 XP per 10 damage if damage exceeds 500. This rewards aggressive play and combat engagement. High damage totals (1000+) provide significant bonus XP. Damage below 500 provides no bonus XP.</p>

        <p>Special Bonuses provide significant XP boosts for achieving milestones. First Blood (first elimination) typically provides 25 XP bonus. Victory Royale (match win) typically provides 300 XP bonus. These bonuses significantly increase total XP for achieving specific goals.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">XP Calculation Example</h3>
        <p>Example: 8 eliminations, 5th place, 15 minutes survival, 800 damage, first blood, no victory. Elimination XP: 400 (8 × 50). Placement XP: 140 (top 10). Survival XP: 75 (15 × 5). Damage XP: 80 (800 / 10). Bonus XP: 25 (first blood). Total XP: 720 XP. This demonstrates how multiple sources combine for total XP.</p>

        <hr />

        <h2 id="eliminations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Elimination XP and Strategies</h2>
        
        <p>Eliminations are a primary XP source, providing consistent XP per elimination. Understanding elimination XP helps players prioritize combat engagement and optimize XP gains.</p>

        <p>Elimination value is typically 50 XP per elimination, making each elimination valuable for XP. Multiple eliminations accumulate significant XP. For example, 10 eliminations provide 500 XP, which is substantial. Eliminations are reliable XP sources that directly contribute to progression.</p>

        <p>First blood bonus provides additional XP for the first elimination of the match (typically 25 XP). This bonus rewards early engagement and aggressive play. Getting first blood provides both elimination XP and bonus XP, making it valuable for XP optimization.</p>

        <p>Elimination strategies focus on consistent combat engagement. Engage enemies regularly, prioritize eliminations, and maintain aggressive play. Balance elimination focus with survival to optimize both elimination XP and placement XP. Don't sacrifice survival entirely for eliminations, as placement XP is also valuable.</p>

        <p>Combat efficiency affects elimination rates. Improve aim, use effective weapons, engage at appropriate ranges, and maintain combat awareness. Higher elimination rates increase elimination XP gains. Practice and skill improvement directly increase XP potential.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Balancing Eliminations and Survival</h3>
        <p>Balance eliminations with survival: engage enemies for eliminations, but maintain survival for placement XP. Don't take unnecessary risks that result in early elimination. Optimal strategies balance aggressive play with strategic survival to maximize both elimination XP and placement XP.</p>

        <hr />

        <h2 id="placement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Placement XP and Survival</h2>
        
        <p>Placement XP scales significantly with final position, making survival important for XP gains. Understanding placement XP helps players prioritize survival and optimize strategies.</p>

        <p>Placement scaling provides more XP for higher placements. Victory Royale provides maximum XP (typically 300 XP). Top 3 provides very high XP (180-200 XP). Top 10 provides high XP (140-150 XP). Top 25 provides moderate XP (70-100 XP). Lower placements provide minimal XP (10-70 XP).</p>

        <p>Survival strategies focus on achieving higher placements. Play strategically, avoid unnecessary risks, use cover effectively, and maintain awareness. Higher placements provide significantly more XP, making survival valuable for XP optimization.</p>

        <p>Survival time bonus provides additional XP for longer survival (typically 5 XP per minute). This rewards strategic play and survival. Longer survival times accumulate more bonus XP, encouraging players to survive and play strategically.</p>

        <p>Balance survival with eliminations. Don't sacrifice eliminations entirely for survival, as elimination XP is also valuable. Optimal strategies balance survival with combat engagement to maximize both placement XP and elimination XP. Find the right balance for your playstyle.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Placement Optimization</h3>
        <p>To optimize placement XP: survive longer for higher placements, play strategically to avoid early elimination, use cover and positioning effectively, maintain awareness of threats, and balance survival with combat engagement. Higher placements provide significantly more XP than lower placements.</p>

        <hr />

        <h2 id="bonuses" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Bonus XP and Special Rewards</h2>
        
        <p>Special bonuses provide significant XP boosts for achieving milestones. Understanding bonus XP helps players prioritize goals and optimize XP gains.</p>

        <p>First Blood bonus provides additional XP for the first elimination of the match (typically 25 XP). This bonus rewards early engagement and aggressive play. Getting first blood provides both elimination XP and bonus XP, making it valuable for XP optimization. Aim for first blood when possible.</p>

        <p>Victory Royale bonus provides substantial XP for winning the match (typically 300 XP). This is the largest single XP source, making match wins extremely valuable for XP optimization. Winning matches provides both placement XP (300 XP for 1st) and victory bonus (300 XP), totaling 600 XP from placement alone.</p>

        <p>Other bonuses may include seasonal rewards, event bonuses, and special achievements. These vary by season and events. Stay informed about current bonuses and prioritize activities that provide bonus XP. Special bonuses can significantly increase total XP per match.</p>

        <p>Bonus prioritization helps optimize XP gains. Aim for first blood when possible for early bonus XP. Prioritize match wins for maximum bonus XP. Complete seasonal challenges and events for additional bonuses. Understanding available bonuses helps players optimize strategies.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Maximizing Bonuses</h3>
        <p>To maximize bonuses: engage early for first blood, prioritize match wins for victory bonus, complete seasonal challenges, participate in events, and stay informed about current bonuses. Special bonuses can significantly increase total XP, making them valuable for XP optimization.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">XP Optimization Strategies</h2>
        
        <p>XP optimization strategies help players maximize XP gains per match through balanced gameplay and strategic prioritization. Multiple approaches can optimize XP accumulation.</p>

        <p>Balanced playstyle combines aggressive play (eliminations) with strategic survival (placement). Engage enemies for elimination XP, but maintain survival for placement XP. Balance combat engagement with strategic positioning to maximize both XP sources. Don't sacrifice one entirely for the other.</p>

        <p>Early engagement builds elimination totals and may provide first blood bonus. Engage enemies early in matches to build elimination XP and potentially earn first blood bonus. Early eliminations provide XP and reduce competition, improving placement potential.</p>

        <p>Strategic survival achieves higher placements for placement XP. Play strategically to survive longer and achieve higher placements. Use cover effectively, maintain awareness, and avoid unnecessary risks. Higher placements provide significantly more XP than lower placements.</p>

        <p>Damage dealing provides bonus XP for high damage totals (500+). Engage in combat and deal damage to enemies to accumulate damage totals. High damage totals (1000+) provide significant bonus XP. Balance damage dealing with eliminations and survival for optimal XP.</p>

        <p>Milestone achievement provides special bonuses. Aim for first blood when possible. Prioritize match wins for victory bonus. Complete seasonal challenges and events. Special bonuses significantly increase total XP, making them valuable for optimization.</p>

        <p>Consistent play accumulates XP across multiple matches. Play regularly to accumulate XP over time. Consistent play provides more opportunities for XP gains and progression. Don't focus solely on single-match optimization; consider long-term XP accumulation.</p>

        <hr />

        <h2 id="maximization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Maximizing XP Per Match</h2>
        
        <p>Maximizing XP per match requires balancing multiple factors and optimizing all XP sources. Several strategies help achieve maximum XP gains.</p>

        <p>High elimination counts provide substantial elimination XP. Aim for 5-10+ eliminations per match for significant elimination XP (250-500+ XP). Engage enemies regularly, improve combat skills, and prioritize eliminations. High elimination counts directly increase total XP.</p>

        <p>Top placements provide maximum placement XP. Aim for top 10 placements for high placement XP (140-150+ XP). Top 3 placements provide very high XP (180-200+ XP). Victory Royale provides maximum placement XP (300 XP) plus victory bonus (300 XP). Prioritize survival for higher placements.</p>

        <p>Long survival times provide bonus survival XP. Survive 15+ minutes for significant survival bonus (75+ XP). Strategic play and survival extend match duration, accumulating survival bonus XP. Longer survival also improves placement, providing both survival XP and placement XP.</p>

        <p>High damage totals provide bonus damage XP. Deal 1000+ damage for significant damage bonus (100+ XP). Engage in combat regularly, use effective weapons, and maintain aggressive play. High damage totals provide bonus XP while also contributing to eliminations.</p>

        <p>Special bonuses significantly increase total XP. Get first blood for bonus XP (25 XP). Win matches for victory bonus (300 XP). Complete challenges and events for additional bonuses. Special bonuses can add 300+ XP to total match XP.</p>

        <p>Optimal match example: 10 eliminations (500 XP), Victory Royale (300 placement + 300 victory = 600 XP), 20 minutes survival (100 XP), 1200 damage (120 XP), first blood (25 XP). Total: 1,345 XP. This demonstrates maximum XP potential through balanced optimization.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Fortnite XP optimization requires understanding XP sources, balancing multiple factors, and optimizing strategies for maximum gains. XP comes from eliminations, placement, survival time, damage, and special bonuses, each contributing to total match XP.</p>

        <p>Optimal strategies balance aggressive play (eliminations, damage) with strategic survival (placement, survival time). Don't sacrifice one entirely for the other. Balance combat engagement with strategic positioning to maximize all XP sources.</p>

        <p>Maximizing XP per match requires high eliminations, top placements, long survival, high damage, and special bonuses. Aim for 5-10+ eliminations, top 10 placements, 15+ minutes survival, 1000+ damage, and special bonuses for maximum XP gains.</p>

        <p>Remember that XP optimization is about balance. Eliminations provide consistent XP, placement provides scaled XP, survival and damage provide bonuses, and special achievements provide significant boosts. Use calculators to track XP and optimize strategies. With proper understanding and optimization, players can maximize XP gains and accelerate progression effectively.</p>
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
          <p>This tool calculates Fortnite XP per match based on eliminations (50 XP each), final placement (scaled XP, 1st = 300 XP), optional survival time (5 XP per minute), optional damage dealt (1 XP per 10 damage if 500+), first blood bonus (25 XP), and victory royale bonus (300 XP).</p>
          <p>Outputs include elimination XP, placement XP, survival time XP, damage XP, bonus XP, total XP, XP breakdown by source with percentages, status assessment (low-xp/moderate-xp/high-xp/very-high-xp), interpretation, recommendations, and action plan.</p>
          <p>Formulas use standard XP calculations: Elimination XP = Eliminations × 50, Placement XP = Scaled by position (1st = 300, top 3 = 180-200, top 10 = 140-150, etc.), Survival XP = Minutes × 5, Damage XP = Damage / 10 (if 500+), Bonus XP = First Blood (25) + Victory (300), Total XP = Sum of all sources. The guide covers XP sources, elimination strategies, placement optimization, bonus rewards, optimization strategies, and maximization techniques. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Fortnite XP calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
