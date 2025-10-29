
'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, PlusCircle, XCircle, Calculator, Info, TrendingUp, FileText, Activity } from 'lucide-react';

const costPoolSchema = z.object({
  activity: z.string().min(1),
  totalCost: z.number().positive(),
  totalDriverVolume: z.number().positive(),
  productConsumption: z.number().nonnegative(),
  driverUnit: z.string().min(1),
});

const formSchema = z.object({
  costPools: z.array(costPoolSchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;
type Result = {
  totalAllocatedCost: number;
  details: { activity: string; rate: number; allocatedCost: number; unit: string }[];
};

export default function ActivityBasedCostingCalculator() {
  const [result, setResult] = useState<Result | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      costPools: [
        { activity: 'Machine Setups', totalCost: undefined, totalDriverVolume: undefined, productConsumption: undefined, driverUnit: 'setups' },
        { activity: 'Quality Inspections', totalCost: undefined, totalDriverVolume: undefined, productConsumption: undefined, driverUnit: 'inspections' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "costPools"
  });

  const onSubmit = (values: FormValues) => {
    let totalAllocatedCost = 0;
    const details = values.costPools.map(pool => {
      const rate = pool.totalCost / pool.totalDriverVolume;
      const allocatedCost = rate * pool.productConsumption;
      totalAllocatedCost += allocatedCost;
      return { activity: pool.activity, rate, allocatedCost, unit: pool.driverUnit };
    });
    setResult({ totalAllocatedCost, details });
  };

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Activity-Based Costing Calculator
          </CardTitle>
          <CardDescription>
            Allocate overhead costs more accurately based on specific activities and cost drivers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Cost Pools & Drivers
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Define activities, their total costs, and how a specific product consumes them.
                  </p>
                </div>
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-6">
                      <FormField control={form.control} name={`costPools.${index}.activity`} render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormLabel className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Activity
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Machine Setups" {...field} />
                          </FormControl>
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormField control={form.control} name={`costPools.${index}.totalCost`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Cost ($)</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 50000" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                            </FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`costPools.${index}.totalDriverVolume`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total Driver Volume</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 200" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                            </FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`costPools.${index}.productConsumption`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Consumption</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="e.g., 15" {...field} value={field.value ?? ''} onChange={e => field.onChange(parseFloat(e.target.value) || undefined)} />
                            </FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name={`costPools.${index}.driverUnit`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Driver Unit</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., setups" {...field} />
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                      <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} disabled={fields.length < 2}>
                        <XCircle className="mr-2 h-4 w-4" /> Remove Activity
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              <Button type="button" variant="outline" onClick={() => append({ activity: '', totalCost: 0, totalDriverVolume: 0, productConsumption: 0, driverUnit: '' })}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Activity
                </Button>
              </div>
              <Button type="submit" className="w-full md:w-auto">
                Calculate Allocated Cost
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Total Overhead Allocated to Product</CardTitle>
                <CardDescription>Breakdown of allocated costs by activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8 bg-primary/5 rounded-lg mb-6">
              <p className="text-4xl font-bold text-primary mb-2">
                ${result.totalAllocatedCost.toFixed(2)}
              </p>
              <p className="text-muted-foreground">
                Total overhead cost allocated to this product
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Cost Allocation Details</h4>
              {result.details.map((detail, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{detail.activity}</p>
                      <p className="text-sm text-muted-foreground">${detail.rate.toFixed(2)} per {detail.unit}</p>
                    </div>
                    <p className="text-lg font-bold">${detail.allocatedCost.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Content - Expanded Sections */}
      <div className="space-y-6">
        {/* Understanding Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Understanding the Inputs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Activity</h4>
              <p className="text-muted-foreground">
                A specific task or event that drives costs (e.g., 'Machine Setups', 'Purchase Orders', 'Quality Inspections'). Each activity represents a cost pool with distinct costs and a unique cost driver.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Total Cost ($)</h4>
              <p className="text-muted-foreground">
                The total overhead cost associated with that specific activity pool for the period. This includes all costs directly related to performing that activity for all products.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Total Driver Volume & Unit</h4>
              <p className="text-muted-foreground">
                The total number of times the activity is performed for all products (e.g., 500 total 'setups'). The unit describes what is being counted (setups, inspections, orders, etc.).
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Product Consumption</h4>
              <p className="text-muted-foreground">
                How many units of the cost driver the specific product you are analyzing consumes (e.g., the product requires 20 'setups'). This allows you to allocate a portion of the activity cost to this product.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Calculators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Related Calculators
            </CardTitle>
            <CardDescription>
              Explore other financial and business calculators for comprehensive cost management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/overhead-rate-allocation-calculator" className="text-primary hover:underline">
                    Overhead Rate Allocation Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Establish a predetermined overhead rate to apply indirect manufacturing costs.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/business-startup/break-even-point-calculator" className="text-primary hover:underline">
                    Break-Even Point Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate the sales volume needed to cover all fixed and variable costs.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/business-startup/contribution-margin-calculator" className="text-primary hover:underline">
                    Contribution Margin Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Determine the revenue left over after covering variable costs per unit.
                </p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h4 className="font-semibold mb-2">
                  <a href="/category/finance/depreciation-straight-line-calculator" className="text-primary hover:underline">
                    Depreciation (Straight-Line) Calculator
                  </a>
                </h4>
                <p className="text-sm text-muted-foreground">
                  Calculate asset depreciation evenly over its useful life for better cost allocation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guide Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Complete Guide to Activity-Based Costing
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
              Common questions about activity-based costing and cost allocation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">What is Activity-Based Costing (ABC)?</h4>
              <p className="text-muted-foreground">
                Activity-Based Costing is an accounting methodology that assigns costs to products and services based on the activities and resources they consume. Unlike traditional costing methods, ABC identifies multiple cost pools and assigns overhead costs more accurately based on actual consumption of activities.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How is ABC different from traditional costing?</h4>
              <p className="text-muted-foreground">
                Traditional costing typically uses one or two allocation bases (like direct labor hours) to allocate all overhead. ABC uses multiple cost pools and cost drivers specific to each activity. This provides more accurate product costing, especially when overhead costs are significant and products consume resources differently.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">When should I use Activity-Based Costing?</h4>
              <p className="text-muted-foreground">
                Use ABC when you have significant overhead costs, diverse product lines that consume resources differently, when traditional costing leads to poor pricing decisions, or when you need detailed information about cost drivers for process improvement. ABC is most valuable when product diversity is high and overhead costs are significant.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How do I identify activities for ABC?</h4>
              <p className="text-muted-foreground">
                Identify activities by analyzing your production process and interviewing employees. Look for major tasks like setups, inspections, material handling, or order processing. Each activity should have measurable costs and a cost driver that correlates with resource consumption. Focus on activities that consume significant resources.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What is a cost driver?</h4>
              <p className="text-muted-foreground">
                A cost driver is a factor that causes or influences the cost of an activity. It's the measurement used to allocate activity costs to products. Examples include number of setups, number of inspections, machine hours, or purchase orders. The cost driver should have a strong cause-and-effect relationship with the activity's costs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How many activities should I include?</h4>
              <p className="text-muted-foreground">
                The number of activities depends on your business complexity. Generally, 10-20 activities provide good accuracy without excessive complexity. Too few activities defeat the purpose of ABC, while too many can be overly complex and expensive to maintain. Focus on activities with significant costs and clear cost drivers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the benefits of Activity-Based Costing?</h4>
              <p className="text-muted-foreground">
                Benefits include more accurate product costing leading to better pricing decisions, identification of high-cost activities for improvement opportunities, better understanding of profitability across products and customers, support for strategic decisions about products and markets, and improved resource allocation based on actual consumption.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">What are the disadvantages of ABC?</h4>
              <p className="text-muted-foreground">
                Disadvantages include higher implementation and maintenance costs, complexity in identifying activities and cost drivers, requires significant data collection and analysis, may not be cost-effective for small businesses or simple operations, and can be time-consuming to update as processes change. The additional accuracy must justify the additional cost.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Can ABC be used for pricing decisions?</h4>
              <p className="text-muted-foreground">
                Yes, ABC is excellent for pricing decisions because it provides more accurate product costs. By understanding true product costs, you can identify products that are underpriced, adjust prices to reflect actual resource consumption, make informed decisions about which products to emphasize, and improve overall profitability.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">How often should I update ABC data?</h4>
              <p className="text-muted-foreground">
                ABC data should be reviewed and updated when there are significant changes in processes, cost structures, or product mix. Annual reviews are typical, but major process changes, new products, or cost structure changes may require more frequent updates. The key is maintaining data accuracy while balancing update costs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
