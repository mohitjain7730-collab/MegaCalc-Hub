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
  noveltySeeking: z.number({ invalid_type_error: 'Enter novelty seeking score' }).min(0).max(10),
  rewardResponsiveness: z.number({ invalid_type_error: 'Enter reward responsiveness score' }).min(0).max(10),
  impulsivity: z.number({ invalid_type_error: 'Enter impulsivity score' }).min(0).max(10),
  baselineMotivation: z.number({ invalid_type_error: 'Enter baseline motivation score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  noveltySeeking: number;
  rewardResponsiveness: number;
  impulsivity: number;
  baselineMotivation: number;
  sensitivityScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your tendency to seek new, exciting experiences on a 0â€“10 scale.',
  'Rate how strongly you respond to rewards (praise, money, points, progress bars) on a 0â€“10 scale.',
  'Rate your tendency to act impulsively or chase quick rewards on a 0â€“10 scale.',
  'Rate your baseline motivation to pursue longâ€‘term goals, even without immediate rewards, on a 0â€“10 scale.',
  'Review your dopamine reward sensitivity index, profile, and recommendations.',
];

const faqs = [
  {
    question: 'What is the Dopamine Reward Sensitivity Index?',
    answer:
      'The Dopamine Reward Sensitivity Index is an educational tool that summarizes how strongly you respond to rewards, novelty, and impulses. It is not a diagnostic test but can help you reflect on patterns that influence motivation and habits.',
  },
  {
    question: 'Is this calculator measuring my actual brain dopamine levels?',
    answer:
      'No. This tool does not measure neurotransmitter levels and cannot diagnose any condition. It uses selfâ€‘report questions about behavior and preferences to approximate how rewardâ€‘sensitive your daily decisionâ€‘making might be.',
  },
  {
    question: 'Why does novelty seeking matter for dopamine?',
    answer:
      'Novelty seeking is partly driven by how your brain responds to new, uncertain, or exciting stimuli. People who are highly noveltyâ€‘seeking often feel a stronger dopamine response to new experiences, which can be channelled into exploration or, in some cases, riskâ€‘taking.',
  },
  {
    question: 'How does impulsivity affect reward sensitivity?',
    answer:
      'High impulsivity often means a strong pull toward immediate rewards, even when they conflict with longâ€‘term goals. Understanding this tendency helps you design environments and routines that reduce temptations and make desired behaviors easier.',
  },
  {
    question: 'Can I change my dopamine reward sensitivity?',
    answer:
      'While some traits are influenced by biology, your habits, environment, and coping strategies have a large impact on how reward systems show up in daily life. You can train your brain to value delayed rewards by practicing consistency, breaking goals into small steps, and celebrating progress.',
  },
  {
    question: 'Is a high sensitivity score good or bad?',
    answer:
      'Neither. High sensitivity can mean strong motivation, enthusiasm, and responsiveness to positive feedbackâ€”but also vulnerability to distraction, overâ€‘stimulation, or addictive patterns. Lower sensitivity can mean steadiness and patience but sometimes less drive. Context matters more than the score alone.',
  },
  {
    question: 'Should I change my medication or treatment based on this score?',
    answer:
      'No. This tool is not a medical or psychiatric assessment and should never be used to adjust medications or treatment plans. Always discuss treatment decisions with your healthcare provider.',
  },
  {
    question: 'When should I seek professional help?',
    answer:
      'Consider seeking support if rewardâ€‘seeking or impulsive behaviors are causing significant problems in work, school, relationships, or healthâ€”for example, compulsive gambling, risky substance use, or persistent difficulty following through on responsibilities.',
  },
];

const relatedCalculators = [
  {
    name: 'Brain Fog Severity Score Calculator',
    slug: 'brain-fog-severity-score-calculator',
    description: 'Gauge mental clarity, memory, and focus to spot potential issues.',
  },
  {
    name: 'Cognitive Load Balance Calculator',
    slug: 'cognitive-load-balance-calculator',
    description: 'Check whether your workload exceeds cognitive capacity.',
  },
  {
    name: 'Daily Mental Energy Budget Calculator',
    slug: 'daily-mental-energy-budget-calculator',
    description: 'Estimate how much deep-focus energy you have available today.',
  },
  {
    name: 'Work Stress Fatigue Index',
    slug: 'work-stress-fatigue-index',
    description: 'Understand how workload and stress are influencing fatigue.',
  },
];

const baseUrl =
  'https://mycalculating.com/health-fitness/dopamine-reward-sensitivity-index-calculator';

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
          item: 'https://mycalculating.com/health-fitness',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Dopamine Reward Sensitivity Wellness Index',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Dopamine Reward Sensitivity Wellness Index Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Estimate your dopamine reward sensitivity profile from novelty seeking, reward responsiveness, impulsivity, and baseline motivation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { noveltySeeking, rewardResponsiveness, impulsivity, baselineMotivation } = values;

  // Novelty, reward, and impulsivity increase sensitivity; baseline motivation tempers it
  const raw =
    0.3 * noveltySeeking +
    0.3 * rewardResponsiveness +
    0.25 * impulsivity +
    0.15 * baselineMotivation;

  const sensitivityScore = clamp((raw / 10) * 100, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your reward sensitivity may appear balanced. You may likely respond to positive feedback and novelty while still being able to pursue longâ€‘term goals.';

  if (sensitivityScore >= 75) {
    // Map "high" into our allowed types as "moderate" for labeling but keep language descriptive
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where your profile may suggest high reward sensitivity. This may bring strong motivation and enthusiasm, but it may also increase susceptibility to distraction or chasing quick rewards.';
  } else if (sensitivityScore <= 35) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your selfâ€‘ratings may suggest relatively lower reward sensitivity. You may be steady and less impulsive but might need stronger cues or structures to feel motivated.';
  } else if (sensitivityScore <= 55) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where your reward sensitivity may be in a moderate range. You may likely experience some pull toward rewards and novelty while still maintaining control over longâ€‘term priorities.';
  }

  const recommendations: string[] = [
    'Notice which kinds of rewards (social, financial, progress markers) most strongly influence your behavior and use them intentionally for important goals.',
    'Break longâ€‘term projects into small, visible milestones so your brain receives more frequent feedback and â€œwins.â€',
    'Reduce exposure to highâ€‘dopamine distractions (endless feeds, notifications) during focused work blocks.',
  ];

  if (sensitivityScore >= 70) {
    recommendations.push(
      'Create â€œfrictionâ€ for impulsive behaviors by adding small delays or extra steps before engagingâ€”for example, keeping tempting apps off your home screen or using website blockers during key hours.'
    );
  }

  if (sensitivityScore <= 40) {
    recommendations.push(
      'Experiment with structured routines, accountability partners, or environmental cues (visual trackers, reminders) to help initiate tasks when motivation feels low.'
    );
  }

  const plan = [
    {
      label: 'This Week',
      detail:
        'Identify one important habit (study, exercise, deep work) and add a simple reward at the end, such as a short break or enjoyable activity.',
    },
    {
      label: 'This Month',
      detail:
        'Track patterns where you feel pulled toward quick rewards that conflict with your goals. Adjust your environment to make desired behaviors easier and undesired ones harder.',
    },
    {
      label: 'Ongoing',
      detail:
        'Use your understanding of reward sensitivity to design sustainable systemsâ€”clear goals, visible progress, supportive social contextâ€”that work with your brain, not against it.',
    },
  ];

  return {
    noveltySeeking,
    rewardResponsiveness,
    impulsivity,
    baselineMotivation,
    sensitivityScore,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function DopamineRewardSensitivityIndexCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      noveltySeeking: undefined,
      rewardResponsiveness: undefined,
      impulsivity: undefined,
      baselineMotivation: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="dopamine-reward-sensitivity-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Dopamine Reward Sensitivity Wellness Index
          </CardTitle>
          <CardDescription>
            Get general wellness insights about how strongly you may respond to rewards, novelty, and impulses to better understand your motivation
            style. This is a personal lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate your reward and motivation traits</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="noveltySeeking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Novelty seeking (0â€“10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 7"
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
                  name="rewardResponsiveness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reward responsiveness (0â€“10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 8"
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
                  name="impulsivity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impulsivity (0â€“10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 6"
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
                  name="baselineMotivation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Baseline longâ€‘term motivation (0â€“10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 5"
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
                Calculate reward sensitivity index
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
            <CardDescription>See your index score, status, and personalized interpretation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Sensitivity score</p>
                <p className="text-2xl font-semibold text-primary">{result.sensitivityScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Novelty &amp; reward</p>
                <p className="text-2xl font-semibold text-primary">
                  {((result.noveltySeeking + result.rewardResponsiveness) / 2).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Average 0â€“10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Impulsivity</p>
                <p className="text-2xl font-semibold text-primary">{result.impulsivity.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">0â€“10 scale</p>
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
            <Activity className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Sensitivity score</strong> combines novelty seeking, reward responsiveness, impulsivity, and baseline
            motivation into a single 0â€“100 index. Higher scores reflect stronger responsiveness to rewards and novelty,
            particularly when impulsivity is also high.
          </p>
          <p>
            The index is a simplified, educational measureâ€”it does not represent clinical diagnosis or brain chemistry but
            summarizes selfâ€‘reported tendencies that influence motivation and habit formation.
          </p>
          <p>
            Use the score together with qualitative insights and professional guidance rather than as a standâ€‘alone measure
            of mental health or treatment needs.
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
                <Link
                  href={`/${calc.slug}`}
                  className="text-primary hover:underline"
                >
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
          <CardTitle>Additional calculations</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Approach vs. control</p>
                <p className="text-xl font-semibold text-primary">
                  {(
                    ((result.noveltySeeking + result.rewardResponsiveness + result.impulsivity) / 3 -
                      result.baselineMotivation) /
                    10
                  ).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Higher = more approachâ€‘driven</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Selfâ€‘control buffer</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.baselineMotivation - result.impulsivity).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Positive = stronger longâ€‘term focus</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Profile</p>
                <p className="text-xl font-semibold text-primary">
                  {result.sensitivityScore >= 70
                    ? 'Highly sensitive'
                    : result.sensitivityScore >= 40
                    ? 'Moderately sensitive'
                    : 'Lower sensitivity'}
                </p>
                <p className="text-xs text-muted-foreground">Based on index</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter your selfâ€‘ratings to see derived metrics that describe your reward style.
            </p>
          )}
        </CardContent>
      </Card>

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Dopamine Reward Sensitivity: Understanding Motivation, Habits, and Rewardâ€‘Driven Behavior"
        />
        <meta
          itemProp="description"
          content="An educational guide explaining how dopamineâ€‘related reward sensitivity, novelty seeking, and impulsivity influence motivation, focus, and habitsâ€”with practical strategies to work with your brain, not against it."
        />
        <meta
          itemProp="keywords"
          content="dopamine reward sensitivity, motivation profile, novelty seeking, impulsivity, habit formation, reward system"
        />
        <meta itemProp="author" content="[Your Site's Brain & Behavior Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/dopamine-reward-sensitivity-guide" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Dopamine Reward Sensitivity: How Your Brainâ€™s Reward System Shapes Motivation and Habits
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore how sensitivity to rewards, novelty, and impulses can drive both productive focus and unhelpful
          distractionâ€”and how to design environments and routines that suit your unique profile.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
          Table of Contents: Jump to a Section
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#reward-system" className="hover:underline">
              The Brainâ€™s Reward System in Everyday Life
            </a>
          </li>
          <li>
            <a href="#sensitivity-spectrum" className="hover:underline">
              Reward Sensitivity as a Spectrum, Not a Diagnosis
            </a>
          </li>
          <li>
            <a href="#traits" className="hover:underline">
              Novelty Seeking, Impulsivity, and Motivation
            </a>
          </li>
          <li>
            <a href="#strategy" className="hover:underline">
              Strategies to Work With (Not Against) Your Reward Style
            </a>
          </li>
          <li>
            <a href="#limitations" className="hover:underline">
              Limitations and When to Seek Professional Help
            </a>
          </li>
        </ul>

        <hr />

        <h2
          id="reward-system"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          The Brainâ€™s Reward System in Everyday Life
        </h2>
        <p>
          Dopamine is one of several neurotransmitters involved in how the brain predicts rewards, learns from outcomes,
          and chooses actions. It is not simply a â€œpleasure chemicalâ€â€”instead, it helps signal that something is important,
          surprising, or better than expected, which strengthens learning around that event.
        </p>
        <p>
          In daily life, this means that notifications, progress bars, praise, and novelty can all trigger reward signals.
          Over time, your brain starts to anticipate these outcomes and biases your attention and effort toward situations
          where similar rewards are likely to happen again.
        </p>

        <h2
          id="sensitivity-spectrum"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Reward Sensitivity as a Spectrum, Not a Diagnosis
        </h2>
        <p>
          People differ naturally in how strongly they respond to rewards and cues. Some feel highly energized by points,
          scores, and external recognition. Others care more about internal satisfaction or longâ€‘term outcomes than
          immediate feedback.
        </p>
        <p>
          This spectrum is influenced by genetics, development, environment, and learning history. High sensitivity is not
          inherently â€œgoodâ€ or â€œbadâ€â€”its effects depend on context, coping skills, and whether your environment contains
          mostly healthy or unhealthy rewards.
        </p>

        <h2
          id="traits"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Novelty Seeking, Impulsivity, and Motivation
        </h2>
        <p>
          Novelty seeking reflects how drawn you are to new experiences, uncertain outcomes, and stimulation. Impulsivity
          reflects how quickly you act on urges without considering longâ€‘term consequences. Together with baseline
          motivation, these traits shape your reward sensitivity profile.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>High novelty seeking can fuel exploration, creativity, and entrepreneurship.</li>
          <li>High impulsivity can increase riskâ€‘taking, procrastination, or difficulties with selfâ€‘control.</li>
          <li>Strong baseline motivation helps you stick with goals even when immediate rewards are weak.</li>
        </ul>

        <h2
          id="strategy"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Strategies to Work With (Not Against) Your Reward Style
        </h2>
        <p>
          Rather than trying to change your wiring overnight, it is usually more effective to design your routines and
          environments to align with your profile. For example, highly rewardâ€‘sensitive people benefit from clear,
          frequent feedback and visible progress, while those with lower sensitivity may benefit from stronger structure
          and accountability.
        </p>
        <ul className="list-disc ml-6 space-y-1">
          <li>Use checklists, streak trackers, or progress bars to make success visible.</li>
          <li>Batch or limit exposure to highâ€‘dopamine distractions during times that require focus.</li>
          <li>Pair boring but important tasks with modest, healthy rewards (breaks, music, or social time).</li>
        </ul>

        <h2
          id="limitations"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Limitations and When to Seek Professional Help
        </h2>
        <p>
          This calculator is an educational reflection tool only. It cannot diagnose ADHD, addiction, mood disorders, or
          any other medical or psychiatric condition. If you are concerned about your mood, behavior, or ability to
          function dayâ€‘toâ€‘day, speak with a qualified healthcare professional.
        </p>
        <p>
          When used appropriately, understanding your reward style can complementâ€”not replaceâ€”evidenceâ€‘based assessment
          and treatment by helping you build more supportive habits and environments.
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
            This tool provides general wellness insights about dopamine reward sensitivity index from four selfâ€‘rated traits and summarizes your
            motivation and rewardâ€‘response profile on a 0â€“100 scale. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>
            It provides qualitative interpretation, recommendations, an action plan, supporting calculations, and a
            detailed guide so humans or AI assistants can explain the results clearly.
          </p>
          <p>
            The calculator is educational only and is not intended for diagnosis, medication decisions, or emergency use.
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
          <p>Disclaimer: This tool provides general wellness and lifestyle insights for educational purposes only. It is not a medical or psychological diagnosis. For any health concerns, please consult a qualified professional.</p>
        </CardContent>
      </Card>
    </div>
  );
}


