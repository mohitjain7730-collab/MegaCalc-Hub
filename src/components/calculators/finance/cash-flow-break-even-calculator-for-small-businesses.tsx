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
import { DollarSign, TrendingUp, Info, ShoppingCart, RefreshCw, Landmark } from 'lucide-react';
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

        if (contributionMargin <= 0) {
            // Handle loss per unit scenario
            setResult({
                contributionMargin,
                breakEvenUnits: Infinity,
                breakEvenRevenue: Infinity,
                totalFixedOutflow,
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

        setResult({
            contributionMargin,
            breakEvenUnits,
            breakEvenRevenue,
            totalFixedOutflow,
            safetyMarginUnits: currentSalesVolume > 0 ? safetyMarginUnits : undefined,
            safetyMarginRevenue: currentSalesVolume > 0 ? safetyMarginRevenue : undefined,
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

                        {/* Safety Margin Analysis */}
                        {result.safetyMarginRevenue !== undefined && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Safety Margin</CardTitle>
                                    <CardDescription>How close are you to the danger zone?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className={cn("p-6 rounded-lg text-center border-2 mb-4",
                                        result.safetyMarginUnits && result.safetyMarginUnits > 0 ? "border-green-100 bg-green-50 dark:bg-green-950/20 dark:border-green-900" : "border-red-100 bg-red-50 dark:bg-red-950/20 dark:border-red-900"
                                    )}>
                                        {result.safetyMarginUnits && result.safetyMarginUnits > 0 ? (
                                            <>
                                                <p className="text-green-700 dark:text-green-400 font-bold text-lg">Profit Zone</p>
                                                <p className="text-sm text-green-600 dark:text-green-500 mt-1">
                                                    You are selling <strong>{result.safetyMarginUnits} units</strong> above break-even.
                                                </p>
                                            </>
                                        ) : result.safetyMarginUnits ? (
                                            <>
                                                <p className="text-red-700 dark:text-red-400 font-bold text-lg">Loss Zone</p>
                                                <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                                                    You need <strong>{Math.abs(result.safetyMarginUnits)} more units</strong> just to break even.
                                                </p>
                                            </>
                                        ) : null}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Why this matters:</strong> A high safety margin means your business can withstand a drop in sales without losing money.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
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

                    {/* Educational Content */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Guide: Cash Flow vs. Accounting Break-Even
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Most break-even calculators only look at <strong>Expense based</strong> break-even (Revenue = Expenses).
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    However, small businesses often have <strong>Loan Payments</strong> (principal repayment) which are not "expenses" on the P&L but DOES take cash out of the bank.
                                </p>
                                <p className="text-sm font-medium">
                                    This calculator uses the <strong>Cash Flow Break-Even</strong> method:
                                </p>
                                <div className="p-4 bg-muted rounded font-mono text-sm text-center">
                                    Required Sales = (Fixed Expenses + <span className="text-primary font-bold">Debt Payments</span>) / Contribution Margin
                                </div>
                            </CardContent>
                        </Card>

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
                                        <p className="text-sm text-muted-foreground">
                                            It means you are losing money on every single unit you sell (Price &lt; Variable Cost). No amount of volume will fix this; you must either raise prices or lower variable costs immediately.
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold mb-2">What counts as "Fixed Costs"?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Expenses that don't change based on how much you sell: Rent, salaried payroll, insurance, internet, software subscriptions.
                                        </p>
                                    </div>
                                    <div className="p-4 border rounded-lg">
                                        <h4 className="font-semibold mb-2">What counts as "Variable Costs"?</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Expenses that go up when you sell more: Raw materials, shipping fees, packaging, credit card processing fees, sales commissions.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
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
