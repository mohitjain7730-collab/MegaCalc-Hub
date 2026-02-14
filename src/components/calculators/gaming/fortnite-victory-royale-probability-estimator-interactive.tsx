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
    currentPlacement: z.number({ invalid_type_error: 'Enter current placement' }).min(1),
    totalPlayers: z.number({ invalid_type_error: 'Enter total players' }).min(1),
    skillLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], { invalid_type_error: 'Select skill level' }),
    eliminations: z.number({ invalid_type_error: 'Enter eliminations' }).min(0).optional(),
    hasGoodLoot: z.boolean().optional(),
    hasGoodPosition: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    currentPlacement: number;
    totalPlayers: number;
    skillLevel: string;
    eliminations: number;
    hasGoodLoot: boolean;
    hasGoodPosition: boolean;
    baseProbability: number;
    skillMultiplier: number;
    eliminationBonus: number;
    lootBonus: number;
    positionBonus: number;
    finalProbability: number;
    playersRemaining: number;
    placementRank: number;
    status: 'very-low' | 'low' | 'moderate' | 'good' | 'excellent';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const currentPlacement = values.currentPlacement;
    const totalPlayers = values.totalPlayers;
    const skillLevel = values.skillLevel;
    const eliminations = values.eliminations ?? 0;
    const hasGoodLoot = values.hasGoodLoot ?? false;
    const hasGoodPosition = values.hasGoodPosition ?? false;

    // Players remaining
    const playersRemaining = totalPlayers - currentPlacement + 1;

    // Base probability (equal chance for all players)
    const baseProbability = playersRemaining > 0 ? (1 / playersRemaining) * 100 : 0;

    // Skill multipliers
    const skillMultipliers: Record<string, number> = {
        beginner: 0.5,
        intermediate: 1.0,
        advanced: 1.5,
        expert: 2.0,
    };
    const skillMultiplier = skillMultipliers[skillLevel] || 1.0;

    // Elimination bonus (diminishing returns)
    const eliminationBonus = Math.min(eliminations * 1.5, 15); // Max 15% bonus

    // Loot bonus
    const lootBonus = hasGoodLoot ? 5 : 0;

    // Position bonus
    const positionBonus = hasGoodPosition ? 5 : 0;

    // Final probability calculation
    let finalProbability = baseProbability * skillMultiplier + eliminationBonus + lootBonus + positionBonus;
    finalProbability = Math.min(finalProbability, 95); // Cap at 95% (never 100% due to unpredictability)
    finalProbability = Math.max(finalProbability, 0.1); // Minimum 0.1%

    // Placement rank (percentage rank)
    const placementRank = totalPlayers > 0 ? ((totalPlayers - currentPlacement + 1) / totalPlayers) * 100 : 0;

    let status: ResultPayload['status'] = 'moderate';
    let interpretation = 'Your Victory Royale probability has been calculated based on placement, skill level, and match factors.';

    if (finalProbability >= 50) {
        status = 'excellent';
        interpretation = `Excellent probability! You have a ${finalProbability.toFixed(1)}% chance of Victory Royale. This is very high probability, indicating strong position, skill, and advantages.`;
    } else if (finalProbability >= 25) {
        status = 'good';
        interpretation = `Good probability. You have a ${finalProbability.toFixed(1)}% chance of Victory Royale. This is above average probability, indicating decent position and advantages.`;
    } else if (finalProbability >= 10) {
        status = 'moderate';
        interpretation = `Moderate probability. You have a ${finalProbability.toFixed(1)}% chance of Victory Royale. This is average probability, indicating room for improvement in position, skill, or advantages.`;
    } else if (finalProbability >= 5) {
        status = 'low';
        interpretation = `Lower probability. You have a ${finalProbability.toFixed(1)}% chance of Victory Royale. Focus on improving position, getting eliminations, and obtaining better loot to increase probability.`;
    } else {
        status = 'very-low';
        interpretation = `Very low probability. You have a ${finalProbability.toFixed(1)}% chance of Victory Royale. Significant improvements needed in skill, position, loot, or eliminations to increase probability.`;
    }

    const recommendations = [
        `Base Probability: ${baseProbability.toFixed(1)}% (${playersRemaining} players remaining). ${playersRemaining <= 10 ? 'Late game - high base probability.' : playersRemaining <= 25 ? 'Mid game - moderate base probability.' : 'Early game - lower base probability.'}`,
        `Skill Level: ${skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} (${skillMultiplier}x multiplier). ${skillMultiplier >= 1.5 ? 'High skill - significant probability boost.' : skillMultiplier >= 1.0 ? 'Moderate skill - standard probability.' : 'Lower skill - reduced probability. Practice to improve.'}`,
        `Elimination Bonus: +${eliminationBonus.toFixed(1)}% (${eliminations} eliminations). ${eliminations >= 10 ? 'Excellent eliminations - strong bonus.' : eliminations >= 5 ? 'Good eliminations - solid bonus.' : eliminations >= 2 ? 'Moderate eliminations - some bonus.' : 'Low eliminations - focus on getting eliminations for bonus.'}`,
        `Loot Bonus: +${lootBonus.toFixed(1)}%. ${hasGoodLoot ? 'Good loot provides combat advantage.' : 'Consider obtaining better loot for combat advantage.'}`,
        `Position Bonus: +${positionBonus.toFixed(1)}%. ${hasGoodPosition ? 'Good positioning provides tactical advantage.' : 'Consider improving positioning for tactical advantage.'}`,
        `Final Probability: ${finalProbability.toFixed(1)}%. ${finalProbability >= 50 ? 'Excellent probability - very high chance of Victory Royale.' : finalProbability >= 25 ? 'Good probability - above average chance.' : finalProbability >= 10 ? 'Moderate probability - average chance.' : 'Lower probability - focus on improvements.'}`,
    ];

    if (finalProbability < 25) {
        recommendations.push('Probability Improvement: To increase probability, focus on: improving skill through practice, getting more eliminations, obtaining better loot, improving positioning, and surviving longer to reduce player count.');
    }

    const plan = [
        {
            label: 'This Match',
            detail: `Current probability: ${finalProbability.toFixed(1)}% (${playersRemaining} players remaining). ${finalProbability >= 25 ? 'Good probability - maintain advantages and play strategically.' : 'Lower probability - focus on improvements: get eliminations, improve loot, better positioning.'}`
        },
        {
            label: 'This Week',
            detail: 'Improve win probability: practice to improve skill level, focus on getting eliminations, prioritize good loot collection, maintain good positioning, and make strategic decisions. Track probability factors to identify improvement areas.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize Victory Royale probability: improve skill through practice and learning, get eliminations to reduce competition, obtain and maintain good loot, prioritize good positioning, survive longer to reduce player count, and make strategic decisions based on probability factors.'
        },
    ];

    return {
        currentPlacement,
        totalPlayers,
        skillLevel,
        eliminations,
        hasGoodLoot,
        hasGoodPosition,
        baseProbability,
        skillMultiplier,
        eliminationBonus,
        lootBonus,
        positionBonus,
        finalProbability,
        playersRemaining,
        placementRank,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function FortniteVictoryRoyaleProbabilityEstimatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPlacement: undefined,
            totalPlayers: undefined,
            skillLevel: undefined,
            eliminations: undefined,
            hasGoodLoot: false,
            hasGoodPosition: false,
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
                                    name="currentPlacement"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Placement (1 = Victory Royale)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="totalPlayers"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Players (typically 100)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="skillLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Skill Level</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert')}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                >
                                                    <option value="">Select skill level</option>
                                                    <option value="beginner">Beginner (0.5x multiplier)</option>
                                                    <option value="intermediate">Intermediate (1.0x multiplier)</option>
                                                    <option value="advanced">Advanced (1.5x multiplier)</option>
                                                    <option value="expert">Expert (2.0x multiplier)</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="eliminations"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Eliminations (optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 5" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hasGoodLoot"
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
                                            <FormLabel className="!mt-0">Has Good Loot (High rarity weapons, full shield, etc.)</FormLabel>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hasGoodPosition"
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
                                            <FormLabel className="!mt-0">Has Good Positioning (High ground, cover, etc.)</FormLabel>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Estimate Victory Royale Probability
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
                        <CardDescription>See Victory Royale probability, contributing factors, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Final Probability</p>
                                <p className="text-2xl font-semibold text-primary">{result.finalProbability.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">Victory Royale chance</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Base Probability</p>
                                <p className="text-2xl font-semibold text-primary">{result.baseProbability.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">Equal chance</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Players Remaining</p>
                                <p className="text-2xl font-semibold text-primary">{result.playersRemaining}</p>
                                <p className="text-xs text-muted-foreground">Players left</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Skill Multiplier</p>
                                <p className="text-xl font-semibold text-primary">{result.skillMultiplier}x</p>
                                <p className="text-xs text-muted-foreground">{result.skillLevel}</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Elimination Bonus</p>
                                <p className="text-xl font-semibold text-primary">+{result.eliminationBonus.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">{result.eliminations} elims</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Loot Bonus</p>
                                <p className="text-xl font-semibold text-primary">+{result.lootBonus.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">{result.hasGoodLoot ? 'Yes' : 'No'}</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Position Bonus</p>
                                <p className="text-xl font-semibold text-primary">+{result.positionBonus.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">{result.hasGoodPosition ? 'Yes' : 'No'}</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Placement Rank</p>
                                <p className="text-xl font-semibold text-primary">{result.placementRank.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">Top percentile</p>
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
                        <strong>Base Probability</strong> = (1 / Players Remaining) × 100. This represents equal probability for all remaining players if all players are equal skill. Base probability increases as players are eliminated. For example, with 10 players remaining, base probability is 10%.
                    </p>
                    <p>
                        <strong>Players Remaining</strong> = Total Players - Current Placement + 1. This calculates how many players are still alive. Fewer remaining players mean higher base probability, as there are fewer competitors.
                    </p>
                    <p>
                        <strong>Skill Multiplier</strong> = Multiplier based on skill level (Beginner = 0.5x, Intermediate = 1.0x, Advanced = 1.5x, Expert = 2.0x). Higher skill levels significantly increase probability by improving combat effectiveness and decision-making.
                    </p>
                    <p>
                        <strong>Elimination Bonus</strong> = Min(Eliminations × 1.5, 15). Each elimination adds 1.5% bonus probability, capped at 15% maximum. Eliminations reduce competition and demonstrate combat effectiveness, increasing win probability.
                    </p>
                    <p>
                        <strong>Loot Bonus</strong> = 5% if has good loot, 0% otherwise. Good loot (high rarity weapons, full shield, etc.) provides combat advantages, increasing win probability.
                    </p>
                    <p>
                        <strong>Position Bonus</strong> = 5% if has good positioning, 0% otherwise. Good positioning (high ground, cover, etc.) provides tactical advantages, increasing win probability.
                    </p>
                    <p>
                        <strong>Final Probability</strong> = (Base Probability × Skill Multiplier) + Elimination Bonus + Loot Bonus + Position Bonus, capped between 0.1% and 95%. This combines all factors to estimate Victory Royale probability. Higher values indicate better chances of winning.
                    </p>
                    <p>These formulas help you understand Victory Royale probability, identify factors affecting it, and optimize strategies to increase win chances. Remember that probabilities are estimates based on statistical factors, and actual outcomes depend on many unpredictable variables.</p>
                </CardContent>
            </Card>
        </div>
    );
}
