import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Activity } from 'lucide-react';
import BasketballFieldGoalPercentageCalculatorInteractive from './basketball-field-goal-percentage-calculator-interactive';

export default function BasketballFieldGoalPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball Field Goal Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your Field Goal Percentage (FG%) to measure overall shooting efficiency and scoring impact.
                </p>
            </div>

            <BasketballFieldGoalPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        The fundamental stats required for FG% calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <CheckCircle2 className="h-4 w-4" />
                                Field Goals Made (FGM)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of field goals (2-pointers and 3-pointers) that successfully went through the hoop.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes layups, dunks, mid-range, and 3-pointers</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Does NOT include Free Throws</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Target className="h-4 w-4" />
                                Field Goals Attempted (FGA)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of shots taken from the field, including both made and missed shots.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Counts blocked shots as attempts</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Excluded if a foul is called (unless the shot goes in)</span>
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
                            FG% = (Field Goals Made / Field Goals Attempted) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This formula calculates the raw shooting percentage from the field. It treats 2-point and 3-point shots equally in terms of make/miss ratio, unlike Effective Field Goal Percentage (eFG%) which helps weight 3-pointers.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Sports Calculators
                    </CardTitle>
                    <CardDescription>
                        Level up your analytics game
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/basketball-free-throw-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Free Throw %</p>
                                            <p className="text-sm text-muted-foreground">Shooting consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-goals-per-90-minutes-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Goals Per 90</p>
                                            <p className="text-sm text-muted-foreground">Scoring rate</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/cricket-win-probability-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Win Probability</p>
                                            <p className="text-sm text-muted-foreground">Match prediction</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/team-batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Team Average</p>
                                            <p className="text-sm text-muted-foreground">Collective performance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-fantasy-points-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Fantasy Points</p>
                                            <p className="text-sm text-muted-foreground">Player valuation</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/cricket-partnership-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
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
                <meta itemProp="name" content="The Complete Guide to Field Goal Percentage (FG%): Efficiency, Selection, and Improvement" />
                <meta itemProp="description" content="A deep dive into Basketball Field Goal Percentage. Learn how to calculate FG%, understand shooting benchmarks by position, and master shot selection to improve your efficiency." />
                <meta itemProp="keywords" content="basketball field goal percentage, FG% calculator, shooting efficiency, shot selection, basketball stats, effective field goal percentage" />
                <meta itemProp="author" content="MegaCalc Basketball Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Field Goal Percentage: Mastering Offensive Efficiency</h2>
                <p className="text-lg italic text-muted-foreground">Understand the most fundamental shooting metric in basketball, why it matters, and how to optimize your game for higher efficiency.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Field Goal Percentage?</a></li>
                    <li><a href="#calculation" className="hover:underline">How to Calculate FG%</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks by Position: Guard vs. Center</a></li>
                    <li><a href="#limitations" className="hover:underline">The &quot;Deandre Jordan Effect&quot; (Limitations)</a></li>
                    <li><a href="#efg" className="hover:underline">FG% vs. Effective Field Goal Percentage (eFG%)</a></li>
                    <li><a href="#improvement" className="hover:underline">Strategies to Improve Your FG%</a></li>
                    <li><a href="#shot-selection" className="hover:underline">The Art of Shot Selection</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Field Goal Percentage?</h2>
                <p><strong>Field Goal Percentage (FG%)</strong> is the ratio of field goals made to field goals attempted. In basketball, a &quot;field goal&quot; is any shot scored from the court during live play, including 2-pointers (layups, dunks, mid-range jumpshots) and 3-pointers. Free throws do not count as field goals.</p>
                <p>This statistic serves as the primary indicator of a player&apos;s or team&apos;s shooting accuracy. A high FG% generally suggests an efficient offense that generates high-quality shots, while a low FG% often indicates forced shots or poor execution.</p>

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate FG%</h2>
                <p>The math is simple, yet it drives billion-dollar decisions in the NBA.</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        FG% = (Field Goals Made / Field Goals Attempted) × 100
                    </p>
                </div>

                <p><strong>Example:</strong> LeBron James shoots 10 for 15 in a game.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Made:</strong> 10</li>
                    <li><strong>Attempted:</strong> 15</li>
                    <li><strong>Calculation:</strong> (10 / 15) × 100 = 66.7%</li>
                </ul>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks by Position: Context is King</h2>
                <p>Not all 50% shooters are created equal. Since shots near the basket are easier to make than perimeter shots, average FG% varies heavily by position.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Centers / Bigs</h3>
                <p>Centers who primarily catch lobs and attempt put-backs typically have the highest FG%.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Elite:</strong> &gt;65% (e.g., Rudy Gobert, DeAndre Jordan)</li>
                    <li><strong>Good:</strong> 55-60%</li>
                    <li><strong>Average:</strong> 50-55%</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Forwards / Wings</h3>
                <p>These players take a mix of drives and jumpers.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Elite:</strong> &gt;50% (e.g., Kevin Durant, LeBron James)</li>
                    <li><strong>Good:</strong> 45-49%</li>
                    <li><strong>Average:</strong> 42-45%</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Guards</h3>
                <p>Guards take the most difficult shots (off the dribble, from distance) and thus have lower expected percentages.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Elite:</strong> &gt;48% (e.g., Stephen Curry, Kyrie Irving)</li>
                    <li><strong>Good:</strong> 43-47%</li>
                    <li><strong>Average:</strong> 40-43%</li>
                </ul>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The &quot;Deandre Jordan Effect&quot; (Limitations)</h2>
                <p>FG% can be misleading without context. A center who only dunks the ball might shoot 70%, while a superstar guard who carries the offense with difficult 3-pointers shoots 45%. Is the center a &quot;better&quot; shooter? No.</p>

                <p><strong>Key Limitations:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Volume:</strong> Low-volume players often have inflated percentages.</li>
                    <li><strong>Shot Difficulty:</strong> FG% doesn&apos;t account for the difficulty of the shot created.</li>
                    <li><strong>3-Point Disadvantage:</strong> A player shooting 40% from 3 is more valuable than a player shooting 45% from 2, but raw FG% penalizes the 3-point shooter.</li>
                </ul>

                {/* EFG */}
                <h2 id="efg" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">FG% vs. Effective Field Goal Percentage (eFG%)</h2>
                <p>Because 3-pointers are worth 50% more than 2-pointers, modern analytics prefers <strong>Effective Field Goal Percentage (eFG%)</strong>. This metric adjusts for the extra value of the 3-ball.</p>
                <p><em>Formula: (FGM + 0.5 * 3PM) / FGA</em></p>
                <p>However, traditional FG% remains the standard for box scores and general broadcast graphics because of its simplicity.</p>

                <hr />

                {/* IMPROVEMENT */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Your FG%</h2>
                <p>Improving efficiency isn&apos;t just about &quot;shooting better&quot;—it&apos;s about playing smarter.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Improve Shot Selection</h3>
                <p>The fastest way to raise your FG% is to eliminate low-percentage shots. Avoid contested long 2s. Prioritize layups and open catch-and-shoot 3s.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Move Without the Ball</h3>
                <p>Stationary targets are easy to guard. Cutting to the basket or relocating on the perimeter gets you easier, open looks, which are statistically more likely to go in.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Develop a &quot;Go-To&quot; Move</h3>
                <p>Having one unstoppable move (like a floater or a drop-step) that you can execute at a high percentage gives you a safety valve when the offense breaks down.</p>

                {/* SHOT SELECTION */}
                <h2 id="shot-selection" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Art of Shot Selection</h2>
                <p>Shot selection is the mental component of FG%. A &quot;good shot&quot; varies by player:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Range:</strong> Only take shots you practice. If you shoot 20% from 3 in practice, don't take them in games.</li>
                    <li><strong>Context:</strong> A contested jumper with 2 seconds on the shot clock is a &quot;good shot.&quot; The same shot with 18 seconds left is a &quot;bad shot.&quot;</li>
                    <li><strong>Rhythm:</strong> Stepping into a shot in rhythm yields higher percentages than hesitating.</li>
                </ul>

                <hr />

                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Summary</h2>
                <p>Field Goal Percentage (FG%) is the baseline metric of basketball efficiency. While advanced stats like eFG% and True Shooting % (TS%) offer more nuance, FG% remains the universal language for &quot;making shots.&quot; By understanding your role, refining your shot selection, and mastering your mechanics, you can maximize your FG% and become a more valuable asset to any team.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Field Goal Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do I calculate Field Goal Percentage?</h4>
                            <p className="text-muted-foreground">
                                Divide total made field goals (2s and 3s) by total attempts. Multiply by 100. Do not include free throws.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good FG% for a Point Guard?</h4>
                            <p className="text-muted-foreground">
                                For a point guard, anything above 43-45% is considered good. Over 48% is elite. Guards generally have lower percentages because they take more difficult perimeter shots compared to centers.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does FG% include Free Throws?</h4>
                            <p className="text-muted-foreground">
                                No. Free throws are tracked separately as FT%. They are not "field goals" because they happen while the clock is stopped. To include free throws in efficiency, use True Shooting Percentage (TS%).
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is 50/40/90 impressive?</h4>
                            <p className="text-muted-foreground">
                                The 50/40/90 club refers to shooting 50% from the field, 40% from 3-point range, and 90% from the free-throw line over a whole season. It represents the pinnacle of all-around shooting efficiency. Very few players (Nash, Bird, Curry, Durant, Brogdon) have achieved it.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does volume affect FG%?</h4>
                            <p className="text-muted-foreground">
                                Typically, as volume increases (taking more shots), efficiency decreases because the defense focuses more on you, forcing tougher shots. Maintaining a high FG% on high volume is the mark of a superstar.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the highest career FG%?</h4>
                            <p className="text-muted-foreground">
                                DeAndre Jordan holds the record (approx 67%), primarily because almost all his shots are dunks and layups (high percentage). This highlights the contextual difference between centers and shooters.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is eFG%?</h4>
                            <p className="text-muted-foreground">
                                Effective Field Goal Percentage (eFG%) adjusts FG% to account for the fact that 3-pointers are worth 1.5x more than 2-pointers. It is a more accurate measure of scoring value per shot.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a &quot;Field Goal&quot;?</h4>
                            <p className="text-muted-foreground">
                                A field goal is any basket scored on any shot other than a free throw. It includes 2-point shots (dunks, layups, jumpers) and 3-point shots.
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
                                    <strong className="block text-primary mb-1">Scoring Guards</strong>
                                    <span className="text-sm text-muted-foreground">Check if your shot selection is holding your team back.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Indentify the most efficient lineups.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Role Players</strong>
                                    <span className="text-sm text-muted-foreground">Prove your efficiency value to earn more minutes.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Break down box scores quickly.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <strong className="block mb-1">Case Study A: The Slasher</strong>
                                    <p className="text-sm text-muted-foreground">
                                        Player shoots 8/12, mostly layups. <br />
                                        FG% = 66.7%. <br />
                                        <strong>Analysis:</strong> Highly efficient, putting pressure on the rim.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <strong className="block mb-1">Case Study B: The Chucker</strong>
                                    <p className="text-sm text-muted-foreground">
                                        Player shoots 8/25, mostly contested jumpers. <br />
                                        FG% = 32%. <br />
                                        <strong>Analysis:</strong> Hurts the offense; &quot;shooting the team out of the game&quot;.
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
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Basketball Field Goal Percentage Calculator allows players and coaches to instantly assess offensive efficiency.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                While it is a raw metric, a high FG% is the hallmark of effective offense. Use this number as a starting point to dive deeper into shot charts and play types.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
