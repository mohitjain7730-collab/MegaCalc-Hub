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
  riskFree: z.number().min(-100).max(100).optional(),
  marketReturn: z.number().min(-100).max(100).optional(),
  beta: z.number().min(-5).max(5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SecurityMarketLineCalculator() {
  const [result, setResult] = useState<{ expectedReturn: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskFree: undefined as unknown as number,
      marketReturn: undefined as unknown as number,
      beta: undefined as unknown as number,
    }
  });

  const onSubmit = (v: FormValues) => {
    if (v.riskFree == null || v.marketReturn == null || v.beta == null) {
      setResult(null);
      return;
    }
    const rf = v.riskFree / 100;
    const rm = v.marketReturn / 100;
    const er = rf + v.beta * (rm - rf);
    const text = `At beta ${v.beta.toFixed(2)}, expected return is ${(er*100).toFixed(2)}% on the SML.`;
    setResult({ expectedReturn: er * 100, interpretation: text });
  };

  const num = (name: keyof FormValues, label: string, placeholder: string, suffix = '%') => (
    <FormField control={form.control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder={placeholder}
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
            <span className="text-sm text-muted-foreground">{suffix}</span>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Security Market Line (SML)</CardTitle>
          <CardDescription>CAPM expected return from beta, risk‑free rate, and market return.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {num('riskFree', 'Risk‑Free Rate', 'e.g., 2')}
              {num('marketReturn', 'Market Expected Return', 'e.g., 8')}
              {num('beta', 'Security Beta', 'e.g., 1', '')}
              <div className="md:col-span-3"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Results & Interpretation</CardTitle>
            <CardDescription>Positioning along the SML</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><strong>Expected Return:</strong> {result.expectedReturn.toFixed(2)}%</p>
            <p className="text-sm text-muted-foreground">{result.interpretation} Compare realized returns to assess alpha relative to CAPM.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Risk and return</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio</a></h4><p className="text-sm text-muted-foreground">Risk‑adjusted performance.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/beta-weighted-portfolio-exposure-calculator" className="text-primary hover:underline">Beta‑weighted Portfolio Exposure</a></h4><p className="text-sm text-muted-foreground">Benchmark sensitivity.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</a></h4><p className="text-sm text-muted-foreground">Efficient frontier.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio (Max Sharpe)</a></h4><p className="text-sm text-muted-foreground">Sharpe‑maximizing mix.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Using the Security Market Line for expected return estimation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>The SML maps beta to expected return via CAPM. It's a benchmark for pricing systematic risk.</li>
            <li>Deviations from the SML suggest alpha (positive or negative) or model misspecification.</li>
            <li>Inputs should be annualized and consistent—use the same time horizon for risk‑free rate, market return, and beta estimation.</li>
            <li>Compare realized returns to SML expectations to identify securities with positive or negative alpha.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Security Market Line, CAPM, beta, and expected returns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is the SML?</h4><p className="text-muted-foreground">A line relating expected return to beta under CAPM, representing the relationship between systematic risk and expected return.</p></div>
          <div><h4 className="font-semibold mb-2">What inputs do I need?</h4><p className="text-muted-foreground">Risk‑free rate, market expected return, and the security's beta to calculate expected return along the SML.</p></div>
          <div><h4 className="font-semibold mb-2">How do I interpret beta 1?</h4><p className="text-muted-foreground">Matches market risk; expected return equals market expected return. Beta above 1 indicates higher systematic risk and expected return.</p></div>
          <div><h4 className="font-semibold mb-2">What if beta is negative?</h4><p className="text-muted-foreground">Expect returns below the risk‑free rate if the market premium is positive. Negative beta assets move opposite to the market.</p></div>
          <div><h4 className="font-semibold mb-2">Does CAPM hold in practice?</h4><p className="text-muted-foreground">It's an approximation; consider multi‑factor models for richer explanations of returns beyond market risk.</p></div>
          <div><h4 className="font-semibold mb-2">Is beta stable over time?</h4><p className="text-muted-foreground">No; re‑estimate periodically using consistent horizons. Betas can change with business fundamentals or market conditions.</p></div>
          <div><h4 className="font-semibold mb-2">What horizon should I use?</h4><p className="text-muted-foreground">Annualized inputs are typical; keep units consistent across risk‑free rate, market return, and beta estimation period.</p></div>
          <div><h4 className="font-semibold mb-2">What is alpha vs SML?</h4><p className="text-muted-foreground">Alpha is excess realized return above the CAPM expectation at given beta. Positive alpha indicates outperformance relative to SML.</p></div>
          <div><h4 className="font-semibold mb-2">How does changing Rf affect SML?</h4><p className="text-muted-foreground">Shifts intercept and alters expected return at all betas. Higher risk‑free rates raise the entire SML.</p></div>
          <div><h4 className="font-semibold mb-2">Why is market premium important?</h4><p className="text-muted-foreground">It scales expected returns per unit of beta risk. Larger premiums imply higher expected returns for risky assets.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}





