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
  
  // Age-based sleep recommendations
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
  
  // Calculate sleep adequacy
  const sleepAdequacy = (currentSleep / recommendedTotalSleep) * 100;
  
  // Determine sleep status
  let sleepStatus = 'adequate';
  let statusMessage = '';
  
  if (sleepAdequacy >= 110) {
    sleepStatus = 'excessive';
    statusMessage = 'More sleep than typically needed for this age';
  } else if (sleepAdequacy >= 90) {
    sleepStatus = 'adequate';
    statusMessage = 'Sleep duration is within recommended range';
  } else if (sleepAdequacy >= 70) {
    sleepStatus = 'insufficient';
    statusMessage = 'Slightly less sleep than recommended';
  } else {
    sleepStatus = 'deficient';
    statusMessage = 'Significantly less sleep than recommended';
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
                <FormLabel>Baby Age (months)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="currentSleepHours" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Total Sleep (hours/day)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="napCount" render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Naps per Day</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="wakeTime" render={({ field }) => (
              <FormItem>
                <FormLabel>Typical Wake Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="bedtime" render={({ field }) => (
              <FormItem>
                <FormLabel>Typical Bedtime</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
              </FormItem>
            )} />
            <FormField control={form.control} name="sleepQuality" render={({ field }) => (
              <FormItem>
                <FormLabel>Overall Sleep Quality</FormLabel>
                <select {...field} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="" />
                  <option value="excellent">Excellent (sleeps through night)</option>
                  <option value="good">Good (1-2 brief wake-ups)</option>
                  <option value="fair">Fair (frequent wake-ups)</option>
                  <option value="poor">Poor (difficult to settle)</option>
                </select>
              </FormItem>
            )} />
          </div>
          <Button type="submit">Calculate Sleep Needs</Button>
        </form>
      </Form>

      {result !== null && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Moon className="h-8 w-8 text-primary" />
              <CardTitle>Baby Sleep Analysis</CardTitle>
            </div>
            <CardDescription>For {result.ageGroup} age group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.currentSleep}h</p>
                <p className="text-lg text-muted-foreground">Current Sleep Duration</p>
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
              
              <div className={`p-4 rounded-lg ${
                result.sleepStatus === 'adequate' ? 'bg-green-100 dark:bg-green-900' :
                result.sleepStatus === 'insufficient' ? 'bg-yellow-100 dark:bg-yellow-900' :
                result.sleepStatus === 'deficient' ? 'bg-red-100 dark:bg-red-900' :
                'bg-blue-100 dark:bg-blue-900'
              }`}>
                <h4 className="font-semibold capitalize">{result.sleepStatus} Sleep</h4>
                <p className="text-sm">{result.statusMessage}</p>
              </div>
              
              {result.napStatus !== 'appropriate' && (
                <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-lg">
                  <h4 className="font-semibold">Nap Pattern</h4>
                  <p className="text-sm">
                    {result.napStatus === 'too-many' ? `Your baby takes ${result.napCount} naps, which is more than typical for this age. Consider consolidating naps.` :
                     `Your baby takes ${result.napCount} naps, which is fewer than typical for this age. Consider adding a nap if needed.`}
                  </p>
                </div>
              )}
            </div>
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Interpretation</AlertTitle>
              <AlertDescription>
                {result.sleepStatus === 'adequate' ? 'Your baby is getting appropriate sleep for their age. Continue current sleep routines and patterns.' : 
                 result.sleepStatus === 'insufficient' ? 'Consider adjusting bedtime or nap schedule to increase total sleep duration. Monitor for signs of overtiredness.' :
                 result.sleepStatus === 'deficient' ? 'Significant sleep deficit may affect development and behavior. Consult your pediatrician and consider sleep training methods.' :
                 'Excessive sleep may be normal for some babies, but monitor for any health concerns or changes in behavior.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4 text-muted-foreground leading-relaxed" itemScope itemType="https://schema.org/Article">
        <meta itemProp="headline" content="Baby Sleep Needs Calculator – Age-Appropriate Sleep Requirements and Patterns" />
        <meta itemProp="author" content="MegaCalc Hub Team" />
        <meta itemProp="about" content="Calculate baby sleep needs based on age with nap patterns, sleep duration recommendations, and sleep quality assessment." />

        <h2 className="text-xl font-bold text-foreground">Guide: Understanding Baby Sleep Needs</h2>
        <p>Sleep requirements change rapidly during the first two years of life. Understanding age-appropriate sleep patterns helps ensure healthy development:</p>
        <h3 className="font-semibold text-foreground mt-4">Age-Based Sleep Requirements</h3>
        <ul className="list-disc ml-6 space-y-1">
          <li>0-3 months: 14-17 hours total (4-6 naps, 8-9 hours night sleep)</li>
          <li>4-6 months: 12-16 hours total (3-4 naps, 9-10 hours night sleep)</li>
          <li>7-12 months: 12-15 hours total (2-3 naps, 10-11 hours night sleep)</li>
          <li>13-18 months: 11-14 hours total (1-2 naps, 11-12 hours night sleep)</li>
          <li>18+ months: 10-13 hours total (1 nap, 11-12 hours night sleep)</li>
        </ul>
        <h3 className="font-semibold text-foreground mt-4">Healthy Sleep Habits</h3>
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
    </div>
  );
}
