'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

// Simplified TSS for cycling/running: TSS = (sec × NP × IF) / (FTP × 3600) × 100
// Here we accept duration (minutes) and Intensity Factor (IF), assuming FTP-normalized power implicit.
const formSchema = z.object({ durationMin: z.number().positive(), intensityFactor: z.number().min(0).max(1.5) });
type FormValues = z.infer<typeof formSchema>;

export default function TrainingStressScoreCalculator() {
  const [tss, setTss] = useState<number | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { durationMin: undefined, intensityFactor: undefined } });
  const onSubmit = (v: FormValues) => {
    const hours = v.durationMin / 60;
    const score = hours * v.intensityFactor * v.intensityFactor * 100; // Common simplified model: TSS = h × IF^2 × 100
    setTss(score);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="durationMin" render={({ field }) => (<FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="intensityFactor" render={({ field }) => (<FormItem><FormLabel>Intensity Factor (IF)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
          </div>
          <Button type="submit">Calculate TSS</Button>
        </form>
      </Form>
      {tss !== null && (
        <Card className="mt-8">
          <CardHeader><div className='flex items-center gap-4'><Dumbbell className="h-8 w-8 text-primary" /><CardTitle>Training Stress Score</CardTitle></div></CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold">{tss.toFixed(0)} TSS</p>
              <CardDescription>Rule of thumb: ~50 easy; 75–100 solid; 100+ demanding (context matters).</CardDescription>
            </div>
          </CardContent>
        </Card>
      )}
      <TssGuide />
    </div>
  );
}

export function TssGuide() {
  return (
    <section
  className="space-y-4 text-muted-foreground leading-relaxed"
  itemScope
  itemType="https://schema.org/Article"
>
  <meta
    itemProp="headline"
    content="Training Stress Score (TSS) Calculator – Measure Workout Intensity, Fatigue, and Recovery Like a Pro"
  />
  <meta itemProp="author" content="MegaCalc Hub Team" />
  <meta
    itemProp="about"
    content="Understand what Training Stress Score (TSS) means, how it's calculated using power, intensity factor, and duration, and how to use it to plan workouts, manage fatigue, and optimize recovery for cyclists, runners, and triathletes."
  />

  <h2 itemProp="name" className="text-xl font-bold text-foreground">
    Training Stress Score (TSS): The Science of Measuring Workout Load
  </h2>
  <p itemProp="description">
    The <strong>Training Stress Score (TSS)</strong> is a key performance metric
    that quantifies how hard and how long a workout is, relative to your
    personal fitness level. Originally developed by <strong>Dr. Andrew Coggan</strong>
    for cyclists using power meters, TSS has since become a universal measure
    across endurance sports — running, triathlon, rowing, and even strength
    training. It helps you track <strong>training load</strong>, manage
    <strong>fatigue</strong>, and plan <strong>optimal recovery</strong>.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    What Is Training Stress Score (TSS)?
  </h3>
  <p>
    The TSS is a single number that represents how stressful a workout is on
    your body. It considers both <strong>intensity</strong> and
    <strong>duration</strong>. A longer or harder workout produces a higher
    TSS. The higher your weekly average TSS, the greater your training load —
    but also the higher your fatigue and recovery needs.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    The Formula for Calculating TSS
  </h3>
  <p>
    The official formula used by TrainingPeaks and similar platforms is:
  </p>

  <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
    TSS = (Duration (seconds) × NP × IF) / (FTP × 3600) × 100
  </pre>

  <ul className="list-disc ml-6 space-y-1">
    <li>
      <strong>NP (Normalized Power):</strong> A measure that accounts for
      variable effort, representing the physiological cost of your workout.
    </li>
    <li>
      <strong>IF (Intensity Factor):</strong> Your relative workout intensity
      = NP / FTP.
    </li>
    <li>
      <strong>FTP (Functional Threshold Power):</strong> The highest average
      power (in watts) you can sustain for one hour.
    </li>
    <li>
      <strong>Duration:</strong> Total workout time in seconds.
    </li>
  </ul>

  <p>
    In short, <strong>TSS = Intensity × Duration × 100</strong>. The result is
    a clear indicator of workout load — 100 TSS roughly equals one hour at your
    threshold intensity.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    How to Use the TSS Calculator
  </h3>
  <ol className="list-decimal ml-6 space-y-1">
    <li>Enter your <strong>FTP (Functional Threshold Power)</strong> or threshold pace.</li>
    <li>Input your workout <strong>duration</strong> (minutes or hours).</li>
    <li>Add your <strong>average or normalized power</strong>.</li>
    <li>The calculator automatically computes <strong>Intensity Factor (IF)</strong> and your total <strong>TSS</strong>.</li>
  </ol>
  <p>
    You can use this score to compare workouts, plan training cycles, and
    prevent overtraining.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    TSS Benchmarks: What Your Score Means
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>0–50:</strong> Very easy workout, light recovery ride or jog.</li>
    <li><strong>50–100:</strong> Moderate effort, manageable stress level.</li>
    <li><strong>100–150:</strong> Challenging session, typical threshold or tempo workout.</li>
    <li><strong>150–200:</strong> Hard effort or long-duration training.</li>
    <li><strong>200+:</strong> Extremely taxing; likely requires multiple days of recovery.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Why TSS Matters for Endurance Athletes
  </h3>
  <p>
    TSS allows athletes and coaches to <strong>quantify training load</strong>
    and build structured plans based on data rather than intuition. It helps:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>Balance training stress and recovery to prevent burnout.</li>
    <li>Track long-term progress with <strong>CTL (Chronic Training Load)</strong> and <strong>ATL (Acute Training Load)</strong>.</li>
    <li>Identify when performance peaks or fatigue is rising dangerously.</li>
    <li>Plan periodization — base, build, and taper phases efficiently.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Comparing TSS Across Different Sports
  </h3>
  <p>
    While originally designed for cycling, the concept applies across endurance
    disciplines:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li><strong>Running TSS:</strong> Based on pace or heart rate zones.</li>
    <li><strong>Swimming TSS:</strong> Calculated from pace relative to threshold speed.</li>
    <li><strong>Triathlon:</strong> Combines TSS from all legs of the race.</li>
    <li><strong>Strength training:</strong> Can use session RPE (rate of perceived exertion) × duration × factor.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Understanding Intensity Factor (IF)
  </h3>
  <p>
    The <strong>Intensity Factor</strong> is your key to understanding how
    hard your session really was. It’s calculated as:
  </p>
  <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
    IF = NP / FTP
  </pre>
  <ul className="list-disc ml-6 space-y-1">
    <li>IF 0.5–0.7 → Recovery / easy ride</li>
    <li>IF 0.75–0.85 → Endurance zone</li>
    <li>IF 0.85–0.95 → Tempo / Threshold training</li>
    <li>IF 1.0+ → Race effort or short maximal intervals</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    How to Interpret Your Weekly TSS
  </h3>
  <p>
    Your total <strong>weekly TSS</strong> reflects the overall workload. Here’s
    a simplified guide:
  </p>
  <ul className="list-disc ml-6 space-y-1">
    <li>400–600 → Base endurance training</li>
    <li>600–800 → Advanced or build phase volume</li>
    <li>800–1000 → Competitive athletes</li>
    <li>1000+ → High stress — ensure adequate recovery</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Using TSS for Smart Recovery and Progress
  </h3>
  <p>
    TSS is more than a number — it’s your roadmap to long-term performance
    gains. When paired with <strong>sleep tracking</strong>, <strong>heart rate
    variability (HRV)</strong>, and <strong>nutrition data</strong>, it forms a
    complete feedback system. The goal isn’t to maximize TSS daily but to
    manage the right balance of stress and recovery.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Common Mistakes Athletes Make with TSS
  </h3>
  <ul className="list-disc ml-6 space-y-1">
    <li>Chasing high TSS every day instead of focusing on recovery balance.</li>
    <li>Using inaccurate FTP values, which skews results.</li>
    <li>Ignoring nutrition and sleep when fatigue rises.</li>
    <li>Not adjusting TSS targets for age, gender, or training goals.</li>
  </ul>

  <h3 className="font-semibold text-foreground mt-6">
    Practical Example
  </h3>
  <p>
    Suppose your <strong>FTP = 250W</strong>, you ride for <strong>90 minutes</strong> at an average
    <strong>Normalized Power of 200W</strong>. Your Intensity Factor = 0.8.
  </p>
  <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
    TSS = (5400 × 200 × 0.8) / (250 × 3600) × 100 ≈ 96
  </pre>
  <p>
    This means your session is roughly equivalent to 1 hour at threshold effort
    — a solid tempo workout.
  </p>

  <h3 className="font-semibold text-foreground mt-6">
    Frequently Asked Questions (FAQ)
  </h3>
  <div className="space-y-3">
    <p>
      <strong>What is a good TSS for a workout?</strong> It depends on your goal.
      70–100 is ideal for daily sessions; higher values should be followed by
      easier recovery days.
    </p>
    <p>
      <strong>Can beginners use TSS?</strong> Absolutely. It’s one of the
      simplest ways to monitor fitness progression safely.
    </p>
    <p>
      <strong>Does TSS account for heart rate?</strong> Traditional TSS uses
      power, but there are HR-based versions (hrTSS) for those without power meters.
    </p>
    <p>
      <strong>What’s the difference between TSS and TRIMP?</strong>
      TRIMP uses heart rate, while TSS is more precise using power or pace data.
    </p>
    <p>
      <strong>How can I improve my TSS over time?</strong> Increase training
      load gradually by extending duration or intensity by 5–10% weekly.
    </p>
  </div>

  <h3 className="font-semibold text-foreground mt-6">Related Tools</h3>
  <div className="space-y-2">
    <p>
      <Link href="/category/fitness/ftp-calculator" className="text-primary underline">
        FTP (Functional Threshold Power) Calculator
      </Link>
    </p>
    <p>
      <Link href="/category/fitness/heart-rate-zone-calculator" className="text-primary underline">
        Heart Rate Zone Calculator
      </Link>
    </p>
    <p>
      <Link href="/category/fitness/trimp-calculator" className="text-primary underline">
        TRIMP (Training Impulse) Calculator
      </Link>
    </p>
    <p>
      <Link href="/category/fitness/calorie-burn-calculator" className="text-primary underline">
        Calorie Burn Calculator
      </Link>
    </p>
  </div>

  <p className="italic">
    Note: This tool provides educational guidance and general estimates. Always
    adjust based on your personal recovery, fatigue, and professional coaching
    advice.
  </p>
</section>
  );
}


