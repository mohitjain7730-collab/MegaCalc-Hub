'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gamepad2, Zap, Target, Activity, Shield } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
    fuelType: z.enum(['coal', 'charcoal', 'lava_bucket', 'cactus', 'blaze_rod'], { invalid_type_error: 'Select fuel type' }),
    fuelAmount: z.number({ invalid_type_error: 'Enter fuel amount' }).min(1),
    itemsToSmelt: z.number({ invalid_type_error: 'Enter items to smelt' }).min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    fuelType: string;
    fuelAmount: number;
    itemsToSmelt: number;
    smeltingTimePerUnit: number;
    totalSmeltingTime: number;
    itemsSmelted: number;
    itemsPerFuel: number;
    efficiency: number;
    fuelComparison: {
        fuel: string;
        smeltingTime: number;
        itemsPerUnit: number;
        efficiency: number;
    }[];
    status: 'low-efficiency' | 'moderate-efficiency' | 'high-efficiency' | 'very-high-efficiency';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

// Smelting time per fuel unit (in items)
const fuelEfficiency: Record<string, number> = {
    coal: 8, // 1 coal smelts 8 items
    charcoal: 8, // 1 charcoal smelts 8 items
    lava_bucket: 100, // 1 lava bucket smelts 100 items
    cactus: 0.5, // 1 cactus smelts 0.5 items (2 cactus = 1 item)
    blaze_rod: 12, // 1 blaze rod smelts 12 items
};

const calculateResult = (values: FormValues): ResultPayload => {
    const fuelType = values.fuelType;
    const fuelAmount = values.fuelAmount;
    const itemsToSmelt = values.itemsToSmelt ?? 0;

    // Smelting time per fuel unit
    const smeltingTimePerUnit = fuelEfficiency[fuelType] || 8;

    // Total smelting capacity
    const totalSmeltingTime = fuelAmount * smeltingTimePerUnit;

    // Items that can be smelted
    const itemsSmelted = totalSmeltingTime;

    // Items per fuel unit
    const itemsPerFuel = smeltingTimePerUnit;

    // Efficiency (items per fuel unit, normalized for comparison)
    const efficiency = smeltingTimePerUnit;

    // Fuel comparison (all fuel types)
    const fuelComparison = Object.entries(fuelEfficiency).map(([fuel, time]) => ({
        fuel: fuel.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        smeltingTime: time,
        itemsPerUnit: time,
        efficiency: time,
    })).sort((a, b) => b.efficiency - a.efficiency);

    let status: ResultPayload['status'] = 'moderate-efficiency';
    let interpretation = 'Your fuel efficiency has been calculated based on fuel type and amount.';

    if (smeltingTimePerUnit >= 50) {
        status = 'very-high-efficiency';
        interpretation = `Very high efficiency! ${fuelType.replace('_', ' ')} smelts ${smeltingTimePerUnit} items per unit. This is extremely efficient fuel, providing maximum smelting capacity per fuel unit.`;
    } else if (smeltingTimePerUnit >= 10) {
        status = 'high-efficiency';
        interpretation = `High efficiency! ${fuelType.replace('_', ' ')} smelts ${smeltingTimePerUnit} items per unit. This is efficient fuel with good smelting capacity.`;
    } else if (smeltingTimePerUnit >= 5) {
        status = 'moderate-efficiency';
        interpretation = `Moderate efficiency. ${fuelType.replace('_', ' ')} smelts ${smeltingTimePerUnit} items per unit. This is standard efficiency for common fuels.`;
    } else {
        status = 'low-efficiency';
        interpretation = `Lower efficiency. ${fuelType.replace('_', ' ')} smelts ${smeltingTimePerUnit} items per unit. Consider more efficient fuels for better smelting capacity.`;
    }

    const recommendations = [
        `Fuel Type: ${fuelType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}. ${smeltingTimePerUnit >= 50 ? 'Extremely efficient fuel - excellent for high-volume smelting.' : smeltingTimePerUnit >= 10 ? 'Efficient fuel - good for smelting.' : smeltingTimePerUnit >= 5 ? 'Moderate efficiency - standard fuel.' : 'Lower efficiency - consider more efficient alternatives.'}`,
        `Items Per Fuel Unit: ${itemsPerFuel} items. ${itemsPerFuel >= 50 ? 'Excellent capacity - very efficient fuel.' : itemsPerFuel >= 10 ? 'Good capacity - efficient fuel.' : itemsPerFuel >= 5 ? 'Moderate capacity - standard fuel.' : 'Lower capacity - less efficient fuel.'}`,
        `Total Smelting Capacity: ${itemsSmelted.toFixed(0)} items with ${fuelAmount} ${fuelType.replace('_', ' ')}. ${itemsSmelted >= 500 ? 'Excellent capacity - can smelt large quantities.' : itemsSmelted >= 100 ? 'Good capacity - sufficient for moderate smelting.' : itemsSmelted >= 50 ? 'Moderate capacity - decent for small-scale smelting.' : 'Lower capacity - may need more fuel for large smelting.'}`,
    ];

    if (itemsToSmelt > 0) {
        const fuelNeeded = Math.ceil(itemsToSmelt / smeltingTimePerUnit);
        const hasEnough = fuelAmount >= fuelNeeded;
        recommendations.push(`Items to Smelt: ${itemsToSmelt} items. ${hasEnough ? `You have enough fuel (need ${fuelNeeded}, have ${fuelAmount}).` : `You need ${fuelNeeded - fuelAmount} more ${fuelType.replace('_', ' ')} to smelt all items (need ${fuelNeeded}, have ${fuelAmount}).`}`);
    }

    // Add fuel comparison recommendation
    const bestFuel = fuelComparison[0];
    if (fuelType !== bestFuel.fuel.toLowerCase().replace(' ', '_')) {
        recommendations.push(`Fuel Comparison: ${bestFuel.fuel} is the most efficient (${bestFuel.itemsPerUnit} items/unit). Consider using ${bestFuel.fuel.toLowerCase()} for maximum efficiency, though availability and renewability are also important factors.`);
    }

    if (smeltingTimePerUnit < 10) {
        recommendations.push('Efficiency Optimization: Consider using more efficient fuels like Lava Buckets (100 items/bucket) or Blaze Rods (12 items/rod) for better smelting capacity. Higher efficiency reduces fuel consumption and improves smelting productivity.');
    }

    const plan = [
        {
            label: 'This Session',
            detail: `Fuel efficiency: ${itemsPerFuel} items per ${fuelType.replace('_', ' ')}, ${itemsSmelted.toFixed(0)} total capacity. ${itemsToSmelt > 0 ? (itemsSmelted >= itemsToSmelt ? 'Sufficient fuel for smelting needs.' : 'Insufficient fuel - obtain more fuel.') : 'Plan smelting based on available fuel capacity.'}`
        },
        {
            label: 'This Week',
            detail: 'Optimize fuel usage: compare different fuel types for efficiency, identify most efficient fuels available, balance efficiency with availability and renewability, and plan fuel collection based on smelting needs.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize fuel efficiency: use most efficient fuels when available (lava buckets, blaze rods), balance efficiency with renewability for long-term sustainability, automate fuel collection for continuous smelting, and track fuel consumption to optimize smelting operations.'
        },
    ];

    return {
        fuelType,
        fuelAmount,
        itemsToSmelt,
        smeltingTimePerUnit,
        totalSmeltingTime,
        itemsSmelted,
        itemsPerFuel,
        efficiency,
        fuelComparison,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function MinecraftSmelterFuelEfficiencyInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fuelType: undefined,
            fuelAmount: undefined,
            itemsToSmelt: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5" />
                        Minecraft Smelter Fuel Efficiency
                    </CardTitle>
                    <CardDescription>Compare fuel efficiency for Minecraft smelting including coal, lava buckets, and cactus, calculating items smelted per fuel unit.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Input your fuel information</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit((values) => {
                            try {
                                setResult(calculateResult(values));
                            } catch (error) {
                                console.error('Error calculating result:', error);
                                alert('An error occurred while calculating. Please check the console for details.');
                            }
                        }, (errors) => {
                            console.log('Form validation errors:', errors);
                        })} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fuelType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fuel Type</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value as 'coal' | 'charcoal' | 'lava_bucket' | 'cactus' | 'blaze_rod')}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                >
                                                    <option value="">Select fuel type</option>
                                                    <option value="coal">Coal (8 items per coal)</option>
                                                    <option value="charcoal">Charcoal (8 items per charcoal)</option>
                                                    <option value="lava_bucket">Lava Bucket (100 items per bucket)</option>
                                                    <option value="cactus">Cactus (0.5 items per cactus)</option>
                                                    <option value="blaze_rod">Blaze Rod (12 items per rod)</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fuelAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fuel Amount</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="itemsToSmelt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Items to Smelt (optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Fuel Efficiency
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="h-5 w-5 text-primary" />
                            Interactive results
                        </CardTitle>
                        <CardDescription>See smelting capacity, items per fuel unit, efficiency comparison, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Items Per Fuel</p>
                                <p className="text-2xl font-semibold text-primary">{result.itemsPerFuel}</p>
                                <p className="text-xs text-muted-foreground">Items per unit</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Total Capacity</p>
                                <p className="text-2xl font-semibold text-primary">{result.itemsSmelted.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">Items smelted</p>
                            </div>
                            {result.itemsToSmelt > 0 && (
                                <div className="p-4 border rounded">
                                    <p className="text-sm text-muted-foreground">Fuel Needed</p>
                                    <p className="text-2xl font-semibold text-primary">{Math.ceil(result.itemsToSmelt / result.itemsPerFuel)}</p>
                                    <p className="text-xs text-muted-foreground">Fuel units</p>
                                </div>
                            )}
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {result.fuelComparison.map((fuel) => (
                                <div key={fuel.fuel} className={`p-4 border rounded ${fuel.fuel.toLowerCase().replace(' ', '_') === result.fuelType ? 'ring-2 ring-primary' : ''}`}>
                                    <p className="text-sm text-muted-foreground">{fuel.fuel}</p>
                                    <p className="text-xl font-semibold text-primary">{fuel.itemsPerUnit}</p>
                                    <p className="text-xs text-muted-foreground">Items per unit</p>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                                        {result.recommendations.map((rec, idx) => (
                                            <li key={idx}>{rec}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Action plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-1 text-sm text-muted-foreground">
                                        {result.plan.map((step) => (
                                            <li key={step.label}>
                                                <span className="font-semibold">{step.label}:</span> {step.detail}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Formula
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                        <strong>Items Per Fuel Unit</strong> = Fuel Efficiency (varies by fuel type). Coal/Charcoal = 8 items, Lava Bucket = 100 items, Cactus = 0.5 items (need 2 for 1 item), Blaze Rod = 12 items. This shows how many items each fuel unit can smelt.
                    </p>
                    <p>
                        <strong>Total Smelting Capacity</strong> = Fuel Amount × Items Per Fuel Unit. This calculates total items that can be smelted with available fuel. For example, 10 coal × 8 items/coal = 80 items total capacity.
                    </p>
                    <p>
                        <strong>Fuel Needed</strong> = Items To Smelt / Items Per Fuel Unit (rounded up). This calculates how much fuel is needed to smelt a specific number of items. Use this to plan fuel requirements for smelting projects.
                    </p>
                    <p>
                        <strong>Fuel Efficiency Comparison</strong>: Compare items per fuel unit across different fuel types. Lava Bucket (100 items) &gt; Blaze Rod (12 items) &gt; Coal/Charcoal (8 items) &gt; Cactus (0.5 items). Higher efficiency means more items smelted per fuel unit.
                    </p>
                    <p>
                        <strong>Efficiency Rating</strong> = Items Per Fuel Unit. This directly measures fuel efficiency. Higher values indicate more efficient fuels that smelt more items per unit. Use efficiency ratings to compare fuels and choose optimal fuel types.
                    </p>
                    <p>These formulas help you understand fuel efficiency, calculate smelting capacity, plan fuel requirements, and compare different fuel types. Use most efficient fuels when available, but also consider availability, renewability, and cost when choosing fuels.</p>
                </CardContent>
            </Card>
        </div>
    );
}
