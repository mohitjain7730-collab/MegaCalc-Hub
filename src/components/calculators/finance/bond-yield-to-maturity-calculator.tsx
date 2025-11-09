'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, BarChart3, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  currentPrice: z.number().positive(),
  faceValue: z.number().positive(),
  couponRate: z.number().nonnegative(),
  years: z.number().positive(),
  paymentsPerYear: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BondYieldToMaturityCalculator() {
  const [result, setResult] = useState<{ 
    ytm: number;
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
      currentPrice: 0,
      faceValue: 0,
      couponRate: 0,
      years: 0,
      paymentsPerYear: undefined,
    },
  });

  const bondPrice = (ytm: number, values: FormValues): number => {
    const { faceValue, couponRate, years, paymentsPerYear } = values;
    const y = (ytm / 100) / paymentsPerYear; // Convert YTM from percentage to decimal, then to per-period rate
    const c = (couponRate / 100) * faceValue / paymentsPerYear;
    const n = years * paymentsPerYear;

    let price = 0;
    for (let t = 1; t <= n; t++) {
      price += c / Math.pow(1 + y, t);
    }
    price += faceValue / Math.pow(1 + y, n);
    return price;
  };

  const calculateYTM = (values: FormValues): number => {
    const { currentPrice, faceValue, couponRate, years, paymentsPerYear } = values;
    
    // Handle edge cases
    if (currentPrice <= 0 || faceValue <= 0 || years <= 0 || paymentsPerYear <= 0) {
      return 0;
    }
    
    // Initial guess for YTM (use coupon rate as starting point)
    let ytm = couponRate / 100; // Convert to decimal
    const tolerance = 0.0001;
    const maxIterations = 100;
    
    for (let i = 0; i < maxIterations; i++) {
      const price = bondPrice(ytm * 100, values); // Convert back to percentage for bondPrice function
      const priceDiff = price - currentPrice;
      
      if (Math.abs(priceDiff) < tolerance) {
        break;
      }
      
      // Newton-Raphson method for better convergence
      const y = ytm / paymentsPerYear;
      const c = (couponRate / 100) * faceValue / paymentsPerYear;
      const n = years * paymentsPerYear;
      
      // Calculate derivative of bond price with respect to YTM
      let derivative = 0;
      for (let t = 1; t <= n; t++) {
        derivative -= (c * t) / (Math.pow(1 + y, t + 1) * paymentsPerYear);
      }
      derivative -= (faceValue * n) / (Math.pow(1 + y, n + 1) * paymentsPerYear);
      
      // Avoid division by zero
      if (Math.abs(derivative) < 1e-10) {
        ytm += 0.01; // Small adjustment
        continue;
      }
      
      const newYtm = ytm - priceDiff / derivative;
      
      // Prevent extreme values
      if (newYtm < -0.5 || newYtm > 2.0) {
        ytm += (priceDiff > 0 ? -0.01 : 0.01);
      } else {
        ytm = newYtm;
      }
    }
    
    return ytm * 100; // Convert back to percentage
  };

  const interpret = (ytm: number, couponRate: number, currentPrice: number, faceValue: number) => {
    const premiumDiscount = ((currentPrice - faceValue) / faceValue) * 100;
    
    if (ytm > couponRate) {
      if (premiumDiscount > 0) return 'Premium bond with YTM above coupon rate - attractive yield despite premium pricing.';
      return 'Discount bond with YTM above coupon rate - good value with higher yield than coupon.';
    } else if (ytm < couponRate) {
      if (premiumDiscount > 0) return 'Premium bond with YTM below coupon rate - lower yield due to premium pricing.';
      return 'Discount bond with YTM below coupon rate - unusual pricing situation requiring analysis.';
    } else {
      return 'Par bond with YTM equal to coupon rate - fair pricing at face value.';
    }
  };

  const getYieldLevel = (ytm: number) => {
    if (ytm >= 8) return 'High';
    if (ytm >= 5) return 'Moderate';
    if (ytm >= 2) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (ytm: number, couponRate: number, currentPrice: number, faceValue: number) => {
    const premiumDiscount = ((currentPrice - faceValue) / faceValue) * 100;
    
    if (ytm > couponRate && premiumDiscount <= 0) return 'Attractive investment - discount bond with higher yield than coupon rate.';
    if (ytm > couponRate && premiumDiscount > 0) return 'Consider investment - premium bond but YTM exceeds coupon rate.';
    if (ytm < couponRate && premiumDiscount > 0) return 'Evaluate carefully - premium bond with lower yield than coupon rate.';
    if (ytm < couponRate && premiumDiscount <= 0) return 'Investigate pricing - discount bond with lower yield than coupon rate.';
    return 'Fair value investment - YTM matches coupon rate at current pricing.';
  };

  const getStrength = (ytm: number, couponRate: number) => {
    const yieldSpread = ytm - couponRate;
    if (Math.abs(yieldSpread) <= 0.5) return 'Strong';
    if (Math.abs(yieldSpread) <= 1.0) return 'Good';
    if (Math.abs(yieldSpread) <= 2.0) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (ytm: number, couponRate: number, currentPrice: number, faceValue: number) => {
    const insights = [];
    const premiumDiscount = ((currentPrice - faceValue) / faceValue) * 100;
    const yieldSpread = ytm - couponRate;
    
    if (premiumDiscount > 0) {
      insights.push('Premium bond pricing');
      insights.push('Price above face value');
    } else if (premiumDiscount < 0) {
      insights.push('Discount bond pricing');
      insights.push('Price below face value');
    } else {
      insights.push('Par bond pricing');
      insights.push('Price equals face value');
    }
    
    if (yieldSpread > 0) {
      insights.push('YTM exceeds coupon rate');
      insights.push('Attractive yield opportunity');
    } else if (yieldSpread < 0) {
      insights.push('YTM below coupon rate');
      insights.push('Lower yield than coupon');
    } else {
      insights.push('YTM equals coupon rate');
      insights.push('Fair value pricing');
    }
    
    return insights;
  };

  const getConsiderations = (ytm: number) => {
    const considerations = [];
    considerations.push('YTM assumes all coupon payments are reinvested at YTM rate');
    considerations.push('Bond will be held to maturity');
    considerations.push('No default risk is considered');
    considerations.push('Interest rate changes affect bond prices');
    considerations.push('Compare YTM to current market rates');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const ytm = calculateYTM(values);
    setResult({
      ytm,
      interpretation: interpret(ytm, values.couponRate, values.currentPrice, values.faceValue),
      yieldLevel: getYieldLevel(ytm),
      recommendation: getRecommendation(ytm, values.couponRate, values.currentPrice, values.faceValue),
      strength: getStrength(ytm, values.couponRate),
      insights: getInsights(ytm, values.couponRate, values.currentPrice, values.faceValue),
      considerations: getConsiderations(ytm)
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Percent className="h-6 w-6 text-primary" />
            <CardTitle>Bond Yield to Maturity (YTM) Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate the yield to maturity of a bond based on current price, face value, coupon rate, and time to maturity
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
                      <Input type="number" placeholder="Enter current price" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
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
                      <Input type="number" placeholder="Enter face value" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="couponRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Coupon Rate (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter coupon rate" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="years" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Years to Maturity
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter years to maturity" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
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
                      <Input type="number" placeholder="Enter payments per year" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Yield to Maturity
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
                  <CardTitle>Yield to Maturity Result</CardTitle>
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
                <div className="text-4xl font-bold text-primary">
                  {result.ytm.toFixed(2)}%
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Bond Yield to Maturity (YTM): Calculation, Interpretation, and Fixed Income Valuation" />
    <meta itemProp="description" content="An expert guide detailing the Yield to Maturity (YTM) formula, its core role as a measure of a bond's internal rate of return (IRR), the relationship between bond price and YTM, and its application in fixed income portfolio management." />
    <meta itemProp="keywords" content="yield to maturity formula explained, calculating bond YTM, internal rate of return bond, bond price yield relationship, current yield vs YTM, fixed income valuation" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-06" /> 
    <meta itemProp="url" content="/definitive-bond-yield-to-maturity-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Yield to Maturity (YTM): The True Return of a Bond</h1>
    <p className="text-lg italic text-muted-foreground">Master the critical metric that quantifies the total expected rate of return on a bond, assuming it is held until its final maturity date.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#definition" className="hover:underline">YTM: Definition and Internal Rate of Return (IRR)</a></li>
        <li><a href="#formula" className="hover:underline">The YTM Formula and Calculation Mechanics</a></li>
        <li><a href="#price-yield" className="hover:underline">The Inverse Relationship Between Price and Yield</a></li>
        <li><a href="#yield-types" className="hover:underline">YTM vs. Coupon Rate and Current Yield</a></li>
        <li><a href="#assumptions" className="hover:underline">Key Assumptions and Limitations of YTM</a></li>
    </ul>
<hr />

    {/* YTM: DEFINITION AND INTERNAL RATE OF RETURN (IRR) */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">YTM: Definition and Internal Rate of Return (IRR)</h2>
    <p>The **Yield to Maturity (YTM)** is the single rate of return that equates the present value (PV) of a bond's future cash flows (coupon payments and the face value) to its current market price. It is the most comprehensive measure of a bond's total return.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">YTM as Internal Rate of Return (IRR)</h3>
    <p>YTM is mathematically equivalent to the **Internal Rate of Return (IRR)** of a bond. If an investor purchases the bond at the current market price and holds it until maturity, YTM is the annualized rate of return they will earn, assuming all conditions of the bond contract are met.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Key Bond Components</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Coupon Rate:</strong> The fixed annual percentage of the face value the issuer pays as interest.</li>
        <li><strong className="font-semibold">Face Value (Par Value):</strong> The principal amount repaid at maturity (typically 1,000 dollars).</li>
        <li><strong className="font-semibold">Current Price:</strong> The bond's price in the open market (the investment outlay).</li>
        <li><strong className="font-semibold">Time to Maturity:</strong> The number of years remaining until the face value is repaid.</li>
    </ul>

<hr />

    {/* THE YTM FORMULA AND CALCULATION MECHANICS */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The YTM Formula and Calculation Mechanics</h2>
    <p>YTM cannot be solved directly with a simple algebraic formula; it requires trial-and-error, financial calculators, or iterative numerical methods because the rate is embedded within the present value equation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity (The Valuation Equation)</h3>
    <p>YTM is the discount rate ($r$) that makes the bond's current price equal to the sum of the present values of all future cash flows (coupon annuity plus face value lump sum):</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Bond Price = PV (Coupons) + PV (Face Value)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Bond Price Formula</h3>
    <p>The detailed calculation discounts both parts of the cash flow stream:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Bond Price = Sum [ C / (1+r)^t ] + F / (1+r)^T'}
        </p>
    </div>
    <p>Where $C$ is the periodic coupon payment, $F$ is the face value, $r$ is the YTM, $t$ is the payment period, and $T$ is the total number of periods remaining.</p>

<hr />

    {/* THE INVERSE RELATIONSHIP BETWEEN PRICE AND YIELD */}
    <h2 id="price-yield" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Inverse Relationship Between Price and Yield</h2>
    <p>A fundamental principle in bond analysis is that **bond prices and yields move inversely**. As market interest rates rise, existing bond prices must fall to make their fixed coupon rates attractive to new investors, and vice versa.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Pricing Scenarios Based on YTM</h3>
    <ul className="list-disc ml-6 space-y-2">
    <li><strong className="font-semibold">Premium Bond (YTM &lt; Coupon Rate):</strong> The bond's market price is higher than its face value. This occurs when the market interest rate is lower than the bond's fixed coupon rate.</li>
        <li><strong className="font-semibold">Par Bond (YTM = Coupon Rate):</strong> The bond's market price is exactly equal to its face value.</li>
        <li><strong className="font-semibold">Discount Bond (YTM {'>'} Coupon Rate):</strong> The bond's market price is lower than its face value. This occurs when the market interest rate is higher than the bond's fixed coupon rate.</li>
    </ul>
    <p>A bond trading at a premium will have a YTM lower than its coupon rate, indicating the yield is "pulled down" by the eventual loss incurred when the bond matures at par value.</p>

<hr />

    {/* YTM VS. COUPON RATE AND CURRENT YIELD */}
    <h2 id="yield-types" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">YTM vs. Coupon Rate and Current Yield</h2>
    <p>It is crucial to distinguish YTM from other common bond metrics, as YTM is the only one that reflects the total annualized return.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Coupon Rate</h3>
    <p>The Coupon Rate is simply the contractual interest rate set by the issuer at the time the bond is issued. It is fixed and based on the face value, not the market price. It is not an accurate indicator of current return.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Current Yield</h3>
    <p>The Current Yield measures the annual coupon payment relative to the bond's **current market price** (Current Yield = Annual Coupon / Market Price). It is a simple return ratio but fails to account for either the time value of money or the eventual capital gain/loss at maturity.</p>
    <p>YTM is the only metric that considers the time value of money, the current market price, the coupon rate, and the capital gain or loss that occurs when the bond matures at par value.</p>

<hr />

    {/* KEY ASSUMPTIONS AND LIMITATIONS OF YTM */}
    <h2 id="assumptions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Assumptions and Limitations of YTM</h2>
    <p>YTM is a powerful forecasting tool but relies on two major assumptions that may not hold true in the real world.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. The Reinvestment Assumption</h3>
    <p>YTM assumes that all cash flows received from the bond (coupon payments) are immediately and continually reinvested at a rate exactly equal to the calculated YTM. If the actual interest rates available in the market are lower than the YTM, the investor's actual realized return will be lower than the YTM.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Holding Period Assumption</h3>
    <p>YTM is only realized if the investor holds the bond exactly until its maturity date. If the investor sells the bond early, the realized return will depend entirely on the market price at the time of sale, which could be higher or lower than the price predicted by the initial YTM calculation.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Yield to Maturity (YTM) is the definitive measure of a bond's total return, mathematically equivalent to its **Internal Rate of Return (IRR)**. It is the discount rate that equates the bond's price to the present value of all its future cash flows.</p>
    <p>Understanding YTM is essential for fixed income analysis, as it confirms the **inverse relationship between price and yield** and provides the necessary benchmark for evaluating investment returns against market interest rates.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Yield to Maturity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is Yield to Maturity (YTM)?</h4>
              <p className="text-muted-foreground">
                Yield to Maturity (YTM) is the total return anticipated on a bond if held until maturity. It's the internal rate of return (IRR) of an investment in a bond, considering the bond's current market price, par value, coupon interest rate, and time to maturity. YTM is expressed as an annual percentage rate.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I calculate YTM?</h4>
              <p className="text-muted-foreground">
                YTM is calculated using an iterative process that finds the discount rate that makes the present value of all future cash flows (coupon payments and face value) equal to the current bond price. The formula involves solving for the rate where: Current Price = Σ(Coupon Payment / (1 + YTM)^t) + Face Value / (1 + YTM)^n.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between YTM and coupon rate?</h4>
              <p className="text-muted-foreground">
                The coupon rate is the fixed interest rate paid annually on the bond's face value, while YTM is the total return including both coupon payments and any capital gain or loss from price changes. YTM considers the bond's current market price, while coupon rate is fixed at issuance. YTM can be higher or lower than the coupon rate depending on market conditions.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does it mean when YTM is higher than coupon rate?</h4>
              <p className="text-muted-foreground">
                When YTM is higher than the coupon rate, it typically means the bond is trading at a discount (below face value). This occurs when market interest rates have risen since the bond was issued, making the bond less attractive. The higher YTM compensates for the discount and provides the total return including the capital gain from the discount.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What does it mean when YTM is lower than coupon rate?</h4>
              <p className="text-muted-foreground">
                When YTM is lower than the coupon rate, it typically means the bond is trading at a premium (above face value). This occurs when market interest rates have fallen since the bond was issued, making the bond more attractive. The lower YTM reflects the capital loss from the premium, reducing the total return.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does YTM change with interest rates?</h4>
              <p className="text-muted-foreground">
                YTM and market interest rates move in opposite directions. When market rates rise, bond prices fall, increasing YTM. When market rates fall, bond prices rise, decreasing YTM. This inverse relationship is fundamental to bond pricing and helps investors understand how interest rate changes affect bond values.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the assumptions of YTM?</h4>
              <p className="text-muted-foreground">
                YTM assumes that all coupon payments are reinvested at the YTM rate, the bond is held to maturity, there's no default risk, and interest rates remain constant. These assumptions may not hold in reality, making YTM a theoretical measure. Actual returns may differ due to reinvestment risk and interest rate changes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use YTM for investment decisions?</h4>
              <p className="text-muted-foreground">
                Use YTM to compare bonds with different prices, coupon rates, and maturities. Compare YTM to current market interest rates and other investment opportunities. Consider YTM relative to your required rate of return and risk tolerance. YTM helps identify whether a bond offers attractive returns for its risk level.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors affect YTM calculations?</h4>
              <p className="text-muted-foreground">
                Key factors include current bond price, face value, coupon rate, time to maturity, and payment frequency. Market interest rates, credit risk, and liquidity also affect YTM indirectly through their impact on bond prices. Changes in any of these factors will affect the calculated YTM.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is YTM important for bond investors?</h4>
              <p className="text-muted-foreground">
                YTM is important because it provides a standardized way to compare bonds, helps assess whether a bond is fairly priced, and gives investors a clear expectation of total return. It's essential for portfolio construction, risk assessment, and making informed investment decisions in the bond market.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}