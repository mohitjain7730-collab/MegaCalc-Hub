import Link from 'next/link';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxPSXMasteryCalcInteractive from './roblox-pet-simulator-x-mastery-calculator-interactive';

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator X Diamond Calculator', slug: 'roblox-pet-simulator-x-diamond-calculator', description: 'Once mastered, farm gems.' },
    { name: '(Roblox) Pet Simulator X Rebirth Calculator', slug: 'roblox-pet-simulator-x-rebirth-calculator', description: 'Rebirth to unlock more.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Does Auto-Hatch help?' },
    { name: '(Roblox) Adopt Me Age-Up Time Calculator', slug: 'roblox-adopt-me-age-up-time-calculator', description: 'Similar grinding logic.' },
    { name: '(Roblox) Fortnite XP Calculator', slug: 'fortnite-xp-calculator', description: 'Calculate battle pass grind.' },
];

const faqs = [
    {
        question: "What is the best Mastery to max first?",
        answer: "Lootbag Mastery is widely considered the best to max first. At Level 99, it gives a 2x multiplier to all lootbag rewards (Diamonds/Coins). This doubles your income permanently.",
    },
    {
        question: "How do I farm Enchanting Mastery fast?",
        answer: "Go to the Enchant machine. Select a weak pet you don't care about. Turn on an Auto-Clicker on the 'Enchant' button. Let it run overnight. You burn gems, but you gain massive mastery XP very quickly.",
    },
    {
        question: "Does Mastery reset on Rebirth?",
        answer: "No. Mastery levels are permanent improvements to your account. You keep them forever, even through major game updates usually.",
    },
    {
        question: "What does Egg Mastery do?",
        answer: "Egg Mastery Level 99 allows you to open Golden Eggs for the price of Normal Eggs (sometimes) and increases the speed of the hatching animation, allowing you to hatch more pets per hour.",
    },
    {
        question: "Is there a max level for Mastery?",
        answer: "Yes, currently the max level for all Masteries is Level 99. Reaching this unlocks the 'Hardcore' achievement benefits for that skill.",
    },
    {
        question: "Do I need Auto-Hatch gamepass for Egg Mastery?",
        answer: "It is highly recommended. Without Auto-Hatch, you have to click manually every few seconds. To open the 500,000+ eggs needed for Level 99, manual clicking is physically impossible/dangerous (RSI).",
    },
    {
        question: "How to farm Chest Breaker Mastery?",
        answer: "Go to a low-level area (spawn world). Equip weak pets. Break tiny chests instantly. Mastery is awarded per-break, not per-damage. So breaking 100 small chests is better than breaking 1 giant chest.",
    },
];

const baseUrl = 'https://mycalculating.com/roblox-pet-simulator-x-mastery-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            name: '(Roblox) Pet Simulator X Mastery Calculator',
            applicationCategory: 'GameApplication',
            operatingSystem: 'Any',
            description: 'Calculate time and actions required to reach Level 99 Mastery in Pet Simulator X.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
            '@type': 'Article',
            headline: 'Pet Simulator X Mastery Guide: Level 99 Fast',
            description: 'Learn the fastest methods to max out Lootbag, Egg, and Enchanting Mastery in PSX. Unlock 2x rewards and Golden Eggs.',
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

export default function RobloxPSXMasteryCalc() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <Card className="border-l-4 border-l-purple-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <GraduationCap className="h-6 w-6 text-purple-500" />
                        Pet Simulator X Mastery Calculator
                    </CardTitle>
                    <CardDescription>
                        Track your grind to Level 99. Maximize your perks.
                    </CardDescription>
                </CardHeader>
            </Card>

            <RobloxPSXMasteryCalcInteractive />

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
            >
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Pet Simulator X Mastery Guide: Fastest Way to Level 99</h1>
                <p className="text-lg italic text-muted-foreground">Mastering skills isn't just for status. The Level 99 perks are game-breaking.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Why Level Mastery?</h2>
                <p>Mastery Skills in <em>Pet Simulator X</em> provide passive buffs. The rewards scale as you level up, with a massive "Perk" unlocked at Level 99.</p>
                <p>For example, <strong>Lootbag Mastery Level 99</strong> doubles the value of all lootbags. If you are farming diamonds, having this mastery literally <strong>doubles your income</strong> compared to someone with Level 1 mastery.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">The "Big Three" Masteries</h2>

                <h3 className="text-xl font-bold mt-4">1. Lootbag Mastery (Priority: High)</h3>
                <p><strong>Goal:</strong> Break chests dropping lootbags.</p>
                <p><strong>Method:</strong> Go to the Alien Chest or Heaven Chest. Use relatively weak pets so you break the chest in "ticks" (spawn lootbags often) rather than one-shotting it. Or break thousands of small crates in Spawn World.</p>

                <h3 className="text-xl font-bold mt-4">2. Enchanting Mastery (Priority: Medium)</h3>
                <p><strong>Goal:</strong> Enchant pets.</p>
                <p><strong>Method:</strong> This is the easiest to AFK. Stand at the Enchant Table. Set up an Auto-Clicker on the 'Enchant' button. Let it run overnight. You burn gems, but you gain massive mastery XP very quickly.</p>

                <h3 className="text-xl font-bold mt-4">3. Egg Mastery (Priority: Passive)</h3>
                <p><strong>Goal:</strong> Open Eggs.</p>
                <p><strong>Method:</strong> Use the "Auto-Hatch" gamepass. Open the cheapest egg in the game (Spotted Egg or similar) overnight. You get the same XP for opening a cheap egg as an expensive one.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Hardcore Mastery</h2>
                <p>When you unlock Hardcore Mode, masteries apply there too. Grinding mastery in Normal Mode is recommended taking it into Hardcore, as Normal Mode resources (coins/diamonds) are cheaper and easier to get.</p>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Mastery is a long-term grind, but essential for maximizing your account's efficiency. By focusing on Lootbag and Enchanting Mastery first, you set yourself up for infinite wealth in the late game.</p>
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
