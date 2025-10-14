'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Moon } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({ targetPerNight: z.number().min(4).max(10), mon: z.number().min(0).max(24), tue: z.number().min(0).max(24), wed: z.number().min(0).max(24), thu: z.number().min(0).max(24), fri: z.number().min(0).max(24), sat: z.number().min(0).max(24), sun: z.number().min(0).max(24) });
type FormValues = z.infer<typeof formSchema>;

export default function SleepDebtCalculator() {
  const [debt, setDebt] = useState<number | null>(null);
  const [advice, setAdvice] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { targetPerNight: undefined, mon: undefined, tue: undefined, wed: undefined, thu: undefined, fri: undefined, sat: undefined, sun: undefined } });

  const onSubmit = (v: FormValues) => {
    const totalSlept = v.mon+v.tue+v.wed+v.thu+v.fri+v.sat+v.sun;
    const target = v.targetPerNight * 7;
    const diff = target - totalSlept;
    setDebt(diff);
    setAdvice(diff > 0 ? 'You are in sleep debt. Add 30–60 min earlier bedtime and anchor wake time.' : 'No weekly debt—maintain consistent schedule and daytime light exposure.');
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
            <FormField control={form.control} name="targetPerNight" render={({ field }) => (<FormItem><FormLabel>Target per Night (h)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            {(['mon','tue','wed','thu','fri','sat','sun'] as const).map((d) => (
              <FormField key={d} control={form.control} name={d} render={({ field }) => (<FormItem><FormLabel className="capitalize">{d}</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            ))}
          </div>
          <Button type="submit">Calculate Sleep Debt</Button>
        </form>
      </Form>

      {debt !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Moon className="h-8 w-8 text-primary" /><CardTitle>Weekly Sleep Debt</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{debt > 0 ? `${debt.toFixed(1)} hours owed` : `${Math.abs(debt).toFixed(1)} hours surplus`}</p>
              <CardDescription>{advice}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <SleepDebtGuide />
    </div>
  );
}

function SleepDebtGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Sleep Debt – Why Consistency Wins" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to measure sleep debt, circadian anchors, naps, caffeine timing, and light strategies." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Sleep Debt</h2>
      <p itemProp="description">Shorting sleep impairs cognition and training adaptations. Rather than "binge sleeping," aim for consistent nights and small catch‑ups (20–60 minutes) over the week.</p>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2"><p><Link href="/category/health-fitness/sleep-efficiency-calculator" className="text-primary underline">Sleep Efficiency Calculator</Link></p><p><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary underline">Hydration Needs Calculator</Link></p></div>
    </section>
  );
}