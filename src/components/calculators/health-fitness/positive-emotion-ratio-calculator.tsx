'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  positiveEvents: z.number({ invalid_type_error: 'Enter count' }).min(0).max(200),
  negativeEvents: z.number({ invalid_type_error: 'Enter count' }).min(0).max(200),
  positiveMinutes: z.number({ invalid_type_error: 'Enter minutes' }).min(0).max(1000),
  negativeMinutes: z.number({ invalid_type_error: 'Enter minutes' }).min(0).max(1000),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  positiveEvents: number;
  negativeEvents: number;
  positiveMinutes: number;
  negativeMinutes: number;
  ratioEvents: number;
  ratioTime: number;
  combinedScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count approximate positive emotional instances (moments of joy, gratitude, pride, calm) during the day or week.',
  'Count approximate negative emotional instances (stress, anger, anxiety, sadness) for the same period.',
  'Estimate minutes spent in positive and negative states (time you felt mostly that emotion).',
  'Enter the four values into the calculator.',
  'Review your positive–negative ratios, combined score, and suggested micro-adjustments.',
];

const faqs = [
  {
    question: 'What is a Positive Emotion Ratio?',
    answer:
      'It is the relationship between positive and negative emotional experiences over a time period. Research suggests higher ratios are linked to resilience, wellbeing, and healthier relationships.',
  },
  {
    question: 'What ratio should I aim for?',
    answer:
      'Context matters, but many wellbeing frameworks reference a ratio around 3:1 or higher (three positive experiences for every one negative) as broadly supportive of flourishing, not as a strict rule.',
  },
  {
    question: 'Why track minutes as well as event counts?',
    answer:
      'A single negative event that lasts hours can outweigh many tiny positive moments. Minutes help capture intensity and duration, not just frequency.',
  },
  {
    question: 'Is it bad to have negative emotions?',
    answer:
      'No. Negative emotions are normal and often useful signals. The goal is not to eliminate them but to ensure they do not chronically dominate your inner landscape.',
  },
  {
    question: 'How accurate do these counts need to be?',
    answer:
      'Rough estimates are fine. The value is in noticing patterns and trends over time, not in perfectly precise measurements.',
  },
  {
    question: 'Can I use this with my partner or team?',
    answer:
      'Yes. Partners or teams can log shared positive and negative interactions (appreciations vs. conflicts) to discuss culture and communication honestly.',
  },
  {
    question: 'How often should I recalculate?',
    answer:
      'Weekly or monthly is usually enough. In stressful seasons, you might track daily to ensure you are deliberately adding positive experiences.',
  },
  {
    question: 'What if my ratio is very low?',
    answer:
      'Low ratios may signal chronic stress, burnout, or other challenges. Use the recommendations to design small positive inputs and consider talking with a mental health professional.',
  },
  {
    question: 'Can gratitude or self-compassion improve my ratio?',
    answer:
      'Yes. Practices like gratitude journaling, savoring, self-compassion, and pleasant-activity scheduling are proven ways to increase positive emotional moments.',
  },
  {
    question: 'Should I ignore negative events to improve my score?',
    answer:
      'No. Denial backfires. A sustainable ratio comes from processing and integrating negative experiences while intentionally cultivating positive ones.',
  },
];

const relatedCalculators = [
  {
    name: 'Gratitude & Mood Correlation Tracker',
    slug: 'gratitude-mood-correlation-tracker',
    description: 'Explore how gratitude rituals shift mood trends.',
  },
  {
    name: 'Emotional Burnout Recovery Calculator',
    slug: 'emotional-burnout-recovery-calculator',
    description: 'Check how emotional load interacts with burnout risk.',
  },
  {
    name: 'Resilience Score Calculator',
    slug: 'resilience-score-calculator',
    description: 'Assess resilience factors alongside emotional balance.',
  },
  {
    name: 'Positive vs Negative Thought Ratio Calculator',
    slug: 'positive-vs-negative-thought-ratio-calculator',
    description: 'Compare thought patterns with felt emotions.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/positive-emotion-ratio-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Positive Emotion Ratio Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Positive Emotion Ratio Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate your positive vs negative emotion ratio using counts and minutes spent in each state.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { positiveEvents, negativeEvents, positiveMinutes, negativeMinutes } = values;

  const ratioEvents = negativeEvents === 0 ? positiveEvents : positiveEvents / Math.max(negativeEvents, 1);
  const ratioTime = negativeMinutes === 0 ? (positiveMinutes > 0 ? 10 : 0) : positiveMinutes / Math.max(negativeMinutes, 1);

  const normalizedEvents = clamp(ratioEvents / 3, 0, 3); // 3:1 baseline
  const normalizedTime = clamp(ratioTime / 3, 0, 3);
  const combinedScore = clamp(((normalizedEvents + normalizedTime) / 2) * 100, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your positive emotion ratio may feel supportive for your overall day-to-day wellbeing.';

  if (combinedScore < 40) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where positive experiences may currently feel less frequent than more neutral or difficult moments. You might gently experiment with adding small, pleasant or meaningful moments into your days. This is a personal insight, not a medical evaluation.';
  } else if (combinedScore < 60) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where your days may contain a mix of uplifting and more challenging stretches. You may consider noticing and savoring the positive moments that do show up, even when days feel busy.';
  } else if (combinedScore < 80) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where you may experience more positive than challenging emotion overall. Gentle micro-habits—like brief walks, music, or gratitude notes—may support this pattern further if you choose.';
  }

  const recommendations: string[] = [
    'Schedule at least one deliberately pleasant or meaningful activity per day (walk, music, conversation, hobby).',
    'Use a short evening reflection to note three positive moments, however small, from the day.',
    'Notice and label negative emotions with curiosity instead of judgment; this often shortens their duration.',
  ];

  if (negativeEvents > positiveEvents) {
    recommendations.push('Identify recurring negative triggers and see where boundaries, problem-solving, or support could reduce frequency.');
  }

  if (negativeMinutes > positiveMinutes) {
    recommendations.push('Experiment with “micro resets” (2–5 minutes of breathwork, stretching, or going outside) whenever you feel stuck in a negative state.');
  }

  if (positiveEvents === 0 && positiveMinutes === 0) {
    recommendations.push('If you are struggling to identify any positive experiences, consider reaching out to a trusted person or professional for support.');
  }

  const plan = [
    { label: 'This Week', detail: 'Track daily positive and negative moments in a simple note or app. Add one small enjoyable activity to each day.' },
    { label: 'This Month', detail: 'Review patterns: which contexts increase positive emotion, and which drain you? Shift time toward the former where possible.' },
    { label: 'Ongoing', detail: 'Recalculate your ratio periodically and pair it with other wellbeing metrics (sleep, stress, connection quality).' },
  ];

  return {
    positiveEvents,
    negativeEvents,
    positiveMinutes,
    negativeMinutes,
    ratioEvents: Number(ratioEvents.toFixed(2)),
    ratioTime: Number(ratioTime.toFixed(2)),
    combinedScore: Number(combinedScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function PositiveEmotionRatioCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      positiveEvents: undefined,
      negativeEvents: undefined,
      positiveMinutes: undefined,
      negativeMinutes: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="positive-emotion-ratio-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Positive Emotion Ratio Calculator
          </CardTitle>
          <CardDescription>Estimate your balance of positive versus negative emotions from counts and minutes.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your emotion data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="positiveEvents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Positive events (count)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 18" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="negativeEvents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negative events (count)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="positiveMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Positive minutes (total)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 240" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="negativeMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negative minutes (total)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate positive emotion ratio
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
            <CardDescription>See event ratio, time ratio, combined score, and guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Event ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.ratioEvents}</p>
                <p className="text-xs text-muted-foreground">Positive : Negative</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Time ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.ratioTime}</p>
                <p className="text-xs text-muted-foreground">Minutes positive : negative</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Combined score</p>
                <p className="text-2xl font-semibold text-primary">{result.combinedScore}</p>
                <p className="text-xs text-muted-foreground">0–100 scale</p>
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
            <strong>Event ratio</strong> is positive events divided by negative events (or just the count of positives if there are no negatives).
          </p>
          <p>
            <strong>Time ratio</strong> is minutes spent in positive states divided by minutes in negative states. When there are no negative minutes, a high placeholder ratio is used to reflect a very positive balance.
          </p>
          <p>
            <strong>Combined score</strong> averages the normalized event and time ratios on a 0–100 scale using a 3:1 benchmark as a flourishing reference point.
          </p>
          <p>These formulas are simplifications meant for self-reflection, not clinical diagnosis; focus on trends over time rather than any single score.</p>
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
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total events</p>
                <p className="text-xl font-semibold text-primary">{result.positiveEvents + result.negativeEvents}</p>
                <p className="text-xs text-muted-foreground">Positive + negative</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total minutes</p>
                <p className="text-xl font-semibold text-primary">{result.positiveMinutes + result.negativeMinutes}</p>
                <p className="text-xs text-muted-foreground">Emotional minutes logged</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Positive share of time</p>
                <p className="text-xl font-semibold text-primary">
                  {result.positiveMinutes + result.negativeMinutes === 0
                    ? '0%'
                    : `${Math.round((result.positiveMinutes / (result.positiveMinutes + result.negativeMinutes)) * 100)}%`}
                </p>
                <p className="text-xs text-muted-foreground">Of logged emotional time</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Provide your emotion counts and minutes to see additional metrics.</p>
          )}
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/MedicalWebPage">
        <meta itemProp="name" content="Positive Emotion Ratio: A Practical Guide to Emotional Balance" />
        <meta itemProp="description" content="Understand and track your positive emotion ratio, learn the research behind it, and design simple habits to shift your daily balance toward thriving." />
        <meta itemProp="keywords" content="positive emotion ratio, positivity ratio, flourishing, emotional balance, resilience" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-positive-emotion-ratio-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          The Positive Emotion Ratio: How Much Positivity Do You Actually Experience?
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how your balance of positive and negative emotions shapes resilience, relationships, and long-term health—and how to shift the ratio without toxic positivity.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#ratio-basics" className="hover:underline">What Is the Positive Emotion Ratio?</a></li>
          <li><a href="#research" className="hover:underline">Research and Misconceptions</a></li>
          <li><a href="#measurement" className="hover:underline">How to Measure Your Ratio Safely</a></li>
          <li><a href="#habits" className="hover:underline">Habits That Tilt the Ratio</a></li>
          <li><a href="#when-to-seek-help" className="hover:underline">When Low Ratios Need Extra Support</a></li>
        </ul>
        <hr />

        <h2 id="ratio-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          What Is the Positive Emotion Ratio?
        </h2>
        <p>
          The positive emotion ratio looks at how many moments of joy, curiosity, gratitude, love, or calm you experience relative to moments of anger, fear, stress, or sadness. It does not deny that negative emotions are
          valid—it simply gives a sense of whether your nervous system is spending most of the day under threat or in safety.
        </p>

        <h2 id="research" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Research and Misconceptions
        </h2>
        <p>
          Early popular writing sometimes treated specific ratios (like 3:1) as exact prescriptions, which drew criticism from statisticians. Today, most experts treat positive emotion ratios as directional indicators: higher
          ratios correlate with better outcomes, but there is no magical cut-off. Context—such as grief, illness, or systemic stressors—matters.
        </p>

        <h2 id="measurement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          How to Measure Your Ratio Safely
        </h2>
        <p>
          Use quick logs or reflective check-ins rather than obsessively tracking every moment. The aim is to notice patterns (for example, certain meetings always lower your ratio) and nudge the environment, not to score
          yourself morally.
        </p>

        <h2 id="habits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Habits That Tilt the Ratio
        </h2>
        <p>
          Powerful levers include sleep, movement, meaningful relationships, gratitude practices, creative hobbies, and values-aligned work. Even small doses—a five-minute walk, one kind message—accumulate when practiced daily.
        </p>

        <h2 id="when-to-seek-help" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          When Low Ratios Need Extra Support
        </h2>
        <p>
          If your ratio remains very low for weeks, especially with symptoms like hopelessness, withdrawal, or major functional changes, consider reaching out to a therapist, counselor, or healthcare provider. Tools like this
          calculator are complements, not replacements, for professional care.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          By gently tracking your positive emotion ratio and experimenting with small habit shifts, you can gradually move your days toward more safety, connection, and joy—without pretending that hard things do not exist.
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
            This tool provides general wellness insights about your positive emotion ratio using event counts and minutes
            in positive versus negative states. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>Outputs include event ratio, time ratio, combined score, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs make the methodology easy to interpret for humans and AI assistants.</p>
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
            Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is
            not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


