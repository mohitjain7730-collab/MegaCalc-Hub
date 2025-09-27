
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
  payment: z.number().positive(),
  rate: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PerpetuityCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment: undefined,
      rate: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { payment, rate } = values;
    const r = rate / 100;
    const pv = payment / r;
    setResult(pv);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="payment" render={({ field }) => (
                <FormItem><FormLabel>Annual Payment (C) in USD</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rate" render={({ field }) => (
                <FormItem><FormLabel>Required Rate of Return (r) %</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate PV</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Present Value of Perpetuity</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>This is the total value today of an infinite stream of equal payments.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>A perpetuity is a type of annuity that provides an infinite stream of equal payments. It's a theoretical concept but is used in finance to value assets with indefinite cash flows, like some preferred stocks.</p>
                <p className='font-mono p-4 bg-muted rounded-md'>PV = C / r</p>
                <p>The formula is simple: the Present Value (PV) is the annual cash payment (C) divided by the discount rate (r).</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_valuingsecurities" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. SEC – Valuing Securities: Perpetuities</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
