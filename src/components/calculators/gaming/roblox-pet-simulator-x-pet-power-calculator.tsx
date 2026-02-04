'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Skull, Shield, Sword, Crown, Info, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
    bestPetPower: z.number().min(1).default(100), // Power of strongest pet (e.g. 100q)
    petType: z.enum(['normal', 'golden', 'rainbow', 'dark_matter', 'shiny']),
    hugeCount: z.number().min(0).max(50).default(0), // Huge pets match best pet
    titanicCount: z.number().min(0).max(50).default(0), // Titanic pets match 2x(?) or huge buff
    enchantBonus: z.number().min(0).max(500).default(0), // Total % bonus from Strength V etc
});

type FormValues = z.infer<typeof formSchema>;

type ResultPayload = {
    totalTeamPower: string;
    effectiveDamage: string;
    oneShotThreshold: string;
    rank: string;
    rankColor: string;
};

// Power Multipliers Scaling
// Normal = 1
// Golden = ~3x Normal
// Rainbow = ~13x Normal? (Varies by pet, using approximates)
// Dark Matter = ~35x Normal?
// Shiny = +40%? on top.
// Huge = Always scales to Best Pet.
const MULTIPLIERS = {
    'normal': 1,
    'golden': 3,
    'rainbow': 9,
    'dark_matter': 27, // Approximation of DM scaling
    'shiny': 1.4, // Multiplier on top of others
};

const calculatePower = (values: FormValues): ResultPayload => {
    // We assume 'bestPetPower' is the displayed power of the user's STRONGEST pet in their inventory.
    // This is the anchor for Huges and Titanics.

    // Huge Calculation: Huges are usually 100% or slightly more (with levels) of Best Pet.
    // Titanics: Titanics are usually significantly stronger (e.g. 2x or more).

    // Let's calculate a "Team Score"
    // Assuming full team of Huges/Titanics for calculation context or just adds to the total.

    let basePower = values.bestPetPower;

    // Calculate total team output based on the inputs
    // (This calculator assumes the user fills the rest of their slots with similar pets or Huges)

    let totalPower = basePower;

    // Add Huges (Assume they deal 150% of best pet due to enchant/level scaling on avg)
    totalPower += (values.hugeCount * (basePower * 1.5));

    // Add Titanics (Assume 300% of best pet)
    totalPower += (values.titanicCount * (basePower * 3.0));

    // Apply Enchant Bonuses (Strength V = +100% etc)
    const enchantMult = 1 + (values.enchantBonus / 100);
    totalPower = totalPower * enchantMult;

    // "Effective Damage" usually involves a Cartoony factor in Roblox games, 
    // but we will display raw notation.

    const formattedPower = formatNumber(totalPower);

    let rank = "Novice Hatchler";
    let color = "text-slate-500";

    if (totalPower > 1000000000000000000) { // Quintillions
        rank = "Server Dominator (Quadrillions)";
        color = "text-red-500";
    } else if (totalPower > 1000000000000000) { // Quadrillions
        rank = "Pro Grinder (Trillions)";
        color = "text-purple-400";
    } else if (totalPower > 1000000000000) { // Trillions
        rank = "Tech World Veteran";
        color = "text-blue-400";
    } else {
        rank = "New Player";
        color = "text-green-400";
    }

    return {
        totalTeamPower: formattedPower,
        effectiveDamage: formatNumber(totalPower * 4) + " DPS (Est.)", // ticks 4 times a sec?
        oneShotThreshold: "Chests < " + formatNumber(totalPower / 2) + " HP",
        rank,
        rankColor: color,
    };
};

function formatNumber(num: number): string {
    if (num >= 1e21) return (num / 1e21).toFixed(2) + " Sx (Sextillion)";
    if (num >= 1e18) return (num / 1e18).toFixed(2) + " Qi (Quintillion)";
    if (num >= 1e15) return (num / 1e15).toFixed(2) + " Qa (Quadrillion)";
    if (num >= 1e12) return (num / 1e12).toFixed(2) + " T (Trillion)";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + " B (Billion)";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + " M (Million)";
    return num.toLocaleString();
}

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator X Diamond Calculator', slug: 'roblox-pet-simulator-x-diamond-calculator', description: 'Once you have damage, calculate diamonds.' },
    { name: '(Roblox) Adopt Me Legendary Pet Probability Calculator', slug: 'roblox-adopt-me-legendary-pet-probability-calculator', description: 'Check odds in another popular game.' },
    { name: '(Roblox) Inventory Value Estimator', slug: 'roblox-inventory-value-estimator', description: 'Track value of your Huges.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Is Triple Hatch worth it?' },
    { name: '(Roblox) Trade Tax Calculator', slug: 'roblox-trade-tax-calculator', description: 'Calculate fees.' },
];

const faqs = [
    {
        question: "How does 'Best Friend' enchant work?",
        answer: "The 'Best Friend' enchant/trait (found on Huge/Titanic pets) means the pet's power is always greater than your STRONGEST equipped pet. This means if you hatch a new strongest pet, ALL your Huge pets instantly become stronger too.",
    },
    {
        question: "Is Strength V or Super Teamwork better?",
        answer: "Super Teamwork is generally considered the best enchant in the game (God Tier). It adds +30% damage to ALL pets on your team. Strength V only adds +100% to THAT specific pet. A full team of Super Teamwork buffers creates massive multiplicative damage.",
    },
    {
        question: "How strong is a Dark Matter pet?",
        answer: "Dark Matter pets are roughly 3x stronger than their Rainbow versions. Rainbows are roughly 3x stronger than Gold versions. So Dark Matter is the pinnacle of non-Huge pets.",
    },
    {
        question: "What does 'Shiny' do?",
        answer: "Shiny is a rare modifier that can appear on any pet. Shiny pets deal roughly 40% (1.4x) to 100% (2x) more damage than their non-shiny counterparts depending on the update. A Shiny Dark Matter pet is often stronger than many low-level Huges.",
    },
    {
        question: "What is a Titanic Pet compared to a Huge?",
        answer: "A Titanic Pet is massive (rideable) and usually has the 'Titanic' trait, scaling significantly higher (often 2x or 3x) off your best pet than a standard Huge. They are the strongest entities in PSX.",
    },
    {
        question: "Does 'Cartoon Coins' enchant increase damage?",
        answer: "No. Cartoon Coins enchant only increases the currency you earn. It does not help you break the chest faster.",
    },
    {
        question: "Why does my damage fluctuate?",
        answer: "Damage numbers have a random variance (RNG) in every hit (Crit hits dealing more). Also, server lag can make effective DPS lower than theoretical power.",
    },
];

const steps = [
    'Input the power of your #1 Best Pet (the one used as anchor).',
    'Enter how many Huge Pets you have equipped.',
    'Enter how many Titanic Pets you have.',
    'Add any Enchant Bonuses (e.g. 500% from charms/enchants).',
    'Calculate your Total Team DPS.',
];



export default function RobloxPetSimPowerCalc() {
    const [result, setResult] = useState<ResultPayload | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            bestPetPower: 1000000,
            petType: 'dark_matter',
            hugeCount: 0,
            titanicCount: 0,
            enchantBonus: 0,
        },
    });

    const onSubmit = (values: FormValues) => {
        setResult(calculatePower(values));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">


            <Card className="border-l-4 border-l-red-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Sword className="h-6 w-6 text-red-500" />
                        Pet Simulator X Power Calculator
                    </CardTitle>
                    <CardDescription>
                        Calculate Team DPS. Compare Huges vs Dark Matter stats.
                    </CardDescription>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Team Composition</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                                    <FormField
                                        control={form.control}
                                        name="bestPetPower"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Best Pet Raw Power (Number)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormDescription>Example: 1000000 for 1m</FormDescription>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="hugeCount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Huge Pets</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="titanicCount"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Titanic Pets</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="enchantBonus"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Total Enchant Bonus %</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                                <FormDescription>Sum of all Strength/Teamwork enchants (e.g. 500)</FormDescription>
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 font-bold text-white">
                                        CALCULATE DAMAGE
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
                                <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-orange-600/10 animate-pulse"></div>
                                <CardHeader className="relative pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-400">Combat Analysis</CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="flex flex-col md:flex-row md:items-baseline gap-4 mb-4">
                                        <span className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2 break-all">
                                            {result.totalTeamPower}
                                        </span>
                                        <span className="text-xl text-red-400 font-bold">Total Power</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-6">
                                        <div className="p-3 bg-white/10 rounded flex flex-col justify-center items-center text-center">
                                            <span className="text-lg font-bold text-yellow-400">{result.effectiveDamage}</span>
                                            <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">DPS Output</span>
                                        </div>
                                        <div className="p-3 bg-white/10 rounded flex flex-col justify-center items-center text-center">
                                            <span className="text-lg font-bold">{result.oneShotThreshold}</span>
                                            <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Insta-Break</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-2 text-center text-xs text-slate-500">
                                        Rank: <span className={result.rankColor}>{result.rank}</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-yellow-500" />
                                        Max Power Strategy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Your damage is scaling heavily off your <strong>Best Pet</strong>. Adding more Huges will only help if you keep upgrading that single Best Pet (e.g. to a Shiny Dark Matter Mythical).
                                    </p>
                                </CardContent>
                            </Card>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center p-8 text-muted-foreground bg-muted/10 border-2 border-dashed rounded-xl">
                            <div className="text-center space-y-4 max-w-sm">
                                <Skull className="w-16 h-16 mx-auto opacity-20" />
                                <h3 className="text-lg font-semibold">Damage Calculator</h3>
                                <p>Simulate your team strength with Titanics, Huges, and Enchants.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-red-500" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Best Pet Power:</strong> Enter the power of your strongest pet (e.g. 500q). This is the 'Anchor' for your team.</p>
                        <p><strong>Huge/Titanic Count:</strong> These pets copy the Anchor pet's power. Huges do ~150%, Titanics ~300%.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BrainCircuit className="h-5 w-5 text-red-500" />
                            Formula Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Team DPS Calculation:</strong></p>
                        <code className="bg-muted px-2 py-1 rounded block w-fit">Total = BestPet + &sum;(Huge &times; 1.5) + &sum;(Titanic &times; 3)</code>
                        <p>We then apply your total Enchant Multiplier (e.g. +300% from Super Teamwork).</p>
                    </CardContent>
                </Card>
            </div>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="Pet Simulator X Damage Guide: Huges, Titanics & Dark Matter" />
                <meta itemProp="description" content="Understand how damage works in Pet Simulator X. Learn why Huge Pets are better than Dark Matter, and how Super Teamwork stacks." />
                <meta itemProp="keywords" content="Pet Simulator X Damage Calculator, Huge vs Titanic Power, PSX Best Friend Enchant, Shiny Dark Matter Stats" />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Pet Simulator X Damage Guide: Huges, Titanics & Dark Matter</h1>
                <p className="text-lg italic text-muted-foreground">Stop guessing. Here is exactly how strong your team really is.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Hierarchy of Power</h2>
                <p>In <em>Pet Simulator X</em>, not all pets are created equal. The progression system uses multipliers that stack aggressively.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Normal:</strong> Base Power (1x)</li>
                    <li><strong>Golden:</strong> ~3x Base Power</li>
                    <li><strong>Rainbow:</strong> ~9x Base Power</li>
                    <li><strong>Dark Matter:</strong> ~27x Base Power</li>
                </ul>
                <p><strong>Shiny Difference:</strong> If you hatch a "Shiny" pet, it gets a massive multiplier (often 40% to 100% MORE) on top of its Rainbow/Dark Matter stats. A Shiny Dark Matter pet is arguably the strongest "stat pet" in the game.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">How Huge Pets Work (The "Best Friend" Trait)</h2>
                <p>New players often ask: "Why is this Huge Pet strong? It only has ??? damage!"</p>
                <p>Huge Pets (and Titanics) have the <strong>Best Friend</strong> enchant. This means their damage is dynamic. It is calculated as:</p>
                <blockquote className="border-l-4 border-primary pl-4 my-4 italic">
                    Huge Damage = (Your Single Strongest Pet's Damage) × (150% + Level Bonus)
                </blockquote>
                <p>This is why you only need ONE really strong "Stat Pet" (like a Shiny Dark Matter Mythical). The rest of your team should be Huge Pets that copy and amplify that one pet's power.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Enchant Meta: Strength V vs. Super Teamwork</h2>
                <p>If you are min-maxing damage for Hardcore Mode or Event Chests, you need the right enchants.</p>
                <p><strong>Strength V:</strong> Adds +100% damage to the <em>individual</em> pet holding it. Good for your main Stat Pet.</p>
                <p><strong>Super Teamwork:</strong> Adds +30% damage to <em>ALL</em> pets on your team. If you have 20 pets dealing 1 Billion damage each, adding Super Teamwork is a massive global buff. <strong>Super Teamwork is always better for high-rank players.</strong></p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Titanic Pets: The Ultimate Weapon</h2>
                <p>Titanic Pets are huge, rideable, and expensive. But stat-wise, they are monsters. They usually scale at <strong>2x or 3x</strong> your best pet's damage. A team of Titanics will obliterate any chest in the game instantly.</p>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Damage is exponential in Pet Sim X. The winning strategy is simple: Get one "God Tier" stat pet (Shiny DM) to act as the anchor, and then fill every other slot with Huge Pets that copy that anchor's power. Add Super Teamwork enchants, and you become unstoppable.</p>
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
