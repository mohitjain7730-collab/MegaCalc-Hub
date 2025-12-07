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
  totalIncome: z.number({ invalid_type_error: 'Enter total income' }).min(0),
  account1Name: z.string().optional(),
  account1Percentage: z.number({ invalid_type_error: 'Enter account 1 percentage' }).min(0).max(100).optional(),
  account2Name: z.string().optional(),
  account2Percentage: z.number({ invalid_type_error: 'Enter account 2 percentage' }).min(0).max(100).optional(),
  account3Name: z.string().optional(),
  account3Percentage: z.number({ invalid_type_error: 'Enter account 3 percentage' }).min(0).max(100).optional(),
  account4Name: z.string().optional(),
  account4Percentage: z.number({ invalid_type_error: 'Enter account 4 percentage' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type AccountAllocation = {
  name: string;
  percentage: number;
  amount: number;
};

type ResultPayload = {
  totalIncome: number;
  accounts: AccountAllocation[];
  totalAllocated: number;
  remainingAmount: number;
  totalAllocatedPercent: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter total income or budget amount.',
  'For each mental account: Enter account name and allocation percentage (0-100%).',
  'Review budget segmentation, allocations, and recommendations.',
];

const faqs = [
  {
    question: 'What is mental accounting?',
    answer:
      'Mental accounting is a behavioral economics concept where individuals mentally categorize and treat money differently based on subjective criteria like source, intended use, or time. People create separate "mental accounts" for different expenses, affecting spending and saving decisions.',
  },
  {
    question: 'What is budget segmentation?',
    answer:
      'Budget segmentation divides total income into distinct categories or mental accounts (e.g., housing, food, entertainment, savings). Each account has its own allocation percentage and budget constraint, helping individuals monitor and control spending in specific areas.',
  },
  {
    question: 'How does mental accounting work?',
    answer:
      'Mental accounting creates psychological separation between different money categories. People treat money in different accounts differently - for example, being more willing to spend "windfall" money than "earned" money, or strictly controlling spending within account budgets while ignoring overall budget.',
  },
  {
    question: 'What are benefits of budget segmentation?',
    answer:
      'Benefits include: self-control mechanism to limit spending, better tracking of expenses by category, clearer financial goals for each account, reduced impulse spending, improved savings discipline, and better awareness of spending patterns.',
  },
  {
    question: 'What are drawbacks of mental accounting?',
    answer:
      'Drawbacks include: suboptimal resource allocation (money is fungible but treated differently), missing opportunities to optimize spending, ignoring fungibility of money, potential overspending in some categories while underspending others, and artificial constraints that don\'t reflect true preferences.',
  },
  {
    question: 'How do I allocate percentages?',
    answer:
      'Allocate based on spending priorities and financial goals. Common allocations: Housing 25-35%, Food 10-15%, Transportation 10-15%, Savings 10-20%, Entertainment 5-10%, Debt payments 10-20%, Other expenses. Ensure total allocations don\'t exceed 100%.',
  },
  {
    question: 'Should allocations equal 100%?',
    answer:
      'Ideally, allocations should total 100% or less. If less than 100%, the remainder can be unallocated buffer or emergency funds. If more than 100%, you\'re planning to overspend - reduce allocations or increase income to balance.',
  },
  {
    question: 'How often should I review allocations?',
    answer:
      'Review allocations monthly or quarterly to assess if they match actual spending patterns. Adjust allocations based on actual needs, changing priorities, and financial goals. Life changes may require reallocation.',
  },
  {
    question: 'Can I have more than 4 accounts?',
    answer:
      'Yes, you can create additional mental accounts. However, too many accounts can become unwieldy. Common practice is 5-8 categories. Combine related expenses if needed, or track subcategories within larger accounts.',
  },
  {
    question: 'How does mental accounting affect savings?',
    answer:
      'Mental accounting can help or hinder savings. When savings has its own account, people may save more consistently. However, treating different money sources differently (e.g., spending tax refunds but saving salary) can reduce overall savings efficiency.',
  },
];

const relatedCalculators = [
  {
    name: 'Monthly Budget Planner Calculator',
    slug: 'monthly-budget-planner-calculator',
    description: 'Plan monthly budgets.',
  },
  {
    name: 'Emergency Fund Requirement Calculator',
    slug: 'emergency-fund-requirement-calculator',
    description: 'Calculate emergency fund needs.',
  },
  {
    name: 'Net Worth Calculator',
    slug: 'net-worth-calculator',
    description: 'Calculate net worth.',
  },
  {
    name: 'Savings Goal Timeline Calculator',
    slug: 'savings-goal-timeline-calculator',
    description: 'Calculate savings timelines.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/mental-accounting-budget-segmentation-tool';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Mental Accounting (Budget Segmentation) Tool', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Mental Accounting (Budget Segmentation) Tool',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Segment budget into mental accounts for better spending control and financial management using mental accounting principles.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const totalIncome = values.totalIncome;
  
  const accounts: AccountAllocation[] = [];
  
  // Build accounts array from form values
  if (values.account1Name && values.account1Percentage !== undefined) {
    accounts.push({
      name: values.account1Name,
      percentage: values.account1Percentage,
      amount: totalIncome * (values.account1Percentage / 100),
    });
  }
  if (values.account2Name && values.account2Percentage !== undefined) {
    accounts.push({
      name: values.account2Name,
      percentage: values.account2Percentage,
      amount: totalIncome * (values.account2Percentage / 100),
    });
  }
  if (values.account3Name && values.account3Percentage !== undefined) {
    accounts.push({
      name: values.account3Name,
      percentage: values.account3Percentage,
      amount: totalIncome * (values.account3Percentage / 100),
    });
  }
  if (values.account4Name && values.account4Percentage !== undefined) {
    accounts.push({
      name: values.account4Name,
      percentage: values.account4Percentage,
      amount: totalIncome * (values.account4Percentage / 100),
    });
  }
  
  const totalAllocatedPercent = accounts.reduce((sum, acc) => sum + acc.percentage, 0);
  const totalAllocated = accounts.reduce((sum, acc) => sum + acc.amount, 0);
  const remainingAmount = totalIncome - totalAllocated;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = `Budget segmented into ${accounts.length} mental accounts. Total allocation: ${totalAllocatedPercent.toFixed(1)}% (${totalAllocated.toLocaleString()}), Remaining: ${remainingAmount.toLocaleString()} (${(100 - totalAllocatedPercent).toFixed(1)}%).`;
  
  if (totalAllocatedPercent > 100) {
    status = 'low';
    interpretation += ' Allocations exceed 100% - you are planning to overspend. Reduce allocations or increase income.';
  } else if (totalAllocatedPercent > 90) {
    status = 'good';
    interpretation += ' High allocation rate leaves minimal buffer. Consider maintaining some unallocated funds for flexibility.';
  } else if (totalAllocatedPercent < 70) {
    status = 'moderate';
    interpretation += ' Low allocation rate - significant unallocated funds. Consider allocating more for better spending control or designate remainder for specific purposes.';
  } else {
    status = 'optimal';
    interpretation += ' Allocation rate is balanced with reasonable buffer for unexpected expenses.';
  }

  const recommendations = [
    `Review allocations: Total ${totalAllocatedPercent.toFixed(1)}% allocated across ${accounts.length} accounts. ${totalAllocatedPercent > 100 ? 'Reduce allocations to avoid overspending.' : totalAllocatedPercent < 80 ? 'Consider allocating more for better spending control, or designate remaining funds for specific purposes (e.g., emergency fund, savings).' : 'Maintain allocations and monitor spending against each account budget.'}`,
    `Track spending by account: Monitor actual spending in each mental account (${accounts.map(acc => acc.name).join(', ')}). Compare to allocated amounts and adjust spending or allocations as needed to stay within account budgets.`,
    'Maintain account discipline: Resist the temptation to borrow from one account to fund another. Mental accounting works best when each account is treated independently. However, recognize that money is fungible and adjust if necessary.',
    `Optimize allocation efficiency: ${totalAllocatedPercent > 100 ? 'Critical: Reduce total allocations to 100% or less. Prioritize accounts and reduce lower-priority allocations.' : 'Current allocations are manageable. Consider whether allocation percentages match your actual spending priorities and financial goals.'}`,
  ];
  
  if (accounts.length < 3) {
    recommendations.push('Consider more accounts: Only 1-2 accounts may be too simplistic. Consider segmenting further (e.g., housing, food, transportation, savings, entertainment) for better spending control.');
  }
  if (remainingAmount > totalIncome * 0.3) {
    recommendations.push('Large unallocated amount: Consider allocating remaining funds to specific purposes (emergency fund, savings, investments) rather than leaving them unassigned, which may lead to unplanned spending.');
  }

  const plan = [
    { label: 'This Week', detail: `Set up budget segmentation: ${accounts.length} accounts totaling ${totalAllocatedPercent.toFixed(1)}% allocation. Document account names, percentages, and allocated amounts. Set up tracking system for each account.` },
    { label: 'This Month', detail: `Track spending against each mental account budget. Compare actual spending to allocated amounts for each account (${accounts.map(acc => acc.name).join(', ')}). Adjust spending behavior or allocations based on actual patterns.` },
    { label: 'Ongoing', detail: 'Monitor and review allocations monthly or quarterly. Adjust allocations based on changing priorities, actual spending patterns, and financial goals. Maintain discipline in staying within account budgets while recognizing when flexibility is needed.' },
  ];

  return { totalIncome, accounts, totalAllocated, remainingAmount, totalAllocatedPercent, interpretation, status, recommendations, plan };
};

export default function MentalAccountingBudgetSegmentationTool() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalIncome: undefined,
      account1Name: undefined,
      account1Percentage: undefined,
      account2Name: undefined,
      account2Percentage: undefined,
      account3Name: undefined,
      account3Percentage: undefined,
      account4Name: undefined,
      account4Percentage: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="mental-accounting-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Mental Accounting (Budget Segmentation) Tool
          </CardTitle>
          <CardDescription>Segment budget into mental accounts for better spending control and financial management using mental accounting principles.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your budget segmentation data</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="totalIncome"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Total Income / Budget</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="account1Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account 1 Name (Optional)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., Housing" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="account1Percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account 1 Percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0" max="100" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="account2Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account 2 Name (Optional)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., Food" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="account2Percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account 2 Percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0" max="100" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="account3Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account 3 Name (Optional)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., Savings" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="account3Percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account 3 Percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0" max="100" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="account4Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account 4 Name (Optional)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., Entertainment" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="account4Percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account 4 Percentage (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" min="0" max="100" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Budget Segmentation
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
            <CardDescription>See budget segmentation and recommendations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Allocated</p>
                <p className="text-2xl font-semibold text-primary">{result.totalAllocated.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{result.totalAllocatedPercent.toFixed(1)}% of income</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Remaining Amount</p>
                <p className="text-2xl font-semibold text-primary">{result.remainingAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Unallocated</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Number of Accounts</p>
                <p className="text-2xl font-semibold text-primary">{result.accounts.length}</p>
                <p className="text-xs text-muted-foreground">Mental accounts</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            {result.accounts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Account Allocations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {result.accounts.map((account, idx) => (
                    <div key={idx} className="p-4 border rounded">
                      <p className="text-sm font-semibold">{account.name || `Account ${idx + 1}`}</p>
                      <p className="text-xl font-semibold text-primary mt-2">{account.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{account.percentage.toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <strong>Account Amount</strong> = Total Income × (Account Percentage / 100)
          </p>
          <p>
            <strong>Total Allocated</strong> = Sum of All Account Amounts
          </p>
          <p>
            <strong>Remaining Amount</strong> = Total Income - Total Allocated
          </p>
          <p>
            <strong>Total Allocated Percent</strong> = Sum of All Account Percentages
          </p>
          <p>Mental accounting budget segmentation divides total income into separate mental accounts, each with its own allocation percentage and budget constraint. This creates psychological separation between spending categories, helping control spending and track expenses. While money is fungible, mental accounting can improve financial discipline by creating clear spending limits for each category.</p>
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
                <p className="text-sm text-muted-foreground">Allocation Rate</p>
                <p className="text-xl font-semibold text-primary">{result.totalAllocatedPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total income</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Average Account Size</p>
                <p className="text-xl font-semibold text-primary">
                  {result.accounts.length > 0 ? (result.totalAllocated / result.accounts.length).toLocaleString() : 0}
                </p>
                <p className="text-xs text-muted-foreground">Per account</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Buffer Amount</p>
                <p className="text-xl font-semibold text-primary">{result.remainingAmount.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Flexible funds</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your budget segmentation data to see additional insights.</p>
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
    <meta itemProp="name" content="The Complete Guide to Mental Accounting and Budget Segmentation: Behavioral Finance for Spending Control" />
    <meta itemProp="description" content="An in-depth guide on mental accounting, budget segmentation, and using behavioral finance principles to improve spending control and financial management." />
    <meta itemProp="keywords" content="mental accounting, budget segmentation, behavioral finance, budget allocation, spending control, financial psychology" />
    <meta itemProp="author" content="[Your Site's Finance Team]" />
    <meta itemProp="datePublished" content="2025-12-02" />
    <meta itemProp="url" content="/category/finance/mental-accounting-budget-segmentation-tool" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Mental Accounting and Budget Segmentation: Behavioral Finance for Spending Control</h1>
    <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at mental accounting, budget segmentation, and how behavioral finance principles can improve spending control and financial management.</p>

    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
        <li><a href="#basics" className="hover:underline">Understanding Mental Accounting</a></li>
        <li><a href="#segmentation" className="hover:underline">Budget Segmentation Principles</a></li>
        <li><a href="#allocation" className="hover:underline">Allocation Strategies</a></li>
        <li><a href="#benefits" className="hover:underline">Benefits and Drawbacks</a></li>
        <li><a href="#optimization" className="hover:underline">Optimizing Mental Accounting</a></li>
        <li><a href="#application" className="hover:underline">Practical Applications</a></li>
    </ul>
<hr className="my-6" />

    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Mental Accounting</h2>
    <p>Mental accounting, introduced by Richard Thaler, describes how individuals mentally categorize and treat money differently based on subjective criteria, creating separate "mental accounts" for various expenses and income sources.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Concepts</h3>
    <p>Mental accounting involves:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Source Labeling:</b> Treating money differently based on source (salary vs. bonus vs. gift)</li>
        <li><b>Purpose Labeling:</b> Creating separate accounts for different purposes (housing, food, entertainment)</li>
        <li><b>Time Labeling:</b> Treating money differently based on when it's received</li>
        <li><b>Account Separation:</b> Maintaining psychological separation between accounts</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
    <p>Mental accounting affects:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Spending decisions and patterns</li>
        <li>Savings behavior</li>
        <li>Response to gains and losses</li>
        <li>Budget adherence</li>
        <li>Financial decision-making</li>
    </ul>

<hr className="my-6" />

    <h2 id="segmentation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Budget Segmentation Principles</h2>
    <p>Budget segmentation applies mental accounting by dividing income into distinct categories with separate budget constraints.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Creating Mental Accounts</h3>
    <p>Common account categories include:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Housing:</b> Rent, mortgage, utilities</li>
        <li><b>Food:</b> Groceries, dining out</li>
        <li><b>Transportation:</b> Car payments, gas, public transit</li>
        <li><b>Savings:</b> Emergency fund, retirement, goals</li>
        <li><b>Entertainment:</b> Hobbies, leisure activities</li>
        <li><b>Debt Payments:</b> Credit cards, loans</li>
        <li><b>Other:</b> Miscellaneous expenses</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Allocation Methods</h3>
    <p>Allocate income to accounts using:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Percentage Allocation:</b> Each account gets a percentage of income</li>
        <li><b>Fixed Amount Allocation:</b> Each account gets a fixed dollar amount</li>
        <li><b>Priority-Based:</b> Allocate to priority accounts first</li>
        <li><b>Zero-Based:</b> Allocate 100% to specific accounts</li>
    </ul>

<hr className="my-6" />

    <h2 id="allocation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Allocation Strategies</h2>
    <p>Effective allocation strategies balance needs, wants, and financial goals.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Common Allocation Guidelines</h3>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 dark:bg-gray-800 border rounded-lg">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr>
                    <th className="border-b p-2 font-bold">Category</th>
                    <th className="border-b p-2 font-bold">Typical Allocation</th>
                    <th className="border-b p-2 font-bold">Notes</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className="border-b p-2">Housing</td>
                    <td className="border-b p-2">25-35%</td>
                    <td className="border-b p-2">Largest expense category</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Food</td>
                    <td className="border-b p-2">10-15%</td>
                    <td className="border-b p-2">Includes groceries and dining</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Transportation</td>
                    <td className="border-b p-2">10-15%</td>
                    <td className="border-b p-2">Vehicle and transit costs</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Savings</td>
                    <td className="border-b p-2">10-20%</td>
                    <td className="border-b p-2">Emergency fund and goals</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Debt Payments</td>
                    <td className="border-b p-2">10-20%</td>
                    <td className="border-b p-2">Credit cards, loans</td>
                </tr>
                <tr>
                    <td className="border-b p-2">Entertainment</td>
                    <td className="border-b p-2">5-10%</td>
                    <td className="border-b p-2">Leisure activities</td>
                </tr>
            </tbody>
        </table>
    </div>

<hr className="my-6" />

    <h2 id="benefits" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benefits and Drawbacks</h2>
    <p>Mental accounting has both advantages and limitations.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Benefits</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Self-Control:</b> Helps limit spending in specific categories</li>
        <li><b>Tracking:</b> Better awareness of spending by category</li>
        <li><b>Goal Setting:</b> Clear financial targets for each account</li>
        <li><b>Discipline:</b> Psychological constraints reduce impulse spending</li>
        <li><b>Savings:</b> Designated savings accounts increase savings rates</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Drawbacks</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li><b>Suboptimal Allocation:</b> Money is fungible but treated differently</li>
        <li><b>Rigidity:</b> Artificial constraints may not reflect true preferences</li>
        <li><b>Missing Opportunities:</b> May prevent optimal resource allocation</li>
        <li><b>Overspending:</b> Spending fully in one account while underspending in another</li>
        <li><b>Ignoring Fungibility:</b> Not recognizing that money can be reallocated</li>
    </ul>

<hr className="my-6" />

    <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimizing Mental Accounting</h2>
    <p>Use mental accounting strategically to maximize benefits while minimizing drawbacks.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Best Practices</h3>
    <ul className="list-disc ml-6 space-y-1">
        <li>Allocate based on actual spending patterns and priorities</li>
        <li>Maintain some flexibility for unexpected expenses</li>
        <li>Review and adjust allocations regularly</li>
        <li>Ensure total allocations don't exceed 100%</li>
        <li>Designate specific purposes for unallocated funds</li>
        <li>Track actual spending against allocations</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">When to Be Flexible</h3>
    <p>Recognize when flexibility is needed:</p>
    <ul className="list-disc ml-6 space-y-1">
        <li>Unexpected expenses arise</li>
        <li>Priorities change</li>
        <li>Income fluctuates</li>
        <li>Allocations prove unrealistic</li>
    </ul>
    <p>While maintaining account discipline, allow for necessary adjustments rather than rigidly adhering to allocations that don't match reality.</p>

<hr className="my-6" />

    <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Practical Applications</h2>
    <p>Mental accounting can be applied to various financial scenarios.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Monthly Budgeting</h3>
    <p>Segment monthly income into accounts for regular expenses, creating clear spending limits and tracking mechanisms for each category.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Goal-Based Savings</h3>
    <p>Create separate mental accounts for different savings goals (vacation, emergency fund, down payment), helping prioritize and track progress toward each goal.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Windfall Management</h3>
    <p>Allocate unexpected income (bonuses, tax refunds, gifts) to specific accounts rather than treating it as "free money" to spend, improving savings and goal achievement.</p>

<hr className="my-6" />

    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Mental accounting and budget segmentation provide powerful tools for spending control and financial management. By creating separate mental accounts with clear allocations, individuals can better track expenses, control spending, and achieve financial goals. While money is fungible, the psychological separation created by mental accounting can improve financial discipline. Regular review and adjustment ensure allocations remain realistic and effective, balancing the benefits of structure with necessary flexibility.</p>
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
          <p>This tool segments budget into mental accounts for better spending control and financial management using mental accounting principles.</p>
          <p>Outputs include account allocations, total allocated amount, remaining amount, allocation percentages, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
