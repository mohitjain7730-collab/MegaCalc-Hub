'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, TrendingUp, Layers, Info, Gem, CircleDollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from "@/components/ui/separator";

// Base Values (Standardized Unit: 1 = Low Tier Legendary, e.g. Dragon)
// These are approximations for bulk estimation.
const VALUES = {
    legendary: 1.0,
    ultraRare: 0.15, // ~7 Ultra Rares = 1 Leg
    rare: 0.08,      // ~12 Rares = 1 Leg
    uncommon: 0.04,  // ~25 Uncommons = 1 Leg
    common: 0.02,    // ~50 Commons = 1 Leg
    neonMultiplier: 5.0, // Neon is worth 5x the base pet usually (4 pets + aging labor)
    megaMultiplier: 20.0, // Mega is worth 20x base (16 pets + massive labor)
};

const formSchema = z.object({
    legendaryCount: z.number().min(0).default(0),
    ultraRareCount: z.number().min(0).default(0),
    rareCount: z.number().min(0).default(0),
    // Neons
    neonLegendaryCount: z.number().min(0).default(0),
    neonUltraRareCount: z.number().min(0).default(0),
    // Megas
    megaLegendaryCount: z.number().min(0).default(0),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalValuePoints: number;
    equivalentShadows: string;
    equivalentTurtles: string;
    inventoryTier: string;
    tierColor: string;
};

const calculateInventory = (values: FormValues): ResultPayload => {
    let score = 0;

    // Singles
    score += values.legendaryCount * VALUES.legendary;
    score += values.ultraRareCount * VALUES.ultraRare;
    score += values.rareCount * VALUES.rare;

    // Neons
    score += values.neonLegendaryCount * (VALUES.legendary * VALUES.neonMultiplier);
    score += values.neonUltraRareCount * (VALUES.ultraRare * VALUES.neonMultiplier);

    // Megas
    score += values.megaLegendaryCount * (VALUES.legendary * VALUES.megaMultiplier);

    // Conversions
    // Shadow Dragon is approx 120-150 Points relative to low-tier legs (very rough estimate for fun comparison)
    // Turtle is approx 4-6 Points
    const shadows = (score / 130).toFixed(2);
    const turtles = (score / 5).toFixed(1);

    let tier = "Starter Collector";
    let color = "text-slate-500";

    if (score > 500) {
        tier = "ADOPT ME RICH (Top 0.1%)";
        color = "text-yellow-400"; // Gold
    } else if (score > 100) {
        tier = "High Tier Trader";
        color = "text-purple-400";
    } else if (score > 30) {
        tier = "Mid Tier (Solid Inventory)";
        color = "text-blue-400";
    } else if (score > 10) {
        tier = "Growing Collection";
        color = "text-green-400";
    }

    return {
        totalValuePoints: parseFloat(score.toFixed(1)),
        equivalentShadows: shadows,
        equivalentTurtles: turtles,
        inventoryTier: tier,
        tierColor: color,
    };
};

const relatedCalculators = [
    { name: '(Roblox) Adopt Me Trade Win/Loss Calculator', slug: 'roblox-adopt-me-trade-win-loss-calculator', description: 'Analyze individual trades.' },
    { name: '(Roblox) Inventory Value Estimator', slug: 'roblox-inventory-value-estimator', description: 'Track value for Roblox items (Limiteds).' },
    { name: '(Roblox) Adopt Me Pet Aging Speed Calculator', slug: 'roblox-adopt-me-pet-aging-speed-calculator', description: 'How fast can you grow your inventory?' },
    { name: '(Roblox) Adopt Me Mega Neon Value Calculator', slug: 'roblox-adopt-me-mega-neon-value-calculator', description: 'Deep dive into Mega values.' },
    { name: '(Roblox) Adopt Me Bucks to Robux Converter', slug: 'roblox-adopt-me-bucks-to-robux-converter', description: 'Convert cash to value.' },
];

const faqs = [
    {
        question: "How accurate is this estimated value?",
        answer: "This calculator provides a 'Macro' view of your inventory health using standard multipliers (e.g., Neon = 5x Normal). It does not account for specific demand of specific pets (e.g., a Cow is worth more than a Dragon). Use it for tracking overall growth, not for specific trade offers.",
    },
    {
        question: "What is an 'Inventory Dump'?",
        answer: "An Inventory Dump is when you trade 9+ or 18+ random low-tier pets for one good High Tier pet. This is generally a good strategy to 'consolidate' your wealth, as high-tier pets are easier to trade.",
    },
    {
        question: "Why are Neons worth more than 4 pets?",
        answer: "A Neon pet requires 4 full-grown pets. Growing a Legendary from Newborn to Full Grown takes ~6-8 hours. Creating a Neon takes ~25-30 hours of gameplay. When you trade a Neon, you are being paid for that labor.",
    },
    {
        question: "What defines a 'Rich' player in Adopt Me?",
        answer: "Generally, owning a high-tier Mega Neon (like a Mega Crow, Giraffe, or Shadow Dragon) puts you in the top 1% of players. Owning a single Bat Dragon or Shadow Dragon makes you 'Rich' by normal server standards.",
    },
    {
        question: "Should I trade my inventory for one big pet?",
        answer: "Yes. In Adopt Me economics, 'Quality over Quantity' rules. One Shadow Dragon is safer and easier to trade than 500 Metal Oxen. Always try to upgrade multiple small pets into one larger pet.",
    },
    {
        question: "How do I calculate value for Toys and Vehicles?",
        answer: "Toys and Vehicles are much harder to value. Only a few specific items (Mono Moped, Cloud Car, Tombstone Ghostify, Candy Cannon) have high stable value. Most random toys are considered 'adds' with negligible value.",
    },
    {
        question: "Does this calculator include Star Rewards?",
        answer: "Yes, you can count Diamond or Golden pets under the 'Legendary' section. However, be aware that Star Reward pets lose value over time as more players unlock them.",
    },
];

const steps = [
    'Count your Legendary, Ultra-Rare, and Rare pets.',
    'Count your Neon Legendaries separately (they are worth 5x more).',
    'Input the numbers into the estimator.',
    'Check your "Inventory Score" to see which tier of wealth you belong to.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-adopt-me-collection-value-estimator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Adopt Me Collection Value Estimator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Adopt Me Collection Value Estimator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Estimate the total value of your Adopt Me pet collection. Track your inventory growth and wealth tier.',
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

export default function RobloxAdoptMeCollectionValue() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            legendaryCount: 0,
            ultraRareCount: 0,
            rareCount: 0,
            neonLegendaryCount: 0,
            neonUltraRareCount: 0,
            megaLegendaryCount: 0,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateInventory(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Script id="adopt-me-collection-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-blue-600 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                        Adopt Me Collection Value Estimator
                    </CardTitle>
                    <CardDescription>
                        Are you Rich? Calculate the bulk strength of your inventory.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Inventory Stats</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    <div className="space-y-3 p-3 bg-muted/40 rounded border">
                                        <h4 className="font-semibold text-sm">Singles (Normal)</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField
                                                control={form.control}
                                                name="legendaryCount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Legendary</FormLabel>
                                                        <FormControl><Input type="number" className="h-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="ultraRareCount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Ultra-Rare</FormLabel>
                                                        <FormControl><Input type="number" className="h-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="rareCount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Rare</FormLabel>
                                                        <FormControl><Input type="number" className="h-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3 p-3 bg-purple-500/5 rounded border border-purple-500/20">
                                        <h4 className="font-semibold text-sm text-purple-600">Neons & Megas</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            <FormField
                                                control={form.control}
                                                name="neonLegendaryCount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Neon Legs</FormLabel>
                                                        <FormControl><Input type="number" className="h-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="megaLegendaryCount"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs">Mega Legs</FormLabel>
                                                        <FormControl><Input type="number" className="h-8" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-white">
                                        ESTIMATE VALUE
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
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-cyan-600/10 animate-pulse"></div>
                                <CardHeader className="relative pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-400">Wealth Assessment</CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                                        <span className="text-4xl font-black tracking-tight text-white">
                                            {result.totalValuePoints} <span className="text-lg font-normal text-slate-400">Points</span>
                                        </span>
                                    </div>
                                    <p className={`text-xl font-bold mb-4 ${result.tierColor}`}>
                                        Tier: {result.inventoryTier}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-3 bg-white/10 rounded flex flex-col justify-center items-center text-center">
                                            <span className="text-2xl font-bold">{result.equivalentTurtles}</span>
                                            <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Turtles</span>
                                        </div>
                                        <div className="p-3 bg-white/10 rounded flex flex-col justify-center items-center text-center">
                                            <span className="text-2xl font-bold">{result.equivalentShadows}</span>
                                            <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Shadow Dragons</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center text-slate-500 mt-2">Rough equivalence based on bulk trading values.</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        Growth Strategy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        To reach the next tier, focus on converting your {result.totalValuePoints > 50 ? "Neon Legendaries into High-Tiers like Crows or Owls" : "Random Rares into Legendary Pets"}. Consolidation is key to wealth.
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                            <div className="text-center space-y-4 max-w-sm">
                                <Gem className="w-16 h-16 mx-auto opacity-20" />
                                <h3 className="text-lg font-semibold">Inventory Tracker</h3>
                                <p>Input your pet counts to calculate your total estimated net worth.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        How to Use
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
                <meta itemProp="name" content="How to Estimate Your Adopt Me Inventory & Get Richer" />
                <meta itemProp="description" content="Calculate your total Adopt Me net worth. Learn about consolidation strategies, bulk trading, and inventory management." />
                <meta itemProp="keywords" content="Adopt Me Inventory Value, Adopt Me Net Worth, How to get Rich in Adopt Me, Bulk Trading Guide" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">How to Estimate Your Adopt Me Inventory & Get Richer</h1>
                <p className="text-lg italic text-muted-foreground">Stop hoarding randoms. Learn the "Consolidation Strategy" used by the top 1% of traders.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Theory of "Value Density"</h2>
                <p>In <em>Adopt Me!</em>, having an inventory worth 100 points is useless if it is spread across 500 different pets. Why? Because you can only put <strong>18 items</strong> in a trade window.</p>
                <p>This limitation creates a concept called <strong>Value Density</strong>. A "Shadow Dragon" (Dense Value) is worth more than 100 "Dragonfly" pets (Loose Value), even if the spreadsheet says they are mathematically equal. You cannot trade 100 Dragonflies easily. You can trade a Shadow Dragon instantly.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">The 4 Stages of Wealth</h2>

                <h3 className="text-xl font-bold mt-4">Stage 1: The Grinder (0 - 20 Points)</h3>
                <p>You have random eggs, Commons, and maybe one Low-Tier Legendary like a Minion Chick. Not much trading power.</p>
                <p><strong>Strategy:</strong> Make Neons. Turn 4 Commons into 1 Neon Common. Trade that Neon for a generic Legendary. Repeat.</p>

                <h3 className="text-xl font-bold mt-4">Stage 2: The Collector (20 - 100 Points)</h3>
                <p>You have 5-10 Legendaries (Unicorns, Dragons) and maybe a Neon Ultra-Rare. You feel rich, but you can't get a High-Tier yet.</p>
                <p><strong>Strategy:</strong> "Upgrade" trades. Trade 5 Legendaries for 1 Turtle. Trade 3 Turtles for 1 Arctic Reindeer. Always try to give multiple small pets for one slightly better pet.</p>

                <h3 className="text-xl font-bold mt-4">Stage 3: The High-Tier Trader (100 - 500 Points)</h3>
                <p>You own "High Tiers" like Crows, Evil Unicorns, or Parrots. Moving up is hard now.</p>
                <p><strong>Strategy:</strong> Overpays. You now have the power. Ask for overpays when downgrading. Trade your Crow for 6-7 Turtles (profit), then trade those Turtles individually for profit, then buy the Crow back plus extras.</p>

                <h3 className="text-xl font-bold mt-4">Stage 4: The Rich (500+ Points)</h3>
                <p>You own Bat Dragons, Giraffes, or Shadow Dragons. Your inventory essentially grows itself because these pets rise in value faster than inflation.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Inventory Management Tips</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Favorite Your "NFT" Pets:</strong> Lock your "Never For Trade" pets so you don't accidentally add them.</li>
                    <li><strong>Trash the Trash:</strong> Do not hoard Food or Toys unless they are rare. They clutter the trade window and make you look inexperienced.</li>
                    <li><strong>Use Alts for Storage:</strong> If you accept a "9+" trade (giving 9 pets for 1 big pet), you will have excess junk. Move the junk to an alt account to keep your main inventory clean for screenshots.</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground pt-8">Summary</h2>
                <p>Your goal is not just "More Pets". It is "Better Pets". Use this estimator to track your Total Points, but always focus on condensing those points into the fewest number of pets possible.</p>
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
