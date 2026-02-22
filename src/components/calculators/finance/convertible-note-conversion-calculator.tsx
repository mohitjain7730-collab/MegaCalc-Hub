'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, TrendingUp, AlertCircle, Target, Info, Landmark, Calculator, DollarSign, BarChart3, Shield, CheckCircle2, Percent, PieChart, Clock, FunctionSquare, Users, Briefcase, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  principal: z.number().positive('Enter principal amount'),
  interestRatePercent: z.number().min(0).max(100),
  monthsToConversion: z.number().min(0),
  valuationCap: z.number().positive('Enter valuation cap'),
  discountPercent: z.number().min(0).max(100),
  preMoneyShares: z.number().positive('Enter pre-money fully diluted shares'),
  roundPricePerShare: z.number().positive('Enter round price per share'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConvertibleNoteConversionCalculator() {
  const [result, setResult] = useState<{
    accruedInterest: number;
    conversionAmount: number;
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
      principal: undefined,
      interestRatePercent: 0,
      monthsToConversion: 12,
      valuationCap: undefined,
      discountPercent: 20,
      preMoneyShares: undefined,
      roundPricePerShare: undefined,
    },
  });

  const calculate = (v: FormValues): {
    accruedInterest: number;
    conversionAmount: number;
    capPrice: number;
    discountPrice: number;
    conversionPrice: number;
    sharesIssued: number;
    ownershipPercent: number;
    conversionMethod: 'cap' | 'discount';
  } => {
    const accruedInterest = v.principal * (v.interestRatePercent / 100) * (v.monthsToConversion / 12);
    const conversionAmount = v.principal + accruedInterest;
    const capPrice = v.valuationCap / v.preMoneyShares;
    const discountPrice = v.roundPricePerShare * (1 - v.discountPercent / 100);
    const conversionPrice = Math.min(capPrice, discountPrice);
    const sharesIssued = conversionAmount / conversionPrice;
    const postConversionShares = v.preMoneyShares + sharesIssued;
    const ownershipPercent = (sharesIssued / postConversionShares) * 100;
    const conversionMethod: 'cap' | 'discount' = conversionPrice <= discountPrice && conversionPrice < capPrice ? 'discount' : 'cap';
    return {
      accruedInterest,
      conversionAmount,
      capPrice,
      discountPrice,
      conversionPrice,
      sharesIssued,
      ownershipPercent,
      conversionMethod,
    };
  };

  const getInterpretation = (ownershipPercent: number, conversionMethod: string) => {
    if (ownershipPercent >= 15) return `Strong note outcome: ${ownershipPercent.toFixed(1)}% ownership after converting principal + interest at ${conversionMethod} price.`;
    if (ownershipPercent >= 5) return `Typical note outcome: ${ownershipPercent.toFixed(1)}% ownership. Conversion at ${conversionMethod} price.`;
    return `Modest note outcome: ${ownershipPercent.toFixed(1)}% ownership. Smaller principal or higher round valuation.`;
  };

  const getStrength = (ownershipPercent: number) => {
    if (ownershipPercent >= 15) return 'Strong';
    if (ownershipPercent >= 5) return 'Moderate';
    return 'Modest';
  };

  const getInsights = (ownershipPercent: number, conversionMethod: string, accruedInterest: number) => {
    const insights: string[] = [];
    insights.push(`Conversion used the ${conversionMethod} price (whichever was lower for the note holder).`);
    if (accruedInterest > 0) insights.push(`Accrued interest ($${accruedInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}) was added to principal for conversion.`);
    if (conversionMethod === 'cap') insights.push('Valuation cap limited conversion price; early investor benefit.');
    else insights.push('Discount rate applied; conversion at a discount to the round price.');
    insights.push('Convertible notes accrue interest until conversion; SAFEs do not.');
    return insights;
  };

  const getRecommendation = (ownershipPercent: number) => {
    if (ownershipPercent >= 15) return 'Model full cap table including this note (principal + interest) and new round; ensure dilution is acceptable to founders.';
    if (ownershipPercent >= 5) return 'Validate conversion amount (principal + interest) and conversion price; include in cap table for accurate post-round ownership.';
    return 'Small ownership impact; still model all notes together for total dilution and interest accrual.';
  };

  const getConsiderations = () => [
    'Interest accrual varies by document (simple vs compound, payment-in-kind). This calculator uses simple interest.',
    'Multiple notes convert in order; run a full cap table for accurate ownership and dilution.',
    'Option pool and new round shares are not included in this ownership %; use a full cap table for precision.',
    'Some notes have a maturity date or repayment option if no qualifying round occurs.',
  ];

  const onSubmit = (values: FormValues) => {
    const calc = calculate(values);
    setResult({
      ...calc,
      interpretation: getInterpretation(calc.ownershipPercent, calc.conversionMethod),
      recommendation: getRecommendation(calc.ownershipPercent),
      strength: getStrength(calc.ownershipPercent),
      insights: getInsights(calc.ownershipPercent, calc.conversionMethod, calc.accruedInterest),
      considerations: getConsiderations(),
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Convertible Note Parameters
          </CardTitle>
          <CardDescription>
            Enter your convertible note terms (principal, interest, maturity) and the next round details to compute conversion amount, price, shares, and ownership.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="principal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Note Principal ($)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1000"
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
                <FormField
                  control={form.control}
                  name="interestRatePercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Interest Rate (% per year)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.5"
                          min={0}
                          max={100}
                          placeholder="e.g., 8"
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
                  name="monthsToConversion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Months Until Conversion
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min={0}
                          placeholder="e.g., 18"
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
                          placeholder="e.g., 5000000"
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
                          placeholder="e.g., 2.00"
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
                Calculate Convertible Note Conversion
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
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Convertible Note Conversion Result</CardTitle>
                  <CardDescription>Conversion amount (principal + interest), price, shares, and ownership</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">${result.conversionPrice.toFixed(4)}</p>
                <p className="text-lg text-muted-foreground mt-2">Conversion price per share</p>
                <p className="text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conversion amount (principal + interest)</p>
                  <p className="text-xl font-bold">${result.conversionAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accrued interest</p>
                  <p className="text-xl font-bold">${result.accruedInterest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
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
                <CardDescription>Convertible note conversion implications</CardDescription>
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
            Understanding the Inputs (Convertible Note–Specific)
          </CardTitle>
          <CardDescription>Key terms used in convertible note conversion</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-4 w-4" />
                Principal, Interest & Maturity
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The note principal is the amount loaned. Convertible notes typically accrue interest (e.g. 5–8% per year) until conversion. Months until conversion determine accrued interest. This calculator uses simple interest: Interest = Principal × Rate × (Months / 12).
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Conversion amount = Principal + Accrued interest</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Interest accrues until qualifying equity round</span>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Target className="h-4 w-4" />
                Valuation Cap & Discount
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The valuation cap sets a maximum company valuation for conversion (same idea as in SAFEs). The discount gives a percentage off the next round’s price. Conversion price is the <strong>lower</strong> of cap-derived price and discount-derived price. Round price and pre-money fully diluted shares define the round.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Cap price = Valuation Cap ÷ Pre-money shares</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Discount price = Round price × (1 − Discount %)</span>
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
              Accrued interest = Principal × (Interest rate / 100) × (Months / 12)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Conversion amount = Principal + Accrued interest
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Cap price = Valuation Cap ÷ Pre-money fully diluted shares
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Discount price = Round price × (1 − Discount %)
            </p>
            <p className="font-mono text-sm text-center font-semibold text-primary mt-2">
              Conversion price = min(Cap price, Discount price)
            </p>
            <p className="font-mono text-sm text-center mt-2">
              Shares issued = Conversion amount ÷ Conversion price
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Convertible notes convert at the price that is more favorable to the investor. Unlike SAFEs, the amount that converts includes accrued interest.
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
            <Link href="/safe-note-conversion-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">SAFE Note Conversion</p>
                      <p className="text-sm text-muted-foreground">No interest; cap & discount</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/startup-valuation-pre-money-vs-post-money-calculator" className="block">
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
            <Link href="/founder-dilution-after-funding-calculator" className="block">
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
            <Link href="/equity-cap-table-generator" className="block">
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
            <Link href="/safe-convertible-note-conversion-calculator" className="block">
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
            <Link href="/option-pool-allocation-calculator" className="block">
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
        <meta itemProp="name" content="The Definitive Guide to Convertible Note Conversion: Principal, Interest, Cap, and Discount" />
        <meta itemProp="description" content="An expert guide to convertible note conversion: how principal and accrued interest convert at the lesser of cap and discount price, and how this differs from SAFEs." />
        <meta itemProp="keywords" content="convertible note conversion, valuation cap, discount, accrued interest, startup financing, equity conversion" />
        <meta itemProp="author" content="Mycalculating.com" />
        <meta itemProp="datePublished" content="2025-01-01" />
        <meta itemProp="url" content="/convertible-note-conversion-calculator" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Convertible Note Conversion: Principal, Interest, Cap, and Discount</h1>
        <p className="text-lg italic text-muted-foreground">How convertible notes convert into equity when a company raises a priced round, including accrued interest.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#note-definition" className="hover:underline">What is a Convertible Note?</a></li>
          <li><a href="#note-interest" className="hover:underline">Interest Accrual</a></li>
          <li><a href="#note-cap-discount" className="hover:underline">Valuation Cap and Discount</a></li>
          <li><a href="#note-formula" className="hover:underline">Conversion Formula</a></li>
          <li><a href="#note-vs-safe" className="hover:underline">Convertible Note vs SAFE</a></li>
        </ul>
        <hr />

        <h2 id="note-definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a Convertible Note?</h2>
        <p>A convertible note is a short-term debt instrument that converts into equity (usually preferred stock) at a qualifying financing round. Unlike a SAFE, it accrues interest until conversion. The conversion amount is <strong>principal + accrued interest</strong>. The conversion price is determined by the &quot;lesser of&quot; the valuation cap and the discount, same as with SAFEs.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Debt Until Conversion</h3>
        <p>Until conversion, the note is debt on the company’s books. Interest accrues (typically simple or compound). At a qualifying round, the note converts into equity at the conversion price; no cash repayment is required if the document specifies conversion.</p>
        <hr />

        <h2 id="note-interest" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interest Accrual</h2>
        <p>Notes typically specify an annual interest rate (e.g. 5–8%). Interest accrues until the qualifying round (or maturity). This calculator uses <strong>simple interest</strong>: Accrued interest = Principal × (Rate / 100) × (Months / 12). Some documents use compound interest or payment-in-kind (PIK); check your note terms.</p>
        <h3 className="text-xl font-semibold text-foreground mt-6">Simple vs Compound</h3>
        <p>Simple interest is applied to the principal only. Compound interest would apply to principal + accrued interest over time. This calculator uses simple interest for transparency; adjust the conversion amount manually if your note uses compound or PIK.</p>
        <hr />

        <h2 id="note-cap-discount" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Valuation Cap and Discount</h2>
        <p>The <strong>valuation cap</strong> sets a maximum company valuation for conversion. The <strong>discount</strong> gives a percentage off the next round’s price. The conversion price is the <strong>lower</strong> of the cap-derived price and the discount-derived price. Shares issued = (Principal + Accrued interest) ÷ Conversion price.</p>
        <hr />

        <h2 id="note-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conversion Formula</h2>
        <p>Conversion amount = Principal + Accrued interest. Cap price = Valuation Cap ÷ Pre-money fully diluted shares. Discount price = Round price × (1 − Discount %). Conversion price = min(Cap price, Discount price). Shares issued = Conversion amount ÷ Conversion price.</p>
        <hr />

        <h2 id="note-vs-safe" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Convertible Note vs SAFE</h2>
        <p>Convertible notes are debt and accrue interest; SAFEs are not debt and do not accrue interest. Both use cap and discount to set the conversion price. Use the SAFE Note Conversion Calculator for SAFEs (no interest) and this calculator for notes (principal + interest).</p>
        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>This calculator gives you the conversion amount (principal + interest), conversion price, shares issued, and approximate ownership for a single convertible note. For multiple notes and a full cap table, use an equity cap table tool and model all instruments together.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about convertible note conversion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Do convertible notes accrue interest?</h4>
              <p className="text-muted-foreground">Yes. Unlike SAFEs, convertible notes typically accrue interest (e.g. 5–8% per year) until conversion. The amount that converts is principal + accrued interest. This calculator uses simple interest; your note may specify compound or PIK.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How is the conversion price determined?</h4>
              <p className="text-muted-foreground">The conversion price is the <strong>lower</strong> of (1) cap price = Valuation Cap ÷ Pre-money fully diluted shares, and (2) discount price = Round price × (1 − Discount %). This gives the note holder the better rate.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What if the note matures before a qualifying round?</h4>
              <p className="text-muted-foreground">Many notes have a maturity date. If no qualifying round occurs by then, the document may allow repayment (principal + interest), extension, or conversion at a default valuation. Terms vary; check your note.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How is this different from the SAFE calculator?</h4>
              <p className="text-muted-foreground">The SAFE Note Conversion Calculator assumes no interest (principal only). The Convertible Note Conversion Calculator adds accrued interest to the principal before dividing by the conversion price. Both use the same cap and discount logic for the conversion price.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What is simple vs compound interest on a note?</h4>
              <p className="text-muted-foreground">Simple interest is calculated on the principal only (Principal × Rate × Time). Compound interest is calculated on principal plus previously accrued interest. This calculator uses simple interest; check your note for compound or PIK terms.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How do multiple convertible notes convert?</h4>
              <p className="text-muted-foreground">Notes typically convert in a defined order (e.g. by date). Each conversion increases total shares, which can affect effective price for later notes. Model all notes and the new round in a full cap table for accurate ownership.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Why is my ownership % only approximate?</h4>
              <p className="text-muted-foreground">This calculator divides note shares by (pre-money shares + note shares). It does not include new round investment shares or the option pool. For exact post-round ownership, use a full cap table that includes the new round and all instruments.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">Can the company repay the note instead of converting?</h4>
              <p className="text-muted-foreground">Some notes allow the company to repay principal plus accrued interest at maturity instead of converting. Conversion is usually mandatory upon a qualifying round. Check your note for repayment and conversion triggers.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">What interest rate is typical for convertible notes?</h4>
              <p className="text-muted-foreground">Rates of 5% to 8% per year are common. The rate compensates the investor for the time and risk until conversion. Higher-risk or longer-dated notes may have higher rates.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-3">How does a convertible note differ from a SAFE?</h4>
              <p className="text-muted-foreground">A convertible note is debt and accrues interest; the conversion amount is principal + interest. A SAFE is not debt and does not accrue interest; conversion is on principal only. Both use valuation cap and discount to set the conversion price.</p>
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
                <span className="text-sm text-muted-foreground">To see how a single note (principal + interest) converts and affects ownership before signing or at a planned round.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Angel Investors / Lenders</strong>
                <span className="text-sm text-muted-foreground">To estimate accrued interest, conversion amount, conversion price, shares, and ownership from note terms.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Startup Advisors & Lawyers</strong>
                <span className="text-sm text-muted-foreground">To validate term sheet math and explain conversion (including interest) to clients.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Students & Analysts</strong>
                <span className="text-sm text-muted-foreground">To understand convertible note mechanics: interest accrual, cap, discount, and conversion amount.</span>
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
                <span><strong>Simple interest:</strong> This calculator uses simple interest; if your note uses compound or PIK interest, adjust the conversion amount manually.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Ownership %:</strong> Excludes new round shares and option pool; use a full cap table for exact dilution.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Multiple notes:</strong> Convert in a defined order; model each note and the round together for accuracy.</span>
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
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case A: Cap applies (high round valuation)</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  $100K note, 8% interest, 18 months to conversion → accrued interest ≈ $12K. Conversion amount = $112K. $5M cap, 20% discount. Series A at $12M pre-money, $2/share. Cap price = $5M ÷ 6M = $0.833; discount price = $2 × 0.8 = $1.60. Conversion at $0.833 (cap) → ~134,000 shares.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Case B: Discount applies (round near cap)</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  Same $100K note, $12K interest, $112K conversion. $5M cap, 20% discount. Series A at $4M pre-money, $0.40/share. Cap price = $5M ÷ 10M = $0.50; discount price = $0.40 × 0.8 = $0.32. Conversion at $0.32 (discount) → 350,000 shares. The discount gave the better rate.
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
          <p>The Convertible Note Conversion Calculator computes accrued interest, conversion amount (principal + interest), conversion price (lesser of cap and discount price), shares issued, and approximate ownership for a single convertible note at a qualifying equity round.</p>
          <p>For SAFEs (no interest), use the SAFE Note Conversion Calculator.</p>
          <p>Use this tool to validate term sheets and plan cap table impact; for multiple notes and full dilution, use an equity cap table or full model.</p>
        </CardContent>
      </Card>
    </div>
  );
}
