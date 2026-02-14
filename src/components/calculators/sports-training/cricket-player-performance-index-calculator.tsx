import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Info, Calculator, BarChart3, Shield, CheckCircle2, FunctionSquare, Activity, Zap, Target, Users } from 'lucide-react';
import CricketPlayerPerformanceIndexCalculatorInteractive from './cricket-player-performance-index-calculator-interactive';

export default function CricketPlayerPerformanceIndexCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Cricket Player Performance Index Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Use this calculator to automatically evaluate a cricket player's overall performance by combining batting, bowling, and fielding statistics into a single comprehensive index.
                </p>
            </div>

            <CricketPlayerPerformanceIndexCalculatorInteractive />

            {/* Understanding the Calculator */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">How the Performance Index Works</h2>
                    </CardTitle>
                    <CardDescription>
                        Understanding the calculation methodology
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <h4 className="font-semibold">Scoring Components:</h4>
                        <ul className="space-y-2 ml-4">
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Batting Score (0-100):</strong> Based on batting average (60%) and strike rate (40%)</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Bowling Score (0-100):</strong> Based on bowling average (50%) and economy rate (50%)</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                <span><strong>Fielding Score (0-100):</strong> Based on catches, run outs, and stumpings</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3 mt-4">
                        <h4 className="font-semibold">Role-Based Weighting:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">Batsman</p>
                                <p className="text-xs text-muted-foreground">70% Batting, 10% Bowling, 20% Fielding</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">Bowler</p>
                                <p className="text-xs text-muted-foreground">10% Batting, 70% Bowling, 20% Fielding</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">All-Rounder</p>
                                <p className="text-xs text-muted-foreground">40% Batting, 40% Bowling, 20% Fielding</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="font-medium text-sm">Wicket-Keeper</p>
                                <p className="text-xs text-muted-foreground">40% Batting, 10% Bowling, 50% Fielding</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formula Used */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FunctionSquare className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Performance Index Formula</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto space-y-2">
                        <p className="font-mono text-sm text-center">
                            Performance Index = (Batting Score × Weight) + (Bowling Score × Weight) + (Fielding Score × Weight)
                        </p>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Weights vary based on player role
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Related Cricket Calculators</h2>
                    </CardTitle>
                    <CardDescription>
                        Explore other cricket performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Batting consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Zap className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Wicket efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/bowling-economy-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Economy Rate</p>
                                            <p className="text-sm text-muted-foreground">Run containment</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/required-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Required Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Chase calculator</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/team-run-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Team Run Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring pace</p>
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
                <meta itemProp="name" content="The Complete Guide to Cricket Player Performance Index: Comprehensive Player Evaluation" />
                <meta itemProp="description" content="An expert guide to understanding the Player Performance Index in cricket, including calculation methodology, role-based weighting, performance benchmarks, and how to use it for player evaluation and team selection." />
                <meta itemProp="keywords" content="cricket performance index, player rating system, cricket statistics, all-rounder evaluation, player assessment, cricket analytics, performance metrics" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-10" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Cricket Player Performance Index</h2>
                <p className="text-lg italic text-muted-foreground">A definitive framework for quantifying and comparing player contributions across all facets of the game.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Introduction to Performance Indexing</h2>
                <p>In modern cricket, judging a player solely by one metric—like Batting Average or Bowling Average—only tells half the story. The <strong>Player Performance Index (PPI)</strong> solves this by synthesizing batting, bowling, and fielding contributions into a single, standardized score out of 100.</p>
                <p>This holistic metric allows coaches, selectors, and analysts to objectively compare a pure batsman against an all-rounder or a wicket-keeper, adjusting weightings based on the player's primary role in the team.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Methodology: How the PPI is Calculated</h2>
                <p>The index is derived from three core sub-scores, each normalized to a 100-point scale:</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
                    <div className="p-4 bg-muted border rounded-lg">
                        <h3 className="font-bold text-primary mb-2">1. Batting Score</h3>
                        <p className="text-sm">A blend of consistency and aggression.</p>
                        <ul className="list-disc ml-4 space-y-1 mt-2 text-sm">
                            <li><strong>Batting Average (60% weight):</strong> Reward for reliability.</li>
                            <li><strong>Strike Rate (40% weight):</strong> Reward for scoring speed.</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-muted border rounded-lg">
                        <h3 className="font-bold text-primary mb-2">2. Bowling Score</h3>
                        <p className="text-sm">Balancing wicket-taking with containment.</p>
                        <ul className="list-disc ml-4 space-y-1 mt-2 text-sm">
                            <li><strong>Bowling Average (50% weight):</strong> Lower is better.</li>
                            <li><strong>Economy Rate (50% weight):</strong> Lower is better.</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-muted border rounded-lg">
                        <h3 className="font-bold text-primary mb-2">3. Fielding Score</h3>
                        <p className="text-sm">Quantifying impact in the field.</p>
                        <ul className="list-disc ml-4 space-y-1 mt-2 text-sm">
                            <li><strong>Catches:</strong> 5 points each.</li>
                            <li><strong>Run Outs:</strong> 7 points each.</li>
                            <li><strong>Stumpings:</strong> 8 points each.</li>
                        </ul>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-foreground mt-8">Role-Based Weighting System</h2>
                <p>Not all players has the same job. The PPI accounts for this by applying dynamic weights based on the player's designate role:</p>
                <div className="overflow-x-auto my-4">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-primary/10">
                                <th className="p-3 border">Role</th>
                                <th className="p-3 border">Batting Weight</th>
                                <th className="p-3 border">Bowling Weight</th>
                                <th className="p-3 border">Fielding Weight</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-3 border font-medium">Batsman</td>
                                <td className="p-3 border">70%</td>
                                <td className="p-3 border">10%</td>
                                <td className="p-3 border">20%</td>
                            </tr>
                            <tr>
                                <td className="p-3 border font-medium">Bowler</td>
                                <td className="p-3 border">10%</td>
                                <td className="p-3 border">70%</td>
                                <td className="p-3 border">20%</td>
                            </tr>
                            <tr>
                                <td className="p-3 border font-medium">All-Rounder</td>
                                <td className="p-3 border">40%</td>
                                <td className="p-3 border">40%</td>
                                <td className="p-3 border">20%</td>
                            </tr>
                            <tr>
                                <td className="p-3 border font-medium">Wicket-Keeper</td>
                                <td className="p-3 border">40%</td>
                                <td className="p-3 border">10%</td>
                                <td className="p-3 border">50%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h2 className="text-2xl font-bold text-foreground mt-8">Interpreting the PPI Results</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>80+ (Outstanding):</strong> Elite international standard. Match-winners.</li>
                    <li><strong>60-79 (Very Good/Excellent):</strong> Reliable first-team players, consistent performers.</li>
                    <li><strong>40-59 (Average/Good):</strong> Solid contributors but may lack consistency or impact.</li>
                    <li><strong>30-39 (Below Average):</strong> Developing players or out of form.</li>
                    <li><strong>Below 30:</strong> Requires significant improvement in core skills.</li>
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
                        Common questions about PPI performance evaluation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why are different weights used for different roles?</h4>
                            <p className="text-muted-foreground">
                                Because expectations differ. A bowler isn't expected to score centuries, and a batsman isn't expected to take 5-wicket hauls. Weighting ensures a specialist bowler can achieve a high PPI purely through excellence in bowling, comparable to a batsman's high score.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can an all-rounder score 100 PPI?</h4>
                            <p className="text-muted-foreground">
                                Theoretically, yes, but it is extremely difficult. They would need to be elite in batting, bowling, *and* fielding simultaneously. This reflects the rarity of a true "perfect" all-round performance.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does the fielding score work?</h4>
                            <p className="text-muted-foreground">
                                Fielding points are capped at 100. It's a cumulative score based on the number of dismissals effected. Wicket-keepers naturally find it easier to score high here due to more opportunities, hence their higher fielding weighting.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does this index work for T20 and Test cricket?</h4>
                            <p className="text-muted-foreground">
                                Yes, the fundamental formulas apply to all formats. However, the benchmarks for "Good" averages and strike rates inherently shift between formats. This calculator uses a standardized model that works best for limited-overs cricket (ODI/T20).
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
                                    <strong className="block text-primary mb-1">Selecters & Coaches</strong>
                                    <span className="text-sm text-muted-foreground">To objectively compare players for team selection.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Data Analysts</strong>
                                    <span className="text-sm text-muted-foreground">To build advanced player ranking models and visualizations.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Fans</strong>
                                    <span className="text-sm text-muted-foreground">To settle debates about who the "MVP" is.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Players</strong>
                                    <span className="text-sm text-muted-foreground">To identify undervalued all-rounders.</span>
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
                                The Player Performance Index Calculator provides a standardized 0-100 score for cricket players.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By weighting batting, bowling, and fielding based on a player's role, it offers a fair and comprehensive way to evaluate total contribution to the team.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
