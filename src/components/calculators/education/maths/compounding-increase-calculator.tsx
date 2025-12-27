'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateCompoundingIncrease } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { DollarSign, Percent, Calendar, HelpCircle, TrendingUp, BarChart } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useCountUp } from '@/hooks/use-count-up';

const formSchema = z.object({
    initialValue: z.coerce.number().positive('Initial value must be positive.'),
    percentageIncrease: z.coerce.number().positive('Percentage increase must be positive.'),
    periods: z.coerce.number().int().positive('Number of periods must be a positive integer.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/category/education/maths/comparative-difference-calculator' },
    { name: 'Doubling Time', href: '/category/education/maths/doubling-time-calculator' },
    { name: 'Investment Growth', href: '/category/education/maths/investment-growth-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

const chartConfig = {
    value: {
        label: 'Value',
        color: 'hsl(var(--primary))',
    },
} satisfies ChartConfig;

export default function CompoundingIncreaseCalculator() {
    const [result, setResult] = useState<{ amount: string, interest: string } | null>(null);
    const [history, setHistory] = useState<any[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            initialValue: undefined,
            percentageIncrease: undefined,
            periods: undefined,
        },
    });

    const finalValue = result ? parseFloat(result.amount) : 0;
    const initialValue = result ? finalValue - parseFloat(result.interest) : 0;
    const totalGrowth = result ? parseFloat(result.interest) : 0;

    const animatedFinalValue = useCountUp(finalValue);
    const animatedInitialValue = useCountUp(initialValue);
    const animatedTotalGrowth = useCountUp(totalGrowth);

    const onSubmit = (data: FormValues) => {
        const res = calculateCompoundingIncrease(data.initialValue, data.percentageIncrease, data.periods);
        setResult(res);

        // Generate history for chart
        const hist = [];
        let current = data.initialValue;
        for (let i = 0; i <= data.periods; i++) {
            hist.push({ period: i, value: parseFloat(current.toFixed(2)) });
            current = current * (1 + data.percentageIncrease / 100);
        }
        setHistory(hist);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Compounding Increase Calculator</CardTitle>
                    <CardDescription>
                        Calculate the final value of an amount after applying a consistent percentage increase over multiple periods.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="initialValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Initial Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 1000" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="percentageIncrease"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Percent className="w-4 h-4" />Increase Per Period (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="periods"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Calendar className="w-4 h-4" />Number of Periods</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Final Value</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Compounding Results</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">Final Value</p>
                            <p className="text-4xl font-bold text-primary">${animatedFinalValue}</p>
                        </div>
                        <div className="p-6 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Initial Value</p>
                            <p className="text-4xl font-bold">${animatedInitialValue}</p>
                        </div>
                        <div className="p-6 bg-accent/20 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Growth</p>
                            <p className="text-4xl font-bold text-accent">${animatedTotalGrowth}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {history.length > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5" />Growth Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <LineChart
                                accessibilityLayer
                                data={history}
                                margin={{ left: 12, right: 12 }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="period"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => `P ${value}`}
                                />
                                <YAxis
                                    domain={['dataMin', 'dataMax']}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                <Line
                                    dataKey="value"
                                    type="monotone"
                                    stroke="var(--color-value)"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculation applies the percentage growth repeatedly for each period.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Final Value = Initial Value * (1 + Rate)^Periods</p>
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
        </div>
    );
}
