import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, Target, Crosshair, Scale, Goal, Users } from 'lucide-react';
import TennisServeAccuracyCalculatorInteractive from './tennis-serve-accuracy-calculator-interactive';

export default function TennisServeAccuracyCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Tennis Serve Accuracy Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Measure the precision of your spot serving to improve tactical dominance and exploit opponent weaknesses.
                </p>
            </div>

            <TennisServeAccuracyCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        How to track your placement accuracy effectively
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Total Targeted Serves
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of serves where you specifically aimed for a distinct zone (e.g., "Out Wide", "Down the T", or "Body").
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Do not count "just getting it in" serves</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Best tracked during specific practice drills</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Crosshair className="h-4 w-4" />
                                Successful Hits to Zone
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of serves that actually landed within the intended target zone.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Define your zone size beforehand (e.g., 2ft from line)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Serves that land "in" but miss the zone count as misses</span>
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
                            Serve Accuracy % = (Successful Zone Hits / Total Targeted Attempts) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This metric isolates <em>precision</em> from <em>consistency</em>. A 100% first serve percentage with zero placement is often less effective than a 60% first serve percentage with laser-like accuracy to the corners.
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
                        More tools to refine your game
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
                                            <p className="text-sm text-muted-foreground">General consistency</p>
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
                                            <p className="text-sm text-muted-foreground">Service errors</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-aces-per-match-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Aces Per Match</p>
                                            <p className="text-sm text-muted-foreground">Serve power</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-win-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Scale className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Win Ratio</p>
                                            <p className="text-sm text-muted-foreground">Overall success</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-shot-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Goal className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Shot Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Football precision</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-three-point-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">3-Point %</p>
                                            <p className="text-sm text-muted-foreground">Basketball range</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Tennis Serve Accuracy: Placement vs Power" />
                <meta itemProp="description" content="Master the art of spot serving in tennis. Learn why placement beats power, how to identify the 9 service zones, and drills to improve your serve accuracy percentage." />
                <meta itemProp="keywords" content="tennis serve accuracy, spot serving, tennis drills, serve placement, tennis strategy, serve zones" />
                <meta itemProp="author" content="MegaCalc Tennis Academy" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Tennis Serve Accuracy: Hitting Your Spots</h2>
                <p className="text-lg italic text-muted-foreground">"Power wins points, but placement wins matches." Discover why accuracy is the most underrated skill in the modern service game.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">Accuracy vs. Consistency: What's the Difference?</a></li>
                    <li><a href="#zones" className="hover:underline">The 3 Critical Serve Zones</a></li>
                    <li><a href="#hierarchy" className="hover:underline">The Hierarchy of Serving Success</a></li>
                    <li><a href="#drills" className="hover:underline">Drills to Improve Precision</a></li>
                    <li><a href="#tactics" className="hover:underline">Tactical Applications of Accuracy</a></li>
                    <li><a href="#tech" className="hover:underline">Technology and Tracking</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Accuracy vs. Consistency: What's the Difference?</h2>
                <p>It is vital to distinguish between two common metrics that are often confused:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <div className="p-4 border rounded bg-background">
                        <h3 className="font-bold text-lg mb-2 text-blue-600">First Serve Percentage (Consistency)</h3>
                        <p>This measures how often your serve lands <em>anywhere</em> in the service box. A 70% first serve stat is great, but if every ball lands right in the middle, a good returner will destroy you.</p>
                    </div>
                    <div className="p-4 border rounded bg-background">
                        <h3 className="font-bold text-lg mb-2 text-green-600">Serve Accuracy (Precision)</h3>
                        <p>This measures how often you hit your <em>intended target</em>. If you aim for the "T" and hit the "T", that is accuracy. If you aim for the "T" and hit the "Wide" line, that is technically a successful serve, but it is 0% accurate relative to your intent, and potentially tactically disastrous.</p>
                    </div>
                </div>

                <hr />

                {/* ZONES */}
                <h2 id="zones" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The 3 Critical Serve Zones</h2>
                <p>Every tennis court's service box is tactically divided into three primary vertical lanes. Mastery of serving requires the ability to hit all three on command.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. The "T" (Center Line)</h3>
                <p><strong>Goal:</strong> To slice the ball down the center line.</p>
                <p><strong>Primary Benefit:</strong> It is the shortest distance to the net (lowest net clearance) and limits the opponent's return angles. It often catches the opponent jamming themselves if they expect a wide ball.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. The Body (Middle)</h3>
                <p><strong>Goal:</strong> To target the returner's right hip (for right-handers).</p>
                <p><strong>Primary Benefit:</strong> The most underused serve in club tennis. A body serve "handcuffs" the opponent, forcing an awkward defensive block. It is highly effective on grass and fast hard courts.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. The Wide (Sideline)</h3>
                <p><strong>Goal:</strong> To pull the opponent off the court.</p>
                <p><strong>Primary Benefit:</strong> Opens up the entire court for your next shot (the "Plus One" shot). Even if the return is good, the opponent is now standing in the alley, leaving the other side of the court completely open.</p>

                <hr />

                {/* HIERARCHY */}
                <h2 id="hierarchy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Hierarchy of Serving Success</h2>
                <p>When developing a serve, players often focus on speed first. This is backwards. The developmental hierarchy should be:</p>

                <ol className="list-decimal ml-6 space-y-4 my-6">
                    <li className="pl-2"><strong>Consistency:</strong> Can you get it in 7/10 times? (If not, nothing else matters).</li>
                    <li className="pl-2"><strong>Placement (Direction):</strong> Can you hit left vs. right?</li>
                    <li className="pl-2"><strong>Depth:</strong> Can you land it deep in the box rather than short?</li>
                    <li className="pl-2"><strong>Spin:</strong> Can you add slice or kick to move the ball?</li>
                    <li className="pl-2"><strong>Power:</strong> Can you hit it hard?</li>
                </ol>
                <p><em>Note: Power is last.</em> A 100mph serve right to the opponent's forehand is often returned faster than it was served. A 85mph slice serve to the corner is often an ace.</p>

                <hr />

                {/* DRILLS */}
                <h2 id="drills" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Drills to Improve Precision</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Pyramid Drill</h3>
                <p>Place a pyramid of 3 balls (or a cone) in each corner of the service box (T and Wide). Serve a basket of balls. Your goal is to hit the target.
                    <br /><strong>Scoring:</strong>
                    <br />- Hit the pyramid: 5 points
                    <br />- Within 1 racquet length: 3 points
                    <br />- Within 2 racquet lengths: 1 point
                    <br />- Miss zone: 0 points
                    <br />Track your points per basket maximize this score over time.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">call Your Shot</h3>
                <p>During practice sets, you must say "T", "Body", or "Wide" out loud before tossing the ball. If you hit an ace wide but called "T", it counts as a fault in your mental tracking (even if you win the point). This forces honest assessment of your control.</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Serve accuracy is the difference between a server who just starts the point and a server who <em>dictates</em> the point. By measuring your accuracy percentage, you move away from the ego-driven metric of speed and towards the effectiveness-driven metric of precision.</p>
                <p>Use this calculator during practice sessions. Set up targets, hit 50 serves, and log your success rate. Aim for 40% accuracy on small targets solely, and watch your hold percentage skyrocket in matches.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Q&A on Serve Accuracy and Placement
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good accuracy percentage?</h4>
                            <p className="text-muted-foreground">
                                This depends entirely on the size of your target. If aiming for a large zone (e.g., the left third of the box), pros hit this 90%+ of the time. If aiming for a small cone in the corner, even pros might only hit the actual cone 10-15% of the time, but will land within a foot of it 60-70% of the time. For club players, hitting a 3-foot wide zone 50% of the time is a great target.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does hitting harder reduce accuracy?</h4>
                            <p className="text-muted-foreground">
                                Yes, significantly. As racquet head speed increases, timing windows decrease. The margin for error on a racquet face angle at 120mph is microscopic compared to 80mph. Beginners should slow down to gain accuracy, then slowly ramp up speed while maintaining that accuracy.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Which serve placement is most important?</h4>
                            <p className="text-muted-foreground">
                                At the club level, the "Body Serve" is statistically the most effective because returners often struggle to get out of the way. At the pro level, the "Wide" serve is crucial to open up the court. However, variety is more important than any single spot; predictability is the enemy.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does the toss affect accuracy?</h4>
                            <p className="text-muted-foreground">
                                The toss dictates direction. A toss to the right (for righties) naturally opens the racquet face for a slice wide. A toss to the left promotes a kick to the T (Ad side). However, elite servers try to use the same toss for all serves ("tunneling") to disguise their intent.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should I aim for the lines?</h4>
                            <p className="text-muted-foreground">
                                Unless you are a high-level competitive player, no. Aiming for the lines provides a very small margin for error. It is better to aim 1-2 feet inside the line. You will still hit a great serve, but your fault rate (and double fault rate) will drop dramatically.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is accuracy more important on First or Second serve?</h4>
                            <p className="text-muted-foreground">
                                Placement is arguably <em>more</em> important on the second serve. On a first serve, you have speed to help you. On a second serve, you are usually hitting slower to ensure it goes in. Without speed, you <em>must</em> have placement (or heavy spin) to prevent the opponent from attacking. A slow, short serve in the middle of the box is a point lost.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is "Serving to the T"?</h4>
                            <p className="text-muted-foreground">
                                This refers to aiming for the center line where the service boxes meet. It is the lowest part of the net (3 feet vs 3.5 feet at the posts), making it slightly easier to clear, but requires precise directional control.
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
                                    <strong className="block text-primary mb-1">Academy Students</strong>
                                    <span className="text-sm text-muted-foreground">Log data from "Cone Drill" sessions to track improvement over a semester.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Self-Coached Players</strong>
                                    <span className="text-sm text-muted-foreground">Identify if your "favorite" serve is actually reliable or just a lucky shot.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Match Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Chart matches to see where a player aimed vs. where the ball landed.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
                                <li><strong>Self-Reporting Bias:</strong> In practice, it's easy to claim "I meant to hit it there" after a miss-hit lands in a good spot. Honest tracking is essential.</li>
                                <li><strong>Drills vs. Match Play:</strong> Achieving 80% accuracy in a relaxed drill often drops to 40% under match pressure.</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold">Case Study A: The Power Server</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Hits 120mph serves but with 20% accuracy to zones. Returners complicate the serve by guessing "middle" and blocking it back. <strong>Result:</strong> Vulnerable to predictable returns.</p>
                                </div>
                                <div className="p-4 border rounded-lg">
                                    <h4 className="font-semibold">Case Study B: The Spot Server</h4>
                                    <p className="text-sm text-muted-foreground mt-1">Hits 95mph serves with 70% accuracy to corners. Returners are constantly stretching and off-balance. <strong>Result:</strong> Holds serve easily despite lower power.</p>
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
                                The Tennis Serve Accuracy Calculator shifts the focus from pace to precision.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By quantifying your ability to hit specific target zones, you can build a smarter, more tactical service game that relies on geometry and strategy rather than brute force.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
