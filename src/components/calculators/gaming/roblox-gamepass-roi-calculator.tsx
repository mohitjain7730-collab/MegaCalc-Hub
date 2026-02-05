'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Gamepad2,
  Zap,
  Target,
  Activity,
  Calculator,
  Coins,
  TrendingUp,
  Clock,
  MinusCircle,
  CheckCircle2,
  ArrowRight,
  Search
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
  gamepassCost: z.number({ invalid_type_error: 'Enter cost' }).min(0, "Cost cannot be negative"),
  timeSavedPerDay: z.number({ invalid_type_error: 'Enter minutes' }).min(0).default(0),
  currencyEarnedPerDay: z.number({ invalid_type_error: 'Enter amount' }).min(0).default(0),
  hourlyWage: z.number().min(0).default(0), // "Value of your time"
  dailyGrindHours: z.number().min(0).max(24).default(1),
  boostMultiplier: z.number().min(1).default(1)
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  breakEvenHours: string;
  valueRate: string; // "High Value" or "Low Value"
  dailyVirtualEarnings: string;
  timeSavedTotal: string;
  effectiveHourlyWage: string;
  status: 'bad-deal' | 'fair' | 'good-deal' | 'must-buy';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
  metrics: {
    cost: number;
    valueGenerated: number;
    roiPercent: number;
  };
};

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toLocaleString();
}

const calculateResult = (values: FormValues): ResultPayload => {
  const { gamepassCost, timeSavedPerDay, currencyEarnedPerDay, hourlyWage, dailyGrindHours, boostMultiplier } = values;

  // 1. Calculate Virtual Value (Currency)
  // Assume a base conversion: 1 Robux ~= 1000 "Game Currency" (This is arbitrary but helps for relative scale if user leaves wage blank)
  // If user provides "Hourly Wage", we act as if preserving time is the key.

  // Logic: Gamepass Value = (Currency Boost * Grind Time) + (Time Saved * User's Hourly Value)

  // Adjusted Daily Earnings with Boost
  const baseEarnings = currencyEarnedPerDay * dailyGrindHours;
  const boostedEarnings = baseEarnings * boostMultiplier;
  const extraEarningsDelta = boostedEarnings - baseEarnings;

  // 2. Time Value
  // If the pass saves 30 mins a day, and user values time at 1000 Robux/hr (hypothetical), that's 500R value.
  // We default "Hourly Value" to 100 Robux if not set (~$1 USD)
  const userTimeValue = hourlyWage > 0 ? hourlyWage : 100; // Robux per hour value
  const timeSavedHours = timeSavedPerDay / 60;
  const timeValueGenerated = timeSavedHours * userTimeValue;

  // 3. Total Daily Value
  // We need to normalize "Currency" to "Robux" to make ROI sense. 
  // This is hard without a conversion rate.
  // Instead, let's look at "Payback Period" in HOURS of gameplay.

  // Scenario A: Auto-Farm / Currency Pass (2x Coins)
  // Scenario B: Quality of Life (Teleport / Speed)

  // Simple Metric: Cost per Hour of Utility
  // If I play 100 hours, cost is 500. = 5 Robux per hour. Cheap.

  const estimatedDaysPlayed = 30; // Standard month metric
  const totalPlayHours = dailyGrindHours * estimatedDaysPlayed;
  const costPerHour = gamepassCost / (totalPlayHours || 1);

  let status: ResultPayload['status'] = 'fair';
  let interpretation = '';

  if (costPerHour < 1) {
    status = 'must-buy';
    interpretation = 'Extremely cheap for the time you play.';
  } else if (costPerHour < 5) {
    status = 'good-deal';
    interpretation = 'Solid value if you play daily.';
  } else if (costPerHour < 20) {
    status = 'fair';
    interpretation = 'A luxury purchase. Only buy if you main this game.';
  } else {
    status = 'bad-deal';
    interpretation = 'Expensive. Only worth it for hardcore leaderboard grinding.';
  }

  // ROI Logic:
  // If (Time Saved + Currency Value) > Cost in X days
  const dailyValueRobux = timeValueGenerated + (extraEarningsDelta / 10000); // Very rough currency conversion 10k:1
  const daysToBreakEven = dailyValueRobux > 0 ? gamepassCost / dailyValueRobux : 999;

  const recommendations = [
    `Cost Efficiency: You are paying ${costPerHour.toFixed(1)} Robux for every hour you play this month.`,
    `Time Saved: This pass saves you ~${(timeSavedPerDay * 30 / 60).toFixed(1)} hours of walking/grinding per month.`,
    `Break-Even: At your pace, this pass "pays for itself" in utility after ${daysToBreakEven > 900 ? 'forever' : daysToBreakEven.toFixed(1) + ' days'}.`,
    `Boost Impact: Your daily income jumps from ${formatNumber(baseEarnings)} to ${formatNumber(boostedEarnings)}.`
  ];

  const plan = [
    {
      label: 'Verdict',
      detail: status === 'must-buy' ? 'Buy immediately. It saves too much time not to.' : status === 'bad-deal' ? 'Skip. You generally do not play enough to justify this cost.' : 'Buy if you plan to play for at least 2 more weeks.'
    },
    {
      label: 'Strategy',
      detail: `Pair this with pure grinding. The ${boostMultiplier}x multiplier scales best when you play long sessions (${dailyGrindHours}h+).`
    }
  ];

  return {
    breakEvenHours: daysToBreakEven.toFixed(1) + ' Days',
    valueRate: costPerHour < 5 ? 'High Value' : 'Luxury',
    dailyVirtualEarnings: formatNumber(boostedEarnings),
    timeSavedTotal: (timeSavedPerDay * 30 / 60).toFixed(1) + ' Hours',
    effectiveHourlyWage: formatNumber(extraEarningsDelta), // Extra currency per day
    status,
    interpretation,
    recommendations,
    plan,
    metrics: {
      cost: gamepassCost,
      valueGenerated: dailyValueRobux * 30,
      roiPercent: 0
    }
  };
};

const relatedCalculators = [
  {
    name: '(Roblox) Trading Profit Analyzer',
    slug: 'roblox-trading-profit-analyzer',
    description: 'Check tax and profits for limited trading.',
  },
  {
    name: '(Roblox) Egg Hatch Odds Simulator',
    slug: 'roblox-egg-hatch-odds-simulator',
    description: 'Simulate hatch costs for pets.',
  },
  {
    name: '(Roblox) Inventory Value Estimator',
    slug: 'roblox-inventory-value-estimator',
    description: 'Calculate net worth of your items.',
  },
  {
    name: '(Roblox) Pet Value Calculator',
    slug: 'roblox-pet-value-calculator',
    description: 'Lookup Adopt Me/PS99 pet values.',
  },
];

const faqs = [
  {
    question: 'How do I know if a Gamepass is worth it?',
    answer:
      'The best metric is "Cost per Hour". If a gamepass costs 400 Robux ($5) and you play the game for 100 hours, you represent paying 4 Robux (5 cents) per hour for that fun. That is excellent value.',
  },
  {
    question: 'Are "Double Luck" passes temporary?',
    answer:
      'Usually, no. Gamepasses are permanent one-time purchases on Roblox. "Boosts" are temporary consumables. Always check the description. If it is in the "Store" tab as a Pass, it is forever.',
  },
  {
    question: 'Do multipliers stack?',
    answer:
      'In 99% of Roblox games, yes. If you buy "2x Coins" and "VIP" (which gives +10%), they usually multiply or add. 100 coins becomes 220 or 210.',
  },
  {
    question: 'Can I get a refund on a Gamepass?',
    answer:
      'No. Roblox does not allow refunds on Gamepasses unless the content is deleted or broken by the developer, which is rare and hard to prove.',
  },
  {
    question: 'Is "Speed Run" or "Teleport" worth purchasing?',
    answer:
      'For grinding games (simulators), absolutely. Saving 50% of your travel time literally doubles your grinding efficiency. It effectively acts as a "2x Everything" boost.',
  }
];

const steps = [
  'Enter the Gamepass Cost (Robux).',
  'Estimate how many hours you grind this game daily.',
  'Input what the pass does (Multiplier? Time Save?).',
  'Check the "Cost Value" score to see if it is a smart buy.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-gamepass-roi-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: '(Roblox) Gamepass ROI Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      description: 'Calculate if a Roblox Gamepass is worth buying based on your playtime and the utility it provides.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'Roblox Gamepass Value: Is It Worth It?',
      description: 'Stop wasting Robux on bad gamepasses. Use our ROI calculator to determine the utility value of Speed, VIP, and Luck passes.',
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

export default function RobloxGamepassROICalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gamepassCost: 499,
      dailyGrindHours: 1,
      currencyEarnedPerDay: 1000,
      timeSavedPerDay: 0,
      boostMultiplier: 1,
      hourlyWage: 0
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateResult(values));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <Script id="roblox-gamepass-roi-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card className="border-l-4 border-l-orange-500 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gamepad2 className="h-6 w-6 text-orange-500" />
            Roblox Gamepass Value Calculator
          </CardTitle>
          <CardDescription>
            Is that 800 Robux gamepass actually worth buying? Find out here.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Search className="h-4 w-4" /> Gamepass Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="gamepassCost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-orange-600">Cost (Robux)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="bg-orange-500/5 border-orange-200" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dailyGrindHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Daily Playtime (Hours)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.5" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormDescription className="text-xs">Be honest!</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg">
                      <div className="col-span-2 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Utility Features (Fill what applies)
                      </div>
                      <FormField
                        control={form.control}
                        name="boostMultiplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Multiplier (e.g. 2x Coins)</FormLabel>
                            <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select boost" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">None (1x)</SelectItem>
                                <SelectItem value="1.5">1.5x Boost</SelectItem>
                                <SelectItem value="2">2x (Double)</SelectItem>
                                <SelectItem value="3">3x (Triple)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">If it gives extra items/currency.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="timeSavedPerDay"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Saved (Minutes/Day)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                            </FormControl>
                            <FormDescription className="text-xs">e.g. Teleport, Auto-Hatch, Speed</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg">
                    ANALYZE VALUE
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {result && (
            <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
              <Card className={`bg-slate-950 text-white border-slate-800 relative overflow-hidden ${result.status === 'must-buy' ? 'border-emerald-500/50' : result.status === 'bad-deal' ? 'border-red-500/50' : ''}`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${result.status === 'must-buy' ? 'from-emerald-900/20' : result.status === 'bad-deal' ? 'from-red-900/20' : 'from-orange-900/20'} to-transparent animate-pulse`}></div>
                <CardHeader className="relative pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Value Verdict</CardTitle>
                </CardHeader>
                <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Rating</h4>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-4xl font-black tracking-tight ${result.status === 'must-buy' ? 'text-emerald-400' : result.status === 'bad-deal' ? 'text-red-400' : 'text-orange-400'}`}>
                        {result.status === 'must-buy' ? 'MUST BUY' : result.status === 'good-deal' ? 'GOOD DEAL' : result.status === 'fair' ? 'FAIR' : 'BAD DEAL'}
                      </p>
                    </div>
                    <p className="text-sm text-slate-300 font-medium mt-1">
                      {result.interpretation}
                    </p>

                    <div className="mt-6 space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
                          {result.status === 'must-buy' ? <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" /> : <MinusCircle className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />}
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 flex flex-col justify-center">
                    <div className="p-3 bg-white/5 rounded border border-white/10 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Time Saved (Month)</div>
                        <div className="font-bold text-white">{result.timeSavedTotal}</div>
                      </div>
                      <Clock className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="p-3 bg-white/5 rounded border border-white/10 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Extra Earnings (Daily)</div>
                        <div className="font-bold text-white">+{result.dailyVirtualEarnings}</div>
                      </div>
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="p-3 bg-white/5 rounded border border-white/10 flex justify-between items-center">
                      <div>
                        <div className="text-xs text-slate-400">Break Even Point</div>
                        <div className="font-bold text-white">{result.breakEvenHours}</div>
                      </div>
                      <Activity className="w-5 h-5 text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-orange-600" />
                  Cost of Use
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>We calculate value based on <strong>utility per hour</strong>.</p>
                <p>A 500 Robux gamepass used for 100 hours costs <strong>5 Robux/hour</strong>. This is an excellent ratio.</p>
                <p>A 2,000 Robux pass used for 10 hours costs <strong>200 Robux/hour</strong>. That is very expensive entertainment.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Coins className="h-5 w-5 text-orange-600" />
                  Multiplier Logic
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p><strong>Compound Grinding:</strong> A 2x pass makes 1 hour of grinding equal to 2 hours of results.</p>
                <p>If you grind 1 hour daily, a 2x Pass saves you <strong>30 hours</strong> of real life in a single month.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Context & Guide */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-orange-50 to-transparent dark:from-orange-900/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Common Passes
              </CardTitle>

            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-right">Utility</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { r: 'VIP', v: 'Low' },
                    { r: '2x Coins', v: 'High' },
                    { r: 'Fast Hatch', v: 'High' },
                    { r: 'Hoverboard', v: 'Medium' },
                    { r: 'Teleport', v: 'Very High' },
                    { r: 'Magic Eggs', v: 'High' }
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
              <CardTitle className="text-lg">Buying Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-emerald-600 flex items-center gap-2"> The "Must Haves"</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Passes that affect speed (Teleport, Hoverboard, Auto-Run) are typically the best value because they act as a multiplier on EVERYTHING you do.
                </p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-red-600 flex items-center gap-2"> The "Traps"</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  VIP passes that only give a "Tag" and a small daily chest are rarely worth the Robux. Only buy for status.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">The "Quitting" Rule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Before buying a roughly 1,000 Robux pass ($12.50 USD), ask yourself:</p>
              <p className="italic">"Will I still be playing this game in 14 days?"</p>
              <p>If the answer is no, the cost per hour will be astronomical.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="Roblox Gamepass Value Calculator: ROI & Worth Analysis" />
        <meta itemProp="description" content="Should you buy that Gamepass? Calculate the true value of Roblox gamepasses based on your playtime and their utility." />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Roblox Gamepasses: Investment or Waste?</h1>
        <p className="text-lg italic text-muted-foreground">Roblox developers are geniuses at pricing. They make 499 Robux feel cheap. But is it? By breaking down the "Cost per Hour" and "Time Saved," we can mathematically assume if a Gamepass is a scam or a steal.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The "Utility" Factor</h2>
        <p>
          Not all Gamepasses are created equal. We categorize them into three tiers:
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li><strong>Multiplier Tier (Tier S):</strong> 2x Coins, 2x Luck. These linear boosters are the best value because they cut your grind time in half.</li>
            <li><strong>QoL Tier (Tier A):</strong> Teleport, Auto-Hatch, Sprint. These make the game less annoying. Highly recommended for long-term players.</li>
            <li><strong>Vanity Tier (Tier F):</strong> VIP Tags, Colored Chat, Pets. These offer zero mathematical advantage. Avoid if you are on a budget.</li>
          </ul>
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The 30-Day Rule</h2>
        <p>
          When calculating ROI, we assume a standard "Game Lifecycle" of 30 days. Most Roblox players switch main games every month.
          <br />
          If a gamepass costs <strong>1,200 Robux</strong>, you need to get 40 Robux of "Value" out of it every single day for a month to break even.
          If you quit after 3 days, you paid 400 Robux per day. That is roughly $5 USD per day just to play a Roblox game—more expensive than a AAA subscription!
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Worked Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario A: The "Grinder"</h4>
            <p className="text-sm"><strong>Pass:</strong> 2x Coins (499 R$)</p>
            <p className="text-sm"><strong>Playtime:</strong> 2 Hours/Day</p>
            <p className="text-sm"><strong>Result:</strong> Saves 60 hours/month.</p>
            <p className="text-xs text-muted-foreground mt-1">Cost is 8 R$ per saved hour. Incredible value.</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario B: The "Visual"</h4>
            <p className="text-sm"><strong>Pass:</strong> Gold Name Tag (299 R$)</p>
            <p className="text-sm"><strong>Playtime:</strong> 5 Hours/Day</p>
            <p className="text-sm"><strong>Result:</strong> Saves 0 hours.</p>
            <p className="text-xs text-muted-foreground mt-1">Pure cosmetic. Zero ROI.</p>
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
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-500" />
                  <Link href={`/category/gaming/${calc.slug}`} className="text-foreground hover:text-orange-500 transition-colors">
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
            <Calculator className="h-5 w-5" />
            Summary for AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            A Gamepass Value Calculator for Roblox.
            Inputs: Gamepass Cost, Daily Playtime, Multiplier Amount, Time Saved.
            Outputs: Value Verdict (Must Buy/Ripoff), Cost Per Hour of Use, Break-Even Time, and Total Time Saved.
          </p>
          <p>
            It prioritizes "Time utility" over arbitrary currency values, determining if a purchase is efficient for the user's specific lifestyle.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
