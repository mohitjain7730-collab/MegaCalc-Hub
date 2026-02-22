import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, CheckCircle2, TrendingDown, AlertCircle, FunctionSquare, Calculator, Shield, Activity, Target, Users, Zap, Briefcase, Landmark, Trophy, Ban, Timer, EyeOff } from 'lucide-react';
import DotBallPercentageCalculatorInteractive from './dot-ball-percentage-calculator-interactive';

export default function DotBallPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Cricket Dot Ball Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Quantify the pressure you build. Calculate the percentage of deliveries that concede zero runs to dominate opposing batsmen.
                </p>
            </div>

            <DotBallPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Defining what counts as a "Dot Ball" is crucial
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Total Deliveries
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of legal balls bowled.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes all balls bowled in the spell/match.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Does NOT include:</strong> Wides (as they are extra deliveries).</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Ban className="h-4 w-4" />
                                Dot Balls
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Deliveries where <strong>zero runs</strong> are credited to the batsman.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                                    <span><strong>Includes:</strong> Byes and Leg Byes (since these are not credited against the bowler).</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
                                    <span><strong>Includes:</strong> Wickets (if no run was scored).</span>
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
                            Dot Ball % = (Total Dot Balls / Total Balls Bowled) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This simple formula reveals "pressure density." A higher percentage directly correlates with wicket-taking probability at the other end.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Bowling Tools
                    </CardTitle>
                    <CardDescription>
                        Calculators to measure bowling effectiveness
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Runs per wicket</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/bowling-economy-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Economy Rate</p>
                                            <p className="text-sm text-muted-foreground">Run containment</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/over-economy-tracker" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Timer className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Over Tracker</p>
                                            <p className="text-sm text-muted-foreground">Live economy check</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/cricket-win-probability-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Win Probability</p>
                                            <p className="text-sm text-muted-foreground">Predict outcomes</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Total rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Batting Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed metrics</p>
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
                <meta itemProp="name" content="The Definitive Guide to Dot Ball Percentage: The Hidden Secret of Bowling Pressure" />
                <meta itemProp="description" content="Discover why Dot Ball Percentage is the most underrated metric in cricket. Learn how blocking runs creates wickets, what percentages are elite in T20s, and how to improve your consistency." />
                <meta itemProp="keywords" content="cricket dot ball percentage, bowling stats analysis, pressure building cricket, dot balls in T20, economy rate vs dot ball percentage" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-14" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Dot Ball Percentage: The Silent Killer in Cricket</h2>
                <p className="text-lg italic text-muted-foreground">"Dots are gold dust." It is a phrase heard in every commentary box from the IPL to the Ashes. Why? Because in a game governed by runs, the absence of runs creates panic.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What Counts as a Dot Ball?</a></li>
                    <li><a href="#importance" className="hover:underline">The Psychology of the Dot Ball</a></li>
                    <li><a href="#benchmarks" className="hover:underline">What is an Elite Percentage? (T20, ODI, Test)</a></li>
                    <li><a href="#economy-vs-dots" className="hover:underline">Economy Rate vs Dot Ball %</a></li>
                    <li><a href="#strategy" className="hover:underline">How to Bowl More Dots</a></li>
                    <li><a href="#legends" className="hover:underline">The Masters of Stifling</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Counts as a Dot Ball?</h2>
                <p>A <strong>Dot Ball</strong> is any delivery where the batting team scores zero runs attributed to the bat or extras.</p>
                <p>However, there are nuances:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Wickets:</strong> If a bowler takes a wicket and no run is scored, it is statistically a dot ball (and the best kind!).</li>
                    <li><strong>Leg Byes / Byes:</strong> While runs are added to the team total, they are not charged to the bowler. For the purpose of analyzing a bowler's ability to beat the bat, many analysts count these as "effective dots," though scorecards record them as runs. This calculator treats your input strictly: input balls where <strong>zero runs</strong> were conceded by you.</li>
                </ul>

                <hr />

                {/* PSYCHOLOGY */}
                <h2 id="importance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Psychology of the Dot Ball</h2>
                <p>Cricket is a game of rhythm. Batsmen want to feel bat on ball and see the score tick over. A string of dot balls disrupts this rhythm.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Pressure Cooker Effect</h3>
                <p>When the scoring stops, the Required Run Rate climbs up. Batsmen feel compelled to manufacture shots that aren't there. This leads to:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Playing across the line</li>
                    <li>Chasing wide deliveries</li>
                    <li>Attempting suicidal runs</li>
                </ul>
                <p>Often, bowler A bowls three dot balls, and Bowler B takes the wicket next over because the batsman was desperate. Bowler A created the wicket.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is an Elite Percentage?</h2>
                <p>The standard varies wildly by format.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Elite:</strong> &gt;50% (Every second ball is a dot!)</li>
                    <li><strong>Good:</strong> 40-50%</li>
                    <li><strong>Average:</strong> 30-40%</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Cricket</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Elite:</strong> &gt;60%</li>
                    <li><strong>Good:</strong> 50-60%</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Test Cricket</h3>
                <p>In Tests, batsmen are content to leave the ball. An elite Test bowler might have a dot ball percentage of <strong>70-80%</strong>. Glenn McGrath often hovered around 80-85%, forcing batsmen to take extreme risks to score even a single run.</p>

                <hr />

                {/* ECONOMY VS DOTS */}
                <h2 id="economy-vs-dots" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Economy Rate vs Dot Ball %</h2>
                <p>Are they the same? No.</p>
                <div className="p-4 bg-muted border rounded-lg my-4">
                    <p><strong>Scenario A:</strong> 6 singles in an over. Economy: 6.00. Dot %: 0%.</p>
                    <p><strong>Scenario B:</strong> 5 dots and 1 six. Economy: 6.00. Dot %: 83%.</p>
                </div>
                <p>Statistically, <strong>Scenario B is better for wicket-taking</strong>. While both conceded 6 runs, Scenario B beat the batsman 5 times, suggesting a wicket is imminent. Scenario A allowed the batsman to rotate strike comfortably.</p>

                <hr />

                {/* STRATEGY */}
                <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Bowl More Dots</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Consistency (The Channel)</h3>
                <p>The "Channel of Uncertainty" (just outside off stump) makes it hard to score. The batsman cannot leave it easily, but cannot drive it without risk.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Cramping the Batter</h3>
                <p>Bowling into the body (ribcage or hip) prevents the batter from freeing their arms. This is a classic tactic to dry up runs.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Field Placement</h3>
                <p>Set a field for your bowling plan. If you are bowling wide yorkers, you don't need a fine leg. If you block the batsman's favorite shot, they will often block the ball out of frustration.</p>

                <hr />

                {/* LEGENDS */}
                <h2 id="legends" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Masters of Stifling</h2>

                <div className="space-y-4 mt-4">
                    <div className="p-4 border-l-4 border-gray-500 bg-muted/30">
                        <h4 className="font-bold">Muttiah Muralitharan</h4>
                        <p className="text-sm">Not just a wicket-taker. In ODIs, his ability to bowl 4-5 dots in an over meant batsmen had to attack him, leading to his 800 Test wickets.</p>
                    </div>
                    <div className="p-4 border-l-4 border-blue-500 bg-muted/30">
                        <h4 className="font-bold">Jasprit Bumrah</h4>
                        <p className="text-sm">In the death overs of T20s, Bumrah often has a dot ball percentage over 40%, which is statistically absurd given batsmen are trying to hit every ball for six.</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Frequently Asked Questions
                    </CardTitle>
                    <CardDescription>
                        Common queries about Dot Ball stats
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a wide count as a dot ball?</h4>
                            <p className="text-muted-foreground">
                                No. A wide concedes a run, so it is not a dot ball. Furthermore, it is not a legal delivery, so it doesn't even count in the ball count (usually).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a leg bye a dot ball for the bowler?</h4>
                            <p className="text-muted-foreground">
                                Technically, no run adds to the bowler's figures, but runs are added to the total. Different analysts treat this differently. For PURITY, if the scoreboard ticked over, it is not a dot for the team. But for the bowler's personal stats, it is often considered a "win" (beat the bat).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is Dot Ball % higher in Tests?</h4>
                            <p className="text-muted-foreground">
                                Because there is no time pressure. Batsmen can leave the ball or defend without hurting the team's chances. In T20, every dot hurts the team.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the "Golden Dot" theory?</h4>
                            <p className="text-muted-foreground">
                                Some coaches believe the first ball of an over being a dot is the most important, as it sets the tone and immediately puts the striker under pressure for the next 5 balls.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a spinner have a high dot ball %?</h4>
                            <p className="text-muted-foreground">
                                Yes! Spinners like Rashid Khan and Narine rely heavily on dots. Batsmen often can't pick their variations, leading to tentative defensive shots (dots).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How many dots in a "good" T20 over?</h4>
                            <p className="text-muted-foreground">
                                Aim for 2-3 dots per over. If you bowl 3 dots, even if the other 3 balls go for singles, that's only 3 runs. If one goes for a boundary, it's 7 runs. Both are excellent outcomes.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage of this Calculator */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Usage of this Calculator
                    </CardTitle>
                    <CardDescription>
                        Practical applications for players and analysts
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Who should use */}
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
                            <Users className="h-5 w-5 text-blue-600" />
                            Who Should Use This Tool?
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Defensive Bowlers</strong>
                                <span className="text-sm text-muted-foreground">Bowlers whose role is to dry up runs (e.g., finger spinners in middle overs). This is your primary KPI.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Captains</strong>
                                <span className="text-sm text-muted-foreground">To identify which bowler is actually creating pressure, even if they aren't taking wickets.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Recruiters</strong>
                                <span className="text-sm text-muted-foreground">Moneyball tactics: Buying undervalued bowlers with high Dot % but average wicket columns.</span>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                                <strong className="block text-primary mb-1">Fantasy Analysts</strong>
                                <span className="text-sm text-muted-foreground">Predicting Man of the Match awards, which often favor tidy bowling spells.</span>
                            </div>
                        </div>
                    </div>

                    <hr className="border-border/50" />

                    {/* Real World Examples */}
                    <div>
                        <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
                            <Landmark className="h-5 w-5 text-green-600" />
                            Real-World Examples
                        </h4>
                        <div className="space-y-3">
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Scenario A: The Deep Squeeze</h5>
                                <p className="text-sm text-green-700/80 dark:text-green-400">
                                    Bowler bowls 4 overs (24 balls). Considers 14 dots. <br />
                                    Dot % = (14/24) = <strong>58.3%</strong>. <br />
                                    Verdict: Winning spell in T20.
                                </p>
                            </div>
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                <h5 className="font-semibold text-red-800 dark:text-red-300 mb-1">Scenario B: The Expensive Wicket Taker</h5>
                                <p className="text-sm text-red-700/80 dark:text-red-400">
                                    Bowler bowls 4 overs. Takes 3 wickets but only bowls 4 dots. <br />
                                    Dot % = (4/24) = <strong>16.6%</strong>. <br />
                                    Verdict: Useful, but likely conceded 40+ runs. High risk, high reward.
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
                                The Cricket Dot Ball Percentage Calculator highlights the importance of consistency and pressure.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It serves as a counter-balance to Economy Rate, showing <em>how</em> the runs were restricted.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Use this metric to fine-tune bowling plans and dominate the mental battle against batsmen.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
