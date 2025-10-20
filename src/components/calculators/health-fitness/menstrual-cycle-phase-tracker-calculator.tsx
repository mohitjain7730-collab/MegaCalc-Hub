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
  cycleLengthDays: z.number().min(21).max(40).optional(),
  daysSinceLastPeriodStart: z.number().min(0).max(60).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MenstrualCyclePhaseTrackerCalculator() {
  const [result, setResult] = useState<{ phase: string; ovulationDay: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { cycleLengthDays: undefined, daysSinceLastPeriodStart: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.cycleLengthDays == null || v.daysSinceLastPeriodStart == null) { setResult(null); return; }
    const luteal = 14; // typical assumption
    const ovulationDay = Math.max(10, v.cycleLengthDays - luteal);
    const d = v.daysSinceLastPeriodStart;
    let phase = 'Menstrual/Follicular';
    if (d >= ovulationDay - 2 && d <= ovulationDay + 1) phase = 'Ovulation Window';
    else if (d > ovulationDay + 1) phase = 'Luteal Phase';
    const interpretation = phase === 'Ovulation Window' ? 'Fertility likely highest around now.' : phase === 'Luteal Phase' ? 'Progesterone-dominant phase; temp may be elevated.' : 'Estrogen-rising follicular phase.';
    const opinion = 'Track several cycles to personalize predictions; consider LH tests and basal temperature for accuracy.';
    setResult({ phase, ovulationDay, interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="cycleLengthDays" render={({ field }) => (
              <FormItem>
                <FormLabel>Typical Cycle Length (days)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 28" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="daysSinceLastPeriodStart" render={({ field }) => (
              <FormItem>
                <FormLabel>Days Since Last Period Start</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 12" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Track Phase</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Cycle Phase</CardTitle>
              </div>
              <CardDescription>Estimated based on typical cycle length</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.phase}</p>
              <p className="text-muted-foreground">Estimated ovulation day: day {result.ovulationDay}</p>
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
          <AccordionTrigger>Complete Guide: Understanding Your Cycle</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Track symptoms and temperature to refine phase detection.</li>
              <li>Cycles vary month to month; averages improve accuracy.</li>
              <li>Consult a clinician for irregular cycles or concerns.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/fertility-ovulation-calculator" className="text-primary underline">Ovulation Calculator</a></li>
              <li><a href="/category/health-fitness/pms-symptom-score-calculator" className="text-primary underline">PMS Symptom Score</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


