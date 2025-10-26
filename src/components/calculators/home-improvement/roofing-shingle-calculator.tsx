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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <House className="h-5 w-5" />
              Complete Guide to Roofing Installation
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