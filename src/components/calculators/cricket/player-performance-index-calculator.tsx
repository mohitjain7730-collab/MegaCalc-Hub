'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, Trophy, Target, TrendingUp, Info, Zap, Star, Award, Activity, BarChart3, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const performanceIndexSchema = z.object({
  runsScored: z.string().min(1, 'Runs scored is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Runs scored must be a valid number',
  }),
  ballsFaced: z.string().min(1, 'Balls faced is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Balls faced must be a valid number',
  }),
  wicketsTaken: z.string().min(1, 'Wickets taken is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Wickets taken must be a valid number',
  }),
  runsConceded: z.string().min(1, 'Runs conceded is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Runs conceded must be a valid number',
  }),
  oversBowled: z.string().min(1, 'Overs bowled is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Overs bowled must be a valid number',
  }),
  catches: z.string().optional(),
  stumpings: z.string().optional(),
  runOuts: z.string().optional(),
  format: z.enum(['test', 'odi', 't20']).optional(),
});

type PerformanceIndexFormData = z.infer<typeof performanceIndexSchema>;

interface PerformanceIndexResult {
  battingIndex: number;
  bowlingIndex: number;
  fieldingIndex: number;
  overallIndex: number;
  performance: 'excellent' | 'very-good' | 'good' | 'average' | 'below-average' | 'poor';
  interpretation: string;
  recommendation: string;
  comparison: string;
  battingAverage: number;
  strikeRate: number;
  bowlingAverage: number;
  economyRate: number;
}

export default function PlayerPerformanceIndexCalculator() {
  const [result, setResult] = useState<PerformanceIndexResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<PerformanceIndexFormData>({
    resolver: zodResolver(performanceIndexSchema),
    defaultValues: {
      runsScored: '',
      ballsFaced: '',
      wicketsTaken: '',
      runsConceded: '',
      oversBowled: '',
      catches: '',
      stumpings: '',
      runOuts: '',
      format: 'odi',
    },
  });

  const calculatePerformanceIndex = (data: PerformanceIndexFormData): PerformanceIndexResult => {
    const runsScored = Number(data.runsScored);
    const ballsFaced = Number(data.ballsFaced);
    const wicketsTaken = Number(data.wicketsTaken);
    const runsConceded = Number(data.runsConceded);
    const oversBowled = Number(data.oversBowled);
    const catches = Number(data.catches) || 0;
    const stumpings = Number(data.stumpings) || 0;
    const runOuts = Number(data.runOuts) || 0;
    const format = data.format || 'odi';
    
    if (ballsFaced === 0 && oversBowled === 0) {
      return {
        battingIndex: 0,
        bowlingIndex: 0,
        fieldingIndex: 0,
        overallIndex: 0,
        battingAverage: 0,
        strikeRate: 0,
        bowlingAverage: 0,
        economyRate: 0,
        performance: 'poor',
        interpretation: 'No batting or bowling data provided. Please enter your performance statistics.',
        recommendation: 'Start playing cricket to build your performance statistics.',
        comparison: 'This scenario indicates the player has not yet participated in matches.',
      };
    }

    // Calculate basic statistics
    const battingAverage = ballsFaced > 0 ? runsScored / Math.max(1, ballsFaced / 6) : 0; // Assuming 1 dismissal per 6 balls
    const strikeRate = ballsFaced > 0 ? (runsScored / ballsFaced) * 100 : 0;
    const bowlingAverage = wicketsTaken > 0 ? runsConceded / wicketsTaken : runsConceded;
    const economyRate = oversBowled > 0 ? runsConceded / oversBowled : 0;

    // Calculate performance indices (0-100 scale)
    let battingIndex = 0;
    let bowlingIndex = 0;
    let fieldingIndex = 0;

    // Batting Index Calculation
    if (ballsFaced > 0) {
      const averageScore = Math.min(100, (battingAverage / 50) * 100); // 50 average = 100 points
      const strikeRateScore = Math.min(100, (strikeRate / 150) * 100); // 150 SR = 100 points
      battingIndex = (averageScore * 0.6) + (strikeRateScore * 0.4);
    }

    // Bowling Index Calculation
    if (oversBowled > 0) {
      const averageScore = Math.max(0, Math.min(100, 100 - (bowlingAverage / 50) * 100)); // Lower average = higher score
      const economyScore = Math.max(0, Math.min(100, 100 - (economyRate / 10) * 100)); // Lower economy = higher score
      const wicketScore = Math.min(100, (wicketsTaken / 5) * 100); // 5 wickets = 100 points
      bowlingIndex = (averageScore * 0.4) + (economyScore * 0.3) + (wicketScore * 0.3);
    }

    // Fielding Index Calculation
    const totalFielding = catches + stumpings + runOuts;
    fieldingIndex = Math.min(100, (totalFielding / 10) * 100); // 10 fielding contributions = 100 points

    // Overall Index Calculation
    const overallIndex = (battingIndex * 0.4) + (bowlingIndex * 0.4) + (fieldingIndex * 0.2);
    
    let performance: PerformanceIndexResult['performance'];
    let interpretation: string;
    let recommendation: string;
    let comparison: string;

    if (overallIndex >= 80) {
      performance = 'excellent';
      interpretation = 'Outstanding overall performance! You are among the elite all-rounders with exceptional skills in all departments.';
      recommendation = 'You are performing at the highest level. Focus on maintaining this form and mentoring other players.';
      comparison = 'This performance puts you in the company of legendary all-rounders like Jacques Kallis, Imran Khan, and Kapil Dev.';
    } else if (overallIndex >= 65) {
      performance = 'very-good';
      interpretation = 'Excellent overall performance! You demonstrate strong all-round skills and good consistency across all departments.';
      recommendation = 'Continue working on your weaker areas to push towards the elite level.';
      comparison = 'This is comparable to top international all-rounders and shows professional-level performance.';
    } else if (overallIndex >= 50) {
      performance = 'good';
      interpretation = 'Good overall performance! You show solid fundamentals and reasonable consistency across batting, bowling, and fielding.';
      recommendation = 'Focus on improving your weaker areas and building more consistency.';
      comparison = 'This indicates a reliable all-rounder who can contribute consistently to the team.';
    } else if (overallIndex >= 35) {
      performance = 'average';
      interpretation = 'Average overall performance. There is room for improvement in consistency and skill development across all departments.';
      recommendation = 'Work on developing your weaker areas and improving overall consistency.';
      comparison = 'This is typical for developing players or those in challenging conditions.';
    } else if (overallIndex >= 20) {
      performance = 'below-average';
      interpretation = 'Below-average overall performance. Significant improvement needed in all-round skills and consistency.';
      recommendation = 'Consider working with coaches to improve your technique and consistency across all departments.';
      comparison = 'This suggests the need for focused practice and skill development.';
    } else {
      performance = 'poor';
      interpretation = 'Poor overall performance. Immediate attention to fundamental skills is required across all departments.';
      recommendation = 'Seek professional coaching and dedicate time to basic practice in batting, bowling, and fielding.';
      comparison = 'This indicates a need for fundamental skill development and confidence building.';
    }

    return {
      battingIndex,
      bowlingIndex,
      fieldingIndex,
      overallIndex,
      battingAverage,
      strikeRate,
      bowlingAverage,
      economyRate,
      performance,
      interpretation,
      recommendation,
      comparison,
    };
  };

  const onSubmit = async (data: PerformanceIndexFormData) => {
    setIsCalculating(true);
    
    // Simulate calculation delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const calculatedResult = calculatePerformanceIndex(data);
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
      case 'poor': return <BarChart3 className="h-6 w-6" />;
      default: return <Calculator className="h-6 w-6" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <BarChart3 className="h-10 w-10 text-indigo-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Player Performance Index Calculator
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate your comprehensive cricket performance index across batting, bowling, and fielding to measure your all-round abilities.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <Card className="shadow-lg border-2 border-indigo-100 hover:border-indigo-200 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center space-x-2 text-indigo-800">
              <Calculator className="h-6 w-6" />
              <span>Calculate Your Performance Index</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="runsScored"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center space-x-2">
                          <Target className="h-4 w-4 text-green-500" />
                          <span>Runs Scored</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Runs scored"
                            className="h-12 text-lg border-2 focus:border-indigo-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ballsFaced"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center space-x-2">
                          <Zap className="h-4 w-4 text-blue-500" />
                          <span>Balls Faced</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Balls faced"
                            className="h-12 text-lg border-2 focus:border-indigo-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="wicketsTaken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center space-x-2">
                          <Star className="h-4 w-4 text-red-500" />
                          <span>Wickets Taken</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Wickets taken"
                            className="h-12 text-lg border-2 focus:border-indigo-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="runsConceded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-orange-500" />
                          <span>Runs Conceded</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Runs conceded"
                            className="h-12 text-lg border-2 focus:border-indigo-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="oversBowled"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span>Overs Bowled</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          placeholder="Overs bowled"
                          className="h-12 text-lg border-2 focus:border-indigo-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="catches"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Catches</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Catches"
                            className="border-2 focus:border-indigo-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stumpings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Stumpings</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Stumpings"
                            className="border-2 focus:border-indigo-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="runOuts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Run Outs</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Run outs"
                            className="border-2 focus:border-indigo-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Cricket Format (Optional)</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-indigo-400 transition-colors"
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

                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={isCalculating}
                    className="flex-1 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isCalculating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Calculate Index</span>
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
                  <span>Performance Index Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full ${getPerformanceColor(result.performance)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    {getPerformanceIcon(result.performance)}
                    <span className="text-3xl font-bold">
                      {result.overallIndex.toFixed(0)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="mt-3 text-sm px-3 py-1">
                    OVERALL PERFORMANCE INDEX
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Batting Index</h4>
                    <p className="text-2xl font-bold text-green-600">{result.battingIndex.toFixed(0)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Bowling Index</h4>
                    <p className="text-2xl font-bold text-blue-600">{result.bowlingIndex.toFixed(0)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Fielding Index</h4>
                    <p className="text-2xl font-bold text-purple-600">{result.fieldingIndex.toFixed(0)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Batting Average</h4>
                    <p className="text-2xl font-bold text-orange-600">{result.battingAverage.toFixed(2)}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Strike Rate</h4>
                    <p className="text-2xl font-bold text-red-600">{result.strikeRate.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-indigo-800 mb-2">Bowling Average</h4>
                    <p className="text-2xl font-bold text-indigo-600">{result.bowlingAverage.toFixed(2)}</p>
                  </div>
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-cyan-800 mb-2">Economy Rate</h4>
                    <p className="text-2xl font-bold text-cyan-600">{result.economyRate.toFixed(2)}</p>
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
                <span>Performance Index Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="font-medium">80-100</span>
                  <span className="text-yellow-700">Elite Level</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium">65-79</span>
                  <span className="text-green-700">Excellent</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-medium">50-64</span>
                  <span className="text-blue-700">Good</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                  <span className="font-medium">35-49</span>
                  <span className="text-orange-700">Average</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-medium">0-34</span>
                  <span className="text-red-700">Needs Improvement</span>
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
            <span>Complete Guide to Player Performance Index</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What is Player Performance Index?</h3>
            <p className="text-gray-700 mb-4">
              Player Performance Index is a comprehensive metric that evaluates a cricketer's overall contribution 
              across batting, bowling, and fielding. It provides a single score (0-100) that represents the player's 
              all-round abilities and overall impact on the game.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">How Performance Index is Calculated</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-mono text-lg text-center">
                <strong>Overall Index = (Batting Index × 0.4) + (Bowling Index × 0.4) + (Fielding Index × 0.2)</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Component Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Batting Index (40%)</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>Batting Average (60%)</li>
                  <li>Strike Rate (40%)</li>
                  <li>Based on runs and balls faced</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Bowling Index (40%)</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>Bowling Average (40%)</li>
                  <li>Economy Rate (30%)</li>
                  <li>Wickets Taken (30%)</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Fielding Index (20%)</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>Catches</li>
                  <li>Stumpings</li>
                  <li>Run Outs</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Understanding Your Results</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>80-100:</strong> Elite level performance, comparable to legendary all-rounders</li>
              <li><strong>65-79:</strong> Excellent performance, international standard</li>
              <li><strong>50-64:</strong> Good performance, reliable team player</li>
              <li><strong>35-49:</strong> Average performance, room for improvement</li>
              <li><strong>0-34:</strong> Needs significant improvement in all departments</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Famous All-Rounders Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Test Cricket</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>Jacques Kallis: 95+ (Legendary)</li>
                  <li>Imran Khan: 90+ (Legendary)</li>
                  <li>Kapil Dev: 85+ (Legendary)</li>
                  <li>Ian Botham: 80+ (Excellent)</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">ODI Cricket</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>Jacques Kallis: 90+ (Legendary)</li>
                  <li>Shakib Al Hasan: 85+ (Excellent)</li>
                  <li>Ben Stokes: 80+ (Excellent)</li>
                  <li>Ravindra Jadeja: 75+ (Very Good)</li>
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
