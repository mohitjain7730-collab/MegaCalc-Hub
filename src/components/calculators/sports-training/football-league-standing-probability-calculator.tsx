import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, Shield, TrendingDown } from 'lucide-react';
import FootballLeagueStandingProbabilityCalculatorInteractive from './football-league-standing-probability-calculator-interactive';

export default function FootballLeagueStandingProbabilityCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football League Standing Probability Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Project your team's final league position, title chances, and relegation risks based on current form and statistical probability.
                </p>
            </div>

            <FootballLeagueStandingProbabilityCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics required for accurate season projections
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Activity className="h-4 w-4" />
                                Current Points & Games Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The foundation of any projection. Your current accumulation rate (Points Per Game) is extrapolated to the remaining fixtures.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Validates sample size (e.g., 5 games vs 25 games)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Establishes the baseline PPG (Points Per Game)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Shield className="h-4 w-4" />
                                League Format (Total Games)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Different leagues have different structures which affect the "Magic Number" for safety or titles.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>38 Games: Standard (EPL, La Liga, Serie A)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>46 Games: EFL Championship (Higher stamina requirement)</span>
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
                            Projected Points = Current Points + (PPG × Remaining Games)
                        </p>
                        <p className="font-mono text-sm text-center mt-2 text-muted-foreground">
                            PPG (Points Per Game) = Current Points / Games Played
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        The calculator uses a linear extrapolation model adjusted for standard deviation to estimate probabilities. It compares your projected finish against historical thresholds (e.g., 40 points for safety, 86+ for titles).
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Football Calculators
                    </CardTitle>
                    <CardDescription>
                        Analyze individual and team performance
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Win Rate</p>
                                            <p className="text-sm text-muted-foreground">Victory percentage</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-goals-per-90-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Goals Per 90</p>
                                            <p className="text-sm text-muted-foreground">Scoring efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-clean-sheet-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Clean Sheet %</p>
                                            <p className="text-sm text-muted-foreground">Defensive solidity</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-expected-assists-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Expected Assists (xA)</p>
                                            <p className="text-sm text-muted-foreground">Creativity metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-save-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Save Percentage</p>
                                            <p className="text-sm text-muted-foreground">Goalkeeper stats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-shot-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Shot Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Shooting precision</p>
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
                <meta itemProp="name" content="The Comprehensive Guide to Football League Projections: Analyzing Probabilities and Standings" />
                <meta itemProp="description" content="Master the art of football season projections. Learn how to calculate league standing probabilities, understand PPG significance, and predict title or relegation outcomes." />
                <meta itemProp="keywords" content="football league calculator, premier league predictor, relegation probability, title odds calculator, points per game, expected points" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Mastering Football Season Projections: Beyond the League Table</h2>
                <p className="text-lg italic text-muted-foreground">"The table never lies," they say, but it often hides the truth. Learn how to project the future by analyzing current form, underlying metrics, and historical benchmarks.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is League Standing Probability?</a></li>
                    <li><a href="#math" className="hover:underline">The Mathematics of Projection</a></li>
                    <li><a href="#factors" className="hover:underline">Key Factors Influencing Final Position</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Historical Benchmarks: The Magic Numbers</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of Mathematical Projections</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Defy the Odds</a></li>
                </ul>
                <hr />

                {/* WHAT IS LEAGUE STANDING PROBABILITY */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is League Standing Probability?</h2>
                <p><strong>League Standing Probability</strong> is a statistical method used to forecast a football team's final position in the league table. While the current table shows what <em>has</em> happened, probability models attempt to show what <em>will</em> happen.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Why Projection Matters</h3>
                <p>For fans, it answers the emotional questions: "Are we safe from relegation?" or "Can we win the league?". For clubs and analysts, it serves a more clear-cut purpose:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Strategic Planning:</strong> Determining if the current squad is performing at the required level.</li>
                    <li><strong>Managerial Decisions:</strong> Boards often use Points Per Game (PPG) projections to decide on manager sackings.</li>
                    <li><strong>Transfer Market Activity:</strong> A team projected to finish 5th might spend more in January to push for Top 4 (Champions League).</li>
                </ul>

                <hr />

                {/* THE MATH */}
                <h2 id="math" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mathematics of Projection: PPG and Extrapolation</h2>
                <p>At its core, season projection relies on <strong>Points Per Game (PPG)</strong>.</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Projected Total = Current Points + (Current PPG × Games Remaining)
                    </p>
                </div>

                <p>This linear extrapolation assumes that a team will continue to perform exactly as they have so far. More advanced models, like the one used in professional analytics, incorporate:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Elo Ratings:</strong> Adjusting for the strength of future opponents.</li>
                    <li><strong>Home/Away Bias:</strong> Teams historically earn more points at home.</li>
                    <li><strong>Goal Difference (xG):</strong> Using Expected Goals to determine if current results are lucky or sustainable.</li>
                </ul>

                <hr />

                {/* KEY FACTORS */}
                <h2 id="factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Factors Influencing Final Position</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Strength of Schedule (Fixture Difficulty)</h3>
                <p>A team with 20 points from 10 games looks great, but if those 10 games were all against relegation candidates, their PPG is artificially inflated. Conversely, a team that has played all the "Big Six" early in the season might have a deceptively low point total but a high probability of rising up the table as fixtures ease.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Squad Depth and Injury Crises</h3>
                <p>Over a 38-game season, depth is king. First XI quality determines the ceiling, but squad depth raises the floor. Probability models often fail to account for key injuries (e.g., losing a star striker for 3 months) which can drastically alter the actual PPG compared to the historical PPG.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. "Regression to the Mean"</h3>
                <p>Teams that are vastly overperforming their Expected Goals (xG) statistics usually see a dip in form eventually. If a team is winning matches 1-0 despite conceding 20 shots per game, they are "running hot," and projections should be adjusted downward.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Historical Benchmarks: The Magic Numbers</h2>
                <p>In a standard 38-game league (like the English Premier League), history provides us with "Magic Numbers" that serve as targets:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The 40-Point Safety Mark</h3>
                <p>Traditionally, <strong>40 points</strong> is considered the guarantee of safety from relegation. In reality, the actual number required is often lower (around 36-38), but 40 remains the psychological target for bottom-half teams.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Title Winning Standard</h3>
                <p>Winning the league has become harder in the modern era. Historically, 80 points might have been enough. Today, with "Super Teams" like Manchester City or Liverpool, the benchmark has shifted:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>90+ Points:</strong> Usually guarantees a title.</li>
                    <li><strong>85-90 Points:</strong> A strong title challenge, often enough in competitive seasons.</li>
                    <li><strong>70-75 Points:</strong> Typically secures UEFA Champions League qualification (Top 4).</li>
                </ul>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of Mathematical Projections</h2>
                <p>While calculators provide a steady baseline, football is inherently chaotic. Several factors defy mathematical modeling:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The "New Manager Bounce"</h3>
                <p>teams often see a statistically significant spike in PPG for the first 5-10 games after appointing a new manager. A calculator based on the previous manager's failure will underestimate the team's new trajectory.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">January Transfer Window</h3>
                <p>A mid-season signing can transform a team. A relegation-threatened side buying a prolific goalscorer can instantly increase their win probability in a way past data cannot predict.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Dead Rubber Matches</h3>
                <p>At the end of the season, mid-table teams with "nothing to play for" often drop points against desperate teams fighting for survival or the title. This motivation gap is a rigorous variable to quantify.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Defy the Odds</h2>
                <p>If your team's probability looks bleak, how do they turn it around?</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Targeting "Six-Pointers":</strong> Wins against direct rivals (e.g., 17th vs 18th) effectively swing the projected final table by 6 points relative to the opponent.</li>
                    <li><strong>Sacrificing Cups:</strong> fielding weaker teams in cup competitions to preserve energy for the league is a common, albeit unpopular, strategy to maximize league PPG.</li>
                    <li><strong>Defensive Solidity:</strong> A draw (1 point) is infinitely better than a loss (0 points). Relegation battles are often survived by accumulating steady draws rather than chasing risky wins.</li>
                </ul>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>The Football League Standing Probability Calculator is a lens into the future, offering a rational, data-driven check on emotional expectations. By understanding the required run rates and historical benchmarks, fans and analysts can temper optimism with realism or find hope in the statistics.</p>
                <p>As the saying goes, "It's a marathon, not a sprint." This tool helps you see where the marathon is heading.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common queries about league projections and football statistics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is "PPG" and why is it important?</h4>
                            <p className="text-muted-foreground">
                                PPG stands for "Points Per Game." It is calculated by dividing total points by games played. It is the truest measure of a team's form because it accounts for games in hand. A team with fewer points but higher PPG is actually in a stronger position than a team with more points who has played more games.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How many points guarantee safety in the Premier League?</h4>
                            <p className="text-muted-foreground">
                                The magical "40-point mark" is the gold standard for safety. Mathematically, 36-38 points has often been enough in recent years, but teams aiming for 40 effectively guarantee survival. No team with 40 points has ever been relegated from a 38-game Premier League season (since the 1995 reform).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does goal difference really matter?</h4>
                            <p className="text-muted-foreground">
                                Yes, immensely. In almost all leagues, Goal Difference (GD) is the first tie-breaker. A superior goal difference is often worth an extra point. For example, if two teams finish on 38 points, the one with -10 GD will survive over the one with -20 GD. It essentially acts as a "0.5 point" advantage.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a "Six-Pointer"?</h4>
                            <p className="text-muted-foreground">
                                A "Six-Pointer" is a match between two teams competing for the same objective (e.g., both fighting relegation). It's called this because winning gives you 3 points AND denies your rival 3 points, effectively causing a 6-point swing in the relative standings.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can this calculator predict cup competitions?</h4>
                            <p className="text-muted-foreground">
                                No. Cup competitions are knockout tournaments where a single bad game eliminates you. This calculator uses "Law of Large Numbers" principles applicable to long league formats, not the high-variance nature of knockout cups.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why does the projection change so much early in the season?</h4>
                            <p className="text-muted-foreground">
                                Early in the season, the sample size is small. One win can jump a team's PPG from 1.0 to 1.5. As the season progresses (20+ games), the PPG stabilizes, and projections become much more accurate and less volatile.
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
                                    <strong className="block text-primary mb-1">Fan Groups</strong>
                                    <span className="text-sm text-muted-foreground">To settle debates about whether the team is "safe" or "in crisis."</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Sports Bettors</strong>
                                    <span className="text-sm text-muted-foreground">To identify value in weirdly priced "Season Future" markets.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Managers</strong>
                                    <span className="text-sm text-muted-foreground">Teams pushing for a title often rotate less; calculating motivation is key.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Content Creators</strong>
                                    <span className="text-sm text-muted-foreground">To generate data-backed predictions for blogs or videos.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Example</h3>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Scenario:</strong> It's Game Week 30. Team A has 32 points.
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    <strong>Analysis:</strong> Their PPG is 1.06 (32/30). With 8 games left, they are projected to earn 8.5 more points.
                                    Final Projection: 40.5 points.
                                </p>
                                <p className="text-sm font-semibold mt-2 text-primary">
                                    Verdict: They are statistically likely to survive, but it will be close. A single win in the next 2 games would boost their safety probability to near 95%.
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
                                The Football League Standing Probability Calculator provides a realistic snapshot of a team's season trajectory.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By stripping away emotion and focusing on Points Per Game (PPG) and remaining opportunities, it separates true contenders from pretenders and identifies those genuinely at risk of the drop.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
