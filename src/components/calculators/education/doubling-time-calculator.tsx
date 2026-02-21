'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as x from 'zod';
import { calculateDoublingTime } from '@/lib/calculators';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { HelpCircle, Sigma } from 'lucide-react';

const formSchema = x.object({
    growthRate: x.coerce.number().positive('Growth rate must be a positive number.'),
});

type FormValues = x.infer<typeof formSchema>;

const relatedCalculators: { name: string; href: string }[] = [
    { name: 'Average Percentage', href: '/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/comparative-difference-calculator' },
    { name: 'Compounding Increase', href: '/compounding-increase-calculator' },
    { name: 'Fraction to Percent', href: '/fraction-to-percent-calculator' },
    { name: 'Fuel Cost', href: '/fuel-cost-calculator' },
    { name: 'Historic Change', href: '/historic-change-calculator' },
    { name: 'Investment Growth', href: '/investment-growth-calculator' },
    { name: 'Percentage of a Percentage', href: '/percentage-of-a-percentage-calculator' },
    { name: 'Percentage Point', href: '/percentage-point-calculator' },
    { name: 'Percent Error', href: '/percent-error-calculator' },
    { name: 'Percent to Goal', href: '/percent-to-goal-calculator' },
    { name: 'Relative Change', href: '/relative-change-calculator' },
    { name: 'Slope Percentage', href: '/slope-percentage-calculator' },
    { name: 'Time Percentage', href: '/time-percentage-calculator' },
    { name: 'Value Percentage', href: '/value-percentage-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function DoublingTimeCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateDoublingTime> | null>(null);

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
                            <p className="text-sm text-muted-foreground">Exact Doubling Time</p>
                            <p className="text-4xl font-bold text-primary">{result.exactTime} periods</p>
                        </div>
                        <div className="p-6 bg-accent/20 rounded-lg">
                            <p className="text-sm text-muted-foreground">Rule of 72 Estimate</p>
                            <p className="text-4xl font-bold text-accent">{result.ruleOf72Time} periods</p>
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
                    <p className="text-muted-foreground">This is the constant percentage increase that occurs in each time period. For example, a 7% annual return on an investment, or a 2% annual population growth. The "period" is whatever unit of time the growth rate is measured in (years, months, etc.).</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sigma className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This calculator provides two methods for estimating doubling time:</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-4 mt-4">
                        <div>
                            <h4 className="font-semibold text-primary">Exact Formula (using Logarithms)</h4>
                            <p className="font-mono text-sm md:text-base">Time = ln(2) / ln(1 + (Rate / 100))</p>
                            <p className="mt-1 text-sm text-muted-foreground">This formula provides the precise number of periods required for a quantity to double with compound growth. It uses the natural logarithm (ln) to solve for time in the exponential growth equation.</p>
                        </div>
                        <hr />
                        <div>
                            <h4 className="font-semibold text-accent">Rule of 72 (Approximation)</h4>
                            <p className="font-mono text-sm md:text-base">Time ≈ 72 / Rate</p>
                            <p className="mt-1 text-sm text-muted-foreground">This is a famous mental math shortcut for quickly estimating doubling time. It is most accurate for growth rates between 6% and 10% but provides a good estimate for many common scenarios.</p>
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

            <Card>
                <CardHeader>
                    <CardTitle>The Power of Exponential Growth: A Practical Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Grasping the Surprising Speed of Doubling</h2>
                    <p>Doubling time is a concept that vividly illustrates the power of exponential growth. It answers a simple but profound question: "At a constant rate of growth, how long until this thing gets twice as big?" The answer is often surprisingly short, which is why understanding doubling time is a cornerstone of financial literacy, demography, and science.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Rule of 72: A Powerful Mental Tool</h3>
                    <p>The "Rule of 72" is one of the most useful rules of thumb in finance. It allows for a remarkably accurate, back-of-the-napkin calculation of how long an investment will take to double, without complex math.</p>
                    <p>By simply dividing 72 by the percentage growth rate, you get a close estimate. This works for both positive and negative scenarios:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>An investment earning **8%** per year will double in approximately `72 / 8 = 9` years.</li>
                        <li>If inflation is **3%** per year, the cost of goods will double (and the value of your money will halve) in approximately `72 / 3 = 24` years.</li>
                        <li>A national debt growing at **4%** a year will double in `72 / 4 = 18` years.</li>
                    </ul>
                    <div className="w-full overflow-x-auto">
                        <table className="w-full min-w-[400px] text-sm mt-4">
                            <thead className="text-left font-semibold text-foreground">
                                <tr>
                                    <th className="p-2 border-b">Growth Rate</th>
                                    <th className="p-2 border-b">Rule of 72 Estimate (Years)</th>
                                    <th className="p-2 border-b">Exact Time (Years)</th>
                                    <th className="p-2 border-b">Accuracy</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b"><td className="p-2">2%</td><td className="p-2">36.0</td><td className="p-2">35.00</td><td className="p-2">Good</td></tr>
                                <tr className="border-b"><td className="p-2">5%</td><td className="p-2">14.4</td><td className="p-2">14.21</td><td className="p-2">Very Good</td></tr>
                                <tr className="border-b"><td className="p-2">8%</td><td className="p-2">9.0</td><td className="p-2">9.01</td><td className="p-2">Excellent</td></tr>
                                <tr className="border-b"><td className="p-2">10%</td><td className="p-2">7.2</td><td className="p-2">7.27</td><td className="p-2">Very Good</td></tr>
                                <tr className="border-b"><td className="p-2">15%</td><td className="p-2">4.8</td><td className="p-2">4.96</td><td className="p-2">Good</td></tr>
                                <tr><td className="p-2">20%</td><td className="p-2">3.6</td><td className="p-2">3.80</td><td className="p-2">Fair</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground">Applications Beyond Finance</h3>
                    <p>The concept of doubling time is not limited to money. It's a fundamental measure of exponential processes in many fields:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Population Studies:</strong> Demographers use doubling time to project how long it will take for a country's population to double, which has massive implications for infrastructure, food supply, and resources.</li>
                        <li><strong>Technology (Moore's Law):</strong> The famous observation that the number of transistors on a microchip doubles approximately every two years is a classic example of a predictable doubling time driving technological progress.</li>
                        <li><strong>Biology & Epidemiology:</strong> In a favorable environment, a bacterial colony can have a doubling time of just 20 minutes. During a pandemic, the doubling time of cases is a critical metric for public health officials to gauge the speed of transmission and the need for interventions.</li>
                        <li><strong>Environmental Science:</strong> Understanding the doubling time of resource consumption (like energy or water) is key to planning for a sustainable future.</li>
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
                            <AccordionTrigger>Why does the Rule of 72 work?</AccordionTrigger>
                            <AccordionContent>
                                <p>It's a mathematical approximation derived from the more precise logarithmic formula. The natural logarithm of 2 is approximately 0.693. For small interest rates, `ln(1 + r) ≈ r`. This gives rise to the "Rule of 69.3". However, 72 is used instead because it's a highly composite number (divisible by 2, 3, 4, 6, 8, 9, 12), making mental division easy for a wide range of common rates. It also happens to provide better accuracy for the rates typically encountered in finance (5% to 12%).</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What does "period" mean in the result?</AccordionTrigger>
                            <AccordionContent>
                                <p>A "period" is the unit of time over which the growth rate is applied. It's crucial to match them. If you enter an annual growth rate (e.g., 8% per year), the doubling time will be in years. If you enter a monthly growth rate (e.g., 1% per month), the doubling time will be in months.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Does the initial amount of money or population matter?</AccordionTrigger>
                            <AccordionContent>
                                <p>No. For a constant percentage growth rate, the time it takes for a quantity to double is independent of the starting amount. It takes just as long for $100 to grow to $200 as it does for $1 million to grow to $2 million at the same compound rate. This is a key feature of exponential growth.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How accurate is the Rule of 72 compared to the exact formula?</AccordionTrigger>
                            <AccordionContent>
                                <p>The Rule of 72 is most accurate for rates around 8%. For lower or higher rates, its accuracy diminishes slightly, but it remains a remarkably good estimate for most practical purposes. For example, at 2% growth, the Rule of 72 gives 36 years, while the exact formula gives 35 years. At 15% growth, the rule gives 4.8 years, while the exact is 4.96 years.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Can I use this for halving time (decay)?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes, the same logic applies. If you have a quantity that decreases by a certain percentage per period (like radioactive decay), you can use the Rule of 72 to estimate its half-life. For example, if a value decreases by 5% per year, its half-life is approximately `72 / 5 = 14.4` years.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>What are the limitations of this calculation?</AccordionTrigger>
                            <AccordionContent>
                                <p>The primary limitation is the assumption of a *constant* growth rate. In the real world, investment returns, population growth, and other metrics fluctuate over time. This calculator provides a useful projection based on a steady rate, but it is not a prediction of the future. It's a tool for understanding the power of a specific growth rate, not for guaranteeing future outcomes.</p>
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
                        The Doubling Time Calculator is a powerful tool for understanding the real-world impact of exponential growth. By providing both the precise mathematical answer and the quick "Rule of 72" estimate, it helps users internalize how quickly a steadily growing quantity can expand. This concept is indispensable for financial planning, investment analysis, demographic studies, and understanding various natural phenomena.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
