'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calculator, Trophy, Target, TrendingUp, Info, Zap, Star, Award, Activity } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const bowlingAverageSchema = z.object({
  runsConceded: z.string().min(1, 'Runs conceded is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Runs conceded must be a valid number',
  }),
  wicketsTaken: z.string().min(1, 'Wickets taken is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Wickets taken must be a valid number',
  }),
  matches: z.string().optional(),
  overs: z.string().optional(),
});

type BowlingAverageFormData = z.infer<typeof bowlingAverageSchema>;

interface BowlingAverageResult {
  bowlingAverage: number;
  performance: 'excellent' | 'very-good' | 'good' | 'average' | 'below-average' | 'poor';
  interpretation: string;
  recommendation: string;
  comparison: string;
}

export default function BowlingAverageCalculator() {
  const [result, setResult] = useState<BowlingAverageResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<BowlingAverageFormData>({
    resolver: zodResolver(bowlingAverageSchema),
    defaultValues: {
      runsConceded: '',
      wicketsTaken: '',
      matches: '',
      overs: '',
    },
  });

  const calculateBowlingAverage = (data: BowlingAverageFormData): BowlingAverageResult => {
    const runs = Number(data.runsConceded);
    const wickets = Number(data.wicketsTaken);
    
    if (wickets === 0) {
      return {
        bowlingAverage: runs,
        performance: 'poor',
        interpretation: 'No wickets taken. This indicates a need for immediate improvement in bowling skills.',
        recommendation: 'Focus on developing your bowling technique and accuracy to start taking wickets.',
        comparison: 'Every bowler starts somewhere. Work on the basics to improve your performance.',
      };
    }

    const bowlingAverage = runs / wickets;
    
    let performance: BowlingAverageResult['performance'];
    let interpretation: string;
    let recommendation: string;
    let comparison: string;

    if (bowlingAverage >= 40) {
      performance = 'below-average';
      interpretation = 'Below-average bowling performance. Significant improvement needed in bowling skills and accuracy.';
      recommendation = 'Consider working with a bowling coach to improve your technique and consistency.';
      comparison = 'This suggests the need for focused practice and skill development.';
    } else if (bowlingAverage >= 30) {
      performance = 'average';
      interpretation = 'Average bowling performance. There is room for improvement in consistency and accuracy.';
      recommendation = 'Work on your bowling technique, line, and length to improve your performance.';
      comparison = 'This is typical for developing bowlers or those in challenging conditions.';
    } else if (bowlingAverage >= 25) {
      performance = 'good';
      interpretation = 'Good bowling average! You show solid bowling fundamentals and reasonable consistency.';
      recommendation = 'Focus on improving your accuracy and building pressure to take more wickets.';
      comparison = 'This average indicates a reliable bowler who can contribute consistently to the team.';
    } else if (bowlingAverage >= 20) {
      performance = 'very-good';
      interpretation = 'Excellent bowling average! You demonstrate strong bowling skills and good consistency.';
      recommendation = 'Continue working on your variations and mental game to push towards the elite level.';
      comparison = 'This is comparable to top international bowlers and shows professional-level performance.';
    } else {
      performance = 'excellent';
      interpretation = 'Outstanding bowling average! You are among the elite bowlers with exceptional skill and consistency.';
      recommendation = 'You are performing at the highest level. Focus on maintaining this form and mentoring other bowlers.';
      comparison = 'This average puts you in the company of legendary bowlers like Glenn McGrath, Wasim Akram, and Dale Steyn.';
    }

    return {
      bowlingAverage,
      performance,
      interpretation,
      recommendation,
      comparison,
    };
  };

  const onSubmit = async (data: BowlingAverageFormData) => {
    setIsCalculating(true);
    
    // Simulate calculation delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const calculatedResult = calculateBowlingAverage(data);
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
      case 'poor': return <Activity className="h-6 w-6" />;
      default: return <Calculator className="h-6 w-6" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <Activity className="h-10 w-10 text-blue-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Bowling Average Calculator
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate your cricket bowling average to measure your bowling performance and effectiveness on the field.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <Card className="shadow-lg border-2 border-blue-100 hover:border-blue-200 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Calculator className="h-6 w-6" />
              <span>Calculate Your Bowling Average</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="runsConceded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center space-x-2">
                        <Target className="h-4 w-4 text-red-500" />
                        <span>Total Runs Conceded</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter total runs conceded"
                          className="h-12 text-lg border-2 focus:border-blue-400 transition-colors"
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
                      <FormLabel className="text-base font-semibold flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-green-500" />
                        <span>Total Wickets Taken</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter total wickets taken"
                          className="h-12 text-lg border-2 focus:border-blue-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Enter 0 if you have not taken any wickets yet
                      </p>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="matches"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Matches Played (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Matches"
                            className="border-2 focus:border-blue-400 transition-colors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="overs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Overs Bowled (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            placeholder="Overs"
                            className="border-2 focus:border-blue-400 transition-colors"
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
                    className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105"
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
                  <span>Your Bowling Average</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full ${getPerformanceColor(result.performance)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    {getPerformanceIcon(result.performance)}
                    <span className="text-3xl font-bold">
                      {result.bowlingAverage.toFixed(2)}
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
                <span>Bowling Average Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="font-medium">&lt;20</span>
                  <span className="text-yellow-700">Elite Level</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="font-medium">20-29</span>
                  <span className="text-green-700">Excellent</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="font-medium">25-34</span>
                  <span className="text-blue-700">Good</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                  <span className="font-medium">30-39</span>
                  <span className="text-orange-700">Average</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="font-medium">40+</span>
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
            <span>Complete Guide to Cricket Bowling Average</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What is Bowling Average?</h3>
            <p className="text-gray-700 mb-4">
              Bowling average is a key statistic in cricket that measures a bowler's effectiveness. 
              It's calculated by dividing the total runs conceded by the number of wickets taken. 
              A lower bowling average indicates better performance.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Calculate Bowling Average</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-mono text-lg text-center">
                <strong>Bowling Average = Total Runs Conceded ÷ Number of Wickets Taken</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Understanding Your Results</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Below 20:</strong> Elite level performance, comparable to legendary bowlers</li>
              <li><strong>20-29:</strong> Excellent performance, international standard</li>
              <li><strong>25-34:</strong> Good performance, reliable team player</li>
              <li><strong>30-39:</strong> Average performance, room for improvement</li>
              <li><strong>40+:</strong> Needs significant improvement in bowling skills</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tips to Improve Your Bowling Average</h3>
            <ol className="space-y-2 text-gray-700">
              <li><strong>Focus on Accuracy:</strong> Work on your line and length consistently</li>
              <li><strong>Develop Variations:</strong> Learn different types of deliveries to surprise batsmen</li>
              <li><strong>Physical Fitness:</strong> Maintain good fitness for consistent performance</li>
              <li><strong>Mental Game:</strong> Stay focused and patient during long spells</li>
              <li><strong>Study Batsmen:</strong> Understand opponents' weaknesses and exploit them</li>
              <li><strong>Practice Regularly:</strong> Consistent practice improves muscle memory and accuracy</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Famous Bowling Averages</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800">Test Cricket</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>Glenn McGrath: 21.64</li>
                  <li>Curtly Ambrose: 20.99</li>
                  <li>Wasim Akram: 23.62</li>
                  <li>Dale Steyn: 22.95</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">ODI Cricket</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>Joel Garner: 18.84</li>
                  <li>Glenn McGrath: 22.02</li>
                  <li>Muttiah Muralitharan: 23.08</li>
                  <li>Wasim Akram: 23.52</li>
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