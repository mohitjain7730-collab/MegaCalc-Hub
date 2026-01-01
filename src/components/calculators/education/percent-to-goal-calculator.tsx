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
    { name: 'Fuel Cost', href: '/category/education/maths/fuel-cost-calculator' },
    { name: 'Historic Change', href: '/category/education/maths/historic-change-calculator' },
    { name: 'Investment Growth', href: '/category/education/maths/investment-growth-calculator' },
    { name: 'Percentage of a Percentage', href: '/category/education/maths/percentage-of-a-percentage-calculator' },
    { name: 'Percentage Point', href: '/category/education/maths/percentage-point-calculator' },
    { name: 'Percent Error', href: '/category/education/maths/percent-error-calculator' },
    { name: 'Relative Change', href: '/category/education/maths/relative-change-calculator' },
    { name: 'Slope Percentage', href: '/category/education/maths/slope-percentage-calculator' },
    { name: 'Time Percentage', href: '/category/education/maths/time-percentage-calculator' },
    { name: 'Value Percentage', href: '/category/education/maths/value-percentage-calculator' },
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
                    <p>The concept of "percent to goal" is more than just a mathematical calculation; it's a powerful psychological tool. Visualizing progress, such as with the progress bar this calculator provides, is a core component of motivation and goal achievement. It provides tangible feedback, reinforces positive behavior, and makes large, intimidating goals feel manageable.</p>
                    <p>This principle is used everywhere, from fitness apps tracking your daily steps to fundraising thermometers showing how close a charity is to its target. By calculating your percent to goal, you're creating a personal progress bar for any objective in your life.</p>

                    <h2 className="text-xl font-bold text-foreground">Real-World Applications of Percent to Goal</h2>
                    <p>This simple calculation is incredibly versatile and can be applied to almost any area where you're tracking progress:</p>
                    <ul className="list-disc pl-5 space-y-3">
                        <li><strong>Personal Finance:</strong> If you've saved $1,500 towards a $5,000 emergency fund, you are `(1500 / 5000) * 100 = 30%` of the way to your goal.</li>
                        <li><strong>Fitness and Training:</strong> You're training for a 10km race and have just completed a 6.5km run. You've run `(6.5 / 10) * 100 = 65%` of the race distance.</li>
                        <li><strong>Project Management:</strong> A team has completed 120 out of 200 required tasks for a project. They are `(120 / 200) * 100 = 60%` complete.</li>
                        <li><strong>Sales and Business:</strong> A salesperson has made $40,000 in sales towards a quarterly quota of $50,000. They have achieved `(40000 / 50000) * 100 = 80%` of their goal.</li>
                        <li><strong>Academics:</strong> A student has read 250 pages of a 400-page book. They are `(250 / 400) * 100 = 62.5%` of the way through.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-foreground">Handling Scenarios Where You Exceed the Goal</h2>
                    <p>It's a great problem to have: what happens when your current value surpasses your goal value? In this case, your percentage will be greater than 100%. This is an excellent indicator of over-achievement.</p>
                    <p>For example, if a fundraiser's goal was $10,000 and they raised $12,000, they achieved `(12000 / 10000) * 100 = 120%` of their goal. This is often referred to as a "stretch goal" and is a powerful motivator for teams and individuals.</p>
                    <p>Our calculator's progress bar caps at 100% to provide a clear visual of goal completion, but it displays the actual percentage achieved, allowing you to celebrate and quantify how much you've exceeded expectations.</p>
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
                                <p>The calculator can handle negative current values. This is common in scenarios like weight loss goals. For example, if your goal is to lose 20 lbs and you have lost 5 lbs so far, you could represent this as a current value of 5 and a goal of 20 (25% complete). Or, if you're tracking net worth and start at -$5,000 with a goal of $10,000, the math still works, but interpreting the percentage can be less intuitive.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Why can't the goal value be zero?</AccordionTrigger>
                            <AccordionContent>
                                <p>Mathematically, dividing by zero is an undefined operation. A goal of zero doesn't make logical sense in this context either; you cannot measure progress towards a goal that requires no effort or change to achieve.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>How is this different from the 'Value Percentage Calculator'?</AccordionTrigger>
                            <AccordionContent>
                                <p>They use very similar formulas but answer different questions. The 'Value Percentage Calculator' answers "What is 25% of 100?" (Result: 25). This 'Percent to Goal Calculator' answers the inverse question: "What percentage of 100 is 25?" (Result: 25%). It's a subtle but important difference in perspective, focused on progress rather than just finding a value.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How can I calculate the remaining percentage to my goal?</AccordionTrigger>
                            <AccordionContent>
                                <p>Once you have the percentage of the goal achieved, simply subtract that number from 100. If you are 70% of the way to your goal, you have `100 - 70 = 30%` remaining.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Can I use this for goals that decrease?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. For example, if your goal is to reduce your screen time from 4 hours (240 minutes) to 1 hour (60 minutes), your total reduction goal is 180 minutes. If you have already reduced it by 30 minutes, your current value is 30 and your goal is 180. You are `(30 / 180) * 100 = 16.67%` of the way to your reduction goal.</p>
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
                        The Percent to Goal Calculator is a simple yet powerful motivational tool that translates your progress into an easily understandable percentage. By comparing your achievement to your ultimate target, it provides a clear snapshot of how far you've come and how far you have left to go. It's an essential calculator for personal finance, project management, fitness tracking, and any activity where progress is incremental and the final objective is clear.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
