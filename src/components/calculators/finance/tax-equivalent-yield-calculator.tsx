'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Info, DollarSign } from 'lucide-react';

const formSchema = z.object({
  taxFreeYield: z.number().min(0).max(100).optional(),
  marginalTaxRate: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TaxEquivalentYieldCalculator() {
  const [result, setResult] = useState<{
    taxEquivalentYield: number;
    interpretation: string;
    advantage: string;
  } | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taxFreeYield: undefined as unknown as number,
      marginalTaxRate: undefined as unknown as number,
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
                field.onChange(Number.isFinite(n as any) && n !== null && n >= 0 && n <= 100 ? n : undefined);
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
    if (v.taxFreeYield == null || v.marginalTaxRate == null || v.marginalTaxRate >= 100) {
      setResult(null);
      return;
    }
    const taxEqYield = (v.taxFreeYield / 100) / (1 - v.marginalTaxRate / 100);
    const advantage = taxEqYield * 100 > 5 ? 'Municipal bonds offer attractive after-tax yields for high tax brackets.' : 'Compare with taxable bond yields to determine best option.';
    const interpretation = `Tax-equivalent yield: ${(taxEqYield * 100).toFixed(2)}%. A taxable bond would need to yield ${(taxEqYield * 100).toFixed(2)}% to match the ${v.taxFreeYield.toFixed(2)}% tax-free yield at your ${v.marginalTaxRate.toFixed(1)}% marginal tax rate. ${advantage}`;
    setResult({ taxEquivalentYield: taxEqYield * 100, interpretation, advantage });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5"/> Tax-Equivalent Yield (Municipal Bonds) Calculator</CardTitle>
          <CardDescription>Compute tax-equivalent yield for municipal bonds given tax-free yield, marginal tax rate, and taxable equivalent.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {numInput('taxFreeYield', 'Tax-Free Yield (Municipal Bond)', 'e.g., 3.5')}
              {numInput('marginalTaxRate', 'Marginal Tax Rate', 'e.g., 35')}
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>Tax-equivalent yield comparison</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div><div className="text-sm text-muted-foreground">Tax-Equivalent Yield</div><div className="text-2xl font-semibold">{result.taxEquivalentYield.toFixed(2)}%</div></div>
            <p className="text-sm leading-6">{result.interpretation}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Related Calculators</CardTitle>
          <CardDescription>Fixed income and tax planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/duration-matching-calculator" className="text-primary hover:underline">Duration Matching</a></h4><p className="text-sm text-muted-foreground">Interest rate risk management.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/asset-liability-matching-calculator" className="text-primary hover:underline">Asset-Liability Matching</a></h4><p className="text-sm text-muted-foreground">Cash flow alignment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/present-value-calculator" className="text-primary hover:underline">Present Value</a></h4><p className="text-sm text-muted-foreground">Bond valuation.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/yield-to-maturity-calculator" className="text-primary hover:underline">Yield to Maturity</a></h4><p className="text-sm text-muted-foreground">Bond yield calculation.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Guide</CardTitle>
          <CardDescription>Comparing municipal bonds to taxable bonds using tax-equivalent yield</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2 text-sm">
            <li>Tax-equivalent yield = Tax-Free Yield / (1 - Marginal Tax Rate). It shows what a taxable bond must yield to match the after-tax return of a municipal bond.</li>
            <li>Municipal bonds are typically exempt from federal taxes and sometimes state/local taxes, making them attractive for high-tax-bracket investors.</li>
            <li>Use your marginal tax rate (the rate on your last dollar of income), not your average tax rate, for accurate comparison.</li>
            <li>Compare tax-equivalent yield to taxable bond yields of similar credit quality and maturity to determine the better investment.</li>
            <li>Consider state tax exemption—if the municipal bond is from your state, you may avoid state taxes, further increasing the advantage.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/> Frequently Asked Questions</CardTitle>
          <CardDescription>Tax-equivalent yield, municipal bonds, and tax-efficient investing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is tax-equivalent yield?</h4><p className="text-muted-foreground">Tax-equivalent yield is the yield a taxable bond must provide to match the after-tax return of a tax-free municipal bond, accounting for your marginal tax rate.</p></div>
          <div><h4 className="font-semibold mb-2">Why use marginal tax rate instead of average?</h4><p className="text-muted-foreground">Marginal tax rate reflects the tax on your next dollar of income, which is what you'll pay on taxable bond interest. Average tax rate understates the benefit of tax-free bonds.</p></div>
          <div><h4 className="font-semibold mb-2">Are all municipal bonds tax-free?</h4><p className="text-muted-foreground">Most municipal bonds are exempt from federal taxes. State and local tax exemption depends on whether you're a resident of the issuing state. Some private activity bonds may be subject to alternative minimum tax (AMT).</p></div>
          <div><h4 className="font-semibold mb-2">When are municipal bonds most attractive?</h4><p className="text-muted-foreground">Municipal bonds are most attractive for investors in high tax brackets (e.g., 32%+ federal) where the tax-equivalent yield significantly exceeds taxable bond yields.</p></div>
          <div><h4 className="font-semibold mb-2">Should I consider credit risk?</h4><p className="text-muted-foreground">Yes. Compare municipal bonds to taxable bonds of similar credit quality and maturity. Higher credit risk should be compensated with higher yields regardless of tax status.</p></div>
          <div><h4 className="font-semibold mb-2">How does state tax exemption affect the calculation?</h4><p className="text-muted-foreground">If you're a resident of the issuing state, you may also avoid state and local taxes. Add state tax rate to federal rate for a more accurate tax-equivalent yield calculation.</p></div>
          <div><h4 className="font-semibold mb-2">Are municipal bonds suitable for tax-advantaged accounts?</h4><p className="text-muted-foreground">Generally no. Since IRAs and 401(k)s are already tax-deferred or tax-free, the tax exemption of municipal bonds provides no additional benefit. Prefer taxable bonds in these accounts.</p></div>
          <div><h4 className="font-semibold mb-2">What about alternative minimum tax (AMT)?</h4><p className="text-muted-foreground">Some private activity municipal bonds are subject to AMT. Check the bond's AMT status, as it may affect the tax-equivalent yield calculation for AMT-subject investors.</p></div>
          <div><h4 className="font-semibold mb-2">How do I find my marginal tax rate?</h4><p className="text-muted-foreground">Check the current federal income tax brackets. Your marginal rate is the tax rate on your highest bracket of taxable income. State tax rates vary by state.</p></div>
          <div><h4 className="font-semibold mb-2">Should I always choose the highest tax-equivalent yield?</h4><p className="text-muted-foreground">Not necessarily. Consider credit risk, liquidity, call risk, and your investment horizon. Tax-equivalent yield is one factor in bond selection, not the only factor.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


