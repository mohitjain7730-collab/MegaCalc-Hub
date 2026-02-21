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
  acquirerNetIncome: z.number({ invalid_type_error: 'Enter acquirer net income' }).min(0),
  acquirerSharesOutstanding: z.number({ invalid_type_error: 'Enter acquirer shares outstanding' }).min(0),
  targetNetIncome: z.number({ invalid_type_error: 'Enter target net income' }).min(0),
  acquisitionPrice: z.number({ invalid_type_error: 'Enter acquisition price' }).min(0),
  cashPortion: z.number({ invalid_type_error: 'Enter cash portion' }).min(0).optional(),
  sharePrice: z.number({ invalid_type_error: 'Enter share price' }).min(0).optional(),
  expectedSynergies: z.number({ invalid_type_error: 'Enter expected synergies' }).min(0).optional(),
  interestRate: z.number({ invalid_type_error: 'Enter interest rate' }).min(0).max(100).optional(),
  taxRate: z.number({ invalid_type_error: 'Enter tax rate' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  acquirerNetIncome: number;
  acquirerSharesOutstanding: number;
  targetNetIncome: number;
  acquisitionPrice: number;
  cashPortion?: number;
  sharePrice?: number;
  expectedSynergies?: number;
  interestRate?: number;
  taxRate?: number;
  standaloneEps: number;
  newSharesIssued: number;
  proFormaSharesOutstanding: number;
  interestExpenseAfterTax: number;
  proFormaNetIncome: number;
  proFormaEps: number;
  accretionDilution: number;
  accretionDilutionPercent: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter acquirer net income and shares outstanding.',
  'Enter target net income and acquisition price.',
  'Enter financing structure (cash portion, share price).',
  'Optionally enter expected synergies, interest rate, and tax rate.',
  'Review pro forma EPS and accretion/dilution analysis.',
];

const faqs = [
  {
    question: 'What is accretion/dilution analysis?',
    answer:
      'Accretion/dilution analysis assesses how an M&A transaction affects the acquiring company\'s earnings per share (EPS). A deal is accretive if pro forma EPS exceeds standalone EPS (positive accretion), and dilutive if it\'s lower (negative accretion/dilution). This analysis is critical for evaluating whether a deal creates value for shareholders.',
  },
  {
    question: 'How is pro forma EPS calculated?',
    answer:
      'Pro Forma EPS = Pro Forma Net Income / Pro Forma Shares Outstanding. Pro Forma Net Income = Acquirer Net Income + Target Net Income + Expected Synergies - Interest Expense (After-Tax). Pro Forma Shares = Acquirer Shares + New Shares Issued (for stock portion).',
  },
  {
    question: 'What is accretion/dilution percentage?',
    answer:
      'Accretion/Dilution % = [(Pro Forma EPS - Standalone EPS) / Standalone EPS] * 100. Positive percentages indicate accretion (EPS increases), negative percentages indicate dilution (EPS decreases). Higher accretion is generally preferred, though growth and strategic value also matter.',
  },
  {
    question: 'How does financing structure affect accretion/dilution?',
    answer:
      'Financing structure significantly impacts accretion/dilution: All-cash deals add interest expense (reduces net income) but don\'t dilute shares. All-stock deals dilute shares but avoid interest expense. Mixed deals balance both effects. Generally, all-cash is more accretive for low P/E acquirers, while all-stock is more accretive for high P/E acquirers.',
  },
  {
    question: 'How do synergies affect accretion/dilution?',
    answer:
      'Synergies increase pro forma net income, making deals more accretive. Cost synergies directly add to net income (after-tax), while revenue synergies add operating income (after applying gross margin and tax). Higher synergies increase accretion, making deals more attractive from an EPS perspective.',
  },
  {
    question: 'What is a reasonable accretion target?',
    answer:
      'Reasonable accretion targets vary, but deals are often considered attractive if they\'re at least 5-10% accretive in the first year, with expectations of increasing accretion over time. However, growth prospects, strategic value, and long-term value creation matter more than short-term EPS accretion alone.',
  },
  {
    question: 'Is dilution always bad?',
    answer:
      'Dilution isn\'t always bad if the deal creates strategic value, growth opportunities, or long-term value despite short-term dilution. However, significant dilution (>10-15%) requires strong justification. The market often penalizes highly dilutive deals unless they have strong strategic rationale or growth prospects.',
  },
  {
    question: 'How do I calculate new shares issued?',
    answer:
      'New Shares Issued = Stock Portion of Acquisition Price / Share Price. Stock Portion = Acquisition Price - Cash Portion. If the deal is all-stock, new shares = Acquisition Price / Share Price. The share price used is typically the acquirer\'s current share price.',
  },
  {
    question: 'How does interest expense affect net income?',
    answer:
      'Interest Expense (After-Tax) = Cash Portion * Interest Rate * (1 - Tax Rate). This reduces pro forma net income because cash financing requires borrowing, creating interest expense. Higher interest rates and larger cash portions reduce accretion (or increase dilution).',
  },
  {
    question: 'What assumptions are critical for accretion/dilution?',
    answer:
      'Critical assumptions include: expected synergies (often overestimated), interest rates on debt financing, tax rates, share price used for stock issuance, target net income projections, and timing of synergy realization. Small changes in these assumptions can significantly impact accretion/dilution results.',
  },
];

const relatedCalculators = [
  {
    name: 'Synergy Value Calculator (M&A Synergy Estimator)',
    slug: 'synergy-value-calculator-ma-synergy-estimator',
    description: 'Calculate M&A synergy value.',
  },
  {
    name: 'Deal Value vs Enterprise Value Bridge Calculator',
    slug: 'deal-value-vs-enterprise-value-bridge-calculator',
    description: 'Calculate deal value bridge.',
  },
  {
    name: 'Precedent Transaction Valuation Calculator',
    slug: 'precedent-transaction-valuation-calculator',
    description: 'Calculate precedent transaction valuation.',
  },
  {
    name: 'Enterprise Value Bridge Calculator',
    slug: 'enterprise-value-bridge-calculator',
    description: 'Calculate EV bridge.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/accretion-dilution-eps-impact-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Accretion/Dilution (EPS Impact) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Accretion/Dilution (EPS Impact) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Calculate accretion/dilution analysis for M&A transactions, assessing how deals affect acquiring company EPS.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const acquirerNetIncome = values.acquirerNetIncome;
  const acquirerSharesOutstanding = values.acquirerSharesOutstanding;
  const targetNetIncome = values.targetNetIncome;
  const acquisitionPrice = values.acquisitionPrice;
  const cashPortion = values.cashPortion ?? 0;
  const sharePrice = values.sharePrice;
  const expectedSynergies = values.expectedSynergies ?? 0;
  const interestRatePct = values.interestRate ? values.interestRate / 100 : 0.05; // Default 5%
  const taxRatePct = values.taxRate ? values.taxRate / 100 : 0.25; // Default 25%
  
  // Standalone EPS = Acquirer Net Income / Acquirer Shares
  const standaloneEps = acquirerSharesOutstanding > 0 ? acquirerNetIncome / acquirerSharesOutstanding : 0;
  
  // Calculate new shares issued (for stock portion)
  let newSharesIssued = 0;
  const stockPortion = acquisitionPrice - cashPortion;
  if (sharePrice && sharePrice > 0 && stockPortion > 0) {
    newSharesIssued = stockPortion / sharePrice;
  }
  
  // Pro Forma Shares = Acquirer Shares + New Shares
  const proFormaSharesOutstanding = acquirerSharesOutstanding + newSharesIssued;
  
  // Interest Expense (After-Tax) = Cash Portion * Interest Rate * (1 - Tax Rate)
  const interestExpenseAfterTax = cashPortion * interestRatePct * (1 - taxRatePct);
  
  // Pro Forma Net Income = Acquirer Net Income + Target Net Income + Synergies - Interest Expense
  const proFormaNetIncome = acquirerNetIncome + targetNetIncome + expectedSynergies - interestExpenseAfterTax;
  
  // Pro Forma EPS = Pro Forma Net Income / Pro Forma Shares
  const proFormaEps = proFormaSharesOutstanding > 0 ? proFormaNetIncome / proFormaSharesOutstanding : 0;
  
  // Accretion/Dilution = Pro Forma EPS - Standalone EPS
  const accretionDilution = proFormaEps - standaloneEps;
  
  // Accretion/Dilution % = (Accretion/Dilution / Standalone EPS) * 100
  const accretionDilutionPercent = standaloneEps > 0 ? (accretionDilution / standaloneEps) * 100 : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (accretionDilutionPercent > 10) {
    status = 'optimal';
    interpretation = `Highly accretive: ${accretionDilutionPercent.toFixed(1)}% accretion. Strong positive EPS impact.`;
  } else if (accretionDilutionPercent > 0) {
    status = 'good';
    interpretation = `Accretive: ${accretionDilutionPercent.toFixed(1)}% accretion. Positive EPS impact.`;
  } else if (accretionDilutionPercent > -10) {
    status = 'moderate';
    interpretation = `Slightly dilutive: ${accretionDilutionPercent.toFixed(1)}% dilution. Requires strategic justification.`;
  } else {
    status = 'low';
    interpretation = `Highly dilutive: ${accretionDilutionPercent.toFixed(1)}% dilution. Significant negative EPS impact - requires strong strategic rationale.`;
  }

  const recommendations: string[] = [];
  
  recommendations.push(`Accretion/Dilution analysis: Pro forma EPS ${proFormaEps.toFixed(2)} vs. standalone EPS ${standaloneEps.toFixed(2)}, resulting in ${accretionDilutionPercent >= 0 ? 'accretion' : 'dilution'} of ${accretionDilutionPercent.toFixed(1)}%. ${accretionDilutionPercent >= 0 ? 'The deal increases EPS, which is favorable for shareholders.' : 'The deal reduces EPS, requiring strong strategic justification.'}`);
  
  recommendations.push(`Financing structure: ${cashPortion > 0 ? `Cash portion ${cashPortion.toLocaleString()} (${((cashPortion / acquisitionPrice) * 100).toFixed(0)}%) creates interest expense of ${interestExpenseAfterTax.toLocaleString()} after-tax. ` : ''}${stockPortion > 0 && sharePrice ? `Stock portion ${stockPortion.toLocaleString()} (${((stockPortion / acquisitionPrice) * 100).toFixed(0)}%) issues ${newSharesIssued.toLocaleString(undefined, { maximumFractionDigits: 0 })} new shares, diluting ownership. ` : ''}Financing mix significantly impacts accretion/dilution.`);
  
  if (expectedSynergies > 0) {
    recommendations.push(`Synergies impact: Expected synergies of ${expectedSynergies.toLocaleString()} increase pro forma net income, enhancing accretion by ${(expectedSynergies / proFormaSharesOutstanding / standaloneEps * 100).toFixed(1)} percentage points (assuming current share count). Ensure synergies are realistic and achievable.`);
  } else {
    recommendations.push('Synergies consideration: No synergies entered. Expected synergies can significantly improve accretion/dilution by increasing pro forma net income. Consider entering realistic synergy estimates if available, but be conservative as many deals fail to achieve projected synergies.');
  }
  
  if (accretionDilutionPercent < -10) {
    recommendations.push('WARNING: Highly dilutive deal (>10% dilution) - The transaction significantly reduces EPS, which may be penalized by the market unless there are strong strategic benefits, growth opportunities, or long-term value creation potential. Consider alternative financing structures or re-evaluate deal rationale.');
  } else if (accretionDilutionPercent < 0) {
    recommendations.push('Dilution note: Deal is dilutive but manageable (<10%). Ensure strong strategic rationale exists, such as growth opportunities, market expansion, or synergies that will improve accretion over time. Consider if long-term value creation justifies short-term dilution.');
  }

  const plan = [
    { label: 'This Week', detail: `Calculate accretion/dilution: ${accretionDilutionPercent.toFixed(1)}% ${accretionDilutionPercent >= 0 ? 'accretion' : 'dilution'} (Pro forma EPS ${proFormaEps.toFixed(2)} vs. standalone ${standaloneEps.toFixed(2)}). Document financing structure, synergies, and assumptions.` },
    { label: 'This Month', detail: 'Present accretion/dilution analysis to stakeholders. If dilutive, provide strong strategic justification. Perform sensitivity analysis on key assumptions (synergies, interest rates, share price). Consider alternative financing structures to improve accretion if dilutive.' },
    { label: 'Ongoing', detail: 'Monitor actual EPS results against projections. Track synergy realization and integration progress. Update accretion/dilution projections as actual results become available. Compare actual to projected to improve future analysis accuracy.' },
  ];

  return { acquirerNetIncome, acquirerSharesOutstanding, targetNetIncome, acquisitionPrice, cashPortion: cashPortion > 0 ? cashPortion : undefined, sharePrice, expectedSynergies: expectedSynergies > 0 ? expectedSynergies : undefined, interestRate: values.interestRate, taxRate: values.taxRate, standaloneEps, newSharesIssued, proFormaSharesOutstanding, interestExpenseAfterTax, proFormaNetIncome, proFormaEps, accretionDilution, accretionDilutionPercent, interpretation, status, recommendations, plan };
};

export default function AccretionDilutionEpsImpactCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acquirerNetIncome: undefined,
      acquirerSharesOutstanding: undefined,
      targetNetIncome: undefined,
      acquisitionPrice: undefined,
      cashPortion: undefined,
      sharePrice: undefined,
      expectedSynergies: undefined,
      interestRate: undefined,
      taxRate: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="accretion-dilution-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Accretion/Dilution (EPS Impact) Calculator
          </CardTitle>
          <CardDescription>Calculate accretion/dilution analysis for M&A transactions, assessing how deals affect acquiring company EPS.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your accretion/dilution parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="acquirerNetIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acquirer Net Income</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 100000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acquirerSharesOutstanding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acquirer Shares Outstanding</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g., 50000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetNetIncome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Net Income</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 20000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acquisitionPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acquisition Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 300000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cashPortion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cash Portion (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 150000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sharePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Share Price (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">For stock portion calculation</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedSynergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Synergies (After-Tax) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 5000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                      <FormLabel>Interest Rate (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Default: 5%</p>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%) - Optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">Default: 25%</p>
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Accretion/Dilution
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
            <CardDescription>See accretion/dilution analysis and EPS impact.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Standalone EPS</p>
                <p className="text-2xl font-semibold text-primary">{result.standaloneEps.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Before deal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pro Forma EPS</p>
                <p className="text-2xl font-semibold text-primary">{result.proFormaEps.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">After deal</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Accretion/Dilution</p>
                <p className="text-2xl font-semibold text-primary">{result.accretionDilutionPercent.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{result.accretionDilution >= 0 ? 'Accretive' : 'Dilutive'}</p>
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
            <strong>Standalone EPS</strong> = Acquirer Net Income / Acquirer Shares Outstanding
          </p>
          <p>
            <strong>New Shares Issued</strong> = Stock Portion / Share Price
          </p>
          <p>
            <strong>Pro Forma Shares</strong> = Acquirer Shares + New Shares Issued
          </p>
          <p>
            <strong>Interest Expense (After-Tax)</strong> = Cash Portion * Interest Rate * (1 - Tax Rate)
          </p>
          <p>
            <strong>Pro Forma Net Income</strong> = Acquirer Net Income + Target Net Income + Synergies - Interest Expense (After-Tax)
          </p>
          <p>
            <strong>Pro Forma EPS</strong> = Pro Forma Net Income / Pro Forma Shares Outstanding
          </p>
          <p>
            <strong>Accretion/Dilution %</strong> = [(Pro Forma EPS - Standalone EPS) / Standalone EPS] * 100
          </p>
          <p>Accretion/dilution analysis evaluates how M&A transactions affect the acquiring company\'s EPS by comparing pro forma EPS (including target and financing effects) to standalone EPS. Positive percentages indicate accretion (EPS increases), negative indicate dilution (EPS decreases). Financing structure, synergies, and interest expenses all impact the result.</p>
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
                <p className="text-sm text-muted-foreground">New Shares Issued</p>
                <p className="text-xl font-semibold text-primary">{result.newSharesIssued.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-muted-foreground">Stock portion</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Pro Forma Net Income</p>
                <p className="text-xl font-semibold text-primary">{result.proFormaNetIncome.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Combined + synergies</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Interest Expense (After-Tax)</p>
                <p className="text-xl font-semibold text-primary">{result.interestExpenseAfterTax.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Cash financing cost</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">EPS Change</p>
                <p className="text-xl font-semibold text-primary">{result.accretionDilution.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Absolute change</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your accretion/dilution parameters to see additional insights.</p>
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
        <meta itemProp="name" content="The Complete Guide to Accretion/Dilution Analysis: M&A EPS Impact Assessment" />
        <meta itemProp="description" content="An in-depth guide on accretion/dilution analysis for M&A transactions, assessing how deals affect acquiring company EPS." />
        <meta itemProp="keywords" content="accretion dilution, EPS impact, M&A analysis, pro forma EPS, merger model, acquisition EPS" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/finance/accretion-dilution-eps-impact-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Accretion/Dilution Analysis: M&A EPS Impact Assessment</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at accretion/dilution analysis for M&A transactions, assessing how deals affect acquiring company EPS.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#basics" className="hover:underline">Understanding Accretion/Dilution</a></li>
          <li><a href="#calculation" className="hover:underline">Calculation Methodology</a></li>
          <li><a href="#financing" className="hover:underline">Financing Impact</a></li>
          <li><a href="#synergies" className="hover:underline">Synergy Effects</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting Results</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Accretion/Dilution</h2>
        <p>Accretion/dilution analysis evaluates how M&A transactions affect the acquiring company's earnings per share.</p>

        <hr className="my-6" />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation Methodology</h2>
        <p>Compare pro forma EPS (including target and financing effects) to standalone EPS to determine accretion or dilution.</p>

        <hr className="my-6" />

        <h2 id="financing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Financing Impact</h2>
        <p>Financing structure (cash vs. stock) significantly impacts accretion/dilution through interest expense and share dilution.</p>

        <hr className="my-6" />

        <h2 id="synergies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Synergy Effects</h2>
        <p>Expected synergies increase pro forma net income, improving accretion by adding to earnings without diluting shares.</p>

        <hr className="my-6" />

        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Results</h2>
        <p>Positive percentages indicate accretion (favorable), negative indicate dilution (requires strategic justification).</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Accretion/dilution analysis is a critical component of M&A evaluation, assessing how transactions affect EPS and shareholder value. While accretion is generally preferred, strategic value, growth opportunities, and long-term value creation matter more than short-term EPS impact alone. Proper analysis requires realistic assumptions about synergies, financing costs, and share issuance.</p>
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
          <p>This tool calculates accretion/dilution analysis for M&A transactions, assessing how deals affect acquiring company EPS.</p>
          <p>Outputs include standalone EPS, pro forma EPS, accretion/dilution percentage, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}



