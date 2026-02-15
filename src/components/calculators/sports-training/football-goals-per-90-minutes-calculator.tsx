import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, Clock } from 'lucide-react';
import FootballGoalsPer90CalculatorInteractive from './football-goals-per-90-minutes-calculator-interactive';

export default function FootballGoalsPer90Calculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football Goals per 90 Minutes Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate a player's scoring efficiency standardized to a full match duration for fair comparison.
                </p>
            </div>

            <FootballGoalsPer90CalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Data points needed for per 90 calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Goals Scored
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of goals recognized by the official match report.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes open play and set-piece goals</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Typically excludes penalty shootouts (but includes in-game pens)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Clock className="h-4 w-4" />
                                Minutes Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total time the player was on the pitch.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Sum of all minutes across all appearances</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Includes stoppage time if tracking data is precise (usually simply 90 per full game)</span>
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
                            Goals per 90 = (Goals Scored / Minutes Played) × 90
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This formula normalizes scoring data to a standard "per match" basis (90 minutes). It allows for fair comparison between a player who played 5 full games and one who played 10 half-games, as raw goal totals would favor the player with more minutes.
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
                        <Link href="/category/sports-training/football-expected-goals-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Expected Goals (xG)</p>
                                            <p className="text-sm text-muted-foreground">Scoring probability</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-goal-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Goal Conversion</p>
                                            <p className="text-sm text-muted-foreground">Finishing efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-expected-assists-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Expected Assists</p>
                                            <p className="text-sm text-muted-foreground">Playmaking quality</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-shot-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Shot Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Shooting precision</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Win Rate</p>
                                            <p className="text-sm text-muted-foreground">Team success metrics</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-possession-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Possession %</p>
                                            <p className="text-sm text-muted-foreground">Game control</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Goals Per 90: The Fairest Scoring Metric in Football" />
                <meta itemProp="description" content="Learn why 'Goals Per 90 Minutes' is the gold standard for evaluating striker efficiency, how to calculate it, and benchmarks for elite performance across top leagues." />
                <meta itemProp="keywords" content="goals per 90, p90 stats, football analytics, striker stats, goal scoring rate, soccer data analysis" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Goals Per 90: Measuring True Scoring Efficiency</h2>
                <p className="text-lg italic text-muted-foreground">Move beyond total goals. Discover how normalizing statistics to 90 minutes provides a clearer picture of a player's impact and efficiency on the pitch.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Goals Per 90?</a></li>
                    <li><a href="#calculation" className="hover:underline">How to Calculate Goals Per 90</a></li>
                    <li><a href="#why-it-matters" className="hover:underline">Total Goals vs. Per 90: Why It Matters</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What is a Good P90?</a></li>
                    <li><a href="#limitations" className="hover:underline">The "Supersub" Anomaly and Limitations</a></li>
                    <li><a href="#advanced" className="hover:underline">Non-Penalty Goals Per 90 (NPG90)</a></li>
                </ul>
                <hr />

                {/* WHAT IS GOALS P90 */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Goals Per 90?</h2>
                <p><strong>Goals Per 90 Minutes</strong> (often abbreviated as G/90 or P90) is a statistical metric that calculates the average number of goals a player scores for every 90 minutes they spend on the pitch.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Problem with "Total Goals"</h3>
                <p>Traditionally, the "Golden Boot" goes to the player with the highest raw goal count. However, this biases evaluation toward players who start every game and play every minute. It unfairly penalizes:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Players who are substituted frequently</li>
                    <li>Players returning from injury</li>
                    <li>Rotation squad members who score efficiently in limited time</li>
                    <li>January signings who play only half a season</li>
                </ul>

                <p>Goals Per 90 levels the playing field, answering the question: <em>"If this player played a full match, how many goals would they likely score based on their current rate?"</em></p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate Goals Per 90</h2>
                <p>The calculation is simple but powerful:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Goals Per 90 = (Total Goals / Total Minutes Played) × 90
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">A Real-World Example</h3>
                <p>Let's compare two strikers:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="p-4 border rounded bg-card">
                        <strong className="block text-lg">Striker A (Workhorse)</strong>
                        <p>Goals: 20</p>
                        <p>Minutes: 3,420 (38 full games)</p>
                        <p className="font-mono text-primary mt-2">G/90 = (20/3420)*90 = 0.53</p>
                    </div>
                    <div className="p-4 border rounded bg-card">
                        <strong className="block text-lg">Striker B (Efficient)</strong>
                        <p>Goals: 15</p>
                        <p>Minutes: 1,500 (~16 games)</p>
                        <p className="font-mono text-primary mt-2">G/90 = (15/1500)*90 = 0.90</p>
                    </div>
                </div>

                <p>Striker A has more goals and wins the Golden Boot. However, Striker B is scoring at a rate of nearly one goal per game, almost double the efficiency of Striker A. Scouts would likely be far more interested in Striker B's potential if given more minutes.</p>

                <hr />

                {/* WHY IT MATTERS */}
                <h2 id="why-it-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Total Goals vs. Per 90: The Contextual Shift</h2>
                <p>The rise of data analytics in football recruitment has made Per 90 stats indispensable. Here is why elite clubs focus on them:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Identifying Hidden Gems</h3>
                <p>Young players or backups rarely get 3,000 minutes. A young striker playing 300 minutes and scoring 2 goals has a G/90 of 0.60—a sign of elite potential that raw totals (2 goals) would miss.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Evaluating Substitutes</h3>
                <p>Modern football is a squad game. Managers need "impact subs" who can score quickly. P90 stats highlight these players better than any other metric.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Injury Adjustments</h3>
                <p>A world-class player injured for 3 months will have a lower goal total than a mediocre player who stays fit. P90 reveals the quality difference instantly.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What is a Good Goals Per 90?</h2>
                <p>Standards vary by league (scoring is higher in the Bundesliga vs. La Liga historically) and position, but general benchmarks for forwards are:</p>

                <ul className="list-disc ml-6 space-y-4">
                    <li>
                        <strong className="text-foreground">1.00+ (Alien Tier):</strong> A goal every game. Historically achieved only by players like Lionel Messi, Cristiano Ronaldo, Erling Haaland, or Robert Lewandowski in peak seasons. Unsustainable for most.
                    </li>
                    <li>
                        <strong className="text-foreground">0.70 - 0.99 (Elite):</strong> World-class striker. Top scorer contenders. Anything close to 0.8 is considered exceptional.
                    </li>
                    <li>
                        <strong className="text-foreground">0.50 - 0.69 (Very Good):</strong> The mark of a reliable top-league striker. A rate of 0.5 means a goal every two games, typically resulting in ~19 goals in a full 38-game season.
                    </li>
                    <li>
                        <strong className="text-foreground">0.30 - 0.49 (Decent):</strong> Good for secondary strikers or high-scoring wingers (e.g., Mohamed Salah often exceeds this, typical wingers sit here).
                    </li>
                    <li>
                        <strong className="text-foreground">Below 0.30:</strong> Average. Common for playmakers or defensive forwards whose value lies elsewhere.
                    </li>
                </ul>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Supersub Anomaly" and Limitations</h2>
                <p>While Per 90 stats are powerful, they have trapdoors:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Small Sample Size Variance</h3>
                <p>This is the biggest risk. If a defender plays 10 minutes and scores from a corner, their G/90 is 9.00! To filter this, data analysts usually set a minimum filter (e.g., "minimum 500 minutes played") before taking the stat seriously.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. The "Supersub" Effect</h3>
                <p>Players coming on in the 80th minute face tired defenders and often open games as teams chase results. It is easier to maintain a high scoring rate playing 15 minutes against exhausted legs than 90 minutes against fresh ones. Thus, a supersub's G/90 often drops if they become a starter.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Penalty Inflation</h3>
                <p>A player who takes penalties will have a significantly higher G/90 than one who doesn't. Penalties are high-value chances (0.76 xG) that don't reflect open-play finishing ability.</p>

                <hr />

                {/* NPG90 */}
                <h2 id="advanced" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Refining the Metric: Non-Penalty Goals Per 90 (NPG90)</h2>
                <p>To stripping out the "noise" of penalties, analysts use <strong>NPG90</strong>.</p>
                <p><em>Formula: (Total Goals - Penalty Goals) / Minutes * 90</em></p>
                <p>This is often considered the purest measure of a striker's open-play scoring threat. For example, a midfielder scoring 10 penalties might have a high G/90, but a low NPG90, revealing they aren't a consistent goal threat from open play.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Goals Per 90 analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is stoppage time included in minutes played?</h4>
                            <p className="text-muted-foreground">
                                In basic data sets, "minutes played" for a full game is capped at 90. In advanced Opta/StatsBomb data, actual stoppage time is included (e.g., 98 minutes), making the denominator larger and the rate slightly more accurate. For most general purposes, using 90 for a full game is standard.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is 90 used instead of 'per match'?</h4>
                            <p className="text-muted-foreground">
                                "Per match" is vague. Does a 5-minute cameo count as a match? If so, the player's "goals per match" drops unfairly. "Per 90" standardizes the unit of time, treating 90 minutes as one "unit" of opportunity, regardless of how many actual games it took to accumulate those minutes.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does assists per 90 exist?</h4>
                            <p className="text-muted-foreground">
                                Yes, absolutely. Assists Per 90 (A/90) and "Goals + Assists Per 90" (G+A/90) are standard metrics used to evaluate total offensive contribution.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good conversion rate to go with G/90?</h4>
                            <p className="text-muted-foreground">
                                A high G/90 usually correlates with a high shot volume or high conversion rate. Average strikers convert ~15% of shots. Elite finishers might convert 20-25%. If a player has a high G/90 but a 40% conversion rate, they are likely "running hot" and will regress.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the best G/90 in history?</h4>
                            <p className="text-muted-foreground">
                                In the modern era, Erling Haaland and Lionel Messi have produced seasons exceeding 1.20 goals per 90, which is statistically anomalous. Historically, Gerd Müller also posted incredible per-90 figures.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does position matter?</h4>
                            <p className="text-muted-foreground">
                                Immensely. You cannot compare a center-back's G/90 to a striker's. However, comparing attacking full-backs (like Alexander-Arnold or Hakimi) using G+A/90 is very common.
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
                                    <strong className="block text-primary mb-1">Scouts & Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Uncover undervalued players in lower leagues with high efficiency but low minutes.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Managers (FPL)</strong>
                                    <span className="text-sm text-muted-foreground">Pick players who score points efficiently when they play (essential for rotation-risk assets).</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Players & Agents</strong>
                                    <span className="text-sm text-muted-foreground">Negotiate contracts by proving high value-per-minute despite limited playing time.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Journalists</strong>
                                    <span className="text-sm text-muted-foreground">Provide deeper context to scoring charts and player comparisons.</span>
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
                        <Trophy className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Goals Per 90 Calculator is the equalizer of football statistics.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By focusing on efficiency rather than volume, it reveals the true scoring potency of a player. Whether for professional analysis, fantasy football, or casual debate, understanding G/90 is essential for modern football literacy.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
