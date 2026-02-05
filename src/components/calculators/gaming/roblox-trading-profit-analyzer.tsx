'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Coins,
  TrendingUp,
  ArrowRightLeft,
  Clock,
  AlertTriangle,
  Trophy,
  BookOpen,
  BrainCircuit,
  ArrowRight,
  Percent
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  buyPrice: z.number({ invalid_type_error: 'Enter buy price' }).min(0, "Price cannot be negative"),
  sellPrice: z.number({ invalid_type_error: 'Enter sell price' }).min(0, "Price cannot be negative"),
  tradingFee: z.number({ invalid_type_error: 'Enter fee %' }).min(0).max(100).default(30),
  holdingPeriod: z.number({ invalid_type_error: 'Enter days' }).min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  grossProfit: string;
  taxPaid: string;
  netProfit: string;
  netProfitRaw: number;
  roi: string;
  roiRaw: number;
  dailyRoi: string;
  breakEven: string;
  status: 'loss' | 'break-even' | 'profit' | 'high-profit';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

function formatNumber(num: number): string {
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

const calculateResult = (values: FormValues): ResultPayload => {
  const { buyPrice, sellPrice, tradingFee, holdingPeriod } = values;

  const grossProfit = sellPrice - buyPrice;
  const taxAmount = Math.floor(sellPrice * (tradingFee / 100));
  const netProfit = sellPrice - taxAmount - buyPrice;

  const roi = buyPrice > 0 ? (netProfit / buyPrice) * 100 : 0;
  const dailyRoi = holdingPeriod > 0 ? roi / holdingPeriod : roi; // If 0 days, assumes instant flip

  const breakEvenSellPrice = Math.ceil(buyPrice / (1 - (tradingFee / 100)));

  let status: ResultPayload['status'] = 'break-even';
  let interpretation = '';

  if (netProfit < 0) {
    status = 'loss';
    interpretation = `You are losing ${formatNumber(Math.abs(netProfit))} Robux. The 30% tax is eating your margin.`;
  } else if (netProfit === 0) {
    status = 'break-even';
    interpretation = 'You broke even. No profit, but at least you didn\'t lose value.';
  } else if (roi > 40) {
    status = 'high-profit';
    interpretation = 'Excellent Flip! You are beating the market comfortably.';
  } else {
    status = 'profit';
    interpretation = 'Solid profitable trade. Keep compounding these gains.';
  }

  const recommendations = [
    `Tax Hit: -${formatNumber(taxAmount)} Robux went to Roblox fees.`,
    `Break-Even: You needed to sell at ${formatNumber(breakEvenSellPrice)} to profit.`,
    `Efficiency: Your gross profit was ${formatNumber(grossProfit)}, but tax took ${(taxAmount / (grossProfit || 1) * 100).toFixed(0)}% of it.`,
    `Compound Power: Doing this trade 10 times would turn ${formatNumber(buyPrice)} into ${formatNumber(buyPrice * Math.pow(1 + (roi / 100), 10))}.`
  ];

  const plan = [
    {
      label: 'Immediate',
      detail: netProfit > 0 ? 'Secure the profit. Reinvest into higher liquidity items.' : 'Do not sell yet. Wait for inflation or demand spike.'
    },
    {
      label: 'Strategy',
      detail: roi < 20 ? 'Too risky for low reward. Aim for 30%+ margins to be safe from crash.' : 'Great margin. Scable strategy.'
    }
  ];

  return {
    grossProfit: formatNumber(grossProfit),
    taxPaid: formatNumber(taxAmount),
    netProfit: formatNumber(netProfit),
    netProfitRaw: netProfit,
    roi: roi.toFixed(2) + '%',
    roiRaw: roi,
    dailyRoi: dailyRoi.toFixed(2) + '%',
    breakEven: formatNumber(breakEvenSellPrice),
    status,
    interpretation,
    recommendations,
    plan
  };
};

const relatedCalculators = [
  {
    name: '(Roblox) Limited Item Resale Predictor',
    slug: 'roblox-limited-item-resale-predictor',
    description: 'Predict if an item will rise or fall.',
  },
  {
    name: '(Roblox) Trade Tax Calculator',
    slug: 'roblox-trade-tax-calculator',
    description: 'Quick check for just the tax amount.',
  },
  {
    name: '(Roblox) Inventory Value Estimator',
    slug: 'roblox-inventory-value-estimator',
    description: 'Calculate total net worth of your profile.',
  },
  {
    name: '(Roblox) Pet Value Calculator',
    slug: 'roblox-pet-value-calculator',
    description: 'Check values for Adopt Me/PS99 pets.',
  },
  {
    name: '(Roblox) Gamepass ROI Calculator',
    slug: 'roblox-gamepass-roi-calculator',
    description: 'Is that gamepass worth the Robux?',
  },
];

const faqs = [
  {
    question: 'Why is the tax 30%?',
    answer:
      'Roblox takes a 30% cut on all user-generated sales (Limiteds, Gamepasses, Clothing) to prevent inflation and fund the platform. This means you only keep 70% of the sale price.',
  },
  {
    question: 'How do I avoid the 30% tax?',
    answer:
      'You cannot strictly avoid it on the marketplace. However, trading items directly (Value for Value) has no tax. Tax only applies when selling for Robux.',
  },
  {
    question: 'What is a good ROI for a Limited?',
    answer:
      'Given the high tax, you should aim for at least 40-50% gross profit to secure a safe 10-20% net profit. Buying at 1000 and selling at 1300 is barely break-even.',
  },
  {
    question: 'Does holding longer reduce tax?',
    answer:
      'No. The tax is flat. However, holding longer (investment) allows inflation to raise the price naturally, potentially covering the tax spread.',
  },
  {
    question: 'What is "Projected" vs "RAP"?',
    answer:
      'RAP is Recent Average Price. Projected items are those artificially inflated by a few sales. Never calulcate profit based on Projected values; use RAP or LAPs (Lowest Available Price).',
  },
  {
    question: 'Can I write off losses?',
    answer:
      'No, the Roblox economy does not have tax write-offs. A loss is a loss of currency.',
  },
  {
    question: 'Does this work for Group Funds?',
    answer:
      'Yes, distributing Group Funds or selling clothing for group funds also incurs the 30% fee. The logic remains the same.',
  }
];

const steps = [
  'Enter your Buy Price (what you paid).',
  'Enter your Sold Price (or target sell price).',
  'Adjust the Tax Rate if needed (Default 30% for Limiteds).',
  'Enter Holding Time (Days) to see efficiency.',
  'Analyze the Net Profit red/green indicator.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-trading-profit-analyzer';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: '(Roblox) Trading Profit Analyzer',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Any',
      description: 'Calculate net profit after Roblox 30% fees. ROI, Margin, and Break-even point analyzer.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'Article',
      headline: 'Roblox Profit Calculator: Master the 30% Tax',
      description: 'Stop losing Robux to fees. Use our Trading Profit Analyzer to calculate exact net returns and break-even points for Limiteds.',
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

export default function RobloxTradingProfitAnalyzer() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buyPrice: 1000,
      sellPrice: 1500,
      tradingFee: 30, // Standard Roblox Tax
      holdingPeriod: 0,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateResult(values));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <Script id="roblox-trading-profit-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card className="border-l-4 border-l-emerald-500 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Coins className="h-6 w-6 text-emerald-500" />
            Roblox Profit & Tax Analyzer
          </CardTitle>
          <CardDescription>
            Calculate true net profit after the 30% market fee.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trade Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="buyPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-emerald-600 font-bold">Buy Price (Robux)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="bg-emerald-500/5 border-emerald-200 focus:border-emerald-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sellPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-blue-600 font-bold">Sell Price (Robux)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="bg-blue-500/5 border-blue-200 focus:border-blue-500" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tradingFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roblox Tax %</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Limiteds are always 30%.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="holdingPeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Days Held (Optional)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Calculates daily efficiency.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 font-bold text-white shadow-lg">
                    CALCULATE NET PROFIT
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {result ? (
            <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
              <Card className={`bg-slate-950 text-white border-slate-800 relative overflow-hidden ${result.netProfitRaw < 0 ? 'border-red-900/50' : 'border-emerald-900/50'}`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${result.netProfitRaw < 0 ? 'from-red-900/20 to-orange-900/10' : 'from-emerald-900/20 to-teal-900/10'} animate-pulse`}></div>
                <CardHeader className="relative pb-2">
                  <CardTitle className="text-sm font-medium text-slate-400">Financial Result</CardTitle>
                </CardHeader>
                <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Net Profit (Post-Tax)</h4>
                    <p className={`text-4xl font-black tracking-tight ${result.netProfitRaw < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {result.netProfitRaw > 0 ? '+' : ''}{result.netProfit} R$
                    </p>
                    <p className="text-sm text-slate-400 mt-1 font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> ROI: <span className="text-white">{result.roi}</span>
                    </p>

                    <div className="mt-6 space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 flex flex-col justify-center">
                    <div className="p-4 border border-white/10 bg-white/5 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-white text-sm">Break-Even Sell Price</h4>
                        <BadgeCheckIcon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-2xl font-bold text-white">{result.breakEven} R$</p>
                      <p className="text-xs text-slate-400 mt-1">Selling below this is a loss.</p>
                    </div>
                    <div className="p-4 border border-white/10 bg-white/5 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-white text-sm">Tax Paid</h4>
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      </div>
                      <p className="text-xl font-bold text-white">{result.taxPaid} R$</p>
                      <p className="text-xs text-slate-400 mt-1">Lost to the void.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center p-12 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
              <div className="text-center space-y-4 max-w-sm">
                <ArrowRightLeft className="w-16 h-16 mx-auto opacity-20" />
                <h3 className="text-lg font-semibold">Calculator Ready</h3>
                <p>Input your buy and sell targets to see if the trade survives the 30% tax.</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  The 30% Rule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p><strong>Limiters:</strong> Every time you sell a Limited item, Roblox takes 30%.</p>
                <p><strong>Example:</strong> Sell for 1000 &rarr; You get 700.</p>
                <p><strong>Impact:</strong> To make even 1 Robux of profit, you must sell for at least <strong> ~1.43x</strong> your buy price.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BrainCircuit className="h-5 w-5 text-emerald-600" />
                  Profit Formula
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Net Calculation:</strong></p>
                <code className="bg-muted px-2 py-1 rounded block w-fit">Profit = (Sell &times; 0.70) - Buy</code>
                <p>We calculate the exact floor values used by Roblox's rounding system to ensure accuracy.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Context & Guide */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-900/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-emerald-600" />
                Fee Database
              </CardTitle>
              <CardDescription>Standard Roblox Fees</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3 text-left">Transaction Type</th>
                    <th className="p-3 text-right">Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[
                    { t: 'Limited Item Sale', v: '30%' },
                    { t: 'Clothing/UGC Sale', v: '30%' },
                    { t: 'Gamepass Sale', v: '30%' },
                    { t: 'Group Payout', v: '0%' },
                    { t: 'Direct Trading', v: '0%' },
                    { t: 'Devex (Cash Out)', v: 'Variable' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="p-3 font-medium">{row.t}</td>
                      <td className="p-3 text-right text-muted-foreground font-mono">{row.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Investment Tiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-blue-600 flex items-center gap-2 text-sm"><Clock className="h-3 w-3" /> The Flipper</h4>
                <p className="text-xs text-muted-foreground mt-1">Buys and sells same-day. Aims for 5-10% margins after tax. High volume.</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-lg">
                <h4 className="font-bold text-purple-600 flex items-center gap-2 text-sm"><Trophy className="h-3 w-3" /> The Holder</h4>
                <p className="text-xs text-muted-foreground mt-1">Buys exclusives. Holds for 6+ months. Ignores tax because item value doubles (100% ROI).</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Special Scenarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" /> Projecteds</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  If an item graph spikes vertically, it's a "Projected". Do not calculate profit based on that spike. It will crash in 24h.
                </p>
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
        <meta itemProp="name" content="Roblox Trading Profit Calculator: Net Profit & Tax Analysis" />
        <meta itemProp="description" content="Calculate your actual Roblox trading profits after the 30% tax. Master the art of flipping with precise ROI and break-even data." />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Roblox Trading Profit: Beating the 30% Tax</h1>
        <p className="text-lg italic text-muted-foreground">The Roblox economy is unforgiving. With a flat 30% fee on all sold items, the math of profitability is harder than it looks. This tool ensures you never make a bad trade again.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The "Silent Killer" of Profit</h2>
        <p>
          New traders often fall into the trap of "Buy at 1000, Sell at 1200". It looks like a 200 Robux profit on paper.
          In reality, Roblox takes 30% of the 1200 sale (360 Robux).
          <br />
          <strong>Math:</strong> 1200 - 360 (Tax) - 1000 (Buy) = <strong>-160 Robux</strong>.
          You lost money despite selling higher.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Strategy 1: The 43% Rule</h3>
        <p>
          To simply break even (make 0 profit), you must sell an item for roughly <strong>1.43 times</strong> its purchase price.
          <br />
          <em>Formula: Buy Price / 0.7 = Break Even.</em>
          <br />
          If you buy a Dominus for 100,000, you MUST sell it for 142,858 just to get your 100,000 back. Any profit only starts <strong>after</strong> that number.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Strategy 2: Trading vs. Selling</h3>
        <p>
          This calculator is vital for <strong>Marketplace Sales</strong>. However, strict "Trading" (using the trade window to swap items) incurs <strong>0% tax</strong>.
          Smart players build value by trading items up (e.g., swapping a Fedora for a slight overpay in items) repeatedly.
          They only "Cashed Out" (Sell for Robux) when they have amassed enough profit to cover the 30% hit comfortably.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Worked Examples</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario A: The Successful Flip</h4>
            <p className="text-sm"><strong>Buy:</strong> 5,000 R$</p>
            <p className="text-sm"><strong>Sell:</strong> 8,000 R$</p>
            <p className="text-sm"><strong>Tax (30%):</strong> 2,400 R$</p>
            <p className="text-sm mt-2"><strong>Net:</strong> 8,000 - 2,400 - 5,000 = <span className="text-emerald-500 font-bold">+600 R$</span>.</p>
            <p className="text-xs text-muted-foreground mt-1">A tight but successful profit.</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
            <h4 className="font-bold text-foreground">Scenario B: The Rookie Mistake</h4>
            <p className="text-sm"><strong>Buy:</strong> 10,000 R$</p>
            <p className="text-sm"><strong>Sell:</strong> 13,000 R$</p>
            <p className="text-sm"><strong>Tax (30%):</strong> 3,900 R$</p>
            <p className="text-sm mt-2"><strong>Net:</strong> 13,000 - 3,900 - 10,000 = <span className="text-red-500 font-bold">-900 R$</span>.</p>
            <p className="text-xs text-muted-foreground mt-1">Sold for 3k more, but still lost money.</p>
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
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500" />
                  <Link href={`/category/gaming/${calc.slug}`} className="text-foreground hover:text-emerald-500 transition-colors">
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
            A profit analyzer specifically for the Roblox economy, focusing on the <strong>30% marketplace fee</strong>.
            Inputs: Buy Price, Sell Price, Holding Period.
            Outputs: Net Profit (Post-Tax), ROI%, Break-Even Price (`Buy / 0.7`), and Tax Paid.
          </p>
          <p>
            It highlights the difficulty of profiting with shallow margins and differentiates between "Marketplace Sales" (Taxed) and "Direct Trading" (Untaxed).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function BadgeCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.78 4.78 4 4 0 0 1-6.74 0 4 4 0 0 1-4.78-4.78 4 4 0 0 1 0-6.74Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
