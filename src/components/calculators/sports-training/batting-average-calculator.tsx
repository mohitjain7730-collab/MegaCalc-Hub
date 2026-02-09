'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, AlertCircle, Target, Info, Calculator, BarChart3, Shield, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  runsScored: z.number().min(0),
  timesOut: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function BattingAverageCalculator() {
  const [result, setResult] = useState<{
    average: number;
    interpretation: string;
    performanceLevel: string;
    recommendation: string;
    rating: string;
    insights: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      runsScored: undefined,
      timesOut: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.runsScored == null || v.timesOut == null) return null;
    if (v.timesOut === 0) return v.runsScored; // Not out scenario
    return v.runsScored / v.timesOut;
  };

  const interpret = (avg: number) => {
    if (avg >= 50) return 'World-class batting performance with exceptional consistency.';
    if (avg >= 40) return 'Elite batting average indicating top-tier performance.';
    if (avg >= 30) return 'Strong batting performance with good consistency.';
    if (avg >= 20) return 'Moderate batting average - room for improvement.';
    return 'Below-average performance - requires significant improvement.';
  };

  const getPerformanceLevel = (avg: number) => {
    if (avg >= 50) return 'World Class';
    if (avg >= 40) return 'Elite';
    if (avg >= 30) return 'Good';
    if (avg >= 20) return 'Average';
    return 'Below Average';
  };

  const getRecommendation = (avg: number) => {
    if (avg >= 50) return 'Maintain current form and focus on converting starts into big scores.';
    if (avg >= 40) return 'Excellent performance. Work on consistency in pressure situations.';
    if (avg >= 30) return 'Focus on shot selection and building longer innings.';
    if (avg >= 20) return 'Work on technique and temperament to improve consistency.';
    return 'Fundamental technical work needed. Focus on basics and match awareness.';
  };

  const getRating = (avg: number) => {
    if (avg >= 50) return 'Outstanding';
    if (avg >= 40) return 'Excellent';
    if (avg >= 30) return 'Good';
    if (avg >= 20) return 'Fair';
    return 'Needs Improvement';
  };

  const getInsights = (avg: number) => {
    const insights = [];
    if (avg >= 50) {
      insights.push('Exceptional run-scoring ability');
      insights.push('High consistency and reliability');
      insights.push('Match-winning capability');
    } else if (avg >= 40) {
      insights.push('Strong technical foundation');
      insights.push('Reliable middle-order performer');
      insights.push('Good temperament under pressure');
    } else if (avg >= 30) {
      insights.push('Solid batting foundation');
      insights.push('Capable of building partnerships');
      insights.push('Potential for higher performance');
    } else if (avg >= 20) {
      insights.push('Developing batting skills');
      insights.push('Inconsistent performance patterns');
      insights.push('Requires technical refinement');
    } else {
      insights.push('Significant improvement needed');
      insights.push('Focus on basic technique');
      insights.push('Build confidence through practice');
    }
    return insights;
  };

  const getConsiderations = (avg: number) => {
    const considerations = [];
    considerations.push('Format of cricket affects average (Test vs ODI vs T20)');
    considerations.push('Quality of opposition impacts statistics');
    considerations.push('Pitch and weather conditions vary significantly');
    considerations.push('Role in batting order affects expectations');
    considerations.push('Not-out innings inflate the average');
    return considerations;
  };

  const onSubmit = (values: FormValues) => {
    const avg = calculate(values);
    if (avg !== null) {
      setResult({
        average: avg,
        interpretation: interpret(avg),
        performanceLevel: getPerformanceLevel(avg),
        recommendation: getRecommendation(avg),
        rating: getRating(avg),
        insights: getInsights(avg),
        considerations: getConsiderations(avg)
      });
    }
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Batting Statistics
          </CardTitle>
          <CardDescription>
            Enter your runs scored and times dismissed to calculate batting average
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="runsScored"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Total Runs Scored
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 1250"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timesOut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Times Dismissed
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 30"
                          {...field}
                          value={field.value ?? ''}
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Batting Average
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Trophy className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Batting Average</CardTitle>
                  <CardDescription>Performance Analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{result.average.toFixed(2)}</p>
                <p className="text-lg text-muted-foreground mt-2">{result.interpretation}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold">Performance Level</p>
                  <Badge variant={result.performanceLevel === 'World Class' ? 'default' : result.performanceLevel === 'Elite' ? 'secondary' : result.performanceLevel === 'Good' ? 'outline' : 'destructive'}>
                    {result.performanceLevel}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold">Overall Rating</p>
                  <Badge variant={result.rating === 'Outstanding' ? 'default' : result.rating === 'Excellent' ? 'secondary' : result.rating === 'Good' ? 'outline' : 'destructive'}>
                    {result.rating}
                  </Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold">Runs Per Dismissal</p>
                  <p className="text-lg font-bold">{result.average.toFixed(1)}</p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recommendation:</strong> {result.recommendation}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Smart Actions & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-primary">
                  <Target className="h-6 w-6" />
                  Performance Insights
                </CardTitle>
                <CardDescription>Key strengths and indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{insight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="h-full border-red-100 bg-red-50/10 dark:border-red-900/20 dark:bg-red-900/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-red-600 dark:text-red-400">
                  <AlertCircle className="h-6 w-6" />
                  Important Considerations
                </CardTitle>
                <CardDescription>Factors affecting accuracy</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.considerations.map((consideration, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">{consideration}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components required for batting average calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Trophy className="h-4 w-4" />
                Total Runs Scored
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The cumulative number of runs a batsman has scored across all innings in a given period or format.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Includes all runs from boundaries, singles, and extras credited to the batsman</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Counted across completed and not-out innings</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <AlertCircle className="h-4 w-4" />
                Times Dismissed
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The number of times a batsman has been dismissed (got out) during the period being analyzed.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Does NOT include not-out innings</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>All dismissal types count (bowled, caught, LBW, run out, etc.)</span>
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
              Batting Average = Total Runs Scored / Times Dismissed
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Measures a batsman's consistency by calculating the average number of runs scored per dismissal. A higher average indicates better performance and reliability.
          </p>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Related Cricket Calculators
          </CardTitle>
          <CardDescription>
            Explore other cricket performance analysis tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/category/sports-training/bowling-average-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Bowling Average</p>
                      <p className="text-sm text-muted-foreground">Bowling performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/sports-training/strike-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Strike Rate</p>
                      <p className="text-sm text-muted-foreground">Scoring speed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/sports-training/bowling-economy-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Economy Rate</p>
                      <p className="text-sm text-muted-foreground">Runs conceded per over</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/sports-training/net-run-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Net Run Rate</p>
                      <p className="text-sm text-muted-foreground">Team performance metric</p>
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
            <Link href="/category/sports-training/fantasy-points-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-indigo-600" />
                    <div>
                      <p className="font-medium">Fantasy Points</p>
                      <p className="text-sm text-muted-foreground">Fantasy cricket scoring</p>
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
        <meta itemProp="name" content="The Complete Guide to Cricket Batting Average: Calculation, Interpretation, and Performance Analysis" />
        <meta itemProp="description" content="An expert guide to understanding batting average in cricket, including calculation methods, performance benchmarks, format-specific variations, and how it compares to other batting metrics like strike rate." />
        <meta itemProp="keywords" content="batting average cricket, cricket statistics, batting performance metrics, test cricket average, ODI batting average, T20 batting stats, cricket player analysis" />
        <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
        <meta itemProp="datePublished" content="2026-02-09" />

        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Cricket Batting Average: Measuring Consistency and Performance</h1>
        <p className="text-lg italic text-muted-foreground">Master the fundamental metric that defines a batsman's reliability, consistency, and overall contribution to the team across all formats of cricket.</p>

        {/* TABLE OF CONTENTS */}
        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Batting Average in Cricket?</a></li>
          <li><a href="#calculation" className="hover:underline">How to Calculate Batting Average</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting Batting Average: What's Good?</a></li>
          <li><a href="#formats" className="hover:underline">Format-Specific Benchmarks (Test, ODI, T20)</a></li>
          <li><a href="#limitations" className="hover:underline">Limitations and Context</a></li>
          <li><a href="#comparison" className="hover:underline">Batting Average vs Strike Rate</a></li>
          <li><a href="#improvement" className="hover:underline">Strategies to Improve Your Average</a></li>
        </ul>
        <hr />

        {/* WHAT IS BATTING AVERAGE */}
        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">What is Batting Average in Cricket?</h2>
        <p>The <strong>Batting Average</strong> is the most fundamental and widely recognized statistic in cricket for measuring a batsman's performance. It represents the average number of runs a batsman scores before getting dismissed.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Core Metric of Consistency</h3>
        <p>Unlike sports where scoring is frequent, cricket dismissals are relatively rare and significant events. A batsman's ability to accumulate runs before losing their wicket is the essence of batting skill. The batting average quantifies this ability into a single, comparable number.</p>

        <p>A higher batting average indicates:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Greater consistency in scoring runs</li>
          <li>Better technique and shot selection</li>
          <li>Stronger temperament under pressure</li>
          <li>Higher value to the team's total score</li>
        </ul>

        <hr />

        {/* CALCULATION */}
        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">How to Calculate Batting Average</h2>
        <p>The batting average is calculated using a simple but powerful formula:</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            Batting Average = Total Runs Scored / Number of Times Dismissed
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Understanding the Components</h3>

        <p><strong>Total Runs Scored:</strong> This is the cumulative sum of all runs scored by the batsman across all innings in the period being measured. It includes:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Runs from all shot types (boundaries, singles, twos, threes)</li>
          <li>Runs in both completed innings and not-out innings</li>
          <li>Does NOT include extras (byes, leg-byes, wides, no-balls) unless the batsman hit them</li>
        </ul>

        <p className="mt-4"><strong>Times Dismissed:</strong> This counts only the innings where the batsman was actually dismissed (got out). Crucially:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Not-out innings are NOT counted in the denominator</li>
          <li>All dismissal types count equally (bowled, caught, LBW, run out, stumped, hit wicket, etc.)</li>
          <li>Retired hurt innings are typically excluded from both numerator and denominator</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Not-Out Effect</h3>
        <p>The treatment of not-out innings is what makes batting average unique. If a batsman scores 50 runs in 10 innings but was dismissed only 8 times (remaining not out twice), their average is:</p>

        <div className="overflow-x-auto my-4 p-4 bg-muted border rounded-lg">
          <p className="font-mono text-center">
            Average = 50 / 8 = 6.25 (not 50 / 10 = 5.0)
          </p>
        </div>

        <p>This means not-out innings <em>increase</em> the batting average, as they add runs to the numerator without adding to the denominator. This is why lower-order batsmen who frequently remain not out can have inflated averages.</p>

        <hr />

        {/* INTERPRETATION */}
        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Interpreting Batting Average: What's Considered Good?</h2>

        <p>The interpretation of batting average varies significantly by the format of cricket and the era in which it was achieved. However, general benchmarks exist:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Universal Benchmarks (All Formats)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>50+:</strong> World-class, elite batsman. Reserved for the greatest players in history.</li>
          <li><strong>40-50:</strong> Excellent batsman. Reliable top-order player in international cricket.</li>
          <li><strong>30-40:</strong> Good batsman. Solid contributor, typical of quality middle-order players.</li>
          <li><strong>20-30:</strong> Average batsman. Acceptable for lower-order or developing players.</li>
          <li><strong>Below 20:</strong> Below average. Indicates significant technical or tactical issues.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Historical Context Matters</h3>
        <p>Batting averages have evolved over cricket's history. In the early 20th century, averages above 40 were rare due to uncovered pitches and limited protective equipment. Modern cricket, with covered pitches, better bats, and shorter boundaries, has seen average inflation.</p>

        <p>When comparing players across eras, consider:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Quality of opposition bowling</li>
          <li>Pitch conditions and ground sizes</li>
          <li>Equipment and protective gear available</li>
          <li>Rules and playing conditions of the era</li>
        </ul>

        <hr />

        {/* FORMAT-SPECIFIC BENCHMARKS */}
        <h2 id="formats" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Format-Specific Benchmarks: Test, ODI, and T20</h2>

        <p>Each format of cricket has different expectations and benchmarks for batting average:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Test Cricket</h3>
        <p>Test cricket is considered the ultimate test of batting skill, played over five days with unlimited overs. Batting averages tend to be higher in Tests because:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>More time to build an innings</li>
          <li>Less pressure to score quickly</li>
          <li>Ability to wear down bowlers</li>
        </ul>

        <p className="mt-4"><strong>Test Cricket Benchmarks:</strong></p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>50+:</strong> All-time great (e.g., Don Bradman 99.94, Steve Smith 60+)</li>
          <li><strong>40-50:</strong> World-class (most successful Test batsmen)</li>
          <li><strong>35-40:</strong> Very good international player</li>
          <li><strong>30-35:</strong> Solid Test batsman</li>
          <li><strong>Below 30:</strong> Struggles at Test level</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">One Day International (ODI)</h3>
        <p>ODI cricket is limited to 50 overs per side, requiring a balance between accumulation and acceleration. ODI averages are typically lower than Test averages because:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Pressure to maintain run rate</li>
          <li>More aggressive shot-making required</li>
          <li>Fielding restrictions create risk-reward scenarios</li>
        </ul>

        <p className="mt-4"><strong>ODI Benchmarks:</strong></p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>50+:</strong> Elite ODI batsman (e.g., Virat Kohli, AB de Villiers)</li>
          <li><strong>40-50:</strong> Excellent ODI player</li>
          <li><strong>30-40:</strong> Good ODI batsman</li>
          <li><strong>25-30:</strong> Average international player</li>
          <li><strong>Below 25:</strong> Below par for ODI cricket</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Twenty20 (T20)</h3>
        <p>T20 cricket is the shortest format, limited to 20 overs per side. Batting averages are significantly lower because:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Extreme pressure to score quickly from ball one</li>
          <li>High-risk batting is rewarded</li>
          <li>Getting out while attacking is accepted</li>
        </ul>

        <p className="mt-4"><strong>T20 Benchmarks:</strong></p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>40+:</strong> Outstanding T20 batsman</li>
          <li><strong>30-40:</strong> Excellent T20 player</li>
          <li><strong>25-30:</strong> Good T20 batsman</li>
          <li><strong>20-25:</strong> Average T20 player</li>
          <li><strong>Below 20:</strong> Struggles in T20 format</li>
        </ul>

        <p className="mt-4"><em>Important Note:</em> In T20 cricket, <strong>strike rate</strong> (runs per 100 balls) is often considered more important than batting average, as scoring quickly is paramount.</p>

        <hr />

        {/* LIMITATIONS */}
        <h2 id="limitations" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Limitations and Context: When Batting Average Can Be Misleading</h2>

        <p>While batting average is the cornerstone cricket statistic, it has several important limitations:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. The Not-Out Inflation Problem</h3>
        <p>As mentioned earlier, not-out innings inflate batting average. This particularly affects:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Lower-order batsmen:</strong> Batsmen at positions 7-11 frequently remain not out as innings end. A player with 200 runs in 10 innings but only 5 dismissals has an average of 40, which overstates their ability compared to a top-order batsman with the same average.</li>
          <li><strong>Openers in limited-overs:</strong> Openers who bat through the innings in ODI/T20 cricket accumulate not-outs.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Doesn't Measure Scoring Speed</h3>
        <p>Batting average tells you <em>how many</em> runs a batsman scores, but not <em>how quickly</em>. In modern limited-overs cricket, a batsman who scores 50 runs off 80 balls is far less valuable than one who scores 50 off 30 balls, even though both contribute equally to the average.</p>

        <p>This is why <strong>strike rate</strong> (runs per 100 balls faced) is used alongside average in ODI and T20 analysis.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Context of Opposition and Conditions</h3>
        <p>Not all runs are created equal. Batting average doesn't account for:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Quality of opposition:</strong> Scoring against weak bowling attacks inflates averages</li>
          <li><strong>Pitch conditions:</strong> Flat, batting-friendly pitches vs. challenging seaming/spinning tracks</li>
          <li><strong>Home vs. away:</strong> Many batsmen have significantly different averages at home vs. abroad</li>
          <li><strong>Match situation:</strong> Scoring when the team is already winning vs. rescuing a collapse</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Small Sample Size Issues</h3>
        <p>Batting average can be misleading for players with limited innings. A batsman with 100 runs in 2 dismissals (average 50) hasn't proven consistency compared to one with 2000 runs in 40 dismissals (also average 50).</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">5. Doesn't Capture Match-Winning Impact</h3>
        <p>A batsman who consistently scores 30-40 in winning causes has more value than one who scores centuries in losses, but both may have similar averages.</p>

        <hr />

        {/* COMPARISON WITH STRIKE RATE */}
        <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Batting Average vs. Strike Rate: Complementary Metrics</h2>

        <p>In modern cricket analysis, batting average and strike rate are used together to provide a complete picture of a batsman's performance:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Batting Average</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Measures:</strong> Consistency and run accumulation</li>
          <li><strong>Formula:</strong> Runs / Dismissals</li>
          <li><strong>Importance:</strong> Critical in Test cricket, important in all formats</li>
          <li><strong>Ideal for:</strong> Assessing reliability and technical soundness</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Strike Rate</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Measures:</strong> Scoring speed and aggression</li>
          <li><strong>Formula:</strong> (Runs / Balls Faced) × 100</li>
          <li><strong>Importance:</strong> Critical in T20, very important in ODI, less so in Tests</li>
          <li><strong>Ideal for:</strong> Assessing impact in limited-overs cricket</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Balance: Format-Specific Priorities</h3>

        <p><strong>Test Cricket:</strong> Average is king. A Test batsman with an average of 50 and strike rate of 45 is more valuable than one with average 35 and strike rate 65.</p>

        <p><strong>ODI Cricket:</strong> Both matter equally. The ideal ODI batsman combines a high average (40+) with a high strike rate (90+). Players are often evaluated using combined metrics like "runs per innings" or "impact rating."</p>

        <p><strong>T20 Cricket:</strong> Strike rate often trumps average. A T20 batsman with average 25 and strike rate 150 is typically more valuable than one with average 35 and strike rate 120, as they score runs faster when needed.</p>

        <hr />

        {/* IMPROVEMENT STRATEGIES */}
        <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Strategies to Improve Your Batting Average</h2>

        <p>Improving batting average requires a combination of technical refinement, tactical awareness, and mental strength:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Technical Fundamentals</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Solid defense:</strong> The foundation of high averages is the ability to defend good balls and leave balls outside off-stump</li>
          <li><strong>Footwork:</strong> Getting to the pitch of the ball (forward) or creating room (backward) is essential</li>
          <li><strong>Shot selection:</strong> Playing the right shot to the right ball reduces dismissals</li>
          <li><strong>Technique against spin and pace:</strong> Develop specific skills for different bowling types</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Tactical Awareness</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Know your scoring zones:</strong> Identify which shots you play best and target those areas</li>
          <li><strong>Rotate strike:</strong> Taking singles keeps scoreboard moving and reduces pressure</li>
          <li><strong>Assess conditions:</strong> Adapt your approach based on pitch, weather, and match situation</li>
          <li><strong>Build partnerships:</strong> Batting with a partner reduces pressure and allows you to play your natural game</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Mental Strength and Concentration</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Ball-by-ball focus:</strong> Don't think about your average or score, focus on the next delivery</li>
          <li><strong>Patience:</strong> Wait for the bad ball rather than forcing the issue</li>
          <li><strong>Pressure management:</strong> Develop routines and techniques to stay calm in high-pressure situations</li>
          <li><strong>Learn from dismissals:</strong> Analyze how you got out and work on those weaknesses</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Physical Fitness</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Stamina:</strong> Batting for long periods requires excellent cardiovascular fitness</li>
          <li><strong>Hand-eye coordination:</strong> Specific drills to improve reaction time</li>
          <li><strong>Strength training:</strong> Core strength for shot power and injury prevention</li>
          <li><strong>Flexibility:</strong> Allows full range of motion for all shots</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">5. Match Awareness</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Convert starts:</strong> The difference between average and great batsmen is converting 30s and 40s into 100s</li>
          <li><strong>Understand your role:</strong> Are you an accumulator, aggressor, or anchor? Play to your strengths</li>
          <li><strong>Study bowlers:</strong> Know their variations, strengths, and weaknesses</li>
          <li><strong>Field placement awareness:</strong> Identify gaps and exploit them</li>
        </ul>

        <hr />

        {/* CONCLUSION */}
        <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
        <p>The batting average remains cricket's most important individual statistic, providing a clear measure of a batsman's consistency and run-scoring ability. While it has limitations—particularly in not measuring scoring speed or accounting for match context—it is the foundation upon which all batting analysis is built.</p>

        <p>Understanding batting average, its calculation, and its interpretation across different formats is essential for players, coaches, analysts, and fans. When combined with complementary metrics like strike rate, batting average provides invaluable insights into a player's performance and value to their team.</p>

        <p>Whether you're a developing player aiming to improve your statistics, a coach analyzing team selection, or a fan evaluating players, the batting average calculator and this guide provide the tools and knowledge to make informed assessments of batting performance in cricket.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Common questions about batting average in cricket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good batting average in cricket?</h4>
              <p className="text-muted-foreground">
                In Test cricket, an average above 40 is considered excellent, while 50+ is world-class. In ODI cricket, 40+ is excellent and 50+ is elite. In T20 cricket, 30+ is very good and 40+ is outstanding. However, these benchmarks vary based on batting position, era, and opposition quality.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How is batting average calculated?</h4>
              <p className="text-muted-foreground">
                Batting average is calculated by dividing total runs scored by the number of times dismissed. The formula is: Batting Average = Total Runs / Times Out. Importantly, not-out innings are included in the runs but not counted as dismissals, which can inflate the average.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Why do not-out innings increase batting average?</h4>
              <p className="text-muted-foreground">
                Not-out innings add runs to the numerator (total runs) without adding to the denominator (dismissals). For example, if you score 100 runs in 5 innings with 2 not-outs, you were dismissed only 3 times, giving an average of 100/3 = 33.33, not 100/5 = 20. This is why lower-order batsmen often have inflated averages.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between batting average and strike rate?</h4>
              <p className="text-muted-foreground">
                Batting average measures consistency (runs per dismissal), while strike rate measures scoring speed (runs per 100 balls). Average is more important in Test cricket, while strike rate is crucial in T20s. In ODI cricket, both metrics are equally important for evaluating a batsman's overall effectiveness.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Who has the highest batting average in cricket history?</h4>
              <p className="text-muted-foreground">
                Sir Donald Bradman holds the highest Test batting average of 99.94, a record that is considered one of the greatest achievements in all of sport. In ODI cricket, several modern players have averages above 50, with Virat Kohli and AB de Villiers among the leaders. In T20 internationals, averages above 40 are rare and exceptional.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does batting position affect batting average?</h4>
              <p className="text-muted-foreground">
                Yes, significantly. Top-order batsmen (1-3) typically face more balls and have more opportunities to score, but also face fresh bowlers. Middle-order batsmen (4-6) often bat in pressure situations. Lower-order batsmen (7-11) frequently remain not out, which can inflate their averages. When comparing players, consider their batting position.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How many innings are needed for a meaningful batting average?</h4>
              <p className="text-muted-foreground">
                Generally, at least 20 innings (or 10 dismissals) are needed before a batting average becomes statistically meaningful. For international cricket, players are typically evaluated after 20-30 matches. Small sample sizes can produce misleading averages—a player with 100 runs in 2 dismissals (average 50) hasn't proven consistency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can batting average be too high?</h4>
              <p className="text-muted-foreground">
                In Test cricket, a very high average is always positive. However, in limited-overs cricket, an extremely high average combined with a very low strike rate might indicate overly cautious batting that doesn't help the team win. Modern cricket values batsmen who balance average with strike rate—scoring runs both consistently AND quickly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do pitch conditions affect batting average?</h4>
              <p className="text-muted-foreground">
                Pitch conditions significantly impact batting averages. Flat, hard pitches with true bounce favor batsmen and inflate averages. Green, seaming pitches or dusty, turning pitches make batting difficult and lower averages. When comparing players, consider where they played—home averages vs. away averages often differ significantly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between career average and current form?</h4>
              <p className="text-muted-foreground">
                Career average is calculated across all innings in a player's career, providing a long-term measure of consistency. Current form is typically measured by average over the last 10-20 innings or the current season. A player's career average may be 40, but if their recent average is 25, they're in poor form. Both metrics are important for team selection.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage of this Calculator */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Usage of this Calculator
          </CardTitle>
          <CardDescription>
            Practical applications and real-world context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Who should use */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Cricket Players</strong>
                <span className="text-sm text-muted-foreground">Track your performance across seasons, formats, and competitions to identify strengths and areas for improvement.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Coaches & Selectors</strong>
                <span className="text-sm text-muted-foreground">Evaluate player performance objectively when making team selection decisions or planning training programs.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Cricket Analysts</strong>
                <span className="text-sm text-muted-foreground">Analyze player statistics for commentary, articles, or fantasy cricket team selection.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Cricket Fans</strong>
                <span className="text-sm text-muted-foreground">Better understand player performance and compare batsmen across different eras and formats.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Limitations */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & When It May Be Misleading
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Not-Out Inflation:</strong> Lower-order batsmen who frequently remain not out can have misleadingly high averages. A No. 9 batsman with average 35 is not equivalent to a No. 3 batsman with the same average.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Small Sample Size:</strong> Averages based on fewer than 10-15 dismissals can be highly volatile and don't represent true ability. One or two big scores can skew the average significantly.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Ignores Scoring Speed:</strong> In T20 and ODI cricket, a batsman who scores slowly (even with a high average) may be less valuable than one who scores quickly. Always consider strike rate alongside average in limited-overs formats.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Opposition Quality:</strong> Batting average doesn't distinguish between runs scored against strong vs. weak bowling attacks. A player with a high average against weak teams may struggle against quality opposition.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Match Context:</strong> Runs scored when the team is already winning are statistically equal to match-saving or match-winning innings, but have different value. Average doesn't capture clutch performance.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          {/* Real World Examples */}
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Trophy className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example A: Test Cricket Specialist</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  A batsman scores 2,500 runs in 50 Test innings with 45 dismissals (5 not-outs). Average = 2500 / 45 = 55.55. This is world-class for Test cricket, indicating exceptional consistency and technique. Such a player would be a cornerstone of their team's batting lineup.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example B: T20 Power Hitter</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  A T20 batsman scores 800 runs in 40 innings with 32 dismissals (8 not-outs). Average = 800 / 32 = 25.00. While this seems modest, if their strike rate is 150+, they're extremely valuable in T20 cricket, as they score runs quickly when needed.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Example C: Lower-Order Batsman</h5>
                <p className="text-sm text-purple-700/80 dark:text-purple-400">
                  A No. 8 batsman scores 400 runs in 30 innings with only 12 dismissals (18 not-outs). Average = 400 / 12 = 33.33. While this average appears good, the high number of not-outs inflates it. This player's true batting ability is likely lower than the average suggests.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Batting Average Calculator measures a cricket batsman's consistency by calculating the average runs scored per dismissal.</p>
          <p>It is the most fundamental metric in cricket for evaluating batting performance across all formats.</p>
          <p>Use this tool to track your progress, compare players, and make informed decisions about team selection and strategy.</p>
        </CardContent>
      </Card>
    </div>
  );
}
