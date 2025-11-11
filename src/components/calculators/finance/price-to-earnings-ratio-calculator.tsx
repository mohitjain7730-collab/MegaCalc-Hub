'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, DollarSign, TrendingUp, Target, Info, AlertCircle, BarChart3, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  pricePerShare: z.number().positive(),
  eps: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PriceToEarningsRatioCalculator() {
  const [result, setResult] = useState<{ 
    peRatio: number; 
    interpretation: string; 
    recommendation: string;
    valuation: string;
    riskLevel: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pricePerShare: undefined,
      eps: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.pricePerShare == null || v.eps == null) return null;
    return v.pricePerShare / v.eps;
  };

  const interpret = (peRatio: number) => {
    if (peRatio > 30) return 'High P/E ratio suggests the stock may be overvalued or has high growth expectations.';
    if (peRatio > 20) return 'Moderate P/E ratio indicates reasonable valuation relative to earnings.';
    if (peRatio > 10) return 'Low P/E ratio suggests the stock may be undervalued or has low growth expectations.';
    return 'Very low P/E ratio may indicate undervaluation or fundamental issues.';
  };

  const getValuation = (peRatio: number) => {
    if (peRatio > 30) return 'Potentially Overvalued';
    if (peRatio > 20) return 'Fairly Valued';
    if (peRatio > 10) return 'Potentially Undervalued';
    return 'Deeply Undervalued';
  };

  const getRiskLevel = (peRatio: number) => {
    if (peRatio > 50) return 'Very High';
    if (peRatio > 30) return 'High';
    if (peRatio > 15) return 'Moderate';
    return 'Low';
  };

  const getInsights = (peRatio: number) => {
    const insights = [];
    
    if (peRatio > 30) {
      insights.push('High P/E ratio may indicate overvaluation or high growth expectations');
      insights.push('Investors are paying a premium for future earnings growth');
    } else if (peRatio > 15) {
      insights.push('Moderate P/E ratio suggests balanced valuation');
      insights.push('Stock price appears reasonably aligned with earnings');
    } else {
      insights.push('Low P/E ratio may indicate undervaluation or low growth expectations');
      insights.push('Stock may be trading at a discount to its earnings');
    }

    if (peRatio > 50) {
      insights.push('Extremely high P/E ratio requires careful analysis of growth prospects');
    }

    return insights;
  };

  const getConsiderations = (peRatio: number) => {
    const considerations = [];
    
    considerations.push('Compare P/E ratio with industry peers and market averages');
    considerations.push('Consider the company\'s growth prospects and earnings quality');
    considerations.push('Evaluate market conditions and investor sentiment');
    
    if (peRatio > 30) {
      considerations.push('High P/E requires strong growth expectations to justify valuation');
      considerations.push('Monitor earnings growth to ensure it meets investor expectations');
    } else if (peRatio < 10) {
      considerations.push('Low P/E may indicate value opportunity or underlying issues');
      considerations.push('Investigate reasons for low valuation before investing');
    }

    considerations.push('Use P/E ratio alongside other valuation metrics');
    considerations.push('Consider the company\'s business model and competitive position');

    return considerations;
  };

  const recommendation = (peRatio: number) => {
    if (peRatio > 50) {
      return 'Extremely high P/E ratio - proceed with extreme caution and verify growth assumptions.';
    } else if (peRatio > 30) {
      return 'High P/E ratio - ensure strong growth prospects justify the premium valuation.';
    } else if (peRatio > 15) {
      return 'Moderate P/E ratio - reasonable valuation, consider alongside other factors.';
    } else {
      return 'Low P/E ratio - potential value opportunity, but investigate underlying reasons.';
    }
  };

  const onSubmit = (values: FormValues) => {
    const peRatio = calculate(values);
    if (peRatio == null) { setResult(null); return; }
    setResult({ 
      peRatio, 
      interpretation: interpret(peRatio), 
      recommendation: recommendation(peRatio),
      valuation: getValuation(peRatio),
      riskLevel: getRiskLevel(peRatio),
      insights: getInsights(peRatio),
      considerations: getConsiderations(peRatio)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Stock Parameters
          </CardTitle>
          <CardDescription>
            Enter the stock price and earnings per share to calculate the P/E ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="pricePerShare" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Market Price per Share ($)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 50.00" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="eps" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Earnings per Share (EPS, $)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 2.50" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              
              <Button type="submit" className="w-full md:w-auto">
                Calculate P/E Ratio
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Main Results Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Calculator className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>P/E Ratio Analysis</CardTitle>
                  <CardDescription>Stock valuation assessment and investment insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">P/E Ratio</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.peRatio.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.valuation}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.riskLevel === 'Very High' ? 'destructive' : result.riskLevel === 'High' ? 'default' : 'secondary'}>
                      {result.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.interpretation}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Recommendation</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {result.peRatio > 30 ? 'Caution' : result.peRatio < 15 ? 'Consider' : 'Evaluate'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.recommendation}
                  </p>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        Key Insights
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="h-5 w-5" />
                        Important Considerations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.considerations.map((consideration, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial calculators to enhance your investment analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/earnings-per-share-calculator" className="text-primary hover:underline">
                    Earnings per Share Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate EPS to understand company profitability per share.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/return-on-equity-calculator" className="text-primary hover:underline">
                    Return on Equity Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate ROE to assess management efficiency and profitability.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/return-on-assets-calculator" className="text-primary hover:underline">
                    Return on Assets Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate ROA to evaluate asset utilization efficiency.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/debt-to-equity-ratio-calculator" className="text-primary hover:underline">
                    Debt-to-Equity Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate debt-to-equity ratio to assess financial leverage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to the Price-to-Earnings (P/E) Ratio: Calculation, Interpretation, and Stock Valuation" />
    <meta itemProp="description" content="An expert guide detailing the P/E ratio formula, its role in equity valuation, interpreting high vs. low P/E multiples, its use in competitive benchmarking, and comparing trailing P/E against forward P/E." />
    <meta itemProp="keywords" content="price to earnings ratio formula, calculating P/E multiple, stock valuation metric, trailing P/E vs forward P/E, interpreting high P/E, relative valuation analysis" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-11" /> 
    <meta itemProp="url" content="/definitive-p-e-ratio-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Price-to-Earnings (P/E) Ratio: The Most Used Valuation Multiple</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental metric that assesses how much investors are willing to pay for one dollar of a company's current or expected earnings.</p>
    

[Image of Price-to-Earnings (P/E) Ratio concept]


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">P/E Ratio: Definition and Core Significance</a></li>
        <li><a href="#formula" className="hover:underline">The P/E Ratio Formula and Calculation</a></li>
        <li><a href="#trailing-forward" className="hover:underline">Trailing P/E vs. Forward P/E</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpreting High vs. Low P/E Multiples</a></li>
        <li><a href="#limitations" className="hover:underline">Limitations and Comparison with PEG Ratio</a></li>
    </ul>
<hr />

    {/* P/E RATIO: DEFINITION AND CORE SIGNIFICANCE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">P/E Ratio: Definition and Core Significance</h2>
    <p>The **Price-to-Earnings (P/E) Ratio** is the most widely used metric in equity valuation. It measures the relationship between a company's current share price and its earnings per share (EPS). It is often called the **Earnings Multiple**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The P/E Question</h3>
    <p>The P/E ratio answers a simple question: "How many dollars must an investor pay today to buy one dollar of the company's annual earnings?" The resulting number reflects market expectation—investors are willing to pay more for stocks they expect to have high future growth, resulting in a higher P/E.</p>

<hr />

    {/* THE P/E RATIO FORMULA AND CALCULATION */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The P/E Ratio Formula and Calculation</h2>
    <p>The P/E ratio can be calculated using either the total market capitalization and total net income, or the price per share and the earnings per share (EPS). The result is identical.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Share-Based Formula</h3>
    <p>This is the standard calculation used by most financial news sources:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'P/E Ratio = Market Price per Share / Earnings per Share (EPS)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Enterprise-Based Formula</h3>
    <p>This method compares total market value to total earnings:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'P/E Ratio = Market Capitalization / Net Income'}
        </p>
    </div>
    <p>The resulting P/E ratio is a measure of the relative cost of the stock—a comparison of price to fundamental business profitability.</p>

<hr />

    {/* TRAILING P/E VS. FORWARD P/E */}
    <h2 id="trailing-forward" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Trailing P/E vs. Forward P/E</h2>
    <p>Because the P/E ratio relies on earnings (the denominator), the results vary dramatically depending on whether historical or projected earnings are used.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Trailing P/E (Historical)</h3>
    <p>The **Trailing P/E** uses the company's actual, verified Earnings Per Share (EPS) from the last 12 months (Last Twelve Months - LTM). It provides a concrete, factual basis for valuation, but it is backward-looking and may not reflect current business conditions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Forward P/E (Projected)</h3>
    <p>The **Forward P/E** uses an estimate of the company's future EPS, typically analysts' consensus forecasts for the next four quarters or next fiscal year. This metric is favored by growth investors because it reflects future expectations, but it is less reliable because it is based on subjective estimates that can be inaccurate or deliberately optimistic.</p>
    <p>A Forward P/E that is significantly lower than the Trailing P/E suggests that the company's earnings are expected to grow rapidly, making the stock appear cheaper on a forward-looking basis.</p>

<hr />

    {/* INTERPRETING HIGH VS. LOW P/E MULTIPLES */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting High vs. Low P/E Multiples</h2>
    <p>P/E interpretation is always relative—relative to the industry average, the market average, and the company's historical average. The P/E ratio is the market's price tag on future growth.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">High P/E Ratio (e.g., &gt; 25)</h3>
<p>A high P/E ratio signals high <strong className="font-semibold">growth expectation</strong>. Investors are willing to pay a premium for each dollar of current earnings because they believe the company's earnings will grow exponentially in the future (e.g., technology, biotechnology). This stock is often considered <strong className="font-semibold">growth stock</strong>.</p>
<p>However, a very high P/E can also indicate an overvalued stock or a speculative bubble, especially if the expected growth fails to materialize.</p>

<h3 className="text-xl font-semibold text-foreground mt-6">Low P/E Ratio (e.g., &lt; 15)</h3>
<p>A low P/E ratio suggests low <strong className="font-semibold">growth expectation</strong> or market pessimism. This stock may be undervalued (a <strong className="font-semibold">value stock</strong>) or it may be accurately priced due to a high degree of business risk, low profit margins, or systemic decline. Value investors seek low P/E stocks that are temporarily depressed but expected to recover.</p>

<hr />

    {/* LIMITATIONS AND COMPARISON WITH PEG RATIO */}
    <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Comparison with PEG Ratio</h2>
    <p>Despite its popularity, the P/E ratio has significant limitations, particularly when comparing companies with vastly different growth rates.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">P/E Limitations</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Ignores Growth:** P/E does not explicitly factor in the rate of expected earnings growth. A high P/E is acceptable for a fast-growing company, but P/E alone doesn't show *how fast*.</li>
        <li>**Ignores Risk:** P/E does not account for the company's debt structure (leverage) or the volatility of its earnings.</li>
        <li>**Inapplicable to Losses:** P/E is meaningless when earnings are negative, as a negative denominator yields a negative, uninterpretable P/E ratio.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The PEG Ratio (P/E to Growth)</h3>
    <p>The <strong className="font-semibold">PEG Ratio</strong> corrects the P/E's primary flaw by incorporating the company's expected earnings growth rate (G). It is calculated as P/E divided by G.</p>
    <p>The PEG ratio answers: "How much are you paying for one unit of earnings growth?" A **PEG ratio of 1.0** is generally considered fair value, indicating the P/E ratio equals the expected annual growth rate. This allows for a more accurate comparison of stocks with different growth trajectories.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Price-to-Earnings (P/E) Ratio is the foundational metric for **relative valuation**, expressing the market's faith in a company by quantifying the price paid for one dollar of earnings (EPS).</p>
    <p>High P/E ratios signal strong market expectations for future growth, while low P/E ratios suggest caution. However, its effectiveness relies on context: the P/E should always be compared against industry peers and supplemented by the **PEG ratio** to correctly incorporate the critical dimension of earnings growth.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about P/E ratio analysis and stock valuation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is the P/E ratio?</h4>
              <p className="text-muted-foreground">
                The P/E (Price-to-Earnings) ratio is a valuation metric that compares a company's stock price to its earnings per share. It shows how much investors are willing to pay for each dollar of earnings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate the P/E ratio?</h4>
              <p className="text-muted-foreground">
                P/E ratio = Market Price per Share ÷ Earnings per Share. For example, if a stock costs $50 and has EPS of $2.50, the P/E ratio is 20.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good P/E ratio?</h4>
              <p className="text-muted-foreground">
                A "good" P/E ratio depends on the industry and market conditions. Generally, P/E ratios between 15-25 are considered reasonable, but this varies significantly by sector and growth prospects.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a high P/E ratio mean?</h4>
              <p className="text-muted-foreground">
                A high P/E ratio typically indicates that investors expect high future earnings growth, or the stock may be overvalued. It suggests investors are paying a premium for the company's earnings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a low P/E ratio mean?</h4>
              <p className="text-muted-foreground">
                A low P/E ratio may indicate that the stock is undervalued, or there may be concerns about the company's future prospects. It could represent a value opportunity or signal underlying problems.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use trailing or forward P/E ratio?</h4>
              <p className="text-muted-foreground">
                Trailing P/E uses historical earnings (past 12 months), while forward P/E uses projected earnings. Both are useful - trailing P/E shows current valuation, while forward P/E reflects growth expectations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I compare P/E ratios across companies?</h4>
              <p className="text-muted-foreground">
                Compare P/E ratios within the same industry and similar business models. Different industries have different typical P/E ranges, so cross-industry comparisons can be misleading.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of P/E ratio?</h4>
              <p className="text-muted-foreground">
                P/E ratio doesn't account for debt levels, growth rates, or earnings quality. It can be distorted by one-time events and doesn't work well for companies with negative earnings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can P/E ratio be negative?</h4>
              <p className="text-muted-foreground">
                Yes, P/E ratio can be negative when a company has negative earnings (losses). Negative P/E ratios are generally not meaningful for valuation comparisons.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does P/E ratio relate to growth?</h4>
              <p className="text-muted-foreground">
                Higher growth companies typically have higher P/E ratios as investors pay more for expected future earnings growth. The PEG ratio (P/E ÷ Growth Rate) helps normalize for growth differences.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}