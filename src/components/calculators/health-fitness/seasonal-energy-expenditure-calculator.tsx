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
  avgTempWinterC: z.number().min(-30).max(30).optional(),
  avgTempSummerC: z.number().min(10).max(50).optional(),
  dailyOutdoorMinutes: z.number().min(0).max(300).optional(),
  clothingClo: z.number().min(0).max(4).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SeasonalEnergyExpenditureCalculator() {
  const [result, setResult] = useState<{ winterExtraKcalPerDay: number; summerExtraKcalPerDay: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { avgTempWinterC: undefined, avgTempSummerC: undefined, dailyOutdoorMinutes: undefined, clothingClo: undefined } });

  const extraKcal = (tempC: number, minutes: number, clo: number) => {
    const tempDelta = Math.max(0, 22 - tempC);
    const cloFactor = Math.max(0.2, 1 - clo * 0.2);
    const perHour = tempDelta * 2.2 * cloFactor;
    return (perHour * minutes) / 60;
  };

  const onSubmit = (v: FormValues) => {
    if (v.avgTempWinterC == null || v.avgTempSummerC == null || v.dailyOutdoorMinutes == null || v.clothingClo == null) { setResult(null); return; }
    const winter = Math.round(extraKcal(v.avgTempWinterC, v.dailyOutdoorMinutes, v.clothingClo));
    const summer = Math.round(extraKcal(v.avgTempSummerC, v.dailyOutdoorMinutes, v.clothingClo));
    const interpretation = winter > summer ? 'Higher thermogenic demand expected in winter.' : 'Minimal seasonal difference in thermogenic demand.';
    const opinion = 'Adjust calorie targets seasonally if weight trends shift; prioritize comfort and safety in extreme temps.';
    setResult({ winterExtraKcalPerDay: winter, summerExtraKcalPerDay: summer, interpretation, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="avgTempWinterC" render={({ field }) => (
              <FormItem>
                <FormLabel>Avg Winter Temp (°C)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="avgTempSummerC" render={({ field }) => (
              <FormItem>
                <FormLabel>Avg Summer Temp (°C)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 28" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="dailyOutdoorMinutes" render={({ field }) => (
              <FormItem>
                <FormLabel>Outdoor Time (min/day)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 60" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="clothingClo" render={({ field }) => (
              <FormItem>
                <FormLabel>Clothing (clo)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 1.0" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value)||undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Seasonal Energy</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Seasonal Energy Difference</CardTitle>
              </div>
              <CardDescription>Extra calories burned per day outdoors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground">Winter: <span className="font-semibold text-foreground">{result.winterExtraKcalPerDay} kcal/day</span></p>
              <p className="text-muted-foreground">Summer: <span className="font-semibold text-foreground">{result.summerExtraKcalPerDay} kcal/day</span></p>
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
          <AccordionTrigger>Complete Guide: Seasons & Energy Expenditure</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <ul className="list-disc list-inside space-y-1">
              <li>Colder months often raise thermogenic needs outdoors.</li>
              <li>Adjust apparel (clo) and exposure time to manage comfort.</li>
              <li>Monitor body weight trends and tweak calories seasonally.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/caloric-cost-of-cold-exposure-calculator" className="text-primary underline">Cold Exposure Cost</a></li>
              <li><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


