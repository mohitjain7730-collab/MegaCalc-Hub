import Link from 'next/link';
import { Egg, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxPSXHatchCalcInteractive from './roblox-pet-simulator-x-hatch-probability-calculator-interactive';

const relatedCalculators = [
    { name: '(Roblox) Pet Simulator 99 Pet Value Calculator', slug: 'roblox-pet-simulator-99-pet-value-calculator', description: 'Did you hatch it? Check value.' },
    { name: '(Roblox) Adopt Me Legendary Pet Probability Calculator', slug: 'roblox-adopt-me-legendary-pet-probability-calculator', description: 'Compare odds with Adopt Me.' },
    { name: '(Roblox) Gamepass ROI Calculator', slug: 'roblox-gamepass-roi-calculator', description: 'Compare Luck Gamepass cost.' },
    { name: '(Roblox) Pet Simulator X Mastery Calculator', slug: 'roblox-pet-simulator-x-mastery-calculator', description: 'Level up Egg Mastery.' },
    { name: '(Roblox) Egg Hatch Odds Simulator', slug: 'roblox-egg-hatch-odds-simulator', description: 'Generic simulator.' },
];

const faqs = [
    {
        question: "Does 'Ultra Lucky' work on Huge Pets?",
        answer: "Generally, no. In Pet Simulator X, most Luck Gamepasses explicitly state they affect 'Base Egg Odds' (Rares, Epics, Legendaries, Mythicals). Huge Pets usually have a fixed server-side roll that is unaffected by your personal luck passes, unless an event specifically says '2x Huge Chance'.",
    },
    {
        question: "What is 'Pity System'?",
        answer: "Some eggs have a Pity System (e.g., hatch 5,000 eggs to guarantee a Huge). However, this is rare and usually only applies to specific Event Eggs or Exclusive Eggs (Robux eggs). Standard coins eggs do not have a hard pity for Huges.",
    },
    {
        question: "Is Triple Hatch worth it?",
        answer: "Yes. Triple Hatch (or Octuple Hatch) literally multiplies your speed by 3x or 8x. Since Huge Pets are a numbers game (quantity of hatches), hatching 8 eggs at once gives you 8x better chances per minute than hatching 1.",
    },
    {
        question: "How accurate are the '1 in X' odds?",
        answer: "The developers rarely publish exact numbers. The community estimates odds based on millions of hatches. A Base Huge is typically estimated at 1 in 10,000,000 or worse depending on the egg.",
    },
    {
        question: "What is 'Server Luck'?",
        answer: "Server Luck (often from Boosts) applies a multiplier to everyone in the server. This often DOES STACK with personal luck and event luck.",
    },
    {
        question: "What is the 'Shiny' chance?",
        answer: "Shiny chance is separate from rarity. It's roughly 1 in 500 to 1 in 1000 for any pet to spawn as Shiny. The 'Shiny Hunter' gamepass significantly improves this.",
    },
    {
        question: "Can I hatch a Titanic F2P?",
        answer: "Extremely unlikely. Titanics are almost exclusively from Exclusive Eggs (Robux) or Merchandise Codes. Very rarely, an event might offer a hatchable Titanic with odds like 1 in a Billion.",
    },
];

const baseUrl = 'https://mycalculating.com/category/gaming/roblox-pet-simulator-x-hatch-probability-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'SoftwareApplication',
            name: '(Roblox) Pet Simulator X Hatch Probability Calculator',
            applicationCategory: 'GameApplication',
            operatingSystem: 'Any',
            description: 'Calculate your odds of hatching a Huge or Titanic pet in Pet Simulator X.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
            '@type': 'Article',
            headline: 'Pet Simulator X Hatch Probability: The Truth About Huges',
            description: 'Determine your real chances of hatching a Huge Pet in Pet Simulator X. Account for luck gamepasses, hatch speed, and AFK time.',
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

export default function RobloxPSXHatchCalc() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <Card className="border-l-4 border-l-pink-500 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Egg className="h-6 w-6 text-pink-500" />
                        Pet Simulator X Hatch Probability
                    </CardTitle>
                    <CardDescription>
                        Will you hatch the Huge? Calculate your real odds.
                    </CardDescription>
                </CardHeader>
            </Card>

            <RobloxPSXHatchCalcInteractive />

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
            >
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Pet Simulator X Hatching Guide: Odds, Mythicals, & Huges</h1>
                <p className="text-lg italic text-muted-foreground">Is it luck, or is it just math? Here is the truth about hatching Huges.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The "Gambler's Fallacy" in PSX</h2>
                <p>Many players think: "I opened 9,999 eggs and didn't get a huge. The next one MUST be it!"</p>
                <p><strong>This is false.</strong> In <em>Pet Simulator X</em>, every single egg hatch is an independent event (unless there is a pity system, which is rare). If the odds are 1 in 1,000,000, your 1,000,000th egg still has exactly a 1 in 1,000,000 chance.</p>
                <p>This calculator uses the binomial probability formula to tell you your cummulative chance of seeing at least one success over a long AFK session.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Does Luck Work on Huge Pets?</h2>
                <p><strong>Generally No.</strong> The developers of PSX (BIG Games) have historically separated "Luck" stats into two buckets:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Egg Luck:</strong> Affected by "Lucky" and "Super Lucky" passes. Increases chance of Legendaries, Mythicals, and Secrets.</li>
                    <li><strong>Huge Luck:</strong> Usually Fixed. Only affected by specific "Huge Hunter" gamepasses or server-wide Huge Luck events. Buying normal luck does NOT help you hatch a Huge Hell Rock.</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground pt-8">The Power of Volume (Speed)</h2>
                <p>Since you cannot easily change the Odds (p), the only variable you control is Volume (n). </p>
                <p><strong>Octuple Hatch:</strong> Hatching 8 eggs at once serves as an 8x multiplier to your effective Huge rate. It is arguably the most powerful gamepass for Huge Hunters, far better than Lucky.</p>
                <p><strong>Auto-Hatch:</strong> Reducing the delay between hatches by even 0.5 seconds adds up to thousands of extra attempts over a 24-hour AFK session.</p>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Hatching a Huge Pet is a marathon, not a sprint. By understanding that odds are independent and focusing on maximizing your hatch speed (Volume), you significantly increase your chances of success over time.</p>
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
