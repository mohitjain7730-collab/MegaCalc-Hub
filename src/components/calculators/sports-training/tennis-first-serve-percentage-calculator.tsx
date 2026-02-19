import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Target, Zap, Activity } from 'lucide-react';
import TennisFirstServePercentageCalculatorInteractive from './tennis-first-serve-percentage-calculator-interactive';

export default function TennisFirstServePercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Tennis First Serve Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your first serve accuracy to optimize your service game strategy and reduce double faults.
                </p>
            </div>

            <TennisFirstServePercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key data points required for calculating serve percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <CheckCircle2 className="h-4 w-4" />
                                First Serves Made
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of first serves that landed "in" the correct service box.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes aces and unreturned serves</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes serves that were returned (as long as they were "in")</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Trophy className="h-4 w-4" />
                                Total First Serve Attempts
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of points where you hit a first serve.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Count every point where you served</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Do NOT count "let" serves (replay the point)</span>
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
                            First Serve Percentage = (First Serves Made / Total First Serve Attempts) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This metric represents the efficiency of your first serve delivery. A balanced percentage is crucial—too low puts pressure on your second serve, while too high may indicate you aren't taking enough risks with power or placement.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/tennis-break-point-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Break Point Conversion</p>
                                            <p className="text-sm text-muted-foreground">Clutch performance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Cricket consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-free-throw-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Free Throw %</p>
                                            <p className="text-sm text-muted-foreground">Basketball accuracy</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-shot-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Shot Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Football precision</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Win Rate</p>
                                            <p className="text-sm text-muted-foreground">Overall success</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Cricket aggression</p>
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
                <meta itemProp="name" content="The Ultimate Guide to First Serve Percentage in Tennis: Benchmarks, Strategy, and Technique" />
                <meta itemProp="description" content="Master your tennis service game. Learn why first serve percentage matters, ideal benchmarks for your level, and how to balance power with consistency." />
                <meta itemProp="keywords" content="tennis serve percentage, first serve accuracy, tennis serve improvement, ATP serve stats, WTA serve stats, tennis coaching, second serve strategy" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to First Serve Percentage: Balancing Risk and Reward</h2>
                <p className="text-lg italic text-muted-foreground">The first serve is the only shot in tennis you have complete control over. Mastering its consistency is the gateway to holding serve and winning matches.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is First Serve Percentage?</a></li>
                    <li><a href="#calculation" className="hover:underline">How to Calculate It Correctly</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks (ATP/WTA/Club)</a></li>
                    <li><a href="#strategy" className="hover:underline">The Strategic Trade-Off: Power vs. Consistency</a></li>
                    <li><a href="#risks" className="hover:underline">Risks of a Low (or Too High) Percentage</a></li>
                    <li><a href="#improvement" className="hover:underline">Strategies to Improve Your Serve Accuracy</a></li>
                </ul>
                <hr />

                {/* WHAT IS FIRST SERVE PERCENTAGE */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is First Serve Percentage?</h2>
                <p><strong>First Serve Percentage</strong> is a statistical metric that tracks how often a player lands their first serve "in" the service box relative to how many times they attempt it.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Why It Matters</h3>
                <p>In tennis, the server has a statistically significant advantage, but only if they can start the point on their terms. The first serve is typically faster, flatter, and more aggressively placed than the second serve. When you miss a first serve, you are forced to hit a second serve, which is:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Slower and easier to return</li>
                    <li>Attacked more aggressively by the opponent</li>
                    <li>Psychologically stressful (fear of double faulting)</li>
                </ul>
                <p>Therefore, a healthy first serve percentage is directly correlated with "Holding Serve" (winning the game where you serve).</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate It Correctly</h2>
                <p>The math is straightforward, but data collection requires focus:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Percentage = (First Serves Made / Total First Serve Attempts) × 100
                    </p>
                </div>

                <p><strong>Example Scenario:</strong></p>
                <p>In a single set, you played 40 points on your serve. On 24 of those points, your first serve landed in. On 16 points, you missed the first serve (fault) and had to hit a second serve.</p>
                <p>Your calculation: 24 / 40 = 0.60 or <strong>60%</strong>.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Industry Benchmarks: What Should You Aim For?</h2>
                <p>Benchmarks vary significantly by skill level and playing style (e.g., big servers vs. tactical servers).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Professional Level (ATP/WTA)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>ATP Tour Average:</strong> Typically around <strong>60-65%</strong>. Elite servers like Roger Federer or Novak Djokovic often hover around 65-70%. Players who rely on massive power (like John Isner) might be slightly lower (60-65%), accepting more faults for the sake of unreturnable power.</li>
                    <li><strong>WTA Tour Average:</strong> Generally slightly higher, around <strong>65-70%</strong>. Placement is often prioritized slightly more than raw velocity compared to the men's game.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Club / Recreational Level</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Beginner (NTRP 2.5 - 3.0):</strong> Aim for <strong>50%</strong>. Just getting the ball in is the priority to avoid double faults.</li>
                    <li><strong>Intermediate (NTRP 3.5 - 4.0):</strong> Aim for <strong>55-60%</strong>. You are starting to add pace, which naturally lowers consistency.</li>
                    <li><strong>Advanced (NTRP 4.5+):</strong> Aim for <strong>60-70%</strong>. You need high reliability to prevent opponents from attacking your second serve.</li>
                </ul>

                <hr />

                {/* STRATEGY */}
                <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Strategic Trade-Off: The "Goldilocks" Zone</h2>
                <p>Many players mistakenly believe 100% is the goal. It is not. If your first serve percentage is 90%+, it likely means your serve is too soft and easy to hit. You aren't taking enough risk.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The 65% Sweet Spot</h3>
                <p>Ideally, you want your percentage to be around <strong>60-70%</strong>. This indicates you are:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Hitting the ball hard enough to disturb the opponent.</li>
                    <li>Aiming near the lines/corners.</li>
                    <li>Accepting a reasonable margin of error (3-4 misses out of 10) to gain free points (aces/winners).</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">When to Adjust</h3>
                <p><strong>Raise your percentage (take off pace/add spin) if:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>You are double-faulting frequently.</li>
                    <li>Your opponent is struggling to return even your moderate serves.</li>
                    <li>It is a crucial point (30-30 or Break Point Down).</li>
                </ul>

                <p><strong>Lower your percentage (go for big flat serves) if:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>You are up 40-0 or 40-15.</li>
                    <li>Your opponent is killing your "safe" first serves.</li>
                    <li>You need a free point and your rhythm feels good.</li>
                </ul>

                <hr />

                {/* RISKS */}
                <h2 id="risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risks of Poor First Serve Management</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Low Percentage (Below 50%)</h3>
                <p>The primary risk is the <strong>Second Serve Liability</strong>. When you miss more than half your first serves:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>The returner steps inside the baseline, aggressive and confident.</li>
                    <li>You start the point on defense, running side-to-side immediately.</li>
                    <li>Mental fatigue sets in from constantly playing high-stress second serve points.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Super High Percentage (Above 80%)</h3>
                <p>This is the "dinker" trap. While you never double fault, you also never get free points. Good returners will realize they can tee off on your first serve because it carries no threat, effectively turning your service game into a 50/50 neutral rally immediately.</p>

                <hr />

                {/* IMPROVEMENT */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Your Serve Accuracy</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. The Toss is King</h3>
                <p>90% of serve errors come from a bad toss. If the toss is too low, you hit the net. If it's too far back, you hit it long or wide. Practice tossing the ball so it lands in the exact same spot (slightly in front of you and to the right for right-handers) every time. Don't be afraid to catch a bad toss and reset.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Use Spin for Safety</h3>
                <p>Flat serves have very little margin for error—they must clear the net and dip quickly. <strong>Slice</strong> and <strong>Kick</strong> serves use the Magnus Effect (spin) to curve the ball into the box. Adding slice to your first serve allows you to aim higher over the net while still keeping the ball in.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Balance & Knee Bend</h3>
                <p>Inconsistency often comes from moving the head or collapsing the body during the swing. Keep your head up and use a rhythmic knee bend to drive up into the ball. A stable base leads to a reproducible contact point.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Aim for Big Targets</h3>
                <p>Instead of aiming for the the paint on the lines, aim 1-2 feet inside the line. This "margin of safety" means that if you miss your spot slightly, the ball is still good. Professional players pick specific targets, but they aren't always aiming for the absolute edge unless necessitated by the score.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about tennis serving stats
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a higher first serve percentage guarantee a win?</h4>
                            <p className="text-muted-foreground">
                                No. While it helps significantly, placement and what happens <em>after</em> the serve matter too. If you serve 80% but hit soft balls that get crushed for winners, you will still lose. The goal is a high percentage of <em>effective</em> serves.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does the "Second Serve" affect this math?</h4>
                            <p className="text-muted-foreground">
                                This calculator focuses strictly on the <em>First Serve</em>. However, there is a separate metric called "Second Serve Points Won." If you have a dominant second serve (like a heavy kick serve), you can afford a lower first serve percentage because missing the first isn't a disaster.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should I hit my first serve as hard as I can?</h4>
                            <p className="text-muted-foreground">
                                Rarely. Think of your serve in gears. "Gear 1" is a spinner (safe). "Gear 2" is a solid 80% power placement serve. "Gear 3" is the flat bomb (100% power). You should spend most of your time in "Gear 2," saving "Gear 3" for when you are ahead in the score and can afford the risk.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a "Let" and does it count?</h4>
                            <p className="text-muted-foreground">
                                A "Let" occurs when the serve hits the net cord but still lands in the box. In this case, you replay the serve. It does <strong>not</strong> count as an attempt or a make. It is essentially a null event in statistical terms.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do I track this during a match?</h4>
                            <p className="text-muted-foreground">
                                It's hard to track mentally while playing. Most players have a coach, friend, or smart court system (like SwingVision) track it for them. Alternatively, you can record your match and chart it later to get accurate data.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is my percentage lower on clay vs. hard court?</h4>
                            <p className="text-muted-foreground">
                                Technically, it shouldn't be, but tactically it changes. On clay, serves are slower, so players might try to hit harder (risking more) to get the ball through the court. Conversely, on grass, the serve is so dominant that players might focus purely on location rather than raw power.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is 50% first serve percentage bad?</h4>
                            <p className="text-muted-foreground">
                                It is considered below average for competitive play. At 50%, you are playing half your service points on your second serve. Unless your second serve is world-class, this puts you in a statistical deficit that makes holding serve very difficult.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the "Ace" relationship?</h4>
                            <p className="text-muted-foreground">
                                Aces are great, but they are rare. A player chasing aces usually has a lower first serve percentage (e.g., 55%). A player chasing "unreturnables" (serve is touched but creates an error) or weak returns usually has a higher percentage (65%). The latter is often a more sustainable strategy for winning matches.
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
                                    <strong className="block text-primary mb-1">Competitive Players</strong>
                                    <span className="text-sm text-muted-foreground">Analyze post-match data to find weaknesses in your service games.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Tennis Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Show students objective data on why they need to improve their toss or spin.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Parents</strong>
                                    <span className="text-sm text-muted-foreground">Track stats for junior players to help them focus on consistency over power.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Bettors & Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate a player's current form and reliability before a match.</span>
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
                                The Tennis First Serve Percentage Calculator provides a clear snapshot of your service game's reliability.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By maintaining a percentage between 60-70%, you maximize your chances of holding serve, keeping the opponent defensive, and controlling the tempo of the match.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
