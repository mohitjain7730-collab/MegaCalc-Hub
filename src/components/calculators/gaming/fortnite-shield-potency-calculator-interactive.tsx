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
    baseHealth: z.number({ invalid_type_error: 'Enter base health' }).min(1),
    shieldAmount: z.number({ invalid_type_error: 'Enter shield amount' }).min(0).max(100),
    shieldType: z.enum(['small', 'medium', 'large', 'chug'], { invalid_type_error: 'Select shield type' }),
    incomingDamage: z.number({ invalid_type_error: 'Enter incoming damage' }).min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    baseHealth: number;
    shieldAmount: number;
    shieldType: string;
    incomingDamage: number;
    totalEffectiveHealth: number;
    damageAbsorbed: number;
    remainingShield: number;
    remainingHealth: number;
    shieldEffectiveness: number;
    survivalStatus: 'eliminated' | 'critical' | 'damaged' | 'protected' | 'full';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
};

const calculateResult = (values: FormValues): ResultPayload => {
    const baseHealth = values.baseHealth;
    const shieldAmount = values.shieldAmount;
    const shieldType = values.shieldType;
    const incomingDamage = values.incomingDamage ?? 0;

    // Total effective health
    const totalEffectiveHealth = baseHealth + shieldAmount;

    // Damage absorption calculation
    let damageAbsorbed = 0;
    let remainingShield = shieldAmount;
    let remainingHealth = baseHealth;

    if (incomingDamage > 0) {
        // Shield absorbs damage first
        if (incomingDamage <= shieldAmount) {
            // All damage absorbed by shield
            damageAbsorbed = incomingDamage;
            remainingShield = shieldAmount - incomingDamage;
            remainingHealth = baseHealth;
        } else {
            // Shield depleted, remaining damage goes to health
            damageAbsorbed = shieldAmount;
            remainingShield = 0;
            const damageToHealth = incomingDamage - shieldAmount;
            remainingHealth = Math.max(0, baseHealth - damageToHealth);
        }
    }

    // Shield effectiveness percentage
    const shieldEffectiveness = totalEffectiveHealth > 0 ? (shieldAmount / totalEffectiveHealth) * 100 : 0;

    // Survival status
    let survivalStatus: ResultPayload['survivalStatus'] = 'full';
    if (incomingDamage > 0) {
        if (remainingHealth <= 0) {
            survivalStatus = 'eliminated';
        } else if (remainingHealth <= 25) {
            survivalStatus = 'critical';
        } else if (remainingHealth <= 50) {
            survivalStatus = 'damaged';
        } else if (remainingShield > 0) {
            survivalStatus = 'protected';
        } else {
            survivalStatus = 'damaged';
        }
    } else {
        if (shieldAmount >= 100) {
            survivalStatus = 'full';
        } else if (shieldAmount >= 50) {
            survivalStatus = 'protected';
        } else {
            survivalStatus = 'damaged';
        }
    }

    let interpretation = 'Your shield potency has been calculated based on health, shield amount, and shield type.';
    if (incomingDamage > 0) {
        if (survivalStatus === 'eliminated') {
            interpretation = `Eliminated. ${incomingDamage} damage exceeds your total effective health of ${totalEffectiveHealth}. You cannot survive this damage.`;
        } else if (survivalStatus === 'critical') {
            interpretation = `Critical condition. After ${incomingDamage} damage, you have ${remainingHealth.toFixed(0)} health remaining. Immediate healing is required.`;
        } else if (survivalStatus === 'damaged') {
            interpretation = `Damaged but surviving. After ${incomingDamage} damage, you have ${remainingHealth.toFixed(0)} health remaining. Consider healing soon.`;
        } else {
            interpretation = `Protected. After ${incomingDamage} damage, you have ${remainingShield.toFixed(0)} shield and ${remainingHealth.toFixed(0)} health remaining. Good protection.`;
        }
    } else {
        if (shieldAmount >= 100) {
            interpretation = `Full shield protection! You have ${totalEffectiveHealth} total effective health with maximum shield. Excellent protection.`;
        } else if (shieldAmount >= 50) {
            interpretation = `Good shield protection. You have ${totalEffectiveHealth} total effective health. Consider obtaining more shield for maximum protection.`;
        } else {
            interpretation = `Limited shield protection. You have ${totalEffectiveHealth} total effective health. Prioritize obtaining more shield for better survival.`;
        }
    }

    const recommendations = [
        `Total Effective Health: ${totalEffectiveHealth} (${baseHealth} health + ${shieldAmount} shield). ${totalEffectiveHealth >= 200 ? 'Maximum protection - excellent survival capacity.' : totalEffectiveHealth >= 150 ? 'Good protection - solid survival capacity.' : totalEffectiveHealth >= 100 ? 'Basic protection - consider obtaining more shield.' : 'Low protection - prioritize shield collection.'}`,
        `Shield Effectiveness: ${shieldEffectiveness.toFixed(1)}%. ${shieldEffectiveness >= 50 ? 'High shield effectiveness - excellent protection.' : shieldEffectiveness >= 25 ? 'Moderate shield effectiveness - good protection.' : 'Low shield effectiveness - prioritize shield collection.'}`,
    ];

    if (incomingDamage > 0) {
        recommendations.push(`Damage Absorption: ${damageAbsorbed.toFixed(0)} damage absorbed by shield, ${Math.max(0, incomingDamage - damageAbsorbed).toFixed(0)} damage to health. ${damageAbsorbed >= shieldAmount ? 'Shield fully utilized - excellent protection.' : 'Shield partially utilized - some protection provided.'}`);
        recommendations.push(`Remaining Status: ${remainingShield.toFixed(0)} shield, ${remainingHealth.toFixed(0)} health. ${survivalStatus === 'eliminated' ? 'Eliminated - cannot survive.' : survivalStatus === 'critical' ? 'Critical - immediate healing required.' : survivalStatus === 'damaged' ? 'Damaged - healing recommended.' : 'Protected - good condition.'}`);
    } else {
        recommendations.push(`Shield Status: ${shieldAmount}/100 shield. ${shieldAmount >= 100 ? 'Full shield - maximum protection.' : shieldAmount >= 50 ? 'Partial shield - good protection, consider maxing.' : 'Low shield - prioritize shield collection for better survival.'}`);
    }

    recommendations.push(`Shield Type: ${shieldType.charAt(0).toUpperCase() + shieldType.slice(1)}. ${shieldType === 'chug' ? 'Chug Jug provides maximum restoration (100 shield + 100 health).' : shieldType === 'large' ? 'Large Shield Potion restores 50 shield (max 100).' : shieldType === 'medium' ? 'Medium Shield Potion restores 50 shield (max 50).' : 'Small Shield Potion restores 25 shield (max 50).'}`);

    if (shieldAmount < 100 && incomingDamage === 0) {
        recommendations.push('Shield Optimization: Prioritize obtaining Large Shield Potions or Chug Jugs to reach maximum shield (100). Full shield doubles your effective health and significantly improves survival chances.');
    }

    const plan = [
        {
            label: 'This Match',
            detail: `Manage shield: ${shieldAmount}/100 shield, ${totalEffectiveHealth} effective health. ${shieldAmount < 100 ? 'Prioritize shield collection to reach maximum protection.' : 'Maintain full shield for maximum survival capacity.'}`
        },
        {
            label: 'This Week',
            detail: 'Optimize shield management: prioritize shield items, understand shield types and restoration amounts, balance shield with health, and use shield strategically to protect health during combat.'
        },
        {
            label: 'Ongoing',
            detail: 'Continuously optimize shield usage: maintain maximum shield when possible, use shield to absorb damage and protect health, prioritize shield items in loot collection, and understand shield effectiveness for optimal survival strategies.'
        },
    ];

    return {
        baseHealth,
        shieldAmount,
        shieldType,
        incomingDamage,
        totalEffectiveHealth,
        damageAbsorbed,
        remainingShield,
        remainingHealth,
        shieldEffectiveness,
        survivalStatus,
        interpretation,
        recommendations,
        plan,
    };
};

export default function FortniteShieldPotencyCalculatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            baseHealth: undefined,
            shieldAmount: undefined,
            shieldType: undefined,
            incomingDamage: undefined,
        },
    });

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Input your shield information</CardTitle>
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
                                    name="baseHealth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Health</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 100" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="shieldAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shield Amount (0-100)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 50" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="shieldType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Shield Type</FormLabel>
                                            <FormControl>
                                                <select
                                                    value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(e.target.value as 'small' | 'medium' | 'large' | 'chug')}
                                                    className="w-full px-3 py-2 border rounded-md"
                                                >
                                                    <option value="">Select shield type</option>
                                                    <option value="small">Small Shield Potion (25 shield, max 50)</option>
                                                    <option value="medium">Medium Shield Potion (50 shield, max 50)</option>
                                                    <option value="large">Large Shield Potion (50 shield, max 100)</option>
                                                    <option value="chug">Chug Jug (100 shield + 100 health)</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="incomingDamage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Incoming Damage (optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="1" placeholder="e.g., 75" value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full md:w-auto">
                                Calculate Shield Potency
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
                        <CardDescription>See total effective health, shield effectiveness, damage absorption, and survival status.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Total Effective Health</p>
                                <p className="text-2xl font-semibold text-primary">{result.totalEffectiveHealth}</p>
                                <p className="text-xs text-muted-foreground">HP + Shield</p>
                            </div>
                            <div className="p-4 border rounded">
                                <p className="text-sm text-muted-foreground">Shield Effectiveness</p>
                                <p className="text-2xl font-semibold text-primary">{result.shieldEffectiveness.toFixed(1)}%</p>
                                <p className="text-xs text-muted-foreground">Of total health</p>
                            </div>
                            {result.incomingDamage > 0 && (
                                <>
                                    <div className="p-4 border rounded">
                                        <p className="text-sm text-muted-foreground">Damage Absorbed</p>
                                        <p className="text-2xl font-semibold text-primary">{result.damageAbsorbed.toFixed(0)}</p>
                                        <p className="text-xs text-muted-foreground">By shield</p>
                                    </div>
                                    <div className="p-4 border rounded">
                                        <p className="text-sm text-muted-foreground">Remaining Health</p>
                                        <p className="text-2xl font-semibold text-primary">{result.remainingHealth.toFixed(0)}</p>
                                        <p className="text-xs text-muted-foreground">HP</p>
                                    </div>
                                </>
                            )}
                            {result.incomingDamage === 0 && (
                                <>
                                    <div className="p-4 border rounded">
                                        <p className="text-sm text-muted-foreground">Current Shield</p>
                                        <p className="text-2xl font-semibold text-primary">{result.shieldAmount}/100</p>
                                        <p className="text-xs text-muted-foreground">Shield</p>
                                    </div>
                                    <div className="p-4 border rounded">
                                        <p className="text-sm text-muted-foreground">Status</p>
                                        <p className="text-2xl font-semibold text-primary capitalize">{result.survivalStatus}</p>
                                        <p className="text-xs text-muted-foreground">{result.interpretation}</p>
                                    </div>
                                </>
                            )}
                        </div>
                        {result.incomingDamage > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 border rounded">
                                    <p className="text-sm text-muted-foreground">Remaining Shield</p>
                                    <p className="text-xl font-semibold text-primary">{result.remainingShield.toFixed(0)}/100</p>
                                    <p className="text-xs text-muted-foreground">Shield</p>
                                </div>
                                <div className="p-4 border rounded">
                                    <p className="text-sm text-muted-foreground">Survival Status</p>
                                    <p className="text-xl font-semibold text-primary capitalize">{result.survivalStatus}</p>
                                    <p className="text-xs text-muted-foreground">{result.interpretation}</p>
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
                        <strong>Total Effective Health</strong> = Base Health + Shield Amount. This represents your total damage capacity before elimination. Shield provides additional protection on top of base health, effectively doubling your survival capacity when at maximum (100 shield + 100 health = 200 effective health).
                    </p>
                    <p>
                        <strong>Shield Effectiveness</strong> = (Shield Amount / Total Effective Health) × 100. This shows what percentage of your effective health is shield. Higher shield effectiveness means more protection and less health at risk. Full shield (100) with 100 health = 50% effectiveness.
                    </p>
                    <p>
                        <strong>Damage Absorption</strong>: Damage is absorbed by shield first, then health. If incoming damage ≤ shield amount, all damage is absorbed by shield. If incoming damage &gt; shield amount, shield is depleted and remaining damage goes to health. Formula: Damage to Health = Max(0, Incoming Damage - Shield Amount).
                    </p>
                    <p>
                        <strong>Remaining Shield</strong> = Max(0, Shield Amount - Incoming Damage). This shows how much shield remains after taking damage. Shield is depleted first, protecting health from damage.
                    </p>
                    <p>
                        <strong>Remaining Health</strong> = Max(0, Base Health - (Incoming Damage - Shield Amount)). This shows how much health remains after taking damage. Health is only damaged after shield is depleted.
                    </p>
                    <p>These formulas help you understand shield protection, calculate damage absorption, and plan survival strategies. Shield effectively doubles your survival capacity when at maximum, making it essential for combat survival.</p>
                </CardContent>
            </Card>
        </div>
    );
}
