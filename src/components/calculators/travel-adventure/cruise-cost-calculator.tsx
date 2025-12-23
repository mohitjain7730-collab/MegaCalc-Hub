'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateCruiseCost } from '@/lib/travel-utils';
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
import { Ship, DollarSign, Calculator, Info, Anchor, Wine, Ticket, ArrowRight, Map } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

const formSchema = z.object({
    numTravelers: z.coerce.number().min(1, 'At least 1 traveler required.'),
    numNights: z.coerce.number().min(1, 'At least 1 night required.'),

    // Costs per person or based on logic
    baseFare: z.coerce.number().nonnegative(),
    taxesAndFees: z.coerce.number().nonnegative(),
    onboardGratuities: z.coerce.number().nonnegative(), // per person per night usually
    travelInsurance: z.coerce.number().nonnegative(),
    onboardSpending: z.coerce.number().nonnegative(),
    shoreExcursions: z.coerce.number().nonnegative(),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Trip Budget Calculator', href: '/category/travel-adventure/trip-budget-calculator' },
    { name: 'Hotel Cost Calculator', href: '/category/travel-adventure/hotel-cost-calculator' },
    { name: 'Vacation Daily Budget', href: '/category/travel-adventure/vacation-daily-budget-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function CruiseCostCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateCruiseCost> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            numTravelers: 2,
            numNights: 7,
            baseFare: undefined,
            taxesAndFees: undefined,
            onboardGratuities: 16, // Typical daily gratuity
            travelInsurance: 0,
            onboardSpending: 0,
            shoreExcursions: 0,
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateCruiseCost(data);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Cruise Cost Calculator</CardTitle>
                    <CardDescription>
                        Estimate the true total cost of a cruise vacation by factoring in hidden fees, gratuities, excursions, and onboard spending.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="numTravelers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Travelers</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="2" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="numNights"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Cruise Duration (Nights)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="7" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <Separator />

                            <h3 className="text-lg font-semibold flex items-center gap-2"><Anchor className="h-5 w-5" /> Cost Breakdowns (Per Person)</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="baseFare"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Fare (Per Person)</FormLabel>
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
                                    name="taxesAndFees"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Taxes & Port Fees (Per Person)</FormLabel>
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
                                    name="onboardGratuities"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Daily Gratuities (Per Person/Day)</FormLabel>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <FormControl>
                                                    <Input className="pl-8" type="number" placeholder="16.00" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Typically $16-$20 per day.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="travelInsurance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Travel Insurance (Per Person)</FormLabel>
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

                            <h3 className="text-lg font-semibold flex items-center gap-2"><Wine className="h-5 w-5" /> Extras (Per Person)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="onboardSpending"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Onboard Spending (Total)</FormLabel>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <FormControl>
                                                    <Input className="pl-8" type="number" placeholder="0.00" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Drinks, specialty dining, spa, etc.</p>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="shoreExcursions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shore Excursions (Total)</FormLabel>
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

                            <Button type="submit" size="lg" className="w-full">Calculate Total Cruise Cost</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-center text-primary">Your Estimated Cruise Budget</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-8 text-center">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Total Trip Cost</p>
                                <p className="text-4xl font-bold">${result.totalCost.toFixed(2)}</p>
                            </div>
                            <div className="w-px h-12 bg-border hidden md:block"></div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Per Person</p>
                                <p className="text-3xl font-semibold opacity-90">${result.costPerPerson.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Cost Category</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium"><Ticket className="inline-block w-4 h-4 mr-2 text-muted-foreground" />Base Fare</TableCell>
                                        <TableCell className="text-right">${result.breakdown.baseFare.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium"><Info className="inline-block w-4 h-4 mr-2 text-muted-foreground" />Taxes & Port Fees</TableCell>
                                        <TableCell className="text-right">${result.breakdown.taxesAndFees.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium"><DollarSign className="inline-block w-4 h-4 mr-2 text-muted-foreground" />Pre-paid Gratuities</TableCell>
                                        <TableCell className="text-right">${result.breakdown.gratuities.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium"><Anchor className="inline-block w-4 h-4 mr-2 text-muted-foreground" />Travel Insurance</TableCell>
                                        <TableCell className="text-right">${result.breakdown.insurance.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium"><Wine className="inline-block w-4 h-4 mr-2 text-muted-foreground" />Onboard Spending</TableCell>
                                        <TableCell className="text-right">${result.breakdown.onboardSpending.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium"><Map className="inline-block w-4 h-4 mr-2 text-muted-foreground" />Shore Excursions</TableCell>
                                        <TableCell className="text-right">${result.breakdown.excursions.toFixed(2)}</TableCell>
                                    </TableRow>
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell>Total</TableCell>
                                        <TableCell className="text-right">${result.totalCost.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Ship className="h-5 w-5" /> Hidden Cruise Costs Explained</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-muted-foreground">
                    <p>Cruises are often advertised with attractive low base fares, but the final bill is frequently 50% to 100% higher once all costs are factored in.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Port Fees & Taxes:</strong> These are mandatory and often hefty, sometimes adding hundreds of dollars per person on top of the fare.</li>
                        <li><strong>Gratuities:</strong> Most cruise lines automatically charge $16-$20 per person, per day. For a family of 4 on a 7-day cruise, this alone is over $450.</li>
                        <li><strong>Onboard Spending:</strong> "All-inclusive" often excludes alcohol, soda, specialty coffee, internet, and photos.</li>
                    </ul>
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
                        The Cruise Cost Calculator lifts the veil on cruise pricing. By accounting for the extensive list of potential add-ons—from mandatory gratuities to optional excursions—it provides a realistic estimate of what your sea voyage will actually cost, preventing sticker shock at checkout.
                    </p>
                </CardContent>
            </Card>
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Cruise Cost Calculator",
                    "description": "Estimate the true total cost of a cruise vacation by factoring in hidden fees, gratuities, excursions, and onboard spending.",
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
