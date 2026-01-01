'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculatePercentError } from '@/lib/calculators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Thermometer, Sigma } from 'lucide-react';

const formSchema = z.object({
    observedValue: z.coerce.number(),
    trueValue: z.coerce.number().refine(n => n !== 0, 'True value cannot be zero.'),
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
    { name: 'Percent to Goal', href: '/category/education/maths/percent-to-goal-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function PercentErrorCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculatePercentError> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { observedValue: undefined, trueValue: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculatePercentError(data.observedValue, data.trueValue);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Percent Error Calculator</CardTitle>
                    <CardDescription>Calculate the percentage error between an observed value and a true value.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="observedValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Observed Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 9.8" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="trueValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>True Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 10" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Percent Error</Button>
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
                            <p className="text-sm text-muted-foreground">Percent Error</p>
                            <p className="text-4xl font-bold text-primary">{result.percentError}%</p>
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
                        <h3 className="font-semibold text-lg">Observed Value</h3>
                        <p className="text-muted-foreground">This is the value that was measured or obtained through experimentation. It is also known as the experimental value.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">True Value</h3>
                        <p className="text-muted-foreground">This is the theoretical, accepted, or actual value of the quantity being measured. It serves as the benchmark against which the observed value is compared.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Percent error is a measure of how inaccurate a measurement is, relative to the correct value. It is calculated by finding the absolute difference between the observed and true values, dividing by the true value, and multiplying by 100.</p>
                    <div className="p-4 bg-muted/50 rounded-lg mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Percent Error = (|Observed Value - True Value| / True Value) × 100</p>
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
                    <CardTitle>In-Depth Guide to Percent Error</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Understanding Precision vs. Accuracy</h2>
                    <p>In scientific and technical fields, it's crucial to understand the difference between precision and accuracy. Percent error is a direct measure of **accuracy**.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>**Accuracy** refers to how close a measured value is to the true or accepted value. A low percent error indicates high accuracy.</li>
                        <li>**Precision** refers to how close multiple measurements of the same quantity are to each other, regardless of how close they are to the true value.</li>
                    </ul>

                    <h2 className="text-xl font-bold text-foreground">Interpreting Percent Error</h2>
                    <p>What constitutes an "acceptable" percent error depends heavily on the context of the work being performed. In some fields, a 10% error is perfectly normal, while in others, anything over 0.1% is considered a failure.</p>

                    <div className="w-full overflow-x-auto shadow-sm border rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-left font-semibold text-foreground">
                                <tr>
                                    <th className="p-3 border-b">Field</th>
                                    <th className="p-3 border-b">Typical Acceptable Error</th>
                                    <th className="p-3 border-b">Reasoning</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">High School Chemistry</td>
                                    <td className="p-3">5-10%</td>
                                    <td className="p-3">Accounts for less precise equipment and basic experimental techniques.</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">University Physics Lab</td>
                                    <td className="p-3">1-5%</td>
                                    <td className="p-3">More sophisticated equipment and rigorous methods allow for greater accuracy.</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Professional Engineering</td>
                                    <td className="p-3">{'<'} 1%</td>
                                    <td className="p-3">Safety and structural integrity require high precision and tight tolerances.</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Pharmaceutical Manufacturing</td>
                                    <td className="p-3">{'<'} 0.1%</td>
                                    <td className="p-3">Extremely high accuracy is required for the safety and efficacy of medications.</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">Aerospace Engineering</td>
                                    <td className="p-3">{'<'} 0.01%</td>
                                    <td className="p-3">Extreme precision is required for navigation and structural performance in space.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-xl font-bold text-foreground">Common Sources of Error in Measurements</h2>
                    <p>If you find a high percent error in your results, it's usually due to one of three types of error:</p>
                    <ol className="list-decimal pl-5 space-y-3">
                        <li><strong>Systematic Errors:</strong> These are consistent, repeatable errors usually caused by a problem with the measuring instrument (e.g., a scale that isn't zeroed) or a flawed experimental design.</li>
                        <li><strong>Random Errors:</strong> These are unpredictable fluctuations that can occur due to environmental factors (temperature changes) or small, unintentional variations in how a person reads an instrument.</li>
                        <li><strong>Human Error:</strong> These are simple mistakes, such as miscalculating a value, misreading a scale, or incorrectly recording data.</li>
                    </ol>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Can percent error be negative?</AccordionTrigger>
                            <AccordionContent>
                                <p>No. By convention, percent error is almost always expressed as a positive value. This is because we use the "absolute value" of the difference (the magnitude of the error), as we are usually interested in how *far off* the measurement is, regardless of whether it's too high or too low.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What's the difference between percent error and percent change?</AccordionTrigger>
                            <AccordionContent>
                                <p>Percent error measures how close an experimental value is to a known, theoretical "true" value. Percent change is used to compare two different experimental or observed values, usually to show how a value has changed over time.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What if the true value is zero?</AccordionTrigger>
                            <AccordionContent>
                                <p>If the true (theoretical) value is zero, the percent error formula becomes mathematically undefined because you cannot divide by zero. In such cases, other statistical measures like "residual" or "absolute error" are used instead.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Is a low percent error always good?</AccordionTrigger>
                            <AccordionContent>
                                <p>Generally, yes, as it indicates high accuracy. However, a "too good to be true" low percent error can sometimes suggest that data was manipulated or that the experiment was not sensitive enough to detect real variations.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>What is the difference between "Relative Error" and "Percent Error"?</AccordionTrigger>
                            <AccordionContent>
                                <p>Relative error is the ratio of the absolute error to the true value (expressed as a decimal). Percent error is simply the relative error multiplied by 100 to express it as a percentage.</p>
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
                        The Percent Error Calculator is a fundamental tool for anyone involved in scientific research, engineering, or education. By quantifying the accuracy of experimental measurements relative to established benchmarks, it provides a standardized measure of data quality. Understanding percent error not only helps in validating results but also in identifying potential flaws in experimental design and equipment calibration, ultimately leading to more robust and reliable scientific outcomes.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
