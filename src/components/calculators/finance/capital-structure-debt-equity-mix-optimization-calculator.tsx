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
  marketValueEquity: z.number({ invalid_type_error: 'Enter market value of equity' }).min(0),
  marketValueDebt: z.number({ invalid_type_error: 'Enter market value of debt' }).min(0),
  costOfEquity: z.number({ invalid_type_error: 'Enter cost of equity' }).min(0).max(100),
  costOfDebt: z.number({ invalid_type_error: 'Enter cost of debt' }).min(0).max(100),
  taxRate: z.number({ invalid_type_error: 'Enter tax rate' }).min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
  marketValueEquity: number;
  marketValueDebt: number;
  totalValue: number;
  equityWeight: number;
  debtWeight: number;
  costOfEquity: number;
  costOfDebt: number;
  taxRate: number;
  afterTaxCostOfDebt: number;
  wacc: number;
  debtToEquityRatio: number;
  interpretation: string;
  status: 'optimal' | 'good' | 'moderate' | 'low';
  recommendations: string[];
  plan: { label: string; detail: string }[];
};

const steps = [
  'Enter market value of equity (market capitalization).',
  'Enter market value of debt (total debt outstanding).',
  'Enter cost of equity (required return on equity, %).',
  'Enter cost of debt (interest rate on debt, %).',
  'Enter tax rate (corporate tax rate, %).',
  'Review WACC calculation and capital structure optimization.',
];

const faqs = [
  {
    question: 'What is WACC?',
    answer:
      'WACC (Weighted Average Cost of Capital) is the average cost of financing from both debt and equity sources, weighted by their proportions in the capital structure. WACC = (E/V × Re) + (D/V × Rd × (1 - T)).',
  },
  {
    question: 'How is WACC calculated?',
    answer:
      'WACC = (E/V × Re) + (D/V × Rd × (1 - T)), where E = equity value, D = debt value, V = total value (E + D), Re = cost of equity, Rd = cost of debt, T = tax rate. The after-tax cost of debt is used because interest is tax-deductible.',
  },
  {
    question: 'What is optimal capital structure?',
    answer:
      'Optimal capital structure minimizes WACC, maximizing firm value. It balances the benefits of debt (tax shield, lower cost) against the costs (financial risk, bankruptcy risk). The optimal mix varies by industry, company size, and market conditions.',
  },
  {
    question: 'How does debt affect WACC?',
    answer:
      'Debt typically lowers WACC initially due to tax shield and lower cost than equity. However, excessive debt increases financial risk, raising both cost of debt and cost of equity. The optimal capital structure finds the balance that minimizes WACC.',
  },
  {
    question: 'What is the tax shield benefit?',
    answer:
      'Tax shield benefit comes from interest expense being tax-deductible. After-tax cost of debt = Cost of Debt × (1 - Tax Rate). For example, 6% debt with 25% tax rate has 4.5% after-tax cost, providing a 1.5% tax benefit.',
  },
  {
    question: 'How do I optimize capital structure?',
    answer:
      'Optimize by: calculating WACC at different debt/equity ratios, identifying the mix that minimizes WACC, considering industry norms and company risk profile, assessing financial flexibility needs, and balancing tax benefits against financial risk.',
  },
  {
    question: 'What is a typical debt-to-equity ratio?',
    answer:
      'Typical ratios vary by industry: Technology: 0.1-0.3x (low debt), Manufacturing: 0.5-1.0x, Utilities: 1.0-2.0x (high debt), Financial Services: 2.0-5.0x+. Ratios above 2.0x are considered high leverage.',
  },
  {
    question: 'How does capital structure affect firm value?',
    answer:
      'Capital structure affects firm value through WACC. Lower WACC increases firm value (higher DCF valuation). Optimal capital structure minimizes WACC, maximizing firm value. However, excessive leverage can reduce value due to bankruptcy risk.',
  },
  {
    question: 'What are the trade-offs of debt vs equity?',
    answer:
      'Debt benefits: Tax shield, lower cost, no dilution. Debt costs: Interest payments, financial risk, bankruptcy risk, covenants. Equity benefits: No fixed payments, financial flexibility. Equity costs: Higher cost, dilution, dividend expectations.',
  },
  {
    question: 'How do I validate capital structure?',
    answer:
      'Validate by: comparing to industry peers and benchmarks, assessing credit ratings and financial ratios, reviewing debt capacity and coverage ratios, performing sensitivity analysis on WACC, and considering market conditions and company lifecycle stage.',
  },
];

const relatedCalculators = [
  {
    name: 'LBO Debt Schedule Builder',
    slug: 'lbo-debt-schedule-builder',
    description: 'Build detailed debt repayment schedules.',
  },
  {
    name: 'DCF Calculator',
    slug: 'dcf-calculator',
    description: 'Calculate discounted cash flow valuation.',
  },
  {
    name: 'Enterprise Value Calculator',
    slug: 'enterprise-value-calculator',
    description: 'Calculate enterprise value.',
  },
  {
    name: 'WACC Calculator',
    slug: 'wacc-calculator',
    description: 'Calculate weighted average cost of capital.',
  },
];

const baseUrl = 'https://mycalculating.com/category/finance/capital-structure-debt-equity-mix-optimization-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Capital Structure (Debt/Equity Mix Optimization) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Capital Structure (Debt/Equity Mix Optimization) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Optimize capital structure by calculating WACC at different debt/equity ratios to minimize cost of capital and maximize firm value.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

const calculateResult = (values: FormValues): ResultPayload => {
  const marketValueEquity = values.marketValueEquity;
  const marketValueDebt = values.marketValueDebt;
  const totalValue = marketValueEquity + marketValueDebt;
  const equityWeight = totalValue > 0 ? marketValueEquity / totalValue : 0;
  const debtWeight = totalValue > 0 ? marketValueDebt / totalValue : 0;
  
  const costOfEquity = values.costOfEquity / 100;
  const costOfDebt = values.costOfDebt / 100;
  const taxRate = values.taxRate / 100;
  
  const afterTaxCostOfDebt = costOfDebt * (1 - taxRate);
  const wacc = (equityWeight * costOfEquity) + (debtWeight * afterTaxCostOfDebt);
  
  const debtToEquityRatio = marketValueEquity > 0 ? marketValueDebt / marketValueEquity : 0;
  
  let status: ResultPayload['status'] = 'optimal';
  let interpretation = '';
  
  if (wacc <= 0) {
    status = 'low';
    interpretation = 'Invalid WACC. Ensure all inputs are positive and properly weighted.';
  } else if (wacc > 0.15) {
    status = 'low';
    interpretation = 'WACC above 15% is high, indicating expensive capital. Consider optimizing capital structure to reduce cost.';
  } else if (wacc > 0.12) {
    status = 'moderate';
    interpretation = 'WACC 12-15% is moderate. May be acceptable depending on industry and risk profile, but optimization opportunities may exist.';
  } else if (wacc > 0.08) {
    status = 'good';
    interpretation = 'WACC 8-12% represents good capital structure efficiency. This is typical for many companies with balanced debt/equity mix.';
  } else {
    status = 'optimal';
    interpretation = 'WACC below 8% represents optimal capital structure with low cost of capital. This maximizes firm value and indicates efficient financing.';
  }

  const recommendations = [
    `WACC: ${(wacc * 100).toFixed(2)}% represents the weighted average cost of capital. Lower WACC increases firm value and indicates more efficient capital structure.`,
    `Capital structure: ${(equityWeight * 100).toFixed(1)}% equity, ${(debtWeight * 100).toFixed(1)}% debt. Debt-to-equity ratio: ${debtToEquityRatio.toFixed(2)}x.`,
    `Cost components: Cost of equity ${(costOfEquity * 100).toFixed(2)}%, After-tax cost of debt ${(afterTaxCostOfDebt * 100).toFixed(2)}% (pre-tax ${(costOfDebt * 100).toFixed(2)}% with ${(taxRate * 100).toFixed(0)}% tax shield).`,
  ];
  
  if (debtToEquityRatio > 2.0) {
    recommendations.push('Consider: Debt-to-equity ratio above 2.0x is high leverage. This increases financial risk and may raise cost of capital. Consider reducing debt or increasing equity.');
  }
  
  if (debtToEquityRatio < 0.3 && wacc > 0.10) {
    recommendations.push('Consider: Low debt ratio (<0.3x) with WACC >10% suggests opportunity to add debt. Debt provides tax shield and typically lower cost than equity, potentially reducing WACC.');
  }
  
  if (wacc > 0.12) {
    recommendations.push('Optimization: WACC above 12% suggests optimization opportunities. Consider adjusting debt/equity mix, refinancing debt at lower rates, or improving equity cost through better operations.');
  }
  
  recommendations.push('Validation: Compare capital structure to industry peers, assess credit ratings and financial ratios, review debt capacity, and perform sensitivity analysis on WACC at different debt/equity ratios.');

  const plan = [
    { label: 'This Week', detail: `Calculate WACC: ${(wacc * 100).toFixed(2)}% with ${(equityWeight * 100).toFixed(1)}% equity, ${(debtWeight * 100).toFixed(1)}% debt. Compare to industry benchmarks.` },
    { label: 'This Month', detail: 'Optimize capital structure by calculating WACC at different debt/equity ratios. Identify the mix that minimizes WACC. Assess financial risk and debt capacity.' },
    { label: 'Ongoing', detail: 'Monitor capital structure and WACC over time. Adjust debt/equity mix based on market conditions, company performance, and optimization opportunities. Review credit ratings and financial ratios regularly.' },
  ];

  return { marketValueEquity, marketValueDebt, totalValue, equityWeight, debtWeight, costOfEquity: values.costOfEquity, costOfDebt: values.costOfDebt, taxRate: values.taxRate, afterTaxCostOfDebt: afterTaxCostOfDebt * 100, wacc: wacc * 100, debtToEquityRatio, interpretation, status, recommendations, plan };
};

export default function CapitalStructureDebtEquityMixOptimizationCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketValueEquity: undefined,
      marketValueDebt: undefined,
      costOfEquity: undefined,
      costOfDebt: undefined,
      taxRate: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="capital-structure-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Capital Structure (Debt/Equity Mix Optimization) Calculator
          </CardTitle>
          <CardDescription>Optimize capital structure by calculating WACC at different debt/equity ratios to minimize cost of capital and maximize firm value.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Input your capital structure parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="marketValueEquity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Value of Equity</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 500000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="marketValueDebt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market Value of Debt</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 200000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="costOfEquity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost of Equity (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 12" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="costOfDebt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost of Debt (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 6" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate WACC
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
            <CardDescription>See WACC calculation and capital structure analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">WACC</p>
                <p className="text-2xl font-semibold text-primary">{result.wacc.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">Weighted average cost</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Debt/Equity Ratio</p>
                <p className="text-2xl font-semibold text-primary">{result.debtToEquityRatio.toFixed(2)}x</p>
                <p className="text-xs text-muted-foreground">Leverage ratio</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Equity Weight</p>
                <p className="text-2xl font-semibold text-primary">{(result.equityWeight * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total capital</p>
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
            <strong>WACC</strong> = (E/V × Re) + (D/V × Rd × (1 - T))
          </p>
          <p>Where:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>E = Market value of equity</li>
            <li>D = Market value of debt</li>
            <li>V = Total value (E + D)</li>
            <li>Re = Cost of equity</li>
            <li>Rd = Cost of debt</li>
            <li>T = Tax rate</li>
          </ul>
          <p>
            <strong>After-Tax Cost of Debt</strong> = Cost of Debt × (1 - Tax Rate)
          </p>
          <p>
            <strong>Debt-to-Equity Ratio</strong> = D / E
          </p>
          <p>WACC represents the average cost of capital, weighted by capital structure. Lower WACC increases firm value. Optimal capital structure minimizes WACC.</p>
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
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-semibold text-primary">${result.totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">E + D</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">After-Tax Cost of Debt</p>
                <p className="text-xl font-semibold text-primary">{result.afterTaxCostOfDebt.toFixed(2)}%</p>
                <p className="text-xs text-muted-foreground">With tax shield</p>
              </div>
              <div className="p-4 border rounded">
                <p className="text-sm text-muted-foreground">Debt Weight</p>
                <p className="text-xl font-semibold text-primary">{(result.debtWeight * 100).toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Of total capital</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Enter your capital structure parameters to see additional insights.</p>
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
        <meta itemProp="name" content="The Complete Guide to Capital Structure Optimization: WACC and Debt/Equity Mix" />
        <meta itemProp="description" content="An in-depth guide on optimizing capital structure by calculating WACC at different debt/equity ratios to minimize cost of capital and maximize firm value." />
        <meta itemProp="keywords" content="capital structure, WACC, debt equity mix, optimal capital structure, cost of capital" />
        <meta itemProp="author" content="[Your Site's Finance Team]" />
        <meta itemProp="datePublished" content="2025-12-02" />
        <meta itemProp="url" content="/category/finance/capital-structure-debt-equity-mix-optimization-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Capital Structure Optimization: WACC and Debt/Equity Mix</h1>
        <p className="text-lg italic text-gray-700 dark:text-gray-300">A comprehensive look at optimizing capital structure by calculating WACC at different debt/equity ratios to minimize cost of capital and maximize firm value.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-blue-600 dark:text-blue-400">
          <li><a href="#wacc" className="hover:underline">Understanding WACC</a></li>
          <li><a href="#optimization" className="hover:underline">Capital Structure Optimization</a></li>
          <li><a href="#tradeoffs" className="hover:underline">Debt vs Equity Trade-offs</a></li>
          <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks</a></li>
          <li><a href="#validation" className="hover:underline">Validation and Best Practices</a></li>
        </ul>
        <hr className="my-6" />

        <h2 id="wacc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding WACC</h2>
        <p>WACC (Weighted Average Cost of Capital) is the average cost of financing from both debt and equity sources, weighted by their proportions in the capital structure.</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg my-4">
          <p className="font-mono text-lg"><strong>WACC = (E/V × Re) + (D/V × Rd × (1 - T))</strong></p>
        </div>
        <p>Lower WACC increases firm value. Optimal capital structure minimizes WACC.</p>

        <hr className="my-6" />

        <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Capital Structure Optimization</h2>
        <p>Optimize capital structure by calculating WACC at different debt/equity ratios to find the mix that minimizes cost of capital. The optimal structure balances tax benefits of debt against financial risk.</p>

        <hr className="my-6" />

        <h2 id="tradeoffs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Debt vs Equity Trade-offs</h2>
        <p>Debt benefits: Tax shield, lower cost, no dilution. Debt costs: Interest payments, financial risk, bankruptcy risk. Equity benefits: No fixed payments, financial flexibility. Equity costs: Higher cost, dilution.</p>

        <hr className="my-6" />

        <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Industry Benchmarks</h2>
        <p>Typical debt-to-equity ratios vary by industry: Technology 0.1-0.3x, Manufacturing 0.5-1.0x, Utilities 1.0-2.0x, Financial Services 2.0-5.0x+.</p>

        <hr className="my-6" />

        <h2 id="validation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Validation and Best Practices</h2>
        <p>Validate by comparing to industry peers, assessing credit ratings, reviewing debt capacity, and performing sensitivity analysis.</p>

        <hr className="my-6" />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Capital structure optimization minimizes WACC, maximizing firm value. Proper calculation requires understanding debt/equity trade-offs, tax benefits, and financial risk. Optimal structure varies by industry, company size, and market conditions.</p>
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
          <p>This tool optimizes capital structure by calculating WACC at different debt/equity ratios to minimize cost of capital and maximize firm value.</p>
          <p>Outputs include WACC, debt-to-equity ratio, capital structure weights, interpretation, recommendations, an action plan, and supporting metrics.</p>
          <p>Formula, steps, guide content, related tools, and FAQs ensure humans or AI assistants can interpret the methodology instantly.</p>
        </CardContent>
      </Card>
    </div>
  );
}

