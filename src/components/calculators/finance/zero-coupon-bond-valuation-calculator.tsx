'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, AlertCircle, Target, Info, Landmark, Calculator, TrendingUp, Shield, BarChart3, Activity, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  faceValue: z.number().positive(),
  yearsToMaturity: z.number().positive(),
  yieldToMaturity: z.number().nonnegative(),
  currentPrice: z.number().positive().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ZeroCouponBondValuationCalculator() {
  const [result, setResult] = useState<{ 
    bondPrice: number;
    discountAmount: number;
    discountPercentage: number;
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
      faceValue: undefined,
      yearsToMaturity: undefined,
      yieldToMaturity: undefined,
      currentPrice: undefined,
    },
  });

  const calculateZeroCouponBondPrice = (values: FormValues): number => {
    const { faceValue, yearsToMaturity, yieldToMaturity } = values;
    const ytm = yieldToMaturity / 100;
    
    // Zero-coupon bond price formula: Price = Face Value / (1 + YTM)^years
    const bondPrice = faceValue / Math.pow(1 + ytm, yearsToMaturity);
    return bondPrice;
  };

  const calculateDiscount = (bondPrice: number, faceValue: number) => {
    const discountAmount = faceValue - bondPrice;
    const discountPercentage = (discountAmount / faceValue) * 100;
    return { discountAmount, discountPercentage };
  };

  const interpret = (bondPrice: number, faceValue: number, yearsToMaturity: number, yieldToMaturity: number) => {
    const { discountPercentage } = calculateDiscount(bondPrice, faceValue);
    
    if (discountPercentage >= 50) return `Deep discount zero-coupon bond trading at ${discountPercentage.toFixed(1)}% below face value - significant discount for long-term investment.`;
    if (discountPercentage >= 25) return `Moderate discount zero-coupon bond trading at ${discountPercentage.toFixed(1)}% below face value - reasonable discount for investment.`;
    if (discountPercentage >= 10) return `Low discount zero-coupon bond trading at ${discountPercentage.toFixed(1)}% below face value - minimal discount for investment.`;
    if (discountPercentage >= 0) return `Minimal discount zero-coupon bond trading at ${discountPercentage.toFixed(1)}% below face value - very low discount.`;
    return `Premium zero-coupon bond trading above face value - unusual market conditions.`;
  };

  const getValuationLevel = (discountPercentage: number) => {
    if (discountPercentage >= 50) return 'Deep Discount';
    if (discountPercentage >= 25) return 'Moderate Discount';
    if (discountPercentage >= 10) return 'Low Discount';
    if (discountPercentage >= 0) return 'Minimal Discount';
    return 'Premium';
  };

  const getRecommendation = (discountPercentage: number, yearsToMaturity: number, yieldToMaturity: number) => {
    if (discountPercentage >= 50) return 'Attractive deep discount - consider for long-term investment with high yield potential.';
    if (discountPercentage >= 25) return 'Good discount opportunity - suitable for moderate-term investment with reasonable yield.';
    if (discountPercentage >= 10) return 'Moderate discount - consider for short-term investment with modest yield.';
    if (discountPercentage >= 0) return 'Minimal discount - evaluate against other investment opportunities.';
    return 'Premium pricing - investigate market conditions and consider alternatives.';
  };

  const getStrength = (discountPercentage: number) => {
    if (discountPercentage >= 50) return 'Very Strong';
    if (discountPercentage >= 25) return 'Strong';
    if (discountPercentage >= 10) return 'Good';
    if (discountPercentage >= 0) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (bondPrice: number, faceValue: number, yearsToMaturity: number, yieldToMaturity: number) => {
    const insights = [];
    const { discountPercentage } = calculateDiscount(bondPrice, faceValue);
    
    if (discountPercentage >= 50) {
      insights.push('Deep discount opportunity');
      insights.push('High yield potential');
      insights.push('Significant capital appreciation');
    } else if (discountPercentage >= 25) {
      insights.push('Moderate discount opportunity');
      insights.push('Good yield potential');
      insights.push('Reasonable capital appreciation');
    } else if (discountPercentage >= 10) {
      insights.push('Low discount opportunity');
      insights.push('Modest yield potential');
      insights.push('Limited capital appreciation');
    } else {
      insights.push('Minimal discount opportunity');
      insights.push('Low yield potential');
      insights.push('Limited capital appreciation');
    }
    
    insights.push('Zero-coupon bond characteristics');
    insights.push('No periodic interest payments');
    insights.push('Maximum duration for maturity');
    insights.push('Compound growth to maturity');
    
    return insights;
  };

  const getConsiderations = (yearsToMaturity: number, yieldToMaturity: number) => {
    const considerations = [];
    considerations.push('Zero-coupon bonds have maximum duration');
    considerations.push('High interest rate sensitivity');
    considerations.push('No reinvestment risk for coupon payments');
    considerations.push('Consider tax implications of imputed interest');
    considerations.push('Evaluate liquidity and market access');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const bondPrice = calculateZeroCouponBondPrice(values);
    const { discountAmount, discountPercentage } = calculateDiscount(bondPrice, values.faceValue);
    
    setResult({
      bondPrice,
      discountAmount,
      discountPercentage,
      interpretation: interpret(bondPrice, values.faceValue, values.yearsToMaturity, values.yieldToMaturity),
      valuationLevel: getValuationLevel(discountPercentage),
      recommendation: getRecommendation(discountPercentage, values.yearsToMaturity, values.yieldToMaturity),
      strength: getStrength(discountPercentage),
      insights: getInsights(bondPrice, values.faceValue, values.yearsToMaturity, values.yieldToMaturity),
      considerations: getConsiderations(values.yearsToMaturity, values.yieldToMaturity)
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-primary" />
            <CardTitle>Zero-Coupon Bond Valuation Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate the theoretical price and discount of zero-coupon bonds based on face value, maturity, and yield
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="faceValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Face Value ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter face value" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="yearsToMaturity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Years to Maturity
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter years to maturity" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="yieldToMaturity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Yield to Maturity (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter yield to maturity" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currentPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Current Market Price ($) - Optional
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter current market price" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Zero-Coupon Bond Price
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
                  <CardTitle>Zero-Coupon Bond Valuation Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.valuationLevel === 'Minimal Discount' ? 'default' : result.valuationLevel === 'Low Discount' ? 'secondary' : 'destructive'}>
                    {result.valuationLevel}
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
                      ${result.bondPrice.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Theoretical Price</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      ${result.discountAmount.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Discount Amount</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {result.discountPercentage.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Discount Percentage</p>
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
            <Link href="/category/finance/yield-to-call-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Yield to Call</p>
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
            Complete Guide to Zero-Coupon Bond Valuation
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting zero-coupon bond valuations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Zero-coupon bonds are debt securities that don't pay periodic interest but are sold at a discount to their face value and redeemed at face value at maturity. The difference between the purchase price and face value represents the investor's return. These bonds have unique characteristics including maximum duration and high interest rate sensitivity.
          </p>
          <p className="text-muted-foreground">
            Understanding zero-coupon bond valuation is essential for investors seeking predictable returns, tax planning, and portfolio diversification. These bonds are particularly attractive for long-term financial goals, retirement planning, and educational savings due to their predictable growth and compound interest characteristics.
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
            Common questions about Zero-Coupon Bond Valuation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a zero-coupon bond?</h4>
              <p className="text-muted-foreground">
                A zero-coupon bond is a debt security that doesn't pay periodic interest but is sold at a discount to its face value and redeemed at face value at maturity. The investor's return comes from the difference between the purchase price and face value, which represents the compound interest earned over the bond's life.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate zero-coupon bond price?</h4>
              <p className="text-muted-foreground">
                Zero-coupon bond price is calculated using the formula: Price = Face Value / (1 + YTM)^years. This formula discounts the face value back to the present using the yield to maturity and time to maturity. The longer the maturity and higher the yield, the lower the bond price.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the advantages of zero-coupon bonds?</h4>
              <p className="text-muted-foreground">
                Advantages include: predictable returns, no reinvestment risk, maximum duration for maturity, compound growth, and suitability for long-term goals. They're ideal for retirement planning, educational savings, and other long-term financial objectives where predictable growth is desired.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the disadvantages of zero-coupon bonds?</h4>
              <p className="text-muted-foreground">
                Disadvantages include: high interest rate sensitivity, no periodic income, potential tax implications on imputed interest, liquidity concerns, and credit risk. They're not suitable for investors needing regular income or those with short-term investment horizons.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does duration affect zero-coupon bonds?</h4>
              <p className="text-muted-foreground">
                Zero-coupon bonds have the maximum possible duration for their maturity, making them highly sensitive to interest rate changes. Duration equals the time to maturity, so a 10-year zero-coupon bond has a duration of 10 years. This high duration means significant price volatility with interest rate changes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the tax implications?</h4>
              <p className="text-muted-foreground">
                Zero-coupon bonds may have tax implications on imputed interest, even though no cash payments are received. Investors may owe taxes on the annual accretion of the bond's value. Consider tax-advantaged accounts or municipal zero-coupon bonds for tax efficiency.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use zero-coupon bonds for financial planning?</h4>
              <p className="text-muted-foreground">
                Use zero-coupon bonds for specific future financial needs like college tuition, retirement income, or major purchases. Calculate the present value needed and purchase bonds that mature when funds are needed. This provides predictable growth and eliminates reinvestment risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors affect zero-coupon bond prices?</h4>
              <p className="text-muted-foreground">
                Key factors include yield to maturity, time to maturity, credit quality, and market interest rates. Higher yields and longer maturities result in lower prices. Credit risk affects the required yield, while market interest rate changes cause significant price volatility due to high duration.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I evaluate zero-coupon bond investments?</h4>
              <p className="text-muted-foreground">
                Evaluate based on yield to maturity, credit quality, liquidity, tax implications, and alignment with investment objectives. Compare yields to other fixed-income investments and consider the bond's role in your overall portfolio strategy. Assess whether the investment meets your risk tolerance and time horizon.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why are zero-coupon bonds important for portfolio management?</h4>
              <p className="text-muted-foreground">
                Zero-coupon bonds are important for portfolio management as they provide predictable returns, eliminate reinvestment risk, offer maximum duration for maturity, and are ideal for liability matching strategies. They help investors meet specific future financial obligations with certainty and precision.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}