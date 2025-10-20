'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Zap } from 'lucide-react';

const formSchema = z.object({
  bodyMassKg: z.number().positive('Enter mass in kg').optional(),
  skeletalMusclePercent: z.number().min(10).max(60).optional(),
  glycogenPerKgMuscleG: z.number().min(50).max(800).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GlycogenStorageCapacityCalculator() {
  const [result, setResult] = useState<{ glycogenG: number; energyKcal: number; interpretation: string; opinion: string } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { bodyMassKg: undefined, skeletalMusclePercent: undefined, glycogenPerKgMuscleG: undefined },
  });

  const calculate = (v: FormValues) => {
    if (v.bodyMassKg == null || v.skeletalMusclePercent == null || v.glycogenPerKgMuscleG == null) return null;
    const muscleKg = v.bodyMassKg * (v.skeletalMusclePercent / 100);
    const glycogenG = muscleKg * v.glycogenPerKgMuscleG;
    const energyKcal = glycogenG * 4; // approximate
    return { glycogenG, energyKcal };
  };

  const interpret = (g: number) => {
    if (g > 500) return 'High glycogen reserve, supportive of long-duration or high-intensity performance.';
    if (g >= 300) return 'Moderate glycogen store, adequate for typical training sessions.';
    return 'Lower glycogen capacity—nutrition and training periodization can help increase stores.';
  };

  const opinion = (g: number) => {
    if (g > 500) return 'Maintain carb availability and taper strategies for peak events.';
    if (g >= 300) return 'Carb timing around sessions and weekly long runs/rides can build capacity.';
    return 'Increase carbohydrate intake, consider glycogen-depleting sessions followed by refueling to adapt.';
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (!res) { setResult(null); return; }
    setResult({
      glycogenG: Math.round(res.glycogenG),
      energyKcal: Math.round(res.energyKcal),
      interpretation: interpret(res.glycogenG),
      opinion: opinion(res.glycogenG),
    });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="bodyMassKg" render={({ field }) => (
              <FormItem>
                <FormLabel>Body Mass (kg)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="Enter mass in kg" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="skeletalMusclePercent" render={({ field }) => (
              <FormItem>
                <FormLabel>Skeletal Muscle (% body mass)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="e.g., 40" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="glycogenPerKgMuscleG" render={({ field }) => (
              <FormItem>
                <FormLabel>Glycogen (g per kg muscle)</FormLabel>
                <FormControl>
                  <Input type="number" step="1" placeholder="e.g., 300" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <Button type="submit">Estimate Glycogen Capacity</Button>
        </form>
      </Form>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Glycogen Storage Capacity</CardTitle>
              </div>
              <CardDescription>Total estimated glycogen and energy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-3xl font-bold text-primary">{result.glycogenG} g</p>
              <p className="text-muted-foreground">≈ {result.energyKcal} kcal</p>
              <p className="text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Our Opinion</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">{result.opinion}</p></CardContent>
          </Card>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="guide">
          <AccordionTrigger>Complete Guide: Glycogen & Performance</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-3">
            <h4 className="font-semibold text-foreground">Why Glycogen Matters</h4>
            <p>Glycogen is the primary carbohydrate store in muscle and a key fuel for moderate to high-intensity training.</p>
            <h4 className="font-semibold text-foreground">Ways to Increase Capacity</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Progressive training volume</li>
              <li>Carbohydrate periodization and post-workout fueling</li>
              <li>Adequate sleep and recovery</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="related">
          <AccordionTrigger>Related Calculators</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            <ul className="space-y-1">
              <li><a href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary underline">Daily Calorie Needs</a></li>
              <li><a href="/category/health-fitness/macro-ratio-calculator" className="text-primary underline">Macro Ratio Calculator</a></li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}


