'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateDoublingTime } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Sigma } from 'lucide-react';

const formSchema = z.object({
    growthRate: z.coerce.number().positive('Growth rate must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/category/education/maths/comparative-difference-calculator' },
    { name: 'Compounding Increase', href: '/category/education/maths/compounding-increase-calculator' },
    { name: 'Fraction to Percent', href: '/category/education/maths/fraction-to-percent-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function DoublingTimeCalculator() {
    const [result, setResult] = useState<{ years: string; exactYears: string } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { growthRate: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateDoublingTime(data.growthRate);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Doubling Time Calculator</CardTitle>
                    <CardDescription>Estimate how long it will take for a quantity to double at a constant growth rate.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="growthRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Growth Rate (%) per Period</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Calculate Doubling Time</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Calculation Result</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">Estimate (Rule of 72)</p>
                            <p className="text-4xl font-bold text-primary">{result.years} periods</p>
                        </div>
                        <div className="p-6 bg-accent/20 rounded-lg">
                            <p className="text-sm text-muted-foreground">Exact Formula</p>
                            <p className="text-4xl font-bold text-accent">{result.exactYears} periods</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" />Understanding the Input</CardTitle>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold text-lg">Growth Rate (%) per Period</h3>
                    <p className="text-muted-foreground">This is the constant percentage increase that occurs in each time period.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This calculator uses the Rule of 72 for a quick estimate and the logarithmic formula for precision.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-4 mt-4">
                        <div>
                            <h4 className="font-semibold text-primary">Exact Formula</h4>
                            <p className="font-mono text-sm md:text-base">Time = ln(2) / ln(1 + (Rate / 100))</p>
                        </div>
                        <hr />
                        <div>
                            <h4 className="font-semibold text-accent">Rule of 72</h4>
                            <p className="font-mono text-sm md:text-base">Time ≈ 72 / Rate</p>
                        </div>
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
        </div>
    );
}
