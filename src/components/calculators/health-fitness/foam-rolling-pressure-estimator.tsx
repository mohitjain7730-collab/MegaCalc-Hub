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
  bodyWeightKg: z.number().positive('Enter body weight').optional(),
  contactAreaCm2: z.number().min(5).max(500).optional(),
  weightDistributionPercent: z.number().min(10).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FoamRollingPressureEstimator() {
  const [result, setResult] = useState<{ pressureKpa: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { bodyWeightKg: undefined, contactAreaCm2: undefined, weightDistributionPercent: undefined } });

  const calculate = (v: FormValues) => {
    if (v.bodyWeightKg == null || v.contactAreaCm2 == null || v.weightDistributionPercent == null) return null;
    const forceN = v.bodyWeightKg * 9.80665 * (v.weightDistributionPercent / 100);
    const areaM2 = (v.contactAreaCm2 / 10000);
    const pressurePa = forceN / areaM2;
    const kpa = pressurePa / 1000;
    return Math.round(kpa * 10) / 10;
  };

  const interpret = (kpa: number) => {
    if (kpa > 50) return 'High pressure—limit duration and monitor discomfort.';
    if (kpa >= 20) return 'Moderate pressure—common for trigger point work.';
    return 'Light pressure—use for warm-up and gentle tissue prep.';
  };

  const opinion = (kpa: number) => {
    if (kpa > 50) return 'Reduce load or increase contact area to lower pressure.';
    if (kpa >= 20) return 'Spend 30–60s per spot; avoid pain over 6/10.';
    return 'Use sweeping passes 1–2 minutes per muscle group.';
  };

  const onSubmit = (values: FormValues) => {
    const kpa = calculate(values);
    if (kpa == null) { setResult(null); return; }
    setResult({ pressureKpa: kpa, interpretation: interpret(kpa), opinion: opinion(kpa) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="bodyWeightKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Weight (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 70" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contactAreaCm2" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Area (cm²)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 50" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="weightDistributionPercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Weight on Roller (%)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 40" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Pressure</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Foam Rolling Pressure</CardTitle>
              </div>
              <CardDescription>Approximate applied pressure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.pressureKpa} kPa</p>
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
          <AccordionTrigger>Complete Guide: Foam Rolling Dos & Don’ts</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Aim for mild discomfort, not sharp pain.</li>
              <li>Breathe slowly; avoid tensing against the pressure.</li>
              <li>Limit high-pressure points to 60 seconds.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/muscle-soreness-recovery-estimator" className="text-primary underline">Muscle Soreness Recovery</a></li>
              <li><a href="/category/health-fitness/training-stress-score-calculator" className="text-primary underline">Training Stress Score</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


