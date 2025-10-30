'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PaintBucket, Ruler, Layers, Calculator, Info, AlertCircle, TrendingUp, Users, Home, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  length: z.number().min(0.1).optional(),
  width: z.number().min(0.1).optional(),
  height: z.number().min(0.1).optional(),
  coats: z.number().min(1).max(10).optional(),
  unit: z.enum(['meters', 'feet']).optional(),
  coveragePerUnit: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PaintCoverageCalculator() {
  const [result, setResult] = useState<{ 
    paintNeeded: number; 
    interpretation: string; 
    opinion: string;
    projectSize: string;
    efficiencyLevel: string;
    recommendations: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      length: undefined, 
      width: undefined, 
      height: undefined, 
      coats: undefined, 
      unit: undefined, 
      coveragePerUnit: undefined 
    }
  });

  const calculate = (v: FormValues) => {
    if (v.length == null || v.width == null || v.height == null || v.coats == null || v.unit == null || v.coveragePerUnit == null) return null;

    const wallArea1 = v.length * v.height;
    const wallArea2 = v.width * v.height;
    const totalWallArea = (wallArea1 + wallArea2) * 2;
    const ceilingArea = v.length * v.width;
    const totalArea = totalWallArea + ceilingArea;
    const totalAreaToPaint = totalArea * v.coats;
    
    const paintNeeded = totalAreaToPaint / v.coveragePerUnit;
    return Math.ceil(paintNeeded);
  };

  const interpret = (paintNeeded: number, unit: string) => {
    const unitText = unit === 'feet' ? 'gallons' : 'liters';
    if (paintNeeded > 10) return `Large project requiring ${paintNeeded} ${unitText} of paint.`;
    if (paintNeeded >= 5) return `Medium project requiring ${paintNeeded} ${unitText} of paint.`;
    return `Small project requiring ${paintNeeded} ${unitText} of paint.`;
  };

  const getProjectSize = (paintNeeded: number) => {
    if (paintNeeded > 10) return 'Large Project';
    if (paintNeeded >= 5) return 'Medium Project';
    return 'Small Project';
  };

  const getEfficiencyLevel = (coveragePerUnit: number) => {
    if (coveragePerUnit > 400) return 'High Efficiency';
    if (coveragePerUnit >= 300) return 'Standard Efficiency';
    return 'Lower Efficiency';
  };

  const getRecommendations = (paintNeeded: number, coats: number, unit: string) => {
    const recommendations = [];
    const unitText = unit === 'feet' ? 'gallons' : 'liters';
    
    recommendations.push(`Purchase ${paintNeeded + 1} ${unitText} for safety margin`);
    recommendations.push('Use primer for better coverage and adhesion');
    recommendations.push('Prepare surfaces properly before painting');
    recommendations.push('Use quality brushes and rollers for even application');
    
    if (coats > 2) {
      recommendations.push('Allow proper drying time between coats');
    }
    
    if (paintNeeded > 5) {
      recommendations.push('Consider buying paint in bulk for cost savings');
    }
    
    return recommendations;
  };

  const getConsiderations = (paintNeeded: number, coveragePerUnit: number) => {
    const considerations = [];
    
    considerations.push('Surface texture affects paint absorption');
    considerations.push('Dark colors may require additional coats');
    considerations.push('Temperature and humidity affect drying time');
    considerations.push('Windows and doors reduce actual paintable area');
    
    if (coveragePerUnit < 300) {
      considerations.push('Low coverage paint may need more coats');
    }
    
    return considerations;
  };

  const opinion = (paintNeeded: number, unit: string) => {
    const unitText = unit === 'feet' ? 'gallons' : 'liters';
    if (paintNeeded > 10) return `Plan for multiple painting sessions and consider professional help for this large project.`;
    if (paintNeeded >= 5) return `This is a manageable DIY project with proper planning and preparation.`;
    return `Perfect size for a weekend DIY project with minimal preparation needed.`;
  };

  const onSubmit = (values: FormValues) => {
    const paintNeeded = calculate(values);
    if (paintNeeded == null) { setResult(null); return; }
    setResult({ 
      paintNeeded, 
      interpretation: interpret(paintNeeded, values.unit || 'feet'), 
      opinion: opinion(paintNeeded, values.unit || 'feet'),
      projectSize: getProjectSize(paintNeeded),
      efficiencyLevel: getEfficiencyLevel(values.coveragePerUnit || 350),
      recommendations: getRecommendations(paintNeeded, values.coats || 2, values.unit || 'feet'),
      considerations: getConsiderations(paintNeeded, values.coveragePerUnit || 350)
    });
  };
  
  const handleUnitChange = (unit: 'meters' | 'feet') => {
    form.setValue('unit', unit);
    if (unit === 'meters') {
      form.setValue('coveragePerUnit', 10);
    } else {
      form.setValue('coveragePerUnit', 350);
    }
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Room Dimensions & Paint Specifications
          </CardTitle>
          <CardDescription>
            Enter your room dimensions and paint specifications to calculate coverage needs
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
                        <Calculator className="h-4 w-4" />
                        Measurement Units
                      </FormLabel>
                                    <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => handleUnitChange(e.target.value as 'meters' | 'feet')}
                        >
                          <option value="">Select units</option>
                          <option value="feet">Feet (ft)</option>
                          <option value="meters">Meters (m)</option>
                  </select>
                                    </FormControl>
                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                            <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Room Length
                      </FormLabel>
                                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 12" 
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
                        name="width"
                        render={({ field }) => (
                            <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Room Width
                      </FormLabel>
                                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 10" 
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
                        name="height"
                        render={({ field }) => (
                            <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Room Height
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
                        name="coats"
                        render={({ field }) => (
                            <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Number of Coats
                      </FormLabel>
                                <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 2" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} 
                        />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="coveragePerUnit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2">
                        <PaintBucket className="h-4 w-4" />
                                  Paint Coverage ({form.getValues('unit') === 'feet' ? 'sq ft / gallon' : 'sq m / liter'})
                                </FormLabel>
                                <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 350" 
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
                Calculate Paint Needed
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
                        <PaintBucket className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Paint Coverage Estimate</CardTitle>
                  <CardDescription>Detailed paint requirements and project analysis</CardDescription>
                </div>
                    </div>
                </CardHeader>
                <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <PaintBucket className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Paint Needed</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.paintNeeded} {form.getValues('unit') === 'feet' ? 'gallons' : 'liters'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.projectSize}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Efficiency Level</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.efficiencyLevel === 'High Efficiency' ? 'default' : result.efficiencyLevel === 'Standard Efficiency' ? 'secondary' : 'destructive'}>
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
                    {result.paintNeeded > 10 ? 'Large Project' : 
                     result.paintNeeded >= 5 ? 'Medium Project' : 'Small Project'}
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
                        <PaintBucket className="h-5 w-5" />
                        Project Recommendations
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
              <h4 className="font-semibold text-foreground mb-2">Room Dimensions</h4>
              <p className="text-muted-foreground">
                Enter the length, width, and height of your room. The calculator assumes a rectangular room and includes both walls and ceiling area in the calculation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Number of Coats</h4>
              <p className="text-muted-foreground">
                The number of paint coats you plan to apply. Two coats is standard for good coverage, especially when changing colors or painting over dark surfaces.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Paint Coverage Rate</h4>
              <p className="text-muted-foreground">
                This is the most important factor for accuracy. Check your paint can label for the exact coverage rate, typically 350-400 sq ft per gallon or 9-10 sq m per liter.
              </p>
            </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Measurement Units</h4>
              <p className="text-muted-foreground">
                Choose between feet/inches or meters/centimeters. The calculator automatically adjusts paint coverage rates based on your selected unit system.
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
                  <a href="/category/home-improvement/wallpaper-roll-calculator" className="text-primary hover:underline">
                    Wallpaper Roll Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine how many wallpaper rolls you need for your room makeover project.
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
    <meta itemProp="name" content="The Definitive Guide to Paint Coverage Calculation and Estimating Paint Needs" />
    <meta itemProp="description" content="An expert guide detailing how to calculate the required volume of paint (gallons/liters) based on surface area, paint type (primer, finish coat), number of coats, waste factor, and account for windows and doors." />
    <meta itemProp="keywords" content="paint coverage calculator formula, how much paint do I need, calculating wall area for painting, estimating paint quantity, paint waste factor, area deduction windows doors" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-paint-coverage-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Paint Coverage: Accurately Estimating Volume and Minimizing Waste</h1>
    <p className="text-lg italic text-gray-700">Master the geometric formulas and material science variables required to calculate exactly how much paint you need for any project.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#area-basics" className="hover:underline">Surface Area Calculation Basics</a></li>
        <li><a href="#deductions" className="hover:underline">Deductions: Accounting for Windows and Doors</a></li>
        <li><a href="#volume-formula" className="hover:underline">The Core Paint Volume Formula</a></li>
        <li><a href="#variables" className="hover:underline">Critical Variables Affecting Paint Coverage</a></li>
        <li><a href="#waste" className="hover:underline">Accounting for Waste and Spillage</a></li>
    </ul>
<hr />

    {/* SURFACE AREA CALCULATION BASICS */}
    <h2 id="area-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Surface Area Calculation Basics</h2>
    <p>The first step in any paint job estimate is accurately determining the total surface area to be covered. Paint is typically applied to rectangular surfaces (walls, ceilings), making the area calculation simple geometry.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Rectangular Area</h3>
    <p>For a standard flat wall or ceiling, the area is calculated using the basic area formula:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Area = Length * Height'}
        </p>
    </div>
    <p>To find the total area of a room, you must calculate the area of each wall individually and then sum them up, adding the ceiling area if it is also being painted.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Complex Surfaces</h3>
    <p>For surfaces like triangular gables or pitched ceilings, the area calculation must use the formula for a triangle (Area = 0.5 $\times$ Base $\times$ Height). For the purposes of a general calculator, all areas are assumed to be summed rectangles, with any complex shapes approximated as rectangles for ease of use.</p>

<hr />

    {/* DEDUCTIONS: ACCOUNTING FOR WINDOWS AND DOORS */}
    <h2 id="deductions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Deductions: Accounting for Windows and Doors</h2>
    <p>To obtain the true net area that requires paint, you must deduct the area occupied by permanent fixtures that will not be painted (or will receive a specialized trim paint). This primarily includes windows and doors.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Deductible Area</h3>
    <p>The area of each door or window is calculated (Length $\times$ Height) and subtracted from the total wall area. For most projects, the time saved by *not* deducting very small fixtures (like light switches or small wall vents) is negligible compared to the increased accuracy of deducting large features.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Deduction Threshold Rule</h3>
    <p>Professional estimators often use a simplified **deduction rule**: if the combined area of windows and doors accounts for less than 10% of the total wall area, it is often ignored in quick estimates, as the excess paint calculated compensates for potential waste. For accurate calculations, however, all non-painted areas should be deducted:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Net Paintable Area = Total Wall Area - Total Deducted Area'}
        </p>
    </div>

<hr />

    {/* THE CORE PAINT VOLUME FORMULA */}
    <h2 id="volume-formula" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Core Paint Volume Formula</h2>
    <p>The total volume of paint required is derived by dividing the total required coverage area (Net Paintable Area multiplied by the number of coats) by the product's standardized coverage rate (provided by the manufacturer).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Standard Volume Equation</h3>
    <p>The formula to determine the necessary paint quantity (Volume) is:</p>
    
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Volume = (Net Area * Number of Coats * Waste Factor) / Manufacturer Coverage Rate'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Manufacturer Coverage Rate</h3>
    <p>This is the theoretical area (in square feet or square meters) that one unit of paint (e.g., one gallon or one liter) is expected to cover. This value is provided on the paint can label and is usually determined under ideal, laboratory conditions. Typical ranges are 350-400 square feet per gallon for high-quality latex paint.</p>

<hr />

    {/* CRITICAL VARIABLES AFFECTING PAINT COVERAGE */}
    <h2 id="variables" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Critical Variables Affecting Paint Coverage</h2>
    <p>The manufacturer's coverage rate is often unreliable in the field due to several variables that significantly impact how much paint a surface absorbs.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Surface Texture (Porosity)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Porous Surfaces:</strong> Unpainted drywall, bare wood, stucco, or highly textured plaster are extremely porous and absorb paint heavily, often reducing the effective coverage rate by 20% to 40% on the first coat.</li>
        <li><strong className="font-semibold">Non-Porous Surfaces:</strong> Glossy enamel, previously painted trim, or metal surfaces are non-porous and generally achieve the full manufacturer's coverage rate.</li>
        <li><strong className="font-semibold">The Primer Solution:</strong> Applying a good quality primer to a porous surface seals the material, often allowing the subsequent finish coat to achieve its maximum theoretical coverage rate.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Color Change</h3>
    <p>The required number of coats is the most subjective variable. Painting a light color over a dark base coat (or vice-versa) almost always requires a minimum of two full finish coats, and sometimes three, to achieve complete opacity and consistent color saturation.</p>

<hr />

    {/* ACCOUNTING FOR WASTE AND SPILLAGE */}
    <h2 id="waste" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Accounting for Waste and Spillage</h2>
    <p>Even the most careful professional must account for paint loss due to factors outside of surface area, which is handled by incorporating a **Waste Factor** into the total volume formula.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sources of Paint Waste</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Absorption in Tools:</strong> Paint absorbed by roller covers, brushes, and spray equipment hoses.</li>
        <li><strong className="font-semibold">Application Method:</strong> Spraying paint results in significant **overspray** (paint lost to the air), often increasing waste by 10% to 20% compared to brushing and rolling.</li>
        <li><strong className="font-semibold">Spillage:</strong> Paint spilled during mixing, pouring, or application.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Standard Waste Factor</h3>
    <p>The waste factor is applied as a percentage increase to the calculated net volume. Standard guidelines are:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Brushing/Rolling (Interior):</strong> 5% to 10% waste factor.</li>
        <li><strong className="font-semibold">Spraying (Exterior/Large Walls):</strong> 10% to 20% waste factor.</li>
    </ul>
    <p>The waste factor provides the margin of safety necessary to ensure the project is completed without having to stop work and purchase more paint.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Accurate paint coverage calculation is a blend of precise geometry and material science. It moves beyond simple area measurement by incorporating key variables: **Net Paintable Area** (total area minus deductions), the **number of coats** (driven by color change), **surface porosity**, and the necessary **waste factor**.</p>
    <p>By relying on the full formula and adjusting the manufacturer's theoretical coverage rate for real-world conditions, professionals and homeowners alike can confidently purchase the exact volume of paint required, minimizing costly trips to the store and avoiding excessive leftover material.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about paint coverage and painting projects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How accurate is the paint coverage calculator?</h4>
              <p className="text-muted-foreground">
                The calculator provides a good estimate based on standard room dimensions and paint coverage rates. However, surface texture, porosity, and application method can affect actual coverage. Always buy 10-15% extra paint for safety.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I include windows and doors in my calculation?</h4>
              <p className="text-muted-foreground">
                The calculator doesn't subtract for windows and doors, which provides a safety buffer. This extra paint accounts for cutting in around trim, touch-ups, and future maintenance needs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How many coats of paint do I really need?</h4>
              <p className="text-muted-foreground">
                Two coats are standard for most projects. One coat may suffice for touch-ups or painting over similar colors. Three or more coats might be needed when covering dark colors with light ones or using low-quality paint.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What affects paint coverage the most?</h4>
              <p className="text-muted-foreground">
                Surface texture (smooth vs. textured), porosity (primed vs. unprimed), color changes (dark to light), paint quality, and application method all significantly impact coverage rates.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use primer before painting?</h4>
              <p className="text-muted-foreground">
                Yes, especially when changing colors dramatically, painting over glossy surfaces, or covering stains. Primer improves adhesion, coverage, and color accuracy while reducing the number of topcoats needed.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate paint for textured walls?</h4>
              <p className="text-muted-foreground">
                Textured surfaces like popcorn ceilings or rough plaster absorb more paint. Increase your paint estimate by 20-25% for heavily textured surfaces, or use a lower coverage rate in the calculator.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I mix different brands of paint?</h4>
              <p className="text-muted-foreground">
                It's not recommended to mix different paint brands or types, as they may have different formulations, drying times, and finishes. Stick to one brand and type for consistent results.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long does paint last in storage?</h4>
              <p className="text-muted-foreground">
                Unopened paint cans can last 2-5 years when stored in cool, dry places. Opened cans should be used within 1-2 years. Always check for separation, lumps, or off-odors before using stored paint.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between paint finishes?</h4>
              <p className="text-muted-foreground">
                Flat/matte hides imperfections but is harder to clean. Eggshell offers slight sheen and washability. Satin provides good durability and easy cleaning. Semi-gloss and gloss are most durable and easiest to clean.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I estimate paint for exterior projects?</h4>
              <p className="text-muted-foreground">
                Exterior paint typically covers less area than interior paint due to surface roughness and weather conditions. Use a coverage rate of 250-300 sq ft per gallon and account for trim, doors, and shutters separately.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}