'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateSlopePercentage } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Sigma } from 'lucide-react';

const formSchema = z.object({
    rise: z.coerce.number(),
    run: z.coerce.number().refine(n => n !== 0, 'Run cannot be zero.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Fraction to Percent', href: '/category/education/maths/fraction-to-percent-calculator' },
    { name: 'Percent Error', href: '/category/education/maths/percent-error-calculator' },
    { name: 'Percentage Point', href: '/category/education/maths/percentage-point-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function SlopePercentageCalculator() {
    const [result, setResult] = useState<{ slope: string } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { rise: undefined, run: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateSlopePercentage(data.rise, data.run);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Slope Percentage Calculator</CardTitle>
                    <CardDescription>Calculate the slope or grade of a line as a percentage.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="rise"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rise (Vertical Change)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="run"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Run (Horizontal Change)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Slope Percentage</Button>
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
                            <p className="text-sm text-muted-foreground">Slope Percentage</p>
                            <p className="text-4xl font-bold text-primary">{result.slope}%</p>
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
                        <h3 className="font-semibold text-lg">Rise</h3>
                        <p className="text-muted-foreground">The vertical distance between two points.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Run</h3>
                        <p className="text-muted-foreground">The horizontal distance between two points.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Slope % = (Rise / Run) × 100</p>
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
                            <AccordionTrigger>What does 100% slope mean?</AccordionTrigger>
                            <AccordionContent>
                                <p>A 100% slope means the rise is equal to the run (a 45-degree angle).</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
