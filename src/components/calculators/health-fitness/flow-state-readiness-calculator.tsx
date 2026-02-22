'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, AlertTriangle, Shield, Gauge } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  skillLevel: z.number({ invalid_type_error: 'Enter skill level' }).min(1).max(10),
  challengeLevel: z.number({ invalid_type_error: 'Enter challenge level' }).min(1).max(10),
  distractionLevel: z.number({ invalid_type_error: 'Enter distraction level' }).min(0).max(10),
  energyLevel: z.number({ invalid_type_error: 'Enter energy level' }).min(0).max(10),
  clearGoalClarity: z.number({ invalid_type_error: 'Enter goal clarity' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  skillLevel: number;
  challengeLevel: number;
  distractionLevel: number;
  energyLevel: number;
  clearGoalClarity: number;
  readinessScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your current skill level for the task you want to work on (1â€“10).',
  'Rate how challenging the task feels relative to your skill (1â€“10).',
  'Rate your current distraction level (0â€“10), including internal and external distractions.',
  'Rate your current physical and mental energy level (0â€“10).',
  'Rate how clear your goals and next steps are for this session (0â€“10), then review your readiness score.',
];

const faqs = [
  {
    question: 'What is a flow state?',
    answer:
      'Flow is a deeply absorbed state where you are fully engaged in a task, lose track of time, and perform near your best. It usually occurs when skill and challenge are well matched, distractions are low, and goals are clear.',
  },
  {
    question: 'Does this calculator guarantee I will enter flow?',
    answer:
      'No. The calculator estimates how favorable your conditions are for entering flow based on research-informed ingredients like challenge-skill balance, focus, energy, and clarity. It cannot guarantee a specific mental state.',
  },
  {
    question: 'Why does challenge-skill balance matter so much?',
    answer:
      'Tasks that are too easy lead to boredom, while tasks that feel overwhelmingly hard lead to anxiety. Flow tends to appear in the middle zone, where the challenge slightly stretches your skills without feeling impossible.',
  },
  {
    question: 'How often can I realistically expect to experience flow?',
    answer:
      'For most people, deep flow is not an all-day state. Even a few sessions per week can be powerful. Shorter â€œdeep focusâ€ periods that share some features of flow are more common and still highly valuable.',
  },
  {
    question: 'Can I train myself to enter flow more often?',
    answer:
      'Yes. Practicing deep work at consistent times, reducing distractions, setting clear goals, and matching challenges to your current skill all make flow more likely over time.',
  },
  {
    question: 'Does multitasking prevent flow?',
    answer:
      'Frequent task-switching and notifications make it much harder to sustain flow. Flow relies on sustained, undivided attention on one meaningful task or activity.',
  },
  {
    question: 'Is flow always good?',
    answer:
      'Flow is powerful but neutralâ€”you can experience it in both healthy and unhealthy activities. The key is to aim for flow in activities that support your long-term goals, learning, and well-being.',
  },
  {
    question: 'Should I worry if I rarely feel â€œin the zoneâ€?',
    answer:
      'Not necessarily. Many people have demanding contexts that make deep focus difficult. Start by improving one or two ingredientsâ€”like reducing distractions or clarifying goalsâ€”and build from there. If you struggle with attention broadly, consider discussing it with a professional.',
  },
];

const relatedCalculators = [
  {
    name: 'Daily Mental Energy Budget Calculator',
    slug: 'daily-mental-energy-budget-calculator',
    description: 'Plan deep work windows based on available cognitive energy.',
  },
  {
    name: 'Cognitive Load Balance Calculator',
    slug: 'cognitive-load-balance-calculator',
    description: 'Check whether your workload and capacity are aligned.',
  },
  {
    name: 'Brain Fog Severity Score Calculator',
    slug: 'brain-fog-severity-score-calculator',
    description: 'Identify clarity blockers that make flow harder to reach.',
  },
  {
    name: 'Digital Burnout Detector',
    slug: 'digital-burnout-detector',
    description: 'Check whether digital overload is undermining deep work potential.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/flow-state-readiness-calculator';

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
          name: 'Flow State Readiness Wellness Calculator',
          item: baseUrl,
        },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Flow State Readiness Wellness Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Estimate how ready you are to enter a flow state based on challenge-skill balance, energy, distractions, and goal clarity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { skillLevel, challengeLevel, distractionLevel, energyLevel, clearGoalClarity } = values;

  const balance = 10 - Math.abs(skillLevel - challengeLevel); // 0â€“10
  const focusComponent = 10 - distractionLevel; // 0â€“10
  const energyComponent = energyLevel; // 0â€“10
  const clarityComponent = clearGoalClarity; // 0â€“10

  const raw =
    0.35 * balance + 0.25 * focusComponent + 0.2 * energyComponent + 0.2 * clarityComponent; // 0â€“10
  const readinessScore = clamp((raw / 10) * 100, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where conditions may look very favorable for focused, high-quality work. You may have a solid challenge-skill match, good energy, and reasonable clarity.';

  if (readinessScore >= 80) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where you may appear highly ready for a flow-friendly deep work session. You may consider protecting this window from interruptions and diving into a single, meaningful task.';
  } else if (readinessScore >= 60) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where you may have many ingredients for flow, with a few areas to tune (often distractions or clarity). Small adjustments may significantly improve your chances.';
  } else if (readinessScore >= 40) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where your readiness may be mixed. You may benefit from adjusting the challenge level, improving clarity, or reducing distractions before expecting deep focus.';
  } else {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where conditions may be currently unfavorable for flow. You may consider addressing basic needs (rest, food), simplifying tasks, or scheduling deep work for another time.';
  }

  const recommendations: string[] = [
    'Choose one clearly defined task for your session and set a specific outcome (for example, draft one section or solve three problems).',
    'Silence or move away from non-essential notifications and distractions during your focus window.',
    'Match the difficulty of the task to your current skill by breaking it into smaller, manageable chunks if it feels overwhelming.',
  ];

  if (distractionLevel >= 5) {
    recommendations.push(
      'Create a physical and digital focus zoneâ€”close unrelated tabs, put your phone away, and let others know you are unavailable for a set period.'
    );
  }

  if (energyLevel <= 4) {
    recommendations.push(
      'Take a short restorative breakâ€”light movement, hydration, or a brief walkâ€”before attempting a deep focus block.'
    );
  }

  if (Math.abs(skillLevel - challengeLevel) >= 3) {
    recommendations.push(
      'Adjust the challenge: if it feels too hard, seek support or simplify; if too easy, increase difficulty to stay engaged.'
    );
  }

  const plan = [
    {
      label: 'This Session',
      detail:
        'Set a 25â€“60 minute focus block with a clear task, limited distractions, and a short review at the end of what you accomplished.',
    },
    {
      label: 'This Week',
      detail:
        'Experiment with 2â€“4 planned deep work blocks at times when your energy is naturally higher, and track which conditions most support flow.',
    },
    {
      label: 'Ongoing',
      detail:
        'Design your schedule so that demanding creative or analytical work happens during your highest readiness windows, with lighter tasks elsewhere.',
    },
  ];

  return {
    skillLevel,
    challengeLevel,
    distractionLevel,
    energyLevel,
    clearGoalClarity,
    readinessScore,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function FlowStateReadinessCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skillLevel: undefined,
      challengeLevel: undefined,
      distractionLevel: undefined,
      energyLevel: undefined,
      clearGoalClarity: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script
        id="flow-state-readiness-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Flow State Readiness Wellness Calculator
          </CardTitle>
          <CardDescription>
            Get general wellness insights about how ready you may be to enter a deep focus flow state for your next work or study session. This is a personal lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate your current conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="skillLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skill level for this task (1â€“10)</FormLabel>
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
                  name="challengeLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Challenge level of this task (1â€“10)</FormLabel>
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
                  name="distractionLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current distraction level (0â€“10)</FormLabel>
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
                <FormField
                  control={form.control}
                  name="energyLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current energy level (0â€“10)</FormLabel>
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
                  name="clearGoalClarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal and next-step clarity (0â€“10)</FormLabel>
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
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate flow readiness
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
            <CardDescription>See your readiness score, status, and suggested adjustments.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Readiness score</p>
                <p className="text-2xl font-semibold text-primary">{result.readinessScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Challengeâ€“skill balance</p>
                <p className="text-2xl font-semibold text-primary">
                  {(10 - Math.abs(result.skillLevel - result.challengeLevel)).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Higher = better match</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Focus potential</p>
                <p className="text-2xl font-semibold text-primary">
                  {(10 - result.distractionLevel).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Higher = fewer distractions</p>
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
            The <strong>flow state readiness score</strong> combines challengeâ€“skill balance, distraction level, energy,
            and goal clarity into a 0â€“100 scale. Higher scores reflect conditions that are more supportive of deep focus
            and potential flow.
          </p>
          <p>
            The score is not a guarantee of flow but a summary of how favorable your current environment and internal
            state are for entering an absorbed, productive mode of work.
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg"
        itemType="https://schema.org/MedicalWebPage"
      >
        <meta
          itemProp="name"
          content="Flow State Readiness: Creating Conditions for Deep Focus and Peak Performance"
        />
        <meta
          itemProp="description"
          content="An applied guide to the science of flow, explaining how challenge-skill balance, energy, distractions, and goal clarity combine to support deep, focused work."
        />
        <meta
          itemProp="keywords"
          content="flow state readiness, deep work conditions, challenge-skill balance, focus, productivity"
        />
        <meta itemProp="author" content="[Your Site's Performance & Focus Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/flow-state-readiness-guide" />

        <h1
          className="text-3xl md:text-4xl font-extrabold text-foreground mb-4"
          itemProp="headline"
        >
          Flow State Readiness: How to Set Up Your Environment for Deep, Satisfying Work
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn the key ingredients that make flow more likelyâ€”challenge-skill balance, focus, energy, and clarityâ€”and how
          to design work sessions that help you get â€œin the zoneâ€ more often.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
          Table of Contents: Jump to a Section
        </h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li>
            <a href="#concept-of-flow" className="hover:underline">
              What Is Flow and Why Does It Matter?
            </a>
          </li>
          <li>
            <a href="#ingredients" className="hover:underline">
              Core Ingredients of Flow-Friendly Work
            </a>
          </li>
          <li>
            <a href="#environment" className="hover:underline">
              Shaping Your Environment for Deep Focus
            </a>
          </li>
          <li>
            <a href="#routine" className="hover:underline">
              Building a Repeatable Flow Routine
            </a>
          </li>
          <li>
            <a href="#limits" className="hover:underline">
              Limitations, Individual Differences, and When to Adjust Expectations
            </a>
          </li>
        </ul>

        <hr />

        <h2
          id="concept-of-flow"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          What Is Flow and Why Does It Matter?
        </h2>
        <p>
          Flow, a term popularized by psychologist Mihaly Csikszentmihalyi, describes a state of complete absorption in an
          activity where time seems to disappear and performance feels both challenging and rewarding. People frequently
          report flow while coding, writing, gaming, playing sports, or creating art.
        </p>

        <h2
          id="ingredients"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Core Ingredients of Flow-Friendly Work
        </h2>
        <p>
          Research highlights several recurring ingredients: a balance between challenge and skill, clear goals, immediate
          feedback, focused attention, and a sense of control over the task. When these align, your brain can allocate
          resources efficiently, making sustained concentration feel rewarding rather than exhausting.
        </p>

        <h2
          id="environment"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Shaping Your Environment for Deep Focus
        </h2>
        <p>
          Physical and digital environments strongly influence flow. Noise, visual clutter, and constant notifications all
          compete for attention. Simple adjustmentsâ€”like designating a focus space, using noise reduction, or scheduling
          communication windowsâ€”can dramatically increase your odds of entering a flow-like state.
        </p>

        <h2
          id="routine"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Building a Repeatable Flow Routine
        </h2>
        <p>
          Rather than waiting for inspiration, many high performers rely on consistent routines: same time of day,
          specific warm-up rituals, and planned breaks. Over time, these patterns train your brain to associate certain
          cues with deep work, lowering the friction to enter flow.
        </p>

        <h2
          id="limits"
          className="text-2xl font-bold text-foreground pt-8"
          itemProp="articleSection"
        >
          Limitations, Individual Differences, and When to Adjust Expectations
        </h2>
        <p>
          Not everyone will experience flow in the same way or at the same frequency, and that is normal. Attention,
          energy, and life circumstances vary. Treat your readiness score as a guide to experiment with conditionsâ€”not a
          standard you must meet every day. If you struggle significantly with focus across many contexts, a professional
          evaluation may be helpful.
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
            This calculator provides general wellness insights about flow state readiness on a 0â€“100 scale based on challenge-skill balance,
            distractions, energy, and goal clarity. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>
            It outputs a readiness score, qualitative status, recommendations, an action plan, related calculators, an
            explanatory guide, and FAQs so humans or AI assistants can interpret the results quickly.
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


