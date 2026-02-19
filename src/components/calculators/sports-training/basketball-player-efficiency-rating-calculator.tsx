import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, BookOpen, Timer } from 'lucide-react';
import BasketballPlayerEfficiencyRatingCalculatorInteractive from './basketball-player-efficiency-rating-calculator-interactive';

export default function BasketballPlayerEfficiencyRatingCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball Player Efficiency Rating (PER) Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate the estimated Player Efficiency Rating (uPER) to measure comprehensive basketball performance.
                </p>
            </div>

            <BasketballPlayerEfficiencyRatingCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key statistics required for the PER calculation
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
                                Total minutes on the court. PER is a per-minute statistic, so this is the denominator for all productivity.
                            </p>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Target className="h-4 w-4" />
                                Scoring Efficiency
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                FG Made/Att, FT Made/Att, and 3P Made. PER rewards making shots and penalizes misses. 3PM adds extra value.
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                <Activity className="h-4 w-4" />
                                Positive Stats
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Assists, Rebounds, Blocks, Steals. Each contributes positively, with Steals and Blocks having high coefficients.
                            </p>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <AlertCircle className="h-4 w-4" />
                                Negative Stats
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Turnovers and Fouls. These significantly reduce rating. Missed shots are also penalized implicitly.
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
                        Formula Used (uPER Estimate)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm">
                            uPER = (1 / MP) × [ (FGM × 85.9) + (STL × 53.9) + (3PM × 51.8) + (FTM × 46.8) + (BLK × 39.2) + (REB × 35.0) + (AST × 34.7) - (PF × 17.2) - ((FTA-FTM) × 20.1) - ((FGA-FGM) × 39.2) - (TO × 53.9) ]
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This calculator uses the unadjusted PER (uPER) linear weights derived by John Hollinger. True PER requires adjustment for team pace and normalization to the league average (15.0).
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
                        Explore other performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/basketball-true-shooting-percentage-calculator" className="block">
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
                        <Link href="/category/sports-training/basketball-field-goal-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Field Goal %</p>
                                            <p className="text-sm text-muted-foreground">Shooting accuracy</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-free-throw-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Free Throw %</p>
                                            <p className="text-sm text-muted-foreground">FT accuracy</p>
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
                                            <p className="text-sm text-muted-foreground">Team success</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-team-points-per-game-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Points Per Game</p>
                                            <p className="text-sm text-muted-foreground">Scoring average</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">General scoring rate</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Player Efficiency Rating (PER) in Basketball" />
                <meta itemProp="description" content="A comprehensive guide to understanding John Hollinger's Player Efficiency Rating (PER), its formula, benchmarks for NBA players, and how to improve it." />
                <meta itemProp="keywords" content="PER calculator, basketball player efficiency rating, John Hollinger stats, NBA advanced metrics, basketball analytics, uPER formula" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Player Efficiency Rating (PER)</h2>
                <p className="text-lg italic text-muted-foreground">Master the all-in-one basketball statistic that defines superstar performance and revolutionizes how we evaluate player impact.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is PER?</a></li>
                    <li><a href="#history" className="hover:underline">The History & John Hollinger</a></li>
                    <li><a href="#formula-breakdown" className="hover:underline">The Formula Breakdown</a></li>
                    <li><a href="#benchmarks" className="hover:underline">PER Benchmarks: From Bench to MVP</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of PER</a></li>
                    <li><a href="#improvement" className="hover:underline">Strategies to Improve PER</a></li>
                    <li><a href="#case-studies" className="hover:underline">Real-World Examples</a></li>
                </ul>
                <hr />

                {/* WHAT IS PER */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Player Efficiency Rating (PER)?</h2>
                <p><strong>Player Efficiency Rating (PER)</strong> is a single-number basketball statistic developed to measure a player&apos;s per-minute productivity. It attempts to boil down all of a player&apos;s contributions—points, rebounds, assists, steals, blocks, and more—into one unified rating.</p>

                <p>The beauty of PER is its standardization. It is pace-adjusted (accounting for the speed of the game) and per-minute (levelling the playing field between starters and reserves). This allows analysts to compare a player who plays 30 minutes in a slow-paced game with one who plays 15 minutes in a fast-paced game on equal footing.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The &quot;Per-Minute&quot; Philosophy</h3>
                <p>Standard box score stats like &quot;Points Per Game&quot; (PPG) are flawed comparisons because they favor players who play more minutes. PER asks a different question: <em>&quot;How productive are you when you are actually on the court?&quot;</em></p>

                <p>Typical PER values run from 0 to 35+. The league average is always set to 15.00 every season, making it easy to see if a player is above or below average.</p>

                <hr />

                {/* HISTORY */}
                <h2 id="history" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The History of PER</h2>
                <p>PER was developed by <strong>John Hollinger</strong>, a former NBA analyst and Vice President of Basketball Operations for the Memphis Grizzlies. Before PER, basketball analysis heavily relied on raw counting stats.</p>
                <p>Hollinger introduced the metric in the early 2000s while writing for ESPN. His goal was to create a rating that summarized a player&apos;s statistical accomplishments without the noise of playing time or team pace variables.</p>
                <p>It revolutionized NBA front offices, shifting focus toward efficiency. Teams began undervaluing high-volume, low-efficiency scorers and overvaluing efficient per-minute producers who just needed more playing time (the &quot;hidden gems&quot;).</p>

                <hr />

                {/* FORMULA BREAKDOWN */}
                <h2 id="formula-breakdown" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Formula Breakdown</h2>
                <p>The full PER calculation is notoriously complex, but understanding the logic is simple. It works like a ledger of assets and liabilities:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Positive Contributions (Assets)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Field Goals Made (FGM):</strong> The base of scoring.</li>
                    <li><strong>3-Pointers Made (3PM):</strong> Given a bonus because they are worth more.</li>
                    <li><strong>Free Throws Made (FTM):</strong> Scoring efficiency.</li>
                    <li><strong>Assists:</strong> Creating offense for others.</li>
                    <li><strong>Rebounds:</strong> Gaining possession. Offensive rebounds are weighted more heavily than defensive.</li>
                    <li><strong>Blocks & Steals:</strong> Defensive plays that gain possession or stop scoring.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Negative Contributions (Liabilities)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Missed Field Goals (FGA - FGM):</strong> Wasting a possession.</li>
                    <li><strong>Missed Free Throws (FTA - FTM):</strong> Wasting free points.</li>
                    <li><strong>Turnovers (TO):</strong> Losing possession without a shot. This is heavily penalized.</li>
                    <li><strong>Fouls (PF):</strong> Giving the opponent advantages.</li>
                </ul>

                <p className="mt-4">The formula sums these weighted values and then divides by minutes played. Finally, it adjusts for team pace (to stop players on fast teams from having inflated stats just because they have more possessions) and normalizes the league average to 15.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">PER Benchmarks: What is a Good Rating?</h2>
                <p>Because PER is normalized to a league average of 15.0, it provides a very clear tier system for player evaluation:</p>

                <div className="overflow-x-auto my-6">
                    <table className="min-w-full border rounded-lg bg-card">
                        <thead>
                            <tr className="bg-muted">
                                <th className="px-4 py-2 text-left font-bold">PER Range</th>
                                <th className="px-4 py-2 text-left font-bold">Player Category</th>
                                <th className="px-4 py-2 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-primary">35.0+</td>
                                <td className="px-4 py-2 font-bold">All-Time Great</td>
                                <td className="px-4 py-2">Historical season (e.g., Wilt Chamberlain, Giannis Antetokounmpo peak).</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-primary">30.0 - 35.0</td>
                                <td className="px-4 py-2 font-bold">Runaway MVP</td>
                                <td className="px-4 py-2">Undisputed best player in the league for that season.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-primary">25.0 - 30.0</td>
                                <td className="px-4 py-2 font-bold">Strong MVP Candidate</td>
                                <td className="px-4 py-2">Superstar level performance.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-purple-600">20.0 - 25.0</td>
                                <td className="px-4 py-2 font-bold">All-Star</td>
                                <td className="px-4 py-2">The definition of an elite player or franchise cornerstone.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-blue-600">16.5 - 20.0</td>
                                <td className="px-4 py-2 font-bold">Solid Starter</td>
                                <td className="px-4 py-2">2nd or 3rd option on a good team.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-gray-600">15.0</td>
                                <td className="px-4 py-2 font-bold">League Average</td>
                                <td className="px-4 py-2">A capable rotation player.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-orange-600">13.0 - 15.0</td>
                                <td className="px-4 py-2 font-bold">Rotation Player</td>
                                <td className="px-4 py-2">Bench player; contributes in spots.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-red-600">&#60; 11.0</td>
                                <td className="px-4 py-2 font-bold">Replacement Level</td>
                                <td className="px-4 py-2">End of bench; generally losing their roster spot.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of PER</h2>
                <p>While powerful, PER is not perfect. Critics point out several flaws that users must be aware of:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Defense is Undervalued</h3>
                <p>PER relies on box score stats (Steals and Blocks) to measure defense. However, good defense is often about positioning, contesting shots, and preventing passes—things that don&apos;t show up in the box score. An elite defender like Bruce Bowen or Shane Battier often had low PERs despite high value.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Volume Scoring Bias</h3>
                <p>The formula weights Field Goals Made heavily. A player who shoots frequently with slightly below-average efficiency can still have a high PER because the value of a made shot outweighs the penalty of a missed shot in the formula (to a point). This rewards high-usage &quot;gunners.&quot;</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Pace Adjustment Complexity</h3>
                <p>True PER requires league-wide pace data. The calculator above provides an &quot;Unadjusted PER&quot; (uPER) estimate. Without the league context, it&apos;s a great approximation relative to itself, but comparing it directly to official NBA historical PERs requires caution.</p>

                <hr />

                {/* STRATEGIES TO IMPROVE */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve PER</h2>
                <p>For players wanting to boost their rating, the math reveals the path:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Stop Turning the Ball Over</h3>
                <p>Turnovers are the biggest PER killer. A turnover is a wasted possession with zero chance of scoring. Reducing turnovers instantly boosts PER significantly.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Hunt High-Value Shots (3s and FTs)</h3>
                <p>PER rewards 3-pointers and Free Throws differently. Hitting a 3-pointer is worth more than a 2-pointer, obviously, but drawing fouls and hitting free throws is also a highly efficient way to score without using field goal attempts (if you miss the shot while fouled).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Crash the Boards</h3>
                <p>Rebounds are pure positive equity in the PER formula. Even weak-side defensive rebounds add up over time.</p>

                <hr />

                {/* CASE STUDIES */}
                <h2 id="case-studies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Real-World Examples</h2>
                <p><strong>Case Study A: The Efficient Superstar (Nikola Jokic)</strong></p>
                <p>Nikola Jokic consistently records the highest PERs in history (30+). Why? He scores with high efficiency (high FG%), gets massive rebounds, and dishes elite assists, all while having relatively low turnovers for his usage rate. He fills every positive column.</p>

                <p><strong>Case Study B: The Volume Scorer</strong></p>
                <p>Consider a player who scores 25 PPG but shoots 40% from the field and has 5 turnovers. Their PER might hover around 18-20 (Good/Star territory) but will never reach MVP levels (25+) because the missed shots and turnovers drag down the &quot;efficiency&quot; part of the equation, despite the high point total.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about PER and its calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the highest PER of all time?</h4>
                            <p className="text-muted-foreground">
                                For a single season, Nikola Jokic (2021-22) set the record with a PER of roughly 32.85, surpassing Wilt Chamberlain and Giannis Antetokounmpo. Michael Jordan and LeBron James also have multiple seasons with PER above 31.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does PER account for minutes played?</h4>
                            <p className="text-muted-foreground">
                                Yes. PER is a per-minute statistic. It divides productivity by minutes played. This means a player who plays 10 minutes and gets 5 points/5 rebounds will have a similar PER to someone who plays 40 minutes and gets 20 points/20 rebounds, assuming efficiency remains constant.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is the league average always 15.0?</h4>
                            <p className="text-muted-foreground">
                                This is by design. At the end of every season, the entire league's PER calculation is normalized so that the average equals 15. This allows for cross-era comparison. A PER of 25 in 1990 is just as dominant as a PER of 25 in 2024.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can PER be negative?</h4>
                            <p className="text-muted-foreground">
                                Yes, though it's rare. A player who plays minutes but records only turnovers, fouls, and missed shots (with no positive stats) will have a negative PER.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is PER better than Plus/Minus (+/-)?</h4>
                            <p className="text-muted-foreground">
                                They measure different things. PER measures individual box-score productivity. Plus/Minus measures team performance while a player is on the floor. PER is better for isolating individual skill, while Plus/Minus is better for understanding team impact and lineups.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do I interpret my uPER from this calculator?</h4>
                            <p className="text-muted-foreground">
                                The uPER (Unadjusted PER) output by this calculator assumes an average league pace. If you are playing in a very fast-paced league (lots of possessions), your uPER might be naturally higher. If playing in a slow defensive league, it might be lower.
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
                                    <strong className="block text-primary mb-1">Fantasy Basketball Managers</strong>
                                    <span className="text-sm text-muted-foreground">Identify undervalued players who produce well in limited minutes (&quot;sleepers&quot;).</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches & Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate player efficiency beyond simple point totals.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Players</strong>
                                    <span className="text-sm text-muted-foreground">Track your own &quot;efficiency rating&quot; game-by-game to focus on reducing mistakes.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Compare players across different teams and roles on an equal footing.</span>
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
                                The Basketball Player Efficiency Rating (PER) Calculator provides a sophisticated estimate of a player's per-minute productivity.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By accounting for positive contributions (scoring, playmaking, defense) and penalizing negative ones (misses, turnovers, fouls), it delivers a single number that encapsulates overall offensive impact, helping to identify true efficiency at any level of the game.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
