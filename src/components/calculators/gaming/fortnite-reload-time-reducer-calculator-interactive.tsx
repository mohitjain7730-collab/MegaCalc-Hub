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
    baseReloadTime: z.number({ invalid_type_error: 'Enter base reload time' }).min(0),
    reloadSpeedModifier: z.number({ invalid_type_error: 'Enter reload speed modifier' }).min(0).max(100).optional(),
    reloadSpeedPercentage: z.number({ invalid_type_error: 'Enter reload speed percentage' }).min(0).max(100).optional(),
    magazineSize: z.number({ invalid_type_error: 'Enter magazine size' }).min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    baseReloadTime: number;
    reloadSpeedModifier: number;
    reloadSpeedPercentage: number;
    magazineSize: number;
    reducedReloadTime: number;
    timeSaved: number;
    reloadSpeedImprovement: number;
    effectiveDPSIncrease: number;
    reloadsPerMinute: number;
    status: 'minimal-improvement' | 'moderate-improvement' | 'significant-improvement' | 'major-improvement';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const baseReloadTime = values.baseReloadTime;
    const reloadSpeedModifier = values.reloadSpeedModifier ?? 0;
    const reloadSpeedPercentage = values.reloadSpeedPercentage ?? 0;
    const magazineSize = values.magazineSize ?? 0;

    // Calculate effective reload speed increase
    // If both are provided, use the higher one, or combine them
    const effectiveSpeedIncrease = Math.max(reloadSpeedModifier, reloadSpeedPercentage);

    // Reduced reload time = base time / (1 + speed increase / 100)
    const reducedReloadTime = baseReloadTime / (1 + effectiveSpeedIncrease / 100);

    // Time saved per reload
    const timeSaved = baseReloadTime - reducedReloadTime;

    // Reload speed improvement percentage
    const reloadSpeedImprovement = baseReloadTime > 0 ? (timeSaved / baseReloadTime) * 100 : 0;

    // Effective DPS increase (approximate, depends on fire rate and damage)
    // This is a rough estimate: DPS increase ≈ (Time Saved / (Time to Empty + Reload Time)) × 100
    // For a typical weapon: assume 2 seconds to empty, then calculate impact
    const timeToEmpty = magazineSize > 0 ? magazineSize / 5 : 2; // Assume 5 shots per second average
    const cycleTimeOriginal = timeToEmpty + baseReloadTime;
    const cycleTimeReduced = timeToEmpty + reducedReloadTime;
    const effectiveDPSIncrease = cycleTimeOriginal > 0 ? ((cycleTimeOriginal - cycleTimeReduced) / cycleTimeOriginal) * 100 : 0;

    // Reloads per minute (if magazine size provided)
    const reloadsPerMinute = reducedReloadTime > 0 ? 60 / (timeToEmpty + reducedReloadTime) : 0;

    let status: ResultPayload['status'] = 'moderate-improvement';
    let interpretation = 'Your reload time reduction has been calculated based on base reload time and speed modifiers.';

    if (reloadSpeedImprovement >= 40) {
        status = 'major-improvement';
        interpretation = `Major improvement! Reload time reduced by ${reloadSpeedImprovement.toFixed(1)}% (${timeSaved.toFixed(2)}s saved). This is a significant improvement that dramatically increases effective DPS and combat effectiveness.`;
    } else if (reloadSpeedImprovement >= 25) {
        status = 'significant-improvement';
        interpretation = `Significant improvement! Reload time reduced by ${reloadSpeedImprovement.toFixed(1)}% (${timeSaved.toFixed(2)}s saved). This provides substantial benefits for combat effectiveness and sustained DPS.`;
    } else if (reloadSpeedImprovement >= 15) {
        status = 'moderate-improvement';
        interpretation = `Moderate improvement. Reload time reduced by ${reloadSpeedImprovement.toFixed(1)}% (${timeSaved.toFixed(2)}s saved). This provides noticeable benefits for combat effectiveness.`;
    } else {
        status = 'minimal-improvement';
        interpretation = `Minimal improvement. Reload time reduced by ${reloadSpeedImprovement.toFixed(1)}% (${timeSaved.toFixed(2)}s saved). Consider higher reload speed modifiers for more significant improvements.`;
    }

    const recommendations = [
        `Base Reload Time: ${baseReloadTime.toFixed(2)} seconds. ${baseReloadTime >= 3 ? 'Slow reloading weapon - reload speed improvements are very valuable.' : baseReloadTime >= 2 ? 'Moderate reload time - improvements are valuable.' : 'Fast reloading weapon - improvements are still beneficial but less critical.'}`,
        `Reduced Reload Time: ${reducedReloadTime.toFixed(2)} seconds (${effectiveSpeedIncrease > 0 ? `${effectiveSpeedIncrease.toFixed(1)}% speed increase` : 'no modifier'}). ${reducedReloadTime < baseReloadTime * 0.7 ? 'Excellent reduction - reload time significantly improved.' : reducedReloadTime < baseReloadTime * 0.85 ? 'Good reduction - noticeable improvement.' : 'Moderate reduction - some improvement but could be better.'}`,
        `Time Saved: ${timeSaved.toFixed(2)} seconds per reload. ${timeSaved >= 1 ? 'Significant time savings - very valuable for combat.' : timeSaved >= 0.5 ? 'Moderate time savings - valuable for combat.' : 'Small time savings - still beneficial but limited impact.'}`,
        `Reload Speed Improvement: ${reloadSpeedImprovement.toFixed(1)}%. ${reloadSpeedImprovement >= 30 ? 'Excellent improvement - major combat advantage.' : reloadSpeedImprovement >= 20 ? 'Good improvement - significant combat advantage.' : reloadSpeedImprovement >= 10 ? 'Moderate improvement - noticeable combat advantage.' : 'Minimal improvement - consider higher modifiers.'}`,
    ];

    if (magazineSize > 0) {
        recommendations.push(`Effective DPS Increase: ${effectiveDPSIncrease.toFixed(1)}% (estimated). ${effectiveDPSIncrease >= 15 ? 'Significant DPS increase - major combat advantage.' : effectiveDPSIncrease >= 10 ? 'Good DPS increase - noticeable combat advantage.' : 'Moderate DPS increase - some combat advantage.'}`);
        recommendations.push(`Reloads Per Minute: ${reloadsPerMinute.toFixed(1)} (estimated). ${reloadsPerMinute >= 20 ? 'Very frequent reloads - reload speed is critical.' : reloadsPerMinute >= 15 ? 'Frequent reloads - reload speed is important.' : 'Moderate reload frequency - reload speed is beneficial.'}`);
    }

    recommendations.push(`Weapon Assessment: ${status.replace('-', ' ').toUpperCase()}. ${reloadSpeedImprovement >= 25 ? 'Excellent reload speed improvement - prioritize this weapon/modifier combination for sustained combat.' : reloadSpeedImprovement >= 15 ? 'Good reload speed improvement - valuable for combat effectiveness.' : 'Moderate reload speed improvement - consider additional modifiers or different weapons for better performance.'}`);

    const plan = [
        {
            label: 'This Match',
            detail: `Optimize reload performance: base ${baseReloadTime.toFixed(2)}s, reduced to ${reducedReloadTime.toFixed(2)}s (${reloadSpeedImprovement.toFixed(1)}% improvement). ${reloadSpeedImprovement >= 20 ? 'Excellent reload speed - use this weapon/modifier combination.' : 'Consider additional reload speed improvements for better performance.'}`
        },
        {
            label: 'This Week',
            detail: 'Test reload speed improvements: compare weapons with different reload times, test reload speed modifiers, evaluate effective DPS improvements, and identify optimal reload speed configurations for different weapon types.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize reload performance: prioritize reload speed for weapons with small magazines, balance reload speed with other stats, use reload speed modifiers when available, and track reload performance to identify improvement opportunities.'
        },
    ];

    return {
        baseReloadTime,
        reloadSpeedModifier: reloadSpeedModifier || 0,
        reloadSpeedPercentage: reloadSpeedPercentage || 0,
        magazineSize,
        reducedReloadTime,
        timeSaved,
        reloadSpeedImprovement,
        effectiveDPSIncrease,
        reloadsPerMinute,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function FortniteReloadTimeReducerCalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            baseReloadTime: undefined,
            reloadSpeedModifier: undefined,
            reloadSpeedPercentage: undefined,
            magazineSize: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Input your weapon reload information</CardTitle>
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
                                    name="baseReloadTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Reload Time (seconds)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reloadSpeedModifier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reload Speed Modifier (0-100, optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 20" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reloadSpeedPercentage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reload Speed % Increase (0-100%, optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 25" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="magazineSize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Magazine Size (optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Reload Time Reduction
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
                        <CardDescription>See reduced reload time, time saved, improvement percentage, and DPS impact.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Reduced Reload Time</p>
                                <p className="text-2xl font-semibold text-primary">{result.reducedReloadTime.toFixed(2)}s</p>
                                <p className="text-xs text-muted-foreground">Seconds</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Time Saved</p>
                                <p className="text-2xl font-semibold text-primary">{result.timeSaved.toFixed(2)}s</p>
                                <p className="text-xs text-muted-foreground">Per reload</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Improvement</p>
                                <p className="text-2xl font-semibold text-primary">{result.reloadSpeedImprovement.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">Faster reload</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        {result.magazineSize > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded">
                                    <p className="text-sm text-muted-foreground">Effective DPS Increase</p>
                                    <p className="text-xl font-semibold text-primary">{result.effectiveDPSIncrease.toFixed(1)}%</p>
                                    <p className="text-xs text-muted-foreground">Estimated</p>
                                </div>
                                <div className="p-4 border rounded">
                                    <p className="text-sm text-muted-foreground">Reloads Per Minute</p>
                                    <p className="text-xl font-semibold text-primary">{result.reloadsPerMinute.toFixed(1)}</p>
                                    <p className="text-xs text-muted-foreground">Estimated</p>
                                </div>
                            </div>
                        )}
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
                        <strong>Reduced Reload Time</strong> = Base Reload Time / (1 + Reload Speed Increase / 100). This formula calculates the new reload time after applying reload speed modifiers. Higher speed increases result in proportionally faster reloads.
                    </p>
                    <p>
                        <strong>Time Saved</strong> = Base Reload Time - Reduced Reload Time. This shows how much time is saved per reload. Time saved directly contributes to increased effective DPS by reducing downtime between magazines.
                    </p>
                    <p>
                        <strong>Reload Speed Improvement</strong> = (Time Saved / Base Reload Time) × 100. This shows the percentage improvement in reload speed. Higher percentages indicate greater improvements and more significant combat advantages.
                    </p>
                    <p>
                        <strong>Effective DPS Increase</strong> = ((Original Cycle Time - Reduced Cycle Time) / Original Cycle Time) × 100, where Cycle Time = Time to Empty Magazine + Reload Time. This estimates how much effective DPS increases due to reduced reload time. Higher increases indicate more significant combat advantages.
                    </p>
                    <p>
                        <strong>Reloads Per Minute</strong> = 60 / (Time to Empty Magazine + Reduced Reload Time). This calculates how many complete reload cycles can occur per minute with the reduced reload time. More reloads per minute indicate better sustained DPS potential.
                    </p>
                    <p>These formulas help you understand reload time reductions, calculate time savings, and estimate DPS improvements. Use reload speed modifiers to optimize weapon performance and increase combat effectiveness.</p>
                </CardContent>
            </Card>
        </div>
    );
}
