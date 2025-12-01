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
  socialFrequency: z.number({ invalid_type_error: 'Enter frequency score' }).min(0).max(10),
  avoidanceLevel: z.number({ invalid_type_error: 'Enter avoidance score' }).min(0).max(10),
  physicalSymptoms: z.number({ invalid_type_error: 'Enter physical symptom score' }).min(0).max(10),
  safetyBehaviors: z.number({ invalid_type_error: 'Enter safety behavior score' }).min(0).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  socialFrequency: number;
  avoidanceLevel: number;
  physicalSymptoms: number;
  safetyBehaviors: number;
  totalScore: number;
  severityPercent: number;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate how often you worry about social situations (0-10).',
  'Rate how much you avoid or limit social events (0-10).',
  'Rate the intensity of physical symptoms (0-10).',
  'Rate how often you rely on safety behaviors (0-10).',
  'Review the total social anxiety score and recommended coping plan.',
];

const faqs = [
  {
    question: 'What does the Social Anxiety Score measure?',
    answer:
      'The score estimates how frequently social anxiety shows up in thoughts, behaviors, and body responses. It combines cognitive worry, avoidance, physical arousal, and safety behaviors to provide a quick snapshot of severity.',
  },
  {
    question: 'Is this a medical diagnosis?',
    answer:
      'No. This calculator is an educational self-assessment. It does not replace an evaluation by a licensed mental health professional. Use it to understand patterns and track changes over time.',
  },
  {
    question: 'What is considered a high score?',
    answer:
      'Scores below 15 are typically mild, 15-25 moderate, and above 25 indicate significant interference that may benefit from therapy, coaching, or clinical evaluation.',
  },
  {
    question: 'How should I rate safety behaviors?',
    answer:
      'Rate how often you use coping strategies like rehearsed scripts, avoiding eye contact, staying glued to your phone, or needing a support person. Higher scores indicate heavy reliance on safety behaviors.',
  },
  {
    question: 'Can I use this to track progress in therapy?',
    answer:
      'Yes. Completing the estimator weekly or monthly can reveal trends as you practice exposure therapy, CBT skills, or medication changes.',
  },
  {
    question: 'What interventions help with social anxiety?',
    answer:
      'Evidence-based treatments include cognitive behavioral therapy (CBT), exposure exercises, acceptance and commitment therapy (ACT), mindfulness, and in some cases medication prescribed by a psychiatrist.',
  },
  {
    question: 'How do physical symptoms influence the score?',
    answer:
      'Physical symptoms such as rapid heartbeat, sweating, shaking, or gastrointestinal discomfort often amplify perceived threat. High symptom scores suggest adding somatic regulation skills (breathing, progressive relaxation).',
  },
  {
    question: 'What if my avoidance level is low but anxiety is high?',
    answer:
      'It means you show resilience by staying engaged even when anxious. The tool highlights where anxiety is strongest so you can target coping strategies without necessarily reducing valued activities.',
  },
  {
    question: 'Should I share results with a therapist?',
    answer:
      'Yes. Bringing your latest score, triggers, and notes to therapy sessions can accelerate treatment planning and help evaluate interventions.',
  },
  {
    question: 'How often should I retake the estimator?',
    answer:
      'Use it anytime symptoms shift, after stressful periods, or monthly as part of ongoing mental health monitoring. Consistent tracking reveals meaningful patterns.',
  },
];

const relatedCalculators = [
  {
    name: 'Emotional Burnout Recovery Calculator',
    slug: 'emotional-burnout-recovery-calculator',
    description: 'Estimate recovery timelines from chronic stress and burnout.',
  },
  {
    name: 'Cognitive Load Estimator',
    slug: 'cognitive-load-estimator',
    description: 'Evaluate mental workload drivers across tasks and environments.',
  },
  {
    name: 'Gratitude & Mood Correlation Tracker',
    slug: 'gratitude-mood-correlation-tracker',
    description: 'Track how daily gratitude shifts mood trends.',
  },
  {
    name: 'Phone Dependency Index',
    slug: 'phone-dependency-index',
    description: 'Measure smartphone reliance and digital wellbeing.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/social-anxiety-score-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Social Anxiety Score Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Social Anxiety Score Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate social anxiety severity from thought frequency, avoidance, physical symptoms, and safety behaviors.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const { socialFrequency, avoidanceLevel, physicalSymptoms, safetyBehaviors } = values;

  const totalScore = socialFrequency * 0.3 + avoidanceLevel * 0.25 + physicalSymptoms * 0.25 + safetyBehaviors * 0.2;
  const severityPercent = clamp((totalScore / 10) * 100, 0, 100);

  let status: ResultPayload['status'] = 'optimal';
  let interpretation = 'Your current social anxiety markers indicate manageable levels. Maintain coping strategies and social exposure.';

  if (totalScore >= 8) {
    status = 'low';
    interpretation = 'Indicators suggest severe social anxiety interference. Consider formal treatment, structured exposure therapy, or a clinical consultation.';
  } else if (totalScore >= 6) {
    status = 'moderate';
    interpretation = 'Symptoms are pronounced and likely disrupting daily life. Structured coping plans, skills training, and professional support are recommended.';
  } else if (totalScore >= 4) {
    status = 'good';
    interpretation = 'Mild-to-moderate anxiety with manageable impact. Continue practicing coping strategies and gradual exposures.';
  }

  const recommendations: string[] = [
    'Document social triggers and thought loops in a daily log to surface recurring patterns.',
    'Practice cognitive reframing: replace catastrophic predictions with balanced probability statements.',
    'Use regulated breathing (4-7-8 or box breathing) before and during social exposures.',
  ];

  if (avoidanceLevel >= 7) {
    recommendations.push('Design a graded exposure ladder: rank feared situations and progress step-by-step, celebrating small wins.');
  }

  if (physicalSymptoms >= 6) {
    recommendations.push('Incorporate somatic regulation (progressive muscle relaxation, paced breathing, light movement) to reduce physiological arousal.');
  }

  if (safetyBehaviors >= 6) {
    recommendations.push('Experiment with dropping one safety behavior per week to build tolerance for uncertainty and social discomfort.');
  }

  if (socialFrequency >= 7) {
    recommendations.push('Schedule planned social practice (community groups, classes, networking) to build exposure consistency rather than avoiding events.');
  }

  const plan = [
    { label: 'This Week', detail: 'Identify two social settings that provoke anxiety and note pre-event thoughts, body sensations, and safety behaviors.' },
    { label: 'This Month', detail: 'Build a gradual exposure hierarchy, practice in controlled doses, and log wins plus lessons learned each attempt.' },
    { label: 'Ongoing', detail: 'Review progress quarterly, adjust coping skills, and seek therapy/peer support when symptoms spike or new stressors appear.' },
  ];

  return {
    socialFrequency,
    avoidanceLevel,
    physicalSymptoms,
    safetyBehaviors,
    totalScore: Number(totalScore.toFixed(1)),
    severityPercent: Number(severityPercent.toFixed(1)),
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function SocialAnxietyScoreEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      socialFrequency: undefined,
      avoidanceLevel: undefined,
      physicalSymptoms: undefined,
      safetyBehaviors: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="social-anxiety-score-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Social Anxiety Score Estimator
          </CardTitle>
          <CardDescription>Estimate social anxiety severity using frequency, avoidance, physical symptoms, and safety behaviors.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your social anxiety data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="socialFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Worry frequency (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="avoidanceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avoidance level (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="physicalSymptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical symptoms intensity (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="safetyBehaviors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Safety behaviors usage (0-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate social anxiety score
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
            <CardDescription>View severity percentage, status, and coping plan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total score</p>
                <p className="text-2xl font-semibold text-primary">{result.totalScore}</p>
                <p className="text-xs text-muted-foreground">0-10 scale</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Severity percent</p>
                <p className="text-2xl font-semibold text-primary">{result.severityPercent}%</p>
                <p className="text-xs text-muted-foreground">Relative intensity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Dominant factor</p>
                <p className="text-2xl font-semibold text-primary">
                  {[
                    { label: 'Thoughts', value: result.socialFrequency },
                    { label: 'Avoidance', value: result.avoidanceLevel },
                    { label: 'Physical', value: result.physicalSymptoms },
                    { label: 'Safety', value: result.safetyBehaviors },
                  ].sort((a, b) => b.value - a.value)[0].label}
                </p>
                <p className="text-xs text-muted-foreground">Largest contributor</p>
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
            <strong>Total score</strong> = (Worry frequency × 0.30) + (Avoidance × 0.25) + (Physical symptoms × 0.25) + (Safety behaviors × 0.20). Each subscale is rated 0-10.
          </p>
          <p>
            <strong>Severity percent</strong> = (Total score ÷ 10) × 100. This normalizes your score to a 0-100% intensity range for easy comparison over time.
          </p>
          <p>
            <strong>Status</strong> tiers help interpret the combined load: 0-3.9 optimal, 4-5.9 good, 6-7.9 moderate, 8+ low (high risk). Use these to decide when extra support is needed.
          </p>
          <p>Social anxiety emerges from the interaction of cognition, avoidance, body sensations, and coping strategies—addressing each lever improves resilience.</p>
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
                <p className="text-sm text-muted-foreground">Cognitive load</p>
                <p className="text-xl font-semibold text-primary">{(result.socialFrequency * 10).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Relative thought intensity</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Behavioral load</p>
                <p className="text-xl font-semibold text-primary">{((result.avoidanceLevel + result.safetyBehaviors) * 5).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Engagement impact</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Somatic load</p>
                <p className="text-xl font-semibold text-primary">{(result.physicalSymptoms * 10).toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Body activation level</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your ratings to reveal additional insights.</p>
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
        <meta itemProp="name" content="Comprehensive Guide to Social Anxiety: Triggers, Coping, and Exposure Planning" />
        <meta itemProp="description" content="Learn how to map social anxiety triggers, build graded exposure plans, reduce avoidance, and monitor progress with evidence-based techniques." />
        <meta itemProp="keywords" content="social anxiety calculator, exposure therapy plan, CBT for social anxiety, coping with panic in public, mental health self-assessment" />
        <meta itemProp="author" content="[Your Site's Health Team]" />
        <meta itemProp="datePublished" content="2025-12-01" />
        <meta itemProp="url" content="/definitive-social-anxiety-guide" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Understanding and Rebuilding Confidence with Social Anxiety</h1>
        <p className="text-lg italic text-gray-700">Break down the mechanics of social anxiety, from intrusive thoughts and somatic cues to exposure planning, compassionate self-talk, and long-term maintenance.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600">
          <li><a href="#mechanics" className="hover:underline">How Social Anxiety Works in the Brain and Body</a></li>
          <li><a href="#triggers" className="hover:underline">Common Triggers and Hidden Accelerants</a></li>
          <li><a href="#exposure" className="hover:underline">Designing an Exposure Ladder You’ll Actually Use</a></li>
          <li><a href="#skills" className="hover:underline">Core Coping Skills: CBT, ACT, and Somatic Tools</a></li>
          <li><a href="#maintenance" className="hover:underline">Maintenance, Relapse Prevention, and Tracking</a></li>
        </ul>
        <hr />

        <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Social Anxiety Works in the Brain and Body</h2>
        <p>Social anxiety originates from perceived social threat: the amygdala flags potential rejection, cortisol spikes, and attention locks onto danger cues. Thoughts like "Everyone will judge me" loop, fueling physical symptoms (sweaty palms, heart racing) and safety behaviors (looking at phones, rehearsed lines). Understanding this loop lets you intervene at different points: thoughts, body cues, or behaviors.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Threat Detection and Prediction Errors</h3>
        <p>The brain prioritizes threat detection. When social memories are paired with embarrassment, the brain overestimates future risk. Exposure therapy purposely creates prediction errors: surviving feared scenarios without disaster rewires threat estimates downwards.</p>

        <h2 id="triggers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Common Triggers and Hidden Accelerants</h2>
        <p>Typical triggers: introductions, being watched, presentations, dating, eating in public, phone calls, unstructured socializing. Hidden accelerants include caffeine, sleep debt, perfectionism loops, and unprocessed past experiences. Mapping both gives clarity on why some days feel harder than others.</p>

        <h2 id="exposure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Designing an Exposure Ladder You’ll Actually Use</h2>
        <p>Start with small, repeatable tasks (ask a stranger for directions, hold eye contact for 5 seconds), then progress to higher stakes (join a networking call, give feedback in meetings). Rate each step 0-10 for anxiety; choose tasks around 4-6 to build momentum. Track outcomes immediately afterward to reinforce learning.</p>

        <h2 id="skills" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Core Coping Skills: CBT, ACT, and Somatic Tools</h2>
        <p>Combine mental skills (thought reframe, acceptance, values anchoring) with somatic regulation (diaphragmatic breathing, progressive relaxation) and behavioral experiments (scheduled exposures). Journaling after exposures cements insights and prevents avoidance from creeping back.</p>

        <h2 id="maintenance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Maintenance, Relapse Prevention, and Tracking</h2>
        <p>Relapse prevention means planning mini exposures weekly, having coping cards, and monitoring metrics like total score, avoidance levels, and gratitude practices. If scores spike for more than two weeks, revisit therapy tools or reach out for extra support.</p>

        <hr />
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Social anxiety is highly treatable when tackled with compassionate awareness, systematic exposure, and skill-building. Use this estimator to quantify progress, spot early warning signs, and stay connected to long-term goals like meaningful relationships and personal leadership.</p>
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
          <p>This tool estimates social anxiety severity from cognitive, behavioral, somatic, and coping inputs.</p>
          <p>Outputs include total score, severity percent, dominant contributors, status, recommendations, action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}


