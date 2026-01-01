'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculatePercentToGoal } from '@/lib/calculators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Target, Sigma } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
    currentValue: z.coerce.number(),
    goalValue: z.coerce.number().refine(n => n !== 0, 'Goal value cannot be zero.'),
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
    { name: 'Percentage Point', href: '/category/education/maths/percentage-point-calculator' },
    { name: 'Percent Error', href: '/category/education/maths/percent-error-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function PercentToGoalCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculatePercentToGoal> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { currentValue: undefined, goalValue: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculatePercentToGoal(data.currentValue, data.goalValue);
        setResult(res);
    };

    const percentage = result ? parseFloat(result.percentComp) : 0;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Percent to Goal Calculator</CardTitle>
                    <CardDescription>Calculate what percentage of a goal has been achieved.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="currentValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 75" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="goalValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Goal Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Percentage</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Progress to Goal</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">Percentage of Goal Achieved</p>
                            <p className="text-4xl font-bold text-primary">{result.percentComp}%</p>
                        </div>
                        <div>
                            <Progress value={percentage > 100 ? 100 : percentage} className="w-full" />
                            {percentage > 100 && <p className="text-sm text-accent mt-2 font-semibold">Goal exceeded!</p>}
                            <p className="text-sm text-muted-foreground mt-2">Remaining: {result.remaining}</p>
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
                        <h3 className="font-semibold text-lg">Current Value</h3>
                        <p className="text-muted-foreground">This is the value you have currently achieved. For example, the amount of money you have saved, or the number of miles you have run.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Goal Value</h3>
                        <p className="text-muted-foreground">This is the target value you are trying to reach. For example, your total savings goal, or the total distance of a marathon.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This calculator determines what proportion of your goal you have completed, expressed as a percentage. It's a straightforward division and multiplication.</p>
                    <div className="p-4 bg-muted/50 rounded-lg mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Percentage to Goal = (Current Value / Goal Value) × 100</p>
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
                    <CardTitle>In-Depth Guide to Tracking Progress Towards Goals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">The Psychology of the Progress Bar</h2>
                    <p>Visualizing progress is a core component of motivation and goal achievement. It provides tangible feedback and makes large goals feel manageable.</p>

                    <h2 className="text-xl font-bold text-foreground">Real-World Applications</h2>
                    <ul className="list-disc pl-5 space-y-3">
                        <li><strong>Personal Finance:</strong> Tracking savings goals.</li>
                        <li><strong>Fitness:</strong> Training session completion.</li>
                        <li><strong>Business:</strong> Sales targets.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-foreground">Handling Scenarios Where You Exceed the Goal</h2>
                    <p>Surpassing your goal results in a percentage greater than 100%, an excellent indicator of over-achievement.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What if my current value is negative?</AccordionTrigger>
                            <AccordionContent>
                                <p>The calculator handles negative values, though interpretation depends on the context.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Why can't the goal value be zero?</AccordionTrigger>
                            <AccordionContent>
                                <p>Dividing by zero is undefined.</p>
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
                        The Percent to Goal Calculator translates your progress into an understandable percentage, providing a clear snapshot of your achievements.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
