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
import { Zap, AlertTriangle, Moon, Activity, Wind, Calendar } from 'lucide-react';

const formSchema = z.object({
  sleepHours: z.number().min(4).max(12).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  exerciseDays: z.number().min(0).max(7).optional(),
  meditationMinutes: z.number().min(0).max(120).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  stressScore: number;
  category: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Assess current sleep, stress, exercise, and meditation habits to establish baseline' },
  { week: 2, focus: 'Prioritize 7–9 hours of quality sleep per night with consistent bedtime routine' },
  { week: 3, focus: 'Add daily stress management: 10–20 minutes meditation or breathing exercises' },
  { week: 4, focus: 'Include regular exercise (3–5 days/week) but avoid excessive training' },
  { week: 5, focus: 'Limit caffeine and alcohol, especially in the evening' },
  { week: 6, focus: 'Practice relaxation techniques: progressive muscle relaxation or yoga' },
  { week: 7, focus: 'Reassess stress response score and compare improvements' },
  { week: 8, focus: 'Maintain healthy habits and continue monitoring stress levels' },
];

const faqs: [string, string][] = [
  ['What is cortisol?', 'Cortisol is a stress hormone produced by the adrenal glands. It helps regulate metabolism, immune function, and stress response. Chronic elevation can lead to health issues.'],
  ['How is cortisol stress response estimated?', 'This calculator estimates stress response based on lifestyle factors: sleep hours, self-reported stress level, exercise frequency, and meditation practice.'],
  ['What is a good stress response score?', 'Higher scores (70+) indicate better stress management. Lower scores suggest higher stress hormone activity and may benefit from lifestyle interventions.'],
  ['What causes high cortisol?', 'Chronic stress, poor sleep, excessive exercise, caffeine, alcohol, and lack of recovery can elevate cortisol levels.'],
  ['How can I lower my cortisol?', 'Improve sleep (7–9 hours), practice stress management (meditation, breathing), engage in moderate exercise, limit caffeine/alcohol, and maintain consistent routines.'],
  ['Does exercise affect cortisol?', 'Yes. Moderate exercise can help manage cortisol, but excessive or intense training without recovery can elevate it. Balance is key.'],
  ['Can meditation reduce cortisol?', 'Yes, regular meditation and breathing exercises have been shown to reduce cortisol levels and improve stress response.'],
  ['How much sleep do I need?', 'Most adults need 7–9 hours of quality sleep per night. Inadequate sleep can significantly elevate cortisol levels.'],
  ['Is high cortisol dangerous?', 'Chronic high cortisol can contribute to weight gain, sleep issues, mood problems, and increased disease risk. Managing stress is important.'],
  ['Should I get my cortisol tested?', 'If you have persistent symptoms of high cortisol (fatigue, weight gain, sleep issues), consult healthcare providers for evaluation and testing.'],
];

const understandingInputs = [
  { label: 'Sleep Hours (per night)', description: 'Average hours of sleep per night. Most adults need 7–9 hours for optimal cortisol regulation.' },
  { label: 'Stress Level (1–10)', description: 'Self-reported stress level where 1 is minimal stress and 10 is extreme stress.' },
  { label: 'Exercise Days (per week)', description: 'Number of days per week you engage in physical exercise (0–7).' },
  { label: 'Meditation (minutes/day)', description: 'Daily minutes spent in meditation, breathing exercises, or relaxation practices.' },
];

const interpret = (score: number) => {
  if (score >= 80) return 'Low stress response—well managed. Your lifestyle supports healthy cortisol regulation.';
  if (score >= 50) return 'Moderate stress response—room for improvement. Focus on sleep, stress management, and recovery.';
  if (score >= 30) return 'Elevated stress response—prioritize recovery. Increase sleep, stress management, and reduce stressors.';
  return 'High stress response—focus on recovery. Immediate attention to sleep, stress reduction, and lifestyle modifications needed.';
};

const recommendations = (score: number) => [
  'Prioritize 7–9 hours of quality sleep per night with consistent sleep schedule',
  score < 50 ? 'Increase stress management: daily meditation (10–20 min), breathing exercises, or relaxation techniques' : 'Maintain current stress management practices',
  'Engage in regular moderate exercise (3–5 days/week) but avoid excessive training without recovery',
  'Limit caffeine and alcohol, especially in the evening, as they can disrupt cortisol regulation',
];

const warningSigns = () => [
  'This calculator is an educational estimate, not a medical diagnosis. Consult healthcare providers for cortisol testing if needed.',
  'Persistent symptoms like chronic fatigue, weight gain, sleep issues, or mood problems may warrant medical evaluation.',
  'Avoid excessive exercise or training without adequate recovery, as this can elevate cortisol.',
];

export default function CortisolStressResponseEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sleepHours: undefined,
      stressLevel: undefined,
      exerciseDays: undefined,
      meditationMinutes: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { sleepHours, stressLevel, exerciseDays, meditationMinutes } = values;
    if (sleepHours == null || stressLevel == null || exerciseDays == null || meditationMinutes == null) {
      setResult(null);
      return;
    }

    let score = 50; // baseline
    
    // Sleep impact
    if (sleepHours >= 8) score += 15;
    else if (sleepHours >= 7) score += 10;
    else if (sleepHours >= 6) score += 5;
    else score -= 10;
    
    // Stress level impact
    score -= (stressLevel - 5) * 8;
    
    // Exercise impact
    if (exerciseDays >= 5) score += 10;
    else if (exerciseDays >= 3) score += 5;
    else if (exerciseDays === 0) score -= 5;
    
    // Meditation impact
    if (meditationMinutes >= 20) score += 10;
    else if (meditationMinutes >= 10) score += 5;
    else if (meditationMinutes === 0) score -= 5;
    
    score = Math.max(0, Math.min(100, score));

    let category = 'Moderate';
    if (score < 30) category = 'High';
    else if (score < 50) category = 'Elevated';
    else if (score >= 80) category = 'Low';

    setResult({
      status: 'Calculated',
      interpretation: interpret(score),
      recommendations: recommendations(score),
      warningSigns: warningSigns(),
      plan: plan(),
      stressScore: Math.round(score),
      category,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Cortisol Stress Response Estimator</CardTitle>
          <CardDescription>Estimate your stress hormone response based on lifestyle factors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField control={form.control} name="sleepHours" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Moon className="h-4 w-4" /> Sleep Hours (per night)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.5" placeholder="e.g., 7.5" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="stressLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Stress Level (1–10)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="1" max="10" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="exerciseDays" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Activity className="h-4 w-4" /> Exercise Days/week</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" max="7" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="meditationMinutes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Wind className="h-4 w-4" /> Meditation (min/day)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Estimate Stress Response</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Stress Response Summary</CardTitle></div>
              <CardDescription>Estimated cortisol stress response based on lifestyle factors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Stress Score</h4><p className="text-2xl font-bold text-primary">{result.stressScore}/100</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Stress Management Plan</CardTitle></CardHeader>
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
          <CardDescription>Honest self-assessment provides more accurate stress response estimation</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for stress and recovery management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/heart-rate-variability-hrv-score-calculator" className="text-primary hover:underline">HRV Score</Link></h4><p className="text-sm text-muted-foreground">Monitor autonomic nervous system balance and recovery.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/sleep-debt-calculator-hf" className="text-primary hover:underline">Sleep Debt</Link></h4><p className="text-sm text-muted-foreground">Track sleep patterns and recovery needs.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/meditation-breathing-rate-calculator" className="text-primary hover:underline">Meditation Breathing Rate</Link></h4><p className="text-sm text-muted-foreground">Practice breathing techniques for stress reduction.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary hover:underline">Stress Level Assessment</Link></h4><p className="text-sm text-muted-foreground">Evaluate overall stress levels and coping strategies.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Understanding Cortisol and Stress</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Cortisol is a stress hormone that helps regulate metabolism, immune function, and stress response. Chronic elevation can contribute to health issues. Manage cortisol through quality sleep (7–9 hours), stress management (meditation, breathing), regular moderate exercise, limiting caffeine/alcohol, and maintaining consistent routines. If you have persistent symptoms, consult healthcare providers for evaluation.</p>
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
