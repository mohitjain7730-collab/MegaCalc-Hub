'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, Shield } from 'lucide-react';

const formSchema = z.object({
  liabilityDuration: z.number().min(0).optional(),
  positions: z.string().min(1, 'Enter bond positions data'),
});

type FormValues = z.infer<typeof formSchema>;

function parseBondPositions(data: string): { name: string; weight: number; duration: number }[] | null {
  try {
    const lines = data.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    const positions: { name: string; weight: number; duration: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 3) continue;
      const weight = parseFloat(parts[1].replace('%', ''));
      const duration = parseFloat(parts[2]);
      if (!Number.isFinite(weight) || !Number.isFinite(duration)) continue;
      positions.push({
        name: parts[0],
        weight: Math.abs(weight) > 1 ? weight / 100 : weight,
        duration
      });
    }
    return positions.length > 0 ? positions : null;
  } catch {
    return null;
  }
}

export default function DurationMatchingCalculator() {
  const [result, setResult] = useState<{
    portfolioDuration: number;
    durationGap: number;
    interpretation: string;
    recommendation: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      liabilityDuration: undefined as unknown as number,
      positions: ''
    }
  });

  const numInput = (name: keyof FormValues, label: string, placeholder: string) => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input
            type="number"
            step="0.1"
            placeholder={placeholder}
            value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
            onChange={e => {
              const v = e.target.value;
              const n = v === '' ? undefined : Number(v);
              field.onChange(Number.isFinite(n as any) && n !== null && n >= 0 ? n : undefined);
            }}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  const onSubmit = (v: FormValues) => {
    if (v.liabilityDuration == null) {
      setResult(null);
      return;
    }
    const parsed = parseBondPositions(v.positions);
    if (!parsed || parsed.length === 0) {
      setResult(null);
      return;
    }
    const portfolioDuration = parsed.reduce((sum, pos) => sum + pos.weight * pos.duration, 0);
    const durationGap = portfolioDuration - v.liabilityDuration;
    const absGap = Math.abs(durationGap);
    let recommendation = '';
    if (absGap < 0.5) recommendation = 'Portfolio is well-matched. Immunization strategy is effective.';
    else if (durationGap > 0) recommendation = 'Portfolio duration exceeds liability duration. Consider reducing duration or adding shorter-maturity bonds.';
    else recommendation = 'Portfolio duration is shorter than liability duration. Consider extending duration or adding longer-maturity bonds.';
    const interpretation = `Portfolio duration: ${portfolioDuration.toFixed(2)} years. Liability duration: ${v.liabilityDuration.toFixed(2)} years. Duration gap: ${durationGap > 0 ? '+' : ''}${durationGap.toFixed(2)} years. ${recommendation}`;
    setResult({ portfolioDuration, durationGap, interpretation, recommendation });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5"/> Duration Matching (Immunization) Calculator</CardTitle>
          <CardDescription>Match portfolio duration to liability duration for immunization, minimizing interest rate risk.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('liabilityDuration', 'Liability Duration (years)', 'e.g., 5.5')}
              <FormField control={form.control} name="positions" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bond Positions (CSV: Name, Weight%, Duration)</FormLabel>
                  <FormControl>
                    <Textarea rows={6} placeholder="Name,Weight%,Duration\nBond A,40,4.5\nBond B,35,5.0\nBond C,25,6.2" {...field} className="font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Duration matching analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><div className="text-sm text-muted-foreground">Portfolio Duration</div><div className="text-2xl font-semibold">{result.portfolioDuration.toFixed(2)} years</div></div>
              <div><div className="text-sm text-muted-foreground">Liability Duration</div><div className="text-2xl font-semibold">{form.getValues('liabilityDuration')?.toFixed(2)} years</div></div>
              <div><div className="text-sm text-muted-foreground">Duration Gap</div><div className={`text-2xl font-semibold ${Math.abs(result.durationGap) < 0.5 ? 'text-green-600' : 'text-orange-600'}`}>{result.durationGap > 0 ? '+' : ''}{result.durationGap.toFixed(2)} years</div></div>
            </div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Fixed income and risk management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/asset-liability-matching-calculator" className="text-primary hover:underline">Asset-Liability Matching</a></h4><p className="text-sm text-muted-foreground">Cash flow alignment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tax-equivalent-yield-calculator" className="text-primary hover:underline">Tax-Equivalent Yield</a></h4><p className="text-sm text-muted-foreground">Municipal bond comparison.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value</a></h4><p className="text-sm text-muted-foreground">Bond valuation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/yield-to-maturity-calculator" className="text-primary hover:underline">Yield to Maturity</a></h4><p className="text-sm text-muted-foreground">Bond yield calculation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding duration matching and immunization strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Duration matching (immunization) aligns portfolio duration with liability duration to hedge interest rate risk.</li>
            <li>Portfolio duration = Σ(Weight × Duration) for all bond positions. Match this to your liability duration.</li>
            <li>When durations match, changes in interest rates affect portfolio and liability values similarly, minimizing net exposure.</li>
            <li>Duration gap &lt;0.5 years is typically considered well-matched. Larger gaps require rebalancing to maintain immunization.</li>
            <li>Rebalance periodically as durations change with time (duration decreases as bonds approach maturity) and interest rates change.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Duration matching, immunization, and interest rate risk management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is duration matching?</h4><p className="text-muted-foreground">Duration matching is an immunization strategy that aligns portfolio duration with liability duration to minimize interest rate risk, ensuring portfolio value changes offset liability value changes when rates change.</p></div>
          <div><h4 className="font-semibold mb-2">How is portfolio duration calculated?</h4><p className="text-muted-foreground">Portfolio duration = Σ(Weight × Duration) for all bond positions. It's the weighted average of individual bond durations, where weights are portfolio allocations.</p></div>
          <div><h4 className="font-semibold mb-2">What is liability duration?</h4><p className="text-muted-foreground">Liability duration is the weighted average time to receipt of liability cash flows, discounted by the appropriate interest rate. It measures sensitivity of liability value to interest rate changes.</p></div>
          <div><h4 className="font-semibold mb-2">Why match durations?</h4><p className="text-muted-foreground">When portfolio and liability durations match, interest rate changes affect both similarly, minimizing net exposure. This immunizes the portfolio against interest rate risk.</p></div>
          <div><h4 className="font-semibold mb-2">What duration gap is acceptable?</h4><p className="text-muted-foreground">A gap &lt;0.5 years is typically considered well-matched. Larger gaps indicate imperfect immunization and may require rebalancing to restore matching.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I rebalance for duration matching?</h4><p className="text-muted-foreground">Rebalance when the duration gap exceeds tolerance (e.g., 0.5 years), when interest rates change significantly, or periodically (e.g., quarterly) as durations drift with time.</p></div>
          <div><h4 className="font-semibold mb-2">Does duration matching eliminate all risk?</h4><p className="text-muted-foreground">No. Duration matching hedges interest rate risk but not credit risk, liquidity risk, or basis risk. It's most effective for parallel shifts in the yield curve.</p></div>
          <div><h4 className="font-semibold mb-2">What if durations don't match exactly?</h4><p className="text-muted-foreground">Small gaps (&lt;0.5 years) are often acceptable. For larger gaps, adjust portfolio by adding/removing positions or shifting to bonds with different durations to restore matching.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use this for multiple liabilities?</h4><p className="text-muted-foreground">Yes. Calculate weighted average liability duration for multiple liabilities, then match portfolio duration to this combined liability duration.</p></div>
          <div><h4 className="font-semibold mb-2">What about convexity?</h4><p className="text-muted-foreground">Duration matching is a first-order approximation. For better immunization, consider convexity matching as well, especially for large interest rate changes or non-parallel yield curve shifts.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


