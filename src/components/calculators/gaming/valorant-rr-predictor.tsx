import Link from 'next/link';
import { Gamepad2, Zap, Target, Activity, Shield, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ValorantRRPredictorInteractive from './valorant-rr-predictor-interactive';

const steps = [
    'Select your match outcome (Win, Loss, or Draw).',
    'Choose your current rank (factors into MMR convergence).',
    'Select your individual performance (MVP, Top Frag, etc.).',
    'Set the round difference (1-13). How one-sided was the match?',
    'Click "Predict RR Change" to see your estimated gains or losses.',
];

const relatedCalculators = [
    {
        name: 'Valorant Rank Progression Calculator',
        slug: 'valorant-rank-progression',
        description: 'Calculate how many games of Valorant you need to reach your target rank based on win rate and RR gains.',
    },
    {
        name: 'Fortnite Victory Royale Probability Estimator',
        slug: 'fortnite-victory-royale-probability-estimator',
        description: 'Estimate your probability of winning a Victory Royale based on current placement, player count, skill level, and match factors.',
    },
    {
        name: 'Fortnite DPS Calculator',
        slug: 'fortnite-dps-calculator',
        description: 'Calculate damage per second (DPS) for Fortnite weapons based on damage, fire rate, and weapon stats.',
    },
    {
        name: 'Minecraft Farm Yield Calculator',
        slug: 'minecraft-farm-yield-calculator',
        description: 'Calculate crop yields, resource production rates, and farm efficiency for Minecraft farms.',
    },
];

const faqs = [
    {
        question: 'How is Valorant RR calculated?',
        answer: 'Valorant Rank Rating (RR) is calculated based on match result (win/loss), round differential, and individual performance relative to your hidden MMR. If your MMR is higher than your rank, you gain more RR on wins and lose less on losses.',
    },
    {
        question: 'How much RR do I get for a win?',
        answer: 'A standard win typically awards 10-50 RR. However, most balanced matches award between 17-25 RR. High performance and large round differences push this higher.',
    },
    {
        question: 'Does individual performance matter?',
        answer: 'Yes, especially in lower ranks (Iron to Platinum). In Diamond and above, winning rounds becomes the dominant factor, though performance still affects "Performance Bonus" stars.',
    },
    {
        question: 'What is a Performance Bonus?',
        answer: 'If you play exceptionally well compared to what the system expects (based on your MMR), you may receive a +2 to +10 star bonus on top of your win RR.',
    },
    {
        question: 'Why do I lose more RR than I gain?',
        answer: 'This usually happens when your hidden MMR is lower than your current visible rank. The system is trying to push you down to where it thinks you belong. To fix this, you must consistently win to raise your MMR.',
    },
    {
        question: 'Does round difference matter?',
        answer: 'Yes. Winning 13-0 gives significantly more RR than winning 13-11. Every round you win adds to your gains, and every round you lose softens the loss penalty.',
    },
];

const baseUrl = 'https://mycalculating.com/valorant-rr-predictor';

const schemaMarkup = {
    '@context': 'https://schema.org',
    '@graph': [
        {
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://mycalculating.com' },
                { '@type': 'ListItem', position: 2, name: 'Gaming', item: 'https://mycalculating.com/gaming' },
                { '@type': 'ListItem', position: 3, name: 'Valorant RR Predictor', item: baseUrl },
            ],
        },
        {
            '@type': 'SoftwareApplication',
            name: 'Valorant RR Predictor',
            applicationCategory: 'Calculator',
            operatingSystem: 'Web Browser',
            description: 'Predict your Valorant Rank Rating (RR) gain or loss per match based on performance, match outcome, and current rank.',
            url: baseUrl,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
    ],
};

export default function ValorantRRPredictor() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <ValorantRRPredictorInteractive />

            <section
                className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg"
                itemScope
                itemType="https://schema.org/Article"
            >
                <meta itemProp="name" content="The Ultimate Guide to Valorant Ranked Rating (RR): How It Works" />
                <meta itemProp="description" content="A comprehensive deep dive into Valorant's RR system, hidden MMR, performance bonuses, and strategies for climbing from Iron to Radiant." />
                <meta itemProp="keywords" content="Valorant RR, Rank Rating, MMR, Elo, Calculator, Valorant Ranking System, Climbing Guide, Performance Bonus" />
                <meta itemProp="author" content="MegaCalc Hub Gaming Team" />
                <meta itemProp="datePublished" content="2025-01-25" />
                <meta itemProp="url" content={baseUrl} />

                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Valorant Ranked Rating (RR): How It Works</h1>
                <p className="text-lg italic text-muted-foreground">Everything you ever wanted to know about how Valorant decides your rank, from hidden MMR mechanics to the myth of 'Losers Queue'.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#introduction" className="hover:underline">Introduction: The Frustration of +18 / -24</a></li>
                    <li><a href="#core-mechanics" className="hover:underline">The Three Pillars of RR</a></li>
                    <li><a href="#round-differential" className="hover:underline">Why 13-0 Matters (Round Differential)</a></li>
                    <li><a href="#hidden-mmr" className="hover:underline">The Hidden MMR System (Convergence)</a></li>
                    <li><a href="#rank-tiers" className="hover:underline">How RR Changes by Rank (Iron vs. Immortal)</a></li>
                    <li><a href="#performance-bonus" className="hover:underline">Unlocking the Performance Star</a></li>
                    <li><a href="#roles" className="hover:underline">Does Playing Support Hurt Your Rank?</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Maximize RR Gains</a></li>
                </ul>
                <hr className="my-6" />

                <h2 id="introduction" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Introduction: The Frustration of +18 / -24</h2>
                <p>If you have played Valorant Competitive for any length of time, you have likely experienced the pain of winning three hard-fought games only to lose all your progress in one or two losses. You see +16, +18, +17, and then suddenly -28. It feels unfair. It feels broken.</p>
                <p>However, the Ranked Rating (RR) system in Valorant is actually a highly sophisticated engine designed to combat "lucky win streaks" and test for consistency. Unlike simple Elo systems of the past, Valorant uses a dual-rating system comprising your visible Rank (e.g., Gold 2) and your hidden Matchmaking Rating (MMR). Understanding how these two interact is the first step to conquering the ladder.</p>

                <h2 id="core-mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Three Pillars of RR</h2>
                <p>When you finish a match, the number you see is not random. It is determined by three distinct factors, weighted differently depending on your rank:</p>
                <ul className="list-disc pl-6 space-y-4 my-4">
                    <li><strong>Match Outcome (Lead Factor):</strong> The most obvious one. You won? You gain points. You lost? You lose points. Draws usually result in +0, though a slight gain is possible for performance. The "base" value for a balanced match is typically +/- 20 points.</li>
                    <li><strong>Round Differential (Multiplier):</strong> The game cares <em>how</em> you won. A 13-11 overtime win tells the system "These teams were equal." A 13-0 tells the system "One team does not belong here." We will discuss this more below.</li>
                    <li><strong>Individual Performance (Bonus):</strong> Your kills, assists, Average Combat Score (ACS), and first bloods play a role. However, this is NOT the primary factor. You cannot lose a match and gain RR (unless you are at the absolute bottom of Iron), no matter if you dropped 40 kills. Performance is a modifier, not a driver.</li>
                </ul>

                <h2 id="round-differential" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why 13-0 Matters (Round Differential)</h2>
                <p>Round Differential is the discrete difference between rounds won and lost. This is the easiest way for players to influence their RR, yet it is often ignored.</p>
                <p>Imagine two scenarios:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Scenario A:</strong> You are winning 12-4. You get cocky, try to knife the enemy, and throw 3 rounds. You win 13-7.</li>
                    <li><strong>Scenario B:</strong> You are winning 12-4. You play disciplined and close it out 13-4.</li>
                </ul>
                <p>In Scenario B, you might gain +24 RR. In Scenario A, you might only gain +19 RR. Those 3 rounds you threw effectively cost you 5 RR. Over the course of 100 wins, "throwing for content" or getting lazy with a lead can cost you 500 RRâ€”that's five entire rank tiers!</p>
                <p><strong>The takeaway:</strong> Every round counts. Losing 0-13 destroys your RR. Fighting back to lose 5-13 softens the blow significantly.</p>

                <h2 id="hidden-mmr" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Hidden MMR System (Convergence)</h2>
                <p>This is the most misunderstood part of Valorant. Why do you get +15 for a win and -25 for a loss?</p>
                <p>This happens because of a concept called <strong>Convergence</strong>. Your visible Rank (e.g., Platinum 1) is higher than your hidden MMR (e.g., Gold 2). The system believes you are "over-ranked" or "boosted."</p>
                <p>Because the system thinks you belong in Gold, it tries to push you there efficiently. It gives you small rewards for winning (because it thinks you got lucky) and huge penalties for losing (confirming its suspicion that you belong lower).</p>
                <h3 className="text-xl font-semibold mt-4">How to fix bad MMR gains?</h3>
                <p>There is only one way to fix this: <strong>Win consistently.</strong></p>
                <p>You must prove the system wrong. If you maintain a win rate above 50% over 20-30 games, your hidden MMR will rise faster than your visible Rank. Eventually, they will equalize, and you will see standard +/- 20 gains again. If you continue to win, your MMR will surpass your Rank, and you will start seeing "Smurf Gains" (+30 / -10).</p>

                <h2 id="rank-tiers" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How RR Changes by Rank (Iron vs. Immortal)</h2>
                <p>Riot Games adjusts the formula as you climb.</p>
                <ul className="list-disc pl-6 space-y-4 my-4">
                    <li><strong>Iron to Platinum ("Metal Ranks"):</strong> Individual performance matters a lot. If you are dropping 30 kills per game, the system will give you huge bonuses to get you out of these ranks quickly. This is to combat smurfing by moving high-skill players up rapidly.</li>
                    <li><strong>Diamond to Ascendant:</strong> The system begins to transition. Teamplay becomes more important. Your KDA matters less, and the round differential matters more.</li>
                    <li><strong>Immortal and Radiant:</strong> In these ranks, individual performance has almost zero impact on RR. The only thing that matters is winning and the round score. You could go 4/15/2, but if your team wins 13-0, you get max points. This encourages high-elo players to play Support/Controller roles properly rather than baiting teammates for kills.</li>
                </ul>

                <h2 id="performance-bonus" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Unlocking the Performance Star</h2>
                <p>You may sometimes see a gold star next to your RR gain. This implies you played better than the system's prediction.</p>
                <p><strong>Important distinction:</strong> This doesn't just mean "You had a good KDA." It means "You did better than we expected YOU to do against THESE specific opponents."</p>
                <p>If you are Silver fighting Golds and you top frag, you are guaranteed a star (+5 to +9 RR). If you are Platinum fighting Silvers and you top frag, you might NOT get a star, because the system <em>expected</em> you to dominate. This keeps the ladder honest.</p>

                <h2 id="roles" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Does Playing Support Hurt Your Rank?</h2>
                <p>A common myth is that Duelists climb faster because they get more kills and thus more ACS (Average Combat Score). While it is true that ACS favors damage and kills, Riot has integrated strict encounter MMR.</p>
                <p>If you play Sage and you wall off a site, slow the push, and delay the round, you might not get a kill, but your "Round Win" probability goes up. Since winning the match is the #1 factor (accounting for ~80% of RR math), playing a Support role correctly is arguably better than playing a Duelist poorly.</p>
                <p>Do not switch to Reyna just because you think it will give you more points. A 20-kill Loss is always -20 RR. A 5-kill Win is always +20 RR.</p>

                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Maximize RR Gains</h2>
                <ol className="list-decimal pl-6 space-y-4 my-4">
                    <li><strong>Never Give Up (The 0-12 comeback):</strong> We mentioned this before, but even if losing is inevitable, winning 5 rounds turns a -30 loss into a -22 loss. Over 100 games, saving 8 points here and there adds up to entire rank promotions.</li>
                    <li><strong>Dodge "Lost Lobbies":</strong> If your teammates are toxic in Agent Select, screaming, or fighting over roles, statistically your chance of winning drops below 40%. It is usually better to dodge (-3 RR penalty) than to play and lose (-20 RR and 45 minutes of time). The -3 RR does NOT affect your hidden MMR, so your future gains remain healthy.</li>
                    <li><strong>Duo Queue for Consistency:</strong> Having one teammate you can rely on reduces the RNG of matchmaking by 20%. You can ensure at least one lane is held or one trade is made. 5-stacking is risky as it often pits you against highly coordinated teams (and smurf stacks). Duo or Trio is the sweet spot for climbing.</li>
                </ol>

                <p className="mt-8"><strong>Summary:</strong> Valorant's RR system is designed to test consistency over a long period. One game means nothing. Ten games mean nothing. It is the trend over 50-100 games that defines your true rank. Stop staring at the +/- number of a single match, and focus on the trend of your performance.</p>

                <hr className="my-8" />
                <p className="text-sm"><em>Disclaimer: Riot Games tweaks their algorithms every Episode. This guide is based on the current competitive ecosystem (Episode 8/9 era).</em></p>
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
                                <Link href={`/gaming/${calc.slug}`} className="text-primary hover:underline">
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
                    <p>The Valorant RR Predictor helps players estimate their Rank Rating changes after a competitive match. By inputting the Match Outcome (Winning is the primary factor), Current Rank, Round Differential (margin of victory), and Performance (MVP vs Bot Frag), the tool calculates a likely RR range.</p>
                    <p>Key mechanics include the "Convergence" factor where hidden MMR pulls visible Rank, and the "Round Multiplier" where decisive victories yield higher rewards. This tool helps players visualize why they might be gaining less or losing more points, offering transparency into Valorant's complex ELO system.</p>
                </CardContent>
            </Card>
        </div>
    );
}
