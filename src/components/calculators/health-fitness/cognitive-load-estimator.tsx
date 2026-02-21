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
  concurrentProjects: z.number({ invalid_type_error: 'Enter projects count' }).min(1).max(30),
  taskComplexity: z.number({ invalid_type_error: 'Enter complexity score' }).min(1).max(10),
  contextSwitches: z.number({ invalid_type_error: 'Enter context switches' }).min(0).max(60),
  distractionMinutes: z.number({ invalid_type_error: 'Enter distraction minutes' }).min(0).max(60),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  concurrentProjects: number;
  taskComplexity: number;
  contextSwitches: number;
  distractionMinutes: number;
  loadScore: number;
  focusCapacity: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter the number of projects or major responsibilities currently active.',
  'Rate average task complexity (1 simple, 10 highly creative/ambiguous).',
  'Add average context switches per day (slack, meetings, fire drills).',
  'Estimate distraction minutes per working hour (alerts, multitasking).',
  'Review cognitive load score, available focus capacity, and optimization plan.',
];

const faqs = [
  {
    question: 'What is cognitive load?',
    answer:
      'Cognitive load represents the total mental effort required to process tasks, juggle projects, and manage distractions. High load reduces working memory, decision quality, and creativity.',
  },
  {
    question: 'Who should use the Cognitive Load Estimator?',
    answer:
      'Knowledge workers, students, founders, and managers who juggle multiple priorities benefit from quantifying workload to prevent overwhelm and plan capacity realistically.',
  },
  {
    question: 'How is the load score calculated?',
    answer:
      'The score combines project count, task complexity, context switching, and distraction minutes with weighted formulas that reflect their impact on working memory.',
  },
  {
    question: 'What is focus capacity?',
    answer:
      'Focus capacity estimates how much high-quality cognitive energy remains (0-100%). Above 60% suggests solid bandwidth; below 30% means sustained deep work is unlikely without redesigning workload.',
  },
  {
    question: 'How can I lower cognitive load quickly?',
    answer:
      'Batch communication, limit simultaneous projects, block meeting-free focus time, mute nonessential alerts, and document processes to reduce context switching.',
  },
  {
    question: 'Does multitasking really hurt performance?',
    answer:
      'Yes. Research shows each context switch costs ~23 minutes to regain focus. Frequent switching increases error rates and stress hormones, stretching the nervous system thin.',
  },
  {
    question: 'Can I use this with teams?',
    answer:
      'Managers can aggregate team scores to detect overload, rebalance assignments, or justify project sequencing. It complements sprint planning and OKR reviews.',
  },
  {
    question: 'How often should I recalculate?',
    answer:
      'Weekly or whenever major projects shift. Tracking trends makes capacity planning and quarterly reviews more evidence-based.',
  },
  {
    question: 'What if my load score seems low but I still feel stressed?',
    answer:
      'Use the guide section to examine hidden stressors (psychological safety, unclear roles). Pair this estimator with burnout or social anxiety trackers for a full wellbeing picture.',
  },
  {
    question: 'Is there an ideal load score?',
    answer:
      'Scores 30-55 are sustainable for most people. Below 30 may indicate underutilization; above 65 signals overload that will erode performance if left unchecked.',
  },
];

const relatedCalculators = [
  {
    name: 'Emotional Burnout Recovery Calculator',
    slug: 'emotional-burnout-recovery-calculator',
    description: 'Estimate recovery needs when cognitive load remains high.',
  },
  {
    name: 'Phone Dependency Index',
    slug: 'phone-dependency-index',
    description: 'Assess smartphone behaviors fueling distractions.',
  },
  {
    name: 'Cognitive Focus Efficiency Calculator',
    slug: 'cognitive-focus-efficiency-calculator',
    description: 'Assess how efficiently you convert work blocks into progress.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/cognitive-load-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Cognitive Load Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Cognitive Load Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Quantify mental workload drivers and remaining focus capacity.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { concurrentProjects, taskComplexity, contextSwitches, distractionMinutes } = values;

  const projectLoad = clamp((concurrentProjects / 20) * 35, 5, 40);
  const complexityLoad = taskComplexity * 3;
  const switchLoad = clamp((contextSwitches / 40) * 20, 0, 25);
  const distractionLoad = clamp((distractionMinutes / 60) * 20, 0, 20);

  const loadScore = clamp(projectLoad + complexityLoad + switchLoad + distractionLoad, 0, 100);
  const focusCapacity = clamp(100 - loadScore, 5, 95);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation =
    'This suggests a general lifestyle tendency where your cognitive load may feel relatively well managed. Deep work blocks and decision quality may remain supported when this pattern feels sustainable for you.';

  if (loadScore >= 75) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your current pattern may feel quite mentally full. You may notice it is harder to think clearly or switch tasks comfortably. You might consider deferring, delegating, or simplifying some commitments. This is a personal insight, not a medical evaluation.';
  } else if (loadScore >= 55) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where mental load may feel somewhat elevated. You might notice focus feeling patchy or creative work taking more effort. You may consider reducing context switches and distractions where possible.';
  } else if (loadScore >= 40) {
    status = 'good';
    interpretation =
      'This suggests a general lifestyle tendency where your mental load may feel moderate. Staying intentional with focus habits and breaks may help keep things feeling workable.';
  }

  const recommendations: string[] = [
    'Batch meetings and messaging windows to cut context switches by 30-50%.',
    'Adopt “single-task sprints” (25-50 minutes) with protected focus signals.',
    'Document repeatable processes to offload working memory onto systems.',
  ];

  if (contextSwitches >= 25) {
    recommendations.push('Create communication guardrails (status docs, async updates) to limit interruptions and align teams without constant pings.');
  }

  if (distractionMinutes >= 20) {
    recommendations.push('Silence nonessential notifications, move phones out of reach, and use website blockers during deep work.');
  }

  if (concurrentProjects >= 10) {
    recommendations.push('Sequence projects using WIP (work-in-progress) limits — cap active initiatives and maintain a clear backlog.');
  }

  const plan = [
    { label: 'This Week', detail: 'Identify top distraction sources and institute at least two guardrails (notification batching, focus mode, meeting-free mornings).' },
    { label: 'This Month', detail: 'Align projects to a Kanban or OKR cadence, limiting WIP and scheduling regular backlog pruning sessions.' },
    { label: 'Ongoing', detail: 'Recalculate load weekly and adjust commitments when scores remain above 55 for consecutive weeks.' },
  ];

  return {
    concurrentProjects,
    taskComplexity,
    contextSwitches,
    distractionMinutes,
    loadScore: Number(loadScore.toFixed(1)),
    focusCapacity: Number(focusCapacity.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function CognitiveLoadEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      concurrentProjects: undefined,
      taskComplexity: undefined,
      contextSwitches: undefined,
      distractionMinutes: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="cognitive-load-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Cognitive Load Estimator
          </CardTitle>
          <CardDescription>Quantify mental workload from projects, complexity, context switching, and distractions.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your workload signals</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="concurrentProjects"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concurrent projects / domains</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taskComplexity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average task complexity (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contextSwitches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Context switches per day</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 18" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="distractionMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distraction minutes per hour</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate cognitive load
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
            <CardDescription>See load score, focus capacity, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Load score</p>
                <p className="text-2xl font-semibold text-primary">{result.loadScore}</p>
                <p className="text-xs text-muted-foreground">0-100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Focus capacity</p>
                <p className="text-2xl font-semibold text-primary">{result.focusCapacity}%</p>
                <p className="text-xs text-muted-foreground">Available bandwidth</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Context switching</p>
                <p className="text-2xl font-semibold text-primary">{result.contextSwitches}</p>
                <p className="text-xs text-muted-foreground">Per day</p>
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
            <strong>Load score</strong> = Project load (≤40) + Complexity load (≤30) + Context switching load (≤25) + Distraction load (≤20). Each component is scaled to reflect cognitive science research on working memory interference.
          </p>
          <p>
            <strong>Focus capacity</strong> = 100 − Load score. This represents remaining attention for high-value work or strategic thinking.
          </p>
          <p>
            <strong>Context switching tax</strong> approximates 23 minutes lost per switch; use this to illustrate real costs when communicating with teams or leadership.
          </p>
          <p>Use these formulas to test scenarios—reduce projects or distractions to see how quickly capacity improves.</p>
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
                <p className="text-sm text-muted-foreground">Weekly switches</p>
                <p className="text-xl font-semibold text-primary">{result.contextSwitches * 5}</p>
                <p className="text-xs text-muted-foreground">Estimated per workweek</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Focus loss (hrs)</p>
                <p className="text-xl font-semibold text-primary">{((result.contextSwitches * 23) / 60).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Daily minutes squandered</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Distraction ratio</p>
                <p className="text-xl font-semibold text-primary">{(result.distractionMinutes / 60).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Portion of each hour</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Complete the form to see additional workload metrics.</p>
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
        <meta itemProp="name" content="Cognitive Load Playbook: Designing Focus Systems for High Output Teams" />
        <meta itemProp="description" content="Explore the science of working memory, attention residue, and context switching to redesign calendars, processes, and tools for sustainable productivity." />
        <meta itemProp="keywords" content="cognitive load calculator, context switching cost, focus planner, knowledge work capacity, working memory optimization" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-cognitive-load-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Measuring and Reducing Cognitive Load</h1>
        <p className="text-lg italic text-gray-700">Understand how projects, complexity, context switching, and digital distractions drain focus—and how to rebuild attention capacity with evidence-backed rituals.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#working-memory" className="hover:underline">Working Memory 101</a></li>
          <li><a href="#attention-residue" className="hover:underline">Attention Residue and Context Switching Costs</a></li>
          <li><a href="#systems" className="hover:underline">Systems Design for Deep Work</a></li>
          <li><a href="#meetings" className="hover:underline">Meeting Hygiene and Communication Protocols</a></li>
          <li><a href="#metrics" className="hover:underline">Metrics and Experiments</a></li>
        </ul>
        <hr />

        <h2 id="working-memory" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Working Memory 101</h2>
        <p>Working memory holds 3-5 chunks of information at once. When overloaded by simultaneous projects or constant alerts, the brain offloads tasks and errors spike. Protecting working memory is central to sustainable performance.</p>

        <h2 id="attention-residue" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Attention Residue</h2>
        <p>Every unfinished task leaves cognition lingering on it. Rapid switching causes attention residue that lingers for up to 23 minutes. Strategic batching and closing loops free up capacity for creative thinking.</p>

        <h2 id="systems" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Systems Design</h2>
        <p>Implement Kanban boards, objective-based planning, and calendar audits to align work with energy. Automate status updates and use shared dashboards to reduce ad hoc requests.</p>

        <h2 id="meetings" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Meeting Hygiene</h2>
        <p>Best practices: agendas, decision owners, 25-minute defaults, asynchronous updates, and dedicated no-meeting focus windows. Every unnecessary meeting steals high-quality cognition.</p>

        <h2 id="metrics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Metrics and Experiments</h2>
        <p>Track load scores, meeting hours, Slack pings, and subjective energy weekly. Run experiments (e.g., Focus Friday) and compare metrics before and after to quantify impact.</p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Cognitive load isn’t just personal discipline—it’s a systems problem. Use this estimator to advocate for better workflows, protect your nervous system, and keep strategic thinking sharp.</p>
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
            This tool provides general wellness insights about cognitive load from core workload signals. This is a
            personal lifestyle insight, not a medical evaluation.
          </p>
          <p>Outputs include load score, focus capacity, status, recommendations, action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs enable anyone to interpret the methodology instantly.</p>
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


