'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Square, Ruler, Calculator, Info, AlertCircle, TrendingUp, Users, Home, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  windowWidth: z.number().min(0.1).optional(),
  windowHeight: z.number().min(0.1).optional(),
  curtainWidth: z.number().min(0.1).optional(),
  curtainLength: z.number().min(0.1).optional(),
  fullnessRatio: z.number().min(1).optional(),
  unit: z.enum(['feet', 'meters']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WindowGlassCurtainCoverageCalculator() {
  const [result, setResult] = useState<{ 
    windowArea: number; 
    curtainArea: number; 
    coverageRatio: number; 
    interpretation: string; 
    opinion: string;
    coverageLevel: string;
    fullnessLevel: string;
    recommendations: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      windowWidth: undefined, 
      windowHeight: undefined, 
      curtainWidth: undefined, 
      curtainLength: undefined, 
      fullnessRatio: undefined, 
      unit: undefined 
    } 
  });

  const calculate = (v: FormValues) => {
    if (v.windowWidth == null || v.windowHeight == null || v.curtainWidth == null || v.curtainLength == null || v.fullnessRatio == null || v.unit == null) return null;
    
    const windowArea = v.windowWidth * v.windowHeight;
    const curtainArea = v.curtainWidth * v.curtainLength * v.fullnessRatio;
    const coverageRatio = curtainArea / windowArea;
    
    return { windowArea, curtainArea, coverageRatio };
  };

  const interpret = (coverageRatio: number, fullnessRatio: number) => {
    if (coverageRatio > 2.5) return `Excellent coverage with ${coverageRatio.toFixed(2)}x fullness providing luxurious draping.`;
    if (coverageRatio >= 2) return `Good coverage with ${coverageRatio.toFixed(2)}x fullness providing elegant draping.`;
    if (coverageRatio >= 1.5) return `Adequate coverage with ${coverageRatio.toFixed(2)}x fullness providing basic draping.`;
    return `Minimal coverage with ${coverageRatio.toFixed(2)}x fullness - consider increasing curtain width.`;
  };

  const getCoverageLevel = (coverageRatio: number) => {
    if (coverageRatio > 2.5) return 'Excellent Coverage';
    if (coverageRatio >= 2) return 'Good Coverage';
    if (coverageRatio >= 1.5) return 'Adequate Coverage';
    return 'Minimal Coverage';
  };

  const getFullnessLevel = (fullnessRatio: number) => {
    if (fullnessRatio >= 2.5) return 'Luxury Fullness';
    if (fullnessRatio >= 2) return 'Standard Fullness';
    if (fullnessRatio >= 1.5) return 'Basic Fullness';
    return 'Minimal Fullness';
  };

  const getRecommendations = (coverageRatio: number, fullnessRatio: number, windowWidth: number, windowHeight: number) => {
    const recommendations = [];
    
    recommendations.push(`Use ${coverageRatio.toFixed(2)}x fullness ratio for optimal draping`);
    recommendations.push('Consider curtain rod extending 6-12 inches beyond window frame');
    recommendations.push('Plan for proper curtain length (floor-length or sill-length)');
    recommendations.push('Choose appropriate curtain weight for fullness');
    
    if (coverageRatio < 1.5) {
      recommendations.push('Increase curtain width for better coverage');
      recommendations.push('Consider double curtain panels for wider windows');
    }
    
    if (fullnessRatio < 2) {
      recommendations.push('Increase fullness ratio for more elegant draping');
      recommendations.push('Consider pleated or gathered curtain styles');
    }
    
    return recommendations;
  };

  const getConsiderations = (coverageRatio: number, fullnessRatio: number, windowWidth: number) => {
    const considerations = [];
    
    considerations.push('Curtain fullness affects light control and privacy');
    considerations.push('Heavy fabrics require more fullness for proper draping');
    considerations.push('Window shape and size affect curtain requirements');
    considerations.push('Curtain rod placement impacts overall appearance');
    
    if (windowWidth > 6) {
      considerations.push('Wide windows may require multiple curtain panels');
    }
    
    if (fullnessRatio > 3) {
      considerations.push('Very high fullness ratios may require special hardware');
    }
    
    return considerations;
  };

  const opinion = (coverageRatio: number, fullnessRatio: number) => {
    if (coverageRatio > 2.5 && fullnessRatio >= 2.5) return `This curtain setup will provide excellent coverage and luxurious draping for a professional appearance.`;
    if (coverageRatio >= 2 && fullnessRatio >= 2) return `This curtain setup will provide good coverage and elegant draping for most applications.`;
    return `This curtain setup may need adjustments for optimal coverage and appearance. Consider increasing fullness or curtain width.`;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (calculation == null) { setResult(null); return; }
    setResult({ 
      windowArea: calculation.windowArea, 
      curtainArea: calculation.curtainArea, 
      coverageRatio: calculation.coverageRatio, 
      interpretation: interpret(calculation.coverageRatio, values.fullnessRatio || 0), 
      opinion: opinion(calculation.coverageRatio, values.fullnessRatio || 0),
      coverageLevel: getCoverageLevel(calculation.coverageRatio),
      fullnessLevel: getFullnessLevel(values.fullnessRatio || 0),
      recommendations: getRecommendations(calculation.coverageRatio, values.fullnessRatio || 0, values.windowWidth || 0, values.windowHeight || 0),
      considerations: getConsiderations(calculation.coverageRatio, values.fullnessRatio || 0, values.windowWidth || 0)
    });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Square className="h-5 w-5" />
            Window & Curtain Specifications
          </CardTitle>
          <CardDescription>
            Enter your window dimensions and curtain requirements to calculate optimal coverage
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
                          onChange={(e) => field.onChange(e.target.value as 'feet' | 'meters')}
                        >
                          <option value="">Select units</option>
                          <option value="feet">Feet</option>
                          <option value="meters">Meters</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="windowWidth" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Window Width ({unit})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 4" 
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
                  name="windowHeight" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Window Height ({unit})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 6" 
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
                  name="curtainWidth" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        Curtain Width ({unit})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 8" 
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
                  name="curtainLength" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Curtain Length ({unit})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 7" 
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
                  name="fullnessRatio" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Fullness Ratio
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 2.5" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} 
                        />
                </FormControl>
                      <FormMessage />
              </FormItem>
                  )} 
                />
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Curtain Coverage
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
                <Square className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Curtain Coverage Analysis</CardTitle>
                  <CardDescription>Detailed coverage calculation and curtain analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Square className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Coverage Ratio</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.coverageRatio.toFixed(2)}x
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.coverageLevel}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Fullness Level</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.fullnessLevel === 'Luxury Fullness' ? 'default' : result.fullnessLevel === 'Standard Fullness' ? 'secondary' : 'outline'}>
                      {result.fullnessLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.interpretation}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Coverage Assessment</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {result.coverageRatio > 2.5 ? 'Excellent' : 
                     result.coverageRatio >= 2 ? 'Good' : 
                     result.coverageRatio >= 1.5 ? 'Adequate' : 'Needs Improvement'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.opinion}
                  </p>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Coverage Details</h4>
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Window Area:</span>
                      <span className="font-medium">{result.windowArea.toFixed(2)} sq {unit}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Curtain Area:</span>
                      <span className="font-medium">{result.curtainArea.toFixed(2)} sq {unit}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Coverage Ratio:</span>
                      <span className="font-medium">{result.coverageRatio.toFixed(2)}x</span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Fullness Guidelines</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• 1.5x - Minimal fullness for basic coverage</li>
                    <li>• 2.0x - Standard fullness for elegant draping</li>
                    <li>• 2.5x - Luxury fullness for rich appearance</li>
                    <li>• 3.0x+ - Ultra-luxury fullness for formal settings</li>
                  </ul>
                </div>
              </div>

              {/* Detailed Recommendations */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Square className="h-5 w-5" />
                        Installation Recommendations
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
              <h4 className="font-semibold text-foreground mb-2">Window Dimensions</h4>
              <p className="text-muted-foreground">
                Enter the width and height of your window frame. This determines the area that needs to be covered by curtains.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Curtain Dimensions</h4>
              <p className="text-muted-foreground">
                Enter the width and length of your curtain panels. Width should be wider than the window for proper fullness.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Fullness Ratio</h4>
              <p className="text-muted-foreground">
                The ratio of curtain width to window width. Higher ratios create more fullness and elegant draping. Standard is 2x, luxury is 2.5x.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Coverage Calculation</h4>
              <p className="text-muted-foreground">
                The calculator determines how well your curtains will cover the window and provides recommendations for optimal appearance.
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
              Explore other home improvement calculators to plan your window treatments and renovation project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/wallpaper-roll-calculator" className="text-primary hover:underline">
                    Wallpaper Roll Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate wallpaper rolls needed for your walls and rooms.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/lighting-layout-calculator" className="text-primary hover:underline">
                    Lighting Layout Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate optimal lighting fixtures and placement for your room dimensions.
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
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Square className="h-5 w-5" />
              Complete Guide to Window Curtain Coverage
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
              Common questions about window curtain coverage and installation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is curtain fullness ratio?</h4>
              <p className="text-muted-foreground">
                Fullness ratio is the curtain width divided by window width. A 2x ratio means curtains are twice as wide as the window, creating elegant folds and draping.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How much fullness do I need for my curtains?</h4>
              <p className="text-muted-foreground">
                Standard fullness is 2x for elegant draping. Use 2.5x for luxury appearance, 1.5x for basic coverage, and 3x+ for ultra-luxury formal settings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should curtain rods extend beyond the window?</h4>
              <p className="text-muted-foreground">
                Yes, extend rods 6-12 inches beyond the window frame to allow curtains to stack completely off the glass when open, maximizing natural light.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I measure for curtain length?</h4>
              <p className="text-muted-foreground">
                Measure from the rod to desired length: floor-length (touching floor), puddle-length (6" on floor), or sill-length (just below sill).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between single and double panels?</h4>
              <p className="text-muted-foreground">
                Single panels cover half the window width, double panels cover the full width. Double panels provide better fullness and light control.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do fabric weight affect fullness requirements?</h4>
              <p className="text-muted-foreground">
                Heavy fabrics like velvet need more fullness (2.5x+) for proper draping. Light fabrics like sheers can use less fullness (1.5-2x).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What curtain styles work best with different fullness ratios?</h4>
              <p className="text-muted-foreground">
                Pleated curtains work well with 2-2.5x fullness, gathered curtains need 2.5x+, and tab-top curtains can use 1.5-2x fullness.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate curtains for bay windows?</h4>
              <p className="text-muted-foreground">
                Measure each window section separately and calculate fullness for each. Consider using multiple rods or specialty bay window hardware.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the cost difference between fullness ratios?</h4>
              <p className="text-muted-foreground">
                Higher fullness ratios require more fabric, increasing costs by 50-150%. However, the improved appearance often justifies the additional expense.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I ensure proper curtain installation?</h4>
              <p className="text-muted-foreground">
                Use appropriate hardware for curtain weight, install rods level and secure, and ensure curtains can move freely without binding or dragging.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}
