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
  vo2AtSubmaxMlMin: z.number().min(500).max(8000).optional(),
  powerOutputWatts: z.number().min(20).max(600).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MitochondrialEfficiencyEstimator() {
  const [result, setResult] = useState<{ o2CostPerW: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { vo2AtSubmaxMlMin: undefined, powerOutputWatts: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.vo2AtSubmaxMlMin == null || v.powerOutputWatts == null) { setResult(null); return; }
    const o2PerW = v.vo2AtSubmaxMlMin / v.powerOutputWatts; // ml O2 per min per watt
    const interpretation = o2PerW < 10 ? 'High efficiency—lower O2 cost per watt.' : o2PerW < 15 ? 'Moderate efficiency.' : 'Lower efficiency—higher oxygen cost per watt.';
    const opinion = 'Improve with aerobic base, tempo training, and technique (economy).';
    setResult({ o2CostPerW: Math.round(o2PerW * 10) / 10, interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="vo2AtSubmaxMlMin" render={({ field }) => (
              <FormItem>
                <FormLabel>VO2 at Submax (ml/min)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 2200" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="powerOutputWatts" render={({ field }) => (
              <FormItem>
                <FormLabel>Power Output (W)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 200" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Efficiency</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Mitochondrial Efficiency</CardTitle>
              </div>
              <CardDescription>Oxygen cost per watt at submax</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.o2CostPerW} ml/min/W</p>
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
          <AccordionTrigger>Complete Guide: Mitochondrial Efficiency</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Base training improves mitochondrial density and efficiency.</li>
              <li>Tempo and threshold refine submax economy.</li>
              <li>Technique and equipment (e.g., bike fit) impact power economy.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/running-economy-calculator" className="text-primary underline">Running Economy</a></li>
              <li><a href="/category/health-fitness/critical-power-calculator" className="text-primary underline">Critical Power</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


