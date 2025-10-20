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
  twitchTestTimeToPeakMs: z.number().min(10).max(200).optional(),
  fatigueIndexPercentDrop: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MuscleFiberTypeRatioCalculator() {
  const [result, setResult] = useState<{ typeIpercent: number; typeIIpercent: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { twitchTestTimeToPeakMs: undefined, fatigueIndexPercentDrop: undefined } });

  const calculate = (v: FormValues) => {
    if (v.twitchTestTimeToPeakMs == null || v.fatigueIndexPercentDrop == null) return null;
    // Heuristic: slower time-to-peak and lower fatigue drop -> more Type I
    const speedFactor = Math.max(0, Math.min(1, (v.twitchTestTimeToPeakMs - 40) / 100));
    const fatigueFactor = 1 - v.fatigueIndexPercentDrop / 100;
    let typeI = 50 + (speedFactor * 25) + (fatigueFactor * 25) - 25; // center around 50
    typeI = Math.max(20, Math.min(80, typeI));
    const typeII = 100 - typeI;
    return { typeI, typeII };
  };

  const interpret = (typeI: number) => {
    if (typeI >= 60) return 'Endurance-leaning profile with higher Type I proportion.';
    if (typeI <= 40) return 'Power-leaning profile with higher Type II proportion.';
    return 'Mixed fiber profile—balanced endurance and power potential.';
  };

  const opinion = (typeI: number) => {
    if (typeI >= 60) return 'Emphasize tempo and long intervals; maintain strength to support power.';
    if (typeI <= 40) return 'Leverage sprints and heavy lifting; add aerobic base for recovery.';
    return 'Combine aerobic base with strength and speed work for versatility.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({ typeIpercent: Math.round(res.typeI), typeIIpercent: Math.round(res.typeII), interpretation: interpret(res.typeI), opinion: opinion(res.typeI) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="twitchTestTimeToPeakMs" render={({ field }) => (
              <FormItem>
                <FormLabel>Time-to-Peak Force (ms)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 80" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="fatigueIndexPercentDrop" render={({ field }) => (
              <FormItem>
                <FormLabel>Fatigue Index (% drop over set)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 35" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Fiber Ratio</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Muscle Fiber Composition</CardTitle>
              </div>
              <CardDescription>Estimated proportion of Type I vs Type II</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">Type I: {result.typeIpercent}%</p>
              <p className="text-muted-foreground">Type II: {result.typeIIpercent}%</p>
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
          <AccordionTrigger>Complete Guide: Muscle Fiber Types</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Type I: fatigue-resistant, oxidative; Type II: powerful, glycolytic.</li>
              <li>Training can shift characteristics, though genetics set baselines.</li>
              <li>Program balance based on goals and observed response.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary underline">One Rep Max</a></li>
              <li><a href="/category/health-fitness/anaerobic-threshold-calculator" className="text-primary underline">Anaerobic Threshold</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


