import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, Target, Users, TrendingUp } from 'lucide-react';
import FootballWinRateCalculatorInteractive from './football-win-rate-calculator-interactive';

export default function FootballWinRateCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football Win Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate the victory percentage of a football team to assess performance, season projection, and managerial effectiveness.
                </p>
            </div>

            <FootballWinRateCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics required for accurate win rate calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Matches Won
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of games where the team scored more goals than the opposition at full time.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes league and cup victories (in normal time)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Extra time wins count; penalty shootouts are statistically draws</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Total Matches Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The cumulative number of competitive fixtures completed by the team in the specified period.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Sum of Wins + Draws + Losses</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Excludes friendlies for official competitive stats</span>
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
                            Win Rate % = (Total Wins / Total Matches Played) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This formula expresses the team's success as a percentage of total opportunities. While simple, it is the primary indicator of dominance in league formats where 3 points are awarded for a win.
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
                        Explore other performance metrics for comprehensive analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/football-expected-goals-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Expected Goals (xG)</p>
                                            <p className="text-sm text-muted-foreground">Chance quality</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-possession-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Possession %</p>
                                            <p className="text-sm text-muted-foreground">Ball control</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-goal-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Goal Conversion</p>
                                            <p className="text-sm text-muted-foreground">Clinical finishing</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-expected-assists-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Expected Assists (xA)</p>
                                            <p className="text-sm text-muted-foreground">Creativity metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-shot-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Shot Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Target hitting</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-pass-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Pass Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Distribution quality</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Football Win Rate: Calculation, Analysis, and Benchmarks" />
                <meta itemProp="description" content="Master the metrics of football success. Learn how to calculate win rates, interpret league benchmarks, and understand the relationship between wins, draws, and points per game." />
                <meta itemProp="keywords" content="football win rate, soccer win percentage, manager stats, premier league win rates, football analytics, team performance metrics" />
                <meta itemProp="author" content="MegaCalc Football Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Football Win Rate: Measuring Team Dominance</h2>
                <p className="text-lg italic text-muted-foreground">Win rate is the simplest yet most brutal metric in football. It defines eras, determines managerial careers, and separates champions from the rest.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Win Rate in Football?</a></li>
                    <li><a href="#calculation" className="hover:underline">The Mathematics of Winning</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks (Top 5 Leagues)</a></li>
                    <li><a href="#draw-dilemma" className="hover:underline">The Draw Dilemma: Win Rate vs. Undefeated Streak</a></li>
                    <li><a href="#home-vs-away" className="hover:underline">Home vs. Away Performance</a></li>
                    <li><a href="#improvement" className="hover:underline">Tactical Strategies to Improve Win Rate</a></li>
                </ul>
                <hr />

                {/* WHAT IS WIN RATE */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Win Rate in Football?</h2>
                <p>The <strong>Football Win Rate</strong> is the percentage of matches a team has won out of total matches played. Unlike Points Per Game (PPG), which accounts for the value of draws, win rate focuses exclusively on victories.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Why Win Rate Matters More Than Ever</h3>
                <p>In the modern era of "super clubs," draws are increasingly viewed as two points dropped rather than one point gained. Champions in leagues like the Premier League or La Liga often need win rates exceeding 75% to secure the title.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Managerial Security:</strong> Managers with win rates below 35% in top leagues are statistically at high risk of sacking.</li>
                    <li><strong>Title Standards:</strong> The bar for winning major trophies has raised significantly. Manchester City's 100-point season required a win rate of 84.2%.</li>
                </ul>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mathematics of Winning</h2>
                <p>Calculating win rate is straightforward but requires precise data input to be meaningful.</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Win Percentage = (Matches Won / Total Matches Played) × 100
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
                <p>Consider a team that has played 38 league games:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Wins:</strong> 24</li>
                    <li><strong>Draws:</strong> 8</li>
                    <li><strong>Losses:</strong> 6</li>
                </ul>

                <p className="mt-4">The calculation ignores draws and losses in the numerator but includes them in the denominator (Total Played = 38).</p>
                <p className="font-mono bg-muted p-2 rounded mt-2">Win Rate = (24 / 38) × 100 = 63.15%</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Cup Competitions Note</h3>
                <p>In knockout tournaments, a match decided by penalty shootouts is statistically recorded as a <strong>draw</strong> by FIFA and UEFA standards, even though one team advances. When calculating "true" win rates for statistical databases, be careful to classify shootout victories as draws unless you are calculating "progression rate."</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Industry Benchmarks: What is a "Good" Win Rate?</h2>
                <p>Context is everything. A 40% win rate for a newly promoted team is heroic; for Real Madrid, it is a crisis. Generally, in top-tier European leagues (Premier League, La Liga, Bundesliga, Serie A, Ligue 1):</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Elite Level (&gt;70%)</h3>
                <p>Teams in this bracket are title contenders or dominant champions. Sustaining a win rate above 70% over a 38-game season usually guarantees a top-two finish.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Example:</strong> Pep Guardiola's Manchester City often operates in the 75-85% range.</li>
                    <li><strong>Implication:</strong> Few draws, almost no losses. High consistency.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">European Qualification (50% - 69%)</h3>
                <p>Teams winning half their games or more typically qualify for the Champions League or Europa League.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Example:</strong> A team ending with 19 wins (50%) and a mix of draws/losses will likely finish with 65-70 points, usually enough for Top 4-6.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Mid-Table Stability (35% - 49%)</h3>
                <p>Winning roughly one in three games keeps a team safely away from relegation. These teams act as "kingmakers," taking points off the top teams occasionally but lacking consistency.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Relegation Danger (&lt;35%)</h3>
                <p>Historically, winning fewer than 35% of games puts a team in severe danger. The magic "40 points" safety mark in a 38-game season typically requires roughly 10-12 wins (26-31% win rate) coupled with many draws.</p>

                <hr />

                {/* THE DRAW DILEMMA */}
                <h2 id="draw-dilemma" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Draw Dilemma: Win Rate vs. Undefeated Streak</h2>
                <p>One of the biggest misconceptions in football analysis is overvaluing "undefeated" streaks that are heavy on draws. Because a win (3 points) is worth three times a draw (1 point), a team that risks losing to win is often better off.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Case Study: The "Safe" Team vs. The "Risk" Team</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                    <div className="p-4 bg-muted border rounded">
                        <h4 className="font-bold">Team A (The Draw Specialists)</h4>
                        <p>Plays 10 games.</p>
                        <ul className="list-disc ml-4 text-sm">
                            <li>Wins: 2</li>
                            <li>Draws: 8</li>
                            <li>Losses: 0</li>
                        </ul>
                        <p className="font-bold mt-2">Points: 14 | Win Rate: 20%</p>
                    </div>
                    <div className="p-4 bg-muted border rounded">
                        <h4 className="font-bold">Team B (All or Nothing)</h4>
                        <p>Plays 10 games.</p>
                        <ul className="list-disc ml-4 text-sm">
                            <li>Wins: 5</li>
                            <li>Draws: 0</li>
                            <li>Losses: 5</li>
                        </ul>
                        <p className="font-bold mt-2">Points: 15 | Win Rate: 50%</p>
                    </div>
                </div>
                <p>Despite Team A being "undefeated," Team B has more points. This illustrates why <strong>Win Rate</strong> is often a better predictor of league position than the "Loss Rate." Modern football significantly rewards teams that play for the win.</p>

                <hr />

                {/* HOME VS AWAY */}
                <h2 id="home-vs-away" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Home vs. Away Performance</h2>
                <p>A "Fortress" reputation is built on home win rate.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Home Win Rate:</strong> Expectation is higher. Elite teams aim for &gt;80% home wins. Mid-table teams rely on &gt;40-50% home wins to survive.</li>
                    <li><strong>Away Win Rate:</strong> The true differentiator. Winning away from home requires tactical discipline and mental resilience. An away win rate &gt;50% is championship caliber.</li>
                </ul>

                <hr />

                {/* STRATEGIES */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Win Rate</h2>
                <p>How do teams convert draws into wins and improve their percentage?</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Clinical Finishing (xG Outperformance)</h3>
                <p>Teams with high win rates often have elite strikers who score from half-chances. Improving "Goal Conversion Rate" is the fastest way to turn dominance into wins.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Set-Piece Efficiency</h3>
                <p>In tight games, set-pieces account for 30-40% of goals. Improving delivery and aerial dominance can turn a 0-0 draw into a 1-0 win.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Game Management</h3>
                <p>Knowing when to kill a game (tactical fouls, possession retention) prevents late equalizers, preserving the win.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Squad Depth</h3>
                <p>Fatigue kills win rates in the final 15 minutes. Substitutes who can maintain the intensity are crucial for turning close games into victories.</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>The Football Win Rate Calculator is more than just a vanity metric; it is a diagnostic tool. It strips away the comfort of "undefeated streaks" and focuses on the only currency that truly buys trophies: winning. Whether you are analyzing a Sunday League season or Premier League trends, understanding the components of win percentage gives you a clearer view of true performance quality.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about football win rates and statistics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do penalty shootouts assume in win rate?</h4>
                            <p className="text-muted-foreground">
                                Officially, a match decided by penalty shootouts is recorded as a <strong>draw</strong>. The shootout determines who advances to the next round, but the statistical result of the match is a tie. Therefore, winning on penalties does not technically increase your "Win Rate" in official FIFA records.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good win rate for a Premier League team?</h4>
                            <p className="text-muted-foreground">
                                To win the title, you typically need a win rate above 75% (28-30+ wins in 38 games). For top 4 qualification, 55-60% is usually sufficient. To survive relegation, a win rate of 25-30% is often the bare minimum.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does win rate include friendlies?</h4>
                            <p className="text-muted-foreground">
                                Generally, no. Competitive win rates (League and Cup stats) are calculated separately from friendlies to provide a true reflection of performance under pressure. However, you can use the calculator for any set of matches you choose.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is it better to have more wins and more losses, or fewer wins and more draws?</h4>
                            <p className="text-muted-foreground">
                                Mathematically, wins are far more valuable. Two wins and One loss (6 points) is better than Three Draws (3 points). Modern football's 3-points-for-a-win system rewards aggressive teams that risk losing to try and win, over conservative teams that play for draws.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the highest win rate in history?</h4>
                            <p className="text-muted-foreground">
                                In major European leagues, teams like Bayern Munich, PSG, and Manchester City have recorded single-season win rates exceeding 85%. In international football, heavyweights like Brazil and Germany maintain historic win rates above 60-70% over decades.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does extra time affect the calculation?</h4>
                            <p className="text-muted-foreground">
                                If a team wins in extra time (120 minutes), it counts as a <strong>Win</strong>. The "Draw" rule typically applies only if the game is level after 120 minutes and goes to penalties.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can I calculate win rate for a specific player?</h4>
                            <p className="text-muted-foreground">
                                Yes! This is called "Player Win Percentage" – the percentage of games the team wins when that specific player is on the pitch. It's a great metric for measuring individual impact.
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
                                    <strong className="block text-primary mb-1">Managers & Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate seasonal progress and compare home vs away form.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Football Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Calculate win probabilities and historical trends for reports.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fans & Bettors</strong>
                                    <span className="text-sm text-muted-foreground">Assess team form objectively before placing predictions.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Football Managers</strong>
                                    <span className="text-sm text-muted-foreground">Identify players from teams with high win probabilities for potential clean sheet/win bonuses.</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <p className="text-muted-foreground">
                                The win rate does not account for the <strong>quality of opposition</strong>. A 100% win rate in pre-season friendlies against lower-league teams does not predict Premier League success. Always consider the "Strength of Schedule" when interpreting these numbers.
                            </p>
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
                                The Football Win Rate Calculator provides a clear, objective snapshot of a team's dominance and success.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By focusing purely on victories, it filters out the noise of "unbeaten runs" and helps you identify which teams are truly collecting maximum points. Whether for historical analysis or current season tracking, this percentage is the gold standard for measuring footballing superiority.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
