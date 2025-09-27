
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

const cashFlowSchema = z.object({ value: z.number().optional() });

const formSchema = z.object({
  discountRate: z.number().positive(),
  cashFlows: z.array(cashFlowSchema).min(1, "At least one cash flow is required."),
  terminalValue: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DcfCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      discountRate: undefined,
      cashFlows: [{ value: undefined }],
      terminalValue: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "cashFlows"
  });

  const onSubmit = (values: FormValues) => {
    const { discountRate, cashFlows, terminalValue } = values;
    const r = discountRate / 100;
    
    let dcf = 0;
    cashFlows.forEach((cf, t) => {
      dcf += (cf.value || 0) / Math.pow(1 + r, t + 1);
    });
    
    const terminalValuePV = terminalValue / Math.pow(1 + r, cashFlows.length);
    dcf += terminalValuePV;

    setResult(dcf);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="discountRate" render={({ field }) => (
            <FormItem><FormLabel>Discount Rate (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
          )} />
          
          <Card>
            <CardHeader><CardTitle>Projected Free Cash Flows</CardTitle></CardHeader>
            <CardContent>
              {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2 mb-2">
                      <FormLabel className='w-24'>Year {index + 1}:</FormLabel>
                      <FormField control={form.control} name={`cashFlows.${index}.value`} render={({ field }) => (
                          <FormItem className="flex-grow"><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                      {fields.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><XCircle className="h-5 w-5 text-destructive" /></Button>}
                  </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ value: undefined })}><PlusCircle className="mr-2 h-4 w-4" /> Add Year</Button>
            </CardContent>
          </Card>
           <FormField control={form.control} name="terminalValue" render={({ field }) => (
            <FormItem><FormLabel>Terminal Value</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
          )} />

          <Button type="submit">Calculate DCF</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Discounted Cash Flow (DCF) Value</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                <CardDescription className='mt-4 text-center'>This is the estimated intrinsic value of the investment based on its future cash flows.</CardDescription>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>A DCF analysis forecasts a company's future free cash flow and discounts it to arrive at a present value estimate. The calculator discounts each projected cash flow to its present value using your specified discount rate. It also discounts the 'Terminal Value' (the value of the business beyond the forecast period) and adds it to the sum of the discounted cash flows to arrive at the total intrinsic value.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
