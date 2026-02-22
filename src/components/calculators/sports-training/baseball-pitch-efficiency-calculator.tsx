import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Shield, Zap } from 'lucide-react';
import BaseballPitchEfficiencyCalculatorInteractive from './baseball-pitch-efficiency-calculator-interactive';

export default function BaseballPitchEfficiencyCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball/ Softball Pitch Efficiency Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate pitcher efficiency with composite scoring across Pitches Per Inning, Strike Rate, Pitches Per Batter, and First-Pitch Strike Rate — the four pillars of commanding, durable pitching performance.
                </p>
            </div>

            <BaseballPitchEfficiencyCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Every metric used in the Pitch Efficiency calculation and what it represents
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Total Pitches Thrown
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of pitches thrown in the measured outing or period, including all balls, strikes, fouls, and balls put in play.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes every pitch regardless of outcome</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>The denominator for strike rate and pitches-per-inning calculations</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <BarChart3 className="h-4 w-4" />
                                Innings Pitched (IP)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Total innings recorded. Each out equals 1/3 of an inning. A pitcher who records 17 outs has pitched 5.2 innings (5 and 2/3 — displayed as 5.2, not 5.67 in baseball convention).
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Enter in baseball format: 5.0 = 5 innings, 5.1 = 5 innings + 1 out, 5.2 = 5 innings + 2 outs</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Primary driver of Pitches Per Inning efficiency</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <TrendingUp className="h-4 w-4" />
                                Total Strikes Thrown
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                All pitches that were called strikes, swinging strikes (whiffs), foul balls, or put into play (a ball hit in play is always a strike because the batter swung or the pitch was in the zone).
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Called strikes + Swinging strikes + Foul balls + Balls in play</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>MLB average: approximately 62–65% of all pitches are strikes</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                <Trophy className="h-4 w-4" />
                                Batters Faced (TBF)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of batters who came to the plate against this pitcher. It is the pitching equivalent of &quot;plate appearances&quot; in hitting stats.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                    <span>Includes: outs, hits, walks, HBP, errors, fielder&apos;s choice — every plate appearance</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                    <span>Elite starters average ~3.5 pitches per batter in efficient outings</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20 md:col-span-2">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <AlertCircle className="h-4 w-4" />
                                First-Pitch Strikes (Optional)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of at-bats where the pitcher threw a strike on the very first pitch of the plate appearance. This is one of the most predictive single metrics of pitching success, as batters hit dramatically worse when behind in the count.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>MLB elite benchmark: 65%+ first-pitch strike rate</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>Batters hit approximately .180 when 0-1, but .360+ when 1-0 — illustrating the massive leverage of first-pitch strikes</span>
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
                        Formulas Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center font-bold">
                            Pitches Per Inning (PPI) = Total Pitches / Innings Pitched
                        </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center">
                            Strike Rate (%) = (Total Strikes / Total Pitches) × 100
                        </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center">
                            Pitches Per Batter (PPB) = Total Pitches / Batters Faced
                        </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center">
                            First-Pitch Strike Rate (FPS%) = (First-Pitch Strikes / Batters Faced) × 100
                        </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center font-bold">
                            Composite Efficiency Score = (35% × PPI Score) + (30% × Strike Score) + (20% × PPB Score) + (15% × FPS Score)
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        The Composite Efficiency Score normalizes each component to a 0–100 scale: lower PPI is better (elite threshold: 15 PPI), higher Strike Rate is better (elite: 65%+), lower PPB is better (elite: ~3.5), and higher FPS% is better (elite: 65%+). Weighted together, the score reflects overall pitching command and endurance.
                    </p>
                    <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded border border-primary/10">
                        <strong>Note on IP Notation:</strong> Baseball records innings pitched in a special format where .1 = 1 out = 1/3 inning, and .2 = 2 outs = 2/3 inning. Enter 6.0 for exactly 6 innings, 6.1 for 6 and 1/3 innings, and 6.2 for 6 and 2/3 innings. The calculator converts these correctly when computing PPI.
                    </div>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Baseball &amp; Softball Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other key pitching and performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/baseball-era-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">ERA Calculator</p>
                                            <p className="text-sm text-muted-foreground">Earned Runs per 9 Innings</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-whip-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">WHIP Calculator</p>
                                            <p className="text-sm text-muted-foreground">Walks + Hits per IP</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-strikeout-to-walk-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">K/BB Ratio Calculator</p>
                                            <p className="text-sm text-muted-foreground">Strikeout to Walk Ratio</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Batting Average Calculator</p>
                                            <p className="text-sm text-muted-foreground">Opposing hitter context</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-win-loss-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Win-Loss Percentage</p>
                                            <p className="text-sm text-muted-foreground">Pitcher decision record</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-fielding-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Fielding Percentage</p>
                                            <p className="text-sm text-muted-foreground">Defensive reliability metric</p>
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
                <meta itemProp="name" content="The Complete Guide to Pitch Efficiency in Baseball and Softball" />
                <meta itemProp="description" content="Comprehensive guide on Baseball and Softball Pitch Efficiency. Learn what pitch efficiency is, how to calculate Pitches Per Inning, Strike Rate, and First-Pitch Strike Rate, MLB benchmarks, strategies to improve command, and why efficient pitchers last longer and build stronger careers." />
                <meta itemProp="keywords" content="pitch efficiency calculator baseball, pitches per inning calculator, strike rate pitcher, first pitch strike percentage, baseball pitching efficiency, softball pitcher stats, how to be more efficient on the mound, mlb pitcher efficiency benchmarks" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-21" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Art of Doing More with Less: Mastering Pitch Efficiency</h2>
                <p className="text-lg italic text-muted-foreground">The most durable, valuable pitchers in history weren&apos;t always the hardest throwers. They were the ones who could throw fewer pitches per inning, command the strike zone, and go deep into games night after night.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Pitch Efficiency?</a></li>
                    <li><a href="#why-it-matters" className="hover:underline">Why Pitch Efficiency is Critical for Careers and Teams</a></li>
                    <li><a href="#benchmarks" className="hover:underline">MLB, College & Youth Benchmarks</a></li>
                    <li><a href="#components" className="hover:underline">The Four Components of Pitch Efficiency</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Improve Your Efficiency</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations: When Efficiency Can Be Misleading</a></li>
                    <li><a href="#modern" className="hover:underline">Pitch Efficiency in the Analytics Era</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Pitch Efficiency?</h2>
                <p><strong>Pitch Efficiency</strong> is a composite measure of how effectively a pitcher uses each pitch they throw. At its core, it answers the question: &quot;How many pitches does this pitcher need to record outs?&quot; The fewer pitches required per inning — while still commanding the strike zone — the more efficient the pitcher is considered.</p>
                <p>Unlike ERA, which measures outcomes (runs allowed), pitch efficiency measures the <em>process</em>. A pitcher who allows 2 runs in 7 innings on 85 pitches is more efficient than one who allows 2 runs in 7 innings on 120 pitches, even though both share the same statistical line.</p>
                <p>The most common sub-metrics of pitch efficiency include:</p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                    <li><strong>Pitches Per Inning (PPI):</strong> The primary efficiency metric. Total pitches divided by innings pitched.</li>
                    <li><strong>Strike Rate (%):</strong> The percentage of all pitches that are strikes (including fouls and balls in play).</li>
                    <li><strong>Pitches Per Batter (PPB):</strong> Average pitches needed to complete each plate appearance.</li>
                    <li><strong>First-Pitch Strike Rate (FPS%):</strong> The percentage of at-bats where the first pitch is a strike — the most predictive single count-leverage statistic.</li>
                </ul>

                <hr />

                {/* WHY IT MATTERS */}
                <h2 id="why-it-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Pitch Efficiency is Critical for Careers and Teams</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Arm Health and Longevity</h3>
                <p>The most direct consequence of poor pitch efficiency is arm overuse. When a starter throws 125 pitches in 5 innings instead of 90 pitches in 7 innings, they are accumulating significantly more stress per unit of production. Over the course of a 30-start season, that gap compounds to thousands of additional throws. Research from baseball medicine reveals a direct correlation between pitch count accumulation — especially at the per-inning level — and UCL injury risk (the ligament that requires Tommy John surgery when damaged).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Relieving Bullpen Pressure</h3>
                <p>Every inning a starter completes on a low pitch count is an inning saved for the bullpen. In the modern game, bullpens are overworked — teams use 6, 7, 8, and even 9 pitchers per game regularly. Efficient starters who complete 7+ innings on 100 pitches are among the most valuable assets in baseball because they single-handedly reduce the $50 million+ management problem of bullpen health and roster construction.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Quality Start Production</h3>
                <p>A Quality Start (QS) is defined as 6 or more innings pitched with 3 or fewer earned runs allowed. An efficient pitcher with 15 pitches per inning on a 100-pitch limit can almost always reach 6 innings (6 × 15 = 90 pitches, leaving a 10-pitch buffer). An inefficient pitcher throwing 20 pitches per inning is out of the game after just 5 innings on a 100-pitch limit, providing no quality start and forcing bullpen usage in the 5th and 6th innings — typically the highest-leverage offensive innings for the opponent.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Contract and Roster Value</h3>
                <p>From a front office perspective, efficient starters provide significantly more value per dollar. An efficient #4 starter who routinely goes 6–7 innings outperforms an inefficient #2 starter who leaves after 4.1 innings, despite the larger contract. Teams like the Tampa Bay Rays have built decade-long competitive streaks in large part by prioritizing efficient strike-throwing pitchers who maximize bullpen rest.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">MLB, College &amp; Youth Benchmarks</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Major League Baseball (MLB) Starters</h3>
                <ul className="list-disc ml-6 space-y-4 mt-2">
                    <li><strong>Pitches Per Inning (PPI):</strong>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>Elite: Under 14.5 PPI</li>
                            <li>Above Average: 14.5–16.0 PPI</li>
                            <li>League Average: 16.0–17.5 PPI</li>
                            <li>Below Average: 17.5–19.0 PPI</li>
                            <li>Poor: Above 19.0 PPI</li>
                        </ul>
                    </li>
                    <li><strong>Strike Rate:</strong>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>Elite: 66%+</li>
                            <li>Above Average: 63–66%</li>
                            <li>MLB Average: 61–63%</li>
                            <li>Below Average: 58–61%</li>
                            <li>Poor: Under 58%</li>
                        </ul>
                    </li>
                    <li><strong>First-Pitch Strike Rate:</strong>
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>Elite: 65%+</li>
                            <li>Good: 60–65%</li>
                            <li>MLB Average: approximately 58–62%</li>
                            <li>Below Average: Under 55%</li>
                        </ul>
                    </li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">MLB Relievers</h3>
                <p>Reliever efficiency is different from starter efficiency. Relievers typically throw higher-velocity, fewer-pitch types and face batters 1–2 times. They are expected to execute at 14.0 PPI or lower with a strike rate above 65%. Because they face each batter only once, they can pitch more aggressively. First-pitch strike rate is even more critical for relievers, where elite closers often exceed 70% FPS rate.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">College Baseball (NCAA Division I)</h3>
                <p>Elite college starters project at 15–17 PPI, with leading programs like Vanderbilt, Louisiana State, and Arkansas developing pitchers whose efficiency metrics approach MLB projections. The aluminum bat era (before BBCOR) inflated pitch counts; in the BBCOR era, college standards have tightened.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">High School & Youth Baseball</h3>
                <p>At the high school level, a 15–17 PPI pitcher is considered outstanding. Most high school aces sit between 16–19 PPI. Youth baseball (12U–14U) benchmarks skew higher due to control development, with 18–22 PPI being typical for most developmental pitchers. Pitch count rules (mandated by Little League, NFHS, and state athletic associations) are critical injury-prevention measures at these developmental ages.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Fastpitch Softball</h3>
                <p>Softball pitchers operate from 43 feet (at elite competitive levels) with underhand mechanics that generally produce different efficiency profiles. Elite fastpitch pitchers at the NCAA Division I level (like Alabama or Tennessee programs) routinely post 11–13 pitches per inning with 65%+ strike rates, as the shorter distance compresses batter reaction time and leads to quicker contact or strikeouts. At youth recreational levels, 15–20 PPI is typical.</p>

                <hr />

                {/* COMPONENTS */}
                <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Four Components of Pitch Efficiency</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Pitches Per Inning (PPI) — The Starting Point</h3>
                <p>PPI is the most direct measure of efficiency. A pitcher completing 6 innings on 90 pitches (15.0 PPI) has a dramatically better efficiency profile than one completing 6 innings on 114 pitches (19.0 PPI). The practical consequence is devastating: the 19.0 PPI pitcher must exit after approximately 5 innings on a 95-pitch limit, while the 15.0 PPI pitcher can finish 6+ with room to spare.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Strike Rate — The Command Foundation</h3>
                <p>Strike rate is the most direct predictor of PPI. Most inefficiency (high PPI) results from 3-ball counts — the pitcher falls behind and must throw additional pitches to retire the batter. Every walk is approximately 4–5 pitches that produced no out. Improving strike rate by even 3–4 percentage points (from 60% to 64%) can dramatically reduce pitches per inning, as fewer at-bats reach deep counts.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Pitches Per Batter (PPB) — The Sequence Metric</h3>
                <p>PPB captures how efficiently a pitcher retires each batter regardless of how those outs are distributed across innings. Some pitchers are efficient in two ways: either through elite command (getting called strikes) or through contact management (throwing strikes early to generate quick weak contact). Both approaches can produce low PPB figures. A pitcher with 3.5 PPB across 24 batters has used only 84 pitches — extremely efficient for a full game&apos;s work.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. First-Pitch Strike Rate (FPS%) — The Leverage Point</h3>
                <p>Research across decades of MLB data shows that batters who start an at-bat at 0-0 hit dramatically better when the first pitch is a ball (1-0 count) vs. a strike (0-1 count). The batting average differential between 0-1 and 1-0 counts can exceed .100 points. More importantly, first-pitch strikes set up the pitcher for favorable 0-2 and 1-2 counts where strikeout probability spikes and walk probability crashes. Every FPS reduces average pitch count per batter by 0.3–0.5 pitches — seemingly small, but enormous in aggregate over 25+ batters.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Your Pitch Efficiency</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Establish Fastball Command</h3>
                <p>The most reliable first-pitch strike is a well-located fastball. If your fastball command is shaky, you are likely starting too many at-bats with ball one, which triggers the inefficiency cascade. Bullpen sessions dedicated exclusively to fastball location — targeting the inner and outer thirds of the plate, up and down — are the foundation of pitch efficiency improvement.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Develop a Go-To First Pitch Strike Offering</h3>
                <p>Some pitchers benefit from using a secondary pitch (curveball, changeup) as their first-pitch strike weapon precisely because batters expect the fastball. A first-pitch curveball for a called strike puts the batter immediately on the defensive. Elite pitchers are often those who can throw any pitch in any count for a strike, making them essentially unpredictable and allowing them to attack counts immediately.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Work Ahead, Then Pitch Backward</h3>
                <p>Ahead-in-the-count pitching (0-2, 1-2) allows pitchers to use waste pitches and chase pitches without damaging counts. Behind-in-the-count pitching (2-0, 3-1) forces pitchers to throw in the zone, giving hitters an enormous advantage. Teaching &quot;pitch backward&quot; after getting ahead (throw an off-speed pitch when the hitter expects fastball) creates whiffs that are otherwise unavailable when teams are pitching from behind.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Let Contact Work for You</h3>
                <p>Strike-throwing pitchers who generate weak contact (grounders, popups) can be exceptionally efficient even without high strikeout rates. A groundball double play on 3 pitches retires two batters (1.5 pitches per batter) — far more efficient than a strikeout on 7 pitches. Pitchers with elite groundball rates and low walk rates (sinkerballers, submarine pitchers) routinely post 14–15 PPI figures despite modest strikeout numbers.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Understand Hitter Tendencies</h3>
                <p>A pitcher who scouts hitters effectively can attack weaknesses immediately rather than requiring 4–5 pitches to feel out each batter. If a hitter has a documented hole on fastballs up and in, you attack there first-pitch and either get a called strike or a weak pop-up. Pre-game scouting combined with real-time pitch calling directly translates into lower pitch counts per batter across a start.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations: When Efficiency Can Be Misleading</h2>
                <ul className="list-disc ml-6 space-y-3 mt-4">
                    <li><strong>Contact Quality Ignored:</strong> A pitcher can be extremely efficient while allowing hard contact. A pitcher who throws strikes that hitters barrel up (high exit velocity, high hard-hit rate) can have excellent PPI numbers but terrible ERA. Efficiency is about process; ERA is about outcomes.</li>
                    <li><strong>Opponent Quality Matters:</strong> Pitching efficiently against the bottom of a weak lineup is dramatically easier than against the heart of an elite lineup. A pitcher who faces 6 cleanup-type hitters in a game will naturally accumulate more pitches than one facing weaker hitters regardless of command quality.</li>
                    <li><strong>Single-Game vs. Season-Level Data:</strong> One efficient start doesn&apos;t make an efficient pitcher. Pitching efficiency should ideally be measured over 10–15+ starts to smooth out variance from lucky/unlucky at-bats. A single 9-inning shutout on 95 pitches is remarkable but may reflect opponent weakness as much as true efficiency.</li>
                    <li><strong>Deceptive vs. Command-Based Efficiency:</strong> Some pitchers achieve low PPI through unusual deceptive deliveries (submarine, sidearm) that force quick contact rather than true command. This is still efficiently effective but for different reasons, and it creates different scouting adaptations from opponents over time.</li>
                    <li><strong>Ballpark Effects:</strong> Walk rates are somewhat park-independent, but contact-based efficiency varies. Pitcher-friendly parks with large foul territories (or altitude effects) can naturally reduce pitch counts by creating more foul-outs and reducing extra-base hits that drive up hitter pitch patience.</li>
                </ul>

                <hr />

                {/* MODERN */}
                <h2 id="modern" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Pitch Efficiency in the Analytics Era</h2>
                <p>Modern baseball analytics has created sophisticated extensions of pitch efficiency. The Statcast era has introduced concepts like &quot;Stuff+&quot; (quality of pitch movement and velocity), &quot;Location+&quot; (accuracy of pitch placement), and &quot;Pitching+&quot; (the composite of stuff and location), which together predict future ERA better than traditional metrics.</p>
                <p>Pitch efficiency in the Statcast era is also measured through &quot;Whiff Rate&quot; (swinging strikes per swing) — a pitcher who generates more whiffs per swing can be somewhat less efficient (more pitches per at-bat) but still be more effective because batters are making poor contact when they do swing. The trade-off between efficiency and swing-and-miss rate is a crucial analytical balance.</p>
                <p>TrackMan and Rapsodo technology now allow college and even high school programs to measure pitch efficiency alongside Stuff metrics in real time. A pitcher who has 15 PPI, 64% strike rate, and 28% whiff rate on his best pitch is an analytically complete picture that even 10 years ago would have required extensive manual scorekeeping to assemble. Today, coaches at all levels can make data-driven efficiency decisions within seconds of a pitcher leaving the field.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Pitch Efficiency in Baseball and Softball
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the ideal number of pitches per inning for a starter?</h4>
                            <p className="text-muted-foreground">
                                The target is 15 pitches per inning or fewer for elite starters. At 15 PPI, a pitcher on a 105-pitch limit can complete 7 full innings — enough for a win in modern baseball without overextending the arm. MLB&apos;s historical greats — like Greg Maddux, who frequently completed games on 100–110 pitches — averaged below 14 pitches per inning throughout their careers. For youth baseball, a PPI under 17–18 is considered above average given the developmental control challenges.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does first-pitch strike rate affect a pitcher&apos;s performance?</h4>
                            <p className="text-muted-foreground">
                                The effect is dramatic and statistically significant. MLB research shows that batters in 0-1 counts (first pitch was a strike) hit approximately .170–.200, while batters in 1-0 counts (first pitch was a ball) hit approximately .310–.350. This gap of 130–150 points of batting average on a single-count difference demonstrates the massive leverage of first-pitch strikes. Pitchers with 65%+ FPS rates typically allow 20–30% fewer walks than those with 50% FPS rates, dramatically lowering their pitch counts across a start.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a higher strike rate always better for pitch efficiency?</h4>
                            <p className="text-muted-foreground">
                                Generally yes, but with nuance. A pitcher&apos;s goal isn&apos;t to throw strikes at 75% simply by grooving pitches over the middle of the plate. &quot;Quality strikes&quot; — pitches that are strikes but positioned in difficult-to-hit locations (corners, low in the zone) — are far more valuable than strikes right down the middle. A 63% strike rate with excellent pitch location is more valuable than a 68% strike rate throwing to the heart of the plate and allowing hard contact. Command (where the ball goes) is more important than raw control (whether it&apos;s a strike or not).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a &quot;Quality Start&quot; and how does pitch efficiency affect it?</h4>
                            <p className="text-muted-foreground">
                                A Quality Start is defined as at least 6 innings pitched with 3 or fewer earned runs. Pitch efficiency directly enables quality starts. A pitcher at 15 PPI on a 95-pitch limit can complete exactly 6.1 innings. A pitcher at 18 PPI on the same limit can only reach 5.2 innings — falling short. Elite starters who regularly post quality starts (typically QS rates of 70%+) have consistently low PPI because the ability to work deep into games is fundamentally a pitch efficiency achievement.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is pitch efficiency different for starters vs. relievers?</h4>
                            <p className="text-muted-foreground">
                                Relievers operate under different expectations. Because they pitch 1–2 innings maximum and often face batters for the first time with a fresh arm, they are expected to be more aggressive and maintain a lower PPI. Elite closers routinely post 12–14 PPI figures and strike rates above 65%. For starters, the 5th–9th innings naturally see PPI rise as batters see the pitcher for the second and third time — familiarity breeds patience, leading to more deep counts. This is why PPI should be tracked per-inning for starters (not just as a season average) to identify where in a game efficiency breaks down.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a pitcher have high pitch efficiency but a poor ERA?</h4>
                            <p className="text-muted-foreground">
                                Yes — and it happens more than people expect. Pitch efficiency measures process (how many pitches per out), while ERA measures outcome (runs allowed). A pitcher who throws 14 pitches per inning but gives up hard line drives and home runs can have excellent efficiency and a poor ERA simultaneously. Conversely, a pitcher who walks batters frequently (high PPI) but somehow strands them can have poor efficiency but a decent ERA. The most complete pitcher combines efficiency (low PPI, high strike rate) with effectiveness (quality contact allowed — low exit velocity, high groundball rate).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does pitch count management differ for youth vs. professional baseball?</h4>
                            <p className="text-muted-foreground">
                                Youth baseball has strict pitch count rules designed for arm protection during developmental years. Little League Baseball limits pitchers by age: for ages 13–16, the daily limit is 95 pitches, requiring at least 4 days of rest after 76+ pitches. For ages 11–12, the limit drops to 85 pitches. These limits are based on growth plate vulnerability in young arms. Professional baseball has soft limits — typically 100–110 pitches for most starters — that the coaching staff enforces based on heat, workload trends, and perceived fatigue signs. Professional pitchers have fully developed arms and years of progressive conditioning, allowing significantly higher workloads than youth pitchers.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What was Greg Maddux&apos;s typical pitch efficiency, and why was he so exceptional?</h4>
                            <p className="text-muted-foreground">
                                Greg Maddux is widely considered the greatest pitch efficiency practitioner in MLB history. He routinely completed 9-inning outings on 95–115 pitches — achieving approximately 10.5–12.8 PPI. His secret was legendary location combined with elite pitch sequencing. Maddux rarely threw a pitch without a specific purpose, setting up future pitches with each delivery. He induced massive amounts of weak contact (groundballs, soft line drives) because batters were reacting to pitches on the corners far from the ideal hitting zone. His career walk rate of 1.8 BB/9 innings is among the lowest in modern history — almost exclusively the result of his near-inhuman command of the baseball to all four quadrants of the strike zone.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How should a softball coach track pitch efficiency differently from a baseball coach?</h4>
                            <p className="text-muted-foreground">
                                Fastpitch softball coaching must account for the shorter pitching distance (43 feet), the underhand delivery mechanics, and the fact that most competitive youth/HS divisions allow pitcher re-entry (the same pitcher can re-enter the game). This means per-game pitch counts matter less in some softball formats than in baseball. However, the physical stress on the underhand delivery — particularly the shoulder, hip rotation, and ulnar collateral ligament — is still significant, and overuse injuries in softball pitchers are a growing concern. A softball coach should still track PPI and FPS rate as leading indicators of arm fatigue and mechanics breakdown, particularly during tournament weekends when a pitcher might throw 200–300 pitches across multiple games.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does pitch efficiency change as a pitcher ages?</h4>
                            <p className="text-muted-foreground">
                                Generally yes, in both positive and negative directions depending on the pitcher. Young pitchers (ages 20–24) often struggle with efficiency because their command is still developing and they haven&apos;t learned to attack hitters sequentially. As pitchers mature (25–32), command typically peaks and PPI often drops as experience compounds with physical prime. In the late career (33+), some pitchers see efficiency improve even further as pure stuff declines but pitch intelligence peaks — they become &quot;craftsmen&quot; who live on location and sequencing. Other aging pitchers see efficiency decline as diminished fastball command forces them to fall behind in counts more frequently. The trajectory is highly individual.
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
                                    <strong className="block text-primary mb-1">Pitching Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Quantify a pitcher&apos;s outing efficiency after each start. Track improvements in PPI, strike rate, and FPS% through a season to identify development trends.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Youth & High School Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Enforce appropriate pitch count management decisions. Use data to identify when a pitcher&apos;s efficiency is dropping (PPI rising) as an early fatigue indicator.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">College Recruiting Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate a high school pitcher&apos;s command profile beyond pure velocity. A 15 PPI pitcher with 65% strike rate projects better to the next level than an 85 MPH pitcher who walks 5 per game.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Baseball Managers</strong>
                                    <span className="text-sm text-muted-foreground">Identify undervalued pitchers (low ERA candidates) who throw with high efficiency. Efficient pitchers are more durable across long seasons and less likely to implode due to fatigue-driven walks.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations: When Pitch Efficiency Can Be Misleading</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                    <p className="text-sm text-muted-foreground"><strong>Doesn&apos;t measure contact quality:</strong> An efficient pitcher who allows hard contact might have excellent efficiency metrics but terrible outcomes (high ERA). Always pair this calculator with ERA and WHIP context.</p>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                    <p className="text-sm text-muted-foreground"><strong>Single-game sample limitations:</strong> One exceptional outing can produce misleading efficiency scores. Track across 5+ starts for a meaningful picture of a pitcher&apos;s true efficiency profile.</p>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                    <p className="text-sm text-muted-foreground"><strong>Does not account for inning-by-inning fatigue:</strong> A pitcher might be very efficient in innings 1–4 and dramatically inefficient in innings 5–7 as fatigue sets in. The aggregate number can hide concerning efficiency patterns late in starts.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Case Study A (The Efficient Craftsman):</strong><br />
                                        Pitcher A throws 93 pitches over 6.2 innings (13.9 PPI). Strike rate: 67%. First-pitch strike rate: 68%. He faced 24 batters and struck out 6, walked 1, and allowed 6 hits — but none for extra bases. Result: his efficiency score is 82/100 — Elite. Despite not being dominant, he&apos;s deeply efficient and his bullpen barely had to warm up.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Case Study B (The Inefficient Strikeout Artist):</strong><br />
                                        Pitcher B throws 118 pitches over 6.0 innings (19.7 PPI). He struck out 11 but walked 5 and faced 28 batters. Strike rate: 58%. FPS rate: 48%. His strikeout dominance is masking serious walk and count problems. Efficiency score: 32/100 — Poor. Despite the impressive K total, he&apos;s burning through the bullpen and won&apos;t survive a deep playoff run on this pitch-to-performance ratio.
                                    </p>
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
                            <h2 className="font-semibold text-lg mb-2">Final Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Baseball/Softball Pitch Efficiency Calculator transforms raw pitching data into a comprehensive efficiency profile. By combining Pitches Per Inning, Strike Rate, Pitches Per Batter, and First-Pitch Strike Rate into a single weighted score, this calculator identifies the pitchers who command games, protect bullpens, and build long, durable careers.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Efficiency is not the only dimension of pitching excellence — stuff quality, strikeout rates, and contact management all matter enormously. But efficiency is the foundation. Without it, even the most talented pitcher becomes a liability by the 5th inning. With it, even a pitcher without elite velocity can last 7–8 innings and deliver the competitive &quot;innings&quot; that win games and protect roster health across a long season.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
