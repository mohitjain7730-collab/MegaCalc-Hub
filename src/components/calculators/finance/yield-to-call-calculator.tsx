'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneCall, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, BarChart3, Activity, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentPrice: z.number().positive(),
  faceValue: z.number().positive(),
  couponRate: z.number().nonnegative(),
  yearsToCall: z.number().positive(),
  callPrice: z.number().positive(),
  paymentsPerYear: z.number().int().positive(),
  yearsToMaturity: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function YieldToCallCalculator() {
  const [result, setResult] = useState<{ 
    ytc: number;
    ytm: number;
    ytw: number;
    interpretation: string; 
    yieldLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPrice: undefined,
      faceValue: undefined,
      couponRate: undefined,
      yearsToCall: undefined,
      callPrice: undefined,
      paymentsPerYear: undefined,
      yearsToMaturity: undefined,
    },
  });

  const calculatePresentValue = (yieldRate: number, values: FormValues, useCallDate: boolean): number => {
    const { faceValue, couponRate, yearsToCall, callPrice, paymentsPerYear, yearsToMaturity } = values;
    const y = (yieldRate / 100) / paymentsPerYear; // Convert YTM from percentage to decimal, then to per-period rate
    const C = (couponRate / 100) * faceValue / paymentsPerYear;
    
    const n = useCallDate ? yearsToCall * paymentsPerYear : yearsToMaturity * paymentsPerYear;
    const finalValue = useCallDate ? callPrice : faceValue;

    let pv = 0;
    for (let t = 1; t <= n; t++) {
      pv += C / Math.pow(1 + y, t);
    }
    pv += finalValue / Math.pow(1 + y, n);
    return pv;
  };

  const calculateYield = (values: FormValues, useCallDate: boolean): number => {
    const { currentPrice } = values;
    
    // Handle edge cases
    if (currentPrice <= 0) {
      return 0;
    }
    
    // Initial guess for yield (use coupon rate as starting point)
    let yieldRate = values.couponRate / 100; // Convert to decimal
    const tolerance = 0.0001;
    const maxIterations = 100;
    
    for (let i = 0; i < maxIterations; i++) {
      const price = calculatePresentValue(yieldRate * 100, values, useCallDate); // Convert back to percentage for calculatePresentValue
      const priceDiff = price - currentPrice;
      
      if (Math.abs(priceDiff) < tolerance) {
        break;
      }
      
      // Newton-Raphson method
      const y = yieldRate / values.paymentsPerYear;
      const C = (values.couponRate / 100) * values.faceValue / values.paymentsPerYear;
      const n = useCallDate ? values.yearsToCall * values.paymentsPerYear : values.yearsToMaturity * values.paymentsPerYear;
      const finalValue = useCallDate ? values.callPrice : values.faceValue;
      
      // Calculate derivative of present value with respect to yield rate
      let derivative = 0;
      for (let t = 1; t <= n; t++) {
        derivative -= (C * t) / (Math.pow(1 + y, t + 1) * values.paymentsPerYear);
      }
      derivative -= (finalValue * n) / (Math.pow(1 + y, n + 1) * values.paymentsPerYear);
      
      // Avoid division by zero
      if (Math.abs(derivative) < 1e-10) {
        yieldRate += 0.01; // Small adjustment
        continue;
      }
      
      const newYieldRate = yieldRate - priceDiff / derivative;
      
      // Prevent extreme values
      if (newYieldRate < -0.5 || newYieldRate > 2.0) {
        yieldRate += (priceDiff > 0 ? -0.01 : 0.01);
      } else {
        yieldRate = newYieldRate;
      }
    }
    
    return yieldRate * 100; // Convert back to percentage
  };

  const calculateYields = (values: FormValues) => {
    const ytc = calculateYield(values, true);
    const ytm = calculateYield(values, false);
    const ytw = Math.min(ytc, ytm);
    
    return { ytc, ytm, ytw };
  };

  const interpret = (ytc: number, ytm: number, ytw: number, callPrice: number, faceValue: number) => {
    const callPremium = ((callPrice - faceValue) / faceValue) * 100;
    
    if (ytc < ytm) {
      if (callPremium > 0) return `Callable bond with premium call price - YTC (${ytc.toFixed(2)}%) lower than YTM (${ytm.toFixed(2)}%) due to call premium.`;
      return `Callable bond with call price below face value - YTC (${ytc.toFixed(2)}%) lower than YTM (${ytm.toFixed(2)}%) due to call discount.`;
    } else if (ytc > ytm) {
      return `Callable bond with YTC (${ytc.toFixed(2)}%) higher than YTM (${ytm.toFixed(2)}%) - call risk premium.`;
    } else {
      return `Callable bond with YTC equal to YTM (${ytc.toFixed(2)}%) - call price equals face value.`;
    }
  };

  const getYieldLevel = (ytw: number) => {
    if (ytw >= 8) return 'High';
    if (ytw >= 5) return 'Moderate';
    if (ytw >= 2) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (ytc: number, ytm: number, ytw: number) => {
    if (ytc < ytm) {
      return 'Consider call risk - bond may be called before maturity, reducing total return.';
    } else if (ytc > ytm) {
      return 'Call protection - bond unlikely to be called, providing call risk premium.';
    } else {
      return 'Neutral call position - call price equals face value, no call premium or discount.';
    }
  };

  const getStrength = (ytc: number, ytm: number) => {
    const yieldDifference = Math.abs(ytc - ytm);
    if (yieldDifference <= 0.5) return 'Strong';
    if (yieldDifference <= 1.0) return 'Good';
    if (yieldDifference <= 2.0) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (ytc: number, ytm: number, ytw: number, callPrice: number, faceValue: number) => {
    const insights = [];
    const callPremium = ((callPrice - faceValue) / faceValue) * 100;
    
    if (ytc < ytm) {
      insights.push('Call risk present');
      insights.push('Early redemption likely');
      insights.push('Lower total return potential');
    } else if (ytc > ytm) {
      insights.push('Call protection');
      insights.push('Lower call risk');
      insights.push('Higher total return potential');
    } else {
      insights.push('Neutral call position');
      insights.push('Balanced call risk');
      insights.push('Moderate total return potential');
    }
    
    if (callPremium > 0) {
      insights.push('Premium call price');
      insights.push('Call premium benefit');
    } else if (callPremium < 0) {
      insights.push('Discount call price');
      insights.push('Call discount risk');
    } else {
      insights.push('Par call price');
      insights.push('No call premium/discount');
    }
    
    insights.push(`Yield to worst: ${ytw.toFixed(2)}%`);
    insights.push('Conservative yield estimate');
    
    return insights;
  };

  const getConsiderations = (ytc: number, ytm: number) => {
    const considerations = [];
    considerations.push('Call risk affects total return');
    considerations.push('Interest rate changes affect call probability');
    considerations.push('Call protection periods may apply');
    considerations.push('Consider call schedule and terms');
    considerations.push('Monitor interest rate environment');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const yields = calculateYields(values);
    setResult({
      ytc: yields.ytc,
      ytm: yields.ytm,
      ytw: yields.ytw,
      interpretation: interpret(yields.ytc, yields.ytm, yields.ytw, values.callPrice, values.faceValue),
      yieldLevel: getYieldLevel(yields.ytw),
      recommendation: getRecommendation(yields.ytc, yields.ytm, yields.ytw),
      strength: getStrength(yields.ytc, yields.ytm),
      insights: getInsights(yields.ytc, yields.ytm, yields.ytw, values.callPrice, values.faceValue),
      considerations: getConsiderations(yields.ytc, yields.ytm)
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <PhoneCall className="h-6 w-6 text-primary" />
            <CardTitle>Yield to Call (YTC) / Yield to Worst (YTW) Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate Yield to Call, Yield to Maturity, and Yield to Worst for callable bonds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="currentPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Current Bond Price ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter current price" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
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
                <FormField control={form.control} name="couponRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Coupon Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter coupon rate" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="yearsToCall" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Years to Call Date
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter years to call" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="callPrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Call Price ($)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter call price" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="paymentsPerYear" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Payments per Year
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter payments per year" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="yearsToMaturity" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Years to Maturity
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter years to maturity" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate YTC / YTW
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
                  <CardTitle>Yield to Call Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.yieldLevel === 'High' ? 'default' : result.yieldLevel === 'Moderate' ? 'secondary' : 'destructive'}>
                    {result.yieldLevel}
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
                      {result.ytc.toFixed(2)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Yield to Call</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {result.ytm.toFixed(2)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Yield to Maturity</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {result.ytw.toFixed(2)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Yield to Worst</p>
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
            <Link href="/category/finance/bond-yield-spread-calculator" className="group">
              <Card className="group-hover:shadow-md transition-shadow">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Yield Spread</p>
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
            Complete Guide to Yield to Call
          </CardTitle>
          <CardDescription>
            Everything you need to know about calculating and interpreting Yield to Call
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Yield to Call (YTC) is the yield of a bond if it is called at the earliest call date, while Yield to Worst (YTW) is the lowest yield among all possible call dates and maturity. These measures are crucial for callable bonds as they provide conservative estimates of potential returns, accounting for the risk of early redemption.
          </p>
          <p className="text-muted-foreground">
            Understanding YTC and YTW helps investors assess call risk, make informed decisions about callable bonds, and compare them with non-callable alternatives. These yields are particularly important when interest rates are falling, as bonds are more likely to be called, potentially reducing total returns for investors.
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
            Common questions about Yield to Call
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Yield to Call (YTC)?</h4>
              <p className="text-muted-foreground">
                Yield to Call (YTC) is the yield of a bond if it is called at the earliest call date. It's calculated assuming the bond will be redeemed at the call price on the call date, rather than held to maturity. YTC provides investors with a conservative estimate of potential returns, accounting for call risk.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Yield to Worst (YTW)?</h4>
              <p className="text-muted-foreground">
                Yield to Worst (YTW) is the lowest yield among all possible call dates and maturity. It represents the worst-case scenario for bond investors, providing the most conservative estimate of potential returns. YTW is particularly important for bonds with multiple call dates or complex call schedules.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate YTC?</h4>
              <p className="text-muted-foreground">
                YTC is calculated using the same formula as YTM, but with the call date and call price instead of maturity date and face value. The formula solves for the yield that makes the present value of all cash flows (coupon payments and call price) equal to the current bond price.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">When is a bond likely to be called?</h4>
              <p className="text-muted-foreground">
                Bonds are typically called when interest rates fall below the coupon rate, making it advantageous for the issuer to refinance at lower rates. Callable bonds are most likely to be called during periods of declining interest rates, especially if the call price is at or near par value.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between YTC and YTM?</h4>
              <p className="text-muted-foreground">
                YTC assumes the bond will be called at the call date and call price, while YTM assumes the bond will be held to maturity and redeemed at face value. YTC is typically lower than YTM when the call price is below face value, and higher when the call price is above face value.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do call prices affect YTC?</h4>
              <p className="text-muted-foreground">
                Call prices significantly affect YTC calculations. Premium call prices (above face value) increase YTC, while discount call prices (below face value) decrease YTC. The relationship between call price and face value determines whether YTC is higher or lower than YTM.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the risks of callable bonds?</h4>
              <p className="text-muted-foreground">
                Callable bonds carry call risk, which means investors may receive their principal back earlier than expected, potentially at a lower price than anticipated. This can result in reinvestment risk, as investors must find new investments in a potentially lower interest rate environment.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use YTC for investment decisions?</h4>
              <p className="text-muted-foreground">
                Use YTC to assess call risk and make conservative return estimates. Compare YTC to YTM to understand call risk premium. Consider YTC relative to your investment objectives and risk tolerance. Use YTW for the most conservative analysis of potential returns.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors affect call probability?</h4>
              <p className="text-muted-foreground">
                Call probability is affected by interest rate levels, call protection periods, call prices, and issuer financial condition. Lower interest rates increase call probability, while call protection periods and premium call prices reduce call probability. Monitor these factors when investing in callable bonds.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is YTW important for portfolio management?</h4>
              <p className="text-muted-foreground">
                YTW is crucial for portfolio management as it provides the most conservative estimate of potential returns, helping investors assess downside risk and make informed allocation decisions. It's particularly important for risk management and ensuring portfolio returns meet conservative expectations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}