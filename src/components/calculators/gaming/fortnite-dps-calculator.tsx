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
  baseDamage: z.number({ invalid_type_error: 'Enter base damage' }).min(0),
  fireRate: z.number({ invalid_type_error: 'Enter fire rate' }).min(0),
  headshotMultiplier: z.number({ invalid_type_error: 'Enter headshot multiplier' }).min(1).optional(),
  reloadTime: z.number({ invalid_type_error: 'Enter reload time' }).min(0).optional(),
  magazineSize: z.number({ invalid_type_error: 'Enter magazine size' }).min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  baseDamage: number;
  fireRate: number;
  headshotMultiplier: number;
  reloadTime: number;
  magazineSize: number;
  baseDPS: number;
  headshotDPS: number;
  timeToEmptyMagazine: number;
  effectiveDPS: number;
  damagePerMagazine: number;
  status: 'low-dps' | 'moderate-dps' | 'high-dps' | 'very-high-dps';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter the base damage per shot of the weapon.',
  'Enter the fire rate (shots per second) of the weapon.',
  'Optionally enter the headshot damage multiplier (default: 2.0 for most weapons).',
  'Optionally enter reload time (seconds) and magazine size for more accurate DPS calculations.',
  'Review the base DPS, headshot DPS, effective DPS (accounting for reload), and recommendations.',
];

const faqs = [
  {
    question: 'What is DPS in Fortnite?',
    answer:
      'DPS (Damage Per Second) is a measure of how much damage a weapon deals over one second of continuous firing. It\'s calculated by multiplying base damage by fire rate. Higher DPS means more damage output, making weapons more effective in combat. DPS helps compare weapons and choose the best option for different situations.',
  },
  {
    question: 'How is base DPS calculated?',
    answer:
      'Base DPS = Base Damage × Fire Rate. For example, a weapon with 30 damage per shot and 5 shots per second has 150 base DPS. This represents damage output during continuous firing without accounting for reloads, headshots, or other factors. Base DPS is the foundation for all other DPS calculations.',
  },
  {
    question: 'What is headshot DPS?',
    answer:
      'Headshot DPS accounts for headshot multipliers, which typically double damage (2.0x multiplier). Formula: Headshot DPS = Base Damage × Headshot Multiplier × Fire Rate. Headshot DPS shows potential damage if all shots hit the head, which is ideal but not always achievable in actual gameplay.',
  },
  {
    question: 'What is effective DPS?',
    answer:
      'Effective DPS accounts for reload time, providing a more realistic damage output over extended periods. Formula: Effective DPS = (Damage Per Magazine) / (Time to Empty Magazine + Reload Time). This gives a better representation of sustained damage output during longer engagements.',
  },
  {
    question: 'How do reload time and magazine size affect DPS?',
    answer:
      'Reload time and magazine size affect effective DPS by creating downtime between magazines. Larger magazines and faster reloads increase effective DPS. Weapons with small magazines and slow reloads have lower effective DPS despite potentially high base DPS. Always consider these factors for sustained combat.',
  },
  {
    question: 'Which weapons have the highest DPS in Fortnite?',
    answer:
      'DPS varies by weapon type and rarity. Assault rifles and SMGs typically have high DPS due to fast fire rates. Shotguns have high burst damage but lower sustained DPS. Sniper rifles have very high damage but very low DPS due to slow fire rates. Use DPS calculators to compare specific weapons and find the best options for your playstyle.',
  },
  {
    question: 'Should I always choose the highest DPS weapon?',
    answer:
      'Not necessarily. While DPS is important, consider other factors: accuracy (high DPS is useless if you miss), range (some weapons are better at different distances), ammo availability, and your playstyle. Balance DPS with weapon handling, range, and personal preference. Use DPS as one factor in weapon selection, not the only factor.',
  },
];

const relatedCalculators = [
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
  {
    name: 'Fortnite Victory Royale Probability Estimator',
    slug: 'fortnite-victory-royale-probability-estimator',
    description: 'Estimate your probability of winning a Victory Royale based on current placement, player count, and skill level.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/fortnite-dps-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Fortnite DPS Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fortnite DPS Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate damage per second (DPS) for Fortnite weapons based on damage, fire rate, and weapon stats.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'The Complete Guide to Fortnite DPS: Understanding Weapon Damage Per Second',
      description: 'A comprehensive guide to Fortnite DPS calculations, including weapon damage output analysis, fire rate mechanics, headshot multipliers, and strategies for maximizing combat effectiveness.',
      author: {
        '@type': 'Organization',
        name: 'MegaCalc Hub Gaming Team',
      },
      datePublished: '2025-01-24',
    },
    {
      '@type': 'HowTo',
      name: 'How to use the Fortnite DPS Calculator',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const baseDamage = values.baseDamage;
  const fireRate = values.fireRate;
  const headshotMultiplier = values.headshotMultiplier ?? 2.0;
  const reloadTime = values.reloadTime ?? 0;
  const magazineSize = values.magazineSize ?? 0;

  // Base DPS (damage per second without headshots or reloads)
  const baseDPS = baseDamage * fireRate;

  // Headshot DPS (assuming all shots are headshots)
  const headshotDPS = baseDamage * headshotMultiplier * fireRate;

  // Time to empty magazine (seconds)
  const timeToEmptyMagazine = magazineSize > 0 && fireRate > 0 ? magazineSize / fireRate : 0;

  // Damage per magazine
  const damagePerMagazine = baseDamage * (magazineSize > 0 ? magazineSize : 1);

  // Effective DPS (accounting for reload time)
  // If reload time and magazine size are provided, calculate effective DPS
  let effectiveDPS = baseDPS;
  if (reloadTime > 0 && magazineSize > 0 && timeToEmptyMagazine > 0) {
    const totalCycleTime = timeToEmptyMagazine + reloadTime;
    effectiveDPS = damagePerMagazine / totalCycleTime;
  }

  let status: ResultPayload['status'] = 'moderate-dps';
  let interpretation = 'Your weapon DPS has been calculated based on base damage, fire rate, and optional factors.';

  if (baseDPS >= 200) {
    status = 'very-high-dps';
    interpretation = `Very high DPS! Your weapon deals ${baseDPS.toFixed(1)} base DPS, making it extremely effective in combat. This weapon can eliminate enemies quickly and is ideal for aggressive playstyles.`;
  } else if (baseDPS >= 150) {
    status = 'high-dps';
    interpretation = `High DPS! Your weapon deals ${baseDPS.toFixed(1)} base DPS, making it very effective in combat. This weapon provides strong damage output and is suitable for most combat situations.`;
  } else if (baseDPS >= 100) {
    status = 'moderate-dps';
    interpretation = `Moderate DPS. Your weapon deals ${baseDPS.toFixed(1)} base DPS, providing decent damage output. This weapon is functional but may be outclassed by higher DPS options in direct combat.`;
  } else {
    status = 'low-dps';
    interpretation = `Lower DPS. Your weapon deals ${baseDPS.toFixed(1)} base DPS, which may be insufficient for fast eliminations. Consider using this weapon for specific situations or upgrading to higher DPS alternatives.`;
  }

  const recommendations = [
    `Base DPS: ${baseDPS.toFixed(1)} damage per second. ${baseDPS >= 200 ? 'Exceptional damage output - ideal for aggressive combat.' : baseDPS >= 150 ? 'Strong damage output - very effective in most situations.' : baseDPS >= 100 ? 'Decent damage output - functional but may be outclassed.' : 'Lower damage output - consider alternatives for direct combat.'}`,
    `Headshot DPS: ${headshotDPS.toFixed(1)} damage per second (${headshotMultiplier}x multiplier). ${headshotDPS >= 400 ? 'Extremely high headshot damage - prioritize headshots for maximum effectiveness.' : headshotDPS >= 300 ? 'Very high headshot damage - headshots significantly increase effectiveness.' : 'Moderate headshot damage - headshots provide meaningful damage boost.'}`,
  ];

  if (reloadTime > 0 && magazineSize > 0) {
    recommendations.push(`Time to Empty Magazine: ${timeToEmptyMagazine.toFixed(2)} seconds (${magazineSize} rounds). ${timeToEmptyMagazine > 5 ? 'Large magazine provides extended firing time.' : timeToEmptyMagazine > 3 ? 'Moderate magazine size - plan reloads strategically.' : 'Small magazine - frequent reloads required.'}`);
    recommendations.push(`Damage Per Magazine: ${damagePerMagazine.toFixed(0)} total damage. ${damagePerMagazine >= 1000 ? 'High magazine damage - can eliminate multiple enemies.' : damagePerMagazine >= 500 ? 'Moderate magazine damage - sufficient for 1-2 eliminations.' : 'Lower magazine damage - may require multiple magazines per elimination.'}`);
    recommendations.push(`Effective DPS: ${effectiveDPS.toFixed(1)} damage per second (accounting for reload). ${effectiveDPS >= baseDPS * 0.9 ? 'Reload time has minimal impact on sustained DPS.' : effectiveDPS >= baseDPS * 0.7 ? 'Reload time moderately reduces sustained DPS.' : 'Reload time significantly reduces sustained DPS - consider faster reloads or larger magazines.'}`);
  } else {
    recommendations.push('Reload time and magazine size not provided. Effective DPS calculation requires these values for accurate sustained damage assessment.');
  }

  recommendations.push(`Weapon Assessment: ${status.replace('-', ' ').replace('dps', 'DPS').toUpperCase()}. ${baseDPS >= 200 ? 'This weapon excels in direct combat and aggressive playstyles. Use it as your primary weapon for engagements.' : baseDPS >= 150 ? 'This weapon is strong and versatile. Use it as a primary or secondary weapon depending on situation.' : baseDPS >= 100 ? 'This weapon is functional but may be outclassed. Consider it as a backup or for specific situations.' : 'This weapon has lower damage output. Use it for specific situations or consider alternatives.'}`);

  const plan = [
    {
      label: 'This Week',
      detail: `Master weapon handling: base DPS ${baseDPS.toFixed(1)}, headshot DPS ${headshotDPS.toFixed(1)}. ${baseDPS >= 150 ? 'Focus on aggressive engagements and direct combat.' : 'Practice accuracy and positioning to maximize effectiveness.'}`
    },
    {
      label: 'This Month',
      detail: 'Compare DPS across different weapons and rarities. Test weapons in various combat scenarios. Identify which weapons work best for your playstyle and adjust loadout accordingly.'
    },
    {
      label: 'Ongoing',
      detail: 'Continuously optimize loadout: use DPS calculations to compare weapons, balance DPS with accuracy and range, adapt to meta changes, and practice with high-DPS weapons to maximize effectiveness in combat.'
    },
  ];

  return {
    baseDamage,
    fireRate,
    headshotMultiplier,
    reloadTime: reloadTime || 0,
    magazineSize: magazineSize || 0,
    baseDPS,
    headshotDPS,
    timeToEmptyMagazine,
    effectiveDPS,
    damagePerMagazine,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function FortniteDPSCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseDamage: undefined,
      fireRate: undefined,
      headshotMultiplier: undefined,
      reloadTime: undefined,
      magazineSize: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="fortnite-dps-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Fortnite DPS Calculator
          </CardTitle>
          <CardDescription>Calculate damage per second (DPS) for Fortnite weapons based on damage, fire rate, and weapon stats.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your weapon information</CardTitle>
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
                  name="baseDamage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Base Damage per Shot</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fireRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fire Rate (shots per second)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="headshotMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headshot Multiplier (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.0 (default)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reloadTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reload Time (seconds, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="magazineSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Magazine Size (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate DPS
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
            <CardDescription>See base DPS, headshot DPS, effective DPS, and weapon recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Base DPS</p>
                <p className="text-2xl font-semibold text-primary">{result.baseDPS.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Damage per second</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Headshot DPS</p>
                <p className="text-2xl font-semibold text-primary">{result.headshotDPS.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">DPS (all headshots)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Effective DPS</p>
                <p className="text-2xl font-semibold text-primary">{result.effectiveDPS.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">DPS (with reload)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ').replace('dps', 'DPS')}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            {result.magazineSize > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground">Time to Empty Magazine</p>
                  <p className="text-xl font-semibold text-primary">{result.timeToEmptyMagazine.toFixed(2)}s</p>
                  <p className="text-xs text-muted-foreground">{result.magazineSize} rounds</p>
                </div>
                <div className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground">Damage Per Magazine</p>
                  <p className="text-xl font-semibold text-primary">{result.damagePerMagazine.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Total damage</p>
                </div>
                <div className="p-4 border rounded">
                  <p className="text-sm text-muted-foreground">Reload Time</p>
                  <p className="text-xl font-semibold text-primary">{result.reloadTime.toFixed(1)}s</p>
                  <p className="text-xs text-muted-foreground">Seconds</p>
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
            <strong>Base DPS</strong> = Base Damage × Fire Rate. This is the fundamental damage per second calculation, representing damage output during continuous firing without accounting for headshots, reloads, or other factors.
          </p>
          <p>
            <strong>Headshot DPS</strong> = Base Damage × Headshot Multiplier × Fire Rate. This calculates potential damage if all shots hit the head. Most Fortnite weapons have a 2.0x headshot multiplier, effectively doubling damage on headshots.
          </p>
          <p>
            <strong>Time to Empty Magazine</strong> = Magazine Size / Fire Rate. This shows how long it takes to fire all rounds in a magazine. Larger magazines and slower fire rates result in longer firing times.
          </p>
          <p>
            <strong>Damage Per Magazine</strong> = Base Damage × Magazine Size. This represents total damage output from a full magazine. Useful for understanding burst damage potential and elimination capability.
          </p>
          <p>
            <strong>Effective DPS</strong> = Damage Per Magazine / (Time to Empty Magazine + Reload Time). This accounts for reload time, providing a more realistic sustained damage output over extended periods. Effective DPS is lower than base DPS due to reload downtime.
          </p>
          <p>These formulas help you understand weapon damage output, compare weapons, and make informed loadout decisions. Base DPS shows raw damage potential, while effective DPS shows realistic sustained damage accounting for reloads.</p>
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
        <meta itemProp="name" content="The Complete Guide to Fortnite DPS: Understanding Weapon Damage Per Second" />
        <meta itemProp="description" content="A comprehensive guide to Fortnite DPS calculations, weapon damage output, fire rates, and combat effectiveness." />
        <meta itemProp="keywords" content="Fortnite DPS, weapon damage, fire rate, damage per second, Fortnite weapons, combat effectiveness" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Fortnite DPS: Understanding Weapon Damage Per Second</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Fortnite DPS calculations, weapon damage output, fire rates, and combat effectiveness.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding DPS in Fortnite</a></li>
          <li><a href="#calculation" className="hover:underline">DPS Calculation Methods</a></li>
          <li><a href="#factors" className="hover:underline">Factors Affecting DPS</a></li>
          <li><a href="#weapon-types" className="hover:underline">Weapon Types and DPS Characteristics</a></li>
          <li><a href="#headshots" className="hover:underline">Headshot Multipliers and Impact</a></li>
          <li><a href="#reloads" className="hover:underline">Reload Time and Effective DPS</a></li>
          <li><a href="#optimization" className="hover:underline">DPS Optimization Strategies</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding DPS in Fortnite</h2>
        <p>Damage Per Second (DPS) is a critical metric in Fortnite that measures how much damage a weapon deals over one second of continuous firing. Understanding DPS helps players compare weapons, optimize loadouts, and make informed decisions during combat. Higher DPS generally means faster eliminations, but other factors like accuracy, range, and handling also matter.</p>

        <p>DPS is calculated by multiplying base damage per shot by fire rate (shots per second). For example, a weapon dealing 30 damage per shot with a fire rate of 5 shots per second has 150 DPS. This represents raw damage output during continuous firing, without accounting for headshots, reloads, or other factors.</p>

        <p>Different weapon types have different DPS characteristics. Assault rifles and SMGs typically have high DPS due to fast fire rates and moderate damage. Shotguns have high burst damage but lower sustained DPS. Sniper rifles have very high damage per shot but very low DPS due to slow fire rates. Understanding these differences helps players choose appropriate weapons for different situations.</p>

        <p>DPS alone doesn't determine weapon effectiveness. Accuracy, range, magazine size, reload time, and handling all affect real-world performance. A weapon with high DPS but poor accuracy may be less effective than a lower DPS weapon with better accuracy. Players must balance DPS with other factors when selecting weapons.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why DPS Matters</h3>
        <p>DPS matters because it directly affects time-to-elimination. Higher DPS means faster eliminations, giving players advantages in combat. In close-range engagements, DPS often determines the winner. Understanding DPS helps players make better loadout decisions and improve combat performance.</p>

        <hr />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">DPS Calculation Methods</h2>

        <p>DPS calculations use simple multiplication: Base DPS = Base Damage × Fire Rate. This fundamental formula provides the foundation for all DPS analysis. Understanding this calculation helps players compare weapons and understand damage output.</p>

        <p>Base damage is the damage dealt per shot when hitting the body (not headshots). This value varies by weapon type, rarity, and specific weapon model. Higher rarity weapons typically have higher base damage. Understanding base damage helps players evaluate weapon effectiveness.</p>

        <p>Fire rate is measured in shots per second. Faster fire rates mean more shots fired per second, increasing DPS. Fire rates vary significantly between weapon types. SMGs have very high fire rates (8-12 shots/second), while sniper rifles have very low fire rates (0.5-1 shot/second).</p>

        <p>Example calculation: A weapon with 25 base damage and 6 shots per second has 150 base DPS (25 × 6 = 150). This means the weapon deals 150 damage per second during continuous firing. If an enemy has 100 health, this weapon can eliminate them in approximately 0.67 seconds (100 / 150 = 0.67).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Advanced DPS Calculations</h3>
        <p>Advanced calculations account for headshots, reloads, and other factors. Headshot DPS multiplies base damage by headshot multiplier (typically 2.0x) before multiplying by fire rate. Effective DPS accounts for reload time, providing sustained damage output over extended periods. These advanced calculations provide more realistic damage assessments.</p>

        <hr />

        <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting DPS</h2>

        <p>Multiple factors affect DPS and weapon effectiveness. Understanding these factors helps players make better weapon choices and optimize performance.</p>

        <p>Base damage directly affects DPS. Higher base damage means higher DPS, assuming fire rate remains constant. Base damage varies by weapon rarity, with legendary weapons typically having the highest damage. Players should prioritize higher damage weapons when possible.</p>

        <p>Fire rate significantly impacts DPS. Faster fire rates dramatically increase DPS, even with lower base damage. A weapon with 20 damage and 8 fire rate (160 DPS) may outperform a weapon with 30 damage and 4 fire rate (120 DPS). Fire rate is often more important than base damage for DPS.</p>

        <p>Weapon rarity affects both base damage and sometimes fire rate. Common (gray) weapons have lowest stats, while legendary (gold) weapons have highest stats. Epic (purple) and rare (blue) weapons fall in between. Always prioritize higher rarity weapons when available.</p>

        <p>Magazine size affects sustained DPS by determining how long a weapon can fire before reloading. Larger magazines allow longer continuous firing, maintaining high DPS for extended periods. Smaller magazines require frequent reloads, reducing effective DPS.</p>

        <p>Reload time affects effective DPS by creating downtime between magazines. Faster reloads minimize downtime, maintaining higher effective DPS. Slower reloads significantly reduce effective DPS, especially for weapons with small magazines.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Accuracy and DPS</h3>
        <p>Accuracy indirectly affects DPS by determining how many shots actually hit targets. A weapon with high DPS but poor accuracy may have lower effective DPS than a lower DPS weapon with better accuracy. Players must balance theoretical DPS with practical accuracy when evaluating weapons.</p>

        <hr />

        <h2 id="weapon-types" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Weapon Types and DPS Characteristics</h2>

        <p>Different weapon types have distinct DPS characteristics based on their design and intended use. Understanding these characteristics helps players choose appropriate weapons for different situations.</p>

        <p>Assault rifles typically have moderate to high DPS (120-180) with balanced damage and fire rate. They're versatile weapons suitable for most combat ranges. ARs provide consistent damage output and are reliable primary weapons. Examples include the SCAR and AK-47 variants.</p>

        <p>SMGs (Submachine Guns) have very high DPS (150-250) due to extremely fast fire rates. They excel in close-range combat but suffer at longer ranges. SMGs are ideal for aggressive playstyles and close-quarters combat. Their high DPS makes them excellent for eliminating enemies quickly.</p>

        <p>Shotguns have high burst damage but lower sustained DPS (80-150) due to slow fire rates. They're designed for close-range one-shot eliminations rather than sustained damage. Shotguns excel in building and close combat but are ineffective at range.</p>

        <p>Sniper rifles have very high damage per shot but very low DPS (20-60) due to extremely slow fire rates. They're designed for long-range precision eliminations, not sustained damage. Snipers require accuracy and patience but can eliminate enemies in one shot.</p>

        <p>Pistols have moderate DPS (100-150) with balanced characteristics. They're versatile backup weapons suitable for various situations. Pistols provide decent damage output and are reliable when primary weapons are unavailable.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Choosing Weapons by DPS</h3>
        <p>When choosing weapons, consider DPS alongside other factors. For close-range combat, prioritize high DPS weapons like SMGs or shotguns. For medium-range combat, use assault rifles with moderate to high DPS. For long-range combat, use sniper rifles despite low DPS, as precision matters more than sustained damage. Balance DPS with range, accuracy, and playstyle preferences.</p>

        <hr />

        <h2 id="headshots" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Headshot Multipliers and Impact</h2>

        <p>Headshot multipliers significantly increase damage output, effectively doubling DPS when all shots hit the head. Most Fortnite weapons have a 2.0x headshot multiplier, meaning headshots deal double damage compared to body shots.</p>

        <p>Headshot DPS is calculated as: Headshot DPS = Base Damage × Headshot Multiplier × Fire Rate. For a weapon with 30 base damage, 2.0x multiplier, and 5 fire rate, headshot DPS is 300 (30 × 2.0 × 5 = 300), compared to 150 base DPS.</p>

        <p>Headshot accuracy dramatically affects effective DPS. Players who consistently hit headshots can achieve much higher effective DPS than base DPS suggests. Improving headshot accuracy is one of the most effective ways to increase damage output.</p>

        <p>Different weapons have different headshot effectiveness. Weapons with high fire rates benefit more from headshots because each shot gets the multiplier. Weapons with high base damage also benefit significantly, as the multiplier applies to larger base values.</p>

        <p>Practice and aim training improve headshot accuracy. Players should focus on aiming for the head, especially in close-range combat where headshots are easier to land. Consistent headshots can turn a moderate DPS weapon into a high DPS weapon.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Headshot Strategies</h3>
        <p>Strategies for maximizing headshot DPS include: aiming for the head in all engagements, practicing aim to improve accuracy, using weapons with high fire rates to capitalize on headshot multipliers, and prioritizing headshots in close-range combat where they're easier to land.</p>

        <hr />

        <h2 id="reloads" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Reload Time and Effective DPS</h2>

        <p>Reload time affects effective DPS by creating downtime between magazines. Effective DPS accounts for reload time, providing a more realistic sustained damage output over extended periods.</p>

        <p>Effective DPS is calculated as: Effective DPS = Damage Per Magazine / (Time to Empty Magazine + Reload Time). This formula accounts for both firing time and reload downtime, giving a more accurate representation of sustained damage.</p>

        <p>Weapons with large magazines and fast reloads have higher effective DPS. These weapons minimize downtime and maintain high damage output. Weapons with small magazines and slow reloads have lower effective DPS, as reload downtime significantly reduces sustained damage.</p>

        <p>Time to empty magazine is calculated as: Time to Empty = Magazine Size / Fire Rate. Larger magazines take longer to empty, allowing longer continuous firing. Smaller magazines empty quickly, requiring frequent reloads.</p>

        <p>Damage per magazine represents total damage from a full magazine: Damage Per Magazine = Base Damage × Magazine Size. This helps understand burst damage potential and elimination capability per magazine.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Optimizing Effective DPS</h3>
        <p>To optimize effective DPS: prioritize weapons with larger magazines, use weapons with faster reload times, minimize reload frequency by managing ammo efficiently, and consider effective DPS alongside base DPS when choosing weapons. Effective DPS is often more important than base DPS for sustained combat.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">DPS Optimization Strategies</h2>

        <p>DPS optimization involves balancing multiple factors to maximize damage output while maintaining effectiveness. Several strategies help players optimize DPS and improve combat performance.</p>

        <p>Weapon selection is crucial for DPS optimization. Choose weapons with high base DPS for your preferred combat range. For close-range, prioritize SMGs or shotguns with high DPS. For medium-range, use assault rifles with moderate to high DPS. Consider both base DPS and effective DPS when selecting weapons.</p>

        <p>Rarity prioritization maximizes DPS by using higher rarity weapons. Legendary weapons typically have 15-20% higher damage than common weapons, significantly increasing DPS. Always prioritize higher rarity weapons when available, as they provide substantial DPS improvements.</p>

        <p>Loadout balance combines different weapon types for optimal DPS across ranges. Use high DPS close-range weapons (SMGs, shotguns) for building and close combat. Use moderate DPS medium-range weapons (assault rifles) for general combat. Use precision long-range weapons (snipers) despite low DPS, as they serve different purposes.</p>

        <p>Accuracy improvement increases effective DPS by ensuring more shots hit targets. Practice aim training, use aim assist effectively (on console), and focus on consistent accuracy. High accuracy with moderate DPS often outperforms low accuracy with high DPS.</p>

        <p>Headshot focus maximizes damage output through headshot multipliers. Aim for the head in all engagements, especially close-range combat. Consistent headshots can double effective DPS, making headshot accuracy one of the most important skills for DPS optimization.</p>

        <p>Reload management minimizes downtime and maintains effective DPS. Reload during safe moments, not during active combat. Use weapons with faster reloads when possible. Manage ammo to avoid unnecessary reloads during engagements.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>DPS is a critical metric in Fortnite that measures weapon damage output and helps players make informed loadout decisions. Understanding DPS calculations, factors affecting DPS, and optimization strategies improves combat performance and helps players choose the best weapons for different situations.</p>

        <p>Base DPS provides the foundation for damage assessment, while headshot DPS and effective DPS provide more realistic damage representations. Different weapon types have different DPS characteristics, and players must balance DPS with accuracy, range, and other factors when selecting weapons.</p>

        <p>Optimization strategies include weapon selection, rarity prioritization, loadout balance, accuracy improvement, headshot focus, and reload management. By combining these strategies, players can maximize DPS and improve combat effectiveness.</p>

        <p>Remember that DPS is one factor among many. Accuracy, range, handling, and personal preference all matter. Use DPS as a tool for weapon comparison and loadout optimization, but don't ignore other important factors that affect real-world performance.</p>
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
          <p>This tool calculates Fortnite weapon DPS (Damage Per Second) based on base damage per shot, fire rate (shots per second), optional headshot multiplier (default 2.0x), optional reload time (seconds), and optional magazine size.</p>
          <p>Outputs include base DPS (damage × fire rate), headshot DPS (damage × multiplier × fire rate), time to empty magazine (magazine size / fire rate), damage per magazine (damage × magazine size), effective DPS (accounting for reload time), status assessment (low-dps/moderate-dps/high-dps/very-high-dps), interpretation, recommendations, and action plan.</p>
          <p>Formulas use standard DPS calculations: Base DPS = Damage × Fire Rate, Headshot DPS = Damage × Multiplier × Fire Rate, Time to Empty = Magazine / Fire Rate, Damage Per Magazine = Damage × Magazine, Effective DPS = Damage Per Magazine / (Time to Empty + Reload Time). The guide covers DPS fundamentals, calculation methods, factors affecting DPS, weapon type characteristics, headshot multipliers, reload impact, and optimization strategies. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Fortnite DPS calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
