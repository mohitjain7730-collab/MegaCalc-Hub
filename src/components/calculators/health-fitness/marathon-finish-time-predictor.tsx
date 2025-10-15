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
  recentRaceDistanceKm: z.number().positive().optional(),
  recentRaceTimeMinutes: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Riegel formula: T2 = T1 * (D2/D1)^1.06
function predictMarathonMinutes(distanceKm: number, timeMin: number) {
  const marathonKm = 42.195;
  return timeMin * Math.pow(marathonKm / distanceKm, 1.06);
}

function fmtHMS(totalMinutes: number) {
  const totalSeconds = Math.round(totalMinutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

export default function MarathonFinishTimePredictor() {
  const [result, setResult] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { recentRaceDistanceKm: undefined, recentRaceTimeMinutes: undefined } });
  const onSubmit = (v: FormValues) => {
    if (!v.recentRaceDistanceKm || !v.recentRaceTimeMinutes) return setResult('Please fill both inputs.');
    const minutes = predictMarathonMinutes(v.recentRaceDistanceKm, v.recentRaceTimeMinutes);
    setResult(fmtHMS(minutes));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="recentRaceDistanceKm" render={({ field }) => (<FormItem><FormLabel>Recent Race Distance (km)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="recentRaceTimeMinutes" render={({ field }) => (<FormItem><FormLabel>Recent Race Time (minutes)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
          </div>
          <Button type="submit">Predict Marathon Time</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8"><CardHeader><div className="flex items-center gap-4"><Timer className="h-8 w-8 text-primary" /><CardTitle>Predicted Finish Time</CardTitle></div><CardDescription>Based on Riegel endurance model</CardDescription></CardHeader><CardContent><p className="text-3xl font-bold text-center">{result}</p></CardContent></Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Marathon Finish Time Predictor – Riegel Formula" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Predict marathon time from a recent race using the Riegel model and tune your pacing." />
        <h2 className="text-xl font-bold text-foreground">Guide: Using the Prediction</h2>
        <ul className="list-disc ml-6 space-y-1"><li>Match training to goal pace and fuel plan.</li><li>Account for heat, elevation, and course profile.</li><li>Use tune‑up races to refine inputs.</li></ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/running-pace-calculator">Running Pace</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/vo2-max-calculator">VO₂ Max</Link></p>
      </div>
    </div>
  );
}


