'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Clock, FunctionSquare, CheckCircle2, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  marketCap: z.number().positive(),
  totalDebt: z.number().positive(),
  equityVolatility: z.number().min(0).max(500),
  riskFreeRate: z.number().min(-20).max(100),
  timeHorizon: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

// Math Helpers
function erf(x: number) {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

function standardNormalCDF(x: number) {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

export default function ProbabilityOfDefaultPDEstimator() {
  const [result, setResult] = useState<{
    pd: number;
    distanceToDefault: number;
    impliedRating: string;
    assetValue: number;
    assetVolatility: number;
    leverage: number;
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      marketCap: undefined,
      totalDebt: undefined,
      equityVolatility: undefined, // %
      riskFreeRate: 4.0, // Stable default
      timeHorizon: 1, // 1 year default
    },
  });

  // Map PD to approximate S&P Rating
  const getRating = (pd: number) => {
    if (pd <= 0.05) return 'AAA (Prime)';
    if (pd <= 0.10) return 'AA (High Grade)';
    if (pd <= 0.25) return 'A (Upper Medium)';
    if (pd <= 0.75) return 'BBB (Low Medium)';
    if (pd <= 2.5) return 'BB (Speculative)';
    if (pd <= 7.5) return 'B (Highly Speculative)';
    if (pd <= 20.0) return 'CCC (Substantial Risk)';
    return 'D (Default/Distressed)';
  };

  const calculate = (v: FormValues) => {
    // Merton Model Implementation (Simplified)
    // 1. Estimate Asset Value (V) and Asset Volatility (sigma_V)
    // Approximation: V = E + D
    // sigma_V = sigma_E * (E / V)

    // Inputs
    const E = v.marketCap;
    const D = v.totalDebt;
    const sigma_E = v.equityVolatility / 100;
    const r = v.riskFreeRate / 100;
    const T = v.timeHorizon;

    const V = E + D;
    const sigma_V = sigma_E * (E / V);

    // 2. Distance to Default (DD)
    // DD = (ln(V/D) + (r - 0.5 * sigma_V^2) * T) / (sigma_V * sqrt(T))
    // Note: Some models use 'mu' (expected return) instead of 'r' for Real World PD.
    // We will use 'r' for Risk Neutral PD (market implied).

    const numerator = Math.log(V / D) + (r - 0.5 * sigma_V * sigma_V) * T;
    const denominator = sigma_V * Math.sqrt(T);

    const DD = numerator / denominator;

    // 3. Probability of Default (PD)
    // PD = N(-DD)
    const PD = standardNormalCDF(-DD) * 100; // In percentage

    return {
      pd: PD,
      distanceToDefault: DD,
      impliedRating: getRating(PD),
      assetValue: V,
      assetVolatility: sigma_V * 100,
      leverage: D / V, // Debt / Asset
    };
  };

  const getRecommendation = (pd: number, rating: string) => {
    if (pd > 2.0) {
      return `Implied rating is ${rating.split(' ')[0]}. This indicated significant credit risk. Collateralization or credit protection (CDS) is strongly advised.`;
    }
    return `Implied rating is ${rating.split(' ')[0]}. The entity shows strong solvency. Standard credit monitoring should suffice.`;
  };

  const getInsights = (dd: number, leverage: number) => {
    const insights = [];
    insights.push(`Solvency Buffer: The asset value is ${dd.toFixed(2)} standard deviations strictly above the default barrier.`);
    insights.push(`Leverage Impact: Debt finances ${(leverage * 100).toFixed(1)}% of the firm's assets.`);
    if (leverage > 0.6) insights.push('High leverage is amplifying the sensitivity of PD to equity drops.');
    else insights.push('Conservative leverage provides a strong cushion against volatility.');
    return insights;
  };

  const getRisks = () => {
    const risks = [];
    risks.push('Market Assumption: Model assumes efficient markets (equity price reflects true value).');
    risks.push('Drift Assumption: Uses risk-neutral drift (r), which may overestimate PD compared to historical "real world" defaults.');
    risks.push('Jump Risk: Does not account for sudden "gap" drops in asset value.');
    return risks;
  };

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      recommendation: getRecommendation(calc.pd, calc.impliedRating),
      insights: getInsights(calc.distanceToDefault, calc.leverage),
      risks: getRisks()
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Firm Fundamentals (Merton Model)
          </CardTitle>
          <CardDescription>
            Structural Credit Risk Estimation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="marketCap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Market Cap (Equity Value)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000000"
                          placeholder="e.g., 50000000"
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
                  name="totalDebt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Landmark className="h-4 w-4" />
                        Total Liabilities (Debt)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000000"
                          placeholder="e.g., 30000000"
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
                  name="equityVolatility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Equity Volatility (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="Annual Std Dev, e.g. 35"
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
                  name="riskFreeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Risk-Free Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 4.0"
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
                  name="timeHorizon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time Horizon (Years)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 1"
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
                Estimate Probability of Default
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
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Credit Profile</CardTitle>
                  <CardDescription>Merton Model Output</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Estimated PD (1-Year)</p>
                <p className={`text-4xl font-bold ${result.pd > 2.0 ? 'text-red-600' : 'text-green-600'}`}>
                  {result.pd < 0.01 ? '< 0.01%' : `${result.pd.toFixed(2)}%`}
                </p>
                <Badge variant={result.pd > 2.0 ? 'destructive' : 'secondary'} className="mt-3 text-lg px-4 py-1">
                  {result.impliedRating}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Distance to Default</p>
                  <p className="text-lg font-bold">{result.distanceToDefault.toFixed(2)} σ</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                  <p className="font-semibold">Asset Volatility</p>
                  <p className="text-lg font-bold">{result.assetVolatility.toFixed(1)}%</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Implied Asset Value</p>
                  <p className="text-lg font-bold">
                    {(result.assetValue / 1000000).toFixed(1)}M
                  </p>
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
                  Fundamental Drivers
                </CardTitle>
                <CardDescription>Why is PD this level?</CardDescription>
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
                  Data Limitations
                </CardTitle>
                <CardDescription>Model Caveats</CardDescription>
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
            Formula: Merton Structural Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              DD = [ ln(V / D) + (r - 0.5σ²)T ] / [ σ√T ]
            </p>
            <p className="font-mono text-sm text-center mt-2">
              PD = N( -DD )
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            The model treats the firm's equity as a <strong>Call Option</strong> on its assets. Default occurs if the Asset Value (<strong>V</strong>) falls below the Debt (<strong>D</strong>) value at maturity. The <strong>Distance to Default (DD)</strong> measures how many standard deviations the firm is from insolvency.
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
            <Link href="/finance/credit-risk-expected-loss-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Expected Loss</p>
                      <p className="text-sm text-muted-foreground">Calculate credit cost</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/debt-to-equity-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Debt-to-Equity</p>
                      <p className="text-sm text-muted-foreground">Leverage analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/option-greeks-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Option Greeks</p>
                      <p className="text-sm text-muted-foreground">Normal distribution tools</p>
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
        <meta itemProp="headline" content="Estimating Probability of Default (PD): The Merton Model" />
        <meta itemProp="description" content="A professional guide to estimating credit default risk. Learn how the Merton Structural Model uses stock prices and volatility to predict bankruptcy." />
        <meta itemProp="keywords" content="Merton model calculator, probability of default estimator, distance to default, structural credit risk, PD formula, credit rating implied PD" />
        <meta itemProp="author" content="Financial Analyst Team" />
        <meta itemProp="datePublished" content="2025-08-28" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Complete Guide to PD Estimation</h1>
        <p className="text-lg italic text-muted-foreground">Probability of Default (PD) is the central metric in credit risk. While credit agencies provide ratings, the Merton Model allows you to estimate a real-time PD using market data.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#concept" className="hover:underline">The "Equity as an Option" Concept</a></li>
          <li><a href="#merton" className="hover:underline">Merton Model Logic</a></li>
          <li><a href="#distance" className="hover:underline">Understanding Distance to Default</a></li>
          <li><a href="#market" className="hover:underline">Risk-Neutral vs. Real-World</a></li>
          <li><a href="#application" className="hover:underline">Applications in Investing</a></li>
        </ul>
        <hr />

        <h2 id="concept" className="text-2xl font-bold text-foreground pt-8">The "Equity as an Option" Concept</h2>
        <p>
          In 1974, Robert Merton proposed a revolutionary idea: <strong>A company's equity is like a Call Option on its assets.</strong>
        </p>
        <ul className="list-disc ml-6 space-y-2 mt-4">
          <li><strong>Strike Price:</strong> The Debt amount the company owes.</li>
          <li><strong>Underlying Asset:</strong> The total value of the company's assets.</li>
        </ul>
        <p className="mt-4">
          If Asset Value &gt; Debt, shareholders keep the difference (Option is In the Money). <br />
          If Asset Value &lt; Debt, shareholders get nothing (Option is Worthless/Default).
        </p>

        <h2 id="merton" className="text-2xl font-bold text-foreground pt-8">Merton Model Logic</h2>
        <p>
          The model uses the Black-Scholes formula in reverse. We can observe the <strong>Stock Price</strong> (Equity Value) and the <strong>Stock Volatility</strong>. We assume the debt is fixed. From this, we back-calculate the implied <strong>Asset Volatility</strong> and the likelihood that Assets will drop below Debt.
        </p>

        <h2 id="distance" className="text-2xl font-bold text-foreground pt-8">Understanding Distance to Default (DD)</h2>
        <p>
          Distance to Default is a statistical measure. It answers: <em>"How many standard deviations does the asset value need to drop for the company to go bust?"</em>
        </p>
        <p className="mt-2">
          A DD of <strong>3.0</strong> means a 3-sigma event is required for default. Since 3-sigma events are rare (0.13%), the PD is very low. A DD of <strong>1.0</strong> implies a PD around 16% (very risky).
        </p>

        <h2 id="market" className="text-2xl font-bold text-foreground pt-8">Risk-Neutral vs. Real-World</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Risk-Neutral PD</h4>
            <p className="text-sm">Derived from market prices (options/CDS). Includes a "risk premium" for investor fear. Usually <strong>higher</strong> than historical defaults.</p>
          </div>
          <div className="border p-4 rounded-lg bg-card/50">
            <h4 className="font-bold text-primary mb-2">Real-World PD</h4>
            <p className="text-sm"> derived from historical default rates. Used for back-testing capital reserves. Usually <strong>lower</strong>.</p>
          </div>
        </div>

        <h2 id="application" className="text-2xl font-bold text-foreground pt-8">Applications in Investing</h2>
        <p>
          Investors use this model to identify <strong>"Distressed Debt"</strong> opportunities. If the market price of a bond implies a 20% default rate, but your Merton model estimates a 5% PD, the bond might be undervalued.
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
            Common questions about PD Models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Why don't we just use the Credit Rating?</h4>
              <p className="text-muted-foreground">
                Credit ratings are often "lagging indicators" (updated only periodically). The Merton model uses live stock prices, so it reacts instantly to news, often predicting defaults months before a downgrade.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is the "Default Point"?</h4>
              <p className="text-muted-foreground">
                In practice, companies don't default exactly when Assets &lt; Total Debt. They default when they run out of cash. KMV (Moody's Analytics) often sets the "Default Point" at Short Term Debt + 50% of Long Term Debt.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does this work for private companies?</h4>
              <p className="text-muted-foreground">
                No. You need a market price for Equity to calculate Volatility. For private firms, you use "Fundamental Models" (like Altman Z, using accounting ratios) instead.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What is a "good" Distance to Default?</h4>
              <p className="text-muted-foreground">
                Generally, a DD &gt; 4 is Investment Grade (very safe). A DD &lt; 2 is Speculative Grade (Junk).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How does leverage affect PD?</h4>
              <p className="text-muted-foreground">
                Higher leverage (Debt/Assets) brings the default barrier closer to the current value, reducing Distance to Default and exponentially increasing PD.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can PD be 0%?</h4>
              <p className="text-muted-foreground">
                In the model, calculating N(-x) never technically reaches exactly zero, but for AAA companies it can be 0.0001% (1 basis point).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why use implied rating?</h4>
              <p className="text-muted-foreground">
                It helps translate the abstract "% probability" into a familiar letter grade language for easier communication with credit committees.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What happens if volatility spikes?</h4>
              <p className="text-muted-foreground">
                PD increases. Higher volatility means the asset value has a wider range of future outcomes, making it more likely to "hit" the default barrier even if the average value is high.
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
          <p>The PD Estimator uses market inputs to calculate the forward-looking probability of default.</p>
          <p>It provides early warning signals by monitoring the Distance to Default and Implied Rating.</p>
          <p>Use this for credit analysis of public companies and counterparty risk assessment.</p>
        </CardContent>
      </Card>
    </div>
  );
}
