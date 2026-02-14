import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, CheckCircle2, TrendingUp, TrendingDown, AlertCircle, FunctionSquare, Calculator, Shield, Activity, Target, Users, Zap, Briefcase, Landmark, Trophy } from 'lucide-react';
import BoundaryPercentageCalculatorInteractive from './boundary-percentage-calculator-interactive';

export default function BoundaryPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Cricket Boundary Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Analyze your batting aggression scoring distribution. Calculate the percentage of runs scored in boundaries versus running between wickets.
                </p>
            </div>

            <BoundaryPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Scoring Metrics
                    </CardTitle>
                    <CardDescription>
                        Input details required to analyze batting style
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Total Runs
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The final score achieved by the batsman in the innings.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Must include all runs (boundaries + running).</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                <Zap className="h-4 w-4" />
                                Boundaries (4s and 6s)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The count of shots that reached or cleared the rope.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                    <span><strong>Fours:</strong> Shots crossing the boundary along the ground (4 runs).</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                                    <span><strong>Sixes:</strong> Shots clearing the boundary directly (6 runs).</span>
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
                            Boundary Runs = (Fours × 4) + (Sixes × 6)
                        </p>
                        <p className="font-mono text-sm text-center mt-2">
                            Boundary % = (Boundary Runs / Total Runs) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This metric isolates the proportion of runs scored through "risk vs reward" shots compared to runs accumulated through risk-free rotation of strike.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Also for Batters
                    </CardTitle>
                    <CardDescription>
                        Explore other batting performance tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Detailed average analysis</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed tracker</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/required-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Required Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Target chasing tool</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Holistic player rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/cricket-fantasy-points-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Fantasy Points</p>
                                            <p className="text-sm text-muted-foreground">Dream11/IPL scoring</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/over-economy-tracker" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingDown className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Economy Tracker</p>
                                            <p className="text-sm text-muted-foreground">New: Bowling analysis</p>
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
                <meta itemProp="name" content="The Definitive Guide to Boundary Percentage: Analyzing Batting Aggression in Cricket" />
                <meta itemProp="description" content="Learn why Boundary Percentage is the single most critical metric in T20 cricket. Understand how to calculate it, interpret the data, and balance power-hitting with strike rotation." />
                <meta itemProp="keywords" content="cricket boundary percentage, batting strike rate, T20 batting strategy, power hitting analysis, cricket coaching metrics" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-14" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Mastering the Boundary Percentage: The Engine of Modern Batting</h2>
                <p className="text-lg italic text-muted-foreground">In the age of T20, the ability to clear the ropes is no longer a luxury—it is a necessity. Boundary Percentage reveals the "DNA" of an innings, separating the accumulators from the destructors.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Boundary Percentage?</a></li>
                    <li><a href="#t20-revolution" className="hover:underline">The T20 Revolution: Why 60% is the Magic Number</a></li>
                    <li><a href="#calculation" className="hover:underline">Calculating the Metric</a></li>
                    <li><a href="#anchor-vs-aggressor" className="hover:underline">The Anchor vs. The Aggressor</a></li>
                    <li><a href="#training" className="hover:underline">Training for Boundaries</a></li>
                    <li><a href="#historical" className="hover:underline">Historical Analysis: Gayle to Kohli</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Boundary Percentage?</h2>
                <p><strong>Boundary Percentage</strong> is a batting metric that calculates the proportion of total runs scored via fours and sixes. It answers a simple question: <em>How much of this player's score came from beating the field versus running between wickets?</em></p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Efficiency of Power</h3>
                <p>Hitting a boundary is the most energy-efficient way to score. A six requires one swing and zero running. Scoring 6 runs via singles requires six sprints (120 yards of running). Therefore, a high boundary percentage not only keeps the run rate high but exerts less physical toll on the batter, allowing them to bat longer.</p>

                <hr />

                {/* T20 REVOLUTION */}
                <h2 id="t20-revolution" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The T20 Revolution: Why 60% is the Magic Number</h2>
                <p>In T20 cricket, data analysis has shown a direct correlation between Boundary Percentage and Win Probability.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Golden Rule</h3>
                <p>Teams that score more boundaries than their opponents win approximately <strong>80-90%</strong> of T20 matches. It is far more predictive than having a higher "dot ball percentage" or even taking more wickets.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>The 60% Benchmark:</strong> Elite T20 batters aim for 60-70% of runs in boundaries.</li>
                    <li><strong>The Risk:</strong> High boundary percentage comes with high risk. You cannot hit a six without lifting the ball, inviting a catch.</li>
                </ul>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating the Metric</h2>
                <p>The math is simple but powerful.</p>
                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-orange-600 dark:text-orange-400 font-bold">
                        Score: 50 runs (Four 4s, Two 6s)
                        <br />
                        Boundary Runs = (4×4) + (2×6) = 28
                        <br />
                        Percentage = (28 / 50) × 100 = 56%
                    </p>
                </div>

                <hr />

                {/* ANCHOR VS AGGRESSOR */}
                <h2 id="anchor-vs-aggressor" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Anchor vs. The Aggressor</h2>
                <p>Understanding your role helps in setting the right target for this metric.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Anchor (Virat Kohli / Kane Williamson)</h3>
                <p><strong>Typical Boundary %: 45-55%</strong></p>
                <p>Their role is to minimize risk, rotate strike, and prevent collapses. They rely on "quick singles" and "converting ones into twos." They ensure the team plays 20 overs.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Power Hitter (Andre Russell / Chris Gayle)</h3>
                <p><strong>Typical Boundary %: 70-85%</strong></p>
                <p>Their role is maximum damage in minimum time. They might face 15 balls but score 40 runs. They rarely run hard twos; their game is binary—Block or Boundary.</p>

                <hr />

                {/* TRAINING */}
                <h2 id="training" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Training for Boundaries</h2>
                <p>How does one improve this percentage? It is rarely about brute strength alone.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Base Stability</h3>
                <p>Power comes from a stable base. If your feet are moving when contact is made, energy is leaked. Great power hitters often have a wide stance and stay very still at the point of impact.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Range Hitting</h3>
                <p>Practice hitting "through the line." Most modern players practice "range hitting" sessions where the goal isn't to defend but to clear specific zones on the field.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Bat Speed</h3>
                <p>Gym work focuses on rotational core strength and forearm power to generate maximum bat speed. The faster the bat moves, the further the ball travels.</p>

                <hr />

                {/* HISTORICAL */}
                <h2 id="historical" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Historical Analysis: Gayle to Sehwag</h2>

                <div className="space-y-4 mt-4">
                    <div className="p-4 border-l-4 border-indigo-500 bg-muted/30">
                        <h4 className="font-bold">Chris Gayle (T20 Greatest)</h4>
                        <p className="text-sm">In his record-breaking 175* in the IPL, over <strong>85%</strong> of his runs came in boundaries. He barely ran, preserving energy to hit 17 sixes.</p>
                    </div>
                    <div className="p-4 border-l-4 border-purple-500 bg-muted/30">
                        <h4 className="font-bold">Virender Sehwag (Test Opener)</h4>
                        <p className="text-sm">Revolutionized Test batting by maintaining a boundary percentage closer to ODI standards (nearly 60%), demoralizing bowlers before lunch.</p>
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
                        Common queries about Batting Aggression
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a higher boundary percentage always better?</h4>
                            <p className="text-muted-foreground">
                                Not always. In a Test match, a very high boundary percentage might indicate recklessness. On a difficult pitch where the ball is turning square, trying to hit boundaries might lead to getting out. Adaptation is key.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does running 3 runs count as a boundary?</h4>
                            <p className="text-muted-foreground">
                                No. Even though 3 runs is a high-value shot, it is physically run and does not cross the rope. It is counted in the "Non-Boundary Runs" category.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good boundary percentage for a T20 opener?</h4>
                            <p className="text-muted-foreground">
                                For a Powerplay opener, aiming for &gt;65% is ideal because the field restrictions allow for easier boundaries. Once the field spreads, maintaining 50-60% is excellent.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does this modify Strike Rate?</h4>
                            <p className="text-muted-foreground">
                                Mathematically, boundaries boost strike rate the most. A boundary is a strike rate of 400.00 (4 runs off 1 ball). A single is 100.00. Therefore, Boundary % and Strike Rate are intimately linked.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the highest boundary percentage in history?</h4>
                            <p className="text-muted-foreground">
                                In specific innings, players like Suresh Raina, Andre Russell, and Travis Head have recorded innings with 90%+ boundary runs. Over a career, Chris Gayle sits near the top for volume of boundary runs.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should juniors focus on boundary percentage?</h4>
                            <p className="text-muted-foreground">
                                Coaches generally advise juniors to focus on technique and timing first. Power comes later. Focusing too early on "slogging" can ruin defensive technique.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can you win with a low boundary percentage?</h4>
                            <p className="text-muted-foreground">
                                Yes, if the chase is low (e.g., 120 runs in 20 overs). In such games, risk-free cricket (accumulating singles) is the smarter strategy.
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
                                <strong className="block text-primary mb-1">T20 Analysts</strong>
                                <span className="text-sm text-muted-foreground">To scout players for franchise leagues. High Boundary % is the #1 recruiting metric.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Batting Coaches</strong>
                                <span className="text-sm text-muted-foreground">To identify if a player is running too much and getting tired, or hitting too recklessly.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Fans</strong>
                                <span className="text-sm text-muted-foreground">To settle debates: "Is Player A actually aggressive or just busy?"</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Fantasy Gamers</strong>
                                <span className="text-sm text-muted-foreground">Captains in fantasy teams should be players with high boundary % as they rack up points faster.</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-border/50" />

                    {/* Real World Examples */}
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
                            <Landmark className="h-5 w-5 text-green-600" />
                            Real-World Examples
                        </h4>
                        <div className="space-y-3">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Case Study: The Finisher</h5>
                                <p className="text-sm text-green-700/80 dark:text-green-400">
                                    Player scores 40 off 15 balls (3 Fours, 3 Sixes). <br />
                                    Boundary Runs = 12 + 18 = 30. <br />
                                    Boundary % = <strong>75%</strong>. <br />
                                    Verdict: Perfect death overs hitting.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20">
                                <h5 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">Case Study: The Rebuild</h5>
                                <p className="text-sm text-yellow-700/80 dark:text-yellow-400">
                                    Player scores 50 off 45 balls (2 Fours, 0 Sixes). <br />
                                    Boundary Runs = 8. <br />
                                    Boundary % = <strong>16%</strong>. <br />
                                    Verdict: Slow, stabilizing innings. High running workload.
                                </p>
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
                                The Cricket Boundary Percentage Calculator dissects the composition of a batsman's score.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It highlights the stylistic difference between power hitters (high boundary %) and strike rotators (low boundary %).
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Use this tool to benchmark performance against modern T20 and ODI standards.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
