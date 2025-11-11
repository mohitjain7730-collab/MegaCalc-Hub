'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  asset1Returns: z.string().min(1, 'At least one return value is required'),
  asset2Returns: z.string().min(1, 'At least one return value is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CorrelationCoefficientCalculator() {
  const [result, setResult] = useState<{ 
    correlation: number; 
    interpretation: string; 
    relationshipLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      asset1Returns: '',
      asset2Returns: '',
    },
  });

  const calculateCorrelation = (returns1String: string, returns2String: string) => {
    const returns1 = returns1String.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));
    const returns2 = returns2String.split(',').map(r => parseFloat(r.trim())).filter(r => !isNaN(r));
    
    if (returns1.length < 2 || returns2.length < 2 || returns1.length !== returns2.length) return null;

    const mean1 = returns1.reduce((sum, r) => sum + r, 0) / returns1.length;
    const mean2 = returns2.reduce((sum, r) => sum + r, 0) / returns2.length;

    let numerator = 0;
    let sumSquared1 = 0;
    let sumSquared2 = 0;

    for (let i = 0; i < returns1.length; i++) {
      const diff1 = returns1[i] - mean1;
      const diff2 = returns2[i] - mean2;
      numerator += diff1 * diff2;
      sumSquared1 += diff1 * diff1;
      sumSquared2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sumSquared1 * sumSquared2);
    const correlation = denominator === 0 ? 0 : numerator / denominator;
    
    return correlation;
  };

  const interpret = (correlation: number) => {
    if (correlation >= 0.8) return 'Very strong positive correlation - assets move together closely.';
    if (correlation >= 0.6) return 'Strong positive correlation - assets tend to move together.';
    if (correlation >= 0.3) return 'Moderate positive correlation - some relationship between assets.';
    if (correlation >= -0.3) return 'Weak correlation - minimal relationship between assets.';
    if (correlation >= -0.6) return 'Moderate negative correlation - assets tend to move opposite.';
    if (correlation >= -0.8) return 'Strong negative correlation - assets move opposite directions.';
    return 'Very strong negative correlation - assets move opposite closely.';
  };

  const getRelationshipLevel = (correlation: number) => {
    if (correlation >= 0.8) return 'Very Strong';
    if (correlation >= 0.6) return 'Strong';
    if (correlation >= 0.3) return 'Moderate';
    if (correlation >= -0.3) return 'Weak';
    if (correlation >= -0.6) return 'Moderate';
    if (correlation >= -0.8) return 'Strong';
    return 'Very Strong';
  };

  const getRecommendation = (correlation: number) => {
    if (correlation >= 0.8) return 'Consider reducing exposure to both assets - limited diversification benefit.';
    if (correlation >= 0.6) return 'Monitor correlation closely - moderate diversification benefit.';
    if (correlation >= 0.3) return 'Good diversification potential - assets provide some risk reduction.';
    if (correlation >= -0.3) return 'Excellent diversification potential - assets provide good risk reduction.';
    if (correlation >= -0.6) return 'Very good diversification potential - assets provide strong risk reduction.';
    if (correlation >= -0.8) return 'Excellent diversification potential - assets provide very strong risk reduction.';
    return 'Perfect diversification potential - assets provide maximum risk reduction.';
  };

  const getStrength = (correlation: number) => {
    if (Math.abs(correlation) >= 0.8) return 'Very Strong';
    if (Math.abs(correlation) >= 0.6) return 'Strong';
    if (Math.abs(correlation) >= 0.3) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (correlation: number) => {
    const insights = [];
    if (correlation >= 0.8) {
      insights.push('Very high correlation between assets');
      insights.push('Limited diversification benefits');
      insights.push('Assets move together closely');
    } else if (correlation >= 0.6) {
      insights.push('High correlation between assets');
      insights.push('Moderate diversification benefits');
      insights.push('Assets tend to move together');
    } else if (correlation >= 0.3) {
      insights.push('Moderate correlation between assets');
      insights.push('Good diversification benefits');
      insights.push('Some relationship between assets');
    } else if (correlation >= -0.3) {
      insights.push('Low correlation between assets');
      insights.push('Excellent diversification benefits');
      insights.push('Minimal relationship between assets');
    } else if (correlation >= -0.6) {
      insights.push('Moderate negative correlation');
      insights.push('Very good diversification benefits');
      insights.push('Assets tend to move opposite');
    } else {
      insights.push('High negative correlation');
      insights.push('Excellent diversification benefits');
      insights.push('Assets move opposite directions');
    }
    return insights;
  };

  const getConsiderations = (correlation: number) => {
    const considerations = [];
    considerations.push('Correlation can change over time');
    considerations.push('Historical correlation may not predict future correlation');
    considerations.push('Consider market conditions and economic cycles');
    considerations.push('Correlation may increase during market stress');
    considerations.push('Use correlation as one factor in portfolio construction');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const correlation = calculateCorrelation(values.asset1Returns, values.asset2Returns);
    if (correlation !== null) {
      setResult({
        correlation,
        interpretation: interpret(correlation),
        relationshipLevel: getRelationshipLevel(correlation),
        recommendation: getRecommendation(correlation),
        strength: getStrength(correlation),
        insights: getInsights(correlation),
        considerations: getConsiderations(correlation)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <CardTitle>Correlation Coefficient Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate the correlation between two assets to assess diversification potential
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="asset1Returns" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Asset 1 Returns (%)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter returns separated by commas" 
                        {...field} 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
                <FormField control={form.control} name="asset2Returns" render={({ field }) => (
              <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Asset 2 Returns (%)
                    </FormLabel>
                <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Enter returns separated by commas" 
                        {...field} 
                      />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
              <p className="text-sm text-muted-foreground">
                Enter the same number of return values for both assets. Values should be separated by commas (e.g., 5.2, -3.1, 8.7, 2.4).
              </p>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Correlation
              </Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
          <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Landmark className="h-6 w-6 text-primary" />
                  <CardTitle>Correlation Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.relationshipLevel === 'Weak' ? 'default' : result.relationshipLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.relationshipLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
            </div>
          </CardHeader>
          <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.correlation.toFixed(3)}
                </div>
                <p className="text-lg text-muted-foreground">{result.interpretation}</p>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{result.recommendation}</AlertDescription>
                </Alert>
              </div>
          </CardContent>
        </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                <CardTitle>Insights & Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Strengths & Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {result.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Important Considerations
                  </h4>
                  <ul className="space-y-2">
                    {result.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other essential financial metrics for comprehensive portfolio analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/beta-asset-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Beta Asset</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/portfolio-variance-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Portfolio Variance</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/volatility-standard-deviation-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Volatility</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sharpe-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sharpe Ratio</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to the Correlation Coefficient (Pearson R): Calculation, Interpretation, and Portfolio Diversification" />
    <meta itemProp="description" content="An expert guide detailing the Pearson Correlation Coefficient formula, its calculation mechanics, interpretation of values (-1 to +1), and its essential role in portfolio diversification and measuring the linear relationship between two variables." />
    <meta itemProp="keywords" content="correlation coefficient formula explained, calculating pearson r, measuring linear relationship statistics, portfolio diversification correlation, positive vs negative correlation, covariance calculation finance" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-11" /> 
    <meta itemProp="url" content="/definitive-correlation-coefficient-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to the Correlation Coefficient: Quantifying the Relationship Between Variables</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental statistical measure that assesses the strength and direction of the linear relationship between two data sets.</p>
    

[Image of Correlation coefficient scatter plots showing positive, negative, and zero correlation]


    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Correlation Coefficient: Definition and Range</a></li>
        <li><a href="#formula" className="hover:underline">The Pearson Coefficient Formula and Components</a></li>
        <li><a href="#covariance" className="hover:underline">Covariance: The Measure of Joint Variability</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpretation: Positive, Negative, and Zero Correlation</a></li>
        <li><a href="#diversification" className="hover:underline">Application in Portfolio Diversification (Modern Portfolio Theory)</a></li>
    </ul>
<hr />

    {/* CORRELATION COEFFICIENT: DEFINITION AND RANGE */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Correlation Coefficient: Definition and Range</h2>
    <p>The **Correlation Coefficient ($r$)**, most commonly the **Pearson Product-Moment Correlation Coefficient**, is a statistical metric that measures the strength and direction of a linear relationship between two quantitative variables ($X$ and $Y$).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Range of Correlation</h3>
    <p>The correlation coefficient always produces a value between $-1.0$ and $+1.0$.</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>**$+1.0$ (Perfect Positive Correlation):** When $X$ increases, $Y$ increases proportionally.</li>
        <li>**$-1.0$ (Perfect Negative Correlation):** When $X$ increases, $Y$ decreases proportionally.</li>
        <li>**$0.0$ (Zero/No Linear Correlation):** No linear relationship exists between the movements of $X$ and $Y$.</li>
    </ul>
    <p>The coefficient only measures the strength of the *linear* relationship; it cannot quantify non-linear or curved relationships.</p>

<hr />

    {/* THE PEARSON COEFFICIENT FORMULA AND MECHANICS */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Pearson Coefficient Formula and Mechanics</h2>
    <p>The formula for the correlation coefficient ($r$) standardizes the covariance of the two variables by dividing it by the product of their individual standard deviations. This normalization ensures the result is unitless and always falls between $-1$ and $+1$.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>The formula for the Pearson $r$ is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'r = Cov(X, Y) / (σ_X * σ_Y)'}
        </p>
    </div>
    <p>Where Cov(X, Y) is the covariance between variables X and Y, and sigma X and sigma Y are the standard deviations of X and Y, respectively.</p>

<hr />

    {/* COVARIANCE: THE MEASURE OF JOINT VARIABILITY */}
    <h2 id="covariance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Covariance: The Measure of Joint Variability</h2>
    <p>**Covariance** is the unstandardized measure of how two variables move together. It forms the numerator of the correlation coefficient formula.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Covariance Formula</h3>
    <p>Covariance calculates the average of the products of the deviations of $X$ and $Y$ from their respective means:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Cov(X, Y) = Sum [ (X_i - X_avg) * (Y_i - Y_avg) ] / (N - 1)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why Normalization is Required</h3>
    <p>While covariance indicates the direction of the relationship (positive or negative), its magnitude is dependent on the units of the variables. For example, the covariance between returns of a large company and a small company will be numerically different, making direct comparison impossible. Correlation solves this by dividing by the product of the standard deviations, standardizing the relationship to a unitless percentage (the coefficient $r$).</p>

<hr />

    {/* INTERPRETATION: POSITIVE, NEGATIVE, AND ZERO CORRELATION */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpretation: Positive, Negative, and Zero Correlation</h2>
    <p>The strength of the relationship is categorized by the absolute value of the coefficient ($|r|$), and the direction is determined by its sign.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Direction of Relationship</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Positive Correlation (r &gt; 0):</strong> The variables move in the same direction. In finance, this means if Stock A gains 1%, Stock B is likely to also gain.</li>
        <li><strong className="font-semibold">Negative Correlation (r &lt; 0):</strong> The variables move in opposite directions. If Stock A gains, Stock B is likely to lose.</li>
        <li><strong className="font-semibold">Zero Correlation ($r \approx 0$):</strong> The movement of one variable provides no predictive information about the movement of the other.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Strength of Relationship ($|r|$)</h3>
    <p>The strength of the correlation is assessed using the absolute value:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>$0.7 \lt |r| \le 1.0$: Strong relationship.</li>
        <li>$0.3 \lt |r| \le 0.7$: Moderate relationship.</li>
        <li>$0.0 \le |r| \le 0.3$: Weak or negligible relationship.</li>
    </ul>
    <p>A high correlation does not imply causation, only that the variables happen to move together linearly.</p>

<hr />

    {/* APPLICATION IN PORTFOLIO DIVERSIFICATION (MODERN PORTFOLIO THEORY) */}
    <h2 id="diversification" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Application in Portfolio Diversification (Modern Portfolio Theory)</h2>
    <p>The Correlation Coefficient is the cornerstone of **Modern Portfolio Theory (MPT)**, which focuses on constructing efficient portfolios that maximize return for a given level of risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Reducing Portfolio Risk</h3>
    <p>The goal of diversification is not merely to hold many different assets, but to hold assets whose returns are <strong className="font-semibold">imperfectly correlated</strong> (r is less than 1.0). Combining assets that are not perfectly positively correlated reduces the overall volatility of the portfolio without necessarily reducing the expected return.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Ideal Correlation (Negative)</h3>
    <p>The most effective risk reduction is achieved by combining assets with **negative correlation** (e.g., combining stocks with high-grade government bonds). When the stock market declines, the bond market often rises, counterbalancing the portfolio's losses and smoothing out the overall return curve.</p>
    <p>A correlation near zero is also highly desirable, as it means the portfolio's total risk is less than the sum of the individual assets' risks.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The Correlation Coefficient ($r$) is the primary measure of the **strength and direction of the linear relationship** between two variables, normalized to range between $-1.0$ and $+1.0$. It is calculated by standardizing the **Covariance** (measure of joint movement) by the product of the assets' individual standard deviations.</p>
    <p>In investment, the Correlation Coefficient is the central tool for **diversification**, as combining assets with low or negative correlation is the most efficient way to reduce overall portfolio risk.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Correlation Coefficient
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Correlation Coefficient?</h4>
              <p className="text-muted-foreground">
                The Correlation Coefficient is a statistical measure that quantifies the strength and direction of the linear relationship between two variables. It ranges from -1 to +1, where +1 indicates perfect positive correlation, -1 indicates perfect negative correlation, and 0 indicates no linear relationship.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Correlation Coefficient?</h4>
              <p className="text-muted-foreground">
                The correlation coefficient is calculated using the formula: r = Σ[(xi - x̄)(yi - ȳ)] / √[Σ(xi - x̄)² × Σ(yi - ȳ)²]. This measures the covariance between two variables divided by the product of their standard deviations. The result indicates the strength and direction of their linear relationship.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a correlation of 1 mean?</h4>
              <p className="text-muted-foreground">
                A correlation of +1 means perfect positive correlation - the two assets move in exactly the same direction with the same magnitude. A correlation of -1 means perfect negative correlation - the assets move in exactly opposite directions with the same magnitude. These are theoretical extremes rarely seen in practice.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a correlation of 0 mean?</h4>
              <p className="text-muted-foreground">
                A correlation of 0 means there is no linear relationship between the two assets. Their price movements are independent of each other. This provides excellent diversification benefits as the assets don't move together, helping to reduce portfolio risk through diversification.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good correlation for diversification?</h4>
              <p className="text-muted-foreground">
                For diversification purposes, correlations below 0.3 are considered good, below 0.1 are excellent, and negative correlations provide the best diversification benefits. Correlations above 0.7 indicate limited diversification benefits, while correlations above 0.9 suggest the assets move almost identically.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does correlation affect portfolio risk?</h4>
              <p className="text-muted-foreground">
                Lower correlations between portfolio assets reduce overall portfolio risk through diversification. When assets have low correlation, they don't all move in the same direction simultaneously, which helps smooth out portfolio returns. Higher correlations increase portfolio risk as assets tend to move together.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of correlation?</h4>
              <p className="text-muted-foreground">
                Correlation only measures linear relationships and may miss non-linear relationships. It can change over time, especially during market stress when correlations often increase. It doesn't indicate causation and may be influenced by external factors. Historical correlation may not predict future correlation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I use correlation in portfolio construction?</h4>
              <p className="text-muted-foreground">
                Use correlation to identify assets that provide good diversification benefits. Include assets with low or negative correlations to reduce portfolio risk. Monitor correlations over time as they can change. Consider correlation as one factor among many in portfolio construction, along with expected returns and individual asset risks.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is correlation important for investors?</h4>
              <p className="text-muted-foreground">
                Correlation is crucial for investors as it helps assess diversification benefits and portfolio risk. Understanding how assets move relative to each other enables better portfolio construction, risk management, and asset allocation decisions. It's essential for building resilient portfolios that can weather different market conditions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do institutional investors use correlation?</h4>
              <p className="text-muted-foreground">
                Institutional investors use correlation for portfolio optimization, risk management, and asset allocation. They monitor correlations to maintain target risk levels, implement diversification strategies, and assess portfolio stability. Correlation analysis helps them make informed decisions about asset selection and portfolio construction.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}