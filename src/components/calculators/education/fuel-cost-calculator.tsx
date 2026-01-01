'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as x from 'zod';
import { calculateFuelCost } from '@/lib/calculators';
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
import { Route, Gauge, DollarSign } from 'lucide-react';


const formSchema = x.object({
    distance: x.coerce.number().positive('Distance must be a positive number.'),
    distanceUnit: x.enum(['kilometers', 'miles']),
    efficiency: x.coerce.number().positive('Efficiency must be a positive number.'),
    efficiencyUnit: x.enum(['mpg', 'lp100km']),
    fuelPrice: x.coerce.number().positive('Fuel price must be a positive number.'),
    priceUnit: x.enum(['per_gallon', 'per_liter']),
});

type FormValues = x.infer<typeof formSchema>;

const relatedCalculators: { name: string; href: string }[] = [
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Comparative Difference', href: '/category/education/maths/comparative-difference-calculator' },
    { name: 'Compounding Increase', href: '/category/education/maths/compounding-increase-calculator' },
    { name: 'Doubling Time', href: '/category/education/maths/doubling-time-calculator' },
    { name: 'Fraction to Percent', href: '/category/education/maths/fraction-to-percent-calculator' },
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

    return (
        <div className="space-y-8">
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
                            <p className="text-4xl font-bold text-primary">${result.totalCost}</p>
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
                    <CardTitle className="flex items-center gap-2">Understanding the Inputs</CardTitle>
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
                    <CardTitle className="flex items-center gap-2">Formula</CardTitle>
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
                    <CardTitle>Related Calculators</CardTitle>
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
                    <p>It's important not to mix these up. Our calculator allows you to input your vehicle's efficiency in either format and handles the conversion automatically. The formula for conversion is `L/100km = 235.215 / MPG`.</p>

                    <h3 className="text-lg font-semibold text-foreground">Official Ratings vs. Real-World Efficiency</h3>
                    <p>Your vehicle has an official fuel efficiency rating from the manufacturer (e.g., the EPA rating in the US). This is a great starting point, but your real-world efficiency will almost always be different. Factors that influence your actual MPG or L/100km include:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Driving Style:</strong> Aggressive driving—rapid acceleration and hard braking—is the biggest fuel waster. A smooth, steady driving style can improve efficiency by 15-30%.</li>
                        <li><strong>Speed:</strong> Most cars are most fuel-efficient at speeds between 50-60 mph (80-95 km/h). Efficiency decreases significantly at higher speeds due to increased aerodynamic drag.</li>
                        <li><strong>Terrain:</strong> Driving in hilly or mountainous areas requires more energy and thus more fuel than driving on flat ground.</li>
                        <li><strong>Vehicle Load:</strong> A car loaded with passengers and luggage is heavier and will use more fuel. A rooftop cargo box can also increase drag and reduce efficiency.</li>
                        <li><strong>Tire Pressure:</strong> Under-inflated tires increase rolling resistance and can lower fuel economy by several percent.</li>
                        <li><strong>Weather:</strong> Driving into a strong headwind increases drag. Cold weather can also decrease efficiency as the engine takes longer to reach its optimal operating temperature.</li>
                    </ul>
                    <p>For the most accurate calculation, use an efficiency number based on your own experience with the car, or use the official rating and assume your real-world usage will be slightly worse (higher L/100km or lower MPG).</p>

                    <h3 className="text-lg font-semibold text-foreground">Practical Tips for Saving on Fuel</h3>
                    <p>Armed with this knowledge, you can take active steps to reduce your fuel costs:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Track Fuel Prices:</strong> Use apps like GasBuddy or Waze to find the cheapest gas stations along your route. Prices can vary significantly, even within the same city.</li>
                        <li><strong>Maintain Your Vehicle:</strong> A well-maintained car is an efficient car. Ensure you have regular oil changes, clean air filters, and properly inflated tires.</li>
                        <li><strong>Lighten the Load:</strong> Don't pack unnecessary heavy items. Remove roof racks or cargo boxes when not in use.</li>
                        <li><strong>Use Cruise Control:</strong> On long, flat stretches of highway, cruise control helps maintain a constant speed and is generally more efficient than manual throttle control.</li>
                        <li><strong>Plan Your Route:</strong> A slightly longer route that avoids major city centers and traffic congestion can sometimes save you fuel and time.</li>
                        <li><strong>Combine Trips:</strong> If you're staying in a location for a few days, plan your errands and sightseeing to minimize unnecessary driving.</li>
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
                            <AccordionTrigger>What's the difference between city and highway efficiency ratings?</AccordionTrigger>
                            <AccordionContent>
                                <p>Manufacturers provide separate ratings for "city" and "highway" driving because vehicles are more efficient during steady highway driving and less efficient in the stop-and-go traffic of a city. For a long road trip, your "highway" MPG or L/100km will be a more accurate estimate.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Does using air conditioning affect fuel economy?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes, using the A/C can reduce fuel economy, especially during hot weather and in stop-and-go traffic. At highway speeds, however, the effect is less pronounced, and it can be more efficient than opening the windows, which increases aerodynamic drag.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How do I convert MPG to L/100km?</AccordionTrigger>
                            <AccordionContent>
                                <p>The formula is `L/100km = 235.215 / MPG`. Our calculator handles this conversion for you automatically when you select your preferred units.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>How accurate is this calculation?</AccordionTrigger>
                            <AccordionContent>
                                <p>The mathematical calculation is very accurate. The accuracy of the result, however, depends entirely on the accuracy of your inputs. The better you can estimate your real-world vehicle efficiency and the average fuel price on your route, the more reliable the total cost estimate will be.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>Does this calculator include other vehicle costs like wear and tear?</AccordionTrigger>
                            <AccordionContent>
                                <p>No, this calculator focuses exclusively on the cost of fuel. It does not account for other road trip costs such as tolls, maintenance, or the gradual depreciation and wear on your vehicle.</p>
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
