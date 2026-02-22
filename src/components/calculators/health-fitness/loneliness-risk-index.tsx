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
  meaningfulInteractionsPerWeek: z.number({ invalid_type_error: 'Enter interactions' }).min(0).max(100),
  perceivedBelonging: z.number({ invalid_type_error: 'Enter belonging score' }).min(0).max(10),
  timeSpentAloneHours: z.number({ invalid_type_error: 'Enter hours' }).min(0).max(168),
  digitalOnlyConnectionsPercent: z.number({ invalid_type_error: 'Enter percent' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  meaningfulInteractionsPerWeek: number;
  perceivedBelonging: number;
  timeSpentAloneHours: number;
  digitalOnlyConnectionsPercent: number;
  lonelinessRiskScore: number;
  protectionScore: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count your approximate number of meaningful (emotionally real) interactions per week.',
  'Rate your sense of belonging or being â€œpart ofâ€ at least one group (0â€“10).',
  'Estimate hours per week spent mostly alone (not counting sleep).',
  'Estimate what percentage of your social connections are primarily digital/online.',
  'Review loneliness risk score, protection score, and suggested connection experiments.',
];

const faqs = [
  {
    question: 'What is the Loneliness Risk Index?',
    answer:
      'It is an estimate of your current risk of feeling lonely, based on social contact frequency, belonging, alone time, and whether relationships are mostly digital or in-person.',
  },
  {
    question: 'Is being alone the same as being lonely?',
    answer:
      'No. Loneliness is about how connected you feel, not just the number of people around you. Some people enjoy lots of solitude while feeling deeply connected.',
  },
  {
    question: 'Why ask about digital connections?',
    answer:
      'Online relationships can be meaningful, but heavy reliance on shallow digital contact without deeper ties can increase loneliness for some people.',
  },
  {
    question: 'Is this a diagnostic tool?',
    answer:
      'No. It is a reflective self-check, not a clinical assessment. Persistent distress or social withdrawal warrants talking with a professional.',
  },
  {
    question: 'How often should I use this?',
    answer:
      'Every few months or when your living situation, work setup, or relationships change significantly.',
  },
  {
    question: 'Can extroverts and introverts use the same tool?',
    answer:
      'Yes, but interpret results through your own preferences. Introverts may need fewer interactions than extroverts but still benefit from quality connection.',
  },
  {
    question: 'What is the protection score?',
    answer:
      'It reflects protective factors such as belonging and meaningful contact frequency that buffer against loneliness, even if you spend a lot of time alone.',
  },
  {
    question: 'Does this consider romantic vs. platonic relationships?',
    answer:
      'No. It focuses on overall connection; romantic, family, and friend connections can all contribute to lower loneliness.',
  },
  {
    question: 'Can online communities reduce loneliness?',
    answer:
      'Yes, especially when they involve sustained, authentic interactions and ideally some voice or video contactâ€”not just scrolling or likes.',
  },
  {
    question: 'What if my risk score is high?',
    answer:
      'Use the recommendations to design small connection experiments and consider reaching out to support networks or professionals if feelings are intense or long-lasting.',
  },
];

const relatedCalculators = [
  {
    name: 'Relationship Satisfaction Score',
    slug: 'relationship-satisfaction-score',
    description: 'Reflect on the quality of a key relationship.',
  },
  {
    name: 'Self-Esteem Growth Tracker',
    slug: 'self-esteem-growth-tracker',
    description: 'Track inner self-regard that interacts with loneliness.',
  },
  {
    name: 'Gratitude & Mood Correlation Tracker',
    slug: 'gratitude-mood-correlation-tracker',
    description: 'Use gratitude to highlight existing connections.',
  },
  {
    name: 'Mental Recovery from Stress Estimator',
    slug: 'mental-recovery-from-stress-estimator',
    description: 'See how stress recovery intersects with social needs.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/loneliness-risk-index';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Loneliness Tendency Wellness Index', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Loneliness Tendency Wellness Index',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Get general wellness insights about loneliness tendency from meaningful interactions, belonging, time alone, and digital vs in-person connection. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { meaningfulInteractionsPerWeek, perceivedBelonging, timeSpentAloneHours, digitalOnlyConnectionsPercent } = values;

  const interactionFactor = clamp(1 - meaningfulInteractionsPerWeek / 20, 0, 1); // fewer interactions => higher risk
  const belongingFactor = clamp(1 - perceivedBelonging / 10, 0, 1);
  const aloneFactor = clamp(timeSpentAloneHours / 60, 0, 1); // >60h/week alone increases risk
  const digitalSkew = clamp(digitalOnlyConnectionsPercent / 100, 0, 1);

  const lonelinessRiskScore = clamp(
    (interactionFactor * 0.35 + belongingFactor * 0.35 + aloneFactor * 0.2 + digitalSkew * 0.1) * 100,
    0,
    100,
  );

  const protectionScore = clamp(
    (1 - interactionFactor) * 40 + (perceivedBelonging / 10) * 40 + (1 - digitalSkew) * 20,
    0,
    100,
  );

  let status: ResultPayload['status'] = 'good';
  let interpretation =
    'This suggests a general lifestyle tendency where your current connection patterns and sense of belonging may feel reasonably supportive, with several protective factors present.';

  if (lonelinessRiskScore >= 70) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where feelings of disconnection or limited support may show up more often in daily life. You may consider small, gentle steps toward more regular or deeper connection. This is a personal insight, not a medical evaluation.';
  } else if (lonelinessRiskScore >= 50) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where there may be some signs of loneliness, while also having meaningful connections to build on. You may consider nurturing a few existing relationships or adding small connection rituals.';
  } else if (lonelinessRiskScore < 30) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where your connection patterns and sense of belonging may feel quite supportive against feelings of loneliness.';
  }

  const recommendations: string[] = [
    'Identify one or two people you already know and schedule a slightly deeper conversation or shared activity.',
    'Experiment with joining a group aligned with your interests (class, club, volunteer group, online community with real interaction).',
    'Balance digital contact with occasional voice or video calls or in-person time where possible.',
  ];

  if (meaningfulInteractionsPerWeek < 5) {
    recommendations.push('Aim to add 1â€“2 meaningful interactions per week through reach-outs, calls, or joining activities you care about.');
  }

  if (perceivedBelonging < 5) {
    recommendations.push('Reflect on spaces where you feel most accepted, even a little; investing more time there can gradually increase belonging.');
  }

  if (timeSpentAloneHours > 80) {
    recommendations.push('If a lot of alone time is unintentional, consider adjusting routines to share meals, walks, or hobbies with others when safe to do so.');
  }

  const plan = [
    { label: 'This Week', detail: 'Reach out to at least one person for a genuine conversation and add one small group or community interaction.' },
    { label: 'This Month', detail: 'Experiment with one recurring connection ritual (weekly call, game night, or meetup).' },
    { label: 'Ongoing', detail: 'Reassess periodically and seek professional or community support if loneliness remains intense or disabling.' },
  ];

  return {
    meaningfulInteractionsPerWeek,
    perceivedBelonging,
    timeSpentAloneHours,
    digitalOnlyConnectionsPercent,
    lonelinessRiskScore: Number(lonelinessRiskScore.toFixed(1)),
    protectionScore: Number(protectionScore.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function LonelinessRiskIndex() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meaningfulInteractionsPerWeek: undefined,
      perceivedBelonging: undefined,
      timeSpentAloneHours: undefined,
      digitalOnlyConnectionsPercent: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="loneliness-risk-index-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Loneliness Tendency Wellness Index
            </CardTitle>
          <CardDescription>
            Get general wellness insights about loneliness tendency from connection patterns and belonging. This is a
            personal lifestyle insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your connection data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="meaningfulInteractionsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Meaningful interactions/week</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perceivedBelonging"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Belonging (0â€“10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 5.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeSpentAloneHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours alone/week (awake)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 40" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="digitalOnlyConnectionsPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Digital-only connections (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 70" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate loneliness risk
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
            <CardDescription>See loneliness risk, protective factors, and connection ideas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loneliness risk</p>
                <p className="text-2xl font-semibold text-primary">{result.lonelinessRiskScore}</p>
                <p className="text-xs text-muted-foreground">0â€“100 (higher = greater risk)</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Protection score</p>
                <p className="text-2xl font-semibold text-primary">{result.protectionScore}</p>
                <p className="text-xs text-muted-foreground">Higher = more buffers</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Belonging</p>
                <p className="text-2xl font-semibold text-primary">{result.perceivedBelonging}</p>
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
            <Shield className="h-5 w-5" />
            Formula
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Loneliness risk score</strong> blends low interaction frequency, low belonging, high time alone, and high digital skew into a 0â€“100 indicator.
          </p>
          <p>
            <strong>Protection score</strong> rewards higher belonging, more meaningful interactions, and a greater share of in-person or deeper connections.
          </p>
          <p>
            The goal is not to prescribe a â€œcorrectâ€ lifestyle but to highlight patterns that might influence how lonely you feel.
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
                <p className="text-sm text-muted-foreground">Alone-time ratio</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.timeSpentAloneHours / 168).toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">Portion of week</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Digital skew</p>
                <p className="text-xl font-semibold text-primary">
                  {result.digitalOnlyConnectionsPercent}%
                </p>
                <p className="text-xs text-muted-foreground">Digital-only connections</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Interactions/day</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.meaningfulInteractionsPerWeek / 7).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Approximate</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your connection data to see additional metrics.</p>
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
        <meta itemProp="name" content="Loneliness Risk: Understanding Social Health in a Connected World" />
        <meta itemProp="description" content="Reflect on your connection patterns, sense of belonging, and alone time to better understand loneliness risk and next steps." />
        <meta itemProp="keywords" content="loneliness risk index, social connection, belonging, time alone, digital relationships" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-loneliness-risk-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Loneliness Risk: A Gentle Check-In on Your Social Health
        </h1>
        <p className="text-lg italic text-gray-700">
          Learn how connection frequency, belonging, alone time, and digital patterns combine to influence lonelinessâ€”and what you can do about it.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#why-loneliness-matters" className="hover:underline">Why Loneliness Matters for Health</a></li>
          <li><a href="#quantity-vs-quality" className="hover:underline">Quantity vs. Quality of Connections</a></li>
          <li><a href="#digital-age" className="hover:underline">Loneliness in the Digital Age</a></li>
          <li><a href="#building-belonging" className="hover:underline">Building Belonging Slowly</a></li>
          <li><a href="#getting-help" className="hover:underline">When to Reach Out for Help</a></li>
        </ul>
        <hr />

        <h2 id="why-loneliness-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Why Loneliness Matters for Health
        </h2>
        <p>
          Chronic loneliness is linked to higher risks of depression, anxiety, cardiovascular issues, and reduced longevity. Acknowledging it is a brave first step toward change.
        </p>

        <h2 id="quantity-vs-quality" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Quantity vs. Quality of Connections
        </h2>
        <p>
          A few deep, reliable relationships can be more protective than dozens of shallow ones. The goal is to cultivate both enough contact and enough depth.
        </p>

        <h2 id="digital-age" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Loneliness in the Digital Age
        </h2>
        <p>
          Social media can connect and isolate. Intentional useâ€”messaging friends, joining interest groups, or video callsâ€”tends to help more than endless scrolling.
        </p>

        <h2 id="building-belonging" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Building Belonging Slowly
        </h2>
        <p>
          Belonging often grows from repeated small interactions: showing up, contributing, listening, and letting others see you over time.
        </p>

        <h2 id="getting-help" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          When to Reach Out for Help
        </h2>
        <p>
          If loneliness feels overwhelming, persistent, or tied to safety concerns, it is important to talk with a professional or trusted support line. You do not have to navigate it alone.
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Social health is a core part of overall wellbeing. This index offers a starting point for gentle awareness and small, practical steps toward more connected days.
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
            This calculator provides general wellness insights about loneliness tendency and protective factors using a
            few simple social health inputs. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>It outputs a loneliness tendency score, protection score, qualitative status, recommendations, an action plan, and supporting metrics.</p>
          <p>Guide content, formulas, and FAQs make its reasoning transparent to both humans and AI assistants.</p>
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


