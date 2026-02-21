'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Info, Landmark, Calculator, DollarSign, PieChart, FunctionSquare, CheckCircle2, TrendingDown, ArrowUpRight, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  inputType: z.enum(['nopat', 'ebit']),
  operatingProfit: z.number().optional(), // Used for either NOPAT or EBIT
  taxRate: z.number().min(0).max(100).optional(),
  investedCapital: z.number().positive('Invested Capital must be positive'),
  wacc: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function EconomicValueAddedEVACalculator() {
  const [result, setResult] = useState<{
    eva: number;
    nopat: number;
    capitalCharge: number;
    roic: number;
    spread: number;
    valueStatus: string;
    recommendation: string;
    insights: string[];
    drivers: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputType: 'ebit',
      operatingProfit: undefined,
      taxRate: 21, // default corporate tax
      investedCapital: undefined,
      wacc: 10,
    },
  });

  const method = form.watch('inputType');

  const calculate = (v: FormValues) => {
    const capital = v.investedCapital;
    const waccDecimal = v.wacc / 100;

    // 1. Calculate NOPAT
    let nopat = 0;
    if (v.inputType === 'ebit') {
      const taxDecimal = (v.taxRate || 0) / 100;
      nopat = (v.operatingProfit || 0) * (1 - taxDecimal);
    } else {
      nopat = v.operatingProfit || 0;
    }

    // 2. Calculate Capital Charge
    const capitalCharge = capital * waccDecimal;

    // 3. Calculate EVA
    const eva = nopat - capitalCharge;

    // 4. Metrics
    const roic = (nopat / capital) * 100; // Return on Invested Capital
    const spread = roic - v.wacc; // Economic Spread

    return {
      eva,
      nopat,
      capitalCharge,
      roic,
      spread,
    };
  };

  const getRecommendation = (eva: number, spread: number) => {
    if (eva > 0) return 'Value Creation: The company is generating returns above its cost of capital. Focus on growth opportunities that maintain this spread.';
    if (spread > -2 && spread <= 0) return 'Marginal Performance: Returns are close to the cost of capital. Operational improvements are needed to turn EVA positive.';
    return 'Value Destruction: The company is consuming capital value. Immediate restructuring or divestiture of underperforming assets is required.';
  };

  const getInsights = (eva: number, spread: number, capital: number) => {
    const insights = [];
    if (eva > 0) insights.push(`Shareholder Wealth: The firm added $${eva.toLocaleString()} to shareholder value in this period.`);
    else insights.push(`Capital Erosion: Shareholders would have been better off investing elsewhere, as the firm lost $${Math.abs(eva).toLocaleString()} in economic value.`);

    const efficiencyMsg = spread > 0
      ? `Efficiency: Every $1 of capital invested generates ${(spread).toFixed(2)} cents of pure economic profit.`
      : `Inefficiency: Every $1 invested destroys ${Math.abs(spread).toFixed(2)} cents of value.`;
    insights.push(efficiencyMsg);

    return insights;
  };

  const getDrivers = (nopat: number, capital: number, wacc: number) => {
    const drivers = [];
    drivers.push(`Operating Efficiency: Increase NOPAT (Current: $${nopat.toLocaleString()}) through margin expansion.`);
    drivers.push(`Asset Velocity: Reduce Invested Capital ($${capital.toLocaleString()}) by optimizing working capital or selling idle assets.`);
    drivers.push(`Financial Structure: Optimize WACC (${wacc}%) by adjusting the debt-equity mix.`);
    return drivers;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      valueStatus: calc.eva >= 0 ? 'Value Created' : 'Value Destroyed',
      recommendation: getRecommendation(calc.eva, calc.spread),
      insights: getInsights(calc.eva, calc.spread, values.investedCapital),
      drivers: getDrivers(calc.nopat, values.investedCapital, values.wacc)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Input operating data and capital structure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <FormField
                  control={form.control}
                  name="inputType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profit Metric</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Input" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ebit">EBIT (Pre-Tax)</SelectItem>
                          <SelectItem value="nopat">NOPAT (Post-Tax)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operatingProfit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {method === 'ebit' ? 'EBIT' : 'NOPAT'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 500000"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {method === 'ebit' && (
                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Tax Rate (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="e.g., 21.0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="investedCapital"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Total Invested Capital
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 2000000"
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
                  name="wacc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        WACC (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="e.g., 10.0"
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
                Calculate EVA
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
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Economic Profitability</CardTitle>
                  <CardDescription>EVA Assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Economic Value Added</p>
                <p className={`text-4xl font-bold ${result.eva >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.eva.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <Badge variant={result.eva >= 0 ? 'default' : 'destructive'} className="mt-3 text-lg px-4 py-1">
                  {result.valueStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <ArrowUpRight className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">ROIC</p>
                  <p className="text-lg font-bold">{result.roic.toFixed(2)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingDown className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">WACC</p>
                  <p className="text-lg font-bold">{form.getValues('wacc')}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Economic Spread</p>
                  <p className={`text-lg font-bold ${result.spread >= 0 ? 'text-green-600' : 'text-red-600'}`}>{result.spread.toFixed(2)}%</p>
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
                <CardDescription>Value Implications</CardDescription>
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

            <Card className="h-full border-blue-100 bg-blue-50/10 dark:border-blue-900/20 dark:bg-blue-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-blue-600 dark:text-blue-400">
                  <FunctionSquare className="h-6 w-6" />
                  EVA Drivers
                </CardTitle>
                <CardDescription>How to Improve</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.drivers.map((driver, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-300">{driver}</span>
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
            Formula: Economic Value Added
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              EVA = NOPAT - (Invested Capital × WACC)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              NOPAT = EBIT × (1 - Tax Rate)
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>EVA</strong> measures a firm's financial performance based on the residual wealth calculated by deducting its cost of capital from its operating profit, adjusted for taxes on a cash basis.
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
            Performance and Valuation Tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/wacc-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">WACC Calculator</p>
                      <p className="text-sm text-muted-foreground">Cost of Capital</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/return-on-investment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">ROI Calculator</p>
                      <p className="text-sm text-muted-foreground">Basic Return Metric</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/market-value-added-mva-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Market Value Added</p>
                      <p className="text-sm text-muted-foreground">Market-based Value</p>
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
        <meta itemProp="headline" content="Economic Value Added (EVA): The Ultimate Performance Metric" />
        <meta itemProp="description" content="A comprehensive guide to Economic Value Added (EVA). Understand how to calculate EVA, interpret NOPAT and Capital Charges, and use it to drive shareholder value." />
        <meta itemProp="keywords" content="EVA calculator, economic profit, NOPAT wacc formula, return on invested capital ROIC, shareholder value analysis, stern stewart eva" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-08-31" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Economic Value Added (EVA)</h1>
        <p className="text-lg italic text-muted-foreground">EVA is more than just a number; it is a corporate mindset. It asks the tough question: "Did we generate enough profit to cover the cost of the money we used?"</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#whatis" className="hover:underline">EVA vs. Net Income</a></li>
          <li><a href="#components" className="hover:underline">The Three Pillars: NOPAT, Capital, WACC</a></li>
          <li><a href="#strategies" className="hover:underline">Strategies to Increase EVA</a></li>
          <li><a href="#accounting" className="hover:underline">Common Accounting Adjustments</a></li>
        </ul>
        <hr />

        <h2 id="whatis" className="text-2xl font-bold text-foreground pt-8">EVA vs. Net Income</h2>
        <p>
          Traditional Accounting Profit (Net Income) ignores the cost of Equity Capital. It assumes shareholder money is "free".
        </p>
        <p className="mt-2">
          <strong>EVA</strong> corrects this. It recognizes that shareholders could have invested their money elsewhere (Opportunity Cost). Therefore, a company only creates value if it covers both its Debt Cost (Interest) AND its Equity Cost.
        </p>

        <h2 id="components" className="text-2xl font-bold text-foreground pt-8">The Three Pillars</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">NOPAT</h4>
            <p className="text-sm">The cash earning generated by operations, independent of capital structure. (EBIT - Taxes).</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Capital</h4>
            <p className="text-sm">The total amount of cash invested in the business (Equity + Debt + Capitalized Leases, etc.).</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">WACC</h4>
            <p className="text-sm">The weighted average rate of return demanded by all capital providers (Lenders & Shareholders).</p>
          </div>
        </div>

        <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8">Strategies to Increase EVA</h2>
        <ol className="list-decimal ml-6 space-y-2 mt-4">
          <li><strong>Operational Efficiency:</strong> Increase NOPAT without using more capital (e.g., raise prices, cut costs).</li>
          <li><strong>Asset Efficiency:</strong> Generate the same NOPAT with less capital (e.g., reduce inventory days, sell unused factories).</li>
          <li><strong>Profitable Growth:</strong> Invest new capital only in projects where ROIC &gt; WACC.</li>
          <li><strong>Liquidate Value Destroyers:</strong> Divest units where ROIC &lt; WACC.</li>
        </ol>

        <h2 id="accounting" className="text-2xl font-bold text-foreground pt-8">Common Accounting Adjustments</h2>
        <p>
          To get "True Economic Profit", analysts often make 100+ adjustments to GAAP accounting. Common ones include:
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li><strong>R&D:</strong> Capitalize R&D as an asset (invested capital) rather than expensing it, as it builds future value.</li>
          <li><strong>Advertising:</strong> Treat brand building as an investment, not an expense.</li>
          <li><strong>Operating Leases:</strong> Convert off-balance sheet leases to debt (Capital) and depreciation (Expense).</li>
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
            Common questions about EVA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Does calculating EVA improve stock price?</h4>
              <p className="text-muted-foreground">
                There is a high correlation. Companies that consistently grow EVA tend to see their stock price outperform, as MVA (Market Value Added) is essentially the present value of future EVA.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why use NOPAT instead of Net Income?</h4>
              <p className="text-muted-foreground">
                Net Income includes interest expense. Since we deduct the cost of capital (which includes debt cost) separately in the EVA formula, using Net Income would double-count the debt cost.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can a profitable company have negative EVA?</h4>
              <p className="text-muted-foreground">
                Yes! This is very common for "Empire Builders"—large companies with huge asset bases. They make millions in accounting profit, but their return on the billions of capital invested is pitiful (below WACC).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is EVA suitable for startups?</h4>
              <p className="text-muted-foreground">
                Generally no. Startups usually have negative NOPAT and rely on future growth value. EVA is best for mature companies with established operations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is "EVA Momentum"?</h4>
              <p className="text-muted-foreground">
                It measures the change in EVA divided by sales. It tells you if the company is getting better at creating value, regardless of its size.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does EVA differ from ROI?</h4>
              <p className="text-muted-foreground">
                ROI is a percentage (Ratio), while EVA is a dollar amount. EVA encourages managers to take all positive value projects, whereas ROI might discourage a project that lowers the average ROI even if it adds value.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Capital Charge"?</h4>
              <p className="text-muted-foreground">
                It is the "rent" a company pays for using investor funds. Formula: Invested Capital × WACC.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I lower WACC to boost EVA?</h4>
              <p className="text-muted-foreground">
                Yes, optimizing the capital structure (debt vs equity) to find the lowest WACC will instantly increase EVA, assuming operations remain stable.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Who invented EVA?</h4>
              <p className="text-muted-foreground">
                The concept has roots in economic profit (Alfred Marshall, 1890s), but it was popularized and trademarked as EVA by Stern Stewart & Co. in the 1980s.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How often does WACC change?</h4>
              <p className="text-muted-foreground">
                WACC changes with interest rates (Cost of Debt) and market risk premiums (Cost of Equity). It should be reviewed annually.
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
          <p>The EVA Calculator reveals the true economic profit of a business.</p>
          <p>It helps distinguish between accounting profitability and actual value creation for shareholders.</p>
          <p>Use it to align management incentives and evaluate capital allocation efficiency.</p>
        </CardContent>
      </Card>
    </div>
  );
}
