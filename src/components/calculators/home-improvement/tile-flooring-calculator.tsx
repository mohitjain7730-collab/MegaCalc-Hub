'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Square, Ruler, Calculator, Info, AlertCircle, TrendingUp, Users, Home, Building, Scissors } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  areaLength: z.number().min(0.1).optional(),
  areaWidth: z.number().min(0.1).optional(),
  tileLength: z.number().min(0.1).optional(),
  tileWidth: z.number().min(0.1).optional(),
  wastage: z.number().min(0).max(50).optional(),
  unit: z.enum(['meters', 'feet']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function TileFlooringCalculator() {
  const [result, setResult] = useState<{ 
    tilesNeeded: number; 
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
      areaLength: undefined, 
      areaWidth: undefined, 
      tileLength: undefined, 
      tileWidth: undefined, 
      wastage: undefined, 
      unit: undefined 
    } 
  });

  const calculate = (v: FormValues) => {
    if (v.areaLength == null || v.areaWidth == null || v.tileLength == null || v.tileWidth == null || v.wastage == null || v.unit == null) return null;
    
    let tileUnitToAreaUnit;
    if (v.unit === 'feet') {
      tileUnitToAreaUnit = 144; // inches in sq ft
    } else {
      tileUnitToAreaUnit = 10000; // cm in sq m
    }

    const totalArea = v.areaLength * v.areaWidth;
    const tileArea = (v.tileLength * v.tileWidth) / tileUnitToAreaUnit;
    const tilesForArea = totalArea / tileArea;
    const wastageTiles = tilesForArea * (v.wastage / 100);
    const tilesNeeded = Math.ceil(tilesForArea + wastageTiles);
    
    return tilesNeeded;
  };

  const interpret = (tilesNeeded: number, wastage: number) => {
    if (tilesNeeded > 200) return `Large tiling project requiring ${tilesNeeded} tiles with ${wastage}% wastage allowance.`;
    if (tilesNeeded >= 50) return `Medium tiling project requiring ${tilesNeeded} tiles with ${wastage}% wastage allowance.`;
    return `Small tiling project requiring ${tilesNeeded} tiles with ${wastage}% wastage allowance.`;
  };

  const getProjectComplexity = (tilesNeeded: number, wastage: number) => {
    if (tilesNeeded > 200) return 'Large Project';
    if (tilesNeeded >= 50) return 'Medium Project';
    return 'Small Project';
  };

  const getEfficiencyLevel = (wastage: number) => {
    if (wastage <= 5) return 'Minimal Wastage';
    if (wastage <= 15) return 'Standard Wastage';
    return 'High Wastage';
  };

  const getRecommendations = (tilesNeeded: number, wastage: number, unit: string) => {
    const recommendations = [];
    
    recommendations.push(`Purchase ${tilesNeeded} tiles from the same batch/lot`);
    recommendations.push('Ensure subfloor is clean, level, and rigid');
    recommendations.push('Use appropriate adhesive for your tile type');
    recommendations.push('Plan tile layout before starting installation');
    
    if (wastage < 10) {
      recommendations.push('Consider increasing wastage to 10-15% for safety');
    }
    
    if (tilesNeeded > 100) {
      recommendations.push('Consider professional installation for large projects');
    }
    
    return recommendations;
  };

  const getConsiderations = (tilesNeeded: number, wastage: number) => {
    const considerations = [];
    
    considerations.push('Tile color and size may vary between batches');
    considerations.push('Complex patterns require higher wastage percentages');
    considerations.push('Room shape affects actual tile requirements');
    considerations.push('Grout lines reduce visible tile area');
    
    if (wastage > 20) {
      considerations.push('High wastage suggests complex layout or difficult cuts');
    }
    
    return considerations;
  };

  const opinion = (tilesNeeded: number, wastage: number) => {
    if (tilesNeeded > 200) return `This is a substantial project that may benefit from professional installation and careful planning.`;
    if (tilesNeeded >= 50) return `This is a manageable DIY project with proper preparation and tools.`;
    return `Perfect size for a DIY weekend project with minimal complexity.`;
  };

  const onSubmit = (values: FormValues) => {
    const tilesNeeded = calculate(values);
    if (tilesNeeded == null) { setResult(null); return; }
    setResult({ 
      tilesNeeded, 
      interpretation: interpret(tilesNeeded, values.wastage || 10), 
      opinion: opinion(tilesNeeded, values.wastage || 10),
      projectComplexity: getProjectComplexity(tilesNeeded, values.wastage || 10),
      efficiencyLevel: getEfficiencyLevel(values.wastage || 10),
      recommendations: getRecommendations(tilesNeeded, values.wastage || 10, values.unit || 'feet'),
      considerations: getConsiderations(tilesNeeded, values.wastage || 10)
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
            Area & Tile Specifications
          </CardTitle>
          <CardDescription>
            Enter your area dimensions and tile specifications to calculate material needs
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
                  name="areaLength" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Area Length ({unit})
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
                  name="areaWidth" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Area Width ({unit})
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
                  name="tileLength" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        Tile Length ({unit === 'feet' ? 'in' : 'cm'})
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
                  name="tileWidth" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        Tile Width ({unit === 'feet' ? 'in' : 'cm'})
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
                  name="wastage" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Scissors className="h-4 w-4" />
                        Wastage Percentage (%)
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          placeholder="e.g., 10" 
                          {...field} 
                          value={field.value ?? ''} 
                          onChange={e => field.onChange(parseInt(e.target.value, 10) || undefined)} 
                        />
                </FormControl>
                      <FormMessage />
              </FormItem>
                  )} 
                />
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Tiles Needed
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
                  <CardTitle>Your Tile Requirements</CardTitle>
                  <CardDescription>Detailed tile calculation and project analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Square className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Tiles Needed</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.tilesNeeded} tiles
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.projectComplexity}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Wastage Level</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.efficiencyLevel === 'Minimal Wastage' ? 'default' : result.efficiencyLevel === 'Standard Wastage' ? 'secondary' : 'destructive'}>
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
                    {result.tilesNeeded > 200 ? 'Large Project' : 
                     result.tilesNeeded >= 50 ? 'Medium Project' : 'Small Project'}
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
              <h4 className="font-semibold text-foreground mb-2">Area Dimensions</h4>
              <p className="text-muted-foreground">
                Enter the length and width of the rectangular area you plan to tile. The calculator assumes a rectangular space and calculates the total square footage.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Tile Dimensions</h4>
              <p className="text-muted-foreground">
                The length and width of a single tile. Make sure to use the correct units - inches for feet measurements, centimeters for meters measurements.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Wastage Percentage</h4>
              <p className="text-muted-foreground">
                Extra tiles to account for cuts, breakage, and mistakes. 10% is standard for simple layouts, but complex patterns may require 15-20% wastage.
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
    <meta itemProp="name" content="The Definitive Guide to Tile and Flooring Calculator: Area, Material, and Waste Estimation" />
    <meta itemProp="description" content="An expert guide detailing how to calculate the total number of tiles or flooring boxes required for a project, covering area measurement, accounting for complex room shapes, standard waste factors, and material unit conversion." />
    <meta itemProp="keywords" content="tile calculator formula, how much flooring do I need, calculating square footage for tile, flooring waste factor, area calculation complex rooms, estimating flooring materials" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-tile-flooring-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Tile & Flooring: Calculating Area, Units, and Waste</h1>
    <p className="text-lg italic text-gray-700">Master the essential formulas and industry standards for accurately estimating materials for any flooring project, minimizing cost and ensuring project completion.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#area-measurement" className="hover:underline">Measuring and Calculating Total Surface Area</a></li>
        <li><a href="#unit-conversion" className="hover:underline">Converting Total Area to Required Units (Tiles/Boxes)</a></li>
        <li><a href="#waste-factor" className="hover:underline">The Critical Role of the Waste Factor</a></li>
        <li><a href="#complex-shapes" className="hover:underline">Handling Complex Room Shapes and Patterns</a></li>
        <li><a href="#material-type" className="hover:underline">Material Type and Sub-Floor Considerations</a></li>
    </ul>
<hr />

    {/* MEASURING AND CALCULATING TOTAL SURFACE AREA */}
    <h2 id="area-measurement" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Measuring and Calculating Total Surface Area</h2>
    <p>The foundation of any material estimate is determining the net area of the floor. This is measured in square units (e.g., square feet or square meters).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Simple Rectangular Area</h3>
    <p>For a standard square or rectangular room, the area calculation is straightforward:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Area = Length * Width'}
        </p>
    </div>
    <p>All measurements should be taken from the longest points of the walls and rounded up to the next highest unit (e.g., rounding $10.5$ feet up to $11$ feet for a conservative estimate).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Deductible Area</h3>
    <p>The calculated area should account for any fixed elements that will not be covered by flooring or tile, such as built-in cabinetry, fireplaces, large vents, or structural columns. These areas are calculated and subtracted from the total area to find the net coverage requirement.</p>

<hr />

    {/* CONVERTING TOTAL AREA TO REQUIRED UNITS (TILES/BOXES) */}
    <h2 id="unit-conversion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Converting Total Area to Required Units (Tiles/Boxes)</h2>
    <p>Once the Net Coverage Area is determined, the next step is converting that area into the specific number of tiles or boxes of flooring material needed.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">For Individual Tiles</h3>
    <p>For tiles, the required quantity is found by dividing the Net Coverage Area by the area of a single tile. The size of the tile must include the grout line (though most calculations simplify this by using the nominal tile size and adjusting the waste factor):</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Tiles = Net Area / Area of One Tile'}
        </p>
    </div>
    <p>Since materials must be purchased in whole units (full tiles), the final count is always rounded up to the nearest whole number.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">For Boxed Materials (Laminate, Vinyl, Wood)</h3>
    <p>Flooring materials like laminate, engineered wood, or vinyl are packaged in boxes, where the <strong className="font-semibold">Box Coverage Rate</strong> (area per box) is supplied by the manufacturer. The number of boxes needed is calculated as:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Boxes = Net Area / Box Coverage Rate'}
        </p>
    </div>
    <p>Like tiles, the final result must be rounded up to the nearest whole box.</p>

<hr />

    {/* THE CRITICAL ROLE OF THE WASTE FACTOR */}
    <h2 id="waste-factor" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of the Waste Factor</h2>
    <p>The <strong className="font-semibold">Waste Factor</strong> (or contingency factor) is an essential percentage added to the net area calculation to account for cuts, breakages, installation errors, and attic stock (extra material needed for future repairs). Purchasing exactly the net required area is almost guaranteed to result in a material shortage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Standard Waste Percentages</h3>
    <p>The appropriate waste factor varies based on the geometry of the room, the material being used, and the pattern:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Simple Rectangular Room (Parallel Lay):</strong> 5% to 7% waste factor.</li>
        <li><strong className="font-semibold">Complex Rooms (Angles, Curves):</strong> 10% to 15% waste factor.</li>
        <li><strong className="font-semibold">Diagonal/Herringbone Patterns:</strong> 15% to 20% waste factor (due to excessive corner cuts).</li>
        <li><strong className="font-semibold">Fragile Materials (Large Tiles, Stone):</strong> An additional 2% contingency is often added for potential breakage.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Waste Factor Formula Application</h3>
    <p>The calculated net area is multiplied by the appropriate waste factor (e.g., $1.10$ for $10\%$ waste) before dividing by the unit area or box coverage rate. This ensures the correct, larger quantity is purchased upfront.</p>

<hr />

    {/* HANDLING COMPLEX ROOM SHAPES AND PATTERNS */}
    <h2 id="complex-shapes" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Handling Complex Room Shapes and Patterns</h2>
    <p>For irregularly shaped rooms (e.g., L-shaped, octagonal, or rooms with significant bump-outs), the overall area calculation must break the complex geometry down into simple, manageable rectangles.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Segmentation Method</h3>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Divide the Area:</strong> Break the irregular room into multiple standard squares or rectangles (e.g., splitting an L-shape into two rectangles).</li>
        <li><strong className="font-semibold">Calculate Individual Areas:</strong> Calculate the area of each segment separately.</li>
        <li><strong className="font-semibold">Sum Totals:</strong> Add the area of all segments together to find the total gross area.</li>
    </ol>
    <p>This segmentation method ensures no floor space is missed and is especially critical when dealing with angled walls, which dramatically increase cutting waste.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Pattern Impact on Material Needs</h3>
    <p>Laying materials on a **diagonal** or in intricate patterns like **herringbone** or **basketweave** requires far more cutting and fitting along the room's perimeter than a parallel lay. This results in the final, usable material quantity being substantially lower, directly necessitating a higher waste factor (up to $20\%$ for complex patterns).</p>

<hr />

    {/* MATERIAL TYPE AND SUB-FLOOR CONSIDERATIONS */}
    <h2 id="material-type" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Material Type and Sub-Floor Considerations</h2>
    <p>The type of material being installed influences the estimation not only through its packaged size but also through the need for supplemental materials.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Tile (Ceramic, Porcelain, Stone)</h3>
    <p>Tiled floors require accurate estimation of two supplemental materials that are purchased by volume or weight:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Mortar (Thin-set):</strong> Used to adhere the tile to the sub-floor. Quantity depends on the size of the trowel notch (dictated by tile size) and the floor levelness.</li>
        <li><strong className="font-semibold">Grout:</strong> Used to fill the spaces between tiles. Quantity depends heavily on the **grout joint width** and the tile size. Smaller tiles with wider joints require substantially more grout.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Floating Floors (Laminate/LVP)</h3>
    <p>Flooring that "floats" (is not glued or nailed down, such as luxury vinyl plank or laminate) primarily requires an <strong className="font-semibold">underlayment</strong>. The underlayment is purchased separately, often in rolls, and must match the total square footage of the room, plus a small overlap contingency (typically 5%).</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Accurate flooring and tile estimation is a multi-step process that converts measured area into purchase units. The calculation must rigorously account for the base area, subtract non-covered fixtures, and, most importantly, incorporate a realistic **waste factor** adjusted for both pattern complexity and room geometry.</p>
    <p>By moving beyond simple square footage and systematically calculating the **net required units** plus a generous contingency, installers can ensure material availability, avoid costly delays, and significantly minimize overall project waste.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about tile installation and material calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How much wastage should I plan for?</h4>
              <p className="text-muted-foreground">
                Standard wastage is 10% for simple layouts. Complex patterns like herringbone or diagonal layouts may require 15-20%. Rooms with many corners, obstacles, or irregular shapes need higher wastage percentages.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I buy all tiles from the same batch?</h4>
              <p className="text-muted-foreground">
                Yes, absolutely. Tiles are produced in batches (lots) and colors, sizes, and even textures can vary slightly between batches. Always purchase all tiles, including extras, from the same batch number.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I prepare my subfloor for tiling?</h4>
              <p className="text-muted-foreground">
                The subfloor must be clean, level, dry, and rigid. Remove old flooring, repair cracks, and ensure no flexing. For wood subfloors, use cement backer board. For concrete, ensure it's smooth and level.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between ceramic and porcelain tiles?</h4>
              <p className="text-muted-foreground">
                Porcelain tiles are denser, more durable, and less porous than ceramic tiles. They're better for high-traffic areas and outdoor use. Ceramic tiles are more affordable and easier to cut, making them popular for walls and light-traffic floors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How wide should grout lines be?</h4>
              <p className="text-muted-foreground">
                Grout line width depends on tile size and type. Small tiles (4" or less) typically use 1/16" to 1/8" lines. Medium tiles (6-12") use 1/8" to 1/4" lines. Large tiles may use 1/4" to 3/8" lines. Check manufacturer recommendations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I tile over existing tiles?</h4>
              <p className="text-muted-foreground">
                Yes, but only if the existing tiles are firmly attached, level, and clean. You'll need to rough up the surface with sandpaper and use a high-quality adhesive. Consider the added height and weight implications.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long does tile adhesive take to dry?</h4>
              <p className="text-muted-foreground">
                Most tile adhesives require 24-48 hours to fully cure before grouting. Thin-set mortar typically sets in 2-4 hours but needs 24 hours for full strength. Always follow manufacturer instructions for your specific product.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What tools do I need for tile installation?</h4>
              <p className="text-muted-foreground">
                Essential tools include a tile cutter or wet saw, notched trowel, tile spacers, level, measuring tape, and grout float. For large projects, consider renting professional tools like a tile saw and tile leveling system.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate tiles for irregular-shaped rooms?</h4>
              <p className="text-muted-foreground">
                For irregular rooms, break the area into smaller rectangles, calculate each section separately, then add them together. Increase wastage percentage to 15-20% for complex shapes with many cuts and angles.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I seal my tiles after installation?</h4>
              <p className="text-muted-foreground">
                Natural stone tiles always need sealing. Porcelain tiles rarely need sealing. Ceramic tiles may benefit from sealing in wet areas. Grout should be sealed to prevent staining and make cleaning easier.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}