import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, Shield } from 'lucide-react';
import VolleyballReceptionAccuracyCalculatorInteractive from './volleyball-reception-accuracy-calculator-interactive';

export default function VolleyballReceptionAccuracyCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Volleyball Reception Accuracy Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Quantify your serve-receive performance using the standard 3-point passing scale to see if you are keeping your offense perfectly in-system.
                </p>
            </div>

            <VolleyballReceptionAccuracyCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        The standard 0-3 grading scale for volleyball passing
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Trophy className="h-4 w-4" />
                                Perfect Pass (3 Points)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                A pass delivered precisely to the setter's target zone.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>The setter does not have to move to contact the ball.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Allows the setter to run a full tempo offense, including the middle hitter.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Shield className="h-4 w-4" />
                                Good Pass (2 Points)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                A highly playable pass that is slightly off-target.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>The setter takes 1-2 steps off the net or to the side.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>The middle might be eliminated, but both pin hitters remain viable options.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                                <AlertCircle className="h-4 w-4" />
                                Poor Pass (1 Point)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                An emergency pass that simply keeps the rally alive.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                                    <span>Setter must sprint to the 10-foot line or far pins to track it down.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                                    <span>Results in a predictable, high out-of-system set to one side.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <AlertCircle className="h-4 w-4" />
                                Reception Error (0 Points)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                A pass that cannot be played by a teammate.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>Shanked into the stands or directly over the net out of bounds.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>A direct ace for the opposing server.</span>
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
                            Passing Average = ((3 × P3) + (2 × P2) + (1 × P1)) / Total Attempts
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Instead of simply looking at aces against, the Passing Average scores the exact quality of every reception. The output is strictly bound between 0 (every pass was shanked) and 3.0 (every pass was absolutely perfect).
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
                        <Link href="/volleyball-block-efficiency-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Block Efficiency</p>
                                            <p className="text-sm text-muted-foreground">Net defense metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
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
                    </div>
                </CardContent>
            </Card>

            {/* Complete Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                <meta itemProp="name" content="The Ultimate Guide to Volleyball Reception Accuracy: The 3-Point System Explained" />
                <meta itemProp="description" content="Discover how to meticulously track and drastically improve your volleyball passing average. Learn why the 3-point serve receive system is the global standard for elite analytics and the cornerstone of side-out strategy." />
                <meta itemProp="keywords" content="volleyball passing average, 3 point passing scale, serve receive accuracy, libero passing stats, volleyball analytics, how to pass a volleyball, side out volleyball" />
                <meta itemProp="author" content="MegaCalc Volleyball Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-25" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Volleyball Reception Accuracy: Dictating the Offense</h2>
                <p className="text-lg italic text-muted-foreground">An attack generates the point, the set orchestrates the play, but the pass makes the entire system possible. Reception accuracy is frequently cited by elite coaches as the single most determinative metric of a team's win-loss percentage.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#why-track" className="hover:underline">Why Mere "Aces Allowed" is a Terrible Metric</a></li>
                    <li><a href="#the-scale" className="hover:underline">Deconstructing the 0-3 Grading Scale</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Global Benchmarks: What defines an Elite Passer?</a></li>
                    <li><a href="#in-system" className="hover:underline">The Concept of "In-System" vs "Out-of-System"</a></li>
                    <li><a href="#technical-flaws" className="hover:underline">Common Technical Flaws Destroying Pass Averages</a></li>
                    <li><a href="#strategic-targeting" className="hover:underline">Using Metrics to Hide Weak Passers</a></li>
                </ul>
                <hr />

                {/* WHY TRACK */}
                <h2 id="why-track" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Mere "Aces Allowed" is a Terrible Metric</h2>
                <p>In amateur volleyball, players often judge a passer simply by how many times they overtly shank the ball (get aced). This is completely misleading. You can pass zero aces but consistently deliver 1-point balls to the 10-foot line, destroying your team's ability to run a middle offense and fundamentally handicapping your outside hitters against double blocks.</p>

                <p>Alternatively, the <strong>Passing Average</strong> (calculated on a 0-3 scale) meticulously grades <em>quality</em>. It penalizes you for high-looping balls that barely cross the attack line, rewarding only precise, rhythmic passes that feed the setter's hands directly at the net.</p>

                <hr />

                {/* THE SCALE */}
                <h2 id="the-scale" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Deconstructing the 0-3 Grading Scale</h2>
                <p>While nuanced variations exist depending on the statistical software (like DataVolley or VolleyMetrics), the global benchmark operates universally on this 4-tier grading logic:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The 3-Pass (Perfect / In-System)</h3>
                <p>The ball is passed with a gentle, arching trajectory directly to the designated setter target zone (usually position 2.5, right-center off the net). The setter does not have to move. They can jump set and confidently push the ball to the middle blocker, outside, or opposite, running the offense at maximum speed.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The 2-Pass (Good / Slightly Out)</h3>
                <p>The ball is high and playable but off-target. The setter takes 1-2 strides backward or sideways. The quick middle attack is usually abandoned because the timing is ruined, leaving only the high outside or back-row attack as viable options. The defense reads this instantly.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The 1-Pass (Poor / Out-of-System)</h3>
                <p>A disastrously low or deeply off-target pass (often inside the 10-foot line). The setter or libero must sprint across the court to bump-set a high ball to the left pin. The opposing team forms a relaxed, structured double or triple block, statistically favoring the defense heavily.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The 0-Pass (Error)</h3>
                <p>A shanked ball into the bleachers. An ace. Or an "overpass" that is immediately slammed straight down by the opponent's middle blocker.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Global Benchmarks: What defines an Elite Passer?</h2>

                <p>Passing averages fluctuate based on the velocity and movement of the serves faced. Passing a 2.3 at the high school level is vastly different from passing a 2.3 in the Olympics.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Elite Liberos / Primary Passers</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>2.40 - 2.60:</strong> World Class. Almost mathematical perfection. The setter never runs.</li>
                    <li><strong>2.20 - 2.39:</strong> Elite Collegiate Level. Consistent engine for a high-powered offense.</li>
                    <li><strong>2.00 - 2.19:</strong> Good High School / Standard College. The offense runs smoothly with occasional hiccups.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Outside Hitters taking Serve-Receive</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>2.10 - 2.30:</strong> Excellent. Six-rotation pins who pass at this frequency are highly sought-after recruits.</li>
                    <li><strong>1.80 - 2.09:</strong> Average. Will get targeted by opposing servers frequently.</li>
                </ul>

                <hr />

                {/* IN-SYSTEM */}
                <h2 id="in-system" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Metric Reality: "In-System" Efficiency</h2>
                <p>The Reception Accuracy Calculator also spits out an <strong>In-System Efficiency Percentage</strong>. This simply adds your 3-point and 2-point passes and divides by total attempts. Why does this matter?</p>

                <p>Analytics prove that if a team can run a "first-tempo" offense (an offense fast enough that the block cannot close), their hitting percentage spikes dramatically. You can only run a first-tempo offense from a 3-pass or a very tight 2-pass. If your passing average plummets below a 1.90, you are functionally running an out-of-system offense the entire match, meaning your hitters are swinging into fully formed double blocks on every play.</p>

                <hr />

                {/* TECHNICAL FLAWS */}
                <h2 id="technical-flaws" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Common Technical Flaws Destroying Pass Averages</h2>

                <p>If your passing average is stubbornly hovering below a 1.80, one of three mechanical failures is occurring:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Swinging the Platform</h3>
                <p>Instead of letting the ball ricochet off a locked, angled platform, the passer "swings" their arms up to meet the ball. This adds unnecessary velocity, turning what should have been a beautiful 3-pass into an immediate overpass (0-pass).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Arriving Late</h3>
                <p>Tracking the ball with your eyes but not moving your feet until the ball is already halfway across the net. The passer is forced to extend outside their body frame, breaking posture, resulting in a glancing blow. The result is consistently a 1-pass or an ace.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. High Shoulders / Stiff Posture</h3>
                <p>Excellent passing requires "dropping" the shoulder on the side you want to pass toward. If both shoulders stay level and stiff, the ball will physically not reflect toward the target zone, typically shanking straight backward.</p>

                <hr />

                {/* STRATEGIC TARGETING */}
                <h2 id="strategic-targeting" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using Metrics to Hide Weak Passers</h2>
                <p>Armed with real-time reception stats, coaches make immediate tactical adjustments. If the statkeeper alerts the coach that their primary Outside Hitter is passing a dismal 1.40 average over the last set, the coach will execute a "hiding" pattern.</p>
                <p>They will condense the serve receive formation, squeezing the libero and the opposite-side hitter closer together to physically shield the struggling passer, forcing the server to hit incredibly tight angles to reach them. Without precise metric tracking, a coach might rely merely on "eye-test" and realize a passer is struggling two-sets too late.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common inquiries surrounding the 3-point passing scale mechanics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does hand-setting (overhead passing) a serve affect the rating differently?</h4>
                            <p className="text-muted-foreground">
                                No, the grade is based purely on the outcome of the trajectory, not the technique used. Taking a serve with your hands and delivering a perfect ball to the setter is still a 3-point pass.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">If our setter is extremely fast and gets to a bad pass, does it become a 3-point pass?</h4>
                            <p className="text-muted-foreground">
                                In strict analytics, no. The 3-point grade defines the objective spatial location the ball arrived in (e.g., inside the 10-foot line, right half of the court). An athletic setter rescuing a ball doesn't mean the pass was objectively good.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a 4-point scale?</h4>
                            <p className="text-muted-foreground">
                                Some elite international programs use a 4-point scale to distinguish an "overpass" (-1 or 0) from an unplayable shank (0 or -1), or to define an "absolute perfect" pass vs a "very good" pass. The 3-point scale remains the simplest universal standard.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why are my passes always going back over the net?</h4>
                            <p className="text-muted-foreground">
                                You are likely standing too upright and your platform is completely parallel to the ceiling upon contact. Against high-velocity serves, you must angle your platform aggressively forward (toward the net) to keep the ball on your side.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a jump float harder to pass than a top-spin serve?</h4>
                            <p className="text-muted-foreground">
                                Statistically, top-spin serves generate more outright aces due to sheer velocity, but heavy jump-float serves cause far more 1-passes and 0-passes because the ball drops and shifts unpredictably in the air current, ruining a passer's platform preparation.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">If a serve hits the net tape and trickles over (a tape ace), how is it graded?</h4>
                            <p className="text-muted-foreground">
                                Calculators are unsympathetic. If you dive and miss it, it's a 0-point pass (Reception Error). If you pop it up wildly, it's a 1-point pass. Luck is heavily factored into game analytics.
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
                                    <strong className="block text-primary mb-1">Liberos</strong>
                                    <span className="text-sm text-muted-foreground">Establish your passing average baseline and relentlessly attempt to increase it month over month.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Serving Specialists</strong>
                                    <span className="text-sm text-muted-foreground">Reverse-engineer the calculator to see if your serves are successfully dropping opposing players' averages down to the 1.50 block.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Setters</strong>
                                    <span className="text-sm text-muted-foreground">Analyze the data to mentally prepare for the tempo of offense you will be physically able to run on any given night based on who is passing.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">College Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Sift through prospects who look athletic on video but statistically expose an offense via consistent 1-point passing mechanics.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations of the Metric</h3>
                            <p className="text-muted-foreground mb-4">
                                The passing average calculator cannot quantify the mental or physiological stress of the serve. Passing a 3-ball on match point against a 70mph jump spin requires monumental fortitude not reflected in the basic math. Moreover, grading is inherently subjective. A stubborn coach might grade a pass a '2' while a generous statistician calls it a '3'. Consistency in the person grading the passes is vital for the data to retain reliability over a season.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Application Example</h3>
                            <p className="text-muted-foreground">
                                <strong>Targeted Practice Implementation:</strong> A high school varsity team notices they are constantly losing matches to physically inferior teams. The coach reviews the tape and enters the passing stats into the calculator. The starting outside hitter passed: 8 Perfect, 4 Good, 12 Poor, 6 Errors (A 1.46 Average). The coach realizes that nearly 60% of the hitter's passes resulted in a 1-pass or worse, effectively shutting down the team's potent middle blockers. The coach redirects practice entirely toward seam-passing responsibilities and platform stability, resulting in the hitter jumping to a 1.95 average the next week—immediately unlocking the team's offense and winning the subsequent match.
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
                                The Volleyball Reception Accuracy Calculator offers the unarguable truth of a pass's utility by mathematically punishing poor platform execution while rewarding perfect setting alignments.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Achieving a passing average above 2.10 transforms a disjointed group of attackers into a rhythmic, unstoppable offensive machine. By grading your passes rigorously, you can directly combat the systemic breakdowns holding your team back from elite side-out volleyball.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
