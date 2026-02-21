import Link from 'next/link';
import { Gamepad2, Trophy, Clock, Target, ArrowRight, TrendingUp, BarChart2, ShieldCheck, Shield, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ValorantRankProgressionInteractive from './valorant-rank-progression-interactive';

const ranks = [
    { id: 'iron', label: 'Iron', baseRR: 0 },
    { id: 'bronze', label: 'Bronze', baseRR: 300 },
    { id: 'silver', label: 'Silver', baseRR: 600 },
    { id: 'gold', label: 'Gold', baseRR: 900 },
    { id: 'platinum', label: 'Platinum', baseRR: 1200 },
    { id: 'diamond', label: 'Diamond', baseRR: 1500 },
    { id: 'ascendant', label: 'Ascendant', baseRR: 1800 },
    { id: 'immortal', label: 'Immortal', baseRR: 2100 },
    { id: 'radiant', label: 'Radiant', baseRR: 2500 }
];

const steps = [
    'Select your current Rank and Tier (e.g., Silver 2).',
    'Input your current RR (0-99).',
    'Choose your ambitious Target Rank (e.g., Ascendant).',
    'Adjust your Win Rate slider (be realistic! 50-55% is standard).',
    'Review the "Total Games" calculation to see the grind ahead.',
];

const relatedCalculators = [
    {
        name: 'Valorant RR Predictor',
        slug: 'valorant-rr-predictor',
        description: 'Predict your Valorant Rank Rating (RR) gain or loss per match based on performance and outcome.',
    },
    {
        name: 'Fortnite Victory Royale Probability Estimator',
        slug: 'fortnite-victory-royale-probability-estimator',
        description: 'Estimate your probability of winning a Victory Royale based on current placement and skill.',
    },
    {
        name: 'Minecraft Villager Trade Tracker',
        slug: 'minecraft-villager-trade-tracker',
        description: 'Track villager trades and calculate emerald profit per trade based on trade costs.',
    },
    {
        name: 'Roblox Trading Profit Analyzer',
        slug: 'roblox-trading-profit-analyzer',
        description: 'Analyze trading profits by comparing buy and sell prices and fees.',
    },
];

const faqs = [
    {
        question: 'How is "Net RR" calculated?',
        answer: 'Net RR is the average amount of rank rating you gain per match played, factoring in both wins and losses. Formula: (Win% × WinRR) - (Loss% × LossRR). If you win 50% of games gaining 20 and losing 20, your Net RR is 0 (you will not climb).',
    },
    {
        question: 'Why does the result say "Infinity" games?',
        answer: 'If your Win Rate is too low or your Loss Penalty is too high, your "Net RR" becomes negative. This means statistically, you are de-ranking. You must increase your Win Rate or MMR (Win/Loss Variance) to climb. It is mathematically impossible to reach a higher rank with negative expected value.',
    },
    {
        question: 'What is a good Win Rate for climbing?',
        answer: '51-55% is a healthy climbing rate. 60%+ is "smurfing" territory or very rapid climbing. Anything below 50% usually relies on having very high MMR (gaining 25, losing 15) to climb. A 52% win rate is standard for consistent progression.',
    },
    {
        question: 'How long does a Valorant match take?',
        answer: 'The average competitive match lasts 30-40 minutes including agent select and overtime. This calculator assumes an average of 35 minutes per game. Ranking up requires hundreds of hours; it is a marathon, not a sprint.',
    },
    {
        question: 'Does this account for double rank-ups?',
        answer: 'No, this calculator assumes a linear progression. Double rank-ups happen when your MMR is significantly higher than your rank (e.g., Gold 1 climbing to Gold 3 instantly), which would speed up this process considerably.',
    },
    {
        question: 'How does a "Loss Streak" affect this?',
        answer: 'Loss streaks lower your MMR, which reduces your future specific RR gains. However, this calculator uses averages. In reality, a loss streak might make the climb slightly longer than predicted because you have to repair your MMR before you start climbing optimally again.',
    },
    {
        question: 'What is the "Hidden MMR" impact?',
        answer: 'Your Hidden MMR determines your +/- RR. If your MMR is high, you might gain +25 and lose -15. If it is low, you gain +15 and lose -25. Adjust the "RR Gain/Win" inputs in this calculator to reflect your actual current MMR state for better accuracy.',
    }
];

const baseUrl = 'https://mycalculating.com/valorant-rank-progression';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/category/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Valorant Rank Progression Calculator', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Valorant Rank Progression Calculator',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Calculate how many games of Valorant you need to reach your target rank based on win rate and RR gains.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
    ],
};

export default function ValorantRankProgression() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <ValorantRankProgressionInteractive />

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="The Math Behind Climbing: Valorant Rank Progression Guide" />
                <meta itemProp="description" content="Calculate exactly how many games you need to reach your dream rank in Valorant. Understanding Net RR and the importance of win rate." />
                <meta itemProp="keywords" content="Valorant Rank Calculator, Valorant Grind, Games to Immortal, Rank Progression" />
                <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
                <meta itemProp="datePublished" content="2025-01-25" />
                <meta itemProp="url" content={baseUrl} />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Math Behind Climbing: Valorant Rank Progression Guide</h1>
                <p className="text-lg italic text-muted-foreground">Why a 51% win rate is enough to climb, but 55% changes everything. The mathematical reality of reaching Immortal.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#mathematics" className="hover:underline">The Mathematics of the Grind</a></li>
                    <li><a href="#winrate-impact" className="hover:underline">Win Rate vs. Volume (The Exponential Curve)</a></li>
                    <li><a href="#variance" className="hover:underline">Variance and Streaks (The "Losers Queue" Myth)</a></li>
                    <li><a href="#strategy" className="hover:underline">Optimizing Your Climb</a></li>
                    <li><a href="#mental" className="hover:underline">The Mental Game: Handling Tilt</a></li>
                    <li><a href="#distribution" className="hover:underline">Rank Distribution Realities</a></li>
                    <li><a href="#resets" className="hover:underline">Episode Resets and Their Impact</a></li>
                </ul>
                <hr className="my-6" />

                <h2 id="mathematics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mathematics of the Grind</h2>
                <p>Ranking up in Valorant is fundamentally a function of <strong>Net RR</strong> over time. Many players believe that if they simply "play enough," they will rank up. This is statistically false.</p>
                <p>Your Net RR is calculated as: <code>(Win % × Avg Win RR) - (Loss % × Avg Loss RR)</code>.</p>
                <p>If you lose as much RR as you gain (e.g., +20 / -20) and have a 50% win rate, your Net RR is exactly 0. You will stay in Silver 2 forever, regardless of whether you play 10 games or 1,000 games. To climb, you must break this equilibrium by either (a) increasing your Win Rate above 50%, or (b) increasing your MMR so you gain more per win.</p>

                <h2 id="winrate-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Win Rate vs. Volume (The Exponential Curve)</h2>
                <p>Small improvements in Win Rate have massive, exponential impacts on the speed of your climb. Consider a player trying to gain 400 RR (climbing from Silver to Platinum):</p>
                <ul className="list-disc pl-6 space-y-2 my-4">
                    <li><strong>51% Win Rate (The Grinder):</strong> With balanced gains (+20/-20), you net 0.4 RR per game. It will take <strong>1,000 games</strong> to reach your goal.</li>
                    <li><strong>53% Win Rate (The Improver):</strong> You net 1.2 RR per game. It takes <strong>333 games</strong>. You just saved 667 hours of gameplay by winning 2 more games per 100.</li>
                    <li><strong>55% Win Rate (The Climber):</strong> You net 2.0 RR per game. It takes <strong>200 games</strong>. The grind is 5x faster than at 51%.</li>
                    <li><strong>60% Win Rate (The Smurf):</strong> You net 4.0 RR per game. It takes <strong>100 games</strong>.</li>
                </ul>
                <p><strong>The takeaway:</strong> Stop spamming games on autopilot. Playing 3 games at peak focus (55% WR chance) is infinitely more valuable than spamming 8 games while tired (50% WR chance).</p>

                <h2 id="variance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Variance and Streaks (The "Losers Queue" Myth)</h2>
                <p>A 55% win rate does not mean you win 5.5 games out of every 10 consistently. True randomness involves "clumping," or streaks.</p>
                <p>Over a 100-game sample with a 55% win rate, there is a statistical certainty that you will experience a <strong>5-game losing streak</strong>. Most players interpret this as "The system is rigged" or "Losers Queue." It isn't. It is standard variance.</p>
                <p>The "Expected Losses" figure in our calculator is crucial. If you are projected to play 300 games to reach Immortal, you <em>will</em> lose approximately 135 of them. Accepting that you are going to lose 135 games—and that some of them will be 13-0 stomps or have AFK teammates—is the key to mental resilience.</p>

                <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Optimizing Your Climb</h2>
                <h3 className="text-xl font-semibold mt-4">1. Duo Queue vs Solo Queue</h3>
                <p>Solo queue is heavy variation. You might get a Radiant smurf or a thrower. Duo queueing stabilizes this variance. By guaranteeing one reliable teammate, you control 20% of your team's variables. Statistical analysis shows Duos typically have a 2-3% higher win rate than pure Solos.</p>
                <h3 className="text-xl font-semibold mt-4">2. The "Two Loss Rule"</h3>
                <p>If you lose two games in a row, <strong>stop playing Ranked</strong>. Studies on cognitive performance show that frustration (tilt) lowers reaction time and decision-making quality. Continuing to play while trying to "earn back" your lost RR usually leads to a spiral.</p>

                <h2 id="mental" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mental Game: Handling Tilt</h2>
                <p>Tilt is not just anger; it is an optimized state of failure. When tilted, you wide-swing more, you communicate less, and you give up rounds earlier.</p>
                <p>The calculator measures "Time Estimate" in hours. This is a long-term project. Ranking up is like going to the gym; you don't get fit in one day, and you don't hit Radiant in one night. View your RR as a stock market graph: it will have dips, but as long as the long-term trend is up, you are succeeding.</p>

                <h2 id="distribution" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rank Distribution Realities</h2>
                <p>Understanding where you sit is important. As of recent episodes:</p>
                <ul className="list-disc pl-6 space-y-2 my-4">
                    <li><strong>Iron - Silver:</strong> Contains ~50% of the player base.</li>
                    <li><strong>Gold - Platinum:</strong> The "average" competitive player. Top ~30%.</li>
                    <li><strong>Diamond - Ascendant:</strong> High elo. Top ~10%.</li>
                    <li><strong>Immortal+:</strong> The elite. Top ~1% or less.</li>
                </ul>
                <p>Moving from Silver to Gold is statistically easier than moving from Ascendant 1 to Ascendant 2. The skill gap widens exponentially at the top.</p>

                <h2 id="resets" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Episode Resets and Their Impact</h2>
                <p>At the start of every Episode (every ~6 months), everyone performs a "Hard Reset." Your visible rank will drop significantly (often 3-5 tiers), but your MMR stays roughly the same.</p>
                <p>This means your first 50 games of a new Episode will have massive RR gains (+25/-10) as the system tries to push you back to your old rank. Use this period wisely! High win rates during the start of an Episode are worth "double" due to this volatility.</p>

                <hr className="my-8" />
                <p className="text-sm"><em>Note: This calculator assumes a standard competitive environment. Double rank-ups, smurf detection bonuses, and severe MMR disparities can alter the timeline significantly.</em></p>
            </section>

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

            <Card>
                <CardHeader>
                    <CardTitle>Steps</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                        {steps.map((step) => (
                            <li key={step}>{step}</li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

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
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>The Valorant Rank Progression Calculator estimates the total number of competitive matches required to reach a specific target rank. By inputting Current Rank, Target Rank, Win Rate, and Average RR Gains/Losses, users can see the "Total Games" count and "Estimated Hours" required.</p>
                    <p>The tool highlights the critical relationship between Win Rate and climbing speed—improving win rate by just a few percentage points typically reduces the required grind time exponentially. It serves as a reality check for players setting long-term ranking goals.</p>
                </CardContent>
            </Card>
        </div>
    );
}
