'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Calendar, Activity, Info, HeartPulse, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
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

const formSchema = z.object({
    visitCost: z.number().positive(),
    frequencyPerYear: z.number().positive(),
    potentialConditionCost: z.number().positive(),
    probabilityOfCondition: z.number().min(0).max(100),
    timeHorizon: z.number().positive().max(50),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    totalPreventiveCost: number;
    expectedReactiveCost: number;
    savings: number;
    roi: number;
    chartData: { name: string; cost: number }[];
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
    value.toLocaleString('en-US', options);

export default function DoctorVisitROICalculator() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            visitCost: undefined,
            frequencyPerYear: undefined,
            potentialConditionCost: undefined,
            probabilityOfCondition: undefined,
            timeHorizon: undefined,
        },
    });

    const onSubmit = (values: FormValues) => {
        const { visitCost, frequencyPerYear, potentialConditionCost, probabilityOfCondition, timeHorizon } = values;

        // Total cost of checkups over the time horizon
        const totalPreventiveCost = visitCost * frequencyPerYear * timeHorizon;

        // Expected Value of Reactive Cost = Cost of Condition * Probability
        // This is a statistical expectation.
        const expectedReactiveCost = potentialConditionCost * (probabilityOfCondition / 100);

        const savings = expectedReactiveCost - totalPreventiveCost;
        const roi = (savings / totalPreventiveCost) * 100;

        const chartData = [
            { name: 'Preventive Cost', cost: totalPreventiveCost },
            { name: 'Reactive Risk Cost', cost: expectedReactiveCost },
        ];

        setResult({
            totalPreventiveCost,
            expectedReactiveCost,
            savings,
            roi,
            chartData,
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HeartPulse className="h-5 w-5" />
                        Visit & Risk Details
                    </CardTitle>
                    <CardDescription>
                        Compare the cost of prevention vs. the risk of neglect
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="visitCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Cost per Checkup ($)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 150"
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
                                    name="frequencyPerYear"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Visits per Year
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 1 or 2"
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
                                    name="potentialConditionCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Potential Reactive Cost ($)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 50000 (Surgery)"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">Cost if condition goes undetected.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="probabilityOfCondition"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                Risk Probability (%)
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
                                <FormField
                                    control={form.control}
                                    name="timeHorizon"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Time Horizon (Years)
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
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate ROI
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Analysis</CardTitle>
                            <CardDescription>
                                Preventive vs. Reactive Cost Comparison
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Preventive Cost</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        ${formatNumberUS(result.totalPreventiveCost, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Over {form.getValues().timeHorizon} years
                                    </p>
                                </div>
                                <div className="text-center p-6 bg-red-50 dark:bg-red-950/20 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Expected Risk Cost</p>
                                    <p className="text-3xl font-bold text-red-600">
                                        ${formatNumberUS(result.expectedReactiveCost, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        (Cost × Probability)
                                    </p>
                                </div>
                                <div className={`text-center p-6 rounded-lg ${result.savings > 0 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-orange-50 dark:bg-orange-950/20'}`}>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">
                                        {result.savings > 0 ? 'Projected Savings' : 'Net Cost of Prevention'}
                                    </p>
                                    <p className={`text-3xl font-bold ${result.savings > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                        ${formatNumberUS(Math.abs(result.savings), { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {result.roi.toFixed(1)}% ROI
                                    </p>
                                </div>
                            </div>

                            <div className="h-80 w-full mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={result.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(value: number) => [`$${formatNumberUS(value)}`, 'Cost']} />
                                        <Legend />
                                        <Bar dataKey="cost" fill="#3b82f6" name="Cost ($)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5" />
                        Preventive Health Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <AlertDescription>
                            <strong>The Value of Early Detection:</strong> The "Reactive Cost" input represents the severe financial impact of catching a condition late (e.g., advanced diabetes management, bypass surgery). Catching it early often reduces treatment costs by 90%+.
                        </AlertDescription>
                    </Alert>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li>
                            {result
                                ? (result.savings > 0
                                    ? "Mathematically, prevention is the winning strategy. The expected cost of the risk outweighs the small annual maintenance of checkups."
                                    : "Even if the financial ROI looks negative (low risk probability), consider the 'Peace of Mind' dividend. Also, financial models cannot capture the value of avoiding physical pain and lost time.")
                                : "Mathematically, prevention is usually the winning strategy. The expected cost of the risk outweighs the small annual maintenance of checkups."}
                        </li>
                        <li>
                            Insurance plans often cover preventive visits at 100% (no co-pay), making your "Visit Cost" effectively $0, which drives the ROI of prevention to infinity.
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
                        More tools for health and wealth
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/chronic-condition-lifetime-cost-calculator" className="text-primary hover:underline">
                                    Chronic Costs
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Lifetime impact
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/medical-equipment-depreciation-estimator" className="text-primary hover:underline">
                                    Equipment Value
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Asset tracking
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/employer-health-plan-tax-savings-calculator" className="text-primary hover:underline">
                                    Health Taxes
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Section 125 savings
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/prescription-generic-savings-calculator" className="text-primary hover:underline">
                                    Med Savings
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Generic options
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="Doctor Visit ROI: The Economics of Preventive Care" />
                <meta itemProp="description" content="Calculate the financial return on investment of regular doctor checkups. Compare the low cost of prevention against the high cost of reactive medical treatments." />
                <meta itemProp="keywords" content="preventive care roi, cost of checkup vs surgery, value of early detection, health economics, medical financial planning" />
                <meta itemProp="author" content="MegaCalc Financial Team" />
                <meta itemProp="datePublished" content="2025-12-09" />
                <meta itemProp="url" content="/doctor-visit-roi-guide" />

                <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6" itemProp="headline">Doctor Visit ROI: Why Prevention is your Best Investment</h1>
                <p className="text-xl italic text-muted-foreground mb-8">We often treat health as an expense, but preventive care is an asset class with massive returns.</p>

                <div className="bg-muted p-6 rounded-lg mb-8">
                    <h3 className="font-semibold text-foreground mb-2">Key Takeaways</h3>
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>An Ounce of Prevention:</strong> The old adage holds fiscally true; catching hypertension early costs pennies a day in generic meds vs. hundreds of thousands for a bypass surgery later.</li>
                        <li><strong>Expected Value (EV):</strong> Financial risk isn't just "Will it happen?" but "Probability × Cost". A 10% chance of a $50,000 heart attack is a $5,000 liability <em>right now</em>.</li>
                        <li><strong>Time Horizon:</strong> Health investments compound. A decade of checkups creates a "health record" baseline that allows doctors to spot subtle dangerous trends early.</li>
                    </ul>
                </div>

                <h2 className="text-3xl font-bold text-foreground mt-10 mb-6">Table of Contents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-primary font-medium">
                    <a href="#preventive-cost" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The True Cost of Prevention</a>
                    <a href="#reactive-cost" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The "Reactive" Nightmare</a>
                    <a href="#math-of-risk" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The Math of Risk (Expected Value)</a>
                    <a href="#intangibles" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Intangible Returns</a>
                    <a href="#insurance-role" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Role of Insurance</a>
                    <a href="#case-studies" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Case Studies</a>
                </div>
                <hr className="my-8" />

                <h2 id="preventive-cost" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">1. The True Cost of Prevention</h2>
                <p className="mb-4">Why do people skip checkups? "It costs too much" or "I don't have time." Let's break down the actual cost.</p>
                <p className="mb-4">An average primary care visit costs $150–$200 out of pocket. If you go once a year for 20 years, that is a total investment of $3,000–$4,000. In the grand scheme of lifetime earnings, this is negligible (equivalent to one decent used car). </p>
                <p className="mb-4">However, this "cost" buys you: blood panels, blood pressure monitoring, and cancer screenings. It is a maintenance fee for the most valuable machine you own—your body.</p>

                <h2 id="reactive-cost" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">2. The "Reactive" Nightmare</h2>
                <p className="mb-4">Reactive medicine is what happens when something breaks. It is urgent, complex, and expensive.</p>
                <ul className="list-disc ml-6 mb-6 space-y-2">
                    <li><strong>Diabetes:</strong> Undiagnosed pre-diabetes can lead to Type 2 Diabetes. Lifetime cost? Estimated at $85,000+ for meds, testing, and complications.</li>
                    <li><strong>Heart Disease:</strong> A sudden heart attack isn't just risky; the average cost of a hospital admission for an acute myocardial infarction is over $20,000, not counting lost wages or rehabilitation.</li>
                    <li><strong>Cancer:</strong> Stage 1 Colon Cancer treatment might cost $25,000. Stage 4 treatment easily exceeds $150,000, with far worse outcomes.</li>
                </ul>

                <h2 id="math-of-risk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">3. The Math of Risk (Expected Value)</h2>
                <p className="mb-4">Humans are bad at estimating low-probability, high-cost risks. We ignore them. Insurance companies don't.</p>
                <p className="mb-4">This calculator uses the concept of <strong>Expected Value (EV)</strong>. </p>
                <div className="bg-muted p-4 rounded-lg my-4 font-mono text-sm">
                    EV = (Cost of Event) × (Probability of Event)
                </div>
                <p className="mb-4">If you have a 20% genetic risk of high blood pressure requiring hospitalization ($30,000), your "risk liability" is $6,000. If spending $200/year on checkups reduces that risk to 5%, your liability drops to $1,500. You have effectively "earned" $4,500 in risk reduction for a small input cost.</p>

                <h2 id="intangibles" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">4. Intangible Returns</h2>
                <p className="mb-4">Financial ROI is easy to calculate, but the real ROI is quality of life.</p>
                <p className="mb-4"><strong>Productivity:</strong> Healthy people earn more. Unchecked chronic conditions lead to fatigue, sick days, and "presenteeism" (being at work but not functioning). The income lost from poor health often dwarfs the direct medical costs.</p>
                <p className="mb-4"><strong>Time:</strong> Recovering from a major surgery takes weeks or months. A checkup takes an hour. What is your time worth?</p>

                <h2 id="insurance-role" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">5. Role of Insurance</h2>
                <p className="mb-4">Under the Affordable Care Act (ACA) in the US, most preventive services are covered at 100% with no copay or deductible when using in-network providers.</p>
                <p className="mb-4">This means for many people, the "Visit Cost" input in this calculator is actually <strong>$0</strong>. In this scenario, the financial ROI of prevention is infinite. You are getting risk reduction and health maintenance for free.</p>

                <h2 id="case-studies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">6. Case Studies</h2>

                <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">Case A: The "Invincible" 30-Year-Old</h3>
                <p className="mb-4">John skips checkups for 10 years to save $1,500. At 40, his undiagnosed hypertension causes kidney damage. He now requires medication and specialists for life. <strong>Net Loss: -$40,000+</strong></p>

                <h3 className="text-xl font-semibold text-foreground mt-4 mb-2">Case B: The Vigilant Patient</h3>
                <p className="mb-4">Sarah spends $2,000 on checkups over 10 years. At 35, her doctor notices creeping glucose levels. She changes her diet (cost: $0). She avoids diabetes entirely. <strong>Net Gain: +$85,000 (avoided cost)</strong>.</p>

                <p className="mt-12 text-muted-foreground">
                    <strong>Disclaimer:</strong> This calculator offers a simplified financial look at health risks. Probabilities and costs vary wildly by individual genetics, location, and insurance coverage. It is not medical advice. Visit a doctor.
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
                            <h4 className="font-semibold mb-2">How accurate are these risk %?</h4>
                            <p className="text-muted-foreground text-sm">
                                They are estimates. You should ask your doctor: "What is my 10-year risk for cardiovascular disease?" (e.g., typical ASCVD risk score).
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Why define "Time Horizon"?</h4>
                            <p className="text-muted-foreground text-sm">
                                Preventive care is a long game. The benefits often don't show up for 5, 10, or 20 years, unlike treating a broken arm.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Is prevention always cheaper?</h4>
                            <p className="text-muted-foreground text-sm">
                                Not always on a population level (screening everyone for a rare disease is costly), but for common conditions (blood pressure, diabetes), it is overwhelmingly cheaper.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Does insurance affect this?</h4>
                            <p className="text-muted-foreground text-sm">
                                Huge factor. If you have insurance, preventive care is usually free, making the ROI incredibly high.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">What counts as "Reactive Cost"?</h4>
                            <p className="text-muted-foreground text-sm">
                                Direct medical bills (surgery, hospital stay, ER visit) plus indirect costs like lost wages during recovery.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Is dental included?</h4>
                            <p className="text-muted-foreground text-sm">
                                The math is the exact same. A $150 cleaning prevents a $2,000 root canal.
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
                    <p>This Doctor Visit ROI Calculator treats your health like a financial asset. It demonstrates that the small, regular "maintenance cost" of checkups is negligible compared to the "catastrophic failure cost" of untreated illness.</p>
                    <p>By inputting the probability of genetic or lifestyle risks, you can see the Expected Financial Value of staying ahead of the curve.</p>
                    <p>Use this tool to justify the time and expense of annual physicals—not just for your health, but for your wallet.</p>
                </CardContent>
            </Card>
        </div>
    );
}
