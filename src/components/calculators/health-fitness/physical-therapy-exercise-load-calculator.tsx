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
  oneRepMaxEstimateKg: z.number().positive('Enter 1RM estimate').optional(),
  painScale0to10: z.number().min(0).max(10).optional(),
  rehabPhase: z.enum(['acute','subacute','late']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PhysicalTherapyExerciseLoadCalculator() {
  const [result, setResult] = useState<{ loadKg: number; reps: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { oneRepMaxEstimateKg: undefined, painScale0to10: undefined, rehabPhase: undefined } });

  const calculate = (v: FormValues) => {
    if (v.oneRepMaxEstimateKg == null || v.painScale0to10 == null || v.rehabPhase == null) return null;
    let percent = v.rehabPhase === 'acute' ? 0.3 : v.rehabPhase === 'subacute' ? 0.5 : 0.7;
    percent -= (v.painScale0to10 / 10) * 0.1; // reduce for pain
    percent = Math.max(0.2, percent);
    const loadKg = v.oneRepMaxEstimateKg * percent;
    const reps = v.rehabPhase === 'acute' ? 15 : v.rehabPhase === 'subacute' ? 12 : 8;
    return { loadKg, reps };
  };

  const interpret = (load: number) => {
    if (load < 10) return 'Very light therapeutic load emphasizing tissue tolerance and technique.';
    if (load <= 40) return 'Light to moderate load to rebuild capacity safely.';
    return 'Moderate load for late-stage rehab and return-to-function.';
  };

  const opinion = (reps: number) => {
    if (reps >= 12) return 'Prioritize controlled tempo, full ROM, and pain below 3/10.';
    return 'Emphasize strength with good form; progress gradually maintaining pain below 2–3/10.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({ loadKg: Math.round(res.loadKg * 10) / 10, reps: res.reps, interpretation: interpret(res.loadKg), opinion: opinion(res.reps) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="oneRepMaxEstimateKg" render={({ field }) => (
              <FormItem>
                <FormLabel>1RM Estimate (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" placeholder="Enter 1RM" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="painScale0to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Pain (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="rehabPhase" render={({ field }) => (
              <FormItem>
                <FormLabel>Rehab Phase</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as any)}>
                    <option value="">Select phase</option>
                    <option value="acute">Acute</option>
                    <option value="subacute">Subacute</option>
                    <option value="late">Late</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Exercise Load</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Therapeutic Load & Reps</CardTitle>
              </div>
              <CardDescription>Guidance for resistance in rehab</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.loadKg} kg</p>
              <p className="text-muted-foreground">Suggested reps: {result.reps}</p>
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
          <AccordionTrigger>Complete Guide: Loading in Physical Therapy</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Keep pain under control and monitor next-day response.</li>
              <li>Progress one variable at a time: load, volume, or complexity.</li>
              <li>Emphasize tempo, control, and range of motion.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/range-of-motion-progress-calculator" className="text-primary underline">Range of Motion Progress</a></li>
              <li><a href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary underline">One Rep Max</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


