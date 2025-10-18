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

const nrrSchema = z.object({
  runsScored: z.string().min(1, 'Runs scored is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Runs scored must be a valid number',
  }),
  oversFaced: z.string().min(1, 'Overs faced is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Overs faced must be a valid positive number',
  }),
  runsConceded: z.string().min(1, 'Runs conceded is required').refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Runs conceded must be a valid number',
  }),
  oversBowled: z.string().min(1, 'Overs bowled is required').refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Overs bowled must be a valid positive number',
  }),
  matches: z.string().optional(),
  format: z.enum(['odi', 't20']).optional(),
});

type NrrFormData = z.infer<typeof nrrSchema>;

interface NrrResult {
  nrr: number;
  performance: 'excellent' | 'very-good' | 'good' | 'average' | 'below-average' | 'poor';
  interpretation: string;
  recommendation: string;
  comparison: string;
  runRateScored: number;
  runRateConceded: number;
}

export default function NetRunRateCalculator() {
  const [result, setResult] = useState<NrrResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<NrrFormData>({
    resolver: zodResolver(nrrSchema),
    defaultValues: {
      runsScored: '',
      oversFaced: '',
      runsConceded: '',
      oversBowled: '',
      matches: '',
      format: 'odi',
    },
  });

  const calculateNetRunRate = (data: NrrFormData): NrrResult => {
    const runsScored = Number(data.runsScored);
    const oversFaced = Number(data.oversFaced);
    const runsConceded = Number(data.runsConceded);
    const oversBowled = Number(data.oversBowled);
    const format = data.format || 'odi';
    
    if (oversFaced === 0 || oversBowled === 0) {
      return {
        nrr: 0,
        runRateScored: 0,
        runRateConceded: 0,
        performance: 'poor',
        interpretation: 'Incomplete data. Ensure you have played both batting and bowling overs.',
        recommendation: 'Complete more matches with both batting and bowling to get an accurate NRR.',
        comparison: 'NRR calculation requires both batting and bowling data.',
      };
    }

    const runRateScored = runsScored / oversFaced;
    const runRateConceded = runsConceded / oversBowled;
    const nrr = runRateScored - runRateConceded;
    
    let performance: NrrResult['performance'];
    let interpretation: string;
    let recommendation: string;
    let comparison: string;

    // Different standards for different formats
    if (format === 't20') {
      if (nrr >= 1.5) {
        performance = 'excellent';
        interpretation = 'Outstanding T20 NRR! Your team is performing exceptionally well and dominating opponents.';
        recommendation = 'Your team is performing at the highest level. Continue this dominant form.';
        comparison = 'This NRR puts your team among the elite T20 teams in world cricket.';
      } else if (nrr >= 1.0) {
        performance = 'very-good';
        interpretation = 'Excellent T20 NRR! Your team demonstrates strong performance and good balance.';
        recommendation = 'Continue working on maintaining this level of performance across all matches.';
        comparison = 'This is comparable to top T20 international teams and shows professional-level performance.';
      } else if (nrr >= 0.5) {
        performance = 'good';
        interpretation = 'Good T20 NRR! Your team shows solid performance fundamentals and reasonable balance.';
        recommendation = 'Focus on improving consistency and building more pressure on opponents.';
        comparison = 'This NRR indicates a competitive T20 team that can challenge most opponents.';
      } else if (nrr >= 0) {
        performance = 'average';
        interpretation = 'Average T20 NRR. There is room for improvement in both batting and bowling performance.';
        recommendation = 'Work on improving both batting strike rate and bowling economy to boost NRR.';
        comparison = 'This is typical for developing T20 teams or those in challenging conditions.';
      } else if (nrr >= -0.5) {
        performance = 'below-average';
        interpretation = 'Below-average T20 NRR. Significant improvement needed in team performance.';
        recommendation = 'Consider working on team strategy and individual player performance.';
        comparison = 'This suggests the need for focused practice and strategic improvements.';
      } else {
        performance = 'poor';
        interpretation = 'Poor T20 NRR. Immediate attention to team performance is required.';
        recommendation = 'Seek professional coaching and focus on fundamental team improvements.';
        comparison = 'This indicates a need for comprehensive team development.';
      }
    } else { // ODI format
      if (nrr >= 1.0) {
        performance = 'excellent';
        interpretation = 'Outstanding ODI NRR! Your team is performing exceptionally well and dominating opponents.';
        recommendation = 'Your team is performing at the highest level. Continue this dominant form.';
        comparison = 'This NRR puts your team among the elite ODI teams in world cricket.';
      } else if (nrr >= 0.5) {
        performance = 'very-good';
        interpretation = 'Excellent ODI NRR! Your team demonstrates strong performance and good balance.';
        recommendation = 'Continue working on maintaining this level of performance across all matches.';
        comparison = 'This is comparable to top ODI international teams and shows professional-level performance.';
      } else if (nrr >= 0.2) {
        performance = 'good';
        interpretation = 'Good ODI NRR! Your team shows solid performance fundamentals and reasonable balance.';
        recommendation = 'Focus on improving consistency and building more pressure on opponents.';
        comparison = 'This NRR indicates a competitive ODI team that can challenge most opponents.';
      } else if (nrr >= 0) {
        performance = 'average';
        interpretation = 'Average ODI NRR. There is room for improvement in both batting and bowling performance.';
        recommendation = 'Work on improving both batting strike rate and bowling economy to boost NRR.';
        comparison = 'This is typical for developing ODI teams or those in challenging conditions.';
      } else if (nrr >= -0.5) {
        performance = 'below-average';
        interpretation = 'Below-average ODI NRR. Significant improvement needed in team performance.';
        recommendation = 'Consider working on team strategy and individual player performance.';
        comparison = 'This suggests the need for focused practice and strategic improvements.';
      } else {
        performance = 'poor';
        interpretation = 'Poor ODI NRR. Immediate attention to team performance is required.';
        recommendation = 'Seek professional coaching and focus on fundamental team improvements.';
        comparison = 'This indicates a need for comprehensive team development.';
      }
    }

    return {
      nrr,
      runRateScored,
      runRateConceded,
      performance,
      interpretation,
      recommendation,
      comparison,
    };
  };

  const onSubmit = async (data: NrrFormData) => {
    setIsCalculating(true);
    
    // Simulate calculation delay for animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const calculatedResult = calculateNetRunRate(data);
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
          <Users className="h-10 w-10 text-indigo-500 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Net Run Rate (NRR) Calculator
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate your cricket team's Net Run Rate to measure overall performance and tournament standings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <Card className="shadow-lg border-2 border-indigo-100 hover:border-indigo-200 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <CardTitle className="flex items-center space-x-2 text-indigo-800">
              <Calculator className="h-6 w-6" />
              <span>Calculate Your Team's NRR</span>
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
                            placeholder="Total runs scored"
                            className="h-12 text-lg border-2 focus:border-indigo-400 transition-colors"
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
                          <span>Overs Faced</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            step="0.1"
                            placeholder="Overs faced"
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
                    name="runsConceded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center space-x-2">
                          <Target className="h-4 w-4 text-red-500" />
                          <span>Runs Conceded</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Total runs conceded"
                            className="h-12 text-lg border-2 focus:border-indigo-400 transition-colors"
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
                          <Activity className="h-4 w-4 text-purple-500" />
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
                            className="w-full h-10 px-3 border-2 border-gray-300 rounded-md focus:border-indigo-400 transition-colors"
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
                    name="matches"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Matches Played (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Matches"
                            className="border-2 focus:border-indigo-400 transition-colors"
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
                        <span>Calculate NRR</span>
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
                  <span>Your Team's NRR</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center space-x-3 px-6 py-4 rounded-full ${getPerformanceColor(result.performance)} shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    {getPerformanceIcon(result.performance)}
                    <span className="text-3xl font-bold">
                      {result.nrr >= 0 ? '+' : ''}{result.nrr.toFixed(3)}
                    </span>
                  </div>
                  <Badge variant="secondary" className="mt-3 text-sm px-3 py-1">
                    {result.performance.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Run Rate Scored</h4>
                    <p className="text-2xl font-bold text-green-600">{result.runRateScored.toFixed(3)}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-800 mb-2">Run Rate Conceded</h4>
                    <p className="text-2xl font-bold text-red-600">{result.runRateConceded.toFixed(3)}</p>
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
                <span>NRR Performance Guide</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 text-sm">
                <div className="bg-yellow-50 p-3 rounded">
                  <h4 className="font-semibold text-yellow-800 mb-2">T20 Cricket</h4>
                  <div className="space-y-1 text-yellow-700">
                    <div className="flex justify-between"><span>≥1.5</span><span>Elite</span></div>
                    <div className="flex justify-between"><span>1.0-1.49</span><span>Excellent</span></div>
                    <div className="flex justify-between"><span>0.5-0.99</span><span>Good</span></div>
                    <div className="flex justify-between"><span>0.0-0.49</span><span>Average</span></div>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">ODI Cricket</h4>
                  <div className="space-y-1 text-blue-700">
                    <div className="flex justify-between"><span>≥1.0</span><span>Elite</span></div>
                    <div className="flex justify-between"><span>0.5-0.99</span><span>Excellent</span></div>
                    <div className="flex justify-between"><span>0.2-0.49</span><span>Good</span></div>
                    <div className="flex justify-between"><span>0.0-0.19</span><span>Average</span></div>
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
            <span>Complete Guide to Cricket Net Run Rate (NRR)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">What is Net Run Rate?</h3>
            <p className="text-gray-700 mb-4">
              Net Run Rate (NRR) is a crucial statistic in cricket tournaments that measures a team's overall performance. 
              It's calculated by subtracting the run rate conceded from the run rate scored. A positive NRR indicates the team 
              scores faster than it concedes runs, while a negative NRR indicates the opposite.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">How to Calculate Net Run Rate</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="font-mono text-lg text-center">
                <strong>NRR = (Total Runs Scored ÷ Total Overs Faced) - (Total Runs Conceded ÷ Total Overs Bowled)</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Understanding Your Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">T20 Cricket</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li><strong>≥1.5:</strong> Elite level (dominant teams)</li>
                  <li><strong>1.0-1.49:</strong> Excellent (top teams)</li>
                  <li><strong>0.5-0.99:</strong> Good (competitive teams)</li>
                  <li><strong>0.0-0.49:</strong> Average (developing teams)</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">ODI Cricket</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li><strong>≥1.0:</strong> Elite level (dominant teams)</li>
                  <li><strong>0.5-0.99:</strong> Excellent (top teams)</li>
                  <li><strong>0.2-0.49:</strong> Good (competitive teams)</li>
                  <li><strong>0.0-0.19:</strong> Average (developing teams)</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tips to Improve Your NRR</h3>
            <ol className="space-y-2 text-gray-700">
              <li><strong>Batting Performance:</strong> Focus on maintaining high run rates while batting</li>
              <li><strong>Bowling Performance:</strong> Work on keeping opposition run rates low</li>
              <li><strong>Team Balance:</strong> Ensure both batting and bowling units are strong</li>
              <li><strong>Match Strategy:</strong> Plan according to match situations and conditions</li>
              <li><strong>Consistency:</strong> Maintain performance across all matches in the tournament</li>
              <li><strong>Pressure Handling:</strong> Stay calm and focused during crucial moments</li>
              <li><strong>Fielding:</strong> Improve fielding to save runs and create pressure</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 mb-4">Tournament NRR Examples</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800">T20 World Cup 2021</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>Pakistan: +1.583</li>
                  <li>Australia: +1.031</li>
                  <li>England: +1.556</li>
                  <li>New Zealand: +1.162</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">ODI World Cup 2019</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>India: +0.809</li>
                  <li>Australia: +0.868</li>
                  <li>England: +1.152</li>
                  <li>New Zealand: +0.175</li>
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

