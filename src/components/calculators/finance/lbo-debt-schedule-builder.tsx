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
  initialDebtBalance: z.number({ invalid_type_error: 'Enter initial debt balance' }).min(0),
  interestRate: z.number({ invalid_type_error: 'Enter interest rate' }).min(0).max(100),
  amortizationRate: z.number({ invalid_type_error: 'Enter amortization rate' }).min(0).max(100).optional(),
  debtTermYears: z.number({ invalid_type_error: 'Enter debt term years' }).min(1).max(20),
  optionalPrepayment: z.number({ invalid_type_error: 'Enter optional prepayment' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type DebtSchedulePeriod = {
  period: number;
  beginningBalance: number;
  mandatoryAmortization: number;
  optionalPrepayment: number;
  totalPayment: number;
  interestExpense: number;
  endingBalance: number;
};

type ResultPayload = {
  initialDebtBalance: number;
  interestRate: number;
  amortizationRate?: number;
  debtTermYears: number;
  optionalPrepayment?: number;
  totalInterestPaid: number;
  totalPrincipalPaid: number;
  finalBalance: number;
  schedule: DebtSchedulePeriod[];
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter initial debt balance (total debt at acquisition).',
  'Enter interest rate (annual percentage rate).',
  'Enter amortization rate (optional, percentage of initial balance amortized annually).',
  'Enter debt term in years.',
  'Optionally enter annual optional prepayment amount.',
  'Review debt schedule with mandatory amortization, optional prepayments, and interest expense.',
];

const faqs = [
  {
    question: 'What is a debt schedule in LBO?',
    answer:
      'A debt schedule tracks the repayment of debt over time, including mandatory amortization (required principal payments), optional prepayments, interest expense, and remaining balance. It is essential for LBO modeling and cash flow analysis.',
  },
  {
    question: 'What is mandatory amortization?',
    answer:
      'Mandatory amortization is the required principal repayment, often expressed as a percentage of the initial loan amount or a fixed amount per period. It ensures debt is repaid over the loan term.',
  },
  {
    question: 'What is optional prepayment?',
    answer:
      'Optional prepayment is additional principal repayment beyond mandatory amortization, typically funded from excess cash flow. Prepayments reduce interest expense and accelerate debt paydown.',
  },
  {
    question: 'How is interest expense calculated?',
    answer:
      'Interest expense = Interest Rate Ã— Average Debt Balance. Average Debt Balance = (Beginning Balance + Ending Balance) / 2. This accounts for principal reductions during the period.',
  },
  {
    question: 'How do I calculate ending balance?',
    answer:
      'Ending Balance = Beginning Balance - Mandatory Amortization - Optional Prepayment. The ending balance becomes the next period\'s beginning balance.',
  },
  {
    question: 'What is a typical LBO debt structure?',
    answer:
      'LBO debt typically includes: Term Loan A (amortizing, 5-7 years), Term Loan B (bullet/minimal amortization, 7-10 years), Revolver (revolving credit facility), and sometimes mezzanine debt or high-yield bonds.',
  },
  {
    question: 'How does debt paydown affect returns?',
    answer:
      'Debt paydown increases equity value by reducing leverage. As debt is repaid, equity value increases dollar-for-dollar, creating returns for equity investors. This is one of the four key LBO return drivers.',
  },
  {
    question: 'What are financing fees?',
    answer:
      'Financing fees are upfront costs paid to lenders (arrangement fees, commitment fees). They are capitalized and amortized over the debt term as a non-cash expense affecting net income but not cash flow.',
  },
  {
    question: 'How do I model multiple debt tranches?',
    answer:
      'Model each tranche separately with its own interest rate, amortization schedule, and optional prepayment rules. Sum interest expenses and principal payments across all tranches. Prioritize prepayments based on tranche terms (typically pay down higher-cost debt first).',
  },
  {
    question: 'What is a bullet payment?',
    answer:
      'A bullet payment is a large principal repayment at maturity with minimal or no amortization during the loan term. Term Loan B and high-yield bonds often have bullet structures, requiring refinancing or sale proceeds at maturity.',
  },
];

const relatedCalculators = [
  {
    name: 'LBO (Leveraged Buyout) Return Calculator',
    slug: 'lbo-leveraged-buyout-return-calculator',
    description: 'Calculate MOIC and IRR for LBO investments.',
  },
  {
    name: 'Internal Rate of Return (IRR) for PE/VC Deal Calculator',
    slug: 'irr-pe-vc-deal-calculator',
    description: 'Calculate IRR with detailed cash flows.',
  },
  {
    name: 'Capital Structure (Debt/Equity Mix Optimization) Calculator',
    slug: 'capital-structure-debt-equity-mix-optimization-calculator',
    description: 'Optimize capital structure and WACC.',
  },
  {
    name: 'DCF Calculator',
    slug: 'dcf-calculator',
    description: 'Calculate discounted cash flow valuation.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/lbo-debt-schedule-builder';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'LBO Debt Schedule Builder', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'LBO Debt Schedule Builder',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Build detailed LBO debt repayment schedules with mandatory amortization, optional prepayments, and interest expense calculations.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const initialDebtBalance = values.initialDebtBalance;
  const interestRate = values.interestRate / 100;
  const amortizationRate = (values.amortizationRate ?? 0) / 100;
  const debtTermYears = values.debtTermYears;
  const optionalPrepayment = values.optionalPrepayment ?? 0;
  
  const schedule: DebtSchedulePeriod[] = [];
  let currentBalance = initialDebtBalance;
  let totalInterestPaid = 0;
  let totalPrincipalPaid = 0;
  
  // Calculate annual mandatory amortization amount
  const annualMandatoryAmortization = amortizationRate > 0 
    ? Math.min(initialDebtBalance * amortizationRate, currentBalance)
    : initialDebtBalance / debtTermYears; // Straight-line if no rate specified
  
  for (let period = 1; period <= debtTermYears; period++) {
    const beginningBalance = currentBalance;
    
    // Mandatory amortization (cannot exceed remaining balance)
    const mandatoryAmortization = Math.min(annualMandatoryAmortization, beginningBalance);
    
    // Optional prepayment (cannot exceed remaining balance after mandatory)
    const remainingAfterMandatory = beginningBalance - mandatoryAmortization;
    const actualOptionalPrepayment = Math.min(optionalPrepayment, remainingAfterMandatory);
    
    // Total principal payment
    const totalPayment = mandatoryAmortization + actualOptionalPrepayment;
    
    // Interest expense on average balance
    const averageBalance = (beginningBalance + (beginningBalance - totalPayment)) / 2;
    const interestExpense = averageBalance * interestRate;
    
    // Ending balance
    const endingBalance = beginningBalance - totalPayment;
    
    schedule.push({
      period,
      beginningBalance,
      mandatoryAmortization,
      optionalPrepayment: actualOptionalPrepayment,
      totalPayment,
      interestExpense,
      endingBalance: Math.max(0, endingBalance),
    });
    
    totalInterestPaid += interestExpense;
    totalPrincipalPaid += totalPayment;
    currentBalance = Math.max(0, endingBalance);
    
    // If fully paid off, stop
    if (currentBalance <= 0) break;
  }
  
  const finalBalance = currentBalance;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (finalBalance > 0) {
    status = 'moderate';
    interpretation = `Debt not fully repaid. Remaining balance: ${finalBalance.toLocaleString()}. Consider increasing amortization rate or optional prepayments.`;
  } else {
    status = 'optimal';
    interpretation = `Debt fully repaid over ${schedule.length} years. Total interest paid: ${totalInterestPaid.toLocaleString()}.`;
  }

  const recommendations = [
    `Debt schedule: ${schedule.length} periods with mandatory amortization of ${annualMandatoryAmortization.toLocaleString()} per year (${(amortizationRate * 100).toFixed(1)}% of initial balance).`,
    `Interest expense: Total interest paid ${totalInterestPaid.toLocaleString()} over ${schedule.length} years. Average annual interest: ${(totalInterestPaid / schedule.length).toLocaleString()}.`,
    `Principal payments: Total principal paid ${totalPrincipalPaid.toLocaleString()}. Mandatory: ${schedule.reduce((sum, p) => sum + p.mandatoryAmortization, 0).toLocaleString()}, Optional: ${schedule.reduce((sum, p) => sum + p.optionalPrepayment, 0).toLocaleString()}.`,
  ];
  
  if (optionalPrepayment > 0) {
    recommendations.push(`Optional prepayments: ${optionalPrepayment.toLocaleString()} per year accelerates debt paydown and reduces total interest expense by ${(totalInterestPaid - (initialDebtBalance * interestRate * debtTermYears)).toLocaleString()}.`);
  }
  
  if (finalBalance > 0) {
    recommendations.push(`Remaining balance: ${finalBalance.toLocaleString()} not repaid. Increase amortization rate or optional prepayments to fully repay debt.`);
  }
  
  recommendations.push('Validation: Review debt schedule against loan terms, verify interest calculations, and ensure cash flow can support mandatory payments and optional prepayments.');

  const plan = [
    { label: 'This Week', detail: `Build debt schedule: ${schedule.length} periods, total interest ${totalInterestPaid.toLocaleString()}, final balance ${finalBalance.toLocaleString()}. Review against loan terms and cash flow projections.` },
    { label: 'This Month', detail: 'Validate debt schedule by comparing to loan agreements, verifying interest calculations, and ensuring cash flow can support payments. Model multiple debt tranches if applicable.' },
    { label: 'Ongoing', detail: 'Update debt schedule based on actual payments and prepayments. Track interest expense against projections. Monitor debt paydown progress and adjust prepayment strategy as needed.' },
  ];

  return { initialDebtBalance, interestRate: values.interestRate, amortizationRate: values.amortizationRate, debtTermYears, optionalPrepayment: optionalPrepayment > 0 ? optionalPrepayment : undefined, totalInterestPaid, totalPrincipalPaid, finalBalance, schedule, interpretation, status, recommendations, plan };
};

export default function LboDebtScheduleBuilder() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      initialDebtBalance: undefined,
      interestRate: undefined,
      amortizationRate: undefined,
      debtTermYears: undefined,
      optionalPrepayment: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="lbo-debt-schedule-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            LBO Debt Schedule Builder
          </CardTitle>
          <CardDescription>Build detailed LBO debt repayment schedules with mandatory amortization, optional prepayments, and interest expense calculations.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your debt parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="initialDebtBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Debt Balance</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="interestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 6.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amortizationRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amortization Rate (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Annual % of initial balance (default: straight-line)</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="debtTermYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt Term (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 7" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="optionalPrepayment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Optional Prepayment (Annual) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 20000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Build Debt Schedule
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
            <CardDescription>See debt schedule with amortization, prepayments, and interest expense.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Interest Paid</p>
                <p className="text-2xl font-semibold text-primary">${result.totalInterestPaid.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Over {result.schedule.length} years</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Principal Paid</p>
                <p className="text-2xl font-semibold text-primary">${result.totalPrincipalPaid.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Mandatory + Optional</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Final Balance</p>
                <p className="text-2xl font-semibold text-primary">${result.finalBalance.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Remaining debt</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border p-2 text-left">Period</th>
                    <th className="border p-2 text-right">Beginning Balance</th>
                    <th className="border p-2 text-right">Mandatory Amort.</th>
                    <th className="border p-2 text-right">Optional Prepay</th>
                    <th className="border p-2 text-right">Total Payment</th>
                    <th className="border p-2 text-right">Interest Expense</th>
                    <th className="border p-2 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((period) => (
                    <tr key={period.period}>
                      <td className="border p-2">{period.period}</td>
                      <td className="border p-2 text-right">${period.beginningBalance.toLocaleString()}</td>
                      <td className="border p-2 text-right">${period.mandatoryAmortization.toLocaleString()}</td>
                      <td className="border p-2 text-right">${period.optionalPrepayment.toLocaleString()}</td>
                      <td className="border p-2 text-right">${period.totalPayment.toLocaleString()}</td>
                      <td className="border p-2 text-right">${period.interestExpense.toLocaleString()}</td>
                      <td className="border p-2 text-right">${period.endingBalance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
            <strong>Mandatory Amortization</strong> = min(Initial Debt Balance Ã— Amortization Rate, Beginning Balance)
          </p>
          <p>
            <strong>Optional Prepayment</strong> = min(Cash Available, Beginning Balance - Mandatory Amortization)
          </p>
          <p>
            <strong>Total Payment</strong> = Mandatory Amortization + Optional Prepayment
          </p>
          <p>
            <strong>Interest Expense</strong> = Interest Rate Ã— Average Balance
          </p>
          <p>
            <strong>Average Balance</strong> = (Beginning Balance + Ending Balance) / 2
          </p>
          <p>
            <strong>Ending Balance</strong> = Beginning Balance - Total Payment
          </p>
          <p>The debt schedule tracks repayment over time, with interest calculated on average balance to account for principal reductions during the period.</p>
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
        <meta itemProp="name" content="The Complete Guide to LBO Debt Schedules: Amortization and Interest Calculation" />
        <meta itemProp="description" content="An in-depth guide on building LBO debt schedules with mandatory amortization, optional prepayments, and interest expense calculations." />
        <meta itemProp="keywords" content="LBO debt schedule, debt amortization, debt prepayment, interest expense, leveraged buyout debt" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/lbo-debt-schedule-builder" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to LBO Debt Schedules: Amortization and Interest Calculation</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">How to design, model, and stress-test LBO debt schedules across tranches, amortization rules, and prepayment strategies.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#overview" className="hover:underline">Debt Schedule Overview and Why It Matters</a></li>
          <li><a href="#structure" className="hover:underline">Common LBO Capital Structures</a></li>
          <li><a href="#amort" className="hover:underline">Mandatory Amortization Mechanics</a></li>
          <li><a href="#prepay" className="hover:underline">Optional Prepayments and Cash Sweeps</a></li>
          <li><a href="#interest" className="hover:underline">Interest Calculation on Average Balance</a></li>
          <li><a href="#waterfall" className="hover:underline">Allocation Waterfall Across Tranches</a></li>
          <li><a href="#stress" className="hover:underline">Stress Tests and Sensitivities</a></li>
          <li><a href="#playbook" className="hover:underline">Execution Playbook</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Debt Schedule Overview and Why It Matters</h2>
        <p>The debt schedule governs required and voluntary payments, shapes cash availability, and drives equity value via deleveraging. A precise schedule prevents covenant breaches and quantifies interest drag.</p>

        <h2 id="structure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Common LBO Capital Structures</h2>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Term Loan A:</strong> Amortizing, shorter tenor, lower spread.</li>
          <li><strong>Term Loan B:</strong> Minimal amortization/bullet, longer tenor, higher spread.</li>
          <li><strong>Revolver:</strong> Seasonal liquidity, commitment fees, first-out in cash sweeps.</li>
          <li><strong>Mezzanine/High-Yield:</strong> Subordinated, higher cost, often bullet.</li>
        </ul>

        <h2 id="amort" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Mandatory Amortization Mechanics</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Mandatory Amort = min(Initial Balance Ã— Amort Rate, Beginning Balance)</strong></p>
        </div>
        <p>Set per tranche. In down cycles, test if mandatory paydowns are supportable by cash flow.</p>

        <h2 id="prepay" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optional Prepayments and Cash Sweeps</h2>
        <p>Cash sweeps accelerate deleveraging, reducing interest and risk. Prioritize higher-cost tranches first unless prepayment penalties dictate otherwise.</p>

        <h2 id="interest" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interest Calculation on Average Balance</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Interest = Rate Ã— ((Beg Balance + End Balance) / 2)</strong></p>
        </div>
        <p>Average balance captures intra-period principal reduction; using beginning balance overstates interest.</p>

        <h2 id="waterfall" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Allocation Waterfall Across Tranches</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Pay revolver (if swept) before term loans.</li>
          <li>Meet all mandatory amortization by tranche priority.</li>
          <li>Apply optional prepay to highest-cost or shortest-tenor tranche, subject to call protection.</li>
          <li>Recompute interest on new balances each period.</li>
        </ol>

        <h2 id="stress" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Stress Tests and Sensitivities</h2>
        <p>Run cases on: lower EBITDA, higher rates, delayed prepayments, covenant headroom, and bullet refinancing risk. Small rate moves can meaningfully change cash interest and deleveraging speed.</p>

        <h2 id="playbook" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Execution Playbook</h2>
        <ol className="list-decimal ml-6 space-y-2">
          <li>Map tranches, rates, amort rules, and call protection.</li>
          <li>Build period schedule with mandatory amort and average-balance interest.</li>
          <li>Layer cash sweep logic; prioritize by cost/tenor.</li>
          <li>Stress rate, EBITDA, and timing; check covenants.</li>
          <li>Iterate to maximize deleveraging without liquidity strain.</li>
        </ol>

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Well-modeled debt schedules quantify interest drag, guide prepayment choices, and protect covenant headroom. Use average-balance interest, clear waterfalls, and rigorous stress tests to keep leverage on track.</p>
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
          <p>This tool builds detailed LBO debt repayment schedules with mandatory amortization, optional prepayments, and interest expense calculations.</p>
          <p>Outputs include debt schedule table, total interest paid, total principal paid, final balance, interpretation, recommendations, and an action plan.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

