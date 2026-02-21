import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Shield } from 'lucide-react';
import BaseballBattingAverageCalculatorInteractive from './baseball-batting-average-calculator-interactive';

export default function BaseballBattingAverageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball Batting Average Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your batting average (AVG) instantly and understand what it says about your hitting performance at any level.
                </p>
            </div>

            <BaseballBattingAverageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics for calculating Batting Average
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Hits (H)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of times a batter reaches base safely on a fair ball without an error or fielder&apos;s choice.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Count: Singles, Doubles, Triples, Home Runs</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Exclude: Walks, Errors, Fielder&apos;s Choice</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                At Bats (AB)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The batter&apos;s turn against a pitcher, excluding specific non-attempt outcomes.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Includes: Hits, Strikeouts, reach on Error, Fielder&apos;s Choice</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Exclude: Walks (BB), Hit By Pitch (HBP), Sacrifice Hits/Flies</span>
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
                            Batting Average (AVG) = Hits (H) / At Bats (AB)
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        A batting average is traditionally carried out to three decimal places. For example, if a player has 3 hits in 10 at-bats, their average is .300.
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
                        <Link href="/sports-training/baseball-on-base-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">On-Base Percentage</p>
                                            <p className="text-sm text-muted-foreground">Includes walks & HBP</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-slugging-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Slugging Percentage</p>
                                            <p className="text-sm text-muted-foreground">Total Bases / At Bats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-ops-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">OPS Calculator</p>
                                            <p className="text-sm text-muted-foreground">OBP + Slugging</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-era-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">ERA Calculator</p>
                                            <p className="text-sm text-muted-foreground">Run Prevention Stat</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-whip-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">WHIP Calculator</p>
                                            <p className="text-sm text-muted-foreground">Walks + Hits / IP</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-goals-per-90-minutes-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Goals Per 90</p>
                                            <p className="text-sm text-muted-foreground">Scoring Rate</p>
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
                <meta itemProp="name" content="The Art of Hitting: The Ultimate Guide to Baseball Batting Average" />
                <meta itemProp="description" content="Comprehensive guide on Baseball Batting Average (AVG). Learn how to calculate it, what defines an elite hitter, benchmarks by level, and strategies to improve your average." />
                <meta itemProp="keywords" content="baseball batting average calculator, how to calculate batting average, baseball stats, hitting stats, improve batting average, mlb batting benchmarks, softball batting stats" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Art of Hitting: Mastering Batting Average</h2>
                <p className="text-lg italic text-muted-foreground">For over a century, Batting Average has been the premier statistic for evaluating a hitter&apos;s success. But what does it really tell us?</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Batting Average?</a></li>
                    <li><a href="#history" className="hover:underline">History & Significance</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What is a &quot;Good&quot; Average?</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Improve Your Average</a></li>
                    <li><a href="#limitations" className="hover:underline">The Limitations of AVG</a></li>
                    <li><a href="#modern-context" className="hover:underline">AVG in the Modern Era</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Batting Average?</h2>
                <p><strong>Batting Average (AVG)</strong> is a statistic that measures the frequency with which a batter reaches base by a hit. It is calculated by dividing the number of hits by the number of official at-bats.</p>
                <p>Importantly, not every plate appearance counts as an &quot;at-bat.&quot; Walks, hit-by-pitches, and sacrifices do not lower a player&apos;s average because they are not considered at-bats.</p>

                <hr />

                {/* HISTORY */}
                <h2 id="history" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">History & Significance</h2>
                <p>Batting average was adopted in the late 19th century as the standard for hitting excellence. It provides a quick snapshot of a player&apos;s ability to make contact and place the ball where fielders aren&apos;t. While modern analytics (sabermetrics) value getting on base (OBP) and power (SLG) more highly, winning a batting title remains one of the most prestigious honors in the sport.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What is a &quot;Good&quot; Average?</h2>
                <p>Standards vary by league and era, but generally:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Major League Baseball (MLB)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>.300+ (&quot;The 300 Hitter&quot;):</strong> Elite. An All-Star level benchmark. Only the best hitters maintain this over a career.</li>
                    <li><strong>.270 - .290:</strong> Solid Regular. Most everyday starters fall in this range.</li>
                    <li><strong>.240 - .260:</strong> Average. Acceptable if the player provides power or defense.</li>
                    <li><strong>Below .220:</strong> The Danger Zone. Often referred to as "The Mendoza Line" (approx .200). Players here risk demotion unless they hit many home runs.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Youth & High School</h3>
                <p>Averages are typically higher due to wider variance in fielding talent.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>.400 - .500+:</strong> Elite prospect level.</li>
                    <li><strong>.300 - .400:</strong> Strong contributor.</li>
                </ul>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Your Average</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Shorten Your Swing</h3>
                <p>A compact swing path allows you to wait longer on pitches, improving recognition. "Short to the ball, long through it" is the classic mantra for high-average hitters.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Use the Whole Field</h3>
                <p>Hitters who only pull the ball are easy to defend against (defensive shifts). Learning to hit the ball where it's pitched—taking an outside pitch to the opposite field—makes you undefendable.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Two-Strike Approach</h3>
                <p>With two strikes, elite hitters choke up on the bat, widen their stance, and focus solely on contact. Protecting the plate prevents strikeouts and forces the defense to make a play.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Limitations of AVG</h2>
                <p>While iconic, Batting Average has flaws:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Ignores Walks:</strong> A player who walks every time has a .000 AVG but a 1.000 OBP. AVG undervalues patience.</li>
                    <li><strong>Singles = Home Runs:</strong> In AVG, a bunt single is equal to a 450-foot home run. It doesn't measure impact/damage.</li>
                    <li><strong>Luck Factor:</strong> BABIP (Batting Average on Balls In Play) analytics show that luck plays a significant role in short-term fluctuations of AVG.</li>
                </ul>

                <hr />

                {/* MODERN CONTEXT */}
                <h2 id="modern-context" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">AVG in the Modern Era</h2>
                <p>In today's "Three True Outcomes" era (Strikeouts, Walks, Home Runs), league-wide batting averages have dropped. Strategies now prioritize launch angle and exit velocity over simply "putting the ball in play." However, in high-pressure playoff situations, the ability to put the bat on the ball (high AVG skills) remains invaluable.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Baseball Batting Average
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a Sacrifice Fly count towards Batting Average?</h4>
                            <p className="text-muted-foreground">
                                No. A Sacrifice Fly (SF) does not count as an At-Bat, so it does not lower your average. However, it does lower your On-Base Percentage (OBP).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the "Mendoza Line"?</h4>
                            <p className="text-muted-foreground">
                                Named after shortstop Mario Mendoza, it refers to a batting average around .200. It's considered the minimum threshold of offensive competence for a position player to stay in the major leagues.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is .300 still the benchmark for greatness?</h4>
                            <p className="text-muted-foreground">
                                Yes and no. .300 is still revered, but fewer players reach it today due to higher pitch velocities and defensive shifts. A .280 average with 30 home runs is often more valuable than a .300 average with 0 home runs.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does reaching base on an Error count as a hit?</h4>
                            <p className="text-muted-foreground">
                                No. If you reach base because a fielder made a mistake (Error), it counts as an At-Bat but 0 hits. This lowers your batting average.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the highest Batting Average ever?</h4>
                            <p className="text-muted-foreground">
                                In the modern era (post-1900), Nap Lajoie hit .426 in 1901. The last player to hit .400 was Ted Williams (.406) in 1941. It is considered one of the unbreakable records in sports.
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
                                    <strong className="block text-primary mb-1">Players (All Levels)</strong>
                                    <span className="text-sm text-muted-foreground">Track your season progress and set tangible goals (e.g., getting 3 hits in the next 10 ABs to reach .300).</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches & Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Quickly evaluate consistency and contact skills of prospects or opposing lineups.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Baseball Managers</strong>
                                    <span className="text-sm text-muted-foreground">Analyze player trends to identify "buy low" or "sell high" candidates based on AVG fluctuations.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Historians & Fans</strong>
                                    <span className="text-sm text-muted-foreground">Compare historical seasons and understand just how difficult hitting .400 really is.</span>
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
                                The Baseball Batting Average Calculator is an essential tool for understanding the most recognizable statistic in sports.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                While modern analytics have introduced deeper metrics, Batting Average remains the fundamental measure of a hitter's ability to consistently put the bat on the ball and find open grass.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
