'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidget } from '@/components/embed-widget';

const formSchema = z.object({
  targetMinutes: z.number().positive(),
  mon: z.number().min(0),
  tue: z.number().min(0),
  wed: z.number().min(0),
  thu: z.number().min(0),
  fri: z.number().min(0),
  sat: z.number().min(0),
  sun: z.number().min(0)
});
type FormValues = z.infer<typeof formSchema>;

export default function MeditationTimeProgressTrackerCalculator() {
  const [progress, setProgress] = useState<{ total: number; average: number; percentage: number; streak: number; opinion: string } | null>(null);
  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      targetMinutes: undefined, 
      mon: undefined, 
      tue: undefined, 
      wed: undefined, 
      thu: undefined, 
      fri: undefined, 
      sat: undefined, 
      sun: undefined 
    } 
  });

  const onSubmit = (v: FormValues) => {
    const dailyMinutes = [v.mon, v.tue, v.wed, v.thu, v.fri, v.sat, v.sun];
    const total = dailyMinutes.reduce((sum, day) => sum + day, 0);
    const average = total / 7;
    const percentage = (total / (v.targetMinutes * 7)) * 100;
    
    // Calculate streak (consecutive days meeting target)
    let streak = 0;
    for (let i = 0; i < 7; i++) {
      if (dailyMinutes[i] >= v.targetMinutes) {
        streak++;
      } else {
        break;
      }
    }
    
    let opinion = 'Great consistency! Keep building this healthy habit.';
    if (percentage < 50) opinion = 'Start small and build gradually. Even 5-10 minutes daily makes a difference.';
    else if (percentage < 80) opinion = 'Good progress! Try to increase consistency to meet your daily target.';
    else if (percentage >= 100 && streak >= 5) opinion = 'Excellent! You\'ve established a strong meditation practice.';
    
    setProgress({ total, average, percentage, streak, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
            <FormField
              control={form.control}
              name="targetMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred quiet‑time target (minutes per day)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => (
              <FormField
                key={day}
                control={form.control}
                name={day}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="capitalize">{day} minutes of meditation or quiet time</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <Button type="submit">View my meditation routine insight</Button>
        </form>
      </Form>

      {progress && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Brain className="h-8 w-8 text-primary" />
              <CardTitle>Meditation Routine Progress Insight</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div><p className="text-2xl font-bold">{progress.total}</p><p className="text-sm text-muted-foreground">Total Minutes</p></div>
              <div><p className="text-2xl font-bold">{progress.average.toFixed(1)}</p><p className="text-sm text-muted-foreground">Daily Average</p></div>
              <div><p className="text-2xl font-bold">{progress.percentage.toFixed(0)}%</p><p className="text-sm text-muted-foreground">Target Met</p></div>
              <div><p className="text-2xl font-bold">{progress.streak}</p><p className="text-sm text-muted-foreground">Day Streak</p></div>
            </div>
            <CardDescription className="mt-4 text-center">
              {progress.opinion}{' '}
              <span className="block mt-1">
                This is a gentle reflection on your routine, not a medical or mental health evaluation.
              </span>
            </CardDescription>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <RelatedCalculators />
        <MeditationGuide />
        <EmbedWidget calculatorSlug="meditation-time-progress-tracker-calculator" calculatorName="Meditation Time Progress Tracker Calculator" />
      </div>

      <p className="mt-6 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}

function RelatedCalculators() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Related Calculators</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary underline hover:text-primary/80">
            Stress Level Self-Assessment Calculator
          </Link>
          <Link href="/category/health-fitness/sleep-debt-calculator-hf" className="text-primary underline hover:text-primary/80">
            Sleep Debt Calculator
          </Link>
          <Link href="/category/health-fitness/work-life-balance-time-allocation-calculator" className="text-primary underline hover:text-primary/80">
            Work-Life Balance Time Allocation Calculator
          </Link>
          <Link href="/category/health-fitness/heart-rate-zone-training-calculator" className="text-primary underline hover:text-primary/80">
            Heart Rate Zone Training Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function MeditationGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Meditation Progress Tracking – Building a Gentle, Consistent Practice" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to track meditation progress, set realistic goals, build consistency, and measure the benefits of regular practice." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Building a Meditation Practice</h2>
      <p itemProp="description">
        Regular meditation or quiet‑time practice can support many people in feeling a bit calmer, clearer, or more grounded.
        Tracking your progress is simply a way to notice your routine over time, not to judge yourself.
      </p>

      <h3 className="font-semibold text-foreground mt-6">Setting Realistic Goals</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Start with 5-10 minutes daily and gradually increase</li>
        <li>Aim for consistency over duration - daily practice beats sporadic long sessions</li>
        <li>Notice how you feel before and after practice without needing to grade the session</li>
        <li>Celebrate small wins and progress milestones</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Benefits of Regular Practice</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Many people notice a greater sense of calm and spaciousness in their day</li>
        <li>Some find it easier to return their attention to what matters after being distracted</li>
        <li>Short, regular practices can support a steadier mood for some people</li>
        <li>Quiet time can become a small daily anchor in a busy schedule</li>
        <li>Over time, you may become more aware of what you need to feel more at ease</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Tips for Success</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Choose a consistent time and quiet space</li>
        <li>Use guided meditations or apps when starting</li>
        <li>Let go of judging "good" or "bad" sessions - simply showing up matters most</li>
        <li>Track progress weekly to identify patterns and improvements</li>
        <li>Adjust goals based on your schedule and lifestyle</li>
      </ul>
    </section>
  );
}


