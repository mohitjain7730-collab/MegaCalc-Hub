'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateValuePercentage } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Sigma } from 'lucide-react';

const formSchema = z.object({
    percentage: z.coerce.number().min(0, "Percentage can't be negative."),
    totalValue: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Compounding Increase', href: '/category/education/maths/compounding-increase-calculator' },
    { name: 'Fraction to Percent', href: '/category/education/maths/fraction-to-percent-calculator' },
    { name: 'Percentage of a Percentage', href: '/category/education/maths/percentage-of-a-percentage-calculator' },
    { name: 'Relative Change', href: '/category/education/maths/relative-change-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function ValuePercentageCalculator() {
    const [result, setResult] = useState<{ value: string } | null>(null);

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
                    <CardDescription>Find the actual value of a percentage of any given number.</CardDescription>
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
                                            <FormLabel>Percentage (%)</FormLabel>
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
                                            <FormLabel>Total Value</FormLabel>
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
                            <p className="text-4xl font-bold text-primary">{result.value}</p>
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
                        <h3 className="font-semibold text-lg">Percentage</h3>
                        <p className="text-muted-foreground">The portion to calculate (e.g., 20).</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Total Value</h3>
                        <p className="text-muted-foreground">The whole amount (e.g., 100).</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Result = (Percentage / 100) * Total Value</p>
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
                            <AccordionTrigger>How do I find a percentage in reverse?</AccordionTrigger>
                            <AccordionContent>
                                <p>Use the "Percent to Goal" or "Average Percentage" calculator to find what percentage one number is of another.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
