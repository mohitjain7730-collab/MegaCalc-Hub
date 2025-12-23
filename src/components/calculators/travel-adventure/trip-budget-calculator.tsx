'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateTripBudget } from '@/lib/travel-utils';
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
import { Wallet, Info, Shield, Compass, CalendarDays, Users, Plane, Hotel, Utensils, FerrisWheel, Car, ShoppingBag, PieChart } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, Pie, Cell, Tooltip } from 'recharts';

const formSchema = z.object({
    durationDays: z.coerce.number().int().positive('Must be a positive number of days.'),
    numTravelers: z.coerce.number().int().positive('Must be at least one traveler.'),
    flights: z.coerce.number().nonnegative('Cannot be negative.').default(0),
    accommodationPerNight: z.coerce.number().nonnegative('Cannot be negative.').default(0),
    foodPerDay: z.coerce.number().nonnegative('Cannot be negative.').default(0),
    activities: z.coerce.number().nonnegative('Cannot be negative.').default(0),
    transport: z.coerce.number().nonnegative('Cannot be negative.').default(0),
    misc: z.coerce.number().nonnegative('Cannot be negative.').default(0),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Backpack Weight Calculator', href: '/category/travel-adventure/backpack-weight-calculator' },
    { name: 'Bus vs. Train Cost Comparison', href: '/category/travel-adventure/bus-vs-train-cost-calculator' },
    { name: 'Cost Per Mile Calculator', href: '/category/travel-adventure/cost-per-mile-calculator' },
    { name: 'Cruise Cost Calculator', href: '/category/travel-adventure/cruise-cost-calculator' },
    { name: 'EV Charging Cost Calculator', href: '/category/travel-adventure/ev-charging-cost-calculator' },
    { name: 'Fuel Cost Calculator', href: '/category/travel-adventure/fuel-cost-calculator' },
    { name: 'Group Expense Splitter', href: '/category/travel-adventure/group-expense-splitter' },
    { name: 'Hiking Calorie Calculator', href: '/category/travel-adventure/hiking-calorie-calculator' },
    { name: 'Hiking Time Calculator', href: '/category/travel-adventure/hiking-time-calculator' },
    { name: 'Hotel Cost Calculator', href: '/category/travel-adventure/hotel-cost-calculator' },
    { name: 'Rental Car Cost Calculator', href: '/category/travel-adventure/rental-car-cost-calculator' },
    { name: 'Travel Days Calculator', href: '/category/travel-adventure/travel-days-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function TripBudgetCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateTripBudget> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            durationDays: undefined,
            numTravelers: undefined,
            flights: undefined,
            accommodationPerNight: undefined,
            foodPerDay: undefined,
            activities: undefined,
            transport: undefined,
            misc: undefined,
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateTripBudget(data.durationDays, data.numTravelers, data);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Trip Budget Calculator</CardTitle>
                    <CardDescription>
                        Estimate your total travel expenses across flights, accommodation, food, and activities to create a comprehensive budget.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="durationDays"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Trip Duration (Days)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="numTravelers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Users className="h-4 w-4" /> Number of Travelers</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 2" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">Estimated Costs</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FormField control={form.control} name="flights" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><Plane className="h-4 w-4" />Flights (per person)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="accommodationPerNight" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><Hotel className="h-4 w-4" />Accommodation (per night)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="foodPerDay" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><Utensils className="h-4 w-4" />Food (per person, per day)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="activities" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><FerrisWheel className="h-4 w-4" />Activities (per person)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="transport" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><Car className="h-4 w-4" />Local Transport (total)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="misc" render={({ field }) => (
                                        <FormItem><FormLabel className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" />Miscellaneous (total)</FormLabel><FormControl><Input type="number" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </div>

                            <Button type="submit">Calculate Budget</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Your Trip Budget Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                            <div className="p-6 bg-primary/10 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Trip Budget</p>
                                <p className="text-4xl font-bold text-primary">${result.totalBudget.toLocaleString()}</p>
                            </div>
                            <div className="p-6 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Budget Per Person</p>
                                <p className="text-4xl font-bold">${result.perPersonBudget.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 text-center md:text-left">Expense Distribution</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Total Cost</TableHead>
                                            <TableHead className="text-right">Per Person</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.breakdown.map((item) => (
                                            <TableRow key={item.category}>
                                                <TableCell className="font-medium">{item.category}</TableCell>
                                                <TableCell className="text-right">${item.total.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">${item.perPerson.toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="h-64 md:h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={result.breakdown.filter(item => item.total > 0)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="total"
                                            nameKey="category"
                                        >
                                            {result.breakdown.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>This calculator breaks down your trip into key expense categories. Provide estimates for each category to build a complete picture of your travel costs.</p>
                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                        <li><strong>Flights/Major Transport:</strong> The cost to get to your destination, per person.</li>
                        <li><strong>Accommodation:</strong> The nightly rate for your hotel, rental, or other lodging. This is a total cost, not per person.</li>
                        <li><strong>Food:</strong> Your estimated daily food budget, per person.</li>
                        <li><strong>Activities:</strong> The total cost for tours, tickets, and entertainment, per person.</li>
                        <li><strong>Local Transport:</strong> Total estimated cost for taxis, public transit, or ride-shares at the destination.</li>
                        <li><strong>Miscellaneous:</strong> A total budget for souvenirs, shopping, and unexpected expenses.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator sums the total costs for each category, taking into account the number of travelers and the trip duration for per-person and per-day expenses.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4">
                        <p className="font-mono text-sm">Accommodation = CostPerNight * (DurationDays - 1)</p>
                        <p className="font-mono text-sm">Food = CostPerDay * DurationDays * NumTravelers</p>
                        <p className="font-mono text-sm">Flights = CostPerPerson * NumTravelers</p>
                        <p className="font-mono text-sm font-bold text-primary mt-2">Total = Σ(All Category Totals)</p>
                    </div>
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
                    <CardTitle className="text-2xl font-bold">The Art of Travel Budgeting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">A Comprehensive Guide to Estimating and Managing Your Travel Expenses</h2>
                    <p>A well-thought-out budget is the foundation of a stress-free vacation. It transforms abstract travel dreams into an actionable plan, providing a clear financial roadmap that helps you make informed decisions and avoid unpleasant surprises. This guide will walk you through the key principles of travel budgeting, how to estimate costs for each category, and strategies for saving money both before and during your trip.</p>

                    <h3 className="text-lg font-semibold text-foreground">The "Big Three": Your Core Travel Costs</h3>
                    <p>For most trips, the bulk of your budget will be consumed by three main categories: transportation to the destination, accommodation, and food. Mastering the estimation of these three is the key to a realistic budget.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Transportation (Flights/Train/Car):</strong> This is the cost of getting there. For flights, use tools like Google Flights or Skyscanner to track prices, and be flexible with your dates if possible to find better deals. For road trips, use our Fuel Cost Calculator. This is often the first and largest fixed cost you'll book.</li>
                        <li><strong>Accommodation:</strong> This is your home away from home. The cost can vary dramatically, from a budget-friendly hostel to a luxury hotel. Research average prices for your destination on sites like Booking.com or Airbnb for the season you plan to travel. Remember, you're budgeting for the number of nights, which is typically your total trip days minus one.</li>
                        <li><strong>Food:</strong> A simple way to estimate food costs is to use a three-tiered system: budget one amount for breakfast (often cheap or included with accommodation), a larger amount for lunch, and the largest amount for dinner. Look up sample menu prices for your destination to get a feel for the local cost of dining out. Multiply this daily estimate by the number of travelers and the duration of your trip.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">The Variable Costs: Activities and Local Transport</h3>
                    <p>These are the costs that bring your trip to life, but they can also add up quickly. It's essential to plan for them explicitly.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Activities and Entertainment:</strong> Make a list of the "must-do" activities on your trip—museum tickets, guided tours, adventure sports, etc. Research the ticket prices for each online. Sum these up to get your baseline activity budget. It's often cheaper to book tickets in advance.</li>
                        <li><strong>Local Transportation:</strong> How will you get around at your destination? Research the cost of a weekly metro pass, the average price of a taxi or Uber from the airport to your hotel, or the daily rate for a rental car. Underestimating this can lead to a significant budget shortfall in cities where transportation is expensive.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">The Safety Net: Your Miscellaneous Fund</h3>
                    <p>No budget is complete without a contingency fund. The "Miscellaneous" category is your safety net for everything you haven't planned for. This includes:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Shopping and Souvenirs:</strong> That piece of local art or gift for family back home.</li>
                        <li><strong>Unexpected Expenses:</strong> A forgotten essential that needs to be purchased, a taxi ride during a sudden downpour, or a pharmacy visit.</li>
                        <li><strong>Splurges:</strong> A spontaneous decision to try a high-end restaurant or add an extra tour.</li>
                    </ul>
                    <p>A good rule of thumb is to set your miscellaneous budget at **10-15% of your total pre-planned budget**. If your trip costs $2,000 before this fund, adding a $200-$300 buffer provides peace of mind and flexibility. It's better to have it and not need it than to need it and not have it.</p>

                    <h3 className="text-lg font-semibold text-foreground">Budgeting Per Person vs. Per Group</h3>
                    <p>It's important to distinguish between different types of costs. Some costs, like flights and daily food, are best calculated on a per-person basis. Others, like accommodation or a rental car, are often shared among the group. Our calculator helps you manage this by asking for per-person costs where appropriate and total costs for shared items.</p>

                    <h3 className="text-lg font-semibold text-foreground">Tips for Saving Money</h3>
                    <p>Once you have your budget, you can look for ways to optimize it:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Travel Off-Season:</strong> Flights and accommodation are significantly cheaper during the shoulder or off-seasons.</li>
                        <li><strong>Eat Smart:</strong> Plan for a mix of dining experiences. Eat at local cafes or grab food from a supermarket for some meals, and save your budget for a few special restaurant dinners.</li>
                        <li><strong>Look for Free Activities:</strong> Most cities have plenty of free attractions, such as parks, walking tours, and free-admission museum days.</li>
                        <li><strong>Use Public Transportation:</strong> It's almost always cheaper than taxis or ride-sharing services for getting around a city.</li>
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
                            <AccordionTrigger>How much should I budget for a trip?</AccordionTrigger>
                            <AccordionContent>
                                <p>This varies wildly by destination and travel style. A backpacking trip through Southeast Asia might cost $50/day, while a luxury stay in Paris could be over $500/day. The best approach is to use this calculator to build a budget from the ground up based on your specific plans and destination.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>What's the best way to track expenses during my trip?</AccordionTrigger>
                            <AccordionContent>
                                <p>Use a budgeting app like Splitwise (for group travel) or a simple spreadsheet. Update it at the end of each day. This helps you see where your money is going and adjust your spending for the remainder of the trip if you're over budget.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Why is my number of nights one less than my number of days?</AccordionTrigger>
                            <AccordionContent>
                                <p>You need accommodation for the night of each day you are on your trip, except for the final day when you check out or travel home. Therefore, a 7-day trip typically requires 6 nights of accommodation.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>How much should I set aside for miscellaneous expenses?</AccordionTrigger>
                            <AccordionContent>
                                <p>A good rule of thumb is 10-15% of your total estimated budget. This provides a healthy cushion for unplanned purchases, emergencies, or spontaneous splurges without derailing your finances.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>Is it better to use cash or credit cards when traveling internationally?</AccordionTrigger>
                            <AccordionContent>
                                <p>A mix is best. Use a credit card with no foreign transaction fees for major purchases like hotels and restaurants to get the best exchange rate and purchase protection. Carry a small amount of local currency, obtained from an ATM upon arrival, for small purchases, tips, and places that don't accept cards.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-6">
                            <AccordionTrigger>Should I include travel insurance in my budget?</AccordionTrigger>
                            <AccordionContent>
                                <p>Yes. While not an input in this calculator, travel insurance is a critical expense that should be part of your overall trip cost. It protects you from financial loss due to trip cancellations, medical emergencies, or lost baggage. You can add this cost to the "Miscellaneous" category.</p>
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
                    <p className="text-muted-foreground">The Trip Budget Calculator is a powerful tool for turning your travel aspirations into a concrete financial plan. By systematically breaking down expenses into logical categories, it allows you to create a realistic and comprehensive budget, ensuring you can enjoy your journey without financial stress. Planning your budget is the first step to a successful and memorable trip.
                    </p>
                </CardContent>
            </Card>
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Trip Budget Calculator",
                    "description": "Estimate your total travel expenses across flights, accommodation, food, and activities to create a comprehensive budget.",
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
