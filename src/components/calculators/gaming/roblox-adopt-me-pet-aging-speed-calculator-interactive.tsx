'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Star, Trophy, Gauge } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Constants
const BASE_TASKS_PER_HOUR = 30; // Roughly 1 task every 2 mins on average across cycles
const RARITY_TASKS = {
    common: 56,
    uncommon: 70,
    rare: 96,
    ultraRare: 150,
    legendary: 189,
};

const STRATEGIES = [
    { value: 'solo', label: 'Solo (1 Pet)', multiplier: 1, description: 'Normal gameplay with one pet.' },
    { value: 'family_1', label: 'Family + 1 Alt (2 Pets)', multiplier: 2, description: 'You + 1 Alt Account carrying a pet.' },
    { value: 'family_2', label: 'Family + 2 Alts (3 Pets)', multiplier: 3, description: 'You + 2 Alts (Hard to manage).' },
    { value: 'baby', label: 'Turn into Baby (2x Cash)', multiplier: 1, description: 'Playing as baby doubles cash but NOT aging speed.' },
];

const EVENTS = [
    { value: 'none', label: 'Normal Days', multiplier: 1 },
    { value: 'weekend', label: '2x Aging Weekend', multiplier: 2 },
];

const formSchema = z.object({
    strategy: z.string(),
    event: z.string(),
    targetRarity: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    effectiveRate: number; // Pets per hour equivalent
    timeToFullGrown: string; // For 1 pet in hours
    speedUpFactor: string; // 2x, 4x, etc
    totalEfficiency: string; // "Massive", "Standard"
};

const calculateSpeed = (values: FormValues): ResultPayload => {
    const strategy = STRATEGIES.find(s => s.value === values.strategy)!;
    const event = EVENTS.find(e => e.value === values.event)!;
    const tasksNeeded = RARITY_TASKS[values.targetRarity as keyof typeof RARITY_TASKS];

    // Base Calculation
    // Total Tasks Per Hour = Base Rate * Strategy Multiplier * Event Multiplier
    // Note: Strategy Multiplier means doing multiple pets at once. 
    // It doesn't make ONE pet faster, but it makes OVERALL progress faster.
    // However, 2x event DOES make one pet faster.

    // speed on a SINGLE pet
    const singlePetSpeedMultiplier = event.multiplier;
    const tasksPerHourPerPet = BASE_TASKS_PER_HOUR * singlePetSpeedMultiplier;

    const hoursForOnePet = tasksNeeded / tasksPerHourPerPet;

    // effective yield (Tasks cleared per hour across all accounts)
    const effectiveTasksPerHour = tasksPerHourPerPet * strategy.multiplier;

    // Speedup factor vs baseline solo normal
    const speedFactor = (effectiveTasksPerHour / BASE_TASKS_PER_HOUR).toFixed(1);

    const hours = Math.floor(hoursForOnePet);
    const minutes = Math.round((hoursForOnePet - hours) * 60);

    let efficiencyRating = "Standard";
    if (parseFloat(speedFactor) >= 4) efficiencyRating = "God Mode (Max Efficiency)";
    else if (parseFloat(speedFactor) >= 2) efficiencyRating = "High Efficiency";
    else if (parseFloat(speedFactor) > 1) efficiencyRating = "Boosted";

    return {
        effectiveRate: effectiveTasksPerHour,
        timeToFullGrown: `${hours}h ${minutes}m`,
        speedUpFactor: `${speedFactor}x`,
        totalEfficiency: efficiencyRating,
    };
};

export default function RobloxAdoptMeAgingSpeedInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            strategy: 'solo',
            event: 'none',
            targetRarity: 'legendary',
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateSpeed(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Strategy Config</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="strategy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Grinding Method</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Method" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {STRATEGIES.map((s) => (
                                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="event"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Active Event</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Event Status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {EVENTS.map((e) => (
                                                        <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="targetRarity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Pet Rarity</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Rarity" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.keys(RARITY_TASKS).map((k) => (
                                                        <SelectItem key={k} value={k}>{k.charAt(0).toUpperCase() + k.slice(1)}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                                    CALCULATE SPEED
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
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Aging Efficiency</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black tracking-tight text-white mb-2">
                                        {result.speedUpFactor}
                                    </span>
                                    <span className="text-xl text-yellow-400 font-bold">Speed</span>
                                </div>
                                <p className="text-sm text-slate-400">
                                    Status: <strong className="text-white">{result.totalEfficiency}</strong> compared to solo/normal play.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Time to Full Grown</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        <Gauge className="h-5 w-5 text-blue-500" />
                                        {result.timeToFullGrown}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Per single pet active time</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Productivity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        <Trophy className="h-5 w-5 text-green-500" />
                                        {result.effectiveRate} tasks/hr
                                    </div>
                                    <p className="text-xs text-muted-foreground">Total cleared across all accounts</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                    Strategy Insight
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {result.effectiveRate > 40
                                        ? "You are maximizing your time! This is the method pro grinders use to make Megas quickly."
                                        : "You are leveling at a standard pace. Consider adding an Alt account to double your speed without extra effort."}
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Users className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Speed Analyzer</h3>
                            <p>Select your grinding method to see exactly how much faster you could be leveling.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
