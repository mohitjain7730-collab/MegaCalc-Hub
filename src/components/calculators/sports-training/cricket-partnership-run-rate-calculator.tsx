import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Info, Calculator, BarChart3, Shield, FunctionSquare, CheckCircle2, Award, Zap, Activity, Users } from 'lucide-react';
import CricketPartnershipRunRateCalculatorInteractive from './cricket-partnership-run-rate-calculator-interactive';

export default function CricketPartnershipRunRateCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Cricket Partnership Run Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Use this calculator to automatically analyze batting partnerships, measure scoring pace, and evaluate partnership effectiveness based on runs, balls faced, and individual contributions.
                </p>
            </div>

            <CricketPartnershipRunRateCalculatorInteractive />

            {/* How Partnership Metrics Are Calculated */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">How Partnership Metrics Are Calculated</h2>
                    </CardTitle>
                    <CardDescription>
                        Key metrics for analyzing batting partnerships
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold">What is Partnership Run Rate?</h4>
                        <p className="text-sm text-muted-foreground">
                            Partnership run rate measures the scoring pace of two batsmen batting together. It's calculated by dividing the total runs scored during the partnership by the number of overs faced, providing insight into the partnership's effectiveness and momentum.
                        </p>
                    </div>

                    <div className="space-y-3 mt-4">
                        <h4 className="font-semibold">Format-Specific Benchmarks:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">T20 Cricket</p>
                                <p className="text-xs text-muted-foreground mt-1">Excellent: 9+ RPO</p>
                                <p className="text-xs text-muted-foreground">Good: 7-9 RPO</p>
                                <p className="text-xs text-muted-foreground">Average: 5-7 RPO</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">ODI Cricket</p>
                                <p className="text-xs text-muted-foreground mt-1">Excellent: 6+ RPO</p>
                                <p className="text-xs text-muted-foreground">Good: 5-6 RPO</p>
                                <p className="text-xs text-muted-foreground">Average: 4-5 RPO</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">Test Cricket</p>
                                <p className="text-xs text-muted-foreground mt-1">Aggressive: 4+ RPO</p>
                                <p className="text-xs text-muted-foreground">Brisk: 3-4 RPO</p>
                                <p className="text-xs text-muted-foreground">Steady: 2-3 RPO</p>
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
                        <h2 className="text-xl font-semibold">Calculation Formulas</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-3">
                        <div>
                            <p className="font-mono text-sm text-center">
                                Partnership Run Rate = (Partnership Runs / Balls Faced) × 6
                            </p>
                        </div>
                        <div>
                            <p className="font-mono text-sm text-center">
                                Strike Rate = (Runs Scored / Balls Faced) × 100
                            </p>
                        </div>
                        <div>
                            <p className="font-mono text-sm text-center">
                                Runs Per Ball = Partnership Runs / Balls Faced
                            </p>
                        </div>
                    </div>
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
                        <Link href="/team-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Team Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Team scoring pace</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
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
                        <Link href="/cricket-win-probability-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Win Probability</p>
                                            <p className="text-sm text-muted-foreground">Match prediction</p>
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
                                            <p className="text-sm text-muted-foreground">Consistency metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Award className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
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
                <meta itemProp="name" content="The Complete Guide to Cricket Partnership Run Rate: Building Match-Winning Stands" />
                <meta itemProp="description" content="Master partnership analysis in cricket with our comprehensive guide covering run rate calculation, partnership dynamics, strategic importance, role distribution, and how to build match-winning batting stands." />
                <meta itemProp="keywords" content="cricket partnership, run rate, batting partnership, strike rotation, partnership building, cricket strategy, batting analysis" />
                <meta itemProp="author" content="MegaCalc Cricket Strategy Team" />
                <meta itemProp="datePublished" content="2026-02-10" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Cricket Partnership Run Rate: Building Championship Stands</h2>
                <p className="text-lg italic text-muted-foreground">Learn how to analyze batting partnerships, understand run rate dynamics, master strike rotation, and discover the strategies used by successful batting pairs to build match-winning stands.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#what-is-partnership" className="hover:underline">What is Partnership Run Rate?</a></li>
                    <li><a href="#calculation-metrics" className="hover:underline">Calculation and Key Metrics</a></li>
                    <li><a href="#partnership-dynamics" className="hover:underline">Understanding Partnership Dynamics</a></li>
                    <li><a href="#strategic-importance" className="hover:underline">Strategic Importance of Partnerships</a></li>
                    <li><a href="#role-distribution" className="hover:underline">Role Distribution in Partnerships</a></li>
                    <li><a href="#building-partnerships" className="hover:underline">Building Successful Partnerships</a></li>
                    <li><a href="#format-differences" className="hover:underline">Format-Specific Partnership Strategies</a></li>
                    <li><a href="#famous-partnerships" className="hover:underline">Famous Partnerships in Cricket History</a></li>
                </ul>
                <hr />

                {/* WHAT IS PARTNERSHIP */}
                <h2 id="what-is-partnership" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Partnership Run Rate?</h2>
                <p>Partnership run rate measures the scoring pace of two batsmen batting together. It's calculated by dividing the total runs scored during the partnership by the number of overs faced. This metric helps assess whether a partnership is building momentum, consolidating, or struggling.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Why Partnerships Matter</h3>
                <p>Cricket is fundamentally a game of partnerships. While individual brilliance wins matches, partnerships provide the foundation. A strong partnership:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Builds Pressure:</strong> Forces bowling changes and defensive fields</li>
                    <li><strong>Provides Stability:</strong> Reduces risk of batting collapses</li>
                    <li><strong>Creates Momentum:</strong> Shifts match dynamics in team's favor</li>
                    <li><strong>Tires Bowlers:</strong> Long partnerships fatigue the bowling attack</li>
                    <li><strong>Enables Acceleration:</strong> Platform for late-innings aggression</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Partnership vs. Individual Performance</h3>
                <p>A partnership scoring at 6 runs per over is more valuable than two individual innings of 50 runs at 4 runs per over separated by wickets. Continuity matters as much as individual scores.</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation-metrics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculation and Key Metrics</h2>
                <p>To fully analyze a partnership, several metrics are used:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Standard Calculation</h3>
                <div className="p-3 bg-muted rounded-lg my-2">
                    <p className="font-mono text-sm">Run Rate = (Total Partnership Runs / Balls Faced) × 6</p>
                </div>
                <p>Example: 85 runs in 60 balls (10 overs) = 8.5 runs per over.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Contribution Ratio</h3>
                <p>Measures the balance of run-scoring between partners. Ideal partnerships often have a 50-50 or 60-40 split. Extreme imbalances (e.g., 80-20) can put pressure on one batsman.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Dot Ball Percentage</h3>
                <p>The percentage of balls where no run is scored. Lower is better. High dot ball percentages build pressure even if boundaries are hit.</p>

                <hr />

                {/* PARTNERSHIP DYNAMICS */}
                <h2 id="partnership-dynamics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Partnership Dynamics</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Communication and Understanding</h3>
                <p>The best pairs run intuitively. Calling for runs (Yes, No, Wait) must be decisive. Understanding a partner's strengths helps in strike rotation—giving the strike to the partner who is facing a favorable bowler.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Strike Rotation</h3>
                <p>Taking singles is as crucial as hitting boundaries. Rotating the strike disrupts the bowler's rhythm and prevents them from setting up a single batsman. It also keeps the scoreboard ticking during quiet overs.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Complementary Styles</h3>
                <p>Effective partnerships often feature contrasting styles:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Aggressor vs. Anchor:</strong> One takes risks while the other provides stability (e.g., Kohli & Rohit).</li>
                    <li><strong>Left-Hand vs. Right-Hand:</strong> Forces bowlers to constantly adjust their line and length.</li>
                    <li><strong>Spin Player vs. Pace Player:</strong> Each dominates their preferred bowling type.</li>
                </ul>

                <hr />

                {/* STRATEGIC IMPORTANCE */}
                <h2 id="strategic-importance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Importance of Partnerships</h2>
                <p>Partnerships are the building blocks of any innings. Their strategic value shifts depending on the match situation:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Top Order (Overs 1-10):</strong> Laying the foundation. A strong opening stand protects the middle order from the new ball.</li>
                    <li><strong>Middle Overs (Overs 11-40/15):</strong> Consolidation and rotation. Keeping the scoreboard moving without taking high risks.</li>
                    <li><strong>Death Overs:</strong> Maximizing the total. Established partners can accelerate freely, knowing there are wickets in hand.</li>
                </ul>

                <hr />

                {/* ROLE DISTRIBUTION */}
                <h2 id="role-distribution" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Role Distribution in Partnerships</h2>
                <p>Successful partnerships often have defined roles that can switch over time:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Anchor</h3>
                <p>Plays the long game, holds one end, minimizes risk, and ensures the team plays out the quota of overs.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Aggressor</h3>
                <p>Takes on the bowlers, looks for boundaries, and utilizes the freedom provided by the Anchor's stability.</p>

                <p className="mt-4"><strong>Dynamic Roles:</strong> In a great partnership, these roles are fluid. If the Aggressor struggles against a specific bowler, the Anchor takes over the attacking role.</p>

                <hr />

                {/* BUILDING PARTNERSHIPS */}
                <h2 id="building-partnerships" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Building Successful Partnerships</h2>
                <p>Building a big partnership requires a phased approach:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Phase 1: Respect (0-15 runs):</strong> Get your eye in, judge the pitch, respect good bowling.</li>
                    <li><strong>Phase 2: Rotate (15-50 runs):</strong> Focus on singles and doubles. Pierce gaps rather than hitting over the top.</li>
                    <li><strong>Phase 3: Dominate (50+ runs):</strong> With both batsmen set, put pressure on the fielding captain. Manipulate the field and look for big overs.</li>
                </ul>

                <hr />

                {/* FORMAT DIFFERENCES */}
                <h2 id="format-differences" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Format-Specific Partnership Strategies</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Cricket</h3>
                <p>Partnerships are short and intense. The "Anchor" role is diminishing; often both partners must be Aggressors. A 50-run partnership off 30 balls is gold.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Cricket</h3>
                <p>Requires the classic "Build-Consolidate-Launch" rhythm. Middle-over partnerships (overs 11-40) that avoid dot balls are often match-winning.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Test Cricket</h3>
                <p>Partnerships are about time as much as runs. Tire the bowlers, soften the ball, and break the opposition's morale. Strike rate is secondary to survival and accumulation.</p>

                <hr />

                {/* FAMOUS PARTNERSHIPS */}
                <h2 id="famous-partnerships" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Famous Partnerships in Cricket History</h2>
                <p>History is replete with legendary duos who understood each other intuitively:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Greenidge & Haynes (West Indies):</strong> The ultimate opening pair, combining aggression with technical perfection over a decade.</li>
                    <li><strong>Sangakkara & Jayawardene (Sri Lanka):</strong> Masters of batting long and big, famous for their world-record 624-run stand.</li>
                    <li><strong>Hayden & Langer (Australia):</strong> A left-handed duo that physically and mentally dominated opening attacks in Test cricket.</li>
                    <li><strong>Tendulkar & Ganguly (India):</strong> The most prolific ODI opening pair, perfectly complementing each other's styles in the late 90s.</li>
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
                        Common questions about batting partnerships
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is considered a "good" partnership run rate?</h4>
                            <p className="text-muted-foreground">
                                It depends on the format. In T20s, anything above 8.5 RPO is excellent. In ODIs, 5.5-6.0 RPO is a winning pace. In Tests, 3.0-3.5 RPO puts the team in a commanding position.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does partnership average include not outs?</h4>
                            <p className="text-muted-foreground">
                                Yes. The partnership average for a specific pair is calculated as Total Runs Scored Together / Total Number of Dismissals. If one partner remains not out, the innings counts towards runs but not the dismissal count.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why are left-right batting combinations valued?</h4>
                            <p className="text-muted-foreground">
                                They disrupt the bowler's line and length. The bowler has to constantly adjust their aim and field placements, which often leads to mistakes and loose deliveries.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the highest partnership in Test cricket?</h4>
                            <p className="text-muted-foreground">
                                The highest partnership is 624 runs between Kumar Sangakkara and Mahela Jayawardene for Sri Lanka against South Africa in 2006.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do I calculate the contribution ratio?</h4>
                            <p className="text-muted-foreground">
                                Simply divide each player's runs by the total partnership runs. For example, in a 100-run partnership where P1 scores 60 and P2 scores 40, the ratio is 60:40 or 3:2.
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
                                    <strong className="block text-primary mb-1">Coaches & Analysts</strong>
                                    <span className="text-sm text-muted-foreground">To evaluate pair chemistry and identify the most effective batting combinations.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Players</strong>
                                    <span className="text-sm text-muted-foreground">To analyze their own performance with specific partners and identify areas for improvement.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Broadcasters</strong>
                                    <span className="text-sm text-muted-foreground">To provide real-time stats and depth to match covering and commentary.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Players</strong>
                                    <span className="text-sm text-muted-foreground">To predict which batting pairs are likely to score big points together.</span>
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
                                The Cricket Partnership Run Rate Calculator provides deep insights into the dynamics of batting pairs.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By analyzing run rates, contribution ratios, and format-specific benchmarks, users can understand what makes a partnership tick and how to replicate that success in future matches.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
