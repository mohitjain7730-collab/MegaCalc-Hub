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
  moodIrritability0to10: z.number().min(0).max(10).optional(),
  bloating0to10: z.number().min(0).max(10).optional(),
  cramps0to10: z.number().min(0).max(10).optional(),
  fatigue0to10: z.number().min(0).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PMSSymptomScoreCalculator() {
  const [result, setResult] = useState<{ score: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { moodIrritability0to10: undefined, bloating0to10: undefined, cramps0to10: undefined, fatigue0to10: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.moodIrritability0to10 == null || v.bloating0to10 == null || v.cramps0to10 == null || v.fatigue0to10 == null) { setResult(null); return; }
    const score = v.moodIrritability0to10 + v.bloating0to10 + v.cramps0to10 + v.fatigue0to10;
    const interpretation = score >= 28 ? 'Severe PMS symptoms affecting quality of life.' : score >= 16 ? 'Moderate PMS—consider management strategies.' : 'Mild PMS—track and manage triggers.';
    const opinion = score >= 28 ? 'Consult a clinician; consider CBT, nutrition, and medical options.' : score >= 16 ? 'Try magnesium, exercise, sleep; consider discussing options with a clinician.' : 'Use lifestyle strategies and tracking; seek help if symptoms worsen.';
    setResult({ score, interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="moodIrritability0to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Mood/Irritability (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 6" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bloating0to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Bloating (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="cramps0to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Cramps (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 4" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="fatigue0to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Fatigue (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 7" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate PMS Score</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>PMS Symptom Score</CardTitle>
              </div>
              <CardDescription>Sum of selected symptom severities</CardDescription>
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
          <AccordionTrigger>Complete Guide: Managing PMS</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Track symptoms and identify triggers (sleep, stress, diet).</li>
              <li>Consider magnesium, omega-3, exercise, and CBT strategies.</li>
              <li>Seek medical advice for severe or disruptive symptoms.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/menstrual-cycle-phase-tracker-calculator" className="text-primary underline">Cycle Phase Tracker</a></li>
              <li><a href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary underline">Stress Self-Assessment</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


