'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

const liftOptions = [
  { value: 'Back Squat', label: 'Back Squat', novice: 1.0, intermediate: 1.5, advanced: 2.0 },
  { value: 'Deadlift', label: 'Deadlift', novice: 1.25, intermediate: 1.75, advanced: 2.25 },
  { value: 'Bench Press', label: 'Bench Press', novice: 0.75, intermediate: 1.0, advanced: 1.5 },
  { value: 'Overhead Press', label: 'Overhead Press', novice: 0.5, intermediate: 0.75, advanced: 1.0 },
  { value: 'Front Squat', label: 'Front Squat', novice: 0.8, intermediate: 1.2, advanced: 1.8 },
  { value: 'Power Clean', label: 'Power Clean', novice: 0.6, intermediate: 0.9, advanced: 1.3 },
  { value: 'Pull-ups', label: 'Pull-ups (Bodyweight)', novice: 0.8, intermediate: 1.2, advanced: 1.6 },
  { value: 'Custom', label: 'Custom Lift', novice: 1.0, intermediate: 1.5, advanced: 2.0 }
];

const formSchema = z.object({ bodyWeight: z.number().positive(), liftWeight: z.number().positive(), liftName: z.string() });
type FormValues = z.infer<typeof formSchema>;

export default function StrengthToWeightRatioCalculator() {
  const [result, setResult] = useState<number | null>(null);
  const [opinion, setOpinion] = useState<string>('');
  const [selectedLift, setSelectedLift] = useState<any>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { bodyWeight: undefined, liftWeight: undefined, liftName: undefined } });

  const onSubmit = (v: FormValues) => {
    const ratio = v.liftWeight / v.bodyWeight;
    setResult(ratio);
    
    const lift = liftOptions.find(l => l.value === v.liftName);
    setSelectedLift(lift);
    
    let text = 'Solid starting point. Build progressively with good technique.';
    if (lift) {
      if (ratio < lift.novice) text = `Below novice level (${lift.novice}×). Focus on fundamentals and steady progression.`;
      else if (ratio >= lift.novice && ratio < lift.intermediate) text = `Novice level (${lift.novice}×). Good foundation - keep building strength.`;
      else if (ratio >= lift.intermediate && ratio < lift.advanced) text = `Intermediate level (${lift.intermediate}×). Strong progress - refine form and programming.`;
      else if (ratio >= lift.advanced) text = `Advanced level (${lift.advanced}×). Excellent relative strength - prioritize recovery.`;
    } else {
      if (ratio < 1) text = 'Below bodyweight. Focus on fundamentals and steady progression.';
      else if (ratio >= 1.5 && ratio < 2) text = 'Strong. Keep refining form and programming.';
      else if (ratio >= 2) text = 'Excellent relative strength. Prioritize recovery to sustain progress.';
    }
    setOpinion(text);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="liftName" render={({ field }) => (
              <FormItem>
                <FormLabel>Lift</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lift" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {liftOptions.map((lift) => (
                      <SelectItem key={lift.value} value={lift.value}>
                        {lift.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="bodyWeight" render={({ field }) => (
              <FormItem><FormLabel>Body Weight (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="liftWeight" render={({ field }) => (
              <FormItem><FormLabel>1RM for Lift (kg)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Ratio</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Dumbbell className="h-8 w-8 text-primary" /><CardTitle>Strength-to-Weight Ratio</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div>
                <p className="text-2xl font-semibold text-muted-foreground">{selectedLift?.label || 'Custom Lift'}</p>
                <p className="text-4xl font-bold">{result.toFixed(2)}× bodyweight</p>
              </div>
              <CardDescription>{opinion}</CardDescription>
              {selectedLift && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Benchmarks for {selectedLift.label}:</p>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="text-center">
                      <p className="font-medium">Novice</p>
                      <p>{selectedLift.novice}× BW</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Intermediate</p>
                      <p>{selectedLift.intermediate}× BW</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Advanced</p>
                      <p>{selectedLift.advanced}× BW</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <StwGuide />
    </div>
  );
}

export function StwGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Strength-to-Weight Ratio – How to Use and Improve It" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="Understanding relative strength, why it matters for athletes and everyday performance, realistic benchmarks, technique, progression models, recovery, and related tools." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">What Is Strength‑to‑Weight?</h2>
      <p itemProp="description">The ratio compares your one‑rep max on a lift to your body weight. It helps normalize strength across different body sizes and is a practical readiness marker for sports and general fitness.</p>

      <h3 className="font-semibold text-foreground mt-6">Available Lifts & Benchmarks</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Back Squat: 1.0× novice, 1.5× intermediate, 2.0× advanced</li>
        <li>Deadlift: 1.25× novice, 1.75× intermediate, 2.25× advanced</li>
        <li>Bench Press: 0.75× novice, 1.0× intermediate, 1.5× advanced</li>
        <li>Overhead Press: 0.5× novice, 0.75× intermediate, 1.0× advanced</li>
        <li>Front Squat: 0.8× novice, 1.2× intermediate, 1.8× advanced</li>
        <li>Power Clean: 0.6× novice, 0.9× intermediate, 1.3× advanced</li>
        <li>Pull-ups: 0.8× novice, 1.2× intermediate, 1.6× advanced</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">How to Improve</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Use progressive overload: add small amounts of load, reps, or sets weekly.</li>
        <li>Prioritize technique, bracing, and full ROM before chasing numbers.</li>
        <li>Fuel training with adequate protein and sleep for recovery.</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
      <div className="space-y-2">
        <p><Link href="/category/health-fitness/one-rep-max-strength-calculator" className="text-primary underline">1‑Rep Max Calculator</Link></p>
        <p><Link href="/category/health-fitness/training-volume-calculator" className="text-primary underline">Training Volume Calculator</Link></p>
        <p><Link href="/category/health-fitness/progressive-overload-calculator" className="text-primary underline">Progressive Overload Calculator</Link></p>
      </div>
    </section>
  );
}