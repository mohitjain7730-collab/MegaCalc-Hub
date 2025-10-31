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
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/HowTo">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Window Glass, Film, and Curtain Coverage Calculation" />
    <meta itemProp="description" content="An expert guide detailing how to calculate required glass area (sq ft/m²), curtain fabric volume for fullness and pleats (2x or 3x multiplier), and estimating window film or paint coverage for the frame and casing." />
    <meta itemProp="keywords" content="window glass area calculator, curtain fabric fullness multiplier, calculating window frame area, blinds and shades sizing, thermal window film coverage, interior design window treatments" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-window-coverage-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Window Coverage: Calculating Glass, Film, and Fabric Needs</h1>
    <p className="text-lg italic text-gray-700">Master the specialized measurements for glass replacement, energy film installation, and fabric sizing for functional and aesthetic window treatments.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#glass-area" className="hover:underline">Calculating Glass and Film Surface Area</a></li>
        <li><a href="#curtain-basics" className="hover:underline">Curtain and Drape Calculation Basics</a></li>
        <li><a href="#fullness" className="hover:underline">The Critical Fabric Fullness Multiplier (2x and 3x)</a></li>
        <li><a href="#frame-paint" className="hover:underline">Estimating Window Frame Paint and Casing</a></li>
        <li><a href="#waste" className="hover:underline">Waste Factors for Film and Fabric</a></li>
    </ul>
<hr />

    {/* CALCULATING GLASS AND FILM SURFACE AREA */}
    <h2 id="glass-area" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Glass and Film Surface Area</h2>
    <p>The calculation for glass replacement, window tinting, or protective film installation requires precise measurement of the visible glass area. This is a simple area calculation, usually performed on the individual pane level.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Single Pane Area Formula</h3>
    <p>For a single rectangular pane of glass, the area is calculated by multiplying the height (H) and width (W). This result is the minimal purchase quantity for film or glass:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Pane Area = Height * Width'}
        </p>
    </div>
    <p>For windows with multiple dividers (muntins/grilles), the area of each individual glass section must be calculated separately and then summed to find the total glass area.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Film and Tint Sizing</h3>
    <p>Window film is typically purchased from a roll of specific width. The calculation must determine the minimum required linear footage of the roll. The number of vertical strips required is the total width of the glass divided by the width of the film roll.</p>

<hr />

    {/* CURTAIN AND DRAPE CALCULATION BASICS */}
    <h2 id="curtain-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Curtain and Drape Calculation Basics</h2>
    <p>Calculating fabric requirements for curtains and drapes is not based on the window's area, but rather its **width** and the desired final **length**, with adjustments made for the aesthetic style (fullness).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Three Key Measurements</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Finished Width:</strong> The width of the curtain rod or track, which dictates the total area the fabric must cover when closed.</li>
        <li><strong className="font-semibold">Finished Length (Drop):</strong> The vertical distance from the top of the rod to the desired bottom point (e.g., sill length, apron length, or floor length).</li>
        <li><strong className="font-semibold">Fabric Usable Width:</strong> The width of the bolt of fabric (e.g., 54 inches), which determines how many panels (widths) must be sewn together horizontally to achieve the required fullness.</li>
    </ol>

<hr />

    {/* THE CRITICAL FABRIC FULLNESS MULTIPLIER (2X AND 3X) */}
    <h2 id="fullness" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Fabric Fullness Multiplier (2x and 3x)</h2>
    <p><strong className="font-semibold">Fullness</strong> refers to the extra fabric added to create the necessary folds, pleats, and draping effect when the curtain is closed. This is the single largest factor differentiating the required fabric from the simple window width.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Fullness Multipliers by Style</h3>
    <p>The multiplier is applied to the **Finished Width** to determine the total width of fabric needed before hemming and pleating:</p>
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 my-4">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fullness Style</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multiplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aesthetic Result</th>
            </tr>
        </thead>
        {/* REMOVING WHITESPACE-NOWRAP FOR BETTER SCALABILITY */}
        <tbody className="bg-white divide-y divide-gray-200">
            <tr>
                <td className="px-6 py-4"><strong className="font-semibold">Minimal/Flat</strong></td>
                <td className="px-6 py-4">1.5x to 1.8x</td>
                <td className="px-6 py-4">Modern, flat look; suitable for sheers</td>
            </tr>
            <tr>
                <td className="px-6 py-4"><strong className="font-semibold">Standard Fullness</strong></td>
                <td className="px-6 py-4">2.0x (Double Fullness)</td>
                <td className="px-6 py-4">Traditional, common pleating (Two yards of fabric per one yard of rod)</td>
            </tr>
            <tr>
                <td className="px-6 py-4"><strong className="font-semibold">Luxury/Heavy Fullness</strong></td>
                <td className="px-6 py-4">2.5x to 3.0x (Triple Fullness)</td>
                <td className="px-6 py-4">Heavy pleating; luxurious, dense draping</td>
            </tr>
        </tbody>
    </table>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Total Fabric Width</h3>
    <p>The Total Fabric Width is calculated as: Finished Rod Width multiplied by Fullness Multiplier. This is then divided by the Fabric Usable Width to determine the **number of vertical panels** needed.</p>

<hr />

    {/* ESTIMATING WINDOW FRAME PAINT AND CASING */}
    <h2 id="frame-paint" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Estimating Window Frame Paint and Casing</h2>
    <p>For renovations, the paint coverage for the window frame and interior casing is a separate calculation based on linear and surface area estimates.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Frame and Casing Area</h3>
    <p>The painted area consists of the flat surface area of the interior casing and the depth area of the jamb (the inner sides of the frame). This is often estimated based on the total perimeter of the window opening, multiplied by an average casing width (e.g., 4 inches) and the number of coats.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Paint Volume Estimation</h3>
    <p>Due to the small, complex, and high-detail nature of window frames, paint volume is usually estimated based on total linear feet of the frame perimeter, rather than total surface area. A standard rule of thumb is approximately 1 gallon of trim paint for every 500-800 linear feet of trim, which includes two coats.</p>

<hr />

    {/* WASTE FACTORS FOR FILM AND FABRIC */}
    <h2 id="waste" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Waste Factors for Film and Fabric</h2>
    <p>Both film and fabric materials require specific waste factors to account for trimming and matching.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Film and Tint Waste</h3>
    <p>For window film, a waste factor of **10% to 15%** is added to the total net glass area. This accounts for trimming the edges of the film precisely to the frame, ensuring clean cuts, and compensating for accidental scratches or installation errors.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Fabric and Hem Waste</h3>
    <p>Fabric length must include several inches of allowance for **hems** (top and bottom finishing) and **side seams**. The most significant waste, however, comes from the **Pattern Repeat**. If the fabric has a large vertical pattern, extra material must be purchased to ensure the pattern aligns perfectly at every horizontal seam where panels are joined, similar to wallpaper matching.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Window coverage calculation is a multi-disciplinary task: glass requires simple area measurement, but drapes and curtains require highly specialized planning based on the **Fullness Multiplier** and **Finished Length**.</p>
    <p>Accurate fabric estimation must account for the **Pattern Repeat** to minimize waste and ensure aesthetic success. By meticulously measuring the finished width and applying the correct fullness factor (2x for standard pleats), designers ensure the final window treatment is functional, safe, and visually luxurious.</p>
</section>
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
