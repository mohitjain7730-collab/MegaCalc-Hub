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
  cognitiveEmpathy: z.number({ invalid_type_error: 'Enter cognitive empathy' }).min(0).max(10),
  emotionalEmpathy: z.number({ invalid_type_error: 'Enter emotional empathy' }).min(0).max(10),
  perspectiveTaking: z.number({ invalid_type_error: 'Enter perspective taking' }).min(0).max(10),
  boundariesClarity: z.number({ invalid_type_error: 'Enter boundaries clarity' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  cognitiveEmpathy: number;
  emotionalEmpathy: number;
  perspectiveTaking: number;
  boundariesClarity: number;
  empathyQuotient: number;
  balanceIndex: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate how easily you understand what others might be thinking (cognitive empathy, 0–10).',
  'Rate how strongly you feel others’ emotions in your own body (emotional empathy, 0–10).',
  'Rate how often you can see a situation from multiple sides (perspective taking, 0–10).',
  'Rate how clear and healthy your personal boundaries feel (0–10).',
  'Review your empathy quotient, balance index, and suggested adjustments.',
];

const faqs = [
  {
    question: 'What is the Empathy Quotient Calculator?',
    answer:
      'It is a self-reflection tool that estimates your empathy tendencies across understanding thoughts, feeling emotions, and taking perspectives—while checking boundary balance.',
  },
  {
    question: 'Is high empathy always good?',
    answer:
      'Empathy is powerful, but without boundaries it can lead to burnout, resentment, or difficulty saying no.',
  },
  {
    question: 'How is this different from clinical empathy scales?',
    answer:
      'This is a simplified, informal tool for personal insight, not a validated psychological assessment.',
  },
  {
    question: 'What is cognitive vs emotional empathy?',
    answer:
      'Cognitive empathy is understanding what someone might think; emotional empathy is feeling some of what they feel in your own body.',
  },
  {
    question: 'Why include boundaries?',
    answer:
      'Healthy empathy includes the ability to care while still recognizing where you end and others begin.',
  },
  {
    question: 'Can empathy be strengthened?',
    answer:
      'Yes. Practices like perspective-taking exercises, listening skills, and compassion training can grow empathy over time.',
  },
  {
    question: 'Can too much empathy be draining?',
    answer:
      'Yes. People who feel emotions intensely may need stronger boundaries and self-care to avoid emotional overload.',
  },
  {
    question: 'How often should I use this?',
    answer:
      'Occasionally—before or after big relational seasons, or when you are working on communication and connection skills.',
  },
  {
    question: 'Does low empathy mean I am a bad person?',
    answer:
      'No. Empathy is shaped by temperament, experiences, and safety. It can be developed, and many caring people learn connection through structure rather than emotion alone.',
  },
  {
    question: 'Can this help with work or leadership?',
    answer:
      'Yes. Understanding your empathy style can inform how you listen, give feedback, and protect your own energy.',
  },
];

const relatedCalculators = [
  {
    name: 'Relationship Satisfaction Score',
    slug: 'relationship-satisfaction-score',
    description: 'Explore how empathy relates to relationship quality.',
  },
  {
    name: 'Loneliness Risk Index',
    slug: 'loneliness-risk-index',
    description: 'Understand social patterns that interact with empathy.',
  },
  {
    name: 'Positive Emotion Ratio Calculator',
    slug: 'positive-emotion-ratio-calculator',
    description: 'Balance empathy work with positive emotion practices.',
  },
  {
    name: 'Stress Hormone Balance Calculator',
    slug: 'stress-hormone-balance-calculator',
    description: 'Check stress physiology that may impact emotional bandwidth.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/empathy-quotient-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Empathy Wellness Quotient Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Empathy Wellness Quotient Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description:
        'Get general wellness insights about empathy tendencies from cognitive empathy, emotional empathy, perspective taking, and boundary clarity. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { cognitiveEmpathy, emotionalEmpathy, perspectiveTaking, boundariesClarity } = values;

  const baseEmpathy = (cognitiveEmpathy + emotionalEmpathy + perspectiveTaking) / 3;
  const empathyQuotient = clamp(baseEmpathy * 10, 0, 100);

  const imbalance = Math.abs(emotionalEmpathy - boundariesClarity); // large gap => risk of overload
  const balanceIndex = clamp(100 - imbalance * 7, 0, 100);

  let status: ResultPayload['status'] = 'good';
  let interpretation =
    'This suggests a general lifestyle tendency where you may show a broadly balanced empathy profile with a mix of understanding, feeling, and boundaries.';

  if (empathyQuotient < 30) {
    status = 'low';
    interpretation =
      'This suggests a general lifestyle tendency where your self‑reported empathy may feel more structured or logic‑based than emotionally attuned. You may consider gentle perspective‑taking or listening practices if you wish to explore this area. This is a personal insight, not a medical evaluation.';
  } else if (empathyQuotient >= 70 && balanceIndex < 50) {
    status = 'moderate';
    interpretation =
      'This suggests a general lifestyle tendency where empathy may feel strong while boundaries sometimes feel softer. You may notice feeling more emotionally tired at times, and gentle boundary skills could help your empathy feel more sustainable.';
  } else if (empathyQuotient >= 70 && balanceIndex >= 70) {
    status = 'optimal';
    interpretation =
      'This suggests a general lifestyle tendency where you may experience high empathy with relatively clear boundaries—a mix that can support caring in a way that also protects your energy.';
  }

  const recommendations: string[] = [
    'Notice how your body feels after emotionally intense conversations and schedule decompression time if needed.',
    'Practice summarizing what you heard (“So what I\'m hearing is…”) to strengthen cognitive empathy and clarity.',
    'Check in with yourself before agreeing to support others: do you have enough capacity right now?',
  ];

  if (emotionalEmpathy >= 7 && boundariesClarity <= 5) {
    recommendations.push('Explore boundary-setting skills, such as saying “I wish I could help more, here is what I can realistically offer.”');
  }

  if (cognitiveEmpathy < 5) {
    recommendations.push('Practice perspective-taking by imagining situations from at least two other points of view, especially before reacting.');
  }

  const plan = [
    { label: 'This Week', detail: 'Pay attention to one interaction per day and reflect on what the other person might have needed emotionally.' },
    { label: 'This Month', detail: 'Experiment with at least one new boundary phrase or limit that protects your energy while staying kind.' },
    { label: 'Ongoing', detail: 'Revisit empathy and boundary scores periodically as relationships, work roles, or stress levels change.' },
  ];

  return {
    cognitiveEmpathy,
    emotionalEmpathy,
    perspectiveTaking,
    boundariesClarity,
    empathyQuotient: Number(empathyQuotient.toFixed(1)),
    balanceIndex: Number(balanceIndex.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function EmpathyQuotientCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cognitiveEmpathy: undefined,
      emotionalEmpathy: undefined,
      perspectiveTaking: undefined,
      boundariesClarity: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="empathy-quotient-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Empathy Wellness Quotient Calculator
          </CardTitle>
          <CardDescription>
            Get general wellness insights about your empathy style and boundary balance. This is a personal lifestyle
            insight, not a medical evaluation.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your empathy data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cognitiveEmpathy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cognitive empathy (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emotionalEmpathy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emotional empathy (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="perspectiveTaking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perspective taking (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="boundariesClarity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Boundaries clarity (0–10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate empathy quotient
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
            <CardDescription>See empathy quotient, balance, and coaching prompts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Empathy quotient</p>
                <p className="text-2xl font-semibold text-primary">{result.empathyQuotient}</p>
                <p className="text-xs text-muted-foreground">0–100 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Balance index</p>
                <p className="text-2xl font-semibold text-primary">{result.balanceIndex}</p>
                <p className="text-xs text-muted-foreground">Higher = better balance</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average empathy</p>
                <p className="text-2xl font-semibold text-primary">
                  {((result.cognitiveEmpathy + result.emotionalEmpathy + result.perspectiveTaking) / 3).toFixed(1)}
                </p>
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
            <strong>Empathy quotient</strong> is the average of cognitive empathy, emotional empathy, and perspective taking, scaled to a 0–100 index.
          </p>
          <p>
            <strong>Balance index</strong> subtracts the gap between emotional empathy and boundary clarity from 100; large gaps reduce balance and indicate overload risk.
          </p>
          <p>Use these numbers as prompts for reflection and skill-building, not as fixed labels.</p>
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
                <p className="text-sm text-muted-foreground">Emotion–boundary gap</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.abs(result.emotionalEmpathy - result.boundariesClarity).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Larger gap = more risk</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cognitive vs emotional</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.cognitiveEmpathy - result.emotionalEmpathy).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">Positive = more cognitive</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Perspective taking strength</p>
                <p className="text-xl font-semibold text-primary">
                  {(result.perspectiveTaking / 10 * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Relative to max</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your empathy data to see additional metrics.</p>
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
        <meta itemProp="name" content="Empathy and Boundaries: Caring Without Burning Out" />
        <meta itemProp="description" content="Reflect on your empathy style, learn why boundaries matter, and explore practices that support sustainable compassion." />
        <meta itemProp="keywords" content="empathy quotient, emotional empathy, cognitive empathy, boundaries, compassion fatigue" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-empathy-quotient-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">
          Empathy and Boundaries: Finding a Sustainable Way to Care
        </h1>
        <p className="text-lg italic text-gray-700">
          Understand different types of empathy, why boundaries protect both you and others, and how to grow compassion without losing yourself.
        </p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#types-of-empathy" className="hover:underline">Types of Empathy</a></li>
          <li><a href="#role-of-boundaries" className="hover:underline">The Role of Boundaries</a></li>
          <li><a href="#growing-empathy" className="hover:underline">Growing Empathy Skills</a></li>
          <li><a href="#avoiding-burnout" className="hover:underline">Avoiding Empathy Burnout</a></li>
          <li><a href="#reflection-prompts" className="hover:underline">Reflection Prompts</a></li>
        </ul>
        <hr />

        <h2 id="types-of-empathy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Types of Empathy
        </h2>
        <p>
          Cognitive, emotional, and compassionate empathy each play different roles in relationships. Understanding your strengths helps you adapt to different contexts.
        </p>

        <h2 id="role-of-boundaries" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          The Role of Boundaries
        </h2>
        <p>
          Boundaries are not walls; they are agreements about what you can and cannot offer. They make empathy safer and more honest over time.
        </p>

        <h2 id="growing-empathy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Growing Empathy Skills
        </h2>
        <p>
          Listening without interrupting, summarizing what you heard, and asking open-ended questions are powerful empathy muscles you can train.
        </p>

        <h2 id="avoiding-burnout" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Avoiding Empathy Burnout
        </h2>
        <p>
          Caring for others is easier to sustain when you include rest, supervision or peer support, and activities that replenish your own emotional reserves.
        </p>

        <h2 id="reflection-prompts" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Reflection Prompts
        </h2>
        <p>
          Try questions like: “When do I feel most connected?” “When do I feel drained?” “What boundary, if I set it, would make my empathy feel safer?”
        </p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">
          Conclusion
        </h2>
        <p>
          Empathy is a skill and a resource. This calculator offers a snapshot of how you use it today so you can intentionally grow, protect, and direct it.
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
            This tool provides general wellness insights about empathy style and boundary balance using four simple
            self‑ratings. This is a personal lifestyle insight, not a medical evaluation.
          </p>
          <p>Outputs include an empathy quotient, balance index, qualitative status, recommendations, an action plan, and supporting metrics.</p>
          <p>Guide content and FAQs explain the concepts so humans and AI assistants can interpret the scores safely.</p>
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


