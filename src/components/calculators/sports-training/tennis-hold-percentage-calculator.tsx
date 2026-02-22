import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Shield, Activity, Target, Zap, Clock } from 'lucide-react';
import TennisHoldPercentageCalculatorInteractive from './tennis-hold-percentage-calculator-interactive';

export default function TennisHoldPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Tennis Hold Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate how often you win your service games to determine your dominance and reliability as a server.
                </p>
            </div>

            <TennisHoldPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Core metrics for service game analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Total Service Games Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total count of games where you were the server.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Count every completed game</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Do not include tiebreaks (as they are not "games")</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Shield className="h-4 w-4" />
                                Service Games Won (Holds)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of those games where you won the final point.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Winning after Deuce counts exactly the same as winning "Love"</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Saving break points to win counts as a Hold</span>
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
                            Hold Percentage = (Service Games Won / Total Service Games Played) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This effectively measures your ability to protect your territory. In men's pro tennis, this is often the most important stat. If you hold 100% of the time, you cannot lose in regulation (only in tiebreaks).
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Tennis Calculators
                    </CardTitle>
                    <CardDescription>
                        Enhance your service analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/tennis-first-serve-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">First Serve %</p>
                                            <p className="text-sm text-muted-foreground">Primary reliability</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-aces-per-match-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Aces Per Match</p>
                                            <p className="text-sm text-muted-foreground">Free points</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-double-fault-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Double Fault %</p>
                                            <p className="text-sm text-muted-foreground">Costly errors</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-break-point-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Break Point Conversion</p>
                                            <p className="text-sm text-muted-foreground">Clutch returning</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-return-points-won-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Return Points Won</p>
                                            <p className="text-sm text-muted-foreground">Return efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-defensive-efficiency-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Defensive Efficiency</p>
                                            <p className="text-sm text-muted-foreground">Basketball defense</p>
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
                <meta itemProp="name" content="The Complete Guide to Tennis Hold Percentage: Dominating Service Games" />
                <meta itemProp="description" content="Learn how to calculate and improve your Service Hold Percentage. Analyze ATP vs WTA stats, understand the mathematics of holding serve, and discover strategies to become unbreakable." />
                <meta itemProp="keywords" content="tennis hold percentage, service hold rate, tennis serve strategy, holding serve, service games won, tennis analytics" />
                <meta itemProp="author" content="MegaCalc Tennis Academy" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Tennis Hold Percentage: Creating a Fortress</h2>
                <p className="text-lg italic text-muted-foreground">"In tennis, you are only as good as your serve." Discover why Hold Percentage is the cornerstone of all winning strategies.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Hold Percentage?</a></li>
                    <li><a href="#importance" className="hover:underline">Why "Holding" is Everything</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: ATP vs WTA vs Club</a></li>
                    <li><a href="#math" className="hover:underline">The Mathematics of Holding Serve</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Increase Hold %</a></li>
                    <li><a href="#pressure" className="hover:underline">Serving Under Pressure (30-30 & Deuce)</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Hold Percentage?</h2>
                <p><strong>Hold Percentage</strong> is the frequency with which a player wins their service game. It is a binary result per game: you either held or you were broken. The points within the game (winning 40-0 vs winning 7-deuces) do not affect this specific metric, although they do indicate how <em>hard</em> you had to work for the hold.</p>

                <p>The formula is simple:</p>
                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-primary font-bold">
                        (Service Games Won / Total Service Games Served) × 100
                    </p>
                </div>

                <hr />

                {/* IMPORTANCE */}
                <h2 id="importance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why "Holding" is Everything</h2>
                <p>The entire scoring system of tennis is predicated on the idea that the server should win. </p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                    <li><strong>Scoreboard Pressure:</strong> If you hold first in a set, you are always "up" (1-0, 2-1, 3-2). This forces the opponent to serve just to stay even. This psychological weight often causes the opponent to crack at 4-5 or 5-6.</li>
                    <li><strong>Tiebreak Insurance:</strong> If you hold 100% of your games, the worst thing that can happen is a tiebreak. You cannot lose the set 6-4 or 7-5. You guarantee yourself a 50/50 shot in the breaker.</li>
                    <li><strong>Energy Conservation:</strong> Efficient holds (winning 40-0 or 40-15) conserve massive amounts of physical energy for tough return games.</li>
                </ul>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: ATP vs WTA vs Club</h2>
                <p>Understanding where you stand compared to peers and pros is vital for setting realistic goals.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <div className="p-4 border rounded bg-background">
                        <h4 className="font-bold text-lg mb-2 text-blue-600">ATP Tour (Men)</h4>
                        <ul className="list-disc ml-4 space-y-1 text-sm">
                            <li><strong>Elite (Top 10):</strong> &gt;85% (Isner/Karlovic &gt;92%)</li>
                            <li><strong>Average Top 100:</strong> 80%</li>
                            <li><strong>Struggling:</strong> &lt;75%</li>
                        </ul>
                    </div>
                    <div className="p-4 border rounded bg-background">
                        <h4 className="font-bold text-lg mb-2 text-pink-600">WTA Tour (Women)</h4>
                        <ul className="list-disc ml-4 space-y-1 text-sm">
                            <li><strong>Elite (Top 10):</strong> &gt;75% (Serena/Swiatek ~80%)</li>
                            <li><strong>Average Top 100:</strong> 65-70%</li>
                            <li><strong>Struggling:</strong> &lt;60%</li>
                        </ul>
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Club Level (NTRP 4.0)</h3>
                <p>At the club level, the serve is less dominant. Breaks are frequent. A hold percentage of <strong>60-70%</strong> is considered very strong for recreational men's doubles, while 50-60% is common in singles.</p>

                <hr />

                {/* MATH */}
                <h2 id="math" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mathematics of Holding Serve</h2>
                <p>To understand holding, you must look at point win percentage. The math is brutal:</p>
                <ul className="list-disc ml-6 space-y-2 mt-4">
                    <li>If you win <strong>50%</strong> of service points, you will only hold serve <strong>50%</strong> of the time.</li>
                    <li>If you win <strong>60%</strong> of service points (just 6 out of 10), your hold percentage jumps to nearly <strong>80%</strong>.</li>
                    <li>If you win <strong>70%</strong> of service points (dominant), you will hold over <strong>95%</strong> of the time.</li>
                </ul>
                <p>Small improvements in point-winning percentage (winning just 1 more point per game) yield massive jumps in hold percentage.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Increase Hold %</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. The "Plus One" Shot</h3>
                <p>Don't just hit a serve; hit a serve <em>to set up your forehand</em>. The combination of "Serve + First Forehand" accounts for over 70% of points won in short rallies. Serve wide to open the court, then hit the next ball to the open space.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. High First Serve Percentage</h3>
                <p>You cannot hold consistently if you are always hitting second serves. A 100mph serve in is better than a 120mph fault. Aim for 65%+ first serves in to keep the returner defensive.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Body Serves</h3>
                <p>At huge moments (30-30), the body serve is the safest and most effective option. It jams the returner, forcing a block, and removes the risk of missing wide.</p>

                <hr />

                {/* PRESSURE */}
                <h2 id="pressure" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Serving Under Pressure (30-30 & Deuce)</h2>
                <p>The difference between a 90% holder and a 70% holder is rarely technique; it is decision making at 30-30.</p>
                <p>At 30-30 (or Deuce), the "Hold" is on the line. Statistical analysis confirms that servers who aim for <strong>big targets</strong> (safe zones) at 30-30 hold significantly more often than those who try to paint the lines for an ace. Panic leads to aiming small; confidence leads to aiming big and trusting your rally tolerance.</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Your Hold Percentage tells the story of your control over the match. While breaking serve is glorious, holding serve is mandatory. By tracking this stat, you stop viewing service games as individual events and start seeing them as the foundation of your competitive identity.</p>
                <p>Aim for that magical 80% mark. If you hold 4 out of every 5 service games, you will find yourself deep in tournaments simply because you are too hard to eliminate.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Q&A on Service Dominance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does holding serve mean I have to hit aces?</h4>
                            <p className="text-muted-foreground">
                                Absolutely not. Rafael Nadal is one of the greatest holders of all time but hits relatively few aces. He holds by setting up the point with spin and finishing it with a forehand. Consistency and strategy &gt; Raw Power.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does this differ from "Service Games Won %"?</h4>
                            <p className="text-muted-foreground">
                                It is the same thing. "Hold Percentage" and "Service Games Won %" are interchangeable terms in tennis analytics.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What happens if I get broken?</h4>
                            <p className="text-muted-foreground">
                                In analytics, we call this "dropping serve." If you get broken, your hold percentage drops. To maintain an 80% hold rate, you must hold 4 times for every 1 time you get broken.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should I serve first or receive first?</h4>
                            <p className="text-muted-foreground">
                                If you have a high Hold Percentage, ALWAYS serve first. This puts you ahead on the scoreboard (1-0, 2-1), applying maximum pressure to your opponent. If you are a weak server but a great returner, you might choose to receive to start with a break.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is it harder to hold in doubles?</h4>
                            <p className="text-muted-foreground">
                                Generally, it is <em>easier</em> to hold in doubles because your partner at the net cuts off returns, forcing the opponents to hit difficult lobs or cross-court angles. Hold percentages in pro doubles are significantly higher than in singles.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Usage of this Calculator</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Who Should Use This Calculator?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Tournament Players</strong>
                                    <span className="text-sm text-muted-foreground">Determine if your loss was due to poor serving or poor returning.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">League Captains</strong>
                                    <span className="text-sm text-muted-foreground">Decide who to put in the "Server" role for doubles pairings.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Juniors</strong>
                                    <span className="text-sm text-muted-foreground">Learn the value of consistency over power. Hitting hard means nothing if you lose the game.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                                <li><strong>Opponent Quality:</strong> Holding against a weak returner is easy; holding against Djokovic is hard. The stat doesn't adjust for opponent skill.</li>
                                <li><strong>Surface Speed:</strong> Expect your hold % to be 5-10% higher on grass/hard courts than on clay.</li>
                            </ul>
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
                                The Tennis Hold Percentage Calculator provides the baseline metric for your service dominance.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It moves beyond counting aces or speed and focuses on the only thing that matters: winning the game. High hold percentages destroy opponent morale and stifle their rhythm.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
