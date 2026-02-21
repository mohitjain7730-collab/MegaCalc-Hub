import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users } from 'lucide-react';
import RunContributionPercentageCalculatorInteractive from './run-contribution-percentage-calculator-interactive';

export default function RunContributionPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Run Contribution Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate individual run contribution percentage to measure a batsman's impact and importance to the team's total score in cricket.
                </p>
            </div>

            <RunContributionPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for run contribution percentage calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <PieChart className="h-4 w-4" />
                                Individual Runs Scored
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of runs scored by an individual batsman in a specific innings.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes all runs from boundaries and singles</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Does NOT include extras (wides, no-balls, byes, leg-byes)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Counted regardless of dismissal status</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Team Total Score
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The complete total runs scored by the entire team in that innings.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Includes all batsmen's runs plus extras</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Final score shown on scoreboard</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Used as denominator in percentage calculation</span>
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
                            Run Contribution % = (Individual Runs / Team Total) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Measures the percentage of team's total runs contributed by an individual batsman. A higher percentage indicates greater individual impact and responsibility in the team's score. This metric helps identify match-winners and assess batting depth.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Cricket Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other cricket performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Consistency metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/boundary-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Boundary Percentage</p>
                                            <p className="text-sm text-muted-foreground">Boundary scoring</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/cricket-partnership-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Partnership Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Partnership analysis</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/team-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Team Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Team scoring pace</p>
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
                <meta itemProp="name" content="The Complete Guide to Run Contribution Percentage in Cricket: Individual Impact and Team Balance Analysis" />
                <meta itemProp="description" content="An expert guide to understanding run contribution percentage in cricket, including calculation methods, performance benchmarks, team dynamics, and how individual contributions shape match outcomes across all formats." />
                <meta itemProp="keywords" content="run contribution percentage, cricket statistics, individual impact cricket, batting contribution, team batting analysis, cricket performance metrics, match-winning innings" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Run Contribution Percentage: Measuring Individual Impact in Cricket</h2>
                <p className="text-lg italic text-muted-foreground">Master the metric that reveals individual batting impact, identifies match-winners, and assesses team batting balance across all formats of cricket.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Run Contribution Percentage?</a></li>
                    <li><a href="#calculation" className="hover:underline">How to Calculate Run Contribution Percentage</a></li>
                    <li><a href="#interpretation" className="hover:underline">Interpreting Contribution Percentages</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Performance Benchmarks and Standards</a></li>
                    <li><a href="#team-dynamics" className="hover:underline">Team Dynamics and Batting Balance</a></li>
                    <li><a href="#match-winning" className="hover:underline">Match-Winning Contributions</a></li>
                    <li><a href="#improvement" className="hover:underline">Strategies to Increase Contribution</a></li>
                    <li><a href="#risks" className="hover:underline">Risks of Over-Reliance</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Run Contribution Percentage in Cricket?</h2>
                <p>The <strong>Run Contribution Percentage</strong> is a fundamental metric in cricket that measures what proportion of the team's total runs were scored by an individual batsman. It provides immediate insight into a player's impact on the team's score and their relative importance in the innings.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Individual Impact Metric</h3>
                <p>While batting average measures consistency over time and strike rate measures scoring speed, run contribution percentage answers a different question: "How much did this batsman contribute to this specific innings?" This makes it particularly valuable for analyzing individual match performances and identifying match-winners.</p>

                <p>A high contribution percentage indicates:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Dominant individual performance that shaped the innings</li>
                    <li>Heavy responsibility carried by the batsman</li>
                    <li>Potential match-winning or match-defining innings</li>
                    <li>Possible over-reliance on a single player</li>
                    <li>Anchor role in building the team total</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Historical Significance</h3>
                <p>Throughout cricket history, memorable innings are often remembered by their contribution percentage. When a batsman scores 60% or more of the team total, it becomes a legendary performance—think of individual brilliance in low-scoring matches or one batsman carrying the team single-handedly against quality bowling.</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate Run Contribution Percentage</h2>
                <p>The calculation is straightforward but provides powerful insights:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Run Contribution % = (Individual Runs / Team Total) × 100
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Understanding the Components</h3>

                <p><strong>Individual Runs:</strong> The runs scored by the specific batsman:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>All runs from boundaries (fours and sixes)</li>
                    <li>All runs from singles, twos, and threes</li>
                    <li>Does NOT include extras (wides, no-balls, byes, leg-byes)</li>
                    <li>Counted whether the batsman was dismissed or remained not out</li>
                </ul>

                <p className="mt-4"><strong>Team Total:</strong> The complete score of the team:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Sum of all batsmen's individual scores</li>
                    <li>Plus all extras (wides, no-balls, byes, leg-byes, penalties)</li>
                    <li>The final total shown on the scoreboard</li>
                    <li>Used as the denominator in the percentage calculation</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculations</h3>

                <p><strong>Example 1: Dominant Performance</strong></p>
                <p>Batsman scores 127 runs, team total is 245:</p>
                <div className="overflow-x-auto my-4 p-4 bg-muted border rounded-lg">
                    <p className="font-mono text-center">
                        Contribution % = (127 / 245) × 100 = 51.84%
                    </p>
                </div>
                <p>This batsman contributed more than half the team's runs—a match-winning performance.</p>

                <p className="mt-4"><strong>Example 2: Supporting Role</strong></p>
                <p>Batsman scores 42 runs, team total is 312:</p>
                <div className="overflow-x-auto my-4 p-4 bg-muted border rounded-lg">
                    <p className="font-mono text-center">
                        Contribution % = (42 / 312) × 100 = 13.46%
                    </p>
                </div>
                <p>This represents a decent supporting innings as part of a collective team effort.</p>

                <hr />

                {/* INTERPRETATION */}
                <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Run Contribution Percentages</h2>

                <p>Understanding what different contribution percentages mean helps evaluate individual performances in context:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Contribution Percentage Ranges</h3>

                <ul className="list-disc ml-6 space-y-3">
                    <li><strong>50%+ (Exceptional):</strong> Batsman scored more than half the team's runs. Extraordinary individual performance that single-handedly carried the team. These innings are rare and often match-winning. The team was heavily dependent on this one player.</li>

                    <li><strong>40-50% (Outstanding):</strong> Dominant contribution indicating a match-defining innings. The batsman was clearly the main run-scorer and anchored the innings. High individual impact with significant responsibility.</li>

                    <li><strong>30-40% (Excellent):</strong> Major contribution to the team total. The batsman played a crucial role, likely the top scorer or close to it. Significant impact on the match outcome.</li>

                    <li><strong>20-30% (Good):</strong> Solid contribution as part of team effort. The batsman made a meaningful impact without dominating. Part of a balanced batting performance.</li>

                    <li><strong>10-20% (Average):</strong> Moderate contribution. Decent support to the team total but not a defining performance. One of several contributors.</li>

                    <li><strong>Below 10% (Below Average):</strong> Minimal impact on team total. Either an early dismissal or very slow scoring. Limited contribution to team success.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Context Matters</h3>
                <p>Contribution percentage must be interpreted with context:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Batting position:</strong> Top-order batsmen naturally have more opportunity for high percentages</li>
                    <li><strong>Team total:</strong> 30% of 400 (120 runs) is very different from 30% of 150 (45 runs)</li>
                    <li><strong>Match situation:</strong> A lower-order batsman's 20% in a collapse is more valuable than expected</li>
                    <li><strong>Extras contribution:</strong> High extras can reduce individual percentages artificially</li>
                </ul>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Performance Benchmarks and Standards</h2>

                <p>Benchmarks vary by format, batting position, and match context:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Test Cricket Benchmarks</h3>
                <p>In Test cricket, with longer innings and more batsmen contributing:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>40%+:</strong> Exceptional individual performance, often match-saving or match-winning</li>
                    <li><strong>30-40%:</strong> Outstanding contribution, likely a century or high score</li>
                    <li><strong>20-30%:</strong> Very good innings, significant contribution to team total</li>
                    <li><strong>15-20%:</strong> Solid performance, good support to team effort</li>
                    <li><strong>Below 15%:</strong> Moderate to low contribution</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Cricket Benchmarks</h3>
                <p>ODI innings typically see more concentrated contributions:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>45%+:</strong> Match-winning performance, dominated the innings</li>
                    <li><strong>35-45%:</strong> Outstanding innings, anchored the team total</li>
                    <li><strong>25-35%:</strong> Excellent contribution, major role in team score</li>
                    <li><strong>15-25%:</strong> Good innings, meaningful contribution</li>
                    <li><strong>Below 15%:</strong> Supporting role or early dismissal</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Cricket Benchmarks</h3>
                <p>T20 cricket sees the most varied contribution patterns:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>40%+:</strong> Exceptional performance, likely match-winning</li>
                    <li><strong>30-40%:</strong> Outstanding innings, dominated the scoring</li>
                    <li><strong>20-30%:</strong> Very good contribution, key role in total</li>
                    <li><strong>15-20%:</strong> Solid innings, good support</li>
                    <li><strong>Below 15%:</strong> Minor contribution or early dismissal</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Position-Specific Expectations</h3>

                <p><strong>Top Order (1-3):</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Expected to contribute 25-40% in successful innings</li>
                    <li>Face most deliveries, have best opportunity for high scores</li>
                    <li>Contributions below 15% indicate failure to capitalize</li>
                </ul>

                <p className="mt-4"><strong>Middle Order (4-6):</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Typically contribute 15-30% in good innings</li>
                    <li>Build on foundation or rescue collapses</li>
                    <li>30%+ indicates exceptional performance</li>
                </ul>

                <p className="mt-4"><strong>Lower Order (7-11):</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Usually contribute 5-15%</li>
                    <li>20%+ is outstanding for lower-order batsmen</li>
                    <li>Often bat with tail, limiting partnership opportunities</li>
                </ul>

                <hr />

                {/* TEAM DYNAMICS */}
                <h2 id="team-dynamics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Team Dynamics and Batting Balance</h2>

                <p>Run contribution percentage reveals important insights about team batting structure and balance:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Balanced vs. Top-Heavy Batting</h3>

                <p><strong>Balanced Team Batting:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Multiple batsmen contributing 15-30% each</li>
                    <li>No single batsman exceeding 35-40%</li>
                    <li>Indicates batting depth and collective responsibility</li>
                    <li>More sustainable and resilient to individual failures</li>
                    <li>Examples: Strong teams with quality batting throughout</li>
                </ul>

                <p className="mt-4"><strong>Top-Heavy Batting:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>One or two batsmen contributing 40%+ regularly</li>
                    <li>Other batsmen contributing less than 15%</li>
                    <li>Heavy reliance on key players</li>
                    <li>Vulnerable if star batsmen fail</li>
                    <li>Common in teams with weak lower-middle order</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Analyzing Team Patterns</h3>

                <p>Teams can analyze their contribution patterns over multiple matches:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Consistency:</strong> Do the same batsmen contribute heavily every match?</li>
                    <li><strong>Distribution:</strong> Is run-scoring spread across the order or concentrated?</li>
                    <li><strong>Flexibility:</strong> Can different batsmen step up when needed?</li>
                    <li><strong>Depth:</strong> Do lower-order batsmen contribute meaningfully?</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Ideal Distribution</h3>
                <p>For a strong batting lineup, an ideal contribution distribution might be:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Top scorer: 30-40% (anchors the innings)</li>
                    <li>Second-highest: 20-25% (strong support)</li>
                    <li>Third-highest: 15-20% (solid contribution)</li>
                    <li>Others: 5-15% each (collective support)</li>
                    <li>Extras: 5-10% (typical in most innings)</li>
                </ul>

                <hr />

                {/* MATCH-WINNING CONTRIBUTIONS */}
                <h2 id="match-winning" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Match-Winning Contributions</h2>

                <p>Certain contribution percentages are strongly correlated with match-winning performances:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The 40% Threshold</h3>
                <p>Statistical analysis shows that when a batsman contributes 40% or more of the team total, the team's win percentage increases significantly:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>In ODI cricket: Teams win approximately 65-70% of matches when a batsman scores 40%+</li>
                    <li>In T20 cricket: Win percentage rises to 70-75% with 40%+ contributions</li>
                    <li>In Test cricket: 40%+ contributions often indicate match-saving or match-winning innings</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Characteristics of Match-Winning Innings</h3>

                <p>High-contribution innings typically feature:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Long duration:</strong> Batsman bats through most of the innings</li>
                    <li><strong>Partnerships:</strong> Builds crucial partnerships with multiple partners</li>
                    <li><strong>Acceleration:</strong> Increases scoring rate as innings progresses</li>
                    <li><strong>Pressure absorption:</strong> Handles difficult periods and quality bowling</li>
                    <li><strong>Match awareness:</strong> Bats according to match situation and requirements</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Famous High-Contribution Innings</h3>

                <p>Cricket history is filled with legendary high-contribution performances:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Innings where batsmen scored 60%+ of team total in low-scoring matches</li>
                    <li>Match-saving Test innings where one batsman held the innings together</li>
                    <li>ODI chases where a single batsman guided the team home</li>
                    <li>T20 innings where explosive batting from one player won the match</li>
                </ul>

                <hr />

                {/* IMPROVEMENT STRATEGIES */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Increase Run Contribution</h2>

                <p>Batsmen looking to increase their contribution percentage should focus on:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Converting Starts into Big Scores</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Mental shift at 30-40 runs:</strong> Recognize you're set and can dominate</li>
                    <li><strong>Avoid complacency:</strong> Many batsmen get out after getting comfortable</li>
                    <li><strong>Set mini-targets:</strong> Think in blocks (50, 75, 100) rather than final score</li>
                    <li><strong>Increase strike rate gradually:</strong> Accelerate as you get more settled</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Building Partnerships</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Rotate strike:</strong> Keep scoreboard moving and partner engaged</li>
                    <li><strong>Communication:</strong> Clear calling and running between wickets</li>
                    <li><strong>Protect weaker batsmen:</strong> Farm strike when batting with tail</li>
                    <li><strong>Complementary roles:</strong> One attacks while other consolidates</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Batting Through the Innings</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Stamina and fitness:</strong> Physical conditioning to bat long periods</li>
                    <li><strong>Concentration:</strong> Mental techniques to maintain focus</li>
                    <li><strong>Adaptability:</strong> Adjust to changing conditions and bowling</li>
                    <li><strong>Pacing:</strong> Know when to attack and when to consolidate</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Taking Responsibility</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Anchor role:</strong> Accept responsibility to bat through innings</li>
                    <li><strong>Pressure situations:</strong> Thrive when team needs you most</li>
                    <li><strong>Leadership:</strong> Guide less experienced batsmen through partnerships</li>
                    <li><strong>Match awareness:</strong> Understand what the team needs and deliver</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Technical Excellence</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Solid defense:</strong> Ability to play out difficult periods</li>
                    <li><strong>Shot variety:</strong> Multiple scoring options against different bowling</li>
                    <li><strong>Footwork:</strong> Getting into optimal positions consistently</li>
                    <li><strong>Game plans:</strong> Specific strategies against different bowlers</li>
                </ul>

                <hr />

                {/* RISKS */}
                <h2 id="risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risks of Over-Reliance on High Contributors</h2>

                <p>While high individual contributions can win matches, over-reliance on one or two batsmen creates significant risks:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Team Vulnerability</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Single point of failure:</strong> Team collapses if star batsman fails</li>
                    <li><strong>Predictable weakness:</strong> Opposition targets key player</li>
                    <li><strong>Pressure on individual:</strong> Unsustainable burden on one player</li>
                    <li><strong>Lack of depth:</strong> Inability to cope with injuries or form slumps</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Other Batsmen's Development</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Reduced responsibility:</strong> Other batsmen don't develop match-winning ability</li>
                    <li><strong>Confidence issues:</strong> Supporting cast lacks belief in their abilities</li>
                    <li><strong>Limited opportunities:</strong> Star batsman consumes most deliveries</li>
                    <li><strong>Passive approach:</strong> Others wait for star to win the match</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Strategic Limitations</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Inflexible tactics:</strong> Team strategy revolves around one player</li>
                    <li><strong>Opposition exploitation:</strong> Bowlers can plan specifically for key batsman</li>
                    <li><strong>Batting order constraints:</strong> Difficult to promote or demote the star</li>
                    <li><strong>Pressure situations:</strong> Team struggles when star batsman is unavailable</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Long-Term Sustainability</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Aging and decline:</strong> Eventually the star batsman's form will decline</li>
                    <li><strong>Succession planning:</strong> No clear replacement developed</li>
                    <li><strong>Team culture:</strong> Creates dependency rather than collective responsibility</li>
                    <li><strong>Competitive disadvantage:</strong> Strong teams have multiple match-winners</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Finding the Balance</h3>
                <p>The ideal team has:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>1-2 batsmen capable of 40%+ contributions when needed</li>
                    <li>3-4 batsmen regularly contributing 20-30%</li>
                    <li>Lower order capable of 10-15% contributions</li>
                    <li>Flexibility for different batsmen to step up in different matches</li>
                    <li>Collective responsibility rather than individual dependence</li>
                </ul>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Run contribution percentage is a powerful metric for understanding individual batting impact and team dynamics in cricket. It provides immediate insight into who carried the team, who supported effectively, and whether the batting lineup is balanced or over-reliant on key players.</p>

                <p>For individual batsmen, high contribution percentages represent match-winning performances and demonstrate the ability to take responsibility under pressure. For teams, analyzing contribution patterns reveals batting depth, identifies areas for improvement, and helps develop more balanced, resilient lineups.</p>

                <p>Whether you're a batsman aiming to increase your impact, a coach analyzing team balance, or a fan evaluating performances, the run contribution percentage calculator and this comprehensive guide provide the tools and knowledge to assess individual batting contributions effectively.</p>

                <p>Remember that while high individual contributions can win matches, the strongest teams combine the ability to produce match-winning individual performances with balanced contributions across the batting order, creating both match-winners and consistent collective strength.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about run contribution percentage in cricket
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good run contribution percentage in cricket?</h4>
                            <p className="text-muted-foreground">
                                A contribution of 30-40% is considered excellent, indicating a major role in the team total. Contributions above 40% are outstanding and often match-winning. For top-order batsmen, 25-35% is good, while 15-25% represents a solid supporting innings. Context matters—batting position, team total, and match situation all affect what constitutes a "good" contribution.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is run contribution percentage calculated?</h4>
                            <p className="text-muted-foreground">
                                Run contribution percentage is calculated by dividing an individual batsman's runs by the team's total score, then multiplying by 100. The formula is: (Individual Runs / Team Total) × 100. For example, if a batsman scores 75 runs and the team total is 250, the contribution is (75/250) × 100 = 30%.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What does a 50% contribution mean?</h4>
                            <p className="text-muted-foreground">
                                A 50% contribution means the batsman scored half of the team's total runs—an exceptional individual performance. These innings are rare and typically match-winning or match-saving. They indicate the batsman dominated the innings and carried the team single-handedly. However, they also suggest heavy reliance on one player and potential lack of support from other batsmen.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does run contribution percentage include extras?</h4>
                            <p className="text-muted-foreground">
                                No, the individual runs component does NOT include extras. However, the team total DOES include extras (wides, no-balls, byes, leg-byes). This means extras in the team total can slightly reduce individual contribution percentages. For example, if a batsman scores 100 runs in a team total of 250 that includes 25 extras, their contribution is 40%, not 44.4% (which it would be if extras were excluded from team total).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the highest run contribution percentage possible?</h4>
                            <p className="text-muted-foreground">
                                Theoretically, the maximum is just under 100% if a batsman scored all the runs and the team total included only a few extras. In practice, contributions above 70-80% are extremely rare and only occur in very low-scoring matches or when one batsman bats through the entire innings while all others fail. The highest recorded contributions in international cricket are typically in the 60-75% range.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does batting position affect contribution percentage?</h4>
                            <p className="text-muted-foreground">
                                Top-order batsmen (1-3) naturally have more opportunity for high contributions as they face the most deliveries and bat in the best conditions. They're expected to contribute 25-40% in successful innings. Middle-order batsmen (4-6) typically contribute 15-30%, while lower-order batsmen (7-11) usually contribute 5-15%. A lower-order batsman contributing 20%+ is exceptional, while a top-order batsman contributing under 15% indicates underperformance.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a high contribution percentage always good?</h4>
                            <p className="text-muted-foreground">
                                Not necessarily. While high individual contributions often win matches, they can also indicate over-reliance on one batsman and lack of team balance. If one player regularly contributes 40-50%+, it suggests other batsmen aren't taking responsibility. The ideal is having 1-2 players capable of high contributions when needed, but with balanced contributions (20-30% from multiple batsmen) being the norm for team sustainability.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does contribution percentage differ across formats?</h4>
                            <p className="text-muted-foreground">
                                Test cricket typically sees lower individual contributions (30-40% is exceptional) due to longer innings with more batsmen contributing. ODI cricket sees moderate concentrations (35-45% is outstanding). T20 cricket can have the highest individual contributions (40%+ is exceptional) as innings are shorter and individual brilliance has more impact. The format affects both the typical contribution ranges and their significance.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can contribution percentage predict match outcomes?</h4>
                            <p className="text-muted-foreground">
                                Yes, to some extent. Teams with a batsman contributing 40%+ win approximately 65-75% of matches across formats. However, context matters—a 40% contribution in a total of 150 is less valuable than 30% of 350. Additionally, bowling performance, opposition strength, and match conditions all affect outcomes. Contribution percentage is one indicator among many, not a definitive predictor.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How can a batsman increase their contribution percentage?</h4>
                            <p className="text-muted-foreground">
                                Key strategies include: (1) Converting starts into big scores by batting through the innings; (2) Building partnerships to stay at the crease longer; (3) Increasing strike rate as you get set; (4) Taking responsibility in pressure situations; (5) Improving fitness and concentration for long innings; (6) Developing shot variety to score against all bowling types; (7) Farming the strike when batting with tail-enders. The key is batting longer and scoring faster as you get settled.
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
                                    <strong className="block text-primary mb-1">Cricket Batsmen</strong>
                                    <span className="text-sm text-muted-foreground">Track your impact on team totals and identify opportunities to take more responsibility in innings.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Team Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Analyze batting balance, identify over-reliance on key players, and develop team strategy.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate individual match impact, compare performances, and identify match-winners.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Team Selectors</strong>
                                    <span className="text-sm text-muted-foreground">Assess which batsmen consistently deliver high-impact performances and carry the team.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Commentators</strong>
                                    <span className="text-sm text-muted-foreground">Provide context during matches by highlighting individual contributions to team totals.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Cricket Players</strong>
                                    <span className="text-sm text-muted-foreground">Identify batsmen who consistently contribute large percentages for captain/vice-captain selection.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Doesn't Account for Strike Rate</h4>
                                    <p className="text-sm text-muted-foreground">
                                        A batsman contributing 30% at strike rate 60 is very different from 30% at strike rate 140. The calculator shows contribution but not efficiency or scoring speed, which are crucial in limited-overs cricket.
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Context of Team Total Missing</h4>
                                    <p className="text-sm text-muted-foreground">
                                        40% of 400 (160 runs) is a much better performance than 40% of 150 (60 runs), but both show the same percentage. The absolute runs scored and team total quality aren't reflected in the percentage alone.
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Batting Position Not Considered</h4>
                                    <p className="text-sm text-muted-foreground">
                                        A lower-order batsman contributing 20% is exceptional, while a top-order batsman contributing 20% is moderate. The calculator doesn't adjust for batting position or opportunity differences.
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Match Situation Ignored</h4>
                                    <p className="text-sm text-muted-foreground">
                                        A 25% contribution in a successful chase under pressure is more valuable than 35% in a first-innings total with no pressure. The calculator cannot account for match context, opposition quality, or conditions.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Case Study A: Match-Winning Dominance</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Scenario:</strong> Batsman scores 142 runs, team total is 278 (contribution: 51.08%)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Exceptional individual performance. Batsman scored more than half the team's runs, indicating complete dominance. Likely batted through most of the innings and built multiple partnerships.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Team wins by 45 runs. The high-contribution innings was match-winning, setting a competitive total that the bowlers defended successfully. However, it also revealed over-reliance on one batsman.
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Case Study B: Balanced Team Effort</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Scenario:</strong> Top scorer: 78 runs, team total: 312 (contribution: 25%); Second scorer: 68 runs (21.8%); Third scorer: 52 runs (16.7%)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Excellent team batting with balanced contributions. Three batsmen contributed significantly, showing batting depth and collective responsibility. No over-reliance on single player.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Team posts commanding total and wins comfortably. The balanced contributions indicate a strong, resilient batting lineup that can succeed even if one or two batsmen fail.
                                    </p>
                                </div>

                                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Case Study C: Top-Heavy Collapse</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Scenario:</strong> Batsman scores 45 runs, team total is 127 (contribution: 35.4%)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Despite contributing over 35%, the batsman couldn't prevent a team collapse. High contribution percentage in a low total indicates lack of support from other batsmen and batting fragility.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Team loses heavily. While the individual showed fight, the low team total and lack of partnerships doomed the innings. Highlights need for batting depth and collective responsibility.
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
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Run Contribution Percentage Calculator is an essential tool for measuring individual batting impact and analyzing team batting balance in cricket.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By calculating what proportion of the team's total runs came from an individual batsman, it reveals match-winners, identifies over-reliance on key players, and helps teams develop more balanced, resilient batting lineups across all formats.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
