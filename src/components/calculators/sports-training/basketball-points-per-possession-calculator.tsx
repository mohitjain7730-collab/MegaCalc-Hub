import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, AlertCircle, Info, Calculator, BarChart3, TrendingUp, Users, CheckCircle2, Zap } from 'lucide-react';
import BasketballPointsPerPossessionCalculatorInteractive from './basketball-points-per-possession-calculator-interactive';

export default function BasketballPointsPerPossessionCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball Points Per Possession (PPP) Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate the most honest measure of scoring efficiency. Determine exactly how many points a player or team scores every time they use a possession.
                </p>
            </div>

            <BasketballPointsPerPossessionCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Metrics needed to calculate scoring efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Scoring Output
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The numerator of the efficiency equation.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Points Scored:</strong> Total points from all sources (2-pointers, 3-pointers, and Free Throws).</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Possession Usage
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Events that count as "using" a turn on offense.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>FGA:</strong> Field Goal Attempts (make or miss).</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>FTA:</strong> Free Throw trips (weighted 0.44 per attempt).</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>Turnovers:</strong> Possessions that end with 0 points and no shot.</span>
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
                        <Calculator className="h-5 w-5" />
                        Formula Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm md:text-center mb-2">
                            <strong>PPP</strong> = Total Points / (FGA + 0.44 × FTA + TOV)
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This formula divides total scoring output by the estimated number of possessions used to generate that output. The 0.44 coefficient accounts for the fact that not all free throws consume a unique possession (e.g., technicals or And-1s).
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Basketball Calculators
                    </CardTitle>
                    <CardDescription>
                        Enhance your analytics toolkit
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/basketball-offensive-efficiency-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Offensive Efficiency</p>
                                            <p className="text-sm text-muted-foreground">Team-level PPP (x100)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-true-shooting-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">True Shooting %</p>
                                            <p className="text-sm text-muted-foreground">Scoring efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-usage-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Info className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Usage Rate</p>
                                            <p className="text-sm text-muted-foreground">Volume measurement</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-effective-field-goal-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">eFG% Calculator</p>
                                            <p className="text-sm text-muted-foreground">Adjusted accuracy</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-assist-to-turnover-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Assist/Turnover</p>
                                            <p className="text-sm text-muted-foreground">Playmaking value</p>
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
                <meta itemProp="name" content="The Complete Guide to Points Per Possession (PPP) in Basketball" />
                <meta itemProp="description" content="Master Points Per Possession (PPP). Learn why it's the gold standard for efficiency, how to calculate it, and what typical benchmarks are for NBA and NCAA levels." />
                <meta itemProp="keywords" content="basketball PPP calculator, points per possession formula, basketball efficiency stats, offensive rating, scoring efficiency" />
                <meta itemProp="author" content="MegaCalc Basketball Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Points Per Possession: The Currency of Basketball</h2>
                <p className="text-lg italic text-muted-foreground">At its core, basketball is a game of maximizing the value of every possession. Points Per Possession (PPP) strips away pace and volume to reveal the naked efficiency of a player or team.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Points Per Possession (PPP)?</a></li>
                    <li><a href="#context" className="hover:underline">Transition vs. Half-Court PPP</a></li>
                    <li><a href="#formula" className="hover:underline">The Calculation Explained</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What is a Good PPP?</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of the Stat</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Points Per Possession (PPP)?</h2>
                <p><strong>Points Per Possession (PPP)</strong> is a metric that tells you how many points a player or team scores on average each time they have the ball and attempt to score.</p>

                <p className="mt-4">It is considered the "atomic unit" of basketball efficiency. Unlike Field Goal Percentage (FG%), it accounts for:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>3-Pointers:</strong> Rewarding shots that are worth 50% more.</li>
                    <li><strong>Free Throws:</strong> The most efficient way to score.</li>
                    <li><strong>Turnovers:</strong> Possessions that result in 0 points.</li>
                </ul>

                <hr />

                {/* CONTEXT */}
                <h2 id="context" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Transition vs. Half-Court PPP</h2>
                <p>PPP varies wildly depending on the <em>type</em> of possession. Understanding this context is crucial for analysis:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Transition PPP:</strong> Usually very high (1.10 - 1.30+). Fast breaks lead to layups and open 3s.</li>
                    <li><strong>Half-Court PPP:</strong> Usually lower (0.85 - 1.05). Defenses are set, making scoring harder.</li>
                </ul>
                <p className="mt-4">A team might have a high overall PPP simply because they run a lot of fast breaks, even if their half-court offense is mediocre. Advanced scouting reports break down PPP by play type (Pick & Roll, Post-Up, Isolation, etc.).</p>

                <hr />

                {/* FORMULA */}
                <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Calculation Explained</h2>
                <p>To calculate PPP, you divide total points by the Number of Possessions used.</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-lg text-primary font-bold">
                        PPP = Points / (FGA + (0.44 × FTA) + TOV)
                    </p>
                </div>

                <p className="mt-4">Why 0.44 for Free Throws?</p>
                <p>A trip to the line is usually 2 shots. If we counted every FT attempt as a possession, we'd double-count. Also, "And-1s" happen on the same possession as a made basket. Statistical analysis determined that multiplying FTA by 0.44 is the most accurate way to estimate possessions used via fouls without needing play-by-play logs.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What is a Good PPP?</h2>
                <p>For a full team offense in the modern NBA:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Elite (&gt; 1.15)</h4>
                        <p className="text-sm">The best offenses in history (e.g., 2024 Celtics, KD-era Warriors) operate here. It implies scoring essentially every time down the floor.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Good (1.05 - 1.14)</h4>
                        <p className="text-sm">Solid playoff-caliber offense. You expect to score at least 1 point per possession on average.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Average (0.95 - 1.04)</h4>
                        <p className="text-sm">Serviceable. Depending on pace, this usually results in ~100 points per game.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Poor (&lt; 0.95)</h4>
                        <p className="text-sm">Inefficient. Likely due to turnovers or poor shooting. It is very hard to win games scoring less than 0.95 points per trip.</p>
                    </div>
                </div>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of the Stat</h2>
                <p>While PPP is excellent for scoring efficiency, it ignores:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Assists:</strong> A player who sets up teammates for easy baskets has high value not captured in their personal scoring PPP.</li>
                    <li><strong>Role Difficulty:</strong> An isolation scorer taking bail-out shots at the end of the clock (low PPP) is performing a harder task than a center only catching lob dunks (high PPP).</li>
                    <li><strong>Volume:</strong> Maintaining high PPP at high volume (Usage Rate) is exponentially harder than doing it on low volume.</li>
                </ul>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Points Per Possession is the ultimate lie detector. A player might score 20 points, but if it took them 25 possessions to do it (0.80 PPP), they actively hurt the team. Conversely, a player scoring 15 points on 10 possessions (1.50 PPP) is an efficiency monster. Use this calculator to see beyond the raw point totals.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Points Per Possession
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is PPP the same as Offensive Rating?</h4>
                            <p className="text-muted-foreground">
                                Almost. Offensive Rating is simply PPP multiplied by 100. So a PPP of 1.12 equates to an Offensive Rating of 112. They measure the exact same thing on different scales.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does this calculator work for individual players?</h4>
                            <p className="text-muted-foreground">
                                Yes. Enter the player's individual Points, FGA, FTA, and Turnovers to see their personal scoring efficiency. Be aware that this only measures possessions they <em>finished</em>, not passes.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why are turnovers included?</h4>
                            <p className="text-muted-foreground">
                                Because a turnover is a "used" possession that resulted in 0 points. Ignoring turnovers (by only looking at FG% or eFG%) inflates efficiency for players who are sloppy with the ball.
                            </p>
                        </div>

                        <h4 className="font-semibold text-lg mb-3">What is a good PPP for a specific play type (like Post-Up)?</h4>
                        <p className="text-muted-foreground">
                            It differs by play type. A "good" Post-Up PPP is often around 0.90 (inefficient play type). A "good" Transition PPP is &gt; 1.20. A "good" Spot-Up shooting PPP is &gt; 1.10. Context is key.
                        </p>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does the 3-point shot affect PPP?</h4>
                            <p className="text-muted-foreground">
                                Shooting 33% from 3 yields 1.00 PPP (3 pts * 0.33). Shooting 50% from 2 yields 1.00 PPP (2 pts * 0.50). This math drives the modern NBA: you only need to shoot ~33% from deep to match a strong mid-range shooter.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can PPP exceed 3.0?</h4>
                            <p className="text-muted-foreground">
                                Theoretically, the max PPP on a single possession is 4 (a 4-point play). Over a large sample size, however, sustaining anything over 1.5 is nearly impossible for a primary scorer.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why are offensive rebounds not subtracted here?</h4>
                            <p className="text-muted-foreground">
                                In individual PPP calculations (Play Type), acquiring an offensive rebound usually starts a <em>new</em> play type possession (Putback), so standard formulas often treat them distinctly depending on the data source. For this simplified calculator, we stick to the core possession estimation formula used throughout our suite for consistency.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does free throw percentage matter for PPP?</h4>
                            <p className="text-muted-foreground">
                                Yes. Missing free throws lowers your points (numerator) while the possession cost (denominator) stays the same. Improving FT% is the easiest way to raise PPP.
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
                            <h3 className="font-semibold text-lg mb-3">Who Should Use This?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Determine which plays work. If your "Play X" yields 0.8 PPP but "Play Y" yields 1.1 PPP, run Play Y more.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate prospects. A player scoring 25 PPG on 0.9 PPP is likely a volume shooter who won't translate well to higher levels.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Players</strong>
                                    <span className="text-sm text-muted-foreground">Track personal efficiency. understand that a turnover is just as bad as a missed shot for your efficiency rating.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Bettors</strong>
                                    <span className="text-sm text-muted-foreground">Analyze team matchups. A high-PPP team playing a low-PPP team is a massive mismatch, often hidden by Pace stats.</span>
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
                        <Calculator className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Basketball Points Per Possession Calculator is the fundamental tool for measuring scoring value.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By contextualizing points scored with the possessions used to get them, it provides the clearest picture of offensive quality available.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
