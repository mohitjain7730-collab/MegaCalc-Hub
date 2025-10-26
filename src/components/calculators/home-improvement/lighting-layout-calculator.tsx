'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Ruler, Calculator, Info, AlertCircle, TrendingUp, Users, Home, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const roomTypes = {
  livingRoom: 20,
  kitchen: 40,
  bedroom: 15,
  bathroom: 75,
  office: 50,
};

const formSchema = z.object({
  roomLength: z.number().min(0.1).optional(),
  roomWidth: z.number().min(0.1).optional(),
  lumensPerFixture: z.number().min(1).optional(),
  roomType: z.number().min(1).optional(),
  unit: z.enum(['feet', 'meters']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function LightingLayoutCalculator() {
  const [result, setResult] = useState<{ 
    fixturesNeeded: number; 
    interpretation: string; 
    opinion: string;
    lightingLevel: string;
    efficiencyLevel: string;
    recommendations: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomLength: undefined,
      roomWidth: undefined,
      lumensPerFixture: undefined, 
      roomType: undefined, 
      unit: undefined 
    } 
  });

  const calculate = (v: FormValues) => {
    if (v.roomLength == null || v.roomWidth == null || v.lumensPerFixture == null || v.roomType == null || v.unit == null) return null;

    let area = v.roomLength * v.roomWidth;
    if (v.unit === 'meters') {
        area *= 10.7639; // convert to sq ft
    }

    const totalLumensNeeded = area * v.roomType;
    const fixturesNeeded = Math.ceil(totalLumensNeeded / v.lumensPerFixture);
    
    return fixturesNeeded;
  };

  const interpret = (fixturesNeeded: number, roomType: number) => {
    const roomTypeName = Object.keys(roomTypes).find(key => roomTypes[key as keyof typeof roomTypes] === roomType) || 'room';
    if (fixturesNeeded > 8) return `High lighting requirement for ${roomTypeName} with ${fixturesNeeded} fixtures needed.`;
    if (fixturesNeeded >= 4) return `Moderate lighting requirement for ${roomTypeName} with ${fixturesNeeded} fixtures needed.`;
    return `Standard lighting requirement for ${roomTypeName} with ${fixturesNeeded} fixtures needed.`;
  };

  const getLightingLevel = (roomType: number) => {
    if (roomType >= 50) return 'High Brightness';
    if (roomType >= 30) return 'Medium Brightness';
    return 'Low Brightness';
  };

  const getEfficiencyLevel = (lumensPerFixture: number) => {
    if (lumensPerFixture >= 1000) return 'High Efficiency';
    if (lumensPerFixture >= 600) return 'Standard Efficiency';
    return 'Low Efficiency';
  };

  const getRecommendations = (fixturesNeeded: number, roomType: number, lumensPerFixture: number) => {
    const recommendations = [];
    
    recommendations.push(`Install ${fixturesNeeded} fixtures for optimal lighting coverage`);
    recommendations.push('Consider layered lighting: ambient, task, and accent lighting');
    recommendations.push('Use dimmers for flexibility and energy savings');
    recommendations.push('Plan for even distribution across the room');
    
    if (roomType >= 50) {
      recommendations.push('Add task lighting for work areas');
      recommendations.push('Consider LED fixtures for energy efficiency');
    }
    
    if (fixturesNeeded > 6) {
      recommendations.push('Use multiple circuits for better control');
      recommendations.push('Consider smart lighting controls');
    }
    
    return recommendations;
  };

  const getConsiderations = (roomType: number, lumensPerFixture: number) => {
    const considerations = [];
    
    considerations.push('Lighting affects mood and productivity');
    considerations.push('Consider natural light availability');
    considerations.push('Energy efficiency impacts long-term costs');
    considerations.push('Proper lighting placement prevents shadows');
    
    if (roomType >= 50) {
      considerations.push('High-brightness rooms need proper ventilation');
    }
    
    if (lumensPerFixture < 600) {
      considerations.push('Lower lumen fixtures may require more fixtures');
    }
    
    return considerations;
  };

  const opinion = (fixturesNeeded: number, roomType: number) => {
    if (fixturesNeeded > 8 || roomType >= 50) return `This room requires professional lighting design for optimal functionality and comfort.`;
    if (fixturesNeeded >= 4) return `This is a manageable lighting project with proper planning and fixture selection.`;
    return `Perfect for DIY lighting installation with standard fixtures and basic electrical knowledge.`;
  };

  const onSubmit = (values: FormValues) => {
    const fixturesNeeded = calculate(values);
    if (fixturesNeeded == null) { setResult(null); return; }
    setResult({ 
      fixturesNeeded, 
      interpretation: interpret(fixturesNeeded, values.roomType || 0), 
      opinion: opinion(fixturesNeeded, values.roomType || 0),
      lightingLevel: getLightingLevel(values.roomType || 0),
      efficiencyLevel: getEfficiencyLevel(values.lumensPerFixture || 0),
      recommendations: getRecommendations(fixturesNeeded, values.roomType || 0, values.lumensPerFixture || 0),
      considerations: getConsiderations(values.roomType || 0, values.lumensPerFixture || 0)
    });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Room Dimensions & Lighting Specifications
          </CardTitle>
          <CardDescription>
            Enter your room dimensions and lighting requirements to calculate optimal fixture placement
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
                  name="roomType" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Room Type
                      </FormLabel>
                <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        >
                          <option value="">Select room type</option>
                          {Object.entries(roomTypes).map(([key, value]) => (
                            <option key={key} value={value}>
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ({value} fc)
                            </option>
                          ))}
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
                  name="lumensPerFixture" 
                  render={({ field }) => (
              <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Lumens per Fixture/Bulb
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          placeholder="e.g., 800" 
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
                Calculate Lighting Requirements
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
                <Lightbulb className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Lighting Requirements</CardTitle>
                  <CardDescription>Detailed lighting calculation and fixture analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Fixtures Needed</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.fixturesNeeded} fixtures
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.lightingLevel}
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
                    {result.fixturesNeeded > 8 ? 'Complex Project' : 
                     result.fixturesNeeded >= 4 ? 'Standard Project' : 'Simple Project'}
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
                        <Lightbulb className="h-5 w-5" />
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
                Enter the length and width of your room. This calculates the total square footage needed for lighting calculations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Room Type</h4>
              <p className="text-muted-foreground">
                Different rooms require different brightness levels. Kitchens and offices need more light (higher foot-candles) than living rooms or bedrooms.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Lumens per Fixture</h4>
              <p className="text-muted-foreground">
                The brightness output of a single light fixture or bulb, measured in lumens. Check the packaging of your chosen fixture for its lumen rating.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Measurement Units</h4>
              <p className="text-muted-foreground">
                Choose between feet or meters. The calculator automatically handles unit conversions and provides results in standard lighting measurements.
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
              Explore other home improvement calculators to plan your lighting and renovation project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/hvac-sizing-calculator" className="text-primary hover:underline">
                    HVAC Sizing Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the right HVAC system size for your room dimensions and requirements.
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
                  <a href="/category/home-improvement/concrete-volume-calculator" className="text-primary hover:underline">
                    Concrete Volume Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate concrete volume needed for foundations, slabs, and construction projects.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Complete Guide to Lighting Layout Design
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
              Common questions about lighting layout design and fixture planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What are foot-candles and why do they matter?</h4>
              <p className="text-muted-foreground">
                Foot-candles measure light intensity (lumens per square foot). Different activities require different levels: reading needs 50+ fc, general living 20-30 fc, and hallways 10-20 fc for safety and comfort.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I choose the right lumens for my fixtures?</h4>
              <p className="text-muted-foreground">
                Consider your room's function: kitchens and offices need 800-1000+ lumens per fixture, living rooms 600-800 lumens, bedrooms 400-600 lumens. LED fixtures are more efficient than incandescent bulbs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between ambient, task, and accent lighting?</h4>
              <p className="text-muted-foreground">
                Ambient lighting provides overall illumination, task lighting focuses on work areas, and accent lighting highlights features. Layering all three creates the most effective and comfortable lighting design.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How should I distribute fixtures across the room?</h4>
              <p className="text-muted-foreground">
                Space fixtures evenly to avoid dark spots and shadows. For general lighting, place fixtures 8-10 feet apart. Consider the room's shape and furniture layout when positioning fixtures.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I use dimmers for my lighting?</h4>
              <p className="text-muted-foreground">
                Dimmers provide flexibility for different activities and times of day. They also save energy and extend bulb life. Use compatible dimmers for LED fixtures to avoid flickering or reduced lifespan.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the best height for ceiling fixtures?</h4>
              <p className="text-muted-foreground">
                Standard ceiling height is 8-9 feet. Hang fixtures 7-8 feet from the floor for general lighting. For task lighting, position fixtures 30-36 inches above work surfaces for optimal illumination.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate lighting for irregular-shaped rooms?</h4>
              <p className="text-muted-foreground">
                Break irregular rooms into rectangular sections, calculate lighting for each section, then combine the results. Consider the room's primary function and adjust fixture placement accordingly.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between LED and traditional lighting?</h4>
              <p className="text-muted-foreground">
                LED fixtures are more energy-efficient, last longer, and produce less heat than incandescent bulbs. They're available in various color temperatures and can be dimmed with compatible controls.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I prevent glare in my lighting design?</h4>
              <p className="text-muted-foreground">
                Use fixtures with proper shielding, avoid placing lights directly in line of sight, use matte finishes on surfaces, and consider indirect lighting techniques to reduce harsh glare.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the cost difference between LED and traditional lighting?</h4>
              <p className="text-muted-foreground">
                LED fixtures cost more initially but save 80-90% on energy bills and last 10-25 times longer than incandescent bulbs. The long-term savings typically offset the higher upfront cost within 2-3 years.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}