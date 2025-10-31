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
  cleanPrice: z.number().min(0).optional(),
  modifiedDuration: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DollarDurationCalculator() {
  const [result, setResult] = useState<{ dollarDuration: number; interpretation: string; suggestions: string[] } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { cleanPrice: undefined as unknown as number, modifiedDuration: undefined as unknown as number } });

  const onSubmit = (v: FormValues) => {
    if (v.cleanPrice === undefined || v.modifiedDuration === undefined) { setResult(null); return; }
    const dd = v.modifiedDuration * v.cleanPrice; // per 1% move
    const interpretation = 'Dollar price change for a 1% (100 bps) parallel shift in yield.';
    setResult({ dollarDuration: dd, interpretation, suggestions: ['Use dollar duration to size macro hedges.', 'Divide dollar duration by 100 to approximate PVBP.', 'Update after price/curve moves to keep hedges aligned.', 'Combine with convexity for larger expected moves.'] });
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
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Dollar Duration Calculator</CardTitle>
          <CardDescription>Compute duration × price to estimate dollar change for a 1% yield move.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="cleanPrice" render={({ field }) => (<FormItem><FormLabel>Clean Price</FormLabel><FormControl>{num('e.g., 100.25', field)}</FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="modifiedDuration" render={({ field }) => (<FormItem><FormLabel>Modified Duration (years)</FormLabel><FormControl>{num('e.g., 6.2', field)}</FormControl><FormMessage /></FormItem>)} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Results & Insights</CardTitle><CardDescription>Dollar change per 1% move</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Dollar Duration</p><p className="text-2xl font-bold">{result.dollarDuration.toFixed(4)}</p></div>
              <div className="p-4 border rounded-lg"><p className="text-sm text-muted-foreground">Interpretation</p><p className="font-medium">{result.interpretation}</p></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Calculators</CardTitle><CardDescription>Duration and risk</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/pvbp-calculator" className="text-primary hover:underline">PVBP Calculator</a></h4><p className="text-sm text-muted-foreground">Dollar value per bp.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-duration-calculator" className="text-primary hover:underline">Bond Duration</a></h4><p className="text-sm text-muted-foreground">Duration input.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/bond-convexity-calculator" className="text-primary hover:underline">Bond Convexity</a></h4><p className="text-sm text-muted-foreground">Curvature effects.</p></div>
            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"><h4 className="font-semibold mb-2"><a href="/category/finance/convexity-adjustment-bond-futures-calculator" className="text-primary hover:underline">Convexity Adjustment</a></h4><p className="text-sm text-muted-foreground">Futures vs forwards.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Complete Guide to Dollar Duration</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none"><p>Placeholder guide.</p><p>Show relation to PVBP and hedging.</p></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle><CardDescription>Dollar duration</CardDescription></CardHeader>
        <CardContent className="space-y-6">
          <div><h4 className="font-semibold mb-2">What is dollar duration?</h4><p className="text-muted-foreground">The dollar price change for a 1% parallel yield shift (duration × price).</p></div>
          <div><h4 className="font-semibold mb-2">How do I convert to PVBP?</h4><p className="text-muted-foreground">Divide dollar duration by 100 to get per-basis-point value.</p></div>
          <div><h4 className="font-semibold mb-2">Can I sum across bonds?</h4><p className="text-muted-foreground">Yes—sum dollar durations to estimate portfolio rate sensitivity.</p></div>
          <div><h4 className="font-semibold mb-2">Which duration to use?</h4><p className="text-muted-foreground">Modified duration for bullet bonds; effective duration for options/structures.</p></div>
          <div><h4 className="font-semibold mb-2">How often to update?</h4><p className="text-muted-foreground">Recalculate after significant rate or price moves.</p></div>
          <div><h4 className="font-semibold mb-2">Does yield level matter?</h4><p className="text-muted-foreground">Duration itself changes with yield; dollar duration reflects this via price.</p></div>
          <div><h4 className="font-semibold mb-2">Is sign important?</h4><p className="text-muted-foreground">Long bond positions have negative price change for yield rises (positive dollar duration magnitude).</p></div>
          <div><h4 className="font-semibold mb-2">What about curve shifts?</h4><p className="text-muted-foreground">Dollar duration assumes parallel moves; for key-rate risk, use key-rate durations.</p></div>
          <div><h4 className="font-semibold mb-2">How does convexity help?</h4><p className="text-muted-foreground">Convexity refines estimates for larger moves beyond linear duration.</p></div>
          <div><h4 className="font-semibold mb-2">Units?</h4><p className="text-muted-foreground">Dollars (or local currency) per 1% change in yield.</p></div>
        </CardContent>
      </Card>
    </div>
  );
}


