'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Moon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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
  
  const recommendations: string[] = [];
  const plan: { label: string; detail: string }[] = [];

  if (sleepStatus === 'slightly-below-range' || sleepStatus === 'well-below-range') {
    recommendations.push('Consider gradually adjusting bedtime or nap timing to support longer sleep periods.');
    recommendations.push('Create a consistent bedtime routine to help signal sleep time.');
    recommendations.push('Ensure the sleep environment is dark, cool, and quiet.');
  } else {
    recommendations.push('Continue with routines that feel workable for your family.');
    recommendations.push('Maintain consistent sleep and wake times.');
    recommendations.push('Watch for sleep cues like yawning or rubbing eyes.');
  }

  plan.push({ label: 'Week 1-2', detail: 'Observe current sleep patterns and note wake times and nap durations.' });
  plan.push({ label: 'Week 3-4', detail: 'Gradually adjust bedtime or nap timing if needed, making small changes.' });
  plan.push({ label: 'Ongoing', detail: 'Maintain consistent routines and respond to your baby\'s individual needs.' });

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
    recommendations,
    plan,
  };
}

const steps = [
  'Enter your baby\'s age in months.',
  'Estimate total sleep hours in a 24-hour period (including naps and night sleep).',
  'Count the number of naps your baby typically takes per day.',
  'Optionally enter wake time and bedtime to see sleep schedule patterns.',
  'Select sleep quality to help understand overall sleep patterns.',
  'Review the results and compare with age-appropriate reference ranges.',
];

const faqs = [
  {
    question: 'How much sleep does my baby need?',
    answer: 'Sleep needs vary by age. Newborns (0-3 months) typically need 14-17 hours total, while older babies (12-18 months) may need 11-14 hours. These are general reference ranges; individual babies may vary.',
  },
  {
    question: 'What if my baby sleeps more or less than the recommended range?',
    answer: 'Many healthy babies sleep outside these ranges. What matters most is that your baby seems rested, is growing well, and is generally content. If you have concerns, discuss them with your pediatrician.',
  },
  {
    question: 'How many naps should my baby take?',
    answer: 'Nap frequency decreases with age. Newborns may nap 4-6 times, while toddlers typically nap once. The transition between nap schedules varies for each child.',
  },
  {
    question: 'When should I be concerned about my baby\'s sleep?',
    answer: 'Consider discussing sleep with a pediatrician if your baby seems excessively sleepy, has difficulty staying awake for feeds, shows signs of breathing problems during sleep, or if you have persistent concerns about sleep patterns.',
  },
  {
    question: 'How can I help my baby sleep better?',
    answer: 'Establish consistent bedtime routines, create a sleep-friendly environment (dark, cool, quiet), put baby to bed drowsy but awake, and respond to sleep cues like yawning or eye-rubbing.',
  },
];

const relatedCalculators = [
  {
    name: 'Infant Growth Percentile Calculator',
    slug: 'infant-growth-percentile-calculator',
    description: 'Track your baby\'s growth alongside sleep patterns.',
  },
  {
    name: 'Toddler Calorie Requirement Calculator',
    slug: 'toddler-calorie-requirement-calculator',
    description: 'Understand nutritional needs as your baby grows.',
  },
  {
    name: 'Breastfeeding Calorie Needs Calculator',
    slug: 'breastfeeding-calorie-needs-calculator',
    description: 'Support feeding patterns that complement sleep routines.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/baby-sleep-needs-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Baby Sleep Needs Wellness Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Baby Sleep Needs Wellness Tracker',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'Web Browser',
      description: 'Calculate baby sleep needs based on age, current sleep patterns, and nap frequency.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

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
      <Script id="baby-sleep-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Baby Sleep Needs Wellness Tracker
          </CardTitle>
          <CardDescription>
            Understand age-appropriate sleep patterns and reference ranges to support your baby's rest and development.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your baby's sleep information</CardTitle>
          <CardDescription>Enter details about your baby's age and current sleep patterns to see age-appropriate reference ranges.</CardDescription>
        </CardHeader>
        <CardContent>
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
                <FormMessage />
              </FormItem>
            )} />
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Calculate sleep needs
            </Button>
          </form>
        </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See sleep adequacy, recommended ranges, and personalized insights for {result.ageGroup}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Current Sleep</p>
                <p className="text-2xl font-semibold text-primary">{result.currentSleep}h</p>
                <p className="text-xs text-muted-foreground">Per 24 hours</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sleep Adequacy</p>
                <p className="text-2xl font-semibold text-primary">{result.sleepAdequacy}%</p>
                <p className="text-xs text-muted-foreground">Of reference range</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended Total</p>
                <p className="text-2xl font-semibold text-primary">{result.recommendedTotalSleep}h</p>
                <p className="text-xs text-muted-foreground">Daily sleep</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.sleepStatus.replace('-', ' ')}</p>
                <p className="text-xs text-muted-foreground">{result.statusMessage}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground mb-2">Recommended Naps</p>
                <p className="text-xl font-semibold text-primary">{result.recommendedNaps}</p>
                <p className="text-xs text-muted-foreground mt-1">Recommended Night Sleep: {result.recommendedNightSleep}h</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground mb-2">Current Naps</p>
                <p className="text-xl font-semibold text-primary">{result.napCount}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{result.napStatus.replace('-', ' ')}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                    {result.recommendations.map((rec) => (
                      <li key={rec}>{rec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Action plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {result.plan.map((step) => (
                      <li key={step.label}>
                        <span className="font-semibold">{step.label}:</span> {step.detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Sleep Adequacy</strong> = (Current Sleep Hours ÷ Recommended Total Sleep for Age) × 100. This compares your
            baby's current sleep to age-appropriate reference ranges.
          </p>
          <p>
            <strong>Age-Based Ranges:</strong> The calculator uses established pediatric sleep guidelines: 0-3 months (14-17h),
            4-6 months (12-16h), 7-12 months (12-15h), 13-18 months (11-14h), 18+ months (10-13h). These are general reference
            ranges; individual babies may vary.
          </p>
          <p>
            <strong>Nap Analysis:</strong> Compares current nap count to age-appropriate ranges. Nap frequency naturally
            decreases as babies grow and consolidate sleep.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Related calculators</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relatedCalculators.map((calc) => (
            <div key={calc.slug} className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link href={`/category/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Guide</CardTitle>
          <CardDescription>
            Comprehensive guide to understanding baby sleep needs, patterns, and strategies for supporting healthy sleep
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
            The Definitive Guide to Baby Sleep Needs: Understanding Sleep Patterns, Development, and Healthy Sleep Habits
          </h2>
          <p className="text-lg italic text-gray-700">
            Explore the science of baby sleep, learn how sleep needs change with age, understand sleep patterns and development,
            and discover comprehensive strategies to support healthy sleep habits for your baby.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
          <ul className="list-disc ml-6 space-y-2 text-blue-600">
            <li>
              <a href="#understanding-baby-sleep" className="hover:underline">
                Understanding Baby Sleep and Development
              </a>
            </li>
            <li>
              <a href="#age-based-needs" className="hover:underline">
                Age-Based Sleep Needs and Patterns
              </a>
            </li>
            <li>
              <a href="#sleep-environments" className="hover:underline">
                Creating Sleep-Friendly Environments
              </a>
            </li>
            <li>
              <a href="#sleep-strategies" className="hover:underline">
                Comprehensive Strategies for Healthy Baby Sleep
              </a>
            </li>
          </ul>
          <hr />

          <h2 id="understanding-baby-sleep" className="text-2xl font-bold text-foreground pt-8">
            Understanding Baby Sleep and Development
          </h2>
          <p>
            Baby sleep is essential for growth, development, and overall well-being. Understanding how sleep patterns evolve
            during the first years helps caregivers support healthy sleep habits.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Why Sleep Matters for Babies</h3>
          <p>
            Sleep supports:
          </p>
          <ul>
            <li>
              <b>Physical growth:</b> Growth hormone is released during deep sleep
            </li>
            <li>
              <b>Brain development:</b> Sleep consolidates learning and memory formation
            </li>
            <li>
              <b>Immune function:</b> Adequate sleep supports immune system development
            </li>
            <li>
              <b>Emotional regulation:</b> Well-rested babies are generally more content and easier to soothe
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Cycles in Babies</h3>
          <p>
            Babies have shorter sleep cycles than adults (about 50-60 minutes vs 90 minutes). They spend more time in REM
            (rapid eye movement) sleep, which is important for brain development. Newborns may wake frequently between cycles,
            which is normal.
          </p>

          <hr />

          <h2 id="age-based-needs" className="text-2xl font-bold text-foreground pt-8">
            Age-Based Sleep Needs and Patterns
          </h2>
          <p>
            Sleep needs change dramatically during the first two years as babies grow and develop.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">0-3 Months</h3>
          <ul>
            <li>
              <b>Total sleep:</b> 14-17 hours per 24 hours
            </li>
            <li>
              <b>Naps:</b> 4-6 naps per day
            </li>
            <li>
              <b>Night sleep:</b> 8-9 hours (with frequent wake-ups for feeding)
            </li>
            <li>
              <b>Patterns:</b> Sleep is distributed throughout day and night, with no clear day/night distinction initially
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">4-6 Months</h3>
          <ul>
            <li>
              <b>Total sleep:</b> 12-16 hours per 24 hours
            </li>
            <li>
              <b>Naps:</b> 3-4 naps per day
            </li>
            <li>
              <b>Night sleep:</b> 9-10 hours (longer stretches possible)
            </li>
            <li>
              <b>Patterns:</b> Day/night distinction begins to develop; longer sleep stretches at night
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">7-12 Months</h3>
          <ul>
            <li>
              <b>Total sleep:</b> 12-15 hours per 24 hours
            </li>
            <li>
              <b>Naps:</b> 2-3 naps per day
            </li>
            <li>
              <b>Night sleep:</b> 10-11 hours
            </li>
            <li>
              <b>Patterns:</b> More consolidated night sleep; separation anxiety may affect sleep
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">13-18 Months</h3>
          <ul>
            <li>
              <b>Total sleep:</b> 11-14 hours per 24 hours
            </li>
            <li>
              <b>Naps:</b> 1-2 naps per day
            </li>
            <li>
              <b>Night sleep:</b> 11-12 hours
            </li>
            <li>
              <b>Patterns:</b> Transition to one nap common; increased mobility may affect sleep
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">18+ Months</h3>
          <ul>
            <li>
              <b>Total sleep:</b> 10-13 hours per 24 hours
            </li>
            <li>
              <b>Naps:</b> 1 nap per day (typically 1-3 hours)
            </li>
            <li>
              <b>Night sleep:</b> 11-12 hours
            </li>
            <li>
              <b>Patterns:</b> Most toddlers nap once daily; some may drop naps entirely by age 3-4
            </li>
          </ul>

          <hr />

          <h2 id="sleep-environments" className="text-2xl font-bold text-foreground pt-8">
            Creating Sleep-Friendly Environments
          </h2>
          <p>
            A safe, comfortable sleep environment supports better sleep quality and duration.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">Safe Sleep Guidelines</h3>
          <ul>
            <li>
              <b>Back to sleep:</b> Always place babies on their back for sleep
            </li>
            <li>
              <b>Firm mattress:</b> Use a firm, flat sleep surface
            </li>
            <li>
              <b>No soft bedding:</b> Avoid pillows, blankets, bumper pads, and soft toys in the crib
            </li>
            <li>
              <b>Room sharing:</b> Share room (not bed) for first 6-12 months
            </li>
            <li>
              <b>Temperature:</b> Keep room temperature comfortable (68-72°F or 20-22°C)
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">Sleep Environment Factors</h3>
          <ul>
            <li>
              <b>Darkness:</b> Use blackout curtains or shades to create darkness
            </li>
            <li>
              <b>Quiet:</b> Use white noise machine or fan to mask household sounds
            </li>
            <li>
              <b>Cool temperature:</b> Overheating can disrupt sleep
            </li>
            <li>
              <b>Consistent location:</b> Use the same sleep space for naps and nighttime
            </li>
          </ul>

          <hr />

          <h2 id="sleep-strategies" className="text-2xl font-bold text-foreground pt-8">
            Comprehensive Strategies for Healthy Baby Sleep
          </h2>
          <p>
            Supporting healthy sleep involves establishing routines, responding to sleep cues, and adapting to your baby's
            individual needs.
          </p>

          <h3 className="text-xl font-semibold text-foreground mt-6">1. Establish Consistent Routines</h3>
          <ul>
            <li>
              <b>Bedtime routine:</b> Create a predictable sequence (bath, feeding, story, lullaby) before bed
            </li>
            <li>
              <b>Nap routine:</b> Use shorter versions of bedtime routine for naps
            </li>
            <li>
              <b>Consistent timing:</b> Aim for similar bedtimes and wake times daily
            </li>
            <li>
              <b>Calming activities:</b> Avoid stimulating activities before sleep
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">2. Recognize Sleep Cues</h3>
          <ul>
            <li>
              <b>Early cues:</b> Yawning, rubbing eyes, looking away, decreased activity
            </li>
            <li>
              <b>Late cues:</b> Fussiness, crying, overtired behavior
            </li>
            <li>
              <b>Timing:</b> Put baby down when showing early sleep cues, before becoming overtired
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">3. Support Self-Soothing</h3>
          <ul>
            <li>
              <b>Drowsy but awake:</b> Put baby down when drowsy but still awake
            </li>
            <li>
              <b>Gradual approach:</b> Allow baby to practice falling asleep independently
            </li>
            <li>
              <b>Comfort items:</b> For older babies, introduce a safe comfort object (after 12 months)
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">4. Manage Night Wakings</h3>
          <ul>
            <li>
              <b>Newborns:</b> Frequent night wakings are normal for feeding
            </li>
            <li>
              <b>Older babies:</b> Some night wakings are normal; respond consistently
            </li>
            <li>
              <b>Check needs:</b> Ensure baby is fed, dry, and comfortable before assuming sleep issue
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-foreground mt-6">5. Adapt to Developmental Changes</h3>
          <ul>
            <li>
              <b>Sleep regressions:</b> Temporary disruptions during developmental milestones (4 months, 8-10 months, 18 months)
            </li>
            <li>
              <b>Nap transitions:</b> Be flexible during transitions between nap schedules
            </li>
            <li>
              <b>Teething:</b> May temporarily disrupt sleep; provide comfort as needed
            </li>
          </ul>

          <hr />

          <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
          <p>
            Understanding baby sleep needs and patterns helps caregivers support healthy sleep habits. By recognizing
            age-appropriate sleep ranges, creating safe sleep environments, establishing consistent routines, and responding to
            individual needs, you can help your baby develop healthy sleep patterns. Remember that sleep needs vary between
            babies—what works for one may not work for another. Be patient, flexible, and responsive to your baby's cues. If you
            have persistent concerns about your baby's sleep, growth, or development, consult with your pediatrician who can
            provide personalized guidance. This tool is designed for wellness reflection and is not a substitute for professional
            medical evaluation or treatment.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h4 className="font-semibold">{faq.question}</h4>
              <p className="text-sm text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This tool offers age-based sleep reference ranges from baby's age, current sleep hours, and nap patterns as a gentle,
            parenting-oriented snapshot. It is intended for personal reflection, not for diagnosis or treatment decisions.
          </p>
          <p>
            Outputs include sleep adequacy percentage, recommended total sleep, nap frequency, night sleep recommendations,
            wellness status, interpretation text, supportive recommendations, an action plan, and contextual information about the
            inputs and calculation approach.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a
            medical or psychological diagnosis, evaluation, or treatment plan. For any health concerns, please consult a qualified
            professional who can review your full situation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
