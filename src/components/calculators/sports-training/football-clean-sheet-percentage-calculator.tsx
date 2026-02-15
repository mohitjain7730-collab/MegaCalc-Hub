import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Shield, Activity, Target, Users } from 'lucide-react';
import FootballCleanSheetPercentageCalculatorInteractive from './football-clean-sheet-percentage-calculator-interactive';

export default function FootballCleanSheetPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football Clean Sheet Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate the defensive efficiency of a goalkeeper or team by measuring the frequency of shutouts.
                </p>
            </div>

            <FootballCleanSheetPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Essential data points for defensive analysis
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Shield className="h-4 w-4" />
                                Clean Sheets Kept
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of full matches where the team conceded zero goals.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Must play the full match (for goalkeepers)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes 0-0 draws</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Total Matches Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The cumulative number of games played by the goalkeeper or defensive unit.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Only competitive fixtures count for official stats</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Substituted appearances may affect individual stats</span>
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
                            Clean Sheet % = (Clean Sheets / Matches Played) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This ratio quantifies defensive solidity. It answers the question: "How often does this team prevent the opponent from scoring entirely?"
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
                        Deep dive into defensive and goalkeeping metrics
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
                                            <p className="text-sm text-muted-foreground">Overall success</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-expected-goals-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">xG Conceded</p>
                                            <p className="text-sm text-muted-foreground">Defensive quality</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-possession-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Possession %</p>
                                            <p className="text-sm text-muted-foreground">Control metric</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-pass-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Pass Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Distribution safety</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-goal-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Conversion Rate</p>
                                            <p className="text-sm text-muted-foreground">Attacking efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-expected-assists-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Expected Assists</p>
                                            <p className="text-sm text-muted-foreground">Chance creation</p>
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
                <meta itemProp="name" content="The Complete Guide to Clean Sheet Percentage: Goalkeeping & Defensive Analysis" />
                <meta itemProp="description" content="Understand the value of clean sheets in modern football. Learn how to calculate clean sheet percentage, interpret defensive benchmarks, and analyze goalkeeper performance." />
                <meta itemProp="keywords" content="clean sheet percentage, goalkeeper stats, football defense metrics, shutouts, premier league golden glove, fantasy football clean sheet" />
                <meta itemProp="author" content="MegaCalc Football Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Mastering Clean Sheet Percentage: The Art of Evaluation</h2>
                <p className="text-lg italic text-muted-foreground">"Attack wins you games, defense wins you titles." – Sir Alex Ferguson. The clean sheet is the ultimate currency of a defensive unit.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is a Clean Sheet?</a></li>
                    <li><a href="#calculation" className="hover:underline">How to Calculate the Percentage</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Elite Benchmarks (Golden Glove Standards)</a></li>
                    <li><a href="#context" className="hover:underline">Context: Goalkeeper vs. Defense</a></li>
                    <li><a href="#fantasy" className="hover:underline">Clean Sheets in Fantasy Football (FPL)</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies for Defensive Solidity</a></li>
                </ul>
                <hr />

                {/* WHAT IS CLEAN SHEET */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is a Clean Sheet?</h2>
                <p>A <strong>Clean Sheet</strong> (or "shutout" in American sports) occurs when a team prevents the opponent from scoring any goals during a match.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Rules of the Clean Sheet</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Team Stat:</strong> The entire team gets a clean sheet if the score is 1-0, 2-0, 0-0, etc.</li>
                    <li><strong>Goalkeeper Stat:</strong> For a goalkeeper to be credited, they must play a significant portion of the match (usually at least 60 minutes in Fantasy terms, or the full match for official records if no substitution occurred).</li>
                    <li><strong>Substitutions:</strong> If a goalkeeper is subbed off at 60 minutes with the score 0-0, and the replacement concedes, the starting keeper <em>usually</em> keeps their clean sheet status in Fantasy, but the "Team" loses the clean sheet.</li>
                </ul>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate the Percentage</h2>
                <p>The metric is simple but telling:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Clean Sheet % = (Clean Sheets / Matches Played) × 100
                    </p>
                </div>

                <p>If a goalkeeper plays 38 league matches and keeps 15 clean sheets:</p>
                <p className="font-mono bg-muted p-2 rounded mt-2">Percentage = (15 / 38) × 100 = 39.47%</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Elite Benchmarks: What is "World Class"?</h2>
                <p>In modern football, where attacking play is favored by rule changes and VAR, keeping clean sheets is harder than ever. Based on Premier League and Champions League data:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Legendary (&gt;50%)</h3>
                <p>A goalkeeper or defense that concedes in fewer than half their games is historic. Petr Cech (Chelsea 2004/05) kept 24 clean sheets in 38 games (63%), a record that defines defensive perfection.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Elite (40% - 49%)</h3>
                <p>This is the standard for winning the "Golden Glove" award. Keepers like Alisson (Liverpool) and Ederson (Man City) frequently operate in this range during title-winning seasons.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Good (30% - 39%)</h3>
                <p>A solid top-half team. Expect 11-14 clean sheets in a 38-game season.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Average (20% - 29%)</h3>
                <p>The mid-table standard. Teams here rely on outscoring opponents (winning 4-3) rather than shutting them out.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Relegation Form (&lt;20%)</h3>
                <p>Conceding in more than 80% of games makes survival extremely difficult unless the attack is prolific.</p>

                <hr />

                {/* CONTEXT */}
                <h2 id="context" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Context: Goalkeeper vs. Defense</h2>
                <p>A high clean sheet percentage doesn't always equal a great goalkeeper, and a low one doesn't always equal a bad one.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The "Man City" Scenario (Low Shot Volume)</h3>
                <p>A keeper might keep a clean sheet without making a save because the defense (and possession play) prevented any shots. Here, the clean sheet credit belongs largely to the system.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The "Busy Keeper" Scenario (High Shot Volume)</h3>
                <p>A keeper might make 10 saves but concede 1 goal in the 90th minute. Their clean sheet % is 0 for that game, despite a heroic performance. This is why <strong>Save Percentage</strong> and <strong>PSxG (Post-Shot Expected Goals)</strong> should always accompany clean sheet analysis.</p>

                <hr />

                {/* FANTASY FOOTBALL */}
                <h2 id="fantasy" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Clean Sheets in Fantasy Football (FPL)</h2>
                <p>For millions of FPL managers, the clean sheet is the holy grail. It is worth:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>4 Points</strong> for Goalkeepers and Defenders</li>
                    <li><strong>1 Point</strong> for Midfielders</li>
                    <li><strong>0 Points</strong> for Forwards</li>
                </ul>
                <p className="mt-4">Targeting defenders from teams with a clean sheet probability &gt;50% (often playing at home against bottom-tier teams) is a core strategy for fantasy success.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies for Defensive Solidity</h2>
                <p>How do managers improve this metric?</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. The Low Block</h3>
                <p>Sitting deep compacts space near the goal, forcing opponents to shoot from distance. Effective for underdogs.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Possession as Defense</h3>
                <p>"If they don't have the ball, they can't score." Pep Guardiola's philosophy relies on keeping the ball to prevent defensive situations from ever occurring.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Tactical Fouling</h3>
                <p>Stopping counter-attacks before they start keeps the defensive shape organized, preserving the shutout.</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>The Clean Sheet Percentage Calculator is a vital tool for assessing the backbone of any football team. While goals grab headlines, clean sheets win trophies. By monitoring this metric over a season, analysts can predict league positions with surprising accuracy. A team that stops conceding has laid the foundation for becoming a champion.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about clean sheets and goalkeeping stats
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a 0-0 draw count as a clean sheet?</h4>
                            <p className="text-muted-foreground">
                                Yes, absolutely. A 0-0 draw is a clean sheet for both teams and both goalkeepers. It reflects a successful defensive performance, even if the attack failed to score.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What happens if a goalkeeper is substituted?</h4>
                            <p className="text-muted-foreground">
                                If a goalkeeper plays the full match, they get the clean sheet. If they are subbed off (e.g., due to injury) while the score is 0-0, they typically keep the clean sheet record for their personal stats, provided they played a minimum duration (often 60 mins in fantasy leagues). If the substitute concedes, the <em>team</em> loses the clean sheet.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the most clean sheets in Premier League history?</h4>
                            <p className="text-muted-foreground">
                                Petr Cech holds the record with 202 clean sheets. He is followed by David James and Mark Schwarzer. Cech also holds the record for most clean sheets in a single season (24).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do penalty shootouts count?</h4>
                            <p className="text-muted-foreground">
                                No. Goals scored or conceded in penalty shootouts are excluded from standard match statistics. If a game ends 0-0 after extra time, it counts as a clean sheet, regardless of the shootout outcome.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is Clean Sheet Percentage better than Save Percentage?</h4>
                            <p className="text-muted-foreground">
                                They measure different things. Clean Sheet % measures the <em>team's</em> ability to prevent goals. Save % measures the <em>goalkeeper's</em> individual ability to stop shots. A great keeper in a bad team might have a high Save % but low Clean Sheet %.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do friendly matches count?</h4>
                            <p className="text-muted-foreground">
                                Official career statistics usually exclude friendlies. However, managers often track pre-season clean sheets to assess defensive readiness before the campaign starts.
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
                                    <strong className="block text-primary mb-1">Defense Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Track defensive unit performance trends month-over-month.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Goalkeepers</strong>
                                    <span className="text-sm text-muted-foreground">Monitor personal shut-out ratios vs league averages.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Managers</strong>
                                    <span className="text-sm text-muted-foreground">Calculate clean sheet probabilities for defender selection.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Identify defensive talent in lower leagues with high shut-out rates.</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Application</h3>
                            <p className="text-muted-foreground">
                                Consider a team evaluating two goalkeepers. Keeper A has a 40% clean sheet rate but plays for a dominant team. Keeper B has a 30% rate but plays for a relegation fighter. Contextualizing these percentages helps scouts decide if Keeper B might actually be the superior shot-stopper.
                            </p>
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
                                The Football Clean Sheet Percentage Calculator is the essential robust tool for measuring defensive impenetrability.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                It provides the definitive statistic for goalkeepers and defensive units, separating elite backlines from the rest. In a low-scoring sport like football, the ability to keep the "zero" is the statistically most significant factor in long-term league success.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
