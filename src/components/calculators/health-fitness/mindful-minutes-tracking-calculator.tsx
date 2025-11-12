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
import { Zap, Clock, Calendar, Timer, Flame } from 'lucide-react';

const formSchema = z.object({
  monday: z.number().min(0).max(480).optional(),
  tuesday: z.number().min(0).max(480).optional(),
  wednesday: z.number().min(0).max(480).optional(),
  thursday: z.number().min(0).max(480).optional(),
  friday: z.number().min(0).max(480).optional(),
  saturday: z.number().min(0).max(480).optional(),
  sunday: z.number().min(0).max(480).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  status: string;
  interpretation: string;
  recommendations: string[];
  warningSigns: string[];
  plan: { week: number; focus: string }[];
  totalMinutes: number;
  weeklyAverage: number;
  streak: number;
  category: string;
};

const plan = (): { week: number; focus: string }[] => [
  { week: 1, focus: 'Start with 5–10 minutes daily. Focus on consistency over duration.' },
  { week: 2, focus: 'Choose a consistent time and place for practice (morning or evening)' },
  { week: 3, focus: 'Try different types: focused attention, body scan, or loving-kindness meditation' },
  { week: 4, focus: 'Use guided meditations or apps if helpful for structure' },
  { week: 5, focus: 'Gradually increase duration to 10–15 minutes as comfort improves' },
  { week: 6, focus: 'Track your practice and celebrate consistency milestones' },
  { week: 7, focus: 'Integrate mindfulness into daily activities (walking, eating, working)' },
  { week: 8, focus: 'Maintain regular practice and adjust duration based on your schedule' },
];

const faqs: [string, string][] = [
  ['How much mindfulness practice do I need?', 'Start with 5–10 minutes daily. Consistency matters more than duration. Many people find 10–20 minutes daily beneficial.'],
  ['What counts as mindful minutes?', 'Formal meditation (sitting, walking), breathing exercises, body scans, and mindful activities (eating, walking) all count toward mindful minutes.'],
  ['Is it better to practice daily or longer sessions?', 'Daily practice, even if shorter, is generally more beneficial than longer but infrequent sessions. Consistency builds habit and benefits.'],
  ['What if I miss a day?', 'Missing a day is normal. Don\'t let it derail your practice. Resume the next day and focus on building consistency over time.'],
  ['How do I track my mindful minutes?', 'Use a journal, app, or this calculator to track daily practice. Many meditation apps include built-in tracking features.'],
  ['What is a good weekly average?', 'Aim for 10–20 minutes daily (70–140 minutes/week) for meaningful benefits. Start lower and build gradually.'],
  ['Can I practice multiple times per day?', 'Yes, multiple shorter sessions (e.g., 5 minutes morning and evening) can be as effective as one longer session.'],
  ['What types of mindfulness practice count?', 'Formal meditation, breathing exercises, body scans, mindful movement (yoga, walking), and mindful activities all contribute to mindful minutes.'],
  ['How long until I see benefits?', 'Some benefits (reduced stress, improved focus) can appear within weeks. Deeper changes may take months of consistent practice.'],
  ['Should I track every minute?', 'Track honestly but don\'t obsess. Approximate times are fine. Focus on the practice itself rather than perfect tracking.'],
];

const understandingInputs = [
  { label: 'Monday–Sunday (minutes)', description: 'Enter the number of minutes spent in mindfulness practice each day (0–480 minutes). Include formal meditation, breathing exercises, body scans, or mindful activities.' },
];

const interpret = (avg: number, streak: number) => {
  if (avg >= 30) return `Excellent commitment—${avg.toFixed(1)} minutes/day average with a ${streak}-day streak. You\'re building a strong mindfulness practice.`;
  if (avg >= 15) return `Developing practice—${avg.toFixed(1)} minutes/day average with a ${streak}-day streak. Continue building consistency.`;
  if (avg >= 5) return `Building habit—${avg.toFixed(1)} minutes/day average with a ${streak}-day streak. Focus on increasing frequency and duration.`;
  return `Getting started—${avg.toFixed(1)} minutes/day average. Every minute counts. Focus on consistency over duration.`;
};

const recommendations = (avg: number, streak: number) => [
  'Prioritize consistency over duration—even 5 minutes daily is better than longer but infrequent sessions',
  avg < 10 ? 'Start with 5–10 minutes daily and gradually increase as you build the habit' : 'Maintain your current practice and consider adding variety (different types of meditation)',
  'Choose a consistent time and place for practice to build routine',
  'Track your practice to maintain motivation and celebrate consistency milestones',
];

const warningSigns = () => [
  'Don\'t force practice if you\'re feeling unwell or overly stressed—gentle, self-compassionate practice is more sustainable',
  'Avoid perfectionism—missing days is normal. Focus on returning to practice rather than maintaining perfect streaks',
  'If mindfulness practice increases anxiety or distress, consider adjusting your approach or consulting a mental health professional',
];

export default function MindfulMinutesTrackingCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monday: undefined,
      tuesday: undefined,
      wednesday: undefined,
      thursday: undefined,
      friday: undefined,
      saturday: undefined,
      sunday: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = values;
    const days = [
      monday ?? 0,
      tuesday ?? 0,
      wednesday ?? 0,
      thursday ?? 0,
      friday ?? 0,
      saturday ?? 0,
      sunday ?? 0,
    ];
    
    const totalMinutes = days.reduce((sum, val) => sum + val, 0);
    const weeklyAverage = totalMinutes / 7;
    
    // Calculate streak (consecutive days with >0 minutes, from most recent)
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i] > 0) streak++;
      else break;
    }

    let category = 'Good consistency';
    if (weeklyAverage < 5) category = 'Building habit';
    else if (weeklyAverage < 15) category = 'Developing practice';
    else if (weeklyAverage >= 30) category = 'Excellent commitment';

    setResult({
      status: 'Calculated',
      interpretation: interpret(weeklyAverage, streak),
      recommendations: recommendations(weeklyAverage, streak),
      warningSigns: warningSigns(),
      plan: plan(),
      totalMinutes,
      weeklyAverage: Math.round(weeklyAverage * 10) / 10,
      streak,
      category,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Mindful Minutes Tracking Calculator</CardTitle>
          <CardDescription>Track your weekly mindfulness practice to build consistency and measure progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <FormField control={form.control} name="monday" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Monday (min)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="0" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="tuesday" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Tuesday (min)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="0" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="wednesday" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Wednesday (min)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="0" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="thursday" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Thursday (min)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="0" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="friday" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Friday (min)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="0" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="saturday" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Saturday (min)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="0" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sunday" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Timer className="h-4 w-4" /> Sunday (min)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" min="0" placeholder="0" value={field.value ?? ''} onChange={(e)=>field.onChange(e.target.value===''?undefined:Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full md:w-auto">Calculate Weekly Summary</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4"><Zap className="h-8 w-8 text-primary" /><CardTitle>Weekly Summary</CardTitle></div>
              <CardDescription>Your mindfulness practice statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Total Minutes</h4><p className="text-2xl font-bold text-primary">{result.totalMinutes}</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Daily Average</h4><p className="text-2xl font-bold text-primary">{result.weeklyAverage} min</p></div>
                <div className="p-4 border rounded"><h4 className="text-sm font-semibold text-muted-foreground">Day Streak</h4><p className="text-2xl font-bold text-primary">{result.streak} days</p></div>
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
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> 8‑Week Mindfulness Practice Plan</CardTitle></CardHeader>
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
          <CardDescription>Track all forms of mindfulness practice for accurate weekly totals</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">{understandingInputs.map((it,i)=>(<li key={i}><span className="font-semibold text-foreground">{it.label}:</span><span className="text-sm text-muted-foreground"> {it.description}</span></li>))}</ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related Calculators</CardTitle>
          <CardDescription>Complementary tools for mindfulness and well-being</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/meditation-breathing-rate-calculator" className="text-primary hover:underline">Meditation Breathing Rate</Link></h4><p className="text-sm text-muted-foreground">Find your optimal breathing rate for meditation practice.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/meditation-time-progress-tracker-calculator" className="text-primary hover:underline">Meditation Progress Tracker</Link></h4><p className="text-sm text-muted-foreground">Track long-term meditation progress and milestones.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/habit-streak-tracker-calculator" className="text-primary hover:underline">Habit Streak Tracker</Link></h4><p className="text-sm text-muted-foreground">Build consistency across multiple habits.</p></div>
            <div className="p-4 border rounded"><h4 className="font-semibold mb-1"><Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary hover:underline">Stress Level Assessment</Link></h4><p className="text-sm text-muted-foreground">Evaluate how mindfulness practice affects stress levels.</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Complete Guide: Building a Mindfulness Practice</CardTitle></CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Building a sustainable mindfulness practice requires consistency over duration. Start with 5–10 minutes daily, choose a consistent time and place, and track your practice to maintain motivation. Include various types: formal meditation, breathing exercises, body scans, and mindful activities. Celebrate consistency milestones and don\'t let missed days derail your practice. Focus on the journey rather than perfection.</p>
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
