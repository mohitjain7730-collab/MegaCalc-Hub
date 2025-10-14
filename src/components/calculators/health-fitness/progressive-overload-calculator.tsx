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
import { TrendingUp } from 'lucide-react';

const formSchema = z.object({ currentLoad: z.number().positive(), weeklyIncreasePct: z.number().min(0).max(20), weeks: z.number().int().min(1).max(52) });
type FormValues = z.infer<typeof formSchema>;

export default function ProgressiveOverloadCalculator() {
  const [plan, setPlan] = useState<number[] | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { currentLoad: undefined, weeklyIncreasePct: undefined, weeks: undefined } });

  const onSubmit = (v: FormValues) => {
    const pct = v.weeklyIncreasePct / 100;
    const values = Array.from({ length: v.weeks }, (_, i) => Math.round(v.currentLoad * Math.pow(1 + pct, i + 1)));
    setPlan(values);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="currentLoad" render={({ field }) => (<FormItem><FormLabel>Current Working Load (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="weeklyIncreasePct" render={({ field }) => (<FormItem><FormLabel>Weekly Increase (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="weeks" render={({ field }) => (<FormItem><FormLabel>Number of Weeks</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Generate Plan</Button>
        </form>
      </Form>

      {plan && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><TrendingUp className="h-8 w-8 text-primary" /><CardTitle>Progressive Overload Plan</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-muted-foreground">Planned working load each week:</p>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {plan.map((val, i) => (
                  <div key={i} className="rounded border p-2 text-center text-sm">Week {i+1}: {val} kg</div>
                ))}
              </div>
              <CardDescription>Aim for small, sustainable increases. Deload every 4–8 weeks or if performance drops.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <PoGuide />
    </div>
  );
}

function PoGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Progressive Overload – Small Wins Add Up" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to increase load, reps, or sets over time, autoregulation, RPE, and plateaus." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Principle</h2>
      <p itemProp="description">Muscles adapt to higher stress. Increase training stress gradually—load, reps, sets, range of motion, or density—to keep improving while minimizing injury risk.</p>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2">
        <p><Link href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</Link></p>
        <p><Link href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary underline">1RM Calculator</Link></p>
      </div>
    </section>
  );
}