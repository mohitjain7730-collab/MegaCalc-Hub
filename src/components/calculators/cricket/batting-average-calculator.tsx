'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, Trophy, Target, TrendingUp, Info, Zap, Star, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const battingAverageSchema = z.object({
  runsScored: z.string().min(1, 'Runs scored is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Runs scored must be a valid number',
  }),
  dismissals: z.string().min(1, 'Number of dismissals is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Number of dismissals must be a valid number',
  }),
  innings: z.string().optional(),
  notOuts: z.string().optional(),
});

type BattingAverageFormData = z.infer<typeof battingAverageSchema>;

interface BattingAverageResult {
  battingAverage: number;
  performance: 'excellent' | 'very-good' | 'good' | 'average' | 'below-average' | 'poor';
  interpretation: string;
  recommendation: string;
  comparison: string;
}

export default function BattingAverageCalculator() {
  const [result, setResult] = useState<BattingAverageResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<BattingAverageFormData>({
    resolver: zodResolver(battingAverageSchema),
    defaultValues: {
      runsScored: '',
      dismissals: '',
      innings: '',
      notOuts: '',
    },
  });

  const calculateBattingAverage = (data: BattingAverageFormData): BattingAverageResult => {
    const runs = Number(data.runsScored);
    const dismissals = Number(data.dismissals);
    
    if (dismissals === 0) {
      return {
        battingAverage: runs,
        performance: 'excellent',
        interpretation: 'Undefeated innings! This is an exceptional performance.',
        recommendation: 'Maintain this form and continue building on your success.',
        comparison: 'This is a rare achievement in cricket, showing excellent batting skills.',
      };
    }

    const battingAverage = runs / dismissals;
    
    let performance: BattingAverageResult['performance'];
    let interpretation: string;
    let recommendation: string;
    let comparison: string;

    if (battingAverage >= 60) {
      performance = 'excellent';
      interpretation = 'Outstanding batting average! You are among the elite batsmen with exceptional consistency and skill.';
      recommendation = 'You are performing at the highest level. Focus on maintaining this form and mentoring other players.';
      comparison = 'This average puts you in the company of legendary batsmen like Don Bradman, Sachin Tendulkar, and Virat Kohli.';
    } else if (battingAverage >= 45) {
      performance = 'very-good';
      interpretation = 'Excellent batting average! You demonstrate strong batting skills and good consistency.';
      recommendation = 'Continue working on your technique and mental game to push towards the elite level.';
      comparison = 'This is comparable to top international batsmen and shows professional-level performance.';
    } else if (battingAverage >= 35) {
      performance = 'good';
      interpretation = 'Good batting average! You show solid batting fundamentals and reasonable consistency.';
      recommendation = 'Focus on improving your shot selection and building longer innings to increase your average.';
      comparison = 'This average indicates a reliable batsman who can contribute consistently to the team.';
    } else if (battingAverage >= 25) {
      performance = 'average';
      interpretation = 'Average batting performance. There is room for improvement in consistency and technique.';
      recommendation = 'Work on your batting technique, shot selection, and mental approach to the game.';
      comparison = 'This is typical for developing players or those in challenging conditions.';
    } else if (battingAverage >= 15) {
      performance = 'below-average';
      interpretation = 'Below-average batting performance. Significant improvement needed in batting skills.';
      recommendation = 'Consider working with a batting coach to improve your technique and confidence.';
      comparison = 'This suggests the need for focused practice and skill development.';
    } else {
      performance = 'poor';
      interpretation = 'Poor batting performance. Immediate attention to batting fundamentals is required.';
      recommendation = 'Seek professional coaching and dedicate time to basic batting practice and technique.';
      comparison = 'This indicates a need for fundamental skill development and confidence building.';
    }

    return {
      battingAverage,
      performance,
      interpretation,
      recommendation,
      comparison,
    };
  };

  const onSubmit = async (data: BattingAverageFormData) => {
    setIsCalculating(true);
    
    // Simulate calculation delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const calculatedResult = calculateBattingAverage(data);
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
      case 'poor': return <Zap className="h-6 w-6" />;
      default: return <Calculator className="h-6 w-6" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Zap className="h-10 w-10 text-orange-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Batting Average Calculator
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate your cricket batting average to measure your batting performance and consistency on the field.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <Card className="shadow-lg border-2 border-orange-100 hover:border-orange-200 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <Calculator className="h-6 w-6" />
              <span>Calculate Your Batting Average</span>
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
                          className="h-12 text-lg border-2 focus:border-orange-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dismissals"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-red-500" />
                        <span>Number of Dismissals</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter number of times dismissed"
                          className="h-12 text-lg border-2 focus:border-orange-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Enter 0 if you have never been dismissed (not out in all innings)
                      </p>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="innings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Total Innings (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Innings played"
                            className="border-2 focus:border-orange-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notOuts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Not Outs (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Not out innings"
                            className="border-2 focus:border-orange-400 transition-colors"
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
                    className="flex-1 h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isCalculating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Calculate Average</span>
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
                  <span>Your Batting Average</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full ${getPerformanceColor(result.performance)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    {getPerformanceIcon(result.performance)}
                    <span className="text-3xl font-bold">
                      {result.battingAverage.toFixed(2)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="mt-3 text-sm px-3 py-1">
                    {result.performance.replace('-', ' ').toUpperCase()}
                  </Badge>
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
                <span>Batting Average Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="font-medium">60+</span>
                  <span className="text-yellow-700">Elite Level</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium">45-59</span>
                  <span className="text-green-700">Excellent</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-medium">35-44</span>
                  <span className="text-blue-700">Good</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                  <span className="font-medium">25-34</span>
                  <span className="text-orange-700">Average</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-medium">&lt;25</span>
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
            <span>Complete Guide to Cricket Batting Average</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What is Batting Average?</h3>
            <p className="text-gray-700 mb-4">
              Batting average is one of the most important statistics in cricket, measuring a batsman's consistency and skill. 
              It's calculated by dividing total runs scored by the number of times the batsman has been dismissed.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Calculate Batting Average</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-mono text-lg text-center">
                <strong>Batting Average = Total Runs Scored ÷ Number of Dismissals</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Understanding Your Results</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>60+ Average:</strong> Elite level performance, comparable to legendary batsmen</li>
              <li><strong>45-59 Average:</strong> Excellent performance, international standard</li>
              <li><strong>35-44 Average:</strong> Good performance, reliable team player</li>
              <li><strong>25-34 Average:</strong> Average performance, room for improvement</li>
              <li><strong>Below 25:</strong> Needs significant improvement in batting skills</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tips to Improve Your Batting Average</h3>
            <ol className="space-y-2 text-gray-700">
              <li><strong>Focus on Technique:</strong> Work on your basic batting technique and shot selection</li>
              <li><strong>Mental Game:</strong> Develop concentration and patience at the crease</li>
              <li><strong>Practice Regularly:</strong> Consistent practice improves muscle memory and confidence</li>
              <li><strong>Study Opposition:</strong> Understand bowlers' strengths and weaknesses</li>
              <li><strong>Fitness:</strong> Maintain good physical condition for better performance</li>
              <li><strong>Match Situations:</strong> Learn to adapt your batting to different match situations</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Famous Batting Averages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Test Cricket</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>Don Bradman: 99.94</li>
                  <li>Virat Kohli: 53.41</li>
                  <li>Sachin Tendulkar: 53.78</li>
                  <li>Steve Smith: 58.61</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">ODI Cricket</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>Virat Kohli: 58.07</li>
                  <li>Babar Azam: 56.72</li>
                  <li>Rohit Sharma: 49.12</li>
                  <li>Joe Root: 50.00</li>
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
              <h4 className="font-semibold text-orange-800 mb-2">Bowling Average Calculator</h4>
              <p className="text-sm text-orange-700">Calculate bowling performance metrics</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
              <h4 className="font-semibold text-blue-800 mb-2">Strike Rate Calculator</h4>
              <p className="text-sm text-blue-700">Measure batting strike rate and scoring pace</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
              <h4 className="font-semibold text-green-800 mb-2">Economy Rate Calculator</h4>
              <p className="text-sm text-green-700">Calculate bowler's economy rate</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
              <h4 className="font-semibold text-purple-800 mb-2">Net Run Rate Calculator</h4>
              <p className="text-sm text-purple-700">Calculate team NRR and tournament standings</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors cursor-pointer">
              <h4 className="font-semibold text-red-800 mb-2">Player Performance Index</h4>
              <p className="text-sm text-red-700">Comprehensive cricket performance analysis</p>
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




































