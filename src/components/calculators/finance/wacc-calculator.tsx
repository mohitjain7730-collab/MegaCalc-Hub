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
  equityValue: z.number().positive(),
  debtValue: z.number().nonnegative(),
  costOfEquity: z.number().positive(),
  costOfDebt: z.number().nonnegative(),
  taxRate: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function WACCCalculator() {
  const [result, setResult] = useState<{ 
    wacc: number; 
    interpretation: string; 
    costLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equityValue: undefined,
      debtValue: undefined,
      costOfEquity: undefined,
      costOfDebt: undefined,
      taxRate: undefined,
    },
  });

  const calculateWACC = (v: FormValues) => {
    if (v.equityValue == null || v.debtValue == null || v.costOfEquity == null || v.costOfDebt == null || v.taxRate == null) return null;
    
    const totalValue = v.equityValue + v.debtValue;
    const equityWeight = v.equityValue / totalValue;
    const debtWeight = v.debtValue / totalValue;
    const afterTaxCostOfDebt = v.costOfDebt * (1 - v.taxRate / 100);
    
    const wacc = (equityWeight * v.costOfEquity) + (debtWeight * afterTaxCostOfDebt);
    
    return wacc;
  };

  const interpret = (wacc: number) => {
    if (wacc >= 15) return 'High cost of capital - expensive financing with significant hurdle rate.';
    if (wacc >= 10) return 'Moderate cost of capital - reasonable financing costs for investments.';
    if (wacc >= 5) return 'Low cost of capital - attractive financing costs for growth opportunities.';
    if (wacc >= 0) return 'Very low cost of capital - excellent financing conditions.';
    return 'Negative cost of capital - unusual financing conditions.';
  };

  const getCostLevel = (wacc: number) => {
    if (wacc >= 15) return 'High';
    if (wacc >= 10) return 'Moderate';
    if (wacc >= 5) return 'Low';
    if (wacc >= 0) return 'Very Low';
    return 'Negative';
  };

  const getRecommendation = (wacc: number) => {
    if (wacc >= 15) return 'Focus on high-return projects - high hurdle rate requires significant returns.';
    if (wacc >= 10) return 'Balance growth and profitability - moderate hurdle rate for investments.';
    if (wacc >= 5) return 'Pursue growth opportunities - low cost of capital enables expansion.';
    if (wacc >= 0) return 'Aggressive growth strategy - very low cost of capital supports expansion.';
    return 'Review capital structure - unusual cost of capital requires analysis.';
  };

  const getStrength = (wacc: number) => {
    if (wacc >= 15) return 'Weak';
    if (wacc >= 10) return 'Moderate';
    if (wacc >= 5) return 'Strong';
    if (wacc >= 0) return 'Very Strong';
    return 'Special';
  };

  const getInsights = (wacc: number) => {
    const insights = [];
    if (wacc >= 15) {
      insights.push('High financing costs');
      insights.push('Significant hurdle rate');
      insights.push('Requires high-return projects');
    } else if (wacc >= 10) {
      insights.push('Moderate financing costs');
      insights.push('Balanced hurdle rate');
      insights.push('Suitable for growth investments');
    } else if (wacc >= 5) {
      insights.push('Low financing costs');
      insights.push('Attractive hurdle rate');
      insights.push('Supports growth opportunities');
    } else if (wacc >= 0) {
      insights.push('Very low financing costs');
      insights.push('Excellent hurdle rate');
      insights.push('Enables aggressive growth');
    } else {
      insights.push('Unusual financing conditions');
      insights.push('Requires further analysis');
      insights.push('May indicate structural issues');
    }
    return insights;
  };

  const getConsiderations = (wacc: number) => {
    const considerations = [];
    considerations.push('WACC varies by industry and market conditions');
    considerations.push('Tax benefits of debt reduce effective cost');
    considerations.push('Consider market conditions and interest rates');
    considerations.push('WACC should be used as hurdle rate for projects');
    considerations.push('Regular review ensures accuracy');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const wacc = calculateWACC(values);
    if (wacc !== null) {
      setResult({
        wacc,
        interpretation: interpret(wacc),
        costLevel: getCostLevel(wacc),
        recommendation: getRecommendation(wacc),
        strength: getStrength(wacc),
        insights: getInsights(wacc),
        considerations: getConsiderations(wacc)
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-primary" />
            <CardTitle>WACC Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate your company's Weighted Average Cost of Capital to assess financing costs and investment hurdle rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="equityValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Equity Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter equity value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="debtValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Debt Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter debt value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="costOfEquity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Cost of Equity (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter cost of equity" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="costOfDebt" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Cost of Debt (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter cost of debt" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="taxRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Tax Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter tax rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate WACC
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
                  <CardTitle>WACC Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.costLevel === 'Low' ? 'default' : result.costLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.costLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.wacc.toFixed(2)}%
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
            <Link href="/category/finance/capm-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">CAPM</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/leverage-debt-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Leverage Debt Ratio</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/enterprise-value-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Enterprise Value</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/interest-coverage-ratio-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Interest Coverage</p>
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
            Complete Guide to WACC
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting WACC
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Weighted Average Cost of Capital (WACC) is the average rate a company expects to pay to finance its assets. It's calculated by weighting the cost of equity and cost of debt by their respective proportions in the capital structure, adjusted for the tax benefits of debt.
          </p>
          <p className="text-muted-foreground">
            WACC is crucial for investment decisions, project evaluation, and company valuation. It serves as the hurdle rate for investments and helps determine whether projects will create value for shareholders. Understanding WACC is essential for corporate finance and investment analysis.
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
            Common questions about WACC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is WACC?</h4>
              <p className="text-muted-foreground">
                Weighted Average Cost of Capital (WACC) is the average rate a company expects to pay to finance its assets. It's calculated by weighting the cost of equity and cost of debt by their respective proportions in the capital structure, adjusted for the tax benefits of debt financing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate WACC?</h4>
              <p className="text-muted-foreground">
                The WACC formula is: WACC = (E/V × Re) + (D/V × Rd × (1-T)), where E is equity value, D is debt value, V is total value (E+D), Re is cost of equity, Rd is cost of debt, and T is tax rate. This weights each cost of capital by its proportion in the capital structure.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good WACC?</h4>
              <p className="text-muted-foreground">
                A good WACC depends on the industry and market conditions. Generally, WACC below 8% is considered low, 8-12% is moderate, and above 12% is high. Lower WACC indicates cheaper financing and better investment opportunities. Compare WACC to industry averages and market conditions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does WACC affect investment decisions?</h4>
              <p className="text-muted-foreground">
                WACC serves as the hurdle rate for investment decisions. Projects with returns above WACC create value for shareholders, while projects below WACC destroy value. WACC helps determine which investments to pursue and provides a benchmark for evaluating project profitability.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors influence WACC?</h4>
              <p className="text-muted-foreground">
                WACC is influenced by interest rates, market conditions, company risk profile, capital structure, tax rates, and investor expectations. Changes in any of these factors can significantly impact WACC. Regular monitoring ensures accurate investment decision-making.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does debt affect WACC?</h4>
              <p className="text-muted-foreground">
                Debt typically reduces WACC due to tax benefits (interest is tax-deductible) and lower cost compared to equity. However, excessive debt increases financial risk and can raise the cost of both debt and equity. Optimal capital structure balances these effects to minimize WACC.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of WACC?</h4>
              <p className="text-muted-foreground">
                WACC assumes constant capital structure, stable risk profile, and efficient markets. It may not reflect changing market conditions or company-specific risks. WACC is based on current market values and may not predict future financing costs accurately.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How is WACC used in valuation?</h4>
              <p className="text-muted-foreground">
                WACC is used as the discount rate in discounted cash flow (DCF) valuation models. It determines the present value of future cash flows and helps assess company value. WACC ensures that valuation reflects the company's cost of capital and risk profile.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is WACC important for companies?</h4>
              <p className="text-muted-foreground">
                WACC is crucial for companies as it guides investment decisions, capital allocation, and strategic planning. It helps determine which projects create value, assess financing options, and evaluate performance. Understanding WACC is essential for effective financial management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How often should WACC be recalculated?</h4>
              <p className="text-muted-foreground">
                WACC should be recalculated when market conditions change significantly, capital structure changes, or for major investment decisions. Regular reviews (quarterly or annually) ensure accuracy. Consider updating WACC when interest rates, market risk, or company risk profile changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}