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

const strikeRateSchema = z.object({
  runsScored: z.string().min(1, 'Runs scored is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Runs scored must be a valid number',
  }),
  ballsFaced: z.string().min(1, 'Balls faced is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Balls faced must be a valid number',
  }),
  format: z.enum(['test', 'odi', 't20']).optional(),
  innings: z.string().optional(),
});

type StrikeRateFormData = z.infer<typeof strikeRateSchema>;

interface StrikeRateResult {
  strikeRate: number;
  performance: 'excellent' | 'very-good' | 'good' | 'average' | 'below-average' | 'poor';
  interpretation: string;
  recommendation: string;
  comparison: string;
}

export default function StrikeRateCalculator() {
  const [result, setResult] = useState<StrikeRateResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<StrikeRateFormData>({
    resolver: zodResolver(strikeRateSchema),
    defaultValues: {
      runsScored: '',
      ballsFaced: '',
      format: 'odi',
      innings: '',
    },
  });

  const calculateStrikeRate = (data: StrikeRateFormData): StrikeRateResult => {
    const runs = Number(data.runsScored);
    const balls = Number(data.ballsFaced);
    const format = data.format || 'odi';
    
    if (balls === 0) {
      return {
        strikeRate: 0,
        performance: 'poor',
        interpretation: 'No balls faced. This indicates you need to get more opportunities to bat.',
        recommendation: 'Focus on getting more batting opportunities and building your innings.',
        comparison: 'Every batsman starts somewhere. Work on getting to the crease more often.',
      };
    }

    const strikeRate = (runs / balls) * 100;
    
    let performance: StrikeRateResult['performance'];
    let interpretation: string;
    let recommendation: string;
    let comparison: string;

    // Different standards for different formats
    if (format === 't20') {
      if (strikeRate >= 150) {
        performance = 'excellent';
        interpretation = 'Outstanding T20 strike rate! You are among the most explosive batsmen in the format.';
        recommendation = 'You are performing at the highest level in T20 cricket. Continue your aggressive approach.';
        comparison = 'This strike rate puts you in the company of T20 legends like Chris Gayle, AB de Villiers, and Andre Russell.';
      } else if (strikeRate >= 130) {
        performance = 'very-good';
        interpretation = 'Excellent T20 strike rate! You demonstrate strong aggressive batting skills.';
        recommendation = 'Continue working on your power hitting and shot selection to maintain this rate.';
        comparison = 'This is comparable to top T20 international batsmen and shows professional-level performance.';
      } else if (strikeRate >= 110) {
        performance = 'good';
        interpretation = 'Good T20 strike rate! You show solid aggressive batting fundamentals.';
        recommendation = 'Focus on improving your power hitting and building more pressure on bowlers.';
        comparison = 'This average indicates a reliable T20 batsman who can contribute consistently.';
      } else if (strikeRate >= 100) {
        performance = 'average';
        interpretation = 'Average T20 strike rate. There is room for improvement in aggressive batting.';
        recommendation = 'Work on your power hitting, shot selection, and timing to increase your strike rate.';
        comparison = 'This is typical for developing T20 players or those in challenging conditions.';
      } else if (strikeRate >= 80) {
        performance = 'below-average';
        interpretation = 'Below-average T20 strike rate. Significant improvement needed in aggressive batting.';
        recommendation = 'Consider working on power hitting techniques and adapting to T20 batting style.';
        comparison = 'This suggests the need for focused practice on aggressive batting skills.';
      } else {
        performance = 'poor';
        interpretation = 'Poor T20 strike rate. Immediate attention to aggressive batting is required.';
        recommendation = 'Seek professional coaching for T20 batting and focus on power hitting fundamentals.';
        comparison = 'This indicates a need for fundamental T20 batting skill development.';
      }
    } else if (format === 'test') {
      if (strikeRate >= 80) {
        performance = 'excellent';
        interpretation = 'Outstanding Test strike rate! You are among the most aggressive Test batsmen.';
        recommendation = 'You are performing at the highest level in Test cricket. Maintain your aggressive approach.';
        comparison = 'This strike rate puts you in the company of aggressive Test batsmen like Virender Sehwag and David Warner.';
      } else if (strikeRate >= 65) {
        performance = 'very-good';
        interpretation = 'Excellent Test strike rate! You demonstrate strong aggressive batting skills.';
        recommendation = 'Continue working on your shot selection and timing to maintain this rate.';
        comparison = 'This is comparable to top aggressive Test batsmen and shows professional-level performance.';
      } else if (strikeRate >= 50) {
        performance = 'good';
        interpretation = 'Good Test strike rate! You show solid batting fundamentals with good tempo.';
        recommendation = 'Focus on improving your shot selection and building more pressure on bowlers.';
        comparison = 'This average indicates a reliable Test batsman who can score at a good rate.';
      } else if (strikeRate >= 40) {
        performance = 'average';
        interpretation = 'Average Test strike rate. There is room for improvement in scoring rate.';
        recommendation = 'Work on your shot selection, timing, and confidence to increase your strike rate.';
        comparison = 'This is typical for developing Test players or those in challenging conditions.';
      } else if (strikeRate >= 30) {
        performance = 'below-average';
        interpretation = 'Below-average Test strike rate. Significant improvement needed in scoring rate.';
        recommendation = 'Consider working on shot selection and building confidence in your batting.';
        comparison = 'This suggests the need for focused practice on scoring skills.';
      } else {
        performance = 'poor';
        interpretation = 'Poor Test strike rate. Immediate attention to batting fundamentals is required.';
        recommendation = 'Seek professional coaching and focus on basic batting technique and confidence.';
        comparison = 'This indicates a need for fundamental batting skill development.';
      }
    } else { // ODI format
      if (strikeRate >= 120) {
        performance = 'excellent';
        interpretation = 'Outstanding ODI strike rate! You are among the most explosive ODI batsmen.';
        recommendation = 'You are performing at the highest level in ODI cricket. Continue your aggressive approach.';
        comparison = 'This strike rate puts you in the company of ODI legends like AB de Villiers, Jos Buttler, and Glenn Maxwell.';
      } else if (strikeRate >= 100) {
        performance = 'very-good';
        interpretation = 'Excellent ODI strike rate! You demonstrate strong aggressive batting skills.';
        recommendation = 'Continue working on your power hitting and shot selection to maintain this rate.';
        comparison = 'This is comparable to top ODI international batsmen and shows professional-level performance.';
      } else if (strikeRate >= 85) {
        performance = 'good';
        interpretation = 'Good ODI strike rate! You show solid aggressive batting fundamentals.';
        recommendation = 'Focus on improving your power hitting and building more pressure on bowlers.';
        comparison = 'This average indicates a reliable ODI batsman who can contribute consistently.';
      } else if (strikeRate >= 70) {
        performance = 'average';
        interpretation = 'Average ODI strike rate. There is room for improvement in aggressive batting.';
        recommendation = 'Work on your power hitting, shot selection, and timing to increase your strike rate.';
        comparison = 'This is typical for developing ODI players or those in challenging conditions.';
      } else if (strikeRate >= 55) {
        performance = 'below-average';
        interpretation = 'Below-average ODI strike rate. Significant improvement needed in aggressive batting.';
        recommendation = 'Consider working on power hitting techniques and adapting to ODI batting style.';
        comparison = 'This suggests the need for focused practice on aggressive batting skills.';
      } else {
        performance = 'poor';
        interpretation = 'Poor ODI strike rate. Immediate attention to aggressive batting is required.';
        recommendation = 'Seek professional coaching for ODI batting and focus on power hitting fundamentals.';
        comparison = 'This indicates a need for fundamental ODI batting skill development.';
      }
    }

    return {
      strikeRate,
      performance,
      interpretation,
      recommendation,
      comparison,
    };
  };

  const onSubmit = async (data: StrikeRateFormData) => {
    setIsCalculating(true);
    
    // Simulate calculation delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const calculatedResult = calculateStrikeRate(data);
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
          <Zap className="h-10 w-10 text-green-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Strike Rate Calculator
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate your cricket strike rate to measure your batting speed and scoring efficiency on the field.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <Card className="shadow-lg border-2 border-green-100 hover:border-green-200 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Calculator className="h-6 w-6" />
              <span>Calculate Your Strike Rate</span>
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
                          className="h-12 text-lg border-2 focus:border-green-400 transition-colors"
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
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span>Total Balls Faced</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter total balls faced"
                          className="h-12 text-lg border-2 focus:border-green-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Enter 0 if you have not faced any balls yet
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
                            className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-green-400 transition-colors"
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
                        <FormLabel className="text-sm font-medium">Innings Played (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Innings"
                            className="border-2 focus:border-green-400 transition-colors"
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
                    className="flex-1 h-12 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isCalculating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Calculate Strike Rate</span>
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
                  <span>Your Strike Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full ${getPerformanceColor(result.performance)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    {getPerformanceIcon(result.performance)}
                    <span className="text-3xl font-bold">
                      {result.strikeRate.toFixed(2)}
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
                <span>Strike Rate Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-sm">
                <div className="bg-yellow-50 p-3 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-2">T20 Cricket</h4>
                  <div className="space-y-1 text-yellow-700">
                    <div className="flex justify-between"><span>150+</span><span>Elite</span></div>
                    <div className="flex justify-between"><span>130-149</span><span>Excellent</span></div>
                    <div className="flex justify-between"><span>110-129</span><span>Good</span></div>
                    <div className="flex justify-between"><span>100-109</span><span>Average</span></div>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">ODI Cricket</h4>
                  <div className="space-y-1 text-blue-700">
                    <div className="flex justify-between"><span>120+</span><span>Elite</span></div>
                    <div className="flex justify-between"><span>100-119</span><span>Excellent</span></div>
                    <div className="flex justify-between"><span>85-99</span><span>Good</span></div>
                    <div className="flex justify-between"><span>70-84</span><span>Average</span></div>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">Test Cricket</h4>
                  <div className="space-y-1 text-green-700">
                    <div className="flex justify-between"><span>80+</span><span>Elite</span></div>
                    <div className="flex justify-between"><span>65-79</span><span>Excellent</span></div>
                    <div className="flex justify-between"><span>50-64</span><span>Good</span></div>
                    <div className="flex justify-between"><span>40-49</span><span>Average</span></div>
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
            <span>Complete Guide to Cricket Strike Rate</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What is Strike Rate?</h3>
            <p className="text-gray-700 mb-4">
              Strike rate is a crucial statistic in cricket that measures how quickly a batsman scores runs. 
              It's calculated as the number of runs scored per 100 balls faced. A higher strike rate indicates 
              more aggressive and faster scoring.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Calculate Strike Rate</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-mono text-lg text-center">
                <strong>Strike Rate = (Runs Scored ÷ Balls Faced) × 100</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Understanding Your Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">T20 Cricket</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li><strong>150+:</strong> Elite level (Gayle, Russell)</li>
                  <li><strong>130-149:</strong> Excellent (ABD, Buttler)</li>
                  <li><strong>110-129:</strong> Good performance</li>
                  <li><strong>100-109:</strong> Average performance</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">ODI Cricket</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li><strong>120+:</strong> Elite level (ABD, Maxwell)</li>
                  <li><strong>100-119:</strong> Excellent (Buttler, Stokes)</li>
                  <li><strong>85-99:</strong> Good performance</li>
                  <li><strong>70-84:</strong> Average performance</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Test Cricket</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li><strong>80+:</strong> Elite level (Sehwag, Warner)</li>
                  <li><strong>65-79:</strong> Excellent (Gilchrist)</li>
                  <li><strong>50-64:</strong> Good performance</li>
                  <li><strong>40-49:</strong> Average performance</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tips to Improve Your Strike Rate</h3>
            <ol className="space-y-2 text-gray-700">
              <li><strong>Power Hitting:</strong> Develop your ability to hit boundaries and sixes</li>
              <li><strong>Shot Selection:</strong> Learn to pick the right balls to attack</li>
              <li><strong>Running Between Wickets:</strong> Improve your speed and decision making for quick singles</li>
              <li><strong>Timing:</strong> Work on your timing to find gaps in the field</li>
              <li><strong>Mental Game:</strong> Build confidence to play attacking shots</li>
              <li><strong>Fitness:</strong> Maintain good fitness for explosive batting</li>
              <li><strong>Practice:</strong> Regular practice with focus on aggressive batting</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Famous Strike Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800">T20 Cricket</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>Andre Russell: 164.44</li>
                  <li>Glenn Maxwell: 150.81</li>
                  <li>AB de Villiers: 135.16</li>
                  <li>Chris Gayle: 137.50</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">ODI Cricket</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>AB de Villiers: 101.09</li>
                  <li>Jos Buttler: 117.97</li>
                  <li>Glenn Maxwell: 125.41</li>
                  <li>Shahid Afridi: 117.00</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Test Cricket</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>Virender Sehwag: 82.23</li>
                  <li>Adam Gilchrist: 81.95</li>
                  <li>David Warner: 72.64</li>
                  <li>Brendon McCullum: 64.60</li>
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