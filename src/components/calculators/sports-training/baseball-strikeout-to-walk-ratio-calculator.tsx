import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, TrendingUp, Users, Shield, Target } from 'lucide-react';
import BaseballStrikeoutToWalkRatioCalculatorInteractive from './baseball-strikeout-to-walk-ratio-calculator-interactive';

export default function BaseballStrikeoutToWalkRatioCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball/ Softball Strikeout-to-Walk Ratio Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your K/BB ratio to measure pitching command and control dominance.
                </p>
            </div>

            <BaseballStrikeoutToWalkRatioCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics for calculating K/BB
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Strikeouts (K)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of batters retired by a third strike. This measures &quot;stuff&quot; and the ability to miss bats. Includes both swinging and looking strikeouts.
                            </p>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Walks (BB)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of batters allowed to reach base on four balls (Base on Balls). This measures control and discipline.
                            </p>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded border border-primary/10 mt-4">
                        <strong>Intentional Walks (IBB):</strong> Most standard K/BB calculations <em>include</em> Intentional Walks. However, for a &quot;pure&quot; measure of control, some advanced analysts prefer to subtract IBBs from the Walk total. This calculator uses the standard input, so subtract IBB yourself if you prefer the advanced version.
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
                            K/BB Ratio = Strikeouts (K) / Walks (BB)
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        For example, a pitcher with 200 strikeouts and 50 walks has a K/BB ratio of 4.00. This is generally considered &quot;Ace&quot; material.
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
                        Explore other key pitching metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/baseball-era-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">ERA Calculator</p>
                                            <p className="text-sm text-muted-foreground">Premier pitching stat</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-whip-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">WHIP Calculator</p>
                                            <p className="text-sm text-muted-foreground">Hits+Walks per Inning</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Calculate Opponent AVG</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-win-loss-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Win/Loss %</p>
                                            <p className="text-sm text-muted-foreground">Track pitcher record</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-fielding-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Fielding Percentage</p>
                                            <p className="text-sm text-muted-foreground">Defensive reliability</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-slugging-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Slugging %</p>
                                            <p className="text-sm text-muted-foreground">Opponent Power</p>
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
                <meta itemProp="name" content="The Ultimate Measure of Command: Baseball Strikeout-to-Walk Ratio" />
                <meta itemProp="description" content="Master the K/BB ratio. Learn why Strikeout-to-Walk Ratio is the purest indicator of a pitcher's dominance and control." />
                <meta itemProp="keywords" content="baseball k/bb ratio calculator, strikeout to walk ratio formula, pitching stats explained, baseball control metrics, best pitching stats" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Command vs. Stuff: Why K/BB Is The King of Ratio Stats</h2>
                <p className="text-lg italic text-muted-foreground">&quot;ERA lies. Wins are lucky. But Strikeout-to-Walk Ratio tells the truth about a pitcher&apos;s soul.&quot;</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is K/BB Ratio?</a></li>
                    <li><a href="#formula" className="hover:underline">The Formula</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: Good vs. Elite</a></li>
                    <li><a href="#style" className="hover:underline">Pitching Styles: Power vs. Finesse</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of K/BB</a></li>
                    <li><a href="#improvement" className="hover:underline">How to Improve Your Ratio</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is K/BB Ratio?</h2>
                <p><strong>Strikeout-to-Walk Ratio (K/BB)</strong> is a statistic that measures a pitcher's ability to control the strike zone while still overpowering hitters. It answers two fundamental questions simultaneously:</p>
                <ol className="list-decimal ml-6 space-y-2 mt-2">
                    <li>Can you get outs without the defense? (Strikeouts)</li>
                    <li>Can you avoid giving away free bases? (Walks)</li>
                </ol>
                <p>Because it removes the random variables of defense (fielding errors, range) and luck (balls in play finding holes), K/BB is often considered a better predictor of future pitching success than ERA. A pitcher with a high ERA but a great K/BB ratio is often just &quot;unlucky&quot; and will improve. Conversely, a pitcher with a low ERA but a terrible K/BB ratio is a &quot;ticking time bomb.&quot;</p>

                <hr />

                {/* FORMULA */}
                <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Formula</h2>
                <p>The calculation is delightfully simple, yet tells a complex story:</p>
                <div className="p-4 bg-muted rounded my-4 font-mono text-center">
                    K/BB = Total Strikeouts / Total Walks
                </div>
                <p><strong>Note:</strong> Intentional Walks (IBB) are typically included in the denominator for the standard calculation, though some advanced versions exclude them since they are strategic decisions rather than control failures.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: Good vs. Elite</h2>
                <p>In Major League Baseball (MLB), the standards have risen over time as strikeouts have become more common. For youth, high school, and college, the numbers are slightly lower due to smaller strike zones and metal bats.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Starting Pitchers (MLB Standard)</h3>
                <ul className="list-disc ml-6 space-y-4 mt-2">
                    <li><strong>5.00+ (Elite):</strong> <span className="text-green-600 font-semibold">Cy Young Caliber.</span> A pitcher here is likely leading the league. Examples include Jacob deGrom or Max Scherzer at their peak.</li>
                    <li><strong>3.50 - 4.99 (Great/All-Star):</strong> <span className="text-blue-600 font-semibold">Top of Rotation.</span> A very strong number indicating a #1 or #2 starter.</li>
                    <li><strong>2.50 - 3.49 (Solid Average):</strong> <span className="text-yellow-600 font-semibold">Reliable Starter.</span> A mid-rotation starter who keeps the team in the game.</li>
                    <li><strong>Below 2.00 (Poor):</strong> <span className="text-red-600 font-semibold">Problematic.</span> If you walk one batter for every two you strike out, you are putting too much traffic on the bases. This leads to high pitch counts and short outings.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Relief Pitchers</h3>
                <p>Relievers generally have higher K/BB ratios because they can expend maximum effort for one inning. An elite closer might have a ratio of <strong>6.00 to 8.00</strong>.</p>

                <hr />

                {/* STYLE */}
                <h2 id="style" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Pitching Styles: Power vs. Finesse</h2>
                <p>There are two primary ways to achieve a high K/BB ratio, representing two different archetypes of pitchers.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Power Pitcher (High K, Medium BB)</h3>
                <p><strong>Examples:</strong> Randy Johnson, Nolan Ryan.
                    <br />
                    These pitchers strike out so many batters (300+) that they can afford a moderate number of walks. Their ratio is high because the numerator (K) is massive. They rely on &quot;Stuff&quot; to overcome mistakes.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Control Artist (Medium K, Low BB)</h3>
                <p><strong>Examples:</strong> Greg Maddux, Cliff Lee.
                    <br />
                    These pitchers might not strike out 15 guys a game, but they almost never walk anyone. Their ratio is high because the denominator (BB) is tiny. This path is often more sustainable and leads to deeper games (Complete Games) due to lower pitch counts.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of K/BB</h2>
                <p>While powerful, K/BB is not perfect. It should be used in conjunction with other stats.</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Contact Quality:</strong> It ignores <em>how hard</em> the ball is hit when contact is made. A pitcher could have a wonderful 5.0 K/BB ratio but give up 40 home runs because he throws too many strikes.</li>
                    <li><strong>Hit by Pitch:</strong> Hitting a batter (HBP) is arguably worse than a walk, but it is not included in the K/BB formula.</li>
                    <li><strong>Groundball Pitchers:</strong> Some highly effective pitchers pitch to contact, aiming for groundball double plays. They may have low strikeout totals (and thus a lower K/BB ratio) but remain effective at preventing runs.</li>
                </ul>

                <hr />

                {/* IMPROVEMENT */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Improve Your Ratio</h2>
                <p>Coaches usually advise working on the denominator (Walks) first.</p>
                <p>Increasing strikeouts requires increasing velocity or developing a new &quot;out pitch,&quot; which takes years. Decreasing walks can often be improved quickly by changing approach: attacking the zone early (aiming for 0-1 and 1-2 counts), trusting your defense, and not &quot;nibbling&quot; on the corners when ahead in the count.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about K/BB
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a higher or lower ratio better?</h4>
                            <p className="text-muted-foreground">
                                Higher is better. You want the top number (Strikeouts) to be big and the bottom number (Walks) to be small. A ratio of 4.0 is twice as good as a ratio of 2.0.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who holds the MLB record?</h4>
                            <p className="text-muted-foreground">
                                In 2014, Phil Hughes set the single-season record with an astonishing 11.63 K/BB ratio (186 K, 16 BB). For a career, newer pitchers are pushing boundaries, but legends like Curt Schilling (4.38) and Pedro Martinez (4.15) set the standard for modern aces.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does this differ for Hitters?</h4>
                            <p className="text-muted-foreground">
                                For hitters, the concept is usually flipped to <strong>BB/K Ratio</strong>. A hitter wants to walk more than they strike out. A BB/K ratio of 1.00 or higher for a batter is considered exceptional plate discipline (e.g., Barry Bonds, Ted Williams, Juan Soto).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do Hit-By-Pitches count as walks here?</h4>
                            <p className="text-muted-foreground">
                                No. The standard K/BB formula strictly uses Base on Balls (BB). However, advanced metrics like <em>K-BB%</em> (Strikeout Percentage minus Walk Percentage) exist for even more granular analysis.
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
                                    <strong className="block text-primary mb-1">Pitchers (All Levels)</strong>
                                    <span className="text-sm text-muted-foreground">Self-evaluate your command. If your ratio is under 2.0, focus your next bullpen session on fastball location and reducing walks.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Scouts & Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Use K/BB to identify prospects who are "pitchability" experts vs those who are just "throwers" with wild arms.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Baseball Owners</strong>
                                    <span className="text-sm text-muted-foreground">K/BB is a leading indicator for WHIP. Target pitchers with climbing K/BB ratios for breakout seasons before their ERA catches up.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Determine rotation spots. Trust pitchers with higher K/BB ratios in high-leverage situations as they are less likely to walk in a run.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Scenario A (The Wild Thing):</strong>
                                        <br />
                                        100 Strikeouts / 80 Walks = <strong>1.25 Ratio</strong>
                                        <br />
                                        <span className="text-xs text-muted-foreground mt-1 block">This pitcher is in trouble. Despite 100 Ks, the 80 walks mean he is constantly in danger. High WHIP, stressful innings, likely a short career unless control improves.</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Scenario B (The Surgeon):</strong>
                                        <br />
                                        100 Strikeouts / 20 Walks = <strong>5.00 Ratio</strong>
                                        <br />
                                        <span className="text-xs text-muted-foreground mt-1 block">This pitcher is elite. He gets the same number of strikeouts but keeps base runners off the paths, leading to significantly fewer runs allowed and longer outings.</span>
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
                            <h2 className="font-semibold text-lg mb-2">Final Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Baseball Strikeout-to-Walk Ratio Calculator is an essential diagnostic tool for pitchers.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By highlighting the relationship between domination (K) and discipline (BB), it provides a clear roadmap for development. Whether you need to chase more strikeouts or simply stop beating yourself with walks, this ratio points the way. It is the single best metric for evaluating pure pitching skill independent of team defense.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
