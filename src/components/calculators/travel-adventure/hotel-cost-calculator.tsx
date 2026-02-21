'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateHotelCost } from '@/lib/travel-utils';
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
import { Hotel, Moon, DollarSign, Info, Shield, Compass } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    costPerNight: z.coerce.number().positive('Cost must be a positive number.'),
    numNights: z.coerce.number().int().positive('Must be at least one night.'),
    numRooms: z.coerce.number().int().positive('Must be at least one room.'),
    taxesAndFees: z.coerce.number().nonnegative('Cannot be negative.').default(0),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Backpack Weight Calculator', href: '/backpack-weight-calculator' },
    { name: 'Bus vs. Train Cost Comparison', href: '/bus-vs-train-cost-calculator' },
    { name: 'Cruise Cost Calculator', href: '/cruise-cost-calculator' },
    { name: 'Group Expense Splitter', href: '/group-expense-splitter' },
    { name: 'Hiking Calorie Calculator', href: '/hiking-calorie-calculator' },
    { name: 'Hiking Time Calculator', href: '/hiking-time-calculator' },
    { name: 'Rental Car Cost Calculator', href: '/rental-car-cost-calculator' },
    { name: 'Travel Days Calculator', href: '/travel-days-calculator' },
    { name: 'Trip Budget Calculator', href: '/trip-budget-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));


export default function HotelCostCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateHotelCost> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            costPerNight: undefined,
            numNights: undefined,
            numRooms: undefined,
            taxesAndFees: undefined,
        },
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateHotelCost(data);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Hotel Cost Calculator</CardTitle>
                    <CardDescription>
                        Calculate the total cost of a hotel stay, including taxes and fees.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="costPerNight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Cost per Night</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 150" {...field} value={field.value ?? ''} />
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
                                            <FormLabel className="flex items-center gap-2"><Moon className="w-4 h-4" />Number of Nights</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 4" {...field} value={field.value ?? ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="numRooms"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Hotel className="w-4 h-4" />Number of Rooms</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 1" {...field} value={field.value ?? ''} min={1} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="taxesAndFees"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Total Taxes & Fees (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g., 14.5" {...field} value={field.value ?? ''} />
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
                        <CardTitle>Accommodation Cost Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center p-6 bg-primary/10 rounded-lg mb-6">
                            <p className="text-sm text-muted-foreground">Total Stay Cost</p>
                            <p className="text-4xl font-bold text-primary">${result.totalCost.toFixed(2)}</p>
                        </div>

                        <ul className="space-y-2 text-sm">
                            <li className="flex justify-between items-center">
                                <span className="text-muted-foreground">Base Room Cost:</span>
                                <span className="font-medium">${result.baseCost.toFixed(2)}</span>
                            </li>
                            <li className="flex justify-between items-center">
                                <span className="text-muted-foreground">Taxes & Fees ({form.getValues('taxesAndFees') || 0}%):</span>
                                <span className="font-medium">${result.taxAmount.toFixed(2)}</span>
                            </li>
                            <Separator className="my-2" />
                            <li className="flex justify-between items-center text-base">
                                <span className="font-semibold">Total per Room:</span>
                                <span className="font-semibold">${result.totalPerRoom.toFixed(2)}</span>
                            </li>
                            <li className="flex justify-between items-center text-base">
                                <span className="font-semibold">Total for {form.getValues('numRooms')} Room(s):</span>
                                <span className="font-semibold">${result.totalCost.toFixed(2)}</span>
                            </li>
                        </ul>

                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5" />Understanding the Inputs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-lg">Cost per Night</h3>
                        <p className="text-muted-foreground">The advertised nightly rate for one room, before any taxes or fees.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Number of Nights</h3>
                        <p className="text-muted-foreground">The total number of nights you will be staying. This is usually your trip duration in days minus one.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Total Taxes & Fees (%)</h3>
                        <p className="text-muted-foreground">The combined percentage of all applicable taxes (like city tax, state tax) and hotel-imposed fees (like resort fees or service charges). You can usually find this on the final booking screen before payment.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Formula</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator first finds the total base cost, then calculates the tax/fee amount based on that, and finally sums them up for the grand total.</p>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2 mt-4 text-center">
                        <p className="font-mono text-sm">BaseCost = CostPerNight * NumNights * NumRooms</p>
                        <p className="font-mono text-sm">TaxAmount = BaseCost * (TaxesAndFees / 100)</p>
                        <p className="font-mono text-sm font-bold text-primary">TotalCost = BaseCost + TaxAmount</p>
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
                    <CardTitle className="text-2xl font-bold">Decoding Hotel Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">A Traveler's Guide to Understanding the True Cost of Accommodation</h2>
                    <p>Booking a hotel seems straightforward: you find a nightly rate you like and multiply it by the number of nights. However, the final price you pay is often significantly higher than this simple calculation suggests. Hidden fees, various taxes, and other charges can inflate the cost. This guide breaks down the different components of hotel pricing so you can budget accurately and avoid sticker shock at checkout.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Base Rate: The Starting Point</h3>
                    <p>The "cost per night" is the base price of the room itself. This rate can be highly dynamic and fluctuate based on:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Seasonality:</strong> Prices are higher during peak tourist season and holidays.</li>
                        <li><strong>Day of the Week:</strong> Weekend nights (Friday, Saturday) are typically more expensive than weekdays.</li>
                        <li><strong>Demand:</strong> Prices soar during major events, conferences, or festivals in a city.</li>
                        <li><strong>Booking Window:</strong> Booking far in advance or last-minute can sometimes yield lower rates, but this varies.</li>
                    </ul>
                    <p>This base rate is the foundation upon which all other costs are built.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Hidden Costs: Taxes and Fees</h3>
                    <p>This is where the price can escalate quickly. The "Taxes and Fees" percentage is a combination of government-mandated taxes and hotel-specific charges.</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Occupancy Tax:</strong> A tax levied by the city or state on hotel stays, often as a percentage of the room rate.</li>
                        <li><strong>Sales Tax:</strong> Standard sales tax applied to the transaction.</li>
                        <li><strong>Tourism Tax:</strong> A specific tax used to fund local tourism initiatives.</li>
                        <li><strong>Resort Fees:</strong> This is a mandatory daily fee charged by many hotels, especially in tourist destinations, to cover amenities like Wi-Fi, pool access, or gym use, regardless of whether you use them. This is one of the most controversial fees in the industry.</li>
                        <li><strong>Service Charges:</strong> Some hotels add a mandatory service charge or gratuity, particularly for high-end properties or group bookings.</li>
                    </ul>
                    <p>These combined fees can easily add 15% to 25% or more to your base cost. When using the calculator, it's crucial to find this total percentage, which is usually shown on the final confirmation page of a booking website before you pay.</p>

                    <h3 className="text-lg font-semibold text-foreground">Calculating the Total Cost</h3>
                    <p>The correct way to calculate the total cost is as follows:</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Calculate Total Base Cost:</strong> `(Cost Per Night) x (Number of Nights) x (Number of Rooms)`</li>
                        <li><strong>Calculate Total Taxes & Fees:</strong> `(Total Base Cost) x (Tax & Fee Percentage / 100)`</li>
                        <li><strong>Calculate Grand Total:</strong> `(Total Base Cost) + (Total Taxes & Fees)`</li>
                    </ol>
                    <p>Our calculator automates this process to give you an accurate final price.</p>

                    <h3 className="text-lg font-semibold text-foreground">Strategies for Saving on Accommodation</h3>
                    <p>Understanding the pricing structure allows you to be smarter about saving money:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Book Direct:</strong> While booking sites are great for searching, sometimes booking directly with the hotel can unlock special discounts or perks.</li>
                        <li><strong>Join Loyalty Programs:</strong> Hotel loyalty programs are free to join and can offer benefits like lower member-only rates, free Wi-Fi, or potential room upgrades.</li>
                        <li><strong>Travel in the Off-Season:</strong> If your schedule is flexible, traveling during the shoulder season (the months just before or after peak season) can offer the best balance of good weather and lower prices.</li>
                        <li><strong>Consider a Package Deal:</strong> Sometimes, bundling your flight and hotel together through a travel agency or booking site can result in significant savings.</li>
                        <li><strong>Beware of Resort Fees:</strong> When comparing two hotels, a hotel with a lower base rate but a high resort fee might end up being more expensive than one with a slightly higher, all-inclusive rate. Always compare the final, "out-the-door" price.</li>
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
                            <AccordionTrigger>Where do I find the total "Taxes & Fees" percentage?</AccordionTrigger>
                            <AccordionContent>
                                <p>The best place is on the checkout page of a hotel booking website. Proceed with a booking until the very last step before payment. The site will display a detailed breakdown of the room cost, taxes, and fees. You can then calculate the total percentage from these numbers.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Is the "cost per night" the same for every night of my stay?</AccordionTrigger>
                            <AccordionContent>
                                <p>Not always. Hotels often use dynamic pricing, meaning a Friday or Saturday night might be more expensive than a Tuesday night. For the most accurate calculation with this simple tool, you should use the average nightly rate for your stay.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>Does this calculator include parking or breakfast?</AccordionTrigger>
                            <AccordionContent>
                                <p>No. This calculator focuses on the cost of the room itself, plus taxes and mandatory fees. Additional optional costs like parking, breakfast (if not included), or room service should be budgeted for separately in your overall trip budget.</p>
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
                    <p className="text-muted-foreground">The Hotel Cost Calculator is a vital tool for accurate travel budgeting, moving beyond the advertised nightly rate to reveal the true total cost of a stay. By accounting for the number of nights, rooms, and the often-significant percentage of taxes and fees, it provides a clear and reliable figure that helps travelers plan their finances and avoid unexpected expenses.
                    </p>
                </CardContent>
            </Card>
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Hotel Cost Calculator",
                    "description": "Calculate the total cost of a hotel stay, including taxes and fees.",
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
