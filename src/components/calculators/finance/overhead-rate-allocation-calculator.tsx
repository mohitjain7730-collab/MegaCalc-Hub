
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Factory } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  totalOverhead: z.number().positive(),
  totalAllocationBase: z.number().positive(),
  allocationBaseUnit: z.string().min(1, "Unit is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function OverheadRateAllocationCalculator() {
  const [result, setResult] = useState<{ rate: number; unit: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalOverhead: undefined,
      totalAllocationBase: undefined,
      allocationBaseUnit: 'machine hours',
    },
  });

  const onSubmit = (values: FormValues) => {
    const rate = values.totalOverhead / values.totalAllocationBase;
    setResult({ rate, unit: values.allocationBaseUnit });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="totalOverhead" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Estimated Overhead Costs ($)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="totalAllocationBase" render={({ field }) => (
              <FormItem>
                <FormLabel>Total Est. Allocation Base (e.g., hours)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="allocationBaseUnit" render={({ field }) => (
                <FormItem className='md:col-span-2'>
                    <FormLabel>Unit for Allocation Base</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., machine hours, direct labor hours" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Rate</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Factory className="h-8 w-8 text-primary" /><CardTitle>Predetermined Overhead Rate</CardTitle></div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-center">${result.rate.toFixed(2)} per {result.unit}</p>
            <CardDescription className='mt-4 text-center'>This rate should be used to apply overhead costs to products or jobs based on their consumption of the allocation base.</CardDescription>
          </CardContent>
        </Card>
      )}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
          <AccordionTrigger>How It Works</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">The calculator divides total estimated overhead costs by the total estimated allocation base to determine a predetermined overhead rate. This rate allows for a systematic way to apply indirect costs to cost objects (like products) throughout an accounting period.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
