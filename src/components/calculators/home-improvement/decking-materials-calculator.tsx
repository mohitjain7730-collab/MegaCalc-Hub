'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Square, Ruler, Calculator, Info, AlertCircle, TrendingUp, Users, Home, Building, Hammer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const formSchema = z.object({
  deckLength: z.number().min(0.1).optional(),
  deckWidth: z.number().min(0.1).optional(),
  boardWidth: z.number().min(0.1).optional(),
  joistSpacing: z.number().min(0.1).optional(),
  unit: z.enum(['feet', 'meters']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function DeckingMaterialsCalculator() {
  const [result, setResult] = useState<{ 
    boardsNeeded: number; 
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
      deckLength: undefined, 
      deckWidth: undefined, 
      boardWidth: undefined,
      joistSpacing: undefined,
      unit: undefined 
    }
  });

  const calculate = (v: FormValues) => {
    if (v.deckLength == null || v.deckWidth == null || v.boardWidth == null || v.joistSpacing == null || v.unit == null) return null;
    
    let deckLength = v.deckLength;
    let deckWidth = v.deckWidth;
    let boardWidth = v.boardWidth;
    let joistSpacing = v.joistSpacing;
    
    if (v.unit === 'meters') {
        deckLength *= 3.28084;
        deckWidth *= 3.28084;
        boardWidth /= 2.54; // cm to inches
        joistSpacing /= 2.54; // cm to inches
    }

    const boardGap = 0.125; // 1/8 inch gap
    const rowsOfBoards = Math.ceil(deckWidth * 12 / (boardWidth + boardGap));
    const totalBoards = Math.ceil(rowsOfBoards * 1.05); // 5% wastage
    
    return totalBoards;
  };

  const interpret = (boardsNeeded: number, deckLength: number, deckWidth: number) => {
    const area = deckLength * deckWidth;
    if (boardsNeeded > 100) return `Large decking project requiring ${boardsNeeded} boards for ${area.toFixed(1)} sq ft deck.`;
    if (boardsNeeded >= 50) return `Medium decking project requiring ${boardsNeeded} boards for ${area.toFixed(1)} sq ft deck.`;
    return `Small decking project requiring ${boardsNeeded} boards for ${area.toFixed(1)} sq ft deck.`;
  };

  const getProjectSize = (boardsNeeded: number) => {
    if (boardsNeeded > 100) return 'Large Project';
    if (boardsNeeded >= 50) return 'Medium Project';
    return 'Small Project';
  };

  const getComplexityLevel = (joistSpacing: number) => {
    if (joistSpacing <= 12) return 'High Complexity';
    if (joistSpacing <= 16) return 'Standard Complexity';
    return 'Low Complexity';
  };

  const getRecommendations = (boardsNeeded: number, joistSpacing: number, unit: string) => {
    const recommendations = [];
    
    recommendations.push(`Purchase ${boardsNeeded} decking boards with 5-10% extra`);
    recommendations.push('Use appropriate fasteners for your decking material');
    recommendations.push('Ensure proper joist spacing for structural support');
    recommendations.push('Plan for proper drainage and ventilation');
    
    if (joistSpacing > 16) {
      recommendations.push('Consider reducing joist spacing for better support');
    }
    
    if (boardsNeeded > 75) {
      recommendations.push('Consider professional installation for large projects');
    }
    
    return recommendations;
  };

  const getConsiderations = (boardsNeeded: number, joistSpacing: number) => {
    const considerations = [];
    
    considerations.push('Deck shape affects board cutting and waste');
    considerations.push('Joist spacing affects structural integrity');
    considerations.push('Board gaps are necessary for drainage');
    considerations.push('Local building codes may specify requirements');
    
    if (joistSpacing > 20) {
      considerations.push('Wide joist spacing may require thicker decking boards');
    }
    
    return considerations;
  };

  const opinion = (boardsNeeded: number, joistSpacing: number) => {
    if (boardsNeeded > 100) return `This is a substantial decking project that requires careful planning and may benefit from professional installation.`;
    if (boardsNeeded >= 50) return `This is a manageable DIY project with proper preparation and attention to structural requirements.`;
    return `Perfect size for a DIY weekend project with basic carpentry skills.`;
  };

  const onSubmit = (values: FormValues) => {
    const boardsNeeded = calculate(values);
    if (boardsNeeded == null) { setResult(null); return; }
    setResult({ 
      boardsNeeded, 
      interpretation: interpret(boardsNeeded, values.deckLength || 0, values.deckWidth || 0), 
      opinion: opinion(boardsNeeded, values.joistSpacing || 16),
      projectSize: getProjectSize(boardsNeeded),
      complexityLevel: getComplexityLevel(values.joistSpacing || 16),
      recommendations: getRecommendations(boardsNeeded, values.joistSpacing || 16, values.unit || 'feet'),
      considerations: getConsiderations(boardsNeeded, values.joistSpacing || 16)
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
            Deck Dimensions & Board Specifications
          </CardTitle>
          <CardDescription>
            Enter your deck dimensions and board specifications to calculate material needs
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
                  name="deckLength" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Deck Length ({unit})
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
                  name="deckWidth" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Deck Width ({unit})
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
                  name="boardWidth" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Square className="h-4 w-4" />
                        Board Width ({unit === 'feet' ? 'in' : 'cm'})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 5.5" 
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
                  name="joistSpacing" 
                  render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2">
                        <Hammer className="h-4 w-4" />
                        Joist Spacing ({unit === 'feet' ? 'in' : 'cm'})
                    </FormLabel>
                    <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 16" 
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
                Calculate Decking Materials
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
                  <CardTitle>Your Decking Requirements</CardTitle>
                  <CardDescription>Detailed decking calculation and project analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Square className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Boards Needed</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.boardsNeeded} boards
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
                    <Badge variant={result.complexityLevel === 'High Complexity' ? 'destructive' : result.complexityLevel === 'Standard Complexity' ? 'secondary' : 'default'}>
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
                    {result.boardsNeeded > 100 ? 'Large Project' : 
                     result.boardsNeeded >= 50 ? 'Medium Project' : 'Small Project'}
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
              <h4 className="font-semibold text-foreground mb-2">Deck Dimensions</h4>
              <p className="text-muted-foreground">
                Enter the length and width of your planned deck area. The calculator assumes a rectangular deck and calculates materials accordingly.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Board Width</h4>
              <p className="text-muted-foreground">
                The actual width of one decking board. Note that nominal sizes differ from actual sizes - a "5/4x6" board is typically 5.5 inches wide.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Joist Spacing</h4>
              <p className="text-muted-foreground">
                The center-to-center distance between support joists. Common spacing is 16 inches, but this varies by decking material and local building codes.
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
                  <a href="/category/home-improvement/roofing-shingle-calculator" className="text-primary hover:underline">
                    Roofing Shingle Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the exact amount of roofing materials needed for your roof project.
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
    <meta itemProp="name" content="The Definitive Guide to Decking Materials Calculation: Lumber, Joists, Boards, and Concrete" />
    <meta itemProp="description" content="An expert guide detailing how to calculate the total quantity of decking materials needed, covering linear footage for decking boards, volume of concrete for footings, joist spacing requirements, and necessary waste factors for framing and decking." />
    <meta itemProp="keywords" content="decking material calculator formula, calculate lumber needed for deck, deck joist spacing, deck board linear footage, concrete volume deck footings, decking waste factor, framing calculation" />
    <meta itemProp="author" content="[Your Site's Home Improvement Team]" />
    <meta itemProp="datePublished" content="2025-10-25" /> 
    <meta itemProp="url" content="/definitive-decking-materials-guide" />

    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4" itemProp="headline">The Definitive Guide to Decking Materials: Calculating Lumber, Footings, and Boards</h1>
    <p className="text-lg italic text-gray-700">Master the engineering and geometry required to accurately estimate the structural components and surface materials for any deck build.</p>

    {/* TABLE OF CONTENTS (INTERNAL LINKS FOR UX AND SEO) */}
    <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">Table of Contents: Jump to a Section</h2>
    <ul className="list-disc ml-6 space-y-2 text-blue-600">
        <li><a href="#framing" className="hover:underline">Framing Calculation: Beams, Joists, and Headers</a></li>
        <li><a href="#decking-boards" className="hover:underline">Decking Boards: Linear Footage and Coverage</a></li>
        <li><a href="#footings" className="hover:underline">Footings and Posts: Volume of Concrete</a></li>
        <li><a href="#waste" className="hover:underline">The Critical Role of the Waste Factor</a></li>
        <li><a href="#fasteners" className="hover:underline">Supplemental Material Estimation (Fasteners)</a></li>
    </ul>
<hr />

    {/* FRAMING CALCULATION: BEAMS, JOISTS, AND HEADERS */}
    <h2 id="framing" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Framing Calculation: Beams, Joists, and Headers</h2>
    <p>The structural integrity of a deck relies on accurate calculation of the framing lumber: beams, headers, and joists. These components must adhere to strict building code span tables based on the lumber species, grade, and size.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Beams and Headers</h3>
    <p>Beams support the joists and transfer the load to the posts. Headers (or rim joists) frame the perimeter of the deck. Calculation involves determining the total linear feet of the deck perimeter and the internal beam structure. Beams are often constructed by bolting two or three boards together (e.g., two 2x8s or three 2x10s) to meet load requirements.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Joists and Spacing</h3>
    <p>Joists run perpendicular to the beams and provide the structure that supports the decking boards. The number of joists needed depends on the deck width and the code-required spacing (typically 12, 16, or 24 inches on center). Tighter spacing is required for composite or diagonal decking layouts to prevent board deflection.</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Joists = (Deck Width / Joist Spacing) + 1'}
        </p>
    </div>
    <p>The total linear footage of joists is the number of required joists multiplied by the length of the deck.</p>

<hr />

    {/* DECKING BOARDS: LINEAR FOOTAGE AND COVERAGE */}
    <h2 id="decking-boards" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Decking Boards: Linear Footage and Coverage</h2>
    <p>Decking boards (the surface) are calculated based on the total area of the deck divided by the usable area of the board, adjusted for the necessary spacing gap.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Total Deck Area</h3>
    <p>Deck area is the simple product of its length and width. This is the starting point for material estimation:</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Total Area = Deck Length * Deck Width'}
        </p>
    </div>

    <h3 className="text-xl font-semibold text-foreground mt-6">Linear Feet of Decking Required</h3>
    <p>The total linear feet of decking needed must account for the board width and the required spacing gap (typically $1/8$ to $1/4$ inch). The calculation relies on dividing the total area by the **effective width** of a single deck board.</p>
    <p>For example, a nominal $6$-inch board has an actual width of about $5.5$ inches. Factoring in a $1/4$-inch gap, the effective width is $5.75$ inches. This effective width is used to calculate the linear feet of material needed per square foot of deck surface.</p>

<hr />

    {/* FOOTINGS AND POSTS: VOLUME OF CONCRETE */}
    <h2 id="footings" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Footings and Posts: Volume of Concrete</h2>
    <p>Deck posts transfer the deck's load directly to the ground via concrete footings. Calculation involves determining the total number of footings and the necessary concrete volume.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Footing Placement and Load Bearing</h3>
    <p>Building codes dictate the required size and depth of footings based on local frost lines and the projected load. The number of posts and footings depends on the span limitations of the beams (e.g., posts every 6 to 8 feet along the beam). The required footing size is the most critical safety factor in deck construction.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Calculating Concrete Volume</h3>
    <p>The volume of concrete needed for one cylindrical footing is calculated as $\pi \cdot r^2 \cdot h$. The total volume is the number of footings multiplied by the volume per footing. This total is then converted from cubic feet to the standard unit of purchase, typically cubic yards (1 cubic yard $\approx 27$ cubic feet).</p>
    <div className="overflow-x-auto my-6 p-4 bg-gray-50 border rounded-lg text-center">
        <p className="font-mono text-xl text-red-700 font-bold">
            {'Footing Volume (Cubic Feet) = Total Footings * 3.14159 * Radius^2 * Depth'}
        </p>
    </div>

<hr />

    {/* THE CRITICAL ROLE OF THE WASTE FACTOR */}
    <h2 id="waste" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">The Critical Role of the Waste Factor</h2>
    <p>Due to the nature of lumber (non-perfect lengths, knots, and required cuts), a **Waste Factor** must be applied to all lumber components to avoid expensive shortages and delays.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Waste Percentages by Component</h3>
    <ul className="list-disc ml-6 space-y-2">
        <li><strong className="font-semibold">Framing Lumber (Beams/Joists):</strong> 5% to 10% waste factor. This accounts for trimming ends to size, squaring boards, and defects.</li>
        <li><strong className="font-semibold">Decking Boards (Parallel Lay):</strong> 10% to 15% waste factor. This higher percentage accounts for the need to stagger seams, cut around posts, and ensure clean ends.</li>
        <li><strong className="font-semibold">Decking Boards (Diagonal Lay):</strong> 15% to 20% waste factor. Diagonal installation maximizes corner waste, requiring a substantial buffer.</li>
    </ul>

    <h3 className="text-xl font-semibold text-foreground mt-6">Rounding to Usable Lengths</h3>
    <p>Lumber is sold in discrete lengths (e.g., 8-foot, 10-foot, 12-foot, etc.). The final quantity must always be rounded up to the nearest available length that covers the required span, adding an implicit waste factor to minimize cuts and labor time.</p>

<hr />

    {/* SUPPLEMENTAL MATERIAL ESTIMATION (FASTENERS) */}
    <h2 id="fasteners" className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Supplemental Material Estimation (Fasteners)</h2>
    <p>Deck construction requires precise estimation of fasteners (screws, nails, connectors) to ensure compliance with structural codes.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Decking Screws/Nails</h3>
    <p>Fasteners for decking boards are estimated based on the total deck surface area and the joist spacing. A standard rule of thumb is approximately 350 screws per 100 square feet of deck surface when using 16-inch joist spacing.</p>

    <h3 className="text-xl font-semibold text-foreground mt-6">Structural Connectors</h3>
    <p>Structural components (post-to-beam, joist-to-header) require specialized metal connectors (joist hangers, post bases, hurricane ties). These are calculated by counting the number of connections required in the framing plan, and often represent a significant safety and budget component of the build.</p>

<hr />

    {/* CONCLUSION */}
    <h2 className="text-2xl font-bold text-foreground pt-8" itemProp="articleSection">Conclusion</h2>
    <p>Accurate decking material calculation is an exercise in structural engineering and meticulous geometric accounting. The process requires precise determination of the number of joists based on spacing and the conversion of total area into linear feet of decking boards.</p>
    <p>Success relies on two key factors: adherence to code-mandated span and footing dimensions for safety, and the essential application of a **waste factor** to all lumber components, ensuring a successful build without compromising quality or facing costly shortages.</p>
</section>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Common questions about deck construction and material calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How much extra decking should I buy?</h4>
              <p className="text-muted-foreground">
                Add 5-10% extra decking boards to account for cuts, waste, and mistakes. For complex deck shapes or patterns, consider 15-20% extra to ensure you have enough material.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the proper joist spacing for decking?</h4>
              <p className="text-muted-foreground">
                Standard joist spacing is 16 inches on center for most decking materials. Some composite decking allows 24-inch spacing, while natural wood typically requires 16-inch spacing for proper support.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate decking for irregular shapes?</h4>
              <p className="text-muted-foreground">
                For irregular deck shapes, break the area into rectangles, calculate each section separately, then add them together. Increase waste percentage for complex shapes with many cuts and angles.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between decking materials?</h4>
              <p className="text-muted-foreground">
                Pressure-treated wood is affordable but requires maintenance. Composite decking is low-maintenance but more expensive. Hardwood is durable and attractive but costly. Choose based on budget, maintenance preferences, and appearance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I prepare for deck construction?</h4>
              <p className="text-muted-foreground">
                Check local building codes, obtain necessary permits, plan the deck layout, ensure proper foundation support, and gather all required tools and materials before starting construction.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What tools do I need for deck building?</h4>
              <p className="text-muted-foreground">
                Essential tools include a circular saw, drill, level, square, measuring tape, and safety equipment. For larger projects, consider renting specialized tools like a miter saw or deck board spacing tool.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I ensure proper drainage on my deck?</h4>
              <p className="text-muted-foreground">
                Maintain 1/8 to 1/4 inch gaps between deck boards, ensure proper slope away from the house (1/4 inch per foot), and consider installing a drainage system under the deck for better water management.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I build a deck myself?</h4>
              <p className="text-muted-foreground">
                Small to medium decks are manageable DIY projects with proper planning and tools. Large decks or those requiring complex structural work may benefit from professional installation for safety and code compliance.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long does deck construction take?</h4>
              <p className="text-muted-foreground">
                Construction time varies by deck size and complexity. A simple 12x16 deck might take 2-3 weekends, while larger or more complex decks can take several weeks. Weather and permit approval can affect timelines.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What maintenance does my deck need?</h4>
              <p className="text-muted-foreground">
                Wood decks need annual cleaning, staining, and sealing. Composite decks require minimal maintenance - just regular cleaning. Check for loose boards, damaged fasteners, and structural issues annually.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}