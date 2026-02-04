'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Coins, ArrowRightLeft, DollarSign, Wallet, ShoppingBag, TrendingUp, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Constants
// Rates based on approx market logic. 
// Official Shop: 1400 Robux = 10,000 Bucks (approx 1 R$ = 7.14 Bucks) - VERY BAD RATE
// Ride Potion Standard: 150 Robux = ~1000-1200 Bucks trading value (approx 1 R$ = 6.6 - 8 Bucks)
// Silk Bags: 1000 Bucks = ~Trade for decent legendaries (hard to equate to R$)
// Black Market (Informational): $1 USD = ~10k-20k Bucks (Violates TOS, but good for comparison context)

const CONVERSION_RATES = {
    'shop': { rate: 7.14, label: 'Official Shop Rate', description: 'Buying Bucks directly from the Roblox store.' },
    'ride_potion': { rate: 8.0, label: 'Ride Potion Standard', description: 'Buying Ride Potions (150 R$) and trading them for Bucks/Pets.' },
    'black_market': { rate: 25.0, label: 'Third-Party / BM (Risky)', description: 'Estimated street value. (Violates TOS, for reference only).' },
};

const formSchema = z.object({
    amount: z.number().min(0, "Amount must be positive"),
    direction: z.enum(['robux_to_bucks', 'bucks_to_robux']),
    rateType: z.enum(['shop', 'ride_potion', 'black_market']).default('shop'),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    convertedAmount: string;
    rateUsed: string;
    explanation: string;
    warning?: string;
};

const calculateConversion = (values: FormValues): ResultPayload => {
    const rateData = CONVERSION_RATES[values.rateType as keyof typeof CONVERSION_RATES];
    const rate = rateData.rate;

    let result = 0;
    let currency = "";

    if (values.direction === 'robux_to_bucks') {
        // Robux -> Bucks
        // e.g. 100 Robux * 7.14 = 714 Bucks
        result = values.amount * rate;
        currency = "Bucks";
    } else {
        // Bucks -> Robux
        // e.g. 1000 Bucks / 7.14 = 140 Robux
        result = values.amount / rate;
        currency = "Robux";
    }

    let warning = undefined;
    if (values.rateType === 'black_market') {
        warning = "WARNING: This rate reflects third-party markets which violate Roblox TOS. Trading for real money can get you banned.";
    } else if (values.rateType === 'shop') {
        warning = "Note: Buying Bucks directly is generally considered a bad deal. Trading Ride Potions is usually more efficient.";
    }

    return {
        convertedAmount: new Intl.NumberFormat('en-US').format(Math.floor(result)) + " " + currency,
        rateUsed: `1 Robux ≈ ${rate.toFixed(2)} Bucks`,
        explanation: rateData.description,
        warning
    };
};

const relatedCalculators = [
    { name: '(Roblox) Adopt Me Trade Win/Loss Calculator', slug: 'roblox-adopt-me-trade-win-loss-calculator', description: 'Check if a trade is fair before you accept.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Is the VIP pass worth the Robux?' },
    { name: '(Roblox) Adopt Me Pet Aging Speed Calculator', slug: 'roblox-adopt-me-pet-aging-speed-calculator', description: 'Time is money. Calculate how fast you grind.' },
    { name: '(Roblox) Trading Profit Analyzer', slug: 'roblox-trading-profit-analyzer', description: 'Track your gains over time.' },
    { name: '(Roblox) Catalog Avatar Creator Pricing', slug: 'roblox-catalog-avatar-creator-pricing', description: 'Cost of outfits in Robux.' },
];

const faqs = [
    {
        question: "Can I legally convert Adopt Me Bucks to Robux?",
        answer: "No. There is no official feature to convert Adopt Me Bucks back into Robux. Once you spend Robux on Bucks, that money is locked in the game. The 'Bucks to Robux' calculation is theoretical for valuing your inventory.",
    },
    {
        question: "Why is the 'Shop Rate' considered a bad deal?",
        answer: "In the official shop, you pay a lot of Robux for a small amount of Bucks. Experienced players prefer buying Ride Potions (150 Robux) and trading them. A Ride Potion can often be traded for pets or items worth far more than the Bucks you would get buying cash directly.",
    },
    {
        question: "What are Silk Bags?",
        answer: "Silk Bags are an item that holds 1,000 Bucks. They were introduced to make trading cash easier. Before Silk Bags, players had to use Cash Registers or Lemonade Stands to transfer money, which was slow and risky.",
    },
    {
        question: "Is buying Adopt Me Bucks on eBay safe?",
        answer: "No. Buying in-game currency with real money (USD/EUR) violates the Roblox Terms of Service (TOS) and Adopt Me's rules. If caught, your account will be permanently banned. Never do it.",
    },
    {
        question: "How much is 10,000 Bucks worth in Robux?",
        answer: "At the official shop rate, 10,000 Bucks costs about 1,400 Robux ($17.50 USD). However, in trading value, it is worth significantly less because money is easy to grind for free.",
    },
    {
        question: "What is the fastest way to earn Bucks without Robux?",
        answer: "The fastest way is to play as a Baby and equip a pet. You get paid for your needs AND the pet's needs. This doubles your income to roughly $150-$200 Bucks per in-game day.",
    },
    {
        question: "Can I give Bucks to my friend?",
        answer: "Yes. You can use a Cash Register (limit $150 per transaction) or a Lemonade/Hot Dog Stand (limit $50 per purchase) to transfer funds. Or, trade Silk Bags (holds $1,000) for a faster, scam-proof transfer.",
    },
];

const steps = [
    'Enter the Amount of currency you want to convert.',
    'Select the conversion direction (Robux to Bucks or Bucks to Robux).',
    'Choose the "Conversion Rate" (Official Shop vs Trading Standards).',
    'Click Convert to see the estimated value.',
];



export default function RobloxAdoptMeBucksConverter() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: 1000,
            direction: 'bucks_to_robux',
            rateType: 'shop',
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateConversion(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">


            <Card className="border-l-4 border-l-green-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Coins className="h-6 w-6 text-green-500" />
                        Adopt Me Bucks to Robux Converter
                    </CardTitle>
                    <CardDescription>
                        Determine the real value of your Adopt Me cash.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Conversion Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    <FormField
                                        control={form.control}
                                        name="direction"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Direction</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="bucks_to_robux">Bucks ➔ Robux</SelectItem>
                                                        <SelectItem value="robux_to_bucks">Robux ➔ Bucks</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Amount</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="rateType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Conversion Standard</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.entries(CONVERSION_RATES).map(([key, data]) => (
                                                            <SelectItem key={key} value={key}>{data.label}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <div className="p-2 bg-muted text-xs rounded text-muted-foreground mt-2">
                                                    {CONVERSION_RATES[form.watch('rateType') as keyof typeof CONVERSION_RATES].description}
                                                </div>
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 font-bold">
                                        CONVERT
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
                                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 animate-pulse"></div>
                                <CardHeader className="relative pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-400">Estimated Value</CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="flex items-baseline gap-2 mb-2">
                                        <span className="text-5xl font-black tracking-tight text-white mb-2">
                                            {result.convertedAmount}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        Using Rate: {result.rateUsed}
                                    </p>

                                    {result.warning && (
                                        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm text-yellow-200 flex gap-2 items-start">
                                            <Info className="h-5 w-5 shrink-0" />
                                            <span>{result.warning}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">Currency</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-green-500" />
                                            {form.watch('direction') === 'bucks_to_robux' ? 'Bucks' : 'Robux'}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-muted-foreground">Exchange Method</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold flex items-center gap-2">
                                            <ArrowRightLeft className="h-5 w-5 text-blue-500" />
                                            {form.watch('rateType') === 'shop' ? 'Official' : 'Trading'}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                            <div className="text-center space-y-4 max-w-sm">
                                <Coins className="w-16 h-16 mx-auto opacity-20" />
                                <h3 className="text-lg font-semibold">Converter Ready</h3>
                                <p>Select a conversion direction to assume purchasing power.</p>
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
                <meta itemProp="name" content="Adopt Me Economy Guide: Bucks, Silk Bags, and Robux" />
                <meta itemProp="description" content="Understand the real exchange rate between Adopt Me Bucks and Robux. Learn about Silk Bags, Ride Potions, and the in-game economy." />
                <meta itemProp="keywords" content="Adopt Me Bucks to Robux, Silk Bags Value, Adopt Me Economy, Ride Potion Trading Value, Robux Calculator" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Adopt Me Economy Guide: Bucks, Silk Bags, and Robux</h1>
                <p className="text-lg italic text-muted-foreground">Why 1,000 Bucks is not worth the same in the Shop vs. the Trade Server.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Dual Economy of Adopt Me</h2>
                <p>One of the most confusing aspects of <em>Adopt Me!</em> for parents and new players is the disconnect between the "Official Price" of items and their "Trading Price".</p>
                <p>Technically, you can buy <strong>Adopt Me Bucks</strong> using Robux. You can also buy <strong>Pets</strong> using Robux (e.g., the Cerberus or Guardian Lion). However, the exchange rates for these two actions are wildly different.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Method 1: The "Shop Rate" (The Whale Trap)</h2>
                <p>If you open the in-game shop and click the "+" button next to your Bucks balance, you will see offers like "2,900 Bucks for 650 Robux".</p>
                <p><strong>This is a terrible deal.</strong></p>
                <p>In this scenario, you are paying roughly <strong>1 Robux for 4.5 Bucks</strong>. Experienced players almost never do this unless they are desperate for 50 bucks to buy an egg right now. It is considered a "Whale Trap"—designed for people with unlimited money who don't care about value.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Method 2: The "Ride Potion Standard" (The Smart Way)</h2>
                <p>The smartest way to convert Robux into Adopt Me value is by purchasing <strong>Ride Potions</strong> (150 Robux each) or <strong>Fly Potions</strong> (295 Robux each).</p>
                <p>These potions are highly liquid assets. You can trade a single Ride Potion for a Legendary pet (like a Unicorn or Dragon) or for roughly 9-10 Silk Bags (approx. 9,000-10,000 Bucks value in goods). <em>(Note: Direct cash trading is limited, so this is usually done via goods value)</em>.</p>
                <p>When you use the Ride Potion method, your 150 Robux gets you ~1,000+ Bucks worth of purchasing power. This is nearly <strong>2x to 3x more efficient</strong> than the Shop Rate.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">The Rise of Silk Bags</h2>
                <p>For years, trading cash in Adopt Me was a nightmare. You had to use a Lemonade Stand ($50 limit) or Cash Register ($150 limit) and click dozens of times. It was also prone to scams.</p>
                <p><strong>Enter the Silk Bag.</strong></p>
                <p>Silk Bags are an item introduced during the Lunar New Year event. They cost 1,050 Bucks to buy, but they store exactly 1,000 Bucks inside them. They can be traded in the trade window just like a pet.</p>
                <p>This revolutionized the economy. Now, "1,000 Bucks" is a standardized unit of currency. Traders will often say "Selling Kangaroo for 4 Silk Bags". This effectively pegged the value of Adopt Me cash to physical items.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Why Buying Cash is a Scam (TOS Compliance)</h2>
                <p>You will often see websites or Discord servers claiming to sell "100,000 Adopt Me Bucks for $5 USD".</p>
                <p><strong>DO NOT DO THIS.</strong></p>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                    <li><strong>It allows hackers to win:</strong> Most of these cheap bucks come from hacked accounts. By buying them, you are funding account stealers.</li>
                    <li><strong>It gets you banned:</strong> Adopt Me developers (DreamCraft) have strict tracking. If you receive 100k bucks from a flagged account, your inventory will be wiped and your account banned.</li>
                    <li><strong>It destroys the game:</strong> Inflation ruins the economy for everyone.</li>
                </ol>

                <h2 className="text-2xl font-bold text-foreground pt-8">Calculated Exchange Ratios</h2>
                <p>For the purpose of this calculator, we track three tiers of value:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Tier 1 (Official):</strong> 1 R$ = ~7 Bucks. (Safe, Fast, Expensive)</li>
                    <li><strong>Tier 2 (Ride Average):</strong> 1 R$ = ~8-10 Bucks. (Requires Trading Work).</li>
                    <li><strong>Tier 3 (Grinding):</strong> 0 R$. Bucks are free if you put in the time.</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground pt-8">Summary</h2>
                <p>If you have Robux and want Bucks, buy Ride Potions and trade them. If you have Bucks and want Robux, you are out of luck—there is no legitimate way to cash out. Enjoy the game, build your house, and hoard those Silk Bags for the next big update!</p>
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
