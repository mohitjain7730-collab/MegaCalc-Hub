'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateTimePercentage } from '@/lib/calculators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Sigma } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
    partialTimeHours: z.coerce.number().min(0).default(0),
    partialTimeMinutes: z.coerce.number().min(0).default(0),
    partialTimeSeconds: z.coerce.number().min(0).default(0),
    totalTimeHours: z.coerce.number().min(0).default(0),
    totalTimeMinutes: z.coerce.number().min(0).default(0),
    totalTimeSeconds: z.coerce.number().min(0).default(0),
}).refine(data => (data.totalTimeHours * 3600 + data.totalTimeMinutes * 60 + data.totalTimeSeconds) > 0, {
    message: "Total time must be greater than zero.",
    path: ["totalTimeHours"],
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators: { name: string; href: string }[] = [
    { name: 'Average Percentage', href: '/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/comparative-difference-calculator' },
    { name: 'Compounding Increase', href: '/compounding-increase-calculator' },
    { name: 'Doubling Time', href: '/doubling-time-calculator' },
    { name: 'Fraction to Percent', href: '/fraction-to-percent-calculator' },
    { name: 'Fuel Cost', href: '/fuel-cost-calculator' },
    { name: 'Historic Change', href: '/historic-change-calculator' },
    { name: 'Investment Growth', href: '/investment-growth-calculator' },
    { name: 'Percentage of a Percentage', href: '/percentage-of-a-percentage-calculator' },
    { name: 'Percentage Point', href: '/percentage-point-calculator' },
    { name: 'Value Percentage', href: '/value-percentage-calculator' },
    { name: 'Percent Error', href: '/percent-error-calculator' },
    { name: 'Percent to Goal', href: '/percent-to-goal-calculator' },
    { name: 'Relative Change', href: '/relative-change-calculator' },
    { name: 'Slope Percentage', href: '/slope-percentage-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function TimePercentageCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateTimePercentage> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            partialTimeHours: 0,
            partialTimeMinutes: 0,
            partialTimeSeconds: 0,
            totalTimeHours: 0,
            totalTimeMinutes: 0,
            totalTimeSeconds: 0
        },
    });

    const onSubmit = (data: FormValues) => {
        const partialSeconds = data.partialTimeHours * 3600 + data.partialTimeMinutes * 60 + data.partialTimeSeconds;
        const totalSeconds = data.totalTimeHours * 3600 + data.totalTimeMinutes * 60 + data.totalTimeSeconds;
        const res = calculateTimePercentage(partialSeconds, totalSeconds);
        setResult(res);
    };

    const percentage = result ? parseFloat(result.percentage) : 0;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Time Percentage Calculator</CardTitle>
                    <CardDescription>Calculate what percentage a smaller duration of time is of a larger total duration.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <FormLabel className="text-base font-semibold">Partial Time</FormLabel>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    <FormField control={form.control} name="partialTimeHours" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Hours" {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="partialTimeMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Minutes" {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="partialTimeSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Seconds" {...field} /></FormControl></FormItem>)} />
                                </div>
                            </div>
                            <div>
                                <FormLabel className="text-base font-semibold">Total Time</FormLabel>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    <FormField control={form.control} name="totalTimeHours" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Hours" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="totalTimeMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Minutes" {...field} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="totalTimeSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Seconds" {...field} /></FormControl></FormItem>)} />
                                </div>
                            </div>
                            <Button type="submit">Calculate Time Percentage</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Time Percentage Result</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">The partial time is</p>
                            <p className="text-4xl font-bold text-primary">{result.percentage}%</p>
                            <p className="text-sm text-muted-foreground">of the total time.</p>
                        </div>
                        <div className="space-y-2">
                            <Progress value={percentage > 100 ? 100 : percentage} className="h-3 w-full" />
                            <p className="text-xs text-muted-foreground italic">Visual progress capped at 100%</p>
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
                        <h3 className="font-semibold text-lg">Partial Time</h3>
                        <p className="text-muted-foreground">The smaller portion of time you want to analyze (e.g., 30 minutes).</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Total Time</h3>
                        <p className="text-muted-foreground">The whole duration that represents 100% (e.g., 2 hours).</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator first converts both the partial and total times into a single common unit (seconds). Then, it divides the partial time by the total time and multiplies the result by 100 to get the final percentage.</p>
                    <div className="p-4 bg-muted/50 rounded-lg mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Time % = (Partial Time in Seconds / Total Time in Seconds) × 100</p>
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
                    <CardTitle>In-Depth Guide to Time Percentages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground font-title">Putting Time into Perspective</h2>
                    <p>Time is a constant, but our perception of it is relative. Calculating time as a percentage is a powerful way to contextualize durations, manage schedules, and analyze data. It answers the question: "How much of this total time block does this smaller time block represent?" This is essentially the same logic as our Percent to Goal calculator, but framed specifically for the universal metric of time.</p>

                    <h2 className="text-xl font-bold text-foreground font-title">The Importance of a Common Unit</h2>
                    <p>The core challenge in comparing time durations is that we use a mixed-base system (60 seconds in a minute, 60 minutes in an hour, 24 hours in a day). You can't simply divide minutes by hours and get a meaningful result. The first and most critical step, which this calculator handles automatically, is to convert all inputs into a single, common unit. Seconds are the most logical choice for this base unit.</p>
                    <p>For example, to find what percentage 45 minutes is of 2 hours:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Convert partial time to seconds: 45 minutes * 60 seconds/minute = 2,700 seconds.</li>
                        <li>Convert total time to seconds: 2 hours * 60 minutes/hour * 60 seconds/minute = 7,200 seconds.</li>
                        <li>Calculate the percentage: `(2700 / 7200) * 100 = 0.375 * 100 = 37.5%`.</li>
                    </ol>
                    <p>So, 45 minutes is 37.5% of 2 hours.</p>

                    <h2 className="text-xl font-bold text-foreground font-title">Applications in Daily Life and Business</h2>
                    <ul className="list-disc pl-5 space-y-3">
                        <li><strong>Project Management:</strong> If a project has a total timeline of 80 hours and a specific task took 6 hours, that task consumed `(6 / 80) * 100 = 7.5%` of the total project time. This helps in analyzing resource allocation and identifying bottlenecks.</li>
                        <li><strong>Media and Content Creation:</strong> A YouTuber might analyze audience retention. If a 15-minute video has an average watch time of 4.5 minutes, the average viewer watched `30%` of the video.</li>
                        <li><strong>Personal Productivity:</strong> If you spend 1 hour and 30 minutes on social media during an 8-hour workday, you've spent `18.75%` of your workday on non-work activities. This can be a powerful realization for time management.</li>
                        <li><strong>Workout Planning:</strong> You're planning a 1-hour workout. If your warm-up is 10 minutes, it represents `16.7%` of your total workout time.</li>
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
                            <AccordionTrigger>Can the partial time be longer than the total time?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. The calculator will correctly produce a percentage greater than 100%. This might be useful in situations like tracking overtime. If the standard workday is 8 hours and an employee works 10 hours, they worked `(10 / 8) * 100 = 125%` of their standard day.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What's the easiest way to find the percentage of a day?</AccordionTrigger>
                            <AccordionContent>
                                <p>To find what percentage a duration is of a full 24-hour day, you would set the "Total Time" to 24 hours (and 0 minutes, 0 seconds). For example, 6 hours is `(6 / 24) * 100 = 25%` of a day.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>How can I calculate the remaining time percentage?</AccordionTrigger>
                            <AccordionContent>
                                <p>Once you have the percentage of time that has passed, subtract it from 100%. If 30% of an event's time has passed, then 70% of the time remains.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Why do I need to input hours, minutes, and seconds separately?</AccordionTrigger>
                            <AccordionContent>
                                <p>This format allows for maximum flexibility and accuracy. It prevents you from having to manually convert everything to a decimal format (e.g., 1 hour and 30 minutes is 1.5 hours), which can be error-prone. The calculator handles the conversion to a single unit (seconds) internally.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Can I calculate time from dates?</AccordionTrigger>
                            <AccordionContent>
                                <p>This calculator is designed for durations, not specific dates. To find the percentage of time passed between two dates, you would typically need to calculate the number of days passed and divide by the total number of days in that year or period.</p>
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
                        The Time Percentage Calculator is a practical tool for contextualizing time. By converting different time units into a standardized percentage, it helps users understand proportions, manage schedules, and analyze time-based data effectively. Whether for project management, personal productivity, or content analysis, this calculator provides a clear and intuitive way to see how smaller durations fit within a larger whole.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
