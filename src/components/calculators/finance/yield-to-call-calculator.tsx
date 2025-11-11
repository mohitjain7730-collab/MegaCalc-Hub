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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Yield to Call (YTC) and Yield to Worst (YTW): Calculation and Risk Analysis" />
    <meta itemProp="description" content="An expert guide detailing the formulas for Yield to Call (YTC) and Yield to Worst (YTW), their core role in pricing callable bonds, quantifying reinvestment risk, and how YTW is used by investors to determine the minimum possible return." />
    <meta itemProp="keywords" content="yield to call formula explained, calculating bond YTC, yield to worst YTW definition, callable bond valuation, reinvestment risk bonds, sinking fund provision yield" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-12" /> 
    <meta itemProp="url" content="/definitive-yield-to-call-worst-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Yield to Call (YTC) and Yield to Worst (YTW): Quantifying Minimum Bond Return</h1>
    <p className="text-lg italic text-gray-700">Master the specialized metrics essential for valuing callable bonds and anticipating the lowest possible rate of return an investor might receive.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#callable-basics" className="hover:underline">Callable Bonds: Structure and Reinvestment Risk</a></li>
        <li><a href="#ytc-calc" className="hover:underline">Yield to Call (YTC) Calculation</a></li>
        <li><a href="#ytw-calc" className="hover:underline">Yield to Worst (YTW) Calculation and Function</a></li>
        <li><a href="#price-yield" className="hover:underline">YTC vs. YTM: Price and Yield Relationship</a></li>
        <li><a href="#applications" className="hover:underline">Applications in Portfolio and Risk Management</a></li>
    </ul>
<hr />

    {/* CALLABLE BONDS: STRUCTURE AND REINVESTMENT RISK */}
    <h2 id="callable-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Callable Bonds: Structure and Reinvestment Risk</h2>
    <p>A **Callable Bond** is a debt security that grants the issuer (borrower) the right, but not the obligation, to redeem the bond and pay off the principal before the stated maturity date. This right is highly valuable to the issuer.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Issuer's Option</h3>
    <p>The call option is typically exercised when market interest rates fall below the bond's fixed coupon rate. By calling the bond, the issuer pays the bondholders the **Call Price** (usually the face value plus a premium) and refinances the debt at a new, lower market rate. For the investor, the risk is **reinvestment risk**—receiving the principal early and being forced to reinvest it at a lower prevailing market rate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Call Price and Call Date</h3>
    <p>The **Call Price** is the price the issuer pays to redeem the bond. It is specified in the indenture and often equals the face value plus a small premium that decreases over time. The **Call Date** is the earliest date on which the issuer can exercise the call option.</p>

<hr />

    {/* YIELD TO CALL (YTC) CALCULATION */}
    <h2 id="ytc-calc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Yield to Call (YTC) Calculation</h2>
    <p>The **Yield to Call (YTC)** is the rate of return an investor receives if the callable bond is held only until the issuer's first or next call date. It is the internal rate of return (IRR) of the bond under the assumption that it will be redeemed early.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The YTC Formula (IRR Identity)</h3>
    <p>YTC is the discount rate ($r$) that equates the bond's current market price to the present value of the cash flows received up to the call date:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Bond Price = PV (Coupons up to Call Date) + PV (Call Price)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">YTC vs. YTM</h3>
    <p>For callable bonds trading at a <strong className="font-semibold">premium</strong> (coupon rate &gt; YTM), YTC is typically calculated and quoted instead of YTM. Since the issuer will almost certainly call the bond early to save on high interest payments, YTC provides a more realistic measure of the expected return than YTM (which assumes the bond is held to maturity).</p>

<hr />

    {/* YIELD TO WORST (YTW) CALCULATION AND FUNCTION */}
    <h2 id="ytw-calc" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Yield to Worst (YTW) Calculation and Function</h2>
    <p>The **Yield to Worst (YTW)** is the critical metric for conservative bond investors. It represents the lowest possible yield the investor can receive from the bond without the issuer defaulting.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The YTW Decision Rule</h3>
    <p>YTW is the minimum yield derived from calculating the bond's IRR under every possible redemption scenario:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>The Yield to Maturity (assuming no call).</li>
        <li>The Yield to Call (assuming redemption at the earliest call date).</li>
        <li>The Yield to every subsequent call date (if multiple call dates exist).</li>
        <li>The yield derived from any mandatory sinking fund payments.</li>
    </ul>
    <p>The YTW is simply the **lowest** of all these calculated yields.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'YTW = Min (YTM, YTC_1, YTC_2, ...)'}
        </p>
    </div>

<hr />

    {/* YTC VS. YTM: PRICE AND YIELD RELATIONSHIP */}
    <h2 id="price-yield" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">YTC vs. YTM: Price and Yield Relationship</h2>
    <p>The price-yield relationship for a callable bond is distorted compared to a standard non-callable bond because the issuer's call option limits the investor's upside potential.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Yield Compression</h3>
    <p>As the market price of a callable bond rises (and its yield falls), the price curve starts to flatten (negative convexity). This **yield compression** occurs because the issuer is highly likely to call the bond once its YTM falls below the coupon rate. The YTC acts as a cap on the investor's upside yield and, therefore, on the bond's price.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation for Price Quotes</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li>**Bonds at a Discount:** YTM is quoted, as the call is unlikely.</li>
        <li>**Bonds at a Premium:** YTC is quoted, as the call is highly likely, and YTC becomes the YTW.</li>
    </ul>

<hr />

    {/* APPLICATIONS IN PORTFOLIO AND RISK MANAGEMENT */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications in Portfolio and Risk Management</h2>
    <p>YTC and YTW are indispensable tools for managing fixed income portfolios exposed to credit and reinvestment risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Risk Management Standard</h3>
    <p>Prudent portfolio management requires quoting the bond's yield based on the assumption that is **most adverse to the investor**. By relying on YTW, managers ensure they are planning based on the minimum realistic return, providing a margin of safety against unexpected calls.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Comparing Securities</h3>
    <p>YTW allows fund managers to compare callable bonds against non-callable bonds fairly. By using YTW, the manager compares the actual risk-adjusted return of the callable bond against a standard bond's YTM, making allocation decisions based on the lowest guaranteed return.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Yield to Call (YTC) and Yield to Worst (YTW) are specialized measures essential for valuing bonds with embedded options. YTC calculates the return assuming the bond is redeemed at the earliest call date, reflecting the **reinvestment risk** borne by the investor.</p>
    <p>**Yield to Worst (YTW)** is the required metric for risk management, representing the **lowest yield** achievable under any non-default scenario. Quoting YTW ensures that investment decisions are based on the minimum guaranteed return, providing crucial risk protection.</p>
</section>

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