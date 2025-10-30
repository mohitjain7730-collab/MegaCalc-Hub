'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Ruler, Calculator, Info, AlertCircle, TrendingUp, Users, Home, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const climates = {
  hot: 30,
  moderate: 25,
  cool: 20,
};

const formSchema = z.object({
  area: z.number().min(0.1).optional(),
  climate: z.number().min(1).optional(),
  unit: z.enum(['feet', 'meters']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function HvacSizingCalculator() {
  const [result, setResult] = useState<{ 
    btu: number; 
    tons: number; 
    interpretation: string; 
    opinion: string;
    systemSize: string;
    efficiencyLevel: string;
    recommendations: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area: undefined,
      climate: undefined, 
      unit: undefined 
    } 
  });

  const calculate = (v: FormValues) => {
    if (v.area == null || v.climate == null || v.unit == null) return null;

    let area = v.area;
    if (v.unit === 'meters') {
        area *= 10.7639; // to sq ft
    }

    const btuNeeded = area * v.climate;
    const tonsNeeded = btuNeeded / 12000;

    return { btu: btuNeeded, tons: tonsNeeded };
  };

  const interpret = (btu: number, tons: number) => {
    if (tons > 4) return `Large HVAC system requiring ${btu.toFixed(0)} BTU/hr (${tons.toFixed(2)} tons).`;
    if (tons >= 2) return `Medium HVAC system requiring ${btu.toFixed(0)} BTU/hr (${tons.toFixed(2)} tons).`;
    return `Small HVAC system requiring ${btu.toFixed(0)} BTU/hr (${tons.toFixed(2)} tons).`;
  };

  const getSystemSize = (tons: number) => {
    if (tons > 4) return 'Large System';
    if (tons >= 2) return 'Medium System';
    return 'Small System';
  };

  const getEfficiencyLevel = (climate: number) => {
    if (climate >= 30) return 'High Demand';
    if (climate >= 25) return 'Moderate Demand';
    return 'Low Demand';
  };

  const getRecommendations = (btu: number, tons: number, climate: number) => {
    const recommendations = [];
    
    recommendations.push(`Install ${btu.toFixed(0)} BTU/hr system for optimal performance`);
    recommendations.push('Consider energy-efficient models with high SEER ratings');
    recommendations.push('Plan for proper ductwork sizing and installation');
    recommendations.push('Ensure adequate electrical service for the system');
    
    if (climate >= 30) {
      recommendations.push('Consider heat pump systems for hot climates');
      recommendations.push('Plan for proper ventilation and air circulation');
    }
    
    if (tons > 3) {
      recommendations.push('Consider zoning systems for large homes');
      recommendations.push('Plan for professional installation and maintenance');
    }
    
    return recommendations;
  };

  const getConsiderations = (climate: number, tons: number) => {
    const considerations = [];
    
    considerations.push('Proper sizing prevents short-cycling and energy waste');
    considerations.push('Climate affects heating and cooling requirements');
    considerations.push('Insulation quality impacts system efficiency');
    considerations.push('Window efficiency affects HVAC load calculations');
    
    if (climate >= 30) {
      considerations.push('Hot climates require higher cooling capacity');
    }
    
    if (tons > 4) {
      considerations.push('Large systems require professional installation');
    }
    
    return considerations;
  };

  const opinion = (tons: number, climate: number) => {
    if (tons > 4 || climate >= 30) return `This HVAC system requires professional sizing and installation for optimal performance and efficiency.`;
    if (tons >= 2) return `This is a standard residential HVAC system that can be professionally installed with proper planning.`;
    return `This is a smaller HVAC system suitable for efficient heating and cooling with proper installation.`;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (calculation == null) { setResult(null); return; }
    const resultData = { 
      btu: calculation.btu, 
      tons: calculation.tons, 
      interpretation: interpret(calculation.btu, calculation.tons), 
      opinion: opinion(calculation.tons, values.climate || 0),
      systemSize: getSystemSize(calculation.tons),
      efficiencyLevel: getEfficiencyLevel(values.climate || 0),
      recommendations: getRecommendations(calculation.btu, calculation.tons, values.climate || 0),
      considerations: getConsiderations(values.climate || 0, calculation.tons)
    };
    setResult(resultData);
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            HVAC System Specifications
          </CardTitle>
          <CardDescription>
            Enter your space dimensions and climate to calculate optimal HVAC system size
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
                  name="climate" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        Climate Zone
                      </FormLabel>
                <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        >
                          <option value="">Select climate</option>
                          {Object.entries(climates).map(([key, value]) => (
                            <option key={key} value={value}>
                              {key.charAt(0).toUpperCase() + key.slice(1)} ({value} BTU/sq ft)
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
                  name="area" 
                  render={({ field }) => (
              <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Conditioned Area ({unit === 'feet' ? 'sq ft' : 'sq m'})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 1500" 
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
                Calculate HVAC Requirements
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
                <Thermometer className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your HVAC Requirements</CardTitle>
                  <CardDescription>Detailed HVAC sizing calculation and system analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Thermometer className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">BTU Requirement</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.btu.toFixed(0)} BTU/hr
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.systemSize}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Cooling Capacity</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.tons.toFixed(2)} tons
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.efficiencyLevel}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Home className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-muted-foreground">System Assessment</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {result.tons > 4 ? 'Large System' : 
                     result.tons >= 2 ? 'Medium System' : 'Small System'}
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
                        <Thermometer className="h-5 w-5" />
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
              <h4 className="font-semibold text-foreground mb-2">Conditioned Area</h4>
              <p className="text-muted-foreground">
                The total square footage of living space you want to heat and cool. Include all rooms that will be connected to the HVAC system.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Climate Zone</h4>
              <p className="text-muted-foreground">
                Your local climate affects HVAC requirements. Hot climates need more cooling capacity, while cool climates need less. This impacts the BTU calculation per square foot.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Measurement Units</h4>
              <p className="text-muted-foreground">
                Choose between square feet or square meters. The calculator automatically handles unit conversions and provides results in standard HVAC measurements.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">System Sizing</h4>
              <p className="text-muted-foreground">
                Proper HVAC sizing is crucial for efficiency and comfort. Oversized systems short-cycle and waste energy, while undersized systems struggle to maintain temperature.
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
              Explore other home improvement calculators to plan your HVAC and renovation project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/lighting-layout-calculator" className="text-primary hover:underline">
                    Lighting Layout Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate optimal lighting fixtures and placement for your room dimensions.
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
                  <a href="/category/home-improvement/insulation-r-value-calculator" className="text-primary hover:underline">
                    Insulation R-Value Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate insulation thickness needed for optimal energy efficiency.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/home-improvement/water-usage-plumbing-flow-calculator" className="text-primary hover:underline">
                    Water Usage Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate water flow requirements and plumbing system sizing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Complete Guide to HVAC System Sizing
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
              Common questions about HVAC system sizing and installation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Manual J calculation?</h4>
              <p className="text-muted-foreground">
                Manual J is the industry standard for HVAC sizing that considers factors like insulation, windows, doors, ceiling height, and local climate. It's more accurate than basic square footage calculations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between BTU and tons?</h4>
              <p className="text-muted-foreground">
                BTU (British Thermal Unit) measures heat energy, while tons measure cooling capacity. One ton equals 12,000 BTU/hr. Residential systems typically range from 1.5 to 5 tons.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why is proper HVAC sizing important?</h4>
              <p className="text-muted-foreground">
                Proper sizing ensures energy efficiency, comfort, and system longevity. Oversized systems short-cycle and waste energy, while undersized systems struggle to maintain temperature and increase wear.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does climate affect HVAC sizing?</h4>
              <p className="text-muted-foreground">
                Hot climates require more cooling capacity (higher BTU/sq ft), while cool climates need less. Humidity levels also affect sizing requirements and system selection.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What factors affect HVAC load calculations?</h4>
              <p className="text-muted-foreground">
                Key factors include square footage, insulation quality, window efficiency, ceiling height, number of occupants, appliances, and local climate conditions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I choose a larger or smaller HVAC system?</h4>
              <p className="text-muted-foreground">
                Choose the correctly sized system based on calculations. Larger isn't better - oversized systems are inefficient and uncomfortable. Professional sizing ensures optimal performance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between SEER and EER ratings?</h4>
              <p className="text-muted-foreground">
                SEER (Seasonal Energy Efficiency Ratio) measures cooling efficiency over a season, while EER (Energy Efficiency Ratio) measures efficiency at peak conditions. Higher ratings mean better efficiency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I replace my HVAC system?</h4>
              <p className="text-muted-foreground">
                HVAC systems typically last 15-20 years with proper maintenance. Consider replacement if your system is inefficient, requires frequent repairs, or can't maintain comfort levels.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the cost of HVAC installation?</h4>
              <p className="text-muted-foreground">
                HVAC installation costs vary by system size, type, and complexity. Basic systems start around $3,000-5,000, while high-efficiency systems can cost $8,000-15,000 or more.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How can I improve HVAC efficiency?</h4>
              <p className="text-muted-foreground">
                Improve efficiency through proper sizing, regular maintenance, quality insulation, efficient windows, programmable thermostats, and regular filter changes. Consider energy-efficient models when replacing.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}