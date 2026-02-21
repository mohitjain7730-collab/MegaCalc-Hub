'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts';
import { DollarSign, TrendingUp, Info, ShoppingCart, RefreshCw, Landmark, Check, ArrowRight, FunctionSquare, Shield, Target, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
    averageUnitPrice: z.number().positive('Unit price must be positive'),
    variableCostPerUnit: z.number().min(0, 'Cannot be negative'),
    fixedOperatingCosts: z.number().min(0, 'Cannot be negative'),
    monthlyDebtPayments: z.number().min(0, 'Cannot be negative').optional().default(0),
    currentSalesVolume: z.number().min(0).optional().default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    contributionMargin: number;
    breakEvenUnits: number;
    breakEvenRevenue: number;
    totalFixedOutflow: number;
    safetyMarginUnits?: number;
    safetyMarginRevenue?: number;
    recommendations: { title: string; description: string; action?: string; level: 'success' | 'warning' | 'critical' }[];
}

export default function CashFlowBreakEvenCalculator() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            averageUnitPrice: undefined,
            variableCostPerUnit: undefined,
            fixedOperatingCosts: undefined,
            monthlyDebtPayments: undefined,
            currentSalesVolume: undefined,
        },
    });

    const onSubmit = (values: FormValues) => {
        const {
            averageUnitPrice,
            variableCostPerUnit,
            fixedOperatingCosts,
            monthlyDebtPayments = 0,
            currentSalesVolume = 0,
        } = values;

        const contributionMargin = averageUnitPrice - variableCostPerUnit;
        const totalFixedOutflow = fixedOperatingCosts + monthlyDebtPayments;

        const recommendations: { title: string; description: string; action?: string; level: 'success' | 'warning' | 'critical' }[] = [];

        if (contributionMargin <= 0) {
            // Handle loss per unit scenario
            recommendations.push({
                title: "Critical: Negative Contribution Margin",
                description: "You are losing money on every unit sold. You cannot break even with volume.",
                action: "Raise prices or cut variable costs immediately.",
                level: 'critical'
            });

            setResult({
                contributionMargin,
                breakEvenUnits: Infinity,
                breakEvenRevenue: Infinity,
                totalFixedOutflow,
                recommendations
            });
            return;
        }

        const breakEvenUnits = Math.ceil(totalFixedOutflow / contributionMargin);
        const breakEvenRevenue = breakEvenUnits * averageUnitPrice;

        let safetyMarginUnits = 0;
        let safetyMarginRevenue = 0;

        if (currentSalesVolume > 0) {
            safetyMarginUnits = currentSalesVolume - breakEvenUnits;
            safetyMarginRevenue = safetyMarginUnits * averageUnitPrice;
        }

        if (currentSalesVolume > breakEvenUnits) {
            recommendations.push({
                title: "Profitable Zone",
                description: `You are above break-even by ${currentSalesVolume - breakEvenUnits} units. Every additional sale adds $${contributionMargin.toFixed(2)} directly to profit.`,
                action: "Focus on scaling volume safely.",
                level: 'success'
            });
        } else if (currentSalesVolume > 0) {
            recommendations.push({
                title: "Loss Zone",
                description: `You are short by ${breakEvenUnits - currentSalesVolume} units to cover your costs.`,
                action: "Review fixed costs or increase sales efforts.",
                level: 'warning'
            });
        }

        if (monthlyDebtPayments > 0 && monthlyDebtPayments > fixedOperatingCosts * 0.5) {
            recommendations.push({
                title: "High Debt Burden",
                description: "Debt payments are a significant portion of your fixed outflows. This increases risk.",
                action: "Consider refinancing for lower monthly payments.",
                level: 'warning'
            });
        }

        setResult({
            contributionMargin,
            breakEvenUnits,
            breakEvenRevenue,
            totalFixedOutflow,
            safetyMarginUnits: currentSalesVolume > 0 ? safetyMarginUnits : undefined,
            safetyMarginRevenue: currentSalesVolume > 0 ? safetyMarginRevenue : undefined,
            recommendations
        });
    };

    const getChartData = () => {
        if (!result || result.breakEvenUnits === Infinity) return null;

        // Generate points: 0, 50% BE, 100% BE, 150% BE, 200% BE
        const step = Math.ceil(result.breakEvenUnits / 2);
        // Ensure we don't have duplicate x values if numbers are small
        const rawPoints = [0, step, result.breakEvenUnits, result.breakEvenUnits + step, result.breakEvenUnits * 2];
        const uniquePoints = Array.from(new Set(rawPoints)).sort((a, b) => a - b);

        return uniquePoints.map(units => ({
            units,
            revenue: units * form.getValues('averageUnitPrice'),
            totalCosts: result.totalFixedOutflow + (units * form.getValues('variableCostPerUnit')),
        }));
    };

    const chartData = getChartData();


    return (
        <div className="space-y-8">
            {/* Input Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalculatorIcon className="h-5 w-5" />
                        Break-Even Inputs
                    </CardTitle>
                    <CardDescription>
                        Enter your unit economics and monthly overheads.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Unit Economics */}
                                <FormField
                                    control={form.control}
                                    name="averageUnitPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" /> Average Price per Unit
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 100"
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
                                    name="variableCostPerUnit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <ShoppingCart className="h-4 w-4" /> Variable Cost per Unit
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 40"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Fixed Costs */}
                                <FormField
                                    control={form.control}
                                    name="fixedOperatingCosts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <BuildingIcon className="h-4 w-4" /> Fixed Operating Costs (Monthly)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 5000"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <p className="text-[0.8rem] text-muted-foreground">Rent, wages, insurance, software.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="monthlyDebtPayments"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1">
                                                <Landmark className="h-4 w-4" /> Loan/Debt Repayments (Monthly)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 1500"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <p className="text-[0.8rem] text-muted-foreground">Principal + Interest payments.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Optional: Current Sales */}
                                <FormField
                                    control={form.control}
                                    name="currentSalesVolume"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-1 text-muted-foreground">
                                                <RefreshCw className="h-4 w-4" /> Current Monthly Unit Sales (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g. 120"
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
                                <TrendingUp className="w-4 h-4 mr-2" />
                                Calculate Break-Even
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Results Section */}
            {result && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Main Numbers */}
                        <Card className="flex flex-col justify-between">
                            <CardHeader>
                                <CardTitle className="text-xl">Break-Even Point</CardTitle>
                                <CardDescription>Sales needed to cover ALL monthly outflows</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-primary">{result.breakEvenUnits.toLocaleString()}</span>
                                        <span className="text-sm font-medium text-muted-foreground">units / month</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        or <strong>${result.breakEvenRevenue.toLocaleString()}</strong> in revenue
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-muted rounded-md text-sm">
                                        <p className="text-muted-foreground">Contribution Margin</p>
                                        <p className={`font-semibold ${result.contributionMargin <= 0 ? 'text-red-500' : 'text-foreground'}`}>
                                            ${result.contributionMargin.toFixed(2)} / unit
                                        </p>
                                    </div>
                                    <div className="p-3 bg-muted rounded-md text-sm">
                                        <p className="text-muted-foreground">Total Cash Outflow</p>
                                        <p className="font-semibold">${result.totalFixedOutflow.toLocaleString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recommendations */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    Smart Actions & Recommendations
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 md:grid-cols-2">
                                {result.recommendations.map((rec, index) => (
                                    <div key={index} className={cn("p-4 rounded-lg space-y-2 border",
                                        rec.level === 'critical' ? "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900" :
                                            rec.level === 'warning' ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900" :
                                                "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900"
                                    )}>
                                        <div className="flex items-start gap-2">
                                            {rec.level === 'success' ? <Check className="h-4 w-4 text-green-600 mt-1 shrink-0" /> : <Info className="h-4 w-4 mt-1 shrink-0" />}
                                            <h4 className="font-semibold">{rec.title}</h4>
                                        </div>
                                        <p className="text-sm text-foreground/80 pl-6 mb-2">{rec.description}</p>
                                        {rec.action && (
                                            <div className="flex items-center gap-2 pl-6 text-sm font-medium">
                                                <ArrowRight className="h-3 w-3" />
                                                {rec.action}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chart */}
                    {chartData && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Profitability Visualizer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={chartData}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="units"
                                                label={{ value: 'Units Sold', position: 'bottom', offset: 10 }}
                                            />
                                            <YAxis
                                                label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }}
                                                tickFormatter={(value) => `$${value / 1000}k`}
                                            />
                                            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                name="Total Revenue"
                                                stroke="#10b981"
                                                activeDot={{ r: 8 }}
                                                strokeWidth={2}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="totalCosts"
                                                name="Total Costs"
                                                stroke="#ef4444"
                                                strokeWidth={2}
                                            />
                                            {/* Break-even Point Dot */}
                                            {result && result.breakEvenUnits !== Infinity && (
                                                <ReferenceDot
                                                    x={result.breakEvenUnits}
                                                    y={result.breakEvenRevenue}
                                                    r={6}
                                                    fill="white"
                                                    stroke="black"
                                                />
                                            )}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    )}




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
                                    Break-Even Units = Total Fixed Outflow / Contribution Margin
                                </p>
                            </div>
                            <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ul className="space-y-1">
                                    <li><span className="font-semibold">Contribution Margin</span> = Price per Unit - Variable Cost per Unit</li>
                                    <li><span className="font-semibold">Total Fixed Outflow</span> = Operating Costs + Debt Payments</li>
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
                                Explore other tools for financial analysis
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <h4 className="font-semibold mb-2">
                                        <a href="/finance/burn-rate-calculator" className="text-primary hover:underline">
                                            Burn Rate Calculator
                                        </a>
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Analyze cash burn and runway
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <h4 className="font-semibold mb-2">
                                        <a href="/finance/contribution-margin-calculator" className="text-primary hover:underline">
                                            Contribution Margin
                                        </a>
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Analyze profitability per unit
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <h4 className="font-semibold mb-2">
                                        <a href="/finance/operating-cycle-calculator" className="text-primary hover:underline">
                                            Operating Cycle
                                        </a>
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Measure efficiency of cash flow
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <h4 className="font-semibold mb-2">
                                        <a href="/finance/working-capital-calculator" className="text-primary hover:underline">
                                            Working Capital
                                        </a>
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        Evaluate short-term financial health
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Guide Section */}
                    <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                        {/* SEO & SCHEMA METADATA */}
                        <meta itemProp="name" content="The Complete Guide to Cash Flow Break-Even Analysis" />
                        <meta itemProp="description" content="Master break-even analysis for small businesses. Learn the difference between accounting and cash-flow break-even, how to calculate contribution margin, and strategies to reach profitability faster." />
                        <meta itemProp="author" content="MegaCalc Financial Team" />

                        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Cash Flow Break-Even Analysis</h1>
                        <p className="text-lg italic text-muted-foreground">Profit isn't just about accounting; it's about survival. Learn exactly when your business starts generating real cash.</p>

                        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                        <ul className="list-disc ml-6 space-y-2 text-primary">
                            <li><a href="#what-is-break-even" className="hover:underline">What is the Break-Even Point?</a></li>
                            <li><a href="#cash-flow-vs-accounting" className="hover:underline">Cash Flow vs. Accounting Break-Even: The Critical Difference</a></li>
                            <li><a href="#contribution-margin" className="hover:underline">The Magic of Contribution Margin</a></li>
                            <li><a href="#improving-break-even" className="hover:underline">How to Lower Your Break-Even Point</a></li>
                            <li><a href="#safety-margin" className="hover:underline">Understanding the Margin of Safety</a></li>
                        </ul>

                        <hr className="my-8" />

                        <h2 id="what-is-break-even" className="text-2xl font-bold text-foreground pt-4">What is the Break-Even Point?</h2>
                        <p>
                            The Break-Even Point (BEP) is the precise moment where your total revenue equals your total costs.
                            At this point, you have made a profit of exactly $0. You haven't lost money, but you haven't made any either.
                        </p>
                        <div className="p-4 bg-muted border rounded-lg text-center my-6">
                            <p className="font-mono text-xl text-primary font-bold">
                                Sales below BEP = Loss
                            </p>
                            <p className="font-mono text-xl text-green-600 font-bold mt-2">
                                Sales above BEP = Profit
                            </p>
                        </div>

                        <h2 id="cash-flow-vs-accounting" className="text-2xl font-bold text-foreground pt-8">Cash Flow vs. Accounting Break-Even</h2>
                        <p>
                            Most standard calculators use "Accounting Break-Even," which includes non-cash expenses like depreciation but excludes cash outflows like loan principal payments.
                            For a small business, <strong>Cash is King</strong>.
                        </p>
                        <table className="min-w-full divide-y divide-border border border-border my-4 text-sm">
                            <thead className="bg-muted">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Metric</th>
                                    <th className="px-4 py-2 text-left font-medium">Accounting Break-Even</th>
                                    <th className="px-4 py-2 text-left font-medium">Cash Flow Break-Even (This Tool)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-card divide-y divide-border">
                                <tr>
                                    <td className="px-4 py-2 font-medium">Depreciation</td>
                                    <td className="px-4 py-2 text-red-500">Included (Lowers Profit)</td>
                                    <td className="px-4 py-2 text-green-500">Excluded (No Cash Out)</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-medium">Loan Principal</td>
                                    <td className="px-4 py-2 text-green-500">Excluded (Balance Sheet Item)</td>
                                    <td className="px-4 py-2 text-red-500">Included (Must be Paid!)</td>
                                </tr>
                            </tbody>
                        </table>
                        <p>
                            If you have a large business loan, your Accounting P&L might show a profit, but you could still run out of cash because you can't cover the loan payments.
                            This calculator solves that by treating Debt Repayment as a "Fixed Cash Outflow."
                        </p>

                        <h2 id="contribution-margin" className="text-2xl font-bold text-foreground pt-8">The Magic of Contribution Margin</h2>
                        <p>
                            Contribution Margin is the amount of money remaining from each sale after deducting variable costs. This acts as the "contribution" towards paying off your fixed costs.
                        </p>
                        <p className="font-mono text-sm bg-muted p-2 rounded mt-2">Contribution Margin = Unit Price - Variable Cost per Unit</p>
                        <p className="mt-2">
                            <strong>Why it matters:</strong> If your Contribution Margin is negative, you lose money on every sale. Selling MORE units will just make you go bankrupt faster. You must fix your unit economics first.
                        </p>

                        <h2 id="improving-break-even" className="text-2xl font-bold text-foreground pt-8">How to Lower Your Break-Even Point</h2>
                        <p>
                            A lower break-even point means less risk. You can achieve this by:
                        </p>
                        <ul className="list-disc ml-6 space-y-2 mt-2">
                            <li><strong>Raising Prices:</strong> Increases contribution margin (but may lower volume).</li>
                            <li><strong>Lowering Variable Costs:</strong> Negotiate with suppliers or improve efficiency to increase margin per unit.</li>
                            <li><strong>Lowering Fixed Costs:</strong> Reduce rent, salaries, or subscription bloat. This directly reduces the hurdle you need to jump every month.</li>
                        </ul>

                        <h2 id="safety-margin" className="text-2xl font-bold text-foreground pt-8">Understanding the Margin of Safety</h2>
                        <p>
                            The Margin of Safety tells you how much sales can drop before you start losing money.
                        </p>
                        <p className="mt-2">
                            <em>Formula: (Current Sales - Break Even Sales) / Current Sales</em>
                        </p>
                        <p className="mt-2">
                            A high margin of safety (e.g., &gt;20%) gives you a buffer against market downturns or seasonal slumps. A low margin (&lt;5%) means you are living on the edge.
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
                                    <h4 className="font-semibold mb-2">My Contribution Margin is negative. What does that mean?</h4>
                                    <p className="text-muted-foreground">
                                        It means you are losing money on every single unit you sell (Price &lt; Variable Cost). No amount of volume will fix this; you must either raise prices or lower variable costs immediately.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">What counts as "Fixed Costs"?</h4>
                                    <p className="text-muted-foreground">
                                        Expenses that don't change based on how much you sell: Rent, salaried payroll, insurance, internet, software subscriptions.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">What counts as "Variable Costs"?</h4>
                                    <p className="text-muted-foreground">
                                        Expenses that go up when you sell more: Raw materials, shipping fees, packaging, credit card processing fees, sales commissions.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}


        </div>
    );
}

function CalculatorIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" /><line x1="8" x2="16" y1="6" y2="6" /><line x1="16" x2="16" y1="14" y2="18" /><path d="M16 10h.01" /><path d="M12 10h.01" /><path d="M8 10h.01" /><path d="M12 14h.01" /><path d="M8 14h.01" /><path d="M12 18h.01" /><path d="M8 18h.01" /></svg>
    )
}

function BuildingIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="16" height="20" x="4" y="2" rx="2" ry="2" /><path d="M9 22v-4h6v4" /><path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" /><path d="M12 10h.01" /><path d="M12 14h.01" /><path d="M16 10h.01" /><path d="M16 14h.01" /><path d="M8 10h.01" /><path d="M8 14h.01" /></svg>
    )
}
