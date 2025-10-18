'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, Trophy, Target, TrendingUp, Info, Zap, Star, Award, Activity, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const teamRunRateSchema = z.object({
  runsScored: z.string().min(1, 'Runs scored is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Runs scored must be a valid number',
  }),
  oversFaced: z.string().min(1, 'Overs faced is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Overs faced must be a valid positive number',
  }),
  wicketsLost: z.string().min(1, 'Wickets lost is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 10, {
    message: 'Wickets lost must be between 0 and 10',
  }),
  format: z.enum(['test', 'odi', 't20']).optional(),
  innings: z.string().optional(),
  ballsFaced: z.string().optional(),
});

type TeamRunRateFormData = z.infer<typeof teamRunRateSchema>;

interface TeamRunRateResult {
  runRate: number;
  strikeRate: number;
  performance: 'excellent' | 'very-good' | 'good' | 'average' | 'below-average' | 'poor';
  interpretation: string;
  recommendation: string;
  comparison: string;
  wicketsRemaining: number;
  oversRemaining: number;
}

export default function TeamRunRateCalculator() {
  const [result, setResult] = useState<TeamRunRateResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<TeamRunRateFormData>({
    resolver: zodResolver(teamRunRateSchema),
    defaultValues: {
      runsScored: '',
      oversFaced: '',
      wicketsLost: '',
      format: 'odi',
      innings: '',
      ballsFaced: '',
    },
  });

  const calculateTeamRunRate = (data: TeamRunRateFormData): TeamRunRateResult => {
    const runsScored = Number(data.runsScored);
    const oversFaced = Number(data.oversFaced);
    const wicketsLost = Number(data.wicketsLost);
    const format = data.format || 'odi';
    const ballsFaced = Number(data.ballsFaced) || oversFaced * 6;
    
    if (oversFaced === 0 || ballsFaced === 0) {
      return {
        runRate: 0,
        strikeRate: 0,
        wicketsRemaining: 0,
        oversRemaining: 0,
        performance: 'poor',
        interpretation: 'No overs or balls faced. The team has not started batting yet.',
        recommendation: 'Start batting to begin calculating team run rate.',
        comparison: 'This scenario indicates the team has not begun their innings.',
      };
    }

    const runRate = runsScored / oversFaced;
    const strikeRate = (runsScored / ballsFaced) * 100;
    const wicketsRemaining = 10 - wicketsLost;
    const oversRemaining = format === 'test' ? 90 : (format === 'odi' ? 50 : 20) - oversFaced;
    
    let performance: TeamRunRateResult['performance'];
    let interpretation: string;
    let recommendation: string;
    let comparison: string;

    if (format === 't20') {
      if (runRate >= 9) {
        performance = 'excellent';
        interpretation = 'Outstanding T20 run rate! The team is scoring at an exceptional pace and dominating the opposition.';
        recommendation = 'Continue the aggressive approach and maintain pressure on the opposition.';
        comparison = 'This run rate puts the team among the elite T20 batting units in world cricket.';
      } else if (runRate >= 8) {
        performance = 'very-good';
        interpretation = 'Excellent T20 run rate! The team demonstrates strong aggressive batting and good tempo.';
        recommendation = 'Continue working on maintaining this level of scoring rate throughout the innings.';
        comparison = 'This is comparable to top T20 international teams and shows professional-level performance.';
      } else if (runRate >= 7) {
        performance = 'good';
        interpretation = 'Good T20 run rate! The team shows solid batting fundamentals with reasonable scoring pace.';
        recommendation = 'Focus on improving the scoring rate and building more pressure on the opposition.';
        comparison = 'This run rate indicates a competitive T20 team that can challenge most opponents.';
      } else if (runRate >= 6) {
        performance = 'average';
        interpretation = 'Average T20 run rate. There is room for improvement in scoring pace and aggressive batting.';
        recommendation = 'Work on increasing the scoring rate and taking more calculated risks.';
        comparison = 'This is typical for developing T20 teams or those in challenging conditions.';
      } else if (runRate >= 5) {
        performance = 'below-average';
        interpretation = 'Below-average T20 run rate. Significant improvement needed in scoring pace.';
        recommendation = 'Consider more aggressive batting and taking calculated risks to increase scoring.';
        comparison = 'This suggests the need for focused practice on aggressive batting skills.';
      } else {
        performance = 'poor';
        interpretation = 'Poor T20 run rate. Immediate attention to batting approach is required.';
        recommendation = 'Seek professional coaching and focus on aggressive batting fundamentals.';
        comparison = 'This indicates a need for fundamental T20 batting skill development.';
      }
    } else if (format === 'test') {
      if (runRate >= 4) {
        performance = 'excellent';
        interpretation = 'Outstanding Test run rate! The team is scoring at an exceptional pace for Test cricket.';
        recommendation = 'Continue the aggressive approach while maintaining good technique.';
        comparison = 'This run rate puts the team among the most aggressive Test batting units.';
      } else if (runRate >= 3.5) {
        performance = 'very-good';
        interpretation = 'Excellent Test run rate! The team demonstrates strong batting with good tempo.';
        recommendation = 'Continue working on maintaining this level of scoring rate throughout the innings.';
        comparison = 'This is comparable to top Test international teams and shows professional-level performance.';
      } else if (runRate >= 3) {
        performance = 'good';
        interpretation = 'Good Test run rate! The team shows solid batting fundamentals with reasonable scoring pace.';
        recommendation = 'Focus on improving the scoring rate while maintaining good technique.';
        comparison = 'This run rate indicates a competitive Test team that can challenge most opponents.';
      } else if (runRate >= 2.5) {
        performance = 'average';
        interpretation = 'Average Test run rate. There is room for improvement in scoring pace.';
        recommendation = 'Work on increasing the scoring rate while maintaining good technique.';
        comparison = 'This is typical for developing Test teams or those in challenging conditions.';
      } else if (runRate >= 2) {
        performance = 'below-average';
        interpretation = 'Below-average Test run rate. Significant improvement needed in scoring pace.';
        recommendation = 'Consider more aggressive batting while maintaining good technique.';
        comparison = 'This suggests the need for focused practice on batting skills.';
      } else {
        performance = 'poor';
        interpretation = 'Poor Test run rate. Immediate attention to batting approach is required.';
        recommendation = 'Seek professional coaching and focus on batting fundamentals.';
        comparison = 'This indicates a need for fundamental batting skill development.';
      }
    } else { // ODI format
      if (runRate >= 6.5) {
        performance = 'excellent';
        interpretation = 'Outstanding ODI run rate! The team is scoring at an exceptional pace and dominating the opposition.';
        recommendation = 'Continue the aggressive approach and maintain pressure on the opposition.';
        comparison = 'This run rate puts the team among the elite ODI batting units in world cricket.';
      } else if (runRate >= 5.5) {
        performance = 'very-good';
        interpretation = 'Excellent ODI run rate! The team demonstrates strong aggressive batting and good tempo.';
        recommendation = 'Continue working on maintaining this level of scoring rate throughout the innings.';
        comparison = 'This is comparable to top ODI international teams and shows professional-level performance.';
      } else if (runRate >= 4.5) {
        performance = 'good';
        interpretation = 'Good ODI run rate! The team shows solid batting fundamentals with reasonable scoring pace.';
        recommendation = 'Focus on improving the scoring rate and building more pressure on the opposition.';
        comparison = 'This run rate indicates a competitive ODI team that can challenge most opponents.';
      } else if (runRate >= 3.5) {
        performance = 'average';
        interpretation = 'Average ODI run rate. There is room for improvement in scoring pace and aggressive batting.';
        recommendation = 'Work on increasing the scoring rate and taking more calculated risks.';
        comparison = 'This is typical for developing ODI teams or those in challenging conditions.';
      } else if (runRate >= 2.5) {
        performance = 'below-average';
        interpretation = 'Below-average ODI run rate. Significant improvement needed in scoring pace.';
        recommendation = 'Consider more aggressive batting and taking calculated risks to increase scoring.';
        comparison = 'This suggests the need for focused practice on aggressive batting skills.';
      } else {
        performance = 'poor';
        interpretation = 'Poor ODI run rate. Immediate attention to batting approach is required.';
        recommendation = 'Seek professional coaching and focus on aggressive batting fundamentals.';
        comparison = 'This indicates a need for fundamental ODI batting skill development.';
      }
    }

    return {
      runRate,
      strikeRate,
      wicketsRemaining,
      oversRemaining,
      performance,
      interpretation,
      recommendation,
      comparison,
    };
  };

  const onSubmit = async (data: TeamRunRateFormData) => {
    setIsCalculating(true);
    
    // Simulate calculation delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const calculatedResult = calculateTeamRunRate(data);
    setResult(calculatedResult);
    setIsCalculating(false);
  };

  const resetCalculator = () => {
    form.reset();
    setResult(null);
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900';
      case 'very-good': return 'bg-gradient-to-r from-green-400 to-green-600 text-green-900';
      case 'good': return 'bg-gradient-to-r from-blue-400 to-blue-600 text-blue-900';
      case 'average': return 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900';
      case 'below-average': return 'bg-gradient-to-r from-red-400 to-red-600 text-red-900';
      case 'poor': return 'bg-gradient-to-r from-red-600 to-red-800 text-red-100';
      default: return 'bg-gray-400 text-gray-900';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <Trophy className="h-6 w-6" />;
      case 'very-good': return <Star className="h-6 w-6" />;
      case 'good': return <Award className="h-6 w-6" />;
      case 'average': return <Target className="h-6 w-6" />;
      case 'below-average': return <TrendingUp className="h-6 w-6" />;
      case 'poor': return <Users className="h-6 w-6" />;
      default: return <Calculator className="h-6 w-6" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Users className="h-10 w-10 text-teal-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-green-500 bg-clip-text text-transparent">
            Team Run Rate Calculator
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate your cricket team's run rate to measure overall batting performance and scoring pace.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <Card className="shadow-lg border-2 border-teal-100 hover:border-teal-200 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50">
            <CardTitle className="flex items-center space-x-2 text-teal-800">
              <Calculator className="h-6 w-6" />
              <span>Calculate Team Run Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="runsScored"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center space-x-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span>Total Runs Scored</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter total runs scored"
                          className="h-12 text-lg border-2 focus:border-teal-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oversFaced"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span>Total Overs Faced</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          placeholder="Enter total overs faced"
                          className="h-12 text-lg border-2 focus:border-teal-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Enter overs in decimal format (e.g., 5.3 for 5 overs and 3 balls)
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wicketsLost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center space-x-2">
                        <Star className="h-4 w-4 text-red-500" />
                        <span>Total Wickets Lost</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter total wickets lost"
                          className="h-12 text-lg border-2 focus:border-teal-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Enter number between 0 and 10
                      </p>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Cricket Format (Optional)</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-teal-400 transition-colors"
                          >
                            <option value="test">Test Cricket</option>
                            <option value="odi">ODI Cricket</option>
                            <option value="t20">T20 Cricket</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="innings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Innings (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Innings number"
                            className="border-2 focus:border-teal-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="ballsFaced"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Balls Faced (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Total balls faced"
                          className="border-2 focus:border-teal-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        If not provided, will be calculated from overs faced
                      </p>
                    </FormItem>
                  )}
                />

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={isCalculating}
                    className="flex-1 h-12 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isCalculating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Calculate Run Rate</span>
                      </div>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetCalculator}
                    className="h-12 px-6 border-2 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {result && (
            <Card className="shadow-lg border-2 border-green-100 animate-fade-in">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                <CardTitle className="flex items-center space-x-2 text-green-800">
                  <Trophy className="h-6 w-6" />
                  <span>Team Run Rate Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full ${getPerformanceColor(result.performance)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    {getPerformanceIcon(result.performance)}
                    <span className="text-3xl font-bold">
                      {result.runRate.toFixed(2)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="mt-3 text-sm px-3 py-1">
                    RUNS PER OVER
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Strike Rate</h4>
                    <p className="text-2xl font-bold text-green-600">{result.strikeRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Wickets Remaining</h4>
                    <p className="text-2xl font-bold text-blue-600">{result.wicketsRemaining}</p>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Overs Remaining</h4>
                  <p className="text-2xl font-bold text-purple-600">{result.oversRemaining.toFixed(1)}</p>
                </div>

                <Alert className="border-l-4 border-l-blue-500 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Interpretation:</strong> {result.interpretation}
                  </AlertDescription>
                </Alert>

                <Alert className="border-l-4 border-l-green-500 bg-green-50">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Recommendation:</strong> {result.recommendation}
                  </AlertDescription>
                </Alert>

                <Alert className="border-l-4 border-l-purple-500 bg-purple-50">
                  <Star className="h-4 w-4 text-purple-600" />
                  <AlertDescription className="text-purple-800">
                    <strong>Comparison:</strong> {result.comparison}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Quick Reference */}
          <Card className="shadow-lg border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Info className="h-6 w-6" />
                <span>Team Run Rate Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-sm">
                <div className="bg-yellow-50 p-3 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-2">T20 Cricket</h4>
                  <div className="space-y-1 text-yellow-700">
                    <div className="flex justify-between"><span>≥9.0</span><span>Elite</span></div>
                    <div className="flex justify-between"><span>8.0-8.9</span><span>Excellent</span></div>
                    <div className="flex justify-between"><span>7.0-7.9</span><span>Good</span></div>
                    <div className="flex justify-between"><span>6.0-6.9</span><span>Average</span></div>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">ODI Cricket</h4>
                  <div className="space-y-1 text-blue-700">
                    <div className="flex justify-between"><span>≥6.5</span><span>Elite</span></div>
                    <div className="flex justify-between"><span>5.5-6.4</span><span>Excellent</span></div>
                    <div className="flex justify-between"><span>4.5-5.4</span><span>Good</span></div>
                    <div className="flex justify-between"><span>3.5-4.4</span><span>Average</span></div>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">Test Cricket</h4>
                  <div className="space-y-1 text-green-700">
                    <div className="flex justify-between"><span>≥4.0</span><span>Elite</span></div>
                    <div className="flex justify-between"><span>3.5-3.9</span><span>Excellent</span></div>
                    <div className="flex justify-between"><span>3.0-3.4</span><span>Good</span></div>
                    <div className="flex justify-between"><span>2.5-2.9</span><span>Average</span></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Guide Section */}
      <Card className="shadow-lg border-2 border-purple-100">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center space-x-2 text-purple-800">
            <Info className="h-6 w-6" />
            <span>Complete Guide to Team Run Rate in Cricket</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What is Team Run Rate?</h3>
            <p className="text-gray-700 mb-4">
              Team run rate is a crucial statistic that measures how many runs a team scores per over. 
              It's calculated by dividing the total runs scored by the total overs faced. This metric 
              helps assess a team's batting performance and scoring pace throughout an innings.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Calculate Team Run Rate</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-mono text-lg text-center">
                <strong>Team Run Rate = Total Runs Scored ÷ Total Overs Faced</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Understanding Team Run Rate</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">T20 Cricket</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li><strong>≥9.0:</strong> Elite level (dominant teams)</li>
                  <li><strong>8.0-8.9:</strong> Excellent (top teams)</li>
                  <li><strong>7.0-7.9:</strong> Good (competitive teams)</li>
                  <li><strong>6.0-6.9:</strong> Average (developing teams)</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">ODI Cricket</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li><strong>≥6.5:</strong> Elite level (dominant teams)</li>
                  <li><strong>5.5-6.4:</strong> Excellent (top teams)</li>
                  <li><strong>4.5-5.4:</strong> Good (competitive teams)</li>
                  <li><strong>3.5-4.4:</strong> Average (developing teams)</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Test Cricket</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li><strong>≥4.0:</strong> Elite level (dominant teams)</li>
                  <li><strong>3.5-3.9:</strong> Excellent (top teams)</li>
                  <li><strong>3.0-3.4:</strong> Good (competitive teams)</li>
                  <li><strong>2.5-2.9:</strong> Average (developing teams)</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Factors Affecting Team Run Rate</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Batting Order:</strong> Strong top order contributes to higher run rates</li>
              <li><strong>Pitch Conditions:</strong> Batting-friendly pitches allow higher scoring</li>
              <li><strong>Bowling Quality:</strong> Weak bowling attacks enable higher run rates</li>
              <li><strong>Field Placements:</strong> Attacking fields create scoring opportunities</li>
              <li><strong>Match Situation:</strong> Pressure situations affect scoring rates</li>
              <li><strong>Team Strategy:</strong> Aggressive vs defensive approaches impact run rates</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Famous Team Run Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800">T20 World Cup 2021</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>Pakistan: 8.73</li>
                  <li>England: 8.45</li>
                  <li>Australia: 7.89</li>
                  <li>New Zealand: 7.23</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">ODI World Cup 2019</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>England: 5.87</li>
                  <li>India: 5.65</li>
                  <li>Australia: 5.43</li>
                  <li>New Zealand: 5.21</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Test Cricket (Recent)</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>England: 3.89</li>
                  <li>India: 3.45</li>
                  <li>Australia: 3.32</li>
                  <li>New Zealand: 3.18</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Related Calculators */}
      <Card className="shadow-lg border-2 border-green-100">
        <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Target className="h-6 w-6" />
            <span>Related Cricket Calculators</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
              <h4 className="font-semibold text-orange-800 mb-2">Batting Average Calculator</h4>
              <p className="text-sm text-orange-700">Calculate batting performance metrics</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
              <h4 className="font-semibold text-blue-800 mb-2">Bowling Average Calculator</h4>
              <p className="text-sm text-blue-700">Calculate bowling performance metrics</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
              <h4 className="font-semibold text-green-800 mb-2">Strike Rate Calculator</h4>
              <p className="text-sm text-green-700">Calculate batting strike rate and scoring pace</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
              <h4 className="font-semibold text-purple-800 mb-2">Economy Rate Calculator</h4>
              <p className="text-sm text-purple-700">Calculate bowler's economy rate</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
              <h4 className="font-semibold text-red-800 mb-2">Net Run Rate Calculator</h4>
              <p className="text-sm text-red-700">Calculate team NRR and tournament standings</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer">
              <h4 className="font-semibold text-indigo-800 mb-2">Fantasy Points Calculator</h4>
              <p className="text-sm text-indigo-700">Calculate fantasy cricket points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

