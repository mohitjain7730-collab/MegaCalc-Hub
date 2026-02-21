
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateTravelTime } from '@/lib/travel-utils';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { Map as MapIcon, Plane, Globe, Info, Shield, Compass, Clock, Gauge, Route } from 'lucide-react';


const formSchema = z.object({
    distance: z.coerce.number().positive('Distance must be a positive number.'),
    distanceUnit: z.enum(['kilometers', 'miles']),
    speed: z.coerce.number().positive('Speed must be a positive number.'),
    speedUnit: z.enum(['kmh', 'mph']),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Distance Between Cities Calculator', href: '/distance-between-cities-calculator' },
    { name: 'Driving Time with Breaks Calculator', href: '/driving-time-with-breaks-calculator' },
    { name: 'Flight Duration Calculator', href: '/flight-duration-calculator' },
    { name: 'Time Zone Difference Calculator', href: '/time-zone-difference-calculator' },
];


export default function TravelTimeCalculator() {
    const [result, setResult] = useState<{ text: string, totalHours: number } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            distance: undefined,
            distanceUnit: 'kilometers',
            speed: undefined,
            speedUnit: 'kmh',
        },
    });

    const onSubmit = (data: FormValues) => {
        const time = calculateTravelTime(data);
        setResult(time);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Travel Time Calculator</CardTitle>
                    <CardDescription>
                        Estimate the time it will take to travel a certain distance at a constant speed.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="distance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Route className="w-4 h-4" />Distance</FormLabel>
                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 500" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormField
                                                control={form.control}
                                                name="distanceUnit"
                                                render={({ field: unitField }) => (
                                                    <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-[150px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="kilometers">Kilometers</SelectItem>
                                                            <SelectItem value="miles">Miles</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="speed"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Gauge className="w-4 h-4" />Average Speed</FormLabel>
                                        <div className="flex gap-2">
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 100" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormField
                                                control={form.control}
                                                name="speedUnit"
                                                render={({ field: unitField }) => (
                                                    <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-[150px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="kmh">km/h</SelectItem>
                                                            <SelectItem value="mph">mph</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Calculate Time</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Estimated Travel Time</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="p-6 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Journey Duration</p>
                            <p className="text-4xl font-bold text-primary">{result.text}</p>
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
                        <h3 className="font-semibold text-lg">Distance</h3>
                        <p className="text-muted-foreground">The total distance you plan to travel. You can enter this value in either kilometers or miles.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Average Speed</h3>
                        <p className="text-muted-foreground">The constant speed at which you will be traveling. This is an average, as it's unlikely you will maintain the exact same speed for the entire trip. You can select speed in kilometers per hour (km/h) or miles per hour (mph).</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator uses the fundamental physics formula for time, which is the distance divided by the speed.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">Time = Distance / Speed</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">The calculator first ensures the units are consistent (e.g., converting miles to kilometers if necessary) before performing the division. The resulting time in hours is then broken down into days, hours, and minutes for readability.</p>
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
                    <CardTitle className="text-2xl font-bold">The Physics of Your Journey</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">The Complete Guide to Calculating Travel Time for Any Journey</h2>
                    <p>Estimating travel time is one of the most fundamental aspects of planning any trip, from a daily commute to a cross-country road trip. An accurate time estimate helps in setting schedules, booking accommodations, and managing expectations. This guide provides an expert deep-dive into the principles of travel time calculation, the importance of "average speed," and how to account for real-world factors that this simple calculation doesn't cover.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Core Principle: Time, Speed, and Distance</h3>
                    <p>At its heart, calculating travel time is an application of one of the earliest and most fundamental formulas in physics: `Time = Distance / Speed`. This elegant equation forms the relationship between these three variables. If you know any two, you can always find the third. Our calculator uses this exact formula to give you an estimate of your journey's duration.</p>
                    <p>The calculation is straightforward. For example, if you need to travel 500 kilometers and you expect to maintain an average speed of 100 kilometers per hour, the calculation is: `Time = 500 km / 100 km/h = 5 hours`.</p>
                    <p>It's crucial that the units are consistent. You cannot divide miles by kilometers per hour and expect a sensible result. Our calculator automatically handles these conversions behind the scenes. If you enter a distance in miles and a speed in km/h, it will convert one to match the other before performing the division, ensuring the result is always accurate.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Critical Concept of "Average Speed"</h3>
                    <p>The most significant input in this calculation is "average speed." It is highly unlikely you will travel at a constant speed for your entire journey. You will speed up on open highways and slow down in cities. You will stop for gas, food, and rest breaks. "Average speed" is a single number that represents the theoretical constant speed you would need to travel at to cover the total distance in the total time, including all stops.</p>
                    <p>So, how do you estimate a realistic average speed?</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Highway Driving:</strong> A good rule of thumb is to take the speed limit and subtract 5-10 mph (or 8-16 km/h) to account for minor slowdowns and traffic. If the speed limit is 70 mph, an average speed of 60-65 mph is a realistic estimate for long stretches.</li>
                        <li><strong>City Driving:</strong> Average speed in a city is much lower due to traffic lights, congestion, and lower speed limits. It can range from 15-30 mph (25-50 km/h).</li>
                        <li><strong>Factoring in Stops:</strong> The simple `Time = Distance / Speed` calculation does NOT account for stops. A 5-hour drive can easily become a 6-hour trip with a 1-hour stop for lunch. To account for this, you can either (1) calculate the driving time and then manually add your planned stop times, or (2) lower your average speed to implicitly include stop times. For example, over an 8-hour day, a 1-hour lunch break means your average speed for the whole day is 12.5% lower than your average driving speed.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">Real-World Factors That Influence Travel Time</h3>
                    <p>The calculated travel time is an ideal estimate. In the real world, many factors can affect your journey's duration:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Traffic:</strong> This is the most significant variable. Rush hour in a major city can easily double or triple your travel time for that segment of the journey. Always check a live traffic app (like Google Maps or Waze) before you depart.</li>
                        <li><strong>Weather:</strong> Rain, snow, ice, or fog will force you to drive slower, increasing your travel time. Heavy storms can sometimes close roads entirely.</li>
                        <li><strong>Construction:</strong> Road work and detours can cause significant delays.</li>
                        <li><strong>Topography:</strong> Driving through mountainous terrain with steep inclines and sharp curves will result in a lower average speed than driving through flat, open plains.</li>
                        <li><strong>Time of Day:</strong> Besides traffic, driving at night may be faster in some areas due to fewer cars, but could be slower on unlit rural roads.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">Using the Calculator for Different Modes of Transport</h3>
                    <p>This calculator is versatile and can be used for various modes of travel:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Car:</strong> This is the most common use case. Use a realistic average speed based on the type of roads (highway, city, rural).</li>
                        <li><strong>Train:</strong> You can use the train's average speed. High-speed rail might average 150 mph (240 km/h), while a regional train might be closer to 50 mph (80 km/h).</li>
                        <li><strong>Bicycle:</strong> A casual cyclist might average 10-12 mph (16-19 km/h), while a road cyclist could average 15-20 mph (24-32 km/h).</li>
                        <li><strong>Walking:</strong> The average human walking speed is about 3 mph (5 km/h).</li>
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
                            <AccordionTrigger>Does this calculator account for stops?</AccordionTrigger>
                            <AccordionContent>
                                <p>No, the calculator provides the pure travel time based on constant movement. You must manually add any time you plan for stops, such as for meals, fuel, or rest breaks, to the final result to get your total trip time.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How can I estimate my average speed?</AccordionTrigger>
                            <AccordionContent>
                                <p>A good starting point is to use a mapping service like Google Maps to plot your route. It will give you an estimated travel time based on speed limits and typical traffic. You can then divide your total distance by this time to find a realistic average speed to use for future calculations.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What's the difference between speed and velocity?</AccordionTrigger>
                            <AccordionContent>
                                <p>In everyday language, we use "speed" and "velocity" interchangeably. In physics, they are different. Speed is a scalar quantity (how fast you are going, e.g., 60 mph). Velocity is a vector quantity (how fast you are going and in what direction, e.g., 60 mph North). For this calculator, we are only concerned with speed.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Can I use this for calculating flight time?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes, you can, but you would need to know the plane's average ground speed and the travel distance. A more common method for flights is to use our Flight Duration Calculator, which works by comparing the departure and arrival times in their respective time zones.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Why is the result broken down into days, hours, and minutes?</AccordionTrigger>
                            <AccordionContent>
                                <p>For long journeys, a result like "75.5 hours" can be hard to conceptualize. Breaking it down into "3 days, 3 hours, and 30 minutes" makes the duration much easier to understand in practical terms for planning purposes.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>How does the calculator handle unit conversion?</AccordionTrigger>
                            <AccordionContent>
                                <p>Before performing the `Time = Distance / Speed` calculation, the tool ensures both inputs use a consistent system. For instance, if you input distance in miles and speed in kilometers per hour, it will convert the miles to kilometers first, so the units cancel out correctly and the result is accurate.</p>
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
                    <p className="text-muted-foreground">The Travel Time Calculator is a powerful tool for initial trip planning, providing a baseline estimate of your journey's duration based on the core relationship between time, speed, and distance. While it's essential to account for real-world variables like traffic and stops, this calculator gives you the foundational data you need to build a reliable and well-structured travel itinerary. By understanding the concept of average speed and its limitations, you can turn this simple formula into an indispensable part of your planning toolkit.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
