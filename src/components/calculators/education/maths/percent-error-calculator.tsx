'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculatePercentError } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Sigma } from 'lucide-react';

const formSchema = z.object({
    observedValue: z.coerce.number(),
    trueValue: z.coerce.number().refine(n => n !== 0, 'True value cannot be zero.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Percent to Goal', href: '/category/education/maths/percent-to-goal-calculator' },
    { name: 'Percentage of a Percentage', href: '/category/education/maths/percentage-of-a-percentage-calculator' },
    { name: 'Relative Change', href: '/category/education/maths/relative-change-calculator' },
    { name: 'Slope Percentage', href: '/category/education/maths/slope-percentage-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function PercentErrorCalculator() {
    const [result, setResult] = useState<{ error: string } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { observedValue: undefined, trueValue: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculatePercentError(data.observedValue, data.trueValue);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Percent Error Calculator</CardTitle>
                    <CardDescription>Calculate the percentage error between an observed value and a true value.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="observedValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Observed Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 9.8" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="trueValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>True Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Percent Error</Button>
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
                            <p className="text-sm text-muted-foreground">Percent Error</p>
                            <p className="text-4xl font-bold text-primary">{result.error}%</p>
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
                        <h3 className="font-semibold text-lg">Observed Value</h3>
                        <p className="text-muted-foreground">The value obtained from experiment or measurement.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">True Value</h3>
                        <p className="text-muted-foreground">The accepted or theoretical value.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Percent Error = (|Observed Value - True Value| / True Value) × 100</p>
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
                            <AccordionTrigger>Can percent error be negative?</AccordionTrigger>
                            <AccordionContent>
                                <p>No, percent error uses the absolute value of the difference, so it is always positive.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
