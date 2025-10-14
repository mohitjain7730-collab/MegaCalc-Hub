'use client';

import { useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

const setSchema = z.object({ exercise: z.string().min(1), sets: z.number().nonnegative(), reps: z.number().nonnegative(), weight: z.number().nonnegative() });
const formSchema = z.object({ items: z.array(setSchema).min(1) });
type FormValues = z.infer<typeof formSchema>;

export default function TrainingVolumeCalculator() {
  const [totalVolume, setTotalVolume] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { items: [{ exercise: '', sets: undefined as unknown as number, reps: undefined as unknown as number, weight: undefined as unknown as number }] } });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' });

  const onSubmit = (v: FormValues) => {
    const vol = v.items.reduce((sum, it) => sum + (it.sets || 0) * (it.reps || 0) * (it.weight || 0), 0);
    setTotalVolume(vol);
  };

  const itemsWatch = form.watch('items');
  const previewVolume = useMemo(() => (itemsWatch || []).reduce((s, it) => s + ((it.sets||0)*(it.reps||0)*(it.weight||0)),0), [itemsWatch]);

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <FormField control={form.control} name={`items.${idx}.exercise`} render={({ field }) => (<FormItem><FormLabel>Exercise</FormLabel><FormControl><Input placeholder="e.g., Back Squat" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`items.${idx}.sets`} render={({ field }) => (<FormItem><FormLabel>Sets</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`items.${idx}.reps`} render={({ field }) => (<FormItem><FormLabel>Reps</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name={`items.${idx}.weight`} render={({ field }) => (<FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                <div className="flex items-end"><Button type="button" variant="secondary" onClick={() => remove(idx)}>Remove</Button></div>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ exercise: '', sets: undefined as unknown as number, reps: undefined as unknown as number, weight: undefined as unknown as number })}>Add Exercise</Button>
          </div>
          <Button type="submit">Calculate Volume</Button>
          <p className="text-sm text-muted-foreground">Live preview: {previewVolume.toLocaleString()} kg·reps</p>
        </form>
      </Form>

      {totalVolume !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Dumbbell className="h-8 w-8 text-primary" /><CardTitle>Total Training Volume</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{totalVolume.toLocaleString()} kg·reps</p>
              <CardDescription>Volume is a proxy for workload. Adjust weekly to manage fatigue and drive progress.</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}

      <TvlGuide />
    </div>
  );
}

function TvlGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Training Volume – How Much Work Should You Do?" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="Sets × reps × load as a workload metric, weekly targets by experience, deloads, and how to balance intensity with volume." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Volume</h2>
      <p itemProp="description">Volume is the total work performed. It correlates with hypertrophy but must be balanced with intensity and recovery to prevent overuse and stagnation.</p>

      <h3 className="font-semibold text-foreground mt-6">Practical Targets</h3>
      <ul className="list-disc ml-6 space-y-1"><li>Novice: 8–12 hard sets per muscle/week</li><li>Intermediate: 12–18 sets/week</li><li>Advanced: 10–20 sets/week with periodized focus</li></ul>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2">
        <p><Link href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary underline">1RM Calculator</Link></p>
        <p><Link href="/category/health-fitness/progressive-overload-calculator" className="text-primary underline">Progressive Overload Calculator</Link></p>
      </div>
    </section>
  );
}