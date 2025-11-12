'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Activity, Calendar, Target, Zap } from 'lucide-react';

const formSchema = z.object({
  weight: z.number().positive().optional(),
  height: z.number().positive().optional(),
  experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  target: z.enum(['fitness', 'endurance', 'power']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  dragFactor: number;
  resistance: number;
  recommendation: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Start with recommended drag factor and focus on proper technique and form' },
  { week: 2, focus: 'Practice steady-state rows at moderate drag factor to build endurance' },
  { week: 3, focus: 'Incorporate interval training with varied drag factors for different workouts' },
  { week: 4, focus: 'Experiment with slightly higher drag factor for power-focused sessions' },
  { week: 5, focus: 'Focus on maintaining consistent split times across different drag factors' },
  { week: 6, focus: 'Increase training volume while maintaining proper form at your drag factor' },
  { week: 7, focus: 'Test performance improvements and adjust drag factor if needed' },
  { week: 8, focus: 'Continue progressive training and monitor performance metrics regularly' },
];

const faqs: [string, string][] = [
  ['What is drag factor in rowing?', 'Drag factor is a measure of resistance on a rowing machine (ergometer). It represents how much air resistance the flywheel creates, typically ranging from 80-200. Higher drag factor means more resistance per stroke.'],
  ['How do I find my optimal drag factor?', 'Optimal drag factor depends on body weight, height, experience level, and training goals. Beginners typically use 100-120, while advanced rowers may use 130-160. The calculator helps determine your ideal setting.'],
  ['Should I use the same drag factor for all workouts?', 'No, vary drag factor based on workout type. Use lower drag (100-120) for endurance and technique work, moderate (120-140) for general fitness, and higher (140-160) for power and strength training.'],
  ['Does drag factor affect my split times?', 'Yes, higher drag factor makes each stroke harder, which can slow split times initially. However, it also builds more power. Lower drag factor allows faster splits but less resistance per stroke.'],
  ['What drag factor do professional rowers use?', 'Elite rowers typically use drag factors between 130-160, depending on their body size and training focus. Most competitive rowers train at 130-140 for general fitness and 150+ for power work.'],
  ['Can drag factor cause injury?', 'Yes, using too high a drag factor can lead to back strain, especially if technique is poor. Start with lower drag factors to perfect form, then gradually increase as strength and technique improve.'],
  ['How does body weight affect drag factor?', 'Heavier rowers can typically handle higher drag factors because they have more body mass to generate power. Lighter rowers may find lower drag factors (100-130) more appropriate for their body size.'],
  ['Should I change drag factor during a workout?', 'Generally, keep drag factor consistent during a workout for accurate performance tracking. However, you may adjust it between different workout segments (e.g., warm-up vs. main set).'],
  ['What is the difference between drag factor and damper setting?', 'Damper setting (1-10) controls air intake to the flywheel, while drag factor is the actual measured resistance. Different machines at the same damper setting can have different drag factors due to machine condition.'],
  ['How often should I check my drag factor?', 'Check drag factor periodically, especially if you notice changes in resistance or when using different machines. Most rowing machines display drag factor on the monitor. Aim to maintain consistency for accurate training comparisons.'],
];

const understandingInputs = [
  { label: 'Weight (kg)', description: 'Your body weight in kilograms. Heavier rowers can typically handle higher drag factors due to greater body mass and power potential.' },
  { label: 'Height (cm)', description: 'Your height in centimeters. Taller rowers with longer levers may benefit from slightly higher drag factors, but technique is more important than height.' },
  { label: 'Experience Level', description: 'Your rowing experience: Beginner (new to rowing), Intermediate (regular training), or Advanced (competitive or high-level training). Experience affects optimal drag factor selection.' },
  { label: 'Training Goal', description: 'Your primary training focus: General Fitness (balanced), Endurance (longer, lower intensity), or Power (strength and speed). Different goals benefit from different drag factors.' },
];

const calculateDragFactor = (values: FormValues) => {
  if (!values.weight || !values.height) return null;
  
  const bmi = values.weight / ((values.height / 100) ** 2);
  
  let baseDragFactor;
  if (values.experience === 'beginner') {
    baseDragFactor = 100 + (bmi * 2);
  } else if (values.experience === 'intermediate') {
    baseDragFactor = 120 + (bmi * 2.5);
  } else {
    baseDragFactor = 140 + (bmi * 3);
  }
  
  if (values.target === 'endurance') {
    baseDragFactor *= 0.8;
  } else if (values.target === 'power') {
    baseDragFactor *= 1.2;
  }
  
  const dragFactor = Math.max(80, Math.min(200, Math.round(baseDragFactor)));
  const resistance = dragFactor * 0.1;
  
  let recommendation;
  if (dragFactor < 100) recommendation = 'Light resistance - good for endurance training';
  else if (dragFactor < 130) recommendation = 'Moderate resistance - balanced training';
  else if (dragFactor < 160) recommendation = 'Heavy resistance - power and strength focus';
  else recommendation = 'Very heavy resistance - advanced power training';
  
  return { dragFactor, resistance, recommendation };
};

const interpret = (dragFactor: number, recommendation: string) => {
  if (dragFactor < 100) return 'Light resistance setting ideal for building endurance and perfecting technique. Focus on maintaining proper form throughout longer sessions.';
  if (dragFactor < 130) return 'Moderate resistance provides balanced training for most rowers. Good for general fitness and developing both endurance and power.';
  if (dragFactor < 160) return 'Heavy resistance setting focuses on power and strength development. Ensure proper technique to prevent injury.';
  return 'Very heavy resistance for advanced athletes. Use for short, intense power sessions. Maintain excellent form to avoid injury.';
};

const recommendations = (dragFactor: number) => {
  const base = [
    'Start with lower drag factors to perfect technique before increasing resistance',
    'Use varied drag factors for different workout types (endurance vs. power)',
    'Focus on maintaining proper form at all drag factor settings',
  ];
  
  if (dragFactor >= 160) {
    return [
      ...base,
      'Use this high drag factor for short, intense power sessions only',
      'Ensure excellent technique to prevent back strain and injury',
      'Include adequate recovery between high-resistance workouts',
    ];
  }
  
  if (dragFactor >= 130) {
    return [
      ...base,
      'Good for power and strength development',
      'Monitor form closely to prevent injury',
      'Balance with lower drag factor sessions for recovery',
    ];
  }
  
  if (dragFactor >= 100) {
    return [
      ...base,
      'Ideal for general fitness and balanced training',
      'Allows for longer training sessions',
      'Good starting point for most rowers',
    ];
  }
  
  return [
    ...base,
    'Perfect for endurance training and technique work',
    'Allows for longer, lower-intensity sessions',
    'Great for beginners learning proper form',
  ];
};

const warningSigns = () => [
  'This calculator provides general guidance. Individual optimal drag factors may vary based on specific fitness level and technique.',
  'If you experience back pain, joint discomfort, or muscle strain, reduce drag factor and focus on proper technique before increasing resistance.',
  'Never sacrifice form for higher drag factor. Poor technique at high resistance significantly increases injury risk.',
];

export default function RowingDragFactorCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: undefined,
      height: undefined,
      experience: undefined,
      target: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const calc = calculateDragFactor(values);
    if (!calc) {
      setResult(null);
      return;
    }

    setResult({
      dragFactor: calc.dragFactor,
      resistance: calc.resistance,
      recommendation: calc.recommendation,
      interpretation: interpret(calc.dragFactor, calc.recommendation),
      recommendations: recommendations(calc.dragFactor),
      warningSigns: warningSigns(),
      plan: plan(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Rowing Drag Factor Calculator</CardTitle>
          <CardDescription>Calculate the optimal drag factor for your rowing machine based on your body composition and training goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Target className="h-4 w-4" /> Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="height" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Target className="h-4 w-4" /> Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 175" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="experience" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select experience level" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="target" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Training Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select training goal" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fitness">General Fitness</SelectItem>
                        <SelectItem value="endurance">Endurance</SelectItem>
                        <SelectItem value="power">Power</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Drag Factor</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Rowing Drag Factor Analysis</CardTitle></div>
              <CardDescription>Recommended drag factor and resistance level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Recommended Drag Factor</h4><p className="text-2xl font-bold text-primary">{result.dragFactor}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Resistance Level</h4><p className="text-2xl font-bold text-primary">{result.resistance.toFixed(1)}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Training Type</h4><p className="text-lg font-bold text-primary">{result.recommendation}</p></div>
              </div>
              <p className="text-sm text-muted-foreground">{result.interpretation}</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.recommendations.map((r,i)=>(<li key={i} className="text-sm text-muted-foreground">{r}</li>))}</ul></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Warning Signs</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2">{result.warningSigns.map((w,i)=>(<li key={i} className="text-sm text-muted-foreground">{w}</li>))}</ul></CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Rowing Training Plan</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left p-2">Week</th><th className="text-left p-2">Focus</th></tr></thead>
                  <tbody>{plan().map(p=>(<tr key={p.week} className="border-b"><td className="p-2">{p.week}</td><td className="p-2">{p.focus}</td></tr>))}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Understanding the Inputs</CardTitle>
          <CardDescription>Key factors affecting optimal drag factor selection</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for rowing and fitness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/vo2-max-calculator" className="text-primary hover:underline">VO2 Max Calculator</Link></h4><p className="text-sm text-muted-foreground">Assess cardiovascular fitness and endurance capacity.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/resting-metabolic-rate-calculator" className="text-primary hover:underline">Resting Metabolic Rate</Link></h4><p className="text-sm text-muted-foreground">Calculate your baseline calorie needs.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/target-heart-rate-calculator" className="text-primary hover:underline">Target Heart Rate</Link></h4><p className="text-sm text-muted-foreground">Determine optimal heart rate zones for training.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/maximal-aerobic-speed-mas-calculator" className="text-primary hover:underline">Maximal Aerobic Speed</Link></h4><p className="text-sm text-muted-foreground">Calculate your aerobic capacity and training zones.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Rowing Drag Factor</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Drag factor is a crucial setting on rowing machines that determines resistance per stroke. Optimal drag factor varies by body size, experience, and training goals. Beginners should start with lower drag factors (100-120) to perfect technique, while advanced rowers may use higher settings (130-160) for power training. Always prioritize proper form over higher resistance to prevent injury and maximize training effectiveness.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Detailed, SEO-oriented answers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{faqs.map(([q,a],i)=>(<div key={i}><h4 className="font-semibold mb-1">{q}</h4><p className="text-sm text-muted-foreground">{a}</p></div>))}</CardContent>
      </Card>
    </div>
  );
}
