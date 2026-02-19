import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, AlertCircle, Info, Calculator, BarChart3, TrendingUp, Target, Users, CheckCircle2, FunctionSquare, Activity } from 'lucide-react';
import BasketballOffensiveEfficiencyCalculatorInteractive from './basketball-offensive-efficiency-calculator-interactive';

export default function BasketballOffensiveEfficiencyCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball Offensive Efficiency Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate Offensive Rating (Points Per 100 Possessions) to measure true scoring effectiveness, independent of game pace.
                </p>
            </div>

            <BasketballOffensiveEfficiencyCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics for calculating possessions and efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Scoring Actions
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Events that directly attempt to score points.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Points:</strong> Total points scored (FG + FT).</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>FGA &amp; FTA:</strong> Used to estimate how many possessions were &quot;used&quot; to get those points.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Possession Modifiers
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Events that extend or end possessions without a shot.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>Offensive Rebounds (ORB):</strong> Subtracts from possession count because it extends the <em>same</em> possession.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>Turnovers:</strong> Ends a possession with 0 points.</span>
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
                        <p className="font-mono text-sm md:text-center mb-2">
                            <strong>Offensive Rating</strong> = 100 × (Points Scored / Possessions)
                        </p>
                        <p className="font-mono text-sm md:text-center text-muted-foreground">
                            <strong>Possessions</strong> ≈ FGA - ORB + TOV + (0.44 × FTA)
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This widely accepted formula estimates the number of possessions a player or team used. By normalizing points to per-100 possessions, we can compare efficiency across different game speeds.
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
                        <Link href="/category/sports-training/basketball-usage-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Usage Rate</p>
                                            <p className="text-sm text-muted-foreground">Offensive load</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-field-goal-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">FG% Calculator</p>
                                            <p className="text-sm text-muted-foreground">Shot accuracy</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-true-shooting-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">True Shooting %</p>
                                            <p className="text-sm text-muted-foreground">Total scoring efficiency</p>
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
                                            <p className="text-sm text-muted-foreground">Ball security</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-player-efficiency-rating-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">PER Calculator</p>
                                            <p className="text-sm text-muted-foreground">Overall value</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-free-throw-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Free Throw %</p>
                                            <p className="text-sm text-muted-foreground">Basic accuracy</p>
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
                <meta itemProp="name" content="The Complete Guide to Basketball Offensive Efficiency (ORtg)" />
                <meta itemProp="description" content="Understand Offensive Efficiency (Points Per 100 Possessions) in basketball. Learn why pace-adjusted stats are superior to PPG, calculate your own ORtg, and discover how to improve scoring effectiveness." />
                <meta itemProp="keywords" content="basketball offensive efficiency, offensive rating calculator, ORtg formula, points per 100 possessions, basketball analytics, Dean Oliver metrics" />
                <meta itemProp="author" content="MegaCalc Basketball Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Mastering Offensive Efficiency: Beyond Points Per Game</h2>
                <p className="text-lg italic text-muted-foreground">In the modern era of basketball, raw scoring totals means little without context. Offensive efficiency—measuring how many points are produced per possession—is the true gold standard of performance analysis.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Offensive Efficiency?</a></li>
                    <li><a href="#why-pace-matters" className="hover:underline">Why &quot;Per 100 Possessions&quot;? (The Pace Problem)</a></li>
                    <li><a href="#formula-breakdown" className="hover:underline">Breaking Down the Formula</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What is a Good Rating?</a></li>
                    <li><a href="#four-factors" className="hover:underline">Dean Oliver&apos;s Four Factors</a></li>
                    <li><a href="#strategies" className="hover:underline">How to Improve Efficiency</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Offensive Efficiency?</h2>
                <p><strong>Offensive Efficiency</strong>, often referred to as <strong>Offensive Rating (ORtg)</strong>, is a statistic that estimates the number of points a player or team produces per 100 possessions. </p>

                <p className="mt-4">It essentially asks: <em>&quot;If we gave the ball to this team (or player) 100 times, how many points would they score?&quot;</em></p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Individual vs. Team Efficiency</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Team Offensive Rating:</strong> Measures the team&apos;s total points scored per 100 possessions. This is the primary metric for continuous team evaluation.</li>
                    <li><strong>Individual Offensive Rating:</strong> Measures how efficiently an individual player produces points when they use a possession (shoot, get to the line, or turnover). This calculator focuses on this individual aspect.</li>
                </ul>

                <hr />

                {/* PACE PROBLEM */}
                <h2 id="why-pace-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why &quot;Per 100 Possessions&quot;? (The Pace Problem)</h2>
                <p>Imagine two teams:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Team A:</strong> Scores 100 points in a fast-paced game with 110 possessions.</li>
                    <li><strong>Team B:</strong> Scores 90 points in a slow, defensive grind with 85 possessions.</li>
                </ul>
                <p className="mt-4">If you only look at &quot;Points Per Game,&quot; Team A looks better (100 vs 90). However, Team A wasted many possessions. Calculated efficiently:</p>

                <div className="my-4 bg-muted p-4 rounded-lg font-mono text-sm">
                    Team A Efficiency: (100 / 110) * 100 = <strong>90.9 points per 100</strong> (Poor)<br />
                    Team B Efficiency: (90 / 85) * 100 = <strong>105.8 points per 100</strong> (Good)
                </div>

                <p>Team B is actually the more dangerous offensive team—they just play slower. Normalizing to 100 possessions strips away the &quot;pace&quot; bias and reveals the true quality of execution.</p>

                <hr />

                {/* FORMULA */}
                <h2 id="formula-breakdown" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Breaking Down the Formula</h2>
                <p>The core calculation relies on estimating <strong>Possessions</strong>. Since official possession counts (from play-by-play data) aren&apos;t always available at amateur levels, we use a statistical estimate:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-lg text-primary font-bold">
                        Possessions = FGA - ORB + TOV + (0.44 × FTA)
                    </p>
                </div>

                <p>Here is why each component is included:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>FGA (Field Goal Attempts):</strong> Usually ends a possession.</li>
                    <li><strong>- ORB (Minus Offensive Rebounds):</strong> If you miss but get the rebound, the possession <em>continues</em>. Therefore, we subtract the rebound to avoid double-counting the possession when the next shot goes up.</li>
                    <li><strong>+ TOV (Plus Turnovers):</strong> A turnover ends a possession with 0 points.</li>
                    <li><strong>+ 0.44 × FTA:</strong> Technical factor for free throws.</li>
                </ul>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What is a Good Rating?</h2>
                <p>Efficiency standards change over time (today's NBA is far more efficient than the 90s due to the 3-point shot), but general rules apply:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Elite (115+)</h4>
                        <p className="text-sm">The best offenses in NBA history operate at 115-120+. Players like Nikola Jokić or Steph Curry regularly exceed 120 individually.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Good (108-114)</h4>
                        <p className="text-sm">A solid, playoff-caliber offense or an efficient starter. This is the target for most competitive teams.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Average (100-107)</h4>
                        <p className="text-sm"> League average fluctuates, but 100-105 is typically &quot;average.&quot; You win games with defense if your offense is here.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Poor (Below 100)</h4>
                        <p className="text-sm">Struggling to score. Often indicates too many turnovers or poor shooting percentages (eFG% below 50%).</p>
                    </div>
                </div>

                <hr />

                {/* FOUR FACTORS */}
                <h2 id="four-factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dean Oliver&apos;s Four Factors</h2>
                <p>Basketball pioneer Dean Oliver identified the &quot;Four Factors&quot; that contribute to winning offensive efficiency. If you want to improve your ORtg, focus on these (in order of importance):</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Effective Field Goal Percentage (eFG%) (40% Weight)</h3>
                <p>Shooting the ball into the hoop is the most important thing. eFG% accounts for the extra value of 3-pointers.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Turnover Percentage (TOV%) (25% Weight)</h3>
                <p>You can&apos;t score if you don&apos;t shoot. Turnovers are the deadliest efficiency killer because they produce 0 points and often lead to easy fast-break points for the opponent.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Offensive Rebounding Rate (ORB%) (20% Weight)</h3>
                <p>An offensive rebound gives you a &quot;free&quot; second chance. It&apos;s like resetting the possession without the opponent getting a turn.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Free Throw Rate (FTR) (15% Weight)</h3>
                <p>Getting to the line implies aggressive offense. Free throws are the most efficient shot in basketball (avg ~1.5 points per possession).</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Improve Efficiency</h2>
                <p>Based on the factors above, here are concrete steps for players to improve their rating:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Eliminate the &quot;Long 2&quot;:</strong> It is statistically the worst shot in basketball. Step back for a 3, or drive for a layup/foul.</li>
                    <li><strong>Value the Ball:</strong> A fancy pass that leads to a turnover is worse than a simple pass that maintains possession.</li>
                    <li><strong>Crash the Glass:</strong> Even guards can secure long rebounds. An extra possession is statistically as valuable as a steal.</li>
                    <li><strong>Hunt Free Throws:</strong> Drive into contact. Force the defense to foul you. It slows the game down and provides &quot;easy&quot; points.</li>
                </ul>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>The Basketball Offensive Efficiency Calculator (ORtg) is the lens through which modern coaches view the game. It removes the illusion of speed and forces teams to confront the reality of their execution. Whether you are analyzing a single player's contribution or an entire team's system, Points Per 100 Possessions is the metric that matters most.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about offensive efficiency stats
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does this calculator work for both teams and players?</h4>
                            <p className="text-muted-foreground">
                                Yes. The formula is identical. If you input a team's total stats (Team Points, Team FGA, etc.), you get the Team Offensive Rating. If you input a player's stats, you get their individual Offensive Rating for the possessions they used.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is Offensive Rating usually around 100?</h4>
                            <p className="text-muted-foreground">
                                It represents points per 100 possessions. Since a &quot;good&quot; possession yields about 1 point on average (e.g., 50% shooting on 2-pointers), the rating naturally hovers near 100. Ratings of 115+ are considered phenomenal because they imply scoring 1.15 points every time you touch the ball.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the difference between PER and Offensive Rating?</h4>
                            <p className="text-muted-foreground">
                                PER (Player Efficiency Rating) computes a single number summarizing all contributions (defense, rebounding, etc.) into a per-minute rating. Offensive Rating strictly measures <em>scoring efficiency</em> relative to possessions used. PER favors volume; ORtg favors efficiency.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why do offensive rebounds subtract from possessions?</h4>
                            <p className="text-muted-foreground">
                                If you shoot, miss, get the rebound, and shoot again, that is conceptually <strong>one</strong> extended possession for your team, not two separate ones. Subtracting the rebound corrects the math so you aren't penalized for taking two shots in the same sequence.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does the 3-point shot affect Offensive Rating?</h4>
                            <p className="text-muted-foreground">
                                Drastically. Shooting 40% from 3 yields 1.2 points per possession (120 ORtg), whereas shooting 50% from 2 yields 1.0 points per possession (100 ORtg). Modern teams hunt 3-pointers precisely because they are mathematically more efficient, raising league-average ORtg.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is True Shooting (TS%) and how does it relate?</h4>
                            <p className="text-muted-foreground">
                                True Shooting Percentage measures <em>shooting efficiency</em> (accounting for 2s, 3s, and FTs). Offensive Rating measures <em>possession efficiency</em> (accounting for shooting AND turnovers). A player can have high TS% but a low ORtg if they commit many turnovers.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a player have a high ORtg but be a &quot;bad&quot; offensive player?</h4>
                            <p className="text-muted-foreground">
                                Yes, if their volume is very low. A player who only dunks the ball twice (4 points) in a game with no misses or turnovers has a massive ORtg but minimal impact. Context (Usage Rate) is always required to evaluate volume scorers vs. efficient specialists.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a 120 ORtg possible over a whole season?</h4>
                            <p className="text-muted-foreground">
                                Yes, for elite teams or players. The greatest offensive teams in NBA history (e.g., 2024 Celtics, 2021 Nets) have posted season-long team ratings exceeding 120. Individually, dominant centers and elite shooters often sustain 120+ ratings.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why are turnovers weighted so heavily in efficiency?</h4>
                            <p className="text-muted-foreground">
                                A missed shot at least offers a chance for an offensive rebound (~25-30% probability). A turnover ends the possession immediately with a 0% chance of scoring and often guarantees the opponent an easy transition opportunity. Turnovers are the most damaging event in an offense.
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
                                    <span className="text-sm text-muted-foreground">Compare lineup efficiencies. Does your bench unit score efficiently even if they score fewer points?</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Identify undervalued players who don&apos;t score 20 PPG but are hyper-efficient with their touches.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Point Guards</strong>
                                    <span className="text-sm text-muted-foreground">Understand the value of a possession. Learn why a turnover is so costly.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Betting Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Predict team totals by analyzing pace-adjusted efficiency trends rather than raw scores.</span>
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
                                The Basketball Offensive Efficiency Calculator (ORtg) is the essential tool for pace-independent analysis.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By focusing on points produced per 100 possessions, it provides the most accurate measure of scoring quality available to coaches and players.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
