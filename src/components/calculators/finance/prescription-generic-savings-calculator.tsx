'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Calendar, Target, Info, Activity, Shield, Pill, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    brandCost: z.number().positive(),
    genericCost: z.number().positive(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    monthlySavings: number;
    annualSavings: number;
    tenYearSavings: number;
    chartData: { year: number; savings: number; cumulativeSavings: number }[];
    brandCost: number;
    genericCost: number;
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
    value.toLocaleString('en-US', options);

export default function PrescriptionGenericsSavingsCalculator() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            brandCost: undefined,
            genericCost: undefined,
        },
    });

    const onSubmit = (values: FormValues) => {
        const { brandCost, genericCost } = values;

        const monthlySavings = brandCost - genericCost;
        const annualSavings = monthlySavings * 12;
        const tenYearSavings = annualSavings * 10; // Simple projection without checking inflation for now as per plan, but could add compounding if needed. Stick to simple as requested.

        // Create chart data for 10 years
        const chartData = [];
        let cumulative = 0;
        for (let year = 1; year <= 10; year++) {
            cumulative += annualSavings;
            chartData.push({
                year,
                savings: annualSavings,
                cumulativeSavings: cumulative
            });
        }

        setResult({
            monthlySavings,
            annualSavings,
            tenYearSavings: cumulative,
            chartData,
            brandCost,
            genericCost
        });
    };

    const recommendationItems = result
        ? [
            `Switching to generic could save you $${formatNumberUS(result.annualSavings)} annually.`,
            'Check with your doctor or pharmacist if the generic version is suitable for you.',
            'Use the savings to fund other health expenses or invest for the future.',
            'Compare prices at different pharmacies as they can vary significantly.',
        ]
        : [
            'Ask your doctor about generic alternatives.',
            'Compare prices at different pharmacies.',
            'Check for patient assistance programs.',
            'Consider mail-order pharmacies for maintenance medications.',
        ];

    return (
        <div className="space-y-8">

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Pill className="h-5 w-5" />
                        Medication Costs
                    </CardTitle>
                    <CardDescription>
                        Compare the monthly cost of brand-name vs. generic medication
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="brandCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Brand Name Cost (Monthly)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 200"
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
                                    name="genericCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Generic Cost (Monthly)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 20"
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
                                Calculate Savings
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
                                    <CardTitle>Your Savings Projection</CardTitle>
                                    <CardDescription>
                                        Potential savings by switching to generic
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 bg-primary/5 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium text-muted-foreground">Monthly Savings</span>
                                    </div>
                                    <p className="text-3xl font-bold text-primary">
                                        ${formatNumberUS(result.monthlySavings, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Saved every month
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-muted/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Annual Savings</span>
                                    </div>
                                    <p className="text-2xl font-bold">
                                        ${formatNumberUS(result.annualSavings, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Saved per year
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Target className="h-5 w-5 text-green-600" />
                                        <span className="text-sm font-medium text-muted-foreground">10-Year Savings</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">
                                        ${formatNumberUS(result.tenYearSavings, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        potential long-term savings
                                    </p>
                                </div>
                            </div>

                            {/* Growth Chart */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Cumulative Savings Over 10 Years</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="year"
                                                unit="yr"
                                                tick={{ fontSize: 12 }}
                                                label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                                            />
                                            <YAxis
                                                tickFormatter={(value) => `$${(value / 1000)}k`}
                                                tick={{ fontSize: 12 }}
                                                label={{ value: 'Savings ($)', angle: -90, position: 'insideLeft' }}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => [`$${formatNumberUS(value)}`, 'Cumulative Savings']}
                                                labelFormatter={(year) => `Year ${year}`}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="cumulativeSavings"
                                                name="Cumulative Savings"
                                                stroke="hsl(var(--primary))"
                                                strokeWidth={3}
                                                activeDot={{ r: 6 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Recommendations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                {recommendationItems.map((rec, index) => (
                                    <li key={index}>{rec}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Educational Content */}
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
                                        <DollarSign className="h-4 w-4" />
                                        Brand Name Cost
                                    </h4>
                                    <p className="text-muted-foreground">
                                        The monthly out-of-pocket cost for the brand-name medication. This is typically higher due to research and marketing costs incurred by the manufacturer.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4" />
                                        Generic Cost
                                    </h4>
                                    <p className="text-muted-foreground">
                                        The monthly cost for the generic equivalent. Generics have the same active ingredients and effectiveness but are usually much cheaper.
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
                            <strong>Monthly Savings</strong> = Brand Cost - Generic Cost
                        </p>
                        <p>
                            <strong>Annual Savings</strong> = Monthly Savings × 12
                        </p>
                        <p>
                            <strong>10-Year Savings</strong> = Annual Savings × 10
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
                            Explore other financial planning tools
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/category/finance/medical-tourism-savings-estimator" className="text-primary hover:underline">
                                        Medical Tourism Savings
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Estimate savings from medical travel
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">
                                        Monthly Budget Planner
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Plan your monthly finances
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/category/finance/emergency-fund-requirement-calculator" className="text-primary hover:underline">
                                        Emergency Fund Calculator
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Calculate emergency savings needs
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/category/finance/savings-goal-timeline-calculator" className="text-primary hover:underline">
                                        Savings Goal Timeline
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    See when you'll reach your goals
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Guide Section */}
                <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                    {/* SEO & SCHEMA METADATA */}
                    <meta itemProp="name" content="Brand vs. Generic Drugs: A Guide to Prescription Savings" />
                    <meta itemProp="description" content="Learn the differences between brand-name and generic drugs, how to safely switch, and how much you can save on your prescriptions." />
                    <meta itemProp="keywords" content="generic drugs, brand name drugs, prescription savings, medication costs, pharmacy savings, generic vs brand" />
                    <meta itemProp="author" content="MegaCalc Financial Team" />
                    <meta itemProp="datePublished" content="2025-12-09" />
                    <meta itemProp="url" content="/definitive-guide-brand-vs-generic" />

                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Brand vs. Generic Drugs: A Guide to Prescription Savings</h1>
                    <p className="text-lg italic text-muted-foreground">Discover how switching to generic medications can significantly reduce your healthcare costs without compromising on quality or effectiveness.</p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                    <ul className="list-disc ml-6 space-y-2 text-primary">
                        <li><a href="#definition" className="hover:underline">What are Generic Drugs?</a></li>
                        <li><a href="#safety" className="hover:underline">Are Generics Safe and Effective?</a></li>
                        <li><a href="#cost" className="hover:underline">Why are Generics Cheaper?</a></li>
                        <li><a href="#switching" className="hover:underline">How to Switch to Generics</a></li>
                    </ul>
                    <hr />

                    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What are Generic Drugs?</h2>
                    <p>A generic drug is a medication created to be the same as an already marketed brand-name drug in dosage form, safety, strength, route of administration, quality, performance characteristics, and intended use. These similarities help to demonstrate bioequivalence, which means that a generic medicine works in the same way and provides the same clinical benefit as its brand-name version.</p>

                    <h2 id="safety" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Are Generics Safe and Effective?</h2>
                    <p>Yes. The FDA requires that generic drugs be as safe and effective as brand-name drugs. They must measure up to the same rigid standards of quality, strength, and purity. In fact, generic drugs use the same active ingredients as brand-name medicines.</p>

                    <h2 id="cost" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why are Generics Cheaper?</h2>
                    <p>Generic drugs are cheaper because the manufacturers have not had the expenses of developing and marketing a new drug. When a company brings a new drug to market, the firm has already spent substantial money on research, development, marketing, and promotion of the drug. A patent is granted that gives the company that developed the drug an exclusive right to sell the drug as long as the patent is in effect.</p>

                    <h2 id="switching" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Switch to Generics</h2>
                    <p>If you are interested in saving money on your prescriptions, talk to your doctor or pharmacist. They can tell you if there is a generic equivalent for your brand-name medication. In some states, pharmacists are allowed to substitute a generic drug for a brand-name drug unless the doctor specifies "dispense as written."</p>
                </section>

                {/* FAQ Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Frequently Asked Questions
                        </CardTitle>
                        <CardDescription>
                            Common questions about generic medications
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">Do generic drugs take longer to work?</h4>
                                <p className="text-muted-foreground">
                                    No. Generic drugs work in the same way and in the same amount of time as brand-name drugs.
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">Why do generic drugs look different?</h4>
                                <p className="text-muted-foreground">
                                    Trademark laws do not allow a generic drug or medicine to look exactly like other drugs already on the market. Generic medicines and brand-name medicines share the same active ingredient, but other characteristics, such as colors and flavorings, that do not affect the performance, safety, or effectiveness of the generic medicine, may be different.
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">Is a generic drug made in the same factory?</h4>
                                <p className="text-muted-foreground">
                                    Generic firms have facilities that are comparable to those of brand-name firms. In fact, brand-name firms make about 50% of generic drugs.
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
                        <p>This tool estimates potential savings from switching to generic medications by comparing monthly brand-name vs. generic costs.</p>
                        <p>Recommendations, guide content, and FAQs provide context on safety, efficacy, and how to discuss options with healthcare providers.</p>
                        <p>Use this calculator to identify cost-saving opportunities and plan for long-term healthcare expenses.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


