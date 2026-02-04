'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Timer, BookOpen, Star, Info, Zap, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// XP Requirements per Mastery (Approximations)
// Level 99 usually requires ~Millions of XP depending on the specific mastery curve.
// We'll use a standard curve model: Lvl 1->99 = ~1,000,000 total actions roughly (varies heavily).
// Lootbag Mastery = 1 XP per Lootbag
// Egg Mastery = XP per egg open.
// Enchant Mastery = XP per enchant.

const MASTERIES = {
    'lootbag': { name: 'Lootbag Mastery', goal: 99, xpPerAction: 15, maxXP: 375000, description: 'Collect lootbags', reward: '2x Lootbag Rewards' },
    'egg': { name: 'Eggs Mastery', goal: 99, xpPerAction: 10, maxXP: 500000, description: 'Hatch eggs', reward: 'Use Golden Eggs cheaper' },
    'enchant': { name: 'Enchanting Mastery', goal: 99, xpPerAction: 50, maxXP: 250000, description: 'Enchant pets', reward: 'Cheaper Enchants' },
    'convert': { name: 'Converting Mastery', goal: 99, xpPerAction: 100, maxXP: 400000, description: 'Make Golden/Rainbow pets', reward: 'Faster Converting' },
    'chest': { name: 'Chest Breaker Mastery', goal: 99, xpPerAction: 25, maxXP: 750000, description: 'Break chests', reward: 'Better Drops' },
};

const formSchema = z.object({
    masteryType: z.string(),
    currentLevel: z.number().min(1).max(99).default(1),
    actionsPerMinute: z.number().min(1).default(60), // e.g. opening 60 eggs a minute
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    remainingXP: string;
    remainingActions: string;
    timeToMax: string;
    rewardPreview: string;
    verdict: string;
};

const calculateMastery = (values: FormValues): ResultPayload => {
    const mastery = MASTERIES[values.masteryType as keyof typeof MASTERIES];

    // Simple linear interpolation of XP curve for display (Real game is exponential)
    // Assume XP needed for Level N = (N/99)^2 * TotalXP
    const currentProgressPct = (values.currentLevel / 99);
    const xpEarned = Math.pow(currentProgressPct, 2.5) * mastery.maxXP; // x^2.5 curve approximation
    const xpRemaining = mastery.maxXP - xpEarned;

    const actionsNeeded = Math.ceil(xpRemaining / mastery.xpPerAction);
    const minutesNeeded = actionsNeeded / values.actionsPerMinute;

    let timeString = "";
    if (minutesNeeded < 60) timeString = `${Math.ceil(minutesNeeded)} Minutes`;
    else if (minutesNeeded < 1440) timeString = `${(minutesNeeded / 60).toFixed(1)} Hours`;
    else timeString = `${(minutesNeeded / 1440).toFixed(1)} Days`;

    if (values.currentLevel >= 99) {
        timeString = "MAXED OUT!";
        return {
            remainingXP: "0",
            remainingActions: "0",
            timeToMax: timeString,
            rewardPreview: mastery.reward,
            verdict: "MASTERED"
        };
    }

    return {
        remainingXP: Math.ceil(xpRemaining).toLocaleString(),
        remainingActions: actionsNeeded.toLocaleString() + " " + mastery.description.toLowerCase(),
        timeToMax: timeString,
        rewardPreview: mastery.reward,
        verdict: "GRINDING..."
    };
};

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator X Diamond Calculator', slug: 'roblox-pet-simulator-x-diamond-calculator', description: 'Once mastered, farm gems.' },
    { name: '(Roblox) Pet Simulator X Rebirth Calculator', slug: 'roblox-pet-simulator-x-rebirth-calculator', description: 'Rebirth to unlock more.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Does Auto-Hatch help?' },
    { name: '(Roblox) Adopt Me Age-Up Time Calculator', slug: 'roblox-adopt-me-age-up-time-calculator', description: 'Similar grinding logic.' },
    { name: '(Roblox) Fortnite XP Calculator', slug: 'fortnite-xp-calculator', description: 'Calculate battle pass grind.' },
];

const faqs = [
    {
        question: "What is the best Mastery to max first?",
        answer: "Lootbag Mastery is widely considered the best to max first. At Level 99, it gives a 2x multiplier to all lootbag rewards (Diamonds/Coins). This doubles your income permanently.",
    },
    {
        question: "How do I farm Enchanting Mastery fast?",
        answer: "Go to the Enchant machine. Select a weak pet you don't care about. Turn on an Auto-Clicker on the 'Enchant' button. Let it run overnight. You burn gems, but you gain massive mastery XP very quickly.",
    },
    {
        question: "Does Mastery reset on Rebirth?",
        answer: "No. Mastery levels are permanent improvements to your account. You keep them forever, even through major game updates usually.",
    },
    {
        question: "What does Egg Mastery do?",
        answer: "Egg Mastery Level 99 allows you to open Golden Eggs for the price of Normal Eggs (sometimes) and increases the speed of the hatching animation, allowing you to hatch more pets per hour.",
    },
    {
        question: "Is there a max level for Mastery?",
        answer: "Yes, currently the max level for all Masteries is Level 99. Reaching this unlocks the 'Hardcore' achievement benefits for that skill.",
    },
    {
        question: "Do I need Auto-Hatch gamepass for Egg Mastery?",
        answer: "It is highly recommended. Without Auto-Hatch, you have to click manually every few seconds. To open the 500,000+ eggs needed for Level 99, manual clicking is physically impossible/dangerous (RSI).",
    },
    {
        question: "How to farm Chest Breaker Mastery?",
        answer: "Go to a low-level area (spawn world). Equip weak pets. Break tiny chests instantly. Mastery is awarded per-break, not per-damage. So breaking 100 small chests is better than breaking 1 giant chest.",
    },
];

const steps = [
    'Select the Mastery Skill you are leveling (e.g., Lootbags, Mining).',
    'Enter your Current Level (1-99).',
    'Estimate your Actions Per Minute (how fast you click or AFK).',
    'Calculate the time required to hit Level 99 Max.',
];



export default function RobloxPSXMasteryCalc() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            masteryType: 'lootbag',
            currentLevel: 10,
            actionsPerMinute: 60,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateMastery(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">


            <Card className="border-l-4 border-l-purple-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <GraduationCap className="h-6 w-6 text-purple-500" />
                        Pet Simulator X Mastery Calculator
                    </CardTitle>
                    <CardDescription>
                        Track your grind to Level 99. Maximize your perks.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Skill Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="masteryType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Skill</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {Object.entries(MASTERIES).map(([key, data]) => (
                                                        <SelectItem key={key} value={key}>{data.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="currentLevel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current Level (1-99)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="actionsPerMinute"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Speed (Actions/Min)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormDescription>How fast are you grinding?</FormDescription>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 font-bold text-white">
                                CALCULATE TIME TO MAX
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result ? (
                <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                    <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-pink-600/10 animate-pulse"></div>
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Grind Estimation</CardTitle>
                        </CardHeader>
                        <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Remaining Work</h4>
                                    <p className="text-2xl font-bold text-white">{result.remainingActions}</p>
                                    <p className="text-sm text-slate-500">{result.remainingXP} XP needed</p>
                                </div>
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <h4 className="flex items-center gap-2 font-bold mb-1 text-yellow-400">
                                        <Star className="h-4 w-4" /> Level 99 Perk:
                                    </h4>
                                    <p className="text-sm font-semibold">{result.rewardPreview}</p>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col justify-center">
                                <div className="p-4 border border-white/10 bg-white/5 rounded-xl text-center">
                                    <p className="text-slate-400 text-sm mb-1">Time Until Max</p>
                                    <p className="text-2xl font-bold text-purple-400">{result.timeToMax}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                    <div className="text-center space-y-4 max-w-sm">
                        <BookOpen className="w-16 h-16 mx-auto opacity-20" />
                        <h3 className="text-lg font-semibold">Mastery Planner</h3>
                        <p>Calculate exactly how long it takes to become a master.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-purple-600" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Current Level:</strong> Input your exact level (1-99). The XP curve is exponential, so levels 90-99 take much longer than 1-50.</p>
                        <p><strong>Speed (Actions/Min):</strong> How many actions (e.g. Eggs Opened) you perform per minute. Use an Auto-Clicker for max speed.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-purple-600" />
                            Formula Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>XP Remaining:</strong> Scaled exponentially based on level.</p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">Time = XP_Remaining / (XP_Per_Action &times; Actions_Per_Min)</code>
                    </CardContent>
                </Card>
            </div>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
            >
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Pet Simulator X Mastery Guide: Fastest Way to Level 99</h1>
                <p className="text-lg italic text-muted-foreground">Mastering skills isn't just for status. The Level 99 perks are game-breaking.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Level Mastery?</h2>
                <p>Mastery Skills in <em>Pet Simulator X</em> provide passive buffs. The rewards scale as you level up, with a massive "Perk" unlocked at Level 99.</p>
                <p>For example, <strong>Lootbag Mastery Level 99</strong> doubles the value of all lootbags. If you are farming diamonds, having this mastery literally <strong>doubles your income</strong> compared to someone with Level 1 mastery.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">The "Big Three" Masteries</h2>

                <h3 className="text-xl font-bold mt-4">1. Lootbag Mastery (Priority: High)</h3>
                <p><strong>Goal:</strong> Break chests dropping lootbags.</p>
                <p><strong>Method:</strong> Go to the Alien Chest or Heaven Chest. Use relatively weak pets so you break the chest in "ticks" (spawn lootbags often) rather than one-shotting it. Or break thousands of small crates in Spawn World.</p>

                <h3 className="text-xl font-bold mt-4">2. Enchanting Mastery (Priority: Medium)</h3>
                <p><strong>Goal:</strong> Enchant pets.</p>
                <p><strong>Method:</strong> This is the easiest to AFK. Stand at the Enchant Table. Set up an Auto-Clicker to enchant a trash pet over and over. It burns gems, but speeds up the process massively.</p>

                <h3 className="text-xl font-bold mt-4">3. Egg Mastery (Priority: Passive)</h3>
                <p><strong>Goal:</strong> Open Eggs.</p>
                <p><strong>Method:</strong> Use the "Auto-Hatch" gamepass. Open the cheapest egg in the game (Spotted Egg or similar) overnight. You get the same XP for opening a cheap egg as an expensive one.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Hardcore Mastery</h2>
                <p>When you unlock Hardcore Mode, masteries apply there too. Grinding mastery in Normal Mode is recommended taking it into Hardcore, as Normal Mode resources (coins/diamonds) are cheaper and easier to get.</p>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Mastery is a long-term grind, but essential for maximizing your account's efficiency. By focusing on Lootbag and Enchanting Mastery first, you set yourself up for infinite wealth in the late game.</p>
                </div>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle>Related calculators</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedCalculators.map((calc) => (
                        <div key={calc.slug} className="p-4 border rounded">
                            <h4 className="font-semibold mb-1">
                                <Link href={`/category/gaming/${calc.slug}`} className="text-primary hover:underline">
                                    {calc.name}
                                </Link>
                            </h4>
                            <p className="text-sm text-muted-foreground">{calc.description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>FAQs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {faqs.map((faq) => (
                        <div key={faq.question}>
                            <h4 className="font-semibold">{faq.question}</h4>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function FormDescription({ className, children }: { className?: string; children: React.ReactNode }) {
    return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}
