'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Globe, Briefcase, Info, ArrowRight, Plane, Building2, FileText } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

const countrySchema = z.object({
    name: z.string().min(1, "Country name is required"),
    procedureCost: z.number().positive(),
    travelCost: z.number().min(0),
    accommodationCost: z.number().min(0),
    durationDays: z.number().positive(),
});

const formSchema = z.object({
    procedureName: z.string().min(1, "Procedure name is required"),
    homeCountry: countrySchema,
    comparisonCountries: z.array(countrySchema),
});

type FormValues = z.infer<typeof formSchema>;

interface ComparisonResult {
    countryName: string;
    totalCost: number;
    savingsAmount: number;
    savingsPercent: number;
    breakdown: {
        procedure: number;
        travel: number;
        accommodation: number;
    };
}

interface CalculationResult {
    comparisons: ComparisonResult[];
    chartData: { name: string; Procedure: number; Travel: number; Accommodation: number }[];
    bestValueCountry: string;
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
    value.toLocaleString('en-US', options);

export default function SurgeryCostComparisonByCountry() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            procedureName: '',
            homeCountry: {
                name: 'Home (USA)',
                procedureCost: undefined,
                travelCost: 0,
                accommodationCost: 0,
                durationDays: 1,
            },
            comparisonCountries: [
                {
                    name: 'Mexico',
                    procedureCost: undefined,
                    travelCost: undefined,
                    accommodationCost: undefined,
                    durationDays: undefined,
                },
                {
                    name: 'Thailand',
                    procedureCost: undefined,
                    travelCost: undefined,
                    accommodationCost: undefined,
                    durationDays: undefined,
                }
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "comparisonCountries",
    });

    const onSubmit = (values: FormValues) => {
        const { homeCountry, comparisonCountries } = values;

        // Calculate Home Cost
        const homeTotal = homeCountry.procedureCost + homeCountry.travelCost + homeCountry.accommodationCost;

        const comparisons: ComparisonResult[] = [];
        const chartData = [];

        // Add Home to Chart
        chartData.push({
            name: homeCountry.name,
            Procedure: homeCountry.procedureCost,
            Travel: homeCountry.travelCost,
            Accommodation: homeCountry.accommodationCost,
        });

        // Add Home to Comparisons (Base)
        comparisons.push({
            countryName: homeCountry.name,
            totalCost: homeTotal,
            savingsAmount: 0,
            savingsPercent: 0,
            breakdown: {
                procedure: homeCountry.procedureCost,
                travel: homeCountry.travelCost,
                accommodation: homeCountry.accommodationCost,
            }
        });

        let minCost = homeTotal;
        let bestValueCountry = homeCountry.name;

        comparisonCountries.forEach((country) => {
            const total = country.procedureCost + country.travelCost + country.accommodationCost;
            const savings = homeTotal - total;
            const percent = (savings / homeTotal) * 100;

            if (total < minCost) {
                minCost = total;
                bestValueCountry = country.name;
            }

            comparisons.push({
                countryName: country.name,
                totalCost: total,
                savingsAmount: savings,
                savingsPercent: percent,
                breakdown: {
                    procedure: country.procedureCost,
                    travel: country.travelCost,
                    accommodation: country.accommodationCost,
                }
            });

            chartData.push({
                name: country.name,
                Procedure: country.procedureCost,
                Travel: country.travelCost,
                Accommodation: country.accommodationCost,
            });
        });

        setResult({
            comparisons,
            chartData,
            bestValueCountry,
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Surgery Comparison
                    </CardTitle>
                    <CardDescription>
                        Compare medical costs across borders (Medical Tourism)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="procedureName"
                                    render={({ field }) => (
                                        <FormItem className="col-span-1 md:col-span-2">
                                            <FormLabel>Procedure Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Hip Replacement" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Home Country Section */}
                            <div className="border p-4 rounded-lg bg-muted/20">
                                <h3 className="font-semibold mb-4 flex items-center gap-2"><Building2 className="h-4 w-4" /> Home Country (Baseline)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="homeCountry.name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="homeCountry.procedureCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Procedure Cost ($)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 30000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    {/* Hidden/Optional fields for Home if user wants to add domestic travel */}
                                    <FormField
                                        control={form.control}
                                        name="homeCountry.travelCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Travel/Misc ($)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="0" {...field} value={field.value === 0 ? 0 : field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Comparison Countries */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2"><Plane className="h-4 w-4" /> Medical Tourism Destinations</h3>
                                {fields.map((field, index) => (
                                    <div key={field.id} className="border p-4 rounded-lg relative">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`comparisonCountries.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Country Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`comparisonCountries.${index}.procedureCost`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Procedure Cost ($)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="Cost" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`comparisonCountries.${index}.travelCost`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Flights ($)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="Airfare" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`comparisonCountries.${index}.accommodationCost`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Hotel/Stay ($)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="Hotel" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`comparisonCountries.${index}.durationDays`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Days</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="Days" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Button type="submit" className="w-full md:w-auto">
                                Compare Global Prices
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Cost Analysis</CardTitle>
                            <CardDescription>
                                Total Cost Breakdown (Procedure + Travel + Stay)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 bg-primary/5 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Best Value</p>
                                    <p className="text-3xl font-bold text-primary">
                                        {result.bestValueCountry}
                                    </p>
                                </div>
                                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Max Potential Savings</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        ${formatNumberUS(Math.max(...result.comparisons.map(c => c.savingsAmount)), { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <div className="text-center p-6 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Home Cost</p>
                                    <p className="text-3xl font-bold">
                                        ${formatNumberUS(result.comparisons[0].totalCost, { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                            </div>

                            <div className="h-80 w-full mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={result.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis label={{ value: 'Total Cost ($)', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(value: number) => [`$${formatNumberUS(value)}`, 'Cost']} />
                                        <Legend />
                                        <Bar dataKey="Procedure" stackId="a" fill="#2563eb" />
                                        <Bar dataKey="Travel" stackId="a" fill="#f59e0b" />
                                        <Bar dataKey="Accommodation" stackId="a" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="rounded-md border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-3 text-left font-medium">Location</th>
                                            <th className="p-3 text-right font-medium">Procedure</th>
                                            <th className="p-3 text-right font-medium">Travel & Stay</th>
                                            <th className="p-3 text-right font-medium">Total</th>
                                            <th className="p-3 text-right font-medium">Savings</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {result.comparisons.map((item) => (
                                            <tr key={item.countryName} className="border-t">
                                                <td className="p-3 font-medium">{item.countryName}</td>
                                                <td className="p-3 text-right">${formatNumberUS(item.breakdown.procedure)}</td>
                                                <td className="p-3 text-right">${formatNumberUS(item.breakdown.travel + item.breakdown.accommodation)}</td>
                                                <td className="p-3 text-right font-bold">${formatNumberUS(item.totalCost)}</td>
                                                <td className={`p-3 text-right font-bold ${item.savingsAmount > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                    {item.savingsAmount > 0 ? `-$${formatNumberUS(item.savingsAmount)}` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                            <strong>Quality Assurance:</strong> Lower cost does not always mean lower quality. Many international hospitals satisfy JCI (Joint Commission International) accreditation standards similar to US hospitals.
                        </AlertDescription>
                    </Alert>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>
                            <strong>Hidden Costs:</strong> Ensure your "Travel" budget includes post-op recovery time. You may not be able to fly immediately after surgery (DVT risk).
                        </li>
                        <li>
                            <strong>Insurance Reimbursement:</strong> Some forward-thinking insurance plans now cover medical tourism if it saves them money. Check your policy.
                        </li>
                        <li>
                            <strong>Aftercare:</strong> The biggest risk in medical tourism is complications after you return home. Establish a relationship with a local doctor willing to handle follow-up care.
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
                        More tools for healthcare savings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/category/finance/medical-tourism-savings-estimator" className="text-primary hover:underline">
                                    Simple Tourism Calc
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Quick estimate
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/category/finance/dental-implant-cost-recovery-calculator" className="text-primary hover:underline">
                                    Dental ROI
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Implants abroad?
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/category/finance/employer-health-plan-tax-savings-calculator" className="text-primary hover:underline">
                                    Tax Savings
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Domestic options
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/category/finance/prescription-generic-savings-calculator" className="text-primary hover:underline">
                                    Medication Savings
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Generic drugs
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="Surgery Cost Comparison by Country: The Medical Tourism Guide" />
                <meta itemProp="description" content="Compare surgery costs across different countries (medical tourism). Calculate total savings including travel, accommodation, and procedure fees." />
                <meta itemProp="keywords" content="surgery cost comparison, medical tourism calculator, surgery abroad prices, healthcare globalization, dental tourism savings" />
                <meta itemProp="author" content="MegaCalc Financial Team" />
                <meta itemProp="datePublished" content="2025-12-09" />
                <meta itemProp="url" content="/surgery-cost-comparison-guide" />

                <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6" itemProp="headline">Global Surgery Costs: Arbitraging Your Healthcare</h1>
                <p className="text-xl italic text-muted-foreground mb-8">Why the same procedure costs $50,000 in one country and $8,000 in another—with similar outcomes.</p>

                <div className="bg-muted p-6 rounded-lg mb-8">
                    <h3 className="font-semibold text-foreground mb-2">Executive Summary</h3>
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>Price Disparity:</strong> US healthcare prices are often 3x-10x higher than other developed nations due to administrative overhead, liability insurance, and lack of price controls.</li>
                        <li><strong>Total Cost of Ownership:</strong> You must factor in flights, hotels, visas, and lost wages. A $5,000 surgery isn't $5,000 if the flight is $2,000 and the hotel is $1,000.</li>
                        <li><strong>Accreditation:</strong> Look for JCI (Joint Commission International) accredited hospitals to ensure safety standards parallel to the US.</li>
                    </ul>
                </div>

                <h2 className="text-3xl font-bold text-foreground mt-10 mb-6">Table of Contents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-primary font-medium">
                    <a href="#why-cheaper" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Why is it Cheaper Abroad?</a>
                    <a href="#popular-destinations" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Popular Destinations by Procedure</a>
                    <a href="#calculating-total-cost" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Calculating True Total Cost</a>
                    <a href="#insurance-reimbursement" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Insurance & Medical Tourism</a>
                    <a href="#risks" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Managing Risks</a>
                    <a href="#ethics" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Ethical Considerations</a>
                </div>
                <hr className="my-8" />

                <h2 id="why-cheaper" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">1. Why is it Cheaper Abroad?</h2>
                <p className="mb-4">It is rarely because of "lower quality." The main drivers are:</p>
                <ul className="list-disc ml-6 space-y-2 mb-4">
                    <li><strong>Labor Costs:</strong> Doctors and nurses in Thailand or Mexico earn less than in the US, though they are often excellent and US-trained.</li>
                    <li><strong>Malpractice Insurance:</strong> US doctors pay astronomical malpractice premiums. This cost is passed to you.</li>
                    <li><strong>Admin Bloat:</strong> The complex US billing system (insurance coding) requires armies of administrators. Cash-pay systems abroad strip this cost out.</li>
                </ul>

                <h2 id="popular-destinations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">2. Popular Destinations by Procedure</h2>
                <p className="mb-4">Different countries specialize in different niches.</p>
                <ul className="list-disc ml-6 space-y-2 mb-4">
                    <li><strong>Mexico:</strong> Dentistry, Bariatric Surgery. (Proximity to US is key).</li>
                    <li><strong>Thailand:</strong> Gender Affirmation, Cosmetic Surgery, Orthopedics. (Hospitality focus).</li>
                    <li><strong>India:</strong> Cardiac Surgery, Oncology. (High volume, high complexity).</li>
                    <li><strong>Turkey:</strong> Hair Transplants, Eye Surgery. (State-subsidized medical tourism).</li>
                </ul>

                <h2 id="calculating-total-cost" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">3. Calculating True Total Cost</h2>
                <p className="mb-4">This calculator helps you avoid the "Sticker Price Fallacy."</p>
                <p className="mb-4">If a hip replacement is $12,000 in India vs $40,000 in the US:</p>
                <ul className="list-disc ml-6 space-y-2 mb-4">
                    <li><strong>Add:</strong> Flight ($1,500).</li>
                    <li><strong>Add:</strong> Hotel for recovery (14 days @ $100 = $1,400).</li>
                    <li><strong>Add:</strong> Eating out ($500).</li>
                    <li><strong>Add:</strong> Companion travel costs (who is taking care of you?).</li>
                </ul>
                <p className="mb-4">The total is closer to $16,000. Still a huge savings, but 33% higher than the sticker price.</p>

                <h2 id="insurance-reimbursement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">4. Insurance & Medical Tourism</h2>
                <p className="mb-4">Traditionally, insurance didn't cover overseas care. This is changing.</p>
                <p className="mb-4">Some self-insured employers now offer "Medical Tourism Options." They will pay 100% of your surgery + flight + give you a cash bonus if you go to a Center of Excellence in Mexico, because it saves them $20,000 compared to the local US hospital.</p>

                <h2 id="risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">5. Managing Risks</h2>
                <p className="mb-4"><strong>Continuity of Care:</strong> The surgeon operates and you leave. Who takes out the stitches? Who handles an infection 3 weeks later? You need a "landing plan" at home.</p>
                <p className="mb-4"><strong>Legal Recourse:</strong> If something goes wrong in the US, you can sue. In other countries, legal recourse for malpractice may be non-existent or very difficult.</p>

                <h2 id="ethics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">6. Ethical Considerations</h2>
                <p className="mb-4">Be aware of the impact on the local population. In some countries, medical tourism creates a "brain drain" where the best doctors only treat foreigners, leaving locals with poor care. Choosing accredited hospitals that also serve the local community can mitigate this.</p>

                <p className="mt-12 text-muted-foreground">
                    <strong>Disclaimer:</strong> Medical tourism involves significant health and financial risks. Verify provider credentials independently (JCI, ISO). This calculator provides cost estimates only, not medical advice.
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
                            <h4 className="font-semibold mb-2">Is it safe?</h4>
                            <p className="text-muted-foreground text-sm">
                                It can be as safe as the US if you choose JCI-accredited hospitals. Do not choose based on price alone.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">What about language barriers?</h4>
                            <p className="text-muted-foreground text-sm">
                                Major international hospitals have dedicated English-speaking coordinators and medical staff.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Can I fly after surgery?</h4>
                            <p className="text-muted-foreground text-sm">
                                Not immediately. For major surgeries (hip, heart), you may need to stay 10-21 days to avoid blood Clot risks (DVT).
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">How do I pay?</h4>
                            <p className="text-muted-foreground text-sm">
                                Most accept credit cards or wire transfers. Be careful carrying large amounts of cash.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Does Medicare cover this?</h4>
                            <p className="text-muted-foreground text-sm">
                                Generally, no. Medicare does not offer coverage outside the 50 US states and territories.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">What if complications happen home?</h4>
                            <p className="text-muted-foreground text-sm">
                                You will go to your local ER or specialist. Your insurance should cover this as a standard emergency/illness, even if the root cause was surgery abroad, but check your policy.
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
                    <p>The Surgery Cost Comparison Calculator brings transparency to the global healthcare market.</p>
                    <p>By comparing the "all-in" costs of procedures in different countries, it empowers patients to make value-based decisions.</p>
                    <p>While the savings can be substantial (often 50-80%), users must weigh them against travel logistics, recovery time, and the need for robust pre-planning.</p>
                </CardContent>
            </Card>

        </div>
    );
}
