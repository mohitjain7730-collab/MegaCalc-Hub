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
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/HowTo">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to HVAC Sizing: BTU, Tonnage, and Manual J Load Calculation" />
    <meta itemProp="description" content="An expert guide detailing the fundamentals of HVAC sizing, including how to calculate BTU requirements, the concept of tonnage, the importance of ACCA Manual J, and variables affecting a building's heating and cooling load." />
    <meta itemProp="keywords" content="HVAC sizing formula, calculating required BTUs, cooling load analysis, ACCA Manual J, tonnage conversion HVAC, sensible vs latent heat load, building envelope efficiency" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-hvac-sizing-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to HVAC Sizing: Mastering Load Calculation (Manual J) and Tonnage</h1>
    <p className="text-lg italic text-gray-700">Master the engineering principles that ensure your heating and cooling system is precisely matched to your building’s unique energy demands.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#metrics" className="hover:underline">HVAC Sizing Metrics: BTU and Tonnage</a></li>
        <li><a href="#load-concept" className="hover:underline">The Concept of Heating and Cooling Load</a></li>
        <li><a href="#manual-j" className="hover:underline">ACCA Manual J: The Professional Standard</a></li>
        <li><a href="#heat-gain" className="hover:underline">Key Variables for Heat Gain and Loss</a></li>
        <li><a href="#risks" className="hover:underline">Risks of Improper HVAC Sizing (Oversizing/Undersizing)</a></li>
    </ul>
<hr />

    {/* HVAC SIZING METRICS: BTU AND TONNAGE */}
    <h2 id="metrics" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">HVAC Sizing Metrics: BTU and Tonnage</h2>
    <p>HVAC capacity is measured based on the rate at which heat is moved, quantified primarily by **British Thermal Units (BTUs)** and **Tonnage**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">British Thermal Unit (BTU)</h3>
    <p>A <strong className="font-semibold">BTU</strong> is the most fundamental unit of thermal energy capacity. It is defined as the amount of heat required to raise the temperature of one pound of water by one degree Fahrenheit. HVAC systems are rated by **BTUs per hour (BTU/h)** for both heating and cooling.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Tonnage Conversion</h3>
    <p><strong className="font-semibold">Tonnage</strong> is a common industry metric, particularly for cooling systems. It is a historical measure based on the amount of cooling achieved by melting one ton of ice over a 24-hour period. The conversion is fixed:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'1 Ton = 12,000 BTU/h'}
        </p>
    </div>
    <p>Therefore, a 3-ton air conditioner has a cooling capacity of 36,000 BTU/h. Sizing a system means matching the required BTU/h capacity (the load) to the unit's rated BTU/h output.</p>

<hr />

    {/* THE CONCEPT OF HEATING AND COOLING LOAD */}
    <h2 id="load-concept" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Concept of Heating and Cooling Load</h2>
    <p>The **Load** is the rate at which a building gains heat in the summer (cooling load) or loses heat in the winter (heating load). Accurate HVAC sizing requires calculating this load, not just the square footage of the structure.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Sensible Heat vs. Latent Heat</h3>
    <p>The total cooling load is composed of two types of heat:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Sensible Heat:</strong> The heat that causes a change in temperature (what the thermostat measures). Sources include sunlight, people, appliances, and conductive heat gain through walls.</li>
        <li><strong className="font-semibold">Latent Heat:</strong> The heat required to change the state of water (humidity). This load dictates the system's dehumidification requirement. Latent heat accounts for a significant portion of the total load in humid climates.</li>
    </ul>
    <p>An HVAC system must be sized to handle both the sensible load (temperature reduction) and the latent load (humidity control) simultaneously.</p>

<hr />

    {/* ACCA MANUAL J: THE PROFESSIONAL STANDARD */}
    <h2 id="manual-j" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">ACCA Manual J: The Professional Standard</h2>
    <p>The industry standard for accurate residential and light commercial load calculation is the **ACCA Manual J** (developed by the Air Conditioning Contractors of America). It is a detailed, room-by-room, physics-based methodology that accounts for all heat transfer mechanisms.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Manual J Calculation Process</h3>
    <p>Manual J is far more accurate than simple rules of thumb (e.g., "500 square feet per ton") because it inputs dozens of variables that affect heat transfer:</p>
    <ol className="list-decimal ml-6 space-y-2">
        <li><strong className="font-semibold">Climate Data:</strong> Using local outdoor design temperatures and humidity levels.</li>
        <li><strong className="font-semibold">Building Envelope:</strong> Inputting the U-factor or R-value of all walls, roofs, windows, and foundations.</li>
        <li><strong className="font-semibold">Internal Gains:</strong> Accounting for the heat generated by occupants and fixed appliances (lights, stoves, refrigerators).</li>
        <li><strong className="font-semibold">Air Infiltration:</strong> Modeling heat transfer through uncontrolled air leaks (cracks, vents).</li>
    </ol>
    <p>The calculation produces a precise cooling load and heating load for *each room*, ensuring proper zone-by-zone airflow and temperature balance.</p>

<hr />

    {/* KEY VARIABLES FOR HEAT GAIN AND LOSS */}
    <h2 id="heat-gain" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Key Variables for Heat Gain and Loss</h2>
    <p>Several variables, most often ignored by simple calculators, critically impact the load calculation and system size.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">1. Window Orientation and Shading</h3>
    <p>Windows are the largest source of heat gain. The load varies dramatically based on exposure:</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">West-Facing Windows:</strong> Receive intense afternoon sunlight, leading to the highest heat gain and often dictating peak cooling load.</li>
        <li><strong className="font-semibold">South-Facing Windows:</strong> Easier to shade, but also major contributors.</li>
        <li><strong className="font-semibold">Shading:</strong> External shading (e.g., eaves, trees, awnings) drastically reduces solar heat gain and lowers the overall cooling load required.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">2. Insulation and Air Sealing</h3>
    <p>The R-value of the insulation in the walls, attic, and floor is the primary defense against conductive heat transfer. A high R-value reduces the load. Equally important is **air sealing**, which prevents convective air movement that bypasses insulation entirely.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">3. Ductwork Location</h3>
    <p>If ductwork runs through an unconditioned space (e.g., an uninsulated attic), the system must work harder because the air is heated or cooled before it even reaches the living space. This heat transfer penalty is a significant factor in load calculation.</p>

<hr />

    {/* RISKS OF IMPROPER HVAC SIZING (OVERSIZING/UNDERSIZING) */}
    <h2 id="risks" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Risks of Improper HVAC Sizing (Oversizing/Undersizing)</h2>
    <p>The goal is to match the system capacity precisely to the peak load. Both oversizing and undersizing lead to discomfort, inefficiency, and mechanical issues.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Oversizing (The More Common Problem)</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Poor Dehumidification:</strong> An oversized system cools the air too quickly ("short-cycling"). It shuts off before running long enough to remove the latent heat (moisture), leaving the air cold but clammy.</li>
        <li><strong className="font-semibold">Reduced Efficiency:</strong> Short-cycling uses more energy per unit of cooling and increases mechanical wear.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Undersizing</h3>
    <p>An undersized system runs constantly during peak load periods (e.g., the hottest part of the afternoon) but fails to maintain the desired set point temperature. This leads to high energy bills, excessive mechanical stress, and tenant complaints.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>HVAC sizing is a complex engineering task that requires converting a building's total thermal load into a precise BTU/h capacity. Relying on simple area-based rules is inadequate and leads to poor performance.</p>
    <p>Accurate sizing demands a detailed load analysis (ACCA Manual J) that correctly models factors like **insulation R-value**, **window orientation**, and **air infiltration**. A system that is precisely matched to the load ensures optimal comfort by effectively managing both the sensible heat (temperature) and the latent heat (humidity).</p>
</section>

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