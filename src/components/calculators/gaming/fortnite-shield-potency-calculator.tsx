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
  baseHealth: z.number({ invalid_type_error: 'Enter base health' }).min(1),
  shieldAmount: z.number({ invalid_type_error: 'Enter shield amount' }).min(0).max(100),
  shieldType: z.enum(['small', 'medium', 'large', 'chug'], { invalid_type_error: 'Select shield type' }),
  incomingDamage: z.number({ invalid_type_error: 'Enter incoming damage' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  baseHealth: number;
  shieldAmount: number;
  shieldType: string;
  incomingDamage: number;
  totalEffectiveHealth: number;
  damageAbsorbed: number;
  remainingShield: number;
  remainingHealth: number;
  shieldEffectiveness: number;
  survivalStatus: 'eliminated' | 'critical' | 'damaged' | 'protected' | 'full';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your base health (typically 100 HP).',
  'Enter your current shield amount (0-100).',
  'Select your shield type (Small Shield, Medium Shield, Large Shield, or Chug Jug).',
  'Optionally enter incoming damage to calculate damage absorption and remaining health/shield.',
  'Review total effective health, shield effectiveness, damage absorption, and recommendations.',
];

const faqs = [
  {
    question: 'What are shield types in Fortnite?',
    answer:
      'Fortnite has several shield types: Small Shield Potion (restores 25 shield, max 50), Medium Shield Potion (restores 50 shield, max 50), Large Shield Potion (restores 50 shield, max 100), and Chug Jug (restores 100 shield and 100 health). Each type has different restoration amounts and maximum shield capacity.',
  },
  {
    question: 'How does shield work in Fortnite?',
    answer:
      'Shield provides additional protection on top of base health. Damage is absorbed by shield first, then health. Shield can absorb up to 100 damage (full shield), while health can absorb up to 100 damage. Total effective health = Base Health + Shield Amount. Shield is lost when taking damage and must be restored with shield items.',
  },
  {
    question: 'What is total effective health?',
    answer:
      'Total effective health = Base Health + Shield Amount. This represents your total damage capacity before elimination. For example, 100 health + 50 shield = 150 effective health. Higher effective health means you can survive more damage before elimination.',
  },
  {
    question: 'How is damage absorbed by shield?',
    answer:
      'Damage is absorbed by shield first, then health. If you take 75 damage with 50 shield and 100 health: 50 damage is absorbed by shield (shield depleted), 25 damage is absorbed by health (health reduced to 75). Shield always absorbs damage before health, protecting your base health.',
  },
  {
    question: 'What is shield effectiveness?',
    answer:
      'Shield effectiveness = (Shield Amount / Total Effective Health) × 100. This shows what percentage of your effective health is shield. Higher shield effectiveness means more protection and less health at risk. Full shield (100) with 100 health = 50% effectiveness.',
  },
  {
    question: 'Should I prioritize shield or health?',
    answer:
      'Both are important, but shield is often prioritized because: shield absorbs damage first, protecting health; shield can be restored more easily in combat; and full shield provides significant protection. However, health is also critical - balance both for optimal survival.',
  },
  {
    question: 'How much damage can I survive with different shield amounts?',
    answer:
      'Survival depends on total effective health: 100 health + 0 shield = 100 damage capacity, 100 health + 50 shield = 150 damage capacity, 100 health + 100 shield = 200 damage capacity. Higher shield amounts significantly increase survival capacity. Most weapons deal 20-100+ damage per shot, so shield is essential for survival.',
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
    name: 'Fortnite Victory Royale Probability Estimator',
    slug: 'fortnite-victory-royale-probability-estimator',
    description: 'Estimate your probability of winning a Victory Royale based on current placement, player count, and skill level.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/fortnite-shield-potency-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Fortnite Shield Potency Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fortnite Shield Potency Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate shield effectiveness, damage absorption, and total effective health based on shield type, amount, and damage received.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'The Complete Guide to Fortnite Shield Potency: Understanding Shield Effectiveness and Protection',
      description: 'A comprehensive guide to Fortnite shield mechanics, including effective health calculations, damage absorption analysis, and strategies for maximizing survival.',
      author: {
        '@type': 'Organization',
        name: 'MegaCalc Hub Gaming Team',
      },
      datePublished: '2025-01-24',
    },
    {
      '@type': 'HowTo',
      name: 'How to use the Fortnite Shield Potency Calculator',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const baseHealth = values.baseHealth;
  const shieldAmount = values.shieldAmount;
  const shieldType = values.shieldType;
  const incomingDamage = values.incomingDamage ?? 0;

  // Total effective health
  const totalEffectiveHealth = baseHealth + shieldAmount;

  // Damage absorption calculation
  let damageAbsorbed = 0;
  let remainingShield = shieldAmount;
  let remainingHealth = baseHealth;

  if (incomingDamage > 0) {
    // Shield absorbs damage first
    if (incomingDamage <= shieldAmount) {
      // All damage absorbed by shield
      damageAbsorbed = incomingDamage;
      remainingShield = shieldAmount - incomingDamage;
      remainingHealth = baseHealth;
    } else {
      // Shield depleted, remaining damage goes to health
      damageAbsorbed = shieldAmount;
      remainingShield = 0;
      const damageToHealth = incomingDamage - shieldAmount;
      remainingHealth = Math.max(0, baseHealth - damageToHealth);
    }
  }

  // Shield effectiveness percentage
  const shieldEffectiveness = totalEffectiveHealth > 0 ? (shieldAmount / totalEffectiveHealth) * 100 : 0;

  // Survival status
  let survivalStatus: ResultPayload['survivalStatus'] = 'full';
  if (incomingDamage > 0) {
    if (remainingHealth <= 0) {
      survivalStatus = 'eliminated';
    } else if (remainingHealth <= 25) {
      survivalStatus = 'critical';
    } else if (remainingHealth <= 50) {
      survivalStatus = 'damaged';
    } else if (remainingShield > 0) {
      survivalStatus = 'protected';
    } else {
      survivalStatus = 'damaged';
    }
  } else {
    if (shieldAmount >= 100) {
      survivalStatus = 'full';
    } else if (shieldAmount >= 50) {
      survivalStatus = 'protected';
    } else {
      survivalStatus = 'damaged';
    }
  }

  let interpretation = 'Your shield potency has been calculated based on health, shield amount, and shield type.';
  if (incomingDamage > 0) {
    if (survivalStatus === 'eliminated') {
      interpretation = `Eliminated. ${incomingDamage} damage exceeds your total effective health of ${totalEffectiveHealth}. You cannot survive this damage.`;
    } else if (survivalStatus === 'critical') {
      interpretation = `Critical condition. After ${incomingDamage} damage, you have ${remainingHealth.toFixed(0)} health remaining. Immediate healing is required.`;
    } else if (survivalStatus === 'damaged') {
      interpretation = `Damaged but surviving. After ${incomingDamage} damage, you have ${remainingHealth.toFixed(0)} health remaining. Consider healing soon.`;
    } else {
      interpretation = `Protected. After ${incomingDamage} damage, you have ${remainingShield.toFixed(0)} shield and ${remainingHealth.toFixed(0)} health remaining. Good protection.`;
    }
  } else {
    if (shieldAmount >= 100) {
      interpretation = `Full shield protection! You have ${totalEffectiveHealth} total effective health with maximum shield. Excellent protection.`;
    } else if (shieldAmount >= 50) {
      interpretation = `Good shield protection. You have ${totalEffectiveHealth} total effective health. Consider obtaining more shield for maximum protection.`;
    } else {
      interpretation = `Limited shield protection. You have ${totalEffectiveHealth} total effective health. Prioritize obtaining more shield for better survival.`;
    }
  }

  const recommendations = [
    `Total Effective Health: ${totalEffectiveHealth} (${baseHealth} health + ${shieldAmount} shield). ${totalEffectiveHealth >= 200 ? 'Maximum protection - excellent survival capacity.' : totalEffectiveHealth >= 150 ? 'Good protection - solid survival capacity.' : totalEffectiveHealth >= 100 ? 'Basic protection - consider obtaining more shield.' : 'Low protection - prioritize shield collection.'}`,
    `Shield Effectiveness: ${shieldEffectiveness.toFixed(1)}%. ${shieldEffectiveness >= 50 ? 'High shield effectiveness - excellent protection.' : shieldEffectiveness >= 25 ? 'Moderate shield effectiveness - good protection.' : 'Low shield effectiveness - prioritize shield collection.'}`,
  ];

  if (incomingDamage > 0) {
    recommendations.push(`Damage Absorption: ${damageAbsorbed.toFixed(0)} damage absorbed by shield, ${Math.max(0, incomingDamage - damageAbsorbed).toFixed(0)} damage to health. ${damageAbsorbed >= shieldAmount ? 'Shield fully utilized - excellent protection.' : 'Shield partially utilized - some protection provided.'}`);
    recommendations.push(`Remaining Status: ${remainingShield.toFixed(0)} shield, ${remainingHealth.toFixed(0)} health. ${survivalStatus === 'eliminated' ? 'Eliminated - cannot survive.' : survivalStatus === 'critical' ? 'Critical - immediate healing required.' : survivalStatus === 'damaged' ? 'Damaged - healing recommended.' : 'Protected - good condition.'}`);
  } else {
    recommendations.push(`Shield Status: ${shieldAmount}/100 shield. ${shieldAmount >= 100 ? 'Full shield - maximum protection.' : shieldAmount >= 50 ? 'Partial shield - good protection, consider maxing.' : 'Low shield - prioritize shield collection for better survival.'}`);
  }

  recommendations.push(`Shield Type: ${shieldType.charAt(0).toUpperCase() + shieldType.slice(1)}. ${shieldType === 'chug' ? 'Chug Jug provides maximum restoration (100 shield + 100 health).' : shieldType === 'large' ? 'Large Shield Potion restores 50 shield (max 100).' : shieldType === 'medium' ? 'Medium Shield Potion restores 50 shield (max 50).' : 'Small Shield Potion restores 25 shield (max 50).'}`);

  if (shieldAmount < 100 && incomingDamage === 0) {
    recommendations.push('Shield Optimization: Prioritize obtaining Large Shield Potions or Chug Jugs to reach maximum shield (100). Full shield doubles your effective health and significantly improves survival chances.');
  }

  const plan = [
    {
      label: 'This Match',
      detail: `Manage shield: ${shieldAmount}/100 shield, ${totalEffectiveHealth} effective health. ${shieldAmount < 100 ? 'Prioritize shield collection to reach maximum protection.' : 'Maintain full shield for maximum survival capacity.'}`
    },
    {
      label: 'This Week',
      detail: 'Optimize shield management: prioritize shield items, understand shield types and restoration amounts, balance shield with health, and use shield strategically to protect health during combat.'
    },
    {
      label: 'Ongoing',
      detail: 'Continuously optimize shield usage: maintain maximum shield when possible, use shield to absorb damage and protect health, prioritize shield items in loot collection, and understand shield effectiveness for optimal survival strategies.'
    },
  ];

  return {
    baseHealth,
    shieldAmount,
    shieldType,
    incomingDamage,
    totalEffectiveHealth,
    damageAbsorbed,
    remainingShield,
    remainingHealth,
    shieldEffectiveness,
    survivalStatus,
    interpretation,
    recommendations,
    plan,
  };
};

export default function FortniteShieldPotencyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseHealth: undefined,
      shieldAmount: undefined,
      shieldType: undefined,
      incomingDamage: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="fortnite-shield-potency-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Fortnite Shield Potency Calculator
          </CardTitle>
          <CardDescription>Calculate shield effectiveness, damage absorption, and total effective health based on shield type, amount, and damage received.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your shield information</CardTitle>
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
                  name="baseHealth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Health</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shieldAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shield Amount (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shieldType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shield Type</FormLabel>
                      <FormControl>
                        <select
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value as 'small' | 'medium' | 'large' | 'chug')}
                          className="w-full px-3 py-2 border rounded-md"
                        >
                          <option value="">Select shield type</option>
                          <option value="small">Small Shield Potion (25 shield, max 50)</option>
                          <option value="medium">Medium Shield Potion (50 shield, max 50)</option>
                          <option value="large">Large Shield Potion (50 shield, max 100)</option>
                          <option value="chug">Chug Jug (100 shield + 100 health)</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="incomingDamage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incoming Damage (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Shield Potency
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
            <CardDescription>See total effective health, shield effectiveness, damage absorption, and survival status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Effective Health</p>
                <p className="text-2xl font-semibold text-primary">{result.totalEffectiveHealth}</p>
                <p className="text-xs text-muted-foreground">HP + Shield</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Shield Effectiveness</p>
                <p className="text-2xl font-semibold text-primary">{result.shieldEffectiveness.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total health</p>
              </div>
              {result.incomingDamage > 0 && (
                <>
                  <div className="p-4 border rounded">
                    <p className="text-sm text-muted-foreground">Damage Absorbed</p>
                    <p className="text-2xl font-semibold text-primary">{result.damageAbsorbed.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">By shield</p>
                  </div>
                  <div className="p-4 border rounded">
                    <p className="text-sm text-muted-foreground">Remaining Health</p>
                    <p className="text-2xl font-semibold text-primary">{result.remainingHealth.toFixed(0)}</p>
                    <p className="text-xs text-muted-foreground">HP</p>
                  </div>
                </>
              )}
              {result.incomingDamage === 0 && (
                <>
                  <div className="p-4 border rounded">
                    <p className="text-sm text-muted-foreground">Current Shield</p>
                    <p className="text-2xl font-semibold text-primary">{result.shieldAmount}/100</p>
                    <p className="text-xs text-muted-foreground">Shield</p>
                  </div>
                  <div className="p-4 border rounded">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-2xl font-semibold text-primary capitalize">{result.survivalStatus}</p>
                    <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                  </div>
                </>
              )}
            </div>
            {result.incomingDamage > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground">Remaining Shield</p>
                  <p className="text-xl font-semibold text-primary">{result.remainingShield.toFixed(0)}/100</p>
                  <p className="text-xs text-muted-foreground">Shield</p>
                </div>
                <div className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground">Survival Status</p>
                  <p className="text-xl font-semibold text-primary capitalize">{result.survivalStatus}</p>
                  <p className="text-xs text-muted-foreground">{result.interpretation}</p>
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
            <strong>Total Effective Health</strong> = Base Health + Shield Amount. This represents your total damage capacity before elimination. Shield provides additional protection on top of base health, effectively doubling your survival capacity when at maximum (100 shield + 100 health = 200 effective health).
          </p>
          <p>
            <strong>Shield Effectiveness</strong> = (Shield Amount / Total Effective Health) × 100. This shows what percentage of your effective health is shield. Higher shield effectiveness means more protection and less health at risk. Full shield (100) with 100 health = 50% effectiveness.
          </p>
          <p>
            <strong>Damage Absorption</strong>: Damage is absorbed by shield first, then health. If incoming damage ≤ shield amount, all damage is absorbed by shield. If incoming damage &gt; shield amount, shield is depleted and remaining damage goes to health. Formula: Damage to Health = Max(0, Incoming Damage - Shield Amount).
          </p>
          <p>
            <strong>Remaining Shield</strong> = Max(0, Shield Amount - Incoming Damage). This shows how much shield remains after taking damage. Shield is depleted first, protecting health from damage.
          </p>
          <p>
            <strong>Remaining Health</strong> = Max(0, Base Health - (Incoming Damage - Shield Amount)). This shows how much health remains after taking damage. Health is only damaged after shield is depleted.
          </p>
          <p>These formulas help you understand shield protection, calculate damage absorption, and plan survival strategies. Shield effectively doubles your survival capacity when at maximum, making it essential for combat survival.</p>
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
        <meta itemProp="name" content="The Complete Guide to Fortnite Shield Potency: Understanding Shield Effectiveness and Protection" />
        <meta itemProp="description" content="A comprehensive guide to Fortnite shield mechanics, shield effectiveness, damage absorption, and survival strategies." />
        <meta itemProp="keywords" content="Fortnite shield, shield potency, effective health, damage absorption, shield protection" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Fortnite Shield Potency: Understanding Shield Effectiveness and Protection</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Fortnite shield mechanics, shield effectiveness, damage absorption, and survival strategies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding Shield in Fortnite</a></li>
          <li><a href="#mechanics" className="hover:underline">Shield Mechanics and Types</a></li>
          <li><a href="#effectiveness" className="hover:underline">Shield Effectiveness and Calculation</a></li>
          <li><a href="#absorption" className="hover:underline">Damage Absorption and Protection</a></li>
          <li><a href="#health" className="hover:underline">Effective Health and Survival</a></li>
          <li><a href="#optimization" className="hover:underline">Shield Optimization Strategies</a></li>
          <li><a href="#management" className="hover:underline">Shield Management and Usage</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding Shield in Fortnite</h2>
        <p>Shield in Fortnite provides additional protection on top of base health, effectively doubling your survival capacity when at maximum. Understanding shield mechanics, effectiveness, and optimization strategies helps players maximize survival and combat effectiveness.</p>

        <p>Shield works by absorbing damage before health, protecting your base health from damage. When you take damage, shield is depleted first, then health. This design makes shield essential for survival, as it provides a buffer that protects your health during combat.</p>

        <p>Total effective health combines base health and shield amount, representing your total damage capacity before elimination. For example, 100 health + 100 shield = 200 effective health, meaning you can survive twice as much damage as health alone. Understanding effective health helps players evaluate survival capacity and plan strategies.</p>

        <p>Shield effectiveness shows what percentage of your effective health is shield. Higher shield effectiveness means more protection and less health at risk. Full shield (100) with 100 health = 50% effectiveness, meaning half your survival capacity is shield protection.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Shield Matters</h3>
        <p>Shield matters because it significantly increases survival capacity, protects health from damage, provides combat advantages, and is essential for competitive play. Players with full shield have double the survival capacity of players without shield, making shield collection and management critical for success.</p>

        <hr />

        <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Shield Mechanics and Types</h2>

        <p>Fortnite features several shield types with different restoration amounts and maximum capacities. Understanding shield types helps players choose appropriate items and optimize shield management.</p>

        <p>Small Shield Potion restores 25 shield with a maximum capacity of 50 shield. Small shields are common and useful for partial shield restoration. They're ideal for early game when full shield items are unavailable. Use small shields to reach 50 shield, then use large shields to reach 100.</p>

        <p>Medium Shield Potion restores 50 shield with a maximum capacity of 50 shield. Medium shields provide full restoration to the 50 shield cap. They're more efficient than small shields for reaching 50 shield. Use medium shields when you have 0-50 shield.</p>

        <p>Large Shield Potion restores 50 shield with a maximum capacity of 100 shield. Large shields are essential for reaching maximum shield (100). They're the primary method for achieving full shield protection. Use large shields when you have 50-100 shield capacity available.</p>

        <p>Chug Jug restores 100 shield and 100 health, providing maximum restoration. Chug Jugs are rare but provide complete restoration to maximum capacity. They're ideal for late game when you need full restoration quickly. Use Chug Jugs when you need both health and shield restoration.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Shield Type Strategy</h3>
        <p>Shield type strategy: Use small/medium shields to reach 50 shield early game. Use large shields to reach 100 shield mid to late game. Use Chug Jugs for complete restoration when available. Prioritize large shields and Chug Jugs for maximum protection. Balance shield type usage based on availability and needs.</p>

        <hr />

        <h2 id="effectiveness" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Shield Effectiveness and Calculation</h2>

        <p>Shield effectiveness measures how much of your total effective health is shield protection. Understanding effectiveness helps players evaluate shield value and optimize protection strategies.</p>

        <p>Shield effectiveness formula: Effectiveness = (Shield Amount / Total Effective Health) × 100. This calculates what percentage of your effective health is shield. Higher effectiveness means more protection and less health at risk. Full shield (100) with 100 health = 50% effectiveness.</p>

        <p>Effectiveness examples: 100 health + 0 shield = 0% effectiveness (no protection), 100 health + 50 shield = 33.3% effectiveness (moderate protection), 100 health + 100 shield = 50% effectiveness (maximum protection). Higher shield amounts provide better effectiveness and protection.</p>

        <p>Effectiveness impact: Higher effectiveness means more damage is absorbed by shield, protecting health. This is valuable because shield can be restored more easily than health in combat. Maintaining high shield effectiveness improves survival chances and combat performance.</p>

        <p>Optimal effectiveness: Maximum effectiveness is achieved with full shield (100) and full health (100), providing 50% effectiveness. This provides the best balance of protection and health. Aim for maximum shield whenever possible for optimal effectiveness.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Effectiveness Optimization</h3>
        <p>To optimize effectiveness: prioritize shield collection to reach maximum (100), maintain full health alongside full shield, use shield items strategically, and understand that higher shield amounts provide better effectiveness. Maximum effectiveness provides the best survival capacity and combat protection.</p>

        <hr />

        <h2 id="absorption" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Damage Absorption and Protection</h2>

        <p>Shield absorbs damage before health, providing protection that preserves your base health. Understanding damage absorption helps players evaluate shield value and plan survival strategies.</p>

        <p>Damage absorption mechanics: Damage is absorbed by shield first, then health. If incoming damage ≤ shield amount, all damage is absorbed by shield. If incoming damage &gt; shield amount, shield is depleted and remaining damage goes to health. This design protects health by using shield as a buffer.</p>

        <p>Absorption examples: With 50 shield and 100 health, taking 30 damage: 30 damage absorbed by shield (shield reduced to 20), 0 damage to health (health remains 100). Taking 75 damage: 50 damage absorbed by shield (shield depleted), 25 damage to health (health reduced to 75). Shield always protects health when available.</p>

        <p>Protection value: Shield provides significant protection by absorbing damage that would otherwise reduce health. This is valuable because shield can be restored more easily than health during combat. Maintaining shield protects health and improves survival chances.</p>

        <p>Strategic absorption: Use shield strategically to absorb damage during combat, protecting health. Prioritize shield restoration to maintain protection. Understand that shield depletion is preferable to health loss, as shield is easier to restore. Balance shield usage with health preservation.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Absorption Strategy</h3>
        <p>Absorption strategy: Allow shield to absorb damage during combat to protect health. Prioritize shield restoration after taking damage. Understand that shield depletion is acceptable if it protects health. Use shield as a buffer that can be restored, while health is more critical to preserve.</p>

        <hr />

        <h2 id="health" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Effective Health and Survival</h2>

        <p>Effective health combines base health and shield amount, representing total damage capacity before elimination. Understanding effective health helps players evaluate survival capacity and plan strategies.</p>

        <p>Effective health formula: Effective Health = Base Health + Shield Amount. This represents your total damage capacity. For example, 100 health + 100 shield = 200 effective health, meaning you can survive 200 damage before elimination. Understanding effective health helps players evaluate survival capacity.</p>

        <p>Survival capacity: Higher effective health means greater survival capacity. Players with 200 effective health can survive twice as much damage as players with 100 effective health. This makes shield essential for competitive play, as it significantly increases survival chances.</p>

        <p>Survival examples: 100 health + 0 shield = 100 damage capacity (eliminated at 100 damage), 100 health + 50 shield = 150 damage capacity (eliminated at 150 damage), 100 health + 100 shield = 200 damage capacity (eliminated at 200 damage). Higher shield amounts dramatically increase survival capacity.</p>

        <p>Combat advantage: Higher effective health provides combat advantages by allowing you to survive more damage and engage in longer fights. Players with full shield can take more risks and engage more aggressively, knowing they have greater survival capacity.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Survival Optimization</h3>
        <p>To optimize survival: prioritize shield collection to reach maximum (100), maintain full health alongside full shield, understand that effective health doubles with full shield, and use effective health to evaluate combat readiness. Maximum effective health (200) provides the best survival capacity and combat advantages.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Shield Optimization Strategies</h2>

        <p>Shield optimization strategies help players maximize shield protection and survival capacity. Multiple approaches can optimize shield management and usage.</p>

        <p>Shield collection prioritizes obtaining shield items to reach maximum shield (100). Prioritize large shield potions and Chug Jugs when available. Use small/medium shields to reach 50 shield early game. Always aim for maximum shield when possible for optimal protection.</p>

        <p>Shield maintenance keeps shield at maximum (100) whenever possible. Restore shield after taking damage. Prioritize shield restoration over other activities when shield is low. Maintain maximum shield for optimal survival capacity and combat readiness.</p>

        <p>Health balance maintains full health alongside full shield for maximum effective health (200). Don't sacrifice health for shield, as both are important. Balance shield and health restoration to achieve maximum effective health. Full health + full shield provides the best survival capacity.</p>

        <p>Strategic usage uses shield strategically to absorb damage during combat, protecting health. Allow shield to absorb damage rather than health when possible. Understand that shield depletion is preferable to health loss. Use shield as a buffer that can be restored.</p>

        <p>Item management manages shield items efficiently. Carry multiple shield items for restoration. Use items strategically based on current shield amount. Prioritize large shields and Chug Jugs for maximum restoration. Balance inventory space with shield item needs.</p>

        <hr />

        <h2 id="management" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Shield Management and Usage</h2>

        <p>Effective shield management helps players maintain protection and maximize survival capacity. Understanding management strategies helps players optimize shield usage and combat performance.</p>

        <p>Early game management focuses on quick shield collection to reach at least 50 shield. Use small/medium shields when available. Prioritize shield collection alongside loot collection. Don't spend too much time on shield collection, but ensure you have some protection.</p>

        <p>Mid game management focuses on reaching maximum shield (100) for optimal protection. Use large shield potions to reach 100 shield. Maintain shield at maximum when possible. Prioritize shield restoration after taking damage. Balance shield management with other activities.</p>

        <p>Late game management maintains maximum shield for final circle combat. Use Chug Jugs for complete restoration when available. Prioritize shield maintenance over other activities. Maximum shield is essential for late game survival and Victory Royale chances.</p>

        <p>Combat usage allows shield to absorb damage during combat, protecting health. Don't avoid taking damage entirely if shield can absorb it. Understand that shield depletion is acceptable if it protects health. Use shield strategically to maximize survival during combat.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Management Best Practices</h3>
        <p>Best practices: prioritize shield collection early game, maintain maximum shield mid to late game, restore shield after taking damage, balance shield with health, and use shield strategically during combat. Effective shield management significantly improves survival chances and combat performance.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Shield in Fortnite provides essential protection that significantly increases survival capacity and combat effectiveness. Understanding shield mechanics, effectiveness, damage absorption, and optimization strategies helps players maximize protection and improve performance.</p>

        <p>Shield works by absorbing damage before health, effectively doubling survival capacity when at maximum (100 shield + 100 health = 200 effective health). Shield effectiveness shows protection percentage, while damage absorption protects health during combat. Understanding these mechanics helps players optimize shield usage.</p>

        <p>Optimization strategies include shield collection, maintenance, health balance, strategic usage, and item management. By combining these strategies, players can maximize shield protection and survival capacity, significantly improving combat performance and Victory Royale chances.</p>

        <p>Remember that shield is essential for competitive play and survival. Prioritize shield collection, maintain maximum shield when possible, and use shield strategically to protect health during combat. With proper understanding and optimization, players can maximize shield protection and improve combat effectiveness significantly.</p>
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
          <p>This tool calculates Fortnite shield potency based on base health (typically 100), shield amount (0-100), shield type (Small/Medium/Large/Chug Jug), and optional incoming damage to calculate damage absorption.</p>
          <p>Outputs include total effective health (health + shield), shield effectiveness percentage, damage absorbed by shield, remaining shield and health after damage, survival status (eliminated/critical/damaged/protected/full), interpretation, recommendations, and action plan.</p>
          <p>Formulas use shield mechanics: Total Effective Health = Health + Shield, Shield Effectiveness = (Shield / Total Health) × 100, Damage Absorption: Shield absorbs first, then health, Remaining Shield = Max(0, Shield - Damage), Remaining Health = Max(0, Health - (Damage - Shield)). The guide covers shield mechanics, types, effectiveness, damage absorption, effective health, optimization strategies, and management. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Fortnite shield potency calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
