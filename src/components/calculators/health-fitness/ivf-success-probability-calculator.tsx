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
  femaleAge: z.number().min(20).max(50).optional(),
  previousIVFCycles: z.number().min(0).max(10).optional(),
  embryoQuality: z.enum(['poor','fair','good']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function IVFSuccessProbabilityCalculator() {
  const [result, setResult] = useState<{ successPercent: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { femaleAge: undefined, previousIVFCycles: undefined, embryoQuality: undefined } });

  const baseByAge = (age: number) => {
    if (age < 35) return 45;
    if (age < 38) return 35;
    if (age < 41) return 25;
    if (age < 43) return 15;
    return 8;
  };

  const calculate = (v: FormValues) => {
    if (v.femaleAge == null || v.previousIVFCycles == null || v.embryoQuality == null) return null;
    let p = baseByAge(v.femaleAge);
    if (v.embryoQuality === 'good') p *= 1.2; else if (v.embryoQuality === 'poor') p *= 0.7;
    if (v.previousIVFCycles >= 2) p *= 0.85;
    return Math.max(3, Math.min(70, p));
  };

  const interpret = (p: number) => {
    if (p >= 40) return 'Favorable success likelihood this cycle.';
    if (p >= 20) return 'Moderate likelihood; outcomes vary by clinic and protocol.';
    return 'Lower likelihood; discuss protocol optimization and adjunct options with your clinic.';
  };

  const opinion = (p: number) => {
    if (p >= 40) return 'Consider single embryo transfer and lifestyle optimization.';
    if (p >= 20) return 'Review stimulation protocol and lab quality; optimize sleep and nutrition.';
    return 'Discuss PGT, donor options, or alternative strategies with your provider.';
  };

  const onSubmit = (values: FormValues) => {
    const p = calculate(values);
    if (p == null) { setResult(null); return; }
    setResult({ successPercent: Math.round(p * 10) / 10, interpretation: interpret(p), opinion: opinion(p) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="femaleAge" render={({ field }) => (
              <FormItem>
                <FormLabel>Female Age (years)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 34" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="previousIVFCycles" render={({ field }) => (
              <FormItem>
                <FormLabel>Previous IVF Cycles</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="embryoQuality" render={({ field }) => (
              <FormItem>
                <FormLabel>Embryo Quality</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as any)}>
                    <option value="">Select</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate IVF Success</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>IVF Success Probability</CardTitle>
              </div>
              <CardDescription>Single cycle estimate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.successPercent}%</p>
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
          <AccordionTrigger>Complete Guide: Improving IVF Outcomes</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Clinic experience and lab quality strongly influence outcomes.</li>
              <li>Discuss stimulation protocols, embryo culture, and transfer strategy.</li>
              <li>Focus on sleep, nutrition, stress management, and avoiding smoking/alcohol.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/conception-probability-per-cycle-calculator" className="text-primary underline">Conception Probability</a></li>
              <li><a href="/category/health-fitness/fertility-ovulation-calculator" className="text-primary underline">Ovulation Calculator</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


