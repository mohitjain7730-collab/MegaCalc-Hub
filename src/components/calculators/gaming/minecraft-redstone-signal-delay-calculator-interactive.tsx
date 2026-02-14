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
    repeaterCount: z.number({ invalid_type_error: 'Enter repeater count' }).min(0),
    tickDelay: z.number({ invalid_type_error: 'Enter tick delay' }).min(1).max(4).optional(),
    additionalDelay: z.number({ invalid_type_error: 'Enter additional delay' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    repeaterCount: number;
    tickDelay: number;
    additionalDelay: number;
    delayPerRepeater: number;
    totalRepeaterDelay: number;
    totalDelay: number;
    delayInSeconds: number;
    delayInRedstoneTicks: number;
    status: 'instant' | 'fast' | 'moderate' | 'slow' | 'very-slow';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const repeaterCount = values.repeaterCount;
    const tickDelay = values.tickDelay ?? 1;
    const additionalDelay = values.additionalDelay ?? 0;

    // Delay per repeater (in ticks)
    const delayPerRepeater = tickDelay;

    // Total delay from repeaters
    const totalRepeaterDelay = repeaterCount * delayPerRepeater;

    // Total delay (repeaters + additional)
    const totalDelay = totalRepeaterDelay + additionalDelay;

    // Delay in seconds (1 tick = 0.1 seconds)
    const delayInSeconds = totalDelay * 0.1;

    // Delay in redstone ticks (same as totalDelay)
    const delayInRedstoneTicks = totalDelay;

    let status: ResultPayload['status'] = 'fast';
    let interpretation = 'Your redstone signal delay has been calculated based on repeater count, tick delay, and additional delay.';

    if (totalDelay === 0) {
        status = 'instant';
        interpretation = 'Instant signal. No delay detected. Signal travels immediately without repeaters or additional components.';
    } else if (totalDelay <= 2) {
        status = 'fast';
        interpretation = `Fast signal. ${totalDelay} tick(s) delay (${delayInSeconds.toFixed(2)} seconds). Very quick signal transmission suitable for responsive circuits.`;
    } else if (totalDelay <= 10) {
        status = 'moderate';
        interpretation = `Moderate delay. ${totalDelay} ticks (${delayInSeconds.toFixed(2)} seconds). Standard delay for most redstone circuits. Suitable for most applications.`;
    } else if (totalDelay <= 20) {
        status = 'slow';
        interpretation = `Slow signal. ${totalDelay} ticks (${delayInSeconds.toFixed(2)} seconds). Noticeable delay that may affect circuit responsiveness. Consider optimizing if speed is critical.`;
    } else {
        status = 'very-slow';
        interpretation = `Very slow signal. ${totalDelay} ticks (${delayInSeconds.toFixed(2)} seconds). Significant delay that may cause timing issues. Consider circuit optimization to reduce delay.`;
    }

    const recommendations = [
        `Repeater Count: ${repeaterCount} repeater(s). ${repeaterCount === 0 ? 'No repeaters - instant signal transmission.' : repeaterCount <= 3 ? 'Few repeaters - minimal delay.' : repeaterCount <= 10 ? 'Moderate repeater count - standard delay.' : 'Many repeaters - consider optimizing circuit to reduce count.'}`,
        `Tick Delay Per Repeater: ${tickDelay} tick(s) (${(tickDelay * 0.1).toFixed(2)} seconds). ${tickDelay === 1 ? 'Minimum delay - fastest repeater setting.' : tickDelay <= 2 ? 'Low delay - fast repeater setting.' : tickDelay <= 3 ? 'Moderate delay - standard repeater setting.' : 'Maximum delay - slowest repeater setting (4 ticks).'}`,
        `Total Repeater Delay: ${totalRepeaterDelay} ticks (${(totalRepeaterDelay * 0.1).toFixed(2)} seconds). ${totalRepeaterDelay === 0 ? 'No repeater delay.' : totalRepeaterDelay <= 5 ? 'Low repeater delay - fast circuit.' : totalRepeaterDelay <= 15 ? 'Moderate repeater delay - standard circuit.' : 'High repeater delay - consider reducing repeater count or tick delay.'}`,
        `Additional Delay: ${additionalDelay} tick(s) (${(additionalDelay * 0.1).toFixed(2)} seconds). ${additionalDelay === 0 ? 'No additional delay from other components.' : additionalDelay <= 5 ? 'Low additional delay.' : additionalDelay <= 15 ? 'Moderate additional delay.' : 'High additional delay - consider optimizing other components.'}`,
        `Total Delay: ${totalDelay} ticks (${delayInSeconds.toFixed(2)} seconds). ${totalDelay === 0 ? 'Instant signal - no delay.' : totalDelay <= 2 ? 'Very fast - excellent for responsive circuits.' : totalDelay <= 10 ? 'Fast to moderate - suitable for most circuits.' : totalDelay <= 20 ? 'Slow - may affect responsiveness.' : 'Very slow - consider circuit optimization.'}`,
    ];

    if (repeaterCount > 0 && tickDelay > 1) {
        recommendations.push(`Delay Optimization: Using ${tickDelay}-tick delay per repeater. Consider reducing to 1-tick delay for faster signal transmission, unless specific timing requirements need longer delays.`);
    }

    if (totalDelay > 20) {
        recommendations.push(`Circuit Optimization: High total delay (${totalDelay} ticks). To reduce delay: minimize repeater count, use 1-tick delay per repeater, optimize circuit design to reduce component count, and remove unnecessary delays. Lower delay improves circuit responsiveness.`);
    }

    if (repeaterCount === 0 && additionalDelay === 0) {
        recommendations.push('Signal Path: No delay components detected. Signal travels instantly. Add repeaters or other components if delay is needed for circuit timing.');
    }

    const plan = [
        {
            label: 'This Session',
            detail: `Signal delay: ${totalDelay} ticks (${delayInSeconds.toFixed(2)} seconds). ${totalDelay <= 2 ? 'Very fast - excellent for responsive circuits.' : totalDelay <= 10 ? 'Suitable delay for most circuits.' : 'Consider optimizing for faster response.'}`
        },
        {
            label: 'This Week',
            detail: 'Optimize redstone circuits: minimize repeater count when possible, use 1-tick delay for faster signals, optimize circuit design to reduce component count, and calculate delays for synchronization when needed.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize redstone timing: calculate delays for all signal paths, synchronize multiple signals by matching delays, optimize circuit design for minimal delay, and test timing to ensure proper circuit operation.'
        },
    ];

    return {
        repeaterCount,
        tickDelay,
        additionalDelay,
        delayPerRepeater,
        totalRepeaterDelay,
        totalDelay,
        delayInSeconds,
        delayInRedstoneTicks,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function MinecraftRedstoneSignalDelayCalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            repeaterCount: undefined,
            tickDelay: undefined,
            additionalDelay: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5" />
                        Minecraft Redstone Signal Delay Calculator
                    </CardTitle>
                    <CardDescription>Calculate redstone signal delay based on repeater count, tick delay per repeater, and total circuit delay.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Input your redstone circuit information</CardTitle>
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
                                    name="repeaterCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Repeater Count</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tickDelay"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tick Delay Per Repeater (1-4, optional, defaults to 1)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 1" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="additionalDelay"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Delay (ticks, optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 2" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Signal Delay
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
                        <CardDescription>See total signal delay in ticks and seconds, repeater delay breakdown, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Total Delay</p>
                                <p className="text-2xl font-semibold text-primary">{result.totalDelay}</p>
                                <p className="text-xs text-muted-foreground">Ticks</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Delay in Seconds</p>
                                <p className="text-2xl font-semibold text-primary">{result.delayInSeconds.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Seconds</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Repeater Delay</p>
                                <p className="text-2xl font-semibold text-primary">{result.totalRepeaterDelay}</p>
                                <p className="text-xs text-muted-foreground">Ticks</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Repeater Count</p>
                                <p className="text-xl font-semibold text-primary">{result.repeaterCount}</p>
                                <p className="text-xs text-muted-foreground">Repeaters</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Tick Delay Per Repeater</p>
                                <p className="text-xl font-semibold text-primary">{result.tickDelay}</p>
                                <p className="text-xs text-muted-foreground">Ticks</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Additional Delay</p>
                                <p className="text-xl font-semibold text-primary">{result.additionalDelay}</p>
                                <p className="text-xs text-muted-foreground">Ticks</p>
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
                        <strong>Delay Per Repeater</strong> = Tick Delay (1-4 ticks). Each repeater can delay signals by 1-4 ticks (right-click to adjust). 1 tick = 0.1 seconds. Minimum delay is 1 tick for fastest signal transmission.
                    </p>
                    <p>
                        <strong>Total Repeater Delay</strong> = Repeater Count × Tick Delay Per Repeater. This calculates total delay from all repeaters. For example, 5 repeaters at 2 ticks each = 10 ticks total repeater delay.
                    </p>
                    <p>
                        <strong>Total Delay</strong> = Total Repeater Delay + Additional Delay. This calculates complete signal delay including repeaters and other components (pistons, hoppers, comparators, etc.). Total delay determines signal transmission time.
                    </p>
                    <p>
                        <strong>Delay in Seconds</strong> = Total Delay × 0.1. This converts redstone ticks to seconds. 1 redstone tick = 0.1 seconds (10 ticks per second). Understanding seconds helps plan timing for real-world applications.
                    </p>
                    <p>
                        <strong>Delay in Redstone Ticks</strong> = Total Delay. This is the same as total delay, measured in redstone ticks. Redstone ticks are the standard unit for measuring redstone timing in Minecraft.
                    </p>
                    <p>These formulas help you understand redstone signal delay, calculate circuit timing, synchronize multiple signals, and optimize delay for responsive circuits. Minimize delay for faster signals, or add delay for specific timing requirements.</p>
                </CardContent>
            </Card>
        </div>
    );
}
