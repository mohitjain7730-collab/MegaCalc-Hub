'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { calculateBackpackWeight } from '@/lib/travel-utils';
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
import { Backpack, Weight, PlusCircle, Trash2, Info, Shield, Compass, Scale } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const itemSchema = z.object({
    name: z.string().min(1, 'Item name is required.'),
    weight: z.coerce.number().nonnegative('Weight cannot be negative.'),
    unit: z.enum(['grams', 'ounces', 'pounds']),
});

const formSchema = z.object({
    bodyWeight: z.coerce.number().positive('Body weight is required.'),
    bodyWeightUnit: z.enum(['pounds', 'kilograms']),
    items: z.array(itemSchema),
});

type FormValues = z.infer<typeof formSchema>;

const relatedCalculators = [
    { name: 'Hiking Calorie Calculator', href: '/category/travel-adventure/hiking-calorie-calculator' },
    { name: 'Hiking Time Calculator', href: '/category/travel-adventure/hiking-time-calculator' },
    { name: 'Trip Budget Calculator', href: '/category/travel-adventure/trip-budget-calculator' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function BackpackWeightCalculator() {
    const [result, setResult] = useState<ReturnType<typeof calculateBackpackWeight> | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bodyWeight: undefined,
            bodyWeightUnit: 'pounds',
            items: [
                { name: 'Backpack', weight: 0, unit: 'pounds' },
                { name: 'Tent', weight: 0, unit: 'pounds' },
                { name: 'Sleeping Bag', weight: 0, unit: 'grams' },
                { name: 'Water (1L)', weight: 1000, unit: 'grams' },
            ],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items"
    });

    const onSubmit = (data: FormValues) => {
        const res = calculateBackpackWeight(data.items, data.bodyWeight, data.bodyWeightUnit);
        setResult(res);
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Backpack Weight Calculator</CardTitle>
                    <CardDescription>
                        Calculate your total pack weight and see how it compares to your body weight for optimal hiking performance.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <div className="p-4 border rounded-lg">
                                <h3 className="text-lg font-semibold mb-2">Your Body Weight</h3>
                                <FormField
                                    control={form.control}
                                    name="bodyWeight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><Scale className="w-4 h-4" />Your Weight</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g., 150" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormField control={form.control} name="bodyWeightUnit" render={({ field: unitField }) => (
                                                    <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                        <FormControl><SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent><SelectItem value="pounds">lbs</SelectItem><SelectItem value="kilograms">kg</SelectItem></SelectContent>
                                                    </Select>
                                                )} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2"><Backpack /> Gear List</h3>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="grid grid-cols-[1fr_auto_auto_auto] items-end gap-2 p-3 border rounded-lg">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Item Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g., Tent" {...field} value={field.value ?? ''} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.weight`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Weight</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" placeholder="e.g., 900" {...field} value={field.value ?? ''} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.unit`}
                                                render={({ field: unitField }) => (
                                                    <FormItem>
                                                        <FormLabel>Unit</FormLabel>
                                                        <Select onValueChange={unitField.onChange} defaultValue={unitField.value}>
                                                            <FormControl><SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="grams">grams</SelectItem>
                                                                <SelectItem value="ounces">ounces</SelectItem>
                                                                <SelectItem value="pounds">pounds</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-4 flex items-center gap-2"
                                    onClick={() => append({ name: '', weight: 0, unit: 'grams' })}>
                                    <PlusCircle className="h-4 w-4" /> Add Item
                                </Button>
                            </div>

                            <Button type="submit" size="lg" className="w-full">Calculate Pack Weight</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Backpack Weight Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                            <div className="p-6 bg-primary/10 rounded-lg">
                                <p className="text-sm text-muted-foreground">Total Pack Weight</p>
                                <p className="text-4xl font-bold text-primary">{result.totalWeightLbs.toFixed(2)} lbs / {result.totalWeightKg.toFixed(2)} kg</p>
                            </div>
                            <div className="p-6 rounded-lg" style={{ backgroundColor: result.recommendation.color, color: 'hsl(var(--card-foreground))' }}>
                                <p className="text-sm">Weight as % of Body Weight</p>
                                <p className="text-4xl font-bold">{result.percentageOfBodyWeight}%</p>
                                <p className="text-xs font-semibold mt-1">{result.recommendation.text}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-2">Weight Breakdown by Item</h3>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item</TableHead>
                                        <TableHead className="text-right">Weight (lbs)</TableHead>
                                        <TableHead className="text-right">Weight (kg)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {result.items.map((item: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">{item.weightLbs.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{item.weightKg.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                    <TableRow className="font-bold bg-muted/50">
                                        <TableCell>Total</TableCell>
                                        <TableCell className="text-right">{result.totalWeightLbs.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">{result.totalWeightKg.toFixed(2)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
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
                        <h3 className="font-semibold text-lg">Body Weight</h3>
                        <p className="text-muted-foreground">Your current body weight. This is used as a benchmark to determine if your pack weight is within a healthy and sustainable range for your frame.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Gear List</h3>
                        <p className="text-muted-foreground">List every item you plan to carry, including the backpack itself. Be meticulous—small items add up! Use a kitchen scale for accuracy if you're unsure of an item's weight.</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Methodology</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>The calculator converts all item weights into a common unit (kilograms) and sums them to find the total pack weight. It then calculates this total as a percentage of your body weight. Based on established backpacking guidelines, it provides a recommendation:</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-muted-foreground">
                        <li><strong>10% or less:</strong> Ideal ultralight base weight.</li>
                        <li><strong>10-20%:</strong> Excellent lightweight range for most backpackers.</li>
                        <li><strong>20-30%:</strong> A conventional but heavy pack weight. Consider reducing weight.</li>
                        <li><strong>Over 30%:</strong> Potentially dangerous. Significantly increases risk of injury and fatigue.</li>
                    </ul>
                    <p className="mt-2 text-xs text-muted-foreground">*Note: These percentages typically refer to "base weight" (pack weight without consumables like food, water, and fuel). When including consumables, your total pack weight might be higher, especially at the start of a long trip.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">The Science of a Lighter Pack</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground leading-relaxed">
                    <h2 className="text-xl font-bold text-foreground">A Backpacker's Guide to Weight Management</h2>
                    <p>In the world of backpacking, weight is everything. Every ounce on your back requires energy to carry, and reducing your pack weight is the single most effective way to increase your comfort, speed, and overall enjoyment on the trail. This guide breaks down the philosophy of pack weight, the key metrics used by hikers, and how to use our calculator to analyze and optimize your gear list.</p>

                    <h3 className="text-lg font-semibold text-foreground">Base Weight vs. Total Pack Weight</h3>
                    <p>Experienced backpackers talk about two key weight metrics:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Base Weight:</strong> This is the weight of your pack and all its contents, **excluding** consumables like food, water, and fuel. Your base weight is the constant part of your load and the best indicator of how heavy your gear is. Ultralight backpackers obsess over reducing their base weight.</li>
                        <li><strong>Total Pack Weight (or "Skin-Out Weight"):</strong> This is everything you are carrying, including your consumables. This weight will be highest at the start of a trip and will decrease as you eat your food and drink your water.</li>
                    </ul>
                    <p>Our calculator helps you determine your total pack weight, but you can use it to find your base weight by simply omitting food, water, and fuel from your gear list.</p>

                    <h3 className="text-lg font-semibold text-foreground">The Body Weight Guideline: How Heavy is Too Heavy?</h3>
                    <p>A long-standing rule of thumb in the backpacking community provides a guideline for how much weight a person can comfortably and safely carry. This is typically expressed as a percentage of your body weight:</p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>10% or less:</strong> This is the realm of the "ultralight" backpacker. Achieving this low of a base weight requires specialized, often expensive gear and a minimalist mindset.</li>
                        <li><strong>20% or less:</strong> A fantastic goal for most hikers. A pack weight at or below 20% of your body weight is generally considered healthy and sustainable for multi-day trips.</li>
                        <li><strong>20% to 30%:</strong> This is a conventional, but heavy, pack weight. While manageable for strong hikers on shorter trips, it can lead to increased fatigue and discomfort. If you're in this range, you should actively look for ways to reduce weight.</li>
                        <li><strong>Over 30%:</strong> This is widely considered to be in the danger zone. Carrying over 30% of your body weight significantly increases the strain on your joints (especially knees and ankles), leads to rapid fatigue, and raises the risk of injury.</li>
                    </ul>
                    <p>Our calculator's color-coded feedback is based on these well-established guidelines to give you an instant assessment of your load.</p>

                    <h3 className="text-lg font-semibold text-foreground">The "Big Three": Where to Save the Most Weight</h3>
                    <p>For most backpackers, the heaviest items in their pack are the "Big Three":</p>
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Your Pack Itself:</strong> A robust, feature-heavy backpack can weigh 4-5 pounds, while a minimalist ultralight pack can be under 2 pounds.</li>
                        <li><strong>Your Shelter:</strong> A two-person tent can range from over 5 pounds to under 2 pounds for an ultralight model.</li>
                        <li><strong>Your Sleep System:</strong> This includes your sleeping bag and sleeping pad. Down sleeping bags are generally lighter than synthetic ones for the same temperature rating.</li>
                    </ol>
                    <p>Reducing the weight of these three items is the fastest way to lower your base weight. After that, you can start scrutinizing every other item, from your cook set to your clothing.</p>

                    <h3 className="text-lg font-semibold text-foreground">Using the Calculator for Gear Audits</h3>
                    <p>This calculator is a powerful tool for conducting a "gear audit." By forcing you to list and weigh every single item, you can see exactly where the ounces are adding up. This process often reveals surprising sources of weight and opportunities for reduction. Can you carry a smaller tube of toothpaste? Do you really need that heavy book? Could a lighter pot save you 6 ounces? This meticulous approach is the path to a lighter, more comfortable backpacking experience.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Should I include the weight of the clothes I'm wearing?</AccordionTrigger>
                            <AccordionContent>
                                <p>Generally, no. Pack weight refers to what you are carrying on your back. The weight of your clothes, boots, and trekking poles (in your hands) are not typically included in base weight or total pack weight calculations.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>How much does water weigh?</AccordionTrigger>
                            <AccordionContent>
                                <p>A simple and crucial conversion to remember: 1 liter of water weighs 1 kilogram (or about 2.2 pounds). This is why carrying a large amount of water significantly increases your pack weight.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>How can I weigh my gear accurately?</AccordionTrigger>
                            <AccordionContent>
                                <p>A digital kitchen scale is the best tool for weighing individual items. For larger items like your entire backpack, a luggage scale can be used.</p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
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
                    <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The Backpack Weight Calculator is a critical tool for any serious hiker or backpacker. By allowing you to itemize your gear and calculate a total weight, it provides immediate, actionable feedback based on established safety guidelines. Understanding and managing your pack weight is the key to hiking farther, feeling better, and enjoying your time in the wilderness to the fullest.
                    </p>
                </CardContent>
            </Card>
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Backpack Weight Calculator",
                    "description": "Calculate your total pack weight and see how it compares to your body weight for optimal hiking performance.",
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
