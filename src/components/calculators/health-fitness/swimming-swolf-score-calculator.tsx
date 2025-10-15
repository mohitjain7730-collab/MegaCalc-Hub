'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Waves } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  lapTimeSeconds: z.number().positive().optional(),
  strokesPerLap: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SwimmingSwolfScoreCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { lapTimeSeconds: undefined, strokesPerLap: undefined } });
  const onSubmit = (v: FormValues) => {
    if (!v.lapTimeSeconds || !v.strokesPerLap) return setResult(NaN);
    setResult(Math.round(v.lapTimeSeconds + v.strokesPerLap));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="lapTimeSeconds" render={({ field }) => (<FormItem><FormLabel>Lap Time (seconds)</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
            <FormField control={form.control} name="strokesPerLap" render={({ field }) => (<FormItem><FormLabel>Strokes per Lap</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
          </div>
          <Button type="submit">Calculate SWOLF</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8"><CardHeader><div className="flex items-center gap-4"><Waves className="h-8 w-8 text-primary" /><CardTitle>SWOLF Score</CardTitle></div><CardDescription>Time + strokes (lower is better)</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-center">{isNaN(result) ? '-' : result}</p></CardContent></Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Swimming SWOLF Score Calculator – Improve Stroke Efficiency" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Track swim efficiency by combining lap time and stroke count; iterate technique." />
        <h2 className="text-xl font-bold text-foreground">Guide: Making SWOLF Useful</h2>
        <ul className="list-disc ml-6 space-y-1"><li>Compare scores under similar conditions and effort.</li><li>Drills that reduce strokes at equal time usually improve efficiency.</li><li>Balance stroke length and rate; do not chase SWOLF at the cost of speed.</li></ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/swimming-lap-time-calculator">Swimming Lap Time</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/triathlon-split-time-calculator">Triathlon Split Time</Link></p>
      </div>
    </div>
  );
}


