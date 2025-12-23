'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateBusVsTrain } from '@/lib/travel-utils';
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
import { Bus, Train, DollarSign, Calculator, Info, CheckCircle, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

const formSchema = z.object({
    numTravelers: z.coerce.number().min(1, 'At least 1 traveler required.'),

    busTicketCost: z.coerce.number().nonnegative(),
    busBaggageFees: z.coerce.number().nonnegative(),
    busOtherCosts: z.coerce.number().nonnegative(),

    trainTicketCost: z.coerce.number().min(0, 'Cost must be non-negative.'),
    trainBaggageFees: z.coerce.number().min(0, 'Fees must be non-negative.'),
    trainOtherCosts: z.coerce.number().min(0, 'Costs must be non-negative.'),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Car vs Flight Calculator', href: '/category/travel-adventure/car-vs-flight-calculator' },
    { name: 'Cost Per Mile Calculator', href: '/category/travel-adventure/cost-per-mile-calculator' },
    { name: 'Trip Budget Calculator', href: '/category/travel-adventure/trip-budget-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function BusVsTrainCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateBusVsTrain> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            numTravelers: 1,
            busTicketCost: undefined,
            busBaggageFees: 0,
            busOtherCosts: 0,
            trainTicketCost: undefined,
            trainBaggageFees: 0,
            trainOtherCosts: 0,
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateBusVsTrain(data);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Bus vs. Train Cost Calculator</CardTitle>
                    <CardDescription>
                        Compare the total costs of taking a bus versus a train for your next trip to find the most economical option.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* Bus Inputs */}
                                <div className="space-y-4 p-4 border rounded-lg bg-orange-50/50 dark:bg-orange-950/20">
                                    <h3 className="font-semibold flex items-center gap-2 text-orange-600 dark:text-orange-400">
                                        <Bus className="h-5 w-5" /> Bus Details (Per Person)
                                    </h3>

                                    <FormField
                                        control={form.control}
                                        name="busTicketCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ticket Price</FormLabel>
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
                                        name="busBaggageFees"
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
                                        name="busOtherCosts"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Other Bus Costs (Total)</FormLabel>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input className="pl-8" type="number" placeholder="0.00" {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                </div>
                                                <p className="text-xs text-muted-foreground">e.g., snacks, transport to station</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Train Inputs */}
                                <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                                    <h3 className="font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                        <Train className="h-5 w-5" /> Train Details (Per Person)
                                    </h3>
                                    <FormField
                                        control={form.control}
                                        name="trainTicketCost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Ticket Price</FormLabel>
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
                                        name="trainBaggageFees"
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
                                        name="trainOtherCosts"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Other Train Costs (Total)</FormLabel>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <FormControl>
                                                        <Input className="pl-8" type="number" placeholder="0.00" {...field} value={field.value ?? ''} />
                                                    </FormControl>
                                                </div>
                                                <p className="text-xs text-muted-foreground">e.g., snacks, transport to station</p>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" size="lg" className="w-full">Compare Costs</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card className="overflow-hidden border-2 shadow-lg" style={{ borderColor: result.textColor }}>
                    <div className="p-6 text-center" style={{ backgroundColor: result.bgColor }}>
                        <CheckCircle className="mx-auto h-12 w-12 mb-2" style={{ color: result.textColor }} />
                        <h2 className="text-2xl font-bold mb-1" style={{ color: result.textColor }}>{result.verdict}</h2>
                        {result.savings > 0 && <p className="text-lg font-medium opacity-90">Save ${result.savings.toFixed(2)} by choosing {result.cheaperOption}!</p>}
                    </div>

                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-semibold flex items-center gap-2"><Bus className="h-5 w-5 text-muted-foreground" /> Bus Total</h3>
                                    <span className="text-xl font-bold">${result.bus.total.toFixed(2)}</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Tickets:</span> <span>${result.bus.ticketCost.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Baggage:</span> <span>${result.bus.baggageFees.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Other:</span> <span>${result.bus.otherCosts.toFixed(2)}</span></div>
                                    <div className="flex justify-between pt-2 text-muted-foreground font-medium"><span>Per Person:</span> <span>${result.bus.perPerson.toFixed(2)}</span></div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="font-semibold flex items-center gap-2"><Train className="h-5 w-5 text-muted-foreground" /> Train Total</h3>
                                    <span className="text-xl font-bold">${result.train.total.toFixed(2)}</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Tickets:</span> <span>${result.train.ticketCost.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Baggage:</span> <span>${result.train.baggageFees.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>Other:</span> <span>${result.train.otherCosts.toFixed(2)}</span></div>
                                    <div className="flex justify-between pt-2 text-muted-foreground font-medium"><span>Per Person:</span> <span>${result.train.perPerson.toFixed(2)}</span></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" /> Why Compare?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        While buses originally were the go-to for budget travel, train networks have become increasingly competitive with advance booking discounts. However, hidden costs like baggage fees or last-mile transport to stations can inevitably swing the verdict.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-4 rounded-lg bg-muted/50">
                            <h4 className="font-semibold mb-2">Consider the Bus if:</h4>
                            <ul className="list-disc pl-4 text-sm space-y-1 text-muted-foreground">
                                <li>You are booking last minute (prices are often more stable).</li>
                                <li>You need to reach a specific destination not served by rail.</li>
                                <li>You have heavy luggage and the bus line offers generous allowances.</li>
                            </ul>
                        </div>
                        <div className="p-4 rounded-lg bg-muted/50">
                            <h4 className="font-semibold mb-2">Consider the Train if:</h4>
                            <ul className="list-disc pl-4 text-sm space-y-1 text-muted-foreground">
                                <li>You can book well in advance for saver fares.</li>
                                <li>You value comfort and the ability to move around.</li>
                                <li>You are traveling between major city centers (saves on transfers).</li>
                            </ul>
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
                        This Bus vs. Train Cost Calculator provides a straightforward way to compare the total financial impact of your ground transport options. By factoring in not just ticket prices but also baggage and incidental costs, it ensures you make a truly informed decision for your next journey.
                    </p>
                </CardContent>
            </Card>
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Bus vs. Train Cost Calculator",
                    "description": "Compare the total costs of taking a bus versus a train for your next trip to find the most economical option.",
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
