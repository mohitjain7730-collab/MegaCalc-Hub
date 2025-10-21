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
  femaleAge: z.number().min(18).max(50).optional(),
  cycleRegularity: z.enum(['regular','irregular']).optional(),
  daysIntercourseAroundOvulation: z.number().min(0).max(7).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConceptionProbabilityPerCycleCalculator() {
  const [result, setResult] = useState<{ probabilityPercent: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { femaleAge: undefined, cycleRegularity: undefined, daysIntercourseAroundOvulation: undefined } });

  const baseByAge = (age: number) => {
    if (age < 30) return 25;
    if (age < 35) return 20;
    if (age < 40) return 15;
    return 8;
  };

  const calculate = (v: FormValues) => {
    if (v.femaleAge == null || v.cycleRegularity == null || v.daysIntercourseAroundOvulation == null) return null;
    let prob = baseByAge(v.femaleAge);
    if (v.cycleRegularity === 'irregular') prob *= 0.8;
    const timingFactor = 1 + Math.min(3, v.daysIntercourseAroundOvulation) * 0.1;
    prob *= timingFactor;
    return Math.max(1, Math.min(60, prob));
  };

  const interpret = (p: number) => {
    if (p >= 30) return 'Higher-than-average chance per cycle with favorable timing.';
    if (p >= 15) return 'Typical probability per cycle; consistent timing helps.';
    return 'Lower probability per cycle—optimize timing and consider consultation if trying &gt;12 months.';
  };

  const opinion = (p: number) => {
    if (p >= 30) return 'Keep tracking ovulation windows and maintain healthy lifestyle habits.';
    if (p >= 15) return 'Use ovulation predictors and schedule intercourse in the fertile window.';
    return 'Consult a specialist to evaluate ovulation, semen analysis, and cycle regulation options.';
  };

  const onSubmit = (values: FormValues) => {
    const p = calculate(values);
    if (p == null) { setResult(null); return; }
    setResult({ probabilityPercent: Math.round(p * 10) / 10, interpretation: interpret(p), opinion: opinion(p) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="femaleAge" render={({ field }) => (
              <FormItem>
                <FormLabel>Female Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 32" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="cycleRegularity" render={({ field }) => (
              <FormItem>
                <FormLabel>Cycle Regularity</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as any)}>
                    <option value="">Select</option>
                    <option value="regular">Regular</option>
                    <option value="irregular">Irregular</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="daysIntercourseAroundOvulation" render={({ field }) => (
              <FormItem>
                <FormLabel>Days with Intercourse in Fertile Window</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Conception Probability</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Per-Cycle Conception Probability</CardTitle>
              </div>
              <CardDescription>Approximate chance this cycle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.probabilityPercent}%</p>
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
          <AccordionTrigger>Complete Guide: Maximizing Conception Chances</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Track ovulation with LH kits or BBT.</li>
              <li>Target intercourse in the 5-day fertile window before ovulation.</li>
              <li>Maintain healthy BMI, limit alcohol, and manage stress.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/fertility-ovulation-calculator" className="text-primary underline">Fertility & Ovulation Calculator</a></li>
              <li><a href="/category/health-fitness/due-date-calculator" className="text-primary underline">Due Date Calculator</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


