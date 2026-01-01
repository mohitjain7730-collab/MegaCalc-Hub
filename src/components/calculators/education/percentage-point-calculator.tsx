'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculatePercentagePoint } from '@/lib/calculators';
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
    { name: 'Percentage of a Percentage', href: '/category/education/maths/percentage-of-a-percentage-calculator' },
    { name: 'Percent Error', href: '/category/education/maths/percent-error-calculator' },
    { name: 'Percent to Goal', href: '/category/education/maths/percent-to-goal-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function PercentagePointCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculatePercentagePoint> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { percentage1: undefined, percentage2: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculatePercentagePoint(data.percentage1, data.percentage2);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Percentage Point Calculator</CardTitle>
                    <CardDescription>Calculate the simple arithmetic difference between two percentage values.</CardDescription>
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
                                            <FormLabel>Initial Percentage (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 20" {...field} value={field.value ?? ''} />
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
                                            <FormLabel>Final Percentage (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} />
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
                            <p className="text-sm text-muted-foreground">Difference</p>
                            <p className="text-4xl font-bold text-primary">{result.difference} percentage points</p>
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
                        <h3 className="font-semibold text-lg">Initial and Final Percentage</h3>
                        <p className="text-muted-foreground">Enter the two percentage values you want to compare. The calculator will find the simple arithmetic difference between them, measured in "percentage points."</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The percentage point difference is the most straightforward way to compare two percentages: it is their simple arithmetic difference, found through subtraction.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Difference = Final Percentage - Initial Percentage</p>
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
                    <CardTitle>A Guide to Percentage Points vs. Percent Change</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">A Guide to Percentage Points vs. Percent Change</h2>
                    <p>The difference between a **"percentage point"** change and a **"percent change"** is one of the most common sources of confusion in financial reporting and statistics. While they both describe changes in percentages, they measure very different things.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Crucial Distinction for Accurate Reporting</h3>
                    <p>A percentage point is the simple arithmetic difference between two percentages. It is an **absolute** measure. A percentage change, on the other hand, is the relative change between the two values. It is a **proportional** measure.</p>

                    <Alert>
                        <Percent className="h-4 w-4" />
                        <AlertTitle>Core Example: An Interest Rate Increase</AlertTitle>
                        <AlertDescription>
                            A central bank raises its key interest rate from **10%** to **12%**. This can be described in two ways, both technically correct but wildly different in scale.
                        </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-4 bg-muted border rounded-lg">
                            <h4 className="font-bold text-primary mb-2">Percentage Point Change</h4>
                            <p className="text-sm font-mono mb-2">12% - 10% = 2</p>
                            <p className="text-sm">The rate increased by **2 percentage points**. This is the absolute difference.</p>
                        </div>
                        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                            <h4 className="font-bold text-primary mb-2">Percentage Change</h4>
                            <p className="text-sm font-mono mb-2">((12 - 10) / 10) * 100 = 20%</p>
                            <p className="text-sm">The rate increased by **20%**. This is how much the original 10% grew relative to itself.</p>
                        </div>
                    </div>

                    <p className="mt-4 italic">Failing to clarify which metric you are using can lead to significant misunderstandings, especially in politics, business, and economics.</p>

                    <h3 className="text-lg font-semibold text-foreground">Why the Distinction Matters</h3>
                    <p>Using "percentage points" prevents ambiguity. If someone says "interest rates went up by 2%," it's unclear if they mean the rate is now 10.2% (a 2% increase of 10) or 12% (a 2 point increase). Saying "2 percentage points" leaves no room for doubt.</p>

                    <div className="w-full overflow-x-auto shadow-sm border rounded-lg mt-4">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-left">
                                <tr>
                                    <th className="p-3 border-b">Initial %</th>
                                    <th className="p-3 border-b">Final %</th>
                                    <th className="p-3 border-b">Point Difference</th>
                                    <th className="p-3 border-b">Percentage Change</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">50%</td>
                                    <td className="p-3">75%</td>
                                    <td className="p-3 font-bold text-primary">25 pts</td>
                                    <td className="p-3">50% increase</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">4%</td>
                                    <td className="p-3">5%</td>
                                    <td className="p-3 font-bold text-primary">1 pt</td>
                                    <td className="p-3">25% increase</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">1.0%</td>
                                    <td className="p-3">0.5%</td>
                                    <td className="p-3 font-bold text-destructive">-0.5 pts</td>
                                    <td className="p-3">50% decrease</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>When should I use "percentage points" instead of "percent"?</AccordionTrigger>
                            <AccordionContent>
                                <p>Always use percentage points when describing the absolute change in a value that is already a percentage (like interest rates, tax rates, or survey results). This prevents confusion with relative percentage change.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What is the 'basis point' (bps) related to this?</AccordionTrigger>
                            <AccordionContent>
                                <p>A basis point is a sub-unit of a percentage point. One percentage point equals 100 basis points. They are frequently used in finance for very small changes in interest rates (e.g., a "25 bps" hike is a 0.25 percentage point increase).</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Are percentage points always positive?</AccordionTrigger>
                            <AccordionContent>
                                <p>No. If the final percentage is lower than the initial one, the difference is a negative number of percentage points, indicating a decrease.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Can I say "a 2% point increase"?</AccordionTrigger>
                            <AccordionContent>
                                <p>It's better to say "a 2 percentage point increase." While people might understand "2% point," it's technically redundant and can still be slightly confusing.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Is there a symbol for percentage points?</AccordionTrigger>
                            <AccordionContent>
                                <p>Unlike the percent symbol (%), there is no universally standard single-character symbol for percentage points. It is typically abbreviated as "pp" or "pts."</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>Why is this calculator useful for surveys?</AccordionTrigger>
                            <AccordionContent>
                                <p>If a candidate's polling went from 40% to 44%, they gained 4 percentage points. Saying they gained "4%" is misleading because 44 is actually a 10% increase over 40. The percentage point measure accurately reflects the change in the share of the total vote.</p>
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
                        The Percentage Point Calculator is a vital tool for anyone working with statistics, finance, or public policy. By providing the simple arithmetic difference between two percentage values, it helps maintain clarity and precision in communication. Understanding the difference between absolute point changes and relative percentage shifts is essential for accurate data reporting and avoiding common pitfalls in statistical interpretation.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
