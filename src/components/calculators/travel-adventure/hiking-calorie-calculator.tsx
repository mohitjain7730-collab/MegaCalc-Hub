'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateHikingCalories } from '@/lib/travel-utils';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { Flame, Timer, Mountain, Info, Shield, Compass, Scale } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
    bodyWeight: z.coerce.number().positive('Body weight must be positive.'),
    bodyWeightUnit: z.enum(['pounds', 'kilograms']),
    hikeDuration: z.coerce.number().positive('Duration must be positive in minutes.'),
    intensity: z.enum(['easy', 'moderate', 'strenuous']),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Backpack Weight Calculator', href: '/backpack-weight-calculator' },
    { name: 'Hiking Time Calculator', href: '/hiking-time-calculator' },
    { name: 'Trip Budget Calculator', href: '/trip-budget-calculator' },
    { name: 'Cost Per Mile Calculator', href: '/cost-per-mile-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function HikingCalorieCalculator() {
    const [result, setResult] = useState<number | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bodyWeight: undefined,
            bodyWeightUnit: 'pounds',
            hikeDuration: undefined,
            intensity: 'moderate',
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateHikingCalories(data);
        setResult(res);
    };

    const schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Hiking Calorie Calculator",
        "description": "Estimate the number of calories burned during your hike based on your body weight, hike duration, and intensity.",
        "applicationCategory": "HealthApplication", // Or TravelApplication, depends on focus
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    return (
        <div className="space-y-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />
            <Card>
                <CardHeader>
                    <CardTitle>Hiking Calorie Calculator</CardTitle>
                    <CardDescription>
                        Estimate the number of calories burned during your hike based on your body weight, hike duration, and intensity.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="bodyWeight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Scale className="w-4 h-4" />Body Weight</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 150" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormField control={form.control} name="bodyWeightUnit" render={({ field: unitField }) => (
                                                    <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                        <FormControl><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="pounds">lbs</SelectItem><SelectItem value="kilograms">kg</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hikeDuration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Timer className="w-4 h-4" />Hike Duration (minutes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 180" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="intensity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Mountain className="w-4 h-4" />Hike Intensity</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="easy">Easy (Flat terrain, light pack)</SelectItem>
                                                    <SelectItem value="moderate">Moderate (Rolling hills, moderate pack)</SelectItem>
                                                    <SelectItem value="strenuous">Strenuous (Steep terrain, heavy pack)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Calories</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result !== null && (
                <Card>
                    <CardHeader>
                        <CardTitle>Estimated Calorie Burn</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="p-6 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Calories Burned</p>
                            <p className="text-4xl font-bold text-primary">{result.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">kcal</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Body Weight</h3>
                        <p className="text-muted-foreground">Your body weight is a key factor in calorie expenditure. A heavier person will burn more calories than a lighter person doing the same activity.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Hike Duration</h3>
                        <p className="text-muted-foreground">The total time you spent hiking, in minutes.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Hike Intensity</h3>
                        <p className="text-muted-foreground">This is a subjective measure of your hike's difficulty, which corresponds to a MET value (Metabolic Equivalent of Task). "Easy" might be a flat trail, while "Strenuous" involves significant elevation gain and/or a heavy backpack.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator uses a standard formula based on the Metabolic Equivalent of Task (MET). One MET is the energy equivalent of sitting quietly. The calculator assigns a MET value based on your selected intensity:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                        <li><strong>Easy:</strong> ~4.0 METs</li>
                        <li><strong>Moderate:</strong> ~6.0 METs</li>
                        <li><strong>Strenuous:</strong> ~8.0 METs</li>
                    </ul>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Calories Burned = (MET Value * Body Weight in kg * 3.5) / 200 * Duration in minutes</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Fueling Your Adventure</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">A Guide to Understanding and Estimating Calorie Burn on the Trail</h2>
                    <p>Proper nutrition is critical for a successful and enjoyable hike. Knowing how many calories you're burning is the first step in figuring out how much food you need to pack to stay energized and strong. This guide explores the science of calorie expenditure during exercise, the concept of METs, and how you can use our calculator to plan your trail nutrition effectively.</p>

                    <h3 className="text-lg font-semibold text-foreground">What is a Calorie?</h3>
                    <p>A calorie is a unit of energy. In nutrition, calories refer to the energy people get from the food and drink they consume, as well as the energy they expend in physical activity. Hiking, especially with a pack and on varied terrain, is a significant calorie-burning activity.</p>

                    <h3 className="text-lg font-semibold text-foreground">Key Factors in Calorie Burn</h3>
                    <p>The MET formula shows that calorie burn is primarily influenced by three things:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Exercise Intensity (METs):</strong> The harder you work, the more calories you burn per minute.</li>
                        <li><strong>Body Weight:</strong> A heavier person has to move more mass, which requires more energy. Therefore, they will burn more calories than a lighter person doing the exact same activity for the same amount of time.</li>
                        <li><strong>Duration:</strong> The longer you hike, the more total calories you will burn.</li>
                    </ol>

                    <h3 className="text-lg font-semibold text-foreground">Using the Calculator for Meal Planning</h3>
                    <p>Once you have an estimate of your calorie expenditure, you can plan your trail food accordingly. The goal is to replace a significant portion of the calories you burn to avoid "bonking" or hitting the wall, which is a state of severe energy depletion.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How accurate is this estimate?</AccordionTrigger>
                            <AccordionContent>
                                <p>This calculator provides a scientifically-based estimate and is a great starting point for planning. However, individual metabolic rates can vary. The actual calories you burn can also be affected by factors not in the calculator, such as terrain roughness, altitude, and weather conditions (e.g., you burn more calories in the cold).</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Does this include my Basal Metabolic Rate (BMR)?</AccordionTrigger>
                            <AccordionContent>
                                <p>No. The formula calculates the calories burned **from the activity itself**, on top of what your body would normally be burning at rest. Your total daily calorie expenditure on a hiking day would be your BMR plus the calories burned from hiking.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Compass className="h-5 w-5" />Related Calculators</CardTitle>
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
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The Hiking Calorie Calculator is a nutrition planning tool that provides an evidence-based estimate of your energy expenditure on the trail. By using the established METs formula, it accounts for your body weight, hike duration, and intensity to help you make informed decisions about how much food to pack, ensuring you stay properly fueled for your adventure.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
