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
  waterTempC: z.number().min(2).max(20).optional(),
  goal: z.enum(['recovery','anti-inflammatory','brown-fat']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function IceBathDurationTempCalculator() {
  const [result, setResult] = useState<{ durationMin: number; interpretation: string; opinion: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { waterTempC: undefined, goal: undefined } });

  const calculate = (v: FormValues) => {
    if (v.waterTempC == null || v.goal == null) return null;
    let base = v.goal === 'recovery' ? 8 : v.goal === 'anti-inflammatory' ? 10 : 12;
    const tempAdj = (12 - v.waterTempC) * 0.5; // colder water, shorter time
    const duration = Math.max(3, base - tempAdj);
    return Math.round(duration);
  };

  const interpret = (d: number) => {
    if (d <= 5) return 'Brief exposure—suitable for freshness without excessive dampening of adaptations.';
    if (d <= 10) return 'Moderate exposure—balanced recovery and inflammation control.';
    return 'Longer exposure—watch for numbness; avoid near strength sessions to preserve adaptations.';
  };

  const opinion = (d: number) => {
    if (d <= 5) return 'Use same-day after hard sessions sparingly; prefer off-days.';
    if (d <= 10) return 'Schedule 6–8 hours after training; rewarm gradually.';
    return 'Prioritize safety and rewarming; avoid prolonged numbness or shivering.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res == null) { setResult(null); return; }
    setResult({ durationMin: res, interpretation: interpret(res), opinion: opinion(res) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="waterTempC" render={({ field }) => (
              <FormItem>
                <FormLabel>Water Temp (°C)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 10" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="goal" render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Goal</FormLabel>
                <FormControl>
                  <select className="border rounded h-10 px-3 w-full bg-background" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value as any)}>
                    <option value="">Select goal</option>
                    <option value="recovery">Recovery</option>
                    <option value="anti-inflammatory">Anti-inflammatory</option>
                    <option value="brown-fat">Brown fat activation</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Recommend Duration</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Ice Bath Duration</CardTitle>
              </div>
              <CardDescription>Based on temperature and goal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.durationMin} min</p>
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
          <CardDescription>Plan recovery and temperature strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/recovery-heart-rate-calculator" className="text-primary hover:underline">Recovery Heart Rate</a></h4><p className="text-sm text-muted-foreground">Track autonomic recovery after training.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO₂ Max Calculator</a></h4><p className="text-sm text-muted-foreground">Aerobic fitness to inform recovery.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Complete Guide to Ice Baths</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>About cold exposure and timing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['When to avoid ice baths?', 'Avoid immediately post‑strength if hypertrophy is a goal; prefer rest days.'],
            ['What water temp is best?', 'Common range is 8–12°C; colder water requires shorter durations.'],
            ['How many sessions per week?', '2–4 sessions depending on tolerance and goals.'],
            ['How should I rewarm?', 'Towel dry, light movement, and warm beverage; avoid hot showers immediately.'],
            ['Any contraindications?', 'Circulatory issues, Raynaud’s, or pregnancy—consult a clinician.'],
            ['Can I combine with sauna?', 'Yes—contrast therapy can aid relaxation; listen to your body.'],
            ['Does it blunt training gains?', 'Potentially if used immediately after strength; time it away from heavy lifting.'],
            ['What about breathing?', 'Slow nasal breathing helps manage stress response during immersion.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}


