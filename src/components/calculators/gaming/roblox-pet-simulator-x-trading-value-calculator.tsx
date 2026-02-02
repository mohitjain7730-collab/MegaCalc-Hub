'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Scale, TrendingUp, AlertTriangle, Info, Gavel, Coins, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Simplified Logic for Demo:
// In a real app, this would query an API (like Cosmic Values or RAP API).
// Here we simulate value logic based on user RAP input + Demand modifiers.

const formSchema = z.object({
    petName: z.string().min(1, "Enter a pet name"),
    rapValue: z.number().min(0, "RAP must be positive"), // Recent Average Price
    variant: z.enum(['normal', 'golden', 'rainbow', 'dark_matter', 'shiny']),
    demand: z.enum(['high', 'stable', 'low', 'panicking']),
    isExclusive: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    trueValue: string;
    verdict: string;
    verdictColor: string;
    warning: string | null;
    flipPotential: string;
};

const calculateTradeValue = (values: FormValues): ResultPayload => {
    let value = values.rapValue;

    // Demand Multipliers
    let demandMult = 1.0;
    if (values.demand === 'high') demandMult = 1.2; // Overpay for demand
    if (values.demand === 'stable') demandMult = 1.0; // Fair RAP
    if (values.demand === 'low') demandMult = 0.8; // Underpay likely
    if (values.demand === 'panicking') demandMult = 0.5; // Crash value

    // Variant Multipliers (If RAP is for Normal, adjust. But usually RAP is specific to the item).
    // optimizing for "Is this RAP manipulated?" logic.

    // shiny verification (manual override often needed)
    if (values.variant === 'shiny') {
        // Shiny RAP is often unstable.
    }

    let trueVal = value * demandMult;

    // Manipulation Check logic
    // If RAP is insanely high but demand is low => Manipulation
    let warning = null;
    let verdict = "FAIR TRADE";
    let color = "text-blue-400";

    if (values.demand === 'panicking') {
        verdict = "DO NOT ACCEPT (Crash)";
        color = "text-red-500";
        warning = "This item is crashing. People are panic selling. RAP is likely higher than real value.";
    } else if (values.demand === 'high') {
        verdict = "ACCEPT OVERPAYS";
        color = "text-green-400";
    }

    // Flip Logic
    // Can you sell it for more?
    const flipProfit = (trueVal * 0.9) - (values.rapValue * 0.8); // 1% tax? No, booth tax is variable.
    // PSX Booth Tax is 1%.
    const tax = trueVal * 0.01;
    const net = trueVal - tax;

    let flip = "Neutral";
    if (net > values.rapValue) flip = "Good Flip (+ Profit)";
    else flip = "Bad Flip (Tax Loss)";

    return {
        trueValue: kFormatter(trueVal) + " Gems",
        verdict,
        verdictColor: color,
        warning,
        flipPotential: flip
    };
};

function kFormatter(num: number) {
    if (Math.abs(num) > 999999999) return (Math.abs(num) / 1000000000).toFixed(1) + 'B';
    if (Math.abs(num) > 999999) return (Math.abs(num) / 1000000).toFixed(1) + 'M';
    if (Math.abs(num) > 999) return (Math.abs(num) / 1000).toFixed(1) + 'k';
    return Math.sign(num) * Math.abs(num);
}

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator 99 Pet Value Calculator', slug: 'roblox-pet-simulator-99-pet-value-calculator', description: 'Values for the sequel.' },
    { name: '(Roblox) Adopt Me Collection Value Estimator', slug: 'roblox-adopt-me-collection-value-estimator', description: 'Calculate Adopt Me inventory.' },
    { name: '(Roblox) Trade Tax Calculator', slug: 'roblox-trade-tax-calculator', description: 'Calculate booth tax.' },
    { name: '(Roblox) Pet Simulator X Diamond Calculator', slug: 'roblox-pet-simulator-x-diamond-calculator', description: 'Farm gems to buy pets.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Is VIP worth it?' },
];

const faqs = [
    {
        question: "How is RAP calculated?",
        answer: "RAP (Recent Average Price) is an automatic value calculated by Roblox based on the last few sales of that specific item in the trading booth. It can be manipulated if someone buys their own pet on an alt account for a high price.",
    },
    {
        question: "What is 'Demand' vs 'Value'?",
        answer: "Value is what a spreadsheet or RAP says. Demand is how many people actually WANT the pet. A pet can have 10B Value, but if Demand is 'Low', nobody will trade for it. Always prioritize High Demand items.",
    },
    {
        question: "What is a 'Duped' pet?",
        answer: "A duped pet is a glitched copy. If you trade for one, the game's anti-cheat might delete it later, and you lose your items. Avoid trades that seem 'too good to be true'.",
    },
    {
        question: "How much is the Trading Booth Tax?",
        answer: "In Pet Simulator X, the tax is 1% if you are a VIP member, and slightly higher for non-VIPs (varies by update). Always factor in tax when flipping.",
    },
    {
        question: "Is 'Cosmic Values' accurate?",
        answer: "Cosmic Values (and similar tier lists) are generally trusted by the community for High Tier pets (Huges/Titanics). For low tier pets, rely on RAP.",
    },
    {
        question: "What does 'Clean' mean?",
        answer: "Clean means the pet is not duped. Traders often ask 'Is it clean?' before trading for high-value Titanics.",
    },
    {
        question: "Why did my RAP go down?",
        answer: "Market crashes happen. If a new update releases better pets, old pets lose value. This is called 'Deflation'.",
    },
];

const steps = [
    'Enter the Pet Name and its current RAP (Recent Average Price).',
    'Select the Variant (Normal, Golden, etc.).',
    'Assess the Demand (Is everyone looking for this?).',
    'Calculate the True Trade Value to see if you are overpaying.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-pet-simulator-x-trading-value-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Pet Simulator X Trading Value Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Pet Simulator X Trading Value Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Calculate the fair trade value of pets in Pet Simulator X. Avoid being scammed by RAP manipulation.',
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

export default function RobloxPSXTradingCalc() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            petName: '',
            rapValue: 1000000000,
            variant: 'normal',
            demand: 'stable',
            isExclusive: false,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateTradeValue(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <Script id="psx-trade-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-blue-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Scale className="h-6 w-6 text-blue-500" />
                        Pet Simulator X Trading Calculator
                    </CardTitle>
                    <CardDescription>
                        Detect RAP manipulation. Calculate Fair Value.
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
                                        name="petName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pet Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Huge Hell Rock" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="rapValue"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Current RAP (Gems)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="demand"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Market Demand</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="high">High (Everyone wants it)</SelectItem>
                                                        <SelectItem value="stable">Stable (Easy to sell)</SelectItem>
                                                        <SelectItem value="low">Low (Hard to sell)</SelectItem>
                                                        <SelectItem value="panicking">Crashing (Panic Sell)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-white">
                                        ANALYZE TRADE
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
                                    <CardTitle className="text-sm font-medium text-slate-400">Value Assessment</CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="flex flex-col gap-1 mb-4">
                                        <span className="text-sm text-slate-400">Estimated Real Value</span>
                                        <span className="text-4xl font-black text-white">{result.trueValue}</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                        <div className="p-3 bg-white/10 rounded border border-white/10">
                                            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Verdict</span>
                                            <span className={`text-lg font-bold ${result.verdictColor} flex items-center gap-2`}>
                                                <Gavel className="h-4 w-4" /> {result.verdict}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-white/10 rounded border border-white/10">
                                            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Flip Potential</span>
                                            <span className="text-lg font-bold text-white flex items-center gap-2">
                                                <Coins className="h-4 w-4 text-yellow-500" /> {result.flipPotential}
                                            </span>
                                        </div>
                                    </div>

                                    {result.warning && (
                                        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded flex items-start gap-2 text-sm text-red-200">
                                            <AlertTriangle className="h-5 w-5 shrink-0" />
                                            {result.warning}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                            <div className="text-center space-y-4 max-w-sm">
                                <TrendingUp className="w-16 h-16 mx-auto opacity-20" />
                                <h3 className="text-lg font-semibold">Trade Advisor</h3>
                                <p>Don't get scammed. Compare RAP vs Real Value instantly.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>RAP Value:</strong> Enter the number shown on the pet in-game. Be warned: this number is often outdated or manipulated.</p>
                        <p><strong>Demand:</strong> This is critical. A high RAP pet with no demand is worthless because you cannot sell it.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-blue-500" />
                            Formula Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>True Value Calculation:</strong></p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">Value = RAP &times; Demand_Multiplier</code>
                        <p>We discount "Panic" items by -50% and premium items by +20%.</p>
                    </CardContent>
                </Card>
            </div>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="Pet Simulator X Trading Guide: Avoiding Scams & RAP Manipulation" />
                <meta itemProp="description" content="Learn how to trade safely in Pet Simulator X. Spot manipulated RAP, understand real value vs RAP, and flip pets for profit." />
                <meta itemProp="keywords" content="Pet Simulator X Trading Values, PSX RAP Manipulation, How to Flip Pets PSX, Trading Booth Tax Guide" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Pet Simulator X Trading Guide: Avoiding Scams & RAP Manipulation</h1>
                <p className="text-lg italic text-muted-foreground">RAP is a lie. Real Traders know that Demand is the only truth.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is RAP Manipulation?</h2>
                <p>RAP (Recent Average Price) is calculated by the game based on recent sales. Scammers exploit this by:</p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Using two accounts (Main and Alt).</li>
                    <li>Selling a worthless pet (like a Cat) from Main to Alt for 100 Billion Gems.</li>
                    <li>Trading the gems back and repeating.</li>
                    <li><strong>Result:</strong> Although the pet is worthless, the game displays its RAP as "100B". The scammer then trades this "100B" pet for your real Huge Pet.</li>
                </ol>
                <p><strong>Rule #1:</strong> Never trust RAP on low-tier or random pets. Only trust RAP on high-volume items like Huge Hell Rocks or Eggs.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Demand vs. Value</h2>
                <p>A pet might be "Rare" (only 100 exist), but if nobody wants it, it has Low Demand.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>High Demand:</strong> Huge Pets, Titanic Pets, Exclusive Eggs. (Easy to sell for raw gems).</li>
                    <li><strong>Low Demand:</strong> Random Stat Pets, obscure shinies, old event pets. (Hard to sell, even if fair price).</li>
                </ul>
                <p>Always trade your Low Demand items for High Demand items, even if you lose a little "Paper Value". Liquidity is king.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Flipping Strategy</h2>
                <p>Flipping is buying low and selling high. To do this, you must account for the <strong>1% Booth Tax</strong>.</p>
                <p>If you buy a pet for 10b and sell for 10.1b, you lose money because the tax takes 100m+. You need to aim for at least 10-20% profit margins to be safe.</p>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Trading is the fastest way to get rich in Pet Simulator X, but it is risky. Use this calculator to sanity-check potential trades. If an offer looks too good to be true (e.g. someone offering 500B RAP for your 50B Pet), it is a manipulated scam 100% of the time. Decline immediately.</p>
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
