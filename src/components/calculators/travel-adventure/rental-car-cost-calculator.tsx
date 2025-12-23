'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateRentalCarCost, formatCurrency } from '@/lib/travel-utils';
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
import { Car, Calendar, DollarSign, Shield, Plus, Info, Compass } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    dailyRate: z.coerce.number().positive('Daily rate must be positive.'),
    rentalDays: z.coerce.number().int().positive('Must rent for at least 1 day.'),
    taxesAndFees: z.coerce.number().nonnegative('Cannot be negative.').default(0),
    insurance: z.coerce.number().nonnegative('Cannot be negative.').default(0),
    extras: z.coerce.number().nonnegative('Cannot be negative.').default(0),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Backpack Weight Calculator', href: '/category/travel-adventure/backpack-weight-calculator' },
    { name: 'Cost Per Mile Calculator', href: '/category/travel-adventure/cost-per-mile-calculator' },
    { name: 'Fuel Cost Calculator', href: '/category/travel-adventure/fuel-cost-calculator' },
    { name: 'Hiking Calorie Calculator', href: '/category/travel-adventure/hiking-calorie-calculator' },
    { name: 'Hiking Time Calculator', href: '/category/travel-adventure/hiking-time-calculator' },
    { name: 'Multi-Stop Route Planner', href: '/category/travel-adventure/multi-stop-route-planner' },
    { name: 'Trip Budget Calculator', href: '/category/travel-adventure/trip-budget-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function RentalCarCostCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateRentalCarCost> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dailyRate: undefined,
            rentalDays: undefined,
            taxesAndFees: undefined,
            insurance: undefined,
            extras: undefined,
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateRentalCarCost(data);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Rental Car Cost Calculator</CardTitle>
                    <CardDescription>
                        Estimate the total cost of a car rental, including the base rate, taxes, fees, and optional extras.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dailyRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Daily Rate</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 45" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rentalDays"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Calendar className="w-4 h-4" />Number of Days</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 7" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="taxesAndFees"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Plus className="w-4 h-4" />Taxes & Fees (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 18.5" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="insurance"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Shield className="w-4 h-4" />Insurance (per day)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 25" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="extras"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Plus className="w-4 h-4" />Other Extras (total)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 50" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit">Calculate Total Cost</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Rental Cost Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                            <div className="p-6 bg-primary/10 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Rental Cost</p>
                                <p className="text-4xl font-bold text-primary">{formatCurrency(result.totalCost)}</p>
                            </div>
                            <div className="p-6 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">Average Cost Per Day</p>
                                <p className="text-4xl font-bold">{formatCurrency(result.averageDailyCost)}</p>
                            </div>
                        </div>

                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between items-center"><span className="text-muted-foreground">Base Rental Cost:</span><span className="font-medium">{formatCurrency(result.baseCost)}</span></li>
                            <li className="flex justify-between items-center"><span className="text-muted-foreground">Taxes & Fees ({form.getValues('taxesAndFees') || 0}%):</span><span className="font-medium">{formatCurrency(result.taxAmount)}</span></li>
                            <li className="flex justify-between items-center"><span className="text-muted-foreground">Total Insurance Cost:</span><span className="font-medium">{formatCurrency(result.insuranceTotal)}</span></li>
                            <li className="flex justify-between items-center"><span className="text-muted-foreground">Other Extras:</span><span className="font-medium">{formatCurrency(result.extrasTotal)}</span></li>
                            <Separator className="my-2" />
                            <li className="flex justify-between items-center text-base"><span className="font-semibold">Total Cost:</span><span className="font-semibold">{formatCurrency(result.totalCost)}</span></li>
                        </ul>
                        <p className="text-xs text-muted-foreground pt-4">*This calculation does not include the cost of fuel.</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Daily Rate & Rental Days</h3>
                        <p className="text-muted-foreground">This is the advertised base price per day for the vehicle, multiplied by the number of days you'll have it.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Taxes & Fees (%)</h3>
                        <p className="text-muted-foreground">This is a percentage applied to the base rental cost. It includes state and local taxes, airport concession fees, vehicle licensing fees, and other surcharges.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Insurance (per day)</h3>
                        <p className="text-muted-foreground">The daily cost for any insurance or damage waivers you purchase directly from the rental company.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Other Extras (total)</h3>
                        <p className="text-muted-foreground">A flat amount for any other add-ons for the entire trip, such as a GPS unit, car seats, or satellite radio.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator determines the total base cost, adds taxes, insurance, and extras to arrive at the final price.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4">
                        <p className="font-mono text-sm">BaseCost = DailyRate * RentalDays</p>
                        <p className="font-mono text-sm">TaxAmount = BaseCost * (TaxesAndFees / 100)</p>
                        <p className="font-mono text-sm">InsuranceTotal = InsurancePerDay * RentalDays</p>
                        <p className="font-mono text-sm font-bold text-primary mt-2">TotalCost = BaseCost + TaxAmount + InsuranceTotal + Extras</p>
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
                    <CardTitle className="text-2xl font-bold">Decoding Your Rental Car Bill</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">A Comprehensive Guide to Understanding and Minimizing Rental Car Costs</h2>
                    <p>Renting a car offers freedom and flexibility on your travels, but the final bill can often be a source of confusion and frustration. The attractive daily rate you see advertised is rarely the price you pay. A cascade of taxes, fees, surcharges, and optional add-ons can significantly inflate the total cost. This guide breaks down every component of a typical rental car bill, helping you budget accurately and make informed decisions at the rental counter.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Base Rate: The Starting Point</h3>
                    <p>This is the advertised daily, weekly, or monthly price for the vehicle itself. It's the headline number used to draw you in. This rate is highly variable and depends on the car class, rental location, time of year, and how far in advance you book.</p>

                    <h3 className="text-lg font-semibold text-foreground">The "Gotchas": Mandatory Taxes and Fees</h3>
                    <p>This is where the price begins to climb. The "Taxes and Fees" percentage is a catch-all for a variety of charges, most of which are unavoidable. Our calculator combines these into a single percentage for simplicity.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Sales Tax:</strong> Standard state and local sales taxes applied to the transaction.</li>
                        <li><strong>Airport Concession Recovery Fee:</strong> If you rent from an airport location, the rental company has to pay a fee to the airport. They pass this cost directly on to you, often 10-12% of the base rate.</li>
                        <li><strong>Vehicle Licensing Fee Recovery:</strong> The cost for the rental company to license and register its fleet, passed on to you as a small daily fee.</li>
                        <li><strong>Energy Surcharge, Tire/Battery Fees:</strong> Small, often confusing fees that are essentially part of the cost of doing business, but are broken out to make the base rate seem lower.</li>
                        <li><strong>Tourism Surcharges:</strong> A tax levied by the local government to fund tourism promotion.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-foreground">The Big Decision: Insurance and Damage Waivers</h3>
                    <p>This is often the most expensive optional add-on. Rental companies will strongly encourage you to purchase their insurance products, which can sometimes double the daily cost.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Loss Damage Waiver (LDW) / Collision Damage Waiver (CDW):</strong> This is not technically insurance, but a waiver. If you buy it, the rental company waives its right to collect money from you if the car is damaged or stolen. It provides peace of mind but is expensive.</li>
                        <li><strong>Supplemental Liability Insurance (SLI):</strong> Protects you against claims made by third parties if you cause an accident.</li>
                        <li><strong>Personal Accident Insurance (PAI):</strong> Covers medical costs for you and your passengers in case of an accident.</li>
                    </ul>
                    <p><strong>Crucial Tip:</strong> Before you rent, check your existing coverage! Your personal auto insurance policy may already cover rental cars. Additionally, many premium credit cards offer rental car insurance as a benefit, provided you use that card to pay for the rental. Knowing your coverage beforehand can save you from buying expensive, redundant protection at the counter.</p>

                    <h3 className="text-lg font-semibold text-foreground">Optional Extras: The Final Layer of Costs</h3>
                    <p>These are the add-ons that are entirely your choice, but can add up.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Prepaid Fuel:</strong> Convenient but almost always more expensive than filling the tank yourself before returning the car. The best strategy is to return the car with a full tank.</li>
                        <li><strong>GPS/Navigation Unit:</strong> A daily fee for a GPS device. In the age of smartphones, this is rarely necessary.</li>
                        <li><strong>Satellite Radio (SiriusXM):</strong> An additional daily charge to activate satellite radio.</li>
                        <li><strong>Child Seats:</strong> If you're traveling with young children, you'll need to rent car seats, which come with a daily fee.</li>
                        <li><strong>Toll Transponders:</strong> For a daily fee, you can use the rental company's toll pass. This can be convenient, but check the pricing, as some charge the fee for every day of the rental, even if you only use it once.</li>
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
                            <AccordionTrigger>Is it cheaper to rent at an airport or an off-airport location?</AccordionTrigger>
                            <AccordionContent>
                                <p>Off-airport locations are almost always cheaper because they don't have to charge the high "Airport Concession Recovery Fees." If you can easily take a taxi or shuttle to a nearby city location, you could save 10-20% on your rental.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Do I need to buy the rental company's insurance?</AccordionTrigger>
                            <AccordionContent>
                                <p>Check your personal auto insurance policy and your credit card benefits first. Many people have existing coverage that makes the rental company's expensive damage waivers redundant. A quick phone call to your insurance agent and credit card company before you travel can save you from buying expensive, redundant protection at the counter.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>What is a "one-way" rental fee?</AccordionTrigger>
                            <AccordionContent>
                                <p>If you pick up a car in one city and drop it off in another, rental companies often charge a significant "one-way" or "drop" fee. This cost is not included in our calculator and should be budgeted for separately.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Should I prepay for fuel?</AccordionTrigger>
                            <AccordionContent>
                                <p>Generally, no. The prepaid fuel option is sold as a convenience, but you are often paying for a full tank of gas at a non-competitive rate, and there's no refund for any unused fuel. The most cost-effective strategy is to fill up the tank yourself right before returning the car.</p>
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
                    <p className="text-muted-foreground">The Rental Car Cost Calculator is designed to demystify the complex pricing of car rentals. By breaking down the cost into the base rate, taxes, insurance, and extras, it allows you to see the true price beyond the advertised daily rate. This enables accurate budgeting and helps you make smarter decisions at the rental counter, particularly regarding expensive and often unnecessary insurance products.
                    </p>
                </CardContent>
            </Card>
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Rental Car Cost Calculator",
                    "description": "Estimate the total cost of a car rental, including the base rate, taxes, fees, and optional extras.",
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
