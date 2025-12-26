'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Landmark, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  roa: z.number().min(-100).max(100).optional(),
  debtToEquity: z.number().min(0).max(100).optional(),
  interestRate: z.number().min(0).max(100).optional(),
  taxRate: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FinancialLeverageEffectCalculator() {
  const [result, setResult] = useState<{ roe: number; leverageEffect: number; interpretation: string; suggestions: string[] } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { roa: undefined as unknown as number, debtToEquity: undefined as unknown as number, interestRate: undefined as unknown as number, taxRate: undefined as unknown as number },
  });

  const onSubmit = (v: FormValues) => {
    if (v.roa === undefined || v.debtToEquity === undefined || v.interestRate === undefined || v.taxRate === undefined) { setResult(null); return; }
    const rdAfterTax = v.interestRate * (1 - v.taxRate / 100);
    const roe = v.roa + v.debtToEquity * (v.roa - rdAfterTax);
    const leverageEffect = roe - v.roa;
    const interpretation = leverageEffect >= 0 ? 'Leverage increases ROE because ROA exceeds after-tax cost of debt.' : 'Leverage reduces ROE because ROA is less than after-tax cost of debt.';
    setResult({ roe, leverageEffect, interpretation, suggestions: ['Aim for ROA above the after-tax cost of debt to amplify ROE.', 'Avoid excessive leverage; rising rates or falling ROA can invert the benefit.', 'Stress-test scenarios for rate hikes and lower profitability.', 'Consider covenants and liquidity risk in leverage decisions.'] });
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
          <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" /> Financial Leverage Effect Calculator</CardTitle>
          <CardDescription>Estimate how leverage changes ROE given ROA, debt cost, and taxes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <FormField control={form.control} name="roa" render={({ field }) => (<FormItem><FormLabel>ROA (%)</FormLabel><FormControl>{num('e.g., 8', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="debtToEquity" render={({ field }) => (<FormItem><FormLabel>Debt-to-Equity (x)</FormLabel><FormControl>{num('e.g., 1.5', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="interestRate" render={({ field }) => (<FormItem><FormLabel>Interest Rate on Debt (%)</FormLabel><FormControl>{num('e.g., 6', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="taxRate" render={({ field }) => (<FormItem><FormLabel>Tax Rate (%)</FormLabel><FormControl>{num('e.g., 25', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>ROE impact from leverage</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Estimated ROE</p><p className="text-2xl font-bold">{result.roe.toFixed(2)}%</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Leverage Effect</p><p className={`text-2xl font-bold ${result.leverageEffect >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.leverageEffect.toFixed(2)}%</p></div>
                <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>Capital structure optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.slice(0, 2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm font-medium">Positive leverage effect amplifies returns to shareholders</span>
                </div>
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Critical factors to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.slice(2).map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{s}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-300">Negative leverage effect destroys shareholder value rapidly</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Capital structure and returns</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/return-on-equity-calculator" className="text-primary hover:underline">ROE Calculator</a></h4><p className="text-sm text-muted-foreground">Assess profitability to shareholders.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/wacc-calculator" className="text-primary hover:underline">WACC Calculator</a></h4><p className="text-sm text-muted-foreground">Evaluate blended financing cost.</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              ROE = ROA + (D/E) × (ROA - r_d × (1 - Tax Rate))
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Leverage amplifies ROE when ROA exceeds the after-tax cost of debt.
          </p>
        </CardContent>
      </Card>

      {/* Input Explanations */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">ROA & Interest Rate (%)</h4>
              <p className="text-sm text-muted-foreground">Return on assets and the borrowing cost on debt.</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2">D/E & Tax Rate</h4>
              <p className="text-sm text-muted-foreground">Debt-to-equity ratio and effective tax rate for interest shield.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complete SEO Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Financial Leverage Effect</h1>
        <p className="text-lg italic text-muted-foreground">Understand how debt financing impacts return on equity.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is the Leverage Effect?</h2>
        <p>Financial leverage amplifies ROE by using debt financing. When ROA exceeds the after-tax cost of debt, borrowing boosts shareholder returns. When ROA falls below debt cost, leverage destroys value.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Key Considerations</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li>Higher leverage increases both upside potential and downside risk.</li>
          <li>The tax shield on interest reduces the effective cost of debt.</li>
          <li>Rising rates or falling ROA can quickly reverse positive leverage effects.</li>
        </ul>

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>Understanding leverage effects is crucial for capital structure decisions. This calculator helps quantify how debt impacts shareholder returns.</p>
      </section>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Leverage and returns</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">When does leverage help?</h4><p className="text-muted-foreground">When ROA exceeds the after-tax cost of debt, leverage amplifies ROE.</p></div>
          <div><h4 className="font-semibold mb-2">What if rates rise?</h4><p className="text-muted-foreground">Higher debt costs reduce the leverage benefit and can turn it negative.</p></div>
          <div><h4 className="font-semibold mb-2">Is higher D/E always better?</h4><p className="text-muted-foreground">No—excessive leverage increases default risk and volatility of returns.</p></div>
          <div><h4 className="font-semibold mb-2">How does tax rate matter?</h4><p className="text-muted-foreground">The interest tax shield lowers effective debt cost, improving leverage effect.</p></div>
          <div><h4 className="font-semibold mb-2">Does ROA include interest?</h4><p className="text-muted-foreground">Use operating returns on assets (pre-interest) for ROA when analyzing leverage effect.</p></div>
          <div><h4 className="font-semibold mb-2">Can leverage hurt valuation?</h4><p className="text-muted-foreground">Yes—if risk premiums rise, equity value can fall despite higher ROE.</p></div>
          <div><h4 className="font-semibold mb-2">How often should I reassess?</h4><p className="text-muted-foreground">Review quarterly or when ROA or rates change meaningfully.</p></div>
          <div><h4 className="font-semibold mb-2">Is this the DuPont model?</h4><p className="text-muted-foreground">Related—DuPont decomposes ROE; this focuses on the leverage term.</p></div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Summary</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">The Financial Leverage Effect Calculator shows how debt financing impacts ROE. Leverage amplifies returns when ROA exceeds after-tax debt cost, but increases risk when profitability declines.</p></CardContent>
      </Card>
    </div>
  );
}


