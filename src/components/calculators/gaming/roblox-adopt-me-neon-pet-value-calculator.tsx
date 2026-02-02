'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Cat, Sparkles, Zap, DollarSign, TrendingUp, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

// Schema
const formSchema = z.object({
    petName: z.string().optional(),
    rarity: z.enum(['common', 'uncommon', 'rare', 'ultra-rare', 'legendary']),
    baseValue: z.number().min(1, 'Value must be at least 1'),
    isFly: z.boolean().default(false),
    isRide: z.boolean().default(false),
    demandMultiplier: z.number().min(1).max(3),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    neonValue: number;
    agingBonus: number;
    demandBonus: number;
    potionBonus: number;
    totalValue: number;
    tradingPower: string;
    recommendation: string;
};

const rarities = [
    { value: 'common', label: 'Common', agingHours: 1 },
    { value: 'uncommon', label: 'Uncommon', agingHours: 1.5 },
    { value: 'rare', label: 'Rare', agingHours: 2.5 },
    { value: 'ultra-rare', label: 'Ultra-Rare', agingHours: 4 },
    { value: 'legendary', label: 'Legendary', agingHours: 6 },
];

const relatedCalculators = [
    { name: '(Roblox) Pet Value Calculator', slug: 'roblox-pet-value-calculator', description: 'Calculate the value of your Roblox pets based on rarity, age, and market trends.' },
    { name: '(Roblox) Mega Neon Value Calculator', slug: 'roblox-adopt-me-mega-neon-value-calculator', description: 'Determine the value of Mega Neon pets and their trading power.' },
    { name: '(Roblox) Trading Profit Analyzer', slug: 'roblox-trading-profit-analyzer', description: 'Analyze trading profits by comparing buy and sell prices and fees.' },
    { name: '(Roblox) Egg Hatch Odds Simulator', slug: 'roblox-egg-hatch-odds-simulator', description: 'Simulate and calculate the odds of hatching rare pets from Roblox eggs.' },
    { name: '(Roblox) Pet Dupe Value Calculator', slug: 'roblox-pet-dupe-value-calculator', description: 'Calculate the value of duplicated Roblox pets based on original value.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Calculate return on investment for Roblox gamepasses.' },
];

const faqs = [
    {
        question: 'How is Neon Value calculated?',
        answer: 'Standard Neon Value is essentially 4x the base pet value plus an "Aging Bonus." Since growing 4 pets to full grown takes significant time (especially Legendaries), Neons trade for more than just 4 newborns. Usually, it\'s roughly roughly 5-6x the base pet value for high tiers.',
    },
    {
        question: 'Do Fly/Ride potions increase Neon value?',
        answer: 'Yes, but not linearly. A Neon Fly Ride (NFR) pet is worth more than a No-Potion Neon, but "No Potion" high-tier pets (like Shadow Dragons) can sometimes be worth MORE due to rarity relative to older pets.',
    },
    {
        question: 'Why are some Neons worth more than 4 full-growns?',
        answer: 'Convenience and demand. Players often overpay for the "cool factor" of the glowing neon texture without wanting to do the grinding work of aging pets themselves.',
    },
    {
        question: 'What is the "Aging Bonus"?',
        answer: 'The Aging Bonus represents the time equity put into the pet. A Common Neon takes ~4 hours to make. A Legendary Neon takes ~24+ hours of active gameplay. Thus, Legendary Neons have a much higher markup percentage than Common Neons.',
    },
    {
        question: 'Is it better to trade 4 pets or make the Neon myself?',
        answer: 'If you have the time, making the Neon adds value (profit). If you are a trader looking for quick flips, trading the 4 pets separately might be faster, but you miss out on the "Neon Premium."',
    },
    {
        question: 'Does the specific neon color matter?',
        answer: 'No, the color of the neon glow is fixed per species (e.g., all Neon Cows glow pink). It affects demand (people love pink/blue neons) but you cannot change it or calculate value based on it specifically, other than general species demand.',
    },
    {
        question: 'How accurate is this calculator?',
        answer: 'Adopt Me values fluctuate daily based on updates and player demand. This calculator uses a formula based on "Shark Values" and community tiers to give an estimated fair trade value, but always check recent trades in servers.',
    },
];

const steps = [
    'Select the Rarity of the pet (Common to Legendary).',
    'Enter the approximate Base Value of one regular (Newborn) copy of the pet.',
    'Indicate if the final Neon will have Fly or Ride potions.',
    'Adjust the Demand Multiplier (High Demand pets like Cows/Owls get a bonus).',
    'Calculate to see the fair trade value of the Neon version.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-adopt-me-neon-pet-value-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Adopt Me Neon Value Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Adopt Me Neon Pet Value Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Calculate the trading value of Neon pets in Roblox Adopt Me based on rarity, aging time, and demand.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
    ],
};

const calculateNeonValue = (values: FormValues): ResultPayload => {
    const baseTotal = values.baseValue * 4;

    // Aging bonus: Rare pets take longer, so the "Labor cost" is higher
    const rarityInfo = rarities.find(r => r.value === values.rarity)!;
    const agingMultiplier = 1 + (rarityInfo.agingHours * 0.05); // e.g. Legendary (6h) -> +30% value bonus

    let agingBonus = (baseTotal * agingMultiplier) - baseTotal;

    // Demand bonus
    let demandBonus = 0;
    if (values.demandMultiplier > 1) {
        demandBonus = baseTotal * (values.demandMultiplier - 1);
    }

    // Potion Bonus (Flat value approx)
    // Values are arbitrary units, lets assume 1 Ride Pot = 5 units, 1 Fly Pot = 10 units roughly
    // We scale this by base value to keep it proportional
    let potionBonus = 0;
    if (values.isRide) potionBonus += (values.baseValue * 0.5);
    if (values.isFly) potionBonus += (values.baseValue * 0.8);

    const totalValue = baseTotal + agingBonus + demandBonus + potionBonus;

    // Trading Power Interpretation
    let tradingPower = "Low";
    if (totalValue > 1000) tradingPower = "High Tier Legendary";
    else if (totalValue > 500) tradingPower = "Mid Tier";
    else if (totalValue > 100) tradingPower = "Decent";

    let recommendation = "";
    if (totalValue > baseTotal * 6) {
        recommendation = "Massive Profit! Making this neon is extremely worth the time.";
    } else if (totalValue > baseTotal * 5) {
        recommendation = "Good Profit. Worth aging the pets yourself.";
    } else {
        recommendation = "Fair Value. Trading 4 full grown might be similar value.";
    }

    return {
        neonValue: Math.round(baseTotal),
        agingBonus: Math.round(agingBonus),
        demandBonus: Math.round(demandBonus),
        potionBonus: Math.round(potionBonus),
        totalValue: Math.round(totalValue),
        tradingPower,
        recommendation
    };
};

export default function RobloxAdoptMeNeonPetValue() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rarity: 'legendary',
            baseValue: 10,
            isFly: false,
            isRide: false,
            demandMultiplier: 1.2,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateNeonValue(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Script id="adopt-me-neon-calc-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-cyan-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Sparkles className="h-6 w-6 text-cyan-500" />
                        Adopt Me Neon Pet Value
                    </CardTitle>
                    <CardDescription>
                        Is it worth making a neon? Calculate true trading value including aging and demand.
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
                                                <FormLabel>Pet Rarity</FormLabel>
                                                <FormControl>
                                                    <select {...field} className="w-full p-2 border rounded-md bg-background">
                                                        {rarities.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                                    </select>
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="baseValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>One Pet Value (Estimated)</FormLabel>
                                                <CardDescription className="text-xs mb-2">Arbitrary value (e.g. 10 for Unicorn)</CardDescription>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="isFly"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Fly</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <input
                                                            type="checkbox"
                                                            checked={field.value}
                                                            onChange={field.onChange}
                                                            className="h-4 w-4"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="isRide"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                                    <div className="space-y-0.5">
                                                        <FormLabel>Ride</FormLabel>
                                                    </div>
                                                    <FormControl>
                                                        <input
                                                            type="checkbox"
                                                            checked={field.value}
                                                            onChange={field.onChange}
                                                            className="h-4 w-4"
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="demandMultiplier"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Demand: {field.value}x</FormLabel>
                                                <FormControl>
                                                    <Slider
                                                        min={1}
                                                        max={3}
                                                        step={0.1}
                                                        value={[field.value]}
                                                        onValueChange={vals => field.onChange(vals[0])}
                                                    />
                                                </FormControl>
                                                <CardDescription className="text-xs">
                                                    1.0 = Normal, 2.0 = High Tier (Cow, Turtle), 3.0 = Shadow Dragon
                                                </CardDescription>
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 font-bold">
                                        CALCULATE NEON VALUE
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
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 animate-pulse"></div>
                                <CardHeader className="relative pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-400">Estimated Neon Trading Value</CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
                                        {result.totalValue}
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        ~{((result.totalValue / (result.neonValue / 4))).toFixed(1)}x value of a single pet
                                    </p>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">Base (4x)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <span className="text-2xl font-bold">{result.neonValue}</span>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">Aging Bonus</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <span className="text-2xl font-bold text-green-600">+{result.agingBonus}</span>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">Demand Bonus</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <span className="text-2xl font-bold text-blue-600">+{result.demandBonus}</span>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">Potions</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <span className="text-2xl font-bold text-purple-600">+{result.potionBonus}</span>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-cyan-50 dark:bg-cyan-900/10 border-cyan-100 dark:border-cyan-900">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4" />
                                        Trader's Insight
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium text-lg mb-2">{result.recommendation}</p>
                                    <p className="text-sm text-muted-foreground">
                                        This Neon falls into the <span className="font-bold text-foreground">{result.tradingPower}</span> category.
                                        {result.agingBonus > result.neonValue * 0.5
                                            ? " The high aging bonus suggests you should definitely make this neon yourself rather than trading for it."
                                            : " The low aging bonus suggests it might be faster to just trade 4 pets for it if you can."}
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                            <div className="text-center space-y-4 max-w-sm">
                                <Cat className="w-16 h-16 mx-auto opacity-20" />
                                <h3 className="text-lg font-semibold">Neon Value Estimator</h3>
                                <p>Enter the base pet details to see how much value is added by making it Neon.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Formula
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                        <strong>Base Neon Value</strong> = 4 × Single Pet Value.
                    </p>
                    <p>
                        <strong>Aging Bonus</strong> = Base Value × (Rarity Hours Bonus). Legendaries take ~6 hours to age up from Newborn to Full Grown, creating significant scarcity value.
                    </p>
                    <p>
                        <strong>Demand Multiplier</strong> = Additional value for "Preppy" or "High Tier" pets (e.g., Cows, Turtles, Frost Dragons) where players overpay for the neon aesthetic.
                    </p>
                    <p>
                        <strong>Total Value</strong> = Base + Aging Bonus + Demand Bonus + Potions.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Steps to Make a Neon</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                        {steps.map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="The Ultimate Guide to Adopt Me Neon Pet Trading Values" />
                <meta itemProp="description" content="Learn how to value Neon pets in Roblox Adopt Me. Understand the math behind aging bonuses, scarcity, and high-tier trading." />
                <meta itemProp="keywords" content="Adopt Me Neon Values, Roblox Pet Calculator, Neon Cow Value, Neon Legendary Trading, Adopt Me Trading Guide" />
                <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
                <meta itemProp="datePublished" content="2025-01-25" />
                <meta itemProp="url" content={baseUrl} />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Adopt Me Neon Pet Trading Values</h1>
                <p className="text-lg italic text-muted-foreground">Why 4 Unicorns are not worth 1 Neon Unicorn: The economics of time, scarcity, and the glowing premium.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#introduction" className="hover:underline">What Gives a Neon Value?</a></li>
                    <li><a href="#math-breakdown" className="hover:underline">The Math: Newborns vs. Full Growns</a></li>
                    <li><a href="#aging-tasks" className="hover:underline">The Grind: Task Breakdown by Rarity</a></li>
                    <li><a href="#potions" className="hover:underline">Potions: Fly/Ride vs. No Potion Explained</a></li>
                    <li><a href="#trading-psychology" className="hover:underline">Trading Psychology: "Preppy" Values</a></li>
                    <li><a href="#scams" className="hover:underline">Scam Prevention: Fake Neons & Switch Scams</a></li>
                    <li><a href="#history" className="hover:underline">History of Neons: From 2017 to Now</a></li>
                </ul>
                <hr className="my-6" />

                <h2 id="introduction" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Gives a Neon Value?</h2>
                <p>In <em>Adopt Me!</em>, a Neon pet is created by fusing four fully grown pets of the same type in the specialized Neon Cave located under the main bridge. Visually, the pet gains glowing sections on its body—ears, feet, tails, or horns depending on the species. But economically, the value of a Neon comes from one fundamental resource: <strong>Time</strong>.</p>
                <p>Most pets obtained from eggs start as "Newborn." To make a Neon, you must level up four separate pets through the following life stages: Newborn, Junior, Pre-Teen, Teen, Post-Teen, and Full Grown. This process requires completing hundreds of "tasks" (orange and blue circles that appear on your screen). When you trade for a Neon, you are not just buying the pet; you are paying for the seller's labor hours.</p>

                <h2 id="math-breakdown" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Math: Newborns vs. Full Growns</h2>
                <p>A common mistake made by new traders is assuming that 4 Newborn pets equal 1 Neon pet. Mathematically, this seems correct (4 pets = 1 neon), but in the Adopt Me economy, this is a massive underpay.</p>
                <h3 className="text-xl font-semibold mt-4">The "Neon Premium"</h3>
                <p>The "Neon Premium" is the extra value added by the Full Grown status. Because aging pets is tedious, a Full Grown pet is worth approximately <strong>1.5x to 2x</strong> a Newborn pet of the same species.</p>
                <ul className="list-disc pl-6 space-y-2 my-4">
                    <li><strong>4 Newborn Unicorns</strong> = Worth ~4 "Unicorn Units"</li>
                    <li><strong>4 Full Grown Unicorns</strong> = Worth ~7-8 "Unicorn Units"</li>
                    <li><strong>1 Neon Unicorn</strong> = Worth ~5-6 "Unicorn Units" + Convenience Fee</li>
                </ul>
                <p>Wait, why is a Neon worth less than 4 Full Growns? Sometimes it is! Many traders prefer 4 Full Growns because they are working towards a <strong>Mega Neon</strong> (which requires 4 Neons). However, for the average player who just wants a cool glowing pet, the Neon is the goal. Generally, you should never trade 4 Newborns for a Neon unless you add significant value (like a Ride potion or another Legendary).</p>

                <h2 id="aging-tasks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Grind: Task Breakdown by Rarity</h2>
                <p>The rarity of the pet drastically changes the value of the Neon form because aging takes exponentially longer for higher rarities. Understanding this helps you use our calculator more effectively.</p>

                <h3 className="text-xl font-semibold mt-4">Common (e.g., Cat, Dog)</h3>
                <p><strong>Tasks to Full Grown:</strong> ~56 tasks per pet.<br /><strong>Time Estimate:</strong> ~1 hour per pet.<br /><strong>Neon Value:</strong> Low. Since it's easy to make, the "Neon Premium" is small.</p>

                <h3 className="text-xl font-semibold mt-4">Rare (e.g., Beaver, Rabbit)</h3>
                <p><strong>Tasks to Full Grown:</strong> ~96 tasks per pet.<br /><strong>Time Estimate:</strong> ~2.5 hours per pet.<br /><strong>Neon Value:</strong> Moderate. Players start feeling the grind here.</p>

                <h3 className="text-xl font-semibold mt-4">Legendary (e.g., Unicorn, Turtle, Dragon)</h3>
                <p><strong>Tasks to Full Grown:</strong> ~189 tasks per pet.<br /><strong>Time Estimate:</strong> ~6 hours per pet (Active gameplay).<br /><strong>Neon Value:</strong> Massive. Making a Neon Legendary requires roughly <strong>24 hours of active gameplay</strong>. This is why Neon Legendaries are the gold standard currency of high-tier trading. You are saving the buyer literally a full day of grinding.</p>

                <h2 id="potions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Potions: Fly/Ride vs. No Potion Explained</h2>
                <p>The value of Fly (F) and Ride (R) potions on Neons is counter-intuitive for high-tier pets.</p>
                <ul className="list-disc pl-6 space-y-2 my-4">
                    <li><strong>Low/Mid Tier Pets:</strong> Potions ADD value. A Neon Ride Cow is worth more than a Neon No-Potion Cow because players want to ride it.</li>
                    <li><strong>High Tier Exams (Shadow Dragon, Giraffe, Bat Dragon):</strong> Potions can SUBTRACT value (or No-Potion adds value). Why? Because most Shadow Dragons from 2019 have already been fed potions. Finding a "No Potion" (untouched) Shadow Dragon is incredibly rare. Therefore, a <strong>No-Potion Neon Shadow Dragon</strong> is one of the rarest items in the game, worth significantly more than a Fly-Ride Neon Shadow.</li>
                </ul>

                <h2 id="trading-psychology" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Trading Psychology: "Preppy" Values</h2>
                <p>Adopt Me trading is not just about rarity; it is about aesthetics. The community has dubbed certain pets as "Preppy" pets—usually cute, pastel, or aesthetically pleasing pets that fit a specific avatar style.</p>
                <p><strong>Examples of Preppy Pets (High Demand):</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Cows (The ultimate high-demand pet, trades for way above its rarity)</li>
                    <li>Turtles</li>
                    <li>Poodles</li>
                    <li>SSBD (Strawberry Shortcake Bat Dragon)</li>
                    <li>Jellyfish</li>
                </ul>
                <p><strong>Examples of Low Demand Pets:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Griffin (Legendary, but disliked design)</li>
                    <li>Dragonfly</li>
                    <li>Minion Chick</li>
                </ul>
                <p>Our calculator's "Demand Multiplier" exists exactly for this reason. A Neon Cow might be an Ultra-Rare, but it trades for more than many Neon Legendaries solely because players love how it looks.</p>

                <h2 id="scams" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Scam Prevention: Fake Neons & Switch Scams</h2>
                <p>When trading for high-value Neons, you become a target for scammers. Here are the most common methods to watch out for:</p>
                <h3 className="text-xl font-semibold mt-4">1. The Switch Scam</h3>
                <p>The scammer puts in a Neon Shadow Dragon. You put in your mega offer. They say "Pls add a food item" or distract you. While you are typing or looking, they quickly swap the Neon Shadow for a <span className="text-red-500 font-bold">Regular Shadow</span>. The icons look very similar. Always hover over the item to verify it says "Neon" before hitting accept on the second window.</p>
                <h3 className="text-xl font-semibold mt-4">2. The "Fail Trade"</h3>
                <p>They claim their trade is "glitched" and ask you to give your items first, promising to give the Neon in a second trade. <strong>Never do this.</strong> There is no such thing as a trade glitch that requires two separate transactions. This is always a scam.</p>
                <h3 className="text-xl font-semibold mt-4">3. Pertunia/Trim Scams</h3>
                <p>Scammers might rename a regular pet to "Neon Shadow" using the Pet Salon. Do not look at the custom name. Look at the official item tag below the name. If it doesn't have the <span className="text-cyan-500 font-bold">N</span> tag, it isn't Neon.</p>

                <h2 id="history" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">History of Neons: From 2017 to Now</h2>
                <p>Neons were introduced in the "Pet Update" of Summer 2019, forever changing the economy. Before Neons, pets were just singular items. The Neon update introduced a "sink" mechanism—removing 4 pets from the economy to create 1 superior pet. This deflationary mechanic is what keeps the Adopt Me economy alive.</p>
                <p>Every time a player makes a Neon, 3 pets effectively "disappear" from circulation. This scarcity is what gives Mega Neons (which consume 16 pets) their astronomical value.</p>

                <hr className="my-8" />
                <p className="text-sm"><em>Disclaimer: Values in Adopt Me are community-driven and volatile. This calculator attempts to model the "Fair Trade" value, but individual server economies may vary. Always double-check with trusted value lists like Elvebredd or GG for the most up-to-the-minute tier shifts.</em></p>
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
