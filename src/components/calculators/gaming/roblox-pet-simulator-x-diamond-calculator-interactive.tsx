'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, TrendingUp, Gem, BookOpen, BrainCircuit } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// PSX Rank Data (Diamonds Reward Scaling)
const RANKS = {
    'noob': { name: 'Noob', reward: 1000 },
    'starter': { name: 'Starter', reward: 2500 },
    'god': { name: 'God', reward: 20000 },
    'hacker': { name: 'Hacker', reward: 60000 },
    'top_one': { name: 'The Best', reward: 125000 }, // Approximations for logic
};

const FARMING_AREAS = {
    'tech_world': { name: 'Tech World (Chest)', baseYield: 50000 },
    'fantasy_world': { name: 'Fantasy World (Samurai)', baseYield: 25000 },
    'spawn_world': { name: 'Spawn World (Magma)', baseYield: 10000 },
    'pixel_world': { name: 'Pixel World (Vault)', baseYield: 150000 },
    'cat_world': { name: 'Cat World (Throne)', baseYield: 300000 },
    'diamond_mine': { name: 'Diamond Mine (Mystic)', baseYield: 500000 }, // High yield
};

const formSchema = z.object({
    rank: z.string(),
    area: z.string(),
    gamepasses: z.object({
        vip: z.boolean().default(false),
        doubleDiamonds: z.boolean().default(false),
        tripleDiamonds: z.boolean().default(false), // Boost
    }),
    petsEquipped: z.number().min(1).max(25).default(4),
    enchantMultiplier: z.number().min(1).max(100).default(1), // "Diamonds IV" etc
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    hourlyRate: string;
    dailyRate: string;
    vipBonus: string;
    efficiencyRating: string;
    efficiencyColor: string;
};

const calculateDiamonds = (values: FormValues): ResultPayload => {
    const area = FARMING_AREAS[values.area as keyof typeof FARMING_AREAS];

    // Base Calculation
    let hourly = area.baseYield;

    // Multipliers
    let multiplier = 1.0;
    if (values.gamepasses.vip) multiplier += 0.1; // +10%? VIP usually gives interest tweaks
    if (values.gamepasses.doubleDiamonds) multiplier *= 2;
    if (values.gamepasses.tripleDiamonds) multiplier *= 3; // Server Boosts

    // Enchant Multiplier (e.g., Diamond V enchants on all pets)
    // Assume input 1 = 1x (No extra), 2 = 2x (All Diamond V)
    multiplier *= values.enchantMultiplier;

    // Rank Rewards are separate (Usually every 4-6 hours? Let's amortize to hourly)
    // Just adding rank reward context or boosting base yield slightly for faster chest breaking
    // We'll treat rank as a flat bonus per 6 hours -> divide by 6 for hourly context
    const rankReward = RANKS[values.rank as keyof typeof RANKS] ? RANKS[values.rank as keyof typeof RANKS].reward / 6 : 0;

    let finalHourly = (hourly * multiplier) + rankReward;
    let finalDaily = finalHourly * 24;

    // Cap sensible limits for display logic (PSX scaling is insane)
    if (area.name.includes("Diamond Mine")) {
        finalHourly = finalHourly * 3; // Buff for mine
    }

    let efficiencyRating = "Casual Farmer";
    let color = "text-slate-400";

    if (finalHourly > 10000000) {
        efficiencyRating = "Diamond Billionaire";
        color = "text-yellow-400";
    } else if (finalHourly > 1000000) {
        efficiencyRating = "Pro Grinder";
        color = "text-purple-400";
    } else if (finalHourly > 200000) {
        efficiencyRating = "Efficient";
        color = "text-blue-400";
    }

    return {
        hourlyRate: new Intl.NumberFormat('en-US').format(Math.floor(finalHourly)),
        dailyRate: new Intl.NumberFormat('en-US').format(Math.floor(finalDaily)),
        vipBonus: values.gamepasses.vip ? "Active" : "Inactive",
        efficiencyRating,
        efficiencyColor: color,
    };
};

export default function RobloxPetSimDiamondCalcInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rank: 'god',
            area: 'diamond_mine',
            gamepasses: {
                vip: false,
                doubleDiamonds: false,
                tripleDiamonds: false,
            },
            petsEquipped: 4,
            enchantMultiplier: 1,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateDiamonds(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Farming Setup</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="area"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Farming Zone</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(FARMING_AREAS).map(([key, data]) => (
                                                        <SelectItem key={key} value={key}>{data.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rank"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Player Rank (Rewards)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(RANKS).map(([key, data]) => (
                                                        <SelectItem key={key} value={key}>{data.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <div className="space-y-2">
                                    <FormLabel>Gamepass Multipliers</FormLabel>
                                    <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                                        <FormField
                                            control={form.control}
                                            name="gamepasses.doubleDiamonds"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>Double Diamonds (Gamepass)</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gamepasses.tripleDiamonds"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>Triple Diamonds (Boost)</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="enchantMultiplier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Enchant Strength (1x - 5x Estimate)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormDescription className="text-xs">Estimate your total 'Royalty' or 'Diamond' enchant power.</FormDescription>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 font-bold text-white">
                                    CALCULATE YIELD
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
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/40 to-blue-600/10 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Yield Estimates</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                                        {result.hourlyRate}
                                    </span>
                                    <span className="text-xl text-cyan-400 font-bold">💎 / Hour</span>
                                </div>

                                <div className="p-4 bg-white/10 rounded-lg border border-white/20 mt-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-slate-300">Daily Potential (AFK)</div>
                                        <div className="text-2xl font-bold text-white">{result.dailyRate}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-lg font-bold ${result.efficiencyColor}`}>{result.efficiencyRating}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    Optimization Tip
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    To reach rank <strong>{result.efficiencyRating === "Diamond Billionaire" ? "Trillionaire" : "Billionaire"}</strong>, focus on unlocking the Diamond Mine. It provides 3x-5x better drops than regular worlds. Ensure your pets have the 'Diamonds V' enchant.
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Sparkles className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Gem Forecaster</h3>
                            <p>Set up your grind parameters to see how rich you will become.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BookOpen className="h-5 w-5 text-cyan-500" />
                                Understanding the Inputs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p><strong>Farming Zone:</strong> Select the area you are grinding in (e.g. Diamond Mine). Deeper areas yield significantly more gems.</p>
                            <p><strong>Enchant Multiplier:</strong> Estimate the total boost from your pet enchants. 'Diamonds V' adds +50% per pet.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BrainCircuit className="h-5 w-5 text-cyan-500" />
                                Formula Used
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p><strong>Yield Formula:</strong></p>
                            <code className="bg-muted px-2 py-1 rounded block w-fit">Yield = (Base Area Rate &times; (1 + Boosts) &times; Enchants) + Rank Bonus</code>
                            <p>We assume perfect AFK efficiency (breaking chests instantly).</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
