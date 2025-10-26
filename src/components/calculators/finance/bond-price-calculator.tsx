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
  faceValue: z.number().positive(),
  couponRate: z.number().nonnegative(),
  years: z.number().positive(),
  yieldToMaturity: z.number().nonnegative(),
  paymentsPerYear: z.number().int().positive(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BondPriceCalculator() {
  const [result, setResult] = useState<{ 
    bondPrice: number;
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

  const interpret = (bondPrice: number, faceValue: number, couponRate: number, yieldToMaturity: number) => {
    const premiumDiscount = ((bondPrice - faceValue) / faceValue) * 100;
    
    if (bondPrice > faceValue) {
      return `Premium bond trading at ${premiumDiscount.toFixed(1)}% above face value - priced above par due to coupon rate (${couponRate.toFixed(1)}%) exceeding YTM (${yieldToMaturity.toFixed(1)}%).`;
    } else if (bondPrice < faceValue) {
      return `Discount bond trading at ${Math.abs(premiumDiscount).toFixed(1)}% below face value - priced below par due to YTM (${yieldToMaturity.toFixed(1)}%) exceeding coupon rate (${couponRate.toFixed(1)}%).`;
    } else {
      return `Par bond trading at face value - coupon rate (${couponRate.toFixed(1)}%) equals YTM (${yieldToMaturity.toFixed(1)}%).`;
    }
  };

  const getValuationLevel = (bondPrice: number, faceValue: number) => {
    const premiumDiscount = ((bondPrice - faceValue) / faceValue) * 100;
    
    if (premiumDiscount >= 10) return 'High Premium';
    if (premiumDiscount >= 5) return 'Premium';
    if (premiumDiscount >= 0) return 'At Par';
    if (premiumDiscount >= -5) return 'Discount';
    if (premiumDiscount >= -10) return 'Deep Discount';
    return 'Very Deep Discount';
  };

  const getRecommendation = (bondPrice: number, faceValue: number, couponRate: number, yieldToMaturity: number) => {
    const premiumDiscount = ((bondPrice - faceValue) / faceValue) * 100;
    
    if (bondPrice > faceValue && couponRate > yieldToMaturity) {
      return 'Premium bond with attractive coupon - consider for income-focused investors despite premium pricing.';
    } else if (bondPrice < faceValue && yieldToMaturity > couponRate) {
      return 'Discount bond with higher yield - attractive investment opportunity for capital appreciation.';
    } else if (bondPrice === faceValue) {
      return 'Fair value bond - reasonable investment at current market pricing.';
    } else {
      return 'Evaluate market conditions - unusual pricing relationship between coupon and yield.';
    }
  };

  const getStrength = (bondPrice: number, faceValue: number, couponRate: number, yieldToMaturity: number) => {
    const premiumDiscount = Math.abs(((bondPrice - faceValue) / faceValue) * 100);
    const yieldSpread = Math.abs(yieldToMaturity - couponRate);
    
    if (premiumDiscount <= 2 && yieldSpread <= 1) return 'Strong';
    if (premiumDiscount <= 5 && yieldSpread <= 2) return 'Good';
    if (premiumDiscount <= 10 && yieldSpread <= 3) return 'Moderate';
    return 'Weak';
  };

  const getInsights = (bondPrice: number, faceValue: number, couponRate: number, yieldToMaturity: number) => {
    const insights = [];
    const premiumDiscount = ((bondPrice - faceValue) / faceValue) * 100;
    
    if (premiumDiscount > 0) {
      insights.push('Premium bond pricing');
      insights.push('Price above face value');
      insights.push('Coupon rate exceeds YTM');
    } else if (premiumDiscount < 0) {
      insights.push('Discount bond pricing');
      insights.push('Price below face value');
      insights.push('YTM exceeds coupon rate');
    } else {
      insights.push('Par bond pricing');
      insights.push('Price equals face value');
      insights.push('Coupon rate equals YTM');
    }
    
    if (couponRate > yieldToMaturity) {
      insights.push('Attractive coupon income');
    } else {
      insights.push('Higher yield potential');
    }
    
    return insights;
  };

  const getConsiderations = (bondPrice: number, faceValue: number, couponRate: number, yieldToMaturity: number) => {
    const considerations = [];
    const premiumDiscount = ((bondPrice - faceValue) / faceValue) * 100;
    
    if (premiumDiscount > 0) {
      considerations.push('Premium pricing reduces capital appreciation potential');
      considerations.push('Higher coupon payments offset premium cost');
      considerations.push('Consider call risk if bond is callable');
    } else if (premiumDiscount < 0) {
      considerations.push('Discount provides capital appreciation opportunity');
      considerations.push('Lower coupon payments but higher yield');
      considerations.push('Consider credit risk and default probability');
    }
    
    considerations.push('Interest rate sensitivity affects bond price');
    considerations.push('Credit quality impacts yield requirements');
    considerations.push('Market liquidity affects trading costs');
    
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const bondPrice = calculateBondPrice(values);
    const interpretation = interpret(bondPrice, values.faceValue, values.couponRate, values.yieldToMaturity);
    const valuationLevel = getValuationLevel(bondPrice, values.faceValue);
    const recommendation = getRecommendation(bondPrice, values.faceValue, values.couponRate, values.yieldToMaturity);
    const strength = getStrength(bondPrice, values.faceValue, values.couponRate, values.yieldToMaturity);
    const insights = getInsights(bondPrice, values.faceValue, values.couponRate, values.yieldToMaturity);
    const considerations = getConsiderations(bondPrice, values.faceValue, values.couponRate, values.yieldToMaturity);

    setResult({
      bondPrice,
      interpretation,
      valuationLevel,
      recommendation,
      strength,
      insights,
      considerations,
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Landmark className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-2xl font-bold">Bond Price Calculator</CardTitle>
              <CardDescription>
                Calculate the theoretical price of a bond based on face value, coupon rate, yield to maturity, and time to maturity.
              </CardDescription>
            </div>
          </div>
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
                <FormField control={form.control} name="couponRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
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
                      <Percent className="h-4 w-4" />
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
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Bond Price
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Bond Price Result
              <Badge variant={result.valuationLevel.includes('Premium') ? 'default' : 'secondary'}>
                {result.valuationLevel}
              </Badge>
              <Badge variant={result.strength === 'Strong' ? 'default' : 'secondary'}>
                {result.strength}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                ${result.bondPrice.toFixed(2)}
              </div>
              <p className="text-muted-foreground">Theoretical Bond Price</p>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {result.interpretation}
              </AlertDescription>
            </Alert>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {result.recommendation}
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Key Insights</h4>
                <ul className="space-y-1">
                  {result.insights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {insight}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Important Considerations</h4>
                <ul className="space-y-1">
                  {result.considerations.map((consideration, index) => (
                    <li key={index} className="text-sm text-muted-foreground">• {consideration}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Related Calculators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/category/finance/bond-yield-to-maturity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Bond YTM Calculator</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/bond-duration-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Bond Duration Calculator</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/bond-convexity-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Bond Convexity Calculator</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/bond-yield-spread-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Yield Spread Calculator</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/yield-to-call-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Yield to Call Calculator</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/zero-coupon-bond-valuation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-medium">Zero-Coupon Bond Calculator</span>
                  </div>
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
            Complete Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Understanding bond pricing is essential for fixed-income investors. This guide covers the fundamental concepts and calculations.
          </p>
          <p className="text-muted-foreground">
            Learn how to evaluate bond investments and make informed decisions based on theoretical pricing models.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2">What is bond price calculation?</h4>
            <p className="text-muted-foreground">
              Bond price calculation determines the theoretical value of a bond based on its face value, coupon rate, yield to maturity, and time to maturity. It uses present value calculations to discount future cash flows.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">How does coupon rate affect bond price?</h4>
            <p className="text-muted-foreground">
              Higher coupon rates generally result in higher bond prices, all else being equal. Bonds with coupon rates above the market yield trade at a premium, while bonds with lower coupon rates trade at a discount.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">What is the difference between premium and discount bonds?</h4>
            <p className="text-muted-foreground">
              Premium bonds trade above face value (coupon rate > YTM), while discount bonds trade below face value (YTM > coupon rate). Par bonds trade at face value when coupon rate equals YTM.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">How does time to maturity affect bond pricing?</h4>
            <p className="text-muted-foreground">
              Longer time to maturity increases bond price sensitivity to interest rate changes. Bonds with longer maturities have more periods for coupon payments and face value repayment, affecting their present value.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">What is the relationship between YTM and bond price?</h4>
            <p className="text-muted-foreground">
              Bond price and yield to maturity have an inverse relationship. When YTM increases, bond price decreases, and vice versa. This relationship is fundamental to bond valuation and market dynamics.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">How do payment frequencies affect bond pricing?</h4>
            <p className="text-muted-foreground">
              More frequent payments (e.g., semi-annual vs. annual) generally result in slightly higher bond prices due to earlier receipt of coupon payments. The effect is more pronounced for longer-term bonds.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">What factors influence bond market pricing?</h4>
            <p className="text-muted-foreground">
              Bond market pricing is influenced by interest rates, credit quality, market liquidity, supply and demand, economic conditions, and issuer-specific factors. These factors affect the required yield and thus the bond price.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">How accurate is theoretical bond pricing?</h4>
            <p className="text-muted-foreground">
              Theoretical pricing provides a baseline for bond valuation, but actual market prices may differ due to transaction costs, market inefficiencies, credit risk premiums, and liquidity considerations not captured in the basic model.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">What is the importance of bond pricing for investors?</h4>
            <p className="text-muted-foreground">
              Bond pricing helps investors determine fair value, identify investment opportunities, assess risk-return trade-offs, and make informed decisions about portfolio allocation and timing of bond purchases or sales.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">How can bond pricing help with portfolio management?</h4>
            <p className="text-muted-foreground">
              Bond pricing analysis helps portfolio managers optimize asset allocation, manage interest rate risk, identify mispriced securities, and construct portfolios that meet specific yield and duration targets while managing risk exposure.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}