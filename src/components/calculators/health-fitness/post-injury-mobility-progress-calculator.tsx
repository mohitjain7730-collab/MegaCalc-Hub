'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 
import { Zap } from 'lucide-react';

const formSchema = z.object({
  baselineROMdeg: z.number().min(0).max(200).optional(),
  currentROMdeg: z.number().min(0).max(200).optional(),
  targetROMdeg: z.number().min(0).max(200).optional(),
  weeksSinceStart: z.number().min(0).max(52).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PostInjuryMobilityProgressCalculator() {
  const [result, setResult] = useState<{ progressPercent: number; weeklyRate: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { baselineROMdeg: undefined, currentROMdeg: undefined, targetROMdeg: undefined, weeksSinceStart: undefined } });

  const calculate = (v: FormValues) => {
    if (v.baselineROMdeg == null || v.currentROMdeg == null || v.targetROMdeg == null || v.weeksSinceStart == null) return null;
    const totalGainNeeded = v.targetROMdeg - v.baselineROMdeg;
    const achieved = v.currentROMdeg - v.baselineROMdeg;
    if (totalGainNeeded <= 0) return { progressPercent: 100, weeklyRate: 0 };
    const progressPercent = Math.max(0, Math.min(100, (achieved / totalGainNeeded) * 100));
    const weeklyRate = v.weeksSinceStart > 0 ? achieved / v.weeksSinceStart : 0;
    return { progressPercent, weeklyRate };
  };

  const interpret = (p: number) => {
    if (p >= 80) return 'Excellent progress toward target range of motion.';
    if (p >= 40) return 'Moderate progress; continue progressing loading and mobility.';
    return 'Early-stage progress; focus on frequent, gentle mobility and adherence.';
  };

  const opinion = (rate: number) => {
    if (rate >= 5) return 'Strong weekly gains—maintain current plan and monitor symptoms.';
    if (rate >= 2) return 'Steady gains—consider adding light strengthening in available range.';
    return 'Slow gains—review exercise technique, frequency, and pain thresholds.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({
      progressPercent: Math.round(res.progressPercent * 10) / 10,
      weeklyRate: Math.round(res.weeklyRate * 10) / 10,
      interpretation: interpret(res.progressPercent),
      opinion: opinion(res.weeklyRate),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FormField control={form.control} name="baselineROMdeg" render={({ field }) => (
              <FormItem>
                <FormLabel>Baseline ROM (°)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 60" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="currentROMdeg" render={({ field }) => (
              <FormItem>
                <FormLabel>Current ROM (°)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 90" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="targetROMdeg" render={({ field }) => (
              <FormItem>
                <FormLabel>Target ROM (°)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 120" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="weeksSinceStart" render={({ field }) => (
              <FormItem>
                <FormLabel>Weeks Since Start</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 4" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Evaluate Mobility Progress</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Mobility Progress</CardTitle>
              </div>
              <CardDescription>Relative to your target range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.progressPercent}%</p>
              <p className="text-muted-foreground">Weekly gain: {result.weeklyRate}°/week</p>
              <p className="text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Our Opinion</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{result.opinion}</p></CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Related Calculators</CardTitle>
          <CardDescription>Plan mobility and tolerance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/physical-therapy-exercise-load-calculator" className="text-primary hover:underline">PT Exercise Load</a></h4><p className="text-sm text-muted-foreground">Set safe therapeutic loads.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/ice-bath-duration-temp-calculator" className="text-primary hover:underline">Ice Bath Duration</a></h4><p className="text-sm text-muted-foreground">Recovery guidance after sessions.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide to Mobility Restoration</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>About ROM progress tracking</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['How often to measure ROM?', 'Weekly measurements are usually sufficient; keep conditions consistent.'],
            ['What if progress stalls?', 'Adjust frequency/volume, add end‑range loading, or deload for a week.'],
            ['Is pain during ROM okay?', 'Low, tolerable pain (≤3/10) that settles within 24h is generally acceptable.'],
            ['Do I need warm‑up before measuring?', 'Yes—perform a standard light warm‑up for reliable comparisons.'],
            ['What’s a good weekly gain?', '2–5° for small joints; larger joints can gain slightly more early on.'],
            ['When to change targets?', 'Re‑assess targets with your clinician as function returns and goals evolve.'],
            ['How to improve adherence?', 'Use short, frequent bouts and stack exercises with daily habits.'],
            ['Does swelling affect ROM?', 'Yes—manage swelling with elevation/compression and appropriate loading.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}


