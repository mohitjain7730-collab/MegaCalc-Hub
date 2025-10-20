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
  fastingHours: z.number().min(12).max(168).optional(),
  bodyMassKg: z.number().min(30).max(200).optional(),
  activityLevel: z.enum(['rest','light','moderate']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaterFastingElectrolyteNeedsCalculator() {
  const [result, setResult] = useState<{ sodiumMg: number; potassiumMg: number; magnesiumMg: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { fastingHours: undefined, bodyMassKg: undefined, activityLevel: undefined } });

  const calculate = (v: FormValues) => {
    if (v.fastingHours == null || v.bodyMassKg == null || v.activityLevel == null) return null;
    const dailyNa = v.activityLevel === 'moderate' ? 3500 : v.activityLevel === 'light' ? 2500 : 2000;
    const dailyK = 2000;
    const dailyMg = 300;
    const days = v.fastingHours / 24;
    return { sodiumMg: Math.round(dailyNa * days), potassiumMg: Math.round(dailyK * days), magnesiumMg: Math.round(dailyMg * days) };
  };

  const interpret = (na: number) => {
    if (na > 7000) return 'High total sodium need over the fast—monitor blood pressure and hydration.';
    return 'Moderate electrolyte support recommended—consult your healthcare provider before fasting.';
  };

  const opinion = () => 'Electrolytes can reduce lightheadedness and fatigue; avoid extended fasts without medical guidance.';

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({ ...res, interpretation: interpret(res.sodiumMg), opinion: opinion() });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="fastingHours" render={({ field }) => (
              <FormItem>
                <FormLabel>Fasting Duration (hours)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 24" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bodyMassKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Mass (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 70" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="activityLevel" render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Level</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value as any)}>
                    <option value="">Select</option>
                    <option value="rest">Rest</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Electrolyte Needs</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Electrolyte Totals for Fast</CardTitle>
              </div>
              <CardDescription>Approximate sodium, potassium, and magnesium</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">Sodium: <span className="font-semibold text-foreground">{result.sodiumMg} mg</span></p>
              <p className="text-muted-foreground">Potassium: <span className="font-semibold text-foreground">{result.potassiumMg} mg</span></p>
              <p className="text-muted-foreground">Magnesium: <span className="font-semibold text-foreground">{result.magnesiumMg} mg</span></p>
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
          <AccordionTrigger>Complete Guide: Water Fasting & Electrolytes</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Medical supervision is recommended for fasts beyond 24–48 hours.</li>
              <li>Consider electrolyte supplementation to maintain well-being.</li>
              <li>Break the fast gently with simple, balanced foods.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/hydration-needs-calculator" className="text-primary underline">Hydration Needs</a></li>
              <li><a href="/category/health-fitness/intermittent-fasting-calculator" className="text-primary underline">Intermittent Fasting</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


