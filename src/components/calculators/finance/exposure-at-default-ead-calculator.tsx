'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, AlertCircle, Target, Info, Calculator, DollarSign, Shield, PieChart, FunctionSquare, CheckCircle2, Wallet, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

const formSchema = z.object({
  productType: z.string(),
  drawnBalance: z.number().min(0, 'Balance cannot be negative'),
  totalLimit: z.number().positive('Limit must be greater than zero'),
  ccfOverride: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PRODUCTS = {
  'corp_line': { label: 'Corporate Credit Line (>1yr)', ccf: 75, desc: 'Revolving facilities > 1 year maturity' },
  'short_line': { label: 'Short Term Line (<1yr)', ccf: 20, desc: 'Facilities maturing within 1 year' },
  'card': { label: 'Credit Card / Retail Revolver', ccf: 10, desc: 'Unconditionally cancellable commitments' },
  'guarantee': { label: 'Financial Guarantee', ccf: 100, desc: 'Direct credit substitutes' },
  'trade': { label: 'Trade Finance (LCs)', ccf: 20, desc: 'Self-liquidating trade letters of credit' },
  'custom': { label: 'Custom / Other', ccf: 50, desc: 'Manual CCF entry' },
};

export default function ExposureAtDefaultEADCalculator() {
  const [result, setResult] = useState<{
    ead: number;
    undrawnAmount: number;
    utilizedUndrawn: number;
    ccfUsed: number;
    utilizationRate: number;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productType: 'corp_line',
      drawnBalance: undefined,
      totalLimit: undefined,
      ccfOverride: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    // Inputs
    const drawn = v.drawnBalance;
    const limit = v.totalLimit;

    // Determine Undrawn
    const undrawn = Math.max(0, limit - drawn);

    // Determine CCF
    let ccf = 0;
    if (v.productType === 'custom' && v.ccfOverride !== undefined) {
      ccf = v.ccfOverride;
    } else {
      ccf = PRODUCTS[v.productType as keyof typeof PRODUCTS]?.ccf || 75;
    }
    const ccfDecimal = ccf / 100;

    // EAD Calculation
    // EAD = Drawn + (Undrawn * CCF)
    const utilizedUndrawn = undrawn * ccfDecimal;
    const ead = drawn + utilizedUndrawn;

    // Metrics
    const utilization = drawn / limit;

    return {
      ead,
      undrawnAmount: undrawn,
      utilizedUndrawn,
      ccfUsed: ccf,
      utilizationRate: utilization,
    };
  };

  const getRecommendation = (utilization: number, ead: number) => {
    if (utilization > 0.9) {
      return `Credit limit is nearly fully utilized (90%+). EAD is strictly capped by the Total Limit. Monitor for limit breaches.`;
    }
    return `EAD is estimated at $${ead.toLocaleString()}. Sufficient headroom exists, but capital must be held against potential future drawdowns.`;
  };

  const getInsights = (ccf: number, undrawn: number, utilized: number) => {
    const insights = [];
    if (undrawn > 0) {
      insights.push(`Hidden Risk: $${utilized.toLocaleString()} of undrawn commitment is treated as exposure due to the ${ccf}% CCF.`);
      insights.push(`Conversion Logic: Regulatory models assume borrowers draw down funds as they approach default.`);
    } else {
      insights.push('Fully Drawn: Since Undrawn is zero, EAD equals the current balance.');
    }

    // Basel specific note
    if (ccf === 75) insights.push('Basel Standard: 75% CCF is standard for corporate revolvers.');
    if (ccf === 10) insights.push('Retail Standard: 10% CCF reflects high cancellation rates for credit cards.');

    return insights;
  };

  const getRisks = () => {
    const risks = [];
    risks.push('Limit Management: If the bank cannot unilaterally cancel the line, the full limit is at risk.');
    risks.push('Wrong-Way Risk: Borrowers are most likely to draw down exactly when their credit quality deteriorates.');
    risks.push('Off-Balance Sheet: Undrawn commitments represent off-balance sheet risk that attracts capital charges.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      recommendation: getRecommendation(calc.utilizationRate, calc.ead),
      insights: getInsights(calc.ccfUsed, calc.undrawnAmount, calc.utilizedUndrawn),
      risks: getRisks()
    });
  };

  const type = form.watch('productType');

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Exposure Parameters
          </CardTitle>
          <CardDescription>
            Input facility limits and usage logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Facility Type (Determines CCF)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(PRODUCTS).map(([key, p]) => (
                            <SelectItem key={key} value={key}>
                              {p.label} - {p.ccf}% CCF
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        {PRODUCTS[field.value as keyof typeof PRODUCTS]?.desc}
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="drawnBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Current Drawn Balance
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 200000"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Committed Limit
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 1000000"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {type === 'custom' && (
                  <FormField
                    control={form.control}
                    name="ccfOverride"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Custom CCF (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1"
                            placeholder="e.g., 50"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate EAD
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <PieChart className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Total Exposure</CardTitle>
                  <CardDescription>Estimated Exposure at Default</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">EAD Estimate</p>
                <p className="text-4xl font-bold text-primary">
                  {result.ead.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <Badge variant="outline" className="mt-3 text-sm px-3 py-1">
                  Utilization: {(result.utilizationRate * 100).toFixed(1)}%
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-xs text-muted-foreground uppercase">Drawn</p>
                  <p className="text-lg font-bold">{(form.getValues('drawnBalance') || 0).toLocaleString()}</p>
                </div>
                <div className="flex flex-col justify-center items-center text-muted-foreground text-sm font-bold">
                  <span>+</span>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg border-l-4 border-amber-500">
                  <p className="font-semibold text-xs text-muted-foreground uppercase">Add-On (CCF {result.ccfUsed}%)</p>
                  <p className="text-lg font-bold">{result.utilizedUndrawn.toLocaleString()}</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Assessment:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <TrendingUp className="h-6 w-6" />
                  Understanding the Calculation
                </CardTitle>
                <CardDescription>Component Breakdown</CardDescription>
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
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Key Risks
                </CardTitle>
                <CardDescription>What to watch out for</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{risk}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Formula Used */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula: EAD & CCF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              EAD = Drawn Balance + (Undrawn Commitment × CCF)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The <strong>Exposure at Default</strong> is the sum of what the borrower has already borrowed, plus a percentage of what they <em>could</em> borrow before defaulting. This percentage is the <strong>Credit Conversion Factor (CCF)</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Risk and Solvency Tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/credit-risk-expected-loss-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Expected Loss</p>
                      <p className="text-sm text-muted-foreground">Estimate credit costs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/probability-of-default-pd-estimator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">PD Estimator</p>
                      <p className="text-sm text-muted-foreground">Default Probability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/current-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Current Ratio</p>
                      <p className="text-sm text-muted-foreground">Liquidity analysis</p>
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
        {/* SEO & SCHEMA METADATA */}
        <meta itemProp="headline" content="Calculating Exposure at Default (EAD): Regulatory Guide" />
        <meta itemProp="description" content="Learn how to calculate Exposure at Default (EAD) for credit risk. Understand drawn balances, undrawn commitments, and Credit Conversion Factors (CCF)." />
        <meta itemProp="keywords" content="exposure at default calculator, EAD formula, credit conversion factor CCF, Basel III EAD, undrawn commitment risk, counterparty credit risk" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-08-30" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Exposure at Default (EAD)</h1>
        <p className="text-lg italic text-muted-foreground">EAD is one of the three critical components of the credit risk function (Basel II/III). It predicts how much money a bank will actually have lent out at the precise moment a borrower goes bankrupt.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Undrawn Commitment?</a></li>
          <li><a href="#ccf" className="hover:underline">Credit Conversion Factors (CCF) Explained</a></li>
          <li><a href="#types" className="hover:underline">EAD by Product Type</a></li>
          <li><a href="#regulation" className="hover:underline">Regulatory Approaches (Standardized vs IRB)</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Undrawn Commitment?</h2>
        <p>
          Most loans are not fully funded upfront. Banks provide <strong>Credit Facilities</strong> (like a credit card or a corporate revolving line) with a maximum limit.
        </p>
        <p className="mt-2">
          When a borrower gets into financial trouble, they typically start drawing down all available cash from their credit lines to stay afloat. Therefore, at the time of default, the balance is usually much higher than it is today.
        </p>

        <h2 id="ccf" className="text-2xl font-bold text-foreground pt-8">Credit Conversion Factors (CCF) Explained</h2>
        <p>
          The CCF is a percentage estimate of how much of the <em>currently undrawn</em> limit will be drawn down before default occurs.
        </p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">EAD = Drawn + (Undrawn × CCF)</p>
        </div>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>0% CCF:</strong> The bank assumes NONE of the remaining limit will be used. (Rare, only for unconditionally cancellable lines).</li>
          <li><strong>100% CCF:</strong> The bank assumes the borrower will max out the limit completely. (Common for guarantees or lines maturing very soon).</li>
          <li><strong>75% CCF:</strong> A standard assumption for most corporate credit lines.</li>
        </ul>

        <h2 id="types" className="text-2xl font-bold text-foreground pt-8">EAD by Product Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Revolving Credit</h4>
            <p className="text-sm">High EAD risk. Companies usually treat these as "emergency funds".</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Term Loans</h4>
            <p className="text-sm">Low EAD risk (Undrawn = 0). Since the money is fully disbursed upfront, EAD is simply the outstanding principal.</p>
          </div>
        </div>

        <h2 id="regulation" className="text-2xl font-bold text-foreground pt-8">Regulatory Approaches</h2>
        <p>
          Under Basel III, banks calculate EAD using either:
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Standardized Approach (SA-CCR):</strong> Regulators prescribe fixed CCF percentages for every product type.</li>
          <li><strong>Internal Ratings Based (Foundation IRB):</strong> Banks must use regulator CCFs but accurate PD/LGD.</li>
          <li><strong>Advanced IRB:</strong> Banks can use their own historical data to estimate CCF.</li>
        </ul>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about EAD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Does EAD include interest?</h4>
              <p className="text-muted-foreground">
                Typically, yes. EAD should reflect the outstanding principal plus any accrued interest and fees at the time of default.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can EAD exceed the Limit?</h4>
              <p className="text-muted-foreground">
                Technically yes, if the borrower exceeds their limit (overlimit) due to interest capitalization or fees, but usually models cap EAD at the Limit + 10% margin.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why is CCF low for credit cards?</h4>
              <p className="text-muted-foreground">
                Banks have the right to freeze credit cards instantly upon a missed payment. This "unconditional cancellability" allows a lower CCF (often 0-20%) compared to committed corporate lines (75%).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Wrong-Way Risk" in EAD?</h4>
              <p className="text-muted-foreground">
                This occurs when the borrower's exposure (EAD) increases as their credit quality decreases. Example: A derivative where you are owed money by a counterparty whose stock you hold as collateral.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does Netting affect EAD?</h4>
              <p className="text-muted-foreground">
                For derivatives, EAD is calculated on a "Net" basis if a valid Master Netting Agreement (ISDA) exists. This drastically reduces exposure compared to Gross EAD.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens to EAD after default?</h4>
              <p className="text-muted-foreground">
                After default strategies kick in, EAD becomes the "Outstanding Balance" and calculation stops. The focus shifts to LGD (Recovery).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is EAD updated daily?</h4>
              <p className="text-muted-foreground">
                For trading (derivatives) books, yes. For banking (loan) books, usually monthly or when a drawdown event occurs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Exposure at Default (EAD) Calculator applies Basel II/III logic to estimate credit exposure.</p>
          <p>It accounts for the risk of borrowers drawing down committed lines prior to default.</p>
          <p>Use this tool to calculate Risk Weighted Assets (RWA) and Regulatory Capital requirements.</p>
        </CardContent>
      </Card>
    </div>
  );
}
