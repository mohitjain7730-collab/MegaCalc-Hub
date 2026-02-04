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

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="Pet Simulator X Conversion Guide: Gold, Rainbow, & Dark Matter" />
                <meta itemProp="description" content="Should you convert your pets? Learn the value multipliers for Golden, Rainbow, and Dark Matter pets in PSX." />
                <meta itemProp="keywords" content="Pet Simulator X Golden Machine, Rainbow Pet Value, Dark Matter Multiplier, PSX Upgrade Guide" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Pet Simulator X Conversion Guide: Gold, Rainbow, & Dark Matter</h1>
                <p className="text-lg italic text-muted-foreground">Upgrading your pets is the core loop of Pet Simulator X. But when is it worth it?</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Conversion Chain</h2>
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-yellow-500/10 border-yellow-500/20">
                        <h3 className="font-bold text-yellow-600">Golden Machine (Spawn World)</h3>
                        <p>Requires up to <strong>7 Normal Pets</strong> for 100% chance. Result is a Golden Pet with <strong>~3x stats</strong>.</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-pink-500/10 border-pink-500/20">
                        <h3 className="font-bold text-pink-600">Rainbow Machine (Mine Area)</h3>
                        <p>Requires up to <strong>7 Golden Pets</strong> for 100% chance. Result is a Rainbow Pet with <strong>~13x stats</strong> (vs Normal).</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-purple-500/10 border-purple-500/20">
                        <h3 className="font-bold text-purple-600">Dark Matter Machine (Dark Tech)</h3>
                        <p>Requires <strong>1 Rainbow Pet</strong> (and time). Result is a Dark Matter Pet with <strong>~45x stats</strong>.</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-foreground pt-8">The "Time vs. Robux" Tradeoff</h2>
                <p>The Dark Matter machine takes time (up to 5 days). You can skip this time using Robux. </p>
                <p><strong>Pro Tip:</strong> Patience creates value. Dark Matter pets trade for much higher prices because buyers don't want to wait 5 days. If you are F2P, always have your Dark Matter machine full. It is a passive income generator.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Shiny Pets</h2>
                <p>Refusing to sell Shiny pets as "Normals" is key. A Shiny Rainbow pet is often stronger than a regular Dark Matter pet. Always check the damage numbers before you fuse things away!</p>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Always upgrade your pets. A team of Rainbow pets is infinitely better than a team of Normal pets. Use the Dark Matter machine constantly to generate high-value pets to sell in the Trading Plaza.</p>
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
