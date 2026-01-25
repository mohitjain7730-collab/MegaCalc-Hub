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
  pyramidLevel: z.number({ invalid_type_error: 'Enter pyramid level' }).min(0).max(4),
  beaconLevel: z.number({ invalid_type_error: 'Enter beacon level' }).min(1).max(4),
  effectCount: z.number({ invalid_type_error: 'Enter effect count' }).min(1).max(2),
  baseRange: z.number({ invalid_type_error: 'Enter base range' }).min(20).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Base range for beacon (blocks)
const BASE_RANGE = 50;

// Range multipliers by pyramid level
const pyramidMultipliers: Record<number, number> = {
  0: 1,    // No pyramid
  1: 1.5,  // 1 layer (9 blocks)
  2: 2,    // 2 layers (34 blocks)
  3: 2.5,  // 3 layers (83 blocks)
  4: 3,    // 4 layers (164 blocks)
};

type ResultPayload = {
  pyramidLevel: number;
  beaconLevel: number;
  effectCount: number;
  baseRange: number;
  rangeMultiplier: number;
  effectiveRange: number;
  areaCoverage: number;
  blocksInRange: number;
  pyramidBlocks: number;
  status: 'limited' | 'moderate' | 'good' | 'excellent';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter the pyramid level (0-4): 0 = no pyramid, 1 = 1 layer (9 blocks), 2 = 2 layers (34 blocks), 3 = 3 layers (83 blocks), 4 = 4 layers (164 blocks).',
  'Enter the beacon level (1-4): Determines available effects and effect strength.',
  'Enter the number of effects (1-2): Beacons can provide 1 or 2 effects depending on pyramid level.',
  'Optionally enter custom base range (defaults to 50 blocks).',
  'Review effective range, area coverage, blocks in range, pyramid requirements, and recommendations.',
];

const faqs = [
  {
    question: 'How does beacon range work in Minecraft?',
    answer:
      'Beacon range determines how far beacon effects extend from the beacon block. Base range is 50 blocks. Range increases with pyramid level: Level 1 pyramid = 75 blocks (1.5x), Level 2 = 100 blocks (2x), Level 3 = 125 blocks (2.5x), Level 4 = 150 blocks (3x). Higher pyramid levels provide significantly larger coverage areas.',
  },
  {
    question: 'What is the maximum beacon range?',
    answer:
      'Maximum beacon range is 150 blocks with a 4-level pyramid (164 blocks). This provides 3x the base range and covers a large area. Lower pyramid levels provide smaller ranges: Level 1 = 75 blocks, Level 2 = 100 blocks, Level 3 = 125 blocks. Choose pyramid level based on coverage needs and resource availability.',
  },
  {
    question: 'How many blocks are needed for each pyramid level?',
    answer:
      'Pyramid block requirements: Level 1 = 9 blocks (3x3), Level 2 = 34 blocks (5x5 + 3x3), Level 3 = 83 blocks (7x7 + 5x5 + 3x3), Level 4 = 164 blocks (9x9 + 7x7 + 5x5 + 3x3). Higher levels require significantly more blocks but provide much larger ranges. Use iron, gold, emerald, diamond, or netherite blocks.',
  },
  {
    question: 'How do beacon levels affect range?',
    answer:
      'Beacon level (1-4) determines available effects and effect strength, but does not directly affect range. Range is determined by pyramid level. However, higher beacon levels unlock more powerful effects and multiple effect options. Pyramid level controls range, beacon level controls effects.',
  },
  {
    question: 'Can I have multiple effects from one beacon?',
    answer:
      'Yes, beacons can provide 1 or 2 effects depending on pyramid level. Level 1-2 pyramids allow 1 effect, Level 3-4 pyramids allow 2 effects. Multiple effects are useful for combining benefits like Speed + Haste or Regeneration + Resistance. Higher pyramid levels enable more effect combinations.',
  },
  {
    question: 'How do I calculate area coverage?',
    answer:
      'Area Coverage = π × (Range)². This calculates the circular area covered by beacon effects. For example, 50 block range = 7,854 blocks², 100 block range = 31,416 blocks², 150 block range = 70,686 blocks². Range increases dramatically increase coverage area (area scales with range squared).',
  },
  {
    question: 'What is the best pyramid level for beacons?',
    answer:
      'Best pyramid level depends on needs: Level 4 (164 blocks) for maximum range and 2 effects, Level 3 (83 blocks) for good range and 2 effects with less cost, Level 2 (34 blocks) for moderate range and 1 effect, Level 1 (9 blocks) for basic range and 1 effect. Balance range needs with resource costs.',
  },
];

const relatedCalculators = [
  {
    name: 'Minecraft Farm Yield Calculator',
    slug: 'minecraft-farm-yield-calculator',
    description: 'Calculate crop yields, resource production rates, and farm efficiency for Minecraft farms based on farm size and crop type.',
  },
  {
    name: 'Minecraft Enchanting Odds Predictor',
    slug: 'minecraft-enchanting-odds-predictor',
    description: 'Predict enchanting odds and probabilities for Minecraft items based on enchantment levels and experience costs.',
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
    name: 'Minecraft Redstone Signal Delay Calculator',
    slug: 'minecraft-redstone-signal-delay-calculator',
    description: 'Calculate redstone signal delay based on repeater count and tick delay.',
  },
  {
    name: 'Minecraft Tree Farm Output Calculator',
    slug: 'minecraft-tree-farm-output-calculator',
    description: 'Calculate tree farm output based on sapling type, bone meal usage, and growth rates.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/minecraft-beacon-range-optimizer';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Minecraft Beacon Range Optimizer', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Minecraft Beacon Range Optimizer',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Optimize beacon range and effect coverage in Minecraft based on beacon level, pyramid size, and effect combinations.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const pyramidLevel = values.pyramidLevel;
  const beaconLevel = values.beaconLevel;
  const effectCount = values.effectCount;
  const baseRange = values.baseRange ?? BASE_RANGE;

  // Range multiplier based on pyramid level
  const rangeMultiplier = pyramidMultipliers[pyramidLevel] || 1;

  // Effective range
  const effectiveRange = baseRange * rangeMultiplier;

  // Area coverage (circular area: π × r²)
  const areaCoverage = Math.PI * effectiveRange * effectiveRange;

  // Blocks in range (approximate, using area)
  const blocksInRange = Math.floor(areaCoverage);

  // Pyramid blocks required
  const pyramidBlocksMap: Record<number, number> = {
    0: 0,
    1: 9,    // 3x3
    2: 34,   // 5x5 + 3x3
    3: 83,   // 7x7 + 5x5 + 3x3
    4: 164,  // 9x9 + 7x7 + 5x5 + 3x3
  };
  const pyramidBlocks = pyramidBlocksMap[pyramidLevel] || 0;

  let status: ResultPayload['status'] = 'moderate';
  let interpretation = 'Your beacon range has been calculated based on pyramid level, beacon level, and effect count.';

  if (effectiveRange >= 125) {
    status = 'excellent';
    interpretation = `Excellent range! ${effectiveRange.toFixed(0)} blocks. This is maximum or near-maximum beacon range with excellent coverage area. Perfect for large-area effect coverage.`;
  } else if (effectiveRange >= 100) {
    status = 'good';
    interpretation = `Good range! ${effectiveRange.toFixed(0)} blocks. This provides substantial coverage area and is suitable for most applications. Great for base-wide effects.`;
  } else if (effectiveRange >= 75) {
    status = 'moderate';
    interpretation = `Moderate range. ${effectiveRange.toFixed(0)} blocks. This provides decent coverage area suitable for smaller bases or specific areas. Consider higher pyramid levels for more range.`;
  } else {
    status = 'limited';
    interpretation = `Limited range. ${effectiveRange.toFixed(0)} blocks. This provides basic coverage but may be insufficient for large areas. Consider building a pyramid to increase range significantly.`;
  }

  const recommendations = [
    `Pyramid Level: ${pyramidLevel} (${pyramidBlocks} blocks). ${pyramidLevel >= 4 ? 'Maximum pyramid - excellent range and 2 effects.' : pyramidLevel >= 3 ? 'Large pyramid - good range and 2 effects.' : pyramidLevel >= 2 ? 'Medium pyramid - moderate range and 1 effect.' : pyramidLevel >= 1 ? 'Small pyramid - basic range and 1 effect.' : 'No pyramid - base range only.'}`,
    `Beacon Level: ${beaconLevel}/4. ${beaconLevel >= 4 ? 'Maximum level - all effects available.' : beaconLevel >= 3 ? 'High level - most effects available.' : beaconLevel >= 2 ? 'Moderate level - some effects available.' : 'Basic level - limited effects available.'}`,
    `Effect Count: ${effectCount} effect(s). ${effectCount >= 2 ? 'Two effects enabled - can combine benefits like Speed + Haste.' : 'Single effect - choose most important effect for your needs.'}`,
    `Effective Range: ${effectiveRange.toFixed(0)} blocks. ${effectiveRange >= 125 ? 'Excellent range - covers very large areas.' : effectiveRange >= 100 ? 'Good range - covers large areas.' : effectiveRange >= 75 ? 'Moderate range - covers medium areas.' : 'Limited range - covers small areas.'}`,
    `Area Coverage: ${blocksInRange.toLocaleString()} blocks². ${blocksInRange >= 50000 ? 'Very large coverage - excellent for large bases.' : blocksInRange >= 30000 ? 'Large coverage - good for large bases.' : blocksInRange >= 15000 ? 'Moderate coverage - suitable for medium bases.' : 'Smaller coverage - suitable for small bases or specific areas.'}`,
  ];

  if (pyramidLevel < 4 && effectiveRange < 125) {
    recommendations.push(`Range Optimization: Current range is ${effectiveRange.toFixed(0)} blocks. To increase range: build higher pyramid levels (Level 3 = 125 blocks, Level 4 = 150 blocks), which also enable 2 effects at Level 3+. Higher pyramid levels significantly increase coverage area.`);
  }

  if (pyramidLevel < 3 && effectCount === 1) {
    recommendations.push(`Effect Optimization: Current pyramid allows 1 effect. To enable 2 effects, build Level 3+ pyramid (83+ blocks). Two effects allow combining benefits like Speed + Haste for maximum efficiency.`);
  }

  if (pyramidLevel === 0) {
    recommendations.push(`Pyramid Recommendation: No pyramid built. Building even a Level 1 pyramid (9 blocks) increases range to 75 blocks (1.5x). Consider building a pyramid to significantly increase beacon range and coverage.`);
  }

  const plan = [
    { 
      label: 'This Session', 
      detail: `Beacon range: ${effectiveRange.toFixed(0)} blocks, ${blocksInRange.toLocaleString()} blocks² coverage. ${effectiveRange >= 100 ? 'Excellent range for large-area coverage.' : effectiveRange >= 75 ? 'Good range for medium-area coverage.' : 'Consider building pyramid for more range.'}` 
    },
    { 
      label: 'This Week', 
      detail: 'Optimize beacon setup: build higher pyramid levels for more range (Level 3-4 for maximum), enable 2 effects if needed (Level 3+), choose optimal effects for your needs, and position beacon centrally for maximum coverage.' 
    },
    { 
      label: 'Ongoing', 
      detail: 'Continuously optimize beacon coverage: build maximum pyramid (Level 4) for 150 block range, enable 2 effects for combined benefits, position beacons strategically for optimal coverage, and consider multiple beacons for very large areas.' 
    },
  ];

  return {
    pyramidLevel,
    beaconLevel,
    effectCount,
    baseRange,
    rangeMultiplier,
    effectiveRange,
    areaCoverage,
    blocksInRange,
    pyramidBlocks,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MinecraftBeaconRangeOptimizer() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pyramidLevel: undefined,
      beaconLevel: undefined,
      effectCount: undefined,
      baseRange: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="minecraft-beacon-range-optimizer-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Minecraft Beacon Range Optimizer
          </CardTitle>
          <CardDescription>Optimize beacon range and effect coverage in Minecraft based on beacon level, pyramid size, and effect combinations.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your beacon information</CardTitle>
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
                  name="pyramidLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pyramid Level (0-4)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="0 = no pyramid, 4 = max" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beaconLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beacon Level (1-4)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="effectCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effect Count (1-2)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="1 or 2 effects" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="baseRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Range (optional, defaults to 50 blocks)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Beacon Range
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
            <CardDescription>See effective range, area coverage, blocks in range, pyramid requirements, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Effective Range</p>
                <p className="text-2xl font-semibold text-primary">{result.effectiveRange.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Blocks</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Area Coverage</p>
                <p className="text-2xl font-semibold text-primary">{result.blocksInRange.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Blocks²</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pyramid Blocks</p>
                <p className="text-2xl font-semibold text-primary">{result.pyramidBlocks}</p>
                <p className="text-xs text-muted-foreground">Blocks needed</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Range Multiplier</p>
                <p className="text-xl font-semibold text-primary">{result.rangeMultiplier}x</p>
                <p className="text-xs text-muted-foreground">Base range multiplier</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Beacon Level</p>
                <p className="text-xl font-semibold text-primary">{result.beaconLevel}/4</p>
                <p className="text-xs text-muted-foreground">{result.beaconLevel >= 4 ? 'Maximum' : 'Upgradeable'}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Effect Count</p>
                <p className="text-xl font-semibold text-primary">{result.effectCount}</p>
                <p className="text-xs text-muted-foreground">{result.effectCount >= 2 ? 'Two effects' : 'Single effect'}</p>
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
            <strong>Base Range</strong> = 50 blocks (default). This is the base beacon range without any pyramid. Beacons have a default range of 50 blocks in all directions.
          </p>
          <p>
            <strong>Range Multiplier</strong> = Pyramid Level Multiplier. Level 0 (no pyramid) = 1x, Level 1 = 1.5x, Level 2 = 2x, Level 3 = 2.5x, Level 4 = 3x. Higher pyramid levels provide larger range multipliers.
          </p>
          <p>
            <strong>Effective Range</strong> = Base Range × Range Multiplier. This calculates the actual beacon range based on pyramid level. For example, 50 blocks × 3 (Level 4) = 150 blocks maximum range.
          </p>
          <p>
            <strong>Area Coverage</strong> = π × (Effective Range)². This calculates the circular area covered by beacon effects. Range increases dramatically increase coverage area (area scales with range squared). For example, 50 blocks = 7,854 blocks², 150 blocks = 70,686 blocks².
          </p>
          <p>
            <strong>Pyramid Blocks</strong> = Sum of all pyramid layers. Level 1 = 9 blocks (3×3), Level 2 = 34 blocks (5×5 + 3×3), Level 3 = 83 blocks (7×7 + 5×5 + 3×3), Level 4 = 164 blocks (9×9 + 7×7 + 5×5 + 3×3). Higher levels require significantly more blocks.
          </p>
          <p>
            <strong>Effect Count</strong> = 1 for Level 1-2 pyramids, 2 for Level 3-4 pyramids. Higher pyramid levels enable multiple effects, allowing combination of benefits like Speed + Haste or Regeneration + Resistance.
          </p>
          <p>These formulas help you understand beacon range, calculate coverage area, plan pyramid requirements, and optimize beacon placement. Build higher pyramid levels for maximum range and multiple effects.</p>
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
        <meta itemProp="name" content="The Complete Guide to Minecraft Beacon Range Optimization: Understanding Range, Effects, and Coverage" />
        <meta itemProp="description" content="A comprehensive guide to Minecraft beacon range optimization, understanding pyramid levels, effect combinations, and coverage area calculation." />
        <meta itemProp="keywords" content="Minecraft beacon, beacon range, beacon pyramid, beacon effects, beacon coverage" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Minecraft Beacon Range Optimization: Understanding Range, Effects, and Coverage</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Minecraft beacon range optimization, understanding pyramid levels, effect combinations, and coverage area calculation.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding Beacon Range</a></li>
          <li><a href="#pyramid" className="hover:underline">Pyramid Levels and Range</a></li>
          <li><a href="#effects" className="hover:underline">Beacon Effects and Levels</a></li>
          <li><a href="#coverage" className="hover:underline">Coverage Area Calculation</a></li>
          <li><a href="#optimization" className="hover:underline">Range Optimization Strategies</a></li>
          <li><a href="#placement" className="hover:underline">Beacon Placement and Positioning</a></li>
          <li><a href="#multiple" className="hover:underline">Multiple Beacons and Coverage</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding Beacon Range</h2>
        <p>Beacon range in Minecraft determines how far beacon effects extend from the beacon block. Understanding beacon range helps players optimize beacon placement, maximize effect coverage, and plan beacon setups for bases and areas. Range depends on pyramid level, with higher pyramids providing significantly larger ranges.</p>

        <p>Base beacon range is 50 blocks in all directions without any pyramid. This provides basic coverage but may be insufficient for large bases. Building pyramids increases range dramatically: Level 1 pyramid = 75 blocks (1.5x), Level 2 = 100 blocks (2x), Level 3 = 125 blocks (2.5x), Level 4 = 150 blocks (3x maximum).</p>

        <p>Range directly affects coverage area. Since coverage is circular (π × r²), range increases dramatically increase coverage area. For example, doubling range quadruples coverage area. Understanding this relationship helps players plan beacon setups for optimal coverage.</p>

        <p>Pyramid level also affects effect count. Level 1-2 pyramids allow 1 effect, Level 3-4 pyramids allow 2 effects. Multiple effects enable combining benefits like Speed + Haste or Regeneration + Resistance. Higher pyramid levels provide both more range and more effects.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Beacon Range Matters</h3>
        <p>Beacon range matters because it determines effect coverage area, affects how many beacons are needed for large bases, influences beacon placement decisions, and impacts resource requirements. Understanding range helps players optimize beacon setups for maximum coverage and efficiency.</p>

        <hr />

        <h2 id="pyramid" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Pyramid Levels and Range</h2>
        
        <p>Pyramid levels determine beacon range multipliers and effect count. Understanding pyramid levels helps players plan beacon setups and optimize range.</p>

        <p>Level 0 (No Pyramid): 50 blocks range (1x), 1 effect. No pyramid provides base range only. Suitable for small areas or temporary setups. Building even a small pyramid significantly increases range.</p>

        <p>Level 1 Pyramid: 75 blocks range (1.5x), 1 effect, 9 blocks required (3×3). Small pyramid provides moderate range increase. Good starting point for beacon setups. Relatively low resource cost.</p>

        <p>Level 2 Pyramid: 100 blocks range (2x), 1 effect, 34 blocks required (5×5 + 3×3). Medium pyramid doubles base range. Provides good coverage for medium-sized bases. Moderate resource cost.</p>

        <p>Level 3 Pyramid: 125 blocks range (2.5x), 2 effects, 83 blocks required (7×7 + 5×5 + 3×3). Large pyramid provides excellent range and enables 2 effects. Great for large bases. Higher resource cost but enables effect combinations.</p>

        <p>Level 4 Pyramid: 150 blocks range (3x), 2 effects, 164 blocks required (9×9 + 7×7 + 5×5 + 3×3). Maximum pyramid provides maximum range and 2 effects. Best for very large bases or maximum coverage. Highest resource cost but maximum benefits.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Pyramid Level Selection</h3>
        <p>Select pyramid level based on: coverage needs (larger areas need higher levels), resource availability (higher levels require more blocks), effect needs (Level 3+ for 2 effects), and base size (larger bases benefit from higher levels). Balance needs with resource costs for optimal selection.</p>

        <hr />

        <h2 id="effects" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Beacon Effects and Levels</h2>
        
        <p>Beacon effects provide beneficial status effects to players within range. Understanding effects and levels helps players choose optimal effect combinations.</p>

        <p>Available effects include: Speed (increases movement speed), Haste (increases mining speed), Resistance (reduces damage), Jump Boost (increases jump height), Strength (increases attack damage), and Regeneration (restores health over time). Different effects suit different needs.</p>

        <p>Beacon level (1-4) determines effect strength and available effects. Higher levels provide stronger effects and unlock additional effect options. Level 4 beacons provide maximum effect strength and all effect options.</p>

        <p>Effect count depends on pyramid level: Level 1-2 pyramids allow 1 effect, Level 3-4 pyramids allow 2 effects. Multiple effects enable combining benefits. Popular combinations include Speed + Haste (movement and mining), Regeneration + Resistance (survival), or Speed + Jump Boost (mobility).</p>

        <p>Effect selection: Choose effects based on needs. Speed + Haste for mining and building, Regeneration + Resistance for combat, Speed + Jump Boost for exploration, or Strength + Resistance for combat. Combine effects that complement each other for maximum benefit.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Effect Optimization</h3>
        <p>Optimize effects by: building Level 3+ pyramids for 2 effects, choosing complementary effect combinations, upgrading beacon to Level 4 for maximum strength, and selecting effects that match your activities. Effect optimization maximizes beacon benefits.</p>

        <hr />

        <h2 id="coverage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Coverage Area Calculation</h2>
        
        <p>Coverage area calculation determines how much area beacon effects cover. Understanding coverage helps players plan beacon placement and optimize coverage for bases.</p>

        <p>Coverage formula: Area = π × (Range)². This calculates the circular area covered by beacon effects. Range increases dramatically increase coverage area because area scales with range squared. For example, doubling range quadruples coverage area.</p>

        <p>Coverage examples: 50 blocks range = 7,854 blocks², 75 blocks range = 17,671 blocks², 100 blocks range = 31,416 blocks², 125 blocks range = 49,087 blocks², 150 blocks range = 70,686 blocks². Higher ranges provide significantly larger coverage areas.</p>

        <p>Coverage planning: Calculate coverage area for your base size, determine how many beacons are needed for full coverage, plan beacon placement for optimal coverage overlap, and consider coverage gaps when placing beacons. Coverage planning ensures effective beacon setups.</p>

        <p>Coverage optimization: Use higher pyramid levels for larger coverage, position beacons centrally for maximum coverage, overlap coverage areas to ensure no gaps, and consider multiple beacons for very large bases. Coverage optimization maximizes effect coverage.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Coverage Strategy</h3>
        <p>Coverage strategy: measure base size and calculate coverage needs, determine optimal beacon count and placement, build appropriate pyramid levels for coverage, and ensure coverage overlap for complete coverage. Coverage strategy ensures effective beacon setups.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Range Optimization Strategies</h2>
        
        <p>Range optimization strategies help players maximize beacon range and coverage. Multiple approaches can optimize range.</p>

        <p>Pyramid level optimization builds maximum pyramid (Level 4) for 150 block range. Higher pyramid levels provide significantly larger ranges. Level 4 pyramid provides maximum range and 2 effects. Build highest pyramid level feasible for maximum range.</p>

        <p>Effect count optimization builds Level 3+ pyramids for 2 effects. Multiple effects enable combining benefits. Level 3 pyramid (83 blocks) provides good range and 2 effects with less cost than Level 4. Balance effect needs with resource costs.</p>

        <p>Placement optimization positions beacons centrally for maximum coverage. Central placement maximizes coverage area and reduces beacon count needed. Consider base layout when positioning beacons for optimal coverage.</p>

        <p>Multiple beacon optimization uses multiple beacons for very large bases. Overlap coverage areas to ensure no gaps. Position beacons strategically for maximum combined coverage. Multiple beacons provide coverage for bases larger than single beacon range.</p>

        <p>Resource optimization balances range needs with resource costs. Level 3 pyramid provides good range and 2 effects with moderate cost. Level 4 pyramid provides maximum range but requires significant resources. Choose pyramid level based on needs and resources.</p>

        <hr />

        <h2 id="placement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Beacon Placement and Positioning</h2>
        
        <p>Beacon placement and positioning significantly affect coverage and effectiveness. Understanding placement helps players optimize beacon setups.</p>

        <p>Central placement positions beacons in the center of areas to maximize coverage. Central placement maximizes coverage area and ensures even coverage distribution. Consider base layout when choosing central positions for optimal coverage.</p>

        <p>Height placement considers vertical coverage. Beacons provide effects in all directions, so height affects vertical coverage. Place beacons at appropriate heights for optimal vertical coverage. Consider base height when positioning beacons.</p>

        <p>Overlap planning ensures coverage areas overlap to prevent gaps. Overlapping coverage ensures continuous effect coverage throughout areas. Plan beacon placement to ensure adequate overlap for complete coverage.</p>

        <p>Accessibility ensures beacons are accessible for effect selection and maintenance. Place beacons where they can be easily accessed for effect changes or repairs. Consider accessibility when positioning beacons.</p>

        <p>Multiple beacon coordination positions multiple beacons strategically for combined coverage. Coordinate beacon placement to maximize combined coverage and minimize gaps. Plan multiple beacon setups for optimal coverage.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Placement Strategy</h3>
        <p>Placement strategy: identify central positions for maximum coverage, consider vertical coverage and base height, plan coverage overlap to prevent gaps, ensure accessibility for maintenance, and coordinate multiple beacons for combined coverage. Good placement maximizes beacon effectiveness.</p>

        <hr />

        <h2 id="multiple" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Multiple Beacons and Coverage</h2>
        
        <p>Multiple beacons can provide coverage for very large bases or areas. Understanding multiple beacon setups helps players plan comprehensive coverage.</p>

        <p>Coverage planning calculates how many beacons are needed for full coverage. Determine base size, calculate coverage per beacon, and plan beacon count and placement. Coverage planning ensures adequate beacon coverage for large bases.</p>

        <p>Overlap strategy ensures coverage areas overlap to prevent gaps. Overlapping coverage provides continuous effect coverage. Plan overlap to ensure no coverage gaps while minimizing redundant coverage. Optimal overlap balances coverage with efficiency.</p>

        <p>Effect coordination uses consistent effects across beacons for uniform benefits. Coordinate effect selection across multiple beacons for consistent coverage. Uniform effects provide predictable benefits throughout covered areas.</p>

        <p>Resource management considers total resource costs for multiple beacons. Multiple beacons require significant resources, especially with high pyramid levels. Plan resource allocation for multiple beacon setups. Balance coverage needs with resource availability.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Multiple Beacon Strategy</h3>
        <p>Multiple beacon strategy: calculate coverage needs for base size, plan beacon count and placement for optimal coverage, ensure coverage overlap to prevent gaps, coordinate effects for uniform benefits, and manage resources for multiple beacon setups. Multiple beacon strategy ensures comprehensive coverage.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Minecraft beacon range optimization depends on pyramid level, beacon level, and effect combinations. Understanding range mechanics, coverage calculation, and optimization strategies helps players maximize beacon effectiveness and plan optimal beacon setups.</p>

        <p>Key factors affecting range include: pyramid level (higher levels provide larger ranges), base range (50 blocks default), range multiplier (1x to 3x based on pyramid), and effect count (Level 3+ enables 2 effects). Understanding these factors helps optimize beacon range.</p>

        <p>Optimization strategies include: pyramid level optimization (build maximum pyramid for maximum range), effect count optimization (Level 3+ for 2 effects), placement optimization (central positioning for maximum coverage), multiple beacon optimization (use multiple beacons for large bases), and resource optimization (balance needs with costs). By combining these strategies, players can optimize beacon range and coverage effectively.</p>

        <p>Remember that range directly affects coverage area, and coverage scales with range squared. Build higher pyramid levels for maximum range and multiple effects. Position beacons centrally for optimal coverage. With proper understanding and optimization, players can maximize beacon range and coverage effectively.</p>
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
          <p>This tool optimizes Minecraft beacon range and effect coverage based on pyramid level (0-4), beacon level (1-4), effect count (1-2), and optional base range (defaults to 50 blocks).</p>
          <p>Outputs include effective range (base range × pyramid multiplier: Level 0 = 50, Level 1 = 75, Level 2 = 100, Level 3 = 125, Level 4 = 150 blocks), area coverage (π × range² in blocks²), blocks in range (approximate), pyramid blocks required (Level 1 = 9, Level 2 = 34, Level 3 = 83, Level 4 = 164), range multiplier (1x to 3x), status assessment (limited/moderate/good/excellent), interpretation, recommendations, and action plan.</p>
          <p>Formulas use range calculations: Base Range = 50 blocks, Range Multiplier = Pyramid Level Multiplier (Level 0 = 1x, Level 1 = 1.5x, Level 2 = 2x, Level 3 = 2.5x, Level 4 = 3x), Effective Range = Base Range × Multiplier, Area Coverage = π × (Range)². The guide covers pyramid levels, beacon effects, coverage calculation, optimization strategies, placement, and multiple beacons. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Minecraft beacon range optimization instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
