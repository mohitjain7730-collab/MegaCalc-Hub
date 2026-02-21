'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as x from 'zod';
import { calculateCompoundingIncrease } from '@/lib/calculators';
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
import { DollarSign, Percent, Calendar, HelpCircle, TrendingUp, BarChart } from 'lucide-react';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useCountUp } from '@/hooks/use-count-up';

const formSchema = x.object({
    initialValue: x.coerce.number().positive('Initial value must be positive.'),
    percentageIncrease: x.coerce.number().positive('Percentage increase must be positive.'),
    periods: x.coerce.number().int().positive('Number of periods must be a positive integer.'),
});

type FormValues = x.infer<typeof formSchema>;

const relatedCalculators: { name: string; href: string }[] = [
    { name: 'Average Percentage', href: '/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/comparative-difference-calculator' },
    { name: 'Doubling Time', href: '/doubling-time-calculator' },
    { name: 'Fraction to Percent', href: '/fraction-to-percent-calculator' },
    { name: 'Fuel Cost', href: '/fuel-cost-calculator' },
    { name: 'Historic Change', href: '/historic-change-calculator' },
    { name: 'Investment Growth', href: '/investment-growth-calculator' },
    { name: 'Percentage of a Percentage', href: '/percentage-of-a-percentage-calculator' },
    { name: 'Percentage Point', href: '/percentage-point-calculator' },
    { name: 'Percent Error', href: '/percent-error-calculator' },
    { name: 'Percent to Goal', href: '/percent-to-goal-calculator' },
    { name: 'Relative Change', href: '/relative-change-calculator' },
    { name: 'Slope Percentage', href: '/slope-percentage-calculator' },
    { name: 'Time Percentage', href: '/time-percentage-calculator' },
    { name: 'Value Percentage', href: '/value-percentage-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

const chartConfig = {
    value: {
        label: 'Value',
        color: 'hsl(var(--primary))',
    },
} satisfies ChartConfig;

export default function CompoundingIncreaseCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateCompoundingIncrease> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            initialValue: undefined,
            percentageIncrease: undefined,
            periods: undefined,
        },
    });

    const initialVal = result ? parseFloat(form.getValues('initialValue').toString()) : 0;
    const finalVal = result ? parseFloat(result.finalValue) : 0;
    const totalGrowthVal = result ? parseFloat(result.totalGrowth) : 0;

    const animatedFinalValue = useCountUp(finalVal);
    const animatedInitialValue = useCountUp(initialVal);
    const animatedTotalGrowth = useCountUp(totalGrowthVal);


    const onSubmit = (data: FormValues) => {
        const res = calculateCompoundingIncrease(data.initialValue, data.percentageIncrease, data.periods);
        setResult(res);
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

            {result && result.history.length > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5" />Growth Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <LineChart
                                accessibilityLayer
                                data={result.history}
                                margin={{
                                    left: 12,
                                    right: 12,
                                }}
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
                                    hide
                                    domain={['dataMin', 'dataMax']}
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
                    <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" />Understanding the Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Initial Value</h3>
                        <p className="text-muted-foreground">This is the starting amount of money, population, or any other quantity before any increase is applied. It's the baseline for the calculation.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Increase Per Period (%)</h3>
                        <p className="text-muted-foreground">This is the rate of growth that is applied at the end of each period. It must be a consistent percentage. For example, a 5% annual interest rate.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Number of Periods</h3>
                        <p className="text-muted-foreground">This is the total number of times the percentage increase will be applied. The 'period' could be a year, a month, a day, or any other consistent unit of time.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator uses a loop to apply the growth sequentially. For each period, the new value is calculated by multiplying the previous period's value by `(1 + percentageIncrease / 100)`.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">NewValue = PreviousValue * (1 + (Increase / 100))</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">This process is repeated for the specified number of periods to find the final compounded value.</p>
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
                    <CardTitle>The Power of Compounding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Why Einstein (Probably Didn't) Call it the Eighth Wonder</h2>
                    <p>There's a famous quote, often misattributed to Albert Einstein, calling compound interest the eighth wonder of the world. While he may not have said it, the sentiment is powerfully true. Compounding is the engine of wealth creation, and understanding how it works is fundamental to personal finance, investment, and even understanding natural population growth.</p>

                    <h3 className="text-lg font-semibold text-foreground">What is Compounding?</h3>
                    <p>In simple terms, compounding is the process of generating earnings on an asset's reinvested earnings. The initial amount grows, and then the growth itself starts to grow. It’s "growth on growth." This is different from simple, linear growth, where an amount increases by the same fixed value each period.</p>
                    <p>Think of it like a snowball rolling down a hill. It starts small, but as it rolls, it picks up more snow, getting bigger and bigger at an ever-increasing rate. The initial 'snowball' is your principal, and the 'snow' it picks up is the interest or growth, which then becomes part of the snowball itself.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Three Levers of Compounding</h3>
                    <p>Our calculator highlights the three critical factors that drive compounding:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Initial Value (Principal):</strong> The larger your starting amount, the more significant the absolute growth will be in each period. A 10% increase on $10,000 is much larger than a 10% increase on $100.</li>
                        <li><strong>Percentage Increase (Rate of Return):</strong> This is the most powerful lever. A higher rate of return dramatically accelerates growth. The difference between a 5% and an 8% annual return over 30 years is enormous.</li>
                        <li><strong>Number of Periods (Time):</strong> Time is the magic ingredient. The longer you let your asset compound, the more dramatic the "snowball effect" becomes. This is why starting to save and invest early is so crucial.</li>
                    </ol>

                    <h3 className="text-lg font-semibold text-foreground">Real-World Applications</h3>
                    <p>Compounding isn't just an abstract mathematical concept. It's at play all around us:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Investing:</strong> The cornerstone of stock market returns, where dividends and capital gains are reinvested to generate further gains.</li>
                        <li><strong>Savings Accounts:</strong> High-yield savings accounts compound interest, though usually at a lower rate than investments.</li>
                        <li><strong>Debt:</strong> Unfortunately, compounding also works in reverse. Credit card debt is a powerful example of negative compounding, where the interest charged increases the total debt, which then accrues even more interest.</li>
                        <li><strong>Population Growth:</strong> In biology, unconstrained populations can grow exponentially, which is a form of compounding.</li>
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
                            <AccordionTrigger>What's the difference between simple and compound growth?</AccordionTrigger>
                            <AccordionContent>
                                <p>Simple growth applies the percentage increase only to the initial value. For example, $100 with 10% simple interest grows by $10 each year. Compound growth applies the increase to the current total value. In year two, you'd earn 10% on $110, not just the original $100.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How does inflation affect compounding?</AccordionTrigger>
                            <AccordionContent>
                                <p>Inflation erodes the purchasing power of your money. The 'real' rate of return is your nominal growth rate minus the inflation rate. If your investment grows by 7% but inflation is 3%, your real growth is only about 4%. It's crucial to ensure your growth outpaces inflation.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Can I use this for decreases?</AccordionTrigger>
                            <AccordionContent>
                                <p>No, this calculator is specifically designed for percentage increases. For calculating compound decreases (like depreciation), you would need a tool that subtracts the percentage each period. The underlying math is similar but applied differently.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>What is the "Rule of 72"?</AccordionTrigger>
                            <AccordionContent>
                                <p>The Rule of 72 is a quick mental shortcut to estimate the number of years it takes for an investment to double. You simply divide 72 by the annual interest rate. For example, at an 8% annual return, it would take approximately 9 years (72 / 8) for your money to double.</p>
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
                    <p className="text-muted-foreground">The Compounding Increase Calculator is a powerful tool for visualizing long-term growth. By demonstrating how a consistent increase builds on itself over time, it helps users understand the exponential power of compounding, which is essential for planning investments, savings goals, or any long-term growth scenario.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
