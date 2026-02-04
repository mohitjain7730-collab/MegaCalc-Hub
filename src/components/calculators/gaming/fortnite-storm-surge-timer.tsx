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
  currentPlayerCount: z.number({ invalid_type_error: 'Enter current player count' }).min(1),
  targetPlayerCount: z.number({ invalid_type_error: 'Enter target player count' }).min(1),
  damagePerTick: z.number({ invalid_type_error: 'Enter damage per tick' }).min(0),
  tickInterval: z.number({ invalid_type_error: 'Enter tick interval' }).min(0.1),
  playerHealth: z.number({ invalid_type_error: 'Enter player health' }).min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  currentPlayerCount: number;
  targetPlayerCount: number;
  damagePerTick: number;
  tickInterval: number;
  playerHealth: number;
  playersToEliminate: number;
  totalDamageNeeded: number;
  timeUntilSurge: number;
  ticksUntilSurge: number;
  damagePerPlayer: number;
  survivalTime: number;
  ticksToSurvive: number;
  status: 'safe' | 'warning' | 'danger' | 'critical';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter the current number of players remaining in the match.',
  'Enter the target player count that triggers storm surge (typically 60-80 players).',
  'Enter the damage per tick that storm surge deals (typically 1-2 damage per tick).',
  'Enter the tick interval in seconds (typically 0.5-1.0 seconds per tick).',
  'Optionally enter your current health to calculate survival time.',
  'Review the time until storm surge, damage calculations, survival requirements, and recommendations.',
];

const faqs = [
  {
    question: 'What is storm surge in Fortnite?',
    answer:
      'Storm surge is a competitive match mechanic that activates when too many players remain alive. It deals periodic damage to players with the lowest damage dealt, forcing eliminations and reducing player count. Storm surge helps prevent matches from lasting too long by encouraging aggressive play.',
  },
  {
    question: 'When does storm surge activate?',
    answer:
      'Storm surge typically activates when player count exceeds a threshold (usually 60-80 players) at certain storm phases. The exact threshold varies by match phase and competitive settings. Once activated, it continues until player count drops below the threshold.',
  },
  {
    question: 'How does storm surge damage work?',
    answer:
      'Storm surge deals periodic damage (typically 1-2 damage per tick) to players with the lowest damage dealt in the match. Damage occurs at regular intervals (typically every 0.5-1.0 seconds). Players with higher damage dealt are protected from storm surge damage. The goal is to encourage aggressive play and reduce player count.',
  },
  {
    question: 'How can I avoid storm surge damage?',
    answer:
      'To avoid storm surge damage, deal damage to enemies. Players with higher damage dealt are protected from storm surge. Engage in combat, deal damage to opponents, and maintain active gameplay. Passive players with low damage dealt are most vulnerable to storm surge.',
  },
  {
    question: 'How long does storm surge last?',
    answer:
      'Storm surge lasts until player count drops below the activation threshold. The duration depends on how quickly players are eliminated. More aggressive play reduces player count faster, ending storm surge sooner. Passive play prolongs storm surge, increasing damage over time.',
  },
  {
    question: 'What happens if I take storm surge damage?',
    answer:
      'Storm surge damage reduces your health/shield. If damage exceeds your remaining health, you\'re eliminated. Players with low health are especially vulnerable. Deal damage to enemies to avoid storm surge, or use healing items to survive damage. Survival depends on health management and active gameplay.',
  },
  {
    question: 'How do I calculate survival time during storm surge?',
    answer:
      'Survival time = (Current Health / Damage Per Tick) × Tick Interval. For example, with 100 health, 2 damage per tick, and 1 second intervals, you can survive 50 seconds (100 / 2 × 1 = 50). However, you should deal damage to enemies to avoid storm surge entirely rather than relying on survival time.',
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

const baseUrl = 'https://mycalculating.com/category/gaming/fortnite-storm-surge-timer';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
        { '@type': 'ListItem', position: 3, name: 'Fortnite Storm Surge Timer', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Fortnite Storm Surge Timer',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate storm surge timing, damage intervals, and survival requirements in Fortnite competitive matches.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'The Complete Guide to Fortnite Storm Surge: Understanding Timing and Survival Strategies',
      description: 'A comprehensive guide to Fortnite storm surge mechanics, including timing calculations, damage interval analysis, and survival strategies for competitive matches.',
      author: {
        '@type': 'Organization',
        name: 'MegaCalc Hub Gaming Team',
      },
      datePublished: '2025-01-24',
    },
    {
      '@type': 'HowTo',
      name: 'How to use the Fortnite Storm Surge Timer',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const currentPlayerCount = values.currentPlayerCount;
  const targetPlayerCount = values.targetPlayerCount;
  const damagePerTick = values.damagePerTick;
  const tickInterval = values.tickInterval;
  const playerHealth = values.playerHealth ?? 100;

  // Players that need to be eliminated
  const playersToEliminate = Math.max(0, currentPlayerCount - targetPlayerCount);

  // Time until surge (assuming average elimination rate)
  // This is an estimate - actual time depends on player behavior
  const estimatedEliminationRate = 2; // players per minute (rough estimate)
  const timeUntilSurge = playersToEliminate > 0 ? (playersToEliminate / estimatedEliminationRate) * 60 : 0; // seconds

  // Ticks until surge (if it activates)
  const ticksUntilSurge = timeUntilSurge > 0 && tickInterval > 0 ? timeUntilSurge / tickInterval : 0;

  // Total damage needed to eliminate all players below threshold
  // This is theoretical - assumes all players have same health
  const damagePerPlayer = playerHealth; // Assuming full health elimination
  const totalDamageNeeded = playersToEliminate * damagePerPlayer;

  // Survival time if taking storm surge damage
  const ticksToSurvive = damagePerTick > 0 ? Math.floor(playerHealth / damagePerTick) : 0;
  const survivalTime = ticksToSurvive * tickInterval;

  let status: ResultPayload['status'] = 'safe';
  let interpretation = 'Your storm surge calculations have been completed based on player count, damage settings, and health.';

  if (currentPlayerCount <= targetPlayerCount) {
    status = 'safe';
    interpretation = `Safe zone. Current player count (${currentPlayerCount}) is at or below the target threshold (${targetPlayerCount}). Storm surge is not active. Continue playing normally.`;
  } else if (playersToEliminate <= 10) {
    status = 'warning';
    interpretation = `Warning zone. ${playersToEliminate} players need to be eliminated to avoid storm surge. Storm surge may activate soon. Deal damage to enemies to avoid being targeted.`;
  } else if (playersToEliminate <= 20) {
    status = 'danger';
    interpretation = `Danger zone. ${playersToEliminate} players need to be eliminated. Storm surge is likely to activate. Deal damage aggressively to avoid storm surge targeting.`;
  } else {
    status = 'critical';
    interpretation = `Critical zone. ${playersToEliminate} players need to be eliminated. Storm surge will likely activate soon. Deal damage immediately to avoid being targeted by storm surge.`;
  }

  const recommendations = [
    `Current Situation: ${currentPlayerCount} players remaining, target is ${targetPlayerCount}. ${playersToEliminate > 0 ? `${playersToEliminate} players need to be eliminated to avoid storm surge.` : 'Player count is at safe level - storm surge not active.'}`,
    `Time Until Surge: ${timeUntilSurge > 0 ? `${Math.floor(timeUntilSurge / 60)} minutes ${Math.floor(timeUntilSurge % 60)} seconds (estimated). ${timeUntilSurge < 60 ? 'Storm surge may activate very soon - prepare for damage.' : timeUntilSurge < 300 ? 'Storm surge may activate soon - deal damage to avoid targeting.' : 'You have time before storm surge activates - use it to deal damage.'}` : 'Storm surge not active or already active.'}`,
    `Storm Surge Damage: ${damagePerTick} damage per tick, every ${tickInterval} seconds. ${damagePerTick >= 2 ? 'High damage - storm surge is very dangerous. Deal damage to avoid it.' : 'Moderate damage - still dangerous but manageable with healing.'}`,
  ];

  if (playerHealth > 0) {
    recommendations.push(`Survival Time: ${survivalTime.toFixed(1)} seconds (${ticksToSurvive} ticks) if taking storm surge damage. ${survivalTime < 30 ? 'Very short survival time - deal damage immediately to avoid storm surge.' : survivalTime < 60 ? 'Limited survival time - prioritize dealing damage over healing.' : 'Reasonable survival time, but still deal damage to avoid storm surge entirely.'}`);
  }

  recommendations.push(`Strategy: ${playersToEliminate > 0 ? 'Deal damage to enemies to avoid storm surge targeting. Engage in combat, maintain aggressive play, and prioritize damage dealt over passive survival. Players with higher damage dealt are protected from storm surge.' : 'Player count is safe - continue playing normally but stay aware of storm surge thresholds.'}`);

  if (playersToEliminate > 20) {
    recommendations.push('High player count detected. Storm surge is very likely. Focus on dealing damage immediately. Passive play will result in storm surge damage. Engage enemies aggressively to avoid being targeted.');
  }

  const plan = [
    {
      label: 'This Match',
      detail: `Monitor player count: ${currentPlayerCount} remaining, ${playersToEliminate > 0 ? `need ${playersToEliminate} eliminations. ${timeUntilSurge > 0 ? `Estimated ${Math.floor(timeUntilSurge / 60)}m ${Math.floor(timeUntilSurge % 60)}s until surge.` : 'Storm surge may activate soon.'} Deal damage aggressively to avoid storm surge targeting.` : 'Safe player count - continue normal gameplay.'}`
    },
    {
      label: 'This Week',
      detail: 'Practice aggressive playstyles: engage enemies early, deal damage consistently, avoid passive play, and understand storm surge mechanics. Develop strategies to deal damage while maintaining survival.'
    },
    {
      label: 'Ongoing',
      detail: 'Continuously optimize storm surge management: monitor player counts, deal damage to avoid targeting, balance aggression with survival, understand damage thresholds, and adapt playstyle based on match phase and player count.'
    },
  ];

  return {
    currentPlayerCount,
    targetPlayerCount,
    damagePerTick,
    tickInterval,
    playerHealth,
    playersToEliminate,
    totalDamageNeeded,
    timeUntilSurge,
    ticksUntilSurge,
    damagePerPlayer,
    survivalTime,
    ticksToSurvive,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function FortniteStormSurgeTimer() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPlayerCount: undefined,
      targetPlayerCount: undefined,
      damagePerTick: undefined,
      tickInterval: undefined,
      playerHealth: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="fortnite-storm-surge-timer-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            Fortnite Storm Surge Timer
          </CardTitle>
          <CardDescription>Calculate storm surge timing, damage intervals, and survival requirements in Fortnite competitive matches.</CardDescription>
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
                  name="currentPlayerCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Player Count</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetPlayerCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Player Count (Surge Threshold)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="damagePerTick"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Damage Per Tick</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 1.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tickInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tick Interval (seconds)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 0.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="playerHealth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Current Health (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Storm Surge
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
            <CardDescription>See time until storm surge, damage calculations, survival requirements, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Players to Eliminate</p>
                <p className="text-2xl font-semibold text-primary">{result.playersToEliminate}</p>
                <p className="text-xs text-muted-foreground">To avoid surge</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Time Until Surge</p>
                <p className="text-2xl font-semibold text-primary">
                  {result.timeUntilSurge > 0 ? `${Math.floor(result.timeUntilSurge / 60)}m ${Math.floor(result.timeUntilSurge % 60)}s` : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground">Estimated</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Survival Time</p>
                <p className="text-2xl font-semibold text-primary">{result.survivalTime.toFixed(1)}s</p>
                <p className="text-xs text-muted-foreground">If taking damage</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Damage Per Tick</p>
                <p className="text-xl font-semibold text-primary">{result.damagePerTick}</p>
                <p className="text-xs text-muted-foreground">Every {result.tickInterval}s</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Ticks to Survive</p>
                <p className="text-xl font-semibold text-primary">{result.ticksToSurvive}</p>
                <p className="text-xs text-muted-foreground">Ticks</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current Health</p>
                <p className="text-xl font-semibold text-primary">{result.playerHealth}</p>
                <p className="text-xs text-muted-foreground">HP</p>
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
            <strong>Players to Eliminate</strong> = Current Player Count - Target Player Count. This shows how many players need to be eliminated to avoid storm surge activation. Positive values indicate storm surge risk.
          </p>
          <p>
            <strong>Time Until Surge</strong> = (Players to Eliminate / Estimated Elimination Rate) × 60 seconds. This estimates time until storm surge activates, assuming average elimination rates. Actual time varies based on player behavior.
          </p>
          <p>
            <strong>Ticks Until Surge</strong> = Time Until Surge / Tick Interval. This calculates how many damage ticks will occur before storm surge activates (if it activates). Useful for planning damage dealing strategies.
          </p>
          <p>
            <strong>Survival Time</strong> = (Current Health / Damage Per Tick) × Tick Interval. This calculates how long you can survive if taking storm surge damage continuously. Survival time depends on health and damage per tick.
          </p>
          <p>
            <strong>Ticks to Survive</strong> = Current Health / Damage Per Tick. This shows how many damage ticks you can take before elimination. Each tick reduces health by damage per tick amount.
          </p>
          <p>
            <strong>Total Damage Needed</strong> = Players to Eliminate × Average Player Health. This represents theoretical total damage needed to eliminate all players above threshold. This is for reference only, as actual eliminations depend on combat.
          </p>
          <p>These formulas help you understand storm surge timing, calculate survival requirements, and plan strategies to avoid storm surge damage. Remember: the best strategy is to deal damage to enemies to avoid being targeted by storm surge.</p>
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
        <meta itemProp="name" content="The Complete Guide to Fortnite Storm Surge: Understanding Timing and Survival Strategies" />
        <meta itemProp="description" content="A comprehensive guide to Fortnite storm surge mechanics, timing calculations, damage intervals, and survival strategies." />
        <meta itemProp="keywords" content="Fortnite storm surge, competitive Fortnite, storm surge timer, damage intervals, survival strategies" />
        <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
        <meta itemProp="datePublished" content="2025-01-24" />
        <meta itemProp="url" content={baseUrl} />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Fortnite Storm Surge: Understanding Timing and Survival Strategies</h1>
        <p className="text-lg italic text-muted-foreground">A comprehensive guide to Fortnite storm surge mechanics, timing calculations, damage intervals, and survival strategies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#overview" className="hover:underline">Overview: Understanding Storm Surge</a></li>
          <li><a href="#mechanics" className="hover:underline">Storm Surge Mechanics</a></li>
          <li><a href="#activation" className="hover:underline">Activation Conditions and Timing</a></li>
          <li><a href="#damage" className="hover:underline">Damage System and Intervals</a></li>
          <li><a href="#avoidance" className="hover:underline">Avoiding Storm Surge Damage</a></li>
          <li><a href="#survival" className="hover:underline">Survival Strategies and Calculations</a></li>
          <li><a href="#optimization" className="hover:underline">Optimization Strategies</a></li>
        </ul>
        <hr />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Overview: Understanding Storm Surge</h2>
        <p>Storm surge is a competitive match mechanic in Fortnite that activates when too many players remain alive, dealing periodic damage to players with the lowest damage dealt. Understanding storm surge helps players avoid damage, plan strategies, and optimize gameplay in competitive matches.</p>

        <p>Storm surge serves multiple purposes: preventing matches from lasting too long, encouraging aggressive play, reducing player count efficiently, and maintaining match pace. It's a balancing mechanism that ensures competitive matches progress at appropriate speeds.</p>

        <p>Storm surge targets players with the lowest damage dealt in the match, protecting players who are actively engaging in combat. This design encourages aggressive play and rewards players who deal damage to enemies. Passive players are most vulnerable to storm surge damage.</p>

        <p>Damage from storm surge occurs at regular intervals (ticks), typically dealing 1-2 damage per tick every 0.5-1.0 seconds. This periodic damage can eliminate players who don't deal damage to enemies or who have low health. Understanding damage intervals helps players calculate survival time and plan strategies.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Storm Surge Matters</h3>
        <p>Storm surge matters because it directly affects survival and match outcomes. Players who understand storm surge can avoid damage, optimize strategies, and improve competitive performance. Ignoring storm surge mechanics often results in unnecessary damage and eliminations.</p>

        <hr />

        <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Storm Surge Mechanics</h2>

        <p>Storm surge mechanics involve player count thresholds, damage targeting, and periodic damage application. Understanding these mechanics helps players predict storm surge activation and avoid damage.</p>

        <p>Player count thresholds determine when storm surge activates. Typically, storm surge activates when player count exceeds 60-80 players at certain storm phases. The exact threshold varies by match phase and competitive settings. Once activated, storm surge continues until player count drops below the threshold.</p>

        <p>Damage targeting prioritizes players with the lowest damage dealt. Players who deal more damage to enemies are protected from storm surge. Players who deal less damage are vulnerable to storm surge damage. This targeting system encourages aggressive play and rewards combat engagement.</p>

        <p>Periodic damage occurs at regular intervals (ticks). Each tick deals a fixed amount of damage (typically 1-2 damage) to targeted players. Tick intervals are consistent (typically 0.5-1.0 seconds), allowing players to predict damage timing. Understanding tick intervals helps players calculate survival time and plan healing strategies.</p>

        <p>Damage accumulation reduces health over time. Multiple ticks can eliminate players if they don't deal damage or heal. Players with low health are especially vulnerable. Survival depends on dealing damage to avoid targeting or healing to survive damage.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Damage Calculation</h3>
        <p>Damage calculation: Each tick deals fixed damage (damage per tick). Total damage = Damage Per Tick × Number of Ticks. Survival time = (Current Health / Damage Per Tick) × Tick Interval. These calculations help players understand damage impact and plan survival strategies.</p>

        <hr />

        <h2 id="activation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Activation Conditions and Timing</h2>

        <p>Storm surge activation depends on player count relative to thresholds. Understanding activation conditions helps players predict when storm surge will activate and prepare accordingly.</p>

        <p>Activation threshold is the player count that triggers storm surge. When current player count exceeds the threshold, storm surge activates. Typical thresholds are 60-80 players, varying by match phase. Early game phases may have higher thresholds, while later phases may have lower thresholds.</p>

        <p>Time until activation depends on elimination rate. If player count is above threshold, storm surge may activate soon. Time until activation = (Players Above Threshold / Elimination Rate) × 60 seconds. Actual time varies based on player behavior and combat activity.</p>

        <p>Deactivation occurs when player count drops below threshold. More aggressive play reduces player count faster, ending storm surge sooner. Passive play prolongs storm surge, increasing damage over time. Understanding this relationship helps players optimize strategies.</p>

        <p>Match phase affects activation thresholds. Early game phases typically have higher thresholds (70-80 players). Mid game phases may have moderate thresholds (60-70 players). Late game phases may have lower thresholds or no storm surge. Understanding phase-specific thresholds helps players predict activation.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Predicting Activation</h3>
        <p>To predict activation: monitor current player count, know threshold for current match phase, estimate elimination rate based on match activity, calculate time until threshold is reached, and prepare strategies based on activation likelihood. Use calculators to estimate timing and plan accordingly.</p>

        <hr />

        <h2 id="damage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Damage System and Intervals</h2>

        <p>Storm surge damage occurs at regular intervals with fixed damage per tick. Understanding damage intervals helps players calculate survival time and plan strategies.</p>

        <p>Damage per tick is typically 1-2 damage, though this can vary by competitive settings. Higher damage per tick makes storm surge more dangerous, requiring faster damage dealing or more healing. Lower damage per tick provides more time to deal damage or heal.</p>

        <p>Tick intervals are typically 0.5-1.0 seconds between damage ticks. Consistent intervals allow players to predict damage timing. Shorter intervals mean more frequent damage, reducing survival time. Longer intervals provide more time between damage ticks.</p>

        <p>Total damage accumulates over multiple ticks. Players taking storm surge damage continuously will accumulate damage over time. Total damage = Damage Per Tick × Number of Ticks. Understanding accumulation helps players calculate when they'll be eliminated.</p>

        <p>Survival calculations depend on health and damage. Survival time = (Current Health / Damage Per Tick) × Tick Interval. Ticks to survive = Current Health / Damage Per Tick. These calculations help players understand how long they can survive storm surge damage.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Damage Examples</h3>
        <p>Example 1: 100 health, 2 damage per tick, 1 second intervals. Survival time = 50 seconds (100 / 2 × 1). Ticks to survive = 50 ticks. This provides reasonable survival time if taking damage.</p>

        <p>Example 2: 50 health, 1.5 damage per tick, 0.5 second intervals. Survival time = 16.7 seconds (50 / 1.5 × 0.5). Ticks to survive = 33 ticks. Lower health significantly reduces survival time.</p>

        <hr />

        <h2 id="avoidance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Avoiding Storm Surge Damage</h2>

        <p>The best strategy for storm surge is to avoid it entirely by dealing damage to enemies. Players who deal damage are protected from storm surge targeting. Understanding avoidance strategies helps players stay safe and optimize gameplay.</p>

        <p>Deal damage to enemies to avoid targeting. Engage in combat, shoot enemies, and maintain active gameplay. Players with higher damage dealt are protected from storm surge. Even small amounts of damage can provide protection. Prioritize dealing damage over passive survival.</p>

        <p>Engage early to build damage dealt. Early engagements help build damage totals, providing protection from storm surge. Don't wait until storm surge activates to start dealing damage. Build damage totals throughout the match to maintain protection.</p>

        <p>Maintain consistent damage output. Deal damage regularly throughout the match, not just when storm surge is active. Consistent damage ensures protection from storm surge targeting. Passive play makes you vulnerable to storm surge.</p>

        <p>Balance aggression with survival. Deal damage to avoid storm surge, but don't take unnecessary risks. Engage enemies when safe, use cover effectively, and maintain awareness. Balance damage dealing with survival to optimize performance.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Damage Thresholds</h3>
        <p>Damage thresholds vary by match, but generally: players with above-average damage dealt are protected, players with below-average damage dealt are vulnerable, and damage totals are compared relative to other players. Deal damage consistently to maintain protection.</p>

        <hr />

        <h2 id="survival" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Survival Strategies and Calculations</h2>

        <p>If you're taking storm surge damage, survival strategies help you stay alive while dealing damage to avoid further targeting. Understanding survival calculations helps players plan strategies and manage health effectively.</p>

        <p>Survival time calculations help players understand how long they can survive storm surge damage. Formula: Survival Time = (Current Health / Damage Per Tick) × Tick Interval. This shows maximum survival time if taking continuous damage.</p>

        <p>Health management is crucial during storm surge. Use healing items to extend survival time. Prioritize healing when health is low. Balance healing with damage dealing to avoid further targeting. Effective health management can save you from elimination.</p>

        <p>Damage dealing while surviving helps avoid further targeting. Deal damage to enemies even while taking storm surge damage. This can remove you from targeting, stopping further damage. Balance survival with damage dealing to optimize outcomes.</p>

        <p>Escape strategies may help if storm surge is unavoidable. Move to safer positions, use cover effectively, and avoid additional threats. However, the best strategy is always to deal damage to avoid targeting entirely.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Survival Priority</h3>
        <p>Survival priority: First, deal damage to avoid targeting (best strategy). Second, heal if health is low and you can't deal damage immediately. Third, escape to safer positions if possible. Always prioritize dealing damage over passive survival, as this prevents further damage.</p>

        <hr />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimization Strategies</h2>

        <p>Optimization strategies help players manage storm surge effectively, avoid damage, and improve competitive performance. Multiple approaches can optimize storm surge management.</p>

        <p>Early engagement builds damage totals for protection. Engage enemies early in the match to build damage dealt. Early damage provides protection from storm surge throughout the match. Don't wait until storm surge activates to start dealing damage.</p>

        <p>Consistent damage output maintains protection. Deal damage regularly throughout the match, not just when storm surge is active. Consistent damage ensures you stay above damage thresholds and maintain protection. Passive play makes you vulnerable.</p>

        <p>Monitor player counts to predict activation. Track current player count and compare to thresholds. Predict when storm surge will activate based on elimination rates. Prepare strategies based on activation likelihood. Use calculators to estimate timing.</p>

        <p>Balance aggression with survival. Deal damage to avoid storm surge, but maintain survival awareness. Engage enemies when safe, use cover effectively, and avoid unnecessary risks. Balance damage dealing with survival to optimize performance.</p>

        <p>Health management extends survival if taking damage. Use healing items when health is low. Prioritize healing during storm surge if you can't deal damage immediately. Balance healing with damage dealing to optimize outcomes.</p>

        <p>Adapt strategies based on match phase. Early game: build damage totals through engagements. Mid game: maintain damage output and monitor player counts. Late game: storm surge may be less relevant, focus on survival and positioning.</p>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Storm surge is a critical mechanic in competitive Fortnite that affects survival and match outcomes. Understanding storm surge mechanics, timing calculations, and survival strategies helps players avoid damage and optimize performance.</p>

        <p>Storm surge activates when player count exceeds thresholds, dealing periodic damage to players with low damage dealt. The best strategy is to deal damage to enemies to avoid targeting entirely. Survival strategies help if you're taking damage, but avoidance is always preferable.</p>

        <p>Optimization strategies include early engagement, consistent damage output, player count monitoring, balanced aggression, health management, and phase-appropriate strategies. By combining these strategies, players can effectively manage storm surge and improve competitive performance.</p>

        <p>Remember that storm surge encourages aggressive play and rewards combat engagement. Deal damage consistently throughout matches to maintain protection. Use calculators to estimate timing and plan strategies. With proper understanding and optimization, players can effectively manage storm surge and improve competitive outcomes.</p>
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
          <p>This tool calculates Fortnite storm surge timing and survival requirements based on current player count, target player count (surge threshold), damage per tick, tick interval (seconds), and optional player health.</p>
          <p>Outputs include players to eliminate (to avoid surge), time until surge activation (estimated), ticks until surge, survival time (if taking damage), ticks to survive, total damage needed (theoretical), status assessment (safe/warning/danger/critical), interpretation, recommendations, and action plan.</p>
          <p>Formulas use storm surge mechanics: Players to Eliminate = Current Count - Target Count, Time Until Surge = (Players to Eliminate / Elimination Rate) × 60, Survival Time = (Health / Damage Per Tick) × Tick Interval, Ticks to Survive = Health / Damage Per Tick. The guide covers storm surge mechanics, activation conditions, damage system, avoidance strategies, survival calculations, and optimization. Related tools, FAQs, and comprehensive content ensure humans or AI assistants can interpret the methodology and understand Fortnite storm surge calculations instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
