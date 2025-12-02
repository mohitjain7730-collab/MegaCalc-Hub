'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Clock, Calendar, Timer, Shield } from 'lucide-react';

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

const steps = [
  'Enter the number of mindful minutes you spent on each day over the last week (it is okay to estimate).',
  'Submit the form to see your total minutes, daily average, a simple streak count, and a pattern label.',
  'Read the interpretation text as a gentle reflection on how your current rhythm may feel.',
  'Browse the recommendations and 8‑week plan for ideas to make practice feel more sustainable.',
  'Revisit when you are curious about your routine, not as something you must check every day.',
];

const baseUrl =
  'https://mycalculating.com/category/health-fitness/mindful-minutes-tracking-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Health & Fitness',
          item: 'https://mycalculating.com/category/health-fitness',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Mindful Minutes Consistency Tracker',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Mindful Minutes Consistency Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Track how often you make time for mindfulness or quiet moments across the week with a gentle consistency snapshot.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
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
  if (avg >= 30)
    return `You’re spending about ${avg.toFixed(
      1
    )} minutes per day with mindfulness and have a ${streak}-day streak—this is a very steady routine for many people.`;
  if (avg >= 15)
    return `You’re averaging ${avg.toFixed(
      1
    )} minutes per day with a ${streak}-day streak, which suggests a growing, supportive habit.`;
  if (avg >= 5)
    return `You’re spending around ${avg.toFixed(
      1
    )} minutes per day on mindfulness with a ${streak}-day streak—this is a solid start you can gently build on.`;
  return `You’re getting started with about ${avg.toFixed(
    1
  )} minutes per day. Every few minutes of mindful time counts; you can focus on simple consistency over duration.`;
};

const recommendations = (avg: number, streak: number) => [
  'Let consistency matter more than duration—even 3–5 minutes most days can be meaningful.',
  avg < 10
    ? 'You might aim for 5–10 minutes on more days of the week and only increase when it feels natural.'
    : 'You can maintain your current practice and, if you like, gently add variety (different kinds of mindfulness).',
  'Choose a time and place that realistically fits your day so the habit feels kind and sustainable.',
  'Track your practice to notice patterns and celebrate what you are already doing, rather than to judge yourself.',
];

const warningSigns = () => [
  "Try not to force practice when you feel unwell or overwhelmed—gentle, self‑compassionate pauses are part of a sustainable habit.",
  "Perfection isn’t required—missed days are normal. Simply returning to practice when you can is enough.",
  'If mindfulness ever feels distressing or increases anxiety, consider adjusting your approach and, if helpful, speaking with a mental health professional.',
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
      <Script
        id="mindful-minutes-consistency-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Mindful Minutes Consistency Tracker
          </CardTitle>
          <CardDescription>
            Gently reflect on how much time you’re setting aside for mindfulness each week. This is a personal wellness
            check‑in, not a performance score.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your week of mindful minutes</CardTitle>
          <CardDescription>Estimate is fine—this is about pattern awareness, not perfection.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                <FormField
                  control={form.control}
                  name="monday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="h-4 w-4" /> Monday (min)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tuesday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="h-4 w-4" /> Tuesday (min)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wednesday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="h-4 w-4" /> Wednesday (min)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="thursday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="h-4 w-4" /> Thursday (min)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="friday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="h-4 w-4" /> Friday (min)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="saturday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="h-4 w-4" /> Saturday (min)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sunday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="h-4 w-4" /> Sunday (min)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value === '' ? undefined : Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate weekly summary
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle>Weekly mindful minutes snapshot</CardTitle>
              </div>
              <CardDescription>Your mindfulness practice statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Total minutes</h4>
                  <p className="text-2xl font-bold text-primary">{result.totalMinutes}</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Daily average</h4>
                  <p className="text-2xl font-bold text-primary">{result.weeklyAverage} min</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Day streak</h4>
                  <p className="text-2xl font-bold text-primary">{result.streak} days</p>
                </div>
                <div className="p-4 border rounded">
                  <h4 className="text-sm font-semibold text-muted-foreground">Pattern label</h4>
                  <p className="text-2xl font-bold text-primary">{result.category}</p>
                </div>
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
          <CardTitle>Formula and approach</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Totals and averages:</strong> The tool simply adds up your minutes across the week, divides by seven for a
            daily average, and counts how many days in a row (from most recent backward) included some mindful time.
          </p>
          <p>
            <strong>Pattern labels:</strong> The average is loosely grouped into descriptions like “Building habit” or
            “Excellent commitment” so the numbers are easier to read as a gentle pattern rather than a score to chase.
          </p>
          <p>
            It is intentionally simple so you can focus more on how practice feels than on tracking exact numbers.
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
          <CardDescription>Complementary tools for mindfulness and well-being</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link
                  href="/category/health-fitness/meditation-breathing-rate-calculator"
                  className="text-primary hover:underline"
                >
                  Meditation Breathing Rhythm Helper
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">
                Explore a gentle breathing pace that can support your practice.
              </p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link
                  href="/category/health-fitness/meditation-time-progress-tracker-calculator"
                  className="text-primary hover:underline"
                >
                  Meditation Time Progress Tracker
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">
                Notice how your meditation minutes grow over longer stretches of time.
              </p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link
                  href="/category/health-fitness/habit-streak-tracker-calculator"
                  className="text-primary hover:underline"
                >
                  Habit Streak Tracker
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">Support consistency across several simple habits.</p>
            </div>
            <div className="p-4 border rounded">
              <h4 className="font-semibold mb-1">
                <Link
                  href="/category/health-fitness/stress-level-self-assessment-calculator"
                  className="text-primary hover:underline"
                >
                  Daily Stress Tendency Check-In
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">
                Reflect on how mindfulness practice may relate to how overloaded or steady days feel.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemType="https://schema.org/MedicalWebPage"
      >
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Mindfulness Practice: Building Consistency and Well-Being" />
        <meta
          itemProp="description"
          content="An expert, evidence-based guide on building a consistent mindfulness practice, detailing optimal practice duration, various mindfulness techniques, consistency strategies, and comprehensive approaches to enhance mental well-being and stress resilience."
        />
        <meta
          itemProp="keywords"
          content="mindfulness practice, mindful minutes tracking, meditation consistency, mindfulness techniques, stress reduction, mental well-being, mindfulness benefits"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-mindfulness-practice-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to Mindfulness Practice: Building Consistency, Tracking Progress, and Enhancing Well-Being
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the science of mindfulness practice, learn how to build consistency, understand various mindfulness techniques,
          discover optimal practice duration, and develop comprehensive strategies to enhance mental well-being and stress
          resilience.
        </p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#understanding-mindfulness" className="hover:underline">
              Understanding Mindfulness and Its Benefits
            </a>
          </li>
          <li>
            <a href="#practice-duration" className="hover:underline">
              Optimal Practice Duration and Consistency
            </a>
          </li>
          <li>
            <a href="#mindfulness-techniques" className="hover:underline">
              Types of Mindfulness Practices and Techniques
            </a>
          </li>
          <li>
            <a href="#building-consistency" className="hover:underline">
              Strategies for Building Consistent Practice
            </a>
          </li>
          <li>
            <a href="#tracking-progress" className="hover:underline">
              Tracking Progress and Maintaining Motivation
            </a>
          </li>
        </ul>
        <hr />

        {/* UNDERSTANDING MINDFULNESS */}
        <h2 id="understanding-mindfulness" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Mindfulness and Its Benefits
        </h2>
        <p>
          Mindfulness is the practice of intentionally paying attention to the present moment with openness, curiosity, and
          non-judgment. Rooted in ancient contemplative traditions and validated by modern research, mindfulness involves
          observing your thoughts, feelings, bodily sensations, and environment without trying to change or control them.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Science of Mindfulness</h3>
        <p>
          Research has shown that regular mindfulness practice can lead to:
        </p>
        <ul>
          <li>
            <b>Reduced stress and anxiety:</b> Mindfulness activates the parasympathetic nervous system and reduces cortisol levels.
          </li>
          <li>
            <b>Improved emotional regulation:</b> Regular practice strengthens the prefrontal cortex, enhancing emotional control.
          </li>
          <li>
            <b>Enhanced focus and attention:</b> Mindfulness training improves sustained attention and reduces mind-wandering.
          </li>
          <li>
            <b>Better sleep quality:</b> Mindfulness practices can reduce racing thoughts and promote relaxation before sleep.
          </li>
          <li>
            <b>Increased self-awareness:</b> Regular practice helps you notice patterns in thoughts, emotions, and behaviors.
          </li>
          <li>
            <b>Improved relationships:</b> Mindfulness enhances empathy, compassion, and present-moment connection with others.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">How Mindfulness Works</h3>
        <p>
          Mindfulness works by training your attention and changing your relationship with your experiences. Instead of being
          carried away by thoughts or emotions, you learn to observe them with curiosity and acceptance. This shift in perspective
          reduces reactivity, increases choice, and promotes a sense of calm and clarity.
        </p>

        <hr />

        {/* PRACTICE DURATION */}
        <h2 id="practice-duration" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Optimal Practice Duration and Consistency
        </h2>
        <p>
          Research suggests that consistency matters more than duration when building a mindfulness practice. Even short, regular
          sessions can yield significant benefits.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Recommended Practice Duration</h3>
        <p>
          <b>Beginners:</b> Start with 5-10 minutes daily. This duration is manageable and helps build the habit without feeling
          overwhelming.
        </p>
        <p>
          <b>Intermediate practitioners:</b> Aim for 10-20 minutes daily. This duration allows for deeper practice while remaining
          sustainable.
        </p>
        <p>
          <b>Advanced practitioners:</b> May practice 20-45 minutes or longer, often incorporating multiple sessions throughout the
          day.
        </p>
        <p>
          <b>Key principle:</b> Daily 5-minute practice is generally more beneficial than weekly 35-minute sessions. Consistency
          builds habit and cumulative benefits.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Weekly Targets and Patterns</h3>
        <p>
          A weekly total of 70-140 minutes (10-20 minutes daily) is often associated with meaningful benefits. However, starting
          lower and building gradually is perfectly fine. The goal is sustainable consistency, not perfection.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Multiple Daily Sessions</h3>
        <p>
          You can split your practice into multiple shorter sessions (e.g., 5 minutes morning and 5 minutes evening) rather than one
          longer session. This approach can be equally effective and may fit better into busy schedules.
        </p>

        <hr />

        {/* MINDFULNESS TECHNIQUES */}
        <h2 id="mindfulness-techniques" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Types of Mindfulness Practices and Techniques
        </h2>
        <p>
          Mindfulness can be practiced in many forms. Understanding different techniques helps you find practices that resonate with
          you and fit your lifestyle.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Formal Meditation Practices</h3>
        <p>
          <b>Focused attention meditation:</b> Focus on a single object (breath, body sensation, sound, or mantra) and gently
          return attention when the mind wanders. This practice builds concentration and awareness.
        </p>
        <p>
          <b>Open monitoring meditation:</b> Observe whatever arises in awareness—thoughts, feelings, sensations—without attachment
          or judgment. This practice develops equanimity and insight.
        </p>
        <p>
          <b>Body scan:</b> Systematically bring attention to different parts of the body, noticing sensations without trying to
          change them. This practice enhances body awareness and relaxation.
        </p>
        <p>
          <b>Loving-kindness meditation:</b> Cultivate feelings of kindness and compassion toward yourself and others through
          directed phrases and visualization. This practice enhances positive emotions and relationships.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Informal Mindfulness Practices</h3>
        <p>
          <b>Mindful breathing:</b> Bring attention to your breath during daily activities, noticing the rhythm and sensations of
          breathing.
        </p>
        <p>
          <b>Mindful eating:</b> Pay full attention to the experience of eating—tastes, textures, smells, and the act of
          chewing—without distractions.
        </p>
        <p>
          <b>Mindful walking:</b> Walk slowly and deliberately, noticing the sensations of movement, the ground beneath your feet,
          and your surroundings.
        </p>
        <p>
          <b>Mindful listening:</b> Give full attention to sounds—music, nature, conversations—without judgment or analysis.
        </p>
        <p>
          <b>Mindful activities:</b> Bring present-moment awareness to any daily activity—washing dishes, brushing teeth, driving,
          or working.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Movement-Based Practices</h3>
        <p>
          <b>Mindful yoga:</b> Combine physical postures with breath awareness and present-moment attention.
        </p>
        <p>
          <b>Tai chi or qigong:</b> Slow, flowing movements practiced with mindful awareness.
        </p>
        <p>
          <b>Mindful stretching:</b> Gentle stretching exercises performed with full attention to sensations and breath.
        </p>

        <hr />

        {/* BUILDING CONSISTENCY */}
        <h2 id="building-consistency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Strategies for Building Consistent Practice
        </h2>
        <p>
          Building a consistent mindfulness practice requires intention, planning, and self-compassion. Here are comprehensive
          strategies to support your journey.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Start Small and Realistic</h3>
        <ul>
          <li>
            <b>Begin with 5 minutes:</b> Start with a duration that feels easy and sustainable.
          </li>
          <li>
            <b>Focus on consistency:</b> Prioritize daily practice over longer sessions.
          </li>
          <li>
            <b>Build gradually:</b> Increase duration only when shorter practice feels natural and easy.
          </li>
          <li>
            <b>Avoid perfectionism:</b> Some practice is better than no practice, even if it is not perfect.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Establish a Routine</h3>
        <ul>
          <li>
            <b>Choose a consistent time:</b> Practice at the same time each day to build habit strength.
          </li>
          <li>
            <b>Create a dedicated space:</b> Designate a quiet, comfortable area for practice.
          </li>
          <li>
            <b>Link to existing habits:</b> Practice right after an established routine (e.g., after morning coffee or before bed).
          </li>
          <li>
            <b>Set reminders:</b> Use alarms, apps, or calendar notifications to support consistency.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Make It Enjoyable</h3>
        <ul>
          <li>
            <b>Experiment with different practices:</b> Try various techniques to find what you enjoy.
          </li>
          <li>
            <b>Use guided meditations:</b> Apps, recordings, or classes can provide structure and support.
          </li>
          <li>
            <b>Practice with others:</b> Join a group, class, or online community for motivation and connection.
          </li>
          <li>
            <b>Celebrate small wins:</b> Acknowledge your consistency and progress, no matter how small.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Handle Obstacles with Compassion</h3>
        <ul>
          <li>
            <b>Expect resistance:</b> It is normal to experience resistance, restlessness, or boredom.
          </li>
          <li>
            <b>Missed days are okay:</b> Do not let missed days derail your practice. Simply return when you can.
          </li>
          <li>
            <b>Adjust when needed:</b> If your routine is not working, modify it rather than abandoning practice.
          </li>
          <li>
            <b>Practice self-compassion:</b> Be kind to yourself when practice feels difficult or inconsistent.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">5. Integrate Mindfulness into Daily Life</h3>
        <ul>
          <li>
            <b>Practice during transitions:</b> Use mindfulness during breaks, commutes, or between activities.
          </li>
          <li>
            <b>Mindful moments:</b> Take brief pauses throughout the day to check in with your present-moment experience.
          </li>
          <li>
            <b>Combine with activities:</b> Practice mindfulness while walking, eating, or doing routine tasks.
          </li>
          <li>
            <b>Use stress as a reminder:</b> When you notice stress, use it as a cue to practice mindfulness.
          </li>
        </ul>

        <hr />

        {/* TRACKING PROGRESS */}
        <h2 id="tracking-progress" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Tracking Progress and Maintaining Motivation
        </h2>
        <p>
          Tracking your mindfulness practice can support consistency and motivation, but it is important to balance tracking with
          non-attachment to outcomes.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Benefits of Tracking</h3>
        <ul>
          <li>
            <b>Builds awareness:</b> Tracking helps you notice patterns in your practice and life.
          </li>
          <li>
            <b>Provides motivation:</b> Seeing consistency can encourage continued practice.
          </li>
          <li>
            <b>Identifies obstacles:</b> Tracking reveals when and why practice becomes difficult.
          </li>
          <li>
            <b>Celebrates progress:</b> Recognizing your consistency reinforces the habit.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Healthy Tracking Approaches</h3>
        <ul>
          <li>
            <b>Focus on consistency:</b> Track whether you practiced, not how "well" you practiced.
          </li>
          <li>
            <b>Approximate times:</b> Exact minutes are less important than regular practice.
          </li>
          <li>
            <b>Avoid perfectionism:</b> Do not let tracking become a source of stress or judgment.
          </li>
          <li>
            <b>Use tools that help:</b> Apps, journals, or simple calendars can support tracking without obsession.
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Maintaining Long-Term Motivation</h3>
        <ul>
          <li>
            <b>Remember your why:</b> Reconnect with your reasons for practicing when motivation wanes.
          </li>
          <li>
            <b>Notice benefits:</b> Pay attention to how practice affects your daily life, stress levels, and well-being.
          </li>
          <li>
            <b>Adjust your approach:</b> If practice feels stale, try new techniques or formats.
          </li>
          <li>
            <b>Seek support:</b> Connect with teachers, communities, or resources when you need guidance or encouragement.
          </li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>
          Building a consistent mindfulness practice is a journey that offers profound benefits for mental well-being, stress
          resilience, and overall quality of life. By understanding the science of mindfulness, optimal practice duration, various
          techniques, and strategies for building consistency, you can develop a sustainable practice that serves your needs.
          Remember that consistency matters more than perfection—even brief, regular practice can yield meaningful benefits. Be
          patient with yourself, experiment with different approaches, and allow your practice to evolve naturally. If you have
          concerns about how mindfulness relates to your mental health or well-being, consider consulting a qualified mental health
          professional who can provide personalized guidance. This tool is designed to support a lifestyle-based practice, not to
          replace therapeutic or medical care.
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Using mindfulness minutes as a gentle guide, not a strict target</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqs.map(([q, a], i) => (
            <div key={i}>
              <h4 className="font-semibold mb-1">{q}</h4>
              <p className="text-sm text-muted-foreground">{a}</p>
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
            This tool offers a gentle look at how many mindful minutes you’ve been weaving into a week. It focuses on trends and
            patterns rather than on “good” or “bad” scores.
          </p>
          <p>
            Outputs include weekly totals, daily averages, a simple streak count, a pattern label, recommendations, an 8‑week
            plan, and guide content so that people or AI assistants can quickly understand what the numbers mean in a wellness
            context.
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
            medical or psychological diagnosis, assessment, or treatment plan. For any health concerns, please consult a
            qualified professional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
