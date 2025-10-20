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
  cheatMealCalories: z.number().min(100).max(5000).optional(),
  weeklyTargetCalories: z.number().min(5000).max(50000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CheatMealImpactOnWeeklyCaloriesCalculator() {
  const [result, setResult] = useState<{ impactPct: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { cheatMealCalories: undefined, weeklyTargetCalories: undefined } });

  const onSubmit = (v: FormValues) => {
    if (v.cheatMealCalories == null || v.weeklyTargetCalories == null) { setResult(null); return; }
    const impact = (v.cheatMealCalories / v.weeklyTargetCalories) * 100;
    const interpretation = impact >= 20 ? 'Large weekly impact—may erase deficit or cause surplus.' : impact >= 10 ? 'Moderate impact—adjust other meals or activity.' : 'Small impact—manageable in most plans.';
    const opinion = impact >= 20 ? 'Scale portion size or frequency; pair with high-protein meals.' : impact >= 10 ? 'Offset with lighter meals or extra activity that week.' : 'Enjoy in moderation; keep protein and fiber high elsewhere.';
    setResult({ impactPct: Math.round(impact * 10) / 10, interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="cheatMealCalories" render={({ field }) => (
              <FormItem>
                <FormLabel>Cheat Meal Calories</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 1200" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="weeklyTargetCalories" render={({ field }) => (
              <FormItem>
                <FormLabel>Weekly Target Calories</FormLabel>
                <FormControl>
                  <Input type="number" step="50" placeholder="e.g., 14000" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Impact</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Weekly Impact</CardTitle>
              </div>
              <CardDescription>Effect of one cheat meal on weekly calories</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.impactPct}%</p>
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
          <AccordionTrigger>Complete Guide: Fitting Cheat Meals Into a Diet</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Keep protein high and fiber-rich sides to boost satiety.</li>
              <li>Plan lighter meals around high-calorie events.</li>
              <li>Focus on weekly averages, not single-day perfection.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs</a></li>
              <li><a href="/category/health-fitness/calorie-surplus-calculator" className="text-primary underline">Calorie Surplus</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


