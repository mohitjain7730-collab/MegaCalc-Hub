import Link from 'next/link';
import { ShieldAlert, BookOpen, Siren } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RobloxAdoptMeTrustTradeInteractive from './roblox-adopt-me-trust-trade-safety-calculator-interactive';

const relatedCalculators = [
    { name: '(Roblox) Adopt Me Trade Win/Loss Calculator', slug: 'roblox-adopt-me-trade-win-loss-calculator', description: 'Check values for legitimate trades.' },
    { name: '(Roblox) Pet Dupe Value Calculator', slug: 'roblox-pet-dupe-value-calculator', description: 'Is that high-tier pet duped?' },
    { name: '(Roblox) Adopt Me Bucks to Robux Converter', slug: 'roblox-adopt-me-bucks-to-robux-converter', description: 'Understand the real value of Robux offers.' },
    { name: '(Roblox) Adopt Me Legendary Pet Probability Calculator', slug: 'roblox-adopt-me-legendary-pet-probability-calculator', description: 'Calculate hatch odds.' },
    { name: '(Roblox) Trade Tax Calculator', slug: 'roblox-trade-tax-calculator', description: 'Calculate fees on cross-platform sales.' },
];

const faqs = [
    {
        question: "What is a Trust Trade?",
        answer: "A Trust Trade is a scam where one player asks another to give them an item for free, promising to give it back (or give something better) afterwards to 'prove trust'. 99.9% of the time, they will simply leave the game with your item.",
    },
    {
        question: "Is 'Fail Trading' real?",
        answer: "No. Scammers claim that if you put in a pet and food, and accept, the trade will 'fail' and duplicate the item. This is a lie. The trade will succeed, and they will take your pet. Do not test it.",
    },
    {
        question: "Can I get banned for Cross-Trading?",
        answer: "Yes. Cross-Trading (trading Adopt Me pets for Robux, Fortnite V-Bucks, or real money) is a direct violation of Roblox Terms of Service. If you are caught, your account will be banned and your inventory wiped.",
    },
    {
        question: "How do I spot a fake YouTuber?",
        answer: "Fake YouTubers have names like 'DreamCraft_Official123' or 'NotLeahAshe_Real'. They will ask you to trust trade for a video thumbnail. Real YouTubers never ask fans for free items for videos.",
    },
    {
        question: "What is the 'Add After' scam?",
        answer: "When a trade is too big (more than 18 items), scammers say 'Give me the good pets first, and I'll add the rest in the second trade'. They never do the second trade. Always use a middleman service from a trusted site if absolutely necessary, but generally, avoid '9+' trades.",
    },
    {
        question: "Can Adopt Me Support get my pets back?",
        answer: "Adopt Me Support generally does NOT return pets lost to scams like Trust Trades, because you willingly clicked 'Accept'. They only restore pets if verified hacking/account theft occurred. You are responsible for your own trades.",
    },
    {
        question: "Is the 'Pick a Door' game safe?",
        answer: "Usually no. Scammers build a house with 'Door 1' and 'Door 2'. You pay a pet to enter. One door has a prize, one has nothing. Often, both doors have nothing, or they kick you after you pay.",
    },
];

const steps = [
    'Identify the exact "Type" of trade being suggested (e.g., Trust Trade).',
    'Select who the trading partner is (Stranger vs Friend).',
    'Input what they are promising you (Robux, Codes, etc.).',
    'Get a Safety Verdict. If it says RED, block the user.',
];

const baseUrl = 'https://mycalculating.com/roblox-adopt-me-trust-trade-safety-calculator';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Adopt Me Trust Trade Safety Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Roblox Adopt Me Trust Trade Safety Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Check if an Adopt Me trade is a scam. Analyze Trust Trades, Cross Trades, and Fail Trades for safety.',
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

export default function RobloxAdoptMeTrustTrade() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <Card className="border-l-4 border-l-red-600 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        Adopt Me Trust Trade Analyzer
                    </CardTitle>
                    <CardDescription>
                        Is it a scam? Check the safety rating before you accept.
                    </CardDescription>
                </CardHeader>
            </Card>

            <RobloxAdoptMeTrustTradeInteractive />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <BookOpen className="h-5 w-5 text-red-500" />
                            Understanding the Inputs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Trade Pattern:</strong> Select the exact scenario being proposed. "Trust Trade" implies giving items with no guarantee. "Cross Trade" involves outside items.</p>
                        <p><strong>Partner & Promise:</strong> Who is asking? What are they offering? High-value promises (like Robux) from Strangers are red flags.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Siren className="h-5 w-5 text-red-500" />
                            The Logic Used
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>This calculator uses a <strong>Cumulative Risk Score</strong> model. Every red flag (e.g. "Add After", "Stranger", "Robux Promised") adds points. Any score over 70 is deemed a "Critical Risk".</p>
                    </CardContent>
                </Card>
            </div>

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="The Ultimate Guide to Avoiding Scams in Adopt Me" />
                <meta itemProp="description" content="Learn how to spot Trust Trades, Fail Trades, and Fake YouTubers. Protect your Adopt Me inventory from scams." />
                <meta itemProp="keywords" content="Adopt Me Trust Trade Scam, Fail Trade Glitch, Avoid Scams Roblox, Cross Trading Risks" />
                <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
                <meta itemProp="datePublished" content="2025-01-25" />
                <meta itemProp="url" content={baseUrl} />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Avoiding Scams in Adopt Me</h1>
                <p className="text-lg italic text-muted-foreground">Your pets are valuable. Scammers want them. Here is how to keep them safe.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">The #1 Rule of Adopt Me Safety</h2>
                <p>The golden rule is simpler than you think: <strong>Never give an item for free expecting something back later.</strong></p>
                <p>90% of scams (Trust, Borrowing, Duplicating, Add After) rely on you giving an item first. If you refuse to do any trade that isn't done in a SINGLE trade window, you become immune to almost every scam in the game.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">Anatomy of a "Trust Trade"</h2>
                <p>The "Trust Trade" is the oldest trick in the book. A scammer will say:</p>
                <blockquote className="border-l-4 border-primary pl-4 my-4 italic">
                    "Trust trade me your Unicorn to prove you aren't a scammer. I'll give it back and give you a free Shadow Dragon!"
                </blockquote>
                <p><strong>The Psychology:</strong> They appeal to your greed (Free Shadow Dragon) and your ego (Proving you are "good").</p>
                <p><strong>The Reality:</strong> As soon as you give them the Unicorn, they leave the server and block you. There is no Shadow Dragon. It was never real.</p>
                <p><strong>The Formula:</strong> <code>Your Greed + Their Lie = You Lose Pet</code></p>

                <h2 className="text-2xl font-bold text-foreground pt-8">The "Fail Trade" Myth</h2>
                <p>Scammers will tell you to put your best pet in, plus a food item, and accept. They claim the trade will "fail" because the food is glitched, and your pet will be duplicated.</p>
                <p><strong>Why it works:</strong> It sounds like a secret cheat code.</p>
                <p><strong>Why it's fake:</strong> Adopt Me developers patch glitches instantly. The trade UI works perfectly. You accept, they get your pet. The food does not stop the trade. Do not test it.</p>

                <h2 className="text-2xl font-bold text-foreground pt-8">The "Fake YouTuber" Setup</h2>
                <p>You see someone with a display name like "CookieSwirlC_Fan" or even "Official_Admin". They claim they are filming a video and need you to give them a pet for the thumbnail.</p>
                <p><strong>Checklist to spot fakes:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Star Creator Badge:</strong> Real YouTubers have a special Star icon next to their name in the leaderboard. If they don't have it, they are fake.</li>
                    <li><strong>Chat Color:</strong> Admins and Developers have special chat text colors (Blue or Orange).</li>
                    <li><strong>Behavior:</strong> Real influencers give items <em>away</em>. They never ask fans to give <em>them</em> items.</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground pt-8">Cross-Trading Dangers</h2>
                <p>Cross-trading is trading Adopt Me pets for Robux, Gift Cards, or items in other games (like Murder Mystery 2).</p>
                <p><strong>The Risk:</strong></p>
                <ol className="list-decimal pl-6 space-y-2">
                    <li>It allows you to get scammed with zero recourse (Roblox cannot track external deals).</li>
                    <li>It is a bannable offense. If the moderation bot detects chat logs discussing "Paypal" or "Robux" linked to a trade, you will be auto-banned.</li>
                </ol>

                <div className="bg-muted p-6 rounded-xl mt-8">
                    <h3 className="text-xl font-bold mb-2">Summary</h3>
                    <p>Scammers rely on you ignoring your instinct because of greed (the promise of free items). If a trade sounds too good to be true, it is a scam. Always trade normally, using the official 9-slot trade window, and never click links sent in chat.</p>
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
