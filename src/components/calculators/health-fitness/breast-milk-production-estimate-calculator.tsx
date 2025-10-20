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
  infantAgeWeeks: z.number().min(0).max(52).optional(),
  pumpingSessionsPerDay: z.number().min(1).max(12).optional(),
  avgOutputPerSessionMl: z.number().min(5).max(400).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BreastMilkProductionEstimateCalculator() {
  const [result, setResult] = useState<{ dailyMl: number; weeklyMl: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { infantAgeWeeks: undefined, pumpingSessionsPerDay: undefined, avgOutputPerSessionMl: undefined } });

  const calculate = (v: FormValues) => {
    if (v.infantAgeWeeks == null || v.pumpingSessionsPerDay == null || v.avgOutputPerSessionMl == null) return null;
    // Simple model: daily = sessions * avg per session. Early weeks multiplier +10% at 4–12w typical establishment range.
    const establishmentFactor = v.infantAgeWeeks >= 4 && v.infantAgeWeeks <= 12 ? 1.1 : 1.0;
    const dailyMl = v.pumpingSessionsPerDay * v.avgOutputPerSessionMl * establishmentFactor;
    const weeklyMl = dailyMl * 7;
    return { dailyMl, weeklyMl };
  };

  const interpret = (daily: number) => {
    if (daily >= 750) return 'High daily output—may support exclusive pumping depending on infant needs.';
    if (daily >= 500) return 'Moderate output—likely supports partial feeds plus supplementation.';
    return 'Lower output—optimize schedule, latch (if nursing), hydration, and rest.';
  };

  const opinion = (daily: number) => {
    if (daily >= 750) return 'Maintain consistent schedule; consider freezer storage planning.';
    if (daily >= 500) return 'Small increases may be possible with more frequent sessions and breast emptying.';
    return 'Discuss with a lactation consultant; consider power pumping and frequent emptying.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({ dailyMl: Math.round(res.dailyMl), weeklyMl: Math.round(res.weeklyMl), interpretation: interpret(res.dailyMl), opinion: opinion(res.dailyMl) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="infantAgeWeeks" render={({ field }) => (
              <FormItem>
                <FormLabel>Infant Age (weeks)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 8" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="pumpingSessionsPerDay" render={({ field }) => (
              <FormItem>
                <FormLabel>Sessions per Day</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 6" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="avgOutputPerSessionMl" render={({ field }) => (
              <FormItem>
                <FormLabel>Avg Output per Session (ml)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 100" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Production</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Estimated Production</CardTitle>
              </div>
              <CardDescription>Daily and weekly estimates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.dailyMl} ml/day</p>
              <p className="text-muted-foreground">≈ {result.weeklyMl} ml/week</p>
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
          <AccordionTrigger>Complete Guide: Boosting Milk Production</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Frequent emptying (8–12x/day early) stimulates supply.</li>
              <li>Optimize flange fit and pumping technique.</li>
              <li>Prioritize hydration, adequate calories, and rest.</li>
              <li>Consult a lactation professional for latch issues or pain.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/breastfeeding-calorie-needs-calculator" className="text-primary underline">Breastfeeding Calorie Needs</a></li>
              <li><a href="/category/health-fitness/baby-sleep-needs-calculator" className="text-primary underline">Baby Sleep Needs</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


