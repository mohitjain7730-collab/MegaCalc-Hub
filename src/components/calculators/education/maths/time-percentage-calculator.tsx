'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateTimePercentage } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { HelpCircle, Sigma } from 'lucide-react';

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

const relatedCalculators = [
    { name: 'Doubling Time', href: '/category/education/maths/doubling-time-calculator' },
    { name: 'Fuel Cost', href: '/category/education/maths/fuel-cost-calculator' },
    { name: 'Investment Growth', href: '/category/education/maths/investment-growth-calculator' },
    { name: 'Percent to Goal', href: '/category/education/maths/percent-to-goal-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function TimePercentageCalculator() {
    const [result, setResult] = useState<{ percentage: string } | null>(null);

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
                                <FormLabel>Partial Time</FormLabel>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    <FormField control={form.control} name="partialTimeHours" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Hours" {...field} value={field.value === 0 ? '' : field.value} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="partialTimeMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Minutes" {...field} value={field.value === 0 ? '' : field.value} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="partialTimeSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Seconds" {...field} value={field.value === 0 ? '' : field.value} /></FormControl></FormItem>)} />
                                </div>
                            </div>
                            <div>
                                <FormLabel>Total Time</FormLabel>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    <FormField control={form.control} name="totalTimeHours" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Hours" {...field} value={field.value === 0 ? '' : field.value} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="totalTimeMinutes" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Minutes" {...field} value={field.value === 0 ? '' : field.value} /></FormControl></FormItem>)} />
                                    <FormField control={form.control} name="totalTimeSeconds" render={({ field }) => (<FormItem><FormControl><Input type="number" placeholder="Seconds" {...field} value={field.value === 0 ? '' : field.value} /></FormControl></FormItem>)} />
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
                        <CardTitle>Calculation Result</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">The partial time is</p>
                            <p className="text-4xl font-bold text-primary">{result.percentage}%</p>
                            <p className="text-sm text-muted-foreground">of the total time.</p>
                        </div>
                        <Progress value={percentage > 100 ? 100 : percentage} className="w-full" />
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" />Understanding the Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Partial and Total Time</h3>
                        <p className="text-muted-foreground">Enter hours, minutes, and seconds for both the partial duration and the total duration.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Time % = (Partial Time in Seconds / Total Time in Seconds) × 100</p>
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
                            <AccordionTrigger>Why convert to seconds?</AccordionTrigger>
                            <AccordionContent>
                                <p>Converting everything to the smallest unit (seconds) allows for accurate comparison between mixed time formats (like 1h 30m vs 95m).</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
