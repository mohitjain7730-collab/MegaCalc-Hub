import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, TrendingUp, Users, Shield, Target } from 'lucide-react';
import BaseballWinLossCalculatorInteractive from './baseball-win-loss-percentage-calculator-interactive';

export default function BaseballWinLossCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball/ Softball Win–Loss Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your team&apos;s official winning percentage, games above .500, and projected win totals instantly.
                </p>
            </div>

            <BaseballWinLossCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Definitions for calculating official Records
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Trophy className="h-4 w-4" />
                                Wins (W)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                A game where the team scores more runs than the opponent after the regulation number of innings (usually 9 in MLB, 7 in Softball/HS).
                            </p>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <AlertCircle className="h-4 w-4" />
                                Losses (L)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                A game where the team scores fewer runs than the opponent. In pitcher records, a Loss is assigned to the pitcher responsible for the go-ahead run.
                            </p>
                        </div>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Users className="h-4 w-4" />
                                Ties (T)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                (Optional) Rare in pro baseball but common in tournaments/softball. Ties generally lower win percentage as they are &quot;games played&quot; without a &quot;win.&quot;
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
                        <p className="font-mono text-sm text-center mb-2">
                            <strong>Winning Percentage</strong> = Wins / (Wins + Losses + Ties)
                        </p>
                        <p className="font-mono text-sm text-center">
                            <strong>Games Above .500</strong> = Wins - Losses
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Official standings typically display Winning Percentage to three decimal places (e.g., .500). If two teams have the same number of wins but different numbers of games played, the team with the higher percentage ranks higher.
                    </p>
                    <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded border border-primary/10">
                        <strong>Note on Tie Games:</strong> In some youth leagues, a tie counts as 0.5 wins. This calculator uses the strict &quot;Win Percentage&quot; definition (Wins / Total Games), which treats a tie as &quot;not a win.&quot; This is the standard for most competitive standings.
                    </div>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Baseball Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other key team metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/baseball-run-differential-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Run Differential</p>
                                            <p className="text-sm text-muted-foreground">Predict true team quality</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Team Hitting Stat</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-era-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">ERA Calculator</p>
                                            <p className="text-sm text-muted-foreground">Run Prevention Stat</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-whip-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">WHIP Calculator</p>
                                            <p className="text-sm text-muted-foreground">Runners allowed per inning</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-on-base-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">On-Base Percentage</p>
                                            <p className="text-sm text-muted-foreground">Team OBP Stat</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-slugging-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Slugging Percentage</p>
                                            <p className="text-sm text-muted-foreground">Power Metrics</p>
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
                <meta itemProp="name" content="The Pursuit of Perfection: Understanding Baseball Win-Loss Percentage" />
                <meta itemProp="description" content="A complete guide to Baseball and Softball Win-Loss Percentage. Understand how standings work, what defines a successful season, the 'Magic Number', and the math behind the race to the pennant." />
                <meta itemProp="keywords" content="baseball win percentage calculator, softball standing calculator, games above 500 calculator, winning percentage formula, baseball standings explained, mlb playoff odds" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Winning Isn&apos;t Everything, It&apos;s the Only Thing</h2>
                <p className="text-lg italic text-muted-foreground">Of all the complex metrics in sports—WAR, OPS+, ERA, FIP—only one truly determines who lifts the trophy: Wins. The Win-Loss percentage is the ultimate ledger of a team&apos;s season.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Win-Loss Percentage?</a></li>
                    <li><a href="#magic-500" className="hover:underline">The &quot;Magic .500&quot;: Why Average Matters</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: From Tanking to Dynasty</a></li>
                    <li><a href="#advanced-standings" className="hover:underline">Advanced Standings: GB & Magic Runmber</a></li>
                    <li><a href="#pythag-luck" className="hover:underline">Luck vs. Skill: The Pythagorean Theorem</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Improve Win %</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Win-Loss Percentage?</h2>
                <p><strong>Win-Loss Percentage (Pct)</strong> is the standard method for ranking teams in a league. Unlike soccer or hockey which often use &quot;Points&quot; (3 for a win, 1 for a draw), Baseball and Softball almost exclusively use strict percentage.</p>
                <p>It represents the proportion of games a team has won out of the total games played. It is calculated using the formula:</p>
                <div className="p-4 bg-muted rounded my-4 font-mono text-center">
                    Win % = Wins / Total Games
                </div>
                <p>If ties are relevant (common in softball or youth sports), the Total Games includes Wins, Losses, and Ties. In the United States, this is expressed as a decimal to three places (e.g., .500). In other parts of the world, it is often expressed as a percentage (e.g., 50%). </p>
                <p>A team with a .750 winning percentage has won 3 out of every 4 games played.</p>

                <hr />

                {/* MAGIC 500 */}
                <h2 id="magic-500" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The &quot;Magic .500&quot;: Why Average Matters</h2>
                <p>The concept of <strong>.500</strong> is central to baseball vernacular. If a team is "at .500," they have won exactly as many games as they have lost (e.g., 81-81 in MLB). This is the definition of an average season.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Games Above .500</h3>
                <p>Fans and analysts often track "Games Above .500." This is a quick mental shortcut to gauge how solid a playoff contender is. It is calculated simply as:</p>
                <div className="p-3 bg-muted/50 border-l-4 border-primary mt-2 mb-4">
                    Games Above .500 = Wins - Losses
                </div>
                <p>For example, a team that is 20-10 is "10 games over .500." A team that is 10-20 is "10 games under .500." In a 162-game season, finishing 20 games over .500 (91-71) usually guarantees a playoff spot.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: From Tanking to Dynasty</h2>
                <p>What constitutes a good season differs by league length, but percentage benchmarks remain consistent across levels.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Professional Baseball (MLB)</h3>
                <ul className="list-disc ml-6 space-y-4 mt-2">
                    <li><strong>.600+ (approx 97 wins):</strong> <span className="text-green-600 font-semibold">Elite Dynasty.</span> These teams usually win their division comfortably. A .700 season is historically rare (e.g., 2001 Mariners, 1998 Yankees).</li>
                    <li><strong>.550 - .590 (90-95 wins):</strong> <span className="text-blue-600 font-semibold">Contender.</span> Likely to make the playoffs, possibly as a Wild Card or Division Winner.</li>
                    <li><strong>.500 - .540 (81-87 wins):</strong> <span className="text-yellow-600 font-semibold">The Bubble.</span> Average to slightly above average. Might sneak into playoffs but usually misses.</li>
                    <li><strong>Below .400 (64 wins):</strong> <span className="text-red-600 font-semibold">Rebuilding.</span> Often indicates a team "tanking" for draft picks.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Softball / Youth Tournaments</h3>
                <p>In shorter tournament formats, percentages are more volatile. Top travel teams often strive for .800+ winning percentages due to the disparity in talent levels between elite and recreational teams. In pool play, a single loss can sometimes eliminate a team from &quot;Gold Bracket&quot; contention.</p>

                <hr />

                {/* ADVANCED STANDINGS */}
                <h2 id="advanced-standings" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Advanced Standings: GB & The Magic Number</h2>
                <p>Beyond raw percentage, two other numbers dominate the standings in September.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Games Back (GB)</h3>
                <p>This measures the gap between a trailing team and the division leader. The formula is:</p>
                <p className="font-mono ml-6 mt-2">((Leader&apos;s Wins - Team&apos;s Wins) + (Team&apos;s Losses - Leader&apos;s Losses)) / 2</p>
                <p>&quot;Games Back&quot; tells you how many games you need to &quot;make up.&quot; Making up ground is hard because you need to win <em>and</em> the leader needs to lose.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Magic Number</h3>
                <p>The &quot;Magic Number&quot; represents the combination of wins by the leader and losses by the trailing team needed to mathematically clinch the division. Every time the leader wins OR the trailer loses, the magic number drops by 1. When it reaches 0, the race is over.</p>

                <hr />

                {/* PYTHAGOREAN LUCK */}
                <h2 id="pythag-luck" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Luck vs. Skill: The Pythagorean Theorem</h2>
                <p>Is your 50-30 record &quot;real&quot;? Or are you just lucky?</p>
                <p>Bill James developed the <Link href="/baseball-run-differential-calculator" className="text-primary hover:underline">Pythagorean Expectation</Link> to answer this. It uses Run Differential to predict what a team&apos;s winning percentage <em>should</em> be.</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>If your <strong>Actual Win %</strong> is significantly higher than your Pythagorean projection, you are considered &quot;lucky&quot; (winning many close games) and likely to regress.</li>
                    <li>If your Actual Win % is lower, you are &quot;unlucky&quot; and likely to improve.</li>
                </ul>
                <p>Smart general managers use this discrepancy to decide whether to buy or sell players at the trade deadline.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Win %</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Win the Close Ones (Bullpen &amp; Defense)</h3>
                <p>Over a long season, blowout wins and blowout losses often cancel out. The difference between a .500 team and a .600 team is usually performance in 1-run games. This requires a strong bullpen and clutch defensive execution to &quot;lock down&quot; narrow leads.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Beat the Teams You Should Beat</h3>
                <p>Consistent teams dominate the bottom of the league. If you play a team with a .350 record, you must sweep them. Losing games to inferior opponents is the fastest way to ruin a winning percentage. This is often called &quot;taking care of business.&quot;</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Home Field Advantage</h3>
                <p>Most teams play .500 ball on the road. Elite teams turn their home stadium into a fortress, aiming for a .650+ winning percentage at home to buffer against road struggles. Factors like crowd noise, familiarity with field dimensions, and &quot;last at-bat&quot; advantage all contribute.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Standings and Records
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does Win Percentage determine playoff seeding?</h4>
                            <p className="text-muted-foreground">
                                Yes. In almost all leagues, Win Percentage is the primary sorting factor for standings. If teams play an unequal number of games (due to rainouts or cancellations), Win Percentage takes precedence over raw win totals. For example, a team that is 99-63 (.611) would finish behind a team that is 100-61 (.621).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do Ties count in Win Percentage?</h4>
                            <p className="text-muted-foreground">
                                In MLB, no, because ties do not exist (games are played until a winner is found). In youth leagues or softball, games often end in ties due to time limits. In these cases, a tie is usually treated as "half a win" and "half a loss" OR it simply lowers the win percentage because the denominator (games played) increases without the numerator (wins) increasing.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the highest winning percentage in MLB history?</h4>
                            <p className="text-muted-foreground">
                                The 1906 Chicago Cubs hold the modern era record with a .763 winning percentage (116-36). The 2001 Seattle Mariners matched the win total (116) but had a slightly lower percentage (.716) due to playing more games (162 vs 152).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is &quot;Strength of Schedule&quot; (SOS)?</h4>
                            <p className="text-muted-foreground">
                                SOS measures the combined winning percentage of a team&apos;s opponents. A team with a high Win % but a low SOS might be considered a &quot;paper tiger&quot; (unproven). College RPI (Rating Percentage Index) heavily weights SOS alongside winning percentage to determine rankings.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why do some leagues use a points system instead?</h4>
                            <p className="text-muted-foreground">
                                Points systems (e.g., 3 points for a win, 1 for a tie) are common in soccer or leagues with ties to incentivize winning over drawing. In baseball, where ties are rare/non-existent, Win % is the most equitable system.
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
                                    <strong className="block text-primary mb-1">Coaches & Managers</strong>
                                    <span className="text-sm text-muted-foreground">Track progress toward season goals (e.g., "We need to go 7-3 in the last 10 games to reach .500").</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Tournament Directors</strong>
                                    <span className="text-sm text-muted-foreground">Quickly calculate standings seedings for knockout rounds based on pool play records, especially when handling tie-breakers.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fans & Media</strong>
                                    <span className="text-sm text-muted-foreground">Contextualize a team's current hot streak or slump. Is a 10-game winning streak enough to save the season?</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Pitchers</strong>
                                    <span className="text-sm text-muted-foreground">Calculate personal Win-Loss records (e.g., 18-4) to determine career milestones or Cy Young eligibility.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Scenario A (The Tanking Team):</strong>
                                        <br />
                                        Starts 15-25. They are 10 games under .500.
                                        <br />
                                        Percentage: 15 / 40 = <strong>.375</strong>
                                        <br />
                                        <span className="text-xs text-muted-foreground mt-1 block">To finish at .500, they must go 66-56 (.541 pace) for the rest of the season. A tough climb.</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Scenario B (The Soft Schedule):</strong>
                                        <br />
                                        Team X is 20-5 (.800) but has played the 5 worst teams.
                                        <br />
                                        Team Y is 15-10 (.600) but has played the 5 best teams.
                                        <br />
                                        <span className="text-xs text-muted-foreground mt-1 block">While Team X has the better Win %, Team Y might actually be the stronger team once schedule balances out.</span>
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
                                The Baseball/Softball Win-Loss Percentage Calculator is the fundamental tool for tracking team success.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It converts raw wins and losses into a standardized comparative metric, allowing you to measure your team against historical greats, league rivals, or your own preseason expectations. Whether you are aiming for a .500 season or a World Series ring, it all starts with the percentage column.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
