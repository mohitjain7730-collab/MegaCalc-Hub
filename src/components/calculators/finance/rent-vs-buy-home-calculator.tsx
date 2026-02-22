'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Home,
  DollarSign,
  Percent,
  CalendarClock,
  Calculator,
  Info,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Users,
  Shield,
  BarChart3,
  PiggyBank,
  ArrowRightLeft,
  Target
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  homePrice: z.number().positive('Home price must be greater than 0'),
  downPaymentPercent: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  mortgageRate: z.number().min(0).max(100),
  loanTermYears: z.number().min(1).max(50),
  propertyTaxRate: z.number().min(0).max(100),
  maintenanceRate: z.number().min(0).max(100),
  homeAppreciationRate: z.number().min(-100).max(100),
  buyingClosingCosts: z.number().min(0).max(100),
  sellingClosingCosts: z.number().min(0).max(100),
  monthlyRent: z.number().positive(),
  rentInflationRate: z.number().min(0).max(100),
  investmentReturnRate: z.number().min(0).max(100),
  yearsToStay: z.number().min(1).max(100),
});

type FormValues = z.infer<typeof formSchema>;

export default function RentVsBuyHomeCalculator() {
  const [result, setResult] = useState<{
    netCostBuy: number;
    netCostRent: number;
    difference: number;
    betterOption: 'buy' | 'rent';
    breakEvenYear: number | null;
    monthlyMortgage: number;
    equityGained: number;
    opportunityCost: number;
    chartData: { year: number; buyCost: number; rentCost: number }[];
    recommendation: string;
    insights: string[];
    risks: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      homePrice: 400000,
      downPaymentPercent: 20,
      mortgageRate: 6.5,
      loanTermYears: 30,
      propertyTaxRate: 1.2,
      maintenanceRate: 1.0,
      homeAppreciationRate: 3.5,
      buyingClosingCosts: 3,
      sellingClosingCosts: 6,
      monthlyRent: 2200,
      rentInflationRate: 3.0,
      investmentReturnRate: 6.0,
      yearsToStay: 7,
    },
  });

  const calculate = (v: FormValues) => {
    // Basic Mortgage Calculation
    const downPayment = v.homePrice * (v.downPaymentPercent / 100);
    const loanAmount = v.homePrice - downPayment;
    const monthlyRate = v.mortgageRate / 100 / 12;
    const totalPayments = v.loanTermYears * 12;

    const calculateMortgage = (principal: number, rate: number, total: number) => {
      if (rate === 0) return principal / total;
      return (principal * rate * Math.pow(1 + rate, total)) / (Math.pow(1 + rate, total) - 1);
    };

    const monthlyPI = calculateMortgage(loanAmount, monthlyRate, totalPayments);

    // BUYING SIDE CALCULATION
    let totalMortgagePayments = 0;
    let totalPropertyTax = 0;
    let totalMaintenance = 0;
    let remainingPrincipal = loanAmount;
    let currentHomeValue = v.homePrice;

    // Initial buying costs
    const initialBuyingCosts = downPayment + (v.homePrice * (v.buyingClosingCosts / 100));

    // RENTING SIDE CALCULATION
    let totalRentPaid = 0;
    let currentRent = v.monthlyRent;
    // Initial investing capital (money used for down payment & closing costs if you had rented instead)
    let investmentPortfolio = initialBuyingCosts;

    const chartData = [];
    let breakEvenYear: number | null = null;
    let loopBuyCost = 0; // Cumulative net cost
    let loopRentCost = 0; // Cumulative net cost

    for (let year = 1; year <= v.yearsToStay; year++) {
      let yearMortgagePayment = 0;

      // Monthly loop for precision on amortization and rent
      for (let m = 1; m <= 12; m++) {
        // Buy Side
        if (remainingPrincipal > 0) {
          const interestPayment = remainingPrincipal * monthlyRate;
          const principalPayment = monthlyPI - interestPayment;
          remainingPrincipal -= principalPayment;
          yearMortgagePayment += monthlyPI;
        }

        // Rent Side (Rent typically increases annually, but we apply monthly logic for cash flow timing)
        totalRentPaid += currentRent;

        // Opportunity Cost / Investment Return
        investmentPortfolio *= (1 + (v.investmentReturnRate / 100 / 12));

        // Investment logic:
        // We compare the monthly cash outflows.
        // Buy Monthly Outflow = Mortgage + Tax/12 + Maint/12
        // Rent Monthly Outflow = Rent
        // The difference is added to (or subtracted from) the investment portfolio.

        const monthTax = (currentHomeValue * (v.propertyTaxRate / 100)) / 12;
        const monthMaint = (currentHomeValue * (v.maintenanceRate / 100)) / 12;
        const totalMonthlyBuyOutflow = monthlyPI + monthTax + monthMaint;

        // positive means Buy is more expensive, so Renter saves/invests the difference
        // negative means Rent is more expensive, so Buyer saves/invests the difference (we subtract from renter portfolio to represent relative gain for buyer)
        const monthlyDifference = totalMonthlyBuyOutflow - currentRent;

        investmentPortfolio += monthlyDifference;
      }

      // Annual Updates
      totalMortgagePayments += yearMortgagePayment;
      totalPropertyTax += (currentHomeValue * (v.propertyTaxRate / 100));
      totalMaintenance += (currentHomeValue * (v.maintenanceRate / 100));

      currentHomeValue *= (1 + (v.homeAppreciationRate / 100));
      currentRent *= (1 + (v.rentInflationRate / 100));

      // Check Break Even
      // Net Cost Buy = (All Outflows + Selling Costs) - Final Home Value
      // Wait, let's look at Net Wealth instead for simpler logic, then invert to "Cost" if needed, 
      // but the user wants "Cost".

      // Net Wealth Buy = Current Home Value - Remaining Principal - Selling Closing Costs - (Sum of all unrecoverable costs... wait, wealth is just Asset - Liability)
      // But we need to account for the cash outflows that happened.
      // Let's stick to the "Net Cost" definition:
      // Net Cost = Total Cash Outflows - Ending Asset Value (Equity).

      // Buy: Outflows = DownPayment + Closing + MortgagePayments + Tax + Maint
      //      Ending Asset = (HomeValue - SellingCosts) - RemainingPrincipal ... actually, (HomeValue - SellingCosts) IS the cash you get back.
      //      So Net Cost = Total Outflows - (HomeValue - SellingCosts). (Note: MortgagePayments paying down principal is an outflow that is recovered).

      const sellingCosts = currentHomeValue * (v.sellingClosingCosts / 100);
      const buyTotalCashOut = initialBuyingCosts + totalMortgagePayments + totalPropertyTax + totalMaintenance; // initial includes DP and buying costs
      const buyCashBack = currentHomeValue - sellingCosts - remainingPrincipal;
      const netBuyCost = buyTotalCashOut - buyCashBack;

      // Rent: Outflows = Total Rent Paid
      //       Ending Asset = Investment Portfolio (which started = initialBuyingCosts)
      //       Net Cost = (Total Rent Paid + Initial Capital) - Ending Portfolio Value
      //       Wait, Total Rent Paid is the outflow. The initial capital was "invested".
      //       Actually, let's treat it as:
      //       Net Cost Rent = Total Rent Paid - (Investment Portfolio Value - Initial Capital)
      //       (i.e. Rent Cost minus the investment GAIN. If you lost money investing, cost is higher).

      // Let's refine:
      // You start with $X (Down payment + closing).
      // Option A (Buy): You spend $X. You pay monthly $M. At end you get $Y. Net Cost = $X + Sum($M) - $Y.
      // Option B (Rent): You invest $X. You pay monthly $R. At end you get $Z. Net Cost = Sum($R) - ($Z - $X).

      const netRentCost = totalRentPaid - (investmentPortfolio - initialBuyingCosts);

      if (breakEvenYear === null && netBuyCost < netRentCost) {
        breakEvenYear = year;
      }

      chartData.push({
        year,
        buyCost: Math.round(netBuyCost),
        rentCost: Math.round(netRentCost)
      });

      if (year === v.yearsToStay) {
        loopBuyCost = netBuyCost;
        loopRentCost = netRentCost;
      }
    }

    const difference = Math.abs(loopBuyCost - loopRentCost);
    const betterOption: 'buy' | 'rent' = loopBuyCost < loopRentCost ? 'buy' : 'rent';

    // Insights Generation
    const insights = [];
    if (betterOption === 'buy') {
      insights.push(`Buying saves you $${difference.toLocaleString()} over ${v.yearsToStay} years.`);
      insights.push(`Your home equity of $${(currentHomeValue - remainingPrincipal).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} significantly offsets costs.`);
      if (breakEvenYear) insights.push(`You break even on buying after ${breakEvenYear} years.`);
    } else {
      insights.push(`Renting saves you $${difference.toLocaleString()} over ${v.yearsToStay} years.`);
      insights.push(`The opportunity cost of your down payment (invested elsewhere) outperforms home equity gains.`);
      insights.push(`High transaction costs make buying for only ${v.yearsToStay} years inefficient.`);
    }

    // Recommendation
    let recommendation = "";
    if (Math.abs(loopBuyCost - loopRentCost) < 5000) {
      recommendation = "It's a toss-up. base your decision on lifestyle flexibility vs. stability desires rather than just financials.";
    } else if (betterOption === 'buy') {
      recommendation = "Buying helps build long-term wealth through forced savings (principal paydown) and appreciation.";
    } else {
      recommendation = "Renting is the financially prudent choice for this timeframe, preserving your capital flexibility.";
    }

    // Risks
    const risks = [];
    if (v.loanTermYears > v.yearsToStay && betterOption === 'buy') risks.push("Selling effectively incurs ~6-10% transaction costs, eating into short-term equity.");
    if (v.mortgageRate > 7) risks.push("High interest rates heavily front-load interest payments, reducing principal paydown speed.");
    if (v.rentInflationRate > 4) risks.push("If rents rise faster than expected, purchasing becomes more attractive sooner.");

    return {
      netCostBuy: loopBuyCost,
      netCostRent: loopRentCost,
      difference,
      betterOption,
      breakEvenYear,
      monthlyMortgage: monthlyPI,
      equityGained: currentHomeValue - remainingPrincipal,
      opportunityCost: investmentPortfolio - initialBuyingCosts,
      chartData,
      recommendation,
      insights,
      risks
    };
  };

  const onSubmit = (values: FormValues) => {
    const res = calculate(values);
    if (res) setResult(res);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Details
          </CardTitle>
          <CardDescription>
            Enter the details of your potential purchase and rental scenario to see the breakdown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="homePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Target Home Price</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyRent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Monthly Rent (Alternative)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearsToStay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /> Expected Stay (Years)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="md:col-span-2 lg:col-span-3 my-2" />
                <h4 className="text-sm font-semibold text-muted-foreground md:col-span-2 lg:col-span-3 mb-[-10px]">Purchase Assumptions</h4>

                <FormField
                  control={form.control}
                  name="downPaymentPercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Down Payment (%)</FormLabel>
                      <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mortgageRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mortgage Rate (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="buyingClosingCosts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buying Closing Costs (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="md:col-span-2 lg:col-span-3 my-2" />
                <h4 className="text-sm font-semibold text-muted-foreground md:col-span-2 lg:col-span-3 mb-[-10px]">Market & Future Assumptions</h4>

                <FormField
                  control={form.control}
                  name="homeAppreciationRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Appreciation (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rentInflationRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rent Inflation (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investmentReturnRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inv. Return Rate (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Calculate Rent vs Buy Scenarios
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Financial Verdict</CardTitle>
                  <CardDescription>Based on a {form.getValues('yearsToStay')}-year horizon</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-muted/40 rounded-xl border border-primary/20">
                <p className="text-lg font-medium text-muted-foreground mb-2">The Winning Strategy is</p>
                <div className="flex items-center justify-center gap-3 mb-4">
                  {result.betterOption === 'buy' ?
                    <Home className="h-10 w-10 text-green-600" /> :
                    <Briefcase className="h-10 w-10 text-blue-600" /> // Using briefcase as proxy for flexibility/rent
                  }
                  <span className={`text-4xl font-bold ${result.betterOption === 'buy' ? 'text-green-600' : 'text-blue-600'}`}>
                    {result.betterOption === 'buy' ? 'BUYING' : 'RENTING'}
                  </span>
                </div>
                <p className="text-xl">
                  Saves approximately <span className="font-bold underline">${Math.floor(result.difference).toLocaleString()}</span> over {form.getValues('yearsToStay')} years
                </p>
                {result.breakEvenYear && (
                  <Badge variant="outline" className="mt-4 text-md px-4 py-1">
                    Break-even Point: Year {result.breakEvenYear}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <PiggyBank className="h-6 w-6 mx-auto mb-2 text-indigo-600" />
                  <p className="font-semibold text-sm">Equity Gained (Buy)</p>
                  <p className="text-lg font-bold text-indigo-700">${Math.floor(result.equityGained).toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold text-sm">Opp. Cost Gains (Rent)</p>
                  <p className="text-lg font-bold text-green-700">${Math.floor(result.opportunityCost).toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                  <p className="font-semibold text-sm">Monthly Mortgage (P&I)</p>
                  <p className="text-lg font-bold text-orange-700">${Math.floor(result.monthlyMortgage).toLocaleString()}</p>
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

          {/* Smart Insights & Risks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                  Smart Insights
                </CardTitle>
                <CardDescription>Key takeaways from the analysis</CardDescription>
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
                  Risk Factors
                </CardTitle>
                <CardDescription>Variables that could flip the result</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.risks.map((item, index) => (
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

      {/* Understanding Inputs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Understanding the Inputs</CardTitle>
          <CardDescription>What each field actually means for your finances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Home className="h-4 w-4" /> Home Appreciation
              </h4>
              <p className="text-sm text-muted-foreground">The annual percentage rate at which the home's value grows. Historically ~3-4%, but varies wildly by location. This is the main "profit" driver for buying.</p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <TrendingUp className="h-4 w-4" /> Investment Return Rate
              </h4>
              <p className="text-sm text-muted-foreground">The "Opportunity Cost." If you didn't use cash for a down payment, what return would you get investing it in stocks/bonds? (e.g., S&P 500 historic avg ~7-10% nominal).</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formula Used */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> The Math Behind It</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg overflow-x-auto">
            <p className="font-mono text-sm">
              Net Cost (Buy) = (Mortgage + Tax + Maint + Closing Costs) - (Home Value - Debt)
            </p>
            <p className="font-mono text-sm mt-2">
              Net Cost (Rent) = Total Rent Paid - (Investment Gains from Down Payment Savings)
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            The calculator compares the "unrecoverable costs" of renting vs. buying. Buying has unrecoverable costs too: interest, taxes, maintenance, and transaction fees. It wins only when the equity gain outpaces the investment returns you'd get by renting and investing the difference.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> Related Financial Calculators</CardTitle>
          <CardDescription>Tools to refine your home buying decision</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/mortgage-payment-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-blue-600" />
                    <div><p className="font-medium">Mortgage Payment</p><p className="text-sm text-muted-foreground">Detailed amortization</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/home-affordability-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <div><p className="font-medium">Home Affordability</p><p className="text-sm text-muted-foreground">How much can you borrow?</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/house-down-payment-savings-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="h-5 w-5 text-orange-600" />
                    <div><p className="font-medium">Down Payment Savings</p><p className="text-sm text-muted-foreground">Plan your savings goal</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/mortgage-points-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Percent className="h-5 w-5 text-purple-600" />
                    <div><p className="font-medium">Mortgage Points</p><p className="text-sm text-muted-foreground">Buying down the rate?</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/debt-to-income-ratio-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-red-600" />
                    <div><p className="font-medium">Debt-to-Income Ratio</p><p className="text-sm text-muted-foreground">Qualification check</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/monthly-budget-planner-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 text-teal-600" />
                    <div><p className="font-medium">Monthly Budget</p><p className="text-sm text-muted-foreground">Plan for the new payment</p></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comprehensive Guide */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        {/* SEO Metadata */}
        <meta itemProp="name" content="Rent vs Buy Calculator: The Ultimate Decision Guide" />
        <meta itemProp="description" content="A comprehensive mathematical and strategic guide to deciding between renting and buying a home. Analysis of equity, opportunity cost, and market factors." />
        <meta itemProp="author" content="Financial Analysis Team" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Rent vs. Buy: The Ultimate Financial Showdown</h1>
        <p className="text-lg italic text-muted-foreground">More than just a monthly payment comparison—a deep dive into equity, opportunity costs, and long-term wealth building.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary intro-links">
          <li><a href="#core-concept" className="hover:underline">The Core Dilemma: Unrecoverable Costs</a></li>
          <li><a href="#the-5-percent-rule" className="hover:underline">The 5% Rule Explained</a></li>
          <li><a href="#hidden-costs" className="hover:underline">The Hidden Costs of Buying</a></li>
          <li><a href="#opportunity-cost" className="hover:underline">The Power of Opportunity Cost</a></li>
          <li><a href="#verdict" className="hover:underline">Making the Final Decision</a></li>
        </ul>
        <Separator className="my-6" />

        <h2 id="core-concept" className="text-2xl font-bold text-foreground pt-8">The Core Dilemma: It's Not Just About the Payment</h2>
        <p>A common mistake first-time homebuyers make is simply comparing their current monthly rent to a mortgage payment. "If I pay $2,000 in rent, I might as well pay $2,000 for a mortgage and build equity," goes the logic. However, this oversimplification ignores the concept of <strong>Unrecoverable Costs</strong>.</p>
        <p className="mt-4">When you rent, your unrecoverable cost is simply the rent. When you buy, your unrecoverable costs include:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Mortgage Interest:</strong> Money paid to the bank, not your equity.</li>
          <li><strong>Property Taxes:</strong> Money paid to the government.</li>
          <li><strong>Maintenance:</strong> The chaos factor (new roof, HVAC repairs).</li>
          <li><strong>HOA Fees:</strong> Community upkeep.</li>
          <li><strong>Cost of Capital:</strong> The return you <em>didn\'t</em> earn on your down payment.</li>
        </ul>

        <h2 id="the-5-percent-rule" className="text-2xl font-bold text-foreground pt-8">The 5% Rule: A Quick Heuristic</h2>
        <p>A famous rule of thumb in finance is the 5% Rule. It states that the annual unrecoverable cost of owning a home is roughly 5% of the home\'s value. This assumes:</p>
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li><strong>Property Tax:</strong> ~1%</li>
          <li><strong>Maintenance:</strong> ~1%</li>
          <li><strong>Cost of Capital / Interest:</strong> ~3% (historically real rates minus inflation)</li>
        </ul>
        <p className="mt-4">Using this rule, if a home costs $500,000, the annual unrecoverable cost is $25,000, or roughly $2,083 per month. If you can rent a similar home for less than $2,083, renting is mathematically cheaper. The Buy vs Rent calculator above performs a much more detailed version of this calculation.</p>

        <h2 id="hidden-costs" className="text-2xl font-bold text-foreground pt-8">The Hidden Costs of Buying</h2>
        <h3 className="text-xl font-semibold text-foreground mt-4">1. Transaction Costs (The Equity Killer)</h3>
        <p>Real estate is illiquid and expensive to trade. Buying typically costs 2-5% in closing costs (inspections, loan origination, title insurance). Selling is even worse, costing 6-10% (agent commissions, transfer taxes, staging). If you buy a home and sell it two years later, these fees will almost certainly destroy any equity you built.</p>

        <h3 className="text-xl font-semibold text-foreground mt-4">2. The Maintenance "Leak"</h3>
        <p>Renters call the landlord when the water heater breaks. Owners write a check. The 1% rule suggests saving 1% of your home\'s value annually for repairs. On a $400k home, that\'s $4,000/year or $333/month that must be factored into your comparison.</p>

        <h2 id="opportunity-cost" className="text-2xl font-bold text-foreground pt-8">The Opportunity Cost Factor</h2>
        <p>This is the most overlooked variable. That $80,000 down payment doesn\'t just sit there. If you didn\'t buy a house, that money could be invested in a diversified stock portfolio.</p>
        <p className="mt-4"><strong>Scenario:</strong> You put $100k down on a house. The house appreciates 3% a year. The stock market returns 7% a year. By locking that capital in the house, you are "losing" the 4% difference. Over 30 years, this compound growth difference can be massive. This calculator explicitly models that trade-off.</p>

        <h2 id="verdict" className="text-2xl font-bold text-foreground pt-8">Conclusion: When to Buy vs. Rent</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
            <h4 className="font-bold text-green-800 dark:text-green-300 mb-2">Buy If:</h4>
            <ul className="list-disc ml-4 space-y-1 text-sm text-green-800 dark:text-green-300">
              <li>You plan to stay 7+ years (amortize closing costs).</li>
              <li>You want stability and control (renovations, pets).</li>
              <li>You are in a high-appreciation market with limited housing supply.</li>
              <li>You want a "forced savings" mechanism.</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Rent If:</h4>
            <ul className="list-disc ml-4 space-y-1 text-sm text-blue-800 dark:text-blue-300">
              <li>You might move within 5 years.</li>
              <li>The "Price-to-Rent" ratio is high (home prices &gt; 20x annual rent).</li>
              <li>You prioritize investing in higher-yield assets (stocks/business).</li>
              <li>You want predictable monthly housing costs without surprise repairs.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Frequently Asked Questions</CardTitle>
          <CardDescription>Common questions about the Rent vs Buy dilemma</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold text-lg mb-2">Does paying rent is just "throwing money away"?</h4>
            <p className="text-muted-foreground">No. You are paying for a service: shelter. Just like paying for food isn\'t "throwing money away." Owning also involves "throwing money away" on unrecoverable costs like interest, taxes, and maintenance.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">How long does it take to break even on a house?</h4>
            <p className="text-muted-foreground">Typically 5-7 years. It takes this long for the home\'s appreciation and principal paydown to exceed the high upfront closing costs (3-5% to buy) and backend selling costs (6-10%).</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Should I buy if interest rates are high?</h4>
            <p className="text-muted-foreground">High rates drastically increase the unrecoverable cost of interest. However, high rates often soften home prices. If you can refinance later, buying high might work, but the monthly cash flow burden is strictly higher.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What is the Price-to-Rent Ratio?</h4>
            <p className="text-muted-foreground">It is the Home Price divided by Annual Rent. A ratio of 1-15 usually favors buying. 16-20 is gray. 21+ typically favors renting heavily.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Is a home a good investment?</h4>
            <p className="text-muted-foreground">Historically, real estate just keeps pace with inflation (0-2% real return). Stocks generally return 5-7% real. A home is a great <em>savings account</em> and specific leveraged asset, but purely as an investment, it often lags the market.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">How does inflation affect my decision?</h4>
            <p className="text-muted-foreground">Inflation hurts renters (rents go up) but helps owners (fixed-rate mortgage payment stays the same, while the debt\'s real value shrinks). High inflation environments favor owning fixed-rate debt.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">What if home prices drop?</h4>
            <p className="text-muted-foreground">Buying is a leveraged bet. If you put 10% down and the home drops 10%, you have lost 100% of your equity (excluding principal payments). Renting has zero asset price risk.</p>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-2">Do tax deductions make buying cheaper?</h4>
            <p className="text-muted-foreground">Sometimes. In the US, the mortgage interest deduction is valuable, but with the higher standard deduction, fewer people itemize. Consult a tax pro in your jurisdiction.</p>
          </div>
        </CardContent>
      </Card>

      {/* Usage Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5" /> Usage of this Calculator</CardTitle>
          <CardDescription>Who is this for and what are the limitations?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <strong className="block text-primary mb-1">First-Time Home Buyers</strong>
                <span className="text-sm text-muted-foreground">To see if they are financially ready or purely succumbing to social pressure.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <strong className="block text-primary mb-1">Relocating Professionals</strong>
                <span className="text-sm text-muted-foreground">Deciding whether to buy immediately in a new city or rent and wait.</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Limitations
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> <strong>Psychological Value:</strong> Doesn't account for the "pride of ownership" or the stress of being a landlord to yourself.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" /> <strong>Local Variance:</strong> Property taxes and insurance vary wildly by zipcode. Defaults are national averages.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>The Rent vs Buy decision is the complex interplay of time horizon, opportunity cost, and market conditions. There is no moral superiority in buying—only mathematical suitability for your specific plans. Use this tool to strip away the emotion and view the decision as a neutral financial transaction.</p>
        </CardContent>
      </Card>
    </div>
  );
}
