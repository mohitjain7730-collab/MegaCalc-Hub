'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import Link from 'next/link';

const metMap: Record<string, number> = {
  'Walking (5 km/h)': 3.3,
  'Jogging (8 km/h)': 7.0,
  'Running (10 km/h)': 10,
  'Cycling (moderate)': 7.5,
  'Rowing (vigorous)': 8.5,
  'Strength Training': 6.0,
};

const formSchema = z.object({ activity: z.string(), weightKg: z.number().positive(), minutes: z.number().positive() });
type FormValues = z.infer<typeof formSchema>;

export default function ExerciseCalorieBurnCalculator() {
  const [kcals, setKcals] = useState<number | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { activity: undefined as unknown as string, weightKg: undefined, minutes: undefined } });

  const onSubmit = (v: FormValues) => {
    const met = metMap[v.activity] ?? 6;
    const kcal = (met * 3.5 * v.weightKg * v.minutes) / 200; // standard MET formula
    setKcals(Math.round(kcal));
    setOpinion('Use nutrition and recovery to match training load; avoid relying solely on exercise calories for weight control.');
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="activity" render={({ field }) => (
              <FormItem><FormLabel>Activity</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{Object.keys(metMap).map(k => (<SelectItem key={k} value={k}>{k}</SelectItem>))}</SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="weightKg" render={({ field }) => (
              <FormItem><FormLabel>Body Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="minutes" render={({ field }) => (
              <FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Calories Burned</Button>
        </form>
      </Form>

      {kcals !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Flame className="h-8 w-8 text-primary" /><CardTitle>Estimated Calories Burned</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{kcals.toLocaleString()} kcal</p>
              <CardDescription>{opinion}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <KcalGuide />
    </div>
  );
}

function KcalGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Exercise Calories – Using METs for Estimates" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How METs convert to calories, activity selection, intensity variations, and realistic expectations." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">About METs</h2>
      <p itemProp="description">METs approximate energy cost relative to resting metabolism. Actual calories vary with biomechanics, efficiency, and environment. Use these values as a planning estimate.</p>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2"><p><Link href="/category/health-fitness/mets-calories-burned-calculator" className="text-primary underline">METs Calories Calculator</Link></p><p><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary underline">Hydration Needs Calculator</Link></p></div>
    </section>
  );
}