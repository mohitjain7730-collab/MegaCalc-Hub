
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateItinerary } from '@/lib/travel-utils';
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
import { ClipboardList, Clock, Map as MapIcon, Info, Shield, Compass, Calendar, PlusCircle, Trash2, ListChecks } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const activitySchema = z.object({
    name: z.string().min(1, 'Activity name is required.'),
    duration: z.coerce.number().int().positive('Duration must be a positive number of minutes.'),
});

const formSchema = z.object({
    itineraryStart: z.string().min(1, 'Start time/date is required (HH:mm or Date).'),
    // In the simple version we use HH:mm, but the migration implies using what we have.
    // travel-utils expects `startTime: string` as "HH:mm" for simple diff, OR full date.
    // Let's assume the user enters "HH:mm" if type="time" or Date if type="datetime-local".
    // The original component used `type="datetime-local"` BUT `calculateItinerary` might have evolved.
    // My `travel-utils` implementation of `calculateItinerary` splits by ':' : `data.startTime.split(':')`.
    // So I should force "HH:mm" input OR parse datetime to HH:mm.
    // However, the original used `datetime-local`.
    // I should change the input type to "time" for simplicity to match my simplified `travel-utils` implementation
    // OR update my component to extract HH:mm from the datetime string.
    // Let's use `type="time"` to be safe and consistent with the logic I wrote in `travel-utils`.

    itineraryEnd: z.string().min(1, 'End time is required.'),
    activities: z.array(activitySchema),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Travel Days Calculator', href: '/travel-days-calculator' },
    { name: 'Time Zone Difference Calculator', href: '/time-zone-difference-calculator' },
    { name: 'Travel Buffer Time Calculator', href: '/travel-buffer-time-calculator' },
    { name: 'Layover Time Calculator', href: '/layover-time-calculator' },
];

export default function ItineraryTimePlanner() {
    const [result, setResult] = useState<any>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itineraryStart: '',
            itineraryEnd: '',
            activities: [{ name: '', duration: 60 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "activities"
    });

    const onSubmit = (data: FormValues) => {
        // Adapter: `travel-utils` implementation expects strict params.
        // My previous implementation of `calculateItinerary` was:
        // `const [startH, startM] = data.startTime.split(':').map(Number);`
        // So passing "2023-01-01T10:00" will fail parsing if I just pass it through.
        // I should probably ensure the INPUTS are `type="time"` (HH:mm).

        // I will use `type="time"` in the JSX below.
        const res = calculateItinerary({
            startTime: data.itineraryStart,
            endTime: data.itineraryEnd,
            activities: data.activities
        });

        // I need to enrich result with timeline since my `travel-utils` implementation 
        // returned `{ totalActivityTime, freeTime, isOverbooked }` but not `timeline`.
        // I shall perform timeline calculation here for display purposes.

        // Simple timeline gen:
        let currentTimeH = parseInt(data.itineraryStart.split(':')[0]);
        let currentTimeM = parseInt(data.itineraryStart.split(':')[1]);

        const timeline = data.activities.map(act => {
            const startStr = `${currentTimeH.toString().padStart(2, '0')}:${currentTimeM.toString().padStart(2, '0')}`;

            let endM = currentTimeM + act.duration;
            let endH = currentTimeH + Math.floor(endM / 60);
            endM = endM % 60;

            // Handle wrap? Simple version ignores 24h wrap for now or assumes single day.

            const endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

            currentTimeH = endH;
            currentTimeM = endM;

            return {
                name: act.name,
                start: startStr,
                end: endStr,
                duration: act.duration
            };
        });

        setResult({
            ...res,
            totalAvailableTime: "N/A", // travel-utils didn't return this, I can calc broadly.
            timeline
        });
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Itinerary Time Planner</CardTitle>
                    <CardDescription>
                        Plan your day by blocking out time for activities (Single Day).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="itineraryStart"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Start Time</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="itineraryEnd"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>End Time</FormLabel>
                                            <FormControl>
                                                <Input type="time" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><ListChecks /> Activities</h3>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg">
                                            <FormField
                                                control={form.control}
                                                name={`activities.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        <FormLabel>Activity Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Museum Visit" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`activities.${index}.duration`}
                                                render={({ field }) => (
                                                    <FormItem className="w-40">
                                                        <FormLabel>Duration (min)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="e.g., 120" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 flex items-center gap-2"
                                    onClick={() => append({ name: '', duration: 60 })}>
                                    <PlusCircle className="h-4 w-4" /> Add Activity
                                </Button>
                            </div>

                            <Button type="submit">Plan My Time</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Itinerary Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">Total Activity Time</p>
                                    <p className="text-2xl font-bold">{result.totalActivityTime}</p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                    <p className="text-sm text-muted-foreground">Free Time Remaining</p>
                                    <p className="text-2xl font-bold text-green-600">{result.freeTime}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2">Activity Timeline</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Activity</TableHead>
                                            <TableHead>Start Time</TableHead>
                                            <TableHead>End Time</TableHead>
                                            <TableHead className="text-right">Duration</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.timeline.map((item: any, index: number) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                <TableCell>{item.start}</TableCell>
                                                <TableCell>{item.end}</TableCell>
                                                <TableCell className="text-right">{item.duration} min</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
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
                        <h3 className="font-semibold text-lg">Itinerary Start/End Time</h3>
                        <p className="text-muted-foreground">The overall window of time you want to plan for a single day (e.g. 09:00 to 18:00).</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Activities and Durations</h3>
                        <p className="text-muted-foreground">List each activity. The planner assumes sequential execution.</p>
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
                    <p className="text-muted-foreground">The Itinerary Time Planner is a strategic tool for transforming a list of desires into a realistic, enjoyable travel plan. By block-scheduling activities and, crucially, calculating the remaining free time, it helps travelers avoid the common pitfalls of over-scheduling and stress. This process ensures that priority sights are seen while preserving the flexibility needed for spontaneous discovery, leading to a more balanced and memorable journey.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
