import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Shield } from 'lucide-react';
import BaseballEraCalculatorInteractive from './baseball-era-calculator-interactive';

export default function BaseballEraCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball ERA Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate Earned Run Average (ERA) instantly. Supports 9-inning (MLB), 7-inning (Softball/HS), and 6-inning (Little League) games.
                </p>
            </div>

            <BaseballEraCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics for calculating ERA
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <TrendingUp className="h-4 w-4" />
                                Earned Runs (ER)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Runs scored against a pitcher without the benefit of errors or passed balls.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Count: Base hits, Walks, HRs</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Exclude: Fielding Errors (<span className="italic">Unearned Runs</span>)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Innings Pitched (IP)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of innings a pitcher remains in the game.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Format: 6.1 means 6 innings & 1 out</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Format: 6.2 means 6 innings & 2 outs</span>
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
                            ERA = (Earned Runs / Innings Pitched) × Innings Per Game
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        The standard multiplier is 9 for MLB/College. For High School/Softball it is 7, and for Little League it is 6. This normalizes the stat to show how many runs a pitcher gives up over a full game.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Baseball Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other key sabermetrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/baseball-whip-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">WHIP Calculator</p>
                                            <p className="text-sm text-muted-foreground">Walks + Hits / Inning</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/baseball-batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Hits / At Bats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/baseball-ops-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">OPS Calculator</p>
                                            <p className="text-sm text-muted-foreground">On-Base + Slugging</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/baseball-on-base-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">On-Base Percentage</p>
                                            <p className="text-sm text-muted-foreground">OBP Calculator</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-save-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Save Percentage</p>
                                            <p className="text-sm text-muted-foreground">Goalkeeper Efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/baseball-slugging-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Slugging Percentage</p>
                                            <p className="text-sm text-muted-foreground">Power Hitting Stat</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Earned Run Average (ERA)" />
                <meta itemProp="description" content="Master ERA (Earned Run Average). Learn what it is, how to calculate it, pitching benchmarks for MLB/College/High School, and strategies to lower your ERA." />
                <meta itemProp="keywords" content="baseball ERA calculator, calculate earned run average, pitching stats, what is a good ERA, reduce ERA pitching tips, softball ERA formula" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Gold Standard of Pitching: Understanding ERA</h2>
                <p className="text-lg italic text-muted-foreground">For over a century, Earned Run Average (ERA) has been the primary measuring stick for pitchers. It answers the most fundamental question: &quot;How many runs does this pitcher give up?&quot;</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is ERA?</a></li>
                    <li><a href="#calculation" className="hover:underline">How ERA is Calculated</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What is a &quot;Good&quot; ERA?</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Lower Your ERA</a></li>
                    <li><a href="#earned-vs-unearned" className="hover:underline">Earned vs. Unearned Runs</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of ERA</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is ERA?</h2>
                <p><strong>Earned Run Average (ERA)</strong> is the mean of earned runs given up by a pitcher per nine innings pitched (or the regulation length of a game in that league).</p>
                <p>It acts as an efficiency rating. The lower the number, the better the pitcher is at preventing opponents from scoring.</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How ERA is Calculated</h2>
                <p>The universal formula is:</p>
                <div className="p-4 bg-muted border-l-4 border-primary my-4">
                    <p className="font-bold">ERA = (Earned Runs / Innings Pitched) × Innings Per Game</p>
                </div>
                <p>While MLB uses 9 as the multiplier, Softball and High School Baseball often use 7. Little League uses 6. This ensures the stat is normalized to "runs per full game."</p>
                <p><strong>Example:</strong> A pitcher allows 2 runs in 6 innings of an MLB game.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>2 divided by 6 = 0.333</li>
                    <li>0.333 times 9 = 3.00 ERA</li>
                </ul>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What is a &quot;Good&quot; ERA?</h2>
                <p>Context is king (era, ballpark, league), but generally:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Major League Baseball (MLB)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Under 2.00:</strong> Historic. A serious Cy Young contender.</li>
                    <li><strong>2.00 - 3.00:</strong> Elite. An &quot;Ace&quot; or #1 starter.</li>
                    <li><strong>3.00 - 3.75:</strong> Very Good. A reliable #2 or #3 starter.</li>
                    <li><strong>3.75 - 4.25:</strong> League Average. Keeps the team in the game.</li>
                    <li><strong>Over 4.50:</strong> Below Average. At risk of losing a rotation spot.</li>
                    <li><strong>Over 5.00:</strong> Poor. Likely demoted to the bullpen or minors.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">College & High School</h3>
                <p>ERAs tend to be slightly lower in high school due to weaker hitting, but the variance is higher. An ERA under 2.00 is expected for a college recruit.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Lower Your ERA</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. First-Pitch Strikes</h3>
                <p>The most important pitch in baseball is strike one. Hitters bat significantly worse when falling behind 0-1. Getting ahead allows you to expand the zone and force weak contact.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Limit Walks (BB)</h3>
                <p>Walks are &quot;free passes.&quot; Unlike hits, the defense cannot help you. Walks often turn into runs. A high walk rate almost always correlates with a high ERA.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Manage Movement, Not Just Velocity</h3>
                <p>At higher levels, velocity helps, but movement kills. A 90mph fastball that is straight is easier to hit than an 85mph fastball with late sink or run.</p>

                <hr />

                {/* EARNED VS UNEARNED */}
                <h2 id="earned-vs-unearned" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Earned vs. Unearned Runs</h2>
                <p>This is the most common confusion point.</p>
                <p><strong>Earned Run:</strong> A run for which the pitcher is held accountable. (Hits, walks, home runs).</p>
                <p><strong>Unearned Run:</strong> A run that scored ONLY because of a fielding error or passed ball. If an inning &quot;should have been over&quot; (e.g., 2 outs and a ground ball is booted), subsequent runs are typically unearned. These do NOT count against your ERA.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of ERA</h2>
                <p>While ERA is the &quot;headline&quot; stat, it has flaws:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Defense Dependent:</strong> A pitcher with a gold-glove shortstop will have a lower ERA than the same pitcher with a poor defense efficiently fielding ground balls.</li>
                    <li><strong>Timing Luck:</strong> Giving up 3 hits in a row scores runs. Giving up 3 hits spread over 9 innings scores zero. Sequencing luck plays a huge role.</li>
                    <li><strong>Reliever Bias:</strong> If a reliever enters with bases loaded and gives up a grand slam, those runs are charged to the *previous* pitcher who put the runners on base. This can unfairly inflate a starter's ERA.</li>
                </ul>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about ERA
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does an error count against ERA?</h4>
                            <p className="text-muted-foreground">
                                No. If a run scores due to a fielding error, it is classified as an "Unearned Run" and does not increase your Earned Run Average.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the lowest ERA in history?</h4>
                            <p className="text-muted-foreground">
                                In the modern era (post-1920 live-ball), Bob Gibson's 1.12 ERA in 1968 is the standard. It was so dominant that MLB lowered the pitcher's mound the following year.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is my ERA not a whole number?</h4>
                            <p className="text-muted-foreground">
                                Because runs are integers but innings are divisions of 9 (or 7), ERA almost always results in a decimal. It is standard to carry it to two decimal places (e.g., 3.14).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is WHIP better than ERA?</h4>
                            <p className="text-muted-foreground">
                                WHIP (Walks + Hits per Inning Pitched) is often a better predictor of future performance because it removes the "sequencing luck" of when hits occur. However, preventing runs (ERA) is still the ultimate goal.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a Passed Ball count as an Earned Run?</h4>
                            <p className="text-muted-foreground">
                                No. A passed ball is considered a defensive mistake by the catcher. Runs scoring solely due to a passed ball are unearned. Wild Pitches (fault of the pitcher), however, DO lead to earned runs.
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
                                    <strong className="block text-primary mb-1">Pitchers</strong>
                                    <span className="text-sm text-muted-foreground">Track your season progress. Know exactly where you stand in rotation battles.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Parents & Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Accurately calculate stats for team websites or college recruiting profiles.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Baseball Players</strong>
                                    <span className="text-sm text-muted-foreground">Project future ERA based on underlying metrics and recent performance.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Quickly normalize stats from different leagues (7-inning vs 9-inning) to compare prospects.</span>
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
                                The Baseball ERA Calculator is the essential tool for evaluating run prevention.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By accurately accounting for game length and distinguishing earned runs from unearned ones, it provides a clear picture of a pitcher's dominance on the mound.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
