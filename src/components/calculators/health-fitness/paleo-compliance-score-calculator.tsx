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
  servingsProteinVegFruitPerDay: z.number().min(0).max(30).optional(),
  servingsGrainsDairyLegumesPerDay: z.number().min(0).max(30).optional(),
  processedFoodServingsPerDay: z.number().min(0).max(20).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaleoComplianceScoreCalculator() {
  const [result, setResult] = useState<{ score: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { servingsProteinVegFruitPerDay: undefined, servingsGrainsDairyLegumesPerDay: undefined, processedFoodServingsPerDay: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.servingsProteinVegFruitPerDay == null || v.servingsGrainsDairyLegumesPerDay == null || v.processedFoodServingsPerDay == null) { setResult(null); return; }
    let score = v.servingsProteinVegFruitPerDay * 4 - v.servingsGrainsDairyLegumesPerDay * 2 - v.processedFoodServingsPerDay * 3;
    score = Math.max(0, Math.min(100, score));
    const interpretation = score >= 70 ? 'High paleo compliance.' : score >= 40 ? 'Moderate compliance.' : 'Low compliance.';
    const opinion = 'Aim for whole foods, protein, vegetables, fruits, and healthy fats while minimizing processed items.';
    setResult({ score: Math.round(score), interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="servingsProteinVegFruitPerDay" render={({ field }) => (
              <FormItem>
                <FormLabel>Protein/Veg/Fruit Servings</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 10" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="servingsGrainsDairyLegumesPerDay" render={({ field }) => (
              <FormItem>
                <FormLabel>Grains/Dairy/Legumes Servings</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 2" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="processedFoodServingsPerDay" render={({ field }) => (
              <FormItem>
                <FormLabel>Processed Food Servings</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 1" {...(field as any)} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Compliance Score</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Paleo Compliance Score</CardTitle>
              </div>
              <CardDescription>Heuristic diet adherence score</CardDescription>
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
          <AccordionTrigger>Complete Guide: Paleo Compliance</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Emphasize whole foods and minimize ultra-processed items.</li>
              <li>Personalize tolerance for dairy/legumes based on response.</li>
              <li>Prioritize nutrient density and adequate protein.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/macro-ratio-calculator" className="text-primary underline">Macro Ratio</a></li>
              <li><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Calorie Needs</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


