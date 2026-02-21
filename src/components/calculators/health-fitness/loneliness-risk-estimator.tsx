'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, AlertTriangle, Target, Shield, TrendingDown } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  socialConnections: z.number({ invalid_type_error: 'Enter number of connections' }).min(0).max(50),
  meaningfulRelationships: z.number({ invalid_type_error: 'Enter number of relationships' }).min(0).max(20),
  socialInteractionFrequency: z.number({ invalid_type_error: 'Enter frequency' }).min(1).max(10),
  qualityOfConnections: z.number({ invalid_type_error: 'Enter quality' }).min(1).max(10),
  feelingOfLoneliness: z.number({ invalid_type_error: 'Enter loneliness level' }).min(1).max(10),
  socialSupportAvailable: z.number({ invalid_type_error: 'Enter support level' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  lonelinessRisk: number;
  riskLevel: string;
  socialConnectionScore: number;
  status: 'low-risk' | 'moderate-risk' | 'high-risk' | 'critical-risk';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count number of social connections you have (friends, family, acquaintances).',
  'Count number of meaningful, close relationships (people you feel comfortable confiding in).',
  'Rate frequency of social interactions (1-10, 10 = very frequent).',
  'Rate quality of your social connections (1-10, 10 = excellent, supportive relationships).',
  'Rate your feeling of loneliness (1-10, 10 = very lonely).',
  'Rate how much social support you feel is available when needed (1-10, 10 = strong support).',
  'Review your loneliness risk level and recommendations for improving social connection.',
];

const faqs = [
  {
    question: 'What is loneliness risk?',
    answer:
      'Loneliness risk assesses your likelihood of experiencing chronic loneliness based on social connections, relationship quality, interaction frequency, and perceived social support. Chronic loneliness significantly impacts physical and mental health.',
  },
  {
    question: 'What causes loneliness?',
    answer:
      'Loneliness can result from: lack of social connections, poor relationship quality, infrequent social interaction, lack of meaningful relationships, social isolation, life transitions, relocation, loss of relationships, and perceived lack of social support.',
  },
  {
    question: 'What is a good loneliness risk score?',
    answer:
      'Scores below 30 indicate low risk. 30-50 is moderate risk. 51-70 is high risk. Above 70 indicates critical risk requiring attention to social connection and potentially professional support.',
  },
  {
    question: 'Is loneliness the same as being alone?',
    answer:
      'No, loneliness is the subjective feeling of being disconnected or isolated, even when around others. You can be alone without feeling lonely, or feel lonely in a crowd. It\'s about quality and meaningfulness of connections.',
  },
  {
    question: 'What are the health impacts of loneliness?',
    answer:
      'Chronic loneliness increases risk of: depression, anxiety, cardiovascular disease, weakened immune system, cognitive decline, sleep problems, and premature mortality. It\'s as harmful as smoking or obesity for health.',
  },
  {
    question: 'Can you have many connections but still feel lonely?',
    answer:
      'Yes, quality matters more than quantity. You can have many superficial connections but still feel lonely if you lack meaningful, close relationships where you feel understood, valued, and supported.',
  },
  {
    question: 'How can I reduce loneliness?',
    answer:
      'Strategies include: building meaningful relationships, joining groups or communities, engaging in shared activities, volunteering, reaching out to existing connections, improving relationship quality, and seeking professional support if needed.',
  },
  {
    question: 'Does social media help or worsen loneliness?',
    answer:
      'It depends. Social media can provide connection but often replaces meaningful in-person interactions. Passive social media use (scrolling) typically increases loneliness, while active engagement and in-person connections reduce it.',
  },
  {
    question: 'When should I seek professional help for loneliness?',
    answer:
      'Seek help if loneliness is persistent, severe, accompanied by depression or anxiety, affecting daily functioning, or if you struggle to form or maintain relationships despite efforts. Therapy can address underlying causes.',
  },
  {
    question: 'Can loneliness be temporary?',
    answer:
      'Yes, situational loneliness (after a move, loss, or transition) is often temporary and resolves as you build new connections. Chronic loneliness (lasting months or years) is more concerning and may need intervention.',
  },
];

const relatedCalculators = [
  {
    name: 'Social Connection Score Calculator',
    slug: 'social-connection-score-calculator',
    description: 'Assess overall social connection quality and quantity.',
  },
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'Measure emotional wellbeing affected by loneliness.',
  },
  {
    name: 'Happiness Index Calculator',
    slug: 'happiness-index-calculator',
    description: 'Evaluate happiness impacted by social connection.',
  },
  {
    name: 'Emotional Stability Index Calculator',
    slug: 'emotional-stability-index-calculator',
    description: 'Assess emotional stability affected by loneliness.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/loneliness-risk-estimator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Loneliness Tendency Wellness Estimator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Loneliness Tendency Wellness Estimator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Estimate loneliness risk based on social connections, relationship quality, interaction frequency, loneliness feelings, and perceived social support to identify areas for improvement.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate connection quantity score (more is better)
  const connectionQuantityScore = Math.min((values.socialConnections / 15) * 15, 15);
  const meaningfulRelScore = Math.min((values.meaningfulRelationships / 5) * 15, 15);
  
  // Calculate interaction and quality scores (higher is better)
  const interactionScore = (values.socialInteractionFrequency / 10) * 15;
  const qualityScore = (values.qualityOfConnections / 10) * 15;
  const supportScore = (values.socialSupportAvailable / 10) * 20;
  
  // Loneliness contributes to risk (higher is worse)
  const lonelinessContribution = (values.feelingOfLoneliness / 10) * 20;
  
  // Calculate social connection score (0-100, higher is better)
  const socialConnectionScore = Math.round(connectionQuantityScore + meaningfulRelScore + interactionScore + qualityScore + supportScore);
  
  // Calculate loneliness risk (inverse of connection score + loneliness feeling)
  const lonelinessRisk = Math.round(lonelinessContribution + (100 - socialConnectionScore) * 0.5);
  const clampedRisk = Math.max(0, Math.min(100, lonelinessRisk));
  
  let riskLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'low-risk';
  
  if (clampedRisk < 30) {
    riskLevel = 'Low Tendency';
    interpretation = 'This suggests a general lifestyle tendency where your loneliness tendency may be low. You may have good social connections, meaningful relationships, and adequate social support. You may consider maintaining these connections.';
    status = 'low-risk';
  } else if (clampedRisk < 50) {
    riskLevel = 'Moderate Tendency';
    interpretation = 'This suggests a general lifestyle tendency where you may have moderate loneliness tendency. You may consider strengthening existing relationships or building new meaningful connections.';
    status = 'moderate-risk';
  } else if (clampedRisk < 70) {
    riskLevel = 'High Tendency';
    interpretation = 'This suggests a general lifestyle tendency where your loneliness tendency may be high. You may consider prioritizing building meaningful relationships, increasing social interactions, and developing stronger social support networks.';
    status = 'high-risk';
  } else {
    riskLevel = 'Critical Tendency';
    interpretation = 'This suggests a general lifestyle tendency where loneliness tendency may be high. You may consider focusing on social connection and actively building meaningful relationships. You may also consider seeking professional guidance if needed. This is a personal insight, not a medical evaluation.';
    status = 'critical-risk';
  }
  
  const recommendations = [
    `You have ${values.socialConnections} social connections. ${values.socialConnections >= 10 ? 'Good number of connections.' : 'Consider expanding your social network through groups, activities, or communities.'}`,
    `Meaningful relationships: ${values.meaningfulRelationships}. ${values.meaningfulRelationships >= 3 ? 'Good support network.' : 'Focus on deepening existing relationships or building new close connections.'}`,
    'Increase social interaction frequency: Join clubs, groups, or activities aligned with your interests. Regular social engagement reduces loneliness.',
    'Improve relationship quality: Invest time and energy in deepening relationships. Share more, be vulnerable, and show up for others.',
    'Build social support: Identify people you can turn to during difficult times. Nurture these relationships and let others know you\'re available to support them too.',
    'Address feelings of loneliness: Acknowledge and validate your feelings. Understand that loneliness is common and doesn\'t mean something is wrong with you.',
    'Engage in meaningful activities: Participate in activities that align with your values and interests. This naturally connects you with like-minded people.',
    'Seek professional support if needed: If loneliness persists despite efforts, consider therapy or counseling to address underlying causes and develop connection skills.',
    'Limit passive social media use: Replace scrolling with active engagement or better yet, prioritize in-person interactions for deeper connections.',
  ];
  
  const plan = [
    { label: 'This Week', detail: 'Reach out to at least 2-3 existing connections. Join one new group or activity. Schedule regular social interactions.' },
    { label: 'This Month', detail: 'Focus on deepening 1-2 relationships. Increase social interaction frequency. Build a routine of regular social engagement.' },
    { label: 'This Quarter', detail: 'Continue building meaningful connections. Evaluate improvements in loneliness feelings. Seek professional support if loneliness persists.' },
  ];
  
  return {
    lonelinessRisk: clampedRisk,
    riskLevel,
    socialConnectionScore,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function LonelinessRiskEstimator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      socialConnections: undefined,
      meaningfulRelationships: undefined,
      socialInteractionFrequency: undefined,
      qualityOfConnections: undefined,
      feelingOfLoneliness: undefined,
      socialSupportAvailable: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="lre-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Loneliness Tendency Wellness Estimator
          </CardTitle>
          <CardDescription>Get general wellness insights about loneliness tendency based on social connections, relationship quality, interaction frequency, loneliness feelings, and perceived social support. This is a personal lifestyle insight, not a medical evaluation.</CardDescription>
        </CardHeader>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Input your social connection data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="socialConnections"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of social connections (friends, family, acquaintances)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meaningfulRelationships"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of meaningful, close relationships</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialInteractionFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social interaction frequency (1-10, 10 = very frequent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="qualityOfConnections"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quality of social connections (1-10, 10 = excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="feelingOfLoneliness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feeling of loneliness (1-10, 10 = very lonely)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialSupportAvailable"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social support available when needed (1-10, 10 = strong support)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Estimate Loneliness Risk
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See your loneliness risk level and recommendations for improving social connection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loneliness Risk</p>
                <p className="text-2xl font-semibold text-primary">{result.lonelinessRisk}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <p className="text-2xl font-semibold text-primary">{result.riskLevel}</p>
                <p className="text-xs text-muted-foreground">Current status</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Connection Score</p>
                <p className="text-2xl font-semibold text-primary">{result.socialConnectionScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
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
                    <TrendingDown className="h-4 w-4" />
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
            <strong>Social Connection Score</strong> = Connection Quantity Score + Meaningful Relationships Score + Interaction Score + Quality Score + Support Score
          </p>
          <p>
            <strong>Connection Quantity Score</strong> = Min((Social Connections / 15) × 15, 15)
          </p>
          <p>
            <strong>Meaningful Relationships Score</strong> = Min((Meaningful Relationships / 5) × 15, 15)
          </p>
          <p>
            <strong>Interaction Score</strong> = (Social Interaction Frequency / 10) × 15
          </p>
          <p>
            <strong>Quality Score</strong> = (Quality of Connections / 10) × 15
          </p>
          <p>
            <strong>Support Score</strong> = (Social Support Available / 10) × 20
          </p>
          <p>
            <strong>Loneliness Risk</strong> = Loneliness Contribution + (100 - Social Connection Score) × 0.5
          </p>
          <p>
            <strong>Loneliness Contribution</strong> = (Feeling of Loneliness / 10) × 20
          </p>
          <p>Risk ranges from 0-100, with higher scores indicating greater loneliness risk.</p>
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
          <p>
            Loneliness is the subjective feeling of being disconnected or isolated, which can occur even when surrounded by others. Chronic loneliness is a serious health concern, associated with increased risk of depression, anxiety, cardiovascular disease, cognitive decline, and premature mortality. Understanding your loneliness risk helps identify areas for improving social connection.
          </p>
          <p>
            This estimator evaluates multiple factors including social connection quantity, meaningful relationship quality, interaction frequency, and perceived social support. By addressing identified gaps in social connection, you can reduce loneliness risk and improve overall wellbeing and health outcomes.
          </p>
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
          <p>This tool provides general wellness insights about loneliness tendency based on social connections, relationship quality, interaction frequency, loneliness feelings, and perceived social support. This is a personal lifestyle insight, not a medical evaluation.</p>
          <p>Outputs include a loneliness tendency wellness score, tendency level, social connection score, interpretation, recommendations, and an action plan.</p>
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

