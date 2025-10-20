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
  sweatVolumeLiters: z.number().min(0.1).max(5).optional(),
  sodiumLostMg: z.number().min(100).max(20000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SweatSodiumConcentrationCalculator() {
  const [result, setResult] = useState<{ sodiumMgPerL: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { sweatVolumeLiters: undefined, sodiumLostMg: undefined } });

  const calculate = (v: FormValues) => {
    if (v.sweatVolumeLiters == null || v.sodiumLostMg == null) return null;
    const conc = v.sodiumLostMg / v.sweatVolumeLiters; // mg/L
    return Math.round(conc);
  };

  const interpret = (mgL: number) => {
    if (mgL >= 1500) return 'Very salty sweater—high sodium replacement may be needed.';
    if (mgL >= 800) return 'Moderate sodium loss—consider targeted electrolyte intake.';
    return 'Lower sodium loss—standard hydration strategies may suffice.';
  };

  const opinion = (mgL: number) => {
    if (mgL >= 1500) return 'Use high-sodium drinks/gels and monitor for cramping and heat stress.';
    if (mgL >= 800) return 'Include electrolytes during long/hot sessions; adjust to conditions.';
    return 'Focus on fluids; add light electrolytes as needed in heat.';
  };

  const onSubmit = (values: FormValues) => {
    const conc = calculate(values);
    if (conc == null) { setResult(null); return; }
    setResult({ sodiumMgPerL: conc, interpretation: interpret(conc), opinion: opinion(conc) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sweatVolumeLiters" render={({ field }) => (
              <FormItem>
                <FormLabel>Sweat Volume (L)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 1.2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sodiumLostMg" render={({ field }) => (
              <FormItem>
                <FormLabel>Sodium Lost (mg)</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 1200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Sodium Concentration</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Sweat Sodium Concentration</CardTitle>
              </div>
              <CardDescription>Calculated as mg per liter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.sodiumMgPerL} mg/L</p>
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
          <AccordionTrigger>Complete Guide: Hydration & Electrolytes</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Match fluids to sweat rate; add sodium in heat or long sessions.</li>
              <li>Test strategies in training before events.</li>
              <li>Monitor signs of dehydration and overhydration.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/hydration-sweat-rate-calculator" className="text-primary underline">Sweat Rate</a></li>
              <li><a href="/category/health-fitness/electrolyte-replacement-calculator" className="text-primary underline">Electrolyte Replacement</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


