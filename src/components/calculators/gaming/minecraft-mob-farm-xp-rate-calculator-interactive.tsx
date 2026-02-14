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
    mobType: z.enum(['zombie', 'skeleton', 'spider', 'creeper', 'enderman', 'blaze', 'guardian', 'witch'], { invalid_type_error: 'Select mob type' }),
    spawnRate: z.number({ invalid_type_error: 'Enter spawn rate' }).min(0.1),
    killRate: z.number({ invalid_type_error: 'Enter kill rate' }).min(0.1),
    xpPerMob: z.number({ invalid_type_error: 'Enter XP per mob' }).min(1).optional(),
    farmEfficiency: z.number({ invalid_type_error: 'Enter farm efficiency' }).min(0).max(100).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Base XP per mob type
const mobXP: Record<string, number> = {
    zombie: 5,
    skeleton: 5,
    spider: 5,
    creeper: 5,
    enderman: 5,
    blaze: 10,
    guardian: 10,
    witch: 5,
};

type ResultPayload = {
    mobType: string;
    spawnRate: number;
    killRate: number;
    xpPerMob: number;
    farmEfficiency: number;
    xpPerKill: number;
    xpPerMinute: number;
    xpPerHour: number;
    xpPerDay: number;
    mobsPerMinute: number;
    mobsPerHour: number;
    effectiveXPPerHour: number;
    status: 'low-rate' | 'moderate-rate' | 'high-rate' | 'very-high-rate';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const mobType = values.mobType;
    const spawnRate = values.spawnRate;
    const killRate = values.killRate;
    const xpPerMob = values.xpPerMob ?? mobXP[mobType] ?? 5;
    const farmEfficiency = values.farmEfficiency ?? 100;

    // XP per kill (base XP per mob)
    const xpPerKill = xpPerMob;

    // Effective kill rate (accounting for efficiency)
    const effectiveKillRate = killRate * (farmEfficiency / 100);

    // XP per minute
    const xpPerMinute = effectiveKillRate * xpPerKill;

    // XP per hour
    const xpPerHour = xpPerMinute * 60;

    // XP per day (24 hours)
    const xpPerDay = xpPerHour * 24;

    // Mobs per minute (actual kill rate)
    const mobsPerMinute = effectiveKillRate;

    // Mobs per hour
    const mobsPerHour = mobsPerMinute * 60;

    // Effective XP per hour (for display)
    const effectiveXPPerHour = xpPerHour;

    let status: ResultPayload['status'] = 'moderate-rate';
    let interpretation = 'Your mob farm XP generation rate has been calculated based on mob type, spawn rate, kill rate, and efficiency.';

    if (xpPerHour >= 5000) {
        status = 'very-high-rate';
        interpretation = `Very high XP rate! ${xpPerHour.toFixed(0)} XP/hour. This is an excellent mob farm with exceptional XP generation. Perfect for fast leveling and enchanting.`;
    } else if (xpPerHour >= 1000) {
        status = 'high-rate';
        interpretation = `High XP rate! ${xpPerHour.toFixed(0)} XP/hour. This is a good mob farm with strong XP generation. Great for efficient leveling.`;
    } else if (xpPerHour >= 200) {
        status = 'moderate-rate';
        interpretation = `Moderate XP rate. ${xpPerHour.toFixed(0)} XP/hour. This is a decent mob farm with reasonable XP generation. Suitable for regular leveling needs.`;
    } else {
        status = 'low-rate';
        interpretation = `Lower XP rate. ${xpPerHour.toFixed(0)} XP/hour. This farm may need optimization to improve XP generation. Consider improving spawn rates, kill rates, or efficiency.`;
    }

    const recommendations = [
        `Mob Type: ${mobType.charAt(0).toUpperCase() + mobType.slice(1)}. Base XP per mob: ${xpPerMob} XP. ${xpPerMob >= 10 ? 'High XP mob - excellent for XP generation.' : 'Standard XP mob - good for XP generation.'}`,
        `Spawn Rate: ${spawnRate.toFixed(1)} mobs/minute. ${spawnRate >= 20 ? 'High spawn rate - excellent for XP generation.' : spawnRate >= 10 ? 'Moderate spawn rate - good for XP generation.' : 'Lower spawn rate - consider improving farm design to increase spawns.'}`,
        `Kill Rate: ${killRate.toFixed(1)} kills/minute. ${killRate >= 20 ? 'High kill rate - excellent for XP generation.' : killRate >= 10 ? 'Moderate kill rate - good for XP generation.' : 'Lower kill rate - consider improving killing mechanism to increase kills.'}`,
        `Farm Efficiency: ${farmEfficiency}%. ${farmEfficiency >= 90 ? 'Excellent efficiency - nearly all mobs are killed.' : farmEfficiency >= 75 ? 'Good efficiency - most mobs are killed.' : 'Lower efficiency - consider improving farm design to reduce mob escapes.'}`,
        `XP Generation: ${xpPerHour.toFixed(0)} XP/hour. ${xpPerHour >= 5000 ? 'Exceptional rate - excellent for fast leveling.' : xpPerHour >= 1000 ? 'High rate - great for efficient leveling.' : xpPerHour >= 200 ? 'Moderate rate - decent for regular leveling.' : 'Lower rate - consider optimizing farm for better XP generation.'}`,
        `Mobs Killed: ${mobsPerHour.toFixed(0)} mobs/hour. ${mobsPerHour >= 1200 ? 'High kill volume - excellent farm performance.' : mobsPerHour >= 600 ? 'Moderate kill volume - good farm performance.' : 'Lower kill volume - consider improving kill rates.'}`,
    ];

    if (spawnRate > killRate) {
        recommendations.push(`Spawn vs Kill Rate: Spawn rate (${spawnRate.toFixed(1)}) exceeds kill rate (${killRate.toFixed(1)}). Consider improving killing mechanism to match spawn rate and maximize XP generation.`);
    } else if (killRate > spawnRate * 1.2) {
        recommendations.push(`Spawn vs Kill Rate: Kill rate (${killRate.toFixed(1)}) significantly exceeds spawn rate (${spawnRate.toFixed(1)}). Consider improving spawn rates to match kill capacity and maximize XP generation.`);
    }

    if (farmEfficiency < 80) {
        recommendations.push('Efficiency Optimization: Farm efficiency is below 80%. To improve: reduce mob escapes, optimize killing mechanism timing, improve farm design to prevent mobs from avoiding kills, and ensure proper mob pathfinding. Higher efficiency significantly increases XP generation.');
    }

    const plan = [
        {
            label: 'This Session',
            detail: `XP generation: ${xpPerHour.toFixed(0)} XP/hour, ${mobsPerHour.toFixed(0)} mobs/hour. ${xpPerHour >= 1000 ? 'Excellent rate - great for leveling.' : xpPerHour >= 200 ? 'Good rate - suitable for leveling.' : 'Consider optimizing farm for better rates.'}`
        },
        {
            label: 'This Week',
            detail: 'Optimize mob farm: improve spawn rates (better farm design, lighting, spawn platforms), increase kill rates (efficient killing mechanisms), improve efficiency (reduce mob escapes), and consider higher-XP mobs (blaze, guardian) if feasible.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize XP generation: monitor spawn and kill rates, maintain high efficiency, upgrade to better mob types when possible, automate killing for continuous XP, and track XP generation to identify optimization opportunities.'
        },
    ];

    return {
        mobType,
        spawnRate,
        killRate,
        xpPerMob,
        farmEfficiency,
        xpPerKill,
        xpPerMinute,
        xpPerHour,
        xpPerDay,
        mobsPerMinute,
        mobsPerHour,
        effectiveXPPerHour,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function MinecraftMobFarmXPRateCalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mobType: undefined,
            spawnRate: undefined,
            killRate: undefined,
            xpPerMob: undefined,
            farmEfficiency: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5" />
                        Minecraft Mob Farm XP Rate Calculator
                    </CardTitle>
                    <CardDescription>Calculate XP generation rates for Minecraft mob farms based on mob spawn rates, kill rates, and XP per mob.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Input your mob farm information</CardTitle>
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
                                    name="mobType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mob Type</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value as FormValues['mobType'])}
                                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                                >
                                                    <option value="">Select mob type</option>
                                                    <option value="zombie">Zombie (5 XP)</option>
                                                    <option value="skeleton">Skeleton (5 XP)</option>
                                                    <option value="spider">Spider (5 XP)</option>
                                                    <option value="creeper">Creeper (5 XP)</option>
                                                    <option value="enderman">Enderman (5 XP)</option>
                                                    <option value="blaze">Blaze (10 XP)</option>
                                                    <option value="guardian">Guardian (10 XP)</option>
                                                    <option value="witch">Witch (5 XP)</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="spawnRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Spawn Rate (mobs per minute)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="killRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kill Rate (kills per minute)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 14" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="xpPerMob"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>XP Per Mob (optional, defaults based on mob type)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="farmEfficiency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Farm Efficiency (0-100%, optional, defaults to 100%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 90" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate XP Rate
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
                        <CardDescription>See XP generation rates per minute/hour/day, mob kill rates, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">XP Per Hour</p>
                                <p className="text-2xl font-semibold text-primary">{result.xpPerHour.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">XP/hour</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">XP Per Day</p>
                                <p className="text-2xl font-semibold text-primary">{result.xpPerDay.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">XP/day</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Mobs Per Hour</p>
                                <p className="text-2xl font-semibold text-primary">{result.mobsPerHour.toFixed(0)}</p>
                                <p className="text-xs text-muted-foreground">Mobs/hour</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">XP Per Minute</p>
                                <p className="text-xl font-semibold text-primary">{result.xpPerMinute.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">XP/minute</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">XP Per Kill</p>
                                <p className="text-xl font-semibold text-primary">{result.xpPerKill}</p>
                                <p className="text-xs text-muted-foreground">XP per mob</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Farm Efficiency</p>
                                <p className="text-xl font-semibold text-primary">{result.farmEfficiency}%</p>
                                <p className="text-xs text-muted-foreground">{result.farmEfficiency >= 90 ? 'Excellent' : result.farmEfficiency >= 75 ? 'Good' : 'Needs improvement'}</p>
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
                        <strong>XP Per Kill</strong> = XP Per Mob (varies by mob type: 5 XP for most mobs, 10 XP for blaze/guardian). This is the base XP gained from killing one mob. Higher XP mobs provide more XP per kill.
                    </p>
                    <p>
                        <strong>Effective Kill Rate</strong> = Kill Rate × (Farm Efficiency / 100). This accounts for farm efficiency, calculating how many mobs are actually killed considering missed kills or inefficiencies. Higher efficiency means more effective kills.
                    </p>
                    <p>
                        <strong>XP Per Minute</strong> = Effective Kill Rate × XP Per Kill. This calculates XP generation per minute based on effective kill rate and XP per mob. Higher kill rates and XP per mob increase XP per minute.
                    </p>
                    <p>
                        <strong>XP Per Hour</strong> = XP Per Minute × 60. This calculates total XP generation per hour. Multiply hourly rate by 24 for daily rate. Higher rates mean faster leveling and enchanting.
                    </p>
                    <p>
                        <strong>Mobs Per Hour</strong> = Effective Kill Rate × 60. This calculates total mobs killed per hour. Useful for understanding farm performance and kill volume. Higher kill rates mean more mobs processed.
                    </p>
                    <p>
                        <strong>Farm Efficiency</strong> = (Actual Kills / Spawned Mobs) × 100. This measures how effectively the farm kills spawned mobs. 100% efficiency means all spawned mobs are killed. Lower efficiency accounts for mobs escaping or not being killed.
                    </p>
                    <p>These formulas help you understand XP generation rates, calculate farm performance, and optimize mob farms for maximum XP generation. Track spawn rates, kill rates, and efficiency to identify optimization opportunities.</p>
                </CardContent>
            </Card>
        </div>
    );
}
