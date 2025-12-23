'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateMultiStopRoute } from '@/lib/travel-utils';
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
import { Map, PlusCircle, Trash2, Info, Shield, Compass, Route, Gauge } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const stopSchema = z.object({
    name: z.string().min(1, 'Stop name is required.'),
    lat: z.coerce.number().min(-90).max(90),
    lon: z.coerce.number().min(-180).max(180),
});

const formSchema = z.object({
    stops: z.array(stopSchema).min(2, 'At least two stops are required.'),
    averageSpeed: z.coerce.number().positive('Average speed must be positive.'),
    speedUnit: z.enum(['mph', 'kmh']),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Backpack Weight Calculator', href: '/category/travel-adventure/backpack-weight-calculator' },
    { name: 'Cost Per Mile Calculator', href: '/category/travel-adventure/cost-per-mile-calculator' },
    { name: 'Fuel Cost Calculator', href: '/category/travel-adventure/fuel-cost-calculator' },
    { name: 'Hiking Calorie Calculator', href: '/category/travel-adventure/hiking-calorie-calculator' },
    { name: 'Hiking Time Calculator', href: '/category/travel-adventure/hiking-time-calculator' },
    { name: 'Hotel Cost Calculator', href: '/category/travel-adventure/hotel-cost-calculator' },
    { name: 'Rental Car Cost Calculator', href: '/category/travel-adventure/rental-car-cost-calculator' },
    { name: 'Trip Budget Calculator', href: '/category/travel-adventure/trip-budget-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function MultiStopRoutePlanner() {
    const [result, setResult] = useState<ReturnType<typeof calculateMultiStopRoute> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            stops: [
                { name: '', lat: undefined as any, lon: undefined as any },
                { name: '', lat: undefined as any, lon: undefined as any },
            ],
            averageSpeed: undefined,
            speedUnit: 'mph',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "stops"
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateMultiStopRoute(data);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Multi-Stop Route Planner</CardTitle>
                    <CardDescription>
                        Plan a road trip by calculating the total distance and estimated driving time between multiple stops.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Map /> Trip Stops</h3>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-4 border rounded-lg space-y-4">
                                            <div className="flex justify-between items-start">
                                                <FormField control={form.control} name={`stops.${index}.name`} render={({ field }) => (
                                                    <FormItem className="w-1/3">
                                                        <FormLabel>Stop #{index + 1} Name</FormLabel>
                                                        <FormControl><Input placeholder="e.g., Chicago" {...field} value={field.value ?? ''} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <FormField control={form.control} name={`stops.${index}.lat`} render={({ field }) => (
                                                    <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" placeholder="e.g., 41.8781" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                                <FormField control={form.control} name={`stops.${index}.lon`} render={({ field }) => (
                                                    <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" placeholder="e.g., -87.6298" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => append({ name: '', lat: undefined as any, lon: undefined as any })}><PlusCircle className="h-4 w-4 mr-2" />Add Stop</Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <FormField
                                    control={form.control}
                                    name="averageSpeed"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Gauge className="w-4 h-4" />Estimated Average Speed</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 65" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormField
                                                    control={form.control}
                                                    name="speedUnit"
                                                    render={({ field: unitField }) => (
                                                        <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-[120px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="mph">mph</SelectItem>
                                                                <SelectItem value="kmh">km/h</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full">Plan Route</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Route Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Stops</p>
                                <p className="text-2xl font-bold text-primary">{result.totalStops}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Distance</p>
                                <p className="text-2xl font-bold">{result.totalDistance}</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                <p className="text-sm text-muted-foreground">Estimated Driving Time</p>
                                <p className="text-2xl font-bold text-green-600">{result.totalTime}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Trip Legs</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Leg</TableHead>
                                        <TableHead>Distance</TableHead>
                                        <TableHead>Est. Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.legs.map((leg: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{leg.from} → {leg.to}</TableCell>
                                            <TableCell>{leg.distance}</TableCell>
                                            <TableCell>{leg.time}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
                        <h3 className="font-semibold text-lg">Stops (Latitude & Longitude)</h3>
                        <p className="text-muted-foreground">Each stop on your journey requires a name and its geographic coordinates. You can find latitude and longitude for any location using an online map service like Google Maps (right-click on a location to see its coordinates).</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Average Speed</h3>
                        <p className="text-muted-foreground">This is your estimated average speed for the entire trip. It's crucial to provide a realistic number that accounts for speed limits, potential traffic, and terrain, not just the highway speed limit.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator iterates through your stops in the order you provide. For each leg of the journey, it uses the Haversine formula to calculate the great-circle ("as the crow flies") distance between the two points. It sums these distances to get the total trip distance. The estimated driving time is then calculated by dividing the total distance by your provided average speed.</p>
                    <p className="mt-2 text-sm text-muted-foreground"><strong>Important:</strong> This calculator provides the straight-line distance, not the actual road distance. The actual driving distance will always be longer. This tool is best used for high-level planning and estimation.</p>
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
                    <CardTitle className="text-2xl font-bold">The Art of the American Road Trip</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">A Guide to Planning Epic Multi-Stop Journeys</h2>
                    <p>The multi-stop road trip is a classic adventure, weaving together cities, national parks, and quirky roadside attractions into a single, cohesive journey. But planning one can feel daunting. How far is it really between all those stops? How long will it take to drive? This guide explores the fundamentals of multi-stop route planning, the difference between idealized distance and real-world mileage, and how to use our planner as a starting point for your next great adventure.</p>

                    <h3 className="text-lg font-semibold text-foreground">The "As the Crow Flies" Limitation</h3>
                    <p>Our Multi-Stop Route Planner calculates the **great-circle distance** between your stops. This is the shortest possible path between two points on the surface of the Earth, and it's calculated using the Haversine formula based on latitude and longitude. While this is perfect for understanding the geographic scale of your trip, it's crucial to remember that **you cannot drive in a straight line**. Actual road distance will always be longer because roads must navigate around mountains, rivers, lakes, and private property.</p>
                    <p>Think of this calculator as your high-level "feasibility checker." It helps you answer big-picture questions: Is a trip from Miami to Seattle via Chicago and Denver realistic in two weeks? Is it hundreds of miles or thousands? By providing a baseline distance, you can quickly gauge the magnitude of your planned route.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Traveling Salesperson Problem: Why Order Matters</h3>
                    <p>Once you have more than a few stops, the order in which you visit them becomes critically important. Finding the absolute shortest path that visits a list of cities and returns to the origin is a famous computer science challenge known as the "Traveling Salesperson Problem" (TSP). For even a modest number of cities, the number of possible routes becomes astronomically large, making it impossible to check them all.</p>
                    <p>Our calculator does **not** attempt to solve the TSP. It calculates the distance of the route in the exact order you provide the stops. This gives you the power to experiment. Try putting your stops in a different order and see how it affects the total distance. For example, is it shorter to go from New York to Chicago to Atlanta, or from New York to Atlanta to Chicago? A quick reordering in the planner can give you an immediate answer and help you form a more logical, efficient route.</p>

                    <h3 className="text-lg font-semibold text-foreground">From Geodesic Distance to Driving Directions</h3>
                    <p>After using this tool to establish a rough itinerary and order of stops, your next step should be to use a dedicated driving directions service like Google Maps, Waze, or Apple Maps. These services have access to comprehensive road network data and will provide several critical pieces of information:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Actual Road Distance:</strong> The real number of miles or kilometers you will drive. This is the number you should use in our Fuel Cost Calculator.</li>
                        <li><strong>Real-Time ETA:</strong> An estimated driving time that accounts for current traffic conditions, speed limits, and construction.</li>
                        <li><strong>Turn-by-Turn Directions:</strong> The specific roads you will take to get from one stop to the next.</li>
                    </ul>
                    <p>A good workflow is: 1) Use our Multi-Stop Planner to sketch out the trip and decide on a logical order of stops. 2) Use Google Maps to get the precise distance and a realistic ETA for each leg. 3) Use our Driving Time with Breaks Calculator to plan a safe and sustainable schedule for the longer driving days.</p>

                    <h3 className="text-lg font-semibold text-foreground">Estimating Average Speed Realistically</h3>
                    <p>The "Estimated Driving Time" in our calculator is a simple division of the total great-circle distance by the average speed you provide. The quality of this estimate depends entirely on the quality of your speed input. For a cross-country trip that involves a mix of major highways, rural roads, and city driving, a realistic average speed is often between 55-65 mph (90-105 km/h), even if the speed limit is higher. This lower average implicitly accounts for brief slowdowns and traffic, but it does **not** account for long stops for meals, gas, or rest. Use our Driving Time with Breaks Calculator for that level of detail.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Why is the calculated distance shorter than what Google Maps shows?</AccordionTrigger>
                            <AccordionContent>
                                <p>This calculator computes the great-circle ("as the crow flies") distance, which is a perfect straight line over the Earth's curve. Google Maps calculates the actual distance you would travel on roads, which must curve around obstacles, making it longer.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Does this calculator find the most optimal route for my stops?</AccordionTrigger>
                            <AccordionContent>
                                <p>No. It calculates the total distance based on the exact order in which you list the stops. To find a more optimal route, you can try rearranging the stops to see how it affects the total distance.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Where do I find the latitude and longitude for my stops?</AccordionTrigger>
                            <AccordionContent>
                                <p>The easiest method is to use a service like Google Maps. Search for your location, right-click on the map pin, and the coordinates will be displayed and can be copied.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How accurate is the estimated driving time?</AccordionTrigger>
                            <AccordionContent>
                                <p>The accuracy depends entirely on how realistic your "Average Speed" input is. The calculation itself is a simple `Time = Distance / Speed`. It's a high-level estimate and does not account for traffic, weather, or stops. For more detailed planning, a dedicated mapping service is recommended.</p>
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
                    <p className="text-muted-foreground">The Multi-Stop Route Planner is a high-level tool designed for the initial stages of road trip planning. By calculating the great-circle distance and estimated driving time for a sequence of stops, it helps you gauge the overall scale and feasibility of your journey. It empowers you to experiment with the order of your stops to find a logical sequence before moving to a dedicated mapping service for detailed, turn-by-turn directions and real-world road distances.
                    </p>
                </CardContent>
            </Card>
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Multi-Stop Route Planner",
                    "description": "Plan a road trip by calculating the total distance and estimated driving time between multiple stops.",
                    "applicationCategory": "TravelApplication",
                    "operatingSystem": "Any",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    }
                })
            }} />
        </div>
    );
}
