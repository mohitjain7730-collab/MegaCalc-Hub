'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateInvestmentGrowth } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, TrendingUp } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';

const formSchema = z.object({
    initialAmount: z.coerce.number().positive('Initial amount must be a positive number.'),
    finalAmount: z.coerce.number().positive('Final amount must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Compounding Increase', href: '/category/education/maths/compounding-increase-calculator' },
    { name: 'Doubling Time', href: '/category/education/maths/doubling-time-calculator' },
    { name: 'Fuel Cost', href: '/category/education/maths/fuel-cost-calculator' },
    { name: 'Historic Change', href: '/category/education/maths/historic-change-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function InvestmentGrowthCalculator() {
    const [result, setResult] = useState<{ growthPercentage: string; netGrowth: string } | null>(null);

    const growthPercentage = result ? parseFloat(result.growthPercentage) : 0;
    const netGrowth = result ? parseFloat(result.netGrowth) : 0;

    const animatedGrowthPercentage = useCountUp(growthPercentage);
    const animatedNetGrowth = useCountUp(netGrowth);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            initialAmount: undefined,
            finalAmount: undefined,
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateInvestmentGrowth(data.initialAmount, data.finalAmount);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Investment Growth Calculator</CardTitle>
                    <CardDescription>
                        Calculate the total percentage growth and net profit of an investment.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="initialAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">Initial Investment ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="finalAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">Final Value ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 7500" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Growth</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Investment Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="p-6 bg-accent/20 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Growth (%)</p>
                            <p className="text-4xl font-bold text-accent">{animatedGrowthPercentage}%</p>
                        </div>
                        <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">Net Profit</p>
                            <p className="text-4xl font-bold text-primary">${animatedNetGrowth}</p>
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
                        <h3 className="font-semibold text-lg">Initial Investment</h3>
                        <p className="text-muted-foreground">The original cost basis.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Final Value</h3>
                        <p className="text-muted-foreground">Current total value.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Net Growth = Final - Initial. Growth % = (Net Growth / Initial) * 100.</p>
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
                            <AccordionTrigger>Is this ROI?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes, Total Growth % is essentially Return on Investment.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
