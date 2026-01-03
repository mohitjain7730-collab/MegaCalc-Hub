'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, AlertCircle, Info, Calculator, DollarSign, CheckCircle2, Percent, FunctionSquare, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  calculationMode: z.enum(['amount', 'rate']),
  // Amount Mode
  dividendAmount: z.number().min(0).optional(),
  // Rate Mode
  parValue: z.number().min(0).optional(),
  dividendRatePercent: z.number().min(0).max(100).optional(),

  marketPrice: z.number().positive('Price must be positive'),
  flotationCostPercent: z.number().min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CostOfPreferredStockCalculator() {
  const [result, setResult] = useState<{
    costOfPreferred: number;
    effectiveCost: number;
    annualDividend: number;
    netProceeds: number;
    flotationAdjustment: number;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      calculationMode: 'amount',
      dividendAmount: undefined,
      parValue: 100,
      dividendRatePercent: undefined,
      marketPrice: undefined,
      flotationCostPercent: 0,
    },
  });

  const mode = form.watch('calculationMode');

  const calculate = (v: FormValues) => {
    // 1. Determine Dividend Amount (D_p)
    let dividend = 0;
    if (v.calculationMode === 'amount') {
      dividend = v.dividendAmount || 0;
    } else {
      dividend = (v.parValue || 0) * ((v.dividendRatePercent || 0) / 100);
    }

    // 2. Net Proceeds
    const price = v.marketPrice;
    const flotationPct = (v.flotationCostPercent || 0) / 100;
    const netProceeds = price * (1 - flotationPct);

    // 3. Cost Calculation (r_p = D_p / Net Proceeds)
    const cost = (dividend / price) * 100; // Nominal Yield
    const effectiveCost = (dividend / netProceeds) * 100; // WACC Input

    return {
      costOfPreferred: cost,
      effectiveCost,
      annualDividend: dividend,
      netProceeds,
      flotationAdjustment: effectiveCost - cost,
    };
  };

  const getRecommendation = (cost: number) => {
    if (cost > 10) return 'High Cost of Capital. Preferred stock is expensive relative to typical debt. Ensure the project returns justify this high hurdle rate.';
    if (cost < 4) return 'Low Cost Capital. This preferred stock is trading at a premium (low yield). It is an attractive source of funding.';
    return 'Moderate Cost. The cost aligns with typical hybrid capital ranges. Suitable for balancing leverage ratios without increasing bankruptcy risk.';
  };

  const getInsights = (effCost: number, floatAdj: number, dividend: number) => {
    const insights = [];
    insights.push(`WACC Input: Use ${effCost.toFixed(2)}% as the component cost for preferred stock in your WACC calculation.`);
    if (floatAdj > 0) insights.push(`Flotation Impact: Issuance costs added ${floatAdj.toFixed(2)}% to the effective cost of capital.`);
    insights.push(`Cash Flow: The company commits to paying $${dividend.toFixed(2)} per share annually in perpetuity.`);
    return insights;
  };

  const getRisks = () => {
    const risks = [];
    risks.push('Tax Disadvantage: Unlike debt interest, preferred dividends are generally NOT tax-deductible.');
    risks.push('Financial Flexibility: Omitting preferred dividends usually blocks common dividends (Cumulative Feature).');
    risks.push('Interest Rate Sensitivity: As a perpetuity, preferred stock prices are highly sensitive to rising market rates.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      recommendation: getRecommendation(calc.effectiveCost),
      insights: getInsights(calc.effectiveCost, calc.flotationAdjustment, calc.annualDividend),
      risks: getRisks()
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Stock Parameters
          </CardTitle>
          <CardDescription>
            Input dividend and market pricing details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <FormField
                  control={form.control}
                  name="calculationMode"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Dividend Input Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="amount">Dollar Amount (e.g., $5.00)</SelectItem>
                          <SelectItem value="rate">Percentage of Par (e.g., 5% of $100)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {mode === 'amount' ? (
                  <FormField
                    control={form.control}
                    name="dividendAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Annual Dividend
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 5.00"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <>
                    <FormField
                      control={form.control}
                      name="parValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Par Value</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              placeholder="e.g., 100"
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
                      name="dividendRatePercent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dividend Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="e.g., 6.0"
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

                <FormField
                  control={form.control}
                  name="marketPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Current Market Price (P0)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 102.50"
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
                  name="flotationCostPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FunctionSquare className="h-4 w-4" />
                        Flotation Costs (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 2.5"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Cost
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
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Cost Analysis</CardTitle>
                  <CardDescription>Required Return (Rp)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Effective Cost of Preferred Stock</p>
                <p className="text-4xl font-bold text-primary">
                  {result.effectiveCost.toFixed(2)}%
                </p>
                <Badge variant="outline" className="mt-3 text-lg px-4 py-1">
                  Nominal Yield: {result.costOfPreferred.toFixed(2)}%
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Annual Dividend</p>
                  <p className="text-lg font-bold">{result.annualDividend.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <ArrowUpRight className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Net Proceeds</p>
                  <p className="text-lg font-bold">{result.netProceeds.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Flotation Cost</p>
                  <p className="text-lg font-bold">{result.flotationAdjustment.toFixed(2)}%</p>
                  <p className="text-xs text-muted-foreground">Impact on Return</p>
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
                <CardDescription>Capital Structure Impact</CardDescription>
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
                  Risk Considerations
                </CardTitle>
                <CardDescription>Investor & Issuer View</CardDescription>
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
            Formula: Cost of Preferred Equity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              r_p = D_p / (P_0 × (1 - F))
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The cost of preferred stock (<strong>r_p</strong>) is calculated by dividing the annual dividend (<strong>D_p</strong>) by the net price received by the issuer. The net price is the current market price (<strong>P_0</strong>) minus flotation costs (<strong>F</strong>).
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
            Cost of Capital Tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/wacc-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">WACC Calculator</p>
                      <p className="text-sm text-muted-foreground">Total Cost of Capital</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/dividend-yield-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Dividend Yield</p>
                      <p className="text-sm text-muted-foreground">Investment Return</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/capm-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FunctionSquare className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">CAPM Calculator</p>
                      <p className="text-sm text-muted-foreground">Cost of Common Equity</p>
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
        <meta itemProp="headline" content="Calculating the Cost of Preferred Stock: A WACC Component" />
        <meta itemProp="description" content="Learn how to calculate the cost of preferred stock (Rp) for WACC. Understand dividends, perpetuity formulas, and the impact of flotation costs." />
        <meta itemProp="keywords" content="cost of preferred stock calculator, preferred equity formula, flotation costs, WACC calculation, preferred dividend yield, hybrid capital" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-08-31" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Cost of Preferred Stock</h1>
        <p className="text-lg italic text-muted-foreground">Preferred stock is a "hybrid" security. It holds a middle ground between the safety of bonds and the growth potential of common stock, and its cost calculation reflects this unique position.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#whatis" className="hover:underline">What is Preferred Stock?</a></li>
          <li><a href="#formula" className="hover:underline">The Perpetuity Formula</a></li>
          <li><a href="#flotation" className="hover:underline">Accounting for Flotation Costs</a></li>
          <li><a href="#tax" className="hover:underline">The Tax Disadvantage</a></li>
        </ul>
        <hr />

        <h2 id="whatis" className="text-2xl font-bold text-foreground pt-8">What is Preferred Stock?</h2>
        <p>
          Preferred stock is an equity ownership stake that pays a fixed dividend. It is "preferred" because these dividends must be paid out <strong>before</strong> any dividends can be paid to common shareholders.
        </p>
        <p className="mt-2">
          In the event of bankruptcy, preferred shareholders claim assets after bondholders but before common shareholders. This lower risk profile (relative to common stock) usually results in a lower cost of capital than common equity.
        </p>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">The Perpetuity Formula</h2>
        <p>
          Since preferred stock generally has no maturity date (it lasts forever), we value it using the <strong>Perpetuity Formula</strong>:
        </p>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">Price = Dividend / Rate</p>
          <p className="text-sm mt-2">Rearranging to find the Cost (Rate):</p>
          <p className="font-mono text-xl text-primary font-bold">Rate = Dividend / Price</p>
        </div>

        <h2 id="flotation" className="text-2xl font-bold text-foreground pt-8">Accounting for Flotation Costs</h2>
        <p>
          When a company issues new stock, it pays fees to investment bankers (underwriting fees, legal fees). These are called <strong>Flotation Costs</strong>.
        </p>
        <p className="mt-2">
          Because the company receives <em>less</em> money than the investor pays, the effective cost to the company is higher. We adjust the denominator to reflect the "Net Proceeds".
        </p>

        <h2 id="tax" className="text-2xl font-bold text-foreground pt-8">The Tax Disadvantage</h2>
        <p>
          Unlike interest payments on debt, <strong>preferred dividends are not tax-deductible</strong> for the issuing company.
        </p>
        <p className="mt-2">
          If a company pays 8% on debt, and has a 25% tax rate, the effective cost is 6%. <br />
          If a company pays 8% on preferred stock, the effective cost is a full 8%. <br />
          This is why companies often prefer issuing debt over preferred stock.
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
            Common questions about Preferred Stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is it called a "hybrid" security?</h4>
              <p className="text-muted-foreground">
                It behaves like a bond (fixed payments, sensitivity to interest rates) but is technically equity (no maturity, lower bankruptcy priority, dividends can be suspended without default).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does the cost change over time?</h4>
              <p className="text-muted-foreground">
                Yes. Since the dividend is fixed, the "Cost" (yield) fluctuates inversely with the market price. If interest rates rise, preferred prices fall, and the cost rises.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if the preferred stock is callable?</h4>
              <p className="text-muted-foreground">
                If the stock is likely to be called (redeemed) by the issuer, calculation similar to "Yield to Call" on a bond is more appropriate than the perpetuity formula.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is preferred stock cheaper than common stock?</h4>
              <p className="text-muted-foreground">
                Usually, yes. Preferred shareholders take less risk (guaranteed fixed dividend, liquidation priority) than common shareholders, so they accept a lower return.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Do flotation costs apply to retained earnings?</h4>
              <p className="text-muted-foreground">
                No. Flotation costs only apply when issuing <em>new</em> securities. They are irrelevant for calculating the cost of existing preferred stock in the market.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is Cumulative Preferred Stock?</h4>
              <p className="text-muted-foreground">
                If a company misses a dividend payment, it accumulates in "arrears" and must be paid in full before any dividends can be paid to common shareholders. This lowers the risk (and cost) slightly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does this fit into WACC?</h4>
              <p className="text-muted-foreground">
                WACC = (Weight_Equity × Cost_Equity) + (Weight_Debt × Cost_Debt × (1-t)) + (Weight_Preferred × Cost_Preferred). Note there is no (1-t) tax adjustment for preferred.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why would investors buy preferred stock?</h4>
              <p className="text-muted-foreground">
                It offers higher yields than bonds and more stability than common stock. Corporations also get a tax break (DRD) on dividends received from other companies.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can the cost be negative?</h4>
              <p className="text-muted-foreground">
                No. Dividends and prices are positive figures.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "Par Value"?</h4>
              <p className="text-muted-foreground">
                The face value (usually $25 or $100) on which the dividend percentage is calculated. Liquidation preference is also usually set at Par.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Footer */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Cost of Preferred Stock Calculator computes the required return for hybrid equity investors.</p>
          <p>It correctly handles the perpetuity nature of preferred dividends and the impact of issuance fees.</p>
          <p>Use this metric as a key input for accurate Weighted Average Cost of Capital (WACC) modeling.</p>
        </CardContent>
      </Card>
    </div>
  );
}
