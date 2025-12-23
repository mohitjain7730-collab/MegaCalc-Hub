'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateCostPerMile } from '@/lib/travel-utils';
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
import { DollarSign, Map, Calculator, Info, TrendingDown, ArrowRight, Route } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

const formSchema = z.object({
    totalCost: z.coerce.number().min(0, 'Cost must be non-negative.'),
    totalDistance: z.coerce.number().positive('Distance must be greater than zero.'),
    distanceUnit: z.enum(['miles', 'kilometers']),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Fuel Cost Calculator', href: '/category/travel-adventure/fuel-cost-calculator' },
    { name: 'Car vs Flight Calculator', href: '/category/travel-adventure/car-vs-flight-calculator' },
    { name: 'Trip Budget Calculator', href: '/category/travel-adventure/trip-budget-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function CostPerMileCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateCostPerMile> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            totalCost: undefined,
            totalDistance: undefined,
            distanceUnit: 'miles',
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateCostPerMile(data);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Cost Per Mile Calculator</CardTitle>
                    <CardDescription>
                        Calculate the exact cost per mile (or kilometer) for your trip to better understand your travel efficiency and budget.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="totalCost"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Trip Cost</FormLabel>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <FormControl>
                                                    <Input className="pl-8" type="number" placeholder="e.g., 500.00" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="totalDistance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Distance</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 1200" {...field} value={field.value ?? ''} />
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
                            </div>

                            <Button type="submit" size="lg" className="w-full">Calculate Cost Per Unit</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Your Efficiency</p>
                            <div className="flex items-end justify-center gap-2">
                                <span className="text-5xl font-bold tracking-tighter text-primary">
                                    ${result.costPerUnit.toFixed(2)}
                                </span>
                                <span className="text-xl font-medium text-muted-foreground mb-1">
                                    / {result.unit === 'miles' ? 'mile' : 'km'}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> How to Use This Metric</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                        Knowing your "Customer Cost Per Mile" (CPM) is a fantastic way to benchmark different trips.
                    </p>
                    <div className="grid grid-cols-1 gap-4 mt-2">
                        <div className="flex gap-3">
                            <div className="mt-1 bg-muted p-2 rounded-full"><Route className="h-4 w-4" /></div>
                            <div>
                                <h4 className="font-semibold text-foreground">Compare Modes of Transport</h4>
                                <p className="text-sm">Is that cheap flight really cheaper than driving once you factor in the short distance? CPM levels the playing field.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="mt-1 bg-muted p-2 rounded-full"><TrendingDown className="h-4 w-4" /></div>
                            <div>
                                <h4 className="font-semibold text-foreground">Budgeting for Road Trips</h4>
                                <p className="text-sm">If you know your vehicle typically costs $0.15/mile in gas and wear, you can instantly estimate the budget for a 2,000-mile loop.</p>
                            </div>
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
                        The Cost Per Mile Calculator is a simple yet powerful tool for analyzing travel expenses. By distilling total costs down to a single unit of distance, it provides a clear, standardized metric for comparing different trips and transport methods.
                    </p>
                </CardContent>
            </Card>
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Cost Per Mile Calculator",
                    "description": "Calculate the exact cost per mile (or kilometer) for your trip to better understand your travel efficiency and budget.",
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
