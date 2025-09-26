
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Average water usage in gallons
const waterUsageRates = {
  showerMinutes: 2.1, // per minute
  baths: 36, // per bath
  toiletFlushes: 1.6, // per flush (modern toilet)
  laundryLoads: 30, // per load
  dishwasherLoads: 6, // per load
};

const formSchema = z.object({
  people: z.number().int().positive(),
  showerMinutes: z.number().nonnegative().optional(),
  baths: z.number().int().nonnegative().optional(),
  toiletFlushes: z.number().int().nonnegative().optional(),
  laundryLoads: z.number().int().nonnegative().optional(),
  dishwasherLoads: z.number().int().nonnegative().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaterUsageEfficiencyCalculator() {
  const [result, setResult] = useState<{ daily: number; monthly: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      people: undefined,
      showerMinutes: undefined,
      baths: undefined,
      toiletFlushes: undefined,
      laundryLoads: undefined,
      dishwasherLoads: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const dailyShower = (values.showerMinutes || 0) * waterUsageRates.showerMinutes;
    const dailyBaths = ((values.baths || 0) / 7) * waterUsageRates.baths; // Weekly to daily
    const dailyToilet = (values.toiletFlushes || 0) * waterUsageRates.toiletFlushes;
    const dailyLaundry = ((values.laundryLoads || 0) / 7) * waterUsageRates.laundryLoads; // Weekly to daily
    const dailyDishwasher = ((values.dishwasherLoads || 0) / 7) * waterUsageRates.dishwasherLoads; // Weekly to daily

    const totalDaily = (dailyShower + dailyToilet) * values.people + dailyBaths + dailyLaundry + dailyDishwasher;

    setResult({ daily: totalDaily, monthly: totalDaily * 30 });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <CardDescription>Estimate your household's daily and monthly water consumption.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FormField control={form.control} name="people" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Number of People in Household</FormLabel><FormControl><Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="showerMinutes" render={({ field }) => (
                <FormItem><FormLabel>Avg. Daily Shower Time (mins/person)</FormLabel><FormControl><Input type="number" placeholder="e.g., 8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="toiletFlushes" render={({ field }) => (
                <FormItem><FormLabel>Avg. Daily Toilet Flushes (per person)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="baths" render={({ field }) => (
                <FormItem><FormLabel>Baths per Week (household)</FormLabel><FormControl><Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="laundryLoads" render={({ field }) => (
                <FormItem><FormLabel>Laundry Loads per Week (household)</FormLabel><FormControl><Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="dishwasherLoads" render={({ field }) => (
                <FormItem><FormLabel>Dishwasher Loads per Week (household)</FormLabel><FormControl><Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Water Usage</Button>
        </form>
      </Form>
      
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Droplets className="h-8 w-8 text-primary" /><CardTitle>Estimated Water Usage</CardTitle></div></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-muted-foreground">Daily Usage</p>
                        <p className="text-2xl font-bold">{result.daily.toFixed(0)} Gallons</p>
                    </div>
                     <div>
                        <p className="text-muted-foreground">Monthly Usage</p>
                        <p className="text-2xl font-bold">{result.monthly.toLocaleString(undefined, {maximumFractionDigits: 0})} Gallons</p>
                    </div>
                </div>
                 <CardDescription className='mt-4 text-center'>Average US person uses 82 gallons/day. Consider installing low-flow fixtures to reduce usage.</CardDescription>
            </CardContent>
        </Card>
      )}

      <Accordion type="single" collapsible className="w-full">
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <p>Enter the number of people in your household and the average daily or weekly frequency for common water-related activities.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How It Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
                <p>This calculator multiplies your activity frequencies by standard water consumption rates for each fixture (based on US EPA averages for modern, efficient appliances). It sums these to provide a total household consumption per day and then extrapolates that to a monthly figure.</p>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
