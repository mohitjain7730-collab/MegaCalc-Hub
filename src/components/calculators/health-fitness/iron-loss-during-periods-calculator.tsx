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
  periodDays: z.number().min(1).max(10).optional(),
  avgFlowMlPerDay: z.number().min(5).max(200).optional(),
  ironConcMgPerMl: z.number().min(0.2).max(1.5).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function IronLossDuringPeriodsCalculator() {
  const [result, setResult] = useState<{ totalIronMg: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { periodDays: undefined, avgFlowMlPerDay: undefined, ironConcMgPerMl: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.periodDays == null || v.avgFlowMlPerDay == null || v.ironConcMgPerMl == null) { setResult(null); return; }
    const totalIron = v.periodDays * v.avgFlowMlPerDay * v.ironConcMgPerMl;
    const interpretation = totalIron > 40 ? 'High cycle iron loss—risk for deficiency; consider evaluation.' : totalIron > 20 ? 'Moderate iron loss—monitor intake and symptoms.' : 'Lower iron loss—maintain balanced diet with iron.';
    const opinion = totalIron > 40 ? 'Increase iron-rich foods, consider supplements with medical advice.' : totalIron > 20 ? 'Include heme iron and vitamin C sources; monitor ferritin if symptomatic.' : 'Maintain varied diet; routine checks if fatigue occurs.';
    setResult({ totalIronMg: Math.round(totalIron), interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="periodDays" render={({ field }) => (
              <FormItem>
                <FormLabel>Period Length (days)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="avgFlowMlPerDay" render={({ field }) => (
              <FormItem>
                <FormLabel>Average Flow (ml/day)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 35" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ironConcMgPerMl" render={({ field }) => (
              <FormItem>
                <FormLabel>Iron Conc. (mg/ml)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="e.g., 0.5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Iron Loss</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Total Iron Lost</CardTitle>
              </div>
              <CardDescription>Estimated for this menstrual cycle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.totalIronMg} mg</p>
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
          <AccordionTrigger>Complete Guide: Iron & Menstruation</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Combine iron-rich foods with vitamin C to improve absorption.</li>
              <li>Limit tea/coffee with iron-rich meals to avoid absorption interference.</li>
              <li>Check ferritin if fatigue or hair loss occurs; consult a clinician.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/iron-intake-calculator" className="text-primary underline">Iron Intake Calculator</a></li>
              <li><a href="/category/health-fitness/blood-pressure-risk-calculator" className="text-primary underline">Blood Pressure Risk</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


