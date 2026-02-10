'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Percent, AlertCircle, Trophy, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

// Constants based on official Adopt Me Egg Odds
const EGG_ODDS = {
    'cracked_egg': { name: 'Cracked Egg', legendary: 0.015 }, // 1.5%
    'pet_egg': { name: 'Pet Egg', legendary: 0.03 }, // 3%
    'royal_egg': { name: 'Royal Egg', legendary: 0.08 }, // 8%
    'urban_egg': { name: 'Urban Egg (Gumball)', legendary: 0.05 }, // 5% (Avg for non-perm)
    'desert_egg': { name: 'Desert Egg', legendary: 0.05 },
    'garden_egg': { name: 'Garden Egg', legendary: 0.05 },
    'retired_egg': { name: 'Retired Egg (VIP)', legendary: 0.03 },
    'danger_egg': { name: 'Danger Egg', legendary: 0.05 },
};

const formSchema = z.object({
    eggType: z.string(),
    eggsToHatch: z.number().min(1).max(1000).default(10),
    targetPets: z.number().min(1).max(100).default(1),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    probAtLeastOne: string;
    probTarget: string;
    expectedLegendaries: number;
    eggsFor99: number;
    luckRating: string;
};

const calculateProbabilities = (values: FormValues): ResultPayload => {
    const egg = EGG_ODDS[values.eggType as keyof typeof EGG_ODDS];
    const p = egg.legendary; // Probability of success per trial
    const n = values.eggsToHatch; // Number of trials
    // const k = values.targetPets; // Target successes - unused in simplified view

    // 1. Expected Value (Mean) = n * p
    const expected = n * p;

    // 2. Probability of getting AT LEAST 'k' legendaries
    // P(X >= k) = 1 - P(X < k)
    // Using simple Binomial approximation logic for common cases:

    // For "At least one" (k=1):
    // P(X >= 1) = 1 - P(X = 0) = 1 - (1-p)^n
    const probNone = Math.pow(1 - p, n);
    const probAtLeastOne = (1 - probNone) * 100;

    // 3. How many eggs for 99% certainty?
    // 0.99 = 1 - (1-p)^x  =>  0.01 = (1-p)^x  => log(0.01) = x * log(1-p)
    const eggsFor99 = Math.ceil(Math.log(0.01) / Math.log(1 - p));

    let luck = "Average";
    if (expected < 0.5) luck = "High Luck Needed";
    else if (expected < 1.5) luck = "Coin Flip Territory";
    else if (expected >= 3) luck = "Statistically Likely";

    return {
        probAtLeastOne: probAtLeastOne.toFixed(2) + "%",
        probTarget: "N/A", // Not displaying complex binomial for k>1 in this simple view
        expectedLegendaries: parseFloat(expected.toFixed(2)),
        eggsFor99,
        luckRating: luck
    };
};

export default function RobloxAdoptMeLegendaryProbInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            eggType: 'royal_egg',
            eggsToHatch: 10,
            targetPets: 1,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateProbabilities(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Hatch Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="eggType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Egg Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(EGG_ODDS).map(([key, data]) => (
                                                        <SelectItem key={key} value={key}>
                                                            {data.name} ({(data.legendary * 100).toFixed(1)}%)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="eggsToHatch"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Eggs: {field.value}</FormLabel>
                                            <FormControl>
                                                <Slider
                                                    min={1}
                                                    max={100}
                                                    step={1}
                                                    value={[field.value]}
                                                    onValueChange={(vals) => field.onChange(vals[0])}
                                                />
                                            </FormControl>
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>1</span>
                                                <span>100</span>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                <div className="text-right">
                                    <Input
                                        type="number"
                                        value={form.watch('eggsToHatch')}
                                        onChange={(e) => form.setValue('eggsToHatch', parseInt(e.target.value) || 0)}
                                        className="w-20 ml-auto"
                                    />
                                </div>

                                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 font-bold">
                                    CALCULATE ODDS
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
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Probability of Success</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-5xl font-black tracking-tight text-white mb-2">
                                        {result.probAtLeastOne}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400">
                                    Chance to hatch <strong>at least ONE Legendary</strong> from {form.watch('eggsToHatch')} eggs.
                                </p>

                                <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded flex items-center gap-2">
                                    <Target className="h-5 w-5 text-purple-400" />
                                    <span className="text-sm">Expected Statistically: <strong>{result.expectedLegendaries}</strong> Legendaries</span>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Goal: 99% Certainty</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                                        {result.eggsFor99} Eggs
                                    </div>
                                    <p className="text-xs text-muted-foreground">Needed for near-guarantee</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Luck Assessment</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-green-500" />
                                        {result.luckRating}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Difficulty rating</p>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Percent className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Ready to Calculate</h3>
                            <p>Select your egg type to see the math behind the RNG.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
