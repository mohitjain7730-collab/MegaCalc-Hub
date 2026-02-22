import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Target, Zap, Activity } from 'lucide-react';
import TennisAcesPerMatchCalculatorInteractive from './tennis-aces-per-match-calculator-interactive';

export default function TennisAcesPerMatchCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Tennis Aces per Match Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your average aces per match to measure your serving dominance and free-point potential.
                </p>
            </div>

            <TennisAcesPerMatchCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        The raw numbers behind serving power
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Total Aces
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The cumulative number of aces hit across all matches.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>An ace is a legal serve that is not touched by the receiver</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>"Service Winners" (touched but not returned) do not count</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Trophy className="h-4 w-4" />
                                Matches Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of matches included in your ace count.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Consistent format (e.g., all Best of 3 sets) provides the best data</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Does not include practice tie-breaks</span>
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
                            Aces Per Match = Total Aces / Matches Played
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This metric quantifies "Free Points" — the points you win without a rally. A high number here indicates you can rely on your serve to bail you out of trouble, reducing the physical toll of long rallies.
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
                        Tools for serve and match analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/tennis-first-serve-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">First Serve %</p>
                                            <p className="text-sm text-muted-foreground">Accuracy vs Power</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-win-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Win Ratio</p>
                                            <p className="text-sm text-muted-foreground">Overall success</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/bowling-strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Bowling Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Cricket wicket rate</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-goals-per-90-minutes-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Goals Per 90</p>
                                            <p className="text-sm text-muted-foreground">Scoring frequnecy</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-break-point-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Break Point Rate</p>
                                            <p className="text-sm text-muted-foreground">Clutch stats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Cricket scoring</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Aces per Match in Tennis: Benchmarks and Techniques" />
                <meta itemProp="description" content="Learn how to calculate and improve your aces per match. Analyze the dominance of top servers and understand the biophysics of hitting more aces." />
                <meta itemProp="keywords" content="tennis aces, aces per match, tennis serve speed, serve technique, Isner stats, Karlovic stats, tennis betting stats" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Aces Per Match: The Ultimate Measure of Serve Dominance</h2>
                <p className="text-lg italic text-muted-foreground">An ace is the most demoralizing shot in tennis. It ends the point before it begins, leaving the opponent helpless. Tracking your aces per match reveals exactly how dominant your service game truly is.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What Qualifies as an Ace?</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: The Giants vs. The Rest</a></li>
                    <li><a href="#science" className="hover:underline">The Science of Hitting Aces</a></li>
                    <li><a href="#tactics" className="hover:underline">Tactical Aces: Placement Over Power</a></li>
                    <li><a href="#limitations" className="hover:underline">Why Aces Aren't Everything</a></li>
                    <li><a href="#improvement" className="hover:underline">Drills to Increase Your Ace Count</a></li>
                </ul>
                <hr />

                {/* WHAT IS AN ACE */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Qualifies as an Ace?</h2>
                <p>In tennis, an <strong>Ace</strong> is a legal serve that touches the court in the service box and is not touched by the receiver's racquet.</p>
                <p>If the receiver touches the ball but fails to return it (e.g., shanks it into the fence), it is a <strong>Service Winner</strong> (or unreturned serve), not an ace. This distinction is crucial for accurate statistics.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: The Giants vs. The Rest</h2>
                <p>Understanding what constitutes a "high" number of aces depends entirely on the level of play and, frankly, the height of the player.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Outliers: Serve Bots</h3>
                <p>Players like John Isner, Ivo Karlovic, and Reilly Opelka are statistical anomalies. They average:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>15-20+ Aces per Match</strong> (Best of 3 sets)</li>
                    <li><strong>20-40+ Aces per Match</strong> (Best of 5 sets)</li>
                </ul>
                <p>Do not compare yourself to them unless you are 6'10". Their height creates a trajectory angle that is physically impossible for shorter players to replicate.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Elite Standard (ATP/WTA)</h3>
                <p>For top-tier players who are not "serve bots" (e.g., Federer, Djokovic, Serena Williams):</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Men:</strong> Average <strong>5-10 aces</strong> per match (Best of 3).</li>
                    <li><strong>Women:</strong> Average <strong>3-6 aces</strong> per match. The women's game relies more on placement and unreturned serves than pure aces.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Club Level Reality</h3>
                <p>For recreational players:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>0-1 aces:</strong> Typical for beginners/intermediates. Only occur on lucky mishits by the opponent.</li>
                    <li><strong>2-4 aces:</strong> Strong server for club level. Likely has a decent flat first serve.</li>
                    <li><strong>5+ aces:</strong> Exceptional. You are likely "serving down" a level or have a specific weapon (like a lefty slice) that opponents can't read.</li>
                </ul>

                <hr />

                {/* SCIENCE */}
                <h2 id="science" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Science of Hitting Aces</h2>
                <p>Hitting an ace is a physics problem. It involves three variables:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Velocity</h3>
                <p>The faster the ball, the less reaction time the receiver has. At 120mph, the ball travels the length of the court in about 0.4 seconds. Human reaction time is around 0.2 seconds. This leaves only 0.2 seconds to move the racquet.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Accuracy (Spot Serving)</h3>
                <p>Velocity means nothing if it's hit right at the opponent. Aces are usually hit within 6 inches of the lines (T, Wide, or BodyJam). Hitting the "T" line is the shortest distance to the net, often resulting in the fastest aces.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Disguise</h3>
                <p>The most underrated factor. If your toss is the same for your flat, slice, and kick serves, the opponent cannot "read" the serve early. Federer was a master of this—hitting aces at only 115mph simply because the opponent leaned the wrong way.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Aces Aren't Everything</h2>
                <p>While aces are flashy, chasing them can be detrimental to your actual win rate.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Double Fault Tax</h3>
                <p>To hit an ace, you must aim for the lines and hit flat. This drives down your First Serve Percentage. If you hit 10 aces but also 10 double faults, you have gained net zero points but wasted a huge amount of opportunities. A boring serve body-serve that wins the point 80% of the time is statistically superior to an erratic ace-or-nothing approach.</p>

                <hr />

                {/* IMPROVEMENT */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Drills to Increase Your Ace Count</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Target Practice</h3>
                <p>Place a pyramid of balls or a cone in the corner of the service box. Do not leave the court until you hit it 5 times. This trains you to aim for the corners, not just the general "box."</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The "T" Drill</h3>
                <p>The serve down the T is the highest percentage ace serve because the net is lowest in the middle. Spend 70% of your practice time mastering the flat serve down the T.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Pronation Snap</h3>
                <p>Speed comes from the racquet head snap (pronation) at the top of the motion, not from arm muscularity. Practice serving with a loose wrist to maximize that "whip" effect.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about tennis aces
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the record for most aces in a match?</h4>
                            <p className="text-muted-foreground">
                                John Isner holds the record with a staggering 113 aces in his famous 2010 Wimbledon match against Nicolas Mahut (who hit 103). This was a freak occurrence over 11 hours of play, but it highlights the extreme end of serving dominance.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does hitting the net cord nullify an ace?</h4>
                            <p className="text-muted-foreground">
                                Yes. If the ball hits the net cord and lands in, it is a "Let." You must replay the serve. You cannot win a point on a let serve.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is it easier to hit an ace on clay or grass?</h4>
                            <p className="text-muted-foreground">
                                Grass. The ball skids low and retains speed, making it harder to return. Clay slows the ball down and bounces it high, giving the receiver more time to react. This is why ace counts drop significantly during the clay season.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can I hit an ace with a second serve?</h4>
                            <p className="text-muted-foreground">
                                Absolutely. In fact, "Second Serve Aces" are psychologically devastating to opponents who often step in expecting a weak shot. A surprise kick serve that jumps over their shoulder is a common way to ace on a second serve.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do underarm serves count as aces?</h4>
                            <p className="text-muted-foreground">
                                Yes. If you hit an underarm serve and the opponent doesn't touch it, it is statistically recorded as an ace. Nick Kyrgios and Alexander Bublik have popularized this tactic to catch opponents standing too far back.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why am I not hitting any aces?</h4>
                            <p className="text-muted-foreground">
                                You are likely telegraphing your serve (bad toss) or serving too much to the middle of the box. Try tossing the ball more in front of you and aiming specifically for the lines, accepting that you might miss a few wide.
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
                            <h3 className="font-semibold text-lg mb-3">Who Should Use This?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Big Servers</strong>
                                    <span className="text-sm text-muted-foreground">Track if your primary weapon is actually delivering free points as expected.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Determine if a player should focus on power or consistency based on ace rate.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Sports Bettors</strong>
                                    <span className="text-sm text-muted-foreground">Ace totals are a popular prop bet; knowing historical averages is key.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Data Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Compare performance across different surfaces and tournaments.</span>
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
                                The Tennis Aces per Match Calculator helps you quantify the effectiveness of your serve.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                While aces are not the only way to win, a healthy ace count indicates a strong, well-placed delivery that puts you in control of your service games.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
