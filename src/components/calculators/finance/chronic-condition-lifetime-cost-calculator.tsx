'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Calendar, Activity, Info, HeartPulse, ArrowRight, Pill, FileText } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    monthlyMedsCost: z.number().min(0),
    annualVisitsCost: z.number().min(0),
    annualLabsCost: z.number().min(0),
    initialOneTimeCost: z.number().min(0),
    inflationRate: z.number().min(0).max(100),
    yearsToForecast: z.number().positive().max(80),
});

type FormValues = z.infer<typeof formSchema>;

interface YearlyData {
    year: number;
    annualCost: number;
    cumulativeCost: number;
}

interface CalculationResult {
    totalLifetimeCost: number;
    averageAnnualCost: number;
    chartData: YearlyData[];
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
    value.toLocaleString('en-US', options);

export default function ChronicConditionLifetimeCostCalculator() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            monthlyMedsCost: undefined,
            annualVisitsCost: undefined,
            annualLabsCost: undefined,
            initialOneTimeCost: undefined,
            inflationRate: undefined, // default could be 3, but user requested blank
            yearsToForecast: undefined,
        },
    });

    const onSubmit = (values: FormValues) => {
        const { monthlyMedsCost, annualVisitsCost, annualLabsCost, initialOneTimeCost, inflationRate, yearsToForecast } = values;

        let cumulativeCost = initialOneTimeCost;
        const chartData: YearlyData[] = [];

        // Base annual cost at Year 0 prices
        const baseAnnualRecurring = (monthlyMedsCost * 12) + annualVisitsCost + annualLabsCost;

        for (let year = 1; year <= yearsToForecast; year++) {
            // Apply cumulative inflation to the recurring costs
            // Year 1 cost = Base * (1+r)
            const inflationFactor = Math.pow(1 + inflationRate / 100, year);
            const currentYearCost = baseAnnualRecurring * inflationFactor;

            cumulativeCost += currentYearCost;

            chartData.push({
                year,
                annualCost: Math.round(currentYearCost),
                cumulativeCost: Math.round(cumulativeCost),
            });
        }

        setResult({
            totalLifetimeCost: cumulativeCost,
            averageAnnualCost: cumulativeCost / yearsToForecast,
            chartData,
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Condition Costs
                    </CardTitle>
                    <CardDescription>
                        Estimate the long-term financial impact of managing a condition
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="monthlyMedsCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Pill className="h-4 w-4" />
                                                Monthly Medications ($)
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
                                    name="annualVisitsCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Annual Doctor Visits ($)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 400"
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
                                    name="annualLabsCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Annual Labs & Tests ($)
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
                                    name="initialOneTimeCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Initial Diagnosis/Setup ($)
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
                                            <p className="text-xs text-muted-foreground">Equipment, first surgery, etc.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="inflationRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Medical Inflation Rate (%)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 4"
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
                                    name="yearsToForecast"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Years to Forecast
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
                                Calculate Lifetime Cost
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Accumulated Cost Projection</CardTitle>
                            <CardDescription>
                                Total financial burden over {form.getValues().yearsToForecast} years (Inflation Adjusted)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Lifetime Cost</p>
                                    <p className="text-4xl font-bold text-red-700">
                                        ${formatNumberUS(result.totalLifetimeCost, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Total out-of-pocket
                                    </p>
                                </div>
                                <div className="text-center p-6 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Avg. Annual Cost</p>
                                    <p className="text-3xl font-bold">
                                        ${formatNumberUS(result.averageAnnualCost, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Per year average
                                    </p>
                                </div>
                            </div>

                            <div className="h-80 w-full mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={result.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
                                        <YAxis label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(value: number) => [`$${formatNumberUS(value)}`, 'Cumulative Cost']} />
                                        <Legend />
                                        <Area type="monotone" dataKey="cumulativeCost" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Total Spent" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            <strong>Inflation Warning:</strong> Medical inflation typically outpaces general inflation. Over 20 years, your annual costs could more than double just due to price increases.
                        </AlertDescription>
                    </Alert>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>
                            <strong>Invest in HSAs:</strong> A Health Savings Account (HSA) is critical for chronic conditions. The triple tax advantage can reduce the "Total Lifetime Cost" by 20-30% effectively.
                        </li>
                        <li>
                            <strong>Generic Substitution:</strong> If your medication cost is the biggest driver, switching to generics is the single most effective way to flatten the curve.
                        </li>
                        <li>
                            <strong>Lifestyle Interventions:</strong> Calculate the ROI of a gym membership or nutritionist. If it reduces "Annual Visits" or "Monthly Meds", it pays for itself.
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Landmark className="h-5 w-5" />
                        Related Calculators
                    </CardTitle>
                    <CardDescription>
                        More tools for healthcare planning
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/doctor-visit-roi-calculator" className="text-primary hover:underline">
                                    Preventive ROI
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Prevention value
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/prescription-generic-savings-calculator" className="text-primary hover:underline">
                                    Generic Savings
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Reduce drug costs
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/employer-health-plan-tax-savings-calculator" className="text-primary hover:underline">
                                    Health Plan Tax
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Pre-tax savings
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/medical-tourism-savings-estimator" className="text-primary hover:underline">
                                    Medical Tourism
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Surgery abroad
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="Chronic Condition Lifetime Cost: A Long-Term Financial Guide" />
                <meta itemProp="description" content="Calculate the total lifetime cost of managing chronic conditions like diabetes or hypertension. Account for medical inflation and recurring expenses." />
                <meta itemProp="keywords" content="chronic condition cost, lifetime medical expenses, cost of diabetes, medical inflation calculator, healthcare financial planning" />
                <meta itemProp="author" content="MegaCalc Financial Team" />
                <meta itemProp="datePublished" content="2025-12-09" />
                <meta itemProp="url" content="/chronic-condition-lifetime-cost-guide" />

                <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6" itemProp="headline">Chronic Condition Economics: The Compounding Cost of Care</h1>
                <p className="text-xl italic text-muted-foreground mb-8">Managing a chronic illness is a marathon, not a sprint. Your financial strategy needs to match.</p>

                <div className="bg-muted p-6 rounded-lg mb-8">
                    <h3 className="font-semibold text-foreground mb-2">Executive Summary</h3>
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>The $1 Million Problem:</strong> Small monthly costs (co-pays, meds) compounded over 40 years with inflation can easily exceed hundreds of thousands of dollars.</li>
                        <li><strong>Medical Inflation:</strong> Historically, medical costs rise faster than general inflation. A "flat" budget will eventually fail.</li>
                        <li><strong>Hidden Costs:</strong> It's NOT just meds. It’s extra tests, specialist visits, special dietary needs, and lost wages.</li>
                    </ul>
                </div>

                <h2 className="text-3xl font-bold text-foreground mt-10 mb-6">Table of Contents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-primary font-medium">
                    <a href="#understanding-costs" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Understanding the Cost Components</a>
                    <a href="#inflation-factor" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The Inflation Factor</a>
                    <a href="#insurance-role" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Impact of Insurance & Out-of-Pocket Max</a>
                    <a href="#mitigation" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Strategies to Mitigate Costs</a>
                    <a href="#indirect-costs" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Indirect Costs (The "Iceberg")</a>
                    <a href="#financial-planning" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Financial Planning Steps</a>
                </div>
                <hr className="my-8" />

                <h2 id="understanding-costs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">1. Understanding the Cost Components</h2>
                <p className="mb-4">When budgeting for a chronic condition (like Type 2 Diabetes, Crohn's, or Rheumatoid Arthritis), categorize expenses into three buckets:</p>
                <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">Recurring Fixed Costs</h3>
                <p className="mb-4">These happen every month/year regardless of how you feel. Examples: Monthly premiums, daily medications, quarterly checkups.</p>
                <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">Variable Functional Costs</h3>
                <p className="mb-4">These depend on the severity of the condition at the time. Examples: Extra lab work during flares, physical therapy sessions, emergency urgent care visits.</p>
                <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">One-Time Capital Costs</h3>
                <p className="mb-4">Upfront investments. Examples: CPAP machine, insulin pump, mobility aids, home modifications.</p>

                <h2 id="inflation-factor" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">2. The Inflation Factor</h2>
                <p className="mb-4">This calculator asks for an "Inflation Rate" for a reason. Medical inflation (CPI-M) often runs at 4-6%, while standard inflation is 2-3%.</p>
                <p className="mb-4">If you spend $10,000/year today, in 20 years at 5% inflation, that same level of care will cost <strong>$26,532/year</strong>. If your retirement planning doesn't account for this, you will run out of money.</p>

                <h2 id="insurance-role" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">3. Impact of Insurance & Out-of-Pocket Max</h2>
                <p className="mb-4">Insurance is the primary buffer against bankruptcy, but "Out-of-Pocket Maximums" are the real number to watch.</p>
                <p className="mb-4">If you have a chronic condition, you might hit your Out-of-Pocket Max (e.g., $8,000) every single year. Over 30 years, that is $240,000 in direct payments, not including premiums. Knowing this "ceiling" helps you plan your emergency fund.</p>

                <h2 id="mitigation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">4. Strategies to Mitigate Costs</h2>
                <p className="mb-4">You cannot change your diagnosis, but you can change the bill.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Tiered Formularies:</strong> Check your insurance drug list. Moving from a Tier 3 brand drug ($50 copay) to a Tier 1 generic ($10 copay) saves $480/year.</li>
                    <li><strong>Mail Order Pharmacy:</strong> Getting a 90-day supply often costs the same as a 60-day supply at retail.</li>
                    <li><strong>Tax-Advantaged Accounts:</strong> Max out your HSA (Health Savings Account) or FSA. Using pre-tax dollars effectively gives you a 20-30% discount on all medical bills.</li>
                </ul>

                <h2 id="indirect-costs" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">5. Indirect Costs (The "Iceberg")</h2>
                <p className="mb-4">Direct medical bills are just the tip of the iceberg. The "underwater" costs often sink the ship:</p>
                <p className="mb-4"><strong>Career Impact:</strong> Do you need a job with flexibility? Does fatigue limit your ability to seek promotions? "Health capital" is closely tied to "human capital."</p>
                <p className="mb-4"><strong>Life Insurance:</strong> Getting life insurance with a pre-existing condition is significantly more expensive or impossible, requiring alternative estate planning strategies.</p>

                <h2 id="financial-planning" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">6. Financial Planning Steps</h2>
                <p className="mb-4">1. <strong>Baseline:</strong> Use this calculator to get a scary but necessary number.</p>
                <p className="mb-4">2. <strong>Buffer:</strong> Build an emergency fund specifically for health (separate from your job-loss fund).</p>
                <p className="mb-4">3. <strong>Invest:</strong> Ensure your long-term investments grow faster than medical inflation.</p>

                <p className="mt-12 text-muted-foreground">
                    <strong>Disclaimer:</strong> This tool estimates costs based on user inputs. It cannot predict future healthcare policy changes, insurance market shifts, or new curative treatments. Consult a financial planner who specializes in disability or special needs planning.
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">What is a reasonable inflation rate?</h4>
                            <p className="text-muted-foreground text-sm">
                                Medical inflation usually hovers between 4% and 6%. It is safer to overestimate than underestimate.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Should I include premiums?</h4>
                            <p className="text-muted-foreground text-sm">
                                Yes, if you pay them yourself. If your employer pays them, only include your portion (the deduction from your paycheck).
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Does this include surgery?</h4>
                            <p className="text-muted-foreground text-sm">
                                You can add expected surgeries in the "Initial One-Time Cost" field or average them into "Annual" if they are recurring.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">How do HSAs help?</h4>
                            <p className="text-muted-foreground text-sm">
                                Expenses paid via HSA are tax-free. If you are in a 24% tax bracket, paying $100 from an HSA is like paying $76 from your checking account.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">What about Medicare?</h4>
                            <p className="text-muted-foreground text-sm">
                                At age 65, cost structures change. Medicare has premiums and copays too, but often lower than private insurance.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Is diet included?</h4>
                            <p className="text-muted-foreground text-sm">
                                If you require a specialized diet (e.g., gluten-free for Celiac, low-protein for kidney issues), the extra cost of food IS a medical cost.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>The Chronic Condition Lifetime Cost Calculator sheds light on the often-underestimated price tag of long-term health management.</p>
                    <p>By factoring in the "silent killer" of wealth—medical inflation—it shows how modest annual costs can compound into a significant portion of lifetime earnings.</p>
                    <p>Use these insights to prioritize preventive care, optimize insurance choices, and aggressively fund tax-advantaged accounts like HSAs.</p>
                </CardContent>
            </Card>

        </div>
    );
}
