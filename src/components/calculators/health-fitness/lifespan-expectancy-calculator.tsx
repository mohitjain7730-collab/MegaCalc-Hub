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
import { HeartPulse, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  sex: z.enum(['female', 'male']).optional(),
  age: z.number().int().positive().optional(),
  smoker: z.enum(['yes', 'no']).optional(),
  exerciseMinutesPerWeek: z.number().nonnegative().optional(),
  sleepHours: z.number().nonnegative().optional(),
  systolicBP: z.number().nonnegative().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function estimateLifeExpectancy(values: FormValues) {
  let base = values.sex === 'female' ? 84 : 81; // rough global averages as a starting point
  if (values.smoker === 'yes') base -= 6;
  const ex = values.exerciseMinutesPerWeek || 0;
  if (ex >= 150) base += 2; else if (ex >= 60) base += 1;
  const sleep = values.sleepHours || 0;
  if (sleep >= 7 && sleep <= 9) base += 1; else if (sleep < 6 || sleep > 9) base -= 1;
  const sbp = values.systolicBP || 0;
  if (sbp >= 140) base -= 2; else if (sbp >= 130) base -= 1;
  const age = values.age || 0;
  const remaining = Math.max(0, base - age);
  return { expectedAge: Math.max(age, Math.round(base)), yearsRemaining: Math.round(remaining) };
}

export default function LifespanExpectancyCalculator() {
  const [result, setResult] = useState<{ expectedAge: number; yearsRemaining: number } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { sex: undefined, age: undefined, smoker: undefined, exerciseMinutesPerWeek: undefined, sleepHours: undefined, systolicBP: undefined } });
  const onSubmit = (v: FormValues) => setResult(estimateLifeExpectancy(v));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="sex" render={({ field }) => (<FormItem><FormLabel>Sex</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="female">Female</option><option value="male">Male</option></select></FormItem>)} />
            <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Current Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="smoker" render={({ field }) => (<FormItem><FormLabel>Smoker</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
            <FormField control={form.control} name="exerciseMinutesPerWeek" render={({ field }) => (<FormItem><FormLabel>Exercise Minutes per Week</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="sleepHours" render={({ field }) => (<FormItem><FormLabel>Average Sleep (hours/night)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="systolicBP" render={({ field }) => (<FormItem><FormLabel>Systolic Blood Pressure (mmHg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
          </div>
          <Button type="submit">Estimate Lifespan</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader><div className="flex items-center gap-4"><HeartPulse className="h-8 w-8 text-primary" /><CardTitle>Lifespan Expectation</CardTitle></div><CardDescription>Simple lifestyle‑adjusted estimate</CardDescription></CardHeader>
          <CardContent>
            <div className="text-center space-y-2"><p className="text-4xl font-bold">~{result.expectedAge}</p><p className="text-xl">≈ {result.yearsRemaining} years remaining</p></div>
            <Alert className="mt-4"><Info className="h-4 w-4" /><AlertTitle>Opinion</AlertTitle><AlertDescription>Use this as a directional check, not a prediction. Improving cardio fitness, sleep, blood pressure, and avoiding tobacco generally adds healthy years.</AlertDescription></Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Lifespan Expectancy Calculator – Practical Longevity Levers" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Learn how physical activity, sleep, blood pressure, and smoking influence longevity." />
        <h2 className="text-xl font-bold text-foreground">Guide: What Moves the Needle</h2>
        <ul className="list-disc ml-6 space-y-1"><li>150–300 minutes/week activity, with 2 days of strength training.</li><li>Sleep 7–9 hours/night when possible.</li><li>Maintain blood pressure in a healthy range with diet, activity, and care.</li></ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/vo2-max-calculator">VO₂ Max</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/blood-pressure-risk-calculator">Blood Pressure Risk</Link></p>
      </div>
    </div>
  );
}


