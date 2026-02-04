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
  mobType: z.enum(['zombie', 'skeleton', 'spider', 'creeper', 'enderman', 'blaze', 'guardian', 'witch'], { invalid_type_error: 'Select mob type' }),
  spawnRate: z.number({ invalid_type_error: 'Enter spawn rate' }).min(0.1),
  killRate: z.number({ invalid_type_error: 'Enter kill rate' }).min(0.1),
  xpPerMob: z.number({ invalid_type_error: 'Enter XP per mob' }).min(1).optional(),
  farmEfficiency: z.number({ invalid_type_error: 'Enter farm efficiency' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Base XP per mob type
const mobXP: Record<string, number> = {
  zombie: 5,
  skeleton: 5,
  spider: 5,
  creeper: 5,
  enderman: 5,
  blaze: 10,
  guardian: 10,
  witch: 5,
};

type ResultPayload = {
  mobType: string;
  spawnRate: number;
  killRate: number;
  xpPerMob: number;
  farmEfficiency: number;
  xpPerKill: number;
  xpPerMinute: number;
  xpPerHour: number;
  xpPerDay: number;
  mobsPerMinute: number;
  mobsPerHour: number;
  effectiveXPPerHour: number;
  status: 'low-rate' | 'moderate-rate' | 'high-rate' | 'very-high-rate';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Select the mob type you want to farm (Zombie, Skeleton, Spider, Creeper, Enderman, Blaze, Guardian, or Witch).',
  'Enter the spawn rate (mobs spawning per minute) in your farm.',
  'Enter the kill rate (mobs killed per minute) in your farm.',
  'Optionally enter custom XP per mob (defaults based on mob type).',
  'Optionally enter farm efficiency percentage (0-100%) to account for missed kills or inefficiencies.',
  'Review XP generation rates per minute/hour/day, mob kill rates, and recommendations.',
];

const faqs = [
  {
    question: 'How do mob farms generate XP in Minecraft?',
    answer:
      'Mob farms generate XP by spawning and killing mobs. Each mob type provides different XP amounts when killed. XP generation rate depends on spawn rate (mobs spawning per minute), kill rate (mobs killed per minute), XP per mob, and farm efficiency. Understanding these factors helps optimize XP generation.',
  },
  {
    question: 'What is the XP per mob for different mob types?',
    answer:
      'XP per mob varies: Zombie/Skeleton/Spider/Creeper/Enderman/Witch = 5 XP, Blaze/Guardian = 10 XP. These are base values; actual XP may vary slightly. Higher XP mobs (blaze, guardian) provide more XP per kill but may be harder to farm. Choose mob types based on XP needs and farm complexity.',
  },
  {
    question: 'How do I calculate XP generation rate?',
    answer:
      'XP Generation Rate = (Kill Rate × XP Per Mob) × (Farm Efficiency / 100). For example, 20 kills/minute × 5 XP/kill × 90% efficiency = 90 XP/minute. Multiply by 60 for hourly rate, by 1440 for daily rate. Higher kill rates and efficiency increase XP generation.',
  },
  {
    question: 'What is farm efficiency?',
    answer:
      'Farm efficiency is the percentage of spawned mobs that are successfully killed. 100% efficiency means all spawned mobs are killed. Lower efficiency accounts for missed kills, mobs escaping, or other inefficiencies. Real farms typically achieve 80-95% efficiency depending on design.',
  },
  {
    question: 'Which mob type is best for XP farming?',
    answer:
      'Blaze and Guardian provide most XP per mob (10 XP) but may be harder to farm. Zombie/Skeleton/Spider provide 5 XP and are easier to farm. Choose based on: XP per mob (blaze/guardian for maximum), spawn rates (easier mobs may spawn faster), and farm complexity (simpler farms may have better efficiency).',
  },
  {
    question: 'How do I optimize mob farm XP rates?',
    answer:
      'To optimize XP rates: maximize spawn rates (improve farm design, lighting, spawn platforms), maximize kill rates (efficient killing mechanisms, proper timing), choose high-XP mobs when possible (blaze, guardian), improve farm efficiency (reduce mob escapes, optimize killing), and automate killing for continuous XP generation.',
  },
  {
    question: 'What is a good XP generation rate?',
    answer:
      'Good XP rates vary: Low = 50-200 XP/hour, Moderate = 200-1000 XP/hour, High = 1000-5000 XP/hour, Very High = 5000+ XP/hour. Rates depend on mob type, farm design, and efficiency. Well-designed farms can achieve 1000-5000+ XP/hour. Higher rates are better for faster leveling and enchanting.',
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
    name: 'Minecraft Nether Portal Linkage Estimator',
    slug: 'minecraft-nether-portal-linkage-estimator',
    description: 'Estimate nether portal linkage between overworld and nether coordinates.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/minecraft-mob-farm-xp-rate-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Minecraft Mob Farm XP Rate Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Minecraft Mob Farm XP Rate Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate XP generation rates for Minecraft mob farms based on mob spawn rates, kill rates, and XP per mob.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'The Complete Guide to Minecraft Mob Farm XP Generation: Understanding XP Rates and Optimization',
      description: 'A comprehensive guide to Minecraft mob farm XP generation, calculating XP rates, optimizing spawn and kill rates, and maximizing XP efficiency.',
      author: {
        '@type': 'Organization',
        name: 'MegaCalc Hub Gaming Team',
      },
      datePublished: '2025-01-24',
      image: 'https://mycalculating.com/assets/minecraft-mob-farm-xp-rate-calculator.png',
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
  const mobType = values.mobType;
  const spawnRate = values.spawnRate;
  const killRate = values.killRate;
  const xpPerMob = values.xpPerMob ?? mobXP[mobType] ?? 5;
  const farmEfficiency = values.farmEfficiency ?? 100;

  // XP per kill (base XP per mob)
  const xpPerKill = xpPerMob;

  // Effective kill rate (accounting for efficiency)
  const effectiveKillRate = killRate * (farmEfficiency / 100);

  // XP per minute
  const xpPerMinute = effectiveKillRate * xpPerKill;

  // XP per hour
  const xpPerHour = xpPerMinute * 60;

  // XP per day (24 hours)
  const xpPerDay = xpPerHour * 24;

  // Mobs per minute (actual kill rate)
  const mobsPerMinute = effectiveKillRate;

  // Mobs per hour
  const mobsPerHour = mobsPerMinute * 60;

  // Effective XP per hour (for display)
  const effectiveXPPerHour = xpPerHour;

  let status: ResultPayload['status'] = 'moderate-rate';
  let interpretation = 'Your mob farm XP generation rate has been calculated based on mob type, spawn rate, kill rate, and efficiency.';

  if (xpPerHour >= 5000) {
    status = 'very-high-rate';
    interpretation = `Very high XP rate! ${xpPerHour.toFixed(0)} XP/hour. This is an excellent mob farm with exceptional XP generation. Perfect for fast leveling and enchanting.`;
  } else if (xpPerHour >= 1000) {
    status = 'high-rate';
    interpretation = `High XP rate! ${xpPerHour.toFixed(0)} XP/hour. This is a good mob farm with strong XP generation. Great for efficient leveling.`;
  } else if (xpPerHour >= 200) {
    status = 'moderate-rate';
    interpretation = `Moderate XP rate. ${xpPerHour.toFixed(0)} XP/hour. This is a decent mob farm with reasonable XP generation. Suitable for regular leveling needs.`;
  } else {
    status = 'low-rate';
    interpretation = `Lower XP rate. ${xpPerHour.toFixed(0)} XP/hour. This farm may need optimization to improve XP generation. Consider improving spawn rates, kill rates, or efficiency.`;
  }

  const recommendations = [
    `Mob Type: ${mobType.charAt(0).toUpperCase() + mobType.slice(1)}. Base XP per mob: ${xpPerMob} XP. ${xpPerMob >= 10 ? 'High XP mob - excellent for XP generation.' : 'Standard XP mob - good for XP generation.'}`,
    `Spawn Rate: ${spawnRate.toFixed(1)} mobs/minute. ${spawnRate >= 20 ? 'High spawn rate - excellent for XP generation.' : spawnRate >= 10 ? 'Moderate spawn rate - good for XP generation.' : 'Lower spawn rate - consider improving farm design to increase spawns.'}`,
    `Kill Rate: ${killRate.toFixed(1)} kills/minute. ${killRate >= 20 ? 'High kill rate - excellent for XP generation.' : killRate >= 10 ? 'Moderate kill rate - good for XP generation.' : 'Lower kill rate - consider improving killing mechanism to increase kills.'}`,
    `Farm Efficiency: ${farmEfficiency}%. ${farmEfficiency >= 90 ? 'Excellent efficiency - nearly all mobs are killed.' : farmEfficiency >= 75 ? 'Good efficiency - most mobs are killed.' : 'Lower efficiency - consider improving farm design to reduce mob escapes.'}`,
    `XP Generation: ${xpPerHour.toFixed(0)} XP/hour. ${xpPerHour >= 5000 ? 'Exceptional rate - excellent for fast leveling.' : xpPerHour >= 1000 ? 'High rate - great for efficient leveling.' : xpPerHour >= 200 ? 'Moderate rate - decent for regular leveling.' : 'Lower rate - consider optimizing farm for better XP generation.'}`,
    `Mobs Killed: ${mobsPerHour.toFixed(0)} mobs/hour. ${mobsPerHour >= 1200 ? 'High kill volume - excellent farm performance.' : mobsPerHour >= 600 ? 'Moderate kill volume - good farm performance.' : 'Lower kill volume - consider improving kill rates.'}`,
  ];

  if (spawnRate > killRate) {
    recommendations.push(`Spawn vs Kill Rate: Spawn rate (${spawnRate.toFixed(1)}) exceeds kill rate (${killRate.toFixed(1)}). Consider improving killing mechanism to match spawn rate and maximize XP generation.`);
  } else if (killRate > spawnRate * 1.2) {
    recommendations.push(`Spawn vs Kill Rate: Kill rate (${killRate.toFixed(1)}) significantly exceeds spawn rate (${spawnRate.toFixed(1)}). Consider improving spawn rates to match kill capacity and maximize XP generation.`);
  }

  if (farmEfficiency < 80) {
    recommendations.push('Efficiency Optimization: Farm efficiency is below 80%. To improve: reduce mob escapes, optimize killing mechanism timing, improve farm design to prevent mobs from avoiding kills, and ensure proper mob pathfinding. Higher efficiency significantly increases XP generation.');
  }

  const plan = [
    {
      label: 'This Session',
      detail: `XP generation: ${xpPerHour.toFixed(0)} XP/hour, ${mobsPerHour.toFixed(0)} mobs/hour. ${xpPerHour >= 1000 ? 'Excellent rate - great for leveling.' : xpPerHour >= 200 ? 'Good rate - suitable for leveling.' : 'Consider optimizing farm for better rates.'}`
    },
    {
      label: 'This Week',
      detail: 'Optimize mob farm: improve spawn rates (better farm design, lighting, spawn platforms), increase kill rates (efficient killing mechanisms), improve efficiency (reduce mob escapes), and consider higher-XP mobs (blaze, guardian) if feasible.'
    },
    {
      label: 'Ongoing',
      detail: 'Continuously optimize XP generation: monitor spawn and kill rates, maintain high efficiency, upgrade to better mob types when possible, automate killing for continuous XP, and track XP generation to identify optimization opportunities.'
    },
  ];

  return {
    mobType,
    spawnRate,
    killRate,
    xpPerMob,
    farmEfficiency,
    xpPerKill,
    xpPerMinute,
    xpPerHour,
    xpPerDay,
    mobsPerMinute,
    mobsPerHour,
    effectiveXPPerHour,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MinecraftMobFarmXPRateCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobType: undefined,
      spawnRate: undefined,
      killRate: undefined,
      xpPerMob: undefined,
      farmEfficiency: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="minecraft-mob-farm-xp-rate-calculator-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Minecraft Mob Farm XP Rate Calculator
          </CardTitle>
          <CardDescription>Calculate XP generation rates for Minecraft mob farms based on mob spawn rates, kill rates, and XP per mob.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your mob farm information</CardTitle>
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
                  name="mobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mob Type</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as FormValues['mobType'])}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Select mob type</option>
                          <option value="zombie">Zombie (5 XP)</option>
                          <option value="skeleton">Skeleton (5 XP)</option>
                          <option value="spider">Spider (5 XP)</option>
                          <option value="creeper">Creeper (5 XP)</option>
                          <option value="enderman">Enderman (5 XP)</option>
                          <option value="blaze">Blaze (10 XP)</option>
                          <option value="guardian">Guardian (10 XP)</option>
                          <option value="witch">Witch (5 XP)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="spawnRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spawn Rate (mobs per minute)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="killRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kill Rate (kills per minute)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 14" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="xpPerMob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>XP Per Mob (optional, defaults based on mob type)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="farmEfficiency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Efficiency (0-100%, optional, defaults to 100%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate XP Rate
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
            <CardDescription>See XP generation rates per minute/hour/day, mob kill rates, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">XP Per Hour</p>
                <p className="text-2xl font-semibold text-primary">{result.xpPerHour.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">XP/hour</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">XP Per Day</p>
                <p className="text-2xl font-semibold text-primary">{result.xpPerDay.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">XP/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Mobs Per Hour</p>
                <p className="text-2xl font-semibold text-primary">{result.mobsPerHour.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Mobs/hour</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">XP Per Minute</p>
                <p className="text-xl font-semibold text-primary">{result.xpPerMinute.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">XP/minute</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">XP Per Kill</p>
                <p className="text-xl font-semibold text-primary">{result.xpPerKill}</p>
                <p className="text-xs text-muted-foreground">XP per mob</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Farm Efficiency</p>
                <p className="text-xl font-semibold text-primary">{result.farmEfficiency}%</p>
                <p className="text-xs text-muted-foreground">{result.farmEfficiency >= 90 ? 'Excellent' : result.farmEfficiency >= 75 ? 'Good' : 'Needs improvement'}</p>
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
            <strong>XP Per Kill</strong> = XP Per Mob (varies by mob type: 5 XP for most mobs, 10 XP for blaze/guardian). This is the base XP gained from killing one mob. Higher XP mobs provide more XP per kill.
          </p>
          <p>
            <strong>Effective Kill Rate</strong> = Kill Rate × (Farm Efficiency / 100). This accounts for farm efficiency, calculating how many mobs are actually killed considering missed kills or inefficiencies. Higher efficiency means more effective kills.
          </p>
          <p>
            <strong>XP Per Minute</strong> = Effective Kill Rate × XP Per Kill. This calculates XP generation per minute based on effective kill rate and XP per mob. Higher kill rates and XP per mob increase XP per minute.
          </p>
          <p>
            <strong>XP Per Hour</strong> = XP Per Minute × 60. This calculates total XP generation per hour. Multiply hourly rate by 24 for daily rate. Higher rates mean faster leveling and enchanting.
          </p>
          <p>
            <strong>Mobs Per Hour</strong> = Effective Kill Rate × 60. This calculates total mobs killed per hour. Useful for understanding farm performance and kill volume. Higher kill rates mean more mobs processed.
          </p>
          <p>
            <strong>Farm Efficiency</strong> = (Actual Kills / Spawned Mobs) × 100. This measures how effectively the farm kills spawned mobs. 100% efficiency means all spawned mobs are killed. Lower efficiency accounts for mobs escaping or not being killed.
          </p>
          <p>These formulas help you understand XP generation rates, calculate farm performance, and optimize mob farms for maximum XP generation. Track spawn rates, kill rates, and efficiency to identify optimization opportunities.</p>
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
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Complete Guide to Minecraft Mob Farm XP Generation: Understanding XP Rates and Optimization</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Minecraft mob farm XP generation, calculating XP rates, optimizing spawn and kill rates, and maximizing XP efficiency.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding Mob Farm XP</a></li>
          <li><a href="#mechanics" className="hover:underline">XP Generation Mechanics</a></li>
          <li><a href="#mob-types" className="hover:underline">Mob Types and XP Values</a></li>
          <li><a href="#rates" className="hover:underline">Spawn and Kill Rates</a></li>
          <li><a href="#efficiency" className="hover:underline">Farm Efficiency Optimization</a></li>
          <li><a href="#optimization" className="hover:underline">XP Rate Optimization Strategies</a></li>
          <li><a href="#design" className="hover:underline">Mob Farm Design Principles</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding Mob Farm XP</h2>
        <p>Mob farms in Minecraft generate experience points (XP) by spawning and killing mobs. Understanding mob farm XP generation helps players optimize farms for maximum XP rates, efficient leveling, and enchanting. XP generation depends on multiple factors including mob type, spawn rates, kill rates, and farm efficiency.</p>

        <p>XP generation rate measures how much XP a mob farm produces per time unit (typically per hour). Higher XP rates mean faster leveling and more efficient enchanting. Understanding XP rates helps players evaluate farm performance and identify optimization opportunities.</p>

        <p>Key factors affecting XP generation include: mob type (different mobs provide different XP), spawn rate (mobs spawning per minute), kill rate (mobs killed per minute), XP per mob (varies by mob type), and farm efficiency (percentage of spawned mobs successfully killed). Understanding these factors helps optimize XP generation.</p>

        <p>XP generation calculation: XP Rate = (Kill Rate × XP Per Mob) × (Farm Efficiency / 100). This formula calculates effective XP generation accounting for kill rates, XP per mob, and farm efficiency. Higher values in all factors increase XP generation.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why XP Generation Matters</h3>
        <p>XP generation matters because it enables leveling, enchanting, mending repairs, and efficient gameplay. Higher XP rates mean faster progression, more enchanting opportunities, and better resource management. Understanding XP generation helps players optimize farms for maximum efficiency.</p>

        <hr />

        <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">XP Generation Mechanics</h2>

        <p>XP generation mechanics determine how mob farms produce experience points. Understanding mechanics helps players design effective farms and optimize XP rates.</p>

        <p>Spawn mechanics: Mobs spawn in dark areas within spawn chunks or player-loaded chunks. Spawn rates depend on available spawn spaces, mob cap, and spawn conditions. Higher spawn rates require more spawn platforms, proper lighting control, and efficient spawn area design.</p>

        <p>Kill mechanics: Mobs must be killed to generate XP. Kill rates depend on killing mechanism efficiency, timing, and farm design. Efficient killing mechanisms (fall damage, suffocation, entity cramming) can achieve high kill rates. Player kills provide full XP, while other methods may vary.</p>

        <p>XP distribution: XP is distributed when mobs are killed. XP orbs are generated and collected by nearby players. XP per mob varies by mob type. Understanding XP distribution helps players position themselves optimally for XP collection.</p>

        <p>Efficiency factors: Farm efficiency measures how effectively spawned mobs are killed. 100% efficiency means all spawned mobs are killed. Lower efficiency accounts for mobs escaping, not being killed, or other inefficiencies. Higher efficiency significantly increases XP generation.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Mechanics Optimization</h3>
        <p>Optimize mechanics by: maximizing spawn rates (more spawn platforms, proper lighting), improving kill rates (efficient killing mechanisms), increasing efficiency (reduce mob escapes), and optimizing XP collection (position players near kill area). Understanding mechanics helps optimize all aspects of XP generation.</p>

        <hr />

        <h2 id="mob-types" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Mob Types and XP Values</h2>

        <p>Different mob types provide different XP amounts when killed. Understanding mob types and XP values helps players choose optimal mobs for XP farming.</p>

        <p>Standard XP mobs (5 XP): Zombie, Skeleton, Spider, Creeper, Enderman, Witch. These mobs provide 5 XP per kill and are common and easy to farm. Standard XP mobs are good for general XP farming and are typically easier to design farms for.</p>

        <p>High XP mobs (10 XP): Blaze, Guardian. These mobs provide 10 XP per kill, double the standard amount. High XP mobs are excellent for maximum XP generation but may be harder to farm due to special requirements (nether for blaze, ocean monuments for guardian).</p>

        <p>Mob selection factors: Consider XP per mob (higher is better), spawn rates (easier mobs may spawn faster), farm complexity (simpler farms may have better efficiency), and location requirements (some mobs require specific biomes or structures). Balance these factors when choosing mob types.</p>

        <p>XP value impact: Higher XP per mob directly increases XP generation rates. For example, blaze farms (10 XP) generate twice the XP of zombie farms (5 XP) with the same kill rate. However, farm complexity and spawn rates also matter. Choose mobs that balance XP value with farm feasibility.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Mob Type Selection</h3>
        <p>Select mob types based on: XP needs (high XP mobs for maximum generation), farm complexity (simpler mobs for easier farms), spawn rates (faster spawning mobs for higher rates), and location (accessible mobs for convenience). Balance XP value with practical considerations for optimal selection.</p>

        <hr />

        <h2 id="rates" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Spawn and Kill Rates</h2>

        <p>Spawn and kill rates directly determine XP generation capacity. Understanding rates helps players optimize farms for maximum XP generation.</p>

        <p>Spawn rate measures how many mobs spawn per minute in the farm. Higher spawn rates require more spawn platforms, proper lighting control, and efficient spawn area design. Spawn rates are limited by mob cap and available spawn spaces. Optimize spawn rates by maximizing spawn platforms and maintaining proper spawn conditions.</p>

        <p>Kill rate measures how many mobs are killed per minute in the farm. Higher kill rates require efficient killing mechanisms, proper timing, and optimized farm design. Kill rates should ideally match or exceed spawn rates to maximize XP generation. Optimize kill rates by improving killing mechanisms and reducing delays.</p>

        <p>Rate balance: Spawn rate and kill rate should be balanced. If spawn rate exceeds kill rate, mobs accumulate and may escape. If kill rate exceeds spawn rate, killing capacity is underutilized. Balance rates to maximize XP generation while maintaining farm efficiency.</p>

        <p>Rate optimization: To optimize rates, maximize spawn platforms for higher spawn rates, improve killing mechanisms for higher kill rates, balance spawn and kill rates, and monitor rates to identify bottlenecks. Rate optimization significantly increases XP generation.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Rate Optimization Strategy</h3>
        <p>Rate optimization strategy: measure current spawn and kill rates, identify bottlenecks (spawn or kill limited), optimize limiting factor, balance rates for maximum efficiency, and continuously monitor and adjust. Rate optimization is essential for maximum XP generation.</p>

        <hr />

        <h2 id="efficiency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Farm Efficiency Optimization</h2>

        <p>Farm efficiency measures how effectively spawned mobs are killed. Higher efficiency means more XP generation from the same spawn rate. Understanding efficiency helps players optimize farms for maximum XP output.</p>

        <p>Efficiency calculation: Efficiency = (Actual Kills / Spawned Mobs) × 100. 100% efficiency means all spawned mobs are killed. Lower efficiency accounts for mobs escaping, not being killed, or other inefficiencies. Real farms typically achieve 80-95% efficiency depending on design.</p>

        <p>Efficiency factors: Killing mechanism effectiveness (efficient mechanisms kill more mobs), mob pathfinding (proper paths ensure mobs reach kill area), escape prevention (prevent mobs from avoiding kills), timing optimization (proper timing ensures mobs are killed), and farm design (good design reduces inefficiencies).</p>

        <p>Efficiency improvement: To improve efficiency, optimize killing mechanisms for faster kills, improve mob pathfinding to ensure mobs reach kill area, prevent mob escapes with proper barriers, optimize timing for maximum kills, and refine farm design to reduce inefficiencies. Higher efficiency significantly increases XP generation.</p>

        <p>Efficiency impact: Higher efficiency directly increases XP generation. For example, 90% efficiency generates 10% more XP than 80% efficiency with the same spawn rate. Small efficiency improvements can significantly increase XP generation over time.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Efficiency Strategy</h3>
        <p>Efficiency strategy: measure current efficiency, identify inefficiency causes (escapes, missed kills, timing), address specific issues, optimize killing mechanisms and pathfinding, and continuously monitor and improve. Efficiency optimization is essential for maximum XP generation.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">XP Rate Optimization Strategies</h2>

        <p>XP rate optimization strategies help players maximize XP generation from mob farms. Multiple approaches can optimize XP rates.</p>

        <p>Spawn rate optimization maximizes mob spawning. Increase spawn platforms for more spawn spaces, optimize lighting for proper spawn conditions, maintain spawn chunks for continuous spawning, and design efficient spawn areas. Higher spawn rates directly increase XP generation potential.</p>

        <p>Kill rate optimization maximizes mob killing. Improve killing mechanisms for faster kills, optimize timing for continuous killing, reduce delays between kills, and ensure efficient mob delivery to kill area. Higher kill rates directly increase XP generation.</p>

        <p>Mob type optimization uses high-XP mobs when feasible. Choose blaze or guardian for maximum XP per kill, balance XP value with farm complexity, and consider spawn rates when selecting mobs. Higher XP per mob increases XP generation rates.</p>

        <p>Efficiency optimization maximizes kill effectiveness. Improve killing mechanisms, optimize pathfinding, prevent mob escapes, and refine farm design. Higher efficiency increases XP generation from the same spawn rate.</p>

        <p>Automation optimization enables continuous XP generation. Automate killing for continuous operation, optimize player positioning for XP collection, and ensure farm runs continuously. Automation maximizes XP generation over time.</p>

        <hr />

        <h2 id="design" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Mob Farm Design Principles</h2>

        <p>Effective mob farm design maximizes XP generation through optimal spawn rates, kill rates, and efficiency. Understanding design principles helps players build efficient farms.</p>

        <p>Spawn area design maximizes spawn rates. Use multiple spawn platforms for more spawn spaces, maintain proper lighting (dark for hostile mobs), ensure adequate spawn area size, and optimize spawn platform spacing. Good spawn area design increases spawn rates significantly.</p>

        <p>Killing mechanism design maximizes kill rates. Use efficient killing methods (fall damage, suffocation, entity cramming), optimize timing for continuous killing, ensure reliable mob delivery to kill area, and minimize delays between kills. Good killing mechanism design increases kill rates significantly.</p>

        <p>Pathfinding design ensures mobs reach kill area. Design clear paths for mobs to follow, use water streams or other transport methods, prevent mobs from getting stuck, and optimize pathfinding for efficiency. Good pathfinding design increases efficiency significantly.</p>

        <p>Escape prevention design prevents mobs from avoiding kills. Use barriers to prevent escapes, design enclosed kill areas, ensure mobs cannot avoid killing mechanisms, and optimize farm layout. Good escape prevention design increases efficiency significantly.</p>

        <p>XP collection design optimizes XP orb collection. Position players near kill area for XP collection, design collection areas for efficient XP gathering, and ensure XP orbs are accessible. Good XP collection design maximizes XP gained from kills.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Design Strategy</h3>
        <p>Design strategy: plan farm layout for optimal spawn and kill rates, design efficient killing mechanisms, ensure proper pathfinding and escape prevention, optimize XP collection, and test and refine design for maximum efficiency. Good design is essential for maximum XP generation.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Minecraft mob farm XP generation depends on multiple factors including mob type, spawn rates, kill rates, XP per mob, and farm efficiency. Understanding these factors and optimization strategies helps players maximize XP generation and optimize farms for efficient leveling and enchanting.</p>

        <p>Key factors affecting XP generation include: mob type (higher XP mobs provide more XP per kill), spawn rate (more spawns mean more XP potential), kill rate (more kills mean more XP), XP per mob (varies by mob type), and farm efficiency (higher efficiency means more XP from same spawn rate). Understanding these factors helps optimize XP generation.</p>

        <p>Optimization strategies include: spawn rate optimization (maximize spawn platforms and conditions), kill rate optimization (improve killing mechanisms), mob type optimization (use high-XP mobs when feasible), efficiency optimization (maximize kill effectiveness), and automation optimization (enable continuous operation). By combining these strategies, players can maximize XP generation and optimize farms effectively.</p>

        <p>Remember that XP generation is a product of multiple factors. Optimize all factors for maximum XP rates. Use high-XP mobs when feasible, maximize spawn and kill rates, maintain high efficiency, and automate for continuous operation. With proper understanding and optimization, players can maximize XP generation and optimize mob farms effectively.</p>
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
          <p>This tool calculates Minecraft mob farm XP generation rates based on mob type (Zombie/Skeleton/Spider/Creeper/Enderman/Blaze/Guardian/Witch), spawn rate (mobs per minute), kill rate (kills per minute), optional custom XP per mob, and optional farm efficiency (0-100%).</p>
          <p>Outputs include XP per kill (varies by mob type: 5 XP for most, 10 XP for blaze/guardian), XP per minute/hour/day (calculated from effective kill rate and XP per mob), mobs per minute/hour (effective kill rate), farm efficiency percentage, status assessment (low-rate/moderate-rate/high-rate/very-high-rate), interpretation, recommendations, and action plan.</p>
          <p>Formulas use XP generation calculations: XP Per Kill = XP Per Mob, Effective Kill Rate = Kill Rate × (Efficiency / 100), XP Per Minute = Effective Kill Rate × XP Per Kill, XP Per Hour = XP Per Minute × 60, Mobs Per Hour = Effective Kill Rate × 60. The guide covers XP mechanics, mob types, spawn/kill rates, efficiency optimization, and farm design. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Minecraft mob farm XP rate calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
