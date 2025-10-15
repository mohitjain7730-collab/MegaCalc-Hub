'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ribbon, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().int().positive().optional(),
  smoker: z.enum(['yes', 'no']).optional(),
  alcoholDrinksPerWeek: z.number().nonnegative().optional(),
  dailyFruitsVegServings: z.number().nonnegative().optional(),
  weeklyExerciseMinutes: z.number().nonnegative().optional(),
  bmi: z.number().positive().optional(),
  uvExposureHigh: z.enum(['yes', 'no']).optional(),
  familyHistory: z.enum(['yes', 'no']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function compute(values: FormValues) {
  let score = 0;
  if (values.age && values.age >= 60) score += 2; else if (values.age && values.age >= 45) score += 1;
  if (values.smoker === 'yes') score += 4;
  if ((values.alcoholDrinksPerWeek || 0) > 10) score += 2; else if ((values.alcoholDrinksPerWeek || 0) > 4) score += 1;
  if ((values.dailyFruitsVegServings || 0) < 3) score += 1;
  if ((values.weeklyExerciseMinutes || 0) < 90) score += 2; else if ((values.weeklyExerciseMinutes || 0) < 150) score += 1;
  if (values.bmi && values.bmi >= 30) score += 2; else if (values.bmi && values.bmi >= 25) score += 1;
  if (values.uvExposureHigh === 'yes') score += 1;
  if (values.familyHistory === 'yes') score += 2;
  let category: 'Low' | 'Moderate' | 'High' = 'Low';
  if (score >= 8) category = 'High'; else if (score >= 4) category = 'Moderate';
  return { score, category };
}

export default function CancerRiskLifestyleCalculator() {
  const [result, setResult] = useState<{ score: number; category: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { age: undefined, smoker: undefined, alcoholDrinksPerWeek: undefined, dailyFruitsVegServings: undefined, weeklyExerciseMinutes: undefined, bmi: undefined, uvExposureHigh: undefined, familyHistory: undefined } });
  const onSubmit = (v: FormValues) => setResult(compute(v));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="smoker" render={({ field }) => (<FormItem><FormLabel>Current or Former Smoker</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
            <FormField control={form.control} name="alcoholDrinksPerWeek" render={({ field }) => (<FormItem><FormLabel>Alcohol (drinks/week)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="dailyFruitsVegServings" render={({ field }) => (<FormItem><FormLabel>Fruit & Veg (servings/day)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="weeklyExerciseMinutes" render={({ field }) => (<FormItem><FormLabel>Exercise (minutes/week)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="bmi" render={({ field }) => (<FormItem><FormLabel>BMI</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="uvExposureHigh" render={({ field }) => (<FormItem><FormLabel>High UV Exposure (outdoor work or tanning)</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
            <FormField control={form.control} name="familyHistory" render={({ field }) => (<FormItem><FormLabel>First‑Degree Family History</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
          </div>
          <Button type="submit">Calculate Lifestyle Risk</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader><div className="flex items-center gap-4"><Ribbon className="h-8 w-8 text-primary" /><CardTitle>Cancer Lifestyle Risk</CardTitle></div><CardDescription>Self‑assessment based on common modifiable factors</CardDescription></CardHeader>
          <CardContent>
            <div className="text-center space-y-2"><p className="text-4xl font-bold">{result.score}</p><p className="text-xl font-semibold">{result.category} Risk</p></div>
            <Alert className="mt-4"><Info className="h-4 w-4" /><AlertTitle>Interpretation</AlertTitle><AlertDescription>{result.category === 'High' ? 'Focus on smoking cessation, alcohol moderation, healthy weight, and sufficient activity; consult your clinician about screening.' : result.category === 'Moderate' ? 'Improve diet quality, nudge up weekly exercise, and review family history with your clinician.' : 'Great baseline habits. Keep consistent screenings per age guidelines and continue protective routines.'}</AlertDescription></Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Cancer Risk Lifestyle Calculator – Habits That Matter" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Evidence‑informed overview of lifestyle risk factors, screening, and practical steps." />
        <h2 className="text-xl font-bold text-foreground">Guide: Lifestyle Levers</h2>
        <ul className="list-disc ml-6 space-y-1"><li>Quit tobacco; risk reduction begins immediately and compounds over time.</li><li>Limit alcohol; many organizations suggest ≤1 drink/day (women) and ≤2 (men).</li><li>Target 150–300 minutes/week moderate activity plus 2 days of strength training.</li><li>Emphasize whole foods, fiber, and color variety in meals.</li></ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/bmi-calculator">BMI</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/sleep-efficiency-calculator">Sleep Efficiency</Link></p>
      </div>
    </div>
  );
}


