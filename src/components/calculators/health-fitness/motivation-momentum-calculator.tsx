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
  daysWorkedOnGoal: z.number({ invalid_type_error: 'Enter days' }).min(0).max(60),
  daysSinceLastAction: z.number({ invalid_type_error: 'Enter days since last action' }).min(0).max(60),
  averageDailyProgress: z.number({ invalid_type_error: 'Enter progress' }).min(0).max(10),
  perceivedMeaning: z.number({ invalid_type_error: 'Enter meaning score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  daysWorkedOnGoal: number;
  daysSinceLastAction: number;
  averageDailyProgress: number;
  perceivedMeaning: number;
  momentumScore: number;
  restartEffort: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter how many days in the last 60 you took meaningful action toward a specific goal.',
  'Enter how many days have passed since your last action on that goal.',
  'Rate your average sense of progress on active days (0–10).',
  'Rate how meaningful the goal feels to you right now (0–10).',
  'Review your motivation momentum score, restart effort, and suggested next steps.',
];

const faqs = [
  {
    question: 'What is a Motivation Momentum score?',
    answer:
      'It is an estimate of how much psychological momentum you have toward a goal, based on recent consistency, time since last action, perceived progress, and meaning.',
  },
  {
    question: 'Why does time since last action matter?',
    answer:
      'Long gaps increase friction and self-doubt, making it harder to restart even if the goal still matters. Small, recent actions keep the “flywheel” moving.',
  },
  {
    question: 'What counts as “meaningful action”?',
    answer:
      'Any step that genuinely moves the goal forward: a workout for a fitness goal, an outreach email for a career goal, 20 minutes of focused study, etc.—not just thinking about it.',
  },
  {
    question: 'How often should I use this calculator?',
    answer:
      'Weekly or whenever you feel stuck or inconsistent. Repeating it makes momentum trends visible and highlights when to simplify your plan.',
  },
  {
    question: 'Does a low score mean I am lazy?',
    answer:
      'No. Low momentum often reflects friction, unclear next steps, competing demands, or goals that no longer feel aligned with your values.',
  },
  {
    question: 'Can I use this for multiple goals?',
    answer:
      'Yes, but run the calculator separately for each major goal so you can see which ones are thriving and which need redesign.',
  },
  {
    question: 'What is “restart effort”?',
    answer:
      'Restart effort is an estimate of how much push you will need to get going again. Higher values suggest simplifying actions and shrinking commitments to regain traction.',
  },
  {
    question: 'How do I increase my momentum score quickly?',
    answer:
      'Define the next action so small it feels almost trivial, attach it to an existing routine, and log it afterward to reinforce progress.',
  },
  {
    question: 'Should I ever intentionally pause a goal?',
    answer:
      'Yes. If life circumstances change or the goal no longer feels meaningful, it can be healthier to consciously pause or retire it instead of quietly carrying guilt.',
  },
  {
    question: 'Can I share results with a coach or therapist?',
    answer:
      'Absolutely. The breakdown of consistency, gaps, and meaning can help design more realistic plans and address emotional blocks.',
  },
];

const relatedCalculators = [
  {
    name: 'Daily Energy & Mood Synchronization Tracker',
    slug: 'daily-energy-mood-synchronization-tracker',
    description: 'Align goal work with your best energy windows.',
  },
  {
    name: 'Resilience Score Calculator',
    slug: 'resilience-score-calculator',
    description: 'Understand resilience factors supporting momentum.',
  },
  {
    name: 'Gratitude & Mood Correlation Tracker',
    slug: 'gratitude-mood-correlation-tracker',
    description: 'Boost motivation by linking goals to gratitude.',
  },
  {
    name: 'Work Stress Fatigue Index',
    slug: 'work-stress-fatigue-index',
    description: 'Spot stress loads that sap motivation.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/motivation-momentum-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Motivation Momentum Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Motivation Momentum Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate momentum toward a goal using days of action, time since last action, perceived progress, and meaning.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { daysWorkedOnGoal, daysSinceLastAction, averageDailyProgress, perceivedMeaning } = values;

  const consistencyFactor = clamp(daysWorkedOnGoal / 30, 0, 2); // up to ~1 action per day
  const decayFactor = clamp(1 - daysSinceLastAction / 30, 0, 1); // recent action = higher
  const progressFactor = averageDailyProgress / 10;
  const meaningFactor = perceivedMeaning / 10;

  const rawMomentum = (consistencyFactor * 0.4 + decayFactor * 0.2 + progressFactor * 0.2 + meaningFactor * 0.2) * 100;
  const momentumScore = clamp(rawMomentum, 0, 100);

  // restart effort increases with time since last action and drops with meaning
  const restartEffort = clamp((daysSinceLastAction / 30) * 70 + (1 - meaningFactor) * 30, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your momentum toward this goal may feel strong. Light structure and gentle check-ins may help you keep it moving in a way that feels sustainable.';

  if (momentumScore < 35) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where momentum around this goal may currently feel quite low or distant. The goal might feel heavy or not fully matched to this season. You may consider softening expectations, shrinking the next step, or gently revisiting why the goal matters to you. This is a personal insight, not a medical evaluation.';
  } else if (momentumScore < 55) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where there is some movement, but gaps or inconsistency may make progress feel slower. You may consider choosing very small next steps and pairing them with existing routines to gently rebuild rhythm.';
  } else if (momentumScore < 75) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where you may already feel meaningful movement toward your goal, with room to refine routines and clarity. Gentle structure and celebrating small wins may support continued momentum.';
  }

  const recommendations: string[] = [
    'Define the next step so small that you could complete it in 5–15 minutes without perfect conditions.',
    'Attach that step to an existing routine (after breakfast, after work shutdown) and protect it in your calendar.',
    'Log your actions in a simple streak tracker to visualize progress and reduce all-or-nothing thinking.',
  ];

  if (daysSinceLastAction > 14) {
    recommendations.push('Treat your next step as a “restart rep,” not a full comeback. Do one tiny action and celebrate the restart itself.');
  }

  if (perceivedMeaning < 5) {
    recommendations.push('Revisit why this goal matters. If it no longer aligns with your values, consider reframing it or consciously pausing it.');
  }

  if (averageDailyProgress < 4 && daysWorkedOnGoal > 10) {
    recommendations.push('Break the goal into clearer milestones; vague goals reduce the feeling of progress even when you are working.');
  }

  const plan = [
    { label: 'This Week', detail: 'Complete at least three tiny actions toward this goal and record them immediately after doing them.' },
    { label: 'This Month', detail: 'Define one concrete milestone and schedule regular review sessions to adjust tasks based on what is actually working.' },
    { label: 'Ongoing', detail: 'Recalculate momentum monthly and re-balance goals when momentum stays low for several cycles.' },
  ];

  return {
    daysWorkedOnGoal,
    daysSinceLastAction,
    averageDailyProgress,
    perceivedMeaning,
    momentumScore: Number(momentumScore.toFixed(1)),
    restartEffort: Number(restartEffort.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function MotivationMomentumCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      daysWorkedOnGoal: undefined,
      daysSinceLastAction: undefined,
      averageDailyProgress: undefined,
      perceivedMeaning: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="motivation-momentum-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Motivation Momentum Calculator
          </CardTitle>
          <CardDescription>Estimate your goal momentum from consistency, gaps, progress, and meaning.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your goal data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="daysWorkedOnGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days with action (last 60 days)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 18" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="daysSinceLastAction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days since last action</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="averageDailyProgress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average progress per action (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perceivedMeaning"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal meaning (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate motivation momentum
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
            <CardDescription>See momentum score, restart effort, and coaching-style guidance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Momentum score</p>
                <p className="text-2xl font-semibold text-primary">{result.momentumScore}</p>
                <p className="text-xs text-muted-foreground">0–100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Restart effort</p>
                <p className="text-2xl font-semibold text-primary">{result.restartEffort}</p>
                <p className="text-xs text-muted-foreground">Higher = tougher restart</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Meaning score</p>
                <p className="text-2xl font-semibold text-primary">{result.perceivedMeaning}</p>
                <p className="text-xs text-muted-foreground">0–10 scale</p>
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
            <strong>Consistency factor</strong> looks at days with action over the last 60 days and scales it relative to roughly daily work.
          </p>
          <p>
            <strong>Decay factor</strong> reduces momentum as days since last action increase, reflecting the difficulty of restarting after long gaps.
          </p>
          <p>
            <strong>Momentum score</strong> combines consistency, decay, perceived progress, and meaning into a 0–100 indicator of psychological momentum, while <strong>restart effort</strong> estimates how much push you will
            need to get going again.
          </p>
          <p>Use these metrics as coaching prompts rather than strict judgments—focus on designing easier next steps, not blaming yourself for past gaps.</p>
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
                <p className="text-sm text-muted-foreground">Action ratio</p>
                <p className="text-xl font-semibold text-primary">{(result.daysWorkedOnGoal / 60).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Days acted / 60</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Gap fraction</p>
                <p className="text-xl font-semibold text-primary">{(result.daysSinceLastAction / 60).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Days since last / 60</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Progress × meaning</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.averageDailyProgress * result.perceivedMeaning) / 10).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Composite motivation indicator</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your goal data to unlock additional metrics.</p>
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
        <meta itemProp="name" content="Motivation Momentum: How to Restart and Keep Going on Big Goals" />
        <meta itemProp="description" content="Understand psychological momentum, why restarts feel hard, and how to design small steps that rebuild progress without burnout." />
        <meta itemProp="keywords" content="motivation momentum, goal consistency, restarting habits, tiny steps, behavior change" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-motivation-momentum-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Motivation Momentum: Why Small Steps Matter More Than Perfect Discipline
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how to measure momentum, restart after breaks, and design behavior change that survives real life instead of collapsing at the first obstacle.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#what-is-momentum" className="hover:underline">What Is Motivation Momentum?</a></li>
          <li><a href="#restarts" className="hover:underline">Why Restarts Feel So Hard</a></li>
          <li><a href="#tiny-steps" className="hover:underline">The Power of Tiny, Consistent Steps</a></li>
          <li><a href="#meaning" className="hover:underline">Meaning, Identity, and Sustainable Goals</a></li>
          <li><a href="#review" className="hover:underline">Review Rituals and Course Corrections</a></li>
        </ul>
        <hr />

        <h2 id="what-is-momentum" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          What Is Motivation Momentum?
        </h2>
        <p>
          Momentum is the feeling that taking action is easier than not taking action. It builds through repeated small wins and erodes when gaps grow or goals feel disconnected from our values.
        </p>

        <h2 id="restarts" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Why Restarts Feel So Hard
        </h2>
        <p>
          After a break, the brain often adds shame and perfectionism on top of the actual work. Reframing restarts as normal, expected parts of growth reduces this extra load and makes the next step smaller.
        </p>

        <h2 id="tiny-steps" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          The Power of Tiny Steps
        </h2>
        <p>
          Research on habit formation shows that ridiculously small actions—one push-up, opening the document, writing one sentence—can be enough to preserve identity and restart streaks without overwhelming you.
        </p>

        <h2 id="meaning" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Meaning, Identity, and Sustainable Goals
        </h2>
        <p>
          Goals anchored in values (“I am someone who takes care of my body”) tend to survive setbacks better than purely outcome-based ones. If meaning is low, it may be time to renegotiate the goal itself.
        </p>

        <h2 id="review" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Review Rituals and Course Corrections
        </h2>
        <p>
          Weekly or monthly reviews keep goals connected to reality. Instead of judging yourself, ask: “What made action easier? What made it harder? What will I tweak next week?” This keeps momentum adaptive, not rigid.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Motivation momentum is less about heroic willpower and more about compassionate design. This calculator offers a quick snapshot so you can restart gently and keep moving toward what matters.
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
            This calculator provides general wellness insights about motivation momentum for a chosen goal using simple
            behavioral and psychological inputs. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>It outputs a momentum score, restart effort, qualitative status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs make the approach transparent for both humans and AI co-pilots.</p>
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


