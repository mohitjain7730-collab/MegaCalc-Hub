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
    eliminations: z.number({ invalid_type_error: 'Enter eliminations' }).min(0),
    placement: z.number({ invalid_type_error: 'Enter placement' }).min(1),
    survivalTime: z.number({ invalid_type_error: 'Enter survival time' }).min(0).optional(),
    damageDealt: z.number({ invalid_type_error: 'Enter damage dealt' }).min(0).optional(),
    firstBlood: z.boolean().optional(),
    victoryRoyale: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    eliminations: number;
    placement: number;
    survivalTime: number;
    damageDealt: number;
    firstBlood: boolean;
    victoryRoyale: boolean;
    eliminationXP: number;
    placementXP: number;
    survivalXP: number;
    damageXP: number;
    bonusXP: number;
    totalXP: number;
    xpBySource: {
        source: string;
        xp: number;
        percentage: number;
    }[];
    status: 'low-xp' | 'moderate-xp' | 'high-xp' | 'very-high-xp';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

// XP values (approximate, may vary by season)
const ELIMINATION_XP = 50; // per elimination
const FIRST_BLOOD_BONUS = 25;
const VICTORY_ROYALE_BONUS = 300;

const calculateResult = (values: FormValues): ResultPayload => {
    const eliminations = values.eliminations;
    const placement = values.placement;
    const survivalTime = values.survivalTime ?? 0;
    const damageDealt = values.damageDealt ?? 0;
    const firstBlood = values.firstBlood ?? false;
    const victoryRoyale = values.victoryRoyale ?? false;

    // Elimination XP
    const eliminationXP = eliminations * ELIMINATION_XP;

    // Placement XP (scaled based on placement, higher placement = more XP)
    // Formula: Base placement XP scales inversely with placement number
    // Top 10 gets significant bonus, top 3 gets very high bonus, victory gets maximum
    let placementXP = 0;
    if (placement === 1) {
        placementXP = 300; // Victory Royale
    } else if (placement <= 3) {
        placementXP = 200 - (placement - 1) * 20; // Top 3: 200, 180, 160
    } else if (placement <= 10) {
        placementXP = 150 - (placement - 3) * 10; // Top 10: 140-150
    } else if (placement <= 25) {
        placementXP = 100 - (placement - 10) * 2; // Top 25: 70-100
    } else {
        placementXP = Math.max(10, 70 - (placement - 25) * 1); // Others: 10-70
    }

    // Survival time XP (bonus for longer survival)
    const survivalXP = Math.floor(survivalTime * 5); // 5 XP per minute of survival

    // Damage XP (bonus for high damage)
    const damageXP = damageDealt >= 500 ? Math.floor(damageDealt / 10) : 0; // 1 XP per 10 damage if 500+ damage

    // Bonus XP
    let bonusXP = 0;
    if (firstBlood) {
        bonusXP += FIRST_BLOOD_BONUS;
    }
    if (victoryRoyale) {
        bonusXP += VICTORY_ROYALE_BONUS;
    }

    // Total XP
    const totalXP = eliminationXP + placementXP + survivalXP + damageXP + bonusXP;

    // XP breakdown by source
    const xpBySource = [
        { source: 'Eliminations', xp: eliminationXP, percentage: totalXP > 0 ? (eliminationXP / totalXP) * 100 : 0 },
        { source: 'Placement', xp: placementXP, percentage: totalXP > 0 ? (placementXP / totalXP) * 100 : 0 },
        { source: 'Survival Time', xp: survivalXP, percentage: totalXP > 0 ? (survivalXP / totalXP) * 100 : 0 },
        { source: 'Damage Dealt', xp: damageXP, percentage: totalXP > 0 ? (damageXP / totalXP) * 100 : 0 },
        { source: 'Bonuses', xp: bonusXP, percentage: totalXP > 0 ? (bonusXP / totalXP) * 100 : 0 },
    ].filter(item => item.xp > 0);

    let status: ResultPayload['status'] = 'moderate-xp';
    let interpretation = 'Your match XP has been calculated based on eliminations, placement, and performance factors.';

    if (totalXP >= 1000) {
        status = 'very-high-xp';
        interpretation = `Exceptional match! You earned ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP, which is very high. This represents excellent performance with high eliminations, top placement, and strong overall performance.`;
    } else if (totalXP >= 600) {
        status = 'high-xp';
        interpretation = `Great match! You earned ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP, which is high. This represents strong performance with good eliminations, solid placement, and good overall performance.`;
    } else if (totalXP >= 300) {
        status = 'moderate-xp';
        interpretation = `Decent match. You earned ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP, which is moderate. This represents average performance with some eliminations and reasonable placement.`;
    } else {
        status = 'low-xp';
        interpretation = `Lower XP match. You earned ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP. Consider focusing on eliminations, survival, and placement to increase XP gains in future matches.`;
    }

    const recommendations = [
        `Total XP: ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP. ${totalXP >= 1000 ? 'Exceptional performance - excellent XP gains!' : totalXP >= 600 ? 'Strong performance - good XP gains.' : totalXP >= 300 ? 'Decent performance - moderate XP gains.' : 'Lower performance - focus on improving eliminations and placement.'}`,
        `Elimination XP: ${eliminationXP} XP (${eliminations} eliminations). ${eliminations >= 10 ? 'Excellent eliminations - great XP source.' : eliminations >= 5 ? 'Good eliminations - solid XP source.' : eliminations >= 2 ? 'Moderate eliminations - could improve.' : 'Low eliminations - focus on getting more eliminations for better XP.'}`,
        `Placement XP: ${placementXP} XP (${placement === 1 ? 'Victory Royale' : `Place ${placement}`}). ${placement <= 3 ? 'Excellent placement - top tier XP.' : placement <= 10 ? 'Great placement - high XP.' : placement <= 25 ? 'Good placement - moderate XP.' : 'Lower placement - focus on survival for better placement XP.'}`,
    ];

    if (survivalTime > 0) {
        recommendations.push(`Survival Time XP: ${survivalXP} XP (${survivalTime} minutes). ${survivalTime >= 15 ? 'Long survival - excellent bonus XP.' : survivalTime >= 10 ? 'Good survival - solid bonus XP.' : 'Shorter survival - survive longer for more bonus XP.'}`);
    }

    if (damageDealt > 0) {
        recommendations.push(`Damage XP: ${damageXP} XP (${damageDealt} damage). ${damageDealt >= 1000 ? 'High damage - excellent bonus XP.' : damageDealt >= 500 ? 'Good damage - bonus XP earned.' : 'Lower damage - deal more damage (500+) for bonus XP.'}`);
    }

    if (bonusXP > 0) {
        recommendations.push(`Bonus XP: ${bonusXP} XP. ${victoryRoyale ? 'Victory Royale bonus earned - excellent!' : firstBlood ? 'First blood bonus earned - good start!' : 'No special bonuses - aim for first blood or victory for bonus XP.'}`);
    } else {
        recommendations.push(`Bonus XP: 0 XP. No special bonuses earned. Aim for first blood (first elimination) or Victory Royale for significant bonus XP.`);
    }

    // Optimization recommendations
    if (totalXP < 500) {
        recommendations.push('XP Optimization: To increase XP, focus on: getting more eliminations (50 XP each), achieving higher placement (survive longer), dealing high damage (500+ for bonus), getting first blood bonus, and winning matches for Victory Royale bonus.');
    } else {
        recommendations.push('XP Optimization: Strong performance! Continue focusing on eliminations, high placement, and special bonuses to maintain high XP gains. Consider playing consistently across multiple matches for maximum XP accumulation.');
    }

    const plan = [
        {
            label: 'This Match',
            detail: `Match performance: ${totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })} XP earned. ${eliminations > 0 ? `${eliminations} eliminations, ` : ''}Place ${placement}. ${totalXP >= 600 ? 'Excellent performance - maintain this level.' : 'Focus on improving eliminations and placement for better XP.'}`
        },
        {
            label: 'This Week',
            detail: 'Optimize XP gains: focus on getting eliminations (50 XP each), achieving high placements (survive longer), dealing high damage (500+ for bonus), getting first blood bonuses, and winning matches for Victory Royale bonuses. Play consistently across multiple matches.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize XP: balance aggressive play (eliminations) with survival (placement), deal high damage for bonuses, aim for special bonuses (first blood, victory), play consistently across matches, and track XP gains to identify improvement opportunities.'
        },
    ];

    return {
        eliminations,
        placement,
        survivalTime,
        damageDealt,
        firstBlood,
        victoryRoyale,
        eliminationXP,
        placementXP,
        survivalXP,
        damageXP,
        bonusXP,
        totalXP,
        xpBySource,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function FortniteXPPerMatchOptimizerInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            eliminations: undefined,
            placement: undefined,
            survivalTime: undefined,
            damageDealt: undefined,
            firstBlood: false,
            victoryRoyale: false,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Input your match performance</CardTitle>
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
                                    name="eliminations"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Eliminations</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="placement"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Final Placement (1 = Victory Royale)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 10" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="survivalTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Survival Time (minutes, optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 12.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="damageDealt"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Damage Dealt (optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 750" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="firstBlood"
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
                                            <FormLabel className="!mt-0">First Blood (First Elimination)</FormLabel>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="victoryRoyale"
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
                                            <FormLabel className="!mt-0">Victory Royale (Won Match)</FormLabel>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate XP
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
                        <CardDescription>See total XP, breakdown by source, and optimization recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Total XP</p>
                                <p className="text-2xl font-semibold text-primary">{result.totalXP.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                <p className="text-xs text-muted-foreground">XP earned</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Elimination XP</p>
                                <p className="text-2xl font-semibold text-primary">{result.eliminationXP}</p>
                                <p className="text-xs text-muted-foreground">XP ({result.eliminations} elims)</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Placement XP</p>
                                <p className="text-2xl font-semibold text-primary">{result.placementXP}</p>
                                <p className="text-xs text-muted-foreground">XP (Place {result.placement})</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ').replace('xp', 'XP')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        {result.xpBySource.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                {result.xpBySource.map((source) => (
                                    <div key={source.source} className="p-4 border rounded">
                                        <p className="text-sm text-muted-foreground">{source.source}</p>
                                        <p className="text-xl font-semibold text-primary">{source.xp}</p>
                                        <p className="text-xs text-muted-foreground">{source.percentage.toFixed(1)}% of total</p>
                                    </div>
                                ))}
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
                        <strong>Elimination XP</strong> = Eliminations × 50 XP per elimination. Each elimination typically gives 50 XP, making eliminations a consistent and significant XP source. First blood (first elimination) may provide additional bonus XP.
                    </p>
                    <p>
                        <strong>Placement XP</strong> = Scaled based on final placement. Victory Royale (1st) = 300 XP, Top 3 = 180-200 XP, Top 10 = 140-150 XP, Top 25 = 70-100 XP, Others = 10-70 XP. Higher placements give significantly more XP, making survival important for XP gains.
                    </p>
                    <p>
                        <strong>Survival Time XP</strong> = Survival Time (minutes) × 5 XP per minute. Longer survival times provide bonus XP, encouraging strategic play and survival. This rewards players who survive longer in matches.
                    </p>
                    <p>
                        <strong>Damage XP</strong> = Damage Dealt / 10 (if damage ≥ 500). High damage totals (500+) provide bonus XP at a rate of 1 XP per 10 damage. This rewards aggressive play and combat engagement. Damage below 500 provides no bonus XP.
                    </p>
                    <p>
                        <strong>Bonus XP</strong> = First Blood Bonus (25 XP) + Victory Royale Bonus (300 XP). Special bonuses provide significant XP boosts for achieving milestones. First blood rewards early engagement, while Victory Royale rewards match wins.
                    </p>
                    <p>
                        <strong>Total XP</strong> = Elimination XP + Placement XP + Survival Time XP + Damage XP + Bonus XP. Total XP is the sum of all sources, representing complete match performance. Maximizing total XP requires balancing multiple factors.
                    </p>
                    <p>These formulas help you understand XP sources, calculate match XP, and optimize strategies for maximum XP gains. Balance eliminations, placement, survival, and damage for optimal XP accumulation.</p>
                </CardContent>
            </Card>
        </div>
    );
}
