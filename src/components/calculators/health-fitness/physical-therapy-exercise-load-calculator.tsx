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
  oneRepMaxEstimateKg: z.number().positive('Enter 1RM estimate').optional(),
  painScale0to10: z.number().min(0).max(10).optional(),
  rehabPhase: z.enum(['acute','subacute','late']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PhysicalTherapyExerciseLoadCalculator() {
  const [result, setResult] = useState<{ loadKg: number; reps: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { oneRepMaxEstimateKg: undefined, painScale0to10: undefined, rehabPhase: undefined } });

  const calculate = (v: FormValues) => {
    if (v.oneRepMaxEstimateKg == null || v.painScale0to10 == null || v.rehabPhase == null) return null;
    let percent = v.rehabPhase === 'acute' ? 0.3 : v.rehabPhase === 'subacute' ? 0.5 : 0.7;
    percent -= (v.painScale0to10 / 10) * 0.1; // reduce for pain
    percent = Math.max(0.2, percent);
    const loadKg = v.oneRepMaxEstimateKg * percent;
    const reps = v.rehabPhase === 'acute' ? 15 : v.rehabPhase === 'subacute' ? 12 : 8;
    return { loadKg, reps };
  };

  const interpret = (load: number) => {
    if (load < 10) return 'Very light therapeutic load emphasizing tissue tolerance and technique.';
    if (load <= 40) return 'Light to moderate load to rebuild capacity safely.';
    return 'Moderate load for late-stage rehab and return-to-function.';
  };

  const opinion = (reps: number) => {
    if (reps >= 12) return 'Prioritize controlled tempo, full ROM, and pain below 3/10.';
    return 'Emphasize strength with good form; progress gradually maintaining pain below 2–3/10.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({ loadKg: Math.round(res.loadKg * 10) / 10, reps: res.reps, interpretation: interpret(res.loadKg), opinion: opinion(res.reps) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="oneRepMaxEstimateKg" render={({ field }) => (
              <FormItem>
                <FormLabel>1RM Estimate (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" placeholder="Enter 1RM" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="painScale0to10" render={({ field }) => (
              <FormItem>
                <FormLabel>Pain (0–10)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="rehabPhase" render={({ field }) => (
              <FormItem>
                <FormLabel>Rehab Phase</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as any)}>
                    <option value="">Select phase</option>
                    <option value="acute">Acute</option>
                    <option value="subacute">Subacute</option>
                    <option value="late">Late</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Exercise Load</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Therapeutic Load & Reps</CardTitle>
              </div>
              <CardDescription>Guidance for resistance in rehab</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.loadKg} kg</p>
              <p className="text-muted-foreground">Suggested reps: {result.reps}</p>
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
          <CardDescription>Useful tools for rehab planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/post-injury-mobility-progress-calculator" className="text-primary hover:underline">Mobility Progress</a></h4><p className="text-sm text-muted-foreground">Track ROM improvements over time.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/physical-therapy-session-intensity-calculator" className="text-primary hover:underline">Session Intensity</a></h4><p className="text-sm text-muted-foreground">Balance effort and symptoms.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide to Rehab Loading</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>About rehab loading and pain scaling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What pain is acceptable?', 'Generally ≤3/10 during and after, and no next‑day flare beyond baseline.'],
            ['How often should I progress?', 'Increase one variable (load, reps, sets) every 1–2 weeks if symptoms are stable.'],
            ['Tempo recommendations?', 'Use slow eccentric (2–3 s) early; normalize as tolerance improves.'],
            ['When to deload?', 'If pain or fatigue accumulates, reduce volume by ~30% for 1 week.'],
            ['Is failure training appropriate?', 'Avoid true failure in rehab; stop with 2–3 reps in reserve.'],
            ['How to choose exercises?', 'Start with simple, pain‑free patterns and progress to functional tasks.'],
            ['Warm‑up guidance?', '5–10 minutes of light aerobic and mobility primes tissue.'],
            ['How to manage swelling?', 'Prioritize range of motion and compression/elevation; limit heavy loading.'],
            ['What if pain spikes next day?', 'Return to last tolerable step and progress more slowly.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}


