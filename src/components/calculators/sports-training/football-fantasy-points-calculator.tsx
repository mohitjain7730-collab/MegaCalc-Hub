import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Activity, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Target, Users, Shield, TrendingUp } from 'lucide-react';
import FootballFantasyPointsCalculatorInteractive from './football-fantasy-points-calculator-interactive';

export default function FootballFantasyPointsCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football Fantasy Points Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate official fantasy football points (FPL-style) for any player performance. Optimize your team selection with data-driven projections.
                </p>
            </div>

            <FootballFantasyPointsCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding Fantasy Scoring
                    </CardTitle>
                    <CardDescription>
                        How different actions translate to points
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                <Shield className="h-4 w-4" />
                                Defensive Actions
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Defenders and Goalkeepers rely heavily on match outcomes (Clean Sheets) rather than just individual brilliance.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                    <span>Clean Sheet: 4 pts (GK/DEF), 1 pt (MID)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                    <span>Goals Conceded: -1 pt for every 2 goals (GK/DEF only)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Target className="h-4 w-4" />
                                Attacking Returns
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Goals and assists are the primary currency for Midfielders and Forwards.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Goal: 6 pts (GK/DEF), 5 pts (MID), 4 pts (FWD)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Assist: 3 pts (All positions)</span>
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
                        Standard FPL Scoring Rules
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h5 className="font-bold border-b pb-1 mb-2">Base Points</h5>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Play &lt; 60 mins: <strong>1</strong></li>
                                    <li>Play &ge; 60 mins: <strong>2</strong></li>
                                    <li>Yellow Card: <strong>-1</strong></li>
                                    <li>Red Card: <strong>-3</strong></li>
                                    <li>Own Goal: <strong>-2</strong></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-bold border-b pb-1 mb-2">Position Specific</h5>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>GK Save (per 3): <strong>1</strong></li>
                                    <li>GK/DEF Goal: <strong>6</strong></li>
                                    <li>MID Goal: <strong>5</strong></li>
                                    <li>FWD Goal: <strong>4</strong></li>
                                    <li>Pen Save: <strong>5</strong></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This calculator follows the standard scoring system used by the world's most popular Fantasy Premier League (FPL) game. Bonus points (BPS) are manually input as they depend on a complex relative index.
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
                        Tools to help you scout better fantasy assets
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/football-expected-assists-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Expected Assists (xA)</p>
                                            <p className="text-sm text-muted-foreground">Find creative mids</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-goals-per-90-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Goals Per 90</p>
                                            <p className="text-sm text-muted-foreground">Scout goal threats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-clean-sheet-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Clean Sheet Probability</p>
                                            <p className="text-sm text-muted-foreground">Pick best DEF/GK</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Win Rate Calculator</p>
                                            <p className="text-sm text-muted-foreground">Predict match outcomes</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-shot-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Shot Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Finishing skill</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-league-standing-probability-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">League Projection</p>
                                            <p className="text-sm text-muted-foreground">Long-term planning</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Fantasy Football Scoring: Mastering the FPL System" />
                <meta itemProp="description" content="A deep dive into how fantasy football points are calculated. Learn strategies for maximizing returns from different positions, understanding the Bonus Points System, and identifying value." />
                <meta itemProp="keywords" content="fantasy football calculator, FPL points, clean sheet points, bonus points system, fantasy premier league scoring, captaincy strategy" />
                <meta itemProp="author" content="MegaCalc Fantasy Experts" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Mastering Fantasy Football: The Science of Scoring Points</h2>
                <p className="text-lg italic text-muted-foreground">Fantasy football isn't just luck; it's a game of probability, risk management, and understanding the precise mechanics of the scoring system.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#mechanics" className="hover:underline">The Mechanics of FPL Scoring</a></li>
                    <li><a href="#positions" className="hover:underline">Positional Value: Where to Spend Your Budget</a></li>
                    <li><a href="#advanced" className="hover:underline">Advanced Scoring: Bonus Points & Saves</a></li>
                    <li><a href="#captaincy" className="hover:underline">The Captaincy Factor</a></li>
                    <li><a href="#strategy" className="hover:underline">Winning Strategies for Long-Term Success</a></li>
                </ul>
                <hr />

                {/* MECHANICS */}
                <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mechanics of FPL Scoring</h2>
                <p>At its heart, Fantasy Premier League (FPL) assigns points to players based on their real-world actions. While everyone knows goals equal points, the nuance lies in the details.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The "Appearance" Point</h3>
                <p>A player gets 1 point just for stepping on the pitch. However, if they play <strong>60 minutes or more</strong>, that doubles to 2 points. This makes the "59th-minute substitution" the most painful event for a fantasy manager, costing them a point and potentially a clean sheet.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Clean Sheets: The Defender's Bread and Butter</h3>
                <p>A clean sheet is worth 4 points to a defender or goalkeeper. Crucially, a player must be on the pitch for at least 60 minutes to qualify. If a defender is substituted in the 70th minute with the score 0-0, and his team later concedes, he <strong>keeps</strong> his clean sheet points. This is known as "locking in" a clean sheet.</p>

                <hr />

                {/* POSITIONS */}
                <h2 id="positions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Positional Value: Where to Spend Your Budget</h2>
                <p>The scoring system is weighted to make different positions valuable in different ways.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Defenders (The Value Kings)</h3>
                <p>modern "attacking full-backs" are often the most valuable assets in the game. A defender who scores a goal gets 6 points + 4 points for a clean sheet + potentially 3 bonus points. That's a 13+ point haul from a single player. Compares this to a striker who scores once (4 points) and gets no clean sheet.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Midfielders (The Engine Room)</h3>
                <p>Midfielders get 5 points for a goal (more than strikers) and 1 point for a clean sheet. This makes "Out of Position" (OOP) midfielders—players listed as MIDs but playing as strikers (e.g., Salah, Son)—extremely valuable, as they get extra points for doing a striker's job.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Forwards (The Rely-On-Goals Group)</h3>
                <p>Forwards have the lowest ceiling per goal (4 points) and no clean sheet potential. They rely purely on volume of goals and assists. However, they are often the recipients of "Big Chances," making them reliable captaincy options.</p>

                <hr />

                {/* ADVANCED SCORING */}
                <h2 id="advanced" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Advanced Scoring: Bonus Points & Saves</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Bonus Points System (BPS)</h3>
                <p>The top 3 performers in a match receive 3, 2, and 1 bonus points respectively. This is calculated via a complex algorithm that rewards:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Defensive Actions:</strong> Clearances, blocks, and recoveries (favors defenders in low-scoring games).</li>
                    <li><strong>Pass Completion:</strong> High completion % rewards playmakers.</li>
                    <li><strong>Dribbles & Key Passes:</strong> Creating chances is highly valued.</li>
                    <li><strong>Winning Goal:</strong> Scoring the winner often tips the BPS scale.</li>
                </ul>
                <p>However, players lose BPS for getting tackled, missing big chances, or conceding fouls.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Goalkeeper Saves</h3>
                <p>Goalkeepers earn 1 point for every 3 saves made. In a game where a keeper faces a barrage of shots (e.g., 10 saves) but concedes 1 goal, they could score: 2 (mins) + 3 (saves) - 0 (goals conceded) = 5 points, plus potential bonus points. This makes keepers from "bad" teams viable options—they face more shots.</p>

                <hr />

                {/* CAPTAINCY */}
                <h2 id="captaincy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Captaincy Factor</h2>
                <p>Your captain scores double points. Choosing the right captain is often the difference between a "green arrow" (rank rise) and a "red arrow" (rank drop).</p>
                <p><strong>Risk vs. Reward:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Safe Pick:</strong> The highest-owned premium player (e.g., Haaland at home to a bottom 3 team). If he fails, everyone fails.</li>
                    <li><strong>Differential Pick:</strong> A lower-owned player with a high ceiling. If they haul, you skyrocket past rivals who captained the safe pick.</li>
                </ul>

                <hr />

                {/* STRATEGY */}
                <h2 id="strategy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Winning Strategies for Long-Term Success</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Target Fixtures over Form</h3>
                <p>While form is temporary, fixtures are factual. A good player with a run of easy games ("green fixtures") is statistically more likely to return points than a great player facing the top defensive teams.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Manage Your Transfer Budget</h3>
                <p>Building "Team Value" early in the season allows you to afford a more expensive "Super Team" in the second half. Buying players before they rise in price and selling them before they drop is a mini-economy game within the game.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Don't Ignore "Effective Ownership" (EO)</h3>
                <p>If a player has 150% Effective Ownership (due to captaincy), and they score, your rank will actually <em>drop</em> if you own them but didn't captain them. Understanding EO helps you decide when to play defensively (block rank) or aggressively (chase rank).</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Understanding the exact calculation of fantasy points transforms you from a casual player to a serious contender. By using this calculator to simulate scenarios—"What if my defender loses his clean sheet but scores?"—you can make informed decisions about your starting XI and bench order.</p>
                <p>Remember, every single point counts. Leagues are often won or lost by the finest of margins.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Clarifying common FPL rules and scenarios
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">If a player gets a red card, do they lose clean sheet points?</h4>
                            <p className="text-muted-foreground">
                                If a player is sent off, they continue to be penalized for goals conceded by their team after they leave the pitch. So yes, if they kept a clean sheet until the red card, but the team concedes later, they lose the clean sheet points.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What happens if a player is substituted before 60 minutes?</h4>
                            <p className="text-muted-foreground">
                                They receive only 1 point for appearance and, crucially, they <strong>cannot</strong> be awarded clean sheet points, even if their team keeps one. This applies even if they are subbed at 59:59.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does an own goal count as a "goal conceded" for defenders?</h4>
                            <p className="text-muted-foreground">
                                Yes. If a defender scores an own goal, they get -2 points for the own goal action itself. Additionally, because the team conceded a goal, the clean sheet is wiped (0 points instead of 4), and it counts towards the "goals conceded" tally for further deductions. A disastrous outcome!
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How are assists awarded for winning penalties?</h4>
                            <p className="text-muted-foreground">
                                If a player wins a penalty (is fouled) and a teammate scores it, the player who won the penalty gets an assist (3 points). However, if they step up to take the penalty themselves and score, they get the goal points but NOT the assist points.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do saves from penalty shootouts count?</h4>
                            <p className="text-muted-foreground">
                                No. Fantasy points are only awarded for actions in regular time and extra time (if applicable in specific cup formats, though FPL usually ignores non-league games). Penalty shootouts after a draw do not count towards fantasy points.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why did my player get bonus points without scoring?</h4>
                            <p className="text-muted-foreground">
                                The Bonus Points System (BPS) rewards all-around play. A midfielder who completed 90% of passes, created 3 chances, and made 4 tackles can often outscore a goalscorer on the BPS index, especially in a low-scoring game.
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
                                    <strong className="block text-primary mb-1">FPL Managers</strong>
                                    <span className="text-sm text-muted-foreground">To calculate potential scores for players they are scouting.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Draft League Players</strong>
                                    <span className="text-sm text-muted-foreground">Draft leagues often have custom scoring; use this to benchmark standard values.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Daily Fantasy Sports (DFS)</strong>
                                    <span className="text-sm text-muted-foreground">Useful for approximate valuations on platforms like FanDuel or DraftKings (rules may vary slightly).</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-bold text-primary mb-2">The "Haul" Scenario</p>
                                    <p className="text-sm text-muted-foreground">
                                        A Defender plays 90 mins, scores a goal, keeps a clean sheet, and gets 3 bonus points.
                                    </p>
                                    <ul className="text-xs text-muted-foreground mt-2 list-disc pl-4">
                                        <li>Minutes: 2</li>
                                        <li>Goal: 6</li>
                                        <li>Clean Sheet: 4</li>
                                        <li>Bonus: 3</li>
                                        <li><strong>Total: 15 Points</strong></li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <p className="text-sm font-bold text-primary mb-2">The "Nightmare" Scenario</p>
                                    <p className="text-sm text-muted-foreground">
                                        A Defender plays 90 mins, concedes 4 goals, gets a yellow card, and scores an own goal.
                                    </p>
                                    <ul className="text-xs text-muted-foreground mt-2 list-disc pl-4">
                                        <li>Minutes: 2</li>
                                        <li>Goals Conceded: -2</li>
                                        <li>Yellow Card: -1</li>
                                        <li>Own Goal: -2</li>
                                        <li><strong>Total: -3 Points</strong></li>
                                    </ul>
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
                                The Football Fantasy Points Calculator demystifies the scoring process, allowing managers to see exactly where points come from.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Whether you are agonizing over a captaincy choice or celebrating a double-digit haul, this tool provides the mathematical breakdown of every fantasy event.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
