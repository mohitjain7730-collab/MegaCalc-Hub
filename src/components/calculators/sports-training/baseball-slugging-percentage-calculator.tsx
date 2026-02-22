import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Shield } from 'lucide-react';
import BaseballSluggingPercentageCalculatorInteractive from './baseball-slugging-percentage-calculator-interactive';

export default function BaseballSluggingPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball Slugging Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your Slugging Percentage (SLG) to measure your power hitting efficiency and ability to drive in runs.
                </p>
            </div>

            <BaseballSluggingPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics for calculating Slugging Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Base Hits (1B, 2B, 3B, HR)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of safe hits broken down by type.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Single (1B): 1 Total Base</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Double (2B): 2 Total Bases</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Triple (3B): 3 Total Bases</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Home Run (HR): 4 Total Bases</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                At Bats (AB)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The batter's turn against a pitcher, excluding specific non-attempt outcomes.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Includes: All Hits, Strikeouts</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Exclude: Walks, HBP, Sacrifices</span>
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
                            SLG = (1B + 2×2B + 3×3B + 4×HR) / At Bats
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Slugging Percentage is calculated by dividing the total number of bases reached by hits by the total number of at-bats. Unlike Batting Average, SLG weights hits by their value (Singles=1, Doubles=2, Triples=3, Home Runs=4).
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
                        <Link href="/baseball-batting-average-calculator" className="block">
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
                        <Link href="/baseball-on-base-percentage-calculator" className="block">
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
                        <Link href="/baseball-ops-calculator" className="block">
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
                        <Link href="/basketball-three-point-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">3-Point % Calculator</p>
                                            <p className="text-sm text-muted-foreground">Long Range Accuracy</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-true-shooting-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">True Shooting %</p>
                                            <p className="text-sm text-muted-foreground">Scoring Efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-goals-per-90-minutes-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-green-600" />
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
                <meta itemProp="name" content="The Ultimate Guide to Slugging Percentage (SLG)" />
                <meta itemProp="description" content="Master Slugging Percentage (SLG). Understand how it measures power, why it's different from Batting Average, and how to improve your slugging stats." />
                <meta itemProp="keywords" content="baseball slugging calculator, what is slugging percentage, SLG formula, how to calculate slugging percentage, improve power hitting, baseball stats explained" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Unleashing Power: The Ultimate Guide to Slugging Percentage</h2>
                <p className="text-lg italic text-muted-foreground">While Batting Average tells you how often a player gets a hit, Slugging Percentage tells you how much damage those hits do. It is the premier metric for power hitters.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Slugging Percentage?</a></li>
                    <li><a href="#difference" className="hover:underline">Slugging Percentage vs. Batting Average</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What is a &quot;Good&quot; SLG?</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Increase Power</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of SLG</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Slugging Percentage?</h2>
                <p><strong>Slugging Percentage (SLG)</strong> is a measure of the batting productivity of a hitter. It is calculated by dividing the total number of bases by the total number of at-bats.</p>
                <p>In this system:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>A single is worth <strong>1</strong> base.</li>
                    <li>A double is worth <strong>2</strong> bases.</li>
                    <li>A triple is worth <strong>3</strong> bases.</li>
                    <li>A home run is worth <strong>4</strong> bases.</li>
                </ul>
                <p className="mt-4">Unlike Batting Average, which treats all hits equally, Slugging Percentage rewards extra-base hits. A player who hits 30 home runs contributes significantly more to scoring than a player who hits 30 singles, and SLG reflects this value.</p>

                <hr />

                {/* DIFFERENCE */}
                <h2 id="difference" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Slugging Percentage vs. Batting Average</h2>
                <p>Let&apos;s compare two hypothetical players with 100 At-Bats:</p>

                <h3 className="text-xl font-semibold text-foreground mt-4">Player A (Contact Hitter)</h3>
                <p>30 Singles, 0 Doubles, 0 Triples, 0 Home Runs.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Batting Average:</strong> .300 (30/100)</li>
                    <li><strong>Slugging Percentage:</strong> .300 (30 total bases / 100 AB)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-4">Player B (The Slugger)</h3>
                <p>15 Singles, 10 Doubles, 0 Triples, 5 Home Runs.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Total Hits:</strong> 30</li>
                    <li><strong>Batting Average:</strong> .300 (30/100)</li>
                    <li><strong>Total Bases:</strong> 15 + (10×2) + (5×4) = 55</li>
                    <li><strong>Slugging Percentage:</strong> .550 (55 total bases / 100 AB)</li>
                </ul>
                <p className="mt-4">Both players have the same Batting Average (.300), but Player B's Slugging Percentage (.550) shows they are nearly twice as productive in terms of gaining bases.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What is a &quot;Good&quot; SLG?</h2>
                <p>Like Batting Average, context matters, but general MLB standards are:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Major League Baseball (MLB)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>.600+:</strong> MVP Level. Very few players sustain this (e.g., Aaron Judge, Barry Bonds).</li>
                    <li><strong>.500 - .599:</strong> All-Star / Elite Power Hitter. Typically 30+ Home Run potential.</li>
                    <li><strong>.450 - .499:</strong> Above Average. A solid everyday starter with gap power.</li>
                    <li><strong>.400 - .449:</strong> Average. Servicable for middle infielders or catchers.</li>
                    <li><strong>Below .350:</strong> Poor. Usually reserved for pitchers (before DH rule) or defensive specialists.</li>
                </ul>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Increase Power</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Launch Angle</h3>
                <p>Modern analytics emphasize hitting the ball in the air. Ground balls rarely result in extra-base hits. Generating a slight uppercut or &quot;getting on plane&quot; with the pitch allows hitters to drive the ball into the gaps or over the fence.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Weight Transfer</h3>
                <p>Power comes from the ground up. Efficiently transferring energy from the back leg to the front side during the swing generates bat speed. &quot;Sit into&quot; your legs and drive through the baseball.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Pitch Selection</h3>
                <p>You can&apos;t slug a pitcher&apos;s pitch. High-SLG hitters are patient; they wait for a mistake over the heart of the plate that they can drive, rather than chasing breaking balls on the corners.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Limitations of SLG</h2>
                <p>Slugging Percentage is not a perfect stat:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Ignores OBP:</strong> Like Batting Average, SLG allows walks to count for nothing. This is why OPS (On-Base + Slugging) is often preferred.</li>
                    <li><strong>Speed Bias:</strong> Fast players can turn singles into doubles or doubles into triples, inflating their SLG without traditional "power."</li>
                    <li><strong>Not an Efficiency Stat:</strong> It measures output per at-bat, but doesn't punish outs as harshly as wOBA (Weighted On-Base Average) does.</li>
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
                        Common questions about Slugging Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can Slugging Percentage be higher than 1.000?</h4>
                            <p className="text-muted-foreground">
                                Yes! If a player hits a Home Run in their only at-bat, their SLG is 4.000. Over a season, however, the highest single-season SLG is .863 (Barry Bonds, 2001).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a Walk count towards Slugging Percentage?</h4>
                            <p className="text-muted-foreground">
                                No. Walks (Base on Balls) do not count as At-Bats or Total Bases, so they have zero impact on Slugging Percentage. They do, however, increase On-Base Percentage (OBP).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is Slugging Percentage better than Batting Average?</h4>
                            <p className="text-muted-foreground">
                                For evaluating run production, yes. SLG correlates more strongly with runs scored than AVG does because it accounts for the extra value of doubles and home runs.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do Errors affect Slugging Percentage?</h4>
                            <p className="text-muted-foreground">
                                Reaching base on an error counts as an At-Bat but 0 bases. Therefore, it lowers your Slugging Percentage, just as it lowers your Batting Average.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the difference between SLG and OPS?</h4>
                            <p className="text-muted-foreground">
                                SLG measures power. OPS (On-Base Plus Slugging) combines the ability to get on base (OBP) with power (SLG) into one number. OPS is generally considered the best "quick" metric for overall offensive value.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is it called "Slugging"?</h4>
                            <p className="text-muted-foreground">
                                The term comes from the phrase "slugging the ball," meaning to hit it hard. A "slugger" is synonymous with a power hitter.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do inside-the-park home runs count the same?</h4>
                            <p className="text-muted-foreground">
                                Yes. An inside-the-park home run counts as 4 bases, just like a ball hit over the fence.
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
                                    <strong className="block text-primary mb-1">Power Hitters</strong>
                                    <span className="text-sm text-muted-foreground">Track your "damage output." If your AVG is high but SLG is low, you need to drive the ball more.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Scouts & Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Identify players with "pop." High SLG in high school often translates well to college/pro levels.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Managers</strong>
                                    <span className="text-sm text-muted-foreground">SLG is a great proxy for Home Runs and RBI potential, which are key fantasy categories.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Data Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Use SLG as a component to calculate OPS or ISO (Isolated Power).</span>
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
                                The Baseball Slugging Percentage Calculator goes beyond simple hits and misses to reveal the true power of a hitter.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By weighting hits based on total bases, SLG provides a clearer picture of offensive productivity. Use it alongside On-Base Percentage (OBP) to get a complete view of a player's value.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
