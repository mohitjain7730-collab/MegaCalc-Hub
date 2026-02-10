'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, TrendingUp, Gem, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Base Values (Standardized Unit: 1 = Low Tier Legendary, e.g. Dragon)
// These are approximations for bulk estimation.
const VALUES = {
    legendary: 1.0,
    ultraRare: 0.15, // ~7 Ultra Rares = 1 Leg
    rare: 0.08,      // ~12 Rares = 1 Leg
    uncommon: 0.04,  // ~25 Uncommons = 1 Leg
    common: 0.02,    // ~50 Commons = 1 Leg
    neonMultiplier: 5.0, // Neon is worth 5x the base pet usually (4 pets + aging labor)
    megaMultiplier: 20.0, // Mega is worth 20x base (16 pets + massive labor)
};

const formSchema = z.object({
    legendaryCount: z.number().min(0).default(0),
    ultraRareCount: z.number().min(0).default(0),
    rareCount: z.number().min(0).default(0),
    // Neons
    neonLegendaryCount: z.number().min(0).default(0),
    neonUltraRareCount: z.number().min(0).default(0),
    // Megas
    megaLegendaryCount: z.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalValuePoints: number;
    equivalentShadows: string;
    equivalentTurtles: string;
    inventoryTier: string;
    tierColor: string;
};

const calculateInventory = (values: FormValues): ResultPayload => {
    let score = 0;

    // Singles
    score += values.legendaryCount * VALUES.legendary;
    score += values.ultraRareCount * VALUES.ultraRare;
    score += values.rareCount * VALUES.rare;

    // Neons
    score += values.neonLegendaryCount * (VALUES.legendary * VALUES.neonMultiplier);
    score += values.neonUltraRareCount * (VALUES.ultraRare * VALUES.neonMultiplier);

    // Megas
    score += values.megaLegendaryCount * (VALUES.legendary * VALUES.megaMultiplier);

    // Conversions
    // Shadow Dragon is approx 120-150 Points relative to low-tier legs (very rough estimate for fun comparison)
    // Turtle is approx 4-6 Points
    const shadows = (score / 130).toFixed(2);
    const turtles = (score / 5).toFixed(1);

    let tier = "Starter Collector";
    let color = "text-slate-500";

    if (score > 500) {
        tier = "ADOPT ME RICH (Top 0.1%)";
        color = "text-yellow-400"; // Gold
    } else if (score > 100) {
        tier = "High Tier Trader";
        color = "text-purple-400";
    } else if (score > 30) {
        tier = "Mid Tier (Solid Inventory)";
        color = "text-blue-400";
    } else if (score > 10) {
        tier = "Growing Collection";
        color = "text-green-400";
    }

    return {
        totalValuePoints: parseFloat(score.toFixed(1)),
        equivalentShadows: shadows,
        equivalentTurtles: turtles,
        inventoryTier: tier,
        tierColor: color,
    };
};

export default function RobloxAdoptMeCollectionValueInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            legendaryCount: 0,
            ultraRareCount: 0,
            rareCount: 0,
            neonLegendaryCount: 0,
            neonUltraRareCount: 0,
            megaLegendaryCount: 0,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateInventory(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Inventory Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <div className="space-y-3 p-3 bg-muted/40 rounded border">
                                    <h4 className="font-semibold text-sm">Singles (Normal)</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="legendaryCount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Legendary</FormLabel>
                                                    <FormControl><Input type="number" className="h-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="ultraRareCount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Ultra-Rare</FormLabel>
                                                    <FormControl><Input type="number" className="h-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="rareCount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Rare</FormLabel>
                                                    <FormControl><Input type="number" className="h-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 p-3 bg-purple-500/5 rounded border border-purple-500/20">
                                    <h4 className="font-semibold text-sm text-purple-600">Neons & Megas</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <FormField
                                            control={form.control}
                                            name="neonLegendaryCount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Neon Legs</FormLabel>
                                                    <FormControl><Input type="number" className="h-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="megaLegendaryCount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Mega Legs</FormLabel>
                                                    <FormControl><Input type="number" className="h-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-white">
                                    ESTIMATE VALUE
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
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-cyan-600/10 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Wealth Assessment</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                                    <span className="text-4xl font-black tracking-tight text-white">
                                        {result.totalValuePoints} <span className="text-lg font-normal text-slate-400">Points</span>
                                    </span>
                                </div>
                                <p className={`text-xl font-bold mb-4 ${result.tierColor}`}>
                                    Tier: {result.inventoryTier}
                                </p>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="p-3 bg-white/10 rounded flex flex-col justify-center items-center text-center">
                                        <span className="text-2xl font-bold">{result.equivalentTurtles}</span>
                                        <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Turtles</span>
                                    </div>
                                    <div className="p-3 bg-white/10 rounded flex flex-col justify-center items-center text-center">
                                        <span className="text-2xl font-bold">{result.equivalentShadows}</span>
                                        <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Shadow Dragons</span>
                                    </div>
                                </div>
                                <p className="text-xs text-center text-slate-500 mt-2">Rough equivalence based on bulk trading values.</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    Growth Strategy
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    To reach the next tier, focus on converting your {result.totalValuePoints > 50 ? "Neon Legendaries into High-Tiers like Crows or Owls" : "Random Rares into Legendary Pets"}. Consolidation is key to wealth.
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Gem className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Inventory Tracker</h3>
                            <p>Input your pet counts to calculate your total estimated net worth.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                Understanding the Inputs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p><strong>Singles:</strong> Count only your normal pets. Ignore Commons/Uncommons unless you have hundreds.</p>
                            <p><strong>Neons/Megas:</strong> These are worth exponentially more. A Mega Legendary is often worth 20-30x a normal one due to the time effort.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BrainCircuit className="h-5 w-5 text-blue-600" />
                                Formula Used
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>We use a <strong>Standardized Point System</strong> where 1 Point = 1 Low Tier Legendary (e.g. Dragon).</p>
                            <code className="bg-muted px-2 py-1 rounded block w-fit">Total = &sum; (Qty &times; Multiplier)</code>
                            <p>Neon Multiplier: 5x | Mega Multiplier: 20x</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
