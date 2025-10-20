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
  maintenanceKcal: z.number().min(1200).max(5000).optional(),
  fastingDayKcal: z.number().min(200).max(1500).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function IntermittentFastingFiveTwoScheduleCalculator() {
  const [result, setResult] = useState<{ weeklyDeficit: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { maintenanceKcal: undefined, fastingDayKcal: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.maintenanceKcal == null || v.fastingDayKcal == null) { setResult(null); return; }
    const normalDays = 5 * v.maintenanceKcal;
    const fastDays = 2 * v.fastingDayKcal;
    const weeklyDeficit = 7 * v.maintenanceKcal - (normalDays + fastDays);
    const interpretation = weeklyDeficit > 0 ? 'Calorie deficit expected over the week.' : weeklyDeficit === 0 ? 'Maintenance balance over the week.' : 'Surplus over the week.';
    const opinion = 'Ensure protein and micronutrients on fasting days; adjust activity to tolerance.';
    setResult({ weeklyDeficit: Math.round(weeklyDeficit), interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="maintenanceKcal" render={({ field }) => (
              <FormItem>
                <FormLabel>Maintenance Calories (kcal/day)</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 2300" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="fastingDayKcal" render={({ field }) => (
              <FormItem>
                <FormLabel>Fasting Day Calories (kcal)</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 600" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Plan 5:2 Schedule</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Weekly Calorie Balance (5:2)</CardTitle>
              </div>
              <CardDescription>Two fasting days and five normal days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.weeklyDeficit} kcal/week</p>
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
          <AccordionTrigger>Complete Guide: Intermittent Fasting 5:2</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Focus on protein and vegetables on fasting days.</li>
              <li>Avoid hard training on fasting days; schedule recovery.</li>
              <li>Consult your clinician if you have medical conditions.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary underline">IF Time Window</a></li>
              <li><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Calorie Needs</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


