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
  totalMonthlyIncome: z.number({ invalid_type_error: 'Enter total monthly income' }).min(0),
  needsSpending: z.number({ invalid_type_error: 'Enter needs spending' }).min(0),
  wantsSpending: z.number({ invalid_type_error: 'Enter wants spending' }).min(0),
  savingsDebtRepayment: z.number({ invalid_type_error: 'Enter savings/debt repayment' }).min(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  totalMonthlyIncome: number;
  needsSpending: number;
  wantsSpending: number;
  savingsDebtRepayment: number;
  totalSpending: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
  recommendedNeeds: number;
  recommendedWants: number;
  recommendedSavings: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter your total monthly income (after-tax).',
  'Enter your monthly spending on needs (essential expenses).',
  'Enter your monthly spending on wants (discretionary expenses).',
  'Enter your monthly savings and debt repayment amount.',
  'Review spending split, percentages, and recommendations against the 50/30/20 rule.',
];

const faqs = [
  {
    question: 'What is needs vs wants split?',
    answer:
      'Needs vs wants split categorizes spending into essential expenses (needs) and discretionary expenses (wants). Needs include housing, utilities, groceries, transportation, insurance, and basic clothing. Wants include dining out, entertainment, vacations, luxury items, and subscriptions.',
  },
  {
    question: 'What is the 50/30/20 rule?',
    answer:
      'The 50/30/20 rule is a budgeting guideline suggesting: 50% of after-tax income for needs (essential expenses), 30% for wants (discretionary spending), and 20% for savings and debt repayment. This rule helps balance current expenses with future financial security.',
  },
  {
    question: 'How do I categorize needs vs wants?',
    answer:
      'Needs are essential expenses required for daily living and work: housing (rent/mortgage), utilities, groceries, transportation, insurance, healthcare, minimum debt payments, basic clothing. Wants are non-essential expenses: dining out, entertainment, vacations, luxury items, subscriptions, hobbies, premium services, and non-essential upgrades.',
  },
  {
    question: 'What if my needs exceed 50%?',
    answer:
      'If needs exceed 50%, you may be in a high-cost area or have high essential expenses. Consider: reducing wants to compensate, finding ways to reduce need costs (smaller housing, cheaper transportation), increasing income, and accepting that the 50/30/20 rule may need adjustment for your situation. Prioritize maintaining the 20% savings/debt repayment.',
  },
  {
    question: 'What if my wants exceed 30%?',
    answer:
      'If wants exceed 30%, you\'re spending too much on discretionary items. This limits savings and debt repayment. Reduce wants by: cutting non-essential subscriptions, reducing dining out frequency, limiting entertainment spending, postponing luxury purchases, and redirecting savings to savings/debt repayment goals.',
  },
  {
    question: 'Why is the 20% savings/debt repayment important?',
    answer:
      'The 20% savings/debt repayment builds emergency funds, retirement savings, and pays down debt. Without this allocation, financial security is compromised. Even if needs or wants are high, prioritize maintaining or increasing the 20% allocation for long-term financial health.',
  },
  {
    question: 'How do I reduce needs spending?',
    answer:
      'Reduce needs by: downsizing housing, using public transportation or carpooling, shopping for better insurance rates, meal planning to reduce grocery costs, using energy-efficient appliances, and negotiating bills. Some needs are fixed, but many can be optimized.',
  },
  {
    question: 'How do I reduce wants spending?',
    answer:
      'Reduce wants by: canceling unused subscriptions, cooking at home instead of dining out, finding free entertainment alternatives, setting spending limits for discretionary categories, using cash envelopes for wants, and implementing a waiting period for non-essential purchases.',
  },
  {
    question: 'Should I adjust the 50/30/20 rule?',
    answer:
      'The 50/30/20 rule is a guideline, not absolute. Adjust based on: income level (very high or very low may need different splits), location (high-cost areas may require higher needs percentage), life stage (students may have different needs), and financial goals (aggressive savings may require higher savings percentage).',
  },
  {
    question: 'How often should I analyze my spending split?',
    answer:
      'Analyze spending split monthly to track progress and identify trends. Review quarterly for major adjustments. Monitor continuously through budgeting apps. Regular analysis helps identify drift (wants increasing over time) and ensures alignment with financial goals.',
  },
];

const relatedCalculators = [
  {
    name: 'Mental Accounting (Budget Segmentation) Tool',
    slug: 'mental-accounting-budget-segmentation-tool',
    description: 'Segment budget into mental accounts.',
  },
  {
    name: 'Lifestyle Inflation Impact Calculator',
    slug: 'lifestyle-inflation-impact-calculator',
    description: 'Calculate lifestyle inflation impact.',
  },
  {
    name: 'Budget Planner Calculator',
    slug: 'budget-planner-calculator',
    description: 'Plan your budget.',
  },
  {
    name: 'Savings Goal Timeline Calculator',
    slug: 'savings-goal-timeline-calculator',
    description: 'Calculate savings timelines.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/spending-habit-analyzer-needs-vs-wants-split';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Spending Habit Analyzer (Needs vs Wants Split)', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Spending Habit Analyzer (Needs vs Wants Split)',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Analyze spending habits by splitting expenses into needs vs wants and comparing against the 50/30/20 budgeting rule.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const totalMonthlyIncome = values.totalMonthlyIncome;
  const needsSpending = values.needsSpending;
  const wantsSpending = values.wantsSpending;
  const savingsDebtRepayment = values.savingsDebtRepayment;
  
  const totalSpending = needsSpending + wantsSpending + savingsDebtRepayment;
  
  const needsPercentage = totalMonthlyIncome > 0 ? (needsSpending / totalMonthlyIncome) * 100 : 0;
  const wantsPercentage = totalMonthlyIncome > 0 ? (wantsSpending / totalMonthlyIncome) * 100 : 0;
  const savingsPercentage = totalMonthlyIncome > 0 ? (savingsDebtRepayment / totalMonthlyIncome) * 100 : 0;
  
  // 50/30/20 rule recommendations
  const recommendedNeeds = totalMonthlyIncome * 0.5;
  const recommendedWants = totalMonthlyIncome * 0.3;
  const recommendedSavings = totalMonthlyIncome * 0.2;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Your spending split: Needs ${needsPercentage.toFixed(1)}%, Wants ${wantsPercentage.toFixed(1)}%, Savings/Debt ${savingsPercentage.toFixed(1)}%. `;
  
  if (Math.abs(needsPercentage - 50) <= 5 && Math.abs(wantsPercentage - 30) <= 5 && Math.abs(savingsPercentage - 20) <= 5) {
    status = 'optimal';
    interpretation += 'Well-aligned with 50/30/20 rule - excellent balance between needs, wants, and savings.';
  } else if (needsPercentage <= 55 && wantsPercentage <= 35 && savingsPercentage >= 15) {
    status = 'good';
    interpretation += 'Good alignment with 50/30/20 rule - minor adjustments may optimize further.';
  } else if (needsPercentage <= 60 && wantsPercentage <= 40 && savingsPercentage >= 10) {
    status = 'moderate';
    interpretation += 'Moderate alignment - consider adjusting to better match 50/30/20 rule for improved financial health.';
  } else {
    status = 'low';
    interpretation += 'Needs significant adjustment - prioritize reducing wants and/or needs to achieve better balance with savings goals.';
  }
  
  if (totalSpending > totalMonthlyIncome) {
    status = 'low';
    interpretation += ' WARNING: Spending exceeds income - this is unsustainable and requires immediate action.';
  }

  const recommendations: string[] = [];
  
  // Build first recommendation
  let firstRec = `Spending analysis: Needs ${needsPercentage.toFixed(1)}% (target 50%), Wants ${wantsPercentage.toFixed(1)}% (target 30%), Savings/Debt ${savingsPercentage.toFixed(1)}% (target 20%).`;
  if (Math.abs(needsPercentage - 50) <= 5 && Math.abs(wantsPercentage - 30) <= 5 && Math.abs(savingsPercentage - 20) <= 5) {
    firstRec += ' Excellent alignment with 50/30/20 rule.';
  } else {
    firstRec += ' Consider adjusting to better align with 50/30/20 rule for optimal financial health.';
  }
  recommendations.push(firstRec);
  
  // Build needs recommendation
  let needsRec = `Needs spending: ${needsPercentage.toFixed(1)}% vs. 50% target.`;
  if (needsPercentage > 55) {
    needsRec += ' High needs spending may indicate high-cost area or opportunities to reduce essential expenses. Consider downsizing housing, optimizing transportation, or negotiating bills.';
  } else if (needsPercentage < 45) {
    needsRec += ' Low needs spending leaves room for savings or wants, but ensure essential needs are met.';
  } else {
    needsRec += ' Needs spending is well-aligned with target.';
  }
  recommendations.push(needsRec);
  
  // Build wants recommendation
  let wantsRec = `Wants spending: ${wantsPercentage.toFixed(1)}% vs. 30% target.`;
  if (wantsPercentage > 35) {
    wantsRec += ' High wants spending limits savings potential. Reduce discretionary spending by cutting subscriptions, limiting dining out, and postponing luxury purchases. Redirect savings to savings/debt repayment.';
  } else if (wantsPercentage < 25) {
    wantsRec += ' Low wants spending allows for more savings, but ensure quality of life is maintained.';
  } else {
    wantsRec += ' Wants spending is well-aligned with target.';
  }
  recommendations.push(wantsRec);
  
  // Build savings recommendation
  let savingsRec = `Savings/Debt repayment: ${savingsPercentage.toFixed(1)}% vs. 20% target.`;
  if (savingsPercentage < 15) {
    savingsRec += ' Low savings/debt repayment threatens financial security. Prioritize increasing this allocation - reduce wants and/or needs if necessary. This 20% is critical for emergency funds, retirement, and debt reduction.';
  } else if (savingsPercentage >= 20) {
    savingsRec += ' Good savings/debt repayment allocation supports financial security.';
  } else {
    savingsRec += ' Consider increasing savings/debt repayment closer to 20% target.';
  }
  recommendations.push(savingsRec);
  
  if (totalSpending > totalMonthlyIncome) {
    recommendations.push('CRITICAL: Spending exceeds income - this is unsustainable and requires immediate action. Reduce spending across all categories, prioritize essential needs, eliminate non-essential wants, and find ways to increase income or reduce expenses immediately.');
  }
  if (needsPercentage > 60) {
    recommendations.push('Very high needs percentage: If you\'re in a high-cost area, this may be unavoidable. However, explore ways to reduce needs costs (smaller housing, cheaper transportation, better insurance rates). Consider if relocation or income increase could help balance the split.');
  }

  const plan = [
    { label: 'This Week', detail: `Analyze spending split: Needs ${needsPercentage.toFixed(1)}%, Wants ${wantsPercentage.toFixed(1)}%, Savings ${savingsPercentage.toFixed(1)}%. Compare to 50/30/20 targets and identify areas for adjustment.` },
  ];
  
  // Build month plan detail
  let monthDetail = 'Adjust spending to better align with 50/30/20 rule:';
  if (needsPercentage > 50) {
    monthDetail += ` Reduce needs spending from ${needsSpending.toLocaleString()} to ${recommendedNeeds.toLocaleString()} (target 50%).`;
  }
  if (wantsPercentage > 30) {
    monthDetail += ` Reduce wants spending from ${wantsSpending.toLocaleString()} to ${recommendedWants.toLocaleString()} (target 30%).`;
  }
  if (savingsPercentage < 20) {
    monthDetail += ` Increase savings/debt repayment from ${savingsDebtRepayment.toLocaleString()} to ${recommendedSavings.toLocaleString()} (target 20%).`;
  }
  if (needsPercentage <= 50 && wantsPercentage <= 30 && savingsPercentage >= 20) {
    monthDetail += ' Maintain current allocations.';
  }
  plan.push({ label: 'This Month', detail: monthDetail });
  plan.push({ label: 'Ongoing', detail: 'Monitor spending split monthly and track progress toward 50/30/20 targets. Use budgeting apps to track expenses by category. Regularly review and adjust as income or expenses change. Maintain discipline in limiting wants and prioritizing the 20% savings/debt repayment allocation.' });

  return { totalMonthlyIncome, needsSpending, wantsSpending, savingsDebtRepayment, totalSpending, needsPercentage, wantsPercentage, savingsPercentage, recommendedNeeds, recommendedWants, recommendedSavings, interpretation, status, recommendations, plan };
};

export default function SpendingHabitAnalyzerNeedsVsWantsSplit() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalMonthlyIncome: undefined,
      needsSpending: undefined,
      wantsSpending: undefined,
      savingsDebtRepayment: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="spending-habit-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Spending Habit Analyzer (Needs vs Wants Split)
          </CardTitle>
          <CardDescription>Analyze spending habits by splitting expenses into needs vs wants and comparing against the 50/30/20 budgeting rule.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your monthly spending data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalMonthlyIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Monthly Income (After-Tax)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="needsSpending"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Needs Spending (Monthly)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 2500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Essential expenses (housing, utilities, groceries, etc.)</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="wantsSpending"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wants Spending (Monthly)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1500" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Discretionary expenses (dining, entertainment, etc.)</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="savingsDebtRepayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Savings & Debt Repayment (Monthly)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Savings and debt payments</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Analyze Spending Habits
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
            <CardDescription>See spending split analysis and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Needs</p>
                <p className="text-2xl font-semibold text-primary">{result.needsPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Target: 50%</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Wants</p>
                <p className="text-2xl font-semibold text-primary">{result.wantsPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Target: 30%</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Savings/Debt</p>
                <p className="text-2xl font-semibold text-primary">{result.savingsPercentage.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Target: 20%</p>
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
            <strong>Needs Percentage</strong> = (Needs Spending / Total Monthly Income) × 100
          </p>
          <p>
            <strong>Wants Percentage</strong> = (Wants Spending / Total Monthly Income) × 100
          </p>
          <p>
            <strong>Savings/Debt Percentage</strong> = (Savings & Debt Repayment / Total Monthly Income) × 100
          </p>
          <p>
            <strong>50/30/20 Rule Targets:</strong>
          </p>
          <p>Needs: 50% of income</p>
          <p>Wants: 30% of income</p>
          <p>Savings/Debt: 20% of income</p>
          <p>The 50/30/20 rule provides a balanced framework for allocating after-tax income. Needs are essential expenses, wants are discretionary expenses, and the 20% savings/debt repayment allocation ensures financial security and debt reduction. This split helps balance current lifestyle with future financial goals.</p>
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
                <p className="text-sm text-muted-foreground">Recommended Needs</p>
                <p className="text-xl font-semibold text-primary">{result.recommendedNeeds.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">50% of income</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended Wants</p>
                <p className="text-xl font-semibold text-primary">{result.recommendedWants.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">30% of income</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Recommended Savings</p>
                <p className="text-xl font-semibold text-primary">{result.recommendedSavings.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">20% of income</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your monthly spending data to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Spending Habit Analysis: Needs vs Wants Split and 50/30/20 Rule" />
    <meta itemProp="description" content="An in-depth guide on analyzing spending habits, distinguishing needs from wants, and applying the 50/30/20 budgeting rule for financial health." />
    <meta itemProp="keywords" content="spending habit analyzer, needs vs wants, 50/30/20 rule, budget analysis, financial planning, spending split" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/category/finance/spending-habit-analyzer-needs-vs-wants-split" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Spending Habit Analysis: Needs vs Wants Split and 50/30/20 Rule</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at analyzing spending habits, distinguishing needs from wants, and applying the 50/30/20 budgeting rule for optimal financial health.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Understanding Needs vs Wants</a></li>
        <li><a href="#rule" className="hover:underline">The 50/30/20 Rule</a></li>
        <li><a href="#categorization" className="hover:underline">Categorizing Expenses</a></li>
        <li><a href="#analysis" className="hover:underline">Spending Analysis</a></li>
        <li><a href="#adjustment" className="hover:underline">Adjusting Spending</a></li>
        <li><a href="#application" className="hover:underline">Practical Application</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Needs vs Wants</h2>
    <p>Distinguishing between needs and wants is fundamental to effective budgeting and financial planning.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Needs (Essential Expenses)</h3>
    <p>Needs are expenses required for daily living and work:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Housing (rent/mortgage)</li>
        <li>Utilities (electricity, water, gas, internet)</li>
        <li>Groceries and essential food</li>
        <li>Transportation (car payments, gas, public transit)</li>
        <li>Insurance (health, auto, home)</li>
        <li>Healthcare and medications</li>
        <li>Minimum debt payments</li>
        <li>Basic clothing</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Wants (Discretionary Expenses)</h3>
    <p>Wants are non-essential expenses that enhance lifestyle:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Dining out and restaurants</li>
        <li>Entertainment (movies, concerts, streaming)</li>
        <li>Vacations and travel</li>
        <li>Luxury items</li>
        <li>Non-essential subscriptions</li>
        <li>Hobbies and recreation</li>
        <li>Premium services and upgrades</li>
    </ul>

<hr className="my-6" />

    <h2 id="rule" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 50/30/20 Rule</h2>
    <p>The 50/30/20 rule is a simple budgeting framework that allocates after-tax income into three categories.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Rule Breakdown</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>50% to Needs:</b> Essential expenses required for daily living</li>
        <li><b>30% to Wants:</b> Discretionary spending for lifestyle enjoyment</li>
        <li><b>20% to Savings and Debt Repayment:</b> Building financial security and reducing debt</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Benefits</h3>
    <p>The 50/30/20 rule provides:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Simple framework for budgeting</li>
        <li>Balance between current and future needs</li>
        <li>Clear allocation guidelines</li>
        <li>Flexibility for different income levels</li>
    </ul>

<hr className="my-6" />

    <h2 id="categorization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Categorizing Expenses</h2>
    <p>Proper categorization is essential for accurate analysis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Tips for Categorization</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Review bank statements and receipts</li>
        <li>Use budgeting apps to track expenses</li>
        <li>Be honest about needs vs wants</li>
        <li>Consider the essential nature of each expense</li>
        <li>Review and adjust categories regularly</li>
    </ul>

<hr className="my-6" />

    <h2 id="analysis" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Spending Analysis</h2>
    <p>Analyze your spending split to identify areas for improvement.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Analysis Steps</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Calculate percentages for each category</li>
        <li>Compare to 50/30/20 targets</li>
        <li>Identify areas exceeding targets</li>
        <li>Determine adjustment priorities</li>
    </ul>

<hr className="my-6" />

    <h2 id="adjustment" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Adjusting Spending</h2>
    <p>Adjust spending to better align with 50/30/20 rule.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reducing Needs</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Downsize housing if possible</li>
        <li>Optimize transportation costs</li>
        <li>Shop for better insurance rates</li>
        <li>Meal plan to reduce grocery costs</li>
        <li>Use energy-efficient appliances</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reducing Wants</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Cancel unused subscriptions</li>
        <li>Cook at home more often</li>
        <li>Find free entertainment alternatives</li>
        <li>Set spending limits for discretionary categories</li>
        <li>Implement waiting periods for purchases</li>
    </ul>

<hr className="my-6" />

    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Practical Application</h2>
    <p>Apply the 50/30/20 rule to improve financial health.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Implementation</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Calculate your current split</li>
        <li>Set target allocations</li>
        <li>Adjust spending gradually</li>
        <li>Monitor progress monthly</li>
        <li>Maintain discipline</li>
    </ul>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Analyzing spending habits through needs vs wants split and applying the 50/30/20 rule provides a structured approach to budgeting. By distinguishing essential expenses from discretionary spending and maintaining the critical 20% allocation for savings and debt repayment, individuals can achieve better financial balance, ensuring both current lifestyle enjoyment and future financial security.</p>
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
          <p>This tool analyzes spending habits by splitting expenses into needs vs wants and comparing against the 50/30/20 budgeting rule.</p>
          <p>Outputs include spending percentages, recommended allocations, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
