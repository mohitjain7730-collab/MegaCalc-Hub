'use client';

import { useState, useMemo } from 'react';
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
  marketStdev: z.number().min(0).max(200).optional(),
  targetStdev: z.number().min(0).max(200).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CapitalMarketLineCalculator() {
  const [result, setResult] = useState<{ slope: number; expectedReturn: number; interpretation: string } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskFree: undefined as unknown as number,
      marketReturn: undefined as unknown as number,
      marketStdev: undefined as unknown as number,
      targetStdev: undefined as unknown as number,
    }
  });

  const numInput = (name: keyof FormValues, label: string, placeholder: string, suffix = '%') => (
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

  const onSubmit = (v: FormValues) => {
    if (v.riskFree == null || v.marketReturn == null || v.marketStdev == null || v.targetStdev == null) {
      setResult(null);
      return;
    }
    const rf = v.riskFree / 100;
    const rm = v.marketReturn / 100;
    const sm = v.marketStdev / 100;
    const st = v.targetStdev / 100;
    const slope = sm > 0 ? (rm - rf) / sm : 0;
    const expectedReturn = rf + slope * st;
    const interpretation = `CML slope ${(slope).toFixed(3)} implies an expected return ${(expectedReturn*100).toFixed(2)}% at ${(st*100).toFixed(1)}% volatility. Higher target risk scales return linearly along the CML.`;
    setResult({ slope, expectedReturn: expectedReturn * 100, interpretation });
  };

  const rfVariants = useMemo(() => [-1, 0, 2, 4], []);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Capital Market Line (CML)</CardTitle>
          <CardDescription>Compute CML slope and expected return at a target volatility.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {numInput('riskFree', 'Risk‑Free Rate', 'e.g., 2')}
              {numInput('marketReturn', 'Market Expected Return', 'e.g., 8')}
              {numInput('marketStdev', 'Market Volatility (σm)', 'e.g., 15')}
              {numInput('targetStdev', 'Target Portfolio Volatility', 'e.g., 10')}
              <div className="md:col-span-2"><Button type="submit" className="w-full md:w-auto">Calculate</Button></div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Results & Interpretation</CardTitle>
            <CardDescription>Return scales with risk along the CML</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p><strong>Slope:</strong> {(result.slope).toFixed(3)}</p>
            <p><strong>Expected Return at target σ:</strong> {result.expectedReturn.toFixed(2)}%</p>
            <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            <div className="text-sm text-muted-foreground">What‑ifs by risk‑free rate: {rfVariants.map(v => <span key={v} className="mr-2">RF {v}%</span>)}</div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Portfolio theory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/tangency-portfolio-calculator" className="text-primary hover:underline">Tangency Portfolio (Max Sharpe)</a></h4><p className="text-sm text-muted-foreground">Sharpe‑maximizing mix.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/mean-variance-optimization-calculator" className="text-primary hover:underline">Mean‑Variance Optimization</a></h4><p className="text-sm text-muted-foreground">Efficient allocations.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/minimum-variance-portfolio-calculator" className="text-primary hover:underline">Minimum Variance Portfolio</a></h4><p className="text-sm text-muted-foreground">Lowest risk allocation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/sharpe-ratio-calculator" className="text-primary hover:underline">Sharpe Ratio</a></h4><p className="text-sm text-muted-foreground">Risk‑adjusted return.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Understanding the Capital Market Line and risk-return relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>The CML links portfolio risk (σ) to expected return when combining the market portfolio with the risk‑free asset. The slope equals the market Sharpe ratio.</li>
            <li>Levered positions extend above the market volatility; de‑levered positions lie between the risk‑free rate and market point.</li>
            <li>Inputs should be annualized and consistent—use the same time horizon for risk‑free rate, market return, and volatility.</li>
            <li>Portfolios below the CML are inefficient; those on or above it represent optimal risk‑return trade‑offs.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Capital Market Line, risk-return relationships, and portfolio efficiency</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What inputs define the CML?</h4><p className="text-muted-foreground">Risk‑free rate, market expected return, and market volatility set the slope and intercept of the CML.</p></div>
          <div><h4 className="font-semibold mb-2">How is CML slope computed?</h4><p className="text-muted-foreground">(Rm − Rf) / σm, which equals the market Sharpe ratio. Higher slopes indicate better risk‑adjusted returns.</p></div>
          <div><h4 className="font-semibold mb-2">What does a higher slope imply?</h4><p className="text-muted-foreground">Greater expected return per unit of risk, improving attractiveness of levering the market portfolio.</p></div>
          <div><h4 className="font-semibold mb-2">Can expected return be below the CML?</h4><p className="text-muted-foreground">Yes; inefficient portfolios lie below the CML, indicating suboptimal risk‑return trade‑off. Consider rebalancing to improve efficiency.</p></div>
          <div><h4 className="font-semibold mb-2">How does leverage show on the CML?</h4><p className="text-muted-foreground">Target σ above market σ implies borrowing at Rf to invest more in the market portfolio, extending along the CML.</p></div>
          <div><h4 className="font-semibold mb-2">Does changing Rf move the CML?</h4><p className="text-muted-foreground">Yes; it shifts up/down and changes slope via the risk premium. Higher risk‑free rates reduce the market premium and flatten the CML.</p></div>
          <div><h4 className="font-semibold mb-2">Is the market point always efficient?</h4><p className="text-muted-foreground">Under CAPM assumptions yes; in practice consider frictions, constraints, and estimation error that may affect efficiency.</p></div>
          <div><h4 className="font-semibold mb-2">What horizon are inputs?</h4><p className="text-muted-foreground">Annualized returns and volatility are typical; be consistent across inputs and match your investment horizon.</p></div>
          <div><h4 className="font-semibold mb-2">Can I use this for target‑date planning?</h4><p className="text-muted-foreground">It provides a simple return‑risk mapping but does not replace full glidepath analysis with age‑based asset allocation.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I update inputs?</h4><p className="text-muted-foreground">At least annually or when risk‑free rates and market conditions change materially. Monitor quarterly for tactical adjustments.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}





