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
  dio: z.number().positive(),
  dso: z.number().positive(),
  dpo: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CashConversionCycleCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dio: undefined,
      dso: undefined,
      dpo: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(values.dio + values.dso - values.dpo);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="dio" render={({ field }) => (
              <FormItem><FormLabel>Days Inventory Outstanding (DIO)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dso" render={({ field }) => (
              <FormItem><FormLabel>Days Sales Outstanding (DSO)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dpo" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Days Payable Outstanding (DPO)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate CCC</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Cash Conversion Cycle (CCC)</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">{result.toFixed(2)} days</p>
            <CardDescription className='mt-4 text-center'>This is the average number of days the company's cash is tied up in the operating cycle.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Days Inventory Outstanding (DIO)</h4>
                    <p>The average number of days a company holds its inventory before selling it.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Days Sales Outstanding (DSO)</h4>
                    <p>The average number of days it takes a company to collect payment after a sale has been made.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Days Payable Outstanding (DPO)</h4>
                    <p>The average number of days it takes for a company to pay its suppliers.</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <p>The Cash Conversion Cycle (CCC) measures the efficiency with which a company manages its working capital. It represents the time (in days) it takes to convert its investments in inventory and other resources into cash from sales. A lower CCC is generally better, as it indicates the company has a shorter time lag between investing cash and receiving it back.</p>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                 <a href="https://www.sec.gov/oiea/investor-alerts-and-bulletins/ib_understanding-financial-ratios" target="_blank" rel="noopener noreferrer" className="text-primary underline">U.S. SEC – Financial Ratios Overview</a>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
