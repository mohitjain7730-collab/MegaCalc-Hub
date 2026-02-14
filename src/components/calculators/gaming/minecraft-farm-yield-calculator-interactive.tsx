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
    farmSize: z.number({ invalid_type_error: 'Enter farm size' }).min(1),
    cropType: z.enum(['wheat', 'carrot', 'potato', 'beetroot', 'nether_wart'], { invalid_type_error: 'Select crop type' }),
    growthTime: z.number({ invalid_type_error: 'Enter growth time' }).min(1),
    bonemealUsage: z.boolean().optional(),
    fortuneLevel: z.number({ invalid_type_error: 'Enter fortune level' }).min(0).max(3).optional(),
    timePeriod: z.number({ invalid_type_error: 'Enter time period' }).min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    farmSize: number;
    cropType: string;
    growthTime: number;
    bonemealUsage: boolean;
    fortuneLevel: number;
    timePeriod: number;
    baseYield: number;
    fortuneMultiplier: number;
    bonemealBonus: number;
    totalYield: number;
    yieldPerHour: number;
    yieldPerDay: number;
    efficiency: number;
    status: 'low-yield' | 'moderate-yield' | 'high-yield' | 'very-high-yield';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

// Crop-specific base yields (items per harvest per block)
const cropYields: Record<string, number> = {
    wheat: 1,
    carrot: 1,
    potato: 1,
    beetroot: 1,
    nether_wart: 2,
};

const calculateResult = (values: FormValues): ResultPayload => {
    const farmSize = values.farmSize;
    const cropType = values.cropType;
    const growthTime = values.growthTime;
    const bonemealUsage = values.bonemealUsage ?? false;
    const fortuneLevel = values.fortuneLevel ?? 0;
    const timePeriod = values.timePeriod ?? 1;

    // Base yield per block
    const baseYieldPerBlock = cropYields[cropType] || 1;

    // Fortune multipliers
    const fortuneMultipliers: Record<number, number> = {
        0: 1.0,
        1: 1.33,
        2: 1.67,
        3: 2.0,
    };
    const fortuneMultiplier = fortuneMultipliers[fortuneLevel] || 1.0;

    // Base yield (per harvest cycle)
    const baseYield = farmSize * baseYieldPerBlock;

    // Total yield with Fortune
    const totalYield = baseYield * fortuneMultiplier;

    // Bonemeal bonus (if using bonemeal, growth time is effectively 0, allowing instant re-harvesting)
    // For calculation purposes, we'll treat bonemeal as reducing effective growth time
    const effectiveGrowthTime = bonemealUsage ? 0.1 : growthTime; // 0.1 minutes for bonemeal (instant)
    const bonemealBonus = bonemealUsage ? (growthTime / effectiveGrowthTime) : 1;

    // Yield per hour
    const cyclesPerHour = effectiveGrowthTime > 0 ? 60 / effectiveGrowthTime : 600; // Cap at 600 cycles/hour for bonemeal
    const yieldPerHour = totalYield * cyclesPerHour;

    // Yield per day (24 hours)
    const yieldPerDay = yieldPerHour * 24;

    // Efficiency (yield per block per hour)
    const efficiency = farmSize > 0 ? yieldPerHour / farmSize : 0;

    let status: ResultPayload['status'] = 'moderate-yield';
    let interpretation = 'Your farm yield has been calculated based on farm size, crop type, growth conditions, and enchantments.';

    if (yieldPerHour >= 1000) {
        status = 'very-high-yield';
        interpretation = `Very high yield! Your farm produces ${yieldPerHour.toFixed(0)} items per hour. This is an extremely efficient farm with excellent production rates.`;
    } else if (yieldPerHour >= 500) {
        status = 'high-yield';
        interpretation = `High yield! Your farm produces ${yieldPerHour.toFixed(0)} items per hour. This is an efficient farm with strong production rates.`;
    } else if (yieldPerHour >= 200) {
        status = 'moderate-yield';
        interpretation = `Moderate yield. Your farm produces ${yieldPerHour.toFixed(0)} items per hour. This is a functional farm with decent production rates.`;
    } else {
        status = 'low-yield';
        interpretation = `Lower yield. Your farm produces ${yieldPerHour.toFixed(0)} items per hour. Consider optimizing farm size, growth time, or using Fortune enchantment to increase yields.`;
    }

    const recommendations = [
        `Farm Size: ${farmSize} blocks. ${farmSize >= 200 ? 'Large farm - excellent production capacity.' : farmSize >= 100 ? 'Medium farm - good production capacity.' : farmSize >= 50 ? 'Small to medium farm - decent production.' : 'Small farm - consider expanding for better yields.'}`,
        `Crop Type: ${cropType.charAt(0).toUpperCase() + cropType.slice(1)} (${baseYieldPerBlock} base yield per block). ${cropType === 'nether_wart' ? 'Nether Wart has higher base yield (2 per block).' : 'Standard crop yield (1 per block).'}`,
        `Growth Time: ${growthTime} minutes. ${growthTime <= 10 ? 'Fast growth - excellent for high yields.' : growthTime <= 30 ? 'Moderate growth - reasonable yields.' : 'Slow growth - consider using bonemeal or optimizing conditions for faster growth.'}`,
        `Fortune Level: ${fortuneLevel} (${fortuneMultiplier}x multiplier). ${fortuneLevel >= 3 ? 'Fortune III - maximum yield multiplier (2x).' : fortuneLevel >= 2 ? 'Fortune II - good yield multiplier (1.67x).' : fortuneLevel >= 1 ? 'Fortune I - moderate yield multiplier (1.33x).' : 'No Fortune - consider using Fortune enchantment for 2x yields.'}`,
        `Total Yield: ${totalYield.toFixed(0)} items per harvest cycle. ${totalYield >= 500 ? 'Excellent yield per cycle.' : totalYield >= 200 ? 'Good yield per cycle.' : 'Moderate yield per cycle - consider expanding farm or using Fortune.'}`,
        `Yield Per Hour: ${yieldPerHour.toFixed(0)} items/hour. ${yieldPerHour >= 1000 ? 'Exceptional production rate - very efficient farm.' : yieldPerHour >= 500 ? 'High production rate - efficient farm.' : yieldPerHour >= 200 ? 'Moderate production rate - functional farm.' : 'Lower production rate - consider optimizations.'}`,
    ];

    if (bonemealUsage) {
        recommendations.push(`Bonemeal Usage: Active. Bonemeal eliminates growth time, allowing instant re-harvesting and dramatically increasing yield per hour. This is the most effective method for maximizing production rates.`);
    } else {
        recommendations.push(`Bonemeal Usage: Not active. Consider using bonemeal for instant growth and maximum yield per hour. Bonemeal is especially effective for high-value crops or when time is limited.`);
    }

    if (yieldPerHour < 200) {
        recommendations.push('Yield Optimization: To increase yields, consider: expanding farm size, using Fortune III enchantment (2x yields), using bonemeal for instant growth, optimizing growth conditions (water, light), and automating harvesting for continuous production.');
    }

    const plan = [
        {
            label: 'This Week',
            detail: `Optimize farm: ${farmSize} blocks, ${yieldPerHour.toFixed(0)} items/hour. ${yieldPerHour >= 500 ? 'Excellent production - maintain current setup.' : 'Focus on: expanding farm size, obtaining Fortune III, or using bonemeal for better yields.'}`
        },
        {
            label: 'This Month',
            detail: 'Improve farm efficiency: test different crop types, optimize farm layout, implement automation, compare yields with different Fortune levels, and track production rates to identify optimization opportunities.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize farm production: maintain Fortune III enchantment, use bonemeal for maximum yields, expand farm size as needed, automate harvesting, optimize growth conditions, and track yields to ensure optimal performance.'
        },
    ];

    return {
        farmSize,
        cropType,
        growthTime,
        bonemealUsage,
        fortuneLevel,
        timePeriod,
        baseYield,
        fortuneMultiplier,
        bonemealBonus,
        totalYield,
        yieldPerHour,
        yieldPerDay,
        efficiency,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function MinecraftFarmYieldCalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            farmSize: undefined,
            cropType: undefined,
            growthTime: undefined,
            bonemealUsage: false,
            fortuneLevel: undefined,
            timePeriod: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5" />
                        Minecraft Farm Yield Calculator
                    </CardTitle>
                    <CardDescription>Calculate crop yields, resource production rates, and farm efficiency for Minecraft farms based on farm size, crop type, and growth conditions.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Input your farm information</CardTitle>
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
                                    name="farmSize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Farm Size (number of crop blocks)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="cropType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Crop Type</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value as 'wheat' | 'carrot' | 'potato' | 'beetroot' | 'nether_wart')}
                                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                                >
                                                    <option value="">Select crop type</option>
                                                    <option value="wheat">Wheat (1 base yield)</option>
                                                    <option value="carrot">Carrot (1 base yield)</option>
                                                    <option value="potato">Potato (1 base yield)</option>
                                                    <option value="beetroot">Beetroot (1 base yield)</option>
                                                    <option value="nether_wart">Nether Wart (2 base yield)</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="growthTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Growth Time (minutes)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fortuneLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fortune Level (0-3, optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 3" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bonemealUsage"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <input
                                                    type="checkbox"
                                                    checked={field.value ?? false}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                            </FormControl>
                                            <FormLabel className="!mt-0">Using Bonemeal (Instant Growth)</FormLabel>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="timePeriod"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Time Period (hours, optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 24" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Farm Yield
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
                        <CardDescription>See total yield, yield per hour/day, efficiency, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Total Yield</p>
                                <p className="text-2xl font-semibold text-primary">{result.totalYield.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">Items per harvest</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Yield Per Hour</p>
                                <p className="text-2xl font-semibold text-primary">{result.yieldPerHour.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">Items/hour</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Yield Per Day</p>
                                <p className="text-2xl font-semibold text-primary">{result.yieldPerDay.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">Items/day</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Efficiency</p>
                                <p className="text-xl font-semibold text-primary">{result.efficiency.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Items/block/hour</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Fortune Multiplier</p>
                                <p className="text-xl font-semibold text-primary">{result.fortuneMultiplier}x</p>
                                <p className="text-xs text-muted-foreground">Level {result.fortuneLevel}</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Bonemeal</p>
                                <p className="text-xl font-semibold text-primary">{result.bonemealUsage ? 'Active' : 'Inactive'}</p>
                                <p className="text-xs text-muted-foreground">{result.bonemealUsage ? 'Instant growth' : 'Natural growth'}</p>
                            </div>
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
                        <strong>Base Yield</strong> = Farm Size × Base Yield Per Block. This calculates the base yield per harvest cycle. Different crops have different base yields: Wheat/Carrot/Potato/Beetroot = 1 per block, Nether Wart = 2 per block.
                    </p>
                    <p>
                        <strong>Fortune Multiplier</strong> = Multiplier based on Fortune level (Fortune I = 1.33x, Fortune II = 1.67x, Fortune III = 2.0x). Fortune enchantment significantly increases yields, especially for crops that can drop multiple items. Always use Fortune III when possible for maximum yields.
                    </p>
                    <p>
                        <strong>Total Yield</strong> = Base Yield × Fortune Multiplier. This calculates the total yield per harvest cycle after applying Fortune enchantment. Higher Fortune levels dramatically increase yields.
                    </p>
                    <p>
                        <strong>Cycles Per Hour</strong> = 60 / Growth Time (minutes). This calculates how many harvest cycles can occur per hour. Faster growth times (or bonemeal usage) allow more cycles, increasing yield per hour significantly.
                    </p>
                    <p>
                        <strong>Yield Per Hour</strong> = Total Yield × Cycles Per Hour. This calculates total items produced per hour. This is the key metric for evaluating farm production rates and efficiency.
                    </p>
                    <p>
                        <strong>Yield Per Day</strong> = Yield Per Hour × 24. This calculates total items produced per day (24 hours). Useful for long-term production planning and resource management.
                    </p>
                    <p>
                        <strong>Efficiency</strong> = Yield Per Hour / Farm Size. This measures yield per block per hour, helping compare different farm designs and optimize resource utilization. Higher efficiency means better resource utilization.
                    </p>
                    <p>These formulas help you understand farm yields, calculate production rates, and optimize farm performance. Use Fortune III and bonemeal for maximum yields, and optimize growth conditions to reduce growth time and increase production rates.</p>
                </CardContent>
            </Card>
        </div>
    );
}
