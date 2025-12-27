'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateRelativeChange } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Sigma, TrendingUp, TrendingDown } from 'lucide-react';

const formSchema = z.object({
    oldValue: z.coerce.number().refine(n => n !== 0, 'Original value cannot be zero.'),
    newValue: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/category/education/maths/comparative-difference-calculator' },
    { name: 'Historic Change', href: '/category/education/maths/historic-change-calculator' },
    { name: 'Slope Percentage', href: '/category/education/maths/slope-percentage-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function RelativeChangeCalculator() {
    const [result, setResult] = useState<{ change: string; direction: 'increase' | 'decrease' | 'no change' } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { oldValue: undefined, newValue: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateRelativeChange(data.oldValue, data.newValue);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Relative Change Calculator</CardTitle>
                    <CardDescription>Calculate the percentage increase or decrease from an original value to a new value.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="oldValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Original Value (Old)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="newValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 125" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Relative Change</Button>
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
                        <div className={`p-6 rounded-lg ${result.direction === 'increase' ? 'bg-green-500/10' : result.direction === 'decrease' ? 'bg-red-500/10' : 'bg-primary/10'}`}>
                            <p className="text-sm text-muted-foreground">Relative Change</p>
                            <div className="flex items-center justify-center gap-2">
                                <p className={`text-4xl font-bold ${result.direction === 'increase' ? 'text-green-600' : result.direction === 'decrease' ? 'text-red-600' : 'text-primary'}`}>{result.change}%</p>
                                {result.direction === 'increase' && <TrendingUp className="w-8 h-8 text-green-600" />}
                                {result.direction === 'decrease' && <TrendingDown className="w-8 h-8 text-red-600" />}
                            </div>
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
                        <h3 className="font-semibold text-lg">Original Value</h3>
                        <p className="text-muted-foreground">The starting point or reference value.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">New Value</h3>
                        <p className="text-muted-foreground">The value to compare against the original.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Relative Change = ((New Value - Original Value) / Original Value) × 100</p>
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
                            <AccordionTrigger>What if the result is negative?</AccordionTrigger>
                            <AccordionContent>
                                <p>A negative result indicates a decrease from the original value to the new value.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
