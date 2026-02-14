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
    pyramidLevel: z.number({ invalid_type_error: 'Enter pyramid level' }).min(0).max(4),
    beaconLevel: z.number({ invalid_type_error: 'Enter beacon level' }).min(1).max(4),
    effectCount: z.number({ invalid_type_error: 'Enter effect count' }).min(1).max(2),
    baseRange: z.number({ invalid_type_error: 'Enter base range' }).min(20).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Base range for beacon (blocks)
const BASE_RANGE = 50;

// Range multipliers by pyramid level
const pyramidMultipliers: Record<number, number> = {
    0: 1,    // No pyramid
    1: 1.5,  // 1 layer (9 blocks)
    2: 2,    // 2 layers (34 blocks)
    3: 2.5,  // 3 layers (83 blocks)
    4: 3,    // 4 layers (164 blocks)
};

type ResultPayload = {
    pyramidLevel: number;
    beaconLevel: number;
    effectCount: number;
    baseRange: number;
    rangeMultiplier: number;
    effectiveRange: number;
    areaCoverage: number;
    blocksInRange: number;
    pyramidBlocks: number;
    status: 'limited' | 'moderate' | 'good' | 'excellent';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const pyramidLevel = values.pyramidLevel;
    const beaconLevel = values.beaconLevel;
    const effectCount = values.effectCount;
    const baseRange = values.baseRange ?? BASE_RANGE;

    // Range multiplier based on pyramid level
    const rangeMultiplier = pyramidMultipliers[pyramidLevel] || 1;

    // Effective range
    const effectiveRange = baseRange * rangeMultiplier;

    // Area coverage (circular area: π × r²)
    const areaCoverage = Math.PI * effectiveRange * effectiveRange;

    // Blocks in range (approximate, using area)
    const blocksInRange = Math.floor(areaCoverage);

    // Pyramid blocks required
    const pyramidBlocksMap: Record<number, number> = {
        0: 0,
        1: 9,    // 3x3
        2: 34,   // 5x5 + 3x3
        3: 83,   // 7x7 + 5x5 + 3x3
        4: 164,  // 9x9 + 7x7 + 5x5 + 3x3
    };
    const pyramidBlocks = pyramidBlocksMap[pyramidLevel] || 0;

    let status: ResultPayload['status'] = 'moderate';
    let interpretation = 'Your beacon range has been calculated based on pyramid level, beacon level, and effect count.';

    if (effectiveRange >= 125) {
        status = 'excellent';
        interpretation = `Excellent range! ${effectiveRange.toFixed(0)} blocks. This is maximum or near-maximum beacon range with excellent coverage area. Perfect for large-area effect coverage.`;
    } else if (effectiveRange >= 100) {
        status = 'good';
        interpretation = `Good range! ${effectiveRange.toFixed(0)} blocks. This provides substantial coverage area and is suitable for most applications. Great for base-wide effects.`;
    } else if (effectiveRange >= 75) {
        status = 'moderate';
        interpretation = `Moderate range. ${effectiveRange.toFixed(0)} blocks. This provides decent coverage area suitable for smaller bases or specific areas. Consider higher pyramid levels for more range.`;
    } else {
        status = 'limited';
        interpretation = `Limited range. ${effectiveRange.toFixed(0)} blocks. This provides basic coverage but may be insufficient for large areas. Consider building a pyramid to increase range significantly.`;
    }

    const recommendations = [
        `Pyramid Level: ${pyramidLevel} (${pyramidBlocks} blocks). ${pyramidLevel >= 4 ? 'Maximum pyramid - excellent range and 2 effects.' : pyramidLevel >= 3 ? 'Large pyramid - good range and 2 effects.' : pyramidLevel >= 2 ? 'Medium pyramid - moderate range and 1 effect.' : pyramidLevel >= 1 ? 'Small pyramid - basic range and 1 effect.' : 'No pyramid - base range only.'}`,
        `Beacon Level: ${beaconLevel}/4. ${beaconLevel >= 4 ? 'Maximum level - all effects available.' : beaconLevel >= 3 ? 'High level - most effects available.' : beaconLevel >= 2 ? 'Moderate level - some effects available.' : 'Basic level - limited effects available.'}`,
        `Effect Count: ${effectCount} effect(s). ${effectCount >= 2 ? 'Two effects enabled - can combine benefits like Speed + Haste.' : 'Single effect - choose most important effect for your needs.'}`,
        `Effective Range: ${effectiveRange.toFixed(0)} blocks. ${effectiveRange >= 125 ? 'Excellent range - covers very large areas.' : effectiveRange >= 100 ? 'Good range - covers large areas.' : effectiveRange >= 75 ? 'Moderate range - covers medium areas.' : 'Limited range - covers small areas.'}`,
        `Area Coverage: ${blocksInRange.toLocaleString()} blocks². ${blocksInRange >= 50000 ? 'Very large coverage - excellent for large bases.' : blocksInRange >= 30000 ? 'Large coverage - good for large bases.' : blocksInRange >= 15000 ? 'Moderate coverage - suitable for medium bases.' : 'Smaller coverage - suitable for small bases or specific areas.'}`,
    ];

    if (pyramidLevel < 4 && effectiveRange < 125) {
        recommendations.push(`Range Optimization: Current range is ${effectiveRange.toFixed(0)} blocks. To increase range: build higher pyramid levels (Level 3 = 125 blocks, Level 4 = 150 blocks), which also enable 2 effects at Level 3+. Higher pyramid levels significantly increase coverage area.`);
    }

    if (pyramidLevel < 3 && effectCount === 1) {
        recommendations.push(`Effect Optimization: Current pyramid allows 1 effect. To enable 2 effects, build Level 3+ pyramid (83+ blocks). Two effects allow combining benefits like Speed + Haste for maximum efficiency.`);
    }

    if (pyramidLevel === 0) {
        recommendations.push(`Pyramid Recommendation: No pyramid built. Building even a Level 1 pyramid (9 blocks) increases range to 75 blocks (1.5x). Consider building a pyramid to significantly increase beacon range and coverage.`);
    }

    const plan = [
        {
            label: 'This Session',
            detail: `Beacon range: ${effectiveRange.toFixed(0)} blocks, ${blocksInRange.toLocaleString()} blocks² coverage. ${effectiveRange >= 100 ? 'Excellent range for large-area coverage.' : effectiveRange >= 75 ? 'Good range for medium-area coverage.' : 'Consider building pyramid for more range.'}`
        },
        {
            label: 'This Week',
            detail: 'Optimize beacon setup: build higher pyramid levels for more range (Level 3-4 for maximum), enable 2 effects if needed (Level 3+), choose optimal effects for your needs, and position beacon centrally for maximum coverage.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize beacon coverage: build maximum pyramid (Level 4) for 150 block range, enable 2 effects for combined benefits, position beacons strategically for optimal coverage, and consider multiple beacons for very large areas.'
        },
    ];

    return {
        pyramidLevel,
        beaconLevel,
        effectCount,
        baseRange,
        rangeMultiplier,
        effectiveRange,
        areaCoverage,
        blocksInRange,
        pyramidBlocks,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function MinecraftBeaconRangeOptimizerInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pyramidLevel: undefined,
            beaconLevel: undefined,
            effectCount: undefined,
            baseRange: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5" />
                        Minecraft Beacon Range Optimizer
                    </CardTitle>
                    <CardDescription>Optimize beacon range and effect coverage in Minecraft based on beacon level, pyramid size, and effect combinations.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Input your beacon information</CardTitle>
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
                                    name="pyramidLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pyramid Level (0-4)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="0 = no pyramid, 4 = max" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="beaconLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Beacon Level (1-4)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 4" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="effectCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Effect Count (1-2)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="1 or 2 effects" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="baseRange"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Range (optional, defaults to 50 blocks)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Beacon Range
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
                        <CardDescription>See effective range, area coverage, blocks in range, pyramid requirements, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Effective Range</p>
                                <p className="text-2xl font-semibold text-primary">{result.effectiveRange.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">Blocks</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Area Coverage</p>
                                <p className="text-2xl font-semibold text-primary">{result.blocksInRange.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Blocks²</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Pyramid Blocks</p>
                                <p className="text-2xl font-semibold text-primary">{result.pyramidBlocks}</p>
                                <p className="text-xs text-muted-foreground">Blocks needed</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Range Multiplier</p>
                                <p className="text-xl font-semibold text-primary">{result.rangeMultiplier}x</p>
                                <p className="text-xs text-muted-foreground">Base range multiplier</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Beacon Level</p>
                                <p className="text-xl font-semibold text-primary">{result.beaconLevel}/4</p>
                                <p className="text-xs text-muted-foreground">{result.beaconLevel >= 4 ? 'Maximum' : 'Upgradeable'}</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Effect Count</p>
                                <p className="text-xl font-semibold text-primary">{result.effectCount}</p>
                                <p className="text-xs text-muted-foreground">{result.effectCount >= 2 ? 'Two effects' : 'Single effect'}</p>
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
                        <strong>Base Range</strong> = 50 blocks (default). This is the base beacon range without any pyramid. Beacons have a default range of 50 blocks in all directions.
                    </p>
                    <p>
                        <strong>Range Multiplier</strong> = Pyramid Level Multiplier. Level 0 (no pyramid) = 1x, Level 1 = 1.5x, Level 2 = 2x, Level 3 = 2.5x, Level 4 = 3x. Higher pyramid levels provide larger range multipliers.
                    </p>
                    <p>
                        <strong>Effective Range</strong> = Base Range × Range Multiplier. This calculates the actual beacon range based on pyramid level. For example, 50 blocks × 3 (Level 4) = 150 blocks maximum range.
                    </p>
                    <p>
                        <strong>Area Coverage</strong> = π × (Effective Range)². This calculates the circular area covered by beacon effects. Range increases dramatically increase coverage area (area scales with range squared). For example, 50 blocks = 7,854 blocks², 150 blocks = 70,686 blocks².
                    </p>
                    <p>
                        <strong>Pyramid Blocks</strong> = Sum of all pyramid layers. Level 1 = 9 blocks (3×3), Level 2 = 34 blocks (5×5 + 3×3), Level 3 = 83 blocks (7×7 + 5×5 + 3×3), Level 4 = 164 blocks (9×9 + 7×7 + 5×5 + 3×3). Higher levels require significantly more blocks.
                    </p>
                    <p>
                        <strong>Effect Count</strong> = 1 for Level 1-2 pyramids, 2 for Level 3-4 pyramids. Higher pyramid levels enable multiple effects, allowing combination of benefits like Speed + Haste or Regeneration + Resistance.
                    </p>
                    <p>These formulas help you understand beacon range, calculate coverage area, plan pyramid requirements, and optimize beacon placement. Build higher pyramid levels for maximum range and multiple effects.</p>
                </CardContent>
            </Card>
        </div>
    );
}
