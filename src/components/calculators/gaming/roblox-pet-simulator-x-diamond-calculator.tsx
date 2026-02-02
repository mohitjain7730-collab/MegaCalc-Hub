'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gem, Coins, Timer, Sparkles, TrendingUp, Info, Lock, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// PSX Rank Data (Diamonds Reward Scaling)
const RANKS = {
    'noob': { name: 'Noob', reward: 1000 },
    'starter': { name: 'Starter', reward: 2500 },
    'god': { name: 'God', reward: 20000 },
    'hacker': { name: 'Hacker', reward: 60000 },
    'top_one': { name: 'The Best', reward: 125000 }, // Approximations for logic
};

const FARMING_AREAS = {
    'tech_world': { name: 'Tech World (Chest)', baseYield: 50000 },
    'fantasy_world': { name: 'Fantasy World (Samurai)', baseYield: 25000 },
    'spawn_world': { name: 'Spawn World (Magma)', baseYield: 10000 },
    'pixel_world': { name: 'Pixel World (Vault)', baseYield: 150000 },
    'cat_world': { name: 'Cat World (Throne)', baseYield: 300000 },
    'diamond_mine': { name: 'Diamond Mine (Mystic)', baseYield: 500000 }, // High yield
};

const formSchema = z.object({
    rank: z.string(),
    area: z.string(),
    gamepasses: z.object({
        vip: z.boolean().default(false),
        doubleDiamonds: z.boolean().default(false),
        tripleDiamonds: z.boolean().default(false), // Boost
    }),
    petsEquipped: z.number().min(1).max(25).default(4),
    enchantMultiplier: z.number().min(1).max(100).default(1), // "Diamonds IV" etc
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    hourlyRate: string;
    dailyRate: string;
    vipBonus: string;
    efficiencyRating: string;
    efficiencyColor: string;
};

const calculateDiamonds = (values: FormValues): ResultPayload => {
    const area = FARMING_AREAS[values.area as keyof typeof FARMING_AREAS];

    // Base Calculation
    let hourly = area.baseYield;

    // Multipliers
    let multiplier = 1.0;
    if (values.gamepasses.vip) multiplier += 0.1; // +10%? VIP usually gives interest tweaks
    if (values.gamepasses.doubleDiamonds) multiplier *= 2;
    if (values.gamepasses.tripleDiamonds) multiplier *= 3; // Server Boosts

    // Enchant Multiplier (e.g., Diamond V enchants on all pets)
    // Assume input 1 = 1x (No extra), 2 = 2x (All Diamond V)
    multiplier *= values.enchantMultiplier;

    // Rank Rewards are separate (Usually every 4-6 hours? Let's amortize to hourly)
    // Just adding rank reward context or boosting base yield slightly for faster chest breaking
    // We'll treat rank as a flat bonus per 6 hours -> divide by 6 for hourly context
    const rankReward = RANKS[values.rank as keyof typeof RANKS] ? RANKS[values.rank as keyof typeof RANKS].reward / 6 : 0;

    let finalHourly = (hourly * multiplier) + rankReward;
    let finalDaily = finalHourly * 24;

    // Cap sensible limits for display logic (PSX scaling is insane)
    if (area.name.includes("Diamond Mine")) {
        finalHourly = finalHourly * 3; // Buff for mine
    }

    let efficiencyRating = "Casual Farmer";
    let color = "text-slate-400";

    if (finalHourly > 10000000) {
        efficiencyRating = "Diamond Billionaire";
        color = "text-yellow-400";
    } else if (finalHourly > 1000000) {
        efficiencyRating = "Pro Grinder";
        color = "text-purple-400";
    } else if (finalHourly > 200000) {
        efficiencyRating = "Efficient";
        color = "text-blue-400";
    }

    return {
        hourlyRate: new Intl.NumberFormat('en-US').format(Math.floor(finalHourly)),
        dailyRate: new Intl.NumberFormat('en-US').format(Math.floor(finalDaily)),
        vipBonus: values.gamepasses.vip ? "Active" : "Inactive",
        efficiencyRating,
        efficiencyColor: color,
    };
};

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator X Pet Power Calculator', slug: 'roblox-pet-simulator-x-pet-power-calculator', description: 'Maximize your team damage for faster breaking.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Is VIP worth it?' },
    { name: '(Roblox) Adopt Me Bucks to Robux Converter', slug: 'roblox-adopt-me-bucks-to-robux-converter', description: 'Compare economy with Adopt Me.' },
    { name: '(Roblox) Inventory Value Estimator', slug: 'roblox-inventory-value-estimator', description: 'Track your Huges value.' },
    { name: '(Roblox) Trade Tax Calculator', slug: 'roblox-trade-tax-calculator', description: 'Calculate booth tax in Trading Plaza.' },
];

const faqs = [
    {
        question: "What is the fastest way to get Diamonds in Pet Sim X?",
        answer: "The Diamond Mine (Mystic Mine) is currently the best AFK spot. You need to release a Huge Pet to enter the deeper levels, but the yield is significantly higher than Town or Tech World. Combine this with 'Diamond V' enchants on all pets.",
    },
    {
        question: "Does the 'Diamonds V' enchant stack?",
        answer: "Yes. If you have a team of 8 pets and all of them have Diamonds V (which gives +50% or +100% depending on update), it stacks additively. A full team of Diamond enchant pets is essential for AFK farming.",
    },
    {
        question: "How does the Bank Interest work?",
        answer: "The Bank pays interest on your deposited diamonds every 24 hours. Tier 1 banks give poor interest, but a maxed Tier 8 bank gives significant daily returns. However, putting diamonds in the bank means you can't spend them instantly.",
    },
    {
        question: "Is the VIP Gamepass worth it for Diamonds?",
        answer: "VIP gives you access to the VIP Rewards Chest (moderately useful for starters) and a 10% XP/Diamond boost. For endgame players earning billions, that 10% adds up, but for new players, the Trading Booth access (Pro Plaza) is usually more valuable.",
    },
    {
        question: "What are 'Lootbags' and do they count?",
        answer: "Lootbags drop when you break chests/creates. They contain diamonds and coins. Mastery Perks (Lootbag Mastery) can significantly increase the diamond output of these bags. This calculator estimates raw chest yield, but decent Lootbag Mastery can 2x your income.",
    },
    {
        question: "Does Server Triple Damage help with Diamonds?",
        answer: "Indirectly, yes. Higher damage means you break chests faster. Breaking 2x chests per minute equals 2x diamonds per minute. So Damage = Diamonds.",
    },
    {
        question: "What is the 'Diamond Cap'?",
        answer: "There is a soft cap on how many diamonds you can hold (usually in the trillions). Most trading happens with 'Huge Pets' or 'Titanic Pets' as currency once you reach the diamond cap.",
    },
];

const steps = [
    'Select your Farming Area (e.g., Diamond Mine).',
    'Select your active Gamepasses (2x Diamonds).',
    'Estimate your Enchant Multiplier (Do you have Diamond V on your pets?).',
    'Click Calculate to see your potential hourly earning rate.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-pet-simulator-x-diamond-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Pet Simulator X Diamond Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Pet Simulator X Diamond Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Calculate your diamond farming rate in Pet Simulator X. Optimize AFK grinding with Diamond Mine strategies.',
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

export default function RobloxPetSimDiamondCalc() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rank: 'god',
            area: 'diamond_mine',
            gamepasses: {
                vip: false,
                doubleDiamonds: false,
                tripleDiamonds: false,
            },
            petsEquipped: 4,
            enchantMultiplier: 1,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateDiamonds(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Script id="psx-diamond-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-cyan-400 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Gem className="h-6 w-6 text-cyan-400" />
                        Pet Simulator X Diamond Calculator
                    </CardTitle>
                    <CardDescription>
                        Optimize your AFK farming strategy. Maximize Gems per hour.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Farming Setup</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    <FormField
                                        control={form.control}
                                        name="area"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Farming Zone</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.entries(FARMING_AREAS).map(([key, data]) => (
                                                            <SelectItem key={key} value={key}>{data.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="rank"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Player Rank (Rewards)</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.entries(RANKS).map(([key, data]) => (
                                                            <SelectItem key={key} value={key}>{data.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-2">
                                        <FormLabel>Gamepass Multipliers</FormLabel>
                                        <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                                            <FormField
                                                control={form.control}
                                                name="gamepasses.doubleDiamonds"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>Double Diamonds (Gamepass)</FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="gamepasses.tripleDiamonds"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                        <div className="space-y-1 leading-none">
                                                            <FormLabel>Triple Diamonds (Boost)</FormLabel>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="enchantMultiplier"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Enchant Strength (1x - 5x Estimate)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" step="0.5" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormDescription className="text-xs">Estimate your total 'Royalty' or 'Diamond' enchant power.</FormDescription>
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 font-bold text-white">
                                        CALCULATE YIELD
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
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/40 to-blue-600/10 animate-pulse"></div>
                                <CardHeader className="relative pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-400">Yield Estimates</CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                                            {result.hourlyRate}
                                        </span>
                                        <span className="text-xl text-cyan-400 font-bold">💎 / Hour</span>
                                    </div>

                                    <div className="p-4 bg-white/10 rounded-lg border border-white/20 mt-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-slate-300">Daily Potential (AFK)</div>
                                            <div className="text-2xl font-bold text-white">{result.dailyRate}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-bold ${result.efficiencyColor}`}>{result.efficiencyRating}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        Optimization Tip
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        To reach rank <strong>{result.efficiencyRating === "Diamond Billionaire" ? "Trillionaire" : "Billionaire"}</strong>, focus on unlocking the Diamond Mine. It provides 3x-5x better drops than regular worlds. Ensure your pets have the 'Diamonds V' enchant.
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                            <div className="text-center space-y-4 max-w-sm">
                                <Sparkles className="w-16 h-16 mx-auto opacity-20" />
                                <h3 className="text-lg font-semibold">Gem Forecaster</h3>
                                <p>Set up your grind parameters to see how rich you will become.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-cyan-500" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Farming Zone:</strong> Select the area you are grinding in (e.g. Diamond Mine). Deeper areas yield significantly more gems.</p>
                        <p><strong>Enchant Multiplier:</strong> Estimate the total boost from your pet enchants. 'Diamonds V' adds +50% per pet.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-cyan-500" />
                            Formula Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Yield Formula:</strong></p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">Yield = (Base Area Rate &times; (1 + Boosts) &times; Enchants) + Rank Bonus</code>
                        <p>We assume perfect AFK efficiency (breaking chests instantly).</p>
                    </CardContent>
                </Card>
            </div>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="Pet Simulator X Diamond Guide: How to Earn Billions" />
                <meta itemProp="description" content="The ultimate guide to farming Diamonds in Pet Simulator X. Learn about the Diamond Mine, AFK grinding, and stacking enchantments." />
                <meta itemProp="keywords" content="Pet Simulator X Diamond Calculator, How to get Gems fast PSX, Diamond Mine Guide, Pet Sim X AFK Farming" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Pet Simulator X Diamond Guide: How to Earn Billions</h1>
                <p className="text-lg italic text-muted-foreground">Diamonds (Gems) are the currency of the rich. Here is the math behind infinite wealth.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Meta: The Diamond Mine</h2>
                <p>Forget the Tech World chest. Forget the Fantasy World. If you want diamonds, you must go to the <strong>Diamond Mine</strong> (located in Spawn World).</p>
                <p>The Diamond Mine has three levels:</p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Paradise Cave:</strong> Moderate yields. Good for beginners.</li>
                    <li><strong>Cyber Cavern:</strong> High yields. Requires hard-hitting pets.</li>
                    <li><strong>Mystic Mine:</strong> Extreme yields. <strong>Requires releasing a Huge Pet.</strong> This is the endgame farming spot.</li>
                </ol>

                <h2 className="text-2xl font-bold text-foreground pt-8">Enchant Stacking: The Secret Multiplier</h2>
                <p>Many players think <em>Damage</em> is the most important stat. For diamonds, <em>Enchants</em> are king.</p>
                <p>You want a team of pets (8 to 20 pets depending on passes) that ALL have:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Diamonds V:</strong> Increases diamond earnings by ~50-100% per pet (stacks).</li>
                    <li><strong>Royalty:</strong> +100% Damage causing faster breaks AND +100% Diamonds. This is the God Tier enchant.</li>
                </ul>
                <p>A full team of Royalty pets in the Mystic Mine can generate 500m to 1b diamonds per day AFK.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Lootbags vs. Raw Gems</h2>
                <p>There are two ways diamonds drop:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="bg-muted p-4 rounded">
                        <h4 className="font-bold">Raw Gems</h4>
                        <p>The diamonds that fly out when a chest breaks. These are affected by Diamond Enchants.</p>
                    </div>
                    <div className="bg-muted p-4 rounded">
                        <h4 className="font-bold">Lootbags</h4>
                        <p>The physical bags that drop on the floor. These contain large sums of diamonds. They are affected by <strong>Lootbag Mastery</strong> and <strong>Server Drop Rate</strong> boosts.</p>
                    </div>
                </div>
                <p>To maximize income, you need high Damage (to break objects fast for Lootbags) AND high Diamond Enchants (for Raw Gems).</p>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Diamonds are the lifeblood of the economy. By optimizing your loadout with Diamond Enchants and AFK farming the Mystic Mine, you can earn billions daily, allowing you to buy Huge Pets from the trading plaza without spending Robux.</p>
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
