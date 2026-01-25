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
  commonDropRate: z.number({ invalid_type_error: 'Enter common drop rate' }).min(0).max(100),
  uncommonDropRate: z.number({ invalid_type_error: 'Enter uncommon drop rate' }).min(0).max(100),
  rareDropRate: z.number({ invalid_type_error: 'Enter rare drop rate' }).min(0).max(100),
  epicDropRate: z.number({ invalid_type_error: 'Enter epic drop rate' }).min(0).max(100),
  legendaryDropRate: z.number({ invalid_type_error: 'Enter legendary drop rate' }).min(0).max(100),
  numberOfOpens: z.number({ invalid_type_error: 'Enter number of opens' }).min(1),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  commonDropRate: number;
  uncommonDropRate: number;
  rareDropRate: number;
  epicDropRate: number;
  legendaryDropRate: number;
  numberOfOpens: number;
  totalDropRate: number;
  expectedCommon: number;
  expectedUncommon: number;
  expectedRare: number;
  expectedEpic: number;
  expectedLegendary: number;
  probabilityAtLeastOneLegendary: number;
  probabilityAtLeastOneEpic: number;
  probabilityAllCommon: number;
  dropDistribution: {
    rarity: string;
    expected: number;
    probability: number;
  }[];
  status: 'low-odds' | 'moderate-odds' | 'good-odds' | 'excellent-odds';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter the drop rate percentage for Common (Gray) items (0-100%).',
  'Enter the drop rate percentage for Uncommon (Green) items (0-100%).',
  'Enter the drop rate percentage for Rare (Blue) items (0-100%).',
  'Enter the drop rate percentage for Epic (Purple) items (0-100%).',
  'Enter the drop rate percentage for Legendary (Gold) items (0-100%).',
  'Enter the number of loot sources you plan to open.',
  'Review expected drops, probabilities, drop distribution, and recommendations.',
];

const faqs = [
  {
    question: 'What are loot drop rates in Fortnite?',
    answer:
      'Loot drop rates are the probability percentages for each rarity tier when opening loot sources (chests, supply drops, etc.). Common items have the highest drop rates (typically 60-70%), while Legendary items have the lowest (typically 1-5%). Drop rates vary by loot source type and game mode.',
  },
  {
    question: 'How do I find drop rates for different loot sources?',
    answer:
      'Drop rates can be found through: community testing and data collection, official patch notes (sometimes), third-party databases, and in-game observation. Drop rates may vary by loot source type (chests, supply drops, floor loot) and can change with game updates.',
  },
  {
    question: 'What is the expected number of drops?',
    answer:
      'Expected number of drops = Drop Rate × Number of Opens. For example, with 5% legendary drop rate and 20 opens, expected legendary drops = 1.0. This is the average number you can expect, though actual results will vary due to randomness.',
  },
  {
    question: 'What is the probability of getting at least one legendary?',
    answer:
      'Probability of at least one legendary = 1 - (1 - Legendary Drop Rate)^Number of Opens. For example, with 5% drop rate and 20 opens: 1 - (0.95)^20 ≈ 64.2%. This shows the chance of getting at least one legendary across multiple opens.',
  },
  {
    question: 'Do drop rates add up to 100%?',
    answer:
      'Not necessarily. Drop rates represent probabilities for each rarity tier, and they may not sum to exactly 100% due to rounding, additional rarity tiers, or special items. However, they should be close to 100% for standard loot sources. Always verify drop rate totals when possible.',
  },
  {
    question: 'How many opens do I need for a legendary?',
    answer:
      'The number of opens needed depends on drop rate. With 5% drop rate, you need approximately 20 opens for 64% chance, 30 opens for 79% chance, and 50 opens for 92% chance. Higher drop rates require fewer opens, while lower drop rates require more opens.',
  },
  {
    question: 'Are drop rates the same for all loot sources?',
    answer:
      'No, drop rates vary by loot source type. Supply drops typically have higher legendary rates than chests. Floor loot has different rates than chests. Special loot sources (vaults, bosses) may have guaranteed or higher rates for specific rarities. Always use appropriate drop rates for the loot source you\'re calculating.',
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

const baseUrl = 'https://mycalculating.com/category/gaming/fortnite-loot-drop-odds-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Fortnite Loot Drop Odds Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fortnite Loot Drop Odds Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate loot drop odds and probabilities for Fortnite chests, supply drops, and loot sources based on rarity tiers and drop rates.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const commonDropRate = values.commonDropRate;
  const uncommonDropRate = values.uncommonDropRate;
  const rareDropRate = values.rareDropRate;
  const epicDropRate = values.epicDropRate;
  const legendaryDropRate = values.legendaryDropRate;
  const numberOfOpens = values.numberOfOpens;

  // Total drop rate (should be close to 100%)
  const totalDropRate = commonDropRate + uncommonDropRate + rareDropRate + epicDropRate + legendaryDropRate;

  // Expected number of drops for each rarity
  const expectedCommon = (commonDropRate / 100) * numberOfOpens;
  const expectedUncommon = (uncommonDropRate / 100) * numberOfOpens;
  const expectedRare = (rareDropRate / 100) * numberOfOpens;
  const expectedEpic = (epicDropRate / 100) * numberOfOpens;
  const expectedLegendary = (legendaryDropRate / 100) * numberOfOpens;

  // Probability of at least one legendary
  const probabilityAtLeastOneLegendary = 1 - Math.pow(1 - legendaryDropRate / 100, numberOfOpens);

  // Probability of at least one epic
  const probabilityAtLeastOneEpic = 1 - Math.pow(1 - epicDropRate / 100, numberOfOpens);

  // Probability all common (no uncommon or higher)
  const probabilityAllCommon = Math.pow(commonDropRate / 100, numberOfOpens);

  // Drop distribution
  const dropDistribution = [
    { rarity: 'Common', expected: expectedCommon, probability: commonDropRate },
    { rarity: 'Uncommon', expected: expectedUncommon, probability: uncommonDropRate },
    { rarity: 'Rare', expected: expectedRare, probability: rareDropRate },
    { rarity: 'Epic', expected: expectedEpic, probability: epicDropRate },
    { rarity: 'Legendary', expected: expectedLegendary, probability: legendaryDropRate },
  ];

  let status: ResultPayload['status'] = 'moderate-odds';
  let interpretation = 'Your loot drop odds have been calculated based on drop rates and number of opens.';

  if (probabilityAtLeastOneLegendary >= 0.8) {
    status = 'excellent-odds';
    interpretation = `Excellent odds! ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}% chance of getting at least one legendary in ${numberOfOpens} opens. Very high probability of rare loot.`;
  } else if (probabilityAtLeastOneLegendary >= 0.5) {
    status = 'good-odds';
    interpretation = `Good odds. ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}% chance of getting at least one legendary in ${numberOfOpens} opens. Reasonable probability of rare loot.`;
  } else if (probabilityAtLeastOneLegendary >= 0.25) {
    status = 'moderate-odds';
    interpretation = `Moderate odds. ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}% chance of getting at least one legendary in ${numberOfOpens} opens. Some probability of rare loot, but may require more opens.`;
  } else {
    status = 'low-odds';
    interpretation = `Lower odds. ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}% chance of getting at least one legendary in ${numberOfOpens} opens. Consider opening more loot sources or using sources with higher drop rates.`;
  }

  const recommendations = [
    `Total Drop Rate: ${totalDropRate.toFixed(1)}%. ${Math.abs(totalDropRate - 100) < 5 ? 'Drop rates are balanced and close to 100%.' : 'Drop rates may not sum to 100% - verify rates are accurate for your loot source.'}`,
    `Expected Drops: Common ${expectedCommon.toFixed(1)}, Uncommon ${expectedUncommon.toFixed(1)}, Rare ${expectedRare.toFixed(1)}, Epic ${expectedEpic.toFixed(1)}, Legendary ${expectedLegendary.toFixed(1)}. ${expectedLegendary >= 1 ? 'Good expected legendary drops - reasonable probability.' : expectedLegendary >= 0.5 ? 'Moderate expected legendary drops - some probability.' : 'Low expected legendary drops - may need more opens.'}`,
    `Probability of At Least One Legendary: ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}%. ${probabilityAtLeastOneLegendary >= 0.8 ? 'Excellent probability - very likely to get legendary.' : probabilityAtLeastOneLegendary >= 0.5 ? 'Good probability - reasonable chance of legendary.' : probabilityAtLeastOneLegendary >= 0.25 ? 'Moderate probability - some chance of legendary.' : 'Lower probability - consider more opens or better drop rates.'}`,
    `Probability of At Least One Epic: ${(probabilityAtLeastOneEpic * 100).toFixed(1)}%. ${probabilityAtLeastOneEpic >= 0.9 ? 'Very high probability of epic items.' : probabilityAtLeastOneEpic >= 0.7 ? 'High probability of epic items.' : 'Moderate to lower probability of epic items.'}`,
    `Probability All Common: ${(probabilityAllCommon * 100).toFixed(2)}%. ${probabilityAllCommon < 0.01 ? 'Very unlikely to get all common items.' : probabilityAllCommon < 0.1 ? 'Unlikely to get all common items.' : 'Possible to get all common items - luck plays a role.'}`,
  ];

  if (expectedLegendary < 0.5) {
    recommendations.push('Low Expected Legendary Drops: Consider opening more loot sources, using sources with higher legendary drop rates (supply drops, special chests), or increasing number of opens to improve legendary probability.');
  }

  if (probabilityAtLeastOneLegendary < 0.5) {
    recommendations.push(`Legendary Probability Optimization: To reach 50%+ probability, you need approximately ${Math.ceil(Math.log(0.5) / Math.log(1 - legendaryDropRate / 100))} opens with ${legendaryDropRate}% drop rate. Consider opening more sources or using better drop rate sources.`);
  }

  const plan = [
    { 
      label: 'This Match', 
      detail: `Plan loot strategy: ${numberOfOpens} opens expected, ${(probabilityAtLeastOneLegendary * 100).toFixed(1)}% chance of legendary. ${probabilityAtLeastOneLegendary >= 0.5 ? 'Good odds - prioritize high-value loot sources.' : 'Moderate to lower odds - open more sources or use better drop rate sources.'}` 
    },
    { 
      label: 'This Week', 
      detail: 'Track loot drop results: compare expected vs actual drops, identify which loot sources have best drop rates, test different loot source types, and optimize loot collection strategies based on drop rate data.' 
    },
    { 
      label: 'Ongoing', 
      detail: 'Continuously optimize loot collection: use drop rate data to prioritize loot sources, understand probability vs expected values, track actual drop results, and adapt strategies based on observed drop rates and probabilities.' 
    },
  ];

  return {
    commonDropRate,
    uncommonDropRate,
    rareDropRate,
    epicDropRate,
    legendaryDropRate,
    numberOfOpens,
    totalDropRate,
    expectedCommon,
    expectedUncommon,
    expectedRare,
    expectedEpic,
    expectedLegendary,
    probabilityAtLeastOneLegendary,
    probabilityAtLeastOneEpic,
    probabilityAllCommon,
    dropDistribution,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function FortniteLootDropOddsEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commonDropRate: undefined,
      uncommonDropRate: undefined,
      rareDropRate: undefined,
      epicDropRate: undefined,
      legendaryDropRate: undefined,
      numberOfOpens: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="fortnite-loot-drop-odds-estimator-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Fortnite Loot Drop Odds Estimator
          </CardTitle>
          <CardDescription>Estimate loot drop odds and probabilities for Fortnite chests, supply drops, and loot sources based on rarity tiers and drop rates.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your loot drop rates</CardTitle>
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
                  name="commonDropRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Common (Gray) Drop Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uncommonDropRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uncommon (Green) Drop Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rareDropRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rare (Blue) Drop Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="epicDropRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Epic (Purple) Drop Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="legendaryDropRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legendary (Gold) Drop Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="numberOfOpens"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Opens</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Drop Odds
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
            <CardDescription>See expected drops, probabilities, drop distribution, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Expected Legendary</p>
                <p className="text-2xl font-semibold text-primary">{result.expectedLegendary.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Drops</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Legendary Probability</p>
                <p className="text-2xl font-semibold text-primary">{(result.probabilityAtLeastOneLegendary * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">At least one</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Epic Probability</p>
                <p className="text-2xl font-semibold text-primary">{(result.probabilityAtLeastOneEpic * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">At least one</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {result.dropDistribution.map((dist) => (
                <div key={dist.rarity} className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground">{dist.rarity}</p>
                  <p className="text-xl font-semibold text-primary">{dist.expected.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">Expected ({dist.probability.toFixed(1)}%)</p>
                </div>
              ))}
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
            <strong>Expected Drops</strong> = (Drop Rate / 100) × Number of Opens. This calculates the average number of drops you can expect for each rarity tier. Expected values represent averages over many trials, not guarantees.
          </p>
          <p>
            <strong>Probability of At Least One</strong> = 1 - (1 - Drop Rate / 100)^Number of Opens. This calculates the probability of getting at least one item of a specific rarity across multiple opens. Higher drop rates and more opens increase probability.
          </p>
          <p>
            <strong>Probability All Common</strong> = (Common Drop Rate / 100)^Number of Opens. This calculates the probability that all opens result in common items only. This probability decreases as number of opens increases.
          </p>
          <p>
            <strong>Total Drop Rate</strong> = Sum of All Rarity Drop Rates. This should be close to 100% for standard loot sources. If total is significantly different from 100%, verify drop rates are accurate for your specific loot source.
          </p>
          <p>
            <strong>Opens Needed for 50% Probability</strong> = log(0.5) / log(1 - Drop Rate / 100). This calculates how many opens are needed to reach 50% probability of getting at least one item of a specific rarity. Useful for planning loot collection.
          </p>
          <p>These formulas help you understand drop probabilities, calculate expected values, and plan loot collection strategies. Remember that probabilities represent chances over many trials, and individual results will vary due to randomness.</p>
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
        <meta itemProp="name" content="The Complete Guide to Fortnite Loot Drop Odds: Understanding Probabilities and Rarity Tiers" />
        <meta itemProp="description" content="A comprehensive guide to Fortnite loot drop odds, probability calculations, rarity tiers, and loot collection strategies." />
        <meta itemProp="keywords" content="Fortnite loot drops, drop rates, probability, rarity tiers, loot odds, chest drops" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Fortnite Loot Drop Odds: Understanding Probabilities and Rarity Tiers</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Fortnite loot drop odds, probability calculations, rarity tiers, and loot collection strategies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding Loot Drop Odds</a></li>
          <li><a href="#rarity" className="hover:underline">Rarity Tiers and Drop Rates</a></li>
          <li><a href="#probability" className="hover:underline">Probability Calculations</a></li>
          <li><a href="#expected" className="hover:underline">Expected Values and Averages</a></li>
          <li><a href="#sources" className="hover:underline">Loot Source Types and Rates</a></li>
          <li><a href="#optimization" className="hover:underline">Loot Collection Optimization</a></li>
          <li><a href="#strategies" className="hover:underline">Collection Strategies and Planning</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding Loot Drop Odds</h2>
        <p>Loot drop odds in Fortnite determine the probability of obtaining items of different rarity tiers when opening loot sources like chests, supply drops, and floor loot. Understanding drop odds helps players plan loot collection, estimate probabilities, and optimize strategies for obtaining desired items.</p>

        <p>Drop rates vary by rarity tier, with common items having the highest rates (typically 60-70%) and legendary items having the lowest rates (typically 1-5%). Understanding these rates helps players set realistic expectations and plan loot collection strategies.</p>

        <p>Probability calculations help players understand their chances of obtaining specific items across multiple opens. Expected values show average outcomes, while probabilities show chances of specific outcomes. Understanding both helps players make informed decisions about loot collection.</p>

        <p>Loot source types have different drop rates. Chests, supply drops, floor loot, and special sources each have different probability distributions. Understanding source-specific rates helps players prioritize which sources to open for desired items.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Drop Odds Matter</h3>
        <p>Drop odds matter because they help players understand their chances of obtaining desired items, plan loot collection strategies, set realistic expectations, and optimize time spent collecting loot. Understanding odds prevents frustration and helps players make informed decisions.</p>

        <hr />

        <h2 id="rarity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rarity Tiers and Drop Rates</h2>
        
        <p>Fortnite features five rarity tiers with different drop rates and item values. Understanding rarity tiers helps players understand drop odds and prioritize loot collection.</p>

        <p>Common (Gray) items have the highest drop rates, typically 60-70% for standard loot sources. Common items are the most frequent drops but have the lowest stats. They're reliable but not powerful. Common items are useful early game but often replaced by higher rarity items.</p>

        <p>Uncommon (Green) items have moderate drop rates, typically 20-30% for standard loot sources. Uncommon items provide better stats than common items and are more valuable. They're common enough to be reliable but rare enough to be valuable upgrades.</p>

        <p>Rare (Blue) items have lower drop rates, typically 8-15% for standard loot sources. Rare items provide significant stat improvements and are valuable upgrades. They're uncommon but obtainable with reasonable effort. Rare items are often the target for mid-game optimization.</p>

        <p>Epic (Purple) items have low drop rates, typically 3-8% for standard loot sources. Epic items provide major stat improvements and are highly valuable. They're rare but obtainable with effort. Epic items are often the target for late-game optimization.</p>

        <p>Legendary (Gold) items have the lowest drop rates, typically 1-5% for standard loot sources. Legendary items provide maximum stats and are extremely valuable. They're very rare and require significant effort or luck to obtain. Legendary items are the ultimate goal for many players.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Drop Rate Examples</h3>
        <p>Example standard chest rates: Common 65%, Uncommon 25%, Rare 8%, Epic 2%, Legendary 1%. This distribution prioritizes common items while providing chances for rare items. Supply drops may have higher rates for epic and legendary items.</p>

        <hr />

        <h2 id="probability" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Probability Calculations</h2>
        
        <p>Probability calculations help players understand their chances of obtaining specific items across multiple opens. Understanding probability helps players set realistic expectations and plan loot collection strategies.</p>

        <p>Single open probability is simply the drop rate. For example, with 5% legendary drop rate, each open has a 5% chance of legendary. This is straightforward but doesn't account for multiple opens.</p>

        <p>Probability of at least one uses the formula: P(At Least One) = 1 - (1 - Drop Rate)^Number of Opens. This calculates the chance of getting at least one item of a specific rarity across multiple opens. For example, with 5% drop rate and 20 opens: 1 - (0.95)^20 ≈ 64.2%.</p>

        <p>Probability of exactly N uses binomial probability: P(Exactly N) = C(Opens, N) × (Drop Rate)^N × (1 - Drop Rate)^(Opens - N). This calculates the chance of getting exactly N items of a specific rarity. More complex but provides precise probabilities.</p>

        <p>Probability of all common uses: P(All Common) = (Common Rate)^Number of Opens. This calculates the chance that all opens result in common items only. This probability decreases as number of opens increases, showing that rare items become more likely with more opens.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Probability Examples</h3>
        <p>Example: 5% legendary rate, 20 opens. Probability of at least one legendary = 1 - (0.95)^20 ≈ 64.2%. This means you have a 64.2% chance of getting at least one legendary in 20 opens. Not guaranteed, but likely.</p>

        <p>Example: 2% epic rate, 50 opens. Probability of at least one epic = 1 - (0.98)^50 ≈ 63.6%. This shows that even with low drop rates, multiple opens provide reasonable probabilities of rare items.</p>

        <hr />

        <h2 id="expected" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Expected Values and Averages</h2>
        
        <p>Expected values represent average outcomes over many trials, helping players understand typical results. Understanding expected values helps players set realistic expectations and plan loot collection.</p>

        <p>Expected drops formula: Expected = (Drop Rate / 100) × Number of Opens. This calculates the average number of drops you can expect for each rarity tier. For example, with 5% drop rate and 20 opens: Expected = 0.05 × 20 = 1.0 legendary.</p>

        <p>Expected values are averages, not guarantees. Actual results will vary due to randomness. Some players will get more than expected, others will get less. Over many trials, results average to expected values.</p>

        <p>Expected value interpretation: If expected legendary = 1.0, this means on average you'll get 1 legendary per 20 opens. However, you might get 0, 1, 2, or more in any specific set of 20 opens. Expected values help understand typical outcomes.</p>

        <p>Variance and standard deviation measure how much actual results vary from expected values. Higher drop rates and more opens reduce variance, making results more predictable. Lower drop rates and fewer opens increase variance, making results less predictable.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Expected Value Examples</h3>
        <p>Example: 60% common, 25% uncommon, 10% rare, 4% epic, 1% legendary, 20 opens. Expected: Common 12.0, Uncommon 5.0, Rare 2.0, Epic 0.8, Legendary 0.2. This shows typical distribution across multiple opens.</p>

        <hr />

        <h2 id="sources" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loot Source Types and Rates</h2>
        
        <p>Different loot source types have different drop rates, affecting probability of obtaining rare items. Understanding source-specific rates helps players prioritize which sources to open.</p>

        <p>Standard chests typically have balanced drop rates favoring common and uncommon items. Legendary rates are typically 1-2%. Chests are common and reliable but have lower rates for rare items. Use chests for general loot collection.</p>

        <p>Supply drops typically have higher rates for epic and legendary items, often 3-5% for legendary. Supply drops are rarer but provide better chances for rare items. Prioritize supply drops when seeking epic or legendary items.</p>

        <p>Floor loot typically has lower rates for rare items than chests. Floor loot is common but less valuable. Use floor loot for early game but prioritize chests and supply drops for better items.</p>

        <p>Special loot sources (vaults, bosses, special chests) may have guaranteed or significantly higher rates for specific rarities. These sources are rare but provide the best chances for rare items. Prioritize special sources when available.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Source Prioritization</h3>
        <p>Prioritize loot sources based on goals: For common/uncommon items, use standard chests and floor loot. For rare items, use supply drops and special sources. For epic/legendary items, prioritize supply drops and special sources. Balance source availability with drop rates to optimize collection.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Loot Collection Optimization</h2>
        
        <p>Loot collection optimization helps players maximize chances of obtaining desired items while minimizing time spent. Multiple strategies can optimize loot collection.</p>

        <p>Source prioritization focuses on opening sources with best drop rates for desired rarities. Use supply drops and special sources for epic/legendary items. Use standard chests for general loot. Prioritize high-value sources when available.</p>

        <p>Volume strategy opens many sources to increase probability through sheer numbers. More opens mean higher probability of rare items. This strategy requires time but provides reliable results. Balance volume with source quality.</p>

        <p>Timing optimization opens sources during optimal moments. Supply drops appear at specific times. Special sources may be time-limited. Understanding timing helps players maximize opportunities for rare items.</p>

        <p>Location optimization focuses on areas with more loot sources. Some locations have more chests or better sources. Understanding location density helps players maximize opens per time spent. Balance location quality with competition and safety.</p>

        <p>Probability planning uses calculations to determine how many opens are needed for desired probabilities. For example, to reach 50% probability of legendary with 5% rate, you need approximately 14 opens. Planning helps set realistic goals and time investment.</p>

        <hr />

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Collection Strategies and Planning</h2>
        
        <p>Effective collection strategies help players obtain desired items efficiently while managing time and risk. Multiple approaches can optimize collection based on goals and constraints.</p>

        <p>Early game strategy focuses on quick loot collection from common sources. Prioritize speed over quality to get basic equipment quickly. Use floor loot and nearby chests for fast collection. Don't spend too much time on early loot collection.</p>

        <p>Mid game strategy focuses on upgrading to rare items. Prioritize supply drops and special sources for better items. Balance loot collection with survival and positioning. Use probability calculations to plan collection efforts.</p>

        <p>Late game strategy focuses on obtaining epic/legendary items. Prioritize supply drops and special sources exclusively. Use probability calculations to determine if collection is worthwhile. Balance collection with final circle positioning.</p>

        <p>Risk management balances collection with survival. Don't risk elimination for loot collection. Prioritize safety over rare items when necessary. Understand when to stop collecting and focus on survival.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Strategic Planning</h3>
        <p>Plan collection based on: current equipment needs, available loot sources, time constraints, risk factors, and probability calculations. Use calculators to estimate probabilities and plan collection efforts. Balance collection goals with survival and positioning priorities.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Understanding Fortnite loot drop odds helps players plan loot collection, set realistic expectations, and optimize strategies for obtaining desired items. Drop rates vary by rarity tier and loot source type, affecting probability of obtaining rare items.</p>

        <p>Probability calculations help players understand their chances of obtaining specific items across multiple opens. Expected values show average outcomes, while probabilities show chances of specific outcomes. Understanding both helps players make informed decisions.</p>

        <p>Optimization strategies include source prioritization, volume strategy, timing optimization, location optimization, and probability planning. By combining these strategies, players can maximize chances of obtaining desired items while managing time and risk effectively.</p>

        <p>Remember that drop odds represent probabilities over many trials, and individual results will vary due to randomness. Use calculators to estimate probabilities and plan collection efforts. With proper understanding and optimization, players can improve their chances of obtaining desired items and optimize loot collection strategies effectively.</p>
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
          <p>This tool estimates Fortnite loot drop odds based on drop rate percentages for each rarity tier (Common, Uncommon, Rare, Epic, Legendary, all 0-100%) and number of loot source opens.</p>
          <p>Outputs include expected drops for each rarity (average number), probability of at least one legendary/epic, probability all common, total drop rate (sum of all rates), drop distribution by rarity, status assessment (low-odds/moderate-odds/good-odds/excellent-odds), interpretation, recommendations, and action plan.</p>
          <p>Formulas use probability calculations: Expected Drops = (Drop Rate / 100) × Opens, Probability At Least One = 1 - (1 - Drop Rate / 100)^Opens, Probability All Common = (Common Rate / 100)^Opens. The guide covers rarity tiers, probability calculations, expected values, loot source types, optimization strategies, and collection planning. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Fortnite loot drop odds calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
