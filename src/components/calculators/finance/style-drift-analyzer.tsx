'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info } from 'lucide-react';

const formSchema = z.object({
  sizeP: z.number().min(-3).max(3).optional(),
  valueP: z.number().min(-3).max(3).optional(),
  momentumP: z.number().min(-3).max(3).optional(),
  qualityP: z.number().min(-3).max(3).optional(),
  lowVolP: z.number().min(-3).max(3).optional(),
  sizeB: z.number().min(-3).max(3).optional(),
  valueB: z.number().min(-3).max(3).optional(),
  momentumB: z.number().min(-3).max(3).optional(),
  qualityB: z.number().min(-3).max(3).optional(),
  lowVolB: z.number().min(-3).max(3).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function StyleDriftAnalyzer() {
  const [result, setResult] = useState<{ diffs: { name: string; diff: number }[]; driftScore: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sizeP: 0.2,
      valueP: 0.1,
      momentumP: 0,
      qualityP: 0.1,
      lowVolP: 0,
      sizeB: 0,
      valueB: 0,
      momentumB: 0,
      qualityB: 0,
      lowVolB: 0,
    }
  });

  const num = (name: keyof FormValues, label: string) => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
              onChange={e => {
                const v = e.target.value;
                const n = v === '' ? undefined : Number(v);
                field.onChange(Number.isFinite(n as any) ? n : undefined);
              }}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
            />
            <span className="text-sm text-muted-foreground">exposure</span>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const onSubmit = (v: FormValues) => {
    if (
      v.sizeP == null || v.valueP == null || v.momentumP == null || v.qualityP == null || v.lowVolP == null ||
      v.sizeB == null || v.valueB == null || v.momentumB == null || v.qualityB == null || v.lowVolB == null
    ) {
      setResult(null);
      return;
    }
    const names = ['Size (SMB)', 'Value (HML)', 'Momentum (MOM)', 'Quality (QMJ)', 'Low Volatility (LVOL)'];
    const p = [v.sizeP, v.valueP, v.momentumP, v.qualityP, v.lowVolP];
    const b = [v.sizeB, v.valueB, v.momentumB, v.qualityB, v.lowVolB];
    const diffs = p.map((x, i) => ({ name: names[i], diff: x - b[i] }));
    const driftScore = Math.sqrt(diffs.reduce((s, d) => s + d.diff * d.diff, 0));
    const max = diffs.reduce((a, d) => Math.abs(d.diff) > Math.abs(a.diff) ? d : a, diffs[0]);
    const interpretation = `Overall drift score ${driftScore.toFixed(2)}. Largest shift in ${max.name} (${max.diff.toFixed(2)}). Consider rebalancing if drift exceeds policy bands.`;
    setResult({ diffs, driftScore, interpretation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Style Drift Analyzer</CardTitle>
          <CardDescription>Compare portfolio factor exposures to benchmark and quantify drift.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Portfolio Exposures</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {num('sizeP', 'Size (SMB)')}
                  {num('valueP', 'Value (HML)')}
                  {num('momentumP', 'Momentum (MOM)')}
                  {num('qualityP', 'Quality (QMJ)')}
                  {num('lowVolP', 'Low Volatility (LVOL)')}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Benchmark Exposures</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {num('sizeB', 'Size (SMB)')}
                  {num('valueB', 'Value (HML)')}
                  {num('momentumB', 'Momentum (MOM)')}
                  {num('qualityB', 'Quality (QMJ)')}
                  {num('lowVolB', 'Low Volatility (LVOL)')}
                </div>
              </div>
              <div className="md:col-span-2"><Button type="submit">Analyze</Button></div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Results & Interpretation</CardTitle>
            <CardDescription>Exposure differences and drift score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.diffs.map(d => (
                <div key={d.name} className="flex justify-between border rounded px-3 py-2 text-sm">
                  <span>{d.name}</span>
                  <span className={Math.abs(d.diff) > 0.3 ? 'text-destructive' : 'text-foreground'}>{d.diff.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <p><strong>Drift Score (Euclidean):</strong> {result.driftScore.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Style and risk</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/beta-weighted-portfolio-exposure-calculator" className="text-primary hover:underline">Beta‑weighted Portfolio Exposure</a></h4><p className="text-sm text-muted-foreground">Benchmark sensitivity.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio (Max Sharpe)</a></h4><p className="text-sm text-muted-foreground">Sharpe‑maximizing mix.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</a></h4><p className="text-sm text-muted-foreground">Efficient allocations.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/minimum-variance-portfolio-calculator" className="text-primary hover:underline">Minimum Variance Portfolio</a></h4><p className="text-sm text-muted-foreground">Lowest risk allocation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Monitoring style drift and factor exposure management</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Define policy bands for factor exposures. Rebalance or adjust mandates when drift exceeds tolerances.</li>
            <li>Use rolling windows to track persistence and link drift to performance attribution.</li>
            <li>Common factors include size (SMB), value (HML), momentum (MOM), quality (QMJ), and low volatility (LVOL).</li>
            <li>Measure drift quarterly or monthly, aligned with reporting cycles and data refresh schedules.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Style drift, factor exposures, and portfolio monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is style drift?</h4><p className="text-muted-foreground">A shift in portfolio factor exposures away from benchmark or mandate, indicating changes in investment style over time.</p></div>
          <div><h4 className="font-semibold mb-2">Which factors are most common?</h4><p className="text-muted-foreground">Size (SMB), value (HML), momentum (MOM), quality (QMJ), and low volatility (LVOL) are widely used in factor-based analysis.</p></div>
          <div><h4 className="font-semibold mb-2">How do I quantify drift?</h4><p className="text-muted-foreground">Compare exposures and compute a distance metric (e.g., Euclidean distance) between portfolio and benchmark factor loadings.</p></div>
          <div><h4 className="font-semibold mb-2">What thresholds are material?</h4><p className="text-muted-foreground">Depends on policy; ±0.3 exposure often signals noticeable shift. Set thresholds based on risk tolerance and mandate constraints.</p></div>
          <div><h4 className="font-semibold mb-2">How often to measure?</h4><p className="text-muted-foreground">Quarterly or monthly, aligned with reporting cycles and data refresh. More frequent monitoring helps catch drift earlier.</p></div>
          <div><h4 className="font-semibold mb-2">Can drift be intentional?</h4><p className="text-muted-foreground">Yes for tactical tilts; document and monitor risk impacts. Intentional drift should be part of a defined investment strategy.</p></div>
          <div><h4 className="font-semibold mb-2">What data do I need?</h4><p className="text-muted-foreground">Factor exposures from regressions or provider models for both portfolio and benchmark. Use consistent factor models for comparability.</p></div>
          <div><h4 className="font-semibold mb-2">How is drift linked to performance?</h4><p className="text-muted-foreground">Non‑benchmark tilts can drive active returns and risk. Style drift may indicate skill or unintended risk-taking.</p></div>
          <div><h4 className="font-semibold mb-2">Is multi‑factor drift additive?</h4><p className="text-muted-foreground">Approximate via distance, but consider correlations among factors. Factor interactions can amplify or dampen drift effects.</p></div>
          <div><h4 className="font-semibold mb-2">How do I remediate drift?</h4><p className="text-muted-foreground">Rebalance positions, update mandates, or hedge undesired factor bets. Align portfolio with policy targets and risk constraints.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}





