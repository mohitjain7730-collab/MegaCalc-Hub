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
  servings: z.number().min(1).max(10).optional(),
  caloriesPerServing: z.number().min(10).max(500).optional(),
  sugarPerServingG: z.number().min(0).max(80).optional(),
  fiberPerServingG: z.number().min(0).max(20).optional(),
  vitaminCmg: z.number().min(0).max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DetoxJuiceNutrientCalculator() {
  const [result, setResult] = useState<{ totalKcal: number; totalSugarG: number; totalFiberG: number; vitaminCmg: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { servings: undefined, caloriesPerServing: undefined, sugarPerServingG: undefined, fiberPerServingG: undefined, vitaminCmg: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.servings == null || v.caloriesPerServing == null || v.sugarPerServingG == null || v.fiberPerServingG == null || v.vitaminCmg == null) { setResult(null); return; }
    const totalKcal = v.servings * v.caloriesPerServing;
    const totalSugarG = v.servings * v.sugarPerServingG;
    const totalFiberG = v.servings * v.fiberPerServingG;
    const vitaminCmg = v.vitaminCmg;
    const interpretation = totalSugarG > 50 ? 'High sugar load—may spike blood glucose despite micronutrients.' : 'Balanced profile if fiber is adequate and sugar is modest.';
    const opinion = totalFiberG >= 8 ? 'Good fiber intake—supports satiety and digestion.' : 'Consider adding fiber (chia, veggies) or reducing fruit-heavy content.';
    setResult({ totalKcal, totalSugarG, totalFiberG, vitaminCmg, interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <FormField control={form.control} name="servings" render={({ field }) => (
              <FormItem>
                <FormLabel>Servings</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="caloriesPerServing" render={({ field }) => (
              <FormItem>
                <FormLabel>Calories/Serving</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 150" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sugarPerServingG" render={({ field }) => (
              <FormItem>
                <FormLabel>Sugar/Serving (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="fiberPerServingG" render={({ field }) => (
              <FormItem>
                <FormLabel>Fiber/Serving (g)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="vitaminCmg" render={({ field }) => (
              <FormItem>
                <FormLabel>Vitamin C (mg)</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 120" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Analyze Juice</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Detox Juice Nutrition</CardTitle>
              </div>
              <CardDescription>Total nutrients for your serving plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">Calories: <span className="font-semibold text-foreground">{result.totalKcal} kcal</span></p>
              <p className="text-muted-foreground">Sugar: <span className="font-semibold text-foreground">{result.totalSugarG} g</span></p>
              <p className="text-muted-foreground">Fiber: <span className="font-semibold text-foreground">{result.totalFiberG} g</span></p>
              <p className="text-muted-foreground">Vitamin C: <span className="font-semibold text-foreground">{result.vitaminCmg} mg</span></p>
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
          <AccordionTrigger>Complete Guide: Making Smarter Juices</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Favor vegetables over fruits to reduce sugar.</li>
              <li>Add fiber sources (chia, psyllium) or prefer smoothies over juices.</li>
              <li>Include protein elsewhere to balance blood sugar and satiety.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs</a></li>
              <li><a href="/category/health-fitness/glycemic-load-calculator" className="text-primary underline">Glycemic Load</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


