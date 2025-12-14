'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Calendar, Target, Info, Activity, Shield, Trash2, PlusCircle, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

const formSchema = z.object({
    currentCash: z.number().positive('Current cash must be positive'),
    monthlyNonSalaryBurn: z.number().min(0, 'Burn rate cannot be negative'),
    monthlyRevenue: z.number().min(0).optional().default(0),
    hiringPlan: z.array(z.object({
        role: z.string().min(1, 'Role name is required'),
        annualSalary: z.number().positive('Salary must be positive'),
        startMonth: z.number().min(1, 'Start month must be 1 or greater').max(60, 'Start month must be within 5 years'),
        count: z.number().min(1).default(1)
    })).optional().default([]),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    runwayMonths: number;
    runwayDate: string;
    finalRunwayStatus: 'Critical' | 'Short' | 'Healthy' | 'Extensive';
    chartData: { month: number; cashBalance: number; monthlyBurn: number; monthlyRevenue: number; employeeCount: number }[];
    totalHires: number;
    peakBurn: number;
    monthsUntilZero: number | 'Infinite';
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
    value.toLocaleString('en-US', options);

export default function StartupRunwayHiringCalculator() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentCash: undefined,
            monthlyNonSalaryBurn: undefined,
            monthlyRevenue: 0,
            hiringPlan: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "hiringPlan",
    });

    const onSubmit = (values: FormValues) => {
        const { currentCash, monthlyNonSalaryBurn, monthlyRevenue, hiringPlan } = values;

        // Simulation parameters
        const maxMonths = 60; // Simulate up to 5 years
        let currentBalance = currentCash;
        let monthsSurvived = 0;
        const chartData = [];

        // Sort hiring plan by start month
        const sortedHires = [...(hiringPlan || [])].sort((a, b) => a.startMonth - b.startMonth);

        for (let month = 1; month <= maxMonths; month++) {
            // Calculate active hires for this month
            // A hire starts in their startMonth.
            const activeHires = sortedHires.filter(h => h.startMonth <= month);

            const salaryBurn = activeHires.reduce((sum, hire) => sum + (hire.annualSalary * hire.count / 12), 0);
            const totalBurn = monthlyNonSalaryBurn + salaryBurn;
            const netBurn = totalBurn - (monthlyRevenue || 0);

            // Simple model: Revenue is constant. 
            // In a real startup, revenue grows, but let's keep it simple or maybe add growth later. 
            // For this calculators "exact structure" matching, we just follow simulation.

            currentBalance -= netBurn;

            chartData.push({
                month,
                cashBalance: Math.round(Math.max(0, currentBalance)),
                monthlyBurn: Math.round(totalBurn),
                monthlyRevenue: monthlyRevenue || 0,
                employeeCount: activeHires.reduce((sum, h) => sum + h.count, 0)
            });

            if (currentBalance <= 0) {
                monthsSurvived = month - 1 + ((currentBalance + netBurn) / netBurn); // Partial month
                // logic: PreviousBalance / NetBurn
                // currentBalance is negative here. PreviousBalance was currentBalance + netBurn.
                monthsSurvived = (month - 1) + ((currentBalance + netBurn) / netBurn);
                break;
            }

            if (month === maxMonths && currentBalance > 0) {
                monthsSurvived = maxMonths; // Or Infinity if profitable
            }
        }

        // If last month balance is increasing compared to previous, and balance > 0, it's infinite.
        // Check net burn at the end
        const finalActiveHires = sortedHires.filter(h => h.startMonth <= maxMonths);
        const finalSalaryBurn = finalActiveHires.reduce((sum, hire) => sum + (hire.annualSalary * hire.count / 12), 0);
        const finalNetBurn = (monthlyNonSalaryBurn + finalSalaryBurn) - (monthlyRevenue || 0);

        let monthsUntilZero: number | 'Infinite' = monthsSurvived;
        if (finalNetBurn <= 0 && currentBalance > 0) {
            monthsUntilZero = 'Infinite';
        }

        // Status
        let status: CalculationResult['finalRunwayStatus'] = 'Healthy';
        if (monthsUntilZero !== 'Infinite') {
            if (monthsUntilZero < 6) status = 'Critical';
            else if (monthsUntilZero < 12) status = 'Short';
            else if (monthsUntilZero < 24) status = 'Healthy';
            else status = 'Extensive';
        }

        // Date
        const today = new Date();
        const runwayDate = monthsUntilZero === 'Infinite'
            ? 'Indefinite'
            : new Date(today.setMonth(today.getMonth() + Math.floor(monthsUntilZero))).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        setResult({
            runwayMonths: typeof monthsUntilZero === 'number' ? monthsUntilZero : 999,
            monthsUntilZero,
            runwayDate,
            finalRunwayStatus: status,
            chartData,
            totalHires: sortedHires.reduce((s, h) => s + h.count, 0),
            peakBurn: Math.max(...chartData.map(d => d.monthlyBurn)),
        });
    };

    const recommendationItems = result
        ? [
            result.monthsUntilZero === 'Infinite'
                ? 'Your business is Default Alive. Focus on efficient growth and maintaining profitability.'
                : result.monthsUntilZero < 6
                    ? 'Urgent: Immediate fundraising or cost-cutting required. Hiring should likely be frozen.'
                    : result.monthsUntilZero < 12
                        ? 'Start fundraising conversations now. 12 months is the minimum safe zone for a round.'
                        : 'You has a healthy runway. Balance aggressive hiring with burn rate monitoring.',

            `Projected peak burn rate reaches $${formatNumberUS(result.peakBurn)}/mo with all hires.`,

            result.totalHires > 5
                ? `Adding ${result.totalHires} roles significantly impacts runway. Verify revenue goals align with this headcount.`
                : 'Conservative hiring plan preserves cash.',

            'Review compensation benchmarks to ensure salary assumptions are realistic.'
        ]
        : undefined; // Don't show recommendations if no result

    const actionPlanItems = result
        ? [
            {
                label: 'Fundraising',
                detail: result.monthsUntilZero !== 'Infinite' && result.monthsUntilZero < 9
                    ? 'Start reaching out to investors immediately. Deal closing takes 3-6 months.'
                    : 'Prepare pitch deck and metrics. Keep relationships warm.',
            },
            {
                label: 'Hiring',
                detail: result.monthsUntilZero !== 'Infinite' && result.monthsUntilZero < 6
                    ? 'FREEZE HIRING. Only critical replacements.'
                    : `Execute hiring plan but validate revenue milestones before signing offers.`,
            },
            {
                label: 'Cash Flow',
                detail: 'Move excess cash to high-yield accounts (Treasury bills/Money market).',
            },
            {
                label: 'Scenario',
                detail: 'Run a "Worst Case" scenario where revenue is 50% of target.',
            },
        ]
        : undefined; // Don't show action plan if no result

    return (
        <div className="space-y-8">

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Runsary & Hiring Parameters
                    </CardTitle>
                    <CardDescription>
                        Map out your startup's survival with planned headcount additions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                    placeholder="e.g., 500000"
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
                                    name="monthlyRevenue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Monthly Revenue (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 20000"
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
                                    name="monthlyNonSalaryBurn"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel className="flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Monthly Non-Salary Expenses (Rent, SaaS, Ads, etc.)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 15000"
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

                            {/* Hiring Plan Section */}
                            <div className="space-y-4 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium flex items-center gap-2">
                                        <Users className="h-5 w-5" /> Hiring Plan
                                    </h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => append({ role: '', annualSalary: 0, startMonth: 1, count: 1 })}
                                    >
                                        <PlusCircle className="h-4 w-4 mr-2" /> Add Role
                                    </Button>
                                </div>

                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-muted/30 p-4 rounded-lg">
                                        <div className="md:col-span-4">
                                            <FormField
                                                control={form.control}
                                                name={`hiringPlan.${index}.role`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Role Title</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. Sales Rep" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-3">
                                            <FormField
                                                control={form.control}
                                                name={`hiringPlan.${index}.annualSalary`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Annual Salary ($)</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                placeholder="100000"
                                                                {...field}
                                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`hiringPlan.${index}.startMonth`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Start Month</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                placeholder="1"
                                                                {...field}
                                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <FormField
                                                control={form.control}
                                                name={`hiringPlan.${index}.count`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Count</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                min="1"
                                                                placeholder="1"
                                                                {...field}
                                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:bg-destructive/10"
                                                onClick={() => remove(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Runway Projection
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
                                    <CardTitle>Runway Projection</CardTitle>
                                    <CardDescription>
                                        Analysis based on current cash and {result.totalHires} planned hires
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 bg-primary/5 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium text-muted-foreground">Runway Duration</span>
                                    </div>
                                    <p className="text-3xl font-bold text-primary">
                                        {result.monthsUntilZero === 'Infinite' ? '∞' : result.monthsUntilZero.toFixed(1)} <span className="text-lg">Months</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Cash lasts until {result.runwayDate}
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-muted/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Activity className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Runway Status</span>
                                    </div>
                                    <p className={`text-2xl font-bold ${result.finalRunwayStatus === 'Critical' ? 'text-red-600' :
                                        result.finalRunwayStatus === 'Short' ? 'text-orange-500' :
                                            'text-green-600'
                                        }`}>
                                        {result.finalRunwayStatus}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Based on 18-month benchmark
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm font-medium text-muted-foreground">Peak Monthly Burn</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ${formatNumberUS(result.peakBurn, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Max burn with all hires active
                                    </p>
                                </div>
                            </div>

                            {/* Growth Chart */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Cash Balance & Burn Rate</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="month"
                                                unit="mo"
                                                tick={{ fontSize: 12 }}
                                                label={{ value: 'Months from Now', position: 'insideBottom', offset: -5 }}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                tickFormatter={(value) => `$${(value / 1000)}k`}
                                                tick={{ fontSize: 12 }}
                                                label={{ value: 'Cash Balance', angle: -90, position: 'insideLeft' }}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                tickFormatter={(value) => `$${(value / 1000)}k`}
                                                tick={{ fontSize: 12 }}
                                                label={{ value: 'Burn Rate', angle: 90, position: 'insideRight' }}
                                            />
                                            <Tooltip
                                                formatter={(value: number, name: string) => [
                                                    `$${formatNumberUS(value)}`,
                                                    name === 'cashBalance' ? 'Cash Balance' :
                                                        name === 'monthlyBurn' ? 'Total Burn' : 'Revenue'
                                                ]}
                                                labelFormatter={(m) => `Month ${m}`}
                                            />
                                            <Legend />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="cashBalance"
                                                name="Cash Balance"
                                                stroke="#10b981"
                                                strokeWidth={3}
                                                dot={false}
                                            />
                                            <Bar
                                                yAxisId="right"
                                                dataKey="monthlyBurn"
                                                name="Monthly Burn"
                                                fill="hsl(var(--destructive))"
                                                opacity={0.3}
                                            />
                                        </ComposedChart>
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
                                        💡 Burn Rate Impact
                                    </h4>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        With {result.totalHires} new hires, your burn rate expands significantly.
                                        Ensure your revenue model scales faster than your headcount expenses.
                                    </p>
                                </div>

                                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                        📈 Fundraising Timing
                                    </h4>
                                    <p className="text-sm text-green-800 dark:text-green-200">
                                        Raising capital takes 3-6 months. Based on your {result.monthsUntilZero !== 'Infinite' ? result.monthsUntilZero.toFixed(1) + ' month' : 'infinite'} runway,
                                        plan your roadshow accordingly.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Educational Content */}
            <div className="space-y-6">

                {/* Recommendations and Action Plan */}
                {/* Recommendations and Action Plan - Only visible when result is generated */}
                {result && (
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
                                    {recommendationItems!.map((rec) => (
                                        <li key={rec}>{rec}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Activity className="h-4 w-4" />
                                    Action plan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-1 text-sm text-muted-foreground">
                                    {actionPlanItems!.map((step) => (
                                        <li key={step.label}>
                                            <span className="font-semibold">{step.label}:</span> {step.detail}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                )}

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
                                        Non-Salary Expenses
                                    </h4>
                                    <p className="text-muted-foreground">
                                        Fixed operational costs like office rent, server costs (AWS), software subscriptions, marketing spend, and legal fees.
                                    </p>
                                </div>

                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Hiring Plan
                                    </h4>
                                    <p className="text-muted-foreground">
                                        Account for the "fully loaded" cost of employees. Usually detailed as salary + 20-30% for benefits/taxes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Formula */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Formula
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>
                            <strong>Runway</strong> = Current Cash / Net Burn Rate
                        </p>
                        <p>
                            <strong>Net Burn Rate</strong> = (Non-Salary Expenses + Hiring Salaries) - Revenue
                        </p>
                        <p>
                            This calculator projects month-by-month cash flow by dynamically adjusting the burn rate as new hires join based on their start month.
                        </p>
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
                            Explore other startup planning tools
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/category/finance/burn-rate-calculator" className="text-primary hover:underline">
                                        Burn Rate Calculator
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Simple monthly burn analysis
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/category/finance/saas-cac-calculator" className="text-primary hover:underline">
                                        SaaS CAC Calculator
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Customer acquisition costs
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/category/finance/option-pool-allocation-calculator" className="text-primary hover:underline">
                                        Option Pool Calculator
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Plan equity distribution
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/category/finance/startup-valuation-post-money-pre-money-calculator" className="text-primary hover:underline">
                                        Startup Valuation
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Estimate company value
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Guide Section */}
                <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                    {/* SEO & SCHEMA METADATA */}
                    <meta itemProp="name" content="The Definitive Guide to Startup Runway and Hiring Planning" />
                    <meta itemProp="description" content="A comprehensive guide to calculating startup runway with complex hiring plans. Learn how to project cash flow, manage burn rate, and time your fundraising." />
                    <meta itemProp="keywords" content="startup runway calculator, hiring plan projection, burn rate analysis, fundraising timing, startup cash flow" />
                    <meta itemProp="author" content="[Your Site's Financial Team]" />
                    <meta itemProp="datePublished" content="2025-10-25" />
                    <meta itemProp="url" content="/startup-runway-hiring-guide" />

                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Startup Runway: Mastering Cash & Headcount</h1>
                    <p className="text-lg italic text-muted-foreground">Align your hiring strategy with your bank account to ensure survival and growth.</p>

                    {/* Table of Contents */}
                    <div className="my-8 p-6 bg-muted/30 rounded-lg border border-border">
                        <h4 className="text-lg font-semibold text-foreground mb-4">Table of Contents</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#section-1" className="hover:text-primary hover:underline transition-colors">1. Why Hiring Plans Make or Break Runways</a></li>
                            <li><a href="#section-2" className="hover:text-primary hover:underline transition-colors">2. The "Fully Loaded" Employee Cost</a></li>
                            <li><a href="#section-3" className="hover:text-primary hover:underline transition-colors">3. Default Alive vs Default Dead</a></li>
                            <li><a href="#section-4" className="hover:text-primary hover:underline transition-colors">4. How to Calculate Runway Correctly</a></li>
                            <li><a href="#section-5" className="hover:text-primary hover:underline transition-colors">5. Fundraising Timing Strategy</a></li>
                            <li><a href="#section-6" className="hover:text-primary hover:underline transition-colors">6. Common Runway Mistakes</a></li>
                        </ul>
                    </div>

                    <h2 id="section-1" className="text-2xl font-bold text-foreground mt-8 mb-4">1. Why Hiring Plans Make or Break Runways</h2>
                    <p>
                        The biggest line item for most startups is payroll. A static "current burn / cash" calculation fails to account for the compounding cost of new hires.
                        A "healthy" 18-month runway can shrink to 9 months if you plan to double your engineering team next quarter. This calculator solves that by letting you model "step function" increases in burn rate.
                    </p>

                    <h2 id="section-2" className="text-2xl font-bold text-foreground mt-8 mb-4">2. The "Fully Loaded" Employee Cost</h2>
                    <h3 className="text-xl font-semibold text-foreground mt-6">Beyond the Salary</h3>
                    <p>
                        When planning, never use just the gross salary. Cost to company (CTC) includes significantly more than what's on the offer letter:
                    </p>
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>Taxes and Benefits:</strong> +15-25% (Health insurance, payroll taxes, 401k matching)</li>
                        <li><strong>Equipment and Software:</strong> +$500-$1000/mo (MacBooks, seats, Slack/Jira licenses)</li>
                        <li><strong>Recruiting Fees:</strong> 15-20% of first-year salary (one-time cost often forgotten)</li>
                        <li><strong>Office Overhead:</strong> Per-headcount rent and utility allocation.</li>
                    </ul>

                    <h2 id="section-3" className="text-2xl font-bold text-foreground mt-8 mb-4">3. Default Alive vs Default Dead</h2>
                    <p>
                        Paul Graham\'s famous concept asks: If expenses remain constant and revenue growth continues at the current rate, do you reach profitability before running out of money?
                        With a hiring plan, expenses <em>do not</em> remain constant. You must verify if the revenue generated by new hires (Sales, Marketing) outpaces their cost. Use the optional "Revenue" field to model this impact.
                    </p>

                    <h2 id="section-4" className="text-2xl font-bold text-foreground mt-8 mb-4">4. How to Calculate Runway Correctly</h2>
                    <p>
                        The formula is simple but the variables are dynamic:
                    </p>
                    <blockquote className="border-l-4 border-primary pl-4 italic my-4">
                        Runway (Months) = Current Cash / Average Monthly Burn Rate
                    </blockquote>
                    <p>
                        However, using "Average" is dangerous if burn is increasing. A better method, used by this tool, is to simulate month-by-month deduction until cash hits zero. This reveals the exact drop-dead date.
                    </p>

                    <h2 id="section-5" className="text-2xl font-bold text-foreground mt-8 mb-4">5. Fundraising Timing Strategy</h2>
                    <p>
                        Investors smell desperation. You should effectively have a signed term sheet before you dip below 6 months of cash.
                        Given that rounds take 3-6 months to close, you need to start the process when you have 9-12 months of runway left.
                    </p>

                    <h2 id="section-6" className="text-2xl font-bold text-foreground mt-8 mb-4">6. Common Runway Mistakes</h2>
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>Optimistic Revenue:</strong> Banking on sales that haven't closed to pay salaries.</li>
                        <li><strong>Ignoring Seasonality:</strong> Some businesses have lumpy revenue but constant burn.</li>
                        <li><strong>Forgeting Severance:</strong> If things go wrong, winding down costs money. You can't run the tank to exactly $0.</li>
                    </ul>

                    <hr className="my-8" />

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Conclusion</h2>
                    <p>
                        Use this calculator to stress-test your hiring roadmap. If your runway dips below 9 months at any point, delay hires or accelerate fundraising.
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
                                <h4 className="font-semibold mb-2">How much runway should I have?</h4>
                                <p className="text-muted-foreground">
                                    Standard advice is 18-24 months after a fresh round of funding. You should start raising your next round with at least 9 months of runway remaining.
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">Should I include equity in compensation costs?</h4>
                                <p className="text-muted-foreground">
                                    Equity grants (ESOPs) do not impact cash runway directly, but they dilute ownership. This calculator focuses purely on cash burn.
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">What is a good burn multiple?</h4>
                                <p className="text-muted-foreground">
                                    Burn Multiple = Net Burn / Net New ARR.
                                    Efficiency targets: &lt;1.0 is Amazing, 1.0-1.5 is Great, 1.5-2.0 is Good, &gt;3.0 is Suspect.
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">What happens if my runway is less than 6 months?</h4>
                                <p className="text-muted-foreground">
                                    This is "Default Dead" territory. You must immediately cut non-essential costs, freeze hiring, and go into emergency fundraising mode or consider M&A options.
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">How do I calculate "Fully Loaded" salary?</h4>
                                <p className="text-muted-foreground">
                                    Multiply the base salary by 1.25 to 1.30. This buffer accounts for employer payroll taxes, health benefits, equipment, and other per-employee overheads.
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">Does this calculator account for revenue growth?</h4>
                                <p className="text-muted-foreground">
                                    You can manually adjust the "Monthly Revenue" field to see different scenarios, but this simplified model assumes constant revenue to be conservative. For precise growth modeling, use a dedicated financial model excel sheet.
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
                        <p>
                            The Startup Runway with Hiring Plan Calculator provides a dynamic view of your company's financial timeline.
                        </p>
                        <p>
                            Unlike static calculators, it integrates your roadmap to show how personnel decisions today impact your survival date tomorrow.
                        </p>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
