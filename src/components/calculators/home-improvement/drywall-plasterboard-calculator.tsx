'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Square, Ruler, Calculator, Info, AlertCircle, TrendingUp, Users, Home, Building, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  roomLength: z.number().min(0.1).optional(),
  roomWidth: z.number().min(0.1).optional(),
  roomHeight: z.number().min(0.1).optional(),
  sheetSize: z.enum(['4x8', '4x12']).optional(),
  includeCeiling: z.boolean().optional(),
  unit: z.enum(['feet', 'meters']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DrywallPlasterboardCalculator() {
  const [result, setResult] = useState<{ 
    sheetsNeeded: number; 
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
      roomLength: undefined, 
      roomWidth: undefined, 
      roomHeight: undefined, 
      sheetSize: undefined, 
      includeCeiling: undefined, 
      unit: undefined 
    }
  });

  const calculate = (v: FormValues) => {
    if (v.roomLength == null || v.roomWidth == null || v.roomHeight == null || v.sheetSize == null || v.includeCeiling == null || v.unit == null) return null;
    
    let roomLength = v.roomLength;
    let roomWidth = v.roomWidth;
    let roomHeight = v.roomHeight;
    
    // Convert to feet if in meters
    if (v.unit === 'meters') {
        roomLength *= 3.28084;
        roomWidth *= 3.28084;
        roomHeight *= 3.28084;
    }

    const wallArea = (roomLength * roomHeight * 2) + (roomWidth * roomHeight * 2);
    const ceilingArea = v.includeCeiling ? roomLength * roomWidth : 0;
    const totalArea = wallArea + ceilingArea;

    const sheetArea = v.sheetSize === '4x8' ? 32 : 48;
    const sheetsNeeded = Math.ceil(totalArea / sheetArea);
    
    return sheetsNeeded;
  };

  const interpret = (sheetsNeeded: number, sheetSize: string) => {
    const sizeText = sheetSize === '4x8' ? '4x8 ft' : '4x12 ft';
    if (sheetsNeeded > 50) return `Large drywall project requiring ${sheetsNeeded} ${sizeText} sheets.`;
    if (sheetsNeeded >= 20) return `Medium drywall project requiring ${sheetsNeeded} ${sizeText} sheets.`;
    return `Small drywall project requiring ${sheetsNeeded} ${sizeText} sheets.`;
  };

  const getProjectSize = (sheetsNeeded: number) => {
    if (sheetsNeeded > 50) return 'Large Project';
    if (sheetsNeeded >= 20) return 'Medium Project';
    return 'Small Project';
  };

  const getEfficiencyLevel = (sheetSize: string) => {
    if (sheetSize === '4x12') return 'Large Sheets';
    return 'Standard Sheets';
  };

  const getRecommendations = (sheetsNeeded: number, sheetSize: string, includeCeiling: boolean) => {
    const recommendations = [];
    
    recommendations.push(`Purchase ${sheetsNeeded + Math.ceil(sheetsNeeded * 0.1)} sheets for safety margin`);
    recommendations.push('Use appropriate drywall screws and joint compound');
    recommendations.push('Plan sheet layout to minimize waste and seams');
    recommendations.push('Ensure proper framing support for sheet weight');
    
    if (sheetSize === '4x12') {
      recommendations.push('Consider help for handling large sheets');
      recommendations.push('Use proper lifting techniques for 4x12 sheets');
    }
    
    if (includeCeiling) {
      recommendations.push('Use ceiling lift or additional help for ceiling installation');
    }
    
    return recommendations;
  };

  const getConsiderations = (sheetsNeeded: number, sheetSize: string) => {
    const considerations = [];
    
    considerations.push('Room shape affects sheet cutting and waste');
    considerations.push('Windows and doors reduce actual drywall area');
    considerations.push('Joint compound needed for seams and finishing');
    considerations.push('Proper framing required for sheet support');
    
    if (sheetSize === '4x12') {
      considerations.push('Large sheets are heavier and harder to handle');
      considerations.push('Fewer seams but more difficult installation');
    }
    
    return considerations;
  };

  const opinion = (sheetsNeeded: number, sheetSize: string) => {
    if (sheetsNeeded > 50) return `This is a substantial project that may benefit from professional installation and careful planning.`;
    if (sheetsNeeded >= 20) return `This is a manageable DIY project with proper tools and preparation.`;
    return `Perfect size for a DIY weekend project with basic drywall skills.`;
  };

  const onSubmit = (values: FormValues) => {
    const sheetsNeeded = calculate(values);
    if (sheetsNeeded == null) { setResult(null); return; }
    setResult({ 
      sheetsNeeded, 
      interpretation: interpret(sheetsNeeded, values.sheetSize || '4x8'), 
      opinion: opinion(sheetsNeeded, values.sheetSize || '4x8'),
      projectSize: getProjectSize(sheetsNeeded),
      efficiencyLevel: getEfficiencyLevel(values.sheetSize || '4x8'),
      recommendations: getRecommendations(sheetsNeeded, values.sheetSize || '4x8', values.includeCeiling || true),
      considerations: getConsiderations(sheetsNeeded, values.sheetSize || '4x8')
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
            Room Dimensions & Sheet Specifications
          </CardTitle>
          <CardDescription>
            Enter your room dimensions and drywall sheet specifications to calculate material needs
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
                  name="sheetSize" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        Sheet Size
                      </FormLabel>
                <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(e.target.value as '4x8' | '4x12')}
                        >
                          <option value="">Select sheet size</option>
                          <option value="4x8">4ft x 8ft</option>
                          <option value="4x12">4ft x 12ft</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="roomLength" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Room Length ({unit})
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
                  name="roomWidth" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Room Width ({unit})
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
                  name="roomHeight" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Room Height ({unit})
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
                  name="includeCeiling" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        Include Ceiling
                      </FormLabel>
                <FormControl>
                        <div className="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            checked={field.value || false} 
                            onChange={(e) => field.onChange(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm text-muted-foreground">Include ceiling in calculation</span>
                        </div>
                </FormControl>
                      <FormMessage />
              </FormItem>
                  )} 
                />
                </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Drywall Sheets
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
                  <CardTitle>Your Drywall Requirements</CardTitle>
                  <CardDescription>Detailed drywall calculation and project analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Square className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Sheets Needed</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.sheetsNeeded} sheets
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.projectSize}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Sheet Size</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.efficiencyLevel === 'Large Sheets' ? 'default' : 'secondary'}>
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
                    {result.sheetsNeeded > 50 ? 'Large Project' : 
                     result.sheetsNeeded >= 20 ? 'Medium Project' : 'Small Project'}
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
              <h4 className="font-semibold text-foreground mb-2">Room Dimensions</h4>
              <p className="text-muted-foreground">
                Enter the length, width, and height of the room. The calculator assumes rectangular walls and includes ceiling area if selected.
              </p>
            </div>
                    <div>
              <h4 className="font-semibold text-foreground mb-2">Sheet Size</h4>
              <p className="text-muted-foreground">
                Standard drywall sheets come in 4x8 ft (32 sq ft) and 4x12 ft (48 sq ft) sizes. Larger sheets mean fewer seams but are heavier and harder to handle.
              </p>
                    </div>
                    <div>
              <h4 className="font-semibold text-foreground mb-2">Include Ceiling</h4>
              <p className="text-muted-foreground">
                Check this box if you plan to drywall the ceiling. Ceiling installation requires additional planning and may need specialized tools or help.
              </p>
                    </div>
                    <div>
              <h4 className="font-semibold text-foreground mb-2">Measurement Units</h4>
              <p className="text-muted-foreground">
                Choose between feet or meters. The calculator automatically handles unit conversions for accurate calculations.
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
    <meta itemProp="name" content="The Definitive Guide to Drywall (Plasterboard) Calculation, Area, and Waste Estimation" />
    <meta itemProp="description" content="An expert guide detailing how to calculate the number of drywall sheets required for walls and ceilings, covering standard sheet sizes, accounting for openings (windows/doors), and calculating essential waste and contingency factors." />
    <meta itemProp="keywords" content="drywall calculator formula, how many drywall sheets do I need, calculating wall area for drywall, plasterboard sheet count, drywall waste factor, area deduction for openings" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-drywall-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Drywall (Plasterboard): Calculating Sheets, Area, and Waste</h1>
    <p className="text-lg italic text-gray-700">Master the geometric and efficiency calculations required to estimate the exact number of panels needed for wall and ceiling installation.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#area-measurement" className="hover:underline">Total Surface Area and Basic Measurement</a></li>
        <li><a href="#standard-sheets" className="hover:underline">Standard Sheet Sizes and Panel Coverage</a></li>
        <li><a href="#deductions" className="hover:underline">Accounting for Openings (Windows and Doors)</a></li>
        <li><a href="#waste-factor" className="hover:underline">The Critical Role of the Waste Factor</a></li>
        <li><a href="#supplemental" className="hover:underline">Supplemental Material Estimation (Tape and Mud)</a></li>
    </ul>
<hr />

    {/* TOTAL SURFACE AREA AND BASIC MEASUREMENT */}
    <h2 id="area-measurement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Total Surface Area and Basic Measurement</h2>
    <p>Drywall calculation begins with determining the total gross area of all walls and ceilings that require coverage. This is a crucial step that sets the baseline for material ordering.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Gross Area</h3>
    <p>For standard rectangular rooms, the total gross area is the sum of the area of all walls and the ceiling. The area of each surface is found by:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Area = Length * Height (or Width)'}
        </p>
    </div>
    <p>In complex or multi-level rooms, the total surface is segmented into simple squares and rectangles, and their areas are summed. Measurements should always be taken in a consistent unit (feet or meters) to ensure the final quantity is correct.</p>

<hr />

    {/* STANDARD SHEET SIZES AND PANEL COVERAGE */}
    <h2 id="standard-sheets" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Standard Sheet Sizes and Panel Coverage</h2>
    <p>Drywall (or plasterboard) is manufactured in specific dimensions, and the installer must choose a size that minimizes waste and simplifies the installation process.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Common Drywall Dimensions</h3>
    <p>The most common sheet sizes are designed around standard residential framing (8-foot ceilings, 16- or 24-inch stud spacing):</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">4' x 8' Sheet (32 sq ft):</strong> Most standard size, ideal for small areas and easy handling.</li>
        <li><strong className="font-semibold">4' x 10' Sheet (40 sq ft):</strong> Used for 10-foot ceilings to reduce or eliminate the need for horizontal seams.</li>
        <li><strong className="font-semibold">4' x 12' Sheet (48 sq ft):</strong> Ideal for long walls and large projects, reducing the number of butt joints that require extra finishing work.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Optimizing Sheet Size for Seams</h3>
    <p>Professional estimates prioritize using the longest possible sheet length that fits the room dimensions, as every sheet requires finishing (taping and mudding). Fewer sheets mean fewer seams, leading to less labor and higher quality finishes. For instance, using 12-foot sheets on a 24-foot wall minimizes labor compared to using six 8-foot sheets.</p>

<hr />

    {/* ACCOUNTING FOR OPENINGS (WINDOWS AND DOORS) */}
    <h2 id="deductions" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Accounting for Openings (Windows and Doors)</h2>
    <p>Openings such as windows, doors, and large HVAC returns must be accounted for in the final calculation, but not always by simple deduction of area.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Deduction Rule (Net Area)</h3>
    <p>While the area of a large window is not covered by drywall, the effort required to cut and frame the drywall around the opening, along with the corner waste generated, often negates the material savings. As a standard practice:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Large Openings (over 30 sq ft):</strong> The area is typically deducted from the total sheet requirement, as the material savings outweigh the cutting waste.</li>
        <li><strong className="font-semibold">Small Openings (under 30 sq ft):</strong> The area is often *ignored* (not deducted). The material that would have covered the opening is assumed to be lost as cutting waste and scraps generated during installation.</li>
    </ul>

<hr />

    {/* THE CRITICAL ROLE OF THE WASTE FACTOR */}
    <h2 id="waste-factor" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of the Waste Factor</h2>
    <p>The <strong className="font-semibold">Waste Factor</strong> is the percentage added to the total calculated net area to account for material loss due to irregular cuts, mistakes, and transport damage. Unlike some materials, drywall waste is highly influenced by framing layout and room complexity.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Standard Waste Guidelines</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Simple Rooms (Square/Rectangle):</strong> 5% to 10% waste factor.</li>
        <li><strong className="font-semibold">Complex Rooms (Angles, Many Openings):</strong> 12% to 15% waste factor.</li>
        <li><strong className="font-semibold">Difficult Installation (High Ceilings, Skylights):</strong> Up to 20% waste factor.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Final Sheet Calculation</h3>
    <p>The final formula incorporates the total net area, the waste factor, and the area of the chosen sheet size, always rounding up to ensure sufficient material is available:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Sheets = Ceiling [ (Net Area * (1 + Waste Factor)) / Area of One Sheet ]'}
        </p>
    </div>
    <p>The **Ceiling function** ($\lceil \dots \rceil$) is mathematically essential here, as sheets must be purchased as whole units.</p>

<hr />

    {/* SUPPLEMENTAL MATERIAL ESTIMATION (TAPE AND MUD) */}
    <h2 id="supplemental" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Supplemental Material Estimation (Tape and Mud)</h2>
    <p>The sheet count directly determines the requirement for finishing materials—joint tape and joint compound ("mud"). These materials are estimated based on the total length of seams.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Joint Compound (Mud)</h3>
    <p>The amount of joint compound needed is proportional to the total square footage of the drywall being installed, as it must cover all seams, fasteners (screws/nails), and corner beads. Estimators use a rule of thumb based on pounds of compound per square foot of drywall or per linear foot of seam.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Joint Tape</h3>
    <p>Tape is required for every internal seam. The total linear footage of seams is calculated by multiplying the total number of sheets by the average number of seams per sheet (accounting for vertical and horizontal joints) and adding the linear footage required for all internal corners.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Drywall calculation is a specialized area measurement that focuses on minimizing seams while accurately forecasting material loss. The process moves beyond simple area by requiring the selection of an optimal sheet size, careful application of **deduction rules** for openings, and the necessary inclusion of a **waste factor** based on room complexity.</p>
    <p>By using the final calculation (Net Area $\times$ Waste $\div$ Sheet Area, rounded up), constructors ensure efficient panel layout, reduce finishing labor, and minimize the risk of costly material shortages.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about drywall installation and material calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How much extra drywall should I buy?</h4>
              <p className="text-muted-foreground">
                Add 10-15% extra drywall sheets to account for cuts, waste, and mistakes. For complex rooms with many angles or obstacles, consider 20% extra.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between 4x8 and 4x12 sheets?</h4>
              <p className="text-muted-foreground">
                4x8 sheets are standard size (32 sq ft), easier to handle, and more common. 4x12 sheets (48 sq ft) mean fewer seams but are heavier and require more skill to install.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I prepare for drywall installation?</h4>
              <p className="text-muted-foreground">
                Ensure proper framing is in place, check for level and plumb walls, install electrical boxes, and plan your sheet layout to minimize waste and seams.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What tools do I need for drywall installation?</h4>
              <p className="text-muted-foreground">
                Essential tools include a drywall saw, utility knife, T-square, drywall screws, screw gun, joint compound, taping knives, and sandpaper. For ceilings, consider a drywall lift.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate drywall for irregular-shaped rooms?</h4>
              <p className="text-muted-foreground">
                Break irregular rooms into rectangular sections, calculate each area separately, then add them together. Increase waste percentage for complex shapes with many cuts.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I include doors and windows in my calculation?</h4>
              <p className="text-muted-foreground">
                The calculator doesn't subtract for doors and windows, which provides a natural buffer for waste. This extra drywall accounts for cuts around openings and future repairs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How much joint compound do I need?</h4>
              <p className="text-muted-foreground">
                Estimate 1 gallon of joint compound per 100 sq ft of drywall. This covers seams, corners, and screw holes. Buy extra for multiple coats and touch-ups.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I install drywall by myself?</h4>
              <p className="text-muted-foreground">
                Small projects are manageable solo, but larger sheets and ceiling work benefit from help. Use a drywall lift for ceiling installation and proper lifting techniques for large sheets.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long does drywall installation take?</h4>
              <p className="text-muted-foreground">
                Installation time varies by room size and complexity. A small room (10x12) might take 1-2 days, while larger rooms or those with complex layouts can take 3-5 days including finishing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the proper spacing for drywall screws?</h4>
              <p className="text-muted-foreground">
                Space screws 8 inches apart on walls and 6 inches apart on ceilings. Place screws at least 3/8 inch from sheet edges and ensure they're slightly recessed but not breaking the paper.
              </p>
            </div>
          </CardContent>
        </Card>
                    </div>
    </div>
  );
}