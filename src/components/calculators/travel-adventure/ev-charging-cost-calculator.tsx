'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateEvChargingCost, formatCurrency } from '@/lib/travel-utils';
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
import { Route, Gauge, Info, Shield, Compass, DollarSign } from 'lucide-react';

const formSchema = z.object({
    distance: z.coerce.number().positive('Distance must be a positive number.'),
    distanceUnit: z.enum(['kilometers', 'miles']),
    efficiency: z.coerce.number().positive('Efficiency must be a positive number.'),
    efficiencyUnit: z.enum(['kWh_per_100km', 'miles_per_kWh']),
    chargingCost: z.coerce.number().positive('Charging cost must be a positive number.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Backpack Weight Calculator', href: '/category/travel-adventure/backpack-weight-calculator' },
    { name: 'Car vs. Flight Cost Comparison', href: '/category/travel-adventure/car-vs-flight-calculator' },
    { name: 'Cost Per Mile Calculator', href: '/category/travel-adventure/cost-per-mile-calculator' },
    { name: 'Fuel Cost Calculator', href: '/category/travel-adventure/fuel-cost-calculator' },
    { name: 'Hiking Calorie Calculator', href: '/category/travel-adventure/hiking-calorie-calculator' },
    { name: 'Hiking Time Calculator', href: '/category/travel-adventure/hiking-time-calculator' },
    { name: 'Trip Budget Calculator', href: '/category/travel-adventure/trip-budget-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function EVChargingCostCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateEvChargingCost> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            distance: undefined,
            distanceUnit: 'miles',
            efficiency: undefined,
            efficiencyUnit: 'miles_per_kWh',
            chargingCost: undefined,
        },
    });

    const onSubmit = (data: FormValues) => {
        const cost = calculateEvChargingCost(data.distance, data.distanceUnit, data.efficiency, data.efficiencyUnit, data.chargingCost);
        setResult(cost);
    };

    const schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "EV Charging Cost Calculator",
        "description": "Estimate the total cost to charge your electric vehicle for a road trip.",
        "applicationCategory": "TravelApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };

    return (
        <div className="space-y-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />
            <Card>
                <CardHeader>
                    <CardTitle>EV Charging Cost Calculator</CardTitle>
                    <CardDescription>
                        Estimate the total cost to charge your electric vehicle for a road trip.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="distance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Route className="w-4 h-4" />Trip Distance</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 250" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormField control={form.control} name="distanceUnit" render={({ field: unitField }) => (
                                                    <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                        <FormControl><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="miles">miles</SelectItem><SelectItem value="kilometers">km</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="efficiency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Gauge className="w-4 h-4" />Vehicle Efficiency</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 3.5" {...field} value={field.value ?? ''} step="0.1" />
                                                </FormControl>
                                                <FormField control={form.control} name="efficiencyUnit" render={({ field: unitField }) => (
                                                    <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                        <FormControl><SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="miles_per_kWh">mi/kWh</SelectItem><SelectItem value="kWh_per_100km">kWh/100km</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="chargingCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Cost per kWh</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 0.35" {...field} value={field.value ?? ''} step="0.01" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Charging Cost</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>EV Trip Charging Estimate</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Charging Cost</p>
                            <p className="text-4xl font-bold text-primary">{formatCurrency(parseFloat(result.totalCost))}</p>
                        </div>
                        <div className="p-6 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Energy Needed</p>
                            <p className="text-4xl font-bold">{result.energyNeeded}</p>
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
                        <h3 className="font-semibold text-lg">Trip Distance</h3>
                        <p className="text-muted-foreground">The total length of your journey. Use a mapping service like Google Maps or A Better Routeplanner for an accurate distance.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Vehicle Efficiency</h3>
                        <p className="text-muted-foreground">Your EV's energy consumption. This can be expressed in miles per kilowatt-hour (mi/kWh) or kilowatt-hours per 100 kilometers (kWh/100km).</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Cost per kWh</h3>
                        <p className="text-muted-foreground">The price you pay for electricity, in dollars per kilowatt-hour. This varies greatly between home charging and public DC fast chargers.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator first determines the total energy (in kWh) needed for the trip, then multiplies that by the cost per kWh to find the total charging cost.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">EnergyNeeded (kWh) = (Distance / 100) * Efficiency (kWh/100km)</p>
                        <p className="font-mono text-sm md:text-base font-bold">TotalCost = EnergyNeeded * CostPerKwh</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">The calculator handles all necessary unit conversions (e.g., mi/kWh to kWh/100km, miles to km) to ensure the calculation is accurate.</p>
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
                    <CardTitle className="text-2xl font-bold">The Economics of an EV Road Trip</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">A Guide to Calculating and Optimizing Your EV Charging Costs on the Go</h2>
                    <p>Road-tripping in an electric vehicle (EV) is a different experience from driving a gasoline-powered car, especially when it comes to "fueling" up. Instead of gallons and gas prices, EV drivers think in kilowatt-hours (kWh) and charging rates. Accurately estimating your charging costs is crucial for budgeting a long-distance EV journey. This guide will explain the key metrics for EV efficiency, the different types of charging and their costs, and how you can plan your trip to minimize both cost and charging time.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Three Pillars of EV Charging Cost Calculation</h3>
                    <p>Similar to a gasoline car, estimating your total charging cost comes down to three key factors:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Distance:</strong> How far you're traveling.</li>
                        <li><strong>Efficiency:</strong> How effectively your EV uses energy to cover distance.</li>
                        <li><strong>Energy Price:</strong> The cost of electricity per kilowatt-hour (kWh).</li>
                    </ol>
                    <p>The calculation is a two-step process: first, determine the total energy (in kWh) your trip will consume. Second, multiply that energy amount by the average price you'll pay per kWh. `Total Cost = (Total Energy Needed in kWh) * (Average Cost per kWh)`.</p>

                    <h3 className="text-lg font-semibold text-foreground">Decoding EV Efficiency: mi/kWh vs. kWh/100km</h3>
                    <p>EV efficiency is measured differently depending on the region, and it's the inverse of how gasoline car efficiency is often viewed.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Miles per kWh (mi/kWh):</strong> Common in the United States. This tells you how many miles your EV can travel on one kilowatt-hour of energy. For mi/kWh, a **higher** number is better (more efficient). An efficient EV might get 4 mi/kWh, while a larger, less efficient one might get 2.5 mi/kWh.</li>
                        <li><strong>kWh per 100 Kilometers (kWh/100km):</strong> The standard in Europe and other regions. This tells you how many kilowatt-hours are needed to travel 100 kilometers. For kWh/100km, a **lower** number is better (more efficient). An efficient EV might be rated at 14 kWh/100km.</li>
                    </ul>
                    <p>Our calculator can work with either unit, converting between them as needed to provide an accurate result.</p>

                    <h3 className="text-lg font-semibold text-foreground">Real-World EV Efficiency: More Than Just the EPA Rating</h3>
                    <p>Just like with gas cars, the official EPA or WLTP range and efficiency ratings are based on ideal conditions. Your real-world efficiency will vary based on several factors:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Speed:</strong> This is the biggest factor for EVs. High speeds drastically increase energy consumption due to aerodynamic drag. Driving at 65 mph instead of 75 mph can improve your range by 15-20%.</li>
                        <li><strong>Temperature:</strong> Cold weather is a major drain on EV batteries. The battery itself is less efficient in the cold, and running the cabin heater (which is very energy-intensive) can reduce range by up to 30-40% in freezing conditions.</li>
                        <li><strong>Terrain:</strong> Driving uphill consumes a lot of energy. While regenerative braking can recapture some of this energy on the way down, it's not a 100% return.</li>
                        <li><strong>Tire Pressure and Type:</strong> Under-inflated tires increase rolling resistance. All-season or winter tires typically have lower efficiency than summer or eco-focused tires.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">The Cost of a Charge: Home vs. Public Charging</h3>
                    <p>The "Cost per kWh" is not a single number; it varies dramatically depending on where you charge.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Level 1 & 2 Home Charging:</strong> This is by far the cheapest way to charge. The cost is your residential electricity rate, which can be anywhere from $0.10 to $0.25 per kWh in the US. This is ideal for overnight charging.</li>
                        <li><strong>DC Fast Charging (Level 3):</strong> This is what you'll use on a road trip. These chargers are much faster but also much more expensive. Prices can range from $0.30 to over $0.70 per kWh. The cost structure can also vary: some networks charge per kWh, while others charge per minute.</li>
                        <li><strong>Free Charging:</strong> Some hotels, workplaces, and public venues offer free Level 2 charging as an amenity. It's slow, but it can significantly reduce your overall trip cost if you can charge overnight at your hotel.</li>
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
                            <AccordionTrigger>Why is my EV's range so much lower in the winter?</AccordionTrigger>
                            <AccordionContent>
                                <p>Cold temperatures reduce the efficiency of the battery's chemical reactions. More importantly, running the cabin heater uses a significant amount of energy directly from the main battery, which would otherwise be used for driving. Using heated seats and a heated steering wheel is often more efficient than heating the entire cabin.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What's the difference between a Level 2 and a DC Fast Charger?</AccordionTrigger>
                            <AccordionContent>
                                <p>A Level 2 charger uses AC power (like a home appliance) and can typically add 20-30 miles of range per hour. A DC Fast Charger converts AC to DC power before it gets to the car, allowing it to charge much faster, often adding hundreds of miles of range in under 30 minutes.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Should I charge my battery to 100% on a road trip?</AccordionTrigger>
                            <AccordionContent>
                                <p>Generally, no. For most EVs, charging speed slows down significantly after the battery reaches 80%. It is often faster to make two shorter stops, charging from 10% to 60-70%, than to make one long stop to charge to 100%. This also helps preserve long-term battery health.</p>
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
                    <p className="text-muted-foreground">The EV Charging Cost Calculator helps demystify one of the key aspects of electric vehicle ownership. By understanding your vehicle's efficiency (in mi/kWh or kWh/100km) and the varying costs of electricity, you can accurately budget for road trips and daily driving. This tool empowers you to compare the cost-effectiveness of EV travel and make informed decisions about your charging habits.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
