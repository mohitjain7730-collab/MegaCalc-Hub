import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Hand, Users, Shield, Target } from 'lucide-react';
import BaseballFieldingPercentageCalculatorInteractive from './baseball-fielding-percentage-calculator-interactive';

export default function BaseballFieldingPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Baseball/ Softball Fielding Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your Fielding Percentage (FPCT) instantly and evaluate your defensive reliability on the diamond.
                </p>
            </div>

            <BaseballFieldingPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key stats for calculating Fielding Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Hand className="h-4 w-4" />
                                Putouts (PO)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Credited to a fielder who records an out by tagging a runner, stepping on a base for a force out, or catching a fly ball/strikeout.
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <TrendingUp className="h-4 w-4" />
                                Assists (A)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Credited to a fielder who touches the ball before a putout is recorded by another fielder.
                            </p>
                        </div>
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <AlertCircle className="h-4 w-4" />
                                Errors (E)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Charged for a mistake that allows a batter/runner to reach base or advance, which should have resulted in an out with "ordinary effort."
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
                        Formula Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center">
                            FPCT = (Putouts + Assists) / (Putouts + Assists + Errors)
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        The sum of Putouts, Assists, and Errors is often referred to as "Total Chances." Fielding percentage represents the proportion of chances handled successfully. It is typically calculated to three decimal places (e.g., .985).
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
                        Explore other key baseball metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/baseball-batting-average-calculator" className="block">
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
                        <Link href="/category/sports-training/baseball-era-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">ERA Calculator</p>
                                            <p className="text-sm text-muted-foreground">Run Prevention Stat</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/baseball-whip-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">WHIP Calculator</p>
                                            <p className="text-sm text-muted-foreground">Base Runners per Inning</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/baseball-on-base-percentage-calculator" className="block">
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
                        <Link href="/category/sports-training/baseball-slugging-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Slugging Percentage</p>
                                            <p className="text-sm text-muted-foreground">Power hitting metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/baseball-ops-calculator" className="block">
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
                    </div>
                </CardContent>
            </Card>

            {/* Complete Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="The Golden Glove Standard: Mastery of Fielding Percentage" />
                <meta itemProp="description" content="In-depth guide to Fielding Percentage (FPCT) in Baseball and Softball. Understand the metric, position-specific benchmarks, and how to improve defensive reliability." />
                <meta itemProp="keywords" content="baseball fielding percentage calculator, softball fielding stats, defensive metrics, baseball error rate, gold glove stats, fielding drills" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Defense Wins Championships: The Truth About Fielding Percentage</h2>
                <p className="text-lg italic text-muted-foreground">"Pitching and defense." It's the oldest cliché in baseball because it's true. While home runs make headlines, fielding percentage keeps you in the game.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Fielding Percentage?</a></li>
                    <li><a href="#components" className="hover:underline">The Components: PO, A, E</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks by Position</a></li>
                    <li><a href="#strategies" className="hover:underline">Tactics for Flawless Defense</a></li>
                    <li><a href="#limitations" className="hover:underline">The "Range Factor" Flaw</a></li>
                    <li><a href="#mental-game" className="hover:underline">The Mental Side of Fielding</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Fielding Percentage?</h2>
                <p><strong>Fielding Percentage (FPCT)</strong> is the standard statistic used to quantify defensive reliability in baseball and softball. It answers a simple question: "When the ball is hit to you, how often do you make the play?"</p>
                <p>Mathematically, it represents the ratio of successful defensive plays (putouts and assists) to total defensive opportunities (including errors). A perfect fielding percentage is 1.000, meaning the player has made zero errors.</p>
                <p>However, unlike batting average where .300 is elite, a fielding percentage of .900 (90%) is often considered disastrously poor for a professional infielder. The margins for error in defense are razor-thin.</p>

                <hr />

                {/* COMPONENTS */}
                <h2 id="components" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Components: PO, A, E</h2>
                <p>To truly understand your fielding percentage, you must understand how scorers classify defensive actions.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Putouts (PO)</h3>
                <p>A putout is credited to the fielder who physically records the out. This includes:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>Catching a fly ball.</li>
                    <li>Tagging a runner.</li>
                    <li>Stepping on a base for a force play.</li>
                    <li>Strikeouts (Catchers receive a putout for every strikeout).</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Assists (A)</h3>
                <p>An assist is credited to a fielder who touches the ball before a putout is made by another fielder. For example, on a ground ball to Shortstop (SS) who throws to Firstbase (1B):</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li>The Shortstop gets an <strong>Assist</strong>.</li>
                    <li>The First Baseman gets a <strong>Putout</strong>.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Errors (E)</h3>
                <p>An error is a judgment call by the official scorer. It is charged when a fielder fails to convert an out on a play that could have been made with "ordinary effort." This includes dropping a popup, bobbling a grounder, or making a wild throw.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks by Position</h2>
                <p>Not all positions are created equal. A "good" fielding percentage depends heavily on where you play on the diamond.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">First Base (1B) & Catcher (C)</h3>
                <p><strong>Standard: > .990</strong></p>
                <p>These positions accumulate massive numbers of "easy" putouts (catching routine throws or strikeouts). An error here is rare and costly. If a first baseman drops a throw, it's a disaster.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Middle Infield (SS, 2B) & Third Base (3B)</h3>
                <p><strong>Standard: .960 - .980</strong></p>
                <p>These are the "hot corners" and active zones. Shortstops face the toughest plays—ranging into the hole or behind second base to make long throws. Consequently, their fielding percentages are naturally lower than first basemen. A shortstop fielding .980 is elite (Gold Glove caliber).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Outfield (LF, CF, RF)</h3>
                <p><strong>Standard: > .985</strong></p>
                <p>Outfielders have fewer chances per game than infielders. Most of their opportunities are fly balls, which should be caught 99% of the time. Errors usually come from missed ground balls or wild throws to bases.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tactics for Flawless Defense</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Pre-Pitch Preparation</h3>
                <p>Every elite fielder expects the ball. They are in an athletic "ready position" (knees bent, weight on balls of feet) before the pitcher releases the ball. Mental anticipation reduces reaction time.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Footwork First</h3>
                <p>Bad throws are rarely arm problems; they are footwork problems. Fielders who set their feet toward their target before throwing drastically reduce throwing errors. "Play through the ball" rather than letting it play you.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Soft Hands</h3>
                <p>When fielding grounders, think of your hands as a funnel. Absorb the ball into your midsection ("soft hands") rather than stabbing at it ("hard hands"). This prevents the ball from bouncing away if you don't catch it cleanly.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Range Factor" Flaw</h2>
                <p>Fielding Percentage has a major blind spot: <strong>Range</strong>.</p>
                <p>Consider two Shortstops:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                    <li><strong>Player A:</strong> Very slow. Only reaches balls hit directly at him. He fields everything he touches cleanly. FPCT: 1.000.</li>
                    <li><strong>Player B:</strong> Extremely fast. Dives for balls in the hole that Player A would never reach. He gets to 50 more balls a season but makes 5 errors on difficult plays. FPCT: .970.</li>
                </ul>
                <p>Who is the better defender? Player B. He saves more hits despite the errors. Player A has a "perfect" fielding percentage but allows more balls to pass for hits because he can't reach them. Modern metrics like <em>Defensive Runs Saved (DRS)</em> and <em>Ultimate Zone Rating (UZR)</em> were created to solve this flaw.</p>

                <hr />

                {/* MENTAL GAME */}
                <h2 id="mental-game" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mental Side of Fielding</h2>
                <p>Defense is rhythm. When you make an error, the game speeds up. The best fielders have a "short memory." They delete the previous play from their mind instantly. Carrying the weight of an error into the next pitch leads to "compounding errors."</p>
                <p>Remember: You cannot control the bad hop. You can only control your preparation and your reaction to it.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Defensive Stats
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a Fielder's Choice count as an Error?</h4>
                            <p className="text-muted-foreground">
                                No. A Fielder's Choice (FC) assumes the fielder made a conscious decision to try for an out at another base. If they fail to get the out but handled the ball cleanly, it is not an error, nor is it an assist/putout unless an out is recorded. It does not negatively impact FPCT.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do "mental errors" count against Fielding Percentage?</h4>
                            <p className="text-muted-foreground">
                                Generally, no. If a fielder forgets to cover a base or throws to the wrong base (allowing a runner to advance but not due to a bad throw), scorers rarely charge an Error. These are "mental mistakes" that upset coaches but don't appear in the box score column for Errors.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who holds the record for highest career Fielding Percentage?</h4>
                            <p className="text-muted-foreground">
                                Records vary by position. For First Basemen (min 1000 games), Casey Kotchman holds the MLB record at .999. For Shortstops, Omar Vizquel is legendary with a .985 career mark over 24 seasons.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why do pitchers have such varying Fielding Percentages?</h4>
                            <p className="text-muted-foreground">
                                Pitchers often have fewer chances, so one error can drastically skew their percentage. Additionally, pitchers are selected for their arm talent, not their glove work, leading to widely variable defensive skills on the mound.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is Fielding Percentage useful for Catchers?</h4>
                            <p className="text-muted-foreground">
                                It is less distinctive for catchers because the vast majority of their chances are strikeout putouts (routine). Metrics like "Passed Balls," "Caught Stealing Percentage," and "Catcher Framing" are far more important for evaluating catchers.
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
                                    <strong className="block text-primary mb-1">Infielders & Outfielders</strong>
                                    <span className="text-sm text-muted-foreground">Track consistency over a season to see if you are meeting the benchmarks for your specific position.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Identify which developing players have "reliable hands" vs. those who need more fundamental drilling.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Use FPCT as a baseline "hygiene factor." A low FPCT is a red flag regardless of athletic ability.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Broadcasters</strong>
                                    <span className="text-sm text-muted-foreground">Provide context to viewers when a player makes a crucial error in a big moment.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Example</h3>
                            <div className="p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    <strong>Scenario:</strong> A High School Shortstop has played 25 games.
                                    <br />
                                    He has 30 Putouts, 65 Assists, and 8 Errors.
                                    <br />
                                    <strong>Calculation:</strong> (30 + 65) / (30 + 65 + 8) = 95 / 103 = <strong>.922 FPCT</strong>
                                    <br />
                                    <strong>Assessment:</strong> This is below the desired .950+ range for a high school varsity shortstop. The coach likely needs to work on his throwing mechanics, as many HS errors are throwing errors.
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
                                The Baseball Fielding Percentage Calculator provides a clear snapshot of defensive reliability.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                While it doesn't tell the whole story of a player's range or athletic ability, it remains the foundational metric for judging whether a player can consistently execute the plays they are expected to make. In a game where 27 outs are required for victory, giving the opponent a "28th out" via an error is statistically devastating.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
