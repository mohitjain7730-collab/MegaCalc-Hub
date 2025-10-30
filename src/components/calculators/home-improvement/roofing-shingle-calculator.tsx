'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Ruler, Calculator, Info, AlertCircle, TrendingUp, Users, Building, House } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  area: z.number().min(0.1).optional(),
  pitch: z.number().min(1).max(12).optional(),
  unit: z.enum(['feet', 'meters']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function RoofingShingleCalculator() {
  const [result, setResult] = useState<{ 
    bundlesNeeded: number; 
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
      area: undefined,
      pitch: undefined, 
      unit: undefined 
    }
  });

  const calculate = (v: FormValues) => {
    if (v.area == null || v.pitch == null || v.unit == null) return null;

    let area = v.area;
    if (v.unit === 'meters') {
        area *= 10.7639; // convert sq meters to sq feet
    }

    const pitchMultipliers: { [key: number]: number } = {
        1: 1.02, 2: 1.04, 3: 1.06, 4: 1.08, 5: 1.12, 6: 1.16, 7: 1.2, 8: 1.25, 9: 1.3, 10: 1.36, 11: 1.42, 12: 1.48
    };

    const actualRoofArea = area * (pitchMultipliers[v.pitch] || 1);
    const squares = actualRoofArea / 100;
    const bundles = Math.ceil(squares * 3);
    const finalBundles = Math.ceil(bundles * 1.1); // 10% wastage
    
    return finalBundles;
  };

  const interpret = (bundlesNeeded: number, pitch: number) => {
    if (bundlesNeeded > 50) return `Large roofing project requiring ${bundlesNeeded} bundles with ${pitch}/12 pitch.`;
    if (bundlesNeeded >= 20) return `Medium roofing project requiring ${bundlesNeeded} bundles with ${pitch}/12 pitch.`;
    return `Small roofing project requiring ${bundlesNeeded} bundles with ${pitch}/12 pitch.`;
  };

  const getProjectSize = (bundlesNeeded: number) => {
    if (bundlesNeeded > 50) return 'Large Project';
    if (bundlesNeeded >= 20) return 'Medium Project';
    return 'Small Project';
  };

  const getComplexityLevel = (pitch: number) => {
    if (pitch >= 8) return 'High Complexity';
    if (pitch >= 5) return 'Medium Complexity';
    return 'Low Complexity';
  };

  const getRecommendations = (bundlesNeeded: number, pitch: number, unit: string) => {
    const recommendations = [];
    
    recommendations.push(`Purchase ${bundlesNeeded} bundles with 10-15% extra for safety`);
    recommendations.push('Use appropriate underlayment for weather protection');
    recommendations.push('Ensure proper ventilation and flashing installation');
    recommendations.push('Follow local building codes and permit requirements');
    
    if (pitch >= 8) {
      recommendations.push('Consider professional installation for steep roofs');
      recommendations.push('Use proper safety equipment and fall protection');
    }
    
    if (bundlesNeeded > 40) {
      recommendations.push('Consider professional installation for large projects');
    }
    
    return recommendations;
  };

  const getConsiderations = (bundlesNeeded: number, pitch: number) => {
    const considerations = [];
    
    considerations.push('Roof pitch affects material requirements and installation difficulty');
    considerations.push('Weather conditions impact installation timing');
    considerations.push('Proper ventilation is crucial for roof longevity');
    considerations.push('Local building codes may specify requirements');
    
    if (pitch >= 6) {
      considerations.push('Steep roofs require special safety measures and equipment');
    }
    
    return considerations;
  };

  const opinion = (bundlesNeeded: number, pitch: number) => {
    if (bundlesNeeded > 50 || pitch >= 8) return `This is a substantial roofing project that requires professional installation and careful safety planning.`;
    if (bundlesNeeded >= 20) return `This is a manageable project with proper preparation, safety measures, and roofing experience.`;
    return `Perfect size for a DIY project with proper safety precautions and basic roofing skills.`;
  };

  const onSubmit = (values: FormValues) => {
    const bundlesNeeded = calculate(values);
    if (bundlesNeeded == null) { setResult(null); return; }
    setResult({ 
      bundlesNeeded, 
      interpretation: interpret(bundlesNeeded, values.pitch || 4), 
      opinion: opinion(bundlesNeeded, values.pitch || 4),
      projectSize: getProjectSize(bundlesNeeded),
      complexityLevel: getComplexityLevel(values.pitch || 4),
      recommendations: getRecommendations(bundlesNeeded, values.pitch || 4, values.unit || 'feet'),
      considerations: getConsiderations(bundlesNeeded, values.pitch || 4)
    });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <House className="h-5 w-5" />
            Roof Dimensions & Specifications
          </CardTitle>
          <CardDescription>
            Enter your roof dimensions and pitch to calculate shingle requirements
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
                          <option value="feet">Square Feet</option>
                          <option value="meters">Square Meters</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
                  )} 
                />
                <FormField 
                  control={form.control} 
                  name="area" 
                  render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Roof Footprint Area ({unit === 'feet' ? 'sq ft' : 'sq m'})
                    </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 2000" 
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
                  name="pitch" 
                  render={({ field }) => (
              <FormItem>
                     <FormLabel className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Roof Pitch (e.g., 4 in 4/12)
                    </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="12" 
                          step="1" 
                          placeholder="e.g., 4" 
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
                Calculate Shingle Requirements
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
                <House className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Roofing Requirements</CardTitle>
                  <CardDescription>Detailed roofing calculation and project analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <House className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Bundles Needed</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.bundlesNeeded} bundles
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
                    {result.bundlesNeeded > 50 ? 'Large Project' : 
                     result.bundlesNeeded >= 20 ? 'Medium Project' : 'Small Project'}
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
                        <House className="h-5 w-5" />
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
              <h4 className="font-semibold text-foreground mb-2">Roof Footprint Area</h4>
              <p className="text-muted-foreground">
                The flat area your roof covers (length × width of the house footprint). The calculator adjusts this for the roof's slope to determine actual surface area.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Roof Pitch</h4>
              <p className="text-muted-foreground">
                The slope of your roof expressed as a ratio (e.g., 4/12 means the roof rises 4 inches for every 12 inches of horizontal run). Steeper roofs require more materials.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Shingle Coverage</h4>
              <p className="text-muted-foreground">
                Standard shingle bundles cover approximately 33.3 square feet. The calculator accounts for pitch multipliers and includes 10% wastage for cuts and starter strips.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Measurement Units</h4>
              <p className="text-muted-foreground">
                Choose between square feet or square meters. The calculator automatically handles unit conversions and applies appropriate coverage rates.
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
                  <a href="/category/home-improvement/decking-materials-calculator" className="text-primary hover:underline">
                    Decking Materials Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the exact amount of decking materials needed for your outdoor project.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/insulation-r-value-calculator" className="text-primary hover:underline">
                    Insulation R-Value Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate insulation requirements for optimal energy efficiency in your home.
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
                  <a href="/category/home-improvement/hvac-sizing-calculator" className="text-primary hover:underline">
                    HVAC Sizing Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the proper HVAC system size for your home based on insulation and climate.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/HowTo">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Roofing Shingle Calculation, Squares, and Waste Estimation" />
    <meta itemProp="description" content="An expert guide detailing how to calculate the required number of roofing shingle squares based on roof area, pitch/slope factor, pattern matching, and accounting for specialized materials like hip, ridge, and starter shingles." />
    <meta itemProp="keywords" content="roofing shingle calculator formula, how many shingle squares do I need, calculating roof area, roof pitch factor, shingle waste percentage, hip and ridge shingle count, roofing estimation" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-roofing-shingle-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Roofing Shingle Calculation: Squares, Pitch, and Waste</h1>
    <p className="text-lg italic text-gray-700">Master the specialized geometry and unit conversion required to accurately estimate all materials needed for a full roof installation.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#area-basics" className="hover:underline">Roof Area Measurement and Pitch Factor</a></li>
        <li><a href="#squares" className="hover:underline">The Roofing Square Unit and Material Conversion</a></li>
        <li><a href="#waste" className="hover:underline">The Critical Role of the Waste Factor and Roof Complexity</a></li>
        <li><a href="#specialty" className="hover:underline">Calculating Specialty Shingles (Hip, Ridge, Starter)</a></li>
        <li><a href="#supplemental" className="hover:underline">Supplemental Material Estimation (Underlayment and Fasteners)</a></li>
    </ul>
<hr />

    {/* ROOF AREA MEASUREMENT AND PITCH FACTOR */}
    <h2 id="area-basics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Roof Area Measurement and Pitch Factor</h2>
    <p>Shingles are purchased based on the true surface area of the roof. For sloped roofs, this area is always greater than the area of the foundation footprint, necessitating a correction factor based on the roof's **pitch** or **slope**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Plan Area (Footprint)</h3>
    <p>The calculation starts with the footprint (the rectangular area the roof covers) and the overhangs. The total footprint area is determined by the length and width of the building's perimeter.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Pitch Multiplier</h3>
    <p>The <strong className="font-semibold">Roof Pitch</strong> (or slope) is the vertical rise for every 12 inches of horizontal run (e.g., 6/12 pitch). To find the actual roof surface area, the plan area must be multiplied by a correction factor derived from the pitch. This factor accounts for the true diagonal length of the roof surface.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Surface Area = Plan Area * Square Root [ 1 + (Rise/12)^2 ]'}
        </p>
    </div>
    <p>This formula ensures that the roofing estimate reflects the actual, increased surface area that shingles must cover.</p>

<hr />

    {/* THE ROOFING SQUARE UNIT AND MATERIAL CONVERSION */}
    <h2 id="squares" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Roofing Square Unit and Material Conversion</h2>
    <p>In roofing, materials are purchased and estimated using a unit called the **Square**, which simplifies large-area calculations and is critical for accurate ordering.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Definition of a Roofing Square</h3>
    <p>A **Square** is defined as $100$ square feet ($9.29$ square meters) of roof area. This is the standard unit used by manufacturers to package and sell bundles of shingles. Most dimensional (architectural) shingles are sold in bundles of three per square.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Converting Area to Squares</h3>
    <p>The total number of squares required is found by dividing the calculated true roof surface area by 100, and always rounding the final purchase quantity up to the nearest whole bundle:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Squares = Surface Area / 100'}
        </p>
    </div>

<hr />

    {/* THE CRITICAL ROLE OF THE WASTE FACTOR AND ROOF COMPLEXITY */}
    <h2 id="waste" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of the Waste Factor and Roof Complexity</h2>
    <p>Like any construction material, a **Waste Factor** must be applied to the base shingle count to account for non-square cuts, trimming, and damage. This factor is highly dependent on the complexity of the roof design.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Standard Waste Guidelines by Roof Type</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Simple Gable Roof (Two planes):</strong> 5% to 7% waste factor. Minimal cutting is required.</li>
        <li><strong className="font-semibold">Hip Roof (Four planes meeting at hips/ridges):</strong> 10% to 12% waste factor. This accounts for increased cuts and trimming along the hip and rake edges.</li>
        <li><strong className="font-semibold">Complex Roof (Dormers, Valleys, Skylights):</strong> 15% to 20% waste factor. Valleys, in particular, generate significant waste due to the necessary diagonal cutting and overlapping.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Applying the Waste Factor</h3>
    <p>The calculated Total Squares must be multiplied by the appropriate waste factor (e.g., $1.10$ for $10\%$) before being converted into the final number of bundles to be purchased.</p>

<hr />

    {/* CALCULATING SPECIALTY SHINGLES (HIP, RIDGE, STARTER) */}
    <h2 id="specialty" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Specialty Shingles (Hip, Ridge, Starter)</h2>
    <p>A standard shingle calculation only covers the field (the flat parts) of the roof. Specialized components are required for the perimeter and structural lines, and must be calculated separately based on linear footage.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Hip and Ridge Cap Shingles</h3>
    <p>These are individual, pre-bent or cut shingles used to cover the peak of the roof (ridge) and the sloped intersections of planes (hips). They must be calculated based on the total linear feet of all hips and ridges on the roof.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Starter Strip Shingles</h3>
    <p>A continuous row of shingle material is required along the eaves (bottom edge) and rakes (sloped side edges) of the roof before the first main shingle course is laid. This material is essential for weather-proofing the edge and ensuring the first layer is properly sealed. The quantity is determined by the total perimeter linear footage of the eave and rake edges.</p>

<hr />

    {/* SUPPLEMENTAL MATERIAL ESTIMATION (UNDERLAYMENT AND FASTENERS) */}
    <h2 id="supplemental" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Supplemental Material Estimation (Underlayment and Fasteners)</h2>
    <p>A complete roofing job requires careful estimation of non-shingle materials, especially those related to moisture protection and attachment.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Underlayment and Felt Paper</h3>
    <p>Underlayment (typically felt paper or synthetic material) is installed directly onto the roof decking before the shingles. It acts as a secondary moisture barrier. This is calculated based on the total roof surface area, measured in **rolls** (e.g., a standard roll of felt paper covers 400 square feet). A $10\%$ overlap contingency is usually added.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Fasteners (Roofing Nails)</h3>
    <p>Nails are estimated based on a code requirement of 4 to 6 nails per shingle. The total nail requirement is derived by multiplying the total number of individual shingles by the required nails per shingle. This quantity is purchased by weight (pounds or kilograms).</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Roofing shingle estimation is a critical process that converts the building’s footprint into the **Total Roofing Squares** required, factoring in the geometric complexity of the roof pitch.</p>
    <p>Accuracy demands three key calculations: using the **pitch multiplier** to find the true surface area, applying a **waste factor** based on roof features (hips, valleys, dormers), and ensuring sufficient quantities of specialized **hip and ridge** and **starter** materials are included for weather-proofing the entire system.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about roofing installation and material calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How much extra roofing material should I buy?</h4>
              <p className="text-muted-foreground">
                Add 10-15% extra shingles to account for cuts, waste, starter strips, and ridge caps. For complex roof shapes or steep pitches, consider 20% extra to ensure you have enough material.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between roof pitch and why does it matter?</h4>
              <p className="text-muted-foreground">
                Roof pitch affects material requirements and installation difficulty. Steeper roofs (higher pitch) require more shingles due to increased surface area and are more dangerous to work on, often requiring professional installation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I measure my roof area accurately?</h4>
              <p className="text-muted-foreground">
                Measure the length and width of your house footprint (ground area covered), then multiply them. The calculator adjusts for roof pitch. For complex roofs, break them into sections and calculate each separately.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between shingle types?</h4>
              <p className="text-muted-foreground">
                Asphalt shingles are most common and affordable. Architectural shingles offer better durability and appearance. Metal roofing lasts longer but costs more. Choose based on budget, climate, and aesthetic preferences.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I install roofing myself?</h4>
              <p className="text-muted-foreground">
                Simple, low-pitch roofs can be DIY projects with proper safety equipment. Steep roofs (6/12 pitch or higher) should be left to professionals due to safety risks. Always prioritize safety over cost savings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long does roofing installation take?</h4>
              <p className="text-muted-foreground">
                Installation time varies by roof size and complexity. A simple 2,000 sq ft roof might take 2-3 days for professionals or 1-2 weeks for DIY. Weather conditions and permit requirements can affect timelines.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's included in roofing costs besides shingles?</h4>
              <p className="text-muted-foreground">
                Additional costs include underlayment, flashing, ridge vents, starter strips, ridge caps, nails, and disposal of old roofing. Labor costs typically exceed material costs for professional installation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I choose the right shingle color?</h4>
              <p className="text-muted-foreground">
                Consider your home's exterior colors, neighborhood aesthetics, and climate. Dark colors absorb more heat, while light colors reflect it. Some HOA communities have color restrictions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What maintenance does a new roof need?</h4>
              <p className="text-muted-foreground">
                Regular maintenance includes cleaning gutters, inspecting for damage, checking flashing, and ensuring proper ventilation. Most shingles need minimal maintenance but should be inspected annually.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I know when my roof needs replacement?</h4>
              <p className="text-muted-foreground">
                Signs include missing or damaged shingles, curling or buckling, granule loss, leaks, and age (20+ years for asphalt shingles). A professional inspection can determine if repair or replacement is needed.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}