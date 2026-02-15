import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Activity, Info, Calculator, BarChart3, TrendingUp, Target, Users, CheckCircle2 } from 'lucide-react';
import BasketballWinSharesCalculatorInteractive from './basketball-win-shares-calculator-interactive';

export default function BasketballWinSharesCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball Win Shares Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Estimate a player's total impact on winning (Win Shares). Convert box score stats into a single number representing wins added.
                </p>
            </div>

            <BasketballWinSharesCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics for estimating Win Shares
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <BarChart3 className="h-4 w-4" />
                                Production Metrics
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Events that produce or lose value.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Points & Assists:</strong> Primary drivers of Offensive Win Shares.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Steals & Blocks:</strong> Primary drivers of Defensive Win Shares (in box score models).</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Trophy className="h-4 w-4" />
                                Contextual Factors
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Stats that frame the value of production.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>Team Wins:</strong> Win Shares are divided among the team. You cannot have 60 WS on a 20-win team. Team success is a multiplier.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>Minutes Played:</strong> Win Shares is a cumulative stat. The more you play, the more value you can accrue (or lose).</span>
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
                        <Calculator className="h-5 w-5" />
                        Methodology Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm mb-2">
                            <strong>Win Shares (Approx)</strong> = Efficiency Value × (Team Wins / 41) × Volume
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        The official Win Shares formula (Basketball-Reference) is extremely complex, involving league averages for points per possession and pace adjustments.
                        This calculator uses a <strong>Linear Weights Estimation</strong> model that approximates the official output by weighting rebounds, steals, turnovers, and scoring efficiency against team success.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Basketball Calculators
                    </CardTitle>
                    <CardDescription>
                        Enhance your analytics toolkit
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/basketball-player-efficiency-rating-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">PER Calculator</p>
                                            <p className="text-sm text-muted-foreground">Overall efficiency rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-usage-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Info className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Usage Rate</p>
                                            <p className="text-sm text-muted-foreground">Offensive load</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-true-shooting-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">True Shooting %</p>
                                            <p className="text-sm text-muted-foreground">Scoring efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-offensive-efficiency-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Offensive Efficiency</p>
                                            <p className="text-sm text-muted-foreground">Points per 100 poss</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-rebound-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Rebound Rate</p>
                                            <p className="text-sm text-muted-foreground">Board dominance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-assist-to-turnover-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Assist/Turnover</p>
                                            <p className="text-sm text-muted-foreground">Playmaking value</p>
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
                <meta itemProp="name" content="The Complete Guide to Basketball Win Shares (WS)" />
                <meta itemProp="description" content="Calculate Basketball Win Shares to measure a player's total value. Understand how WS works, what defines an MVP season, and comparing players across eras." />
                <meta itemProp="keywords" content="basketball win shares calculator, NBA win shares, WS formula, basketball sabermetrics, offensive win shares, defensive win shares" />
                <meta itemProp="author" content="MegaCalc Basketball Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Win Shares: The Ultimate Value Metric</h2>
                <p className="text-lg italic text-muted-foreground">Who actually contributed the most to winning? Win Shares attempts to answer this by taking team success and dividing credit among the players based on their statistical production.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What are Win Shares?</a></li>
                    <li><a href="#components" className="hover:underline">Components: Offensive vs Defensive WS</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What is a Good WS?</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of the Metric</a></li>
                    <li><a href="#history" className="hover:underline">Historical Leaders</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What are Win Shares?</h2>
                <p><strong>Win Shares (WS)</strong> is a player statistic which attempts to divvy up credit for team success to the individuals on the team. It is designed such that the sum of the Win Shares for every player on a team will roughly equal the team's total win count for the season.</p>

                <p className="mt-4">For example, if the 1996 Chicago Bulls won 72 games, the sum of Michael Jordan's, Scottie Pippen's, and Dennis Rodman's (etc.) win shares would approximate 72.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Win Shares per 48 Minutes (WS/48)</h3>
                <p>Because Win Shares is a cumulative stat (playing more games = more shares), analysts use <strong>WS/48</strong> to measure efficiency. This estimates how many wins a player contributes per standard game length. The league average is approx .100.</p>

                <hr />

                {/* COMPONENTS */}
                <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Components: Offensive vs Defensive WS</h2>
                <p>Win Shares are calculated by summing Offensive Win Shares and Defensive Win Shares.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2 text-blue-600">Offensive Win Shares (OWS)</h4>
                        <p className="text-sm">Calculated using "Marginal Offense," or how many points a player produces above the league average per possession. It heavily rewards efficient scoring (True Shooting %) and playmaking.</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2 text-red-600">Defensive Win Shares (DWS)</h4>
                        <p className="text-sm">Calculated using "Marginal Defense." It credits players for stops (steals, blocks, defensive rebounds) and team defense. It is harder to assign individually, so team defensive rating plays a big role.</p>
                    </div>
                </div>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What is a Good WS?</h2>
                <p>Win Shares provides a clear hierarchy of player value over a full 82-game season:</p>

                <ul className="list-disc ml-6 space-y-4 mt-4">
                    <li><strong>MVP Candidate (14+ WS):</strong> Historically great seasons. Kareem Abdul-Jabbar leads all time with single seasons exceeding 25 WS. In the modern era, 14-16 is often enough to win MVP.</li>
                    <li><strong>All-NBA (10-14 WS):</strong> The top 10-15 players in the league. Consistently dominant.</li>
                    <li><strong>All-Star (8-10 WS):</strong> Elite players who are the best or second-best on good teams.</li>
                    <li><strong>Starter (4-7 WS):</strong> Solid contributors. Average starters usually accumulate around 5 Win Shares.</li>
                    <li><strong>Bench / Role (1-3 WS):</strong> Limited minutes or inefficient production.</li>
                    <li><strong>Negative WS:</strong> A player who actively hurts the team's chances of winning (inefficient shooting, high turnovers, bad defense).</li>
                </ul>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of the Metric</h2>
                <p>While powerful, Win Shares is not perfect:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Defensive Blind Spots:</strong> DWS relies heavily on box score stats (steals/blocks) and team defense. An elite defender who gets no steals (like a lockdown corner specialist) is often undervalued.</li>
                    <li><strong>Metric of its Time:</strong> It was created using data available historically (developed by Bill James for baseball, adapted by Justin Kubatko for basketball). It doesn't use tracking data (speed, spacing).</li>
                    <li><strong>Team Dependent:</strong> It is harder to get high Win Shares on a 15-win team because there are fewer "Wins" to share, even if you are playing well.</li>
                </ul>

                <hr />

                {/* HISTORY */}
                <h2 id="history" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Historical Leaders</h2>
                <p>The all-time career list is a Who's Who of basketball legends:</p>
                <ol className="list-decimal ml-6 space-y-2">
                    <li>Kareem Abdul-Jabbar: 273.13</li>
                    <li>LeBron James: 263.67+</li>
                    <li>Wilt Chamberlain: 247.26</li>
                    <li>Karl Malone: 234.63</li>
                    <li>Michael Jordan: 214.02</li>
                </ol>
                <p className="mt-4">Interestingly, because Jordan played fewer seasons (retirements) than Kareem or LeBron, his <em>cumulative</em> total is lower, though his <em>WS/48</em> (.2505) is #1 all-time, showing his peak dominance.</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>The Win Shares Calculator is an essential tool for historical comparisons and "Value Added" analysis. It allows you to look past raw points per game and see how much a player actually moved the needle towards victory. Whether you are analyzing a current MVP race or debating the GOAT, Win Shares provides the statistical backbone for the argument.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Win Shares and player value
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can a player have negative Win Shares?</h4>
                            <p className="text-muted-foreground">
                                Yes. If a player shoots very poorly, turns the ball over often, and plays bad defense, their contribution can be negative. Essentially, a "replacement level" player would have won more games for the team than this player did.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the difference between Win Shares and PER?</h4>
                            <p className="text-muted-foreground">
                                PER (Player Efficiency Rating) is a per-minute rating of statistical production that doesn't account for defense or team winning. Win Shares attempts to tie production directly to team wins and separates offensive/defensive contributions more explicitly.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is WS/48 better than Total WS?</h4>
                            <p className="text-muted-foreground">
                                It depends. WS/48 tells you who was the most efficient <em>while they played</em>. Total WS tells you who provided the most <em>total value</em>. Playing 82 games is a skill (availability). A player with slightly lower WS/48 who plays 3000 minutes is often more valuable than a fragile player with high WS/48 who plays 1000 minutes.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why does team success matter for an individual stat?</h4>
                            <p className="text-muted-foreground">
                                Win Shares is philosophically based on the idea that stats are only valuable if they lead to wins. Empty stats on a losing team are penalized (slightly) because they didn't result in the ultimate goal. This aligns the metric with the reality of competitive sports.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How accurate is this exact calculator?</h4>
                            <p className="text-muted-foreground">
                                This calculator uses a "Linear Weights Approximation" because the official formula requires possession-by-possession league data not available in a simple form. It is highly accurate (within +/- 10%) for estimating value but should be used as a directional guide rather than an official record.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does Win Shares favor big men?</h4>
                            <p className="text-muted-foreground">
                                Historically, yes, slightly. High-efficiency shots (dunks/layups) and rebounds are heavily weighted. Guards who miss varied shots (lower FG%) are penalized, though modern analytics (True Shooting) help level the playing field for 3-point shooters.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is "Replacement Level"?</h4>
                            <p className="text-muted-foreground">
                                A "Replacement Level" player is a theoretical player freely available to sign (like a G-League call-up). In Win Shares terms, a replacement player usually has a WS/48 significantly below average (around .050 or lower), where .100 is league average.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why did Michael Jordan lead the league in WS so often?</h4>
                            <p className="text-muted-foreground">
                                Because he was elite at everything. He scored at high volume with high efficiency (OWS) and was a Defensive Player of the Year (DWS). Combining elite offense and defense is the only way to reach 20+ Win Shares.
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
                            <h3 className="font-semibold text-lg mb-3">Who Should Use This?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Debaters</strong>
                                    <span className="text-sm text-muted-foreground">Settle arguments about who had the better season. Did Player X deserve MVP over Player Y? Check the Win Shares.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Historians</strong>
                                    <span className="text-sm text-muted-foreground">Compare players across eras. How does 1962 Wilt compare to 2016 Curry?</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Basketball</strong>
                                    <span className="text-sm text-muted-foreground">Identify high-floor players. Players with high Win Shares are rarely "busts" in fantasy because they contribute across the board.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Agents</strong>
                                    <span className="text-sm text-muted-foreground">Demonstrate value. "My client contributed 8 wins to this team; pay him accordingly."</span>
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
                        <Trophy className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Basketball Win Shares Calculator allows for a comprehensive assessment of player value.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By synthesizing box score production with team success, it provides a "catch-all" number that remains the gold standard for historical player ranking and value estimation.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
