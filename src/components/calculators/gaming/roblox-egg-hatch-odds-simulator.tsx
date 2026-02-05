'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Egg,
  Zap,
  Target,
  Calculator,
  BrainCircuit,
  ArrowRight,
  Dna,
  Trophy
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  eggPrice: z.number({ invalid_type_error: 'Enter cost' }).min(0, "Price cannot be negative").default(100),
  targetOdds: z.number({ invalid_type_error: 'Enter odds %' }).min(0.000001).max(100),
  hatchesPerClick: z.number().min(1).max(8).default(1),
  autoHatchSpeed: z.number().min(1).default(1),
  luckMultiplier: z.number().min(1).default(1),
  budget: z.number().optional()
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  trueOdds: string;
  hatchesForOne: string;
  hatchesForOneRaw: number;
  costForOne: string;
  costForOneRaw: number;
  probabilityInBudget: string;
  timeToHatch: string;
  status: 'impossible' | 'hard' | 'moderate' | 'easy' | 'guaranteed';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
  simulation: {
    attempts: number;
    didHatch: boolean;
    cost: number;
  };
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString();
}

function calculateBinomial(p: number, n: number): number {
  // Probability of at least 1 success in n trials = 1 - (1-p)^n
  return 1 - Math.pow(1 - p, n);
}

const calculateResult = (values: FormValues): ResultPayload => {
  const { eggPrice, targetOdds, hatchesPerClick, autoHatchSpeed, luckMultiplier, budget } = values;

  // 1. Calculate True Odds (Base * Luck)
  // Note: Most Roblox games cap luck or have specific formulas. We assume a simple multiplier here for estimation.
  const baseProb = targetOdds / 100;
  const trueProb = Math.min(baseProb * luckMultiplier, 1.0);

  // 2. Geometric Distribution for Expected Hatches (E = 1/p)
  // Getting 1 pet on average
  const expectedHatches = Math.ceil(1 / trueProb);
  const expectedCost = expectedHatches * eggPrice;

  // 3. Time calculation
  // Assume autoHatchSpeed is "seconds per batch"
  const totalBatches = Math.ceil(expectedHatches / hatchesPerClick);
  const totalSeconds = totalBatches * autoHatchSpeed;

  let timeString = '';
  if (totalSeconds < 60) timeString = `${totalSeconds}s`;
  else if (totalSeconds < 3600) timeString = `${(totalSeconds / 60).toFixed(1)}m`;
  else if (totalSeconds < 86400) timeString = `${(totalSeconds / 3600).toFixed(1)}h`;
  else timeString = `${(totalSeconds / 86400).toFixed(1)} days`;

  // 4. Budget Probability
  let probInBudget = 0;
  if (budget && budget > 0) {
    const hatchesPossible = Math.floor(budget / eggPrice);
    probInBudget = calculateBinomial(trueProb, hatchesPossible) * 100;
  }

  // 5. Status & Interpretation
  let status: ResultPayload['status'] = 'moderate';
  let interpretation = '';

  if (expectedHatches > 100000) {
    status = 'impossible';
    interpretation = 'This is a "Mythical" grind. You are fighting RNG.';
  } else if (expectedHatches > 10000) {
    status = 'hard';
    interpretation = 'Requires significant AFK time and luck.';
  } else if (expectedHatches > 1000) {
    status = 'moderate';
    interpretation = 'A reasonable grind. Doable in a few hours.';
  } else if (expectedHatches > 100) {
    status = 'easy';
    interpretation = 'You should get this quickly.';
  } else {
    status = 'guaranteed';
    interpretation = 'Almost guaranteed in a few clicks.';
  }

  // Simulation: Run a loop up to 10x expected to see if we get lucky
  // We simulate "batches" for performance
  let simHatches = 0;
  let simSuccess = false;
  const simLimit = Math.min(expectedHatches * 5, 100000); // Prevent infinite loop on UI
  // For standard simulation display, we just use the expected value logic 
  // because random simulations are confusing for users if they change every render.
  // Instead, we show the "p50" (50% chance point) vs "p90" (90% chance point).

  const p50Hatches = Math.ceil(Math.log(0.5) / Math.log(1 - trueProb));
  const p90Hatches = Math.ceil(Math.log(0.1) / Math.log(1 - trueProb));
  const p99Hatches = Math.ceil(Math.log(0.01) / Math.log(1 - trueProb));

  const recommendations = [
    `True Probability: ${(trueProb * 100).toFixed(4)}% (Base: ${targetOdds}%)`,
    `The "Lucky" Break: 50% of players get it by ${formatNumber(p50Hatches)} hatches.`,
    `The "Unlucky" Grind: To be 99% sure you get it, you need ${formatNumber(p99Hatches)} hatches.`,
    `Cost of Certainty: ${formatNumber(p99Hatches * eggPrice)} Robux/Coins to virtually guarantee it.`
  ];

  const plan = [
    {
      label: 'Setup',
      detail: `Equip ${luckMultiplier}x luck. Enable ${hatchesPerClick}-hatch. Expect to spend ~${formatNumber(expectedCost)} currency.`
    },
    {
      label: 'AFK Estimate',
      detail: `It will take approx ${timeString} of continuous hatching to hit the average drop rate.`
    }
  ];

  return {
    trueOdds: (trueProb * 100).toFixed(5) + '%',
    hatchesForOne: formatNumber(expectedHatches),
    hatchesForOneRaw: expectedHatches,
    costForOne: formatNumber(expectedCost),
    costForOneRaw: expectedCost,
    probabilityInBudget: probInBudget > 0 ? probInBudget.toFixed(2) + '%' : 'N/A',
    timeToHatch: timeString,
    status,
    interpretation,
    recommendations,
    plan,
    simulation: {
      attempts: p50Hatches,
      didHatch: true,
      cost: p50Hatches * eggPrice
    }
  };
};

const relatedCalculators = [
  {
    name: '(Roblox) Pet Value Calculator',
    slug: 'roblox-pet-value-calculator',
    description: 'Check values for the pets you hatch.',
  },
  {
    name: '(Roblox) Pet Simulator 99 Value',
    slug: 'roblox-pet-simulator-99-pet-value-calculator',
    description: 'Specific calculator for PS99 pets.',
  },
  {
    name: '(Roblox) Gamepass ROI Calculator',
    slug: 'roblox-gamepass-roi-calculator',
    description: 'Is the "Triple Hatch" gamepass worth it?',
  },
  {
    name: '(Roblox) Inventory Value Estimator',
    slug: 'roblox-inventory-value-estimator',
    description: 'Calculate total RAP of your inventory.',
  },
];

const faqs = [
  {
    question: 'How does Luck work in Roblox games?',
    answer:
      'In most games (like Pet Simulator 99 or Adopt Me), Luck is a multiplier applied to the base odds. If a pet is 1% and you have 2x Luck, it becomes 2%. However, some games have "Luck caps" or diminishing returns.',
  },
  {
    question: 'What is "Pity" or "Mercy"?',
    answer:
      'Some egg systems guarantee a rare pet after X failed hatches. This calculator assumes pure RNG (Random Number Generation). If a Pity system exists, your actual cost will be lower than the "99% Certainty" number.',
  },
  {
    question: 'Why did I hatch 100 eggs at 1% and get nothing?',
    answer:
      'This is the "Gambler\'s Fallacy". 100 attempts at 1% does not equal 100%. Mathematically, you only have a 63.4% chance of success after 100 tries. You need ~230 tries to reach 90% confidence.',
  },
  {
    question: 'Is "Triple Hatch" worth it?',
    answer:
      'Yes, if you value time. Triple Hatch triples your speed but consumes 3x currency. It does not change the probability per egg, but it gets you to the result 3x faster.',
  },
  {
    question: 'Does the server "Luck" stack?',
    answer:
      'Usually, yes. Server boosts, potions, and gamepasses often multiply together. Always check the specific game wiki, but total luck can sometimes reach 10x-50x or more.',
  }
];

const steps = [
  'Enter the Cost Per Egg (Robux, Coins, Diamonds).',
  'Input the target pet\'s Base Odds (e.g., 0.001%).',
  'Set your multipliers (Hatch Amount, Luck, Speed).',
  'View the "True Cost" to hatch this pet.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-egg-hatch-odds-simulator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: '(Roblox) Egg Hatch Odds Simulator',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      description: 'Simulate Roblox egg hatching RNG using binomial probability. Calculate true cost and time for rare pets.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'Roblox Hatch Simulator: Beat the RNG',
      description: 'Don\'t waste Robux blindly. Use our odds simulator to calculate exactly how many eggs you need to hatch for that Huge or Titanic pet.',
      author: {
        '@type': 'Organization',
        name: 'MegaCalc Hub Gaming Team',
      },
      datePublished: '2025-01-24',
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  ],
};

export default function RobloxEggHatchOddsSimulator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eggPrice: 1000,
      targetOdds: 0.5,
      hatchesPerClick: 3,
      autoHatchSpeed: 3, // ~3 seconds per hatch animation
      luckMultiplier: 1,
      budget: undefined
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateResult(values));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <Script id="roblox-egg-hatch-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card className="border-l-4 border-l-purple-500 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Egg className="h-6 w-6 text-purple-500" />
            Roblox Hatch Probability Simulator
          </CardTitle>
          <CardDescription>
            Calculate the true cost, time, and odds of hatching rare pets.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Calculator className="h-4 w-4" /> Simulator Config</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="eggPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-amber-500">Egg Price</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="bg-amber-500/5 border-amber-200" placeholder="e.g. 5000" />
                          </FormControl>
                          <FormDescription className="text-xs">Coins/Diamonds per egg</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetOdds"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-blue-500">Target Odds (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.000001" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="bg-blue-500/5 border-blue-200" placeholder="e.g. 0.001" />
                          </FormControl>
                          <FormDescription className="text-xs">Base chance listed in-game</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="luckMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Luck Multiplier</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormDescription className="text-xs">Total Boost (Gamepass + Potions)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hatchesPerClick"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Eggs per Hatch</FormLabel>
                          <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select amount" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1">1 Egg (Single)</SelectItem>
                              <SelectItem value="3">3 Eggs (Triple)</SelectItem>
                              <SelectItem value="8">8 Eggs (Octuple)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">Number of eggs opened at once</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Balance (Optional)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} placeholder="How many coins do you have?" />
                          </FormControl>
                          <FormDescription className="text-xs">To calculate your specific chance</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg">
                    RUN SIMULATION
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {result && (
            <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
              <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 animate-pulse"></div>
                <CardHeader className="relative pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">RNG Analysis</CardTitle>
                </CardHeader>
                <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Average Cost to Hatch</h4>
                    <p className="text-4xl font-black tracking-tight text-white mb-1">
                      {result.costForOne}
                    </p>
                    <p className="text-sm text-purple-400 font-medium">
                      ~{result.hatchesForOne} attempts
                    </p>

                    <div className="mt-6 flex items-center gap-4">
                      <div className="bg-white/10 p-3 rounded-lg text-center min-w-[80px]">
                        <div className="text-xs text-slate-400">Time</div>
                        <div className="font-bold text-sm">{result.timeToHatch}</div>
                      </div>
                      {result.probabilityInBudget !== 'N/A' && (
                        <div className="bg-white/10 p-3 rounded-lg text-center min-w-[80px]">
                          <div className="text-xs text-slate-400">Your Chance</div>
                          <div className={`font-bold text-sm ${parseFloat(result.probabilityInBudget) > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{result.probabilityInBudget}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-white/5 rounded border border-white/10">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Base Odds</span>
                        <span className="text-slate-500">{result.trueOdds}</span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-slate-500 uppercase mt-4 mb-2">Confidence Intervals</h4>
                    {result.recommendations.slice(1).map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BrainCircuit className="h-5 w-5 text-purple-600" />
                  The Math of RNG
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p><strong>Gambler's Fallacy:</strong> Hatching 100 eggs at 1% odds does NOT satisfy the 100%. It only gives you a 63.2% chance.</p>
                <p><strong>Formula:</strong> We use the Geometric Distribution to find the expected trials.</p>
                <code className="bg-muted px-2 py-1 rounded block w-fit">Trials = 1 / (Odds * Luck)</code>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Dna className="h-5 w-5 text-purple-600" />
                  Binomial Probability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>To calculate your chance with a specific budget, we calculate the odds of failing every single time, then invert it.</p>
                <p>This reveals the "Unlucky" reality of hatching games.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Context & Guide */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-900/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Rarity Tier Guide
              </CardTitle>
              <CardDescription>Typical Odds in Roblox</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Rarity</th>
                    <th className="p-3 text-right">Odds</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { r: 'Common', v: '50-100%' },
                    { r: 'Rare', v: '10-25%' },
                    { r: 'Legendary', v: '1-5%' },
                    { r: 'Mythical', v: '0.01-0.1%' },
                    { r: 'Exclusive', v: '< 0.0001%' },
                    { r: 'Titanic', v: '< 0.000001%' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="p-3 font-medium">{row.r}</td>
                      <td className="p-3 text-right text-muted-foreground font-mono">{row.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Strategy Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-amber-600 flex items-center gap-2"><Zap className="h-3 w-3" /> Use Potions</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Always stack max potions before hatching. A 2x potion literally halves your cost.
                </p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-blue-600 flex items-center gap-2"><Trophy className="h-3 w-3" /> Batch Hatching</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Triple/Octuple Hatch reduces the real-world time needed by 3x-8x. Vital for AFK.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scenario: The Titanic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Titanic pets often have odds like <strong>1 in 100 million</strong> (0.000001%).</p>
              <p>Even with 3x hatch speed, this would take ~10 years of continuous hatching on average.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="Roblox Egg Hatch Odds Simulator: RNG Probability Calculator" />
        <meta itemProp="description" content="Simulate the odds of hatching rare pets in Roblox. Understand binomial probability and calculate the true cost of 'guaranteed' drops." />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Roblox Hatch Odds: Beating the House</h1>
        <p className="text-lg italic text-muted-foreground">In world of Roblox simulators (Pet Sim 99, Adopt Me, Bee Swarm), "Luck" isn't a feeling—it's math. This simulator reveals the brutal reality of RNG (Random Number Generation) and helps you budget for the pets you want.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Understanding the "100 Egg" Myth</h2>
        <p>
          If a pet has a <strong>1% chance (1 in 100)</strong>, most players assume that hatching 100 eggs guarantees the pet.
          <strong> This is FALSE.</strong>
          <br /><br />
          In reality, after 100 hatches, you still have a ~36% chance of getting NOTHING. This is because every hatch is an independent event; the game doesn't "remember" your failures (unless there is a Pity system). To be 99% confident of getting that 1% pet, you actually need <strong>459 hatches</strong>.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">How "Luck" Multipliers Work</h3>
        <p>
          Luck boosts (Gamepasses, Potions, Enchants) typically multiply the base numerator.
          <br />
          <em>Formula: Base Odds (0.01%) x Luck (2x) = 0.02%.</em>
          <br />
          While small, these boosts compound massively over millions of hatches. A 1.5x boost can save you days of AFK hatching time.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Cost Effectiveness of Batch Hatching</h3>
        <p>
          Upgrades like "Triple Hatch" or "Octuple Hatch" do not improve your odds per egg. They simply speed up the process.
          However, since rare pets often require millions of attempts, speed is the most valuable resource.
          If a mythical takes 1 million hatches, doing it 8 at a time reduces the wait from months to weeks.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Worked Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario A: The "Huge" Grind</h4>
            <p className="text-sm"><strong>Odds:</strong> 0.0001% (1 in 1M)</p>
            <p className="text-sm"><strong>Luck:</strong> 5x (Potions + Pass)</p>
            <p className="text-sm"><strong>Result:</strong> 1 in 200,000</p>
            <p className="text-xs text-muted-foreground mt-1">Very doable with overnight AFK hatching.</p>
          </div>
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario B: The F2P Reality</h4>
            <p className="text-sm"><strong>Odds:</strong> 0.0001% (1 in 1M)</p>
            <p className="text-sm"><strong>Luck:</strong> 1x (None)</p>
            <p className="text-sm"><strong>Result:</strong> 1 in 1,000,000</p>
            <p className="text-xs text-muted-foreground mt-1">Requires 5x more time/eggs than Scenario A.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h4 className="font-semibold text-sm">{faq.question}</h4>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Calculators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {relatedCalculators.map((calc) => (
              <div key={calc.slug} className="group">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-purple-500" />
                  <Link href={`/category/gaming/${calc.slug}`} className="text-foreground hover:text-purple-500 transition-colors">
                    {calc.name}
                  </Link>
                </h4>
                <p className="text-xs text-muted-foreground ml-5">{calc.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" />
            Summary for AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            A simulator for Roblox Egg Hatching probabilities (Pet Simulator 99/X, Adopt Me).
            Inputs: Egg Price, Target Odds (%), Luck Multiplier, Batch Size.
            Outputs: Average Cost, Expected Attempts (Geometric Distribution), Time to Hatch, and Confidence Intervals (p50, p90).
          </p>
          <p>
            It debunks the "100 eggs = 100%" myth using Binomial Probability logic and calculates the "True Cost" considering bad luck protection (Confidence Intervals).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
