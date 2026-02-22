import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle, Info, Calculator, BarChart3, TrendingUp, Target, Users, CheckCircle2, Lock } from 'lucide-react';
import BasketballDefensiveEfficiencyCalculatorInteractive from './basketball-defensive-efficiency-calculator-interactive';

export default function BasketballDefensiveEfficiencyCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball Defensive Efficiency Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate Defensive Rating (Points Allowed Per 100 Possessions) to measure true defensive performance, independent of game pace.
                </p>
            </div>

            <BasketballDefensiveEfficiencyCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics for calculating defensive efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Opponent Scoring
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Events that determine points allowed by your defense.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Opponent Points:</strong> Total points scored by the opposing team.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Opponent FGA:</strong> Shots attempted against your defense.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Possession Modifiers
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Events that extend or end opponent possessions.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>Opponent ORB:</strong> Giving up an offensive rebound extends the opponent&apos;s possession.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>Forced Turnovers:</strong> Ending an opponent&apos;s possession with 0 points.</span>
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
                        Formula Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm md:text-center mb-2">
                            <strong>Defensive Rating</strong> = 100 × (Points Allowed / Possessions)
                        </p>
                        <p className="font-mono text-sm md:text-center text-muted-foreground">
                            <strong>Possessions</strong> ≈ Opp FGA - Opp ORB + Opp TOV + (0.44 × Opp FTA)
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This formula normalizes defensive performance to a &quot;per 100 possessions&quot; basis. This allows you to compare the defense of a slow-paced team (few possessions) with a fast-paced team (many possessions) fairly.
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
                        <Link href="/basketball-offensive-efficiency-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Offensive Efficiency</p>
                                            <p className="text-sm text-muted-foreground">The offensive counterpart</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-rebound-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Rebound Rate</p>
                                            <p className="text-sm text-muted-foreground">Board dominance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-player-efficiency-rating-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">PER Calculator</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-usage-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Info className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Usage Rate</p>
                                            <p className="text-sm text-muted-foreground">Offensive load</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-field-goal-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">FG% Calculator</p>
                                            <p className="text-sm text-muted-foreground">Shot defense tracking</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/basketball-assist-to-turnover-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Assist/Turnover</p>
                                            <p className="text-sm text-muted-foreground">Ball control metrics</p>
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
                <meta itemProp="name" content="The Complete Guide to Basketball Defensive Efficiency (DRtg)" />
                <meta itemProp="description" content="Master Defensive Efficiency (Points Allowed Per 100 Possessions). Learn how to calculate DRtg, why it's better than Points Per Game allowed, and how to build a championship defense." />
                <meta itemProp="keywords" content="basketball defensive efficiency, defensive rating calculator, DRtg formula, defensive analytics, points allowed per 100 possessions, NBA defense stats" />
                <meta itemProp="author" content="MegaCalc Basketball Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Defensive Efficiency: The Championship Metric</h2>
                <p className="text-lg italic text-muted-foreground">&quot;Defense wins championships&quot; is a cliché, but Defensive Efficiency is the metric that proves it. By measuring stops per possession rather than just raw points, coaches can evaluate their system&apos;s true integrity.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Defensive Efficiency (DRtg)?</a></li>
                    <li><a href="#why-it-matters" className="hover:underline">Why Use DRtg Over &quot;Points Allowed&quot;?</a></li>
                    <li><a href="#formula" className="hover:underline">The Formula Explained</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What Makes a Good Defense?</a></li>
                    <li><a href="#four-factors" className="hover:underline">The Four Factors of Defense</a></li>
                    <li><a href="#improvement" className="hover:underline">Strategies to Improve DRtg</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Defensive Efficiency (DRtg)?</h2>
                <p><strong>Defensive Efficiency</strong>, or <strong>Defensive Rating (DRtg)</strong>, estimates the number of points a team allows per 100 possessions. Unlike raw &quot;Opponent Points Per Game,&quot; which can be skew, this metric accounts for pace.</p>

                <p className="mt-4">It asks the question: <em>&quot;When the opponent has the ball 100 times, how many points do they score?&quot;</em></p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Individual vs. Team DRtg</h3>
                <p>While this calculator primarily computes absolute efficiency (best used for teams), analysts also calculate &quot;Individual Defensive Rating.&quot; Individual DRtg estimates how many points the player&apos;s matchup scores while they are on the court. It is notoriously difficult to calculate accurately without play-by-play data, whereas <strong>Team Defensive Rating</strong> is extremely reliable and easy to compute with box score data.</p>

                <hr />

                {/* WHY IT MATTERS */}
                <h2 id="why-it-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Use DRtg Over &quot;Points Allowed&quot;?</h2>
                <p>Consider two defensive scenarios:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Team A (Slow Pace):</strong> Allows 90 points per game, but opponents only have 80 possessions.</li>
                    <li><strong>Team B (Fast Pace):</strong> Allows 110 points per game, but opponents have 115 possessions.</li>
                </ul>
                <p className="mt-4"><strong>Team A DRtg:</strong> (90/80)*100 = <strong>112.5</strong> (Terrible Defense)</p>
                <p><strong>Team B DRtg:</strong> (110/115)*100 = <strong>95.6</strong> (Elite Defense)</p>
                <p className="mt-4">Even though Team A allows 20 fewer points per game, their defense is actually <em>worse</em> because opponents score more efficiently every time they touch the ball. Team B just plays at a lightning pace, inflating the score.</p>

                <hr />

                {/* FORMULA */}
                <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Formula Explained</h2>
                <p>The core of the calculation is estimating <strong>Possessions</strong>. We use the opponent&apos;s offensive stats:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-lg text-primary font-bold">
                        DRtg = 100 × (Opponent Points / Possessions)
                    </p>
                </div>
                <p className="text-center text-sm text-muted-foreground">Where Possessions ≈ Opp FGA - Opp ORB + Opp TOV + (0.44 × Opp FTA)</p>

                <p className="mt-4">Every possession ends in a shot (FGA), a turnover (TOV), or free throws (FTA). Subtracting offensive rebounds prevents double-counting the same possession.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What Makes a Good Defense?</h2>
                <p>In the modern high-scoring era, benchmarks have shifted. Here is a general guide:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Elite (Below 108)</h4>
                        <p className="text-sm">A &quot;lockdown&quot; defense. Teams in this range usually have a Defensive Player of the Year candidate and disciplined rotations.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Detailed (108 - 112)</h4>
                        <p className="text-sm">Solid playoff defense. Good enough to win providing the offense carries its weight.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Average (113 - 116)</h4>
                        <p className="text-sm"> League average performance. You likely need a top-10 offense to be a serious contender.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Poor (Above 116)</h4>
                        <p className="text-sm">Defensive sieve. Opponents are scoring comfortably. Common in rebuilding teams or those that sacrifice defense for offense.</p>
                    </div>
                </div>

                <hr />

                {/* FOUR FACTORS */}
                <h2 id="four-factors" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Four Factors of Defense</h2>
                <p>To improve your DRtg, focus on Dean Oliver&apos;s &quot;Four Factors&quot; applied defensively:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Opponent eFG% (Stop the Shot)</h3>
                <p>Force tough, contested shots. Eliminate open corner 3s and layups.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Defensive Rebounding (End the Possession)</h3>
                <p>Forcing a miss means nothing if you don&apos;t get the rebound. Limiting opponent offensive rebounds (ORB%) is critical to ending possessions.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Forced Turnovers (Create Chaos)</h3>
                <p>Turnovers are the best defensive outcome. They yield 0 points resulting in a &quot;stop,&quot; and often lead to easy transition buckets for you.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Free Throw Prevention (Discipline)</h3>
                <p>Don't bail out bad offense with a foul. Free throws are the most efficient shot in the game. Defend without fouling.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve DRtg</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Communication:</strong> Most defensive breakdowns occur due to missed switches or confusion.</li>
                    <li><strong>Protect the Paint:</strong> Shots at the rim are high percentage. A rim protector lowers opponent eFG%.</li>
                    <li><strong>Transition Defense:</strong> Sprint back. Don't give up easy points before your defense is set.</li>
                    <li><strong>Know Personnel:</strong> Force shooters to drive, force drivers to shoot.</li>
                </ul>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Defensive Efficiency is the honest truth about your team's ability to stop the ball. It eliminates pace biases and exposes weaknesses in rebounding or fouling. Use this calculator to track your team's progress game-by-game and compare yourself to elite benchmarks.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Defensive Rating and efficiency
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a higher or lower Defensive Rating better?</h4>
                            <p className="text-muted-foreground">
                                <strong>Lower is better.</strong> Since it measures &quot;Points Allowed,&quot; you want this number to be as small as possible. This is the opposite of Offensive Rating, where higher is better.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does this differ from &quot;Adjusted Defensive Rating&quot;?</h4>
                            <p className="text-muted-foreground">
                                This calculator computes raw Defensive Rating based on box score stats. &quot;Adjusted&quot; ratings (often found on sites like KenPom or Basketball Reference) further adjust this number based on the <em>quality of the opponent</em>. A good defensive game against an elite offense is worth more than a good game against a bad offense.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can I calculate individual player DRtg here?</h4>
                            <p className="text-muted-foreground">
                                Not directly. While you can input the stats opponents accumulated <em>while a player was on the court</em>, standard individual DRtg formulas are much more complex and involve play-by-play data to assign credit for stops. This tool is best for Team Defensive Efficiency or Lineup Efficiency.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why are offensive rebounds subtracted from possessions?</h4>
                            <p className="text-muted-foreground">
                                When an opponent grabs an offensive rebound, their possession continues. It's not a new possession. Subtracting the ORB ensures we don't count the same possession twice, which allows us to accurately measure points per <em>unique</em> possession.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is "Net Rating"?</h4>
                            <p className="text-muted-foreground">
                                Net Rating is simply <strong>Offensive Rating minus Defensive Rating</strong>. It represents the point differential per 100 possessions. A positive Net Rating means you are outscoring opponents; a negative one means you are being outscored.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do turnovers affect Defensive Rating?</h4>
                            <p className="text-muted-foreground">
                                Forced turnovers increase the possession count (denominator) while adding 0 points (numerator). This mathematically lowers your DRtg, which is good. They are essentially "empty possessions" for the opponent.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does pace affect Defensive Rating?</h4>
                            <p className="text-muted-foreground">
                                No, and that is the point. DRtg is "pace-neutral." Whether you play 80 possessions or 120 possessions, the rating normalizes to 100. This is why it is the superior metric for comparing defenses across different eras or styles of play.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a &quot;Stop&quot;?</h4>
                            <p className="text-muted-foreground">
                                A &quot;Stop&quot; is a possession where the opponent scores 0 points. Estimates suggest roughly 50% of possessions end in scores. Elite defenses aim to increase their &quot;Stop Rate&quot; by stringing together consecutive stops (often called &quot;Turkeys&quot; or &quot;Kills&quot; in coaching lingo).
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
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate defensive performance beyond the scoreboard. Identify if a loss was due to bad defense or just bad offense.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Compare historical teams. Is the 2004 Pistons defense actually better than the 2017 Warriors defense?</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Players</strong>
                                    <span className="text-sm text-muted-foreground">Understand the value of a stop. Learn why defensive rebounding is just as important as blocking shots.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Managers</strong>
                                    <span className="text-sm text-muted-foreground">Target players on teams with high pace but bad defensive ratings (high points allowed) for opponent matchups.</span>
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
                        <Lock className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Basketball Defensive Efficiency Calculator (DRtg) provides the most accurate assessment of a team's ability to prevent scoring.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By focusing on points allowed per 100 possessions, it empowers coaches to identify systemic issues and validate defensive improvements regardless of game speed.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
