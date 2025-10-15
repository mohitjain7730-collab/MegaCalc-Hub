'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag } from 'lucide-react';
import Link from 'next/link';

const roundSchema = z.object({ score: z.number().positive().optional(), rating: z.number().positive().optional(), slope: z.number().positive().optional() });
const formSchema = z.object({ rounds: z.array(roundSchema).max(20).optional() });
type FormValues = z.infer<typeof formSchema>;

function computeDifferential(score?: number, rating?: number, slope?: number) {
  if (!score || !rating || !slope) return undefined;
  return (score - rating) * (113 / slope);
}

function computeHandicap(values: FormValues) {
  const diffs = (values.rounds || [])
    .map(r => computeDifferential(r.score, r.rating, r.slope))
    .filter((d): d is number => typeof d === 'number' && isFinite(d))
    .sort((a,b) => a - b);
  if (diffs.length === 0) return null;
  // Use best 8 of last 20, or best 1–8 depending on number of scores
  const count = diffs.length >= 20 ? 8 : Math.max(1, Math.floor(diffs.length / 3));
  const avg = diffs.slice(0, count).reduce((s,v)=>s+v,0) / count;
  return Math.round(avg * 10) / 10; // 1 decimal
}

export default function GolfHandicapCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { rounds: Array.from({ length: 5 }, () => ({ score: undefined, rating: undefined, slope: undefined })) } });
  const { fields } = useFieldArray({ control: form.control, name: 'rounds' });
  const onSubmit = (v: FormValues) => setResult(computeHandicap(v));

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {fields.map((f, idx) => (
              <div key={f.id} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <FormField control={form.control} name={`rounds.${idx}.score` as const} render={({ field }) => (<FormItem><FormLabel>Score</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
                <FormField control={form.control} name={`rounds.${idx}.rating` as const} render={({ field }) => (<FormItem><FormLabel>Course Rating</FormLabel><FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl></FormItem>)} />
                <FormField control={form.control} name={`rounds.${idx}.slope` as const} render={({ field }) => (<FormItem><FormLabel>Slope</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseInt(e.target.value)||undefined)} /></FormControl></FormItem>)} />
              </div>
            ))}
          </div>
          <Button type="submit">Estimate Handicap Index</Button>
        </form>
      </Form>
      {result !== null && (
        <Card className="mt-8"><CardHeader><div className="flex items-center gap-4"><Flag className="h-8 w-8 text-primary" /><CardTitle>Estimated Handicap Index</CardTitle></div><CardDescription>Based on score differentials</CardDescription></CardHeader><CardContent><p className="text-4xl font-bold text-center">{result.toFixed(1)}</p></CardContent></Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Golf Handicap Calculator – Quick Handicap Index Estimate" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Estimate a handicap index using score differentials from recent rounds." />
        <h2 className="text-xl font-bold text-foreground">Guide: Getting a Reliable Estimate</h2>
        <ul className="list-disc ml-6 space-y-1"><li>Use recent rounds from rated tees.</li><li>More rounds produce a more stable estimate.</li><li>Official handicaps are issued by governing bodies; this is a guide.</li></ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/running-pace-calculator">Running Pace</Link></p>
      </div>
    </div>
  );
}


