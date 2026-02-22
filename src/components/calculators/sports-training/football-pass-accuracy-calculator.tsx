import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Shield, Users, Target } from 'lucide-react';
import FootballPassAccuracyCalculatorInteractive from './football-pass-accuracy-calculator-interactive';

export default function FootballPassAccuracyCalculator() {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football - Pass Accuracy Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate pass accuracy to measure ball retention, distribution quality, and technical ability in football.
                </p>
            </div>

            <FootballPassAccuracyCalculatorInteractive />

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
                                <CheckCircle2 className="h-4 w-4" />
                                Successful Passes
                            </h4>
                            <p className="text-sm text-muted-foreground">Total number of passes that successfully reached a teammate.</p>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Activity className="h-4 w-4" />
                                Total Passes Attempted
                            </h4>
                            <p className="text-sm text-muted-foreground">Total number of passes attempted (including both successful and unsuccessful).</p>
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
                            Pass Accuracy (%) = (Successful Passes / Total Passes Attempted) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Measures the percentage of passes that successfully reach a teammate. Higher accuracy indicates better ball control, decision-making, and technical ability.
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
                        <Link href="/football-goal-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Goal Conversion Rate</p>
                                            <p className="text-sm text-muted-foreground">Finishing efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/strike-rate-calculator" className="block">
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
                        <Link href="/batting-average-calculator" className="block">
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
                        <Link href="/cricket-player-performance-index-calculator" className="block">
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
                        <Link href="/match-impact-score-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Match Impact Score</p>
                                            <p className="text-sm text-muted-foreground">All-round contribution</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/team-batting-average-calculator" className="block">
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
                <meta itemProp="name" content="The Complete Guide to Pass Accuracy in Football" />
                <meta itemProp="description" content="Expert guide to understanding pass accuracy in football, including calculation methods, performance benchmarks, and strategies to improve ball retention and distribution." />
                <meta itemProp="keywords" content="pass accuracy, football passing, ball retention, distribution quality, football statistics" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Complete Guide to Pass Accuracy in Football</h2>
                <p className="text-lg italic">Master the metric that measures ball retention, distribution quality, and technical excellence.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">What is Pass Accuracy?</h2>
                <p>Pass Accuracy measures the percentage of passes that successfully reach a teammate. It's a fundamental metric for evaluating a player's technical ability, decision-making, and contribution to team possession.</p>

                <p>High pass accuracy indicates:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Excellent ball control and technique</li>
                    <li>Good decision-making and awareness</li>
                    <li>Composure under pressure</li>
                    <li>Effective contribution to team possession</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Calculation Method</h3>
                <div className="p-4 bg-muted rounded-lg my-4">
                    <p className="font-mono text-center">Pass Accuracy = (Successful Passes / Total Passes) × 100</p>
                </div>

                <h2 className="text-2xl font-bold text-foreground mt-8">Performance Benchmarks</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>90%+:</strong> Elite accuracy - world-class technical ability</li>
                    <li><strong>85-90%:</strong> Excellent accuracy - top-level players</li>
                    <li><strong>80-85%:</strong> Very good accuracy - strong ball retention</li>
                    <li><strong>75-80%:</strong> Good accuracy - solid technical foundation</li>
                    <li><strong>70-75%:</strong> Average accuracy</li>
                    <li><strong>Below 70%:</strong> Below average - needs improvement</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Position-Specific Benchmarks</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Center Backs & Defensive Midfielders</h3>
                <p>Expected accuracy: 85-92%. These players typically have more time and space, making higher accuracy achievable.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Central Midfielders</h3>
                <p>Expected accuracy: 80-88%. Balance between safe and progressive passing.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Attacking Midfielders & Wingers</h3>
                <p>Expected accuracy: 75-85%. More risk-taking with through balls and crosses.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Strikers</h3>
                <p>Expected accuracy: 70-80%. Often receive difficult passes and play with back to goal.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Strategies to Improve Pass Accuracy</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Technical Excellence</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Master proper passing technique with both feet</li>
                    <li>Improve first touch to set up better passing positions</li>
                    <li>Practice different pass types (short, long, through balls)</li>
                    <li>Work on pass weight and timing</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Awareness and Vision</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Scan the field before receiving the ball</li>
                    <li>Anticipate teammate movements</li>
                    <li>Recognize pressure and adjust pass selection</li>
                    <li>Develop peripheral vision</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Decision Making</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Choose appropriate pass type for each situation</li>
                    <li>Balance risk and reward</li>
                    <li>Know when to play safe vs. progressive passes</li>
                    <li>Recognize teammate positioning and movement</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Context Matters</h2>
                <p>Pass accuracy should be interpreted with context:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Playing style:</strong> Possession-based teams have higher accuracy</li>
                    <li><strong>Position:</strong> Defenders typically have higher accuracy than attackers</li>
                    <li><strong>Opposition pressure:</strong> High-pressing opponents reduce accuracy</li>
                    <li><strong>Pass difficulty:</strong> Progressive passes are harder than sideways passes</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Elite Players' Pass Accuracy</h2>
                <p>Top midfielders in major leagues typically maintain accuracy of 85-92%. Players like Rodri, Kroos, and Busquets consistently achieve rates above 90%, demonstrating exceptional technical ability and decision-making.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Balancing Accuracy with Progression</h2>
                <p>While high accuracy is valuable, it shouldn't come at the expense of progressive play. A player with 95% accuracy playing only safe sideways passes is less valuable than one with 82% accuracy who creates chances with forward passes.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Conclusion</h2>
                <p>Pass accuracy is a fundamental metric for evaluating technical ability and ball retention in football. By tracking and improving this metric while maintaining progressive intent, players can become more effective in possession and contribute significantly to team success.</p>
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
                            <h4 className="font-semibold text-lg mb-3">What is a good pass accuracy in football?</h4>
                            <p className="text-muted-foreground">
                                85%+ is excellent, 80-85% is very good, and 75-80% is good. Benchmarks vary by position: defenders/defensive midfielders should aim for 85-92%, while attackers typically achieve 75-85%.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is pass accuracy calculated?</h4>
                            <p className="text-muted-foreground">
                                Divide successful passes by total passes attempted, then multiply by 100. For example: 45 successful passes from 52 attempts = (45/52) × 100 = 86.54%.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does pass accuracy include crosses and long balls?</h4>
                            <p className="text-muted-foreground">
                                Yes, all pass types are typically included. Some advanced statistics separate short passes, long passes, and crosses for more detailed analysis.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can pass accuracy be too high?</h4>
                            <p className="text-muted-foreground">
                                Yes, if a player achieves very high accuracy (95%+) by only playing safe passes, they may not be contributing enough progressive play. Balance between accuracy and progression is ideal.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How can I improve my pass accuracy?</h4>
                            <p className="text-muted-foreground">
                                Practice proper technique with both feet, improve first touch, scan the field before receiving, work on pass weight and timing, and develop better decision-making under pressure.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why do defenders have higher pass accuracy than attackers?</h4>
                            <p className="text-muted-foreground">
                                Defenders typically have more time and space, face less pressure, and play safer passes. Attackers attempt riskier passes in tighter spaces and face more defensive pressure.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does playing style affect pass accuracy?</h4>
                            <p className="text-muted-foreground">
                                Yes, possession-based teams typically have higher accuracy (80-90%) as they prioritize ball retention. Counter-attacking teams may have lower accuracy (70-80%) due to riskier, faster passing.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's more important: pass accuracy or progressive passing?</h4>
                            <p className="text-muted-foreground">
                                Both are important. Ideal players maintain high accuracy (80-85%+) while still attempting progressive passes that advance play. Pure accuracy without progression has limited value.
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
                                    <strong className="block text-primary mb-1">Football Players</strong>
                                    <span className="text-sm text-muted-foreground">Track passing performance and identify technical areas for improvement.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate player technical ability and develop passing training programs.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Assess player ball retention and technical quality for recruitment.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Compare player passing efficiency and team possession quality.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Doesn't Measure Pass Quality</h4>
                                    <p className="text-sm text-muted-foreground">
                                        A 5-yard sideways pass and a 40-yard through ball count equally. High accuracy from only safe passes may not indicate high quality.
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Context Missing</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Doesn't account for opposition pressure, playing style, or position. A defender's 90% accuracy is different from an attacking midfielder's 90%.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Case Study A: Elite Midfielder</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Stats:</strong> 78 successful passes from 85 attempts (Accuracy: 91.76%)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Elite passing accuracy with excellent ball retention. Strong technical ability and decision-making.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Key playmaker who maintains possession and dictates tempo. Highly reliable in build-up play.
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Case Study B: Progressive Winger</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Stats:</strong> 35 successful passes from 45 attempts (Accuracy: 77.78%)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Good accuracy for an attacking player attempting difficult crosses and through balls.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Effective winger who balances risk-taking with ball retention. Creates chances while maintaining decent accuracy.
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
                                The Football Pass Accuracy Calculator measures ball retention by calculating the percentage of passes that successfully reach a teammate.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                This fundamental metric helps players, coaches, and analysts evaluate technical ability, decision-making, and contribution to team possession.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
