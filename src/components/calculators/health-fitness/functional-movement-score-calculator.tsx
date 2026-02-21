'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Zap, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  squatScore: z.number({ invalid_type_error: 'Enter squat score' }).min(0).max(3),
  hurdleStepScore: z.number({ invalid_type_error: 'Enter hurdle step score' }).min(0).max(3),
  inlineLungeScore: z.number({ invalid_type_error: 'Enter inline lunge score' }).min(0).max(3),
  shoulderMobilityScore: z.number({ invalid_type_error: 'Enter shoulder mobility score' }).min(0).max(3),
  activeStraightLegScore: z.number({ invalid_type_error: 'Enter active straight leg score' }).min(0).max(3),
  trunkStabilityScore: z.number({ invalid_type_error: 'Enter trunk stability score' }).min(0).max(3),
  rotaryStabilityScore: z.number({ invalid_type_error: 'Enter rotary stability score' }).min(0).max(3),
  painPresence: z.enum(['yes', 'no']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  movementScore: number;
  movementLevel: string;
  riskCategory: string;
  status: 'excellent' | 'good' | 'moderate' | 'poor';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter score (0-3) for deep squat movement pattern.',
  'Enter score (0-3) for hurdle step movement pattern.',
  'Enter score (0-3) for inline lunge movement pattern.',
  'Enter score (0-3) for shoulder mobility assessment.',
  'Enter score (0-3) for active straight leg raise.',
  'Enter score (0-3) for trunk stability push-up.',
  'Enter score (0-3) for rotary stability test.',
  'Optionally indicate if pain was present during testing.',
  'Review functional movement score, risk category, and recommendations.',
];

const faqs = [
  {
    question: 'What is functional movement screening?',
    answer:
      'Functional movement screening (FMS) assesses seven fundamental movement patterns to identify limitations, asymmetries, and movement quality issues. It helps predict injury risk and guides corrective exercise programming.',
  },
  {
    question: 'What do the scores mean?',
    answer:
      'Scores range 0-3: 3 = perfect movement pattern, 2 = movement completed with compensation, 1 = unable to complete movement, 0 = pain during movement. Higher total scores indicate better movement quality and lower injury risk.',
  },
  {
    question: 'What is a good functional movement score?',
    answer:
      'Scores: 18-21 = Excellent (low risk), 15-17 = Good (moderate risk), 13-14 = Moderate (higher risk), below 13 = Poor (high risk). Scores below 14 or with pain indicate need for corrective exercise.',
  },
  {
    question: 'What if I have pain during testing?',
    answer:
      'Pain during any movement pattern (score of 0) is a critical finding requiring medical evaluation before training. Do not train through pain. Address underlying issues with healthcare provider before continuing.',
  },
  {
    question: 'What are movement asymmetries?',
    answer:
      'Asymmetries occur when left and right sides score differently on the same test. Asymmetries increase injury risk and should be addressed through corrective exercise targeting the weaker side.',
  },
  {
    question: 'How can I improve my functional movement score?',
    answer:
      'Improve through: corrective exercise for identified limitations, mobility work for restricted joints, stability training for weak areas, movement pattern practice, and addressing asymmetries. Work with qualified professional for personalized program.',
  },
  {
    question: 'How often should I retest?',
    answer:
      'Retest every 4-8 weeks during corrective exercise phases, or quarterly for maintenance. More frequent testing helps track progress. Significant improvements typically occur within 8-12 weeks of consistent corrective work.',
  },
  {
    question: 'Can functional movement predict injury?',
    answer:
      'Yes. Lower FMS scores correlate with higher injury risk. Scores below 14 significantly increase injury risk. Addressing movement limitations through corrective exercise can reduce injury risk by improving movement quality.',
  },
  {
    question: 'What if I score perfectly?',
    answer:
      'Perfect scores (21/21) indicate excellent movement quality and low injury risk. Maintain through continued movement training, mobility work, and avoiding compensatory patterns. Even elite athletes rarely score perfect across all patterns.',
  },
  {
    question: 'How does this relate to sports performance?',
    answer:
      'Better functional movement scores often correlate with improved performance. Efficient movement patterns allow better power transfer, reduced energy waste, and improved athletic movement. Addressing limitations can enhance performance.',
  },
];

const relatedCalculators = [
  {
    name: 'Core Strength Balance Wellness Calculator',
    slug: 'core-strength-balance-calculator',
    description: 'Get wellness insights about core strength that supports functional movement.',
  },
  {
    name: 'Muscular Imbalance Ratio Wellness Calculator',
    slug: 'muscular-imbalance-ratio-calculator',
    description: 'Get wellness insights about muscular imbalances affecting movement patterns.',
  },
  {
    name: 'Posture Progress Wellness Tracker',
    slug: 'posture-correction-progress-calculator',
    description: 'Get wellness insights about posture improvements related to functional movement.',
  },
  {
    name: 'Warmup Time Wellness Planner',
    slug: 'injury-prevention-warmup-time-calculator',
    description: 'Get wellness insights about including movement preparation in warmup routine.',
  },
];

const baseUrl = 'https://mycalculating.com/health-fitness/functional-movement-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Functional Movement Wellness Score', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Functional Movement Wellness Score',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Get general wellness insights about functional movement score based on seven fundamental movement patterns. This is a personal lifestyle insight, not a medical evaluation.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  const scores = [
    values.squatScore,
    values.hurdleStepScore,
    values.inlineLungeScore,
    values.shoulderMobilityScore,
    values.activeStraightLegScore,
    values.trunkStabilityScore,
    values.rotaryStabilityScore,
  ];
  
  const movementScore = scores.reduce((sum, score) => sum + score, 0);
  
  // Check for pain
  const hasPain = scores.includes(0) || values.painPresence === 'yes';
  
  let status: ResultPayload['status'] = 'good';
  let movementLevel = 'Good';
  let riskCategory = 'Moderate Tendency';
  let interpretation = 'This suggests a general lifestyle tendency where your functional movement score indicates good movement quality with moderate movement considerations.';
  
  if (hasPain) {
    status = 'poor';
    movementLevel = 'Poor (Pain Present)';
    riskCategory = 'High Tendency - Professional Discussion Recommended';
    interpretation = 'Pain was present during testing. You may consider discussing with a qualified professional before continuing training. This is a personal insight, not a medical evaluation.';
  } else if (movementScore >= 18) {
    status = 'excellent';
    movementLevel = 'Excellent';
    riskCategory = 'Low Tendency';
    interpretation = 'This suggests a general lifestyle tendency where your functional movement score is excellent. You may demonstrate high-quality movement patterns and low movement considerations.';
  } else if (movementScore >= 15) {
    status = 'good';
    movementLevel = 'Good';
    riskCategory = 'Moderate Tendency';
    interpretation = 'This suggests a general lifestyle tendency where your functional movement score is good. Minor limitations may exist that could benefit from corrective exercise.';
  } else if (movementScore >= 13) {
    status = 'moderate';
    movementLevel = 'Moderate';
    riskCategory = 'Higher Tendency';
    interpretation = 'This suggests a general lifestyle tendency where your functional movement score indicates moderate limitations. You may consider corrective exercise to address movement quality issues and support wellness.';
  } else {
    status = 'poor';
    movementLevel = 'Poor';
    riskCategory = 'High Tendency';
    interpretation = 'This suggests a general lifestyle tendency where your functional movement score indicates significant limitations. You may consider corrective exercise to improve movement quality and support wellness.';
  }
  
  const recommendations = [
    'You may consider addressing movement limitations through corrective exercise targeting identified weak patterns. Work with qualified professional for personalized program. This is a personal insight, not a medical evaluation.',
    'You may consider focusing on mobility work for restricted joints and stability training for weak areas identified in screening.',
    'You may consider retesting every 4-8 weeks to track improvements. Significant progress typically occurs within 8-12 weeks of consistent corrective work.',
  ];
  if (hasPain) {
    recommendations.push('Pain during movement may require discussion with a qualified professional. You may consider not continuing training until pain is addressed and discussed with a healthcare provider.');
  }
  if (movementScore < 14) {
    recommendations.push('Score below 14 may indicate higher movement considerations. You may consider prioritizing corrective exercise before increasing training intensity or volume.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'You may consider completing functional movement screening if not done. Identify specific movement limitations and asymmetries.' },
    { label: 'This Month', detail: 'You may consider implementing corrective exercise program targeting identified limitations. Focus on improving lowest-scoring movements first.' },
    { label: 'Ongoing', detail: 'You may consider continuing corrective work and retesting every 4-8 weeks. Maintain movement quality through consistent mobility and stability training.' },
  ];
  
  return { movementScore, movementLevel, riskCategory, status, interpretation, recommendations, plan };
};

export default function FunctionalMovementScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      squatScore: undefined,
      hurdleStepScore: undefined,
      inlineLungeScore: undefined,
      shoulderMobilityScore: undefined,
      activeStraightLegScore: undefined,
      trunkStabilityScore: undefined,
      rotaryStabilityScore: undefined,
      painPresence: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="functional-movement-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Functional Movement Wellness Score
          </CardTitle>
          <CardDescription>Get general wellness insights about functional movement score based on seven fundamental movement patterns. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your movement scores</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="squatScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deep squat score (0-3)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hurdleStepScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hurdle step score (0-3)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inlineLungeScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inline lunge score (0-3)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shoulderMobilityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shoulder mobility score (0-3)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="activeStraightLegScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Active straight leg raise score (0-3)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trunkStabilityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trunk stability push-up score (0-3)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rotaryStabilityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rotary stability score (0-3)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="painPresence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pain present during testing? (optional)</FormLabel>
                      <FormControl>
                        <select value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.value as FormValues['painPresence'])} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="">Select</option>
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate movement score
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
            <CardDescription>See functional movement score, risk category, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Movement score</p>
                <p className="text-2xl font-semibold text-primary">{result.movementScore}/21</p>
                <p className="text-xs text-muted-foreground">Out of 21</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Movement level</p>
                <p className="text-2xl font-semibold text-primary">{result.movementLevel}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Movement tendency</p>
                <p className="text-lg font-semibold text-primary">{result.riskCategory}</p>
                <p className="text-xs text-muted-foreground">Movement considerations</p>
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
                    <TrendingUp className="h-4 w-4" />
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
            <strong>Movement score</strong> = Sum of all 7 movement pattern scores (each 0-3, total 0-21).
          </p>
          <p>
            <strong>Scoring</strong>: 3 = Perfect movement, 2 = Movement with compensation, 1 = Unable to complete, 0 = Pain present.
          </p>
          <p>
            <strong>Score interpretation</strong>: 18-21 = Excellent (low risk), 15-17 = Good (moderate risk), 13-14 = Moderate (higher risk), below 13 = Poor (high risk).
          </p>
          <p>
            <strong>Pain presence</strong>: Any score of 0 or pain reported requires medical evaluation before continuing training.
          </p>
          <p>Functional movement screening assesses seven fundamental patterns: deep squat, hurdle step, inline lunge, shoulder mobility, active straight leg raise, trunk stability push-up, and rotary stability. Lower scores indicate movement limitations and higher injury risk.</p>
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
                <Link href={`/health-fitness/${calc.slug}`} className="text-primary hover:underline">
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
          <CardTitle>Complete guide snapshot</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm dark:prose-invert max-w-none">
          <p>Functional movement screening assesses seven fundamental movement patterns to identify limitations, asymmetries, and movement quality issues. It helps predict injury risk and guides corrective exercise programming.</p>
          <p>Use this calculator to assess functional movement score by entering scores (0-3) for each of the seven movement patterns. Lower scores indicate movement limitations and higher injury risk requiring corrective exercise.</p>
        </CardContent>
      </Card>
      
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
          <p>This tool provides general wellness insights about functional movement score based on seven movement pattern scores (0-3 each) and optional pain presence indicator. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include movement score (0-21), movement level, movement tendency category, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
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

