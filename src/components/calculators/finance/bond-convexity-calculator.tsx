'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, Activity, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  faceValue: z.number().positive(),
  couponRate: z.number().nonnegative(),
  years: z.number().positive(),
  yieldToMaturity: z.number().nonnegative(),
  paymentsPerYear: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BondConvexityCalculator() {
  const [result, setResult] = useState<{ 
    convexity: number;
    interpretation: string; 
    convexityLevel: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      faceValue: undefined,
      couponRate: undefined,
      years: undefined,
      yieldToMaturity: undefined,
      paymentsPerYear: undefined,
    },
  });

  const calculateBondPrice = (values: FormValues): number => {
    const { faceValue, couponRate, years, yieldToMaturity, paymentsPerYear } = values;
    const y = yieldToMaturity / 100 / paymentsPerYear;
    const c = (couponRate / 100) * faceValue / paymentsPerYear;
    const n = years * paymentsPerYear;

    let price = 0;
    for (let t = 1; t <= n; t++) {
      price += c / Math.pow(1 + y, t);
    }
    price += faceValue / Math.pow(1 + y, n);
    return price;
  };

  const calculateConvexity = (values: FormValues) => {
    const { faceValue, couponRate, years, yieldToMaturity, paymentsPerYear } = values;
    const y = yieldToMaturity / 100 / paymentsPerYear;
    const c = (couponRate / 100) * faceValue / paymentsPerYear;
    const n = years * paymentsPerYear;
    
    const bondPrice = calculateBondPrice(values);
    
    // Calculate Convexity
    let convexity = 0;
    for (let t = 1; t <= n; t++) {
      const pv = c / Math.pow(1 + y, t);
      convexity += (t * (t + 1) * pv) / bondPrice;
    }
    convexity += (n * (n + 1) * faceValue / Math.pow(1 + y, n)) / bondPrice;
    
    // Convert to annual convexity
    convexity = convexity / Math.pow(paymentsPerYear, 2);
    
    return convexity;
  };

  const interpret = (convexity: number, years: number) => {
    const convexityPerYear = convexity / years;
    
    if (convexityPerYear >= 50) return `Very high convexity bond with significant curvature in price-yield relationship - ${convexity.toFixed(1)} convexity.`;
    if (convexityPerYear >= 20) return `High convexity bond with substantial curvature in price-yield relationship - ${convexity.toFixed(1)} convexity.`;
    if (convexityPerYear >= 10) return `Moderate convexity bond with balanced curvature in price-yield relationship - ${convexity.toFixed(1)} convexity.`;
    if (convexityPerYear >= 5) return `Low convexity bond with minimal curvature in price-yield relationship - ${convexity.toFixed(1)} convexity.`;
    return `Very low convexity bond with linear price-yield relationship - ${convexity.toFixed(1)} convexity.`;
  };

  const getConvexityLevel = (convexity: number, years: number) => {
    const convexityPerYear = convexity / years;
    if (convexityPerYear >= 50) return 'Very High';
    if (convexityPerYear >= 20) return 'High';
    if (convexityPerYear >= 10) return 'Moderate';
    if (convexityPerYear >= 5) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (convexity: number, years: number) => {
    const convexityPerYear = convexity / years;
    
    if (convexityPerYear >= 50) return 'Very high convexity - consider for interest rate hedging and portfolio optimization.';
    if (convexityPerYear >= 20) return 'High convexity - good for interest rate risk management and yield curve strategies.';
    if (convexityPerYear >= 10) return 'Moderate convexity - suitable for balanced portfolio with reasonable convexity benefits.';
    if (convexityPerYear >= 5) return 'Low convexity - consider higher convexity bonds for better risk-return profile.';
    return 'Very low convexity - limited convexity benefits, consider other bond characteristics.';
  };

  const getStrength = (convexity: number, years: number) => {
    const convexityPerYear = convexity / years;
    if (convexityPerYear >= 50) return 'Very Strong';
    if (convexityPerYear >= 20) return 'Strong';
    if (convexityPerYear >= 10) return 'Good';
    if (convexityPerYear >= 5) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (convexity: number, years: number, couponRate: number) => {
    const insights = [];
    const convexityPerYear = convexity / years;
    
    if (convexityPerYear >= 50) {
      insights.push('Very high convexity benefits');
      insights.push('Significant price-yield curvature');
      insights.push('Excellent for rate hedging');
    } else if (convexityPerYear >= 20) {
      insights.push('High convexity benefits');
      insights.push('Substantial price-yield curvature');
      insights.push('Good for rate hedging');
    } else if (convexityPerYear >= 10) {
      insights.push('Moderate convexity benefits');
      insights.push('Balanced price-yield curvature');
      insights.push('Reasonable rate hedging');
    } else {
      insights.push('Limited convexity benefits');
      insights.push('Minimal price-yield curvature');
      insights.push('Basic rate characteristics');
    }
    
    if (couponRate > 0) {
      insights.push('Coupon payments affect convexity');
      insights.push('Income stream provides stability');
    } else {
      insights.push('Zero-coupon bond characteristics');
      insights.push('Maximum convexity for maturity');
    }
    
    insights.push(`Convexity per year: ${convexityPerYear.toFixed(1)}`);
    insights.push('Positive convexity benefits');
    
    return insights;
  };

  const getConsiderations = (convexity: number) => {
    const considerations = [];
    considerations.push('Convexity measures price-yield relationship curvature');
    considerations.push('Positive convexity provides price protection');
    considerations.push('Higher convexity = better price performance');
    considerations.push('Convexity complements duration analysis');
    considerations.push('Consider convexity in portfolio optimization');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const convexity = calculateConvexity(values);
    setResult({
      convexity,
      interpretation: interpret(convexity, values.years),
      convexityLevel: getConvexityLevel(convexity, values.years),
      recommendation: getRecommendation(convexity, values.years),
      strength: getStrength(convexity, values.years),
      insights: getInsights(convexity, values.years, values.couponRate),
      considerations: getConsiderations(convexity)
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <CardTitle>Bond Convexity Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate bond convexity to assess the curvature of the price-yield relationship and interest rate sensitivity
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="faceValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
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
                <FormField control={form.control} name="years" render={({ field }) => (
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
                      <TrendingUp className="h-4 w-4" />
                      Yield to Maturity (%)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter yield to maturity" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
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
          </div>
              <Button type="submit" className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Bond Convexity
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
                  <CardTitle>Bond Convexity Result</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.convexityLevel === 'Very Low' ? 'default' : result.convexityLevel === 'Low' ? 'secondary' : 'destructive'}>
                    {result.convexityLevel}
                  </Badge>
                  <Badge variant="outline">{result.strength}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-4xl font-bold text-primary">
                  {result.convexity.toFixed(1)}
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
    <meta itemProp="name" content="The Definitive Guide to Bond Convexity: Calculation, Interpretation, and Yield Curve Risk Management" />
    <meta itemProp="description" content="An expert guide detailing the Bond Convexity formula, its core role as the second-order measure of interest rate risk, its relationship with Duration, and its significance for assessing price sensitivity to large yield changes." />
    <meta itemProp="keywords" content="bond convexity formula explained, calculating bond convexity, convexity vs duration, interest rate risk fixed income, modified duration accuracy, yield curve risk management" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-12" /> 
    <meta itemProp="url" content="/definitive-bond-convexity-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Bond Convexity: The Secondary Measure of Interest Rate Risk</h1>
    <p className="text-lg italic text-gray-700">Master the advanced fixed income metric that quantifies the curvature of the bond price-yield relationship and improves price estimates for large yield changes.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Convexity: Definition and Relationship to Duration</a></li>
        <li><a href="#formula" className="hover:underline">The Bond Convexity Calculation Formula</a></li>
        <li><a href="#modified-duration" className="hover:underline">Modified Duration: The Linear Approximation Flaw</a></li>
        <li><a href="#price-change" className="hover:underline">Estimating Price Change with Convexity Adjustment</a></li>
        <li><a href="#interpretation" className="hover:underline">Interpretation and Portfolio Management</a></li>
    </ul>
<hr />

    {/* CONVEXITY: DEFINITION AND RELATIONSHIP TO DURATION */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Convexity: Definition and Relationship to Duration</h2>
    <p>Bond **Convexity** is a second-order risk measure that describes the curvature of the non-linear relationship between a bond's price and its yield to maturity (YTM). While **Duration** measures the price sensitivity of a bond (the first derivative), Convexity measures the rate of change of that sensitivity (the second derivative).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Non-Linear Price Curve</h3>
    <p>When YTM changes, the bond price does not change along a straight line; it changes along a curve. Duration is a tangent line approximation of this curve. Convexity quantifies the error between the linear estimate (Duration) and the actual curved price change.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Positive Convexity (Desirable)</h3>
    <p>Most non-callable bonds exhibit **positive convexity**. This means:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>The price gain when YTM falls is **greater** than the price loss when YTM rises by the same amount.</li>
        <li>Investors prefer bonds with higher positive convexity because they benefit more from favorable yield movements and lose less from unfavorable movements.</li>
    </ul>

<hr />

    {/* THE BOND CONVEXITY CALCULATION FORMULA */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Bond Convexity Calculation Formula</h2>
    <p>The calculation of convexity is mathematically intensive, involving the present value of all cash flows weighted by the square of the time until receipt.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity (Conceptual)</h3>
    <p>Convexity is calculated as the weighted average of the squared time until each cash flow is received, discounted by the YTM ($y$).</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Convexity = [ 1 / P * (1 + y)^2 ] * Sum [ CF_t * t^2 / (1 + y)^t ]'}
        </p>
    </div>
    <p>The core concept is that convexity increases significantly with time ($t^2$) and is inversely related to the bond price ($P$).</p>

<hr />

    {/* MODIFIED DURATION: THE LINEAR APPROXIMATION FLAW */}
    <h2 id="modified-duration" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Modified Duration: The Linear Approximation Flaw</h2>
    <p>The standard prediction of price change relies on Modified Duration, which assumes a straight line. Convexity corrects the error inherent in this simplification.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Duration's Error</h3>
    <p>Duration accurately predicts price changes for **small** shifts in YTM (e.g., 10 basis points). However, when the YTM shift is **large**, the linear duration estimate significantly underestimates the actual price increase when yields fall and overestimates the actual price decrease when yields rise. This divergence is the error that the convexity adjustment corrects.</p>

<hr />

    {/* ESTIMATING PRICE CHANGE WITH CONVEXITY ADJUSTMENT */}
    <h2 id="price-change" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Estimating Price Change with Convexity Adjustment</h2>
    <p>For accurate prediction of a bond's price change ($\Delta P$) following a large YTM change ($\Delta y$), the duration calculation must include the convexity term.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Full Price Change Formula</h3>
    <p>The formula for the estimated percentage price change is composed of the linear duration effect and the quadratic convexity effect:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'ΔP/P ≈ (-ModDur * Δy) + [ 0.5 * Convexity * (Δy)^2 ]'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Convexity Benefit (The Second Term)</h3>
    <p>The second term in the equation, 0.5 multiplied by Convexity multiplied by (Delta y squared), is the <strong className="font-semibold">Convexity Adjustment</strong>. Because convexity is usually positive and the yield change is squared (always positive), this adjustment term is always positive. It offsets the duration error, providing a more accurate estimate of the final bond price, particularly in periods of high interest rate volatility.</p>

<hr />

    {/* INTERPRETATION AND PORTFOLIO MANAGEMENT */}
    <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpretation and Portfolio Management</h2>
    <p>Convexity is a vital tool for institutional bond portfolio managers aiming to optimize risk and return across the yield curve.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">High Convexity Characteristics</h3>
    <p>Bonds with **higher convexity** generally possess the following characteristics:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li>Low coupon rates (e.g., zero-coupon bonds).</li>
        <li>Longer maturities.</li>
        <li>Lower current yields (high prices).</li>
    </ul>
    <p>A zero-coupon bond has the maximum possible convexity for its maturity because its price change is entirely due to discounting, with no intermediate cash flows.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Convexity in Strategy</h3>
    <p>Portfolio managers often view high, positive convexity as an insurance policy. They are willing to pay a slight premium (accept a slightly lower yield) for bonds with high convexity, knowing that this feature provides superior protection against rising yields (losing less) and generates higher gains when yields fall.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Bond Convexity is the sophisticated, second-order measure of interest rate risk, quantifying the **curvature** of the bond's price-yield relationship. It is indispensable because it corrects the estimation error inherent in the linear **Duration** metric, especially during large changes in YTM.</p>
    <p>High positive convexity is sought after in bond portfolios, as it guarantees a favorable asymmetry: prices rise more when rates fall than they drop when rates rise, providing a natural cushion against interest rate volatility.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Bond Convexity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is bond convexity?</h4>
              <p className="text-muted-foreground">
                Bond convexity measures the curvature of the price-yield relationship and provides additional information beyond duration about how bond prices respond to interest rate changes. Positive convexity means that bond prices increase more when yields fall than they decrease when yields rise by the same amount.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How is convexity calculated?</h4>
              <p className="text-muted-foreground">
                Convexity is calculated as the second derivative of the bond price with respect to yield, divided by the bond price. The formula involves summing the weighted present values of cash flows multiplied by t(t+1), where t is the time period. Higher convexity indicates greater curvature in the price-yield relationship.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between duration and convexity?</h4>
              <p className="text-muted-foreground">
                Duration measures the first-order (linear) sensitivity of bond prices to yield changes, while convexity measures the second-order (curvature) effects. Duration provides a linear approximation, while convexity captures the non-linear relationship. Together, they provide a more accurate picture of price sensitivity.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is convexity important?</h4>
              <p className="text-muted-foreground">
                Convexity is important because it provides additional information about price sensitivity beyond duration. Positive convexity is generally beneficial as it means bonds perform better than duration predicts when yields fall and worse when yields rise. This asymmetry can be valuable for portfolio optimization and risk management.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors affect bond convexity?</h4>
              <p className="text-muted-foreground">
                Key factors include time to maturity (longer = higher convexity), coupon rate (lower = higher convexity), yield to maturity (lower = higher convexity), and payment frequency. Zero-coupon bonds have the highest convexity for a given maturity, while high-coupon bonds have lower convexity.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use convexity for portfolio management?</h4>
              <p className="text-muted-foreground">
                Use convexity to optimize portfolio performance, implement interest rate hedging strategies, and assess the non-linear effects of rate changes. Higher convexity bonds can provide better risk-adjusted returns in volatile rate environments. Consider convexity when constructing portfolios for specific rate scenarios.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is positive vs negative convexity?</h4>
              <p className="text-muted-foreground">
                Positive convexity means bond prices increase more when yields fall than they decrease when yields rise. Most bonds have positive convexity. Negative convexity occurs when bond prices increase less when yields fall than they decrease when yields rise, often due to call features or prepayment options.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does convexity change over time?</h4>
              <p className="text-muted-foreground">
                Convexity generally decreases as bonds approach maturity, assuming constant yields. This is because there are fewer future cash flows to discount. Convexity also changes with yield changes - higher yields reduce convexity, while lower yields increase convexity. Regular monitoring and rebalancing may be needed.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of convexity?</h4>
              <p className="text-muted-foreground">
                Limitations include: assumes small yield changes, may not capture extreme market conditions, doesn't account for credit risk changes, and assumes constant yield curve shape. Convexity is most accurate for small yield changes and may not predict large rate movements accurately.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is convexity important for bond investors?</h4>
              <p className="text-muted-foreground">
                Convexity is important because it provides additional insights into bond price behavior, helps optimize portfolio performance, and enables more sophisticated risk management strategies. Understanding convexity helps investors make better decisions about bond selection and portfolio construction in various interest rate environments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}