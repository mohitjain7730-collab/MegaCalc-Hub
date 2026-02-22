import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Share2, Target, TrendingUp, Info, Calculator, BarChart3, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import FootballExpectedAssistsCalculatorInteractive from './football-expected-assists-calculator-interactive';

export default function FootballExpectedAssistsCalculator() {
    return (
        <div className="space-y-8">
            {/* SEO-Optimized Header */}
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Football Expected Assists (xA) Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate Expected Assists (xA) to evaluate playmaking quality, creativity, and the likelihood of a pass becoming a goal assist.
                </p>
            </div>

            <FootballExpectedAssistsCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Understanding the Inputs
                    </CardTitle>
                    <CardDescription>
                        Key factors that determine Expected Assists (xA) value
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                <Share2 className="h-4 w-4" />
                                Pass Type
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The technique controls the likelihood of assist.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Through Ball:</strong> Highest xA potential (Splits defense)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                    <span><strong>Cross:</strong> Lower xA due to defensive clearance rate</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                <Target className="h-4 w-4" />
                                Pass Destination
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Where the ball ends up is critical.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                    <span><strong>Six-Yard Box:</strong> Extremely high value (Tap-in zone)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                                    <span><strong>Outside Box:</strong> Low value (Requires long shot)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                                <Activity className="h-4 w-4" />
                                Pressure Level
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                Defensive pressure affects pass quality.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>None:</strong> Allows perfect weight/aim (High xA)</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <span><strong>High:</strong> Reduces accuracy and vision (Low xA)</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300">
                                <Users className="h-4 w-4" />
                                Receiver Context
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                                The state of the teammate receiving the ball.
                            </p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span><strong>Clear:</strong> Unmarked receiver has best scoring chance</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <span><strong>Marked:</strong> Receiver must beat individual defender first</span>
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
                            xA = Base Value × Pass Type × Origin Factor × Destination Factor × Pressure × Receiver Ctx
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Expected Assists (xA) assigns a probability (0 to 1) to every completed pass indicating how likely it is to become an assist. This calculation considers the starting and ending points of the pass, the type of pass (cross, through ball, etc.), and the defensive context. Professional models use historical data to weight these factors.
                    </p>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/20">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">Example Calculation:</p>
                        <p className="text-sm text-muted-foreground">
                            A through ball (0.35) from the half-space (1.3) into the box (1.0) with low pressure (1.1) to a moving receiver (1.1) = ~0.60 xA (High quality chance created).
                        </p>
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
                        Explore other football performance analysis tools
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href="/football-expected-goals-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Target className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="font-medium">Expected Goals (xG)</p>
                                            <p className="text-sm text-muted-foreground">Scoring probability</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-pass-accuracy-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Share2 className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="font-medium">Pass Accuracy</p>
                                            <p className="text-sm text-muted-foreground">Passing precision</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-possession-percentage-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Activity className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Possession %</p>
                                            <p className="text-sm text-muted-foreground">Ball control metrics</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/football-goal-conversion-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-orange-600" />
                                        <div>
                                            <p className="font-medium">Conversion Rate</p>
                                            <p className="text-sm text-muted-foreground">Finishing efficiency</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/match-impact-score-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <p className="font-medium">Match Impact</p>
                                            <p className="text-sm text-muted-foreground">Overall performance</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                        <Link href="/strike-rate-calculator" className="block">
                            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Calculator className="h-5 w-5 text-indigo-600" />
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
                <meta itemProp="name" content="The Comprehensive Guide to Expected Assists (xA): Evaluating Playmaker Creativity" />
                <meta itemProp="description" content="Master Expected Assists (xA), the advanced metric for evaluating football creativity. detailed breakdown of calculation methods, tactical applications, and how to identify elite playmakers." />
                <meta itemProp="keywords" content="expected assists, xA football, soccer analytics, playmaker stats, passing metrics, kevin de bruyne stats, chance creation analysis" />
                <meta itemProp="author" content="MegaCalc Football Analytics Team" />

                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Comprehensive Guide to Expected Assists (xA): Evaluating Playmaker Creativity</h2>
                <p className="text-lg italic text-muted-foreground">Unlocking the truth about creativity—why the "Assist" stat is flawed, and how xA reveals the true architects of the game.</p>

                {/* TABLE OF CONTENTS */}
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
                <ul className="list-disc ml-6 space-y-2 text-primary">
                    <li><a href="#definition" className="hover:underline">What is Expected Assists (xA)?</a></li>
                    <li><a href="#calculation" className="hover:underline">How xA is Calculated</a></li>
                    <li><a href="#vs-assists" className="hover:underline">xA vs. Traditional Assists</a></li>
                    <li><a href="#interpretation" className="hover:underline">Interpreting xA Values</a></li>
                    <li><a href="#benchmarks" className="hover:underline">Industry Benchmarks & Elite Standards</a></li>
                    <li><a href="#applications" className="hover:underline">Tactical Applications</a></li>
                    <li><a href="#improvement" className="hover:underline">Improving Your xA Output</a></li>
                    <li><a href="#limitations" className="hover:underline">Limitations of the Model</a></li>
                </ul>
                <hr />

                {/* CONTENT */}
                <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Expected Assists (xA)?</h2>
                <p><strong>Expected Assists (xA)</strong> is a football metric that measures the likelihood that a given pass will become a goal assist. It assigns a probability value (from 0 to 1) to every completed pass based on factors like pass type, location, and the resulting shot quality.</p>

                <p>Simply put: xA measures the quality of the chance created, regardless of whether the striker scores or misses.</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">Why Traditional "Assists" Are Flawed</h3>
                <p>The traditional assist statistic is dependent on the goalscorer. If a playmaker delivers a world-class through ball to a striker who misses an open net, the playmaker gets <strong>0 assists</strong>. If a playmaker passes 2 yards to a teammate who then dribbles 40 yards and scores a screamer, the playmaker gets <strong>1 assist</strong>.</p>
                <p>This creates a disconnection between <em>creativity</em> and <em>reward</em>. xA solves this by valuing the pass itself, not the outcome.</p>

                <hr />

                <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How Expected Assists (xA) is Calculated</h2>
                <p>Advanced data providers (like Opta, StatsBomb) use machine learning models trained on hundreds of thousands of historical passes. Key variables include:</p>

                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Pass Origin:</strong> Passes from the "Zone 14" (central area outside the box) or "Half-Spaces" are statistically more dangerous than passes from the wing.</li>
                    <li><strong>Pass Destination:</strong> A pass received in the six-yard box has a much higher xA than one received 25 yards out.</li>
                    <li><strong>Pass Type:</strong> Through balls that break defensive lines generally have higher xA than lateral passes or crosses (which have low completion rates).</li>
                    <li><strong>Defensive Pressure:</strong> Is the passer under pressure? Is the receiver marked?</li>
                    <li><strong>Phase of Play:</strong> Counter-attacks often generate higher xA due to disorganized defenses compared to set possession.</li>
                </ul>

                <div className="p-4 bg-muted border-l-4 border-primary my-4">
                    <p className="font-medium italic">"xA is essentially the expected goal (xG) value of the resulting shot, credited to the passer."</p>
                </div>

                <hr />

                <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting xA Values</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">Single Match Performance</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>0.00 - 0.10 xA:</strong> Little creative impact. Mostly safe passing.</li>
                    <li><strong>0.10 - 0.30 xA:</strong> Decent contribution. Created 1-2 half-chances.</li>
                    <li><strong>0.30 - 0.60 xA:</strong> Strong creative performance. Likely created one clear opportunity.</li>
                    <li><strong>0.60+ xA:</strong> Elite playmaking. Dominated the game creatively; arguably deserved an assist.</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mt-6">Season Cumulative Performance</h3>
                <p>Over a 38-game season:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>10.0+ xA:</strong> Elite Playmaker (Top 5 in the league).</li>
                    <li><strong>6.0 - 9.0 xA:</strong> Primary creator for a good team.</li>
                    <li><strong>3.0 - 5.0 xA:</strong> Solid contributor or secondary creator.</li>
                </ul>

                <hr />

                <h2 id="benchmarks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Industry Benchmarks & Elite Standards</h2>

                <p>To understand what "good" looks like, we look at the masters of the craft.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="p-4 border rounded-lg">
                        <h4 className="font-bold text-primary">Kevin De Bruyne (Man City)</h4>
                        <p className="text-sm text-muted-foreground">Consistently averages <strong>0.40 - 0.55 xA per 90</strong> minutes. This is the gold standard.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h4 className="font-bold text-primary">Trent Alexander-Arnold (Liverpool)</h4>
                        <p className="text-sm text-muted-foreground">Often tops <strong>0.35 xA per 90</strong> from a full-back position, highlighting elite crossing ability.</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h4 className="font-bold text-primary">Lionel Messi (Peak)</h4>
                        <p className="text-sm text-muted-foreground">Combined elite scoring with <strong>0.60+ xA per 90</strong>, effectively breaking most models.</p>
                    </div>
                </div>

                <hr />

                <h2 id="applications" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Tactical Applications</h2>

                <h3 className="text-xl font-semibold text-foreground mt-6">1. Identifying Undervalued Players</h3>
                <p>Scouts use xA to find players who are creating chances but are let down by poor strikers. If a midfielder has 10.0 xA but only 2 Assists, they are likely "unlucky" and represent a huge transfer market opportunity (undervalued).</p>

                <h3 className="text-xl font-semibold text-foreground mt-6">2. Analyzing Team Strategy</h3>
                <p>A team with high xA but low goals needs a new striker. A team with low xA but high goals is "overperforming" and likely riding a wave of luck or unsustainable finishing—a warning sign for coaches (regression to the mean).</p>

                <hr />

                <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Improving Your xA Output</h2>
                <p>For players wanting to increase their xA stats:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Target the "Golden Zone":</strong> Passes into the central area of the penalty box (between penalty spot and 6-yard box) yield the highest xA.</li>
                    <li><strong>Prioritize Cutbacks:</strong> Driven low crosses from the byline backwards (cutbacks) have incredibly high conversion rates compared to lofted crosses.</li>
                    <li><strong>Pass into Space, Not Feet:</strong> Through balls allow the striker to shoot with momentum, increasing xG (and thus xA).</li>
                    <li><strong>Occupy Half-Spaces:</strong> Operating in the channel between the center-back and full-back forces defensive errors and opens passing lanes.</li>
                </ul>

                <hr />

                <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations of the xA Model</h2>
                <p>While powerful, xA is not perfect:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Requires a Shot:</strong> Most models only calculate xA if the receiver actually takes a shot. If you play a perfect pass but your teammate slips before shooting, you get 0.00 xA.</li>
                    <li><strong>Defensive Errors:</strong> If a defender miskicks the ball straight to your striker for a tap-in, some models credit you with high xA despite it being luck.</li>
                    <li><strong>Secondary Assists:</strong> xA ignores the "pass before the pass" (pre-assist), often undervaluing deep-lying playmakers like Sergio Busquets or Toni Kroos.</li>
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
                        Common questions about Expected Assists (xA)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is the difference between an Assist and Expected Assist (xA)?</h4>
                            <p className="text-muted-foreground">
                                An Assist is a binary outcome—you either get it or you don't, depending on whether the goal is scored. xA is a probability metric measuring the <em>quality</em> of the pass. You can have high xA with zero assists (if strikers miss), or low xA with many assists (if teammates score difficult shots).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Does xA account for the finishing ability of the striker?</h4>
                            <p className="text-muted-foreground">
                                No, and that's the point. xA evaluates the <em>passer</em>, not the finisher. It assumes an "average" striker receives the ball. This isolates the playmaker's contribution from the striker's finishing performance.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is a "good" xA per game?</h4>
                            <p className="text-muted-foreground">
                                For a creative midfielder, 0.20 - 0.25 xA per game is solid. Above 0.40 xA consistently is elite (world-class level). For defenders or defensive midfielders, anything above 0.10 is respectable.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Why do I have 0 xA even though I made great passes?</h4>
                            <p className="text-muted-foreground">
                                Most xA models calculate values only when a shot occurs. If you play a great through ball but the striker is tackled before shooting, or chooses to pass again, no xA is registered for that action. (Some newer "Expected Threat" or xT models attempt to solve this).
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Do crosses give high xA?</h4>
                            <p className="text-muted-foreground">
                                Generally, no. Crosses have a low success rate compared to ground passes. A typical open-play cross might only have 0.02 - 0.05 xA unless it lands right on a striker's head in the six-yard box. Volume crossing is often an inefficient strategy.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Can xA be higher than 1.0 in a match?</h4>
                            <p className="text-muted-foreground">
                                Yes. xA is cumulative. If you create 5 chances each worth 0.20 xA, your total match xA is 1.0. This suggests you "should" have had 1 assist based on the quality of chances provided.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Who has the highest xA in history?</h4>
                            <p className="text-muted-foreground">
                                Since detailed tracking began (~2014), Lionel Messi, Kevin De Bruyne, and Thomas Müller consistently hold the highest season averages in Europe's top 5 leagues.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">Is xA useful for goalkeepers?</h4>
                            <p className="text-muted-foreground">
                                Rarely. However, modern keepers like Ederson or Alisson who play long accurate passes can accumulate small amounts of xA over a season, which is unusual and valuable for their position.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">How does "Game State" affect xA?</h4>
                            <p className="text-muted-foreground">
                                Leading teams often sit back, reducing their xA accumulation. Trailing teams push forward, often inflating their xA stats late in games. Context is vital when analyzing the numbers.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-lg mb-3">What is "Open Play xA" vs "Set Piece xA"?</h4>
                            <p className="text-muted-foreground">
                                set-piece xA comes from corners and free-kicks. Some players (like James Ward-Prowse) have massive xA totals dominated by set-pieces. Open Play xA is often considered a purer measure of creative ability in the flow of a match.
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
                                    <strong className="block text-primary mb-1">Playmakers (No. 10s)</strong>
                                    <span className="text-sm text-muted-foreground">Assess the real value of your final balls versus your actual assist tally.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Scouts</strong>
                                    <span className="text-sm text-muted-foreground">Identify creative talent that might be hiding behind poor team finishing stats.</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Coaches</strong>
                                    <span className="text-sm text-muted-foreground">Determine if your tactical system is creating high-quality chances or just "meaningless possession".</span>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <strong className="block text-primary mb-1">Full-Backs</strong>
                                    <span className="text-sm text-muted-foreground">Evaluate the efficiency of your crossing and cutbacks.</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-3">Real-World Examples</h3>
                            <div className="space-y-3">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-900/20">
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Case Study A: The "Unlucky" Creator</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Player A has <strong>12.0 xA</strong> over a season but only <strong>4 Assists</strong>.
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        <strong>Conclusion:</strong> Player A is doing an incredible job. The <strong>strikers are failing</strong>. Do NOT drop Player A; consider replacing the forwards.
                                    </p>
                                </div>

                                <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-900/20">
                                    <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">Case Study B: The "Over-performing" Creator</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Player B has <strong>2.0 xA</strong> but <strong>8 Assists</strong>.
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        <strong>Conclusion:</strong> Player B is feeding elite finishers who are scoring from difficult positions (e.g., Son Heung-min). Player B's assist numbers are likely to <strong>drop</strong> (regress) next season unless chance quality improves.
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
                        <Target className="h-6 w-6 text-primary mt-1 shrink-0" />
                        <div>
                            <h2 className="font-semibold text-lg mb-2">Summary</h2>
                            <p className="text-sm text-muted-foreground">
                                The Football Expected Assists (xA) Calculator allows you to look beyond the scoreboard. By analyzing pass type, location, and context, you can gain a deeper understanding of playmaking performance.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Whether you're a scout looking for the next creative genius or a coach analyzing your team's breakdown in the final third, xA provides the objective data needed to make better football decisions.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
