
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, PlusCircle, XCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const cashFlowSchema = z.object({
  value: z.number().optional(),
});

const formSchema = z.object({
  discountRate: z.number().positive(),
  cashFlows: z.array(cashFlowSchema).min(1, "At least one cash flow is required."),
});

type FormValues = z.infer<typeof formSchema>;

export default function NpvCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountRate: undefined,
      cashFlows: [
        { value: undefined }, // Initial Investment (CF0)
        { value: undefined }, // CF1
        { value: undefined }, // CF2
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cashFlows"
  });

  const onSubmit = (values: FormValues) => {
    const { discountRate, cashFlows } = values;
    const r = discountRate / 100;
    let npv = 0;
    cashFlows.forEach((cf, t) => {
      npv += (cf.value || 0) / Math.pow(1 + r, t);
    });
    setResult(npv);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="discountRate" render={({ field }) => (
            <FormItem><FormLabel>Discount Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
          
          <Card>
              <CardHeader><CardTitle>Cash Flows</CardTitle><CardDescription>Enter the initial investment as a negative number (Year 0), followed by future cash flows.</CardDescription></CardHeader>
              <CardContent>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2 mb-2">
                        <FormLabel className='w-20'>Year {index}:</FormLabel>
                        <FormField control={form.control} name={`cashFlows.${index}.value`} render={({ field }) => (
                            <FormItem className="flex-grow"><FormControl><Input type="number" placeholder={`Cash Flow for Year ${index}`} {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                        )} />
                        {fields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>}
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Cash Flow</Button>
              </CardContent>
          </Card>

          <Button type="submit">Calculate NPV</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Net Present Value (NPV)</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>A positive NPV indicates the investment is expected to be profitable. A negative NPV suggests it may result in a net loss.</CardDescription>
            </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>NPV helps in determining whether an investment is worthwhile by translating all future cash flows into today's dollars. The calculator discounts each cash flow to its present value and sums them up. The initial investment (as a negative value) is included in the sum.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
