'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculatePercentageOfPercentage } from '@/lib/calculators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Percent, Sigma } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
    percentage1: z.coerce.number(),
    percentage2: z.coerce.number(),
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
    { name: 'Percentage Point', href: '/category/education/maths/percentage-point-calculator' },
    { name: 'Percent Error', href: '/category/education/maths/percent-error-calculator' },
    { name: 'Percent to Goal', href: '/category/education/maths/percent-to-goal-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function PercentageOfPercentageCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculatePercentageOfPercentage> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { percentage1: undefined, percentage2: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculatePercentageOfPercentage(data.percentage1, data.percentage2);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Percentage of a Percentage Calculator</CardTitle>
                    <CardDescription>Calculate what one percentage of another percentage equals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <FormField
                                    control={form.control}
                                    name="percentage1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>What is [X]%</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="percentage2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>of [Y]%?</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 20" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate</Button>
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
                            <p className="text-sm text-muted-foreground">{form.getValues('percentage1')}% of {form.getValues('percentage2')}% is</p>
                            <p className="text-4xl font-bold text-primary">{result.result}%</p>
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
                        <h3 className="font-semibold text-lg">Percentage X and Percentage Y</h3>
                        <p className="text-muted-foreground">These are the two percentages you want to combine. The calculator finds X percent of Y percent, which is useful for nested proportions.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>To find a percentage of a percentage, you must first convert both percentages into their decimal equivalents by dividing each by 100. Then, you multiply these two decimals together. Finally, to express the result as a percentage again, you multiply it by 100.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Result % = (Percentage1 / 100) * (Percentage2 / 100) * 100</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">This simplifies to `(Percentage1 * Percentage2) / 100`.</p>
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
                    <CardTitle>A Guide to Understanding Nested Proportions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground font-title">A Guide to Understanding Nested Proportions</h2>
                    <p>This calculation is an essential tool for dealing with data that involves a **subset of a subset**. Calculating a percentage of a percentage allows you to see the true impact or size of a niche group within a larger population.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Common Mistake: Accidental Addition</h3>
                    <p>A frequent error when hearing "10% of 20%" is to think the answer is 30% or some other additive figure. In reality, a "percentage of a percentage" is always smaller than the base percentage (unless the first percentage is greater than 100%). You are taking a slice of an already-existing slice, meaning the final piece of the pie is naturally smaller.</p>

                    <h3 className="text-lg font-semibold text-foreground">Real-World Example: Survey Data</h3>
                    <p>Imagine a clear real-world scenario where this math is vital:</p>
                    <Alert>
                        <Percent className="h-4 w-4" />
                        <AlertTitle>Dogs and Diets</AlertTitle>
                        <AlertDescription>
                            A national survey finds that **40%** of the country's population owns a dog. A follow-up survey specifically of those dog owners finds that **20%** of them feed their dog a raw-food diet.
                        </AlertDescription>
                    </Alert>
                    <p className="mt-4 italic font-semibold text-foreground underline decoration-primary underline-offset-4">The Question: What percentage of the TOTAL population follows this trend?</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Step 1: Convert to decimals: 0.40 (dog owners) and 0.20 (raw feeders).</li>
                        <li>Step 2: Multiply: 0.40 * 0.20 = 0.08.</li>
                        <li>Step 3: Convert back: 0.08 * 100 = 8%.</li>
                    </ul>
                    <p>The final answer is that 8% of the total population own a dog AND feed it a raw-food diet.</p>

                    <h3 className="text-lg font-semibold text-foreground">Another Application: Cascading Financial Effects</h3>
                    <p>This logic is also critical in finance, such as when calculating commissions or taxes on already-discounted items.</p>
                    <div className="w-full overflow-x-auto shadow-sm border rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-left">
                                <tr>
                                    <th className="p-3 border-b">Scenario</th>
                                    <th className="p-3 border-b text-center">X%</th>
                                    <th className="p-3 border-b text-center">of Y%</th>
                                    <th className="p-3 border-b text-center">Final Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Sales Commission</td>
                                    <td className="p-3 text-center">5% Commission</td>
                                    <td className="p-3 text-center">on 20% Net Profit</td>
                                    <td className="p-3 text-center font-bold text-primary">1% of Sales</td>
                                </tr>
                                <tr className="border-b">
                                    <td className="p-3 font-medium">Retail Discount</td>
                                    <td className="p-3 text-center">15% Extra Off</td>
                                    <td className="p-3 text-center">a 30% Sale Item</td>
                                    <td className="p-3 text-center font-bold text-primary">10.5% Additional</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-medium">Corporate Tax</td>
                                    <td className="p-3 text-center">21% Tax Rate</td>
                                    <td className="p-3 text-center">on 15% Margin</td>
                                    <td className="p-3 text-center font-bold text-primary">3.15% Overall</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Is "50% of 20%" the same as "20% of 50%"?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. Multiplication is commutative, which means the order of the numbers does not change the result. In both cases, the answer is 10%.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How is this different from "percentage points"?</AccordionTrigger>
                            <AccordionContent>
                                <p>They are very different. A percentage point is the simple arithmetic difference between two percentages (e.g., 20% to 25% is a 5 percentage point increase). A percentage of a percentage is multiplicative (e.g., 5% of 20% is 1%).</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Can I calculate three percentages in a row?</AccordionTrigger>
                            <AccordionContent>
                                <p>Absolutely. You would simply repeat the multiplication process. To find 10% of 20% of 50%, you would multiply: `0.10 * 0.20 * 0.50 = 0.01`, or 1%.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Why is the result always smaller than the starting percentages?</AccordionTrigger>
                            <AccordionContent>
                                <p>Because you are multiplying two values that are less than 1. When you multiply two decimals (like 0.5 and 0.5), the resulting number is always smaller than the originals.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>When would I use this in real life?</AccordionTrigger>
                            <AccordionContent>
                                <p>This is constant in business and statistics. It's used for calculating compound interest, tiered commission structures, sales tax on discounted items, and analyzing demographic subsets in research data.</p>
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
                        The "Percentage of a Percentage Controller" is a specialized tool for determining a proportion of an existing proportion. Frequently described as finding a "part of a part," this calculation is critical for accurate financial analysis and proper interpretation of statistical data. Whether you are calculating niche survey results or complex business commissions, understanding the multiplicative relationship between percentages is essential for precision.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
