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
  financialGoalsRating: z.number({ invalid_type_error: 'Enter financial goals rating' }).min(1).max(10),
  timeHorizonRating: z.number({ invalid_type_error: 'Enter time horizon rating' }).min(1).max(10),
  personalAttitudeRating: z.number({ invalid_type_error: 'Enter personal attitude rating' }).min(1).max(10),
  lossCapacityRating: z.number({ invalid_type_error: 'Enter loss capacity rating' }).min(1).max(10).optional(),
  investmentExperienceRating: z.number({ invalid_type_error: 'Enter investment experience rating' }).min(1).max(10).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  financialGoalsRating: number;
  timeHorizonRating: number;
  personalAttitudeRating: number;
  lossCapacityRating: number;
  investmentExperienceRating: number;
  riskToleranceScore: number;
  riskProfile: string;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Rate your financial goals (1-10, where 10 = aggressive growth, 1 = capital preservation).',
  'Rate your time horizon (1-10, where 10 = 20+ years, 1 = less than 1 year).',
  'Rate your personal attitude toward risk (1-10, where 10 = very comfortable with risk, 1 = very risk-averse).',
  'Optionally rate your loss capacity and investment experience.',
  'Review risk tolerance score, risk profile, and recommendations.',
];

const faqs = [
  {
    question: 'What is risk tolerance score?',
    answer:
      'Risk tolerance score quantifies your willingness and ability to accept investment risk. It combines multiple factors including financial goals, time horizon, personal attitude, loss capacity, and investment experience to determine an overall risk profile.',
  },
  {
    question: 'How is risk tolerance score calculated?',
    answer:
      'Risk Tolerance Score = Average of (Financial Goals Rating + Time Horizon Rating + Personal Attitude Rating + Optional Factors). The score ranges from 1-10, with higher scores indicating higher risk tolerance. Some calculations weight factors differently or use additional components.',
  },
  {
    question: 'What do the ratings mean?',
    answer:
      'Ratings from 1-10 indicate: Financial Goals (1=preservation, 10=aggressive growth), Time Horizon (1=<1 year, 10=20+ years), Personal Attitude (1=very risk-averse, 10=very risk-tolerant), Loss Capacity (1=no loss tolerance, 10=high loss capacity), Investment Experience (1=no experience, 10=extensive experience).',
  },
  {
    question: 'What risk profiles exist?',
    answer:
      'Common risk profiles: Very Conservative (1-2.5), Conservative (2.5-4), Moderate (4-6), Moderately Aggressive (6-7.5), Aggressive (7.5-9), Very Aggressive (9-10). These profiles guide asset allocation and investment strategy.',
  },
  {
    question: 'How does time horizon affect risk tolerance?',
    answer:
      'Longer time horizons allow greater risk tolerance because there is more time to recover from losses. Short-term goals require conservative approaches to preserve capital. Time horizon is a critical factor in risk tolerance assessment.',
  },
  {
    question: 'What is loss capacity?',
    answer:
      'Loss capacity is your ability to absorb investment losses without significant financial hardship. It considers your financial resources, income stability, expenses, and other assets. High loss capacity enables higher risk tolerance.',
  },
  {
    question: 'How does investment experience affect risk tolerance?',
    answer:
      'Investment experience affects both willingness and ability to take risk. Experienced investors may be more comfortable with volatility and better understand risk. However, overconfidence from experience can lead to excessive risk-taking.',
  },
  {
    question: 'Should risk tolerance change over time?',
    answer:
      'Yes, risk tolerance should be reassessed periodically as circumstances change. Factors affecting risk tolerance include: age, wealth, income, financial goals, life events, market experiences, and changes in financial situation.',
  },
  {
    question: 'How do I use risk tolerance score for investing?',
    answer:
      'Use your risk tolerance score to guide asset allocation. Conservative scores suggest higher allocation to bonds and cash. Aggressive scores suggest higher allocation to stocks and riskier assets. Match portfolio risk to your risk tolerance to avoid overexposure or underexposure.',
  },
  {
    question: 'What if my score doesn\'t match my current portfolio?',
    answer:
      'If your portfolio risk exceeds your risk tolerance, consider reducing exposure to risky assets. If your portfolio is too conservative relative to risk tolerance, you may be missing growth opportunities. Align portfolio with risk tolerance to optimize risk-return balance.',
  },
];

const relatedCalculators = [
  {
    name: 'Risk Aversion Coefficient Calculator',
    slug: 'risk-aversion-coefficient-calculator',
    description: 'Calculate risk aversion coefficients.',
  },
  {
    name: 'Expected Utility of Wealth Calculator',
    slug: 'expected-utility-of-wealth-calculator',
    description: 'Calculate expected utility for decisions.',
  },
  {
    name: 'Position Sizing Calculator',
    slug: 'position-sizing-calculator',
    description: 'Calculate optimal position sizes.',
  },
  {
    name: 'Portfolio Rebalancing Planner',
    slug: 'portfolio-rebalancing-planner',
    description: 'Plan portfolio rebalancing.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/risk-tolerance-score-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Risk Tolerance Score Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Risk Tolerance Score Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate risk tolerance score based on financial goals, time horizon, personal attitude, and other risk factors.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const getRiskProfile = (score: number): string => {
  if (score >= 9) return 'Very Aggressive';
  if (score >= 7.5) return 'Aggressive';
  if (score >= 6) return 'Moderately Aggressive';
  if (score >= 4) return 'Moderate';
  if (score >= 2.5) return 'Conservative';
  return 'Very Conservative';
};

const calculateResult = (values: FormValues): ResultPayload => {
  const financialGoalsRating = values.financialGoalsRating;
  const timeHorizonRating = values.timeHorizonRating;
  const personalAttitudeRating = values.personalAttitudeRating;
  const lossCapacityRating = values.lossCapacityRating ?? (financialGoalsRating + timeHorizonRating + personalAttitudeRating) / 3;
  const investmentExperienceRating = values.investmentExperienceRating ?? (financialGoalsRating + timeHorizonRating + personalAttitudeRating) / 3;
  
  // Risk Tolerance Score = Average of all ratings
  const riskToleranceScore = (financialGoalsRating + timeHorizonRating + personalAttitudeRating + lossCapacityRating + investmentExperienceRating) / 5;
  
  const riskProfile = getRiskProfile(riskToleranceScore);
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Risk tolerance score of ${riskToleranceScore.toFixed(2)} indicates a ${riskProfile} risk profile. This suggests ${riskProfile === 'Very Conservative' || riskProfile === 'Conservative' ? 'a conservative approach with focus on capital preservation' : riskProfile === 'Moderate' ? 'a balanced approach between growth and preservation' : riskProfile === 'Aggressive' || riskProfile === 'Very Aggressive' ? 'a growth-oriented approach with willingness to accept higher volatility' : 'a moderately aggressive approach with focus on capital appreciation'}.`;
  
  if (riskToleranceScore >= 7.5) {
    status = 'good';
  } else if (riskToleranceScore >= 4) {
    status = 'optimal';
  } else {
    status = 'moderate';
  }

  const recommendations = [
    `Align portfolio with risk profile: ${riskProfile} profile (score ${riskToleranceScore.toFixed(2)}) suggests appropriate asset allocation. Conservative profiles favor bonds and cash; aggressive profiles favor stocks and alternative investments.`,
    `Review portfolio risk: Ensure your current portfolio's risk level matches your risk tolerance score. If portfolio risk exceeds tolerance, reduce exposure to risky assets. If below tolerance, consider increasing growth-oriented investments.`,
    `Consider all factors: Financial goals (${financialGoalsRating}/10), time horizon (${timeHorizonRating}/10), and personal attitude (${personalAttitudeRating}/10) all influence risk tolerance. Balance these factors when making investment decisions.`,
    `Reassess periodically: Risk tolerance can change with age, wealth, life events, and market experiences. Review your risk tolerance annually or when major life changes occur to ensure portfolio alignment.`,
  ];
  
  if (riskToleranceScore < 3) {
    recommendations.push('Very conservative profile: Focus on capital preservation through low-risk investments. Consider if you may be too conservative, potentially missing growth opportunities for long-term goals.');
  }
  if (riskToleranceScore > 8) {
    recommendations.push('Very aggressive profile: Ensure you have adequate loss capacity and time horizon to support high-risk investments. Consider diversification to manage extreme risk exposure.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate risk tolerance: Score ${riskToleranceScore.toFixed(2)} (${riskProfile} profile) based on financial goals, time horizon, and risk attitude. Document all ratings and assumptions.` },
    { label: 'This Month', detail: 'Review current portfolio allocation against risk tolerance score. Identify any misalignment between portfolio risk and risk tolerance. Adjust asset allocation to match risk profile as needed.' },
    { label: 'Ongoing', detail: 'Reassess risk tolerance periodically (annually or after major life changes). Update portfolio allocation as risk tolerance evolves. Ensure investment strategy remains aligned with risk profile and financial goals.' },
  ];

  return { financialGoalsRating, timeHorizonRating, personalAttitudeRating, lossCapacityRating, investmentExperienceRating, riskToleranceScore, riskProfile, interpretation, status, recommendations, plan };
};

export default function RiskToleranceScoreCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialGoalsRating: undefined,
      timeHorizonRating: undefined,
      personalAttitudeRating: undefined,
      lossCapacityRating: undefined,
      investmentExperienceRating: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="risk-tolerance-score-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Risk Tolerance Score Calculator
          </CardTitle>
          <CardDescription>Calculate risk tolerance score based on financial goals, time horizon, personal attitude, and other risk factors.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your risk tolerance factors</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="financialGoalsRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Financial Goals Rating (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="1" max="10" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">1=Preservation, 10=Aggressive growth</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeHorizonRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Horizon Rating (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="1" max="10" placeholder="e.g., 8" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">1=&lt;1 year, 10=20+ years</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="personalAttitudeRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Attitude Rating (1-10)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="1" max="10" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">1=Very risk-averse, 10=Very risk-tolerant</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lossCapacityRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loss Capacity Rating (1-10) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="1" max="10" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">1=No loss capacity, 10=High loss capacity</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investmentExperienceRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Experience Rating (1-10) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="1" max="10" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">1=No experience, 10=Extensive experience</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Risk Tolerance Score
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
            <CardDescription>See risk tolerance score and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Tolerance Score</p>
                <p className="text-2xl font-semibold text-primary">{result.riskToleranceScore.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Risk Profile</p>
                <p className="text-2xl font-semibold text-primary">{result.riskProfile}</p>
                <p className="text-xs text-muted-foreground">Profile category</p>
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
            <strong>Risk Tolerance Score</strong> = (Financial Goals Rating + Time Horizon Rating + Personal Attitude Rating + Loss Capacity Rating + Investment Experience Rating) / 5
          </p>
          <p>
            <strong>Risk Profile Categories:</strong>
          </p>
          <p>Very Conservative: 1.0 - 2.5</p>
          <p>Conservative: 2.5 - 4.0</p>
          <p>Moderate: 4.0 - 6.0</p>
          <p>Moderately Aggressive: 6.0 - 7.5</p>
          <p>Aggressive: 7.5 - 9.0</p>
          <p>Very Aggressive: 9.0 - 10.0</p>
          <p>Risk tolerance score combines multiple factors to assess your overall willingness and ability to accept investment risk. Higher scores indicate higher risk tolerance and support more aggressive investment strategies. The score guides appropriate asset allocation and portfolio construction.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Goals Rating</p>
                <p className="text-xl font-semibold text-primary">{result.financialGoalsRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Financial goals</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Horizon Rating</p>
                <p className="text-xl font-semibold text-primary">{result.timeHorizonRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Time horizon</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Attitude Rating</p>
                <p className="text-xl font-semibold text-primary">{result.personalAttitudeRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Risk attitude</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Loss Capacity</p>
                <p className="text-xl font-semibold text-primary">{result.lossCapacityRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Ability to absorb losses</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="text-xl font-semibold text-primary">{result.investmentExperienceRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Investment experience</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your risk tolerance factors to see additional insights.</p>
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
                <Link href={`/category/finance/${calc.slug}`} className="text-primary hover:underline">
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
    <meta itemProp="name" content="The Complete Guide to Risk Tolerance Score: Assessment and Portfolio Alignment" />
    <meta itemProp="description" content="An in-depth guide on calculating risk tolerance scores, understanding risk profiles, and using risk tolerance for investment portfolio alignment." />
    <meta itemProp="keywords" content="risk tolerance score, risk tolerance questionnaire, investment risk assessment, risk profile, portfolio allocation" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/category/finance/risk-tolerance-score-calculator" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Risk Tolerance Score: Assessment and Portfolio Alignment</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at risk tolerance scoring, risk profiles, and aligning investment portfolios with risk tolerance.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Understanding Risk Tolerance</a></li>
        <li><a href="#factors" className="hover:underline">Factors Affecting Risk Tolerance</a></li>
        <li><a href="#scoring" className="hover:underline">Scoring Methodology</a></li>
        <li><a href="#profiles" className="hover:underline">Risk Profiles</a></li>
        <li><a href="#application" className="hover:underline">Applying Risk Tolerance</a></li>
        <li><a href="#review" className="hover:underline">Regular Review and Updates</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Risk Tolerance</h2>
    <p>Risk tolerance is your willingness and ability to accept investment risk. It combines psychological factors (comfort with volatility) and financial factors (ability to absorb losses) to determine appropriate investment strategies.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Components of Risk Tolerance</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Willingness to Take Risk:</b> Psychological comfort with volatility and potential losses</li>
        <li><b>Ability to Take Risk:</b> Financial capacity to absorb losses without significant hardship</li>
        <li><b>Need to Take Risk:</b> Required risk level to achieve financial goals</li>
    </ul>
    <p>Optimal risk tolerance balances all three components, though willingness and ability are primary factors.</p>

<hr className="my-6" />

    <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors Affecting Risk Tolerance</h2>
    <p>Multiple factors influence your risk tolerance score.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Financial Goals</h3>
    <p>Your financial objectives determine risk needs:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Capital Preservation (1-3):</b> Protecting principal, minimizing risk</li>
        <li><b>Income Generation (4-6):</b> Balanced approach, moderate growth</li>
        <li><b>Capital Appreciation (7-10):</b> Growth-focused, accepting higher risk</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Time Horizon</h3>
    <p>Investment timeframe significantly affects risk tolerance:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Short-Term (&lt; 1 year):</b> Low risk tolerance - preserve capital</li>
        <li><b>Medium-Term (1-5 years):</b> Moderate risk tolerance - balanced approach</li>
        <li><b>Long-Term (5-10 years):</b> Higher risk tolerance - growth focus</li>
        <li><b>Very Long-Term (10+ years):</b> Highest risk tolerance - maximum growth potential</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Personal Attitude</h3>
    <p>Your psychological comfort with risk affects willingness to take risk. This includes:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Comfort with portfolio volatility</li>
        <li>Emotional response to losses</li>
        <li>Sleep factor (can you sleep with portfolio risk?)</li>
        <li>Reaction to market downturns</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Loss Capacity</h3>
    <p>Your financial ability to absorb losses considers:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Total financial resources</li>
        <li>Income stability and future earnings potential</li>
        <li>Expenses and financial obligations</li>
        <li>Other assets and safety nets</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Investment Experience</h3>
    <p>Experience affects both ability and willingness:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Understanding of investment risks</li>
        <li>Familiarity with market volatility</li>
        <li>Past investment performance and lessons learned</li>
        <li>Knowledge of investment strategies</li>
    </ul>

<hr className="my-6" />

    <h2 id="scoring" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Scoring Methodology</h2>
    <p>Risk tolerance scoring combines multiple factors into a single metric.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Simple Average Method</h3>
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
        <p className="font-mono text-lg"><strong>Risk Tolerance Score = Average of All Factor Ratings</strong></p>
    </div>
    <p>This method treats all factors equally, providing a straightforward assessment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Weighted Methods</h3>
    <p>Some questionnaires weight factors differently, such as:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Time horizon (often heavily weighted)</li>
        <li>Personal attitude (psychological factor)</li>
        <li>Financial capacity (ability factor)</li>
    </ul>
    <p>Weighted methods may better reflect the relative importance of different factors.</p>

<hr className="my-6" />

    <h2 id="profiles" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risk Profiles</h2>
    <p>Risk tolerance scores map to risk profiles that guide investment strategies.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Very Conservative (1.0 - 2.5)</h3>
    <p>Characteristics:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Priority: Capital preservation</li>
        <li>Asset allocation: High allocation to bonds, cash, CDs</li>
        <li>Stock allocation: 0-20%</li>
        <li>Volatility tolerance: Very low</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Conservative (2.5 - 4.0)</h3>
    <p>Characteristics:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Priority: Preservation with modest growth</li>
        <li>Asset allocation: Bonds, cash, some stocks</li>
        <li>Stock allocation: 20-40%</li>
        <li>Volatility tolerance: Low</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Moderate (4.0 - 6.0)</h3>
    <p>Characteristics:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Priority: Balanced growth and preservation</li>
        <li>Asset allocation: Mix of stocks and bonds</li>
        <li>Stock allocation: 40-60%</li>
        <li>Volatility tolerance: Moderate</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Moderately Aggressive (6.0 - 7.5)</h3>
    <p>Characteristics:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Priority: Growth with some preservation</li>
        <li>Asset allocation: Stocks dominate, some bonds</li>
        <li>Stock allocation: 60-80%</li>
        <li>Volatility tolerance: Moderate to high</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Aggressive (7.5 - 9.0)</h3>
    <p>Characteristics:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Priority: Capital appreciation</li>
        <li>Asset allocation: Mostly stocks, minimal bonds</li>
        <li>Stock allocation: 80-90%</li>
        <li>Volatility tolerance: High</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Very Aggressive (9.0 - 10.0)</h3>
    <p>Characteristics:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Priority: Maximum growth</li>
        <li>Asset allocation: Stocks, alternative investments</li>
        <li>Stock allocation: 90-100%</li>
        <li>Volatility tolerance: Very high</li>
    </ul>

<hr className="my-6" />

    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applying Risk Tolerance</h2>
    <p>Use your risk tolerance score to guide investment decisions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Asset Allocation</h3>
    <p>Your risk profile suggests appropriate asset allocation:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Conservative profiles: Higher bond allocation, lower stock exposure</li>
        <li>Moderate profiles: Balanced mix of stocks and bonds</li>
        <li>Aggressive profiles: Higher stock allocation, growth focus</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Portfolio Construction</h3>
    <p>Build portfolios aligned with risk tolerance:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Match portfolio volatility to risk tolerance</li>
        <li>Ensure adequate diversification within risk constraints</li>
        <li>Consider tax efficiency and costs</li>
        <li>Rebalance to maintain target allocation</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Avoiding Mismatches</h3>
    <p>Common mismatches to avoid:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Portfolio too risky:</b> Causes stress, potential panic selling during downturns</li>
        <li><b>Portfolio too conservative:</b> Missing growth opportunities, may not meet long-term goals</li>
    </ul>

<hr className="my-6" />

    <h2 id="review" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Regular Review and Updates</h2>
    <p>Risk tolerance should be reassessed periodically as circumstances change.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">When to Reassess</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Annual review as standard practice</li>
        <li>Major life events (marriage, children, retirement, inheritance)</li>
        <li>Significant changes in financial situation</li>
        <li>After major market experiences</li>
        <li>Changes in financial goals or time horizons</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Updating Portfolio</h3>
    <p>When risk tolerance changes, adjust portfolio allocation gradually to avoid disruption and transaction costs. Consider tax implications of rebalancing.</p>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Risk tolerance score provides a quantitative measure of your willingness and ability to accept investment risk. By assessing financial goals, time horizon, personal attitude, loss capacity, and investment experience, you can determine an appropriate risk profile. This profile guides asset allocation and portfolio construction to ensure investments align with your risk comfort level while pursuing financial goals. Regular reassessment ensures your portfolio remains aligned as circumstances evolve.</p>
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
          <p>This tool calculates risk tolerance score based on financial goals, time horizon, personal attitude, and other risk factors.</p>
          <p>Outputs include risk tolerance score, risk profile, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
