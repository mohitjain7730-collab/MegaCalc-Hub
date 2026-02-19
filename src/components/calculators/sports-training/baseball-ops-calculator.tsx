import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Shield } from 'lucide-react';
import BaseballOpsCalculatorInteractive from './baseball-ops-calculator-interactive';

export default function BaseballOpsCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball OPS Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate On-Base Plus Slugging (OPS) to measure total offensive production.
                </p>
            </div>

            <BaseballOpsCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics for calculating OPS
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                On-Base Components
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Metrics that contribute to OBP (On-Base Percentage).
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Hits (H): Reaching base via hit.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Walks (BB): Reaching via base on balls.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Hit By Pitch (HBP): Reaching via HBP.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <Target className="h-4 w-4" />
                                Slugging Components
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Metrics that contribute to SLG (Slugging Percentage).
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>Total Bases: Sum of base values of all hits.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>Extra Base Hits: 2B, 3B, HR significantly boost this.</span>
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
                            OPS = OBP + SLG
                        </p>
                        <p className="font-mono text-xs text-center text-muted-foreground mt-2">
                            OBP = (H + BB + HBP) / (AB + BB + HBP + SF)
                        </p>
                        <p className="font-mono text-xs text-center text-muted-foreground mt-1">
                            SLG = (1B + 2×2B + 3×3B + 4×HR) / AB
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        OPS is simply the sum of a player's On-base Percentage and Slugging Percentage. It solves the issue of Batting Average ignoring walks and Slugging Percentage ignoring walks (and OBP ignoring power).
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
                                        <Trophy className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Hits / At Bats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/baseball-slugging-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Slugging Percentage</p>
                                            <p className="text-sm text-muted-foreground">Total Bases / At Bats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/baseball-on-base-percentage-calculator" className="block">
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
                        <Link href="/category/sports-training/basketball-player-efficiency-rating-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">PER Calculator</p>
                                            <p className="text-sm text-muted-foreground">Basketball Efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-win-shares-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Win Shares</p>
                                            <p className="text-sm text-muted-foreground">Player Value Metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-team-points-per-game-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Team Points/Game</p>
                                            <p className="text-sm text-muted-foreground">Offensive Output</p>
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
                <meta itemProp="name" content="The Ultimate Guide to OPS (On-base Plus Slugging)" />
                <meta itemProp="description" content="Master OPS (On-Base Plus Slugging). Understand why it is the gold standard for measuring offensive production in modern baseball." />
                <meta itemProp="keywords" content="baseball OPS calculator, what is OPS, on-base plus slugging value, baseball stats explained, improve baseball hitting stats" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The King of Stats: Why OPS Rules Modern Baseball</h2>
                <p className="text-lg italic text-muted-foreground">For decades, Batting Average was King. Then, the "Moneyball" revolution showed us On-Base Percentage. Now, OPS (On-Base Plus Slugging) stands as the single most comprehensive quick metric for offensive value.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is OPS?</a></li>
                    <li><a href="#why-it-works" className="hover:underline">Why OPS Works So Well</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What is a "Good" OPS?</a></li>
                    <li><a href="#strategies" className="hover:underline">How to Improve Your OPS</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of OPS</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is OPS?</h2>
                <p><strong>OPS (On-base Plus Slugging)</strong> is exactly what it sounds like: the sum of a player's On-Base Percentage (OBP) and Slugging Percentage (SLG).</p>
                <div className="p-4 bg-muted border-l-4 border-primary my-4">
                    <p className="font-bold">OPS = OBP + SLG</p>
                </div>
                <p>It was designed to answer a simple question: "How well does this player get on base, and how much power do they have when they hit?" By combining these two metrics, OPS gives a complete picture of a hitter's ability to create runs.</p>

                <hr />

                {/* WHY IT WORKS */}
                <h2 id="why-it-works" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why OPS Works So Well</h2>
                <p>Traditional stats have blind spots:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Batting Average</strong> ignores walks and treats a single the same as a home run.</li>
                    <li><strong>Home Runs</strong> ignore consistency and ability to get on base.</li>
                    <li><strong>RBIs</strong> are dependent on teammates getting on base ahead of you.</li>
                </ul>
                <p className="mt-4">OPS fixes this. It values the ability to not make an out (OBP) <em>and</em> the ability to hit for extra bases (SLG). It correlates extremely well with Runs Scored, which is the ultimate goal of an offense.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What is a "Good" OPS?</h2>
                <p>OPS scales differently than average. Here is the general hierarchy for MLB players:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Major League Baseball (MLB)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>1.000+:</strong> MVP Level. A rare season (e.g., Bryce Harper, Shohei Ohtani).</li>
                    <li><strong>.900+:</strong> Elite. An All-Star starter.</li>
                    <li><strong>.800+:</strong> Above Average. A strong offensive contributor.</li>
                    <li><strong>.700 - .750:</strong> Average. The baseline for a regular starter.</li>
                    <li><strong>Below .650:</strong> Poor. Hard to justify a spot in the lineup without elite defense.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Positional Adjustments</h3>
                <p>Expectations vary by position. A First Baseman or Designated Hitter is expected to have an OPS over .800. A Shortstop or Catcher might be valuable with an OPS of .700 because of their defensive importance.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Improve Your OPS</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Improve OBP (The Easier Path)</h3>
                <p>Increasing your slugging percentage usually requires mechanical changes or strength training. Increasing OBP can often be done by improving plate discipline—swinging at fewer bad pitches and taking more walks.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Drive the Ball (SLG)</h3>
                <p>To boost the "S" in OPS, you need extra-base hits. This means looking for pitches you can drive, rather than just deflect. It implies an aggressive mindset on strikes (counts like 2-0 or 3-1).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Balance</h3>
                <p>Don't sacrifice one for the other. Swinging for the fences might raise SLG but tank your OBP if you strike out too much. Taking too many strikes might raise OBP but leave your SLG low. finding the balance is key.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of OPS</h2>
                <p>While excellent, OPS is not perfect:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Undervalues OBP:</strong> Statistically, a point of OBP is worth about 1.8x more than a point of SLG in terms of run creation. OPS treats them as equal (1 + 1). This is why saber-metricians prefer wOBA (Weighted On-Base Average).</li>
                    <li><strong>Park Factors:</strong> An .800 OPS at Coors Field (hitter friendly) is less impressive than an .800 OPS at Petco Park (pitcher friendly). OPS+ (OPS Plus) adjusts for this.</li>
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
                        Common questions about OPS
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a perfect OPS?</h4>
                            <p className="text-muted-foreground">
                                Technically, the maximum possible OPS is 5.000 (1.000 OBP + 4.000 SLG), achievable if a player hits a Home Run in every single at-bat. In reality, anything over 1.000 is spectacular.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is OPS better than Batting Average?</h4>
                            <p className="text-muted-foreground">
                                Yes. OPS correlates much more strongly with run scoring than Batting Average does. A team of .250 hitters with high OPS will outscore a team of .280 hitters with low OPS.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is OPS+?</h4>
                            <p className="text-muted-foreground">
                                OPS+ is a normalized version of OPS where 100 is the league average. It adjusts for park factors (stadium dimensions, altitude). An OPS+ of 150 means the player is 50% better than the league average.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does speed affect OPS?</h4>
                            <p className="text-muted-foreground">
                                Indirectly. Speed can turn singles into doubles (increasing SLG) or help beat out infield hits (increasing OBP). However, OPS does not directly measure stolen bases.
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
                                    <strong className="block text-primary mb-1">General Managers</strong>
                                    <span className="text-sm text-muted-foreground">Evaluating roster construction. OPS is a primary metric for contract negotiations.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fans</strong>
                                    <span className="text-sm text-muted-foreground">Deciding who the real MVP is.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Players</strong>
                                    <span className="text-sm text-muted-foreground">Understanding your complete offensive value beyond just hits.</span>
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
                                The Baseball OPS Calculator provides the modern standard for evaluating hitting performance.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By synthesizing the ability to get on base with power production, OPS offers a rapid, accurate assessment of a player's contribution to winning games.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
