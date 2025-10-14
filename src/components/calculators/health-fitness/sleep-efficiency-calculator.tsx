'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MoonStar } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({ timeInBedHours: z.number().positive(), totalSleepHours: z.number().nonnegative() });
type FormValues = z.infer<typeof formSchema>;

export default function SleepEfficiencyCalculator() {
  const [eff, setEff] = useState<number | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { timeInBedHours: undefined, totalSleepHours: undefined } });

  const onSubmit = (v: FormValues) => {
    const pct = v.timeInBedHours > 0 ? (v.totalSleepHours / v.timeInBedHours) * 100 : 0;
    setEff(pct);
    let text = 'Good efficiency.';
    if (pct < 85) text = 'Low efficiency. Try a consistent schedule and reduce time-in-bed without sleep.';
    else if (pct >= 90) text = 'Excellent efficiency—keep habits consistent.';
    setOpinion(text);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="timeInBedHours" render={({ field }) => (<FormItem><FormLabel>Time in Bed (hours)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="totalSleepHours" render={({ field }) => (<FormItem><FormLabel>Total Sleep (hours)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate Efficiency</Button>
        </form>
      </Form>

      {eff !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><MoonStar className="h-8 w-8 text-primary" /><CardTitle>Sleep Efficiency</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{eff.toFixed(0)}%</p>
              <CardDescription>{opinion}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <SeGuide />
    </div>
  );
}

function SeGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Sleep Efficiency – Improve Quality, Not Just Quantity" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to interpret sleep efficiency %, behaviors that raise efficiency, light/caffeine timing, and when to seek care." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">What Is Efficiency?</h2>
      <p itemProp="description">Efficiency is the share of time in bed spent actually sleeping. It reflects sleep quality and consistency. Most adults benefit from ≥85% efficiency.</p>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2"><p><Link href="/category/health-fitness/sleep-debt-calculator-hf" className="text-primary underline">Sleep Debt Calculator</Link></p><p><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary underline">Hydration Needs Calculator</Link></p></div>
    </section>
  );
}