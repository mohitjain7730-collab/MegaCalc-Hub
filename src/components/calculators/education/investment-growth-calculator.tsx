'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateInvestmentGrowth } from '@/lib/calculators';
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
import { HelpCircle, DollarSign, TrendingUp, ChevronsRight } from 'lucide-react';
import { useCountUp } from '@/hooks/use-count-up';

const formSchema = z.object({
    initialAmount: z.coerce.number().positive('Initial amount must be a positive number.'),
    finalAmount: z.coerce.number().positive('Final amount must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators: { name: string; href: string }[] = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/category/education/maths/comparative-difference-calculator' },
    { name: 'Compounding Increase', href: '/category/education/maths/compounding-increase-calculator' },
    { name: 'Doubling Time', href: '/category/education/maths/doubling-time-calculator' },
    { name: 'Fraction to Percent', href: '/category/education/maths/fraction-to-percent-calculator' },
    { name: 'Historic Change', href: '/category/education/maths/historic-change-calculator' },
    { name: 'Percentage of a Percentage', href: '/category/education/maths/percentage-of-a-percentage-calculator' },
    { name: 'Percentage Point', href: '/category/education/maths/percentage-point-calculator' },
    { name: 'Percent Error', href: '/category/education/maths/percent-error-calculator' },
    { name: 'Percent to Goal', href: '/category/education/maths/percent-to-goal-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function InvestmentGrowthCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateInvestmentGrowth> | null>(null);

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
                        <h3 className="font-semibold text-lg">Initial Investment ($)</h3>
                        <p className="text-muted-foreground">The total amount of money you originally invested. This is your cost basis.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Final Value ($)</h3>
                        <p className="text-muted-foreground">The current market value of your investment. This is what it would be worth if you sold it today.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This calculator determines the return on investment (ROI) from a simple starting and ending value, without considering the time period. It calculates both the absolute monetary gain and the relative percentage gain.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold">NetGrowth = Final Amount - Initial Amount</p>
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Growth % = (Net Growth / Initial Amount) * 100</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">This is identical to a standard percentage change calculation, framed in the context of investment returns.</p>
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
                    <CardTitle>Measuring Your Investment's Success</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Beyond the Numbers: What Does Growth Really Mean?</h2>
                    <p>At its core, investing is about making your money work for you. The goal is to turn a starting sum into a larger sum. This calculator gives you the two most basic metrics for success: how much money you made (net profit) and how efficiently you made it (percentage growth). While simple, these numbers are the foundation of performance tracking.</p>

                    <h3 className="text-lg font-semibold text-foreground">Percentage Growth (ROI) vs. Net Profit</h3>
                    <p>It's important to look at both metrics together. A $10,000 net profit sounds great, but its significance changes with context:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>If that $10,000 profit came from a **$1,000,000** investment, your percentage growth is only **1%**. That's likely less than inflation, meaning you lost purchasing power.</li>
                        <li>If that same $10,000 profit came from a **$20,000** investment, your percentage growth is **50%**. That is a fantastic return.</li>
                    </ul>
                    <p>Percentage growth, or Return on Investment (ROI), is the great equalizer. It allows you to compare the performance of different sized investments on an apples-to-apples basis. Net profit tells you the real-world cash value of your success.</p>

                    <h3 className="text-lg font-semibold text-foreground">What This Calculator Doesn't Tell You</h3>
                    <p>This is a simple growth calculator. For a complete picture of investment performance, several other factors are critical:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Time Horizon:</strong> A 50% gain is amazing if it happens in one year. It's less impressive if it took 20 years. To account for time, you need to calculate the annualized rate of return.</li>
                        <li><strong>Additional Contributions/Withdrawals:</strong> This calculator assumes a single investment with no money added or removed.</li>
                        <li><strong>Dividends and Interest:</strong> This calculation is based purely on capital appreciation (the change in price).</li>
                        <li><strong>Risk:</strong> A 50% return is great, but not if it involved a huge risk of losing everything.</li>
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
                            <AccordionTrigger>Is this the same as ROI (Return on Investment)?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes, the "Total Growth (%)" is the simplest form of ROI. The formula is identical: `(Net Profit / Cost of Investment) * 100`.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Should I include fees and commissions in the initial amount?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes, for the most accurate calculation of your true return. Your 'Initial Investment' should be the total cost basis, which includes the purchase price plus any fees or commissions you paid to acquire the asset.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What if my investment lost value?</AccordionTrigger>
                            <AccordionContent>
                                <p>The calculator works perfectly for losses. If your final amount is less than your initial amount, the "Total Growth" will be negative and the "Net Profit" will also be a negative number, representing your net loss.</p>
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
                    <p className="text-muted-foreground">The Investment Growth Calculator provides a clear, high-level overview of an investment's performance. By calculating both the absolute net profit and the relative percentage growth (ROI), it offers a crucial first look at your financial success. It's an essential starting point for any investor looking to quickly assess the outcome of their decisions.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
