import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crosshair, Target, Info, Calculator, BarChart3, Users, CheckCircle2, TrendingUp, Activity, Share2, Shield } from 'lucide-react';
import FootballShotAccuracyCalculatorInteractive from './football-shot-accuracy-calculator-interactive';

export default function FootballShotAccuracyCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football Shot Accuracy Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate shot accuracy percentage and analyze shooting efficiency to evaluate striker performance and finishing reliability.
                </p>
            </div>

            <FootballShotAccuracyCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Different types of shots tracked in football
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Shots On Target
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Any shot that enters the goal or would have entered the goal if not saved by the goalkeeper.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Includes:</strong> Goals and Goalkeeper Saves.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Excludes:</strong> Hitting the post/crossbar (unless it bounces in).</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-red-700 dark:text-red-300">
                                <Crosshair className="h-4 w-4" />
                                Shots Off Target
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Attempts that miss the goal frame entirely.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span><strong>Includes:</strong> Shots that go wide or over the bar.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                    <span><strong>Includes:</strong> Shots hitting the post/crossbar and coming out.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Shield className="h-4 w-4" />
                                Blocked Shots
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Shots prevented from reaching the goal by an outfield player (defender).
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Doesn't count as on or off target in most stats.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>High numbers often indicate shooting too late or from crowded areas.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <TrendingUp className="h-4 w-4" />
                                Goals Scored
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The ultimate outcome.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Used here to calculate your <strong>Goal Conversion Rate</strong>.</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>High accuracy + Low goals = Good shooting, Great Goalkeeping (or poor placement).</span>
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
                        <Calculator className="h-5 w-5" />
                        Formula Used
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center mb-2">
                            Shot Accuracy (%) = (Shots On Target / Total Shots) × 100
                        </p>
                        <p className="font-mono text-xs text-center text-muted-foreground">
                            Total Shots = On Target + Off Target + Blocked
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Shot accuracy measures the percentage of your total attempts that force the goalkeeper to make a save (or result in a goal). It is a pure measure of technical reliability—can you consistently put the ball in the danger zone?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/20">
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Example A (Clinical):</p>
                            <p className="text-sm text-muted-foreground">
                                5 shots taken. 3 on target. 1 blocked. 1 off target. <br />
                                Accuracy = (3 / 5) × 100 = <strong>60%</strong>
                            </p>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-900/20">
                            <p className="text-sm font-semibold text-red-900 dark:text-red-200 mb-1">Example B (Wasteful):</p>
                            <p className="text-sm text-muted-foreground">
                                10 shots taken. 2 on target. 8 wide/high. <br />
                                Accuracy = (2 / 10) × 100 = <strong>20%</strong>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Related Football Calculators
                    </CardTitle>
                    <CardDescription>
                        Compare your shooting stats with other performance metrics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/sports-training/football-goal-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Goal Conversion Rate</p>
                                            <p className="text-sm text-muted-foreground">Goals vs Shots</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-expected-goals-calculator" className="block">
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
                        <Link href="/sports-training/football-expected-assists-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Share2 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Expected Assists (xA)</p>
                                            <p className="text-sm text-muted-foreground">Playmaking stats</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/football-possession-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Possession %</p>
                                            <p className="text-sm text-muted-foreground">Team control</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/match-impact-score-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Match Impact</p>
                                            <p className="text-sm text-muted-foreground">Overall rating</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Calculator className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Cricket/Sport speed</p>
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
                <meta itemProp="name" content="The Ultimate Guide to Shot Accuracy: Mastering the Art of Finishing" />
                <meta itemProp="description" content="Calculate and improve your football shot accuracy. Learn the difference between accuracy and conversion, benchmarks for elite strikers, and drills to hit the target consistently." />
                <meta itemProp="keywords" content="shot accuracy calculator, football shooting stats, shots on target percentage, soccer finishing drills, striker analysis, goal conversion vs accuracy" />
                <meta itemProp="author" content="MegaCalc Football Analytics Team" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Shot Accuracy: Mastering the Art of Finishing</h2>
                <p className="text-lg italic text-muted-foreground">Accuracy is the foundation of goalscoring. You cannot score if you do not test the goalkeeper.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Shot Accuracy?</a></li>
                    <li><a href="#accuracy-vs-conversion" className="hover:underline">Shot Accuracy vs. Goal Conversion</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Benchmarks: What Do Pros Achieve?</a></li>
                    <li><a href="#technical-breakdown" className="hover:underline">Technical Breakdown: Why Shots Miss</a></li>
                    <li><a href="#improvement-strategies" className="hover:underline">Strategies to Improve Accuracy</a></li>
                    <li><a href="#mental-game" className="hover:underline">The Mental Aspect of Finishing</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of this Metric</a></li>
                </ul>
                <hr />

                {/* CONTENT */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Shot Accuracy?</h2>
                <p><strong>Shot Accuracy</strong> (or Shooting Percentage) is the ratio of shots that hit the target (goal) relative to the total number of shots taken. It is the purest measure of a striker's technical consistency.</p>

                <p>A "Shot on Target" is defined as:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>A ball that goes into the net (Goal).</li>
                    <li>A ball that would have gone into the net but was stopped by the goalkeeper's save.</li>
                    <li>A ball that would have gone into the net but was stopped by a defender who is the last man (goal-line clearance).</li>
                </ul>
                <p className="mt-2 text-red-500 font-medium">Warning: Hitting the post or crossbar does NOT count as "On Target" unless the ball deflects into the goal.</p>

                <hr />

                <h2 id="accuracy-vs-conversion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Shot Accuracy vs. Goal Conversion</h2>
                <p>These two metrics are often confused but measure different things:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300">Shot Accuracy</h4>
                        <p className="text-sm mt-2"><strong>Focus:</strong> Hitting the target.</p>
                        <p className="text-sm"><strong>High Value:</strong> Indicates technical reliability (hitting the frame).</p>
                        <p className="text-sm"><strong>Example:</strong> Striker hits 10 shots straight at the keeper. Accuracy is 100%, but 0 goals.</p>
                    </div>
                    <div className="p-4 border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-lg">
                        <h4 className="font-bold text-green-800 dark:text-green-300">Goal Conversion</h4>
                        <p className="text-sm mt-2"><strong>Focus:</strong> Scoring goals.</p>
                        <p className="text-sm"><strong>High Value:</strong> Indicates clinical efficiency.</p>
                        <p className="text-sm"><strong>Example:</strong> Striker takes 1 shot and scores. Accuracy is 100%, Conversion is 100%.</p>
                    </div>
                </div>
                <p><strong>The Golden Rule:</strong> Aim for High Accuracy first. Goals will follow if you consistently work the goalkeeper.</p>

                <hr />

                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Benchmarks: What Do Pros Achieve?</h2>
                <p>You might be surprised that professional accuracy is lower than expected. Defenders and goalkeepers make it incredibly hard.</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Elite Strikers (Haaland, Kane, Lewandowski):</strong> Typically maintain <strong>50% - 60%</strong> Shot Accuracy.</li>
                    <li><strong>Good Professional Wings/Forwards:</strong> Average around <strong>40% - 50%</strong>.</li>
                    <li><strong>Average Players:</strong> Often dip below <strong>35%</strong> (meaning nearly 2 out of 3 shots miss the target completely).</li>
                </ul>

                <p className="mt-4"><strong>Key Insight:</strong> If you are hitting the target 50% of the time in Sunday League or amateur football, you are performing at a very high standard technically.</p>

                <hr />

                <h2 id="technical-breakdown" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Technical Breakdown: Why Shots Miss</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Leaning Back</h3>
                <p>The #1 cause of shots going over the bar. When your body weight is on your back foot, the natural swing of your leg lifts the ball. <strong>Fix:</strong> Get your "chest over the ball" and head down.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Standing Foot Placement</h3>
                <p>If your standing foot is too far from the ball, you reach for it (hooking it wide). If it's too close, you get jammed. <strong>Fix:</strong> Plant your foot roughly 6 inches to the side of the ball, pointing at your target.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Rushing the Shot</h3>
                <p>Panic causes muscle tension. Tension destroys technique. <strong>Fix:</strong> Realize you have more time than you think. A composed split-second pause allows you to aim.</p>

                <hr />

                <h2 id="improvement-strategies" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Accuracy</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Drill 1: The "Post Challenge"</h3>
                <p>Instead of aiming for the whole goal, aim for the posts from the penalty spot. This narrows your focus. Psychologically, if you aim small, you miss small.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Drill 2: Two-Touch Finishing</h3>
                <p>Set up a rebound board or partner. Pass firmly, control the return with one touch to set yourself, and finish low into a corner with the second. This replicates match scenarios better than static ball shooting.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Drill 3: Weak Foot Volume</h3>
                <p>Defenders force you onto your weak foot. If your accuracy drops from 60% (strong) to 10% (weak), you are easy to defend. Dedicate 20 mins a day to wall-passing with your weak foot to build neural pathways.</p>

                <hr />

                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of the Metric</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Shot Selection:</strong> A player who only shoots from 2 yards out will have 100% accuracy but low volume. A player shooting from 40 yards will have low accuracy. The metric doesn't account for difficulty (use xG for that).</li>
                    <li><strong>Blocked Shots:</strong> Accuracy stats penalize players for taking shots in crowded boxes, even if the technique was good.</li>
                    <li><strong>Goalkeeper Performance:</strong> You can hit a perfect shot to the top corner, but if the keeper makes a world-class save, it's just a stat. The stat doesn't tell you "how good" the shot was (use Post-Shot xG models for that).</li>
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
                        Common questions about Shooting Statistics
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does hitting the post count as a shot on target?</h4>
                            <p className="text-muted-foreground">
                                No. In official statistics (Opta, FIFA), hitting the post or crossbar is considered OFF target unless the ball deflects off the frame and goes INTO the net. It is often categorized separately as "Woodwork Hit".
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What if a defender blocks my shot on the line?</h4>
                            <p className="text-muted-foreground">
                                If the goalkeeper is beaten and a defender stops the ball from going into the net to prevent a certain goal, this IS counted as a shot on target.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is 100% shot accuracy possible?</h4>
                            <p className="text-muted-foreground">
                                Yes, in a single game (e.g., taking 1 shot and scoring). However, over a season, maintaining 100% is impossible due to defensive pressure and human error.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is "Shooting Efficiency"?</h4>
                            <p className="text-muted-foreground">
                                This usually refers to the number of goals scored relative to shots taken (Conversion Rate). Accuracy is just about hitting the target; Efficiency is about scoring.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should I shoot through legs?</h4>
                            <p className="text-muted-foreground">
                                Shooting through a defender's legs often blinds the goalkeeper, increasing the chance of a goal even if the shot isn't perfectly in the corner. It's a high-level skill used by players like Romario and Messi.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why are my shots always going high?</h4>
                            <p className="text-muted-foreground">
                                You are likely leaning back. Keep your head over the ball, knee over the ball, and follow through low.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do penalties count towards accuracy stats?</h4>
                            <p className="text-muted-foreground">
                                Yes, usually. A penalty kick is a shot. If you score, it's on target. If you miss nicely, it's off target. If the keeper saves it, it's on target.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is it better to blast it or place it?</h4>
                            <p className="text-muted-foreground">
                                At close range (inside box), placement is king. A pass into the corner beats a power shot at the keeper 9 times out of 10. Reserve power for long-range efforts where you need to beat the keeper's reaction time.
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
                                    <strong className="block text-primary mb-1">Strikers</strong>
                                    <span className="text-sm text-muted-foreground">Track your game-by-game stats to identify slumps in form or technique issues.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Youth Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Show young players that power means nothing if they miss the target. Use stats to encourage placement.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Gamers (FIFA/EAFC)</strong>
                                    <span className="text-sm text-muted-foreground">Analyze your virtual performance. Are you losing because of "scripting" or because you missed 15 shots?</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate if a team's low scoring is due to poor chance creation (low shots) or poor finishing (low accuracy).</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Common Interpretations</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-900/20">
                                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">High Shots, Low Accuracy</h4>
                                    <p className="text-sm text-muted-foreground">
                                        "Spray and Pray". You are shooting from everywhere, desperate to score. This often hurts the team as you waste possession on low-probability efforts. <strong>Advice:</strong> Pass more, shoot only when clear.
                                    </p>
                                </div>

                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/20">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Low Shots, High Accuracy</h4>
                                    <p className="text-sm text-muted-foreground">
                                        "The Sniper". You rarely shoot, but when you do, it threatens. This is efficient, but maybe too passive. <strong>Advice:</strong> Be more selfish! Your team needs you to take more risks.
                                    </p>
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
                        <Crosshair className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Football Shot Accuracy Calculator helps bridge the gap between effort and outcome. By isolating your ability to hit the target, you can identify specific technical flaws in your finishing.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Remember: A shot off target has 0% chance of scoring. A shot on target—even a weak one—can result in a goal, a deflection, or a rebound. Accuracy is the first step to becoming a lethal striker.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
