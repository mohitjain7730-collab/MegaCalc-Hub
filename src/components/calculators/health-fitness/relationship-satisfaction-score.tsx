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
  communicationQuality: z.number({ invalid_type_error: 'Enter score' }).min(0).max(10),
  trustLevel: z.number({ invalid_type_error: 'Enter score' }).min(0).max(10),
  sharedActivities: z.number({ invalid_type_error: 'Enter hours' }).min(0).max(80),
  conflictFrequency: z.number({ invalid_type_error: 'Enter conflicts' }).min(0).max(50),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  communicationQuality: number;
  trustLevel: number;
  sharedActivities: number;
  conflictFrequency: number;
  satisfactionScore: number;
  connectionIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate the quality of communication with your partner or key relationship (0â€“10).',
  'Rate your overall trust level in this relationship (0â€“10).',
  'Estimate hours per week spent in shared, meaningful activities (not just co-existing in the same room).',
  'Estimate number of notable conflicts or arguments in an average month.',
  'Review the satisfaction score, connection index, and suggestions.',
];

const faqs = [
  {
    question: 'What kind of relationship is this for?',
    answer:
      'The calculator is designed for close relationshipsâ€”romantic partners, very close friends, or family members. Use one entry per relationship for clarity.',
  },
  {
    question: 'Is this a replacement for couples therapy?',
    answer:
      'No. It provides a structured reflection but cannot replace professional guidance for serious issues like abuse, betrayal, or chronic distress.',
  },
  {
    question: 'Why track shared activities?',
    answer:
      'Time spent in shared, engaging activities is a core predictor of relationship satisfaction and resilience.',
  },
  {
    question: 'How should I count conflicts?',
    answer:
      'Count disagreements that feel emotionally significant or recurring, not tiny everyday differences of opinion.',
  },
  {
    question: 'What is a â€œgoodâ€ satisfaction score?',
    answer:
      'Scores above ~70 usually reflect solid, if imperfect, relationships in this heuristic model. Lower scores flag areas for conversation or support.',
  },
  {
    question: 'Can two people fill this out separately?',
    answer:
      'Yes, and comparing results can be a powerful starting point for compassionate dialogue (ideally with ground rules).',
  },
  {
    question: 'What is the connection index?',
    answer:
      'The connection index combines trust and shared activities into a single number that reflects emotional and practical closeness.',
  },
  {
    question: 'How often should we re-check?',
    answer:
      'Monthly, or after major changes such as moving, having a child, job shifts, or conflict spikes.',
  },
  {
    question: 'Does a low score mean the relationship should end?',
    answer:
      'Not necessarily. It signals that attention, support, or change is needed. Many relationships improve significantly when both people work on patterns.',
  },
  {
    question: 'Is this anonymous?',
    answer:
      'The calculator itself does not store data; how you save or share results is up to you.',
  },
];

const relatedCalculators = [
  {
    name: 'Loneliness Risk Index',
    slug: 'loneliness-risk-index',
    description: 'Understand how connection patterns relate to loneliness.',
  },
  {
    name: 'Empathy Quotient Calculator',
    slug: 'empathy-quotient-calculator',
    description: 'Explore your empathy tendencies in relationships.',
  },
  {
    name: 'Gratitude & Mood Correlation Tracker',
    slug: 'gratitude-mood-correlation-tracker',
    description: 'Use gratitude practices to strengthen bonds.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Assess stress loads that may affect your relationship.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/relationship-satisfaction-score';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Relationship Satisfaction Score', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Relationship Satisfaction Score',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate relationship satisfaction from communication, trust, shared time, and conflict frequency.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { communicationQuality, trustLevel, sharedActivities, conflictFrequency } = values;

  const baseScore =
    communicationQuality * 0.35 +
    trustLevel * 0.35 +
    clamp(sharedActivities / 10, 0, 1) * 20 -
    clamp(conflictFrequency / 10, 0, 1.5) * 15;

  const satisfactionScore = clamp(baseScore * 2, 0, 100);
  const connectionIndex = clamp((trustLevel / 10) * 60 + clamp(sharedActivities / 20, 0, 1) * 40, 0, 100);

  let status: ResultPayload['status'] = 'good';
  let interpretation =
    'This suggests a general lifestyle tendency where your overall sense of satisfaction in this relationship may feel reasonably steady, with room for gentle growth.';

  if (satisfactionScore < 40) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where this relationship may sometimes feel strained or less balanced. You may consider gentle conversations, small changes in shared time, or seeking supportive perspectives if that feels helpful. This is a personal insight, not a medical evaluation.';
  } else if (satisfactionScore < 60) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where you may notice both meaningful strengths and areas that feel tender. Exploring small, caring adjustments together may help you both feel more supported.';
  } else if (satisfactionScore > 80 && conflictFrequency <= 3) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where you may feel strong satisfaction and connection overall. Continuing to invest intentionallyâ€”through appreciation, time together, and honest check-insâ€”may help maintain this pattern.';
  }

  const recommendations: string[] = [
    'Schedule regular check-ins to share appreciations, needs, and logistics without distraction.',
    'Add or protect at least one shared, enjoyable activity each week, even if brief.',
    'When conflicts arise, focus on understanding and problem-solving rather than winning.',
  ];

  if (communicationQuality < 6) {
    recommendations.push('Consider learning or practicing communication tools like active listening, â€œIâ€ statements, or timeouts during heated moments.');
  }

  if (trustLevel < 6) {
    recommendations.push('If trust has been damaged, gradual, consistent follow-through and transparency are more effective than big promises.');
  }

  if (conflictFrequency > 8) {
    recommendations.push('Frequent intense conflict may benefit from couples counseling or mediation with a neutral third party.');
  }

  const plan = [
    { label: 'This Week', detail: 'Name one small change each of you is willing to test to improve communication or closeness.' },
    { label: 'This Month', detail: 'Establish a recurring ritual (walk, meal, game night) focused on connection rather than logistics.' },
    { label: 'Ongoing', detail: 'Revisit scores periodically to notice patterns and seek support early if satisfaction trends downward.' },
  ];

  return {
    communicationQuality,
    trustLevel,
    sharedActivities,
    conflictFrequency,
    satisfactionScore: Number(satisfactionScore.toFixed(1)),
    connectionIndex: Number(connectionIndex.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function RelationshipSatisfactionScore() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      communicationQuality: undefined,
      trustLevel: undefined,
      sharedActivities: undefined,
      conflictFrequency: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="relationship-satisfaction-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Relationship Satisfaction Score
          </CardTitle>
          <CardDescription>Estimate the health of a close relationship from communication, trust, time, and conflict.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your relationship data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="communicationQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Communication quality (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trustLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trust level (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sharedActivities"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shared meaningful time (hours/week)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conflictFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conflicts per month</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate relationship satisfaction
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
            <CardDescription>See satisfaction score, connection index, and suggestions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Satisfaction score</p>
                <p className="text-2xl font-semibold text-primary">{result.satisfactionScore}</p>
                <p className="text-xs text-muted-foreground">0â€“100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Connection index</p>
                <p className="text-2xl font-semibold text-primary">{result.connectionIndex}</p>
                <p className="text-xs text-muted-foreground">Trust + time</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Shared time</p>
                <p className="text-2xl font-semibold text-primary">{result.sharedActivities}</p>
                <p className="text-xs text-muted-foreground">Hours/week</p>
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
            <strong>Satisfaction score</strong> combines communication, trust, normalized shared time, and a penalty for conflict frequency, then scales results to 0â€“100 for easier interpretation.
          </p>
          <p>
            <strong>Connection index</strong> emphasizes trust and shared time as key predictors of relationship closeness.
          </p>
          <p>These are heuristic formulas for self-reflection and conversation, not clinical or diagnostic tools.</p>
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
                <p className="text-sm text-muted-foreground">Conflict ratio</p>
                <p className="text-xl font-semibold text-primary">{(result.conflictFrequency / 30).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Conflicts/day (approx)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Shared hours balance</p>
                <p className="text-xl font-semibold text-primary">
                  {result.sharedActivities >= 5 ? 'Solid' : 'Thin'}
                </p>
                <p className="text-xs text-muted-foreground">Compared to 5+ hrs/week guide</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Combined comms + trust</p>
                <p className="text-xl font-semibold text-primary">
                  {((result.communicationQuality + result.trustLevel) / 2).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Average (0â€“10)</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your relationship data to see additional metrics.</p>
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
        <meta itemProp="name" content="Relationship Satisfaction: Reflecting on Connection, Trust, and Conflict" />
        <meta itemProp="description" content="Use structured questions to reflect on relationship satisfaction, highlight strengths, and identify areas for growth." />
        <meta itemProp="keywords" content="relationship satisfaction score, couples reflection, communication quality, trust level, conflict frequency" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-relationship-satisfaction-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Relationship Satisfaction: A Practical Self-Check for Connection Health
        </h1>
        <p className="text-lg italic text-gray-700">
          Explore communication, trust, shared time, and conflict patterns so you can care for your most important relationships more intentionally.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#pillars" className="hover:underline">Four Pillars of Relationship Health</a></li>
          <li><a href="#time-together" className="hover:underline">The Role of Shared Time</a></li>
          <li><a href="#conflict" className="hover:underline">Healthy vs. Harmful Conflict</a></li>
          <li><a href="#conversation" className="hover:underline">Using Scores for Conversation, Not Blame</a></li>
          <li><a href="#support" className="hover:underline">When to Seek Support</a></li>
        </ul>
        <hr />

        <h2 id="pillars" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Four Pillars of Relationship Health
        </h2>
        <p>
          Communication, trust, shared experiences, and conflict style all interact to shape how safe and connected a relationship feels. Small improvements in any pillar can shift the whole system.
        </p>

        <h2 id="time-together" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          The Role of Shared Time
        </h2>
        <p>
          Quantity is not everything, but consistent, high-quality shared time creates opportunities for laughter, intimacy, and repair that cannot happen through logistics alone.
        </p>

        <h2 id="conflict" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Healthy vs. Harmful Conflict
        </h2>
        <p>
          Disagreement is normal; contempt, stonewalling, and repeated unresolved fights are warning signs. Learning gentler conflict tools can protect both people in the long run.
        </p>

        <h2 id="conversation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Using Scores for Conversation, Not Blame
        </h2>
        <p>
          Share your reflections as observations (â€œI noticeâ€¦â€) and hopes (â€œI would loveâ€¦â€) rather than accusations. The goal is to understand each other, not to win a debate.
        </p>

        <h2 id="support" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          When to Seek Support
        </h2>
        <p>
          If patterns feel stuck, or if anyone feels unsafe, a couples therapist, counselor, or mediator can provide tools, boundaries, and a neutral space for dialogue.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Relationships do not improve through guesswork alone. Simple, honest reflectionâ€”paired with compassionate conversation and supportâ€”can keep strong connections thriving and help struggling ones heal.
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
            This calculator offers a structured, general wellness snapshot of relationship satisfaction using four simple
            inputs. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>Outputs include a satisfaction score, connection index, qualitative status, recommendations, an action plan, and supporting calculations.</p>
          <p>Guide content, formulas, and FAQs ensure the context is clear for humans and AI assistants reviewing the results.</p>
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


