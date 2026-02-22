import Link from 'next/link';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxAdoptMeCollectionValueInteractive from './roblox-adopt-me-collection-value-estimator-interactive';

const relatedCalculators = [
    { name: '(Roblox) Adopt Me Trade Win/Loss Calculator', slug: 'roblox-adopt-me-trade-win-loss-calculator', description: 'Analyze individual trades.' },
    { name: '(Roblox) Inventory Value Estimator', slug: 'roblox-inventory-value-estimator', description: 'Track value for Roblox items (Limiteds).' },
    { name: '(Roblox) Adopt Me Pet Aging Speed Calculator', slug: 'roblox-adopt-me-pet-aging-speed-calculator', description: 'How fast can you grow your inventory?' },
    { name: '(Roblox) Adopt Me Mega Neon Value Calculator', slug: 'roblox-adopt-me-mega-neon-value-calculator', description: 'Deep dive into Mega values.' },
    { name: '(Roblox) Adopt Me Bucks to Robux Converter', slug: 'roblox-adopt-me-bucks-to-robux-converter', description: 'Convert cash to value.' },
];

const faqs = [
    {
        question: "How accurate is this estimated value?",
        answer: "This calculator provides a 'Macro' view of your inventory health using standard multipliers (e.g., Neon = 5x Normal). It does not account for specific demand of specific pets (e.g., a Cow is worth more than a Dragon). Use it for tracking overall growth, not for specific trade offers.",
    },
    {
        question: "What is an 'Inventory Dump'?",
        answer: "An Inventory Dump is when you trade 9+ or 18+ random low-tier pets for one good High Tier pet. This is generally a good strategy to 'consolidate' your wealth, as high-tier pets are easier to trade.",
    },
    {
        question: "Why are Neons worth more than 4 pets?",
        answer: "A Neon pet requires 4 full-grown pets. Growing a Legendary from Newborn to Full Grown takes ~6-8 hours. Creating a Neon takes ~25-30 hours of gameplay. When you trade a Neon, you are being paid for that labor.",
    },
    {
        question: "What defines a 'Rich' player in Adopt Me?",
        answer: "Generally, owning a high-tier Mega Neon (like a Mega Crow, Giraffe, or Shadow Dragon) puts you in the top 1% of players. Owning a single Bat Dragon or Shadow Dragon makes you 'Rich' by normal server standards.",
    },
    {
        question: "Should I trade my inventory for one big pet?",
        answer: "Yes. In Adopt Me economics, 'Quality over Quantity' rules. One Shadow Dragon is safer and easier to trade than 500 Metal Oxen. Always try to upgrade multiple small pets into one larger pet.",
    },
    {
        question: "How do I calculate value for Toys and Vehicles?",
        answer: "Toys and Vehicles are much harder to value. Only a few specific items (Mono Moped, Cloud Car, Tombstone Ghostify, Candy Cannon) have high stable value. Most random toys are considered 'adds' with negligible value.",
    },
    {
        question: "Does this calculator include Star Rewards?",
        answer: "Yes, you can count Diamond or Golden pets under the 'Legendary' section. However, be aware that Star Reward pets lose value over time as more players unlock them.",
    },
];

const baseUrl = 'https://mycalculating.com/roblox-adopt-me-collection-value-estimator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            name: '(Roblox) Adopt Me Collection Value Estimator',
            applicationCategory: 'GameApplication',
            operatingSystem: 'Any',
            description: 'Estimate the total value of your Adopt Me inventory. Calculate your wealth tier and compare against high-tier pets like Shadow Dragons.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
            '@type': 'Article',
            headline: 'How to Estimate Your Adopt Me Inventory & Get Richer',
            description: 'Calculate your total Adopt Me net worth. Learn about consolidation strategies, bulk trading, and inventory management.',
            author: {
                '@type': 'Organization',
                name: 'MegaCalc Hub Gaming Team',
            },
            datePublished: '2023-11-15T00:00:00Z',
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

export default function RobloxAdoptMeCollectionValue() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <Card className="border-l-4 border-l-blue-600 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                        Adopt Me Collection Value Estimator
                    </CardTitle>
                    <CardDescription>
                        Are you Rich? Calculate the bulk strength of your inventory.
                    </CardDescription>
                </CardHeader>
            </Card>

            <RobloxAdoptMeCollectionValueInteractive />

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
            >
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">How to Estimate Your Adopt Me Inventory & Get Richer</h1>
                <p className="text-lg italic text-muted-foreground">Stop hoarding randoms. Learn the "Consolidation Strategy" used by the top 1% of traders.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Theory of "Value Density"</h2>
                <p>In <em>Adopt Me!</em>, having an inventory worth 100 points is useless if it is spread across 500 different pets. Why? Because you can only put <strong>18 items</strong> in a trade window.</p>
                <p>This limitation creates a concept called <strong>Value Density</strong>. A "Shadow Dragon" (Dense Value) is worth more than 100 "Dragonfly" pets (Loose Value), even if the spreadsheet says they are mathematically equal. You cannot trade 100 Dragonflies easily. You can trade a Shadow Dragon instantly.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">The 4 Stages of Wealth</h2>

                <h3 className="text-xl font-bold mt-4">Stage 1: The Grinder (0 - 20 Points)</h3>
                <p>You have random eggs, Commons, and maybe one Low-Tier Legendary like a Minion Chick. Not much trading power.</p>
                <p><strong>Strategy:</strong> Make Neons. Turn 4 Commons into 1 Neon Common. Trade that Neon for a generic Legendary. Repeat.</p>

                <h3 className="text-xl font-bold mt-4">Stage 2: The Collector (20 - 100 Points)</h3>
                <p>You have 5-10 Legendaries (Unicorns, Dragons) and maybe a Neon Ultra-Rare. You feel rich, but you can't get a High-Tier yet.</p>
                <p><strong>Strategy:</strong> "Upgrade" trades. Trade 5 Legendaries for 1 Turtle. Trade 3 Turtles for 1 Arctic Reindeer. Always try to give multiple small pets for one slightly better pet.</p>

                <h3 className="text-xl font-bold mt-4">Stage 3: The High-Tier Trader (100 - 500 Points)</h3>
                <p>You own "High Tiers" like Crows, Evil Unicorns, or Parrots. Moving up is hard now.</p>
                <p><strong>Strategy:</strong> Overpays. You now have the power. Ask for overpays when downgrading. Trade your Crow for 6-7 Turtles (profit), then trade those Turtles individually for profit, then buy the Crow back plus extras.</p>

                <h3 className="text-xl font-bold mt-4">Stage 4: The Rich (500+ Points)</h3>
                <p>You own Bat Dragons, Giraffes, or Shadow Dragons. Your inventory essentially grows itself because these pets rise in value faster than inflation.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Inventory Management Tips</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Favorite Your "NFT" Pets:</strong> Lock your "Never For Trade" pets so you don't accidentally add them.</li>
                    <li><strong>Trash the Trash:</strong> Do not hoard Food or Toys unless they are rare. They clutter the trade window and make you look inexperienced.</li>
                    <li><strong>Use Alts for Storage:</strong> If you accept a "9+" trade (giving 9 pets for 1 big pet), you will have excess junk. Move the junk to an alt account to keep your main inventory clean for screenshots.</li>
                </ul>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Total inventory value is a vanity metric. What matters is your ability to consolidate spread-out value into dense assets (High Tiers). Use this calculator to track your progress, but focus on the quality of your pets, not just the quantity.</p>
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
                                <Link href={`/${calc.slug}`} className="text-primary hover:underline flex items-center gap-1">
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
