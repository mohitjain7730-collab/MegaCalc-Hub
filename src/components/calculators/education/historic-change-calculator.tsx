'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateHistoricChange } from '@/lib/calculators';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, TrendingUp, TrendingDown, Percent, ArrowDown, ArrowUp, ArrowRight } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';

const formSchema = z.object({
    oldValue: z.coerce.number().refine(val => val !== 0, { message: 'Original value cannot be zero.' }),
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
    { name: 'Investment Growth', href: '/investment-growth-calculator' },
    { name: 'Percentage of a Percentage', href: '/percentage-of-a-percentage-calculator' },
    { name: 'Percentage Point', href: '/percentage-point-calculator' },
    { name: 'Percent Error', href: '/percent-error-calculator' },
    { name: 'Percent to Goal', href: '/percent-to-goal-calculator' },
    { name: 'Relative Change', href: '/relative-change-calculator' },
    { name: 'Slope Percentage', href: '/slope-percentage-calculator' },
    { name: 'Time Percentage', href: '/time-percentage-calculator' },
    { name: 'Value Percentage', href: '/value-percentage-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function HistoricChangeCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateHistoricChange> | null>(null);
    const animatedChange = useCountUp(result ? parseFloat(result.change) : 0);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            oldValue: undefined,
            newValue: undefined,
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateHistoricChange(data.oldValue, data.newValue);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Historic Change Calculator</CardTitle>
                    <CardDescription>
                        Calculate the percentage change (increase or decrease) from an original value to a new value.
                    </CardDescription>
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
                                            <FormLabel className="flex items-center gap-2">Original Value (Old)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 80" {...field} value={field.value ?? ''} />
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
                                            <FormLabel className="flex items-center gap-2">New Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Change</Button>
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
                        <div className="p-6 bg-primary/10 rounded-lg flex items-center justify-center gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Percentage Change</p>
                                <p className={`text-4xl font-bold ${result.direction === 'increase' ? 'text-accent' : result.direction === 'decrease' ? 'text-destructive' : 'text-primary'}`}>{animatedChange}%</p>
                            </div>
                            {result.direction === 'increase' && <ArrowUp className="w-12 h-12 text-accent" />}
                            {result.direction === 'decrease' && <ArrowDown className="w-12 h-12 text-destructive" />}
                            {result.direction === 'none' && <ArrowRight className="w-12 h-12 text-primary" />}
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
                        <p className="text-muted-foreground">This is the starting point or reference value. It's the "before" in a "before and after" scenario. For example, last year's sales, a product's original price, or your starting weight.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">New Value</h3>
                        <p className="text-muted-foreground">This is the ending point or the value you want to compare against the original. For example, this year's sales, the discounted price, or your current weight.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The percentage change formula is a fundamental tool for analyzing trends. It measures the degree of change over time. The key is that the change is always calculated relative to the original value, making it a directional comparison.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Change = ((New Value - Original Value) / Original Value) * 100</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">A positive result indicates a percentage increase, while a negative result indicates a percentage decrease.</p>
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
                    <CardTitle>The Importance of a Baseline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Why the "Original Value" is Your Anchor</h2>
                    <p>In the world of data analysis, context is everything. A number on its own—like "sales grew by $10,000"—is almost meaningless. Is that a lot or a little? The answer depends entirely on the starting point. The Historic Change Calculator is built on this fundamental principle: all meaningful change is measured against a baseline.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Asymmetry of Growth and Decline</h3>
                    <p>A fascinating and often confusing aspect of percentage change is its asymmetry. Let's illustrate with an example:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>An investment of $100 grows to $150. Using the formula `((150 - 100) / 100) * 100`, we get a **50% increase**.</li>
                        <li>The same investment then falls from $150 back to $100. Using the formula `((100 - 150) / 150) * 100`, we get a **33.3% decrease**.</li>
                    </ul>
                    <p>It didn't take a 50% decrease to wipe out a 50% gain. This happens because the baseline (the denominator in our formula) changed. The gain was calculated off a smaller base ($100), while the loss was calculated off a larger base ($150). This is a critical concept in finance and investing, highlighting why recovering from a loss requires a larger percentage gain than the loss itself.</p>

                    <h3 className="text-lg font-semibold text-foreground">Common Applications</h3>
                    <p>This calculation is one of the most common in finance, business, and science:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Financial Reporting:</strong> Companies report revenue growth or decline quarter-over-quarter or year-over-year.</li>
                        <li><strong>Economic Data:</strong> Governments announce the percentage change in GDP, inflation, or unemployment rates.</li>
                        <li><strong>Performance Metrics:</strong> A marketing team might track the percentage change in website traffic or conversion rates.</li>
                        <li><strong>Personal Finance:</strong> Calculating the percentage change in your investment portfolio's value or your net worth.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Why can't the original value be zero?</AccordionTrigger>
                            <AccordionContent>
                                <p>The formula for percentage change involves dividing by the original value. In mathematics, division by zero is undefined. There's no logical way to calculate a percentage change from a starting point of zero. For example, if you start with $0 and now have $100, what is the percentage increase? It's infinite, which isn't a useful measure.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What's the difference between this and the Comparative Difference Calculator?</AccordionTrigger>
                            <AccordionContent>
                                <p>This calculator is for directional, "before-and-after" comparisons. The Comparative Difference calculator is for non-directional comparisons where neither value is a starting point. For example, use this to compare last year's sales to this year's. Use the comparative tool to compare this year's sales for Store A versus Store B.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Can I calculate the original value if I know the new value and the percentage change?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes, you can rearrange the formula. To find the original value, you would use: `Original Value = New Value / (1 + (Percentage Change / 100))`. For example, if a product costs $120 after a 20% increase, the original price was `$120 / (1 + 0.20) = $100`.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Does a 100% decrease always result in zero?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. A 100% decrease means the new value has been reduced by an amount equal to the original value. `New Value = Original Value - (1.00 * Original Value)`, which will always be zero.</p>
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
                    <p className="text-muted-foreground">The Historic Change Calculator is a vital tool for analyzing trends and measuring performance over time. By quantifying the change from a past value to a present one, it provides crucial context for financial reports, economic data, and personal progress tracking. Understanding how to calculate percentage change is a fundamental skill for making informed decisions based on data.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
