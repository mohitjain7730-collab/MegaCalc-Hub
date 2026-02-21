'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Calendar, Target, Info, Shield, Smile, ArrowRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    implantCost: z.number().positive(),
    alternativeInitialCost: z.number().positive(),
    alternativeReplacementFrequency: z.number().positive(),
    inflationRate: z.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    breakevenYear: number | null;
    totalImplantCost20Years: number;
    totalAlternativeCost20Years: number;
    savings20Years: number;
    chartData: { year: number; implantCost: number; alternativeCost: number }[];
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
    value.toLocaleString('en-US', options);

export default function DentalImplantCostRecoveryCalculator() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            implantCost: undefined,
            alternativeInitialCost: undefined,
            alternativeReplacementFrequency: undefined,
            inflationRate: undefined, // User requested blank
        },
    });

    const onSubmit = (values: FormValues) => {
        const { implantCost, alternativeInitialCost, alternativeReplacementFrequency, inflationRate } = values;

        const chartData = [];
        let cumulativeImplantCost = implantCost;
        let cumulativeAlternativeCost = alternativeInitialCost;
        let breakevenYear = null;

        // Simulate 20 years
        for (let year = 1; year <= 20; year++) {
            // Implant maintenance (simplified: assumed minor yearly maintenance, e.g., $20 adjusted for inflation)
            // Realistically implants last 20+ years, so no replacement cost in this window typically.
            const yearlyMaintenance = 0; // Keeping simple as per plan: mainly contrasting initial vs recurring replacement

            // Alternative replacement logic
            let currentYearCost = 0;
            if (year % alternativeReplacementFrequency === 0) {
                // Replacement needed
                const inflationFactor = Math.pow(1 + inflationRate / 100, year);
                currentYearCost = alternativeInitialCost * inflationFactor;
            }

            cumulativeAlternativeCost += currentYearCost;

            // Check break-even
            if (breakevenYear === null && cumulativeImplantCost <= cumulativeAlternativeCost) {
                breakevenYear = year;
            }

            chartData.push({
                year,
                implantCost: Math.round(cumulativeImplantCost),
                alternativeCost: Math.round(cumulativeAlternativeCost),
            });
        }

        setResult({
            breakevenYear,
            totalImplantCost20Years: cumulativeImplantCost,
            totalAlternativeCost20Years: cumulativeAlternativeCost,
            savings20Years: cumulativeAlternativeCost - cumulativeImplantCost,
            chartData,
        });
    };

    const recommendationItems = result
        ? [
            result.savings20Years > 0
                ? `Over 20 years, implants could save you $${formatNumberUS(result.savings20Years)} compared to replacements.`
                : `Implants generally cost more upfront ($${formatNumberUS(result.totalImplantCost20Years)}) but offer superior quality of life.`,
            result.breakevenYear
                ? `You break even financially in year ${result.breakevenYear}.`
                : 'Based on these inputs, the alternative option remains cheaper over 20 years financially.',
            'Consider non-financial factors: bone health, comfort, and confidence.',
            'Check if your insurance covers a portion of the implant (often 50% max).',
        ]
        : [
            'Compare the lifetime value, not just the sticker price.',
            'Factor in the cost of denture adhesives and cleaners.',
            'Consider the intangible value of eating what you want.',
            'Ask about financing plans to manage the upfront implant cost.',
        ];

    return (
        <div className="space-y-8">

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smile className="h-5 w-5" />
                        Treatment Options
                    </CardTitle>
                    <CardDescription>
                        Compare Implants vs. Bridges/Dentures
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="implantCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Total Implant Cost (One-time)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 4000"
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
                                    name="alternativeInitialCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Alternative Cost (Bridge/Denture)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 1500"
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
                                    name="alternativeReplacementFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Replacement Needed Every (Years)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 7"
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
                                                    placeholder="e.g., 3"
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
                                Compare Long-Term Costs
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
                                    <CardTitle>Financial Comparison (20 Years)</CardTitle>
                                    <CardDescription>
                                        Long-term cost analysis of your dental options
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 bg-primary/5 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Target className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-medium text-muted-foreground">Break-even Point</span>
                                    </div>
                                    <p className="text-3xl font-bold text-primary">
                                        {result.breakevenYear ? `Year ${result.breakevenYear}` : 'N/A'}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        When implants become cheaper
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-muted/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Implant Total</span>
                                    </div>
                                    <p className="text-2xl font-bold">
                                        ${formatNumberUS(result.totalImplantCost20Years, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Total cost over 20 years
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <DollarSign className="h-5 w-5 text-orange-600" />
                                        <span className="text-sm font-medium text-muted-foreground">Alternative Total</span>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-600">
                                        ${formatNumberUS(result.totalAlternativeCost20Years, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        With replacements & inflation
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Cumulative Cost Over Time</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="year"
                                                unit="yr"
                                                tick={{ fontSize: 12 }}
                                            />
                                            <YAxis
                                                tickFormatter={(value) => `$${(value / 1000)}k`}
                                                tick={{ fontSize: 12 }}
                                                label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }}
                                            />
                                            <Tooltip
                                                formatter={(value: number) => [`$${formatNumberUS(value)}`, 'Cumulative Cost']}
                                                labelFormatter={(year) => `Year ${year}`}
                                            />
                                            <Legend />
                                            <Line type="monotone" dataKey="implantCost" name="Implant Cost" stroke="hsl(var(--primary))" strokeWidth={3} />
                                            <Line type="stepAfter" dataKey="alternativeCost" name="Alternative Cost" stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" />
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
                            Understanding the Options
                        </CardTitle>
                        <CardDescription>
                            Key factors in the dental decision
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Smile className="h-4 w-4" />
                                        Dental Implants
                                    </h4>
                                    <p className="text-muted-foreground">
                                        Implants are permanent fixtures. While expensive upfront, they can last a lifetime with proper care (20-25+ years), protecting jaw bone density.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Medical Inflation
                                    </h4>
                                    <p className="text-muted-foreground">
                                        Dental costs rise over time. A bridge that costs $1,500 today might cost significantly more when it needs replacement in 7-10 years.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Bridges/Dentures
                                    </h4>
                                    <p className="text-muted-foreground">
                                        Lower initial cost, but they have a finite lifespan. Bridges typically need replacement every 5-15 years, and specific bone loss can occur over time.
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
                            Methodology
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>
                            <strong>Break-even Year:</strong> The year where the cumulative cost of replacements exceeds the one-time implant cost.
                        </p>
                        <p>
                            <strong>Future Replacement Cost</strong> = Current Cost × (1 + Inflation)^Years
                        </p>
                        <p>
                            We model a 20-year period to capture at least 1-3 replacement cycles for bridges/dentures.
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
                                    <a href="/finance/medical-tourism-savings-estimator" className="text-primary hover:underline">
                                        Medical Tourism Savings
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Get implants abroad?
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/finance/monthly-budget-planner-calculator" className="text-primary hover:underline">
                                        Monthly Budget Planner
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Budget for the procedure
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/finance/loan-emi-calculator" className="text-primary hover:underline">
                                        Loan EMI Calculator
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Finance your smile
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/finance/emergency-fund-requirement-calculator" className="text-primary hover:underline">
                                        Emergency Fund Info
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Prepare for health costs
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Guide Section */}
                <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                    {/* SEO & SCHEMA METADATA */}
                    <meta itemProp="name" content="Comprehensive Cost Analysis: Dental Implants vs. Bridges & Dentures" />
                    <meta itemProp="description" content="A detailed 20-year financial analysis of dental implants versus traditional options. We break down maintenance costs, bone loss implications, and quality of life factors to help you make the right choice." />
                    <meta itemProp="keywords" content="dental implant cost analysis, implants vs dentures 20 year cost, hidden cost of dental bridges, bone resorption dental implants, financing dental implants, all-on-4 cost benefits" />
                    <meta itemProp="author" content="MegaCalc Financial Team" />
                    <meta itemProp="datePublished" content="2025-12-09" />
                    <meta itemProp="url" content="/dental-implant-cost-analysis-guide" />

                    <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6" itemProp="headline">Comprehensive Cost Analysis: Dental Implants vs. Bridges & Dentures</h1>
                    <p className="text-xl italic text-muted-foreground mb-8">Why the "expensive" choice today might be the smartest financial decision of your life.</p>

                    <div className="bg-muted p-6 rounded-lg mb-8">
                        <h3 className="font-semibold text-foreground mb-2">Key Takeaways</h3>
                        <ul className="list-disc ml-6 space-y-2">
                            <li>Dental implants have a high upfront cost ($3,000-$5,000+) but can last 25+ years or a lifetime.</li>
                            <li>Bridges and dentures appear cheaper initially but carry significant recurring "maintenance costs" and replacement needs every 5-10 years.</li>
                            <li>Implants are the only solution that preserves jawbone density, preventing facial collapse and future oral health complications.</li>
                            <li>When amortized over 20 years, implants often cost <strong>less per day</strong> than a daily cup of coffee.</li>
                        </ul>
                    </div>

                    <h2 className="text-3xl font-bold text-foreground mt-10 mb-6">Table of Contents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-primary font-medium">
                        <a href="#understanding-options" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Understanding Your Options</a>
                        <a href="#financial-breakdown" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The 20-Year Financial Breakdown</a>
                        <a href="#hidden-costs" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Hidden Costs of Traditional Solutions</a>
                        <a href="#health-impact" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The "Health Dividend" of Implants</a>
                        <a href="#insurance-financing" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Navigating Insurance & Financing</a>
                        <a href="#decision-matrix" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The Final Decision Matrix</a>
                    </div>
                    <hr className="my-8" />

                    <h2 id="understanding-options" className="text-3xl font-bold text-foreground pt-8" itemProp="articleSection">1. Understanding Your Options</h2>
                    <p className="mb-4">Before diving into the numbers, it is crucial to understand exactly what you are paying for. Tooth replacement isn't just about filling a gap in your smile; it's about restoring function, preserving anatomy, and maintaining quality of life.</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Option A: Dental Implants</h3>
                    <p className="mb-4">An implant is an artificial tooth root, typically made of titanium, that is surgically placed into your jawbone. Over a period of months, it fuses with your living bone in a process called <em>osseointegration</em>. A crown is then placed on top. It is the closest thing modern medicine has to a natural tooth.</p>
                    <ul className="list-disc ml-6 mb-6 space-y-1">
                        <li><strong>Longevity:</strong> 25+ years to lifetime.</li>
                        <li><strong>Function:</strong> 99% chewing power restored.</li>
                        <li><strong>Maintenance:</strong> Brush and floss like normal.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Option B: Fixed Dental Bridges</h3>
                    <p className="mb-4">A bridge literally "bridges" the gap created by one or more missing teeth. It consists of two or more crowns for the teeth on either side of the gap (anchoring teeth or abutments) and a false tooth/teeth in between. To place a bridge, the healthy adjacent teeth must be shaved down aggressively.</p>
                    <ul className="list-disc ml-6 mb-6 space-y-1">
                        <li><strong>Longevity:</strong> 5-15 years (average 10).</li>
                        <li><strong>Function:</strong> Good chewing power, but difficult to floss underneath.</li>
                        <li><strong>Risk:</strong> High risk of decay in anchor teeth due to difficult hygiene.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Option C: Removable Dentures (Partial or Full)</h3>
                    <p className="mb-4">Dentures are removable appliances. They sit on top of the gums and rely on suction or clasps for stability.</p>
                    <ul className="list-disc ml-6 mb-6 space-y-1">
                        <li><strong>Longevity:</strong> 5-8 years before relining or replacement is needed due to bone shape changes.</li>
                        <li><strong>Function:</strong> 10-25% chewing power compared to natural teeth.</li>
                        <li><strong>Common Complaints:</strong> Slipping, sore spots, difficulty tasting food (if upper palate is covered).</li>
                    </ul>

                    <h2 id="financial-breakdown" className="text-3xl font-bold text-foreground pt-12" itemProp="articleSection">2. The 20-Year Financial Breakdown</h2>
                    <p className="mb-4">This calculator was built because sticker shock often blinds patients to the long-term reality. Let's analyze a hypothetical scenario of replacing a single tooth over two decades.</p>

                    <div className="overflow-x-auto my-8">
                        <table className="w-full border-collapse border border-border text-sm md:text-base">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="border p-4 text-left">Cost Category</th>
                                    <th className="border p-4 text-left">Dental Implant</th>
                                    <th className="border p-4 text-left">3-Unit Bridge</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-4 font-medium">Initial Procedure</td>
                                    <td className="border p-4">$4,500 (Implant + Abutment + Crown)</td>
                                    <td className="border p-4">$3,500 (3 Crowns)</td>
                                </tr>
                                <tr>
                                    <td className="border p-4 font-medium">Year 10 Replacement</td>
                                    <td className="border p-4">$0 (Implants rarely need replacing)</td>
                                    <td className="border p-4">$4,200 (Adjusted for inflation)</td>
                                </tr>
                                <tr>
                                    <td className="border p-4 font-medium">Year 20 Replacement</td>
                                    <td className="border p-4">$0</td>
                                    <td className="border p-4">$5,000 (Adjusted for inflation)</td>
                                </tr>
                                <tr>
                                    <td className="border p-4 font-medium">Associated Treatments</td>
                                    <td className="border p-4">$0</td>
                                    <td className="border p-4">$1,200 (Root canal on anchor tooth - 20% risk)</td>
                                </tr>
                                <tr className="bg-primary/5 font-bold">
                                    <td className="border p-4">Total 20-Year Cost</td>
                                    <td className="border p-4 text-green-700">$4,500</td>
                                    <td className="border p-4 text-red-700">$13,900</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-6">* Prices are estimates and vary by region. Alternatives typically require replacement because gum tissues shrink and materials wear down.</p>

                    <p className="mb-4">As the table demonstrates, the "cheaper" bridge option ends up costing nearly <strong>triple</strong> the price of the implant over 20 years. This phenomenon is why financial advisors often categorize medical/dental interventions as "capital investments" in your health infrastructure rather than simple expenses.</p>

                    <h2 id="hidden-costs" className="text-3xl font-bold text-foreground pt-12" itemProp="articleSection">3. Hidden Costs of Traditional Solutions</h2>
                    <p className="mb-4">Beyond the direct billable costs of replacement, traditional bridges and dentures carry "hidden taxes" on your wallet and lifestyle.</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3"> The "Domino Effect" of Bridges</h3>
                    <p className="mb-4">To place a bridge, a dentist must grind down the enamel of two healthy teeth. Enamel is the hardest substance in the human body and protects the tooth nerve. Once removed, it never grows back. These "anchor" teeth are now compromised. They are more susceptible to:</p>
                    <ul className="list-disc ml-6 mb-6 space-y-1">
                        <li><strong>Sensitivity:</strong> Permanent sensitivity to hot and cold.</li>
                        <li><strong>Decay:</strong> Flossing under a bridge is difficult, leading to recurrent decay at the margins.</li>
                        <li><strong>Root Canals:</strong> The trauma of drilling can cause the nerve to die, requiring root canal therapy ($1,000 - $1,500).</li>
                        <li><strong>Fracture:</strong> Bearing the load of the missing tooth stresses the anchors, often leading to vertical root fractures and extraction.</li>
                    </ul>
                    <p className="mb-6 font-semibold text-red-500">Result: A 3-tooth problem becomes a 4-tooth problem, then a 5-tooth problem.</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">The "Subscription Model" of Dentures</h3>
                    <p className="mb-4">Dentures are not a "set it and forget it" solution. They require ongoing purchases:</p>
                    <ul className="list-disc ml-6 mb-6 space-y-1">
                        <li><strong>Adhesives:</strong> $5-$10 per month ($1,200+ over 20 years).</li>
                        <li><strong>Use of Cleaners:</strong> Soaking solutions and special brushes.</li>
                        <li><strong>Relines:</strong> As your jawbone shrinks, the denture becomes loose. Hard relines are needed every 2-3 years ($300-$500 each).</li>
                    </ul>

                    <h2 id="health-impact" className="text-3xl font-bold text-foreground pt-12" itemProp="articleSection">4. The "Health Dividend" of Implants</h2>
                    <p className="mb-4">This is the most critical factor that no calculator can fully quantify: <strong>Bone Resorption</strong>.</p>
                    <p className="mb-4">Your jawbone is like a muscle—use it or lose it. It requires the stimulation of chewing forces transmitted through tooth roots to maintain its density. When a tooth is extracted, that stimulation stops.</p>

                    <div className="border-l-4 border-primary pl-6 my-6 italic">
                        <p>"In the first year after extraction alone, you can lose up to 25% of your jawbone width."</p>
                    </div>

                    <p className="mb-4">Over 10-20 years, this loss creates "facial collapse." Your chin rotates forward, your lips thin, and deep wrinkles form around your mouth, aging you prematurely. Dentures accelerate this process by rubbing against the gum ridge.</p>
                    <p className="mb-4"><strong>Implants are essentially "bio-hacking" your jaw.</strong> They transmit chewing forces into the bone, tricking your body into thinking the tooth is still there. This preserves your facial structure and youthfulness. What is the monetary value of looking 10 years younger?</p>

                    <h2 id="insurance-financing" className="text-3xl font-bold text-foreground pt-12" itemProp="articleSection">5. Navigating Insurance & Financing</h2>
                    <p className="mb-4">Historically, dental insurance labeled implants as "cosmetic" and refused coverage. This has changed rapidly in the last decade as the long-term health benefits have become undeniable.</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Insurance Strategies</h3>
                    <ul className="list-disc ml-6 mb-6 space-y-2">
                        <li><strong>Check Your Plan's "Missing Tooth Clause":</strong> Some plans won't cover replacement if the tooth was missing <em>before</em> you bought the policy.</li>
                        <li><strong>Use Your Maximum:</strong> Most plans cap out at $1,500 - $2,000 per year. You can split treatment (extraction/grafting in December, Implant placement in January) to utilize two years of benefits.</li>
                        <li><strong>Medical Insurance:</strong> In rare cases (accidents, congenital defects), medical insurance might cover the surgery portion.</li>
                    </ul>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Patient Financing</h3>
                    <p className="mb-4">Since few people have $4,000 cash sitting around, financing is standard. CareCredit, LendingClub, and GreenSky are common providers offering:</p>
                    <ul className="list-disc ml-6 mb-6 space-y-1">
                        <li><strong>0% Interest Plans:</strong> usually for 6-24 months.</li>
                        <li><strong>Extended Terms:</strong> up to 60 months with interest, bringing payments down to ~$100/month.</li>
                    </ul>

                    <h2 id="decision-matrix" className="text-3xl font-bold text-foreground pt-12" itemProp="articleSection">6. The Final Decision Matrix</h2>
                    <p className="mb-6">Use this quick guide to validate your decision based on your life stage and priorities.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-lg mb-2 text-primary">Choose Implants If:</h4>
                            <ul className="list-disc ml-4 text-sm text-muted-foreground space-y-2">
                                <li>You are under 70 and want a lifetime solution.</li>
                                <li>You want to preserve your facial structure.</li>
                                <li>You want to eat steak, apples, and corn on the cob without worry.</li>
                                <li>You don't want to damage adjacent healthy teeth.</li>
                            </ul>
                        </div>
                        <div className="border p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-lg mb-2 text-primary">Choose a Bridge If:</h4>
                            <ul className="list-disc ml-4 text-sm text-muted-foreground space-y-2">
                                <li>The adjacent teeth already have large fillings or crowns (so shaving them down isn't a huge loss).</li>
                                <li>You have a medical condition that prohibits surgery (uncontrolled diabetes, radiation therapy).</li>
                                <li>You need a result in 2 weeks (implants take 3-6 months).</li>
                            </ul>
                        </div>
                        <div className="border p-6 rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-lg mb-2 text-primary">Choose Dentures If:</h4>
                            <ul className="list-disc ml-4 text-sm text-muted-foreground space-y-2">
                                <li>Budget is the absolute primary constraint.</li>
                                <li>You are missing multiple teeth and cannot afford "All-on-4" hybrid implants.</li>
                                <li>You view this as a temporary solution while saving for implants later.</li>
                            </ul>
                        </div>
                    </div>

                    <p className="mt-12 text-muted-foreground">
                        <strong>Disclaimer:</strong> This article is for informational financial analysis only and does not constitute medical advice. Every patient's anatomy, bone density, and medical history is unique. Consult with a qualified oral surgeon or periodontist for a personalized treatment plan.
                    </p>
                </section>

                {/* FAQ Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            Frequently Asked Questions
                        </CardTitle>
                        <CardDescription>
                            Common questions about dental financing
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Does insurance cover implants?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        It varies. Many basic plans classify implants as "cosmetic," but more comprehensive plans are starting to cover 50% of the cost up to the annual maximum.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Can I finance the cost?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Yes. Most dental offices offer financing like CareCredit, often with 0% interest for 12-24 months, making the monthly payment manageable.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Are implants painful?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        The procedure is done under local anesthesia. Most patients report that the recovery is less painful than a tooth extraction.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">How long is the process?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        It takes time. From extraction to bone healing to implant placement and final crown, it can take 3-6 months.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">What if I have low bone density?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        You may need a bone graft before the implant, which adds cost and time ($500-$1000+) but ensures success.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Do implants decay?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        No. Titanium and ceramic cannot get cavities. However, you can still get gum disease (peri-implantitis) if you don't floss.
                                    </p>
                                </div>
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
                        <p>This calculator projects the 20-year total cost of ownership for dental implants versus recurring alternatives like bridges or dentures.</p>
                        <p>While implants have a higher initial specific investment, their durability often results in lower long-term costs and better health outcomes.</p>
                        <p>Use this data to discuss financing options and long-term care plans with your dental provider.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
