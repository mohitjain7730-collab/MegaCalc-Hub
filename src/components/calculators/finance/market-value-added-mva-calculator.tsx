'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Info, Landmark, Calculator, LineChart, FunctionSquare, CheckCircle2, ArrowUpRight, PieChart, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  sharePrice: z.number().positive('Share Price must be positive'),
  sharesOutstanding: z.number().positive(),
  marketValueOfDebt: z.number().min(0).optional(),

  bookValueOfEquity: z.number().positive(),
  bookValueOfDebt: z.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function MarketValueAddedMVACalculator() {
  const [result, setResult] = useState<{
    mva: number;
    totalMarketValue: number;
    totalCapitalInvested: number;
    marketToBookRatio: number;
    wealthStatus: string;
    recommendation: string;
    insights: string[];
    drivers: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sharePrice: undefined,
      sharesOutstanding: undefined,
      marketValueOfDebt: 0,
      bookValueOfEquity: undefined,
      bookValueOfDebt: 0,
    },
  });

  const calculate = (v: FormValues) => {
    // 1. Calculate Market Value (V)
    // V = (Shares * Price) + Debt_Market
    const marketEquity = v.sharePrice * v.sharesOutstanding;
    const marketDebt = v.marketValueOfDebt || 0;
    const totalMarketVal = marketEquity + marketDebt;

    // 2. Calculate Capital Invested (K)
    // K = Book Equity + Book Debt
    // Note: If market value of debt is not provided, we often assume Market Debt approx equals Book Debt for healthy firms.
    // Here we use inputs explicitly.
    const bookEquity = v.bookValueOfEquity;
    const bookDebt = v.bookValueOfDebt || 0;
    const totalCapital = bookEquity + bookDebt;

    // 3. MVA = V - K
    const mva = totalMarketVal - totalCapital;

    // 4. Ratios
    const mtb = totalCapital > 0 ? totalMarketVal / totalCapital : 0;

    return {
      mva,
      totalMarketValue: totalMarketVal,
      totalCapitalInvested: totalCapital,
      marketToBookRatio: mtb,
    };
  };

  const getRecommendation = (mva: number, mtb: number) => {
    if (mtb > 1.0) return 'Wealth Creation: The market values the firm higher than the capital invested. Investors expect future returns to exceed the cost of capital.';
    if (mtb < 1.0) return 'Wealth Destruction: The market values the firm for less than the capital put in. Investors expect poor future performance or are discounting asset risks.';
    return 'Neutral Performance: The firm is worth exactly what was put in. It is earning its cost of capital but no economic profit.';
  };

  const getInsights = (mva: number, marketEquity: number, bookEquity: number) => {
    const insights = [];
    if (mva > 0) insights.push(`Premium Value: Investors are paying a $${mva.toLocaleString()} premium for the company's future growth and intangible assets.`);
    else insights.push(`Discount Valuation: The company is trading at a $${Math.abs(mva).toLocaleString()} discount to its book value.`);

    // Equity Only View
    const equityMVA = marketEquity - bookEquity;
    insights.push(`Equity Value Added: Shareholders specifically have gained $${equityMVA.toLocaleString()} over book value.`);

    return insights;
  };

  const getDrivers = (mtb: number) => {
    const drivers = [];
    drivers.push('Intangibles: Brand value, patents, and customer loyalty are captured in MVA but often missing from Book Value.');
    drivers.push('Growth Expectations: High MVA reflects investor confidence in future EVA (Economic Value Added).');
    if (mtb < 1) drivers.push('Structural Issues: MVA < 0 suggests assets might be better off liquidated than operated.');
    return drivers;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    const marketEquity = values.sharePrice * values.sharesOutstanding;

    setResult({
      ...calc,
      wealthStatus: calc.mva >= 0 ? 'Positive MVA' : 'Negative MVA',
      recommendation: getRecommendation(calc.mva, calc.marketToBookRatio),
      insights: getInsights(calc.mva, marketEquity, values.bookValueOfEquity),
      drivers: getDrivers(calc.marketToBookRatio)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="h-5 w-5" />
            Market Data & Capital
          </CardTitle>
          <CardDescription>
            Compare market valuation to invested capital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="md:col-span-2">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                    <TrendingUp className="h-4 w-4" /> Market Values
                  </h4>
                </div>

                <FormField
                  control={form.control}
                  name="sharePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Share Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 50.25"
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
                  name="sharesOutstanding"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shares Outstanding</FormLabel>
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
                  name="marketValueOfDebt"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Market Value of Debt (Total)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="Leave 0 if same as Book Value"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2 mt-2">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                    <Landmark className="h-4 w-4" /> Book Values (Invested Capital)
                  </h4>
                </div>

                <FormField
                  control={form.control}
                  name="bookValueOfEquity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book Value of Equity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="Common Stock + Retained Earnings"
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
                  name="bookValueOfDebt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Book Value of Debt</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="Long & Short Term Debt"
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
                Calculate MVA
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
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Wealth Creation</CardTitle>
                  <CardDescription>MVA Assessment</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Market Value Added</p>
                <p className={`text-4xl font-bold ${result.mva >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {result.mva.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <Badge variant={result.mva >= 0 ? 'default' : 'destructive'} className="mt-3 text-lg px-4 py-1">
                  {result.wealthStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <ArrowUpRight className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Total Market Value</p>
                  <p className="text-lg font-bold">{result.totalMarketValue.toLocaleString('en-US', { notation: 'compact', style: 'currency', currency: 'USD' })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Landmark className="h-6 w-6 mx-auto mb-2 text-stone-600" />
                  <p className="font-semibold">Invested Capital</p>
                  <p className="text-lg font-bold">{result.totalCapitalInvested.toLocaleString('en-US', { notation: 'compact', style: 'currency', currency: 'USD' })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Market / Book</p>
                  <p className={`text-lg font-bold ${result.marketToBookRatio >= 1 ? 'text-green-600' : 'text-red-600'}`}>{result.marketToBookRatio.toFixed(2)}x</p>
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
                <CardDescription>Interpretation</CardDescription>
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
                  MVA Drivers
                </CardTitle>
                <CardDescription>What moves MVA?</CardDescription>
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
            Formula: MVA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              MVA = Market Value of Firm - Capital Invested
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Market Value = (Share Price × Shares) + Market Debt
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Capital Invested = Book Equity + Book Debt
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>MVA</strong> represents the difference between what investors have put into the company and what they can take out today. It is essentially the cumulative sum of all past and expected future Economic Value calculations.
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
            <Link href="/category/finance/economic-value-added-eva-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">EVA Calculator</p>
                      <p className="text-sm text-muted-foreground">Economic Profit</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/return-on-equity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">ROE Calculator</p>
                      <p className="text-sm text-muted-foreground">Shareholder returns</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/enterprise-value-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Landmark className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Enterprise Value</p>
                      <p className="text-sm text-muted-foreground">Total Firm Value</p>
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
        <meta itemProp="headline" content="Market Value Added (MVA): Measuring Wealth Creation" />
        <meta itemProp="description" content="A comprehensive guide to Market Value Added (MVA). Learn how MVA measures the difference between market value and book value, and why it matters for shareholders." />
        <meta itemProp="keywords" content="MVA calculator, market value added, market to book ratio replacement, shareholder wealth, valuation metrics, eva vs mva" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-08-31" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to Market Value Added (MVA)</h1>
        <p className="text-lg italic text-muted-foreground">If EVA is the internal measure of performance, MVA is the external scorecard. It tells you exactly how much wealth management has created—or destroyed—since the company was founded.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is MVA?</a></li>
          <li><a href="#formula" className="hover:underline">The Formula Breakdown</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting the Results</a></li>
          <li><a href="#relationship" className="hover:underline">MVA vs. EVA Difference</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is MVA?</h2>
        <p>
          <strong>Market Value Added (MVA)</strong> is simply the difference between what a company is worth today (Market Value) and the actual capital investors put into it (Book Value).
        </p>
        <p className="mt-2">
          Imagine you give a money manager $100. Five years later:
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-2">
          <li>If the account is worth $150, the MVA is +$50 (Wealth Created).</li>
          <li>If the account is worth $80, the MVA is -$20 (Wealth Destroyed).</li>
        </ul>

        <h2 id="formula" className="text-2xl font-bold text-foreground pt-8">The Formula Breakdown</h2>
        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-primary font-bold">MVA = V - K</p>
          <p className="text-sm mt-2">Where <strong>V</strong> = Market Value of Equity + Debt, <br />and <strong>K</strong> = Book Value of Equity + Debt (Capital Invested).</p>
        </div>
        <p>
          Typically, the Market Value of Debt is assumed to be equal to its Book Value (unless the company is in distress). Therefore, MVA is often simplified to:
          <br /><strong>MVA ≈ Market Cap - Shareholder Equity</strong>.
        </p>

        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8">Interpreting the Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Positive MVA</h4>
            <p className="text-sm">The market expects the company to generate returns greater than its cost of capital in the future. It has valuable intangibles (Brand, R&D).</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Negative MVA</h4>
            <p className="text-sm">The market believes the company's assets are worth less than their cost. Restructuring or liquidation might be necessary.</p>
          </div>
        </div>

        <h2 id="relationship" className="text-2xl font-bold text-foreground pt-8">MVA vs. EVA Difference</h2>
        <p>
          Economic Value Added (EVA) measures performance over a single year. <br />
          Market Value Added (MVA) represents the present value of <strong>all expected future EVAs</strong>.
        </p>
        <p className="mt-2">
          If a company has negative EVA today but a positive MVA, it means investors believe the negative performance is temporary (e.g., a startup investing heavily for future growth).
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
            Common questions about MVA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Is high MVA always good?</h4>
              <p className="text-muted-foreground">
                Generally yes, but extremely high MVA (bubbles) can signal overvaluation. If investors expect impossible growth, the MVA gap will eventually close when reality hits.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does MVA account for dividends?</h4>
              <p className="text-muted-foreground">
                MVA is a snapshot of current value. Dividends paid out reduce the Book Value (Retained Earnings) and usually reduce Market Cap, but the ratio/MVA remains a measure of remaining capital efficiency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can I calculate MVA for private companies?</h4>
              <p className="text-muted-foreground">
                No, because there is no daily share price. You would need to use a valuation model (DCF) to estimate "Market Value" first.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does inflation affect MVA?</h4>
              <p className="text-muted-foreground">
                Book value is historical and not adjusted for inflation. In high inflation periods, MVA may appear artificially high because assets are recorded at old, low costs while market price reflects current dollars.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Market-to-Book" ratio?</h4>
              <p className="text-muted-foreground">
                It is essentially the relative version of MVA. MVA is dollar terms; Market-to-Book is a ratio. Ratio = 2.0 implies MVA is equal to Invested Capital.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why ignore cash in MVA?</h4>
              <p className="text-muted-foreground">
                Some analysts calculate "Enterprise MVA" by netting out excess cash, as cash inherently has 0 MVA (Market Value of Cash = Book Value of Cash).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does MVA apply to banks?</h4>
              <p className="text-muted-foreground">
                Yes, it is very common for banks. Banks trading below book value (MVA &lt; 0) are often seen as having poor loan quality or low ROE.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Who are top MVA performers?</h4>
              <p className="text-muted-foreground">
                Tech giants (Apple, Microsoft) typically have the highest MVA because their primary assets (software, brand) are not on the balance sheet (Low K, High V).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does buyback affect MVA?</h4>
              <p className="text-muted-foreground">
                Share buybacks reduce both Book Capital and Market Cap. If shares are bought below intrinsic value, it increases MVA for remaining shareholders.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is MVA the same as Goodwill?</h4>
              <p className="text-muted-foreground">
                No. Goodwill is an accounting entry when one firm buys another. MVA is the market's real-time assessment of "Goodwill" for the entire firm, internally generated or acquired.
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
          <p>The MVA Calculator quantifies the accumulated wealth generated for investors.</p>
          <p>It compares the market's assessment of future cash flows against the capital committed.</p>
          <p>Use it to judge long-term management performance and corporate strategy success.</p>
        </CardContent>
      </Card>
    </div>
  );
}
