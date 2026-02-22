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
  baselineSelfEsteem: z.number({ invalid_type_error: 'Enter baseline' }).min(0).max(10),
  currentSelfEsteem: z.number({ invalid_type_error: 'Enter current' }).min(0).max(10),
  weeklyWinsLogged: z.number({ invalid_type_error: 'Enter wins' }).min(0).max(100),
  selfCompassionPracticeDays: z.number({ invalid_type_error: 'Enter days' }).min(0).max(60),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  baselineSelfEsteem: number;
  currentSelfEsteem: number;
  weeklyWinsLogged: number;
  selfCompassionPracticeDays: number;
  growthPercent: number;
  practiceSupportScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Estimate your baseline self-esteem rating (0â€“10) from an earlier period such as last year or before starting growth work.',
  'Rate your current self-esteem (0â€“10) based on how you speak to yourself and handle setbacks.',
  'Count how many â€œwinsâ€ or small achievements you logged in the last 4 weeks.',
  'Enter how many days in the last 60 you intentionally practiced self-compassion or affirming self-talk.',
  'Review self-esteem growth percent, practice support score, and suggested next steps.',
];

const faqs = [
  {
    question: 'What does the Self-Esteem Growth Tracker measure?',
    answer:
      'It estimates how much your self-esteem has shifted over time and how strongly your habits (tracking wins and self-compassion practice) are supporting that growth.',
  },
  {
    question: 'Is this a replacement for clinical scales?',
    answer:
      'No. It is an educational self-reflection tool, not a standardized clinical questionnaire. For diagnostic assessment, use validated scales with a professional.',
  },
  {
    question: 'How do I estimate baseline self-esteem?',
    answer:
      'Think back to a previous period and rate typical self-talk, confidence in your abilities, and how you reacted to mistakes. A rough estimate is sufficient.',
  },
  {
    question: 'What counts as a â€œwinâ€?',
    answer:
      'Any action you genuinely feel proud of or grateful for: completing work, setting a boundary, caring for your body, asking for help, or trying something new.',
  },
  {
    question: 'What are self-compassion practices?',
    answer:
      'They include kind self-talk, compassionate journaling, guided meditations, therapy work, or simply speaking to yourself as you would to a friend.',
  },
  {
    question: 'Can self-esteem go down even if I practice a lot?',
    answer:
      'Yes. Stress, trauma, or major life changes can temporarily lower self-esteem. Practices still help, but healing can take time and support.',
  },
  {
    question: 'How often should I use this tracker?',
    answer:
      'Monthly or quarterly. Comparing snapshots can clarify which practices genuinely move the needle for you.',
  },
  {
    question: 'Can I track multiple domains (work, relationships)?',
    answer:
      'Yes. You can run separate entries for different domains, but this calculator uses an overall, global self-esteem rating.',
  },
  {
    question: 'What if my growth percent is negative?',
    answer:
      'That suggests self-esteem has decreased relative to your baseline. This can be a prompt to increase support, adjust goals, or seek professional guidance.',
  },
  {
    question: 'Is high self-esteem always good?',
    answer:
      'Healthy self-esteem is grounded and flexible. Extremely inflated self-evaluations without realism can create different problems. Aim for balanced, compassionate self-regard.',
  },
];

const relatedCalculators = [
  {
    name: 'Positive Emotion Ratio Calculator',
    slug: 'positive-emotion-ratio-calculator',
    description: 'See how emotional balance supports confidence.',
  },
  {
    name: 'Gratitude & Mood Correlation Tracker',
    slug: 'gratitude-mood-correlation-tracker',
    description: 'Use gratitude logs to reinforce self-worth.',
  },
  {
    name: 'Resilience Score Calculator',
    slug: 'resilience-score-calculator',
    description: 'Assess resilience alongside self-esteem growth.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/self-esteem-growth-tracker';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Self-Esteem Growth Tracker', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Self-Esteem Growth Tracker',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Track self-esteem growth using baseline vs current ratings, logged wins, and self-compassion practice.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { baselineSelfEsteem, currentSelfEsteem, weeklyWinsLogged, selfCompassionPracticeDays } = values;

  const delta = currentSelfEsteem - baselineSelfEsteem;
  const growthPercent = clamp(((delta) / Math.max(baselineSelfEsteem || 1, 1)) * 100, -100, 300);

  const winFactor = clamp(weeklyWinsLogged / 20, 0, 2); // up to ~20 logged wins
  const compassionFactor = clamp(selfCompassionPracticeDays / 30, 0, 2); // up to most days in last 60
  const practiceSupportScore = clamp(((winFactor + compassionFactor) / 2) * 100, 0, 100);

  let status: ResultPayload['status'] = 'good';
  let interpretation =
    'This suggests a general lifestyle tendency where you may feel like your self-esteem is gradually strengthening over time, supported by your reflective habits.';

  if (growthPercent < -10) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your current self-view may feel lower than your usual baseline. Stress, comparison, or harsh inner talk might be influencing how you feel about yourself. You may consider small, kind practices toward yourself and seeking supportive connections if that feels right. This is a personal insight, not a medical evaluation.';
  } else if (growthPercent <= 10) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where your sense of self-esteem may feel relatively steady. Adding gentle self-compassion and noticing small wins could support gradual growth over time.';
  } else if (growthPercent > 40) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where you may feel meaningful improvement in how you see yourself. Continuing sustainable practices that feel kind and realistic for you may help reinforce this pattern.';
  }

  const recommendations: string[] = [
    'Log at least one genuine win or valued action per day, no matter how small.',
    'Practice speaking to yourself as you would to a close friend when you make mistakes.',
    'Notice and gently challenge global, negative labels (â€œI always failâ€) with more precise language.',
  ];

  if (weeklyWinsLogged < 7) {
    recommendations.push('Increase awareness of small wins by adding a brief evening reflection (3 bullet points) to your routine.');
  }

  if (selfCompassionPracticeDays < 10) {
    recommendations.push('Experiment with short self-compassion practices (guided audio, journaling prompts) 2â€“3 times per week.');
  }

  if (growthPercent < 0) {
    recommendations.push('Because self-esteem appears to have decreased, consider discussing these patterns with a therapist or trusted support person.');
  }

  const plan = [
    { label: 'This Week', detail: 'Start or continue a â€œwinsâ€ log, noting at least one small, specific win per day.' },
    { label: 'This Month', detail: 'Schedule several self-compassion sessions and track how they influence your self-talk in challenging moments.' },
    { label: 'Ongoing', detail: 'Recalculate growth quarterly and adjust practices as needed, aiming for steady, realistic improvements instead of perfection.' },
  ];

  return {
    baselineSelfEsteem,
    currentSelfEsteem,
    weeklyWinsLogged,
    selfCompassionPracticeDays,
    growthPercent: Number(growthPercent.toFixed(1)),
    practiceSupportScore: Number(practiceSupportScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function SelfEsteemGrowthTracker() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      baselineSelfEsteem: undefined,
      currentSelfEsteem: undefined,
      weeklyWinsLogged: undefined,
      selfCompassionPracticeDays: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="self-esteem-growth-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Self-Esteem Growth Tracker
          </CardTitle>
          <CardDescription>Track changes in self-esteem and the strength of your self-support habits.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your self-esteem data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baselineSelfEsteem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseline self-esteem (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 4.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentSelfEsteem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current self-esteem (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weeklyWinsLogged"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wins logged (last 4 weeks)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="selfCompassionPracticeDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Self-compassion practice days (last 60)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Track self-esteem growth
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
            <CardDescription>See growth percent, practice support score, and guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Growth percent</p>
                <p className="text-2xl font-semibold text-primary">{result.growthPercent}%</p>
                <p className="text-xs text-muted-foreground">Change vs baseline</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Practice support score</p>
                <p className="text-2xl font-semibold text-primary">{result.practiceSupportScore}%</p>
                <p className="text-xs text-muted-foreground">Strength of habits</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Logged wins</p>
                <p className="text-2xl font-semibold text-primary">{result.weeklyWinsLogged}</p>
                <p className="text-xs text-muted-foreground">Last 4 weeks</p>
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
            <strong>Growth percent</strong> compares current self-esteem with baseline as a relative percentage change, capped to avoid extreme outliers.
          </p>
          <p>
            <strong>Practice support score</strong> combines logged wins and self-compassion practice into a 0â€“100 indicator of how supportive your habits are for self-esteem growth.
          </p>
          <p>
            These formulas are intentionally simple and directionalâ€”they are best used to inform reflection and planning rather than as rigid grades.
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
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Absolute change</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.currentSelfEsteem - result.baselineSelfEsteem).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Current âˆ’ baseline</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average practice/week</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.selfCompassionPracticeDays / 8.57).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Approx. days per week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wins/week</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.weeklyWinsLogged / 4).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">If evenly spread</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your self-esteem data to see additional metrics.</p>
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
                <Link href={`/${calc.slug}`} className="text-primary hover:underline">
                  {calc.name}
                </Link>
              </h4>
              <p className="text-sm text-muted-foreground">{calc.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/MedicalWebPage">
        <meta itemProp="name" content="Self-Esteem Growth: Building a Kinder Inner Voice Over Time" />
        <meta itemProp="description" content="Track how your self-esteem changes and learn practical strategies for nurturing a more supportive inner voice." />
        <meta itemProp="keywords" content="self-esteem growth, self-compassion, confidence building, inner critic, wins journal" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-self-esteem-growth-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Self-Esteem Growth: From Harsh Self-Talk to Compassionate Confidence
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore how tracking wins, practicing self-compassion, and updating your self-story can gradually shift your relationship with yourself.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#understanding" className="hover:underline">Understanding Self-Esteem vs. Self-Worth</a></li>
          <li><a href="#inner-critic" className="hover:underline">The Inner Critic and Its Origins</a></li>
          <li><a href="#practices" className="hover:underline">Daily Practices That Nurture Growth</a></li>
          <li><a href="#tracking" className="hover:underline">Why Tracking Wins Matters</a></li>
          <li><a href="#when-to-seek-support" className="hover:underline">When to Seek Additional Support</a></li>
        </ul>
        <hr />

        <h2 id="understanding" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Understanding Self-Esteem vs. Self-Worth
        </h2>
        <p>
          Self-esteem is how competent and capable you feel; self-worth is the deeper sense that you deserve care and respect even when you struggle. Healthy growth tends to strengthen both.
        </p>

        <h2 id="inner-critic" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          The Inner Critic and Its Origins
        </h2>
        <p>
          Many harsh inner voices began as attempts to keep us safe or accepted. Understanding these origins can make change feel less like a battle and more like renegotiating old roles.
        </p>

        <h2 id="practices" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Daily Practices That Nurture Growth
        </h2>
        <p>
          Helpful practices include self-compassion meditations, therapy, realistic goal-setting, values-based actions, and surrounding yourself with people who reflect your strengths back to you.
        </p>

        <h2 id="tracking" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Why Tracking Wins Matters
        </h2>
        <p>
          Our brains naturally focus on threats and mistakes. Writing down even small wins retrains attention to notice competence and progress, building a more balanced self-view over time.
        </p>

        <h2 id="when-to-seek-support" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          When to Seek Additional Support
        </h2>
        <p>
          If self-loathing, shame, or hopelessness remain intense despite ongoing effort, working with a therapist or counselor can provide tailored strategies and a safe space to process past experiences.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Self-esteem rarely changes overnight, but small, repeated acts of self-respect accumulate. Use this tracker as a gentle mirror, not a judge, while you practice relating to yourself with more kindness.
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
            This tool provides general wellness insights about self-esteem growth using simple ratings and habit metrics.
            This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>It outputs growth percent, practice support score, qualitative status, recommendations, an action plan, and supporting calculations.</p>
          <p>Formula, steps, guide content, related tools, and FAQs make the methodology easy to understand for both humans and AI assistants.</p>
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


