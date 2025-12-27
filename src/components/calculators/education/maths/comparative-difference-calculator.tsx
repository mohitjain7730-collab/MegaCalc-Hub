'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateComparativeDifference } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Scale } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';

const formSchema = z.object({
    valueA: z.coerce.number().nonnegative('Value must be a non-negative number.'),
    valueB: z.coerce.number().nonnegative('Value must be a non-negative number.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Compounding Increase', href: '/category/education/maths/compounding-increase-calculator' },
    { name: 'Doubling Time', href: '/category/education/maths/doubling-time-calculator' },
    { name: 'Fraction to Percent', href: '/category/education/maths/fraction-to-percent-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function ComparativeDifferenceCalculator() {
    const [result, setResult] = useState<{ difference: string; percentageDifference: string } | null>(null);

    const differenceValue = result?.percentageDifference === 'Infinity' ? 0 : result ? parseFloat(result.percentageDifference) : 0;
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
                            <p className="text-4xl font-bold text-primary">{result.percentageDifference === 'Infinity' ? 'Infinity' : `${animatedDifference}%`}</p>
                            <p className="text-xs text-muted-foreground mt-2">Absolute Difference: {result.difference}</p>
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
                        <p className="text-muted-foreground">These are the two numbers you wish to compare.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Scale className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The comparative difference is calculated as the absolute difference divided by the average of the two numbers.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Difference = (|A - B| / ((A + B) / 2)) * 100</p>
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
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Why is the denominator the average?</AccordionTrigger>
                            <AccordionContent>
                                <p>This ensures the comparison is symmetrical and neutral, not favoring either value as the baseline.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
