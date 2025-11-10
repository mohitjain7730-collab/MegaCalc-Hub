'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Zap, Wind, Flame, Timer, Gauge, Calendar } from 'lucide-react';

const formSchema = z.object({
  exerciseKcal: z.number().min(50).max(2000).optional(),
  intensity: z.enum(['moderate', 'high', 'very_high']).optional(),
  durationMin: z.number().min(10).max(180).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  epocKcal: number;
  epocDurationHours: number;
  category: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Track exercise calories and intensity to establish baseline EPOC estimates' },
  { week: 2, focus: 'Include 2–3 high-intensity interval sessions to maximize EPOC' },
  { week: 3, focus: 'Add resistance training sessions to boost post-exercise metabolism' },
  { week: 4, focus: 'Deload week: reduce intensity, maintain volume for recovery' },
  { week: 5, focus: 'Vary workout intensities and durations to optimize EPOC response' },
  { week: 6, focus: 'Include longer moderate-intensity sessions to accumulate EPOC' },
  { week: 7, focus: 'Reassess EPOC estimates and adjust training accordingly' },
  { week: 8, focus: 'Plan next cycle with balanced high-intensity and recovery sessions' },
];

const faqs: [string, string][] = [
  ['What is EPOC (Oxygen Debt)?', 'Excess Post-Exercise Oxygen Consumption (EPOC) is the elevated oxygen consumption and calorie burn that occurs after exercise as your body works to restore homeostasis.'],
  ['How is EPOC calculated?', 'EPOC is estimated as a percentage of exercise calories burned, varying by intensity (5–18%) and duration. Higher intensity and longer duration increase EPOC.'],
  ['What causes EPOC?', 'EPOC results from replenishing ATP and creatine phosphate stores, removing lactate, restoring oxygen levels, normalizing body temperature and heart rate, and repairing muscle tissue.'],
  ['How long does EPOC last?', 'EPOC duration varies from 1–24 hours depending on exercise intensity and duration. Very high-intensity sessions can elevate metabolism for several hours.'],
  ['Does intensity affect EPOC?', 'Yes, higher intensity exercises produce greater EPOC. Very high-intensity sessions (85%+ max) can generate EPOC of 15–18% of exercise calories.'],
  ['Does duration affect EPOC?', 'Yes, longer exercise sessions generally increase EPOC magnitude and duration, especially when combined with high intensity.'],
  ['Can I maximize EPOC for weight loss?', 'Yes, by including high-intensity interval training (HIIT), resistance training, and varying workout intensities. However, overall calorie balance is still most important.'],
  ['Is EPOC the same as afterburn?', 'Yes, EPOC is often called the "afterburn effect" because it represents additional calories burned after exercise ends.'],
  ['Does fitness level affect EPOC?', 'Yes, fitter individuals may have lower EPOC at the same absolute intensity, but can achieve higher EPOC through greater relative intensity and volume.'],
  ['How often should I train for high EPOC?', 'Include 2–3 high-intensity sessions per week with adequate recovery. Balance EPOC-focused sessions with aerobic base and recovery work.'],
];

const understandingInputs = [
  { label: 'Exercise Calories (kcal)', description: 'Total calories burned during the exercise session (estimated from activity, duration, and intensity).' },
  { label: 'Intensity Level', description: 'Exercise intensity: Moderate (60–70% max), High (70–85% max), or Very High (85%+ max).' },
  { label: 'Duration (minutes)', description: 'Length of the exercise session in minutes.' },
];

const interpret = (epocKcal: number) => {
  if (epocKcal >= 100) return 'High EPOC—excellent metabolic stimulus. This workout will continue burning calories for several hours post-exercise.';
  if (epocKcal >= 50) return 'Moderate EPOC—good workout with meaningful post-exercise calorie burn.';
  if (epocKcal >= 20) return 'Low EPOC—consider increasing intensity or duration to maximize metabolic benefits.';
  return 'Very low EPOC—focus on higher intensity or longer duration for greater post-exercise effects.';
};

const recommendations = (epocKcal: number) => [
  'Include 2–3 high-intensity interval sessions per week to maximize EPOC',
  epocKcal < 50 ? 'Increase exercise intensity or duration to boost EPOC response' : 'Balance high-EPOC sessions with aerobic base and recovery work',
  'Add resistance training to your routine, as it often produces significant EPOC',
];

const warningSigns = () => [
  'Avoid excessive high-intensity training without adequate recovery—this can lead to overtraining',
  'Stop immediately if you experience chest pain, dizziness, or severe shortness of breath during exercise',
  'Consult a healthcare provider before high-intensity training if you have cardiovascular risk factors',
];

export default function OxygenDebtEpocCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exerciseKcal: undefined,
      intensity: undefined,
      durationMin: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { exerciseKcal, intensity, durationMin } = values;
    if (exerciseKcal == null || intensity == null || durationMin == null) {
      setResult(null);
      return;
    }

    let epocFactor = 0.06;
    let durationFactor = 1.0;

    if (intensity === 'moderate') {
      epocFactor = 0.05;
      durationFactor = 0.8;
    } else if (intensity === 'high') {
      epocFactor = 0.12;
      durationFactor = 1.2;
    } else if (intensity === 'very_high') {
      epocFactor = 0.18;
      durationFactor = 1.5;
    }

    const durationAdjustment = Math.min(1.5, 1 + (durationMin - 30) / 60);
    epocFactor *= durationAdjustment;

    const epocKcal = exerciseKcal * epocFactor;
    const epocDurationHours = Math.min(24, Math.max(1, durationMin * 0.1 + 15));

    let category = 'Moderate';
    if (epocKcal >= 100) category = 'High';
    else if (epocKcal >= 50) category = 'Moderate';
    else if (epocKcal >= 20) category = 'Low';
    else category = 'Very Low';

    setResult({
      status: 'Calculated',
      interpretation: interpret(epocKcal),
      recommendations: recommendations(epocKcal),
      warningSigns: warningSigns(),
      plan: plan(),
      epocKcal: Math.round(epocKcal),
      epocDurationHours: Math.round(epocDurationHours * 10) / 10,
      category,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wind className="h-5 w-5" /> Oxygen Debt (EPOC) Calculator</CardTitle>
          <CardDescription>Estimate excess post-exercise oxygen consumption and post-workout calorie burn.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="exerciseKcal" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Flame className="h-4 w-4" /> Exercise Calories (kcal)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 400" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="intensity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Intensity Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select intensity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="moderate">Moderate (60–70% max)</SelectItem>
                        <SelectItem value="high">High (70–85% max)</SelectItem>
                        <SelectItem value="very_high">Very High (85%+ max)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="durationMin" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Duration (min)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 45" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate EPOC</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>EPOC Summary</CardTitle></div>
              <CardDescription>Estimated post-exercise oxygen consumption and calorie burn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">EPOC Calories</h4><p className="text-2xl font-bold text-primary">{result.epocKcal} kcal</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">EPOC Duration</h4><p className="text-2xl font-bold text-primary">{result.epocDurationHours} hours</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Category</h4><p className="text-2xl font-bold text-primary">{result.category}</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week EPOC Optimization Plan</CardTitle></CardHeader>
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
          <CardDescription>Accurate inputs ensure reliable EPOC estimates</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it)=>(<li key={it.label}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for metabolic and training analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/post-exercise-oxygen-consumption-calculator" className="text-primary hover:underline">Post-Exercise Oxygen Consumption</Link></h4><p className="text-sm text-muted-foreground">Detailed analysis of post-exercise metabolic effects.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/anaerobic-capacity-calculator" className="text-primary hover:underline">Anaerobic Capacity</Link></h4><p className="text-sm text-muted-foreground">Assess power output for high-intensity efforts.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/training-stress-score-calculator" className="text-primary hover:underline">Training Stress Score</Link></h4><p className="text-sm text-muted-foreground">Quantify training load and recovery needs.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/lactate-accumulation-rate-calculator" className="text-primary hover:underline">Lactate Accumulation</Link></h4><p className="text-sm text-muted-foreground">Understand metabolic stress during exercise.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding EPOC (Oxygen Debt)</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>EPOC represents the elevated oxygen consumption and calorie burn after exercise as your body restores homeostasis. Higher intensity and longer duration increase EPOC magnitude and duration. Include 2–3 high-intensity interval sessions and resistance training per week to maximize EPOC, but balance with adequate recovery and aerobic base work. EPOC contributes to total calorie expenditure but overall energy balance remains most important for weight management.</p>
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
