'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scroll, Ruler, Calculator, Info, AlertCircle, TrendingUp, Users, Home, Building, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  wallHeight: z.number().min(0.1).optional(),
  wallWidth: z.number().min(0.1).optional(),
  rollLength: z.number().min(0.1).optional(),
  rollWidth: z.number().min(0.1).optional(),
  patternRepeat: z.number().min(0).optional(),
  unit: z.enum(['meters', 'feet']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function WallpaperRollCalculator() {
  const [result, setResult] = useState<{ 
    rollsNeeded: number; 
    interpretation: string; 
    opinion: string;
    projectComplexity: string;
    efficiencyLevel: string;
    recommendations: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      wallHeight: undefined, 
      wallWidth: undefined, 
      rollLength: undefined, 
      rollWidth: undefined, 
      patternRepeat: undefined, 
      unit: undefined 
    }
  });

  const calculate = (v: FormValues) => {
    if (v.wallHeight == null || v.wallWidth == null || v.rollLength == null || v.rollWidth == null || v.patternRepeat == null || v.unit == null) return null;
    
    let rollWidth = v.rollWidth;
    let patternRepeat = v.patternRepeat;

    if (v.unit === 'feet') {
      rollWidth /= 12; // convert inches to feet
      patternRepeat /= 12;
    } else {
      rollWidth /= 100; // convert cm to meters
      patternRepeat /= 100;
    }

    const wastageFactor = 1.1; // 10% wastage
    const dropsNeeded = Math.ceil(v.wallWidth / rollWidth);
    const dropLength = v.wallHeight + (patternRepeat > 0 ? patternRepeat : 0);
    const dropsPerRoll = Math.floor(v.rollLength / dropLength);

    let rollsNeeded;
    if (dropsPerRoll > 0) {
        rollsNeeded = Math.ceil(dropsNeeded / dropsPerRoll);
    } else {
        const totalLengthNeeded = dropsNeeded * dropLength;
      rollsNeeded = Math.ceil(totalLengthNeeded / v.rollLength);
    }
    
    return Math.ceil(rollsNeeded * wastageFactor);
  };

  const interpret = (rollsNeeded: number, patternRepeat: number) => {
    if (rollsNeeded > 20) return `Large wallpapering project requiring ${rollsNeeded} rolls with pattern matching considerations.`;
    if (rollsNeeded >= 10) return `Medium wallpapering project requiring ${rollsNeeded} rolls with pattern matching considerations.`;
    return `Small wallpapering project requiring ${rollsNeeded} rolls with pattern matching considerations.`;
  };

  const getProjectComplexity = (rollsNeeded: number, patternRepeat: number) => {
    if (rollsNeeded > 20) return 'Large Project';
    if (rollsNeeded >= 10) return 'Medium Project';
    return 'Small Project';
  };

  const getEfficiencyLevel = (patternRepeat: number) => {
    if (patternRepeat === 0) return 'No Pattern Repeat';
    if (patternRepeat <= 6) return 'Small Pattern Repeat';
    return 'Large Pattern Repeat';
  };

  const getRecommendations = (rollsNeeded: number, patternRepeat: number, unit: string) => {
    const recommendations = [];
    
    recommendations.push(`Purchase ${rollsNeeded} rolls from the same batch/lot`);
    recommendations.push('Prepare walls properly - clean, smooth, and primed');
    recommendations.push('Plan your starting point for optimal pattern alignment');
    recommendations.push('Use quality wallpaper adhesive and tools');
    
    if (patternRepeat > 0) {
      recommendations.push('Account for pattern repeat when cutting strips');
      recommendations.push('Start from the most visible wall for best pattern placement');
    }
    
    if (rollsNeeded > 15) {
      recommendations.push('Consider professional installation for large projects');
    }
    
    return recommendations;
  };

  const getConsiderations = (rollsNeeded: number, patternRepeat: number) => {
    const considerations = [];
    
    considerations.push('Pattern repeat significantly affects material waste');
    considerations.push('Wallpaper color and pattern may vary between batches');
    considerations.push('Room shape and obstacles affect installation complexity');
    considerations.push('Wall preparation is crucial for proper adhesion');
    
    if (patternRepeat > 12) {
      considerations.push('Large pattern repeats require careful planning and extra material');
    }
    
    return considerations;
  };

  const opinion = (rollsNeeded: number, patternRepeat: number) => {
    if (rollsNeeded > 20) return `This is a substantial wallpapering project that requires careful planning and may benefit from professional installation.`;
    if (rollsNeeded >= 10) return `This is a manageable DIY project with proper preparation and attention to pattern matching.`;
    return `Perfect size for a DIY weekend project with careful attention to detail.`;
  };

  const onSubmit = (values: FormValues) => {
    const rollsNeeded = calculate(values);
    if (rollsNeeded == null) { setResult(null); return; }
    setResult({ 
      rollsNeeded, 
      interpretation: interpret(rollsNeeded, values.patternRepeat || 0), 
      opinion: opinion(rollsNeeded, values.patternRepeat || 0),
      projectComplexity: getProjectComplexity(rollsNeeded, values.patternRepeat || 0),
      efficiencyLevel: getEfficiencyLevel(values.patternRepeat || 0),
      recommendations: getRecommendations(rollsNeeded, values.patternRepeat || 0, values.unit || 'feet'),
      considerations: getConsiderations(rollsNeeded, values.patternRepeat || 0)
    });
  };
  
  const unit = form.watch('unit');

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scroll className="h-5 w-5" />
            Wall & Wallpaper Specifications
          </CardTitle>
          <CardDescription>
            Enter your wall dimensions and wallpaper specifications to calculate roll requirements
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
                          onChange={(e) => field.onChange(e.target.value as 'meters' | 'feet')}
                        >
                          <option value="">Select units</option>
                          <option value="feet">Feet / Inches</option>
                          <option value="meters">Meters / Centimeters</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="wallHeight" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Wall Height ({unit})
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
                  name="wallWidth" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Total Wall Width ({unit})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 20" 
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
                  name="rollLength" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Scroll className="h-4 w-4" />
                        Roll Length ({unit})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 33" 
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
                  name="rollWidth" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Scroll className="h-4 w-4" />
                        Roll Width ({unit === 'feet' ? 'in' : 'cm'})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 20.5" 
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
                  name="patternRepeat" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Pattern Repeat ({unit === 'feet' ? 'in' : 'cm'})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 0" 
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
                Calculate Wallpaper Rolls
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
                <Scroll className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Wallpaper Requirements</CardTitle>
                  <CardDescription>Detailed wallpaper calculation and project analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
                <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Scroll className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Rolls Needed</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.rollsNeeded} rolls
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.projectComplexity}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Pattern Complexity</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.efficiencyLevel === 'No Pattern Repeat' ? 'default' : result.efficiencyLevel === 'Small Pattern Repeat' ? 'secondary' : 'destructive'}>
                      {result.efficiencyLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.interpretation}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Project Assessment</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {result.rollsNeeded > 20 ? 'Large Project' : 
                     result.rollsNeeded >= 10 ? 'Medium Project' : 'Small Project'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.opinion}
                  </p>
                </div>
                        </div>

              {/* Detailed Recommendations */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Scroll className="h-5 w-5" />
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
              <h4 className="font-semibold text-foreground mb-2">Wall Dimensions</h4>
              <p className="text-muted-foreground">
                Enter the height of the wall and the total width of all walls you plan to wallpaper. Include all walls in the room for accurate calculations.
              </p>
            </div>
                    <div>
              <h4 className="font-semibold text-foreground mb-2">Roll Specifications</h4>
              <p className="text-muted-foreground">
                The length and width of a single wallpaper roll as specified by the manufacturer. These dimensions vary by brand and style.
              </p>
                    </div>
                    <div>
              <h4 className="font-semibold text-foreground mb-2">Pattern Repeat</h4>
              <p className="text-muted-foreground">
                The vertical distance before the wallpaper pattern repeats itself. Enter 0 for solid colors or non-repeating patterns. This is crucial for pattern alignment and affects material waste.
              </p>
                    </div>
                    <div>
              <h4 className="font-semibold text-foreground mb-2">Measurement Units</h4>
              <p className="text-muted-foreground">
                Choose between feet/inches or meters/centimeters. The calculator automatically handles unit conversions for accurate calculations.
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
              Explore other home improvement calculators to plan your renovation project
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
                  <a href="/category/home-improvement/tile-flooring-calculator" className="text-primary hover:underline">
                    Tile & Flooring Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the exact amount of tiles or flooring materials needed for your project.
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
    <meta itemProp="name" content="The Definitive Guide to Wallpaper Roll Calculation, Area, and Pattern Match Estimation" />
    <meta itemProp="description" content="An expert guide detailing how to calculate the number of wallpaper rolls required based on wall perimeter, ceiling height, pattern repeat, and necessary waste allowance for trimming and matching." />
    <meta itemProp="keywords" content="wallpaper roll calculator formula, how many rolls of wallpaper, wallpaper pattern repeat match, calculating wall area for wallpaper, wallpaper trimming waste factor, deduction windows doors" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-wallpaper-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Wallpaper Rolls: Calculating Quantity Based on Pattern and Height</h1>
    <p className="text-lg italic text-gray-700">Master the specialized formulas that factor in pattern matching and wall height to accurately estimate rolls and avoid material shortages.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#area-method" className="hover:underline">Area Method vs. Strip Method Calculation</a></li>
        <li><a href="#roll-coverage" className="hover:underline">Standard Roll Sizes and Theoretical Coverage</a></li>
        <li><a href="#strips" className="hover:underline">The Strip Method: Calculating Required Vertical Strips</a></li>
        <li><a href="#pattern-match" className="hover:underline">Critical Factor: Pattern Repeat and Match Waste</a></li>
        <li><a href="#deductions" className="hover:underline">Deductions and Final Roll Count</a></li>
    </ul>
<hr />

    {/* AREA METHOD VS. STRIP METHOD CALCULATION */}
    <h2 id="area-method" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Area Method vs. Strip Method Calculation</h2>
    <p>Unlike paint and flooring, wallpaper calculation is fundamentally complex because materials must be matched both horizontally (across the wall) and vertically (down the roll). While a simplified **Area Method** exists, the **Strip Method** is the only reliable way to account for pattern waste.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Area Method (Quick Estimate)</h3>
    <p>This method calculates the total square footage of the walls and divides by the coverage area of one roll. It is fast but highly inaccurate, as it fails to account for the substantial material loss required to match patterns at seams. It is generally suitable only for solid, non-patterned papers.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Strip Method (Accurate Estimate)</h3>
    <p>This method focuses on the number of usable vertical **strips** that can be cut from a single roll. Since wallpaper is always hung vertically, this approach directly addresses the constraints imposed by ceiling height and pattern repeat, yielding a much more accurate roll count.</p>

<hr />

    {/* STANDARD ROLL SIZES AND THEORETICAL COVERAGE */}
    <h2 id="roll-coverage" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Standard Roll Sizes and Theoretical Coverage</h2>
    <p>Wallpaper is typically sold in **single rolls** or bundled as **double rolls**. Calculations rely on the standardized dimensions of the roll to determine theoretical coverage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Dimensions of a Standard Roll</h3>
    <p>The standard size varies, but a common "American" single roll is 27 inches wide (0.685 meters) by 13.5 feet long (4.1 meters). However, many manufacturers now adhere to a "Metric" single roll size. It is critical to know the exact square footage or square meters provided by the manufacturer for the product being purchased.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Double Roll Standard</h3>
    <p>Wallpaper is usually priced and sold in double rolls, which contain the length of two single rolls. This bundling is standard practice to minimize the risk of color variation (dye lot issues) between rolls. All final estimates should be rounded up to the nearest full double roll.</p>

<hr />

    {/* THE STRIP METHOD: CALCULATING REQUIRED VERTICAL STRIPS */}
    <h2 id="strips" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Strip Method: Calculating Required Vertical Strips</h2>
    <p>The Strip Method calculates the total number of vertical strips needed for the room's perimeter, and then determines how many of those strips can be cut from a single roll.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 1: Calculate Total Strips Needed</h3>
    <p>The total width of the walls (the perimeter of the room minus deduction widths) is divided by the usable width of one roll:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Strips = Total Wall Width / Roll Width'}
        </p>
    </div>
    <p>The result is always rounded up to the next whole number to account for partial strips at corners and ends.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 2: Calculate Usable Strips Per Roll (Considering Waste)</h3>
    <p>This is the most complex step and requires accounting for the **pattern match** and **ceiling height** to determine the maximum usable length per strip, and thus, how many strips fit on one roll:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Usable Strips = Total Roll Length / (Wall Height + Pattern Repeat + Trim Waste)'}
        </p>
    </div>
    <p>The divisor (the denominator) represents the minimum required length for one matched strip.</p>

<hr />

    {/* CRITICAL FACTOR: PATTERN REPEAT AND MATCH WASTE */}
    <h2 id="pattern-match" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Critical Factor: Pattern Repeat and Match Waste</h2>
    <p>The **Pattern Repeat** dictates how much material must be discarded from the top and bottom of each strip to ensure the pattern aligns perfectly at the horizontal seam.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Pattern Match Types</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Random Match (Free Match):</strong> The pattern matches regardless of how the strips are placed (e.g., textures, solids). Waste is minimal (only top/bottom trim).</li>
        <li><strong className="font-semibold">Straight Match (Butt Match):</strong> The pattern aligns across the wall at the same height on adjacent strips. Waste equals the pattern repeat length.</li>
        <li><strong className="font-semibold">Drop Match (Half-Drop or Multiple Drop):</strong> The pattern on the second strip drops down by a specific distance (e.g., half the pattern length) to align. This is the most complex and results in the highest amount of waste.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Pattern Waste Calculation</h3>
    <p>The usable length of a strip must be a multiple of the pattern repeat length that is also greater than the ceiling height. For example, if the ceiling is 96 inches and the pattern repeat is 24 inches, the minimum strip length needed is $96$ inches. If the ceiling is 100 inches, the next whole multiple of 24 is 120 inches, meaning 20 inches of material are automatically wasted per strip just for matching.</p>

<hr />

    {/* DEDUCTIONS AND FINAL ROLL COUNT */}
    <h2 id="deductions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Deductions and Final Roll Count</h2>
    <p>Unlike paint, where large windows are deducted from the total area, deductions for wallpaper must be done carefully, as pattern continuity is paramount.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Deduction Rule for Wallpaper</h3>
    <p>Generally, areas dedicated to small openings (less than 20 square feet, e.g., a standard door) are **not deducted** from the strip count. The material required to work around the opening (cutting, alignment, waste) is usually equal to or greater than the material saved. Only large, continuous areas (e.g., wide picture windows, large built-in cabinets) should be considered for a deduction, and even then, the saved strips must be used for areas like above-door transoms or small niches.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Final Roll Calculation</h3>
    <p>The final roll count is determined by dividing the total number of required strips by the number of usable strips that can be cut from a single roll, and then rounding up to the nearest whole double roll:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Rolls Needed = Ceiling (Total Strips / Usable Strips per Roll)'}
        </p>
    </div>
    <p>The ceiling function ensures that any fraction of a roll needed (e.g., 0.1 of a roll) is rounded up to 1, as partial rolls cannot be purchased.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Wallpaper calculation is a specialized mathematical exercise dominated by the need for vertical alignment and pattern continuity. The most reliable method is the **Strip Method**, which factors in the critical variables of **ceiling height**, **pattern repeat**, and **trimming waste**.</p>
    <p>Accurate estimation involves accepting that waste is inevitable and necessary. By precisely calculating the minimum usable length per strip, installers can avoid material shortages, minimize pattern misalignment, and ensure a professional, seamless final result.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about wallpaper installation and material calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How much extra wallpaper should I buy?</h4>
              <p className="text-muted-foreground">
                The calculator includes a 10% wastage factor, which is standard for most projects. For complex patterns or irregular rooms, consider buying 15-20% extra to account for pattern matching and cuts.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is pattern repeat and why is it important?</h4>
              <p className="text-muted-foreground">
                Pattern repeat is the vertical distance between identical points in the wallpaper pattern. It's crucial for ensuring patterns align correctly between strips and significantly affects material waste, especially with large repeats.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I buy all wallpaper from the same batch?</h4>
              <p className="text-muted-foreground">
                Yes, absolutely. Wallpaper colors and patterns can vary between batches (lots). Always purchase all rolls, including extras, from the same batch number to ensure consistency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I prepare walls for wallpapering?</h4>
              <p className="text-muted-foreground">
                Walls must be clean, smooth, dry, and primed. Remove old wallpaper, fill holes and cracks, sand rough areas, and apply wallpaper primer. Proper preparation ensures good adhesion and a professional finish.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I wallpaper over existing wallpaper?</h4>
              <p className="text-muted-foreground">
                Generally not recommended. Existing wallpaper can cause adhesion problems and create an uneven surface. It's best to remove old wallpaper completely and prepare the wall properly before applying new wallpaper.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate wallpaper for rooms with doors and windows?</h4>
              <p className="text-muted-foreground">
                The calculator doesn't subtract for doors and windows, which provides a safety buffer. This extra wallpaper accounts for cutting around openings, pattern matching, and future repairs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between prepasted and unpasted wallpaper?</h4>
              <p className="text-muted-foreground">
                Prepasted wallpaper has adhesive already applied and is activated with water. Unpasted wallpaper requires separate wallpaper paste. Both types work well, but prepasted is easier for DIY projects.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long does wallpaper adhesive take to dry?</h4>
              <p className="text-muted-foreground">
                Most wallpaper adhesives are ready for trimming within 15-30 minutes and fully dry within 24-48 hours. Follow manufacturer instructions for your specific adhesive and wallpaper type.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I wallpaper over textured walls?</h4>
              <p className="text-muted-foreground">
                Light textures can be wallpapered over, but heavy textures like popcorn ceilings should be smoothed first. Use a wallpaper liner or skim coat for heavily textured walls to ensure proper adhesion.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I remove wallpaper if I make a mistake?</h4>
              <p className="text-muted-foreground">
                Use a scoring tool to perforate the wallpaper, then apply warm water or wallpaper remover solution. Let it soak for 10-15 minutes, then gently scrape with a putty knife. For stubborn adhesive, use a steamer.
              </p>
            </div>
          </CardContent>
        </Card>
                    </div>
    </div>
  );
}