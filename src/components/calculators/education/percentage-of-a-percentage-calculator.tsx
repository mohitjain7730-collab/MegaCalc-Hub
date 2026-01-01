'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculatePercentageOfPercentage } from '@/lib/calculators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Percent, Sigma } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
    percentage1: z.coerce.number(),
    percentage2: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators: { name: string; href: string }[] = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/category/education/maths/comparative-difference-calculator' },
    { name: 'Compounding Increase', href: '/category/education/maths/compounding-increase-calculator' },
    { name: 'Doubling Time', href: '/category/education/maths/doubling-time-calculator' },
    { name: 'Fraction to Percent', href: '/category/education/maths/fraction-to-percent-calculator' },
    { name: 'Historic Change', href: '/category/education/maths/historic-change-calculator' },
    { name: 'Investment Growth', href: '/category/education/maths/investment-growth-calculator' },
    { name: 'Percentage Point', href: '/category/education/maths/percentage-point-calculator' },
    { name: 'Percent Error', href: '/category/education/maths/percent-error-calculator' },
    { name: 'Percent to Goal', href: '/category/education/maths/percent-to-goal-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function PercentageOfPercentageCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculatePercentageOfPercentage> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { percentage1: undefined, percentage2: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculatePercentageOfPercentage(data.percentage1, data.percentage2);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Percentage of a Percentage Calculator</CardTitle>
                    <CardDescription>Calculate what one percentage of another percentage equals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <FormField
                                    control={form.control}
                                    name="percentage1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>What is [X]%</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="percentage2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>of [Y]%?</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 20" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate</Button>
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
                            <p className="text-sm text-muted-foreground">{form.getValues('percentage1')}% of {form.getValues('percentage2')}% is</p>
                            <p className="text-4xl font-bold text-primary">{result.result}%</p>
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
                        <h3 className="font-semibold text-lg">Percentage X and Percentage Y</h3>
                        <p className="text-muted-foreground">These are the two percentages you want to combine. The calculator finds X percent of Y percent, which is useful for nested proportions.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>To find a percentage of a percentage, you must first convert both percentages into their decimal equivalents by dividing each by 100. Then, you multiply these two decimals together. Finally, to express the result as a percentage again, you multiply it by 100.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Result % = (Percentage1 / 100) * (Percentage2 / 100) * 100</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">This simplifies to `(Percentage1 * Percentage2) / 100`.</p>
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
                    <CardTitle>A Guide to Understanding Nested Proportions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">What Does "Percent of a Percent" Really Mean?</h2>
                    <p>This calculation is an essential tool for dealing with data that involves a **subset of a subset**.</p>

                    <Alert>
                        <Percent className="h-4 w-4" />
                        <AlertTitle>Real-World Example: Survey Data</AlertTitle>
                        <AlertDescription>
                            A national survey finds that **40%** of the country's population owns a dog. A follow-up survey of only the dog owners finds that **20%** of them feed their dog a raw-food diet.
                        </AlertDescription>
                    </Alert>

                    <p className="mt-4">The final answer is 20% OF 40%, which equals 8% of the total population.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Is "50% of 20%" the same as "20% of 50%"?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. Multiplication is commutative, so the order does not matter.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How does this relate to "percentage points"?</AccordionTrigger>
                            <AccordionContent>
                                <p>They are different. This calculator multiplies proportions, while a percentage point calculation finds the simple arithmetic difference between two percentages.</p>
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
                        The Percentage of a Percentage Calculator is a specialized tool for determining a proportion of an existing proportion, often described as finding a "part of a part."
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
