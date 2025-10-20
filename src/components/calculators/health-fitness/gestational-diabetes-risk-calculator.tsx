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
  maternalAge: z.number().min(15).max(55).optional(),
  prePregnancyBmi: z.number().min(15).max(50).optional(),
  familyHistoryDiabetes: z.enum(['yes','no']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GestationalDiabetesRiskCalculator() {
  const [result, setResult] = useState<{ riskPercent: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { maternalAge: undefined, prePregnancyBmi: undefined, familyHistoryDiabetes: undefined } });

  const calculate = (v: FormValues) => {
    if (v.maternalAge == null || v.prePregnancyBmi == null || v.familyHistoryDiabetes == null) return null;
    let risk = 5;
    if (v.maternalAge >= 35) risk += 4;
    if (v.prePregnancyBmi >= 30) risk += 6; else if (v.prePregnancyBmi >= 25) risk += 3;
    if (v.familyHistoryDiabetes === 'yes') risk += 4;
    return Math.min(40, risk);
  };

  const interpret = (r: number) => {
    if (r >= 20) return 'Elevated risk—discuss early screening and nutrition with your provider.';
    if (r >= 10) return 'Moderate risk—focus on balanced diet and activity; screen as advised.';
    return 'Lower risk—continue routine prenatal care and screening.';
  };

  const opinion = (r: number) => {
    if (r >= 20) return 'Prioritize fiber-rich foods, regular walking, and weight gain within guidelines.';
    if (r >= 10) return 'Monitor carbohydrate portions and maintain daily activity.';
    return 'Follow prenatal guidance; maintain healthy eating and light exercise.';
  };

  const onSubmit = (values: FormValues) => {
    const r = calculate(values);
    if (r == null) { setResult(null); return; }
    setResult({ riskPercent: r, interpretation: interpret(r), opinion: opinion(r) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="maternalAge" render={({ field }) => (
              <FormItem>
                <FormLabel>Maternal Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 33" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="prePregnancyBmi" render={({ field }) => (
              <FormItem>
                <FormLabel>Pre-pregnancy BMI</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 27.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="familyHistoryDiabetes" render={({ field }) => (
              <FormItem>
                <FormLabel>Family History of Diabetes</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as any)}>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Risk</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Gestational Diabetes Risk</CardTitle>
              </div>
              <CardDescription>Screening-oriented estimate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.riskPercent}%</p>
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
          <AccordionTrigger>Complete Guide: Managing Gestational Diabetes Risk</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Follow prenatal screening timelines recommended by your provider.</li>
              <li>Adopt balanced meals with fiber, lean proteins, and healthy fats.</li>
              <li>Walk daily and manage weight gain within guidelines.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/due-date-calculator" className="text-primary underline">Due Date Calculator</a></li>
              <li><a href="/category/health-fitness/pregnancy-weight-gain-calculator" className="text-primary underline">Pregnancy Weight Gain</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


