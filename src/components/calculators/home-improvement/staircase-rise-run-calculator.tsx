'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Ruler, Info, AlertCircle, TrendingUp, Users, Home, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formSchema = z.object({
  totalRise: z.number().min(0.1).optional(),
  idealRiserHeight: z.number().min(0.1).optional(),
  unit: z.enum(['inches', 'cm']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalculationResult {
    steps: number;
    riserHeight: number;
    treadDepth: number;
    totalRun: number;
    chartData: { name: string; value: number }[];
}

export default function StaircaseRiseRunCalculator() {
  const [result, setResult] = useState<{ 
    calculation: CalculationResult; 
    interpretation: string; 
    opinion: string;
    complexityLevel: string;
    safetyLevel: string;
    recommendations: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      totalRise: undefined,
      idealRiserHeight: undefined,
      unit: undefined 
    } 
  });

  const calculate = (v: FormValues) => {
    if (v.totalRise == null || v.unit == null) return null;
    
    const isImperial = v.unit === 'inches';
    const defaultIdealRiser = isImperial ? 7.5 : 19; // Default ideal riser height in inches or cm
    const idealRiser = v.idealRiserHeight || defaultIdealRiser;

    const numberOfRisers = Math.round(v.totalRise / idealRiser);
    const actualRiserHeight = v.totalRise / numberOfRisers;
    
    // Rule: 2 x Riser Height + Tread Depth = 24 to 25 inches (or 61-63.5 cm)
    const idealTreadDepth = (isImperial ? 24.5 : 62) - (2 * actualRiserHeight);
    
    const totalRun = idealTreadDepth * (numberOfRisers - 1);

    const chartData = [
        { name: 'Riser Height', value: parseFloat(actualRiserHeight.toFixed(2)) },
        { name: 'Tread Depth', value: parseFloat(idealTreadDepth.toFixed(2)) },
    ];

    return { steps: numberOfRisers, riserHeight: actualRiserHeight, treadDepth: idealTreadDepth, totalRun, chartData };
  };

  const interpret = (steps: number, riserHeight: number, treadDepth: number, unit: string) => {
    const unitText = unit === 'inches' ? 'inches' : 'cm';
    if (steps > 15) return `Large staircase with ${steps} steps, ${riserHeight.toFixed(2)} ${unitText} risers, and ${treadDepth.toFixed(2)} ${unitText} treads.`;
    if (steps >= 8) return `Standard staircase with ${steps} steps, ${riserHeight.toFixed(2)} ${unitText} risers, and ${treadDepth.toFixed(2)} ${unitText} treads.`;
    return `Small staircase with ${steps} steps, ${riserHeight.toFixed(2)} ${unitText} risers, and ${treadDepth.toFixed(2)} ${unitText} treads.`;
  };

  const getComplexityLevel = (steps: number) => {
    if (steps > 15) return 'High Complexity';
    if (steps >= 8) return 'Medium Complexity';
    return 'Low Complexity';
  };

  const getSafetyLevel = (riserHeight: number, treadDepth: number, unit: string) => {
    const isImperial = unit === 'inches';
    const idealRiserMin = isImperial ? 7 : 17.8;
    const idealRiserMax = isImperial ? 8 : 20.3;
    const idealTreadMin = isImperial ? 9 : 22.9;
    const idealTreadMax = isImperial ? 11 : 27.9;
    
    if (riserHeight >= idealRiserMin && riserHeight <= idealRiserMax && 
        treadDepth >= idealTreadMin && treadDepth <= idealTreadMax) {
      return 'Safe Design';
    }
    return 'Review Required';
  };

  const getRecommendations = (steps: number, riserHeight: number, treadDepth: number, unit: string) => {
    const recommendations = [];
    
    recommendations.push(`Build ${steps} steps with consistent ${riserHeight.toFixed(2)} ${unit} risers`);
    recommendations.push(`Use ${treadDepth.toFixed(2)} ${unit} tread depth for comfortable walking`);
    recommendations.push('Ensure all risers and treads are identical for safety');
    recommendations.push('Check local building codes for specific requirements');
    
    if (steps > 12) {
      recommendations.push('Consider adding a landing for long staircases');
      recommendations.push('Plan for proper handrail installation');
    }
    
    if (riserHeight > (unit === 'inches' ? 8 : 20.3)) {
      recommendations.push('Consider reducing riser height for better comfort');
    }
    
    return recommendations;
  };

  const getConsiderations = (steps: number, riserHeight: number, treadDepth: number) => {
    const considerations = [];
    
    considerations.push('Consistent riser height prevents tripping hazards');
    considerations.push('Proper tread depth ensures comfortable foot placement');
    considerations.push('Building codes vary by location and must be followed');
    considerations.push('Handrails are required for stairs with 4+ risers');
    
    if (steps > 15) {
      considerations.push('Long staircases may require intermediate landings');
    }
    
    if (riserHeight > 8 || treadDepth < 9) {
      considerations.push('Non-standard dimensions may require special permits');
    }
    
    return considerations;
  };

  const opinion = (steps: number, riserHeight: number, treadDepth: number, unit: string) => {
    const isImperial = unit === 'inches';
    const idealRiserMin = isImperial ? 7 : 17.8;
    const idealRiserMax = isImperial ? 8 : 20.3;
    const idealTreadMin = isImperial ? 9 : 22.9;
    
    if (riserHeight >= idealRiserMin && riserHeight <= idealRiserMax && treadDepth >= idealTreadMin) {
      return `This staircase design meets standard safety guidelines and should provide comfortable, safe access.`;
    }
    return `This staircase design may need adjustments to meet safety standards and building codes. Consider consulting a professional.`;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (calculation == null) { setResult(null); return; }
    setResult({ 
      calculation, 
      interpretation: interpret(calculation.steps, calculation.riserHeight, calculation.treadDepth, values.unit || 'inches'), 
      opinion: opinion(calculation.steps, calculation.riserHeight, calculation.treadDepth, values.unit || 'inches'),
      complexityLevel: getComplexityLevel(calculation.steps),
      safetyLevel: getSafetyLevel(calculation.riserHeight, calculation.treadDepth, values.unit || 'inches'),
      recommendations: getRecommendations(calculation.steps, calculation.riserHeight, calculation.treadDepth, values.unit || 'inches'),
      considerations: getConsiderations(calculation.steps, calculation.riserHeight, calculation.treadDepth)
    });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Staircase Dimensions & Specifications
          </CardTitle>
          <CardDescription>
            Enter your staircase requirements to calculate optimal rise and run dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField 
                  control={form.control} 
                  name="unit" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Measurement Units
                      </FormLabel>
                <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(e.target.value as 'inches' | 'cm')}
                        >
                          <option value="">Select units</option>
                          <option value="inches">Inches</option>
                          <option value="cm">Centimeters</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="totalRise" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Total Rise (floor to floor)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 108" 
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
                  name="idealRiserHeight" 
                  render={({ field }) => (
                <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Ideal Riser Height (Optional)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder={`e.g., ${unit === 'inches' ? '7.5' : '19'}`} 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                </FormControl>
                    <CardDescription className='text-xs'>Leave blank to use a standard comfortable height.</CardDescription>
                    <FormMessage />
                </FormItem>
                  )} 
                />
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Staircase Dimensions
              </Button>
        </form>
      </Form>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6">
          {/* Main Results Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Calculator className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Staircase Design</CardTitle>
                  <CardDescription>Detailed staircase calculation and safety analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Number of Steps</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.calculation.steps} steps
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.complexityLevel}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Safety Level</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.safetyLevel === 'Safe Design' ? 'default' : 'destructive'}>
                      {result.safetyLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.interpretation}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Design Assessment</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {result.calculation.steps > 15 ? 'Complex Design' : 
                     result.calculation.steps >= 8 ? 'Standard Design' : 'Simple Design'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.opinion}
                  </p>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Staircase Dimensions</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Riser Height:</span>
                      <span className="font-medium">{result.calculation.riserHeight.toFixed(2)} {unit}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Tread Depth:</span>
                      <span className="font-medium">{result.calculation.treadDepth.toFixed(2)} {unit}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Total Run:</span>
                      <span className="font-medium">{result.calculation.totalRun.toFixed(2)} {unit}</span>
                    </li>
                        </ul>
                    </div>
                
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={result.calculation.chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} unit={unit} />
                                <Tooltip formatter={(value: number) => `${value.toFixed(2)} ${unit}`} />
                                <Bar dataKey="value" fill="hsl(var(--primary))" name="Dimension" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

              {/* Detailed Recommendations */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calculator className="h-5 w-5" />
                        Construction Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <AlertCircle className="h-5 w-5" />
                        Important Considerations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.considerations.map((consideration, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-destructive rounded-full mt-2 flex-shrink-0" />
                            <span className="text-sm">{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
        </Card>
        </div>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Explain the Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Total Rise</h4>
              <p className="text-muted-foreground">
                The vertical distance from the lower floor to the upper floor. This is the total height your staircase needs to climb.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Ideal Riser Height</h4>
              <p className="text-muted-foreground">
                The preferred height of each step. Standard comfortable riser height is 7-8 inches (17.8-20.3 cm). Leave blank to use the default.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Measurement Units</h4>
              <p className="text-muted-foreground">
                Choose between inches or centimeters. The calculator automatically handles unit conversions and provides results in your selected units.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Staircase Design Rules</h4>
              <p className="text-muted-foreground">
                The calculator uses the 2R + T rule: 2 × Riser Height + Tread Depth should equal 24-25 inches (61-63.5 cm) for comfortable stairs.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other home improvement calculators to plan your construction project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/concrete-volume-calculator" className="text-primary hover:underline">
                    Concrete Volume Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate concrete volume needed for foundations, slabs, and construction projects.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/cost-estimator-renovation-calculator" className="text-primary hover:underline">
                    Renovation Cost Estimator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Get accurate cost estimates for your home renovation and improvement projects.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/drywall-plasterboard-calculator" className="text-primary hover:underline">
                    Drywall Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate drywall sheets needed for walls and ceilings in your renovation.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/paint-coverage-calculator" className="text-primary hover:underline">
                    Paint Coverage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the exact amount of paint needed for your walls and ceilings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Complete Guide to Staircase Design
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p>This is a sample line for the complete guide section. You can add your detailed content here.</p>
            <p>This is another sample line for the guide section. Replace these with your comprehensive guide content.</p>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about staircase design and construction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the standard dimensions for comfortable stairs?</h4>
              <p className="text-muted-foreground">
                Standard comfortable stairs have riser heights of 7-8 inches (17.8-20.3 cm) and tread depths of 9-11 inches (22.9-27.9 cm). The 2R + T rule ensures optimal comfort and safety.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why is consistency important in staircase design?</h4>
              <p className="text-muted-foreground">
                Consistent riser heights and tread depths prevent tripping hazards. Variations of more than 3/8 inch (1 cm) can be dangerous and violate building codes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between riser and tread?</h4>
              <p className="text-muted-foreground">
                The riser is the vertical part of the step (height), while the tread is the horizontal part where you place your foot (depth). Both dimensions affect comfort and safety.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate the total run of a staircase?</h4>
              <p className="text-muted-foreground">
                Total run is calculated by multiplying the tread depth by the number of treads (which is always one less than the number of risers). This gives you the horizontal space needed.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">When do I need handrails for stairs?</h4>
              <p className="text-muted-foreground">
                Handrails are typically required for stairs with 4 or more risers. Building codes vary by location, so check local requirements for specific height and spacing regulations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the maximum number of steps before needing a landing?</h4>
              <p className="text-muted-foreground">
                Most building codes require a landing after 12-15 consecutive risers. This provides a rest area and improves safety for long staircases.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I ensure my stairs meet building codes?</h4>
              <p className="text-muted-foreground">
                Check local building codes for specific requirements. Most codes specify minimum and maximum riser heights, tread depths, handrail requirements, and landing specifications.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What materials are best for stair construction?</h4>
              <p className="text-muted-foreground">
                Common materials include wood, concrete, steel, and composite materials. Choose based on your budget, design preferences, and structural requirements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate stairs for a spiral staircase?</h4>
              <p className="text-muted-foreground">
                Spiral staircases have different calculations due to their curved design. They typically require specialized formulas and may need professional design assistance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the cost of building stairs?</h4>
              <p className="text-muted-foreground">
                Stair construction costs vary by material, complexity, and location. Basic wooden stairs cost $100-200 per step, while custom or complex designs can cost $500+ per step.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}