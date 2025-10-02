
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

    setResult({ 
        totalSavings, 
        totalInvested, 
        totalInterest, 
        chartData, 
        requiredMonthlyContribution: calculationMode === 'target' ? contribution : undefined
    });
  };


  return (
    <div className="space-y-8">
       <Tabs defaultValue="project" onValueChange={(value) => setCalculationMode(value as 'project' | 'target')}>
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="project">Project My Savings</TabsTrigger>
            <TabsTrigger value="target">Calculate for a Target</TabsTrigger>
        </TabsList>
      </Tabs>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(calculateRetirement)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="currentAge" render={({ field }) => ( <FormItem><FormLabel>Current Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="retirementAge" render={({ field }) => ( <FormItem><FormLabel>Retirement Age (years)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="currentSavings" render={({ field }) => ( <FormItem><FormLabel>Current Savings</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="annualReturn" render={({ field }) => ( <FormItem><FormLabel>Expected Annual Return (%)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            
            {calculationMode === 'project' ? (
                <FormField control={form.control} name="monthlyContribution" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Monthly Contribution</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            ) : (
                <FormField control={form.control} name="targetCorpus" render={({ field }) => ( <FormItem className="md:col-span-2"><FormLabel>Target Retirement Corpus</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem> )} />
            )}
          </div>
          <Button type="submit">Calculate</Button>
        </form>
      </Form>
      {result && (
        <Card className="mt-8">
            <CardHeader><div className='flex items-center gap-4'><Landmark className="h-8 w-8 text-primary" /><CardTitle>Retirement Projection</CardTitle></div></CardHeader>
            <CardContent>
                {calculationMode === 'project' ? (
                    <div className="text-center space-y-4">
                        <div>
                            <CardDescription>Estimated Savings at Retirement</CardDescription>
                            <p className="text-3xl font-bold">${result.totalSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div><CardDescription>Total Invested</CardDescription><p className="text-xl font-semibold">${result.totalInvested.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                            <div><CardDescription>Total Interest Earned</CardDescription><p className="text-xl font-semibold">${result.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-2">
                        <CardDescription>Required Monthly Contribution to reach your goal</CardDescription>
                        {result.requiredMonthlyContribution !== undefined && result.requiredMonthlyContribution > 0 ? (
                           <p className="text-3xl font-bold">${result.requiredMonthlyContribution.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                        ) : (
                           <p className="text-lg text-destructive">Your current savings and returns already meet or exceed your goal. No additional monthly contribution is required.</p>
                        )}
                    </div>
                )}
                 <div className="mt-8 h-80">
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
                      <XAxis dataKey="age" unit="yrs" />
                      <YAxis tickFormatter={(value) => `$${(value/1000)}k`} />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Area type="monotone" dataKey="totalInvested" name="Total Invested" stroke="hsl(var(--muted-foreground))" fillOpacity={1} fill="url(#colorInv)" />
                      <Area type="monotone" dataKey="futureValue" name="Projected Value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorFv)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
      )}
       <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is-retirement-planning">
          <AccordionTrigger>What is Retirement Planning?</AccordionTrigger>
          <AccordionContent className="text-muted-foreground space-y-2">
            <p>Retirement planning is the process of setting retirement income goals and the decisions and actions necessary to achieve those goals. It includes identifying sources of income, estimating expenses, implementing a savings program, and managing assets and risk. The power of compounding makes it crucial to start saving early.</p>
          </AccordionContent>
        </AccordionItem>
         <AccordionItem value="understanding-inputs">
            <AccordionTrigger>Understanding the Inputs</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4">
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Current Age & Retirement Age</h4>
                  <p>Your current age and the age you plan to retire. The difference between these two determines your investment horizon.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Current Savings</h4>
                  <p>The total amount you have already saved for retirement.</p>
              </div>
              <div>
                  <h4 className="font-semibold text-foreground mb-1">Monthly Contribution</h4>
                  <p>The amount you plan to save and invest towards retirement each month.</p>
              </div>
               <div>
                  <h4 className="font-semibold text-foreground mb-1">Expected Annual Return (%)</h4>
                  <p>The average annual growth rate you expect from your investments. This varies based on risk (e.g., stocks vs. bonds).</p>
              </div>
               <div>
                  <h4 className="font-semibold text-foreground mb-1">Target Retirement Corpus</h4>
                  <p>The total amount of money you aim to have saved by the time you retire.</p>
              </div>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="how-it-works">
            <AccordionTrigger>How The Calculation Works</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
                <p>This calculator uses standard future value (FV) formulas to project growth. It calculates two main components:</p>
                <ol className="list-decimal list-inside space-y-1">
                    <li><strong>Future Value of Current Savings:</strong> It projects how your existing savings will grow over time, untouched, based on the annual return rate. The formula is `FV = S * (1 + r)^n`.</li>
                    <li><strong>Future Value of Monthly Contributions:</strong> It calculates the future value of an ordinary annuity to determine how your series of monthly contributions will grow.</li>
                </ol>
                <p>The total retirement corpus is the sum of these two values. When calculating for a target, it rearranges the formula to solve for the required monthly contribution.</p>
            </AccordionContent>
        </AccordionItem>
         <AccordionItem value="retirement-guide">
            <AccordionTrigger>Complete guide on retirement savings</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-4 prose prose-sm dark:prose-invert max-w-none">
                <h3>Retire on Your Own Terms: A Comprehensive Guide to Building Your Retirement Savings</h3>
                <p>Imagine your ideal retirement. Is it traveling the world, pursuing a long-lost hobby, spending quality time with your family, or simply enjoying a life free from financial stress? Whatever your vision, it has one thing in common: it’s built on a foundation of smart financial planning done years, or even decades, in advance.</p>
                <p>Retirement planning can feel like a monumental task. The numbers seem impossibly large, the future is uncertain, and the easiest option is often to say, "I'll start next year."</p>
                <p>But the secret to a secure retirement isn't a single, heroic effort. It’s a series of small, consistent steps taken over a long period. This guide will break down the complex world of retirement savings into a clear, actionable roadmap. We’ll explore the core principles, strategies, and common pitfalls to help you move from anxiety to action.</p>
                
                <h4>Why Starting Early is Your Greatest Superpower: The Magic of Compounding</h4>
                <p>If you take only one thing away from this article, let it be this: the single most important factor in your retirement savings success is not how much you earn, but how early you start.</p>
                <p>The reason for this is a powerful force called compounding.</p>
                <p>Compounding is the process where your investment returns begin to generate their own returns. It's like a snowball rolling downhill—it starts small, but as it rolls, it picks up more snow, growing bigger and faster. In finance, your initial investment is the snowball, and the returns are the extra snow it gathers.</p>
                <p>Let’s illustrate this with the tale of two friends, Priya and Rohan:</p>
                <p><strong>Priya</strong> starts investing at age 25. She puts ₹10,000 per month into an investment that yields an average of 12% annually. She invests consistently for 35 years until she retires at 60.</p>
                <p><strong>Rohan</strong> delays and starts at age 35. To catch up, he invests double the amount, ₹20,000 per month, into the same investment for 25 years until he retires at 60.</p>
                <p>Who do you think has more money at retirement?</p>
                <p>Priya's Total Investment: ₹42 Lakhs (₹10,000 x 12 x 35)</p>
                <p>Rohan's Total Investment: ₹60 Lakhs (₹20,000 x 12 x 25)</p>
                <p>Despite Rohan investing ₹18 Lakhs more of his own money, the results are staggering:</p>
                <p><strong>Priya's Retirement Corpus: Approximately ₹5.28 Crores</strong></p>
                <p><strong>Rohan's Retirement Corpus: Approximately ₹3.79 Crores</strong></p>
                <p>Priya’s head start of 10 years allowed her money to work for her for a longer period, resulting in a corpus that is nearly ₹1.5 Crores larger. That is the undeniable magic of compounding.</p>
                
                <h4>The Big Question: How Much Do You Actually Need to Retire?</h4>
                <p>This is the central question of all retirement planning. While the exact number is unique to each individual, we can use a popular rule of thumb to get a solid estimate: The 4% Rule.</p>
                <p>The 4% Rule suggests that you can safely withdraw 4% of your total retirement corpus in your first year of retirement, and then adjust that amount for inflation each subsequent year, without running out of money for about 30 years.</p>
                <p>To use this rule to find your target corpus, you can simply reverse it:</p>
                <p className="font-mono p-2 bg-muted rounded-md text-center">Your Target Retirement Corpus = Your Estimated Annual Expenses in Retirement × 25</p>
                <p>For example, if you estimate you'll need ₹1 Lakh per month (or ₹12 Lakhs per year) to live comfortably in retirement, your target corpus would be:</p>
                <p>₹12,00,000 × 25 = ₹3 Crores</p>
                <p>This formula is a fantastic starting point, but remember to consider these critical factors:</p>
                <ul className="list-disc list-inside">
                  <li><strong>Inflation:</strong> The ₹1 Lakh per month you need today will be much higher in 20 or 30 years. Inflation silently erodes the value of your money.</li>
                  <li><strong>Lifestyle:</strong> Your desired retirement lifestyle heavily influences your annual expenses.</li>
                  <li><strong>Healthcare:</strong> Medical costs tend to rise significantly in later years and must be factored in.</li>
                  <li><strong>Life Expectancy:</strong> With advancements in medicine, people are living longer than ever. Your savings need to last.</li>
                </ul>

                <h4>The Building Blocks: Where Should You Invest for Retirement?</h4>
                <p>A successful retirement portfolio isn't built on a single investment. It requires a diversified approach that balances safety and growth. Here are the key investment avenues for Indian investors:</p>
                <h5>1. The Foundational Pillars (Government-Backed Schemes)</h5>
                <ul className="list-disc list-inside">
                  <li><strong>Employees' Provident Fund (EPF):</strong> For salaried individuals, this is the automatic starting point. A portion of your salary is contributed by both you and your employer, creating a solid, tax-efficient base for your retirement.</li>
                  <li><strong>National Pension System (NPS):</strong> A low-cost, voluntary pension scheme regulated by the government. It offers a mix of equity and debt, allowing you to choose your risk exposure. It also provides attractive tax benefits over and above Section 80C.</li>
                  <li><strong>Public Provident Fund (PPF):</strong> A long-term savings scheme offering a guaranteed, tax-free return. It's an excellent tool for risk-averse investors looking for stability in their portfolio.</li>
                </ul>
                <h5>2. The Growth Engines (Market-Linked Investments)</h5>
                <ul className="list-disc list-inside">
                  <li><strong>Equity Mutual Funds (via SIP):</strong> To beat inflation over the long term, you need the growth potential of equities. Investing in a diversified portfolio of equity mutual funds through a Systematic Investment Plan (SIP) is the most effective way for most people to build significant wealth.</li>
                  <li><strong>Debt Mutual Funds:</strong> As you get closer to retirement, you'll want to reduce risk. Debt funds invest in fixed-income securities like bonds and offer more stability than equities, helping to preserve your accumulated capital.</li>
                </ul>
                <p>A balanced strategy involves using both foundational pillars for stability and growth engines to create wealth that outpaces inflation.</p>

                <h4>Common Retirement Planning Mistakes to Avoid at All Costs</h4>
                <p>Building wealth is as much about avoiding mistakes as it is about making the right moves. Here are some common pitfalls:</p>
                <ul className="list-disc list-inside">
                  <li><strong>Procrastination (The "I'll Start Tomorrow" Syndrome):</strong> As our example showed, delay is the single biggest enemy of wealth creation.</li>
                  <li><strong>Underestimating Inflation:</strong> A corpus that seems huge today might be inadequate 25 years from now. Always factor in an inflation rate of 5-6% in your planning.</li>
                  <li><strong>Being Too Conservative:</strong> While safety is important, avoiding equities entirely means your savings might not even keep up with inflation. A calculated exposure to growth assets is necessary.</li>
                  <li><strong>Dipping Into Your Retirement Fund:</strong> Your retirement fund is sacrosanct. Withdrawing from it for a home renovation, a car, or a wedding is a critical error that can permanently damage your long-term financial security.</li>
                  <li><strong>Not Having a Concrete Plan:</strong> Simply saving money without a target or a strategy is like sailing without a map. You need to know your destination (target corpus) and your route (investment strategy).</li>
                </ul>

                <h4>Creating Your Action Plan: From Theory to Reality</h4>
                <p>So, how do you put all this together? It starts with a clear, personalized plan.</p>
                <ol className="list-decimal list-inside">
                  <li><strong>Step 1: Define Your Retirement Vision.</strong> Get specific. What age do you want to retire? What will an average day look like? This emotional connection to your goal is a powerful motivator.</li>
                  <li><strong>Step 2: Estimate Your Future Expenses.</strong> Take your current monthly expenses and project them into the future, accounting for inflation and lifestyle changes.</li>
                  <li><strong>Step 3: Assess Your Current Savings.</strong> Tally up your existing investments in EPF, PPF, mutual funds, etc. This is your starting point.</li>
                  <li><strong>Step 4: Calculate the Gap and the Required Monthly Savings.</strong> This is the most crucial step. You need to determine the gap between where you are and where you need to be, and then calculate the exact amount you need to save and invest every month to bridge that gap.</li>
                </ol>
                <p>Figuring this out precisely—factoring in inflation, your existing savings, expected returns on different investments, and your target corpus—can be incredibly complex. A simple back-of-the-envelope calculation often misses critical variables.</p>
                <p>This is where a robust tool can bring immense clarity. A good retirement savings calculator can help you model different scenarios, visualize your financial future, and determine the exact monthly investment needed to reach your goals. It transforms an abstract goal into a tangible monthly target.</p>

                <h4>Conclusion: Your Future Self is Counting on You</h4>
                <p>Retirement isn't an age; it's a financial number. It's the point where your assets generate enough income to cover your expenses, allowing you to work because you want to, not because you have to.</p>
                <p>The journey to that number begins today. It begins with the decision to prioritize your future self. By starting early, investing wisely in a diversified portfolio, and staying disciplined, you can turn your dream of a comfortable, stress-free retirement into a reality. Don't leave it to chance. Create a plan, stick to it, and build the future you deserve.</p>
                <p className="text-xs">Disclaimer: All investment-related information in this article is for educational purposes only and should not be considered financial advice. Mutual funds and other market-linked investments are subject to market risks. Please consult a certified financial advisor to create a personalized retirement plan.</p>
            </AccordionContent>
        </AccordionItem>
        <AccordionItem value="further-reading">
            <AccordionTrigger>Further Reading & Official Sources</AccordionTrigger>
            <AccordionContent className="text-muted-foreground space-y-2">
              <p>For more comprehensive information on retirement planning, consult these authoritative sources. The formulas used in this calculator are based on principles widely accepted in finance.</p>
               <ul className="list-disc list-inside space-y-1 pl-4">
                  <li><a href="https://www.investopedia.com/articles/retirement/04/090204.asp" target="_blank" rel="noopener noreferrer" className="text-primary underline">Investopedia: The 4% Rule and Other Retirement Planning Calculators</a></li>
                  <li><a href="https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/introduction-to-retirement-planning" target="_blank" rel="noopener noreferrer" className="text-primary underline">CFA Institute: Introduction to Retirement Planning</a></li>
              </ul>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
