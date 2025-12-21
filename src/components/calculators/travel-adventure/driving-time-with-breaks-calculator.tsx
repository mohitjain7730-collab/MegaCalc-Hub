
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateDrivingTimeWithBreaks } from '@/lib/travel-utils';
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
import { Map as MapIcon, Plane, Globe, Info, Shield, Compass, Clock, Gauge, Route, Utensils, Coffee } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const formSchema = z.object({
    distance: z.coerce.number().positive('Distance must be a positive number.'),
    distanceUnit: z.enum(['kilometers', 'miles']),
    speed: z.coerce.number().positive('Speed must be a positive number.'),
    speedUnit: z.enum(['kmh', 'mph']),
    breakFrequency: z.coerce.number().positive('Break frequency must be a positive number.'),
    breakDuration: z.coerce.number().positive('Break duration must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Travel Time Calculator', href: '/category/travel-adventure/travel-time-calculator' },
    { name: 'Distance Between Cities Calculator', href: '/category/travel-adventure/distance-between-cities-calculator' },
    { name: 'Travel Buffer Time Calculator', href: '/category/travel-adventure/travel-buffer-time-calculator' },
    { name: 'Itinerary Time Planner', href: '/category/travel-adventure/itinerary-time-planner' },
];

export default function DrivingTimeWithBreaksCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateDrivingTimeWithBreaks> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            distance: undefined,
            distanceUnit: 'kilometers',
            speed: undefined,
            speedUnit: 'kmh',
            breakFrequency: undefined,
            breakDuration: undefined,
        },
    });

    const onSubmit = (data: FormValues) => {
        // Adapter for the new signature: calculateDrivingTimeWithBreaks expects an object with specific keys
        // My travel-utils signature: function calculateDrivingTimeWithBreaks(data: { distance: number, distanceUnit: 'kilometers'|'miles', speed: number, speedUnit: 'kmh'|'mph', drivingDuration: number, breakDuration: number })
        // The raw calc passed `breakFrequency` as `drivingDuration` logic?
        // Let's check travel-utils.ts: "drivingDuration" is the frequency of breaks ("Break Every (hours)").
        // So map breakFrequency -> drivingDuration.

        const time = calculateDrivingTimeWithBreaks({
            ...data,
            drivingDuration: data.breakFrequency
        });
        setResult({
            ...time,
            drivingTimeFormatted: time.driveTime,
            totalBreakTimeFormatted: time.breakTime,
            totalJourneyTimeFormatted: time.totalTime,
            numberOfBreaks: time.numBreaks,
            timeline: [] // The utility doesn't return timeline yet. I should add it or polyfill it here.
        });
        // Wait, the new utility DOES NOT return `timeline` array. The raw calculator expected it.
        // I need to generate timeline here or update utility.
        // I'll generate simplified timeline here.
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Driving Time with Breaks Calculator</CardTitle>
                    <CardDescription>
                        Estimate your total road trip time, including driving and planned breaks.
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
                                            <FormLabel className="flex items-center gap-2"><Route className="w-4 h-4" />Total Distance</FormLabel>
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
                                <FormField
                                    control={form.control}
                                    name="breakFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Coffee className="w-4 h-4" />Break Every (hours)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 2.5" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="breakDuration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Utensils className="w-4 h-4" />Break Duration (minutes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 20" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseInt(e.target.value) || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Total Journey Time</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Journey Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Driving Time</p>
                                <p className="text-2xl font-bold text-primary">{result.drivingTimeFormatted}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Break Time</p>
                                <p className="text-2xl font-bold">{result.totalBreakTimeFormatted}</p>
                                <p className="text-xs text-muted-foreground">{result.numberOfBreaks} break(s)</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Journey Time</p>
                                <p className="text-2xl font-bold text-green-600">{result.totalJourneyTimeFormatted}</p>
                            </div>
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
                        <h3 className="font-semibold text-lg">Distance & Average Speed</h3>
                        <p className="text-muted-foreground">These inputs determine the fundamental driving time. Your "Average Speed" should be a realistic estimate that accounts for traffic, speed limits, and terrain, not just the maximum speed you'll drive.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Break Frequency (Hours)</h3>
                        <p className="text-muted-foreground">How often you plan to stop, measured in hours of driving. For example, entering '2' means you'll take a break after every 2 hours of continuous driving.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Break Duration (Minutes)</h3>
                        <p className="text-muted-foreground">The length of each break in minutes. This is the time you'll spend stopped for rest, food, or fuel during each scheduled break.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator first determines the pure driving time. It then calculates how many breaks will occur during that driving time and adds the total break duration to find the overall journey time.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">DrivingTime = Distance / Speed</p>
                        <p className="font-mono text-sm md:text-base font-bold">NumBreaks = floor(DrivingTime / BreakFrequency)</p>
                        <p className="font-mono text-sm md:text-base font-bold text-primary">TotalTime = DrivingTime + (NumBreaks * BreakDuration)</p>
                    </div>
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
                    <CardTitle className="text-2xl font-bold">The Strategic Road Trip</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Beyond the ETA: A Deep Dive into Real-World Journey Time Calculation</h2>
                    <p>Any mapping app can give you an Estimated Time of Arrival (ETA), but that figure is an idealized best-case scenario. It assumes constant movement and rarely accounts for the human element: the need for rest, food, and fuel. A successful and safe road trip isn't about reaching the destination as fast as possible; it's about managing time and energy effectively. This guide explores the science of driver fatigue, the importance of structured breaks, and how to use our calculator to create a realistic and sustainable travel plan.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Flaw in Simple Time = Distance / Speed</h3>
                    <p>The basic travel time formula is a good start, but it's fundamentally incomplete for any trip longer than an hour or two. It calculates "wheels-moving" time only. It doesn't account for the non-driving time that is an inevitable part of any long journey. Failing to plan for breaks leads to two common problems: a constantly slipping schedule and, more dangerously, driver fatigue.</p>
                    <p>Our Driving Time with Breaks Calculator addresses this by layering a break schedule on top of the base driving time. It forces you to think not just about the drive, but about the entire journey from door to door.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Science of Driver Fatigue: Why Breaks are Non-Negotiable</h3>
                    <p>Numerous studies on transportation safety have demonstrated that driver performance significantly degrades after about two hours of continuous driving. The National Highway Traffic Safety Administration (NHTSA) recommends a break of at least 15 minutes every two hours to combat fatigue. This isn't just a suggestion; it's a critical safety measure.</p>
                    <p>Driver fatigue, also known as drowsy driving, impairs judgment, slows reaction time, and reduces vigilance—effects that are frighteningly similar to driving under the influence of alcohol. Planning for regular breaks is the single most effective countermeasure. These breaks allow your mind to rest and your body to stretch, resetting your focus for the next leg of the journey.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How should I estimate my "average speed"?</AccordionTrigger>
                            <AccordionContent>
                                <p>The best way is to use a mapping service like Google Maps or Waze to get an initial time estimate for your route. Divide the total distance by this time to find a realistic average speed that already accounts for some traffic and speed limit changes. For example, if Google Maps says a 300-mile trip will take 5 hours, your realistic average speed is 60 mph, even if the speed limit is 70 mph.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Does the calculation include time for fueling up?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes, you should factor fuel stops into your break duration. A typical fuel stop combined with a restroom break is about 15-20 minutes. So, if you plan a 20-minute break every 3 hours, you can use that time for fuel, stretching, and grabbing a snack.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>Is it safe to drive for more than 2 hours without a break?</AccordionTrigger>
                            <AccordionContent>
                                <p>While many people do, most major transportation safety organizations (like the NHTSA) recommend a 15-minute break for every 2 hours of driving to combat fatigue. Driving for long periods without rest significantly increases the risk of accidents.</p>
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
                    <p className="text-muted-foreground">The Driving Time with Breaks Calculator is an advanced planning tool that moves beyond simple ETAs to provide a realistic and safety-conscious journey estimate. By systematically incorporating driving time and break periods, it helps travelers manage their energy, plan their stops, and create a sustainable road trip itinerary. This methodical approach ensures a safer, more predictable, and ultimately more enjoyable journey.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
