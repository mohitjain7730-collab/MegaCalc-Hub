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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Complete Guide to P/E Ratio
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
            <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
          </CardContent>
        </Card>

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