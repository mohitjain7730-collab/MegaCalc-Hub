import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, BookOpen, Share2, Timer } from 'lucide-react';
import BasketballReboundRateCalculatorInteractive from './basketball-rebound-rate-calculator-interactive';

export default function BasketballReboundRateCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball Rebound Rate Calculator (TRB%)</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate the gold standard rebounding metric: the percentage of available rebounds a player grabs while on the court.
                </p>
            </div>

            <BasketballReboundRateCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Why we need team and opponent stats for accuracy
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Timer className="h-4 w-4" />
                                Minutes Played (MP)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Crucial for the "Rate" calculation. A player who grabs 10 rebounds in 20 minutes is far more dominant than one who grabs 10 rebounds in 48 minutes.
                            </p>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Crown className="h-4 w-4" />
                                Total Team & Opponent Rebounds
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Used to determine "Total Opportunities." If there were only 20 missed shots in a game, grabbing 10 rebounds is historic (50%). If there were 100 misses, 10 rebounds is just okay (10%).
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                <Target className="h-4 w-4" />
                                Team Minutes
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Standardizes the calculation for 5 players on the court. Usually 48 mins (NBA) or 40 mins (College/FIBA).
                            </p>
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
                        <p className="font-mono text-lg text-center">
                            TRB% = 100 × (Total Rebounds × (Team Minutes / 5)) / (Player Minutes × (Team Rebounds + Opponent Rebounds))
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This advanced formula calculates the percentage of available rebounds a player obtained while they were on the floor. It adjusts for game length and pace, making it superior to raw "Rebounds Per Game."
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Basketball Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/basketball-player-efficiency-rating-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">PER Calculator</p>
                                            <p className="text-sm text-muted-foreground">Overall productivity</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/basketball-assist-to-turnover-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Share2 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Assist/Turnover Ratio</p>
                                            <p className="text-sm text-muted-foreground">Passing efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/basketball-true-shooting-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                        <Link href="/sports-training/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Win Rate</p>
                                            <p className="text-sm text-muted-foreground">Team success</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-clean-sheet-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Crown className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Clean Sheet %</p>
                                            <p className="text-sm text-muted-foreground">Defensive reliability</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-pass-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Pass Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Control metric</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Basketball Rebound Rate (TRB%)" />
                <meta itemProp="description" content="Master the Rebound Rate (TRB%) statistic. Learn how to calculate it, why it's better than Rebounds Per Game, and what benchmarks define elite rebounders like Dennis Rodman." />
                <meta itemProp="keywords" content="Rebound Rate Calculator, TRB%, Basketball Analytics, Dennis Rodman stats, Rebounding efficiency, NBA advanced stats" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Rebound Rate (TRB%)</h2>
                <p className="text-lg italic text-muted-foreground">Discover the metric that reveals the true kings of the glass, unaffected by pace or playing time.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Rebound Rate (TRB%)?</a></li>
                    <li><a href="#why-better" className="hover:underline">TRB% vs. Rebounds Per Game</a></li>
                    <li><a href="#benchmarks" className="hover:underline">The Dennis Rodman Standard: Benchmarks</a></li>
                    <li><a href="#types" className="hover:underline">Offensive vs. Defensive Rebound Rate</a></li>
                    <li><a href="#limitations" className="hover:underline">The "Stat Padding" Debate</a></li>
                    <li><a href="#technique" className="hover:underline">How to Improve Your Rebound Rate</a></li>
                </ul>
                <hr />

                {/* WHAT IS IT */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Rebound Rate (TRB%)?</h2>
                <p><strong>Total Rebound Percentage (TRB%)</strong> is an advanced basketball statistic that estimates the percentage of available rebounds a player grabs while they are on the court.</p>
                <p>An "available rebound" is simply a missed shot. If a player is on the court for 10 missed shots and grabs 2 of them, their Rebound Rate is roughly 20%.</p>
                <p>The formula looks complex because it has to adjust for the fact that a player is one of 10 people on the court, and also normalize for the exact minutes played.</p>

                <hr />

                {/* WHY BETTER */}
                <h2 id="why-better" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">TRB% vs. Rebounds Per Game (RPG)</h2>
                <p>Most fans look at Rebounds Per Game (RPG). While useful, RPG is flawed:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Pace Problem</h3>
                <p>In the 1960s, the pace of play was incredibly fast. Wilt Chamberlain averaged 22.9 rebounds per game career. Today, pace is slower. Does that mean Wilt was 2x better than modern centers? Or just that there were 2x more missed shots to grab?</p>
                <p>TRB% solves this. It measures <em>share</em> of rebounds, not just total count. This allows us to compare players across eras and different team styles.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Minutes Problem</h3>
                <p>A starter playing 40 minutes who grabs 10 rebounds has a TRB% much lower than a bench specialist who grabs 8 rebounds in just 15 minutes. The bench player is actually the more efficient rebounder, and TRB% highlights this dominance.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Dennis Rodman Standard: Benchmarks</h2>
                <p>There is Dennis Rodman, and then there is everyone else. Rodman regularly posted TRB% seasons over 25%, peaking at nearly 29.7%—meaning he grabbed almost 1/3 of every missed shot while he was on the floor. That is a statistical outlier of massive proportions.</p>

                <div className="overflow-x-auto my-6">
                    <table className="min-w-full border rounded-lg bg-card">
                        <thead>
                            <tr className="bg-muted">
                                <th className="px-4 py-2 text-left font-bold">TRB%</th>
                                <th className="px-4 py-2 text-left font-bold">Tier</th>
                                <th className="px-4 py-2 text-left">Context</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-primary">20% +</td>
                                <td className="px-4 py-2 font-bold">Dominant</td>
                                <td className="px-4 py-2">League leader level (Drummond, Whiteside, Rodman).</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-green-600">15% - 20%</td>
                                <td className="px-4 py-2 font-bold">Elite</td>
                                <td className="px-4 py-2">All-Star Big Man.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-blue-600">10% - 15%</td>
                                <td className="px-4 py-2 font-bold">Solid</td>
                                <td className="px-4 py-2">Starting Center / Power Forward standard.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-gray-600">5% - 10%</td>
                                <td className="px-4 py-2 font-bold">Wing/Guard</td>
                                <td className="px-4 py-2">Typical for Small Forwards or aggressive Guards.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-red-600">&#60; 5%</td>
                                <td className="px-4 py-2 font-bold">Poor</td>
                                <td className="px-4 py-2">Rarely crashes the glass.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr />

                {/* TYPES */}
                <h2 id="types" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Offensive vs. Defensive Rebound Rate</h2>
                <p>While TRB% combines them, they are very different skills:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Defensive Rebound Rate (DRB%):</strong> Usually much higher (70-80% of misses are grabbed by defense). A good DRB% is 20%+. It's about securing possession.</li>
                    <li><strong>Offensive Rebound Rate (ORB%):</strong> Historically lower (20-30% of misses are grabbed by offense). A good ORB% is 10%+. It's about creating extra possessions.</li>
                </ul>

                <hr />

                {/* TECHNIQUE */}
                <h2 id="technique" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Improve Your Rebound Rate</h2>
                <p>Rebounding is often cited as 80% desire and 20% technique, but technique matters:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>The Box Out:</strong> Making contact with your opponent before looking for the ball is step one. Displacement leads to possession.</li>
                    <li><strong>Swim Moves:</strong> Use arm bars and swim moves (like in football) to get around defenders who are boxing you out.</li>
                    <li><strong>Anticipation:</strong> "The Rodman Science." Majority of long shots (3-pointers) result in long rebounds. Knowing where the ball will bounce based on the shot angle is a learnable skill.</li>
                    <li><strong>Keep Hands High:</strong> Rebounds are often tipped. Keeping hands above shoulder level increases the "win zone" for 50/50 balls.</li>
                </ul>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Q&A regarding rebound analytics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is high Defensive Rebound Rate always good?</h4>
                            <p className="text-muted-foreground">
                                Usually, yes. However, some players "steal" rebounds from teammates (uncontested boards) to pad stats. Analytics sometimes differentiate between "Contested Rebound Rate" and "Uncontested."
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does height determine Rebound Rate?</h4>
                            <p className="text-muted-foreground">
                                Correlation, not causation. While taller players have higher rates, smaller players like Charles Barkley (6'6") or Russell Westbrook (6'3") have posted elite rates through positioning and athleticism.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good rate for a Point Guard?</h4>
                            <p className="text-muted-foreground">
                                For a traditional PG, anything over 5% is great. Players like Russell Westbrook or Luka Doncic often exceed 10-15%, which is akin to centers, giving their team a huge structural advantage.
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
                                    <strong className="block text-primary mb-1">Contract Negotiators</strong>
                                    <span className="text-sm text-muted-foreground">Use TRB% to argue a player's value despite low minutes per game.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Managers</strong>
                                    <span className="text-sm text-muted-foreground">Identify "per-minute monsters" who will explode if a starter gets injured.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Identify which lineups actually secure the ball best.</span>
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
                        <BookOpen className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Basketball Rebound Rate Calculator (TRB%) measures the percentage of available rebounds a player captures.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It is the most accurate metric for evaluating rebounding talent, stripping away pace and playing time to reveal true efficiency on the boards.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
