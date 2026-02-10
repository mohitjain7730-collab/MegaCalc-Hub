'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Percent, Egg, Calculator, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    petRarity: z.enum(['mythical', 'secret', 'huge', 'titanic']),
    baseOdds: z.string().min(1, "Enter base odds (e.g. 1 in 10000)"), // "10000" for 1 in 10k
    hatchesPerMinute: z.number().min(1).default(80), // Triple Hatch is ~80/min
    hoursFarming: z.number().min(0.5).default(8),
    gamepasses: z.object({
        lucky: z.boolean().default(false),
        superLucky: z.boolean().default(false),
        ultraLucky: z.boolean().default(false), // Magic Eggs / Shiny Hunter / etc
    }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalHatches: string;
    effectiveOdds: string;
    probabilityOfSuccess: string;
    expectedPets: string;
    timeToGuarantee: string;
};

const calculateHatchProb = (values: FormValues): ResultPayload => {
    // Parse Odds (Denominator)
    const baseDenom = parseFloat(values.baseOdds.replace(/,/g, ''));

    // Calculate Luck Multiplier
    let luckMult = 1.0;
    // PSX Luck is weird. Usually "Lucky" is small, "Super Lucky" is big.
    // Approximations based on community data:
    if (values.gamepasses.lucky) luckMult += 0.5; // +50%
    if (values.gamepasses.superLucky) luckMult += 1.0; // +100%
    if (values.gamepasses.ultraLucky) luckMult += 2.0; // +200% (Highball)

    // For Huge Pets, luck gamepasses OFTEN DO NOT WORK (or work very little).
    if (values.petRarity === 'huge' || values.petRarity === 'titanic') {
        luckMult = 1.0; // Assume 0 effect unless specifically server luck
        // But for "Mythical", luck works.
    }

    const effectiveDenom = baseDenom / luckMult;
    const probabilityPerHatch = 1 / effectiveDenom;

    // Total Attempts
    const totalHatches = Math.floor(values.hatchesPerMinute * 60 * values.hoursFarming);

    // Probability of AT LEAST ONE success = 1 - (1 - p)^n
    const pSuccess = 1 - Math.pow((1 - probabilityPerHatch), totalHatches);

    // Expected Value = n * p
    const expected = totalHatches * probabilityPerHatch;

    // Time to 50% probability (Coin Flip)
    // 0.5 = 1 - (1 - p)^n  =>  0.5 = (1 - p)^n  => ln(0.5) = n * ln(1-p) => n = ln(0.5) / ln(1-p)
    const hatchesForConfidence = Math.log(0.5) / Math.log(1 - probabilityPerHatch);
    const minutesForConfidence = hatchesForConfidence / values.hatchesPerMinute;
    const hoursForConfidence = minutesForConfidence / 60;

    return {
        totalHatches: totalHatches.toLocaleString(),
        effectiveOdds: `1 in ${Math.round(effectiveDenom).toLocaleString()}`,
        probabilityOfSuccess: (pSuccess * 100).toFixed(4) + "%",
        expectedPets: expected.toFixed(2),
        timeToGuarantee: hoursForConfidence.toFixed(1) + " Hours (for 50% chance)",
    };
};

export default function RobloxPSXHatchCalcInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            petRarity: 'huge',
            baseOdds: '1000000',
            hatchesPerMinute: 80,
            hoursFarming: 24,
            gamepasses: {
                lucky: false,
                superLucky: false,
                ultraLucky: false,
            },
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateHatchProb(values));
    };

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Hatching Setup</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="petRarity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Rarity</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="mythical">Mythical / Secret</SelectItem>
                                                    <SelectItem value="huge">Huge Pet</SelectItem>
                                                    <SelectItem value="titanic">Titanic Pet</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="baseOdds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Odds (Denominator)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 1000000 for 1 in 1m" {...field} />
                                            </FormControl>
                                            <FormDescription>If odds are 1 in 5,000, type "5000".</FormDescription>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hoursFarming"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>AFK Hours</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-2">
                                    <FormLabel>Luck Buffs</FormLabel>
                                    <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                                        <FormField
                                            control={form.control}
                                            name="gamepasses.superLucky"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Super Lucky / Server Luck</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gamepasses.ultraLucky"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Ultra Lucky / Huge Hunter</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 font-bold text-white">
                                SIMULATE HATCHING
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result ? (
                <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                    <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/40 to-purple-600/10 animate-pulse"></div>
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Probability Report</CardTitle>
                        </CardHeader>
                        <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Success Chance</h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-4xl font-black text-white">{result.probabilityOfSuccess}</p>
                                    </div>
                                    <p className="text-sm text-pink-300 mt-1">in {form.getValues().hoursFarming} hours (Total {result.totalHatches} eggs)</p>
                                </div>
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <h4 className="flex items-center gap-2 font-bold mb-1 text-yellow-400">
                                        <Percent className="h-4 w-4" /> Effective Odds:
                                    </h4>
                                    <p className="text-sm font-semibold">{result.effectiveOdds}</p>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col justify-center">
                                <div className="p-4 border border-white/10 bg-white/5 rounded-xl text-center">
                                    <p className="text-slate-400 text-sm mb-1">Time to 50% Chance</p>
                                    <p className="text-xl font-bold text-pink-200">{result.timeToGuarantee}</p>
                                </div>
                                <div className="text-center text-xs text-slate-500">
                                    Expected Pets: {result.expectedPets}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                    <div className="text-center space-y-4 max-w-sm">
                        <Calculator className="w-16 h-16 mx-auto opacity-20" />
                        <h3 className="text-lg font-semibold">Luck Calculator</h3>
                        <p>Input your setup to see if you are lucky or wasting time.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-pink-500" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Base Odds:</strong> The raw chance to hatch the pet (e.g., 1 in 10,000,000). You can find this on the wiki.</p>
                        <p><strong>Hatches Per Minute:</strong> Triple Hatch opens 3 eggs every ~3 seconds. This equals 60-80 eggs per minute.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-pink-500" />
                            Formula Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Binomial Probability:</strong></p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">Chance = 1 - (1 - Odds)^Hatches</code>
                        <p>This formula accurately calculates probability over multiple attempts.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
