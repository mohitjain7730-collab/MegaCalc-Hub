'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, TrendingUp, AlertCircle, Info, Calculator, BarChart3, Shield, FunctionSquare, CheckCircle2, Users, Briefcase, AlertTriangle, Activity, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

const formSchema = z.object({
  runsConceded: z.number().min(0),
  wicketsTaken: z.number().min(0),
});

type FormValues = z.infer<typeof formSchema>;

export default function BowlingAverageCalculator() {
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
      runsConceded: undefined,
      wicketsTaken: undefined,
    },
  });

  const calculate = (v: FormValues) => {
    if (v.runsConceded == null || v.wicketsTaken == null) return null;
    if (v.wicketsTaken === 0) return Infinity; // No wickets scenario
    return v.runsConceded / v.wicketsTaken;
  };

  const interpret = (avg: number) => {
    if (avg === Infinity) return 'No wickets taken - unable to calculate average.';
    if (avg <= 20) return 'World-class bowling performance with exceptional wicket-taking ability.';
    if (avg <= 25) return 'Elite bowling average indicating top-tier performance.';
    if (avg <= 30) return 'Strong bowling performance with good consistency.';
    if (avg <= 35) return 'Moderate bowling average - acceptable performance.';
    return 'Below-average bowling performance - requires improvement.';
  };

  const getPerformanceLevel = (avg: number) => {
    if (avg === Infinity) return 'No Wickets';
    if (avg <= 20) return 'World Class';
    if (avg <= 25) return 'Elite';
    if (avg <= 30) return 'Good';
    if (avg <= 35) return 'Average';
    return 'Below Average';
  };

  const getRecommendation = (avg: number) => {
    if (avg === Infinity) return 'Focus on taking wickets. Work on variations and attacking lines.';
    if (avg <= 20) return 'Maintain current form and continue attacking the stumps.';
    if (avg <= 25) return 'Excellent performance. Focus on consistency in pressure situations.';
    if (avg <= 30) return 'Work on variations and wicket-taking deliveries.';
    if (avg <= 35) return 'Improve line, length, and develop more attacking options.';
    return 'Fundamental technical work needed. Focus on basics and match awareness.';
  };

  const getRating = (avg: number) => {
    if (avg === Infinity) return 'Needs Wickets';
    if (avg <= 20) return 'Outstanding';
    if (avg <= 25) return 'Excellent';
    if (avg <= 30) return 'Good';
    if (avg <= 35) return 'Fair';
    return 'Needs Improvement';
  };

  const getInsights = (avg: number) => {
    const insights = [];
    if (avg === Infinity) {
      insights.push('No wickets taken in the period');
      insights.push('Focus on attacking bowling');
      insights.push('Work with coach on wicket-taking strategies');
    } else if (avg <= 20) {
      insights.push('Exceptional wicket-taking ability');
      insights.push('High consistency and effectiveness');
      insights.push('Match-winning bowling capability');
    } else if (avg <= 25) {
      insights.push('Strong technical foundation');
      insights.push('Reliable strike bowler');
      insights.push('Good control under pressure');
    } else if (avg <= 30) {
      insights.push('Solid bowling foundation');
      insights.push('Capable of regular breakthroughs');
      insights.push('Potential for higher performance');
    } else if (avg <= 35) {
      insights.push('Developing bowling skills');
      insights.push('Inconsistent wicket-taking');
      insights.push('Requires tactical refinement');
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
    considerations.push('Quality of opposition batting impacts statistics');
    considerations.push('Pitch and weather conditions vary significantly');
    considerations.push('Role as strike bowler vs stock bowler matters');
    considerations.push('Tail-end wickets can artificially lower average');
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
      {/* SEO-Optimized Header */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">Bowling Average Calculator</h1>
        <p className="text-lg text-muted-foreground">
          Calculate cricket bowling average to measure wicket-taking efficiency and performance.
        </p>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Bowling Statistics</h2>
          </CardTitle>
          <CardDescription>
            Enter runs conceded and wickets taken to calculate bowling average
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="runsConceded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Total Runs Conceded
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 850"
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
                  name="wicketsTaken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Total Wickets Taken
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="e.g., 35"
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
                Calculate Bowling Average
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Results */}
      {result && result.average !== Infinity && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Bowling Average</h2>
                  <p className="text-muted-foreground">Performance Analysis</p>
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
                  <p className="font-semibold">Runs Per Wicket</p>
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

      {result && result.average === Infinity && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900/20 dark:bg-amber-900/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-6 w-6" />
              No Wickets Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Bowling average cannot be calculated when no wickets have been taken. Focus on developing wicket-taking deliveries and attacking bowling strategies.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Understanding the Inputs */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Understanding the Inputs
          </CardTitle>
          <CardDescription>
            Key components required for bowling average calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <AlertCircle className="h-4 w-4" />
                Total Runs Conceded
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The cumulative number of runs scored off a bowler's bowling across all overs bowled in a given period or format.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Includes all runs scored off the bat from the bowler's deliveries</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Includes wides and no-balls bowled</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                  <span>Does NOT include byes or leg-byes (credited to wicketkeeper/fielding)</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-900/20">
              <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Zap className="h-4 w-4" />
                Total Wickets Taken
              </h4>
              <p className="text-sm text-muted-foreground mb-3">
                The number of batsmen dismissed directly by the bowler during the period being analyzed.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Includes bowled, caught, LBW, stumped, and hit wicket</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Does NOT include run outs (unless bowler touched the ball)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <span>Does NOT include retired hurt or timed out</span>
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
              Bowling Average = Total Runs Conceded / Total Wickets Taken
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Measures a bowler's effectiveness by calculating the average number of runs conceded per wicket taken. A lower average indicates better bowling performance and wicket-taking ability.
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
            <Link href="/category/sports-training/batting-average-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Batting Average</p>
                      <p className="text-sm text-muted-foreground">Batting performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/sports-training/bowling-economy-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">Economy Rate</p>
                      <p className="text-sm text-muted-foreground">Runs per over</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/category/sports-training/strike-rate-calculator" className="block">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Strike Rate</p>
                      <p className="text-sm text-muted-foreground">Balls per wicket</p>
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
                      <p className="text-sm text-muted-foreground">Current scoring pace</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Guide Section - Part 1 */}
      <section className="space-y-6 text-muted-foreground leading-relaxed bg-card p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/Article">
        <meta itemProp="name" content="The Complete Guide to Cricket Bowling Average: Calculation, Interpretation, and Performance Analysis" />
        <meta itemProp="description" content="An expert guide to understanding bowling average in cricket, including calculation methods, performance benchmarks, format-specific variations, and how it compares to other bowling metrics like economy rate and strike rate." />
        <meta itemProp="keywords" content="bowling average cricket, cricket bowling statistics, bowling performance metrics, test cricket bowling, ODI bowling average, T20 bowling stats, cricket bowler analysis" />
        <meta itemProp="author" content="MegaCalc Cricket Analytics Team" />
        <meta itemProp="datePublished" content="2026-02-09" />

        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Complete Guide to Cricket Bowling Average: Measuring Wicket-Taking Efficiency</h2>
        <p className="text-lg italic text-muted-foreground">Master the fundamental metric that defines a bowler's effectiveness, economy, and overall contribution to the team's success across all formats of cricket.</p>

        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents</h2>
        <ul className="list-disc ml-6 space-y-2 text-primary">
          <li><a href="#definition" className="hover:underline">What is Bowling Average in Cricket?</a></li>
          <li><a href="#calculation" className="hover:underline">How to Calculate Bowling Average</a></li>
          <li><a href="#interpretation" className="hover:underline">Interpreting Bowling Average: What's Good?</a></li>
          <li><a href="#formats" className="hover:underline">Format-Specific Benchmarks (Test, ODI, T20)</a></li>
          <li><a href="#comparison" className="hover:underline">Bowling Average vs Economy Rate vs Strike Rate</a></li>
          <li><a href="#improvement" className="hover:underline">Strategies to Improve Your Bowling Average</a></li>
        </ul>
        <hr />

        <h2 id="definition" className="text-2xl font-bold text-foreground pt-8">What is Bowling Average in Cricket?</h2>
        <p>The <strong>Bowling Average</strong> is one of the three primary statistics used to measure a bowler's performance in cricket (alongside economy rate and strike rate). It represents the average number of runs a bowler concedes for each wicket taken.</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Core Metric of Wicket-Taking Efficiency</h3>
        <p>While batsmen are measured by how many runs they score before getting out, bowlers are measured by how economically they take wickets. The bowling average quantifies this efficiency: the fewer runs conceded per wicket, the better the bowler.</p>

        <p>A lower bowling average indicates:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Greater wicket-taking ability</li>
          <li>Better control and accuracy</li>
          <li>More economical bowling</li>
          <li>Higher value to the team's bowling attack</li>
        </ul>

        <hr />

        <h2 id="calculation" className="text-2xl font-bold text-foreground pt-8">How to Calculate Bowling Average</h2>
        <p>The bowling average is calculated using a straightforward formula:</p>

        <div className="overflow-x-auto my-6 p-4 bg-muted border rounded-lg text-center">
          <p className="font-mono text-xl text-destructive font-bold">
            Bowling Average = Total Runs Conceded / Total Wickets Taken
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-6">Understanding the Components</h3>

        <p><strong>Total Runs Conceded:</strong> This is the cumulative sum of all runs scored off the bowler's deliveries. It includes:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>All runs scored off the bat from the bowler's deliveries (boundaries, singles, etc.)</li>
          <li>Wides and no-balls bowled (these add to runs conceded)</li>
          <li>Does NOT include byes or leg-byes, which are credited to the wicketkeeper/fielding side, not the bowler</li>
        </ul>

        <p className="mt-4"><strong>Total Wickets Taken:</strong> This counts only the wickets directly attributed to the bowler:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Bowled (stumps hit by the ball)</li>
          <li>Caught (batsman hits the ball and it's caught)</li>
          <li>LBW (Leg Before Wicket)</li>
          <li>Stumped (wicketkeeper dismisses batsman out of crease off bowler's delivery)</li>
          <li>Hit wicket (batsman hits own stumps while playing a shot)</li>
          <li>Does NOT include run outs (unless the bowler deflected the ball onto the stumps)</li>
          <li>Does NOT include retired hurt, timed out, or obstructing the field</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Example Calculation</h3>
        <p>If a bowler has conceded 850 runs and taken 35 wickets in a season:</p>

        <div className="overflow-x-auto my-4 p-4 bg-muted border rounded-lg">
          <p className="font-mono text-center">
            Bowling Average = 850 / 35 = 24.29
          </p>
        </div>

        <p>This means the bowler concedes an average of 24.29 runs for every wicket taken, which is an excellent bowling average in most formats.</p>

        <hr />

        <h2 id="interpretation" className="text-2xl font-bold text-foreground pt-8">Interpreting Bowling Average: What's Considered Good?</h2>

        <p>Unlike batting average where higher is better, for bowling average, <strong>lower is better</strong>. The interpretation varies by format and era:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">Universal Benchmarks (General Guidelines)</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Under 20:</strong> World-class, elite bowler. Reserved for the greatest bowlers in history.</li>
          <li><strong>20-25:</strong> Excellent bowler. Reliable strike bowler in international cricket.</li>
          <li><strong>25-30:</strong> Good bowler. Solid contributor to the bowling attack.</li>
          <li><strong>30-35:</strong> Average bowler. Acceptable for support bowlers or developing players.</li>
          <li><strong>Above 35:</strong> Below average. Indicates significant issues with wicket-taking or economy.</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Historical Context and Era Adjustments</h3>
        <p>Bowling averages have evolved throughout cricket history. In the early 20th century, uncovered pitches and less protective batting equipment meant lower bowling averages were common. Modern cricket, with covered pitches, better bats, and more aggressive batting, has seen bowling average inflation.</p>

        <p>When comparing bowlers across eras, consider:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Quality of opposition batting</li>
          <li>Pitch preparation and conditions</li>
          <li>Rules and playing conditions (e.g., fielding restrictions in limited-overs)</li>
          <li>Equipment and ball quality</li>
        </ul>

        <hr />

        <h2 id="formats" className="text-2xl font-bold text-foreground pt-8">Format-Specific Benchmarks: Test, ODI, and T20</h2>

        <h3 className="text-xl font-semibold text-foreground mt-6">Test Cricket</h3>
        <p>Test cricket bowling averages tend to be lower than limited-overs formats because:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>More overs bowled allows bowlers to settle into rhythm</li>
          <li>Pitches deteriorate over five days, assisting bowlers</li>
          <li>Less pressure to contain runs allows attacking bowling</li>
          <li>Batsmen play more defensively, creating more chances</li>
        </ul>

        <p className="mt-4"><strong>Test Cricket Benchmarks:</strong></p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Under 20:</strong> All-time great (e.g., Malcolm Marshall 20.94, Dale Steyn 22.95)</li>
          <li><strong>20-25:</strong> World-class Test bowler</li>
          <li><strong>25-30:</strong> Very good international bowler</li>
          <li><strong>30-35:</strong> Solid Test bowler</li>
          <li><strong>Above 35:</strong> Struggles at Test level</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">One Day International (ODI)</h3>
        <p>ODI bowling averages are typically higher than Test averages because:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Fielding restrictions encourage aggressive batting</li>
          <li>Batsmen take more risks to maintain run rate</li>
          <li>Flat pitches are common to ensure high-scoring games</li>
          <li>Bowlers must balance wicket-taking with economy</li>
        </ul>

        <p className="mt-4"><strong>ODI Benchmarks:</strong></p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Under 25:</strong> Elite ODI bowler (e.g., Joel Garner 18.84, Jasprit Bumrah ~24)</li>
          <li><strong>25-30:</strong> Excellent ODI bowler</li>
          <li><strong>30-35:</strong> Good ODI bowler</li>
          <li><strong>35-40:</strong> Average international bowler</li>
          <li><strong>Above 40:</strong> Below par for ODI cricket</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Twenty20 (T20)</h3>
        <p>T20 bowling averages are the highest across formats because:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li>Extreme aggressive batting from ball one</li>
          <li>Powerplay overs with fielding restrictions</li>
          <li>Shorter boundaries and batsman-friendly conditions</li>
          <li>Less time to build pressure</li>
        </ul>

        <p className="mt-4"><strong>T20 Benchmarks:</strong></p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Under 20:</strong> Outstanding T20 bowler</li>
          <li><strong>20-25:</strong> Excellent T20 bowler</li>
          <li><strong>25-30:</strong> Good T20 bowler</li>
          <li><strong>30-35:</strong> Average T20 bowler</li>
          <li><strong>Above 35:</strong> Struggles in T20 format</li>
        </ul>

        <p className="mt-4"><em>Important Note:</em> In T20 cricket, <strong>economy rate</strong> (runs per over) is often considered more important than bowling average, as containing runs is paramount in the shortest format.</p>

        <hr />

        <h2 id="comparison" className="text-2xl font-bold text-foreground pt-8">Bowling Average vs Economy Rate vs Strike Rate</h2>

        <p>Cricket uses three primary bowling statistics, each measuring a different aspect of performance:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Bowling Average</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Measures:</strong> Runs conceded per wicket taken</li>
          <li><strong>Formula:</strong> Runs Conceded / Wickets Taken</li>
          <li><strong>Lower is better</strong></li>
          <li><strong>Best for:</strong> Assessing overall wicket-taking efficiency</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Economy Rate</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Measures:</strong> Runs conceded per over bowled</li>
          <li><strong>Formula:</strong> Runs Conceded / Overs Bowled</li>
          <li><strong>Lower is better</strong></li>
          <li><strong>Best for:</strong> Assessing run containment ability</li>
          <li><strong>Most important in:</strong> T20 cricket, important in ODIs</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Bowling Strike Rate</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Measures:</strong> Balls bowled per wicket taken</li>
          <li><strong>Formula:</strong> Balls Bowled / Wickets Taken</li>
          <li><strong>Lower is better</strong></li>
          <li><strong>Best for:</strong> Assessing how quickly a bowler takes wickets</li>
          <li><strong>Most important in:</strong> Test cricket</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">The Relationship Between Metrics</h3>
        <p>These three metrics are mathematically related:</p>

        <div className="overflow-x-auto my-4 p-4 bg-muted border rounded-lg">
          <p className="font-mono text-center text-sm">
            Bowling Average = Economy Rate × (Strike Rate / 6)
          </p>
        </div>

        <p>This means a bowler can have a good average by either:</p>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Taking wickets quickly</strong> (low strike rate) even if slightly expensive</li>
          <li><strong>Being very economical</strong> (low economy rate) even if wickets come slowly</li>
          <li><strong>Balancing both</strong> (the ideal scenario)</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">Format-Specific Priorities</h3>

        <p><strong>Test Cricket:</strong> Strike rate and average are most important. Taking 20 wickets to win a Test match is the priority, even if it costs runs.</p>

        <p><strong>ODI Cricket:</strong> All three metrics matter. The ideal ODI bowler has a good average (under 30), good economy (under 5.5), and reasonable strike rate (under 35).</p>

        <p><strong>T20 Cricket:</strong> Economy rate is king. A bowler with an economy of 7.0 and average of 28 is often more valuable than one with economy 9.0 and average 22, because containing runs is crucial.</p>

        <hr />

        <h2 id="improvement" className="text-2xl font-bold text-foreground pt-8">Strategies to Improve Your Bowling Average</h2>

        <p>Improving bowling average requires developing wicket-taking ability while maintaining economy. Here are proven strategies:</p>

        <h3 className="text-xl font-semibold text-foreground mt-6">1. Technical Fundamentals</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Consistent line and length:</strong> The foundation of all good bowling. Bowl in the "corridor of uncertainty" outside off-stump</li>
          <li><strong>Develop a stock ball:</strong> A reliable delivery you can bowl repeatedly with accuracy</li>
          <li><strong>Master your action:</strong> A repeatable, biomechanically sound action reduces injuries and improves consistency</li>
          <li><strong>Seam position:</strong> For pace bowlers, upright seam position creates movement and bounce</li>
          <li><strong>Wrist position:</strong> For spin bowlers, strong wrist position generates turn and dip</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">2. Develop Variations</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Pace variations:</strong> Slower balls, bouncers, yorkers to keep batsmen guessing</li>
          <li><strong>Swing/seam:</strong> Inswing, outswing, cutters, cross-seam deliveries</li>
          <li><strong>Spin variations:</strong> Doosra, googly, arm ball, top-spinner</li>
          <li><strong>Length variations:</strong> Yorker, bouncer, good length mixing</li>
          <li><strong>Don't overuse:</strong> Variations are most effective when used sparingly</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">3. Tactical Bowling</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Set up batsmen:</strong> Bowl a pattern of deliveries to create a false sense of security, then deliver the wicket ball</li>
          <li><strong>Bowl to your field:</strong> Understand your field placement and bowl to force batsmen to hit to fielders</li>
          <li><strong>Exploit weaknesses:</strong> Study batsmen to identify technical weaknesses (e.g., struggle against short ball, weak against spin)</li>
          <li><strong>Adapt to conditions:</strong> Read the pitch, weather, and match situation to adjust your approach</li>
          <li><strong>Build pressure:</strong> Dot balls create pressure that leads to wickets</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">4. Mental Strength</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Ball-by-ball focus:</strong> Don't dwell on being hit for boundaries; focus on the next delivery</li>
          <li><strong>Patience:</strong> Wickets often come to bowlers who maintain discipline</li>
          <li><strong>Confidence:</strong> Believe in your ability to take wickets</li>
          <li><strong>Learn from mistakes:</strong> Analyze when you get hit and adjust</li>
          <li><strong>Pressure management:</strong> Stay calm in death overs or when batsmen are attacking</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">5. Physical Fitness</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Stamina:</strong> Bowling long spells requires excellent cardiovascular fitness</li>
          <li><strong>Core strength:</strong> Essential for generating pace and spin</li>
          <li><strong>Flexibility:</strong> Prevents injuries and allows full range of motion in bowling action</li>
          <li><strong>Strength training:</strong> Builds power for pace or spin generation</li>
          <li><strong>Recovery:</strong> Proper rest and recovery prevents injuries and maintains performance</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mt-6">6. Target Specific Batsmen</h3>
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Attack top order:</strong> Dismissing quality batsmen early improves your average more than tail-end wickets</li>
          <li><strong>Don't pad stats:</strong> While tail-end wickets count, focus on dismissing the best batsmen</li>
          <li><strong>New batsmen are vulnerable:</strong> Attack new batsmen before they settle</li>
        </ul>

        <hr />

        <h2 className="text-2xl font-bold text-foreground pt-8">Conclusion</h2>
        <p>The bowling average is a cornerstone statistic in cricket, providing a clear measure of a bowler's wicket-taking efficiency and overall effectiveness. While it has limitations—particularly in not measuring economy or wicket-taking speed independently—it remains the primary metric for evaluating bowling performance across all formats.</p>

        <p>Understanding bowling average, its calculation, and its interpretation is essential for players, coaches, selectors, and fans. When combined with complementary metrics like economy rate and strike rate, bowling average provides invaluable insights into a bowler's performance and value to their team.</p>

        <p>Whether you're a developing bowler aiming to improve your statistics, a coach analyzing team composition, or a fan evaluating players, the bowling average calculator and this guide provide the tools and knowledge to make informed assessments of bowling performance in cricket.</p>
      </section>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Frequently Asked Questions</h2>
          </CardTitle>
          <CardDescription>
            Common questions about bowling average in cricket
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">What is a good bowling average in cricket?</h4>
              <p className="text-muted-foreground">
                In Test cricket, an average under 25 is considered excellent, while under 20 is world-class. In ODI cricket, under 30 is excellent and under 25 is elite. In T20 cricket, under 25 is very good and under 20 is outstanding. Remember, lower is better for bowling average.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How is bowling average calculated?</h4>
              <p className="text-muted-foreground">
                Bowling average is calculated by dividing total runs conceded by the number of wickets taken. The formula is: Bowling Average = Runs Conceded / Wickets Taken. This includes all runs scored off the bowler's deliveries, including wides and no-balls, but excludes byes and leg-byes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What's the difference between bowling average and economy rate?</h4>
              <p className="text-muted-foreground">
                Bowling average measures runs conceded per wicket (wicket-taking efficiency), while economy rate measures runs conceded per over (run containment). Average is more important in Test cricket, while economy rate is crucial in T20s. Both are important in ODI cricket for evaluating a bowler's overall effectiveness.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Who has the best bowling average in cricket history?</h4>
              <p className="text-muted-foreground">
                In Test cricket, several bowlers have averages under 21, including Malcolm Marshall (20.94), Dale Steyn (22.95), and Richard Hadlee (22.29). In ODI cricket, Joel Garner has an exceptional average of 18.84. In T20 internationals, several bowlers maintain averages in the low 20s.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Does bowling position affect bowling average?</h4>
              <p className="text-muted-foreground">
                Yes. Opening bowlers often face the best batsmen with a new ball, which can affect their average. Death bowlers in limited-overs cricket typically have higher averages as they bowl when batsmen attack. Spin bowlers in the middle overs may have better averages as they exploit tired batsmen and deteriorating pitches.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Can tail-end wickets inflate bowling statistics?</h4>
              <p className="text-muted-foreground">
                Yes, dismissing lower-order batsmen (numbers 8-11) who are typically weaker can artificially improve a bowler's average. This is why analysts often look at wickets of top-order batsmen separately. The best bowlers consistently dismiss quality batsmen, not just tail-enders.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How many wickets are needed for a meaningful bowling average?</h4>
              <p className="text-muted-foreground">
                Generally, at least 20-30 wickets are needed before a bowling average becomes statistically meaningful. For international cricket, bowlers are typically evaluated after 20-30 matches. Small sample sizes can produce misleading averages—a bowler with 5 wickets for 80 runs (average 16) hasn't proven consistency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">What if a bowler hasn't taken any wickets?</h4>
              <p className="text-muted-foreground">
                If a bowler has conceded runs but taken no wickets, their bowling average is technically infinite (or undefined). This situation occurs with new bowlers or those having a wicketless spell. The average can only be calculated once at least one wicket is taken.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">How do pitch conditions affect bowling average?</h4>
              <p className="text-muted-foreground">
                Pitch conditions significantly impact bowling averages. Green, seaming pitches favor pace bowlers and lower their averages. Dry, dusty pitches assist spin bowlers. Flat, batting-friendly pitches inflate bowling averages. When comparing bowlers, consider home vs. away averages and the conditions they typically bowl in.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3">Is a low bowling average always good?</h4>
              <p className="text-muted-foreground">
                Generally yes, but context matters. In T20 cricket, a bowler with an average of 20 but an economy rate of 10 may be less valuable than one with an average of 25 and economy of 7, as containing runs is crucial. The best bowlers balance low average with good economy and strike rate across all formats.
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
            <h2 className="text-xl font-semibold">Usage of this Calculator</h2>
          </CardTitle>
          <CardDescription>
            Practical applications and real-world context
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Users className="h-5 w-5 text-blue-600" />
              Who Should Use This Calculator?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Cricket Bowlers</strong>
                <span className="text-sm text-muted-foreground">Track your wicket-taking efficiency across seasons, formats, and competitions to identify areas for improvement.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Coaches & Selectors</strong>
                <span className="text-sm text-muted-foreground">Evaluate bowler performance objectively when making team selection decisions or planning bowling strategies.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Cricket Analysts</strong>
                <span className="text-sm text-muted-foreground">Analyze bowler statistics for commentary, articles, or fantasy cricket team selection.</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                <strong className="block text-primary mb-1">Cricket Fans</strong>
                <span className="text-sm text-muted-foreground">Better understand bowler performance and compare bowlers across different eras and formats.</span>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Limitations & When It May Be Misleading
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Tail-End Wickets:</strong> Bowlers who frequently dismiss lower-order batsmen (numbers 8-11) can have artificially low averages. These wickets are easier to obtain than dismissing top-order batsmen.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Small Sample Size:</strong> Averages based on fewer than 20-30 wickets can be highly volatile. A few good or bad performances can skew the average significantly.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Ignores Economy:</strong> In limited-overs cricket, a bowler with a low average but high economy rate (conceding many runs) may be less valuable than one with a slightly higher average but excellent economy.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Opposition Quality:</strong> Bowling average doesn't distinguish between wickets against strong vs. weak batting lineups. A bowler with a low average against weak teams may struggle against quality opposition.</span>
              </li>
            </ul>
          </div>

          <hr className="border-border/50" />

          <div>
            <h4 className="flex items-center gap-2 font-semibold text-lg mb-3">
              <Activity className="h-5 w-5 text-green-600" />
              Real-World Examples
            </h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
                <h5 className="font-semibold text-green-800 dark:text-green-300 mb-1">Example A: Test Match Specialist</h5>
                <p className="text-sm text-green-700/80 dark:text-green-400">
                  A pace bowler concedes 1,200 runs and takes 55 wickets in 15 Test matches. Average = 1200 / 55 = 21.82. This is world-class for Test cricket, indicating exceptional wicket-taking ability and control. Such a bowler would be a key strike weapon for their team.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                <h5 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Example B: T20 Death Bowler</h5>
                <p className="text-sm text-blue-700/80 dark:text-blue-400">
                  A T20 specialist concedes 600 runs and takes 25 wickets in 30 matches. Average = 600 / 25 = 24.00. While this is a good average, if their economy rate is 8.5 (acceptable for death overs), they're valuable despite the moderate average, as death bowling is the hardest role.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                <h5 className="font-semibold text-purple-800 dark:text-purple-300 mb-1">Example C: Spin Bowler in Favorable Conditions</h5>
                <p className="text-sm text-purple-700/80 dark:text-purple-400">
                  A spin bowler playing primarily at home on turning pitches concedes 800 runs and takes 50 wickets. Average = 800 / 50 = 16.00. While this appears exceptional, it's important to check their away average—if it's significantly higher (e.g., 35), they may be pitch-dependent.
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
            <h2 className="text-xl font-semibold">Summary</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>The Bowling Average Calculator measures a cricket bowler's efficiency by calculating the average runs conceded per wicket taken.</p>
          <p>It is one of the most important metrics in cricket for evaluating bowling performance across all formats.</p>
          <p>Use this tool to track your progress, compare bowlers, and make informed decisions about team selection and bowling strategies.</p>
        </CardContent>
      </Card>
    </div>
  );
}
