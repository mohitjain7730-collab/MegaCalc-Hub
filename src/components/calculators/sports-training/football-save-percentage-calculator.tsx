import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, Shield } from 'lucide-react';
import FootballSavePercentageCalculatorInteractive from './football-save-percentage-calculator-interactive';

export default function FootballSavePercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football Save Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate goalkeeper save percentage to measure shot-stopping effectiveness and defensive reliability.
                </p>
            </div>

            <FootballSavePercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key metrics required for save percentage calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Shield className="h-4 w-4" />
                                Saves Made
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of times the goalkeeper prevented the ball from entering the goal.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes caught balls, parries, and tips over the bar</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Only counts shots that were on target</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Goals Conceded
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of goals scored against the goalkeeper during the analyzed period.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Includes all goals allowed while the keeper was in net</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Excludes penalty shootouts (typically tracked separately)</span>
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
                            Save Percentage = (Saves Made / (Saves Made + Goals Conceded)) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Calculates the proportion of shots on target that a goalkeeper successfully stops. A higher percentage indicates better shot-stopping ability. Note that (Saves + Goals) equals the total shots on target faced.
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
                        Explore other football performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/football-clean-sheet-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Clean Sheet %</p>
                                            <p className="text-sm text-muted-foreground">Defensive reliability</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-expected-goals-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Expected Goals (xG)</p>
                                            <p className="text-sm text-muted-foreground">Chance quality</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Win Rate</p>
                                            <p className="text-sm text-muted-foreground">Team success</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-shot-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Shot Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Precision shooting</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-possession-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Possession %</p>
                                            <p className="text-sm text-muted-foreground">Game control</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-pass-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Pass Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Distribution quality</p>
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
                <meta itemProp="name" content="The Complete Guide to Football Save Percentage: Calculation, Benchmarks, and Goalkeeper Analysis" />
                <meta itemProp="description" content="A comprehensive guide to understanding goalkeeper save percentage in football, including how to calculate it, what constitutes elite performance, and its limitations as a standalone metric." />
                <meta itemProp="keywords" content="football save percentage, goalkeeper stats, shot stopping, clean sheet percentage, football analytics, soccer goalkeeper save rate" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Football Save Percentage: Measuring Goalkeeper Excellence</h2>
                <p className="text-lg italic text-muted-foreground">Master the primary metric for evaluating shot-stopping ability and defensive reliability between the posts.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Save Percentage in Football?</a></li>
                    <li><a href="#calculation" className="hover:underline">How to Calculate Save Percentage</a></li>
                    <li><a href="#interpretation" className="hover:underline">Interpreting the Numbers: Elite vs. Average</a></li>
                    <li><a href="#strategies" className="hover:underline">Strategies to Improve Save Percentage</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of the Metric</a></li>
                    <li><a href="#modern-metrics" className="hover:underline">Save Percentage vs. PSxG (Post-Shot Expected Goals)</a></li>
                </ul>
                <hr />

                {/* WHAT IS SAVE PERCENTAGE */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Save Percentage in Football?</h2>
                <p><strong>Save Percentage</strong> is a fundamental statistic used to evaluate a goalkeeper's performance. It represents the proportion of shots on target faced by a goalkeeper that they successfully prevent from becoming goals.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Core of Shot Stopping</h3>
                <p>While goalkeeping involves distribution, cross claiming, and defense organization, shot-stopping remains the primary job. Save percentage offers a direct quantitative measure of this skill. It answers the simple question: "Of all the shots that would have gone in, how many did the keeper stop?"</p>

                <p>A high save percentage indicates:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Superior reflexes and agility</li>
                    <li>Optimal positioning relative to the ball and goal</li>
                    <li>Strong hand-eye coordination</li>
                    <li>Effective decision-making in 1v1 situations</li>
                </ul>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate Save Percentage</h2>
                <p>The formula for save percentage is straightforward:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        Save % = (Saves Made / Shots on Target Faced) × 100
                    </p>
                </div>

                <p>Where <strong>Shots on Target Faced</strong> is the sum of Saves Made and Goals Conceded.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
                <p>Consider a goalkeeper in a season:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Saves Made:</strong> 90</li>
                    <li><strong>Goals Conceded:</strong> 30</li>
                </ul>
                <p className="mt-4">First, calculate total shots on target: 90 (saves) + 30 (goals) = 120 shots.</p>
                <p>Then apply the formula:</p>
                <div className="overflow-x-auto my-4 p-4 bg-muted border rounded-lg">
                    <p className="font-mono text-center">
                        Save % = (90 / 120) × 100 = 75%
                    </p>
                </div>

                <hr />

                {/* INTERPRETATION */}
                <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting the Numbers: Elite vs. Average</h2>
                <p>Save percentages vary by league and season, but general benchmarks in professional football include:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Performance Tiers</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>75-80%+: World Class.</strong> Typically the top 5-10% of goalkeepers in major leagues (e.g., Alisson, Courtois, Oblak in their prime).</li>
                    <li><strong>70-75%: Very Good.</strong> Solid starting goalkeepers for top-half teams.</li>
                    <li><strong>65-70%: Average.</strong> Competent professional standard, though may indicate weakness against high-quality shots.</li>
                    <li><strong>Below 65%: Below Average.</strong> Often seen in teams fighting relegation or keepers struggling with form.</li>
                </ul>

                <p className="mt-4"><em>Note:</em> A save percentage above 80% over a full season is exceptionally rare and sustainable only by the absolute best.</p>

                <hr />

                {/* STRATEGIES */}
                <h2 id="strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Save Percentage</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Positioning</h3>
                <p>Being in the right place reduces the need for spectacular diving saves. Narrowing the angle cuts down the target size for the striker.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Set Position</h3>
                <p>Being set (feet planted, balanced) <em>before</em> the shot is struck is crucial. It allows for explosive movement in any direction.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Hand Positioning</h3>
                <p>Keeping hands in a neutral, ready position allows for quicker reaction to shots, whether high, low, or wide.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Decision Making</h3>
                <p>Knowing when to come off the line to smother a shot versus staying back to react creates better saving opportunities.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of the Metric</h2>
                <p>While useful, raw save percentage can be misleading:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Shot Quality (xG)</h3>
                <p>It treats all shots equally. A 30-yard weak shot is counted the same as a point-blank save. A keeper facing many easy shots will have an inflated percentage compared to one facing difficult 1v1s.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Defensive Style</h3>
                <p>Teams that sit deep force opponents to shoot from distance (easier saves). Teams playing a high line concede fewer shots but typically higher quality (breakaways), which lowers save percentage.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Sample Size</h3>
                <p>In a single game or tournament, variance is high. A keeper might concede 1 goal from 2 shots (50%) but play well.</p>

                <hr />

                {/* MODERN METRICS */}
                <h2 id="modern-metrics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Advanced Analysis: Save % vs. PSxG</h2>
                <p>Modern analytics prefers <strong>Post-Shot Expected Goals (PSxG)</strong> minus Goals Allowed. This metric estimates how likely a specific shot (speed, placement, angle) is to go in.</p>
                <p>If a keeper Saves more than the PSxG suggests, they are "overperforming" or adding value. If they concede more than PSxG, they are underperforming. However, standard Save Percentage remains the most accessible and widely understood metric for general comparison.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about goalkeeper save percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a world-class save percentage?</h4>
                            <p className="text-muted-foreground">
                                In top European leagues, a save percentage consistently above 75-78% is considered world-class. Anything exceeding 80% over a full season is an exceptional, Ballon d'Or contender level performance (e.g., Alisson Becker in typical Liverpool seasons).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a low save percentage always mean a bad goalkeeper?</h4>
                            <p className="text-muted-foreground">
                                Not necessarily. If a team defends high up the pitch (like Manchester City or Bayern Munich), the goalkeeper faces very few shots, but they are often high-quality "big chances" (1v1s). This naturally lowers the percentage compared to a keeper facing many long-range shots.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Are penalty saves included?</h4>
                            <p className="text-muted-foreground">
                                Typically, general save percentage calculation excludes penalty kicks because the probability of scoring is so high (~76%). However, some general stats providers lump them in. It is best to look for "Non-Penalty Save Percentage" for a true reflection of open-play shot-stopping.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does 'Clean Sheet Percentage' compare?</h4>
                            <p className="text-muted-foreground">
                                Clean sheets are a team stat; save percentage is an individual stat. A keeper can have a high save percentage but no clean sheets if their defense is porous. Conversely, a keeper can keep a clean sheet with 0 saves if the defense is dominant.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the highest save percentage ever?</h4>
                            <p className="text-muted-foreground">
                                Records vary by league and era, but legendary seasons include Petr Cech (2004/05) with over 87% and Jan Oblak (2015/16) with similarly astronomical numbers. These seasons coincide with record-breaking low goals conceded.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is PSxG+/- ?</h4>
                            <p className="text-muted-foreground">
                                Post-Shot Expected Goals minus Goals Allowed. A positive number means the goalkeeper saved more goals than the average keeper would be expected to save given the difficulty of shots faced. A negative number implies they let in 'saveable' goals.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is distribution part of save percentage?</h4>
                            <p className="text-muted-foreground">
                                No. Save percentage strictly measures shot-stopping. Modern goalkeepers (like Ederson or Ter Stegen) are often valued highly for passing ability even if their save percentage is slightly lower than a pure shot-stopper.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How many games are needed for a reliable stat?</h4>
                            <p className="text-muted-foreground">
                                Analysts generally recommend a sample size of at least 15-20 games (or ~100 shots faced) to filter out short-term variance or "hot streaks."
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
                                    <strong className="block text-primary mb-1">Goalkeepers</strong>
                                    <span className="text-sm text-muted-foreground">Track personal shot-stopping performance over a season or tournament.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Scouts & Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Compare potential transfer targets against league benchmarks.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate defensive solidity and goalkeeper form objectively.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Football Managers</strong>
                                    <span className="text-sm text-muted-foreground">Identify keepers who make many saves (bonus points) vs those who just keep clean sheets.</span>
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
                        <Shield className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Football Save Percentage Calculator provides a critical insight into goalkeeping performance.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By accounting for saves made relative to shots faced, it offers a standardized measure of a goalkeeper's primary duty—keeping the ball out of the net. Use this tool alongside xG and clean sheet data for a complete defensive analysis.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
