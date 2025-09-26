
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  sales: z.number().positive(),
  costBasis: z.number().nonnegative(),
  holdingPeriod: z.enum(['short', 'long']),
  taxRate: z.number().positive(),
}).refine(data => data.sales >= data.costBasis, {
    message: "Sales proceeds cannot be less than the cost basis for a gain.",
    path: ["sales"],
});

type FormValues = z.infer<typeof formSchema>;

export default function CryptoTaxLiabilityCalculator() {
  const [result, setResult] = useState<{ capitalGain: number, taxOwed: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sales: undefined,
      costBasis: undefined,
      holdingPeriod: 'short',
      taxRate: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const capitalGain = values.sales - values.costBasis;
    const taxOwed = capitalGain * (values.taxRate / 100);
    setResult({ capitalGain, taxOwed });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sales" render={({ field }) => (
                <FormItem><FormLabel>Total Crypto Sales (USD)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="costBasis" render={({ field }) => (
                <FormItem><FormLabel>Total Crypto Cost Basis (USD)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="holdingPeriod" render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Holding Period</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="short" /></FormControl>
                      <FormLabel className="font-normal">Short-Term (&lt; 1 year)</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="long" /></FormControl>
                      <FormLabel className="font-normal">Long-Term (&gt; 1 year)</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="taxRate" render={({ field }) => (
                <FormItem><FormLabel>Applicable Federal Tax Rate (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Tax</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Estimated Tax Liability</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-muted-foreground">Capital Gain</p>
                        <p className="text-2xl font-bold">${result.capitalGain.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Estimated Tax Owed</p>
                        <p className="text-2xl font-bold">${result.taxOwed.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                    </div>
                </div>
                <CardDescription className='mt-4 text-center'>This is an estimate for federal taxes only and does not account for state taxes or complex tax situations. Consult a tax professional.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator provides a basic estimate of your capital gains tax liability from selling cryptocurrency.</p>
                 <ol className="list-decimal list-inside space-y-1 pl-4">
                    <li><strong>Capital Gain:</strong> It subtracts your `Cost Basis` (what you paid) from your `Sales` proceeds to determine the taxable gain.</li>
                    <li><strong>Tax Owed:</strong> It multiplies this gain by the tax rate you provide.</li>
                </ol>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div><h4 className="font-semibold text-foreground">Total Crypto Sales</h4><p>The total amount in USD you received from selling your crypto.</p></div>
              <div><h4 className="font-semibold text-foreground">Total Crypto Cost Basis</h4><p>The original purchase price of the crypto you sold, plus any fees.</p></div>
              <div><h4 className="font-semibold text-foreground">Holding Period</h4><p>Short-term gains (held &lt;1 year) are taxed as ordinary income, while long-term gains (held &gt;1 year) are taxed at lower rates.</p></div>
              <div><h4 className="font-semibold text-foreground">Applicable Tax Rate</h4><p>For short-term gains, this is your ordinary income tax rate. For long-term gains, it's the capital gains rate (0%, 15%, or 20% in the US for 2023-2024, depending on your income).</p></div>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
