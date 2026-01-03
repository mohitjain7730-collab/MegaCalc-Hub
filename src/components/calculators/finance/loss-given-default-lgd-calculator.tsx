'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, AlertCircle, Info, Landmark, Calculator, DollarSign, Shield, PieChart, FunctionSquare, CheckCircle2, Coins, Receipt, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

const formSchema = z.object({
  calculationMethod: z.enum(['simple', 'workout']),
  exposureAtDefault: z.number().positive('Exposure must be positive'),
  collateralValue: z.number().min(0).optional(),

  // Simple Mode Inputs
  marketPricePostDefault: z.number().min(0).max(100).optional(), // % of par

  // Workout Mode Inputs
  cashRecoveryAmount: z.number().min(0).optional(),
  administrativeCosts: z.number().min(0).optional(),
  timeToRecovery: z.number().min(0).optional(), // Years
  discountRate: z.number().min(0).max(100).optional(), // %
});

type FormValues = z.infer<typeof formSchema>;

export default function LossGivenDefaultLGDCalculator() {
  const [result, setResult] = useState<{
    lgdPercent: number;
    recoveryPercent: number;
    netLossAmount: number;
    netRecoveryAmount: number;
    collateralCoverage: number;
    methodUsed: string;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculationMethod: 'simple',
      exposureAtDefault: undefined,
      collateralValue: 0,
      marketPricePostDefault: undefined,
      cashRecoveryAmount: undefined,
      administrativeCosts: 0,
      timeToRecovery: 1,
      discountRate: 5,
    },
  });

  const method = form.watch('calculationMethod');

  const calculate = (v: FormValues) => {
    const EAD = v.exposureAtDefault;
    let netRecovery = 0;
    let methodDesc = '';

    if (v.calculationMethod === 'simple') {
      const marketPrice = v.marketPricePostDefault || 0;
      // Simple Market Implied Recovery
      // Recovery = EAD * (Price / 100) + Collateral (Simplified view, usually price reflects collateral)
      // Let's assume Price includes collateral value for 'Market Price' method.
      // OR if collat is distinct: Rec = min(EAD, Collateral) + Unsecured * Price.
      // Let's stick to standard Market LGD: LGD = 1 - Price.

      // If user enters collateral, we can treat it as:
      // Secured Portion = min(Collateral, EAD) -> 100% Recovery (simplified)
      // Unsecured Portion = max(0, EAD - Collateral) -> Price% Recovery

      const secured = Math.min(v.collateralValue || 0, EAD);
      const unsecured = Math.max(0, EAD - (v.collateralValue || 0));
      const unsecuredRecovery = unsecured * (marketPrice / 100);

      netRecovery = secured + unsecuredRecovery;
      methodDesc = 'Market Price + Collateral';

    } else {
      // Workout LGD (Discounted Cash Flow)
      // PV of Recovery = (Cash - Costs) / (1 + r)^t
      const cash = v.cashRecoveryAmount || 0;
      const costs = v.administrativeCosts || 0;
      const t = v.timeToRecovery || 0;
      const r = (v.discountRate || 0) / 100;

      // Add collateral liquidation proceeds to cash recovery
      const collateralProceeds = v.collateralValue || 0; // Assume liquidated at t=T
      const totalInflow = cash + collateralProceeds - costs;

      netRecovery = totalInflow / Math.pow(1 + r, t);
      methodDesc = 'Workout (Discounted Cash Flow)';
    }

    const netLoss = EAD - netRecovery;
    const lgdPct = (netLoss / EAD) * 100;
    const recoveryPct = (netRecovery / EAD) * 100;
    const collateralCoverage = ((v.collateralValue || 0) / EAD) * 100;

    return {
      lgdPercent: Math.max(0, Math.min(100, lgdPct)),
      recoveryPercent: Math.max(0, Math.min(100, recoveryPct)),
      netLossAmount: Math.max(0, netLoss),
      netRecoveryAmount: Math.max(0, netRecovery),
      collateralCoverage,
      methodUsed: methodDesc
    };
  };

  const getRecommendation = (lgd: number) => {
    if (lgd < 20) return 'High Recovery Expected. The position is well-secured. Primary risk is liquidity (time to liquidate), not solvency.';
    if (lgd < 50) return 'Moderate Loss Expected. Collateral covers a significant portion of exposure. Monitor collateral value volatility.';
    return 'High Loss Severity. The position is largely unsecured. Recovery depends heavily on corporate restructuring outcomes.';
  };

  const getInsights = (lgd: number, coverage: number, method: string) => {
    const insights = [];
    if (coverage > 100) insights.push('Over-Collateralized: Collateral value exceeds exposure, but liquidation costs or market drops could still cause loss.');
    else insights.push(`Under-Secured: Collateral only covers ${coverage.toFixed(1)}% of the exposure.`);

    if (method.includes('Discounted')) insights.push('Time Value of Money: Delays in legal proceedings significantly increase LGD due to the discounting of recoveries.');
    insights.push(`Sensitivity: A 10% drop in recovery estimates increases Loss Amount by 10%.`);

    return insights;
  };

  const getRisks = (coverage: number) => {
    const risks = [];
    risks.push('Collateral Liquidity: Illiquid assets may sell at a "fire sale" discount significantly below book value.');
    risks.push('Priority Risk: Senior creditors or legal fees may have first claim on assets, reducing net recovery.');
    if (coverage < 40) risks.push('Unsecured Exposure: Recovery is highly correlated with general economic conditions (Cycle Risk).');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      recommendation: getRecommendation(calc.lgdPercent),
      insights: getInsights(calc.lgdPercent, calc.collateralCoverage, calc.methodUsed),
      risks: getRisks(calc.collateralCoverage)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            LGD Parameters
          </CardTitle>
          <CardDescription>
            Estimate recovery based on collateral and cash flows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Common Inputs */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="exposureAtDefault"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Exposure at Default (EAD)
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
                  <FormField
                    control={form.control}
                    name="collateralValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Collateral Value
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="1000"
                            placeholder="e.g., 400000"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="calculationMethod"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Estimation Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="simple">Market Implied (Trading Price)</SelectItem>
                          <SelectItem value="workout">Workout LGD (Discounted Cash Flow)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {method === 'simple' ? (
                  <FormField
                    control={form.control}
                    name="marketPricePostDefault"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Market Price of Debt (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="e.g., 40.0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-muted-foreground">Price of unsecured portion per $100 par</p>
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="cashRecoveryAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Est. Cash Recovery</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 100000"
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
                      name="administrativeCosts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Legal & Admin Costs</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 50000"
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
                      name="timeToRecovery"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years to Recover</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.5"
                              placeholder="e.g., 1.5"
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
                      name="discountRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Rate (EIR %)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="e.g., 8.0"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate LGD
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
                <ArrowDownRight className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Recovery Analysis</CardTitle>
                  <CardDescription>Estimated Financial Outcomes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Loss Given Default (LGD)</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold">{result.lgdPercent.toFixed(1)}%</span>
                </div>
                <Badge variant={result.lgdPercent < 40 ? 'secondary' : 'destructive'} className="mt-3 text-lg px-4 py-1">
                  Severity: {result.lgdPercent < 40 ? 'Low' : result.lgdPercent < 70 ? 'High' : 'Critical'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Coins className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Net Recovery</p>
                  <p className="text-lg font-bold">{result.netRecoveryAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                  <p className="text-xs text-muted-foreground">Rate: {result.recoveryPercent.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-red-600" />
                  <p className="font-semibold">Net Loss</p>
                  <p className="text-lg font-bold">{result.netLossAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Collateral Coverage</p>
                  <p className="text-lg font-bold">{result.collateralCoverage.toFixed(1)}%</p>
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
                  Strategic Insights
                </CardTitle>
                <CardDescription>Drivers of Recovery</CardDescription>
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
                  Recovery Risks
                </CardTitle>
                <CardDescription>Potential Pitfalls</CardDescription>
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
            Formula: Workout LGD
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Recovery = (Cash + Collateral Proceeds - Costs) / (1 + r)^t
            </p>
            <p className="font-mono text-sm text-center mt-2">
              LGD % = (1 - (Recovery / EAD)) × 100
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Workout LGD</strong> accounts for the time value of money, as recoveries often take years to materialize. Administrative and legal costs are deducted directly from the gross recovery amount.
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
            Risk management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/credit-risk-expected-loss-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Expected Loss</p>
                      <p className="text-sm text-muted-foreground">Full credit cost model</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/probability-of-default-pd-estimator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">PD Estimator</p>
                      <p className="text-sm text-muted-foreground">Default probability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/exposure-at-default-ead-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">EAD Calculator</p>
                      <p className="text-sm text-muted-foreground">Exposure estimation</p>
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
        <meta itemProp="headline" content="Calculating Loss Given Default (LGD): A Practical Guide" />
        <meta itemProp="description" content="Master LGD calculation for credit risk. Learn the differences between Market LGD and Workout LGD, and how collateral and seniority impact recovery rates." />
        <meta itemProp="keywords" content="LGD calculator, loss given default formula, recovery rate, workout LGD, downturn LGD, credit risk modeling, Basel LGD" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-08-31" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Loss Given Default (LGD)</h1>
        <p className="text-lg italic text-muted-foreground">Loss Given Default (LGD) quantifies the severity of a credit loss. It is the flip side of the Recovery Rate—money that is permanently lost when a borrower defaults.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#basics" className="hover:underline">LGD vs. Recovery Rate</a></li>
          <li><a href="#methods" className="hover:underline">Calculation Methods: Market vs. Workout</a></li>
          <li><a href="#factors" className="hover:underline">Key Drivers of LGD</a></li>
          <li><a href="#downturn" className="hover:underline">The concept of "Downturn LGD"</a></li>
        </ul>
        <hr />

        <h2 id="basics" className="text-2xl font-bold text-foreground pt-8">LGD vs. Recovery Rate</h2>
        <p>
          The relationship is simple logic: <strong>LGD = 1 - Recovery Rate</strong>.
        </p>
        <p className="mt-2">
          If a bank recovers 60 cents on the dollar, the Recovery Rate is 60%, and the LGD is 40%. This recovered amount typically comes from:
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li>Liquidation of collateral (homes, equipment, inventory).</li>
          <li>Restructuring settlements (equity swaps).</li>
          <li>Guarantee payouts.</li>
        </ul>

        <h2 id="methods" className="text-2xl font-bold text-foreground pt-8">Calculation Methods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Market LGD</h4>
            <p className="text-sm">Based on the trading price of defaulted bonds. It reflects the market's immediate expectation of recovery.</p>
            <p className="text-xs text-muted-foreground mt-2">Formula: LGD = 1 - (Market Price / Par)</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Workout LGD</h4>
            <p className="text-sm">Based on actual cash flows received during the collection process, discounted back to the date of default.</p>
            <p className="text-xs text-muted-foreground mt-2">Formula: Uses Discounted Cash Flow (DCF)</p>
          </div>
        </div>

        <h2 id="factors" className="text-2xl font-bold text-foreground pt-8">Key Drivers of LGD</h2>
        <ol className="list-decimal ml-6 space-y-2 mt-4">
          <li><strong>Seniority:</strong> Senior debt gets paid first. Junior/Subordinated debt typically has much higher LGD.</li>
          <li><strong>Collateral Quality:</strong> Cash and government bonds are liquid (Low LGD). Real estate and inventory are illiquid and volatile (Higher LGD).</li>
          <li><strong>Legal Jurisdiction:</strong> Bankruptcy laws in creditor-friendly countries (e.g., UK, USA) often result in lower LGDs than in debtor-friendly jurisdictions.</li>
        </ol>

        <h2 id="downturn" className="text-2xl font-bold text-foreground pt-8">The Concept of "Downturn LGD"</h2>
        <p>
          Recoveries are correlated with the economic cycle. In a recession, collateral values drop exactly when defaults rise.
        </p>
        <p className="mt-2">
          Basel III requires banks to use <strong>Downturn LGD</strong>—estimates based on recessionary periods—when calculating regulatory capital, rather than long-run averages. This is usually much higher (e.g., Average LGD 30% vs Downturn LGD 50%).
        </p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about LGD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Why are admin costs deducted?</h4>
              <p className="text-muted-foreground">
                The "Net Recovery" is what matters to the lender. Legal fees, auctioneer fees, and maintenance costs for seized assets eat into the gross proceeds significantly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What discount rate should I use?</h4>
              <p className="text-muted-foreground">
                Typically, the loan's original Effective Interest Rate (EIR) is used. Some practitioners use a risk-adjusted rate reflecting the uncertainty of the recovery flows.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can LGD be zero?</h4>
              <p className="text-muted-foreground">
                Yes, if the loan is fully cash-secured or guaranteed by a sovereign entity, LGD can differ to 0%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can LGD be more than 100%?</h4>
              <p className="text-muted-foreground">
                Technically yes, if legal costs exceed the recovery amount, the bank loses <em>more</em> than the principal. However, models usually cap LGD at 100%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does industry affect LGD?</h4>
              <p className="text-muted-foreground">
                Industries with tangible assets (Utilities, Real Estate) have lower LGDs. Service or Tech industries with intangible assets often have high LGDs (70-90%).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Cure Rate"?</h4>
              <p className="text-muted-foreground">
                Some defaulted loans "cure" (return to performing status) with zero loss. The LGD for a portfolio is the weighted average of Cured Loans (0% LGD) and Liquidated Loans (High LGD).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is LGD constant over time?</h4>
              <p className="text-muted-foreground">
                No. As a loan amortizes, LGD might change if collateral value moves differently than the loan balance (e.g. negative equity mortgages).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do CDS auctions determine LGD?</h4>
              <p className="text-muted-foreground">
                After a default, a formalized auction sets the price for the defaulted bonds. This price determines the payout on Credit Default Swaps and serves as a benchmark for Market LGD.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Basel floor for LGD?</h4>
              <p className="text-muted-foreground">
                For corporate unsecured exposures under Foundation IRB, Basel prescribes a fixed LGD of 45%.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does calculating LGD help in pricing?</h4>
              <p className="text-muted-foreground">
                Absolutely. The interest rate spread must cover Expected Loss (PD × LGD). If LGD is high, the bank must charge a higher spread.
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
          <p>The Loss Given Default (LGD) Calculator models the severity of potential credit losses.</p>
          <p>It supports both Market Implied (Trading Price) and Workout (Discounted Cash Flow) methodologies.</p>
          <p>Use this tool to inform loan pricing, provisioning, and capital allocation decisions.</p>
        </CardContent>
      </Card>
    </div>
  );
}
