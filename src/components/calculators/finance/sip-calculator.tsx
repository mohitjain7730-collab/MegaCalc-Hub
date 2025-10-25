
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Calendar, Target, Info } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  monthlyInvestment: z.number().positive(),
  annualInterestRate: z.number().positive(),
  investmentPeriodYears: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  futureValue: number;
  totalInvestment: number;
  totalProfit: number;
  chartData: { year: number; totalInvestment: number; futureValue: number; profit: number }[];
  annualizedReturn: number;
  profitPercentage: number;
  monthlyContribution: number;
  years: number;
}


export default function SipDcaCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      monthlyInvestment: undefined,
      annualInterestRate: undefined,
      investmentPeriodYears: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { monthlyInvestment, annualInterestRate, investmentPeriodYears } = values;
    const r = annualInterestRate / 12 / 100;
    const n = investmentPeriodYears * 12;

    const chartData = [];
    for (let year = 1; year <= investmentPeriodYears; year++) {
      const currentN = year * 12;
      const yearEndFutureValue = monthlyInvestment * ( (Math.pow(1 + r, currentN) - 1) / r ) * (1 + r);
      const yearEndTotalInvestment = monthlyInvestment * currentN;
      const yearEndProfit = yearEndFutureValue - yearEndTotalInvestment;
      chartData.push({
        year: year,
        totalInvestment: Math.round(yearEndTotalInvestment),
        futureValue: Math.round(yearEndFutureValue),
        profit: Math.round(yearEndProfit),
      });
    }

    const futureValue = chartData[chartData.length - 1].futureValue;
    const totalInvestment = monthlyInvestment * n;
    const totalProfit = futureValue - totalInvestment;
    const profitPercentage = (totalProfit / totalInvestment) * 100;
    const annualizedReturn = Math.pow(futureValue / totalInvestment, 1 / investmentPeriodYears) - 1;

    setResult({ 
      futureValue, 
      totalInvestment, 
      totalProfit, 
      chartData,
      annualizedReturn: annualizedReturn * 100,
      profitPercentage,
      monthlyContribution: monthlyInvestment,
      years: investmentPeriodYears
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
            Enter your investment details to see how your money can grow over time
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="monthlyInvestment" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Monthly Investment Amount
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 500" 
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
                  name="annualInterestRate" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Expected Annual Return (%)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 10" 
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
                  name="investmentPeriodYears" 
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Investment Period (Years)
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
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate My Investment Growth
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
                <Landmark className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Investment Projection</CardTitle>
                  <CardDescription>
                    Based on ${result.monthlyContribution.toLocaleString()} monthly investments for {result.years} years
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Future Value</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.futureValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total value after {result.years} years
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Total Invested</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ${result.totalInvestment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your contributions over time
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Total Profit</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${result.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.profitPercentage.toFixed(1)}% return on investment
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
                    {result.annualizedReturn.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Average annual return on your investment
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Investment Multiplier
                  </h4>
                  <p className="text-2xl font-bold text-primary">
                    {(result.futureValue / result.totalInvestment).toFixed(1)}x
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your money grows by this factor
                  </p>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Investment Growth Over Time</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                          name === 'totalInvestment' ? 'Total Invested' : 
                          name === 'futureValue' ? 'Portfolio Value' : 'Profit'
                        ]}
                        labelFormatter={(year) => `Year ${year}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="totalInvestment" 
                        name="Total Investment" 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="futureValue" 
                        name="Portfolio Value" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="profit" 
                        name="Profit" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Insights and Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Key Insights & Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    💡 The Power of Compounding
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Your profit of ${result.totalProfit.toLocaleString()} represents the magic of compound interest. 
                    Your money is working for you, generating returns on both your contributions and previous gains.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    📈 Dollar-Cost Averaging Benefits
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    By investing ${result.monthlyContribution.toLocaleString()} monthly, you're buying more shares when prices are low 
                    and fewer when prices are high, smoothing out market volatility.
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                    ⏰ Time is Your Greatest Asset
                  </h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    The longer you stay invested, the more powerful compounding becomes. 
                    Starting early and staying consistent is key to building wealth.
                  </p>
                </div>
                
                <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                    🎯 Consider Increasing Contributions
                  </h4>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    As your income grows, consider increasing your monthly investment. 
                    Even a 10% increase can significantly boost your final portfolio value.
                  </p>
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
                    Monthly Investment Amount
                  </h4>
                  <p className="text-muted-foreground">
                    The fixed amount you plan to invest every month. Even small amounts like $50-100 can make a significant difference over time through compound growth.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Expected Annual Return (%)
                  </h4>
                  <p className="text-muted-foreground">
                    Historical average returns: S&P 500 (~10%), Bonds (~5%), Real Estate (~7%). Remember, past performance doesn't guarantee future results.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Investment Period (Years)
                  </h4>
                  <p className="text-muted-foreground">
                    The longer you stay invested, the more powerful compounding becomes. Time is your greatest ally in building wealth.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Dollar-Cost Averaging
                  </h4>
                  <p className="text-muted-foreground">
                    By investing fixed amounts regularly, you buy more shares when prices are low and fewer when prices are high, smoothing out market volatility.
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
                  <a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">
                    Compound Interest Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate compound interest growth over time
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
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/InvestmentFund">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to SIP and DCA Returns: Understanding Dollar-Cost Averaging Investment Strategy" />
    <meta itemProp="description" content="A detailed, expert guide on Systematic Investment Plan (SIP) and Dollar-Cost Averaging (DCA). Learn the formulas, benefits, and mechanics of averaging investment costs over time to mitigate market volatility and maximize long-term returns." />
    <meta itemProp="keywords" content="SIP returns analysis, Dollar-Cost Averaging mechanics, CAGR for SIP, absolute returns vs XIRR, calculating weighted average cost, equity investment strategy, market volatility mitigation, long-term wealth creation" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-sip-dca-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to SIP/DCA Returns: Mastering the Mechanics of Dollar-Cost Averaging</h1>
    <p className="text-lg italic text-gray-700">Explore the powerful financial strategy that transforms market volatility from a risk into an advantage for long-term wealth creation.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">DCA and SIP: Core Concepts and Terminology</a></li>
        <li><a href="#mechanics" className="hover:underline">The Mechanics of Cost Averaging: Buying More Units</a></li>
        <li><a href="#metrics" className="hover:underline">Key Return Metrics: Absolute Return, CAGR, and XIRR</a></li>
        <li><a href="#return-calculation" className="hover:underline">Calculating Returns for Systematic Investments</a></li>
        <li><a href="#strategy" className="hover:underline">Strategic Advantages and Limitations of DCA</a></li>
    </ul>
<hr />

    {/* CORE CONCEPTS AND TERMINOLOGY */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">DCA and SIP: Core Concepts and Terminology</h2>
    <p><strong className="font-semibold">Dollar-Cost Averaging (DCA)</strong> and <strong className="font-semibold">Systematic Investment Plan (SIP)</strong> are interchangeable terms describing an investment strategy where an investor commits a fixed amount of money at regular intervals, regardless of the asset's price. This strategy aims to reduce the average cost per unit over the investment horizon, thereby mitigating the risk associated with investing a large lump sum just before a market downturn (timing risk).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">SIP vs. DCA: A Global Distinction</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Dollar-Cost Averaging (DCA):</strong> The broader term predominantly used in Western finance (North America and Europe). It can apply to any asset, from stocks and bonds to cryptocurrencies.</li>
        <li><strong className="font-semibold">Systematic Investment Plan (SIP):</strong> The specific term widely used in Asian markets, particularly India, to describe this strategy applied primarily to **Mutual Funds**. The core principle—fixed amount, regular intervals—remains identical.</li>
    </ul>
    <p>The success of the SIP/DCA strategy lies not in predicting the market but in consistently executing the plan, leveraging volatility as an opportunity to acquire more units when prices are low.</p>

<hr />

    {/* MECHANICS OF COST AVERAGING */}
    <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mechanics of Cost Averaging: Buying More Units</h2>
    <p>The primary financial advantage of DCA/SIP is the ability to acquire units at a lower <strong className="font-semibold">Weighted Average Cost</strong> than the average market price over the period. This is because the fixed cash flow purchases <strong className="font-semibold">more units</strong> when the price is low and fewer units when the price is high. This inverse relationship between unit price and unit purchase volume is the essence of the averaging benefit.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Unit Acquisition Example (SIP/DCA in Action)</h3>
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 my-4">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fixed Investment (PMT)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (NAV)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Purchased</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Jan</td>
                <td className="px-6 py-4 whitespace-nowrap">$1,000</td>
                <td className="px-6 py-4 whitespace-nowrap">$100</td>
                <td className="px-6 py-4 whitespace-nowrap">10.0 units</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Feb</td>
                <td className="px-6 py-4 whitespace-nowrap">$1,000</td>
                <td className="px-6 py-4 whitespace-nowrap">$80 (Market Drop)</td>
                <td className="px-6 py-4 whitespace-nowrap">12.5 units</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap">Mar</td>
                <td className="px-6 py-4 whitespace-nowrap">$1,000</td>
                <td className="px-6 py-4 whitespace-nowrap">$110 (Market High)</td>
                <td className="px-6 py-4 whitespace-nowrap">9.1 units</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">Totals</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">$3,000</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">Average Price: $96.67</td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold">Total Units: 31.6 units</td>
            </tr>
        </tbody>
    </table>
    <p>In the example above, the <strong className="font-semibold">Average Purchase Price</strong> is $96.67. However, the <strong className="font-semibold">Weighted Average Cost (WAC)</strong> per unit is calculated as Total Investment divided by Total Units: $3,000 / 31.6$ units $\approx$ **$94.94 per unit**.</p>
    <p>The lower Weighted Average Cost relative to the simple Average Price is the direct benefit of DCA, ensuring the overall portfolio cost is minimized during volatile periods.</p>

<hr />

    {/* KEY RETURN METRICS */}
    <h2 id="metrics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Return Metrics: Absolute Return, CAGR, and XIRR</h2>
    <p>Calculating returns for SIP/DCA is inherently complex because cash flows occur at multiple points in time. Standard return metrics for lump-sum investments are insufficient, necessitating time-weighted and money-weighted methods.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Absolute Return (Simple Return)</h3>
    <p>This is the simplest, non-annualized measure of profitability. It shows the total gain as a percentage of the total investment, ignoring the timing of the deposits. While easy to calculate, it should not be used for comparison against other annualized returns.</p>
    <div className="overflow-x-auto my-4 p-2 bg-gray-50 border rounded-lg inline-block">
        <p className="font-mono text-lg text-red-700 font-bold">
            {'Absolute Return = [(Current Value - Total Investment) / Total Investment] * 100'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Compounded Annual Growth Rate (CAGR)</h3>
    <p>CAGR is the theoretical constant annual rate of return that would have produced the final value from the initial investment. For a single lump sum, it's straightforward. For an SIP/DCA portfolio, calculating an accurate, equivalent CAGR is difficult because the investment is layered over time. SIP returns are generally better calculated using the XIRR method.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Extended Internal Rate of Return (XIRR)</h3>
    <p>XIRR is the most robust and accurate metric for calculating SIP/DCA returns. It is a refinement of the Internal Rate of Return (IRR) designed specifically to handle **irregular** or **periodic** cash flows occurring at **specific dates**. XIRR solves for the annual discount rate that equates the present value of all cash outflows (the periodic SIP payments) with the present value of all cash inflows (the current portfolio value/redemption value).</p>
    <p>Financial platforms use iterative algorithms to solve the complex XIRR equation, ensuring the return accurately reflects the time value of money for *each individual payment* made into the plan. This is the gold standard for measuring SIP performance.</p>

<hr />

    {/* CALCULATING RETURNS FOR SYSTEMATIC INVESTMENTS */}
    <h2 id="return-calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Returns for Systematic Investments: The XIRR Mechanism</h2>
    <p>To calculate the XIRR for an SIP/DCA plan, you need a precise data set of all transactions. The fundamental equation that XIRR solves for is:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'0 = Sum [ CF_i / (1 + Rate)^(d_i / 365) ]'}
        </p>
    </div>
    <p>Where:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">CFᵢ:</strong> The cash flow on date i (SIP payments are negative outflows, the final redemption value is a positive inflow).</li>
        <li><strong className="font-semibold">Rate:</strong> The XIRR (the unknown rate being solved for).</li>
        <li><strong className="font-semibold">dᵢ:</strong> The number of days between the date of cash flow i and the start date (or another fixed reference date).</li>
    </ul>
    <p>The final value of the portfolio is treated as the final positive cash flow on the calculation date, completing the series. The solver finds the Rate that makes the net present value of all transactions equal to zero.</p>

<hr />

    {/* STRATEGIC ADVANTAGES AND LIMITATIONS OF DCA */}
    <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Advantages and Limitations of DCA</h2>
    <p>SIP/DCA is highly recommended for retail investors seeking a disciplined, low-stress entry into capital markets. However, its benefits must be weighed against its theoretical limitations.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Core Strategic Benefits</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Risk Mitigation:</strong> It eliminates the behavioral risk of trying to time the market and the financial risk of investing a large sum at a price peak.</li>
        <li><strong className="font-semibold">Discipline and Consistency:</strong> By automating investments, it forces financial discipline, which is a key predictor of long-term investment success.</li>
        <li><strong className="font-semibold">Averaging Effect:</strong> The core benefit of buying more units when prices are low lowers the overall cost basis of the portfolio.</li>
    </ol>

    <h3 className="text-xl font-semibold text-foreground mt-6">Limitations and Academic Debate</h3>
    <p>While effective for managing risk, academic studies on long-term market performance often present a theoretical argument against DCA:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Lump Sum Advantage (LSA):</strong> Because global markets have historically trended upward, statistical models often show that <strong className="font-semibold">Lump Sum Investing (LSI)</strong>—investing all capital immediately—outperforms DCA approximately two-thirds of the time. This is because the entire capital begins earning returns sooner.</li>
        <li><strong className="font-semibold">Lost Opportunity Cost:</strong> The money waiting to be deployed via future SIP/DCA payments is not invested, representing a potential opportunity cost in an appreciating market.</li>
    </ul>
    <p>Ultimately, the choice between DCA/SIP and LSI is a trade-off between the mathematical probability of higher returns (LSI) and the psychological benefit of reduced risk and emotional discipline (DCA/SIP).</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The SIP/DCA methodology stands as a highly effective, time-tested investment framework for achieving long-term financial goals by systematizing contributions and neutralizing emotional decision-making. Its success hinges on the <strong className="font-semibold">averaging effect</strong>, which ensures the investor benefits from market dips, resulting in a lower weighted average cost per unit.</p>
    <p>For investors focused on disciplined accumulation and managing market volatility, SIP/DCA is the superior strategy. The only appropriate metric for measuring the true performance of these multi-period investments is the <strong className="font-semibold">XIRR</strong>, as it accurately accounts for the time-weighted nature of every single dollar invested.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about SIP/DCA investing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is Dollar-Cost Averaging (DCA)?</h4>
                <p className="text-muted-foreground">
                  DCA is an investment strategy where you invest a fixed amount of money at regular intervals, regardless of market conditions. This helps reduce the impact of market volatility on your investments.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How much should I invest monthly?</h4>
                <p className="text-muted-foreground">
                  Start with an amount you can comfortably afford consistently. Even $50-100 per month can make a significant difference over time due to compound growth. The key is consistency, not the amount.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What's a realistic expected return?</h4>
                <p className="text-muted-foreground">
                  Historical average returns: S&P 500 (~10% annually), Bonds (~5%), Real Estate (~7%). However, past performance doesn't guarantee future results, and returns can vary significantly year to year.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Should I stop investing during market downturns?</h4>
                <p className="text-muted-foreground">
                  No! Market downturns are actually beneficial for DCA investors because you're buying more shares at lower prices. This is when your strategy works best - you're getting more value for your money.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How long should I stay invested?</h4>
                <p className="text-muted-foreground">
                  The longer, the better. Compound interest works best over extended periods. Even 5-10 years can show significant growth, but 20+ years typically provides the most dramatic results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
