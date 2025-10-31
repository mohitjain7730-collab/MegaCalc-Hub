'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calculator, DollarSign, Calendar, BarChart2, Info, Repeat } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  initialInvestment: z.number().min(0).optional(),
  monthlyContribution: z.number().min(0).optional(),
  annualDividendYield: z.number().min(0).max(50).optional(), // %
  dividendFrequency: z.enum(['monthly','quarterly','semiannual','annual']).optional(),
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
              <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Initial Investment</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 5000" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="monthlyContribution" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><Calculator className="h-4 w-4" /> Monthly Contribution</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 200" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="currentSharePrice" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Current Share Price</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="annualDividendYield" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Annual Dividend Yield (%)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dividendFrequency" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Dividend Frequency</FormLabel><FormControl><select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={e=>field.onChange(e.target.value as any)}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="semiannual">Semiannual</option><option value="annual">Annual</option></select></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="sharePriceGrowth" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Share Price Growth (% p.a.)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="years" render={({ field }) => (
              <FormItem><FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Years</FormLabel><FormControl><Input type="number" step="1" placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
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
                <div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Final Portfolio Value</div><p className="text-3xl font-bold text-primary">${result.finalValue.toLocaleString(undefined,{maximumFractionDigits:0})}</p></div>
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
                        {result.yearByYear.slice(0,11).map((r) => (
                          <tr key={r.year} className="border-b"><td className="p-2">{r.year}</td><td className="text-right p-2">${r.value.toLocaleString(undefined,{maximumFractionDigits:0})}</td><td className="text-right p-2">{r.shares.toFixed(2)}</td><td className="text-right p-2">${r.dividends.toLocaleString(undefined,{maximumFractionDigits:0})}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle>Recommendations</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent></Card>
                <Card><CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader><CardContent><ul className="space-y-2">{result.warnings.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent></Card>
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
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">Compound Interest</Link></h4><p className="text-sm text-muted-foreground">Understand growth over time.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Rate of Return</Link></h4><p className="text-sm text-muted-foreground">Account for inflation.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value</Link></h4><p className="text-sm text-muted-foreground">Discount future cash flows.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/finance/dividend-yield-calculator" className="text-primary hover:underline">Dividend Yield</Link></h4><p className="text-sm text-muted-foreground">Income rate per price.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Guide */}
      <Card>
        <CardHeader><CardTitle>Complete Guide: Dividend Reinvestment</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      {/* FAQs */}
      <Card>
        <CardHeader><CardTitle>Frequently Asked Questions</CardTitle><CardDescription>Detailed, SEO‑oriented answers</CardDescription></CardHeader>
        <CardContent className="space-y-4">{[
          ['What is a DRIP?', 'A dividend reinvestment plan automatically reinvests cash dividends into additional shares, compounding returns over time.'],
          ['Are dividends guaranteed?', 'No. Companies can change or suspend dividends; this tool assumes the input yield persists for modeling.'],
          ['How are taxes handled?', 'This estimate excludes taxes and fees. Actual results depend on your tax situation and account type.'],
          ['Which frequency should I pick?', 'Choose how often the company pays dividends; many are quarterly. The frequency affects compounding cadence.'],
          ['Does share price growth matter?', 'Yes, price appreciation changes how many shares reinvested dividends buy and the portfolio value trajectory.'],
          ['Is DRIP always best?', 'If you need income, you may take cash instead. For growth, reinvestment often compounds faster.'],
          ['What risks exist?', 'Concentration risk, dividend cuts, and valuation risk. Diversification can mitigate these.'],
        ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}


