'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateValuePercentage } from '@/lib/calculators';
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
import { HelpCircle, Sigma } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';

const formSchema = z.object({
    percentage: z.coerce.number().min(0, "Percentage can't be negative."),
    totalValue: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators: { name: string; href: string }[] = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/category/education/maths/comparative-difference-calculator' },
    { name: 'Compounding Increase', href: '/category/education/maths/compounding-increase-calculator' },
    { name: 'Doubling Time', href: '/category/education/maths/doubling-time-calculator' },
    { name: 'Fraction to Percent', href: '/category/education/maths/fraction-to-percent-calculator' },
    { name: 'Fuel Cost', href: '/category/education/maths/fuel-cost-calculator' },
    { name: 'Historic Change', href: '/category/education/maths/historic-change-calculator' },
    { name: 'Investment Growth', href: '/category/education/maths/investment-growth-calculator' },
    { name: 'Percentage of a Percentage', href: '/category/education/maths/percentage-of-a-percentage-calculator' },
    { name: 'Percentage Point', href: '/category/education/maths/percentage-point-calculator' },
    { name: 'Percent Error', href: '/category/education/maths/percent-error-calculator' },
    { name: 'Percent to Goal', href: '/category/education/maths/percent-to-goal-calculator' },
    { name: 'Relative Change', href: '/category/education/maths/relative-change-calculator' },
    { name: 'Slope Percentage', href: '/category/education/maths/slope-percentage-calculator' },
    { name: 'Time Percentage', href: '/category/education/maths/time-percentage-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function ValuePercentageCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateValuePercentage> | null>(null);
    const animatedValue = useCountUp(result ? parseFloat(result.value) : 0);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            percentage: undefined,
            totalValue: undefined,
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateValuePercentage(data.percentage, data.totalValue);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Value Percentage Calculator</CardTitle>
                    <CardDescription>
                        Find the actual value of a percentage of any given number.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="percentage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">Percentage (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="totalValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">Total Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 200" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Value</Button>
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
                        <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">{form.getValues('percentage')}% of {form.getValues('totalValue')} is</p>
                            <p className="text-4xl font-bold text-primary">{animatedValue}</p>
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
                        <h3 className="font-semibold text-lg">Percentage (%)</h3>
                        <p className="text-muted-foreground">The portion of the total you want to find. For example, if you want to find what 20% of a number is, you would enter 20.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Total Value</h3>
                        <p className="text-muted-foreground">The whole amount that you are taking the percentage of. For example, if you're calculating a 15% tip on a $50 bill, the total value is 50.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The core of this calculation is converting the percentage into a decimal and then multiplying it by the total value. It's one of the most foundational concepts in arithmetic, used daily in countless situations.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Result = (Percentage / 100) * Total Value</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">For instance, to find 25% of 200, the calculator computes (25 / 100) * 200, which equals 50.</p>
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
                    <CardTitle>A Practical Guide to Percentages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground font-title">Making "Percent" Make Sense</h2>
                    <p>The word "percent" comes from the Latin "per centum," meaning "by the hundred." It's simply a shorthand way of expressing a fraction of 100. This concept is a pillar of mathematics and is essential for navigating daily life, from shopping and tipping to understanding statistics and finance. This calculator is designed to be a quick and easy tool for this fundamental task.</p>

                    <h3 className="text-lg font-semibold text-foreground">Common Real-World Uses</h3>
                    <p>You probably use this type of calculation more often than you think:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Tipping at Restaurants:</strong> If your bill is $78 and you want to leave a 20% tip, you're calculating (20 / 100) * 78 to find out you should leave $15.60.</li>
                        <li><strong>Calculating Sales Tax:</strong> If an item costs $150 and the sales tax is 7%, the tax amount is (7 / 100) * 150 = $10.50. Your total cost would be $160.50.</li>
                        <li><strong>Understanding Statistics:</strong> When a news report says "45% of 1,200 survey respondents agreed," you can quickly find the exact number: (45 / 100) * 1200 = 540 people.</li>
                        <li><strong>Figuring Out Commissions:</strong> A salesperson earning a 5% commission on a $10,000 sale would calculate their earning as (5 / 100) * 10,000 = $500.</li>
                        <li><strong>Nutritional Information:</strong> If a 2,000-calorie diet is your baseline, and a snack contains "15% of your daily value," that snack has (15 / 100) * 2000 = 300 calories.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">"Percentage of" vs. "Percentage Change"</h3>
                    <p>It's important to distinguish this calculation from others. This calculator answers the question: "What is X percent *of* Y?" It gives you a static value. Other tools, like our Historic Change Calculator, answer a different question: "What is the percentage change *from* X *to* Y?" That type of calculation measures growth or decline, while this one simply finds a part of a whole.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How do I find what percentage one number is of another?</AccordionTrigger>
                            <AccordionContent>
                                <p>That's the reverse calculation. To find what percentage 'A' is of 'B', you would use the formula `(A / B) * 100`. For example, to find what percentage 50 is of 200, you'd calculate (50 / 200) * 100 = 25%.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Can I use this for percentages over 100%?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. Calculating a percentage over 100 is perfectly valid. For example, 150% of 200 is 300. This is often used in contexts of growth or when comparing something to a smaller baseline.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What's an easy way to calculate common percentages in my head?</AccordionTrigger>
                            <AccordionContent>
                                <p>Absolutely. For 10%, just move the decimal point one place to the left. For 5%, find 10% and cut it in half. For 20%, find 10% and double it. You can build up to almost any percentage this way.</p>
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
                    <p className="text-muted-foreground">The Value Percentage Calculator is your go-to tool for one of the most common mathematical tasks: finding a specific portion of a total. Whether you're calculating a tip, figuring out sales tax, or understanding a statistic, this calculator provides a quick and accurate answer, turning an abstract percentage into a concrete number.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
