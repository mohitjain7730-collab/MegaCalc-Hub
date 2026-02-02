'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldAlert, ShieldCheck, Lock, AlertTriangle, UserX, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
    tradeType: z.enum(['trust', 'cross_trade', 'fail_trade', 'add_after', 'giveaway']),
    partner: z.enum(['stranger', 'online_friend', 'irl_friend', 'youtuber']),
    location: z.enum(['in_game', 'discord', 'social_media']),
    promise: z.enum(['robux', 'better_pet', 'code', 'nothing']),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    riskLevel: number; // 0 to 100
    verdict: string;
    verdictColor: string;
    explanation: string;
    action: string;
};

const calculateSafety = (values: FormValues): ResultPayload => {
    let risk = 0;

    // Base Risk by Type
    if (values.tradeType === 'trust') risk += 100; // Trust trades are always scams
    if (values.tradeType === 'fail_trade') risk += 90;
    if (values.tradeType === 'cross_trade') risk += 95; // Against TOS, extremely risky
    if (values.tradeType === 'add_after') risk += 80;
    if (values.tradeType === 'giveaway') risk += 50;

    // Modifiers
    if (values.partner === 'stranger') risk += 20;
    if (values.partner === 'online_friend') risk += 10;
    if (values.partner === 'youtuber') risk += 10; // Impersonators are common
    if (values.partner === 'irl_friend') risk -= 50; // Real life friends are safer (usually)

    if (values.location === 'discord' || values.location === 'social_media') risk += 30;

    if (values.promise === 'robux') risk += 40; // Robux trades are almost always scams
    if (values.promise === 'code') risk += 50;

    // Cap at 100, Min 0
    risk = Math.min(100, Math.max(0, risk));

    let verdict = "SAFE";
    let color = "text-green-500";
    let explanation = "This appears to be a standard, safe interaction.";
    let action = "Proceed with normal caution.";

    if (risk >= 90) {
        verdict = "GUARANTEED SCAM";
        color = "text-red-600";
        explanation = "This trade pattern matches known scam methods perfectly. You will lose your items.";
        action = "BLOCK THIS USER IMMEDIATELY.";
    } else if (risk >= 70) {
        verdict = "CRITICAL RISK";
        color = "text-red-500";
        explanation = "The markers for this trade are extremely dangerous. Do not proceed.";
        action = "Do not trade. Report the user if they persist.";
    } else if (risk >= 40) {
        verdict = "HIGH RISK";
        color = "text-orange-500";
        explanation = "This is suspicious. Why can't the trade be done in a single window?";
        action = "Ask to trade everything in one window. If they refuse, leave.";
    } else if (risk > 10) {
        verdict = "CAUTION";
        color = "text-yellow-500";
        explanation = "Be careful. Verify they are who they say they are.";
        action = "Double check the second trade window.";
    }

    // Override for specific keywords
    if (values.tradeType === 'trust') {
        explanation = "There is no such thing as a valid 'Trust Trade'. It is a made-up term by scammers.";
    }
    if (values.tradeType === 'fail_trade') {
        explanation = "Fail Trades are patched or fake. The trade will go through and you will lose your pet.";
    }

    return {
        riskLevel: risk,
        verdict,
        verdictColor: color,
        explanation,
        action
    };
};

const relatedCalculators = [
    { name: '(Roblox) Adopt Me Trade Win/Loss Calculator', slug: 'roblox-adopt-me-trade-win-loss-calculator', description: 'Check values for legitimate trades.' },
    { name: '(Roblox) Pet Dupe Value Calculator', slug: 'roblox-pet-dupe-value-calculator', description: 'Is that high-tier pet duped?' },
    { name: '(Roblox) Adopt Me Bucks to Robux Converter', slug: 'roblox-adopt-me-bucks-to-robux-converter', description: 'Understand the real value of Robux offers.' },
    { name: '(Roblox) Adopt Me Legendary Pet Probability Calculator', slug: 'roblox-adopt-me-legendary-pet-probability-calculator', description: 'Calculate hatch odds.' },
    { name: '(Roblox) Trade Tax Calculator', slug: 'roblox-trade-tax-calculator', description: 'Calculate fees on cross-platform sales.' },
];

const faqs = [
    {
        question: "What is a Trust Trade?",
        answer: "A Trust Trade is a scam where one player asks another to give them an item for free, promising to give it back (or give something better) afterwards to 'prove trust'. 99.9% of the time, they will simply leave the game with your item.",
    },
    {
        question: "Is 'Fail Trading' real?",
        answer: "No. Scammers claim that if you put in a pet and food, and accept, the trade will 'fail' and duplicate the item. This is a lie. The trade will succeed, and they will take your pet. Do not test it.",
    },
    {
        question: "Can I get banned for Cross-Trading?",
        answer: "Yes. Cross-Trading (trading Adopt Me pets for Robux, Fortnite V-Bucks, or real money) is a direct violation of Roblox Terms of Service. If you are caught, your account will be banned and your inventory wiped.",
    },
    {
        question: "How do I spot a fake YouTuber?",
        answer: "Fake YouTubers have names like 'DreamCraft_Official123' or 'NotLeahAshe_Real'. They will ask you to trust trade for a video thumbnail. Real YouTubers never ask fans for free items for videos.",
    },
    {
        question: "What is the 'Add After' scam?",
        answer: "When a trade is too big (more than 18 items), scammers say 'Give me the good pets first, and I'll add the rest in the second trade'. They never do the second trade. Always use a middleman service from a trusted site if absolutely necessary, but generally, avoid '9+' trades.",
    },
    {
        question: "Can Adopt Me Support get my pets back?",
        answer: "Adopt Me Support generally does NOT return pets lost to scams like Trust Trades, because you willingly clicked 'Accept'. They only restore pets if verified hacking/account theft occurred. You are responsible for your own trades.",
    },
    {
        question: "Is the 'Pick a Door' game safe?",
        answer: "Usually no. Scammers build a house with 'Door 1' and 'Door 2'. You pay a pet to enter. One door has a prize, one has nothing. Often, both doors have nothing, or they kick you after you pay.",
    },
];

const steps = [
    'Identify the exact "Type" of trade being suggested (e.g., Trust Trade).',
    'Select who the trading partner is (Stranger vs Friend).',
    'Input what they are promising you (Robux, Codes, etc.).',
    'Get a Safety Verdict. If it says RED, block the user.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-adopt-me-trust-trade-safety-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Adopt Me Trust Trade Safety Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Adopt Me Trust Trade Safety Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Analyze potential trade scams in Adopt Me. Detect Trust Trades, Fail Trades, and Fake YouTubers.',
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

export default function RobloxAdoptMeTrustTrade() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tradeType: 'trust',
            partner: 'stranger',
            location: 'in_game',
            promise: 'better_pet',
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateSafety(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <Script id="adopt-me-trust-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-red-600 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        Adopt Me Trust Trade Analyzer
                    </CardTitle>
                    <CardDescription>
                        Is it a scam? Check the safety rating before you accept.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Trade Context</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    <FormField
                                        control={form.control}
                                        name="tradeType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>They are asking for a...</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="trust">Trust Trade (Give item first)</SelectItem>
                                                        <SelectItem value="fail_trade">Fail Trade</SelectItem>
                                                        <SelectItem value="cross_trade">Cross Trade (for Robux/Money)</SelectItem>
                                                        <SelectItem value="add_after">"I'll Add After" Trade</SelectItem>
                                                        <SelectItem value="giveaway">"Won a Giveaway" (need to claim)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="partner"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Who is the trader?</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="stranger">Stranger (Server)</SelectItem>
                                                        <SelectItem value="online_friend">Online Friend (Never met IRL)</SelectItem>
                                                        <SelectItem value="youtuber">Famous YouTuber / Admin</SelectItem>
                                                        <SelectItem value="irl_friend">Real Life Friend / Family</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="promise"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>What is promised?</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="better_pet">Better Pet / Dream Pet</SelectItem>
                                                        <SelectItem value="robux">Robux / Gift Card</SelectItem>
                                                        <SelectItem value="code">Cheat Code / Dupe Glitch</SelectItem>
                                                        <SelectItem value="nothing">Nothing / Fair Trade</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold text-white">
                                        CHECK SAFETY
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
                                <div className={`absolute inset-0 bg-gradient-to-r ${result.riskLevel > 50 ? 'from-red-900/40 to-red-600/10' : 'from-green-900/40 to-green-600/10'} animate-pulse`}></div>
                                <CardHeader className="relative pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-400">Security Assessment</CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                                        <span className={`text-4xl font-black tracking-tight ${result.verdictColor}`}>
                                            {result.verdict}
                                        </span>
                                        <span className="text-xl text-slate-300">
                                            Risk Score: {result.riskLevel}%
                                        </span>
                                    </div>
                                    <p className="text-lg font-medium text-white mb-6">
                                        {result.explanation}
                                    </p>

                                    <div className="p-4 bg-white/10 rounded-lg border border-white/20">
                                        <h4 className="flex items-center gap-2 font-bold mb-2">
                                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                            Recommended Action:
                                        </h4>
                                        <p className="text-sm">{result.action}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={result.riskLevel > 50 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        {result.riskLevel > 50 ? <UserX className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                        Safety Tip
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Remember: If something sounds too good to be true (like a free Shadow Dragon for trust), it is 100% a scam. Legitimate players trade Fair for Fair.
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                            <div className="text-center space-y-4 max-w-sm">
                                <Lock className="w-16 h-16 mx-auto opacity-20" />
                                <h3 className="text-lg font-semibold">Scam Detector</h3>
                                <p>Input the details of the suspicious trade to see if you are being targeted.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        How to Verify
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
                <meta itemProp="name" content="The Ultimate Guide to Avoiding Scams in Adopt Me" />
                <meta itemProp="description" content="Learn how to spot Trust Trades, Fail Trades, and Fake YouTubers. Protect your Adopt Me inventory from scams." />
                <meta itemProp="keywords" content="Adopt Me Trust Trade Scam, Fail Trade Glitch, Avoid Scams Roblox, Cross Trading Risks" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Avoiding Scams in Adopt Me</h1>
                <p className="text-lg italic text-muted-foreground">Your pets are valuable. Scammers want them. Here is how to keep them safe.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The #1 Rule of Adopt Me Safety</h2>
                <p>The golden rule is simpler than you think: <strong>Never give an item for free expecting something back later.</strong></p>
                <p>90% of scams (Trust, Borrowing, Duplicating, Add After) rely on you giving an item first. If you refuse to do any trade that isn't done in a SINGLE trade window, you become immune to almost every scam in the game.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Anatomy of a "Trust Trade"</h2>
                <p>The "Trust Trade" is the oldest trick in the book. A scammer will say:</p>
                <blockquote className="border-l-4 border-primary pl-4 my-4 italic">
                    "Trust trade me your Unicorn to prove you aren't a scammer. I'll give it back and give you a free Shadow Dragon!"
                </blockquote>
                <p><strong>The Psychology:</strong> They appeal to your greed (Free Shadow Dragon) and your ego (Proving you are "good").</p>
                <p><strong>The Reality:</strong> As soon as you give them the Unicorn, they leave the server and block you. There is no Shadow Dragon. It was never real.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">The "Fail Trade" Myth</h2>
                <p>Scammers will tell you to put your best pet in, plus a food item, and accept. They claim the trade will "fail" because the food is glitched, and your pet will be duplicated.</p>
                <p><strong>Why it works:</strong> It sounds like a secret cheat code.</p>
                <p><strong>Why it's fake:</strong> Adopt Me developers patch glitches instantly. The trade UI works perfectly. You accept, they get your pet. End of story.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">The "Fake YouTuber" Setup</h2>
                <p>You see someone with a display name like "CookieSwirlC_Fan" or even "Official_Admin". They claim they are filming a video and need you to give them a pet for the thumbnail.</p>
                <p><strong>Checklist to spot fakes:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Star Creator Badge:</strong> Real YouTubers have a special Star icon next to their name in the leaderboard. If they don't have it, they are fake.</li>
                    <li><strong>Chat Color:</strong> Admins and Developers have special chat text colors.</li>
                    <li><strong>Behavior:</strong> Real influencers give items <em>away</em>. They never ask fans to give <em>them</em> items.</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground pt-8">Cross-Trading Dangers</h2>
                <p>Cross-trading is trading Adopt Me pets for Robux, Gift Cards, or items in other games (like Murder Mystery 2).</p>
                <p><strong>The Risk:</strong></p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>It allows you to get scammed with zero recourse (Roblox cannot track external deals).</li>
                    <li>It is a bannable offense. If the moderation bot detects chat logs discussing "Paypal" or "Robux" linked to a trade, you will be auto-banned.</li>
                </ol>

                <h2 className="text-2xl font-bold text-foreground pt-8">Summary</h2>
                <p>Use this calculator whenever a trade feels weird. If the Risk Score is high, trust your gut and walk away. A missed trade is better than a stolen inventory.</p>
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
