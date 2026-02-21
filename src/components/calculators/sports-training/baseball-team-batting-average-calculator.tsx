import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Shield } from 'lucide-react';
import BaseballTeamBattingAverageCalculatorInteractive from './baseball-team-batting-average-calculator-interactive';

export default function BaseballTeamBattingAverageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball/ Softball Team Batting Average Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your team&apos;s collective batting average (AVG) instantly and understand what it reveals about your lineup&apos;s contact ability, offensive identity, and competitive standing.
                </p>
            </div>

            <BaseballTeamBattingAverageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics for calculating Team Batting Average
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Team Hits (H)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of hits accumulated by all players across the lineup — including singles, doubles, triples, and home runs.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Count: All safe hits (1B, 2B, 3B, HR) by every player</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Exclude: Errors, Fielder&apos;s Choice, Walks (BB), Hit-By-Pitch</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Team At-Bats (AB)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total official at-bats for the entire team. This is the denominator of the batting average formula.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Includes: Hits, Strikeouts, Groundouts, Reach on Error</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Excludes: Walks, HBP, Sacrifice Flies, Sacrifice Bunts</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <BarChart3 className="h-4 w-4" />
                                Games Played (Optional)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                If provided, the calculator also outputs &quot;Hits Per Game,&quot; giving a per-game context to raw totals.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>MLB full season: 162 games</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>High School / Softball: typically 30–60 game seasons</span>
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
                        <p className="font-mono text-sm text-center font-bold">
                            Team Batting Average (AVG) = Total Team Hits (H) / Total Team At-Bats (AB)
                        </p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center">
                            Hits Per Game = Total Team Hits / Games Played
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Team batting average is expressed to three decimal places (e.g., .265). It is calculated by summing the hits and at-bats of every player who appeared at the plate for the team, then dividing. A team with 1,350 hits in 5,500 at-bats has a .245 team batting average.
                    </p>
                    <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded border border-primary/10">
                        <strong>Edge Case:</strong> If a batter pinch-hits and reaches on a walk, that plate appearance is excluded from At-Bats and therefore has no influence on team batting average. This is consistent with individual AVG calculation rules.
                    </div>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Baseball &amp; Softball Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other key team and individual hitting metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/baseball-batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Individual Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Per-player contact rate</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-on-base-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">On-Base Percentage</p>
                                            <p className="text-sm text-muted-foreground">Includes walks &amp; HBP</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-slugging-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Slugging Percentage</p>
                                            <p className="text-sm text-muted-foreground">Power metric (Total Bases / AB)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-ops-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">OPS Calculator</p>
                                            <p className="text-sm text-muted-foreground">OBP + Slugging combined</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-run-differential-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Run Differential</p>
                                            <p className="text-sm text-muted-foreground">Offensive vs. defensive balance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-win-loss-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Win-Loss Percentage</p>
                                            <p className="text-sm text-muted-foreground">Team standings metric</p>
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
                <meta itemProp="name" content="The Complete Guide to Baseball & Softball Team Batting Average" />
                <meta itemProp="description" content="Comprehensive guide on Baseball and Softball Team Batting Average (AVG). Learn how to calculate it, what makes an elite team offense, MLB benchmarks by era, strategies to improve lineup contact rates, and the limitations of using AVG as a sole offensive measure." />
                <meta itemProp="keywords" content="baseball team batting average calculator, softball team batting average, how team batting average is calculated, mlb team batting average benchmarks, improve team hitting, offensive statistics baseball, team OBP calculator" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-21" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Lineup&apos;s Report Card: Mastering Team Batting Average</h2>
                <p className="text-lg italic text-muted-foreground">While individual stars win awards, it is the collective contact ability of a lineup that wins pennants. Team Batting Average is the most direct window into that collective performance.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Team Batting Average?</a></li>
                    <li><a href="#why-it-matters" className="hover:underline">Why Team AVG Matters for Coaches & Analysts</a></li>
                    <li><a href="#benchmarks" className="hover:underline">MLB & Softball Benchmarks by Era</a></li>
                    <li><a href="#factors" className="hover:underline">Factors That Influence Team Batting Average</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Improve Team Batting Average</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations: When Team AVG is Misleading</a></li>
                    <li><a href="#modern-context" className="hover:underline">Team AVG in the Analytics Era</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Team Batting Average?</h2>
                <p><strong>Team Batting Average (Team AVG)</strong> is the aggregate batting average of an entire roster. It is calculated the same way as an individual batting average — Total Team Hits divided by Total Team At-Bats — but uses the combined totals of every player who logged plate appearances for that team over the measured period (a game, a month, a season, or a career).</p>
                <p>Unlike individual batting average, which can fluctuate wildly based on a single player&apos;s hot or cold streak, Team AVG is more stable because it represents the output of an entire 9-man (or more) lineup. A .265 team average is the product of hundreds of at-bats from leadoff hitters, cleanup hitters, utility players, and pinch hitters.</p>
                <p>The formula is straightforward:</p>
                <div className="p-4 bg-muted rounded my-4 font-mono text-center text-foreground">
                    Team AVG = Sum of All Player Hits / Sum of All Player At-Bats
                </div>
                <p>This metric has been tracked in professional baseball since the late 19th century and remains one of the first statistics cited when evaluating an offense. Understanding its nuances separates casual fans from sophisticated analysts.</p>

                <hr />

                {/* WHY IT MATTERS */}
                <h2 id="why-it-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Team AVG Matters for Coaches & Analysts</h2>
                <p>For coaches at every level — from Little League to the MLB — team batting average serves several critical functions:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Identifying Lineup Tendencies</h3>
                <p>A team with a high AVG but below-average slugging is a &quot;contact lineup&quot; — they rely on getting singles and manufacturing runs via stolen bases, hit-and-run plays, and situational hitting. Conversely, a team with a low AVG but high slugging percentage is a &quot;three true outcomes&quot; (3TO) team relying on home runs, walks, and who doesn&apos;t fear strikeouts. Team AVG is the quickest way to identify an offense&apos;s identity.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Scouting Upcoming Opponents</h3>
                <p>Pitching coaches analyze the opposing team&apos;s AVG to determine approach. Facing a .280-hitting lineup demands a different game plan than a .240-hitting lineup. High-AVG teams punish mistakes in the zone; lower-AVG teams can be attacked with well-located fastballs because they will often chase.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Spotting Lineup Weaknesses</h3>
                <p>By comparing the team AVG to individual player averages, a manager can quickly identify the &quot;black holes&quot; in the lineup — the spots where opposing pitchers attack without fear. If positions 7, 8, and 9 are batting a combined .195, it signals a clear area for roster improvement or lineup optimization.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. In-Season Adjustments</h3>
                <p>Team AVG is a rolling indicator. A team that averages .270 in April but drops to .230 in June has experienced some combination of pitching adjustments, injuries, weather, opponent quality increase, or a genuine slump. Tracking weekly or monthly team AVG allows coaches to react promptly.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">MLB &amp; Softball Benchmarks by Era</h2>
                <p>Understanding &quot;what is good&quot; requires context. Team batting average norms vary significantly by era, level, and even ballpark.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Modern MLB (2015–Present)</h3>
                <p>The &quot;Three True Outcomes&quot; era, featuring record strikeout rates, has driven team batting averages to historic lows.</p>
                <ul className="list-disc ml-6 space-y-4 mt-2">
                    <li><strong>.270+ Team AVG:</strong> <span className="text-green-600 font-semibold">Elite Offense.</span> Only 1–3 teams per season achieve this. In modern MLB, .270 is what .300 was in the 1990s.</li>
                    <li><strong>.260–.270 Team AVG:</strong> <span className="text-blue-600 font-semibold">Above Average.</span> Typically a top-10 offense in the league. Expect this team to score 4.8+ runs per game.</li>
                    <li><strong>.248–.260 Team AVG:</strong> <span className="text-yellow-600 font-semibold">League Average.</span> The MLB average has hovered near .248–.252 from 2019–2024. These teams score around 4.3–4.7 runs per game.</li>
                    <li><strong>.230–.248 Team AVG:</strong> <span className="text-orange-600 font-semibold">Below Average.</span> Struggling offenses that must compensate with walk rate, power, and speed.</li>
                    <li><strong>Below .230:</strong> <span className="text-red-600 font-semibold">Historically Poor.</span> Associated with losing seasons and significant roster construction issues.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Steroid Era (1993–2005)</h3>
                <p>Team averages were dramatically inflated by enhanced offensive production. Teams routinely posted .270–.290 team batting averages. The 2000 Colorado Rockies hit a staggering .294 as a team, benefiting from the high-altitude offense at Coors Field. Context is essential when comparing across eras.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Dead Ball Era (1900–1919)</h3>
                <p>Before the introduction of the lively ball, teams relied almost entirely on contact and speed. Team averages were typically .240–.265. Home runs were rare; small-ball tactics like the hit-and-run, bunt-and-steal, and squeeze play were the primary offensive weapons.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">High School & Youth Baseball</h3>
                <p>Higher team averages are normal at lower levels due to wider variance in fielding talent and pitcher quality. A .330 team average at the high school level is solid; .380+ represents an elite offense for that age group. In youth softball specifically, team AVGs above .400 are not uncommon at recreational levels but carry less analytical weight without context about pitching competition.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">College Baseball (NCAA)</h3>
                <p>NCAA Division I team batting averages typically range from .270 to .310 in the BBCOR aluminum bat era. Wooden bat summer leagues like the Cape Cod League produce averages closer to MLB norms (.240–.265) because the bat transitions eliminate the trampoline effect of aluminum.</p>

                <hr />

                {/* FACTORS */}
                <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Factors That Influence Team Batting Average</h2>
                <p>Many variables affect what a team collectively hits over a season beyond pure talent:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Ballpark Effects</h3>
                <p>Certain ballparks favor hitters dramatically. Coors Field (Denver) inflates statistics due to altitude — the thin air reduces the break on breaking balls and allows fly balls to carry farther. Hitter-friendly parks like Great American Ball Park (Cincinnati) or Globe Life Field (Texas) push averages higher. Pitcher-friendly parks like Oracle Park (San Francisco) suppress them. When comparing team averages, always consider Park Factor adjustments.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Lineup Construction</h3>
                <p>A team&apos;s batting order and overall roster depth have enormous influence. A lineup with 7 quality contact hitters will produce a dramatically higher team AVG than one with only 4, even if the 4 elite hitters are identical. Managerial decisions about platoon usage (right-handed vs. left-handed matchups) also affect the aggregate number.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Quality of Opposition</h3>
                <p>A team playing in a division with multiple ace-caliber pitchers will suppress their AVG simply through schedule difficulty. Strength of Schedule (SOS) is a valuable context metric when comparing team batting averages across different leagues or divisions.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Injuries and Roster Turnover</h3>
                <p>The loss of a key hitter — even a single .300 hitter in 500 at-bats — can drop a team&apos;s overall average by 3–5 points. Teams with thin organizational depth (in AAA/AA) will see their team AVG dip more severely when key contributors land on the injured list.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">BABIP (Batting Average on Balls In Play)</h3>
                <p>A significant portion of batting average is influenced by luck. BABIP measures what happens to balls put into play (excluding strikeouts and home runs). A team with an abnormally high or low BABIP for a sustained period is likely experiencing unsustainable good or bad luck. Teams with a .330 BABIP will typically see their team AVG regress downward over time.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Team Batting Average</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Prioritize Contact Hitters in Lineup Spots 1–2 and 6–9</h3>
                <p>The top of the lineup (leadoff, 2-hole) sets the table for the power hitters and should feature high-AVG, high-OBP players who make contact consistently. The bottom of the lineup (6–9) is where many teams hide weak hitters — but prioritizing contact here prevents automatic outs and keeps innings alive for the next trip through the top of the order.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Scouting Report Execution</h3>
                <p>Team AVG improves dramatically when hitters attack pitch tendencies early in counts. When hitters sit on a pitcher&apos;s primary pitch (usually a fastball 0-0) and make contact, BABIP and team AVG rise. Pre-game scouting meetings, video review, and detailed spray charts allow hitters to put good wood on the ball more frequently.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Two-Strike Adjustment Drills</h3>
                <p>Many teams see their AVG plummet in two-strike counts. Dedicating 20–30 minutes per practice to two-strike situational hitting (choke up, protect the plate, hit the ball where it&apos;s pitched) can meaningfully raise the team&apos;s two-strike batting average, which directly raises the overall number.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Platoon Advantages</h3>
                <p>Research consistently shows that batters hit significantly better against opposite-handed pitchers (right-handed batters hit better vs. left-handed pitchers, and vice versa). Smart managers deploy platoon strategies — starting left-handed hitters against right-handed starters — to maximize favorable matchups and inflate the team&apos;s collective daily batting average.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Reduce Strikeouts</h3>
                <p>Every strikeout is a guaranteed out and a 0 for AVG purposes. Balls put into play — even grounders and pop-ups — have a chance to become hits. Teams that dramatically reduce strikeout rate (by teaching hitters to protect the plate with two strikes and make contact rather than swing for power) typically see measurable improvements in team batting average over a full season.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations: When Team AVG is Misleading</h2>
                <p>Team batting average, like its individual counterpart, has well-documented flaws that every serious analyst must understand:</p>
                <ul className="list-disc ml-6 space-y-3 mt-4">
                    <li><strong>Ignores Walk Rate:</strong> A team that walks 600 times but hits .240 may be more productive offensively than a team that walks 350 times but hits .265. OBP (which includes walks) is a superior predictor of runs scored than AVG alone.</li>
                    <li><strong>Treats All Hits Equally:</strong> A bunt single and a 450-foot home run both count as exactly one hit for AVG purposes. Slugging Percentage and ISO (Isolated Power) capture the quality of contact that AVG cannot.</li>
                    <li><strong>Ignores Run Production Context:</strong> Teams with very different run environments (tiny ballpark vs. expansive one) can have identical team AVGs but dramatically different offensive outputs in terms of actual runs scored.</li>
                    <li><strong>BABIP Regression:</strong> A team can post an elevated team AVG for a month purely through BABIP luck (balls in play finding holes). True offensive quality is best measured over a large sample where luck equalizes.</li>
                    <li><strong>No Credit for Defense or Pitching:</strong> Wins are not determined by offense alone. A team with a .250 team AVG and an elite pitching staff may outscore teams with a .270 AVG and poor pitching.</li>
                </ul>

                <hr />

                {/* MODERN CONTEXT */}
                <h2 id="modern-context" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Team AVG in the Analytics Era</h2>
                <p>The Statcast era (2015–present) has introduced more granular metrics like wOBA (Weighted On-Base Average), wRC+ (Weighted Runs Created Plus), and xAVG (Expected Batting Average based on exit velocity and launch angle). Front offices now use these metrics alongside — and sometimes instead of — team batting average.</p>
                <p>However, team batting average has not been discarded. It remains the most universally understood and communicated offensive metric. A broadcast will mention team AVG every night; xwOBA is reserved for analytical broadcasts. For coaches, parents, and casual fans, Team AVG is the most effective starting point for understanding an offense&apos;s character.</p>
                <p>The most effective modern analytical approach is to use Team AVG as a top-level diagnostic — a first indicator of whether an offense is functioning — and then layer in OBP, SLG, and advanced metrics to understand <em>why</em> the average is what it is.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Team Batting Average
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is Team Batting Average different from Individual Batting Average?</h4>
                            <p className="text-muted-foreground">
                                They use the same formula but aggregate across all players. Individual AVG uses one player&apos;s hits and at-bats. Team AVG uses the sum of every player&apos;s hits divided by the sum of every player&apos;s at-bats. A pinch hitter who goes 1-for-1 contributes to the team total. So does an 0-for-4 shortstop. The team number reflects the collective output of the entire active roster.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good team batting average in the MLB?</h4>
                            <p className="text-muted-foreground">
                                In the modern era (2019–2024), the MLB league-wide team batting average has averaged approximately .248–.252. A team batting .260 or above is performing above average offensively for the era. Teams above .265 are in elite territory. During the &quot;steroid era&quot; (1993–2005), the threshold for &quot;elite&quot; was closer to .280+, reflecting how dramatically offensive environments have shifted.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does the pitcher batting affect team average (in leagues that don&apos;t use the DH)?</h4>
                            <p className="text-muted-foreground">
                                Yes, significantly. In leagues without the Designated Hitter rule (which is now rare in professional baseball but still applies in some amateur leagues), pitchers must bat. Since pitchers are notoriously poor hitters — often below .150 — they drag the team batting average down meaningfully, sometimes by 5–8 points across a full season. This is why the National League historically had lower team batting averages than the American League (which adopted the DH in 1973) before the universal DH rule was adopted by MLB in 2022.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How many at-bats does it take to get a reliable team batting average?</h4>
                            <p className="text-muted-foreground">
                                For a meaningful team-level read, analysts typically look for a minimum of 300–400 team at-bats before drawing firm conclusions. This is roughly 20–30 games into a season for most professional teams. Before that sample, the team AVG can be heavily distorted by a single hot start from one player or a short stretch of games against weak pitching. By the All-Star break (roughly 600–700 at-bats for a full lineup rotation), the team average is generally predictive of the season-end number.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What team holds the MLB record for highest single-season team batting average?</h4>
                            <p className="text-muted-foreground">
                                In the modern era, the 1930 New York Giants hold a legendary mark, with the entire team batting .319 — a record that stands as an artifact of the era&apos;s juiced baseball and pitcher disadvantage. In more recent history, the Colorado Rockies routinely post the highest team averages due to Coors Field&apos;s altitude effect, with some seasons reaching .294–.296 as a club. Adjusting for park factor, however, these numbers represent less of an advantage than the raw figure suggests.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a high team batting average or a high team OPS more predictive of runs scored?</h4>
                            <p className="text-muted-foreground">
                                Team OPS is significantly more predictive of runs scored than Team AVG. Research consistently shows that OPS (On-Base % + Slugging %) has a correlation coefficient with runs scored of approximately 0.95+, while Team AVG alone is closer to 0.80–0.85. The reason is simple: OPS captures walks (which AVG ignores) and extra-base hit power (which AVG ignores), both of which directly produce more runs than a single alone.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does Coors Field affect team batting average calculations?</h4>
                            <p className="text-muted-foreground">
                                Coors Field in Denver is at approximately 5,280 feet above sea level. The reduced air density means that breaking balls break less and fly balls carry farther. This has a measurable impact on both the home team&apos;s batting average and the visiting team&apos;s during games there. Over a 162-game season, roughly 81 games at Coors can add 10–15 points to the Rockies&apos; team batting average compared to what those same players would hit in a neutral park. Always check park factor adjustments before drawing conclusions from raw team AVG alone.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a team have a high batting average but still lose games?</h4>
                            <p className="text-muted-foreground">
                                Absolutely — and it happens more often than people expect. A team that hits .270 but gives up 6 runs per game in poor pitching will still lose. A team that hits .240 but has an ERA of 2.90 can be a playoff contender. Batting average is only one side of the baseball equation. Pitching, defense, and bullpen performance are equally important. Some historically great defenses (like mid-2010s San Francisco Giants) won World Series titles with below-average offense by relying on dominant pitching.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How should a softball coach use team batting average differently than a baseball coach?</h4>
                            <p className="text-muted-foreground">
                                In softball — particularly fastpitch — the pitching distance is shorter (43 feet vs. 60.5 feet in baseball), reaction times are compressed, and the underhand delivery produces unique movement. Softball teams at competitive levels typically hit in the .280–.340 range depending on the level, making the benchmarks different from baseball. A softball coach should compare their team AVG to other teams at the same competitive level rather than MLB or NCAA baseball standards. Slow-pitch softball, where even harder contact is expected, has even higher average team batting averages.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is &quot;xAVG&quot; (Expected Batting Average) and how does it relate to team batting average?</h4>
                            <p className="text-muted-foreground">
                                xAVG (Expected Batting Average) is a Statcast metric that predicts what a player&apos;s batting average should be based solely on exit velocity and launch angle of each ball in play — ignoring where fielders were positioned or random luck. If a team has a .245 actual team AVG but a .263 xAVG, it means they have been unlucky and should expect offensive improvement. If the reverse is true (.265 actual vs. .248 xAVG), the offense has outperformed expectations and may be due for regression. xAVG is available via Baseball Savant for all MLB teams and is a powerful tool for predicting second-half performance.
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
                                    <strong className="block text-primary mb-1">Head Coaches & Hitting Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Track team-wide offensive trends week-to-week, identify slumps vs. systemic problems, and make data-driven lineup or tactical adjustments.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Baseball Team Managers</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate teams for streaming hitters. A team with .270+ team AVG is a fertile ground for waiver wire players having career days.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Sports Journalists & Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Quickly generate relevant benchmarks for articles, broadcasts, and pre-game analysis about offensive performance.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Youth & High School Program Directors</strong>
                                    <span className="text-sm text-muted-foreground">Compare teams within a league or season to identify whether your program&apos;s offensive development is on track for the competitive level.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations: When Is This Number Misleading?</h3>
                            <div className="space-y-3">
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                    <p className="text-sm text-muted-foreground"><strong>Early season small sample sizes:</strong> A team&apos;s batting average through 5 games is essentially meaningless for projection purposes. Wait for at least 25+ games before driving strategic decisions from the number.</p>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                    <p className="text-sm text-muted-foreground"><strong>Power-focused lineups:</strong> If your team hits .240 with 250 home runs, your offense may be more productive than a .265/80 HR lineup. Team OPS tells a more complete story in these cases.</p>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/30">
                                    <p className="text-sm text-muted-foreground"><strong>Park adjustments:</strong> Without knowing the home ballpark, raw team AVG comparisons across teams can be misleading. Always consider park factor.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Case Study A (The Contact-Heavy Lineup):</strong><br />
                                        Team A posts a .272 team AVG by mid-season — among the top 5 in the league. However, their team OPS is only .735 because they lack power hitters. They score 4.4 runs per game, respectable but not dominant. The coaching staff uses the data to target a power-hitting trade acquisition rather than another contact hitter.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Case Study B (The Three-True-Outcomes Team):</strong><br />
                                        Team B hits .239 as a team — bottom third of the league — but leads the league in home runs (185) and walks (620). Their team OPS is .783, actually higher than Team A. They score 4.9 runs per game despite the lower average. This demonstrates perfectly why Team AVG alone does not determine offensive output.
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
                            <h2 className="font-semibold text-lg mb-2">Final Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Baseball/Softball Team Batting Average Calculator provides an instant, accurate snapshot of your lineup&apos;s collective contact performance. Whether you&apos;re a coach building a scouting report, a fantasy manager looking for streaming targets, or a fan trying to contextualize your team&apos;s offensive identity, Team AVG is the essential starting metric for understanding an offense.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Use this calculator alongside team OBP, slugging percentage, and OPS for the most complete picture of offensive output. Remember to contextualize by era, park, and competition level. Team batting average is the report card of the lineup — but it is just one grade on a full report card that includes power, patience, and pitching.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
