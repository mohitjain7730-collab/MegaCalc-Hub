import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Shield } from 'lucide-react';
import BaseballWhipCalculatorInteractive from './baseball-whip-calculator-interactive';

export default function BaseballWhipCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball WHIP Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate Walks Plus Hits per Inning Pitched (WHIP) to measure a pitcher's effectiveness at preventing base runners.
                </p>
            </div>

            <BaseballWhipCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics for calculating WHIP
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Hits (H)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Total number of hits allowed.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes: 1B, 2B, 3B, HR</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                <TrendingUp className="h-4 w-4" />
                                Walks (BB)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Total base on balls allowed.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                    <span>Exclude: Hit By Pitch (HBP)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                    <span>Exclude: Intentional Walks (IBB) are included in BB</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Innings (IP)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Total complete innings pitched.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Format: .1 = 1/3, .2 = 2/3</span>
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
                            WHIP = (Walks + Hits) / Innings Pitched
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        WHIP is one of the purest measures of a pitcher's dominance because it measures how many baserunners they allow per inning, regardless of whether those runners score.
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
                        <Link href="/category/sports-training/baseball-era-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">ERA Calculator</p>
                                            <p className="text-sm text-muted-foreground">Earned Run Average</p>
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
                        <Link href="/category/sports-training/football-clean-sheet-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Clean Sheet %</p>
                                            <p className="text-sm text-muted-foreground">Defense Shutout Rate</p>
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
                <meta itemProp="name" content="The Ultimate Guide to WHIP (Walks Plus Hits per Inning Pitched)" />
                <meta itemProp="description" content="Master WHIP. Understand why this sabermetric is considered the purest measure of a pitcher's dominance and how to improve it." />
                <meta itemProp="keywords" content="baseball WHIP calculator, calculate WHIP, pitching stats, what is a good WHIP, walks plus hits per inning, fantasy baseball stats" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Traffic Control: Mastering WHIP</h2>
                <p className="text-lg italic text-muted-foreground">In the world of pitching, base runners are trouble. WHIP measures purely how many runners a pitcher allows, removing the variables of defense and timing that can cloud ERA.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is WHIP?</a></li>
                    <li><a href="#calculation" className="hover:underline">How WHIP is Calculated</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What is a "Good" WHIP?</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Lower Your WHIP</a></li>
                    <li><a href="#whip-vs-era" className="hover:underline">WHIP vs. ERA</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of WHIP</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is WHIP?</h2>
                <p><strong>WHIP (Walks Plus Hits per Inning Pitched)</strong> is a sabermetric statistic that measures the number of base runners a pitcher allows per inning.</p>
                <p>It answers a simple question: "How hard is it to get on base against this pitcher?"</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How WHIP is Calculated</h2>
                <p>The formula is straightforward:</p>
                <div className="p-4 bg-muted border-l-4 border-primary my-4">
                    <p className="font-bold">WHIP = (Walks + Hits) / Innings Pitched</p>
                </div>
                <p>Note that Hit By Pitches (HBP) and Errors are NOT included in the numerator. This stat focuses strictly on hits and walks.</p>
                <p><strong>Example:</strong> A pitcher allows 3 hits and 1 walk efficiently over 4 innings.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>3 Hits + 1 Walk = 4 Base Runners</li>
                    <li>4 Runners / 4 Innings = 1.00 WHIP (Excellent)</li>
                </ul>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What is a "Good" WHIP?</h2>
                <p>Because there are typically 3 outs in an inning, any number below 1.00 is exceptional.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Major League Baseball (MLB)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Under 1.00:</strong> Elite. Only the best pitchers (e.g., Kershaw, Scherzer) maintain this over a season.</li>
                    <li><strong>1.00 - 1.15:</strong> Great. An All-Star caliber starter.</li>
                    <li><strong>1.15 - 1.30:</strong> Average. Solid, reliable, but will have some traffic on the bases.</li>
                    <li><strong>1.30 - 1.50:</strong> Below Average. Likely to struggle getting deep into games due to high pitch counts.</li>
                    <li><strong>Over 1.50:</strong> Poor. Likely not long for the major leagues.</li>
                </ul>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Lower Your WHIP</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Attack the Zone</h3>
                <p>Walks are the biggest enemy of WHIP. A walk counts the same as a home run in this formula. Adopt an aggressive mindset: make them earn their way on base by swinging the bat.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Review Your BABIP</h3>
                <p>If you feel like you are pitching well but your WHIP is high, check your "Batting Average on Balls In Play." Sometimes, high WHIP is just bad luck (soft ground balls finding holes). Other times, it means you are getting hit too hard.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Develop a "Strikeout Pitch"</h3>
                <p>Pitchers with high strikeout rates often have lower WHIPs because balls aren't put in play, removing the chance for "cheap hits."</p>

                <hr />

                {/* WHIP vs ERA */}
                <h2 id="whip-vs-era" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">WHIP vs. ERA</h2>
                <p>Why track both?</p>
                <p><strong>ERA</strong> tells you what happened (runs scored). <strong>WHIP</strong> tells you <em>how</em> it happened (traffic on base).</p>
                <p>Often, a pitcher might have a lucky low ERA but a high WHIP (lots of runners stranded). This suggests their ERA will likely rise in the future (regression). Conversely, a pitcher with a low WHIP but high ERA has likely been unlucky, and their ERA should improve.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of WHIP</h2>
                <p>WHIP is not perfect:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>All Hits are Equal:</strong> A single counts the same as a triple or home run. WHIP doesn't measure "damage," only traffic.</li>
                    <li><strong>Ignores HBP:</strong> A batter hit by a pitch reaches base just like a walk, but isn't penalized in WHIP.</li>
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
                        Common questions about WHIP
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does Hit By Pitch (HBP) count in WHIP?</h4>
                            <p className="text-muted-foreground">
                                No. Standard WHIP calculation only includes Walks (BB) and Hits (H). Bases gained via HBP or Errors are excluded.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the best single-season WHIP ever?</h4>
                            <p className="text-muted-foreground">
                                Pedro Martinez recorded a 0.737 WHIP in 2000, widely considered one of the greatest pitching seasons of all time.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is WHIP important for Fantasy Baseball?</h4>
                            <p className="text-muted-foreground">
                                WHIP is highly predictable year-over-year compared to wins or even ERA. It is a stable metric that indicates a pitcher's true skill level.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does Intentional Walk (IBB) count?</h4>
                            <p className="text-muted-foreground">
                                Yes. An intentional walk is a walk, and it puts a runner on base. It counts against your WHIP.
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
                                    <strong className="block text-primary mb-1">Fantasy Managers</strong>
                                    <span className="text-sm text-muted-foreground">Identify "sleeper" pitchers who have high ERAs but excellent WHIPs (buy low candidates).</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate which pitchers can be trusted in high-leverage situations.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Players</strong>
                                    <span className="text-sm text-muted-foreground">Focus on the process (limiting runners) rather than just the result (runs scored).</span>
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
                                The Baseball WHIP Calculator analyzes the volume of base runners a pitcher allows.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By stripping away defense and luck, WHIP serves as one of the most honest indicators of a pitcher's ability to dominate the opposition.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
