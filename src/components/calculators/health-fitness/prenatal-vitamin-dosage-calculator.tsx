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
  folateMcg: z.number().min(0).max(2000).optional(),
  ironMg: z.number().min(0).max(100).optional(),
  vitaminDiu: z.number().min(0).max(6000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PrenatalVitaminDosageCalculator() {
  const [result, setResult] = useState<{ status: string; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { folateMcg: undefined, ironMg: undefined, vitaminDiu: undefined } });

  const interpret = (v: FormValues) => {
    const msgs: string[] = [];
    if (v.folateMcg != null) {
      if (v.folateMcg < 400) msgs.push('Folate below common prenatal target (~400–800 mcg).');
      else if (v.folateMcg > 1000) msgs.push('Folate above typical upper range; consult provider.');
      else msgs.push('Folate within typical prenatal range.');
    }
    if (v.ironMg != null) {
      if (v.ironMg < 27) msgs.push('Iron below typical prenatal target (~27 mg).');
      else if (v.ironMg > 45) msgs.push('Iron above upper limit; consult provider.');
      else msgs.push('Iron within common prenatal range.');
    }
    if (v.vitaminDiu != null) {
      if (v.vitaminDiu < 600) msgs.push('Vitamin D below common target (~600–2000 IU).');
      else if (v.vitaminDiu > 4000) msgs.push('Vitamin D high; confirm with labs and provider.');
      else msgs.push('Vitamin D within commonly recommended range.');
    }
    return msgs.join(' ');
  };

  const opinion = (v: FormValues) => {
    return 'Use a prenatal matching your provider’s guidance; confirm iron and vitamin D with labs when possible.';
  };

  const onSubmit = (values: FormValues) => {
    setResult({ status: 'Evaluated', interpretation: interpret(values), opinion: opinion(values) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="folateMcg" render={({ field }) => (
              <FormItem>
                <FormLabel>Folate (mcg)</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 600" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="ironMg" render={({ field }) => (
              <FormItem>
                <FormLabel>Iron (mg)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 27" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="vitaminDiu" render={({ field }) => (
              <FormItem>
                <FormLabel>Vitamin D (IU)</FormLabel>
                <FormControl>
                  <Input type="number" step="50" placeholder="e.g., 1000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Evaluate Dosage</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Prenatal Dosage Evaluation</CardTitle>
              </div>
              <CardDescription>Common guideline ranges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
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
          <AccordionTrigger>Complete Guide: Prenatal Vitamins</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Choose third-party tested products.</li>
              <li>Take with food; separate iron from calcium if sensitive.</li>
              <li>Confirm needs with provider, especially Vitamin D and iron.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/pregnancy-weight-gain-calculator" className="text-primary underline">Pregnancy Weight Gain</a></li>
              <li><a href="/category/health-fitness/iron-intake-calculator" className="text-primary underline">Iron Intake</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


