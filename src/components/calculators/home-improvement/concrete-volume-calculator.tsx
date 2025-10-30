'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Ruler, Calculator, Info, AlertCircle, TrendingUp, Users, Home, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  length: z.number().min(0.1).optional(),
  width: z.number().min(0.1).optional(),
  thickness: z.number().min(0.1).optional(),
  unit: z.enum(['feet', 'meters']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ConcreteVolumeCalculator() {
  const [result, setResult] = useState<{ 
    volume: number; 
    interpretation: string; 
    opinion: string;
    projectSize: string;
    complexityLevel: string;
    recommendations: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      length: undefined,
      width: undefined,
      thickness: undefined,
      unit: undefined 
    } 
  });

  const calculate = (v: FormValues) => {
    if (v.length == null || v.width == null || v.thickness == null || v.unit == null) return null;
    
    let volume;
    if (v.unit === 'feet') {
      volume = (v.length * v.width * (v.thickness / 12)) / 27; // cubic yards
    } else {
      volume = v.length * v.width * (v.thickness / 100); // cubic meters
    }
    
    return Math.round(volume * 100) / 100; // Round to 2 decimal places
  };

  const interpret = (volume: number, unit: string) => {
    const unitText = unit === 'feet' ? 'cubic yards' : 'cubic meters';
    if (volume > 10) return `Large concrete project requiring ${volume} ${unitText}.`;
    if (volume >= 2) return `Medium concrete project requiring ${volume} ${unitText}.`;
    return `Small concrete project requiring ${volume} ${unitText}.`;
  };

  const getProjectSize = (volume: number) => {
    if (volume > 10) return 'Large Project';
    if (volume >= 2) return 'Medium Project';
    return 'Small Project';
  };

  const getComplexityLevel = (thickness: number) => {
    if (thickness > 8) return 'High Complexity';
    if (thickness >= 4) return 'Medium Complexity';
    return 'Low Complexity';
  };

  const getRecommendations = (volume: number, thickness: number, unit: string) => {
    const recommendations = [];
    
    recommendations.push(`Order ${volume * 1.1} ${unit === 'feet' ? 'cubic yards' : 'cubic meters'} for safety margin`);
    recommendations.push('Ensure proper subgrade preparation and compaction');
    recommendations.push('Use appropriate concrete mix for your application');
    recommendations.push('Plan for proper curing and protection');
    
    if (thickness > 6) {
      recommendations.push('Consider reinforcement for thick slabs');
      recommendations.push('Use proper formwork for deep pours');
    }
    
    if (volume > 5) {
      recommendations.push('Consider professional concrete delivery');
      recommendations.push('Plan for proper finishing equipment');
    }
    
    return recommendations;
  };

  const getConsiderations = (volume: number, thickness: number) => {
    const considerations = [];
    
    considerations.push('Weather conditions affect concrete placement');
    considerations.push('Proper reinforcement may be required');
    considerations.push('Curing time depends on concrete mix and conditions');
    considerations.push('Local building codes may specify requirements');
    
    if (thickness > 8) {
      considerations.push('Thick concrete requires careful temperature control');
    }
    
    return considerations;
  };

  const opinion = (volume: number, thickness: number) => {
    if (volume > 10 || thickness > 8) return `This is a substantial concrete project that requires professional planning and execution.`;
    if (volume >= 2) return `This is a manageable project with proper preparation and concrete experience.`;
    return `Perfect size for a DIY concrete project with proper preparation and attention to detail.`;
  };

  const onSubmit = (values: FormValues) => {
    const volume = calculate(values);
    if (volume == null) { setResult(null); return; }
    setResult({ 
      volume, 
      interpretation: interpret(volume, values.unit || 'feet'), 
      opinion: opinion(volume, values.thickness || 0),
      projectSize: getProjectSize(volume),
      complexityLevel: getComplexityLevel(values.thickness || 0),
      recommendations: getRecommendations(volume, values.thickness || 0, values.unit || 'feet'),
      considerations: getConsiderations(volume, values.thickness || 0)
    });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Concrete Dimensions & Specifications
          </CardTitle>
          <CardDescription>
            Enter your concrete dimensions to calculate volume and material requirements
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
                          <option value="feet">Feet / Inches</option>
                          <option value="meters">Meters / CM</option>
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
                        Length ({unit})
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
                  name="width" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Width ({unit})
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
                  name="thickness" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Thickness ({unit === 'feet' ? 'in' : 'cm'})
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
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Concrete Volume
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
                <Layers className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Concrete Requirements</CardTitle>
                  <CardDescription>Detailed concrete calculation and project analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Volume Needed</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.volume} {unit === 'feet' ? 'cubic yards' : 'cubic meters'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.projectSize}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Complexity Level</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.complexityLevel === 'High Complexity' ? 'destructive' : result.complexityLevel === 'Medium Complexity' ? 'secondary' : 'default'}>
                      {result.complexityLevel}
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
                    {result.volume > 10 ? 'Large Project' : 
                     result.volume >= 2 ? 'Medium Project' : 'Small Project'}
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
                        <Layers className="h-5 w-5" />
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
              <h4 className="font-semibold text-foreground mb-2">Concrete Dimensions</h4>
              <p className="text-muted-foreground">
                Enter the length, width, and thickness of your concrete slab or structure. Ensure consistent units - if using feet/inches, length and width should be in feet, thickness in inches.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Measurement Units</h4>
              <p className="text-muted-foreground">
                Choose between feet/inches or meters/centimeters. The calculator automatically handles unit conversions and provides volume in standard cubic yards or cubic meters.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Volume Calculation</h4>
              <p className="text-muted-foreground">
                The calculator multiplies length × width × thickness, converting thickness to consistent units, then provides the final volume in standard construction units.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Material Planning</h4>
              <p className="text-muted-foreground">
                The volume calculation helps determine concrete mix requirements, delivery needs, and project planning for proper concrete placement and finishing.
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
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/HowTo">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Concrete Volume Calculation: Formulas, Yards, and Material Estimation" />
    <meta itemProp="description" content="An expert guide detailing how to calculate the required volume of concrete (in cubic yards or meters) for slabs, footings, and columns, covering basic geometry, material waste factors, and dimensional conversion." />
    <meta itemProp="keywords" content="concrete volume calculator formula, how much concrete do I need, calculating cubic yards, concrete slab volume, footing volume calculation, concrete waste factor, dimensional conversion" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-concrete-volume-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Concrete Volume: Calculating Cubic Yards for Any Project</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental geometry and conversion factors required to accurately estimate concrete volume and ensure a successful pour.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#basics" className="hover:underline">Volume Basics and the Cubic Yard Standard</a></li>
        <li><a href="#slab" className="hover:underline">Calculating Volume for Rectangular Slabs and Floors</a></li>
        <li><a href="#footing" className="hover:underline">Calculating Volume for Cylindrical Footings</a></li>
        <li><a href="#conversion" className="hover:underline">Dimensional Conversion Mechanics (Feet to Yards)</a></li>
        <li><a href="#waste" className="hover:underline">The Critical Role of the Waste Factor</a></li>
    </ul>
<hr />

    {/* VOLUME BASICS AND THE CUBIC YARD STANDARD */}
    <h2 id="basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Volume Basics and the Cubic Yard Standard</h2>
    <p>Concrete volume estimation is a fundamental task in construction, determined by simple geometry (Length $\times$ Width $\times$ Depth). The result is crucial because concrete is sold and poured by the yard, specifically the **Cubic Yard**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Cubic Yard Definition</h3>
    <p>A <strong className="font-semibold">Cubic Yard</strong> is a unit of volume equal to a cube measuring three feet on each side (3 ft x 3 ft x 3 ft). It is the universally accepted standard unit for ordering ready-mix concrete.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'1 Cubic Yard = 27 Cubic Feet'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Importance of Consistency</h3>
    <p>All measurements for the calculation must be converted into a single, consistent unit before the final volume calculation. If the standard is the cubic yard, all linear measurements (Length, Width, Depth) must ultimately be converted into yards before multiplication, or the final cubic feet result must be divided by 27.</p>

<hr />

    {/* CALCULATING VOLUME FOR RECTANGULAR SLABS AND FLOORS */}
    <h2 id="slab" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Volume for Rectangular Slabs and Floors</h2>
    <p>Slabs, walkways, patios, and foundations are typically rectangular structures. The volume calculation is a straightforward multiplication of the three dimensions.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Rectangular Volume Formula</h3>
    <p>The gross volume (before accounting for waste or complexity) is calculated by:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Volume = Length * Width * Depth'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Handling Thickness (Depth)</h3>
    <p>The depth (or thickness) of a concrete slab is typically measured in inches (e.g., 4 inches or 6 inches). This dimension must be converted to feet before calculating the total volume in cubic feet.</p>
    <div className="overflow-x-auto my-4 p-2 bg-gray-50 border rounded-lg inline-block">
        <p className="font-mono text-lg text-red-700 font-bold">
            {'Depth in Feet = Depth in Inches / 12'}
        </p>
    </div>
    <p>For example, a 6-inch depth converts to $6 / 12 = 0.5$ feet.</p>

<hr />

    {/* CALCULATING VOLUME FOR CYLINDRICAL FOOTINGS */}
    <h2 id="footing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Volume for Cylindrical Footings</h2>
    <p>Footings and cylindrical columns require a different geometric formula, as they are circular in cross-section. This is critical for deck, porch, and column foundations.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Cylindrical Volume Formula</h3>
    <p>The volume of a cylinder is calculated by multiplying the area of the circular base by the height (depth) of the footing. This formula requires the use of the radius ($r$) or diameter:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Volume = π * Radius^2 * Height'}
        </p>
    </div>
    <p>The total concrete required for all footings is the volume of a single footing multiplied by the total number of footings.</p>

<hr />

    {/* DIMENSIONAL CONVERSION MECHANICS (FEET TO YARDS) */}
    <h2 id="conversion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dimensional Conversion Mechanics (Feet to Yards)</h2>
    <p>The final calculated volume in cubic feet must be converted to the ordering standard (cubic yards). This conversion must be performed accurately to prevent significant under- or over-ordering of the material.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Final Conversion Equation</h3>
    <p>Since there are 27 cubic feet in one cubic yard, the conversion involves a simple division:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Volume in Cubic Yards = Volume in Cubic Feet / 27'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Rounding Rule</h3>
    <p>Concrete is purchased in partial yard increments (e.g., $0.5$ or $0.25$ yards). However, due to the high cost of re-ordering short amounts, the final order quantity is almost always rounded up significantly (i.e., incorporating the waste factor and then rounding up to the nearest half-yard increment for the total volume).</p>

<hr />

    {/* THE CRITICAL ROLE OF THE WASTE FACTOR */}
    <h2 id="waste" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of the Waste Factor</h2>
    <p>Concrete is a non-returnable product, and a small shortage can halt an entire project. Therefore, adding a **Waste Factor** (or contingency) to the calculated volume is standard industry practice.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sources of Concrete Waste</h3>
    <p>Waste is necessary to compensate for several real-world factors:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Uneven Excavation:</strong> The prepared subgrade (base) is rarely perfectly level, leading to varying depths and increased volume needs.</li>
        <li><strong className="font-semibold">Formwork Distortion:</strong> Wood or metal forms may bulge slightly under the weight of the wet concrete, increasing the volume requirement.</li>
        <li><strong className="font-semibold">Subgrade Absorption:</strong> Dry, porous soil or sand will absorb water from the mix, effectively reducing the liquid volume poured into the form.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Standard Waste Percentages</h3>
    <p>The standard waste factor added to the net calculated volume is typically **5% to 10%**.</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">5% Waste:</strong> Used for simple, well-prepared rectangular slabs.</li>
        <li><strong className="font-semibold">10% Waste:</strong> Used for irregular shapes, footings, or when the subgrade is rough, unstable, or poorly prepared.</li>
    </ul>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Accurate concrete volume calculation is a foundational skill in construction, demanding meticulous geometric measurement and careful dimensional conversion from inches and feet to the standard cubic yard unit.</p>
    <p>Mastery requires not only applying the correct formulas for slabs and cylinders but also responsibly incorporating a **waste factor** (typically 5% to 10%). This margin of safety guarantees a sufficient supply of the non-returnable material, ensuring the pour is completed successfully without costly delays or last-minute shortages.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about concrete volume calculation and project planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How much extra concrete should I order?</h4>
              <p className="text-muted-foreground">
                Add 5-10% extra concrete to account for spillage, over-excavation, and variations in thickness. For complex shapes or irregular areas, consider 15% extra to ensure you have enough material.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between cubic yards and cubic meters?</h4>
              <p className="text-muted-foreground">
                Cubic yards are used in the US (1 cubic yard = 27 cubic feet), while cubic meters are used internationally (1 cubic meter = 1,000 liters). The calculator handles both units automatically based on your selection.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate concrete for irregular shapes?</h4>
              <p className="text-muted-foreground">
                For irregular shapes, break the area into smaller rectangles, calculate each section separately, then add them together. For circular areas, use π × radius² × thickness. Always add extra for complex shapes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What concrete mix should I use?</h4>
              <p className="text-muted-foreground">
                Mix selection depends on application: 3000 PSI for driveways, 3500 PSI for foundations, 4000+ PSI for heavy-duty applications. Consider air entrainment for freeze-thaw climates and proper slump for workability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I prepare for concrete placement?</h4>
              <p className="text-muted-foreground">
                Ensure proper subgrade preparation, install forms, add reinforcement if needed, check weather conditions, and have finishing tools ready. Proper preparation is crucial for concrete quality and longevity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What tools do I need for concrete work?</h4>
              <p className="text-muted-foreground">
                Essential tools include concrete mixer, wheelbarrow, screed board, float, trowel, edger, and jointing tool. For larger projects, consider concrete pump, power trowel, and proper safety equipment.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long does concrete take to cure?</h4>
              <p className="text-muted-foreground">
                Concrete reaches 70% strength in 7 days and full strength in 28 days. However, it continues to gain strength for years. Avoid heavy loads for 7 days and protect from freezing for 28 days.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I pour concrete in cold weather?</h4>
              <p className="text-muted-foreground">
                Concrete can be poured in cold weather with proper precautions: use heated concrete, protect from freezing, add accelerators, and maintain temperature above 50°F for 48 hours after placement.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I prevent concrete cracks?</h4>
              <p className="text-muted-foreground">
                Prevent cracks by proper subgrade preparation, using reinforcement, controlling joints, proper curing, avoiding rapid drying, and using appropriate concrete mix for your climate and application.
              </p>
            </div>

              <div>
              <h4 className="font-semibold text-foreground mb-2">What's the cost of concrete per cubic yard?</h4>
              <p className="text-muted-foreground">
                Concrete costs vary by region and mix type: basic concrete $100-150/cubic yard, high-strength $150-200/cubic yard, decorative $200-300/cubic yard. Delivery and placement costs are additional.
              </p>
            </div>
          </CardContent>
        </Card>
              </div>
    </div>
  );
}