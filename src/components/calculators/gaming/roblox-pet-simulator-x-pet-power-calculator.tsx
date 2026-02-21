import Link from 'next/link';
import { Sword, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxPetSimPowerCalcInteractive from './roblox-pet-simulator-x-pet-power-calculator-interactive';

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

const baseUrl = 'https://mycalculating.com/roblox-pet-simulator-x-pet-power-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            name: '(Roblox) Pet Simulator X Power Calculator',
            applicationCategory: 'GameApplication',
            operatingSystem: 'Any',
            description: 'Calculate your total team DPS in Pet Simulator X. Compare Huge Pets vs Dark Matter stats and test enchants.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
            '@type': 'Article',
            headline: 'Pet Simulator X Power Guide: Huge vs. Titanic Damage',
            description: 'Understand how pet damage works in PSX. Learn the multiplier math behind Dark Matter, Shiny, and the Best Friend enchant on Huge pets.',
            author: {
                '@type': 'Organization',
                name: 'MegaCalc Hub Gaming Team',
            },
            datePublished: '2023-10-27T00:00:00Z',
            dateModified: new Date().toISOString()
        },
        {
            '@type': 'FAQPage',
            mainEntity: faqs.map(faq => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer
                }
            }))
        }
    ],
};

export default function RobloxPetSimPowerCalc() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

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

            <RobloxPetSimPowerCalcInteractive />

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
            >
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Pet Simulator X Damage Guide: Huges, Titanics & Dark Matter</h1>
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
                <p>Titanic Pets are massive (rideable) and expensive. But stat-wise, they are monsters. They usually scale at <strong>2x or 3x</strong> your best pet's damage. A team of Titanics will obliterate any chest in the game instantly.</p>

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
                                <Link href={`/gaming/${calc.slug}`} className="text-primary hover:underline flex items-center gap-1">
                                    <ArrowRight className="h-3 w-3" />
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
