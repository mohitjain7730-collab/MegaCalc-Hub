import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, Activity, TrendingUp, Users, Shield, Crosshair, Zap } from 'lucide-react';
import FootballExpectedGoalsCalculatorInteractive from './football-expected-goals-calculator-interactive';

export default function FootballExpectedGoalsCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football Expected Goals (xG) Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate Expected Goals (xG) to measure shot quality, assess scoring opportunities, and analyze attacking performance using advanced football analytics.
                </p>
            </div>

            <FootballExpectedGoalsCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key factors that determine Expected Goals (xG) value
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Target className="h-4 w-4" />
                                Shot Location
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The position on the pitch where the shot was taken. Location is the most important xG factor.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Six-yard box shots have highest xG (~0.65)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Long-range shots (25+ yards) have very low xG (~0.03)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                <Activity className="h-4 w-4" />
                                Shot Type
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                How the shot was taken affects conversion probability significantly.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                    <span>Penalties have ~76% conversion rate</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                    <span>Headers typically have lower xG than foot shots</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Shield className="h-4 w-4" />
                                Defender Pressure
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The level of defensive pressure when taking the shot.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>No pressure increases xG by ~40%</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>High pressure reduces xG by ~40%</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Zap className="h-4 w-4" />
                                Assist Type
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                How the scoring opportunity was created.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Through balls and cutbacks create highest quality chances</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span>Crosses and set pieces typically have lower xG</span>
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
                        <p className="font-mono text-sm text-center mb-2">
                            xG = Base Value × Location Factor × Shot Type Modifier × Pressure Modifier × Assist Modifier
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Expected Goals (xG) is calculated using a sophisticated model that weighs multiple factors. The location of the shot is the primary determinant, modified by shot type (penalty, header, volley, etc.), defensive pressure, and how the chance was created. Professional xG models use machine learning trained on thousands of shots to predict goal probability with high accuracy.
                    </p>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/20">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Example Calculation:</p>
                        <p className="text-sm text-muted-foreground">
                            A shot from the penalty spot (base 0.45) taken as a penalty (×2.0) with no pressure (×1.4) from a through ball (×1.3) = 0.45 × 2.0 × 1.4 × 1.3 ≈ 0.76 xG (76% conversion probability)
                        </p>
                    </div>
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
                        <Link href="/category/sports-training/football-possession-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Possession Percentage</p>
                                            <p className="text-sm text-muted-foreground">Ball control metrics</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-pass-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Pass Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Passing precision</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-goal-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Goal Conversion Rate</p>
                                            <p className="text-sm text-muted-foreground">Finishing efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Strike Rate</p>
                                            <p className="text-sm text-muted-foreground">Scoring speed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Cricket consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/bowling-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Crosshair className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Bowling Average</p>
                                            <p className="text-sm text-muted-foreground">Bowling performance</p>
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
                <meta itemProp="name" content="The Complete Guide to Expected Goals (xG): Revolutionary Football Analytics Explained" />
                <meta itemProp="description" content="Master Expected Goals (xG), the revolutionary metric transforming football analysis. Learn calculation methods, interpretation, tactical applications, and how xG predicts match outcomes better than traditional statistics." />
                <meta itemProp="keywords" content="expected goals, xG football, soccer analytics, shot quality metrics, football statistics, xG model, advanced football analytics, performance analysis" />
                <meta itemProp="author" content="MegaCalc Football Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Expected Goals (xG): The Metric Revolutionizing Football Analysis</h2>
                <p className="text-lg italic text-muted-foreground">Understand the advanced statistic that has transformed how we evaluate players, teams, and matches—from shot quality to predictive analytics.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Expected Goals (xG)?</a></li>
                    <li><a href="#calculation" className="hover:underline">How xG is Calculated</a></li>
                    <li><a href="#interpretation" className="hover:underline">Interpreting xG Values</a></li>
                    <li><a href="#applications" className="hover:underline">Practical Applications of xG</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks and Standards</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations and Criticisms</a></li>
                    <li><a href="#improvement" className="hover:underline">Using xG to Improve Performance</a></li>
                    <li><a href="#risks" className="hover:underline">Common Misinterpretations</a></li>
                </ul>
                <hr />

                {/* WHAT IS XG */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Expected Goals (xG)?</h2>
                <p><strong>Expected Goals (xG)</strong> is an advanced football metric that quantifies the quality of a scoring chance by calculating the probability that a shot will result in a goal. Each shot is assigned an xG value between 0 and 1, where 0 represents no chance of scoring and 1 represents absolute certainty of scoring.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Revolution in Football Analytics</h3>
                <p>Traditional football statistics—goals, shots, possession—tell you <em>what happened</em> but not <em>how likely it was to happen</em>. A team might have 20 shots but lose 1-0, while their opponent scores from their only chance. xG reveals the underlying quality: perhaps the losing team's 20 shots were all from 30 yards (low xG), while the winner's single shot was a tap-in from 3 yards (high xG).</p>

                <p>xG emerged in the 2010s from data analytics companies like Opta, StatsBomb, and Understat, revolutionizing how clubs scout players, evaluate tactics, and make strategic decisions. Today, every top club employs analysts who use xG extensively.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Why xG Matters</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Measures shot quality, not just quantity:</strong> Distinguishes between a 40-yard speculative effort and a clear one-on-one</li>
                    <li><strong>Predicts future performance:</strong> Teams that consistently outperform their xG (score more than expected) often regress to the mean</li>
                    <li><strong>Evaluates attacking effectiveness:</strong> Shows how well teams create high-quality chances</li>
                    <li><strong>Assesses finishing ability:</strong> Compares actual goals to xG to identify clinical or wasteful finishers</li>
                    <li><strong>Removes luck from analysis:</strong> A team might win 3-0 but have xG of 0.8 vs opponent's 2.5—they were fortunate</li>
                </ul>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Expected Goals (xG) is Calculated</h2>
                <p>Professional xG models use machine learning algorithms trained on databases of tens of thousands of shots. Each shot's outcome (goal or no goal) is recorded along with contextual factors, allowing the model to learn which factors correlate with scoring.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Key Factors in xG Models</h3>

                <p><strong>1. Shot Location (Most Important Factor)</strong></p>
                <p>Distance and angle to goal are the primary determinants of xG:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Six-yard box:</strong> ~0.60-0.70 xG (60-70% conversion rate)</li>
                    <li><strong>Penalty spot:</strong> ~0.35-0.45 xG</li>
                    <li><strong>Edge of box:</strong> ~0.08-0.15 xG</li>
                    <li><strong>Outside box (20+ yards):</strong> ~0.02-0.05 xG</li>
                    <li><strong>Long range (30+ yards):</strong> ~0.01-0.02 xG</li>
                </ul>

                <p className="mt-4"><strong>2. Shot Type</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Penalty:</strong> ~0.76-0.79 xG (professional conversion rate)</li>
                    <li><strong>One-on-one with goalkeeper:</strong> ~0.40-0.60 xG depending on angle</li>
                    <li><strong>Open play (foot):</strong> Baseline, adjusted by other factors</li>
                    <li><strong>Header:</strong> ~0.5-0.7× multiplier (headers are harder to convert)</li>
                    <li><strong>Volley:</strong> ~0.6-0.8× multiplier (technical difficulty)</li>
                    <li><strong>Free kick:</strong> ~0.03-0.10 xG depending on distance</li>
                </ul>

                <p className="mt-4"><strong>3. Body Part Used</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Right foot (for right-footed player): Standard</li>
                    <li>Left foot (for right-footed player): Reduced xG</li>
                    <li>Head: Significantly reduced xG</li>
                    <li>Other (chest, shin, etc.): Very low xG</li>
                </ul>

                <p className="mt-4"><strong>4. Assist Type / Chance Creation</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Through ball:</strong> Higher xG (defender beaten, space created)</li>
                    <li><strong>Cutback:</strong> High xG (shooter facing goal, time to set)</li>
                    <li><strong>Cross:</strong> Lower xG (harder to control, goalkeeper advantage)</li>
                    <li><strong>Rebound:</strong> Variable (depends on positioning)</li>
                    <li><strong>Individual creation:</strong> Standard</li>
                </ul>

                <p className="mt-4"><strong>5. Defensive Pressure</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Number of defenders between shooter and goal</li>
                    <li>Distance of nearest defender</li>
                    <li>Angle of defensive pressure</li>
                </ul>

                <p className="mt-4"><strong>6. Game State (Advanced Models)</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li>Match score (teams trailing take more risks)</li>
                    <li>Time remaining</li>
                    <li>Home vs. away</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">The Mathematical Model</h3>
                <p>Most professional xG models use <strong>logistic regression</strong> or <strong>neural networks</strong>:</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg">
                    <p className="font-mono text-sm text-center">
                        xG = 1 / (1 + e^(-z))
                    </p>
                    <p className="text-xs text-center mt-2 text-muted-foreground">
                        where z = β₀ + β₁(distance) + β₂(angle) + β₃(shot_type) + ... + βₙ(factor_n)
                    </p>
                </div>

                <p>The model learns the optimal weights (β values) for each factor by analyzing historical shot data.</p>

                <hr />

                {/* INTERPRETATION */}
                <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Expected Goals (xG) Values</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Individual Shot xG</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>0.70+ xG:</strong> "Big chance" or "sitter" — should be scored most of the time. Missing these is a significant error.</li>
                    <li><strong>0.40-0.70 xG:</strong> "Clear chance" — good opportunity that quality players convert 40-70% of the time.</li>
                    <li><strong>0.15-0.40 xG:</strong> "Half-chance" — moderate quality, requires good technique to convert.</li>
                    <li><strong>0.05-0.15 xG:</strong> "Speculative shot" — low probability, but worth attempting in right circumstances.</li>
                    <li><strong>Below 0.05 xG:</strong> "Long shot" — very unlikely to score, often better to retain possession.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Match xG Totals</h3>
                <p>Summing all shots gives team xG for a match:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>3.0+ xG:</strong> Dominant attacking performance, created multiple high-quality chances</li>
                    <li><strong>2.0-3.0 xG:</strong> Strong attacking display, should score 2-3 goals on average</li>
                    <li><strong>1.0-2.0 xG:</strong> Moderate chance creation, typical for many matches</li>
                    <li><strong>0.5-1.0 xG:</strong> Limited attacking threat, struggled to create quality chances</li>
                    <li><strong>Below 0.5 xG:</strong> Very poor attacking performance, minimal goal threat</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">xG Difference (xGD)</h3>
                <p>The difference between a team's xG and opponent's xG indicates match dominance:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>+2.0 xGD:</strong> Comprehensive dominance, deserved comfortable win</li>
                    <li><strong>+1.0 to +2.0 xGD:</strong> Clear superiority, should win comfortably</li>
                    <li><strong>+0.5 to +1.0 xGD:</strong> Moderate advantage, narrow win expected</li>
                    <li><strong>-0.5 to +0.5 xGD:</strong> Even contest, result could go either way</li>
                    <li><strong>Below -1.0 xGD:</strong> Outplayed, fortunate if result was positive</li>
                </ul>

                <hr />

                {/* APPLICATIONS */}
                <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Practical Applications of Expected Goals</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Player Evaluation and Scouting</h3>
                <p><strong>Identifying Clinical Finishers:</strong></p>
                <p>Compare actual goals to xG over a season. A striker who scores 20 goals from 15 xG is an elite finisher (outperforming xG by +5). Conversely, 10 goals from 18 xG suggests poor finishing (-8 underperformance).</p>

                <p className="mt-4"><strong>Famous Examples:</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Lionel Messi:</strong> Consistently outperforms xG by 15-25% due to exceptional finishing</li>
                    <li><strong>Mohamed Salah (2017-18):</strong> Scored 32 Premier League goals from ~22 xG—unsustainable hot streak</li>
                    <li><strong>Timo Werner (2020-21 Chelsea):</strong> Scored 6 from ~12 xG—significant underperformance</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Tactical Analysis</h3>
                <p><strong>Evaluating Attacking Strategies:</strong></p>
                <p>xG reveals which tactical approaches create the best chances. A team with high shot volume but low xG is taking poor-quality shots (ineffective). A team with fewer shots but high xG is creating quality chances (effective).</p>

                <p className="mt-4"><strong>Example:</strong> Manchester City under Guardiola typically has moderate shot volume but very high xG per shot, indicating patient build-up creating high-quality chances.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Predictive Analytics</h3>
                <p><strong>Identifying Regression Candidates:</strong></p>
                <p>Teams that significantly outperform or underperform their xG tend to regress toward their xG over time. This helps predict future performance:</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li>Team scoring 40 goals from 30 xG is likely overperforming (regression expected)</li>
                    <li>Team scoring 20 goals from 35 xG is underperforming (improvement likely)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Match Analysis</h3>
                <p><strong>Understanding "Deserved" Results:</strong></p>
                <p>xG reveals whether match results reflected performance:</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Team A wins 3-0 (xG: 3.2 vs 0.4):</strong> Deserved, dominant performance</li>
                    <li><strong>Team A wins 1-0 (xG: 0.8 vs 2.5):</strong> Fortunate, outplayed but clinical/lucky</li>
                    <li><strong>Draw 1-1 (xG: 2.3 vs 2.1):</strong> Fair result, evenly matched</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Goalkeeper Evaluation</h3>
                <p><strong>Post-Shot xG (PSxG):</strong></p>
                <p>Advanced models calculate xG after the shot is taken, accounting for shot placement and power. Comparing PSxG to goals conceded evaluates goalkeeper shot-stopping:</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li>Goalkeeper concedes 30 goals from 35 PSxG: +5 goals prevented (excellent)</li>
                    <li>Goalkeeper concedes 40 goals from 35 PSxG: -5 goals prevented (poor)</li>
                </ul>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Industry Benchmarks and Elite Standards</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Top-Tier League Averages (Per Match)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Premier League:</strong> ~1.3-1.5 xG per team per match</li>
                    <li><strong>La Liga:</strong> ~1.2-1.4 xG per team per match</li>
                    <li><strong>Bundesliga:</strong> ~1.4-1.6 xG per team per match (highest scoring league)</li>
                    <li><strong>Serie A:</strong> ~1.1-1.3 xG per team per match (traditionally defensive)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Elite Striker Performance (Season)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>World-class strikers:</strong> 20-25 goals from 18-22 xG (slight overperformance)</li>
                    <li><strong>Elite strikers:</strong> 15-20 goals from 14-18 xG</li>
                    <li><strong>Good strikers:</strong> 10-15 goals from 10-15 xG (meeting xG)</li>
                    <li><strong>Struggling strikers:</strong> 5-10 goals from 12-18 xG (significant underperformance)</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Record xG Performances</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Highest single-match team xG:</strong> ~5.0-6.0 xG (extremely dominant performances)</li>
                    <li><strong>Highest season xG:</strong> Manchester City 2017-18 (~95 xG, scored 106 goals)</li>
                    <li><strong>Biggest xG overperformance:</strong> Leicester City 2015-16 (scored ~68 goals from ~54 xG)</li>
                </ul>

                <hr />

                {/* LIMITATIONS */}
                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Criticisms of Expected Goals</h2>

                <p>While xG is powerful, it has important limitations:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Doesn't Account for Player Quality</h3>
                <p>Basic xG models treat all players equally. A tap-in from 5 yards has the same xG whether taken by Lionel Messi or a Sunday league player. In reality, elite players convert chances at higher rates.</p>

                <p><strong>Solution:</strong> Some advanced models incorporate player quality adjustments, but this is complex and debated.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Model Variations Create Inconsistency</h3>
                <p>Different providers (Opta, StatsBomb, Understat, FBref) use different xG models, leading to different values for the same shot. A chance might be 0.35 xG in one model and 0.42 in another.</p>

                <p><strong>Impact:</strong> Makes cross-provider comparisons difficult. Always use the same data source for consistency.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Doesn't Capture Pre-Shot Movement</h3>
                <p>xG measures shot quality at the moment of the shot, not the quality of movement to create the chance. A striker making an intelligent run to get into a shooting position gets the same xG as one who was lucky to be there.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">4. Small Sample Size Issues</h3>
                <p>Over 5-10 matches, xG can be misleading due to randomness. A team might have 2.0 xG and score 0 goals (unlucky) or 5 goals (very lucky). xG is most reliable over larger samples (20+ matches, full seasons).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">5. Doesn't Measure Defensive Actions</h3>
                <p>xG focuses on attacking. It doesn't directly measure defensive quality, though "xG Against" (xGA) provides some insight.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">6. Can Encourage Risk-Averse Play</h3>
                <p>Critics argue over-reliance on xG might discourage long-range shots or creative attempts, as these have low xG. However, spectacular goals often come from low-xG situations.</p>

                <hr />

                {/* IMPROVEMENT */}
                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Using xG to Improve Performance</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">For Teams: Increasing xG</h3>

                <p><strong>1. Tactical Adjustments</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Penetrate the box:</strong> Shots from inside the box have 5-10× higher xG than outside</li>
                    <li><strong>Create cutbacks and through balls:</strong> These assist types generate highest xG</li>
                    <li><strong>Exploit counter-attacks:</strong> Transitions create space and reduce defensive pressure</li>
                    <li><strong>Improve set-piece routines:</strong> Corners and free kicks can create high-xG chances</li>
                </ul>

                <p className="mt-4"><strong>2. Player Development</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Movement off the ball:</strong> Intelligent runs create better shooting positions</li>
                    <li><strong>Combination play:</strong> Quick passing combinations break down defenses</li>
                    <li><strong>1v1 skills:</strong> Beating defenders creates higher-quality chances</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">For Players: Improving Finishing</h3>

                <p><strong>1. Shot Selection</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Recognize high-xG opportunities:</strong> Prioritize getting into positions for tap-ins over long shots</li>
                    <li><strong>Pass when appropriate:</strong> If a teammate has a 0.6 xG chance and you have 0.2, pass</li>
                    <li><strong>Work the ball into the box:</strong> Patience to create better angles</li>
                </ul>

                <p className="mt-4"><strong>2. Technical Improvement</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Composure training:</strong> Practice finishing under pressure</li>
                    <li><strong>Placement over power:</strong> Accurate shots beat goalkeepers more than hard shots</li>
                    <li><strong>First-touch control:</strong> Better control creates better shooting positions</li>
                    <li><strong>Weak foot development:</strong> Two-footed players create more opportunities</li>
                </ul>

                <p className="mt-4"><strong>3. Mental Approach</strong></p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Don't overthink:</strong> Trust your instincts on high-xG chances</li>
                    <li><strong>Learn from misses:</strong> Analyze why you missed to improve</li>
                    <li><strong>Maintain confidence:</strong> Even elite finishers miss; focus on process, not results</li>
                </ul>

                <hr />

                {/* RISKS */}
                <h2 id="risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Common Misinterpretations and Risks</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Misinterpretation #1: "xG Predicts Exact Scores"</h3>
                <p><strong>Reality:</strong> xG represents probability, not certainty. A team with 2.0 xG won't always score exactly 2 goals—they might score 0, 1, 3, or 4. Over many matches, goals will average close to xG.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Misinterpretation #2: "Higher xG Always Means Better Team"</h3>
                <p><strong>Reality:</strong> A team might have high xG but poor finishing, while opponents have low xG but clinical finishing. Results matter. xG is a tool for understanding performance, not the only measure of quality.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Misinterpretation #3: "Outperforming xG is Unsustainable"</h3>
                <p><strong>Reality:</strong> While most overperformance regresses, elite players (Messi, Lewandowski, Ronaldo) consistently outperform xG due to exceptional ability. The key is distinguishing skill from luck.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Misinterpretation #4: "Low-xG Shots Are Worthless"</h3>
                <p><strong>Reality:</strong> Long-range shots (low xG) can create rebounds, force saves, or occasionally produce spectacular goals. Context matters—a 0.03 xG shot might be the best available option.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Risk: Over-Reliance on xG</h3>
                <p>xG should complement, not replace, traditional scouting and analysis. Watching matches, understanding tactics, and evaluating intangibles (leadership, work rate, mentality) remain essential.</p>

                <hr />

                {/* CONCLUSION */}
                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
                <p>Expected Goals (xG) has revolutionized football analytics, providing unprecedented insight into shot quality, attacking effectiveness, and match performance. By quantifying the probability of scoring, xG allows coaches, analysts, players, and fans to evaluate performance beyond simple goal tallies.</p>

                <p>The metric's power lies in its ability to separate skill from luck, identify sustainable performance, and predict future outcomes. Teams that consistently create high xG while limiting opponent xG tend to succeed over time. Players who outperform their xG demonstrate elite finishing ability.</p>

                <p>However, xG is not perfect. Model variations, player quality differences, and small sample sizes create limitations. The metric works best as part of a comprehensive analytical toolkit, combined with traditional scouting, tactical analysis, and contextual understanding.</p>

                <p>As football continues its data revolution, xG remains at the forefront—a sophisticated yet accessible metric that has fundamentally changed how we understand the beautiful game. Whether you're a coach optimizing tactics, a scout evaluating players, or a fan seeking deeper understanding, mastering xG is essential for modern football analysis.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Expected Goals (xG) in football
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a good xG value for a single shot?</h4>
                            <p className="text-muted-foreground">
                                An xG value of 0.30 or higher represents a good scoring opportunity. Values above 0.50 are considered "big chances" that should be converted more often than not. For context, penalties have an xG of approximately 0.76-0.79, while shots from outside the box typically have xG below 0.10. Professional strikers aim to consistently get shots with xG above 0.20.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How is Expected Goals (xG) calculated?</h4>
                            <p className="text-muted-foreground">
                                xG is calculated using machine learning models trained on thousands of historical shots. The models analyze factors including shot location (distance and angle to goal), shot type (header, volley, penalty, etc.), defensive pressure, assist type, and body part used. Each factor is weighted based on its correlation with scoring probability. The result is a value between 0 (no chance) and 1 (certain goal) representing the probability that shot results in a goal.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What does it mean if a player outperforms their xG?</h4>
                            <p className="text-muted-foreground">
                                If a player scores more goals than their xG suggests (e.g., 20 goals from 15 xG), they're "outperforming xG" by +5 goals. This indicates either exceptional finishing ability or good fortune. Elite players like Lionel Messi consistently outperform xG by 15-25% due to superior technique. However, most players who significantly outperform xG experience regression—their goal-scoring rate typically decreases toward their xG over time as luck evens out.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why do different websites show different xG values?</h4>
                            <p className="text-muted-foreground">
                                Different analytics providers (Opta, StatsBomb, Understat, FBref) use different xG models with varying factors and weightings. One model might value shot location more heavily, while another emphasizes defensive pressure. This leads to different xG values for the same shot—sometimes varying by 0.05-0.15. When analyzing xG, always use data from the same provider for consistency. No single model is definitively "correct"; each has strengths and weaknesses.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can xG predict match results?</h4>
                            <p className="text-muted-foreground">
                                xG doesn't predict exact scores but indicates which team created better chances. A team with 2.5 xG vs opponent's 0.8 xG "deserved" to win based on chance quality, even if they lost 1-0. Over many matches, teams with higher xG win more often. Research shows xG is better at predicting future results than actual goals, as it removes short-term luck. However, individual matches remain unpredictable—football's beauty includes upsets where the "worse" team wins.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What's the difference between xG and xGA?</h4>
                            <p className="text-muted-foreground">
                                xG (Expected Goals) measures the quality of chances a team creates—their attacking effectiveness. xGA (Expected Goals Against) measures the quality of chances a team concedes—their defensive vulnerability. A team with high xG and low xGA is both creating good chances and preventing them, indicating strong overall performance. The difference (xG - xGA) is xGD (Expected Goal Difference), a powerful predictor of league position and future performance.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is a penalty always 0.76 xG?</h4>
                            <p className="text-muted-foreground">
                                Professional penalties have approximately 76-79% conversion rate, giving them ~0.76-0.79 xG in most models. However, some advanced models adjust for context: penalties in high-pressure situations (Champions League finals) might have slightly lower xG due to increased pressure, while penalties in low-stakes matches might be higher. Additionally, some models account for penalty taker quality—elite penalty takers like Bruno Fernandes or Jorginho have higher conversion rates than the average.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Should teams avoid low-xG shots?</h4>
                            <p className="text-muted-foreground">
                                Not necessarily. While high-xG shots are preferable, low-xG shots (long-range efforts) can be valuable in specific contexts: when no better option exists, to create rebounds, to test the goalkeeper, or when trailing late in matches. Additionally, some players (Kevin De Bruyne, Bruno Fernandes) consistently score from low-xG positions due to exceptional technique. The key is shot selection—taking low-xG shots when appropriate, not exclusively.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How do top clubs use xG in practice?</h4>
                            <p className="text-muted-foreground">
                                Elite clubs use xG extensively for: (1) Player recruitment—identifying undervalued players who create/convert high-xG chances; (2) Tactical analysis—evaluating which formations and strategies generate highest xG; (3) Performance evaluation—assessing whether results reflect underlying performance; (4) Opposition scouting—identifying defensive weaknesses to exploit; (5) Training focus—working on creating higher-quality chances. Liverpool, Manchester City, and Brighton are famous for sophisticated xG-based recruitment and tactics.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is Post-Shot xG (PSxG)?</h4>
                            <p className="text-muted-foreground">
                                Post-Shot xG (PSxG) is an advanced metric that calculates goal probability after the shot is taken, incorporating shot placement, power, and trajectory. While standard xG assumes average shot quality, PSxG accounts for whether the shot was well-placed in the corner or straight at the goalkeeper. PSxG is primarily used to evaluate goalkeeper shot-stopping ability: if a goalkeeper concedes fewer goals than their PSxG, they're making above-average saves. It's more accurate than standard xG for individual shot analysis.
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
                                    <strong className="block text-primary mb-1">Football Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate shot quality and train players on optimal shooting positions and decision-making.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Performance Analysts</strong>
                                    <span className="text-sm text-muted-foreground">Assess attacking effectiveness and identify areas for tactical improvement.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Scouts & Recruiters</strong>
                                    <span className="text-sm text-muted-foreground">Identify undervalued players who create or convert high-quality chances.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Players & Strikers</strong>
                                    <span className="text-sm text-muted-foreground">Understand shot quality and improve decision-making in attacking situations.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Football Analysts & Journalists</strong>
                                    <span className="text-sm text-muted-foreground">Provide data-driven match analysis and player performance insights.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Football Players</strong>
                                    <span className="text-sm text-muted-foreground">Identify players likely to score based on chance quality, not just recent goals.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Limitations</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-900/20">
                                    <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">When is xG Misleading?</h4>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                            <span><strong>Doesn't account for player quality:</strong> Treats all players equally—Messi and amateur have same xG for identical shot</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                            <span><strong>Model variations:</strong> Different providers show different xG values for same shot</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                            <span><strong>Small sample issues:</strong> Over 5-10 matches, randomness can make xG misleading</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                            <span><strong>Doesn't capture pre-shot movement:</strong> Intelligent positioning to create chance not reflected</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                                            <span><strong>Probability, not certainty:</strong> xG of 0.50 doesn't mean exactly 50% of shots score</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/20">
                                    <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Case Study A: Mohamed Salah (2017-18)</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Goals:</strong> 32 (Premier League)
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>xG:</strong> ~22 (Understat)
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Analysis:</strong> Salah outperformed xG by +10 goals in his record-breaking season. While exceptional, this level of overperformance is unsustainable—his subsequent seasons saw regression toward xG. Demonstrates how elite players can exceed xG but also shows importance of understanding sustainable performance levels.
                                    </p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/20">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Case Study B: Germany vs Italy (Euro 2012)</h4>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>Result:</strong> Germany 1-2 Italy
                                    </p>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        <strong>xG:</strong> Germany ~2.3, Italy ~0.9
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        <strong>Analysis:</strong> Germany dominated possession (65%) and created far better chances (2.3 xG vs 0.9), but Italy won through clinical finishing and defensive organization. Perfect example of xG revealing "deserved" winner differs from actual result. Germany's performance was superior, but football rewards goals, not xG.
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
                        <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Football Expected Goals (xG) Calculator is an essential tool for modern football analysis, measuring shot quality and scoring probability.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By analyzing shot location, type, defensive pressure, and assist type, it provides sophisticated insights into attacking effectiveness, player finishing ability, and match performance—helping coaches, analysts, and fans understand the game beyond simple goal tallies.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
