import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Flag, Activity, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Target, Users, Shield, TrendingUp, TrendingDown, Crosshair, Trophy } from 'lucide-react';
import FootballOffsideFrequencyCalculatorInteractive from './football-offside-frequency-calculator-interactive';

export default function FootballOffsideFrequencyCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football Offside Frequency Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Analyze player discipline and timing. Calculate "Offsides Per 90" to determine if a forward is aggressive or just wasteful.
                </p>
            </div>

            <FootballOffsideFrequencyCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Stats
                    </CardTitle>
                    <CardDescription>
                        Why monitoring offside counts matters for player development
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <Flag className="h-4 w-4" />
                                The Impact of Offsides
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                An offside is an instant turnover. While some great strikers live "on the shoulder," too many flags indicate a lack of awareness.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>Kills momentum of counter-attacks</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>Relieves pressure on the opponent's defense</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                The Aggression Trade-off
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Some offsides are "good" misses—they show the striker is trying to stretch the play. The key is the ratio.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Elite strikers often avg 0.6 - 0.9 per 90</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Timing improves with chemistry (passer/runner)</span>
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
                            Offsides Per 90 = (Total Offsides / Minutes Played) × 90
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This standardizes the statistic. A substitute who plays 10 minutes and is offside twice is statistically far less disciplined than a starter who plays 90 minutes and is offside twice.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Football Calculators
                    </CardTitle>
                    <CardDescription>
                        Optimize other areas of your game
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/football-goals-per-90-minutes-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Goals Per 90</p>
                                            <p className="text-sm text-muted-foreground">Scoring efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-shot-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Crosshair className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Shot Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Shooting precision</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Win Rate</p>
                                            <p className="text-sm text-muted-foreground">Team success %</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-expected-goals-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">xG Calculator</p>
                                            <p className="text-sm text-muted-foreground">Quality of chances</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-assists-per-90-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Assists Per 90</p>
                                            <p className="text-sm text-muted-foreground">Playmaker stats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-fantasy-points-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Fantasy Points</p>
                                            <p className="text-sm text-muted-foreground">FPL Scoring</p>
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
                <meta itemProp="name" content="Mastering the Offside Line: A Guide to Timing, Frequency, and Tactical Analysis" />
                <meta itemProp="description" content="Learn how to analyze offside frequency in football. Understand why elite strikers still get flagged, how to beat the offside trap, and improve your timing." />
                <meta itemProp="keywords" content="football offside calculator, offsides per 90, beating the offside trap, striker positioning, football tactical analysis" />
                <meta itemProp="author" content="MegaCalc Football Analysis Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Art of Timing: Analyzing Offside Frequency in Modern Football</h2>
                <p className="text-lg italic text-muted-foreground">"Born offside"—a phrase used to describe players who live on the edge. But is being flagged frequently a sign of ineptitude or a necessary byproduct of aggression? Let's analyze the numbers.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Offside Frequency?</a></li>
                    <li><a href="#trap" className="hover:underline">The Psychology of the Offside Trap</a></li>
                    <li><a href="#stats" className="hover:underline">Benchmarking: How Much is Too Much?</a></li>
                    <li><a href="#var" className="hover:underline">The VAR Effect on Timing</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Stay Onside</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Offside Frequency?</h2>
                <p><strong>Offside Frequency</strong> measures how often a player is penalized for being in an offside position per unit of time (usually per 90 minutes). It is a metric of <em>discipline</em> and <em>spatial awareness</em>.</p>
                <p>In the modern game, with high defensive lines (e.g., Liverpool or Bayern Munich), the space behind the defense is compressed. Strikers must time their runs to the millisecond.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Why Monitor It?</h3>
                <p>Coaches monitor this stat to identify:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Wastefulness:</strong> A player flagged 3 times a game is killing 3 potential attacks.</li>
                    <li><strong>Chemistry Issues:</strong> Often, offsides occur because the pass was delayed, not because the run was early.</li>
                    <li><strong>Fatigue:</strong> Mental fatigue often leads to lazy recovery runs, resulting in passive offsides.</li>
                </ul>

                <hr />

                {/* THE TRAP */}
                <h2 id="trap" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Psychology of the Offside Trap</h2>
                <p>Defenses use the offside trap as a weapon. By stepping up in unison just as the passer lifts their head, they render the space behind them unplayable. A striker with a high offside frequency often falls victim to this specific tactic.</p>
                <p>Legendary forwards like Filippo Inzaghi or Javier Hernandez made careers out of playing on the shoulder of the last defender. They accepted that being flagged 5 times was worth it if the 6th run resulted in a goal.</p>

                <hr />

                {/* STATS */}
                <h2 id="stats" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarking: How Much is Too Much?</h2>
                <p>Using data from top 5 European leagues, we can categorize strikers:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-primary/10">
                            <tr>
                                <th className="px-6 py-3">Frequency (Per 90)</th>
                                <th className="px-6 py-3">Interpretation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="px-6 py-4 font-mono">0.0 - 0.3</td>
                                <td className="px-6 py-4">Very Disciplined / Passive</td>
                            </tr>
                            <tr className="border-b">
                                <td className="px-6 py-4 font-mono">0.4 - 0.8</td>
                                <td className="px-6 py-4">Standard / Balanced</td>
                            </tr>
                            <tr className="border-b">
                                <td className="px-6 py-4 font-mono">0.9 - 1.5</td>
                                <td className="px-6 py-4">Aggressive / "Shoulder" Player</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-mono">1.6+</td>
                                <td className="px-6 py-4 text-red-600 font-bold">Problematic / Wasteful</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr />

                {/* VAR */}
                <h2 id="var" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The VAR Effect on Timing</h2>
                <p>The introduction of Video Assistant Referees (VAR) has fundamentally changed how offside is officiated. Previously, "benefit of the doubt" often went to the attacker. Now, offsides are measured to the millimeter.</p>
                <p>This has forced strikers to delay their runs slightly. The "margin for error" has vanished. Data shows a slight increase in offside calls in leagues immediately following VAR implementation as players adjusted.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Stay Onside</h2>
                <p>Improving your offside frequency isn't just about running later; it's about running smarter.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Curved Runs</h3>
                <p>Instead of running in a straight line, curve your run horizontally along the defensive line. This allows you to maintain sprinting speed while looking across the line, ready to dart forward the moment the ball is played.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. The "Passive" Start</h3>
                <p>Start from a deeper position. It is easier to accelerate into space than to decelerate to stay onside. Giving yourself 2 yards of buffer allows you to react to a delayed pass without being flagged.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Eye Contact</h3>
                <p>Watch the passer, not just the ball. The trigger to run is the moment the passer's threatening leg swings back, not when the ball leaves their foot (which is often too late to build momentum).</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>The Football Offside Frequency Calculator is a diagnostic tool. It tells you if a player is too eager or perfectly poised. While zero offsides might sound ideal, it often suggests a player who isn't threatening the space behind.</p>
                <p>The goal is not to eliminate offsides completely, but to optimize them—ensuring that every flag raised was the result of a calculated risk to score, not a lack of concentration.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about the offside rule and stats
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does being offside count if I don't touch the ball?</h4>
                            <p className="text-muted-foreground">
                                Yes, if you interfere with play or an opponent. If you block the goalkeeper's view or make a movement that distracts a defender, you can be penalized for offside without touching the ball. However, purely "passive" offsides where a player is inactive are not flagged and do not count in statistics.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the most offsides in history?</h4>
                            <p className="text-muted-foreground">
                                Historically, players who played on the shoulder of the last defender like Filippo Inzaghi, Emmanuel Adebayor, and more recently Timo Werner or Darwin Nunez often top the offside charts. It is a trait of poachers and speedsters.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is offside determined by feet or any body part?</h4>
                            <p className="text-muted-foreground">
                                Any part of the body that can legally score a goal (head, body, feet) counts for offside. Arms and hands do not count. If your head is beyond the last defender, you are offside, even if your feet are level.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can you be offside from a goal kick?</h4>
                            <p className="text-muted-foreground">
                                No. You cannot be offside from a goal kick, a throw-in, or a corner kick. This is a common tactical loophole teams use to send speedy wingers deep downfield immediately.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is "Semi-Automated Offside Technology" (SAOT)?</h4>
                            <p className="text-muted-foreground">
                                SAOT is a system used in competitions like the World Cup and Champions League. It uses cameras to track 29 data points on each player and a sensor in the ball to detect the exact moment of the pass, making offside decisions faster and more accurate than manual VAR lines.
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
                                    <strong className="block text-primary mb-1">Strikers & Wingers</strong>
                                    <span className="text-sm text-muted-foreground">To self-evaluate if your aggression is hurting the team.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Scouts</strong>
                                    <span className="text-sm text-muted-foreground">To identify disciplined runners vs "raw" pace merchants.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">To back up tactical feedback with hard data during video analysis.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Analysts</strong>
                                    <span className="text-sm text-muted-foreground">To compare players across different leagues and systems.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Case Study:</strong> Player A has 25 offsides in 2000 minutes (1.1 per 90). Player B has 5 offsides in 2000 minutes (0.2 per 90).
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    <strong>Analysis:</strong> Player A sounds wasteful, but if Player A scored 20 goals from runs in behind, the offsides are an acceptable cost of doing business. Player B rarely gets caught, but if they only scored 5 goals, they might be too static. Context is key!
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
                                The Football Offside Frequency Calculator provides a clear metric for positioning discipline.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By normalizing offside counts against minutes played, it allows for fair comparison between players and helps identify those who need to refine their timing to maximize scoring opportunities.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
