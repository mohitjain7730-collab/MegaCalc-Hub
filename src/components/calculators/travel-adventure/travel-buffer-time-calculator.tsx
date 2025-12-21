
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateBufferTime } from '@/lib/travel-utils';
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
import { Clock, ShieldCheck, TrafficCone, Compass, Info, Shield, Percent, Timer } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

const formSchema = z.object({
    baseTravelTime: z.coerce.number().positive('Travel time must be positive.'),
    bufferPercentage: z.coerce.number().min(0).max(100),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Driving Time with Breaks Calculator', href: '/category/travel-adventure/driving-time-with-breaks-calculator' },
    { name: 'Travel Time Calculator', href: '/category/travel-adventure/travel-time-calculator' },
    { name: 'Layover Time Calculator', href: '/category/travel-adventure/layover-time-calculator' },
    { name: 'Itinerary Time Planner', href: '/category/travel-adventure/itinerary-time-planner' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function TravelBufferTimeCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateBufferTime> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            baseTravelTime: undefined,
            bufferPercentage: 25,
        },
    });

    const onSubmit = (data: FormValues) => {
        // travel-utils signature: calculateBufferTime(baseMinutes: number, percentage: number)
        const res = calculateBufferTime(data.baseTravelTime, data.bufferPercentage);
        setResult(res);
    };

    const bufferPercentage = form.watch('bufferPercentage');

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Travel Buffer Time Calculator</CardTitle>
                    <CardDescription>
                        Calculate the necessary buffer time to add to your travel plans for a stress-free journey.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="baseTravelTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Timer className="w-4 h-4" /> Base Travel Time (minutes)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g., 120" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bufferPercentage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Percent className="w-4 h-4" /> Buffer Percentage ({bufferPercentage}%)
                                        </FormLabel>
                                        <FormControl>
                                            <Slider
                                                min={0}
                                                max={100}
                                                step={5}
                                                value={[field.value]}
                                                onValueChange={(value) => field.onChange(value[0])}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Calculate Buffer</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Buffered Travel Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Base Time</p>
                            <p className="text-2xl font-bold">{result.baseTimeFormatted}</p>
                        </div>
                        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                            <p className="text-sm text-muted-foreground">Buffer Added</p>
                            <p className="text-2xl font-bold text-orange-600">+{result.bufferTimeFormatted}</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Padded Time</p>
                            <p className="text-2xl font-bold text-green-600">{result.totalTimeFormatted}</p>
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
                        <h3 className="font-semibold text-lg">Base Travel Time (minutes)</h3>
                        <p className="text-muted-foreground">This is your initial, best-case travel time estimate in minutes, before adding any buffer. You can get this from a mapping service or our Travel Time Calculator.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Buffer Percentage</h3>
                        <p className="text-muted-foreground">This reflects your risk tolerance and the trip's importance. A higher percentage adds more padding for potential delays. A low-stakes trip might only need a 15-20% buffer, while a critical trip (like catching a flight) warrants 50% or more.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator applies a simple percentage to your base travel time to determine the buffer, then adds it to the base time for the total padded duration.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">BufferTime = BaseTime * (BufferPercentage / 100)</p>
                        <p className="font-mono text-sm md:text-base font-bold">TotalTime = BaseTime + BufferTime</p>
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
                    <CardTitle className="text-2xl font-bold">The Art of Margin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Why Buffer Time is the Key to Stress-Free Travel and Punctual Arrivals</h2>
                    <p>In a perfect world, every trip would run exactly as planned. In the real world, however, delays are not just possible; they are probable. Traffic, unexpected construction, long security lines, and slow service are all common variables that can derail a tightly-packed schedule. The secret to navigating this uncertainty with calm and confidence is building in "buffer time." This guide delves into the psychology of planning, the common sources of delay, and how to strategically apply buffer time to ensure you always arrive on time and stress-free.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Planning Fallacy: Why We Are All Bad at Estimating Time</h3>
                    <p>The "planning fallacy" is a well-documented cognitive bias, first proposed by Daniel Kahneman and Amos Tversky, that causes people to consistently underestimate the time needed to complete a future task, even when they have experience with similar tasks. We tend to focus on the best-case scenario and ignore the potential for common, predictable delays. We imagine the smooth, traffic-free highway, not the 20-minute backup from an accident or the 10-minute search for a parking spot.</p>
                    <p>Buffer time is the antidote to the planning fallacy. It is a conscious, deliberate acknowledgment that things can and will go wrong. By adding a margin to your initial estimate, you are creating a temporal cushion that can absorb unexpected delays without causing stress or making you late.</p>

                    <h3 className="text-lg font-semibold text-foreground">A Framework for Choosing Your Buffer Percentage</h3>
                    <p>The "right" amount of buffer time is not a fixed number; it's a percentage that depends on the complexity and importance of the journey. Our calculator uses a percentage-based slider to help you quantify this.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Low Importance (15-20% Buffer):</strong> This is for trips where punctuality is not critical. Think visiting a friend in a nearby town or heading to a park. Arriving 15 minutes late is not a major issue. For a 60-minute trip, a 20% buffer adds a comfortable 12 minutes.</li>
                        <li><strong>Medium Importance (25-40% Buffer):</strong> This is the standard for most day-to-day appointments: a dinner reservation, a doctor's appointment, or meeting a group for an event. You want to be on time, and a delay would be inconvenient. For a 60-minute trip, a 30% buffer adds 18 minutes.</li>
                        <li><strong>High Importance / High Uncertainty (50-100%+ Buffer):</strong> This is for critical, high-stakes travel where being late has significant negative consequences. The classic example is catching a flight. You must also use a high buffer for journeys with high uncertainty, such as driving through a major city during rush hour or traveling during a snowstorm. For a 60-minute drive to the airport, a 50% buffer is a good start (adding 30 minutes), and a 100% buffer (adding a full hour) is even safer. The cost of being an hour early is minimal; the cost of being one minute late is missing your flight.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">Common Sources of Delay to Justify Your Buffer</h3>
                    <p>When you add a buffer, you are buying insurance against a list of common travel delays. Thinking about these specifically can help you appreciate why the extra time is necessary.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Traffic Congestion:</strong> The single biggest variable. One accident can add 20-30 minutes to a commute instantly.</li>
                        <li><strong>Infrastructure Delays:</strong> Road construction, detours, a slow-moving train at a crossing.</li>
                        <li><strong>Parking and Navigation:</strong> Finding a parking spot in a busy area and walking from the garage to your actual destination can easily take 10-15 minutes.</li>
                        <li><strong>Personal Delays:</strong> A last-minute search for keys, a forgotten item, a needed bathroom break for a child before leaving the house.</li>
                        <li><strong>Public Transit Issues:</strong> A delayed subway train or a bus stuck in traffic.</li>
                        <li><strong>Airport-Specific Delays:</strong> Long lines at bag drop, security screening, or passport control.</li>
                    </ul>
                    <p>Your 30-minute buffer isn't for one single catastrophe; it's for absorbing a series of these small, 5-to-10-minute "time thieves" that collectively erode your schedule.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Psychological Benefit: Arriving Calm and Prepared</h3>
                    <p>The practical benefit of buffer time is punctuality. The psychological benefit is just as important: peace of mind. Traveling with a tight schedule is stressful. Every red light and slow driver becomes a source of anxiety. You arrive at your destination flustered, agitated, and mentally drained.</p>
                    <p>When you travel with a healthy buffer, your mindset shifts. Delays are no longer crises; they are simply events that your plan was designed to handle. You can relax, listen to music or a podcast, and enjoy the journey. You arrive at your destination calm, collected, and ready for whatever is next. For a job interview, a major presentation, or the start of a vacation, this calm state of mind is a significant competitive advantage and a huge boost to your well-being.</p>
                    <p>Think of buffer time not as "wasted time" if you arrive early, but as "proactive relaxation time." It's the time you invest to guarantee a smooth and stress-free outcome. Use the extra minutes to review your notes, answer an email, or simply breathe before your appointment. You will never regret arriving early, but you will always regret arriving late.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>What's a good default buffer percentage to use?</AccordionTrigger>
                            <AccordionContent>
                                <p>For everyday trips like going to an office or a restaurant, 25% is a very safe and effective buffer. It's enough to absorb most common traffic and minor delays without making you excessively early. For high-stakes travel like catching a flight, start with 50% and consider increasing it based on traffic conditions.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Should I get my "Base Travel Time" from?</AccordionTrigger>
                            <AccordionContent>
                                <p>Use a real-time mapping service like Google Maps or Waze. Enter your destination and check the ETA right before you plan to leave. This live estimate is your best "Base Travel Time" because it already accounts for current traffic patterns. Then, add your buffer to that live estimate.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Does this calculator work for things other than driving?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes, absolutely. The concept of buffer time applies to any scheduled activity. You can use it to pad time estimates for getting through airport security, taking public transportation, or even for how long a project at work might take. It's a universal principle for managing uncertainty.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Isn't it wasteful to always arrive early?</AccordionTrigger>
                            <AccordionContent>
                                <p>Consider the alternative. The cost of being 15 minutes late to a critical meeting or flight is far higher than the cost of being 15 minutes early. That "early" time is not wasted; it's your insurance policy against stress and failure. Use the extra time to relax, prepare, or check messages.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>How does this relate to the Itinerary Time Planner?</AccordionTrigger>
                            <AccordionContent>
                                <p>They work perfectly together. After you estimate the duration for an activity in your itinerary (e.g., "Drive to Museum"), you can use this Buffer Time Calculator to determine a more realistic duration to enter into the planner. For a 30-minute estimated drive, you might add a 50% buffer and block out 45 minutes in your itinerary.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>What if a trip has multiple legs?</AccordionTrigger>
                            <AccordionContent>
                                <p>You should calculate the buffer for each leg separately, as they may have different levels of uncertainty. For example, a drive to the train station might require a 50% buffer, while the train journey itself is very predictable and may only need a 10% buffer for the walk on the other end.</p>
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
                    <p className="text-muted-foreground">The Travel Buffer Time Calculator is a tool for strategic planning that directly counters our natural tendency to be overly optimistic (the planning fallacy). By consciously adding a percentage-based margin to any travel estimate, you create a temporal cushion that absorbs common delays. This practice transforms a journey from a source of potential stress into a predictable and calm experience, ensuring punctuality for important events and promoting overall well-being.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
