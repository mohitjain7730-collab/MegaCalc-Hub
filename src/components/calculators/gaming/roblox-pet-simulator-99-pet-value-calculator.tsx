'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LineChart, ArrowUpRight, ArrowDownRight, Briefcase, Coins, Info, ShieldCheck, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
    petTier: z.enum(['exclusive', 'huge', 'titanic']),
    quantity: z.number().min(1).default(1),
    rapPerUnit: z.number().min(0).default(500000), // 500k
    inflationTrend: z.enum(['deflation', 'stable', 'inflation', 'hyperinflation']),
    marketState: z.enum(['panic_sell', 'normal', 'hype']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalPortfolioValue: string;
    inflationAdjustedValue: string;
    trendIcon: 'up' | 'down' | 'stable';
    advice: string;
    liquidityRating: string;
};

const calculatePS99Value = (values: FormValues): ResultPayload => {
    const rawTotal = values.quantity * values.rapPerUnit;

    // Trend logic
    // Inflation means gems are worth LESS, so Pet Prices go UP (Number goes up, buying power stays same)
    // Deflation means gems are worth MORE, so Pet Prices go DOWN.

    let projectionMult = 1.0;
    if (values.inflationTrend === 'hyperinflation') projectionMult = 1.5; // Expect +50% rise
    if (values.inflationTrend === 'inflation') projectionMult = 1.1;
    if (values.inflationTrend === 'deflation') projectionMult = 0.8; // Expect drop

    // Market Hype logic
    if (values.marketState === 'panic_sell') projectionMult -= 0.2;
    if (values.marketState === 'hype') projectionMult += 0.2;

    const projectedVal = rawTotal * projectionMult;

    // Advice
    let advice = "HOLD";
    let trend: 'up' | 'down' | 'stable' = 'stable';

    if (projectionMult > 1.1) {
        advice = "BUY / HOLD (Value Raising)";
        trend = 'up';
    } else if (projectionMult < 0.9) {
        advice = "SELL NOW (Value Dropping)";
        trend = 'down';
    }

    // Liquidity Rating (How hard is it to sell?)
    // Titanics = Hard (High value), Huges = Easy (Currency), Exclusives = Medium
    let liquidity = "High (Easy to sell)";
    if (values.petTier === 'titanic') liquidity = "Low (Niche Buyers)";
    if (values.petTier === 'exclusive' && values.marketState === 'panic_sell') liquidity = "Very Low (Nobody buying)";

    return {
        totalPortfolioValue: formatNumber(rawTotal),
        inflationAdjustedValue: formatNumber(projectedVal),
        trendIcon: trend,
        advice,
        liquidityRating: liquidity,
    };
};

function formatNumber(num: number): string {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + " B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + " M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + " k";
    return num.toLocaleString();
}

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator X Trading Value Calculator', slug: 'roblox-pet-simulator-x-trading-value-calculator', description: 'Similar logic for PSX.' },
    { name: '(Roblox) Adopt Me Collection Value Estimator', slug: 'roblox-adopt-me-collection-value-estimator', description: 'Estimate inventory value.' },
    { name: '(Roblox) Inventory Value Estimator', slug: 'roblox-inventory-value-estimator', description: 'General Roblox item values.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Is VIP in PS99 worth it?' },
    { name: '(Roblox) Trade Tax Calculator', slug: 'roblox-trade-tax-calculator', description: 'Calculate tax loss.' },
];

const faqs = [
    {
        question: "How is PS99 different from PSX economy?",
        answer: "Pet Simulator 99 has a more deflationary economy at times due to stronger diamond sinks (Upgrades, Enchants, Machines). However, inflation still happens during update droughts when billions of gems are farmed with nothing to buy.",
    },
    {
        question: "What items are 'Inflation Proof'?",
        answer: "Items that are strictly limited in quantity (Titanics, Serial Numbered Huges, Exclusive Eggs) are inflation-proof. They will always rise in gem price as gems become less valuable.",
    },
    {
        question: "Why do huge pets drop in value?",
        answer: "When a new 'Active Huge' is added to the rotation (hatchable from the best egg), the supply of Huges increases, causing the price of low-tier cheek huges (like Rocks/Computers) to drop.",
    },
    {
        question: "Does RAP update instantly?",
        answer: "No. RAP updates every few hours based on batches of sales. In a fast-moving market (like right after an update drops), RAP is often wrong. Trust the 'Live Auction' prices more.",
    },
    {
        question: "Is it better to hold Gems or Pets?",
        answer: "In an inflationary economy (most of the time), holding Pets is better. If you hold 1 Billion gems for a month, it might only buy you 0.8 Huge Pets later. If you bought the Huge immediately, you still have 1 Huge.",
    },
    {
        question: "What is 'Deflation'?",
        answer: "Deflation is when prices drop. This happens when a new expensive update comes out (like Titanic Gifts) and everyone sells their pets to get raw gems to buy the new thing. Cash (Gems) is King during deflation.",
    },
    {
        question: "What are 'Exclusives'?",
        answer: "Exclusives are pets that were only available for Robux (or limited events). They scale off your best pet. They are generally good mid-tier investments for players who can't afford Huges yet.",
    },
];

const steps = [
    'Classify your asset (Exclusive, Huge, or Titanic).',
    'Input total portfolio quantity and unit price.',
    'Assess the macro-economic trend (Is inflation hitting?).',
    'See if you should HOLD or SELL based on projected value.',
];



export default function RobloxPS99ValueCalc() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            petTier: 'huge',
            quantity: 10,
            rapPerUnit: 6000000,
            inflationTrend: 'inflation',
            marketState: 'normal',
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculatePS99Value(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">


            <Card className="border-l-4 border-l-teal-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Briefcase className="h-6 w-6 text-teal-500" />
                        PS99 Portfolio Tracker
                    </CardTitle>
                    <CardDescription>
                        Pet Simulator 99 Value Analyzer. Track Inflation & Investments.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Portfolio Assets</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="petTier"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Asset Tier</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="exclusive">Exclusive / Event</SelectItem>
                                                    <SelectItem value="huge">Huge Pet</SelectItem>
                                                    <SelectItem value="titanic">Titanic Pet</SelectItem>
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
                                            <FormLabel>Quantity Owned</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="rapPerUnit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current RAP (Per Unit)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormDescription>Check in-game rap.</FormDescription>
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="inflationTrend"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Economy Trend</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="deflation">Deflation (Prices Dropping)</SelectItem>
                                                        <SelectItem value="stable">Stable</SelectItem>
                                                        <SelectItem value="inflation">Inflation (Prices Rising)</SelectItem>
                                                        <SelectItem value="hyperinflation">Hyperinflation (Rapid Rise)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="marketState"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Market Sentiment</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="panic_sell">Fear / Panic Selling</SelectItem>
                                                        <SelectItem value="normal">Normal</SelectItem>
                                                        <SelectItem value="hype">Hype / Update Frenzy</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 font-bold text-white">
                                CALCULATE PORTFOLIO
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result ? (
                <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                    <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/40 to-cyan-600/10 animate-pulse"></div>
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Financial Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Current Net Worth</h4>
                                    <p className="text-3xl font-black text-white">{result.totalPortfolioValue} <span className="text-sm font-normal text-teal-400">Gems</span></p>

                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider mt-4">Projected Value (Trend)</h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-2xl font-bold text-teal-200">{result.inflationAdjustedValue}</p>
                                        {result.trendIcon === 'up' && <ArrowUpRight className="text-green-500 h-5 w-5" />}
                                        {result.trendIcon === 'down' && <ArrowDownRight className="text-red-500 h-5 w-5" />}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col justify-center">
                                <div className="p-4 border border-white/10 bg-white/5 rounded-xl text-center">
                                    <p className="text-slate-400 text-sm mb-1">STRATEGY</p>
                                    <p className="text-xl font-bold text-white">{result.advice}</p>
                                    <p className="text-xs text-slate-500 mt-2">Liquidity: {result.liquidityRating}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                    <div className="text-center space-y-4 max-w-sm">
                        <LineChart className="w-16 h-16 mx-auto opacity-20" />
                        <h3 className="text-lg font-semibold">Ready to Analyze</h3>
                        <p>Input your assets to see if you are protected against inflation.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-teal-500" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Economy Trend:</strong> This is the key variable. Inflation means your gems lose value (so buy pets). Deflation means pets lose value (so sell for gems).</p>
                        <p><strong>RAP Per Unit:</strong> The current average price. Multiply this by your Quantity to get total portfolio value.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-teal-500" />
                            Formula Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Projection:</strong></p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">Value = (RAP &times; Quantity) &times; Inflation_Index</code>
                        <p>We apply a +10% to +50% markup for inflation scenarios to predict future value.</p>
                    </CardContent>
                </Card>
            </div>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="Pet Simulator 99 Value Guide: Inflation & Economy" />
                <meta itemProp="description" content="Master the PS99 economy. Learn how inflation works, when to hold Huges vs Gems, and portfolio management strategies." />
                <meta itemProp="keywords" content="Pet Simulator 99 Value Calculator, PS99 Inflation Guide, Deflation ps99, Huge Pet Investment Strategy" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Pet Simulator 99 Value Guide: Inflation & Economy</h1>
                <p className="text-lg italic text-muted-foreground">In PS99, your Net Worth is more important than your Pet Power. Learn to grow your wealth.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Inflation Cycle</h2>
                <p><em>Pet Simulator 99</em> has a dynamic economy driven by one resource: <strong>Diamonds</strong>.</p>
                <div className="bg-muted p-4 border-l-4 border-red-500 my-4">
                    <h3 className="font-bold text-red-700">Inflation (Price Rise)</h3>
                    <p>When players farm billions of gems (via VIP, Last Area, Alts) but there are no good updates or "Gem Sinks" to spend them on, gems become worthless. Result: <strong>Pet Prices Rise</strong> because everyone has too much cash.</p>
                </div>
                <div className="bg-muted p-4 border-l-4 border-green-500 my-4">
                    <h3 className="font-bold text-green-700">Deflation (Price Drop)</h3>
                    <p>When a new massive update drops (e.g., new Clan Battle, new Titanic Egg), players need gems desperately. They sell their Huges for cheap to get cash. Result: <strong>Pet Prices Crash</strong>.</p>
                </div>

                <h2 className="text-2xl font-bold text-foreground pt-8">Portfolio Strategy: The "Hold" Rule</h2>
                <p><strong>When to buy?</strong> Buy massive deflation events. When everyone is panic selling Huge Hell Rocks for 5m, buy 50 of them. </p>
                <p><strong>When to sell?</strong> Sell during Hyperinflation. When that same Huge Hell Rock is trading for 15m because nobody knows what to do with their gems, sell them and sit on the cash until the next crash.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Diversification</h2>
                <p>Do not put all your net worth into one pet (unless it's a Titanic). Titanics are illiquid assets. They are hard to sell quickly without losing value.</p>
                <p>Instead, hold a portfolio of high-demand, mid-tier assets:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Exclusive Eggs:</strong> Always rise long-term. Safest investment.</li>
                    <li><strong>Generic Huges:</strong> The "Dollar Bill" of PS99. Highly liquid.</li>
                    <li><strong>Charm Stones:</strong> Good for small flips, but risky during nerf updates.</li>
                </ul>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Understanding inflation is the key to wealth in Pet Simulator 99. Use this calculator to track the total value of your assets. If the calculator predicts 'Hyperinflation', convert your diamonds to pets immediately to protect your purchasing power.</p>
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
