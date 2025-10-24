
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
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  currentAge: z.number().int().positive(),
  retirementAge: z.number().int().positive(),
  currentBalance: z.number().nonnegative(),
  annualSalary: z.number().positive(),
  monthlyContributionPercent: z.number().nonnegative(),
  annualReturn: z.number().positive(),
  employerMatchPercent: z.number().nonnegative(),
  employerMatchLimit: z.number().nonnegative(),
}).refine(data => data.retirementAge > data.currentAge, {
  message: "Retirement age must be greater than current age.",
  path: ["retirementAge"],
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  totalBalance: number;
  totalContributions: number;
  totalEmployerMatch: number;
  totalInterest: number;
  chartData: { 
    age: number; 
    yourContributions: number; 
    employerContributions: number;
    interest: number;
    total: number;
  }[];
  monthlyContribution: number;
  monthlyEmployerMatch: number;
  yearsToRetirement: number;
  contributionPercentage: number;
  matchPercentage: number;
  isMaxingOut: boolean;
}

export default function FourOhOneKCalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentAge: undefined,
      retirementAge: undefined,
      currentBalance: undefined,
      annualSalary: undefined,
      monthlyContributionPercent: undefined,
      annualReturn: undefined,
      employerMatchPercent: undefined,
      employerMatchLimit: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const { currentAge, retirementAge, currentBalance, annualSalary, monthlyContributionPercent, annualReturn, employerMatchPercent, employerMatchLimit } = values;

    const monthlySalary = annualSalary / 12;
    const monthlyContribution = monthlySalary * (monthlyContributionPercent / 100);
    const maxMatchContribution = monthlySalary * (employerMatchLimit / 100);
    const employerMatch = Math.min(monthlyContribution, maxMatchContribution) * (employerMatchPercent / 100);

    const rMonthly = annualReturn / 12 / 100;
    const n = (retirementAge - currentAge) * 12;

    const totalMonthlyInput = monthlyContribution + employerMatch;
    
    let futureValue = currentBalance;
    let totalContributions = currentBalance;
    let totalEmployerMatch = 0;

    const chartData = [];
    
    for (let year = 1; year <= retirementAge - currentAge; year++) {
      let fvAtYearEnd = currentBalance * Math.pow(1 + rMonthly, year * 12);
      let fvContributions = 0;
      if (rMonthly > 0) {
        fvContributions = (monthlyContribution + employerMatch) * ((Math.pow(1 + rMonthly, year * 12) - 1) / rMonthly);
      } else {
        fvContributions = (monthlyContribution + employerMatch) * (year * 12);
      }

      const total = fvAtYearEnd + fvContributions;
      const yourContributions = currentBalance + (monthlyContribution * year * 12);
      const employerContributions = employerMatch * year * 12;
      const interest = total - yourContributions - employerContributions;

      chartData.push({
        age: currentAge + year,
        yourContributions: Math.round(yourContributions),
        employerContributions: Math.round(employerContributions),
        interest: Math.round(interest),
        total: Math.round(total),
      });
    }

    if(chartData.length > 0) {
      const finalData = chartData[chartData.length - 1];
      const yearsToRetirement = retirementAge - currentAge;
      const contributionPercentage = (monthlyContribution * 12) / annualSalary * 100;
      const matchPercentage = (employerMatch * 12) / annualSalary * 100;
      const isMaxingOut = (monthlyContribution * 12) >= 23500; // 2025 limit
      
      setResult({
        totalBalance: finalData.total,
        totalContributions: finalData.yourContributions,
        totalEmployerMatch: finalData.employerContributions,
        totalInterest: finalData.interest,
        chartData,
        monthlyContribution,
        monthlyEmployerMatch: employerMatch,
        yearsToRetirement,
        contributionPercentage,
        matchPercentage,
        isMaxingOut
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            401(k) Parameters
          </CardTitle>
          <CardDescription>
            Enter your 401(k) details to project your retirement savings
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  name="currentBalance" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Current 401(k) Balance
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 25000" 
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
                  name="annualSalary" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Annual Salary
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 75000" 
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
                  name="monthlyContributionPercent" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Your Contribution (%)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 6" 
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
                        <Target className="h-4 w-4" />
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
                <FormField 
                  control={form.control} 
                  name="employerMatchPercent" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Employer Match (%)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 50" 
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
                  name="employerMatchLimit" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Employer Match Limit (%)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 6" 
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
              <Button type="submit" className="w-full md:w-auto">
                Calculate 401(k) Projection
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
                  <CardTitle>Your 401(k) Retirement Projection</CardTitle>
                  <CardDescription>
                    {result.yearsToRetirement} years to retirement • ${result.monthlyContribution.toLocaleString()}/month contribution
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Retirement Balance</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    ${result.totalBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Total at age {form.getValues('retirementAge')}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Your Contributions</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ${result.totalContributions.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.contributionPercentage.toFixed(1)}% of salary
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Employer Match</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    ${result.totalEmployerMatch.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.matchPercentage.toFixed(1)}% of salary
                  </p>
                </div>
                    </div>

              {/* Key Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Interest Earned
                  </h4>
                  <p className="text-2xl font-bold text-primary">
                    ${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Compound growth over {result.yearsToRetirement} years
                  </p>
                    </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Contribution Status
                  </h4>
                  <p className="text-2xl font-bold text-primary">
                    {result.isMaxingOut ? 'Maxing Out' : 'Not Maxing Out'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.isMaxingOut ? 'At 2025 limit ($23,500)' : 'Below annual limit'}
                  </p>
                </div>
              </div>

              {/* Growth Chart */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">401(k) Growth Over Time</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.chartData} stackOffset="expand" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
                          name === "yourContributions" ? "Your Contributions" : 
                          name === "employerContributions" ? "Employer Match" : "Interest Earned"
                        ]}
                        labelFormatter={(age) => `Age ${age}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="yourContributions" 
                        stackId="1" 
                        name="Your Contributions" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="employerContributions" 
                        stackId="1" 
                        name="Employer Match" 
                        stroke="hsl(var(--chart-2))" 
                        fill="hsl(var(--chart-2))" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="interest" 
                        stackId="1" 
                        name="Interest Earned" 
                        stroke="hsl(var(--chart-3))" 
                        fill="hsl(var(--chart-3))" 
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
                    Current/Retirement Age
                  </h4>
                  <p className="text-muted-foreground">
                    Your current age and the age you plan to retire. This determines your investment timeline and the power of compound growth.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Current 401(k) Balance
                  </h4>
                  <p className="text-muted-foreground">
                    The amount of money you have already saved in your 401(k). This existing balance will continue to grow through compound interest.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Annual Salary
                  </h4>
                  <p className="text-muted-foreground">
                    Your gross annual income, used to calculate contribution amounts and employer match limits.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Your Contribution (%)
                  </h4>
                  <p className="text-muted-foreground">
                    The percentage of your pre-tax salary you contribute to your 401(k) each paycheck. Most experts recommend 10-15% of your income.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Expected Annual Return (%)
                  </h4>
                  <p className="text-muted-foreground">
                    The average yearly growth rate you expect from your 401(k) investments. Historical stock market returns average 7-10% annually.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Employer Match (%)
                  </h4>
                  <p className="text-muted-foreground">
                    The percentage of your contribution that your employer matches. For example, a 50% match means they contribute $0.50 for every $1.00 you contribute.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Employer Match Limit (%)
                  </h4>
                  <p className="text-muted-foreground">
                    The maximum percentage of your salary up to which your employer will match contributions. This is often 3-6% of your salary.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Landmark className="h-4 w-4" />
                    Free Money
                  </h4>
                  <p className="text-muted-foreground">
                    Never leave employer match money on the table! This is essentially free money that doubles your contribution up to the match limit.
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
                  <a href="/category/finance/compound-interest-calculator" className="text-primary hover:underline">
                    Compound Interest Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate compound interest growth over time
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
              Complete Guide to 401(k) Contributions
            </CardTitle>
            <CardDescription>
              A comprehensive guide to maximizing your 401(k) benefits
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
              Common questions about 401(k) contributions and retirement planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What is a 401(k)?</h4>
                <p className="text-muted-foreground">
                  A 401(k) is a retirement savings plan sponsored by an employer. It lets workers save and invest a piece of their paycheck before taxes are taken out. Taxes aren't paid until the money is withdrawn from the account.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">How much should I contribute to my 401(k)?</h4>
                <p className="text-muted-foreground">
                  At minimum, contribute enough to get your full employer match (this is free money!). Ideally, aim for 10-15% of your income. If possible, max out your 401(k) contributions up to the annual limit ($23,500 in 2025).
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What's the difference between Traditional and Roth 401(k)?</h4>
                <p className="text-muted-foreground">
                  Traditional 401(k) contributions are pre-tax (reduce your taxable income now, but withdrawals are taxed in retirement). Roth 401(k) contributions are after-tax (no immediate tax break, but withdrawals are tax-free in retirement).
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">What are the 2025 contribution limits?</h4>
                <p className="text-muted-foreground">
                  For 2025, you can contribute up to $23,500 to your 401(k). If you're 50 or older, you can make an additional catch-up contribution of $8,000, bringing your total to $31,500.
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Should I prioritize 401(k) or other investments?</h4>
                <p className="text-muted-foreground">
                  Generally, prioritize: 1) Get the full employer match, 2) Pay off high-interest debt, 3) Build an emergency fund, 4) Max out 401(k) and IRA contributions, 5) Consider other investment options.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    