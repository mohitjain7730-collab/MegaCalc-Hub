import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertCircle, Info, Calculator, BarChart3, FunctionSquare, CheckCircle2, TrendingUp, Target, Users, Shield, Zap } from 'lucide-react';
import VolleyballAttackSuccessRateCalculatorInteractive from './volleyball-attack-success-rate-calculator-interactive';

export default function VolleyballAttackSuccessRateCalculator() {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold">Volleyball Attack Success Rate Calculator</h1>
                <p className="text-lg text-muted-foreground">
                    Calculate your volleyball attack success rate and hitting efficiency instantly. Understand what your kill percentage and error rate reveal about your offensive effectiveness at any competitive level.
                </p>
            </div>

            <VolleyballAttackSuccessRateCalculatorInteractive />

            {/* Understanding the Inputs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />Understanding the Inputs
                    </CardTitle>
                    <CardDescription>Every metric used in the Attack Success Rate calculation</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300"><Trophy className="h-4 w-4" />Kills (K)</h4>
                            <p className="text-sm text-muted-foreground">An attack that directly results in a point — the ball contacts the floor in the opponent&apos;s court or forces an unplayable touch.</p>
                        </div>
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300"><AlertCircle className="h-4 w-4" />Attack Errors (E)</h4>
                            <p className="text-sm text-muted-foreground">Attack hits out of bounds, into the net, or commits a fault giving the opponent a direct point. Does NOT include blocked attacks that stay in play.</p>
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/20">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-300"><BarChart3 className="h-4 w-4" />Total Attempts (TA)</h4>
                            <p className="text-sm text-muted-foreground">All attacks attempted — kills + errors + zero-attacks (blocked balls that stay in play). Every swing counts regardless of outcome.</p>
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
                        <p className="font-mono text-sm text-center font-bold">Attack Success Rate (%) = (Kills / Total Attempts) × 100</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg overflow-x-auto">
                        <p className="font-mono text-sm text-center font-bold">Hitting Efficiency = (Kills − Attack Errors) / Total Attempts</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        <strong>Hitting Efficiency</strong> is the gold-standard metric because it penalizes errors.
                        A player with 10 kills and 9 errors in 20 attempts has a 50% kill rate but only .050 efficiency —
                        revealing that errors nearly cancel out kills. Elite players consistently maintain efficiencies above .300.
                    </p>
                    <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded border border-primary/10">
                        <strong>Example:</strong> 15 kills, 4 errors, 38 total attempts →
                        Attack Success Rate = <strong>39.5%</strong> | Hitting Efficiency = <strong>.289</strong> — Above Average
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
                            { href: '/volleyball-serve-efficiency-calculator', icon: <Zap className="h-5 w-5 text-purple-600" />, title: 'Volleyball Serve Efficiency', desc: 'Aces, errors & serve rating' },
                            { href: '/baseball-batting-average-calculator', icon: <Trophy className="h-5 w-5 text-yellow-600" />, title: 'Baseball Batting Average', desc: 'Hits per at-bat metric' },
                            { href: '/basketball-field-goal-percentage-calculator', icon: <BarChart3 className="h-5 w-5 text-blue-600" />, title: 'Basketball FG%', desc: 'Shooting efficiency' },
                            { href: '/basketball-true-shooting-percentage-calculator', icon: <Shield className="h-5 w-5 text-indigo-600" />, title: 'Basketball TS%', desc: 'True shooting percentage' },
                            { href: '/football-goal-conversion-rate-calculator', icon: <Target className="h-5 w-5 text-green-600" />, title: 'Football Goal Conversion', desc: 'Shot to goal efficiency' },
                            { href: '/baseball-slugging-percentage-calculator', icon: <TrendingUp className="h-5 w-5 text-red-600" />, title: 'Baseball Slugging %', desc: 'Power & extra-base hits' },
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
                    The Complete Guide to Volleyball Attack Success Rate &amp; Hitting Efficiency
                </h2>

                <h3 className="text-2xl font-bold text-foreground mt-6">What Are Attack Success Rate and Hitting Efficiency?</h3>
                <p><strong>Attack Success Rate</strong> (Kill%) is the simplest offensive measure: the percentage of total attempts that result in a kill. If a player attempts 40 swings and records 16 kills, their attack success rate is 40%.</p>
                <p><strong>Hitting Efficiency</strong> (also called Hitting Percentage or PCT) subtracts errors from kills before dividing by total attempts — penalizing errors equally to rewarding kills. A hitting efficiency of .000 means kills exactly equal errors. Positive values (.200+) indicate net-positive attackers; negative values indicate attackers giving away more points than they earn.</p>

                <h3 className="text-2xl font-bold text-foreground mt-6">Why Hitting Efficiency Beats Kill Percentage</h3>
                <p>Kill percentage is easy but fundamentally incomplete. Player A (22 kills, 10 errors, 50 attempts) has 44% kill rate but .240 efficiency. Player B (18 kills, 3 errors, 50 attempts) has only 36% kill rate but .300 efficiency. Player B is the better attacker — their 7 fewer errors equal nearly two full service rotations of free points gifted to the opponent. Coaches and scouts universally prefer hitting efficiency as the primary offensive metric precisely because it captures this error cost.</p>

                <h3 className="text-2xl font-bold text-foreground mt-6">Benchmark Standards by Level</h3>
                <div className="space-y-3">
                    <div className="p-4 bg-muted rounded-lg">
                        <strong className="text-foreground">NCAA Division I Women&apos;s Volleyball:</strong>
                        <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
                            <li><strong>.350+:</strong> Elite — All-American territory</li>
                            <li><strong>.280–.350:</strong> Above Average — Regular starter on top-25 program</li>
                            <li><strong>.200–.280:</strong> Average — Competitive but not dominant</li>
                            <li><strong>.120–.200:</strong> Below Average — high errors or poor shot selection</li>
                            <li><strong>Under .120:</strong> Significant efficiency problem</li>
                        </ul>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <strong className="text-foreground">Professional &amp; Olympic Level:</strong>
                        <p className="text-sm mt-1">Efficiencies are often <em>lower</em> than college averages despite higher individual skill — elite blocking, compressed tempos, and serve pressure compromise set quality constantly. A .250 efficiency at Olympic level is competitive; .300+ is exceptional.</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                        <strong className="text-foreground">High School Varsity:</strong>
                        <p className="text-sm mt-1">Elite varsity attackers hit .300–.400, benefiting from less consistent blocking. Standard competitive varsity efficiency: .180–.280. JV/developmental: .100–.200 as shot variety and decision-making develops.</p>
                    </div>
                </div>

                <h3 className="text-2xl font-bold text-foreground mt-6">Key Factors That Influence Efficiency</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Set Quality:</strong> The single largest external factor. A perfect pin set gives the attacker the entire court; a tight or off-net set dramatically reduces attack angles and allows blockers more setup time.</li>
                    <li><strong>Blocking Quality:</strong> A well-timed two-person block physically deflects otherwise-kills. Always compare efficiency within similar competitive levels.</li>
                    <li><strong>Approach Mechanics:</strong> The four-step approach generates hip rotation and arm swing velocity. Timing errors (too early or late) reduce jump height, arm swing speed, and available attack angles.</li>
                    <li><strong>Wrist Snap at Contact:</strong> Top-spin from wrist snap drops the ball inside the court after crossing the net at high velocity. Flat contact produces more long errors.</li>
                    <li><strong>Shot Variety:</strong> Single-shot attackers are easily defended within 2 rotations. Elite attackers have 3–5 go-to shots and read the block during approach to select the highest-percentage option.</li>
                </ul>

                <h3 className="text-2xl font-bold text-foreground mt-6">Strategies to Improve Your Hitting Efficiency</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Tool Off the Block:</strong> Attacking the outside hand of the blocker to deflect the ball out of bounds. Nearly impossible to defend and dramatically reduces unforced errors.</li>
                    <li><strong>Two-Strike Approach:</strong> On difficult/compromised sets, reduce swing speed and focus on placement (rollshot, cut) rather than power — the same kill value for far fewer errors.</li>
                    <li><strong>Film Analysis:</strong> Identify error patterns. Cross-court errors = late contact; line errors = early contact; net errors = approaching too far inside.</li>
                    <li><strong>Zone Targeting in Practice:</strong> Place targets in specific court locations. Hit-accuracy drills build spatial shot consistency that translates to matches.</li>
                    <li><strong>Attack at the Apex:</strong> Contact the ball at peak jump. Late contact removes topspin snap, producing flat attacks that travel long.</li>
                </ul>

                <h3 className="text-2xl font-bold text-foreground mt-6">Position-Specific Efficiency Expectations</h3>
                <ul className="list-disc ml-6 space-y-2">
                    <li><strong>Middle Blocker (MB):</strong> Highest efficiency (.350–.500+) — attack quick sets with minimal blocker reaction time. Lower total volume.</li>
                    <li><strong>Outside Hitter (OH):</strong> Highest volume, lower efficiency target (.200–.320). Receives most swings including compromised serve-receive situations.</li>
                    <li><strong>Opposite Hitter (OPP):</strong> Similar volume to OH, slightly higher target (.230–.350). Right-side attacks are harder for left-handed blockers to read.</li>
                </ul>
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
                        { q: 'What is a good hitting efficiency in volleyball?', a: 'In NCAA Division I women\'s volleyball, .280+ is above average; .350+ is elite. In high school, .250+ is excellent. At the professional/Olympic level, .220–.280 is competitive. Men\'s volleyball benchmarks are higher — .300 is average at top college level, .350+ is elite.' },
                        { q: 'What does a negative hitting efficiency mean?', a: 'A negative efficiency means attack errors exceed kills — a net-negative contributor on the attack line. Over one match this can reflect poor sets or a small sample. Over a full season, sustained negative efficiency requires mechanical or tactical correction.' },
                        { q: 'How is a "zero" attack (blocked ball) counted?', a: 'A blocked ball that stays in play counts as a zero-attack — not a kill, not an error — but it still counts in total attempts (TA). Many casual scorekeepers skip zero-attacks, causing TA to be undercounted and efficiency to be artificially inflated.' },
                        { q: 'Should I prioritize reducing errors or increasing kills?', a: 'Error reduction has bigger impact for most developing players. Each error costs 2 efficiency points (one from numerator, one does not go to kills). A player who reduces errors from 8 to 4 per 40 attempts (keeping 14 kills) improves efficiency from .150 to .250 — a dramatic leap without hitting one more kill.' },
                        { q: 'How does setter distribution affect my hitting efficiency?', a: 'Enormously. Set location is the largest single predictor of attack efficiency beyond attacker skill. Sets within 12 inches of the net maximize attack angles. Sets 3+ feet off the net give blockers time to close and raise error rates. Poor sets can suppress even gifted attackers by .060–.080 efficiency points.' },
                        { q: 'How many attempts are needed for a statistically meaningful efficiency number?', a: '50+ attempts is the minimum for meaningful single-player efficiency; 150+ is reliable for season evaluation. Below 50, one hot or cold game can swing efficiency by .100+. Always interpret efficiency alongside total attempts.' },
                        { q: 'How do I track attack statistics during a match?', a: 'Standard coding: # (kill), / (zero-attack), - (out), = (net error). In youth settings, a simple three-column tally (K, E, TA) works well. Apps like VolleyMetrics, Hudl, or TeamSnap automate stat tracking from video for organized teams.' },
                        { q: 'Does hitting efficiency depend on my position?', a: 'Yes significantly. Middles have the highest expected efficiency (.350+) because they attack quick sets. Outside hitters have lower targets (.200–.280) because they take the most high-pressure swings on compromised sets. Always compare players at the same position.' },
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
                            { title: 'Volleyball Players', desc: 'Track your personal efficiency progression across a season. Identify whether errors or low kill rates are the primary constraint and direct training accordingly.' },
                            { title: 'Volleyball Coaches', desc: 'Monitor each attacker\'s efficiency by rotation and set type. Identify which players are net-positive and which need distribution changes or tactical coaching.' },
                            { title: 'College Recruiting Scouts', desc: 'Evaluate attacking contribution beyond raw kill numbers. Efficiency reveals true offensive quality independent of set volume.' },
                            { title: 'Sports Parents & Fans', desc: 'Understand true offensive contribution beyond the kill count announced during matches. Efficiency is the coach\'s actual evaluation metric.' },
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
                                The Volleyball Attack Success Rate Calculator delivers two essential metrics — kill percentage and hitting efficiency — that together provide the most complete picture of an attacker&apos;s offensive contribution available from standard match statistics. Kill percentage shows raw productivity; hitting efficiency shows net value after accounting for error cost. Whether you are a player tracking development, a coach optimizing lineups, or a scout assessing talent, hitting efficiency is the foundational metric for offensive evaluation in competitive volleyball at every level.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
