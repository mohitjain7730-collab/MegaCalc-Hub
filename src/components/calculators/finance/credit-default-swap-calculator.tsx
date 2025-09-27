
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const formSchema = z.object({
  pd: z.number().min(0).max(100),
  lgd: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreditDefaultSwapCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pd: undefined,
      lgd: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const spread = (values.pd / 100) * (values.lgd / 100);
    setResult(spread * 10000); // Convert to basis points
  };

  return (
    <div className="space-y-8">
       <Alert variant="destructive">
        <AlertTitle>Conceptual Tool Only</AlertTitle>
        <AlertDescription>This calculator uses a highly simplified formula for educational purposes. Real-world CDS pricing is far more complex, involving credit curves and recovery rate assumptions.</AlertDescription>
      </Alert>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="pd" render={({ field }) => (
                <FormItem><FormLabel>Annual Probability of Default (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="lgd" render={({ field }) => (
                <FormItem><FormLabel>Loss Given Default (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Spread</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Shield className="h-8 w-8 text-primary" /><CardTitle>Illustrative CDS Spread</CardTitle></div></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(0)} bps</p>
            <CardDescription className='mt-4 text-center'>The theoretical annual premium is {result.toFixed(0)} basis points, or {(result / 100).toFixed(2)}% of the notional amount.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Probability of Default (PD)</h4>
                    <p>An estimate of the likelihood that the debt issuer will default on its payments within a year. This is a complex value derived from credit ratings, market data, and financial analysis.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Loss Given Default (LGD)</h4>
                    <p>The percentage of the total exposure that will be lost if a default occurs. It is calculated as `100% - Recovery Rate`. For example, if bondholders are expected to recover 40% of their investment after a default, the LGD is 60%.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works (Conceptual)</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>A Credit Default Swap (CDS) is like an insurance policy against a bond default. This calculator demonstrates the basic principle behind its pricing.</p>
                <p className="mt-2 font-mono p-2 bg-muted rounded-md text-center">CDS Spread ≈ PD × LGD</p>
                <p className="mt-2">The annual premium (spread) that the buyer of protection must pay should be roughly equal to the expected loss on the bond for that year. The expected loss is the probability of the bad event happening (PD) multiplied by the financial impact if it does happen (LGD). The result is converted to basis points (bps), where 100 bps = 1%.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
