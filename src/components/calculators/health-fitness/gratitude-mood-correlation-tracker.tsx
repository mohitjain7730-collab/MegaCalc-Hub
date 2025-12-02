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
  gratitudeEntries: z.number({ invalid_type_error: 'Enter entry count' }).min(0).max(70),
  averageMood: z.number({ invalid_type_error: 'Enter mood score' }).min(1).max(10),
  stressLevel: z.number({ invalid_type_error: 'Enter stress score' }).min(1).max(10),
  reflectionDepth: z.number({ invalid_type_error: 'Enter depth score' }).min(1).max(5),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  gratitudeEntries: number;
  averageMood: number;
  stressLevel: number;
  reflectionDepth: number;
  correlationScore: number;
  moodDelta: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter the number of gratitude or appreciation entries logged per week.',
  'Rate your average mood (1-10) over the same period.',
  'Rate perceived stress (1-10) for context.',
  'Rate reflection depth (1 = quick list, 5 = rich detail/emotion).',
  'Review the gratitude–mood correlation score, insights, and next actions.',
];

const faqs = [
  {
    question: 'What does the Gratitude & Mood Correlation Tracker measure?',
    answer:
      'It estimates how strongly your gratitude journaling habits align with mood improvements by combining frequency, reflection depth, mood ratings, and stress levels.',
  },
  {
    question: 'Is the correlation scientifically validated?',
    answer:
      'The formula draws from positive psychology research showing gratitude practices can boost mood and resilience. It is an approximation, not a clinical diagnostic metric.',
  },
  {
    question: 'How often should I log gratitude entries?',
    answer:
      'Most studies show three entries per week is the minimum helpful dose, while daily reflections can double the positive impact—especially when detailed.',
  },
  {
    question: 'Why include stress level?',
    answer:
      'Stress moderates mood outcomes. High stress may blunt the benefits of gratitude, signaling the need for additional coping strategies.',
  },
  {
    question: 'What counts as reflection depth?',
    answer:
      'Depth includes emotional detail, why the experience mattered, sensory memories, and how it connects to your values. Deeper reflection strengthens the positive effect.',
  },
  {
    question: 'Can I use this for teams or families?',
    answer:
      'Yes. Shared gratitude rituals (standups, dinner prompts) can be tracked to see how they influence collective mood or culture scores.',
  },
  {
    question: 'What if my correlation score is low?',
    answer:
      'Increase reflection depth, vary prompts, combine gratitude with savoring exercises, and address stressors that overshadow positive moments.',
  },
  {
    question: 'Should I log digitally or on paper?',
    answer:
      'Any format works. Some prefer analog journals for mindfulness, others use apps for reminders. The key is consistency and emotional richness.',
  },
  {
    question: 'How long before I notice benefits?',
    answer:
      'Many people feel shifts within 2-4 weeks of consistent gratitude journaling. Use this tracker weekly to observe trends sooner.',
  },
  {
    question: 'Can I integrate with mood tracking apps?',
    answer:
      'Yes. Export mood averages from your app, plug them here, and maintain gratitude logs in parallel for a richer dataset.',
  },
];

const relatedCalculators = [
  {
    name: 'Emotional Burnout Recovery Calculator',
    slug: 'emotional-burnout-recovery-calculator',
    description: 'Ensure gratitude rituals support burnout recovery.',
  },
  {
    name: 'Phone Dependency Index',
    slug: 'phone-dependency-index',
    description: 'Reduce phone overuse to reclaim time for reflection.',
  },
  {
    name: 'Meditation Streak Mindfulness Progress Tracker',
    slug: 'meditation-streak-mindfulness-progress-tracker',
    description: 'Pair gratitude journaling with mindfulness streak tracking.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/gratitude-mood-correlation-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Gratitude & Mood Correlation Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Gratitude & Mood Correlation Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Track how gratitude journaling frequency and depth influence mood under different stress levels.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { gratitudeEntries, averageMood, stressLevel, reflectionDepth } = values;

  const frequencyFactor = clamp(gratitudeEntries / 21, 0, 2); // 3/day max effect
  const depthFactor = reflectionDepth / 5;
  const stressModifier = clamp(1 - (stressLevel - 1) / 15, 0.4, 1);

  const correlationScore = clamp(((frequencyFactor * 0.5 + depthFactor * 0.5) * stressModifier) * 100, 0, 100);
  const moodDelta = Number(((averageMood - (stressLevel / 2 + 3)).toFixed(1)));

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your gratitude practice may feel meaningfully linked to mood shifts. You may find that small, regular reflections gently support how you feel day to day.';

  if (correlationScore <= 35) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your current gratitude habits may not yet feel strongly connected to mood changes. You might experiment with a bit more depth, adjusting prompts, or gently tending to stressors alongside your practice. This is a personal insight, not a medical evaluation.';
  } else if (correlationScore <= 60) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where some benefits may be present, but inconsistency or higher stress may be softening the impact. You may consider experimenting with more regular rituals and slightly fewer distractions around your practice.';
  } else if (correlationScore <= 80) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where your gratitude reflections may feel meaningfully connected to shifts in mood. You might enjoy maintaining this momentum and, if it feels right, sharing moments of appreciation with others.';
  }

  const recommendations: string[] = [
    'Use multi-sensory prompts (sights, sounds, textures) to deepen each gratitude reflection.',
    'Pair gratitude with savoring: pause 60 seconds to relive the positive experience as you write.',
    'Close entries with “because” statements to anchor meaning and values alignment.',
  ];

  if (gratitudeEntries < 7) {
    recommendations.push('Aim for at least one gratitude entry per day or batch three detailed entries every other day.');
  }

  if (reflectionDepth <= 2) {
    recommendations.push('Expand entries to 3-4 sentences describing what happened, why it matters, and how it made you feel.');
  }

  if (stressLevel >= 7) {
    recommendations.push('Pair gratitude with stress reduction (breathing, walking, therapy) so stress does not overshadow mood gains.');
  }

  const plan = [
    { label: 'This Week', detail: 'Set daily reminders or anchor gratitude to an existing routine (morning coffee, evening shutdown). Log at least 3 entries with full detail.' },
    { label: 'This Month', detail: 'Review your journal to spot themes, share highlights with someone you trust, and test new prompts to avoid repetition fatigue.' },
    { label: 'Ongoing', detail: 'Track gratitude frequency alongside mood scores. If correlation dips for two weeks, refresh rituals or address stressors first.' },
  ];

  return {
    gratitudeEntries,
    averageMood,
    stressLevel,
    reflectionDepth,
    correlationScore: Number(correlationScore.toFixed(1)),
    moodDelta,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function GratitudeMoodCorrelationTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      gratitudeEntries: undefined,
      averageMood: undefined,
      stressLevel: undefined,
      reflectionDepth: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="gratitude-mood-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Gratitude & Mood Correlation Tracker
          </CardTitle>
          <CardDescription>Track how gratitude journaling frequency and depth relate to mood and stress.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your gratitude data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gratitudeEntries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entries per week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageMood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average mood (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 7.3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stress level (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reflectionDepth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reflection depth (1-5)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate gratitude–mood correlation
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
            <CardDescription>See correlation strength, mood delta, and playbook.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Correlation score</p>
                <p className="text-2xl font-semibold text-primary">{result.correlationScore}</p>
                <p className="text-xs text-muted-foreground">0-100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Mood delta</p>
                <p className="text-2xl font-semibold text-primary">{result.moodDelta}</p>
                <p className="text-xs text-muted-foreground">Vs. stress baseline</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Entries/week</p>
                <p className="text-2xl font-semibold text-primary">{result.gratitudeEntries}</p>
                <p className="text-xs text-muted-foreground">Consistency indicator</p>
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
            <strong>Correlation score</strong> = (Frequency factor × 0.5) + (Reflection depth × 0.5), then multiplied by the stress modifier and by 100 to express it as a percentage. Frequency factor is entries ÷ 21, depth is ÷ 5, and the stress modifier protects against high cortisol dampening.
          </p>
          <p>
            <strong>Mood delta</strong> ≈ Actual mood − Expected mood from stress baseline (stress ÷ 2 + 3). Positive deltas indicate resilience; negative deltas highlight stress dominance.
          </p>
          <p>
            <strong>Status</strong> thresholds: 0-35 low, 36-60 moderate, 61-80 good, 81+ optimal correlation.
          </p>
          <p>Use these formulas to A/B test new gratitude rituals and see which combinations move the needle fastest.</p>
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
                <p className="text-sm text-muted-foreground">Daily average</p>
                <p className="text-xl font-semibold text-primary">{(result.gratitudeEntries / 7).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Gratitude entries/day</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Reflection quality</p>
                <p className="text-xl font-semibold text-primary">{((result.reflectionDepth / 5) * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Of maximum depth</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Stress dampening</p>
                <p className="text-xl font-semibold text-primary">{(clamp(1 - (result.stressLevel - 1) / 15, 0.4, 1) * 100).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Mood benefit retained</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your gratitude metrics to see additional calculations.</p>
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
                <Link href={`/category/health-fitness/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/MedicalWebPage">
        <meta itemProp="name" content="Gratitude & Mood Mastery: Evidence-Based Rituals for Emotional Resilience" />
        <meta itemProp="description" content="Learn how gratitude journaling, savoring, and reflection depth translate into mood improvements even during stressful seasons." />
        <meta itemProp="keywords" content="gratitude tracker, mood correlation, positive psychology, journaling prompts, stress resilience" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-gratitude-mood-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Linking Gratitude with Mood</h1>
        <p className="text-lg italic text-gray-700">Discover why gratitude practices work, how to avoid ritual fatigue, and how to harness neuroscience-backed techniques for emotional resilience.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#science" className="hover:underline">Neuroscience of Gratitude</a></li>
          <li><a href="#prompts" className="hover:underline">Prompt Design and Reflection Depth</a></li>
          <li><a href="#stress" className="hover:underline">Managing Stress That Blocks Gratitude</a></li>
          <li><a href="#habits" className="hover:underline">Habit Stacking and Anchors</a></li>
          <li><a href="#analysis" className="hover:underline">Analyzing Your Data for Insights</a></li>
        </ul>
        <hr />

        <h2 id="science" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Science</h2>
        <p>Gratitude activates dopamine and serotonin pathways, calms the amygdala, and strengthens the prefrontal cortex. Over time, it rewires attention to notice positive cues, balancing negativity bias.</p>

        <h2 id="prompts" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Prompts and Depth</h2>
        <p>Best prompts include sensory detail, people-focused appreciation, and “because” statements. Shallow lists offer short bursts; depth sustains benefits.</p>

        <h2 id="stress" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Stress Management</h2>
        <p>When stress is high, gratitude must be paired with nervous system regulation. Practices like breathing, walking, or therapy clear space for gratitude to land.</p>

        <h2 id="habits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Habit Stacking</h2>
        <p>Link gratitude to routines (morning beverage, commute, bedtime). Micro-habits reduce friction and guard against skipped days.</p>

        <h2 id="analysis" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Data Analysis</h2>
        <p>Review weekly logs for themes, compare mood before/after gratitude streaks, and iterate prompts when correlation dips. Share favorite entries with community for social reinforcement.</p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Gratitude is a low-cost, high-impact intervention when it’s consistent, detailed, and paired with stress care. Use this tracker to keep rituals intentional and data-informed.</p>
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
            This tracker provides general wellness insights about how gratitude frequency and depth may relate to mood
            under different stress loads. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>Outputs include correlation score, mood delta, status, recommendations, action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs make the methodology transparent for humans and AI assistants alike.</p>
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

