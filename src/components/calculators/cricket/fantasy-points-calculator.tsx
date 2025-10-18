'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, Trophy, Target, TrendingUp, Info, Zap, Star, Award, Activity, Gamepad2, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const fantasyPointsSchema = z.object({
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
  maidenOvers: z.string().optional(),
  format: z.enum(['odi', 't20']).optional(),
  bonusPoints: z.string().optional(),
});

type FantasyPointsFormData = z.infer<typeof fantasyPointsSchema>;

interface FantasyPointsResult {
  battingPoints: number;
  bowlingPoints: number;
  fieldingPoints: number;
  bonusPoints: number;
  totalPoints: number;
  performance: 'excellent' | 'very-good' | 'good' | 'average' | 'below-average' | 'poor';
  interpretation: string;
  recommendation: string;
  comparison: string;
  strikeRate: number;
  economyRate: number;
}

export default function FantasyPointsCalculator() {
  const [result, setResult] = useState<FantasyPointsResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<FantasyPointsFormData>({
    resolver: zodResolver(fantasyPointsSchema),
    defaultValues: {
      runsScored: '',
      ballsFaced: '',
      wicketsTaken: '',
      runsConceded: '',
      oversBowled: '',
      catches: '',
      stumpings: '',
      runOuts: '',
      maidenOvers: '',
      format: 'odi',
      bonusPoints: '',
    },
  });

  const calculateFantasyPoints = (data: FantasyPointsFormData): FantasyPointsResult => {
    const runsScored = Number(data.runsScored);
    const ballsFaced = Number(data.ballsFaced);
    const wicketsTaken = Number(data.wicketsTaken);
    const runsConceded = Number(data.runsConceded);
    const oversBowled = Number(data.oversBowled);
    const catches = Number(data.catches) || 0;
    const stumpings = Number(data.stumpings) || 0;
    const runOuts = Number(data.runOuts) || 0;
    const maidenOvers = Number(data.maidenOvers) || 0;
    const format = data.format || 'odi';
    const bonusPoints = Number(data.bonusPoints) || 0;
    
    if (ballsFaced === 0 && oversBowled === 0) {
      return {
        battingPoints: 0,
        bowlingPoints: 0,
        fieldingPoints: 0,
        bonusPoints: 0,
        totalPoints: 0,
        strikeRate: 0,
        economyRate: 0,
        performance: 'poor',
        interpretation: 'No batting or bowling data provided. Please enter your performance statistics.',
        recommendation: 'Start playing cricket to build your fantasy points.',
        comparison: 'This scenario indicates the player has not yet participated in matches.',
      };
    }

    // Calculate basic statistics
    const strikeRate = ballsFaced > 0 ? (runsScored / ballsFaced) * 100 : 0;
    const economyRate = oversBowled > 0 ? runsConceded / oversBowled : 0;

    // Fantasy Points Calculation (Standard Fantasy Cricket Scoring)
    let battingPoints = 0;
    let bowlingPoints = 0;
    let fieldingPoints = 0;

    // Batting Points
    if (ballsFaced > 0) {
      battingPoints = runsScored * 1; // 1 point per run
      
      // Strike Rate Bonuses
      if (strikeRate >= 200) {
        battingPoints += 6; // 6 bonus points for 200+ SR
      } else if (strikeRate >= 150) {
        battingPoints += 4; // 4 bonus points for 150+ SR
      } else if (strikeRate >= 100) {
        battingPoints += 2; // 2 bonus points for 100+ SR
      }
      
      // Milestone Bonuses
      if (runsScored >= 100) {
        battingPoints += 16; // 16 bonus points for century
      } else if (runsScored >= 50) {
        battingPoints += 8; // 8 bonus points for half-century
      } else if (runsScored >= 30) {
        battingPoints += 4; // 4 bonus points for 30+ runs
      }
    }

    // Bowling Points
    if (oversBowled > 0) {
      bowlingPoints = wicketsTaken * 25; // 25 points per wicket
      
      // Economy Rate Bonuses
      if (economyRate <= 4) {
        bowlingPoints += 6; // 6 bonus points for economy ≤ 4
      } else if (economyRate <= 5) {
        bowlingPoints += 4; // 4 bonus points for economy ≤ 5
      } else if (economyRate <= 6) {
        bowlingPoints += 2; // 2 bonus points for economy ≤ 6
      }
      
      // Wicket Milestones
      if (wicketsTaken >= 5) {
        bowlingPoints += 16; // 16 bonus points for 5-wicket haul
      } else if (wicketsTaken >= 4) {
        bowlingPoints += 8; // 8 bonus points for ford-wicket haul
      } else if (wicketsTaken >= 3) {
        bowlingPoints += 4; // 4 bonus points for 3-wicket haul
      }
      
      // Maiden Overs
      bowlingPoints += maidenOvers * 4; // 4 points per maiden over
    }

    // Fielding Points
    fieldingPoints = (catches * 8) + (stumpings * 12) + (runOuts * 6); // 8 points per catch, 12 per stumping, 6 per run out

    const totalPoints = battingPoints + bowlingPoints + fieldingPoints + bonusPoints;
    
    let performance: FantasyPointsResult['performance'];
    let interpretation: string;
    let recommendation: string;
    let comparison: string;

    if (totalPoints >= 100) {
      performance = 'excellent';
      interpretation = 'Outstanding fantasy performance! You are among the top performers with exceptional all-round contributions.';
      recommendation = 'You are performing at the highest level. Continue this excellent form and maintain consistency.';
      comparison = 'This performance puts you among the elite fantasy cricket players and top performers.';
    } else if (totalPoints >= 75) {
      performance = 'very-good';
      interpretation = 'Excellent fantasy performance! You demonstrate strong all-round skills and good consistency.';
      recommendation = 'Continue working on maintaining this level of performance across all departments.';
      comparison = 'This is comparable to top fantasy cricket performers and shows professional-level performance.';
    } else if (totalPoints >= 50) {
      performance = 'good';
      interpretation = 'Good fantasy performance! You show solid fundamentals and reasonable consistency across batting, bowling, and fielding.';
      recommendation = 'Focus on improving your weaker areas and building more consistency.';
      comparison = 'This indicates a reliable fantasy cricket player who can contribute consistently to your team.';
    } else if (totalPoints >= 25) {
      performance = 'average';
      interpretation = 'Average fantasy performance. There is room for improvement in consistency and skill development across all departments.';
      recommendation = 'Work on developing your weaker areas and improving overall consistency.';
      comparison = 'This is typical for developing fantasy cricket players or those in challenging conditions.';
    } else if (totalPoints >= 10) {
      performance = 'below-average';
      interpretation = 'Below-average fantasy performance. Significant improvement needed in all-round skills and consistency.';
      recommendation = 'Consider working with coaches to improve your technique and consistency across all departments.';
      comparison = 'This suggests the need for focused practice and skill development.';
    } else {
      performance = 'poor';
      interpretation = 'Poor fantasy performance. Immediate attention to fundamental skills is required across all departments.';
      recommendation = 'Seek professional coaching and dedicate time to basic practice in batting, bowling, and fielding.';
      comparison = 'This indicates a need for fundamental skill development and confidence building.';
    }

    return {
      battingPoints,
      bowlingPoints,
      fieldingPoints,
      bonusPoints,
      totalPoints,
      strikeRate,
      economyRate,
      performance,
      interpretation,
      recommendation,
      comparison,
    };
  };

  const onSubmit = async (data: FantasyPointsFormData) => {
    setIsCalculating(true);
    
    // Simulate calculation delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const calculatedResult = calculateFantasyPoints(data);
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
      case 'poor': return <Gamepad2 className="h-6 w-6" />;
      default: return <Calculator className="h-6 w-6" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Gamepad2 className="h-10 w-10 text-pink-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            Fantasy Points Calculator
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate your fantasy cricket points based on batting, bowling, and fielding performance to track your fantasy league success.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <Card className="shadow-lg border-2 border-pink-100 hover:border-pink-200 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50">
            <CardTitle className="flex items-center space-x-2 text-pink-800">
              <Calculator className="h-6 w-6" />
              <span>Calculate Your Fantasy Points</span>
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
                            className="h-12 text-lg border-2 focus:border-pink-400 transition-colors"
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
                            className="h-12 text-lg border-2 focus:border-pink-400 transition-colors"
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
                            className="h-12 text-lg border-2 focus:border-pink-400 transition-colors"
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
                            className="h-12 text-lg border-2 focus:border-pink-400 transition-colors"
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
                            className="h-12 text-lg border-2 focus:border-pink-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maidenOvers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Maiden Overs</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Maiden overs"
                            className="border-2 focus:border-pink-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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
                            className="border-2 focus:border-pink-400 transition-colors"
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
                            className="border-2 focus:border-pink-400 transition-colors"
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
                            className="border-2 focus:border-pink-400 transition-colors"
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
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Cricket Format (Optional)</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-pink-400 transition-colors"
                          >
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
                    name="bonusPoints"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Bonus Points (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Bonus points"
                            className="border-2 focus:border-pink-400 transition-colors"
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
                    className="flex-1 h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isCalculating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Calculate Points</span>
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
                  <span>Fantasy Points Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full ${getPerformanceColor(result.performance)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    {getPerformanceIcon(result.performance)}
                    <span className="text-3xl font-bold">
                      {result.totalPoints.toFixed(0)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="mt-3 text-sm px-3 py-1">
                    TOTAL FANTASY POINTS
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Batting Points</h4>
                    <p className="text-2xl font-bold text-green-600">{result.battingPoints.toFixed(0)}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Bowling Points</h4>
                    <p className="text-2xl font-bold text-blue-600">{result.bowlingPoints.toFixed(0)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Fielding Points</h4>
                    <p className="text-2xl font-bold text-purple-600">{result.fieldingPoints.toFixed(0)}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-800 mb-2">Bonus Points</h4>
                    <p className="text-2xl font-bold text-orange-600">{result.bonusPoints.toFixed(0)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cyan-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-cyan-800 mb-2">Strike Rate</h4>
                    <p className="text-2xl font-bold text-cyan-600">{result.strikeRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Economy Rate</h4>
                    <p className="text-2xl font-bold text-red-600">{result.economyRate.toFixed(2)}</p>
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
                <span>Fantasy Points Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="font-medium">100+</span>
                  <span className="text-yellow-700">Elite Performance</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium">75-99</span>
                  <span className="text-green-700">Excellent</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-medium">50-74</span>
                  <span className="text-blue-700">Good</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                  <span className="font-medium">25-49</span>
                  <span className="text-orange-700">Average</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-medium">0-24</span>
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
            <span>Complete Guide to Fantasy Cricket Points</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What are Fantasy Cricket Points?</h3>
            <p className="text-gray-700 mb-4">
              Fantasy cricket points are a scoring system used in fantasy cricket leagues to evaluate player performance. 
              Players earn points based on their batting, bowling, and fielding contributions in real matches. 
              These points help fantasy team managers assess player value and make strategic decisions.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Fantasy Points Scoring System</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Batting Points</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>1 point per run</li>
                  <li>4 points for 30+ runs</li>
                  <li>8 points for 50+ runs</li>
                  <li>16 points for 100+ runs</li>
                  <li>Strike rate bonuses</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Bowling Points</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>25 points per wicket</li>
                  <li>4 points for 3-wicket haul</li>
                  <li>8 points for 4-wicket haul</li>
                  <li>16 points for 5-wicket haul</li>
                  <li>4 points per maiden over</li>
                </ul>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Fielding Points</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>8 points per catch</li>
                  <li>12 points per stumping</li>
                  <li>6 points per run out</li>
                  <li>Bonus points for fielding</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Understanding Your Results</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>100+ Points:</strong> Elite level performance, top fantasy player</li>
              <li><strong>75-99 Points:</strong> Excellent performance, valuable fantasy asset</li>
              <li><strong>50-74 Points:</strong> Good performance, reliable fantasy pick</li>
              <li><strong>25-49 Points:</strong> Average performance, decent fantasy value</li>
              <li><strong>0-24 Points:</strong> Poor performance, avoid in fantasy teams</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Fantasy Cricket Tips</h3>
            <ol className="space-y-2 text-gray-700">
              <li><strong>All-Rounders:</strong> Choose players who contribute in multiple departments</li>
              <li><strong>Form Players:</strong> Pick players in good form and confidence</li>
              <li><strong>Pitch Conditions:</strong> Consider pitch conditions for batting/bowling choices</li>
              <li><strong>Captain Choice:</strong> Select captain who can score maximum points</li>
              <li><strong>Vice-Captain:</strong> Choose reliable vice-captain as backup</li>
              <li><strong>Budget Management:</strong> Balance expensive and budget players</li>
              <li><strong>Team Combination:</strong> Maintain proper batting/bowling balance</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Famous Fantasy Performers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800">T20 Cricket</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>Andre Russell: 150+ points</li>
                  <li>Glenn Maxwell: 120+ points</li>
                  <li>AB de Villiers: 110+ points</li>
                  <li>Sunil Narine: 100+ points</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">ODI Cricket</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>Virat Kohli: 120+ points</li>
                  <li>Rohit Sharma: 110+ points</li>
                  <li>Ben Stokes: 100+ points</li>
                  <li>Shakib Al Hasan: 95+ points</li>
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
              <h4 className="font-semibold text-indigo-800 mb-2">Player Performance Index</h4>
              <p className="text-sm text-indigo-700">Calculate comprehensive player performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
