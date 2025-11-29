'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Heart, Target, Shield, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  closeRelationships: z.number({ invalid_type_error: 'Enter number of relationships' }).min(0).max(20),
  socialInteractionsPerWeek: z.number({ invalid_type_error: 'Enter interactions' }).min(0).max(50),
  relationshipQuality: z.number({ invalid_type_error: 'Enter quality' }).min(1).max(10),
  socialSupport: z.number({ invalid_type_error: 'Enter support level' }).min(1).max(10),
  communityInvolvement: z.number({ invalid_type_error: 'Enter involvement' }).min(1).max(10),
  senseOfBelonging: z.number({ invalid_type_error: 'Enter belonging' }).min(1).max(10),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  connectionScore: number;
  connectionLevel: string;
  supportIndex: number;
  status: 'highly-connected' | 'well-connected' | 'moderately-connected' | 'isolated';
  interpretation: string;
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Count number of close, meaningful relationships (people you feel close to and trust).',
  'Estimate social interactions per week (meaningful conversations, meetups, calls, etc.).',
  'Rate quality of your relationships (1-10, 10 = excellent, supportive, fulfilling).',
  'Rate level of social support you receive (1-10, 10 = very strong support network).',
  'Rate community involvement (1-10, 10 = very involved in communities/groups).',
  'Rate sense of belonging (1-10, 10 = strong sense of belonging).',
  'Review your social connection score and recommendations.',
];

const faqs = [
  {
    question: 'What is social connection?',
    answer:
      'Social connection refers to meaningful relationships, social interactions, social support, sense of belonging, and community involvement. Strong social connections are essential for mental and physical health, happiness, and longevity.',
  },
  {
    question: 'Why is social connection important?',
    answer:
      'Social connection is crucial for: mental health, physical health, longevity, happiness, stress resilience, cognitive health, immune function, and overall wellbeing. Strong connections reduce risk of depression, anxiety, and chronic disease.',
  },
  {
    question: 'What is a good social connection score?',
    answer:
      'Scores above 75 indicate high social connection. 60-75 is well-connected, 45-59 is moderately connected, and below 45 suggests opportunities to strengthen social connections and reduce isolation.',
  },
  {
    question: 'How many close relationships are ideal?',
    answer:
      'Quality matters more than quantity, but having 3-5 close, meaningful relationships is generally ideal. However, even 1-2 high-quality relationships can provide significant connection and support.',
  },
  {
    question: 'What counts as a meaningful social interaction?',
    answer:
      'Meaningful interactions include: face-to-face conversations, phone/video calls with emotional connection, shared activities, support exchanges, and quality time with others. Superficial or brief interactions count less.',
  },
  {
    question: 'Can online connections count as social connection?',
    answer:
      'Online connections can provide social connection, especially if they involve meaningful interactions, emotional support, and genuine relationships. However, in-person connections often provide deeper benefits.',
  },
  {
    question: 'How can I improve my social connection score?',
    answer:
      'Improve through: investing in existing relationships, joining groups or communities aligned with interests, volunteering, initiating social interactions, being present and engaged in conversations, and seeking meaningful connections rather than just quantity.',
  },
  {
    question: 'What is the difference between social connection and loneliness?',
    answer:
      'Social connection refers to actual relationships and interactions. Loneliness is the subjective feeling of being disconnected or isolated. You can have connections but feel lonely, or have fewer connections but feel satisfied.',
  },
  {
    question: 'How does social connection affect health?',
    answer:
      'Strong social connections reduce risk of depression, anxiety, heart disease, dementia, and premature death. They improve immune function, stress resilience, cognitive health, and overall longevity.',
  },
  {
    question: 'Is quality or quantity more important for social connection?',
    answer:
      'Quality is generally more important than quantity. A few deep, meaningful, supportive relationships often provide more benefit than many superficial connections. However, both quality close relationships and a broader social network are valuable.',
  },
];

const relatedCalculators = [
  {
    name: 'Loneliness Risk Estimator',
    slug: 'loneliness-risk-estimator',
    description: 'Assess loneliness risk related to social connection.',
  },
  {
    name: 'Emotional Wellbeing Index Calculator',
    slug: 'emotional-wellbeing-index-calculator',
    description: 'Evaluate emotional wellbeing supported by social connections.',
  },
  {
    name: 'Happiness Index Calculator',
    slug: 'happiness-index-calculator',
    description: 'Measure happiness enhanced by social connections.',
  },
  {
    name: 'Emotional Stability Index Calculator',
    slug: 'emotional-stability-index-calculator',
    description: 'Assess emotional stability supported by social connections.',
  },
];

const baseUrl = 'https://mycalculating.com/category/health-fitness/social-connection-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Health & Fitness', item: 'https://mycalculating.com/category/health-fitness' },
        { '@type': 'ListItem', position: 3, name: 'Social Connection Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Social Connection Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Assess social connection by evaluating close relationships, social interactions, relationship quality, social support, community involvement, and sense of belonging.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  // Calculate relationship component (close relationships, capped and normalized)
  const relationshipScore = Math.min((values.closeRelationships / 5) * 20, 20);
  
  // Calculate interaction component
  const interactionScore = Math.min((values.socialInteractionsPerWeek / 14) * 20, 20);
  
  // Quality components
  const qualityScore = (values.relationshipQuality / 10) * 20;
  const supportScore = (values.socialSupport / 10) * 20;
  const involvementScore = (values.communityInvolvement / 10) * 10;
  const belongingScore = (values.senseOfBelonging / 10) * 10;
  
  // Total connection score
  const connectionScore = Math.round(relationshipScore + interactionScore + qualityScore + supportScore + involvementScore + belongingScore);
  
  // Support index (average of support-related factors)
  const supportIndex = Math.round((values.socialSupport + values.relationshipQuality + values.senseOfBelonging) / 3 * 10);
  
  let connectionLevel: string;
  let interpretation: string;
  let status: ResultPayload['status'] = 'well-connected';
  
  if (connectionScore >= 75) {
    connectionLevel = 'Highly Connected';
    interpretation = 'You have strong social connections with quality relationships, good support, and sense of belonging. Excellent social health!';
    status = 'highly-connected';
  } else if (connectionScore >= 60) {
    connectionLevel = 'Well Connected';
    interpretation = 'You have good social connections with meaningful relationships and support. Continue nurturing these connections.';
    status = 'well-connected';
  } else if (connectionScore >= 45) {
    connectionLevel = 'Moderately Connected';
    interpretation = 'Your social connections are moderate. There are opportunities to strengthen relationships, increase interactions, or deepen community involvement.';
    status = 'moderately-connected';
  } else {
    connectionLevel = 'Isolated';
    interpretation = 'Your social connection score suggests isolation. Focus on building meaningful relationships, increasing social interactions, and developing a sense of belonging.';
    status = 'isolated';
  }
  
  const recommendations = [
    `Your connection score is ${connectionScore}/100. ${connectionScore >= 75 ? 'Excellent social connection!' : connectionScore >= 60 ? 'Good connection with room for growth.' : 'Focus on strengthening social connections.'}`,
    `You have ${values.closeRelationships} close relationships. ${values.closeRelationships >= 3 ? 'Good number of close relationships!' : 'Consider investing in existing relationships or building new meaningful connections.'}`,
    `Your relationship quality is ${values.relationshipQuality}/10. ${values.relationshipQuality >= 7 ? 'Excellent quality!' : 'Focus on deepening relationships through quality time, communication, and mutual support.'}`,
    `Your social support level is ${values.socialSupport}/10. ${values.socialSupport >= 7 ? 'Good support!' : 'Build a stronger support network through mutual relationships and community involvement.'}`,
    'Invest in existing relationships: Spend quality time with people you care about, communicate regularly, and provide support to others.',
    'Increase social interactions: Aim for regular meaningful interactions (conversations, meetups, activities) with friends, family, or community members.',
    'Join groups or communities: Find groups aligned with your interests, values, or activities. Community involvement builds connections and sense of belonging.',
    'Be present in interactions: When with others, be fully present, listen actively, and engage meaningfully. Quality matters more than quantity.',
    'Seek meaningful connections: Focus on building deeper, more meaningful relationships rather than just increasing the number of superficial connections.',
    'Initiate social connections: Take initiative to reach out, make plans, and build relationships. Building connections requires effort and consistency.',
  ];
  
  const plan = [
    { label: 'This Week', detail: 'Reach out to 2-3 people you care about. Schedule at least one meaningful interaction. Join one group or activity.' },
    { label: 'This Month', detail: 'Strengthen existing relationships through regular contact. Join a community or group. Increase social interactions to 7+ per week.' },
    { label: 'This Quarter', detail: 'Build deeper relationships. Establish regular social routines. Develop sense of belonging in communities. Re-assess connection score.' },
  ];
  
  return {
    connectionScore,
    connectionLevel,
    supportIndex,
    status,
    interpretation,
    recommendations,
    plan,
  };
};

export default function SocialConnectionScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      closeRelationships: undefined,
      socialInteractionsPerWeek: undefined,
      relationshipQuality: undefined,
      socialSupport: undefined,
      communityInvolvement: undefined,
      senseOfBelonging: undefined,
    },
  });
  
  return (
    <div className="space-y-8">
      <Script id="scs-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Social Connection Score Calculator
          </CardTitle>
          <CardDescription>Assess social connection by evaluating close relationships, social interactions, relationship quality, social support, community involvement, and sense of belonging.</CardDescription>
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
                  name="closeRelationships"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of close, meaningful relationships</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialInteractionsPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social interactions per week (meaningful conversations, meetups)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="relationshipQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship quality (1-10, 10 = excellent)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialSupport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Social support level (1-10, 10 = very strong support)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="communityInvolvement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Community involvement (1-10, 10 = very involved)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="senseOfBelonging"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sense of belonging (1-10, 10 = strong sense)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Social Connection Score
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Interactive results
            </CardTitle>
            <CardDescription>See your social connection score and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Connection Score</p>
                <p className="text-2xl font-semibold text-primary">{result.connectionScore}</p>
                <p className="text-xs text-muted-foreground">Out of 100</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Connection Level</p>
                <p className="text-2xl font-semibold text-primary">{result.connectionLevel}</p>
                <p className="text-xs text-muted-foreground">Current status</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Support Index</p>
                <p className="text-2xl font-semibold text-primary">{result.supportIndex}</p>
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
            <strong>Connection Score</strong> = Relationship Score + Interaction Score + Quality Score + Support Score + Involvement Score + Belonging Score
          </p>
          <p>
            <strong>Relationship Score</strong> = Min((Close Relationships / 5) × 20, 20)
          </p>
          <p>
            <strong>Interaction Score</strong> = Min((Social Interactions per Week / 14) × 20, 20)
          </p>
          <p>
            <strong>Quality Score</strong> = (Relationship Quality / 10) × 20
          </p>
          <p>
            <strong>Support Score</strong> = (Social Support / 10) × 20
          </p>
          <p>
            <strong>Involvement Score</strong> = (Community Involvement / 10) × 10
          </p>
          <p>
            <strong>Belonging Score</strong> = (Sense of Belonging / 10) × 10
          </p>
          <p>
            <strong>Support Index</strong> = ((Social Support + Relationship Quality + Sense of Belonging) / 3) × 10
          </p>
          <p>Score ranges from 0-100, with higher scores indicating stronger social connections.</p>
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
          <p>
            Social connection is a fundamental human need and is essential for mental and physical health, happiness, and longevity. Strong social connections involve meaningful relationships, regular social interactions, social support, community involvement, and a sense of belonging. Research consistently shows that social connection reduces risk of depression, anxiety, chronic disease, and premature death.
          </p>
          <p>
            This calculator assesses your social connection by evaluating the number and quality of close relationships, frequency of social interactions, level of social support, community involvement, and sense of belonging. Understanding your social connection score helps you identify areas to strengthen relationships and reduce isolation.
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
          <p>This tool assesses social connection by evaluating close relationships, social interactions, relationship quality, social support, community involvement, and sense of belonging.</p>
          <p>Outputs include a social connection score, connection level, support index, interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
