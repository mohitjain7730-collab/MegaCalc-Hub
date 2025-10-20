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
  fructansG: z.number().min(0).max(20).optional(),
  lactoseG: z.number().min(0).max(50).optional(),
  polyolsG: z.number().min(0).max(30).optional(),
  excessFructoseG: z.number().min(0).max(30).optional(),
  galactansG: z.number().min(0).max(20).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FODMAPLoadCalculator() {
  const [result, setResult] = useState<{ totalG: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { fructansG: undefined, lactoseG: undefined, polyolsG: undefined, excessFructoseG: undefined, galactansG: undefined } });

  const onSubmit = (v: FormValues) => {
    if ([v.fructansG, v.lactoseG, v.polyolsG, v.excessFructoseG, v.galactansG].some(x => x == null)) { setResult(null); return; }
    const total = (v.fructansG! + v.lactoseG! + v.polyolsG! + v.excessFructoseG! + v.galactansG!);
    const interpretation = total > 20 ? 'High FODMAP load—likely to trigger IBS symptoms in sensitive individuals.' : total > 10 ? 'Moderate load—monitor tolerance.' : 'Low load—less likely to provoke symptoms.';
    const opinion = 'Adjust one group at a time to identify triggers; work with a dietitian for reintroduction.';
    setResult({ totalG: Math.round(total * 10) / 10, interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <FormField control={form.control} name="fructansG" render={({ field }) => (
              <FormItem>
                <FormLabel>Fructans (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 3" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="lactoseG" render={({ field }) => (
              <FormItem>
                <FormLabel>Lactose (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 6" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="polyolsG" render={({ field }) => (
              <FormItem>
                <FormLabel>Polyols (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 2" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="excessFructoseG" render={({ field }) => (
              <FormItem>
                <FormLabel>Excess Fructose (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 4" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="galactansG" render={({ field }) => (
              <FormItem>
                <FormLabel>Galactans (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 1" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate FODMAP Load</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Total FODMAP Load</CardTitle>
              </div>
              <CardDescription>Sum of selected FODMAP groups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.totalG} g</p>
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
          <AccordionTrigger>Complete Guide: Managing FODMAPs</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Eliminate high-FODMAP groups short-term, then reintroduce systematically.</li>
              <li>Work with a dietitian for a sustainable plan.</li>
              <li>Track symptoms against specific groups, not total alone.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/glycemic-load-calculator" className="text-primary underline">Glycemic Load</a></li>
              <li><a href="/category/health-fitness/fiber-intake-calculator" className="text-primary underline">Fiber Intake</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


