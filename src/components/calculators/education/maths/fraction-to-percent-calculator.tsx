'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateFractionToPercent } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Sigma } from 'lucide-react';

const formSchema = z.object({
    numerator: z.coerce.number(),
    denominator: z.coerce.number().refine(n => n !== 0, 'Denominator cannot be zero.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Fuel Cost', href: '/category/education/maths/fuel-cost-calculator' },
    { name: 'Historic Change', href: '/category/education/maths/historic-change-calculator' },
    { name: 'Investment Growth', href: '/category/education/maths/investment-growth-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function FractionToPercentCalculator() {
    const [result, setResult] = useState<{ percentage: string } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { numerator: undefined, denominator: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateFractionToPercent(data.numerator, data.denominator);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Fraction to Percent Calculator</CardTitle>
                    <CardDescription>Convert any fraction into its percentage equivalent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <FormField
                                    control={form.control}
                                    name="numerator"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Numerator (Top Number)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="denominator"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Denominator (Bottom Number)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Convert to Percent</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Conversion Result</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">{form.getValues('numerator')} / {form.getValues('denominator')} is equal to</p>
                            <p className="text-4xl font-bold text-primary">{result.percentage}%</p>
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
                        <h3 className="font-semibold text-lg">Numerator</h3>
                        <p className="text-muted-foreground">The top number in a fraction.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Denominator</h3>
                        <p className="text-muted-foreground">The bottom number in a fraction. It cannot be zero.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Divide the numerator by the denominator and multiply by 100.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Percentage = (Numerator / Denominator) × 100</p>
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
                            <AccordionTrigger>What if my numerator is larger than the denominator?</AccordionTrigger>
                            <AccordionContent>
                                <p>The result will be greater than 100%.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
