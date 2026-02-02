'use client';

import { useState } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { HelpCircle, Percent, Egg, XCircle, Info, Calculator, Sparkles, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    petRarity: z.enum(['mythical', 'secret', 'huge', 'titanic']),
    baseOdds: z.string().min(1, "Enter base odds (e.g. 1 in 10000)"), // "10000" for 1 in 10k
    hatchesPerMinute: z.number().min(1).default(80), // Triple Hatch is ~80/min
    hoursFarming: z.number().min(0.5).default(8),
    gamepasses: z.object({
        lucky: z.boolean().default(false),
        superLucky: z.boolean().default(false),
        ultraLucky: z.boolean().default(false), // Magic Eggs / Shiny Hunter / etc
    }),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalHatches: string;
    effectiveOdds: string;
    probabilityOfSuccess: string;
    expectedPets: string;
    timeToGuarantee: string;
};

const calculateHatchProb = (values: FormValues): ResultPayload => {
    // Parse Odds (Denominator)
    const baseDenom = parseFloat(values.baseOdds.replace(/,/g, ''));

    // Calculate Luck Multiplier
    let luckMult = 1.0;
    // PSX Luck is weird. Usually "Lucky" is small, "Super Lucky" is big.
    // Approximations based on community data:
    if (values.gamepasses.lucky) luckMult += 0.5; // +50%
    if (values.gamepasses.superLucky) luckMult += 1.0; // +100%
    if (values.gamepasses.ultraLucky) luckMult += 2.0; // +200% (Highball)

    // For Huge Pets, luck gamepasses OFTEN DO NOT WORK (or work very little).
    if (values.petRarity === 'huge' || values.petRarity === 'titanic') {
        luckMult = 1.0; // Assume 0 effect unless specifically server luck
        // But for "Mythical", luck works.
    }

    const effectiveDenom = baseDenom / luckMult;
    const probabilityPerHatch = 1 / effectiveDenom;

    // Total Attempts
    const totalHatches = Math.floor(values.hatchesPerMinute * 60 * values.hoursFarming);

    // Probability of AT LEAST ONE success = 1 - (1 - p)^n
    const pSuccess = 1 - Math.pow((1 - probabilityPerHatch), totalHatches);

    // Expected Value = n * p
    const expected = totalHatches * probabilityPerHatch;

    // Time to 50% probability (Coin Flip)
    // 0.5 = 1 - (1 - p)^n  =>  0.5 = (1 - p)^n  => ln(0.5) = n * ln(1-p) => n = ln(0.5) / ln(1-p)
    const hatchesForConfidence = Math.log(0.5) / Math.log(1 - probabilityPerHatch);
    const minutesForConfidence = hatchesForConfidence / values.hatchesPerMinute;
    const hoursForConfidence = minutesForConfidence / 60;

    return {
        totalHatches: totalHatches.toLocaleString(),
        effectiveOdds: `1 in ${Math.round(effectiveDenom).toLocaleString()}`,
        probabilityOfSuccess: (pSuccess * 100).toFixed(4) + "%",
        expectedPets: expected.toFixed(2),
        timeToGuarantee: hoursForConfidence.toFixed(1) + " Hours (for 50% chance)",
    };
};

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator 99 Pet Value Calculator', slug: 'roblox-pet-simulator-99-pet-value-calculator', description: 'Did you hatch it? Check value.' },
    { name: '(Roblox) Adopt Me Legendary Pet Probability Calculator', slug: 'roblox-adopt-me-legendary-pet-probability-calculator', description: 'Compare odds with Adopt Me.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Compare Luck Gamepass cost.' },
    { name: '(Roblox) Pet Simulator X Mastery Calculator', slug: 'roblox-pet-simulator-x-mastery-calculator', description: 'Level up Egg Mastery.' },
    { name: '(Roblox) Egg Hatch Odds Simulator', slug: 'roblox-egg-hatch-odds-simulator', description: 'Generic simulator.' },
];

const faqs = [
    {
        question: "Does 'Ultra Lucky' work on Huge Pets?",
        answer: "Generally, no. In Pet Simulator X, most Luck Gamepasses explicitly state they affect 'Base Egg Odds' (Rares, Epics, Legendaries, Mythicals). Huge Pets usually have a fixed server-side roll that is unaffected by your personal luck passes, unless an event specifically says '2x Huge Chance'.",
    },
    {
        question: "What is 'Pity System'?",
        answer: "Some eggs have a Pity System (e.g., hatch 5,000 eggs to guarantee a Huge). However, this is rare and usually only applies to specific Event Eggs or Exclusive Eggs (Robux eggs). Standard coins eggs do not have a hard pity for Huges.",
    },
    {
        question: "Is Triple Hatch worth it?",
        answer: "Yes. Triple Hatch (or Octuple Hatch) literally multiplies your speed by 3x or 8x. Since Huge Pets are a numbers game (quantity of hatches), hatching 8 eggs at once gives you 8x better chances per minute than hatching 1.",
    },
    {
        question: "How accurate are the '1 in X' odds?",
        answer: "The developers rarely publish exact numbers. The community estimates odds based on millions of hatches. A Base Huge is typically estimated at 1 in 10,000,000 or worse depending on the egg.",
    },
    {
        question: "What is 'Server Luck'?",
        answer: "Server Luck (often from Boosts) applies a multiplier to everyone in the server. This often DOES STACK with personal luck and event luck.",
    },
    {
        question: "What is the 'Shiny' chance?",
        answer: "Shiny chance is separate from rarity. It's roughly 1 in 500 to 1 in 1000 for any pet to spawn as Shiny. The 'Shiny Hunter' gamepass significantly improves this.",
    },
    {
        question: "Can I hatch a Titanic F2P?",
        answer: "Extremely unlikely. Titanics are almost exclusively from Exclusive Eggs (Robux) or Merchandise Codes. Very rarely, an event might offer a hatchable Titanic with odds like 1 in a Billion.",
    },
];

const steps = [
    'Select the Target Rarity (Mythical, Huge, etc.).',
    'Input the Estimated Base Odds (e.g. 1000000 for 1 in 1m).',
    'Select your active Luck Gamepasses.',
    'Enter how many hours you plan to AFK hatch.',
    'See your probability of success.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-pet-simulator-x-hatch-probability-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Pet Simulator X Hatch Probability Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Pet Simulator X Hatch Probability Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Calculate your odds of hatching a Huge Pet in Pet Simulator X. Factor in Luck passes and AFK time.',
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

export default function RobloxPSXHatchCalc() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            petRarity: 'huge',
            baseOdds: '1000000',
            hatchesPerMinute: 80,
            hoursFarming: 24,
            gamepasses: {
                lucky: false,
                superLucky: false,
                ultraLucky: false,
            },
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateHatchProb(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <Script id="psx-hatch-schema" type="application/ld+json" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

            <Card className="border-l-4 border-l-pink-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Egg className="h-6 w-6 text-pink-500" />
                        Pet Simulator X Hatch Probability
                    </CardTitle>
                    <CardDescription>
                        Will you hatch the Huge? Calculate your real odds.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Hatching Setup</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="petRarity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Rarity</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="mythical">Mythical / Secret</SelectItem>
                                                    <SelectItem value="huge">Huge Pet</SelectItem>
                                                    <SelectItem value="titanic">Titanic Pet</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="baseOdds"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Base Odds (Denominator)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. 1000000 for 1 in 1m" {...field} />
                                            </FormControl>
                                            <FormDescription>If odds are 1 in 5,000, type "5000".</FormDescription>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hoursFarming"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>AFK Hours</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="space-y-2">
                                    <FormLabel>Luck Buffs</FormLabel>
                                    <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
                                        <FormField
                                            control={form.control}
                                            name="gamepasses.superLucky"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Super Lucky / Server Luck</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="gamepasses.ultraLucky"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">Ultra Lucky / Huge Hunter</FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 font-bold text-white">
                                SIMULATE HATCHING
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result ? (
                <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                    <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/40 to-purple-600/10 animate-pulse"></div>
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Probability Report</CardTitle>
                        </CardHeader>
                        <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">Success Chance</h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-4xl font-black text-white">{result.probabilityOfSuccess}</p>
                                    </div>
                                    <p className="text-sm text-pink-300 mt-1">in {form.getValues().hoursFarming} hours (Total {result.totalHatches} eggs)</p>
                                </div>
                                <div className="p-3 bg-white/10 rounded-lg">
                                    <h4 className="flex items-center gap-2 font-bold mb-1 text-yellow-400">
                                        <Percent className="h-4 w-4" /> Effective Odds:
                                    </h4>
                                    <p className="text-sm font-semibold">{result.effectiveOdds}</p>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col justify-center">
                                <div className="p-4 border border-white/10 bg-white/5 rounded-xl text-center">
                                    <p className="text-slate-400 text-sm mb-1">Time to 50% Chance</p>
                                    <p className="text-xl font-bold text-pink-200">{result.timeToGuarantee}</p>
                                </div>
                                <div className="text-center text-xs text-slate-500">
                                    Expected Pets: {result.expectedPets}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                    <div className="text-center space-y-4 max-w-sm">
                        <Calculator className="w-16 h-16 mx-auto opacity-20" />
                        <h3 className="text-lg font-semibold">Luck Calculator</h3>
                        <p>Input your setup to see if you are lucky or wasting time.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-pink-500" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Base Odds:</strong> The raw chance to hatch the pet (e.g., 1 in 10,000,000). You can find this on the wiki.</p>
                        <p><strong>Hatches Per Minute:</strong> Triple Hatch opens 3 eggs every ~3 seconds. This equals 60-80 eggs per minute.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-pink-500" />
                            Formula Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Binomial Probability:</strong></p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">Chance = 1 - (1 - Odds)^Hatches</code>
                        <p>This formula accurately calculates probability over multiple attempts.</p>
                    </CardContent>
                </Card>
            </div>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="Pet Simulator X Hatching Guide: Odds, Mythicals, & Huges" />
                <meta itemProp="description" content="Calculate the real probability of hatching Huge Pets in Pet Simulator X. Understand the math behind AFK hatching and luck multipliers." />
                <meta itemProp="keywords" content="Pet Simulator X Hatch Chance, How to get Huge Pet calculator, PSX hatch odds, Luck Gamepass calculator" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Pet Simulator X Hatching Guide: Odds, Mythicals, & Huges</h1>
                <p className="text-lg italic text-muted-foreground">Is it luck, or is it just math? Here is the truth about hatching Huges.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The "Gambler's Fallacy" in PSX</h2>
                <p>Many players think: "I opened 9,999 eggs and didn't get a huge. The next one MUST be it!"</p>
                <p><strong>This is false.</strong> In <em>Pet Simulator X</em>, every single egg hatch is an independent event (unless there is a pity system, which is rare). If the odds are 1 in 1,000,000, your 1,000,000th egg still has exactly a 1 in 1,000,000 chance.</p>
                <p>This calculator uses the binomial probability formula to tell you your cummulative chance of seeing at least one success over a long AFK session.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Does Luck Work on Huge Pets?</h2>
                <p><strong>Generally No.</strong> The developers of PSX (BIG Games) have historically separated "Luck" stats into two buckets:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Egg Luck:</strong> Affected by "Lucky" and "Super Lucky" passes. Increases chance of Legendaries, Mythicals, and Secrets.</li>
                    <li><strong>Huge Luck:</strong> Usually Fixed. Only affected by specific "Huge Hunter" gamepasses or server-wide Huge Luck events. Buying normal luck does NOT help you hatch a Huge Hell Rock.</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground pt-8">The Power of Volume (Speed)</h2>
                <p>Since you cannot easily change the Odds (p), the only variable you control is Volume (n). </p>
                <p><strong>Octuple Hatch:</strong> Hatching 8 eggs at once serves as an 8x multiplier to your effective Huge rate. It is arguably the most powerful gamepass for Huge Hunters, far better than Lucky.</p>
                <p><strong>Auto-Hatch:</strong> Reducing the delay between hatches by even 0.5 seconds adds up to thousands of extra attempts over a 24-hour AFK session.</p>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Hatching a Huge Pet is a marathon, not a sprint. By understanding that odds are independent and focusing on maximizing your hatch speed (Volume), you significantly increase your chances of success over time.</p>
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
