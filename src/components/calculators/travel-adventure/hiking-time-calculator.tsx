'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateHikingTime } from '@/lib/travel-utils';
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
import { Timer, Route, Mountain, Info, Shield, Compass, Footprints } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';


const formSchema = z.object({
    distance: z.coerce.number().positive('Distance must be positive.'),
    distanceUnit: z.enum(['miles', 'kilometers']),
    elevationGain: z.coerce.number().nonnegative('Elevation gain cannot be negative.'),
    elevationUnit: z.enum(['feet', 'meters']),
    pace: z.enum(['slow', 'average', 'fast']),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Backpack Weight Calculator', href: '/category/travel-adventure/backpack-weight-calculator' },
    { name: 'Driving Time with Breaks Calculator', href: '/category/travel-adventure/driving-time-with-breaks-calculator' },
    { name: 'Hiking Calorie Calculator', href: '/category/travel-adventure/hiking-calorie-calculator' },
    { name: 'Itinerary Time Planner', href: '/category/travel-adventure/itinerary-time-planner' },
    { name: 'Travel Buffer Time Calculator', href: '/category/travel-adventure/travel-buffer-time-calculator' },
    { name: 'Travel Days Calculator', href: '/category/travel-adventure/travel-days-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function HikingTimeCalculator() {
    const [result, setResult] = useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            distance: undefined,
            distanceUnit: 'miles',
            elevationGain: undefined,
            elevationUnit: 'feet',
            pace: 'average',
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateHikingTime(data);
        setResult(res);
    };

    const schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Hiking Time Calculator",
        "description": "Estimate your hiking time based on distance, elevation gain, and your personal pace using Naismith's Rule.",
        "applicationCategory": "TravelApplication",
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
                    <CardTitle>Hiking Time Calculator</CardTitle>
                    <CardDescription>
                        Estimate your hiking time based on distance, elevation gain, and your personal pace using Naismith's Rule.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="distance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Route className="w-4 h-4" />Hike Distance</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormField control={form.control} name="distanceUnit" render={({ field: unitField }) => (
                                                    <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                        <FormControl><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="miles">miles</SelectItem><SelectItem value="kilometers">km</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="elevationGain"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Mountain className="w-4 h-4" />Total Elevation Gain</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 1500" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormField control={form.control} name="elevationUnit" render={({ field: unitField }) => (
                                                    <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                        <FormControl><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="feet">feet</SelectItem><SelectItem value="meters">meters</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="pace"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Footprints className="w-4 h-4" />Your Fitness Level / Pace</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="slow">Slow / Beginner (2 mph or 3.2 km/h)</SelectItem>
                                                <SelectItem value="average">Average / Intermediate (3 mph or 4.8 km/h)</SelectItem>
                                                <SelectItem value="fast">Fast / Advanced (4 mph or 6.4 km/h)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Calculate Hiking Time</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Estimated Hiking Time</CardTitle>
                        <CardDescription>This is your estimated "moving time." Remember to add time for breaks, photos, and lunch.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="p-6 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Estimated Moving Time</p>
                            <p className="text-4xl font-bold text-primary">{result}</p>
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
                        <h3 className="font-semibold text-lg">Distance & Elevation Gain</h3>
                        <p className="text-muted-foreground">These are the two most critical factors for estimating hiking time. Elevation gain often has a greater impact on your time than horizontal distance.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Pace</h3>
                        <p className="text-muted-foreground">This adjusts the formula based on your fitness level. Be honest with your self-assessment. If you're new to hiking or carrying a heavy pack, choose a slower pace.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This calculator uses a modified version of **Naismith's Rule**, a classic formula developed in 1892 by Scottish mountaineer William W. Naismith. The rule states that you should allow:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                        <li>1 hour for every 3 miles (or 5 km) of horizontal distance.</li>
                        <li>1 additional hour for every 2,000 feet (or 600 meters) of ascent.</li>
                    </ul>
                    <p className="mt-2">Our calculator adjusts the base pace according to your selected fitness level and then adds the time calculated for the elevation gain to arrive at a total estimated moving time.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">The Art and Science of Trail Timing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">A Hiker's Guide to Accurately Estimating Trail Time</h2>
                    <p>One of the most important skills for any hiker is the ability to accurately estimate how long a trail will take. It's a matter of safety—ensuring you have enough daylight—and enjoyment, allowing you to properly pace yourself and plan for breaks. A simple mileage calculation is often misleading in the mountains. This guide explores the time-tested formulas for estimating hiking time, the factors that influence your pace, and how to use this knowledge to plan safer, more enjoyable hikes.</p>

                    <h3 className="text-lg font-semibold text-foreground">Beyond Simple Mileage: The Importance of Elevation</h3>
                    <p>For walking on flat ground, a simple `Time = Distance / Speed` works well. But in hiking, vertical distance (elevation gain) is just as, if not more, important than horizontal distance. Climbing 1,000 feet can be as strenuous as walking several miles on a flat path. Any reliable estimation method must account for both.</p>

                    <h3 className="text-lg font-semibold text-foreground">Book Time vs. Real Time: Don't Forget the Breaks!</h3>
                    <p>The time estimated by our calculator is often called "book time" or "moving time." This is the time you spend with your feet on the trail. It does **not** include:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Water and snack breaks</li>
                        <li>Lunch stops</li>
                        <li>Time spent taking photos</li>
                        <li>Rest stops to catch your breath on a steep section</li>
                        <li>Layering and de-layering clothing</li>
                    </ul>
                    <p>A good rule of thumb is to add **20-30%** to your calculated moving time to get a more realistic total trip time. For a calculated 4-hour hike, it's wise to budget at least 5 hours from trailhead to trailhead.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What about hiking downhill?</AccordionTrigger>
                            <AccordionContent>
                                <p>While Naismith's original rule doesn't explicitly account for descents, other models like Tranter's Corrections add adjustments. Generally, gentle downhills can be faster, but very steep or technical descents can be just as slow, or even slower, than ascending, as they require careful footwork. For most day-hike planning, focusing on the ascent time provides a safe and reliable estimate.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How accurate is this calculator?</AccordionTrigger>
                            <AccordionContent>
                                <p>The formula is a time-tested and widely used estimation tool. Its accuracy for you personally will improve as you gain experience. After a few hikes, compare your actual time to the calculated time. You may find you are consistently faster or slower than the "average" pace, and you can adjust your selections accordingly for future planning.</p>
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
                    <p className="text-muted-foreground">The Hiking Time Calculator is an essential safety and planning tool for any outdoor enthusiast. By using a modified version of Naismith's Rule, it provides a realistic estimate of your "moving time" by considering both the horizontal distance and, crucially, the vertical elevation gain of your intended route. This allows you to plan your day, know when to turn around, and ensure you have enough daylight for a safe and enjoyable adventure.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
