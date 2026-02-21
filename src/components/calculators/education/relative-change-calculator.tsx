'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateRelativeChange } from '@/lib/calculators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, TrendingUp, TrendingDown, Sigma } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';

const formSchema = z.object({
    oldValue: z.coerce.number().refine(n => n !== 0, 'Original value cannot be zero.'),
    newValue: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators: { name: string; href: string }[] = [
    { name: 'Average Percentage', href: '/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/comparative-difference-calculator' },
    { name: 'Compounding Increase', href: '/compounding-increase-calculator' },
    { name: 'Doubling Time', href: '/doubling-time-calculator' },
    { name: 'Fraction to Percent', href: '/fraction-to-percent-calculator' },
    { name: 'Fuel Cost', href: '/fuel-cost-calculator' },
    { name: 'Historic Change', href: '/historic-change-calculator' },
    { name: 'Investment Growth', href: '/investment-growth-calculator' },
    { name: 'Percentage of a Percentage', href: '/percentage-of-a-percentage-calculator' },
    { name: 'Percentage Point', href: '/percentage-point-calculator' },
    { name: 'Value Percentage', href: '/value-percentage-calculator' },
    { name: 'Percent Error', href: '/percent-error-calculator' },
    { name: 'Percent to Goal', href: '/percent-to-goal-calculator' },
    { name: 'Slope Percentage', href: '/slope-percentage-calculator' },
    { name: 'Time Percentage', href: '/time-percentage-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function RelativeChangeCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateRelativeChange> | null>(null);
    const animatedChange = useCountUp(result ? parseFloat(result.change) : 0);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { oldValue: undefined, newValue: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateRelativeChange(data.oldValue, data.newValue);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Relative Change Calculator</CardTitle>
                    <CardDescription>Calculate the relative change (percentage increase or decrease) from an original value to a new value.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="oldValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Original Value (Old)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="newValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 125" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Relative Change</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Calculation Result</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className={`p-6 rounded-lg ${result.direction === 'increase' ? 'bg-accent/20' : result.direction === 'decrease' ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                            <p className="text-sm text-muted-foreground">Relative Change</p>
                            <div className="flex items-center justify-center gap-2">
                                <p className={`text-4xl font-bold ${result.direction === 'increase' ? 'text-accent' : result.direction === 'decrease' ? 'text-destructive' : 'text-primary'}`}>{animatedChange}%</p>
                                {result.direction === 'increase' && <TrendingUp className="w-8 h-8 text-accent" />}
                                {result.direction === 'decrease' && <TrendingDown className="w-8 h-8 text-destructive" />}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" />Understanding the Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Original Value (Old)</h3>
                        <p className="text-muted-foreground">The starting point, baseline, or reference value from which the change is measured.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">New Value</h3>
                        <p className="text-muted-foreground">The final value that you are comparing to the original value.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Relative change, also known as percentage change, quantifies the change from one value to another as a percentage of the original value. This makes it a directional measure.</p>
                    <div className="p-4 bg-muted/50 rounded-lg mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Relative Change = ((New Value - Original Value) / Original Value) × 100</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Related Calculators</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedCalculators.map((calc) => (
                        <Link href={calc.href} key={calc.name} className="block hover:no-underline">
                            <Card className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors h-full text-center">
                                <span className="font-semibold">{calc.name}</span>
                            </Card>
                        </Link>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>In-Depth Guide to Relative Change</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground font-title">The Importance of a Reference Point</h2>
                    <p>Relative change is one of the most fundamental concepts in data analysis, finance, and science. It provides context to raw numbers. A statement like "the company's profit increased by $1 million" is less informative than "the company's profit increased by 20%." The percentage provides a standardized measure of growth relative to the company's previous size. A $1 million increase is phenomenal for a small startup but might be a rounding error for a massive corporation.</p>
                    <p>This calculator is functionally identical to our **Historic Change Calculator**. The terms "relative change" and "historic change" or "percentage change" are often used interchangeably. They all measure the change from a past or original value to a new one, anchored to that original value.</p>

                    <h2 className="text-xl font-bold text-foreground font-title">Relative Change vs. Absolute Change</h2>
                    <p>It's vital to distinguish between relative and absolute change.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>**Absolute Change**: This is the simple difference between the new and old values (`New Value - Old Value`). If a stock goes from $100 to $120, the absolute change is +$20.</li>
                        <li>**Relative Change**: This expresses the absolute change as a percentage of the original value. For the same stock, the relative change is `($20 / $100) * 100 = +20%`.</li>
                    </ul>
                    <p>Consider another stock that goes from $10 to $30. It also has an absolute change of +$20. However, its relative change is `($20 / $10) * 100 = +200%`. While both stocks made the same absolute dollar amount, the second stock had a much more significant growth story in relative terms.</p>

                    <h2 className="text-xl font-bold text-foreground font-title">The Asymmetry of Gains and Losses</h2>
                    <p>A key characteristic of relative change is that gains and losses are not symmetrical. This is a crucial concept, especially in finance.</p>
                    <p>Imagine you invest $1,000:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>A **50% loss** means your investment drops to $500 (`$1000 * (1 - 0.50)`).</li>
                        <li>To get back to your original $1,000 from $500, you now need a **100% gain** (`$500 * (1 + 1.00) = $1000`).</li>
                    </ul>
                    <p>The larger the percentage loss, the exponentially larger the percentage gain required to break even. This is because the loss is calculated on a larger base amount, while the subsequent gain is calculated on the new, smaller base.</p>
                    <div className="w-full overflow-x-auto shadow-sm border rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-left font-semibold text-foreground">
                                <tr>
                                    <th className="p-3 border-b">Initial Loss</th>
                                    <th className="p-3 border-b">Gain Needed to Break Even</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b"><td className="p-3">10%</td><td className="p-3">11.1%</td></tr>
                                <tr className="border-b"><td className="p-3">25%</td><td className="p-3">33.3%</td></tr>
                                <tr className="border-b"><td className="p-3">50%</td><td className="p-3">100%</td></tr>
                                <tr className="border-b"><td className="p-3">75%</td><td className="p-3">300%</td></tr>
                                <tr><td className="p-3">90%</td><td className="p-3">900%</td></tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What's the difference between this and the "Comparative Difference Calculator"?</AccordionTrigger>
                            <AccordionContent>
                                <p>This calculator measures directional change from a specific starting point (Old Value). The result can be positive or negative. The Comparative Difference Calculator measures the difference between two values symmetrically, using their average as the reference point, and the result is always positive.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Why is the original value not allowed to be zero?</AccordionTrigger>
                            <AccordionContent>
                                <p>The formula for relative change involves dividing by the original value. In mathematics, division by zero is an undefined operation. It's impossible to calculate a percentage change from a starting point of nothing.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What if both values are negative?</AccordionTrigger>
                            <AccordionContent>
                                <p>The formula works correctly with negative numbers. For example, if a company's debt changes from -$100 million to -$120 million, the relative change is `(( -120 - (-100)) / -100) * 100 = 20%`. This indicates a 20% increase in the magnitude of the debt.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How do I find the new value if I know the old value and the relative change?</AccordionTrigger>
                            <AccordionContent>
                                <p>You can rearrange the formula: `New Value = Old Value * (1 + (Relative Change / 100))`. For example, if an item costing $80 had a 25% price increase, the new price is `$80 * (1 + (25 / 100)) = $100`.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Is "relative change" the same as "Return on Investment" (ROI)?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes, in its simplest form. If the "Old Value" is your initial investment and the "New Value" is the final value of that investment, the calculated relative change is exactly the ROI. Our 'Investment Growth Calculator' uses the same formula but frames it specifically for that context.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        The Relative Change Calculator is a crucial tool for understanding and contextualizing change between two data points. By expressing the difference as a percentage of the original value, it provides a standardized measure of growth or decline that is essential for analysis in finance, economics, and science. It highlights the importance of a baseline for measuring change and demonstrates the asymmetrical nature of percentage gains and losses.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
