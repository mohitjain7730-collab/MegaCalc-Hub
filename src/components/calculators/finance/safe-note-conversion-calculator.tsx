'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSignature, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, CheckCircle2, AlertTriangle, Percent, PieChart, FunctionSquare, Users, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  safeInvestment: z.number().positive('Enter SAFE investment amount'),
  valuationCap: z.number().positive('Enter valuation cap'),
  discountPercent: z.number().min(0).max(100),
  preMoneyShares: z.number().positive('Enter pre-money fully diluted shares'),
  roundPricePerShare: z.number().positive('Enter round price per share'),
});

type FormValues = z.infer<typeof formSchema>;

export default function SafeNoteConversionCalculator() {
  const [result, setResult] = useState<{
    capPrice: number;
    discountPrice: number;
    conversionPrice: number;
    sharesIssued: number;
    ownershipPercent: number;
    conversionMethod: 'cap' | 'discount';
    interpretation: string;
    recommendation: string;
    strength: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      safeInvestment: undefined,
      valuationCap: undefined,
      discountPercent: 20,
      preMoneyShares: undefined,
      roundPricePerShare: undefined,
    },
  });

  const calculate = (v: FormValues): {
    capPrice: number;
    discountPrice: number;
    conversionPrice: number;
    sharesIssued: number;
    ownershipPercent: number;
    conversionMethod: 'cap' | 'discount';
  } => {
    const capPrice = v.valuationCap / v.preMoneyShares;
    const discountPrice = v.roundPricePerShare * (1 - v.discountPercent / 100);
    const conversionPrice = Math.min(capPrice, discountPrice);
    const sharesIssued = v.safeInvestment / conversionPrice;
    const postConversionShares = v.preMoneyShares + sharesIssued;
    const ownershipPercent = (sharesIssued / postConversionShares) * 100;
    const conversionMethod: 'cap' | 'discount' = conversionPrice <= discountPrice && conversionPrice < capPrice ? 'discount' : 'cap';
    return {
      capPrice,
      discountPrice,
      conversionPrice,
      sharesIssued,
      ownershipPercent,
      conversionMethod,
    };
  };

  const getInterpretation = (ownershipPercent: number, conversionMethod: string) => {
    if (ownershipPercent >= 15) return `Strong SAFE outcome: ${ownershipPercent.toFixed(1)}% ownership. Conversion favored the investor via ${conversionMethod} pricing.`;
    if (ownershipPercent >= 5) return `Typical SAFE outcome: ${ownershipPercent.toFixed(1)}% ownership. Conversion at ${conversionMethod} price is market-consistent.`;
    return `Modest SAFE outcome: ${ownershipPercent.toFixed(1)}% ownership. Smaller check or higher round valuation.`;
  };

  const getStrength = (ownershipPercent: number) => {
    if (ownershipPercent >= 15) return 'Strong';
    if (ownershipPercent >= 5) return 'Moderate';
    return 'Modest';
  };

  const getInsights = (ownershipPercent: number, conversionMethod: string) => {
    const insights: string[] = [];
    insights.push(`Conversion used the ${conversionMethod} price (whichever was lower for the investor).`);
    if (conversionMethod === 'cap') insights.push('Valuation cap limited conversion price; early investor benefit.');
    else insights.push('Discount rate applied; conversion at a discount to the round price.');
    if (ownershipPercent >= 10) insights.push('Meaningful post-conversion ownership; model dilution in cap table.');
    insights.push('SAFEs do not accrue interest; conversion is on principal only.');
    return insights;
  };

  const getRecommendation = (ownershipPercent: number) => {
    if (ownershipPercent >= 15) return 'Model full cap table including this SAFE and new round; ensure dilution is acceptable to founders.';
    if (ownershipPercent >= 5) return 'Validate conversion price vs market; include in cap table for accurate post-round ownership.';
    return 'Small ownership impact; still model all SAFEs together for total dilution.';
  };

  const getConsiderations = () => [
    'Post-money vs pre-money SAFE affects how the cap is applied; confirm your instrument type.',
    'Multiple SAFEs convert in order; run a full cap table for accurate ownership.',
    'Option pool and new round shares are not included in this ownership %; use a full cap table for precision.',
    'Valuation cap and discount are set at signing; round terms are known only at conversion.',
  ];

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      interpretation: getInterpretation(calc.ownershipPercent, calc.conversionMethod),
      recommendation: getRecommendation(calc.ownershipPercent),
      strength: getStrength(calc.ownershipPercent),
      insights: getInsights(calc.ownershipPercent, calc.conversionMethod),
      considerations: getConsiderations(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            SAFE Note Parameters
          </CardTitle>
          <CardDescription>
            Enter your SAFE (Simple Agreement for Future Equity) terms and the next round details to compute conversion price, shares, and ownership.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="safeInvestment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        SAFE Investment Amount ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
                          placeholder="e.g., 500000"
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
                  name="valuationCap"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Valuation Cap ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="100000"
                          placeholder="e.g., 8000000"
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
                  name="discountPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Discount (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min={0}
                          max={100}
                          placeholder="e.g., 20"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) ?? undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="preMoneyShares"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        Pre-Money Fully Diluted Shares
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 10000000"
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
                  name="roundPricePerShare"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Next Round Price Per Share ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g., 1.50"
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
                Calculate SAFE Conversion
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <FileSignature className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>SAFE Conversion Result</CardTitle>
                  <CardDescription>Conversion price, shares issued, and ownership</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.conversionPrice.toFixed(4)}</p>
                <p className="text-lg text-muted-foreground mt-2">Conversion price per share</p>
                <p className="text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Shares Issued</p>
                  <p className="text-lg font-bold">{result.sharesIssued.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <PieChart className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Ownership %</p>
                  <Badge variant={result.strength === 'Strong' ? 'default' : result.strength === 'Moderate' ? 'secondary' : 'outline'}>
                    {result.ownershipPercent.toFixed(2)}%
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Conversion method</p>
                  <p className="text-sm font-medium capitalize">{result.conversionMethod}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Cap price:</span> ${result.capPrice.toFixed(4)}
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">Discount price:</span> ${result.discountPrice.toFixed(4)}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Strategic Insights
                </CardTitle>
                <CardDescription>SAFE conversion implications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Risk Assessment
                </CardTitle>
                <CardDescription>Critical factors to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.considerations.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs (SAFE-Specific)
          </CardTitle>
          <CardDescription>Key terms used in SAFE note conversion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                SAFE Investment & Valuation Cap
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The amount invested under the SAFE (no interest accrues). The valuation cap is the maximum company valuation at which the SAFE converts—it protects the investor if the company raises at a higher valuation later.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>SAFE principal only (no interest)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Cap = ceiling on conversion valuation</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Percent className="h-4 w-4" />
                Discount & Round Price
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The discount gives the SAFE holder a percentage off the next round’s price. Round price per share is the price in the qualifying equity round (e.g. Series A). Pre-money fully diluted shares are used to derive the cap-based conversion price.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Discount typically 15–25%</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Conversion = lesser of cap price vs discount price</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FunctionSquare className="h-5 w-5" />
            Formula Used
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm text-center">
              Cap price = Valuation Cap ÷ Pre-money fully diluted shares
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Discount price = Round price × (1 − Discount %)
            </p>
            <p className="font-mono text-sm text-center font-semibold text-primary mt-2">
              Conversion price = min(Cap price, Discount price)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Shares issued = SAFE investment ÷ Conversion price
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            SAFEs convert at the price that is more favorable to the investor (lower price = more shares). No interest is added to the SAFE amount.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Calculators
          </CardTitle>
          <CardDescription>Other startup and financing tools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/convertible-note-conversion-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileSignature className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Convertible Note Conversion</p>
                      <p className="text-sm text-muted-foreground">Principal + interest conversion</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/startup-valuation-pre-money-vs-post-money-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Startup Valuation (Pre vs Post)</p>
                      <p className="text-sm text-muted-foreground">Pre-money & post-money valuation</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/founder-dilution-after-funding-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Founder Dilution After Funding</p>
                      <p className="text-sm text-muted-foreground">Ownership after a round</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/equity-cap-table-generator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Equity Cap Table Generator</p>
                      <p className="text-sm text-muted-foreground">Ownership breakdown</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/safe-convertible-note-conversion-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">SAFE / Convertible Note (Combined)</p>
                      <p className="text-sm text-muted-foreground">Unified conversion tool</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/finance/option-pool-allocation-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Option Pool Allocation</p>
                      <p className="text-sm text-muted-foreground">Pool size and dilution</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
        <meta itemProp="name" content="The Definitive Guide to SAFE Note Conversion: Valuation Cap, Discount, and Equity" />
        <meta itemProp="description" content="An expert guide to SAFE (Simple Agreement for Future Equity) conversion: how valuation cap and discount determine conversion price, shares issued, and ownership at a qualifying equity round." />
        <meta itemProp="keywords" content="SAFE note conversion, valuation cap, discount, pre-money SAFE, post-money SAFE, startup financing, equity conversion" />
        <meta itemProp="author" content="Mycalculating.com" />
        <meta itemProp="datePublished" content="2025-01-01" />
        <meta itemProp="url" content="/finance/safe-note-conversion-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to SAFE Note Conversion: Valuation Cap, Discount, and Equity</h1>
        <p className="text-lg italic text-muted-foreground">How SAFEs (Simple Agreements for Future Equity) convert into equity when a company raises a priced round.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#safe-definition" className="hover:underline">What is a SAFE?</a></li>
          <li><a href="#safe-cap-discount" className="hover:underline">Valuation Cap and Discount</a></li>
          <li><a href="#safe-formula" className="hover:underline">SAFE Conversion Formula</a></li>
          <li><a href="#safe-post-vs-pre" className="hover:underline">Post-Money vs Pre-Money SAFEs</a></li>
          <li><a href="#safe-vs-note" className="hover:underline">SAFE vs Convertible Note</a></li>
        </ul>
        <hr />

        <h2 id="safe-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a SAFE?</h2>
        <p>A SAFE is an agreement that gives the investor the right to receive equity in a future round. It is not a loan—no interest accrues. At conversion (usually the first qualifying equity round), the SAFE amount is converted into shares at a conversion price determined by the &quot;lesser of&quot; the valuation cap and the discount.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Not Debt</h3>
        <p>Unlike convertible notes, SAFEs do not accrue interest. Conversion is on principal only. This simplifies cap table modeling and avoids debt treatment for the company.</p>
        <hr />

        <h2 id="safe-cap-discount" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Valuation Cap and Discount</h2>
        <p>The <strong>valuation cap</strong> sets a maximum company valuation for conversion. If the company raises at a higher pre-money valuation, the SAFE still converts as if the company were worth the cap, so the investor gets more shares. The <strong>discount</strong> gives a percentage off the price per share in the next round. The conversion price is the <strong>lower</strong> of (1) cap-derived price and (2) discount-derived price.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Why the Lesser Of?</h3>
        <p>Using the lower price gives the SAFE holder the better rate—more shares for the same investment. The cap protects against high later valuations; the discount rewards early investment relative to the round price.</p>
        <hr />

        <h2 id="safe-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">SAFE Conversion Formula</h2>
        <p>Cap price = Valuation Cap ÷ Pre-money fully diluted shares. Discount price = Round price × (1 − Discount %). Conversion price = min(Cap price, Discount price). Shares issued = SAFE investment ÷ Conversion price.</p>
        <hr />

        <h2 id="safe-post-vs-pre" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Post-Money vs Pre-Money SAFEs</h2>
        <p>Post-money SAFEs fix the investor’s ownership as a percentage of the company immediately after the SAFE investment (on a post-money basis). Pre-money SAFEs use a pre-money cap and can result in more dilution to founders when the round is large. Always confirm which form you are using.</p>
        <hr />

        <h2 id="safe-vs-note" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">SAFE vs Convertible Note</h2>
        <p>SAFEs do not accrue interest; convertible notes do. For notes, the conversion amount is principal + accrued interest. Use the Convertible Note Conversion Calculator for notes; use this calculator for SAFEs.</p>
        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>This calculator gives you the conversion price, number of shares issued, and approximate ownership for a single SAFE. For multiple SAFEs and a full cap table including the new round and option pool, use an equity cap table tool or model all instruments together.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about SAFE note conversion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Do SAFEs accrue interest?</h4>
              <p className="text-muted-foreground">No. Unlike convertible notes, SAFEs do not accrue interest. Conversion is based only on the principal amount invested.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How is the conversion price determined?</h4>
              <p className="text-muted-foreground">The conversion price is the <strong>lower</strong> of (1) the cap price = Valuation Cap ÷ Pre-money fully diluted shares, and (2) the discount price = Round price × (1 − Discount %). This gives the SAFE holder the better rate.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is the difference between post-money and pre-money SAFEs?</h4>
              <p className="text-muted-foreground">Post-money SAFEs define the investor’s percentage based on the company valuation including the SAFE investment. Pre-money SAFEs use a pre-money cap; ownership depends on the size of the future round and can create more dilution for founders.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">When do SAFEs convert?</h4>
              <p className="text-muted-foreground">Typically at the first qualifying equity round (e.g. Series A) when the company issues shares at a set price. The SAFE document will define what qualifies (e.g. minimum raise size).</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a valuation cap?</h4>
              <p className="text-muted-foreground">The valuation cap is the maximum company valuation at which the SAFE converts. If the company raises at a higher pre-money valuation, the SAFE still converts as if the company were worth the cap, so the early investor receives more shares.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What discount is typical for SAFEs?</h4>
              <p className="text-muted-foreground">Discounts of 15% to 25% are common. The discount gives the SAFE holder a percentage off the price per share in the next equity round. Combined with a cap, the investor gets the better of the two (lower conversion price).</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do multiple SAFEs interact?</h4>
              <p className="text-muted-foreground">Each SAFE converts in a defined order (usually by date). Conversion of one SAFE increases total shares, which can affect the effective price for later SAFEs. Model all SAFEs in a full cap table for accurate ownership.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is my ownership % only approximate?</h4>
              <p className="text-muted-foreground">This calculator divides SAFE shares by (pre-money shares + SAFE shares). It does not include the new round investment shares or the option pool. For exact post-round ownership, use a full cap table that includes the new round and all instruments.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Can a SAFE convert at maturity without a round?</h4>
              <p className="text-muted-foreground">Some SAFEs have a maturity date; conversion terms at maturity (e.g. at cap) vary by document. Many SAFEs convert only upon a qualifying equity round. Check your SAFE terms.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How does a SAFE differ from a convertible note?</h4>
              <p className="text-muted-foreground">A SAFE is not debt and does not accrue interest. A convertible note is debt and typically accrues interest until conversion; the conversion amount is principal + interest. Both use valuation cap and discount to set the conversion price.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Practical applications and real-world context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Founders</strong>
                <span className="text-sm text-muted-foreground">To see how a single SAFE converts and affects ownership before signing or at a planned round.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Angel Investors / Early Investors</strong>
                <span className="text-sm text-muted-foreground">To estimate conversion price, shares, and ownership from cap and discount terms.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Advisors & Lawyers</strong>
                <span className="text-sm text-muted-foreground">To validate term sheet math and explain conversion to clients.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Students & Analysts</strong>
                <span className="text-sm text-muted-foreground">To understand SAFE mechanics and the lesser-of cap vs discount.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & Accuracy nuances
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Ownership %:</strong> Excludes new round shares and option pool; use a full cap table for exact dilution.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Multiple SAFEs:</strong> Convert in a defined order; model each SAFE and the round together for accuracy.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Post-money vs pre-money:</strong> This calculator uses pre-money shares and round price; confirm your SAFE form (post-money vs pre-money) for cap interpretation.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Landmark className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Cap applies (company raised at high valuation)</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  $500K SAFE with $6M cap, 20% discount. Company raises Series A at $15M pre-money, $2/share. Cap price = $6M ÷ 7.5M = $0.80; discount price = $2 × 0.8 = $1.60. Conversion at $0.80 (cap) → 625,000 shares. The cap protected the early investor.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Discount applies (round valuation near cap)</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Same $500K SAFE, $6M cap, 20% discount. Company raises at $5M pre-money, $0.50/share. Cap price = $6M ÷ 10M = $0.60; discount price = $0.50 × 0.8 = $0.40. Conversion at $0.40 (discount) → 1,250,000 shares. The discount gave the better rate.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The SAFE Note Conversion Calculator computes conversion price (using the lesser of cap price and discount price), shares issued, and approximate ownership for a single SAFE at a qualifying equity round.</p>
          <p>SAFEs do not accrue interest. For convertible notes with interest, use the Convertible Note Conversion Calculator.</p>
          <p>Use this tool to validate term sheets and plan cap table impact; for multiple SAFEs and full dilution, use an equity cap table or full model.</p>
        </CardContent>
      </Card>
    </div>
  );
}
