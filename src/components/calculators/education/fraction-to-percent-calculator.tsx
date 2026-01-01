'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as x from 'zod';
import { calculateFractionToPercent } from '@/lib/calculators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Sigma } from 'lucide-react';

const formSchema = x.object({
    numerator: x.coerce.number(),
    denominator: x.coerce.number().refine(n => n !== 0, 'Denominator cannot be zero.'),
});

type FormValues = x.infer<typeof formSchema>;

const relatedCalculators: { name: string; href: string }[] = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/category/education/maths/comparative-difference-calculator' },
    { name: 'Compounding Increase', href: '/category/education/maths/compounding-increase-calculator' },
    { name: 'Doubling Time', href: '/category/education/maths/doubling-time-calculator' },
    { name: 'Fuel Cost', href: '/category/education/maths/fuel-cost-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function FractionToPercentCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateFractionToPercent> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { numerator: undefined, denominator: undefined },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateFractionToPercent(data.numerator, data.denominator);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Fraction to Percent Calculator</CardTitle>
                    <CardDescription>Convert any fraction into its percentage equivalent.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <FormField
                                    control={form.control}
                                    name="numerator"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Numerator (Top Number)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 3" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="denominator"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Denominator (Bottom Number)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Convert to Percent</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Conversion Result</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">{form.getValues('numerator')} / {form.getValues('denominator')} is equal to</p>
                            <p className="text-4xl font-bold text-primary">{result.percentage}%</p>
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
                        <h3 className="font-semibold text-lg">Numerator</h3>
                        <p className="text-muted-foreground">The top number in a fraction. It represents how many parts of the whole you have. For example, in 3/4, the numerator is 3.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Denominator</h3>
                        <p className="text-muted-foreground">The bottom number in a fraction. It represents the total number of equal parts the whole is divided into. For example, in 3/4, the denominator is 4. It cannot be zero.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>To convert a fraction to a percentage, you first divide the numerator by the denominator to get a decimal value. Then, you multiply that decimal value by 100 to get the percentage.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Percentage = (Numerator / Denominator) × 100</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">For example, for the fraction 3/4, you would calculate `(3 / 4) * 100 = 0.75 * 100 = 75%`.</p>
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
                    <CardTitle>A Practical Guide to Converting Fractions to Percentages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Making Sense of Parts of a Whole</h2>
                    <p>Fractions, decimals, and percentages are three different ways of expressing the same thing: a part of a whole. While fractions are precise, they are not always the most intuitive for comparing values. Percentages, which standardize the 'whole' to be 100, are often easier to understand and compare at a glance. This calculator is a simple tool to bridge that gap.</p>

                    <h3 className="text-lg font-semibold text-foreground">Why Do We Convert Fractions to Percentages?</h3>
                    <p>We perform this conversion constantly in everyday life, often without thinking about it. The primary reason is for **standardization and comparison**.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Comparing Performance:</strong> Is it better to get 21 out of 25 questions right on a test, or 32 out of 40? Converting to percentages makes it easy: 21/25 is 84%, while 32/40 is 80%. The first score is better.</li>
                        <li><strong>Understanding Proportions:</strong> A report might state that 1 in 8 people in a town use public transport. Converting 1/8 to a percentage tells us that 12.5% of the town's population uses public transport, which is often a more useful figure for communication.</li>
                        <li><strong>Communicating Discounts:</strong> A sign that says "1/4 Off" is easily understood, but for more complex fractions like "3/8 Off," converting to a percentage (37.5%) makes the discount clearer to shoppers.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">The Fundamental Rule: Division by Zero is Undefined</h3>
                    <p>The denominator of a fraction tells us how many equal pieces a whole has been divided into. It is a logical and mathematical impossibility to divide a whole into zero pieces. If you try, the result is "undefined." That's why this calculator, and all of mathematics, prohibits a denominator of zero.</p>

                    <h3 className="text-lg font-semibold text-foreground">Proper vs. Improper Fractions</h3>
                    <p>This calculator handles both types of fractions seamlessly:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>A **proper fraction** has a numerator smaller than its denominator (e.g., 3/4). The resulting percentage will always be less than 100%.</li>
                        <li>An **improper fraction** has a numerator larger than or equal to its denominator (e.g., 5/4). This represents more than one whole, and the resulting percentage will be 100% or greater (in this case, 125%).</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">Common Fraction to Percent Conversions</h3>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[300px] text-sm">
                            <thead className="text-left font-semibold text-foreground">
                                <tr>
                                    <th className="p-2 border-b">Fraction</th>
                                    <th className="p-2 border-b">Decimal</th>
                                    <th className="p-2 border-b">Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b"><td className="p-2">1/2</td><td className="p-2">0.5</td><td className="p-2">50%</td></tr>
                                <tr className="border-b"><td className="p-2">1/3</td><td className="p-2">0.333...</td><td className="p-2">33.33%</td></tr>
                                <tr className="border-b"><td className="p-2">1/4</td><td className="p-2">0.25</td><td className="p-2">25%</td></tr>
                                <tr className="border-b"><td className="p-2">1/5</td><td className="p-2">0.20</td><td className="p-2">20%</td></tr>
                                <tr className="border-b"><td className="p-2">3/4</td><td className="p-2">0.75</td><td className="p-2">75%</td></tr>
                                <tr><td className="p-2">5/4</td><td className="p-2">1.25</td><td className="p-2">125%</td></tr>
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
                            <AccordionTrigger>What if my numerator is larger than my denominator?</AccordionTrigger>
                            <AccordionContent>
                                <p>This is an "improper fraction," and it's perfectly fine. It simply means the value is greater than one whole. The calculator will correctly produce a percentage greater than 100%. For example, the fraction 5/4 converts to `(5 / 4) * 100 = 125%`.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How do I convert a percentage back to a fraction?</AccordionTrigger>
                            <AccordionContent>
                                <p>To convert a percentage back to a fraction, you write the percentage value as the numerator over a denominator of 100, then simplify the fraction. For example, 40% becomes 40/100. You can then divide both the top and bottom by their greatest common divisor (which is 20) to simplify it to 2/5.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What about mixed numbers (e.g., 1 ¾)?</AccordionTrigger>
                            <AccordionContent>
                                <p>To convert a mixed number, first turn it into an improper fraction. Multiply the whole number by the denominator and add the numerator: for 1 ¾, that's `(1 * 4) + 3 = 7`. Keep the same denominator. So, 1 ¾ is the same as 7/4. Then you can use the calculator: `(7 / 4) * 100 = 175%`.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Why does the calculator give a result with two decimal places?</AccordionTrigger>
                            <AccordionContent>
                                <p>Some fractions result in repeating decimals (e.g., 1/3 = 0.333...). For practicality, the result is rounded to two decimal places, which is a standard convention for most financial and general-purpose calculations. For example, 1/3 will be displayed as 33.33%.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Can I use negative numbers?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. The math works the same way. A negative numerator or denominator will result in a negative percentage. For example, -1/4 is equal to -25%. This might be used to represent a negative proportion or a decrease relative to a whole.</p>
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
                        The Fraction to Percent Calculator is a straightforward but essential tool for converting any fractional value into a more intuitive percentage. By dividing the numerator by the denominator and multiplying by 100, it helps translate precise mathematical parts into a standardized format that is easier to understand, compare, and use in everyday situations like interpreting test scores, survey results, or sales discounts.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
