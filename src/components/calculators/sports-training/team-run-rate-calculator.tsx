import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Zap, Target, Activity, Users, Shield, Clock } from 'lucide-react';
import TeamRunRateCalculatorInteractive from './team-run-rate-calculator-interactive';

export default function TeamRunRateCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Team Run Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate current team run rate (runs per over) to assess scoring pace and match position.
                </p>
            </div>

            <TeamRunRateCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for team run rate calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Runs Scored
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total runs accumulated by the batting team so far in their innings.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes all runs scored by batsmen and extras</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Updated continuously as the innings progresses</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Clock className="h-4 w-4" />
                                Overs Completed
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of complete and partial overs bowled in the innings so far.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Expressed in decimal format (e.g., 15.4 = 15 overs and 4 balls)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Each complete over consists of 6 legal deliveries</span>
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
                            Team Run Rate = Runs Scored / Overs Completed
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Calculates the average runs scored per over by the batting team. This metric shows the current scoring pace and helps compare performance against required run rates or opposition scores.
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
                        <Link href="/sports-training/required-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Required Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Chase calculator</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/bowling-economy-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Economy Rate</p>
                                            <p className="text-sm text-muted-foreground">Run containment</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Consistency metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Wicket efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/cricket-win-probability-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Win Probability</p>
                                            <p className="text-sm text-muted-foreground">Match prediction</p>
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
                <meta itemProp="name" content="The Complete Guide to Team Run Rate in Cricket: Calculation and Analysis" />
                <meta itemProp="description" content="An expert guide to understanding team run rate in cricket, including calculation methods, performance benchmarks, and strategic applications in limited-overs cricket." />
                <meta itemProp="keywords" content="team run rate, cricket run rate, current run rate, cricket scoring rate, T20 run rate, ODI run rate" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-10" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Team Run Rate in Cricket</h2>
                <p className="text-lg italic text-muted-foreground">Master the fundamental metric that measures team scoring pace and batting performance in limited-overs cricket.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">What is Team Run Rate?</h2>
                <p>The <strong>Team Run Rate</strong> (also called Current Run Rate or CRR) is the average number of runs a team scores per over during their innings. It&apos;s calculated by dividing total runs scored by overs completed.</p>

                <p>Team run rate is constantly updated throughout an innings and serves as the primary indicator of scoring pace. It&apos;s compared against required run rates in chases or used to assess batting performance when setting a total.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">How to Calculate Team Run Rate</h2>
                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Team Run Rate = Runs Scored / Overs Completed
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
                <p>A team has scored 175 runs in 20 overs:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Team Run Rate = 175 / 20 = 8.75 runs per over</li>
                    <li>This indicates strong aggressive batting in T20 cricket</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Interpreting Team Run Rate by Format</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>10.0+:</strong> Exceptional scoring rate</li>
                    <li><strong>8.0-10.0:</strong> Excellent batting performance</li>
                    <li><strong>6.5-8.0:</strong> Good competitive rate</li>
                    <li><strong>5.0-6.5:</strong> Below par for T20</li>
                    <li><strong>Under 5.0:</strong> Poor scoring rate</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>7.0+:</strong> Exceptional scoring</li>
                    <li><strong>6.0-7.0:</strong> Excellent rate</li>
                    <li><strong>5.0-6.0:</strong> Good competitive rate</li>
                    <li><strong>4.0-5.0:</strong> Moderate rate</li>
                    <li><strong>Under 4.0:</strong> Slow scoring</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Team Run Rate vs Required Run Rate</h2>
                <p>In a chase, comparing team run rate with required run rate shows match status:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Team RR &gt; Required RR:</strong> Batting team ahead of the chase</li>
                    <li><strong>Team RR = Required RR:</strong> Exactly on track</li>
                    <li><strong>Team RR &lt; Required RR:</strong> Batting team behind, needs acceleration</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Strategic Applications</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">When Batting First</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Monitor run rate to ensure competitive total</li>
                    <li>Compare with par scores for the venue</li>
                    <li>Identify when acceleration is needed</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">When Chasing</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Compare with required run rate constantly</li>
                    <li>Adjust batting approach based on gap</li>
                    <li>Plan acceleration or consolidation phases</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Conclusion</h2>
                <p>Team run rate is the heartbeat of limited-overs cricket innings. It provides instant feedback on scoring pace, helps teams make strategic decisions, and allows fans and analysts to assess batting performance in real-time.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about team run rate
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is team run rate in cricket?</h4>
                            <p className="text-muted-foreground">
                                Team run rate (also called current run rate) is the average runs per over a team is scoring. It&apos;s calculated by dividing total runs scored by overs completed. For example, 150 runs in 20 overs = 7.5 run rate.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do you calculate team run rate?</h4>
                            <p className="text-muted-foreground">
                                Team Run Rate = Runs Scored / Overs Completed. For example, if a team has scored 85 runs in 12 overs, their run rate is 85/12 = 7.08 runs per over.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good team run rate?</h4>
                            <p className="text-muted-foreground">
                                In T20 cricket, 8.0+ is excellent. In ODI cricket, 6.0+ is excellent. However, it depends on pitch conditions, opposition bowling quality, and match situation. Modern T20 teams often achieve run rates above 10.0.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What&apos;s the difference between team run rate and required run rate?</h4>
                            <p className="text-muted-foreground">
                                Team run rate is the current scoring pace, while required run rate is the pace needed to win. If team run rate is higher than required run rate, the batting team is ahead of the chase.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does team run rate include extras?</h4>
                            <p className="text-muted-foreground">
                                Yes. Team run rate includes all runs scored by the team, including runs scored by batsmen and all extras (wides, no-balls, byes, leg-byes).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the highest team run rate ever achieved?</h4>
                            <p className="text-muted-foreground">
                                In T20 internationals, teams have achieved run rates above 15.0 in short bursts. In full T20 innings, run rates of 12.0+ have been achieved. In ODIs, run rates above 10.0 in death overs are common.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does team run rate change during an innings?</h4>
                            <p className="text-muted-foreground">
                                Team run rate fluctuates based on scoring pace. It typically starts moderate, dips during consolidation phases, and increases during powerplays and death overs when batsmen attack.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is team run rate the same as net run rate?</h4>
                            <p className="text-muted-foreground">
                                No. Team run rate is the current scoring pace in one innings. Net run rate is a tournament metric calculated across multiple matches by comparing runs scored per over vs runs conceded per over.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">When is team run rate most important?</h4>
                            <p className="text-muted-foreground">
                                Team run rate is crucial in all limited-overs cricket (T20, ODI). It&apos;s especially important when chasing (compared to required run rate) or when batting first to assess if the scoring pace will lead to a competitive total.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do you increase team run rate?</h4>
                            <p className="text-muted-foreground">
                                Score runs faster than the current rate by finding boundaries, rotating strike, minimizing dot balls, targeting weaker bowlers, and increasing aggression. Powerplay overs and death overs are key phases for acceleration.
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
                                    <strong className="block text-primary mb-1">Captains & Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Monitor live scoring pace to make strategic decisions.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Broadcasters</strong>
                                    <span className="text-sm text-muted-foreground">Display current run rates for viewers.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fans</strong>
                                    <span className="text-sm text-muted-foreground">Calculate run rates while watching matches live.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Players</strong>
                                    <span className="text-sm text-muted-foreground">Predict team totals and match outcomes.</span>
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
                                The Team Run Rate Calculator provides an instant measure of a team's scoring speed.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Essential for limited-overs cricket, it helps track progress towards a target or assess the strength of a first-innings total.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
