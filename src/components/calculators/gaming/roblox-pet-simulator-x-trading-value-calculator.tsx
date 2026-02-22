import Link from 'next/link';
import { Scale, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxPSXTradingCalcInteractive from './roblox-pet-simulator-x-trading-value-calculator-interactive';

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator 99 Pet Value Calculator', slug: 'roblox-pet-simulator-99-pet-value-calculator', description: 'Values for the sequel.' },
    { name: '(Roblox) Adopt Me Collection Value Estimator', slug: 'roblox-adopt-me-collection-value-estimator', description: 'Calculate Adopt Me inventory.' },
    { name: '(Roblox) Trade Tax Calculator', slug: 'roblox-trade-tax-calculator', description: 'Calculate booth tax.' },
    { name: '(Roblox) Pet Simulator X Diamond Calculator', slug: 'roblox-pet-simulator-x-diamond-calculator', description: 'Farm gems to buy pets.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Is VIP worth it?' },
];

const faqs = [
    {
        question: "How is RAP calculated?",
        answer: "RAP (Recent Average Price) is an automatic value calculated by Roblox based on the last few sales of that specific item in the trading booth. It can be manipulated if someone buys their own pet on an alt account for a high price.",
    },
    {
        question: "What is 'Demand' vs 'Value'?",
        answer: "Value is what a spreadsheet or RAP says. Demand is how many people actually WANT the pet. A pet can have 10B Value, but if Demand is 'Low', nobody will trade for it. Always prioritize High Demand items.",
    },
    {
        question: "What is a 'Duped' pet?",
        answer: "A duped pet is a glitched copy. If you trade for one, the game's anti-cheat might delete it later, and you lose your items. Avoid trades that seem 'too good to be true'.",
    },
    {
        question: "How much is the Trading Booth Tax?",
        answer: "In Pet Simulator X, the tax is 1% if you are a VIP member, and slightly higher for non-VIPs (varies by update). Always factor in tax when flipping.",
    },
    {
        question: "Is 'Cosmic Values' accurate?",
        answer: "Cosmic Values (and similar tier lists) are generally trusted by the community for High Tier pets (Huges/Titanics). For low tier pets, rely on RAP.",
    },
    {
        question: "What does 'Clean' mean?",
        answer: "Clean means the pet is not duped. Traders often ask 'Is it clean?' before trading for high-value Titanics.",
    },
    {
        question: "Why did my RAP go down?",
        answer: "Market crashes happen. If a new update releases better pets, old pets lose value. This is called 'Deflation'.",
    },
];

const baseUrl = 'https://mycalculating.com/roblox-pet-simulator-x-trading-value-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            name: '(Roblox) Pet Simulator X Trading Value Calculator',
            applicationCategory: 'GameApplication',
            operatingSystem: 'Any',
            description: 'Determine the fair trade value of Pet Simulator X items. Identify RAP manipulation and calculate flip profits.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
            '@type': 'Article',
            headline: 'Pet Simulator X Trading Guide: Avoiding Scams & RAP Manipulation',
            description: 'Learn how to spot RAP scams, understand pet demand vs value, and profit from trading in PSX.',
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

export default function RobloxPSXTradingCalc() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <Card className="border-l-4 border-l-blue-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Scale className="h-6 w-6 text-blue-500" />
                        Pet Simulator X Trading Calculator
                    </CardTitle>
                    <CardDescription>
                        Detect RAP manipulation. Calculate Fair Value.
                    </CardDescription>
                </CardHeader>
            </Card>

            <RobloxPSXTradingCalcInteractive />

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
            >
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Pet Simulator X Trading Guide: Avoiding Scams & RAP Manipulation</h1>
                <p className="text-lg italic text-muted-foreground">RAP is a lie. Real Traders know that Demand is the only truth.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">What is RAP Manipulation?</h2>
                <p>RAP (Recent Average Price) is calculated by the game based on recent sales. Scammers exploit this by:</p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>Using two accounts (Main and Alt).</li>
                    <li>Selling a worthless pet (like a Cat) from Main to Alt for 100 Billion Gems.</li>
                    <li>Trading the gems back and repeating.</li>
                    <li><strong>Result:</strong> Although the pet is worthless, the game displays its RAP as "100B". The scammer then trades this "100B" pet for your real Huge Pet.</li>
                </ol>
                <p><strong>Rule #1:</strong> Never trust RAP on low-tier or random pets. Only trust RAP on high-volume items like Huge Hell Rocks or Eggs.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Demand vs. Value</h2>
                <p>A pet might be "Rare" (only 100 exist), but if nobody wants it, it has Low Demand.</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>High Demand:</strong> Huge Pets, Titanic Pets, Exclusive Eggs. (Easy to sell for raw gems).</li>
                    <li><strong>Low Demand:</strong> Random Stat Pets, obscure shinies, old event pets. (Hard to sell, even if fair price).</li>
                </ul>
                <p>Always trade your Low Demand items for High Demand items, even if you lose a little "Paper Value". Liquidity is king.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Flipping Strategy</h2>
                <p>Flipping is buying low and selling high. To do this, you must account for the <strong>1% Booth Tax</strong>.</p>
                <p>If you buy a pet for 10b and sell for 10.1b, you lose money because the tax takes 100m+. You need to aim for at least 10-20% profit margins to be safe.</p>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Trading is the fastest way to get rich in Pet Simulator X, but it is risky. Use this calculator to sanity-check potential trades. If an offer looks too good to be true (e.g. someone offering 500B RAP for your 50B Pet), it is a manipulated scam 100% of the time. Decline immediately.</p>
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
