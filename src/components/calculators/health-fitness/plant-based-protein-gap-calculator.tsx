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
  bodyMassKg: z.number().min(30).max(200).optional(),
  targetProteinGPerKg: z.number().min(0.6).max(2.5).optional(),
  currentProteinIntakeG: z.number().min(0).max(300).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PlantBasedProteinGapCalculator() {
  const [result, setResult] = useState<{ targetG: number; gapG: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { bodyMassKg: undefined, targetProteinGPerKg: undefined, currentProteinIntakeG: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.bodyMassKg == null || v.targetProteinGPerKg == null || v.currentProteinIntakeG == null) { setResult(null); return; }
    const target = v.bodyMassKg * v.targetProteinGPerKg;
    const gap = Math.max(0, target - v.currentProteinIntakeG);
    const interpretation = gap === 0 ? 'You are meeting your protein target.' : 'Protein below target—consider boosting intake.';
    const opinion = 'Use higher-protein plant foods (tofu, tempeh, seitan, legumes) and distribute across meals.';
    setResult({ targetG: Math.round(target), gapG: Math.round(gap), interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="bodyMassKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Mass (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 70" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="targetProteinGPerKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Target Protein (g/kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 1.6" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="currentProteinIntakeG" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Protein (g/day)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 90" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Protein Gap</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Protein Target & Gap</CardTitle>
              </div>
              <CardDescription>Estimated daily protein needs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">Target: <span className="font-semibold text-foreground">{result.targetG} g/day</span></p>
              <p className="text-muted-foreground">Gap: <span className="font-semibold text-foreground">{result.gapG} g/day</span></p>
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
          <AccordionTrigger>Complete Guide: Hitting Plant-Based Protein Targets</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Include a protein source in every meal and snack.</li>
              <li>Use soy, seitan, legumes, and fortified products strategically.</li>
              <li>Consider supplementation if needed to close the gap.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake</a></li>
              <li><a href="/category/health-fitness/macro-ratio-calculator" className="text-primary underline">Macro Ratio</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


