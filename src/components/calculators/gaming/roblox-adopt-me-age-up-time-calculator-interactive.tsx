'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Timer, Calendar, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';

// Data Constants
const AGING_DATA = {
    common: { name: 'Common', totalTasks: 56, timeMinutes: 60 },
    uncommon: { name: 'Uncommon', totalTasks: 70, timeMinutes: 90 },
    rare: { name: 'Rare', totalTasks: 96, timeMinutes: 150 },
    ultraRare: { name: 'Ultra-Rare', totalTasks: 150, timeMinutes: 240 },
    legendary: { name: 'Legendary', totalTasks: 189, timeMinutes: 360 },
};

const AGES = [
    { value: 0, label: 'Newborn', progress: 0 },
    { value: 1, label: 'Junior', progress: 0.15 },
    { value: 2, label: 'Pre-Teen', progress: 0.35 },
    { value: 3, label: 'Teen', progress: 0.55 },
    { value: 4, label: 'Post-Teen', progress: 0.75 },
    { value: 5, label: 'Full Grown', progress: 1.0 },
];

const formSchema = z.object({
    rarity: z.enum(['common', 'uncommon', 'rare', 'ultraRare', 'legendary']),
    currentAge: z.string(),
    targetAge: z.string(),
    numberOfPets: z.number().min(1).max(16).default(1),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalMinutes: number;
    totalHours: string;
    tasksRequired: number;
    sessionsRequired: number; // Approx game days
};

const calculateTime = (values: FormValues): ResultPayload => {
    const rarityData = AGING_DATA[values.rarity as keyof typeof AGING_DATA];
    const startIdx = parseInt(values.currentAge);
    const endIdx = parseInt(values.targetAge);

    // Calculate percentage of growth needed
    // Simplified model: Each stage assumes equal-ish distribution for estimation, 
    // though real Adopt Me stages vary. We'll use linear approximations of remaining work.

    // Get progress value of start and end
    const startProgress = AGES.find(a => a.value === startIdx)?.progress || 0;
    const endProgress = AGES.find(a => a.value === endIdx)?.progress || 1;

    let progressNeeded = endProgress - startProgress;
    if (progressNeeded < 0) progressNeeded = 0;

    const singlePetTasks = Math.ceil(rarityData.totalTasks * progressNeeded);
    const singlePetMinutes = Math.ceil(rarityData.timeMinutes * progressNeeded);

    const totalTasks = singlePetTasks * values.numberOfPets;
    const totalMinutes = singlePetMinutes * values.numberOfPets;

    // Approx 15 mins per "Game Day" or ~7-8 tasks per day
    const sessionsRequired = Math.ceil(totalTasks / 8);

    return {
        totalMinutes,
        totalHours: (totalMinutes / 60).toFixed(1),
        tasksRequired: totalTasks,
        sessionsRequired
    };
};

export default function RobloxAdoptMeAgeUpTimeInteractive() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rarity: 'legendary',
            currentAge: '0',
            targetAge: '5',
            numberOfPets: 1,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateTime(values));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Pet Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                <FormField
                                    control={form.control}
                                    name="rarity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Rarity</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select rarity" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(AGING_DATA).map(([key, data]) => (
                                                        <SelectItem key={key} value={key}>{data.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="currentAge"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Age</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Start" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {AGES.map((age) => (
                                                            <SelectItem key={age.value} value={age.value.toString()}>{age.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="targetAge"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Target Age</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="End" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {AGES.map((age) => (
                                                            <SelectItem key={age.value} value={age.value.toString()}>{age.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="numberOfPets"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Pets</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                                />
                                            </FormControl>
                                            <CardDescription className="text-xs">
                                                Enter 4 for a Neon, 16 for a Mega.
                                            </CardDescription>
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 font-bold">
                                    CALCULATE TIME
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
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 animate-pulse"></div>
                            <CardHeader className="relative pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">Total Estimated Grind Time</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black tracking-tight text-white mb-2">
                                        {result.totalHours}
                                    </span>
                                    <span className="text-xl text-slate-400">Hours</span>
                                </div>
                                <p className="text-sm text-slate-400">
                                    Total of <strong>{result.totalMinutes} minutes</strong> of active gameplay.
                                </p>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Total Tasks</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        <Timer className="h-5 w-5 text-blue-500" />
                                        {result.tasksRequired}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Oranges/Blues to click</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">In-Game Days</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-green-500" />
                                        ~{result.sessionsRequired}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Based on ~15 min day/night cycle</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900">
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <PlayCircle className="h-4 w-4" />
                                    Efficiency Tip
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    To complete {result.totalHours} hours of grinding, you could watch approximately <strong>{Math.floor(parseFloat(result.totalHours))} episodes</strong> of a TV show while clicking tasks!
                                    {parseInt(result.totalHours) > 10 && " That is a serious grind. Considering trading for the Neon version instead or using Aging Potions."}
                                </p>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                        <div className="text-center space-y-4 max-w-sm">
                            <Clock className="w-16 h-16 mx-auto opacity-20" />
                            <h3 className="text-lg font-semibold">Time Estimator</h3>
                            <p>Select your pet's rarity and age details to see exactly how much work is left.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
