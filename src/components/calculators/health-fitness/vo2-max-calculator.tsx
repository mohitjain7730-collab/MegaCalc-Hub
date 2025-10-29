
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Info } from 'lucide-react';

const formSchema = z.object({
  age: z.number().int().positive(),
  restingHR: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Vo2MaxCalculator() {
  const [result, setResult] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      restingHR: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, restingHR } = values;
    const mhr = 220 - age;
    const vo2max = 15.3 * (mhr / restingHR);
    setResult(vo2max);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
           <CardDescription>Estimate your VO₂ max based on your age and resting heart rate. This is a non-exercise based estimation.</CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age (years)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Used to estimate max heart rate (220 − age)</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="restingHR"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resting Heart Rate (bpm)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Measure after waking, before caffeine or movement</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Estimate VO₂ Max</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Zap className="h-8 w-8 text-primary" /><CardTitle>Estimated VO₂ Max</CardTitle></div></CardHeader>
            <CardContent>
                <div className="text-center space-y-2">
                    <p className="text-4xl font-bold">{result.toFixed(2)}</p>
                    <CardDescription>ml/kg/min</CardDescription>
                </div>
            </CardContent>
        </Card>
      )}

      {/* Interpretation */}
      {result !== null && (
        <Card>
          <CardHeader>
            <CardTitle>Interpretation</CardTitle>
            <CardDescription>Category, takeaway, and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const v = result;
              let category = 'Moderate fitness';
              if (v < 30) category = 'Low fitness';
              else if (v >= 30 && v < 40) category = 'Developing fitness';
              else if (v >= 40 && v < 50) category = 'Good fitness';
              else if (v >= 50) category = 'High fitness';
              const opinion = v >= 50 ? 'Excellent aerobic capacity—focus on event‑specific pacing and economy.' : v >= 40 ? 'Solid base—tempo and interval work can yield strong gains.' : 'Prioritize consistent easy volume and progressive intervals to raise VO₂.';
              const recs = [
                '2× per week: threshold/tempo sessions (20–40 min total at T pace).',
                '1× per week: VO₂ intervals (3–5 min hard, equal easy).',
                '3–4× per week: easy aerobic runs/rides to build base.'
              ];
              return (
                <div className="space-y-2">
                  <p><span className="font-semibold">Category:</span> {category} ({v.toFixed(1)} ml/kg/min)</p>
                  <p><span className="font-semibold">Takeaway:</span> {opinion}</p>
                  <ul className="list-disc ml-5 text-sm text-muted-foreground">{recs.map((r,i)=><li key={i}>{r}</li>)}</ul>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Related Calculators
          </CardTitle>
          <CardDescription>Explore performance tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/running-pace-calculator" className="text-primary hover:underline">Running Pace Calculator</a></h4><p className="text-sm text-muted-foreground">Convert pace, time, and distance.</p></div>
            <div className="p-4 border rounded-lg"><h4 className="font-semibold mb-1"><a href="/category/health-fitness/mets-calories-burned-calculator" className="text-primary hover:underline">METs Calories Burned</a></h4><p className="text-sm text-muted-foreground">Estimate calories across activities.</p></div>
    </div>
        </CardContent>
      </Card>

      {/* Guide (minimal, editable) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to VO₂ Max
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Use this space for your comprehensive guide on VO₂ max testing and training.</p>
          <p>I added placeholders; you can replace them with detailed content later.</p>
        </CardContent>
      </Card>

      {/* FAQ (8-10 items, expanded) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>About VO₂ max</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['What is VO₂ max?', 'The maximum rate of oxygen consumption during intense exercise (ml/kg/min).'],
            ['How is VO₂ max estimated here?', 'Using age, resting HR, and a validated non‑exercise formula.'],
            ['Is a lab test more accurate?', 'Yes—gas analysis is the gold standard; this tool provides an estimate.'],
            ['How do I improve VO₂ max?', 'HIIT, tempo runs, and consistent aerobic training raise VO₂ max.'],
            ['Does weight loss increase VO₂ max?', 'Relative VO₂ max improves as body mass decreases.'],
            ['What’s a good score?', 'It varies by age/sex; endurance athletes often exceed 60 ml/kg/min.'],
            ['Do wearables’ VO₂ max values match?', 'They are estimates; track trends instead of absolutes.'],
            ['How often should I test?', 'Every 4–8 weeks to observe meaningful changes.'],
            ['Does altitude affect VO₂ max?', 'Yes—reduced oxygen availability lowers measured values.'],
            ['Any risks testing VO₂ max?', 'Max tests are strenuous; seek clearance if you have heart risk.'],
          ].map(([q,a],i) => (
            <div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
