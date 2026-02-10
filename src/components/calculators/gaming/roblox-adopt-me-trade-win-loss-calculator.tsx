import Link from 'next/link';
import { Scale, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxAdoptMeTradeWinLossInteractive from './roblox-adopt-me-trade-win-loss-calculator-interactive';

const relatedCalculators = [
    { name: '(Roblox) Adopt Me Neon Pet Value Calculator', slug: 'roblox-adopt-me-neon-pet-value-calculator', description: 'Estimate values for Neon pets specifically.' },
    { name: '(Roblox) Adopt Me Mega Neon Value Calculator', slug: 'roblox-adopt-me-mega-neon-value-calculator', description: 'Calculate Mega Neon conversions.' },
    { name: '(Roblox) Adopt Me Bucks to Robux Converter', slug: 'roblox-adopt-me-bucks-to-robux-converter', description: 'Convert in-game cash to real currency.' },
    { name: '(Roblox) Trading Profit Analyzer', slug: 'roblox-trading-profit-analyzer', description: 'Track your long-term trading profits.' },
    { name: '(Roblox) Pet Dupe Value Calculator', slug: 'roblox-pet-dupe-value-calculator', description: 'Check Clean vs Duped value risks.' },
];

const faqs = [
    {
        question: "What is 'W/F/L' in Adopt Me trading?",
        answer: "W/F/L stands for Win, Fair, Loss. It is the community standard for evaluating trades. A 'Win' means you gained value, 'Fair' means the values were equal, and 'Loss' means you gave away more than you received.",
    },
    {
        question: "What are 'Happy Values'?",
        answer: "'Happy Values' refers to a trade where you intentionally take a 'Loss' in mathematical value because you really want the specific pet (it makes you happy). For example, overpaying for a Cow because it's your Dream Pet (DP).",
    },
    {
        question: "How do I know the numeric value of my pets?",
        answer: "Since there are no official values, players use community value lists like Elvebredd, GG, or StarPets. Input the total numbers from those sites into this calculator to handle the math and demand percentages.",
    },
    {
        question: "What does 'HTT' mean?",
        answer: "HTT stands for 'Hard To Trade'. These are pets with low demand (like the Griffin or Metal Ox) that nobody wants. Even if their 'value' is high on paper, you should count them as worth 10-20% less because they are difficult to get rid of.",
    },
    {
        question: "What is the '9-Slot' trading rule?",
        answer: "You can only trade 9 items at once (or 18 with the license/updated trade menu). Be very careful with 'Trust Trades' or 'Add Afters' where someone asks you to give more than 18 items. These are almost always scams.",
    },
    {
        question: "Why is 'Demand' important in this calculator?",
        answer: "A High Tier pet like a Bat Dragon has high demand—people will overpay for it. A Low Demand pet like a Golden Rat is hard to swap. This calculator lets you adjust for 'Demand' to reveal the *real* trade outcome, not just the paper value.",
    },
    {
        question: " What is a 'Shark' in Adopt Me?",
        answer: "A 'Shark' is a predator trader who looks for inexperienced players (usually children) who don't know values. They try to convince you to trade a high-value pet (like a Shadow Dragon) for a low-value 'cool looking' pet (like a Minion Chick). This calculator helps you spot Sharks.",
    },
];

const steps = [
    'Open your preferred Value List (e.g., Elvebredd, .GG) in another tab.',
    'Sum up the total value of YOUR offer and enter it.',
    'Sum up the total value of THEIR offer and enter it.',
    'Select the "Demand" (Is their pet Hard-to-Trade or Preppie?).',
    'Click Calculate to see if it is a Win, Fair, or Loss.',
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-adopt-me-trade-win-loss-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Adopt Me Trade Win/Loss Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Adopt Me Trade Win/Loss Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Evaluate Adopt Me trades instantly. Calculate Wins, Fairs, and Losses based on community values and demand.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
            '@type': 'FAQPage',
            "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                }
            }))
        }
    ],
};

export default function RobloxAdoptMeTradeWinLoss() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <Card className="border-l-4 border-l-blue-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Scale className="h-6 w-6 text-blue-500" />
                        Adopt Me Trade Win/Loss Calculator
                    </CardTitle>
                    <CardDescription>
                        Don't get sharked. Analyze value and demand to optimize your trades.
                    </CardDescription>
                </CardHeader>
            </Card>

            <RobloxAdoptMeTradeWinLossInteractive />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        How to Use
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <ul className="list-disc pl-5 space-y-2">
                        {steps.map((step, i) => (
                            <li key={i}>{step}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="The Complete Guide to Winning Trades in Adopt Me" />
                <meta itemProp="description" content="Master the art of trading in Roblox Adopt Me. Learn about W/F/L, demand theory, and how to avoid 'Shark' trades." />
                <meta itemProp="keywords" content="Adopt Me Trade Calculator, WFL Calculator, Adopt Me Values, Sharking, Preppie Values" />
                <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
                <meta itemProp="datePublished" content="2025-01-25" />
                <meta itemProp="url" content={baseUrl} />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Winning Trades in Adopt Me</h1>
                <p className="text-lg italic text-muted-foreground">Why numbers aren't everything: Understanding Demand, Volatility, and the Psychology of the 'Win'.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Art of the Trade</h2>
                <p>Trading in <em>Adopt Me!</em> is not just about swapping one pet for another; it is a complex economy with fluctuating stock values. Just like the real world stock market, pet values rise and fall based on supply, demand, and "hype".</p>
                <p>To succeed, you must move beyond simply asking "Is this fair?" and start asking "Is this a smart investment?". This guide will teach you the mechanics behind the <strong>W/F/L (Win/Fair/Loss)</strong> system.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Concept 1: Value vs. Demand</h2>
                <p>One of the biggest mistakes new traders make is looking strictly at the "Value Number" on a value list.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <div className="border p-4 rounded bg-muted/20">
                        <h4 className="font-bold text-green-600">Value</h4>
                        <p className="text-sm">The theoretical worth of a pet based on rarity and age. (e.g., A Golden Griffin is Legendary, so it has high 'Value').</p>
                    </div>
                    <div className="border p-4 rounded bg-muted/20">
                        <h4 className="font-bold text-blue-600">Demand</h4>
                        <p className="text-sm">How many people actually WANT the pet. (e.g., Nobody wants a Golden Griffin, so it has terrible 'Demand').</p>
                    </div>
                </div>
                <p><strong>The Golden Rule:</strong> Always prioritize Demand over Value. It is better to have a lower-value pet that everyone wants (like a Cow or Turtle) than a high-value pet that nobody wants (like a Metal Ox). This is why "Preppie" pets often trade for Legendaries despite being Rare or Ultra-Rare.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Concept 2: The "Shark" Trade</h2>
                <p>Sharking is the practice of finding players who don't know values (often younger players or those returning after a long break) and offering them a terrible trade that <em>looks</em> good.</p>
                <p><strong>Common Shark Tactics:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>The "Mega" Trick:</strong> Offering a Mega Dog for a Shadow Dragon. The shark claims "Mega is better than Normal!", ignoring that a Shadow Dragon is 1000x rarer.</li>
                    <li><strong>The "New Pet" Hype:</strong> When a new egg is released, the pets inside are hyped for the first 48 hours. Sharks will trade these new, common pets for old, valuable Legendaries. Wait 3 days, and the new pet's value usually crashes by 90%.</li>
                    <li><strong>The Minion Chick:</strong> The Zodiac Minion Chick was free and easy to get, but looks Legendary. Sharks trade it for real Legendaries. Do not fall for this; Minion Chicks are essentially worthless.</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground pt-8">Concept 3: "Happy Values"</h2>
                <p>Sometimes, a "Loss" is actually a "Win". This is called <strong>Happy Values</strong>.</p>
                <p>If you have a Giraffe and you trade it for a Bat Dragon (technically a small loss/fair depending on the week), but the Bat Dragon is your absolute Dream Pet that you will never trade—that is a Win. The goal of the game is to have fun.</p>
                <p>However, be careful. Don't overpay by 50% for Happy Values unless you are 100% sure you will keep the pet forever. If you try to trade it later, you will realize you lost a huge chunk of your inventory's net worth.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Advanced: The "HTT" List (Hard To Trade)</h2>
                <p>When calculating a trade, apply a mental "Tax" to specific pets. If you are receiving any of the following, assume they are worth 20% LESS than the spreadsheet says:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Metal Ox / Lunar Ox / Ox</li>
                    <li>Minion Chick</li>
                    <li>Golden Griffin / Golden Dragon</li>
                    <li>Diamond Griffin</li>
                    <li>Dragonfly</li>
                    <li>Updated 2024 "Randoms" that aren't cute</li>
                </ul>
                <p>Conversely, apply a "Bonus" to High-Tiers: Shadow Dragon, Bat Dragon, Giraffe, Frost Dragon, Owl, Parrot, Evil Unicorn, Crow. These pets are liquid gold.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Scam Prevention: The "Trust Trade"</h2>
                <p>There is no such thing as a Trust Trade. If someone says "Trust Trade me your best pet and I'll give you Robux/Admin/Shadow Dragon", report them immediately. It is always a scam.</p>
                <p>Similarly, the "Fail Trade" (where they claim you can give them a pet and it will 'fail' and come back to you) is patched or fake. You will lose your pet.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Summary</h2>
                <p>1. Check Values on a reputable site.</p>
                <p>2. Adjust for Demand (HTT vs Preppie).</p>
                <p>3. Input into this W/F/L calculator.</p>
                <p>4. Check the second window for glitched/switched pets.</p>
                <p>5. Accept and enjoy your profit!</p>
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
