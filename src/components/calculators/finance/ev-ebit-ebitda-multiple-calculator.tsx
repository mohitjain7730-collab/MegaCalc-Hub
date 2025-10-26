'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, AlertCircle, Target, Info, Landmark, DollarSign, TrendingUp, Shield, BarChart3, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  enterpriseValue: z.number().positive(),
  ebit: z.number(),
  ebitda: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EVEBITDAEBITMultipleCalculator() {
  const [result, setResult] = useState<{ 
    evEbitMultiple: number;
    evEbitdaMultiple: number;
    interpretation: string; 
    valuationLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enterpriseValue: undefined,
      ebit: undefined,
      ebitda: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.enterpriseValue == null || v.ebit == null || v.ebitda == null) return null;
    const evEbitMultiple = v.enterpriseValue / v.ebit;
    const evEbitdaMultiple = v.enterpriseValue / v.ebitda;
    return { evEbitMultiple, evEbitdaMultiple };
  };

  const interpret = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    if (evEbitMultiple <= 8 && evEbitdaMultiple <= 6) return 'Attractive valuation multiples - potentially undervalued.';
    if (evEbitMultiple <= 12 && evEbitdaMultiple <= 10) return 'Fair valuation multiples - reasonably priced.';
    if (evEbitMultiple <= 20 && evEbitdaMultiple <= 15) return 'Moderate valuation multiples - premium pricing.';
    return 'High valuation multiples - potentially overvalued.';
  };

  const getValuationLevel = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    if (evEbitMultiple <= 8 && evEbitdaMultiple <= 6) return 'Attractive';
    if (evEbitMultiple <= 12 && evEbitdaMultiple <= 10) return 'Fair';
    if (evEbitMultiple <= 20 && evEbitdaMultiple <= 15) return 'Moderate';
    return 'High';
  };

  const getRecommendation = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    if (evEbitMultiple <= 8 && evEbitdaMultiple <= 6) return 'Consider investment opportunity - attractive valuation.';
    if (evEbitMultiple <= 12 && evEbitdaMultiple <= 10) return 'Monitor for investment opportunities - fair valuation.';
    if (evEbitMultiple <= 20 && evEbitdaMultiple <= 15) return 'Exercise caution - premium valuation requires strong growth.';
    return 'Avoid investment - high valuation multiples suggest overpricing.';
  };

  const getStrength = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    if (evEbitMultiple <= 8 && evEbitdaMultiple <= 6) return 'Very Strong';
    if (evEbitMultiple <= 12 && evEbitdaMultiple <= 10) return 'Strong';
    if (evEbitMultiple <= 20 && evEbitdaMultiple <= 15) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    const insights = [];
    if (evEbitMultiple <= 8 && evEbitdaMultiple <= 6) {
      insights.push('Attractive valuation opportunity');
      insights.push('Strong operational performance');
      insights.push('Potential for value appreciation');
    } else if (evEbitMultiple <= 12 && evEbitdaMultiple <= 10) {
      insights.push('Fair market valuation');
      insights.push('Balanced risk-return profile');
      insights.push('Reasonable investment opportunity');
    } else if (evEbitMultiple <= 20 && evEbitdaMultiple <= 15) {
      insights.push('Premium valuation pricing');
      insights.push('High growth expectations');
      insights.push('Requires strong performance');
    } else {
      insights.push('High valuation multiples');
      insights.push('Significant growth expectations');
      insights.push('High risk investment');
    }
    return insights;
  };

  const getConsiderations = (evEbitMultiple: number, evEbitdaMultiple: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Growth companies typically have higher multiples');
    considerations.push('Mature companies usually have lower multiples');
    considerations.push('Compare with historical performance');
    considerations.push('Consider market conditions and interest rates');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const multiples = calculate(values);
    if (multiples !== null) {
      setResult({
        evEbitMultiple: multiples.evEbitMultiple,
        evEbitdaMultiple: multiples.evEbitdaMultiple,
        interpretation: interpret(multiples.evEbitMultiple, multiples.evEbitdaMultiple),
        valuationLevel: getValuationLevel(multiples.evEbitMultiple, multiples.evEbitdaMultiple),
        recommendation: getRecommendation(multiples.evEbitMultiple, multiples.evEbitdaMultiple),
        strength: getStrength(multiples.evEbitMultiple, multiples.evEbitdaMultiple),
        insights: getInsights(multiples.evEbitMultiple, multiples.evEbitdaMultiple),
        considerations: getConsiderations(multiples.evEbitMultiple, multiples.evEbitdaMultiple)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle>EV / EBIT and EV / EBITDA Multiple Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate enterprise value multiples to assess valuation and investment attractiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="enterpriseValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Enterprise Value
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter enterprise value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ebit" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      EBIT (Earnings Before Interest & Taxes)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter EBIT" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="ebitda" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      EBITDA (Earnings Before Interest, Taxes, Depreciation & Amortization)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter EBITDA" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate EV Multiples
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
                  <CardTitle>EV Multiple Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.valuationLevel === 'Attractive' ? 'default' : result.valuationLevel === 'Fair' ? 'secondary' : 'destructive'}>
                    {result.valuationLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {result.evEbitMultiple.toFixed(2)}x
                    </div>
                    <p className="text-sm text-muted-foreground">EV/EBIT Multiple</p>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {result.evEbitdaMultiple.toFixed(2)}x
                    </div>
                    <p className="text-sm text-muted-foreground">EV/EBITDA Multiple</p>
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
            Explore other essential financial metrics for comprehensive business analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/category/finance/enterprise-value-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Enterprise Value</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/ebitda-ebit-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">EBITDA/EBIT</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/free-cash-flow-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Free Cash Flow</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/operating-margin-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Operating Margin</p>
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
            Complete Guide to EV Multiples
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting EV multiples
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            EV multiples are valuation ratios that compare Enterprise Value to various financial metrics like EBIT and EBITDA. These multiples help assess whether a company is undervalued or overvalued relative to its operational performance. They are widely used in financial analysis, M&A transactions, and investment decisions.
          </p>
          <p className="text-muted-foreground">
            EV/EBIT and EV/EBITDA multiples provide insight into how much investors are willing to pay for each dollar of operating earnings. Lower multiples suggest better value, while higher multiples indicate premium pricing or high growth expectations.
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
            Common questions about EV Multiples
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What are EV Multiples?</h4>
              <p className="text-muted-foreground">
                EV multiples are valuation ratios that compare Enterprise Value to various financial metrics like EBIT and EBITDA. Common multiples include EV/EBIT and EV/EBITDA. These ratios help assess whether a company is undervalued or overvalued relative to its operational performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate EV/EBIT and EV/EBITDA multiples?</h4>
              <p className="text-muted-foreground">
                EV/EBIT = Enterprise Value ÷ EBIT. EV/EBITDA = Enterprise Value ÷ EBITDA. Enterprise Value is calculated as Market Cap + Total Debt - Cash. EBIT and EBITDA are found on the income statement. These multiples show how many times the operational earnings the company is valued at.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are considered good EV multiples?</h4>
              <p className="text-muted-foreground">
                Good EV multiples vary by industry. Generally, EV/EBIT below 10x and EV/EBITDA below 8x are considered attractive. EV/EBIT below 15x and EV/EBITDA below 12x are fair. Higher multiples suggest premium pricing or high growth expectations. Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What do high EV multiples mean?</h4>
              <p className="text-muted-foreground">
                High EV multiples indicate that investors are paying a premium for the company's earnings. This can suggest high growth expectations, strong competitive position, or potential overvaluation. High multiples require strong future performance to justify the premium pricing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What do low EV multiples mean?</h4>
              <p className="text-muted-foreground">
                Low EV multiples suggest that investors are paying less for the company's earnings, potentially indicating undervaluation, lower growth expectations, or higher risk. Low multiples can present investment opportunities if the company's fundamentals are strong.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do EV multiples vary by industry?</h4>
              <p className="text-muted-foreground">
                EV multiples vary significantly by industry. Technology companies often have higher multiples due to growth potential. Mature industries like utilities typically have lower multiples. Capital-intensive industries may have different multiples due to depreciation differences. Always compare within the same industry.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of EV multiples?</h4>
              <p className="text-muted-foreground">
                EV multiples don't account for growth rates, competitive position, or future prospects. They're based on current earnings and may not reflect cyclical or one-time factors. They don't consider the quality of earnings or management effectiveness. Use in conjunction with other metrics for comprehensive analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do investors use EV multiples?</h4>
              <p className="text-muted-foreground">
                Investors use EV multiples to identify undervalued or overvalued companies, compare companies with different capital structures, and assess investment opportunities. They help determine fair value and make buy/sell decisions. EV multiples are particularly useful for M&A analysis and portfolio construction.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use EV multiples?</h4>
              <p className="text-muted-foreground">
                Creditors use EV multiples to assess the company's valuation and debt capacity. Higher EV multiples suggest more assets available to creditors. They help determine appropriate lending terms and assess credit risk. EV multiples are also used in debt restructuring and covenant calculations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between EV/EBIT and EV/EBITDA?</h4>
              <p className="text-muted-foreground">
                EV/EBIT includes depreciation and amortization in the denominator, while EV/EBITDA excludes them. EV/EBITDA is more commonly used as it's less affected by accounting policies and capital structure. EV/EBIT provides a more conservative view of valuation. Both metrics are useful for different analytical purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}