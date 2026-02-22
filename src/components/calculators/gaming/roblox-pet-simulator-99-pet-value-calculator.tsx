import Link from 'next/link';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxPS99ValueCalcInteractive from './roblox-pet-simulator-99-pet-value-calculator-interactive';

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator X Trading Value Calculator', slug: 'roblox-pet-simulator-x-trading-value-calculator', description: 'Similar logic for PSX.' },
    { name: '(Roblox) Adopt Me Collection Value Estimator', slug: 'roblox-adopt-me-collection-value-estimator', description: 'Estimate inventory value.' },
    { name: '(Roblox) Inventory Value Estimator', slug: 'roblox-inventory-value-estimator', description: 'General Roblox item values.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Is VIP in PS99 worth it?' },
    { name: '(Roblox) Trade Tax Calculator', slug: 'roblox-trade-tax-calculator', description: 'Calculate tax loss.' },
];

const faqs = [
    {
        question: "How is PS99 different from PSX economy?",
        answer: "Pet Simulator 99 has a more deflationary economy at times due to stronger diamond sinks (Upgrades, Enchants, Machines). However, inflation still happens during update droughts when billions of gems are farmed with nothing to buy.",
    },
    {
        question: "What items are 'Inflation Proof'?",
        answer: "Items that are strictly limited in quantity (Titanics, Serial Numbered Huges, Exclusive Eggs) are inflation-proof. They will always rise in gem price as gems become less valuable.",
    },
    {
        question: "Why do huge pets drop in value?",
        answer: "When a new 'Active Huge' is added to the rotation (hatchable from the best egg), the supply of Huges increases, causing the price of low-tier cheek huges (like Rocks/Computers) to drop.",
    },
    {
        question: "Does RAP update instantly?",
        answer: "No. RAP updates every few hours based on batches of sales. In a fast-moving market (like right after an update drops), RAP is often wrong. Trust the 'Live Auction' prices more.",
    },
    {
        question: "Is it better to hold Gems or Pets?",
        answer: "In an inflationary economy (most of the time), holding Pets is better. If you hold 1 Billion gems for a month, it might only buy you 0.8 Huge Pets later. If you bought the Huge immediately, you still have 1 Huge.",
    },
    {
        question: "What is 'Deflation'?",
        answer: "Deflation is when prices drop. This happens when a new expensive update comes out (like Titanic Gifts) and everyone sells their pets to get raw gems to buy the new thing. Cash (Gems) is King during deflation.",
    },
    {
        question: "What are 'Exclusives'?",
        answer: "Exclusives are pets that were only available for Robux (or limited events). They scale off your best pet. They are generally good mid-tier investments for players who can't afford Huges yet.",
    },
];

const baseUrl = 'https://mycalculating.com/roblox-pet-simulator-99-pet-value-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            name: '(Roblox) Pet Simulator 99 Value Calculator',
            applicationCategory: 'GameApplication',
            operatingSystem: 'Any',
            description: 'Track the value of your Pet Simulator 99 portfolio. Analyze inflation trends and decide when to buy or sell pets.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
            '@type': 'Article',
            headline: 'Pet Simulator 99 Economy Guide: Inflation vs Deflation',
            description: 'Learn how to protect your wealth in PS99. Understand how inflation affects Huge Pet values and when to liquidate for gems.',
            author: {
                '@type': 'Organization',
                name: 'MegaCalc Hub Gaming Team',
            },
            datePublished: '2023-12-01T00:00:00Z',
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

export default function RobloxPS99ValueCalc() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <Card className="border-l-4 border-l-teal-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Briefcase className="h-6 w-6 text-teal-500" />
                        PS99 Portfolio Tracker
                    </CardTitle>
                    <CardDescription>
                        Pet Simulator 99 Value Analyzer. Track Inflation & Investments.
                    </CardDescription>
                </CardHeader>
            </Card>

            <RobloxPS99ValueCalcInteractive />

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
            >
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Pet Simulator 99 Value Guide: Inflation & Economy</h1>
                <p className="text-lg italic text-muted-foreground">In PS99, your Net Worth is more important than your Pet Power. Learn to grow your wealth.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The Inflation Cycle</h2>
                <p><em>Pet Simulator 99</em> has a dynamic economy driven by one resource: <strong>Diamonds</strong>.</p>
                <div className="bg-muted p-4 border-l-4 border-red-500 my-4">
                    <h3 className="font-bold text-red-700">Inflation (Price Rise)</h3>
                    <p>When players farm billions of gems (via VIP, Last Area, Alts) but there are no good updates or "Gem Sinks" to spend them on, gems become worthless. Result: <strong>Pet Prices Rise</strong> because everyone has too much cash.</p>
                </div>
                <div className="bg-muted p-4 border-l-4 border-green-500 my-4">
                    <h3 className="font-bold text-green-700">Deflation (Price Drop)</h3>
                    <p>When a new massive update drops (e.g., new Clan Battle, new Titanic Egg), players need gems desperately. They sell their Huges for cheap to get cash. Result: <strong>Pet Prices Crash</strong>.</p>
                </div>

                <h2 className="text-2xl font-bold text-foreground pt-8">Portfolio Strategy: The "Hold" Rule</h2>
                <p><strong>When to buy?</strong> Buy massive deflation events. When everyone is panic selling Huge Hell Rocks for 5m, buy 50 of them. </p>
                <p><strong>When to sell?</strong> Sell during Hyperinflation. When that same Huge Hell Rock is trading for 15m because nobody knows what to do with their gems, sell them and sit on the cash until the next crash.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Diversification</h2>
                <p>Do not put all your net worth into one pet (unless it's a Titanic). Titanics are illiquid assets. They are hard to sell quickly without losing value.</p>
                <p>Instead, hold a portfolio of high-demand, mid-tier assets:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Exclusive Eggs:</strong> Always rise long-term. Safest investment.</li>
                    <li><strong>Generic Huges:</strong> The "Dollar Bill" of PS99. Highly liquid.</li>
                    <li><strong>Charm Stones:</strong> Good for small flips, but risky during nerf updates.</li>
                </ul>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Understanding inflation is the key to wealth in Pet Simulator 99. Use this calculator to track the total value of your assets. If the calculator predicts 'Hyperinflation', convert your diamonds to pets immediately to protect your purchasing power.</p>
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
