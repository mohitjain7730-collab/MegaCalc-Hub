import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, Zap, Shield } from 'lucide-react';
import MatchImpactScoreCalculatorInteractive from './match-impact-score-calculator-interactive';

export default function MatchImpactScoreCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Cricket Match Impact Score Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate comprehensive match impact score combining batting, bowling, and fielding performance to measure all-round contribution in cricket.
                </p>
            </div>

            <MatchImpactScoreCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for match impact score calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Batting Performance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Runs Scored</h4>
                                    <p className="text-sm text-muted-foreground">Total runs scored by the player in the match. Higher runs increase batting score, with bonuses for high strike rates.</p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300">Balls Faced</h4>
                                    <p className="text-sm text-muted-foreground">Number of balls faced. Used to calculate strike rate, which affects batting score multiplier.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                Bowling Performance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                    <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Wickets Taken</h4>
                                    <p className="text-sm text-muted-foreground">Number of wickets taken. Each wicket contributes 25 base points to bowling score.</p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                    <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Runs Conceded</h4>
                                    <p className="text-sm text-muted-foreground">Runs given away while bowling. Used to calculate economy rate for score adjustments.</p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                    <h4 className="font-semibold mb-2 text-green-700 dark:text-green-300">Overs Bowled</h4>
                                    <p className="text-sm text-muted-foreground">Number of overs bowled. Used to calculate economy rate (runs per over).</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Fielding Performance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                                    <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Catches</h4>
                                    <p className="text-sm text-muted-foreground">Number of catches taken. Each catch contributes 10 points to fielding score.</p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                                    <h4 className="font-semibold mb-2 text-purple-700 dark:text-purple-300">Run Outs</h4>
                                    <p className="text-sm text-muted-foreground">Number of run outs effected. Each run out contributes 15 points to fielding score.</p>
                                </div>
                            </div>
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
                    <div className="p-4 bg-muted rounded-lg space-y-3">
                        <p className="font-mono text-sm"><strong>Batting Score:</strong> Runs × 1.0 + Strike Rate Bonus</p>
                        <p className="font-mono text-sm"><strong>Bowling Score:</strong> Wickets × 25 + Economy Bonus</p>
                        <p className="font-mono text-sm"><strong>Fielding Score:</strong> (Catches × 10) + (Run Outs × 15)</p>
                        <p className="font-mono text-sm text-center font-bold mt-4">Match Impact Score = Batting + Bowling + Fielding</p>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Strike Rate Bonuses:</strong></p>
                        <ul className="list-disc ml-6">
                            <li>SR &gt; 150: +50% of runs</li>
                            <li>SR 130-150: +30% of runs</li>
                            <li>SR 100-130: +10% of runs</li>
                            <li>SR &lt; 70: -20% of runs</li>
                        </ul>
                        <p className="mt-3"><strong>Economy Bonuses:</strong></p>
                        <ul className="list-disc ml-6">
                            <li>Economy &lt; 5: +10 per wicket</li>
                            <li>Economy 5-6: +5 per wicket</li>
                            <li>Economy 6-7: +2 per wicket</li>
                            <li>Economy &gt; 10: -5 per wicket</li>
                        </ul>
                    </div>
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
                        <Link href="/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Batting consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Bowling efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/bowling-economy-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Economy Rate</p>
                                            <p className="text-sm text-muted-foreground">Run containment</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/cricket-fantasy-points-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Award className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Fantasy Points</p>
                                            <p className="text-sm text-muted-foreground">Fantasy scoring</p>
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
                <meta itemProp="name" content="The Complete Guide to Match Impact Score in Cricket" />
                <meta itemProp="description" content="Expert guide to understanding match impact score in cricket, combining batting, bowling, and fielding performance for comprehensive all-round assessment." />
                <meta itemProp="keywords" content="match impact score, cricket all-rounder, performance metrics, batting bowling fielding, cricket statistics" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">The Complete Guide to Match Impact Score in Cricket</h2>
                <p className="text-lg italic">Master the comprehensive metric that measures all-round match contribution across batting, bowling, and fielding.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">What is Match Impact Score?</h2>
                <p>Match Impact Score is a comprehensive metric that quantifies a player's total contribution to a cricket match by combining batting, bowling, and fielding performance into a single numerical score. Unlike traditional statistics that measure individual skills in isolation, match impact score reveals the complete picture of a player's influence on the match outcome.</p>

                <p>This metric is particularly valuable for:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Evaluating all-rounders who contribute across multiple departments</li>
                    <li>Identifying match-winners beyond just runs or wickets</li>
                    <li>Comparing players with different roles and skill sets</li>
                    <li>Recognizing complete performances that shape match outcomes</li>
                    <li>Selecting players based on total match contribution</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">How Match Impact Score is Calculated</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Batting Component</h3>
                <p>The batting score starts with runs scored and adds bonuses based on strike rate:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Base score:</strong> Runs × 1.0</li>
                    <li><strong>Strike rate &gt; 150:</strong> Additional 50% of runs</li>
                    <li><strong>Strike rate 130-150:</strong> Additional 30% of runs</li>
                    <li><strong>Strike rate 100-130:</strong> Additional 10% of runs</li>
                    <li><strong>Strike rate &lt; 70:</strong> Penalty of 20% of runs</li>
                </ul>
                <p className="mt-3"><strong>Example:</strong> 75 runs off 50 balls (SR 150) = 75 + (75 × 0.5) = 112.5 batting points</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Bowling Component</h3>
                <p>The bowling score rewards wickets and economy:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Base score:</strong> Wickets × 25</li>
                    <li><strong>Economy &lt; 5:</strong> Additional 10 points per wicket</li>
                    <li><strong>Economy 5-6:</strong> Additional 5 points per wicket</li>
                    <li><strong>Economy 6-7:</strong> Additional 2 points per wicket</li>
                    <li><strong>Economy &gt; 10:</strong> Penalty of 5 points per wicket</li>
                </ul>
                <p className="mt-3"><strong>Example:</strong> 3 wickets, 28 runs in 4 overs (Econ 7.0) = 3 × 25 = 75 bowling points</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Fielding Component</h3>
                <p>The fielding score is straightforward:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Catches:</strong> 10 points each</li>
                    <li><strong>Run outs:</strong> 15 points each</li>
                </ul>
                <p className="mt-3"><strong>Example:</strong> 2 catches + 1 run out = (2 × 10) + (1 × 15) = 35 fielding points</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Performance Benchmarks</h2>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>200+ points:</strong> Match-winning performance - exceptional all-round contribution</li>
                    <li><strong>150-200 points:</strong> Outstanding performance - significant match impact</li>
                    <li><strong>100-150 points:</strong> Excellent contribution - strong influence on outcome</li>
                    <li><strong>60-100 points:</strong> Good performance - meaningful contribution</li>
                    <li><strong>30-60 points:</strong> Moderate impact - decent supporting role</li>
                    <li><strong>Below 30 points:</strong> Limited impact - minimal contribution</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Interpreting Match Impact Scores</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">All-Rounder Performances</h3>
                <p>All-rounders typically achieve high impact scores by contributing across departments:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>50 runs + 2 wickets + 1 catch = ~130-140 points (excellent)</li>
                    <li>75 runs + 3 wickets + 2 catches = ~180-200 points (outstanding)</li>
                    <li>100 runs + 4 wickets + 1 run out = ~230-250 points (match-winning)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Specialist Performances</h3>
                <p>Specialists can achieve high scores through dominant performances in their primary skill:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Batsman: 120 runs at SR 140 + 2 catches = ~160 points</li>
                    <li>Bowler: 5 wickets at economy 5.5 + 1 catch = ~145 points</li>
                    <li>Wicket-keeper: 40 runs + 3 catches + 1 stumping = ~90 points</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Strategies to Maximize Impact Score</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Develop All-Round Skills</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Batsmen should work on fielding to add 10-30 points per match</li>
                    <li>Bowlers should develop batting to contribute 20-40 additional points</li>
                    <li>All-rounders should maintain balance across all three departments</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Focus on Quality Over Quantity</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>High strike rate batting earns bonus points</li>
                    <li>Economical bowling with wickets maximizes bowling score</li>
                    <li>Sharp fielding adds valuable points</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Match Awareness</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Understand when to attack for strike rate bonuses</li>
                    <li>Bowl economically in crucial overs</li>
                    <li>Stay alert in the field for catching opportunities</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Advantages of Match Impact Score</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Comprehensive:</strong> Captures all aspects of performance</li>
                    <li><strong>Fair comparison:</strong> Allows comparing players with different roles</li>
                    <li><strong>Match-focused:</strong> Measures actual contribution to specific match</li>
                    <li><strong>Rewards efficiency:</strong> Bonuses for strike rate and economy</li>
                    <li><strong>Values fielding:</strong> Recognizes often-overlooked contributions</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Limitations</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Arbitrary weights:</strong> Point values are subjective</li>
                    <li><strong>Context missing:</strong> Doesn't account for match situation or pressure</li>
                    <li><strong>Format differences:</strong> Same weights across T20, ODI, Test may not be ideal</li>
                    <li><strong>Opposition quality:</strong> Doesn't adjust for strength of opposition</li>
                </ul>

                <h2 className="text-2xl font-bold text-foreground mt-8">Conclusion</h2>
                <p>Match Impact Score provides a comprehensive, single-number assessment of a player's total contribution to a cricket match. By combining batting, bowling, and fielding performance with quality bonuses, it reveals match-winners and all-round contributors who might be overlooked by traditional statistics.</p>

                <p>While not perfect, match impact score offers valuable insights for team selection, performance analysis, and identifying players who consistently deliver complete performances across all aspects of the game.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good match impact score?</h4>
                            <p className="text-muted-foreground">
                                A score of 100+ indicates excellent match contribution, 150+ is outstanding, and 200+ is match-winning. Scores depend on role: all-rounders typically score higher (120-180), while specialists might score 80-140 in good performances.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is match impact score different from fantasy points?</h4>
                            <p className="text-muted-foreground">
                                Match impact score focuses on actual match contribution with quality bonuses (strike rate, economy), while fantasy points use platform-specific rules with milestones and captain multipliers. Impact score is for performance analysis; fantasy points are for gaming.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a bowler score higher than a batsman?</h4>
                            <p className="text-muted-foreground">
                                Yes. A bowler taking 5 wickets at good economy (125-150 points) can outscore a batsman making 50 runs (50-70 points). Wickets are heavily weighted (25 points each) to reflect their match-winning value.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why does strike rate affect batting score?</h4>
                            <p className="text-muted-foreground">
                                Strike rate bonuses reward efficient, match-winning batting. Scoring 75 runs at SR 150 has more match impact than 75 at SR 75, especially in limited-overs cricket. The bonuses reflect this difference in value.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How important is fielding in match impact score?</h4>
                            <p className="text-muted-foreground">
                                Fielding typically contributes 10-40 points (1-3 catches/run outs). While smaller than batting/bowling, it can be decisive: 2 catches can turn a moderate performance (80 points) into a good one (100 points).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is match impact score suitable for all formats?</h4>
                            <p className="text-muted-foreground">
                                The current formula works best for limited-overs cricket (T20, ODI) where strike rate and economy are crucial. For Test cricket, the weights might need adjustment as patience and consistency matter more than aggression.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can match impact score predict match winners?</h4>
                            <p className="text-muted-foreground">
                                Generally, yes. Players with 150+ impact scores are often on the winning side, as such scores indicate dominant performances. However, team performance matters—one player's 200-point performance can't overcome collective team failure.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How can I improve my match impact score?</h4>
                            <p className="text-muted-foreground">
                                Focus on your primary skill first, then add secondary contributions. Batsmen: increase strike rate and take catches. Bowlers: improve economy and develop batting. All-rounders: maintain balance and excel in fielding.
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
                                    <strong className="block text-primary mb-1">Cricket Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate all-round contributions and identify complete performers.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Team Selectors</strong>
                                    <span className="text-sm text-muted-foreground">Compare players across different roles based on total match impact.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Players</strong>
                                    <span className="text-sm text-muted-foreground">Track your all-round contribution and identify areas for improvement.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Performance Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Analyze match-winning performances and player value.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Subjective Weighting</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Point values (25 per wicket, 10 per catch) are somewhat arbitrary. Different weighting systems could produce different results.
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">No Context Adjustment</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Doesn't account for match situation, pressure moments, or opposition quality. A 50 in a World Cup final under pressure is more valuable than 50 in a low-stakes match.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Case Study A: Match-Winning All-Rounder</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Performance:</strong> 82 runs off 54 balls (SR 151.9), 3 wickets for 28 in 4 overs (Econ 7.0), 2 catches
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Impact Score:</strong> Batting: 123 | Bowling: 75 | Fielding: 20 | <strong>Total: 218</strong>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Analysis:</strong> Exceptional match-winning performance. Dominated with bat, broke partnerships with ball, and contributed in field. Complete all-round display.
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Case Study B: Specialist Batsman Excellence</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Performance:</strong> 115 runs off 78 balls (SR 147.4), 0 wickets, 3 catches
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Impact Score:</strong> Batting: 149.5 | Bowling: 0 | Fielding: 30 | <strong>Total: 179.5</strong>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Analysis:</strong> Outstanding batting performance with excellent fielding support. High strike rate earned significant bonus points. Match-defining innings.
                                    </p>
                                </div>

                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Case Study C: Balanced Contribution</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Performance:</strong> 45 runs off 38 balls (SR 118.4), 2 wickets for 32 in 4 overs (Econ 8.0), 1 catch
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Impact Score:</strong> Batting: 49.5 | Bowling: 50 | Fielding: 10 | <strong>Total: 109.5</strong>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Analysis:</strong> Excellent all-round contribution with balanced performance across all departments. Solid supporting role in team victory.
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
                                The Match Impact Score Calculator is a comprehensive tool for measuring all-round cricket performance by combining batting, bowling, and fielding contributions.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By rewarding quality (strike rate, economy) alongside quantity (runs, wickets), it identifies match-winners and complete performers who shape match outcomes across all departments.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
