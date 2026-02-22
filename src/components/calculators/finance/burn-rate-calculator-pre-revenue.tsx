'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DollarSign, Activity, AlertTriangle, Info, Calculator, Users, Building, Laptop, Megaphone, Scale, Check, ArrowRight, FunctionSquare, Landmark, Shield, Target } from 'lucide-react';


const formSchema = z.object({
    currentCash: z.number().positive('Current cash must be positive').optional(),
    founderSalaries: z.number().min(0, 'Cannot be negative').optional().default(0),
    employeeSalaries: z.number().min(0, 'Cannot be negative').optional().default(0),
    rentAndUtilities: z.number().min(0, 'Cannot be negative').optional().default(0),
    softwareAndTools: z.number().min(0, 'Cannot be negative').optional().default(0),
    marketingAndAds: z.number().min(0, 'Cannot be negative').optional().default(0),
    legalAndAdmin: z.number().min(0, 'Cannot be negative').optional().default(0),
    miscellaneous: z.number().min(0, 'Cannot be negative').optional().default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    totalMonthlyBurn: number;
    runwayMonths: number;
    zeroCashDate: string;
    expenseBreakdown: { name: string; value: number; color: string }[];
    recommendations: { title: string; description: string; action?: string }[];
}


export default function BurnRateCalculatorPreRevenue() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentCash: undefined,
            founderSalaries: undefined,
            employeeSalaries: undefined,
            rentAndUtilities: undefined,
            softwareAndTools: undefined,
            marketingAndAds: undefined,
            legalAndAdmin: undefined,
            miscellaneous: undefined,
        },
    });

    const onSubmit = (values: FormValues) => {
        const {
            currentCash = 0,
            founderSalaries = 0,
            employeeSalaries = 0,
            rentAndUtilities = 0,
            softwareAndTools = 0,
            marketingAndAds = 0,
            legalAndAdmin = 0,
            miscellaneous = 0,
        } = values;

        const totalMonthlyBurn =
            founderSalaries +
            employeeSalaries +
            rentAndUtilities +
            softwareAndTools +
            marketingAndAds +
            legalAndAdmin +
            miscellaneous;

        const runwayMonths = totalMonthlyBurn > 0 ? currentCash / totalMonthlyBurn : 999;

        const today = new Date();
        const zeroCashDate =
            runwayMonths === 999
                ? 'Indefinite'
                : new Date(today.setMonth(today.getMonth() + Math.floor(runwayMonths))).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                });

        // Data for Recharts
        const expenseBreakdown = [
            { name: 'Founders', value: founderSalaries, color: '#10b981' },
            { name: 'Employees', value: employeeSalaries, color: '#3b82f6' },
            { name: 'Rent/Utils', value: rentAndUtilities, color: '#f59e0b' },
            { name: 'Software', value: softwareAndTools, color: '#8b5cf6' },
            { name: 'Marketing', value: marketingAndAds, color: '#ef4444' },
            { name: 'Legal/Admin', value: legalAndAdmin, color: '#ec4899' },
            { name: 'Misc', value: miscellaneous, color: '#64748b' },
        ].filter(item => item.value > 0);

        const recommendations: { title: string; description: string; action?: string }[] = [];

        if (runwayMonths < 6) {
            recommendations.push({
                title: "Critical: Immediate Fundraising Needed",
                description: "You have less than 6 months of cash left. This is the 'Red Zone'. You must either close funding immediately or cut costs drastically.",
                action: "Slash non-essential burn by 30%."
            });
        } else if (runwayMonths < 12) {
            recommendations.push({
                title: "Warning: Start Fundraising Now",
                description: "With 6-12 months of runway, you are in the 'Yellow Zone'. Fundraising usually takes 3-6 months. Don't wait.",
                action: "Prepare your pitch deck this week."
            });
        } else if (runwayMonths < 18) {
            recommendations.push({
                title: "Healthy: Plan for Growth",
                description: "You have 12-18 months. This is a healthy balance, but ensure your burn doesn't creep up without revenue growth.",
                action: "Focus on hitting key milestones."
            });
        } else {
            recommendations.push({
                title: "Excellent Runway",
                description: "You have >18 months of runway. You have the luxury of time to find product-market fit without desperation.",
                action: "Experiment with aggressive growth channels."
            });
        }

        const personnelCost = founderSalaries + employeeSalaries;
        if (personnelCost > 0 && personnelCost > 0.75 * totalMonthlyBurn) {
            recommendations.push({
                title: "High Personnel Concentration",
                description: `Salaries account for ${Math.round((personnelCost / totalMonthlyBurn) * 100)}% of your burn. This makes your burn rate hard to reduce quickly.`,
                action: "Consider using contractors for flexibility."
            });
        }

        setResult({
            totalMonthlyBurn,
            runwayMonths,
            zeroCashDate,
            expenseBreakdown,
            recommendations,
        });
    };


    return (
        <div className="space-y-8">
            {/* Input Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Burn Rate Inputs
                    </CardTitle>
                    <CardDescription>
                        Enter your current cash balance and monthly expenses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="currentCash"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Current Cash Balance
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g. 150000"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                                <FormField
                                    control={form.control}
                                    name="founderSalaries"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 font-normal text-muted-foreground">
                                                <Users className="h-4 w-4" /> Founder Salaries
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="employeeSalaries"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 font-normal text-muted-foreground">
                                                <Users className="h-4 w-4" /> Employee Salaries (Net)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rentAndUtilities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 font-normal text-muted-foreground">
                                                <Building className="h-4 w-4" /> Rent & Office
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="softwareAndTools"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 font-normal text-muted-foreground">
                                                <Laptop className="h-4 w-4" /> Software & Hosting (AWS/SaaS)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="marketingAndAds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 font-normal text-muted-foreground">
                                                <Megaphone className="h-4 w-4" /> Marketing & Ads
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="legalAndAdmin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 font-normal text-muted-foreground">
                                                <Scale className="h-4 w-4" /> Legal & Compliance
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="miscellaneous"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2 font-normal text-muted-foreground">
                                                Expected Misc. Expenses
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Burn & Runway
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
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Burn Rate Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Stats */}
                                <div className="space-y-6">
                                    <div className="p-4 bg-muted/30 rounded-lg text-center border">
                                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Monthly Burn</p>
                                        <p className="text-4xl font-bold text-destructive mt-2">
                                            ${result.totalMonthlyBurn.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">per month</p>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className={`p-4 rounded-lg text-center border flex-1 ${result.runwayMonths < 6 ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900'}`}>
                                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Runway</p>
                                            <p className={`text-2xl font-bold mt-1 ${result.runwayMonths < 6 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                {result.runwayMonths === 999 ? '∞' : result.runwayMonths.toFixed(1)} <span className="text-sm">months</span>
                                            </p>
                                        </div>
                                        <div className="p-4 bg-muted/30 rounded-lg text-center border flex-1">
                                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Zero Cash Date</p>
                                            <p className="text-lg font-bold mt-2">
                                                {result.zeroCashDate}
                                            </p>
                                        </div>
                                    </div>


                                </div>

                                {/* Chart */}
                                <div className="h-64 flex flex-col items-center justify-center">
                                    <p className="text-sm font-medium text-muted-foreground mb-4">Expense Breakdown</p>
                                    <div className="w-full h-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={result.expenseBreakdown}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {result.expenseBreakdown.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value: number) => `$${value.toLocaleString()}`}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    < Card >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Smart Actions & Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            {result.recommendations.map((rec, index) => (
                                <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-2">
                                    <div className="flex items-start gap-2">
                                        <Check className="h-4 w-4 text-green-600 mt-1 shrink-0" />
                                        <h4 className="font-semibold">{rec.title}</h4>
                                    </div>
                                    <p className="text-sm text-muted-foreground pl-6 mb-2">{rec.description}</p>
                                    {rec.action && (
                                        <div className="flex items-center gap-2 pl-6 text-sm text-primary font-medium">
                                            <ArrowRight className="h-3 w-3" />
                                            {rec.action}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card >
                </div >
            )
            }


            {/* Formula Used */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FunctionSquare className="h-5 w-5" />
                        Formula Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-lg text-center">
                            Runway = Cash Balance / Gross Monthly Burn
                        </p>
                    </div>
                    <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul className="space-y-1">
                            <li><span className="font-semibold">Gross Burn</span> = Sum of All Monthly Expenses</li>
                            <li><span className="font-semibold">Zero Cash Date</span> = Current Date + Runway Days</li>
                        </ul>
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
                        Explore other tools for startup financial planning
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/startup-runway-calculator" className="text-primary hover:underline">
                                    Startup Runway (Hiring)
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Advanced runway planning with hiring scenarios
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/saas-cac-calculator" className="text-primary hover:underline">
                                    SaaS CAC Calculator
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Customer Acquisition Cost analysis
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/operating-margin-calculator" className="text-primary hover:underline">
                                    Operating Margin
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Assess your operational efficiency
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/working-capital-calculator" className="text-primary hover:underline">
                                    Working Capital
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Analyze liquidity and short-term health
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="The Ultimate Guide to Startup Burn Rate: Pre-Revenue Survival" />
                <meta itemProp="description" content="A comprehensive guide to understanding burn rate for pre-revenue startups. Learn how to calculate runway, manage cash flow, and extend your startup's lifespan before funding runs out." />
                <meta itemProp="author" content="MegaCalc Financial Team" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Startup Burn Rate: Pre-Revenue Survival</h1>
                <p className="text-lg italic text-muted-foreground">Mastering the art of cash management when your revenue is zero.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#what-is-burn-rate" className="hover:underline">What is Burn Rate and Why is it Critical?</a></li>
                    <li><a href="#gross-vs-net" className="hover:underline">Gross Burn vs. Net Burn: The Difference</a></li>
                    <li><a href="#calculating-runway" className="hover:underline">How to Calculate Runway (And Why It Scares Founders)</a></li>
                    <li><a href="#reducing-burn" className="hover:underline">Strategies to Extend Your Runway</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Burn Rate Benchmarks for Pre-Revenue Startups</a></li>
                </ul>

                <hr className="my-8" />

                <h2 id="what-is-burn-rate" className="text-2xl font-bold text-foreground pt-4">What is Burn Rate and Why is it Critical?</h2>
                <p>
                    <strong>Burn Rate</strong> is the rate at which a company spends (or "burns") its cash pool in a loss-generating scenario.
                    For pre-revenue startups, burn rate is synonymous with total monthly operating expenses. It is the most vital metric for
                    early-stage companies because it dictates your company's lifespan.
                </p>
                <div className="p-4 border-l-4 border-primary bg-muted/30 my-4">
                    <p className="text-sm italic">
                        "Cash is oxygen. Burn rate measures how fast you are consuming that oxygen."
                    </p>
                </div>
                <p>
                    Without revenue, your cash balance is a melting ice cube. Every dollar spent on rent, salaries, server costs, and marketing
                    reduces the time you have to find Product-Market Fit (PMF) or secure the next round of Venture Capital (VC) funding.
                </p>

                <h2 id="gross-vs-net" className="text-2xl font-bold text-foreground pt-8">Gross Burn vs. Net Burn: The Difference</h2>
                <p>
                    It is crucial to distinguish between the two types of burn, although for pre-revenue companies they are often the same.
                </p>
                <h3 className="text-xl font-semibold text-foreground mt-4">Gross Burn</h3>
                <p>
                    Gross Burn is the total amount of money leaving your bank account each month. It includes all expenses: salaries, rent,
                    subscriptions, marketing, etc.
                </p>
                <p className="font-mono text-sm bg-muted p-2 rounded mt-2">Gross Burn = Total Monthly Expenses</p>

                <h3 className="text-xl font-semibold text-foreground mt-4">Net Burn</h3>
                <p>
                    Net Burn is the total cash loss per month. It accounts for any incoming revenue.
                </p>
                <p className="font-mono text-sm bg-muted p-2 rounded mt-2">Net Burn = Gross Burn - Monthly Revenue</p>
                <p className="mt-2">
                    <strong>For Pre-Revenue Startups:</strong> Since Revenue is $0, <strong>Net Burn = Gross Burn</strong>.
                    This calculator focuses on this scenario, giving you a clear picture of your total monthly outflow.
                </p>

                <h2 id="calculating-runway" className="text-2xl font-bold text-foreground pt-8">How to Calculate Runway</h2>
                <p>
                    Your **Runway** is the amount of time (usually in months) you have before you run out of cash completely (zero cash date).
                    It is the most important deadline for any founder.
                </p>
                <div className="p-4 bg-muted border rounded-lg text-center my-6">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Runway (Months) = Current Cash Balance / Net Monthly Burn
                    </p>
                </div>
                <p>
                    For example, if you have <strong>$500,000</strong> in the bank and your monthly burn is <strong>$50,000</strong>:
                </p>
                <p className="mt-2 text-center font-bold">
                    $500,000 / $50,000 = 10 Months of Runway.
                </p>
                <p className="mt-4">
                    This means you have exactly 10 months to either:
                </p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Generate enough revenue to cover costs (become cash flow positive).</li>
                    <li>Raise more capital (which usually takes 3-6 months).</li>
                    <li>Drastically cut costs to extend the valid timeline.</li>
                </ul>

                <h2 id="reducing-burn" className="text-2xl font-bold text-foreground pt-8">Strategies to Extend Your Runway</h2>
                <p>
                    If your runway is less than 12 months and you don't have a clear path to funding, you need to reduce burn.
                    Here are actionable strategies:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="border p-4 rounded-lg">
                        <h4 className="font-bold mb-2">1. Rationalize Headcount</h4>
                        <p className="text-sm">
                            Salaries often make up 70% of a startup's burn. Delay hires, use contractors for non-core roles, or offer higher equity in exchange for lower salary.
                        </p>
                    </div>
                    <div className="border p-4 rounded-lg">
                        <h4 className="font-bold mb-2">2. Cut Software Bloat</h4>
                        <p className="text-sm">
                            Audit your SaaS subscriptions. Cancel unused tools. Apply for startup credits (AWS, Google Cloud, Stripe) which can save thousands.
                        </p>
                    </div>
                    <div className="border p-4 rounded-lg">
                        <h4 className="font-bold mb-2">3. Zero-Budget Marketing</h4>
                        <p className="text-sm">
                            Stop paid ads if you don't have clear positive unit economics. Focus on content marketing, cold outreach, and viral loops.
                        </p>
                    </div>
                    <div className="border p-4 rounded-lg">
                        <h4 className="font-bold mb-2">4. Remote First</h4>
                        <p className="text-sm">
                            Do you really need an office? Remote teams save significantly on rent, utilities, and perks.
                        </p>
                    </div>
                </div>

                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8">Burn Rate Benchmarks</h2>
                <p>
                    While every company is different, VC investors often look for specific burn patterns based on stage:
                </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                    <li><strong>Pre-Seed:</strong> $10k - $30k / month. Founders typically take minimal salary. Focus is on MVP.</li>
                    <li><strong>Seed Stage:</strong> $30k - $80k / month. Small team (3-8 people). Focus is on Product-Market Fit.</li>
                    <li><strong>Series A:</strong> $100k - $300k+ / month. Scaling sales and engineering. Revenue should be growing fast to justify this burn.</li>
                </ul>
                <p className="mt-4">
                    <strong>The Golden Rule:</strong> Never let your runway drop below 6 months. If you do, you lose all leverage in negotiations with investors.
                </p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Frequently Asked Questions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">What is a good burn rate?</h4>
                            <p className="text-muted-foreground">
                                There is no single number, but a "good" burn rate is one that gives you 18-24 months of runway after a funding round. If you are burning $50k/mo, you should ideally have raised ~$1M.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Should I include one-time expenses?</h4>
                            <p className="text-muted-foreground">
                                Ideally, no. Burn rate is meant to track <em>recurring</em> monthly operational costs. If you buy a $2,000 laptop once, it shouldn't permanently inflate your monthly burn calculation. Use a "Misc" buffer for small irregularities.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">How can I reduce my burn rate?</h4>
                            <p className="text-muted-foreground">
                                The biggest lever is usually headcount (salaries). Other ways include switching to annual SaaS plans (if cash allows), negotiating rent, or cutting non-essential marketing spend.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Does burn rate include taxes?</h4>
                            <p className="text-muted-foreground">
                                Yes. Payroll taxes, anticipated corporate taxes, and any licenses should be included. These are cash outflows.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>This calculator helps pre-revenue startups estimate their monthly burn rate and runway.</p>
                    <p>It breaks down expenses by category (Salaries, Rent, Marketing, etc.) and visualizes the data.</p>
                    <p>Monitoring these metrics is essential for financial survival and successful fundraising planning.</p>
                </CardContent>
            </Card>
        </div >
    );
}


