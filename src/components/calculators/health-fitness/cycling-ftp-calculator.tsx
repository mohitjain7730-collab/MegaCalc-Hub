'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  testType: z.enum(['20min', 'ramp']).optional(),
  averagePowerWatts: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function estimateFtp(values: FormValues) {
  const p = values.averagePowerWatts || 0;
  if (values.testType === '20min') return 0.95 * p; // 95% of 20‑min average
  if (values.testType === 'ramp') return 0.75 * p; // 75% of peak 1‑min in ramp
  return 0;
}

export default function CyclingFtpCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { testType: undefined, averagePowerWatts: undefined } });
  const onSubmit = (v: FormValues) => setResult(estimateFtp(v));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="testType" render={({ field }) => (<FormItem><FormLabel>Test Type</FormLabel><select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"><option value="" /><option value="20min">20‑minute test (avg power)</option><option value="ramp">Ramp test (peak 1‑min)</option></select></FormItem>)} />
            <FormField control={form.control} name="averagePowerWatts" render={({ field }) => (<FormItem><FormLabel>Average/Peak Power (W)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
          </div>
          <Button type="submit">Estimate FTP</Button>
        </form>
      </Form>
      {result !== null && (<Card className="mt-8"><CardHeader><div className="flex items-center gap-4"><Gauge className="h-8 w-8 text-primary" /><CardTitle>Estimated FTP</CardTitle></div><CardDescription>Functional Threshold Power</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-center">{result.toFixed(0)} W</p></CardContent></Card>)}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Cycling FTP Calculator – Estimate Functional Threshold Power" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Estimate FTP from a 20‑minute test or ramp test to guide training zones." />
        <h2 className="text-xl font-bold text-foreground">Guide: Training With FTP</h2>
        <ul className="list-disc ml-6 space-y-1"><li>Use FTP to set power zones for structured workouts.</li><li>Re‑test every 6–8 weeks to track progress.</li><li>Consider fatigue, heat, and altitude when interpreting results.</li></ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/training-stress-score-calculator">Training Stress Score</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/cycling-power-output-calculator">Cycling Power Output</Link></p>
      </div>
    </div>
  );
}


