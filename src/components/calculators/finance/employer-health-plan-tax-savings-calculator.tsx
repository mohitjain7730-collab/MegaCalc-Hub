'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, TrendingUp, DollarSign, Calendar, Target, Info, Shield, ArrowRight, Briefcase } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
    monthlyPremium: z.number().positive(),
    federalTaxBracket: z.string(), // We'll parse this to number
    stateTaxRate: z.number().min(0).max(15),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    annualPremium: number;
    totalTaxSavings: number;
    effectiveAnnualCost: number;
    effectiveMonthlyCost: number;
    chartData: { name: string; value: number }[];
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
    value.toLocaleString('en-US', options);

export default function EmployerHealthPlanTaxSavingsCalculator() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            monthlyPremium: undefined,
            federalTaxBracket: undefined, // User requested blank
            stateTaxRate: undefined,
        },
    });

    const onSubmit = (values: FormValues) => {
        const { monthlyPremium, federalTaxBracket, stateTaxRate } = values;

        const fedRate = parseFloat(federalTaxBracket);
        const totalTaxRate = (fedRate + stateTaxRate + 7.65) / 100; // Including FICA (7.65%) for Section 125 plans
        // Note: Most employer plans (Section 125) are exempt from Federal, State, AND FICA taxes.

        const annualPremium = monthlyPremium * 12;
        const totalTaxSavings = annualPremium * totalTaxRate;
        const effectiveAnnualCost = annualPremium - totalTaxSavings;
        const effectiveMonthlyCost = effectiveAnnualCost / 12;

        const chartData = [
            { name: 'Effective Cost', value: effectiveAnnualCost },
            { name: 'Tax Savings', value: totalTaxSavings },
        ];

        setResult({
            annualPremium,
            totalTaxSavings,
            effectiveAnnualCost,
            effectiveMonthlyCost,
            chartData,
        });
    };

    const recommendationItems = result
        ? [
            `You save $${formatNumberUS(result.totalTaxSavings)} annually by paying premiums with pre-tax dollars.`,
            `Your effective monthly cost is only $${formatNumberUS(result.effectiveMonthlyCost)}, compared to the sticker price of $${formatNumberUS(form.getValues().monthlyPremium)}.`,
            'Check if your employer offers a Flexible Spending Account (FSA) or HSA to save even more on co-pays.',
            'Review your plan annually during open enrollment changes in premiums or tax status.',
        ]
        : [
            'Employer-sponsored premiums are typically deducted before taxes (Section 125).',
            'This reduces your taxable income, saving you Federal, State, and FICA taxes.',
            'Compare this "effective" cost when looking at private market plans (which use post-tax dollars).',
            'Don\'t forget to include state taxes for a more accurate estimate.',
        ];

    return (
        <div className="space-y-8">

            {/* Input Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Plan Details
                    </CardTitle>
                    <CardDescription>
                        Calculate your pre-tax savings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="monthlyPremium"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Monthly Premium ($)
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
                                    name="federalTaxBracket"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Landmark className="h-4 w-4" />
                                                Federal Tax Bracket (%)
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select bracket" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="10">10% (Income up to ~$11k)</SelectItem>
                                                    <SelectItem value="12">12% (Income ~$11k-$47k)</SelectItem>
                                                    <SelectItem value="22">22% (Income ~$47k-$100k)</SelectItem>
                                                    <SelectItem value="24">24% (Income ~$100k-$191k)</SelectItem>
                                                    <SelectItem value="32">32% (Income ~$191k-$243k)</SelectItem>
                                                    <SelectItem value="35">35% (Income ~$243k-$609k)</SelectItem>
                                                    <SelectItem value="37">37% (Income $609k+)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="stateTaxRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4" />
                                                State Tax Rate (%)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 5"
                                                    {...field}
                                                    value={field.value ?? ''}
                                                    onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                                                />
                                            </FormControl>
                                            <p className="text-xs text-muted-foreground">Estimate your marginal state rate.</p>
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
                                    <CardTitle>Tax Savings Analysis</CardTitle>
                                    <CardDescription>
                                        The power of pre-tax deductions
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        <span className="text-sm font-medium text-muted-foreground">Annual Savings</span>
                                    </div>
                                    <p className="text-3xl font-bold text-green-600">
                                        ${formatNumberUS(result.totalTaxSavings, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Money kept in your pocket
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-muted/50 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm font-medium text-muted-foreground">Effective Cost</span>
                                    </div>
                                    <p className="text-2xl font-bold">
                                        ${formatNumberUS(result.effectiveAnnualCost, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Real cost per year
                                    </p>
                                </div>

                                <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm font-medium text-muted-foreground">Monthly Real Cost</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">
                                        ${formatNumberUS(result.effectiveMonthlyCost, { maximumFractionDigits: 0 })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Compared to ${result.annualPremium / 12}
                                    </p>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Where Your Premium Goes</h3>
                                <div className="h-80 w-full flex justify-center">
                                    <ResponsiveContainer width={400} height="100%">
                                        <PieChart>
                                            <Pie
                                                data={result.chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                <Cell key="cell-0" fill="hsl(var(--primary))" />
                                                <Cell key="cell-1" fill="#4ade80" />
                                            </Pie>
                                            <Tooltip formatter={(value: number) => `$${formatNumberUS(value)}`} />
                                            <Legend />
                                        </PieChart>
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
                            Understanding Pre-Tax Premiums
                        </CardTitle>
                        <CardDescription>
                            How Section 125 plans save you money
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Triple Tax Savings
                                    </h4>
                                    <p className="text-muted-foreground">
                                        When premiums are deducted pre-tax, you lower your taxable income for: 1) Federal Income Tax, 2) Social Security & Medicare (FICA), and 3) Most State Income Taxes.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Buying Power
                                    </h4>
                                    <p className="text-muted-foreground">
                                        Paying $100 for insurance through your employer costs you less "take-home pay" than buying a $100 plan on your own because you'd have to earn ~$130 to have $100 left after taxes.
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
                            <strong>Total Tax Rate</strong> = Federal Rate + State Rate + 7.65% (FICA)
                        </p>
                        <p>
                            <strong>Annual Savings</strong> = (Monthly Premium × 12) × Total Tax Rate
                        </p>
                        <p>
                            <strong>Effective Cost</strong> = Annual Cost - Annual Savings
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
                                    <a href="/tax-equivalent-yield-calculator" className="text-primary hover:underline">
                                        Paycheck Calculator
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    See your net pay
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/monthly-budget-planner-calculator" className="text-primary hover:underline">
                                        Monthly Budget
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Plan expenses
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/retirement-savings-calculator" className="text-primary hover:underline">
                                        401k Calculator
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    More pre-tax savings
                                </p>
                            </div>
                            <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <h4 className="font-semibold mb-2">
                                    <a href="/savings-goal-timeline-calculator" className="text-primary hover:underline">
                                        Savings Goals
                                    </a>
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    Invest the difference
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Guide Section */}
                <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                    {/* SEO & SCHEMA METADATA */}
                    <meta itemProp="name" content="Employer Health Plan Tax Savings: The Ultimate Guide to Section 125 Plans" />
                    <meta itemProp="description" content="Paying for health insurance with pre-tax dollars is a massive financial advantage. Calculate your real savings, understand the FICA bonus, and maximize your take-home pay." />
                    <meta itemProp="keywords" content="pre-tax health insurance, section 125 plan tax savings, employer health insurance tax deduction, effective premium cost, payroll deduction savings, POP plan explained" />
                    <meta itemProp="author" content="MegaCalc Financial Team" />
                    <meta itemProp="datePublished" content="2025-12-09" />
                    <meta itemProp="url" content="/employer-health-tax-savings-guide" />

                    <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6" itemProp="headline">Employer Health Plan Tax Savings: Use Section 125 to Boost Your Paycheck</h1>
                    <p className="text-xl italic text-muted-foreground mb-8">Why a $400 monthly premium doesn't actually cost you $400—and why that matters for your budget.</p>

                    <div className="bg-muted p-6 rounded-lg mb-8">
                        <h3 className="font-semibold text-foreground mb-2">Key Concepts</h3>
                        <ul className="list-disc ml-6 space-y-2">
                            <li><strong>Section 125 "Cafeteria" Plans</strong> allow employees to pay for insurance premiums with <em>gross</em> (pre-tax) income.</li>
                            <li>This results in a "Triple Tax Shield": Savings on Federal Income Tax, State Income Tax, AND FICA Tax (Social Security & Medicare).</li>
                            <li>Because of this shield, the "effective cost" of an employer plan is often 20-40% lower than a comparable marketplace plan.</li>
                            <li>This is one of the few legal ways to reduce your Social Security tax liability.</li>
                        </ul>
                    </div>

                    <h2 className="text-3xl font-bold text-foreground mt-10 mb-6">Table of Contents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-primary font-medium">
                        <a href="#how-it-works" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> How Pre-Tax Deductions Work</a>
                        <a href="#triple-tax" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> The "Triple Tax Shield" Explained</a>
                        <a href="#marketplace" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Employer Plans vs. Marketplace (Post-Tax)</a>
                        <a href="#social-security" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Impact on Social Security Benefits</a>
                        <a href="#qualifying-events" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Locked In: Qualifying Life Events</a>
                        <a href="#maximization" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Tips to Maximize Savings</a>
                    </div>
                    <hr className="my-8" />

                    <h2 id="how-it-works" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">1. How Pre-Tax Deductions Work</h2>
                    <p className="mb-4">Ordinarily, you earn money, the government taxes it, and you spend what is left. This is "post-tax" spending. </p>
                    <p className="mb-4">A <strong>Premium Only Plan (POP)</strong>, authorized under IRS Section 125, flips this script for specific expenses. You agree to reduce your salary by the amount of the premium, and in exchange, your employer pays the insurer directly.</p>
                    <p className="mb-4"><strong>Example:</strong> You earn $5,000/month. Your insurance is $500.
                        <br /><em>Without Section 125:</em> You are taxed on $5,000. Then you pay $500.
                        <br /><em>With Section 125:</em> You are taxed on $4,500. The $500 effectively disappears from the IRS's view.</p>

                    <h2 id="triple-tax" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">2. The "Triple Tax Shield" Explained</h2>
                    <p className="mb-4">Most people know about Federal and State savings. The hidden gem is FICA.</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Shield 1: Federal Income Tax (10% - 37%)</h3>
                    <p className="mb-4">Depending on your bracket, you save anywhere from 10 cents to 37 cents on every dollar of premium.</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Shield 2: State Income Tax (0% - 13%)</h3>
                    <p className="mb-4">Most states conform to federal definition of taxable income. If it's pre-tax federal, it's usually pre-tax state (with some exceptions like NJ or PA for certain items).</p>

                    <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Shield 3: FICA (7.65%)</h3>
                    <p className="mb-4">This is the game changer. 401(k) contributions are exempt from income tax but <strong>NOT</strong> FICA. You still pay Social Security/Medicare on your 401(k) money. </p>
                    <p className="mb-4"><strong>Health insurance premiums are exempt from FICA.</strong> This is a flat 7.65% guaranteed return (6.2% Social Security + 1.45% Medicare) for almost everyone.</p>

                    <h2 id="marketplace" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">3. Employer Plans vs. Marketplace (Post-Tax)</h2>
                    <p className="mb-4">When comparing job offers or deciding between an employer plan and a spouse's plan, you must compare "apples to apples."</p>

                    <div className="overflow-x-auto my-8">
                        <table className="w-full border-collapse border border-border text-sm md:text-base">
                            <thead>
                                <tr className="bg-muted">
                                    <th className="border p-4 text-left">Feature</th>
                                    <th className="border p-4 text-left">Employer Plan (Section 125)</th>
                                    <th className="border p-4 text-left">Private/Marketplace Plan</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border p-4 font-medium">Payment Source</td>
                                    <td className="border p-4 text-green-700 font-bold">Pre-Tax Dollars</td>
                                    <td className="border p-4 text-red-700 font-bold">Post-Tax Dollars</td>
                                </tr>
                                <tr>
                                    <td className="border p-4 font-medium">Tax Deduction</td>
                                    <td className="border p-4">Automatic & Instant (100%)</td>
                                    <td className="border p-4">Only if itemizing &gt;7.5% AGI</td>
                                </tr>
                                <tr>
                                    <td className="border p-4 font-medium">FICA Savings</td>
                                    <td className="border p-4">Yes (7.65%)</td>
                                    <td className="border p-4">No</td>
                                </tr>
                                <tr>
                                    <td className="border p-4 font-medium">Real Cost of $500</td>
                                    <td className="border p-4">~$350 (depending on bracket)</td>
                                    <td className="border p-4">$500 + expected earnings tax</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 id="social-security" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">4. Impact on Social Security Benefits</h2>
                    <p className="mb-4">It is fair to ask: "If I pay less Social Security tax, will my benefits be lower when I retire?"</p>
                    <p className="mb-4"><strong>Technically, Yes. Practically, No.</strong></p>
                    <p className="mb-4">Social Security is calculated based on your "Average Indexed Monthly Earnings" (AIME) over your highest 35 earning years. Reducing your reported income slightly via health premiums might lower your eventual payout by a few dollars a month. However, the <strong>immediate cash savings</strong> (7.65% now) can be invested. If you invested those tax savings into a Roth IRA, the growth would likely far outpace the marginal reduction in Social Security benefits.</p>

                    <h2 id="qualifying-events" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">5. Locked In: Qualifying Life Events</h2>
                    <p className="mb-4">The IRS imposes strict rules on Section 125 plans. Because the election has tax consequences, you cannot just drop coverage whenever you want.</p>
                    <p className="mb-4">You can only change your election during Open Enrollment or a <strong>Qualifying Life Event (QLE)</strong>. Common QLEs include:</p>
                    <ul className="list-disc ml-6 mb-6 space-y-1">
                        <li>Marriage or Divorce.</li>
                        <li>Birth or Adoption of a child.</li>
                        <li>Spouse losing their job or insurance coverage.</li>
                        <li>Your child turning 26 and aging off the plan.</li>
                        <li>Moving to a new zip code (if it affects plan availability).</li>
                    </ul>

                    <h2 id="maximization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">6. Tips to Maximize Savings</h2>
                    <p className="mb-4"><strong>1. Stack with FSA/HSA:</strong> Health Savings Accounts (HSA) and Flexible Spending Accounts (FSA) are also Section 125 benefits. Contributions avoid Federal, State, and FICA taxes. Maxing these out is the most tax-efficient way to pay for medical care.</p>
                    <p className="mb-4"><strong>2. Check Spousal Surcharges:</strong> Some employers charge an extra fee (post-tax or pre-tax) if your spouse has coverage available elsewhere. Calculate the effective cost carefully.</p>
                    <p className="mb-4"><strong>3. Don't Over-insure:</strong> Since you are paying with pre-tax dollars, a higher premium "High Option" plan feels cheaper than it is. Don't buy a Platinum plan if a Bronze plan coupled with a robust HSA contribution leaves you wealthier at year-end.</p>

                    <p className="mt-12 text-muted-foreground">
                        <strong>Disclaimer:</strong> This article is for educational purposes. Tax laws are complex and subject to change. State laws vary (e.g., California, New Jersey). Consult a CPA or tax professional for advice specific to your financial situation.
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
                            Common questions about payroll deductions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">What is Section 125?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        It's the IRS code that allows Premium Only Plans (POP), letting employees pay insurance premiums with tax-free dollars.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Does this lower my salary?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Technically, it lowers your *taxable* salary, which is good for taxes. It does not affect your base pay rate.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Can domestic partners covered?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Usually, no. Unless your domestic partner qualifies as a tax dependent, the portion of the premium for them is taxable income (imputed income).
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">What about FSA/HSA?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        These are also pre-tax! Adding FSA or HSA contributions to your premium deductions further lowers your taxable income.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Do all employers offer this?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Most do, but small businesses aren't required to set up Section 125 plans. Ask your HR department if your premiums are pre-tax.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Can I change this anytime?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        No. Because of the tax status, you can only change elections during Open Enrollment or a Qualifying Life Event (marriage, birth, etc.).
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Effect on tax refund?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Since you pay less tax throughout the year, your refund might be slightly smaller, but your weekly take-home pay is higher.
                                    </p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold mb-2">Is Life Insurance pre-tax?</h4>
                                    <p className="text-muted-foreground text-sm">
                                        Group term life up to $50,000 is usually pre-tax. Coverage above that is often imputed income and taxable.
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
                        <p>This calculator demonstrates the significant tax advantages of employer-sponsored health plans paid via pre-tax payroll deductions.</p>
                        <p>By bypassing Federal, State, and FICA taxes, the effective cost of your health insurance is often 20-40% lower than the sticker price.</p>
                        <p>Use this "effective monthly cost" to make fair comparisons when weighing job offers or private insurance alternatives.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
