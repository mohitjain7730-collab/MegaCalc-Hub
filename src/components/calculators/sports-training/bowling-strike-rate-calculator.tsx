import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, CheckCircle2, TrendingDown, AlertCircle, FunctionSquare, Calculator, Shield, Activity, Target, Users, Zap, Briefcase, Landmark, Trophy, Sword, Timer, TrendingUp } from 'lucide-react';
import BowlingStrikeRateCalculatorInteractive from './bowling-strike-rate-calculator-interactive';

export default function BowlingStrikeRateCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Cricket Bowling Strike Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Identify your wicket-taking potency. Calculate how many deliveries it takes you to dismiss a batsman in any format.
                </p>
            </div>

            <BowlingStrikeRateCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Two simple metric define a bowler's lethality
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Balls Bowled
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Total legal deliveries sent down.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Count actual balls, not overs (e.g. 10 overs = 60 balls).</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <Sword className="h-4 w-4" />
                                Wickets Taken
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Number of batsmen dismissed by the bowler.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>Only count wickets credited to the bowler (Bowled, LBW, Caught, Stumped, Hit Wicket).</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span><strong>Run Outs do NOT count.</strong></span>
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
                            Bowling Strike Rate = Total Balls Bowled / Total Wickets Taken
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        The result represents the <strong>average number of balls bowled to take one wicket</strong>. A <em>lower</em> number is better.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Bowling Tools
                    </CardTitle>
                    <CardDescription>
                        Calculators to measure bowling effectiveness
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Runs per wicket</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/bowling-economy-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingDown className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Economy Rate</p>
                                            <p className="text-sm text-muted-foreground">Run containment</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/over-economy-tracker" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Timer className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Over Tracker</p>
                                            <p className="text-sm text-muted-foreground">Live economy check</p>
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
                <meta itemProp="name" content="The Complete Guide to Bowling Strike Rate: Wicket-Taking Efficiency Explained" />
                <meta itemProp="description" content="Master the art of wicket-taking analysis. Learn why Bowling Strike Rate is the defining metric for fast bowlers and how it compares to Average and Economy." />
                <meta itemProp="keywords" content="cricket bowling strike rate calculator, wicket taking frequency, dale steyn strike rate, rashid khan stats, bowling metrics explained" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-14" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Bowling Strike Rate: The Assassin's Metric</h2>
                <p className="text-lg italic text-muted-foreground">Economy rate is for containment. Average is for cost. But Strike Rate? Strike Rate is purely about destruction. It asks one question: "How long until you get me a wicket?"</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Bowling Strike Rate?</a></li>
                    <li><a href="#comparison" className="hover:underline">Strike Rate vs Average vs Economy</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks for Greatness</a></li>
                    <li><a href="#t20-era" className="hover:underline">The T20 Shift</a></li>
                    <li><a href="#legends" className="hover:underline">Legendary Numbers</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Bowling Strike Rate?</h2>
                <p><strong>Bowling Strike Rate</strong> is the average number of deliveries a bowler bowls to take a single wicket.</p>
                <p>Unlike batting strike rate (where higher is better), in bowling, <strong>lower is better</strong>. A strike rate of 24 means you take a wicket every 4 overs. A strike rate of 60 means you take a wicket every 10 overs.</p>

                <hr />

                {/* COMPARISON */}
                <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strike Rate vs Average vs Economy</h2>
                <p>These three metrics form the "Holy Trinity" of bowling stats:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                    <div className="p-4 border rounded bg-muted/20">
                        <strong className="block text-primary">Economy Rate</strong>
                        <span className="text-sm">Cost Control ("Runs per Over")</span>
                    </div>
                    <div className="p-4 border rounded bg-muted/20">
                        <strong className="block text-primary">Average</strong>
                        <span className="text-sm">Cost Efficiency ("Runs per Wicket")</span>
                    </div>
                    <div className="p-4 border rounded bg-blue-100 dark:bg-blue-900/30 border-blue-200">
                        <strong className="block text-blue-800 dark:text-blue-300">Strike Rate</strong>
                        <span className="text-sm text-blue-700 dark:text-blue-400">Time Efficiency ("Balls per Wicket")</span>
                    </div>
                </div>
                <p>A bowler can have a bad economy (expensive) but an amazing strike rate (takes frequent wickets). This is often called a "Strike Bowler" (e.g., Kagiso Rabada or Brett Lee).</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks for Greatness</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Test Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Legendary:</strong> &lt; 45 (Dale Steyn, Waqar Younis)</li>
                    <li><strong>Excellent:</strong> 45 - 55 (James Anderson, Glenn McGrath)</li>
                    <li><strong>Good:</strong> 55 - 65</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Legendary:</strong> &lt; 30 (Mitchell Starc, Rashid Khan)</li>
                    <li><strong>Excellent:</strong> 30 - 35</li>
                    <li><strong>Good:</strong> 35 - 40</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Legendary:</strong> &lt; 15 (Takes a wicket every 2.3 overs!)</li>
                    <li><strong>Excellent:</strong> 15 - 18</li>
                    <li><strong>Good:</strong> 18 - 24</li>
                </ul>

                <hr />

                {/* LEGENDS */}
                <h2 id="legends" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Legendary Numbers</h2>

                <div className="space-y-4 mt-4">
                    <div className="p-4 border-l-4 border-purple-500 bg-muted/30">
                        <h4 className="font-bold">Dale Steyn (South Africa)</h4>
                        <p className="text-sm">Widely regarded as the greatest strike bowler of the modern Test era. His career strike rate of ~42 is obscene for a fast bowler with 400+ wickets.</p>
                    </div>
                    <div className="p-4 border-l-4 border-red-500 bg-muted/30">
                        <h4 className="font-bold">George Lohmann (England, 1800s)</h4>
                        <p className="text-sm">Hold the record for the best Test strike rate ever (minimum 100 wickets) at an incredible 34.1.</p>
                    </div>
                    <div className="p-4 border-l-4 border-green-500 bg-muted/30">
                        <h4 className="font-bold">Rashid Khan (Afghanistan)</h4>
                        <p className="text-sm">In T20s, he strikes nearly every 12-14 balls, making him the most valuable asset in franchise cricket.</p>
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
                        Common queries about Wicket Frequency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a lower or higher strike rate better?</h4>
                            <p className="text-muted-foreground">
                                <strong>Lower is better</strong> for bowlers. A strike rate of 30 is better than 50, because it means you take a wicket in fewer balls. (Conversely, for batsmen, higher is better).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why do spinners generally have higher strike rates in Tests?</h4>
                            <p className="text-muted-foreground">
                                Spinners often bowl long spells to hold up an end or wear down a batman. They might bowl 10 overs for 1 wicket (SR 60), whereas a fast bowler might bowl a 4-over burst and take a wicket (SR 24).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a run out count towards my strike rate?</h4>
                            <p className="text-muted-foreground">
                                No. Run outs are field dismissals, not bowler dismissals. They do not get credited to your wicket tally, so they do not improve your strike rate.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does this differ from Bowling Average?</h4>
                            <p className="text-muted-foreground">
                                Average cares about Runs. Strike Rate cares about Balls. If you bowl 6 balls, concede 0 runs, and take 1 wicket: Average = 0, SR = 6. If you bowl 6 balls, concede 20 runs, take 1 wicket: Average = 20, SR = 6. In both cases, your strike rate is identical!
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
                        Practical applications for analysis
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
                                <strong className="block text-primary mb-1">Fast Bowlers</strong>
                                <span className="text-sm text-muted-foreground">Your primary job is to take wickets. This is your most important metric.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Selectors</strong>
                                <span className="text-sm text-muted-foreground">To choose "partnership breakers" over defensive "holding" bowlers.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Historians</strong>
                                <span className="text-sm text-muted-foreground">Comparing players from different eras (e.g. McGrath vs Anderson) objectively.</span>
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
                                The Cricket Bowling Strike Rate Calculator is the ultimate measure of a bowler's wicket-taking threat.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It strips away the runs conceded and focuses purely on the frequency of dismissals.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Use this to identify true match-winners who can turn a game in the space of a few overs.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
