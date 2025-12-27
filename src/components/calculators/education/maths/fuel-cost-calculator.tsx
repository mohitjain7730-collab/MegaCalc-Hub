'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateFuelCost } from '@/lib/percentage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Route, Gauge, DollarSign, Shield, Compass, Info } from 'lucide-react';

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
    { name: 'Average Percentage', href: '/category/education/maths/average-percentage-calculator' },
    { name: 'Comparartive Difference', href: '/category/education/maths/comparative-difference-calculator' },
    { name: 'Fraction to Percent', href: '/category/education/maths/fraction-to-percent-calculator' },
    { name: 'Investment Growth', href: '/category/education/maths/investment-growth-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function FuelCostCalculator() {
    const [result, setResult] = useState<{ fuelNeeded: string; totalCost: string } | null>(null);

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
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Trip Distance</h3>
                        <p className="text-muted-foreground">The total length of your journey.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Vehicle Efficiency</h3>
                        <p className="text-muted-foreground">How much fuel your car consumes (MPG or L/100km).</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>FuelNeeded = Distance / Efficiency. TotalCost = FuelNeeded * FuelPrice.</p>
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
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How accurate is this calculation?</AccordionTrigger>
                            <AccordionContent>
                                <p>The calculation is perfectly accurate based on the inputs. Real-world fuel efficiency can vary based on driving style and conditions.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
