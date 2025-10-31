'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Calculator, Info, Grid } from 'lucide-react';

const formSchema = z.object({
  name1: z.string().min(1).default('Asset A'),
  name2: z.string().min(1).default('Asset B'),
  name3: z.string().min(1).default('Asset C'),
  series1: z.string().min(1),
  series2: z.string().min(1),
  series3: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

function parseSeries(s: string): number[] {
  // Extract numeric tokens robustly (supports negatives, decimals, scientific, ignores % and text)
  const matches = s.match(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g) || [];
  return matches
    .map(tok => Number(tok))
    .filter(n => Number.isFinite(n));
}

function corr(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  // Require at least 3 paired observations; with only 2 points, correlation is always ±1 and misleading
  if (n < 3) return NaN;
  const ax = a.slice(0, n);
  const bx = b.slice(0, n);
  const ma = ax.reduce((s, v) => s + v, 0) / n;
  const mb = bx.reduce((s, v) => s + v, 0) / n;
  let cov = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    const da = ax[i] - ma;
    const db = bx[i] - mb;
    cov += da * db;
    va += da * da;
    vb += db * db;
  }
  if (va === 0 || vb === 0) return NaN;
  return cov / Math.sqrt(va * vb);
}

export default function AssetCorrelationMatrixCalculator() {
  const [matrix, setMatrix] = useState<number[][] | null>(null);
  const [labels, setLabels] = useState<string[]>(['Asset A', 'Asset B', 'Asset C']);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name1: 'Asset A',
      name2: 'Asset B',
      name3: 'Asset C',
      series1: '',
      series2: '',
      series3: '',
    },
  });

  const onSubmit = (v: FormValues) => {
    const s1 = parseSeries(v.series1);
    const s2 = parseSeries(v.series2);
    const s3 = parseSeries(v.series3);
    const m = [
      [1, corr(s1, s2), corr(s1, s3)],
      [corr(s2, s1), 1, corr(s2, s3)],
      [corr(s3, s1), corr(s3, s2), 1],
    ];
    setMatrix(m);
    setLabels([v.name1, v.name2, v.name3]);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            Asset Correlation Matrix Calculator
          </CardTitle>
          <CardDescription>Paste return series and compute a 3×3 correlation matrix.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="name1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 1 Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Asset A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="name2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 2 Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Asset B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="name3" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 3 Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Asset C" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="series1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 1 Returns (comma/space separated)</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="e.g., 1.2 0.5 -0.3 0.8" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="series2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 2 Returns</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="e.g., 0.9 0.1 -0.2 0.4" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="series3" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 3 Returns</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="e.g., 1.1 0.2 -0.1 0.6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Compute Matrix</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {matrix && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Correlation Matrix
            </CardTitle>
            <CardDescription>Symmetric Pearson correlation matrix</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Asset</th>
                    {labels.map((l, i) => (<th className="p-2" key={i}>{l}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, i) => (
                    <tr className="border-t" key={i}>
                      <td className="p-2 font-semibold">{labels[i]}</td>
                      {row.map((v, j) => (
                        <td className="p-2" key={j}>{Number.isFinite(v) ? v.toFixed(3) : 'N/A'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Interpretation</h4>
              <p className="text-muted-foreground">Values range from -1 (perfect inverse) to +1 (perfect positive). Lower correlations typically increase diversification benefits.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Correlation and risk tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Translate correlation into total risk.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/standard-deviation-calculator" className="text-primary hover:underline">Standard Deviation Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Assess individual risk inputs.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Relate risk to performance outcomes.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/inflation-calculator" className="text-primary hover:underline">Inflation Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Contextualize returns in real terms.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Correlation Matrices
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Placeholder: Add your in-depth guide covering Pearson correlation and use cases.</p>
          <p>Include pitfalls, sample size effects, and rolling correlation analysis.</p>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Correlation interpretation and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">What does a correlation of 0 mean?</h4>
            <p className="text-muted-foreground">No linear relationship. Returns may still be related nonlinearly.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How many observations do I need?</h4>
            <p className="text-muted-foreground">More data improves reliability. Monthly data over 3–5 years is a common starting point.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Are correlations stable?</h4>
            <p className="text-muted-foreground">They are time-varying and can rise in crises. Use rolling analysis when possible.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What if a series is constant?</h4>
            <p className="text-muted-foreground">Variance is zero; correlation is undefined (N/A). Use different assets or time windows.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Should I use returns or prices?</h4>
            <p className="text-muted-foreground">Use percentage returns (e.g., monthly) rather than prices to compute correlation.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Does correlation capture tail risk?</h4>
            <p className="text-muted-foreground">No. Consider additional metrics like copulas or tail dependence for extreme events.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Is negative correlation always better?</h4>
            <p className="text-muted-foreground">Not always. Balance return potential, liquidity, costs, and risk characteristics.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Can I use daily data?</h4>
            <p className="text-muted-foreground">Yes, but microstructure noise may distort relationships; align frequency with horizon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


