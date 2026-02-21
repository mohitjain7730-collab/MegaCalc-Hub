'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Info, Shield, TrendingUp, Briefcase, Scale, Target, Activity } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';

const pathSchema = z.object({
  name: z.string().min(1, "Path name is required."),
  educationCost: z.number().min(0, "Cost can't be negative."),
  yearsInEducation: z.number().min(0, "Years can't be negative."),
  startingSalary: z.number().positive("Salary must be positive."),
  annualSalaryGrowth: z.number().min(0, "Growth rate can't be negative."),
});

const formSchema = z.object({
  pathA: pathSchema,
  pathB: pathSchema,
  workingYears: z.number().positive("Working years must be positive."),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  breakEvenYear: number | null;
  totalEarningsA: number;
  totalEarningsB: number;
  netWorthA: number;
  netWorthB: number;
  chartData: { age: number; 'Path A Net Worth': number; 'Path B Net Worth': number; }[];
  recommendations: string[];
  plan: { label: string; detail: string }[];
}

const formatNumberUS = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export default function CareerROICalculator() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pathA: { name: '', educationCost: undefined, yearsInEducation: undefined, startingSalary: undefined, annualSalaryGrowth: undefined },
      pathB: { name: '', educationCost: undefined, yearsInEducation: undefined, startingSalary: undefined, annualSalaryGrowth: undefined },
      workingYears: 40,
    },
  });

  const resetForm = () => {
    form.reset({
      pathA: { name: '', educationCost: undefined, yearsInEducation: undefined, startingSalary: undefined, annualSalaryGrowth: undefined },
      pathB: { name: '', educationCost: undefined, yearsInEducation: undefined, startingSalary: undefined, annualSalaryGrowth: undefined },
      workingYears: 40,
    });
    setResult(null);
  };

  useEffect(() => {
    resetForm();
  }, []);

  const onSubmit = (values: FormValues) => {
    const { pathA, pathB, workingYears } = values;
    const chartData = [];

    let netWorthA = -pathA.educationCost;
    let netWorthB = -pathB.educationCost;
    let currentSalaryA = pathA.startingSalary;
    let currentSalaryB = pathB.startingSalary;
    let breakEvenYear: number | null = null;

    const startAge = 18;

    for (let year = 1; year <= pathA.yearsInEducation + workingYears || year <= pathB.yearsInEducation + workingYears; year++) {
      // Path A earnings
      if (year > pathA.yearsInEducation && year <= pathA.yearsInEducation + workingYears) {
        netWorthA += currentSalaryA;
        currentSalaryA *= (1 + pathA.annualSalaryGrowth / 100);
      }

      // Path B earnings
      if (year > pathB.yearsInEducation && year <= pathB.yearsInEducation + workingYears) {
        netWorthB += currentSalaryB;
        currentSalaryB *= (1 + pathB.annualSalaryGrowth / 100);
      }

      chartData.push({ age: startAge + year, 'Path A Net Worth': netWorthA, 'Path B Net Worth': netWorthB });

      if (breakEvenYear === null && netWorthA < 0 && netWorthB > 0 && netWorthB >= netWorthA) {
        if (netWorthB > netWorthA) breakEvenYear = startAge + year;
      }
      if (breakEvenYear === null && netWorthB < 0 && netWorthA > 0 && netWorthA >= netWorthB) {
        if (netWorthA > netWorthB) breakEvenYear = startAge + year;
      }
    }

    const finalNetWorthA = chartData[chartData.length - 1]['Path A Net Worth'];
    const finalNetWorthB = chartData[chartData.length - 1]['Path B Net Worth'];

    // Generate Recommendations
    const recommendations = [];
    const winner = finalNetWorthA > finalNetWorthB ? pathA.name : pathB.name;
    const loser = finalNetWorthA > finalNetWorthB ? pathB.name : pathA.name;
    const diff = Math.abs(finalNetWorthA - finalNetWorthB);

    recommendations.push(`Consider **${winner}** as it leads to a higher lifetime specific net worth by **${formatNumberUS(diff)}**.`);
    if (breakEvenYear) {
      recommendations.push(`Be prepared for a "break-even" period until age **${breakEvenYear}**. Before this age, the other path might seem financially superior.`);
    } else {
      recommendations.push(`Note that **${winner}** is financially superior starting from the very beginning of your career calculation.`);
    }

    if (pathA.educationCost > 50000 || pathB.educationCost > 50000) {
      recommendations.push("Since education costs are high, explore scholarships, grants, or employer-sponsored tuition assistance to improve ROI.");
    }

    // Generate Action Plan
    const plan = [
      { label: 'Immediate Action', detail: 'Research specific scholarship opportunities and compare total cost of attendance for both paths.' },
      { label: 'Short Term', detail: 'Network with professionals in both fields to validate salary expectations and job satisfaction.' },
      { label: 'Long Term', detail: 'Focus on skill acquisition and salary negotiation early in your career to maximize the compounding effect of your income.' }
    ];

    setResult({
      breakEvenYear,
      totalEarningsA: finalNetWorthA,
      totalEarningsB: finalNetWorthB,
      netWorthA: finalNetWorthA,
      netWorthB: finalNetWorthB,
      chartData,
      recommendations,
      plan
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Career ROI Calculator
          </CardTitle>
          <CardDescription>
            Compare the lifetime earnings potential and return on investment between two different career or education paths.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Path A */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <FormField control={form.control} name="pathA.name" render={({ field }) => (<FormItem><FormLabel>Path A Name</FormLabel><FormControl><Input placeholder="e.g., Bachelor's Degree" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pathA.educationCost" render={({ field }) => (<FormItem><FormLabel>Upfront Education Cost ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 80000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pathA.yearsInEducation" render={({ field }) => (<FormItem><FormLabel>Years in Education</FormLabel><FormControl><Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pathA.startingSalary" render={({ field }) => (<FormItem><FormLabel>Starting Annual Salary ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 60000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pathA.annualSalaryGrowth" render={({ field }) => (<FormItem><FormLabel>Annual Salary Growth (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                {/* Path B */}
                <div className="space-y-4 border p-4 rounded-lg">
                  <FormField control={form.control} name="pathB.name" render={({ field }) => (<FormItem><FormLabel>Path B Name</FormLabel><FormControl><Input placeholder="e.g., Trade School" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pathB.educationCost" render={({ field }) => (<FormItem><FormLabel>Upfront Education Cost ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 20000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pathB.yearsInEducation" render={({ field }) => (<FormItem><FormLabel>Years in Education</FormLabel><FormControl><Input type="number" placeholder="e.g., 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pathB.startingSalary" render={({ field }) => (<FormItem><FormLabel>Starting Annual Salary ($)</FormLabel><FormControl><Input type="number" placeholder="e.g., 45000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="pathB.annualSalaryGrowth" render={({ field }) => (<FormItem><FormLabel>Annual Salary Growth (%)</FormLabel><FormControl><Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              </div>
              <FormField control={form.control} name="workingYears" render={({ field }) => (<FormItem><FormLabel>Total Working Years</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} /></FormControl><FormMessage /></FormItem>)} />
              <div className="flex gap-4">
                <Button type="submit">Compare Paths</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Career Path Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <p className="text-sm text-muted-foreground">Break-even Point</p>
                {result.breakEvenYear ? (
                  <>
                    <p className="text-5xl font-bold text-primary">Age {result.breakEvenYear}</p>
                    <p className="text-muted-foreground mt-2">The age at which the higher-earning path overtakes the other in cumulative net worth.</p>
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-bold text-orange-500">No Break-even Found</p>
                    <p className="text-muted-foreground mt-2">One path remains more financially advantageous than the other throughout the entire career span.</p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
                <Card>
                  <CardHeader><CardTitle>{form.getValues('pathA.name')}</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Total Lifetime Earnings:</strong> {formatNumberUS(result.totalEarningsA)}</p>
                    <p><strong>Final Net Worth:</strong> {formatNumberUS(result.netWorthA)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>{form.getValues('pathB.name')}</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <p><strong>Total Lifetime Earnings:</strong> {formatNumberUS(result.totalEarningsB)}</p>
                    <p><strong>Final Net Worth:</strong> {formatNumberUS(result.netWorthB)}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-8 h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={result.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="age" name="Age" />
                    <YAxis name="Cumulative Net Worth" tickFormatter={(value) => formatNumberUS(value)} />
                    <Tooltip formatter={(value: number, name: string) => [formatNumberUS(value), name.replace(' Net Worth', '')]} labelFormatter={(label: number) => `Age: ${label}`} />
                    <Legend />
                    <Line type="monotone" dataKey="Path A Net Worth" name={form.getValues('pathA.name')} stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="Path B Net Worth" name={form.getValues('pathB.name')} stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Action Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.plan.map((step) => (
                    <li key={step.label}>
                      <span className="font-semibold text-foreground">{step.label}:</span> {step.detail}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding Career ROI</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Choosing a career path is one of the biggest financial decisions you'll ever make. The "Return on Investment" (ROI) of your education is a critical factor. This involves weighing the upfront costs and lost income during your school years against the potential for higher lifetime earnings.</p>
            <p>This calculator helps you visualize this trade-off. A path with high education costs might lead to significantly higher income later, but it starts from a financial deficit. The "break-even point" is the age at which the higher-earning path finally catches up and surpasses the cumulative earnings of the path with lower initial costs. This analysis provides a data-driven framework for making more informed decisions about your future.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Formula Explained</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Cumulative Net Worth Calculation</h4>
              <p className="font-mono bg-muted p-4 rounded-md">Annual Net Worth = Previous Net Worth + Current Salary - (if in school) 0</p>
              <p className="mt-2">The calculator simulates your financial journey year by year, starting from age 18. For each path, it does the following:</p>
              <ol className="list-decimal pl-5 mt-2 space-y-1">
                <li>Subtracts the total upfront education cost to establish a starting negative net worth.</li>
                <li>For each year spent in education, it adds no income, representing the opportunity cost of not working.</li>
                <li>Once education is complete, it begins adding the starting salary to the net worth each year.</li>
                <li>Each subsequent year, the salary is increased by the specified annual growth rate before being added to the net worth.</li>
              </ol>
              <p className="mt-2">The chart plots this cumulative net worth over time for both paths, allowing you to see the short-term cost versus the long-term benefit.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5" />Related Calculators</CardTitle>
            <CardDescription>Explore other financial planning tools</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-primary">
              <li><Link href="/finance/compound-interest-calculator" className="hover:underline">Compound Interest Calculator</Link></li>
              <li><Link href="/finance/return-on-investment-calculator" className="hover:underline">Return on Investment (ROI) Calculator</Link></li>
              <li><Link href="/finance/monthly-budget-planner-calculator" className="hover:underline">Monthly Budget Planner</Link></li>
              <li><Link href="/finance/emergency-fund-requirement-calculator" className="hover:underline">Emergency Fund Requirement Calculator</Link></li>
            </ul>
          </CardContent>
        </Card>

        <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Million-Dollar Decision: A Guide to Calculating Career ROI</h1>
          <p className="text-lg italic">The choices you make about education and career can have a seven-figure impact on your lifetime earnings. Understanding how to calculate the Return on Investment (ROI) of your education is not just an academic exercise—it's a critical tool for strategic life planning.</p>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Thinking Like an Investor About Your Career</h2>
          <p>At its core, pursuing higher education or specialized training is an investment. You are investing two primary assets: <strong className="font-semibold">money</strong> (for tuition, fees, and materials) and <strong className="font-semibold">time</strong> (during which you could otherwise be earning income). Like any good investor, you should analyze the potential returns of this investment. The "return" is the increased earning potential you unlock over your entire working life.</p>
          <p>This calculator helps you quantify this by modeling two key concepts:</p>
          <ul className="list-disc ml-6 space-y-3">
            <li><strong className="font-semibold">Upfront Costs & Opportunity Costs:</strong> The most obvious cost is tuition. However, a potentially larger cost is the <strong className="font-semibold text-foreground">opportunity cost</strong> of the income you're not earning while you're in school. If you spend four years getting a degree, you're not just paying for tuition; you're also forgoing four years of potential salary. This calculator models this by keeping earnings at zero during the education period.</li>
            <li><strong className="font-semibold">The Break-Even Point:</strong> A person who enters the workforce directly from high school starts earning immediately. A person who goes to college starts in a significant financial hole (due to tuition costs and lost wages). The break-even point, as shown in the chart, is the moment in time when the higher salary of the college graduate finally allows them to "catch up" and surpass the total accumulated wealth of the person who started working earlier. Understanding how long this takes is crucial.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Key Factors That Influence Career ROI</h2>
          <p>Your career's financial trajectory is not set in stone. The inputs in this calculator represent the major levers you can pull to influence your lifetime earnings.</p>
          <ol className="list-decimal ml-6 space-y-4">
            <li>
              <strong className="font-semibold text-foreground">Choice of Major/Field:</strong> This is arguably the most significant factor. The financial return on a computer science or engineering degree is, on average, vastly different from that of a degree in fine arts or social work. Research the typical starting salaries and mid-career salaries for fields you are interested in. Use reliable data from sources like the Bureau of Labor Statistics (BLS) or university career services reports.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Controlling Education Costs:</strong> The "sticker price" of a university is rarely what students actually pay. The net cost after grants and scholarships is what matters. You can dramatically improve your ROI by:
              <ul className="list-circle pl-6 mt-2 space-y-2">
                <li>Choosing an in-state public university over an expensive private one.</li>
                <li>Starting at a community college for two years and then transferring to a four-year university.</li>
                <li>Aggressively applying for scholarships and grants.</li>
                <li>Working part-time during school to minimize the need for loans.</li>
              </ul>
            </li>
            <li>
              <strong className="font-semibold text-foreground">Starting Salary and Negotiation:</strong> The salary you accept for your very first job sets the baseline for all future raises and job offers. A higher starting salary compounds over your entire career. Researching typical salaries for your role and location and negotiating your initial offer can have an ROI of hundreds of thousands of dollars over your lifetime.
            </li>
            <li>
              <strong className="font-semibold text-foreground">Salary Growth Rate:</strong> This is influenced by your performance, your willingness to change jobs, and your commitment to continuous learning. Staying at one company for too long can often lead to salary stagnation. On average, employees who switch jobs every 2-3 years see a higher salary growth rate than those who stay put. Actively managing your career by seeking promotions and new opportunities is key to maximizing lifetime earnings.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Beyond the Numbers: Non-Financial ROI</h2>
          <p>While this calculator provides a powerful financial analysis, it's crucial to remember that not all returns are monetary. When making a career decision, you must also consider the non-financial ROI, which includes:</p>
          <ul className="list-disc ml-6 space-y-3">
            <li><strong className="font-semibold text-foreground">Job Satisfaction and Fulfillment:</strong> Will the career path align with your passions and interests? A high salary in a job you despise can lead to burnout and unhappiness.</li>
            <li><strong className="font-semibold text-foreground">Work-Life Balance:</strong> Does the career typically involve long hours, high stress, or extensive travel? These can have a significant impact on your quality of life.</li>
            <li><strong className="font-semibold text-foreground">Job Security and Stability:</strong> Is the field growing, or is it at risk of automation or decline? A lower-paying but highly stable career might be preferable to a high-paying but volatile one.</li>
            <li><strong className="font-semibold text-foreground">Networking and Personal Growth:</strong> The relationships and skills you build during your education and career have value that extends far beyond your salary.</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion: Using Data to Build Your Best Life</h2>
          <p>This calculator is not meant to tell you what to do. It is meant to provide you with the data to make a more informed decision. The "best" career path is one that offers a healthy balance of financial reward, personal fulfillment, and lifestyle compatibility.</p>
          <p>By running different scenarios—comparing a trade school certification to a four-year degree, or an in-state public university to an expensive private one—you can see the long-term consequences of your choices. Use this tool to challenge your assumptions, explore different possibilities, and build a strategic plan for a career that not only funds your life but also enriches it.</p>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Frequently Asked Questions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What's a realistic salary growth rate to use?</h4>
              <p className="text-muted-foreground">A rate between 3% and 5% is a reasonable long-term average for many professional careers. Early-career growth might be faster, while late-career growth may slow down. This input represents the average over your entire working life.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Does this calculator account for taxes or investments?</h4>
              <p className="text-muted-foreground">No. This is a simplified model that looks at gross earnings to compare two paths directly. It does not factor in income taxes, cost of living, or the potential investment growth of your savings. The purpose is to compare the earning potential of the paths themselves, not to create a full financial plan.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What if my education takes longer or costs more than expected?</h4>
              <p className="text-muted-foreground">This is a common scenario. You can run the calculation again with updated numbers to see how factors like an extra year of school or taking on more student debt will affect your break-even point and total net worth. This can highlight the importance of finishing your education on time.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">How do I find reliable salary data?</h4>
              <p className="text-muted-foreground">Excellent sources include the U.S. Bureau of Labor Statistics (BLS) Occupational Outlook Handbook, which provides median pay and job outlook data. Websites like Glassdoor, Payscale, and Levels.fyi (for tech careers) can also provide more specific salary ranges based on company, location, and experience level.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">What does it mean if the break-even point is very late in my career?</h4>
              <p className="text-muted-foreground">A very late break-even point (e.g., age 50 or later) suggests that the financial return on the more expensive education path is weak. It might mean the upfront cost is too high, the salary difference is too small, or a combination of both. This should prompt you to carefully re-evaluate if the non-financial benefits of that path are worth the significant financial trade-off.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This calculator provides a powerful financial framework for comparing different career and education choices. By modeling the upfront costs, opportunity costs, and long-term earning potential, it calculates a "break-even" age where a more expensive education path financially overtakes a less expensive one. This tool helps you quantify the return on investment of your education, empowering you to make data-driven decisions that align your career ambitions with your long-term financial well-being.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
