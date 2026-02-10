'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Calculator,
    Zap,
    Trophy,
    Target,
    Activity,
    BrainCircuit,
    Dna
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
    eggPrice: z.number({ invalid_type_error: 'Enter cost' }).min(0, "Price cannot be negative").default(100),
    targetOdds: z.number({ invalid_type_error: 'Enter odds %' }).min(0.000001).max(100),
    hatchesPerClick: z.number().min(1).max(8).default(1),
    autoHatchSpeed: z.number().min(1).default(1),
    luckMultiplier: z.number().min(1).default(1),
    budget: z.number().optional()
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    trueOdds: string;
    hatchesForOne: string;
    hatchesForOneRaw: number;
    costForOne: string;
    costForOneRaw: number;
    probabilityInBudget: string;
    timeToHatch: string;
    status: 'impossible' | 'hard' | 'moderate' | 'easy' | 'guaranteed';
    interpretation: string;
    recommendations: string[];
    plan: { label: string; detail: string }[];
    simulation: {
        attempts: number;
        didHatch: boolean;
        cost: number;
    };
};

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString();
}

function calculateBinomial(p: number, n: number): number {
    // Probability of at least 1 success in n trials = 1 - (1-p)^n
    return 1 - Math.pow(1 - p, n);
}

const calculateResult = (values: FormValues): ResultPayload => {
    const { eggPrice, targetOdds, hatchesPerClick, autoHatchSpeed, luckMultiplier, budget } = values;

    // 1. Calculate True Odds (Base * Luck)
    // Note: Most Roblox games cap luck or have specific formulas. We assume a simple multiplier here for estimation.
    const baseProb = targetOdds / 100;
    const trueProb = Math.min(baseProb * luckMultiplier, 1.0);

    // 2. Geometric Distribution for Expected Hatches (E = 1/p)
    // Getting 1 pet on average
    const expectedHatches = Math.ceil(1 / trueProb);
    const expectedCost = expectedHatches * eggPrice;

    // 3. Time calculation
    // Assume autoHatchSpeed is "seconds per batch"
    const totalBatches = Math.ceil(expectedHatches / hatchesPerClick);
    const totalSeconds = totalBatches * autoHatchSpeed;

    let timeString = '';
    if (totalSeconds < 60) timeString = `${totalSeconds}s`;
    else if (totalSeconds < 3600) timeString = `${(totalSeconds / 60).toFixed(1)}m`;
    else if (totalSeconds < 86400) timeString = `${(totalSeconds / 3600).toFixed(1)}h`;
    else timeString = `${(totalSeconds / 86400).toFixed(1)} days`;

    // 4. Budget Probability
    let probInBudget = 0;
    if (budget && budget > 0) {
        const hatchesPossible = Math.floor(budget / eggPrice);
        probInBudget = calculateBinomial(trueProb, hatchesPossible) * 100;
    }

    // 5. Status & Interpretation
    let status: ResultPayload['status'] = 'moderate';
    let interpretation = '';

    if (expectedHatches > 100000) {
        status = 'impossible';
        interpretation = 'This is a "Mythical" grind. You are fighting RNG.';
    } else if (expectedHatches > 10000) {
        status = 'hard';
        interpretation = 'Requires significant AFK time and luck.';
    } else if (expectedHatches > 1000) {
        status = 'moderate';
        interpretation = 'A reasonable grind. Doable in a few hours.';
    } else if (expectedHatches > 100) {
        status = 'easy';
        interpretation = 'You should get this quickly.';
    } else {
        status = 'guaranteed';
        interpretation = 'Almost guaranteed in a few clicks.';
    }

    // Simulation: Run a loop up to 10x expected to see if we get lucky
    // We simulate "batches" for performance
    const simLimit = Math.min(expectedHatches * 5, 100000); // Prevent infinite loop on UI
    // For standard simulation display, we just use the expected value logic 
    // because random simulations are confusing for users if they change every render.
    // Instead, we show the "p50" (50% chance point) vs "p90" (90% chance point).

    const p50Hatches = Math.ceil(Math.log(0.5) / Math.log(1 - trueProb));
    const p90Hatches = Math.ceil(Math.log(0.1) / Math.log(1 - trueProb));
    const p99Hatches = Math.ceil(Math.log(0.01) / Math.log(1 - trueProb));

    const recommendations = [
        `True Probability: ${(trueProb * 100).toFixed(4)}% (Base: ${targetOdds}%)`,
        `The "Lucky" Break: 50% of players get it by ${formatNumber(p50Hatches)} hatches.`,
        `The "Unlucky" Grind: To be 99% sure you get it, you need ${formatNumber(p99Hatches)} hatches.`,
        `Cost of Certainty: ${formatNumber(p99Hatches * eggPrice)} Robux/Coins to virtually guarantee it.`
    ];

    const plan = [
        {
            label: 'Setup',
            detail: `Equip ${luckMultiplier}x luck. Enable ${hatchesPerClick}-hatch. Expect to spend ~${formatNumber(expectedCost)} currency.`
        },
        {
            label: 'AFK Estimate',
            detail: `It will take approx ${timeString} of continuous hatching to hit the average drop rate.`
        }
    ];

    return {
        trueOdds: (trueProb * 100).toFixed(5) + '%',
        hatchesForOne: formatNumber(expectedHatches),
        hatchesForOneRaw: expectedHatches,
        costForOne: formatNumber(expectedCost),
        costForOneRaw: expectedCost,
        probabilityInBudget: probInBudget > 0 ? probInBudget.toFixed(2) + '%' : 'N/A',
        timeToHatch: timeString,
        status,
        interpretation,
        recommendations,
        plan,
        simulation: {
            attempts: p50Hatches,
            didHatch: true,
            cost: p50Hatches * eggPrice
        }
    };
};

export default function RobloxEggHatchOddsSimulatorInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            eggPrice: 1000,
            targetOdds: 0.5,
            hatchesPerClick: 3,
            autoHatchSpeed: 3, // ~3 seconds per hatch animation
            luckMultiplier: 1,
            budget: undefined
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateResult(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Calculator */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><Calculator className="h-4 w-4" /> Simulator Config</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="eggPrice"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold text-amber-500">Egg Price</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="bg-amber-500/5 border-amber-200" placeholder="e.g. 5000" />
                                                </FormControl>
                                                <FormDescription className="text-xs">Coins/Diamonds per egg</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="targetOdds"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold text-blue-500">Target Odds (%)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.000001" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} className="bg-blue-500/5 border-blue-200" placeholder="e.g. 0.001" />
                                                </FormControl>
                                                <FormDescription className="text-xs">Base chance listed in-game</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="luckMultiplier"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Luck Multiplier</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormDescription className="text-xs">Total Boost (Gamepass + Potions)</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="hatchesPerClick"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Eggs per Hatch</FormLabel>
                                                <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={field.value.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select amount" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="1">1 Egg (Single)</SelectItem>
                                                        <SelectItem value="3">3 Eggs (Triple)</SelectItem>
                                                        <SelectItem value="8">8 Eggs (Octuple)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormDescription className="text-xs">Number of eggs opened at once</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="pt-4 border-t">
                                    <FormField
                                        control={form.control}
                                        name="budget"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Your Balance (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} placeholder="How many coins do you have?" />
                                                </FormControl>
                                                <FormDescription className="text-xs">To calculate your specific chance</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg">
                                    RUN SIMULATION
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {result && (
                    <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                        <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">RNG Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Average Cost to Hatch</h4>
                                    <p className="text-4xl font-black tracking-tight text-white mb-1">
                                        {result.costForOne}
                                    </p>
                                    <p className="text-sm text-purple-400 font-medium">
                                        ~{result.hatchesForOne} attempts
                                    </p>

                                    <div className="mt-6 flex items-center gap-4">
                                        <div className="bg-white/10 p-3 rounded-lg text-center min-w-[80px]">
                                            <div className="text-xs text-slate-400">Time</div>
                                            <div className="font-bold text-sm">{result.timeToHatch}</div>
                                        </div>
                                        {result.probabilityInBudget !== 'N/A' && (
                                            <div className="bg-white/10 p-3 rounded-lg text-center min-w-[80px]">
                                                <div className="text-xs text-slate-400">Your Chance</div>
                                                <div className={`font-bold text-sm ${parseFloat(result.probabilityInBudget) > 50 ? 'text-emerald-400' : 'text-amber-400'}`}>{result.probabilityInBudget}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="p-3 bg-white/5 rounded border border-white/10">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-300">Base Odds</span>
                                            <span className="text-slate-500">{result.trueOdds}</span>
                                        </div>
                                    </div>

                                    <h4 className="text-xs font-bold text-slate-500 uppercase mt-4 mb-2">Confidence Intervals</h4>
                                    {result.recommendations.slice(1).map((rec, i) => (
                                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                            <div className="w-1 h-1 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                                            <span>{rec}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BrainCircuit className="h-5 w-5 text-purple-600" />
                                The Math of RNG
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-muted-foreground">
                            <p><strong>Gambler's Fallacy:</strong> Hatching 100 eggs at 1% odds does NOT satisfy the 100%. It only gives you a 63.2% chance.</p>
                            <p><strong>Formula:</strong> We use the Geometric Distribution to find the expected trials.</p>
                            <code className="bg-muted px-2 py-1 rounded block w-fit">Trials = 1 / (Odds * Luck)</code>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Dna className="h-5 w-5 text-purple-600" />
                                Binomial Probability
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>To calculate your chance with a specific budget, we calculate the odds of failing every single time, then invert it.</p>
                            <p>This reveals the "Unlucky" reality of hatching games.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Right Column: Context & Guide */}
            <div className="space-y-6">
                <Card className="bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-900/10">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-600" />
                            Rarity Tier Guide
                        </CardTitle>
                        <CardDescription>Typical Odds in Roblox</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3 text-left">Rarity</th>
                                    <th className="p-3 text-right">Odds</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {[
                                    { r: 'Common', v: '50-100%' },
                                    { r: 'Rare', v: '10-25%' },
                                    { r: 'Legendary', v: '1-5%' },
                                    { r: 'Mythical', v: '0.01-0.1%' },
                                    { r: 'Exclusive', v: '< 0.0001%' },
                                    { r: 'Titanic', v: '< 0.000001%' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-muted/50">
                                        <td className="p-3 font-medium">{row.r}</td>
                                        <td className="p-3 text-right text-muted-foreground font-mono">{row.v}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Strategy Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                            <h4 className="font-bold text-amber-600 flex items-center gap-2"><Zap className="h-3 w-3" /> Use Potions</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Always stack max potions before hatching. A 2x potion literally halves your cost.
                            </p>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg">
                            <h4 className="font-bold text-blue-600 flex items-center gap-2"><Trophy className="h-3 w-3" /> Batch Hatching</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                                Triple/Octuple Hatch reduces the real-world time needed by 3x-8x. Vital for AFK.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Scenario: The Titanic</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>Titanic pets often have odds like <strong>1 in 100 million</strong> (0.000001%).</p>
                        <p>Even with 3x hatch speed, this would take ~10 years of continuous hatching on average.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
