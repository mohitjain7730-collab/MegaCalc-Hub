
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  riskFreeRate: z.number().nonnegative(),
  marketRiskPremium: z.number().positive(),
  beta: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DiscountRateCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskFreeRate: undefined,
      marketRiskPremium: undefined,
      beta: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { riskFreeRate, marketRiskPremium, beta } = values;
    const r = riskFreeRate + beta * marketRiskPremium;
    setResult(r);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate the discount rate using the Capital Asset Pricing Model (CAPM).</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="riskFreeRate" render={({ field }) => (
                <FormItem><FormLabel>Risk-Free Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 4.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="marketRiskPremium" render={({ field }) => (
                <FormItem><FormLabel>Market Risk Premium (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 6" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="beta" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Investment Beta (β)</FormLabel><FormControl><Input type="number" placeholder="e.g., 1.2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Discount Rate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Estimated Discount Rate</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">{result.toFixed(2)}%</p>
                <CardDescription className='mt-4 text-center'>This is the required rate of return for the investment, used for discounting future cash flows.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works (CAPM)</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>The Capital Asset Pricing Model (CAPM) describes the relationship between systematic risk and expected return for assets. This calculator uses the CAPM formula to find the required rate of return (or discount rate) for an investment.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>r = Rƒ + β(Rm - Rƒ)</p>
                 <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>Rƒ</strong> is the risk-free rate (e.g., yield on a government bond).</li>
                    <li><strong>β (Beta)</strong> is a measure of a stock's volatility in relation to the overall market. A beta of 1 means it moves with the market; >1 is more volatile; <1 is less volatile.</li>
                    <li><strong>(Rm - Rƒ)</strong> is the market risk premium, the excess return that investing in the market as a whole provides over the risk-free rate.</li>
                </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
