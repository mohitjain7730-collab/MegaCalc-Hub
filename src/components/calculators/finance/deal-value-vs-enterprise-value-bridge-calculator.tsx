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
  enterpriseValue: z.number({ invalid_type_error: 'Enter enterprise value' }).min(0),
  cashAndEquivalents: z.number({ invalid_type_error: 'Enter cash and equivalents' }).min(0),
  totalDebt: z.number({ invalid_type_error: 'Enter total debt' }).min(0),
  workingCapitalTarget: z.number({ invalid_type_error: 'Enter working capital target' }).optional(),
  workingCapitalActual: z.number({ invalid_type_error: 'Enter working capital actual' }).optional(),
  debtLikeItems: z.number({ invalid_type_error: 'Enter debt-like items' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  enterpriseValue: number;
  cashAndEquivalents: number;
  totalDebt: number;
  workingCapitalTarget?: number;
  workingCapitalActual?: number;
  debtLikeItems?: number;
  netDebt: number;
  workingCapitalAdjustment: number;
  dealValue: number;
  equityValue: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter enterprise value (deal EV).',
  'Enter cash and cash equivalents and total debt.',
  'Optionally enter working capital target and actual, and debt-like items.',
  'Review deal value and equity value calculations.',
];

const faqs = [
  {
    question: 'What is deal value vs enterprise value bridge?',
    answer:
      'The deal value vs enterprise value bridge reconciles enterprise value (the total value paid for the business) with the actual deal value or equity value received by the seller. It adjusts for cash, debt, working capital deviations, and other items to determine the net amount the seller receives.',
  },
  {
    question: 'How is deal value calculated?',
    answer:
      'Deal Value = Enterprise Value + Cash and Cash Equivalents - Total Debt - Debt-Like Items Â± Working Capital Adjustment. Working Capital Adjustment = Working Capital Actual - Working Capital Target. If actual working capital is below target, the adjustment reduces deal value. If above target, it increases deal value.',
  },
  {
    question: 'What is working capital adjustment?',
    answer:
      'Working capital adjustment ensures the company is delivered with a normal level of working capital. If actual working capital at closing is below target (typically historical average), the seller pays the buyer (reduces deal value). If actual exceeds target, the buyer pays the seller (increases deal value). This prevents buyers from receiving companies with insufficient working capital.',
  },
  {
    question: 'What are debt-like items?',
    answer:
      'Debt-like items are obligations that resemble debt but may not be classified as traditional debt, such as: capital leases, pension liabilities, legal reserves, environmental liabilities, deferred compensation, and other long-term obligations. These reduce deal value as they represent obligations the buyer assumes.',
  },
  {
    question: 'How does cash affect deal value?',
    answer:
      'Cash and cash equivalents increase deal value because they represent assets the buyer receives. The buyer pays enterprise value for operations, and cash on the balance sheet is an additional asset. Therefore, cash is added to enterprise value in calculating what the seller receives.',
  },
  {
    question: 'Why is debt subtracted from deal value?',
    answer:
      'Debt is subtracted because the buyer typically assumes or pays off the target company\'s debt obligations. Since debt represents claims on the company that must be satisfied, it reduces the net amount the seller receives. The buyer pays the enterprise value, then settles the debt, reducing the effective purchase price.',
  },
  {
    question: 'What is the difference between deal value and equity value?',
    answer:
      'Deal value and equity value are often used interchangeably, but deal value may include transaction-specific adjustments (like working capital) while equity value is the pure equity value. Deal value = what the seller receives after all adjustments. Equity value = Enterprise Value - Net Debt (simplified version without working capital adjustments).',
  },
  {
    question: 'How do I set working capital target?',
    answer:
      'Working capital target is typically set as: the average of the last 12 months of working capital, a percentage of revenue or cost of goods sold, or a negotiated amount. It represents the "normal" level of working capital needed to operate the business. Targets are often based on historical averages or industry benchmarks.',
  },
  {
    question: 'What if working capital adjustment is negative?',
    answer:
      'A negative working capital adjustment (actual < target) reduces deal value because the seller delivers the company with insufficient working capital. The seller effectively pays the buyer for the shortfall. Conversely, positive adjustments (actual > target) increase deal value as the buyer receives excess working capital.',
  },
  {
    question: 'How does this bridge differ from standard EV bridge?',
    answer:
      'The deal value bridge includes working capital adjustments and may include transaction-specific items, making it more comprehensive for M&A transactions. The standard EV-to-equity bridge (Enterprise Value - Debt + Cash) is simpler and doesn\'t include working capital adjustments. Deal value bridge is transaction-specific and reflects the actual deal terms.',
  },
];

const relatedCalculators = [
  {
    name: 'Enterprise Value Bridge Calculator',
    slug: 'enterprise-value-bridge-calculator',
    description: 'Calculate EV bridge to equity value.',
  },
  {
    name: 'Synergy Value Calculator (M&A Synergy Estimator)',
    slug: 'synergy-value-calculator-ma-synergy-estimator',
    description: 'Calculate M&A synergy value.',
  },
  {
    name: 'Accretion/Dilution (EPS Impact) Calculator',
    slug: 'accretion-dilution-eps-impact-calculator',
    description: 'Calculate accretion/dilution.',
  },
  {
    name: 'Purchase Price Allocation (PPA) Calculator',
    slug: 'purchase-price-allocation-ppa-calculator',
    description: 'Calculate purchase price allocation.',
  },
];

const baseUrl = 'https://mycalculating.com/finance/deal-value-vs-enterprise-value-bridge-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/finance' },
        { '@type': 'ListItem', position: 3, name: 'Deal Value vs Enterprise Value Bridge Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Deal Value vs Enterprise Value Bridge Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate deal value from enterprise value using the deal value bridge, adjusting for cash, debt, working capital, and debt-like items.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const enterpriseValue = values.enterpriseValue;
  const cashAndEquivalents = values.cashAndEquivalents;
  const totalDebt = values.totalDebt;
  const workingCapitalTarget = values.workingCapitalTarget;
  const workingCapitalActual = values.workingCapitalActual;
  const debtLikeItems = values.debtLikeItems ?? 0;
  
  // Net Debt = Total Debt - Cash and Cash Equivalents
  const netDebt = totalDebt - cashAndEquivalents;
  
  // Working Capital Adjustment = Actual - Target (positive if actual > target, negative if actual < target)
  let workingCapitalAdjustment = 0;
  if (workingCapitalTarget !== undefined && workingCapitalActual !== undefined) {
    workingCapitalAdjustment = workingCapitalActual - workingCapitalTarget;
  }
  
  // Deal Value = Enterprise Value + Cash - Total Debt - Debt-Like Items Â± Working Capital Adjustment
  const dealValue = enterpriseValue + cashAndEquivalents - totalDebt - debtLikeItems + workingCapitalAdjustment;
  
  // Equity Value (simplified, without working capital adjustment) = EV - Net Debt
  const equityValue = enterpriseValue - netDebt;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (dealValue < 0) {
    status = 'low';
    interpretation = `Deal value: ${dealValue.toLocaleString()}. Negative deal value indicates debt and adjustments exceed enterprise value plus cash - review assumptions.`;
  } else {
    interpretation = `Deal value: ${dealValue.toLocaleString()}, Equity value: ${equityValue.toLocaleString()}.`;
    
    if (workingCapitalAdjustment !== 0 && workingCapitalTarget !== undefined) {
      if (workingCapitalAdjustment < 0) {
        interpretation += ` Working capital shortfall of ${Math.abs(workingCapitalAdjustment).toLocaleString()} reduces deal value.`;
      } else {
        interpretation += ` Working capital excess of ${workingCapitalAdjustment.toLocaleString()} increases deal value.`;
      }
    }
    
    status = 'optimal';
  }

  const recommendations: string[] = [];
  
  recommendations.push(`Deal value calculation: Deal value of ${dealValue.toLocaleString()} calculated from enterprise value ${enterpriseValue.toLocaleString()} by adding cash ${cashAndEquivalents.toLocaleString()}, subtracting debt ${totalDebt.toLocaleString()} and debt-like items ${debtLikeItems.toLocaleString()}, and adjusting for working capital. This represents the net amount the seller receives.`);
  
  recommendations.push(`Net debt: Net debt of ${netDebt.toLocaleString()} (debt ${totalDebt.toLocaleString()} minus cash ${cashAndEquivalents.toLocaleString()}). Net debt reduces the effective purchase price as the buyer assumes or pays off debt obligations.`);
  
  if (workingCapitalTarget !== undefined && workingCapitalActual !== undefined) {
    if (workingCapitalAdjustment < 0) {
      recommendations.push(`Working capital adjustment: Shortfall of ${Math.abs(workingCapitalAdjustment).toLocaleString()} (actual ${workingCapitalActual.toLocaleString()} vs. target ${workingCapitalTarget.toLocaleString()}) reduces deal value. The seller effectively pays the buyer for delivering the company with insufficient working capital. Ensure working capital target is appropriately set based on historical levels.`);
    } else if (workingCapitalAdjustment > 0) {
      recommendations.push(`Working capital adjustment: Excess of ${workingCapitalAdjustment.toLocaleString()} (actual ${workingCapitalActual.toLocaleString()} vs. target ${workingCapitalTarget.toLocaleString()}) increases deal value. The buyer pays additional for excess working capital received.`);
    } else {
      recommendations.push(`Working capital: Actual working capital matches target, no adjustment needed. Working capital is appropriately balanced for the transaction.`);
    }
  } else {
    recommendations.push('Working capital: No working capital target or actual entered. Working capital adjustments are common in M&A transactions to ensure the company is delivered with normal working capital levels. Consider entering working capital values for a complete deal value calculation.');
  }
  
  if (dealValue < 0) {
    recommendations.push('CRITICAL: Negative deal value - Debt and adjustments exceed enterprise value plus cash. This suggests either: enterprise value is too low relative to debt, assumptions are incorrect, or this represents a distressed transaction. Review all assumptions and ensure enterprise value reflects appropriate valuation.');
  }
  
  recommendations.push('Equity value: Equity value (simplified) is calculated as Enterprise Value - Net Debt, providing a baseline without working capital adjustments. Deal value includes all transaction-specific adjustments and represents what the seller actually receives.');

  const plan = [
    { label: 'This Week', detail: `Calculate deal value bridge: Deal value ${dealValue.toLocaleString()}, Equity value ${equityValue.toLocaleString()}. Document all components (cash, debt, working capital, debt-like items) and assumptions.` },
    { label: 'This Month', detail: 'Validate deal value components with transaction documents and financial statements. Review working capital target setting (should reflect normal operating levels). Ensure all debt and debt-like items are captured. Compare deal value to transaction terms.' },
    { label: 'Ongoing', detail: 'Update deal value bridge as transaction progresses and actual closing values become available. Monitor working capital between signing and closing. Track any changes in debt, cash, or other components. Finalize bridge at closing with actual values.' },
  ];

  return { enterpriseValue, cashAndEquivalents, totalDebt, workingCapitalTarget, workingCapitalActual, debtLikeItems: debtLikeItems > 0 ? debtLikeItems : undefined, netDebt, workingCapitalAdjustment, dealValue, equityValue, interpretation, status, recommendations, plan };
};

export default function DealValueVsEnterpriseValueBridgeCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enterpriseValue: undefined,
      cashAndEquivalents: undefined,
      totalDebt: undefined,
      workingCapitalTarget: undefined,
      workingCapitalActual: undefined,
      debtLikeItems: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="deal-value-bridge-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Deal Value vs Enterprise Value Bridge Calculator
          </CardTitle>
          <CardDescription>Calculate deal value from enterprise value using the deal value bridge, adjusting for cash, debt, working capital, and debt-like items.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your deal value bridge components</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="enterpriseValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enterprise Value (Deal EV)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 1000000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cashAndEquivalents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cash & Cash Equivalents</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="totalDebt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Debt</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workingCapitalTarget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Working Capital Target (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workingCapitalActual"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Working Capital Actual (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 90000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="debtLikeItems"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Debt-Like Items (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 10000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Capital leases, pensions, etc.</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Deal Value
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
            <CardDescription>See deal value bridge calculation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Net Debt</p>
                <p className="text-2xl font-semibold text-primary">{result.netDebt.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Debt - Cash</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Working Capital Adjustment</p>
                <p className="text-2xl font-semibold text-primary">{result.workingCapitalAdjustment.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Actual - Target</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Deal Value</p>
                <p className="text-2xl font-semibold text-primary">{result.dealValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Seller receives</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Equity Value</p>
                <p className="text-2xl font-semibold text-primary">{result.equityValue.toLocaleString()}</p>
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
            <strong>Net Debt</strong> = Total Debt - Cash and Cash Equivalents
          </p>
          <p>
            <strong>Working Capital Adjustment</strong> = Working Capital Actual - Working Capital Target
          </p>
          <p>
            <strong>Deal Value</strong> = Enterprise Value + Cash and Cash Equivalents - Total Debt - Debt-Like Items Â± Working Capital Adjustment
          </p>
          <p>
            <strong>Equity Value</strong> = Enterprise Value - Net Debt
          </p>
          <p>The deal value bridge reconciles enterprise value (total value paid for the business) with the actual deal value received by the seller. It accounts for cash (added), debt and debt-like items (subtracted), and working capital adjustments (ensuring normal working capital levels). Deal value represents the net amount the seller receives after all transaction adjustments.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Enterprise Value</p>
                <p className="text-xl font-semibold text-primary">{result.enterpriseValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Starting point</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Cash</p>
                <p className="text-xl font-semibold text-primary">{result.cashAndEquivalents.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Added</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Total Debt</p>
                <p className="text-xl font-semibold text-primary">{result.totalDebt.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Subtracted</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-xl font-semibold text-primary capitalize">{result.status}</p>
                <p className="text-xs text-muted-foreground">Calculation status</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your deal value bridge components to see additional insights.</p>
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
                <Link href={`/finance/${calc.slug}`} className="text-primary hover:underline">
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
        <meta itemProp="name" content="The Complete Guide to Deal Value vs Enterprise Value Bridge: M&A Transaction Value Reconciliation" />
        <meta itemProp="description" content="An in-depth guide on calculating deal value from enterprise value using the deal value bridge, adjusting for cash, debt, working capital, and debt-like items." />
        <meta itemProp="keywords" content="deal value bridge, enterprise value bridge, M&A deal value, working capital adjustment, transaction value" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/finance/deal-value-vs-enterprise-value-bridge-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Deal Value vs Enterprise Value Bridge: M&A Transaction Value Reconciliation</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at calculating deal value from enterprise value using the deal value bridge, adjusting for cash, debt, working capital, and debt-like items.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Understanding Deal Value Bridge</a></li>
          <li><a href="#components" className="hover:underline">Bridge Components</a></li>
          <li><a href="#working" className="hover:underline">Working Capital Adjustment</a></li>
          <li><a href="#calculation" className="hover:underline">Calculation Steps</a></li>
          <li><a href="#application" className="hover:underline">Practical Application</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Deal Value Bridge</h2>
        <p>The deal value bridge reconciles enterprise value with the actual deal value or equity value received by the seller in M&A transactions.</p>

        <hr className="my-6" />

        <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Bridge Components</h2>
        <p>Key components include cash (added), debt and debt-like items (subtracted), and working capital adjustments.</p>

        <hr className="my-6" />

        <h2 id="working" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Working Capital Adjustment</h2>
        <p>Working capital adjustments ensure the company is delivered with normal working capital levels, adjusting deal value accordingly.</p>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Steps</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>Deal Value = EV + Cash - Debt - Debt-Like Items Â± Working Capital Adjustment</strong></p>
        </div>

        <hr className="my-6" />

        <h2 id="application" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Practical Application</h2>
        <p>Use deal value bridge to determine the net amount sellers receive and to understand transaction value reconciliation.</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>The deal value vs enterprise value bridge is essential in M&A transactions for reconciling enterprise value with the actual deal value received by sellers. It accounts for cash, debt, working capital adjustments, and debt-like items to determine the net purchase price. Understanding and applying this bridge ensures transparency and accuracy in transaction value determination.</p>
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
          <p>This tool calculates deal value from enterprise value using the deal value bridge, adjusting for cash, debt, working capital, and debt-like items.</p>
          <p>Outputs include deal value, equity value, net debt, working capital adjustment, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}
