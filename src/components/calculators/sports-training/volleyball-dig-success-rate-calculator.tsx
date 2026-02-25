import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, Shield } from 'lucide-react';
import VolleyballDigSuccessRateCalculatorInteractive from './volleyball-dig-success-rate-calculator-interactive';

export default function VolleyballDigSuccessRateCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Volleyball Dig Success Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Quantify your defensive prowess by measuring how effectively you keep hard-driven attacks alive and transition your team into a scoring offense.
                </p>
            </div>

            <VolleyballDigSuccessRateCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for calculating digging efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Shield className="h-4 w-4" />
                                Successful Digs
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of times a player successfully passes a hard-driven ball (an attack) from the opponent, keeping it playable for their team.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>The dig must result in a playable ball for the setter or another teammate.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Does not include free ball passes or serve receptions (those are tracked separately).</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                <Target className="h-4 w-4" />
                                Total Dig Attempts
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Every instance where a player legally attempts to retrieve or pass an opponent's attack.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                    <span>Includes successful digs, digging errors (shanks), and balls that hit the floor directly within the player's defensive zone.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                    <span>Establishes the gross volume of defensive pressure the player was subjected to.</span>
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
                            Dig Success Rate (%) = (Successful Digs / Total Dig Attempts) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This metric computes the defensive conversion rate. A higher percentage indicates elite reading ability, superior reaction time, and excellent platform control, proving the player's value as a defensive anchor.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Sports Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/volleyball-error-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Error Rate</p>
                                            <p className="text-sm text-muted-foreground">Track unforced errors</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/volleyball-attack-success-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Attack Success Rate</p>
                                            <p className="text-sm text-muted-foreground">Offense efficiency metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/volleyball-serve-efficiency-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Serve Efficiency</p>
                                            <p className="text-sm text-muted-foreground">Serving impact factor</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/tennis-win-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Tennis Win Ratio</p>
                                            <p className="text-sm text-muted-foreground">Match dominance metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Cricket consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/baseball-softball-win-loss-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Baseball Win %</p>
                                            <p className="text-sm text-muted-foreground">Team success rate</p>
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
                <meta itemProp="name" content="The Complete Guide to Volleyball Dig Success Rates: Technical Evaluation and Defensive Mastery" />
                <meta itemProp="description" content="An exhaustive guide on calculating and improving volleyball dig success rates. Learn about defensive positioning, libero benchmarks, and how digging efficiency translates directly into transition offense." />
                <meta itemProp="keywords" content="volleyball dig success rate, how to dig a volleyball, libero stats, digging efficiency, defensive specialist volleyball, transition offense volleyball, volleyball stats meaning" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-25" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Comprehensive Guide to Volleyball Dig Success Rates: The Foundation of Transition Offense</h2>
                <p className="text-lg italic text-muted-foreground">While attackers claim the spotlight, elite volleyball teams are built from the floor up. The Dig Success Rate is the definitive metric representing a team's grit, read-ability, and capability to turn defensive desperation into offensive domination.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What Constitutes a "Dig" in Volleyball?</a></li>
                    <li><a href="#why-it-matters" className="hover:underline">Why Digging is the Catalyst for Offense</a></li>
                    <li><a href="#quality-vs-quantity" className="hover:underline">The Grading Scale: Quality vs. Quantity</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Positional Benchmarks: Libero vs. Six-Rotation Players</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Drastically Improve Your Dig Rate</a></li>
                    <li><a href="#block-defense" className="hover:underline">The Symbiosis Between the Block and the Dig</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Constitutes a "Dig" in Volleyball?</h2>
                <p>In standard volleyball analytics, a <strong>dig</strong> is awarded only when a player successfully passes an attacked ball and keeps it in play. It is critical to differentiate a dig from other forms of passing.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Criteria for a Dig</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>It Must Be an Attack:</strong> Passing a free ball (an easy loop over the net) is recorded as a "free ball pass," not a dig. Passing a serve is "serve reception." Digs exclusively apply to hard-driven spikes, tips, roll shots, or setter dumps.</li>
                    <li><strong>Playability is Key:</strong> For a dig to be deemed "successful," the ball must remain high and on the defensive team's side of the court, granting a teammate an opportunity to make the second contact.</li>
                    <li><strong>Errors and Overpasses:</strong> If a player shanks the ball into the stands, it is a digging error. If they dig it so aggressively that it flies back over the net (an overpass), it is generally considered a poor dig, though technically a "dig on goal" depending on the statistical software.</li>
                </ul>

                <hr />

                {/* WHY IT MATTERS */}
                <h2 id="why-it-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Digging is the Catalyst for Offense</h2>
                <p>In modern volleyball, side-out percentages (scoring when receiving serve) are exceptionally high. To win matches against equal or superior opponents, a team must score points while serving—this is known as <strong>transition offense</strong>.</p>

                <p>Transition offense is mathematically impossible without a successful dig. By extending the rally, a defender creates a mathematical surplus of scoring opportunities. Teams that lead their leagues in Dig Success Rates inversely lead their leagues in opponent hitting percentages. A high dig rate demoralizes opposing hitters, forcing them to swing harder or aim tighter until they inevitably commit an unforced error.</p>

                <hr />

                {/* QUALITY VS QUANTITY */}
                <h2 id="quality-vs-quantity" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Grading Scale: Quality vs. Quantity</h2>

                <p>While the standard formula (Successful Digs / Total Attempts) provides a baseline, elite programs employ a 0-3 passing scale to grade the <em>quality</em> of the dig.</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>3-Point Dig (Perfect):</strong> Ball is popped up exactly to the target (the setter's zone) with ideal height, allowing the setter to utilize all attacking options, including the middle blocker.</li>
                    <li><strong>2-Point Dig (Good):</strong> Ball is kept alive and reasonably high in the middle of the court. The setter may have to run but can still set the outside or opposite hitters comfortably.</li>
                    <li><strong>1-Point Dig (Emergency):</strong> An off-balance lunge, pancake, or shank that merely keeps the ball off the floor. The team must usually send over a free ball or rely on an out-of-system spectacular swing.</li>
                    <li><strong>0-Point Dig (Error):</strong> The ball hits the floor in the player's zone or is shanked unplayably out of bounds.</li>
                </ul>

                <p>A player with a 70% Dig Success Rate who mostly generates 3-point digs is far more valuable than a player with an 80% success rate producing mostly 1-point digs.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Positional Benchmarks: Libero vs. Six-Rotation Players</h2>
                <p>Expectations for digging vary wildly depending on the player's position and zone of responsibility.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Libero / Defensive Specialist (DS)</h3>
                <p>These players exist solely to control the ball. They are typically tasked with defending "Zone 5" (left-back) or "Zone 6" (middle-back), which see the highest volume of hard-driven balls.
                    <br /><br />
                    <strong>Elite Libero Benchmark: 70% - 85%+ Dig Success Rate.</strong> They are expected to dig tips, hard crosses, and seam shots with high consistency.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Six-Rotation Outside Hitters (OH)</h3>
                <p>Playing in "Zone 6" or "Zone 5", the OH has massive offensive burdens but must anchor the defense alongside the libero.
                    <br /><br />
                    <strong>Elite OH Benchmark: 55% - 70% Dig Success Rate.</strong> Their primary defensive job is often reading the tip or managing the deep line swing.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Setters and Opposites</h3>
                <p>Usually stationed in "Zone 1" (right-back), they defend the sharp cross-court angle from the opponent's outside hitter, arguably the hardest ball to defend in volleyball due to sheer velocity.
                    <br /><br />
                    <strong>Elite Right-Back Benchmark: 40% - 60% Dig Success Rate.</strong> If a setter digs the ball, the team is instantly out of system, making their digs functionally 2-point passes at best.</p>

                <hr />

                {/* STRATEGIES TO IMPROVE */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Drastically Improve Your Dig Rate</h2>

                <p>Defensive prowess is less about athletic diving and more about pre-contact anticipation and disciplined mechanics.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Posture and Platform Alignment</h3>
                <p>Never lock your platform (your arms) before the hitter makes contact. Elite defenders remain loose, tracking the ball with their eyes. As the hitter commits to a trajectory, the defender forms an early platform and angles it towards the target—never swinging their arms at the ball. The ball's velocity will do the work; the defender simply dictates the angle of reflection.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Stopping Forward Momentum</h3>
                <p>The most common error among young defenders is moving while digging. You must be completely stationary on contact (the "split step"). If your feet are moving backward or sideways when the ball strikes your arms, you lose total control over the rebound trajectory.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Reading the Hitter's Shoulder and Hips</h3>
                <p>You cannot react fast enough to a 60mph spike if you wait to see where the ball is going. You must read the clues: where is the set? Where are the hitter's hips facing? Is their elbow dropping (indicating a tip) or winding up (indicating a hard swing)? Positioning yourself exactly where the hitter's body alignment dictates the ball will go instantly spikes your success rate.</p>

                <hr />

                {/* BLOCK AND DEFENSE */}
                <h2 id="block-defense" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Symbiosis Between the Block and the Dig</h2>
                <p>No defender can cover the entire 9x9 meter court. A high dig success rate is intrinsically linked to team block execution. A disciplined block takes away the sharpest angles and the quickest middle-court zones. By casting a "shadow," the block forces the hitter to swing into specific, predefined lanes where the libero and outside hitters are already waiting.</p>

                <p>If a team's Dig Success Rate is abnormally low, the first diagnostic step is not to evaluate the libero's passing technique, but rather to evaluate whether the front-row block contains holes or is routinely late, thereby hanging the back-row defenders out to dry.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions regarding volleyball defensive metrics and digging scenarios
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a "Pancake" count as a successful dig?</h4>
                            <p className="text-muted-foreground">
                                Yes, assuming the pancake (diving and sliding the hand flat on the floor so the ball bounces off the back of hand) keeps the ball in play and allows a teammate to make the next contact, it is recorded as a successful dig.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">If I dig the ball perfectly, but my setter double-contacts it, do I lose my dig stat?</h4>
                            <p className="text-muted-foreground">
                                No. Volleyball stats assess the individual action. You successfully executed your dig. The setter will be credited with a ball-handling error, but your dig remains mathematically recorded.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">If a block slows the ball down, does retrieving it still count as a dig?</h4>
                            <p className="text-muted-foreground">
                                Yes. Passing a ball that deflected off your team's block is known as a "cover" dig or an "off-block" dig. It still unequivocally counts toward your total successful digs.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why are my digs always overpassing the net?</h4>
                            <p className="text-muted-foreground">
                                Overpassing a dig usually results from "swinging" your platform at the ball to generate power, or your platform angle being too flat relative to the net. Against hard-driven balls, you must absorb the impact and present a steep, upward angle to kill the forward momentum.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">If the ball hits me in the face and bounces up for my teammate to set, is it a dig?</h4>
                            <p className="text-muted-foreground">
                                Technically, yes! Volleyball rules permit contact with any part of the body. If an attack strikes your head, chest, or foot and remains playable, the statkeeper will mark it as a successful dig, albeit an unconventional one.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do I calculate "Digs per Set"?</h4>
                            <p className="text-muted-foreground">
                                Digs per Set is a volume metric calculated simply by dividing Total Successful Digs by Total Sets Played. A top-tier collegiate libero will often average over 4.5 or 5.0 Digs Per Set.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is digging a tip harder than digging a spike?</h4>
                            <p className="text-muted-foreground">
                                Defenders naturally set their weight back on their heels to prepare for the forceful impact of a spike. A tip requires explosive forward acceleration from a static posture, demanding tremendous agility and perfectly timed reflexes to execute a dive or pancake.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the difference between an attempt and an error when digging?</h4>
                            <p className="text-muted-foreground">
                                An attempt is any ball hit into your defensive zone that you try to play. If the ball is hit so hard you physically cannot react, and it hits the floor next to you, it is an attempt that lowered your success rate, but technically not a specific "dig error." A "dig error" occurs when the ball strikes your arms and you shank it terribly out of bounds when it was reasonably playable.
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
                                    <strong className="block text-primary mb-1">Liberos & Defensive Specialists</strong>
                                    <span className="text-sm text-muted-foreground">A core KPI (Key Performance Indicator) to evaluate match-to-match consistency and defensive reliability.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Volleyball Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Identify which back-row zones and players are being successfully targeted by the opposing offense.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Data Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Determine if a low team hitting percentage is due to poor setting, or if low dig success rates are creating garbage out-of-system sets.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Compare the raw defensive metrics of high school athletes against established collegiate benchmarks.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations of the Metric</h3>
                            <p className="text-muted-foreground mb-4">
                                The Dig Success Rate formula does not factor in the difficulty of the attack. A defender who perfectly passes six 30mph roll shots will register a 100% success rate, while a defender who successfully digs three 70mph spikes but shanks three others registers a 50% rate. The metric also fails to capture the "quality" of the dig (a perfect 3-pass to target vs. an emergency 1-pass to the ceiling). Coaches use passing quality metrics alongside success rates to get the full picture.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Application Example</h3>
                            <p className="text-muted-foreground">
                                <strong>Defensive Adjustment Context:</strong> During a tournament final, a team's left-back outside hitter is being relentlessly targeted by the opponent's right-side attacker. At the end of Set 2, the stat sheet reveals the hitter had 18 dig attempts but only secured 6 successful digs (a 33.3% rate). Realizing this defensive liability, the coach substitutes a Defensive Specialist (DS) into that position for Set 3. The DS records 8 successful digs on 10 attempts (an 80% rate), completely neutralizing the opponent's offensive strategy and creating the transition points needed to win the match.
                            </p>
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
                                The Volleyball Dig Success Rate Calculator provides an unvarnished look at a player's or team's true defensive impact.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                While measuring offensive power is exciting, championships are historically won by teams who refuse to let the ball hit their floor. By consistently tracking and striving to elevate digging efficiency, you construct the unshakable foundation necessary for high-level transition volleyball.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
