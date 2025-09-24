
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Example costs - these are highly simplified and not real-time
const costs = {
  vcpu_per_hour: 0.04, // e.g., $0.04 per vCPU per hour
  ram_gb_per_hour: 0.005, // e.g., $0.005 per GB RAM per hour
  storage_gb_per_month: 0.10, // e.g., $0.10 per GB per month
  bandwidth_gb_per_month: 0.09, // e.g., $0.09 per GB of egress
};

const formSchema = z.object({
  vcpus: z.number().int().nonnegative(),
  ram: z.number().nonnegative(),
  storage: z.number().nonnegative(),
  bandwidth: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CloudCostEstimator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        vcpus: undefined,
        ram: undefined,
        storage: undefined,
        bandwidth: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { vcpus, ram, storage, bandwidth } = values;
    const hoursInMonth = 730; // Average hours in a month

    const computeCost = (vcpus * costs.vcpu_per_hour * hoursInMonth) + (ram * costs.ram_gb_per_hour * hoursInMonth);
    const storageCost = storage * costs.storage_gb_per_month;
    const bandwidthCost = bandwidth * costs.bandwidth_gb_per_month;

    const totalCost = computeCost + storageCost + bandwidthCost;
    setResult(totalCost);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate your monthly cloud computing costs based on typical usage. Costs are illustrative.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="vcpus" render={({ field }) => (
                <FormItem><FormLabel>Number of vCPUs</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="ram" render={({ field }) => (
                <FormItem><FormLabel>RAM (GB)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="storage" render={({ field }) => (
                <FormItem><FormLabel>Storage (GB)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="bandwidth" render={({ field }) => (
                <FormItem><FormLabel>Egress Bandwidth (GB)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Cost</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Cloud className="h-8 w-8 text-primary" /><CardTitle>Estimated Monthly Cost</CardTitle></div></CardHeader>
            <CardContent>
                <p className="text-3xl font-bold text-center">${result.toFixed(2)}</p>
                <CardDescription className='mt-4 text-center'>This is a very rough estimate. Actual costs vary significantly between cloud providers, regions, and instance types. Use official provider calculators for accurate pricing.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                This tool uses pre-defined, illustrative costs for common cloud resources. It calculates the monthly compute cost (vCPU and RAM) based on hourly rates, then adds the monthly costs for storage and data transfer (egress bandwidth) to arrive at a total estimated monthly spend.
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
