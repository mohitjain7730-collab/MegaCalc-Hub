'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Calculator, Info } from 'lucide-react';

const formSchema = z.object({
  r1: z.number().min(-100).max(100).optional(),
  r2: z.number().min(-100).max(100).optional(),
  s1: z.number().min(0).max(500).optional(),
  s2: z.number().min(0).max(500).optional(),
  rho: z.number().min(-1).max(1).optional(),
  steps: z.number().min(5).max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Point = { w1: number; w2: number; ret: number; std: number };

export default function EfficientFrontierVisualizer() {
  const [points, setPoints] = useState<Point[] | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      r1: undefined as unknown as number,
      r2: undefined as unknown as number,
      s1: undefined as unknown as number,
      s2: undefined as unknown as number,
      rho: undefined as unknown as number,
      steps: undefined as unknown as number,
    },
  });

  const generate = (v: FormValues) => {
    if (
      v.r1 === undefined || v.r2 === undefined ||
      v.s1 === undefined || v.s2 === undefined ||
      v.rho === undefined || v.steps === undefined
    ) {
      setPoints(null);
      return;
    }
    const s1 = v.s1 / 100;
    const s2 = v.s2 / 100;
    const cov = v.rho * s1 * s2;
    const pts: Point[] = [];
    const n = v.steps;
    for (let i = 0; i < n; i++) {
      const w1 = i / (n - 1);
      const w2 = 1 - w1;
      const ret = w1 * v.r1 + w2 * v.r2;
      const variance = (w1*w1*s1*s1) + (w2*w2*s2*s2) + (2*w1*w2*cov);
      const std = Math.sqrt(variance) * 100;
      pts.push({ w1, w2, ret, std });
    }
    setPoints(pts);
  };

  const bestPoints = useMemo(() => {
    if (!points) return [] as Point[];
    return [...points].sort((a, b) => a.std - b.std).slice(0, 5);
  }, [points]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Efficient Frontier Visualizer (Two Assets)
          </CardTitle>
          <CardDescription>Generate frontier points across weight combinations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(generate)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="r1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 1 Expected Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 9" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="r2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 2 Expected Return (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 6" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="steps" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Points</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 51" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number.parseInt(v, 10);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="s1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 1 Standard Deviation (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 18" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="s2" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset 2 Standard Deviation (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 12" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="rho" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correlation (ρ)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 0.2" {...field}
                        value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
                        onChange={e => {
                          const v = e.target.value;
                          const num = v === '' ? undefined : Number(v);
                          field.onChange(Number.isFinite(num as any) ? num : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Generate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {points && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Frontier Points (Sample)
            </CardTitle>
            <CardDescription>Best (lowest-risk) sample points and full list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Lowest-risk 5 points</h4>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {bestPoints.map((p, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">w1 / w2</p>
                    <p className="font-semibold">{(p.w1*100).toFixed(0)}% / {(p.w2*100).toFixed(0)}%</p>
                    <p className="text-sm text-muted-foreground">Return</p>
                    <p className="font-semibold">{p.ret.toFixed(2)}%</p>
                    <p className="text-sm text-muted-foreground">Std</p>
                    <p className="font-semibold">{p.std.toFixed(2)}%</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">All generated points</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="p-2">Weight 1</th>
                      <th className="p-2">Weight 2</th>
                      <th className="p-2">Return (%)</th>
                      <th className="p-2">Std (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {points.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{(p.w1*100).toFixed(1)}%</td>
                        <td className="p-2">{(p.w2*100).toFixed(1)}%</td>
                        <td className="p-2">{p.ret.toFixed(2)}</td>
                        <td className="p-2">{p.std.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          <CardDescription>Explore risk-return analysis tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/standard-deviation-calculator" className="text-primary hover:underline">Standard Deviation Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Understand asset volatility.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/portfolio-variance-calculator" className="text-primary hover:underline">Portfolio Variance Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Estimate combined risk across holdings.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/return-on-investment-calculator" className="text-primary hover:underline">ROI Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Quantify returns for specific investments.</p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <h4 className="font-semibold mb-2"><a href="/category/finance/npv-calculator" className="text-primary hover:underline">NPV Calculator</a></h4>
              <p className="text-sm text-muted-foreground">Relate expected return to valuation.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guide Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Efficient Frontiers
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Placeholder: Add your complete guide content on efficient frontiers here.</p>
          <p>Include methodology, assumptions, and interpretation tips.</p>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>Efficient frontier and diversification FAQs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">What is the efficient frontier?</h4>
            <p className="text-muted-foreground">It’s the set of portfolios that offer the highest expected return for a given level of risk.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Why visualize the frontier?</h4>
            <p className="text-muted-foreground">Visualization helps compare trade-offs between risk and return across weight combinations.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Does lower correlation improve the frontier?</h4>
            <p className="text-muted-foreground">Yes. Lower or negative correlation bends the frontier leftward (lower risk for similar return).</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Can I include more than two assets?</h4>
            <p className="text-muted-foreground">This tool shows a two-asset case. Multi-asset frontiers require numerical optimization.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">What inputs are most critical?</h4>
            <p className="text-muted-foreground">Volatility, correlation, and expected return estimates drive the frontier shape.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">How often should I refresh inputs?</h4>
            <p className="text-muted-foreground">Quarterly or when market regimes shift. Use prudent long-term estimates.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Do higher returns always mean higher risk?</h4>
            <p className="text-muted-foreground">Not always. Diversification can increase return without proportionally increasing risk.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Is the frontier predictive?</h4>
            <p className="text-muted-foreground">It’s model-based. Realized outcomes vary; use as a planning and comparison tool.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


