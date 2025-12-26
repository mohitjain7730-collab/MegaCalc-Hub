'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, DollarSign, FunctionSquare, HelpCircle, Shield, Info, Calendar } from 'lucide-react';

const formSchema = z.object({
  beginningValue: z.number().min(0.0001).optional(),
  endingValue: z.number().min(0).optional(),
  income: z.number().min(0).optional(), // dividends, coupons, etc.
});

type FormValues = z.infer<typeof formSchema>;

export default function HoldingPeriodReturnCalculator() {
  const [result, setResult] = useState<{ hprPct: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { beginningValue: undefined, endingValue: undefined, income: 0 as any } });

  const onSubmit = (v: FormValues) => {
    if (v.beginningValue == null || v.endingValue == null || v.income == null) { setResult(null); return; }
    const hpr = ((v.endingValue + v.income - v.beginningValue) / v.beginningValue) * 100;
    setResult({ hprPct: Math.round(hpr * 100) / 100, interpretation: 'Total holding period return including income.' });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Holding Period Return (HPR)</CardTitle><CardDescription>Total return including income</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="beginningValue" render={({ field }) => (
                  <FormItem><FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Beginning Value</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endingValue" render={({ field }) => (
                  <FormItem><FormLabel>Ending Value</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 1120" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="income" render={({ field }) => (
                  <FormItem><FormLabel>Income (dividends)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="e.g., 30" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate HPR</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>Result</CardTitle><CardDescription>Total return</CardDescription></CardHeader>
          <CardContent><div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">HPR</div><p className="text-3xl font-bold text-primary">{result.hprPct}%</p></div><p className="text-sm mt-4">{result.interpretation}</p></CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Compare returns and risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/cagr-calculator" className="text-primary hover:underline">CAGR</a></h4><p className="text-sm text-muted-foreground">Annualized growth.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/real-rate-of-return-calculator" className="text-primary hover:underline">Real Return</a></h4><p className="text-sm text-muted-foreground">Inflation‑adjusted.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/weighted-average-return-calculator" className="text-primary hover:underline">Weighted Return</a></h4><p className="text-sm text-muted-foreground">Portfolio combine.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/capital-gain-loss-calculator" className="text-primary hover:underline">Capital Gain/Loss</a></h4><p className="text-sm text-muted-foreground">Proceeds & taxes.</p></div>
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
              HPR = (Ending Value + Income - Beginning Value) / Beginning Value × 100
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Captures total return including both capital appreciation and income received.
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
          <CardDescription>What each parameter means</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Beginning Value</h4>
              <p className="text-sm text-muted-foreground">Initial investment value when purchased.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Ending Value</h4>
              <p className="text-sm text-muted-foreground">Current or sale value at end of period.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Income</h4>
              <p className="text-sm text-muted-foreground">Dividends, coupons, or distributions received.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Holding Period Return (HPR)</h1>
        <p className="text-lg italic text-muted-foreground">Master the fundamental metric for measuring total investment returns.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is Holding Period Return?</h2>
        <p>HPR measures the total return earned on an investment over the entire time you held it—including both price changes and income received. Unlike CAGR, HPR isn't annualized.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Components of HPR</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Capital Gain:</strong> Ending value minus beginning value.</li>
          <li><strong>Income:</strong> Dividends, interest, or distributions received.</li>
          <li><strong>Total Return:</strong> Sum of both relative to initial investment.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Annualizing HPR</h2>
        <p>To compare investments with different holding periods, convert to CAGR using: CAGR = (1 + HPR)^(1/years) - 1</p>

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>HPR is essential for every investor—it captures the true total return including income, making it fundamental for performance measurement.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about HPR</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Is HPR annualized?</h4>
            <p className="text-muted-foreground">No. HPR is total return over the holding period. Convert to CAGR for annualized comparison.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What income should I include?</h4>
            <p className="text-muted-foreground">Include all cash distributions: dividends, bond coupons, capital returns. If reinvested, they're in your ending value.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Do fees affect HPR?</h4>
            <p className="text-muted-foreground">Yes. Include fees by reducing ending value or adding to beginning cost for accurate measurement.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">How do I compare different holding periods?</h4>
            <p className="text-muted-foreground">Convert each to CAGR. A 50% HPR over 5 years differs from 50% over 2 years—CAGR normalizes this.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does reinvesting income change HPR?</h4>
            <p className="text-muted-foreground">Yes. If reinvested, income becomes part of ending value (compounding). Either way, it's captured in total return.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Is HPR nominal or real?</h4>
            <p className="text-muted-foreground">HPR is typically nominal. For real purchasing power, subtract cumulative inflation over the holding period.</p>
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
          <p>The HPR Calculator computes total return including capital gains and income over your investment period.</p>
          <p>HPR is not annualized—use CAGR for comparing investments with different durations.</p>
          <p>Essential for tracking trade performance and measuring actual investment results.</p>
        </CardContent>
      </Card>
    </div>
  );
}


