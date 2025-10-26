'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Info, AlertCircle, TrendingUp, Users, Home, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

const fixtureUnits = {
  kitchenSink: 2,
  bathroomSink: 1,
  dishwasher: 2,
  washingMachine: 4,
  toilet: 3,
  shower: 2,
  bathtub: 4,
  hoseBibb: 5,
};

type Fixture = keyof typeof fixtureUnits;

const formSchema = z.object({
  fixtures: z.array(z.string()).refine(value => value.some(item => item), {
    message: "You have to select at least one fixture.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function WaterUsagePlumbingFlowCalculator() {
  const [result, setResult] = useState<{ 
    wsfu: number; 
    demandGPM: number; 
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
      fixtures: [],
    },
  });

  const calculate = (data: FormValues) => {
    const totalWSFU = data.fixtures.reduce((acc, fixture) => acc + fixtureUnits[fixture as Fixture], 0);
    
    // Hunter's Curve approximation for converting WSFU to GPM demand
    let demandGPM = 0;
    if (totalWSFU <= 30) {
        demandGPM = 0.966 * Math.pow(totalWSFU, 0.635);
    } else {
        demandGPM = 2.45 * Math.pow(totalWSFU, 0.44);
    }
    
    return { wsfu: totalWSFU, demandGPM };
  };

  const interpret = (wsfu: number, demandGPM: number) => {
    if (demandGPM > 15) return `High water demand system with ${wsfu} WSFU requiring ${demandGPM.toFixed(2)} GPM peak flow.`;
    if (demandGPM >= 8) return `Medium water demand system with ${wsfu} WSFU requiring ${demandGPM.toFixed(2)} GPM peak flow.`;
    return `Standard water demand system with ${wsfu} WSFU requiring ${demandGPM.toFixed(2)} GPM peak flow.`;
  };

  const getSystemSize = (demandGPM: number) => {
    if (demandGPM > 15) return 'Large System';
    if (demandGPM >= 8) return 'Medium System';
    return 'Small System';
  };

  const getEfficiencyLevel = (wsfu: number) => {
    if (wsfu > 20) return 'High Demand';
    if (wsfu >= 10) return 'Moderate Demand';
    return 'Low Demand';
  };

  const getRecommendations = (demandGPM: number, wsfu: number) => {
    const recommendations = [];
    
    recommendations.push(`Size main water line for ${demandGPM.toFixed(2)} GPM peak demand`);
    recommendations.push('Consider pressure-reducing valve if needed');
    recommendations.push('Plan for proper pipe sizing throughout system');
    recommendations.push('Ensure adequate water pressure at all fixtures');
    
    if (demandGPM > 15) {
      recommendations.push('Consider upgrading to 1" or larger main line');
      recommendations.push('Plan for high-capacity water heater');
    }
    
    if (wsfu > 20) {
      recommendations.push('Consider zoning for large systems');
      recommendations.push('Plan for professional installation');
    }
    
    return recommendations;
  };

  const getConsiderations = (demandGPM: number, wsfu: number) => {
    const considerations = [];
    
    considerations.push('Proper sizing prevents pressure drops during peak usage');
    considerations.push('Local water pressure affects system performance');
    considerations.push('Pipe material affects flow capacity and longevity');
    considerations.push('Water quality impacts fixture performance');
    
    if (demandGPM > 15) {
      considerations.push('Large systems may require booster pumps');
    }
    
    if (wsfu > 20) {
      considerations.push('Complex systems need professional design');
    }
    
    return considerations;
  };

  const opinion = (demandGPM: number, wsfu: number) => {
    if (demandGPM > 15 || wsfu > 20) return `This plumbing system requires professional design and installation for optimal performance and code compliance.`;
    if (demandGPM >= 8) return `This is a standard residential plumbing system that can be professionally installed with proper planning.`;
    return `This is a simple plumbing system suitable for basic residential needs with proper installation.`;
  };

  const onSubmit = (data: FormValues) => {
    const calculation = calculate(data);
    setResult({ 
      wsfu: calculation.wsfu, 
      demandGPM: calculation.demandGPM, 
      interpretation: interpret(calculation.wsfu, calculation.demandGPM), 
      opinion: opinion(calculation.demandGPM, calculation.wsfu),
      systemSize: getSystemSize(calculation.demandGPM),
      efficiencyLevel: getEfficiencyLevel(calculation.wsfu),
      recommendations: getRecommendations(calculation.demandGPM, calculation.wsfu),
      considerations: getConsiderations(calculation.demandGPM, calculation.wsfu)
    });
  };

  return (
    <div className="space-y-8">

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Plumbing Fixture Selection
          </CardTitle>
          <CardDescription>
            Select all water fixtures in your home to calculate peak water demand
          </CardDescription>
        </CardHeader>
        <CardContent>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="fixtures"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">Water Fixtures</FormLabel>
                   <CardDescription>Select all the water fixtures in your home.</CardDescription>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.keys(fixtureUnits).map((fixtureId) => (
                    <FormField
                      key={fixtureId}
                      control={form.control}
                      name="fixtures"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={fixtureId}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(fixtureId)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, fixtureId])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== fixtureId
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {fixtureId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
              <Button type="submit" className="w-full md:w-auto">
                Calculate Water Demand
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
                <Droplets className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Your Water System Requirements</CardTitle>
                  <CardDescription>Detailed water demand calculation and plumbing analysis</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Droplets className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Peak Demand</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.demandGPM.toFixed(2)} GPM
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.systemSize}
                  </p>
                </div>
                
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">WSFU Total</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">
                    {result.wsfu} WSFU
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
                    {result.demandGPM > 15 ? 'Complex System' : 
                     result.demandGPM >= 8 ? 'Standard System' : 'Simple System'}
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
                        <Droplets className="h-5 w-5" />
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
              <h4 className="font-semibold text-foreground mb-2">Water Supply Fixture Units (WSFU)</h4>
              <p className="text-muted-foreground">
                WSFU is a standardized unit used in plumbing to measure probable water demand. Each fixture type has a specific WSFU value based on its typical usage patterns.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Fixture Selection</h4>
              <p className="text-muted-foreground">
                Select all water fixtures in your home. The calculator uses Hunter's Curve to convert total WSFU into realistic peak demand in gallons per minute (GPM).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Peak Demand Calculation</h4>
              <p className="text-muted-foreground">
                Peak demand represents the maximum water flow needed when multiple fixtures are used simultaneously. This is crucial for sizing your main water supply line.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">System Sizing</h4>
              <p className="text-muted-foreground">
                Proper sizing prevents pressure drops during peak usage. Undersized pipes cause low pressure, while oversized pipes are unnecessarily expensive.
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
              Explore other home improvement calculators to plan your plumbing and renovation project
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
              <Droplets className="h-5 w-5" />
              Complete Guide to Plumbing System Design
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
              Common questions about plumbing system design and water demand calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a WSFU and why is it important?</h4>
              <p className="text-muted-foreground">
                WSFU (Water Supply Fixture Unit) is a standardized unit that measures probable water demand. It's crucial for sizing pipes because it accounts for the fact that not all fixtures run simultaneously.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How does Hunter's Curve work?</h4>
              <p className="text-muted-foreground">
                Hunter's Curve is a probability model that predicts realistic peak water demand. It recognizes that the more fixtures you have, the lower the probability that all will be used at once.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What pipe size do I need for my system?</h4>
              <p className="text-muted-foreground">
                Pipe sizing depends on peak demand: 3/4" pipe handles up to 10-15 GPM, 1" pipe handles 15-25 GPM, and 1.25" pipe handles 25-40 GPM. Consult local codes for specific requirements.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Why is proper pipe sizing important?</h4>
              <p className="text-muted-foreground">
                Undersized pipes cause pressure drops and poor performance, while oversized pipes are unnecessarily expensive and can lead to sediment buildup due to low water velocity.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What factors affect water pressure?</h4>
              <p className="text-muted-foreground">
                Water pressure is affected by municipal supply pressure, pipe size, pipe length, elevation changes, fixture restrictions, and simultaneous usage patterns.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Do I need a pressure-reducing valve?</h4>
              <p className="text-muted-foreground">
                Pressure-reducing valves are needed when municipal pressure exceeds 80 PSI to protect fixtures and prevent water hammer. They're typically installed at the main water entry point.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I improve water pressure in my home?</h4>
              <p className="text-muted-foreground">
                Improve pressure by checking for leaks, cleaning aerators, upgrading pipe size, installing booster pumps, or adjusting pressure-reducing valve settings.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What's the difference between flow rate and pressure?</h4>
              <p className="text-muted-foreground">
                Flow rate (GPM) is the volume of water delivered, while pressure (PSI) is the force pushing the water. Both are important for proper fixture performance and system design.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I calculate water usage for billing?</h4>
              <p className="text-muted-foreground">
                Water usage is measured in cubic feet or gallons by your water meter. Peak demand calculations are for system design, not billing purposes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Should I hire a professional for plumbing design?</h4>
              <p className="text-muted-foreground">
                Yes, for new construction or major renovations, professional plumbing design ensures code compliance, optimal performance, and proper system sizing for your specific needs.
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
    </div>
  );
}