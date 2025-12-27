'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateHistoricChange } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, TrendingUp, ArrowDown, ArrowUp, ArrowRight } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';

const formSchema = z.object({
    oldValue: z.coerce.number().refine(val => val !== 0, { message: 'Original value cannot be zero.' }),
    newValue: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Compounding Increase', href: '/category/education/maths/compounding-increase-calculator' },
    { name: 'Doubling Time', href: '/category/education/maths/doubling-time-calculator' },
    { name: 'Fraction to Percent', href: '/category/education/maths/fraction-to-percent-calculator' },
    { name: 'Investment Growth', href: '/category/education/maths/investment-growth-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function HistoricChangeCalculator() {
    const [result, setResult] = useState<{ change: string; direction: 'increase' | 'decrease' | 'none' } | null>(null);
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
                        <h3 className="font-semibold text-lg">Original Value</h3>
                        <p className="text-muted-foreground">The starting reference point.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">New Value</h3>
                        <p className="text-muted-foreground">The ending point to compare against.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Change = ((New Value - Original Value) / Original Value) * 100</p>
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
                            <AccordionTrigger>Why can't the original value be zero?</AccordionTrigger>
                            <AccordionContent>
                                <p>Division by zero is undefined. You cannot calculate percentage growth from zero.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
