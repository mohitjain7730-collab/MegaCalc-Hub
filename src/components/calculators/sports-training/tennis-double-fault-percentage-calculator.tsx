import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users } from 'lucide-react';
import TennisDoubleFaultPercentageCalculatorInteractive from './tennis-double-fault-percentage-calculator-interactive';

export default function TennisDoubleFaultPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Tennis Double Fault Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your double fault rate to measure serve reliability and minimize free points given to opponents.
                </p>
            </div>

            <TennisDoubleFaultPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for calculating double fault percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Activity className="h-4 w-4" />
                                Total Service Points Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of points where you were the server, regardless of the outcome.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes aces, service winners, and faults</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Count every point started (0-0, 15-0, etc.)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Total Double Faults
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of times you missed both the first and second serve, resulting in a lost point.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Missing the service box on the second serve</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Missing the ball or foot faulting on the second serve</span>
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
                            Double Fault % = (Total Double Faults / Total Service Points Played) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This formula expresses the frequency of double faults as a percentage of all points served. It is a direct measure of "unforced errors" on the serve itself.
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
                        Explore other tennis performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/tennis-win-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Win Ratio</p>
                                            <p className="text-sm text-muted-foreground">Match success rate</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/tennis-aces-per-match-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Aces Per Match</p>
                                            <p className="text-sm text-muted-foreground">Serve dominance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/tennis-break-point-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Break Point Conversion</p>
                                            <p className="text-sm text-muted-foreground">Clutch performance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/tennis-first-serve-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">First Serve %</p>
                                            <p className="text-sm text-muted-foreground">Serve consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/tennis-serve-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Serve Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Placement precision</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/basketball-free-throw-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Free Throw %</p>
                                            <p className="text-sm text-muted-foreground">Set piece accuracy</p>
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
                <meta itemProp="name" content="The Complete Guide to Tennis Double Fault Percentage: Analysis, Prevention, and Improvement" />
                <meta itemProp="description" content="A comprehensive guide to understanding double fault percentage in tennis, benchmarking against ATP/WTA standards, and implementing strategies to reduce service errors." />
                <meta itemProp="keywords" content="tennis double fault percentage, tennis serve stats, reduce double faults, second serve strategy, tennis analytics, serve consistency" />
                <meta itemProp="author" content="MegaCalc Tennis Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Tennis Double Fault Percentage: Mastering Service Reliability</h2>
                <p className="text-lg italic text-muted-foreground">Eliminate the most costly error in tennis and build a rock-solid second serve that holds up under pressure.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Double Fault Percentage?</a></li>
                    <li><a href="#importance" className="hover:underline">The High Cost of Free Points</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks (ATP, WTA, Club)</a></li>
                    <li><a href="#mechanics" className="hover:underline">Technical Causes of Double Faults</a></li>
                    <li><a href="#psychology" className="hover:underline">The Mental Game: Handling "The Yips"</a></li>
                    <li><a href="#strategy" className="hover:underline">Strategic Adjustments to Lower DF%</a></li>
                    <li><a href="#drills" className="hover:underline">Drills for Second Serve Consistency</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Double Fault Percentage?</h2>
                <p><strong>Double Fault Percentage (DF%)</strong> is a statistic that measures the frequency with which a player loses a point directly due to failing to land a legal serve. In tennis, a player gets two chances to start a point; missing both is a "double fault," resulting in an immediate point for the opponent.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Calculation</h3>
                <p>Unlike some other stats that can be calculated in different ways, DF% is almost universally calculated as:</p>
                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        (Total Double Faults / Total Service Points Played) × 100
                    </p>
                </div>
                <p>For example, if you play 60 points on your serve in a set and hit 3 double faults, your DF% is 5%.</p>

                <hr />

                {/* IMPORTANCE */}
                <h2 id="importance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The High Cost of Free Points</h2>
                <p>Double faults are often called "free points" because the opponent has to do absolutely nothing to win them. High double fault rates are devastating for several reasons:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Momentum Killers</h3>
                <p>A double fault does more than just award a point; it often halts momentum. serving an ace or a winner builds confidence, while a double fault is deflating. Following a long rally or a great winner with a double fault often negates the psychological advantage gained.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Starting Behind</h3>
                <p>If you average one double fault per game, you are effectively starting every service game at 0-15. This forces you to play "catch up" constantly, exerting more energy and taking more risks in rallies to compensate.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Signaling Weakness</h3>
                <p>A high double fault count tells your opponent that your serve is fragile. They will likely stand closer to the baseline, attack your second serves more aggressively, and play with more confidence, knowing you might self-destruct.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Industry Benchmarks: What is "Normal"?</h2>
                <p>Context is crucial. An aggressive server hitting 130mph bombs will naturally have more double faults than a "pusher" who dinks the ball in. However, data from the ATP and WTA tours gives us clear standards:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <h4 className="font-bold text-lg mb-2">ATP Tour (Men's Pro)</h4>
                        <ul className="space-y-2 text-sm">
                            <li><strong>Average:</strong> ~3-4%</li>
                            <li><strong>Excellent:</strong> &lt; 2% (e.g., Novak Djokovic, Rafael Nadal)</li>
                            <li><strong>High Risk:</strong> &gt; 5% (Big servers like Alexander Zverev or John Isner often fluctuate here)</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                        <h4 className="font-bold text-lg mb-2">WTA Tour (Women's Pro)</h4>
                        <ul className="space-y-2 text-sm">
                            <li><strong>Average:</strong> ~4-5%</li>
                            <li><strong>Excellent:</strong> &lt; 3%</li>
                            <li><strong>High Risk:</strong> &gt; 7% (Aggressive returners force riskier second serves)</li>
                        </ul>
                    </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Recreational Levels</h3>
                <p>For club players and juniors, the numbers are often higher due to less consistent technique:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Beginner (NTRP 2.5 - 3.0):</strong> 10%+ is common. The serve is often just a way to start the point.</li>
                    <li><strong>Intermediate (NTRP 3.5 - 4.0):</strong> 5-8%. Players are developing spin but struggle under pressure.</li>
                    <li><strong>Advanced (NTRP 4.5+):</strong> 3-5%. Similar consistency to pros, though with less pace and spin.</li>
                </ul>

                <hr />

                {/* MECHANICS */}
                <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Technical Causes of Double Faults</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. The Toss</h3>
                <p>The ball toss is the most critical variable. If the toss is inconsistent (too far forward, back, left, or right), the swing path must adjust mid-air. A toss that is too low forces the ball into the net; a toss too far back often leads to balls landing long.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Decelerating the Swing</h3>
                <p>A common mistake on second serves is slowing down the racquet head speed to "control" the ball. This is counter-intuitive. <strong>Spin comes from racquet head speed.</strong> Slowing down reduces spin (topspin), which is the force that dips the ball into the court. Slow swings lead to flat, floating errors.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Grip Tension</h3>
                <p>Tight muscles cannot produce fluid motion. When players get nervous, they strangle the racquet handle. This locks the wrist, preventing the "snap" needed for kick or slice, resulting in rigid, flat errors.</p>

                <hr />

                {/* STRATEGY */}
                <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Adjustments to Lower DF%</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Topspin is Your Best Friend</h3>
                <p>The "Kick Serve" or heavy topspin serve creates a high arc over the net. While a flat serve might clear the net by 6 inches, a topspin serve can clear it by 2-3 feet and still drop in due to the Magnus effect. Learning a kick serve is the fastest way to drop your DF% from 10% to 3%.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Aim for Big Targets</h3>
                <p>On a second serve, aiming for the lines is suicide. Strategy experts recommend aiming for "big targets"—essentially, the middle of the service box or a large zone 2-3 feet inside the lines. This margin for error accounts for toss variance and nerves.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The "Two First Serves" Fallacy</h3>
                <p>Some players hit their second serve as hard as their first. While this prevents the opponent from attacking, the math rarely works out. Unless your first serve percentage is over 70%, the cumulative risk of two hard serves usually results in more lost points via double faults than points won via unreturnables.</p>

                <hr />

                {/* PSYCHOLOGY */}
                <h2 id="psychology" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mental Game: Handling "The Yips"</h2>

                <p>Double faults often come in bunches. This is because they are uniquely psychological. Unlike a forehand error forced by an opponent's speed, the serve is entirely in your control. This solitude breeds anxiety.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Routine is the Cure</h3>
                <p>Watch any pro: Nadal picking his shorts, Djokovic bouncing the ball 15 times. These are not just quirks; they are re-set mechanisms. A consistent pre-serve routine (e.g., "Bounce, Bounce, Breathe, Look") occupies the conscious mind, preventing panic and allowing muscle memory to take over.</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Your Double Fault Percentage is a barometer of your mental composure and technical stability. While hitting aces is glamorous, reducing double faults is often the more efficient path to winning matches. By understanding the risk/reward mechanics, developing a reliable topspin second serve, and managing your mental state, you can transform your service game from a liability into a fortress.</p>
                <p>Use this calculator to track your progress over a season. Aim to keep your DF% below 5%, and you will immediately see an improvement in your match win rate.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about double faults and serving consistency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is considered a "bad" double fault percentage?</h4>
                            <p className="text-muted-foreground">
                                Generally, anything above 8-9% is problematic for competitive tennis. It effectively means you are donating nearly one game per set to your opponent. For professional standards, anything consistently above 5% is considered a weakness to be exploited.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is it ever okay to have a high double fault rate?</h4>
                            <p className="text-muted-foreground">
                                Occasionally, yes. "Big servers" who rely on massive aces (like John Isner or Nick Kyrgios) accept a higher DF rate (sometimes 5-7%) as the "cost of doing business." Their strategy relies on the fact that when the serve lands, it wins the point, justifying the higher error rate. For most players, however, this trade-off is not mathematically favorable.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does this calculator include Foot Faults?</h4>
                            <p className="text-muted-foreground">
                                Yes. A foot fault counts exactly the same as hitting the ball into the net. If you foot fault on a second serve, it is a double fault. Statistically, it should be included in your total count.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do I stop double faulting on break points?</h4>
                            <p className="text-muted-foreground">
                                This is usually a mental issue rather than technical. The key is to rely on "Safety Spin." Don't just push the ball; hit up on the ball with spin. Spin brings the ball down into the court. Aim for the "fat" part of the box rather than the lines, and focus on your breathing routine before the toss.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why do I double fault more into the net than long?</h4>
                            <p className="text-muted-foreground">
                                Net faults usually indicate a toss that is too far forward or too low, or "collapsing" the chest/head too early during the swing. Faulting long usually suggests a toss too far back or a lack of topspin (racquet face too open).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should I use an underarm serve to avoid double faulting?</h4>
                            <p className="text-muted-foreground">
                                If you are completely losing the ability to serve due to the yips, an underarm serve is permitted by the rules to get the point started. However, at higher levels, a weak underarm serve will be crushed for a winner. It is a temporary band-aid, not a long-term solution.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does wind affect double faults?</h4>
                            <p className="text-muted-foreground">
                                Drastically. The ball toss is lightweight and easily moved by wind. In windy conditions, you should lower your toss height (to reduce wind exposure) and aim for safer, larger targets. Pros often increase their margin for error by 20-30% in windy conditions.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How many double faults per match is normal?</h4>
                            <p className="text-muted-foreground">
                                In a standard 2-set match (approx. 60-70 service points), 2-4 double faults is normal and acceptable. 0-1 is excellent. 6+ starts to become a significant liability.
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
                                    <strong className="block text-primary mb-1">Competitive Juniors</strong>
                                    <span className="text-sm text-muted-foreground">Track consistency over tournament weekends to identify mental fatigue.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Tennis Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Show students concrete data to justify technical changes (e.g., "See, your flat second serve is costing us 15% of points").</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">League Players</strong>
                                    <span className="text-sm text-muted-foreground">Analyze matches to see if you are losing because of your opponent's skill or your own errors.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Data Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Compare player reliability across different surfaces (Clay vs. Grass).</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                                <li><strong>Doesn't measure serve quality:</strong> A player with 0% double faults might still lose because they are serving soft "lollipops" that get crushed.</li>
                                <li><strong>Context blind:</strong> A double fault at 40-0 is far less damaging than a double fault at Break Point Down, but this calculator treats them equally.</li>
                                <li><strong>Returner pressure:</strong> Facing a world-class returner forces you to aim closer to the lines, naturally increasing errors. This stat doesn't account for opponent quality.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold">Case Study A: The "Safe" Server</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Player A hits 60 serves and makes 0 double faults. However, their serve is very slow. They lose the match because the opponent attacks every serve. <strong>Lesson:</strong> Low DF% is good, but not if it sacrifices all competitive advantage.</p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold">Case Study B: The "Wild" Server</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Player B hits 60 serves, makes 8 double faults (13.3%), but also hits 15 aces. They win the match. <strong>Lesson:</strong> High specific risk can be acceptable if the reward (aces/service winners) outweighs the cost.</p>
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
                                The Tennis Double Fault Percentage Calculator helps players diagnose the stability of their service game.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By quantifying unforced errors on the serve, it highlights the need for reliable second-serve mechanics (like topspin) and mental routines, ultimately helping players stop defeating themselves before the rally even begins.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
