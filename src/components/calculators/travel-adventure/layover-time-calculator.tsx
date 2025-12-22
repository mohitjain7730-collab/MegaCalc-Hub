
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateLayoverTime } from '@/lib/travel-utils';
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
import { Hourglass, Clock, Map as MapIcon, Info, Shield, Compass, PlaneLanding, PlaneTakeoff } from 'lucide-react';

const formSchema = z.object({
    arrivalDateTime: z.string().min(1, 'Arrival date and time are required.'),
    departureDateTime: z.string().min(1, 'Departure date and time are required.'),
}).refine(data => new Date(data.departureDateTime) >= new Date(data.arrivalDateTime), {
    message: "Departure cannot be before arrival.",
    path: ["departureDateTime"],
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Travel Days Calculator', href: '/category/travel-adventure/travel-days-calculator' },
    { name: 'Time Zone Difference', href: '/category/travel-adventure/time-zone-difference-calculator' },
    { name: 'Travel Buffer Time Calculator', href: '/category/travel-adventure/travel-buffer-time-calculator' },
    { name: 'Driving Time with Breaks Calculator', href: '/category/travel-adventure/driving-time-with-breaks-calculator' },
    { name: 'Flight Duration Calculator', href: '/category/travel-adventure/flight-duration-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function LayoverTimeCalculator() {
    const [result, setResult] = useState<{ totalMinutes: number, formatted: string } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            arrivalDateTime: '',
            departureDateTime: '',
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateLayoverTime({ arrivalTime: data.arrivalDateTime, departureTime: data.departureDateTime });
        setResult({
            totalMinutes: res.totalMinutes,
            formatted: res.text
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Layover Time Calculator</CardTitle>
                    <CardDescription>
                        Calculate the exact duration of your layover between two flights.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 p-4 border rounded-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2"><PlaneLanding className="w-5 h-5 text-primary" />Arrival Flight</h3>
                                    <FormField
                                        control={form.control}
                                        name="arrivalDateTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Arrival Date & Time</FormLabel>
                                                <FormControl>
                                                    <Input type="datetime-local" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2 p-4 border rounded-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2"><PlaneTakeoff className="w-5 h-5 text-primary" />Connecting Flight</h3>
                                    <FormField
                                        control={form.control}
                                        name="departureDateTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Departure Date & Time</FormLabel>
                                                <FormControl>
                                                    <Input type="datetime-local" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="submit">Calculate Layover</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Total Layover Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {result.totalMinutes < 0 ? (
                            <p className="text-red-500">{result.formatted}</p>
                        ) : (
                            <div className="p-6 bg-muted rounded-lg text-center">
                                <p className="text-sm text-muted-foreground">Time Between Flights</p>
                                <p className="text-4xl font-bold text-primary">{result.formatted}</p>
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
                        <h3 className="font-semibold text-lg">Arrival Date & Time</h3>
                        <p className="text-muted-foreground">The scheduled local time and date your first flight arrives at the layover airport.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Departure Date & Time</h3>
                        <p className="text-muted-foreground">The scheduled local time and date your connecting flight departs from the same layover airport.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator finds the absolute time difference in milliseconds between the departure of the second flight and the arrival of the first flight, then converts this duration into hours and minutes.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">
                            LayoverTime = DepartureDateTime - ArrivalDateTime
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
                    <CardTitle className="text-2xl font-bold">The Strategic Guide to Layovers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Making the Most of Your Time Between Flights: A Traveler's Handbook</h2>
                    <p>A layover can be anything from a frantic dash between gates to a mini-vacation in itself. The key to a stress-free connection is understanding exactly how much time you have and what you can realistically do with it. This guide demystifies the layover, explaining the difference between total layover time and usable time, factors that eat into your buffer, and how to determine if you have enough time to leave the airport.</p>
                    <h3 className="text-lg font-semibold text-foreground">Total Layover vs. Usable Time: A Critical Distinction</h3>
                    <p>The first and most important concept to grasp is that your total layover duration is not your "free time." Our calculator provides the total time from when your first plane is scheduled to arrive at the gate to when your second plane is scheduled to depart. However, several factors will reduce this total, leaving you with your actual "usable time."</p>
                    <p>Here's a typical breakdown of how your layover time gets spent:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Deplaning (15-30 minutes):</strong> It takes time to get off the aircraft, especially if you are seated at the back.</li>
                        <li><strong>Navigating the Airport (15-45 minutes):</strong> This includes walking to your next gate. For large international hubs like Dubai (DXB) or Atlanta (ATL), this can involve long walks, bus rides, or train journeys between terminals.</li>
                        <li><strong>Security and Immigration (Domestic vs. International):</strong>
                            <ul className='list-disc pl-5 space-y-2 mt-2'>
                                <li><strong>Domestic Layover:</strong> If you stay within the same terminal and don't exit the secure area, you usually don't need to go through security again.</li>
                                <li><strong>International Layover:</strong> You will almost certainly have to go through immigration/passport control upon arrival and then a full security screening before proceeding to your connecting flight's gate. This can take anywhere from 30 minutes to over 2 hours during peak times.</li>
                            </ul>
                        </li>
                        <li><strong>Boarding for Connecting Flight (30-60 minutes):</strong> Airlines typically begin boarding 30-60 minutes before the scheduled departure time. The gate will close 15-20 minutes before takeoff, and you must be on the plane by then.</li>
                    </ul>
                    <h3 className="text-lg font-semibold text-foreground">Minimum Connection Times (MCT): The Airline's Guideline</h3>
                    <p>Airlines have a "Minimum Connection Time" (MCT) for every airport, which is the shortest time they will allow you to book a connecting flight. This is their calculated minimum for you to make the connection under ideal conditions. MCTs typically range from 45 minutes for a simple domestic connection to over 2 hours for a complex international one.</p>
                    <p>While the airline won't sell you a ticket that violates the MCT, this is an absolute minimum. It does not account for delays with your inbound flight, long queues at security, or any desire to eat, use the restroom, or relax. A good rule of thumb is to have at least 60 minutes on top of the airport's MCT for a comfortable connection.</p>
                    <h3 className="text-lg font-semibold text-foreground">The Million-Dollar Question: Can I Leave the Airport?</h3>
                    <p>Leaving the airport during a layover is tempting but requires careful planning. Use this checklist to decide:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Calculate Usable Time:</strong> Subtract all the buffer times from your total layover. As a rough guide:
                            <p className="font-mono text-sm p-2 bg-muted rounded-md mt-2">Usable Time ≈ Total Layover - 1 hour (deplaning/navigating) - 2 hours (return security/boarding) = Total Layover - 3 hours.</p>
                            For international layovers, add at least another hour for immigration on both ends, making it closer to `Total Layover - 4 to 5 hours`.
                        </li>
                        <li><strong>Factor in Travel to the City:</strong> Research how long it takes to get from the airport to a point of interest and back. This can be 30 minutes to over an hour each way.</li>
                        <li><strong>Check Visa Requirements:</strong> If you are on an international layover, you must have the proper visa or be from a visa-exempt country to enter the country the airport is in.</li>
                        <li><strong>Baggage:</strong> If you checked a bag, will it be transferred automatically to your final destination, or do you need to collect it and re-check it? If you have to re-check it, this adds significant time and makes leaving the airport very difficult.</li>
                    </ol>
                    <p><strong>General Rule of Thumb:</strong> For a domestic layover, you need at least **4-5 hours** to comfortably leave the airport. For an international layover, a minimum of **7-8 hours** is recommended.</p>
                    <h3 className="text-lg font-semibold text-foreground">Making the Most of a Short Layover (Under 3 Hours)</h3>
                    <p>If you can't leave the airport, you can still make your layover enjoyable:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Find an Airport Lounge:</strong> Many airports have lounges accessible via credit card perks, loyalty status, or by purchasing a day pass. They offer comfortable seating, Wi-Fi, food, and drinks.</li>
                        <li><strong>Explore the Airport Art and Exhibits:</strong> Many modern airports have impressive art installations, gardens (like in Singapore's Changi), or small museums.</li>
                        <li><strong>Enjoy a Proper Meal:</strong> Instead of rushing, use the time to sit down at a decent airport restaurant.</li>
                        <li><strong>Get Some Exercise:</strong> Walk the length of the terminals. Some airports even have dedicated walking paths or gyms.</li>
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
                            <AccordionTrigger>Are the arrival and departure times in the same time zone?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. All flight times on your ticket are given in the local time of the layover airport. You do not need to do any time zone conversion for this calculation.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What is a safe amount of layover time for an international flight?</AccordionTrigger>
                            <AccordionContent>
                                <p>For an international connection, a layover of at least 2-3 hours is recommended. This provides a buffer for potential flight delays, long lines at immigration and security, and navigating between terminals.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What happens if I miss my connecting flight?</AccordionTrigger>
                            <AccordionContent>
                                <p>If both flights were booked on the same ticket, the airline is responsible for rebooking you on the next available flight at no extra charge. If you booked the two flights separately, you are responsible, and you may have to buy a new ticket.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Do I need to collect my checked baggage during a layover?</AccordionTrigger>
                            <AccordionContent>
                                <p>On most domestic and many international layovers (booked on one ticket), your bags will be automatically transferred. However, when entering certain countries (like the USA), you are often required to collect your bags, go through customs, and then re-check them. Always confirm with the airline when you first check in.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>What's the difference between a layover and a stopover?</AccordionTrigger>
                            <AccordionContent>
                                <p>A layover is a connection of less than 24 hours. A stopover is a connection longer than 24 hours, which many airlines allow you to book, sometimes for free, to explore a city for a day or more as part of your journey.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>Does this calculator work for train or bus layovers?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. The principle is exactly the same. As long as you know the local arrival and departure times, you can use it to calculate the time you have between any two segments of your journey.</p>
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
                    <p className="text-muted-foreground">The Layover Time Calculator is a simple tool that provides a critical piece of data: the total time between flights. By understanding how to subtract necessary buffer times for deplaning, navigating the airport, security, and boarding, travelers can accurately assess their "usable time." This allows for confident decision-making, transforming a potentially stressful connection into a well-managed and even enjoyable part of the journey.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
