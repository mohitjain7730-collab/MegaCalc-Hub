'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gem, ArrowRight, Zap, Trophy, Info, Sparkles, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    petName: z.string().min(1, "Enter pet name"),
    baseValue: z.number().min(0).default(1000000000), // 1B
    targetType: z.enum(['golden', 'rainbow', 'dark_matter']),
    isShiny: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    targetValue: string;
    multiplierApplied: string;
    description: string;
    shinyBonus: string;
};

// Value Scaling Logic (Approximations based on Trading Economy)
// Golden = ~3x Normal
// Rainbow = ~13x Normal
// Dark Matter = ~40-50x Normal (Because of time gate)
const SCALING = {
    'golden': { val: 3, label: '3x (Golden)' },
    'rainbow': { val: 13, label: '13x (Rainbow)' },
    'dark_matter': { val: 45, label: '45x (Dark Matter)' },
};

const calculateGoldenVal = (values: FormValues): ResultPayload => {
    const scale = SCALING[values.targetType as keyof typeof SCALING];
    let multiplier = scale.val;

    let shinyText = "No";
    if (values.isShiny) {
        multiplier *= 2.5; // Shiny versions are often 2-3x more valuable than non-shiny equivalents
        shinyText = "Yes (2.5x Bonus)";
    }

    const calculatedVal = values.baseValue * multiplier;

    return {
        targetValue: formatNumber(calculatedVal),
        multiplierApplied: multiplier + "x Total Multiplier",
        description: `Upgrading your Normal ${values.petName} to ${values.targetType.replace('_', ' ').toUpperCase()} increases its value significantly.`,
        shinyBonus: shinyText,
    };
};

function formatNumber(num: number): string {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + " T (Trillion)";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + " B (Billion)";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + " M (Million)";
    return num.toLocaleString();
}

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator X Trading Value Calculator', slug: 'roblox-pet-simulator-x-trading-value-calculator', description: 'Check if you got a good deal.' },
    { name: '(Roblox) Pet Simulator X Mastery Calculator', slug: 'roblox-pet-simulator-x-mastery-calculator', description: 'Faster Converting with Mastery.' },
    { name: '(Roblox) Pet Simulator X Pet Power Calculator', slug: 'roblox-pet-simulator-x-pet-power-calculator', description: 'How much stronger is Golden?' },
    { name: '(Roblox) Adopt Me Neon Pet Value Calculator', slug: 'roblox-adopt-me-neon-pet-value-calculator', description: 'Similar conversion logic for Adopt Me.' },
    { name: '(Roblox) Trade Tax Calculator', slug: 'roblox-trade-tax-calculator', description: 'Calculate fees.' },
];

const faqs = [
    {
        question: "Is it worth converting to Golden?",
        answer: "Yes. Golden pets deal 3x damage and are used to fuse into Rainbow pets. Even if you don't equip them, converting Normal -> Golden -> Rainbow is the fastest way to complete your Index.",
    },
    {
        question: "How do I make a Rainbow Pet?",
        answer: "You need 5 to 7 Golden Pets. Go to the Rainbow Machine in the Mine. Fusing 7 Golden Pets gives a 100% chance of getting the Rainbow version.",
    },
    {
        question: "How do I make a Dark Matter Pet?",
        answer: "Dark Matter pets are created in the Dark Matter Machine in the Dark Tech World. You input Rainbow Pets and wait (up to 5 days). You can shorten the time by inputting more Rainbow Pets or spending Robux.",
    },
    {
        question: "Why are Shiny pets worth so much?",
        answer: "Shiny pets are visual variants that deal +40% to +100% more damage. They are extremely rare. A Shiny Dark Matter pet is the strongest version of that pet possible, often fetching massive overpays.",
    },
    {
        question: "Does converting remove enchants?",
        answer: "Yes. When you put pets into the Golden or Rainbow or Dark Matter machine, the old pets are destroyed and a NEW pet is created. The new pet will have random enchants (or no enchants).",
    },
    {
        question: "Can I fail a conversion?",
        answer: "Yes, if you use fewer pets. For example, using only 1 Golden Pet to try to make a Rainbow Pet gives you an 18% chance. If it fails, you lose the pet.",
    },
    {
        question: "What is 'Hardcore' Golden?",
        answer: "It is the same process, but using Hardcore Pets. Hardcore Golden pets are trillions of times stronger than normal Golden pets.",
    },
];

const steps = [
    'Enter the Base Value (Gem Value) of your Normal Pet.',
    'Select the Target Conversion (Golden, Rainbow, Dark Matter).',
    'Check "Is Shiny" if you are lucky enough to have one.',
    'Calculate the new estimated value.',
];



export default function RobloxPSXGoldenCalc() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            petName: 'Dragon',
            baseValue: 1000000000,
            targetType: 'golden',
            isShiny: false,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculateGoldenVal(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">


            <Card className="border-l-4 border-l-yellow-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Gem className="h-6 w-6 text-yellow-500" />
                        PSX Golden & Rainbow Value
                    </CardTitle>
                    <CardDescription>
                        Is it worth converting? Calculate the profit margin.
                    </CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Conversion Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="petName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pet Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Dog" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="baseValue"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Normal Value (Gems)</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="targetType"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Target Upgrade</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="golden">Golden (3x Stat)</SelectItem>
                                                    <SelectItem value="rainbow">Rainbow (13x Stat)</SelectItem>
                                                    <SelectItem value="dark_matter">Dark Matter (45x Stat)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="isShiny"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 border rounded-lg bg-muted/50 mt-8">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Is Shiny?</FormLabel>
                                                <FormMessage />
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700 font-bold text-white">
                                CALCULATE UPGRADE VALUE
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {result ? (
                <div className="animate-in slide-in-from-top-4 duration-500 fade-in">
                    <Card className="bg-slate-950 text-white border-slate-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/40 to-orange-600/10 animate-pulse"></div>
                        <CardHeader className="relative pb-2">
                            <CardTitle className="text-sm font-medium text-slate-400">Upgrade Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-slate-400 text-xs uppercase tracking-wider">New Estimated Value</h4>
                                    <p className="text-3xl font-black text-white">{result.targetValue}</p>
                                    <p className="text-sm text-yellow-500 mt-1">{result.multiplierApplied}</p>
                                </div>
                            </div>

                            <div className="space-y-4 flex flex-col justify-center">
                                <div className="p-4 border border-white/10 bg-white/5 rounded-xl text-center">
                                    <h4 className="flex justify-center items-center gap-2 font-bold mb-1 text-white">
                                        <Sparkles className="h-4 w-4 text-purple-400" /> Shiny Bonus
                                    </h4>
                                    <p className="text-xl font-bold text-slate-200">{result.shinyBonus}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                    <div className="text-center space-y-4 max-w-sm">
                        <Zap className="w-16 h-16 mx-auto opacity-20" />
                        <h3 className="text-lg font-semibold">Value Converter</h3>
                        <p>See how much value converting to Dark Matter adds.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-yellow-500" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Base Value:</strong> The value of the pet right now in its Normal state.</p>
                        <p><strong>Target Upgrade:</strong> The form you want to turn it into. Rainbow is stronger than Golden.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-yellow-500" />
                            Formula Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Multiplier Logic:</strong></p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">Value = Base &times; Status_Mult &times; Shiny_Mult</code>
                        <p>We use standard trading multipliers (e.g. Dark Matter = ~45x Base).</p>
                    </CardContent>
                </Card>
            </div>

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

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="Pet Simulator X Upgrade Guide: Golden, Rainbow, and Dark Matter Value" />
                <meta itemProp="description" content="Master the art of pet upgrading in Pet Simulator X. Comprehensive guide on Golden, Rainbow, and Dark Matter multipliers, Shiny bonuses, and trading strategies to maximize your gem profits." />
                <meta itemProp="keywords" content="Pet Simulator X Golden Machine, Rainbow Pet Value, Dark Matter Multiplier, PSX Upgrade Guide, Shiny Pet Value, Roblox PSX Trading" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Mastering Pet Upgrades in Pet Simulator X</h1>
                <p className="text-lg italic text-muted-foreground">Stop guessing your pet's value. Use the Golden, Rainbow, and Dark Matter multipliers to predict exactly how strong (and valuable) your inventory will become.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">How Pet Upgrades Work</h2>
                <p>
                    In <strong>Roblox Pet Simulator X</strong>, upgrading pets is the primary way to increase your team's total damage output. While hatching rare pets is the first step, the <strong>Upgrade Machines</strong> (Golden, Rainbow, Dark Matter) are where the real power is forged.
                </p>
                <p>
                    This calculator uses the game's official multiplier logic to estimate the final value of your pets. Understanding these multipliers is critical for both <strong>Hardcore Mode progression</strong> and <strong>high-tier trading</strong>.
                </p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Deep Dive: The Multipliers</h2>

                <h3 className="text-xl font-semibold text-foreground mt-4">1. Golden Machine (3x Power)</h3>
                <p>
                    Located in the Shop area of Spawn World. Transforming a pet to Golden grants a <strong>300% (3x) damage boost</strong>.
                    <br />
                    <em>Strategy:</em> Golden pets are the most cost-effective upgrade for early game players. However, serious traders perform this step mainly as a bridge to Rainbow.
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-4">2. Rainbow Machine (13x Power)</h3>
                <p>
                    Located in the Mine area of Spawn World. Rainbow pets are approximately <strong>13.5x stronger</strong> than their Normal counterparts.
                    <br />
                    <em>Strategy:</em> A Rainbow pet is often the "currency" of the trading plaza. It represents a significant investment of materials (typically 7 Golden pets, or 49 Normal pets).
                </p>

                <h3 className="text-xl font-semibold text-foreground mt-4">3. Dark Matter Machine (45x Power)</h3>
                <p>
                    Located in the Dark Tech World. Dark Matter pets are the pinnacle of non-Huge pets, boasting a massive <strong>45x damage multiplier</strong> compared to the Normal version.
                    <br />
                    <em>The Time Value:</em> Unlike others, this machine takes <strong>5 days</strong> to process. This "time cost" creates a premium in the trading market. A "ready-to-equip" Dark Matter pet is worth significantly more than the Rainbow ingredients used to make it.
                </p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Advanced Mechanics: Shiny & Hardcore</h2>

                <h3 className="text-lg font-bold text-foreground mt-2">The Shiny Multiplier</h3>
                <p>
                    Any pet can spawn as "Shiny". This is a separate multiplier that stacks with the form.
                    A <strong>Shiny pet deals 2.5x more damage</strong> than its non-shiny version.
                    <br />
                    This means a <strong>Shiny Dark Matter</strong> pet is effectively dealing <strong>112.5x damage</strong> (45 * 2.5) compared to a base Normal pet. This makes Shiny DMs the strongest stat pets in the entire game.
                </p>

                <h3 className="text-lg font-bold text-foreground mt-2">Hardcore vs. Normal</h3>
                <p>
                    Hardcore Mode pets use the exact same multiplier logic (3x &rarr; 13x &rarr; 45x).
                    The only difference is their base power. A Hardcore pet is inherently trillions of times stronger than a Normal pet. When using this calculator for Hardcore pets, simply input the displayed power—the upgrade math remains identical.
                </p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Making Profit with this Calculator</h2>
                <p>
                    Smart players use this tool to calculate <strong>Arbitrage Opportunities</strong>.
                    <br />
                    <em>Example:</em> If you see someone selling a Rainbow Pet for 1 Billion Gems, but the Dark Matter version sells for 5 Billion, you can buy the Rainbow, incubate it for free, and triple your investment.
                    Always check the "Calculated Value" output above to see if an upgrade is worth the cost of the ingredients.
                </p>
            </section>

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

            {/* Section 1: Top Popular Pets */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">1. Popular Pet Value Database</CardTitle>
                    <CardDescription>Estimated value upgrades for the most common pets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 rounded-l-lg">Pet Name</th>
                                    <th className="px-4 py-3">Normal (Base)</th>
                                    <th className="px-4 py-3 text-yellow-600">Golden (3x)</th>
                                    <th className="px-4 py-3 text-pink-600">Rainbow (13x)</th>
                                    <th className="px-4 py-3 text-purple-600 rounded-r-lg">Dark Matter (45x)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {[
                                    { name: 'Dog', val: 1 },
                                    { name: 'Cat', val: 2 },
                                    { name: 'Dragon', val: 15 },
                                    { name: 'Immortal', val: 1000 },
                                    { name: 'Galaxy Dragon', val: 500000 },
                                    { name: 'Tech Cat', val: 2000000 },
                                    { name: 'Grim Reaper', val: 5000000 },
                                    { name: 'Pixel Wolf', val: 10000000 },
                                    { name: 'Hell Rock', val: 25000000 },
                                    { name: 'Huge Cat', val: 100000000000 },
                                ].map((pet) => (
                                    <tr key={pet.name} className="hover:bg-muted/50 transition-colors">
                                        <td className="px-4 py-3 font-medium">{pet.name}</td>
                                        <td className="px-4 py-3">{formatNumber(pet.val)}</td>
                                        <td className="px-4 py-3 text-yellow-600 font-medium">{formatNumber(pet.val * 3)}</td>
                                        <td className="px-4 py-3 text-pink-600 font-medium">{formatNumber(pet.val * 13)}</td>
                                        <td className="px-4 py-3 text-purple-600 font-bold">{formatNumber(pet.val * 45)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Common Value Ranges */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">2. Common Value Ranges</CardTitle>
                    <CardDescription>Quick reference for standard base value brackets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[100, 500, 1000, 5000, 10000, 1000000].map((val) => (
                            <div key={val} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                                <h4 className="font-bold text-center border-b pb-2 mb-2">Base: {formatNumber(val)} Gems</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Golden:</span>
                                        <span className="font-medium text-yellow-600">{formatNumber(val * 3)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Rainbow:</span>
                                        <span className="font-medium text-pink-600">{formatNumber(val * 13)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Dark Matter:</span>
                                        <span className="font-bold text-purple-600">{formatNumber(val * 45)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Section 3: Special Scenarios */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">3. Special Scenarios: Shiny & Hardcore</CardTitle>
                    <CardDescription>When multipliers go wild.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-5 rounded-xl border border-indigo-500/20">
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-indigo-400" /> Shiny Multipliers
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">Shiny pets get a flat ~2.5x bonus on top of their current form.</p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between p-2 bg-background/50 rounded">
                                    <span>Shiny Golden</span>
                                    <span className="font-bold">7.5x Base</span>
                                </li>
                                <li className="flex justify-between p-2 bg-background/50 rounded">
                                    <span>Shiny Rainbow</span>
                                    <span className="font-bold">32.5x Base</span>
                                </li>
                                <li className="flex justify-between p-2 bg-background/50 rounded border border-indigo-500/30">
                                    <span>Shiny Dark Matter</span>
                                    <span className="font-black text-indigo-400">112.5x Base</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 p-5 rounded-xl border border-red-500/20">
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <Zap className="h-5 w-5 text-red-500" /> Hardcore Mode
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">Hardcore pets are separate entities. A Hardcore Pet is roughly <strong>10 trillion times</strong> stronger than a Normal Mode pet.</p>
                            <div className="p-3 bg-red-950/20 rounded border border-red-500/20 text-sm">
                                <p className="font-medium text-red-200">The 3x / 13x / 45x Rule still applies!</p>
                                <p className="mt-2 text-muted-foreground">If a HC Dog does 10T damage, a HC Golden Dog does 30T damage. The scaling ratios are identical to Normal Mode.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 4: Comparison Tables */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">4. ROI & Cost-Benefit Analysis</CardTitle>
                    <CardDescription>Make smarter decisions with your pets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        <div>
                            <h4 className="font-semibold mb-4">Golden vs. Rainbow ROI</h4>
                            <div className="overflow-hidden rounded-lg border">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="p-3 text-left">Metric</th>
                                            <th className="p-3 text-left">Golden Strategy</th>
                                            <th className="p-3 text-left">Rainbow Strategy</th>
                                            <th className="p-3 text-left">Winner</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-muted-foreground">
                                        <tr>
                                            <td className="p-3 font-medium text-foreground">Input Cost</td>
                                            <td className="p-3">7 Normal Pers</td>
                                            <td className="p-3">49 Normal Pets</td>
                                            <td className="p-3 text-green-500">Golden (Cheaper)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-foreground">Power Multiplier</td>
                                            <td className="p-3">3x</td>
                                            <td className="p-3">13x</td>
                                            <td className="p-3 text-green-500">Rainbow (Stronger)</td>
                                        </tr>
                                        <tr>
                                            <td className="p-3 font-medium text-foreground">Time Efficiency</td>
                                            <td className="p-3">Instant</td>
                                            <td className="p-3">Instant + Travel</td>
                                            <td className="p-3 text-yellow-500">Tie</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h4 className="font-semibold">When to use Dark Matter Machine?</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                    <li>When you have duplicates of a high-tier Legendary/Mythical.</li>
                                    <li>When you are going offline for a few days.</li>
                                    <li>When you want to max out value for trading.</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-red-400">When to AVOID upgrades?</h4>
                                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                    <li>Don't upgrade if you only have 1 of a rare pet (Risk of failure).</li>
                                    <li>Don't specificially upgrade "Shiny" pets if you don't know the fusion rules (You might lose the shiny).</li>
                                    <li>Don't upgrade low-tier pets (Cat, Dog) past Golden unless for Index.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* Section 5: Worked Examples */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">5. Worked Examples</CardTitle>
                    <CardDescription>See the calculator in action with these common scenarios.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                            <h4 className="font-semibold text-lg mb-2">Scenario A: The Golden Convert</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li><strong>Input Pet:</strong> Dog</li>
                                <li><strong>Base Value:</strong> 100 Gems</li>
                                <li><strong>Target:</strong> <span className="text-yellow-600 font-bold">Golden</span></li>
                                <li><strong>Shiny?</strong> No</li>
                            </ul>
                            <div className="mt-3 pt-3 border-t">
                                <p className="font-medium text-foreground">Result: 300 Gems</p>
                                <p className="text-xs text-muted-foreground">Formula: 100 x 3 = 300</p>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/30 rounded-lg border border-border">
                            <h4 className="font-semibold text-lg mb-2">Scenario B: The Shiny Dark Matter</h4>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li><strong>Input Pet:</strong> Galaxy Dragon</li>
                                <li><strong>Base Value:</strong> 1 Billion</li>
                                <li><strong>Target:</strong> <span className="text-purple-600 font-bold">Dark Matter</span></li>
                                <li><strong>Shiny?</strong> <span className="text-indigo-500 font-bold">Yes</span></li>
                            </ul>
                            <div className="mt-3 pt-3 border-t">
                                <p className="font-medium text-foreground">Result: 112.5 Billion Gems</p>
                                <p className="text-xs text-muted-foreground">Formula: 1B x 45 (DM) x 2.5 (Shiny) = 112.5B</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function FormDescription({ className, children }: { className?: string; children: React.ReactNode }) {
    return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>;
}
