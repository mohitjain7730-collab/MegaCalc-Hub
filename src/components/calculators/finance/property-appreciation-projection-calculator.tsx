'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Info } from 'lucide-react';

const formSchema = z.object({
  currentValue: z.number().min(0).optional(),
  annualAppreciationPct: z.number().min(-50).max(200).optional(),
  years: z.number().min(0).max(100).optional(),
  extraEquityPerYear: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PropertyAppreciationProjectionCalculator() {
  const [result, setResult] = useState<null | { futureValue: number; totalExtraEquity: number; interpretation: string; altYears?: number; altFuture?: number }>(null);
  const [whatIfYears, setWhatIfYears] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentValue: undefined as unknown as number,
      annualAppreciationPct: undefined as unknown as number,
      years: undefined as unknown as number,
      extraEquityPerYear: undefined as unknown as number,
    },
  });

  const num = (ph: string, field: any) => (
    <Input
      type="number"
      step="0.01"
      placeholder={ph}
      {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={(e) => {
        const v = e.target.value; const n = v === '' ? undefined : Number(v);
        field.onChange(Number.isFinite(n as any) ? n : undefined);
      }}
    />
  );

  const onSubmit = (v: FormValues) => {
    if (v.currentValue === undefined || v.annualAppreciationPct === undefined || v.years === undefined) { setResult(null); return; }
    const g = v.annualAppreciationPct / 100;
    const fv = v.currentValue * Math.pow(1 + g, v.years);
    const totalExtra = (v.extraEquityPerYear || 0) * v.years;
    let interpretation = `At ${v.annualAppreciationPct.toFixed(2)}% annual appreciation, a $${v.currentValue.toFixed(0)} property could be worth about $${fv.toFixed(0)} in ${v.years} years.`;
    if (v.extraEquityPerYear && v.extraEquityPerYear > 0) interpretation += ` Adding $${v.extraEquityPerYear.toFixed(0)} per year in principal/equity contributions builds an extra $${totalExtra.toFixed(0)} in equity (ignoring compounding).`;
    setResult({ futureValue: fv, totalExtraEquity: totalExtra, interpretation });
  };

  const makeAlt = (yrs: number) => {
    const g = (form.getValues('annualAppreciationPct') || 0) / 100;
    const base = (form.getValues('currentValue') || 0);
    return base * Math.pow(1 + g, yrs);
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5"/> Property Appreciation Projection Calculator</CardTitle>
          <CardDescription>Project future property value based on a constant annual appreciation rate.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="currentValue" render={({field}) => (<FormItem><FormLabel>Current Property Value ($)</FormLabel><FormControl>{num('e.g., 300000', field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="annualAppreciationPct" render={({field}) => (<FormItem><FormLabel>Annual Appreciation (%)</FormLabel><FormControl>{num('e.g., 3', field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="years" render={({field}) => (<FormItem><FormLabel>Years</FormLabel><FormControl>{num('e.g., 10', field)}</FormControl><FormMessage/></FormItem>)} />
                <FormField control={form.control} name="extraEquityPerYear" render={({field}) => (<FormItem><FormLabel>Extra Equity Per Year ($)</FormLabel><FormControl>{num('optional', field)}</FormControl><FormMessage/></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Adjust years to see an interactive projection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-semibold">Projected Value: ${result.futureValue.toFixed(0)}</div>
            <p className="text-sm leading-6">{result.interpretation}</p>
            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 font-medium mb-2"><Info className="h-4 w-4"/> What-if: Years</div>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 15, 20, 30].map((yrs) => (
                  <Button key={yrs} variant={(whatIfYears===yrs)?'default':'secondary'} onClick={() => setWhatIfYears(yrs)}>{yrs} yrs</Button>
                ))}
              </div>
              {whatIfYears!==null && (
                <div className="mt-2 text-sm">In {whatIfYears} years: ≈ ${makeAlt(whatIfYears).toFixed(0)}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Appreciation varies by market; use conservative rates (2–4% long-run).</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Projections ignore renovation value-add and major market cycles.</li>
            <li>Consider adding extra equity contributions to accelerate ownership.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Real‑estate returns and valuation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/rental-yield-calculator" className="text-primary hover:underline">Rental Yield</a></h4><p className="text-sm text-muted-foreground">Income productivity of a property.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/real-estate-cap-rate-sensitivity-calculator" className="text-primary hover:underline">Cap Rate Sensitivity</a></h4><p className="text-sm text-muted-foreground">Value vs NOI and cap rate.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mortgage-points-impact-calculator" className="text-primary hover:underline">Mortgage Points Impact</a></h4><p className="text-sm text-muted-foreground">Rate buy‑down breakeven.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/home-affordability-calculator" className="text-primary hover:underline">Home Affordability</a></h4><p className="text-sm text-muted-foreground">Budget‑based maximum price.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑friendly answers about property appreciation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is a typical home price appreciation rate?</h4><p className="text-muted-foreground">Long‑run U.S. averages hover around 3–4% annually, but local markets can deviate widely due to supply, migration, employment, and interest rate cycles. Use a conservative rate for planning.</p></div>
          <div><h4 className="font-semibold mb-2">Does appreciation compound?</h4><p className="text-muted-foreground">Yes. Appreciation compounds annually, which means a 3% increase each year grows on top of the previous year’s value, not just the original purchase price.</p></div>
          <div><h4 className="font-semibold mb-2">How do renovations affect projections?</h4><p className="text-muted-foreground">Renovations can add value beyond market appreciation, but the uplift depends on project type, quality, and neighborhood comparables. This calculator models market appreciation only.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use nominal or real (inflation‑adjusted) returns?</h4><p className="text-muted-foreground">This tool uses nominal appreciation. For real returns, subtract expected inflation (e.g., 2–3%) from the nominal rate to gauge purchasing‑power growth.</p></div>
          <div><h4 className="font-semibold mb-2">How do interest rates influence appreciation?</h4><p className="text-muted-foreground">Lower mortgage rates generally support demand and prices; rising rates can cool the market. Macro cycles and local supply constraints determine how sensitive prices are in your area.</p></div>
          <div><h4 className="font-semibold mb-2">Is the same rate valid for condos, single‑family, and multifamily?</h4><p className="text-muted-foreground">Not always. Different asset types have unique supply/demand drivers and HOA or operating cost dynamics. Check local data for the property type you own.</p></div>
          <div><h4 className="font-semibold mb-2">What time horizon is best for projections?</h4><p className="text-muted-foreground">Real estate is cyclical. Longer horizons (10–20 years) smooth short‑term volatility, while short horizons are more sensitive to market timing and transaction costs.</p></div>
          <div><h4 className="font-semibold mb-2">How reliable are Zestimate‑style valuations?</h4><p className="text-muted-foreground">Automated valuations provide a quick reference but can be off by ±5–10% or more. Use professional appraisals and comps when making financing or sale decisions.</p></div>
          <div><h4 className="font-semibold mb-2">Do property taxes rise with appreciation?</h4><p className="text-muted-foreground">Often, yes—assessed value growth can increase annual taxes unless caps or homestead protections apply. Include tax growth in your ownership cost planning.</p></div>
          <div><h4 className="font-semibold mb-2">Can appreciation be negative?</h4><p className="text-muted-foreground">Yes. Markets can decline during recessions or local downturns. Stress‑test your plan with low or negative rates to understand downside risk.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


