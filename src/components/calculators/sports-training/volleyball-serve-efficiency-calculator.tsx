import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, TrendingUp, Target, Users, Shield, Zap } from 'lucide-react';
import VolleyballServeEfficiencyCalculatorInteractive from './volleyball-serve-efficiency-calculator-interactive';

export default function VolleyballServeEfficiencyCalculator() {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Volleyball Serve Efficiency Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your volleyball serve efficiency, ace rate, and in-bound serve percentage instantly. Discover how your serving contributes to — or costs — your team points at any competitive level.
                </p>
            </div>

            <VolleyballServeEfficiencyCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />Understanding the Inputs
                    </CardTitle>
                    <CardDescription>Every metric used in the Serve Efficiency calculation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300"><Trophy className="h-4 w-4" />Aces</h4>
                            <p className="text-sm text-muted-foreground">A serve that the receiving team cannot pass in a way that allows a legal set, resulting in a direct point for the serving team. Includes serves landing in-bounds untouched, and serves that the receiver contacts but cannot control.</p>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300"><AlertCircle className="h-4 w-4" />Service Errors</h4>
                            <p className="text-sm text-muted-foreground">Serves that go directly into the net, out of bounds (long, wide, or short), or otherwise result in an immediate point for the opponent. Does NOT include serves that are passed in — even if the resulting rally is lost.</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300"><BarChart3 className="h-4 w-4" />Total Serves</h4>
                            <p className="text-sm text-muted-foreground">All serving attempts in the period being analyzed — aces + errors + all in-play serves (even those perfectly passed). Every rotation serve counts regardless of outcome.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formula Used */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FunctionSquare className="h-5 w-5" />Formulas Used</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center font-bold">Serve Efficiency = (Aces − Service Errors) / Total Serves</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center font-bold">Ace Rate (%) = (Aces / Total Serves) × 100</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center font-bold">In-Bound Rate (%) = ((Total Serves − Errors) / Total Serves) × 100</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        <strong>Serve Efficiency</strong> mirrors hitting efficiency — it rewards aces and equally penalizes errors.
                        A server with 8 aces and 8 errors has a .000 efficiency: their service weapon is perfectly neutralized by their errors.
                        Elite servers maximize aces while keeping errors minimal, producing strong positive efficiency scores.
                    </p>
                    <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded border border-primary/10">
                        <strong>Example:</strong> Serve 40 times with 6 aces and 4 errors →
                        Efficiency = (6 − 4) / 40 = <strong>+.050</strong> | Ace Rate = <strong>15%</strong> | In-Bound Rate = <strong>90%</strong>
                    </div>
                </CardContent>
            </Card>

            {/* Related Calculators */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" />Related Sports Calculators</CardTitle>
                    <CardDescription>Explore other performance metrics across sports</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { href: '/category/sports-training/volleyball-attack-success-rate-calculator', icon: <Zap className="h-5 w-5 text-orange-600" />, title: 'Volleyball Attack Success Rate', desc: 'Kill% & hitting efficiency' },
                            { href: '/category/sports-training/tennis-first-serve-percentage-calculator', icon: <Trophy className="h-5 w-5 text-yellow-600" />, title: 'Tennis First Serve %', desc: 'Serve consistency & control' },
                            { href: '/category/sports-training/tennis-serve-accuracy-calculator', icon: <Target className="h-5 w-5 text-green-600" />, title: 'Tennis Serve Accuracy', desc: 'Placement & precision' },
                            { href: '/category/sports-training/tennis-aces-per-match-calculator', icon: <Shield className="h-5 w-5 text-blue-600" />, title: 'Tennis Aces Per Match', desc: 'Serving dominance metric' },
                            { href: '/category/sports-training/baseball-batting-average-calculator', icon: <BarChart3 className="h-5 w-5 text-red-600" />, title: 'Baseball Batting Average', desc: 'Hitting consistency metric' },
                            { href: '/category/sports-training/basketball-field-goal-percentage-calculator', icon: <TrendingUp className="h-5 w-5 text-indigo-600" />, title: 'Basketball FG%', desc: 'Shooting efficiency' },
                        ].map((c, i) => (
                            <Link key={i} href={c.href} className="block">
                                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            {c.icon}
                                            <div>
                                                <p className="font-medium">{c.title}</p>
                                                <p className="text-sm text-muted-foreground">{c.desc}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Complete Guide Section */}
            <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4">
                    The Complete Guide to Volleyball Serve Efficiency
                </h2>

                <h3 className="text-2xl font-bold text-foreground mt-6">What Is Serve Efficiency?</h3>
                <p>Serve efficiency is a direct analog to hitting efficiency — it measures the <em>net contribution</em> of a server&apos;s serving to the team&apos;s score. It rewards aces (direct points) and penalizes service errors (direct points given away) proportional to the total serving volume.</p>
                <p>A serve efficiency of .000 means a server&apos;s aces and errors are exactly equal — a break-even server. Positive efficiency (.100+) indicates a server who creates more direct points than they give away. Negative efficiency means errors are undermining the team&apos;s serve-line performance. This metric forces servers to ask not just &quot;How many aces did I have?&quot; but &quot;Did my aces outweigh my giveaways?&quot;</p>

                <h3 className="text-2xl font-bold text-foreground mt-6">Why Serve Efficiency Captures What Ace Rate Misses</h3>
                <p>Ace rate alone can be misleading. A server with 10 aces in 40 attempts (25% ace rate) sounds impressive — but if they also had 12 service errors, their efficiency is (10-12)/40 = -.050, meaning they gave away more points than they earned. A server with 5 aces and 2 errors (.075 efficiency) contributes more to the team&apos;s score line despite the lower ace count. Just as hitting efficiency corrects for error cost in attacking, serve efficiency corrects for it in serving.</p>
                <p>This is especially important at the tactical level. Coaches who track only ace rate may over-rely on aggressive servers whose error rates undermine the served advantage. Serve efficiency reveals which servers are actual weapons and which are liabilities despite their ace highlight counts.</p>

                <h3 className="text-2xl font-bold text-foreground mt-6">Benchmark Standards</h3>
                <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                        <strong className="text-foreground">NCAA Division I Volleyball:</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                            <li><strong>.200+:</strong> Elite server — consistent ace threat with excellent error control</li>
                            <li><strong>.120–.200:</strong> Above average — meaningful ace production, sustainable error rate</li>
                            <li><strong>.060–.120:</strong> Average — competitive serve with moderate ace contribution</li>
                            <li><strong>.000–.060:</strong> Below average — serve is not creating pressure relative to error cost</li>
                            <li><strong>Negative:</strong> Serve is a liability — errors exceeding aces</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <strong className="text-foreground">In-Bound Rate Benchmarks:</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                            <li><strong>92%+:</strong> Elite control — only 1 error per ~12 serves</li>
                            <li><strong>87–92%:</strong> Above average — acceptable error rate for aggressive serving</li>
                            <li><strong>82–87%:</strong> Average — borderline, edge of acceptable zone</li>
                            <li><strong>Under 82%:</strong> Too many free points — error rate undermines serves-in-play value</li>
                        </ul>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-foreground mt-6">Types of Serves and Efficiency Implications</h3>
                <ul className="list-disc ml-6 space-y-3">
                    <li><strong>Jump Float Serve:</strong> The dominant serve at elite competitive levels. The ball moves unpredictably left/right due to minimal spin — making it the highest risk-adjusted serve. When mastered, it produces ace rates of 8–15% with in-bound rates of 90%+. The jump float is the best serve for sustained high efficiency.</li>
                    <li><strong>Jump Topspin Serve:</strong> High velocity and predictable arc. Devastating when high accuracy is maintained (85%+ in-bound), but error rates tend to be higher than the float. Produces aces through sheer velocity rather than movement. Good jump topspin servers average 10–20% ace rates at lower in-bound consistency.</li>
                    <li><strong>Standing Float Serve:</strong> Used at youth and beginner levels. Consistent in-bound rates (92%+) but lower ace production (3–7%). Best for building positive efficiency through error minimization rather than ace accumulation.</li>
                    <li><strong>Short Serve (Dump Serve):</strong> A placement serve targeting the seam between front-row attackers and the libero in serve-reception formation. Very low error rate; ace rate depends on opponent&apos;s reception formation gaps. Excellent for efficiency-focused server rotation management.</li>
                </ul>

                <h3 className="text-2xl font-bold text-foreground mt-6">Serving Strategy: Pressure vs. Safety</h3>
                <p>The central tension in volleyball serving is the <strong>aggressive serve vs. safe serve tradeoff</strong>. Serving harder or to smaller targets increases ace rate but also raises error risk. The serve efficiency metric helps quantify this tradeoff in real numbers rather than intuition.</p>
                <p>Research consistently shows that the optimal serving strategy at elite levels is <em>moderate aggressiveness</em> — not maximum pace/placement difficulty. The reason: a tough in-play serve that forces a second-contact set (rather than a first-touch perfect pass) significantly undermines the opponent&apos;s offensive efficiency, even without earning an ace. These pressure serves don&apos;t show up in ace counts, but they are arguably the most important serves in high-level play. Serve efficiency therefore captures only part of the serving value picture — the direct ace/error contribution — not the reception-pressure component.</p>

                <h3 className="text-2xl font-bold text-foreground mt-6">Zone Targeting and Tactical Serving</h3>
                <p>Elite servers don&apos;t just serve hard — they serve <em>smart</em>. Volleyball court zones (1 through 6) each present different reception challenges. Common high-value targets include:</p>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Zone 1 (back right):</strong> Forces the setter to run across the court to take the pass, disrupting transition to offense.</li>
                    <li><strong>Zone 5 (back left):</strong> Targets the seam between the libero and the left-side receiver — often the most difficult reception zone.</li>
                    <li><strong>Seam between Zone 6 and Zone 1:</strong> Forces a decision between two players, increasing reception error probability.</li>
                    <li><strong>Short Zone 2/3:</strong> The dump serve that catches the front-row attackers flat-footed — requires quick reaction from players not focused on ball-tracking on the serve reception side.</li>
                </ul>

                <h3 className="text-2xl font-bold text-foreground mt-6">Serve Efficiency in Rotation Analysis</h3>
                <p>One of the most powerful uses of serve efficiency data is by-rotation analysis. Different players serve in each rotation, and the team&apos;s serving efficiency varies significantly by rotation. A team might have elite serving efficiency in rotation 1 (where the jump float specialist serves) and negative efficiency in rotation 4 (where a weaker server rotates to the service line). Coaching decisions about substitution timing, second-server deployment, and opponent scouting (which rotations struggle to pass their server&apos;s serve type) all depend on this data.</p>
            </section>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {[
                        { q: 'What is a good serve efficiency in volleyball?', a: 'In NCAA Division I volleyball, .120+ is above average, .200+ is elite. At the high school level, .080–.150 is solid. At the professional level, efficiencies run lower (.050–.150) because reception specialists are elite passers. Always pair efficiency with in-bound rate context: a .150 efficiency with an 85% in-bound rate is more impressive than the same efficiency at 95% in-bound.' },
                        { q: 'Does serve efficiency account for reception pressure from in-play serves?', a: 'No — serve efficiency only measures direct point impact (aces minus errors). A serve that forces a difficult pass, disrupts the setter&apos;s tempo, and leads to a sideout loss is not captured by efficiency. This is why analysts at elite levels pair serve efficiency with reception disruption rates (tracking the quality of opponent passes resulting from in-play serves) for a complete picture.' },
                        { q: 'What is the difference between an ace and a service winner?', a: 'An ace is strictly defined: the receiving team cannot legally set the ball after the serve touches. If the opponent contacts the serve but cannot control it into a playable set, it is an ace. A "service winner" is a broader casual term that sometimes includes aces plus situations where the rally is very short after a tough serve — not a formal stats distinction.' },
                        { q: 'How does serve type (float vs. topspin) affect efficiency?', a: 'Jump float serves tend to produce the best sustained efficiency because their movement makes them accurate enough to stay in-bounds at high rates while still generating aces through unpredictability. Jump topspin serves have higher peak ace rates but higher error rates, leading to lower sustained efficiency. Standing floats produce the most consistent in-bound rates but the lowest ace rates.' },
                        { q: 'Is it better to have fewer errors or more aces to improve efficiency?', a: 'This depends on your starting point. If your error rate is above 15%, reducing errors has more impact per reduced error than adding aces. Each error reduction improves efficiency by 1/TA. If your error rate is already under 8%, adding aces matters more for efficiency gains. Mathematically, aces and errors have equal weight in the efficiency formula — but risk-adjusted for sustainability, error reduction is usually the safer and faster efficiency improvement.' },
                        { q: 'How do I count serves when a rotation includes multiple servers (substitutions)?', a: 'Track serves by individual player, not by rotation. Each server&apos;s aces, errors, and total serves should be tallied separately, then combined for team totals if needed. Per-player efficiency is the most actionable coaching metric. Team serve efficiency can be calculated by summing all player stats into one aggregate calculation.' },
                        { q: 'What sample size is needed for a meaningful serve efficiency number?', a: 'Similar to hitting efficiency — 30+ serves for a single-game figure (treat as directional only), 80+ for a weekly estimate, and 150+ for reliable season-level evaluation. A single match can produce misleadingly high or low efficiency due to opponent reception variance and natural variance in serving contact quality.' },
                        { q: 'Does the calculator account for in-play serves that hurt the opponent\'s passing?', a: 'No — this calculator measures direct point contribution only (aces and errors). Reception disruption from in-play serves is a separate advanced metric requiring Data Volley or similar reception-coding system. Even without that data, efficiency is the best single indirect measure of serving contribution available from standard scorebook stats.' },
                    ].map((item, i) => (
                        <div key={i}>
                            <h4 className="font-semibold text-lg mb-3">{item.q}</h4>
                            <p className="text-muted-foreground">{item.a}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Usage Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /><h2 className="text-xl font-semibold">Who Uses This Calculator?</h2></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Volleyball Players', desc: 'Track serving efficiency across a season to monitor whether aggressive serving tactics are net-positive or net-negative for the team\'s serve-line results.' },
                            { title: 'Coaches & Assistants', desc: 'Identify which rotation\'s serving is a liability and which is a weapon. Use efficiency by player to make evidence-based substitution and serving-order decisions.' },
                            { title: 'Scouting Analysts', desc: 'Evaluate opponent serving depth for tournament matchup planning. Teams with negative serve efficiency in multiple rotations can be targeted with risky serve-receive formations.' },
                            { title: 'Recruiting Coordinators', desc: 'Evaluate a recruit\'s true serving contribution beyond ace highlight reels. Efficiency over a full season reveals serving sustainability and error discipline.' },
                        ].map((u, i) => (
                            <div key={i} className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                <strong className="block text-primary mb-1">{u.title}</strong>
                                <span className="text-sm text-muted-foreground">{u.desc}</span>
                            </div>
                        ))}
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
                                The Volleyball Serve Efficiency Calculator delivers three connected metrics — serve efficiency score, ace rate, and in-bound serve percentage — that together reveal the true impact of a server on the team&apos;s point-scoring contribution. Unlike simple ace counts, serve efficiency accounts for the cost of service errors, giving a balanced picture of net serving value.
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Use this calculator after every match to track whether serving is a consistent weapon or an inconsistent liability. Combine the data with reception-pressure tracking for the most complete picture of serving contribution at the competitive level.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
