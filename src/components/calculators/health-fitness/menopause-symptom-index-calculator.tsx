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
  hotFlashes0to10: z.number().min(0).max(10).optional(),
  sleepDisturbance0to10: z.number().min(0).max(10).optional(),
  moodChanges0to10: z.number().min(0).max(10).optional(),
  vaginalDryness0to10: z.number().min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MenopauseSymptomIndexCalculator() {
  const [result, setResult] = useState<{ score: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { hotFlashes0to10: undefined, sleepDisturbance0to10: undefined, moodChanges0to10: undefined, vaginalDryness0to10: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.hotFlashes0to10 == null || v.sleepDisturbance0to10 == null || v.moodChanges0to10 == null || v.vaginalDryness0to10 == null) { setResult(null); return; }
    const score = v.hotFlashes0to10 + v.sleepDisturbance0to10 + v.moodChanges0to10 + v.vaginalDryness0to10;
    const interpretation = score >= 28 ? 'Severe menopausal symptoms likely impacting quality of life.' : score >= 16 ? 'Moderate symptoms—management strategies may help.' : 'Mild symptoms—monitor and address as needed.';
    const opinion = score >= 28 ? 'Discuss HRT or non-hormonal options with a clinician; prioritize sleep and stress care.' : score >= 16 ? 'Consider CBT, exercise, cooling strategies, and medical consultation.' : 'Maintain healthy routines; seek advice if symptoms worsen.';
    setResult({ score, interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="hotFlashes0to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Hot Flashes (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sleepDisturbance0to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Sleep Disturbance (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 6" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="moodChanges0to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Mood Changes (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="vaginalDryness0to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Vaginal Dryness (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 4" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Symptom Index</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Menopause Symptom Index</CardTitle>
              </div>
              <CardDescription>Composite symptom severity score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.score}</p>
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
          <AccordionTrigger>Complete Guide: Navigating Menopause</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Consider HRT or non-hormonal treatments with a clinician.</li>
              <li>Optimize sleep, exercise, and nutrition for symptom relief.</li>
              <li>Track symptoms to evaluate treatment response over time.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/sleep-efficiency-calculator" className="text-primary underline">Sleep Efficiency</a></li>
              <li><a href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary underline">Stress Self-Assessment</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


