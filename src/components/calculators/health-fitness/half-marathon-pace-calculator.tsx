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
  targetFinishTimeMinutes: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

function fmt(minPerKm: number) {
  const totalSeconds = Math.round(minPerKm * 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2,'0')} / km`;
}

export default function HalfMarathonPaceCalculator() {
  const [result, setResult] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { targetFinishTimeMinutes: undefined } });
  const onSubmit = (v: FormValues) => {
    if (!v.targetFinishTimeMinutes) return setResult('Enter a target time.');
    const distanceKm = 21.0975;
    setResult(fmt(v.targetFinishTimeMinutes / distanceKm));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField control={form.control} name="targetFinishTimeMinutes" render={({ field }) => (
            <FormItem>
              <FormLabel>Target Half‑Marathon Time (minutes)</FormLabel>
              <FormControl><Input type="number" step="0.1" {...field} value={field.value ?? ''} onChange={(e)=>field.onChange(parseFloat(e.target.value)||undefined)} /></FormControl>
            </FormItem>
          )} />
          <Button type="submit">Calculate Pace</Button>
        </form>
      </Form>
      {result && (<Card className="mt-8"><CardHeader><div className="flex items-center gap-4"><Timer className="h-8 w-8 text-primary" /><CardTitle>Required Average Pace</CardTitle></div><CardDescription>Steady pace to meet your goal</CardDescription></CardHeader><CardContent><p className="text-3xl font-bold text-center">{result}</p></CardContent></Card>)}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Half‑Marathon Pace Calculator – Set Your Goal Pace" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Compute average pace for 21.1 km based on a target finish time, with training tips." />
        <h2 className="text-xl font-bold text-foreground">Guide: Training to the Pace</h2>
        <ul className="list-disc ml-6 space-y-1"><li>Include tempo and long runs near target pace.</li><li>Practice fueling and hydration strategies.</li><li>Use negative splits if the course allows.</li></ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/running-pace-calculator">Running Pace</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/marathon-finish-time-predictor">Marathon Predictor</Link></p>
      </div>
    </div>
  );
}


