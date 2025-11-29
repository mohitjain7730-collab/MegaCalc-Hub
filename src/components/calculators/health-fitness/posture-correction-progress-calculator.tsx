'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TrendingUp, Zap, Target, Shield, Activity } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  initialPostureScore: z.number({ invalid_type_error: 'Enter initial posture score' }).min(1).max(10),
  currentPostureScore: z.number({ invalid_type_error: 'Enter current posture score' }).min(1).max(10),
  weeksOfTraining: z.number({ invalid_type_error: 'Enter weeks of training' }).min(1).max(104),
  painLevel: z.number({ invalid_type_error: 'Enter pain level' }).min(0).max(10).optional(),
  flexibilityScore: z.number({ invalid_type_error: 'Enter flexibility score' }).min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  improvementScore: number;
  progressPercentage: number;
  progressRate: string;
  status: 'excellent' | 'good' | 'moderate' | 'slow';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter initial posture score (1-10, from when you started training).',
  'Enter current posture score (1-10, your current assessment).',
  'Enter weeks of training since starting posture correction.',
  'Optionally enter current pain level (0-10) and flexibility score (1-10).',
  'Review improvement score, progress percentage, progress rate, and recommendations.',
];

const faqs = [
  {
    question: 'What is posture correction progress?',
    answer:
      'Posture correction progress measures improvement in postural alignment over time. It tracks changes in posture quality, pain reduction, flexibility, and functional movement patterns through targeted exercises and habit changes.',
  },
  {
    question: 'How do I assess my posture score?',
    answer:
      'Assess posture by: standing against a wall (shoulders, hips, head contact), side-view photos (ear over shoulder over hip), forward head position, rounded shoulders, and overall alignment. Rate overall posture quality 1-10.',
  },
  {
    question: 'How long does posture correction take?',
    answer:
      'Posture correction is a gradual process. Noticeable improvements typically occur in 4-8 weeks with consistent training. Significant corrections may take 3-6 months. Maintenance is ongoing. Progress varies by individual and severity.',
  },
  {
    question: 'What affects posture correction speed?',
    answer:
      'Factors include: consistency of training, severity of initial posture issues, age, daily habits (desk work, phone use), exercise quality, pain levels, flexibility improvements, and addressing underlying causes (weakness, tightness).',
  },
  {
    question: 'What exercises help correct posture?',
    answer:
      'Posture correction includes: strengthening weak muscles (upper back, core, glutes), stretching tight muscles (chest, hip flexors, neck), mobility work (thoracic spine, hips), and ergonomic adjustments (workstation setup, movement patterns).',
  },
  {
    question: 'Can posture be corrected?',
    answer:
      'Yes. Most postural issues are functional (not structural) and can be improved with consistent training. Even structural issues can be significantly improved. Progress requires patience, consistency, and addressing root causes (muscle imbalances, habits).',
  },
  {
    question: 'How does pain relate to posture progress?',
    answer:
      'Pain reduction often correlates with posture improvement. Reduced pain (especially neck, back, shoulders) indicates positive changes. However, some discomfort during initial correction is normal as muscles adapt. Persistent or worsening pain needs professional evaluation.',
  },
  {
    question: 'What about flexibility?',
    answer:
      'Flexibility improvements often accompany posture correction. Increased flexibility in tight areas (chest, hip flexors, hamstrings) allows better alignment. Flexibility score improvements indicate positive progress in posture correction.',
  },
  {
    question: 'How do I maintain posture improvements?',
    answer:
      'Maintain improvements through: ongoing strength training for postural muscles, regular stretching, ergonomic workspace setup, movement breaks during sedentary periods, mindful posture throughout day, and continued core stability work.',
  },
  {
    question: 'When should I see a professional?',
    answer:
      'See a physical therapist or posture specialist if: progress stalls for months, pain increases or persists, structural issues suspected, or you need personalized assessment and program. Professional guidance can accelerate and ensure safe progress.',
  },
];

const relatedCalculators = [
  {
    name: 'Core Strength Balance Calculator',
    slug: 'core-strength-balance-calculator',
    description: 'Assess core strength that supports posture correction.',
  },
  {
    name: 'Training Fatigue Index Calculator',
    slug: 'training-fatigue-index-calculator',
    description: 'Manage training load during posture correction.',
  },
  {
    name: 'Injury Prevention Warmup Time Calculator',
    slug: 'injury-prevention-warmup-time-calculator',
    description: 'Include posture exercises in warmup routine.',
  },
  {
    name: 'Nutrient Absorption Efficiency Calculator',
    slug: 'nutrient-absorption-efficiency-calculator',
    description: 'Support recovery with optimal nutrition.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/posture-correction-progress-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Posture Correction Progress Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Posture Correction Progress Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate posture correction progress based on initial and current posture scores, weeks of training, pain level, and flexibility to track improvement and guide training.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate improvement
  const improvement = values.currentPostureScore - values.initialPostureScore;
  
  // Calculate progress percentage (based on potential improvement to 10)
  const potentialImprovement = 10 - values.initialPostureScore;
  const progressPercentage = potentialImprovement > 0 ? (improvement / potentialImprovement) * 100 : 0;
  
  // Calculate progress rate (improvement per week)
  const progressRate = improvement / values.weeksOfTraining;
  
  // Base improvement score
  let improvementScore = improvement * 10; // Scale to 0-100
  
  // Adjust for training duration (faster progress = higher score)
  if (values.weeksOfTraining <= 4) {
    improvementScore *= 1.2; // Bonus for early progress
  } else if (values.weeksOfTraining <= 8) {
    improvementScore *= 1.1; // Slight bonus
  } else if (values.weeksOfTraining > 24) {
    improvementScore *= 0.9; // Slight penalty for slow progress
  }
  
  // Adjust for pain reduction (if provided)
  if (values.painLevel !== undefined && values.initialPostureScore < 6) {
    // Assume initial pain was high if initial posture was poor
    const painReductionBonus = (10 - values.painLevel) * 2;
    improvementScore += painReductionBonus;
  }
  
  // Adjust for flexibility improvement (if provided)
  if (values.flexibilityScore !== undefined) {
    const flexibilityBonus = (values.flexibilityScore - 5) * 1.5;
    improvementScore += flexibilityBonus;
  }
  
  improvementScore = clamp(improvementScore, 0, 100);
  
  let status: ResultPayload['status'] = 'good';
  let progressRateLabel = 'Good';
  let interpretation = 'Your posture correction progress is good. Continue with consistent training and habit adjustments.';
  
  if (progressRate >= 0.15 || progressPercentage >= 50) {
    status = 'excellent';
    progressRateLabel = 'Excellent';
    interpretation = 'Your posture correction progress is excellent. You\'re making rapid improvements. Continue your current approach.';
  } else if (progressRate >= 0.08 || progressPercentage >= 30) {
    status = 'good';
    progressRateLabel = 'Good';
  } else if (progressRate >= 0.04 || progressPercentage >= 15) {
    status = 'moderate';
    progressRateLabel = 'Moderate';
    interpretation = 'Your posture correction progress is moderate. Consider increasing training frequency or adjusting your approach.';
  } else {
    status = 'slow';
    progressRateLabel = 'Slow';
    interpretation = 'Your posture correction progress is slower than expected. Review your program, increase consistency, or consider professional guidance.';
  }
  
  const recommendations = [
    'Maintain consistent training: posture correction requires regular exercise (4-5x/week) targeting weak postural muscles and stretching tight areas.',
    'Address daily habits: improve workstation ergonomics, take movement breaks, reduce forward head posture during phone/computer use.',
    'Focus on key areas: strengthen upper back/rhomboids, stretch chest/hip flexors, improve thoracic spine mobility, strengthen core and glutes.',
  ];
  if (progressRate < 0.05) {
    recommendations.push('Progress is slower than expected. Consider: increasing training frequency, improving exercise form, addressing root causes (work habits, sleep position), or consulting a physical therapist.');
  }
  if (values.painLevel !== undefined && values.painLevel > 5) {
    recommendations.push('Address pain management. High pain levels may indicate need for professional evaluation or program adjustments.');
  }
  if (values.flexibilityScore !== undefined && values.flexibilityScore < 6) {
    recommendations.push('Improve flexibility in tight areas. Increased flexibility allows better postural alignment. Include daily stretching for chest, hip flexors, and posterior chain.');
  }
  
  const plan = [
    { label: 'This Week', detail: 'Assess current posture score and compare to initial. Note improvements in alignment, pain, and flexibility.' },
    { label: 'This Month', detail: 'Continue consistent posture training. Track progress weekly. Adjust program based on improvements and any plateaus.' },
    { label: 'Ongoing', detail: 'Maintain posture improvements through ongoing training and habit changes. Posture correction is a long-term process requiring consistency.' },
  ];
  
  return { improvementScore, progressPercentage, progressRate: progressRateLabel, status, interpretation, recommendations, plan };
};

export default function PostureCorrectionProgressCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialPostureScore: undefined,
      currentPostureScore: undefined,
      weeksOfTraining: undefined,
      painLevel: undefined,
      flexibilityScore: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="posture-progress-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Posture Correction Progress Calculator
          </CardTitle>
          <CardDescription>Calculate posture correction progress based on initial and current posture scores, weeks of training, pain level, and flexibility to track improvement and guide training.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your posture data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="initialPostureScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial posture score (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currentPostureScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current posture score (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weeksOfTraining"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weeks of training</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="painLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current pain level (0-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="flexibilityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flexibility score (1-10, optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.5" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate progress
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
            <CardDescription>See posture correction progress, improvement score, and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Improvement score</p>
                <p className="text-2xl font-semibold text-primary">{result.improvementScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Progress percentage</p>
                <p className="text-2xl font-semibold text-primary">{result.progressPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of potential</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Progress rate</p>
                <p className="text-2xl font-semibold text-primary">{result.progressRate}</p>
                <p className="text-xs text-muted-foreground">{result.status}</p>
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
                    <Activity className="h-4 w-4" />
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
            <strong>Improvement</strong> = Current posture score - Initial posture score.
          </p>
          <p>
            <strong>Progress percentage</strong> = (Improvement / Potential improvement) × 100%, where Potential = 10 - Initial score.
          </p>
          <p>
            <strong>Progress rate</strong> = Improvement / Weeks of training (score improvement per week).
          </p>
          <p>
            <strong>Improvement score</strong> = Improvement × 10, adjusted for training duration, pain reduction, and flexibility improvements (clamped 0-100).
          </p>
          <p>
            <strong>Progress rate categories</strong>: Excellent (≥0.15/week or ≥50%), Good (≥0.08/week or ≥30%), Moderate (≥0.04/week or ≥15%), Slow (&lt;0.04/week or &lt;15%).
          </p>
          <p>Posture correction is gradual. Consistent training (4-5x/week) targeting muscle imbalances and daily habit changes typically show noticeable improvements in 4-8 weeks.</p>
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
                <Link href={`/category/health-fitness/${calc.slug}`} className="text-primary hover:underline">
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
          <p>Posture correction is a gradual process that improves postural alignment through targeted exercises, stretching, and habit changes. Tracking progress helps maintain motivation and adjust training approaches.</p>
          <p>Use this calculator to assess posture correction progress by comparing initial and current posture scores, tracking improvement over time, and considering factors like pain reduction and flexibility improvements.</p>
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
          <p>This tool calculates posture correction progress based on initial and current posture scores, weeks of training, pain level, and flexibility score.</p>
          <p>Outputs include improvement score (0-100), progress percentage, progress rate, status, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

