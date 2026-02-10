import Link from 'next/link';
import { RefreshCcw, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxPSXRebirthCalcInteractive from './roblox-pet-simulator-x-rebirth-calculator-interactive';

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator X Pet Power Calculator', slug: 'roblox-pet-simulator-x-pet-power-calculator', description: 'See how Rebirth boosts your damage.' },
    { name: '(Roblox) Pet Simulator X Diamond Calculator', slug: 'roblox-pet-simulator-x-diamond-calculator', description: 'Farm gems after you rebirth.' },
    { name: '(Roblox) Pet Simulator X Mastery Calculator', slug: 'roblox-pet-simulator-x-mastery-calculator', description: 'Level up your skills.' },
    { name: '(Roblox) Adopt Me Age-Up Time Calculator', slug: 'roblox-adopt-me-age-up-time-calculator', description: 'Compare grinding times.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Is VIP worth it?' },
];

const faqs = [
    {
        question: "Does Rebirth reset my pets?",
        answer: "No! Rebirthing in Pet Simulator X does NOT delete your pets, diamonds, or robux items. It only resets your 'Coins' (and sometimes area progress, depending on the update). Your inventory is safe.",
    },
    {
        question: "Why should I do Rebirth 1?",
        answer: "Rebirth 1 is essential because it unlocks the 'Teleport' button. Without it, you have to walk manually between every zone, which wastes hours of time. It also gives a permanent +15% damage boost.",
    },
    {
        question: "What is Hardcore Mode?",
        answer: "Hardcore Mode is unlocked after reaching 'The Void' (essentially Rebirth 3 equivalent content). It is a separate world where all enemies are 10x stronger, but the rewards (Hardcore Pets) are trillions of times stronger than normal pets.",
    },
    {
        question: "Do I lose my Diamonds when I Rebirth?",
        answer: "No. Diamonds (Gems) are never reset by Rebirths. Only specific world currencies (like Fantasy Coins or Tech Coins) might be reset depending on the specific rebirth mechanics of the update.",
    },
    {
        question: "Is the +75% Damage Boost multiplicative?",
        answer: "Yes. The permanent player damage boost stacks with your pet power. If you have 100 power and GET +75% boost, you deal 175 damage. This applies to ALL pets forever.",
    },
    {
        question: "How do I get coins faster for Rebirth?",
        answer: "Equip 'Cartoon Coins' or 'Fantasy Coins' enchants on your pets. These enchants can boost currency income by 100% or more. Also, use Triple Coin Boosts from the shop.",
    },
    {
        question: "Can I undo a Rebirth?",
        answer: "No, but there is no reason to. Rebirths are purely beneficial upgrades. You cannot downgrade.",
    },
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-pet-simulator-x-rebirth-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            name: '(Roblox) Pet Simulator X Rebirth Calculator',
            applicationCategory: 'GameApplication',
            operatingSystem: 'Any',
            description: 'Calculate costs and time required for Rebirth 1, 2, 3 (Void), and 4 (Cat World) in Pet Simulator X.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
            '@type': 'Article',
            headline: 'Pet Simulator X Rebirth Guide: Requirements & Rewards',
            description: 'Complete guide to Rebirthing in PSX. Unlock Teleport, Banking, and Hardcore Mode with our Rebirth Calculator.',
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

export default function RobloxPSXRebirthCalc() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <Card className="border-l-4 border-l-green-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <RefreshCcw className="h-6 w-6 text-green-500" />
                        Pet Simulator X Rebirth Calculator
                    </CardTitle>
                    <CardDescription>
                        Plan your path to infinite power. Check Rebirth requirements.
                    </CardDescription>
                </CardHeader>
            </Card>

            <RobloxPSXRebirthCalcInteractive />

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
            >
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Pet Simulator X Rebirth Guide: Benefits & Requirements</h1>
                <p className="text-lg italic text-muted-foreground">Don't be scared to press the button. Rebirthing is the key to Endgame.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Rebirth?</h2>
                <p>New players often hesitate to rebirth because they fear losing progress. In <em>Pet Simulator X</em>, rebirthing is <strong>mandatory</strong> for progress. You do NOT lose your pets.</p>
                <p><strong>The Benefits:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Rank Rewards:</strong> You gain access to new rank rewards chest.</li>
                    <li><strong>Permanent Damage Multipliers:</strong> Rebirth 4 gives a total of +75% damage. This is huge. A 1 Billion power pet effectively becomes a 1.75 Billion power pet.</li>
                    <li><strong>Teleportation:</strong> Unlocked at Rebirth 1. Walking is slow. Teleporting allows you to shop hop instantly.</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground pt-8">The Hardcore Mode Unlock (The Void)</h2>
                <p>Reaching "The Void" (often considered Rebirth 3/4 content depending on update era) unlocks <strong>Hardcore Mode</strong>. This is effectively "New Game Plus".</p>
                <p>In Hardcore Mode, you start over with 0 coins, but the pets you hatch are <strong>trillions</strong> of times stronger than normal pets. A generic "Dog" in Hardcore Mode is stronger than a "Dragon" in Normal Mode. You need to Rebirth to access this content.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Fastest Rebirth Strategy</h2>
                <ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Coin Enchants:</strong> Put "Fantasy Coins IV" or "Cartoon Coins V" on your best pets. Damage doesn't matter if you aren't earning currency.</li>
                    <li><strong>Server Boosts:</strong> Always keep "Triple Coins" active. It speeds up the grind by 3x.</li>
                    <li><strong>Friend Bonus:</strong> Playing with friends gives a Coin multiplier. Join a server with people on your friends list.</li>
                </ol>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Rebirths are the primary progression gates in Pet Simulator X. By rebirthing, you gain essential tools like Teleportation and Banking, and you unlock the damage multipliers required to break higher-level chests. Do not delay your rebirths.</p>
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
                                <Link href={`/category/gaming/${calc.slug}`} className="text-primary hover:underline flex items-center gap-1">
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
