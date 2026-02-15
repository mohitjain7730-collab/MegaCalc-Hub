import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Shield, Users } from 'lucide-react';
import FootballGoalConversionRateCalculatorInteractive from './football-goal-conversion-rate-calculator-interactive';

export default function FootballGoalConversionRateCalculator() {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football - Goal Conversion Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate goal conversion rate to measure finishing efficiency and clinical ability in front of goal in football.
                </p>
            </div>

            <FootballGoalConversionRateCalculatorInteractive />

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Activity className="h-4 w-4" />
                                Goals Scored
                            </h4>
                            <p className="text-sm text-muted-foreground">Total number of goals scored by the player.</p>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Target className="h-4 w-4" />
                                Shots on Target
                            </h4>
                            <p className="text-sm text-muted-foreground">Total shots that were on target (excluding off-target shots).</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FunctionSquare className="h-5 w-5" />
                        Formula Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="font-mono text-sm text-center">
                            Goal Conversion Rate (%) = (Goals Scored / Shots on Target) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Measures the percentage of shots on target that result in goals. Higher conversion rates indicate better finishing ability and clinical performance in front of goal.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Football Calculators
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/football-pass-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Pass Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Ball retention</p>
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
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Consistency metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/match-impact-score-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Match Impact Score</p>
                                            <p className="text-sm text-muted-foreground">All-round contribution</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/team-batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Team Average</p>
                                            <p className="text-sm text-muted-foreground">Collective performance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
                <meta itemProp="name" content="The Complete Guide to Goal Conversion Rate in Football" />
                <meta itemProp="description" content="Expert guide to understanding goal conversion rate in football, including calculation methods, performance benchmarks, and strategies to improve finishing efficiency." />
                <meta itemProp="keywords" content="goal conversion rate, football finishing, striker efficiency, shot conversion, football statistics" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Complete Guide to Goal Conversion Rate in Football</h2>
                <p className="text-lg italic">Master the metric that measures finishing efficiency and clinical ability in front of goal.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">What is Goal Conversion Rate?</h2>
                <p>Goal Conversion Rate measures the percentage of shots on target that result in goals. It's a critical metric for evaluating a striker's finishing ability and efficiency in front of goal.</p>

                <p>A high conversion rate indicates:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Clinical finishing ability</li>
                    <li>Composure under pressure</li>
                    <li>Excellent shot placement and technique</li>
                    <li>High-value striker who maximizes chances</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Calculation Method</h3>
                <div className="p-4 bg-muted rounded-lg my-4">
                    <p className="font-mono text-center">Conversion Rate = (Goals / Shots on Target) × 100</p>
                </div>

                <h2 className="text-2xl font-bold text-foreground mt-8">Performance Benchmarks</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>40%+:</strong> Elite finishing - world-class strikers</li>
                    <li><strong>30-40%:</strong> Excellent finishing - top-level forwards</li>
                    <li><strong>20-30%:</strong> Good finishing - solid strikers</li>
                    <li><strong>15-20%:</strong> Average finishing</li>
                    <li><strong>10-15%:</strong> Below average - needs improvement</li>
                    <li><strong>Below 10%:</strong> Poor finishing requiring urgent work</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Strategies to Improve Conversion Rate</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Technical Excellence</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Practice shot placement over power</li>
                    <li>Develop both-foot finishing ability</li>
                    <li>Master different finishing techniques (volleys, headers, one-touch)</li>
                    <li>Work on first touch to create better shooting positions</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Mental Composure</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Stay calm in one-on-one situations</li>
                    <li>Develop pre-shot routines</li>
                    <li>Visualize successful finishes</li>
                    <li>Learn from missed chances without dwelling on them</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Positioning and Movement</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Improve positioning to get better shooting angles</li>
                    <li>Create space before receiving the ball</li>
                    <li>Time runs to arrive at optimal moments</li>
                    <li>Study goalkeeper positioning and tendencies</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Context Matters</h2>
                <p>Conversion rate should be interpreted with context:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Quality of chances:</strong> One-on-ones vs. difficult angles</li>
                    <li><strong>Opposition quality:</strong> Top goalkeepers vs. weaker defenses</li>
                    <li><strong>Playing style:</strong> Counter-attacking vs. possession-based</li>
                    <li><strong>Position:</strong> Central striker vs. wide forward</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Elite Strikers' Conversion Rates</h2>
                <p>Top strikers in major leagues typically maintain conversion rates of 30-45%. Players like Haaland, Lewandowski, and Mbappé consistently achieve rates above 35%, demonstrating elite finishing ability.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Conclusion</h2>
                <p>Goal conversion rate is a fundamental metric for evaluating finishing efficiency in football. By tracking and improving this metric, strikers can become more clinical finishers and maximize their goal-scoring potential.</p>
            </section>

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
                            <h4 className="font-semibold text-lg mb-3">What is a good goal conversion rate in football?</h4>
                            <p className="text-muted-foreground">
                                A conversion rate of 30%+ is excellent, 20-30% is good, and 15-20% is average for strikers. Elite forwards often achieve 35-45% conversion rates.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is goal conversion rate calculated?</h4>
                            <p className="text-muted-foreground">
                                Divide goals scored by shots on target, then multiply by 100. For example: 15 goals from 50 shots on target = (15/50) × 100 = 30%.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does conversion rate include off-target shots?</h4>
                            <p className="text-muted-foreground">
                                No, it only considers shots on target. This focuses on finishing ability rather than shot accuracy.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can conversion rate be too high?</h4>
                            <p className="text-muted-foreground">
                                Extremely high rates (50%+) over many games might indicate a player is too selective and not taking enough shots, potentially missing scoring opportunities.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How can I improve my conversion rate?</h4>
                            <p className="text-muted-foreground">
                                Focus on shot placement over power, practice finishing under pressure, improve first touch, study goalkeeper positioning, and develop composure in one-on-one situations.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the difference between conversion rate and shot accuracy?</h4>
                            <p className="text-muted-foreground">
                                Conversion rate measures goals per shot on target (finishing efficiency). Shot accuracy measures shots on target per total shots (shooting accuracy).
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do penalties count in conversion rate?</h4>
                            <p className="text-muted-foreground">
                                Yes, penalties are typically included. Some analysts calculate separate rates with and without penalties for more detailed analysis.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does position affect conversion rate?</h4>
                            <p className="text-muted-foreground">
                                Central strikers typically have higher rates (25-35%) due to better positioning. Wide forwards and attacking midfielders often have lower rates (15-25%) as they take more difficult shots.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                                    <strong className="block text-primary mb-1">Football Strikers</strong>
                                    <span className="text-sm text-muted-foreground">Track finishing efficiency and identify areas for improvement.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate striker performance and develop finishing training programs.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Assess striker quality and finishing ability for recruitment.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Compare striker efficiency and predict goal-scoring potential.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Doesn't Account for Chance Quality</h4>
                                    <p className="text-sm text-muted-foreground">
                                        A player converting 30% of difficult chances is more impressive than 30% of easy tap-ins, but the rate doesn't distinguish this.
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Sample Size Matters</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Small sample sizes can be misleading. 3 goals from 6 shots (50%) over 2 games is less reliable than 15 goals from 50 shots (30%) over a season.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Case Study A: Elite Finisher</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Stats:</strong> 28 goals from 65 shots on target (Conversion: 43.08%)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Elite finishing ability. Clinical in front of goal with exceptional composure and technique.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Top scorer in league, highly valued striker with match-winning capability.
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Case Study B: Developing Striker</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Stats:</strong> 12 goals from 58 shots on target (Conversion: 20.69%)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Good conversion rate with room for improvement. Solid finishing foundation.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Decent goal return. With improved finishing technique, could reach 18-20 goals with same shot volume.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                        <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Football Goal Conversion Rate Calculator measures finishing efficiency by calculating the percentage of shots on target that result in goals.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                This essential metric helps strikers, coaches, and analysts evaluate clinical ability in front of goal and identify opportunities to improve finishing technique and composure.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
