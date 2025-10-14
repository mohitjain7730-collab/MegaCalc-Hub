'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Brain } from 'lucide-react';
import Link from 'next/link';

const items = [
  'Feeling unable to control important things',
  'Confidence in handling personal problems',
  'Things going your way',
  'Difficulties piling up too high to overcome',
  'Feeling stressed by unexpected events',
];

const formSchema = z.object({ scores: z.array(z.number().min(0).max(4)).length(items.length) });
type FormValues = z.infer<typeof formSchema>;

export default function StressLevelSelfAssessmentCalculator() {
  const [score, setScore] = useState<number | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { scores: Array(items.length).fill(undefined) } as unknown as FormValues });

  const onSubmit = (v: FormValues) => {
    const total = v.scores.reduce((s, x) => s + (x ?? 0), 0);
    setScore(total);
    let text = 'Moderate stress—use basic coping strategies and routines.';
    if (total <= 6) text = 'Low stress—keep healthy habits.';
    else if (total >= 14) text = 'High stress—consider speaking with a professional and adjusting workload.';
    setOpinion(text);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-6">
            {items.map((label, i) => (
              <FormField key={i} control={form.control} name={`scores.${i}` as const} render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-foreground">{label}</FormLabel>
                  <FormControl>
                    <Slider min={0} max={4} step={1} defaultValue={[0]} value={[field.value ?? 0]} onValueChange={(v) => field.onChange(v[0])} />
                  </FormControl>
                </FormItem>
              )} />
            ))}
          </div>
          <Button type="submit">Get Stress Score</Button>
        </form>
      </Form>

      {score !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Brain className="h-8 w-8 text-primary" /><CardTitle>Stress Self‑Assessment</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">Score: {score} / 20</p>
              <CardDescription>{opinion}</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <StressGuide />
    </div>
  );
}

function StressGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Stress Self‑Assessment – Practical Coping and When to Seek Help" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="Using brief scales to monitor stress, daily coping strategies, social support, exercise, sleep, and red flags." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">How to Use This Score</h2>
      <p itemProp="description">Track once weekly in similar conditions. Look at trends, not single numbers. Combine with simple habits—walks, time outdoors, consistent sleep, and talking with friends or a counselor when needed.</p>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2"><p><Link href="/category/health-fitness/sleep-debt-calculator-hf" className="text-primary underline">Sleep Debt Calculator</Link></p><p><Link href="/category/health-fitness/hydration-needs-calculator" className="text-primary underline">Hydration Needs Calculator</Link></p></div>
    </section>
  );
}