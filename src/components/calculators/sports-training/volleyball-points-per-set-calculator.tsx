import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Award, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users } from 'lucide-react';
import VolleyballPointsPerSetCalculatorInteractive from './volleyball-points-per-set-calculator-interactive';

export default function VolleyballPointsPerSetCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Volleyball Points per Set Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate the average points scored per set to measure offensive efficiency and scoring consistency in volleyball.
                </p>
            </div>

            <VolleyballPointsPerSetCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for calculating Points per Set
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Total Points Scored
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of points won safely by the team or individual player over a given period or match.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes all types of points: kills, aces, blocks, and opponent errors (for teams).</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Counted across both won and lost sets.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Activity className="h-4 w-4" />
                                Total Sets Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of individual sets that the team or player participated in during the same period.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Matches typically range from 3 to 5 sets in standard indoor leagues.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Even a short 5th set played to 15 points counts as one full set in the denominator.</span>
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
                            Points per Set = Total Points / Total Sets Played
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Measures consecutive scoring momentum and overall offensive output over the duration of the matches. A higher average points per set consistently correlates with higher match win probabilities in competitive volleyball.
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
                        Explore other analytical tools to measure volleyball performance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/volleyball-attack-success-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Attack Success Rate</p>
                                            <p className="text-sm text-muted-foreground">Spiking efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/volleyball-serve-efficiency-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Serve Efficiency</p>
                                            <p className="text-sm text-muted-foreground">Ace to error ratio</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/volleyball-block-efficiency-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Block Efficiency</p>
                                            <p className="text-sm text-muted-foreground">Defensive metrics at the net</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/volleyball-reception-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Reception Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Passing quality</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/volleyball-error-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Error Rate Calculator</p>
                                            <p className="text-sm text-muted-foreground">Analyze unforced errors</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/volleyball-win-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-emerald-600" />
                                        <div>
                                            <p className="font-medium">Win Ratio Calculator</p>
                                            <p className="text-sm text-muted-foreground">Overall team success rate</p>
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
                <meta itemProp="name" content="The Comprehensive Guide to Volleyball Points per Set Analysis and Calculation" />
                <meta itemProp="description" content="An expert-level, deeply comprehensive guide to understanding Points per Set in volleyball. Includes granular breakdown of calculation formulas, elite performance benchmarks, interpreting offensive pacing, mitigating errors, and actionable strategies to increase your team's total set scoring output." />
                <meta itemProp="keywords" content="volleyball points per set, volleyball scoring average, volleyball stats calculator, average points scored volleyball, volleyball analytics, offensive efficiency volleyball, scoring consistency" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-25" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Comprehensive Guide to Volleyball Points per Set</h2>
                <p className="text-lg italic text-muted-foreground">A definitive, deep dive into measuring absolute scoring output, predicting match outcomes, and evaluating the offensive capacity of volleyball teams and elite players on a micro-level.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What Does Points per Set Mean?</a></li>
                    <li><a href="#importance" className="hover:underline">The Statistical Importance of Scoring Averages</a></li>
                    <li><a href="#calculation" className="hover:underline">The Mathematics: How to Calculate It Properly</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Elite Industry Benchmarks: What is a "Good" Average?</a></li>
                    <li><a href="#contextual-nuances" className="hover:underline">Contextual Nuances: The Fifth Set Breakdown</a></li>
                    <li><a href="#improvement" className="hover:underline">Actionable Strategies to Improve Points per Set</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations and Analytical Blindspots of the Metric</a></li>
                </ul>
                <hr />

                {/* WHAT IS IT */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Does Points per Set Mean in Volleyball?</h2>
                <p>In standard indoor volleyball, matches are played using rally scoring, typically requiring a team to reach 25 points (and win by two) to capture a standard set. However, examining just the Win/Loss column doesn't always tell the story of how closely contested a match or an entire season actually was. This is where <strong>Points per Set (PPS)</strong> becomes a vital analytical tool.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Micro-Level Offensive Pulse</h3>
                <p>Points per Set averages the total number of points a team (or individual player) scores across every set they participate in. For an entire team, it acts as a measure of raw competitiveness and offensive ceiling. A team might lose a match 3-0, but if their set scores were 23-25, 24-26, and 22-25, their Points per Set remains incredibly high (23.0). This metric indicates they were merely one or two pivotal plays away from winning the match, proving they possess the necessary system to compete with elite teams. Conversely, an average below 15 points indicates a severe structural deficiency in the offense, serve-receive, or transition scoring.</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>For Teams:</strong> Indicates overall programmatic strength, resilience, and scoring consistency. It measures your offensive "floor".</li>
                    <li><strong>For Individuals:</strong> When applied to a single player's points (Kills + Aces + Blocks), it identifies the pure "volume scorers" and "offensive engines" of the roster.</li>
                </ul>

                <hr />

                {/* IMPORTANCE */}
                <h2 id="importance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Statistical Importance of Scoring Averages</h2>
                <p>Why do data-driven coaches care about Points per Set more than simple wins and losses early in the season? Because PPS is a predictive metric. A team that goes 10-0 but averages only 25-23 set wins (PPS around 25.0, barely outscoring opponents) is statistically at extreme risk of regression. Their wins are mathematically reliant on winning "coin-flip" points at the end of tight sets.</p>

                <p>Meanwhile, a team that goes 7-3 but averages 24.5 Points per Set, outscoring opponents by 5 or 6 points per set on average, is showing dominant underlying metrics. Their losses were likely flukes or the result of a single bad rotational matchup, and their long-term trajectory is toward a championship.</p>

                <p>Points per Set establishes a baseline for scoring expectation. If your team averages 22 points, you know your serving and defense must be elite enough to hold opponents under 21 points consistently if you want to win.</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mathematics: How to Calculate It Properly</h2>
                <p>The math behind Points per Set is straightforward, but it requires accurate bookkeeping across an entire match, weekend tournament, or season.</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Points per Set = Total Points Scored / Total Sets Played
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Breaking Down the Components</h3>

                <p><strong>Total Points Scored:</strong> </p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>For a <strong>team</strong>, this is the sum of their final scores in every set played. For example, if the scores were 25-20, 23-25, 25-15, and 25-22, the team's total points are: 25 + 23 + 25 + 25 = 98 points.</li>
                    <li>For an <strong>individual</strong>, this counts the exact points they generated through attacks (kills), serve aces, and solo or assisted blocks. (Typically, every solo block is 1 point, and every block assist is 0.5 points, though some leagues count block assists as a full point for the individual).</li>
                </ul>

                <p className="mt-4"><strong>Total Sets Played:</strong> The denominator counts every frame of action. Whether it was a dominant 25-10 set, a marathon 32-30 set, or a shortened 5th set tiebreaker played to 15, each counts as "1" in the denominator. So in a 4-set match, the denominator is simply 4.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Elite Industry Benchmarks: What is a "Good" Average?</h2>

                <p>Interpreting a good Points per Set average varies depending heavily on whether you are looking at a team-wide metric or an individual athlete's metric, as well as the level of competition.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Team Benchmarks</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>24.0+ Points:</strong> Utterly Dominant. To average this high means your team is consistently sweeping opponents without ever dropping low-scoring sets, maintaining extreme offensive momentum across the board.</li>
                    <li><strong>22.5 to 23.9 Points:</strong> Elite / Championship Contention. Indicates a team that is highly competitive in every single set they play, rarely allowing opponents to pull away on massive scoring runs.</li>
                    <li><strong>20.0 to 22.4 Points:</strong> Solid / Above Average. Represents strong mid-table teams that win matches but might suffer from occasional severe passing breakdowns that lead to lopsided set losses.</li>
                    <li><strong>17.0 to 19.9 Points:</strong> Struggling / Rebuilding. Signifies a squad that plays hard but is structurally outmatched, struggling to score efficiently against high-level defenses.</li>
                    <li><strong>Below 17.0 Points:</strong> Subpar. The team is consistently unable to manage their first-contact serve-receive, preventing them from even running an organized offense.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Individual Player Benchmarks</h3>
                <p>For an individual athlete, accounting for 6 players on the court, generating points is heavily dependent on position. Outside Hitters and Opposites are the primary point scorers, while Setters and Liberos generate virtually no direct points.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>5.0+ Points per Set:</strong> Superstar Volume Scorer. Often the primary offensive engine for elite college/pro teams. In a 4-set match, they are expected to generate 20+ points entirely on their own.</li>
                    <li><strong>3.5 to 4.9 Points:</strong> Excellent primary attacker. A highly reliable offensive weapon who shoulders a significant load for the team.</li>
                    <li><strong>2.0 to 3.4 Points:</strong> Solid middle blocker or highly efficient secondary outside hitter. Their points come through high-percentage attacks and blocks rather than massive volume.</li>
                </ul>

                <hr />

                {/* NUANCES */}
                <h2 id="contextual-nuances" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Contextual Nuances: The Fifth Set Breakdown</h2>

                <p>One of the largest statistical weaknesses in volleyball analytics is the treatment of the fifth set (or third set in best-of-3 youth and high school tournaments). Deciding sets are usually played only to 15 points (win by two).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Skew Effect</h3>
                <p>If a team plays a match that goes to 5 sets with scores: 25-23, 21-25, 25-22, 18-25, 15-13. The total points for the winning team is 104 across 5 sets.</p>
                <p className="font-mono bg-muted p-2 rounded text-center my-4">104 Points / 5 Sets = 20.8 Points per Set.</p>

                <p>Notice how winning a 5-set match actually <em>lowered</em> their average significantly compared to winning a 3-0 sweep (where their average would naturally be closer to 25.0). For highly precise analytics, advanced statisticians will sometimes separate "Standard Sets" from "Tiebreak Sets" or mathematically normalize fifth sets by multiplying their final score by 1.66 (25/15) to maintain the integrity of the average volume when comparing to non-five-set matches.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Actionable Strategies to Improve Points per Set</h2>

                <p>Increasing a team's points per set directly translates to winning more matches. Coaches can focus on the following core areas to immediately elevate offensive output:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Improving First-Ball Side-Out (FBSO) Percentage</h3>
                <p>A "Side-Out" occurs when the receiving team successfully wins the rally to take back the serve. An elite team sides out on 60-70% of opponent serves. Drilling serve-receive passing accuracy directly correlates to higher side-out percentages, guaranteeing you score consistently throughout the set. If you side out at 65%, your opponent physically cannot go on long 4-5 point serving runs.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Maximizing the Point Scoring Phase (Serving Tougher)</h3>
                <p>You cannot win a set only by siding out; you must score points while your team is serving in succession. Developing aggressive, targeted jump-float or topspin serves forces the opposing team out of system. Even if it doesn't result in an immediate ace, serving tough drastically increases your team's chance to dig a predictable attack and score via transition offense.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Mitigating Unforced Errors in Transition</h3>
                <p>The fastest way to organically lower your points per set is by making unforced errors: missing serves into the net without pressure, hitting straight out of bounds, or committing sloppy net violations. "Bleeding points" kills momentum. Teams that maintain a high points-per-set average practice smart risk management: swinging aggressively but aiming for high-percentage areas of the court (deep corners) when the set or the pass isn't perfectly on rhythm.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Developing In-System Connection</h3>
                <p>Running a faster offense with middles and intricate combinations requires a highly connected setter-hitter relationship. Enhancing your offensive speed allows attackers to face single blockers instead of well-formed double blocks, significantly increasing attack success rates and adding multiple additional points to your set average.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Analytical Blindspots of the Metric</h2>
                <p>While an incredibly valuable baseline, Points per Set should not be viewed entirely in isolation without context:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Does Not Reflect Defensive Quality:</strong> A team could average an incredible 24.5 points per set but still lose matches constantly because their blocking and floor defense are so poor that they allow the opponent to average 25.5 points. Calculating the "Point Ratio" (Points Scored vs Points Conceded) is needed to see the full picture.</li>
                    <li><strong>Opponent Strength Adjustments:</strong> Averaging 24 points against a bottom-tier basement team in your conference is very different from averaging 22 points against the defending national champions. Contextualizing who the points were scored against is paramount.</li>
                    <li><strong>The Blowout Vulnerability:</strong> Because it averages across an entire season, one terrible set (e.g., losing a set 25-9 due to a sudden rotational meltdown) can drag the average down massively, even if the team played highly competitively at a 23-point average for the other 95% of the season.</li>
                    <li><strong>Doesn't Show Clutch Performance:</strong> Averaging 23 points per set is statistically great, but if a team constantly loses 23-25, it reveals a specific psychological or tactical inability to execute under high pressure in the late-game "Red Zone" (Points 20 through 25).</li>
                </ul>

            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Detailed answers to common questions regarding volleyball scoring averages
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">1. Does a fifth set to 15 ruin my points per set average for the season?</h4>
                            <p className="text-muted-foreground">
                                Mathematically, yes; a lower-scoring set will artificially drag down your raw average since the maximum normal score is 15 instead of 25. Many professional data analysts use "Set Win Ratio" or "Overall Point Ratio" to circumvent the statistical oddities of the tiebreak set. Some statisticians normalize the data by excluding sets played to 15 from the equation enitrely, treating them as a separate analytical category.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">2. How do I accurately calculate an individual player's points per set?</h4>
                            <p className="text-muted-foreground">
                                First, sum up the player's total scoring actions: Kills + Service Aces + Solo Blocks. For Block Assists, most advanced leagues count them as 0.5 points each toward the individual's total, though some basic high school stats count them as 1. Then, divide that comprehensive number by the total number of sets that specific player physically participated in.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">3. Is it better for a team to have a high side-out percentage or a high serving point percentage?</h4>
                            <p className="text-muted-foreground">
                                A high First-Ball Side-Out (FBSO) percentage is generally considered the non-negotiable foundation of a championship team. If you consistently side-out at 70%, you are virtually guaranteed to reach the 20-point mark in every set, providing a solid Points per Set floor. However, reaching 25 and actually winning the set requires serving runs (point scoring phase). The absolute best teams excel at both, but proficient side-out provides the necessary stability to stay in the game.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">4. Why would a team have a very high points per set average but a terrible losing record?</h4>
                            <p className="text-muted-foreground">
                                This specific phenomenon indicates a team that plays incredibly tight, hard-fought matches but struggles profoundly to "close" late in the set. They might frequently reach 22 or 23 points but lose 23-25. This usually exposes a specific weakness under pressure, such as poor decision-making by setters in critical moments, a go-to hitter who chokes, or an inability to execute in the "Red Zone" (points 20 through 25).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">5. Do opponent errors (like a missed serve) count toward my team's points per set?</h4>
                            <p className="text-muted-foreground">
                                Yes. When evaluating an entire team's total points per set, every point that officially adds to your score on the scoreboard counts, including the opponent's missed serves, hitting errors, or net violations. For calculating individual player performance metrics, however, all opponent errors are strictly excluded.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">6. What exactly is considered a "Quality Set Loss" in volleyball analytics?</h4>
                            <p className="text-muted-foreground">
                                In advanced analytics, a "Quality Set Loss" is defined as losing a set while still scoring 22 or more points (e.g., losing 22-25, 23-25, or 24-26). Tracking the percentage of sets where a team scores 20+ points, regardless of whether they achieved the win or a loss, is another fantastic way to use the foundational data behind Points per Set to judge competitiveness.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">7. Can this exact formula be used for Beach Volleyball?</h4>
                            <p className="text-muted-foreground">
                                The mathematical formula works identically, but the competitive benchmarks differ wildly. Professional Beach volleyball sets are played to 21 points, with a tiebreaking third set to 15. A highly competitive, elite beach team will have an average much closer to 18.5 or 19.5 points per set, rather than the 23.5 expected in indoor volleyball.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">8. Should practice scrimmage games or preseason exhibitions be included in my calculations?</h4>
                            <p className="text-muted-foreground">
                                Absolutely no. Objective, official statistics should only include fully sanctioned matches where both teams are actively trying to win using their primary lineups. Scrimmages often use arbitrary rules, varied developmental lineups, washed-out scores, or stop-start coaching moments that severely corrupt the data and misrepresent your actual competitive offensive output.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">9. How many sets of data are required before the Points per Set average becomes reliable?</h4>
                            <p className="text-muted-foreground">
                                Statistical reliability (often called variance stabilization) typically requires a minimum of 12 to 15 sets played against varying opponents. Calculating an average after just one 3-set match is highly susceptible to small sample size bias and opponent mismatch. A 15-set sample begins to iron out the flukes and reveals the true baseline capability of the team.
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
                                    <strong className="block text-primary mb-1">Volleyball Head Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Assess overall team competitiveness, set realistic scoring expectations, and identify if the team is losing due to poor offense or poor defense across a tournament weekend.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Individual Players & Hitters</strong>
                                    <span className="text-sm text-muted-foreground">Track your own sheer volume scoring capabilities. If you aim to play college ball, knowing you guarantee your team 4.5 points per set is a massive recruiting statistic.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Recruiters & Collegiate Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Quickly identify high-volume offensive engines to target for aggressive college programs, cutting through teams with inflated win records playing in weak conferences.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Sports Data Analysts & Bettors</strong>
                                    <span className="text-sm text-muted-foreground">Extensively evaluate over/under point totals, map out predicted set margins, and construct rigorous predictive statistical models for upcoming rivalry matches.</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 border-t pt-6">
                            <h3 className="font-semibold text-lg mb-3">Understanding the Limitations</h3>
                            <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground mb-4">
                                <li><strong>Strength of Schedule Weakness:</strong> Does not factor in defensive prowess of the opposition. A high average against terrible blocking teams means very little.</li>
                                <li><strong>The Defensive Void:</strong> Evaluating Points per Set without simultaneously evaluating Points Against per Set only tells half the narrative.</li>
                                <li><strong>Fifth Set Inflation/Deflation:</strong> Including tiebreak sets inherently corrupts the raw data average, requiring mental math or manual adjustment.</li>
                            </ul>
                        </div>

                        <div className="mt-6 border-t pt-6">
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-medium text-primary">Case Study A: The Inconsistent Output Team</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Team Alpha plays a 3-set match against a mid-tier opponent. The set scores are: 25-10, 15-25, 25-11. Total points equals 65. The sets equal 3. <strong>Average = 21.6 Points per Set</strong>. While they won the match overall and got the victory, that massive 15-25 dip indicates severe serve-receive breakdowns or psychological lapses that better, more elite teams could easily exploit to beat them. Their average is decent, but their variance is terrifying.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-lg">
                                    <h4 className="font-medium text-primary">Case Study B: The Resilient Grinding Team</h4>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Team Beta loses a highly contested 3-set match against the number one ranked team in the state. The set scores are: 23-25, 24-26, 22-25. Total points equals 69. Sets equals 3. <strong>Average = 23.0 Points per Set</strong>. Surprisingly, Team Beta has a substantially higher points per set average than Team Alpha, despite losing in a sweep. It mathematically proves Team Beta is structurally very sound, elite defensively, and just needs to learn how to produce in crucial high-pressure endgame moments.
                                    </p>
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
                            <h2 className="font-semibold text-lg mb-2">Final Summary Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Volleyball Points per Set Calculator provides a vital, immediate bird's-eye view of raw scoring volume, consistency, and offensive depth for entire teams and individual star athletes.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By contextualizing total scoring output against the pure longevity of the matches played, athletes and coaches can isolate frustrating instances of "empty" high scores, pinpoint the day-to-day consistency of their offense, and measure precisely how close they are competing to elite, championship-winning division standards.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
