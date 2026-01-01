'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateAveragePercentage } from '@/lib/calculators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Percent, Sigma, BarChart } from 'lucide-react';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, XAxis, YAxis, CartesianGrid, BarChart as RechartsBarChart } from 'recharts';

const formSchema = z.object({
    percentages: z.string().min(1, 'Please enter at least one percentage value.')
        .refine(s => s.split(',').every(v => !isNaN(parseFloat(v))), 'All values must be valid numbers.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators: { name: string; href: string }[] = [
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
    { name: 'Percent to Goal', href: '/category/education/maths/percent-to-goal-calculator' },
    { name: 'Relative Change', href: '/category/education/maths/relative-change-calculator' },
    { name: 'Slope Percentage', href: '/category/education/maths/slope-percentage-calculator' },
    { name: 'Time Percentage', href: '/category/education/maths/time-percentage-calculator' },
    { name: 'Value Percentage', href: '/category/education/maths/value-percentage-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

const chartConfig = {
    value: {
        label: "Value",
        color: "hsl(var(--primary))",
    },
    average: {
        label: "Average",
        color: "hsl(var(--accent))",
    }
} satisfies ChartConfig;

export default function AveragePercentageCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateAveragePercentage> | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { percentages: '' },
    });

    const onSubmit = (data: FormValues) => {
        const numbers = data.percentages.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        if (numbers.length > 0) {
            const res = calculateAveragePercentage(numbers);
            setResult(res);
            const newChartData = numbers.map((val, index) => ({ name: `Value ${index + 1}`, value: val, average: parseFloat(res.average) }));
            setChartData(newChartData);
        } else {
            setResult(null);
            setChartData([]);
        }
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Average Percentage Calculator</CardTitle>
                    <CardDescription>Calculate the simple arithmetic average of a series of percentages.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="percentages"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Percentages (comma-separated)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 10, 25, 15.5, 30" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Calculate Average</Button>
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
                            <p className="text-sm text-muted-foreground">Average Percentage</p>
                            <p className="text-4xl font-bold text-primary">{result.average}%</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {chartData.length > 0 && result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChart className="w-5 h-5" />Data Visualization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <RechartsBarChart accessibilityLayer data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis unit="%" />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                            </RechartsBarChart>
                        </ChartContainer>
                        <p className="text-center text-sm text-muted-foreground mt-2">The chart shows your input values. The average is {result.average}%.</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5" />Understanding the Input</CardTitle>
                </CardHeader>
                <CardContent>
                    <h3 className="font-semibold text-lg">Percentages</h3>
                    <p className="text-muted-foreground">Enter a list of numbers representing the percentages you want to average. Separate each number with a comma. For example: `10, 20, 30`.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator finds the arithmetic mean. This is the most common type of average. It's calculated by summing all the percentage values and then dividing by the count of those values.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Average = (Sum of Percentages) / (Count of Percentages)</p>
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
                    <CardTitle>A Comprehensive Guide to Averaging Percentages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Understanding Averages: Simple vs. Weighted</h2>
                    <p>Averaging percentages seems simple, but there's a critical distinction that can dramatically affect your results. This calculator computes a **simple average**, which is appropriate in some cases but highly misleading in others. The key lies in understanding the 'weight' behind each percentage.</p>

                    <h3 className="text-lg font-semibold text-foreground">When a Simple Average is Correct</h3>
                    <p>A simple arithmetic average is the right tool when each percentage value you're averaging holds equal importance or represents a group of the same size. In this case, no single percentage has more influence than another.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Example: Equal-Sized Groups.</strong> Imagine three investment funds that are part of your portfolio, and you allocated exactly $1,000 to each. Their annual returns were 5%, 8%, and 11%. Since the investment in each is identical, the average return across these funds is `(5 + 8 + 11) / 3 = 8%`. Your total return for this part of your portfolio is 8%.</li>
                        <li><strong>Example: Equal Weighting.</strong> A student's final grade is based on four exams, each worth 25% of the grade. The scores were 80%, 92%, 88%, and 90%. The average exam score is `(80 + 92 + 88 + 90) / 4 = 87.5%`, which is the final grade.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">When a Simple Average is Misleading: The Case for a Weighted Average</h3>
                    <p>You must NOT use a simple average when the percentages relate to groups of different sizes or importance. Doing so gives disproportionate influence to smaller groups, a statistical trap famously illustrated by **Simpson's Paradox**.</p>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-left font-semibold text-foreground">
                                <tr>
                                    <th className="p-2 border-b">Scenario</th>
                                    <th className="p-2 border-b">Simple Average (Incorrect)</th>
                                    <th className="p-2 border-b">Weighted Average (Correct)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-2 align-top">
                                        A company has two departments.
                                        <ul className="list-disc pl-5 mt-1">
                                            <li>Sales (10 employees): 50% satisfaction</li>
                                            <li>Engineering (90 employees): 90% satisfaction</li>
                                        </ul>
                                    </td>
                                    <td className="p-2 align-top">
                                        `(50 + 90) / 2 = 70%`<br />
                                        <span className="text-destructive text-xs">(Highly misleading)</span>
                                    </td>
                                    <td className="p-2 align-top">
                                        `((50*10) + (90*90)) / (10+90) = 86%`<br />
                                        <span className="text-accent text-xs">(Accurately reflects overall satisfaction)</span>
                                    </td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-2 align-top">
                                        You have two investments.
                                        <ul className="list-disc pl-5 mt-1">
                                            <li>Stock A ($1,000): 10% gain</li>
                                            <li>Stock B ($10,000): 1% gain</li>
                                        </ul>
                                    </td>
                                    <td className="p-2 align-top">
                                        `(10 + 1) / 2 = 5.5%`<br />
                                        <span className="text-destructive text-xs">(Suggests a healthy average return)</span>
                                    </td>
                                    <td className="p-2 align-top">
                                        `((10*1000) + (1*10000)) / (1000+10000) = 1.82%`<br />
                                        <span className="text-accent text-xs">(The small gain on the large investment dominates the return)</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground">How to Calculate a Weighted Average Manually</h3>
                    <p>While this tool doesn't compute weighted averages, the formula is essential to know:</p>
                    <p className="p-4 bg-muted/50 rounded-lg mt-2 text-center font-mono font-bold text-primary">Weighted Avg = Σ(Percentage_i × Weight_i) / Σ(Weight_i)</p>
                    <p>This means you multiply each percentage by its corresponding size (weight), sum up these products, and then divide by the total sum of all weights.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Is this calculator finding the mean, median, or mode?</AccordionTrigger>
                            <AccordionContent>
                                <p>This calculator computes the **arithmetic mean**, often just called the "average." It's the sum of all values divided by the number of values. It does not calculate the median (the middle value in a sorted list) or the mode (the value that appears most often).</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Can I average negative percentages?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. A negative percentage simply represents a decrease, loss, or negative reading. The calculator handles it correctly by including it in the sum. For example, the average of 10, -5, and 20 is `(10 + (-5) + 20) / 3 = 25 / 3 = 8.33%`.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What's the difference between averaging percentages and averaging percentage points?</AccordionTrigger>
                            <AccordionContent>
                                <p>This is a subtle but important distinction. You average percentages when looking for a central tendency of multiple growth rates or proportions (like investment returns). You average percentage points when looking at the average change between rates. For example, if a rate moves from 2% to 3% (a 1 percentage point change) and then from 3% to 5% (a 2 percentage point change), the average change is 1.5 percentage points.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Can I average percentages from different bases (e.g., test score and interest rate)?</AccordionTrigger>
                            <AccordionContent>
                                <p>Mathematically you can, but it is usually meaningless. Averaging percentages is only logical when the percentages refer to the same type of measure (e.g., all are interest rates, all are test scores on comparable tests, etc.). Combining dissimilar measures will not produce a useful or interpretable result.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Why would I need to average percentages?</AccordionTrigger>
                            <AccordionContent>
                                <p>Common scenarios include: calculating the average return of several investments of equal size, finding the average score across multiple equally-weighted tests or assignments, or determining the average growth rate of a metric over several equal time periods (e.g., month-over-month growth).</p>
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
                        The Average Percentage Calculator provides a quick way to find the arithmetic mean of a series of percentage values. It's a fundamental tool for finding a central tendency in data, but it's crucial to use it correctly: it is most accurate and meaningful when all the percentages are drawn from groups of equal size or importance. For groups of varying sizes, a weighted average is the appropriate method.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
