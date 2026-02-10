'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Skull, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
    bestPetPower: z.number().min(1).default(100), // Power of strongest pet (e.g. 100q)
    petType: z.enum(['normal', 'golden', 'rainbow', 'dark_matter', 'shiny']),
    hugeCount: z.number().min(0).max(50).default(0), // Huge pets match best pet
    titanicCount: z.number().min(0).max(50).default(0), // Titanic pets match 2x(?) or huge buff
    enchantBonus: z.number().min(0).max(500).default(0), // Total % bonus from Strength V etc
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalTeamPower: string;
    effectiveDamage: string;
    oneShotThreshold: string;
    rank: string;
    rankColor: string;
};

const calculatePower = (values: FormValues): ResultPayload => {
    // We assume 'bestPetPower' is the displayed power of the user's STRONGEST pet in their inventory.
    // This is the anchor for Huges and Titanics.

    let basePower = values.bestPetPower;

    // Calculate total team output based on the inputs
    // (This calculator assumes the user fills the rest of their slots with similar pets or Huges)

    let totalPower = basePower;

    // Add Huges (Assume they deal 150% of best pet due to enchant/level scaling on avg)
    totalPower += (values.hugeCount * (basePower * 1.5));

    // Add Titanics (Assume 300% of best pet)
    totalPower += (values.titanicCount * (basePower * 3.0));

    // Apply Enchant Bonuses (Strength V = +100% etc)
    const enchantMult = 1 + (values.enchantBonus / 100);
    totalPower = totalPower * enchantMult;

    // "Effective Damage" usually involves a Cartoony factor in Roblox games, 
    // but we will display raw notation.

    const formattedPower = formatNumber(totalPower);

    let rank = "Novice Hatchler";
    let color = "text-slate-500";

    if (totalPower > 1000000000000000000) { // Quintillions
        rank = "Server Dominator (Quadrillions)";
        color = "text-red-500";
    } else if (totalPower > 1000000000000000) { // Quadrillions
        rank = "Pro Grinder (Trillions)";
        color = "text-purple-400";
    } else if (totalPower > 1000000000000) { // Trillions
        rank = "Tech World Veteran";
        color = "text-blue-400";
    } else {
        rank = "New Player";
        color = "text-green-400";
    }

    return {
        totalTeamPower: formattedPower,
        effectiveDamage: formatNumber(totalPower * 4) + " DPS (Est.)", // ticks 4 times a sec?
        oneShotThreshold: "Chests < " + formatNumber(totalPower / 2) + " HP",
        rank,
        rankColor: color,
    };
};

function formatNumber(num: number): string {
    if (num >= 1e21) return (num / 1e21).toFixed(2) + " Sx (Sextillion)";
    if (num >= 1e18) return (num / 1e18).toFixed(2) + " Qi (Quintillion)";
    if (num >= 1e15) return (num / 1e15).toFixed(2) + " Qa (Quadrillion)";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + " T (Trillion)";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + " B (Billion)";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + " M (Million)";
    return num.toLocaleString();
}

export default function RobloxPetSimPowerCalcInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bestPetPower: 1000000,
            petType: 'dark_matter',
            hugeCount: 0,
            titanicCount: 0,
            enchantBonus: 0,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculatePower(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Team Composition</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="bestPetPower"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Best Pet Raw Power (Number)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormDescription>Example: 1000000 for 1m</FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="hugeCount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Huge Pets</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="titanicCount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Titanic Pets</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="enchantBonus"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Enchant Bonus %</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormDescription>Sum of all Strength/Teamwork enchants (e.g. 500)</FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold text-white">
                                    CALCULATE DAMAGE
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>

            <div className="lg:col-span-2 space-y-6">
                {result ? (
                    <>
                        <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-orange-600/10 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Combat Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                                    <span className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 break-all">
                                        {result.totalTeamPower}
                                    </span>
                                    <span className="text-xl text-red-400 font-bold">Total Power</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="p-3 bg-white/10 rounded flex flex-col justify-center items-center text-center">
                                        <span className="text-lg font-bold text-yellow-400">{result.effectiveDamage}</span>
                                        <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">DPS Output</span>
                                    </div>
                                    <div className="p-3 bg-white/10 rounded flex flex-col justify-center items-center text-center">
                                        <span className="text-lg font-bold">{result.oneShotThreshold}</span>
                                        <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Insta-Break</span>
                                    </div>
                                </div>

                                <div className="mt-4 p-2 text-center text-xs text-slate-500">
                                    Rank: <span className={result.rankColor}>{result.rank}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    Max Power Strategy
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Your damage is scaling heavily off your <strong>Best Pet</strong>. Adding more Huges will only help if you keep upgrading that single Best Pet (e.g. to a Shiny Dark Matter Mythical).
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Skull className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Damage Calculator</h3>
                            <p>Simulate your team strength with Titanics, Huges, and Enchants.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BookOpen className="h-5 w-5 text-red-500" />
                                Understanding the Inputs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p><strong>Best Pet Power:</strong> Enter the power of your strongest pet (e.g. 500q). This is the 'Anchor' for your team.</p>
                            <p><strong>Huge/Titanic Count:</strong> These pets copy the Anchor pet's power. Huges do ~150%, Titanics ~300%.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BrainCircuit className="h-5 w-5 text-red-500" />
                                Formula Used
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p><strong>Team DPS Calculation:</strong></p>
                            <code className="bg-muted px-2 py-1 rounded block w-fit">Total = BestPet + &sum;(Huge &times; 1.5) + &sum;(Titanic &times; 3)</code>
                            <p>We then apply your total Enchant Multiplier (e.g. +300% from Super Teamwork).</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
