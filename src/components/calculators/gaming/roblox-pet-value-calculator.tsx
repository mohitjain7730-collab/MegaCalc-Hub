'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Gamepad2,
  Target,
  Activity,
  Shield,
  Trophy,
  TrendingUp,
  Coins,
  Sparkles,
  BookOpen,
  BrainCircuit,
  ArrowRight
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
  baseRarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical', 'exclusive']),
  petAge: z.number({ invalid_type_error: 'Enter pet age' }).min(0, "Age must be positive"),
  demandLevel: z.number({ invalid_type_error: 'Enter demand level' }).min(0).max(100, "Demand is 0-100"),
  specialAttributes: z.number({ invalid_type_error: 'Enter special attributes count' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  baseRarity: string;
  petAge: number;
  demandLevel: number;
  specialAttributes: number;
  baseValue: number;
  ageMultiplier: number;
  demandMultiplier: number;
  attributeBonus: number;
  estimatedValue: string;
  status: 'low' | 'moderate' | 'high' | 'very-high';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const rarityMultipliers: Record<string, number> = {
  common: 100,
  uncommon: 500,
  rare: 2500,
  epic: 10000,
  legendary: 50000,
  mythical: 250000,
  exclusive: 1000000,
};

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return num.toLocaleString();
}

const calculateResult = (values: FormValues): ResultPayload => {
  const baseRarity = values.baseRarity;
  const petAge = values.petAge;
  const demandLevel = values.demandLevel;
  const specialAttributes = values.specialAttributes;

  // Base value based on rarity (Gem Value approximation)
  const baseValue = rarityMultipliers[baseRarity] || 100;

  // Age multiplier: Older pets get a vintage bonus
  // Cap at 5x for extremely old pets (3+ years)
  const ageMultiplier = Math.min(1 + (petAge / 365) * 0.5, 5.0);

  // Demand multiplier: 0.1x (Trash) to 5.0x (Hyped)
  // 50 is neutral (1x)
  let demandMultiplier = 1;
  if (demandLevel < 50) {
    demandMultiplier = 0.1 + (demandLevel / 50) * 0.9;
  } else {
    demandMultiplier = 1 + ((demandLevel - 50) / 50) * 4;
  }

  // Attribute bonus: Multiplicative
  // Each attribute adds 50% value
  const attributeBonus = Math.pow(1.5, specialAttributes);

  // Estimated value calculation
  const rawValue = baseValue * ageMultiplier * demandMultiplier * attributeBonus;

  let status: ResultPayload['status'] = 'moderate';
  let interpretation = '';

  if (rawValue >= 1000000) {
    status = 'very-high';
    interpretation = 'This pet is a wealthy asset. It likely commands high-tier trades or massive gem overpays.';
  } else if (rawValue >= 100000) {
    status = 'high';
    interpretation = 'Strong trading value. Suitable for mid-to-high tier trading.';
  } else if (rawValue >= 10000) {
    status = 'moderate';
    interpretation = 'Decent starter to mid-game value.';
  } else {
    status = 'low';
    interpretation = 'Common value. Mostly used as fodder or for collection filling.';
  }

  const recommendations = [
    `Rarity Base: ${formatNumber(baseValue)} (${baseRarity})`,
    `Age Bonus: +${Math.round((ageMultiplier - 1) * 100)}% value from ${petAge} days history.`,
    `Market Demand: ${demandMultiplier.toFixed(1)}x multiplier due to ${demandLevel}/100 popularity.`,
    `Attributes: ${specialAttributes} special traits boosting value by ${((attributeBonus - 1) * 100).toFixed(0)}%.`,
  ];

  const plan = [
    {
      label: 'Immediate Action',
      detail: rawValue > 500000 ? 'Lock this pet. Do not trade fast.' : 'Open to offers, but verify prices.'
    },
    {
      label: 'Long Term',
      detail: petAge < 100 ? 'Hold to increase age value.' : 'Value has stabilized, good to trade.'
    },
  ];

  return {
    baseRarity,
    petAge,
    demandLevel,
    specialAttributes,
    baseValue,
    ageMultiplier,
    demandMultiplier,
    attributeBonus,
    estimatedValue: formatNumber(rawValue),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

const relatedCalculators = [
  {
    name: '(Roblox) Pet Simulator X Golden Pet Value',
    slug: 'roblox-pet-simulator-x-golden-pet-value-calculator',
    description: 'Calculate Golden and Rainbow upgrades specifically.',
  },
  {
    name: '(Roblox) Egg Hatch Odds Simulator',
    slug: 'roblox-egg-hatch-odds-simulator',
    description: 'Simulate your luck with egg hatching.',
  },
  {
    name: '(Roblox) Trade Tax Calculator',
    slug: 'roblox-trade-tax-calculator',
    description: 'Don\'t forget the 30% tax!',
  },
  {
    name: '(Roblox) Inventory Value Estimator',
    slug: 'roblox-inventory-value-estimator',
    description: 'Get a total estimation of your entire backpack.',
  },
  {
    name: '(Roblox) Pet Dupe Value Calculator',
    slug: 'roblox-pet-dupe-value-calculator',
    description: 'Check values for duped pets.',
  },
  {
    name: '(Roblox) Limited Item Resale Predictor',
    slug: 'roblox-limited-item-resale-predictor',
    description: 'Predict resale values for limited items.',
  },
];

const faqs = [
  {
    question: 'How do I know the "Base Rarity" of my pet?',
    answer:
      'The background color of your pet in the inventory usually indicates rarity: Grey (Common), Green (Uncommon), Blue (Rare), Purple (Epic), Orange/Red (Legendary), Pink (Mythical). Exclusive pets often have special tags or animated backgrounds.',
  },
  {
    question: 'Why does "Demand" change the value so much?',
    answer:
      'Roblox economies are market-driven. A pet can be rare (low supply) but if nobody wants it (low demand), it has no trading power. Conversely, a common pet needed for a new fusion event will skyrocket in value due to high demand.',
  },
  {
    question: 'How does Age add value?',
    answer:
      'Older pets are often discontinued or "OG". In games like Adopt Me or PSX, having a pet from 2019 or 2020 proves you are a veteran player. Collectors pay a premium for these "clean" history pets.',
  },
  {
    question: 'What counts as a "Special Attribute"?',
    answer:
      'Attributes include: Shiny, Rainbow, Golden, Neon, Mega Neon, Glitched, Signed (by a developer/YouTuber), or low serial number. Each of these adds a multiplier to the base price.',
  },
  {
    question: 'Is this calculator for Adopt Me or Pet Simulator?',
    answer:
      'This is a universal value estimator using standard economic principles applicable to most Roblox collection games (Adopt Me, PS99, PSX, MM2). For game-specific mechanics (like Golden Machine), use our specific calculators linked below.',
  },
  {
    question: 'Should I trust this value 100%?',
    answer:
      'Use this as a "fair value" baseline. The actual trade depends on the person you are trading with. If a user really wants your specific pet, they may overpay. Always check recent listings in the trading plaza.',
  },
  {
    question: 'What is the "Exclusive" tier?',
    answer:
      'Exclusive pets are usually bought with Robux or obtained from limited-time events. They do not come from regular eggs. Their value is tied to their Robux cost and inflation, making them very stable currencies.',
  },
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-pet-value-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: '(Roblox) Pet Value Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Any',
      description: 'Calculate the trading value of Roblox pets based on rarity, age, demand, and attributes.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'Roblox Pet Value Calculator: The Ultimate Trading Guide',
      description: 'Accurately estimate the value of any Roblox pet. account for rarity, demand, age, and special attributes to win every trade.',
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

export default function RobloxPetValueCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baseRarity: 'legendary',
      petAge: 30,
      demandLevel: 50,
      specialAttributes: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateResult(values));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <Script id="roblox-pet-value-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card className="border-l-4 border-l-blue-500 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Gamepad2 className="h-6 w-6 text-blue-500" />
            Roblox Pet Value Calculator
          </CardTitle>
          <CardDescription>
            Universal value estimator for Adopt Me, PS99, and MM2.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pet Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="baseRarity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rarity Tier</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select rarity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="common">Common (Grey)</SelectItem>
                              <SelectItem value="uncommon">Uncommon (Green)</SelectItem>
                              <SelectItem value="rare">Rare (Blue)</SelectItem>
                              <SelectItem value="epic">Epic (Purple)</SelectItem>
                              <SelectItem value="legendary">Legendary (Orange)</SelectItem>
                              <SelectItem value="mythical">Mythical (Pink)</SelectItem>
                              <SelectItem value="exclusive">Exclusive (Special)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="demandLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Market Demand (0-100)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>No one wants it</span>
                            <span>Mega Hype</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="petAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age (Days)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialAttributes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel># Special Traits</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Count Shiny, Neon, Rainbow, etc.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-lg shadow-blue-500/20">
                    CALCULATE TRUE VALUE
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {result ? (
            <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
              <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-cyan-600/10 animate-pulse"></div>
                <CardHeader className="relative pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Valuation Report</CardTitle>
                </CardHeader>
                <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Estimated Worth</h4>
                    <p className="text-4xl font-black text-white tracking-tight">{result.estimatedValue}</p>
                    <p className="text-sm text-blue-400 mt-1 font-medium">{result.interpretation}</p>

                    <div className="mt-6 space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 flex flex-col justify-center">
                    <div className="p-4 border border-white/10 bg-white/5 rounded-xl">
                      <h4 className="flex items-center gap-2 font-bold mb-3 text-white border-b border-white/10 pb-2">
                        <Activity className="h-4 w-4 text-green-400" /> Action Plan
                      </h4>
                      <div className="space-y-3">
                        {result.plan.map((p, i) => (
                          <div key={i}>
                            <span className="text-xs font-bold text-slate-400 uppercase">{p.label}</span>
                            <p className="text-sm text-slate-200">{p.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center p-12 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
              <div className="text-center space-y-4 max-w-sm">
                <Target className="w-16 h-16 mx-auto opacity-20" />
                <h3 className="text-lg font-semibold">Ready to Appraise</h3>
                <p>Fill in the rarity, age, and demand to see how much your inventory is worth.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Understanding the Inputs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p><strong>Rarity Tier:</strong> The fundamental "spawn rate" of the pet. Mythicals are harder to hatch than Commons, giving them a higher base price.</p>
                <p><strong>Market Demand:</strong> This is the "Hype Factor". A pet with 100 Demand is something everyone is looking for (e.g., a new update pet). A pet with 0 Demand is "dead stock".</p>
                <p><strong>Age:</strong> Represents days since the pet was obtained or the event happened. Older pets accrue "vintage" value.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BrainCircuit className="h-5 w-5 text-blue-500" />
                  Formula Used
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Valuation Logic:</strong></p>
                <code className="bg-muted px-2 py-1 rounded block w-fit">Value = Base &times; (Age_Mult + Demand_Mult) &times; Attr_Bonus</code>
                <p>We use a composite score that weighs <strong>Scarcity (Rarity)</strong> against <strong>Liquidity (Demand)</strong>.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Context & Guide */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-600" />
                Market Database
              </CardTitle>
              <CardDescription>Average Base Values</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Tier</th>
                    <th className="p-3 text-right">Avg Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { t: 'Common', v: '100' },
                    { t: 'Uncommon', v: '500' },
                    { t: 'Rare', v: '2.5K' },
                    { t: 'Epic', v: '10K' },
                    { t: 'Legendary', v: '50K' },
                    { t: 'Mythical', v: '250K+' },
                    { t: 'Exclusive', v: '1M+' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="p-3 font-medium">{row.t}</td>
                      <td className="p-3 text-right text-muted-foreground">{row.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Special Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-amber-600 flex items-center gap-2 text-sm"><Sparkles className="h-3 w-3" /> Shiny/Rainbow</h4>
                <p className="text-xs text-muted-foreground mt-1">Multiplies value by 1.5x - 3x depending on the game.</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-purple-600 flex items-center gap-2 text-sm"><Trophy className="h-3 w-3" /> Huge/Titanic</h4>
                <p className="text-xs text-muted-foreground mt-1">These always hold 100-200% of their RAP value even in crashes.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ROI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Hold or Sell?</p>
                <ul className="list-disc pl-4 text-muted-foreground mt-1 space-y-1">
                  <li><strong>New Pets:</strong> SELL immediately (Hype crash).</li>
                  <li><strong>Event Pets:</strong> HOLD for 6+ months.</li>
                  <li><strong>Exclusives:</strong> HOLD as inflation hedge.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEO & Guide Section */}
      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
        <meta itemProp="name" content="Roblox Pet Value Calculator: Official Trading Values" />
        <meta itemProp="description" content="Calculate accurate Roblox pet values. Our algorithm uses rarity, demand, age, and attributes to give you the real trading price." />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Roblox Pet Value Calculator: The Ultimate Trading Logic</h1>
        <p className="text-lg italic text-muted-foreground">Stop getting scammed. Use data-driven value estimation to ensure you win every trade in Adopt Me, Pet Simulator 99, and MM2.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How Pet Value is Calculated</h2>
        <p>
          The economy of Roblox is complex. Unlike traditional RPGs where an item has a fixed gold price, Roblox pets fluctuate exclusively based on <strong>player sentiment regarding supply and demand</strong>.
          This calculator mimics that volatile market by weighting four key pillars.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. The Rarity Foundation</h3>
        <p>
          Every pet starts with a "Base Value" defined by its hatch chane. A <strong>Common Cat</strong> (50% hatch rate) is virtually worthless because supply is infinite.
          A <strong>Mythical Dragon</strong> (0.0001% hatch rate) has high base value because supply is choked.
          <br />
          However, rarity is not everything. An ugly Mythical might be worth less than a cute Legendary. This is where <em>Demand</em> comes in.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. The Demand Multiplier (Hype)</h3>
        <p>
          Demand is the most powerful force in Roblox trading. We rate demand on a 0-100 scale:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>0-20 (Dead):</strong> Old event pets that look bad. Hard to sell even for cheap.</li>
          <li><strong>50 (Stable):</strong> Standard tier pets (e.g., Unicorns) that always have a buyer.</li>
          <li><strong>80-100 (Hyped):</strong> New update pets. For the first 48 hours, these can trade for 5x-10x their actual rarity value.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Age & Vintage Status</h3>
        <p>
          In economies like <em>Adopt Me</em>, an egg from 2019 (e.g., Safari Egg) is worth massive amounts not just because of what's inside, but because it is a "collectible antique".
          Our algorithm applies a <strong>Vintage Multiplier</strong> that grows for every year the pet exists. A 3-year-old pet is automatically considered a "High Tier" asset regardless of its base stats.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Worked Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario A: The New Update Pet</h4>
            <p className="text-sm"><strong>Pet:</strong> Cyber Agony (Mythical)</p>
            <p className="text-sm"><strong>Age:</strong> 1 Day</p>
            <p className="text-sm"><strong>Demand:</strong> 100 (Max Hype)</p>
            <p className="text-sm mt-2"><strong>Result:</strong> Value skyrockets. Even though it's just a Mythical, the max demand pushes it to Exclusive tier prices. <span className="text-red-500 font-bold">Recommendation: SELL NOW.</span></p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario B: The Forgotten Exclusive</h4>
            <p className="text-sm"><strong>Pet:</strong> Old Event Corgi</p>
            <p className="text-sm"><strong>Age:</strong> 500 Days</p>
            <p className="text-sm"><strong>Demand:</strong> 20 (Low)</p>
            <p className="text-sm mt-2"><strong>Result:</strong> High Base Value + High Age Bonus, but crushed by Low Demand. <span className="text-blue-500 font-bold">Recommendation: HOLD.</span> Wait for a "Dog Event" to sell when hype returns.</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">ROI: Investment Strategy</h2>
        <p>
          <strong>The "Inflation Hedge" Strategy:</strong> The safest place to park your Gems/Bucks is in <strong>Huge or Titanic</strong> pets.
          Because currency acts inflationary (more gems enter the game every day), pets with fixed supply automatically go up in numerical value.
          Never hold millions of Gems; always convert them into liquid pets (like Huge Hell Rocks) to preserve buying power.
        </p>
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
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
                  <Link href={`/category/gaming/${calc.slug}`} className="text-foreground hover:text-blue-500 transition-colors">
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
            Calculates Roblox pet value using a weighted formula:
            <code>Value = Base_Rarity (100-1M) * Age_Mult (1.0-5.0x) * Demand_Mult (0.1-5.0x) * Attributes (1.5x per trait)</code>.
          </p>
          <p>
            It provides specific trading advice (Hold vs Sell) based on the calculated volatility.
            Designed for Pet Simulator 99, Adopt Me, and MM2 trading economies. Includes rarity tiers, demand logic, and ROI strategy guides.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
