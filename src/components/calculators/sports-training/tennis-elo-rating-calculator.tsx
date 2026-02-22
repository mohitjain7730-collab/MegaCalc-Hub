import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, User, Shield } from 'lucide-react';
import TennisEloRatingCalculatorInteractive from './tennis-elo-rating-calculator-interactive';

export default function TennisEloRatingCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Tennis Elo Rating Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your Tennis Elo rating, win probability, and track performance progression with professional accuracy.
                </p>
            </div>

            <TennisEloRatingCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for Elo rating calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <User className="h-4 w-4" />
                                Current Rating
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Your current Elo rating before the match. If you don't have one, 1500 is the standard starting point for intermediate club players.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>1500: Average club player</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>2000+: Advanced/Semi-pro</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Activity className="h-4 w-4" />
                                K-Factor (Match Importance)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The K-Factor determines how much your rating changes after a single match.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Higher K (32/40): Faster rating changes (Juniors/Club)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Lower K (10/20): Stable ratings (Grand Slams/Pro Tour)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formula Used */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FunctionSquare className="h-5 w-5" />
                        Formula Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center">
                            Expected Score = 1 / (1 + 10^((Rb - Ra) / 400))
                        </p>
                        <p className="font-mono text-sm text-center mt-2">
                            New Rating = Old Rating + K * (Actual Score - Expected Score)
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        The Elo system uses logistic distribution to calculate the expected outcome based on the rating difference. The actual result is then compared to this expectation to adjust the rating. Ra is your rating, Rb is opponent's rating.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Tennis Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other tennis performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/tennis-win-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Win Ratio</p>
                                            <p className="text-sm text-muted-foreground">Overall match success</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-aces-per-match-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Aces Per Match</p>
                                            <p className="text-sm text-muted-foreground">Service dominance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-first-serve-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">First Serve %</p>
                                            <p className="text-sm text-muted-foreground">Serve consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-break-point-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Break Point Conversion</p>
                                            <p className="text-sm text-muted-foreground">Clutch performance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-hold-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Hold Percentage</p>
                                            <p className="text-sm text-muted-foreground">Service game defense</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-return-points-won-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Return Points Won</p>
                                            <p className="text-sm text-muted-foreground">Receiving effectiveness</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Complete Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="The Complete Guide to Tennis Elo Rating: Calculation, Analysis, and Rankings" />
                <meta itemProp="description" content="Master the Tennis Elo Rating system. Learn how to calculate your rating, understand win probabilities, comparative benchmarks, and how it differs from ATP/WTA rankings." />
                <meta itemProp="keywords" content="tennis elo rating, tennis ranking system, elo calculator tennis, tennis match probability, calculate UTR vs Elo, tennis statistics" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Tennis Elo Rating: Mastering Match Probability</h2>
                <p className="text-lg italic text-muted-foreground">Understand the mathematical backbone of modern tennis analytics, predicting match outcomes and measuring true player strength beyond official rankings.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Elo Rating in Tennis?</a></li>
                    <li><a href="#calculation" className="hover:underline">How the Elo Calculation Works</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Rating Benchmarks: Amateurs to Pros</a></li>
                    <li><a href="#ranking-vs-elo" className="hover:underline">Official Rankings vs. Elo: The Difference</a></li>
                    <li><a href="#improving" className="hover:underline">Improving Your Elo Rating</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of the System</a></li>
                </ul>
                <hr />

                {/* WHAT IS ELO */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Elo Rating in Tennis?</h2>
                <p>The <strong>Elo Rating System</strong> is a method for calculating the relative skill levels of players in competitor-vs-competitor games. Originally invented by Arpad Elo for chess, it has been adapted for tennis to provide a more accurate predictive model than traditional point-accumulation rankings.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Why Tennis Elo Matters</h3>
                <p>In the official ATP/WTA rankings, points are accumulated based on how far a player progresses in a tournament. A player can maintain a high ranking by playing many tournaments or having one lucky run. However, <strong>Elo Rating measures the probability of winning against another specific player.</strong></p>

                <p>Key characteristics of Tennis Elo:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Zero-Sum (Mostly):</strong> Points gained by the winner are lost by the loser.</li>
                    <li><strong>Self-Correcting:</strong> Beating a lower-rated player gives fewer points; beating a higher-rated player gives more.</li>
                    <li><strong>Predictive Power:</strong> It directly translates to win probability (e.g., a 200-point difference implies a ~75% chance of winning).</li>
                </ul>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How the Elo Calculation Works</h2>
                <p>The calculation happens in two main steps: determining the Expected Score and then updating the rating based on the Actual Score.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Step 1: The Expected Score</h3>
                <p>Before a ball is hit, the system calculates the probability of Player A winning based on the rating difference.</p>
                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-sm">E_A = 1 / (1 + 10 ^ ((Rating_B - Rating_A) / 400))</p>
                </div>
                <p>If Player A has 1500 and Player B has 1500, the expected score is 0.5 (50% chance). If Player A is 1700 (+200 difference), the expected score jumps to ~0.76 (76% chance).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Step 2: The Rating Update</h3>
                <p>After the match, the ratings are updated using the K-Factor.</p>
                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-sm">New Rating = Old Rating + K × (Actual Score - Expected Score)</p>
                </div>

                <p><strong>The K-Factor:</strong> This constant determines the volatility of ratings.
                    <br />- <strong>K=32:</strong> Used for new players or lower levels (allows fast movement to true skill).
                    <br />- <strong>K=20:</strong> Standard tour level.
                    <br />- <strong>K=10:</strong> Elite level (Grand Slams), where form is established and variance should be low.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Rating Benchmarks: Amateurs to Pros</h2>
                <p>Unlike UTR (Universal Tennis Rating) which goes from 1-16, Elo usually spans from 1000 to 2800+.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Professional Level</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>2600+:</strong> The "Big Three" era peak (Djokovic, Nadal, Federer). Absolute dominance.</li>
                    <li><strong>2400-2600:</strong> Top 10 ATP / Top 5 WTA. Consistent Grand Slam contenders.</li>
                    <li><strong>2200-2400:</strong> Top 100 ATP / Top 50 WTA. Main tour regulars.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Recreational / Club Level</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>2000+:</strong> 5.0+ NTRP. Former college players, top club level.</li>
                    <li><strong>1700-2000:</strong> 4.0-4.5 NTRP. Competitive club players, solid technique.</li>
                    <li><strong>1400-1700:</strong> 3.0-3.5 NTRP. Intermediate. Can sustain rallies but lack weapons.</li>
                    <li><strong>Below 1400:</strong> Beginners. Learning basic strokes and rules.</li>
                </ul>

                <hr />

                {/* RANKING VS ELO */}
                <h2 id="ranking-vs-elo" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Official Rankings vs. Elo: The Difference</h2>
                <p>Why do tennis analysts prefer Elo over the official rankings for prediction?</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Recency Bias Protection</h3>
                <p>Official rankings defend points from 52 weeks ago. If a player won Wimbledon last year but has played poorly since, their ranking remains artificially high until those points drop. <strong>Elo adjusts immediately</strong> after every match, reflecting current form more accurately.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Strength of Schedule</h3>
                <p>In official rankings, winning a distinct ATP 250 event gives specific points regardless of who you beat. In Elo, winning a title by beating top-10 players rewards you significantly more than winning a title by beating players ranked 50-100.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Surface Specificity</h3>
                <p>Official rankings are an aggregate. Elo can be split into "Clay Elo," "Grass Elo," and "Hard Court Elo." A player might be #5 in the world but have a Clay Elo equal to the #50 player, making them an underdog on dirt.</p>

                <hr />

                {/* IMPROVING */}
                <h2 id="improving" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Improving Your Elo Rating</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Standardize Your Competition</h3>
                <p>To gain rating points, you must beat players near or above your level. Beating players rated 400 points below you yields almost zero gain (as Expected Score is ~0.99). Risking a loss to them, however, costs you heavily.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Consistency is Key</h3>
                <p>Elo punishes volatility. A bad loss hurts more than a good win helps if you are already highly rated. Focus on minimizing unforced errors and physical conditioning to prevent bad losses due to fatigue.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Play Rated Matches</h3>
                <p>If you play at a club, participate in ladders or leagues that officially track ratings (like UTR or localized Elo systems). Friendly hits do not test your mental fortitude or count toward your rating.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of the System</h2>
                <p>While powerful, Elo is not perfect for tennis.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Matchups Styles</h3>
                <p>Elo assumes transitivity (If A Beats B, and B beats C, then A should beat C). In tennis, styles make fights. A "pusher" might beat a big hitter who has a high Elo, simply because the style allows it, even if the math says the big hitter has a 90% win probability.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Injuries and Tanking</h3>
                <p>Elo does not know if a player is playing with a taped knee or is "tanking" a set to save energy. It treats every loss as a measure of skill, potentially underrating players returning from injury who are physically finding their form.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Tennis Elo Ratings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a "good" Tennis Elo rating?</h4>
                            <p className="text-muted-foreground">
                                A rating of 1500 is typically the starting point for average club players. A rating above 2000 indicates an advanced skill level, capable of competing in high-level amateur tournaments. Professional players generally start around 2200, with the world's elite exceeding 2500.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does Elo account for the margin of victory?</h4>
                            <p className="text-muted-foreground">
                                Standard Elo only considers Win/Loss. However, modified versions (like those used by some analytics sites) may factor in set scores or game scores to refine the rating update, giving more credit for a 6-0, 6-0 win than a 7-6, 7-6 win. This calculator uses the standard Win/Loss model.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does this differ from UTR (Universal Tennis Rating)?</h4>
                            <p className="text-muted-foreground">
                                UTR is a proprietary system that goes from 1.00 to 16.50+ and relies heavily on the "competitiveness" of the math (games won/lost). Elo is an open mathematical standard primarily focused on win/loss probability. Both attempt to measure the same thing—skill—but use different algorithms.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why did my rating drop after winning?</h4>
                            <p className="text-muted-foreground">
                                In a pure Elo system, your rating should never drop after a win. If this happens in other systems, it might be because of a "performance rating" averaging over time where an older, high-value win dropped out of the calculation window, or the margin of victory was lower than the algorithm expected for a massive favorite.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What K-Factor should I use?</h4>
                            <p className="text-muted-foreground">
                                Use K=32 if you are a recreational player or junior where consistency varies wildly. Use K=20 for regular competitive play. Use K=10 if ranking professional players over a long period. The higher the K, the faster your rating will jump (or crash).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can I use this for doubles?</h4>
                            <p className="text-muted-foreground">
                                Yes, but you should track a "Team Elo" separate from individual Elo. Alternatively, calculate the average Elo of Team A vs. Average Elo of Team B to get a win probability, though team chemistry is an unmeasured variable.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How accurate is Elo in predicting winners?</h4>
                            <p className="text-muted-foreground">
                                In professional tennis, Elo correctly predicts the winner in about 65-70% of matches. On surface-specific Elo, this accuracy can improve to 72-75%. It outperforms official rankings which typically predict accurately ~60-64% of the time.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the highest Elo ever recorded?</h4>
                            <p className="text-muted-foreground">
                                Novak Djokovic reached a peak Elo of roughly 2629 in 2016 (depending on the exact K-factor used by the statistician). This is widely considered the highest dominance peak in the Open Era.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Usage of this Calculator</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Who Should Use This Calculator?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Club Players</strong>
                                    <span className="text-sm text-muted-foreground">Maintain an unofficial ladder with friends to track who is really the best.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">League Directors</strong>
                                    <span className="text-sm text-muted-foreground">Use Elo to seed tournaments more accurately than just "last year's results".</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Show students how much a specific win impacts their standing.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Bettors / Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Calculate true win probabilities to find value in betting markets.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Tennis Elo Rating Calculator brings professional-grade statistical analysis to your game.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By focusing on match probabilities rather than point accumulation, it provides the most accurate reflection of current form and skill level, helping you set realistic goals and track genuine progress.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
