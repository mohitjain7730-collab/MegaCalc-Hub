'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeartPulse } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({ peakHr: z.number().positive().max(230), hrAfter1Min: z.number().positive().max(230) });
type FormValues = z.infer<typeof formSchema>;

export default function RecoveryHeartRateCalculator() {
  const [drop, setDrop] = useState<number | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { peakHr: undefined, hrAfter1Min: undefined } });

  const onSubmit = (v: FormValues) => {
    const d = v.peakHr - v.hrAfter1Min;
    setDrop(d);
    let text = 'Normal recovery.';
    if (d >= 30) text = 'Excellent recovery – strong parasympathetic rebound.';
    else if (d < 12) text = 'Slower recovery – consider more aerobic base and rest.';
    setOpinion(text);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="peakHr" render={({ field }) => (<FormItem><FormLabel>Peak HR (end of effort)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="hrAfter1Min" render={({ field }) => (<FormItem><FormLabel>HR After 1 Minute</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Assess Recovery</Button>
        </form>
      </Form>

      {drop !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><HeartPulse className="h-8 w-8 text-primary" /><CardTitle>Recovery Heart Rate</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">Drop: {drop} bpm</p>
              <CardDescription>{opinion}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <RhrGuide />
    </div>
  );
}

function RhrGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Recovery Heart Rate – What Good Recovery Looks Like" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to measure HRR, interpreting 1‑minute HR drop, training and lifestyle factors that improve recovery, and cautions." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Why It Matters</h2>
      <p itemProp="description">Faster post‑exercise HR decline reflects cardiovascular fitness and autonomic balance. Track it after standardized efforts to monitor readiness trends.</p>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2"><p><Link href="/category/health-fitness/heart-rate-zone-training-calculator" className="text-primary underline">Heart Rate Zone Calculator</Link></p><p><Link href="/category/health-fitness/training-stress-score-calculator" className="text-primary underline">TSS Calculator</Link></p></div>
    </section>
  );
}