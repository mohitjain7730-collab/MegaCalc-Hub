import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Target, Zap, Activity, Percent } from 'lucide-react';
import TennisWinRatioCalculatorInteractive from './tennis-win-ratio-calculator-interactive';

export default function TennisWinRatioCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Tennis Win Ratio Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your match winning percentage to track your season progress and evaluate performance consistency.
                </p>
            </div>

            <TennisWinRatioCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        The basic metrics of your win/loss record
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Matches Won
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of matches where you were the victor.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes wins by opponent retirement</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes walkovers (in official stats)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Target className="h-4 w-4" />
                                Total Matches Played
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The cumulative sum of all matches participated in (Wins + Losses).
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Does not include matches you withdrew from before starting</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Ensure this equals Wins + Losses</span>
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
                            Win Ratio = (Matches Won / Total Matches Played) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This simple percentage is the gold standard for tracking dominance. While points and ranking tell part of the story, your raw ability to close out matches is best represented by this number.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Calculators
                    </CardTitle>
                    <CardDescription>
                        Performance metrics for tennis and other sports
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/tennis-first-serve-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">First Serve %</p>
                                            <p className="text-sm text-muted-foreground">Consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/tennis-break-point-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Break Point Rate</p>
                                            <p className="text-sm text-muted-foreground">Clutch factor</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Football Win Rate</p>
                                            <p className="text-sm text-muted-foreground">Team success</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Cricket stats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/basketball-true-shooting-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">True Shooting %</p>
                                            <p className="text-sm text-muted-foreground">Scoring efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/cricket-win-probability-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Percent className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Win Probability</p>
                                            <p className="text-sm text-muted-foreground">Cricket prediction</p>
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
                <meta itemProp="name" content="The Complete Guide to Tennis Win Ratio: Analysis, Benchmarks, and Improvement" />
                <meta itemProp="description" content="Calculate your tennis win percentage and understand what it means for your development. Learn how pro win rates compare to club level statistics." />
                <meta itemProp="keywords" content="tennis win percentage, win loss record, tennis player stats, ATP win rates, tennis coaching, match analysis" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Understanding Your Tennis Win Ratio: Beyond the W and L</h2>
                <p className="text-lg italic text-muted-foreground">Your win/loss record is the most honest reflection of your current competitive level. But interpreting that number correctly is key to long-term development.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Win Ratio?</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: The "Big Three" vs. The Rest</a></li>
                    <li><a href="#club-level" className="hover:underline">Club Level Expectations</a></li>
                    <li><a href="#analysis" className="hover:underline">Analyzing Your Wins: Quality vs. Quantity</a></li>
                    <li><a href="#psychology" className="hover:underline">The Psychology of Winning and Losing</a></li>
                    <li><a href="#improvement" className="hover:underline">Turning Close Losses into Wins</a></li>
                </ul>
                <hr />

                {/* WHAT IS WIN RATIO */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Win Ratio?</h2>
                <p><strong>Win Ratio</strong> (or Winning Percentage) is the percentage of total matches played that a player has won. It is calculated as:</p>
                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        (Matches Won / Total Matches Played) * 100
                    </p>
                </div>
                <p>Unlike raw win totals (e.g., "50 wins"), the ratio accounts for the volume of play, making it a better indicator of consistency and dominance.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: The "Big Three" vs. The Rest</h2>
                <p>To understand your own stats, it helps to look at the ceiling of human performance in tennis.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The 80% Club</h3>
                <p>In the history of the ATP Tour (Open Era), only a handful of players have maintained a career win rate above 80%:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Novak Djokovic:</strong> ~83%</li>
                    <li><strong>Rafael Nadal:</strong> ~82%</li>
                    <li><strong>Bjorn Borg:</strong> ~82%</li>
                    <li><strong>Roger Federer:</strong> ~82%</li>
                </ul>
                <p>This level of dominance is statistically effectively impossible to sustain for normal players. It implies winning 4 out of every 5 matches played against the best in the world.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Top 100 Standard</h3>
                <p>For a typical player ranked #50 in the world, the win rate is often around <strong>50%</strong>. They lose as often as they win because the competition is so fierce. This is a crucial lesson: <em>You can be one of the best players on Earth and still lose half your matches.</em></p>

                <hr />

                {/* CLUB LEVEL */}
                <h2 id="club-level" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Club Level Expectations</h2>
                <p>At the recreational (NTRP/UTR) level, win rates tell a different story about your development path.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Win Rate &gt; 80%? Move Up.</h3>
                <p>If you are winning more than 80% of your matches in your current league or club ladder, statistics suggest you are "sandbagging" (playing below your level). While winning is fun, you are likely not improving because you aren't being challenged. You need to move up a division.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Win Rate &lt; 30%? Don&apos;t Panic.</h3>
                <p>If you are winning fewer than 1 in 3 matches, you are likely "playing up"—facing opponents who are technically superior or more experienced. This is the "Learning Zone." While the record looks bad, this is often where the most improvement happens, provided you don't get discouraged and quit.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Sweet Spot: 50-60%</h3>
                <p>A win rate between 50% and 60% is ideal for development. It means:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>You are winning enough to build confidence.</li>
                    <li>You are losing enough to expose your weaknesses.</li>
                    <li>You are playing opponents of similar skill level, leading to competitive, pressure-filled matches.</li>
                </ul>

                <hr />

                {/* ANALYSIS */}
                <h2 id="analysis" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Analyzing Your Wins: Quality vs. Quantity</h2>
                <p>Not all wins are equal. When calculating your ratio, consider segmenting your data:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">By Surface</h3>
                <p>Do you have a 70% win rate on clay but 30% on hard courts? This indicates a game built on movement and consistency rather than power. It highlights exactly what you need to work on (taking the ball early, serve power) to balance your game.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">By Match Type</h3>
                <p>Many players have a high win rate in practice matches but a low rate in tournaments. This gap is the "Mental Performance Gap." It suggests your strokes are fine, but your ability to handle pressure (tightness, nerves) is the limiting factor.</p>

                <hr />

                {/* IMPROVEMENT */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Turning Close Losses into Wins</h2>
                <p>Most tennis matches at the club level are decided by a handful of points. Improving your win ratio from 45% to 55% often doesn't require better strokes—it requires better management.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Reduce Unforced Errors</h3>
                <p>At the amateur level, whoever makes fewer mistakes wins. It's that simple. Stop aiming for the lines. Aim big, play cross-court, and let your opponent miss first.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Play High Percentage Tennis</h3>
                <p>Stop trying to hit winners from behind the baseline. A legendary study of tennis stats shows that in amateur tennis, "Winners" account for a tiny fraction of points won. "Forced Errors" and "Unforced Errors" make up the vast majority.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Physical Fitness</h3>
                <p>Many losses in the third set are due to fatigue. If you improve your cardio, you win more "long matches" by default simply because your legs last longer than your opponent's.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Q&A on Tennis Records
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a walkover count as a win?</h4>
                            <p className="text-muted-foreground">
                                In official ATP/WTA stats, a walkover (opponent withdraws before match) does <strong>not</strong> count as a win or a match played. However, a retirement (opponent stops during the match) <strong>does</strong> count as a win. For your personal tracking, count retirements, but maybe exclude walkovers as you didn't "play."
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a "good" win ratio for a junior?</h4>
                            <p className="text-muted-foreground">
                                For juniors, development &gt; winning. A ratio of 50-60% is healthy. If a junior wins 90%, they need to play up an age group. If they win 10%, they might get discouraged—find them some easier matches to rebuild confidence.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does doubles win ratio compare to singles?</h4>
                            <p className="text-muted-foreground">
                                They are often very different. Some players are great singles players (ratio 70%) but poor doubles players (ratio 40%) because they lack net skills or teamwork. Tracking them separately is highly recommended.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should I count practice matches?</h4>
                            <p className="text-muted-foreground">
                                Generally, no. Practice matches are for working on new shots (like a kick serve) where you <em>expect</em> to make mistakes. Counting them penalizes you for trying to improve. Only count matches where the primary goal was to win.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why is my win ratio dropping after I got promoted?</h4>
                            <p className="text-muted-foreground">
                                This is natural. When you move from NTRP 3.5 to 4.0, you go from being "the big fish" to "the small fish." Your ratio will dip (e.g., from 80% to 30%). Your goal is to slowly climb back to 50% as you adjust to the new pace.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the "Golden Set"?</h4>
                            <p className="text-muted-foreground">
                                A "Golden Set" is winning a set without losing a single point (24 points in a row). It is statistically incredibly rare. In the Open Era, Yaroslave Shvedova is famous for achieving this at Wimbledon 2012. It represents a 100% point win ratio for that set.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Usage Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Usage of this Calculator</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-3">Who Should Use This?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">League Players</strong>
                                    <span className="text-sm text-muted-foreground">Track your season performance to see if you qualify for playoffs.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Monitor students' competitive results to decide on tournament levels.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Tournament Directors</strong>
                                    <span className="text-sm text-muted-foreground">Seed players correctly based on their recent win ratios.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">College scouts look for consistent win ratios against quality opponents.</span>
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
                                The Tennis Win Ratio Calculator provides a clear, objective view of your competitive standing.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By understanding your win percentage in context, you can make smarter decisions about training, tournament selection, and competitive goals.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
