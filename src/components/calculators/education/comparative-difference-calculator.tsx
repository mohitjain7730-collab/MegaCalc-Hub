'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateComparativeDifference } from '@/lib/calculators';
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
import { HelpCircle, Scale } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';

const formSchema = z.object({
    valueA: z.coerce.number().nonnegative('Value must be a non-negative number.'),
    valueB: z.coerce.number().nonnegative('Value must be a non-negative number.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators: { name: string; href: string }[] = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Compounding Increase', href: '/category/education/maths/compounding-increase-calculator' },
    { name: 'Doubling Time', href: '/category/education/maths/doubling-time-calculator' },
    { name: 'Fraction to Percent', href: '/category/education/maths/fraction-to-percent-calculator' },
    { name: 'Fuel Cost', href: '/category/education/maths/fuel-cost-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function ComparativeDifferenceCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateComparativeDifference> | null>(null);

    const differenceValue = result?.percentageDifference === 'N/A' ? 0 : result ? parseFloat(result.percentageDifference) : 0;
    const animatedDifference = useCountUp(differenceValue);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            valueA: undefined,
            valueB: undefined,
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateComparativeDifference(data.valueA, data.valueB);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Comparative Difference Calculator</CardTitle>
                    <CardDescription>
                        Calculate the percentage difference between two values relative to their average.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="valueA"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">Value A</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="valueB"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">Value B</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 120" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Difference</Button>
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
                            <p className="text-sm text-muted-foreground">Relative Percentage Difference</p>
                            <p className="text-4xl font-bold text-primary">{result.percentageDifference === 'N/A' ? 'N/A' : `${animatedDifference}%`}</p>
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
                        <h3 className="font-semibold text-lg">Value A & Value B</h3>
                        <p className="text-muted-foreground">These are the two numbers you wish to compare. The order does not matter as the calculation is symmetrical. This calculator is useful when you want to know how different two values are without implying one is an 'original' or 'new' value.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The comparative difference, also known as relative difference, is a way to express the difference between two numbers as a percentage of their average. This method treats both values equally, which is different from a standard percentage change calculation that uses one value as a fixed reference point.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Difference = (|Value A - Value B| / ((Value A + Value B) / 2)) * 100</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">This formula finds the absolute difference, divides it by the mean of the two values, and then multiplies by 100 to get a percentage.</p>
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
                    <CardTitle>When to Use Comparative vs. Historic Difference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Choosing the Right Tool for Comparison</h2>
                    <p>Percentage calculations can be confusing because the "correct" method depends entirely on the context and the question you're trying to answer. The two primary ways to compare values are Percentage Change (what our Historic Change and Sale Discount calculators do) and Percentage Difference (what this calculator does). Knowing which one to use is crucial for accurate analysis.</p>

                    <h3 className="text-lg font-semibold text-foreground">Percentage Change: A Directional Comparison</h3>
                    <p>Use a percentage change calculation when you have a clear "before" and "after" scenario. This method measures the change from an original or reference value to a new value. The formula is `((New - Old) / Old) * 100`.</p>
                    <p>Key characteristics:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>It is directional.</strong> The change from 100 to 150 is a 50% increase, but the change from 150 to 100 is a 33.3% decrease. The starting point matters.</li>
                        <li><strong>It is not symmetrical.</strong> As shown above, reversing the values does not simply reverse the sign of the percentage.</li>
                        <li><strong>Common Use Cases:</strong> Stock price movement, sales growth from one quarter to the next, calculating a discount from an original price.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">Percentage Difference: A Symmetrical Comparison</h3>
                    <p>Use a percentage difference calculation when you are comparing two values on equal footing, without designating one as the 'original' point. This method expresses the difference as a percentage of the average of the two values.</p>
                    <p>Key characteristics:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>It is symmetrical.</strong> The percentage difference between 100 and 150 is the same as the percentage difference between 150 and 100. The order of inputs does not change the result.</li>
                        <li><strong>It avoids bias.</strong> By using the average as the denominator, it doesn't give more weight to either value.</li>
                        <li><strong>Common Use Cases:</strong> Comparing statistics between two different groups (e.g., test scores of two schools), comparing measurements in a scientific experiment, or any situation where you want to know the magnitude of the difference without implying a temporal or causal relationship.</li>
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
                            <AccordionTrigger>Why is the denominator the average of the two numbers?</AccordionTrigger>
                            <AccordionContent>
                                <p>Using the average of the two numbers ensures that the comparison is neutral. If you used either Value A or Value B as the denominator (as in a percentage change calculation), you would be implying that one value is the 'correct' or 'original' reference point, which isn't the case in a symmetrical comparison.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Can the result be negative?</AccordionTrigger>
                            <AccordionContent>
                                <p>No. By definition, this formula uses the absolute difference (`|Value A - Value B|`), so the result is always a non-negative percentage representing the magnitude of the difference.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Is this the same as "relative error"?</AccordionTrigger>
                            <AccordionContent>
                                <p>The concept is very similar. In experimental science, "relative error" often compares an experimental value to a known or theoretical value. In that case, the theoretical value is typically used as the denominator. This calculator is for when there is no single 'correct' or theoretical value, and both numbers are of equal status.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>What happens if one value is zero?</AccordionTrigger>
                            <AccordionContent>
                                <p>If one value is zero (e.g., Value A = 0, Value B = 100), the calculation still works. The absolute difference is 100, the average is 50, so the percentage difference is (100 / 50) * 100 = 200%. This can seem counter-intuitive, but it correctly represents the relationship in the context of the formula.</p>
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
                    <p className="text-muted-foreground">The Comparative Difference Calculator is a specialized tool for situations where you need to compare two values on equal footing. Unlike a standard percentage change, it provides a symmetrical, unbiased measure of difference, making it ideal for statistical analysis, scientific comparison, and any scenario where there is no clear 'before' and 'after' value.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
