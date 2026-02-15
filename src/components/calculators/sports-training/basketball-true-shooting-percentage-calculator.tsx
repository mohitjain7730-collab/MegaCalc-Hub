import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, BookOpen } from 'lucide-react';
import BasketballTrueShootingPercentageCalculatorInteractive from './basketball-true-shooting-percentage-calculator-interactive';

export default function BasketballTrueShootingPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball True Shooting Percentage (TS%) Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate the most accurate measure of scoring efficiency by accounting for 2-pointers, 3-pointers, and free throws.
                </p>
            </div>

            <BasketballTrueShootingPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        The minimal data needed for the advanced calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Total Points (PTS)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The final output of scoring. Includes all made field goals and free throws. This is the numerator of efficiency.
                            </p>
                        </div>

                        <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-300">
                                <Activity className="h-4 w-4" />
                                Field Goals Attempted (FGA)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Every shot from the floor, whether it went in or not. TS% penalizes missed shots just like FG%.
                            </p>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Target className="h-4 w-4" />
                                Free Throws Attempted (FTA)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Crucial for TS%. Since free throws use possessions but aren't "Field Goals," this formula accounts for them uniquely.
                            </p>
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
                        <p className="font-mono text-xl text-center">
                            TS% = PTS / (2 × (FGA + (0.44 × FTA)))
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        The 0.44 coefficient accounts for technical free throws and "and-one" situations where a free throw is attempted without using an extra possession. It estimates that 44% of free throws essentially use up a possession.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Basketball Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/basketball-player-efficiency-rating-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">PER Calculator</p>
                                            <p className="text-sm text-muted-foreground">Overall productivity</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-field-goal-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Field Goal %</p>
                                            <p className="text-sm text-muted-foreground">Raw shooting stats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-free-throw-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Free Throw %</p>
                                            <p className="text-sm text-muted-foreground">Line accuracy</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Win Rate</p>
                                            <p className="text-sm text-muted-foreground">Team success</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-team-points-per-game-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Points Per Game</p>
                                            <p className="text-sm text-muted-foreground">Scoring average</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Efficiency speed</p>
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
                <meta itemProp="name" content="The Complete Guide to True Shooting Percentage (TS%) in Basketball" />
                <meta itemProp="description" content="A deep dive into True Shooting Percentage, the gold standard for measuring basketball scoring efficiency. Learn the formula, why it beats FG%, and see NBA benchmarks." />
                <meta itemProp="keywords" content="True Shooting Percentage, TS% calculator, basketball analytics, scoring efficiency, FG% vs TS%, eFG% vs TS%" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to True Shooting Percentage (TS%)</h2>
                <p className="text-lg italic text-muted-foreground">Move beyond basic Field Goal Percentage and discover the metric that revolutionized how we understand scoring efficiency in the modern era.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is True Shooting Percentage?</a></li>
                    <li><a href="#why-fg-fails" className="hover:underline">Why Field Goal Percentage is Misleading</a></li>
                    <li><a href="#formula-explained" className="hover:underline">The 0.44 Mystery: Formula Explained</a></li>
                    <li><a href="#comparison" className="hover:underline">FG% vs. eFG% vs. TS%</a></li>
                    <li><a href="#benchmarks" className="hover:underline">TS% Benchmarks: What is "Good"?</a></li>
                    <li><a href="#strategy" className="hover:underline">How to Improve Your TS%</a></li>
                    <li><a href="#case-studies" className="hover:underline">Case Studies: Curry & Harden</a></li>
                </ul>
                <hr />

                {/* WHAT IS TS% */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is True Shooting Percentage?</h2>
                <p><strong>True Shooting Percentage (TS%)</strong> is an advanced statistic that measures a player's shooting efficiency by accounting for 2-point field goals, 3-point field goals, and free throws.</p>
                <p>Unlike traditional stats that treat every shot attempt as equal (or ignore free throws entirely), TS% recognizes that:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>3-pointers are 50% more valuable than 2-pointers.</li>
                    <li>Free throws are a critical source of points that use up offensive possessions.</li>
                </ul>
                <p>It essentially answers the question: <em>"For every shooting possession this player uses, how efficiently do they generate points?"</em></p>

                <hr />

                {/* WHY FG% FAILS */}
                <h2 id="why-fg-fails" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Field Goal Percentage is Misleading</h2>
                <p>For decades, raw Field Goal Percentage (FG%) was the standard. But it has a fatal flaw: it treats a layup and a 3-pointer exactly the same.</p>

                <p><strong>Example:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Player A (Center):</strong> Shoots 5/10 on 2-pointers. Points: 10. FG%: 50%.</li>
                    <li><strong>Player B (Shooter):</strong> Shoots 4/10 on 3-pointers. Points: 12. FG%: 40%.</li>
                </ul>
                <p>Looking at FG%, Player A seems better (50% vs 40%). But Player B actually scored more points on the same number of shots! TS% corrects this error, correctly identifying Player B as the more efficient scorer.</p>

                <hr />

                {/* THE FORMULA EXPLAINED */}
                <h2 id="formula-explained" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 0.44 Mystery: Formula Explained</h2>
                <p>The formula for TS% is:</p>
                <div className="p-4 bg-muted border rounded-lg text-center my-4 font-mono font-bold">
                    TS% = PTS / (2 * (FGA + 0.44 * FTA))
                </div>

                <p><strong>We know PTS (Points) and FGA (Field Goals Attempted). But why 0.44 * FTA?</strong></p>
                <p>TS% attempts to calculate "points per scoring attempt." A field goal attempt is clearly one scoring attempt. But free throws are trickier. Usually, you get 2 free throws for a foul.</p>
                <p>If you take 2 free throws, you have used up what would have been roughly 1 possession. So, 2 FTA = 1 Possession. Logic suggests the coefficient should be 0.5.</p>
                <p><strong>However, not all free throws end a possession:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>And-Ones:</strong> You score a basket AND get 1 free throw. That free throw is "extra"—it doesn't use a new possession.</li>
                    <li><strong>Technical Fouls:</strong> One shot, no possession loss.</li>
                    <li><strong>3-Second Violations:</strong> One shot, team keeps ball.</li>
                </ul>
                <p>Statisticians determined that across NBA history, roughly <strong>44% of free throws use a possession</strong>, while the rest are part of "and-ones" or technicals. This 0.44 coefficient makes the formula surprisingly accurate without needing complex play-by-play data.</p>

                <hr />

                {/* COMPARISON */}
                <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">FG% vs. eFG% vs. TS%</h2>
                <p>Understanding the hierarchy of shooting stats is crucial:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Field Goal Percentage (FG%)</h3>
                <p><strong>Formula:</strong> FGM / FGA</p>
                <p><strong>Verdict:</strong> Outdated. Only useful for centers who never shoot 3s or free throws.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Effective Field Goal Percentage (eFG%)</h3>
                <p><strong>Formula:</strong> (FGM + 0.5 * 3PM) / FGA</p>
                <p><strong>Verdict:</strong> Better. It adjusts for 3-pointers being worth more. However, it completely ignores free throws.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. True Shooting Percentage (TS%)</h3>
                <p><strong>Formula:</strong> See above.</p>
                <p><strong>Verdict:</strong> Gold Standard. It includes 2s, 3s, and Free Throws in one weighted number. It is the comprehensive measure of how well a player turns possessions into points.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">TS% Benchmarks: What is "Good"?</h2>
                <p>Because TS% includes 3-pointers (worth 1.5x) and free throws (highly efficient), TS% numbers are typically higher than FG% numbers.</p>

                <div className="overflow-x-auto my-6">
                    <table className="min-w-full border rounded-lg bg-card">
                        <thead>
                            <tr className="bg-muted">
                                <th className="px-4 py-2 text-left font-bold">TS% Range</th>
                                <th className="px-4 py-2 text-left font-bold">Rating</th>
                                <th className="px-4 py-2 text-left">Context</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-primary">60% +</td>
                                <td className="px-4 py-2 font-bold">Elite</td>
                                <td className="px-4 py-2">Superstars like Curry, Durant, Jokic. Extremely efficient.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-green-600">57% - 60%</td>
                                <td className="px-4 py-2 font-bold">Great</td>
                                <td className="px-4 py-2">Solidly above league average.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-blue-600">54% - 57%</td>
                                <td className="px-4 py-2 font-bold">League Average</td>
                                <td className="px-4 py-2">Standard NBA efficiency (changes slightly by era).</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-orange-600">50% - 54%</td>
                                <td className="px-4 py-2 font-bold">Below Average</td>
                                <td className="px-4 py-2">Inefficient, often high-volume chuckers.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-red-600">&#60; 50%</td>
                                <td className="px-4 py-2 font-bold">Poor</td>
                                <td className="px-4 py-2">Active liability on offense unless providing value elsewhere.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr />

                {/* CASE STUDIES */}
                <h2 id="case-studies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Case Studies: The Masters of Efficiency</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Stephen Curry (The 3-Point Anomaly)</h3>
                <p>Curry revolutionized TS% because he proved you could have Elite TS% (65%+) while taking difficult shots. His high volume of 3-pointers means his raw FG% might be 47%, which looks "good," but his TS% is 65%, which is "god-tier" because so many of those makes are worth 3 points.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">James Harden (The Free Throw Merchant)</h3>
                <p>In his prime, Harden often had mediocre FG% (44%), but his TS% was elite (62%). Why? Because he got to the free throw line 10+ times a game and made 85% of them. Free throws are the most efficient shot in basketball, and TS% correctly rewards this.</p>

                <hr />

                {/* STRATEGY */}
                <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Improve Your TS%</h2>
                <p>If you perform a self-analysis using this calculator and find your TS% is low, here is how to fix it:</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Eliminate the Mid-Range:</strong> The long 2-pointer is mathematically the worst shot in basketball. It has the difficulty of a 3-pointer but the value of a layup. Replace long 2s with 3s or drives.</li>
                    <li><strong>Get to the Line:</strong> Aggressively driving to draw fouls adds high-value FTA to your denominator. Making 2 free throws is virtually guaranteed TS% boosting.</li>
                    <li><strong>Improve Free Throw Accuracy:</strong> It sounds obvious, but missing free throws destroys TS% twice: you waste the "possession cost" of the attempt and get zero points.</li>
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
                        Quick answers about True Shooting Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is TS% fair to centers?</h4>
                            <p className="text-muted-foreground">
                                Typically, centers have very high TS% (often 60%+) because they take high-percentage shots near the rim (dunks/layups). TS% is fair, but you should compare centers to other centers, and guards to other guards.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does TS% measure defense?</h4>
                            <p className="text-muted-foreground">
                                No. TS% is purely a shooting efficiency metric. It says nothing about assists, rebounds, or defense. A player can have a 70% TS% but be a terrible overall player if they don't defend or pass.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the "50-40-90" club?</h4>
                            <p className="text-muted-foreground">
                                This refers to shooting 50% FG, 40% 3PT, and 90% FT in a season. Players who achieve this (like Nash, Bird, Durant, Curry) almost always have astronomical TS% because they are efficient from everywhere.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can TS% go over 100%?</h4>
                            <p className="text-muted-foreground">
                                Technically, yes, though essentially impossible over a season. In a single game, if a player shoots 1/1 on 3-pointers (3 points) and takes no free throws, the formula is 3 / (2 * 1) = 1.5 = 150%.
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
                                    <strong className="block text-primary mb-1">Scouts & Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Filter out "inefficient volume scorers" from true superstars.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Determine which players should be taking more shots and which should take fewer.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Shooting Guards</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate if your shot selection is actually helping the team.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Bettors</strong>
                                    <span className="text-sm text-muted-foreground">Identify teams with highly efficient offenses that are undervalued by raw PPG.</span>
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
                        <BookOpen className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The True Shooting Percentage (TS%) Calculator is the modern authority on scoring efficiency.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By accurately weighting 3-pointers and accounting for the "possession cost" of free throws, it reveals the true value of a scorer beyond simple counting stats, making it indispensable for serious basketball analysis.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
