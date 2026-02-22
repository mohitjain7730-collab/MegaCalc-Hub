import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, AlertCircle, Info, Calculator, BarChart3, TrendingUp, Zap, CheckCircle2, Users } from 'lucide-react';
import BasketballThreePointPercentageCalculatorInteractive from './basketball-three-point-percentage-calculator-interactive';

export default function BasketballThreePointPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball 3-Point Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate 3FG% and analyze shooting efficiency. See how your shooting accuracy compares to NBA, NCAA, and High School benchmarks.
                </p>
            </div>

            <BasketballThreePointPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Standard box score metrics needed
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Target className="h-4 w-4" />
                                Makes (3PM)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of successful shots made from behind the 3-point arc.
                            </p>
                        </div>

                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                <BarChart3 className="h-4 w-4" />
                                Attempts (3PA)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of shots taken from behind the arc, including both makes and misses.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formula Used */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Formula Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm md:text-center mb-2">
                            <strong>3P%</strong> = (3PM / 3PA) × 100
                        </p>
                        <p className="font-mono text-sm md:text-center text-muted-foreground">
                            <strong>Equivalent 2P%</strong> = 3P% × 1.5
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        The basic formula is a simple ratio. However, the "Equivalent 2P%" is crucial for understanding value. Because 3 points is 50% more than 2 points, shooting 33% from the 3-point line generates the same number of points as shooting 50% from inside the arc.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Basketball Calculators
                    </CardTitle>
                    <CardDescription>
                        Enhance your analytics toolkit
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/basketball-true-shooting-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">True Shooting %</p>
                                            <p className="text-sm text-muted-foreground">Volume scoring efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-effective-field-goal-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">eFG% Calculator</p>
                                            <p className="text-sm text-muted-foreground">Adjusted for 3 pointers</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-field-goal-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">FG% Calculator</p>
                                            <p className="text-sm text-muted-foreground">Overall accuracy</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-points-per-possession-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Points Per Possession</p>
                                            <p className="text-sm text-muted-foreground">Per-trip efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-free-throw-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Free Throw %</p>
                                            <p className="text-sm text-muted-foreground">Line accuracy</p>
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
                <meta itemProp="name" content="The Complete Guide to 3-Point Shooting Percentage" />
                <meta itemProp="description" content="Master 3-Point Percentage. Learn what separates elite shooters from average ones, the concept of gravity, and why 35% is the magic number in modern basketball." />
                <meta itemProp="keywords" content="basketball 3 point percentage calculator, 3FG% stats, shooting efficiency benchmarks, Stephen Curry stats, effective field goal percentage" />
                <meta itemProp="author" content="MegaCalc Basketball Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">3-Point Percentage: The Stat That Changed the Game</h2>
                <p className="text-lg italic text-muted-foreground">The 3-point revolution has fundamentally altered basketball geometry. Understanding 3-point percentage is no longer just for specialists; it is the primary litmus test for modern offensive viability.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is 3-Point Percentage?</a></li>
                    <li><a href="#math" className="hover:underline">The Math: Why 3 &gt; 2</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: Average vs. Elite</a></li>
                    <li><a href="#gravity" className="hover:underline">The Concept of "Gravity"</a></li>
                    <li><a href="#sample-size" className="hover:underline">The Sample Size Trap</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is 3-Point Percentage?</h2>
                <p><strong>3-Point Percentage (3P%)</strong> represents the ratio of successful 3-point field goals made to the total number of attempts.</p>

                <p className="mt-4">Since its introduction to the NBA in 1979, the volume of attempts has exploded. In the 1980s, teams took fewer than 5 threes per game. Today, teams routinely take over 35.</p>

                <hr />

                {/* MATH */}
                <h2 id="math" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Math: Why 3 &gt; 2</h2>
                <p>The math is simple but powerful. A shot worth 50% more points requires much lower accuracy to be equally efficient.</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg">
                    <table className="w-full text-center">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">3-Point %</th>
                                <th className="p-2">Points Per Shot</th>
                                <th className="p-2">Equivalent 2-Point %</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-2 font-mono">30%</td>
                                <td className="p-2 font-mono">0.90</td>
                                <td className="p-2 font-mono">45%</td>
                            </tr>
                            <tr className="border-b bg-green-50 dark:bg-green-900/10">
                                <td className="p-2 font-mono font-bold">33.3%</td>
                                <td className="p-2 font-mono">1.00</td>
                                <td className="p-2 font-mono font-bold">50%</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-2 font-mono">35%</td>
                                <td className="p-2 font-mono">1.05</td>
                                <td className="p-2 font-mono">52.5%</td>
                            </tr>
                            <tr className="border-b bg-blue-50 dark:bg-blue-900/10">
                                <td className="p-2 font-mono font-bold">40%</td>
                                <td className="p-2 font-mono">1.20</td>
                                <td className="p-2 font-mono font-bold">60%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p>If you shoot 33.3% from deep, you are just as efficient as a mid-range shooter hitting 50% of their shots. Since shooting 50% on long 2s is extremely difficult (even for stars), the 3-pointer is almost always the better mathematical bet.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: Average vs. Elite</h2>
                <p>What percentage makes you a "threat"?</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Elite (40%+)</h4>
                        <p className="text-sm">The gold standard. Shooters like Steph Curry, Klay Thompson, and Kyle Korver. Defenders cannot help off you, ever.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Good (36% - 39%)</h4>
                        <p className="text-sm">Solid floor spacer. The defense respects you and will close out hard. Most starters aim for this range.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Average (33% - 35%)</h4>
                        <p className="text-sm">League average. You take open ones, but you aren't forcing the defense to change its entire scheme.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Poor (&lt; 30%)</h4>
                        <p className="text-sm">Non-spacer. Defense will "sag" off you to protect the paint, making it harder for your teammates to drive.</p>
                    </div>
                </div>

                <hr />

                {/* GRAVITY */}
                <h2 id="gravity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Concept of "Gravity"</h2>
                <p>High 3-point percentage creates <strong>Gravity</strong>. Because defenders are terrified of leaving a 40% shooter open, they stay glued to them at the 3-point line.</p>
                <p className="mt-4">This pulls defenders out of the paint, creating driving lanes for teammates. A shooter standing in the corner doing nothing can actually help the offense score a layup just by existing, provided their percentage is high enough to demand respect.</p>

                <hr />

                {/* SAMPLE SIZE */}
                <h2 id="sample-size" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Sample Size Trap</h2>
                <p>3-point shooting is incredibly "noisy." It takes about 750 attempts for a player's percentage to stabilize and reflect their true skill level. In a short 20-game sample, a bad shooter can get hot (45%) and a great shooter can slump (30%).</p>
                <p className="mt-4">Do not overreact to small sample sizes. Look at career numbers and free throw percentage (which correlates strongly with shooting touch) to evaluate true talent.</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>3-Point Percentage is the gatekeeper stat of modern basketball. It dictates spacing, defensive schemes, and player value. Use this calculator to track your efficiency and understand exactly how much value you are adding to your team's offense.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about 3-Point Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is 40% really that rare?</h4>
                            <p className="text-muted-foreground">
                                Yes. In any given NBA season, usually fewer than 30-40 players shoot about 40% on high volume. To sustain 40% while defenders are actively trying to stop you is extremely difficult.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does difficulty of shot matter?</h4>
                            <p className="text-muted-foreground">
                                Absolutely. A player shooting 38% on wide-open "catch-and-shoot" corner 3s is very different from a player shooting 38% on pull-up 3s off the dribble (like Dame Lillard or Luka Dončić). The latter is much more valuable.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why does Free Throw % predict 3-Point ability?</h4>
                            <p className="text-muted-foreground">
                                Free throws are a controlled environment isolating pure shooting mechanics and touch. If a player has good mechanics (80%+ FT), they likely have the potential to become a good 3-point shooter with practice. If they shoot 50% from the line, their mechanics are likely broken.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is "Corner 3" vs "Above the Break"?</h4>
                            <p className="text-muted-foreground">
                                The corner 3-point line is actually closer to the basket (22 feet) than the top of the key (23 feet, 9 inches). Therefore, corner 3 percentages are typically higher. Elite "3&D" players often specialize specifically in the corner shot.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does fatigue affect percentage?</h4>
                            <p className="text-muted-foreground">
                                Significantly. 3-point shooting requires legs for lift. Shooting percentages typically dip in the 4th quarter or on the second night of back-to-back games due to tired legs leading to shots falling short ("front rim").
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the "Steph Curry Effect"?</h4>
                            <p className="text-muted-foreground">
                                The massive increase in shooting volume and range. Before Curry, taking a 3-pointer on a fast break or from 30 feet was considered a "bad shot." Now, data proves that for elite shooters, these are actually highly efficient shots.
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
                            <h3 className="font-semibold text-lg mb-3">Who Should Use This?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Players</strong>
                                    <span className="text-sm text-muted-foreground">Set goals. Track your shooting in practice (e.g., make 70/100) vs games. Practice % is always higher than Game %.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Shot selection. If a player shoots 25%, they should not have the "green light." If they shoot 42%, design plays for them.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Identify spacers. In modern basketball, you generally need at least 3 shooters on the floor at all times.</span>
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
                        <Target className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Basketball 3-Point Percentage Calculator is a simple but vital tool for evaluating modern offensive skill.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It provides immediate feedback on shooting efficiency, helping players and coaches understand the mathematical power of the long ball.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
