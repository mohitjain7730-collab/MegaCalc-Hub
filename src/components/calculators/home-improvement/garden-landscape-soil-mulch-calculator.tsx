'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sprout, Ruler, Info, AlertCircle, TrendingUp, Users, Home, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  length: z.number().min(0.1).optional(),
  width: z.number().min(0.1).optional(),
  depth: z.number().min(0.1).optional(),
  unit: z.enum(['feet', 'meters']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GardenLandscapeSoilMulchCalculator() {
  const [result, setResult] = useState<{ 
    volume: number; 
    bags: number; 
    unit: string; 
    interpretation: string; 
    opinion: string;
    projectSize: string;
    materialLevel: string;
    recommendations: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      length: undefined,
      width: undefined,
      depth: undefined,
      unit: undefined 
    } 
  });

  const calculate = (v: FormValues) => {
    if (v.length == null || v.width == null || v.depth == null || v.unit == null) return null;
    
    let volume, bags, volumeUnit;
    if (v.unit === 'feet') {
      volume = v.length * v.width * (v.depth / 12); // cubic feet
      // standard bag is 2 cubic feet
      bags = Math.ceil(volume / 2);
      volumeUnit = 'cubic feet';
    } else {
      volume = v.length * v.width * (v.depth / 100); // cubic meters
      // standard bag is 50 liters (0.05 cubic meters)
      bags = Math.ceil(volume / 0.05);
      volumeUnit = 'cubic meters';
    }
    
    return { volume, bags, unit: volumeUnit };
  };

  const interpret = (volume: number, bags: number, unit: string) => {
    if (volume > 50) return `Large garden project requiring ${volume.toFixed(2)} ${unit} (${bags} bags) of material.`;
    if (volume >= 10) return `Medium garden project requiring ${volume.toFixed(2)} ${unit} (${bags} bags) of material.`;
    return `Small garden project requiring ${volume.toFixed(2)} ${unit} (${bags} bags) of material.`;
  };

  const getProjectSize = (volume: number) => {
    if (volume > 50) return 'Large Project';
    if (volume >= 10) return 'Medium Project';
    return 'Small Project';
  };

  const getMaterialLevel = (depth: number, unit: string) => {
    const depthInches = unit === 'feet' ? depth : depth / 2.54;
    if (depthInches > 6) return 'Deep Application';
    if (depthInches >= 3) return 'Standard Application';
    return 'Light Application';
  };

  const getRecommendations = (volume: number, bags: number, depth: number, unit: string) => {
    const recommendations = [];
    
    recommendations.push(`Order ${bags} bags for your ${volume.toFixed(2)} ${unit === 'feet' ? 'cubic feet' : 'cubic meters'} project`);
    recommendations.push('Consider bulk delivery for large quantities');
    recommendations.push('Prepare the area by removing weeds and debris');
    recommendations.push('Apply material evenly across the entire area');
    
    const depthInches = unit === 'feet' ? depth : depth / 2.54;
    if (depthInches > 6) {
      recommendations.push('Consider layering for deep applications');
      recommendations.push('Allow for settling over time');
    }
    
    if (volume > 20) {
      recommendations.push('Rent equipment for large projects');
      recommendations.push('Plan for multiple delivery trips if needed');
    }
    
    return recommendations;
  };

  const getConsiderations = (volume: number, depth: number, unit: string) => {
    const considerations = [];
    
    considerations.push('Material settles over time, especially organic matter');
    considerations.push('Weather conditions affect application timing');
    considerations.push('Soil type affects material choice and application');
    considerations.push('Proper preparation ensures better results');
    
    const depthInches = unit === 'feet' ? depth : depth / 2.54;
    if (depthInches > 6) {
      considerations.push('Deep applications may require soil amendment');
    }
    
    if (volume > 20) {
      considerations.push('Large projects may require permits or equipment');
    }
    
    return considerations;
  };

  const opinion = (volume: number, depth: number, unit: string) => {
    const depthInches = unit === 'feet' ? depth : depth / 2.54;
    if (volume > 50 || depthInches > 8) return `This is a substantial landscaping project that requires proper planning, equipment, and possibly professional assistance.`;
    if (volume >= 10) return `This is a manageable landscaping project that can be completed with proper preparation and planning.`;
    return `This is a perfect DIY landscaping project that can be completed in a weekend with basic tools.`;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (calculation == null) { setResult(null); return; }
    setResult({ 
      volume: calculation.volume, 
      bags: calculation.bags, 
      unit: calculation.unit, 
      interpretation: interpret(calculation.volume, calculation.bags, values.unit || 'feet'), 
      opinion: opinion(calculation.volume, values.depth || 0, values.unit || 'feet'),
      projectSize: getProjectSize(calculation.volume),
      materialLevel: getMaterialLevel(values.depth || 0, values.unit || 'feet'),
      recommendations: getRecommendations(calculation.volume, calculation.bags, values.depth || 0, values.unit || 'feet'),
      considerations: getConsiderations(calculation.volume, values.depth || 0, values.unit || 'feet')
    });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5" />
            Garden Bed Dimensions & Material Specifications
          </CardTitle>
          <CardDescription>
            Enter your garden bed dimensions to calculate soil or mulch requirements
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
                        Bed Length ({unit})
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
                        Bed Width ({unit})
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
                  name="depth" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Desired Depth ({unit === 'feet' ? 'in' : 'cm'})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 3" 
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
                Calculate Material Requirements
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
                <Sprout className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Material Requirements</CardTitle>
                  <CardDescription>Detailed material calculation and project analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Sprout className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Volume Needed</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.volume.toFixed(2)} {result.unit}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.projectSize}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Bags Required</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.bags} bags
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.materialLevel}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">Project Assessment</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {result.volume > 50 ? 'Large Project' : 
                     result.volume >= 10 ? 'Medium Project' : 'Small Project'}
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
                        <Sprout className="h-5 w-5" />
                        Application Recommendations
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
              <h4 className="font-semibold text-foreground mb-2">Garden Bed Dimensions</h4>
              <p className="text-muted-foreground">
                Enter the length and width of your garden bed or landscape area. This calculates the total square footage needed for material coverage.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Desired Depth</h4>
              <p className="text-muted-foreground">
                The thickness of the material layer you want to apply. For mulch, 2-3 inches is common. For new garden beds, 6-12 inches might be needed.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Measurement Units</h4>
              <p className="text-muted-foreground">
                Choose between feet/inches or meters/centimeters. The calculator automatically handles unit conversions and provides results in standard measurements.
              </p>
            </div>
              <div>
              <h4 className="font-semibold text-foreground mb-2">Material Types</h4>
              <p className="text-muted-foreground">
                This calculator works for various materials including soil, mulch, compost, gravel, and other landscaping materials. Bag sizes may vary by material type.
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
              Explore other home improvement calculators to plan your landscaping and garden project
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
                  <a href="/category/home-improvement/decking-materials-calculator" className="text-primary hover:underline">
                    Decking Materials Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate decking boards, joists, and fasteners needed for your deck project.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/roofing-shingle-calculator" className="text-primary hover:underline">
                    Roofing Shingle Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate roofing shingles and materials needed for your roof project.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/HowTo">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Soil and Mulch Volume Calculation: Cubic Yards, Coverage Area, and Material Needs" />
    <meta itemProp="description" content="An expert guide detailing the calculation of soil and mulch volume in cubic yards or meters for garden beds and landscapes, covering area measurement, required depth, and necessary waste/compaction factors for bulk material ordering." />
    <meta itemProp="keywords" content="soil volume calculator formula, how much mulch do I need, calculating cubic yards for garden, mulch depth standards, topsoil volume estimation, landscape material calculation" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-soil-mulch-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Soil & Mulch: Calculating Volume and Coverage for Landscaping</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental volume calculations required to accurately estimate bulk landscaping materials, minimizing waste and ensuring proper depth.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#volume-basics" className="hover:underline">Volume Calculation Basics and the Cubic Yard Unit</a></li>
        <li><a href="#soil" className="hover:underline">Topsoil Calculation: Determining Required Depth</a></li>
        <li><a href="#mulch" className="hover:underline">Mulch Calculation: Coverage and Depth Standards</a></li>
        <li><a href="#conversion" className="hover:underline">Dimensional Conversion Mechanics (Feet to Yards)</a></li>
        <li><a href="#compaction" className="hover:underline">The Critical Role of Compaction and Waste Factors</a></li>
    </ul>
<hr />

    {/* VOLUME CALCULATION BASICS AND THE CUBIC YARD UNIT */}
    <h2 id="volume-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Volume Calculation Basics and the Cubic Yard Unit</h2>
    <p>Bulk landscaping materials (topsoil, mulch, gravel) are quantified and purchased by volume. Accurate estimation is essential because these materials are heavy and non-returnable.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Fundamental Volume Formula</h3>
    <p>Volume is universally calculated using the product of three linear dimensions: Length (L), Width (W), and Depth (D).</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Volume = Length * Width * Depth'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Cubic Yard Standard</h3>
    <p>In North America, bulk materials are sold by the <strong className="font-semibold">Cubic Yard</strong>, which is the equivalent of 27 cubic feet. All linear measurements must be converted to feet before the final volume calculation is made, and the resulting cubic feet must then be divided by 27 to find the ordering quantity.</p>

<hr />

    {/* TOPSOIL CALCULATION: DETERMINING REQUIRED DEPTH */}
    <h2 id="soil" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Topsoil Calculation: Determining Required Depth</h2>
    <p>Topsoil calculation is performed when creating a new planting bed or filling a raised garden box. The required depth (D) is the most variable factor, dictated by the intended use of the bed.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Recommended Soil Depths by Application</h3>
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 my-4">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum Required Depth (Inches)</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Lawn/Grass Seeding</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">4 to 6 inches</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Annual Flower Beds</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">8 to 12 inches</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Vegetable Gardens / Raised Beds</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">10 to 18 inches</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Shrubs / Perennials</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">18 to 24 inches</td>
            </tr>
        </tbody>
    </table>

<hr />

    {/* MULCH CALCULATION: COVERAGE AND DEPTH STANDARDS */}
    <h2 id="mulch" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Mulch Calculation: Coverage and Depth Standards</h2>
    <p>Mulch (wood chips, straw, pine needles) is used to suppress weeds, retain soil moisture, and regulate temperature. Its depth must be balanced to achieve these benefits without smothering plant roots.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Optimal Mulch Depth</h3>
    <p>The generally accepted standard depth for organic mulches is **3 inches**.</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Too Thin (1-2 inches):</strong> Ineffective at suppressing weed growth and moisture retention.</li>
        <li><strong className="font-semibold">Too Thick (4+ inches):</strong> Can suffocate plant roots, attract pests, and lead to root collar rot (where the base of the plant stem stays too wet).</li>
    </ul>

<hr />

    {/* DIMENSIONAL CONVERSION MECHANICS (FEET TO YARDS) */}
    <h2 id="conversion" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Dimensional Conversion Mechanics (Feet to Yards)</h2>
    <p>Since landscape measurements are typically taken in feet and inches, but bulk material is sold in cubic yards, accurate dimensional conversion is the most critical step in the calculation process.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 1: Converting Area to Cubic Feet</h3>
    <p>All dimensions must be in feet. The depth (D), usually measured in inches, must first be converted to a fraction of a foot (D/12):</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Volume in CF = Length (ft) * Width (ft) * (Depth in inches / 12)'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Step 2: Converting Cubic Feet to Cubic Yards</h3>
    <p>The final cubic feet value is divided by 27 to obtain the commercial ordering quantity:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Volume in CY = Volume in CF / 27'}
        </p>
    </div>
    <p>Since vendors often require a minimum order, the final quantity is usually rounded up to the nearest half or quarter yard.</p>

<hr />

    {/* THE CRITICAL ROLE OF COMPACTION AND WASTE FACTORS */}
    <h2 id="compaction" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of Compaction and Waste Factors</h2>
    <p>Bulk materials require additional quantity to account for inevitable material loss and changes in density during transport and installation.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Compaction Factor (Soil)</h3>
    <p>When loose topsoil is ordered and installed, it will naturally settle and compress over time, reducing its volume by 10% to 20%. The **Compaction Factor** is a contingency added to the initial order to ensure the final settled depth meets the requirement. A common practice is to order $10\%$ to $15\%$ more soil than the calculated theoretical volume.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Waste and Expansion (Mulch)</h3>
    <p>Mulch, particularly shredded wood, is sold loosely packed. However, it can often be overspread, lost to wind, or absorbed into the existing soil structure. While soil requires a compaction factor, mulch often requires a small contingency (5%) for waste and to ensure sufficient coverage for edges and irregular areas.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Calculating the required volume of soil and mulch is a precise geometric exercise rooted in the Volume = Length $\times$ Width $\times$ Depth formula. Mastery requires rigorous dimensional conversion to the standard **Cubic Yard** unit.</p>
    <p>For topsoil, accuracy hinges on determining the correct minimum planting depth and incorporating a **compaction factor** to compensate for settling. For mulch, the focus is on maintaining the standard 3-inch depth for optimal weed suppression and moisture retention.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about garden material calculation and landscaping
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How much mulch do I need for my garden?</h4>
              <p className="text-muted-foreground">
                Mulch needs depend on bed size and desired depth. For most gardens, 2-3 inches of mulch is sufficient. Use this calculator to determine exact quantities needed.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between soil and mulch?</h4>
              <p className="text-muted-foreground">
                Soil is the growing medium for plants, while mulch is applied on top to retain moisture, suppress weeds, and improve appearance. Both have different application depths and purposes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How deep should I apply mulch?</h4>
              <p className="text-muted-foreground">
                Mulch depth depends on material type: wood chips 2-4 inches, straw 3-6 inches, compost 1-2 inches. Avoid piling mulch against plant stems to prevent rot.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I buy bags or bulk material?</h4>
              <p className="text-muted-foreground">
                For small projects (under 10 cubic feet), bags are convenient. For larger projects, bulk delivery is more cost-effective. Consider storage space and delivery access.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I prepare the area before applying material?</h4>
              <p className="text-muted-foreground">
                Remove weeds, debris, and rocks. Level the area if needed. For soil, consider adding compost or amendments. For mulch, ensure good drainage and weed barrier if desired.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">When is the best time to apply mulch?</h4>
              <p className="text-muted-foreground">
                Apply mulch in spring after soil warms up, or in fall to protect plants over winter. Avoid applying too early in spring as it can slow soil warming.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I replace mulch?</h4>
              <p className="text-muted-foreground">
                Organic mulch decomposes over time and should be replenished annually. Inorganic mulch lasts longer but may need occasional refreshing for appearance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What types of mulch are best for different plants?</h4>
              <p className="text-muted-foreground">
                Wood chips work well for trees and shrubs, straw for vegetable gardens, compost for flower beds, and gravel for xeriscaping. Choose based on your plants' needs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate material for irregular-shaped beds?</h4>
              <p className="text-muted-foreground">
                Break irregular shapes into rectangles, calculate each section separately, then add them together. For circular areas, use π × radius² × depth.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the cost difference between bagged and bulk materials?</h4>
              <p className="text-muted-foreground">
                Bulk materials are typically 30-50% cheaper per cubic foot than bagged materials. However, consider delivery fees, storage space, and convenience when choosing.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}