'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calculator, DollarSign, Calendar, BarChart2, Info, Repeat, FunctionSquare, HelpCircle, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  initialInvestment: z.number().min(0).optional(),
  monthlyContribution: z.number().min(0).optional(),
  annualDividendYield: z.number().min(0).max(50).optional(), // %
  dividendFrequency: z.enum(['monthly', 'quarterly', 'semiannual', 'annual']).optional(),
  sharePriceGrowth: z.number().min(-50).max(100).optional(), // % p.a.
  years: z.number().min(1).max(50).optional(),
  currentSharePrice: z.number().min(0.01).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Result = {
  finalValue: number;
  totalContributions: number;
  totalDividends: number;
  sharesAccumulated: number;
  yearByYear: { year: number; value: number; shares: number; dividends: number }[];
  interpretation: string;
  recommendations: string[];
  warnings: string[];
};

export default function DividendReinvestmentDRIPCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialInvestment: undefined,
      monthlyContribution: undefined,
      annualDividendYield: undefined,
      dividendFrequency: 'quarterly',
      sharePriceGrowth: undefined,
      years: undefined,
      currentSharePrice: undefined,
    }
  });

  const frequencyPerYear = (f: FormValues['dividendFrequency']) =>
    f === 'monthly' ? 12 : f === 'quarterly' ? 4 : f === 'semiannual' ? 2 : 1;

  const simulate = (v: FormValues) => {
    if (
      v.initialInvestment == null || v.monthlyContribution == null || v.annualDividendYield == null ||
      v.dividendFrequency == null || v.sharePriceGrowth == null || v.years == null || v.currentSharePrice == null
    ) return null;

    const steps = v.years * 12; // monthly timeline
    const divFreq = frequencyPerYear(v.dividendFrequency);
    const divStep = Math.round(12 / divFreq); // months between dividends
    const rDiv = v.annualDividendYield / 100 / divFreq; // per dividend event
    const rPriceMonthly = Math.pow(1 + v.sharePriceGrowth / 100, 1 / 12) - 1;

    let sharePrice = v.currentSharePrice;
    let shares = v.initialInvestment / sharePrice;
    let cash = 0;
    let totalContrib = v.initialInvestment;
    let totalDividends = 0;
    const rows: Result['yearByYear'] = [];

    for (let m = 1; m <= steps; m++) {
      // monthly contribution buys shares at current price
      if (v.monthlyContribution > 0) {
        shares += v.monthlyContribution / sharePrice;
        totalContrib += v.monthlyContribution;
      }
      // dividend event
      if (m % divStep === 0) {
        const divCash = shares * sharePrice * rDiv; // dividend based on market value
        totalDividends += divCash;
        // reinvest all dividends
        shares += divCash / sharePrice;
      }
      // price grows monthly
      sharePrice *= 1 + rPriceMonthly;
      // end of year snapshot
      if (m % 12 === 0) {
        const year = m / 12;
        const value = shares * sharePrice + cash;
        rows.push({ year, value, shares, dividends: totalDividends });
      }
    }

    const finalValue = shares * sharePrice + cash;
    return { finalValue, totalContributions: totalContrib, totalDividends, sharesAccumulated: shares, yearByYear: rows };
  };

  const interpret = (fv: number, contrib: number) => {
    if (fv >= contrib * 2) return 'Strong compounding from reinvested dividends and price growth.';
    if (fv >= contrib * 1.2) return 'Compounding at work—steady contributions and DRIP improve outcomes.';
    return 'Limited growth—consider yield, growth assumptions, or longer horizon.';
  };

  const onSubmit = (values: FormValues) => {
    const s = simulate(values);
    if (!s) { setResult(null); return; }
    setResult({
      ...s,
      interpretation: interpret(s.finalValue, s.totalContributions),
      recommendations: [
        'Automate contributions to stay invested through cycles',
        'Favor reliable dividend growth and sustainable payout ratios',
        'Diversify across sectors to reduce income risk',
      ],
      warnings: [
        'Dividends are not guaranteed and can be cut',
        'Taxes and fees are excluded in this model',
        'Past dividend growth does not predict future results',
      ],
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Repeat className="h-5 w-5" /> Dividend Reinvestment (DRIP)</CardTitle>
          <CardDescription>Simulate dividend reinvestment with monthly contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="initialInvestment" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Initial Investment</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 5000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="monthlyContribution" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Calculator className="h-4 w-4" /> Monthly Contribution</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="currentSharePrice" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Share Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="annualDividendYield" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Annual Dividend Yield (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="dividendFrequency" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Dividend Frequency</FormLabel><FormControl><select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={e => field.onChange(e.target.value as any)}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="semiannual">Semiannual</option><option value="annual">Annual</option></select></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="sharePriceGrowth" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Share Price Growth (% p.a.)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="years" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Years</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Simulate DRIP</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><TrendingUp className="h-8 w-8 text-primary" /><div><CardTitle>DRIP Results</CardTitle><CardDescription>Compounding with reinvested dividends</CardDescription></div></div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Final Portfolio Value</div><p className="text-3xl font-bold text-primary">${result.finalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Shares Accumulated</div><p className="text-3xl font-bold text-green-600">{result.sharesAccumulated.toFixed(2)}</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Total Contributions</p><p className="text-xl font-semibold">${result.totalContributions.toLocaleString()}</p></div>
                <div className="p-4 border rounded"><p className="text-sm text-muted-foreground mb-1">Total Dividends Reinvested</p><p className="text-xl font-semibold">${result.totalDividends.toLocaleString()}</p></div>
                <div className="p-4 border rounded md:col-span-1"><p className="text-sm text-muted-foreground mb-1">Summary</p><p className="text-sm">{result.interpretation}</p></div>
              </div>

              <Card className="mb-6">
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart2 className="h-5 w-5" /> Year‑by‑Year</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b"><th className="text-left p-2">Year</th><th className="text-right p-2">Value</th><th className="text-right p-2">Shares</th><th className="text-right p-2">Cumulative Dividends</th></tr></thead>
                      <tbody>
                        {result.yearByYear.slice(0, 11).map((r) => (
                          <tr key={r.year} className="border-b"><td className="p-2">{r.year}</td><td className="text-right p-2">${r.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td><td className="text-right p-2">{r.shares.toFixed(2)}</td><td className="text-right p-2">${r.dividends.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle>Recommendations</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.recommendations.map((r, i) => (<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent></Card>
                <Card><CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.warnings.map((w, i) => (<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent></Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Explore more investing tools</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</Link></h4><p className="text-sm text-muted-foreground">Understand growth over time.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Rate of Return</Link></h4><p className="text-sm text-muted-foreground">Account for inflation.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/present-value-calculator" className="text-primary hover:underline">Present Value</Link></h4><p className="text-sm text-muted-foreground">Discount future cash flows.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield</Link></h4><p className="text-sm text-muted-foreground">Income rate per price.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Future Value = Shares × Share Price
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Where: Shares = Initial Shares + (Monthly Contributions / Price) + (Dividends Reinvested / Price)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            DRIP compounds returns by automatically reinvesting dividend payments to purchase additional shares,
            which then generate their own dividends, creating an exponential growth effect over time.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>What each parameter means for your DRIP simulation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Initial Investment</h4>
              <p className="text-sm text-muted-foreground">The starting amount you invest to purchase shares. This forms the base of your position that will generate dividends.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Calculator className="h-4 w-4" /> Monthly Contribution</h4>
              <p className="text-sm text-muted-foreground">Additional money you add each month to buy more shares. Regular contributions accelerate wealth building through dollar-cost averaging.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Share Price</h4>
              <p className="text-sm text-muted-foreground">The current market price per share. Used to calculate how many shares your initial investment and contributions buy.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Annual Dividend Yield</h4>
              <p className="text-sm text-muted-foreground">The annual dividend expressed as a percentage of share price. A 3% yield on a $100 stock pays $3 per share annually.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" /> Dividend Frequency</h4>
              <p className="text-sm text-muted-foreground">How often the company pays dividends. Most US companies pay quarterly, but REITs often pay monthly.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Share Price Growth</h4>
              <p className="text-sm text-muted-foreground">Expected annual appreciation in share price. Historical stock market average is around 7-10% before inflation.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Complete Guide to Dividend Reinvestment (DRIP): How Compounding Builds Wealth</h1>
        <p className="text-lg italic text-muted-foreground">Understand how automatically reinvesting dividends can transform modest investments into substantial wealth over time through the power of compound growth.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#what-is-drip" className="hover:underline">What is a Dividend Reinvestment Plan (DRIP)?</a></li>
          <li><a href="#power-of-compounding" className="hover:underline">The Power of Dividend Compounding</a></li>
          <li><a href="#how-drip-works" className="hover:underline">How DRIP Works in Practice</a></li>
          <li><a href="#drip-vs-cash" className="hover:underline">DRIP vs. Taking Cash Dividends</a></li>
          <li><a href="#tax-implications" className="hover:underline">Tax Implications of DRIP</a></li>
          <li><a href="#best-stocks" className="hover:underline">Best Stocks for DRIP Investing</a></li>
        </ul>
        <hr />

        <h2 id="what-is-drip" className="text-2xl font-bold text-foreground pt-8">What is a Dividend Reinvestment Plan (DRIP)?</h2>
        <p>A Dividend Reinvestment Plan, commonly known as DRIP, is an investment strategy that automatically uses dividend payments to purchase additional shares of the same stock or fund. Instead of receiving cash dividends in your brokerage account, the dividends are immediately reinvested to buy more shares, including fractional shares if the dividend amount doesn't cover a full share.</p>

        <p className="mt-4">DRIPs can be offered directly by companies (company-sponsored DRIPs) or through brokerage firms (synthetic DRIPs). Company-sponsored plans often include perks like discounted share purchases (typically 1-5% below market price) and no commission fees, making them particularly attractive for long-term investors.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Key Features of DRIP Programs</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Automatic Reinvestment:</strong> Dividends purchase additional shares without manual intervention.</li>
          <li><strong>Fractional Shares:</strong> Even small dividends can be reinvested, buying partial shares.</li>
          <li><strong>No Commission Fees:</strong> Most DRIPs operate commission-free.</li>
          <li><strong>Dollar-Cost Averaging:</strong> Regular reinvestment smooths out price volatility over time.</li>
          <li><strong>Compound Growth:</strong> New shares generate their own dividends, accelerating growth.</li>
        </ul>
        <hr />

        <h2 id="power-of-compounding" className="text-2xl font-bold text-foreground pt-8">The Power of Dividend Compounding</h2>
        <p>Albert Einstein allegedly called compound interest "the eighth wonder of the world," and DRIP investing harnesses this power directly. When you reinvest dividends, those new shares themselves earn dividends, which are then reinvested to buy even more shares. This creates an exponential growth pattern that becomes increasingly powerful over extended time periods.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">A Real-World Example</h3>
        <p>Consider an investor who purchases $10,000 worth of a stock with a 3% dividend yield and 7% annual price appreciation. Without reinvestment, the dividends would provide $300 annually in cash. However, with DRIP enabled:</p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li><strong>After 10 years:</strong> The portfolio would be worth approximately $26,500 vs. $19,700 without DRIP.</li>
          <li><strong>After 20 years:</strong> The difference compounds dramatically to $70,000+ vs. $38,700.</li>
          <li><strong>After 30 years:</strong> A DRIP portfolio could exceed $180,000 compared to $76,100 without reinvestment.</li>
        </ul>
        <p className="mt-4">The magic lies in the acceleration effect: as your share count grows through reinvestment, so does your dividend income, creating a virtuous cycle of wealth accumulation.</p>
        <hr />

        <h2 id="how-drip-works" className="text-2xl font-bold text-foreground pt-8">How DRIP Works in Practice</h2>
        <p>Understanding the mechanics of DRIP helps investors appreciate how their wealth compounds. Here's a step-by-step walkthrough of the reinvestment process:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The DRIP Cycle</h3>
        <ol className="list-decimal ml-6 space-y-2">
          <li><strong>Dividend Declaration:</strong> The company announces a dividend (e.g., $0.50 per share, payable on December 15th).</li>
          <li><strong>Record Date:</strong> You must own shares before the ex-dividend date to receive the dividend.</li>
          <li><strong>Dividend Payment:</strong> On the payment date, your brokerage calculates how many shares your dividend can purchase.</li>
          <li><strong>Share Purchase:</strong> New shares (including fractional shares) are added to your account at the current market price.</li>
          <li><strong>Cycle Repeats:</strong> The next dividend is calculated on your increased share count, generating more income to reinvest.</li>
        </ol>
        <hr />

        <h2 id="drip-vs-cash" className="text-2xl font-bold text-foreground pt-8">DRIP vs. Taking Cash Dividends</h2>
        <p>Choosing between DRIP and taking cash dividends depends on your financial goals, time horizon, and income needs.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">When DRIP Makes Sense</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Long Investment Horizon:</strong> The longer your time frame, the more compounding benefits accumulate.</li>
          <li><strong>No Immediate Income Need:</strong> If you don't need the dividend income for living expenses.</li>
          <li><strong>Building Wealth:</strong> DRIP accelerates portfolio growth compared to taking cash.</li>
          <li><strong>Tax-Advantaged Accounts:</strong> In IRAs or 401(k)s, there's no immediate tax hit on reinvested dividends.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">When Taking Cash Makes Sense</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Retirement Income:</strong> If you're living off dividend income in retirement.</li>
          <li><strong>Portfolio Rebalancing:</strong> Using dividends to invest in underweighted positions.</li>
          <li><strong>High Valuations:</strong> When a stock seems overpriced, taking cash avoids buying more at elevated prices.</li>
        </ul>
        <hr />

        <h2 id="tax-implications" className="text-2xl font-bold text-foreground pt-8">Tax Implications of DRIP</h2>
        <p>One common misconception is that reinvested dividends aren't taxable since you didn't receive cash. This is incorrect—for taxable brokerage accounts, reinvested dividends are taxed in the year they are paid, just like cash dividends.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Key Tax Considerations</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Qualified Dividends:</strong> Taxed at favorable long-term capital gains rates (0%, 15%, or 20%).</li>
          <li><strong>Non-Qualified Dividends:</strong> Taxed as ordinary income at your marginal tax rate.</li>
          <li><strong>Cost Basis Tracking:</strong> Each DRIP purchase creates a new tax lot with its own cost basis.</li>
          <li><strong>Tax-Advantaged Accounts:</strong> DRIPs in IRAs or 401(k)s avoid immediate tax consequences.</li>
        </ul>
        <hr />

        <h2 id="best-stocks" className="text-2xl font-bold text-foreground pt-8">Best Stocks for DRIP Investing</h2>
        <p>Not all dividend-paying stocks are equally suited for DRIP strategies. The ideal DRIP candidate combines reliable dividend payments with sustainable growth potential.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Characteristics of Ideal DRIP Stocks</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Dividend Aristocrats:</strong> Companies that have raised dividends for 25+ consecutive years.</li>
          <li><strong>Sustainable Payout Ratios:</strong> Typically 30-60% for most sectors.</li>
          <li><strong>Dividend Growth History:</strong> Annual dividend increases that outpace inflation.</li>
          <li><strong>Strong Balance Sheets:</strong> Low debt levels and healthy cash flows.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Sectors Known for Reliable Dividends</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Consumer Staples:</strong> Essential products with steady demand.</li>
          <li><strong>Utilities:</strong> Regulated businesses with predictable cash flows.</li>
          <li><strong>Healthcare:</strong> Demographics-driven demand and essential services.</li>
          <li><strong>REITs:</strong> Required to distribute 90% of taxable income as dividends.</li>
        </ul>
        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Dividend reinvestment plans represent one of the most accessible and powerful wealth-building tools available to individual investors. By automatically converting dividend payments into additional shares, DRIP investors harness the exponential power of compounding without requiring market timing skills or active trading.</p>
        <p className="mt-4">The key to DRIP success lies in patience, consistency, and selecting quality dividend-paying investments with sustainable payout policies and growth potential.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about dividend reinvestment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">What is a DRIP and how does it work?</h4>
            <p className="text-muted-foreground">
              A Dividend Reinvestment Plan (DRIP) automatically uses your dividend payments to purchase additional shares of the same stock or fund instead of paying you cash. When a company pays a dividend, your brokerage calculates how many shares (including fractional shares) your dividend can buy at the current market price and adds them to your account. This process repeats with each dividend payment, and because your share count keeps growing, each subsequent dividend is larger—creating compound growth that accelerates over time.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Are reinvested dividends taxable?</h4>
            <p className="text-muted-foreground">
              Yes, in taxable brokerage accounts, reinvested dividends are taxable in the year they are paid, even though you didn't receive cash. The IRS treats the reinvestment as if you received the cash and then immediately used it to buy more shares. Qualified dividends are taxed at favorable capital gains rates (0%, 15%, or 20%), while non-qualified dividends are taxed as ordinary income. To avoid this annual tax drag, many investors run DRIP strategies in tax-advantaged accounts like IRAs or 401(k)s.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Is DRIP better than taking cash dividends?</h4>
            <p className="text-muted-foreground">
              DRIP is generally better for long-term wealth building if you don't need the income for living expenses. The compound growth effect significantly outperforms taking cash over extended periods. However, taking cash makes sense if you need dividend income to cover expenses (especially in retirement), want to rebalance your portfolio, believe a stock is overvalued, or need flexibility for tax-loss harvesting strategies.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">Can dividends be cut or eliminated?</h4>
            <p className="text-muted-foreground">
              Yes, dividends are never guaranteed. Companies can reduce or eliminate dividends during financial difficulties or economic downturns. This is why DRIP investors should focus on companies with strong dividend histories (like Dividend Aristocrats), sustainable payout ratios (typically 30-60% of earnings), healthy balance sheets with low debt, and strong competitive moats protecting their business.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">How does dividend frequency affect compounding?</h4>
            <p className="text-muted-foreground">
              More frequent dividend payments lead to slightly faster compounding because you reinvest sooner and those new shares start earning dividends earlier. Monthly dividend payers (common among REITs) compound 12 times per year versus 4 times for quarterly payers. However, the difference is relatively modest, and total yield and dividend growth rate are more important factors than payment frequency.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-3">What risks should DRIP investors consider?</h4>
            <p className="text-muted-foreground">
              Key risks include: concentration risk—DRIP increases your position in the same stock; valuation risk—automatic reinvestment buys shares regardless of price; dividend cuts can significantly impact projections; opportunity cost of locked reinvestment; and tax complexity with multiple cost basis lots. Diversification across multiple quality dividend stocks can mitigate these risks.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Dividend Reinvestment (DRIP) Calculator simulates how automatically reinvesting dividends compounds your investment returns over time.</p>
          <p>By modeling share accumulation, price growth, and reinvested dividends, it demonstrates the exponential wealth-building power of compound growth.</p>
          <p>Use this tool to project long-term portfolio values, compare different yield and growth scenarios, and understand why patience and consistency are keys to DRIP investing success.</p>
        </CardContent>
      </Card>
    </div>
  );
}


