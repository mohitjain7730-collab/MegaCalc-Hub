'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Moon, Info } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
  age: z.number().positive().optional(),
  currentSleepHours: z.number().positive().optional(),
  napCount: z.number().positive().optional(),
  wakeTime: z.string().optional(),
  bedtime: z.string().optional(),
  sleepQuality: z.enum(['excellent', 'good', 'fair', 'poor']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function calculateBabySleepNeeds(values: FormValues) {
  const age = values.age || 6; // months
  const currentSleep = values.currentSleepHours || 14; // hours
  const napCount = values.napCount || 3;
  
  // Age‑based sleep ranges, used as gentle reference ranges only
  let recommendedTotalSleep = 0;
  let recommendedNaps = 0;
  let recommendedNightSleep = 0;
  let ageGroup = '';
  
  if (age <= 3) {
    recommendedTotalSleep = 14-17;
    recommendedNaps = 4-6;
    recommendedNightSleep = 8-9;
    ageGroup = '0-3 months';
  } else if (age <= 6) {
    recommendedTotalSleep = 12-16;
    recommendedNaps = 3-4;
    recommendedNightSleep = 9-10;
    ageGroup = '4-6 months';
  } else if (age <= 12) {
    recommendedTotalSleep = 12-15;
    recommendedNaps = 2-3;
    recommendedNightSleep = 10-11;
    ageGroup = '7-12 months';
  } else if (age <= 18) {
    recommendedTotalSleep = 11-14;
    recommendedNaps = 1-2;
    recommendedNightSleep = 11-12;
    ageGroup = '13-18 months';
  } else {
    recommendedTotalSleep = 10-13;
    recommendedNaps = 1;
    recommendedNightSleep = 11-12;
    ageGroup = '18+ months';
  }
  
  // Calculate sleep adequacy (for insight only, not diagnosis)
  const sleepAdequacy = (currentSleep / recommendedTotalSleep) * 100;
  
  // Determine sleep status in gentle, non‑diagnostic terms
  let sleepStatus = 'adequate';
  let statusMessage = '';
  
  if (sleepAdequacy >= 110) {
    sleepStatus = 'above-range';
    statusMessage = 'Your little one is sleeping more than this general range for their age.';
  } else if (sleepAdequacy >= 90) {
    sleepStatus = 'adequate';
    statusMessage = 'Total sleep time is close to this general age range.';
  } else if (sleepAdequacy >= 70) {
    sleepStatus = 'slightly-below-range';
    statusMessage = 'Sleep time is a bit under this reference range; some families gently adjust naps or bedtime.';
  } else {
    sleepStatus = 'well-below-range';
    statusMessage =
      'Sleep time is noticeably under this reference range. Some caregivers explore small changes to routines and seek personalised guidance if they have concerns.';
  }
  
  // Nap analysis
  let napStatus = 'appropriate';
  if (napCount > recommendedNaps + 1) napStatus = 'too-many';
  else if (napCount < recommendedNaps - 1) napStatus = 'too-few';
  
  return {
    ageGroup,
    recommendedTotalSleep,
    recommendedNaps,
    recommendedNightSleep,
    currentSleep,
    sleepAdequacy: Math.round(sleepAdequacy),
    sleepStatus,
    statusMessage,
    napStatus,
    napCount,
  };
}

export default function BabySleepNeedsCalculator() {
  const [result, setResult] = useState<ReturnType<typeof calculateBabySleepNeeds> | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
      currentSleepHours: undefined,
      napCount: undefined,
      wakeTime: undefined,
      bedtime: undefined,
      sleepQuality: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    setResult(calculateBabySleepNeeds(values));
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="age" render={({ field }) => (
              <FormItem>
                <FormLabel>Baby age (months)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="currentSleepHours" render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated total sleep in 24 hours (hours)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="napCount" render={({ field }) => (
              <FormItem>
                <FormLabel>Number of naps in a typical day</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="wakeTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Usual morning wake time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="bedtime" render={({ field }) => (
              <FormItem>
                <FormLabel>Usual bedtime</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="sleepQuality" render={({ field }) => (
              <FormItem>
                <FormLabel>How settled does their sleep feel overall?</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="excellent">Very settled most nights</option>
                  <option value="good">Mostly settled with a few brief wake‑ups</option>
                  <option value="fair">Quite a few wake‑ups</option>
                  <option value="poor">Often hard to settle</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">View sleep pattern insight</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Moon className="h-8 w-8 text-primary" />
              <CardTitle>Baby Sleep Pattern Insight</CardTitle>
            </div>
            <CardDescription>For {result.ageGroup} age group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.currentSleep}h</p>
                <p className="text-lg text-muted-foreground">Estimated current sleep over 24 hours</p>
                <p className="text-2xl font-bold">{result.sleepAdequacy}%</p>
                <p className="text-sm text-muted-foreground">of recommended sleep</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg text-center">
                  <h4 className="font-semibold mb-2">Total Sleep</h4>
                  <p className="text-xl font-bold">{result.recommendedTotalSleep}h</p>
                  <p className="text-sm text-muted-foreground">Recommended daily</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg text-center">
                  <h4 className="font-semibold mb-2">Naps</h4>
                  <p className="text-xl font-bold">{result.recommendedNaps}</p>
                  <p className="text-sm text-muted-foreground">Recommended naps</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-lg text-center">
                  <h4 className="font-semibold mb-2">Night Sleep</h4>
                  <p className="text-xl font-bold">{result.recommendedNightSleep}h</p>
                  <p className="text-sm text-muted-foreground">Recommended nightly</p>
                </div>
              </div>
              
              <div
                className={`p-4 rounded-lg ${
                  result.sleepStatus === 'adequate'
                    ? 'bg-green-100 dark:bg-green-900'
                    : result.sleepStatus === 'slightly-below-range'
                    ? 'bg-yellow-100 dark:bg-yellow-900'
                    : result.sleepStatus === 'well-below-range'
                    ? 'bg-orange-100 dark:bg-orange-900'
                    : 'bg-blue-100 dark:bg-blue-900'
                }`}
              >
                <h4 className="font-semibold">How this compares to the reference range</h4>
                <p className="text-sm">{result.statusMessage}</p>
              </div>
              
              {result.napStatus !== 'appropriate' && (
                <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg">
                  <h4 className="font-semibold">Nap Pattern</h4>
                  <p className="text-sm">
                    {result.napStatus === 'too-many'
                      ? `Your baby takes about ${result.napCount} naps, which is more than this reference range. Some families gradually combine naps as their child grows.`
                      : `Your baby takes about ${result.napCount} naps, which is fewer than this reference range. Some families find that an extra short nap can help the day feel smoother.`}
                  </p>
                </div>
              )}
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.sleepStatus === 'adequate'
                  ? 'Your baby’s total sleep is close to this reference range. You can continue with routines that feel workable for your family.'
                  : result.sleepStatus === 'slightly-below-range'
                  ? 'Your baby is sleeping a bit less than this reference range. Some caregivers gently adjust naps or bedtime and see how their child responds.'
                  : result.sleepStatus === 'well-below-range'
                  ? 'Your baby is sleeping noticeably less than this reference range. If you have any worries about sleep or well‑being, consider discussing your observations with a pediatric professional.'
                  : 'Some babies naturally sleep more than these ranges. If you are ever unsure about your child’s health or development, a pediatric professional can offer personalised guidance.'}
                {' '}
                This insight is for general parenting reflection only and is not a diagnosis or treatment plan.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Baby Sleep Pattern Insight – Gentle Age-Based Reference Ranges" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta
          itemProp="about"
          content="A gentle overview of age-based sleep ranges and routines to help caregivers reflect on their baby’s sleep patterns."
        />

        <h2 className="text-xl font-bold text-foreground">Guide: Noticing your baby’s sleep patterns</h2>
        <p>
          Sleep needs change quickly in the early years. The ranges here are broad reference points only; every baby is
          unique, and many healthy sleep patterns fall outside of these general numbers.
        </p>
        <h3 className="font-semibold text-foreground mt-4">Age-based reference ranges</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>0-3 months: 14-17 hours total (4-6 naps, 8-9 hours night sleep)</li>
          <li>4-6 months: 12-16 hours total (3-4 naps, 9-10 hours night sleep)</li>
          <li>7-12 months: 12-15 hours total (2-3 naps, 10-11 hours night sleep)</li>
          <li>13-18 months: 11-14 hours total (1-2 naps, 11-12 hours night sleep)</li>
          <li>18+ months: 10-13 hours total (1 nap, 11-12 hours night sleep)</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Gentle, baby-friendly sleep habits</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>Establish consistent bedtime routines</li>
          <li>Create sleep-friendly environment (dark, cool, quiet)</li>
          <li>Put baby to bed drowsy but awake</li>
          <li>Respond to sleep cues (rubbing eyes, yawning)</li>
          <li>Limit stimulation before bedtime</li>
        </ul>
      </section>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Related Calculators</h2>
        <p><Link className="text-primary underline" href="/category/health-fitness/infant-growth-percentile-calculator">Infant Growth Percentile Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/toddler-calorie-requirement-calculator">Toddler Calorie Requirement Calculator</Link></p>
        <p><Link className="text-primary underline" href="/category/health-fitness/breastfeeding-calorie-needs-calculator">Breastfeeding Calorie Needs Calculator</Link></p>
      </div>

      <p className="mt-4 text-xs text-muted-foreground text-center">
        Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
        medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
      </p>
    </div>
  );
}
