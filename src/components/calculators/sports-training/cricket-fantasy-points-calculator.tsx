import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Info, Calculator, BarChart3, CheckCircle2, Shield, Activity, Star, Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CricketFantasyPointsCalculatorInteractive from './cricket-fantasy-points-calculator-interactive';

export default function CricketFantasyPointsCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Cricket Fantasy Points Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Use this calculator to automatically calculate standard fantasy cricket points based on batting, bowling, and fielding performance, including captain and vice-captain multipliers.
                </p>
            </div>

            <CricketFantasyPointsCalculatorInteractive />

            {/* Points System Guide */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Fantasy Points System</h2>
                    </CardTitle>
                    <CardDescription>
                        Standard fantasy cricket scoring rules
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-orange-600" />
                                Batting Points
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>Run scored</span>
                                    <span className="font-medium">+1 point</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Boundary (4)</span>
                                    <span className="font-medium">+1 point</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Six</span>
                                    <span className="font-medium">+2 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Half-century (50)</span>
                                    <span className="font-medium">+8 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Century (100)</span>
                                    <span className="font-medium">+16 points</span>
                                </li>
                                <li className="flex justify-between text-red-600">
                                    <span>Duck</span>
                                    <span className="font-medium">-2 points</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Activity className="h-4 w-4 text-blue-600" />
                                Bowling Points
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>Wicket</span>
                                    <span className="font-medium">+25 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Maiden over</span>
                                    <span className="font-medium">+12 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>4 wickets</span>
                                    <span className="font-medium">+8 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>5 wickets</span>
                                    <span className="font-medium">+16 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Economy bonus</span>
                                    <span className="font-medium">+6 points</span>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold flex items-center gap-2">
                                <Shield className="h-4 w-4 text-green-600" />
                                Fielding Points
                            </h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>Catch</span>
                                    <span className="font-medium">+8 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Stumping</span>
                                    <span className="font-medium">+12 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Run out</span>
                                    <span className="font-medium">+12 points</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>3+ catches</span>
                                    <span className="font-medium">+4 points</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <Alert className="mt-6">
                        <Star className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Captain & Vice-Captain:</strong> Captain gets 2x points, Vice-Captain gets 1.5x points on all scoring.
                        </AlertDescription>
                    </Alert>
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
                        <Link href="/sports-training/cricket-player-performance-index-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Performance Index</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Batting stats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Bowling stats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/bowling-economy-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Economy Rate</p>
                                            <p className="text-sm text-muted-foreground">Run containment</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/cricket-win-probability-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Win Probability</p>
                                            <p className="text-sm text-muted-foreground">Match prediction</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Fantasy Cricket Points: Strategy and Calculation" />
                <meta itemProp="description" content="A comprehensive guide to understanding fantasy cricket points, including detailed scoring rules for batting, bowling, and fielding, plus expert strategies for maximizing your fantasy team's score." />
                <meta itemProp="keywords" content="fantasy cricket points, fantasy cricket calculator, cricket points system, dream11 points, fantasy cricket strategy" />
                <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-10" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Fantasy Cricket Points</h2>
                <p className="text-lg italic text-muted-foreground">Everything you need to know to calculate points and master fantasy cricket leagues.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Introduction to Fantasy Cricket Scoring</h2>
                <p>Fantasy cricket has revolutionized how fans engage with the sport. Success in these leagues depends not just on cricket knowledge but on a deep understanding of the points system. Every run, wicket, catch, and boundary contributes to your total score, and knowing the values can help you select the most productive players.</p>

                <p>This guide breaks down the standard scoring mechanisms used across major fantasy platforms, helping you calculate potential scores and build winning teams.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Detailed Breakdown of the Points System</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Batting Points</h3>
                <p>Batsmen are the primary run-scorers, but fantasy points reward more than just the total runs.</p>
                <div className="overflow-x-auto my-4 p-4 bg-muted border rounded-lg">
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>Base Runs:</strong> 1 point for every run scored.</li>
                        <li><strong>Boundaries (Fours):</strong> 1 bonus point + run points.</li>
                        <li><strong>Sixes:</strong> 2 bonus points + run points.</li>
                        <li><strong>Milestone Bonuses:</strong> 8 points for a half-century (50 runs), 16 points for a century (100 runs).</li>
                        <li><strong>Duck Penalty:</strong> -2 points for getting out for 0 runs (excluding bowlers in some formats).</li>
                    </ul>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Bowling Points</h3>
                <p>Bowlers can earn massive points in short bursts by taking wickets.</p>
                <div className="overflow-x-auto my-4 p-4 bg-muted border rounded-lg">
                    <ul className="list-disc ml-6 space-y-2">
                        <li><strong>Wickets:</strong> 25 points per wicket (excluding run-outs).</li>
                        <li><strong>Maiden Overs:</strong> 12 points for bowling an over without conceding runs (T20/ODI).</li>
                        <li><strong>Bonus Points:</strong> 8 points for 4 wickets, 16 points for 5 wickets in a match.</li>
                        <li><strong>LBW/Bowled Bonus:</strong> Often 8 additional points (platform dependent).</li>
                    </ul>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Fielding Points</h3>
                <p>Fielding is an underrated source of consistent points.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Catch:</strong> 8 points.</li>
                    <li><strong>Stumping:</strong> 12 points.</li>
                    <li><strong>Run Out:</strong> 12 points (Direct hit) or shared (6/6).</li>
                    <li><strong>3 Catch Bonus:</strong> 4 points for taking 3 catches in a match.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. The Power Players: Captain & Vice-Captain</h3>
                <p>These two selections can make or break your fantasy team:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Captain:</strong> Receives <strong>2x</strong> (double) points for their performance.</li>
                    <li><strong>Vice-Captain:</strong> Receives <strong>1.5x</strong> points.</li>
                </ul>
                <p>Strategies often involve picking consistent all-rounders as captains to maximize points from both batting and bowling.</p>

                <h2 className="text-2xl font-bold text-foreground mt-8">Example Calculation Scenario</h2>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 my-4">
                    <p className="font-semibold mb-2">Player Performance:</p>
                    <ul className="list-disc ml-6 mb-4 space-y-1 text-sm">
                        <li>Runs: 65 (includes 5 fours, 2 sixes)</li>
                        <li>Wickets: 2</li>
                        <li>Catches: 1</li>
                        <li>Role: Captain</li>
                    </ul>
                    <p className="font-semibold mb-2">Points Breakdown:</p>
                    <ul className="list-disc ml-6 space-y-1 text-sm">
                        <li>Runs: 65 points</li>
                        <li>Fours Bonus: 5 points</li>
                        <li>Sixes Bonus: 4 points</li>
                        <li>Half-Century Bonus: 8 points</li>
                        <li>Wickets: 50 points</li>
                        <li>Catch: 8 points</li>
                        <li><strong>Total Base Points:</strong> 140 points</li>
                        <li><strong>Captain Multiplier (2x):</strong> 280 Total Fantasy Points</li>
                    </ul>
                </div>

                <h2 className="text-2xl font-bold text-foreground mt-8">Winning Strategies for Fantasy Cricket</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Prioritize All-Rounders:</strong> They have two avenues to score points (batting and bowling), making them safer captaincy choices.</li>
                    <li><strong>Check Pitch Reports:</strong> Select more spinners on dry pitches or swing bowlers on green tops.</li>
                    <li><strong>Toss Advantage:</strong> Teams batting first in T20s might set big scores; chasing teams might succumb to pressure. Adjust your team after the toss.</li>
                    <li><strong>Death Bowlers:</strong> Bowlers who bowl the final overs often pick up "cheap wickets" as batsmen try to slog, earning you crucial points.</li>
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
                        Common questions about standard fantasy cricket scoring
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">How are fantasy points calculated for a captain?</h4>
                            <p className="text-muted-foreground">
                                The captain of your fantasy team earns <strong>2x points</strong>. If a player scores 50 base points, selecting them as captain yields 100 points. The vice-captain earns <strong>1.5x points</strong> (75 points in this example).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does strike rate affect fantasy points?</h4>
                            <p className="text-muted-foreground">
                                Yes, in many formats (especially T20), a low strike rate can incur negative points, while a high strike rate can earn bonuses. Rules vary by platform, but generally, a strike rate below 70-50 in T20s attracts penalties for batsmen.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do runs scored in a Super Over count?</h4>
                            <p className="text-muted-foreground">
                                No, in almost all standard fantasy leagues, performance stats from a Super Over (runs, wickets, catches) do <strong>not</strong> count towards fantasy points.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the "economy rate" bonus?</h4>
                            <p className="text-muted-foreground">
                                Bowlers are rewarded for being economical. If a bowler concedes fewer runs than a set benchmark (e.g., under 5 runs/over in T20s), they receive bonus points. Conversely, high economy rates can lead to negative points.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do run-out points go to the thrower or the catcher?</h4>
                            <p className="text-muted-foreground">
                                If it's a direct hit, the thrower gets all the points (typically 12). If the thrower and keeper/catcher are involved, the points are usually split (6 each), though some platforms award the thrower more.
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
                                    <strong className="block text-primary mb-1">Fantasy Gamers</strong>
                                    <span className="text-sm text-muted-foreground">Calculate potential scores for players to optimize team selection.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Analyze player value and impact based on fantasy metrics.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">League Managers</strong>
                                    <span className="text-sm text-muted-foreground">Verify manual point calculations for private leagues.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Cricket Fans</strong>
                                    <span className="text-sm text-muted-foreground">Compare match performances between favorite players.</span>
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
                                The Cricket Fantasy Points Calculator estimates player scores based on standard fantasy league rules.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By inputting runs, wickets, and fielding stats, users can see a detailed breakdown of total fantasy points, aiding in better team strategy and player selection.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
