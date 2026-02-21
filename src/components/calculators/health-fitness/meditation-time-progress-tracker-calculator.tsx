'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Brain } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  targetMinutes: z.number({ invalid_type_error: 'Enter target minutes' }).positive(),
  mon: z.number({ invalid_type_error: 'Enter Monday minutes' }).min(0),
  tue: z.number({ invalid_type_error: 'Enter Tuesday minutes' }).min(0),
  wed: z.number({ invalid_type_error: 'Enter Wednesday minutes' }).min(0),
  thu: z.number({ invalid_type_error: 'Enter Thursday minutes' }).min(0),
  fri: z.number({ invalid_type_error: 'Enter Friday minutes' }).min(0),
  sat: z.number({ invalid_type_error: 'Enter Saturday minutes' }).min(0),
  sun: z.number({ invalid_type_error: 'Enter Sunday minutes' }).min(0),
});
type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  targetMinutes: number;
  total: number;
  average: number;
  percentage: number;
  streak: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your daily meditation or quiet time target (minutes per day).',
  'Enter actual minutes practiced for each day of the week (Mon-Sun).',
  'Review total minutes, daily average, target percentage, streak, and recommendations.',
];

const faqs = [
  {
    question: 'What is meditation time progress tracking?',
    answer:
      'Meditation time progress tracking involves monitoring how much time you spend in meditation or quiet practice each day and week. It helps you notice patterns, build consistency, and maintain awareness of your practice without judgment.',
  },
  {
    question: 'How much meditation time should I aim for?',
    answer:
      'Start with 5-10 minutes daily and gradually increase as you build consistency. Research suggests 10-20 minutes daily can provide meaningful benefits, but even shorter sessions are valuable. Consistency matters more than duration.',
  },
  {
    question: 'What counts as meditation or quiet time?',
    answer:
      'Any intentional quiet practice counts: formal meditation, breathing exercises, mindful walking, body scans, guided meditations, or simply sitting quietly. The key is intentional, present-moment awareness rather than a specific technique.',
  },
  {
    question: 'Is tracking meditation time necessary?',
    answer:
      'Tracking is optional and can be helpful for building consistency and noticing patterns. However, avoid becoming overly focused on numbers. The quality and consistency of practice matter more than exact minutes. Some people prefer not to track at all.',
  },
  {
    question: 'What if I miss days?',
    answer:
      'Missing days is normal and part of building a practice. Avoid self-judgment and simply return to practice when you can. Consistency over time matters more than perfect daily adherence. Use missed days as learning opportunities rather than failures.',
  },
  {
    question: 'How do I build a consistent meditation practice?',
    answer:
      'Build consistency by starting small (5-10 minutes), choosing a consistent time and place, using guided meditations or apps when helpful, being patient with yourself, and focusing on showing up rather than perfect sessions.',
  },
  {
    question: 'Can meditation help with stress and anxiety?',
    answer:
      'Research suggests regular meditation can help reduce stress and anxiety for many people. However, meditation is not a replacement for professional mental health treatment. If you have significant anxiety or stress, consider combining meditation with professional support.',
  },
  {
    question: 'What are the benefits of regular meditation?',
    answer:
      'Potential benefits include reduced stress, improved focus and attention, better emotional regulation, increased self-awareness, improved sleep, and greater sense of calm. Benefits vary by individual and develop gradually over time.',
  },
  {
    question: 'Should I track meditation time daily or weekly?',
    answer:
      'Both approaches work. Daily tracking provides immediate feedback, while weekly tracking offers a broader perspective and reduces daily pressure. Choose what feels supportive rather than stressful. Many people find weekly tracking less overwhelming.',
  },
  {
    question: 'What if my meditation practice feels difficult?',
    answer:
      'Difficulty is normal, especially when starting. Common challenges include restlessness, distraction, sleepiness, or frustration. These are part of the practice. Be patient, adjust your approach if needed, and consider seeking guidance from teachers or resources.',
  },
];

const relatedCalculators = [
  {
    name: 'Mindful Minutes Consistency Tracker',
    slug: 'mindful-minutes-tracking-calculator',
    description: 'Track weekly mindfulness practice patterns.',
  },
  {
    name: 'Meditation Breathing Rhythm Helper',
    slug: 'meditation-breathing-rate-calculator',
    description: 'Find optimal breathing rates for meditation.',
  },
  {
    name: 'Daily Stress Tendency Check-In',
    slug: 'daily-activity-points-calculator',
    description: 'Assess how stress may relate to meditation practice.',
  },
  {
    name: 'Sleep Balance Check-In',
    slug: 'habit-streak-tracker-calculator',
    description: 'Explore how meditation may support sleep.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/habit-streak-tracker-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Meditation Time Progress Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'Article',
      headline: 'Meditation Time Progress Tracker',
      description: 'Track meditation time progress from daily practice minutes and weekly targets.',
      author: { '@type': 'Organization', name: 'Mycalculating.com' },
      publisher: { '@type': 'Organization', name: 'Mycalculating.com', logo: { '@type': 'ImageObject', url: 'https://mycalculating.com/logo.png' } },
      url: baseUrl,
      mainEntityOfPage: { '@type': 'WebPage', '@id': baseUrl },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString().split('T')[0],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Meditation Time Progress Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Track meditation time progress from daily practice minutes and weekly targets.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    },
    {
      '@type': 'HowTo',
      name: 'How to Use Meditation Time Progress Tracker',
      description: 'Step-by-step guide to track meditation time progress',
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const dailyMinutes = [values.mon, values.tue, values.wed, values.thu, values.fri, values.sat, values.sun];
  const total = dailyMinutes.reduce((sum, day) => sum + day, 0);
  const average = total / 7;
  const percentage = (total / (values.targetMinutes * 7)) * 100;

  // Calculate streak (consecutive days meeting target from start)
  let streak = 0;
  for (let i = 0; i < 7; i++) {
    if (dailyMinutes[i] >= values.targetMinutes) {
      streak++;
    } else {
      break;
    }
  }

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'Great consistency! You have established a strong meditation practice. Keep building this healthy habit.';

  if (percentage < 50) {
    status = 'low';
    interpretation =
      'Start small and build gradually. Even 5-10 minutes daily makes a difference. Focus on consistency over duration, and be patient with yourself as you develop this practice.';
  } else if (percentage < 80) {
    status = 'moderate';
    interpretation =
      'Good progress! You are building your meditation practice. Try to increase consistency to meet your daily target, and remember that showing up regularly matters more than perfect sessions.';
  } else if (percentage >= 100 && streak >= 5) {
    status = 'optimal';
    interpretation =
      'Excellent! You have established a strong meditation practice with consistent daily practice. Keep maintaining this healthy habit.';
  } else {
    status = 'good';
    interpretation =
      'You are making good progress with your meditation practice. Continue building consistency and notice how regular practice supports your well-being.';
  }

  const recommendations = [
    'Choose a consistent time and quiet space for your practice.',
    'Start with shorter sessions and gradually increase duration as you build consistency.',
    'Use guided meditations or apps when helpful, especially when starting.',
  ];

  if (percentage < 50) {
    recommendations.push('Focus on showing up daily, even for just 5 minutes, rather than aiming for longer sessions.');
    recommendations.push('Be patient with yourself and avoid self-judgment about missed days or shorter sessions.');
  }

  if (streak < 3) {
    recommendations.push('Build consistency by practicing at the same time each day to create a habit.');
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Establish a daily meditation routine: choose a consistent time and place, start with 5-10 minutes, and focus on showing up daily rather than perfect sessions.',
    },
    {
      label: 'This Month',
      detail:
        'Build consistency: maintain daily practice, gradually increase duration if desired, experiment with different techniques, and notice how practice affects your well-being.',
    },
    {
      label: 'Ongoing',
      detail:
        'Maintain your practice: continue regular meditation, adjust duration and techniques as needed, be patient with challenges, and remember that consistency over time matters more than perfect daily adherence.',
    },
  ];

  return {
    targetMinutes: values.targetMinutes,
    total,
    average,
    percentage,
    streak,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MeditationTimeProgressTrackerCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
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
      sun: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="meditation-time-progress-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Meditation Time Progress Tracker
          </CardTitle>
          <CardDescription>
            Track your meditation or quiet time practice progress from daily minutes and weekly targets. This is a personal
            lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your meditation practice data</CardTitle>
        </CardHeader>
        <CardContent>
      <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="targetMinutes"
              render={({ field }) => (
                <FormItem>
                      <FormLabel>Daily target (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                          placeholder="e.g., 10"
                      value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => (
              <FormField
                key={day}
                control={form.control}
                name={day}
                render={({ field }) => (
                  <FormItem>
                        <FormLabel className="capitalize text-sm">{day}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                            placeholder="0"
                        value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate progress
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
            <CardDescription>See total minutes, daily average, target percentage, streak, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Minutes</p>
                <p className="text-2xl font-semibold text-primary">{result.total}</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Daily Average</p>
                <p className="text-2xl font-semibold text-primary">{result.average.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Minutes</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Target Met</p>
                <p className="text-2xl font-semibold text-primary">{result.percentage.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of weekly goal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
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
            <strong>Total Minutes</strong> = Sum of all daily practice minutes (Mon + Tue + Wed + Thu + Fri + Sat + Sun).
          </p>
          <p>
            <strong>Daily Average</strong> = Total Minutes / 7. This represents average minutes practiced per day.
          </p>
          <p>
            <strong>Target Percentage</strong> = (Total Minutes / (Target Minutes Ã— 7)) Ã— 100. This shows how much of your
            weekly goal you achieved.
          </p>
          <p>
            <strong>Streak</strong> = Consecutive days from the start of the week meeting or exceeding the daily target.
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
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
          </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
        </div>
          ))}
      </CardContent>
    </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemType="https://schema.org/MedicalWebPage"
      >
        {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
        <meta itemProp="name" content="The Definitive Guide to Meditation Practice: Tracking Progress and Building Consistency" />
        <meta
          itemProp="description"
          content="An expert, evidence-based guide on meditation practice tracking, detailing how to build consistent practice, set realistic goals, measure progress, and develop sustainable meditation habits for stress reduction and well-being."
        />
        <meta
          itemProp="keywords"
          content="meditation time tracking, meditation progress tracker, building meditation practice, meditation consistency, stress reduction meditation, mindfulness practice"
        />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-meditation-practice-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Definitive Guide to Meditation Practice: Tracking Progress, Building Consistency, and Supporting Well-Being
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore the science of meditation practice, learn how to track progress effectively, understand factors affecting
          consistency, and discover comprehensive strategies to build and maintain a sustainable meditation practice for stress
          reduction and overall well-being.
        </p>

        {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#understanding-meditation" className="hover:underline">
              Understanding Meditation Practice and Its Benefits
            </a>
          </li>
          <li>
            <a href="#tracking-progress" className="hover:underline">
              Tracking Meditation Progress Effectively
            </a>
          </li>
          <li>
            <a href="#building-consistency" className="hover:underline">
              Building Consistent Meditation Practice
            </a>
          </li>
          <li>
            <a href="#meditation-techniques" className="hover:underline">
              Types of Meditation and Practice Techniques
            </a>
          </li>
          <li>
            <a href="#overcoming-challenges" className="hover:underline">
              Overcoming Common Challenges in Meditation Practice
            </a>
          </li>
        </ul>
        <hr />

        {/* UNDERSTANDING MEDITATION */}
        <h2 id="understanding-meditation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Meditation Practice and Its Benefits
        </h2>
        <p>
          Meditation is a practice of training attention and awareness to achieve mental clarity, emotional calm, and a sense of
          well-being. Regular meditation practice has been shown to offer numerous benefits for physical and mental health,
          including stress reduction, improved focus, better emotional regulation, and enhanced overall well-being.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Benefits of Regular Meditation</h3>
        <p>
          Research has demonstrated that regular meditation practice can lead to:
        </p>
        <ul>
          <li>
            <b>Stress reduction:</b> Meditation activates the relaxation response, reducing cortisol levels and promoting calm
          </li>
          <li>
            <b>Improved focus:</b> Regular practice enhances attention, concentration, and cognitive function
          </li>
          <li>
            <b>Emotional regulation:</b> Meditation helps develop awareness of emotions and improves ability to respond rather than
            react
          </li>
          <li>
            <b>Better sleep:</b> Meditation can improve sleep quality and help with insomnia
          </li>
          <li>
            <b>Reduced anxiety:</b> Regular practice can decrease anxiety symptoms and improve overall mental health
          </li>
          <li>
            <b>Increased self-awareness:</b> Meditation develops greater awareness of thoughts, feelings, and patterns
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">How Meditation Works</h3>
        <p>
          Meditation works by training the mind to focus attention and observe experiences without judgment. This practice
          strengthens neural pathways associated with attention, emotional regulation, and self-awareness, leading to lasting
          changes in brain structure and function over time.
        </p>

        <hr />

        {/* TRACKING PROGRESS */}
        <h2 id="tracking-progress" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Tracking Meditation Progress Effectively
        </h2>
        <p>
          Tracking meditation practice can help build consistency and provide insight into patterns, but it is important to
          balance tracking with non-attachment to outcomes.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Why Track Meditation Time</h3>
        <ul>
          <li>
            <b>Builds consistency:</b> Tracking helps establish and maintain regular practice habits
          </li>
          <li>
            <b>Provides motivation:</b> Seeing progress can encourage continued practice
          </li>
          <li>
            <b>Identifies patterns:</b> Tracking reveals when and why practice becomes easier or more challenging
          </li>
          <li>
            <b>Celebrates progress:</b> Recognizing consistency reinforces the habit
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Healthy Tracking Approaches</h3>
        <ul>
          <li>
            <b>Focus on consistency:</b> Track whether you practiced, not how "well" you practiced
          </li>
          <li>
            <b>Approximate times:</b> Exact minutes are less important than regular practice
          </li>
          <li>
            <b>Avoid perfectionism:</b> Don't let tracking become a source of stress or judgment
          </li>
          <li>
            <b>Use tools that help:</b> Apps, journals, or simple calendars can support tracking without obsession
          </li>
        </ul>

        <hr />

        {/* BUILDING CONSISTENCY */}
        <h2 id="building-consistency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Building Consistent Meditation Practice
        </h2>
        <p>
          Building a consistent meditation practice requires intention, planning, and self-compassion. Here are
          evidence-based strategies.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Start Small and Realistic</h3>
        <ul>
          <li>
            <b>Begin with 5-10 minutes:</b> Start with a duration that feels easy and sustainable
          </li>
          <li>
            <b>Focus on consistency:</b> Prioritize daily practice over longer sessions
          </li>
          <li>
            <b>Build gradually:</b> Increase duration only when shorter practice feels natural
          </li>
          <li>
            <b>Avoid perfectionism:</b> Some practice is better than no practice, even if not perfect
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Establish a Routine</h3>
        <ul>
          <li>
            <b>Choose a consistent time:</b> Practice at the same time each day to build habit strength
          </li>
          <li>
            <b>Create a dedicated space:</b> Designate a quiet, comfortable area for practice
          </li>
          <li>
            <b>Link to existing habits:</b> Practice right after an established routine (e.g., after morning coffee)
          </li>
          <li>
            <b>Set reminders:</b> Use alarms, apps, or calendar notifications to support consistency
          </li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Make It Enjoyable</h3>
        <ul>
          <li>
            <b>Experiment with different practices:</b> Try various techniques to find what you enjoy
          </li>
          <li>
            <b>Use guided meditations:</b> Apps, recordings, or classes can provide structure and support
          </li>
          <li>
            <b>Practice with others:</b> Join a group, class, or online community for motivation
          </li>
          <li>
            <b>Celebrate small wins:</b> Acknowledge your consistency and progress, no matter how small
          </li>
        </ul>

        <hr />

        {/* MEDITATION TECHNIQUES */}
        <h2 id="meditation-techniques" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Types of Meditation and Practice Techniques
        </h2>
        <p>
          Various meditation techniques can support different goals and preferences. Understanding different approaches helps you
          find practices that resonate with you.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Focused Attention Meditation</h3>
        <p>
          Focus on a single object (breath, body sensation, sound, or mantra) and gently return attention when the mind wanders.
          This practice builds concentration and awareness.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Open Monitoring Meditation</h3>
        <p>
          Observe whatever arises in awarenessâ€”thoughts, feelings, sensationsâ€”without attachment or judgment. This practice
          develops equanimity and insight.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Loving-Kindness Meditation</h3>
        <p>
          Cultivate feelings of kindness and compassion toward yourself and others through directed phrases and visualization.
          This practice enhances positive emotions and relationships.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Body Scan Meditation</h3>
        <p>
          Systematically bring attention to different parts of the body, noticing sensations without trying to change them. This
          practice enhances body awareness and relaxation.
        </p>

        <hr />

        {/* OVERCOMING CHALLENGES */}
        <h2 id="overcoming-challenges" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Overcoming Common Challenges in Meditation Practice
        </h2>
        <p>
          Common challenges in meditation include restlessness, distraction, sleepiness, and frustration. These are normal parts
          of practice.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Dealing with Distraction</h3>
        <ul>
          <li>
            <b>Expect distractions:</b> Mind-wandering is normal, not a failure
          </li>
          <li>
            <b>Gently return:</b> When you notice distraction, gently return attention without judgment
          </li>
          <li>
            <b>Use anchors:</b> Return to your chosen focus (breath, body, sound) as an anchor
          </li>
      </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Handling Restlessness</h3>
        <ul>
          <li>
            <b>Adjust posture:</b> Find a comfortable position that supports alertness
          </li>
          <li>
            <b>Start with movement:</b> Try walking meditation or gentle movement before sitting
          </li>
          <li>
            <b>Shorten sessions:</b> Reduce duration if restlessness is overwhelming
          </li>
      </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Managing Sleepiness</h3>
        <ul>
          <li>
            <b>Practice when alert:</b> Choose times when you are naturally more awake
          </li>
          <li>
            <b>Open eyes slightly:</b> Keep eyes slightly open to maintain alertness
          </li>
          <li>
            <b>Ensure adequate sleep:</b> Address underlying sleep issues if sleepiness persists
          </li>
      </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>
          Building a consistent meditation practice is a journey that offers profound benefits for mental well-being, stress
          resilience, and overall quality of life. By understanding meditation benefits, tracking progress effectively, building
          consistency, exploring different techniques, and overcoming common challenges, you can develop a sustainable practice
          that serves your needs. Remember that consistency matters more than perfectionâ€”even brief, regular practice can yield
          meaningful benefits. Be patient with yourself, experiment with different approaches, and allow your practice to evolve
          naturally. If you have concerns about how meditation relates to your mental health or well-being, consider consulting
          a qualified mental health professional who can provide personalized guidance. This tool is designed to support a
          lifestyle-based practice, not to replace therapeutic or medical care.
        </p>
    </section>

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
            This tool offers meditation time progress tracking from daily practice minutes and weekly targets as a gentle,
            lifestyle-oriented snapshot. It is intended for personal reflection, not for diagnosis or treatment decisions.
          </p>
          <p>
            Outputs include total minutes, daily average, target percentage, streak count, wellness status, interpretation text,
            supportive recommendations, an action plan, and contextual information about the inputs and simple calculation
            approach.
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
