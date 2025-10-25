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
  totalDebt: z.number().nonnegative(),
  shareholdersEquity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DebtToEquityRatioCalculator() {
  const [result, setResult] = useState<{ 
    debtToEquityRatio: number; 
    interpretation: string; 
    recommendation: string;
    leverage: string;
    riskLevel: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalDebt: undefined,
      shareholdersEquity: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.totalDebt == null || v.shareholdersEquity == null) return null;
    return v.totalDebt / v.shareholdersEquity;
  };

  const interpret = (ratio: number) => {
    if (ratio > 2) return 'High debt-to-equity ratio indicates significant financial leverage and higher risk.';
    if (ratio > 1) return 'Moderate debt-to-equity ratio suggests balanced use of debt and equity financing.';
    if (ratio > 0.5) return 'Low debt-to-equity ratio indicates conservative financial approach with lower risk.';
    return 'Very low debt-to-equity ratio suggests minimal leverage and conservative financial management.';
  };

  const getLeverage = (ratio: number) => {
    if (ratio > 2) return 'High Leverage';
    if (ratio > 1) return 'Moderate Leverage';
    if (ratio > 0.5) return 'Low Leverage';
    return 'Minimal Leverage';
  };

  const getRiskLevel = (ratio: number) => {
    if (ratio > 2) return 'Very High';
    if (ratio > 1) return 'High';
    if (ratio > 0.5) return 'Moderate';
    return 'Low';
  };

  const getInsights = (ratio: number) => {
    const insights = [];
    
    if (ratio > 2) {
      insights.push('High leverage increases financial risk and interest obligations');
      insights.push('May indicate aggressive growth strategy or financial stress');
    } else if (ratio > 1) {
      insights.push('Balanced use of debt and equity financing');
      insights.push('Moderate leverage provides growth opportunities while managing risk');
    } else if (ratio > 0.5) {
      insights.push('Conservative financial approach with lower risk');
      insights.push('May indicate strong cash position or conservative management');
    } else {
      insights.push('Very low leverage suggests minimal debt obligations');
      insights.push('May indicate strong financial position or missed growth opportunities');
    }

    if (ratio > 3) {
      insights.push('Extremely high leverage requires careful monitoring of debt obligations');
    }

    return insights;
  };

  const getConsiderations = (ratio: number) => {
    const considerations = [];
    
    considerations.push('Compare debt-to-equity ratio with industry peers and historical performance');
    considerations.push('Consider the company\'s business model and cash flow generation ability');
    considerations.push('Evaluate the cost of debt and interest coverage ratios');
    
    if (ratio > 2) {
      considerations.push('High leverage requires strong cash flow to service debt obligations');
      considerations.push('Monitor interest rates and debt refinancing risks');
    } else if (ratio < 0.5) {
      considerations.push('Low leverage may indicate conservative approach or missed growth opportunities');
      considerations.push('Consider if the company could benefit from strategic debt financing');
    }

    considerations.push('Monitor debt-to-equity trends over multiple periods');
    considerations.push('Consider the impact of debt on financial flexibility and growth potential');

    return considerations;
  };

  const recommendation = (ratio: number) => {
    if (ratio > 2) {
      return 'High leverage requires careful monitoring - ensure strong cash flow and debt service capability.';
    } else if (ratio > 1) {
      return 'Moderate leverage provides balanced risk-return profile - monitor debt service capacity.';
    } else if (ratio > 0.5) {
      return 'Low leverage indicates conservative approach - consider growth opportunities.';
    } else {
      return 'Very low leverage suggests conservative management - evaluate growth potential.';
    }
  };

  const onSubmit = (values: FormValues) => {
    const ratio = calculate(values);
    if (ratio == null) { setResult(null); return; }
    setResult({ 
      debtToEquityRatio: ratio, 
      interpretation: interpret(ratio), 
      recommendation: recommendation(ratio),
      leverage: getLeverage(ratio),
      riskLevel: getRiskLevel(ratio),
      insights: getInsights(ratio),
      considerations: getConsiderations(ratio)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Company Financials
          </CardTitle>
          <CardDescription>
            Enter the company's total debt and shareholders' equity to calculate the debt-to-equity ratio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="totalDebt" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Total Debt ($)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 2000000" 
                        {...field} 
                        value={field.value ?? ''} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                
                <FormField control={form.control} name="shareholdersEquity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Shareholders' Equity ($)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g., 5000000" 
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
                Calculate Debt-to-Equity Ratio
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
                  <CardTitle>Debt-to-Equity Ratio Analysis</CardTitle>
                  <CardDescription>Financial leverage assessment and risk insights</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Percent className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Debt-to-Equity</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.debtToEquityRatio.toFixed(2)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.leverage}
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
                    {result.debtToEquityRatio > 2 ? 'Monitor' : result.debtToEquityRatio > 1 ? 'Balanced' : 'Conservative'}
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
                  <a href="/category/finance/interest-coverage-ratio-calculator" className="text-primary hover:underline">
                    Interest Coverage Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate interest coverage ratio to assess debt service ability.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/current-ratio-calculator" className="text-primary hover:underline">
                    Current Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate current ratio to assess short-term liquidity.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/quick-ratio-calculator" className="text-primary hover:underline">
                    Quick Ratio Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate quick ratio to assess immediate liquidity position.
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
              Complete Guide to Debt-to-Equity Ratio
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
              Common questions about Debt-to-Equity Ratio analysis and financial leverage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is the Debt-to-Equity Ratio?</h4>
              <p className="text-muted-foreground">
                The debt-to-equity ratio measures the relative proportion of debt and equity used to finance a company's assets. It's calculated as Total Debt ÷ Shareholders' Equity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate the debt-to-equity ratio?</h4>
              <p className="text-muted-foreground">
                Debt-to-Equity Ratio = Total Debt ÷ Shareholders' Equity. For example, if a company has $2 million in debt and $5 million in equity, the ratio is 0.4.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's a good debt-to-equity ratio?</h4>
              <p className="text-muted-foreground">
                A good debt-to-equity ratio depends on the industry and business model. Generally, ratios below 1.0 are considered conservative, while ratios above 2.0 may indicate high leverage.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a high debt-to-equity ratio indicate?</h4>
              <p className="text-muted-foreground">
                High debt-to-equity ratio indicates significant financial leverage, higher risk, and greater dependence on debt financing. It may suggest aggressive growth strategy or financial stress.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What does a low debt-to-equity ratio indicate?</h4>
              <p className="text-muted-foreground">
                Low debt-to-equity ratio indicates conservative financial management, lower risk, and less dependence on debt financing. It may suggest strong cash position or missed growth opportunities.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can the debt-to-equity ratio be negative?</h4>
              <p className="text-muted-foreground">
                Yes, the debt-to-equity ratio can be negative when shareholders' equity is negative (deficit). This indicates severe financial distress and potential bankruptcy risk.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does leverage affect the debt-to-equity ratio?</h4>
              <p className="text-muted-foreground">
                Higher leverage increases the debt-to-equity ratio, which can amplify returns but also increases financial risk. The ratio helps assess the level of financial leverage a company uses.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the limitations of the debt-to-equity ratio?</h4>
              <p className="text-muted-foreground">
                The ratio doesn't account for the quality of debt, interest rates, or cash flow generation. It should be used alongside other financial metrics like interest coverage ratio.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I compare debt-to-equity ratios across companies?</h4>
              <p className="text-muted-foreground">
                Compare ratios within the same industry and similar business models. Consider company size, growth stage, and business model differences when making comparisons.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between debt-to-equity and debt-to-assets ratio?</h4>
              <p className="text-muted-foreground">
                Debt-to-equity compares debt to shareholders' equity, while debt-to-assets compares debt to total assets. Both measure leverage but from different perspectives.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}