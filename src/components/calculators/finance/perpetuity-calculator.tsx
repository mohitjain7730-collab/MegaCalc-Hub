'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Infinity, Calculator, DollarSign, TrendingUp, Info, AlertCircle, Target, Calendar, BarChart, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  paymentAmount: z.number().min(0).optional(),
  discountRate: z.number().min(0).max(100).optional(),
  calculationType: z.enum(['present-value', 'payment-amount', 'discount-rate']).optional(),
  presentValue: z.number().min(0).optional(),
  paymentFrequency: z.enum(['annual', 'semi-annual', 'quarterly', 'monthly']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PerpetuityCalculator() {
  const [result, setResult] = useState<{ 
    presentValue: number;
    paymentAmount: number;
    discountRate: number;
    interpretation: string;
    recommendations: string[];
    warningSigns: string[];
    yearByYear: { year: number; payment: number; presentValue: number; discountFactor: number }[];
    calculationType: string;
  } | null>(null);

  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      paymentAmount: undefined, 
      discountRate: undefined, 
      calculationType: undefined, 
      presentValue: undefined,
      paymentFrequency: undefined
    } 
  });

  const getPaymentFrequency = (frequency: string) => {
    const frequencies = {
      'annual': 1,
      'semi-annual': 2,
      'quarterly': 4,
      'monthly': 12
    };
    return frequencies[frequency as keyof typeof frequencies] || 1;
  };

  const calculatePerpetuityPV = (payment: number, rate: number, frequency: number) => {
    const periodicRate = rate / 100 / frequency;
    return payment / periodicRate;
  };

  const calculatePerpetuityPayment = (presentValue: number, rate: number, frequency: number) => {
    const periodicRate = rate / 100 / frequency;
    return presentValue * periodicRate;
  };

  const calculatePerpetuityRate = (payment: number, presentValue: number, frequency: number) => {
    return (payment / presentValue) * frequency * 100;
  };

  const calculate = (v: FormValues) => {
    if (v.calculationType == null) return null;
    
    const frequency = getPaymentFrequency(v.paymentFrequency || 'annual');
    let presentValue = 0;
    let paymentAmount = 0;
    let discountRate = 0;
    
    switch (v.calculationType) {
      case 'present-value':
        if (v.paymentAmount == null || v.discountRate == null) return null;
        presentValue = calculatePerpetuityPV(v.paymentAmount, v.discountRate, frequency);
        paymentAmount = v.paymentAmount;
        discountRate = v.discountRate;
        break;
      case 'payment-amount':
        if (v.presentValue == null || v.discountRate == null) return null;
        paymentAmount = calculatePerpetuityPayment(v.presentValue, v.discountRate, frequency);
        presentValue = v.presentValue;
        discountRate = v.discountRate;
        break;
      case 'discount-rate':
        if (v.paymentAmount == null || v.presentValue == null) return null;
        discountRate = calculatePerpetuityRate(v.paymentAmount, v.presentValue, frequency);
        paymentAmount = v.paymentAmount;
        presentValue = v.presentValue;
        break;
    }
    
    // Generate year-by-year breakdown
    const yearByYear = [];
    for (let year = 1; year <= 20; year++) {
      const yearPayment = paymentAmount * frequency;
      const yearPV = presentValue;
      const discountFactor = 1 / Math.pow(1 + discountRate / 100, year);
      yearByYear.push({ year, payment: yearPayment, presentValue: yearPV, discountFactor });
    }
    
    return { presentValue, paymentAmount, discountRate, yearByYear };
  };

  const interpret = (discountRate: number, presentValue: number, paymentAmount: number) => {
    const yieldPercentage = (paymentAmount / presentValue) * 100;
    
    if (discountRate > 15) return 'High discount rate indicates high risk or opportunity cost. Consider if the investment meets your return requirements.';
    if (discountRate > 8) return 'Moderate discount rate suggests reasonable risk assessment. Review your investment strategy and goals.';
    if (discountRate > 4) return 'Conservative discount rate with lower risk. Ensure the rate reflects current market conditions.';
    return 'Very low discount rate. Consider if this meets your investment objectives and inflation expectations.';
  };

  const getCalculationType = (type: string) => {
    switch (type) {
      case 'present-value': return 'Perpetuity Present Value';
      case 'payment-amount': return 'Perpetuity Payment Amount';
      case 'discount-rate': return 'Perpetuity Discount Rate';
      default: return 'Perpetuity Calculation';
    }
  };

  const getRecommendations = (discountRate: number, presentValue: number, paymentAmount: number, calculationType: string) => {
    const recommendations = [];
    
    if (calculationType === 'present-value') {
      if (discountRate > 10) {
        recommendations.push('High discount rate suggests high risk investment');
        recommendations.push('Consider if the risk is appropriately assessed');
        recommendations.push('Review market conditions and comparable investments');
      } else {
        recommendations.push('Reasonable discount rate for perpetuity valuation');
        recommendations.push('Consider the stability of the income source');
        recommendations.push('Evaluate the creditworthiness of the payment source');
      }
    }
    
    if (calculationType === 'payment-amount') {
      recommendations.push('Consider the sustainability of the payment amount');
      recommendations.push('Review the stability of the income source');
      recommendations.push('Evaluate inflation impact on real returns');
      recommendations.push('Consider the creditworthiness of the payer');
    }
    
    if (calculationType === 'discount-rate') {
      recommendations.push('Compare with market rates for similar investments');
      recommendations.push('Consider your risk tolerance and investment goals');
      recommendations.push('Review current economic conditions');
      recommendations.push('Evaluate alternative investment opportunities');
    }
    
    recommendations.push('Consider the impact of inflation on real returns');
    recommendations.push('Review the stability and reliability of the income source');
    recommendations.push('Evaluate tax implications of the investment');
    recommendations.push('Consider your overall portfolio diversification');
    
    return recommendations;
  };

  const getWarningSigns = (discountRate: number, presentValue: number, paymentAmount: number) => {
    const signs = [];
    
    if (discountRate > 20) {
      signs.push('Very high discount rate may indicate unrealistic expectations');
      signs.push('Consider if the risk is appropriately assessed');
      signs.push('Review market conditions and comparable investments');
    }
    
    if (discountRate < 2) {
      signs.push('Very low discount rate may not keep pace with inflation');
      signs.push('Consider if the rate reflects current market conditions');
      signs.push('Review your investment strategy and goals');
    }
    
    if (presentValue > paymentAmount * 50) {
      signs.push('Very high present value relative to payment amount');
      signs.push('Consider if the valuation is realistic');
      signs.push('Review the stability of the income source');
    }
    
    signs.push('Not accounting for inflation in discount rate');
    signs.push('Ignoring the risk of payment interruption');
    signs.push('Not considering alternative investment options');
    
    return signs;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (!calculation) { setResult(null); return; }
    
    setResult({ 
      ...calculation,
      interpretation: interpret(calculation.discountRate, calculation.presentValue, calculation.paymentAmount),
      recommendations: getRecommendations(calculation.discountRate, calculation.presentValue, calculation.paymentAmount, values.calculationType!),
      warningSigns: getWarningSigns(calculation.discountRate, calculation.presentValue, calculation.paymentAmount),
      calculationType: getCalculationType(values.calculationType!)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Infinity className="h-5 w-5" />
            Perpetuity Calculation
          </CardTitle>
          <CardDescription>
            Calculate the value of infinite cash flows and perpetuity investments
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Basic Parameters
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="calculationType" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Calculation Type
                          </FormLabel>
                    <FormControl>
                            <select 
                              className="border rounded h-10 px-3 w-full bg-background" 
                              value={field.value ?? ''} 
                              onChange={(e) => field.onChange(e.target.value as any)}
                            >
                              <option value="">Select calculation type</option>
                              <option value="present-value">Present Value</option>
                              <option value="payment-amount">Payment Amount</option>
                              <option value="discount-rate">Discount Rate</option>
                  </select>
                </FormControl>
                    <FormMessage />
                  </FormItem>
                      )} 
                    />
                    <FormField 
                      control={form.control} 
                      name="paymentFrequency" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <BarChart className="h-4 w-4" />
                            Payment Frequency
                          </FormLabel>
                    <FormControl>
                            <select 
                              className="border rounded h-10 px-3 w-full bg-background" 
                              value={field.value ?? ''} 
                              onChange={(e) => field.onChange(e.target.value as any)}
                            >
                              <option value="">Select frequency</option>
                              <option value="annual">Annual</option>
                              <option value="semi-annual">Semi-Annual</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="monthly">Monthly</option>
                  </select>
                </FormControl>
                    <FormMessage />
                  </FormItem>
                      )} 
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Financial Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="paymentAmount" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Payment Amount
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 5000" 
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
                      name="discountRate" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Discount Rate (%)
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 8.5" 
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
                      name="presentValue" 
                      render={({ field }) => (
                  <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Present Value
                          </FormLabel>
                    <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="e.g., 100000" 
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
                </div>
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Perpetuity
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
                <Infinity className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>{result.calculationType}</CardTitle>
                  <CardDescription>Perpetuity analysis and infinite cash flow valuation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Present Value</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.presentValue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current value of infinite payments
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Payment Amount</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">
                    ${result.paymentAmount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Per payment period
                  </p>
                </div>
                
                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-muted-foreground">Discount Rate</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {result.discountRate.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Required return rate
                  </p>
                </div>
              </div>

              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {result.interpretation}
                </AlertDescription>
              </Alert>

              {/* Year-by-Year Analysis */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart className="h-5 w-5" />
                    Perpetuity Value Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Year</th>
                          <th className="text-right p-2">Payment</th>
                          <th className="text-right p-2">Present Value</th>
                          <th className="text-right p-2">Discount Factor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearByYear.map((year, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{year.year}</td>
                            <td className="text-right p-2">${year.payment.toLocaleString()}</td>
                            <td className="text-right p-2">${year.presentValue.toLocaleString()}</td>
                            <td className="text-right p-2">{year.discountFactor.toFixed(4)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Recommendations */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="h-5 w-5" />
                        Investment Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="h-5 w-5" />
                        Warning Signs to Watch
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.warningSigns.map((sign, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{sign}</span>
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

      {/* Educational Content */}
      <div className="space-y-6">
        {/* Explain the Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding Perpetuities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a Perpetuity?</h4>
              <p className="text-muted-foreground">
                A perpetuity is an infinite series of equal payments made at regular intervals. Unlike annuities, perpetuities never end. Common examples include preferred stock dividends, certain types of bonds, and some real estate investments.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Present Value of Perpetuity</h4>
              <p className="text-muted-foreground">
                The present value of a perpetuity is calculated by dividing the payment amount by the discount rate. This gives you the current worth of all future payments, discounted to today's value.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Real-World Applications</h4>
              <p className="text-muted-foreground">
                Perpetuities are used to value preferred stock, certain types of bonds, real estate with perpetual leases, and other investments that provide infinite cash flows. They're also used in academic finance and theoretical models.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Infinity className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial planning and investment tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/annuity-payment-calculator" className="text-primary hover:underline">
                    Annuity Payment Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate annuity payments and values
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/present-value-calculator" className="text-primary hover:underline">
                    Present Value Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate present value of future cash flows
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/growing-annuity-perpetuity-calculator" className="text-primary hover:underline">
                    Growing Annuity/Perpetuity Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate growing annuity and perpetuity values
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">
                    Retirement Savings Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your retirement with comprehensive projections
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Ultimate Perpetuity Guide: PV, Gordon Growth Model, and DCF Terminal Value" />
    <meta itemProp="description" content="Master the concept of perpetuity in financial analysis. An EEAT-focused guide detailing Present Value (PV) calculations, the Growing Perpetuity formula, the Critical Role of Terminal Value (TV) in DCF, and advanced valuation principles." />
    <meta itemProp="keywords" content="perpetuity definition, present value of perpetuity formula, growing perpetuity, Gordon Growth Model, DCF terminal value, perpetuity due, WACC and perpetuity, finance valuation methods, dividend discount model, capital budgeting" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-perpetuity-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Perpetuity: Valuation, Formulas, and Its Cornerstone Role in Financial Modeling</h1>
    <p className="text-lg italic text-muted-foreground">A comprehensive, expert-level deep dive into the valuation concept that underpins all long-term financial analysis, from equity valuation to infrastructure investment.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#foundations" className="hover:underline">Theoretical Foundations and Definition</a></li>
        <li><a href="#simple" className="hover:underline">The Simple Perpetuity (Ordinary and Due)</a></li>
        <li><a href="#growing" className="hover:underline">The Growing Perpetuity and the Gordon Growth Model (GGM)</a></li>
        <li><a href="#terminal-value" className="hover:underline">Advanced Application: Perpetuity in Terminal Value (TV)</a></li>
        <li><a href="#sensitivity" className="hover:underline">Sensitivity Analysis and the Model’s Limitations</a></li>
        <li><a href="#vs-annuity" className="hover:underline">Perpetuity vs. Annuity and Compounding</a></li>
    </ul>
<hr />

    {/* THEORETICAL FOUNDATIONS AND DEFINITION */}
    <h2 id="foundations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Theoretical Foundations and Definition</h2>
    <p>The concept of <strong className="font-semibold">perpetuity</strong> (P) is one of the most abstract yet indispensable tools in finance. Derived from the Latin word *perpetuitas* (meaning everlasting), a perpetuity represents a series of equal, periodic cash flows that are scheduled to extend <strong className="font-semibold">indefinitely</strong> into the future. It is a special case of an annuity where the number of periods (n) approaches infinity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Why an Infinite Cash Stream Has a Finite Value</h3>
    <p>The finite nature of a perpetuity’s <strong className="font-semibold">Present Value (PV)</strong> is rooted in the fundamental concept of the <strong className="font-semibold">Time Value of Money (TVM)</strong>. The formula relies on a positive <strong className="font-semibold">Discount Rate</strong>—representing the required rate of return or opportunity cost—to bring future cash flows back to their current value. The further out a payment occurs, the higher the discount factor, and thus the lower its present value. Mathematically, as the periods approach infinity, the present value of those distant cash flows asymptotically approaches zero, allowing the entire infinite stream to converge upon a finite sum.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Historical Context and Relevance (EEAT Focus)</h3>
    <p>The concept of perpetual debt is not new. Historically, the British government issued <strong className="font-semibold">Consols</strong> (Consolidated Annuities), which paid fixed interest in perpetuity, offering a tangible example of a simple perpetuity. Today, the concept is essential for:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Valuation:</strong> Estimating the terminal value of a business in DCF models.</li>
        <li><strong className="font-semibold">Preferred Stock:</strong> Valuing non-redeemable preferred shares that pay a fixed dividend forever.</li>
        <li><strong className="font-semibold">Endowment Management:</strong> Calculating the capital base required for perpetual scholarship funds or charitable trusts.</li>
    </ul>

<hr />

    {/* THE SIMPLE PERPETUITY (ORDINARY AND DUE) */}
    <h2 id="simple" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Simple Perpetuity (Ordinary and Due)</h2>
    <p>A <strong className="font-semibold">Simple Perpetuity</strong> (or Level Perpetuity) assumes two conditions: the <strong className="font-semibold">Cash Flow</strong> (C) is constant, and the payments occur at fixed, regular intervals. The primary distinction depends on the timing of the first payment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Ordinary Perpetuity: Payment at the End of the Period</h3>
    <p>This is the standard model where the first cash flow is received at the end of Period 1 (t=1). The formula is the most elegant representation of present value in finance:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'PV_Ordinary = CashFlow / Rate'}
        </p>
    </div>

    <p>This formula is derived from the geometric series summation for the PV of an annuity as n approaches infinity. It implicitly assumes that the initial investment (PV) is made today (t=0).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Perpetuity Due: Payment at the Beginning of the Period</h3>
    <p>A <strong className="font-semibold">Perpetuity Due</strong> means the first payment occurs immediately at t=0. The remaining payments form an ordinary perpetuity starting at t=1. To calculate the Present Value Due, we simply take the ordinary PV and add the first, undiscounted payment (C_0):</p>

    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'PV_Due = CashFlow + (CashFlow / Rate)'}
        </p>
    </div>
    <p>The Present Value Due will always be higher than the Present Value Ordinary because the investor receives the first cash flow sooner.</p>

<hr />

    {/* THE GROWING PERPETUITY AND THE GORDON GROWTH MODEL (GGM) */}
    <h2 id="growing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Growing Perpetuity and the Gordon Growth Model (GGM)</h2>
    <p>In economic reality, a cash flow that remains constant forever is unrealistic due to inflation and productivity growth. The <strong className="font-semibold">Growing Perpetuity</strong> addresses this by assuming the cash flow grows at a constant, sustainable <strong className="font-semibold">Growth Rate</strong> (g) each period. This adjustment makes the model suitable for valuing equities and business enterprises.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Gordon Growth Model Formula (GGM)</h3>
    <p>When used to value dividends, the Growing Perpetuity is formally known as the <strong className="font-semibold">Gordon Growth Model</strong> (developed by Myron J. Gordon). This is a single-stage dividend discount model:</p>

    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'PV = C_1 / (Rate - GrowthRate)'}
        </p>
    </div>

    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">C₁:</strong> The cash flow <strong className="font-semibold">expected in the next period</strong> (i.e., C₀ multiplied by (1+g)). Using the current cash flow (C₀) instead of the forward cash flow (C₁) is a common, but critical, error.</li>
        <li><strong className="font-semibold">Rate:</strong> The appropriate discount rate (e.g., Cost of Equity).</li>
        <li><strong className="font-semibold">GrowthRate:</strong> The constant perpetual growth rate.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Non-Negotiable Constraint: Rate {'>'} Growth Rate</h3>
    <p>For the Growing Perpetuity to yield a meaningful, finite value, the <strong className="font-semibold">Discount Rate</strong> must be strictly greater than the <strong className="font-semibold">Growth Rate</strong> (the Rate is highly preferred to be significantly greater than the Growth Rate). If the Rate is less than or equal to the Growth Rate, the formula fails, resulting in an infinite or negative Present Value. This constraint forces analysts to choose a conservative growth rate—one that cannot realistically exceed the long-term, global economic growth rate or inflation rate (typically kept below 4%).</p>

<hr />

    {/* ADVANCED APPLICATION: TERMINAL VALUE (TV) */}
    <h2 id="terminal-value" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Advanced Application: Perpetuity in Terminal Value (TV)</h2>
    <p>In a professional <strong className="font-semibold">Discounted Cash Flow (DCF)</strong> valuation, the Growing Perpetuity model is the most widely utilized method for calculating the <strong className="font-semibold">Terminal Value (TV)</strong>. This TV represents the present value of all a company's free cash flows after the explicit forecast period (Year n) and often accounts for the majority of the firm's total value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Terminal Value Formula in DCF</h3>
    <p>When valuing the entire firm (Enterprise Value), the cash flows used are <strong className="font-semibold">Free Cash Flow to Firm (FCFF)</strong>, and the discount rate is the <strong className="font-semibold">Weighted Average Cost of Capital (WACC)</strong>.</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Terminal Value_n = FCFF_n+1 / (WACC - GrowthRate)'}
        </p>
    </div>
    <p>Note that this formula yields the value *at the end of Year n* (TV_n). It must be discounted back to the Present Value (Year 0) to be included in the total DCF valuation:</p>
    <div className="overflow-x-auto my-4 p-2 bg-muted border rounded-lg inline-block">
        <p className="font-mono text-lg text-destructive font-bold">
            {'PV of TV = Terminal Value_n / (1 + WACC)^n'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Alternative TV Method: Exit Multiple (A Necessary Comparison)</h3>
    <p>The primary alternative is the <strong className="font-semibold">Exit Multiple Method</strong>, which calculates TV based on a comparable company's valuation multiple (e.g., Enterprise Value/EBITDA). The Growing Perpetuity method is generally preferred by academics and purists because it is <strong className="font-semibold">intrinsic</strong> (based on internal cash flows and cost of capital), whereas the Exit Multiple method is <strong className="font-semibold">extrinsic</strong> (reliant on current, potentially irrational, market data).</p>

<hr />

    {/* SENSITIVITY ANALYSIS AND THE MODEL’S LIMITATIONS */}
    <h2 id="sensitivity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Sensitivity Analysis and the Model’s Limitations</h2>
    <p>The Growing Perpetuity model, while foundational, is highly sensitive to input variables. Financial professionals must use <strong className="font-semibold">Sensitivity Analysis</strong> to stress-test their valuations against small changes in Rate and Growth Rate to understand the risk and reliability of their results.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Margin of Error in the Denominator</h3>
    <p>Since the present value is determined by the small difference <strong className="font-semibold">(Rate - Growth Rate)</strong> in the denominator (the denominator is known as the <strong className="font-semibold">Capitalization Rate</strong>), a minor shift in assumptions can result in a massive difference in the valuation. For instance, changing the Rate minus the Growth Rate from 4% to 3% increases the multiplier (1 / (Rate - Growth Rate)) from 25x to 33.3x, leading to a 33% jump in the Terminal Value.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">EEAT Caution: When Not to Use Perpetuity</h3>
    <p>Expert analysts recognize the perpetuity model is unsuitable for:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Cyclical or Volatile Industries:</strong> Companies that face significant changes in market structure (e.g., technology startups or resource companies) violate the assumption of stable, perpetual cash flow and growth.</li>
        <li><strong className="font-semibold">Companies Facing Liquidation:</strong> If an asset or firm has a defined end-date, a standard annuity or liquidation value model must be used instead.</li>
        <li><strong className="font-semibold">Periods of High Inflation:</strong> When inflation is high and volatile, predicting a stable long-term growth rate becomes unreliable, making the valuation suspect.</li>
    </ul>

<hr />

    {/* PERPETUITY VS. ANNUITY AND CONTINUOUS COMPOUNDING */}
    <h2 id="vs-annuity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Perpetuity vs. Annuity and Continuous Compounding</h2>
    <p>Understanding how frequency affects discounting is key to applying the perpetuity formula accurately in advanced models.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Perpetuity with Non-Annual Compounding</h3>
    <p>If cash flows occur m times per year (e.g., monthly, m=12), the simple perpetuity formula can be modified. The periodic rate becomes Rate/m and the periodic cash flow becomes CashFlow/m.</p>

    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'PV_Monthly = (CashFlow/m) / (Rate/m) = CashFlow / Rate'}
        </p>
    </div>
    <p>Interestingly, the continuous or high-frequency compounding/payment frequency of a simple perpetuity cancels out, returning the formula to the standard PV = CashFlow / Rate. This simplifies annualization but requires careful handling of the growing perpetuity case.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Continuous Growing Perpetuity (Advanced)</h3>
    <p>In certain theoretical contexts, cash flows are assumed to arrive continuously. The formula for the PV of a growing perpetuity with continuous compounding is:</p>
    
    <div className="overflow-x-auto my-4 p-2 bg-muted border rounded-lg inline-block">
        <p className="font-mono text-lg text-destructive font-bold">
            {'PV_Continuous = C / (Rate - GrowthRate)'}
            <span className="text-sm block">Where C is the annual rate of cash flow.</span>
        </p>
    </div>
    <p>While the form looks identical to the discrete GGM, the variables Rate and Growth Rate here represent continuously compounded rates, making them slightly different from their discrete, annual counterparts.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The concept of perpetuity is far more than just a simple financial formula; it is the philosophical anchor for valuing assets with indefinite lifespans. By providing a finite Present Value to an infinite stream of cash flows, the simple perpetuity formula (Cash Flow / Rate) and its advanced cousin, the Gordon Growth Model (GGM), offer the essential framework for determining intrinsic value.</p>
    <p>Its most vital application lies in calculating the **Terminal Value** within a Discounted Cash Flow (DCF) model, a practice that underpins the valuation of virtually every large, mature company. However, the integrity of the valuation rests entirely on the analyst’s judicious selection of the Discount Rate (WACC or Cost of Equity) and the long-term, sustainable Growth Rate. An overestimation of the Growth Rate, even by a single percentage point, can dangerously inflate the resulting Terminal Value, highlighting the necessity of careful sensitivity analysis. Mastering perpetuity ensures that a valuation remains tethered to economic reality, providing a reliable measure of long-term wealth creation.</p>

</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about perpetuities and infinite cash flows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between an annuity and a perpetuity?</h4>
              <p className="text-muted-foreground">
                An annuity has a finite number of payments over a specific period, while a perpetuity has infinite payments that continue forever. Perpetuities are theoretical constructs, while annuities are common in real-world financial products.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I choose the right discount rate for a perpetuity?</h4>
              <p className="text-muted-foreground">
                Choose a discount rate that reflects the risk of the investment and your required rate of return. Consider the stability of the income source, current market conditions, and your opportunity cost of capital. Higher-risk investments require higher discount rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Are perpetuities realistic in real-world investing?</h4>
              <p className="text-muted-foreground">
                True perpetuities are rare in practice, but the concept is useful for valuing long-term investments and understanding the theoretical value of infinite cash flows. Many investments can be approximated as perpetuities for valuation purposes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does inflation affect perpetuity valuations?</h4>
              <p className="text-muted-foreground">
                Inflation erodes the purchasing power of fixed payments over time. For perpetuities with fixed payments, consider using real (inflation-adjusted) discount rates. For growing perpetuities, factor in expected inflation in your growth rate assumptions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the risks of investing in perpetuity-like instruments?</h4>
              <p className="text-muted-foreground">
                Risks include payment interruption, changes in interest rates, inflation, and the possibility that the income source may not continue forever. Consider the creditworthiness of the payer and the stability of the underlying asset or business.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}