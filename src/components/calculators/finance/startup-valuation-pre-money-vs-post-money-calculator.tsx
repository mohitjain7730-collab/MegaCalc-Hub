'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DollarSign, Percent, Target, Zap, Info, FunctionSquare, Calculator, CheckCircle2, AlertCircle, Briefcase, AlertTriangle, Landmark, Shield, TrendingUp, Users, BarChart3 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  preMoneyValuation: z.number({ invalid_type_error: 'Enter pre-money valuation' }).min(0),
  investmentAmount: z.number({ invalid_type_error: 'Enter investment amount' }).min(0),
  // Optional: second scenario for comparison
  preMoneyValuationCompare: z.number().min(0).optional(),
  investmentAmountCompare: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type Scenario = {
  preMoney: number;
  investment: number;
  postMoney: number;
  investorPct: number;
  pricePerPct: number;
};

type ResultPayload = {
  scenario: Scenario;
  scenarioCompare: Scenario | null;
  interpretation: string;
  recommendation: string;
  status: 'typical' | 'high-ownership' | 'low-ownership';
  recommendations: string[];
  insights: string[];
  considerations: string[];
};

const baseUrl = 'https://mycalculating.com/category/finance/startup-valuation-pre-money-vs-post-money-calculator';

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
        { '@type': 'ListItem', position: 2, name: 'Finance', item: 'https://mycalculating.com/category/finance' },
        { '@type': 'ListItem', position: 3, name: 'Startup Valuation (Pre-Money vs Post-Money) Calculator', item: baseUrl },
      ],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Startup Valuation (Pre-Money vs Post-Money) Calculator',
      applicationCategory: 'Calculator',
      operatingSystem: 'Web Browser',
      description: 'Compare pre-money vs post-money valuation: post-money, investor ownership, and price per % for startup funding rounds.',
      url: baseUrl,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

function buildScenario(preMoney: number, investment: number): Scenario {
  const postMoney = preMoney + investment;
  const investorPct = postMoney > 0 ? (investment / postMoney) * 100 : 0;
  const pricePerPct = investorPct > 0 ? investment / investorPct : 0;
  return { preMoney, investment, postMoney, investorPct, pricePerPct };
}

const calculateResult = (values: FormValues): ResultPayload => {
  const scenario = buildScenario(values.preMoneyValuation, values.investmentAmount);
  let scenarioCompare: Scenario | null = null;
  if (values.preMoneyValuationCompare != null && values.preMoneyValuationCompare > 0 && values.investmentAmountCompare != null && values.investmentAmountCompare > 0) {
    scenarioCompare = buildScenario(values.preMoneyValuationCompare, values.investmentAmountCompare);
  }

  let status: ResultPayload['status'] = 'typical';
  let interpretation = 'Post-money = pre-money + investment. Investor % = investment ÷ post-money. Use this to compare how different pre-money valuations affect ownership for the same check size.';

  if (scenario.investorPct > 35) {
    status = 'high-ownership';
    interpretation = 'Investor receives a large ownership share for the check. Consider a higher pre-money or smaller raise if you want to retain more ownership.';
  } else if (scenario.investorPct < 15) {
    status = 'low-ownership';
    interpretation = 'Investor receives a small ownership share. Pre-money is high relative to the check; ensure valuation is justified by traction and milestones.';
  }

  const recommendation = 'Use pre-money vs post-money to negotiate: same check at higher pre-money gives the investor less %. Compare scenarios to see the trade-off.';

  const recommendations: string[] = [
    `Post-money: $${scenario.postMoney.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Investor: ${scenario.investorPct.toFixed(1)}%. Price per 1%: $${scenario.pricePerPct.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`,
    scenarioCompare
      ? `Compare: At $${scenarioCompare.preMoney.toLocaleString(undefined, { maximumFractionDigits: 0 })} pre and $${scenarioCompare.investment.toLocaleString(undefined, { maximumFractionDigits: 0 })} invest, investor gets ${scenarioCompare.investorPct.toFixed(1)}%.`
      : 'Add a second scenario (pre-money and investment) to compare ownership side by side.',
    'Pre-money vs post-money: pre-money is the value before the round; post-money = pre-money + investment. Investor % is always investment ÷ post-money.',
  ];

  const insights: string[] = [];
  if (status === 'typical') {
    insights.push('Investor ownership is in a typical range for many seed/Series A rounds');
    insights.push('Use the comparison scenario to see how pre-money affects ownership');
  } else if (status === 'high-ownership') {
    insights.push('Investor receives a large share; consider higher pre-money or smaller raise');
    insights.push('Model founder dilution with our Founder Dilution After Funding calculator');
  } else {
    insights.push('Investor receives a small share; ensure pre-money is justified by metrics');
    insights.push('High pre-money can set high expectations for the next round');
  }
  insights.push('Price per 1% = investment ÷ investor %; useful for comparing rounds');

  const considerations: string[] = [
    'Pre-money and post-money are agreed in the term sheet; they determine investor % and thus founder dilution.',
    'Same check size at a higher pre-money gives the investor a smaller % and less dilution to founders.',
    'Option pool is often created pre-money, which dilutes founders; model separately if needed.',
    'Valuation should be justified by traction, market size, and benchmarks; this calculator does not set valuation.',
  ];

  return {
    scenario,
    scenarioCompare,
    interpretation,
    recommendation,
    status,
    recommendations,
    insights,
    considerations,
  };
};

export default function StartupValuationPreMoneyVsPostMoneyCalculator() {
  const [result, setResult] = useState<ResultPayload | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preMoneyValuation: undefined,
      investmentAmount: undefined,
      preMoneyValuationCompare: undefined,
      investmentAmountCompare: undefined,
    },
  });

  return (
    <div className="space-y-8">
      <Script id="startup-valuation-pmvp-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Startup Valuation (Pre-Money vs Post-Money) Calculator
          </CardTitle>
          <CardDescription>
            Compare pre-money vs post-money: post-money valuation, investor ownership %, and price per 1%. Optional second scenario for side-by-side comparison. Startup-specific.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valuation inputs</CardTitle>
          <CardDescription>Pre-money valuation and investment amount. Optionally add a second scenario to compare.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => setResult(calculateResult(values)))} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preMoneyValuation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pre-money valuation ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 10000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investmentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 2000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <p className="text-sm text-muted-foreground">Optional: add a second scenario to compare pre-money vs post-money side by side.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="preMoneyValuationCompare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare: Pre-money ($) — optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 15000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investmentAmountCompare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Compare: Investment ($) — optional</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 2000000" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Pre-Money vs Post-Money
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Pre-Money vs Post-Money Results</CardTitle>
                  <CardDescription>Post-money valuation, investor %, price per 1%</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.scenario.postMoney.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-lg text-muted-foreground mt-2">Post-money valuation</p>
                <p className="text-sm text-muted-foreground mt-1">{result.interpretation}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold">Investor ownership</p>
                  <p className="text-2xl font-bold text-primary">{result.scenario.investorPct.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold">Price per 1%</p>
                  <p className="text-xl font-bold text-primary">${result.scenario.pricePerPct.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold">Status</p>
                  <Badge variant={result.status === 'typical' ? 'default' : result.status === 'high-ownership' ? 'destructive' : 'secondary'}>
                    {result.status === 'typical' ? 'Typical' : result.status === 'high-ownership' ? 'High investor %' : 'Low investor %'}
                  </Badge>
                </div>
              </div>
              {result.scenarioCompare && (
                <div className="p-4 border rounded-lg">
                  <p className="font-medium mb-2">Comparison scenario</p>
                  <p className="text-sm text-muted-foreground">
                    Pre-money ${result.scenarioCompare.preMoney.toLocaleString(undefined, { maximumFractionDigits: 0 })} + ${result.scenarioCompare.investment.toLocaleString(undefined, { maximumFractionDigits: 0 })} → Post-money ${result.scenarioCompare.postMoney.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Investor: {result.scenarioCompare.investorPct.toFixed(1)}%.
                  </p>
                </div>
              )}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription><strong>Recommendation:</strong> {result.recommendation}</AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary"><Target className="h-6 w-6" />Strategic Insights</CardTitle>
                <CardDescription>Valuation and ownership</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400"><AlertCircle className="h-6 w-6" />Risk & Considerations</CardTitle>
                <CardDescription>Factors to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.considerations.map((consideration, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{consideration}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle>
          <CardDescription>Key components required for pre-money vs post-money valuation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300"><DollarSign className="h-4 w-4" />Pre-money valuation</h4>
              <p className="text-sm text-muted-foreground mb-3">The value of the company immediately before the investment. Agreed in the term sheet. Post-money = pre-money + investment.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><span>Negotiated between founders and investors</span></li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /><span>Often justified by traction and benchmarks</span></li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300"><Percent className="h-4 w-4" />Investment amount</h4>
              <p className="text-sm text-muted-foreground mb-3">The amount the investor invests. Investor ownership % = investment ÷ post-money. Same check at higher pre-money gives investor a smaller %.</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><span>Check size determines investor % for a given pre-money</span></li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" /><span>Optional second scenario for side-by-side comparison</span></li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FunctionSquare className="h-5 w-5" />Formula Used</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">Post-money = Pre-money + Investment</p>
            <p className="font-mono text-sm text-center mt-2">Investor % = Investment ÷ Post-money × 100</p>
            <p className="font-mono text-sm text-center mt-2">Price per 1% = Investment ÷ Investor %</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Pre-money is the value before the round; post-money is the value after the round. Investor % determines founder dilution.</p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Related Financial Calculators</CardTitle>
          <CardDescription>Explore other startup valuation and dilution tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/founder-dilution-after-funding-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Founder Dilution After Funding Calculator</p>
                      <p className="text-sm text-muted-foreground">See founder % after a round.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/startup-valuation-post-money-pre-money-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Pre-Money / Post-Money Valuation Calculator</p>
                      <p className="text-sm text-muted-foreground">Post-money and ownership.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/pre-money-vs-post-money-valuation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Pre-Money vs Post-Money Valuation Calculator</p>
                      <p className="text-sm text-muted-foreground">Valuation and dilution.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/equity-split-calculator-for-co-founders" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Equity Split Calculator for Co-Founders</p>
                      <p className="text-sm text-muted-foreground">Co-founder equity split.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/option-pool-allocation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Option Pool Allocation Calculator</p>
                      <p className="text-sm text-muted-foreground">Size option pool and dilution.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/post-funding-runway-extension-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Post-Funding Runway Extension Calculator</p>
                      <p className="text-sm text-muted-foreground">Runway extension after funding.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="name" content="The Definitive Guide to Startup Valuation: Pre-Money vs Post-Money" />
        <meta itemProp="description" content="Expert guide to pre-money vs post-money valuation: formulas, investor ownership, price per 1%, and comparing scenarios for startup funding." />
        <meta itemProp="keywords" content="pre-money valuation, post-money valuation, startup valuation, investor ownership, funding round" />
        <meta itemProp="url" content={baseUrl} />
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Startup Valuation: Pre-Money vs Post-Money</h1>
        <p className="text-lg italic text-muted-foreground">Compare pre-money and post-money valuation: post-money = pre-money + investment; investor % = investment ÷ post-money. Use this to see how different pre-money valuations affect ownership for the same check.</p>
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#pmvp-definition" className="hover:underline">Pre-Money vs Post-Money: Definition and Purpose</a></li>
          <li><a href="#pmvp-formula" className="hover:underline">The Formulas and Components</a></li>
          <li><a href="#pmvp-interpretation" className="hover:underline">Interpreting Results and Price per 1%</a></li>
          <li><a href="#pmvp-comparison" className="hover:underline">Comparing Scenarios</a></li>
          <li><a href="#pmvp-term-sheet" className="hover:underline">Term Sheet and Negotiation</a></li>
          <li><a href="#pmvp-conclusion" className="hover:underline">Conclusion</a></li>
        </ul>
        <hr />
        <h2 id="pmvp-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Pre-Money vs Post-Money: Definition and Purpose</h2>
        <p>Pre-money valuation is the value of the company immediately before the investment. Post-money valuation = pre-money + investment. The investor receives a percentage equal to investment ÷ post-money. Comparing pre-money vs post-money helps you see how the same check size results in different ownership at different pre-money valuations.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why the Distinction Matters</h3>
        <p>Same investment at a higher pre-money gives the investor a smaller percentage and thus less dilution to founders. Negotiating pre-money is therefore central to term sheet discussions. This calculator shows post-money, investor %, and price per 1% so you can compare scenarios side by side.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Who Sets Pre-Money?</h3>
        <p>Pre-money is negotiated between founders and investors and documented in the term sheet. It should be justified by traction, market size, and benchmarks. This calculator does not set valuation; it shows the math given a pre-money and investment so you can model different outcomes.</p>
        <hr />
        <h2 id="pmvp-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Formulas and Components</h2>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-lg text-destructive font-bold">Post-money = Pre-money + Investment</p>
          <p className="font-mono text-lg text-destructive font-bold mt-2">Investor % = Investment ÷ Post-money × 100</p>
          <p className="font-mono text-lg text-destructive font-bold mt-2">Price per 1% = Investment ÷ Investor %</p>
        </div>
        <p>Price per 1% is the amount paid for each percentage point of the company; useful for comparing rounds or investors. For example, if an investor puts in $2M for 20%, price per 1% is $100K.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Option Pool and Dilution</h3>
        <p>Option pool is often created or expanded before the round (pre-money), which dilutes founders. Pre-money and post-money in this calculator refer to the valuation of the company; the pool is a separate allocation. Use an option pool or founder dilution calculator to model pool impact on founder ownership.</p>
        <hr />
        <h2 id="pmvp-interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Results and Price per 1%</h2>
        <p>Investor ownership in the 15–30% range is common for many seed and Series A rounds. Higher investor % means more dilution to founders; lower investor % means the investor is paying a higher price per 1%. Use the comparison scenario to see how changing pre-money or investment affects ownership.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Typical Ranges by Stage</h3>
        <p>Seed rounds often give investors 15–25%; Series A often 15–25% as well, though round size and valuation vary by market and traction. Use this calculator to see where your scenario lands and compare with a second scenario (e.g. higher pre-money, same check) to understand the trade-off.</p>
        <hr />
        <h2 id="pmvp-comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Comparing Scenarios</h2>
        <p>Enter a second pre-money and investment to compare: e.g. $10M pre + $2M invest vs. $15M pre + $2M invest. You will see how the same check gives a smaller investor % at higher pre-money, and thus less founder dilution. This is useful for negotiating or comparing term sheets from different investors.</p>
        <hr />
        <h2 id="pmvp-term-sheet" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Term Sheet and Negotiation</h2>
        <p>Pre-money and post-money are key terms in the term sheet. Understanding the math helps founders negotiate: a higher pre-money with the same investment preserves more founder ownership. Pair this calculator with a founder dilution calculator to see the full impact on founder % after the round and any option pool.</p>
        <hr />
        <h2 id="pmvp-conclusion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>Use this calculator to compare pre-money vs post-money valuation, investor ownership, and price per 1%. Pair with a founder dilution calculator to see full dilution impact of the round, including option pool if applicable.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Next Steps</h3>
        <p>After you have modeled your scenario: (1) Use the comparison scenario to see how different pre-money or investment amounts affect ownership. (2) Negotiate pre-money in the term sheet; a higher pre-money with the same check preserves more founder ownership. (3) Run the Founder Dilution After Funding Calculator to see founder % before and after the round and any option pool. (4) Document agreed pre-money and post-money in the term sheet so both parties have clear numbers.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about pre-money vs post-money valuation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is pre-money valuation?</h4>
              <p className="text-muted-foreground">Pre-money valuation is the value of the company immediately before the investment. It is agreed in the term sheet. Post-money = pre-money + investment. Negotiating a higher pre-money with the same investment gives the investor a smaller percentage and thus less dilution to founders.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is post-money valuation?</h4>
              <p className="text-muted-foreground">Post-money valuation is the value of the company after the investment. Post-money = pre-money + investment. Investor ownership % = investment ÷ post-money. The post-money valuation is often cited in press and cap tables to describe the size of the round.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How does the same check size affect ownership at different pre-money valuations?</h4>
              <p className="text-muted-foreground">The same investment at a higher pre-money gives the investor a smaller percentage (less dilution to founders). For example, $2M at $8M pre = 20% investor; $2M at $18M pre ≈ 10% investor.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is price per 1%?</h4>
              <p className="text-muted-foreground">Price per 1% = investment ÷ investor %. It is the amount paid for each percentage point of the company. Useful for comparing rounds or different term sheets.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What investor % is typical?</h4>
              <p className="text-muted-foreground">Many seed rounds give investors 15–25%; Series A often 15–25%. It varies by market, traction, and round size. Use this calculator to see where your scenario lands. Higher investor % means more dilution to founders; lower investor % means the investor is paying a higher price per 1% of the company.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Does option pool affect pre-money vs post-money?</h4>
              <p className="text-muted-foreground">Option pool is often created or expanded before the round (pre-money), which dilutes founders. Pre-money and post-money in this calculator refer to the valuation of the company; the pool is a separate allocation. Use an option pool or founder dilution calculator to model pool impact on founder ownership.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use the comparison scenario?</h4>
              <p className="text-muted-foreground">Enter a second pre-money and investment (e.g. a higher pre-money with the same check) to see side by side how investor % and price per 1% change. Useful for negotiating or comparing term sheets. For example, compare $10M pre + $2M vs $15M pre + $2M to see how the same check gives a smaller investor % at higher pre-money.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Who sets pre-money valuation?</h4>
              <p className="text-muted-foreground">Pre-money is negotiated between founders and investors and documented in the term sheet. It should be justified by traction, market size, and benchmarks. This calculator does not set valuation; it shows the math given a pre-money and investment so you can model different outcomes before or during negotiations.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How does this differ from Founder Dilution After Funding Calculator?</h4>
              <p className="text-muted-foreground">This calculator focuses on pre-money vs post-money valuation and investor %. The Founder Dilution calculator focuses on founder ownership before and after the round and optional option pool. Use both: this one for valuation and investor %; that one for founder % and dilution. Together they give a complete picture of the round.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Why do investors care about pre-money vs post-money?</h4>
              <p className="text-muted-foreground">Investors use pre-money and post-money to determine how much of the company they get for their check. Understanding the math helps founders negotiate and compare term sheets. Pair with a founder dilution calculator to see full impact on founder ownership. Both founders and investors benefit from clear, shared numbers in the term sheet.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" />Usage of this Calculator</CardTitle>
          <CardDescription>Practical applications and real-world context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3"><Users className="h-5 w-5 text-blue-600" />Who Should Use This Calculator?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Founders</strong>
                <span className="text-sm text-muted-foreground">To compare pre-money vs post-money and see how different valuations affect investor ownership and founder dilution.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Investors & Advisors</strong>
                <span className="text-sm text-muted-foreground">To model post-money, investor %, and price per 1% for term sheet discussions.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Lawyers & CFOs</strong>
                <span className="text-sm text-muted-foreground">To quickly illustrate ownership and dilution for clients in funding rounds.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Accelerators & Incubators</strong>
                <span className="text-sm text-muted-foreground">To teach cohorts the relationship between pre-money, post-money, and investor %.</span>
              </div>
            </div>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3"><AlertTriangle className="h-5 w-5 text-amber-600" />Limitations & Accuracy</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span><strong>Valuation:</strong> This calculator does not set valuation; it shows the math given pre-money and investment. Valuation should be justified by metrics and benchmarks.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span><strong>Option pool:</strong> Option pool pre-money dilutes founders; model separately if needed with an option pool or founder dilution calculator.</span></li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" /><span><strong>Multiple investors:</strong> For a single round with one check, the math is as shown; for multiple investors in one round, ownership is split among them based on their respective investments.</span></li>
            </ul>
          </div>
          <hr className="border-border/50" />
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3"><Landmark className="h-5 w-5 text-green-600" />Real-World Examples</h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Seed round</h5>
                <p className="text-sm text-muted-foreground">$10M pre-money + $2M investment → Post-money $12M. Investor % = 2/12 ≈ 16.7%. Price per 1% = $2M ÷ 16.7 ≈ $120K. Compare: $15M pre + $2M → Post $17M, investor ≈ 11.8%. Same check, higher pre-money, less dilution.</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Series A</h5>
                <p className="text-sm text-muted-foreground">$30M pre-money + $10M investment → Post-money $40M. Investor % = 10/40 = 25%. Price per 1% = $400K. Use the comparison scenario to see what happens at $35M pre + $10M (investor ≈ 22.2%) to understand the dilution trade-off.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Startup Valuation (Pre-Money vs Post-Money) Calculator compares pre-money and post-money valuation: post-money = pre-money + investment, investor % = investment ÷ post-money, and price per 1%.</p>
          <p>Use the optional comparison scenario to see how different pre-money or investment amounts affect ownership. Pair with a founder dilution calculator to see full impact on founder ownership after the round and any option pool.</p>
          <p>Pre-money is negotiated in the term sheet; this tool shows the math so you can model and compare scenarios before negotiating.</p>
        </CardContent>
      </Card>
    </div>
  );
}
