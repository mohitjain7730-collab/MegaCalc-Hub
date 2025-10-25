
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank, DollarSign, TrendingUp, Calendar, Target, Info, AlertCircle, Landmark, Building } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  principal: z.number().positive(),
  annualRate: z.number().positive(),
  years: z.number().int().positive(),
  compoundingFrequency: z.coerce.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalAmount: number;
  totalInterest: number;
  chartData: { year: number; value: number, principal: number }[];
  interestPercentage: number;
  annualizedReturn: number;
  effectiveRate: number;
  yearsToDouble: number;
  compoundingFrequency: number;
}

export default function CompoundInterestCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      principal: undefined,
      annualRate: undefined,
      years: undefined,
      compoundingFrequency: 12,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { principal, annualRate, years, compoundingFrequency } = values;
    const P = principal;
    const r = annualRate / 100;
    const n = compoundingFrequency;
    const t = years;

    const totalAmount = P * Math.pow(1 + r / n, n * t);
    const totalInterest = totalAmount - P;

    const chartData = [];
    for (let i = 1; i <= t; i++) {
      const value = P * Math.pow(1 + r / n, n * i);
      chartData.push({
        year: i,
        value: Math.round(value),
        principal: P,
      });
    }

    const interestPercentage = (totalInterest / principal) * 100;
    const annualizedReturn = Math.pow(totalAmount / principal, 1 / years) - 1;
    const effectiveRate = Math.pow(1 + annualRate / 100 / compoundingFrequency, compoundingFrequency) - 1;
    const yearsToDouble = 72 / annualRate;

    setResult({ 
      totalAmount, 
      totalInterest, 
      chartData,
      interestPercentage,
      annualizedReturn: annualizedReturn * 100,
      effectiveRate: effectiveRate * 100,
      yearsToDouble,
      compoundingFrequency
    });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Investment Parameters
          </CardTitle>
          <CardDescription>
            Enter your investment details to see the power of compound interest
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
                        Principal Amount
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 10000" 
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
                  name="annualRate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Annual Interest Rate (%)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 7" 
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
                  name="years" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Number of Years
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 20" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseInt(e.target.value) || undefined)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="compoundingFrequency" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4" />
                        Compounding Frequency
                      </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                    <SelectContent>
                        <SelectItem value="1">Annually</SelectItem>
                        <SelectItem value="2">Semi-Annually</SelectItem>
                        <SelectItem value="4">Quarterly</SelectItem>
                        <SelectItem value="12">Monthly</SelectItem>
                        <SelectItem value="365">Daily</SelectItem>
                    </SelectContent>
                </Select>
                      <FormMessage />
                    </FormItem>
                  )} 
                />
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Compound Interest
              </Button>
        </form>
      </Form>
        </CardContent>
      </Card>
      {result && (
        <div className="space-y-6">
          {/* Main Results Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <PiggyBank className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Investment Growth</CardTitle>
                  <CardDescription>
                    Compound interest over {form.getValues('years')} years • {result.compoundingFrequency} times per year compounding
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Future Value</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total after {form.getValues('years')} years
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Principal Amount</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ${form.getValues('principal').toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your initial investment
                  </p>
                    </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Interest Earned</span>
                        </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.interestPercentage.toFixed(1)}% return on investment
                  </p>
                        </div>
                    </div>

              {/* Key Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Annualized Return
                  </h4>
                  <p className="text-2xl font-bold text-primary">
                    {result.annualizedReturn.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Average annual growth rate
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Years to Double
                  </h4>
                  <p className="text-2xl font-bold text-primary">
                    {result.yearsToDouble.toFixed(1)} years
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Rule of 72 calculation
                  </p>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Investment Growth Over Time</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                         <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        unit="yr" 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${(value/1000)}k`} 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `$${value.toLocaleString()}`, 
                          name === "principal" ? "Principal" : "Future Value"
                        ]}
                        labelFormatter={(year) => `Year ${year}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="principal" 
                        name="Principal" 
                        stroke="hsl(var(--muted-foreground))" 
                        fillOpacity={1} 
                        fill="url(#colorPrincipal)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name="Future Value" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                </div>
            </CardContent>
        </Card>
        </div>
      )}
      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Understanding the Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
            <CardDescription>
              Detailed explanations for each input parameter
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Principal Amount
                  </h4>
                  <p className="text-muted-foreground">
                    The initial amount of money you are investing. This is the foundation that will grow through compound interest over time.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Annual Interest Rate (%)
                  </h4>
                  <p className="text-muted-foreground">
                    The nominal annual interest rate for the investment. Higher rates lead to faster growth, but also higher risk.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Number of Years
                  </h4>
                  <p className="text-muted-foreground">
                    The total number of years the money will be invested. Time is the most powerful factor in compound interest growth.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <PiggyBank className="h-4 w-4" />
                    Compounding Frequency
                  </h4>
                  <p className="text-muted-foreground">
                    How often interest is calculated and added to the principal. More frequent compounding (daily) results in slightly higher returns than less frequent compounding (annually).
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial planning tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/sip-calculator" className="text-primary hover:underline">
                    SIP/DCA Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate systematic investment returns
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/loan-emi-calculator" className="text-primary hover:underline">
                    Loan/EMI Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate loan payments and schedules
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/retirement-savings-calculator" className="text-primary hover:underline">
                    Retirement Savings Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Plan your retirement with comprehensive projections
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/401k-contribution-calculator" className="text-primary hover:underline">
                    401(k) Contribution Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Estimate 401(k) growth and contributions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Compound Interest: Formula, Mechanics, and Wealth Growth" />
    <meta itemProp="description" content="An expert guide detailing the compound interest formula, its mechanics (compounding frequency), the contrast with simple interest, and its critical role in retirement planning, debt, and long-term investment strategy." />
    <meta itemProp="keywords" content="compound interest formula explained, how compounding works, simple vs compound interest, compounding frequency impact, time value of money, exponential growth finance, debt trap compound interest" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-compound-interest-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Compound Interest: The Engine of Exponential Wealth Growth</h1>
    <p className="text-lg italic text-gray-700">Explore the eighth wonder of the world in finance: the power of earning returns on previously earned returns.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#mechanics" className="hover:underline">Mechanics of Compounding: Interest on Interest</a></li>
        <li><a href="#formula" className="hover:underline">The Compound Interest Formula Explained</a></li>
        <li><a href="#frequency" className="hover:underline">The Critical Role of Compounding Frequency</a></li>
        <li><a href="#vs-simple" className="hover:underline">Compound Interest vs. Simple Interest</a></li>
        <li><a href="#applications" className="hover:underline">Practical Applications: Investment and Debt</a></li>
    </ul>
<hr />

    {/* MECHANICS OF COMPOUNDING: INTEREST ON INTEREST */}
    <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Mechanics of Compounding: Interest on Interest</h2>
    <p><strong className="font-semibold">Compound Interest</strong> is the interest earned not only on the initial principal but also on the accumulated interest from previous periods. It represents the foundation of exponential growth in finance and is the cornerstone of long-term wealth creation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Cycle of Exponential Growth</h3>
    <p>The process of compounding relies on **reinvestment**. At the end of each period (the compounding period, e.g., monthly, quarterly, or annually), the interest earned is added to the principal balance. In the next period, the interest calculation applies to this *new, larger* balance, creating a powerful feedback loop:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Period 1:</strong> Interest is earned only on the initial principal.</li>
        <li><strong className="font-semibold">Period 2:</strong> Interest is earned on (Initial Principal + Period 1 Interest).</li>
        <li><strong className="font-semibold">Period n:</strong> Interest is earned on the fully accumulated principal and all prior interest.</li>
    </ol>
    <p>Over extended time horizons, the portion of the balance attributable to compounding interest far exceeds the portion contributed by the initial principal, demonstrating the magic of turning linear growth into exponential growth.</p>

<hr />

    {/* THE COMPOUND INTEREST FORMULA EXPLAINED */}
    <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Compound Interest Formula Explained</h2>
    <p>The compound interest formula calculates the **Future Value (FV)** of a single initial investment (lump sum) after a certain period of time. This formula is distinct from the Future Value of an Annuity (FVA), which calculates the future value of *multiple* regular contributions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Core Lump-Sum Compounding Formula</h3>
    <p>The formula for calculating the total future value is:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'FV = P * (1 + r/n_c)^(n_c * t)'}
        </p>
    </div>

    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">FV:</strong> Future Value (the ending balance).</li>
        <li><strong className="font-semibold">P:</strong> Principal (the initial amount invested or borrowed).</li>
        <li><strong className="font-semibold">r:</strong> The annual nominal interest rate (expressed as a decimal).</li>
        <li><strong className="font-semibold">n_c:</strong> The number of times interest is compounded per year (compounding frequency).</li>
        <li><strong className="font-semibold">t:</strong> The number of years the money is invested for.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Only the Interest Earned</h3>
    <p>To find the value of only the compound interest (CI) earned, simply subtract the initial principal (P) from the Future Value (FV):</p>
    <div className="overflow-x-auto my-4 p-2 bg-gray-50 border rounded-lg inline-block">
        <p className="font-mono text-lg text-red-700 font-bold">
            {'CI = FV - P'}
        </p>
    </div>

<hr />

    {/* THE CRITICAL ROLE OF COMPOUNDING FREQUENCY */}
    <h2 id="frequency" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of Compounding Frequency</h2>
    <p>The variable **$n_c$ (compounding frequency)** is crucial because the more frequently interest is added to the principal, the faster the balance grows. This effect is known as the effective annual rate (EAR) or annual percentage yield (APY).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Impact of Compounding Periods (n_c)</h3>
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 my-4">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compounding Frequency</th>
                <th className-="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">n_c Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Real-World Example</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Annually</td>
                <td className="px-6 py-4 whitespace-nowrap">1</td>
                <td className="px-6 py-4 whitespace-nowrap">Treasury Bills, Some Bonds</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Semi-Annually</td>
                <td className="px-6 py-4 whitespace-nowrap">2</td>
                <td className="px-6 py-4 whitespace-nowrap">Standard Bond Payments</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Quarterly</td>
                <td className="px-6 py-4 whitespace-nowrap">4</td>
                <td className="px-6 py-4 whitespace-nowrap">Some Bank Certificates of Deposit (CDs)</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Monthly</td>
                <td className="px-6 py-4 whitespace-nowrap">12</td>
                <td className="px-6 py-4 whitespace-nowrap">Savings Accounts, Credit Cards</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Daily</td>
                <td className="px-6 py-4 whitespace-nowrap">365</td>
                <td className="px-6 py-4 whitespace-nowrap">High-Yield Savings Accounts, Money Markets</td>
            </tr>
        </tbody>
    </table>
    <p>In theory, the maximum compounding benefit is achieved with **continuous compounding**, where interest is calculated and added instantaneously. While the difference between daily and continuous compounding is marginal, increasing the frequency from annual to daily yields a significant gain in the long run.</p>

<hr />

    {/* COMPOUND INTEREST VS. SIMPLE INTEREST */}
    <h2 id="vs-simple" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Compound Interest vs. Simple Interest</h2>
    <p>Understanding the difference between compound and simple interest is essential for assessing the true return of an investment or the true cost of a loan.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Simple Interest Mechanics</h3>
    <p><strong className="font-semibold">Simple Interest</strong> is calculated solely on the original principal amount (P). The principal never changes, so the total amount of interest earned each period remains constant. The growth of the investment is linear.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Simple Interest = P * r * t'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Crossover Point</h3>
    <p>In the first compounding period, the total interest earned under both simple and compound methods is identical. However, the paths diverge rapidly thereafter. The gap between the final value of a compound interest investment and a simple interest investment grows exponentially over time. This makes the **duration (t)** of the investment the most critical factor in maximizing compounding benefits.</p>

<hr />

    {/* PRACTICAL APPLICATIONS: INVESTMENT AND DEBT */}
    <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Practical Applications: Investment and Debt</h2>
    <p>Compound interest is a double-edged sword: it works powerfully in your favor when saving and devastatingly against you when borrowing.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">For Investors and Savers (Positive Compounding)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Retirement Accounts (401k/IRA):</strong> These accounts rely heavily on decades of compounding to achieve their target future value. Starting early maximizes the time over which interest is earned on interest.</li>
        <li><strong className="font-semibold">Dividend Reinvestment Plans (DRIPs):</strong> Investors choosing to automatically reinvest dividends are actively increasing their principal base, ensuring that future dividends and price appreciation compound faster.</li>
        <li><strong className="font-semibold">Bonds:</strong> Zero-coupon bonds are a pure example of compounding, as the interest is realized only upon maturity, with all intervening returns reinvested to earn more interest.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">For Debtors (Negative Compounding)</h3>
    <p>When borrowing, compound interest is referred to as **compound cost**. It drives the total cost of debt far above the stated nominal rate:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Credit Cards:</strong> These often compound interest daily or monthly, meaning any balance not paid off immediately begins accruing interest on the original debt plus all previously unpaid interest. This creates a destructive debt spiral.</li>
        <li><strong className="font-semibold">Interest-Only Loans:</strong> If a loan only requires interest payments, the principal never shrinks, and the interest cost remains perpetually high. If the interest payments are missed, the accrued interest is added to the principal, leading to negative amortization.</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Compound interest is the single most important mathematical principle governing long-term wealth. Its power lies in its non-linear, exponential effect, turning time itself into an asset.</p>
    <p>Maximizing its benefit requires a disciplined approach to three key variables: maximizing the **time horizon (t)**, ensuring a high **compounding frequency ($n_c$)**, and consistently maintaining a positive **rate of return (r)**. Understanding and harnessing the compound interest formula is the definitive roadmap to achieving exponential financial growth.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about compound interest and investing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is compound interest?</h4>
                <p className="text-muted-foreground">
                  Compound interest is interest earned on both the principal amount and the accumulated interest from previous periods. It's often called "interest on interest" and is the key to exponential growth in investments.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How does compounding frequency affect returns?</h4>
                <p className="text-muted-foreground">
                  More frequent compounding (daily vs. annually) results in slightly higher returns. However, the difference is usually small for most practical purposes. The most important factors are the interest rate and time period.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What's the Rule of 72?</h4>
                <p className="text-muted-foreground">
                  The Rule of 72 is a quick way to estimate how long it takes for an investment to double. Divide 72 by the annual interest rate. For example, at 8% interest, your money will double in about 9 years (72 ÷ 8 = 9).
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Why is time so important in compound interest?</h4>
                <p className="text-muted-foreground">
                  Time is the most powerful factor because compound interest grows exponentially. The longer your money has to compound, the more dramatic the results. Starting early, even with small amounts, often outperforms starting later with larger amounts.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What's the difference between simple and compound interest?</h4>
                <p className="text-muted-foreground">
                  Simple interest is calculated only on the principal amount, while compound interest is calculated on the principal plus any previously earned interest. Compound interest leads to exponential growth, while simple interest grows linearly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
