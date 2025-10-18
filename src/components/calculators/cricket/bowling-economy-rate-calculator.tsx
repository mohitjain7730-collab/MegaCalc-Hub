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

const bowlingEconomySchema = z.object({
  runsConceded: z.string().min(1, 'Runs conceded is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Runs conceded must be a valid number',
  }),
  oversBowled: z.string().min(1, 'Overs bowled is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Overs bowled must be a valid positive number',
  }),
  format: z.enum(['test', 'odi', 't20']).optional(),
  matches: z.string().optional(),
});

type BowlingEconomyFormData = z.infer<typeof bowlingEconomySchema>;

interface BowlingEconomyResult {
  economyRate: number;
  performance: 'excellent' | 'very-good' | 'good' | 'average' | 'below-average' | 'poor';
  interpretation: string;
  recommendation: string;
  comparison: string;
}

export default function BowlingEconomyRateCalculator() {
  const [result, setResult] = useState<BowlingEconomyResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<BowlingEconomyFormData>({
    resolver: zodResolver(bowlingEconomySchema),
    defaultValues: {
      runsConceded: '',
      oversBowled: '',
      format: 'odi',
      matches: '',
    },
  });

  const calculateBowlingEconomy = (data: BowlingEconomyFormData): BowlingEconomyResult => {
    const runs = Number(data.runsConceded);
    const overs = Number(data.oversBowled);
    const format = data.format || 'odi';
    
    if (overs === 0) {
      return {
        economyRate: 0,
        performance: 'poor',
        interpretation: 'No overs bowled. This indicates you need to get more bowling opportunities.',
        recommendation: 'Focus on getting more bowling opportunities and building your bowling experience.',
        comparison: 'Every bowler starts somewhere. Work on getting more overs under your belt.',
      };
    }

    const economyRate = runs / overs;
    
    let performance: BowlingEconomyResult['performance'];
    let interpretation: string;
    let recommendation: string;
    let comparison: string;

    // Different standards for different formats
    if (format === 't20') {
      if (economyRate <= 6) {
        performance = 'excellent';
        interpretation = 'Outstanding T20 economy rate! You are among the most economical bowlers in the format.';
        recommendation = 'You are performing at the highest level in T20 cricket. Continue your disciplined approach.';
        comparison = 'This economy rate puts you in the company of T20 legends like Sunil Narine, Rashid Khan, and Jasprit Bumrah.';
      } else if (economyRate <= 7) {
        performance = 'very-good';
        interpretation = 'Excellent T20 economy rate! You demonstrate strong bowling control and accuracy.';
        recommendation = 'Continue working on your variations and maintaining this level of control.';
        comparison = 'This is comparable to top T20 international bowlers and shows professional-level performance.';
      } else if (economyRate <= 8) {
        performance = 'good';
        interpretation = 'Good T20 economy rate! You show solid bowling fundamentals and reasonable control.';
        recommendation = 'Focus on improving your accuracy and building more pressure on batsmen.';
        comparison = 'This average indicates a reliable T20 bowler who can contribute consistently to the team.';
      } else if (economyRate <= 9) {
        performance = 'average';
        interpretation = 'Average T20 economy rate. There is room for improvement in bowling control and accuracy.';
        recommendation = 'Work on your bowling technique, line, and length to improve your economy rate.';
        comparison = 'This is typical for developing T20 bowlers or those in challenging conditions.';
      } else if (economyRate <= 10) {
        performance = 'below-average';
        interpretation = 'Below-average T20 economy rate. Significant improvement needed in bowling control.';
        recommendation = 'Consider working with a bowling coach to improve your accuracy and control.';
        comparison = 'This suggests the need for focused practice on bowling fundamentals.';
      } else {
        performance = 'poor';
        interpretation = 'Poor T20 economy rate. Immediate attention to bowling fundamentals is required.';
        recommendation = 'Seek professional coaching and dedicate time to basic bowling practice and technique.';
        comparison = 'This indicates a need for fundamental bowling skill development.';
      }
    } else if (format === 'test') {
      if (economyRate <= 2.5) {
        performance = 'excellent';
        interpretation = 'Outstanding Test economy rate! You are among the most economical Test bowlers.';
        recommendation = 'You are performing at the highest level in Test cricket. Maintain your disciplined approach.';
        comparison = 'This economy rate puts you in the company of Test legends like Glenn McGrath, Curtly Ambrose, and Shaun Pollock.';
      } else if (economyRate <= 3) {
        performance = 'very-good';
        interpretation = 'Excellent Test economy rate! You demonstrate strong bowling control and patience.';
        recommendation = 'Continue working on your line and length to maintain this level of control.';
        comparison = 'This is comparable to top Test international bowlers and shows professional-level performance.';
      } else if (economyRate <= 3.5) {
        performance = 'good';
        interpretation = 'Good Test economy rate! You show solid bowling fundamentals and good control.';
        recommendation = 'Focus on improving your consistency and building more pressure on batsmen.';
        comparison = 'This average indicates a reliable Test bowler who can build pressure consistently.';
      } else if (economyRate <= 4) {
        performance = 'average';
        interpretation = 'Average Test economy rate. There is room for improvement in bowling control.';
        recommendation = 'Work on your bowling technique, line, and length to improve your economy rate.';
        comparison = 'This is typical for developing Test bowlers or those in challenging conditions.';
      } else if (economyRate <= 4.5) {
        performance = 'below-average';
        interpretation = 'Below-average Test economy rate. Significant improvement needed in bowling control.';
        recommendation = 'Consider working with a bowling coach to improve your accuracy and control.';
        comparison = 'This suggests the need for focused practice on bowling fundamentals.';
      } else {
        performance = 'poor';
        interpretation = 'Poor Test economy rate. Immediate attention to bowling fundamentals is required.';
        recommendation = 'Seek professional coaching and focus on basic bowling technique and control.';
        comparison = 'This indicates a need for fundamental bowling skill development.';
      }
    } else { // ODI format
      if (economyRate <= 4) {
        performance = 'excellent';
        interpretation = 'Outstanding ODI economy rate! You are among the most economical ODI bowlers.';
        recommendation = 'You are performing at the highest level in ODI cricket. Continue your disciplined approach.';
        comparison = 'This economy rate puts you in the company of ODI legends like Glenn McGrath, Wasim Akram, and Muttiah Muralitharan.';
      } else if (economyRate <= 4.5) {
        performance = 'very-good';
        interpretation = 'Excellent ODI economy rate! You demonstrate strong bowling control and accuracy.';
        recommendation = 'Continue working on your variations and maintaining this level of control.';
        comparison = 'This is comparable to top ODI international bowlers and shows professional-level performance.';
      } else if (economyRate <= 5) {
        performance = 'good';
        interpretation = 'Good ODI economy rate! You show solid bowling fundamentals and reasonable control.';
        recommendation = 'Focus on improving your accuracy and building more pressure on batsmen.';
        comparison = 'This average indicates a reliable ODI bowler who can contribute consistently to the team.';
      } else if (economyRate <= 5.5) {
        performance = 'average';
        interpretation = 'Average ODI economy rate. There is room for improvement in bowling control and accuracy.';
        recommendation = 'Work on your bowling technique, line, and length to improve your economy rate.';
        comparison = 'This is typical for developing ODI bowlers or those in challenging conditions.';
      } else if (economyRate <= 6) {
        performance = 'below-average';
        interpretation = 'Below-average ODI economy rate. Significant improvement needed in bowling control.';
        recommendation = 'Consider working with a bowling coach to improve your accuracy and control.';
        comparison = 'This suggests the need for focused practice on bowling fundamentals.';
      } else {
        performance = 'poor';
        interpretation = 'Poor ODI economy rate. Immediate attention to bowling fundamentals is required.';
        recommendation = 'Seek professional coaching and focus on basic bowling technique and control.';
        comparison = 'This indicates a need for fundamental bowling skill development.';
      }
    }

    return {
      economyRate,
      performance,
      interpretation,
      recommendation,
      comparison,
    };
  };

  const onSubmit = async (data: BowlingEconomyFormData) => {
    setIsCalculating(true);
    
    // Simulate calculation delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const calculatedResult = calculateBowlingEconomy(data);
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
          <Activity className="h-10 w-10 text-purple-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Bowling Economy Rate Calculator
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate your cricket bowling economy rate to measure your bowling control and effectiveness on the field.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <Card className="shadow-lg border-2 border-purple-100 hover:border-purple-200 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <Calculator className="h-6 w-6" />
              <span>Calculate Your Economy Rate</span>
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
                          className="h-12 text-lg border-2 focus:border-purple-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="oversBowled"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span>Total Overs Bowled</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          placeholder="Enter total overs bowled"
                          className="h-12 text-lg border-2 focus:border-purple-400 transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-sm text-muted-foreground">
                        Enter overs in decimal format (e.g., 5.3 for 5 overs and 3 balls)
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
                            className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-purple-400 transition-colors"
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
                    name="matches"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Matches Played (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Matches"
                            className="border-2 focus:border-purple-400 transition-colors"
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
                    className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    {isCalculating ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Calculate Economy Rate</span>
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
                  <span>Your Economy Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full ${getPerformanceColor(result.performance)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    {getPerformanceIcon(result.performance)}
                    <span className="text-3xl font-bold">
                      {result.economyRate.toFixed(2)}
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
                <span>Economy Rate Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-sm">
                <div className="bg-yellow-50 p-3 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-2">T20 Cricket</h4>
                  <div className="space-y-1 text-yellow-700">
                    <div className="flex justify-between"><span>≤6.0</span><span>Elite</span></div>
                    <div className="flex justify-between"><span>6.1-7.0</span><span>Excellent</span></div>
                    <div className="flex justify-between"><span>7.1-8.0</span><span>Good</span></div>
                    <div className="flex justify-between"><span>8.1-9.0</span><span>Average</span></div>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">ODI Cricket</h4>
                  <div className="space-y-1 text-blue-700">
                    <div className="flex justify-between"><span>≤4.0</span><span>Elite</span></div>
                    <div className="flex justify-between"><span>4.1-4.5</span><span>Excellent</span></div>
                    <div className="flex justify-between"><span>4.6-5.0</span><span>Good</span></div>
                    <div className="flex justify-between"><span>5.1-5.5</span><span>Average</span></div>
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <h4 className="font-semibold text-green-800 mb-2">Test Cricket</h4>
                  <div className="space-y-1 text-green-700">
                    <div className="flex justify-between"><span>≤2.5</span><span>Elite</span></div>
                    <div className="flex justify-between"><span>2.6-3.0</span><span>Excellent</span></div>
                    <div className="flex justify-between"><span>3.1-3.5</span><span>Good</span></div>
                    <div className="flex justify-between"><span>3.6-4.0</span><span>Average</span></div>
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
            <span>Complete Guide to Cricket Bowling Economy Rate</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What is Bowling Economy Rate?</h3>
            <p className="text-gray-700 mb-4">
              Bowling economy rate is a crucial statistic in cricket that measures how many runs a bowler concedes per over. 
              It's calculated by dividing the total runs conceded by the number of overs bowled. A lower economy rate indicates 
              better bowling control and effectiveness.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Calculate Bowling Economy Rate</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-mono text-lg text-center">
                <strong>Economy Rate = Total Runs Conceded ÷ Total Overs Bowled</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Understanding Your Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">T20 Cricket</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li><strong>≤6.0:</strong> Elite level (Narine, Rashid)</li>
                  <li><strong>6.1-7.0:</strong> Excellent (Bumrah, Malinga)</li>
                  <li><strong>7.1-8.0:</strong> Good performance</li>
                  <li><strong>8.1-9.0:</strong> Average performance</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">ODI Cricket</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li><strong>≤4.0:</strong> Elite level (McGrath, Akram)</li>
                  <li><strong>4.1-4.5:</strong> Excellent (Muralitharan)</li>
                  <li><strong>4.6-5.0:</strong> Good performance</li>
                  <li><strong>5.1-5.5:</strong> Average performance</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Test Cricket</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li><strong>≤2.5:</strong> Elite level (McGrath, Ambrose)</li>
                  <li><strong>2.6-3.0:</strong> Excellent (Pollock)</li>
                  <li><strong>3.1-3.5:</strong> Good performance</li>
                  <li><strong>3.6-4.0:</strong> Average performance</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tips to Improve Your Economy Rate</h3>
            <ol className="space-y-2 text-gray-700">
              <li><strong>Line and Length:</strong> Focus on consistent line and length to build pressure</li>
              <li><strong>Variations:</strong> Develop different types of deliveries to surprise batsmen</li>
              <li><strong>Field Placements:</strong> Work with captain to set attacking fields</li>
              <li><strong>Mental Game:</strong> Stay patient and maintain focus during long spells</li>
              <li><strong>Physical Fitness:</strong> Maintain good fitness for consistent performance</li>
              <li><strong>Study Batsmen:</strong> Understand opponents' weaknesses and exploit them</li>
              <li><strong>Practice:</strong> Regular practice with focus on accuracy and control</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Famous Economy Rates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800">T20 Cricket</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>Sunil Narine: 6.05</li>
                  <li>Rashid Khan: 6.22</li>
                  <li>Jasprit Bumrah: 6.62</li>
                  <li>Lasith Malinga: 7.42</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">ODI Cricket</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>Glenn McGrath: 3.88</li>
                  <li>Wasim Akram: 3.89</li>
                  <li>Muttiah Muralitharan: 3.93</li>
                  <li>Curtly Ambrose: 3.48</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Test Cricket</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>Glenn McGrath: 2.49</li>
                  <li>Curtly Ambrose: 2.30</li>
                  <li>Shaun Pollock: 2.39</li>
                  <li>Wasim Akram: 2.59</li>
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
