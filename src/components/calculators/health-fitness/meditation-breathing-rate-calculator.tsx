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
import { Zap, Wind, Calendar, Timer, Target } from 'lucide-react';

const formSchema = z.object({
  age: z.number().min(18).max(100).optional(),
  experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  goal: z.enum(['relaxation', 'focus', 'energy', 'balance']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  breathsPerMin: number;
  intervalSeconds: number;
  category: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Start with 5–10 minutes daily practice at your calculated breathing rate' },
  { week: 2, focus: 'Practice box breathing (4-4-4-4) or equal breathing for relaxation goals' },
  { week: 3, focus: 'Try 4-7-8 breathing technique for deeper relaxation and stress reduction' },
  { week: 4, focus: 'Experiment with different breathing patterns to find what works best' },
  { week: 5, focus: 'Increase practice duration to 10–15 minutes as comfort improves' },
  { week: 6, focus: 'Focus on smooth, natural breathing without forcing or straining' },
  { week: 7, focus: 'Integrate breathing practice into daily routine (morning, evening, or both)' },
  { week: 8, focus: 'Maintain consistent practice and adjust rate based on your experience' },
];

const faqs: [string, string][] = [
  ['What is the optimal breathing rate for meditation?', 'Optimal rate varies by individual, age, experience, and goal. Generally, 4–8 breaths per minute promotes relaxation, while 8–12 breaths per minute is balanced for daily practice.'],
  ['How is breathing rate calculated?', 'The calculator considers your age, meditation experience level, and goal (relaxation, focus, energy, balance) to recommend a personalized breathing rate.'],
  ['What is box breathing?', 'Box breathing involves inhaling for 4 seconds, holding for 4 seconds, exhaling for 4 seconds, and holding for 4 seconds. It promotes calm and focus.'],
  ['What is 4-7-8 breathing?', '4-7-8 breathing involves inhaling for 4 seconds, holding for 7 seconds, and exhaling for 8 seconds. It\'s effective for relaxation and sleep.'],
  ['Does age affect breathing rate?', 'Yes, younger individuals typically have slightly higher resting breathing rates. The calculator adjusts recommendations based on age.'],
  ['Can beginners use slow breathing rates?', 'Beginners may find very slow rates (4–6 breaths/min) challenging. Start with 8–12 breaths/min and gradually slow down as you gain experience.'],
  ['What breathing rate is best for relaxation?', 'Slower rates (4–8 breaths/min) activate the parasympathetic nervous system and promote deep relaxation.'],
  ['What breathing rate is best for focus?', 'Moderate rates (6–10 breaths/min) can help maintain alert focus during meditation or work.'],
  ['How long should I practice breathing exercises?', 'Start with 5–10 minutes daily and gradually increase to 15–20 minutes as you become more comfortable. Consistency matters more than duration.'],
  ['Can breathing exercises reduce stress?', 'Yes, controlled breathing exercises can activate the parasympathetic nervous system, reduce cortisol, lower heart rate, and promote relaxation.'],
];

const understandingInputs = [
  { label: 'Age (years)', description: 'Your age in years (18–100). Younger individuals may naturally have slightly higher breathing rates.' },
  { label: 'Experience Level', description: 'Your meditation experience: Beginner (new to meditation), Intermediate (some practice), or Advanced (regular practitioner).' },
  { label: 'Meditation Goal', description: 'Your primary goal: Relaxation (deep calm), Focus (mental clarity), Energy (alertness), or Balance (general well-being).' },
];

const interpret = (rate: number, goal: string) => {
  if (rate <= 6) return `Very slow breathing (${rate} breaths/min) promotes deep relaxation and parasympathetic activation. Ideal for ${goal} goals.`;
  if (rate <= 8) return `Slow breathing (${rate} breaths/min) creates a calm, relaxed state. Good for ${goal} meditation.`;
  if (rate <= 12) return `Moderate breathing (${rate} breaths/min) provides balanced awareness. Suitable for ${goal} practice.`;
  return `Faster breathing (${rate} breaths/min) can be energizing. Useful for ${goal} goals requiring alertness.`;
};

const recommendations = (rate: number, experience: string) => [
  'Start with 5–10 minutes daily practice and gradually increase duration as comfort improves',
  experience === 'beginner' ? 'Begin with moderate rates (8–12 breaths/min) before attempting very slow breathing' : 'Experiment with different rates to find what works best for your practice',
  'Use a timer or counting app to maintain consistent breathing intervals',
  'Focus on smooth, natural breathing without forcing or straining',
];

const warningSigns = () => [
  'If you experience dizziness, lightheadedness, or discomfort, slow down or stop and return to normal breathing',
  'Don\'t force very slow breathing rates if you feel uncomfortable—gradually work toward slower rates',
  'Consult healthcare providers if you have respiratory conditions before practicing breathing exercises',
];

export default function MeditationBreathingRateCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      experience: undefined,
      goal: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { age, experience, goal } = values;
    if (age == null || experience == null || goal == null) {
      setResult(null);
      return;
    }

    let baseRate = 12;
    if (age < 30) baseRate = 14;
    else if (age > 60) baseRate = 10;

    if (experience === 'beginner') baseRate += 2;
    else if (experience === 'advanced') baseRate -= 2;

    if (goal === 'relaxation') baseRate -= 2;
    else if (goal === 'focus') baseRate -= 1;
    else if (goal === 'energy') baseRate += 1;

    baseRate = Math.max(4, Math.min(20, baseRate));
    const intervalSeconds = 60 / baseRate;

    let category = 'Balanced';
    if (baseRate <= 6) category = 'Very Slow';
    else if (baseRate <= 8) category = 'Slow';
    else if (baseRate >= 16) category = 'Fast';

    setResult({
      status: 'Calculated',
      interpretation: interpret(baseRate, goal),
      recommendations: recommendations(baseRate, experience),
      warningSigns: warningSigns(),
      plan: plan(),
      breathsPerMin: baseRate,
      intervalSeconds: Math.round(intervalSeconds * 10) / 10,
      category,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wind className="h-5 w-5" /> Meditation Breathing Rate Calculator</CardTitle>
          <CardDescription>Find your optimal breathing rate for meditation based on age, experience, and goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="age" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Age (years)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="e.g., 35" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="experience" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Target className="h-4 w-4" /> Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
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
                <FormField control={form.control} name="goal" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Target className="h-4 w-4" /> Meditation Goal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="relaxation">Relaxation</SelectItem>
                        <SelectItem value="focus">Focus</SelectItem>
                        <SelectItem value="energy">Energy</SelectItem>
                        <SelectItem value="balance">Balance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Breathing Rate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Breathing Rate Summary</CardTitle></div>
              <CardDescription>Personalized breathing rate for your meditation practice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Breaths per Minute</h4><p className="text-2xl font-bold text-primary">{result.breathsPerMin}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Interval</h4><p className="text-2xl font-bold text-primary">{result.intervalSeconds}s</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Breathing Practice Plan</CardTitle></CardHeader>
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
          <CardDescription>Personalize your breathing practice for optimal results</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for mindfulness and stress management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/mindful-minutes-tracking-calculator" className="text-primary hover:underline">Mindful Minutes Tracking</Link></h4><p className="text-sm text-muted-foreground">Track your weekly mindfulness practice time.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/heart-rate-variability-hrv-score-calculator" className="text-primary hover:underline">HRV Score</Link></h4><p className="text-sm text-muted-foreground">Monitor how breathing practice affects recovery.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary hover:underline">Stress Level Assessment</Link></h4><p className="text-sm text-muted-foreground">Evaluate stress levels and coping strategies.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/cortisol-stress-response-estimator" className="text-primary hover:underline">Cortisol Stress Response</Link></h4><p className="text-sm text-muted-foreground">Understand stress hormone response patterns.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Meditation Breathing Techniques</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Optimal breathing rates for meditation vary by individual, age, experience, and goals. Slower rates (4–8 breaths/min) promote deep relaxation, while moderate rates (8–12 breaths/min) support balanced awareness. Start with 5–10 minutes daily, use timers or counting apps, and focus on smooth, natural breathing. Experiment with different patterns (box breathing, 4-7-8) to find what works best for you.</p>
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
