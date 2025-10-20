'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Zap } from 'lucide-react';

const formSchema = z.object({
  standardDrinks: z.number().min(0).max(20).optional(),
  metabolismRateMgPerDlPerHr: z.number().min(5).max(25).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AlcoholMetabolismTimeCalculator() {
  const [result, setResult] = useState<{ hoursToZero: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { standardDrinks: undefined, metabolismRateMgPerDlPerHr: undefined } });

  // Rough model: 1 standard drink raises BAC ~0.02% for average adult, then declines by metabolism rate per hour
  const calculate = (v: FormValues) => {
    if (v.standardDrinks == null || v.metabolismRateMgPerDlPerHr == null) return null;
    const bacStart = v.standardDrinks * 0.02 * 100; // mg/dL
    const hours = bacStart / v.metabolismRateMgPerDlPerHr;
    return Math.max(0, hours);
  };

  const interpret = (h: number) => {
    if (h >= 12) return 'Very long clearance time—plan safe transportation and hydration.';
    if (h >= 6) return 'Several hours to clear—avoid driving and intense training.';
    return 'Clearance in a few hours—still avoid operating vehicles until fully sober.';
  };

  const opinion = (h: number) => {
    if (h >= 6) return 'Hydrate, sleep, and avoid early-morning commitments requiring alertness.';
    return 'Rehydrate and refuel; avoid combining with sedatives.';
  };

  const onSubmit = (values: FormValues) => {
    const hours = calculate(values);
    if (hours == null) { setResult(null); return; }
    setResult({ hoursToZero: Math.round(hours * 10) / 10, interpretation: interpret(hours), opinion: opinion(hours) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="standardDrinks" render={({ field }) => (
              <FormItem>
                <FormLabel>Standard Drinks</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="metabolismRateMgPerDlPerHr" render={({ field }) => (
              <FormItem>
                <FormLabel>Metabolism Rate (mg/dL/hr)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Metabolism Time</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Estimated Time to Clear</CardTitle>
              </div>
              <CardDescription>Approximate time to metabolize alcohol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.hoursToZero} hours</p>
              <p className="text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Our Opinion</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{result.opinion}</p></CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide: Alcohol Metabolism & Safety</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Individual rates vary with sex, genetics, food, and liver health.</li>
              <li>Never drive until fully sober; use a designated driver or ride-share.</li>
              <li>Hydration and sleep aid recovery; avoid mixing with sedatives.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/alcohol-calorie-impact-calculator" className="text-primary underline">Alcohol Calorie Impact</a></li>
              <li><a href="/category/health-fitness/hydration-needs-calculator" className="text-primary underline">Hydration Needs</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


