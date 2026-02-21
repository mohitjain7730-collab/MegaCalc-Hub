import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, TrendingUp, Users, Shield, Target } from 'lucide-react';
import BaseballRunDifferentialCalculatorInteractive from './baseball-run-differential-calculator-interactive';

export default function BaseballRunDifferentialCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball/ Softball Run Differential Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Project your team's true winning potential using Run Differential and Pythagorean Expectation.
                </p>
            </div>

            <BaseballRunDifferentialCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics for Pythagorean Expectation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <TrendingUp className="h-4 w-4" />
                                Runs Scored (RS)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of runs your team has scored in all games played. This measures offensive efficiency.
                            </p>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <Shield className="h-4 w-4" />
                                Runs Allowed (RA)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of runs your opponents have scored against your team. This measures pitching and defensive efficiency.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formula Used */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FunctionSquare className="h-5 w-5" />
                        Formulas Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center mb-2">
                            <strong>Differential</strong> = Runs Scored - Runs Allowed
                        </p>
                        <p className="font-mono text-sm text-center">
                            <strong>Pythagorean Win %</strong> = (RS^1.83) / (RS^1.83 + RA^1.83)
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        The Run Differential is a simple subtraction. However, the prediction of future success uses Bill James' famous <strong>Pythagorean Expectation</strong> formula. The exponent 1.83 is the generally accepted constant for modern baseball environments.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Baseball Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other key sabermetrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/baseball-fielding-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Fielding Percentage</p>
                                            <p className="text-sm text-muted-foreground">Defensive Reliability</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Hits / At Bats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-era-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">ERA Calculator</p>
                                            <p className="text-sm text-muted-foreground">Run Prevention Stat</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-whip-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">WHIP Calculator</p>
                                            <p className="text-sm text-muted-foreground">Walks + Hits / IP</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/baseball-ops-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">OPS Calculator</p>
                                            <p className="text-sm text-muted-foreground">Overall offensive value</p>
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
                                            <p className="text-sm text-muted-foreground">Getting on base stat</p>
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
                <meta itemProp="name" content="Beyond Wins and Losses: The Power of Run Differential" />
                <meta itemProp="description" content="A comprehensive guide to Run Differential and Pythagorean Expectation in Baseball. Learn why runs scored vs allowed is the best predictor of future team success." />
                <meta itemProp="keywords" content="baseball run differential calculator, pythagorean expectation baseball, runs scored runs allowed, baseball standings projection, luck in baseball" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Truth Teller: Why Run Differential Matters More Than Record</h2>
                <p className="text-lg italic text-muted-foreground">&quot;You are what your record says you are.&quot; &mdash; Bill Parcells.</p>
                <p>In football, that might be true. But in baseball, your record can be a liar. Run Differential is the polygraph test.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Run Differential?</a></li>
                    <li><a href="#pythag-theorem" className="hover:underline">The Pythagorean Theorem of Baseball</a></li>
                    <li><a href="#lucky-unlucky" className="hover:underline">Are You Lucky or Good?</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Historical Benchmarks</a></li>
                    <li><a href="#strategy" className="hover:underline">How Teams Use This Data</a></li>
                    <li><a href="#limitations" className="hover:underline">When Differential Fail</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Run Differential?</h2>
                <p><strong>Run Differential</strong> is the simplest yet most telling formula in baseball analytics: <em>Runs Scored minus Runs Allowed</em>.</p>
                <p>If your team scores 5 runs and allows 3, your differential for that game is +2. Over the course of a 162-game season, this number paints a vivid picture of a team&apos;s dominance or incompetence.</p>
                <p>Why does it matter? Because individual game outcomes can be fluky. A team might win a game 1-0 on a lucky bounce, but lose the next day 10-0 because their pitching is terrible. Their record is 1-1 (.500), but their run differential is -9. The differential correctly identifies them as a &quot;bad&quot; team despite the even record.</p>

                <hr />

                {/* PYTHAGOREAN THEOREM */}
                <h2 id="pythag-theorem" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Pythagorean Theorem of Baseball</h2>
                <p>Developed by the godfather of sabermetrics, Bill James, the Pythagorean Expectation formula relates runs scoted to win percentage. It is called &quot;Pythagorean&quot; because the formula resembles the geometry theorem (a² + b² = c²).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Formula</h3>
                <p>The standard formula is:</p>
                <div className="p-4 bg-muted rounded my-4 font-mono text-center">
                    Win % = (Runs Scored)^1.83 / [ (Runs Scored)^1.83 + (Runs Allowed)^1.83 ]
                </div>
                <p>Originally, James used an exponent of 2. However, statistical analysis over decades has shown that 1.83 is more accurate for MLB environments. This formula predicts what a team's winning percentage <em>should</em> be based on their offensive and defensive performance.</p>

                <hr />

                {/* LUCKY VS UNLUCKY */}
                <h2 id="lucky-unlucky" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Are You Lucky or Good?</h2>
                <p>This is the most powerful application of the calculator. By comparing a team's <strong>Actual Win %</strong> with their <strong>Pythagorean Win %</strong>, we can quantify luck.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The &quot;Lucky&quot; Team</h3>
                <p>Imagine a team with a record of 50-40 (.555) but a Run Differential of -10. Their Pythagorean expectation might be .490 (roughly 44-46).
                    <br />
                    This team is &quot;outperforming their pythag.&quot; This usually happens because they are winning an unsustainable number of 1-run games (often due to bullpen luck or sequencing luck). Analytics departments would predict this team to regress and lose more often in the second half of the season.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The &quot;Unlucky&quot; Team</h3>
                <p>Conversely, a team might be 40-50 (.444) but have a +50 Run Differential. They are likely losing many close games but blowing opponents out when they win. We would call this team &quot;better than their record&quot; and expect them to improve as luck evens out.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Historical Benchmarks</h2>
                <p>What does a &quot;good&quot; differential look like over 162 games?</p>
                <ul className="list-disc ml-6 space-y-4 mt-2">
                    <li><strong>+200 or more:</strong> A Juggernaut. These teams typically win 100+ games. Example: 1998 Yankees (+309), 2001 Mariners (+300).</li>
                    <li><strong>+100 to +199:</strong> Division Champion. Likely 92-98 wins. A very strong postseason contender.</li>
                    <li><strong>0 to +50:</strong> The Bubble. These teams fight for Wild Card spots. Their season often comes down to luck in close games.</li>
                    <li><strong>-100 or worse:</strong> Rebuilding. This team is fundamentally broken, either unable to pitch or unable to hit. They likely lose 90+ games.</li>
                    <li><strong>-200 or worse:</strong> Historic Ineptitude. Example: 2003 Detroit Tigers (-337).</li>
                </ul>

                <hr />

                {/* STRATEGY */}
                <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Teams Use This Data</h2>
                <p>General Managers live by this number at the trade deadline (July 31st).</p>
                <p>If a team is 5 games out of a playoff spot but has a massive positive run differential, the GM will often <strong>Buy</strong> (trade for players), believing the team is good and just unlucky.
                    <br />
                    If a team is holding a playoff spot but has a negative run differential, a smart GM might actually <strong>Sell</strong> (trade away players), recognizing the team is a "paper tiger" that is likely to collapse down the stretch.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">When Differential Fails</h2>
                <p>While highly predictive, Run Differential isn&apos;t perfect. It treats all runs as equal, but they aren&apos;t always equal in terms of game impact.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The &quot;Blowout&quot; Distortion</h3>
                <p>If a team loses five games by a score of 2-1 and then wins one game 20-0, their record is 1-5.
                    <br />
                    Their Runs Scored is 25. Their Runs Allowed is 10.
                    <br />
                    Their Differential is +15.
                    <br />
                    The calculator would say they are a great team (positive differential), but in reality, they just had one explosive day and lost every other game. This is why looking at the <em>median</em> game result can sometimes be a useful companion check.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Bullpen Quality</h3>
                <p>Teams with elite bullpens can consistently outperform their Pythagorean expectation. If you can shorten the game to 7 innings and lock down 1-run leads with a dominant closer, you can sustain a better record than your run differential predicts (e.g., the 2012 Orioles or mid-2010s Royals).</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Run Differential
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Has a team with a negative run differential ever won the World Series?</h4>
                            <p className="text-muted-foreground">
                                Yes. The 1987 Minnesota Twins won the World Series despite being outscored by 20 runs in the regular season (-20 differential). However, this is extremely rare. Almost all champions have strong positive differentials.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does Run Differential matter in the playoffs?</h4>
                            <p className="text-muted-foreground">
                                In a short series (5 or 7 games), anything can happen. However, Run Differential is the best predictor of <em>getting</em> to the playoffs. Once there, the "luck" factor of close games increases significantly due to small sample sizes.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is the exponent 1.83?</h4>
                            <p className="text-muted-foreground">
                                Bill James originally used 2. Statiscians later found that 2 was slightly too high. 1.83 (or sometimes 1.81) minimizes the "root mean square error" when back-testing against historical MLB seasons. In other sports like Basketball, the exponent is much higher (around 13-16) because scoring is more frequent.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does Run Differential relate to "Games Back"?</h4>
                            <p className="text-muted-foreground">
                                "Games Back" is a standings metric based on wins and losses. Run Differential is a performance metric. Often, if a team trailing in "Games Back" has a better Run Differential than the leader, analysts predict they will eventually catch up.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is it better to have a great offense or great pitching?</h4>
                            <p className="text-muted-foreground">
                                Mathematically, a run scored and a run prevented affect differential equally. A +100 differential can come from scoring 900 runs and allowing 800 (sluggers), or scoring 700 and allowing 600 (pitching duelists). Both teams are expected to win roughly the same number of games.
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
                                    <strong className="block text-primary mb-1">Sports Bettors</strong>
                                    <span className="text-sm text-muted-foreground">Use differential to identify "overvalued" teams (good record, bad differential) to bet against, or undervalued teams to bet on.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Managers</strong>
                                    <span className="text-sm text-muted-foreground">Target pitchers on teams with good differentials but poor records—wins are likely to increase.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Understand if your losing streak is "bad luck" or "bad play." If differential is fine, stay the course.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fans</strong>
                                    <span className="text-sm text-muted-foreground">Win arguments about whether your rival team is actually "good" or just "lucky."</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Case Study A (The Lucky Team):</strong>
                                        <br />
                                        Team X is 20-10 (.666). They have Scored 120 and Allowed 115 runs (+5 Diff).
                                        <br />
                                        <strong>Verdict:</strong> Their Pythogorean expectation is only .521. They are massively overperforming and likely to crash back to earth.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Case Study B (The Dominator):</strong>
                                        <br />
                                        Team Y is 20-10 (.666). They have Scored 180 and Allowed 100 runs (+80 Diff).
                                        <br />
                                        <strong>Verdict:</strong> Their Pythagorean expectation is .740. They are actually <em>underperforming</em> and might be arguably the best team in the league despite the same record as Team X.
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
                                The Baseball Run Differential Calculator is the ultimate reality check for any baseball team.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By stripping away the noise of one-run wins and lucky bounces, it reveals the true quality of a roster. Whether you are a fan trying to predict the playoffs or a coach evaluating season performance, specific wins and losses tell you <em>what happened</em>, but Run Differential tells you <em>what comes next</em>.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
