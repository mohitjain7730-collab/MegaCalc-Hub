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
    itemType: z.enum(['sword', 'bow', 'armor', 'tool', 'book'], { invalid_type_error: 'Select item type' }),
    enchantmentLevel: z.number({ invalid_type_error: 'Enter enchantment level' }).min(1).max(30),
    targetEnchantment: z.string().optional(),
    bookshelfCount: z.number({ invalid_type_error: 'Enter bookshelf count' }).min(0).max(15).optional(),
    previousEnchantments: z.number({ invalid_type_error: 'Enter previous enchantments' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    itemType: string;
    enchantmentLevel: number;
    targetEnchantment: string;
    bookshelfCount: number;
    previousEnchantments: number;
    maxEnchantmentLevel: number;
    availableEnchantments: number;
    probabilityOfTarget: number;
    expectedEnchantments: number;
    experienceCost: number;
    successProbability: number;
    status: 'low-odds' | 'moderate-odds' | 'good-odds' | 'excellent-odds';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const itemType = values.itemType;
    const enchantmentLevel = values.enchantmentLevel;
    const targetEnchantment = values.targetEnchantment || '';
    const bookshelfCount = values.bookshelfCount ?? 15;
    const previousEnchantments = values.previousEnchantments ?? 0;

    // Maximum enchantment level based on bookshelves
    const maxEnchantmentLevel = bookshelfCount >= 15 ? 30 : Math.min(8 + Math.floor(bookshelfCount * 1.5), 30);

    // Available enchantments vary by item type (simplified estimate)
    const availableEnchantmentsByType: Record<string, number> = {
        sword: 8,
        bow: 6,
        armor: 10,
        tool: 7,
        book: 15, // Books can receive any enchantment
    };
    const availableEnchantments = availableEnchantmentsByType[itemType] || 8;

    // Experience cost equals enchantment level
    const experienceCost = enchantmentLevel;

    // Base probability calculation (simplified)
    // Higher levels have better chances of good enchantments
    // Probability increases with level, but specific enchantments have varying rarities
    const levelFactor = enchantmentLevel / 30; // Normalize to 0-1
    const baseProbability = levelFactor * 0.5 + 0.1; // Base probability increases with level

    // Probability of target enchantment (if specified)
    // This is a simplified estimate - actual probabilities vary by enchantment rarity
    let probabilityOfTarget = 0;
    if (targetEnchantment) {
        // Simplified: assume target enchantment has moderate rarity
        // Actual probability depends on specific enchantment rarity
        probabilityOfTarget = (baseProbability / availableEnchantments) * (1 - previousEnchantments * 0.1);
        probabilityOfTarget = Math.max(0.01, Math.min(probabilityOfTarget, 0.5)); // Cap between 1% and 50%
    }

    // Expected number of enchantments (typically 1-3 per enchantment)
    const expectedEnchantments = Math.min(3, Math.max(1, Math.floor(levelFactor * 3) + 1));

    // Success probability (probability of getting good enchantments)
    const successProbability = Math.min(0.95, baseProbability * (1 + levelFactor));

    let status: ResultPayload['status'] = 'moderate-odds';
    let interpretation = 'Your enchanting odds have been calculated based on item type, enchantment level, and bookshelf count.';

    if (successProbability >= 0.7) {
        status = 'excellent-odds';
        interpretation = `Excellent odds! You have a ${(successProbability * 100).toFixed(1)}% chance of getting good enchantments at level ${enchantmentLevel}. This is very high probability for successful enchanting.`;
    } else if (successProbability >= 0.5) {
        status = 'good-odds';
        interpretation = `Good odds. You have a ${(successProbability * 100).toFixed(1)}% chance of getting good enchantments at level ${enchantmentLevel}. This is above average probability for successful enchanting.`;
    } else if (successProbability >= 0.3) {
        status = 'moderate-odds';
        interpretation = `Moderate odds. You have a ${(successProbability * 100).toFixed(1)}% chance of getting good enchantments at level ${enchantmentLevel}. Consider using higher levels or more bookshelves for better odds.`;
    } else {
        status = 'low-odds';
        interpretation = `Lower odds. You have a ${(successProbability * 100).toFixed(1)}% chance of getting good enchantments at level ${enchantmentLevel}. Use level 30 with 15 bookshelves for maximum odds.`;
    }

    const recommendations = [
        `Enchantment Level: ${enchantmentLevel} (max available: ${maxEnchantmentLevel}). ${enchantmentLevel >= 30 ? 'Maximum level - excellent for best enchantments.' : enchantmentLevel >= 20 ? 'High level - good for quality enchantments.' : enchantmentLevel >= 10 ? 'Moderate level - decent enchantments.' : 'Lower level - consider using higher levels for better enchantments.'}`,
        `Bookshelf Count: ${bookshelfCount}/15. ${bookshelfCount >= 15 ? 'Maximum bookshelves - access to level 30 enchantments.' : bookshelfCount >= 10 ? 'Good bookshelf count - high max level.' : bookshelfCount >= 5 ? 'Moderate bookshelf count - decent max level.' : 'Low bookshelf count - add more bookshelves for higher max level (need 15 for level 30).'}`,
        `Experience Cost: ${experienceCost} levels. ${experienceCost >= 30 ? 'High cost - prepare sufficient experience.' : experienceCost >= 20 ? 'Moderate cost - reasonable experience requirement.' : 'Lower cost - affordable experience requirement.'}`,
        `Expected Enchantments: ${expectedEnchantments} enchantments per enchantment. ${expectedEnchantments >= 3 ? 'High expected enchantments - excellent value.' : expectedEnchantments >= 2 ? 'Moderate expected enchantments - good value.' : 'Lower expected enchantments - consider higher levels.'}`,
        `Success Probability: ${(successProbability * 100).toFixed(1)}%. ${successProbability >= 0.7 ? 'Excellent probability - very likely to get good enchantments.' : successProbability >= 0.5 ? 'Good probability - likely to get good enchantments.' : successProbability >= 0.3 ? 'Moderate probability - some chance of good enchantments.' : 'Lower probability - use level 30 for better odds.'}`,
    ];

    if (targetEnchantment) {
        recommendations.push(`Target Enchantment Probability: ${(probabilityOfTarget * 100).toFixed(1)}% chance of getting "${targetEnchantment}". ${probabilityOfTarget >= 0.2 ? 'Good probability for target enchantment.' : probabilityOfTarget >= 0.1 ? 'Moderate probability for target enchantment.' : 'Lower probability - target enchantment may be rare. Consider multiple attempts or higher levels.'}`);
    } else {
        recommendations.push('Target Enchantment: Not specified. Enter a specific enchantment name to calculate probability of obtaining that enchantment. Probabilities vary by enchantment rarity.');
    }

    if (enchantmentLevel < 30 || bookshelfCount < 15) {
        recommendations.push('Optimization: For maximum odds, use level 30 with 15 bookshelves. This provides access to all enchantments and maximum enchantment levels. Level 30 is essential for best enchantment results.');
    }

    const plan = [
        {
            label: 'This Session',
            detail: `Enchanting setup: Level ${enchantmentLevel}, ${bookshelfCount} bookshelves, ${(successProbability * 100).toFixed(1)}% success probability. ${enchantmentLevel >= 30 && bookshelfCount >= 15 ? 'Optimal setup - proceed with enchanting.' : 'Consider optimizing: use level 30 and ensure 15 bookshelves for maximum odds.'}`
        },
        {
            label: 'This Week',
            detail: 'Optimize enchanting: ensure 15 bookshelves for level 30 access, accumulate experience for level 30 enchanting, test different item types and levels, track enchantment results, and identify optimal enchanting strategies for different items.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize enchanting: always use level 30 with 15 bookshelves for maximum odds, accumulate sufficient experience, understand enchantment probabilities and rarities, test different approaches, and track results to identify patterns and optimize strategies.'
        },
    ];

    return {
        itemType,
        enchantmentLevel,
        targetEnchantment,
        bookshelfCount,
        previousEnchantments,
        maxEnchantmentLevel,
        availableEnchantments,
        probabilityOfTarget,
        expectedEnchantments,
        experienceCost,
        successProbability,
        status,
        interpretation,
        recommendations,
        plan,
    };
};

export default function MinecraftEnchantingOddsPredictorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itemType: undefined,
            enchantmentLevel: undefined,
            targetEnchantment: undefined,
            bookshelfCount: undefined,
            previousEnchantments: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5" />
                        Minecraft Enchanting Odds Predictor
                    </CardTitle>
                    <CardDescription>Predict enchanting odds and probabilities for Minecraft items based on enchantment levels, experience costs, and enchantment combinations.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Input your enchanting information</CardTitle>
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
                                    name="itemType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Item Type</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value as 'sword' | 'bow' | 'armor' | 'tool' | 'book')}
                                                    className="w-full px-3 py-2 border rounded-md bg-background"
                                                >
                                                    <option value="">Select item type</option>
                                                    <option value="sword">Sword</option>
                                                    <option value="bow">Bow</option>
                                                    <option value="armor">Armor</option>
                                                    <option value="tool">Tool</option>
                                                    <option value="book">Book</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="enchantmentLevel"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Enchantment Level (1-30)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 30" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetEnchantment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Enchantment (optional)</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="e.g., Sharpness" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value || undefined)} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="bookshelfCount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bookshelf Count (0-15, optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 15" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="previousEnchantments"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Previous Enchantments (optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 0" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Predict Enchanting Odds
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
                        <CardDescription>See enchanting probabilities, expected enchantments, experience cost, and recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Success Probability</p>
                                <p className="text-2xl font-semibold text-primary">{(result.successProbability * 100).toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">Good enchantments</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Experience Cost</p>
                                <p className="text-2xl font-semibold text-primary">{result.experienceCost}</p>
                                <p className="text-xs text-muted-foreground">Levels required</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Expected Enchantments</p>
                                <p className="text-2xl font-semibold text-primary">{result.expectedEnchantments}</p>
                                <p className="text-xs text-muted-foreground">Per enchantment</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <p className="text-2xl font-semibold text-primary capitalize">{result.status.replace('-', ' ')}</p>
                                <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                            </div>
                        </div>
                        {result.targetEnchantment && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded">
                                    <p className="text-sm text-muted-foreground">Target Enchantment Probability</p>
                                    <p className="text-xl font-semibold text-primary">{(result.probabilityOfTarget * 100).toFixed(1)}%</p>
                                    <p className="text-xs text-muted-foreground">{result.targetEnchantment}</p>
                                </div>
                                <div className="p-4 border rounded">
                                    <p className="text-sm text-muted-foreground">Max Enchantment Level</p>
                                    <p className="text-xl font-semibold text-primary">{result.maxEnchantmentLevel}</p>
                                    <p className="text-xs text-muted-foreground">With {result.bookshelfCount} bookshelves</p>
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
                        <strong>Maximum Enchantment Level</strong> = 15 bookshelves = 30 (maximum), 0 bookshelves = 8 (minimum), 1-14 bookshelves = 8 + (Bookshelves × 1.5). Bookshelves must be within 2 blocks of the enchanting table. Always use 15 bookshelves for maximum level 30.
                    </p>
                    <p>
                        <strong>Experience Cost</strong> = Enchantment Level. The experience cost equals the enchantment level used. Level 1 costs 1 level, level 30 costs 30 levels. Higher levels cost more experience but provide better enchantments.
                    </p>
                    <p>
                        <strong>Base Probability</strong> = (Enchantment Level / 30) × 0.5 + 0.1. This calculates base probability of getting good enchantments, increasing with enchantment level. Higher levels provide better probabilities of quality enchantments.
                    </p>
                    <p>
                        <strong>Target Enchantment Probability</strong> = (Base Probability / Available Enchantments) × (1 - Previous Enchantments × 0.1). This estimates probability of obtaining a specific enchantment. Probabilities vary by enchantment rarity (common/uncommon/rare/very rare). Rarer enchantments have lower probabilities.
                    </p>
                    <p>
                        <strong>Expected Enchantments</strong> = Min(3, Max(1, Floor((Level / 30) × 3) + 1)). This estimates how many enchantments you can expect per enchantment. Higher levels typically provide 2-3 enchantments, while lower levels provide 1-2 enchantments.
                    </p>
                    <p>
                        <strong>Success Probability</strong> = Min(0.95, Base Probability × (1 + Level Factor)). This calculates probability of getting good enchantments overall. Higher levels and more bookshelves increase success probability. Level 30 with 15 bookshelves provides maximum success probability.
                    </p>
                    <p>These formulas help you understand enchanting odds, calculate probabilities, and optimize enchanting strategies. Remember that enchanting outcomes are random, but higher levels and more bookshelves improve probabilities of quality enchantments.</p>
                </CardContent>
            </Card>
        </div>
    );
}
