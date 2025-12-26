'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, Plus, Trash2, FunctionSquare, HelpCircle, Shield, Info, DollarSign } from 'lucide-react';

const itemSchema = z.object({ weightPct: z.number().min(0).max(100).optional(), returnPct: z.number().min(-100).max(1000).optional() });
const formSchema = z.object({ items: z.array(itemSchema).min(1) });
type FormValues = z.infer<typeof formSchema>;

export default function WeightedAverageReturnCalculator() {
  const [result, setResult] = useState<{ weightedReturn: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { items: [{ weightPct: undefined as any, returnPct: undefined as any }] as any } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const onSubmit = (v: FormValues) => {
    const valid = v.items.filter(it => it.weightPct != null && it.returnPct != null);
    const totalW = valid.reduce((s, it) => s + (it.weightPct as number), 0);
    const wr = valid.reduce((s, it) => s + ((it.weightPct as number) / 100) * (it.returnPct as number), 0);
    const interp = Math.abs(totalW - 100) < 0.01 ? 'Portfolio weights sum to 100%.' : `Weights sum to ${totalW}%; results scaled by provided weights.`;
    setResult({ weightedReturn: Math.round(wr * 100) / 100, interpretation: interp });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader><CardTitle>Weighted Average Return</CardTitle><CardDescription>Combine returns by portfolio weights</CardDescription></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <FormField control={form.control} name={`items.${i}.weightPct` as const} render={({ field }) => (
                    <FormItem><FormLabel>Weight (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value as any} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`items.${i}.returnPct` as const} render={({ field }) => (
                    <FormItem><FormLabel className="flex items-center gap-2"><Percent className="h-4 w-4" /> Return (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value as any} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button type="button" variant="destructive" onClick={() => remove(i)} className="md:w-auto"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <Button type="button" onClick={() => append({ weightPct: undefined as any, returnPct: undefined as any })}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
                <Button type="submit" className="md:w-auto">Calculate Weighted Return</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>Result</CardTitle><CardDescription>Portfolio weighted return</CardDescription></CardHeader>
          <CardContent><div className="text-center p-6 bg-primary/5 rounded-lg"><div className="text-sm text-muted-foreground mb-1">Weighted Return</div><p className="text-3xl font-bold text-primary">{result.weightedReturn}%</p></div><p className="text-sm mt-4">{result.interpretation}</p></CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle>Related Calculators</CardTitle><CardDescription>Portfolio analytics</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/cagr-calculator" className="text-primary hover:underline">CAGR</a></h4><p className="text-sm text-muted-foreground">Annualized growth.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/holding-period-return-hpr-calculator" className="text-primary hover:underline">HPR</a></h4><p className="text-sm text-muted-foreground">Total return.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance</a></h4><p className="text-sm text-muted-foreground">Risk metric.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI</a></h4><p className="text-sm text-muted-foreground">Simple return.</p></div>
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
              Weighted Return = Σ (Weight_i × Return_i)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Each component's return is multiplied by its portfolio weight, then summed to get the total portfolio return.
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Percent className="h-4 w-4" /> Weight (%)</h4>
              <p className="text-sm text-muted-foreground">Percentage of portfolio allocated to this component. Should sum to 100%.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Percent className="h-4 w-4" /> Return (%)</h4>
              <p className="text-sm text-muted-foreground">The return achieved by this component (can be positive or negative).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Weighted Average Return</h1>
        <p className="text-lg italic text-muted-foreground">Learn how to calculate portfolio-level returns from individual component performance.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is Weighted Average Return?</h2>
        <p>Weighted average return combines individual asset returns based on their portfolio weights. It tells you how your portfolio performed overall by accounting for how much of your capital was allocated to each holding.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Weights Matter</h2>
        <p>A stock that returns 50% but represents only 5% of your portfolio has less impact than one returning 10% that represents 50% of your holdings. Weighting captures this reality.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Equal-Weight vs. Cap-Weight</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Equal-Weight:</strong> Each component has the same weight (e.g., 10% each in a 10-stock portfolio).</li>
          <li><strong>Cap-Weight:</strong> Weights based on market capitalization or portfolio allocation percentages.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Weighted average return is essential for understanding portfolio performance. It properly accounts for your actual allocation decisions.</p>
      </section>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Detailed answers about weighted returns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-3">Should weights sum to 100%?</h4>
            <p className="text-muted-foreground">Ideally yes for a complete portfolio. If not, the result reflects the provided scaling—useful for analyzing a subset of holdings.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does this include risk or covariance?</h4>
            <p className="text-muted-foreground">No. This is purely a return aggregator. Use portfolio variance or Sharpe ratio tools for risk analysis.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Can a weight be negative?</h4>
            <p className="text-muted-foreground">Short positions can be modeled with negative weights, but this calculator expects non-negative inputs. Add shorts as separate considerations.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What about fees?</h4>
            <p className="text-muted-foreground">Input net returns after fees for each component to get an accurate after-fee portfolio return.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">What if weights change over time?</h4>
            <p className="text-muted-foreground">This tool assumes a static snapshot. For time-varying weights, compute period by period and chain results together.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3">Does order of components matter?</h4>
            <p className="text-muted-foreground">No. Only the weight-return pairs matter—the sum is commutative regardless of entry order.</p>
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
          <p>The Weighted Average Return Calculator combines individual asset returns by their portfolio weights to get overall portfolio performance.</p>
          <p>Ensure weights sum to 100% for complete portfolio analysis.</p>
          <p>Input net-of-fee returns for accurate after-cost performance measurement.</p>
        </CardContent>
      </Card>
    </div>
  );
}


