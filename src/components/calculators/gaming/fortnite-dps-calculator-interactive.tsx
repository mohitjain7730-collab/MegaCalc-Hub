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
    baseDamage: z.number({ invalid_type_error: 'Enter base damage' }).min(0),
    fireRate: z.number({ invalid_type_error: 'Enter fire rate' }).min(0),
    headshotMultiplier: z.number({ invalid_type_error: 'Enter headshot multiplier' }).min(1).optional(),
    reloadTime: z.number({ invalid_type_error: 'Enter reload time' }).min(0).optional(),
    magazineSize: z.number({ invalid_type_error: 'Enter magazine size' }).min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    baseDamage: number;
    fireRate: number;
    headshotMultiplier: number;
    reloadTime: number;
    magazineSize: number;
    baseDPS: number;
    headshotDPS: number;
    timeToEmptyMagazine: number;
    effectiveDPS: number;
    damagePerMagazine: number;
    status: 'low-dps' | 'moderate-dps' | 'high-dps' | 'very-high-dps';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const baseDamage = values.baseDamage;
    const fireRate = values.fireRate;
    const headshotMultiplier = values.headshotMultiplier ?? 2.0;
    const reloadTime = values.reloadTime ?? 0;
    const magazineSize = values.magazineSize ?? 0;

    // Base DPS (damage per second without headshots or reloads)
    const baseDPS = baseDamage * fireRate;

    // Headshot DPS (assuming all shots are headshots)
    const headshotDPS = baseDamage * headshotMultiplier * fireRate;

    // Time to empty magazine (seconds)
    const timeToEmptyMagazine = magazineSize > 0 && fireRate > 0 ? magazineSize / fireRate : 0;

    // Damage per magazine
    const damagePerMagazine = baseDamage * (magazineSize > 0 ? magazineSize : 1);

    // Effective DPS (accounting for reload time)
    // If reload time and magazine size are provided, calculate effective DPS
    let effectiveDPS = baseDPS;
    if (reloadTime > 0 && magazineSize > 0 && timeToEmptyMagazine > 0) {
        const totalCycleTime = timeToEmptyMagazine + reloadTime;
        effectiveDPS = damagePerMagazine / totalCycleTime;
    }

    let status: ResultPayload['status'] = 'moderate-dps';
    let interpretation = 'Your weapon DPS has been calculated based on base damage, fire rate, and optional factors.';

    if (baseDPS >= 200) {
        status = 'very-high-dps';
        interpretation = `Very high DPS! Your weapon deals ${baseDPS.toFixed(1)} base DPS, making it extremely effective in combat. This weapon can eliminate enemies quickly and is ideal for aggressive playstyles.`;
    } else if (baseDPS >= 150) {
        status = 'high-dps';
        interpretation = `High DPS! Your weapon deals ${baseDPS.toFixed(1)} base DPS, making it very effective in combat. This weapon provides strong damage output and is suitable for most combat situations.`;
    } else if (baseDPS >= 100) {
        status = 'moderate-dps';
        interpretation = `Moderate DPS. Your weapon deals ${baseDPS.toFixed(1)} base DPS, providing decent damage output. This weapon is functional but may be outclassed by higher DPS options in direct combat.`;
    } else {
        status = 'low-dps';
        interpretation = `Lower DPS. Your weapon deals ${baseDPS.toFixed(1)} base DPS, which may be insufficient for fast eliminations. Consider using this weapon for specific situations or upgrading to higher DPS alternatives.`;
    }

    const recommendations = [
        `Base DPS: ${baseDPS.toFixed(1)} damage per second. ${baseDPS >= 200 ? 'Exceptional damage output - ideal for aggressive combat.' : baseDPS >= 150 ? 'Strong damage output - very effective in most situations.' : baseDPS >= 100 ? 'Decent damage output - functional but may be outclassed.' : 'Lower damage output - consider alternatives for direct combat.'}`,
        `Headshot DPS: ${headshotDPS.toFixed(1)} damage per second (${headshotMultiplier}x multiplier). ${headshotDPS >= 400 ? 'Extremely high headshot damage - prioritize headshots for maximum effectiveness.' : headshotDPS >= 300 ? 'Very high headshot damage - headshots significantly increase effectiveness.' : 'Moderate headshot damage - headshots provide meaningful damage boost.'}`,
    ];

    if (reloadTime > 0 && magazineSize > 0) {
        recommendations.push(`Time to Empty Magazine: ${timeToEmptyMagazine.toFixed(2)} seconds (${magazineSize} rounds). ${timeToEmptyMagazine > 5 ? 'Large magazine provides extended firing time.' : timeToEmptyMagazine > 3 ? 'Moderate magazine size - plan reloads strategically.' : 'Small magazine - frequent reloads required.'}`);
        recommendations.push(`Damage Per Magazine: ${damagePerMagazine.toFixed(0)} total damage. ${damagePerMagazine >= 1000 ? 'High magazine damage - can eliminate multiple enemies.' : damagePerMagazine >= 500 ? 'Moderate magazine damage - sufficient for 1-2 eliminations.' : 'Lower magazine damage - may require multiple magazines per elimination.'}`);
        recommendations.push(`Effective DPS: ${effectiveDPS.toFixed(1)} damage per second (accounting for reload). ${effectiveDPS >= baseDPS * 0.9 ? 'Reload time has minimal impact on sustained DPS.' : effectiveDPS >= baseDPS * 0.7 ? 'Reload time moderately reduces sustained DPS.' : 'Reload time significantly reduces sustained DPS - consider faster reloads or larger magazines.'}`);
    } else {
        recommendations.push('Reload time and magazine size not provided. Effective DPS calculation requires these values for accurate sustained damage assessment.');
    }

    recommendations.push(`Weapon Assessment: ${status.replace('-', ' ').replace('dps', 'DPS').toUpperCase()}. ${baseDPS >= 200 ? 'This weapon excels in direct combat and aggressive playstyles. Use it as your primary weapon for engagements.' : baseDPS >= 150 ? 'This weapon is strong and versatile. Use it as a primary or secondary weapon depending on situation.' : baseDPS >= 100 ? 'This weapon is functional but may be outclassed. Consider it as a backup or for specific situations.' : 'This weapon has lower damage output. Use it for specific situations or consider alternatives.'}`);

    const plan = [
        {
            label: 'This Week',
            detail: `Master weapon handling: base DPS ${baseDPS.toFixed(1)}, headshot DPS ${headshotDPS.toFixed(1)}. ${baseDPS >= 150 ? 'Focus on aggressive engagements and direct combat.' : 'Practice accuracy and positioning to maximize effectiveness.'}`
        },
        {
            label: 'This Month',
            detail: 'Compare DPS across different weapons and rarities. Test weapons in various combat scenarios. Identify which weapons work best for your playstyle and adjust loadout accordingly.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize loadout: use DPS calculations to compare weapons, balance DPS with accuracy and range, adapt to meta changes, and practice with high-DPS weapons to maximize effectiveness in combat.'
        },
    ];

    return {
        baseDamage,
        fireRate,
        headshotMultiplier,
        reloadTime: reloadTime || 0,
        magazineSize: magazineSize || 0,
        baseDPS,
        headshotDPS,
        timeToEmptyMagazine,
        effectiveDPS,
        damagePerMagazine,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function FortniteDPSCalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            baseDamage: undefined,
            fireRate: undefined,
            headshotMultiplier: undefined,
            reloadTime: undefined,
            magazineSize: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Input your weapon information</CardTitle>
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
                                    name="baseDamage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Damage per Shot</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fireRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fire Rate (shots per second)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 5.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="headshotMultiplier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Headshot Multiplier (optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 2.0 (default)" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="reloadTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reload Time (seconds, optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 2.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
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
                                Calculate DPS
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
                        <CardDescription>See base DPS, headshot DPS, effective DPS, and weapon recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Base DPS</p>
                                <p className="text-2xl font-semibold text-primary">{result.baseDPS.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">Damage per second</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Headshot DPS</p>
                                <p className="text-2xl font-semibold text-primary">{result.headshotDPS.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">DPS (all headshots)</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Effective DPS</p>
                                <p className="text-2xl font-semibold text-primary">{result.effectiveDPS.toFixed(1)}</p>
                                <p className="text-xs text-muted-foreground">DPS (with reload)</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ').replace('dps', 'DPS')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        {result.magazineSize > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border rounded">
                                    <p className="text-sm text-muted-foreground">Time to Empty Magazine</p>
                                    <p className="text-xl font-semibold text-primary">{result.timeToEmptyMagazine.toFixed(2)}s</p>
                                    <p className="text-xs text-muted-foreground">{result.magazineSize} rounds</p>
                                </div>
                                <div className="p-4 border rounded">
                                    <p className="text-sm text-muted-foreground">Damage Per Magazine</p>
                                    <p className="text-xl font-semibold text-primary">{result.damagePerMagazine.toFixed(0)}</p>
                                    <p className="text-xs text-muted-foreground">Total damage</p>
                                </div>
                                <div className="p-4 border rounded">
                                    <p className="text-sm text-muted-foreground">Reload Time</p>
                                    <p className="text-xl font-semibold text-primary">{result.reloadTime.toFixed(1)}s</p>
                                    <p className="text-xs text-muted-foreground">Seconds</p>
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
                        <strong>Base DPS</strong> = Base Damage × Fire Rate. This is the fundamental damage per second calculation, representing damage output during continuous firing without accounting for headshots, reloads, or other factors.
                    </p>
                    <p>
                        <strong>Headshot DPS</strong> = Base Damage × Headshot Multiplier × Fire Rate. This calculates potential damage if all shots hit the head. Most Fortnite weapons have a 2.0x headshot multiplier, effectively doubling damage on headshots.
                    </p>
                    <p>
                        <strong>Time to Empty Magazine</strong> = Magazine Size / Fire Rate. This shows how long it takes to fire all rounds in a magazine. Larger magazines and slower fire rates result in longer firing times.
                    </p>
                    <p>
                        <strong>Damage Per Magazine</strong> = Base Damage × Magazine Size. This represents total damage output from a full magazine. Useful for understanding burst damage potential and elimination capability.
                    </p>
                    <p>
                        <strong>Effective DPS</strong> = Damage Per Magazine / (Time to Empty Magazine + Reload Time). This accounts for reload time, providing a more realistic sustained damage output over extended periods. Effective DPS is lower than base DPS due to reload downtime.
                    </p>
                    <p>These formulas help you understand weapon damage output, compare weapons, and make informed loadout decisions. Base DPS shows raw damage potential, while effective DPS shows realistic sustained damage accounting for reloads.</p>
                </CardContent>
            </Card>
        </div>
    );
}
