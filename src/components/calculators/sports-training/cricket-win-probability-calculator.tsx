import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Info, Calculator, BarChart3, Shield, CheckCircle2, Award, Zap, Activity, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CricketWinProbabilityCalculatorInteractive from './cricket-win-probability-calculator-interactive';

export default function CricketWinProbabilityCalculator() {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Cricket Win Probability Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Use this calculator to automatically estimate win probability based on runs needed, balls remaining, wickets in hand, and current match conditions.
                </p>
            </div>

            <CricketWinProbabilityCalculatorInteractive />

            {/* How It Works */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">How Win Probability is Calculated</h2>
                    </CardTitle>
                    <CardDescription>
                        Understanding the calculation methodology
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold">Key Factors Considered:</h4>
                        <ul className="space-y-2 ml-4">
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Run Rate Comparison (40%):</strong> Current run rate vs required run rate</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Wickets in Hand (30%):</strong> Remaining batting resources</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Runs per Ball Required (20%):</strong> Chase difficulty assessment</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Pitch Conditions (10%):</strong> Batting vs bowling friendly surface</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Team Strength:</strong> Overall team quality and depth</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Match Format:</strong> T20, ODI, or Test match dynamics</span>
                            </li>
                        </ul>
                    </div>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Note:</strong> Win probability is a statistical estimate based on current match conditions. Actual outcomes can vary due to individual performances, momentum shifts, and unpredictable match events.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Related Cricket Calculators</h2>
                    </CardTitle>
                    <CardDescription>
                        Explore other cricket performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/required-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Required Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Chase planning</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/team-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Team Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring pace</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Award className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Player rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/cricket-fantasy-points-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Fantasy Points</p>
                                            <p className="text-sm text-muted-foreground">Fantasy scoring</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Batting consistency</p>
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
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
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
                <meta itemProp="name" content="The Complete Guide to Cricket Win Probability: Understanding Match Dynamics" />
                <meta itemProp="description" content="Master win probability analysis in cricket with our comprehensive guide covering calculation methodology, key factors, strategic applications, and how to interpret probability shifts during matches." />
                <meta itemProp="keywords" content="cricket win probability, match prediction, cricket analytics, run rate analysis, wickets remaining, match dynamics, cricket statistics" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-10" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Cricket Win Probability: Predicting Match Outcomes</h2>
                <p className="text-lg italic text-muted-foreground">Learn how win probability is calculated in cricket, understand the key factors that influence match outcomes, and discover how to use probability analysis for strategic decision-making.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#what-is-wp" className="hover:underline">What is Win Probability?</a></li>
                    <li><a href="#calculation" className="hover:underline">How Win Probability is Calculated</a></li>
                    <li><a href="#key-factors" className="hover:underline">Key Factors Affecting Win Probability</a></li>
                    <li><a href="#interpretation" className="hover:underline">Interpreting Probability Values</a></li>
                    <li><a href="#strategic-use" className="hover:underline">Strategic Applications</a></li>
                    <li><a href="#probability-shifts" className="hover:underline">Understanding Probability Shifts</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations and Considerations</a></li>
                    <li><a href="#historical-context" className="hover:underline">Historical Context and Famous Chases</a></li>
                </ul>
                <hr />

                {/* WHAT IS WIN PROBABILITY */}
                <h2 id="what-is-wp" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Win Probability?</h2>
                <p>Win probability in cricket is a statistical measure that estimates the likelihood of a team winning from the current match situation. Expressed as a percentage, it quantifies the batting team's chances of successfully chasing the target based on runs needed, balls remaining, wickets in hand, and other contextual factors.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Evolution of Win Probability</h3>
                <p>Win probability analysis emerged from the broader field of sports analytics, gaining prominence in cricket during the 2000s. Modern broadcasters display live win probability graphs during matches, helping viewers understand match momentum and critical turning points.</p>

                <p className="mt-4">The metric serves multiple purposes:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Match Analysis:</strong> Understand which team has the advantage at any point</li>
                    <li><strong>Strategic Planning:</strong> Inform decisions about aggression vs. consolidation</li>
                    <li><strong>Entertainment:</strong> Add drama by quantifying how close or one-sided a match is</li>
                    <li><strong>Historical Comparison:</strong> Compare current situations to historical precedents</li>
                    <li><strong>Betting Markets:</strong> Inform live betting odds and market movements</li>
                </ul>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Win Probability is Calculated</h2>
                <p>Win probability calculations use weighted scoring systems that combine multiple match factors. While sophisticated models use machine learning trained on thousands of matches, simplified models use factor-based weighting:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Core Calculation Factors</h3>

                <p className="mt-4"><strong>1. Run Rate Comparison (40% weight)</strong></p>
                <p>The difference between current run rate and required run rate is the most significant factor. A team scoring at 8 runs per over when needing 7 has a significant advantage.</p>
                <div className="p-3 bg-muted rounded-lg my-2">
                    <p className="font-mono text-sm">RR Factor = (Current RR - Required RR) × 5</p>
                    <p className="text-xs mt-1">Example: (8.5 - 7.0) × 5 = +7.5% probability boost</p>
                </div>

                <p className="mt-4"><strong>2. Wickets in Hand (30% weight)</strong></p>
                <p>More wickets provide batting depth and flexibility. The relationship isn't linear - losing early wickets is more damaging than late wickets.</p>
                <div className="p-3 bg-muted rounded-lg my-2">
                    <p className="font-mono text-sm">Wickets Factor = ((Wickets - 5) / 5) × 15</p>
                    <p className="text-xs mt-1">Example: 8 wickets in hand = ((8-5)/5) × 15 = +9% probability</p>
                </div>

                <p className="mt-4"><strong>3. Balls Remaining (20% weight)</strong></p>
                <p>More balls provide more opportunities to score. However, too many balls with too many runs needed indicates a difficult chase.</p>
                <div className="p-3 bg-muted rounded-lg my-2">
                    <p className="font-mono text-sm">Balls Factor = (Balls / 120) × 10 (capped)</p>
                    <p className="text-xs mt-1">Example: 60 balls = (60/120) × 10 = +5% probability</p>
                </div>

                <p className="mt-4"><strong>4. Contextual Adjustments (10% weight)</strong></p>
                <p>Pitch conditions, team strength, and match format provide additional context that fine-tunes the probability.</p>

                <hr />

                {/* KEY FACTORS */}
                <h2 id="key-factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Factors Affecting Win Probability</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Required Run Rate vs. Current Run Rate</h3>
                <p>The gap between these two rates is the primary determinant. A team can afford to score below the required rate early in the chase if they have wickets in hand, but the gap must narrow as overs decrease.</p>
                <p className="mt-2"><strong>Critical Threshold:</strong> When current RR falls more than 3 runs below required RR with fewer than 10 overs remaining, win probability drops sharply.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Wickets in Hand</h3>
                <p>Wickets provide insurance against failure. The value of wickets increases as the chase progresses:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>8-10 wickets:</strong> Full batting depth, can afford risks</li>
                    <li><strong>5-7 wickets:</strong> Moderate depth, balanced approach needed</li>
                    <li><strong>3-4 wickets:</strong> Limited depth, must protect wickets</li>
                    <li><strong>1-2 wickets:</strong> Critical situation, high pressure</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Balls Remaining</h3>
                <p>Time is a double-edged sword. More balls provide more opportunities, but also indicate a larger target. The relationship between balls and runs needed determines urgency:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Needing 6 RPO with 15 overs left:</strong> Comfortable chase</li>
                    <li><strong>Needing 10 RPO with 15 overs left:</strong> Difficult but achievable</li>
                    <li><strong>Needing 15 RPO with 5 overs left:</strong> Nearly impossible</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Pitch Conditions</h3>
                <p>Pitch behavior significantly affects scoring rates:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Batting-friendly (Flat):</strong> High scores are chaseable, favor batting team.</li>
                    <li><strong>Bowling-friendly (Green/Dusty):</strong> Low scores are defensible, favor bowling team.</li>
                    <li><strong>Deteriorating:</strong> Pitch gets harder to bat on over time, favoring the team bowling second.</li>
                </ul>

                <hr />

                {/* INTERPRETATION */}
                <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Probability Values</h2>
                <div className="overflow-x-auto my-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary/10">
                                <th className="p-3 border">Win Probability</th>
                                <th className="p-3 border">Meaning</th>
                                <th className="p-3 border">Typical Situation</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-3 border font-medium">90-100%</td>
                                <td className="p-3 border">Almost Certain Victory</td>
                                <td className="p-3 border">Needing 20 runs off 30 balls with 8 wickets left.</td>
                            </tr>
                            <tr>
                                <td className="p-3 border font-medium">70-89%</td>
                                <td className="p-3 border">Strong Favorite</td>
                                <td className="p-3 border">Needing 8 runs per over with wickets in hand.</td>
                            </tr>
                            <tr>
                                <td className="p-3 border font-medium">40-69%</td>
                                <td className="p-3 border">Balanced Match</td>
                                <td className="p-3 border">Needing 10 runs per over; game could go either way.</td>
                            </tr>
                            <tr>
                                <td className="p-3 border font-medium">10-39%</td>
                                <td className="p-3 border">Underdog</td>
                                <td className="p-3 border">Needing 12+ runs per over or lost key wickets.</td>
                            </tr>
                            <tr>
                                <td className="p-3 border font-medium">0-9%</td>
                                <td className="p-3 border">Near Defeat</td>
                                <td className="p-3 border">Needing 20+ runs per over or only 1 wicket left.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr />

                {/* STRATEGIC USE */}
                <h2 id="strategic-use" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Applications</h2>
                <p>Teams use win probability models to inform real-time decisions:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Defensive vs. Aggressive Fields</h3>
                <p>If win probability &gt; 80%, captains set defensive fields to cut off boundaries. If probability drops &lt; 40%, they bring fielders in to hunt for wickets, as containment alone won't win.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Batting Powerplay Management</h3>
                <p>Teams analyze at which over their probability is maximized by taking the Powerplay. Often, taking it immediately after a wicket stabilizes probability, whereas taking it with set batsmen spikes it.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">DL/DLS Par Scores</h3>
                <p>In rain-affected matches, the DLS par score is essentially the score at which win probability is 50%. Teams pace their innings to stay above this par score.</p>

                <hr />

                {/* PROBABILITY SHIFTS */}
                <h2 id="probability-shifts" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Probability Shifts</h2>
                <p>Probability is volatile. Key events cause massive swings:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 rounded-lg">
                        <strong className="text-red-700 dark:text-red-400">Wicket Fall</strong>
                        <p className="text-sm mt-1">Losing a set batsman can drop win probability by 15-25% instantly, especially in the death overs.</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 rounded-lg">
                        <strong className="text-green-700 dark:text-green-400">Big Over</strong>
                        <p className="text-sm mt-1">Scoring 20 runs in an over reduces required rate significantly, potentially boosting probability by 10-20%.</p>
                    </div>
                </div>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Considerations</h2>
                <p>While powerful, win probability models are not crystal balls:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Human Element:</strong> They cannot predict a dropped catch, a fielding error, or a sudden injury.</li>
                    <li><strong>Player Form:</strong> They assume "average" player performance. A superstar in form might chase down an "impossible" target (e.g., Maxwell's 201* vs Afghanistan).</li>
                    <li><strong>Dew Factor:</strong> Models may struggle to quantify the impact of wet balls on bowling accuracy in the second innings.</li>
                </ul>

                <hr />

                {/* HISTORICAL CONTEXT */}
                <h2 id="historical-context" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Historical Context and Famous Chases</h2>
                <p>Some matches defied win probability models entirely:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Australia vs South Africa (438 Game):</strong> At the break, chasing 434 was considered nearly impossible (&lt;1% probability). South Africa won with 1 ball to spare.</li>
                    <li><strong>India vs Australia (Brisbane 2021):</strong> Chasing 300+ on a Day 5 Gabba pitch with a B-team was statistically improbable, yet India won.</li>
                    <li><strong>England vs Australia (Headingley 2019):</strong> With 1 wicket left and 70 runs needed, Stokes' probability was &lt;2%, yet he led England to victory.</li>
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
                        Common questions about win probability
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How accurate are win probability calculators?</h4>
                            <p className="text-muted-foreground">
                                Modern models are highly accurate, often predicting the winner correctly in 70-80% of matches once the second innings is midway through. However, T20s are inherently volatile and harder to predict than ODIs.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does this calculator use the Duckworth-Lewis-Stern (DLS) method?</h4>
                            <p className="text-muted-foreground">
                                No, this calculator uses a simplified proprietary algorithm based on run rate, wickets, and balls remaining. DLS is a specific method for setting revised targets in rain-affected matches, though it uses similar underlying logic.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why does a single wicket drop the probability so much?</h4>
                            <p className="text-muted-foreground">
                                Wickets represent resources. Losing a batsman means exposing the lower order (tailenders) who are less likely to score quickly. It also breaks partnerships and momentum, forcing the new batsman to start from scratch.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can win probability ever be 100% before the game ends?</h4>
                            <p className="text-muted-foreground">
                                Mathematically, no, until the winning run is hit or the last wicket falls. However, statistically, if a team needs 2 runs from 60 balls with 10 wickets left, the model will essentially show 99.99% or round to 100%.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does the toss affect win probability?</h4>
                            <p className="text-muted-foreground">
                                Before a ball is bowled, probability is usually 50-50. However, at certain venues with a strong bias (e.g., chasing at Wankhede Stadium), the team winning the toss might start with a slight statistical advantage (e.g., 55-45).
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
                            <h3 className="font-semibold text-lg mb-3">Who Uses Win Probability?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Broadcasters</strong>
                                    <span className="text-sm text-muted-foreground">To show the "Worm" and "Win Predictor" graphics during live matches.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Betting Markets</strong>
                                    <span className="text-sm text-muted-foreground">To set and adjust live odds as the match situation changes ball-by-ball.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Teams & Captains</strong>
                                    <span className="text-sm text-muted-foreground">To decide when to use key bowlers or take the Powerplay/Surge.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fans</strong>
                                    <span className="text-sm text-muted-foreground">To understand the "state of the game" beyond just the score.</span>
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
                                The Cricket Win Probability Calculator gives you a professional-grade forecast of the match outcome.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By weighing the required run rate against wickets in hand and overs remaining, it cuts through the noise to tell you exactly which team is in the driver's seat.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
