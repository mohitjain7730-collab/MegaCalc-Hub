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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Square className="h-5 w-5" />
              Complete Guide to Drywall Installation
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