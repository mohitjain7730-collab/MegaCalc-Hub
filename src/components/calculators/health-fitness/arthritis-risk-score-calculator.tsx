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
import { HandHeart, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().int().positive().optional(),
  sex: z.enum(['female', 'male']).optional(),
  bmi: z.number().positive().optional(),
  familyHistory: z.enum(['yes', 'no']).optional(),
  smoker: z.enum(['yes', 'no']).optional(),
  priorJointInjury: z.enum(['yes', 'no']).optional(),
  repetitiveOccupationalUse: z.enum(['yes', 'no']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function compute(values: FormValues) {
  let score = 0;
  if (values.age && values.age >= 60) score += 3; else if (values.age && values.age >= 45) score += 2;
  if (values.sex === 'female') score += 1;
  if (values.bmi && values.bmi >= 30) score += 2; else if (values.bmi && values.bmi >= 25) score += 1;
  if (values.familyHistory === 'yes') score += 2;
  if (values.smoker === 'yes') score += 1;
  if (values.priorJointInjury === 'yes') score += 2;
  if (values.repetitiveOccupationalUse === 'yes') score += 1;
  let category: 'Low' | 'Moderate' | 'High' = 'Low';
  if (score >= 7) category = 'High'; else if (score >= 4) category = 'Moderate';
  return { score, category };
}

export default function ArthritisRiskScoreCalculator() {
  const [result, setResult] = useState<{ score: number; category: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { age: undefined, sex: undefined, bmi: undefined, familyHistory: undefined, smoker: undefined, priorJointInjury: undefined, repetitiveOccupationalUse: undefined } });
  const onSubmit = (v: FormValues) => setResult(compute(v));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="sex" render={({ field }) => (<FormItem><FormLabel>Sex</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="female">Female</option><option value="male">Male</option></select></FormItem>)} />
            <FormField control={form.control} name="bmi" render={({ field }) => (<FormItem><FormLabel>BMI</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="familyHistory" render={({ field }) => (<FormItem><FormLabel>Family History of Arthritis</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
            <FormField control={form.control} name="smoker" render={({ field }) => (<FormItem><FormLabel>Current or Former Smoker</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
            <FormField control={form.control} name="priorJointInjury" render={({ field }) => (<FormItem><FormLabel>Previous Joint Injury</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
            <FormField control={form.control} name="repetitiveOccupationalUse" render={({ field }) => (<FormItem><FormLabel>Repetitive Occupational Use</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="yes">Yes</option><option value="no">No</option></select></FormItem>)} />
          </div>
          <Button type="submit">Calculate Risk</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4"><HandHeart className="h-8 w-8 text-primary" /><CardTitle>Arthritis Risk</CardTitle></div>
            <CardDescription>Screening score based on common risk factors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2"><p className="text-4xl font-bold">{result.score}</p><p className="text-xl font-semibold">{result.category} Risk</p></div>
            <div className="mt-4 p-4 rounded-md border"><div className="flex items-center gap-2 text-foreground"><Info className="h-4 w-4" /><span className="font-semibold">Interpretation</span></div><p className="mt-2 text-sm text-muted-foreground">{result.category === 'High' ? 'Multiple risk factors present. Consider weight management, joint-friendly activity, and a clinician visit for tailored guidance.' : result.category === 'Moderate' ? 'Some risk factors identified. Focus on strength, mobility, and body weight to support joint health.' : 'Few risk factors detected. Maintain regular activity, good sleep, and balanced nutrition.'}</p></div>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Arthritis Risk Score – Lifestyle, Injury, and Prevention" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Understand arthritis risk drivers, how to protect your joints, and when to seek care." />
        <h2 className="text-xl font-bold text-foreground">Guide: Protecting Your Joints</h2>
        <ul className="list-disc ml-6 space-y-1"><li>Train strength 2–3×/week focusing on hips, knees, shoulders, and core.</li><li>Use activity variety to reduce repetitive stress.</li><li>Manage weight; each kilo of loss reduces knee load substantially.</li></ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/bmi-calculator">BMI</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/strength-to-weight-ratio-calculator">Strength‑to‑Weight</Link></p>
      </div>
    </div>
  );
}


