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

// Simplified convexity adjustment: Futures = Forward + 0.5 * sigma^2 * T * CF * Duration
// This is an illustrative model (Hull-style approximation). Units are annualized.
const formSchema = z.object({
  forwardPrice: z.number().min(0).optional(),
  yieldVolatility: z.number().min(0).max(500).optional(), // % per sqrt(year)
  timeYears: z.number().min(0).max(100).optional(),
  conversionFactor: z.number().min(0).max(10).optional(),
  duration: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConvexityAdjustmentBondFuturesCalculator() {
  const [result, setResult] = useState<{ adjustment: number; futuresPrice: number; notes: string[] } | null>(null);

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { forwardPrice: undefined as unknown as number, yieldVolatility: undefined as unknown as number, timeYears: undefined as unknown as number, conversionFactor: undefined as unknown as number, duration: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.forwardPrice === undefined || v.yieldVolatility === undefined || v.timeYears === undefined || v.conversionFactor === undefined || v.duration === undefined) { setResult(null); return; }
    const sigma = v.yieldVolatility / 100; // convert % to decimal
    const adj = 0.5 * sigma * sigma * v.timeYears * v.conversionFactor * v.duration * v.forwardPrice;
    const fut = v.forwardPrice + adj;
    setResult({ adjustment: adj, futuresPrice: fut, notes: ['Illustrative formula; check exchange conventions.', 'Use appropriate volatility (yield vol) and duration for CTD.', 'Conversion factor aligns cash bond to futures contract.'] });
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Convexity Adjustment (Bond Futures) Calculator</CardTitle>
          <CardDescription>Estimate convexity adjustment to convert forward to futures price.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <FormField control={form.control} name="forwardPrice" render={({ field }) => (<FormItem><FormLabel>Forward Price</FormLabel><FormControl>{num('e.g., 100.25', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="yieldVolatility" render={({ field }) => (<FormItem><FormLabel>Yield Volatility (%/√yr)</FormLabel><FormControl>{num('e.g., 10', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="timeYears" render={({ field }) => (<FormItem><FormLabel>Time (years)</FormLabel><FormControl>{num('e.g., 0.5', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="conversionFactor" render={({ field }) => (<FormItem><FormLabel>Conversion Factor</FormLabel><FormControl>{num('e.g., 0.95', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>CTD Duration (years)</FormLabel><FormControl>{num('e.g., 7', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Futures vs forward</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Convexity Adjustment</p><p className="text-2xl font-bold">{result.adjustment.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Estimated Futures Price</p><p className="text-2xl font-bold">{result.futuresPrice.toFixed(4)}</p></div>
            </div>
            <div><h4 className="font-semibold mb-2">Notes</h4><ul className="list-disc pl-6 text-muted-foreground space-y-1">{result.notes.map((s,i)=>(<li key={i}>{s}</li>))}</ul></div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Rates and bonds</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-duration-calculator" className="text-primary hover:underline">Bond Duration</a></h4><p className="text-sm text-muted-foreground">Key input for adjustment.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-convexity-calculator" className="text-primary hover:underline">Bond Convexity</a></h4><p className="text-sm text-muted-foreground">Understand curvature effects.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-price-calculator" className="text-primary hover:underline">Bond Price Calculator</a></h4><p className="text-sm text-muted-foreground">Price-yield relationships.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-yield-to-maturity-calculator" className="text-primary hover:underline">Yield to Maturity</a></h4><p className="text-sm text-muted-foreground">Yield inputs for forwards/futures.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Convexity Adjustment</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder for the guide content.</p><p>Explain difference between futures and forwards and the role of convexity.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Bond futures pricing</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">Why is there a convexity adjustment?</h4><p className="text-muted-foreground">Because futures are marked to market; daily settlement changes effective financing.</p></div>
          <div><h4 className="font-semibold mb-2">Does higher volatility increase adjustment?</h4><p className="text-muted-foreground">Yes—adjustment scales with the square of yield volatility.</p></div>
          <div><h4 className="font-semibold mb-2">Which duration should I use?</h4><p className="text-muted-foreground">Use the CTD bond’s duration adjusted by the conversion factor.</p></div>
          <div><h4 className="font-semibold mb-2">Is this exact?</h4><p className="text-muted-foreground">No—use exchange-specific models for production use.</p></div>
          <div><h4 className="font-semibold mb-2">What if conversion factor is 1?</h4><p className="text-muted-foreground">Then the CTD bond is close to the contract standard; adjustment still depends on duration and vol.</p></div>
          <div><h4 className="font-semibold mb-2">Should I use yield or price volatility?</h4><p className="text-muted-foreground">Use yield volatility in this approximation; price vol requires mapping via duration/convexity.</p></div>
          <div><h4 className="font-semibold mb-2">How sensitive is the result to duration?</h4><p className="text-muted-foreground">Highly—test a reasonable CTD range and monitor changes as the CTD shifts.</p></div>
          <div><h4 className="font-semibold mb-2">Does the adjustment apply to all futures?</h4><p className="text-muted-foreground">Conceptually yes for interest-rate futures; parameters and conventions differ by contract.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


