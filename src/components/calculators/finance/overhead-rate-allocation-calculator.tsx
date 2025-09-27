
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
        <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Total Estimated Overhead Costs</h4>
                    <p>The sum of all indirect costs expected to be incurred in a production process for a given period (e.g., factory rent, utilities, supervisor salaries).</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Total Estimated Allocation Base</h4>
                    <p>The total expected quantity of the activity that drives overhead costs. Common bases include direct labor hours, machine hours, or direct material costs.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-foreground mb-1">Unit for Allocation Base</h4>
                    <p>The unit of measure for your allocation base (e.g., "hours", "dollars", "units").</p>
                </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator determines a predetermined overhead rate, which is a cornerstone of traditional job-order costing systems. This rate allows a company to apply indirect costs to products in a systematic and logical manner as they are being produced, rather than waiting until the end of an accounting period. The formula is a simple division:</p>
                <p className='mt-2 font-mono p-2 bg-muted rounded-md text-center'>Overhead Rate = Total Overhead Costs / Total Allocation Base</p>
                <p className="mt-2">Once calculated, this rate is used to apply overhead to a specific job by multiplying the rate by the actual amount of the allocation base consumed by that job.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
