'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateCarVsFlight } from '@/lib/travel-utils';
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
import { Car, Plane, DollarSign, Calculator, Info, CheckCircle, ArrowRight } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const formSchema = z.object({
    distance: z.coerce.number().positive('Distance must be positive.'),
    distanceUnit: z.enum(['miles', 'kilometers']),
    numTravelers: z.coerce.number().min(1, 'At least 1 traveler required.'),

    // Car details
    fuelEfficiency: z.coerce.number().positive('Fuel efficiency must be positive.'),
    efficiencyUnit: z.enum(['mpg', 'lp100km']),
    fuelPrice: z.coerce.number().positive('Fuel price must be positive.'),
    priceUnit: z.enum(['per_gallon', 'per_liter']),
    otherCarCosts: z.coerce.number().nonnegative(),

    // Flight details
    flightCostPerPerson: z.coerce.number().nonnegative(),
    baggageFeesPerPerson: z.coerce.number().nonnegative(),
    transportToFromAirport: z.coerce.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Bus vs Train Calculator', href: '/category/travel-adventure/bus-vs-train-cost-calculator' },
    { name: 'Cost Per Mile Calculator', href: '/category/travel-adventure/cost-per-mile-calculator' },
    { name: 'Rental Car Cost Calculator', href: '/category/travel-adventure/rental-car-cost-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function CarVsFlightCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateCarVsFlight> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            distance: undefined,
            distanceUnit: 'miles',
            numTravelers: 1,
            fuelEfficiency: undefined,
            efficiencyUnit: 'mpg',
            fuelPrice: undefined,
            priceUnit: 'per_gallon',
            otherCarCosts: 0,
            flightCostPerPerson: undefined,
            baggageFeesPerPerson: 0,
            transportToFromAirport: 0,
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateCarVsFlight(data);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Car vs. Flight Cost Calculator</CardTitle>
                    <CardDescription>
                        Determine whether driving or flying is the cheaper option for your next trip by comparing total costs including fuel, tickets, and extras.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="distance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>One-Way Distance</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 500" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormField control={form.control} name="distanceUnit" render={({ field: unitField }) => (
                                                    <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                        <FormControl><SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="miles">miles</SelectItem><SelectItem value="kilograms">km</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="numTravelers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Travelers</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="1" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Car Inputs */}
                                <div className="space-y-4 p-4 border rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20">
                                    <h3 className="font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <Car className="h-5 w-5" /> Driving Costs (Total Group)
                                    </h3>

                                    <FormField
                                        control={form.control}
                                        name="fuelEfficiency"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Car MPG / Efficiency</FormLabel>
                                                <div className="flex gap-2">
                                                    <FormControl>
                                                        <Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                    <FormField control={form.control} name="efficiencyUnit" render={({ field: unitField }) => (
                                                        <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                            <FormControl><SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger></FormControl>
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
                                                <FormLabel>Gas Price</FormLabel>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                        <FormControl>
                                                            <Input className="pl-8" type="number" placeholder="0.00" {...field} value={field.value ?? ''} />
                                                        </FormControl>
                                                    </div>
                                                    <FormField control={form.control} name="priceUnit" render={({ field: unitField }) => (
                                                        <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                            <FormControl><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent><SelectItem value="per_gallon">/ gallon</SelectItem><SelectItem value="per_liter">/ liter</SelectItem></SelectContent>
                                                        </Select>
                                                    )} />
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="otherCarCosts"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tolls, Parking & Maintenance</FormLabel>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input className="pl-8" type="number" placeholder="0.00" {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Flight Inputs */}
                                <div className="space-y-4 p-4 border rounded-lg bg-sky-50/50 dark:bg-sky-950/20">
                                    <h3 className="font-semibold flex items-center gap-2 text-sky-600 dark:text-sky-400">
                                        <Plane className="h-5 w-5" /> Flying Costs (Per Person)
                                    </h3>
                                    <FormField
                                        control={form.control}
                                        name="flightCostPerPerson"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Airfare (Round Trip)</FormLabel>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input className="pl-8" type="number" placeholder="0.00" {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="baggageFeesPerPerson"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Baggage Fees</FormLabel>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input className="pl-8" type="number" placeholder="0.00" {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="transportToFromAirport"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Airport Transport (Total for Group)</FormLabel>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input className="pl-8" type="number" placeholder="0.00" {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Uber/Lyft/Taxi costs to/from airport</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full">Compare Driving vs. Flying</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card className="overflow-hidden border-2 shadow-lg" style={{ borderColor: result.textColor }}>
                    <div className="p-6 text-center" style={{ backgroundColor: result.bgColor }}>
                        <CheckCircle className="mx-auto h-12 w-12 mb-2" style={{ color: result.textColor }} />
                        <h2 className="text-2xl font-bold mb-1" style={{ color: result.textColor }}>{result.verdict}</h2>
                        {result.savings > 0 && <p className="text-lg font-medium opacity-90">Save ${result.savings.toFixed(2)} by {result.cheaperOption}!</p>}
                    </div>

                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-semibold flex items-center gap-2"><Car className="h-5 w-5 text-muted-foreground" /> Driving Total</h3>
                                    <span className="text-xl font-bold">${result.car.total.toFixed(2)}</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Fuel Cost:</span> <span>${result.car.fuelCost.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Tolls/Parking/Maint:</span> <span>${result.car.otherCosts.toFixed(2)}</span></div>
                                    <div className="flex justify-between pt-2 text-muted-foreground font-medium"><span>Per Person:</span> <span>${result.car.perPerson.toFixed(2)}</span></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-semibold flex items-center gap-2"><Plane className="h-5 w-5 text-muted-foreground" /> Flying Total</h3>
                                    <span className="text-xl font-bold">${result.flight.total.toFixed(2)}</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Airfare:</span> <span>${result.flight.airfare.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Baggage Fees:</span> <span>${result.flight.baggage.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Airport Transport:</span> <span>${result.flight.airportTransport.toFixed(2)}</span></div>
                                    <div className="flex justify-between pt-2 text-muted-foreground font-medium"><span>Per Person:</span> <span>${result.flight.perPerson.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Detailed Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        Deciding between driving and flying often isn't just about the ticket price. This calculator factors in the "hidden" costs of both modes of travel.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Driving Considerations</h4>
                            <p className="text-sm">Driving becomes significantly cheaper as you add more passengers, since fuel costs remain relatively constant. However, for solo travelers or long distances (where an overnight hotel stay might be needed), costs can add up quickly.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Flying Considerations</h4>
                            <p className="text-sm">Flying is often faster but costs scale linearly with every extra person. Don't forget to account for the cost of getting to and from the airport, which can sometimes be more than the flight itself for short hauls!</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Related Calculators</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedCalculators.map((calc) => (
                        <Link href={calc.href} key={calc.name} className="block hover:no-underline">
                            <Card className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors h-full text-center">
                                <span className="font-semibold">{calc.name}</span>
                                <ArrowRight className="h-4 w-4 mt-2 opacity-50" />
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
                    <p className="text-muted-foreground">
                        The Car vs. Flight Calculator helps you make the most cost-effective travel choice by providing a comprehensive comparison of driving versus flying expenses. By accounting for all relevant variables—including fuel efficiency, passenger count, and auxiliary fees—it gives you a clear financial picture for your trip planning.
                    </p>
                </CardContent>
            </Card>
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Car vs. Flight Cost Calculator",
                    "description": "Determine whether driving or flying is the cheaper option for your next trip by comparing total costs including fuel, tickets, and extras.",
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
