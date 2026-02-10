import Link from 'next/link';
import { Gem, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxPetSimDiamondCalcInteractive from './roblox-pet-simulator-x-diamond-calculator-interactive';

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator X Pet Power Calculator', slug: 'roblox-pet-simulator-x-pet-power-calculator', description: 'Maximize your team damage for faster breaking.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Is VIP worth it?' },
    { name: '(Roblox) Adopt Me Bucks to Robux Converter', slug: 'roblox-adopt-me-bucks-to-robux-converter', description: 'Compare economy with Adopt Me.' },
    { name: '(Roblox) Inventory Value Estimator', slug: 'roblox-inventory-value-estimator', description: 'Track your Huges value.' },
    { name: '(Roblox) Trade Tax Calculator', slug: 'roblox-trade-tax-calculator', description: 'Calculate booth tax in Trading Plaza.' },
];

const faqs = [
    {
        question: "What is the fastest way to get Diamonds in Pet Sim X?",
        answer: "The Diamond Mine (Mystic Mine) is currently the best AFK spot. You need to release a Huge Pet to enter the deeper levels, but the yield is significantly higher than Town or Tech World. Combine this with 'Diamond V' enchants on all pets.",
    },
    {
        question: "Does the 'Diamonds V' enchant stack?",
        answer: "Yes. If you have a team of 8 pets and all of them have Diamonds V (which gives +50% or +100% depending on update), it stacks additively. A full team of Diamond enchant pets is essential for AFK farming.",
    },
    {
        question: "How does the Bank Interest work?",
        answer: "The Bank pays interest on your deposited diamonds every 24 hours. Tier 1 banks give poor interest, but a maxed Tier 8 bank gives significant daily returns. However, putting diamonds in the bank means you can't spend them instantly.",
    },
    {
        question: "Is the VIP Gamepass worth it for Diamonds?",
        answer: "VIP gives you access to the VIP Rewards Chest (moderately useful for starters) and a 10% XP/Diamond boost. For endgame players earning billions, that 10% adds up, but for new players, the Trading Booth access (Pro Plaza) is usually more valuable.",
    },
    {
        question: "What are 'Lootbags' and do they count?",
        answer: "Lootbags drop when you break chests/creates. They contain diamonds and coins. Mastery Perks (Lootbag Mastery) can significantly increase the diamond output of these bags. This calculator estimates raw chest yield, but decent Lootbag Mastery can 2x your income.",
    },
    {
        question: "Does Server Triple Damage help with Diamonds?",
        answer: "Indirectly, yes. Higher damage means you break chests faster. Breaking 2x chests per minute equals 2x diamonds per minute. So Damage = Diamonds.",
    },
    {
        question: "What is the 'Diamond Cap'?",
        answer: "There is a soft cap on how many diamonds you can hold (usually in the trillions). Most trading happens with 'Huge Pets' or 'Titanic Pets' as currency once you reach the diamond cap.",
    },
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-pet-simulator-x-diamond-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            name: '(Roblox) Pet Simulator X Diamond Calculator',
            applicationCategory: 'GameApplication',
            operatingSystem: 'Any',
            description: 'Calculate your hourly diamond income in Pet Simulator X based on zone, enchants, and gamepasses.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
            '@type': 'Article',
            headline: 'Pet Simulator X Diamond Guide: Auto Farm Billions',
            description: 'The ultimate guide to farming Diamonds in Pet Simulator X. Learn about the Diamond Mine, Enchant stacking, and the best AFK methods to become a billionaire.',
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

export default function RobloxPetSimDiamondCalc() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <Card className="border-l-4 border-l-cyan-400 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Gem className="h-6 w-6 text-cyan-400" />
                        Pet Simulator X Diamond Calculator
                    </CardTitle>
                    <CardDescription>
                        Optimize your AFK farming strategy. Maximize Gems per hour.
                    </CardDescription>
                </CardHeader>
            </Card>

            <RobloxPetSimDiamondCalcInteractive />

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
            >
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Pet Simulator X Diamond Guide: How to Earn Billions</h1>
                <p className="text-lg italic text-muted-foreground">Diamonds (Gems) are the currency of the rich. Here is the math behind infinite wealth.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Meta: The Diamond Mine</h2>
                <p>Forget the Tech World chest. Forget the Fantasy World. If you want diamonds, you must go to the <strong>Diamond Mine</strong> (located in Spawn World).</p>
                <p>The Diamond Mine has three levels:</p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Paradise Cave:</strong> Moderate yields. Good for beginners.</li>
                    <li><strong>Cyber Cavern:</strong> High yields. Requires hard-hitting pets.</li>
                    <li><strong>Mystic Mine:</strong> Extreme yields. <strong>Requires releasing a Huge Pet.</strong> This is the endgame farming spot.</li>
                </ol>

                <h2 className="text-2xl font-bold text-foreground pt-8">Enchant Stacking: The Secret Multiplier</h2>
                <p>Many players think <em>Damage</em> is the most important stat. For diamonds, <em>Enchants</em> are king.</p>
                <p>You want a team of pets (8 to 20 pets depending on passes) that ALL have:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Diamonds V:</strong> Increases diamond earnings by ~50-100% per pet (stacks).</li>
                    <li><strong>Royalty:</strong> +100% Damage causing faster breaks AND +100% Diamonds. This is the God Tier enchant.</li>
                </ul>
                <p>A full team of Royalty pets in the Mystic Mine can generate 500m to 1b diamonds per day AFK.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Lootbags vs. Raw Gems</h2>
                <p>There are two ways diamonds drop:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="bg-muted p-4 rounded">
                        <h4 className="font-bold">Raw Gems</h4>
                        <p>The diamonds that fly out when a chest breaks. These are affected by Diamond Enchants.</p>
                    </div>
                    <div className="bg-muted p-4 rounded">
                        <h4 className="font-bold">Lootbags</h4>
                        <p>The physical bags that drop on the floor. These contain large sums of diamonds. They are affected by <strong>Lootbag Mastery</strong> and <strong>Server Drop Rate</strong> boosts.</p>
                    </div>
                </div>
                <p>To maximize income, you need high Damage (to break objects fast for Lootbags) AND high Diamond Enchants (for Raw Gems).</p>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Diamonds are the lifeblood of the economy. By optimizing your loadout with Diamond Enchants and AFK farming the Mystic Mine, you can earn billions daily, allowing you to buy Huge Pets from the trading plaza without spending Robux.</p>
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
