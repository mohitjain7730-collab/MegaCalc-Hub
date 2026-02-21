import Link from 'next/link';
import { Gem, Zap, Sparkles, BookOpen, BrainCircuit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxPetSimulatorXGoldenPetValueInteractive from './roblox-pet-simulator-x-golden-pet-value-interactive';

// Re-using formatNumber for static tables
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

export default function RobloxPSXGoldenCalc() {

    // JSON-LD Construction
    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Article",
                "headline": "Mastering Pet Upgrades in Pet Simulator X",
                "description": "Master the art of pet upgrading in Pet Simulator X. Comprehensive guide on Golden, Rainbow, and Dark Matter multipliers, Shiny bonuses, and trading strategies to maximize your gem profits.",
                "author": {
                    "@type": "Organization",
                    "name": "MegaCalc Hub"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "MegaCalc Hub",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://megacalchub.com/logo.png"
                    }
                },
                "datePublished": "2023-10-27T00:00:00Z",
                "dateModified": new Date().toISOString()
            },
            {
                "@type": "FAQPage",
                "mainEntity": faqs.map(faq => ({
                    "@type": "Question",
                    "name": faq.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.answer
                    }
                }))
            }
        ]
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

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

            {/* Interactive Calculator Component */}
            <RobloxPetSimulatorXGoldenPetValueInteractive />

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
                                <Link href={`/gaming/${calc.slug}`} className="text-primary hover:underline">
                                    {calc.name}
                                </Link>
                            </h4>
                            <p className="text-sm text-muted-foreground">{calc.description}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Mastering Pet Upgrades in Pet Simulator X</h1>
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
