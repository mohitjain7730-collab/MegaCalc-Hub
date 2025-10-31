'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
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

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Plan fueling around training</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/daily-calorie-needs-calculator" className="text-primary hover:underline">Daily Calorie Needs</Link></h4>
              <p className="text-sm text-muted-foreground">Estimate total energy requirement.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/macro-ratio-calculator" className="text-primary hover:underline">Macro Ratio Calculator</Link></h4>
              <p className="text-sm text-muted-foreground">Balance carbs, protein, and fat.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/carbohydrate-intake-calculator" className="text-primary hover:underline">Carbohydrate Intake</Link></h4>
              <p className="text-sm text-muted-foreground">Daily carb targets by activity.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-volume-calculator" className="text-primary hover:underline">Training Volume</Link></h4>
              <p className="text-sm text-muted-foreground">Track sets × reps × weight.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Glycogen & Performance</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
          <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO‑friendly answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ['How much glycogen can muscles store?', 'Well-trained athletes may store several hundred grams depending on muscle mass and nutrition; this tool provides a personalized estimate.'],
            ['What increases glycogen storage?', 'Higher carbohydrate intake, progressive training volume, and post‑workout refueling support glycogen supercompensation.'],
            ['Does creatine affect glycogen?', 'Creatine can improve training quality and may indirectly support greater glycogen storage via increased workload.'],
            ['How fast is glycogen replenished?', 'Most stores replenish within 24–48 hours with adequate carbohydrate and calories; faster with frequent carb-rich meals.'],
            ['Should I carb load?', 'Before long races or blocks with high intensity, carb loading can raise stores; practice during training first.'],
            ['What are signs of low glycogen?', 'Early fatigue, heavy legs, and performance drop at moderate intensities often indicate depleted stores.'],
            ['Do low‑carb diets reduce glycogen?', 'Yes, habitual low‑carb intakes lower glycogen content, which may limit high‑intensity performance.'],
            ['How accurate is this estimate?', 'It uses simplified assumptions about muscle mass and concentration; actual values vary by fiber type and training status.'],
          ].map(([q,a],i)=> (<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}
        </CardContent>
      </Card>
    </div>
  );
}


