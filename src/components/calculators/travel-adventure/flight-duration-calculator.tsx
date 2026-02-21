
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateFlightDuration, timeZones } from '@/lib/travel-utils';
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
import { Globe, Clock, Map as MapIcon, Info, Shield, Compass, PlaneTakeoff, PlaneLanding } from 'lucide-react';

const formSchema = z.object({
    departureDateTime: z.string().min(1, 'Departure date and time are required.'),
    departureTimeZone: z.string().min(1, 'Departure timezone is required.'),
    arrivalDateTime: z.string().min(1, 'Arrival date and time are required.'),
    arrivalTimeZone: z.string().min(1, 'Arrival timezone is required.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Travel Time Calculator', href: '/travel-time-calculator' },
    { name: 'Distance Between Cities Calculator', href: '/distance-between-cities-calculator' },
    { name: 'Time Zone Difference Calculator', href: '/time-zone-difference-calculator' },
    { name: 'Travel Buffer Time Calculator', href: '/travel-buffer-time-calculator' },
];

export default function FlightDurationCalculator() {
    const [result, setResult] = useState<{ text: string, totalMinutes: number } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            departureDateTime: '',
            departureTimeZone: 'America/New_York', // Defaults to text if IntelliSense doesn't pick up
            arrivalDateTime: '',
            arrivalTimeZone: 'Europe/London',
        },
    });

    const onSubmit = (data: FormValues) => {
        const duration = calculateFlightDuration(data);
        setResult(duration);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Flight Duration Calculator</CardTitle>
                    <CardDescription>
                        Calculate the total duration of a flight by providing departure and arrival times and their respective time zones.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 p-4 border rounded-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2"><PlaneTakeoff className="w-5 h-5 text-primary" />Departure</h3>
                                    <FormField
                                        control={form.control}
                                        name="departureDateTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date and Time</FormLabel>
                                                <FormControl>
                                                    <Input type="datetime-local" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="departureTimeZone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Time Zone</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a time zone" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="max-h-60">
                                                        {timeZones.map((tz) => (
                                                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2 p-4 border rounded-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2"><PlaneLanding className="w-5 h-5 text-primary" />Arrival</h3>
                                    <FormField
                                        control={form.control}
                                        name="arrivalDateTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date and Time</FormLabel>
                                                <FormControl>
                                                    <Input type="datetime-local" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="arrivalTimeZone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Time Zone</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select a time zone" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="max-h-60">
                                                        {timeZones.map((tz) => (
                                                            <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="submit">Calculate Duration</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && result.totalMinutes >= 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Total Flight Duration</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <div className="p-6 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Gate-to-Gate Time</p>
                            <p className="text-4xl font-bold text-primary">{result.text}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {result && result.totalMinutes < 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Error</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-red-500">Invalid time inputs. Arrival time seems to be before departure time after timezone adjustment.</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Departure/Arrival Time Zone</h3>
                        <p className="text-muted-foreground">This is the IANA time zone identifier for the departure and arrival locations (e.g., "America/New_York", "Europe/London"). Selecting the correct time zone is the most critical step for an accurate calculation, as it allows the calculator to account for the time difference between the two locations.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator first converts both the local departure and arrival times into a standardized, universal format (UTC). Once both times are in the same reference frame, it simply subtracts the departure time from the arrival time to find the total elapsed duration.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">
                            Duration = AbsoluteTime(Arrival) - AbsoluteTime(Departure)
                        </p>
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
                    <CardTitle className="text-2xl font-bold">Decoding Your Itinerary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">The Ultimate Guide to Calculating Flight Duration Accurately</h2>
                    <p>Understanding the true duration of a flight is a cornerstone of effective travel planning. It dictates connections, arrangements for arrival, and helps manage jet lag. Yet, it's a figure that often causes confusion. Is it the time listed on the airline's website? Does it account for time zones? This expert guide will demystify the process, explaining the methodology, the critical importance of time zones, and how to use our calculator to get a precise measure of your time in the air.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What is the difference between this and a Travel Time Calculator?</AccordionTrigger>
                            <AccordionContent>
                                <p>A Travel Time Calculator determines time based on distance and speed (Time = Distance / Speed). This Flight Duration Calculator works differently; it calculates the elapsed time between two specific moments, accounting for the complexities of time zones. It's designed specifically for itineraries where you know the local departure and arrival times.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Does this calculation include layovers?</AccordionTrigger>
                            <AccordionContent>
                                <p>No. This calculator is designed to calculate the duration of a single flight segment (from one takeoff to one landing). To calculate your total travel time including layovers, you should calculate the duration of each flight segment separately and then manually add the layover time.</p>
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
                    <p className="text-muted-foreground">The Flight Duration Calculator is a crucial tool for any traveler looking to understand their itinerary precisely. By converting local departure and arrival times into the universal UTC standard, it bypasses the confusion of time zones and Daylight Saving Time to provide an accurate gate-to-gate duration. This empowers travelers to plan connections, manage schedules, and anticipate their journey's true length with confidence.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
