
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateTimeZoneDifference, timeZones } from '@/lib/travel-utils';
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
import { Clock, Plane, Map as MapIcon, Info, Shield, Compass, Globe } from 'lucide-react';


const formSchema = z.object({
    timeZone1: z.string().min(1, 'First time zone is required.'),
    timeZone2: z.string().min(1, 'Second time zone is required.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Flight Duration Calculator', href: '/category/travel-adventure/flight-duration-calculator' },
    { name: 'Travel Time Calculator', href: '/category/travel-adventure/travel-time-calculator' },
    { name: 'Jet Lag Calculator', href: '/category/travel-adventure/jet-lag-calculator' },
    { name: 'Driving Time with Breaks Calculator', href: '/category/travel-adventure/driving-time-with-breaks-calculator' },
];

export default function TimeZoneDifferenceCalculator() {
    const [result, setResult] = useState<string | null>(null);
    const [clocks, setClocks] = useState<{ time1: string; time2: string } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            timeZone1: 'America/New_York',
            timeZone2: 'Europe/London',
        },
    });

    const { watch, handleSubmit } = form;
    const timeZone1 = watch('timeZone1');
    const timeZone2 = watch('timeZone2');

    const onSubmit = useCallback((data: FormValues) => {
        const difference = calculateTimeZoneDifference(data.timeZone1, data.timeZone2);
        setResult(difference);
    }, []);

    useEffect(() => {
        if (timeZone1 && timeZone2) {
            onSubmit({ timeZone1, timeZone2 });
        }
    }, [timeZone1, timeZone2, onSubmit]);


    useEffect(() => {
        const updateClocks = () => {
            if (timeZone1 && timeZone2) {
                try {
                    const now = new Date();
                    const time1 = now.toLocaleTimeString('en-US', { timeZone: timeZone1, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                    const time2 = now.toLocaleTimeString('en-US', { timeZone: timeZone2, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                    setClocks({ time1, time2 });
                } catch (e) {
                    // Invalid timezone can cause crash
                    setClocks(null);
                }
            }
        };

        updateClocks();
        const interval = setInterval(updateClocks, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [timeZone1, timeZone2]);


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Time Zone Difference Calculator</CardTitle>
                    <CardDescription>
                        Calculate the current time difference between any two time zones in the world.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="timeZone1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Time Zone 1</FormLabel>
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
                                <FormField
                                    control={form.control}
                                    name="timeZone2"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Time Zone 2</FormLabel>
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
                            <Button type="submit">Calculate Difference</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {clocks && (
                <Card>
                    <CardHeader>
                        <CardTitle>Live Clocks</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">{timeZone1}</p>
                            <p className="text-4xl font-bold font-mono">{clocks.time1}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">{timeZone2}</p>
                            <p className="text-4xl font-bold font-mono">{clocks.time2}</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Result</CardTitle>
                    </CardHeader>
                    <CardContent className="text-lg text-center p-6 bg-muted rounded-lg">
                        <p className="font-semibold text-primary">{result}</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Time Zone 1 & Time Zone 2</h3>
                        <p className="text-muted-foreground">These are the two time zones you wish to compare. It is crucial to use the standard IANA (Internet Assigned Numbers Authority) time zone format (e.g., "America/New_York", "Asia/Tokyo") to ensure accuracy. This format automatically accounts for Daylight Saving Time rules, which can change the offset of a time zone depending on the time of year.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator determines the current UTC offset for each of the two selected IANA time zones. The difference between these two offsets gives the total time difference. The calculation is essentially:</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">
                            Difference (in hours) = UTC_Offset(TimeZone2) - UTC_Offset(TimeZone1)
                        </p>
                    </div>
                    <p className="mt-2 text-muted-foreground">The result is then formatted into a human-readable string indicating which time zone is ahead and by how many hours and minutes.</p>
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
                    <CardTitle className="text-2xl font-bold">Mastering Time Across the Globe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">The Professional's Guide to Time Zone Calculation</h2>
                    <p>In our globalized world, coordinating across different time zones is a daily necessity for businesses, travelers, and families alike. Miscalculating time differences can lead to missed meetings, confused communication, and disrupted travel plans. This comprehensive guide provides an expert look into the mechanics of time zones, the importance of using standardized identifiers, and the impact of Daylight Saving Time, empowering you to manage global time with confidence and precision.</p>

                    <h3 className="text-lg font-semibold text-foreground">Beyond Simple Hours: What is a Time Zone?</h3>
                    <p>A time zone is a region of the globe that observes a uniform standard time for legal, commercial, and social purposes. Historically, time was a local phenomenon, based on the sun's position. The advent of railways and instant communication in the 19th century necessitated a standardized system. This led to the creation of 24 primary time zones, each theoretically 15 degrees of longitude wide, based on the 24 hours in a day. The reference point for this system is Coordinated Universal Time (UTC), the successor to Greenwich Mean Time (GMT).</p>
                    <p>However, the real-world map of time zones is far from neat. Borders are drawn for political and economic convenience, resulting in jagged lines, and some regions use non-standard offsets (like 30 or 45 minutes) from UTC. India, for example, is UTC+5:30, and parts of Australia are UTC+9:30.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Daylight Saving Dilemma and the IANA Solution</h3>
                    <p>The biggest challenge in time zone calculation is Daylight Saving Time (DST). Many countries spring forward by an hour in the summer to make better use of natural daylight and then fall back in the autumn. The rules, start dates, and end dates for DST vary significantly between countries and can even change from year to year. This makes using simple offsets like "-5 hours" unreliable. Is that Eastern Standard Time (EST, UTC-5) or Eastern Daylight Time (EDT, UTC-4)?</p>
                    <p>This is why the professional standard is the IANA Time Zone Database. This database, maintained by the Internet Assigned Numbers Authority, provides unique, unambiguous identifiers for every time zone region in the world, in the format `Region/City` (e.g., `America/Los_Angeles`, `Europe/Berlin`, `Australia/Sydney`).</p>
                    <p>Using an IANA identifier is critical because it contains the entire history and future of DST rules for that location. When you use our calculator with "America/New_York", it automatically knows whether DST is in effect on today's date and applies the correct UTC offset (either -4 or -5). This is the only way to ensure calculations are accurate every day of the year.</p>

                    <h3 className="text-lg font-semibold text-foreground">How the Calculation Works: A Two-Step Process</h3>
                    <p>The logic behind calculating the difference between two time zones is elegant and straightforward once you use the IANA standard:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Determine the Current UTC Offset for Each Zone:</strong> The calculator takes the first IANA time zone (e.g., `Asia/Dubai`) and asks, "What is this zone's current offset from UTC?" The system returns `+4` hours. It does the same for the second zone (e.g., `America/Chicago`), and the system returns `-5` hours (since it's currently Daylight Time).</li>
                        <li><strong>Calculate the Difference:</strong> The calculator then finds the difference between these two offsets. The difference between +4 and -5 is 9 hours. It then determines which zone is "ahead" (the one with the greater offset). In this case, Dubai is 9 hours ahead of Chicago.</li>
                    </ol>
                    <p>This method is foolproof because it relies on the live, current offset, sidestepping all the complexities of DST rules.</p>

                    <h3 className="text-lg font-semibold text-foreground">Practical Applications for Global Coordination</h3>
                    <p>Mastering time zone differences is essential for:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>International Business:</strong> Scheduling a conference call between offices in San Francisco, London, and Singapore requires knowing the precise time difference to find a slot that is reasonable for all participants.</li>
                        <li><strong>Travel Planning:</strong> Knowing the time difference to your destination is the first step in combating jet lag. It helps you adjust your sleep schedule before you even leave. It's also critical for understanding your flight's arrival time in the local context.</li>
                        <li><strong>Software Development:</strong> Any application that deals with users across the world must handle time zones correctly to display dates, deadlines, and logs accurately. Storing all times in UTC and converting to the user's local time zone for display is the standard best practice.</li>
                        <li><strong>Global Event Broadcasting:</strong> From sporting events like the Olympics to online product launches, broadcasters must publish schedules in multiple time zones to reach a global audience effectively.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">Common Pitfalls and How to Avoid Them</h3>
                    <p>Even with tools, users can make common mistakes:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Confusing Similar-Sounding Zones:</strong> "Central Time" in the US is different from "Central European Time". Always verify the region.</li>
                        <li><strong>Ignoring DST:</strong> Planning a meeting for a future date without considering that one location might enter or leave DST before then. Using an IANA-based calculator solves this automatically.</li>
                        <li><strong>Forgetting About the Date Line:</strong> When time differences are large, the date in one location may be different from the other. A Tuesday morning in New York is still Monday evening in California. Our calculator's live clock display helps visualize this.</li>
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
                            <AccordionTrigger>What is UTC and how is it different from GMT?</AccordionTrigger>
                            <AccordionContent>
                                <p>UTC (Coordinated Universal Time) is the modern, scientific standard for world time. GMT (Greenwich Mean Time) is an older standard based on the mean solar time at the Royal Observatory in Greenwich, London. For most practical purposes, they are interchangeable, but UTC is the official term used in technical, aviation, and scientific contexts.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Why do some places have 30-minute or 45-minute offsets?</AccordionTrigger>
                            <AccordionContent>
                                <p>These non-standard offsets are historical and political decisions. For example, India chose a single time zone (UTC+5:30) to unify the country, which falls halfway between two standard meridians. Nepal (UTC+5:45) is another well-known example.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What is the International Date Line?</AccordionTrigger>
                            <AccordionContent>
                                <p>The International Date Line (IDL) is an imaginary line on the surface of the Earth that runs from the north pole to the south pole and demarcates the change of one calendar day to the next. When you cross the IDL heading east, you subtract a day, and when you cross it heading west, you add a day. It roughly follows the 180° longitude line.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Do all countries use Daylight Saving Time?</AccordionTrigger>
                            <AccordionContent>
                                <p>No. The use of DST is not universal. Most countries near the equator do not observe it because the length of the day doesn't vary enough to justify it. Many countries in Asia and Africa also do not use DST. This is why using IANA time zones is so important, as it accounts for which regions do and do not observe DST.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>How can I find the correct IANA time zone for my city?</AccordionTrigger>
                            <AccordionContent>
                                <p>The calculator's dropdown list is a comprehensive source. You can typically find your time zone by looking for your continent or region, followed by a major city near you (e.g., `Europe/Paris`, `America/Sao_Paulo`). A quick web search for "[Your City] IANA time zone" will also give you the correct identifier.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>Why are there two clocks shown?</AccordionTrigger>
                            <AccordionContent>
                                <p>The two live clocks provide a real-time visualization of the current time in each of the selected zones. This helps you instantly see the difference and understand the time of day in the other location without having to do any mental math. They update every second to stay accurate.</p>
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
                    <p className="text-muted-foreground">The Time Zone Difference Calculator is an indispensable utility for anyone operating on a global scale. By using the industry-standard IANA database, it provides precise, error-free calculations that automatically handle the complexities of Daylight Saving Time. This tool helps users coordinate meetings, plan travel, and communicate effectively across borders, turning a potentially confusing task into a simple and reliable process.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
