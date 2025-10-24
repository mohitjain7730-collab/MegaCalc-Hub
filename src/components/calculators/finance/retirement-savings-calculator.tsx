
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Complete Guide to Retirement Planning
            </CardTitle>
            <CardDescription>
              A comprehensive guide to building your retirement savings
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
            <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
          </CardContent>
        </Card>

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
