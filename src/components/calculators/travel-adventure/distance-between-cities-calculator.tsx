
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateDistance } from '@/lib/travel-utils';
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
import { Globe, Clock, Plane, Map as MapIcon, Info, Shield, Compass, LocateFixed } from 'lucide-react';

const formSchema = z.object({
    lat1: z.coerce.number().min(-90, 'Must be >= -90').max(90, 'Must be <= 90'),
    lon1: z.coerce.number().min(-180, 'Must be >= -180').max(180, 'Must be <= 180'),
    lat2: z.coerce.number().min(-90, 'Must be >= -90').max(90, 'Must be <= 90'),
    lon2: z.coerce.number().min(-180, 'Must be >= -180').max(180, 'Must be <= 180'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Travel Time Calculator', href: '/category/travel-adventure/travel-time-calculator' },
    { name: 'Flight Duration Calculator', href: '/category/travel-adventure/flight-duration-calculator' },
    { name: 'Time Zone Difference Calculator', href: '/category/travel-adventure/time-zone-difference-calculator' },
    { name: 'Travel Days Calculator', href: '/category/travel-adventure/travel-days-calculator' },
];

export default function DistanceBetweenCitiesCalculator() {
    const [result, setResult] = useState<{
        kilometers: number;
        miles: number;
    } | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            lat1: undefined,
            lon1: undefined,
            lat2: undefined,
            lon2: undefined,
        },
    });

    const onSubmit = (data: FormValues) => {
        const { lat1, lon1, lat2, lon2 } = data;
        const distanceResult = calculateDistance(lat1, lon1, lat2, lon2);
        setResult(distanceResult);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Distance Between Cities Calculator</CardTitle>
                    <CardDescription>
                        Calculate the great-circle distance between two points on Earth using their latitude and longitude.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 p-4 border rounded-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2"><LocateFixed className="w-5 h-5 text-primary" />City 1 (Origin)</h3>
                                    <FormField
                                        control={form.control}
                                        name="lat1"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Latitude 1</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 34.0522" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lon1"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Longitude 1</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., -118.2437" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2 p-4 border rounded-lg">
                                    <h3 className="text-lg font-semibold flex items-center gap-2"><MapIcon className="w-5 h-5 text-primary" />City 2 (Destination)</h3>
                                    <FormField
                                        control={form.control}
                                        name="lat2"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Latitude 2</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 40.7128" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="lon2"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Longitude 2</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., -74.0060" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="submit">Calculate Distance</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Calculation Result</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="p-6 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Kilometers</p>
                            <p className="text-4xl font-bold text-primary">{result.kilometers.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">km</p>
                        </div>
                        <div className="p-6 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Miles</p>
                            <p className="text-4xl font-bold text-primary">{result.miles.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">mi</p>
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
                        <h3 className="font-semibold text-lg">Latitude (City 1 and City 2)</h3>
                        <p className="text-muted-foreground">This is the geographic coordinate that specifies the north-south position of a point on the Earth's surface. It is an angle which ranges from -90° at the South Pole to 90° at the North Pole, with 0° at the Equator. Positive values are for the Northern Hemisphere, and negative values are for the Southern Hemisphere.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Longitude (City 1 and City 2)</h3>
                        <p className="text-muted-foreground">This is the geographic coordinate that specifies the east-west position of a point on the Earth's surface. It is an angle which ranges from -180° to 180°. The Prime Meridian, which passes through Greenwich, London, is the 0° longitude line.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator uses the Haversine formula to determine the great-circle distance between two points on a sphere given their longitudes and latitudes. The great-circle distance is the shortest distance over the earth's surface.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">
                            d = 2R ⋅ asin(√[sin²((φ₂-φ₁)/2) + cos(φ₁)⋅cos(φ₂)⋅sin²((λ₂-λ₁)/2)])
                        </p>
                    </div>
                    <p className="mt-4 text-muted-foreground">Where: φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371km); Δ represents the difference.</p>
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
                    <CardTitle className="text-2xl font-bold">The Science of Shortest Paths</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">Mastering Global Travel: The Definitive Guide to Calculating Distance Between Cities</h2>

                    <p>In our interconnected world, the ability to accurately calculate the distance between two cities is more than a mathematical exercise; it's a fundamental component of planning, logistics, and exploration. Whether you're a globetrotting adventurer, a logistics manager optimizing shipping routes, a pilot charting a flight path, or simply a curious mind, understanding how to measure the shortest path between two points on our spherical planet is an invaluable skill. This comprehensive guide delves into the science behind distance calculation, the practical applications, and the tools that make it accessible to everyone.</p>

                    <h3 className="text-lg font-semibold text-foreground">Why a Straight Line on a Map is a Lie</h3>
                    <p>Our first intuition, shaped by flat paper maps, is to draw a straight line between two points to find the shortest distance. This is known as the Euclidean distance. However, the Earth is not flat; it's an oblate spheroid—a slightly flattened sphere. A straight line on a two-dimensional map (a rhumb line or loxodrome) does not represent the shortest path on a curved surface. Flying from Los Angeles to Paris along a straight line on a Mercator projection map would be a significantly longer journey than following the actual shortest path.</p>
                    <p>The true shortest distance between two points on a sphere is the arc of a great circle. A great circle is any circle drawn on a globe with a center that includes the center of the globe. The equator is a great circle, as are all the lines of longitude (meridians). When you slice a sphere through its center, the edge of that slice is a great circle. The great-circle path is the one that airline pilots follow to save fuel and time, often taking them on routes that appear curved and counterintuitive on a flat map, such as flying over the Arctic region.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Haversine Formula: The Gold Standard for Distance Calculation</h3>
                    <p>Calculating this great-circle distance requires more than a simple ruler. The most widely accepted method for this task is the Haversine formula. While its name might sound intimidating, its purpose is straightforward: to compute the angular distance between two points on a sphere from their latitude and longitude coordinates. Once this angular distance is found, it's a simple step to convert it into a physical distance like kilometers or miles.</p>
                    <p>The formula works by treating the two points and the Earth's center as a spherical triangle. It uses trigonometric functions (sine, cosine, arctangent) to solve for the length of the side connecting the two points. The 'haversine' function itself (hav(θ) = sin²(θ/2)) was historically used to simplify calculations in the era before electronic calculators, but the principles remain the same in modern digital tools.</p>
                    <p>Our Distance Between Cities Calculator automates this entire process. You provide the latitude and longitude, and it handles the complex trigonometry in an instant. It uses the Earth's mean radius of approximately 6,371 kilometers (or 3,959 miles) as the basis for its final calculation, providing a highly accurate estimate of the great-circle distance.</p>

                    <h3 className="text-lg font-semibold text-foreground">Practical Applications: Beyond Just Knowing 'How Far'</h3>
                    <p>The ability to calculate the distance between cities has far-reaching implications across numerous fields:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Aviation and Shipping:</strong> This is the most obvious application. Airlines and maritime companies save billions of dollars in fuel costs by optimizing routes based on great-circle paths. Accurate distance calculations are critical for flight planning, fuel estimation, and ensuring compliance with international regulations.</li>
                        <li><strong>Logistics and Supply Chain Management:</strong> For companies moving goods across the globe, knowing the distance is the first step in estimating shipping costs, delivery times, and carbon footprint. It allows for better warehouse placement and distribution network design.</li>
                        <li><strong>Travel and Tourism:</strong> As a traveler, knowing the distance can help you plan your itinerary, estimate travel time (when combined with a speed calculator), and even helps in understanding the scale of your journey. It can inform decisions about whether to fly, drive, or take a train.</li>
                        <li><strong>Telecommunications and Satellite Operations:</strong> The distance between ground stations and satellites, or between two points for a microwave link, is crucial for signal strength calculations and latency estimations.</li>
                        <li><strong>Scientific Research:</strong> Geographers, climatologists, and seismologists use distance calculations for a variety of tasks, from tracking animal migration patterns to modeling the spread of seismic waves or ocean currents.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">Finding Coordinates: The First Step to Calculation</h3>
                    <p>The primary inputs for our calculator are the latitude and longitude coordinates of your origin and destination. But where do you find them? Fortunately, the digital age makes this incredibly easy:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Online Maps:</strong> Services like Google Maps or OpenStreetMap are the easiest way. Simply search for a city or address, right-click on the location, and the coordinates will often appear in a pop-up or context menu.</li>
                        <li><strong>Dedicated Tools:</strong> Numerous websites are specifically designed to provide the coordinates for any given location.</li>
                        <li><strong>GPS Devices:</strong> Any GPS-enabled device, including your smartphone, can give you the precise coordinates of your current location.</li>
                    </ul>
                    <p>Remember the format: Latitude ranges from -90° to +90°, and Longitude ranges from -180° to +180°. A common mistake is swapping them or using the wrong sign (e.g., a negative latitude for a city in the Northern Hemisphere).</p>

                    <h3 className="text-lg font-semibold text-foreground">Limitations and Considerations: Vincenty's Formula and Real-World Factors</h3>
                    <p>While the Haversine formula is exceptionally accurate for most purposes, it's important to acknowledge its primary assumption: a perfectly spherical Earth. In reality, our planet is an oblate spheroid, slightly wider at the equator than it is from pole to pole. For applications requiring extreme precision (like military targeting or geodetic surveys), geodesists use more complex models like the Vincenty's formulae, which account for the Earth's ellipsoidal shape. For 99.9% of common use cases, including flight planning, the difference between the Haversine and Vincenty calculations is negligible.</p>
                    <p>Furthermore, the calculated great-circle distance is a geometric ideal. Real-world travel distance can be affected by numerous factors:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Air Traffic Control and No-Fly Zones:</strong> Pilots can't just fly anywhere. They must follow established air corridors and avoid restricted airspace.</li>
                        <li><strong>Jet Streams:</strong> Airlines often deviate from the perfect great-circle path to take advantage of powerful tailwinds (jet streams) or avoid headwinds, saving significant fuel and time.</li>
                        <li><strong>Topography and Infrastructure:</strong> For ground travel, the distance is dictated by the road or rail network, which must navigate around mountains, rivers, and other obstacles. The calculated distance is "as the crow flies," not as the car drives.</li>
                    </ul>
                    <p>This calculator provides the foundational geodesic distance, the essential starting point upon which real-world planning is built.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Why is the distance called a "great-circle" distance?</AccordionTrigger>
                            <AccordionContent>
                                <p>A great circle is the largest possible circle that can be drawn on a sphere, and its center is always the center of the sphere. The shortest path between any two points on a sphere lies along the arc of a great circle. This is why flight paths on a 2D map look curved—they are following the straightest possible path on the 3D globe.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How accurate is the Haversine formula?</AccordionTrigger>
                            <AccordionContent>
                                <p>The Haversine formula assumes a perfectly spherical Earth. While our planet is technically an oblate spheroid (slightly flattened at the poles), the formula is extremely accurate for most practical purposes, including travel planning and logistics. The margin of error is typically less than 0.5%. For high-precision scientific or geodetic work, more complex formulas like Vincenty's are used.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Where can I find the latitude and longitude for a city?</AccordionTrigger>
                            <AccordionContent>
                                <p>The easiest way is to use online map services like Google Maps. Search for the city, right-click on the desired location, and the latitude and longitude coordinates will be displayed. There are also many dedicated online tools that provide coordinates for addresses and points of interest.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Does this calculator work for driving distance?</AccordionTrigger>
                            <AccordionContent>
                                <p>No. This calculator provides the "as the crow flies" or great-circle distance, which is the shortest geographical path. Driving distance is always longer because roads must go around obstacles like mountains, buildings, and bodies of water. For driving distances, you should use a dedicated mapping service that uses road network data.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>What do positive and negative latitude/longitude values mean?</AccordionTrigger>
                            <AccordionContent>
                                <p>For Latitude: Positive values are in the Northern Hemisphere (north of the Equator), and negative values are in the Southern Hemisphere (south of the Equator). For Longitude: Positive values are east of the Prime Meridian (which runs through Greenwich, UK), and negative values are west of the Prime Meridian.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>Why is the Earth's radius important?</AccordionTrigger>
                            <AccordionContent>
                                <p>The Haversine formula first calculates the central angle between the two points. To convert this angle into a physical distance (like kilometers or miles), we must multiply it by the Earth's radius. The calculator uses a standard mean radius of 6,371 km (or 3,959 miles) for this conversion.</p>
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
                    <p className="text-muted-foreground">The Distance Between Cities Calculator is an essential tool for accurately measuring the shortest geographical path between two points on Earth. By leveraging the power of the Haversine formula, it moves beyond the simple, and often incorrect, straight lines of flat maps. It provides a foundational piece of data crucial for planning in travel, logistics, science, and more. Understanding this great-circle distance is the first step in any global journey, enabling more efficient and informed decisions.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
