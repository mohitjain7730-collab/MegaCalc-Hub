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
import { Dumbbell } from 'lucide-react';

// Simplified TSS for cycling/running: TSS = (sec × NP × IF) / (FTP × 3600) × 100
// Here we accept duration (minutes) and Intensity Factor (IF), assuming FTP-normalized power implicit.
const formSchema = z.object({ durationMin: z.number().positive(), intensityFactor: z.number().min(0).max(1.5) });
type FormValues = z.infer<typeof formSchema>;

export default function TrainingStressScoreCalculator() {
  const [tss, setTss] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { durationMin: undefined, intensityFactor: undefined } });
  const onSubmit = (v: FormValues) => {
    const hours = v.durationMin / 60;
    const score = hours * v.intensityFactor * v.intensityFactor * 100; // Common simplified model: TSS = h × IF^2 × 100
    setTss(score);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="durationMin" render={({ field }) => (<FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="intensityFactor" render={({ field }) => (<FormItem><FormLabel>Intensity Factor (IF)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate TSS</Button>
        </form>
      </Form>
      {tss !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Dumbbell className="h-8 w-8 text-primary" /><CardTitle>Training Stress Score</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{tss.toFixed(0)} TSS</p>
              <CardDescription>Rule of thumb: ~50 easy; 75–100 solid; 100+ demanding (context matters).</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <TssGuide />
    </div>
  );
}

export function TssGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Training Stress Score (TSS) Calculator – Guide to Intensity, Duration, and Load" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How TSS is estimated, role of FTP/IF, weekly load planning, recovery strategies, and limitations." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">TSS in Practice</h2>
      <p itemProp="description">TSS combines intensity and duration into one number to represent training load. It’s often used by cyclists and triathletes to plan weekly volume and monitor fatigue.</p>

      <h3 className="font-semibold text-foreground mt-6">Interpreting TSS</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Rough guide: 50–75 (easy), 75–150 (moderate), 150–300 (hard), 300+ (very hard)</li>
        <li>Distribute load across the week; keep easy days easy and hard days purposeful.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Recovery & Readiness</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Track sleep, resting HR/HRV, muscle soreness, and mood.</li>
        <li>Fuel workouts: carbs for effort, protein for repair, hydrate with sodium as needed.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2">
        <p><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary underline">VO2 Max Calculator</Link></p>
        <p><Link href="/category/health-fitness/running-pace-calculator" className="text-primary underline">Running Pace Calculator</Link></p>
        <p><Link href="/category/health-fitness/protein-intake-calculator" className="text-primary underline">Protein Intake Calculator</Link></p>
      </div>
      <p className="italic">TSS here is a simplified estimate for education; training decisions require full context.</p>
    </section>
  );
}


