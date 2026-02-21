import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, AlertCircle, Info, Calculator, BarChart3, TrendingUp, Target, Users, CheckCircle2, FunctionSquare } from 'lucide-react';
import BasketballUsageRateCalculatorInteractive from './basketball-usage-rate-calculator-interactive';

export default function BasketballUsageRateCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball Usage Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate a player's Usage Rate (Usg%) to understand their offensive load and responsibility within the team's system.
                </p>
            </div>

            <BasketballUsageRateCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Metrics required for the Hollinger Usage Rate formula
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Shooting Actions (FGA & FTA)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Field Goal Attempts and Free Throw Attempts represent the primary ways a possession ends in a shot.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>FGA:</strong> Includes all missed and made shots.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>FTA:</strong> Free throws are weighted (0.44) to estimate possessions used.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Turnovers & Time
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Possessions that end without a shot, normalized by time on court.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>Turnovers:</strong> Count as "using" a possession negatively.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>Minutes:</strong> Usage is a <em>per-minute</em> estimate, comparing player pace to team pace.</span>
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
                        <p className="font-mono text-sm break-words md:text-center">
                            100 * ((FGA + 0.44*FTA + TOV) * (Tm MP/5)) / (MP * (Tm FGA + 0.44*Tm FTA + Tm TOV))
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This formula calculates the percentage of team plays used by a player while they were on the floor. It accounts for the varying pace of the game by normalizing against team totals.
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
                        Optimize your analysis with these complementary tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/basketball-true-shooting-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">True Shooting %</p>
                                            <p className="text-sm text-muted-foreground">Scoring efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/basketball-player-efficiency-rating-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">PER Calculator</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/basketball-free-throw-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Free Throw %</p>
                                            <p className="text-sm text-muted-foreground">Ft accuracy</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/basketball-assist-to-turnover-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Assist/Turnover</p>
                                            <p className="text-sm text-muted-foreground">Playmaking stats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/basketball-rebound-rate-calculator" className="block">
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
                        <Link href="/sports-training/basketball-field-goal-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">FG% Calculator</p>
                                            <p className="text-sm text-muted-foreground">Shot accuracy</p>
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
                <meta itemProp="name" content="The Complete Guide to Basketball Usage Rate: Definition, Formula, and Analysis" />
                <meta itemProp="description" content="Master the concept of Usage Rate (Usg%) in basketball. Learn the Hollinger formula, interpret Usage vs Efficiency, and understand how modern offenses are built around high-usage superstars." />
                <meta itemProp="keywords" content="basketball usage rate, Usg% formula, offensive usage, NBA advanced stats, high usage player, basketball analytics efficiency" />
                <meta itemProp="author" content="MegaCalc Basketball Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Usage Rate in Modern Basketball</h2>
                <p className="text-lg italic text-muted-foreground">Usage Rate (Usg%) is the defining metric of the modern "heliocentric" NBA, quantifying exactly how much of an offense runs through a single player.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Usage Rate?</a></li>
                    <li><a href="#formula" className="hover:underline">The Mathematics Behind Usg%</a></li>
                    <li><a href="#interpretation" className="hover:underline">Interpreting the Numbers: Benchmarks</a></li>
                    <li><a href="#tradeoff" className="hover:underline">The Usage-Efficiency Tradeoff</a></li>
                    <li><a href="#limitations" className="hover:underline">What Usage Rate Misses</a></li>
                    <li><a href="#historical" className="hover:underline">Historical Context: The Rise of High Usage</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Usage Rate?</h2>
                <p><strong>Usage Rate (Usg%)</strong> is an estimate of the percentage of team plays used by a player while they are on the floor. It effectively answers the question: <em>"When this player is in the game, how often does a possession end with the ball in their hands?"</em></p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Defining "Using" a Possession</h3>
                <p>In basketball analytics, a possession can only end in one of three ways for an individual player:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Field Goal Attempt (FGA):</strong> The player shoots the ball (make or miss).</li>
                    <li><strong>Free Throw Attempt (FTA):</strong> The player goes to the line (usually ends the possession).</li>
                    <li><strong>Turnover (TOV):</strong> The player loses the ball to the other team.</li>
                </ul>
                <p className="mt-4">If a player passes the ball and a teammate scores, that does <strong>not</strong> count towards the passer's usage rate. It counts towards the scorer's usage rate. This is a critical distinction: Usage Rate measures <em>scoring attempts and turnovers</em>, not general ball dominance or "time of possession" (though they are often correlated).</p>

                <hr />

                {/* FORMULA */}
                <h2 id="formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mathematics Behind Usg%</h2>
                <p>The standard formula, popularized by John Hollinger, normalizes a player's volume against the team's total volume and the minutes played. This ensures that a player isn't penalized for playing in a slow-paced game, nor rewarded simply for playing 48 minutes.</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-lg text-primary font-bold">
                        Usg% = 100 × [ (FGA + 0.44×FTA + TOV) × (Tm MP/5) ] / [ MP × (Tm FGA + 0.44×Tm FTA + Tm TOV) ]
                    </p>
                </div>

                <p>This looks complex, but it essentially boils down to:</p>
                <p className="font-semibold text-center my-4 text-xl">
                    (Player's Possessions / Player's Minutes) ÷ (Team's Possessions / Team's Minutes)
                </p>
                <p>The constant <code>0.44</code> is used to estimate possessions from free throws, accounting for "and-one" plays and technicals where one FT doesn't equal one full possession.</p>

                <hr />

                {/* INTERPRETATION */}
                <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Usage Rate</h2>
                <p>Since there are 5 players on the court, the "average" usage rate is theoretically <strong>20%</strong> (100% / 5). However, roles in basketball are rarely equal.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">High Usage (Above 30%)</h4>
                        <p className="text-sm">Reserved for absolute superstars and "heliocentric" engines. Players like Luka Dončić, James Harden, or Joel Embiid often operate here. The entire offense is built around their decision-making. Sustaining this with high efficiency is the mark of an MVP.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Primary Scorer (25-30%)</h4>
                        <p className="text-sm">The leading scorer on a good team or the star of an average team. Examples might include a #1 option like Devin Booker or Jayson Tatum in certain seasons. They take the most shots but share somewhat.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Role Player (15-20%)</h4>
                        <p className="text-sm"> "3-and-D" wings, rim-running centers, or pass-first point guards often fall here. They are vital to the team but don't force shots. They finish plays created by others.</p>
                    </div>
                    <div className="bg-primary/5 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2">Low Usage (Below 15%)</h4>
                        <p className="text-sm">Defensive specialists or players with very limited offensive skill sets. If a player has low usage and low efficiency, they are a liability. If they have low usage but high efficiency (e.g., scoring only on dunks), they are valuable specialists.</p>
                    </div>
                </div>

                <hr />

                {/* TRADEOFF */}
                <h2 id="tradeoff" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Usage-Efficiency Tradeoff</h2>
                <p>The "Holy Grail" of basketball analytics is maintaining high efficiency (True Shooting %) while carrying a high Usage Rate. Historically, as a player's usage increases, their efficiency tends to decrease. This is intuitive: taking more shots means taking harder, more contested shots as the defense keys in on you.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The "Empty Calories" Scorer</h3>
                <p>A player with 30% Usg but 50% TS% is often detrimental to winning. They consume a third of the team's possessions but produce points at a rate below league average. This is often called "empty stats."</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The "Scalability" Factor</h3>
                <p>Some players, like Stephen Curry or Kevin Durant, have historically shown incredible "scalability"—the ability to increase usage without a significant drop in efficiency. These players are the most valuable assets in the sport because they can single-handedly power an elite offense.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What Usage Rate Misses</h2>
                <p>Usage Rate is not a perfect "ball dominance" metric. Its biggest blind spot is passing.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>The "Rondo" Problem:</strong> A point guard who dribbles for 20 seconds and then passes to a teammate for a shot has "used" the shot clock, but statistical <em>Usage Rate</em> will credit the shooter, not the passer (unless the passer turns it over).</li>
                    <li><strong>Time of Possession:</strong> Modern tracking data separates "Time of Possession" from "Usage Rate." Trae Young might have high usage AND high time of possession. Klay Thompson might have high usage (lots of shots) but very low time of possession (catch-and-shoot).</li>
                    <li><strong>Defense:</strong> Usage Rate is purely an offensive metric. It tells you nothing about a player's defensive workload.</li>
                </ul>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Usage Rate is an essential context tool. Raw points per game can lie; a player scoring 20 PPG on 15% usage is vastly different from one scoring 20 PPG on 30% usage. The former is hyper-efficient; the latter is a volume chucker. By using this calculator, coaches and analysts can better understand the hierarchy of their offense and identify whether players are being over-taxed or under-utilized.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Usage Rate calculations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the highest usage rate ever recorded?</h4>
                            <p className="text-muted-foreground">
                                In the NBA, Russell Westbrook set the single-season record in 2016-17 with a Usage Rate of <strong>41.7%</strong> during his MVP season. Prior to that, Kobe Bryant and Michael Jordan had seasons peaking in the high 30s. In modern "heliocentric" offenses, usage rates above 35% are becoming slightly more common for primary ball-handlers.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a high usage rate mean a player is "ball hogging"?</h4>
                            <p className="text-muted-foreground">
                                Not necessarily. High usage means a player finishes many possessions. If they do so efficiently (high shooting percentage, low turnovers), it's good strategy. "Ball hogging" usually implies keeping the ball without passing or taking bad shots. A catch-and-shoot player can have high usage without holding the ball for long (e.g., Klay Thompson).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does Usage Rate include assists?</h4>
                            <p className="text-muted-foreground">
                                No. This is a common misconception. Assists are not included in the standard usage rate formula. Usage rate measures possessions <em>finished</em> by the player (shot attempt or turnover). There are other metrics like "Trade Percentage" or "Offensive Load" that attempt to mix assists with usage.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is 0.44 used for Free Throws?</h4>
                            <p className="text-muted-foreground">
                                Not every free throw trip takes up a full possession. "And-ones" (scoring + 1 FT) occur on the same possession as the shot. Technical fouls are also separate. Statistical analysis has determined that, on average, a trip to the free-throw line consumes about 0.44 of a possession's worth of "opportunities."
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can usage rate be negative?</h4>
                            <p className="text-muted-foreground">
                                No. Since shots, free throws, and turnovers cannot be negative, usage rate will always be positive. The lowest possible usage rate is 0% (if a player stands on the court and never shoots or turns the ball over).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does Usage Rate differ from Time of Possession?</h4>
                            <p className="text-muted-foreground">
                                Time of Possession measures how many seconds a player has the ball. Usage Rate measures how many <em>possessions they end</em>. A player like Klay Thompson can have high Usage (taking many shots) but low Time of Possession (catching and shooting immediately). Conversely, a pass-first point guard can have high Time of Possession but low Usage.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is there an "ideal" usage rate?</h4>
                            <p className="text-muted-foreground">
                                For a #1 option, 30% is often considered the ceiling of "healthy" usage before fatigue sets in. For role players, 15-20% is ideal. However, the "ideal" rate is whatever usage maximizes the team's overall efficiency. If a player is scoring 1.2 points per possession, you want their usage as high as possible.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why are Minutes Played (MP) part of the formula?</h4>
                            <p className="text-muted-foreground">
                                The formula calculates a <em>per-minute</em> usage rate. If a player takes 10 shots in 10 minutes, their usage is much higher than a player taking 10 shots in 40 minutes. The formula normalizes volume against the time available to accumulate that volume.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does Usage Rate account for game pace?</h4>
                            <p className="text-muted-foreground">
                                Yes. By including "Team Field Goal Attempts" and "Team Minutes" in the denominator, the formula inherently adjusts for pace. A player taking 20 shots in a slow game yields a higher usage rate than taking 20 shots in a fast-paced game with more total possessions available.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is "Team Usage Rate"?</h4>
                            <p className="text-muted-foreground">
                                By definition, the sum of usage rates for the 5 players on the floor always equals 100% (or very close to it due to rounding and the 0.44 FT estimation). Usage Rate is a zero-sum game; if one player's usage goes up, their teammates' usage must go down.
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
                                    <strong className="block text-primary mb-1">Coaches & Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Identify whether your best scorer is getting enough touches or if a role player is shooting too much.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Basketball Managers</strong>
                                    <span className="text-sm text-muted-foreground">High usage rates correlate strongly with fantasy points. Knowing usage helps predict breakout players.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Players</strong>
                                    <span className="text-sm text-muted-foreground">Understand your role statistically. Are you a high-volume scorer or a connector?</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Media & Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Use Usg% to validite narratives about "one-man armies" or "team-first offenses."</span>
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
                                The Basketball Usage Rate Calculator provides a definitive look at offensive hierarchy.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It strips away the noise of pace and minutes played to reveal exactly who is finishing the plays for a team, serving as a fundamental component of advanced basketball profiling.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
