'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({ maxHr: z.number().positive().max(230), restingHr: z.number().positive().max(120) });
type FormValues = z.infer<typeof formSchema>;

function zoneRange(max: number, rest: number, lowPct: number, highPct: number) {
  const reserve = max - rest;
  const low = Math.round(rest + reserve * lowPct);
  const high = Math.round(rest + reserve * highPct);
  return `${low}–${high} bpm`;
}

export default function HeartRateZoneTrainingCalculator() {
  const [zones, setZones] = useState<string[] | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { maxHr: undefined, restingHr: undefined } });
  const onSubmit = (v: FormValues) => {
    const z = [
      zoneRange(v.maxHr, v.restingHr, 0.5, 0.6),
      zoneRange(v.maxHr, v.restingHr, 0.6, 0.7),
      zoneRange(v.maxHr, v.restingHr, 0.7, 0.8),
      zoneRange(v.maxHr, v.restingHr, 0.8, 0.9),
      `${Math.round(v.restingHr + (v.maxHr - v.restingHr) * 0.9)}–${v.maxHr} bpm`,
    ];
    setZones(z);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="maxHr" render={({ field }) => (<FormItem><FormLabel>Maximum Heart Rate (bpm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="restingHr" render={({ field }) => (<FormItem><FormLabel>Resting Heart Rate (bpm)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate Zones</Button>
        </form>
      </Form>

      {zones && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Heart className="h-8 w-8 text-primary" /><CardTitle>Heart Rate Zones (Karvonen)</CardTitle></div></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {['Zone 1 (Recovery)','Zone 2 (Endurance)','Zone 3 (Tempo)','Zone 4 (Threshold)','Zone 5 (VO₂)'].map((label, i) => (
                <div key={i} className="rounded border p-3 text-center">
                  <div className="text-sm text-muted-foreground">{label}</div>
                  <div className="text-lg font-semibold">{zones[i]}</div>
                </div>
              ))}
            </div>
            <CardDescription className="mt-2">Use easier zones for base work and recovery; visit higher zones sparingly to build fitness.</CardDescription>
          </CardContent>
        </Card>
      )}

      <HrGuide />
    </div>
  );
}

function HrGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Heart Rate Training Zones – Using Reserve (Karvonen)" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to compute zones with resting HR, how to use each zone in training, cautions, and related calculators." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Zones Overview</h2>
      <p itemProp="description">Zones are based on heart‑rate reserve (HRR = Max − Rest). Training distribution across zones shapes adaptations—endurance, tempo tolerance, and high‑intensity capacity.</p>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2"><p><Link href="/category/health-fitness/recovery-heart-rate-calculator" className="text-primary underline">Recovery Heart Rate Calculator</Link></p><p><Link href="/category/health-fitness/training-stress-score-calculator" className="text-primary underline">TSS Calculator</Link></p></div>
    </section>
  );
}