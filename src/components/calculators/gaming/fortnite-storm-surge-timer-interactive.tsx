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
    currentPlayerCount: z.number({ invalid_type_error: 'Enter current player count' }).min(1),
    targetPlayerCount: z.number({ invalid_type_error: 'Enter target player count' }).min(1),
    damagePerTick: z.number({ invalid_type_error: 'Enter damage per tick' }).min(0),
    tickInterval: z.number({ invalid_type_error: 'Enter tick interval' }).min(0.1),
    playerHealth: z.number({ invalid_type_error: 'Enter player health' }).min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    currentPlayerCount: number;
    targetPlayerCount: number;
    damagePerTick: number;
    tickInterval: number;
    playerHealth: number;
    playersToEliminate: number;
    totalDamageNeeded: number;
    timeUntilSurge: number;
    ticksUntilSurge: number;
    damagePerPlayer: number;
    survivalTime: number;
    ticksToSurvive: number;
    status: 'safe' | 'warning' | 'danger' | 'critical';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const currentPlayerCount = values.currentPlayerCount;
    const targetPlayerCount = values.targetPlayerCount;
    const damagePerTick = values.damagePerTick;
    const tickInterval = values.tickInterval;
    const playerHealth = values.playerHealth ?? 100;

    // Players that need to be eliminated
    const playersToEliminate = Math.max(0, currentPlayerCount - targetPlayerCount);

    // Time until surge (assuming average elimination rate)
    // This is an estimate - actual time depends on player behavior
    const estimatedEliminationRate = 2; // players per minute (rough estimate)
    const timeUntilSurge = playersToEliminate > 0 ? (playersToEliminate / estimatedEliminationRate) * 60 : 0; // seconds

    // Ticks until surge (if it activates)
    const ticksUntilSurge = timeUntilSurge > 0 && tickInterval > 0 ? timeUntilSurge / tickInterval : 0;

    // Total damage needed to eliminate all players below threshold
    // This is theoretical - assumes all players have same health
    const damagePerPlayer = playerHealth; // Assuming full health elimination
    const totalDamageNeeded = playersToEliminate * damagePerPlayer;

    // Survival time if taking storm surge damage
    const ticksToSurvive = damagePerTick > 0 ? Math.floor(playerHealth / damagePerTick) : 0;
    const survivalTime = ticksToSurvive * tickInterval;

    let status: ResultPayload['status'] = 'safe';
    let interpretation = 'Your storm surge calculations have been completed based on player count, damage settings, and health.';

    if (currentPlayerCount <= targetPlayerCount) {
        status = 'safe';
        interpretation = `Safe zone. Current player count (${currentPlayerCount}) is at or below the target threshold (${targetPlayerCount}). Storm surge is not active. Continue playing normally.`;
    } else if (playersToEliminate <= 10) {
        status = 'warning';
        interpretation = `Warning zone. ${playersToEliminate} players need to be eliminated to avoid storm surge. Storm surge may activate soon. Deal damage to enemies to avoid being targeted.`;
    } else if (playersToEliminate <= 20) {
        status = 'danger';
        interpretation = `Danger zone. ${playersToEliminate} players need to be eliminated. Storm surge is likely to activate. Deal damage aggressively to avoid storm surge targeting.`;
    } else {
        status = 'critical';
        interpretation = `Critical zone. ${playersToEliminate} players need to be eliminated. Storm surge will likely activate soon. Deal damage immediately to avoid being targeted by storm surge.`;
    }

    const recommendations = [
        `Current Situation: ${currentPlayerCount} players remaining, target is ${targetPlayerCount}. ${playersToEliminate > 0 ? `${playersToEliminate} players need to be eliminated to avoid storm surge.` : 'Player count is at safe level - storm surge not active.'}`,
        `Time Until Surge: ${timeUntilSurge > 0 ? `${Math.floor(timeUntilSurge / 60)} minutes ${Math.floor(timeUntilSurge % 60)} seconds (estimated). ${timeUntilSurge < 60 ? 'Storm surge may activate very soon - prepare for damage.' : timeUntilSurge < 300 ? 'Storm surge may activate soon - deal damage to avoid targeting.' : 'You have time before storm surge activates - use it to deal damage.'}` : 'Storm surge not active or already active.'}`,
        `Storm Surge Damage: ${damagePerTick} damage per tick, every ${tickInterval} seconds. ${damagePerTick >= 2 ? 'High damage - storm surge is very dangerous. Deal damage to avoid it.' : 'Moderate damage - still dangerous but manageable with healing.'}`,
    ];

    if (playerHealth > 0) {
        recommendations.push(`Survival Time: ${survivalTime.toFixed(1)} seconds (${ticksToSurvive} ticks) if taking storm surge damage. ${survivalTime < 30 ? 'Very short survival time - deal damage immediately to avoid storm surge.' : survivalTime < 60 ? 'Limited survival time - prioritize dealing damage over healing.' : 'Reasonable survival time, but still deal damage to avoid storm surge entirely.'}`);
    }

    recommendations.push(`Strategy: ${playersToEliminate > 0 ? 'Deal damage to enemies to avoid storm surge targeting. Engage in combat, maintain aggressive play, and prioritize damage dealt over passive survival. Players with higher damage dealt are protected from storm surge.' : 'Player count is safe - continue playing normally but stay aware of storm surge thresholds.'}`);

    if (playersToEliminate > 20) {
        recommendations.push('High player count detected. Storm surge is very likely. Focus on dealing damage immediately. Passive play will result in storm surge damage. Engage enemies aggressively to avoid being targeted.');
    }

    const plan = [
        {
            label: 'This Match',
            detail: `Monitor player count: ${currentPlayerCount} remaining, ${playersToEliminate > 0 ? `need ${playersToEliminate} eliminations. ${timeUntilSurge > 0 ? `Estimated ${Math.floor(timeUntilSurge / 60)}m ${Math.floor(timeUntilSurge % 60)}s until surge.` : 'Storm surge may activate soon.'} Deal damage aggressively to avoid storm surge targeting.` : 'Safe player count - continue normal gameplay.'}`
        },
        {
            label: 'This Week',
            detail: 'Practice aggressive playstyles: engage enemies early, deal damage consistently, avoid passive play, and understand storm surge mechanics. Develop strategies to deal damage while maintaining survival.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize storm surge management: monitor player counts, deal damage to avoid targeting, balance aggression with survival, understand damage thresholds, and adapt playstyle based on match phase and player count.'
        },
    ];

    return {
        currentPlayerCount,
        targetPlayerCount,
        damagePerTick,
        tickInterval,
        playerHealth,
        playersToEliminate,
        totalDamageNeeded,
        timeUntilSurge,
        ticksUntilSurge,
        damagePerPlayer,
        survivalTime,
        ticksToSurvive,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function FortniteStormSurgeTimerInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPlayerCount: undefined,
            targetPlayerCount: undefined,
            damagePerTick: undefined,
            tickInterval: undefined,
            playerHealth: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Input your match information</CardTitle>
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
                                    name="currentPlayerCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Player Count</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetPlayerCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Player Count (Surge Threshold)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 60" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="damagePerTick"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Damage Per Tick</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 1.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="tickInterval"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tick Interval (seconds)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.1" placeholder="e.g., 0.5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="playerHealth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Current Health (optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Storm Surge
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
                        <CardDescription>See time until storm surge, damage calculations, survival requirements, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Players to Eliminate</p>
                                <p className="text-2xl font-semibold text-primary">{result.playersToEliminate}</p>
                                <p className="text-xs text-muted-foreground">To avoid surge</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Time Until Surge</p>
                                <p className="text-2xl font-semibold text-primary">
                                    {result.timeUntilSurge > 0 ? `${Math.floor(result.timeUntilSurge / 60)}m ${Math.floor(result.timeUntilSurge % 60)}s` : 'N/A'}
                                </p>
                                <p className="text-xs text-muted-foreground">Estimated</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Survival Time</p>
                                <p className="text-2xl font-semibold text-primary">{result.survivalTime.toFixed(1)}s</p>
                                <p className="text-xs text-muted-foreground">If taking damage</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Damage Per Tick</p>
                                <p className="text-xl font-semibold text-primary">{result.damagePerTick}</p>
                                <p className="text-xs text-muted-foreground">Every {result.tickInterval}s</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Ticks to Survive</p>
                                <p className="text-xl font-semibold text-primary">{result.ticksToSurvive}</p>
                                <p className="text-xs text-muted-foreground">Ticks</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Current Health</p>
                                <p className="text-xl font-semibold text-primary">{result.playerHealth}</p>
                                <p className="text-xs text-muted-foreground">HP</p>
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
                        <strong>Players to Eliminate</strong> = Current Player Count - Target Player Count. This shows how many players need to be eliminated to avoid storm surge activation. Positive values indicate storm surge risk.
                    </p>
                    <p>
                        <strong>Time Until Surge</strong> = (Players to Eliminate / Estimated Elimination Rate) × 60 seconds. This estimates time until storm surge activates, assuming average elimination rates. Actual time varies based on player behavior.
                    </p>
                    <p>
                        <strong>Ticks Until Surge</strong> = Time Until Surge / Tick Interval. This calculates how many damage ticks will occur before storm surge activates (if it activates). Useful for planning damage dealing strategies.
                    </p>
                    <p>
                        <strong>Survival Time</strong> = (Current Health / Damage Per Tick) × Tick Interval. This calculates how long you can survive if taking storm surge damage continuously. Survival time depends on health and damage per tick.
                    </p>
                    <p>
                        <strong>Ticks to Survive</strong> = Current Health / Damage Per Tick. This shows how many damage ticks you can take before elimination. Each tick reduces health by damage per tick amount.
                    </p>
                    <p>
                        <strong>Total Damage Needed</strong> = Players to Eliminate × Average Player Health. This represents theoretical total damage needed to eliminate all players above threshold. This is for reference only, as actual eliminations depend on combat.
                    </p>
                    <p>These formulas help you understand storm surge timing, calculate survival requirements, and plan strategies to avoid storm surge damage. Remember: the best strategy is to deal damage to enemies to avoid being targeted by storm surge.</p>
                </CardContent>
            </Card>
        </div>
    );
}
