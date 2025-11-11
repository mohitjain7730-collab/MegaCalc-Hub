'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, TrendingUp, Shield, BarChart3, Percent } from 'lucide-react';
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

export default function BondDurationCalculator() {
  const [result, setResult] = useState<{ 
    macaulayDuration: number;
    modifiedDuration: number;
    interpretation: string; 
    sensitivityLevel: string;
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

  const calculateDuration = (values: FormValues) => {
    const { faceValue, couponRate, years, yieldToMaturity, paymentsPerYear } = values;
    const y = yieldToMaturity / 100 / paymentsPerYear;
    const c = (couponRate / 100) * faceValue / paymentsPerYear;
    const n = years * paymentsPerYear;
    
    const bondPrice = calculateBondPrice(values);
    
    // Calculate Macaulay Duration
    let macaulayDuration = 0;
    for (let t = 1; t <= n; t++) {
      const pv = c / Math.pow(1 + y, t);
      macaulayDuration += (t * pv) / bondPrice;
    }
    macaulayDuration += (n * faceValue / Math.pow(1 + y, n)) / bondPrice;
    
    // Convert to years
    macaulayDuration = macaulayDuration / paymentsPerYear;
    
    // Calculate Modified Duration
    const modifiedDuration = macaulayDuration / (1 + y);
    
    return { macaulayDuration, modifiedDuration };
  };

  const interpret = (macaulayDuration: number, modifiedDuration: number, years: number) => {
    if (macaulayDuration >= years * 0.8) return `High duration bond with significant interest rate sensitivity - ${macaulayDuration.toFixed(1)} years Macaulay duration.`;
    if (macaulayDuration >= years * 0.6) return `Moderate duration bond with balanced interest rate sensitivity - ${macaulayDuration.toFixed(1)} years Macaulay duration.`;
    if (macaulayDuration >= years * 0.4) return `Lower duration bond with reduced interest rate sensitivity - ${macaulayDuration.toFixed(1)} years Macaulay duration.`;
    return `Very low duration bond with minimal interest rate sensitivity - ${macaulayDuration.toFixed(1)} years Macaulay duration.`;
  };

  const getSensitivityLevel = (modifiedDuration: number) => {
    if (modifiedDuration >= 8) return 'Very High';
    if (modifiedDuration >= 5) return 'High';
    if (modifiedDuration >= 3) return 'Moderate';
    if (modifiedDuration >= 1) return 'Low';
    return 'Very Low';
  };

  const getRecommendation = (modifiedDuration: number, years: number) => {
    if (modifiedDuration >= 8) return 'High interest rate sensitivity - consider shorter duration bonds or hedging strategies.';
    if (modifiedDuration >= 5) return 'Moderate interest rate sensitivity - monitor rate changes and consider duration management.';
    if (modifiedDuration >= 3) return 'Lower interest rate sensitivity - suitable for moderate rate environments.';
    if (modifiedDuration >= 1) return 'Low interest rate sensitivity - good for stable income with limited rate risk.';
    return 'Very low interest rate sensitivity - minimal rate risk but limited price appreciation potential.';
  };

  const getStrength = (modifiedDuration: number) => {
    if (modifiedDuration >= 8) return 'Weak';
    if (modifiedDuration >= 5) return 'Moderate';
    if (modifiedDuration >= 3) return 'Good';
    if (modifiedDuration >= 1) return 'Strong';
    return 'Very Strong';
  };

  const getInsights = (macaulayDuration: number, modifiedDuration: number, years: number, couponRate: number) => {
    const insights = [];
    
    if (macaulayDuration >= years * 0.8) {
      insights.push('High interest rate sensitivity');
      insights.push('Significant price volatility');
      insights.push('Long-term bond characteristics');
    } else if (macaulayDuration >= years * 0.6) {
      insights.push('Moderate interest rate sensitivity');
      insights.push('Balanced price volatility');
      insights.push('Medium-term bond characteristics');
    } else {
      insights.push('Low interest rate sensitivity');
      insights.push('Stable price characteristics');
      insights.push('Short-term bond characteristics');
    }
    
    if (couponRate > 0) {
      insights.push('Coupon payments reduce duration');
      insights.push('Income stream provides stability');
    } else {
      insights.push('Zero-coupon bond characteristics');
      insights.push('Maximum duration for maturity');
    }
    
    insights.push(`Modified duration: ${modifiedDuration.toFixed(2)}`);
    insights.push(`Price sensitivity to rate changes`);
    
    return insights;
  };

  const getConsiderations = (modifiedDuration: number) => {
    const considerations = [];
    considerations.push('Duration measures interest rate sensitivity');
    considerations.push('Higher duration = higher price volatility');
    considerations.push('Consider interest rate outlook');
    considerations.push('Duration changes over time');
    considerations.push('Use for portfolio risk management');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const duration = calculateDuration(values);
    setResult({
      macaulayDuration: duration.macaulayDuration,
      modifiedDuration: duration.modifiedDuration,
      interpretation: interpret(duration.macaulayDuration, duration.modifiedDuration, values.years),
      sensitivityLevel: getSensitivityLevel(duration.modifiedDuration),
      recommendation: getRecommendation(duration.modifiedDuration, values.years),
      strength: getStrength(duration.modifiedDuration),
      insights: getInsights(duration.macaulayDuration, duration.modifiedDuration, values.years, values.couponRate),
      considerations: getConsiderations(duration.modifiedDuration)
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <CardTitle>Bond Duration Calculator</CardTitle>
          </div>
          <CardDescription>
            Calculate Macaulay Duration and Modified Duration to assess bond interest rate sensitivity
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
                      <BarChart3 className="h-4 w-4" />
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
                Calculate Bond Duration
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
                  <CardTitle>Bond Duration Results</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Badge variant={result.sensitivityLevel === 'Very Low' ? 'default' : result.sensitivityLevel === 'Low' ? 'secondary' : 'destructive'}>
                    {result.sensitivityLevel}
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
                      {result.macaulayDuration.toFixed(2)} years
                    </div>
                    <p className="text-sm text-muted-foreground">Macaulay Duration</p>
                    </div>
                    <div>
                    <div className="text-3xl font-bold text-primary">
                      {result.modifiedDuration.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Modified Duration</p>
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

      <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Bond Duration: Macaulay, Modified, and Interest Rate Risk Measurement" />
    <meta itemProp="description" content="An expert guide detailing the Macaulay and Modified Duration formulas, their core role in measuring bond price sensitivity to interest rate changes (risk), and how duration is used for hedging and immunization strategies in fixed income portfolios." />
    <meta itemProp="keywords" content="bond duration formula explained, macaulay duration calculation, modified duration interest rate risk, duration vs maturity, convexity bond finance, fixed income hedging" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-11-11" /> 
    <meta itemProp="url" content="/definitive-bond-duration-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Bond Duration: The True Measure of Interest Rate Risk</h1>
    <p className="text-lg italic text-gray-700">Master the critical metric that quantifies how sensitive a bond’s price is to changes in market interest rates.</p>
    

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">Duration: Definition and Distinction from Maturity</a></li>
        <li><a href="#macaulay" className="hover:underline">Macaulay Duration: The Weighted Average Time</a></li>
        <li><a href="#modified" className="hover:underline">Modified Duration: The Price Sensitivity Metric</a></li>
        <li><a href="#drivers" className="hover:underline">Key Drivers of Duration (Coupon, Yield, Maturity)</a></li>
        <li><a href="#applications" className="hover:underline">Applications in Hedging and Portfolio Management</a></li>
    </ul>
<hr />

    {/* DURATION: DEFINITION AND DISTINCTION FROM MATURITY */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Duration: Definition and Distinction from Maturity</h2>
    <p>**Duration** is a measure of the effective life of a bond. It is expressed in years and represents the weighted average time until the bond's cash flows (coupon payments and principal) are received. Duration is the single most important tool for assessing the **interest rate risk** of a fixed income security.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Duration vs. Maturity</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Maturity:</strong> The actual contractual date on which the final principal is repaid. It is a fixed period.</li>
        <li><strong className="font-semibold">Duration:</strong> The effective time it takes to recover the bond's price through its total cash flows. Duration is always less than the bond's maturity (except for zero-coupon bonds), because cash flows are received over time, not just at the end.</li>
    </ul>
    <p>A bond with a longer duration is more sensitive to interest rate changes and is therefore riskier.</p>

<hr />

    {/* MACAULAY DURATION: THE WEIGHTED AVERAGE TIME */}
    <h2 id="macaulay" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Macaulay Duration: The Weighted Average Time</h2>
    <p>**Macaulay Duration** is the original duration measure. It calculates the weighted average time until all of a bond's cash flows are received, using the present value of each cash flow as the weight.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Macaulay Formula (Concept)</h3>
    <p>The formula finds the sum of the present value of all cash flows (CF) multiplied by the time (t) they are received, divided by the bond's current market price:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Macaulay Duration = [ Sum (t * PV(CF_t)) ] / Bond Price'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">YTM as the Discount Rate</h3>
    <p>The Macaulay Duration calculation requires that each future cash flow ($CF_t$) be discounted using the bond's **Yield to Maturity (YTM)** ($r$) as the discount rate. This ensures that the time of cash flows is weighted according to its economic value today.</p>

<hr />

    {/* MODIFIED DURATION: THE PRICE SENSITIVITY METRIC */}
    <h2 id="modified" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Modified Duration: The Price Sensitivity Metric</h2>
    <p>**Modified Duration** is the practical measure used by portfolio managers. It converts the Macaulay Duration into a direct, measurable percentage change in the bond's price for every 1% change in interest rates.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation Identity</h3>
    <p>Modified Duration is directly derived from Macaulay Duration, adjusting for the periodic Yield to Maturity:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Modified Duration = Macaulay Duration / (1 + YTM / n_p)'}
        </p>
    </div>
    <p>Where $n_p$ is the number of periods per year (e.g., 2 for semi-annual bonds). For a small change in YTM ($\Delta y$), the predicted price change ($\Delta P$) is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Percentage Price Change ≈ -Modified Duration * Change in YTM'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Interpretation as Interest Rate Risk</h3>
    <p>A bond with a Modified Duration of 5.0 means its price is expected to fall by approximately 5% for every 1% increase in market interest rates. This makes Modified Duration the clearest, most actionable measure of a bond's **interest rate risk**.</p>

<hr />

    {/* KEY DRIVERS OF DURATION (COUPON, YIELD, MATURITY) */}
    <h2 id="drivers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Drivers of Duration (Coupon, Yield, Maturity)</h2>
    <p>Three primary factors dictate a bond's duration and, therefore, its risk profile. Duration is always highest when the investor receives the majority of the cash flows later.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Maturity (Positive Relationship)</h3>
    <p>As the bond's time to maturity increases, its duration increases. This is the strongest driver, as longer-term bonds have greater exposure to future interest rate uncertainty.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Coupon Rate (Inverse Relationship)</h3>
    <p>A higher coupon rate means the investor receives larger cash flows earlier in the bond's life. This reduces the weighted average time until capital is recovered, thus **decreasing the bond's duration** and lowering its interest rate risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Yield to Maturity (YTM) (Inverse Relationship)</h3>
    <p>As the YTM increases, the Present Value of the distant cash flows decreases disproportionately. This effectively increases the weight given to the earlier, larger coupon payments, which **decreases the bond's duration**.</p>

<hr />

    {/* APPLICATIONS IN HEDGING AND PORTFOLIO MANAGEMENT */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Applications in Hedging and Portfolio Management</h2>
    <p>Duration is essential for fixed income portfolio management, guiding hedging strategies and portfolio construction.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Immunization Strategy</h3>
    <p>Portfolio managers use duration to **immunize** a portfolio—protect it against interest rate changes. If a fund needs to meet a specific liability date (e.g., in 7 years), the manager can build a portfolio whose Macaulay Duration matches that 7-year liability. This balances the price risk (loss when rates rise) with the reinvestment risk (gain when rates rise), ensuring the funds are available when needed.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Convexity (The Secondary Risk Measure)</h3>
    <p>Since the duration formula is a linear approximation of the bond's price-yield curve, it becomes less accurate for large changes in interest rates. **Convexity** is a secondary risk measure that quantifies the curvature of this relationship. Positive convexity is generally desirable as it means the bond's price will rise more when yields fall than it will fall when yields rise.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Duration is the definitive measure of a bond's **interest rate risk**. **Macaulay Duration** measures the weighted average time to cash flow receipt, while **Modified Duration** converts this into the predicted percentage change in price for every 1% movement in interest rates.</p>
    <p>Understanding the inverse relationship between duration and coupon rate is crucial for managing risk. Portfolio managers rely on duration for **immunization strategies** and for setting risk exposure based on market rate expectations.</p>
</section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about Bond Duration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is bond duration?</h4>
              <p className="text-muted-foreground">
                Bond duration measures the sensitivity of a bond's price to changes in interest rates. Macaulay Duration represents the weighted average time to receive cash flows, while Modified Duration measures the percentage change in bond price for a 1% change in yield. Duration is expressed in years and is a key risk measure.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between Macaulay and Modified Duration?</h4>
              <p className="text-muted-foreground">
                Macaulay Duration is the weighted average time to receive cash flows, expressed in years. Modified Duration is Macaulay Duration divided by (1 + yield), and it measures the percentage change in bond price for a 1% change in yield. Modified Duration is more commonly used for risk management and portfolio analysis.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does duration affect bond prices?</h4>
              <p className="text-muted-foreground">
                Duration measures interest rate sensitivity. Higher duration bonds experience larger price changes when interest rates change. For example, a bond with Modified Duration of 5 will see approximately a 5% price change for every 1% change in yield. Duration helps predict price volatility.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What factors affect bond duration?</h4>
              <p className="text-muted-foreground">
                Key factors include time to maturity (longer = higher duration), coupon rate (higher = lower duration), yield to maturity (higher = lower duration), and payment frequency. Zero-coupon bonds have the highest duration for a given maturity, while high-coupon bonds have lower duration.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I use duration for portfolio management?</h4>
              <p className="text-muted-foreground">
                Use duration to assess portfolio interest rate risk, match assets and liabilities, immunize portfolios against rate changes, and optimize risk-return profiles. Calculate portfolio duration as the weighted average of individual bond durations. Adjust duration based on interest rate outlook.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What is duration matching?</h4>
              <p className="text-muted-foreground">
                Duration matching involves matching the duration of assets and liabilities to minimize interest rate risk. This strategy is used in immunization, where portfolio duration equals the investment horizon. Duration matching helps ensure that assets and liabilities respond similarly to interest rate changes.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How does duration change over time?</h4>
              <p className="text-muted-foreground">
                Duration generally decreases as bonds approach maturity, assuming constant yields. This is because there are fewer future cash flows to discount. Duration also changes with yield changes - higher yields reduce duration, while lower yields increase duration. Regular rebalancing may be needed.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">What are the limitations of duration?</h4>
              <p className="text-muted-foreground">
                Duration assumes small, parallel shifts in the yield curve and doesn't account for convexity effects. It may not accurately predict price changes for large rate movements. Duration doesn't consider credit risk changes, call features, or other bond characteristics that affect pricing.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">How do I interpret duration results?</h4>
              <p className="text-muted-foreground">
                Higher duration indicates greater interest rate sensitivity and price volatility. Compare duration to your risk tolerance and investment horizon. Use duration to assess whether a bond fits your portfolio's risk profile. Consider duration in the context of interest rate expectations.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is duration important for bond investors?</h4>
              <p className="text-muted-foreground">
                Duration is crucial for understanding interest rate risk, comparing bonds with different characteristics, constructing balanced portfolios, and making informed investment decisions. It helps investors assess whether bond investments align with their risk tolerance and investment objectives.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}