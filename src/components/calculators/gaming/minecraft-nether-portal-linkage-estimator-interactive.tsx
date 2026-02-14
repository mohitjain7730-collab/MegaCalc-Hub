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
    overworldX: z.number({ invalid_type_error: 'Enter X coordinate' }),
    overworldY: z.number({ invalid_type_error: 'Enter Y coordinate' }).optional(),
    overworldZ: z.number({ invalid_type_error: 'Enter Z coordinate' }),
    netherX: z.number({ invalid_type_error: 'Enter nether X' }).optional(),
    netherY: z.number({ invalid_type_error: 'Enter nether Y' }).optional(),
    netherZ: z.number({ invalid_type_error: 'Enter nether Z' }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    overworldX: number;
    overworldY: number | undefined;
    overworldZ: number;
    netherX: number | undefined;
    netherY: number | undefined;
    netherZ: number | undefined;
    calculatedNetherX: number;
    calculatedNetherY: number | undefined;
    calculatedNetherZ: number;
    calculatedOverworldX: number;
    calculatedOverworldY: number | undefined;
    calculatedOverworldZ: number;
    distance: number | null;
    linkageStatus: 'exact' | 'close' | 'moderate' | 'far' | 'very-far';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const overworldX = values.overworldX;
    const overworldY = values.overworldY;
    const overworldZ = values.overworldZ;
    const netherX = values.netherX;
    const netherY = values.netherY;
    const netherZ = values.netherZ;

    // Calculate ideal Nether coordinates (divide X and Z by 8)
    const calculatedNetherX = overworldX / 8;
    const calculatedNetherY = overworldY; // Y coordinate stays the same
    const calculatedNetherZ = overworldZ / 8;

    // Calculate ideal Overworld coordinates from Nether input (multiply X and Z by 8)
    const calculatedOverworldX = (netherX !== undefined ? netherX : calculatedNetherX) * 8;
    const calculatedOverworldY = netherY !== undefined ? netherY : overworldY;
    const calculatedOverworldZ = (netherZ !== undefined ? netherZ : calculatedNetherZ) * 8;

    let distance: number | null = null;
    let linkageStatus: ResultPayload['linkageStatus'] = 'exact';
    let interpretation = 'Your portal linkage coordinates have been calculated based on standard 8:1 conversion.';

    // If Nether coordinates provided, check distance from ideal location
    if (netherX !== undefined && netherZ !== undefined) {
        // Distance in Nether (horizontal only for basic linkage check)
        const dx = netherX - calculatedNetherX;
        const dz = netherZ - calculatedNetherZ;
        distance = Math.sqrt(dx * dx + dz * dz);

        if (distance === 0) {
            linkageStatus = 'exact';
            interpretation = 'Perfect linkage! Your portal is exactly at the calculated coordinates.';
        } else if (distance <= 16) {
            linkageStatus = 'close';
            interpretation = `Close match. Your portal is ${distance.toFixed(1)} blocks away from ideal coordinates. Linkage should work correctly.`;
        } else if (distance <= 128) {
            linkageStatus = 'moderate';
            interpretation = `Linkage within range. Your portal is ${distance.toFixed(1)} blocks away. It should link, but check for other portals closer to the ideal spot.`;
        } else {
            linkageStatus = 'very-far'; // > 128 blocks
            interpretation = `Distance warning! Your portal is ${distance.toFixed(1)} blocks away. This is outside usual search range (128 blocks) and may not link correctly.`;
        }
    }

    const recommendations = [
        `Overworld Coordinates: (${overworldX}, ${overworldY !== undefined ? overworldY : 'Y'}, ${overworldZ}). This is your starting location.`,
        `Calculated Nether Coordinates: (${calculatedNetherX.toFixed(1)}, ${calculatedNetherY !== undefined ? calculatedNetherY : 'Y'}, ${calculatedNetherZ.toFixed(1)}). Build your portal here in the Nether for perfect linkage.`,
    ];

    if (netherX !== undefined && netherZ !== undefined && distance !== null) {
        recommendations.push(`Actual Nether Coordinates: (${netherX}, ${netherY !== undefined ? netherY : 'Y'}, ${netherZ}).`);
        recommendations.push(`Distance Deviation: ${distance.toFixed(1)} blocks horizontal. ${distance <= 16 ? 'Excellent precision.' : distance <= 128 ? 'Acceptable range (within 128 blocks).' : 'Too far - portal may not link.'}`);
    }

    if (distance !== null && distance > 128) {
        recommendations.push('Critical Warning: Your Nether portal is more than 128 blocks from the calculated ideal coordinates. The game searches 128 blocks around the target. Move your portal closer to ensure linkage.');
    }

    // Y-level advice
    if (netherY !== undefined && overworldY !== undefined && Math.abs(netherY - overworldY) > 20) {
        recommendations.push('Vertical Distance: Note that Y-level difference matters too. Ideally, keep Y-levels similar or ensure no other portals are closer in 3D space to prevent "wrong portal" connections.');
    }

    const plan = [
        {
            label: 'Build Phase',
            detail: `Go to Nether at (${Math.round(calculatedNetherX)}, ${calculatedNetherY !== undefined ? calculatedNetherY : 'same Y'}, ${Math.round(calculatedNetherZ)}) and build your portal.`
        },
        {
            label: 'Verification',
            detail: 'Light the portal and travel through. If it links back to your original Overworld portal, success! If it creates a new one, check coordinates again.'
        },
    ];

    if (distance !== null && distance > 16) {
        plan.push({
            label: 'Correction',
            detail: `Your current Nether portal is ${distance.toFixed(0)} blocks off. Consider moving it to (${Math.round(calculatedNetherX)}, ${calculatedNetherZ.toFixed(0)}) for tighter linkage.`
        });
    }

    return {
        overworldX,
        overworldY,
        overworldZ,
        netherX,
        netherY,
        netherZ,
        calculatedNetherX,
        calculatedNetherY,
        calculatedNetherZ,
        calculatedOverworldX,
        calculatedOverworldY,
        calculatedOverworldZ,
        distance,
        linkageStatus,
        interpretation,
        recommendations,
        plan,
    };
};

export default function MinecraftNetherPortalLinkageEstimatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            overworldX: undefined,
            overworldY: undefined,
            overworldZ: undefined,
            netherX: undefined,
            netherY: undefined,
            netherZ: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5" />
                        Minecraft Nether Portal Linkage Estimator
                    </CardTitle>
                    <CardDescription>Estimate nether portal linkage between overworld and nether coordinates based on standard 8:1 conversion.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Input Portal Coordinates</CardTitle>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm text-foreground">Overworld Coordinates</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="overworldX"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>X</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="overworldY"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Y (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="64" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="overworldZ"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Z</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="font-semibold text-sm text-foreground">Nether Coordinates (Optional)</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="netherX"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>X</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="netherY"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Y</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="64" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="netherZ"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Z</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Coordinates
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
                            Coordinate Results
                        </CardTitle>
                        <CardDescription>Optimal portal locations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 border rounded bg-muted/20">
                                <p className="text-sm font-medium text-foreground mb-2">Ideal Nether Location</p>
                                <div className="text-2xl font-bold text-primary flex gap-2">
                                    <span>X: {result.calculatedNetherX.toFixed(1)}</span>
                                    <span>Z: {result.calculatedNetherZ.toFixed(1)}</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Y: {result.calculatedNetherY !== undefined ? result.calculatedNetherY : 'Same as Overworld'}</p>
                            </div>

                            {result.distance !== null && (
                                <div className={`p-4 border rounded ${result.distance > 128 ? 'bg-red-50 dark:bg-red-950/20 border-red-200' : 'bg-muted/20'}`}>
                                    <p className="text-sm font-medium text-foreground mb-2">Distance Check</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className={`text-2xl font-bold ${result.distance > 128 ? 'text-red-500' : 'text-primary'}`}>
                                            {result.distance.toFixed(1)}
                                        </span>
                                        <span className="text-sm text-muted-foreground">blocks off</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 capitalize">{result.interpretation}</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        Coordinate Analysis
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
                                        Build Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                        {result.plan.map((step) => (
                                            <li key={step.label} className="flex flex-col gap-1">
                                                <span className="font-semibold text-foreground">{step.label}</span>
                                                <span>{step.detail}</span>
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
                        <strong>Nether Coordinates</strong> = Overworld Coordinates / 8. This applies to X and Z axes. The Y axis (height) remains 1:1, meaning Y=64 in Overworld corresponds to Y=64 in Nether.
                    </p>
                    <p>
                        <strong>Overworld Coordinates</strong> = Nether Coordinates × 8. Converting back from Nether simply multiplies X and Z by 8.
                    </p>
                    <p>
                        <strong>Linkage Distance</strong> = √((x₂-x₁)² + (z₂-z₁)²). The game searches for an active portal within a spherical(ish) range of 128 blocks from the ideal coordinates in the destination dimension.
                    </p>
                    <p>
                        <strong>Successful Link</strong> requires distance ≤ 128 blocks. If no portal exists within this range, the game creates a new one at the ideal coordinates.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
