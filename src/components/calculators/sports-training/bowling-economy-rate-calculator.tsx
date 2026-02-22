import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Zap, Activity, Users, AlertTriangle, Target, Shield, AlertCircle } from 'lucide-react';
import BowlingEconomyRateCalculatorInteractive from './bowling-economy-rate-calculator-interactive';

export default function BowlingEconomyRateCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Bowling Economy Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate cricket bowling economy rate (runs per over) to measure run containment.
                </p>
            </div>

            <BowlingEconomyRateCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for economy rate calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <AlertCircle className="h-4 w-4" />
                                Runs Conceded
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of runs given away by the bowler during their bowling spell.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes all runs scored off the bowler&apos;s deliveries</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes wides and no-balls bowled</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Target className="h-4 w-4" />
                                Overs Bowled
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of complete and partial overs bowled by the bowler.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Expressed in decimal format (e.g., 10.3 means 10 overs and 3 balls)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Each over consists of 6 legal deliveries</span>
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
                            Economy Rate = Runs Conceded / Overs Bowled
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Measures a bowler&apos;s run containment ability by calculating the average number of runs conceded per over. A lower economy rate indicates better control and effectiveness.
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
                        <Link href="/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Wicket-taking efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Batting consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/required-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Required Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Chase calculator</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/cricket-fantasy-points-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Fantasy Points</p>
                                            <p className="text-sm text-muted-foreground">Fantasy cricket</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/team-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Team Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring pace</p>
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
                <meta itemProp="name" content="The Complete Guide to Cricket Bowling Economy Rate: Calculation and Analysis" />
                <meta itemProp="description" content="An expert guide to understanding bowling economy rate in cricket, including calculation methods, format-specific benchmarks, and strategies for improvement." />
                <meta itemProp="keywords" content="bowling economy rate, cricket bowling statistics, run containment, T20 economy rate, ODI economy rate, cricket bowling analysis" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-09" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Cricket Bowling Economy Rate</h2>
                <p className="text-lg italic text-muted-foreground">Master the critical metric that defines a bowler&apos;s run containment ability and value in limited-overs cricket.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">What is Bowling Economy Rate?</h2>
                <p>The <strong>Bowling Economy Rate</strong> measures how many runs a bowler concedes per over. It&apos;s calculated by dividing total runs conceded by overs bowled. In limited-overs cricket, especially T20, economy rate is often MORE important than bowling average.</p>

                <p>A lower economy rate indicates better run containment and pressure building. In T20 cricket, an economy rate under 7.0 is excellent, while under 6.0 is exceptional.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Format-Specific Benchmarks</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Under 6.0:</strong> Exceptional economy rate</li>
                    <li><strong>6.0-7.0:</strong> Excellent containment</li>
                    <li><strong>7.0-8.0:</strong> Good economy rate</li>
                    <li><strong>8.0-9.0:</strong> Average performance</li>
                    <li><strong>Above 9.0:</strong> Poor economy rate</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Under 4.5:</strong> Exceptional economy</li>
                    <li><strong>4.5-5.5:</strong> Excellent containment</li>
                    <li><strong>5.5-6.5:</strong> Good economy rate</li>
                    <li><strong>Above 6.5:</strong> Below average</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Test Cricket</h3>
                <p>Economy rate is less emphasized in Test cricket, where wicket-taking is prioritized. However, economy rates of 2.5-3.5 are typical for good Test bowlers.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Strategies to Improve Economy Rate</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Line and Length Discipline</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Bowl consistent areas that are hard to score from</li>
                    <li>Avoid half-volleys and short-wide deliveries</li>
                    <li>Target the stumps or just outside off-stump</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Dot Ball Pressure</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Build pressure through consecutive dot balls</li>
                    <li>Force batsmen into risky shots</li>
                    <li>Control the scoring rate</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Field Placement</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Set defensive fields in death overs</li>
                    <li>Protect boundaries effectively</li>
                    <li>Bowl to your field settings</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Conclusion</h2>
                <p>Bowling economy rate is a critical metric in modern cricket, especially in limited-overs formats. Understanding and improving your economy rate is essential for becoming a valuable bowler in T20 and ODI cricket.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about bowling economy rate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good economy rate in cricket?</h4>
                            <p className="text-muted-foreground">
                                In T20 cricket, under 7.0 is good and under 6.0 is excellent. In ODI cricket, under 5.5 is good and under 4.5 is excellent. In Test cricket, economy rate is less important, but 2.5-3.5 is typical for quality bowlers.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is economy rate calculated?</h4>
                            <p className="text-muted-foreground">
                                Economy rate is calculated by dividing runs conceded by overs bowled. Formula: Economy Rate = Runs Conceded / Overs Bowled. For example, 42 runs in 10 overs = 42/10 = 4.2 economy rate.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is economy rate more important than bowling average?</h4>
                            <p className="text-muted-foreground">
                                In T20 cricket, economy rate is often MORE important than bowling average, as containing runs is crucial. In ODI cricket, both are equally important. In Test cricket, bowling average (wicket-taking) is more important than economy rate.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What&apos;s the difference between economy rate and strike rate?</h4>
                            <p className="text-muted-foreground">
                                Economy rate measures runs conceded per over (run containment), while bowling strike rate measures balls bowled per wicket (wicket-taking speed). Economy rate is about control, strike rate is about attacking effectiveness.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the best economy rate in cricket?</h4>
                            <p className="text-muted-foreground">
                                In T20 internationals, bowlers like Rashid Khan and Sunil Narine have exceptional economy rates around 6.0-6.5. In ODIs, Joel Garner had a remarkable economy rate of 3.09. In Tests, economy rate varies more but quality bowlers maintain around 2.5-3.0.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does economy rate include wides and no-balls?</h4>
                            <p className="text-muted-foreground">
                                Yes. All runs conceded by the bowler, including wides and no-balls, are counted in the runs conceded. This makes accuracy and discipline crucial for maintaining a good economy rate.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do I improve my economy rate?</h4>
                            <p className="text-muted-foreground">
                                Focus on consistent line and length, bowl to your field, increase dot ball percentage, develop variations, improve yorker execution, avoid boundary balls, and build pressure through consecutive dot balls.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What&apos;s a good economy rate in powerplay overs?</h4>
                            <p className="text-muted-foreground">
                                In T20 powerplay, under 7.0 is good. In ODI powerplay, under 5.0 is good. Powerplay overs typically have higher economy rates due to field restrictions and aggressive batting.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What&apos;s a good economy rate in death overs?</h4>
                            <p className="text-muted-foreground">
                                Death overs (16-20 in T20, 40-50 in ODI) are the hardest to bowl. In T20, under 9.0 is good and under 8.0 is excellent. In ODI, under 7.0 is good. Death bowling specialists are highly valued.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can economy rate be too low?</h4>
                            <p className="text-muted-foreground">
                                Generally, no. However, an extremely low economy rate with very few wickets might indicate overly defensive bowling. The ideal is low economy rate WITH wickets—combining containment with attacking intent.
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
                                    <strong className="block text-primary mb-1">Cricket Bowlers</strong>
                                    <span className="text-sm text-muted-foreground">Track your run containment and identify areas to improve control.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Analyze bowler performance and set economy rate targets.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate bowlers for commentary or fantasy cricket selection.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Fans</strong>
                                    <span className="text-sm text-muted-foreground">Better understand bowling statistics and compare bowlers.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <span><strong>Doesn&apos;t Measure Wicket-Taking:</strong> A low economy rate without wickets indicates defensive bowling. Both economy and wickets matter.</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <span><strong>Context Matters:</strong> Bowling phase (powerplay vs death), pitch conditions, and opposition quality significantly affect economy rate.</span>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                                    <span><strong>Format Specific:</strong> Economy rate benchmarks vary dramatically between Test, ODI, and T20 cricket.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 1 - T20 Exceptional Performance:</strong> A bowler concedes 24 runs in 4 overs. Economy Rate = 24 / 4 = 6.0. This is an excellent T20 economy rate, indicating strong run containment and pressure building.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 2 - ODI Middle Overs:</strong> A bowler concedes 45 runs in 10 overs. Economy Rate = 45 / 10 = 4.5. This is an excellent ODI economy rate, showing effective control during the middle overs.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Example 3 - Death Overs Challenge:</strong> A death bowler concedes 38 runs in 4 overs (overs 17-20 in T20). Economy Rate = 38 / 4 = 9.5. While high, this is acceptable for death overs where batsmen attack aggressively.
                                    </p>
                                </div>
                            </div>
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
                                    <strong className="block text-primary mb-1">Bowlers</strong>
                                    <span className="text-sm text-muted-foreground">Track ability to restrict runs and build pressure.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Captains</strong>
                                    <span className="text-sm text-muted-foreground">Decide bowling changes based on economy.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fans</strong>
                                    <span className="text-sm text-muted-foreground">Analyze which bowlers define the game tempo.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Selectors</strong>
                                    <span className="text-sm text-muted-foreground">Identify key defensive bowlers for limited-overs.</span>
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
                                The Bowling Economy Rate Calculator measures a cricket bowler&apos;s run containment ability by calculating runs conceded per over.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It is especially critical in limited-overs cricket (ODI and T20) where controlling the run rate is as important as taking wickets.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
