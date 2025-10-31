'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Info, Globe } from 'lucide-react';

const formSchema = z.object({
  spotRate: z.number().min(0).optional(),
  forwardRate: z.number().min(0).optional(),
  quoteScale: z.number().min(1).max(1000000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CurrencyForwardPointsCalculator() {
  const [result, setResult] = useState<{ points: number; premiumPct: number; interp: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { spotRate: undefined as unknown as number, forwardRate: undefined as unknown as number, quoteScale: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.spotRate === undefined || v.forwardRate === undefined || v.quoteScale === undefined || v.quoteScale === 0) { setResult(null); return; }
    const points = (v.forwardRate - v.spotRate) * v.quoteScale;
    const premiumPct = ((v.forwardRate - v.spotRate) / v.spotRate) * 100;
    const interp = points === 0 ? 'No premium/discount.' : points > 0 ? 'Forward premium (quote currency stronger forward).' : 'Forward discount (quote currency weaker forward).';
    setResult({ points, premiumPct, interp });
  };

  const num = (ph: string, field: any) => (
    <Input type="number" step="0.0001" placeholder={ph} {...field}
      value={Number.isFinite(field.value as any) ? (field.value as any) : ''}
      onChange={e => { const v = e.target.value; const n = v === '' ? undefined : Number(v); field.onChange(Number.isFinite(n as any) ? n : undefined); }} />
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Currency Forward Points Calculator</CardTitle>
          <CardDescription>Convert forward quotes into points and premium/discount.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField control={form.control} name="spotRate" render={({ field }) => (<FormItem><FormLabel>Spot Rate</FormLabel><FormControl>{num('e.g., 1.1200', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="forwardRate" render={({ field }) => (<FormItem><FormLabel>Forward Rate</FormLabel><FormControl>{num('e.g., 1.1255', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="quoteScale" render={({ field }) => (<FormItem><FormLabel>Quote Scale (e.g., 10000 for 4-decimal)</FormLabel><FormControl>{num('e.g., 10000', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Forward points</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Forward Points</p><p className="text-2xl font-bold">{result.points.toFixed(2)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Premium/Discount</p><p className={`text-2xl font-bold ${result.premiumPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.premiumPct.toFixed(3)}%</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interp}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>FX pricing</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/interest-rate-parity-calculator" className="text-primary hover:underline">Interest Rate Parity</a></h4><p className="text-sm text-muted-foreground">Relate forwards to rates.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/currency-exchange-calculator" className="text-primary hover:underline">Currency Exchange</a></h4><p className="text-sm text-muted-foreground">Spot conversions.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/covered-interest-arbitrage-calculator" className="text-primary hover:underline">Covered Interest Arbitrage</a></h4><p className="text-sm text-muted-foreground">Parity deviations and trades.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/purchasing-power-parity-calculator" className="text-primary hover:underline">Purchasing Power Parity</a></h4><p className="text-sm text-muted-foreground">Long-run fair value anchors.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Forward Points</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide content.</p><p>Explain quoting conventions and scaling.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>FX forward basics</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What are forward points?</h4><p className="text-muted-foreground">Scaled difference between forward and spot rates, used for quoting.</p></div>
          <div><h4 className="font-semibold mb-2">Why use scales?</h4><p className="text-muted-foreground">To present changes in pips for various decimal conventions.</p></div>
          <div><h4 className="font-semibold mb-2">Are positive points always a premium?</h4><p className="text-muted-foreground">Yes relative to spot, but interpret alongside quote direction and conventions.</p></div>
          <div><h4 className="font-semibold mb-2">Do points imply arbitrage?</h4><p className="text-muted-foreground">Not alone—compare to parity using interest rates.</p></div>
          <div><h4 className="font-semibold mb-2">What precision should I use?</h4><p className="text-muted-foreground">Match market precision (e.g., 1/10 pip where applicable).</p></div>
          <div><h4 className="font-semibold mb-2">How do points translate to annualized premium?</h4><p className="text-muted-foreground">Convert points back to rate difference and scale by tenor to annualize consistently.</p></div>
          <div><h4 className="font-semibold mb-2">Do forward points predict FX direction?</h4><p className="text-muted-foreground">No. They reflect interest differentials, not expected returns once carry is considered.</p></div>
          <div><h4 className="font-semibold mb-2">Can I compare points across pairs?</h4><p className="text-muted-foreground">Compare percentage premium/discount, not raw points, due to different quote scales.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


