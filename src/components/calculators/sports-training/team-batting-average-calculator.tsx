import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Shield } from 'lucide-react';
import TeamBattingAverageCalculatorInteractive from './team-batting-average-calculator-interactive';

export default function TeamBattingAverageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Cricket Team Batting Average Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate team batting average to measure collective batting performance and batting depth across matches, series, or tournaments in cricket.
                </p>
            </div>

            <TeamBattingAverageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for team batting average calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Users className="h-4 w-4" />
                                Total Runs Scored
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The cumulative runs scored by the team across all innings in the period being analyzed.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Sum of all batsmen's runs across all innings</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes extras (wides, no-balls, byes, leg-byes)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Can be calculated for single match, series, or season</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Total Wickets Lost
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of wickets lost by the team across all innings in the period.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Sum of all dismissals across innings</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Does NOT count not-out innings as wickets</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Used as denominator in average calculation</span>
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
                            Team Batting Average = Total Runs Scored / Total Wickets Lost
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Measures the average runs scored per wicket lost by the team. A higher team batting average indicates better collective batting performance, greater batting depth, and more consistent contributions throughout the order. This metric helps evaluate team batting strength and resilience.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Cricket Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other cricket performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Individual consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/team-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Team Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring pace</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/run-contribution-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Run Contribution %</p>
                                            <p className="text-sm text-muted-foreground">Individual impact</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/cricket-partnership-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Partnership Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Partnership analysis</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Complete Guide Section - Condensed for token limit */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                <meta itemProp="name" content="The Complete Guide to Team Batting Average in Cricket" />
                <meta itemProp="description" content="Expert guide to understanding team batting average in cricket, including calculation methods, performance benchmarks, batting depth analysis, and how collective batting strength shapes match outcomes." />
                <meta itemProp="keywords" content="team batting average, cricket statistics, batting depth, collective performance, team batting analysis, cricket metrics" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Complete Guide to Team Batting Average in Cricket</h2>
                <p className="text-lg italic">Master the metric that reveals team batting strength, depth, and collective performance across all formats.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">What is Team Batting Average?</h2>
                <p>Team Batting Average measures the average number of runs scored per wicket lost by a cricket team. Unlike individual batting average which tracks a single player's consistency, team batting average reveals the collective strength and depth of the entire batting lineup.</p>

                <p>A high team batting average indicates:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Strong batting depth throughout the order</li>
                    <li>Consistent contributions from multiple batsmen</li>
                    <li>Effective partnerships and collective responsibility</li>
                    <li>Resilience against quality bowling attacks</li>
                    <li>Ability to post competitive totals regularly</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Calculation Method</h3>
                <div className="p-4 bg-muted rounded-lg my-4">
                    <p className="font-mono text-center">Team Batting Average = Total Runs / Total Wickets Lost</p>
                </div>

                <p><strong>Example:</strong> If a team scores 2,850 runs while losing 95 wickets across a series, their team batting average is 2,850 ÷ 95 = 30.00</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Performance Benchmarks</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Test Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>40+:</strong> World-class batting lineup with exceptional depth</li>
                    <li><strong>35-40:</strong> Excellent team batting with strong contributions</li>
                    <li><strong>30-35:</strong> Good batting lineup with solid depth</li>
                    <li><strong>25-30:</strong> Average batting performance</li>
                    <li><strong>Below 25:</strong> Weak batting requiring improvement</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>35+:</strong> Outstanding batting depth and consistency</li>
                    <li><strong>30-35:</strong> Strong batting lineup</li>
                    <li><strong>25-30:</strong> Good collective performance</li>
                    <li><strong>20-25:</strong> Average batting strength</li>
                    <li><strong>Below 20:</strong> Weak batting needing development</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>30+:</strong> Exceptional batting depth</li>
                    <li><strong>25-30:</strong> Strong batting lineup</li>
                    <li><strong>20-25:</strong> Good team batting</li>
                    <li><strong>15-20:</strong> Average performance</li>
                    <li><strong>Below 15:</strong> Weak batting requiring improvement</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Batting Depth Analysis</h2>
                <p>Team batting average reveals batting depth better than any other single metric. A team with a 35+ average typically has:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Top order (1-3) averaging 40-50+</li>
                    <li>Middle order (4-6) averaging 30-40</li>
                    <li>Lower order (7-9) averaging 20-25</li>
                    <li>Tail (10-11) contributing 10-15 runs per dismissal</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Strategies to Improve Team Batting Average</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Develop Batting Depth</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Invest in lower-order batting skills</li>
                    <li>Practice partnerships between top and lower order</li>
                    <li>Promote all-rounders who can bat</li>
                    <li>Focus on tail-enders' defensive technique</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Build Partnerships</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Emphasize running between wickets</li>
                    <li>Develop communication and understanding</li>
                    <li>Practice batting with different partners</li>
                    <li>Create partnership-building drills</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Collective Responsibility</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Encourage all batsmen to take ownership</li>
                    <li>Avoid over-reliance on top 2-3 batsmen</li>
                    <li>Develop match-winning ability throughout order</li>
                    <li>Create team batting goals and targets</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Common Pitfalls</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Top-heavy batting:</strong> Strong top order but weak middle/lower order</li>
                    <li><strong>Inconsistency:</strong> High averages in some matches, collapses in others</li>
                    <li><strong>Lack of depth:</strong> Team struggles when top order fails</li>
                    <li><strong>Poor partnerships:</strong> Individual scores without building partnerships</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Conclusion</h2>
                <p>Team batting average is a fundamental metric for assessing collective batting strength in cricket. It reveals batting depth, consistency, and the ability to post competitive totals. Teams with high batting averages typically have multiple match-winners, strong partnerships, and contributions throughout the order.</p>

                <p>By tracking and improving team batting average, coaches and analysts can identify weaknesses, develop batting depth, and build more resilient, balanced batting lineups capable of succeeding across all formats and conditions.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good team batting average in cricket?</h4>
                            <p className="text-muted-foreground">
                                In Test cricket, 35+ is excellent, 30-35 is good. In ODI cricket, 30+ is strong, 25-30 is good. In T20 cricket, 25+ is excellent, 20-25 is good. These benchmarks indicate batting depth and collective strength throughout the order.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is team batting average different from individual batting average?</h4>
                            <p className="text-muted-foreground">
                                Individual batting average measures one player's consistency (runs per dismissal). Team batting average measures collective performance (total team runs per total wickets lost). Team average reveals batting depth and overall lineup strength, while individual average shows personal consistency.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does team batting average include extras?</h4>
                            <p className="text-muted-foreground">
                                Yes, team batting average includes extras (wides, no-balls, byes, leg-byes) in the total runs, as these contribute to the team's score. However, extras don't count as wickets, so they increase the team batting average.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What does a low team batting average indicate?</h4>
                            <p className="text-muted-foreground">
                                A low team batting average (below 25 in Tests, below 20 in ODIs, below 15 in T20s) indicates weak batting depth, frequent collapses, heavy reliance on top order, and difficulty posting competitive totals. It suggests urgent need for batting development.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How can a team improve its batting average?</h4>
                            <p className="text-muted-foreground">
                                Develop batting depth by training lower-order batsmen, build partnerships through communication and running, encourage collective responsibility, convert starts into big scores, strengthen middle-order batting, and develop all-rounders who can contribute with the bat.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is team batting average calculated per match or over multiple matches?</h4>
                            <p className="text-muted-foreground">
                                Team batting average can be calculated for any period: single match, series, season, or career. For meaningful analysis, it's typically calculated over multiple matches (series or season) to reveal consistent patterns rather than one-off performances.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the relationship between team batting average and winning?</h4>
                            <p className="text-muted-foreground">
                                Higher team batting averages strongly correlate with winning. Teams with 35+ averages in Tests or 30+ in ODIs win significantly more matches. Strong batting depth allows teams to post competitive totals consistently and recover from top-order failures.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a team have a high batting average but still lose?</h4>
                            <p className="text-muted-foreground">
                                Yes, if bowling is weak or fielding is poor. Team batting average measures only batting performance. A team might score well (high average) but concede more runs due to weak bowling, resulting in losses. Balanced teams excel in batting, bowling, and fielding.
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
                                    <strong className="block text-primary mb-1">Team Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Assess batting depth, identify weaknesses, and develop team batting strategy.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate team batting strength, compare teams, and predict performance.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Team Selectors</strong>
                                    <span className="text-sm text-muted-foreground">Identify gaps in batting lineup and make selection decisions.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Statisticians</strong>
                                    <span className="text-sm text-muted-foreground">Track team performance trends over time and across formats.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Doesn't Show Strike Rate</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Team batting average measures runs per wicket but not scoring speed. A team averaging 30 at run rate 4.0 is different from averaging 30 at run rate 6.0.
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Context Missing</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Doesn't account for opposition strength, pitch conditions, or match situations. A 30 average against strong bowling on difficult pitches is better than 35 against weak bowling on flat pitches.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Case Study A: Strong Batting Depth</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Scenario:</strong> Team scores 3,200 runs, loses 80 wickets in 10-match series (Average: 40.00)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Exceptional batting depth with contributions throughout the order. Multiple batsmen averaging 40+, strong partnerships, lower-order contributions.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Team wins 8/10 matches. High batting average translates to consistent competitive totals and match victories.
                                    </p>
                                </div>

                                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Case Study B: Weak Batting Depth</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Scenario:</strong> Team scores 1,800 runs, loses 100 wickets in 10-match series (Average: 18.00)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Poor batting depth, frequent collapses, heavy reliance on top 2-3 batsmen. Middle and lower order contribute minimally.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Team wins only 2/10 matches. Low batting average results in inadequate totals and frequent defeats.
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
                                The Team Batting Average Calculator is an essential tool for measuring collective batting performance and batting depth in cricket.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By calculating average runs per wicket lost, it reveals team batting strength, consistency, and resilience, helping coaches and analysts develop stronger, more balanced batting lineups across all formats.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
