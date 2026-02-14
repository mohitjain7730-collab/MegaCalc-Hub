import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, CheckCircle2, TrendingDown, AlertCircle, FunctionSquare, Calculator, Shield, Activity, Target, Users, Zap, Briefcase, Landmark, Trophy, Sword, Timer, TrendingUp, Star, Clock } from 'lucide-react';
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
                        Two simple metrics define a bowler's lethality
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
                                Total legal deliveries sent down in the spell, innings, or career.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Pro Tip:</strong> Multiply overs by 6. (e.g., 10.4 overs = 10x6 + 4 = 64 balls).</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Do not count Wides or No-Balls as they are re-bowled.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <Sword className="h-4 w-4" />
                                Wickets Taken
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Number of batsmen dismissed directly by the bowler.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span><strong>Includes:</strong> Bowled, LBW, Caught, Stumped, Hit Wicket.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span><strong>Excludes:</strong> Run Outs (these are team dismissals).</span>
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
                <meta itemProp="name" content="The Ultimate Guide to Bowling Strike Rate: Wicket-Taking Efficiency and Tactics" />
                <meta itemProp="description" content="Master the art of cricket analytics with our deep dive into Bowling Strike Rate. Understand the difference between Strike Rate, Average, and Economy, learn optimal benchmarks for T20, ODI, and Test cricket, and discover how legendary bowlers achieved their numbers." />
                <meta itemProp="keywords" content="cricket bowling strike rate calculator, wicket taking frequency, bowling analysis, cricket coaching metrics, T20 bowling stats, bowling average vs strike rate" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-14" />
                <meta itemProp="headline" content="Mastering Bowling Strike Rate: The Assassin's Metric" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">Bowling Strike Rate: The Assassin's Metric</h2>
                <p className="text-lg italic text-muted-foreground">
                    "Economy rate wins you matches, but strike rate wins you championships." In the modern game, the ability to take wickets—to break partnerships and halt momentum—is the most valuable currency. Bowling Strike Rate is the purest measure of this lethality.
                </p>

                {/* TABLE OF CONTENTS */}
                <div className="bg-muted/50 p-6 rounded-xl border border-border/50 my-8">
                    <h3 className="text-xl font-bold text-foreground mb-4">Table of Contents</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-primary">
                        <li><a href="#definition" className="flex items-center gap-2 hover:underline"><Target className="h-4 w-4" /> What is Bowling Strike Rate?</a></li>
                        <li><a href="#trinity" className="flex items-center gap-2 hover:underline"><Activity className="h-4 w-4" /> The Holy Trinity of Stats</a></li>
                        <li><a href="#quadrants" className="flex items-center gap-2 hover:underline"><FunctionSquare className="h-4 w-4" /> The 4 Types of Bowlers</a></li>
                        <li><a href="#benchmarks" className="flex items-center gap-2 hover:underline"><Trophy className="h-4 w-4" /> Benchmarks by Format</a></li>
                        <li><a href="#t20-evolution" className="flex items-center gap-2 hover:underline"><TrendingDown className="h-4 w-4" /> The T20 Evolution</a></li>
                        <li><a href="#tactics" className="flex items-center gap-2 hover:underline"><Briefcase className="h-4 w-4" /> Strategies to Improve SR</a></li>
                        <li><a href="#legends" className="flex items-center gap-2 hover:underline"><Star className="h-4 w-4" /> Legends of the Game</a></li>
                    </ul>
                </div>

                <hr className="border-border" />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">1. What is Bowling Strike Rate?</h2>
                <p>
                    <strong>Bowling Strike Rate (SR)</strong> is defined as the average number of legal deliveries a bowler bowls to take a single wicket.
                </p>
                <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary my-4">
                    <p className="font-medium text-foreground">Formula: Total Balls Bowled ÷ Total Wickets Taken</p>
                </div>
                <p>
                    Unlike Batting Strike Rate (where higher is better), for bowlers, a <strong>lower number is superior</strong>. A strike rate of 24.0 means the bowler takes a wicket every 4 overs (24 balls). A strike rate of 60.0 means they take a wicket every 10 overs.
                </p>

                <hr className="border-border my-8" />

                {/* TRINITY */}
                <h2 id="trinity" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">2. The Holy Trinity: Average vs. Economy vs. Strike Rate</h2>
                <p>To truly evaluate a bowler, you must understand how Strike Rate interacts with the other two key metrics.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                    <div className="p-5 rounded-xl bg-card border shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingDown className="h-5 w-5 text-blue-600" />
                            <h3 className="font-bold text-lg">Economy Rate</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">"How expensive are you?"</p>
                        <p className="text-xs font-mono bg-muted p-2 rounded">Runs / Over</p>
                        <p className="text-sm mt-3">Crucial for defensive bowlers in limited overs.</p>
                    </div>

                    <div className="p-5 rounded-xl bg-card border shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="h-5 w-5 text-red-600" />
                            <h3 className="font-bold text-lg">Bowling Average</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">"How much does a wicket cost?"</p>
                        <p className="text-xs font-mono bg-muted p-2 rounded">Runs / Wicket</p>
                        <p className="text-sm mt-3">Combines economy and strike rate precision.</p>
                    </div>

                    <div className="p-5 rounded-xl bg-card ring-2 ring-primary/20 border-primary/20 shadow-md">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="h-5 w-5 text-yellow-600" />
                            <h3 className="font-bold text-lg text-primary">Strike Rate</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">"How fast do you strike?"</p>
                        <p className="text-xs font-mono bg-muted p-2 rounded">Balls / Wicket</p>
                        <p className="text-sm mt-3">The ultimate measure of wicket-taking potency.</p>
                    </div>
                </div>

                <hr className="border-border my-8" />

                {/* QUADRANTS */}
                <h2 id="quadrants" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">3. The 4 Types of Bowlers</h2>
                <p>By plotting Strike Rate against Economy Rate, we can categorize every bowler in history.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 border rounded-lg bg-green-50/50 dark:bg-green-900/10">
                        <h4 className="font-bold text-green-700 dark:text-green-400">The Legend (Low SR, Low Econ)</h4>
                        <p className="text-sm mt-1">Takes wickets often AND gives fewer runs. The rarest breed.</p>
                        <p className="text-xs mt-2 font-semibold">e.g., Glenn McGrath, Jasprit Bumrah</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10">
                        <h4 className="font-bold text-yellow-700 dark:text-yellow-400">The Strike Bowler (Low SR, High Econ)</h4>
                        <p className="text-sm mt-1">Expensive but breaks partnerships. Captains use them to attack.</p>
                        <p className="text-xs mt-2 font-semibold">e.g., Mitchell Starc, Lockie Ferguson</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                        <h4 className="font-bold text-blue-700 dark:text-blue-400">The Container (High SR, Low Econ)</h4>
                        <p className="text-sm mt-1">Hard to score off but rarely takes wickets. Used to build pressure.</p>
                        <p className="text-xs mt-2 font-semibold">e.g., Washington Sundar, Roelof van der Merwe</p>
                    </div>
                    <div className="p-4 border rounded-lg bg-red-50/50 dark:bg-red-900/10">
                        <h4 className="font-bold text-red-700 dark:text-red-400">The Liability (High SR, High Econ)</h4>
                        <p className="text-sm mt-1">Leaks runs and doesn't take wickets. Usually dropped quickly.</p>
                    </div>
                </div>

                <hr className="border-border my-8" />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">4. Benchmarks by Format</h2>
                <p>A "good" strike rate is relative to the format. T20 requires aggression, while Test cricket allows for patience.</p>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-foreground">
                            <tr>
                                <th className="p-3 rounded-tl-lg">Rating</th>
                                <th className="p-3">Test Match SR</th>
                                <th className="p-3">ODI SR</th>
                                <th className="p-3 rounded-tr-lg">T20 SR</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-3 font-semibold text-purple-600">World Class</td>
                                <td className="p-3">&lt; 45 balls</td>
                                <td className="p-3">&lt; 30 balls</td>
                                <td className="p-3">&lt; 14 balls</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 font-semibold text-green-600">Excellent</td>
                                <td className="p-3">45 - 55</td>
                                <td className="p-3">30 - 35</td>
                                <td className="p-3">14 - 18</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-3 font-semibold text-yellow-600">Avergae</td>
                                <td className="p-3">55 - 70</td>
                                <td className="p-3">35 - 45</td>
                                <td className="p-3">18 - 24</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-semibold text-red-600">Poor</td>
                                <td className="p-3">&gt; 70</td>
                                <td className="p-3">&gt; 45</td>
                                <td className="p-3">&gt; 24</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr className="border-border my-8" />

                {/* T20 EVOLUTION */}
                <h2 id="t20-evolution" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">5. The T20 Evolution</h2>
                <p>
                    T20 cricket has revolutionized bowling. In Test cricket, a bowler uses consistency to induce an error over time (setup). In T20, bowlers must produce a "magic ball" immediately or rely on the batsman's greed.
                </p>
                <div className="p-4 md:p-6 bg-muted rounded-xl mt-4">
                    <h3 className="font-bold text-lg mb-2">Why is T20 SR so low?</h3>
                    <ul className="list-disc ml-5 space-y-2">
                        <li><strong>Forced Errors:</strong> Batsmen attack every ball, increasing dismissal probability.</li>
                        <li><strong>Short Spells:</strong> Bowlers bowl 4-over bursts at max effort, allowing for higher intensity and speed.</li>
                        <li><strong>Variations:</strong> Unorthodox deliveries (knuckleballs, wide yorkers) deceive batsmen more frequently than standard stock balls.</li>
                    </ul>
                </div>

                <hr className="border-border my-8" />

                {/* STRATEGY */}
                <h2 id="tactics" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">6. Strategies to Lower Your Strike Rate</h2>
                <p>How can you take wickets more frequently?</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <h4 className="font-bold text-foreground flex items-center gap-2"><Target className="h-4 w-4" /> Bowl "Wicket-Taking" Lines</h4>
                        <p className="text-sm mt-1">
                            In Tests, the "corridor of uncertainty" (4th stump) invites the edge. In T20s, attacking the stumps (bowled/LBW) is often effective as batsmen swing across the line.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground flex items-center gap-2"><Zap className="h-4 w-4" /> Change of Pace</h4>
                        <p className="text-sm mt-1">
                            Disrupting the batsman's timing is the #1 way to get wickets in white-ball cricket. A well-disguised slower ball is often more lethal than a 150kph thunderbolt.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Field Placements</h4>
                        <p className="text-sm mt-1">
                            Set "traps". Leave a gap at mid-wicket to tempt the drive, but have a man deep ready for the catch. Bowling to your field creates chances.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-foreground flex items-center gap-2"><Activity className="h-4 w-4" /> Fitness & Speed</h4>
                        <p className="text-sm mt-1">
                            Fatigue kills strike rates. Ideally, your pace in your 4th spell should match your 1st. Maintain fitness to execute skills late in the day.
                        </p>
                    </div>
                </div>

                <hr className="border-border my-8" />

                {/* LEGENDS */}
                <h2 id="legends" className="text-2xl font-bold text-foreground pt-6" itemProp="articleSection">7. Legendary Numbers</h2>
                <div className="space-y-4 mt-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start p-4 bg-muted/30 border rounded-xl">
                        <div className="bg-primary/20 p-3 rounded-full shrink-0">
                            <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-foreground">Dale Steyn (Test Cricket)</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                <strong>Strike Rate: 42.3</strong> • The gold standard for modern fast bowling. Steyn combined extreme pace with swing, taking a wicket roughly every 7 overs throughout his career.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-start p-4 bg-muted/30 border rounded-xl">
                        <div className="bg-purple-500/20 p-3 rounded-full shrink-0">
                            <Zap className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-foreground">Rashid Khan (T20 Format)</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                <strong>Strike Rate: ~13.0</strong> • In franchise cricket, Rashid is a phenomenon. He strikes almost every second over he bowls, making him invaluable despite batsmen trying to play him defensively.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-start p-4 bg-muted/30 border rounded-xl">
                        <div className="bg-red-500/20 p-3 rounded-full shrink-0">
                            <Clock className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-foreground">George Lohmann (All Time)</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                                <strong>Strike Rate: 34.1</strong> • An 19th-century English medium pacer who holds the lowest career strike rate in Test history (min 2000 balls). His mastery of seam on uncovered pitches was unmatched.
                            </p>
                        </div>
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
