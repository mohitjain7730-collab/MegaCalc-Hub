
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, DollarSign, TrendingUp, Calendar, Target, Info, AlertCircle, Building, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  currentAge: z.number().int().positive(),
  retirementAge: z.number().int().positive(),
  currentSavings: z.number().nonnegative(),
  monthlyContribution: z.number().nonnegative(),
  annualReturn: z.number().positive(),
  targetCorpus: z.number().positive().optional(),
}).refine(data => data.retirementAge > data.currentAge, {
  message: "Retirement age must be greater than current age.",
  path: ["retirementAge"],
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalSavings: number;
  totalInvested: number;
  totalInterest: number;
  requiredMonthlyContribution?: number;
  chartData: { age: number; totalInvested: number; futureValue: number }[];
  yearsToRetirement: number;
  monthlyIncome: number;
  annualIncome: number;
  interestPercentage: number;
  isOnTrack: boolean;
  shortfall: number;
}

export default function RetirementSavingsCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [calculationMode, setCalculationMode] = useState<'project' | 'target'>('project');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: undefined,
      retirementAge: undefined,
      currentSavings: undefined,
      monthlyContribution: undefined,
      annualReturn: undefined,
      targetCorpus: undefined,
    },
  });
  
  const calculateRetirement = (values: FormValues) => {
    const { currentAge, retirementAge, currentSavings, monthlyContribution, annualReturn, targetCorpus } = values;
    
    const rMonthly = annualReturn / 12 / 100;
    const n = (retirementAge - currentAge) * 12;

    let contribution = monthlyContribution;

    if (calculationMode === 'target' && targetCorpus) {
        const fvCurrent = currentSavings * Math.pow(1 + rMonthly, n);
        const numerator = targetCorpus - fvCurrent;
        const denominator = (Math.pow(1 + rMonthly, n) - 1) / rMonthly;
        if (denominator > 0 && numerator > 0) {
            contribution = numerator / denominator;
        } else {
            contribution = 0;
        }
    }


    const chartData = [];
    
    for (let year = 1; year <= retirementAge - currentAge; year++) {
      const currentN = year * 12;
      const age = currentAge + year;

      const fvCurrentSavings = currentSavings * Math.pow(1 + rMonthly, currentN);
      const fvMonthlyContributions = (contribution || 0) * ((Math.pow(1 + rMonthly, currentN) - 1) / rMonthly);
      
      const futureValue = fvCurrentSavings + fvMonthlyContributions;
      const yearEndTotalInvestment = currentSavings + ((contribution || 0) * currentN);
      
      chartData.push({
        age: age,
        totalInvested: Math.round(yearEndTotalInvestment),
        futureValue: Math.round(futureValue),
      });
    }

    const totalSavings = chartData.length > 0 ? chartData[chartData.length - 1].futureValue : currentSavings;
    const totalInvested = currentSavings + ((contribution || 0) * n);
    const totalInterest = totalSavings - totalInvested;

    const yearsToRetirement = retirementAge - currentAge;
    const monthlyIncome = (totalSavings * 0.04) / 12; // 4% rule
    const annualIncome = monthlyIncome * 12;
    const interestPercentage = (totalInterest / totalSavings) * 100;
    const isOnTrack = calculationMode === 'target' ? (contribution > 0 && contribution <= (monthlyContribution || 0)) : true;
    const shortfall = calculationMode === 'target' && targetCorpus ? Math.max(0, targetCorpus - totalSavings) : 0;

    setResult({ 
        totalSavings, 
        totalInvested, 
        totalInterest, 
        chartData, 
        requiredMonthlyContribution: calculationMode === 'target' ? contribution : undefined,
        yearsToRetirement,
        monthlyIncome,
        annualIncome,
        interestPercentage,
        isOnTrack,
        shortfall
    });
  };


  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Retirement Planning Parameters
          </CardTitle>
          <CardDescription>
            Plan your retirement with comprehensive projections and target calculations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="project" onValueChange={(value) => setCalculationMode(value as 'project' | 'target')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="project">Project My Savings</TabsTrigger>
              <TabsTrigger value="target">Calculate for a Target</TabsTrigger>
            </TabsList>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(calculateRetirement)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField 
                    control={form.control} 
                    name="currentAge" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Current Age (years)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 30" 
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
                    name="retirementAge" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Retirement Age (years)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 65" 
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
                    name="currentSavings" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Current Savings
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 50000" 
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
                    name="annualReturn" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Expected Annual Return (%)
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
                  
                  {calculationMode === 'project' ? (
                    <FormField 
                      control={form.control} 
                      name="monthlyContribution" 
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Monthly Contribution
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 1000" 
                              {...field} 
                              value={field.value ?? ''} 
                              onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                  ) : (
                    <FormField 
                      control={form.control} 
                      name="targetCorpus" 
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-2">
                            <Landmark className="h-4 w-4" />
                            Target Retirement Corpus
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="e.g., 1000000" 
                              {...field} 
                              value={field.value ?? ''} 
                              onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} 
                    />
                  )}
                </div>
                <Button type="submit" className="w-full md:w-auto">
                  Calculate Retirement Projection
                </Button>
              </form>
            </Form>
          </Tabs>
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
                  <CardTitle>Your Retirement Projection</CardTitle>
                  <CardDescription>
                    {result.yearsToRetirement} years to retirement • {calculationMode === 'project' ? 'Projection Mode' : 'Target Mode'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {calculationMode === 'project' ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-6 bg-primary/5 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">Retirement Balance</span>
                      </div>
                      <p className="text-3xl font-bold text-primary">
                        ${result.totalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        At age {form.getValues('retirementAge')}
                      </p>
                    </div>
                    
                    <div className="text-center p-6 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Total Invested</span>
                      </div>
                      <p className="text-2xl font-bold">
                        ${result.totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your contributions over time
                      </p>
                    </div>
                    
                    <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-muted-foreground">Interest Earned</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        ${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.interestPercentage.toFixed(1)}% of total balance
                      </p>
                    </div>
                  </div>

                  {/* Key Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Monthly Retirement Income
                      </h4>
                      <p className="text-2xl font-bold text-primary">
                        ${result.monthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Based on 4% withdrawal rule
                      </p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Annual Retirement Income
                      </h4>
                      <p className="text-2xl font-bold text-primary">
                        ${result.annualIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sustainable annual income
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center p-6 bg-primary/5 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted-foreground">Required Monthly Contribution</span>
                    </div>
                    {result.requiredMonthlyContribution !== undefined && result.requiredMonthlyContribution > 0 ? (
                      <p className="text-3xl font-bold text-primary">
                        ${result.requiredMonthlyContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                    ) : (
                      <p className="text-lg text-green-600">
                        Your current savings and returns already meet or exceed your goal!
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      To reach your target of ${form.getValues('targetCorpus')?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {/* Growth Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Retirement Savings Growth Over Time</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorFv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="age" 
                        unit="yrs" 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Age', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `$${(value/1000)}k`} 
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          `$${value.toLocaleString()}`, 
                          name === "totalInvested" ? "Total Invested" : "Projected Value"
                        ]}
                        labelFormatter={(age) => `Age ${age}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="totalInvested" 
                        name="Total Invested" 
                        stroke="hsl(var(--muted-foreground))" 
                        fillOpacity={1} 
                        fill="url(#colorInv)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="futureValue" 
                        name="Projected Value" 
                        stroke="hsl(var(--primary))" 
                        fillOpacity={1} 
                        fill="url(#colorFv)" 
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
                    <Calendar className="h-4 w-4" />
                    Current Age & Retirement Age
                  </h4>
                  <p className="text-muted-foreground">
                    Your current age and the age you plan to retire. The difference determines your investment horizon and the power of compound growth.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Current Savings
                  </h4>
                  <p className="text-muted-foreground">
                    The total amount you have already saved for retirement. This existing balance will continue to grow through compound interest.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Monthly Contribution
                  </h4>
                  <p className="text-muted-foreground">
                    The amount you plan to save and invest towards retirement each month. Consistency is key for long-term growth.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Expected Annual Return (%)
                  </h4>
                  <p className="text-muted-foreground">
                    The average annual growth rate you expect from your investments. Historical stock market returns average 7-10% annually.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Target Retirement Corpus
                  </h4>
                  <p className="text-muted-foreground">
                    The total amount of money you aim to have saved by retirement. Use the 4% rule: target = annual expenses × 25.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    Calculation Modes
                  </h4>
                  <p className="text-muted-foreground">
                    Project Mode: See how your current plan will grow. Target Mode: Calculate what you need to save to reach a specific goal.
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
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/FinanceSummary">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Retirement Savings: Formulas, Planning Models, and Wealth Accumulation" />
    <meta itemProp="description" content="An expert-level guide covering the fundamental concepts of retirement planning, including the Future Value of Annuity (FVA) for accumulation, the 4% Rule, inflation modeling, and determining required savings rates." />
    <meta itemProp="keywords" content="retirement savings calculation, future value of annuity, required retirement corpus, 4 percent rule, retirement planning formulas, inflation adjusted returns, retirement withdrawal strategies, financial independence retire early (FIRE)" />
    <meta itemProp="author" content="[Your Site's Financial Analyst Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-retirement-savings-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Retirement Savings: Formulas, Corpus Goals, and Planning Strategies</h1>
    <p className="text-lg italic text-muted-foreground">Master the financial concepts and equations necessary to calculate your target retirement corpus and achieve financial independence.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-primary">
        <li><a href="#corpus" className="hover:underline">Defining the Target Corpus: The Goal and The Multiplier</a></li>
        <li><a href="#accumulation" className="hover:underline">Accumulation Phase: The Future Value of Annuity (FVA)</a></li>
        <li><a href="#withdrawal" className="hover:underline">Distribution Phase: The Safe Withdrawal Rate and 4% Rule</a></li>
        <li><a href="#inflation" className="hover:underline">The Critical Role of Inflation in Retirement Planning</a></li>
        <li><a href="#sensitivity" className="hover:underline">Key Planning Variables and Sensitivity Analysis</a></li>
    </ul>
<hr />

    {/* DEFINING THE TARGET CORPUS: THE GOAL AND THE MULTIPLIER */}
    <h2 id="corpus" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Defining the Target Corpus: The Goal and The Multiplier</h2>
    <p>The first and most crucial step in retirement planning is determining the <strong className="font-semibold">Target Retirement Corpus</strong> (or Nest Egg)—the total lump sum required on the day you retire. This amount dictates the necessary savings rate throughout your working life.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Financial Independence (FI) Multiplier</h3>
    <p>The corpus is universally calculated as a multiple of your expected annual retirement expenses. A conservative and common approach is the <strong className="font-semibold">25x Rule</strong>, derived from the 4% Rule (detailed below). This rule suggests that the target corpus should be 25 times your first year of retirement expenses, adjusted for inflation.</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Target Corpus = Annual Expenses in Year 1 of Retirement * 25'}
        </p>
    </div>
    <p>For example, if you project needing $40,000 in today's dollars, and inflation adjustment brings that to $75,000 upon retirement, your Target Corpus is $75,000 multiplied by 25 = $1,875,000$.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Retirement Shortfall: Bridging the Gap</h3>
    <p>The required savings (the gap you must fill) is calculated by subtracting your expected value of existing retirement assets (like a 401k or pension) from your total Target Corpus. This remaining figure becomes the basis for calculating your necessary annual contribution.</p>

<hr />

    {/* ACCUMULATION PHASE: THE FUTURE VALUE OF ANNUITY (FVA) */}
    <h2 id="accumulation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Accumulation Phase: The Future Value of Annuity (FVA)</h2>
    <p>The <strong className="font-semibold">Accumulation Phase</strong> covers the years you contribute to your savings. The primary formula used here is the <strong className="font-semibold">Future Value of an Annuity (FVA)</strong>, which calculates how a series of equal, periodic contributions (PMT) will grow over time (n), given a rate of return (r).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The FVA Formula and Solving for Required PMT</h3>
    <p>The standard FVA formula helps determine the final value of your periodic contributions. For retirement planning, this formula is algebraically rearranged to solve for the required annual <strong className="font-semibold">Payment (PMT)</strong> needed to reach the Target Corpus (FV):</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'PMT = FV * [ r / ((1 + r)^n - 1) ]'}
        </p>
    </div>
    <p>Where PMT is the required annual contribution, FV is the Target Corpus, r is the expected annual real (inflation-adjusted) return, and n is the number of years until retirement.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Power of Time and Compounding</h3>
    <p>The calculation demonstrates that the contribution required (PMT) is heavily non-linear. Saving early reduces the required PMT significantly because the principal has more time to compound exponentially. A high rate of return (r) accelerates growth, but a longer duration (n) has the most profound, non-reversible impact on lowering the required periodic savings amount.</p>

<hr />

    {/* DISTRIBUTION PHASE: THE SAFE WITHDRAWAL RATE AND 4% RULE */}
    <h2 id="withdrawal" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Distribution Phase: The Safe Withdrawal Rate and 4% Rule</h2>
    <p>The <strong className="font-semibold">Distribution Phase</strong> is when the retiree draws income from the corpus. The goal is to maximize withdrawals while ensuring the fund lasts for the entire duration of retirement (often 30+ years).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Trinity Study and the 4% Rule</h3>
    <p>The <strong className="font-semibold">4% Rule</strong>, popularized by the 1998 Trinity Study, is the cornerstone of withdrawal strategy. It suggests that a retiree can safely withdraw 4% of their initial corpus in the first year of retirement, and then adjust that dollar amount annually for inflation, with a high probability (historically over 95%) of the funds lasting 30 years.</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'First Year Withdrawal = Target Corpus * 0.04'}
        </p>
    </div>
    <p>This rule inherently links the required corpus size (25x annual expenses) to the safe withdrawal rate. While highly influential, modern planning often uses dynamic withdrawal strategies and lower rates (e.g., 3.5%) to account for potential sequence of returns risk.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sequence of Returns Risk</h3>
    <p>This risk is unique to the distribution phase. It highlights that the order in which investment returns occur matters significantly. A string of poor returns early in retirement—when the corpus is largest and withdrawals are taking a high percentage of the remaining balance—can rapidly deplete the fund, even if average long-term returns are high.</p>

<hr />

    {/* THE CRITICAL ROLE OF INFLATION IN RETIREMENT PLANNING */}
    <h2 id="inflation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of Inflation in Retirement Planning</h2>
    <p>Inflation is the silent killer of retirement purchasing power. A robust savings plan must project future needs in inflated dollars and model returns on an inflation-adjusted (real) basis.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Modeling Future Expenses</h3>
    <p>To find the real Target Corpus, today's annual expenses must be projected forward to the retirement date using an expected inflation rate (i):</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Future Annual Expense = Current Expense * (1 + i)^(Years to Retirement)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Using Real Rate of Return</h3>
    <p>To avoid compounding inflation into both the savings side and the expense side, the standard practice is to use the <strong className="font-semibold">real rate of return</strong> for the FVA calculation. The real rate is the nominal (market) return adjusted for inflation:</p>
    <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
        <p className="font-mono text-xl text-destructive font-bold">
            {'Real Rate (r) = [(1 + Nominal Rate) / (1 + Inflation Rate)] - 1'}
        </p>
    </div>
    <p>Using the real rate simplifies the calculation, allowing the PMT to be calculated in today's constant dollars, ensuring the results are immediately actionable for budgeting.</p>

<hr />

    {/* KEY PLANNING VARIABLES AND SENSITIVITY ANALYSIS */}
    <h2 id="sensitivity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Planning Variables and Sensitivity Analysis</h2>
    <p>The retirement savings model is highly sensitive to small changes in three core variables. Professional planners routinely use sensitivity analysis to show a client the risk inherent in their assumptions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Expected Rate of Return (r)</h3>
    <p>A 1% change in the assumed return can change the Target Corpus required contribution (PMT) by 15% to 30% over a 30-year period. Since market returns are the least predictable factor, planners test a range of scenarios (e.g., 5%, 7%, and 9% real return) to establish a margin of safety.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Retirement Duration (n)</h3>
    <p>Due to increased longevity, extending the retirement duration from 30 years to 35 years significantly increases the required corpus. This highlights the importance of incorporating life expectancy estimates and health-care cost inflation into the initial expense projection.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Savings Start Date</h3>
    <p>The earlier the savings begin, the lower the required PMT. The opportunity cost of delaying saving by even five years in your twenties is astronomically high, often requiring a doubling or tripling of the PMT in later years to catch up, underscoring the non-linear benefit of time.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Retirement savings planning is fundamentally an exercise in solving the Future Value of Annuity equations under the strict constraints of inflation and market risk. The Target Corpus, typically framed by the **25x/4% Rule**, provides a clear, actionable goal.</p>
    <p>Success relies not on market timing, but on two key disciplines: using the <strong className="font-semibold">real rate of return</strong> to accurately reflect purchasing power, and maximizing the <strong className="font-semibold">duration</strong> of the accumulation phase. By systematically calculating the required periodic contribution (PMT), individuals gain the necessary control to bridge the gap between their current financial position and long-term financial independence.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about retirement planning and savings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How much should I save for retirement?</h4>
                <p className="text-muted-foreground">
                  A common rule of thumb is to save 10-15% of your income, but the exact amount depends on your age, income, and retirement goals. Use the 4% rule: multiply your desired annual retirement income by 25 to find your target savings.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What's the 4% withdrawal rule?</h4>
                <p className="text-muted-foreground">
                  The 4% rule suggests you can safely withdraw 4% of your retirement savings in the first year, then adjust for inflation each year. This should make your money last 30+ years in retirement.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">When should I start saving for retirement?</h4>
                <p className="text-muted-foreground">
                  Start as early as possible! Even small amounts saved in your 20s can grow significantly due to compound interest. Time is your greatest asset in retirement planning.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Should I prioritize 401(k) or IRA?</h4>
                <p className="text-muted-foreground">
                  First, get your full 401(k) employer match (free money!). Then max out your IRA. After that, go back to your 401(k) to contribute more. This maximizes tax advantages and employer benefits.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How do I choose between Traditional and Roth accounts?</h4>
                <p className="text-muted-foreground">
                  Traditional accounts give you a tax break now but tax withdrawals in retirement. Roth accounts are taxed now but offer tax-free withdrawals. Choose based on whether you expect to be in a higher or lower tax bracket in retirement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
