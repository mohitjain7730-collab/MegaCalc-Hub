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
  farmSize: z.number({ invalid_type_error: 'Enter farm size' }).min(1),
  cropType: z.enum(['wheat', 'carrot', 'potato', 'beetroot', 'nether_wart'], { invalid_type_error: 'Select crop type' }),
  growthTime: z.number({ invalid_type_error: 'Enter growth time' }).min(1),
  bonemealUsage: z.boolean().optional(),
  fortuneLevel: z.number({ invalid_type_error: 'Enter fortune level' }).min(0).max(3).optional(),
  timePeriod: z.number({ invalid_type_error: 'Enter time period' }).min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  farmSize: number;
  cropType: string;
  growthTime: number;
  bonemealUsage: boolean;
  fortuneLevel: number;
  timePeriod: number;
  baseYield: number;
  fortuneMultiplier: number;
  bonemealBonus: number;
  totalYield: number;
  yieldPerHour: number;
  yieldPerDay: number;
  efficiency: number;
  status: 'low-yield' | 'moderate-yield' | 'high-yield' | 'very-high-yield';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

// Crop-specific base yields (items per harvest per block)
const cropYields: Record<string, number> = {
  wheat: 1,
  carrot: 1,
  potato: 1,
  beetroot: 1,
  nether_wart: 2,
};

const steps = [
  'Enter the size of your farm (number of crop blocks).',
  'Select the crop type you are growing (Wheat, Carrot, Potato, Beetroot, or Nether Wart).',
  'Enter the growth time in minutes (time for crops to fully mature).',
  'Check if you are using bonemeal to speed up growth.',
  'Optionally enter Fortune enchantment level (0-3) for increased yields.',
  'Optionally enter time period in hours to calculate yield over time.',
  'Review total yield, yield per hour/day, efficiency, and recommendations.',
];

const faqs = [
  {
    question: 'How is farm yield calculated in Minecraft?',
    answer:
      'Farm yield is calculated based on: farm size (number of crop blocks), crop type (different crops have different base yields), growth time (time for crops to mature), bonemeal usage (speeds up growth), and Fortune enchantment (increases harvest yields). Total yield = (Farm Size × Base Yield × Fortune Multiplier) / Growth Time.',
  },
  {
    question: 'What are the base yields for different crops?',
    answer:
      'Base yields vary by crop type: Wheat, Carrot, and Potato = 1 item per block, Beetroot = 1 item per block, Nether Wart = 2 items per block. Some crops can drop multiple items (carrots/potatoes can drop 1-4, wheat drops 0-3 seeds + 1 wheat). Fortune enchantment increases these yields significantly.',
  },
  {
    question: 'How does Fortune enchantment affect yields?',
    answer:
      'Fortune enchantment increases crop yields: Fortune I = 1.33x multiplier, Fortune II = 1.67x multiplier, Fortune III = 2.0x multiplier. Fortune significantly increases yields, especially for crops that can drop multiple items. Always use Fortune III when possible for maximum yields.',
  },
  {
    question: 'How does bonemeal affect farm yield?',
    answer:
      'Bonemeal instantly grows crops, eliminating growth time. This dramatically increases yield per hour by allowing immediate re-harvesting. However, bonemeal has a cost (bone meal items). Bonemeal is most effective for maximizing yield per time period, while natural growth is more resource-efficient.',
  },
  {
    question: 'What is the optimal farm size?',
    answer:
      'Optimal farm size depends on your needs: Small farms (9-25 blocks) are good for personal use, Medium farms (50-100 blocks) provide good yields for moderate needs, Large farms (200+ blocks) provide high yields for extensive needs. Balance farm size with available space, resources, and time for maintenance.',
  },
  {
    question: 'How can I maximize farm yield?',
    answer:
      'To maximize yield: use Fortune III enchantment (2x yields), use bonemeal for instant growth (eliminates growth time), optimize farm layout for efficient harvesting, use water for hydration (faster growth), and automate harvesting with redstone or villagers. Combining these methods dramatically increases yields.',
  },
  {
    question: 'What is farm efficiency?',
    answer:
      'Farm efficiency = (Total Yield / Farm Size) / Growth Time. This measures yield per block per time unit. Higher efficiency means better resource utilization. Efficiency helps compare different farm designs and optimize farm performance. Maximize efficiency by reducing growth time and increasing yields per block.',
  },
];

const relatedCalculators = [
  {
    name: 'Minecraft Enchanting Odds Predictor',
    slug: 'minecraft-enchanting-odds-predictor',
    description: 'Predict enchanting odds and probabilities for Minecraft items based on enchantment levels, experience costs, and enchantment combinations.',
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
    name: 'Minecraft Tree Farm Output Calculator',
    slug: 'minecraft-tree-farm-output-calculator',
    description: 'Calculate tree farm output based on sapling type, bone meal usage, and growth rates.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/minecraft-farm-yield-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Minecraft Farm Yield Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Minecraft Farm Yield Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate crop yields, resource production rates, and farm efficiency for Minecraft farms based on farm size, crop type, and growth conditions.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const farmSize = values.farmSize;
  const cropType = values.cropType;
  const growthTime = values.growthTime;
  const bonemealUsage = values.bonemealUsage ?? false;
  const fortuneLevel = values.fortuneLevel ?? 0;
  const timePeriod = values.timePeriod ?? 1;

  // Base yield per block
  const baseYieldPerBlock = cropYields[cropType] || 1;

  // Fortune multipliers
  const fortuneMultipliers: Record<number, number> = {
    0: 1.0,
    1: 1.33,
    2: 1.67,
    3: 2.0,
  };
  const fortuneMultiplier = fortuneMultipliers[fortuneLevel] || 1.0;

  // Base yield (per harvest cycle)
  const baseYield = farmSize * baseYieldPerBlock;

  // Total yield with Fortune
  const totalYield = baseYield * fortuneMultiplier;

  // Bonemeal bonus (if using bonemeal, growth time is effectively 0, allowing instant re-harvesting)
  // For calculation purposes, we'll treat bonemeal as reducing effective growth time
  const effectiveGrowthTime = bonemealUsage ? 0.1 : growthTime; // 0.1 minutes for bonemeal (instant)
  const bonemealBonus = bonemealUsage ? (growthTime / effectiveGrowthTime) : 1;

  // Yield per hour
  const cyclesPerHour = effectiveGrowthTime > 0 ? 60 / effectiveGrowthTime : 600; // Cap at 600 cycles/hour for bonemeal
  const yieldPerHour = totalYield * cyclesPerHour;

  // Yield per day (24 hours)
  const yieldPerDay = yieldPerHour * 24;

  // Efficiency (yield per block per hour)
  const efficiency = farmSize > 0 ? yieldPerHour / farmSize : 0;

  let status: ResultPayload['status'] = 'moderate-yield';
  let interpretation = 'Your farm yield has been calculated based on farm size, crop type, growth conditions, and enchantments.';

  if (yieldPerHour >= 1000) {
    status = 'very-high-yield';
    interpretation = `Very high yield! Your farm produces ${yieldPerHour.toFixed(0)} items per hour. This is an extremely efficient farm with excellent production rates.`;
  } else if (yieldPerHour >= 500) {
    status = 'high-yield';
    interpretation = `High yield! Your farm produces ${yieldPerHour.toFixed(0)} items per hour. This is an efficient farm with strong production rates.`;
  } else if (yieldPerHour >= 200) {
    status = 'moderate-yield';
    interpretation = `Moderate yield. Your farm produces ${yieldPerHour.toFixed(0)} items per hour. This is a functional farm with decent production rates.`;
  } else {
    status = 'low-yield';
    interpretation = `Lower yield. Your farm produces ${yieldPerHour.toFixed(0)} items per hour. Consider optimizing farm size, growth time, or using Fortune enchantment to increase yields.`;
  }

  const recommendations = [
    `Farm Size: ${farmSize} blocks. ${farmSize >= 200 ? 'Large farm - excellent production capacity.' : farmSize >= 100 ? 'Medium farm - good production capacity.' : farmSize >= 50 ? 'Small to medium farm - decent production.' : 'Small farm - consider expanding for better yields.'}`,
    `Crop Type: ${cropType.charAt(0).toUpperCase() + cropType.slice(1)} (${baseYieldPerBlock} base yield per block). ${cropType === 'nether_wart' ? 'Nether Wart has higher base yield (2 per block).' : 'Standard crop yield (1 per block).'}`,
    `Growth Time: ${growthTime} minutes. ${growthTime <= 10 ? 'Fast growth - excellent for high yields.' : growthTime <= 30 ? 'Moderate growth - reasonable yields.' : 'Slow growth - consider using bonemeal or optimizing conditions for faster growth.'}`,
    `Fortune Level: ${fortuneLevel} (${fortuneMultiplier}x multiplier). ${fortuneLevel >= 3 ? 'Fortune III - maximum yield multiplier (2x).' : fortuneLevel >= 2 ? 'Fortune II - good yield multiplier (1.67x).' : fortuneLevel >= 1 ? 'Fortune I - moderate yield multiplier (1.33x).' : 'No Fortune - consider using Fortune enchantment for 2x yields.'}`,
    `Total Yield: ${totalYield.toFixed(0)} items per harvest cycle. ${totalYield >= 500 ? 'Excellent yield per cycle.' : totalYield >= 200 ? 'Good yield per cycle.' : 'Moderate yield per cycle - consider expanding farm or using Fortune.'}`,
    `Yield Per Hour: ${yieldPerHour.toFixed(0)} items/hour. ${yieldPerHour >= 1000 ? 'Exceptional production rate - very efficient farm.' : yieldPerHour >= 500 ? 'High production rate - efficient farm.' : yieldPerHour >= 200 ? 'Moderate production rate - functional farm.' : 'Lower production rate - consider optimizations.'}`,
  ];

  if (bonemealUsage) {
    recommendations.push(`Bonemeal Usage: Active. Bonemeal eliminates growth time, allowing instant re-harvesting and dramatically increasing yield per hour. This is the most effective method for maximizing production rates.`);
  } else {
    recommendations.push(`Bonemeal Usage: Not active. Consider using bonemeal for instant growth and maximum yield per hour. Bonemeal is especially effective for high-value crops or when time is limited.`);
  }

  if (yieldPerHour < 200) {
    recommendations.push('Yield Optimization: To increase yields, consider: expanding farm size, using Fortune III enchantment (2x yields), using bonemeal for instant growth, optimizing growth conditions (water, light), and automating harvesting for continuous production.');
  }

  const plan = [
    { 
      label: 'This Week', 
      detail: `Optimize farm: ${farmSize} blocks, ${yieldPerHour.toFixed(0)} items/hour. ${yieldPerHour >= 500 ? 'Excellent production - maintain current setup.' : 'Focus on: expanding farm size, obtaining Fortune III, or using bonemeal for better yields.'}` 
    },
    { 
      label: 'This Month', 
      detail: 'Improve farm efficiency: test different crop types, optimize farm layout, implement automation, compare yields with different Fortune levels, and track production rates to identify optimization opportunities.' 
    },
    { 
      label: 'Ongoing', 
      detail: 'Continuously optimize farm production: maintain Fortune III enchantment, use bonemeal for maximum yields, expand farm size as needed, automate harvesting, optimize growth conditions, and track yields to ensure optimal performance.' 
    },
  ];

  return {
    farmSize,
    cropType,
    growthTime,
    bonemealUsage,
    fortuneLevel,
    timePeriod,
    baseYield,
    fortuneMultiplier,
    bonemealBonus,
    totalYield,
    yieldPerHour,
    yieldPerDay,
    efficiency,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MinecraftFarmYieldCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmSize: undefined,
      cropType: undefined,
      growthTime: undefined,
      bonemealUsage: false,
      fortuneLevel: undefined,
      timePeriod: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="minecraft-farm-yield-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Minecraft Farm Yield Calculator
          </CardTitle>
          <CardDescription>Calculate crop yields, resource production rates, and farm efficiency for Minecraft farms based on farm size, crop type, and growth conditions.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your farm information</CardTitle>
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
                  name="farmSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Size (number of crop blocks)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cropType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Crop Type</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as 'wheat' | 'carrot' | 'potato' | 'beetroot' | 'nether_wart')}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Select crop type</option>
                          <option value="wheat">Wheat (1 base yield)</option>
                          <option value="carrot">Carrot (1 base yield)</option>
                          <option value="potato">Potato (1 base yield)</option>
                          <option value="beetroot">Beetroot (1 base yield)</option>
                          <option value="nether_wart">Nether Wart (2 base yield)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="growthTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Growth Time (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fortuneLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fortune Level (0-3, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bonemealUsage"
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
                      <FormLabel className="!mt-0">Using Bonemeal (Instant Growth)</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timePeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Period (hours, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 24" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Farm Yield
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
            <CardDescription>See total yield, yield per hour/day, efficiency, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Yield</p>
                <p className="text-2xl font-semibold text-primary">{result.totalYield.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Items per harvest</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Yield Per Hour</p>
                <p className="text-2xl font-semibold text-primary">{result.yieldPerHour.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Items/hour</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Yield Per Day</p>
                <p className="text-2xl font-semibold text-primary">{result.yieldPerDay.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Items/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Efficiency</p>
                <p className="text-xl font-semibold text-primary">{result.efficiency.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Items/block/hour</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Fortune Multiplier</p>
                <p className="text-xl font-semibold text-primary">{result.fortuneMultiplier}x</p>
                <p className="text-xs text-muted-foreground">Level {result.fortuneLevel}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Bonemeal</p>
                <p className="text-xl font-semibold text-primary">{result.bonemealUsage ? 'Active' : 'Inactive'}</p>
                <p className="text-xs text-muted-foreground">{result.bonemealUsage ? 'Instant growth' : 'Natural growth'}</p>
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
            <strong>Base Yield</strong> = Farm Size × Base Yield Per Block. This calculates the base yield per harvest cycle. Different crops have different base yields: Wheat/Carrot/Potato/Beetroot = 1 per block, Nether Wart = 2 per block.
          </p>
          <p>
            <strong>Fortune Multiplier</strong> = Multiplier based on Fortune level (Fortune I = 1.33x, Fortune II = 1.67x, Fortune III = 2.0x). Fortune enchantment significantly increases yields, especially for crops that can drop multiple items. Always use Fortune III when possible for maximum yields.
          </p>
          <p>
            <strong>Total Yield</strong> = Base Yield × Fortune Multiplier. This calculates the total yield per harvest cycle after applying Fortune enchantment. Higher Fortune levels dramatically increase yields.
          </p>
          <p>
            <strong>Cycles Per Hour</strong> = 60 / Growth Time (minutes). This calculates how many harvest cycles can occur per hour. Faster growth times (or bonemeal usage) allow more cycles, increasing yield per hour significantly.
          </p>
          <p>
            <strong>Yield Per Hour</strong> = Total Yield × Cycles Per Hour. This calculates total items produced per hour. This is the key metric for evaluating farm production rates and efficiency.
          </p>
          <p>
            <strong>Yield Per Day</strong> = Yield Per Hour × 24. This calculates total items produced per day (24 hours). Useful for long-term production planning and resource management.
          </p>
          <p>
            <strong>Efficiency</strong> = Yield Per Hour / Farm Size. This measures yield per block per hour, helping compare different farm designs and optimize resource utilization. Higher efficiency means better resource utilization.
          </p>
          <p>These formulas help you understand farm yields, calculate production rates, and optimize farm performance. Use Fortune III and bonemeal for maximum yields, and optimize growth conditions to reduce growth time and increase production rates.</p>
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
        <meta itemProp="name" content="The Complete Guide to Minecraft Farm Yields: Understanding Crop Production and Efficiency" />
        <meta itemProp="description" content="A comprehensive guide to Minecraft farm yields, crop production rates, Fortune enchantment, and farm optimization strategies." />
        <meta itemProp="keywords" content="Minecraft farm, crop yield, farm efficiency, Fortune enchantment, bonemeal, crop production" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Minecraft Farm Yields: Understanding Crop Production and Efficiency</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Minecraft farm yields, crop production rates, Fortune enchantment, and farm optimization strategies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding Farm Yields</a></li>
          <li><a href="#crops" className="hover:underline">Crop Types and Base Yields</a></li>
          <li><a href="#growth" className="hover:underline">Growth Time and Conditions</a></li>
          <li><a href="#fortune" className="hover:underline">Fortune Enchantment and Yields</a></li>
          <li><a href="#bonemeal" className="hover:underline">Bonemeal and Instant Growth</a></li>
          <li><a href="#optimization" className="hover:underline">Farm Optimization Strategies</a></li>
          <li><a href="#efficiency" className="hover:underline">Efficiency and Production Rates</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding Farm Yields</h2>
        <p>Farm yields in Minecraft determine how many crops you can harvest from your farm over time. Understanding yields helps players plan farm sizes, optimize production rates, and maximize resource collection. Yield calculations consider farm size, crop type, growth time, Fortune enchantment, and bonemeal usage.</p>

        <p>Yield is calculated from multiple factors: farm size (number of crop blocks), crop type (different crops have different base yields), growth time (time for crops to mature), Fortune enchantment (increases harvest yields), and bonemeal usage (speeds up or eliminates growth time). These factors combine to determine total production rates.</p>

        <p>Production rates measure items produced per time unit (typically per hour). Higher production rates mean more resources collected over time, making farms more valuable. Understanding production rates helps players evaluate farm effectiveness and optimize designs.</p>

        <p>Farm efficiency measures yield per block per time unit, helping compare different farm designs and optimize resource utilization. Higher efficiency means better resource utilization and more effective farm designs. Understanding efficiency helps players optimize farm layouts and maximize production.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Farm Yields Matter</h3>
        <p>Farm yields matter because they determine resource availability, affect gameplay efficiency, enable automation projects, and support large-scale building. Higher yields mean more resources available for crafting, trading, and building. Understanding yields helps players optimize farms for maximum production.</p>

        <hr />

        <h2 id="crops" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Crop Types and Base Yields</h2>
        
        <p>Different crop types have different base yields and characteristics. Understanding crop types helps players choose appropriate crops and optimize farm designs.</p>

        <p>Wheat provides 1 base yield per block, with additional seed drops (0-3 seeds per harvest). Wheat is versatile and used for bread, breeding animals, and trading. Wheat farms are common and reliable for food production.</p>

        <p>Carrot provides 1-4 base yield per block (average 2.5 with Fortune). Carrots are valuable for food, breeding pigs, and trading. Carrot farms provide good yields, especially with Fortune enchantment.</p>

        <p>Potato provides 1-4 base yield per block (average 2.5 with Fortune). Potatoes are valuable for food and trading. Potato farms provide good yields, especially with Fortune enchantment. Baked potatoes provide excellent food value.</p>

        <p>Beetroot provides 1 base yield per block, with additional seed drops. Beetroot is used for food, breeding pigs, and trading. Beetroot farms are less common but provide reliable yields.</p>

        <p>Nether Wart provides 2-4 base yield per block (average 3 with Fortune). Nether Wart is essential for brewing potions and cannot be grown in the overworld. Nether Wart farms are critical for potion production and provide high yields.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Crop Selection</h3>
        <p>Crop selection depends on needs: Wheat for food and versatility, Carrot/Potato for high yields with Fortune, Beetroot for specific uses, Nether Wart for potion brewing. Consider base yields, Fortune effectiveness, and intended use when selecting crops. Fortune significantly increases yields for Carrot, Potato, and Nether Wart.</p>

        <hr />

        <h2 id="growth" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Growth Time and Conditions</h2>
        
        <p>Growth time determines how quickly crops mature and can be harvested. Understanding growth time helps players optimize farm designs and maximize production rates.</p>

        <p>Natural growth time varies by crop: Wheat/Carrot/Potato/Beetroot typically take 20-30 minutes to mature under optimal conditions. Nether Wart grows faster, typically 10-15 minutes. Growth time depends on light level, hydration, and random tick rates.</p>

        <p>Optimal conditions maximize growth speed: Full light (light level 9+), proper hydration (water within 4 blocks), and adequate space. These conditions minimize growth time and maximize production rates. Understanding optimal conditions helps players design efficient farms.</p>

        <p>Growth time impact: Faster growth times allow more harvest cycles per hour, dramatically increasing yield per hour. Reducing growth time from 30 minutes to 15 minutes doubles production rates. Optimizing growth conditions is essential for maximum yields.</p>

        <p>Random tick rates affect growth speed. Higher tick rates (server settings) increase growth speed. Understanding tick rates helps players set realistic expectations for growth times and production rates.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Growth Optimization</h3>
        <p>To optimize growth: ensure full light levels (9+), provide water within 4 blocks of all crops, use optimal farm layouts, consider bonemeal for instant growth, and understand that faster growth dramatically increases production rates. Growth optimization is essential for maximum yields.</p>

        <hr />

        <h2 id="fortune" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Fortune Enchantment and Yields</h2>
        
        <p>Fortune enchantment significantly increases crop yields by multiplying harvest drops. Understanding Fortune helps players maximize yields and optimize farm production.</p>

        <p>Fortune multipliers: Fortune I = 1.33x multiplier (33% increase), Fortune II = 1.67x multiplier (67% increase), Fortune III = 2.0x multiplier (100% increase, doubles yields). Higher Fortune levels dramatically increase yields, making Fortune III essential for maximum production.</p>

        <p>Fortune effectiveness varies by crop: Crops that can drop multiple items (Carrot, Potato, Nether Wart) benefit most from Fortune. Crops with fixed drops (Wheat, Beetroot) benefit less but still see increases. Fortune III doubles yields for most crops, making it extremely valuable.</p>

        <p>Fortune application: Fortune must be on the tool used for harvesting (hoe for crops). Fortune III hoes are essential for maximum yields. Always use Fortune III when harvesting crops for maximum production rates.</p>

        <p>Fortune impact: Fortune III doubles yields, effectively doubling farm production without increasing farm size. This makes Fortune III one of the most valuable enchantments for farming. Always prioritize Fortune III for maximum yields.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Fortune Strategy</h3>
        <p>Fortune strategy: Always use Fortune III hoes for harvesting, prioritize obtaining Fortune III enchantment, understand that Fortune doubles yields, and recognize that Fortune is essential for maximum production. Fortune III is the single most important factor for maximizing farm yields.</p>

        <hr />

        <h2 id="bonemeal" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Bonemeal and Instant Growth</h2>
        
        <p>Bonemeal instantly grows crops, eliminating growth time and allowing immediate re-harvesting. Understanding bonemeal helps players maximize production rates and optimize farm efficiency.</p>

        <p>Bonemeal mechanics: Applying bonemeal to crops instantly advances growth stages, allowing immediate harvesting. This eliminates growth time, dramatically increasing yield per hour. Bonemeal is the most effective method for maximizing production rates.</p>

        <p>Bonemeal efficiency: With bonemeal, growth time is effectively zero, allowing hundreds of harvest cycles per hour. This dramatically increases yield per hour compared to natural growth. Bonemeal is essential for maximum production rates.</p>

        <p>Bonemeal cost: Bonemeal requires bone meal items, which have a cost (bones from skeletons or composters). However, the production increase often justifies the cost. Consider bonemeal cost vs. production increase when deciding whether to use bonemeal.</p>

        <p>Bonemeal automation: Automated bonemeal dispensers can continuously apply bonemeal, creating fully automated farms with maximum production rates. Automated bonemeal farms are the most efficient farm designs, producing thousands of items per hour.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Bonemeal Strategy</h3>
        <p>Bonemeal strategy: Use bonemeal for maximum production rates, automate bonemeal application for continuous production, consider bonemeal cost vs. production increase, and understand that bonemeal is essential for maximum yields. Bonemeal dramatically increases production rates and is essential for efficient farms.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Farm Optimization Strategies</h2>
        
        <p>Farm optimization strategies help players maximize yields and production rates. Multiple approaches can optimize farm performance.</p>

        <p>Farm size optimization balances size with maintenance needs. Larger farms produce more but require more resources and maintenance. Optimal size depends on needs: Small (9-25 blocks) for personal use, Medium (50-100 blocks) for moderate needs, Large (200+ blocks) for extensive needs. Balance size with available resources and time.</p>

        <p>Fortune optimization always uses Fortune III for maximum yields. Fortune III doubles yields, making it essential for maximum production. Prioritize obtaining Fortune III enchantment and always use Fortune III hoes for harvesting.</p>

        <p>Bonemeal optimization uses bonemeal for instant growth and maximum production rates. Bonemeal eliminates growth time, dramatically increasing yield per hour. Use bonemeal for maximum production, especially for high-value crops or when time is limited.</p>

        <p>Growth condition optimization ensures optimal light, hydration, and spacing. Full light (9+), water within 4 blocks, and proper spacing maximize growth speed. Optimize conditions to minimize growth time and maximize production rates.</p>

        <p>Automation optimization implements automated harvesting and bonemeal application. Automated farms produce continuously without player intervention, maximizing production rates. Automation is essential for large-scale production and efficient resource collection.</p>

        <p>Crop selection optimization chooses crops based on yields and needs. Nether Wart has highest base yield (2 per block). Carrot/Potato benefit most from Fortune. Select crops based on intended use and yield potential.</p>

        <hr />

        <h2 id="efficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Efficiency and Production Rates</h2>
        
        <p>Farm efficiency measures yield per block per time unit, helping compare different farm designs and optimize resource utilization. Understanding efficiency helps players optimize farm performance.</p>

        <p>Efficiency formula: Efficiency = Yield Per Hour / Farm Size. This measures items produced per block per hour. Higher efficiency means better resource utilization and more effective farm designs. Efficiency helps compare different farm layouts and optimize designs.</p>

        <p>Production rate optimization maximizes yield per hour through Fortune, bonemeal, and growth optimization. Higher production rates mean more resources collected over time. Optimize all factors to maximize production rates.</p>

        <p>Resource efficiency balances production with resource costs. Bonemeal has a cost but dramatically increases production. Fortune has no ongoing cost but requires enchantment. Balance production increases with resource costs to optimize overall efficiency.</p>

        <p>Time efficiency maximizes production per time invested. Automated farms produce continuously without player time. Manual farms require player time for harvesting. Consider time investment when evaluating farm efficiency.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Efficiency Optimization</h3>
        <p>To optimize efficiency: maximize yield per block (Fortune III, optimal crops), minimize growth time (bonemeal, optimal conditions), automate production (continuous harvesting), and balance production with resource costs. Efficiency optimization maximizes resource utilization and farm performance.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Minecraft farm yields determine resource production rates and farm efficiency. Understanding yields, Fortune enchantment, bonemeal usage, and optimization strategies helps players maximize production and optimize farm designs.</p>

        <p>Key factors affecting yields include: farm size, crop type, growth time, Fortune enchantment, and bonemeal usage. Fortune III doubles yields, while bonemeal eliminates growth time, dramatically increasing production rates. Understanding these factors helps players optimize farm performance.</p>

        <p>Optimization strategies include: farm size optimization, Fortune optimization (always use Fortune III), bonemeal optimization (for maximum production), growth condition optimization, automation optimization, and crop selection optimization. By combining these strategies, players can maximize yields and production rates.</p>

        <p>Remember that Fortune III and bonemeal are essential for maximum yields. Fortune III doubles yields without increasing farm size, while bonemeal eliminates growth time for maximum production rates. Use calculators to evaluate yields and optimize farm designs. With proper understanding and optimization, players can maximize farm yields and production rates effectively.</p>
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
          <p>This tool calculates Minecraft farm yields based on farm size (number of crop blocks), crop type (Wheat/Carrot/Potato/Beetroot/Nether Wart), growth time (minutes), optional bonemeal usage (instant growth), optional Fortune enchantment level (0-3), and optional time period (hours).</p>
          <p>Outputs include base yield (per harvest), Fortune multiplier (1.0x-2.0x), total yield (per harvest with Fortune), yield per hour, yield per day (24 hours), efficiency (items per block per hour), status assessment (low-yield/moderate-yield/high-yield/very-high-yield), interpretation, recommendations, and action plan.</p>
          <p>Formulas use yield calculations: Base Yield = Farm Size × Base Yield Per Block, Fortune Multiplier = 1.0x-2.0x based on level, Total Yield = Base Yield × Fortune Multiplier, Cycles Per Hour = 60 / Growth Time, Yield Per Hour = Total Yield × Cycles Per Hour, Efficiency = Yield Per Hour / Farm Size. The guide covers crop types, growth time, Fortune enchantment, bonemeal usage, optimization strategies, and efficiency. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Minecraft farm yield calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
