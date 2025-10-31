'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Activity } from 'lucide-react';

const formSchema = z.object({
  assetDuration: z.number().min(0).optional(),
  liabilityDuration: z.number().min(0).optional(),
  assets: z.number().min(0).optional(),
  liabilities: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DurationGapCalculator() {
  const [result, setResult] = useState<{ durationGap: number; leverageRatio: number; interestRateRisk: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { assetDuration: undefined as unknown as number, liabilityDuration: undefined as unknown as number, assets: undefined as unknown as number, liabilities: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.assetDuration === undefined || v.liabilityDuration === undefined || v.assets === undefined || v.liabilities === undefined || v.assets === 0) { setResult(null); return; }
    const durGap = v.assetDuration - (v.liabilityDuration * (v.liabilities / v.assets));
    const lev = v.assets > 0 ? v.liabilities / v.assets : NaN;
    const risk = Math.abs(durGap) < 1e-6 ? 'Immunized: limited net interest rate exposure.' : durGap > 0 ? 'Asset-sensitive: net value falls when rates rise.' : 'Liability-sensitive: net value falls when rates fall.';
    setResult({ durationGap: durGap, leverageRatio: lev, interestRateRisk: risk, suggestions: ['Align asset and liability durations to reduce exposure.', 'Monitor leverage; higher liabilities amplify duration gap impact.', 'Use derivatives (swaps) to fine-tune duration.', 'Re-estimate durations periodically as cash flows change.'] });
  };

  const num = (ph: string, field: any) => (
    <Input type="number" step="0.01" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={e => { const v = e.target.value; const n = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(n as any) ? n : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Duration Gap (Interest Rate Risk) Calculator</CardTitle>
          <CardDescription>Estimate duration gap and interest rate risk profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="assetDuration" render={({ field }) => (<FormItem><FormLabel>Asset Duration (years)</FormLabel><FormControl>{num('e.g., 4.2', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="liabilityDuration" render={({ field }) => (<FormItem><FormLabel>Liability Duration (years)</FormLabel><FormControl>{num('e.g., 3.1', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="assets" render={({ field }) => (<FormItem><FormLabel>Total Assets</FormLabel><FormControl>{num('e.g., 1000', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="liabilities" render={({ field }) => (<FormItem><FormLabel>Total Liabilities</FormLabel><FormControl>{num('e.g., 800', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Balance sheet sensitivity</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Duration Gap</p><p className="text-2xl font-bold">{result.durationGap.toFixed(3)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Leverage (L/A)</p><p className="text-2xl font-bold">{result.leverageRatio.toFixed(3)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interest Rate Risk</p><p className="font-medium">{result.interestRateRisk}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Bonds and risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-duration-calculator" className="text-primary hover:underline">Bond Duration Calculator</a></h4><p className="text-sm text-muted-foreground">Measure single security duration.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/value-at-risk-calculator" className="text-primary hover:underline">Value at Risk (VaR)</a></h4><p className="text-sm text-muted-foreground">Quantify risk under distributional assumptions.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-convexity-calculator" className="text-primary hover:underline">Bond Convexity Calculator</a></h4><p className="text-sm text-muted-foreground">Refine risk beyond duration.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-yield-to-maturity-calculator" className="text-primary hover:underline">Bond Yield to Maturity</a></h4><p className="text-sm text-muted-foreground">Yield inputs affecting durations.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Duration Gap</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder for duration gap guide.</p><p>Cover immunization and derivatives usage.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Duration gap and ALM</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is duration gap?</h4><p className="text-muted-foreground">Difference between asset duration and liability duration weighted by leverage.</p></div>
          <div><h4 className="font-semibold mb-2">Why does it matter?</h4><p className="text-muted-foreground">It summarizes balance sheet sensitivity to interest rate changes.</p></div>
          <div><h4 className="font-semibold mb-2">How to reduce it?</h4><p className="text-muted-foreground">Match durations or use swaps/futures to adjust exposures.</p></div>
          <div><h4 className="font-semibold mb-2">Does convexity matter?</h4><p className="text-muted-foreground">Yes—gap is a first-order measure; convexity further refines risk.</p></div>
          <div><h4 className="font-semibold mb-2">Is negative gap bad?</h4><p className="text-muted-foreground">Not inherently; it indicates liability sensitivity (benefits from rising rates).</p></div>
          <div><h4 className="font-semibold mb-2">How often to update?</h4><p className="text-muted-foreground">After portfolio changes or significant yield curve shifts.</p></div>
          <div><h4 className="font-semibold mb-2">How does leverage amplify gap risk?</h4><p className="text-muted-foreground">Higher liabilities relative to assets scale the impact of duration mismatches on equity value.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use Macaulay or modified duration?</h4><p className="text-muted-foreground">Use a consistent convention; modified duration ties more directly to price sensitivity.</p></div>
          <div><h4 className="font-semibold mb-2">Does yield curve shape matter?</h4><p className="text-muted-foreground">Yes—parallel shift assumption is simplistic; use key-rate durations for curve risk.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


