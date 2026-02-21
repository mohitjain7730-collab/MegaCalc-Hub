import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Shield, Activity } from 'lucide-react';
import TennisSetWinPercentageCalculatorInteractive from './tennis-set-win-percentage-calculator-interactive';

export default function TennisSetWinPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Tennis Set Win Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your set win rate to measure dominance, consistency, and clutch performance in matches.
                </p>
            </div>

            <TennisSetWinPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Basic metrics required for calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Trophy className="h-4 w-4" />
                                Sets Won
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of sets you have won in a given period (season, tournament, or career).
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Includes all attended sets (6-2, 7-5, 7-6)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Do not include retired or walkover "virtual" sets unless played</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <AlertCircle className="h-4 w-4" />
                                Sets Lost
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of sets you have lost.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Includes sets lost in tiebreaks</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Count deciding match tiebreaks (super tiebreaks) as 1 set</span>
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
                            Set Win % = (Sets Won / (Sets Won + Sets Lost)) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        A straightforward ratio that expresses the percentage of sets won out of total sets played. This is often a better indicator of dominance than match win percentage, as it captures the closeness of matches.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Tennis Calculators
                    </CardTitle>
                    <CardDescription>
                        Explore other performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/tennis-elo-rating-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Elo Rating</p>
                                            <p className="text-sm text-muted-foreground">Skill level tracking</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/tennis-win-ratio-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-yellow-600" />
                                        <div>
                                            <p className="font-medium">Match Win Ratio</p>
                                            <p className="text-sm text-muted-foreground">Overall success rate</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/tennis-hold-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Hold Percentage</p>
                                            <p className="text-sm text-muted-foreground">Service dominance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/tennis-break-point-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Break Point Conversion</p>
                                            <p className="text-sm text-muted-foreground">Clutch returning</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/tennis-return-points-won-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Return Points Won</p>
                                            <p className="text-sm text-muted-foreground">Return game efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/tennis-aces-per-match-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Aces Per Match</p>
                                            <p className="text-sm text-muted-foreground">Service power</p>
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
                <meta itemProp="name" content="Winning the Sets that Matter: The Ultimate Guide to Tennis Set Win Percentage" />
                <meta itemProp="description" content="Detailed guide on Tennis Set Win Percentage. Learn why sets matter more than games, what benchmarks define elite performance, and how to improve your set-closing ability." />
                <meta itemProp="keywords" content="tennis set win percentage, tennis statistics, tennis analysis, tennis set closing, improve tennis game, match statistics" />
                <meta itemProp="author" content="MegaCalc Sports Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-19" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">Winning the Sets that Matter: The Science of Set Win Percentage</h2>
                <p className="text-lg italic text-muted-foreground">Beyond the final match score, your Set Win Percentage reveals the true story of your dominance, resilience, and efficiency on the court.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Set Win Percentage?</a></li>
                    <li><a href="#importance" className="hover:underline">Why Sets Matter More Than Games</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks for Success</a></li>
                    <li><a href="#first-set" className="hover:underline">The "First Set" Correlation</a></li>
                    <li><a href="#improving" className="hover:underline">Improving Your Set Closing Ability</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of the Metric</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Set Win Percentage?</h2>
                <p><strong>Set Win Percentage</strong> is a statistical metric that calculates the proportion of sets a player wins out of all sets played. Unlike Match Win Percentage, which is binary (Win/Loss), Set Win Percentage offers a more granular view of performance.</p>

                <p>For example, if you win a match 6-4, 4-6, 7-5, your Match Win % is 100% (1/1), but your Set Win % is only 66.6% (2/3). This reveals that while you won, the contest was close and your dominance was not absolute.</p>

                <hr />

                {/* IMPORTANCE */}
                <h2 id="importance" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why Sets Matter More Than Games</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Structure of Tennis Scoring</h3>
                <p>Tennis is unique because it uses a hierarchical scoring system: Points → Games → Sets → Match. You can win more points than your opponent and still lose the match. You can even win more games (e.g., losing 0-6, 7-6, 7-6 gives you 14 games vs 18 games) and still win.</p>

                <p><strong>Sets are the critical currency.</strong> You don't need to win every game; you just need to win the <em>sets</em>. Set Win Percentage correlates more strongly with Match Win Percentage than Total Points Won does.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Dominance vs. Clutch</h3>
                <p>A high Set Win Percentage (e.g., &gt;80%) indicates dominance—you are putting opponents away quickly (likely straight sets). A moderate Set Win Percentage (e.g., 55%) with a high Match Win Percentage indicates <strong>clutch performance</strong>—you are winning the tight matches and deciding sets.</p>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks for Success</h2>
                <p>What constitutes a "good" number varies by level, but general benchmarks apply:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Professional Level (ATP/WTA)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>75%+:</strong> World #1 Contender. (e.g., Djokovic/Federer/Nadal/Serena at their peaks often exceeded 75-80%).</li>
                    <li><strong>60-70%:</strong> Top 10 Player. consistently winning matches, often in straight sets.</li>
                    <li><strong>50-55%:</strong> Top 50-100 Player. Winning about half their sets, often involved in 3-setters.</li>
                    <li><strong>Below 50%:</strong> Struggling to maintain tour level status.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Recreational / Club Level</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>70%+:</strong> "The Ringer". You are likely playing below your level. Time to move up a division.</li>
                    <li><strong>50-60%:</strong> Competitive. You are in the right division, winning your share of matches.</li>
                    <li><strong>Below 40%:</strong> Learning Phase. You are gaining experience but struggling to close out frames.</li>
                </ul>

                <hr />

                {/* FIRST SET */}
                <h2 id="first-set" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "First Set" Correlation</h2>
                <p>The first set is the most important set in tennis. Statistical analysis of thousands of professional matches shows:</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Winner of 1st Set:</strong> Wins the match ~75-80% of the time (ATP) and ~70-75% (WTA).</li>
                    <li><strong>Psychological Edge:</strong> Winning the first set forces the opponent to win <em>two</em> consecutive sets to take the match (in best of 3).</li>
                </ul>

                <p>If your overall Set Win % is 50%, but your First Set Win % is 20%, it suggests you are a "slow starter" and constantly fighting from behind.</p>

                <hr />

                {/* IMPROVING */}
                <h2 id="improving" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Improving Your Set Closing Ability</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Manage Energy in the Set</h3>
                <p>Recognize "swing games." The 7th game (at 3-3) and the game serving to stay in the set (4-5 or 5-6) are critical. Increase your focus and decrease risk-taking during these moments.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Front-Run Effectively</h3>
                <p>When up a break, your goal is to hold. Do not go for spectacular winners. Make the opponent earn every point to break you back. High set win percentages are built on solid consolidation of breaks.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Tiebreak Tactics</h3>
                <p>Many sets end in tiebreaks. Improving your tiebreak win rate directly boosts your set win percentage. Strategy: Get the first serve in, play high-percentage shots, and let the opponent make the error under pressure.</p>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of the Metric</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Context Matters</h3>
                <p>Winning a set 6-0 counts the same in this percentage as winning one 7-6(15-13). It does not measure <em>how</em> easily you won, only <em>that</em> you won.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Dead Rubbers</h3>
                <p>In tournaments with group stages (like ATP Finals) or league play, players might lose motivation after losing the first set if the match result doesn't impact their qualification. This can skew stats.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Set Win Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does a tiebreak count as a set?</h4>
                            <p className="text-muted-foreground">
                                Yes. If a set reaches 6-6 and goes to a tiebreak, the winner of the tiebreak wins the set 7-6. This counts as 1 set won and 1 set lost (for the opponent).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does a Super Tiebreak (Match Tiebreak) count?</h4>
                            <p className="text-muted-foreground">
                                In many doubles formats and some singles leagues, the third set is replaced by a 10-point "Super Tiebreak". For statistical purposes, this usually counts as 1 set won/lost, just like a full set.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is it better to have high Game Win % or high Set Win %?</h4>
                            <p className="text-muted-foreground">
                                Set Win % is generally more important for winning matches. You can win 60% of games but lose the match (e.g. lose 0-6, 7-6, 7-6 despite winning fewer games overall). Winning the critical points that convert into sets is the key skill.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What if I retire from a match?</h4>
                            <p className="text-muted-foreground">
                                Usually, sets completed before retirement count. The set in progress is often uncounted or counted as a loss depending on the specific league rules. For personal tracking, count completed sets only.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How many matches do I need for accurate data?</h4>
                            <p className="text-muted-foreground">
                                A sample size of at least 10 matches (approx. 20-25 sets) is recommended to get a baseline. Over a full season (50+ sets), the percentage becomes a very reliable indicator of your level.
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
                                    <strong className="block text-primary mb-1">Junior Players</strong>
                                    <span className="text-sm text-muted-foreground">Track consistency across tournaments to catch "slow starts" or "choking" trends.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">High School Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Determine roster spots by seeing who actually closes out sets in practice matches.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">League Captains</strong>
                                    <span className="text-sm text-muted-foreground">Pair doubles partners by combining a "high set winner" with a steady player.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fans</strong>
                                    <span className="text-sm text-muted-foreground">Analyze pro player stats to see who is truly dominant versus just winning.</span>
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
                                The Tennis Set Win Percentage Calculator offers a deep dive into match efficiency.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By isolating performance at the set level, players can identify psychological habits (like starting slow or failing to close) that are often hidden in simple Win/Loss records.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
