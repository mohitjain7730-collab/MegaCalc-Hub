import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, Clock } from 'lucide-react';
import FootballTeamPointsPerGameCalculatorInteractive from './football-team-points-per-game-calculator-interactive';

export default function FootballTeamPointsPerGameCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football Points Per Game (PPG) Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your team's average points per game to project final league standings and assess promotion/relegation chances.
                </p>
            </div>

            <FootballTeamPointsPerGameCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Data points needed for PPG analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Current Points
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of points currently accumulated in the league table.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Standard scoring: 3 for Win, 1 for Draw, 0 for Loss</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Include any points deductions if applicable</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Clock className="h-4 w-4" />
                                Matches Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of league games completed so far in the season.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Do not include cup matches or friendlies</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Counts any game where a result (W/D/L) was recorded</span>
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
                            Points Per Game (PPG) = Total Points / Matches Played
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        To project the final season total (Projected Points), we multiply the PPG by the total number of games in the season (usually 38 for major leagues):
                        <br />
                        <span className="font-mono">Projected Points = PPG × Total Games in Season</span>
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
                        <Link href="/category/sports-training/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Win Rate</p>
                                            <p className="text-sm text-muted-foreground">Victory percentage</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-goals-per-90-minutes-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Goals Per 90</p>
                                            <p className="text-sm text-muted-foreground">Scoring efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-clean-sheet-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Clean Sheet %</p>
                                            <p className="text-sm text-muted-foreground">Defensive solidity</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-goal-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Goal Conversion</p>
                                            <p className="text-sm text-muted-foreground">Finishing ability</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-possession-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Possession %</p>
                                            <p className="text-sm text-muted-foreground">Ball control</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-save-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Save Percentage</p>
                                            <p className="text-sm text-muted-foreground">Goalkeeper stats</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Points Per Game (PPG): Forecasting Football Seasons" />
                <meta itemProp="description" content="Learn how Points Per Game (PPG) is used to project league tables, decide managerial sackings, and evaluate promotion or relegation chances in professional football." />
                <meta itemProp="keywords" content="points per game, PPG calculator, football league table projection, soccer stats, relegation math, title race calculator" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Points Per Game (PPG): Forecasting Football Seasons</h2>
                <p className="text-lg italic text-muted-foreground">It's not just about where you are in the table today. It's about where you're heading. PPG is the compass of football management.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Points Per Game (PPG)?</a></li>
                    <li><a href="#calculation" className="hover:underline">How to Calculate PPG</a></li>
                    <li><a href="#benchmarks" className="hover:underline">The Magic Numbers: 2.0 and 1.0</a></li>
                    <li><a href="#usage" className="hover:underline">Why Managers Get Sacked Based on PPG</a></li>
                    <li><a href="#uneven" className="hover:underline">Handling Uneven Tables</a></li>
                    <li><a href="#xpoints" className="hover:underline">PPG vs. Expected Points (xPoints)</a></li>
                    <li><a href="#3points" className="hover:underline">Impact of the 3-Point Rule</a></li>
                </ul>
                <hr />

                {/* WHAT IS PPG */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Points Per Game (PPG)?</h2>
                <p><strong>Points Per Game (PPG)</strong> is the average number of points a team earns for each match played. It is the most accurate way to compare teams in a league table when they have not played the same number of games.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The "True" League Table</h3>
                <p>In mid-season, the league table often "lies." Weather postponements or cup runs can leave some teams with 2 or 3 games in hand. A team Sitting 10th with 3 games in hand might actually have a better PPG than the team in 6th. PPG cuts through this noise to reveal the true performance trajectory.</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate PPG</h2>
                <p>The formula is simple division:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        PPG = Total Points / Matches Played
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
                <p><strong>Team A:</strong> 40 points from 20 games.</p>
                <p className="font-mono bg-muted inline-block px-2 py-1 rounded mb-2">PPG = 40 / 20 = 2.00</p>

                <p><strong>Team B:</strong> 42 points from 24 games.</p>
                <p className="font-mono bg-muted inline-block px-2 py-1 rounded">PPG = 42 / 24 = 1.75</p>

                <p className="mt-4">Although Team B is higher in the table (42 points vs 40), Team A is performing significantly better (2.00 PPG vs 1.75 PPG) and would likely overtake Team B if they win their games in hand.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Magic Numbers: Benchmarks for Success</h2>
                <p>Over decades of league football, certain PPG thresholds have become established benchmarks:</p>

                <ul className="list-disc ml-6 space-y-4">
                    <li>
                        <strong className="text-foreground">2.50+ (Record Breakers):</strong> A team earning 2.5 PPG is on pace for 95 points (in a 38-game season). This guarantees a title in almost any era (think Man City centurions or Liverpool 2020).
                    </li>
                    <li>
                        <strong className="text-foreground">2.00 (Title Contenders):</strong> The "Two Points Per Game" rule. This puts you on pace for 76 points. In competitive leagues, this is usually enough to challenge for the title or comfortably qualify for the Champions League.
                    </li>
                    <li>
                        <strong className="text-foreground">1.3 - 1.5 (Mid-Table):</strong> This pace earns ~50-57 points. Safe, respectable, but rarely exciting.
                    </li>
                    <li>
                        <strong className="text-foreground">1.00 (The Survival Line):</strong> The "One Point Per Game" rule. In a 38-game season, 38 points is historically the "magic number" for avoiding relegation. Dropping below 1.00 PPG is the danger zone.
                    </li>
                </ul>

                <hr />

                {/* USAGE */}
                <h2 id="usage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Managers Get Sacked Based on PPG</h2>
                <p>Club boards use PPG to project the future. If a team's goal is to finish 4th (typically ~70 points), they need a PPG of ~1.84.</p>
                <p>If a manager starts the season with 15 points from 12 games (1.25 PPG), the board knows that staying on this trajectory leads to 47-48 points—missing the target by over 20 points. This mathematical reality is often the trigger for sacking a manager long before the "mathematical impossibility" of qualifying occurs.</p>

                <hr />

                {/* UNEVEN TABLES */}
                <h2 id="uneven" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Handling Uneven Tables (Games in Hand)</h2>
                <p>PPG became world-famous during the COVID-19 pandemic (2019/20 season). When leagues were suspended or curtailed (like Ligue 1 in France), final positions were decided by PPG.</p>
                <p>This caused controversy because it assumes a team <em>would have</em> continued their exact form. However, if a team had difficult fixtures remaining, their PPG might have dropped. Despite this flaw, PPG is widely accepted as the fairest tie-breaker for uneven schedules.</p>

                <hr />

                {/* xPOINTS */}
                <h2 id="xpoints" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">PPG vs. Expected Points (xPoints)</h2>
                <p>PPG tells you what <em>has</em> happened. Expected Points (xPoints) uses Expected Goals (xG) data to tell you what <em>should have</em> happened.</p>
                <p>If your PPG is 2.50 but your xPoints PPG is only 1.50, it suggests you have been incredibly lucky (or relied on individual brilliance) and your form is likely to regress. Smart analysts use xPoints to predict if a high PPG is sustainable.</p>

                <hr />

                {/* 3 POINT RULE */}
                <h2 id="3points" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Impact of the 3-Point Rule on PPG</h2>
                <p>Before the 1980s/90s, a win was worth 2 points. This made "playing for a draw" (1 point) statistically more valuable. The 3-point rule revolutionized PPG targets.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>3 Wins, 7 Losses</strong> (9 points) is now better than <strong>0 Wins, 8 Draws, 2 Losses</strong> (8 points).</li>
                    <li>In the old system, the 8 draws team would have 8 points, and the 3 wins team would have 6.</li>
                </ul>
                <p>Modern PPG encourages risk-taking. Winning 1 and losing 2 is the same (points-wise) as Drawing 3, but offers more upside if you can turn one loss into a draw.</p>

            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about PPG calculations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does 'Games in Hand' affect PPG?</h4>
                            <p className="text-muted-foreground">
                                PPG inherently accounts for games in hand by averaging performance over the games actually played. A team with fewer games played has a more volatile PPG; one win or loss changes their average more drastically than a team that has played 30 games.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the 'Magic Number' for survival?</h4>
                            <p className="text-muted-foreground">
                                In the Premier League (38 games), 40 points was traditionally the safety mark. In recent years, due to competitive disparity, 36-38 points (exactly 1.0 PPG) has often been enough.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is PPG calculated differently for home and away?</h4>
                            <p className="text-muted-foreground">
                                Yes, granular analysis splits this into Home PPG and Away PPG. Most teams have a much higher Home PPG. If a team has many home games left, their "Overall PPG" might underestimate their final tally.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do cup games count?</h4>
                            <p className="text-muted-foreground">
                                No. PPG is strictly a league metric used for league table projections. Cup form is irrelevant to league standing projections.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What PPG wins the Premier League?</h4>
                            <p className="text-muted-foreground">
                                In the modern era (post-Guardiola/Klopp), the bar has raised. You typically need 2.30 - 2.50 PPG (87-95 points) to win the title. In the 1990s, ~2.00 - 2.10 PPG (75-80 points) was often sufficient.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is Weighted PPG?</h4>
                            <p className="text-muted-foreground">
                                Some advanced models use "Weighted PPG," where points earned against top teams are worth more, or recent games are weighted heavier than games from 6 months ago, to provide a better prediction of current strength.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the lowest PPG to ever survive relegation?</h4>
                            <p className="text-muted-foreground">
                                In the Premier League era, West Bromwich Albion (2004/05) survived with just 34 points (0.89 PPG). This is historically anomalous and dubbed "The Great Escape." Relying on sub-1.0 PPG is almost always fatal.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does Goal Difference affect PPG?</h4>
                            <p className="text-muted-foreground">
                                No. PPG only cares about points. However, if two teams finish with identical PPG (and points), Goal Difference is the standard tie-breaker. A team with high PPG but poor Goal Difference is "fragile" (winning by narrow margins).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How accurate is PPG for half-season projections?</h4>
                            <p className="text-muted-foreground">
                                Surprisingly accurate. Studies show that league tables after 19 games (halfway) have a 0.8+ correlation with final standings. While drastic changes happen (e.g., Leicester City 2014/15), PPG at halfway is a strong indicator of final destiny.
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
                                    <strong className="block text-primary mb-1">Club Directors</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate if the current manager is meeting season objectives before it's too late.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fans</strong>
                                    <span className="text-sm text-muted-foreground">Calculate if your team is really "safe" from relegation or truly in the title race.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Bettors</strong>
                                    <span className="text-sm text-muted-foreground">Identify teams that are undervalued because they have games in hand (hidden value).</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Journalists</strong>
                                    <span className="text-sm text-muted-foreground">Write accurate "state of the season" articles adjusting for postponed matches.</span>
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
                                The Football PPG Calculator is the ultimate reality check for any football season.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By projecting current form over a full season, it provides a sober assessment of where a team is likely to finish, stripping away the optimism or pessimism of the current moment.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
