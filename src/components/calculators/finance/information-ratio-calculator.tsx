'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, LineChart } from 'lucide-react';

const formSchema = z.object({
  portfolioReturn: z.number().min(-100).max(100).optional(),
  benchmarkReturn: z.number().min(-100).max(100).optional(),
  trackingError: z.number().min(0).max(500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InformationRatioCalculator() {
  const [result, setResult] = useState<{ activeReturn: number; informationRatio: number; interpretation: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioReturn: undefined as unknown as number,
      benchmarkReturn: undefined as unknown as number,
      trackingError: undefined as unknown as number,
    },
  });

  const onSubmit = (v: FormValues) => {
    if (v.portfolioReturn === undefined || v.benchmarkReturn === undefined || v.trackingError === undefined || v.trackingError === 0) {
      setResult(null);
      return;
    }
    const active = v.portfolioReturn - v.benchmarkReturn;
    const ir = active / v.trackingError;
    const interpretation = ir > 0.5 ? 'Strong risk-adjusted outperformance versus the benchmark.' : ir > 0 ? 'Modest positive risk-adjusted performance.' : ir === 0 ? 'Neutral versus benchmark on a risk-adjusted basis.' : 'Underperformance after adjusting for risk.';
    setResult({ activeReturn: active, informationRatio: ir, interpretation, suggestions: ['Stabilize active returns with consistent strategy execution.', 'Lower tracking error by aligning factor exposures with the benchmark.', 'Evaluate fees and turnover; high costs can reduce IR.', 'Compare IR across rolling windows for persistence.'] });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Risk-Adjusted Return (Information Ratio) Calculator
          </CardTitle>
          <CardDescription>Compute information ratio from active return and tracking error.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="portfolioReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 12" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => { const v = e.target.value; const num = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(num as any) ? num : undefined); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="benchmarkReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benchmark Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 8" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => { const v = e.target.value; const num = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(num as any) ? num : undefined); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="trackingError" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Error (Std Dev of Active) (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 3" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => { const v = e.target.value; const num = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(num as any) ? num : undefined); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Results & Insights
            </CardTitle>
            <CardDescription>Active performance versus risk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Active Return</p>
                <p className="text-2xl font-bold">{result.activeReturn.toFixed(2)}%</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Information Ratio</p>
                <p className="text-2xl font-bold">{result.informationRatio.toFixed(3)}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground">Interpretation</p>
                <p className="font-medium">{result.interpretation}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Suggestions</h4>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                {result.suggestions.map((s, i) => (<li key={i}>{s}</li>))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Performance and risk tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio Calculator</a></h4><p className="text-sm text-muted-foreground">Risk-adjusted return using total volatility.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/treynor-ratio-calculator" className="text-primary hover:underline">Treynor Ratio Calculator</a></h4><p className="text-sm text-muted-foreground">Risk-adjusted return using beta.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance Calculator</a></h4><p className="text-sm text-muted-foreground">Estimate total risk.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/capm-calculator" className="text-primary hover:underline">CAPM Calculator</a></h4><p className="text-sm text-muted-foreground">Expected return from beta and market risk premium.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Information Ratio
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Placeholder for your detailed guide content.</p>
          <p>Add methodology, use cases, and caveats.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Information ratio basics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the information ratio?</h4><p className="text-muted-foreground">It measures active return per unit of active risk (tracking error) versus a benchmark.</p></div>
          <div><h4 className="font-semibold mb-2">Is higher always better?</h4><p className="text-muted-foreground">Generally yes, but consider persistence, costs, and benchmark appropriateness.</p></div>
          <div><h4 className="font-semibold mb-2">How does it differ from Sharpe?</h4><p className="text-muted-foreground">Sharpe uses total volatility; IR uses benchmark-relative volatility.</p></div>
          <div><h4 className="font-semibold mb-2">What’s a good threshold?</h4><p className="text-muted-foreground">IR above 0.5 is often considered strong; above 1.0 is excellent, depending on context.</p></div>
          <div><h4 className="font-semibold mb-2">Annualized inputs?</h4><p className="text-muted-foreground">Use consistent periodicity. Annualize both active return and tracking error if using annual data.</p></div>
          <div><h4 className="font-semibold mb-2">Can IR be negative?</h4><p className="text-muted-foreground">Yes—negative values indicate risk-adjusted underperformance versus the benchmark.</p></div>
          <div><h4 className="font-semibold mb-2">What affects tracking error?</h4><p className="text-muted-foreground">Factor tilts, concentration, and timing differences typically increase tracking error.</p></div>
          <div><h4 className="font-semibold mb-2">Should I compare IR across managers?</h4><p className="text-muted-foreground">Yes, but ensure similar benchmarks, periods, and investment universes.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


