
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateTravelDays } from '@/lib/travel-utils';
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
import { CalendarDays, Clock, Map as MapIcon, Info, Shield, Compass, Plane } from 'lucide-react';

const formSchema = z.object({
    startDate: z.string().min(1, 'Start date is required.'),
    endDate: z.string().min(1, 'End date is required.'),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
    message: "End date cannot be before start date.",
    path: ["endDate"],
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Itinerary Time Planner', href: '/category/travel-adventure/itinerary-time-planner' },
    { name: 'Time Zone Difference', href: '/category/travel-adventure/time-zone-difference-calculator' },
    { name: 'Travel Buffer Time Calculator', href: '/category/travel-adventure/travel-buffer-time-calculator' },
    { name: 'Driving Time with Breaks Calculator', href: '/category/travel-adventure/driving-time-with-breaks-calculator' },
    { name: 'Layover Time Calculator', href: '/category/travel-adventure/layover-time-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function TravelDaysCalculator() {
    const [result, setResult] = useState<{ totalDays: number, totalNights: number, formatted: string } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startDate: '',
            endDate: '',
        },
    });

    const onSubmit = (data: FormValues) => {
        // travel-utils expects (startDate, endDate)
        const res = calculateTravelDays(data.startDate, data.endDate);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Travel Days Calculator</CardTitle>
                    <CardDescription>
                        Calculate the total number of days and nights for your trip based on start and end dates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Days</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Trip Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {result.totalDays < 0 ? (
                            <p className="text-red-500">{result.formatted}</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                                <div className="p-6 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">Total Days</p>
                                    <p className="text-4xl font-bold text-primary">{result.totalDays}</p>
                                    <p className="text-xs text-muted-foreground">Including start and end dates</p>
                                </div>
                                <div className="p-6 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">Total Nights</p>
                                    <p className="text-4xl font-bold">{result.totalNights}</p>
                                    <p className="text-xs text-muted-foreground">Number of nights for accommodation</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Start Date</h3>
                        <p className="text-muted-foreground">The first day of your trip. This day is included in the total count.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">End Date</h3>
                        <p className="text-muted-foreground">The last day of your trip. This day is also included in the total count, which is a common source of confusion when counting manually.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator finds the difference in time between the end date and start date and converts it to days. It then adds 1 to include the start day in the count. The number of nights is simply the total number of days minus 1.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">
                            TotalDays = (EndDate - StartDate) + 1
                        </p>
                        <p className="font-mono text-sm md:text-base font-bold">
                            TotalNights = TotalDays - 1
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
                    <CardTitle className="text-2xl font-bold">The Simple Math of Trip Planning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">How to Accurately Count the Days and Nights of Your Journey</h2>
                    <p>It sounds simple, but one of the most common points of confusion in travel planning is calculating the exact length of a trip. Are you counting days or nights? Do you include the travel days? Getting this wrong can lead to booking hotels for the wrong number of nights or miscalculating how much time you truly have at your destination. This guide clarifies the concepts of counting travel days and nights, explains the common "off-by-one" error, and shows how to use our calculator for accurate planning.</p>
                    <h3 className="text-lg font-semibold text-foreground">Days vs. Nights: The Fundamental Difference</h3>
                    <p>When planning a trip, the terms "days" and "nights" are used for different purposes, and it's crucial to understand the distinction:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Days:</strong> This typically refers to the total number of calendar days your trip spans, including the day you leave and the day you return. It's useful for knowing your total time away from home or work and for planning activities. A trip from Monday to Friday is a 5-day trip.</li>
                        <li><strong>Nights:</strong> This refers to the number of nights you will need accommodation. It is almost always one less than the number of days. For a trip from Monday to Friday, you would need to book a hotel for 4 nights (Monday, Tuesday, Wednesday, and Thursday night).</li>
                    </ul>
                    <p>Airlines and tour operators often advertise trips by the number of days, while hotels and accommodation providers always operate in terms of nights. This is a primary source of confusion.</p>
                    <h3 className="text-lg font-semibold text-foreground">The "Fence Post Problem": Why Manual Counting Goes Wrong</h3>
                    <p>The "off-by-one" error is extremely common when counting date ranges. It's a classic logic puzzle known as the "fence post problem." If you need to build a 100-foot fence with posts every 10 feet, you need 11 posts, not 10. The same logic applies to dates.</p>
                    <p>If your trip starts on the 5th of the month and ends on the 10th, your first instinct might be to subtract: 10 - 5 = 5 days. This is incorrect. The actual days are the 5th, 6th, 7th, 8th, 9th, and 10th—a total of 6 days. The correct formula is always `(End Date - Start Date) + 1`.</p>
                    <p>Our calculator automates this logic, so you don't have to worry about this common pitfall. It correctly includes both the start and end dates in the final count, giving you the true duration of your trip.</p>
                    <h3 className="text-lg font-semibold text-foreground">Practical Applications for Trip Planning</h3>
                    <p>Accurately calculating your trip duration is the first step in many planning processes:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Budgeting:</strong> Your total number of days determines your budget for food, activities, and daily incidentals. The number of nights directly determines your total accommodation cost.</li>
                        <li><strong>Booking Accommodations:</strong> Use the "Total Nights" result to book your hotels, Airbnb, or other lodging. This is the single most important application of this calculation.</li>
                        <li><strong>Arranging Time Off:</strong> The "Total Days" result tells you exactly how many days you need to request off from work or clear from your schedule.</li>
                        <li><strong>Planning Activities:</strong> Knowing the number of full, non-travel days you have is essential for building a realistic itinerary. A 7-day trip might only include 5 full days at the destination once you account for travel on the first and last day.</li>
                        <li><strong>Purchasing Travel Insurance:</strong> Travel insurance policies are priced based on the total duration of your trip in days. An accurate count ensures you are covered for the correct period.</li>
                    </ul>
                    <h3 className="text-lg font-semibold text-foreground">Handling International Travel and Time Zones</h3>
                    <p>When traveling across multiple time zones, especially across the International Date Line, counting days can become even more confusing. For the purpose of booking accommodations and planning your time on the ground, always use the local dates for your destination.</p>
                    <p>For example, if you leave Los Angeles on a Monday and arrive in Sydney on a Wednesday (losing a day), your trip "starts" for local planning purposes on Wednesday, the day you arrive. If you leave Sydney on a Saturday and arrive back in Los Angeles on that same Saturday (gaining a day), your trip effectively "ends" on that Saturday.</p>
                    <p>Our calculator works based on simple calendar dates and does not account for time zones. It's designed to answer the question: "If I am at my destination from date X to date Y, how many days and nights is that?" This is the most practical approach for booking and local activity planning.</p>
                    <p>Always double-check your flight arrival and departure dates and times in the local time zone of the airport. Use our Flight Duration and Time Zone Difference calculators to clarify any confusion about travel across time zones.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Why is the number of nights one less than the number of days?</AccordionTrigger>
                            <AccordionContent>
                                <p>Because you need a place to stay on the night of each day of your trip, except for the last day, when you are typically checking out or heading home. For a trip from Monday to Wednesday (3 days), you stay Monday night and Tuesday night (2 nights).</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Does this calculator include travel time to the destination?</AccordionTrigger>
                            <AccordionContent>
                                <p>No. This calculator is based purely on the calendar dates you are away. Your start date is the day you begin your journey, and the end date is the day you end it. The count includes these travel days as part of the total trip duration.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What if my trip is only one day?</AccordionTrigger>
                            <AccordionContent>
                                <p>If you set the start and end date to the same day, the calculator will correctly show a result of 1 day and 0 nights. This is useful for planning day trips.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How should I handle overnight flights?</AccordionTrigger>
                            <AccordionContent>
                                <p>For accommodation planning, the "nights" count is what matters. If you have an overnight flight, that night is spent in transit, not in a hotel. So, if a 7-day trip includes one overnight flight, you may only need to book 5 nights of accommodation, not 6.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Does the calculator account for leap years?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. The calculation is based on the actual time difference between the two dates, so it correctly handles the number of days in each month, including February in a leap year.</p>              </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>Should I use this for visa applications?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes, this is a perfect tool for that. Visa applications often ask for the total number of days of your intended stay. Using this calculator ensures your answer is accurate and matches the entry and exit dates you provide.</p>
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
                    <p className="text-muted-foreground">The Travel Days Calculator is a simple but essential tool that eliminates the common "off-by-one" error in trip planning. By accurately calculating the total days (for leave and insurance) and total nights (for accommodation), it provides the foundational numbers needed for accurate budgeting, booking, and scheduling, ensuring your trip gets off to a well-planned start.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
