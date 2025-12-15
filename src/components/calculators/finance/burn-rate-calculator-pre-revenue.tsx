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
import { DollarSign, Activity, AlertTriangle, Info, Calculator, Users, Building, Laptop, Megaphone, Scale } from 'lucide-react';

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

        setResult({
            totalMonthlyBurn,
            runwayMonths,
            zeroCashDate,
            expenseBreakdown,
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

                                    {result.runwayMonths < 6 && (
                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex gap-3 text-sm text-yellow-800 dark:text-yellow-200">
                                            <AlertTriangle className="h-5 w-5 shrink-0" />
                                            <div>
                                                <strong>Critical Warning:</strong> Your runway is less than 6 months.
                                                You should immediately reduce burn or close a funding round.
                                            </div>
                                        </div>
                                    )}
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
                </div>
            )}

            {/* Guide Section */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Understanding Burn Rate
                        </CardTitle>
                        <CardDescription>
                            Detailed explanations for startup finance
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">Gross vs Net Burn</h4>
                                <p className="text-sm text-muted-foreground">
                                    Since you are pre-revenue, your <strong>Gross Burn</strong> (total expenses) is equal to your <strong>Net Burn</strong> (cash lost). Once you have revenue, Net Burn = Gross Burn - Revenue.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Runway Calculation</h4>
                                <p className="text-sm text-muted-foreground">
                                    Runway is widely calculated as <code>Current Cash Balance / Monthly Burn Rate</code>. It tells you exactly how long you can survive without new funding or revenue.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-foreground">Why Tracking Burn Rate is Critical</h2>
                    <p>
                        For early-stage startups, cash is oxygen. "Running out of cash" is the #2 reason startups fail (after "no market need").
                        Understanding your burn rate allows you to:
                    </p>
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>Plan Fundraising:</strong> Know exactly when you need to close your next round (usually 6-9 months before zero cash date).</li>
                        <li><strong>Make Hiring Decisions:</strong> See how adding a $10k/mo developer impacts your survival timeline.</li>
                        <li><strong>Pivot Faster:</strong> If an experiment isn't working, cutting costs early buys you time to try something else.</li>
                    </ul>
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
                                <p className="text-sm text-muted-foreground">
                                    There is no single number, but a "good" burn rate is one that gives you 18-24 months of runway after a funding round. If you are burning $50k/mo, you should ideally have raised ~$1M.
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">Should I include one-time expenses?</h4>
                                <p className="text-sm text-muted-foreground">
                                    Ideally, no. Burn rate is meant to track <em>recurring</em> monthly operational costs. If you buy a $2,000 laptop once, it shouldn't permanently inflate your monthly burn calculation. Use a "Misc" buffer for small irregularities.
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">How can I reduce my burn rate?</h4>
                                <p className="text-sm text-muted-foreground">
                                    The biggest lever is usually headcount (salaries). Other ways include switching to annual SaaS plans (if cash allows), negotiating rent, or cutting non-essential marketing spend.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
