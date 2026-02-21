import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, Clock, Shield } from 'lucide-react';
import FootballAssistsPer90CalculatorInteractive from './football-assists-per-90-calculator-interactive';

export default function FootballAssistsPer90Calculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football Assists per 90 Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate a playmaker's creative efficiency standardized to a full match duration for fair comparison.
                </p>
            </div>

            <FootballAssistsPer90CalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Data points needed for assist rate calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <TrendingUp className="h-4 w-4" />
                                Total Assists
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of times the player's final pass led directly to a goal.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Standard Opta definition (final touch before scorer)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Excludes "fantasy assists" (like winning a penalty) unless specified</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Clock className="h-4 w-4" />
                                Minutes Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total time the player was on the pitch across all competitions.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Accumulated minutes from all appearances</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Essential for normalizing stats between starters and impact subs</span>
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
                            Assists per 90 = (Total Assists / Minutes Played) × 90
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This formula standardizes creative output to a "per match" basis (90 minutes). It allows for fair comparison between a player who played 3,000 minutes and one who played 1,500 minutes, highlighting efficiency rather than just volume.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Football Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other football performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/football-goals-per-90-minutes-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Goals Per 90</p>
                                            <p className="text-sm text-muted-foreground">Scoring efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-expected-assists-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Expected Assists (xA)</p>
                                            <p className="text-sm text-muted-foreground">Pass quality</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-pass-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Pass Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Distribution reliability</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-expected-goals-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Expected Goals (xG)</p>
                                            <p className="text-sm text-muted-foreground">Chance quality</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/match-impact-score-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Impact Score</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Win Rate</p>
                                            <p className="text-sm text-muted-foreground">Team success</p>
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
                <meta itemProp="name" content="The Complete Guide to Assists Per 90: Measuring Creative Efficiency in Football" />
                <meta itemProp="description" content="Understand the Assists Per 90 metric, how to calculate it, and why it provides a better analysis of a playmaker's true creative output than raw assist totals." />
                <meta itemProp="keywords" content="assists per 90, football analytics, playmaker stats, expected assists, assist rate, soccer data analysis" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Assists Per 90: Measuring Creative Efficiency</h2>
                <p className="text-lg italic text-muted-foreground">Look beyond the raw numbers. Discover how standardizing assist data to 90 minutes reveals the true creative engines of a football team.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Assists Per 90?</a></li>
                    <li><a href="#calculation" className="hover:underline">How to Calculate Assists Per 90</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What Makes an Elite Creator?</a></li>
                    <li><a href="#limitations" className="hover:underline">The "Finishing" Variable (Why xA is Better)</a></li>
                    <li><a href="#context" className="hover:underline">Context: Position and Role</a></li>
                    <li><a href="#comparisons" className="hover:underline">Assists vs. Key Passes</a></li>
                    <li><a href="#improvement" className="hover:underline">Strategies to Improve</a></li>
                </ul>
                <hr />

                {/* WHAT IS ASSISTS P90 */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Assists Per 90?</h2>
                <p><strong>Assists Per 90 Minutes (A/90)</strong> is a metric that calculates the average number of goal-creating passes a player makes for every 90 minutes played. It is the creative equivalent of the "Goals Per 90" stat for strikers.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Why "Total Assists" Can Be Misleading</h3>
                <p>Ranking players by total assists heavily favors those who play every minute of every game. It penalizes:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Impact Substitutes:</strong> Players who come on late and create chances against tired legs.</li>
                    <li><strong>Rotated Squad Players:</strong> Elite creators who share minutes (e.g., in a deep Man City squad).</li>
                    <li><strong>Injured Stars:</strong> Players like Kevin De Bruyne might miss half a season but still be the most dangerous creator when fit.</li>
                </ul>

                <p>A/90 levels the playing field, showing statistical <em>efficiency</em> rather than just volume.</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate Assists Per 90</h2>
                <p>The formula is straightforward:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Assists Per 90 = (Total Assists / Minutes Played) × 90
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
                <p>Consider two playmakers:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="p-4 border rounded bg-card">
                        <strong className="block text-lg">Player A (Starter)</strong>
                        <p>Assists: 10</p>
                        <p>Minutes: 3,000</p>
                        <p className="font-mono text-primary mt-2">A/90 = (10/3000)*90 = 0.30</p>
                    </div>
                    <div className="p-4 border rounded bg-card">
                        <strong className="block text-lg">Player B (Rotation)</strong>
                        <p>Assists: 8</p>
                        <p>Minutes: 1,200</p>
                        <p className="font-mono text-primary mt-2">A/90 = (8/1200)*90 = 0.60</p>
                    </div>
                </div>

                <p>Player A has more assists, but Player B is providing assists at <strong>double the rate</strong>. For a manager needing a goal in the last 20 minutes, Player B is statistically the more potent weapon.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What Makes an Elite Creator?</h2>
                <p>Assist rates are generally lower than goal rates, as creating a goal requires both a good pass and a good finish. Benchmarks for attacking midfielders/wingers include:</p>

                <ul className="list-disc ml-6 space-y-4">
                    <li>
                        <strong className="text-foreground">0.50+ (World Class):</strong> An assist every two games. This is the realm of Kevin De Bruyne, Lionel Messi, or Thomas Müller in their primes. Exceptionally rare over a full season.
                    </li>
                    <li>
                        <strong className="text-foreground">0.35 - 0.49 (Elite):</strong> Top-tier playmaker. A consistent threat who leads league charts.
                    </li>
                    <li>
                        <strong className="text-foreground">0.20 - 0.34 (Good):</strong> A solid creative contributor. Standard for good wingers or attacking midfielders.
                    </li>
                    <li>
                        <strong className="text-foreground">Below 0.15:</strong> Average or Low. Typical for deeper midfielders or defensive players whose role isn't the final ball.
                    </li>
                </ul>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Finishing" Variable (Why xA is Better)</h2>
                <p>The biggest flaw in "Assists Per 90" is that it depends on the striker finishing the chance. A player can play the perfect pass (high xA), but if the striker misses an open goal, the creator gets 0 assists.</p>

                <p><strong>Scenario:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Player X</strong> passes to a world-class striker who scores from 30 yards. Player X gets an assist for a simple 5-yard pass.</li>
                    <li><strong>Player Y</strong> puts a pass on a plate for a struggling striker who misses from 2 yards. Player Y gets no assist.</li>
                </ul>

                <p>This is why modern analysts prefer <strong>Expected Assists (xA) Per 90</strong>, which measures the <em>quality of the pass</em> regardless of whether the shot goes in. However, A/90 remains the standard for historical comparisons and factual results.</p>

                <hr />

                {/* CONTEXT */}
                <h2 id="context" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Context: Position and Role</h2>
                <p>When using this calculator, context is king:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Full-backs:</strong> Modern full-backs (like Trent Alexander-Arnold) can have A/90 stats rivaling wingers. This is hugely valuable as it adds creativity from the back line.</li>
                    <li><strong>Set Pieces:</strong> Players who take corners and free kicks have naturally inflated A/90 stats compared to those who rely solely on open play.</li>
                    <li><strong>League Strength:</strong> An A/90 of 0.6 in a lower league may not translate to 0.6 in the Premier League or Champions League due to tighter defenses.</li>
                </ul>

                <hr />

                {/* COMPARISONS */}
                <h2 id="comparisons" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Assists vs. Key Passes vs. Big Chances Created</h2>
                <p>To fully judge creativity, A/90 should be viewed alongside other metrics:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Key Passes (Chance Created)</h3>
                <p>A "Key Pass" is the final pass leading to a shot at goal, regardless of whether it goes in. Key Passes Per 90 measures volume of creation. A player with high Key Passes but low Assists is suffering from poor finishing by teammates.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Big Chances Created</h3>
                <p>A "Big Chance" is a situation where a player should reasonably be expected to score (e.g., 1v1 or open goal). Creating Big Chances is more valuable than accumulating low-quality Key Passes. Elite creators typically top the Big Chances Created charts.</p>

                <hr />

                {/* IMPROVEMENT */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Assist Output</h2>
                <p>Improving from a "good" player to a "creative force" involves specific skills:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Scanning (Vision)</h3>
                <p>The best playmakers (like Ødegaard or Fernandes) scan the field hundreds of times per game. Knowing where runners are <em>before</em> receiving the ball allows for first-time passes that catch defenses off guard.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Weight of Pass</h3>
                <p>The difference between a good pass and an assist is often the "weight" (speed). A through-ball must be fast enough to beat the defender but slow enough for the striker to control without breaking stride.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Understanding Movement</h3>
                <p>Build chemistry with strikers. Learn if they prefer ball-to-feet or space-to-run. Anticipating their movement is key to timing the release.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Set Piece delivery</h3>
                <p>Mastering corners and free-kicks is the "cheat code" for high assist numbers. Precise delivery into the "corridor of uncertainty" earns 5-10 "easy" assists a season.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about assist statistics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does winning a penalty count as an assist?</h4>
                            <p className="text-muted-foreground">
                                In "Fantasy Football" (FPL), yes. In official Opta records? No. Official assists are only for the final pass. If a player is fouled for a penalty, they usually get "fantasy assist" points but no official assist stat. This calculator is neutral but typically designed for official stats (Opta style).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What about deflected passes?</h4>
                            <p className="text-muted-foreground">
                                If a pass takes a slight deflection but the "destination" was still the scorer, it is usually given as an assist. If the deflection significantly alters the path, it is not. Rules vary slightly by league data provider.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is 'Secondary Assist' included?</h4>
                            <p className="text-muted-foreground">
                                No. Secondary assists (the "pass before the pass", or hockey assist) are not counted in standard assist totals. They are valuable metrics called "Pre-Assists" or "Shot Creating Actions" but reside in deeper analytics.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good sample size?</h4>
                            <p className="text-muted-foreground">
                                Like goals per 90, aim for at least 500-1,000 minutes. A player with 1 assist in 10 minutes has an A/90 of 9.00, which is meaningless noise.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does xA differ from actual Assists?</h4>
                            <p className="text-muted-foreground">
                                Actual assists rely on the striker scoring. xA (Expected Assists) measures the <em>quality</em> of the pass itself. If you pass to a player who has an open goal (0.9 xG) and they miss, you get 0.9 xA but 0 assists. Over time, xA is a better predictor of future creative performance.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who holds the record for most assists in a season?</h4>
                            <p className="text-muted-foreground">
                                Records vary by league, but notable benchmarks include Thomas Müller (21 in Bundesliga), Lionel Messi (21 in La Liga), and Kevin De Bruyne/Thierry Henry (20 in Premier League). These players typically maintained A/90 rates above 0.50 throughout entire seasons.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do goalkeepers get assists?</h4>
                            <p className="text-muted-foreground">
                                Rarely, but yes. A long punt (route one) that lands for a striker to score counts as an assist. Alisson Becker and Ederson have both registered assists in the Premier League. Their A/90 is negligible but non-zero.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Are assists from corners worth less?</h4>
                            <p className="text-muted-foreground">
                                Statistically, an assist is an assist. However, scouts often separate "Open Play Assists" from "Set Piece Assists" because open play creativity is harder to replicate and considered more valuable for general play.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why are my A/90 higher than my G/90?</h4>
                            <p className="text-muted-foreground">
                                This is common for creators (No. 10s, Wingers). It defines your role. If your A/90 is 0.4 and G/90 is 0.1, you are a pure playmaker. If both are 0.4, you are a dual-threat forward.
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
                                    <strong className="block text-primary mb-1">Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Identify creative talents who may be undervalued due to lack of playing time.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Managers</strong>
                                    <span className="text-sm text-muted-foreground">Find differential picks (midfielders) who create points efficiently.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate which players are most efficient at unlocking defenses per minute played.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fans</strong>
                                    <span className="text-sm text-muted-foreground">Settle debates about who is truly the "Creative King" of the league.</span>
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
                        <TrendingUp className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Assists Per 90 Calculator provides a clear, standardized view of a player's creative output.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By removing the bias of minutes played, it allows for accurate comparison between starters and squad players, highlighting true playmaking efficiency.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
