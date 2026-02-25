import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, Shield } from 'lucide-react';
import VolleyballBlockEfficiencyCalculatorInteractive from './volleyball-block-efficiency-calculator-interactive';

export default function VolleyballBlockEfficiencyCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Volleyball Block Efficiency Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Analyze your net presence by measuring how effectively you score direct blocking points while minimizing net violations and tooling errors.
                </p>
            </div>

            <VolleyballBlockEfficiencyCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for calculating block efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Shield className="h-4 w-4" />
                                Stuff Blocks
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Blocks that result immediately in a point for the blocking team.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>The ball hits the floor on the opponent's side of the net.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>The ultimate objective of an aggressive blocking scheme.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <AlertCircle className="h-4 w-4" />
                                Block Errors
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Blocking attempts that result directly in a point for the opponent.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>Includes net touches, centerline faults, and reaching over illegally.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>Can also include getting "tooled" (block out of bounds) depending on the stat-keeper.</span>
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
                            Block Efficiency = (Stuff Blocks - Block Errors) / Total Block Attempts
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Modeled after standard hitting efficiency, this formula identifies the net contribution of a blocker. A negative efficiency means the blocker is giving away more points via unforced errors than they are earning via stuff blocks.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Volleyball Calculators
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
                        <Link href="/volleyball-dig-success-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Dig Success Rate</p>
                                            <p className="text-sm text-muted-foreground">Defensive performance</p>
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
                        <Link href="/basketball-player-efficiency-rating-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Basketball PER</p>
                                            <p className="text-sm text-muted-foreground">Overall contribution</p>
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
                <meta itemProp="name" content="The Definitive Guide to Volleyball Block Efficiency: Mastering the Net" />
                <meta itemProp="description" content="A comprehensive deep-dive into calculating volleyball block efficiency, understanding the significance of net control, and learning actionable techniques to generate more stuff blocks while eliminating errors." />
                <meta itemProp="keywords" content="volleyball block efficiency, how to block a volleyball, stuff blocks, volleyball net errors, middle blocker stats, volleyball analytics, blocking technique" />
                <meta itemProp="author" content="MegaCalc Volleyball Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-25" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Volleyball Block Efficiency: Mastering the Net</h2>
                <p className="text-lg italic text-muted-foreground">Blocking is the first line of defense and the most intimidating action in volleyball. Understanding your blocking efficiency is critical to transitioning from a passive net presence into an aggressive point-scoring machine.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Block Efficiency?</a></li>
                    <li><a href="#stuff-vs-soft" className="hover:underline">Stuff Blocks vs. Soft Touches</a></li>
                    <li><a href="#common-errors" className="hover:underline">The Devastation of Block Errors</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks: What is a Good Efficiency?</a></li>
                    <li><a href="#technique" className="hover:underline">Technical Improvements for Better Blocking</a></li>
                    <li><a href="#system-impact" className="hover:underline">How Blocking Efficiency Dictates Team Defense</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Block Efficiency?</h2>
                <p>Block efficiency is an analytical metric designed to strip away the illusion of mere height or jumping ability and reveal actual point production. It takes the number of strictly positive outcomes you generate (Stuff Blocks) and subtracts the strictly negative outcomes (Block Errors), then divides that net contribution by the total number of times you jumped to block.</p>

                <p>A positive block efficiency indicates that when you jump, you are a mathematical asset to your team. A negative block efficiency indicates that you are a liability—scoring more points for the opponent via net violations than you are earning via blocks.</p>

                <hr />

                {/* STUFF VS SOFT */}
                <h2 id="stuff-vs-soft" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Stuff Blocks vs. Soft Touches (Channeling)</h2>
                <p>It is vital to recognize the limitations of the block efficiency formula. The formula heavily rewards <strong>Stuff Blocks</strong> (the ball goes straight down on the opponent's side). However, elite blocking is frequently about <em>channeling</em> the ball.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Unsung Hero: The Soft Touch</h3>
                <p>If you jump, touch a 60mph spike, and slow it down so your libero can effortlessly pass it, you did your job perfectly. This is a "Positive Touch." While standard stat sheets might log this simply as a block attempt (lowering your overall efficiency percentage), coaches view it as highly successful.</p>

                <p>A good rule of thumb: do not chase a high block efficiency at the expense of team structure. Reaching outside your designated blocking zone to "stuff" a ball often exposes your back-row defenders to catastrophic holes in the block.</p>

                <hr />

                {/* COMMON ERRORS */}
                <h2 id="common-errors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Devastation of Block Errors</h2>

                <p>Blocking errors are uniquely demoralizing because they often happen when a team is otherwise poised to win a rally. The primary culprits include:</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Net Touches:</strong> The most common error. Usually a result of drifting sideways in the air instead of jumping straight up, or "swimming" with the arms rather than pressing strictly forward.</li>
                    <li><strong>Centerline Faults:</strong> Crossing completely over the centerline under the net, posing a significant injury risk to both players in addition to losing the point.</li>
                    <li><strong>Getting Tooled (Wiped):</strong> When an intelligent attacker intentionally hits the ball off the outside edge of the blocker's hands so it deflects out of bounds. This is often recorded as an attack kill but is fundamentally a blocking failure (often caused by having hands turned outward rather than angled back into the court).</li>
                    <li><strong>Over-reaching:</strong> Contacting the ball before the opponent has executed an attack hit on a play where they had a legitimate opportunity to set.</li>
                </ul>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Industry Benchmarks: What is a "Good" Efficiency?</h2>
                <p>Because blocking is highly dependent on opponent set quality, block efficiency numbers appear much lower than hitting efficiency numbers.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Middle Blockers</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Elite:</strong> +0.150 to +0.250. Producing 1-2 stuff blocks per set with minimal net errors.</li>
                    <li><strong>Good:</strong> +0.050 to +0.150.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Pin Blockers (Outsides and Opposites)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Elite:</strong> +0.100 to +0.150.</li>
                    <li><strong>Good:</strong> +0.000 to +0.100. Pin blockers face the most desperate swings and are often the victims of tooling, dragging down their efficiency slightly.</li>
                </ul>

                <hr />

                {/* TECHNIQUE */}
                <h2 id="technique" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Technical Improvements for Better Blocking Efficiency</h2>

                <p>Improving efficiency requires systematically addressing both the numerator (getting more stuffs) and the denominator subtractor (eliminating errors).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. The Eye Sequence</h3>
                <p>The cardinal sin of blocking is staring at the ball the entire time. Elite blockers use the sequence: <strong>Ball → Setter → Ball → Hitter</strong>. You must find the hitter's shoulder and approach angle. The ball does not hit the ball; the hitter hits the ball.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Penetrating the Plane</h3>
                <p>A neutral block (straight up and down) allows the ball to fall on your side of the net. You must engage your core and press your hands forcefully over the net as far onto the opponent's side as physically possible. You want to take away the angle before the ball even crosses the tape.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Sealing the Seam</h3>
                <p>When double blocking, the outside blocker sets the position, and the middle blocker must close the gap. A gap of even a few inches ("the seam") allows hard-driven balls to split the block, frequently resulting in painful defensive injuries or immediate points.</p>

                <hr />

                {/* SYSTEM IMPACT */}
                <h2 id="system-impact" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Blocking Efficiency Dictates Team Defense</h2>
                <p>Volleyball defense is a partnership. The block takes away the fast, steep angles (the "hard cross" or the "sharp line"), casting a shadow. The back-row defenders position themselves outside of that shadow.</p>
                <p>If a blocker is inefficient—meaning they are routinely late, leaving gaps, or failing to press over—they destroy the defensive ecosystem. The shadow disappears, and the libero is forced to guess rather than read. Thus, a high block efficiency is the literal cornerstone upon which a championship-level defensive unit operates.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions regarding volleyball blocking rules and analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does getting "tooled" count as a block error?</h4>
                            <p className="text-muted-foreground">
                                In FIVB and NCAA official stats, a ball hit off the block and out of bounds is simply recorded as a kill for the attacker. However, when coaches look at advanced block efficiency, they often manually tag toolings as block errors to reprimand poor hand angles.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a player in the back row jump to block?</h4>
                            <p className="text-muted-foreground">
                                No. If a back-row player (including the Libero) jumps and touches a ball that is entirely above the height of the net, it is an illegal back-row block, resulting in an immediate point for the opponent.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">If two players block a ball together, who gets the stat?</h4>
                            <p className="text-muted-foreground">
                                In official statistics, if a double or triple block results in a stuff, all participating players who went up for the block receive a "block assist" (worth 0.5 blocks for statistical tallying). Your block efficiency calculations can utilize solo blocks + block assists as "Stuff blocks".
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is it better to have a high stuff count or a high positive touch count?</h4>
                            <p className="text-muted-foreground">
                                Both are excellent, but high positive touches represent sustainable defense. Against elite hitters, stuffing the ball is rare and extremely difficult. Slowing the ball down repeatedly allows transition offense to flourish. A player with 2 stuffs and 15 positive touches is highly favored over a player with 4 stuffs and 0 positive touches (who likely jumps wildly).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is my block efficiency continuously negative?</h4>
                            <p className="text-muted-foreground">
                                A negative efficiency is overwhelmingly caused by net violations. If you touch the net 4 times in a match and only get 1 stuff block, your efficiency plummets. Focus obsessively on vertical jumping mechanics and core stability.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a block touch count as one of the team's three hits?</h4>
                            <p className="text-muted-foreground">
                                No, this is a critical rule in indoor volleyball. A block contact does not count as a team hit. The team still has three contacts remaining to return the ball, and the blocker who touched it may legally make the very next contact.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do I prevent blockers from wiping my outside arm?</h4>
                            <p className="text-muted-foreground">
                                When you are the pin blocker (setting the outside edge), your outside arm must be turned sharply inward facing position 6 (middle back). If your hands face parallel to the sidelines, the attacker will easily glance the ball off them out of bounds.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What happens if I reach over the net and block a setter?</h4>
                            <p className="text-muted-foreground">
                                You cannot aggressively block an opponent trying to execute an offensive play or a set while the ball is wholly on their side. You may only penetrate the plane and block an <em>attack hit</em>. Doing otherwise is an over-reaching interference error.
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
                                    <strong className="block text-primary mb-1">Middle Blockers</strong>
                                    <span className="text-sm text-muted-foreground">The primary operators of the net. Use this to determine if aggressive footwork is resulting in actual points or just net faults.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Pin Hitters (OH/RS)</strong>
                                    <span className="text-sm text-muted-foreground">Track how effectively you are shutting down the opponent's primary attacking routes and minimizing tooling.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaching Staff</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate if a specific blocker is a mathematical liability masquerading as an "intimidating" presence.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Statisticians</strong>
                                    <span className="text-sm text-muted-foreground">Distill raw defensive data into an actionable efficiency metric to present in post-game scouting reports.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations of the Metric</h3>
                            <p className="text-muted-foreground mb-4">
                                This rudimentary metric operates under the assumption that an attempt that doesn't result in a stuff or an error is a "zero point" event. In reality, a blocker routinely channeling a ball to the libero is providing immense value that this basic efficiency formula will dilute simply because the total attempts denominator increases. Furthermore, solo blocks are significantly harder than double blocks, yet both instances count uniformly in the numerator.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Application Example</h3>
                            <p className="text-muted-foreground">
                                <strong>Correcting Aggression:</strong> A hyper-athletic freshman middle blocker regularly gets huge "roof" (stuff) blocks that energize the crowd. He earns 6 stuff blocks in a match. However, the stats reveal 3 net errors, 2 centerline faults, and 1 over-reach interference (6 total errors) over 40 attempts. His efficiency is (6 - 6) / 40 = 0.000. Despite the highlight reel plays, his aggressive technique is costing the team exactly as many points as it makes. The coach utilizes this data to enforce strict adherence to proper eye-sequence training and vertical jump posture during the following week's practice.
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
                                The Volleyball Block Efficiency Calculator translates raw net action into a definitive metric of defensive value.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By acknowledging that blocking errors directly gift the opponent points, this tool refocuses athletes from merely trying to swing at the ball mid-air toward executing disciplined, mathematically sound defensive systems. Mastery of block efficiency is the fastest avenue to neutralizing a superior offense.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
