'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  swimDistanceKm: z.number().nonnegative().optional(),
  swimPaceMinPerKm: z.number().nonnegative().optional(),
  t1Minutes: z.number().nonnegative().optional(),
  bikeDistanceKm: z.number().nonnegative().optional(),
  bikeSpeedKph: z.number().nonnegative().optional(),
  t2Minutes: z.number().nonnegative().optional(),
  runDistanceKm: z.number().nonnegative().optional(),
  runPaceMinPerKm: z.number().nonnegative().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function fmtHMS(totalMinutes: number) {
  const totalSeconds = Math.round(totalMinutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

export default function TriathlonSplitTimeCalculator() {
  const [result, setResult] = useState<{ swim: string; t1: string; bike: string; t2: string; run: string; total: string } | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: {} as any });
  const onSubmit = (v: FormValues) => {
    const swim = (v.swimDistanceKm || 0) * (v.swimPaceMinPerKm || 0);
    const t1 = v.t1Minutes || 0;
    const bike = (v.bikeDistanceKm || 0) / Math.max(1e-9, (v.bikeSpeedKph || 0)) * 60;
    const t2 = v.t2Minutes || 0;
    const run = (v.runDistanceKm || 0) * (v.runPaceMinPerKm || 0);
    const total = swim + t1 + bike + t2 + run;
    setResult({ swim: fmtHMS(swim), t1: fmtHMS(t1), bike: fmtHMS(bike), t2: fmtHMS(t2), run: fmtHMS(run), total: fmtHMS(total) });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="swimDistanceKm" render={({ field }) => (<FormItem><FormLabel>Swim Distance (km)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="swimPaceMinPerKm" render={({ field }) => (<FormItem><FormLabel>Swim Pace (min/km)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="t1Minutes" render={({ field }) => (<FormItem><FormLabel>T1 (minutes)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="bikeDistanceKm" render={({ field }) => (<FormItem><FormLabel>Bike Distance (km)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="bikeSpeedKph" render={({ field }) => (<FormItem><FormLabel>Bike Speed (km/h)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="t2Minutes" render={({ field }) => (<FormItem><FormLabel>T2 (minutes)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="runDistanceKm" render={({ field }) => (<FormItem><FormLabel>Run Distance (km)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="runPaceMinPerKm" render={({ field }) => (<FormItem><FormLabel>Run Pace (min/km)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
          </div>
          <Button type="submit">Calculate Splits</Button>
        </form>
      </Form>

      {result && (
        <Card className="mt-8"><CardHeader><div className="flex items-center gap-4"><Timer className="h-8 w-8 text-primary" /><CardTitle>Split Times</CardTitle></div><CardDescription>Swim + T1 + Bike + T2 + Run</CardDescription></CardHeader><CardContent><div className="grid grid-cols-1 sm:grid-cols-2 gap-2"><div><strong>Swim:</strong> {result.swim}</div><div><strong>T1:</strong> {result.t1}</div><div><strong>Bike:</strong> {result.bike}</div><div><strong>T2:</strong> {result.t2}</div><div><strong>Run:</strong> {result.run}</div><div className="font-semibold"><strong>Total:</strong> {result.total}</div></div></CardContent></Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Triathlon Split Time Calculator – Plan Your Race" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Estimate triathlon splits from distances, paces, and transitions to plan race day." />
        <h2 className="text-xl font-bold text-foreground">Guide: Executing the Plan</h2>
        <ul className="list-disc ml-6 space-y-1"><li>Set realistic paces from training data.</li><li>Practice transitions to save easy time.</li><li>Confirm fueling by leg and terrain.</li></ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/running-pace-calculator">Running Pace</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/cycling-power-output-calculator">Cycling Power Output</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/swimming-lap-time-calculator">Swimming Lap Time</Link></p>
      </div>
    </div>
  );
}


