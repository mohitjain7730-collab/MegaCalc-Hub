'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Thermometer, Calculator, Info, AlertCircle, TrendingUp, Users, Home, Building, Snowflake } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const insulationTypes = {
  fiberglassBatt: { name: 'Fiberglass Batt', rValue: 3.2 },
  rockwoolBatt: { name: 'Rockwool Batt', rValue: 3.8 },
  celluloseBlown: { name: 'Cellulose (Blown-in)', rValue: 3.5 },
  sprayFoamOpen: { name: 'Spray Foam (Open Cell)', rValue: 3.6 },
  sprayFoamClosed: { name: 'Spray Foam (Closed Cell)', rValue: 6.5 },
  xpsFoamBoard: { name: 'XPS Foam Board', rValue: 5.0 },
};

const formSchema = z.object({
  insulationType: z.number().min(1).optional(),
  targetRValue: z.number().min(1).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function InsulationRValueCalculator() {
  const [result, setResult] = useState<{ 
    thickness: number; 
    interpretation: string; 
    opinion: string;
    insulationLevel: string;
    efficiencyLevel: string;
    recommendations: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insulationType: undefined, 
      targetRValue: undefined 
    } 
  });

  const calculate = (v: FormValues) => {
    if (v.insulationType == null || v.targetRValue == null) return null;
    const thickness = v.targetRValue / v.insulationType;
    return Math.round(thickness * 100) / 100; // Round to 2 decimal places
  };

  const interpret = (thickness: number, targetRValue: number) => {
    if (thickness > 10) return `High insulation requirement needing ${thickness} inches for R-${targetRValue}.`;
    if (thickness >= 5) return `Moderate insulation requirement needing ${thickness} inches for R-${targetRValue}.`;
    return `Standard insulation requirement needing ${thickness} inches for R-${targetRValue}.`;
  };

  const getInsulationLevel = (targetRValue: number) => {
    if (targetRValue >= 40) return 'High Performance';
    if (targetRValue >= 25) return 'Standard Performance';
    return 'Basic Performance';
  };

  const getEfficiencyLevel = (insulationType: number) => {
    if (insulationType >= 6) return 'High Efficiency';
    if (insulationType >= 4) return 'Medium Efficiency';
    return 'Standard Efficiency';
  };

  const getRecommendations = (thickness: number, insulationType: number, targetRValue: number) => {
    const recommendations = [];
    
    recommendations.push('Ensure proper installation for maximum effectiveness');
    recommendations.push('Seal air leaks before installing insulation');
    recommendations.push('Consider vapor barriers in cold climates');
    recommendations.push('Follow local building codes and regulations');
    
    if (thickness > 8) {
      recommendations.push('Consider multiple layers for thick insulation');
      recommendations.push('Ensure adequate framing depth for thick insulation');
    }
    
    if (insulationType >= 6) {
      recommendations.push('Professional installation recommended for high-efficiency materials');
    }
    
    return recommendations;
  };

  const getConsiderations = (thickness: number, insulationType: number) => {
    const considerations = [];
    
    considerations.push('Proper installation is crucial for performance');
    considerations.push('Air sealing is as important as insulation');
    considerations.push('Moisture control must be considered');
    considerations.push('Building codes vary by location');
    
    if (thickness > 6) {
      considerations.push('Thick insulation may require structural modifications');
    }
    
    if (insulationType >= 5) {
      considerations.push('High-efficiency materials are more expensive');
    }
    
    return considerations;
  };

  const opinion = (thickness: number, targetRValue: number) => {
    if (thickness > 10) return `This is a high-performance insulation project that requires careful planning and may benefit from professional installation.`;
    if (thickness >= 5) return `This is a standard insulation project that can be managed with proper preparation and installation techniques.`;
    return `This is a basic insulation project suitable for DIY installation with proper attention to detail.`;
  };

  const onSubmit = (values: FormValues) => {
    const thickness = calculate(values);
    if (thickness == null) { setResult(null); return; }
    setResult({ 
      thickness, 
      interpretation: interpret(thickness, values.targetRValue || 21), 
      opinion: opinion(thickness, values.targetRValue || 21),
      insulationLevel: getInsulationLevel(values.targetRValue || 21),
      efficiencyLevel: getEfficiencyLevel(values.insulationType || 3.2),
      recommendations: getRecommendations(thickness, values.insulationType || 3.2, values.targetRValue || 21),
      considerations: getConsiderations(thickness, values.insulationType || 3.2)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Insulation Type & Target R-Value
          </CardTitle>
          <CardDescription>
            Select your insulation material and target R-value to calculate required thickness
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="insulationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                        <Snowflake className="h-4 w-4" />
                    Insulation Type
                  </FormLabel>
                <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        >
                          <option value="">Select insulation type</option>
                      {Object.values(insulationTypes).map((type) => (
                            <option key={type.name} value={type.rValue}>
                          {type.name} (R-{type.rValue}/inch)
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
              name="targetRValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                    Target R-Value
                  </FormLabel>
                  <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || undefined)}
                        >
                          <option value="">Select target R-value</option>
                          <option value="13">R-13 (Standard 2x4 Walls)</option>
                          <option value="21">R-21 (Standard 2x6 Walls)</option>
                          <option value="30">R-30 (Attic - Mild Climates)</option>
                          <option value="38">R-38 (Attic - Moderate Climates)</option>
                          <option value="49">R-49 (Attic - Cold Climates)</option>
                  </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Insulation Thickness
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
                  <CardTitle>Your Insulation Requirements</CardTitle>
                  <CardDescription>Detailed insulation calculation and project analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Thermometer className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Required Thickness</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.thickness} inches
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.insulationLevel}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Material Efficiency</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.efficiencyLevel === 'High Efficiency' ? 'default' : result.efficiencyLevel === 'Medium Efficiency' ? 'secondary' : 'destructive'}>
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
                    {result.thickness > 10 ? 'High Performance' : 
                     result.thickness >= 5 ? 'Standard Performance' : 'Basic Performance'}
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
              <h4 className="font-semibold text-foreground mb-2">Insulation Types</h4>
              <p className="text-muted-foreground">
                Different insulation materials have varying R-values per inch. Fiberglass batt is most common and affordable, while spray foam offers the highest R-value but is more expensive.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Target R-Value</h4>
              <p className="text-muted-foreground">
                The total thermal resistance needed depends on your climate zone and building location. Higher R-values provide better insulation but require more material thickness.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">R-Value Calculation</h4>
              <p className="text-muted-foreground">
                R-value is calculated by dividing the target R-value by the material's R-value per inch. This determines the required thickness for optimal thermal performance.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Climate Considerations</h4>
              <p className="text-muted-foreground">
                Colder climates require higher R-values, especially for attics. Warmer climates may use lower R-values but still benefit from proper insulation for energy efficiency.
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
                  <a href="/category/home-improvement/hvac-sizing-calculator" className="text-primary hover:underline">
                    HVAC Sizing Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the proper HVAC system size for your home based on insulation and climate.
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
                  <a href="/category/home-improvement/drywall-plasterboard-calculator" className="text-primary hover:underline">
                    Drywall Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate drywall sheets needed for walls and ceilings in your renovation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <section className="space-y-6 text-muted-foreground leading-relaxed bg-white p-6 md:p-10 rounded-lg shadow-lg" itemScope itemType="https://schema.org/HowTo">
    {/* SEO & SCHEMA METADATA (HIGHLY OPTIMIZED) */}
    <meta itemProp="name" content="The Definitive Guide to Insulation R-Value: Calculation, Standards, and Thermal Resistance" />
    <meta itemProp="description" content="An expert guide detailing the R-value calculation, its relationship to U-factor, standard insulation materials (fiberglass, foam), required R-values by climate zone (ASHRAE), and the physics of heat transfer in building envelopes." />
    <meta itemProp="keywords" content="R-value definition explained, calculating total R-value, thermal resistance formula, U-factor vs R-value, insulation climate zones ASHRAE, required insulation levels, heat transfer building envelope" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-r-value-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Insulation R-Value: Measuring Thermal Resistance and Efficiency</h1>
    <p className="text-lg italic text-gray-700">Master the fundamental metric that quantifies an insulation material’s ability to resist the flow of heat, crucial for energy efficiency.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#definition" className="hover:underline">R-Value: Definition and Heat Transfer Basics</a></li>
        <li><a href="#total-r" className="hover:underline">Calculating Total R-Value for a Building Assembly</a></li>
        <li><a href="#u-factor" className="hover:underline">R-Value and U-Factor: The Inverse Relationship</a></li>
        <li><a href="#climate" className="hover:underline">Climate Zones and Required R-Value Standards</a></li>
        <li><a href="#materials" className="hover:underline">Material Science: R-Values by Insulation Type</a></li>
    </ul>
<hr />

    {/* R-VALUE: DEFINITION AND HEAT TRANSFER BASICS */}
    <h2 id="definition" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">R-Value: Definition and Heat Transfer Basics</h2>
    <p>The <strong className="font-semibold">R-Value</strong> is the primary measure of thermal resistance used in the building industry. It quantifies an insulation material’s capacity to impede the flow of heat (thermal conductivity) through a specific thickness. The "R" stands for resistance. A higher R-value indicates greater insulating effectiveness.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Physics of Heat Transfer</h3>
    <p>Insulation works by mitigating three forms of heat transfer, typically measured in Imperial units (hours $\cdot$ square feet $\cdot$ degrees Fahrenheit per British thermal unit):</p>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Conduction:</strong> Heat transfer through solid materials (e.g., through a wall stud). R-value directly resists this.</li>
        <li><strong className="font-semibold">Convection:</strong> Heat transfer through the movement of fluids (air leaks). R-value does not account for this; **air sealing** is required.</li>
        <li><strong className="font-semibold">Radiation:</strong> Heat transfer through electromagnetic waves (e.g., sun hitting a roof). Resisted by radiant barriers, often used alongside R-value insulation.</li>
    </ul>
    <p>The R-value of a material is directly proportional to its thickness: doubling the thickness of the insulation theoretically doubles the R-value.</p>

<hr />

    {/* CALCULATING TOTAL R-VALUE FOR A BUILDING ASSEMBLY */}
    <h2 id="total-r" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Calculating Total R-Value for a Building Assembly</h2>
    <p>The total R-value of a roof, wall, or floor assembly is the sum of the thermal resistance of every component layer, from the exterior finish to the interior drywall. This is known as the **System R-Value**.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Summation Rule</h3>
    <p>The R-values of materials placed in sequence (layer by layer) are additive. This simple summation rule is used to find the resistance of the entire structure, as long as the heat flow is perpendicular to the layers.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total R-Value = R1 + R2 + R3 + ... + Rn'}
        </p>
    </div>
    <p>Layers included in the summation are: exterior siding, exterior sheathing, air films (interior and exterior), the insulation product itself, and interior drywall/plaster.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Thermal Bridging (Framing Correction)</h3>
    <p>The summation rule is complicated by **thermal bridging**—areas where highly conductive materials (like wood studs or metal frames) penetrate the insulation layer, creating a path for heat to bypass the resistance. Because wood has a much lower R-value than the cavity insulation (e.g., R-1.25 per inch vs. R-3.7 per inch for fiberglass), the actual system R-value is significantly lower than the stated R-value of the insulation alone. Building codes often require using the **Assembly R-Value**, which accounts for this framing factor.</p>

<hr />

    {/* R-VALUE AND U-FACTOR: THE INVERSE RELATIONSHIP */}
    <h2 id="u-factor" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">R-Value and U-Factor: The Inverse Relationship</h2>
    <p>While R-value measures resistance to heat flow, the <strong className="font-semibold">U-Factor</strong> (or U-value) measures the rate of heat transfer (thermal transmittance). These two metrics are inversely related and are used in different contexts (R-value for opaque assemblies like walls, U-factor for transparent assemblies like windows).</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">The Conversion Formula</h3>
    <p>U-Factor is defined as the reciprocal of the total R-value of a system:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'U-Factor = 1 / Total R-Value'}
        </p>
    </div>
    <p>A lower U-factor indicates a better performing building assembly, meaning less heat is transferred per unit of time and area. This is the preferred metric for analyzing windows and doors, where heat loss is complex and dominated by glass properties.</p>

<hr />

    {/* CLIMATE ZONES AND REQUIRED R-VALUE STANDARDS */}
    <h2 id="climate" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Climate Zones and Required R-Value Standards</h2>
    <p>Building codes and energy efficiency standards mandate minimum R-values based on local climate conditions. The required thermal resistance in a cold climate is drastically different from that in a hot climate.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">ASHRAE and IECC Climate Zones</h3>
    <p>The International Energy Conservation Code (IECC) and standards set by ASHRAE (American Society of Heating, Refrigerating and Air-Conditioning Engineers) divide the world into climate zones (typically 1 through 8, from hottest to coldest). The required R-value for ceilings, walls, and floors increases progressively from Zone 1 to Zone 8.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Minimum Code Requirements</h3>
    <p>Typical residential minimums for cold climates (Zone 6) might require R-49 or R-60 in attics, while warmer climates (Zone 3) may require R-30 or R-38. These requirements are legally binding and are essential inputs for any accurate R-value calculation tool.</p>

<hr />

    {/* MATERIAL SCIENCE: R-VALUES BY INSULATION TYPE */}
    <h2 id="materials" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Material Science: R-Values by Insulation Type</h2>
    <p>The R-value of a product is primarily determined by its material composition and density. Different insulation types achieve different levels of thermal resistance per inch of thickness.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Common Insulation Types and R-Per-Inch Values</h3>
    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 my-4">
        <thead className="bg-gray-50">
            <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typical R-Value Per Inch</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primary Use</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Fiberglass Batts (Faced/Unfaced)</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">R-3.0 to R-3.7</td>
                <td className="px-6 py-4 whitespace-nowrap">Wall/Ceiling Cavities (New Construction)</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Loose-Fill Cellulose</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">R-3.5 to R-3.8</td>
                <td className="px-6 py-4 whitespace-nowrap">Attic Floors, Dense Pack in Existing Walls</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Extruded Polystyrene (XPS) Foam Board</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">R-5.0</td>
                <td className="px-6 py-4 whitespace-nowrap">Exterior Walls, Foundations, Below Slab</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Polyisocyanurate (Polyiso) Foam</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">R-6.0 to R-6.5</td>
                <td className="px-6 py-4 whitespace-nowrap">Roofing, Continuous Insulation</td>
            </tr>
            <tr>
                <td className="px-6 py-4 whitespace-nowrap"><strong className="font-semibold">Closed-Cell Spray Foam (Polyurethane)</strong></td>
                <td className="px-6 py-4 whitespace-nowrap">R-6.5 to R-7.0</td>
                <td className="px-6 py-4 whitespace-nowrap">Crawlspaces, Difficult-to-Access Areas</td>
            </tr>
        </tbody>
    </table>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>The R-value is the essential metric for calculating thermal resistance, forming the basis for all energy-efficient building standards. Accurate calculation requires summing the resistance of all components in a wall or roof assembly and applying necessary corrections for thermal bridging (the framing factor).</p>
    <p>Ultimately, the goal is to meet or exceed the R-value required for the local climate zone, ensuring that the total system resistance minimizes heat flow, reduces energy consumption, and provides long-term cost savings for the building owner.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about insulation R-values and thermal performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is R-value and why is it important?</h4>
              <p className="text-muted-foreground">
                R-value measures thermal resistance - how well a material resists heat flow. Higher R-values mean better insulation, leading to lower energy bills and improved comfort.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I choose the right R-value for my climate?</h4>
              <p className="text-muted-foreground">
                Climate zones determine recommended R-values. Colder climates need higher R-values (R-49+ for attics), while warmer climates may use lower values (R-30+ for attics). Check local building codes for specific requirements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between insulation types?</h4>
              <p className="text-muted-foreground">
                Fiberglass batt is affordable and easy to install. Spray foam provides the highest R-value and air sealing. Cellulose is eco-friendly. Rockwool is fire-resistant. Choose based on your budget, installation method, and performance needs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I install insulation myself?</h4>
              <p className="text-muted-foreground">
                Batt insulation is DIY-friendly for walls and attics. Blown-in insulation requires special equipment. Spray foam typically needs professional installation due to equipment and safety requirements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How much does insulation cost?</h4>
              <p className="text-muted-foreground">
                Costs vary by material and R-value. Fiberglass batt costs $0.50-1.50 per sq ft, while spray foam costs $3-7 per sq ft. Higher R-values require more material but provide better long-term energy savings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need a vapor barrier with insulation?</h4>
              <p className="text-muted-foreground">
                Vapor barriers prevent moisture problems. Required in cold climates on the warm side of insulation. Some insulation materials (like closed-cell spray foam) act as vapor barriers themselves.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long does insulation last?</h4>
              <p className="text-muted-foreground">
                Properly installed insulation can last 50+ years. Fiberglass and rockwool are very durable. Cellulose may settle over time. Spray foam is long-lasting but can degrade if exposed to UV light.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's more important: insulation or air sealing?</h4>
              <p className="text-muted-foreground">
                Both are crucial, but air sealing often provides more immediate benefits. Air leaks can reduce insulation effectiveness by 30-40%. Seal air leaks first, then add insulation for maximum efficiency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I add insulation over existing insulation?</h4>
              <p className="text-muted-foreground">
                Yes, but check for moisture problems first. In attics, you can add more insulation. For walls, ensure existing insulation isn't compressed or damaged. Don't exceed the cavity depth.
              </p>
            </div>

             <div>
              <h4 className="font-semibold text-foreground mb-2">How do I know if my insulation is working properly?</h4>
              <p className="text-muted-foreground">
                Signs of poor insulation include high energy bills, uneven temperatures, drafts, and ice dams on roofs. A home energy audit can identify insulation problems and recommend improvements.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}