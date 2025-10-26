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
  initialValue: z.number().positive(),
  expectedReturn: z.number(),
  volatility: z.number().positive(),
  timeHorizon: z.number().positive(),
  simulations: z.number().min(100).max(10000),
});

type FormValues = z.infer<typeof formSchema>;

export default function MonteCarloPortfolioCalculator() {
  const [result, setResult] = useState<{ 
    meanValue: number;
    medianValue: number;
    percentile95: number;
    percentile5: number;
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
      initialValue: undefined,
      expectedReturn: undefined,
      volatility: undefined,
      timeHorizon: undefined,
      simulations: 1000,
    },
  });

  const runMonteCarloSimulation = (v: FormValues) => {
    if (v.initialValue == null || v.expectedReturn == null || v.volatility == null || v.timeHorizon == null) return null;
    
    const results = [];
    const dt = 1/252; // Daily time step (assuming 252 trading days per year)
    const steps = Math.floor(v.timeHorizon * 252);
    
    for (let i = 0; i < v.simulations; i++) {
      let value = v.initialValue;
      
      for (let j = 0; j < steps; j++) {
        // Generate random return using log-normal distribution
        const randomReturn = (v.expectedReturn / 100) * dt + (v.volatility / 100) * Math.sqrt(dt) * (Math.random() - 0.5) * Math.sqrt(12);
        value *= (1 + randomReturn);
      }
      
      results.push(value);
    }
    
    // Sort results for percentile calculations
    results.sort((a, b) => a - b);
    
    const meanValue = results.reduce((sum, val) => sum + val, 0) / results.length;
    const medianValue = results[Math.floor(results.length / 2)];
    const percentile95 = results[Math.floor(results.length * 0.95)];
    const percentile5 = results[Math.floor(results.length * 0.05)];
    
    return { meanValue, medianValue, percentile95, percentile5 };
  };

  const interpret = (meanValue: number, initialValue: number, percentile5: number, percentile95: number) => {
    const expectedReturn = ((meanValue - initialValue) / initialValue) * 100;
    const downsideRisk = ((initialValue - percentile5) / initialValue) * 100;
    
    if (expectedReturn >= 10 && downsideRisk <= 20) return 'Strong growth potential with manageable downside risk - excellent risk-return profile.';
    if (expectedReturn >= 5 && downsideRisk <= 30) return 'Moderate growth potential with reasonable downside risk - good risk-return profile.';
    if (expectedReturn >= 0 && downsideRisk <= 40) return 'Conservative growth with higher downside risk - moderate risk-return profile.';
    return 'Limited growth potential with significant downside risk - high-risk profile.';
  };

  const getRiskLevel = (percentile5: number, initialValue: number) => {
    const downsideRisk = ((initialValue - percentile5) / initialValue) * 100;
    if (downsideRisk <= 20) return 'Low';
    if (downsideRisk <= 40) return 'Moderate';
    return 'High';
  };

  const getRecommendation = (meanValue: number, initialValue: number, percentile5: number) => {
    const expectedReturn = ((meanValue - initialValue) / initialValue) * 100;
    const downsideRisk = ((initialValue - percentile5) / initialValue) * 100;
    
    if (expectedReturn >= 10 && downsideRisk <= 20) return 'Maintain current strategy - excellent risk-return profile.';
    if (expectedReturn >= 5 && downsideRisk <= 30) return 'Consider minor adjustments - good risk-return profile.';
    if (expectedReturn >= 0 && downsideRisk <= 40) return 'Review risk management - moderate risk-return profile.';
    return 'Consider reducing risk exposure - high-risk profile requires attention.';
  };

  const getStrength = (meanValue: number, initialValue: number, percentile5: number) => {
    const expectedReturn = ((meanValue - initialValue) / initialValue) * 100;
    const downsideRisk = ((initialValue - percentile5) / initialValue) * 100;
    
    if (expectedReturn >= 10 && downsideRisk <= 20) return 'Very Strong';
    if (expectedReturn >= 5 && downsideRisk <= 30) return 'Strong';
    if (expectedReturn >= 0 && downsideRisk <= 40) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (meanValue: number, initialValue: number, percentile5: number, percentile95: number) => {
    const insights = [];
    const expectedReturn = ((meanValue - initialValue) / initialValue) * 100;
    const downsideRisk = ((initialValue - percentile5) / initialValue) * 100;
    const upsidePotential = ((percentile95 - initialValue) / initialValue) * 100;
    
    if (expectedReturn >= 10) {
      insights.push('Strong expected growth');
      insights.push('High return potential');
    } else if (expectedReturn >= 5) {
      insights.push('Moderate expected growth');
      insights.push('Good return potential');
    } else {
      insights.push('Conservative expected growth');
      insights.push('Limited return potential');
    }
    
    if (downsideRisk <= 20) {
      insights.push('Low downside risk');
      insights.push('Stable value preservation');
    } else if (downsideRisk <= 40) {
      insights.push('Moderate downside risk');
      insights.push('Reasonable value preservation');
    } else {
      insights.push('High downside risk');
      insights.push('Significant value volatility');
    }
    
    insights.push(`Upside potential: ${upsidePotential.toFixed(1)}%`);
    return insights;
  };

  const getConsiderations = (simulations: number) => {
    const considerations = [];
    considerations.push('Monte Carlo results are probabilistic estimates');
    considerations.push('More simulations provide better accuracy');
    considerations.push('Results assume normal distribution of returns');
    considerations.push('Past performance may not predict future results');
    considerations.push('Consider market conditions and economic factors');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const simulation = runMonteCarloSimulation(values);
    if (simulation !== null) {
    setResult({
        meanValue: simulation.meanValue,
        medianValue: simulation.medianValue,
        percentile95: simulation.percentile95,
        percentile5: simulation.percentile5,
        interpretation: interpret(simulation.meanValue, values.initialValue, simulation.percentile5, simulation.percentile95),
        riskLevel: getRiskLevel(simulation.percentile5, values.initialValue),
        recommendation: getRecommendation(simulation.meanValue, values.initialValue, simulation.percentile5),
        strength: getStrength(simulation.meanValue, values.initialValue, simulation.percentile5),
        insights: getInsights(simulation.meanValue, values.initialValue, simulation.percentile5, simulation.percentile95),
        considerations: getConsiderations(values.simulations)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <CardTitle>Monte Carlo Simulation for Portfolio Value Calculator</CardTitle>
          </div>
          <CardDescription>
            Run Monte Carlo simulations to project portfolio value distributions and assess risk scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="initialValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Initial Portfolio Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter initial value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="expectedReturn" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Expected Annual Return (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter expected return" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="volatility" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Annual Volatility (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter volatility" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="timeHorizon" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Time Horizon (Years)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter time horizon" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="simulations" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Number of Simulations
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter simulations" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
          </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Run Monte Carlo Simulation
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
                  <CardTitle>Monte Carlo Simulation Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.riskLevel === 'Low' ? 'default' : result.riskLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.riskLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ${result.meanValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-sm text-muted-foreground">Expected Value (Mean)</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      ${result.medianValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-sm text-muted-foreground">Median Value</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      ${result.percentile95.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-sm text-muted-foreground">95th Percentile (Best Case)</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      ${result.percentile5.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <p className="text-sm text-muted-foreground">5th Percentile (Worst Case)</p>
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
            Explore other essential financial metrics for comprehensive portfolio analysis
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
            <Link href="/category/finance/conditional-value-at-risk-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Conditional VaR</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/portfolio-variance-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Portfolio Variance</p>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Monte Carlo Simulation
          </CardTitle>
          <CardDescription>
            Everything you need to know about Monte Carlo portfolio simulation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Monte Carlo simulation is a computational technique that uses random sampling to model the probability distribution of portfolio outcomes. By running thousands of simulations with different random scenarios, it provides insights into potential portfolio performance, risk levels, and the range of possible outcomes.
          </p>
          <p className="text-muted-foreground">
            This method is particularly valuable for portfolio planning, risk assessment, and scenario analysis. It helps investors understand not just expected returns, but the full distribution of possible outcomes, including worst-case and best-case scenarios. Monte Carlo simulation is essential for comprehensive portfolio risk management.
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
            Common questions about Monte Carlo Simulation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Monte Carlo simulation?</h4>
              <p className="text-muted-foreground">
                Monte Carlo simulation is a computational technique that uses random sampling to model the probability distribution of portfolio outcomes. By running thousands of simulations with different random scenarios, it provides insights into potential portfolio performance, risk levels, and the range of possible outcomes over time.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does Monte Carlo simulation work?</h4>
              <p className="text-muted-foreground">
                The simulation generates thousands of possible future scenarios by randomly sampling from probability distributions of returns. Each scenario follows a different path based on random variations in market returns. The results are aggregated to show the distribution of possible outcomes, including percentiles and probabilities.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How many simulations should I run?</h4>
              <p className="text-muted-foreground">
                More simulations provide better accuracy and smoother distributions. Generally, 1,000-10,000 simulations provide good results for most purposes. For very precise analysis, use 50,000+ simulations. Balance accuracy needs with computational time and resources.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What do the percentiles mean?</h4>
              <p className="text-muted-foreground">
                Percentiles show the range of possible outcomes. The 5th percentile represents the worst-case scenario (5% chance of worse outcomes), the 50th percentile is the median, and the 95th percentile represents the best-case scenario (5% chance of better outcomes). This helps assess downside risk and upside potential.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How accurate are Monte Carlo results?</h4>
              <p className="text-muted-foreground">
                Monte Carlo results are probabilistic estimates based on input assumptions. Accuracy depends on the quality of input parameters (expected returns, volatility) and the number of simulations. Results assume normal distribution of returns and may not capture extreme market events or structural changes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of Monte Carlo simulation?</h4>
              <p className="text-muted-foreground">
                Limitations include: assumes normal distribution of returns, doesn't predict specific market events, relies on historical data and assumptions, may not capture tail risks or extreme events, and results are probabilistic rather than deterministic. Use as one tool among many for portfolio analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret Monte Carlo results?</h4>
              <p className="text-muted-foreground">
                Focus on the distribution of outcomes rather than single point estimates. Compare percentiles to assess risk levels, examine the range between worst-case and best-case scenarios, and consider the probability of achieving your financial goals. Use results to inform risk management and portfolio allocation decisions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can I use Monte Carlo for portfolio planning?</h4>
              <p className="text-muted-foreground">
                Use Monte Carlo to assess the probability of achieving financial goals, evaluate different asset allocation strategies, determine appropriate risk levels, and plan for retirement or other long-term objectives. Run multiple scenarios with different assumptions to understand sensitivity to key parameters.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What inputs are most important?</h4>
              <p className="text-muted-foreground">
                Expected return and volatility are the most critical inputs, as they drive the simulation results. Time horizon affects the range of outcomes, while the number of simulations affects accuracy. Ensure inputs are realistic and based on historical data or reasonable assumptions about future market conditions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should I run Monte Carlo simulations?</h4>
              <p className="text-muted-foreground">
                Run simulations when market conditions change significantly, when adjusting portfolio allocation, or when reviewing financial goals. Regular updates (quarterly or annually) help ensure assumptions remain relevant. Consider running multiple scenarios to understand sensitivity to different market conditions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}