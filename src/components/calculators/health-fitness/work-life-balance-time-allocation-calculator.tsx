'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  workHours: z.number().min(0).max(24),
  personalTime: z.number().min(0).max(24),
  sleepHours: z.number().min(0).max(24),
  familyTime: z.number().min(0).max(24),
  exerciseTime: z.number().min(0).max(24),
  leisureTime: z.number().min(0).max(24)
});
type FormValues = z.infer<typeof formSchema>;

export default function WorkLifeBalanceTimeAllocationCalculator() {
  const [balance, setBalance] = useState<{ total: number; workPercent: number; personalPercent: number; sleepPercent: number; recommendations: string[]; opinion: string } | null>(null);
  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      workHours: undefined, 
      personalTime: undefined, 
      sleepHours: undefined, 
      familyTime: undefined, 
      exerciseTime: undefined, 
      leisureTime: undefined 
    } 
  });

  const onSubmit = (v: FormValues) => {
    const total = v.workHours + v.personalTime + v.sleepHours + v.familyTime + v.exerciseTime + v.leisureTime;
    const workPercent = (v.workHours / total) * 100;
    const personalPercent = ((v.personalTime + v.familyTime + v.leisureTime) / total) * 100;
    const sleepPercent = (v.sleepHours / total) * 100;
    
    const recommendations: string[] = [];
    let opinion = 'Good balance! Keep monitoring your time allocation.';
    
    if (total > 24) {
      recommendations.push('Total hours exceed 24. Please adjust your time allocation.');
      opinion = 'Please ensure your total time allocation doesn\'t exceed 24 hours per day.';
    } else {
      if (workPercent > 50) {
        recommendations.push('Consider reducing work hours to improve work-life balance');
        opinion = 'High work allocation detected. Consider setting boundaries and delegating tasks.';
      }
      if (sleepPercent < 25) {
        recommendations.push('Aim for 7-9 hours of sleep (29-38% of day) for optimal health');
        opinion = 'Insufficient sleep allocation. Prioritize 7-9 hours nightly for health and productivity.';
      }
      if (personalPercent < 30) {
        recommendations.push('Increase personal/family/leisure time for better life satisfaction');
        opinion = 'Low personal time allocation. Balance work with meaningful personal activities.';
      }
      if (v.exerciseTime < 0.5) {
        recommendations.push('Include at least 30 minutes daily for physical activity');
        opinion = 'Consider adding regular exercise to your routine for physical and mental health.';
      }
      if (recommendations.length === 0) {
        opinion = 'Excellent time allocation! You have a well-balanced lifestyle.';
      }
    }
    
    setBalance({ total, workPercent, personalPercent, sleepPercent, recommendations, opinion });
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="workHours" render={({ field }) => (
              <FormItem><FormLabel>Work Hours (per day)</FormLabel><FormControl><Input type="number" step="0.5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="sleepHours" render={({ field }) => (
              <FormItem><FormLabel>Sleep Hours (per day)</FormLabel><FormControl><Input type="number" step="0.5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="personalTime" render={({ field }) => (
              <FormItem><FormLabel>Personal Time (per day)</FormLabel><FormControl><Input type="number" step="0.5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="familyTime" render={({ field }) => (
              <FormItem><FormLabel>Family Time (per day)</FormLabel><FormControl><Input type="number" step="0.5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="exerciseTime" render={({ field }) => (
              <FormItem><FormLabel>Exercise Time (per day)</FormLabel><FormControl><Input type="number" step="0.5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="leisureTime" render={({ field }) => (
              <FormItem><FormLabel>Leisure Time (per day)</FormLabel><FormControl><Input type="number" step="0.5" {...field} value={field.value ?? ''} onChange={e=>field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <Button type="submit">Analyze Balance</Button>
        </form>
      </Form>

      {balance && (
        <Card className="mt-8">
          <CardHeader>
            <div className='flex items-center gap-4'><Clock className="h-8 w-8 text-primary" /><CardTitle>Work-Life Balance Analysis</CardTitle></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-4">
              <div><p className="text-2xl font-bold">{balance.workPercent.toFixed(0)}%</p><p className="text-sm text-muted-foreground">Work</p></div>
              <div><p className="text-2xl font-bold">{balance.personalPercent.toFixed(0)}%</p><p className="text-sm text-muted-foreground">Personal</p></div>
              <div><p className="text-2xl font-bold">{balance.sleepPercent.toFixed(0)}%</p><p className="text-sm text-muted-foreground">Sleep</p></div>
              <div><p className="text-2xl font-bold">{balance.total.toFixed(1)}h</p><p className="text-sm text-muted-foreground">Total</p></div>
            </div>
            <CardDescription className="text-center mb-4">{balance.opinion}</CardDescription>
            {balance.recommendations.length > 0 && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">Recommendations:</p>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  {balance.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <RelatedCalculators />
        <WorkLifeBalanceGuide />
      </div>
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
          <Link href="/category/health-fitness/meditation-time-progress-tracker-calculator" className="text-primary underline hover:text-primary/80">
            Meditation Time Progress Tracker Calculator
          </Link>
          <Link href="/category/health-fitness/sleep-debt-calculator-hf" className="text-primary underline hover:text-primary/80">
            Sleep Debt Calculator
          </Link>
          <Link href="/category/health-fitness/stress-level-self-assessment-calculator" className="text-primary underline hover:text-primary/80">
            Stress Level Self-Assessment Calculator
          </Link>
          <Link href="/category/health-fitness/exercise-calorie-burn-calculator" className="text-primary underline hover:text-primary/80">
            Exercise Calorie Burn Calculator
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkLifeBalanceGuide() {
  return (
    <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
      <meta itemProp="headline" content="Work-Life Balance Time Allocation – Creating Sustainable Lifestyles" />
      <meta itemProp="author" content="MegaCalc Hub Team" />
      <meta itemProp="about" content="How to analyze and optimize daily time allocation between work, personal life, sleep, and leisure activities for better balance and well-being." />

      <h2 itemProp="name" className="text-xl font-bold text-foreground">Understanding Work-Life Balance</h2>
      <p itemProp="description">Work-life balance involves consciously allocating time between professional responsibilities and personal well-being. A healthy balance supports productivity, relationships, and overall life satisfaction.</p>

      <h3 className="font-semibold text-foreground mt-6">Ideal Time Allocations</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Sleep: 29-38% (7-9 hours) - Essential for health and cognitive function</li>
        <li>Work: 25-40% (6-10 hours) - Sustainable professional engagement</li>
        <li>Personal/Family: 25-35% (6-8 hours) - Relationships and self-care</li>
        <li>Exercise: 4-8% (1-2 hours) - Physical health and stress management</li>
        <li>Leisure: 8-15% (2-4 hours) - Hobbies and relaxation</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Signs of Poor Balance</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Working more than 50% of waking hours consistently</li>
        <li>Getting less than 7 hours of sleep regularly</li>
        <li>Neglecting personal relationships and hobbies</li>
        <li>Feeling constantly stressed or overwhelmed</li>
        <li>Physical health issues from poor lifestyle habits</li>
      </ul>

      <h3 className="font-semibold text-foreground mt-6">Strategies for Better Balance</h3>
      <ul className="list-disc ml-6 space-y-1">
        <li>Set clear boundaries between work and personal time</li>
        <li>Schedule time for exercise, family, and leisure activities</li>
        <li>Practice time management and delegation skills</li>
        <li>Learn to say no to excessive work demands</li>
        <li>Regularly review and adjust your time allocation</li>
        <li>Prioritize activities that align with your values and goals</li>
      </ul>
    </section>
  );
}


