'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

const formSchema = z.object({ servingsFruitVeg: z.number().nonnegative(), oracPerServing: z.number().nonnegative() });
type FormValues = z.infer<typeof formSchema>;

export default function DailyAntioxidantOracGoalCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { servingsFruitVeg: undefined, oracPerServing: undefined } });
  const onSubmit = (v: FormValues) => setResult(v.servingsFruitVeg * v.oracPerServing);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="servingsFruitVeg" render={({ field }) => (<FormItem><FormLabel>Daily Fruit/Vegetable Servings</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="oracPerServing" render={({ field }) => (<FormItem><FormLabel>Avg ORAC per Serving</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Estimate Daily ORAC</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Leaf className="h-8 w-8 text-primary" /><CardTitle>Estimated Daily ORAC</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{Math.round(result).toLocaleString()} ORAC units</p>
              <CardDescription>Use colorful, varied produce to reach your target.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <OracGuide />
    </div>
  );
}

export function OracGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Daily Antioxidant (ORAC) Goal Calculator – Understand ORAC and Practical Antioxidant Eating" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="What ORAC measures, its limitations, food variety, polyphenols, practical servings approach, and colorful plate strategies." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">ORAC in Context</h2>
      <p itemProp="description">ORAC (Oxygen Radical Absorbance Capacity) estimates a food’s antioxidant capacity in vitro. While it is not a perfect proxy for in‑body effects, it can help you think about variety and intensity of plant compounds in your diet.</p>

      <h3 className="font-semibold text-foreground mt-6">Practical Approach</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Target multiple <strong>colors</strong> daily—berries, leafy greens, orange vegetables, crucifers, herbs/spices.</li>
        <li>Use ORAC as inspiration, not a strict scoreboard—bioavailability and synergy matter.</li>
        <li>Pair with healthy fats (olive oil, nuts) to aid absorption of fat‑soluble phytonutrients.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">High‑ORAC Examples</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Berries (blueberry, blackberry), cherries, plums</li>
        <li>Spices: cloves, cinnamon, oregano</li>
        <li>Cocoa powder, dark chocolate (moderation)</li>
        <li>Leafy greens and cruciferous vegetables</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2">
        <p><Link href="/category/health-fitness/fiber-intake-calculator" className="text-primary underline">Fiber Intake Calculator</Link></p>
        <p><Link href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake Calculator</Link></p>
      </div>
      <p className="italic">Note: ORAC is best used as an educational guide. Focus on whole‑food variety and minimally processed plant foods.</p>
    </section>
  );
}


