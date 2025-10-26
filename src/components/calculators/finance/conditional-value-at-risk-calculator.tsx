'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, BarChart3, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  portfolioValue: z.number().positive(),
  volatility: z.number().positive(),
  confidenceLevel: z.number().min(90).max(99.9),
  timeHorizon: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConditionalValueAtRiskCalculator() {
  const [result, setResult] = useState<{ 
    varValue: number;
    cvarValue: number;
    cvarPercentage: number;
    interpretation: string; 
    riskLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portfolioValue: undefined,
      volatility: undefined,
      confidenceLevel: 95,
      timeHorizon: 1,
    },
  });

  const calculateCVaR = (v: FormValues) => {
    if (v.portfolioValue == null || v.volatility == null || v.confidenceLevel == null || v.timeHorizon == null) return null;
    
    // Convert percentages to decimals
    const volatility = v.volatility / 100;
    const confidenceLevel = v.confidenceLevel / 100;
    
    // Calculate Z-score for the confidence level
    let zScore;
    if (confidenceLevel === 0.95) zScore = 1.645;
    else if (confidenceLevel === 0.99) zScore = 2.326;
    else if (confidenceLevel === 0.90) zScore = 1.282;
    else if (confidenceLevel === 0.975) zScore = 1.96;
    else {
      // Approximation for other confidence levels
      zScore = Math.sqrt(2) * Math.sqrt(-Math.log(1 - confidenceLevel));
    }
    
    // VaR calculation
    const varValue = v.portfolioValue * volatility * zScore * Math.sqrt(v.timeHorizon);
    
    // CVaR calculation (Expected Shortfall)
    // For normal distribution, CVaR = VaR + (volatility * sqrt(time) * phi(z) / (1 - confidence_level))
    // where phi(z) is the standard normal density function
    const phiZ = Math.exp(-0.5 * zScore * zScore) / Math.sqrt(2 * Math.PI);
    const cvarValue = varValue + (v.portfolioValue * volatility * Math.sqrt(v.timeHorizon) * phiZ / (1 - confidenceLevel));
    const cvarPercentage = (cvarValue / v.portfolioValue) * 100;
    
    return { varValue, cvarValue, cvarPercentage };
  };

  const interpret = (cvarPercentage: number, confidenceLevel: number) => {
    if (cvarPercentage <= 5) return `Very low tail risk - average loss beyond ${confidenceLevel}% VaR is ${cvarPercentage.toFixed(1)}% of portfolio value.`;
    if (cvarPercentage <= 10) return `Low tail risk - average loss beyond ${confidenceLevel}% VaR is ${cvarPercentage.toFixed(1)}% of portfolio value.`;
    if (cvarPercentage <= 20) return `Moderate tail risk - average loss beyond ${confidenceLevel}% VaR is ${cvarPercentage.toFixed(1)}% of portfolio value.`;
    if (cvarPercentage <= 30) return `High tail risk - average loss beyond ${confidenceLevel}% VaR is ${cvarPercentage.toFixed(1)}% of portfolio value.`;
    return `Very high tail risk - average loss beyond ${confidenceLevel}% VaR is ${cvarPercentage.toFixed(1)}% of portfolio value.`;
  };

  const getRiskLevel = (cvarPercentage: number) => {
    if (cvarPercentage <= 5) return 'Very Low';
    if (cvarPercentage <= 10) return 'Low';
    if (cvarPercentage <= 20) return 'Moderate';
    if (cvarPercentage <= 30) return 'High';
    return 'Very High';
  };

  const getRecommendation = (cvarPercentage: number, confidenceLevel: number) => {
    if (cvarPercentage <= 5) return 'Excellent tail risk management - maintain current strategy with confidence.';
    if (cvarPercentage <= 10) return 'Good tail risk management - consider minor adjustments if risk tolerance is lower.';
    if (cvarPercentage <= 20) return 'Moderate tail risk management - review portfolio allocation and hedging strategies.';
    if (cvarPercentage <= 30) return 'High tail risk exposure - consider reducing risk through diversification or hedging.';
    return 'Very high tail risk exposure - urgent review needed to reduce portfolio tail risk.';
  };

  const getStrength = (cvarPercentage: number) => {
    if (cvarPercentage <= 5) return 'Excellent';
    if (cvarPercentage <= 10) return 'Strong';
    if (cvarPercentage <= 20) return 'Moderate';
    if (cvarPercentage <= 30) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (cvarPercentage: number, varValue: number, cvarValue: number, confidenceLevel: number) => {
    const insights = [];
    
    if (cvarPercentage <= 5) {
      insights.push('Very conservative tail risk profile');
      insights.push('Excellent downside protection');
      insights.push('Low probability of extreme losses');
    } else if (cvarPercentage <= 10) {
      insights.push('Conservative tail risk profile');
      insights.push('Good downside protection');
      insights.push('Low probability of moderate extreme losses');
    } else if (cvarPercentage <= 20) {
      insights.push('Moderate tail risk profile');
      insights.push('Balanced risk-return profile');
      insights.push('Reasonable extreme loss exposure');
    } else if (cvarPercentage <= 30) {
      insights.push('Aggressive tail risk profile');
      insights.push('Higher return potential');
      insights.push('Significant extreme loss exposure');
    } else {
      insights.push('Very aggressive tail risk profile');
      insights.push('Maximum return potential');
      insights.push('High extreme loss exposure');
    }
    
    const tailRiskRatio = ((cvarValue - varValue) / varValue) * 100;
    insights.push(`${confidenceLevel}% confidence level`);
    insights.push(`Tail risk ratio: ${tailRiskRatio.toFixed(1)}%`);
    
    return insights;
  };

  const getConsiderations = (cvarPercentage: number) => {
    const considerations = [];
    considerations.push('CVaR assumes normal distribution of returns');
    considerations.push('Results may not capture extreme market events');
    considerations.push('CVaR provides more information than VaR alone');
    considerations.push('Consider correlation between portfolio assets');
    considerations.push('CVaR is a statistical measure, not a guarantee');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const cvarResult = calculateCVaR(values);
    if (cvarResult !== null) {
      setResult({
        varValue: cvarResult.varValue,
        cvarValue: cvarResult.cvarValue,
        cvarPercentage: cvarResult.cvarPercentage,
        interpretation: interpret(cvarResult.cvarPercentage, values.confidenceLevel),
        riskLevel: getRiskLevel(cvarResult.cvarPercentage),
        recommendation: getRecommendation(cvarResult.cvarPercentage, values.confidenceLevel),
        strength: getStrength(cvarResult.cvarPercentage),
        insights: getInsights(cvarResult.cvarPercentage, cvarResult.varValue, cvarResult.cvarValue, values.confidenceLevel),
        considerations: getConsiderations(cvarResult.cvarPercentage)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <CardTitle>Conditional VaR (CVaR) / Expected Shortfall Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate Conditional Value at Risk to assess average losses beyond VaR threshold
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="portfolioValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Portfolio Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter portfolio value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="volatility" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Portfolio Volatility (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter volatility" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confidenceLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Confidence Level (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter confidence level" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="timeHorizon" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Time Horizon (Days)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter time horizon" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Conditional VaR
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
                  <CardTitle>Conditional VaR Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.riskLevel === 'Very Low' ? 'default' : result.riskLevel === 'Low' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ${result.varValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-sm text-muted-foreground">VaR Amount</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      ${result.cvarValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-sm text-muted-foreground">CVaR Amount</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {result.cvarPercentage.toFixed(2)}%
                    </div>
                    <p className="text-sm text-muted-foreground">CVaR Percentage</p>
                  </div>
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
            Explore other essential financial metrics for comprehensive risk analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/value-at-risk-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Value at Risk</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/monte-carlo-portfolio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Monte Carlo</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/portfolio-variance-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Portfolio Variance</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/sortino-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Sortino Ratio</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Conditional VaR
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting Conditional Value at Risk
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Conditional Value at Risk (CVaR), also known as Expected Shortfall, measures the average loss beyond the VaR threshold. While VaR tells you the maximum loss at a confidence level, CVaR tells you the average loss when losses exceed VaR. This provides more comprehensive information about tail risk.
          </p>
          <p className="text-muted-foreground">
            CVaR is considered a more coherent risk measure than VaR because it captures the severity of losses beyond the VaR threshold. It's particularly valuable for understanding extreme tail risk and is widely used in portfolio optimization, risk management, and regulatory frameworks. CVaR helps investors better understand the potential magnitude of losses in worst-case scenarios.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Conditional VaR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Conditional Value at Risk (CVaR)?</h4>
              <p className="text-muted-foreground">
                Conditional Value at Risk (CVaR), also known as Expected Shortfall, measures the average loss beyond the VaR threshold. While VaR tells you the maximum loss at a confidence level, CVaR tells you the average loss when losses exceed VaR. This provides more comprehensive information about tail risk and extreme losses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate CVaR?</h4>
              <p className="text-muted-foreground">
                CVaR is calculated as the expected value of losses beyond VaR. For normal distributions, CVaR = VaR + (volatility × √time × φ(z) / (1 - confidence_level)), where φ(z) is the standard normal density function. CVaR can also be calculated using historical simulation or Monte Carlo methods for more complex distributions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between VaR and CVaR?</h4>
              <p className="text-muted-foreground">
                VaR shows the maximum loss at a confidence level, while CVaR shows the average loss beyond VaR. VaR answers "What's the worst loss I can expect?" while CVaR answers "What's the average loss when things go really bad?" CVaR provides more information about the severity of extreme losses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is CVaR considered better than VaR?</h4>
              <p className="text-muted-foreground">
                CVaR is considered more coherent because it captures the severity of losses beyond VaR, satisfies subadditivity (portfolio CVaR ≤ sum of individual CVaRs), and provides more information about tail risk. VaR can be misleading because it doesn't tell you how bad losses can be beyond the threshold.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret CVaR results?</h4>
              <p className="text-muted-foreground">
                CVaR results show the average loss beyond VaR. For example, if CVaR is $15,000 at 95% confidence, it means that when losses exceed the 95% VaR threshold, the average loss is $15,000. Lower CVaR values indicate better tail risk management and more conservative risk profiles.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the advantages of CVaR?</h4>
              <p className="text-muted-foreground">
                Advantages include: captures tail risk severity, satisfies coherence properties, provides more information than VaR, useful for portfolio optimization, better for risk management decisions, and widely accepted in regulatory frameworks. CVaR helps investors understand the potential magnitude of extreme losses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of CVaR?</h4>
              <p className="text-muted-foreground">
                Limitations include: assumes normal distribution of returns, relies on historical data and assumptions, may not capture extreme market events, computationally more complex than VaR, and results are still probabilistic estimates. Use CVaR as one tool among many for risk analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use CVaR for portfolio management?</h4>
              <p className="text-muted-foreground">
                Use CVaR to assess tail risk exposure, optimize portfolio allocation, set risk limits, evaluate investment strategies, and compare risk across different assets. CVaR helps determine appropriate position sizes, assess hedging effectiveness, and make informed decisions about risk-return trade-offs.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What confidence level should I use for CVaR?</h4>
              <p className="text-muted-foreground">
                Common confidence levels are 90%, 95%, and 99%. A 95% confidence level means CVaR shows the average loss in the worst 5% of scenarios. Higher confidence levels (99%) provide more conservative estimates but may be too restrictive. Choose based on your risk tolerance and regulatory requirements.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I update CVaR calculations?</h4>
              <p className="text-muted-foreground">
                Update CVaR calculations regularly based on your risk management needs. Daily updates are common for active trading, while weekly or monthly updates may suffice for longer-term strategies. Update when market conditions change significantly or when portfolio composition changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}