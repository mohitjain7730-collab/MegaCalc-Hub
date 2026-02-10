'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Trophy, CheckCircle2, Lock, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const REBIRTH_DATA = {
    1: { name: 'Rebirth 1', cost: 75000, currency: 'Coins', reward: '+15% Damage', features: 'Teleport to Spawn', difficulty: 'Easy' },
    2: { name: 'Rebirth 2', cost: 1000000, currency: 'Coins', reward: '+35% Damage (Total)', features: 'Bank Access', difficulty: 'Medium' },
    3: { name: 'Rebirth 3 (The Void)', cost: 10000000, currency: 'Coins', reward: '+50% Damage (Total)', features: 'Hardcore Mode / Tech World', difficulty: 'Hard' },
    4: { name: 'Rebirth 4 (Cat World)', cost: 1000000000, currency: 'Coins', reward: '+75% Damage (Total)', features: 'Cat World', difficulty: 'Expert' },
    5: { name: 'Hugetron (Optional)', cost: 10000000000, currency: 'Coins', reward: 'Machine Access', features: 'Huge-A-Tron', difficulty: 'Extreme' },
};

const formSchema = z.object({
    currentRank: z.string(), // e.g. "Noob", "Pro"
    targetRebirth: z.string(), // "1", "2", "3"
    coinIncomePerMinute: z.number().min(0).default(100),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    costDetails: string;
    featuresGained: string;
    damageBoost: string;
    timeToRebirth: string;
    verdict: string;
};

const calculateRebirth = (values: FormValues): ResultPayload => {
    const target = REBIRTH_DATA[values.targetRebirth as unknown as keyof typeof REBIRTH_DATA];

    // Time Estimate
    const cost = target.cost;
    const income = values.coinIncomePerMinute;

    let timeString = "Instant (if you have coins)";
    if (income > 0) {
        const minutes = cost / income;
        if (minutes < 60) timeString = `${Math.ceil(minutes)} Minutes`;
        else timeString = `${(minutes / 60).toFixed(1)} Hours`;

        if (cost === 0) timeString = "Completed";
    }

    let verdict = "RECOMMENDED";
    if (target.difficulty === "Hard" || target.difficulty === "Expert") {
        verdict = "GRIND REQUIRED";
    }

    return {
        costDetails: new Intl.NumberFormat('en-US').format(target.cost) + " " + target.currency,
        featuresGained: target.features,
        damageBoost: target.reward,
        timeToRebirth: timeString,
        verdict
    };
};

export default function RobloxPSXRebirthCalcInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentRank: 'Noob',
            targetRebirth: '1',
            coinIncomePerMinute: 5000,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateRebirth(values));
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Progression Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="targetRebirth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Next Goal</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(REBIRTH_DATA).map(([key, data]) => (
                                                        <SelectItem key={key} value={key}>{data.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="coinIncomePerMinute"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Coin Income (per minute)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormDescription>Estimate how many coins you farm in 60s.</FormDescription>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 font-bold text-white">
                                CHECK REQUIREMENTS
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result ? (
                <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                    <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-900/40 to-emerald-600/10 animate-pulse"></div>
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Rebirth Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Cost</h4>
                                    <p className="text-3xl font-black text-white">{result.costDetails}</p>
                                </div>
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <h4 className="flex items-center gap-2 font-bold mb-1 text-yellow-400">
                                        <Trophy className="h-4 w-4" /> Rewards Gained:
                                    </h4>
                                    <p className="text-sm font-semibold">{result.damageBoost}</p>
                                    <p className="text-xs text-slate-300 mt-1">{result.featuresGained}</p>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col justify-center">
                                <div className="p-4 border border-white/10 bg-white/5 rounded-xl text-center">
                                    <p className="text-slate-400 text-sm mb-1">Time to Unlock</p>
                                    <p className="text-2xl font-bold text-green-400">{result.timeToRebirth}</p>
                                </div>
                                <div className="text-center">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-900/50 text-green-200 text-xs font-medium">
                                        <CheckCircle2 className="h-3 w-3" /> Status: {result.verdict}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                    <div className="text-center space-y-4 max-w-sm">
                        <Lock className="w-16 h-16 mx-auto opacity-20" />
                        <h3 className="text-lg font-semibold">Calculator Ready</h3>
                        <p>Calculate your next evolutionary step in Pet Sim X.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-green-500" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Next Goal:</strong> Select the Rebirth stage you want to reach (e.g. Rebirth 2 unlocks the Banking system).</p>
                        <p><strong>Coin Income:</strong> Enter your estimated coins per minute. Use 'Cartoon Coins' enchants to boost this number.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-green-500" />
                            Formula Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Time Calculation:</strong></p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">Time = Cost / Income_Per_Minute</code>
                        <p>We calculate how long you need to AFK grind to afford the upgrade.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
