'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculatePercentToGoal } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { HelpCircle, Sigma } from 'lucide-react';

const formSchema = z.object({
    currentValue: z.coerce.number(),
    goalValue: z.coerce.number().refine(n => n !== 0, 'Goal value cannot be zero.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Investment Growth', href: '/category/education/maths/investment-growth-calculator' },
    { name: 'Percentage Point', href: '/category/education/maths/percentage-point-calculator' },
    { name: 'Time Percentage', href: '/category/education/maths/time-percentage-calculator' },
    { name: 'Value Percentage', href: '/category/education/maths/value-percentage-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function PercentToGoalCalculator() {
    const [result, setResult] = useState<{ percentage: string } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { currentValue: undefined, goalValue: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculatePercentToGoal(data.currentValue, data.goalValue);
        setResult(res);
    };

    const percentage = result ? parseFloat(result.percentage) : 0;

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
                            <p className="text-4xl font-bold text-primary">{result.percentage}%</p>
                        </div>
                        <div>
                            <Progress value={percentage > 100 ? 100 : percentage} className="w-full" />
                            {percentage > 100 && <p className="text-sm text-accent mt-2 font-semibold">Goal exceeded!</p>}
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
                        <p className="text-muted-foreground">The value currently achieved.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Goal Value</h3>
                        <p className="text-muted-foreground">The target value to reach.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Percentage to Goal = (Current Value / Goal Value) × 100</p>
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
                            <AccordionTrigger>What does it mean if the percentage is over 100%?</AccordionTrigger>
                            <AccordionContent>
                                <p>It means you have exceeded your goal.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
