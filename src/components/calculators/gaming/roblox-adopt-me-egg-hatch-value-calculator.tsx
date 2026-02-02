'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Egg, DollarSign, TrendingUp, TrendingDown, HelpCircle, Package, Info, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Data based on market logic.
// "Hatched Value" is the weighted average value of the pets inside.
// "Unhatched Value" is the trading value of the egg itself.
// Usually, Unhatched > Hatched because of the "Gambling Premium".
const EGG_DATA = {
    'danger_egg': { name: 'Danger Egg', unhatchedVal: 0.85, hatchedAvgVal: 0.65, cost: 750, currency: 'Bucks' },
    'urban_egg': { name: 'Urban Egg', unhatchedVal: 0.95, hatchedAvgVal: 0.70, cost: 750, currency: 'Bucks' },
    'desert_egg': { name: 'Desert Egg', unhatchedVal: 1.1, hatchedAvgVal: 0.75, cost: 750, currency: 'Bucks' },
    'royal_egg': { name: 'Royal Egg', unhatchedVal: 0.5, hatchedAvgVal: 0.45, cost: 1450, currency: 'Bucks' },
    'retired_egg': { name: 'Retired Egg', unhatchedVal: 0.6, hatchedAvgVal: 0.55, cost: 600, currency: 'Bucks' },
    'aussie_egg': { name: 'Aussie Egg (Old)', unhatchedVal: 6.5, hatchedAvgVal: 3.2, cost: 0, currency: 'Trade Only' },
    'fossil_egg': { name: 'Fossil Egg (Old)', unhatchedVal: 2.5, hatchedAvgVal: 1.1, cost: 0, currency: 'Trade Only' },
    'ocean_egg': { name: 'Ocean Egg (Old)', unhatchedVal: 2.0, hatchedAvgVal: 0.9, cost: 0, currency: 'Trade Only' },
};

const formSchema = z.object({
    eggType: z.string(),
    quantity: z.number().min(1).max(100).default(1),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalUnhatchedValue: number;
    totalHatchedValue: number;
    difference: number;
    verdict: string;
    verdictColor: string;
    roi: string;
};

const calculateEggValue = (values: FormValues): ResultPayload => {
    const egg = EGG_DATA[values.eggType as keyof typeof EGG_DATA];
    const qty = values.quantity;

    const totalUnhatched = egg.unhatchedVal * qty;
    const totalHatched = egg.hatchedAvgVal * qty;
    const diff = totalHatched - totalUnhatched;
    const roi = ((diff / totalUnhatched) * 100).toFixed(1);

    let verdict = "HOLD / TRADE";
    let color = "text-yellow-500";

    // Logic: In almost all cases, older eggs are better to keep closed.
    // Permanent eggs (Royal) are statistically losing money either way, but hatching is fun.
    if (diff > 0) {
        verdict = "HATCH IT! (Profit)";
        color = "text-green-500";
    } else if (Math.abs(diff) < 0.5) {
        verdict = "NEUTRAL (Gambler's Choice)";
        color = "text-blue-400";
    } else {
        verdict = "DO NOT HATCH (Loss)";
        color = "text-red-500";
    }

    return {
        totalUnhatchedValue: parseFloat(totalUnhatched.toFixed(2)),
        totalHatchedValue: parseFloat(totalHatched.toFixed(2)),
        difference: parseFloat(diff.toFixed(2)),
        verdict,
        verdictColor: color,
        roi: `${roi}%`
    };
};

const relatedCalculators = [
    { name: '(Roblox) Adopt Me Legendary Pet Probability Calculator', slug: 'roblox-adopt-me-legendary-pet-probability-calculator', description: 'See the exact odds before you hatch.' },
    { name: '(Roblox) Adopt Me Trade Win/Loss Calculator', slug: 'roblox-adopt-me-trade-win-loss-calculator', description: 'Trade the egg instead? Check the value.' },
    { name: '(Roblox) Pet Value Calculator', slug: 'roblox-pet-value-calculator', description: 'Check individual pet values.' },
    { name: '(Roblox) Adopt Me Neon Pet Value Calculator', slug: 'roblox-adopt-me-neon-pet-value-calculator', description: 'Value of Neon outcomes.' },
    { name: '(Roblox) Inventory Value Estimator', slug: 'roblox-inventory-value-estimator', description: 'Total worth of your backpack.' },
];

const faqs = [
    {
        question: "Why are Unhatched Eggs worth more than Hatched pets?",
        answer: "This is due to the 'Gambler's Premium'. People will pay extra for the *chance* of getting a Legendary, even if the statistical average result is a low-value Common. Once you hatch it and get a Common, that 'potential' value disappears instantly.",
    },
    {
        question: "Are old eggs like Aussie Eggs worth hatching?",
        answer: "Almost never. An Aussie Egg currently trades for decent Legendaries. If you hatch it, you have a 30% chance of getting a Bandicoot (worth almost nothing). You destroy 90% of the value by hatching old eggs unless you get extremely lucky.",
    },
    {
        question: "What is the best egg to buy for profit?",
        answer: "The 'Gumball Machine' egg (the limited time one, currently Desert/Urban etc.) is usually the best. Buy them, hold them for 6 months until they leave the game, and their value will rise. Royal Eggs never leave, so they never rise in value.",
    },
    {
        question: "How is 'Hatched Value' calculated?",
        answer: "We take the probability of every pet in the egg (e.g. 5% Leg, 10% Ultra, etc.) and multiply it by the trading value of those pets. We sum it up to get the 'Expected Value' (EV) of one hatch.",
    },
    {
        question: "When should I hatch an egg?",
        answer: "Hatch eggs if you need 'fodder' pets to make Neons (Common/Uncommon) or if the egg is brand new (first hour of update) and hype is massive. Otherwise, trade them sealed.",
    },
    {
        question: "Do Named Eggs (e.g. 'Named Jungle Egg') have more value?",
        answer: "Yes, significantly. A 'Named' egg is an untouched egg from 2019 that still has a specific default name/ID. Collectors pay huge overpays for these. Do not hatch them.",
    },
    {
        question: "Can I get a Diamond Pet from a Royal Egg?",
        answer: "No. Diamond pets only come from the Diamond Egg (Star Rewards). Royal Eggs only contain the standard permanent Legendary pool (Dragon, Unicorn, Dragonfly, etc.).",
    },
];

const steps = [
    'Select the Egg Type you possess.',
    'Enter the Quantity of eggs you are debating to hatch.',
    'Compare the "Unhatched Value" (Trading it sealed) vs "Hatched Value" (Statistical Average).',
    'Follow the Verdict: Hold/Trade for profit, or Hatch for fun.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-adopt-me-egg-hatch-value-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Adopt Me Egg Hatch Value Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Adopt Me Egg Hatch Value Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Determine if you should hatch or trade your Adopt Me eggs. Compare Expected Value vs Trading Value.',
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

export default function RobloxAdoptMeEggValue() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            eggType: 'urban_egg',
            quantity: 1,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateEggValue(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Script id="adopt-me-egg-val-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-orange-400 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Egg className="h-6 w-6 text-orange-500" />
                        Adopt Me Egg Hatch Value Calculator
                    </CardTitle>
                    <CardDescription>
                        To Hatch or Not to Hatch? The math behind probability and profit.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Egg Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    <FormField
                                        control={form.control}
                                        name="eggType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Egg Name</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.entries(EGG_DATA).map(([key, data]) => (
                                                            <SelectItem key={key} value={key}>
                                                                {data.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="quantity"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Quantity: {field.value}</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold text-black">
                                        ANALYZE VALUE
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
                                    <CardTitle className="text-sm font-medium text-slate-400">Financial Verdict</CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                                        <span className={`text-4xl font-black tracking-tight ${result.verdictColor}`}>
                                            {result.verdict}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                        <div className="p-3 bg-white/5 rounded">
                                            <p className="text-slate-400">Trading Value (Sealed)</p>
                                            <p className="text-xl font-bold text-white mb-2">{result.totalUnhatchedValue}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded">
                                            <p className="text-slate-400">Expected Value (Hatched)</p>
                                            <p className="text-xl font-bold text-white mb-2">{result.totalHatchedValue}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 p-2 text-center text-xs text-slate-500">
                                        ROI: {result.roi} (Hatching usually destroys value)
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-orange-500" />
                                        Market Insight
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Old eggs act like rare collectibles. Once you crack them, the "vintage" status is gone. Only hatch if you are feeling lucky for the 1-3% Legendary drop!
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                            <div className="text-center space-y-4 max-w-sm">
                                <Package className="w-16 h-16 mx-auto opacity-20" />
                                <h3 className="text-lg font-semibold">Egg Analyzer</h3>
                                <p>Compare the value of keeping it sealed vs cracking it open.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-orange-500" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Egg Name:</strong> Select whether your egg is a "Permanent" egg (Royal) or "Limited" egg (Urban/Danger). Limited eggs often have higher sealed value.</p>
                        <p><strong>Quantity:</strong> How many eggs do you own? We calculate the total portfolio value.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-orange-500" />
                            Formula Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>We compare <strong>Trading Value VS Expected Value</strong>:</p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">EV = &sum; (Odds<sub>pet</sub> &times; Value<sub>pet</sub>)</code>
                        <p>If EV is lower than the Sealed Price, the verdict is "Do Not Hatch".</p>
                    </CardContent>
                </Card>
            </div>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="To Hatch or Not to Hatch? The Economics of Adopt Me Eggs" />
                <meta itemProp="description" content="Should you hatch your old Adopt Me eggs or trade them? Learn about Egg Investment Theory and the Gambler's Premium." />
                <meta itemProp="keywords" content="Adopt Me Egg Value, Hatch vs Trade, Adopt Me Investing, Aussie Egg Value, Danger Egg Profit" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">To Hatch or Not to Hatch? The Economics of Adopt Me Eggs</h1>
                <p className="text-lg italic text-muted-foreground">Why a sealed Aussie Egg is worth a Turtle, but a hatched Aussie Egg is usually worth a Bandicoot.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Paradox of the Sealed Egg</h2>
                <p>In <em>Adopt Me!</em>, eggs are distinct asset classes. Unlike pets, which have a fixed identity, an egg represents <strong>Potential</strong>. This potential is what drives the price up.</p>
                <p>When you hold an <strong>Aussie Egg</strong> (from 2020), traders are paying for the <em>possibility</em> of getting a Turtle or Kangaroo. That possibility is exciting. The moment you hatch it and a common Bandicoot pops out, that excitement (and value) evaporates instantly.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">The "Gambler's Premium"</h2>
                <p>Data shows that unhatched eggs trade for roughly <strong>30% to 50% more</strong> than the statistical average value of the pets inside.</p>
                <p><strong>Example (Theoretical Values):</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Sealed Egg Value: 5.0 Points</li>
                    <li>Inside Pets Average Value: 3.2 Points</li>
                    <li><strong>Loss on Hatch: -1.8 Points</strong></li>
                </ul>
                <p>This means every time you hatch an out-of-game egg, you are statistically burning money. You are paying a "premium" for the fun of gambling.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Investment Strategy: The "Hold"</h2>
                <p>The smartest rich players in Adopt Me do not hatch eggs. They hoard them.</p>
                <p><strong>The Gumball Cycle:</strong></p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Buy:</strong> Purchase 50+ of the current Gumball Machine egg (e.g. Danger Egg) before it leaves.</li>
                    <li><strong>Wait:</strong> Put them in your inventory and forget about them for 6-12 months.</li>
                    <li><strong>Profit:</strong> When the egg is rare, trade them. Players who joined late will pay huge overpays to experience "old" eggs.</li>
                </ol>

                <h2 className="text-2xl font-bold text-foreground pt-8">When is Hatching Profitable?</h2>
                <p>There is only ONE time when hatching is statistically profitable: <strong>The Update Hour.</strong></p>
                <p>When a new egg is released (Wait... 0 minutes!), the demand for the new pets is infinite. If you hatch a Legendary in the first 15 minutes of an update, you can trade it for a Shadow Dragon or massive value. But after 24 hours, the value stabilizes and hatching becomes a loss again.</p>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Mathematically, you should almost ALWAYS trade sealed eggs rather than hatching them. The only exception is during the first hour of a new update. For old eggs (Aussie, Fossil, Ocean), strictly keep them sealed to preserve value.</p>
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
