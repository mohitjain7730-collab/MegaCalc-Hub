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
  coffeeCupsPerDay: z.number().min(0).max(5).optional(),
  butterTbspPerCup: z.number().min(0).max(4).optional(),
  mctTbspPerCup: z.number().min(0).max(4).optional(),
  weeklyBaselineCalories: z.number().min(5000).max(50000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BulletproofCoffeeCalorieImpactCalculator() {
  const [result, setResult] = useState<{ dailyKcal: number; weeklyKcal: number; weeklyImpactPct: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { coffeeCupsPerDay: undefined, butterTbspPerCup: undefined, mctTbspPerCup: undefined, weeklyBaselineCalories: undefined } });

  const calculate = (v: FormValues) => {
    if (v.coffeeCupsPerDay == null || v.butterTbspPerCup == null || v.mctTbspPerCup == null || v.weeklyBaselineCalories == null) return null;
    // Approx kcal: butter ~100 kcal per tbsp, MCT ~115 kcal per tbsp
    const perCup = v.butterTbspPerCup * 100 + v.mctTbspPerCup * 115;
    const daily = perCup * v.coffeeCupsPerDay;
    const weekly = daily * 7;
    const impactPct = (weekly / v.weeklyBaselineCalories) * 100;
    return { daily, weekly, impactPct };
  };

  const interpret = (pct: number) => {
    if (pct >= 20) return 'Large weekly calorie contribution—may hinder fat loss unless adjusted.';
    if (pct >= 10) return 'Moderate impact—balance portions or activity to maintain goals.';
    return 'Small impact—likely manageable within most plans.';
  };

  const opinion = (pct: number) => {
    if (pct >= 20) return 'Reduce tablespoons per cup or number of cups; consider protein-inclusive breakfasts.';
    if (pct >= 10) return 'Limit to training days or halve butter/MCT amounts.';
    return 'Enjoy occasionally; prioritize whole-food meals for micronutrients and satiety.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({
      dailyKcal: Math.round(res.daily),
      weeklyKcal: Math.round(res.weekly),
      weeklyImpactPct: Math.round(res.impactPct * 10) / 10,
      interpretation: interpret(res.impactPct),
      opinion: opinion(res.impactPct),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="coffeeCupsPerDay" render={({ field }) => (
              <FormItem>
                <FormLabel>Cups per Day</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="butterTbspPerCup" render={({ field }) => (
              <FormItem>
                <FormLabel>Butter (tbsp per cup)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="mctTbspPerCup" render={({ field }) => (
              <FormItem>
                <FormLabel>MCT Oil (tbsp per cup)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="weeklyBaselineCalories" render={({ field }) => (
              <FormItem>
                <FormLabel>Weekly Baseline Calories</FormLabel>
                <FormControl>
                  <Input type="number" step="10" placeholder="e.g., 14000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
                <CardTitle>Calorie Impact</CardTitle>
              </div>
              <CardDescription>Daily and weekly totals from Bulletproof coffee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.dailyKcal} kcal/day</p>
              <p className="text-muted-foreground">{result.weeklyKcal} kcal/week ({result.weeklyImpactPct}% of weekly intake)</p>
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
          <AccordionTrigger>Complete Guide: Bulletproof Coffee & Diet Goals</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>High-fat coffee adds calories without protein or micronutrients.</li>
              <li>Better for low-appetite mornings on heavy training days.</li>
              <li>For fat loss, reduce added fats or replace with balanced meals.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs</a></li>
              <li><a href="/category/health-fitness/macro-ratio-calculator" className="text-primary underline">Macro Ratio</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


