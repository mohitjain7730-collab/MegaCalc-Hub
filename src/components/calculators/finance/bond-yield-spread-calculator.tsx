'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, Activity, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  bondYield: z.number().nonnegative(),
  benchmarkYield: z.number().nonnegative(),
  bondType: z.enum(['corporate', 'municipal', 'treasury', 'other']),
});

type FormValues = z.infer<typeof formSchema>;

export default function BondYieldSpreadCalculator() {
  const [result, setResult] = useState<{ 
    yieldSpread: number;
    interpretation: string; 
    spreadLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bondYield: undefined,
      benchmarkYield: undefined,
      bondType: 'corporate',
    },
  });

  const calculateYieldSpread = (values: FormValues): number => {
    return values.bondYield - values.benchmarkYield;
  };

  const interpret = (yieldSpread: number, bondType: string) => {
    if (bondType === 'corporate') {
      if (yieldSpread >= 300) return `Very wide corporate spread of ${yieldSpread.toFixed(0)} basis points - high credit risk premium.`;
      if (yieldSpread >= 150) return `Wide corporate spread of ${yieldSpread.toFixed(0)} basis points - elevated credit risk.`;
      if (yieldSpread >= 50) return `Moderate corporate spread of ${yieldSpread.toFixed(0)} basis points - reasonable credit risk.`;
      if (yieldSpread >= 0) return `Narrow corporate spread of ${yieldSpread.toFixed(0)} basis points - low credit risk.`;
      return `Negative corporate spread of ${yieldSpread.toFixed(0)} basis points - unusual market conditions.`;
    } else if (bondType === 'municipal') {
      if (yieldSpread >= 200) return `Very wide municipal spread of ${yieldSpread.toFixed(0)} basis points - high credit risk premium.`;
      if (yieldSpread >= 100) return `Wide municipal spread of ${yieldSpread.toFixed(0)} basis points - elevated credit risk.`;
      if (yieldSpread >= 25) return `Moderate municipal spread of ${yieldSpread.toFixed(0)} basis points - reasonable credit risk.`;
      if (yieldSpread >= 0) return `Narrow municipal spread of ${yieldSpread.toFixed(0)} basis points - low credit risk.`;
      return `Negative municipal spread of ${yieldSpread.toFixed(0)} basis points - unusual market conditions.`;
    } else {
      if (yieldSpread >= 200) return `Very wide spread of ${yieldSpread.toFixed(0)} basis points - high risk premium.`;
      if (yieldSpread >= 100) return `Wide spread of ${yieldSpread.toFixed(0)} basis points - elevated risk.`;
      if (yieldSpread >= 25) return `Moderate spread of ${yieldSpread.toFixed(0)} basis points - reasonable risk.`;
      if (yieldSpread >= 0) return `Narrow spread of ${yieldSpread.toFixed(0)} basis points - low risk.`;
      return `Negative spread of ${yieldSpread.toFixed(0)} basis points - unusual market conditions.`;
    }
  };

  const getSpreadLevel = (yieldSpread: number, bondType: string) => {
    if (bondType === 'corporate') {
      if (yieldSpread >= 300) return 'Very Wide';
      if (yieldSpread >= 150) return 'Wide';
      if (yieldSpread >= 50) return 'Moderate';
      if (yieldSpread >= 0) return 'Narrow';
      return 'Negative';
    } else if (bondType === 'municipal') {
      if (yieldSpread >= 200) return 'Very Wide';
      if (yieldSpread >= 100) return 'Wide';
      if (yieldSpread >= 25) return 'Moderate';
      if (yieldSpread >= 0) return 'Narrow';
      return 'Negative';
    } else {
      if (yieldSpread >= 200) return 'Very Wide';
      if (yieldSpread >= 100) return 'Wide';
      if (yieldSpread >= 25) return 'Moderate';
      if (yieldSpread >= 0) return 'Narrow';
      return 'Negative';
    }
  };

  const getRecommendation = (yieldSpread: number, bondType: string) => {
    if (bondType === 'corporate') {
      if (yieldSpread >= 300) return 'Very wide spread indicates high credit risk - evaluate credit quality carefully.';
      if (yieldSpread >= 150) return 'Wide spread suggests elevated credit risk - assess credit fundamentals.';
      if (yieldSpread >= 50) return 'Moderate spread indicates reasonable credit risk - suitable for risk-tolerant investors.';
      if (yieldSpread >= 0) return 'Narrow spread suggests low credit risk - good for conservative investors.';
      return 'Negative spread indicates unusual conditions - investigate market dynamics.';
    } else if (bondType === 'municipal') {
      if (yieldSpread >= 200) return 'Very wide municipal spread indicates high credit risk - evaluate municipal credit quality.';
      if (yieldSpread >= 100) return 'Wide municipal spread suggests elevated credit risk - assess municipal fundamentals.';
      if (yieldSpread >= 25) return 'Moderate municipal spread indicates reasonable credit risk - consider tax benefits.';
      if (yieldSpread >= 0) return 'Narrow municipal spread suggests low credit risk - attractive for tax-sensitive investors.';
      return 'Negative municipal spread indicates unusual conditions - investigate market dynamics.';
    } else {
      if (yieldSpread >= 200) return 'Very wide spread indicates high risk premium - evaluate risk factors carefully.';
      if (yieldSpread >= 100) return 'Wide spread suggests elevated risk - assess underlying factors.';
      if (yieldSpread >= 25) return 'Moderate spread indicates reasonable risk - suitable for balanced portfolios.';
      if (yieldSpread >= 0) return 'Narrow spread suggests low risk - good for conservative strategies.';
      return 'Negative spread indicates unusual conditions - investigate market dynamics.';
    }
  };

  const getStrength = (yieldSpread: number, bondType: string) => {
    if (bondType === 'corporate') {
      if (yieldSpread >= 300) return 'Weak';
      if (yieldSpread >= 150) return 'Moderate';
      if (yieldSpread >= 50) return 'Good';
      if (yieldSpread >= 0) return 'Strong';
      return 'Special';
    } else if (bondType === 'municipal') {
      if (yieldSpread >= 200) return 'Weak';
      if (yieldSpread >= 100) return 'Moderate';
      if (yieldSpread >= 25) return 'Good';
      if (yieldSpread >= 0) return 'Strong';
      return 'Special';
    } else {
      if (yieldSpread >= 200) return 'Weak';
      if (yieldSpread >= 100) return 'Moderate';
      if (yieldSpread >= 25) return 'Good';
      if (yieldSpread >= 0) return 'Strong';
      return 'Special';
    }
  };

  const getInsights = (yieldSpread: number, bondType: string) => {
    const insights = [];
    
    if (yieldSpread > 0) {
      insights.push('Positive yield spread');
      insights.push('Higher yield than benchmark');
      insights.push('Credit risk premium');
    } else if (yieldSpread < 0) {
      insights.push('Negative yield spread');
      insights.push('Lower yield than benchmark');
      insights.push('Unusual market conditions');
    } else {
      insights.push('Zero yield spread');
      insights.push('Equal yield to benchmark');
      insights.push('No credit risk premium');
    }
    
    if (bondType === 'corporate') {
      insights.push('Corporate bond characteristics');
      insights.push('Credit risk assessment needed');
    } else if (bondType === 'municipal') {
      insights.push('Municipal bond characteristics');
      insights.push('Tax-exempt considerations');
    } else {
      insights.push('Other bond characteristics');
      insights.push('Risk assessment needed');
    }
    
    insights.push(`${yieldSpread.toFixed(0)} basis point spread`);
    insights.push('Relative value analysis');
    
    return insights;
  };

  const getConsiderations = (yieldSpread: number, bondType: string) => {
    const considerations = [];
    considerations.push('Yield spreads change with market conditions');
    considerations.push('Consider credit quality and default risk');
    considerations.push('Evaluate liquidity and market access');
    considerations.push('Compare to historical spread levels');
    considerations.push('Assess economic and market outlook');
    if (bondType === 'municipal') {
      considerations.push('Consider tax-equivalent yield');
    }
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const yieldSpread = calculateYieldSpread(values);
    setResult({
      yieldSpread,
      interpretation: interpret(yieldSpread, values.bondType),
      spreadLevel: getSpreadLevel(yieldSpread, values.bondType),
      recommendation: getRecommendation(yieldSpread, values.bondType),
      strength: getStrength(yieldSpread, values.bondType),
      insights: getInsights(yieldSpread, values.bondType),
      considerations: getConsiderations(yieldSpread, values.bondType)
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle>Bond Yield Spread Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate yield spreads to assess relative value and credit risk premium between bonds and benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="bondYield" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Bond Yield (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter bond yield" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="benchmarkYield" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Benchmark Yield (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter benchmark yield" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bondType" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Bond Type
                    </FormLabel>
                    <FormControl>
                      <select {...field} className="w-full p-2 border rounded-md">
                        <option value="corporate">Corporate</option>
                        <option value="municipal">Municipal</option>
                        <option value="treasury">Treasury</option>
                        <option value="other">Other</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Yield Spread
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
                  <CardTitle>Yield Spread Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.spreadLevel === 'Narrow' ? 'default' : result.spreadLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.spreadLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.yieldSpread.toFixed(0)} bps
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
            Explore other essential financial metrics for comprehensive bond analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/bond-yield-to-maturity-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Percent className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Yield to Maturity</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/bond-price-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Bond Price</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/bond-duration-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Bond Duration</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/bond-convexity-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Bond Convexity</p>
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
            Complete Guide to Yield Spreads
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting yield spreads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Yield spreads measure the difference between the yield of a bond and a benchmark yield, typically expressed in basis points. They represent the additional compensation investors demand for taking on additional risk compared to the benchmark. Spreads are crucial for relative value analysis and credit risk assessment.
          </p>
          <p className="text-muted-foreground">
            Understanding yield spreads helps investors identify opportunities, assess credit risk, and make informed investment decisions. Spreads vary by bond type, credit quality, maturity, and market conditions. They provide insights into market sentiment, credit conditions, and relative value opportunities in the bond market.
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
            Common questions about Yield Spreads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a yield spread?</h4>
              <p className="text-muted-foreground">
                A yield spread is the difference between the yield of a bond and a benchmark yield, typically expressed in basis points (bps). It represents the additional compensation investors demand for taking on additional risk compared to the benchmark. Spreads are used for relative value analysis and credit risk assessment.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate yield spread?</h4>
              <p className="text-muted-foreground">
                Yield spread is calculated as: Bond Yield - Benchmark Yield. The result is typically expressed in basis points (1% = 100 basis points). For example, if a corporate bond yields 5.5% and the Treasury benchmark yields 3.0%, the spread is 250 basis points (5.5% - 3.0% = 2.5% = 250 bps).
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are common benchmark yields?</h4>
              <p className="text-muted-foreground">
                Common benchmarks include Treasury securities (for credit spreads), LIBOR/SOFR (for floating-rate notes), and sector-specific indices. Treasury yields are most commonly used for corporate and municipal bonds. The benchmark should match the bond's maturity and characteristics for accurate comparison.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What do different spread levels indicate?</h4>
              <p className="text-muted-foreground">
                Wider spreads indicate higher perceived risk and demand for additional compensation. Narrow spreads suggest lower risk and strong credit quality. Spread levels vary by bond type: corporate spreads are typically wider than municipal spreads, and both vary by credit rating and market conditions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do spreads change over time?</h4>
              <p className="text-muted-foreground">
                Spreads fluctuate based on market conditions, credit quality changes, economic outlook, and investor sentiment. During economic stress, spreads typically widen as investors demand higher compensation for risk. During stable periods, spreads may narrow as risk appetite increases.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors affect yield spreads?</h4>
              <p className="text-muted-foreground">
                Key factors include credit quality, maturity, liquidity, market conditions, economic outlook, and investor sentiment. Higher credit risk typically results in wider spreads, while longer maturities and lower liquidity also contribute to wider spreads. Market conditions and economic factors affect all spreads.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use spreads for investment decisions?</h4>
              <p className="text-muted-foreground">
                Use spreads to identify relative value opportunities, assess credit risk, compare bonds with different characteristics, and time market entry. Compare current spreads to historical levels to identify opportunities. Consider whether spreads adequately compensate for the additional risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the different types of spreads?</h4>
              <p className="text-muted-foreground">
                Common types include credit spreads (corporate vs Treasury), sector spreads (different industries), maturity spreads (different maturities), and quality spreads (different credit ratings). Each type provides insights into specific risk factors and market conditions affecting bond pricing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret negative spreads?</h4>
              <p className="text-muted-foreground">
                Negative spreads indicate that the bond yields less than the benchmark, which is unusual and may signal market inefficiencies, special circumstances, or temporary market conditions. Investigate the reasons for negative spreads, as they may present arbitrage opportunities or indicate underlying issues.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why are yield spreads important for portfolio management?</h4>
              <p className="text-muted-foreground">
                Yield spreads are crucial for portfolio management as they help assess relative value, manage credit risk, optimize portfolio allocation, and identify market opportunities. Understanding spreads helps construct balanced portfolios that appropriately compensate for risk while meeting return objectives.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}