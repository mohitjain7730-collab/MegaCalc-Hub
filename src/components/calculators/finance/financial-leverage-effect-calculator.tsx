'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Landmark } from 'lucide-react';

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
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>ROE impact from leverage</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Estimated ROE</p><p className="text-2xl font-bold">{result.roe.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Leverage Effect</p><p className={`text-2xl font-bold ${result.leverageEffect >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.leverageEffect.toFixed(2)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Suggestions</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.suggestions.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
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

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Leverage Effect</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder for the guide content.</p><p>Explain ROA, ROE, interest tax shield, and risks.</p></CardContent>
      </Card>

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
    </div>
  );
}


