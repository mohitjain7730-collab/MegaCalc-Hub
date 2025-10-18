'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, Trophy, Target, TrendingUp, Info, Zap, Star, Award, Activity, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const requiredRunRateSchema = z.object({
  targetRuns: z.string().min(1, 'Target runs is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Target runs must be a valid number',
  }),
  runsScored: z.string().min(1, 'Runs scored is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Runs scored must be a valid number',
  }),
  oversPlayed: z.string().min(1, 'Overs played is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Overs played must be a valid number',
  }),
  oversRemaining: z.string().min(1, 'Overs remaining is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Overs remaining must be a valid positive number',
  }),
  wicketsLost: z.string().min(1, 'Wickets lost is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 10, {
    message: 'Wickets lost must be between 0 and 10',
  }),
  format: z.enum(['test', 'odi', 't20']).optional(),
  ballsRemaining: z.string().optional(),
});

type RequiredRunRateFormData = z.infer<typeof requiredRunRateSchema>;

interface RequiredRunRateResult {
  requiredRuns: number;
  requiredRunRate: number;
  requiredStrikeRate: number;
  performance: 'excellent' | 'very-good' | 'good' | 'average' | 'below-average' | 'poor';
  interpretation: string;
  recommendation: string;
  comparison: string;
  currentRunRate: number;
  runRateDifference: number;
}

export default function RequiredRunRateCalculator() {
  const [result, setResult] = useState<RequiredRunRateResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<RequiredRunRateFormData>({
    resolver: zodResolver(requiredRunRateSchema),
    defaultValues: {
      targetRuns: '',
      runsScored: '',
      oversPlayed: '',
      oversRemaining: '',
      wicketsLost: '',
      format: 'odi',
      ballsRemaining: '',
    },
  });

  const calculateRequiredRunRate = (data: RequiredRunRateFormData): RequiredRunRateResult => {
    const targetRuns = Number(data.targetRuns);
    const runsScored = Number(data.runsScored);
    const oversPlayed = Number(data.oversPlayed);
    const oversRemaining = Number(data.oversRemaining);
    const wicketsLost = Number(data.wicketsLost);
    const format = data.format || 'odi';
    const ballsRemaining = Number(data.ballsRemaining) || oversRemaining * 6;
    
    if (oversRemaining === 0 || ballsRemaining === 0) {
      return {
        requiredRuns: 0,
        requiredRunRate: 0,
        requiredStrikeRate: 0,
        currentRunRate: 0,
        runRateDifference: 0,
        performance: 'poor',
        interpretation: 'No overs or balls remaining. The match is over.',
        recommendation: 'Analyze your performance for future matches.',
        comparison: 'This scenario indicates the match has concluded.',
      };
    }

    const requiredRuns = Math.max(0, targetRuns - runsScored);
    const requiredRunRate = requiredRuns / oversRemaining;
    const requiredStrikeRate = (requiredRuns / ballsRemaining) * 100;
    
    // Calculate current run rate using actual overs played
    const currentRunRate = oversPlayed > 0 ? runsScored / oversPlayed : 0;
    const runRateDifference = requiredRunRate - currentRunRate;
    
    let performance: RequiredRunRateResult['performance'];
    let interpretation: string;
    let recommendation: string;
    let comparison: string;

    if (runRateDifference <= -2) {
      performance = 'excellent';
      interpretation = 'Outstanding position! You are well ahead of the required run rate and in a commanding position.';
      recommendation = 'Continue your current approach and maintain the pressure on the opposition.';
      comparison = 'This performance puts you in a very strong position to win the match.';
    } else if (runRateDifference <= -1) {
      performance = 'very-good';
      interpretation = 'Excellent position! You are ahead of the required run rate and in a good position.';
      recommendation = 'Continue maintaining your current run rate and build on your advantage.';
      comparison = 'This is a strong position that gives you a good chance of victory.';
    } else if (runRateDifference <= 0) {
      performance = 'good';
      interpretation = 'Good position! You are on track with the required run rate and in a competitive position.';
      recommendation = 'Focus on maintaining your current approach and staying ahead of the required rate.';
      comparison = 'This indicates a competitive position in the match.';
    } else if (runRateDifference <= 1) {
      performance = 'average';
      interpretation = 'Average position. You are slightly behind the required run rate but still in contention.';
      recommendation = 'Work on increasing your run rate to get back on track with the required rate.';
      comparison = 'This suggests the need for a slight acceleration in scoring.';
    } else if (runRateDifference <= 2) {
      performance = 'below-average';
      interpretation = 'Below-average position. You are behind the required run rate and need to accelerate.';
      recommendation = 'Consider taking more risks and increasing your scoring rate significantly.';
      comparison = 'This indicates a need for aggressive batting to get back in the game.';
    } else {
      performance = 'poor';
      interpretation = 'Poor position. You are significantly behind the required run rate and in a difficult position.';
      recommendation = 'Immediate aggressive batting required to get back into contention.';
      comparison = 'This suggests a very challenging situation that requires exceptional performance.';
    }

    return {
      requiredRuns,
      requiredRunRate,
      requiredStrikeRate,
      currentRunRate,
      runRateDifference,
      performance,
      interpretation,
      recommendation,
      comparison,
    };
  };

  const onSubmit = async (data: RequiredRunRateFormData) => {
    setIsCalculating(true);
    
    // Simulate calculation delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const calculatedResult = calculateRequiredRunRate(data);
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
      case 'poor': return <Clock className="h-6 w-6" />;
      default: return <Calculator className="h-6 w-6" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Clock className="h-10 w-10 text-red-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Required Run Rate Calculator
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate the required run rate to achieve your target in cricket matches with time pressure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <Card className="shadow-lg border-2 border-red-100 hover:border-red-200 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <Calculator className="h-6 w-6" />
              <span>Calculate Required Run Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="targetRuns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center space-x-2">
                        <Target className="h-4 w-4 text-green-500" />
                        <span>Target Runs</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter target runs"
                          className="h-12 text-lg border-2 focus:border-red-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        The total runs you need to score to win
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="runsScored"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span>Runs Scored</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter runs scored so far"
                          className="h-12 text-lg border-2 focus:border-red-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="oversPlayed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-orange-500" />
                          <span>Overs Played</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            placeholder="Overs played so far"
                            className="h-12 text-lg border-2 focus:border-red-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-sm text-muted-foreground">
                          Overs completed to score the runs above
                        </p>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="oversRemaining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-purple-500" />
                          <span>Overs Remaining</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            placeholder="Overs remaining"
                            className="h-12 text-lg border-2 focus:border-red-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="wicketsLost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center space-x-2">
                        <Star className="h-4 w-4 text-red-500" />
                        <span>Wickets Lost</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Wickets lost"
                          className="h-12 text-lg border-2 focus:border-red-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
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
                            className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-red-400 transition-colors"
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
                    name="ballsRemaining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Balls Remaining (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Balls remaining"
                            className="border-2 focus:border-red-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={isCalculating}
                    className="flex-1 h-12 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isCalculating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Calculate Required Rate</span>
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
                  <span>Required Run Rate Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full ${getPerformanceColor(result.performance)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    {getPerformanceIcon(result.performance)}
                    <span className="text-3xl font-bold">
                      {result.requiredRunRate.toFixed(2)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="mt-3 text-sm px-3 py-1">
                    REQUIRED RUN RATE
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Required Runs</h4>
                    <p className="text-2xl font-bold text-green-600">{result.requiredRuns.toFixed(0)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Required Strike Rate</h4>
                    <p className="text-2xl font-bold text-blue-600">{result.requiredStrikeRate.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Current Run Rate</h4>
                    <p className="text-2xl font-bold text-orange-600">{result.currentRunRate.toFixed(2)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Rate Difference</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {result.runRateDifference >= 0 ? '+' : ''}{result.runRateDifference.toFixed(2)}
                    </p>
                  </div>
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
                <span>Run Rate Performance Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="font-medium">Well Ahead</span>
                  <span className="text-yellow-700">Excellent Position</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium">Ahead</span>
                  <span className="text-green-700">Good Position</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-medium">On Track</span>
                  <span className="text-blue-700">Competitive</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                  <span className="font-medium">Slightly Behind</span>
                  <span className="text-orange-700">Need Acceleration</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-medium">Behind</span>
                  <span className="text-red-700">Need Aggressive Batting</span>
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
            <span>Complete Guide to Required Run Rate in Cricket</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What is Required Run Rate?</h3>
            <p className="text-gray-700 mb-4">
              Required run rate is the rate at which a team needs to score runs to achieve their target within 
              the remaining overs. It's calculated by dividing the remaining runs needed by the remaining overs. 
              This metric is crucial for planning batting strategy in limited-overs cricket.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Calculate Required Run Rate</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-mono text-lg text-center">
                <strong>Required Run Rate = (Target Runs - Runs Scored) ÷ Overs Remaining</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Understanding Required Run Rate</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Ahead of Required Rate</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>Team is in a strong position</li>
                  <li>Continue current approach</li>
                  <li>Maintain pressure on opposition</li>
                  <li>Focus on wicket preservation</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Behind Required Rate</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>Team needs to accelerate</li>
                  <li>Take calculated risks</li>
                  <li>Focus on increasing run rate</li>
                  <li>Balance aggression with wicket preservation</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Factors Affecting Required Run Rate</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Wickets in Hand:</strong> More wickets allow for more aggressive batting</li>
              <li><strong>Overs Remaining:</strong> Fewer overs require higher run rates</li>
              <li><strong>Pitch Conditions:</strong> Batting-friendly pitches allow higher scoring</li>
              <li><strong>Bowling Quality:</strong> Strong bowling attacks make scoring harder</li>
              <li><strong>Field Restrictions:</strong> Powerplay overs offer scoring opportunities</li>
              <li><strong>Match Situation:</strong> Pressure situations affect decision making</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Strategies for Different Required Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Low Required Rate (≤6 RPO)</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>Focus on singles and doubles</li>
                  <li>Minimize risk taking</li>
                  <li>Preserve wickets</li>
                  <li>Build partnerships</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800">Medium Required Rate (7-9 RPO)</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>Mix of singles and boundaries</li>
                  <li>Occasional risk taking</li>
                  <li>Target weak bowlers</li>
                  <li>Maintain steady scoring</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800">High Required Rate (≥10 RPO)</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>Aggressive boundary hitting</li>
                  <li>High risk, high reward shots</li>
                  <li>Target every ball</li>
                  <li>Sacrifice wickets for runs</li>
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

