'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Users, Star, Trophy, ArrowRight, Gauge, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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

const relatedCalculators = [
    { name: '(Roblox) Adopt Me Age-Up Time Calculator', slug: 'roblox-adopt-me-age-up-time-calculator', description: 'Calculate exact task counts and times for specific rarities.' },
    { name: '(Roblox) Neon Pet Value Calculator', slug: 'roblox-adopt-me-neon-pet-value-calculator', description: 'Calculate trading value for Neon pets.' },
    { name: '(Roblox) Mega Neon Value Calculator', slug: 'roblox-adopt-me-mega-neon-value-calculator', description: 'Estimate value for Mega Neons.' },
    { name: '(Roblox) Pet Dupe Value Calculator', slug: 'roblox-pet-dupe-value-calculator', description: 'Check values for duped vs clean pets.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Is the VIP gamepass worth it?' },
];

const faqs = [
    {
        question: "How does the Family Method make aging faster?",
        answer: "The Family Method allows you to age multiple pets at once. By creating a family with an alt account, you can pick up the alt's pet. When you complete a task (like sleeping or shower), BOTH pets get credit if they are near the interactable object. This effectively doubles or triples your aging output.",
    },
    {
        question: "Does playing as a Baby make pets age faster?",
        answer: "No. Playing as a baby doubles your *money* (Bucks) because you get paid for your own needs + your pet's needs. However, it does *not* speed up the pet's aging bar. It is purely for farming currency.",
    },
    {
        question: "When are 2x Aging Weekends?",
        answer: "2x Aging Weekends are events hosted by the developers (DreamCraft), usually once every month or two, or during major holiday updates. During these times, every task gives double XP to pets.",
    },
    {
        question: "Can I use an Auto-Clicker to age pets?",
        answer: "Semi-effectively. You can use an auto-clicker to stay AFK and not disconnect, but pets only age if you complete tasks. You cannot fully automate task completion (like feeding/showering) without complex scripts, which are bannable. The best AFK method is remaining in a Grinding Room with auto-feeders, but you still need to move for Sleep/Shower tasks.",
    },
    {
        question: "Does having a 'Grinding House' speed up aging?",
        answer: "Yes, significantly. By placing a Piano, Bathtub, Feeder, and Pet Bed right next to the entrance of your house, you eliminate travel time within your home. This saves roughly 10-15 seconds per task, which adds up over hundreds of tasks.",
    },
    {
        question: "Is it worth buying tasks with Robux?",
        answer: "Generally no. The 'Insta-Finish' tasks cost Robux and are very expensive for the small amount of progress they give. It is much better to simply grind or trade for potions.",
    },
    {
        question: "What is the 'Common to Legendary' swap trick?",
        answer: "Some players keep a Common pet equipped for quick tasks (like hunger) and swap to a Legendary for high-value tasks (like Camping). However, this doesn't actually speed up the Legendary's aging; it just optimizes your annoyance level. For pure aging speed, keep the Legendary equipped 100% of the time.",
    },
];

const steps = [
    'Select your Grinding Strategy (Solo vs. Multi-Account Family).',
    'Select active events (Check if it is a 2x Aging Weekend).',
    'Select the target pet rarity (Legendary takes longest).',
    'Calculate to see your effective tasks per hour and total time saved.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-adopt-me-pet-aging-speed-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Adopt Me Pet Aging Speed Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Adopt Me Pet Aging Speed Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Optimize your pet aging strategy in Adopt Me. Calculate speedups from 2x weekends and alt accounts.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
    ],
};

export default function RobloxAdoptMeAgingSpeed() {
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <Script id="adopt-me-aging-speed-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-yellow-400 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Zap className="h-6 w-6 text-yellow-500" />
                        Adopt Me Pet Aging Speed Calculator
                    </CardTitle>
                    <CardDescription>
                        Optimize your grind. Compare strategies to age pets faster.
                    </CardDescription>
                </CardHeader>
            </Card>

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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Steps to Improve Speed
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
                <meta itemProp="name" content="How to Age Pets Fast in Adopt Me: The Ultimate Efficiency Guide" />
                <meta itemProp="description" content="Learn the fastest ways to age pets in Adopt Me. Family Method, 2x Weekends, and Glitch Rooms explained by experts." />
                <meta itemProp="keywords" content="Adopt Me Fast Aging, Family Method Guide, 2x Weekend Calculator, Adopt Me Grinding Tips, Speed Leveling Guide" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">How to Age Pets Fast in Adopt Me: The Ultimate Efficiency Guide</h1>
                <p className="text-lg italic text-muted-foreground">Stop wasting time. Learn the math behind the infamous "Family Method" and 2x weekends to 4x your inventory value.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Golden Rule: Task Density</h2>
                <p>Speed in <em>Adopt Me!</em> isn't about moving faster; it's about <strong>Task Density</strong>. The server gives tasks at a fixed rate, usually one every 7-10 minutes per pet. The only way to "speed up" is to complete multiple tasks in the same time slot.</p>
                <p>A solo player completes 1 task per cycle. A player using the Family Method completes 2 or even 3 tasks per cycle. Over an hour, this compounds: 10 tasks vs 30 tasks. This is the secret to rich inventories.</p>

                <h2 id="family-method" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Family Method" Explained</h2>
                <p>The Family Method is the single most effective way to grind. It allows one person to level two pets simultaneously.</p>

                <h3 className="text-xl font-bold mt-4">Step-by-Step Setup:</h3>
                <ol className="list-decimal pl-6 space-y-2 my-4">
                    <li><strong>Device Check:</strong> You need two devices (e.g., PC + Phone) OR one PC running two Roblox instances (using Roblox Account Manager).</li>
                    <li><strong>Create Family:</strong> On your Main Account, click [Family] &gt; [Create Family].</li>
                    <li><strong>Invite Alt:</strong> Log into your Alt Account. Join the same server. Invite Alt to Family.</li>
                    <li><strong>Equip Pets:</strong> Main Account takes out Pet A. Alt Account takes out Pet B.</li>
                    <li><strong>The "Carry" Mechanic:</strong> On Main Account, walk to Alt. Click [Interact] &gt; [Pick Up]. Then click [Pick Up Pet] on the Alt's pet.</li>
                </ol>
                <p><strong>Result:</strong> You are now holding your pet AND the Alt's pet. When you initiate a task (like School), BOTH pets enter the room and gain XP. You are now playing at <strong>200% Efficiency</strong>.</p>

                <h2 id="weekends" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">2x Aging Weekends: The "God Mode"</h2>
                <p>Adopt Me developers occasionally activate "2x Aging + 2x Bucks" events. These are critical windows of opportunity, usually lasting from Friday to Monday morning.</p>
                <p><strong>The Multiplier Math:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Normal Play:</strong> 1x Speed.</li>
                    <li><strong>2x Event:</strong> 2x Speed.</li>
                    <li><strong>Family Method:</strong> 2x Speed.</li>
                    <li><strong>Family Method + 2x Event:</strong> 4x Speed. (God Mode)</li>
                </ul>
                <p>During these weekends, you can take a Newborn Legendary to Full Grown in ~3 hours instead of 6. If you run 2 pets, you complete <strong>two Full Grown Legendaries in 3 hours</strong>. This is how rich players mass-produce Neons.</p>

                <h2 id="grinding-house" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Infrastructure: Building a Speed Station</h2>
                <p>Travel time kills efficiency. Do not use a fancy mansion for grinding. Build a tiny "Box House" or designate a room right next to your front door.</p>

                <h3 className="text-xl font-bold mt-4">Required Grind Furniture:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-bold">1. The Piano ($100)</h4>
                        <p className="text-sm">Solves the "Bored" task. Faster than walking to playground.</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-bold">2. The Bathtub ($13)</h4>
                        <p className="text-sm">Solves "Dirty". Why Tub? It has a larger hitbox than the shower, making it easier to click while carrying 2 pets.</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-bold">3. Feeders ($99)</h4>
                        <p className="text-sm">Automated Food/Water bowls. One click per pet.</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-bold">4. Money Tree ($1450)</h4>
                        <p className="text-sm">Passive income while you grind up to $100 per day.</p>
                    </div>
                </div>

                <h2 id="movement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Movement Mechanics & Tools</h2>
                <p>To move fast, you need the right gear.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Magic Door:</strong> Instantly teleport home from anywhere. Essential if you are at School and get a "Sleep" task.</li>
                    <li><strong>Grappling Hook:</strong> The fastest non-vehicle travel. Fires you across the map.</li>
                    <li><strong>The "Reset" Strat:</strong> If you don't have Robux for a Magic Door, just Reset Character (suicide). You respawn at home instantly.</li>
                </ul>

                <h2 id="baby-mode" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Baby Mode" Myth</h2>
                <p>Many players turn into a Baby thinking it speeds up pet aging. <strong>This is FALSE.</strong></p>
                <p>Playing as a Baby doubles your <strong>Bucks (Money)</strong> because you get paid for your own needs + your pet's needs. It does NOT speed up pet XP. In fact, it can slow you down because you move slower and have to feed yourself.</p>
                <p><strong>Verdict:</strong> Only play as a Baby if you need Money. If you only care about Pet Age, stay as an Adult for faster movement speed.</p>

                <h2 id="afk" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">AFK Farming Limits</h2>
                <p>Can you AFK farm age? <strong>No.</strong> Adopt Me requires interaction for every task. You can use an auto-clicker to stay connected to the server, but your pet will not age unless you click the specific task icons.</p>
                <p>However, you CAN AFK farm "Time Played" rewards or just stay in a rich server waiting for trades using a simple macro to jump every 10 minutes.</p>

                <hr className="my-8" />
                <p className="text-sm font-medium"><strong>Pro Tip:</strong> Use this calculator to check if your current strategy is optimal. If you are getting less than "2x" speed, it's time to make an alt account!</p>
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
