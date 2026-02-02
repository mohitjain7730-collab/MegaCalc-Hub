'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCcw, ArrowUpCircle, Lock, Trophy, FastForward, Info, CheckCircle2, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator X Pet Power Calculator', slug: 'roblox-pet-simulator-x-pet-power-calculator', description: 'See how Rebirth boosts your damage.' },
    { name: '(Roblox) Pet Simulator X Diamond Calculator', slug: 'roblox-pet-simulator-x-diamond-calculator', description: 'Farm gems after you rebirth.' },
    { name: '(Roblox) Pet Simulator X Mastery Calculator', slug: 'roblox-pet-simulator-x-mastery-calculator', description: 'Level up your skills.' },
    { name: '(Roblox) Adopt Me Age-Up Time Calculator', slug: 'roblox-adopt-me-age-up-time-calculator', description: 'Compare grinding times.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Is VIP worth it?' },
];

const faqs = [
    {
        question: "Does Rebirth reset my pets?",
        answer: "No! Rebirthing in Pet Simulator X does NOT delete your pets, diamonds, or robux items. It only resets your 'Coins' (and sometimes area progress, depending on the update). Your inventory is safe.",
    },
    {
        question: "Why should I do Rebirth 1?",
        answer: "Rebirth 1 is essential because it unlocks the 'Teleport' button. Without it, you have to walk manually between every zone, which wastes hours of time. It also gives a permanent +15% damage boost.",
    },
    {
        question: "What is Hardcore Mode?",
        answer: "Hardcore Mode is unlocked after reaching 'The Void' (essentially Rebirth 3 equivalent content). It is a separate world where all enemies are 10x stronger, but the rewards (Hardcore Pets) are trillions of times stronger than normal pets.",
    },
    {
        question: "Do I lose my Diamonds when I Rebirth?",
        answer: "No. Diamonds (Gems) are never reset by Rebirths. Only specific world currencies (like Fantasy Coins or Tech Coins) might be reset depending on the specific rebirth mechanics of the update.",
    },
    {
        question: "Is the +75% Damage Boost multiplicative?",
        answer: "Yes. The permanent player damage boost stacks with your pet power. If you have 100 power and GET +75% boost, you deal 175 damage. This applies to ALL pets forever.",
    },
    {
        question: "How do I get coins faster for Rebirth?",
        answer: "Equip 'Cartoon Coins' or 'Fantasy Coins' enchants on your pets. These enchants can boost currency income by 100% or more. Also, use Triple Coin Boosts from the shop.",
    },
    {
        question: "Can I undo a Rebirth?",
        answer: "No, but there is no reason to. Rebirths are purely beneficial upgrades. You cannot downgrade.",
    },
];

const steps = [
    'Identify which Rebirth you are aiming for (1, 2, or Void).',
    'Input your current Coin Income (Coins per minute).',
    'Review the cost and the specific rewards (e.g. Bank Access).',
    'See the estimated grind time to reach your goal.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-pet-simulator-x-rebirth-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Pet Simulator X Rebirth Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Pet Simulator X Rebirth Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Calculate costs and rewards for Rebirths in Pet Simulator X. Plan your progression to Hardcore Mode.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
        },
    ],
};

export default function RobloxPSXRebirthCalc() {
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
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <Script id="psx-rebirth-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-green-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <RefreshCcw className="h-6 w-6 text-green-500" />
                        Pet Simulator X Rebirth Calculator
                    </CardTitle>
                    <CardDescription>
                        Plan your path to infinite power. Check Rebirth requirements.
                    </CardDescription>
                </CardHeader>
            </Card>

            {/* Input Section - Full Width */}
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

            {/* Result Section - Full Width Below */}
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

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="Pet Simulator X Rebirth Guide: Benefits & Requirements" />
                <meta itemProp="description" content="Is Rebirth worth it in Pet Simulator X? Learn about permanent damage boosts, teleport unlock, and Hardcore Mode requirements." />
                <meta itemProp="keywords" content="Pet Simulator X Rebirth Cost, PSX Teleport Unlock, Hardcore Mode Guide, Pet Sim X Damage Boost" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Pet Simulator X Rebirth Guide: Benefits & Requirements</h1>
                <p className="text-lg italic text-muted-foreground">Don't be scared to press the button. Rebirthing is the key to Endgame.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Rebirth?</h2>
                <p>New players often hesitate to rebirth because they fear losing progress. In <em>Pet Simulator X</em>, rebirthing is <strong>mandatory</strong> for progress. You do NOT lose your pets.</p>
                <p><strong>The Benefits:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Rank Rewards:</strong> You gain access to new rank rewards chest.</li>
                    <li><strong>Permanent Damage Multipliers:</strong> Rebirth 4 gives a total of +75% damage. This is huge. A 1 Billion power pet effectively becomes a 1.75 Billion power pet.</li>
                    <li><strong>Teleportation:</strong> Unlocked at Rebirth 1. Walking is slow. Teleporting allows you to shop hop instantly.</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground pt-8">The Hardcore Mode Unlock (The Void)</h2>
                <p>Reaching "The Void" (often considered Rebirth 3/4 content depending on update era) unlocks <strong>Hardcore Mode</strong>. This is effectively "New Game Plus".</p>
                <p>In Hardcore Mode, you start over with 0 coins, but the pets you hatch are <strong>trillions</strong> of times stronger than normal pets. A generic "Dog" in Hardcore Mode is stronger than a "Dragon" in Normal Mode. You need to Rebirth to access this content.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Fastest Rebirth Strategy</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Coin Enchants:</strong> Put "Fantasy Coins IV" or "Cartoon Coins V" on your best pets. Damage doesn't matter if you aren't earning currency.</li>
                    <li><strong>Server Boosts:</strong> Always keep "Triple Coins" active. It speeds up the grind by 3x.</li>
                    <li><strong>Friend Bonus:</strong> Playing with friends gives a Coin multiplier. Join a server with people on your friends list.</li>
                </ol>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Rebirths are the primary progression gates in Pet Simulator X. By rebirthing, you gain essential tools like Teleportation and Banking, and you unlock the damage multipliers required to break higher-level chests. Do not delay your rebirths.</p>
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
