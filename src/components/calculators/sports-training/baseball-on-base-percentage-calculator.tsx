import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Shield } from 'lucide-react';
import BaseballOnBasePercentageCalculatorInteractive from './baseball-on-base-percentage-calculator-interactive';

export default function BaseballOnBasePercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball OBP Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate On-Base Percentage (OBP) to reveal a player's true ability to avoid making an out.
                </p>
            </div>

            <BaseballOnBasePercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        All components required to calculate OBP
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Reaching Base
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Metrics that count positively towards OBP.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Hits (H):</strong> Singles, Doubles, Triples, Homers.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Walks (BB):</strong> Base on Balls (includes Intentional).</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>HBP:</strong> Hit By Pitch.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Plate Opportunities
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Metrics that define the denominator (total chances).
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>At Bats (AB):</strong> Standard official at-bats.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>Sacrifice Flies (SF):</strong> Outs that score a run (lower OBP).</span>
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
                            OBP = (H + BB + HBP) / (AB + BB + HBP + SF)
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Unlike Batting Average, OBP treats Walks and Hits equally in the numerator. It also includes Sacrifice Flies in the denominator, meaning hitting a Sac Fly actually lowers your OBP slightly (though it helps the team). Reaching on Error does NOT count.
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
                        <Link href="/category/sports-training/baseball-batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Traditional hitting stat</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        {/* Placeholder links for potentially future baseball calculators */}
                        <div className="block opacity-50 cursor-not-allowed">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">OPS Calculator</p>
                                            <p className="text-sm text-muted-foreground">Coming Soon</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="block opacity-50 cursor-not-allowed">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">wOBA Calculator</p>
                                            <p className="text-sm text-muted-foreground">Coming Soon</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Complete Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="Get On Base: The Complete Guide to Baseball On-Base Percentage (OBP)" />
                <meta itemProp="description" content="Detailed guide on Baseball On-Base Percentage (OBP). Understand why Moneyball revolutionized this stat, how it differs from Batting Average, and why it's the best predictor of runs scored." />
                <meta itemProp="keywords" content="baseball obp calculator, on-base percentage formula, moneyball stats, baseball analytics, batting stats explained, improve obp, baseball walk rate" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Get On Base: Why OBP is King</h2>
                <p className="text-lg italic text-muted-foreground">"He gets on base." In the modern era of baseball analytics, On-Base Percentage has largely surpassed Batting Average as the vital sign of a hitter's effectiveness.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is On-Base Percentage?</a></li>
                    <li><a href="#moneyball" className="hover:underline">The "Moneyball" Revolution</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks for Success</a></li>
                    <li><a href="#obp-vs-avg" className="hover:underline">OBP vs. Batting Average</a></li>
                    <li><a href="#improving" className="hover:underline">How to Improve Your OBP</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of OBP</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is On-Base Percentage?</h2>
                <p><strong>On-Base Percentage (OBP)</strong> measures the proportion of plate appearances in which a batter reaches base safely essentially by any means other than a fielding error or fielder's choice. It answers the simple question: <em>How often does this player avoid making an out?</em></p>

                <hr />

                {/* MONEYBALL */}
                <h2 id="moneyball" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Moneyball" Revolution</h2>
                <p>In the early 2000s, the Oakland Athletics and Billy Beane popularized the idea (derived from Bill James' sabermetrics) that OBP was significantly undervalued by the market compared to Batting Average.</p>
                <p>The logic is irrefutable: <strong>You cannot score a run unless you get on base.</strong> A walk is as good as a single for the purposes of not making an out and extending the inning.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks for Success</h2>
                <p>Because OBP includes walks, the numbers are higher than batting averages:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Major League Baseball (MLB)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>.400+:</strong> Elite. MVP Candidates. (e.g., Barry Bonds, Juan Soto, Aaron Judge).</li>
                    <li><strong>.370 - .390:</strong> All-Star. Excellent leadoff hitters or power hitters who draw walks.</li>
                    <li><strong>.340 - .360:</strong> Regular Starter. Solid contribution to the offense.</li>
                    <li><strong>.310 - .320:</strong> League Average.</li>
                    <li><strong>Below .300:</strong> Poor. Players with an OBP below .300 are actively hurting the team's ability to score runs, regardless of their batting average.</li>
                </ul>

                <hr />

                {/* OBP VS AVG */}
                <h2 id="obp-vs-avg" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">OBP vs. Batting Average</h2>
                <p>Consider two players:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Player A:</strong> Hits .300 but never walks. OBP is .300.</li>
                    <li><strong>Player B:</strong> Hits .250 but walks frequently. OBP is .360.</li>
                </ul>
                <p><strong>Player B is vastly more valuable offenseively.</strong> They make fewer outs (64% vs 70%) and give teammates behind them more chances to drive in runs. Historically, OBP correlates almost twice as strongly with Run Scoring as Batting Average does.</p>

                <hr />

                {/* IMPROVING */}
                <h2 id="improving" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Improve Your OBP</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Plate Discipline</h3>
                <p>The easiest way to raise OBP is to stop swinging at "pitcher's pitches." Learn to recognize spin and lay off curveballs in the dirt. Force the pitcher to come into the strike zone.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Work the Count</h3>
                <p>Hitters perform better in "hitter's counts" (2-0, 3-1). By taking pitches early in the at-bat, you increase the likelihood of seeing a fastball down the middle later.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Two-Strike Battling</h3>
                <p>Spoiling tough pitches (fouling them off) keeps the at-bat alive. The longer an at-bat goes, the higher the probability of a mistake pitch or a walk.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of OBP</h2>
                <p>While superior to AVG, OBP isn't perfect:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Speed Context:</strong> A walk for a fast runner is more valuable than a walk for a slow runner, but OBP treats them the same.</li>
                    <li><strong>Aggressiveness:</strong> Bases empty with 2 outs, a walk is great. But bases loaded down by 1 run, a walk forces in a run while a double scores 2-3. OBP doesn't account for "clutch" power hitting (which Slugging/OPS covers).</li>
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
                        Common questions about On-Base Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why does a Sacrifice Fly lower my OBP?</h4>
                            <p className="text-muted-foreground">
                                It's a quirk of the rulebook. A Sacrifice Fly counts as a plate appearance where you did not reach base safely (you made an out). Even though it was a "productive out" (RBI), statistically for OBP, it is a failure to reach base.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is OBP always higher than Batting Average?</h4>
                            <p className="text-muted-foreground">
                                Technically, no, but practically, yes. It is mathematically possible for them to be equal if a player never walks, is never hit by a pitch, and never hits a sacrifice fly. But in reality, OBP is almost always 40-100 points higher than AVG.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does reaching on an Error count for OBP?</h4>
                            <p className="text-muted-foreground">
                                No. Reaching on an error counts as an out for the hitter in OBP calculations. The logic is that the hitter did not "earn" the base; the defense gave it to them.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is "OPS"?</h4>
                            <p className="text-muted-foreground">
                                OPS stands for On-Base Plus Slugging. It is simply OBP + Slugging Percentage. It is widely considered the best simple metric for overall offensive production because it combines the ability to get on base (OBP) with power (SLG).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the highest career OBP?</h4>
                            <p className="text-muted-foreground">
                                Ted Williams holds the all-time MLB record with a career OBP of .482. Barry Bonds is second at .444 (though he has the single-season record of .609 in 2004).
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
                                    <strong className="block text-primary mb-1">Leadoff Hitters</strong>
                                    <span className="text-sm text-muted-foreground">Your primary job is to get on base. Track this stat religiously to justify your spot at the top of the lineup.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Sabermetrics Enthusiasts</strong>
                                    <span className="text-sm text-muted-foreground">Analyze game logs to calculate "true" value beyond traditional box score stats.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Build lineups by stacking high-OBP players together to maximize run-scoring potential.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Identify undervalued players who may have low averages but elite eye/Walk skills.</span>
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
                                The Baseball On-Base Percentage Calculator focuses on the most fundamental skill in offense: not making an out.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By valuing walks and hit-by-pitches correctly, OBP provides a superior measure of a player's contribution to their team's run-scoring engine than batting average alone.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
