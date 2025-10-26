'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, TrendingDown, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const formSchema = z.object({
  dio: z.number().positive(),
  dso: z.number().positive(),
  dpo: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CashConversionCycleCalculator() {
  const [result, setResult] = useState<{ 
    ccc: number; 
    interpretation: string; 
    efficiencyLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dio: undefined,
      dso: undefined,
      dpo: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.dio == null || v.dso == null || v.dpo == null) return null;
    return v.dio + v.dso - v.dpo;
  };

  const interpret = (ccc: number) => {
    if (ccc <= 0) return 'Excellent cash conversion efficiency with negative cycle.';
    if (ccc <= 30) return 'Very good cash conversion efficiency with short cycle.';
    if (ccc <= 60) return 'Good cash conversion efficiency with moderate cycle.';
    if (ccc <= 90) return 'Adequate cash conversion but monitor efficiency improvements.';
    return 'Poor cash conversion efficiency with long cycle requiring attention.';
  };

  const getEfficiencyLevel = (ccc: number) => {
    if (ccc <= 0) return 'Excellent';
    if (ccc <= 30) return 'Very Good';
    if (ccc <= 60) return 'Good';
    if (ccc <= 90) return 'Moderate';
    return 'Poor';
  };

  const getRecommendation = (ccc: number) => {
    if (ccc <= 0) return 'Maintain current efficiency and consider strategic investments.';
    if (ccc <= 30) return 'Continue monitoring and consider minor optimizations.';
    if (ccc <= 60) return 'Focus on improving inventory turnover and receivables collection.';
    if (ccc <= 90) return 'Urgent need to optimize working capital management processes.';
    return 'Critical situation - immediate working capital optimization required.';
  };

  const getStrength = (ccc: number) => {
    if (ccc <= 0) return 'Very Strong';
    if (ccc <= 30) return 'Strong';
    if (ccc <= 60) return 'Moderate';
    if (ccc <= 90) return 'Weak';
    return 'Very Weak';
  };

  const getInsights = (ccc: number) => {
    const insights = [];
    if (ccc <= 0) {
      insights.push('Exceptional working capital efficiency');
      insights.push('Company generates cash before paying suppliers');
      insights.push('Strong competitive advantage in cash management');
    } else if (ccc <= 30) {
      insights.push('Excellent cash conversion efficiency');
      insights.push('Low working capital requirements');
      insights.push('Strong operational cash flow generation');
    } else if (ccc <= 60) {
      insights.push('Good cash conversion efficiency');
      insights.push('Reasonable working capital management');
      insights.push('Room for operational improvements');
    } else if (ccc <= 90) {
      insights.push('Adequate but not optimal efficiency');
      insights.push('Monitor cash flow timing closely');
      insights.push('Consider working capital optimization strategies');
    } else {
      insights.push('Poor cash conversion efficiency');
      insights.push('High working capital requirements');
      insights.push('Urgent need for operational improvements');
    }
    return insights;
  };

  const getConsiderations = (ccc: number) => {
    const considerations = [];
    considerations.push('Industry benchmarks vary significantly');
    considerations.push('Seasonal businesses may have fluctuating cycles');
    considerations.push('Business model affects optimal cycle length');
    considerations.push('Compare with historical performance');
    considerations.push('Consider supply chain and customer payment terms');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const ccc = calculate(values);
    if (ccc !== null) {
      setResult({
        ccc,
        interpretation: interpret(ccc),
        efficiencyLevel: getEfficiencyLevel(ccc),
        recommendation: getRecommendation(ccc),
        strength: getStrength(ccc),
        insights: getInsights(ccc),
        considerations: getConsiderations(ccc)
      });
    }
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Financial Parameters
          </CardTitle>
          <CardDescription>
            Enter your company's cash conversion cycle components to calculate CCC
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="dio" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Days Inventory Outstanding (DIO)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 45" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="dso" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Days Sales Outstanding (DSO)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 30" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="dpo" 
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Days Payable Outstanding (DPO)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 60" 
                          {...field} 
                          value={field.value ?? ''} 
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
                Calculate Cash Conversion Cycle
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
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Cash Conversion Cycle (CCC)</CardTitle>
                  <CardDescription>Working Capital Efficiency Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className={`text-4xl font-bold ${result.ccc <= 30 ? 'text-primary' : result.ccc <= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {result.ccc.toFixed(0)} days
                </p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Efficiency Level</p>
                  <Badge variant={result.efficiencyLevel === 'Excellent' ? 'default' : result.efficiencyLevel === 'Very Good' ? 'secondary' : result.efficiencyLevel === 'Good' ? 'outline' : 'destructive'}>
                    {result.efficiencyLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Financial Strength</p>
                  <Badge variant={result.strength === 'Very Strong' ? 'default' : result.strength === 'Strong' ? 'secondary' : result.strength === 'Moderate' ? 'outline' : 'destructive'}>
                    {result.strength}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Cycle Length</p>
                  <p className="text-lg font-bold">{result.ccc.toFixed(0)} days</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Strengths & Opportunities</h4>
                  <ul className="space-y-1 text-sm">
                    {result.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">Important Considerations</h4>
                  <ul className="space-y-1 text-sm">
                    {result.considerations.map((consideration, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{consideration}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>
            Explore other working capital and efficiency analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/working-capital-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Working Capital</p>
                      <p className="text-sm text-muted-foreground">Operational liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/current-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Current Ratio</p>
                      <p className="text-sm text-muted-foreground">Short-term liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/quick-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Quick Ratio</p>
                      <p className="text-sm text-muted-foreground">Acid-test liquidity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/interest-coverage-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Interest Coverage Ratio</p>
                      <p className="text-sm text-muted-foreground">Debt servicing capability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/free-cash-flow-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Free Cash Flow</p>
                      <p className="text-sm text-muted-foreground">Cash generation analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/debt-to-equity-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Debt-to-Equity Ratio</p>
                      <p className="text-sm text-muted-foreground">Capital structure analysis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Complete Guide to Cash Conversion Cycle
          </CardTitle>
          <CardDescription>
            Comprehensive understanding of working capital efficiency analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              The Cash Conversion Cycle (CCC) is a critical metric that measures how efficiently a company manages its working capital and converts its investments into cash flows. This comprehensive guide will help you understand how to calculate, interpret, and use CCC effectively in financial analysis and operational management.
            </p>
            <p className="text-muted-foreground">
              Understanding cash conversion efficiency is crucial for investors, creditors, and management teams to assess the company's operational effectiveness and working capital optimization capabilities.
            </p>
          </div>
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
            Common questions about Cash Conversion Cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the Cash Conversion Cycle?</h4>
              <p className="text-muted-foreground">
                The Cash Conversion Cycle (CCC) measures the time it takes for a company to convert its investments in inventory and other resources into cash flows from sales. It's calculated as: CCC = DIO + DSO - DPO, where DIO is Days Inventory Outstanding, DSO is Days Sales Outstanding, and DPO is Days Payable Outstanding.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is considered a good Cash Conversion Cycle?</h4>
              <p className="text-muted-foreground">
                A shorter CCC is generally better, indicating more efficient working capital management. CCC of 0-30 days is excellent, 30-60 days is good, 60-90 days is moderate, and over 90 days may indicate inefficiencies. Negative CCC (where DPO exceeds DIO + DSO) is exceptional, meaning the company generates cash before paying suppliers.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate the Cash Conversion Cycle?</h4>
              <p className="text-muted-foreground">
                CCC = DIO + DSO - DPO. DIO measures how long inventory is held before sale. DSO measures how long it takes to collect receivables. DPO measures how long the company takes to pay suppliers. Each component is calculated using relevant financial data and time periods.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does a negative Cash Conversion Cycle mean?</h4>
              <p className="text-muted-foreground">
                A negative CCC means the company pays its suppliers after collecting cash from customers, effectively using supplier credit to finance operations. This is excellent for cash flow and indicates strong negotiating power with suppliers and efficient operations. Companies like Amazon and Walmart often have negative CCC.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Do Cash Conversion Cycles vary by industry?</h4>
              <p className="text-muted-foreground">
                Yes, CCC varies significantly by industry. Retail companies often have short or negative cycles due to fast inventory turnover. Manufacturing companies typically have longer cycles due to production time. Service companies may have very short cycles due to minimal inventory. Always compare within the same industry for meaningful analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of the Cash Conversion Cycle?</h4>
              <p className="text-muted-foreground">
                CCC is a snapshot in time and doesn't reflect seasonal variations. It doesn't consider the quality of receivables or inventory. It assumes linear cash flows and doesn't account for credit terms variations. It may not reflect the true operational efficiency in complex supply chains or service businesses.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How can a company improve its Cash Conversion Cycle?</h4>
              <p className="text-muted-foreground">
                Companies can improve CCC by reducing DIO through better inventory management, reducing DSO through faster receivables collection, and increasing DPO through extended payment terms with suppliers. However, these strategies should be balanced with customer satisfaction, supplier relationships, and operational efficiency.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does CCC relate to Working Capital?</h4>
              <p className="text-muted-foreground">
                CCC and working capital are closely related. A shorter CCC typically means lower working capital requirements, as cash is converted faster. CCC measures the efficiency of working capital management, while working capital measures the absolute amount of capital tied up in operations. Both metrics should be analyzed together.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is CCC important for investors?</h4>
              <p className="text-muted-foreground">
                For investors, CCC indicates operational efficiency and cash flow generation capability. A shorter CCC suggests better working capital management and potentially higher returns on capital. It also indicates the company's ability to fund growth without external financing and its competitive position in managing operations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do creditors use the Cash Conversion Cycle?</h4>
              <p className="text-muted-foreground">
                Creditors use CCC to assess operational efficiency and cash flow predictability. A shorter CCC suggests better ability to generate cash and meet obligations. Creditors may consider CCC when determining credit terms and loan covenants, as it indicates the company's working capital management effectiveness and operational stability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
