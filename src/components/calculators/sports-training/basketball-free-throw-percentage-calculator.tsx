import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Activity } from 'lucide-react';
import BasketballFreeThrowPercentageCalculatorInteractive from './basketball-free-throw-percentage-calculator-interactive';

export default function BasketballFreeThrowPercentageCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Basketball Free Throw Percentage Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your Free Throw Percentage (FT%) to measure shooting consistency from the charity stripe.
                </p>
            </div>

            <BasketballFreeThrowPercentageCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        The two key metrics needed for FT% calculation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <CheckCircle2 className="h-4 w-4" />
                                Free Throws Made (FTM)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of free throw shots that successfully went through the hoop.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Counts as 1 point per successful shot</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span>Must be a legal shot (no lane violations)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Target className="h-4 w-4" />
                                Free Throws Attempted (FTA)
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The total number of free throw shots taken, including both made and missed shots.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Includes misses and makes</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span>Excluded if a lane violation by the defense grants a retry</span>
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
                            FT% = (Free Throws Made / Free Throws Attempted) × 100
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        This formula produces a percentage that represents the efficiency of a player from the free throw line.
                        For example, making 8 shots out of 10 attempts results in (8 / 10) × 100 = 80%.
                    </p>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Related Sports Calculators
                    </CardTitle>
                    <CardDescription>
                        Enhance your game analysis with these tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/category/sports-training/basketball-field-goal-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Field Goal Percentage</p>
                                            <p className="text-sm text-muted-foreground">FG% Efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-win-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Win Rate Calculator</p>
                                            <p className="text-sm text-muted-foreground">Team success metrics</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/batting-average-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Batting Average</p>
                                            <p className="text-sm text-muted-foreground">Cricket consistency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-goals-per-90-minutes-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Goals Per 90</p>
                                            <p className="text-sm text-muted-foreground">Scoring efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/category/sports-training/football-clean-sheet-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Shield className="h-5 w-5 text-indigo-600" />
                                        <div>
                                            <p className="font-medium">Clean Sheet %</p>
                                            <p className="text-sm text-muted-foreground">Defensive stats</p>
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
                    </div>
                </CardContent>
            </Card>

            {/* Complete Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
                {/* SEO & SCHEMA METADATA */}
                <meta itemProp="name" content="The Ultimate Guide to Free Throw Percentage (FT%): Mechanics, Philosophy, and Mastery" />
                <meta itemProp="description" content="A comprehensive analysis of basketball free throw percentage, covering calculation methods, shooting mechanics, psychological factors, and elite benchmarks." />
                <meta itemProp="keywords" content="basketball free throw percentage, FT% calculator, shooting mechanics, basketball stats, free throw line, basketball coaching" />
                <meta itemProp="author" content="MegaCalc Basketball Analytics Team" />
                <meta itemProp="datePublished" content="2026-02-15" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Ultimate Guide to Free Throw Percentage: Mastering the Charity Stripe</h2>
                <p className="text-lg italic text-muted-foreground">Unlock the secrets to efficient scoring from the free throw line, where games are often won or lost in the final seconds.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Free Throw Percentage?</a></li>
                    <li><a href="#why-it-matters" className="hover:underline">Why FT% is the Most Critical Efficiency Metric</a></li>
                    <li><a href="#calculation" className="hover:underline">The Mathematics of the Free Throw</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks: From High School to the NBA</a></li>
                    <li><a href="#psychology" className="hover:underline">The Psychology of the Free Throw</a></li>
                    <li><a href="#mechanics" className="hover:underline">Mechanics: The Anatomy of a Perfect Shot</a></li>
                    <li><a href="#hack-a-shaq" className="hover:underline">The "Hack-a-Player" Strategy and FT%</a></li>
                </ul>
                <hr />

                {/* DEFINITION */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Free Throw Percentage?</h2>
                <p><strong>Free Throw Percentage (FT%)</strong> is a basketball statistic that measures the ratio of successful free throws made to free throws attempted. It is the purest measure of a player's shooting mechanic because it is the only shot in the game that is taken from a static position, at a fixed distance (15 feet), without defense, and with a paused game clock.</p>
                <p>Unlike field goal percentage (FG%) or three-point percentage (3P%), where shot difficulty varies wildly based on defense, distance, and movement, the free throw is a controlled variable. This makes FT% an excellent indicator of a player's raw shooting touch and mental consistency.</p>

                {/* WHY IT MATTERS */}
                <h2 id="why-it-matters" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Why FT% is the Most Critical Efficiency Metric</h2>
                <p>While dunks and deep threes make highlight reels, free throws win games. Here is why consistent free throw shooting is invaluable:</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. The "Free" Points</h3>
                <p>Free throws are the most efficient shot in basketball. A 90% free throw shooter generates 1.8 points per possession (on a 2-shot foul), which is significantly higher than the average points per possession for even the best offenses (typically around 1.1 - 1.2 PPP).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Closing Games</h3>
                <p>In the final minutes of a close game, the trailing team will often foul to stop the clock. If a team has reliable free throw shooters (&gt;80%), they can "ice" the game by converting these opportunities. Conversely, poor FT% allows the opponent to stay in the game.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. Deterring Physical Play</h3>
                <p>Players who shoot well from the line discourage defenders from fouling them. If a slasher like James Harden or Jimmy Butler shoots 85%+, defenders must play cleaner defense, often conceding easier layups to avoid the foul.</p>

                <hr />

                {/* CALCULATION */}
                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Mathematics of the Free Throw</h2>
                <p>The calculation is straightforward but tells a complex story over time.</p>

                <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
                    <p className="font-mono text-xl text-destructive font-bold">
                        FT% = (Free Throws Made / Free Throws Attempted) × 100
                    </p>
                </div>

                <p><strong>Example:</strong> In the 2008-09 NBA season, José Calderón set a record (at the time) by making 151 out of 154 free throws.</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Made:</strong> 151</li>
                    <li><strong>Attempted:</strong> 154</li>
                    <li><strong>Calculation:</strong> (151 / 154) × 100 = 98.05%</li>
                </ul>

                <hr />

                {/* BENCHMARKS */}
                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Industry Benchmarks: What is a "Good" FT%?</h2>
                <p>Expectations for free throw percentage vary by position and level of play. Generally, guards are expected to shoot higher percentages than centers due to the nature of their skill sets.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">NBA / WNBA / Professional Standards</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Elite (90%+):</strong> Shooters like Stephen Curry, Steve Nash, and Elena Delle Donne. These players are automatic.</li>
                    <li><strong>Excellent (80-89%):</strong> Dependable starters and closing lineup players. Most point guards fall here.</li>
                    <li><strong>Average (70-79%):</strong> The league average typically hovers around 75-78%. Acceptable for forwards.</li>
                    <li><strong>Below Average (60-69%):</strong> Often defensive specialists or slashing wings. Can be a liability in clutch time.</li>
                    <li><strong>Poor (&lt;60%):</strong> Usually dominant centers (e.g., Shaq, Wilt Chamberlain). These players are targets for intentional fouling strategies.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">High School & College</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Good:</strong> &gt;70%</li>
                    <li><strong>Great:</strong> &gt;80%</li>
                    <li><strong>Exceptional:</strong> &gt;85%</li>
                </ul>

                <hr />

                {/* MECHANICS */}
                <h2 id="mechanics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Mechanics: The Anatomy of a Perfect Shot</h2>
                <p>Consistency is key. Every successful free throw shooter follows a strict routine that minimizes variables.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. The Routine</h3>
                <p>Whether it's three dribbles and a spin (Rip Hamilton) or blowing a kiss (Jason Kidd), the routine triggers muscle memory. It calms the heart rate and focuses the mind. The specific actions matter less than the <em>consistency</em> of the actions.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Stance and Alignment</h3>
                <p>Feet should be shoulder-width apart. Most shooters slightly stagger their feet, with the shooting foot forward. Hips and shoulders should be square to the basket.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">3. The Release (B.E.E.F.)</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>B (Balance):</strong> Stable base.</li>
                    <li><strong>E (Elbow):</strong> Elbow tucked in, aligned with the rim.</li>
                    <li><strong>E (Eyes):</strong> Locked on the target (front of the rim, back of the rim, or over the rim).</li>
                    <li><strong>F (Follow-through):</strong> Snap the wrist, hold the "gooseneck" until the ball hits the target.</li>
                </ul>

                <hr />

                {/* HACK A SHAQ */}
                <h2 id="hack-a-shaq" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The "Hack-a-Player" Strategy and FT%</h2>
                <p>The "Hack-a-Shaq" strategy involves intentionally fouling an opponent's worst free throw shooter to send them to the line, preventing the offense from attempting a 2 or 3-point field goal. In statistical terms, this strategy works if the player's expected points per possession (PPP) from free throws is lower than the team's average PPP.</p>

                <p>For example, if a team averages 1.1 PPP:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Shooter A (50% FT):</strong> 1.0 PPP (2 shots * 0.50). <em>Strategy works.</em></li>
                    <li><strong>Shooter B (60% FT):</strong> 1.2 PPP (2 shots * 0.60). <em>Strategy fails.</em></li>
                </ul>
                <p>This simple math dictates that a player generally needs to shoot above 55-60% to render the intentional foul strategy ineffective.</p>

                <hr />

                <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Summary</h2>
                <p>Free throw percentage is more than just a number; it is a direct reflection of a player's discipline, technique, and mental fortitude. By understanding the components of FT% and working tirelessly on mechanics and routine, any player can transform the charity stripe into a reliable source of offense.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                    <CardDescription>
                        Common questions about Free Throw Percentage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Calculate free throw percentage?</h4>
                            <p className="text-muted-foreground">
                                Divide the number of made free throws by the number of attempted free throws, then multiply by 100. Formula: (Made / Attempted) * 100.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the NBA average free throw percentage?</h4>
                            <p className="text-muted-foreground">
                                The NBA league average typically hovers between 75% and 78%. It has been slowly trending upwards as players become more skilled shooters across all positions.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does the backboard count as a made free throw?</h4>
                            <p className="text-muted-foreground">
                                Yes, if the ball enters the basket, it counts, regardless of whether it hit the backboard (bank shot) or rim first. However, almost all elite shooters aim for a "swish" without using the glass.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the highest career FT% in NBA history?</h4>
                            <p className="text-muted-foreground">
                                Stephen Curry is the all-time leader, with a career percentage exceeding 90%. Other legends include Steve Nash and Mark Price.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can you jump during a free throw?</h4>
                            <p className="text-muted-foreground">
                                Yes, you are allowed to jump. However, you cannot cross the free throw line until the ball touches the rim. Most NBA players do not jump to minimize variable movement, but younger players often jump to generate enough power.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why do big men struggle with free throws?</h4>
                            <p className="text-muted-foreground">
                                Several theories exist: larger hands making the ball feel like a tennis ball, steeper release angles due to height, and less emphasis on shooting during developmental years compared to guards.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a "Lane Violation"?</h4>
                            <p className="text-muted-foreground">
                                A lane violation occurs if a player enters the paint before the ball leaves the shooter's hands (for the shooter) or hits the rim (for rebounders). If the defense violates, the shooter gets another attempt (if missed). If the offense violates, the shot is voided.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does fatigue affect FT%?</h4>
                            <p className="text-muted-foreground">
                                Yes, studies show that free throw percentage drops slightly in the 4th quarter and overtime compared to the 1st quarter, primarily due to physical fatigue and mental pressure.
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
                                    <strong className="block text-primary mb-1">Players</strong>
                                    <span className="text-sm text-muted-foreground">Track consistency over a season or practice session.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Determine who should be on the floor in late-game situations.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate shooting touch potential in prospects.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Fantasy Managers</strong>
                                    <span className="text-sm text-muted-foreground">Analyze FT% impact for Category leagues (9-cat).</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-lg">
                                    <strong className="block mb-1">Case Study A: The Sniper</strong>
                                    <p className="text-sm text-muted-foreground">
                                        Player shoots 45/50 in a season. <br />
                                        FT% = 90%. <br />
                                        <strong>Impact:</strong> Highly trusted to handle the ball in clutch moments.
                                    </p>
                                </div>
                                <div className="p-4 bg-muted rounded-lg">
                                    <strong className="block mb-1">Case Study B: The Liability</strong>
                                    <p className="text-sm text-muted-foreground">
                                        Player shoots 45/100 in a season. <br />
                                        FT% = 45%. <br />
                                        <strong>Impact:</strong> Opponents will intentionally foul (Hack-a-Shaq) to regain possession.
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
                                The Basketball Free Throw Percentage Calculator is a vital tool for players and coaches to quantify shooting efficiency from the line.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                By maintaining a high FT%, players not only score easy points but also force defenses to play more cautiously, opening up the rest of the floor for their team.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
