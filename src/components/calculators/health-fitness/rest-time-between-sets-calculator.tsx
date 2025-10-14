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
import { Timer } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({ goal: z.enum(['strength','hypertrophy','endurance']), lastSetRpe: z.number().min(1).max(10) });
type FormValues = z.infer<typeof formSchema>;

export default function RestTimeBetweenSetsCalculator() {
  const [restSec, setRestSec] = useState<number | null>(null);
  const [advice, setAdvice] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { goal: undefined as unknown as 'strength', lastSetRpe: undefined } });

  const onSubmit = (v: FormValues) => {
    let base = v.goal === 'strength' ? 180 : v.goal === 'hypertrophy' ? 90 : 45; // seconds
    base += (v.lastSetRpe - 7) * 15; // more effort -> more rest
    const final = Math.max(30, Math.min(300, base));
    setRestSec(Math.round(final));
    setAdvice(v.goal === 'strength' ? 'Prioritize full recovery for neural performance.' : v.goal === 'hypertrophy' ? 'Aim for a pump while keeping quality reps.' : 'Keep it moving; focus on pace and breathing.');
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="goal" render={({ field }) => (
              <FormItem><FormLabel>Primary Goal</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="strength">Strength</SelectItem><SelectItem value="hypertrophy">Hypertrophy</SelectItem><SelectItem value="endurance">Muscular Endurance</SelectItem></SelectContent></Select></FormItem>
            )} />
            <FormField control={form.control} name="lastSetRpe" render={({ field }) => (
              <FormItem><FormLabel>Last Set RPE (1–10)</FormLabel><FormControl><Input type="number" step="1" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Recommend Rest</Button>
        </form>
      </Form>

      {restSec !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Timer className="h-8 w-8 text-primary" /><CardTitle>Suggested Rest Interval</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{Math.round(restSec)} sec</p>
              <CardDescription>{advice}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <RestGuide />
    </div>
  );
}

function RestGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Rest Between Sets – Evidence‑Based Ranges" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="Typical rest prescriptions for strength, hypertrophy, and endurance; how RPE and exercise selection modify rest length." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Guidelines</h2>
      <ul className="list-disc ml-6 space-y-1"><li>Strength (compound lifts): 2–4 minutes</li><li>Hypertrophy: 60–120 seconds</li><li>Endurance/circuit: 30–60 seconds</li></ul>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2">
        <p><Link href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</Link></p>
        <p><Link href="/category/health-fitness/heart-rate-zone-training-calculator" className="text-primary underline">Heart Rate Zone Calculator</Link></p>
      </div>
    </section>
  );
}