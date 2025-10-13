'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Utensils } from 'lucide-react';

const formSchema = z.object({ age: z.number().int().min(1).max(120), sex: z.enum(['male', 'female']) });
type FormValues = z.infer<typeof formSchema>;

function rdaMgMg(age: number, sex: 'male' | 'female'): number {
  // Simplified NIH/ODS values
  if (age >= 1 && age <= 3) return 80;
  if (age >= 4 && age <= 8) return 130;
  if (age >= 9 && age <= 13) return 240;
  if (age >= 14 && age <= 18) return sex === 'male' ? 410 : 360;
  if (age >= 19 && age <= 30) return sex === 'male' ? 400 : 310;
  return sex === 'male' ? 420 : 320;
}

export default function MagnesiumIntakeCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { age: undefined, sex: 'male' } });
  const onSubmit = (values: FormValues) => setResult(rdaMgMg(values.age, values.sex));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="sex" render={({ field }) => (<FormItem><FormLabel>Sex</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent></Select></FormItem>)} />
          </div>
          <Button type="submit">Calculate Magnesium RDA</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Utensils className="h-8 w-8 text-primary" /><CardTitle>Recommended Daily Magnesium</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{result} mg/day</p>
              <CardDescription>Approximate RDA based on age and sex.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <MagnesiumIntakeGuide />
    </div>
  );
}

export function MagnesiumIntakeGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Magnesium Intake Calculator – Complete Guide to Magnesium, Energy, Sleep, and Muscle Function" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="Magnesium roles (ATP, nerves, muscle), daily requirements, dietary sources, absorption, deficiency signs, interactions, and sample menus." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Magnesium: The Quiet Workhorse</h2>
      <p itemProp="description">Magnesium participates in 300+ enzymatic reactions, stabilizes ATP, and supports nerve transmission, muscle contraction/relaxation, blood glucose control, and sleep quality. Many adults under‑consume magnesium.</p>

      <h3 className="font-semibold text-foreground mt-6">Daily Requirements (Simplified)</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>14–18 years: 360–410 mg/day (female–male)</li>
        <li>19–30 years: 310–400 mg/day</li>
        <li>31+ years: 320–420 mg/day</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Best Food Sources</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Nuts & seeds: almonds, cashews, pumpkin seeds</li>
        <li>Legumes & whole grains: black beans, lentils, quinoa, oats</li>
        <li>Leafy greens: spinach, Swiss chard</li>
        <li>Dark chocolate (in moderation)</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Absorption & Interactions</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Absorption is ~30–50% and improves when spread across meals.</li>
        <li>High-dose zinc or calcium supplements can compete for absorption—separate dosing when practical.</li>
        <li>GI disorders and certain medications (e.g., PPIs, diuretics) may increase requirements—consult your clinician.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Deficiency Clues</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Muscle cramps, twitching, fatigue, sleep issues</li>
        <li>Poor glucose control, headaches, low appetite</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Sample Day (~350–420 mg)</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Breakfast: oatmeal + almonds + banana</li>
        <li>Lunch: quinoa salad with black beans, spinach, avocado</li>
        <li>Dinner: salmon, roasted potatoes, sautéed chard</li>
        <li>Snack: dark chocolate square + pumpkin seeds</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2">
        <p><Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary underline">Fiber Intake Calculator</Link></p>
        <p><Link href="/category/health-fitness/calcium-intake-calculator" className="text-primary underline">Calcium Intake Calculator</Link></p>
      </div>
      <p className="italic">Educational use only; consult a qualified professional for personal advice.</p>
    </section>
  );
}


