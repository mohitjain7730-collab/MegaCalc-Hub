'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Calendar, Target, Info, Activity, Shield, Plane, Hotel, Stethoscope, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    homeProcedureCost: z.number().positive(),
    destinationProcedureCost: z.number().positive(),
    flightCost: z.number().positive(),
    hotelCostPerNight: z.number().nonnegative(),
    stayDurationDays: z.number().positive(),
    dailyExpenses: z.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    totalHomeCost: number;
    totalDestinationProcedureCost: number;
    totalTravelCost: number;
    totalDestinationCost: number;
    savings: number;
    savingsPercentage: number;
    chartData: { name: string; cost: number }[];
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
    value.toLocaleString('en-US', options);

export default function MedicalTourismSavingsEstimator() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            homeProcedureCost: undefined,
            destinationProcedureCost: undefined,
            flightCost: undefined,
            hotelCostPerNight: undefined,
            stayDurationDays: undefined,
            dailyExpenses: undefined,
        },
    });

    const onSubmit = (values: FormValues) => {
        const { homeProcedureCost, destinationProcedureCost, flightCost, hotelCostPerNight, stayDurationDays, dailyExpenses } = values;

        const totalAccommodation = hotelCostPerNight * stayDurationDays;
        const totalDailyExpenses = dailyExpenses * stayDurationDays;
        const totalTravelCost = flightCost + totalAccommodation + totalDailyExpenses;
        const totalDestinationCost = destinationProcedureCost + totalTravelCost;

        const savings = homeProcedureCost - totalDestinationCost;
        const savingsPercentage = (savings / homeProcedureCost) * 100;

        const chartData = [
            { name: 'Home Country', cost: homeProcedureCost },
            { name: 'Abroad', cost: totalDestinationCost },
        ];

        setResult({
            totalHomeCost: homeProcedureCost,
            totalDestinationProcedureCost: destinationProcedureCost,
            totalTravelCost,
            totalDestinationCost,
            savings,
            savingsPercentage,
            chartData,
        });
    };

    const recommendationItems = result
        ? [
            result.savings > 0
                ? `You could save $${formatNumberUS(result.savings)} (${result.savingsPercentage.toFixed(1)}%) by traveling abroad.`
                : `Traveling abroad currently costs $${formatNumberUS(Math.abs(result.savings))} more than stating home.`,
            'Ensure the destination facility is JCI accredited or has international standards.',
            'Factor in post-op recovery time and check if you can travel immediately after.',
            'Consider travel insurance that covers medical tourism complications.',
        ]
        : [
            'Research JCI-accredited hospitals in your destination.',
            'Consider all travel costs, not just the procedure price.',
            'Consult with your local doctor about post-procedure care.',
            'Verify visa requirements for medical travel.',
        ];

    return (
        <div className="space-y-8">

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plane className="h-5 w-5" />
                        Trip & Procedure Details
                    </CardTitle>
                    <CardDescription>
                        Estimate costs for your medical trip
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="homeProcedureCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Procedure Cost (Home)
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
                                    name="destinationProcedureCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4" />
                                                Procedure Cost (Abroad)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 5000"
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
                                    name="flightCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Plane className="h-4 w-4" />
                                                Round Trip Flight Cost
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 800"
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
                                    name="stayDurationDays"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Duration of Stay (Days)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 10"
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
                                    name="hotelCostPerNight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Hotel className="h-4 w-4" />
                                                Hotel Cost per Night
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 80"
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
                                    name="dailyExpenses"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Daily Living Expenses
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 40"
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
                                Compare Costs
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
                                    <CardTitle>Total Cost Comparison</CardTitle>
                                    <CardDescription>
                                        Home vs. Abroad Cost Breakdown
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 bg-primary/5 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium text-muted-foreground">Total Savings</span>
                                    </div>
                                    <p className={`text-3xl font-bold ${result.savings >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                        ${formatNumberUS(Math.abs(result.savings), { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {result.savings >= 0 ? 'Cost reduction' : 'Extra cost'}
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-muted/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Plane className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Travel & Stay</span>
                                    </div>
                                    <p className="text-2xl font-bold">
                                        ${formatNumberUS(result.totalTravelCost, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Total logistics cost
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Target className="h-5 w-5 text-green-600" />
                                        <span className="text-sm font-medium text-muted-foreground">Cost abroad</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">
                                        ${formatNumberUS(result.totalDestinationCost, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        All inclusive
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Cost Comparison</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis
                                                tickFormatter={(value) => `$${(value / 1000)}k`}
                                                tick={{ fontSize: 12 }}
                                                label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => [`$${formatNumberUS(value)}`, 'Total Cost']}
                                                cursor={{ fill: 'transparent' }}
                                            />
                                            <Bar dataKey="cost" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={50} />
                                        </BarChart>
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
                                        Procedure Cost (Home)
                                    </h4>
                                    <p className="text-muted-foreground">
                                        The total expected cost of the medical procedure in your home country, including surgeon fees, hospital charges, and anesthesia.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Stethoscope className="h-4 w-4" />
                                        Procedure Cost (Abroad)
                                    </h4>
                                    <p className="text-muted-foreground">
                                        The total cost of the same procedure at your destination. This is often significantly lower due to different labor costs and exchange rates.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Plane className="h-4 w-4" />
                                        Travel Logistics
                                    </h4>
                                    <p className="text-muted-foreground">
                                        Don't forget to include flight tickets, visa fees, hotel accommodation for your recovery period, and daily food/transport expenses.
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
                            <strong>Total Savings</strong> = Home Cost - (Destination Procedure + Travel + Accommodation + Daily Expenses)
                        </p>
                        <p>
                            <strong>Cost Abroad</strong> = Destination Procedure + Flight + (Hotel × Days) + (Daily × Days)
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
                                    <a href="/category/finance/prescription-generic-savings-calculator" className="text-primary hover:underline">
                                        Prescription Savings
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Save on medication costs
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/category/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">
                                        Monthly Budget Planner
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Plan your overall budget
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/category/finance/emergency-fund-requirement-calculator" className="text-primary hover:underline">
                                        Emergency Fund Calculator
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Plan for unexpected costs
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/category/finance/loan-emi-calculator" className="text-primary hover:underline">
                                        Loan EMI Calculator
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Calculate medical loan payments
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Guide Section */}
                <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                    {/* SEO & SCHEMA METADATA */}
                    <meta itemProp="name" content="Medical Tourism Cost Guide: How Much Can You Really Save?" />
                    <meta itemProp="description" content="Calculate the true cost of medical tourism. Learn about hidden expenses, popular destinations, and ensuring quality of care abroad." />
                    <meta itemProp="keywords" content="medical tourism cost, surgery abroad savings, dental tourism, medical travel calculator, healthcare savings, thailand medical tourism, mexico dental work" />
                    <meta itemProp="author" content="MegaCalc Financial Team" />
                    <meta itemProp="datePublished" content="2025-12-09" />
                    <meta itemProp="url" content="/definitive-medical-tourism-guide" />

                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Medical Tourism Cost Guide: How Much Can You Really Save?</h1>
                    <p className="text-lg italic text-muted-foreground">Is traveling for surgery worth it? We break down the costs, risks, and potential savings of becoming a medical tourist.</p>

                    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                    <ul className="list-disc ml-6 space-y-2 text-primary">
                        <li><a href="#overview" className="hover:underline">What is Medical Tourism?</a></li>
                        <li><a href="#destinations" className="hover:underline">Popular Destinations and Specialties</a></li>
                        <li><a href="#checklist" className="hover:underline">The Hidden Costs Checklist</a></li>
                        <li><a href="#risks" className="hover:underline">Understanding the Risks</a></li>
                    </ul>
                    <hr />

                    <h2 id="overview" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Medical Tourism?</h2>
                    <p>Medical tourism refers to people traveling abroad to obtain medical treatment. In the past, this usually referred to those who traveled from less-developed countries to major medical centers in highly developed countries for treatment unavailable at home. However, in recent years it may equally refer to those from developed countries who travel to developing countries for lower-priced medical treatments.</p>

                    <h2 id="destinations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Popular Destinations and Specialties</h2>
                    <p>Different countries specialize in different types of procedures. For example:</p>
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>Mexico & Costa Rica:</strong> Popular for dental work and cosmetic surgery due to proximity to the US.</li>
                        <li><strong>Thailand & Malaysia:</strong> Known for advanced hospitals offering orthopedic, cardiac, and cosmetic procedures.</li>
                        <li><strong>Turkey:</strong> A global hub for hair transplants and eye surgery.</li>
                    </ul>

                    <h2 id="checklist" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Hidden Costs Checklist</h2>
                    <p>While the procedure sticker price might be 70% lower, you must factor in the total cost of ownership:</p>
                    <ul className="list-disc ml-6 space-y-2">
                        <li>Ground transportation (taxis/transfers).</li>
                        <li>Post-operative medication.</li>
                        <li>Follow-up complications (potential need to return).</li>
                        <li>Companion travel costs (if bringing a friend/family member).</li>
                    </ul>

                    <h2 id="risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding the Risks</h2>
                    <p>Quality and safety are paramount. Look for Joint Commission International (JCI) accreditation, which is the gold standard for global healthcare. ensure you have a plan for follow-up care once you return home.</p>
                </section>

                {/* FAQ Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Frequently Asked Questions
                        </CardTitle>
                        <CardDescription>
                            Common questions about medical travel
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">Does insurance cover medical tourism?</h4>
                                <p className="text-muted-foreground">
                                    Generally, no. Most domestic health insurance plans do not cover elective procedures abroad. However, some specific "medical tourism" insurance policies exist.
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">Is it safe?</h4>
                                <p className="text-muted-foreground">
                                    It can be, provided you choose an accredited facility. JCI-accredited hospitals meet rigorous international standards similar to US hospitals.
                                </p>
                            </div>

                            <div className="p-4 border rounded-lg">
                                <h4 className="font-semibold mb-2">What if something goes wrong?</h4>
                                <p className="text-muted-foreground">
                                    This is the biggest risk. You may have little legal recourse in a foreign country. Ensure you have a plan for emergency medical evacuation or corrective treatment.
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
                        <p>This tool compares costs between home and medical tourism destinations, factoring in travel, accommodation, and subsistence expenses.</p>
                        <p>Recommendations, guide content, and FAQs highlight savings potential while emphasizing quality, safety accreditation, and hidden costs.</p>
                        <p>Use this estimator to make informed decisions about traveling for medical procedures and weighing financial benefits against logistical complexity.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


