import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users } from 'lucide-react';
import PowerplayRunRateCalculatorInteractive from './powerplay-run-rate-calculator-interactive';

export default function PowerplayRunRateCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Powerplay Run Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate powerplay run rate to measure batting aggression and effectiveness during field restriction overs in limited-overs cricket.
                </p>
            </div>

            <PowerplayRunRateCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key components required for powerplay run rate calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Zap className="h-4 w-4" />
                                Runs Scored in Powerplay
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of runs scored by the batting team during the powerplay overs (typically first 6-10 overs).
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes all runs from boundaries, singles, and extras</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Counted from ball one until end of powerplay restrictions</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Critical metric for assessing aggressive intent</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Overs Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of overs completed during the powerplay period (can include partial overs).
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>ODI powerplay: typically 10 overs</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>T20 powerplay: typically 6 overs</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Can be partial if innings interrupted</span>
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
                            Powerplay Run Rate = Runs Scored in Powerplay / Overs Played
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Measures the scoring rate during powerplay overs when field restrictions are in place. A higher run rate indicates effective exploitation of fielding limitations and aggressive batting intent. This metric is crucial for setting up strong totals in limited-overs cricket.
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
                        <Link href="/category/sports-training/team-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Team Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Overall scoring pace</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/required-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Required Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Chase calculator</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/strike-rate-calculator" className="block">
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
                        <Link href="/category/sports-training/boundary-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Boundary Percentage</p>
                                            <p className="text-sm text-muted-foreground">Boundary scoring rate</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
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
                        <Link href="/category/sports-training/cricket-partnership-run-rate-calculator" className="block">
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
                    </div>
                </CardContent>
            </Card>

            {/* Complete Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="The Complete Guide to Powerplay Run Rate in Cricket: Strategy, Analysis, and Performance Optimization" />
                <meta itemProp="description" content="An expert guide to understanding powerplay run rate in limited-overs cricket, including calculation methods, format-specific benchmarks, strategic importance, and how to maximize scoring during field restriction overs." />
                <meta itemProp="keywords" content="powerplay run rate, cricket powerplay, ODI powerplay, T20 powerplay, field restrictions cricket, powerplay strategy, cricket scoring rate, limited overs cricket" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Powerplay Run Rate: Maximizing Scoring During Field Restrictions</h2>
                <p className="text-lg italic text-muted-foreground">Master the critical metric that determines early momentum, sets up commanding totals, and exploits fielding restrictions in modern limited-overs cricket.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Powerplay Run Rate?</a></li>
                    <li><a href="#calculation" className="hover:underline">How to Calculate Powerplay Run Rate</a></li>
                    <li><a href="#importance" className="hover:underline">Why Powerplay Run Rate Matters</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Format-Specific Benchmarks (ODI vs T20)</a></li>
                    <li><a href="#strategy" className="hover:underline">Strategic Approaches to Powerplay Batting</a></li>
                    <li><a href="#fielding-restrictions" className="hover:underline">Understanding Field Restrictions</a></li>
                    <li><a href="#improvement" className="hover:underline">How to Improve Powerplay Run Rate</a></li>
                    <li><a href="#risks" className="hover:underline">Risks and Trade-offs</a></li>
                </ul>
                <hr />

                {/* WHAT IS POWERPLAY RUN RATE */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Powerplay Run Rate in Cricket?</h2>
                <p>The <strong>Powerplay Run Rate</strong> is a specialized metric in limited-overs cricket that measures the scoring rate during the powerplay overs—the initial phase of an innings when fielding restrictions are in place. It represents the average number of runs scored per over during this critical period.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Foundation of Limited-Overs Success</h3>
                <p>In modern ODI and T20 cricket, the powerplay phase has become arguably the most important period of an innings. With only two fielders allowed outside the 30-yard circle, batsmen have a unique opportunity to score quickly with reduced risk of boundary fielders cutting off shots.</p>

                <p>A strong powerplay run rate indicates:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Effective exploitation of field restrictions</li>
                    <li>Aggressive batting intent and positive mindset</li>
                    <li>Strong foundation for a commanding total</li>
                    <li>Psychological advantage over the opposition</li>
                    <li>Reduced pressure on middle and death overs</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Evolution of Powerplay Rules</h3>
                <p>The powerplay concept has evolved significantly since its introduction. Originally, ODI cricket had three powerplay blocks, but the current format features a single mandatory powerplay of 10 overs at the start of each innings. T20 cricket has a 6-over powerplay. These restrictions force fielding teams to keep most fielders inside the circle, creating scoring opportunities for batsmen willing to attack.</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate Powerplay Run Rate</h2>
                <p>The powerplay run rate calculation is straightforward but provides crucial insights into batting performance:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Powerplay Run Rate = Runs Scored in Powerplay / Overs Played in Powerplay
                    </p>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">Understanding the Components</h3>

                <p><strong>Runs Scored in Powerplay:</strong> This includes all runs accumulated during the powerplay overs:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Runs from boundaries (fours and sixes)</li>
                    <li>Runs from singles, twos, and threes</li>
                    <li>All extras (wides, no-balls, byes, leg-byes)</li>
                    <li>Penalty runs if applicable</li>
                </ul>

                <p className="mt-4"><strong>Overs Played:</strong> The number of complete and partial overs bowled during the powerplay:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>ODI: Typically 10 overs (overs 1-10)</li>
                    <li>T20: Typically 6 overs (overs 1-6)</li>
                    <li>Can be less if innings is interrupted or ends early</li>
                    <li>Partial overs are counted as decimals (e.g., 5.3 overs = 5.5 overs)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
                <p>If a team scores 65 runs in the first 10 overs of an ODI innings:</p>

                <div className="overflow-x-auto my-4 p-4 bg-muted border rounded-lg">
                    <p className="font-mono text-center">
                        Powerplay Run Rate = 65 runs / 10 overs = 6.5 runs per over
                    </p>
                </div>

                <p>This 6.5 run rate would be considered a solid powerplay performance in ODI cricket, providing a good platform for acceleration in the middle overs.</p>

                <hr />

                {/* IMPORTANCE */}
                <h2 id="importance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Powerplay Run Rate Matters</h2>

                <p>The powerplay run rate has become one of the most critical metrics in limited-overs cricket for several compelling reasons:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Sets the Tone for the Innings</h3>
                <p>A strong powerplay performance creates positive momentum that carries through the entire innings. Teams that score quickly in the powerplay put psychological pressure on the opposition and give their own team confidence. Conversely, a poor powerplay can deflate team morale and put immense pressure on the remaining overs.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Exploits Fielding Restrictions</h3>
                <p>The powerplay is the only period when fielding teams are severely restricted in their field placements. With only two fielders allowed outside the 30-yard circle, batsmen have significantly more gaps to target and boundaries to hit. Failing to capitalize on these restrictions means missing the best scoring opportunity of the innings.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Reduces Pressure on Later Overs</h3>
                <p>A high powerplay run rate means the team has runs "in the bank" and doesn't need to take excessive risks in the middle and death overs. This allows for more calculated batting and better wicket preservation. Teams with poor powerplay performances often lose wickets trying to compensate later.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Correlates Strongly with Match Outcomes</h3>
                <p>Statistical analysis consistently shows that teams with superior powerplay run rates win more matches. In T20 cricket especially, the powerplay often determines the match outcome. Research indicates that teams scoring above 50 runs in the T20 powerplay win approximately 70% of their matches.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Influences Opposition Strategy</h3>
                <p>A strong powerplay forces the opposition to adjust their bowling and fielding strategies, potentially disrupting their game plan. Bowlers may become defensive, captains may make reactive field changes, and the overall opposition strategy can become fragmented.</p>

                <hr />

                {/* FORMAT-SPECIFIC BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Format-Specific Benchmarks: ODI vs T20 Powerplay Run Rates</h2>

                <p>Powerplay expectations differ significantly between ODI and T20 cricket due to the different lengths of innings and strategic priorities:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">ODI Cricket Powerplay Benchmarks (10 Overs)</h3>
                <p>In 50-over cricket, teams have more time to build innings, so powerplay aggression is balanced with wicket preservation:</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>8.0+ runs per over (80+ runs):</strong> Exceptional powerplay. Elite batting performance that sets up totals of 320+. Rare and match-defining.</li>
                    <li><strong>6.5-8.0 runs per over (65-80 runs):</strong> Excellent powerplay. Strong foundation for totals of 280-320. Considered very successful.</li>
                    <li><strong>5.0-6.5 runs per over (50-65 runs):</strong> Good powerplay. Solid platform for totals of 250-280. Acceptable performance.</li>
                    <li><strong>4.0-5.0 runs per over (40-50 runs):</strong> Below average powerplay. Puts pressure on middle overs. Difficult to reach 250.</li>
                    <li><strong>Below 4.0 runs per over (under 40 runs):</strong> Poor powerplay. Significant deficit that's very difficult to overcome. Likely below-par total.</li>
                </ul>

                <p className="mt-4"><strong>Modern ODI Trends:</strong> The average ODI powerplay run rate has increased from around 4.5 in the early 2000s to approximately 5.5-6.0 in modern cricket. Top teams regularly exceed 6.0 runs per over in the powerplay.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">T20 Cricket Powerplay Benchmarks (6 Overs)</h3>
                <p>In T20 cricket, the powerplay is even more critical, and aggression is paramount from ball one:</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>10.0+ runs per over (60+ runs):</strong> Outstanding powerplay. Dominant performance that often decides the match. Sets up totals of 200+.</li>
                    <li><strong>8.0-10.0 runs per over (48-60 runs):</strong> Excellent powerplay. Strong platform for competitive totals of 170-200.</li>
                    <li><strong>6.5-8.0 runs per over (39-48 runs):</strong> Good powerplay. Decent foundation for totals of 150-170.</li>
                    <li><strong>5.0-6.5 runs per over (30-39 runs):</strong> Below average powerplay. Significant pressure on middle and death overs. Difficult to reach 150.</li>
                    <li><strong>Below 5.0 runs per over (under 30 runs):</strong> Poor powerplay. Very difficult to post competitive total. High risk of below-par score.</li>
                </ul>

                <p className="mt-4"><strong>T20 Powerplay Importance:</strong> In T20 cricket, approximately 30-35% of the total score typically comes from the powerplay overs (6 out of 20 overs). Teams that score above 50 in the powerplay have a significantly higher win percentage.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Venue and Conditions Impact</h3>
                <p>These benchmarks can vary based on:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Pitch conditions:</strong> Flat batting tracks vs. seaming/spinning surfaces</li>
                    <li><strong>Ground dimensions:</strong> Small boundaries favor higher run rates</li>
                    <li><strong>Weather:</strong> Overcast conditions assist bowlers, reducing run rates</li>
                    <li><strong>Dew factor:</strong> Evening matches may have different powerplay dynamics</li>
                </ul>

                <hr />

                {/* STRATEGIC APPROACHES */}
                <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategic Approaches to Powerplay Batting</h2>

                <p>Successful powerplay batting requires a well-planned strategy that balances aggression with calculated risk-taking:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. The Aggressive Approach</h3>
                <p><strong>Philosophy:</strong> Attack from ball one, prioritize boundaries, accept higher risk of early wickets.</p>
                <p><strong>Best for:</strong> T20 cricket, teams with deep batting lineups, chasing high totals.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Target run rate: 8-10+ per over</li>
                    <li>Focus on finding boundaries every over</li>
                    <li>Use of innovative shots (scoops, ramps, reverse sweeps)</li>
                    <li>Minimal concern for wicket preservation</li>
                    <li>Examples: Teams like England, West Indies in T20s</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. The Balanced Approach</h3>
                <p><strong>Philosophy:</strong> Build partnerships while maintaining a healthy run rate, calculated aggression.</p>
                <p><strong>Best for:</strong> ODI cricket, teams with moderate batting depth, setting first innings totals.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Target run rate: 5.5-7.0 per over</li>
                    <li>One batsman anchors while the other attacks</li>
                    <li>Rotate strike consistently, capitalize on loose deliveries</li>
                    <li>Preserve wickets while maintaining momentum</li>
                    <li>Examples: India, Australia in ODIs</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. The Conservative Approach</h3>
                <p><strong>Philosophy:</strong> Prioritize wicket preservation, build platform for later acceleration.</p>
                <p><strong>Best for:</strong> Difficult batting conditions, teams with strong middle-order finishers.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Target run rate: 4.5-5.5 per over</li>
                    <li>See off new ball, wait for bowlers to tire</li>
                    <li>Minimize risk, focus on survival</li>
                    <li>Rely on middle and death overs for acceleration</li>
                    <li>Note: This approach is increasingly rare in modern cricket</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. The Situational Approach</h3>
                <p><strong>Philosophy:</strong> Adapt strategy based on match situation, conditions, and opposition.</p>
                <p><strong>Best for:</strong> Experienced teams with versatile players.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Assess conditions in first 2-3 overs, then commit to strategy</li>
                    <li>Adjust based on early wickets or strong start</li>
                    <li>Consider opposition bowling strengths and weaknesses</li>
                    <li>Factor in chase requirements or first innings targets</li>
                </ul>

                <hr />

                {/* FIELDING RESTRICTIONS */}
                <h2 id="fielding-restrictions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Understanding Field Restrictions During Powerplay</h2>

                <p>The powerplay fielding restrictions are the defining feature that makes this phase unique and crucial:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Current Fielding Rules</h3>
                <p><strong>During Powerplay Overs:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Maximum of 2 fielders allowed outside the 30-yard circle</li>
                    <li>Minimum of 2 fielders in close catching positions (within 15 yards on the leg side)</li>
                    <li>Fielders can be positioned anywhere within these restrictions</li>
                    <li>Applies to both ODI (first 10 overs) and T20 (first 6 overs)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">How Batsmen Exploit Restrictions</h3>
                <p>Understanding field placements allows batsmen to maximize scoring:</p>

                <p><strong>1. Targeting Gaps:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>With only 2 fielders on the boundary, large gaps exist in the outfield</li>
                    <li>Aerial shots over the infield have higher success rates</li>
                    <li>Lofted drives over mid-off and mid-on are low-risk boundaries</li>
                </ul>

                <p className="mt-4"><strong>2. Using the V:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>The area between mid-off and mid-on (the "V") is typically open</li>
                    <li>Straight drives and lofted shots are percentage plays</li>
                    <li>Bowlers must be very accurate to prevent scoring in this zone</li>
                </ul>

                <p className="mt-4"><strong>3. Square of the Wicket:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Cuts, pulls, and sweeps can find gaps easily</li>
                    <li>Short-pitched bowling is particularly risky for bowlers</li>
                    <li>Width outside off-stump is punished severely</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Bowling Strategies to Counter</h3>
                <p>Bowlers and captains employ various tactics to limit powerplay damage:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Swing bowling:</strong> Use new ball movement to create uncertainty</li>
                    <li><strong>Tight lines:</strong> Bowl stump-to-stump to limit scoring options</li>
                    <li><strong>Variations:</strong> Change of pace, cutters, slower balls</li>
                    <li><strong>Strategic field placement:</strong> Protect most likely scoring areas</li>
                    <li><strong>Attacking with spin:</strong> Some teams use spinners early to slow run rate</li>
                </ul>

                <hr />

                {/* IMPROVEMENT STRATEGIES */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Improve Powerplay Run Rate</h2>

                <p>Improving powerplay performance requires technical skill, tactical awareness, and mental strength:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Technical Skills Development</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Power hitting:</strong> Develop strength and timing for clearing the infield and boundaries</li>
                    <li><strong>Shot range:</strong> Master conventional shots plus innovative options (ramp, scoop, reverse sweep)</li>
                    <li><strong>Footwork:</strong> Quick feet to get into position for attacking shots</li>
                    <li><strong>Hand-eye coordination:</strong> Essential for hitting moving ball cleanly</li>
                    <li><strong>Timing over power:</strong> Clean connection is more important than brute force</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Tactical Awareness</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Know the field:</strong> Identify gaps before each delivery</li>
                    <li><strong>Target specific bowlers:</strong> Attack weaker bowlers, respect quality</li>
                    <li><strong>Rotate strike:</strong> Keep scoreboard moving even without boundaries</li>
                    <li><strong>Use the powerplay overs:</strong> Don't waste the first 2-3 overs being too cautious</li>
                    <li><strong>Partnership communication:</strong> Coordinate with partner on who attacks when</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Mental Approach</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Positive intent:</strong> Look to score off every ball, not just survive</li>
                    <li><strong>Calculated risk:</strong> Understand which shots have high success rates</li>
                    <li><strong>Don't panic after dot balls:</strong> One boundary changes the over completely</li>
                    <li><strong>Learn from dismissals:</strong> Analyze what went wrong, adjust approach</li>
                    <li><strong>Confidence:</strong> Back your ability to execute shots</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Physical Preparation</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Strength training:</strong> Core and upper body strength for power</li>
                    <li><strong>Reaction drills:</strong> Improve response time to different deliveries</li>
                    <li><strong>Flexibility:</strong> Allows full range of motion for all shots</li>
                    <li><strong>Match simulation:</strong> Practice under pressure situations</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Team Strategy</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Opening combination:</strong> Pair aggressive and anchor batsmen effectively</li>
                    <li><strong>Batting order:</strong> Promote power hitters in powerplay if needed</li>
                    <li><strong>Clear roles:</strong> Each batsman knows their responsibility</li>
                    <li><strong>Data analysis:</strong> Study opposition bowlers' powerplay records</li>
                    <li><strong>Matchup awareness:</strong> Exploit favorable batsman-bowler matchups</li>
                </ul>

                <hr />

                {/* RISKS AND TRADE-OFFS */}
                <h2 id="risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risks and Trade-offs in Powerplay Batting</h2>

                <p>Aggressive powerplay batting comes with inherent risks that must be carefully managed:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Wicket Loss Risk</h3>
                <p>The primary trade-off of aggressive powerplay batting is increased risk of losing wickets:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Early collapse:</strong> Losing 3-4 wickets in powerplay can cripple an innings</li>
                    <li><strong>Pressure on middle order:</strong> New batsmen must rebuild while maintaining run rate</li>
                    <li><strong>Loss of set batsmen:</strong> Batsmen getting out after starts wastes the platform</li>
                    <li><strong>Bowling team momentum:</strong> Early wickets energize opposition</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Sustainability Concerns</h3>
                <p>Very high powerplay run rates may not be sustainable:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Batsmen may tire from aggressive batting</li>
                    <li>Opposition adjusts tactics for middle overs</li>
                    <li>Pressure to maintain run rate can lead to poor decisions</li>
                    <li>Unrealistic expectations for rest of innings</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Conditions-Based Risks</h3>
                <p>Certain conditions make aggressive powerplay batting particularly risky:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Seaming conditions:</strong> New ball movement makes attacking dangerous</li>
                    <li><strong>Quality pace attack:</strong> World-class bowlers can exploit aggression</li>
                    <li><strong>Two-paced pitches:</strong> Inconsistent bounce makes timing difficult</li>
                    <li><strong>Spin-friendly surfaces:</strong> Early spin can trouble aggressive batsmen</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. The Balance Equation</h3>
                <p>Teams must find the optimal balance between aggression and preservation:</p>

                <p><strong>Factors to Consider:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Batting depth: Teams with strong lower order can afford more risk</li>
                    <li>Match situation: Chasing requires different approach than setting target</li>
                    <li>Opposition quality: Adjust aggression based on bowling strength</li>
                    <li>Format: T20 demands more risk than ODI</li>
                    <li>Wickets in hand: Losing early wickets should trigger more caution</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Learning from Failures</h3>
                <p>Understanding when powerplay aggression fails helps refine strategy:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Analyze dismissals: Were they poor execution or poor shot selection?</li>
                    <li>Review match conditions: Was aggression appropriate for the situation?</li>
                    <li>Assess opposition tactics: Did bowlers execute specific plans successfully?</li>
                    <li>Team debrief: Collective learning improves future performance</li>
                </ul>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>The powerplay run rate has emerged as one of the most critical metrics in modern limited-overs cricket. It represents the unique opportunity to score quickly when fielding restrictions are in place, setting the foundation for commanding totals and creating psychological advantages.</p>

                <p>Understanding powerplay run rate—its calculation, benchmarks, strategic importance, and optimization techniques—is essential for players, coaches, and analysts. The teams that master powerplay batting, balancing aggression with calculated risk-taking, consistently outperform those that approach it conservatively or recklessly.</p>

                <p>Whether you're a batsman looking to improve your powerplay performance, a coach developing team strategy, or an analyst evaluating team strengths, the powerplay run rate calculator and this comprehensive guide provide the tools and knowledge to maximize this critical phase of limited-overs cricket.</p>

                <p>In the modern game, where totals of 300+ in ODIs and 200+ in T20s are increasingly common, the powerplay is no longer just an opportunity—it's a necessity. Teams that fail to capitalize on field restrictions find themselves constantly playing catch-up, while those that dominate the powerplay control the narrative of the match from the very first over.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about powerplay run rate in cricket
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good powerplay run rate in ODI cricket?</h4>
                            <p className="text-muted-foreground">
                                In modern ODI cricket, a powerplay run rate of 6.0-7.0 runs per over (60-70 runs in 10 overs) is considered good, while 7.0+ is excellent. Anything below 5.0 runs per over is generally considered below par and puts significant pressure on the middle and death overs. The global average has increased to around 5.5-6.0 in recent years as teams have become more aggressive.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good powerplay run rate in T20 cricket?</h4>
                            <p className="text-muted-foreground">
                                In T20 cricket, a powerplay run rate of 8.0-9.0 runs per over (48-54 runs in 6 overs) is considered good, while 9.0+ is excellent. The powerplay is even more critical in T20s, and teams scoring below 6.5 runs per over (under 39 runs) face significant difficulty posting competitive totals. Elite T20 teams regularly exceed 50 runs in the powerplay.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is powerplay run rate calculated?</h4>
                            <p className="text-muted-foreground">
                                Powerplay run rate is calculated by dividing the total runs scored during the powerplay overs by the number of overs played. The formula is: Powerplay Run Rate = Runs Scored in Powerplay / Overs Played. For example, if a team scores 55 runs in 10 powerplay overs, their run rate is 55/10 = 5.5 runs per over.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How many overs are in the powerplay for ODI and T20?</h4>
                            <p className="text-muted-foreground">
                                In ODI cricket, the powerplay consists of the first 10 overs of each innings. In T20 cricket, the powerplay is the first 6 overs. During these overs, fielding restrictions apply with only 2 fielders allowed outside the 30-yard circle. These restrictions create scoring opportunities that batsmen should exploit to build strong foundations for their innings.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What are the fielding restrictions during powerplay?</h4>
                            <p className="text-muted-foreground">
                                During powerplay overs, only 2 fielders are allowed outside the 30-yard circle, and at least 2 fielders must be in close catching positions within 15 yards on the leg side. This means 7-8 fielders must be inside the circle, creating large gaps in the outfield. These restrictions make it easier for batsmen to find boundaries and score quickly, which is why the powerplay is such a crucial phase.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is powerplay run rate more important in T20 than ODI?</h4>
                            <p className="text-muted-foreground">
                                Powerplay run rate is more critical in T20 because the powerplay represents a larger proportion of the innings (6 out of 20 overs = 30%) compared to ODI (10 out of 50 overs = 20%). Additionally, T20 cricket demands constant aggression with less time to recover from a slow start. Statistical analysis shows that T20 teams scoring 50+ in the powerplay win approximately 70% of their matches, demonstrating its match-defining importance.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should teams prioritize run rate or wickets in the powerplay?</h4>
                            <p className="text-muted-foreground">
                                The optimal approach balances both, but the priority depends on format and match situation. In T20 cricket, run rate is generally prioritized as teams can afford to lose 2-3 wickets if they score 50+ runs. In ODI cricket, a more balanced approach is common, aiming for 6.0+ run rate while preserving wickets. Teams with deep batting can afford more aggression, while those with weaker lower orders should be more cautious. The key is calculated risk-taking, not reckless batting.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does powerplay run rate affect the final total?</h4>
                            <p className="text-muted-foreground">
                                Powerplay run rate has a significant impact on final totals. In ODI cricket, a strong powerplay (65+ runs) typically leads to totals of 280-320+, while a poor powerplay (under 45 runs) usually results in totals below 250. In T20 cricket, scoring 50+ in the powerplay often leads to totals of 180-200+, while scoring under 35 makes reaching 150 very difficult. Additionally, a strong powerplay reduces pressure on middle and death overs, allowing for more calculated batting.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What strategies can improve powerplay run rate?</h4>
                            <p className="text-muted-foreground">
                                Key strategies include: (1) Targeting gaps created by fielding restrictions, especially the V between mid-off and mid-on; (2) Rotating strike consistently to keep scoreboard moving; (3) Identifying and attacking weaker bowlers; (4) Using innovative shots like ramps and scoops when appropriate; (5) Maintaining positive intent from ball one; (6) Effective opening partnerships where one batsman anchors while the other attacks; (7) Studying opposition bowlers' powerplay records to exploit weaknesses.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a team recover from a poor powerplay performance?</h4>
                            <p className="text-muted-foreground">
                                While recovery is possible, it's significantly more difficult and requires exceptional middle and death overs batting. In ODI cricket, teams can compensate for a slow powerplay by accelerating in overs 11-40, though this increases pressure and risk. In T20 cricket, recovering from a poor powerplay (under 35 runs) is very challenging and often requires near-perfect execution in the remaining 14 overs. The best approach is to avoid poor powerplays through proper planning and execution rather than relying on recovery.
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
                                    <strong className="block text-primary mb-1">Opening Batsmen</strong>
                                    <span className="text-sm text-muted-foreground">Track powerplay performance and identify areas for improvement in exploiting field restrictions.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Team Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Analyze team powerplay strategies and compare performance against benchmarks and opposition.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate team strengths, predict match outcomes, and identify tactical trends in powerplay batting.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Cricket Players</strong>
                                    <span className="text-sm text-muted-foreground">Select players based on powerplay performance statistics for optimal fantasy team composition.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Commentators</strong>
                                    <span className="text-sm text-muted-foreground">Provide context and analysis during live matches by comparing current powerplay performance to benchmarks.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Team Captains</strong>
                                    <span className="text-sm text-muted-foreground">Set realistic powerplay targets and adjust tactics based on match situation and conditions.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Doesn't Account for Wickets Lost</h4>
                                    <p className="text-sm text-muted-foreground">
                                        A run rate of 8.0 with 4 wickets lost is very different from 8.0 with no wickets lost. The calculator doesn't factor in the cost of achieving the run rate in terms of wickets, which is crucial for assessing sustainability.
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Context of Conditions Not Considered</h4>
                                    <p className="text-sm text-muted-foreground">
                                        A powerplay run rate of 5.5 on a difficult seaming pitch against quality pace bowling may be more impressive than 7.0 on a flat track against weak bowling. The calculator cannot account for pitch conditions, opposition quality, or weather factors.
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Doesn't Predict Sustainability</h4>
                                    <p className="text-sm text-muted-foreground">
                                        The calculator shows current powerplay performance but cannot predict whether the run rate is sustainable for the rest of the innings. A very high run rate achieved through risky batting may not continue.
                                    </p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-2">Format Differences</h4>
                                    <p className="text-sm text-muted-foreground">
                                        The same run rate has different implications in ODI vs T20 cricket. Users must interpret results based on the specific format being played and adjust expectations accordingly.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Case Study A: Dominant T20 Powerplay</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Scenario:</strong> Team scores 62 runs in 6 powerplay overs (run rate: 10.33)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Outstanding powerplay performance. With only 1 wicket lost, the team has an excellent platform. Projected total of 200+ is realistic.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Team maintains momentum, finishes with 195/4. The strong powerplay allowed middle-order batsmen to play freely without excessive pressure, leading to a commanding total.
                                    </p>
                                </div>

                                <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Case Study B: Poor ODI Powerplay</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Scenario:</strong> Team scores 38 runs in 10 powerplay overs (run rate: 3.8)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Very poor powerplay. Failed to capitalize on field restrictions. Immense pressure on middle and death overs to compensate.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Team struggles to accelerate, loses wickets trying to increase run rate. Finishes with 218/8, well below par. The poor powerplay set the tone for the entire innings.
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Case Study C: Balanced ODI Powerplay</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Scenario:</strong> Team scores 67 runs in 10 powerplay overs (run rate: 6.7)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Analysis:</strong> Excellent powerplay performance with good balance. Lost 2 wickets but scored at a healthy rate. Strong foundation for 280-300 total.
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Outcome:</strong> Team builds on the platform, accelerates in middle overs, and finishes with 298/6. The powerplay run rate allowed flexibility in approach for the remaining 40 overs.
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
                                The Powerplay Run Rate Calculator is an essential tool for analyzing batting performance during the most critical phase of limited-overs cricket.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By calculating runs per over during field restriction overs, it provides crucial insights into how effectively teams exploit powerplay opportunities, set foundations for strong totals, and create match-winning momentum from the very first ball.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
