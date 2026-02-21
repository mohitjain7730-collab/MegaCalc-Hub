import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Target, Users, BookOpen, Share2, AlertTriangle } from 'lucide-react';
import BasketballAssistToTurnoverRatioCalculatorInteractive from './basketball-assist-to-turnover-ratio-calculator-interactive';

export default function BasketballAssistToTurnoverRatioCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball Assist-to-Turnover Ratio Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate the key playmaking efficiency metric used by scouts to evaluate point guards and ball handlers.
                </p>
            </div>

            <BasketballAssistToTurnoverRatioCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Two simple stats define this powerful metric
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Share2 className="h-4 w-4" />
                                Assists (AST)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of times a player passes the ball to a teammate who scores. This represents positive offensive creation.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Must lead directly to a basket</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Only counted on made shots (or fouls in some leagues)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <AlertTriangle className="h-4 w-4" />
                                Turnovers (TO)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The number of times a player loses possession of the ball to the opposing team without taking a shot.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>Includes bad passes, lost dribbles, and offensive fouls</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span>The primary negative stat for handlers</span>
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
                        <p className="font-mono text-xl text-center">
                            Ratio = Total Assists / Total Turnovers
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        The calculation is straightforward division. A higher ratio indicates a player who creates scoring opportunities while minimizing mistakes. A ratio of 3.0 (3 assists for every 1 turnover) is considered the &quot;Gold Standard&quot; for elite point guards.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Basketball Metrics
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/basketball-player-efficiency-rating-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">PER Calculator</p>
                                            <p className="text-sm text-muted-foreground">Overall productivity</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/basketball-true-shooting-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
                        <Link href="/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Cricket consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-pass-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Pass Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Football passing stats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-expected-assists-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Expected Assists</p>
                                            <p className="text-sm text-muted-foreground">Advanced playmaking</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Speed metric</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Assist-to-Turnover Ratio in Basketball" />
                <meta itemProp="description" content="Calculate and understand Assist-to-Turnover Ratio, the definitive metric for evaluating point guard efficiency and decision-making in basketball." />
                <meta itemProp="keywords" content="assist to turnover ratio calculator, basketball stats, point guard efficiency, basketball analytics, CP3 stats, passing metrics" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Assist-to-Turnover Ratio</h2>
                <p className="text-lg italic text-muted-foreground">Master the metric that separates elite floor generals from reckless ball handlers.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Assist-to-Turnover Ratio?</a></li>
                    <li><a href="#why-it-matters" className="hover:underline">Why Scouts Obsess Over It</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What is a Good Ratio?</a></li>
                    <li><a href="#historical-greats" className="hover:underline">Historical Leaders (The CP3 Standard)</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations: The &quot;Safe Passer&quot; Trap</a></li>
                    <li><a href="#how-to-improve" className="hover:underline">Strategies to Improve Your Ratio</a></li>
                </ul>
                <hr />

                {/* WHAT IS IT */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Assist-to-Turnover Ratio?</h2>
                <p><strong>Assist-to-Turnover Ratio (AST/TO)</strong> is a basketball statistic used to evaluate the ball-handling and decision-making efficiency of a player, typically a point guard.</p>
                <p>It answers a simple but critical question: <em>&quot;For every mistake this player makes with the ball, how many scoring opportunities do they create?&quot;</em></p>
                <p>The calculation is simple: Divide total assists by total turnovers. A higher number is always better.</p>

                <hr />

                {/* WHY IT MATTERS */}
                <h2 id="why-it-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Scouts Obsess Over It</h2>
                <p>In the modern game, possessions are valuable currency. A turnover is the worst possible outcome of a possession—it results in zero points and often leads to an easy transition bucket for the opponent.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Cost of a Turnover</h3>
                <p>A turnover is mathematically more damaging than a missed shot. A missed shot can be rebounded offensively or allows the defense to set up. A turnover is an immediate loss of the ball, usually with the defense out of position.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Evaluating Decision Making</h3>
                <p>Raw assist numbers can be misleading. A player who gets 10 assists but also commits 8 turnovers is not an efficient playmaker (Ratio: 1.25). They are giving back almost as much value as they create. Conversely, a player with 6 assists and 1 turnover (Ratio: 6.0) is an incredibly safe and reliable caretaker of the offense.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What is a Good Ratio?</h2>
                <p>The expectations for AST/TO ratio vary by position, but for primary ball handlers (Point Guards), the tiers are well-established:</p>

                <div className="overflow-x-auto my-6">
                    <table className="min-w-full border rounded-lg bg-card">
                        <thead>
                            <tr className="bg-muted">
                                <th className="px-4 py-2 text-left font-bold">Ratio</th>
                                <th className="px-4 py-2 text-left font-bold">grade</th>
                                <th className="px-4 py-2 text-left">Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-primary">4.0+</td>
                                <td className="px-4 py-2 font-bold">God Tier</td>
                                <td className="px-4 py-2">Historically elite efficiency. Extremely rare for high-usage players.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-green-600">3.0 - 4.0</td>
                                <td className="px-4 py-2 font-bold">Excellent</td>
                                <td className="px-4 py-2">The &quot;Gold Standard&quot; for elite NBA point guards.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-blue-600">2.5 - 3.0</td>
                                <td className="px-4 py-2 font-bold">Very Good</td>
                                <td className="px-4 py-2">Typical ratio for All-Star caliber playmakers.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-gray-600">2.0 - 2.5</td>
                                <td className="px-4 py-2 font-bold">Solid</td>
                                <td className="px-4 py-2">Acceptable for a starting point guard.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-orange-600">1.0 - 2.0</td>
                                <td className="px-4 py-2 font-bold">Average/Poor</td>
                                <td className="px-4 py-2">More acceptable for shooting guards or forwards, but poor for PGs.</td>
                            </tr>
                            <tr className="border-t">
                                <td className="px-4 py-2 font-bold text-red-600">&#60; 1.0</td>
                                <td className="px-4 py-2 font-bold">Negative</td>
                                <td className="px-4 py-2">More turnovers than assists. Detrimental to the team offense.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <hr />

                {/* HISTORICAL GREATS */}
                <h2 id="historical-greats" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Historical Leaders (The CP3 Standard)</h2>
                <p>When talking about AST/TO ratio, one name stands above all others: <strong>Chris Paul (CP3)</strong>.</p>
                <p>Chris Paul is famous for maintaining a career ratio around 4.0, which is virtually unheard of for a player with his usage rate. His ability to manipulate defenses without losing the ball is why he is considered one of the greatest &quot;Point Gods&quot; in history.</p>

                <p>Other notables:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Muggsy Bogues:</strong> The 5&apos;3&quot; legend holds the NBA career record with an astounding 4.69 ratio.</li>
                    <li><strong>Tyrese Haliburton:</strong> A modern example who frequently posts seasons above 4.0.</li>
                    <li><strong>John Stockton:</strong> The all-time assist leader maintained a very healthy ratio despite incredible volume.</li>
                </ul>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations: The &quot;Safe Passer&quot; Trap</h2>
                <p>While a high ratio is generally good, context matters. A ratio can be artificially inflated by:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Being too Passive</h3>
                <p>A player who only makes safe, swing passes around the perimeter might have 4 assists and 0 turnovers. Their ratio is perfect, but are they actually creating offense? Probably not. Elite playmakers take risks to create easy shots for teammates.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Role Differences</h3>
                <p>A primary scorer like James Harden or Russell Westbrook will have a lower ratio (often around 2.0) because they are asked to do <em>everything</em>—drive, shoot, and pass. The difficulty of their burden naturally leads to more turnovers.</p>

                <hr />

                {/* HOW TO IMPROVE */}
                <h2 id="how-to-improve" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Your Ratio</h2>
                <p>If you are a guard looking to improve this metric:</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Simplify Your Handle:</strong> Most turnovers happen from over-dribbling. Make your move and go.</li>
                    <li><strong>The &quot;Simple&quot; Pass:</strong> Home run passes (full court heaves, tight windows) look cool but often lead to turnovers. Hitting the open man simply is often better.</li>
                    <li><strong>Jump Stops:</strong> Avoiding leaving your feet before passing drastically reduces "bail out" turnovers.</li>
                    <li><strong>Study Angles:</strong> Understanding passing lanes reduces deflections and steals.</li>
                </ul>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Q&A for point guards and coaches
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does this metric apply to Centers?</h4>
                            <p className="text-muted-foreground">
                                Generally no, although passing big men like Nikola Jokic are judged by it. For most centers, who catch and finish, a 1:1 ratio is considered decent. Jokic regularly posts ratios above 2.5, which is guard-level elite.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a 2-to-1 ratio good for High School?</h4>
                            <p className="text-muted-foreground">
                                Yes! At the high school level, where play is more chaotic, a 2:1 ratio indicates a very solid, trustworthy point guard. 3:1 is exceptional at any level.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What if I have 0 Turnovers?</h4>
                            <p className="text-muted-foreground">
                                Mathematically, the ratio is undefined (division by zero). In practice, this is considered "perfect." If you had 5 assists and 0 turnovers, that's better than any finite ratio.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do offensive fouls count as turnovers?</h4>
                            <p className="text-muted-foreground">
                                Yes. An illegal screen or a charge is recorded as a turnover. This hurts the ratio, which is why disciplined players often have better ratios—they avoid silly fouls.
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
                                    <strong className="block text-primary mb-1">Point Guards</strong>
                                    <span className="text-sm text-muted-foreground">The primary metric for your job security. Track this daily.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Quickly filter out guards who are too turnover-prone.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Set team goals (e.g., &quot;Team Ratio of 2.0&quot;) to enforce ball movement.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Managers</strong>
                                    <span className="text-sm text-muted-foreground">Use it as a tiebreaker for players with similar assist totals.</span>
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
                        <BookOpen className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Basketball Assist-to-Turnover Ratio Calculator is the essential tool for measuring playmaker efficiency.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By comparing creative output (assists) against wasted possessions (turnovers), it provides a clear picture of a player's reliability and basketball IQ, setting the standard for floor generals at every level of the game.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
