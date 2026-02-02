'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Clock, Timer, Calendar, BarChart, Info, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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

const relatedCalculators = [
    { name: '(Roblox) Pet Aging Speed Calculator', slug: 'roblox-adopt-me-pet-aging-speed-calculator', description: 'Optimize your grinding with multi-account/family method strategies.' },
    { name: '(Roblox) Neon Pet Value Calculator', slug: 'roblox-adopt-me-neon-pet-value-calculator', description: 'Is it worth the time? Calculate final Neon trading value.' },
    { name: '(Roblox) Mega Neon Value Calculator', slug: 'roblox-adopt-me-mega-neon-value-calculator', description: 'Value estimations for the ultimate Mega Neon pets.' },
    { name: '(Roblox) Pet Value Calculator', slug: 'roblox-pet-value-calculator', description: 'General trading values for all Adopt Me pets.' },
    { name: '(Roblox) Trading Profit Analyzer', slug: 'roblox-trading-profit-analyzer', description: 'Calculate potential profit from your trades.' },
];

const faqs = [
    {
        question: "How long does it take to age a Legendary from Newborn to Full Grown?",
        answer: "It takes approximately 6 hours of active gameplay to age a single Legendary pet from Newborn to Full Grown. This involves completing roughly 189 tasks. If you are making a Neon (4 pets), that's ~24 hours of work.",
    },
    {
        question: "Does the '2x Weekend' event halve the aging time?",
        answer: "Yes! During Double XP / 2x Aging weekends, every task completes double the progress bar. This effectively cuts the time in half (e.g., 3 hours for a Legendary instead of 6).",
    },
    {
        question: "What is the fastest way to age pets?",
        answer: "The 'Family Method' is the best strategy. Create a family with an alt account (or friend), carry one pet yourself, and have your alt carry another pet. You earn money and age two pets simultaneously.",
    },
    {
        question: "Do tasks appear randomly?",
        answer: "Somewhat. Tasks like 'Hungry', 'Thirsty', 'Sleepy', and 'Shower' appear on a set cycle (roughly every 5-10 minutes). There is always a 'Morning' (School/Pool/Camping) cycle each Adopt Me day.",
    },
    {
        question: "How many tasks does a Common pet need?",
        answer: "A Common pet (like a Cat) requires about 56 tasks to reach Full Grown. This takes roughly 1 hour, making it 6x faster than a Legendary.",
    },
    {
        question: "What are Aging Potions?",
        answer: "Aging Potions are items obtained by leveling up your 'Friendship' with a pet that is already Full Grown. Feeding an Aging Potion instantly grants 30 tasks worth of experience.",
    },
    {
        question: "Does the Camping task give more XP?",
        answer: "Yes, the Camping task is the only task that gives significantly more XP than standard tasks like eating or drinking. Always prioritize going to the campsite when the task appears.",
    },
];

const steps = [
    'Select the Rarity of the pet you are leveling.',
    'Set the Current Age (e.g., Newborn).',
    'Set the Target Age (e.g., Full Grown).',
    'Enter the Number of Pets (enter 4 if you are making a Neon, 16 for Mega).',
    'The calculator will estimate total hours required based on average task cycles.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-adopt-me-age-up-time-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Adopt Me Age-Up Time Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Adopt Me Age-Up Time Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Calculate exactly how long it takes to age pets in Roblox Adopt Me from Newborn to Full Grown.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
    ],
};

export default function RobloxAdoptMeAgeUpTime() {
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <Script id="adopt-me-age-up-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-orange-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Clock className="h-6 w-6 text-orange-500" />
                        Adopt Me Age-Up Time Calculator
                    </CardTitle>
                    <CardDescription>
                        Plan your grind. Calculate hours needed to make Neons and Megas.
                    </CardDescription>
                </CardHeader>
            </Card>

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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Info & Steps
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <ul className="list-disc pl-5 space-y-2">
                        {steps.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="The Ultimate Handbook to Adopt Me Pet Aging & Task Mechanics" />
                <meta itemProp="description" content="Every minute counts. A deep dive into the math of task completion, XP requirements, and active grinding times for Neon and Mega pet makers." />
                <meta itemProp="keywords" content="Adopt Me Aging Time, How long to make Neon, Pet Task List, Adopt Me Rarity Guide, Task XP, Grinding House" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Handbook to Adopt Me Pet Aging & Task Mechanics</h1>
                <p className="text-lg italic text-muted-foreground">Every minute counts. A deep dive into the math of task completion, XP requirements, and active grinding times for Neon and Mega pet makers.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Economy of Time in Adopt Me</h2>
                <p>In the world of <em>Roblox Adopt Me!</em>, time is the comprehensive currency. While "Bucks" (money) can be used to buy eggs, furniture, and food, <strong>Time</strong> is the only resource that creates value. A Newborn Legendary pet might be worth 1 unit of value, but a Full Grown version of that same pet is often worth 1.5x to 2x simply because you have invested the time to level it up.</p>
                <p>Understanding exactly how long this process takes is critical for traders. If you are planning to make a Mega Neon Shadow Dragon, you are not just committing to a trade; you are committing to a 100+ hour workflow. This guide breaks down the invisible numbers behind the aging bar so you can optimize your gameplay.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding the Task System Mechanics</h2>
                <p>Pets in Adopt Me do not gain experience (XP) passively. You cannot simply stand in the server and watch your pet grow. Growth is triggered exclusively by completing <strong>Needs</strong> (commonly called Tasks).</p>
                <p>When a Task icon appears (orange or blue), your pet is asking for an interaction. Completing this interaction grants a specific amount of XP. Once the XP bar fills, the pet progresses to the next age stage.</p>
                <p><strong>The Hidden XP Values:</strong> Not all tasks are created equal. While the exact XP numbers are hidden variables in the game code, community research suggests:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Small Tasks (Orange):</strong> Hungry, Thirsty, Sick, Dirty. These grant a standard amount of XP and appear randomly.</li>
                    <li><strong>Large Tasks (Blue):</strong> School, Camping, Pool Party, Salon, Pizza Party. These grant significantly MORE XP (often 2x or 2.5x a small task) and appear on a fixed schedule.</li>
                    <li><strong>Camping Bonus:</strong> The Camping task is widely regarded as the highest XP earning task in the rotation. Never skip it.</li>
                </ul>

                <h2 id="task-breakdown" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Detailed Task Breakdown by Rarity</h2>
                <p>The "cost" of aging a pet relates directly to its rarity. A Common pet is designed to be easy for new players to level up, while a Legendary pet is an endgame grind.</p>

                <div className="overflow-x-auto my-6">
                    <table className="w-full text-left border-collapse border border-border">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 font-bold border-b text-foreground">Rarity</th>
                                <th className="p-3 font-bold border-b text-foreground">Total Tasks (Approx)</th>
                                <th className="p-3 font-bold border-b text-foreground">Active Time (Solo)</th>
                                <th className="p-3 font-bold border-b text-foreground">Difficulty Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="hover:bg-muted/50">
                                <td className="p-3 border-b">Common (e.g., Cat, Dog)</td>
                                <td className="p-3 border-b">~56 Tasks</td>
                                <td className="p-3 border-b">~1 Hour</td>
                                <td className="p-3 border-b text-green-500 font-semibold">Easy</td>
                            </tr>
                            <tr className="hover:bg-muted/50">
                                <td className="p-3 border-b">Uncommon (e.g., Fennec Fox)</td>
                                <td className="p-3 border-b">~70 Tasks</td>
                                <td className="p-3 border-b">~1.5 Hours</td>
                                <td className="p-3 border-b text-green-600 font-semibold">Moderate</td>
                            </tr>
                            <tr className="hover:bg-muted/50">
                                <td className="p-3 border-b">Rare (e.g., Beaver)</td>
                                <td className="p-3 border-b">~96 Tasks</td>
                                <td className="p-3 border-b">~2.5 Hours</td>
                                <td className="p-3 border-b text-yellow-600 font-semibold">Grindy</td>
                            </tr>
                            <tr className="hover:bg-muted/50">
                                <td className="p-3 border-b">Ultra-Rare (e.g., Bee)</td>
                                <td className="p-3 border-b">~150 Tasks</td>
                                <td className="p-3 border-b">~4 Hours</td>
                                <td className="p-3 border-b text-orange-500 font-semibold">Hard</td>
                            </tr>
                            <tr className="hover:bg-muted/50 bg-orange-50/5 dark:bg-orange-900/10">
                                <td className="p-3 border-b font-bold text-orange-500">Legendary (e.g., Dragon)</td>
                                <td className="p-3 border-b font-bold">~189 Tasks</td>
                                <td className="p-3 border-b font-bold">~6 to 7 Hours</td>
                                <td className="p-3 border-b font-bold text-red-500">Extreme</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-sm text-muted-foreground my-4"><em>Note: "Active Time" assumes you are playing efficiently and not missing any tasks. AFK time will be significantly longer.</em></p>

                <h2 id="cycles" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Day/Night Cycle & Schedule</h2>
                <p>Adopt Me operates on a fixed time loop. Understanding this loop allows you to predict which task is coming next.</p>
                <div className="pl-4 border-l-2 border-primary my-4 space-y-2">
                    <p><strong>The Morning (~10 Minutes):</strong> The sun rises. You will almost always get a "School" or "Playground" task shortly after morning begins. Random needs (Hungry/Thirsty) often trigger here.</p>
                    <p><strong>The Afternoon:</strong> Tasks like "Pool Party" or "Pizza Party" tend to occur here. This is the best time to restock on food/water.</p>
                    <p><strong>The Night (~3-5 Minutes):</strong> The most important phase. Every night, your pet <strong>WILL</strong> request to Sleep. You effectively get a guaranteed task completion every cycle. Often paired with "Camping".</p>
                </div>
                <p>Because these "Blue Tasks" (School, Sleep, Camping) are tied to the server clock, you are capped on how fast you can progress. You cannot force a school day to start sooner.</p>

                <h2 id="optimization" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Advanced Optimization Strategies</h2>

                <h3 className="text-xl font-bold mt-6 mb-2">1. The "Grinding House" Blueprint</h3>
                <p>New players waste hours running around the map. Pro players build a "Grinding Room". This is a small room placed immediately at the entrance of your house containing everything a pet needs.</p>
                <p><strong>Perfect Setup Costs:</strong></p>
                <ul className="list-disc pl-6 mb-4">
                    <li><strong>Piano (Any cheap instrument):</strong> Solves "Bored" task without going to Playground. (Cost: ~$100)</li>
                    <li><strong>Bathtub ($13):</strong> Solves "Dirty" task. Much faster than Shower because you don't need to aim the camera perfectly.</li>
                    <li><strong>Feeder/Waterer ($99 each):</strong> Automated food/water. Saves clicks.</li>
                    <li><strong>Crib/Pet Bed:</strong> For sleeping tasks.</li>
                </ul>
                <p>With this setup, you only ever leave your house for <strong>School</strong>, <strong>Pool</strong>, <strong>Camping</strong>, and <strong>Sick</strong> tasks. Everything else is instant.</p>

                <h3 className="text-xl font-bold mt-6 mb-2">2. The "Reset Character" Teleport</h3>
                <p>Travel time is the enemy. If you are at the Campsite (far side of map) and get a "Sleep" task (needs your house), do not run back.</p>
                <p>Open the Roblox menu &gt; <strong>Reset Character</strong>. You will respawn in your house instantly. Your pet is unequipped, but you just re-equip it and put it in the bed. This saves ~45 seconds of running.</p>

                <h3 className="text-xl font-bold mt-6 mb-2">3. The "Food Stacking" Method</h3>
                <p>Never buy food from the Grocery Store or Farm Shop if you are grinding. It wastes time and money.</p>
                <ul className="list-disc pl-6 mb-4">
                    <li><strong>Teacher's Apples:</strong> Go to School, steal the apple from the teacher's desk. It is free. Grab 30 of them.</li>
                    <li><strong>Water Cooler:</strong> Buy a water cooler for your house. Unlimited free water.</li>
                    <li><strong>Pizza House:</strong> If you own the Pizza house, you can take unlimited dough.</li>
                </ul>

                <h2 id="potions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Aging Potions: The End Game</h2>
                <p>Introduced to help players with full inventories, <strong>Aging Potions</strong> are the only way to "bank" time.</p>
                <p><strong>How they work:</strong></p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li>Equip a pet that is ALREADY Full Grown.</li>
                    <li>Complete tasks with it. Instead of aging, you fill a "Friendship Bar".</li>
                    <li>Every 30 tasks completed yields <strong>1 Aging Potion</strong>.</li>
                    <li>Feed this potion to a new pet to instantly grant ~30 tasks worth of XP.</li>
                </ol>
                <p><strong>Strategy:</strong> If you are waiting for a new update (e.g., a Halloween Event pet), grind with your Full Grown pet <em>now</em>. Stockpile 20 Aging Potions. When the new pet drops, you can instantly make it Full Grown Day 1 and trade it for massive profit.</p>

                <h2 id="summary" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Summary: The 110-Hour Mega Grind</h2>
                <p>To create a <strong>Mega Neon Legendary</strong> from scratch, you need to level 16 Legendaries to Full Grown, then 4 Neons to Luminous.</p>
                <p><strong>The Math:</strong> (16 pets × 6 hours) + (4 Neons × 4 hours) ≈ <strong>112 Hours</strong> of active gameplay.</p>
                <p>This explains why high-tier Mega Neons are valued so highly. You are not paying for pixels; you are paying for the seller's month of work. Use this calculator to plan your schedule realisticlly and avoid burnout.</p>
                <p className="mt-8 font-medium">Use this calculator to set realistic goals. If you only play 1 hour a day, don't expect to make a Mega Shadow Dragon in a week! Patience and consistency are key to growing your inventory value.</p>
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
