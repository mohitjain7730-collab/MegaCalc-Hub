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
import { Landmark, TrendingUp, DollarSign, Calendar, Activity, Info, FileText, ArrowRight, Table as TableIcon } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
    assetCost: z.number().positive(),
    salvageValue: z.number().min(0),
    usefulLife: z.number().positive().int(),
    method: z.enum(['straight-line', 'double-declining']),
});

type FormValues = z.infer<typeof formSchema>;

interface YearlyData {
    year: number;
    depreciationExpense: number;
    accumulatedDepreciation: number;
    bookValue: number;
}

interface CalculationResult {
    schedule: YearlyData[];
    totalDepreciation: number;
}

const formatNumberUS = (value: number, options: Intl.NumberFormatOptions = {}) =>
    value.toLocaleString('en-US', options);

export default function MedicalEquipmentDepreciationEstimator() {
    const [result, setResult] = useState<CalculationResult | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            assetCost: undefined,
            salvageValue: undefined,
            usefulLife: undefined,
            method: 'straight-line',
        },
    });

    const onSubmit = (values: FormValues) => {
        const { assetCost, salvageValue, usefulLife, method } = values;

        const schedule: YearlyData[] = [];
        let currentBookValue = assetCost;
        let accumulatedDepreciation = 0;

        for (let year = 1; year <= usefulLife; year++) {
            let depreciationExpense = 0;

            if (method === 'straight-line') {
                depreciationExpense = (assetCost - salvageValue) / usefulLife;
            } else {
                // Double Declining Balance
                const rate = 2 / usefulLife;
                depreciationExpense = currentBookValue * rate;

                // Adjust for salvage value limit
                if (currentBookValue - depreciationExpense < salvageValue) {
                    depreciationExpense = currentBookValue - salvageValue;
                }
            }

            // Ensure we don't over-depreciate (rounding errors or exact fit)
            if (currentBookValue - depreciationExpense < salvageValue) {
                depreciationExpense = Math.max(0, currentBookValue - salvageValue);
            }

            accumulatedDepreciation += depreciationExpense;
            currentBookValue -= depreciationExpense;

            schedule.push({
                year,
                depreciationExpense,
                accumulatedDepreciation,
                bookValue: currentBookValue,
            });

            if (currentBookValue <= salvageValue && method !== 'straight-line') break;
        }

        setResult({
            schedule,
            totalDepreciation: accumulatedDepreciation,
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Equipment Details
                    </CardTitle>
                    <CardDescription>
                        Enter asset information to calculate depreciation schedule
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="assetCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Asset Cost ($)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="e.g., 50000"
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
                                    name="salvageValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                Salvage Value ($)
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
                                    name="usefulLife"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                Useful Life (Years)
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
                                    name="method"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                Depreciation Method
                                            </FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select method" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="straight-line">Straight Line</SelectItem>
                                                    <SelectItem value="double-declining">Double Declining Balance</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Schedule
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Depreciation Results</CardTitle>
                            <CardDescription>
                                Financial overview of asset value over time
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="text-center p-6 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Depreciation</p>
                                    <p className="text-3xl font-bold">
                                        ${formatNumberUS(result.totalDepreciation, { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <div className="text-center p-6 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Final Book Value</p>
                                    <p className="text-3xl font-bold">
                                        ${formatNumberUS(result.schedule[result.schedule.length - 1].bookValue, { maximumFractionDigits: 0 })}
                                    </p>
                                </div>
                                <div className="text-center p-6 bg-muted/50 rounded-lg">
                                    <p className="text-sm font-medium text-muted-foreground mb-1">Method Used</p>
                                    <p className="text-xl font-bold capitalize">
                                        {form.getValues().method.replace('-', ' ')}
                                    </p>
                                </div>
                            </div>

                            <div className="h-80 w-full mb-8">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={result.schedule}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                                        <YAxis label={{ value: 'Book Value ($)', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(value: number) => [`$${formatNumberUS(value)}`, 'Book Value']} />
                                        <Legend />
                                        <Line type="monotone" dataKey="bookValue" stroke="#2563eb" strokeWidth={2} name="Book Value" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Year</TableHead>
                                            <TableHead>Depreciation Expense</TableHead>
                                            <TableHead>Accumulated Depreciation</TableHead>
                                            <TableHead className="text-right">Book Value</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.schedule.map((row) => (
                                            <TableRow key={row.year}>
                                                <TableCell>{row.year}</TableCell>
                                                <TableCell>${formatNumberUS(row.depreciationExpense)}</TableCell>
                                                <TableCell>${formatNumberUS(row.accumulatedDepreciation)}</TableCell>
                                                <TableCell className="text-right font-medium">${formatNumberUS(row.bookValue)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

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
                                    <strong>Tax Tip:</strong> Consult a CPA about Section 179 expensing, which may allow you to deduct the full purchase price in the first year.
                                </AlertDescription>
                            </Alert>
                            <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                <li>
                                    {form.getValues().method === 'double-declining'
                                        ? 'Double Declining Balance fronts-loads depreciation expenses. This can reduce taxable income significantly in the early years of ownership, useful if you expect higher profits now.'
                                        : 'Straight Line depreciation offers consistent, predictable deductions each year, which simplifies financial forecasting.'}
                                </li>
                                <li>
                                    Always track maintenance costs alongside depreciation to make informed "repair vs. replace" decisions as the asset ages.
                                </li>
                                <li>
                                    Ensure the estimated salvage value is realistic based on secondary market trends for this specific type of medical equipment.
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Landmark className="h-5 w-5" />
                        Related Calculators
                    </CardTitle>
                    <CardDescription>
                        More tools for practice management
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/category/finance/dental-implant-cost-recovery-calculator" className="text-primary hover:underline">
                                    Dental ROI
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Procedure profitability
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/category/finance/doctor-visit-roi-calculator" className="text-primary hover:underline">
                                    Preventive ROI
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                prevention vs cure
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/category/finance/loan-to-value-ltv-ratio-calculator" className="text-primary hover:underline">
                                    Practice Loan
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Expansion financing
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <h4 className="font-semibold mb-2">
                                <a href="/category/finance/employer-health-plan-tax-savings-calculator" className="text-primary hover:underline">
                                    Tax Savings
                                </a>
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Staff benefits
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="Medical Equipment Depreciation: A Financial Guide for Healthcare Practices" />
                <meta itemProp="description" content="Understand how to calculate medical equipment depreciation, choose the right method (Straight Line vs. Double Declining), and maximize tax benefits for your practice." />
                <meta itemProp="keywords" content="medical equipment depreciation, straight line vs double declining, medical asset management, section 179 medical equipment, practice financial planning" />
                <meta itemProp="author" content="MegaCalc Financial Team" />
                <meta itemProp="datePublished" content="2025-12-09" />
                <meta itemProp="url" content="/medical-equipment-depreciation-guide" />

                <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6" itemProp="headline">Medical Equipment Depreciation: Maximizing Practice Assets</h1>
                <p className="text-xl italic text-muted-foreground mb-8">Why the value of your MRI machine on paper matters just as much as its clinical utility.</p>

                <div className="bg-muted p-6 rounded-lg mb-8">
                    <h3 className="font-semibold text-foreground mb-2">Executive Summary</h3>
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>Depreciation</strong> allows you to allocate the cost of expensive medical assets over their useful life, matching expenses to revenue.</li>
                        <li><strong>Straight Line</strong> offers simplicity and predictability, ideal for stable, long-term assets like exam tables.</li>
                        <li><strong>Double Declining Balance</strong> accelerates deductions, perfect for high-tech equipment (like ultrasound or lasers) that loses value quickly.</li>
                        <li><strong>Salvage Value</strong> is the estimated resale price at the end of the asset's life—do not depreciate below this amount.</li>
                    </ul>
                </div>

                <h2 className="text-3xl font-bold text-foreground mt-10 mb-6">Table of Contents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-primary font-medium">
                    <a href="#what-is-depreciation" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> What is Medical Depreciation?</a>
                    <a href="#methods" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Straight Line vs. Double Declining</a>
                    <a href="#useful-life" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Determining Useful Life</a>
                    <a href="#tax-implications" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Impact on Taxes & Cash Flow</a>
                    <a href="#replacement" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Planning for Replacement</a>
                    <a href="#technological-obsolescence" className="hover:underline flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Technological Obsolescence</a>
                </div>
                <hr className="my-8" />

                <h2 id="what-is-depreciation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">1. What is Medical Depreciation?</h2>
                <p className="mb-4">In healthcare, purchasing equipment—whether it's a $50,000 dental chair or a $1 million CT scanner—is a capital expenditure. You generally cannot deduct the entire cost in the year of purchase (unless using Section 179, discussed later). Instead, you "capitalize" the asset and write off a portion of the cost each year.</p>
                <p className="mb-4">This process, called <strong>depreciation</strong>, reflects the reality that assets wear out, become obsolete, and lose value over time. It allows your practice to report a more accurate profit figure by spreading the cost of the tool across the years it helps generate revenue.</p>

                <h2 id="methods" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">2. Straight Line vs. Double Declining Balance</h2>
                <p className="mb-4">Choosing the right method affects your financial statements and tax filings.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Straight Line Depreciation</h3>
                <p className="mb-4">This is the most common method. The expense is the same every year.</p>
                <p className="mb-4 bg-muted p-4 rounded-md font-mono text-sm">Formula: (Cost - Salvage Value) / Useful Life</p>
                <p className="mb-4"><strong>Best For:</strong> Furniture, patient beds, waiting room fixtures—items that wear out evenly over time.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Double Declining Balance (Accelerated)</h3>
                <p className="mb-4">This method writes off more cost in the early years and less in later years.</p>
                <p className="mb-4 bg-muted p-4 rounded-md font-mono text-sm">Formula: (Book Value at Start of Year) x (2 / Useful Life)</p>
                <p className="mb-4"><strong>Best For:</strong> Diagnostic computers, laser systems, software-dependent hardware—assets that lose value rapidly due to tech upgrades or heavy initial use.</p>

                <h2 id="useful-life" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">3. Determining Useful Life</h2>
                <p className="mb-4">How long will the equipment last? For tax purposes, the IRS has specific "recovery periods" (MACRS) for different asset classes. For internal book purposes, you should estimate the actual economic life.</p>
                <div className="overflow-x-auto my-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Asset Type</TableHead>
                                <TableHead>Typical Useful Life</TableHead>
                                <TableHead>Examples</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-medium">High-Tech Medical</TableCell>
                                <TableCell>5 Years</TableCell>
                                <TableCell>MRI, CT, Computers</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">General Equipment</TableCell>
                                <TableCell>7 Years</TableCell>
                                <TableCell>Exam tables, Lab centrigures</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-medium">Furniture</TableCell>
                                <TableCell>7-10 Years</TableCell>
                                <TableCell>Desks, Chairs, Cabinets</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <h2 id="tax-implications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">4. Impact on Taxes & Cash Flow</h2>
                <p className="mb-4">Depreciation is a "non-cash expense." It lowers your reported profit (and thus your tax bill) without requiring you to spend cash that year. This improves your practice's **Free Cash Flow**.</p>
                <p className="mb-4"><strong>Section 179 Deduction:</strong> In the US, this code allows specific businesses to deduct the <em>full purchase price</em> of qualifying equipment financed or purchased during the tax year, up to certain limits (over $1M). If you buy a $50,000 laser, you might be able to deduct the whole $50,000 immediately rather than waiting 5 years. This is a powerful tool for reducing tax liability in profitable years.</p>

                <h2 id="replacement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">5. Planning for Replacement</h2>
                <p className="mb-4">Calculating depreciation isn't just for taxes; it's a sinking fund planner. If you are depreciating a $100,000 X-ray machine over 10 years, you are essentially "using up" $10,000 of it annually. </p>
                <p className="mb-4"><strong>Best Practice:</strong> Ideally, your practice should set aside cash reserves equal to your depreciation expense. If you do this, by the time the asset is fully depreciated (Book Value = $0), you will have $100,000 in the bank to buy the new one without taking a loan.</p>

                <h2 id="technological-obsolescence" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">6. Technological Obsolescence</h2>
                <p className="mb-4">In medicine, functional life often exceeds technological life. A 10-year-old ultrasound machine might still turn on and work perfectly, but if the standard of care requires 4D imaging and yours only does 2D, the asset is obsolete.</p>
                <p className="mb-4">When estimating "Useful Life" for this calculator, be conservative. If technology in your specialty moves fast (e.g., dermatology lasers), choose a shorter life (3-5 years) to reflect the likely need for an upgrade, regardless of whether the machine physically breaks.</p>

                <p className="mt-12 text-muted-foreground">
                    <strong>Disclaimer:</strong> This tool provides general estimates for financial planning. Tax laws (especially MACRS and Section 179) are complex and subject to change. Always consult a concise qualified tax professional or accountant before making capital expenditure decisions.
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
                            <h4 className="font-semibold mb-2">What is Salvage Value?</h4>
                            <p className="text-muted-foreground text-sm">
                                It's the estimated resale value of the asset at the end of its useful life. You depreciate the cost *minus* this value.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Can I switch methods?</h4>
                            <p className="text-muted-foreground text-sm">
                                Generally, once you select a method for an asset for tax purposes, you stick with it. GAAP rules may allow changes if justified.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">What if I sell it early?</h4>
                            <p className="text-muted-foreground text-sm">
                                If you sell for more than the Book Value, you may have to pay "depreciation recapture" tax on the gain.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Is software depreciable?</h4>
                            <p className="text-muted-foreground text-sm">
                                Yes, software purchased for the practice is usually amortized (similar to depreciation) over a standard period, often 3 years (Section 197).
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">What is Book Value?</h4>
                            <p className="text-muted-foreground text-sm">
                                Book Value = Original Cost - Accumulated Depreciation. It represents the asset's remaining value on your balance sheet.
                            </p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Does land depreciate?</h4>
                            <p className="text-muted-foreground text-sm">
                                No. If you buy a practice building, you can depreciate the building structure, but never the land it sits on.
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
                    <p>This Medical Equipment Depreciation Estimator helps practice owners forecast the declining value of their assets.</p>
                    <p>By comparing Straight Line and Double Declining Balance methods, you can decide whether to prioritize consistent annual deductions or accelerate them to reduce immediate taxability.</p>
                    <p>Remember that maintaining an accurate depreciation schedule is critical for clear financial statements, insurance valuation, and timely equipment replacement strategies.</p>
                </CardContent>
            </Card>
        </div>
    );
}
