'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  riskCapacityScore: z.number({ invalid_type_error: 'Enter risk capacity score' }).min(1).max(10),
  riskToleranceScore: z.number({ invalid_type_error: 'Enter risk tolerance score' }).min(1).max(10),
  riskNeedScore: z.number({ invalid_type_error: 'Enter risk need score' }).min(1).max(10),
  timeHorizonYears: z.number({ invalid_type_error: 'Enter time horizon' }).min(0.1),
  netWorth: z.number({ invalid_type_error: 'Enter net worth' }).min(0).optional(),
  incomeStability: z.number({ invalid_type_error: 'Enter income stability' }).min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  riskCapacityScore: number;
  riskToleranceScore: number;
  riskNeedScore: number;
  timeHorizonYears: number;
  netWorth?: number;
  incomeStability?: number;
  overallRiskProfile: number;
  riskProfileCategory: string;
  profileAlignment: string;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your risk capacity (financial ability to take risk, 1-10).',
  'Rate your risk tolerance (psychological willingness to take risk, 1-10).',
  'Rate your risk need (required risk to achieve goals, 1-10).',
  'Enter your time horizon in years.',
  'Optionally enter net worth and income stability.',
  'Review overall risk profile, alignment, and recommendations.',
];

const faqs = [
  {
    question: 'What is risk profile assessment?',
    answer:
      'Risk profile assessment evaluates three dimensions of risk: capacity (ability to take risk), tolerance (willingness to take risk), and need (required risk to achieve goals). A comprehensive risk profile balances all three dimensions to determine appropriate investment strategy.',
  },
  {
    question: 'What is risk capacity?',
    answer:
      'Risk capacity is your financial ability to take risk, considering factors like: net worth, income stability, expenses, time horizon, financial obligations, and ability to absorb losses. High net worth and stable income increase risk capacity, while short time horizons and high expenses decrease it.',
  },
  {
    question: 'What is risk tolerance?',
    answer:
      'Risk tolerance is your psychological willingness and comfort level with investment risk. It reflects your emotional response to volatility, ability to sleep with portfolio risk, reaction to losses, and comfort with uncertainty. Risk tolerance is more subjective than capacity.',
  },
  {
    question: 'What is risk need?',
    answer:
      'Risk need is the level of risk required to achieve your financial goals. It considers: required return to reach goals, time horizon, current savings, contribution rate, and goal amount. Higher required returns and shorter time horizons increase risk need.',
  },
  {
    question: 'How is overall risk profile calculated?',
    answer:
      'Overall risk profile balances risk capacity, risk tolerance, and risk need. It typically uses the minimum of capacity and tolerance, adjusted by risk need. If need exceeds capacity/tolerance, goals may need adjustment. The formula considers all three dimensions for holistic assessment.',
  },
  {
    question: 'What does profile alignment mean?',
    answer:
      'Profile alignment indicates whether risk capacity, tolerance, and need are well-aligned. Good alignment means all three are similar, allowing consistent investment strategy. Misalignment occurs when capacity is high but tolerance is low, or when need exceeds capacity/tolerance, requiring goal or strategy adjustments.',
  },
  {
    question: 'What if capacity, tolerance, and need differ?',
    answer:
      'When dimensions differ: Use the minimum of capacity and tolerance as your risk ceiling. If need exceeds this ceiling, adjust goals (extend time horizon, reduce goal amount, increase contributions) rather than exceeding your risk capacity or tolerance. Never exceed capacity even if need is high.',
  },
  {
    question: 'How does time horizon affect risk profile?',
    answer:
      'Longer time horizons increase risk capacity by allowing time to recover from losses. They also affect risk need by allowing lower returns to achieve goals. Time horizon is critical in determining appropriate risk levels - longer horizons support higher risk for growth.',
  },
  {
    question: 'How often should I reassess my risk profile?',
    answer:
      'Reassess risk profile annually or when major life events occur (marriage, children, job change, inheritance, retirement, major expenses). Risk capacity and need change over time, while risk tolerance is more stable but can change with experience and age.',
  },
  {
    question: 'What if my risk profile suggests a mismatch with my current portfolio?',
    answer:
      'If your current portfolio doesn\'t match your risk profile: Gradually adjust asset allocation to align with profile recommendations. Avoid sudden changes - transition over 6-12 months. Consider tax implications of rebalancing. Consult a financial advisor for guidance on major adjustments.',
  },
];

const relatedCalculators = [
  {
    name: 'Risk Tolerance Score Calculator',
    slug: 'risk-tolerance-score-calculator',
    description: 'Calculate risk tolerance scores.',
  },
  {
    name: 'Goal-Based Investing Allocation Calculator',
    slug: 'goal-based-investing-allocation-calculator',
    description: 'Calculate goal-based allocation.',
  },
  {
    name: 'Portfolio Risk Analysis Calculator',
    slug: 'portfolio-risk-analysis-calculator',
    description: 'Analyze portfolio risk.',
  },
  {
    name: 'Asset Allocation Optimizer',
    slug: 'asset-allocation-optimizer',
    description: 'Optimize asset allocation.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/risk-profile-assessment-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Risk Profile Assessment Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Risk Profile Assessment Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Assess comprehensive risk profile by evaluating risk capacity, risk tolerance, and risk need to determine appropriate investment strategy.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const getRiskProfileCategory = (score: number): string => {
  if (score >= 9) return 'Very Aggressive';
  if (score >= 7.5) return 'Aggressive';
  if (score >= 6) return 'Moderately Aggressive';
  if (score >= 4) return 'Moderate';
  if (score >= 2.5) return 'Conservative';
  return 'Very Conservative';
};

const calculateResult = (values: FormValues): ResultPayload => {
  const riskCapacityScore = values.riskCapacityScore;
  const riskToleranceScore = values.riskToleranceScore;
  const riskNeedScore = values.riskNeedScore;
  const timeHorizonYears = values.timeHorizonYears;
  const netWorth = values.netWorth;
  const incomeStability = values.incomeStability;
  
  // Overall risk profile: minimum of capacity and tolerance, adjusted by need and time horizon
  // Risk profile = min(capacity, tolerance) adjusted for need and time horizon
  const baseRiskProfile = Math.min(riskCapacityScore, riskToleranceScore);
  
  // Adjust for risk need: if need is high but base is low, consider moderate increase
  // If need exceeds capacity/tolerance, use base (don't exceed capacity/tolerance)
  let overallRiskProfile = baseRiskProfile;
  if (riskNeedScore <= baseRiskProfile) {
    // Need is within capacity/tolerance - use need
    overallRiskProfile = riskNeedScore;
  } else if (riskNeedScore > baseRiskProfile * 1.2) {
    // Need significantly exceeds capacity/tolerance - use base
    overallRiskProfile = baseRiskProfile;
  } else {
    // Need slightly exceeds - use weighted average
    overallRiskProfile = (baseRiskProfile * 0.7) + (riskNeedScore * 0.3);
  }
  
  // Time horizon adjustment: longer horizons allow slightly higher risk
  if (timeHorizonYears >= 20) {
    overallRiskProfile = Math.min(10, overallRiskProfile * 1.1);
  } else if (timeHorizonYears >= 10) {
    overallRiskProfile = Math.min(10, overallRiskProfile * 1.05);
  } else if (timeHorizonYears < 3) {
    overallRiskProfile = Math.max(1, overallRiskProfile * 0.9);
  }
  
  overallRiskProfile = Math.max(1, Math.min(10, overallRiskProfile));
  
  const riskProfileCategory = getRiskProfileCategory(overallRiskProfile);
  
  // Profile alignment assessment
  const maxDiff = Math.max(
    Math.abs(riskCapacityScore - riskToleranceScore),
    Math.abs(riskCapacityScore - riskNeedScore),
    Math.abs(riskToleranceScore - riskNeedScore)
  );
  
  let profileAlignment = '';
  if (maxDiff <= 1.5) {
    profileAlignment = 'Excellent alignment - capacity, tolerance, and need are well-aligned, allowing consistent investment strategy.';
  } else if (maxDiff <= 3) {
    profileAlignment = 'Good alignment - dimensions are reasonably aligned with minor adjustments needed.';
  } else if (maxDiff <= 5) {
    profileAlignment = 'Moderate misalignment - consider adjustments to goals or risk strategy to improve alignment.';
  } else {
    profileAlignment = 'Significant misalignment - major adjustments needed. Do not exceed risk capacity or tolerance even if need is high.';
  }
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Overall risk profile: ${overallRiskProfile.toFixed(2)} (${riskProfileCategory}). Capacity: ${riskCapacityScore.toFixed(1)}, Tolerance: ${riskToleranceScore.toFixed(1)}, Need: ${riskNeedScore.toFixed(1)}. ${profileAlignment}`;
  
  if (maxDiff > 5) {
    status = 'low';
    interpretation += ' Significant misalignment requires attention - consider adjusting goals or investment strategy.';
  } else if (riskNeedScore > Math.max(riskCapacityScore, riskToleranceScore) * 1.2) {
    status = 'moderate';
    interpretation += ' Risk need exceeds capacity/tolerance - consider extending time horizon, reducing goal amount, or increasing contributions rather than exceeding risk limits.';
  } else if (maxDiff <= 1.5) {
    status = 'optimal';
    interpretation += ' Well-aligned profile allows optimal investment strategy.';
  } else {
    status = 'good';
  }

  const recommendations = [
    `Risk profile assessment: Overall ${riskProfileCategory} profile (${overallRiskProfile.toFixed(2)}) based on capacity (${riskCapacityScore.toFixed(1)}), tolerance (${riskToleranceScore.toFixed(1)}), and need (${riskNeedScore.toFixed(1)}). ${profileAlignment}`,
    `Investment strategy: ${riskProfileCategory} profile suggests ${overallRiskProfile >= 7.5 ? 'high stock allocation (80-90%)' : overallRiskProfile >= 6 ? 'moderate-high stock allocation (60-80%)' : overallRiskProfile >= 4 ? 'balanced allocation (40-60% stocks)' : 'conservative allocation (20-40% stocks)'}. Align portfolio with this profile.`,
    `Alignment management: ${maxDiff <= 3 ? 'Good alignment allows consistent strategy.' : 'Misalignment detected - use minimum of capacity and tolerance as risk ceiling. If need exceeds this ceiling, adjust goals (extend time horizon, reduce goal amount, increase contributions) rather than exceeding capacity or tolerance limits.'}`,
    `Time horizon consideration: ${timeHorizonYears.toFixed(1)}-year horizon ${timeHorizonYears >= 10 ? 'supports higher risk for growth.' : timeHorizonYears >= 5 ? 'allows moderate risk.' : 'requires conservative approach to preserve capital.'} Adjust risk profile as time horizon shortens.`,
  ];
  
  if (riskNeedScore > Math.max(riskCapacityScore, riskToleranceScore) * 1.5) {
    recommendations.push('High risk need vs. capacity/tolerance: Your goals require significantly more risk than your capacity or tolerance allows. Critical: Do NOT exceed capacity or tolerance. Instead, adjust goals by extending time horizon, reducing goal amount, or significantly increasing contributions to achieve goals within your risk limits.');
  }
  if (riskCapacityScore > riskToleranceScore * 1.5) {
    recommendations.push('High capacity but low tolerance: While you can financially afford higher risk, your psychological comfort level is lower. Respect your tolerance - being uncomfortable with risk can lead to panic selling during downturns, negating the benefits of higher risk.');
  }
  if (riskToleranceScore > riskCapacityScore * 1.5) {
    recommendations.push('High tolerance but low capacity: While you\'re willing to take risk, your financial capacity is limited. Respect your capacity - taking more risk than you can afford can lead to financial hardship if losses occur. Focus on building capacity before increasing risk.');
  }

  const plan = [
    { label: 'This Week', detail: `Assess risk profile: Overall ${riskProfileCategory} (${overallRiskProfile.toFixed(2)}) based on capacity ${riskCapacityScore.toFixed(1)}, tolerance ${riskToleranceScore.toFixed(1)}, need ${riskNeedScore.toFixed(1)}. Document profile alignment and recommendations.` },
    { label: 'This Month', detail: 'Align portfolio with risk profile. Review current portfolio allocation against profile recommendations. Make gradual adjustments if needed. If misalignment exists, develop plan to adjust goals or strategy to improve alignment.' },
    { label: 'Ongoing', detail: 'Reassess risk profile annually or when major life events occur. Monitor alignment between capacity, tolerance, and need. Adjust portfolio and goals as circumstances change. Maintain portfolio alignment with evolving risk profile.' },
  ];

  return { riskCapacityScore, riskToleranceScore, riskNeedScore, timeHorizonYears, netWorth, incomeStability, overallRiskProfile, riskProfileCategory, profileAlignment, interpretation, status, recommendations, plan };
};

export default function RiskProfileAssessmentCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      riskCapacityScore: undefined,
      riskToleranceScore: undefined,
      riskNeedScore: undefined,
      timeHorizonYears: undefined,
      netWorth: undefined,
      incomeStability: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="risk-profile-assessment-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Risk Profile Assessment Calculator
          </CardTitle>
          <CardDescription>Assess comprehensive risk profile by evaluating risk capacity, risk tolerance, and risk need to determine appropriate investment strategy.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your risk profile factors</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="riskCapacityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Capacity Score (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="1" max="10" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Financial ability to take risk</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riskToleranceScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Tolerance Score (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="1" max="10" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Psychological willingness to take risk</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="riskNeedScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Need Score (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="1" max="10" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Required risk to achieve goals</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeHorizonYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Horizon (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="netWorth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Worth (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="incomeStability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Income Stability (1-10) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="1" max="10" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Stability of income</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Assess Risk Profile
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
            <CardDescription>See risk profile assessment and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Overall Risk Profile</p>
                <p className="text-2xl font-semibold text-primary">{result.overallRiskProfile.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{result.riskProfileCategory}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Capacity</p>
                <p className="text-2xl font-semibold text-primary">{result.riskCapacityScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Financial ability</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Tolerance</p>
                <p className="text-2xl font-semibold text-primary">{result.riskToleranceScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Willingness</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Need</p>
                <p className="text-2xl font-semibold text-primary">{result.riskNeedScore.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Required risk</p>
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
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
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
            <strong>Base Risk Profile</strong> = min(Risk Capacity, Risk Tolerance)
          </p>
          <p>
            <strong>Overall Risk Profile</strong> = Base Risk Profile adjusted for Risk Need and Time Horizon
          </p>
          <p>If Risk Need â‰¤ Base Profile: Use Risk Need</p>
          <p>If Risk Need &gt; Base Profile Ã— 1.2: Use Base Profile (don't exceed capacity/tolerance)</p>
          <p>Otherwise: Weighted average of Base and Need</p>
          <p>Time Horizon Adjustment:</p>
          <p>â‰¥ 20 years: +10%</p>
          <p>â‰¥ 10 years: +5%</p>
          <p>&lt; 3 years: -10%</p>
          <p>Risk profile assessment balances three critical dimensions: capacity (ability), tolerance (willingness), and need (requirements). The overall profile uses the minimum of capacity and tolerance as the risk ceiling, adjusted by need and time horizon. Never exceed risk capacity or tolerance even if need is high - instead, adjust goals.</p>
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
                <p className="text-sm text-muted-foreground">Profile Alignment</p>
                <p className="text-xl font-semibold text-primary">
                  {Math.max(
                    Math.abs(result.riskCapacityScore - result.riskToleranceScore),
                    Math.abs(result.riskCapacityScore - result.riskNeedScore),
                    Math.abs(result.riskToleranceScore - result.riskNeedScore)
                  ) <= 1.5 ? 'Excellent' : 
                  Math.max(
                    Math.abs(result.riskCapacityScore - result.riskToleranceScore),
                    Math.abs(result.riskCapacityScore - result.riskNeedScore),
                    Math.abs(result.riskToleranceScore - result.riskNeedScore)
                  ) <= 3 ? 'Good' : 
                  Math.max(
                    Math.abs(result.riskCapacityScore - result.riskToleranceScore),
                    Math.abs(result.riskCapacityScore - result.riskNeedScore),
                    Math.abs(result.riskToleranceScore - result.riskNeedScore)
                  ) <= 5 ? 'Moderate' : 'Significant'}
                </p>
                <p className="text-xs text-muted-foreground">{result.profileAlignment}</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Time Horizon</p>
                <p className="text-xl font-semibold text-primary">{result.timeHorizonYears.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Years</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your risk profile factors to see additional insights.</p>
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

      <section
        className="space-y-6 text-muted-foreground leading-relaxed bg-white dark:bg-gray-900 p-6 md:p-10 rounded-lg shadow-lg"
        itemScope
        itemType="https://schema.org/Article"
      >
    <meta itemProp="name" content="The Complete Guide to Risk Profile Assessment: Capacity, Tolerance, and Need" />
    <meta itemProp="description" content="An in-depth guide on comprehensive risk profile assessment, evaluating risk capacity, risk tolerance, and risk need to determine appropriate investment strategies." />
    <meta itemProp="keywords" content="risk profile assessment, risk capacity, risk tolerance, risk need, investment risk, portfolio allocation" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/risk-profile-assessment-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Risk Profile Assessment: Capacity, Tolerance, and Need</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at risk profile assessment, balancing risk capacity, risk tolerance, and risk need to determine optimal investment strategies.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Understanding Risk Profile Assessment</a></li>
        <li><a href="#capacity" className="hover:underline">Risk Capacity</a></li>
        <li><a href="#tolerance" className="hover:underline">Risk Tolerance</a></li>
        <li><a href="#need" className="hover:underline">Risk Need</a></li>
        <li><a href="#alignment" className="hover:underline">Profile Alignment</a></li>
        <li><a href="#application" className="hover:underline">Applying Risk Profile</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Risk Profile Assessment</h2>
    <p>Risk profile assessment evaluates three critical dimensions of investment risk to determine appropriate investment strategy: capacity (ability), tolerance (willingness), and need (requirements).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Three Dimensions</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Risk Capacity:</b> Your financial ability to take risk</li>
        <li><b>Risk Tolerance:</b> Your psychological willingness to take risk</li>
        <li><b>Risk Need:</b> The level of risk required to achieve your goals</li>
    </ul>
    <p>A comprehensive risk profile balances all three dimensions to determine optimal investment strategy.</p>

<hr className="my-6" />

    <h2 id="capacity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Capacity</h2>
    <p>Risk capacity is your financial ability to take risk, considering objective financial factors.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Factors Affecting Risk Capacity</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Net Worth:</b> Higher net worth increases capacity</li>
        <li><b>Income Stability:</b> Stable income increases capacity</li>
        <li><b>Time Horizon:</b> Longer horizons increase capacity</li>
        <li><b>Expenses:</b> Lower expenses relative to income increase capacity</li>
        <li><b>Financial Obligations:</b> Fewer obligations increase capacity</li>
        <li><b>Other Assets:</b> Diversified assets increase capacity</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Assessing Risk Capacity</h3>
    <p>High capacity (8-10): Substantial net worth, stable income, long time horizon, low expenses, few obligations</p>
    <p>Moderate capacity (5-7): Adequate net worth, reasonably stable income, medium time horizon</p>
    <p>Low capacity (1-4): Limited net worth, unstable income, short time horizon, high expenses, many obligations</p>

<hr className="my-6" />

    <h2 id="tolerance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Tolerance</h2>
    <p>Risk tolerance is your psychological willingness and comfort level with investment risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Factors Affecting Risk Tolerance</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Emotional Response:</b> Comfort with volatility and losses</li>
        <li><b>Sleep Factor:</b> Ability to sleep with portfolio risk</li>
        <li><b>Past Experience:</b> Experience with investments and losses</li>
        <li><b>Knowledge:</b> Understanding of investment risks</li>
        <li><b>Personality:</b> Natural inclination toward risk-taking</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Assessing Risk Tolerance</h3>
    <p>High tolerance (8-10): Very comfortable with volatility, can sleep with high risk, experienced with losses</p>
    <p>Moderate tolerance (5-7): Somewhat comfortable with risk, occasional concern about losses</p>
    <p>Low tolerance (1-4): Very uncomfortable with risk, significant anxiety about losses, risk-averse</p>

<hr className="my-6" />

    <h2 id="need" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Need</h2>
    <p>Risk need is the level of risk required to achieve your financial goals based on required returns and time horizon.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Factors Affecting Risk Need</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Required Return:</b> Higher returns require higher risk</li>
        <li><b>Time Horizon:</b> Shorter horizons may require higher risk</li>
        <li><b>Goal Amount:</b> Larger goals relative to savings increase need</li>
        <li><b>Contribution Rate:</b> Lower contributions increase need for risk</li>
        <li><b>Current Savings:</b> Lower savings relative to goals increase need</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Assessing Risk Need</h3>
    <p>High need (8-10): Very high required returns, large goal relative to savings, short time horizon</p>
    <p>Moderate need (5-7): Moderate required returns, reasonable goal relative to savings</p>
    <p>Low need (1-4): Low required returns, adequate savings, long time horizon, high contributions</p>

<hr className="my-6" />

    <h2 id="alignment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Profile Alignment</h2>
    <p>Profile alignment indicates how well risk capacity, tolerance, and need align with each other.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Excellent Alignment (Difference â‰¤ 1.5)</h3>
    <p>All three dimensions are well-aligned, allowing consistent investment strategy. No major adjustments needed.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Good Alignment (Difference 1.5-3)</h3>
    <p>Dimensions are reasonably aligned with minor adjustments needed. Investment strategy can proceed with small modifications.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Moderate Misalignment (Difference 3-5)</h3>
    <p>Significant differences require adjustments to goals or risk strategy to improve alignment. Consider extending time horizon, adjusting goal amount, or changing contribution rate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Significant Misalignment (Difference &gt; 5)</h3>
    <p>Major differences require significant adjustments. Never exceed risk capacity or tolerance even if need is high. Instead, adjust goals substantially - extend time horizon, reduce goal amount, or significantly increase contributions.</p>

<hr className="my-6" />

    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applying Risk Profile</h2>
    <p>Use your risk profile to guide investment decisions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Determining Overall Profile</h3>
    <p>The overall risk profile uses the minimum of capacity and tolerance as the risk ceiling, adjusted by need and time horizon. This ensures you never exceed your financial or psychological limits.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Asset Allocation by Profile</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Very Aggressive (9-10):</b> 90-100% stocks</li>
        <li><b>Aggressive (7.5-9):</b> 80-90% stocks</li>
        <li><b>Moderately Aggressive (6-7.5):</b> 60-80% stocks</li>
        <li><b>Moderate (4-6):</b> 40-60% stocks</li>
        <li><b>Conservative (2.5-4):</b> 20-40% stocks</li>
        <li><b>Very Conservative (1-2.5):</b> 0-20% stocks</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Managing Misalignment</h3>
    <p>If need exceeds capacity/tolerance:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Extend time horizon</li>
        <li>Reduce goal amount</li>
        <li>Increase contribution rate</li>
        <li>Adjust expectations</li>
        <li>Do NOT exceed capacity or tolerance</li>
    </ul>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Risk profile assessment evaluates risk capacity, tolerance, and need to determine appropriate investment strategy. By balancing these three dimensions and ensuring alignment, investors can develop portfolios that match their financial ability, psychological comfort, and goal requirements. Regular reassessment ensures the risk profile remains appropriate as circumstances change, supporting optimal investment outcomes while maintaining financial and emotional well-being.</p>
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
          <p>This tool assesses comprehensive risk profile by evaluating risk capacity, risk tolerance, and risk need to determine appropriate investment strategy.</p>
          <p>Outputs include overall risk profile, risk profile category, profile alignment, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

