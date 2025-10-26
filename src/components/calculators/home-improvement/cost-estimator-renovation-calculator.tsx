'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Ruler, Info, AlertCircle, TrendingUp, Users, Home, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const renovationCosts = {
  basicKitchen: 150,
  midKitchen: 250,
  highKitchen: 400,
  basicBathroom: 200,
  midBathroom: 350,
  highBathroom: 500,
  basement: 50,
};

const formSchema = z.object({
  area: z.number().min(0.1).optional(),
  renovationType: z.number().min(1).optional(),
  unit: z.enum(['feet', 'meters']).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CostEstimatorRenovationCalculator() {
  const [result, setResult] = useState<{ 
    low: number; 
    high: number; 
    interpretation: string; 
    opinion: string;
    projectScale: string;
    costLevel: string;
    recommendations: string[];
    considerations: string[];
  } | null>(null);

  const form = useForm<FormValues>({ 
    resolver: zodResolver(formSchema), 
    defaultValues: { 
      area: undefined, 
      renovationType: undefined, 
      unit: undefined 
    } 
  });

  const calculate = (v: FormValues) => {
    if (v.area == null || v.renovationType == null || v.unit == null) return null;
    
    let area = v.area;
    if (v.unit === 'meters') {
      area *= 10.7639; // to sq ft
    }
    
    const baseCost = area * v.renovationType;
    return { low: baseCost * 0.8, high: baseCost * 1.2 };
  };

  const interpret = (low: number, high: number, renovationType: number) => {
    const renovationTypeName = Object.keys(renovationCosts).find(key => renovationCosts[key as keyof typeof renovationCosts] === renovationType) || 'renovation';
    if (high > 50000) return `Large ${renovationTypeName} project with estimated cost range of $${low.toLocaleString()} - $${high.toLocaleString()}.`;
    if (high >= 20000) return `Medium ${renovationTypeName} project with estimated cost range of $${low.toLocaleString()} - $${high.toLocaleString()}.`;
    return `Small ${renovationTypeName} project with estimated cost range of $${low.toLocaleString()} - $${high.toLocaleString()}.`;
  };

  const getProjectScale = (high: number) => {
    if (high > 50000) return 'Large Project';
    if (high >= 20000) return 'Medium Project';
    return 'Small Project';
  };

  const getCostLevel = (renovationType: number) => {
    if (renovationType >= 400) return 'High-End';
    if (renovationType >= 200) return 'Mid-Range';
    return 'Basic';
  };

  const getRecommendations = (low: number, high: number, renovationType: number) => {
    const recommendations = [];
    
    recommendations.push(`Budget between $${low.toLocaleString()} and $${high.toLocaleString()} for your project`);
    recommendations.push('Get multiple quotes from licensed contractors');
    recommendations.push('Set aside 10-20% contingency for unexpected costs');
    recommendations.push('Consider phased approach for large projects');
    
    if (renovationType >= 400) {
      recommendations.push('Hire experienced contractors for high-end work');
      recommendations.push('Consider professional design services');
    }
    
    if (high > 50000) {
      recommendations.push('Plan for extended timeline and disruption');
      recommendations.push('Consider temporary living arrangements');
    }
    
    return recommendations;
  };

  const getConsiderations = (renovationType: number, high: number) => {
    const considerations = [];
    
    considerations.push('Costs vary significantly by location and market conditions');
    considerations.push('Material choices greatly impact final costs');
    considerations.push('Labor costs depend on local market rates');
    considerations.push('Permits and inspections add to project costs');
    
    if (renovationType >= 400) {
      considerations.push('High-end materials require skilled installation');
    }
    
    if (high > 50000) {
      considerations.push('Large projects may require financing options');
    }
    
    return considerations;
  };

  const opinion = (high: number, renovationType: number) => {
    if (high > 50000 || renovationType >= 400) return `This is a significant investment requiring careful planning, professional contractors, and adequate financing.`;
    if (high >= 20000) return `This is a substantial renovation project that requires professional planning and execution.`;
    return `This is a manageable renovation project that can be completed with proper planning and budgeting.`;
  };

  const onSubmit = (values: FormValues) => {
    const calculation = calculate(values);
    if (calculation == null) { setResult(null); return; }
    setResult({ 
      low: calculation.low, 
      high: calculation.high, 
      interpretation: interpret(calculation.low, calculation.high, values.renovationType || 0), 
      opinion: opinion(calculation.high, values.renovationType || 0),
      projectScale: getProjectScale(calculation.high),
      costLevel: getCostLevel(values.renovationType || 0),
      recommendations: getRecommendations(calculation.low, calculation.high, values.renovationType || 0),
      considerations: getConsiderations(values.renovationType || 0, calculation.high)
    });
  };

  const unit = form.watch('unit');

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Renovation Project Specifications
          </CardTitle>
          <CardDescription>
            Enter your renovation details to get accurate cost estimates
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
                  name="renovationType" 
                  render={({ field }) => (
              <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Renovation Type
                      </FormLabel>
                <FormControl>
                        <select 
                          className="border rounded h-10 px-3 w-full bg-background" 
                          value={field.value ?? ''} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        >
                          <option value="">Select renovation type</option>
                          {Object.entries(renovationCosts).map(([key, value]) => (
                            <option key={key} value={value}>
                              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} (${value}/sq ft)
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
                        Area ({unit === 'feet' ? 'sq ft' : 'sq m'})
                      </FormLabel>
                <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="e.g., 150" 
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
                Calculate Renovation Costs
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
                <Calculator className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Renovation Cost Estimate</CardTitle>
                  <CardDescription>Detailed cost analysis and project planning</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Cost Range</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    ${result.low.toLocaleString()} - ${result.high.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.projectScale}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Quality Level</span>
                  </div>
                  <div className="text-2xl font-bold">
                    <Badge variant={result.costLevel === 'High-End' ? 'default' : result.costLevel === 'Mid-Range' ? 'secondary' : 'outline'}>
                      {result.costLevel}
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
                    {result.high > 50000 ? 'Major Investment' : 
                     result.high >= 20000 ? 'Significant Project' : 'Manageable Project'}
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
                        <Calculator className="h-5 w-5" />
                        Budget Planning Recommendations
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
              <h4 className="font-semibold text-foreground mb-2">Renovation Type</h4>
              <p className="text-muted-foreground">
                Select the type and quality level of your renovation project. Basic involves cosmetic updates, Mid includes replacing fixtures, and High involves premium materials and layout changes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Area</h4>
              <p className="text-muted-foreground">
                The square footage of the space you're renovating. This is the primary factor in cost calculation, as most renovation costs are calculated per square foot.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Measurement Units</h4>
              <p className="text-muted-foreground">
                Choose between square feet or square meters. The calculator automatically handles unit conversions and provides cost estimates in your local currency.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Cost Factors</h4>
              <p className="text-muted-foreground">
                Renovation costs vary by location, material choices, labor rates, and project complexity. The calculator provides a range to account for these variables.
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
                  <a href="/category/home-improvement/lighting-layout-calculator" className="text-primary hover:underline">
                    Lighting Layout Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate optimal lighting fixtures and placement for your room dimensions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Complete Guide to Renovation Cost Planning
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
              Common questions about renovation cost estimation and project planning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">How accurate are these cost estimates?</h4>
              <p className="text-muted-foreground">
                These are rough estimates based on national averages. Actual costs vary significantly by location, material choices, and labor rates. Always get multiple quotes from local contractors.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What factors affect renovation costs?</h4>
              <p className="text-muted-foreground">
                Key factors include location, material quality, labor costs, project complexity, permits, structural changes, and unexpected issues discovered during demolition.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I budget for unexpected costs?</h4>
              <p className="text-muted-foreground">
                Yes, always budget 10-20% extra for contingency. Renovations often uncover hidden issues like water damage, outdated wiring, or structural problems that need addressing.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between basic, mid-range, and high-end renovations?</h4>
              <p className="text-muted-foreground">
                Basic focuses on cosmetic updates, mid-range replaces fixtures with good quality materials, and high-end uses premium materials and may involve layout changes or custom work.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How long do renovations typically take?</h4>
              <p className="text-muted-foreground">
                Timeline depends on project scope: basic updates take 1-2 weeks, mid-range renovations 4-8 weeks, and high-end projects 8-16 weeks or more for complex work.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need permits for my renovation?</h4>
              <p className="text-muted-foreground">
                Permits are typically required for structural changes, electrical work, plumbing modifications, and major renovations. Check local building codes and requirements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I choose the right contractor?</h4>
              <p className="text-muted-foreground">
                Get multiple quotes, check references, verify licenses and insurance, review portfolios, and ensure clear communication about timeline, costs, and expectations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can I save money by doing some work myself?</h4>
              <p className="text-muted-foreground">
                DIY can save money on simple tasks like painting or demolition, but complex work like electrical, plumbing, or structural changes should be left to professionals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What financing options are available for renovations?</h4>
              <p className="text-muted-foreground">
                Options include home equity loans, cash-out refinancing, personal loans, credit cards, or renovation-specific loans. Choose based on your financial situation and project needs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I prepare for living during a renovation?</h4>
              <p className="text-muted-foreground">
                Plan for dust, noise, and limited access to renovated areas. Consider temporary living arrangements for major projects, or create temporary kitchen/bathroom facilities.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}