
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateJetLag, timeZones, calculateTimeZoneDifference } from '@/lib/travel-utils';
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
import { Bed, Clock, Map as MapIcon, Info, Shield, Compass, Plane, Sun, Moon } from 'lucide-react';

const formSchema = z.object({
    originTimeZone: z.string().min(1, 'Origin time zone is required.'),
    destinationTimeZone: z.string().min(1, 'Destination time zone is required.'),
    flightDuration: z.coerce.number().positive('Flight duration must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Travel Days Calculator', href: '/travel-days-calculator' },
    { name: 'Time Zone Difference Calculator', href: '/time-zone-difference-calculator' },
    { name: 'Travel Buffer Time Calculator', href: '/travel-buffer-time-calculator' },
    { name: 'Layover Time Calculator', href: '/layover-time-calculator' },
];

export default function JetLagCalculator() {
    const [result, setResult] = useState<{ recoveryDays: number, advice: string } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            originTimeZone: 'America/New_York',
            destinationTimeZone: 'Europe/London',
            flightDuration: undefined,
        },
    });

    const getOffsetInHours = (timeZone: string) => {
        try {
            const date = new Date();
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
            return (tzDate.getTime() - utcDate.getTime()) / 3600000;
        } catch {
            return 0;
        }
    }

    const onSubmit = (data: FormValues) => {
        // Determine direction
        const originOffset = getOffsetInHours(data.originTimeZone);
        const destinationOffset = getOffsetInHours(data.destinationTimeZone);

        // Naive direction:
        let diff = destinationOffset - originOffset;
        // Normalize diff to -12 to 12 range ??
        // Actually, just standard diff. If > 0, East. < 0, West.
        // Except overlapping dateline!
        // E.g. LA (-8) to Tokyo (+9). Diff = +17.
        // +17 means East. Correct.
        // Tokyo (+9) to LA (-8). Diff = -17. West. Correct.

        // What if Tokyo to New York? +9 to -5. Diff = -14. West.

        const flightDirection = diff >= 0 ? 'east' : 'west';

        const res = calculateJetLag({
            originTimeZone: data.originTimeZone,
            destinationTimeZone: data.destinationTimeZone,
            flightDurationHours: data.flightDuration,
            flightDirection
        });

        setResult({
            recoveryDays: res.daysToAdapt,
            advice: res.advice
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Jet Lag Recovery Calculator</CardTitle>
                    <CardDescription>
                        Estimate your jet lag recovery time and get personalized advice based on your travel direction.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="originTimeZone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Sun className="h-4 w-4" />Origin Time Zone</FormLabel>
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
                                    name="destinationTimeZone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Moon className="h-4 w-4" />Destination Time Zone</FormLabel>
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
                            <FormField
                                control={form.control}
                                name="flightDuration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Plane className="h-4 w-4" />Total Flight Duration (hours)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 8" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Calculate Jet Lag</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Jet Lag Recovery Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-muted rounded-lg text-center flex flex-col justify-center">
                            <p className="text-sm text-muted-foreground">Estimated Recovery Time</p>
                            <p className="text-4xl font-bold text-primary">{result.recoveryDays} Days</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Advice:</h3>
                            <p className="text-muted-foreground">{result.advice}</p>
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
                        <h3 className="font-semibold text-lg">Origin & Destination Time Zones</h3>
                        <p className="text-muted-foreground">Select your starting and ending time zones.</p>
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
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The Jet Lag Calculator provides an evidence-based estimate for your recovery time by focusing on the number of time zones crossed. Jet lag is a temporary disruption of your internal body clock, or circadian rhythm. By understanding the science behind it—especially the powerful role of light exposure and the difference between eastward and westward travel—you can use the personalized advice to strategically speed up your adjustment and minimize the fatigue, allowing you to enjoy your destination from day one.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
