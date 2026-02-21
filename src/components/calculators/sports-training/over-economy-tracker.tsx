import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, CheckCircle2, TrendingDown, AlertCircle, FunctionSquare, Calculator, Shield, Activity, TrendingUp, Users, AlertTriangle, Briefcase, Landmark, Target, Zap, Trophy } from 'lucide-react';
import OverEconomyTrackerInteractive from './over-economy-tracker-interactive';

export default function OverEconomyTracker() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Cricket Over Economy Tracker</h1>
                <p className="text-lg text-muted-foreground">
                    Track, analyze, and optimize your bowling spells with the advanced Over Economy Tracker. Calculate economy rates instantly and get format-specific performance ratings.
                </p>
            </div>

            <OverEconomyTrackerInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics required for accurate economy tracking
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Activity className="h-4 w-4" />
                                Overs Bowled
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of legal overs delivered by the bowler.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Accepts decimal notation (e.g., 3.4 for 3 overs, 4 balls).</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Important:</strong> 6 balls = 1 full over.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <TrendingDown className="h-4 w-4" />
                                Runs Conceded
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Total runs scored against the bowler during their spell.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Includes boundaries (4s, 6s) and running between wickets.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Includes wides and no-balls (extras charged to bowler).</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>Excludes:</strong> Byes and Leg Byes.</span>
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
                            Economy Rate (E.R.) = Total Runs Conceded / Total Overs Bowled
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        <strong>Note on Partial Overs:</strong> For calculation, overs like 3.4 are converted to decimal. 3.4 overs = 3 + (4/6) = 3.666 overs. The formula uses this precise decimal value to ensure accuracy.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Cricket Tools
                    </CardTitle>
                    <CardDescription>
                        Enhance your cricket analysis with these specialized calculators
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Runs per wicket taken</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Batting scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/required-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Required Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Chase targets efficiently</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/cricket-win-probability-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Win Probability</p>
                                            <p className="text-sm text-muted-foreground">Predict match outcome</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Consistency metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/cricket-fantasy-points-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Fantasy Points</p>
                                            <p className="text-sm text-muted-foreground">Optimize your team</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Bowling Economy Rate: Tracking, Analysis, and Improvement Strategies" />
                <meta itemProp="description" content="A comprehensive guide to understanding Bowling Economy Rate in cricket. Learn how to calculate it, interpret benchmarks for T20, ODI, and Test matches, and discover strategies to lower your economy." />
                <meta itemProp="keywords" content="cricket economy rate calculator, bowling economy formula, calculate runs per over, good economy rate in T20, bowling analysis, cricket coaching tools" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-14" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Mastering the Economy Rate: The Bowler's Guide to Control</h2>
                <p className="text-lg italic text-muted-foreground">In the modern era of cricket, where batsmen are more aggressive than ever, the ability to restrict runs—measured by the Economy Rate—is often as valuable as taking wickets.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Bowling Economy Rate?</a></li>
                    <li><a href="#calculation" className="hover:underline">The Mathematics Behind the Metric</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What is a "Good" Economy?</a></li>
                    <li><a href="#importance" className="hover:underline">Why Economy Rate Matters More in T20</a></li>
                    <li><a href="#improvement" className="hover:underline">Strategies to Lower Your Economy Rate</a></li>
                    <li><a href="#legends" className="hover:underline">Case Studies: The Misers of Cricket</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Bowling Economy Rate?</h2>
                <p>The <strong>Economy Rate (E.R.)</strong> is a fundamental statistic in cricket that measures the average number of runs a bowler concedes per over. It serves as the primary indicator of a bowler's ability to restrict scoring and build pressure on the opposition.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Pressure Valve</h3>
                <p>While the Bowling Average measures how many runs a bowler concedes for every wicket taken, the Economy Rate focuses purely on run containment. In limited-overs cricket (ODIs and T20s), a low economy rate forces batsmen to take risks, often leading to wickets at the other end. It is the measure of control, discipline, and tactical acumen.</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mathematics Behind the Metric</h2>
                <p>Calculating the Economy Rate is straightforward conceptually but requires precision when dealing with incomplete overs.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Standard Formula</h3>
                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-blue-600 dark:text-blue-400 font-bold">
                        Economy Rate = Total Runs Conceded / Total Overs Bowled
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Handling Partial Overs</h3>
                <p>Cricket overs are base-6 (6 balls per over). This often confuses manual calculation. If a bowler bowls 3.4 overs:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Step 1:</strong> Convert balls to a breakdown. 3.4 overs is 3 full overs + 4 balls.</li>
                    <li><strong>Step 2:</strong> Convert to total balls. (3 × 6) + 4 = 22 balls.</li>
                    <li><strong>Step 3:</strong> Convert back to decimal overs. 22 / 6 = 3.666... overs.</li>
                    <li><strong>Step 4:</strong> Divide runs by this decimal. If runs = 25, then 25 / 3.666 = <strong>6.81</strong>.</li>
                </ul>
                <p>Simply dividing by 3.4 would give (25 / 3.4) = 7.35, which is <strong>incorrect</strong>. This calculator handles these conversions automatically.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What is a "Good" Economy?</h2>
                <p>A "good" economy rate is heavily dependent on the format of the game and the era. What was expensive in 1990 might be world-class today.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Cricket (The High-Scoring Era)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Under 6.00:</strong> World Class. Only the absolute best spinners (like Rashid Khan) or elite pacers (like Bumrah) maintain this.</li>
                    <li><strong>6.00 - 7.50:</strong> Excellent. A match-winning contribution.</li>
                    <li><strong>7.50 - 9.00:</strong> Average / Par. Acceptable, especially for death bowlers.</li>
                    <li><strong>Above 9.00:</strong> Expensive. Puts pressure on the batting lineup.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Cricket (50 Overs)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Under 4.50:</strong> Exceptional. Rare in modern cricket with two new balls and powerplays.</li>
                    <li><strong>4.50 - 5.50:</strong> Very Good.</li>
                    <li><strong>5.50 - 6.50:</strong> Average.</li>
                    <li><strong>Above 7.00:</strong> Expensive.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Test Cricket</h3>
                <p>In Tests, wickets are the currency, but economy builds pressure. A rate under <strong>3.00</strong> is considered good control. Anything under <strong>2.50</strong> is miserly. Above <strong>4.00</strong> suggests the bowler is leaking runs and allowing the game to drift.</p>

                <hr />

                {/* IMPORTANCE */}
                <h2 id="importance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Economy Rate Matters More in T20</h2>
                <p>In the shortest format, every dot ball is pure gold. A spell of 4 overs for 24 runs (E.R. 6.00) in a game where the team scores 200 (Rate 10.00) is essentially worth its weight in wickets. </p>
                <p>High economy rates force captains to hide bowlers or change plans defensively. Conversely, a low economy rate in the Powerplay or Death Overs can single-handedly stifle a chase.</p>

                <hr />

                {/* IMPROVEMENT STRATEGIES */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Lower Your Economy Rate</h2>
                <p>Improving your economy rate isn't just about bowling slower or faster; it's about unpredictability and consistency.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. The Power of the Dot Ball</h3>
                <p>The most effective way to lower economy is to bowl dot balls. Bowling "stump to stump" reduces scoring angles. Three dot balls in an over virtually guarantees a sub-6 economy for that over, assuming no boundaries.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Field Placement Synergy</h3>
                <p>Do not bowl an outswinger if your slip cordon is empty. Do not bowl a bouncer if fine leg is up. Bowling to your field is the hallmark of an economical bowler.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Variation is Key</h3>
                <p>In T20s, predictability is death. Use knuckleballs, wide yorkers, and slower bouncers to disrupt the batsman's rhythm. A batsman who cannot predict the length cannot score freely.</p>

                <hr />

                {/* LEGENDS */}
                <h2 id="legends" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Case Studies: The Misers of Cricket</h2>
                <p>Looking at history helps us understand the benchmark of perfection.</p>

                <div className="space-y-4 mt-4">
                    <div className="p-4 border-l-4 border-green-500 bg-muted/30">
                        <h4 className="font-bold">Glenn McGrath (Australia)</h4>
                        <p className="text-sm">The epitome of "boring is effective." His Test economy of 2.49 was built on relentlessly hitting the top of off-stump, giving batsmen zero easy runs.</p>
                    </div>
                    <div className="p-4 border-l-4 border-blue-500 bg-muted/30">
                        <h4 className="font-bold">Sunil Narine (West Indies)</h4>
                        <p className="text-sm">A T20 phenomenon. Even in the IPL, his career economy hovers around 6.70, an absurdly low number for a spinner bowling in the Powerplay and Death.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Frequently Asked Questions
                    </CardTitle>
                    <CardDescription>
                        Common queries about Economy Rates
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a Maiden Over count towards Economy Rate?</h4>
                            <p className="text-muted-foreground">
                                Yes, absolutely. A maiden over (0 runs conceded) drastically reduces your economy rate. It is the best possible outcome for lowering your average runs per over.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do Byes and Leg Byes count against the bowler?</h4>
                            <p className="text-muted-foreground">
                                No. Byes and Leg Byes are credited as "Extras" but are not charged to the bowler's personal figures. They do not increase your Economy Rate. However, Wides and No-Balls DO count against the bowler’s figures.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do Wides affect the Economy Rate calculation?</h4>
                            <p className="text-muted-foreground">
                                A Wide ball adds 1 run to the bowler's "Runs Conceded" tally, but the ball itself is not counted as a legal delivery. Therefore, you concede runs without increasing the "Overs Bowled" count, which spikes the economy rate significantly.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a "Golden Duck" economy?</h4>
                            <p className="text-muted-foreground">
                                This is not a standard term, but if a bowler takes a wicket on the first ball and concedes no runs (0 runs, 0.1 overs), their economy is momentarily 0.00.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is Economy Rate more important than Bowling Average?</h4>
                            <p className="text-muted-foreground">
                                It depends on the role. For an attacking strike bowler (like Brett Lee or Shoaib Akhtar), Average (wickets) is priority. For a defensive spinner or holding bowler (like Jadeja or Murali Kartik), Economy is often the primary KPI.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a bowler have a negative Economy Rate?</h4>
                            <p className="text-muted-foreground">
                                No, runs cannot be negative. The best possible Economy Rate is 0.00 (conceding zero runs in a spell).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do you calculate economy for 3.5 overs?</h4>
                            <p className="text-muted-foreground">
                                3.5 overs is 3 overs and 5 balls. Total balls = 23. Decimal overs = 23/6 ≈ 3.833. Economy = Runs / 3.833.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is Test Match economy so low?</h4>
                            <p className="text-muted-foreground">
                                In Tests, batsmen are not under time pressure. They can defend good balls without penalty. In T20s, dots build pressure, so batsmen play risky shots to score, resulting in higher run rates.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage of this Calculator */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Usage of this Calculator
                    </CardTitle>
                    <CardDescription>
                        Practical applications for players and analysts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Who should use */}
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
                            <Users className="h-5 w-5 text-blue-600" />
                            Who Should Use This Tool?
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Bowlers & Coaches</strong>
                                <span className="text-sm text-muted-foreground">To track match-by-match performance vs targets (e.g., "Keep economy under 7.0").</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Fantasy Cricket Players</strong>
                                <span className="text-sm text-muted-foreground">Many fantasy apps award bonus points for good economy rates. Use this to predict stats.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Commentators</strong>
                                <span className="text-sm text-muted-foreground">For quick analysis of a bowler's spell intensity during a broadcast.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Scorekeepers</strong>
                                <span className="text-sm text-muted-foreground">To verify manual calculations of economy rates at the end of an innings.</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-border/50" />

                    {/* Real World Examples */}
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
                            <Landmark className="h-5 w-5 text-green-600" />
                            Real-World Examples
                        </h4>
                        <div className="space-y-3">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Scenario A: The Economical Spell</h5>
                                <p className="text-sm text-green-700/80 dark:text-green-400">
                                    Bowler A bowls 4 overs and concedes 22 runs. <br />
                                    Calculation: 22 / 4 = <strong>5.50 RPO</strong>. <br />
                                    Verdict: Excellent for T20. Winning contribution.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                <h5 className="font-semibold text-red-800 dark:text-red-300 mb-1">Scenario B: The Expensive Outing</h5>
                                <p className="text-sm text-red-700/80 dark:text-red-400">
                                    Bowler B bowls 3.3 overs and goes for 45 runs. <br />
                                    Calculation: 45 / 3.5 = <strong>12.85 RPO</strong>. <br />
                                    Verdict: Very Expensive. Needs to work on defensive lines.
                                </p>
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
                                The Cricket Over Economy Tracker allows instant calculation and assessment of bowling performances.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By understanding nuances like partial overs and format-specific benchmarks, bowlers can better analyze their game.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Use this tool regularly to monitor your progress and maintain the discipline required for modern cricket.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
