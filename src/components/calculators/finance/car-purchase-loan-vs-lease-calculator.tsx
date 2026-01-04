'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  Car,
  Key,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Info,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Shield,
  Calculator,
  ChevronRight,
  GaugeCircle,
  PiggyBank
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from '@/components/ui/separator';

// --- Zod Schema ---
// Complex validation because Lease Logic is weird (Capitalized Cost, Money Factor, etc.)
const formSchema = z.object({
  carPrice: z.number().min(5000, 'Car price must be at least 5,000'),
  downPayment: z.number().min(0).default(0),
  salesTaxRate: z.number().min(0).max(15).default(7),
  // Loan Params
  loanTermMonths: z.number().min(12).max(96).default(60),
  loanInterestRate: z.number().min(0).max(30).default(5),
  // Lease Params
  leaseTermMonths: z.number().min(12).max(60).default(36),
  residualValuePercent: z.number().min(10).max(90).default(55).describe("Car value at end of lease %"),
  moneyFactor: z.number().min(0.00001).max(0.01).default(0.0025).describe("Multiply by 2400 to get APR"),
  // Ownership Params
  ownershipYears: z.number().min(1).max(15).default(5),
  annualDepreciation: z.number().min(0).max(50).default(15),
});

type FormValues = z.infer<typeof formSchema>;

export default function CarPurchaseLoanVsLeaseCalculator() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const [chartData, setChartData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carPrice: 35000,
      downPayment: 3000,
      salesTaxRate: 7.5,
      loanTermMonths: 60,
      loanInterestRate: 6.0,
      leaseTermMonths: 36,
      residualValuePercent: 58,
      moneyFactor: 0.0025, // equivalent to 6% APR (0.0025 * 2400)
      ownershipYears: 6,
      annualDepreciation: 15, // 15% drop per year
    },
    mode: 'onChange',
  });

  const values = useWatch({ control: form.control });

  // Calculation Logic
  const calculateResults = (vals: FormValues) => {
    const {
      carPrice,
      downPayment,
      salesTaxRate,
      loanTermMonths,
      loanInterestRate,
      leaseTermMonths,
      residualValuePercent,
      moneyFactor,
      ownershipYears
    } = vals;

    // --- BUY (LOAN) CALCULATIONS ---
    const loanAmount = carPrice - downPayment;
    const loanRateMonthly = loanInterestRate / 100 / 12;
    // PMT Formula
    const loanMonthlyPayment = loanRateMonthly > 0
      ? (loanAmount * loanRateMonthly) / (1 - Math.pow(1 + loanRateMonthly, -loanTermMonths))
      : loanAmount / loanTermMonths;

    // Total financed cost (P + I)
    const totalLoanPayments = loanMonthlyPayment * loanTermMonths;
    // Upfront Tax (Usually you pay tax on FULL sales price when buying)
    const buyTax = carPrice * (salesTaxRate / 100);
    const totalBuyCostInitial = downPayment + totalLoanPayments + buyTax;

    // --- LEASE CALCULATIONS ---
    const residualValue = carPrice * (residualValuePercent / 100);
    const depreciationFee = (carPrice - downPayment - residualValue) / leaseTermMonths;
    const rentCharge = ((carPrice - downPayment) + residualValue) * moneyFactor;
    const leaseMonthlyBase = depreciationFee + rentCharge;
    // Tax on lease is usually ON THE MONTHLY PAYMENT (depending on state, but this is general rule)
    const leaseMonthlyTax = leaseMonthlyBase * (salesTaxRate / 100);
    const leaseMonthlyTotal = leaseMonthlyBase + leaseMonthlyTax;

    // To make a fair comparison over N years (ownershipYears):
    // 1. BUY scenario: accumulated payments + upfront - residual value of car at Year N
    // 2. LEASE scenario: accumulated payments. If N > Lease Term, assume renew lease or buy. 
    //    For simplicity, we will just project lease costs linearly (e.g., perpetual leasing).

    let buyData = [];
    let leaseData = [];
    let annualData = [];

    let currentCarValue = carPrice;
    let cumBuyCost = downPayment + buyTax;
    let cumLeaseCost = downPayment; // Lease usually has down payment too (cap cost reduction)

    // Lease Cycle Counter
    let leaseCycles = 1;

    for (let yr = 1; yr <= ownershipYears; yr++) {
      // --- BUY TRACKER ---
      // Payments this year
      let buyPaymentsThisYear = 0;
      for (let m = 1; m <= 12; m++) {
        const globalMonth = (yr - 1) * 12 + m;
        if (globalMonth <= loanTermMonths) {
          buyPaymentsThisYear += loanMonthlyPayment;
        }
      }
      cumBuyCost += buyPaymentsThisYear;

      // Car Depreciation
      currentCarValue = currentCarValue * (1 - (vals.annualDepreciation / 100));

      // Net Cost to Date = Cash Out - Asset Value
      const netBuyCost = cumBuyCost - currentCarValue;

      // --- LEASE TRACKER ---
      // Assume perpetual leasing of similar vehicle
      let leasePaymentsThisYear = leaseMonthlyTotal * 12;
      // Check if we need a new down payment (new lease started)
      // This is complex, so we will simplify: Assume just monthly payments continue forever for comparison
      cumLeaseCost += leasePaymentsThisYear;

      // Net Cost for Lease is just Cash Out (you own nothing)
      const netLeaseCost = cumLeaseCost;

      annualData.push({
        year: yr,
        buyNet: Math.round(netBuyCost),
        leaseNet: Math.round(netLeaseCost),
        carValue: Math.round(currentCarValue),
        loanPaidOff: yr * 12 >= loanTermMonths
      });
    }

    setChartData(annualData);

    const finalYear = annualData[annualData.length - 1];
    setAnalysis({
      loanMonthlyPayment,
      leaseMonthlyTotal,
      totalBuyCostInitial,
      diffMonthly: Math.abs(loanMonthlyPayment - leaseMonthlyTotal),
      cheaperMonthly: loanMonthlyPayment < leaseMonthlyTotal ? 'Loan' : 'Lease',
      cheaperLongTerm: finalYear.buyNet < finalYear.leaseNet ? 'Buying' : 'Leasing',
      savingsLongTerm: Math.abs(finalYear.buyNet - finalYear.leaseNet),
      breakEvenYear: annualData.find(d => d.buyNet < d.leaseNet)?.year || 'Never',
      leaseAPR: moneyFactor * 2400
    });


  };

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.carPrice) calculateResults(value as FormValues);
    });
    calculateResults(form.getValues());
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-12 max-w-5xl mx-auto px-4 md:px-0 pb-12">

      {/* HEADER */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 pb-2">
          Lease vs Buy Calculator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The eternal car debate solved. Compare monthly payments and long-term costs (Net Equity) to find the smartest route for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* INPUTS */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-t-4 border-t-blue-600 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5 text-blue-600" />
                Vehicle & Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[650px] overflow-y-auto pr-2">
              <FormField
                control={form.control}
                name="carPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car Price (Negotiated)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="downPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Down Payment / Trade-In</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salesTaxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                  <CreditCard className="h-4 w-4" /> Buying (Loan) Details
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="loanTermMonths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Term (Mo)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="loanInterestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">APR (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-primary">
                  <Key className="h-4 w-4" /> Leasing Details
                </h4>
                <FormField
                  control={form.control}
                  name="residualValuePercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Residual Value (%)</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Slider value={[field.value]} min={20} max={80} onValueChange={(v) => field.onChange(v[0])} className="flex-1" />
                          <span className="w-8 text-xs font-mono">{field.value}%</span>
                        </div>
                      </FormControl>
                      <FormDescription className="text-[10px]">Value at lease end.</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moneyFactor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Money Factor</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.0001" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormDescription className="text-[10px]">
                        ~ {(field.value * 2400).toFixed(2)}% APR
                      </FormDescription>
                    </FormItem>
                  )}
                />
              </div>

              <Separator />
              <FormField
                control={form.control}
                name="ownershipYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comparison Timeline (Years)</FormLabel>
                    <div className="flex items-center gap-2">
                      <Slider value={[field.value]} min={1} max={10} onValueChange={(v) => field.onChange(v[0])} className="flex-1" />
                      <span className="w-8 text-sm font-mono">{field.value}y</span>
                    </div>
                  </FormItem>
                )}
              />

            </CardContent>
          </Card>
        </div>

        {/* RESULTS */}
        <div className="lg:col-span-2 space-y-6">
          {/* COMPARISON CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  Buying (Loan)
                  <Badge className="bg-blue-600">Own It</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground text-sm">Monthly Payment</span>
                  <span className="text-2xl font-bold">{fmt(analysis?.loanMonthlyPayment || 0)}</span>
                </div>
                <div className="flex justify-between items-baseline opacity-80">
                  <span className="text-muted-foreground text-xs">Total Interest</span>
                  <span className="text-sm font-mono">+ {fmt(((analysis?.loanMonthlyPayment * form.getValues().loanTermMonths) - (form.getValues().carPrice - form.getValues().downPayment)))}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  Leasing
                  <Badge className="bg-purple-600">Rent It</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-muted-foreground text-sm">Monthly Payment</span>
                  <span className="text-2xl font-bold">{fmt(analysis?.leaseMonthlyTotal || 0)}</span>
                </div>
                <div className="flex justify-between items-baseline opacity-80">
                  <span className="text-sm font-mono">{(analysis?.leaseAPR || 0).toFixed(2)}%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CHART */}
          <Card>
            <CardHeader>
              <CardTitle>Total Cost of Ownership (Net Cost)</CardTitle>
              <CardDescription>
                Cumulative Cost (Payments + Fees) MINUS Asset Value (Equity). <br />
                *Lower is better.*
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                {isClient ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="year"
                        label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }}
                      />
                      <YAxis
                        tickFormatter={(val) => `$${val / 1000}k`}
                      />
                      <RechartsTooltip
                        formatter={(val: number) => fmt(val)}
                        labelFormatter={(label) => `Year ${label}`}
                        wrapperStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="buyNet"
                        name="Net Cost (Buy)"
                        stroke="#2563eb"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="leaseNet"
                        name="Net Cost (Lease)"
                        stroke="#9333ea"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    Loading Chart...
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg border border-border">
                <h4 className="flex items-center gap-2 font-semibold text-lg mb-2">
                  <Info className="h-5 w-5 text-primary" />
                  The Verdict
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  <strong>Short Term:</strong> The {analysis?.cheaperMonthly} has a lower monthly payment by {fmt(analysis?.diffMonthly)}.
                </p>
                <p className="text-sm text-foreground/90 leading-relaxed mt-2">
                  <strong>Long Term ({form.getValues().ownershipYears} Years):</strong> {analysis?.cheaperLongTerm} wins.
                  You save roughly <strong>{fmt(analysis?.savingsLongTerm)}</strong> by {analysis?.cheaperLongTerm?.toLowerCase()}.
                </p>
                {analysis?.breakEvenYear !== 'Never' && (
                  <p className="text-sm text-emerald-600 mt-2 font-medium">
                    Buying becomes cheaper than Leasing after Year {analysis?.breakEvenYear}.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* USAGE SECTION */}
      <Card className="mb-8 mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            When to buy and when to lease
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">High Mileage Drivers</strong>
              <span className="text-sm text-muted-foreground">If you drive &gt;15k miles/year, buying is almost always better due to strict lease penalties ($0.25/mile).</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Business Owners</strong>
              <span className="text-sm text-muted-foreground">Leasing offers distinct tax advantages (deducting payments as expense) that might outweigh the higher long-term cost.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Tech Enthusiasts</strong>
              <span className="text-sm text-muted-foreground">If you crave the latest safety features and infotainment every 3 years, leasing protects you from tech obsolescence.</span>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
              <strong className="block text-primary mb-1">Cash Flow Conscious</strong>
              <span className="text-sm text-muted-foreground">If keeping monthly fixed costs low is critical right now, leasing often wins on cash flow (even if it loses on net worth).</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SUMMARY */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Buy vs. Lease decision is a trade-off between <strong>Equity</strong> (Buying) and <strong>Cash Flow</strong> (Leasing).</p>
          <p>This calculator exposes the "Net Cost" hidden behind the monthly payments. While leasing often looks cheaper monthly, you own nothing at the end.</p>
          <p>Buying typically breaks even around Year 4 or 5—once the loan is paid off and you drive payment-free.</p>
        </CardContent>
      </Card>

      {/* COMPLETE GUIDE */}
      <section className="space-y-8 text-muted-foreground leading-relaxed bg-card p-8 md:p-12 rounded-xl shadow-sm border border-border" itemScope itemType="https://schema.org/FinanceArticle">
        <meta itemProp="name" content="Lease vs Buying a Car: The Definitive Guide" />
        <meta itemProp="description" content="Should you lease or buy your next vehicle? We break down the math, the hidden fees, Money Factors, and the lifestyle factors that dictate the right choice." />
        <meta itemProp="keywords" content="lease vs buy calculator, car loan calculator, money factor to interest rate, residual value, car buying guide" />

        <header className="space-y-4 border-b border-border pb-8">
          <Badge variant="secondary" className="mb-2">Auto Finance Series</Badge>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight" itemProp="headline">To Lease or To Buy? The Definitive Guide</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            It is the second most expensive purchase most people make. Yet, the financing terms are often intentionally confusing. Let's decode the dealership jargon.
          </p>
        </header>

        {/* TABLE OF CONTENTS */}
        <nav className="bg-muted/50 p-6 rounded-lg border border-border/50">
          <h2 className="text-lg font-bold text-foreground mb-4 uppercase tracking-wider text-xs">Table of Contents</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <li><a href="#mechanics" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The Mechanics: How Leasing Actually Works</a></li>
            <li><a href="#myth" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The "Payments Myth"</a></li>
            <li><a href="#jargon" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> Jargon Buster: Residuals & Money Factors</a></li>
            <li><a href="#golden-rule" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The 1% Rule of Leasing</a></li>
            <li><a href="#checklist" className="flex items-center gap-2 hover:text-primary transition-colors"><ChevronRight className="h-3 w-3" /> The Decision Checklist</a></li>
          </ul>
        </nav>

        <article id="mechanics" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The Mechanics: How Leasing Actually Works</h2>
          <p>
            Think of leasing as "long-term renting." You are paying for the <strong>depreciation</strong> of the car during the time you use it.
          </p>
          <p>
            Example: You lease a $50,000 BMW. The dealer estimates that in 3 years, it will be worth $30,000 (The <strong>Residual Value</strong>).
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>You use:</strong> $20,000 of value ($50k - $30k).</li>
            <li><strong>You pay:</strong> That $20,000 divided by 36 months, plus a "Rent Charge" (Interest).</li>
            <li><strong>At the end:</strong> You return the keys. You own nothing.</li>
          </ul>
        </article>

        <hr className="border-border" />

        <article id="myth" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">The "Payments" Myth</h2>
          <p>
            Salespeople love to ask: <em>"How much do you want to pay monthly?"</em>
          </p>
          <p>
            This is a trap. Leasing almost always wins on monthly payments. You can drive a nicer car for less cash flow per month. But <strong>Net Worth</strong> wise, leasing is the most expensive way to operate a vehicle because you are perpetually paying for the steepest part of the depreciation curve (Years 1-3).
          </p>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Pro Tip</AlertTitle>
            <AlertDescription>
              Buying a car hurts more now (higher payments), but after the loan is paid off (Year 5+), your specific monthly cost drops to $0. That is when you "win" financially.
            </AlertDescription>
          </Alert>
        </article>

        <hr className="border-border" />

        <article id="jargon" className="prose prose-slate dark:prose-invert max-w-none">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground pt-4" itemProp="articleSection">Jargon Buster</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 not-prose">
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-bold mb-2">Residual Value</h4>
              <p className="text-sm text-muted-foreground">The predicted value of the car at the end of the lease. A HIGHER residual is better for you (leads to lower monthly payments).</p>
            </div>
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-bold mb-2">Money Factor (MF)</h4>
              <p className="text-sm text-muted-foreground">The interest rate, presented in a weird decimal format (e.g., 0.0025). Multiply it by <strong>2400</strong> to get the APR. 0.0025 * 2400 = 6% APR.</p>
            </div>
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-bold mb-2">Capitalized Cost (Cap Cost)</h4>
              <p className="text-sm text-muted-foreground">The price of the vehicle. Yes, you CAN negotiate this in a lease! Never pay MSRP just because it's a lease.</p>
            </div>
            <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-bold mb-2">Acquisition Fee</h4>
              <p className="text-sm text-muted-foreground">An administrative fee charged by the leasing company, usually $500-$1000. Rarely negotiable.</p>
            </div>
          </div>
        </article>

      </section>

      {/* RELATED TOOLS */}
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Financial Tools
          </CardTitle>
          <CardDescription>
            Calculators for your next big purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/finance/loan-amortization-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Amortization</p>
                      <p className="text-sm text-muted-foreground">See loan pay-down</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/monthly-budget-planner-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Budget Planner</p>
                      <p className="text-sm text-muted-foreground">Can I afford it?</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/finance/emergency-fund-requirement-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Emergency Fund</p>
                      <p className="text-sm text-muted-foreground">Car repair safety net</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Q&A on Car Financing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it true that I should put $0 down on a lease?</AccordionTrigger>
              <AccordionContent>
                <strong>YES.</strong> Absolutely. If you put $5,000 down and total the car driving off the lot, that $5,000 is gone forever. The insurance pays the leasing company, not you. Always minimize cap cost reduction (down payment) on leases.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What is Gap Insurance and do I need it?</AccordionTrigger>
              <AccordionContent>
                Gap insurance covers the difference between what the car is worth and what you owe if it's totaled. Most leases <em>include</em> Gap insurance (check the contract). For loans, if you put less than 20% down, you should buy it.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Can I end a lease early?</AccordionTrigger>
              <AccordionContent>
                Yes, but it is expensive. You usually have to pay all remaining payments or a hefty termination fee. Alternatively, you can try swapping the lease to someone else using sites like Swapalease.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>What credit score do I need for a good lease deal?</AccordionTrigger>
              <AccordionContent>
                Leasing requires higher credit than buying. Tier 1 rates usually require a score of <strong>720+</strong>. Below 700, the Money Factor jumps significantly, making leasing unattractive.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Does the 3,000 mile oil change rule still apply?</AccordionTrigger>
              <AccordionContent>
                Mostly no. Modern synthetic oils last 7,500 - 10,000 miles. Check your owner's manual. Over-servicing a leased car is throwing money away.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
