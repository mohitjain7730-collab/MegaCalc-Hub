'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateFuelCost, formatCurrency } from '@/lib/travel-utils';
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
    efficiencyUnit: z.enum(['mpg', 'lp100km']),
    fuelPrice: z.coerce.number().positive('Fuel price must be a positive number.'),
    priceUnit: z.enum(['per_gallon', 'per_liter']),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Backpack Weight Calculator', href: '/backpack-weight-calculator' },
    { name: 'Car vs. Flight Cost Comparison', href: '/car-vs-flight-calculator' },
    { name: 'Cost Per Mile Calculator', href: '/cost-per-mile-calculator' },
    { name: 'Driving Time with Breaks Calculator', href: '/driving-time-with-breaks-calculator' },
    { name: 'EV Charging Cost Calculator', href: '/ev-charging-cost-calculator' },
    { name: 'Hiking Calorie Calculator', href: '/hiking-calorie-calculator' },
    { name: 'Hiking Time Calculator', href: '/hiking-time-calculator' },
    { name: 'Multi-Stop Route Planner', href: '/multi-stop-route-planner' },
    { name: 'Rental Car Cost Calculator', href: '/rental-car-cost-calculator' },
    { name: 'Trip Budget Calculator', href: '/trip-budget-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function FuelCostCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateFuelCost> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            distance: undefined,
            distanceUnit: 'miles',
            efficiency: undefined,
            efficiencyUnit: 'mpg',
            fuelPrice: undefined,
            priceUnit: 'per_gallon',
        },
    });

    const onSubmit = (data: FormValues) => {
        const cost = calculateFuelCost(data.distance, data.distanceUnit, data.efficiency, data.efficiencyUnit, data.fuelPrice, data.priceUnit);
        setResult(cost);
    };

    const schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Fuel Cost Calculator",
        "description": "Estimate the total fuel cost for your road trip based on distance, vehicle efficiency, and fuel price.",
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
                    <CardTitle>Fuel Cost Calculator</CardTitle>
                    <CardDescription>
                        Estimate the total fuel cost for your road trip based on distance, vehicle efficiency, and fuel price.
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
                                                    <Input type="number" placeholder="e.g., 300" {...field} value={field.value ?? ''} />
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
                                                    <Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormField control={form.control} name="efficiencyUnit" render={({ field: unitField }) => (
                                                    <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                        <FormControl><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="mpg">MPG</SelectItem><SelectItem value="lp100km">L/100km</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fuelPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Fuel Price</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 3.50" {...field} value={field.value ?? ''} step="0.01" />
                                                </FormControl>
                                                <FormField control={form.control} name="priceUnit" render={({ field: unitField }) => (
                                                    <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                        <FormControl><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="per_gallon">per gallon</SelectItem><SelectItem value="per_liter">per liter</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Fuel Cost</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Trip Fuel Estimate</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="p-6 bg-primary/10 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Fuel Cost</p>
                            <p className="text-4xl font-bold text-primary">{formatCurrency(parseFloat(result.totalCost))}</p>
                        </div>
                        <div className="p-6 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">Total Fuel Needed</p>
                            <p className="text-4xl font-bold">{result.fuelNeeded}</p>
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
                        <p className="text-muted-foreground">The total length of your journey. You can use a mapping service to get an accurate distance for your route.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Vehicle Efficiency</h3>
                        <p className="text-muted-foreground">How much fuel your car consumes. This can be found in your vehicle's manual or on the manufacturer's website. It's often expressed in Miles Per Gallon (MPG) or Liters per 100 kilometers (L/100km).</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Fuel Price</h3>
                        <p className="text-muted-foreground">The current cost of fuel. Ensure this matches the unit you select (per gallon or per liter).</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator first determines the total amount of fuel needed for the trip, then multiplies that by the price per unit of fuel to find the total cost.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm md:text-base font-bold text-primary">FuelNeeded = Distance / Efficiency</p>
                        <p className="font-mono text-sm md:text-base font-bold">TotalCost = FuelNeeded * FuelPrice</p>
                    </div>
                    <p className="mt-2 text-muted-foreground">The calculator handles all necessary unit conversions (e.g., MPG to L/100km, miles to km, gallons to liters) to ensure the calculation is accurate.</p>
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
                    <CardTitle className="text-2xl font-bold">The Economics of a Road Trip</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">A Complete Guide to Calculating and Minimizing Your Road Trip Fuel Costs</h2>
                    <p>For any road trip, fuel is one of the most significant and variable expenses. Being able to accurately estimate your fuel costs beforehand is essential for creating a realistic travel budget. This guide will break down the components of fuel cost calculation, explain the different efficiency metrics, and provide practical tips for improving your vehicle's fuel economy to save money on your journey.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Three Pillars of Fuel Cost Calculation</h3>
                    <p>Estimating your total fuel cost boils down to three key pieces of information:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Distance:</strong> How far are you going? This is the most straightforward input. Use a service like Google Maps to get a precise mileage or kilometer count for your planned route.</li>
                        <li><strong>Efficiency:</strong> How good is your car at converting fuel into distance? This is the most complex variable and is affected by numerous factors.</li>
                        <li><strong>Price:</strong> What does fuel cost? This varies by location, time, and fuel grade.</li>
                    </ol>
                    <p>The core calculation is simple: determine how much fuel you'll need, and then multiply that by the cost of the fuel. `Total Cost = (Total Distance / Vehicle Efficiency) * Price of Fuel`.</p>

                    <h3 className="text-lg font-semibold text-foreground">Decoding Fuel Efficiency: MPG vs. L/100km</h3>
                    <p>The world is primarily divided into two systems for measuring fuel efficiency. Understanding them is key to using the calculator correctly.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Miles Per Gallon (MPG):</strong> Used predominantly in the United States and the United Kingdom. This metric tells you how many miles you can travel on one gallon of fuel. For MPG, a **higher** number is better (more efficient).</li>
                        <li><strong>Liters per 100 Kilometers (L/100km):</strong> Used in most other parts of the world, including Canada and Europe. This metric tells you how many liters of fuel are needed to travel 100 kilometers. For L/100km, a **lower** number is better (more efficient).</li>
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
                            <AccordionTrigger>Where can I find my car's fuel efficiency rating?</AccordionTrigger>
                            <AccordionContent>
                                <p>You can find it in your vehicle's owner's manual, on the manufacturer's website, or on government websites like FuelEconomy.gov in the United States. The most accurate number, however, is one you calculate yourself by tracking your mileage and fuel consumption over a few tankfuls.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How do I convert MPG to L/100km?</AccordionTrigger>
                            <AccordionContent>
                                <p>The formula is `L/100km = 235.215 / MPG`. Our calculator handles this conversion for you automatically when you select your preferred units.</p>
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
                    <p className="text-muted-foreground">The Fuel Cost Calculator is an essential budgeting tool for any road trip. By combining the trip distance, your vehicle's real-world fuel efficiency, and the price of fuel, it provides a reliable estimate of one of your journey's biggest expenses. Understanding the factors that affect fuel consumption empowers you to not only budget accurately but also adopt driving habits that can lead to significant savings.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
