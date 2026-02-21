'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateSlopePercentage } from '@/lib/calculators';
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
    { name: 'Time Percentage', href: '/time-percentage-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function SlopePercentageCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateSlopePercentage> | null>(null);

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
                            <p className="text-sm text-muted-foreground">Slope Percentage (Grade)</p>
                            <p className="text-4xl font-bold text-primary">{result.slope}%</p>
                            <p className="text-sm text-muted-foreground mt-2">Corresponds to an angle of {result.angle}°</p>
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
                        <p className="text-muted-foreground">The vertical distance between two points. A positive value indicates an upward slope, while a negative value indicates a downward slope.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Run</h3>
                        <p className="text-muted-foreground">The horizontal distance between the same two points. It must be a non-zero value.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The slope percentage, or grade, is a measure of steepness. It's calculated by dividing the vertical change (rise) by the horizontal change (run) and then multiplying by 100.</p>
                    <div className="p-4 bg-muted/50 rounded-lg mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Slope % = (Rise / Run) × 100</p>
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
                    <CardTitle>In-Depth Guide to Slope Percentage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground font-title">Visualizing Steepness: Grade vs. Degrees</h2>
                    <p>Slope is a fundamental concept in mathematics, engineering, and geography, but it's expressed in several ways. This calculator focuses on **slope percentage**, also known as **grade**. It's important to distinguish this from slope measured in degrees.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>**Slope Percentage (Grade):** A 100% slope means that for every 100 units of horizontal distance, there is a 100-unit vertical rise. This corresponds to a 45-degree angle. It's a linear measure of steepness.</li>
                        <li>**Slope in Degrees:** This measures the angle of the slope relative to the horizontal plane. A 90-degree slope is a vertical cliff face, which would have an infinite slope percentage.</li>
                    </ul>
                    <p>A 10% grade is much less steep than a 10-degree angle. Civil engineers and construction professionals typically use grade (percentage) because it directly relates to construction measurements (e.g., "a 2-inch drop for every 100 inches of pipe").</p>

                    <h2 className="text-xl font-bold text-foreground font-title">Real-World Applications</h2>
                    <div className="w-full overflow-x-auto shadow-sm border rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-left font-semibold text-foreground">
                                <tr>
                                    <th className="p-3 border-b">Application</th>
                                    <th className="p-3 border-b">Typical Slope %</th>
                                    <th className="p-3 border-b">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-3 align-top font-medium">Road Construction</td>
                                    <td className="p-3 align-top text-center text-primary font-bold">2% - 10%</td>
                                    <td className="p-3 align-top">Highways have gentle grades for safety and vehicle performance. A 6% grade is considered steep for a major road.</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 align-top font-medium">Wheelchair Ramps (ADA)</td>
                                    <td className="p-3 align-top text-center text-primary font-bold">Max 8.33%</td>
                                    <td className="p-3 align-top">The Americans with Disabilities Act (ADA) mandates a maximum slope of 1:12 (1 unit of rise for every 12 units of run).</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 align-top font-medium">Plumbing & Drainage</td>
                                    <td className="p-3 align-top text-center text-primary font-bold">1% - 2%</td>
                                    <td className="p-3 align-top">A slight downward slope (approx. 1/4" per foot) is essential to ensure water flows correctly due to gravity.</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 align-top font-medium">Roof Pitch</td>
                                    <td className="p-3 align-top text-center text-primary font-bold">33% - 100%</td>
                                    <td className="p-3 align-top">Steeper roofs are used in snowy climates to shed snow. Pitch is often expressed as a ratio (e.g., 4:12).</td>
                                </tr>
                                <tr>
                                    <td className="p-3 align-top font-medium">Ski Slopes</td>
                                    <td className="p-3 align-top text-center text-primary font-bold">10% to &gt;70%</td>
                                    <td className="p-3 align-top">Ski resorts use grade to classify difficulty. A black diamond trail can easily exceed a 40% grade.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-xl font-bold text-foreground font-title">Calculating from Coordinates</h2>
                    <p>If you have two points on a graph, (x₁, y₁) and (x₂, y₂), you can easily find the rise and run to calculate the slope percentage.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>**Rise** = y₂ - y₁</li>
                        <li>**Run** = x₂ - x₁</li>
                    </ul>
                    <p>For example, to find the slope between point A (2, 3) and point B (6, 11):</p>
                    <ul className="list-none space-y-1 font-mono text-sm bg-muted p-4 rounded-lg">
                        <li>Rise = 11 - 3 = 8</li>
                        <li>Run = 6 - 2 = 4</li>
                        <li>Slope % = (8 / 4) * 100 = 200%</li>
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
                            <AccordionTrigger>What is a 100% slope?</AccordionTrigger>
                            <AccordionContent>
                                <p>A 100% slope is a slope that has a rise equal to its run. For every 1 unit of horizontal travel, you go up 1 unit vertically. This corresponds to a 45-degree angle.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Can the slope percentage be greater than 100%?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. Any slope steeper than a 45-degree angle will have a slope percentage greater than 100%. For example, a rise of 2 with a run of 1 gives a 200% slope.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Why is the run not allowed to be zero?</AccordionTrigger>
                            <AccordionContent>
                                <p>A run of zero means there is no horizontal change, which describes a perfectly vertical line. In mathematics, the slope of a vertical line is considered "undefined" because it involves division by zero. Therefore, it's impossible to calculate a slope percentage.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Can the slope be negative?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. A negative slope percentage simply means the slope is trending downwards. This occurs when the 'rise' is a negative number (i.e., it's a drop). A slope of -10% means you go down 10 units for every 100 units you move horizontally.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>How do I convert slope percentage to degrees?</AccordionTrigger>
                            <AccordionContent>
                                <p>You can use trigonometry. The formula is: Angle in Degrees = arctan(Slope % / 100). The arctan (or inverse tangent) function is available on most scientific calculators. For example, for a 100% slope: `arctan(100 / 100) = arctan(1) = 45` degrees.</p>
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
                        The Slope Percentage Calculator provides a standardized measure of steepness, commonly known as grade. By calculating the ratio of vertical rise to horizontal run, it offers a crucial metric used in civil engineering, construction, landscaping, and geography. Understanding slope percentage is key to designing safe roads, ensuring proper drainage, complying with accessibility standards, and describing terrain.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
